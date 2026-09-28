# NEXO — GLOBAL AUDIT CONTINUITY

Date: 2026-09-27
Canonical repository: snowdenxrp/aldea-ia
Status: GLOBAL FORENSIC AUDIT IN PROGRESS — AB1 → AB104.744
Implementation: BLOCKED. No V21.

## Audit kickoff
File: `docs/nexo/NEXO_AB_GLOBAL_AUDIT_AB1_TO_AB104_744_KICKOFF_2026-09-27.md`
Commit: `abe48fb653f3ec23197488e470aa92be1a947497`
Marker: `GLOBAL-AUDIT-001`
Next marker: `GLOBAL-AUDIT-002`

## Why this replaces the local AB104 resume
The previous local frontier was AB104.745. The user explicitly approved a full audit from AB1 through the current endpoint before further local research. Therefore the canonical next mission is now the global audit; the AB104.745 local task is preserved historically but does not supersede the global audit.

## Audit standard
- GitHub canonical external evidence.
- Preserve historical artifacts; no deletion/overwrite for normalization.
- Separate source code, test source, executed tests, formal evidence, runtime evidence and deployment evidence.
- Separate DESIGNED / SPECIFIED / IMPLEMENTED / EXECUTED / VERIFIED / DEPLOYED.
- Repetition is not proof.
- Missing reconstruction remains UNKNOWN.
- Corrections require evidence.
- Duplicate/parallel AB artifacts are explicitly reconciled.

## Existing baseline to challenge, not blindly inherit
A01-A14 clean architecture is the current design baseline. Core distinctions remain INFORMATION != CAPABILITY != AUTHORITY != EFFECT != EVIDENCE and DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED. The global audit must verify that these conclusions are supported by the historical chain and identify any later contradiction or unresolved dependency.

Known gates remain open unless independently closed: protected-store failure semantics, trusted time, migration/schema coexistence, resource exhaustion, provider reconciliation, scalable evidence invalidation, independent observation, TCB compromise response, dispute/override governance, privacy evidence rules, automated traceability, SANY/TLC, implementation refinement, fault injection, long-duration rollover/resource testing.

## Recent evidence anchor
AB104.744 commit: `38edf9965cd8ce268b622a8efd0ada48ed3c80a6`.
Prior continuity: `1c74e0fde7187837f38a7bf76fcf2feb1986fa36`.
Recent OFLE findings remain: arbitrary error fixtures exist; exhaustive direct reducer coverage does not; generic correlation mismatch is tested end-to-end but OFLE-specific mismatch is not established; malformed/duplicate/missing/unrequested OFLE shape tests remain incomplete.

## Correlation correction that must not be lost
`ForwardingManagerTest.testResponseCorrelationIdMismatch` deliberately uses `requestCorrelationId + 1`; the mismatch reaches `AbstractResponse.parseResponse`; the parser rejects it before API-specific body parsing; forwarding converts it to `UNKNOWN_SERVER_ERROR`, which the test asserts. This is executed generic correlation evidence, not OFLE-specific evidence and not evidence of this session's runtime execution.

## Global audit state
GLOBAL_AUDIT_STARTED=YES
EARLIEST_RECOVERABLE_AB_NOT_YET_RECONSTRUCTED
FULL_ARTIFACT_INVENTORY=NO
FULL_CLAIM_LEDGER=NO
FULL_CONTRADICTION_LEDGER=NO
FULL_ARCHITECTURE_LINEAGE=NO
GLOBAL_CLOSURE_GATE_AUDIT=NO
IMPLEMENTATION_ALLOWED=NO
V21_ALLOWED=NO

## Exact next work — GLOBAL-AUDIT-002
1. Enumerate all recoverable Nexo AB/A artifacts and commits, starting at the earliest recoverable evidence.
2. Reconcile numbering gaps, duplicate numbers, parallel branches, renamed/reissued artifacts and continuity checkpoints.
3. Establish canonical chronology before assessing technical claims.
4. Then audit semantic blocks and transitions in claim status.

No implementation. No V21.
