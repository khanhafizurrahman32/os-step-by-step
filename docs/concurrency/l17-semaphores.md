# L17 · Semaphores

> **Book:** Ch 31 (pp. 355–371) · **Priority:** 🔴 must-know · **Time:** 50 min · **Code:** `threads-sema/`

!!! example "In plain words"
    A **semaphore** is a counter of available permits, like the number of free tables in a restaurant.

    - `sem_wait` = "take a table". If none are free, wait in line.
    - `sem_post` = "free a table", and the next person in line gets it.

    The number you start with decides what it does:

    - **1** permit → only one at a time, so it's a **lock**.
    - **0** permits → everyone waits until someone posts, so it's a **"wait until X has happened"** signal.
    - **N** permits → at most N at once, e.g. N buffer slots.

## TL;DR (the 3 things to remember)

- A **semaphore** is an integer with two atomic operations: **`sem_wait`** (decrement; sleep if the result is negative) and **`sem_post`** (increment; wake one waiter). When negative, its value = **−(number of waiters)**.
- **The initial value decides the role:** init **1** → a lock (binary semaphore). Init **0** → ordering / a condition ("wait until X happened"). Init **N** → N available resources.
- Classic problems: **producer/consumer** (`empty`=MAX, `full`=0, `mutex`=1 — and take the mutex *inside*), **reader-writer locks**, **dining philosophers** (break the cycle: one philosopher picks forks in the opposite order).

## The big question

> How can we use one primitive — the semaphore — for both locks and condition variables?

## The story chain

<small>Key: **bold** = the problem or the final design · *italics* = an attempted fix · ❌ = what goes wrong with it · → = "which leads to"</small>

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

In words:

- **`sem_wait`**: subtract 1. If the result is negative, there were no permits left, so go to sleep.
- **`sem_post`**: add 1. If anyone is sleeping, wake one of them.
- Both happen as one indivisible step.
- A nice side effect: when the value is negative, it tells you **how many threads are waiting** (−2 means two are asleep).

You set the starting value with `sem_init(&s, 0, X);`. X is the starting value; the middle `0` just means "shared by the threads of this one process".

### What does the initial value mean?

> **Rule of thumb:** initial value = how many resources you're willing to give away immediately.

| Use | Init | Pattern |
|---|---|---|
| Lock | 1 | `wait(&m); critical; post(&m);` |
| Ordering (parent waits for child) | 0 | parent `wait(&s)`; child `post(&s)` |
| Counting resources | N | each user waits, then posts when done |

**Watch a semaphore act as a lock** (starting value 1):

1. Thread T0 calls `wait`: 1 → 0. Not negative, so T0 enters the critical section.
2. Thread T1 calls `wait`: 0 → −1. Negative, so T1 sleeps.
3. T0 finishes and calls `post`: −1 → 0, and T1 is woken.
4. T1 enters, finishes, and calls `post`: 0 → 1. Back where we started.

### Producer/consumer — correct version

Same problem as in [L16](l16-condvars.md), solved with three semaphores:

- `empty` counts **free slots** (starts at MAX). A producer must take one before adding.
- `full` counts **filled slots** (starts at 0). A consumer must take one before removing.
- `mutex` is a lock (starts at 1), so two threads never change the buffer at the same moment.

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

**The ordering trap:** suppose the consumer takes `mutex` *first* and then waits on `full`. If the buffer is empty, it goes to sleep **while still holding the mutex**. The producer then tries to take the mutex to add an item, and blocks too. Each waits for the other forever: **deadlock**. Rule: wait on `empty`/`full` *first*, and take the mutex only around the actual put/get.

### Reader-writer lock

Many threads may safely **read** shared data at the same time; only **writing** needs to be exclusive. (Think of a library catalogue: many can browse, but an update needs everyone out of the way.)

- The **first** reader to arrive takes the write lock, which keeps writers out. Later readers just add 1 to a reader count and go in.
- The **last** reader to leave releases the write lock.
- A writer simply takes the write lock, so it waits until no readers remain.
- Problem: if readers keep arriving, the count never drops to zero and a writer can wait forever (**starvation**). Also, this lock has extra overhead, so a plain lock is often faster in practice.

### Dining philosophers

Five philosophers sit at a round table with **one fork between each pair**. To eat, a philosopher needs both the fork on the left and the fork on the right.

- If **everyone** picks up their left fork first, each holds one fork and waits for the right one, held by their neighbour. Nobody can eat, ever: **deadlock**, caused by a circle of waiting.
- **Fix (Dijkstra):** make **one** philosopher pick up right first, then left. That philosopher can't complete the circle, so at least one person always gets both forks.

### Thread throttling & implementation

- **Throttling:** start a semaphore at N to allow at most N threads into some expensive section at once, e.g. at most 4 threads doing a memory-hungry step.
- **Building one:** a semaphore can be built from a lock, a condition variable and a counter (the book's "Zemaphore"). The reverse, building condition variables out of semaphores, is surprisingly hard.

## Common mistakes

- Semaphores **remember** posts (the value goes up); CVs don't. A post with no waiter isn't lost.
- Mutex **inside** the empty/full waits, never outside.
- Init 0 vs init 1 is the whole difference between "ordering" and "lock".
- Binary semaphores ≠ CVs in general; a CV's wait also releases a lock.

## Recall

**Blurt test** — close this page, then on paper, from memory: the definition; the init-value table; producer/consumer with all three semaphores in the right order; dining-philosopher fix.

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

**Explain it out loud (60 seconds, as if to a friend):** "Build producer/consumer with semaphores and tell me the one ordering mistake that deadlocks it."

**Code drill:** in `threads-sema/`, implement `fork-join.c`, `rendezvous.c` and `barrier.c` (each needs only 1–2 semaphores).

## Connects to

- Locks → [L14](l14-locks.md) · CVs → [L16](l16-condvars.md)
- Deadlock in general → [L18](l18-deadlock.md)

## Read in the book

- 🔴 31.1–31.4 (definition, binary, ordering, bounded buffer — follow every attempt).
- 🟡 31.5–31.7 (RW locks, philosophers, implementing semaphores).
