# Nexo CONTINUITY correction — AB104.368 resume anchor

Date: 2026-09-26

## Canonical resume rule

The next chat MUST resume from **AB104.368 as the exact recovered research anchor**, not from an older Nexo state, and not by inventing a new starting point.

AB104.368 was verified in GitHub by these commits:
- e1c9daecb4ff2ee149c906f9e40bbe6559e1f894 — Nexo continuity checkpoint AB104.368
- afe001a961cea21a79a68f7568b34ab77f5bcdcb — Nexo continuity checkpoint AB104.368 correction
- 41311d15aec1c8b40eb503ef3b23b9ad8ead4063 — authority/target frontier conflict matrix
- 5095b892e3740fd540304a6a04eebe53b05e151c — combined authority/target frontier matrix

The previously mentioned short SHA **a196f4d8 is NOT treated as the canonical GitHub identifier** because it did not resolve when checked. Do not resurrect it as if verified.

## Exact state inherited from AB104.368

AB104.368 established that authority (A) and target state/version (T) are independent frontiers:
- A VALID + T UNKNOWN => UNKNOWN/STOP
- A UNKNOWN + T VALID => UNKNOWN/STOP

The next exact research step after AB104.368 was:
**AB104.369 — atomically unite authority validation + target CAS, and study authority changes during that protected frontier.**

AB104.369 was then completed and saved as:
- 37f636b0d2c5c77c443388702f97e58866983372
- File: docs/nexo/AB104.369_AUTHORITY_CAS_ATOMIC_FRONTIER_2026-09-26.md

Therefore, the correct current continuation is **AB104.369 -> AB104.370**, while preserving AB104.368 as the recovery anchor and historical boundary.

## Do-not-repeat / anti-drift

- Do NOT resume from AB104.187 or any older checkpoint as the active next step.
- Do NOT skip AB104.368/AB104.369.
- Do NOT claim AB104.368 was merely a proposal; it was researched and committed.
- Do NOT overwrite or delete historical checkpoints.
- Do NOT implement Nexo architecture yet.
- Do NOT call the research formally verified, secure, runtime-verified, or implementation-correct.
- Continue INVESTIGAR -> ANALIZAR -> CONSTRUIR -> GUARDAR.
- Every new AB step is additive and must preserve the prior evidence trail.
- If a future chat starts with CONTINUITY, first recover this anchor and the latest AB checkpoint before proposing or performing new work.

## Next exact action

AB104.370: adversarially enumerate authority-change timelines around PREPARE -> FINAL_GATE -> LINEARIZE -> EXTERNAL_ATTEMPT, covering revocation, scope narrowing, authority epoch rollover, recovery ownership change, retry after stale authority, crash before/after local commit, and delayed/in-flight external requests. Classify outcomes as REJECTED, HOLD/REVALIDATE, or UNKNOWN, and identify remaining TOCTOU windows.

Status remains: RESEARCH / DESIGN EVIDENCE ONLY. No implementation or formal proof has been performed.
