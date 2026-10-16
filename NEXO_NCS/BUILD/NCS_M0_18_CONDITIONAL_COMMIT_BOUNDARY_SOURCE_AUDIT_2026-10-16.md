# NCS M0.18 — Conditional-commit boundary source audit
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: SOURCE REVIEW COMPLETE / NO NEW TEST RUN
STEP 7: OPEN / STOP / UNKNOWN

## Scope
Continue from M0.17 by checking whether the candidate's expected revision reaches the canonical persistence check and how the adapter classifies conflict versus uncertain persistence. This is a bounded source review, not a new runtime or CI proof.

## Exact source pins reviewed
- `src/nexo/core/protected-transition.mjs`: blob `3028751d1db6b62321c4cd9ff13889ae33a30895`
- `src/nexo/adapters/conditional-commit-persist-state.mjs`: blob `9a707677c99d226f87f9b8b0d9e7673e7a1a100e`
- `scripts/simulate.mjs`: blob `4dafebec265cc490ee17b388c75c04bb48869ac8`
- `tests/nexo/conditional-commit-persist-state.test.mjs`: blob `9486d39eafc794d6a4ffe42ece4e288fbe2cb01d`
- Prior boundary references: `NEXO_CONTINUITY/P112_PERSISTSTATE_FINAL_COMMIT_FEASIBILITY_AUDIT_V1_2026-10-07.md` blob `65ab4c7d34d1d36df30adc6dd53c3287203d9237`; `NEXO_CONTINUITY/P112_PERSISTSTATE_PHYSICAL_BOUNDARY_CRASH_CUT_AUDIT_V2_2026-10-07.md` blob `4b7639185411593f49f9ba4bef43e9d6f7745012`.

## Findings
1. The M0.17 transition assertion now requires candidate.expectedRevision to equal the transition's requested expectedRevision exactly.
2. The conditional-commit adapter forwards candidate.state to the existing persistState primitive and passes expectedRevision plus stateRevision = expectedRevision + 1.
3. persistState acquires the sibling lock, reloads canonical state while the lock is held, compares current stateRevision with expectedRevision, and raises STATE_REVISION_CONFLICT before constructing/writing the replacement payload on mismatch.
4. The adapter maps STATE_REVISION_CONFLICT to CONDITIONAL_CONFLICT. Other persistence exceptions are conservatively mapped to UNKNOWN.
5. Existing focused integration-test source covers a successful commit and a stale candidate conflict; existing P112 records describe cooperating-writer race and write/rename failure tests. No new test or workflow was executed during this review.

## Correctly bounded conclusion
The source chain from candidate.expectedRevision to the canonical persistState revision comparison is present. The revision check is serialized with cooperating writers that use this same lock protocol. This is stronger than a caller-only revision check, and no second generic commit wrapper is justified.

This does NOT prove:
- every mutation writer uses the same lock/protocol;
- arbitrary external writers or distributed/network-filesystem writers are fenced;
- the protected transition is reachable from the production Nexo runtime before protected effects;
- commit is power-loss durable (no fsync/fdatasync/FileHandle.sync contract was demonstrated);
- an UNKNOWN persistence outcome means no write occurred. An error after canonical rename can leave the caller uncertain whether the commit took effect;
- authority legitimacy, Constitution currentness, dependency closure, or bypass closure.

## Next bounded action
Review the actual snapshot-isolation data graph and the concrete runtime/effect callers already identified, without re-running closed P112 audits. Determine whether the protected candidate path detaches every mutable field that participates in the claimed transition, and keep runtime reachability as a separate unresolved gate. Do not add another wrapper, wire production runtime, or enable protected effects without a demonstrated missing semantic and a justified target.

STEP 7 remains OPEN / STOP / UNKNOWN. Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED. Protected effects remain STOP.
