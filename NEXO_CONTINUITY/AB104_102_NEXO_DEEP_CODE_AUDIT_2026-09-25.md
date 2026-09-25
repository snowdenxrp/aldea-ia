# AB104.102 — Nexo deep code audit and contract hardening — 2026-09-25

## Audit scope
Inspected the canonical Nexo orchestration source, assistant squad, learning memory, assistant execution script, Nexo regression tests, package test gate and persistent GitHub Actions workflow. Cross-checked workflow/test assumptions against current GitHub Actions and Node.js documentation.

## Findings repaired
1. Mission lifecycle was hardened so a step can only complete/fail/block from `executing`, preventing callers from declaring success for a merely planned step.
2. Execution planning now returns only currently executable planned steps whose dependencies are completed; it no longer exposes blocked/future actions as immediately executable.
3. Dependency graphs are explicitly checked for cycles.
4. Mission identity now includes a per-process sequence component, reducing same-millisecond collision risk.
5. Failure now produces `needs_replan` instead of masquerading as successful completion.
6. Verification distinguishes failed, blocked, incomplete and fully completed missions.
7. Durable memory now records mission plans and structured Nexo attempts.
8. Completed outcomes are persisted only when they contain verified evidence.
9. DO_NOT_REPEAT records preserve action + target scope rather than losing target identity.
10. Assistant execution now persists the generated mission plan into the durable learning memory.
11. Regression tests were expanded for dependency gating, evidence requirements, failed-step replanning, executable-action filtering and durable mission/outcome memory.
12. The audit's own regression assertion failure was diagnosed from the actual GitHub Actions log and corrected; no error was hidden or ignored.

## Verification
- Run 2148, ID 36200746831, SUCCESS.
- Commit verified: e1cfce617971541ef8026b6b90c1490135417812.
- Run 2147 failed only because its test expectation contradicted the intended dependency-ready behavior; the failure was used as evidence and repaired in Run 2148.
- Node.js 22.23.2 executed the test gate successfully in Run 2148.
- GitHub Actions workflow synchronization and job sequencing remain explicit; workflow steps execute in order and the validation gate precedes assistant diagnostics and simulation.

## Remaining boundary
This audit does NOT claim full autonomous execution. The current Nexo layer remains intentionally effect-free. The next architecture must add a typed effect adapter, precondition check, effect result, postcondition verifier and durable outcome transaction before allowing real mutation. Planning alone must never be treated as execution.

## Semantic protection
No P_AA/AB65 semantics were changed or promoted:
- LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
- LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
- REPLAY_STATE_RECONSTRUCTION = UNKNOWN
- TERNARY_PAA_COLLISION = UNKNOWN
- FORMAL_VERIFICATION = NOT_PERFORMED
- AB65_EXECUTION = NOT_VERIFIED
