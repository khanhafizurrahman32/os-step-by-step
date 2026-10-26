# L16 · Condition variables

> **Book:** Ch 30 (pp. 339–353) · **Priority:** 🔴 must-know · **Time:** 50 min · **Code:** `threads-cv/`

!!! example "In plain words"
    Sometimes a thread must **wait for something to happen**: a child to finish, or an item to appear in a queue. Checking again and again in a loop wastes CPU.

    A **condition variable** is a waiting room with a bell. A thread goes in and sleeps (`wait`). When another thread changes things, it rings the bell (`signal`), and a sleeper wakes up and **checks again** whether what it wanted is actually true. It must re-check, because someone else may have grabbed it first.

    The classic example is **producer/consumer**: bakers put loaves on a shelf with limited space, and customers take them. Bakers wait when the shelf is full; customers wait when it's empty.

## TL;DR (the 3 things to remember)

- A **condition variable** (CV) is a queue where threads **wait** until some condition becomes true; another thread **signals** when it changes the state.
- `wait(cv, mutex)` **atomically releases the lock and sleeps**, and re-acquires the lock before returning.
- Two rules for correct code: **always hold the lock** when calling wait/signal, and **always re-check the condition in a `while` loop** (Mesa semantics). For producer/consumer, use **two CVs** (empty, fill).

## The big question

> How should a thread wait for a condition to become true, without wasting CPU spinning?

## The story chain

<small>Key: **bold** = the problem or the final design · *italics* = an attempted fix · ❌ = what goes wrong with it · → = "which leads to"</small>

**Parent waits for child thread** → *spin on a shared `done` flag* → ❌ wastes CPU, and may be incorrect → *condition variable: wait / signal* → ❌ without a state variable, if the child signals before the parent waits, the parent sleeps forever → *use a state variable (`done`)* → ❌ without the lock, a race between check and wait → *hold the lock* → **producer/consumer**: *one CV + `if`* → ❌ another consumer sneaks in and empties the buffer before the woken thread runs → *`while` instead of `if`* → ❌ with one CV, a consumer may wake another consumer and everyone sleeps → **two CVs: `empty` and `fill`**.

## Core ideas

### The canonical join (a parent waits for its child thread)

A condition variable has two operations:

- **`wait(cv, lock)`** — "put me to sleep until someone signals". It releases the lock while sleeping (so others can change things) and takes it back before returning.
- **`signal(cv)`** — "wake up one thread sleeping on this cv", if there is one.

```c
int done = 0;
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  c = PTHREAD_COND_INITIALIZER;

void thr_exit() {                 // child
    pthread_mutex_lock(&m);
    done = 1;
    pthread_cond_signal(&c);
    pthread_mutex_unlock(&m);
}
void thr_join() {                 // parent
    pthread_mutex_lock(&m);
    while (done == 0)
        pthread_cond_wait(&c, &m);   // releases m while sleeping
    pthread_mutex_unlock(&m);
}
```

Walk through it:

- **Parent:** take the lock; if the child isn't done yet, sleep on the CV. (`wait` releases the lock while sleeping, so the child can get it.)
- **Child:** take the lock, set `done = 1`, ring the bell (`signal`), release the lock.
- **Parent** wakes up, re-takes the lock, sees `done == 1`, and continues.

Three ingredients, and each one matters:

- **The state variable** (`done`). Without it, if the child finishes *before* the parent starts waiting, the signal goes nowhere and the parent sleeps forever.
- **The lock.** Without it, the child could slip in between the parent checking `done` and going to sleep, and again the parent sleeps forever.
- **The CV** itself, so the parent sleeps instead of burning CPU in a loop.

### Producer/consumer (bounded buffer) — the correct version

