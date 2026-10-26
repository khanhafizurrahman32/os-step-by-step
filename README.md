# OS Step by Step

**Learn 80% of *Operating Systems: Three Easy Pieces* (OSTEP) with 20% of the effort.**

27 short, chapter-wise lessons + a built-in recall system (story chains, blurt tests, 174 flashcards, spaced review plan, mixed drills). Reads directly on GitHub and builds into a searchable website.

> 📖 These are study notes in our own words, written as a companion to OSTEP by Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau. The book is free at **[ostep.org](https://pages.cs.wisc.edu/~remzi/OSTEP/)** — each lesson tells you exactly which sections to read.

## Why this exists

OSTEP is ~650 pages. Most exam and interview questions come from about a third of it. This repo:

1. **Sorts all 50 chapters** into 🔴 Must / 🟡 Skim / ⚪ Skip → [80/20 map](docs/start/80-20-map.md)
2. **Teaches each topic as a story chain** — problem → naive fix → what breaks → better fix — the way the book does, and the way memory works best
3. **Builds recall in** — every lesson ends with a blurt test, flashcards, a 60-second "explain it" prompt and the right homework simulator
4. **Plans it for you** — a [3-week schedule](docs/start/study-plan.md) with spaced reviews already placed (or a 7-day crash version)

## Start here

| Step | Page | Time |
|---|---|---|
| 0 | [Background you need](docs/start/background.md) — CPU, memory, stack, heap, argc/argv, system calls (skip if familiar) | 10 min |
| 1 | [The 80/20 map](docs/start/80-20-map.md) | 5 min |
| 2 | [The recall system](docs/start/recall-system.md) | 5 min |
| 3 | [3-week plan](docs/start/study-plan.md) | — |
| 4 | Lesson 1 → [L01 Intro & the three pieces](docs/virtualization/l01-intro.md) | 20 min |

## All lessons

**Part I — Virtualization**
[L01 Intro](docs/virtualization/l01-intro.md) ·
[L02 Processes & fork/exec/wait](docs/virtualization/l02-process.md) ·
[L03 Limited direct execution](docs/virtualization/l03-lde.md) ·
[L04 Scheduling basics](docs/virtualization/l04-scheduling.md) ·
[L05 MLFQ, lottery, multi-CPU](docs/virtualization/l05-mlfq.md) ·
[L06 Address spaces](docs/virtualization/l06-address-space.md) ·
[L07 Base/bounds & segmentation](docs/virtualization/l07-segmentation.md) ·
[L08 Free space](docs/virtualization/l08-free-space.md) ·
[L09 Paging](docs/virtualization/l09-paging.md) ·
[L10 TLBs](docs/virtualization/l10-tlb.md) ·
[L11 Smaller page tables](docs/virtualization/l11-smaller-tables.md) ·
[L12 Swapping & replacement](docs/virtualization/l12-swapping.md)

**Part II — Concurrency**
[L13 Threads & races](docs/concurrency/l13-threads.md) ·
[L14 Locks](docs/concurrency/l14-locks.md) ·
[L15 Concurrent data structures](docs/concurrency/l15-concurrent-ds.md) ·
[L16 Condition variables](docs/concurrency/l16-condvars.md) ·
[L17 Semaphores](docs/concurrency/l17-semaphores.md) ·
[L18 Bugs, deadlock & events](docs/concurrency/l18-deadlock.md)

**Part III — Persistence**
[L19 I/O devices](docs/persistence/l19-io.md) ·
[L20 Hard disks & SSDs](docs/persistence/l20-disks.md) ·
[L21 RAID](docs/persistence/l21-raid.md) ·
[L22 Files & directories](docs/persistence/l22-files-api.md) ·
[L23 FS implementation](docs/persistence/l23-vsfs.md) ·
[L24 FFS](docs/persistence/l24-ffs.md) ·
[L25 Crash consistency & journaling](docs/persistence/l25-journaling.md) ·
[L26 LFS & data integrity](docs/persistence/l26-lfs-integrity.md)

**Part IV — Distribution**
[L27 Distributed systems, NFS, AFS](docs/distribution/l27-dfs.md)

**Review**
[Cheat sheet](docs/review/cheat-sheet.md) ·
[Big chain map](docs/review/chain-map.md) ·
[Mixed drills](docs/review/drills.md) ·
[Flashcards / Anki deck](docs/review/flashcards.md) ·
[Glossary](docs/review/glossary.md)

## Every lesson has the same shape

On the website, every key term has a dotted underline — hover over it (tap on a phone) to see its definition.

`In plain words` (an everyday analogy) → `TL;DR` → `The big question` → `The story chain` → `Core ideas + diagram` → `Worked example` → `Common mistakes` → `Recall (blurt · flashcards · explain it · simulator)` → `Connects to` → `Read in the book`

## Flashcards

`flashcards/os-step-by-step-anki.txt` imports straight into Anki (File → Import) with deck, tags and HTML set. A CSV is there too. Both are generated from the lessons:

```bash
python scripts/build_flashcards.py
```

## Build the website locally

```bash
pip install -r requirements.txt
python scripts/build_flashcards.py
mkdocs serve          # http://127.0.0.1:8000
```

A GitHub Action (`.github/workflows/publish.yml`) rebuilds and publishes the site to GitHub Pages on every push to `main`.

## Contributing

Spotted an error or have a better way to explain something? Open an issue or a PR — edit the lesson Markdown in `docs/`, then re-run the flashcard script.

## License

Text: [CC BY-SA 4.0](LICENSE). Scripts: MIT. OSTEP itself is © Arpaci-Dusseau and is not included here.
