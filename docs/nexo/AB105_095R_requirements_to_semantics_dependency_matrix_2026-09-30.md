# AB105.095R — Nexo requirements-to-semantics dependency matrix

Date: 2026-09-30
Chain: AB105.094R -> AB105.095R

## Scope
This is a distillation artifact, not an architecture implementation and not a claim of requirements completeness. It maps requirements recoverable from the canonical continuity handoff and recent evidence campaign to the semantic contracts already established.

## Matrix
| Requirement family | Semantic dependency | Evidence dependency | Current state | Verification prerequisite |
|---|---|---|---|---|
| Authority and user control | AuthorityContext, policy, epoch/fence, STOP | current authority + freshness/revocation evidence | PARTIAL | formal + runtime enforcement tests |
| STOP | StopState, fencing, recovery fence, reconciliation | fresh authority/operation/effect observations | SEMANTICALLY DEFINED; enforcement UNKNOWN | crash/partition/in-flight fault injection |
| Identity/incarnation | IdentityContext, ResourceIncarnation, EffectIdentity | provider/resource identity evidence | CLOSED_GENERIC_WITH_BOUNDED_UNKNOWN | type-specific adapters + tests |
| Protected transitions | transition contract, preconditions, ReadSet/WriteSet/DependencySet | authoritative reads/provenance | PARTIAL | formal linearization + implementation tests |
| Dependency completeness | DependencySet, provenance envelope, derivation/cache lineage | authoritative read capture | NORMATIVELY DEFINED | executable instrumentation tests |
| External effects | EffectBinding, effect state machine, idempotency | provider observations + reconciliation | SEMANTICALLY DEFINED | provider-specific fault injection |
| Evidence trust | EvidenceRecord, freshness, provenance, common-mode/dependency | attestation/observation coverage | CLOSED_GENERIC_WITH_BOUNDED_UNKNOWN | formal appraisal tests |
| Claim/Appraisal/Decision | Claim Contract + Decision Contract | claim-specific evidence | CLOSED_SEMANTICALLY | formal decision model + tests |
| Event/history reconstruction | EventDAG, coverage, ordering, terminality | complete source history | PARTIAL | historical semantic artifact + reconstruction verification |
| Historical ternary compatibility | TERNARY_TRANSITION_SEMANTICS_SPEC + FutureObs_PAA | AB50–AB58 artifacts | BLOCKED/UNKNOWN | missing semantic artifact |
| Durable history/continuity | DurableHistory, epochs, anti-rollback, reconstruction | durable checkpoints + external reconciliation | PARTIAL | crash/recovery/migration verification |
| Cross-resource atomicity | effect-class contract + coordination/reconciliation | participant effect evidence | OPEN DESIGN CHOICE | protocol-family selection + proof/testing |
| Recovery | RecoveryFence, RecoveryProgress, RecoveryOwnership | current identity/authority/effect state | SEMANTICALLY DEFINED | second-crash/partition tests |
| Formal verification | A12 boundary, TLA+/SANY/TLC gate | exact frozen model/toolchain evidence | NOT_PERFORMED | semantic freeze + TLC evidence |
| Implementation/runtime verification | executable contracts + fault injection | runtime telemetry/evidence | NOT_PERFORMED | implementation |

## Dependency interpretation
1. A requirement marked PARTIAL is not equivalent to UNSAFE or FAILED; it means the semantic contract exists only in bounded form or an enforcement/verification layer remains.
2. BLOCKED/UNKNOWN is local to the requirement that consumes the missing artifact.
3. CLOSED_GENERIC_WITH_BOUNDED_UNKNOWN means the generic semantic boundary is established, while provider/type/history-specific claims retain explicit uncertainty.
4. NOT_PERFORMED is distinct from UNKNOWN: it records that the required verification activity has not yet been executed.
5. Implementation is not inferred from documentation, SANY parsing, or research artifacts.

## Highest-value unresolved cluster
The matrix exposes a cluster that is broader than the historical ternary gap but still finite:
- authoritative transition completeness;
- durable continuity/recovery semantics;
- cross-resource effect protocol selection;
- formal verification boundary;
- executable implementation/fault-injection verification.

These are not reasons to reopen provider-specific evidence research. They are the remaining Nexo-core design/verification dependencies already visible in the canonical baseline.

## Important distinction
The historical ternary branch remains a separate dependency. It can block a historical compatibility claim or any decision whose correctness explicitly consumes that historical reconstruction, but it does not automatically block the generic Nexo contracts above.

## Research-sprawl gate
No new evidence taxonomy is opened by this matrix. The next investigation must select one concrete Nexo-core unresolved cluster and attack its semantics with primary evidence and adversarial counterexamples.

## Status
REQUIREMENTS_TRACEABILITY_MATRIX = INITIAL_DISTILLATION_COMPLETE
REQUIREMENTS_COMPLETENESS = NOT_PROVEN
GENERIC_EVIDENCE_CLUSTER = CLOSED_WITH_BOUNDED_UNKNOWN
HISTORICAL_TERNARY_DEPENDENCY = LOCALIZED_UNKNOWN/BLOCKED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.096R — adversarial audit of the remaining Nexo-core requirement cluster, starting with durable continuity/recovery and migration semantics because these cross authority, history, evidence, and STOP without reopening provider-specific branches. Preserve the cross-resource atomicity protocol choice as OPEN; do not select it by assumption.