The setup: **producer** threads put items into a shared buffer that holds at most `MAX` items; **consumer** threads take them out. (Real examples: a web server's request queue; `ls | grep` in a shell.) Producers must wait when the buffer is full; consumers must wait when it's empty.

```c
cond_t empty, fill;  mutex_t mutex;

void *producer(void *arg) {
    for (int i = 0; i < loops; i++) {
        lock(&mutex);
        while (count == MAX) wait(&empty, &mutex);
        put(i);
        signal(&fill);
        unlock(&mutex);
    }
}
void *consumer(void *arg) {
    for (int i = 0; i < loops; i++) {
        lock(&mutex);
        while (count == 0) wait(&fill, &mutex);
        int tmp = get();
        signal(&empty);
        unlock(&mutex);
    }
}
```

In words: a producer locks, **sleeps on `empty` while the buffer is full**, adds an item, **signals `fill`** ("there's something to take"), and unlocks. A consumer does the mirror image: sleeps on `fill` while the buffer is empty, takes an item, signals `empty` ("there's space now").

```mermaid
flowchart LR
    P[Producers] -- "wait on EMPTY while full<br/>signal FILL after put" --> B[(Bounded buffer)]
    B -- "wait on FILL while empty<br/>signal EMPTY after get" --> C[Consumers]
```

### Why `while`, not `if` — Mesa semantics

When a thread is woken, it doesn't run immediately. It just becomes ready and runs whenever the scheduler gets to it. In between, **another thread may have already taken** the item it was woken for.

*Example:* the buffer has 1 item. A producer signals and consumer C1 wakes up. But before C1 runs, consumer C2 arrives and takes the item. When C1 finally runs, with `if` it would go ahead and try to take from an **empty** buffer. With `while`, it checks again, sees the buffer is empty, and goes back to sleep.

So a signal is only a **hint** that things changed, not a guarantee (this behaviour is called **Mesa semantics**, and it's what real systems do). The `while` loop also protects against rare **spurious wakeups**, where a thread wakes with no signal at all. **Rule: always `while`, never `if`.**

### Why two CVs

Suppose producers and consumers share **one** CV. One producer, two consumers, buffer size 1:

1. Both consumers find the buffer empty and sleep on the CV.
2. The producer adds an item, signals (waking consumer C1), finds the buffer full on its next turn, and sleeps on the CV.
3. C1 takes the item and signals to say "there's space". But the CV has two sleepers, the producer and C2, and the signal happens to wake **C2**.
4. C2 finds the buffer empty and sleeps again. Now **all three are asleep**, and nobody will ever wake them.

The fix: two CVs. Producers wait on `empty` and only wake consumers (via `fill`); consumers wait on `fill` and only wake producers (via `empty`). A signal can never reach the wrong kind of thread.

### Covering conditions

Sometimes the signaller can't know **which** waiter should wake. Example: a memory allocator. One thread is waiting for 100 bytes, another for 10 bytes, and someone frees 50 bytes. Waking the 100-byte thread is useless; the 10-byte one should run. The simple, safe fix is **`broadcast`**: wake *everyone*, and each re-checks its own condition (thanks to the `while` loop). It's correct, but wastes some effort waking threads that just go back to sleep.

## Common mistakes

- Calling wait without holding the lock — race between checking and sleeping.
- `if` instead of `while` — works in tests, fails under load.
- Forgetting the state variable — a signal with no waiter is **lost** (CVs have no memory, unlike semaphores).
- One CV shared by producers and consumers — possible all-asleep.

## Recall

**Blurt test** — close this page, then on paper, from memory: write `thr_join`/`thr_exit` and the producer/consumer from memory; list the three bugs it fixes.

<details markdown="1"><summary>What does pthread_cond_wait(c, m) do?</summary>

Atomically releases mutex m and puts the thread to sleep on c; when woken, re-acquires m before returning.

</details>

<details markdown="1"><summary>Why must you re-check the condition in a while loop?</summary>

Mesa semantics: the signal is only a hint and the state may change before the woken thread runs; spurious wakeups can also happen.

</details>

<details markdown="1"><summary>Why do we need a state variable along with a CV?</summary>

CVs have no memory. If signal happens before wait, it's lost; the state variable records that the condition already holds.

</details>

<details markdown="1"><summary>Why does producer/consumer need two condition variables?</summary>

So a consumer only wakes producers and a producer only wakes consumers; with one CV a consumer can wake another consumer and everyone sleeps.

</details>

<details markdown="1"><summary>What is a covering condition?</summary>

Using broadcast to wake all waiters when you can't tell which one should proceed; each re-checks its condition.

</details>

<details markdown="1"><summary>Mesa vs Hoare semantics?</summary>

Mesa: signal is a hint; the woken thread runs later and must re-check. Hoare: the woken thread runs immediately with the guarantee. Real systems use Mesa.

</details>

**Explain it out loud (60 seconds, as if to a friend):** "Walk me through why the single-CV producer/consumer with `while` can still hang with two consumers."

**Code drill:** in `threads-cv/`, build and run `main-one-cv-while` with `-p 1 -c 2` and the `-C` sleep strings from the README until you reproduce the hang, then compare with `main-two-cvs-while`.

## Connects to

- Locks → [L14](l14-locks.md)
- Semaphores can do the same job → [L17](l17-semaphores.md)
- Event loops avoid this whole problem → [L18](l18-deadlock.md)

## Read in the book

- 🔴 30.1–30.2 — follow every broken version and its trace table (Figures 30.7 and 30.9).
- 🟡 30.3 covering conditions.
