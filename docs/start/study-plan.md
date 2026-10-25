# 3-week plan

About **1–1.5 hours a day**, 6 days a week. Day 7 of each week is a light review day. Reviews (R1, R2…) follow the [recall system](recall-system.md) and take 5–10 minutes each.

Tick the boxes as you go — on GitHub you can fork the repo and edit this page to track progress.

## Week 1 — Virtualization

| Day | New lesson | Reviews |
|---|---|---|
| 1 | ☐ [L01 Intro](../virtualization/l01-intro.md) + [L02 Processes](../virtualization/l02-process.md) | — |
| 2 | ☐ [L03 Limited direct execution](../virtualization/l03-lde.md) | R1: L01–02 |
| 3 | ☐ [L04 Scheduling basics](../virtualization/l04-scheduling.md) | R1: L03 |
| 4 | ☐ [L05 MLFQ](../virtualization/l05-mlfq.md) | R1: L04 · R2: L01–02 |
| 5 | ☐ [L06 Address spaces](../virtualization/l06-address-space.md) + [L07 Segmentation](../virtualization/l07-segmentation.md) | R1: L05 · R2: L03 |
| 6 | ☐ [L08 Free space](../virtualization/l08-free-space.md) + [L09 Paging](../virtualization/l09-paging.md) | R1: L06–07 · R2: L04 |
| 7 | **Light day** — redraw the CPU chain and memory chain from the [chain map](../review/chain-map.md) | R2: L05 |

## Week 2 — Finish memory, then concurrency

| Day | New lesson | Reviews |
|---|---|---|
| 8 | ☐ [L10 TLBs](../virtualization/l10-tlb.md) | R1: L08–09 · R3: L01–03 |
| 9 | ☐ [L11 Smaller tables](../virtualization/l11-smaller-tables.md) | R1: L10 · R2: L06–07 |
| 10 | ☐ [L12 Swapping](../virtualization/l12-swapping.md) | R1: L11 · R2: L08–09 · R3: L04–05 |
| 11 | ☐ [L13 Threads](../concurrency/l13-threads.md) + [L14 Locks](../concurrency/l14-locks.md) | R1: L12 · R2: L10 |
| 12 | ☐ [L15 Concurrent DS](../concurrency/l15-concurrent-ds.md) + [L16 Condition variables](../concurrency/l16-condvars.md) | R1: L13–14 · R2: L11 · R3: L06–07 |
| 13 | ☐ [L17 Semaphores](../concurrency/l17-semaphores.md) + [L18 Deadlock](../concurrency/l18-deadlock.md) | R1: L15–16 · R2: L12 |
| 14 | **Light day** — [mixed drills](../review/drills.md), Virtualization + Concurrency | R2: L13–14 |

## Week 3 — Persistence and distribution

| Day | New lesson | Reviews |
|---|---|---|
| 15 | ☐ [L19 I/O](../persistence/l19-io.md) + [L20 Disks](../persistence/l20-disks.md) | R1: L17–18 · R2: L15–16 · R3: L08–10 |
| 16 | ☐ [L21 RAID](../persistence/l21-raid.md) | R1: L19–20 · R2: L17–18 |
| 17 | ☐ [L22 Files API](../persistence/l22-files-api.md) + [L23 VSFS](../persistence/l23-vsfs.md) | R1: L21 · R3: L11–12 |
| 18 | ☐ [L24 FFS](../persistence/l24-ffs.md) + [L25 Journaling](../persistence/l25-journaling.md) | R1: L22–23 · R2: L19–20 · R3: L13–14 |
| 19 | ☐ [L26 LFS & integrity](../persistence/l26-lfs-integrity.md) + [L27 NFS/AFS](../distribution/l27-dfs.md) | R1: L24–25 · R2: L21 · R3: L15–18 |
| 20 | **Full mixed drill** + [cheat sheet](../review/cheat-sheet.md) from memory | R2: L22–25 |
| 21 | **Final**: blurt all 4 chains, then fix gaps | R3: L19–27 |

Then keep doing R4 (Day +21) reviews with Anki — 10 minutes a day keeps it all.

## Short on time? The 7-day crash version

Only the lessons that carry the most marks:

1. L02 + L03 (processes, LDE)
2. L04 + L05 (scheduling, MLFQ)
3. L09 + L10 + L11 (paging, TLB, multi-level)
4. L12 (swapping, LRU, clock)
5. L13 + L14 + L16 (races, locks, condition variables)
6. L17 + L18 (semaphores, deadlock)
7. L23 + L25 (inodes, journaling)
