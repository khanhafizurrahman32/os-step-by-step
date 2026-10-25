# L14 · Locks

> **Book:** Ch 28 (pp. 301–323) · **Tier:** 🔴 Must · **Time:** 55 min · **Simulator:** `threads-locks/x86.py`

## TL;DR

- A **lock** gives mutual exclusion: `lock(); critical section; unlock();`. Judge a lock by **correctness**, **fairness** and **performance**.
- You can't build one with plain loads and stores. You need a hardware **atomic instruction**: **test-and-set**, **compare-and-swap**, **load-linked/store-conditional**, or **fetch-and-add** (which gives a fair **ticket lock**).
- Spinning wastes CPU — especially on one core — so real locks **sleep** using queues (`park`/`unpark`, Linux **futex**), often after spinning briefly (**two-phase lock**).

## The crux

> How can we build an efficient lock? What hardware and OS support do we need?

## The story chain

**Need mutual exclusion** → *disable interrupts* → ❌ privileged, breaks on multiprocessors, lost interrupts → *a flag variable: spin while flag==1, then set it* → ❌ two threads both see 0 and both enter (the test and the set aren't atomic) → *hardware test-and-set* → **working spin lock** → ❌ not fair (a thread can spin forever) → *ticket lock with fetch-and-add* → ❌ still burns a whole time slice spinning → *yield instead of spinning* → ❌ many threads = many costly yields, still unfair → *sleep in a queue (park/unpark, futex)* → ❌ wakeup/waiting race → *setpark()* → **two-phase lock: spin a bit, then sleep**.

## Core ideas

### Evaluating a lock

1. **Correctness** — does it provide mutual exclusion?
2. **Fairness** — does every waiting thread eventually get it (no starvation)?
3. **Performance** — overhead with no contention, with contention on one CPU, with contention on many CPUs.

### Attempt: a plain flag (broken)

```c
void lock(lock_t *m) { while (m->flag == 1) ; m->flag = 1; }   // test ... then set
```
Interrupt between the test and the set → both threads set flag = 1 → both are inside.

### The hardware primitives

```c
int TestAndSet(int *ptr, int new) {      // atomic
    int old = *ptr; *ptr = new; return old;
}
int CompareAndSwap(int *ptr, int expected, int new) {   // atomic
    int actual = *ptr;
    if (actual == expected) *ptr = new;
    return actual;
}
int FetchAndAdd(int *ptr) {              // atomic
    int old = *ptr; *ptr = old + 1; return old;
}
```

**Spin lock with test-and-set:**
```c
void lock(lock_t *l)   { while (TestAndSet(&l->flag, 1) == 1) ; }
void unlock(lock_t *l) { l->flag = 0; }
```

**Ticket lock with fetch-and-add (fair):**
```c
void lock(lock_t *l)   { int myturn = FetchAndAdd(&l->ticket);
                         while (l->turn != myturn) ; }
void unlock(lock_t *l) { l->turn = l->turn + 1; }
```

**LL/SC:** load-linked reads a value; store-conditional writes only if nobody wrote it since — retry on failure (MIPS, ARM, RISC-V).

### Spin lock scorecard

| | Spin lock | Ticket lock |
|---|---|---|
| Correct | ✔ | ✔ |
| Fair | ✘ (can starve) | ✔ (FIFO order) |
| One CPU | Terrible: a waiter spins a whole slice while the holder can't run | Same |
| Many CPUs | Fine if critical sections are short | Fine |

### Stop spinning

- **Yield:** `while (TestAndSet(&flag,1)==1) yield();` — better, but with 100 threads you pay 99 context switches; still unfair.
- **Queues (Solaris):** a guard spin lock protects the lock's state and a queue of waiting threads. `park()` puts a thread to sleep, `unpark(tid)` wakes it. Unlock hands the lock **directly** to the next thread (flag stays 1).
- **Wakeup/waiting race:** a thread is about to `park()` when the holder releases and unparks it first → it sleeps forever. Fix: `setpark()` — announce you're about to park; if unpark arrives first, park returns immediately.
- **Linux futex:** one integer holds lock state (high bit) and waiter count; `futex_wait` / `futex_wake` only enter the kernel under contention. Fast path is a single atomic op.
- **Two-phase lock:** spin for a short while (in case the lock is released soon), then sleep.

## Traps

- Disabling interrupts only works on a single CPU and only for trusted (kernel) code.
- "Correct" is not enough — exams ask about fairness and single-CPU performance.
- On one CPU, a spinning waiter **cannot** make the holder release faster — spinning is pure waste.
- Ticket lock is fair because of FIFO ticket order, not because of fetch-and-add per se.

## Recall

**Blurt test:** the story chain; write test-and-set, CAS, fetch-and-add from memory; write the spin lock and ticket lock.

<details markdown="1"><summary>Three criteria for evaluating a lock?</summary>

Correctness (mutual exclusion), fairness (no starvation), performance (overhead uncontended, one CPU, many CPUs).

</details>

<details markdown="1"><summary>Why doesn't disabling interrupts work as a general lock?</summary>

It's privileged (programs could abuse it), doesn't work on multiprocessors, can lose interrupts, and is slow on modern CPUs. OK only inside the kernel briefly.

</details>

<details markdown="1"><summary>Why does a simple flag-based lock fail?</summary>

Testing the flag and setting it are separate steps; an interrupt in between lets two threads both see it free and both enter.

</details>

<details markdown="1"><summary>What does test-and-set do?</summary>

Atomically returns the old value at an address and sets it to a new value.

</details>

<details markdown="1"><summary>How does a ticket lock guarantee fairness?</summary>

Fetch-and-add hands out increasing tickets; the lock serves turns in order, so each thread gets in once its number comes up.

</details>

<details markdown="1"><summary>Why are spin locks bad on a single CPU?</summary>

A waiting thread spins for its whole time slice, but the holder can't run to release the lock during that time.

</details>

<details markdown="1"><summary>What is the wakeup/waiting race and how is it fixed?</summary>

A thread about to park() gets unparked before it sleeps, then sleeps forever. Solaris fixes it with setpark(); futexes check the value atomically in the kernel.

</details>

<details markdown="1"><summary>What is a two-phase lock?</summary>

Spin for a short time hoping the lock frees up soon; if not, sleep until woken.

</details>

**Explain it (60 s):** "Why can't we build a lock with ordinary loads and stores, and what does the hardware give us instead?"

**Simulator drill:** `python3 x86.py -p flag.s -M flag,count -R ax,bx -c` — then `-i 1` etc. to break it. Repeat with `test-and-set.s` and `ticket.s`.

## Connects to

- Using locks in data structures → [L15](l15-concurrent-ds.md)
- Locks + waiting → [L16 Condition variables](l16-condvars.md)
- Lock ordering and deadlock → [L18](l18-deadlock.md)

## Read in the book

- 🔴 28.1–28.9, 28.11, 28.12–28.14.
- 🟡 28.10 (LL/SC), 28.15–28.16 (futex, two-phase).
- Skip Peterson's/Dekker's algorithm details — know only that they need no hardware support but break on modern relaxed-memory CPUs.
