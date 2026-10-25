# The big chain map

Every lesson as a chain: **problem → fix → ❌ what breaks → better fix**. Practise by covering a diagram and rebuilding its chain out loud, top to bottom. If you can rebuild these five diagrams, you can rebuild the book.

## 1 · CPU virtualization

```mermaid
flowchart TB
    A[Run program directly] -->|❌ can do anything| B[User/kernel mode + traps]
    B -->|❌ infinite loop never yields| C[Timer interrupt + context switch]
    C --> D[Which job next?]
    D --> E[FIFO] -->|❌ convoy| F[SJF] -->|❌ late arrivals| G[STCF] -->|❌ response time| H[Round Robin]
    H -->|❌ job lengths unknown| I[MLFQ]
    I -->|❌ starvation| J[Priority boost]
    I -->|❌ gaming| K[Allotment accounting]
```

## 2 · Memory virtualization

```mermaid
flowchart TB
    A[One program in memory] -->|❌ CPU idles| B[Many in memory]
    B -->|❌ no protection| C[Base + bounds]
    C -->|❌ wasted middle of AS| D[Segmentation]
    D -->|❌ external fragmentation| E[Paging]
    E -->|❌ extra memory access| F[TLB]
    E -->|❌ 4 MB tables| G[Multi-level page tables]
    G --> H[Pages on disk: present bit, page fault]
    H -->|❌ memory full| I[Replacement: OPT → FIFO → LRU → Clock]
    I -->|❌ too many processes| J[Admission control / OOM killer]
```

## 3 · Concurrency

```mermaid
flowchart TB
    A["counter++ in 2 threads"] -->|❌ lost updates| B[Need a lock]
    B --> C[Disable interrupts] -->|❌ multi-CPU, privileged| D[Flag variable]
    D -->|❌ test and set not atomic| E[Test-and-set spin lock]
    E -->|❌ unfair| F[Ticket lock]
    F -->|❌ wastes CPU| G[Sleep in queue / futex]
    G --> H[Need to wait for a condition]
    H -->|❌ spinning| I[Condition variable]
    I -->|❌ lost signal| J[State variable + lock]
    J -->|❌ if not while| K[while loop]
    K -->|❌ wrong thread woken| L[Two CVs]
    L --> M[Semaphores do both]
    M -->|❌ circular wait| N[Lock ordering]
```

## 4 · Persistence

```mermaid
flowchart TB
    A[Device protocol] -->|❌ polling wastes CPU| B[Interrupts] -->|❌ CPU copies data| C[DMA]
    C --> D[Disk: seek+rotate+transfer]
    D -->|❌ random is slow| E[Schedule: SSTF → SCAN → SPTF]
    D -->|❌ one disk small, slow, fails| F[RAID 0 → 1 → 4 → 5]
    D --> G[VSFS: inodes, bitmaps]
    G -->|❌ ignores geometry| H[FFS: cylinder groups]
    G -->|❌ crash mid-update| I[fsck]
    I -->|❌ too slow| J[Journaling]
    J -->|❌ data written twice| K[Ordered metadata journaling]
    G -->|❌ small writes slow| L[LFS: sequential segments]
    L -->|❌ inodes move| M[imap + checkpoint region]
    L -->|❌ garbage| N[Cleaner]
```

## 5 · Distribution

```mermaid
flowchart TB
    A[Packets lost] --> B[Ack + timeout + retry] -->|❌ duplicates| C[Sequence numbers] --> D[RPC]
    D --> E[NFS: stateless, idempotent] -->|❌ slow| F[Client caching]
    F -->|❌ visibility & staleness| G[Flush on close + GETATTR]
    G -->|❌ GETATTR flood| H[Attribute cache]
    D --> I[AFSv1: whole files] -->|❌ server overload| J[AFSv2: callbacks + FIDs]
```
