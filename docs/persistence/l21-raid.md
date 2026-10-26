# L21 · RAID

> **Book:** Ch 38 (pp. 437–455) · **Priority:** 🔴 must-know · **Time:** 45 min · **Simulator:** `file-raid/raid.py`

!!! example "In plain words"
    **RAID** combines several disks so they look like one bigger, faster or safer disk.

    - **RAID-0 (striping):** spread data across all disks, like splitting a book's pages between 4 photocopiers. Fast, but lose one disk and the data is gone.
    - **RAID-1 (mirroring):** keep two copies of everything. Safe, but you pay for twice the disks.
    - **RAID-4/5 (parity):** store a small "checksum disk's worth" of extra data that can rebuild any **one** lost disk. Cheaper than mirroring. RAID-5 spreads that extra data across all disks so no single disk becomes the bottleneck.

## TL;DR (the 3 things to remember)

- **RAID** = many disks that look like one disk to the OS, giving more **capacity**, **performance** and **reliability**, transparently.
- **RAID-0** striping (fast, no redundancy) · **RAID-1** mirroring (half capacity, survives a failure) · **RAID-4** one parity disk (parity disk bottlenecks small writes) · **RAID-5** rotated parity (fixes that).
- Small random writes with parity cost **4 I/Os** (read old data, read old parity, write both) — the **small-write problem**.

## The big question

> How can we make a large, fast, reliable storage system out of many disks?

## The story chain

<small>Key: **bold** = the problem or the final design · *italics* = an attempted fix · ❌ = what goes wrong with it · → = "which leads to"</small>

**One disk is small, slow, and fails** → *stripe blocks across N disks (RAID-0)* → ❌ any disk fails = data lost → *mirror every block (RAID-1)* → ❌ pay 2× capacity → *store parity (XOR) on one extra disk (RAID-4)* → ❌ every small write updates the parity disk → it becomes the bottleneck → *rotate parity across all disks (RAID-5)* → small writes can proceed in parallel.

## Core ideas

### Evaluation axes

Every RAID level is judged on three things:

- **Capacity:** how much of the total space can actually hold your data?
- **Reliability:** how many disks can die without losing data? (The book assumes a disk either works perfectly or is completely dead — the **fail-stop** model.)
- **Performance:** how fast are reads and writes, both sequential (long runs) and random (scattered small pieces)?

Shorthand used in the formulas below: **N** = number of disks, **B** = blocks per disk, **S** = one disk's sequential speed (MB/s), **R** = one disk's random speed (MB/s, much smaller than S), **T** = time for one request on one disk.

### Layouts

**RAID-0** (striping, chunk = 1 block, 4 disks):

| Disk 0 | Disk 1 | Disk 2 | Disk 3 |
|:-:|:-:|:-:|:-:|
| 0 | 1 | 2 | 3 |
| 4 | 5 | 6 | 7 |
| 8 | 9 | 10 | 11 |

**RAID-5** (rotated parity, 5 disks — P*n* is the parity of stripe *n*):

| Disk 0 | Disk 1 | Disk 2 | Disk 3 | Disk 4 |
|:-:|:-:|:-:|:-:|:-:|
| 0 | 1 | 2 | 3 | **P0** |
| 5 | 6 | 7 | **P1** | 4 |
| 10 | 11 | **P2** | 8 | 9 |
| 15 | **P3** | 12 | 13 | 14 |

RAID-4 is the same as RAID-5 except every parity block sits on one dedicated disk.

- **Where is block A in RAID-0?** On disk number (A mod N) — the remainder of A ÷ N — at position (A ÷ N, rounded down). E.g. with 4 disks, block 9 is on disk 1, row 2. That matches the table above.
- **Chunk size** (how many blocks go on one disk before moving to the next): small chunks spread even a single file across all disks (more parallelism), but every request has to wait for several disk arms. Big chunks mean fewer arm movements per request but less parallelism within one file.
- **RAID-1** (in practice usually RAID-10: stripe across pairs of mirrored disks): a read can go to either copy, but a write must go to **both**. If power fails between the two writes, the copies disagree, so RAID controllers keep a small log of in-progress writes (the same idea as journaling in [L25](l25-journaling.md)).
- **Parity, explained:** for each row of blocks (a *stripe*), the parity block is the **XOR** of the data blocks. XOR simply checks whether the number of 1s is odd. For example, for the bits 0, 1, 1, 0 there are two 1s (even), so the parity is **0**. If one disk dies, you can recompute its missing bit: whatever value makes the count come out right again. Do this for every bit and the whole lost block is rebuilt from the survivors.

