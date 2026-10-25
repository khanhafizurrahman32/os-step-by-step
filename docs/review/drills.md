# Mixed recall drills

These questions are **interleaved** on purpose: each round jumps between parts, the way exams and interviews do. Answer out loud or on paper **before** opening the answer. Mark the ones you miss and redo them in 3 days.

## Round 1 — warm-up (one-liners)

<details markdown="1"><summary>1. A process calls fork() and then the child calls exec("ls"). How many processes exist and what does each run?</summary>

Two: the parent continues its own code; the child (same PID as after fork) now runs `ls`.

</details>

<details markdown="1"><summary>2. What's the minimum number of disk I/Os to read the first block of /a/b (cold cache)?</summary>

Root inode, root data, a's inode, a's data, b's inode, b's data block = 6 reads (plus possibly an atime write).

</details>

<details markdown="1"><summary>3. Which MLFQ rule fixes starvation?</summary>

Rule 5: boost all jobs to the top queue every S time units.

</details>

<details markdown="1"><summary>4. Semaphore initialised to 0: lock or ordering?</summary>

Ordering — the first wait blocks until someone posts.

</details>

<details markdown="1"><summary>5. What's the average rotational delay of a 10,000 RPM disk?</summary>

One rotation = 6 ms → average 3 ms.

</details>

<details markdown="1"><summary>6. A TLB has 64 entries and pages are 4 KB. What's its coverage?</summary>

256 KB.

</details>

<details markdown="1"><summary>7. What does RAID-5 cost for one small random write?</summary>

4 I/Os: read old data, read old parity, write new data, write new parity.

</details>

<details markdown="1"><summary>8. Why must pthread_cond_wait be inside a while loop?</summary>

Mesa semantics / spurious wakeups — the condition might not hold when the thread runs.

</details>

## Round 2 — "why not just…?"

<details markdown="1"><summary>9. Why not just let user programs disable interrupts to make critical sections atomic?</summary>

A program could disable them and never re-enable (taking over the machine); it doesn't work on multiprocessors; interrupts can be lost.

</details>

<details markdown="1"><summary>10. Why not just use one huge page size (say 1 MB) to shrink page tables?</summary>

Internal fragmentation: small processes waste most of each page. (Huge pages are used selectively, e.g. for databases, to boost TLB coverage.)

</details>

<details markdown="1"><summary>11. Why not just run fsck after every crash?</summary>

It scans the whole disk; on large disks recovery takes hours, and it only restores consistency, not correctness.

</details>

<details markdown="1"><summary>12. Why not just use FIFO page replacement — it's simple?</summary>

It ignores how often or recently a page is used (evicts hot pages) and suffers Belady's anomaly.

</details>

<details markdown="1"><summary>13. Why not just spin while waiting for a lock?</summary>

On one CPU, the holder can't run while you spin, so you waste a whole slice; with many threads, CPU is burnt for nothing. Fine only for very short critical sections on multicores.

</details>

<details markdown="1"><summary>14. Why not just keep NFS servers stateful to make caching easier?</summary>

Crash recovery becomes hard: the server would have to rebuild who has what open/cached. Stateless + idempotent means clients simply retry.

</details>

<details markdown="1"><summary>15. Why not just use SSTF for disk scheduling?</summary>

Starvation of far-away requests, and it ignores rotation time.

</details>

<details markdown="1"><summary>16. Why not just put a lock around the whole hash table?</summary>

It serializes all operations; per-bucket locks let unrelated operations run in parallel and scale far better.

</details>

## Round 3 — connect two parts

<details markdown="1"><summary>17. How are a TLB and a file system's page cache alike?</summary>

Both cache the result of an expensive lookup (page table walk / disk read) and rely on locality; both need a replacement policy and have consistency issues (TLB on context switch, page cache on crash).

</details>

<details markdown="1"><summary>18. Where does the idea "write the pointed-to object before the pointer" appear?</summary>

Ordered journaling (data before metadata commit), soft updates, and safe list insertion in concurrent code (initialise the node before linking it).

</details>

<details markdown="1"><summary>19. What do multi-level page tables and inode indirect blocks have in common?</summary>

Both are imbalanced trees of indirection that allocate only the parts actually used — optimising for sparse/small cases.

</details>

<details markdown="1"><summary>20. SJF appears in two places in the book. Where, and what's the shared weakness?</summary>

CPU scheduling (SJF/STCF) and disk scheduling (SSTF). Both can starve long/far jobs.

</details>

<details markdown="1"><summary>21. LFS and SSD flash translation layers share one key idea. What is it?</summary>

Never overwrite in place: write to fresh locations log-style, keep a mapping, and garbage-collect old versions.

</details>

<details markdown="1"><summary>22. Why does a context switch hurt performance beyond the cost of saving registers?</summary>

Cold caches and a stale TLB (flushed or with other ASIDs' entries), so the next process takes misses.

</details>

<details markdown="1"><summary>23. How does copy-on-write make fork()+exec() cheap?</summary>

fork shares pages read-only instead of copying them; exec then replaces the address space, so most pages are never copied.

</details>

<details markdown="1"><summary>24. What's the deadlock-prevention idea behind the dining philosophers fix, and where else is it used?</summary>

Break circular wait by imposing an order on lock acquisition — the same as lock ordering by address in kernel code.

</details>

## Round 4 — calculate

<details markdown="1"><summary>25. 16-bit address space, 1 KB pages. How many bits of VPN and offset? How many PTEs?</summary>

Offset 10 bits, VPN 6 bits, 64 PTEs.

</details>

<details markdown="1"><summary>26. Jobs A=10, B=20, C=30 arrive at t=0. Average turnaround under SJF?</summary>

Completions 10, 30, 60 → (10+30+60)/3 = 33.3.

</details>

<details markdown="1"><summary>27. 48-bit virtual addresses, 4 KB pages, 8-byte PTEs. How many levels of page table?</summary>

36 VPN bits; 512 PTEs per page = 9 bits per level → 4 levels.

</details>

<details markdown="1"><summary>28. Memory 100 ns, disk 10 ms, 0.1% of accesses page-fault. AMAT?</summary>

100 ns + 0.001 × 10 ms = 100 ns + 10 µs ≈ 10.1 µs.

</details>

<details markdown="1"><summary>29. RAID-5 with 5 disks of 1 TB. Usable capacity, and random write throughput if each disk does R MB/s?</summary>

4 TB; random writes ≈ (5/4)·R.

</details>

<details markdown="1"><summary>30. Inode with 12 direct pointers and one double-indirect block (no single indirect). 4 KB blocks, 4-byte pointers. Max file size?</summary>

(12 + 1024²) × 4 KB = 48 KB + 4 GB ≈ 4 GB.

</details>
