# Part III · Persistence

**The question:** how do we keep data safe and fast on slow devices that can fail or lose power at any moment?

```mermaid
flowchart TB
    IO["I/O devices: polling, interrupts, DMA (L19)"] --> HDD["Disks: seek + rotate + transfer (L20)"]
    HDD --> RAID["RAID: many disks as one (L21)"]
    HDD --> API["Files & directories API (L22)"]
    API --> VSFS["FS implementation: inodes, bitmaps (L23)"]
    VSFS --> FFS["FFS: locality (L24)"]
    VSFS --> J["Crash consistency: journaling (L25)"]
    VSFS --> LFS["LFS & data integrity (L26)"]
```

Everything in this part follows from one number: **random disk I/O is ~100–300× slower than sequential.** FFS keeps related data close, LFS makes every write sequential, journaling turns scattered updates into one sequential log write.

**Lessons:** L19–L26. **Time:** ~7 hours.