### Small writes with parity — the subtractive method

Changing one data block means the parity of its stripe must change too. Instead of reading the whole stripe, there's a shortcut:

```
P_new = (C_old XOR C_new) XOR P_old
```

In words: the new parity = old parity, with exactly the bits that changed in the data block flipped. That takes **2 reads** (old data, old parity) and **2 writes** (new data, new parity) = **4 disk operations** for a single small write. This is the **small-write problem**.

- In **RAID-4**, every small write, to any disk, also has to update the **one** parity disk. That disk becomes a traffic jam: the whole array manages only about **R/2** for random writes, no matter how many disks it has.
- In **RAID-5**, parity is spread across all disks, so different small writes can usually proceed at the same time: about **N/4 · R** (N disks, ÷4 because each write costs 4 operations).

### The table (Figure 38.8 — memorise)

| | RAID-0 | RAID-1 | RAID-4 | RAID-5 |
|---|---|---|---|---|
| Capacity | N·B | N·B/2 | (N−1)·B | (N−1)·B |
| Reliability (failures survived) | 0 | 1 for sure (N/2 if lucky) | 1 | 1 |
| Seq read | N·S | N/2·S | (N−1)·S | (N−1)·S |
| Seq write | N·S | N/2·S | (N−1)·S | (N−1)·S |
| Random read | N·R | N·R | (N−1)·R | N·R |
| Random write | N·R | N/2·R | **R/2** | **N/4·R** |
| Write latency | T | T | 2T | 2T |

**Which to use?** Performance only → RAID-0. Random-I/O performance + reliability → RAID-1. Capacity + reliability → RAID-5. RAID-4 is basically obsolete; RAID-5 replaces it.

## Common mistakes

- RAID-1 sequential read is **N/2·S**, not N·S: each disk skips the blocks its mirror is reading, so it only delivers half its bandwidth.
- Full-stripe writes in RAID-4/5 avoid the small-write penalty (compute parity from the new data).
- RAID handles **fail-stop** failures; silent corruption is a different problem ([L26](l26-lfs-integrity.md)).

## Recall

**Blurt test** — close this page, then on paper, from memory: the chain; draw RAID-0 and RAID-5 layouts; the subtractive parity formula; the full table.

<details markdown="1"><summary>What does RAID-0 provide and not provide?</summary>

Striping for full capacity and performance; no redundancy (any failure loses data).

</details>

<details markdown="1"><summary>How does parity let RAID-4/5 recover a failed disk?</summary>

Parity is the XOR of the stripe's data blocks; XOR-ing the surviving blocks and parity reconstructs the missing one.

</details>

<details markdown="1"><summary>How many I/Os does a small write need in RAID-4/5, and why?</summary>

Four: read old data and old parity, write new data and new parity (subtractive parity).

</details>

<details markdown="1"><summary>Why is RAID-4 slow for small random writes?</summary>

Every write must update the single parity disk, which serializes all writes (total R/2).

</details>

<details markdown="1"><summary>How does RAID-5 fix RAID-4's problem?</summary>

It rotates parity across all disks, so small writes to different stripes can proceed in parallel (N/4·R).

</details>

<details markdown="1"><summary>Why is RAID-1's sequential read only N/2·S?</summary>

Each disk serves every other block; it rotates past blocks its mirror is serving, so it delivers only half its bandwidth.

</details>

<details markdown="1"><summary>Capacity of RAID-1, RAID-4, RAID-5 with N disks of B blocks?</summary>

RAID-1: N·B/2. RAID-4 and RAID-5: (N−1)·B.

</details>

**Explain it out loud (60 seconds, as if to a friend):** "You're building storage for a database with lots of small random writes. RAID-1 or RAID-5, and why?"

**Simulator drill** (book's free Python homework tools — see [the recall system](../start/recall-system.md#four-more-tricks-that-pay-off)): `python3 raid.py -L 5 -R 20 -n 5 -W rand -w 100 -c` — then compare `-L 4` and `-L 1`. Use `-t` for timing.

## Connects to

- Disk numbers S and R → [L20](l20-disks.md)
- Consistent updates in RAID-1 → the same problem as [L25 Journaling](l25-journaling.md)
- Silent errors and checksums → [L26](l26-lfs-integrity.md)

## Read in the book

- 🔴 38.1–38.7 and the comparison table (38.8).
- ⚪ 38.9 other RAID issues.
