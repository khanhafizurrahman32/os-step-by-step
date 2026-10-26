# L14 · Locks

> **Book:** Ch 28 (pp. 301–323) · **Priority:** 🔴 must-know · **Time:** 55 min · **Simulator:** `threads-locks/x86.py`

!!! example "In plain words"
    A **lock** is the key to a single-person bathroom. Take the key (lock), use the room (critical section), hang the key back (unlock). Anyone else who wants in must wait.

    Two hard parts:

    1. **Taking the key must be one indivisible action.** If two people check "is the key there?" at the same moment, both see yes and both walk in. Hardware provides special atomic instructions (test-and-set, compare-and-swap) for this.
    2. **How do you wait?** Standing at the door checking constantly (*spinning*) wastes energy. Sitting down and asking to be called when it's free (*sleeping*) is better for long waits.

## TL;DR (the 3 things to remember)

- A **lock** gives mutual exclusion: `lock(); critical section; unlock();`. Judge a lock by **correctness**, **fairness** and **performance**.
- You can't build one with plain loads and stores. You need a hardware **atomic instruction**: **test-and-set**, **compare-and-swap**, **load-linked/store-conditional**, or **fetch-and-add** (which gives a fair **ticket lock**).
- Spinning wastes CPU — especially on one core — so real locks **sleep** using queues (`park`/`unpark`, Linux **futex**), often after spinning briefly (**two-phase lock**).

## The big question

> How can we build an efficient lock? What hardware and OS support do we need?

## The story chain

<small>Key: **bold** = the problem or the final design · *italics* = an attempted fix · ❌ = what goes wrong with it · → = "which leads to"</small>

