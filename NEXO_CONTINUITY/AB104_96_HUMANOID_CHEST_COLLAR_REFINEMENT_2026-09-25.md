# AB104.96 — HUMANOID CHEST/COLLAR REFINEMENT — 2026-09-25

## Change
Refined the canonical humanoid chest and collar silhouette in `src/main-stable.js`:
- chest scale: `1.04,1.02,1`
- collar scale: `1.05,1,1.02`

The change is additive to the existing visual model and preserves `userData.parts`, role accessories, activity tools, and animation architecture.

## Verification
The Lúmina simulation workflow subsequently reported a successful run on the resulting main lineage (Run 2124, GitHub Actions). A later concurrent commit advanced main beyond this checkpoint; the canonical source still contains the collar refinement.

## Integrity
No P_AA/AB65 semantic state was modified.
