# NCS M0 — Current authority boundaries
Date: 2026-10-20
Branch: ncs-clean-architecture
Evidence type: static source inspection only; no new CI run.

## Observed routes
- Core protected transition: `executeProtectedTransition()` asks the injected `authorityGate.check(claim)`, stops on STOP/UNKNOWN, and continues for AUTHORIZED. The reviewed tests use synthetic AUTHORIZED fixtures. This proves pipeline composition, not legitimate-owner recognition.
- Public application API: `runNexoChronicleAppend()` is the only mutating public use case; continuity status queries are read-only. Its public result explicitly sets `authorization: NOT_EVALUATED`.
- Owner-backed runtime: repair actions return `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED` before PREPARED; new non-Chronicle actions return `NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED`.
- Local persistence/Chronicle settlement can establish bounded local storage facts, not constitutional legitimacy or permission to perform other protected actions.

## Missing proof
No end-to-end proof was found that a concrete AuthorityGate derives its decision from a protected, non-self-authenticating root source and checks currentness, revocation/succession, claim scope, and relevant dependencies at the enforcement boundary. Prior contracts already cover role separation and Constitution-to-Policy binding; do not recreate them.

## Next gate
For one actually required Nexo claim/effect, map: exact claim and final effect boundary; governing constitutional rule; protected evidence source; currentness/revocation/succession conditions; common failure domains; negative tests for absent/UNKNOWN/stale/conflicting evidence. If a premise cannot be established, keep that effect STOP. Do not add a generic root registry or infer authority from a fixture, hash, signature, epoch, stored snapshot, or successful local commit.

## Status
M0 INCOMPLETO. `authorization: NOT_EVALUATED`. Protected effects STOP. Legitimate root PENDING/UNKNOWN. No runtime change or new test execution claimed.