**Need mutual exclusion** → *disable interrupts* → ❌ privileged, breaks on multiprocessors, lost interrupts → *a flag variable: spin while flag==1, then set it* → ❌ two threads both see 0 and both enter (the test and the set aren't atomic) → *hardware test-and-set* → **working spin lock** → ❌ not fair (a thread can spin forever) → *ticket lock with fetch-and-add* → ❌ still burns a whole time slice spinning → *yield instead of spinning* → ❌ many threads = many costly yields, still unfair → *sleep in a queue (park/unpark, futex)* → ❌ wakeup/waiting race → *setpark()* → **two-phase lock: spin a bit, then sleep**.

## Core ideas

### Evaluating a lock

1. **Correctness** — does it provide mutual exclusion?
2. **Fairness** — does every waiting thread eventually get it (no starvation)?
3. **Performance** — how much time does it waste? Check three cases: nobody else wants the lock; several threads want it on a single CPU; several threads want it on many CPUs. (*Contention* = several threads wanting the same lock at once.)

### Attempt: a plain flag (broken)

```c
void lock(lock_t *m) { while (m->flag == 1) ; m->flag = 1; }   // test ... then set
```
The idea: `flag` is 1 when someone holds the lock. To lock, wait while flag is 1, then set it to 1.

Why it's broken: thread 1 sees flag = 0 and leaves the loop, but **before** it sets flag = 1, the timer switches to thread 2. Thread 2 also sees flag = 0 and sets it to 1. Then thread 1 resumes and sets it to 1 as well. **Both threads are now inside.** The "check" and the "set" have to happen as one unbreakable step, and ordinary code can't do that.

### The hardware primitives

So CPUs provide special instructions that read **and** change a memory location in one indivisible step (**atomically**). Nothing can sneak in between. Below is what each one does, written as C for clarity; in reality each is a single instruction:

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

- **Test-and-set:** "set it to the new value, and tell me what it *was*".
- **Compare-and-swap (CAS):** "if it's still what I expect, change it; either way, tell me what it was". (Java's `AtomicInteger.compareAndSet` is this.)
- **Fetch-and-add:** "add one, and tell me the old value".

**Spin lock with test-and-set:**
```c
void lock(lock_t *l)   { while (TestAndSet(&l->flag, 1) == 1) ; }
void unlock(lock_t *l) { l->flag = 0; }
```

How it works: `TestAndSet` sets the flag to 1 and returns the old value in a single step. If the old value was 0, the lock was free and **we** just took it, so we exit the loop. If it was 1, someone else holds it, so we keep trying. This "keep trying in a loop" is called **spinning**.

**Ticket lock with fetch-and-add (fair):**
```c
void lock(lock_t *l)   { int myturn = FetchAndAdd(&l->ticket);
                         while (l->turn != myturn) ; }
void unlock(lock_t *l) { l->turn = l->turn + 1; }
```

Like the ticket machine at a deli counter: each thread takes the next number (`myturn`), then waits until the "now serving" display (`turn`) shows its number. Unlocking moves the display on by one. Threads are served in the order they arrived, so nobody waits forever.

**LL/SC** (load-linked / store-conditional), found on ARM, MIPS and RISC-V chips: a pair of instructions. The first reads a value; the second writes a new value **only if nobody else wrote that location in between**, and reports whether it succeeded. On failure, just try again.

### Spin lock scorecard

| | Spin lock | Ticket lock |
|---|---|---|
| Correct | ✔ | ✔ |
| Fair | ✘ (can starve) | ✔ (FIFO order) |
| One CPU | Terrible: a waiting thread spins for its whole time slice, but the thread holding the lock can't run to release it until the spinner is switched out | Same |
| Many CPUs | Fine if the lock is held only briefly | Fine |

### Stop spinning

Spinning burns CPU time doing nothing useful. Better ideas, in order:

- **Yield:** if the lock is busy, give up the CPU (`yield()`) so another thread, hopefully the holder, can run. Better, but with 100 waiting threads that's 99 pointless switches, and still no fairness.
- **Sleep in a queue** (Solaris): waiting threads put themselves in a queue and **sleep** (`park()`). When the holder unlocks, it wakes exactly one waiter (`unpark(id)`) and hands the lock straight to it. No wasted CPU, and first come, first served.
- **A tricky race:** a thread decides to sleep, but just before it does, the holder unlocks and tries to wake it. The wake-up arrives before the sleep, is lost, and the thread sleeps forever. Fix (`setpark()`): first announce "I'm about to sleep"; if a wake-up arrives in that window, the sleep returns immediately.
- **Linux futex** ("fast user-space mutex"): if the lock is free, taking it is one atomic instruction with no OS involvement. Only when threads must actually wait does the kernel get involved, to put them to sleep and wake them.
- **Two-phase lock:** spin briefly first (the lock is often released within microseconds), and only go to sleep if it isn't. This combines the best of both.

## Common mistakes

- Disabling interrupts only works on a single CPU and only for trusted (kernel) code.
- "Correct" is not enough — exams ask about fairness and single-CPU performance.
- On one CPU, a spinning waiter **cannot** make the holder release faster — spinning is pure waste.
- Ticket lock is fair because of FIFO ticket order, not because of fetch-and-add per se.

## Recall

**Blurt test** — close this page, then on paper, from memory: the story chain; write test-and-set, CAS, fetch-and-add from memory; write the spin lock and ticket lock.

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

**Explain it out loud (60 seconds, as if to a friend):** "Why can't we build a lock with ordinary loads and stores, and what does the hardware give us instead?"

**Simulator drill** (book's free Python homework tools — see [the recall system](../start/recall-system.md#four-more-tricks-that-pay-off)): `python3 x86.py -p flag.s -M flag,count -R ax,bx -c` — then `-i 1` etc. to break it. Repeat with `test-and-set.s` and `ticket.s`.

## Connects to

- Using locks in data structures → [L15](l15-concurrent-ds.md)
- Locks + waiting → [L16 Condition variables](l16-condvars.md)
- Lock ordering and deadlock → [L18](l18-deadlock.md)

## Read in the book

- 🔴 28.1–28.9, 28.11, 28.12–28.14.
- 🟡 28.10 (LL/SC), 28.15–28.16 (futex, two-phase).
- Skip Peterson's/Dekker's algorithm details — know only that they need no hardware support but break on modern relaxed-memory CPUs.
