# Part II · Concurrency

**The question:** how do threads share memory without corrupting it, and how do they wait for each other?

```mermaid
flowchart TB
    R["Race condition<br/>(L13)"] --> L["Locks: atomic HW<br/>instructions (L14)"]
    L --> DS["Locked data<br/>structures (L15)"]
    L --> CV["Waiting: condition<br/>variables (L16)"]
    CV --> SEM["Semaphores: locks +<br/>waiting in one (L17)"]
    SEM --> DL["Bugs & deadlock;<br/>event loops (L18)"]
```

Two tools solve almost everything here: **locks** for mutual exclusion, **condition variables** (or semaphores) for ordering. The rest is learning where people misuse them.

**Lessons:** L13–L18. **Time:** ~5 hours.
