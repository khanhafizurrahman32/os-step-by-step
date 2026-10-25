# L21 · RAID

> **Book:** Ch 38 (pp. 437–455) · **Tier:** 🔴 Must · **Time:** 45 min · **Simulator:** `file-raid/raid.py`

## TL;DR

- **RAID** = many disks that look like one disk to the OS, giving more **capacity**, **performance** and **reliability**, transparently.
- **RAID-0** striping (fast, no redundancy) · **RAID-1** mirroring (half capacity, survives a failure) · **RAID-4** one parity disk (parity disk bottlenecks small writes) · **RAID-5** rotated parity (fixes that).
- Small random writes with parity cost **4 I/Os** (read old data, read old parity, write both) — the **small-write problem**.

## The crux

> How can we make a large, fast, reliable storage system out of many disks?

## The story chain

**One disk is small, slow, and fails** → *stripe blocks across N disks (RAID-0)* → ❌ any disk fails = data lost → *mirror every block (RAID-1)* → ❌ pay 2× capacity → *store parity (XOR) on one extra disk (RAID-4)* → ❌ every small write updates the parity disk → it becomes the bottleneck → *rotate parity across all disks (RAID-5)* → small writes can proceed in parallel.

## Core ideas

### Evaluation axes

- **Capacity** (useful space), **reliability** (how many failures survived — **fail-stop** model), **performance** (sequential and random, reads and writes).
- Use: **S** = sequential bandwidth of one disk, **R** = random bandwidth of one disk, N disks, B blocks each, T = single-disk latency.

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

- **RAID-0 mapping:** disk = A mod N, offset = A / N (chunk size = 1 block).
- **Chunk size** trade-off: small chunks → more parallelism for one file, larger positioning cost; big chunks → less intra-file parallelism, less positioning.
- **RAID-1 (RAID-10):** stripe over mirror pairs. Reads can go to either copy; writes go to both. Consistent-update problem → needs a write-ahead log in the controller.
- **Parity:** XOR of all data blocks in a stripe; odd number of 1s → parity 1. If any one disk dies, XOR the rest to rebuild it.

### Small writes with parity — the subtractive method

```
P_new = (C_old XOR C_new) XOR P_old
```
→ 2 reads (old data, old parity) + 2 writes (new data, new parity) = **4 I/Os**. In RAID-4 every such write hits the single parity disk → all small writes serialize → total **R/2**. In RAID-5 the parity is spread → **N/4 · R**.

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

## Traps

- RAID-1 sequential read is **N/2·S**, not N·S: each disk skips the blocks its mirror is reading, so it only delivers half its bandwidth.
- Full-stripe writes in RAID-4/5 avoid the small-write penalty (compute parity from the new data).
- RAID handles **fail-stop** failures; silent corruption is a different problem ([L26](l26-lfs-integrity.md)).

## Recall

**Blurt test:** the chain; draw RAID-0 and RAID-5 layouts; the subtractive parity formula; the full table.

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

**Explain it (60 s):** "You're building storage for a database with lots of small random writes. RAID-1 or RAID-5, and why?"

**Simulator drill:** `python3 raid.py -L 5 -R 20 -n 5 -W rand -w 100 -c` — then compare `-L 4` and `-L 1`. Use `-t` for timing.

## Connects to

- Disk numbers S and R → [L20](l20-disks.md)
- Consistent updates in RAID-1 → the same problem as [L25 Journaling](l25-journaling.md)
- Silent errors and checksums → [L26](l26-lfs-integrity.md)

## Read in the book

- 🔴 38.1–38.7 and the comparison table (38.8).
- ⚪ 38.9 other RAID issues.
