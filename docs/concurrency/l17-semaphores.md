# L17 · Semaphores

> **Book:** Ch 31 (pp. 355–371) · **Tier:** 🔴 Must · **Time:** 50 min · **Code:** `threads-sema/`

## TL;DR

- A **semaphore** is an integer with two atomic operations: **`sem_wait`** (decrement; sleep if the result is negative) and **`sem_post`** (increment; wake one waiter). When negative, its value = **−(number of waiters)**.
- **The initial value decides the role:** init **1** → a lock (binary semaphore). Init **0** → ordering / a condition ("wait until X happened"). Init **N** → N available resources.
- Classic problems: **producer/consumer** (`empty`=MAX, `full`=0, `mutex`=1 — and take the mutex *inside*), **reader-writer locks**, **dining philosophers** (break the cycle: one philosopher picks forks in the opposite order).

## The crux

> How can we use one primitive — the semaphore — for both locks and condition variables?

## The story chain

**Want one primitive for locks *and* waiting** → *Dijkstra's semaphore* → *init 1 = lock*, *init 0 = parent waits for child* → *bounded buffer with `empty` and `full`* → ❌ with several producers, two can `put()` into the same slot at once → *add a mutex* → ❌ mutex taken *outside* the wait → consumer holds the mutex while sleeping on `full`; producer can't get the mutex → **deadlock** → *move the mutex inside, around only put/get* → works. *Many readers, one writer* → **reader-writer lock** → ❌ writers can starve. *Philosophers all grab the left fork first* → ❌ deadlock → *one grabs right first* (break the cycle).

## Core ideas

### Definition

```c
int sem_wait(sem_t *s) {   // atomically
    s->value--;
    if (s->value < 0) sleep on s's queue;
}
int sem_post(sem_t *s) {   // atomically
    s->value++;
    if (there are waiters) wake one;
}
```

Initialise: `sem_init(&s, 0, X);` (middle 0 = shared between threads of one process).

### What does the initial value mean?

> **Rule of thumb:** initial value = how many resources you're willing to give away immediately.

| Use | Init | Pattern |
|---|---|---|
| Lock | 1 | `wait(&m); critical; post(&m);` |
| Ordering (parent waits for child) | 0 | parent `wait(&s)`; child `post(&s)` |
| Counting resources | N | each user waits, then posts when done |

**Lock trace:** T0 waits (1→0, enters). T1 waits (0→−1, sleeps). T0 posts (−1→0, wakes T1). T1 enters, then posts (0→1).

### Producer/consumer — correct version

```c
sem_t empty;   // = MAX   (free slots)
sem_t full;    // = 0     (filled slots)
sem_t mutex;   // = 1

producer: sem_wait(&empty); sem_wait(&mutex); put(i);   sem_post(&mutex); sem_post(&full);
consumer: sem_wait(&full);  sem_wait(&mutex); tmp=get(); sem_post(&mutex); sem_post(&empty);
```

```mermaid
flowchart LR
    P[Producer] -- "wait(empty) → wait(mutex) → put → post(mutex) → post(full)" --> B[(buffer, MAX slots)]
    B -- "wait(full) → wait(mutex) → get → post(mutex) → post(empty)" --> C[Consumer]
```

**The ordering trap:** if you write `wait(&mutex); wait(&full);` the consumer sleeps holding the mutex → deadlock.

### Reader-writer lock

- First reader in grabs the `writelock`; last reader out releases it. Readers in between just bump a counter (protected by its own lock).
- Writers take `writelock` directly.
- Problem: a steady stream of readers **starves writers**. Simple RW locks also add overhead — often a plain lock is faster.

### Dining philosophers

Five philosophers, five forks between them; each needs both neighbours' forks.

- Everyone grabs left then right → each holds one fork, waits forever → **deadlock** (circular wait).
- **Fix (Dijkstra):** the last philosopher grabs **right then left**. The cycle is broken.

### Thread throttling & implementation

- Init a semaphore to N to limit how many threads enter a memory-hungry region at once.
- Semaphores can be built from one lock + one CV + a counter (**Zemaphore**). Building CVs from semaphores is much harder.

## Traps

- Semaphores **remember** posts (the value goes up); CVs don't. A post with no waiter isn't lost.
- Mutex **inside** the empty/full waits, never outside.
- Init 0 vs init 1 is the whole difference between "ordering" and "lock".
- Binary semaphores ≠ CVs in general; a CV's wait also releases a lock.

## Recall

**Blurt test:** the definition; the init-value table; producer/consumer with all three semaphores in the right order; dining-philosopher fix.

<details markdown="1"><summary>What do sem_wait and sem_post do?</summary>

sem_wait decrements and sleeps if the value is negative; sem_post increments and wakes one waiter if any. Both are atomic.

</details>

<details markdown="1"><summary>What does a negative semaphore value mean?</summary>

Its magnitude is the number of threads waiting.

</details>

<details markdown="1"><summary>What initial value makes a semaphore a lock? For ordering?</summary>

1 for a lock (binary semaphore); 0 for ordering (wait until another thread posts).

</details>

<details markdown="1"><summary>Why must the mutex be acquired inside wait(empty)/wait(full) in producer/consumer?</summary>

Otherwise a thread can sleep on full/empty while holding the mutex, so the other side can never get the mutex to post — deadlock.

</details>

<details markdown="1"><summary>How does a reader-writer lock work and what's its weakness?</summary>

The first reader takes the write lock, the last reader releases it; writers need the write lock. Readers can starve writers.

</details>

<details markdown="1"><summary>How do you avoid deadlock in dining philosophers?</summary>

Make one philosopher acquire forks in the opposite order, breaking the circular wait.

</details>

<details markdown="1"><summary>Key difference between a semaphore and a condition variable?</summary>

A semaphore has state (its count), so a post before a wait isn't lost; a CV signal with no waiter is lost.

</details>

**Explain it (60 s):** "Build producer/consumer with semaphores and tell me the one ordering mistake that deadlocks it."

**Code drill:** in `threads-sema/`, implement `fork-join.c`, `rendezvous.c` and `barrier.c` (each needs only 1–2 semaphores).

## Connects to

- Locks → [L14](l14-locks.md) · CVs → [L16](l16-condvars.md)
- Deadlock in general → [L18](l18-deadlock.md)

## Read in the book

- 🔴 31.1–31.4 (definition, binary, ordering, bounded buffer — follow every attempt).
- 🟡 31.5–31.7 (RW locks, philosophers, implementing semaphores).
