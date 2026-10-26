*[OS]: Operating system — software that virtualizes the hardware, manages concurrency and keeps data persistent
*[OSTEP]: Operating Systems: Three Easy Pieces, by Remzi and Andrea Arpaci-Dusseau
*[virtualization]: Making one physical resource (CPU, memory, disk) look like many private, easy-to-use virtual ones
*[concurrency]: Many things in progress at once (threads, interrupts) that must not corrupt shared data
*[persistence]: Keeping data safe across power loss and crashes, on disks and SSDs
*[system call]: A request from a user program to the OS; it traps into kernel mode to do privileged work
*[system calls]: Requests from user programs to the OS; each traps into kernel mode to do privileged work
*[syscall]: System call — a request from a user program to the OS via a trap into kernel mode
*[PCB]: Process control block — the kernel structure holding a process's saved registers, state, PID and more
*[TCB]: Thread control block — per-thread saved registers and state
*[PID]: Process ID — the number that identifies a process
*[zombie]: A process that has exited but whose parent hasn't yet called wait() to collect its status
*[file descriptor]: A small integer a process uses to refer to an open file (0 stdin, 1 stdout, 2 stderr)
*[file descriptors]: Small integers a process uses to refer to open files (0 stdin, 1 stdout, 2 stderr)
*[LDE]: Limited direct execution — run programs directly on the CPU, but restrict them with user mode, traps and a timer
*[limited direct execution]: Run programs directly on the CPU for speed, but restrict them with user mode, traps and a timer interrupt
*[user mode]: Restricted CPU mode for programs: no I/O, no changing page tables
*[kernel mode]: Privileged CPU mode in which the OS runs and can do anything
*[trap]: An instruction that jumps into the kernel and raises privilege, used for system calls
*[trap table]: Table of handler addresses the kernel installs at boot; tells the hardware where to jump on traps and interrupts
*[return-from-trap]: Instruction that restores registers, drops back to user mode and resumes the program
*[timer interrupt]: Hardware interrupt every few ms that hands control back to the OS
*[context switch]: Saving one process's registers and restoring another's so the CPU runs the other process
*[cooperative]: Scheduling approach where the OS only regains control when a program makes a syscall or yields
*[mechanism]: How something is done (e.g. context switch) — as opposed to policy
*[policy]: Which choice is made (e.g. which process runs next) — as opposed to mechanism
*[turnaround time]: Completion time minus arrival time
*[response time]: Time a job first runs minus its arrival time
*[convoy effect]: Short jobs stuck waiting behind a long job under FIFO
*[FIFO]: First in, first out — serve jobs (or evict pages) in arrival order
*[SJF]: Shortest Job First — run the shortest job next; non-preemptive
*[STCF]: Shortest Time-to-Completion First — preemptive SJF; run the job with the least time remaining
*[PSJF]: Preemptive Shortest Job First — same as STCF
*[RR]: Round Robin — run each job for a time slice, then move to the next
*[Round Robin]: Scheduler that runs each job for a fixed time slice, then moves to the next
*[time slice]: How long a job runs before the scheduler may switch (a multiple of the timer interrupt period)
*[MLFQ]: Multi-Level Feedback Queue — priority queues where a job's priority changes based on its observed behaviour
*[priority boost]: MLFQ rule 5 — periodically move every job to the top queue to stop starvation
*[allotment]: In MLFQ, how much CPU time a job may use at one priority level before it is demoted
*[starvation]: A job or thread never gets the resource it waits for because others keep getting it
*[lottery scheduling]: Proportional-share scheduling: draw a random ticket each slice; the holder runs
*[stride scheduling]: Deterministic proportional share: run the job with the lowest pass value, then add its stride
*[CFS]: Completely Fair Scheduler (Linux) — runs the process with the lowest virtual runtime
*[vruntime]: Virtual runtime in Linux CFS — CPU time used, weighted by priority (nice value)
*[cache affinity]: A process runs faster on the CPU it last ran on, because that CPU's cache is still warm
*[cache coherence]: Hardware that keeps multiple CPU caches consistent with each other
*[SQMS]: Single-queue multiprocessor scheduling — one shared run queue for all CPUs
*[MQMS]: Multi-queue multiprocessor scheduling — one run queue per CPU
*[work stealing]: An idle CPU takes jobs from another CPU's queue to balance load
*[address space]: A process's private view of memory: code, heap and stack at virtual addresses
*[virtual address]: An address as seen by a program; translated by hardware and OS to a physical address
*[physical address]: An actual location in RAM
*[MMU]: Memory management unit — CPU hardware that translates virtual to physical addresses
*[base and bounds]: Translation with two registers: physical = virtual + base; fault if virtual ≥ bounds
*[dynamic relocation]: Base-and-bounds translation done by hardware at run time
*[segmentation]: Separate base and bounds for each segment (code, heap, stack)
*[segment]: A contiguous region of the address space, such as code, heap or stack
*[internal fragmentation]: Wasted space inside an allocated unit (e.g. unused part of a page or block)
*[external fragmentation]: Free memory split into many small holes between allocations, too small to use
*[compaction]: Moving allocations together to merge free holes; expensive
*[free list]: A list of the free chunks of memory or disk
*[coalescing]: Merging adjacent free chunks into one bigger chunk
*[splitting]: Cutting a free chunk in two to satisfy a smaller request
*[best fit]: Allocate from the smallest free chunk that is big enough
*[worst fit]: Allocate from the largest free chunk
*[first fit]: Allocate from the first free chunk that is big enough
*[next fit]: First fit, but start searching where the last search ended
*[slab allocator]: Keeps ready-made caches of commonly sized kernel objects
*[buddy allocator]: Splits memory in powers of two; a freed block merges with its 'buddy' if that is free
*[paging]: Splitting memory into fixed-size pages (virtual) and frames (physical)
*[page frame]: A fixed-size slot of physical memory that holds one page
*[page table]: Per-process structure mapping virtual page numbers to physical frame numbers
*[page tables]: Per-process structures mapping virtual page numbers to physical frame numbers
*[VPN]: Virtual page number — the high bits of a virtual address
*[PFN]: Physical frame number — which frame of physical memory holds the page
*[PTE]: Page-table entry — PFN plus valid, protection, present, dirty and reference bits
*[PTEs]: Page-table entries — each holds a PFN plus valid, protection, present, dirty and reference bits
*[PTBR]: Page-table base register — physical address of the current page table
*[valid bit]: PTE bit: is this page part of the address space at all?
*[present bit]: PTE bit: is this page in physical memory (1) or swapped out to disk (0)?
*[dirty bit]: Set when a page has been modified since it was loaded
*[reference bit]: Set by hardware when a page is accessed; used for replacement (also 'use bit')
*[use bit]: Set by hardware when a page is accessed; used by the Clock algorithm
*[TLB]: Translation-lookaside buffer — small hardware cache of VPN → PFN translations
*[TLBs]: Translation-lookaside buffers — small hardware caches of VPN → PFN translations
*[TLB miss]: The translation isn't in the TLB, so the page table must be walked
*[ASID]: Address-space identifier — tags TLB entries with their process so the TLB needn't be flushed on a switch
*[TLB coverage]: TLB entries × page size — memory reachable without a TLB miss
*[spatial locality]: Accessing an address makes nearby addresses likely to be accessed soon
*[temporal locality]: Accessing an address makes the same address likely to be accessed again soon
*[locality]: Programs tend to reuse recent data (temporal) and nearby data (spatial)
*[page directory]: Top level of a multi-level page table; points to the pages of PTEs that are in use
*[PDE]: Page-directory entry — valid bit plus the PFN of a page full of PTEs
*[multi-level page table]: Page table split into page-sized pieces, tracked by a page directory; unused pieces aren't allocated
*[inverted page table]: One system-wide table with an entry per physical frame
*[swap space]: Disk space reserved for pages moved out of memory
*[page fault]: Access to a page that isn't present in memory; the OS loads it from disk
*[swap daemon]: Background OS thread that frees memory when it drops below a low watermark
*[AMAT]: Average memory access time = T_M + P_miss × T_D
*[OPT]: Optimal replacement — evict the page used furthest in the future (needs to know the future)
*[LRU]: Least Recently Used — evict the page unused for the longest time
*[LFU]: Least Frequently Used — evict the page used least often
*[Clock]: LRU approximation: a hand sweeps pages, clearing use bits, and evicts the first with use bit 0
*[Belady's anomaly]: With FIFO, adding cache space can increase misses
*[thrashing]: Memory is so oversubscribed that the system spends its time paging
*[working set]: The pages a process is actively using
*[demand paging]: Load a page only when it's first accessed
*[demand zeroing]: Zero a new page only when it's first touched
*[copy-on-write]: Share pages read-only (e.g. after fork) and copy one only when it's written
*[OOM killer]: Linux out-of-memory killer — kills a process when memory runs out
*[thread]: An execution stream sharing its process's address space, with its own registers and stack
*[threads]: Execution streams sharing one address space, each with its own registers and stack
*[race condition]: The result depends on the timing of execution
*[critical section]: Code that accesses a shared resource and must not run concurrently
*[mutual exclusion]: Only one thread may be in the critical section at a time
*[atomic]: All or nothing — can't be interrupted partway
*[atomicity]: The property of executing all at once, as one indivisible step
*[indeterminate]: Output that differs from run to run because of races
*[mutex]: A lock providing mutual exclusion
*[spin lock]: A lock where waiting threads loop (spin) until it's free
*[test-and-set]: Atomic instruction: return the old value at an address and store a new one
*[compare-and-swap]: Atomic instruction: if *ptr equals expected, store new; return the old value
*[CAS]: Compare-and-swap — atomic: if *ptr equals expected, store new; return the old value
*[fetch-and-add]: Atomic instruction: increment a value and return the old value
*[LL/SC]: Load-linked / store-conditional — the store succeeds only if nobody wrote the address since the load
*[ticket lock]: Fair lock using fetch-and-add: take a ticket, wait until it's your turn
*[futex]: Linux fast user-space mutex — enters the kernel only when there's contention
*[two-phase lock]: Spin briefly in case the lock frees soon, then sleep
*[park]: Solaris call that puts the calling thread to sleep
*[unpark]: Solaris call that wakes a specific thread
*[sloppy counter]: Approximate counter with per-CPU local counts flushed to a global count every S updates
*[hand-over-hand locking]: Lock coupling: hold one node's lock while acquiring the next node's
*[condition variable]: A queue threads wait on until some state changes; used with a lock and a state variable
*[condition variables]: Queues threads wait on until some state changes; used with a lock and a state variable
*[CV]: Condition variable — a queue threads wait on until some state changes
*[CVs]: Condition variables — queues threads wait on until some state changes
*[Mesa semantics]: A signal is only a hint; the woken thread must re-check its condition (use while)
*[Hoare semantics]: The signalled thread runs immediately with the condition guaranteed
*[covering condition]: Waking all waiters (broadcast) when you can't tell which one should run
*[spurious wakeup]: A thread wakes from wait() without a matching signal
*[semaphore]: Integer with atomic wait (decrement, sleep if negative) and post (increment, wake one)
*[semaphores]: Integers with atomic wait (decrement, sleep if negative) and post (increment, wake one)
*[binary semaphore]: A semaphore initialised to 1, used as a lock
*[producer/consumer]: Bounded-buffer problem: producers add items, consumers remove them, sharing a fixed-size buffer
*[bounded buffer]: Fixed-size shared buffer between producers and consumers
*[reader-writer lock]: Lock allowing many readers or one writer at a time
*[dining philosophers]: Classic problem: five philosophers, five forks; shows how circular waiting deadlocks
*[atomicity violation]: A sequence that should be atomic isn't protected
*[order violation]: An assumed ordering between threads isn't enforced
*[deadlock]: Threads each hold a resource and wait for another's, so none can proceed
*[hold-and-wait]: Holding one resource while waiting for another — a deadlock condition
*[circular wait]: A cycle of threads, each waiting for a resource the next one holds — a deadlock condition
*[livelock]: Threads keep acting (e.g. retrying) but none makes progress
*[lock ordering]: Always acquire locks in the same global order to prevent circular wait
*[Banker's algorithm]: Dijkstra's deadlock-avoidance algorithm: only grant requests that keep the system in a safe state
*[event loop]: A single thread that waits for events and runs a handler for each
*[continuation]: State saved so an event's handling can resume later, e.g. after async I/O
*[async I/O]: I/O that returns immediately; completion is checked later or signalled
*[polling]: Repeatedly checking a device's status register until it's ready
*[interrupt]: A hardware signal that makes the CPU run an OS handler
*[interrupts]: Hardware signals that make the CPU run an OS handler
*[DMA]: Direct memory access — a device engine copies data to or from memory without the CPU
*[PIO]: Programmed I/O — the CPU itself moves data to the device
*[memory-mapped I/O]: Device registers appear at memory addresses; ordinary loads and stores reach them
*[device driver]: OS code that knows how to operate a specific device
*[device drivers]: OS code that knows how to operate specific devices
*[sector]: The disk's unit of storage, 512 bytes; a single sector write is atomic
*[track]: One concentric ring of sectors on a disk surface
*[seek]: Moving the disk arm to the right track
*[rotational delay]: Waiting for the wanted sector to rotate under the head
*[track skew]: Offsetting sector 0 on each track so sequential reads across tracks don't miss a rotation
*[track buffer]: Disk's own memory cache (a few MB)
*[write-back]: Acknowledge a write once it's in a cache, before it reaches the disk
*[write-through]: Acknowledge a write only once it's on the disk
*[torn write]: A multi-sector write only partly completed when power was lost
*[SSTF]: Shortest Seek Time First — serve the request on the nearest track
*[SCAN]: Elevator disk scheduling — sweep across the disk in one direction, then back
*[C-SCAN]: Circular SCAN — sweep in one direction only, then jump back to the start
*[SPTF]: Shortest Positioning Time First — pick the request with least seek + rotation; done inside the drive
*[SATF]: Shortest Access Time First — another name for SPTF
*[SSD]: Solid-state drive — flash storage with no moving parts
*[SSDs]: Solid-state drives — flash storage with no moving parts
*[FTL]: Flash translation layer — maps logical blocks to flash pages, writing log-style
*[wear levelling]: Spreading erases evenly so no flash block wears out early
*[write amplification]: Extra flash writes caused by garbage collection, beyond what the user wrote
*[RAID]: Redundant Array of Inexpensive Disks — many disks presented as one
*[striping]: Spreading consecutive blocks across disks (RAID-0)
*[mirroring]: Keeping identical copies on two disks (RAID-1)
*[parity]: XOR of a stripe's data blocks; lets one lost block be rebuilt
*[chunk size]: How many blocks go on one disk before moving to the next disk in a stripe
*[small-write problem]: Parity RAID needs 4 I/Os per small write (read data and parity, write both)
*[fail-stop]: Failure model: a disk is either fully working or completely dead
*[inode]: Index node — a file's metadata and pointers to its data blocks
*[inodes]: Index nodes — each holds a file's metadata and pointers to its data blocks
*[inode number]: The file's low-level name; locates its inode
*[superblock]: Block describing the whole file system: sizes, where structures start, magic number
*[bitmap]: One bit per inode or block: free or in use
*[inode bitmap]: One bit per inode: free or in use
*[data bitmap]: One bit per data block: free or in use
*[inode table]: The on-disk array of inodes
*[direct pointer]: Inode pointer straight to a data block
*[direct pointers]: Inode pointers straight to data blocks
*[indirect block]: A block full of pointers to data blocks, referenced from the inode
*[extent]: A disk pointer plus a length, describing a contiguous run of blocks
*[extents]: Disk pointers plus lengths, each describing a contiguous run of blocks
*[open file table]: System-wide table of open files, each entry with its own offset and reference count
*[hard link]: Another directory entry pointing to the same inode
*[hard links]: Extra directory entries pointing to the same inode
*[symbolic link]: A small file containing a path to another file; can dangle
*[page cache]: Memory cache of file blocks and pages, shared by the file system and VM
*[write buffering]: Delaying writes in memory (5–30 s) to batch and schedule them
*[TOCTTOU]: Time of check to time of use — a race between checking a file and using it
*[FFS]: Fast File System — disk-aware UNIX file system using cylinder groups
*[cylinder group]: An FFS region with its own superblock copy, bitmaps, inodes and data
*[cylinder groups]: FFS regions, each with its own superblock copy, bitmaps, inodes and data
*[block group]: ext2/3/4's name for a cylinder group
*[sub-blocks]: 512-byte allocations FFS uses for small files
*[VSFS]: Very Simple File System — OSTEP's teaching file system
*[crash consistency]: Keeping on-disk structures consistent despite crashes mid-update
*[fsck]: File system checker — scans the whole disk after a crash and repairs metadata
*[journaling]: Write-ahead logging: record intended updates in a log before writing them in place
*[write-ahead logging]: Record what you're about to do in a log before doing it
*[journal]: The on-disk log used by journaling
*[TxB]: Transaction begin block in the journal
*[TxE]: Transaction end (commit) block in the journal; a single sector, so written atomically
*[checkpoint]: Writing journaled updates to their final on-disk locations
*[checkpointing]: Writing journaled updates to their final on-disk locations
*[metadata journaling]: Journal only metadata; write data in place first (ordered mode)
*[ordered journaling]: Metadata journaling where data is written before the journal commit
*[data journaling]: Journal both data and metadata — strongest, but data is written twice
*[revoke record]: Journal entry that stops replay of a deleted block
*[soft updates]: Ordering all writes carefully so the disk is never inconsistent
*[LFS]: Log-structured file system — buffer all writes and write them sequentially as segments
*[imap]: Inode map — gives the current disk address of each inode in LFS
*[inode map]: Gives the current disk address of each inode in LFS
*[checkpoint region]: LFS's fixed location that points to the latest pieces of the inode map
*[segment summary block]: Records the inode number and offset of each block in an LFS segment
*[cleaner]: LFS garbage collector: compacts live blocks from old segments
*[garbage collection]: Reclaiming space held by dead (overwritten) blocks
*[LSE]: Latent sector error — the disk detects a bad sector and returns an error
*[latent sector error]: The disk detects a bad sector and returns an error
*[silent corruption]: The disk returns wrong data without reporting an error
*[checksum]: Small value computed from data to detect corruption
*[checksums]: Small values computed from data to detect corruption
*[misdirected write]: Data written correctly but to the wrong location
*[lost write]: The disk reports a write done but never wrote it
*[scrubbing]: Periodically reading all blocks to check checksums
*[RPC]: Remote procedure call — makes a call to another machine look like a local function call
*[stub]: Generated RPC code that marshals arguments and sends the message
*[marshalling]: Packing arguments into a message for sending
*[end-to-end argument]: Reliability must ultimately be checked at the top layer, by the application
*[NFS]: Network File System (Sun) — stateless distributed file system
*[NFSv2]: Version 2 of Sun's Network File System — stateless protocol
*[stateless]: The server keeps no per-client state; every request carries all it needs
*[idempotent]: Doing an operation twice has the same effect as doing it once
*[file handle]: NFS file identifier: volume ID + inode number + generation number
*[GETATTR]: NFS request for a file's attributes, used to check whether a cached copy is stale
*[attribute cache]: NFS client cache of file attributes, valid for a few seconds
*[AFS]: Andrew File System — whole-file caching with server callbacks
*[callback]: A server's promise to tell a client when a file it caches changes
*[callbacks]: Server promises to tell clients when files they cache change
*[FID]: AFS file identifier, used instead of a path name
*[argc]: Argument count — how many words were typed to start the program (including the program name)
*[argv]: Argument vector — array of the command-line words as strings; argv[0] is the program name
*[command-line arguments]: The words typed after a program's name when starting it, e.g. the file names in 'cp a.txt b.txt'
*[stack]: Memory for local variables, function arguments and return addresses; grows on each call, shrinks on return
*[heap]: Memory a program requests while running (malloc in C, new in Java) and frees when done
*[static data]: Global variables, set up when the program loads
*[register]: A tiny, very fast storage slot inside the CPU (or a device) holding one value
*[registers]: Tiny, very fast storage slots inside the CPU (or a device), each holding one value
*[program counter]: Register holding the address of the next instruction to run (also called instruction pointer)
*[PC]: Program counter — register holding the address of the next instruction to run
*[stack pointer]: Register pointing at the current top of the stack
*[frame pointer]: Register pointing at the start of the current function's area on the stack
*[stdin]: Standard input, file descriptor 0 — usually the keyboard
*[stdout]: Standard output, file descriptor 1 — usually the terminal screen
*[stderr]: Standard error, file descriptor 2 — where error messages go
*[fd]: File descriptor — a small integer a process uses to refer to an open file
*[executable]: A program file on disk containing machine code, ready to be loaded and run
*[lazily]: Done only when first needed, not up front
*[malloc]: C library call that allocates heap memory; free() gives it back
*[instruction]: One basic CPU operation, such as load, add or store
*[instructions]: Basic CPU operations, such as load, add or store
*[kernel]: The core of the OS that runs in privileged (kernel) mode
*[kernel stack]: A per-process stack inside the kernel, used while the kernel runs on that process's behalf
*[privileged instruction]: A CPU instruction allowed only in kernel mode
*[privileged]: Allowed only in kernel mode
*[interrupt handler]: OS code that runs when a particular interrupt arrives
*[signal]: A notification sent to a process (e.g. SIGINT on Ctrl-C) that it can catch or that kills it by default
*[signals]: Notifications sent to a process (e.g. SIGINT on Ctrl-C) that it can catch or that kill it by default
*[SIGINT]: Interrupt signal, sent by Ctrl-C; stops the program by default
*[superuser]: The all-powerful administrator account (root) that can do anything
*[shell]: The command-line program that reads your commands and runs them as processes
*[redirection]: Sending a program's output to a file (>) or taking its input from one (<)
*[pipe]: A one-way channel connecting one process's output to another's input (the | in a shell)
*[cache]: Small, fast memory holding copies of recently used data so it needn't be fetched again from somewhere slower
*[CPU cache]: Small, fast memory on the CPU holding recently used data from RAM
*[pointer]: A variable that holds a memory address
*[pointers]: Variables that hold memory addresses
*[POSIX]: The standard UNIX-style API (fork, open, pthreads…) shared by Linux, macOS and others
*[pthread]: POSIX threads — the standard C thread library
*[x86]: The CPU family in most PCs and servers (Intel, AMD)
*[MIPS]: A simple RISC CPU family often used in teaching
*[RISC]: Reduced instruction set computer — CPUs with a small set of simple instructions (MIPS, ARM, RISC-V)
*[CISC]: Complex instruction set computer — CPUs with many complex instructions (x86)
*[XOR]: Exclusive OR — 1 if the two bits differ, 0 if they match
*[hash table]: A structure that finds items by computing an index from their key
*[red-black tree]: A self-balancing binary search tree; lookups, inserts and deletes take O(log n)
*[linked list]: A chain of nodes, each pointing to the next
*[B-tree]: A balanced, wide tree used for fast lookups on disk (databases, file systems)
*[load]: CPU instruction that reads a value from memory into a register
*[store]: CPU instruction that writes a register's value to memory
*[RAM]: Main memory — fast, but lost when power goes off
*[bus]: The shared wires that connect the CPU, memory and devices
*[firmware]: Software built into a device (e.g. a disk's own controller program)
*[block]: The file system's unit of storage, typically 4 KB
*[blocks]: The file system's units of storage, typically 4 KB each
*[metadata]: Data about data — file size, owner, timestamps, where its blocks are
*[UDP]: A network protocol that sends messages with no delivery guarantee
*[TCP]: A network protocol that delivers a reliable, ordered byte stream
