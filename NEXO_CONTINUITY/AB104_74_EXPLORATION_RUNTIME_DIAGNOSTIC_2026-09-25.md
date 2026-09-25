# AB104.74 — Exploration runtime diagnostic — 2026-09-25

The explicit region registration repair still failed the unchanged behavioral invariant. Added a diagnostic print immediately before the existing assertion to capture knownRegions, positions, intents, activity, excursions and exploredAreas from the real GitHub Actions runtime.

No assertion was weakened or removed.

Commit: 4be7874a71daa3f6cc5bb8a0d4590e2a60704f5d

Next: inspect the Actions output, identify the actual runtime path, then make the minimal semantic repair and remove/retain the diagnostic as appropriate.
AB65 remains NOT_VERIFIED.
