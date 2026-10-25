# One-page cheat sheet

!!! tip "Use it as a test first"
    Before reading, take a blank page and try to write this sheet from memory. Then compare.

## Virtualization — CPU

- **Process** = address space + registers (PC, SP) + open files. States: **Running ⇄ Ready**, Running → **Blocked** → Ready.
- **fork()** → 0 in child, child PID in parent. **exec()** replaces the program, returns only on error. **wait()** blocks until a child exits.
- **LDE:** user mode + trap for syscalls (trap table set at boot) + **timer interrupt** to regain control. Context switch: HW saves user regs → kernel stack; OS saves kernel regs → PCB.
- **Turnaround** = completion − arrival · **Response** = first run − arrival.
- FIFO (convoy) → SJF → **STCF** (optimal turnaround) → **RR** (good response, bad turnaround).
- **MLFQ rules:** (1) higher priority runs (2) equal → RR (3) new jobs at top (4) used up allotment at a level → move down (5) every S, boost all to top.
- Lottery: share ≈ tickets. Stride: run lowest pass, pass += stride. Multi-CPU: cache affinity; SQMS vs MQMS + work stealing.

## Virtualization — Memory

- Address space: code · heap ↓ · … · ↑ stack. Goals: **transparency, efficiency, protection**.
- **Base/bounds:** PA = VA + base, fault if VA ≥ bounds. **Segmentation:** per-segment base/bounds; top bits pick the segment; stack grows negative → external fragmentation.
- Free space: split, coalesce, header; best/worst/first/next fit; slab; buddy (internal frag).
- **Paging:** VA = VPN | offset; PT[VPN] → PFN; PA = PFN | offset. PTE bits: valid, prot, present, dirty, reference.
- 32-bit, 4 KB pages, 4-byte PTE → **2²⁰ PTEs = 4 MB per process**. 4 KB page / 4 B = **1024 PTEs per page → 10 bits per level**.
- **TLB:** cache of VPN→PFN; locality; HW-managed (x86) vs SW-managed (MIPS, retry instruction); flush vs **ASID**. Coverage = entries × page size.
- **Multi-level PT:** page directory → pages of PTEs; unused regions cost nothing; +1 memory access per level on TLB miss. Inverted PT: one entry per physical frame.
- **Swapping:** present bit; page fault → OS reads from swap, retries. **AMAT = T_M + P_miss × T_D.**
- Policies: **OPT** (furthest future) · FIFO (Belady's anomaly) · Random · **LRU** · **Clock** (use bit). Looping over N+1 pages kills LRU/FIFO. Thrashing → admission control / OOM killer. Copy-on-write, demand zeroing.

## Concurrency

- Threads share address space; each has its own registers + **stack**. `x++` = load, add, store → **race**.
- Critical section · race condition · indeterminate · mutual exclusion · atomic.
- **Lock** criteria: correctness, fairness, performance. Primitives: **test-and-set**, **compare-and-swap**, **LL/SC**, **fetch-and-add** (→ ticket lock, fair). Spin bad on 1 CPU → yield → **queues + park/unpark** (setpark), **futex**, two-phase locks.
- Sloppy counter (per-CPU, threshold S); hash table with per-bucket locks; queue with head+tail locks.
- **CV:** `wait(c, m)` releases m and sleeps atomically. **Hold the lock. Use `while`.** Producer/consumer: **two CVs** (empty, fill). Broadcast = covering condition.
- **Semaphore:** wait = dec, sleep if < 0; post = inc, wake one. Init **1 = lock**, **0 = ordering**, N = resources. P/C: empty=MAX, full=0, mutex=1 — mutex **inside**. RW lock (writers starve). Philosophers: one picks forks in reverse.
- Non-deadlock bugs: **atomicity** and **order** violations (97%).
- **Deadlock** = mutual exclusion + hold-and-wait + no preemption + **circular wait**. Fix: **lock ordering**; trylock (livelock); lock-free CAS.
- Event loop: `select/poll`, no locks on 1 CPU, never block → async I/O, continuations.

## Persistence

- Device: status/command/data registers. **Polling** (fast devices) vs **interrupts** (slow); hybrid, coalescing; **DMA**. I/O instructions vs memory-mapped I/O.
- **T_I/O = seek + rotation + transfer.** Avg rotation = ½ rotation (15K RPM → 2 ms). Random 4 KB ≈ 6–13 ms → **~0.3–0.7 MB/s**; sequential ≈ **100+ MB/s**. Only 512-B sector writes atomic.
- Disk scheduling: SSTF (starves) → SCAN / C-SCAN → **SPTF** (in drive).
- **RAID:** 0 stripe · 1 mirror · 4 parity disk (small writes R/2) · **5 rotated parity** (N/4·R). Small parity write = **4 I/Os**: P_new = (C_old ⊕ C_new) ⊕ P_old. Capacity: N·B, N·B/2, (N−1)·B.
- File = bytes + **inode number**; directory = (name, inum). fd → open file table (offset) → inode. **fsync** to persist. **rename** is atomic. Hard link = same inode (refcount); symlink = path, can dangle.
- VSFS: **superblock · inode bitmap · data bitmap · inodes · data**. 12 direct + indirect (1024 ptrs) + double + triple. Open `/foo/bar` = 5 reads. Page cache + write buffering (5–30 s).
- FFS: **cylinder groups**; file near its directory, data near its inode; spread directories; large-file exception.
- Crash: inode + bitmap + data. fsck = slow full scan. **Journaling:** TxB+contents → wait → **TxE** (commit) → checkpoint → free. Replay committed. **Ordered metadata journaling:** data first, then journal metadata. Pointed-to before pointer.
- **LFS:** buffer into segments, write sequentially; **imap** via **checkpoint region**; cleaner + segment summary. Integrity: LSE vs silent corruption, **checksums** stored separately, block address for misdirected writes, write verify for lost writes, **scrubbing**.

## Distribution

- Reliability = ack + timeout + retry + sequence numbers. RPC stubs marshal. End-to-end argument.
- **NFSv2:** stateless, file handle (volume, inode, generation), **idempotent** ops → retry. Flush on close, GETATTR (+3 s attr cache). Server commits before replying.
- **AFS:** whole-file caching on local disk, **callbacks**, FIDs → scales; last closer wins.

## The numbers to know cold

| Number | Value |
|---|---|
| Page size | 4 KB → 12-bit offset |
| PTEs per 4 KB page (4 B each) | 1024 → 10 bits/level |
| Linear PT, 32-bit | 4 MB per process |
| TLB size | 32–128 entries; hit ~1 cycle |
| Context switch / syscall | ~µs (sub-µs modern) |
| Timer interrupt | every few ms (~10 ms) |
| Memory access | ~100 ns |
| Random disk I/O | ~5–15 ms |
| Sequential disk | ~100–200 MB/s |
| Disk sector | 512 B (atomic write unit) |
| Write buffering delay | 5–30 s |
