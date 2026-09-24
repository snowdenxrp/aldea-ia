# NEXO CANONICAL DISTILLATION LEDGER V1
Date: 2026-09-24
Status: INITIAL DISTILLATION / ARCHITECTURE STILL BLOCKED

## Purpose
This ledger is the bridge between V1–V20 plus post-V20 research and the future clean architecture.

It is intentionally NOT the architecture. It records what survives, what must be redesigned, what is rejected, what is historical, and what remains open.

NASA systems-engineering guidance supports bidirectional requirements traceability, explicit verification methods, validation against stakeholder expectations, configuration/change authority, and system-level V&V rather than treating a passing component test as proof of complete system correctness. This is consistent with the Nexo rule that every architectural claim must carry its own evidence boundary. 

## Disposition vocabulary
- CARRY_FORWARD: mechanism/principle survives substantially unchanged.
- REWORK: underlying intent survives but mechanism/model must be redesigned.
- REJECTED: mechanism is unsafe, misleading, incomplete, tautological, or otherwise unsuitable.
- HISTORICAL_ONLY: useful lineage/evidence of discovery, but not a future mechanism.
- OPEN: unresolved; cannot be promoted into a guarantee.

## 1. Foundational separation
| Item | Source | Disposition | Reason / architectural consequence |
|---|---|---|---|
| COGNITION != AUTHORITY != EXECUTION != VERIFICATION | V1+ audits | CARRY_FORWARD | Fundamental trust-boundary rule. |
| AUTHORITY cannot self-increase | V1+ | CARRY_FORWARD | Must be structurally enforced. |
| Model cannot modify Constitution/trust root | V1+ | CARRY_FORWARD | Trust anchor remains outside cognition. |
| MEMORY != MISSION STATE != EXECUTION HISTORY != CHECKPOINT != WORLD STATE | V1+ | CARRY_FORWARD | Prevent semantic/state conflation. |
| Integrity of history != truth of history | evidence research | CARRY_FORWARD | Provenance does not establish world truth. |
| UNKNOWN/CONFLICT/UNTRUSTED blocks automatic continuation | V1+ | CARRY_FORWARD | Epistemic uncertainty becomes control state. |
| Child scope <= parent scope | authority research | CARRY_FORWARD | Delegation cannot expand authority. |
| Goal success != mission success | mission/proxy research | CARRY_FORWARD | Prevent specification gaming. |

## 2. Request/effect identity
| Item | Source | Disposition | Reason / consequence |
|---|---|---|---|
| Request fingerprinting | V18-V20 / semantic contract | CARRY_FORWARD | Exact requested operation must remain bound. |
| EffectBinding immutable | canonical object audit | CARRY_FORWARD | External effect identity needs stable binding. |
| operation_id alone as external identity | V1-V20 findings | REWORK | Must be combined with effect identity, target, parameters and replay/idempotency semantics. |
| Timeout means no effect | V9+ | REJECTED | Timeout/crash/partition creates UNKNOWN unless reconciled. |
| External effect state separate from operation lifecycle | audits | CARRY_FORWARD | Necessary for ambiguous external-world outcomes. |
| New operation ID clears previous uncertainty | recovery research | REJECTED | Cannot bypass unresolved external effect. |
| Idempotency/replay policy | semantic contract | CARRY_FORWARD | Required for safe retry/reconciliation. |
| Exact target/parameter binding | semantic contract | CARRY_FORWARD | Prevent target/context substitution. |

## 3. Authority, epochs and leases
| Item | Source | Disposition | Reason / consequence |
|---|---|---|---|
| Authority is versioned/fenced | V16-V20 | CARRY_FORWARD | Revocation/re-authorization must invalidate stale work. |
| Global authority epoch as sole mechanism | V3-V18 | REWORK | Scope must be operation/effect/context aware; global counters can over-invalidate or under-specify. |
| Lease as coordination primitive | V10-V20 | CARRY_FORWARD | Useful for ownership/fencing only. |
| Lease validity as proof of external truth | all audits | REJECTED | Lease says coordination ownership, not world state. |
| Lease generation prevents stale owner action | V16-V20 | CARRY_FORWARD | Must be bound to exact protected transition and implementation linearization. |
| Abstract global clock as proof of implementation linearizability | V20 | REWORK | Formal ordering is not implementation atomicity. |
| CAS/linearizable acquire/commit equivalence | audits | OPEN | Requires implementation-level evidence. |
| Revoked lease semantics | V16 | REWORK | Preserve explicit revoked state, but final lifecycle must be canonicalized. |
| Reauthorization increments generation/authority context | V16-V18 | CARRY_FORWARD | Reauthorization must create a new fenced context. |
| Admin membership alone proves reauthorization authority | V19-V20 | REJECTED | Requires authenticated capability, scope, expiry and separation-of-duties semantics. |

## 4. Emergency stop
| Item | Source | Disposition | Reason / consequence |
|---|---|---|---|
| Independent emergency-stop plane | PG-009 | CARRY_FORWARD | Must not depend solely on normal executor. |
| STOP_REQUESTED != STOP_VERIFIED | PG-009 | CARRY_FORWARD | Request, enforcement, verification and world effect are distinct. |
| Executor ACK proves external stop | emergency research | REJECTED | ACK is local evidence only. |
| No implicit restart after stop | PG-009 recovery | CARRY_FORWARD | Restart cannot create release authority. |
| STOP can be cleared by executor | PG-009 | REJECTED | Anti-bypass requirement. |
| Stop class E0-E4 | PG-009 | REWORK | Useful classification but must be tied to concrete safety function, enforcement and evidence rather than a numeric severity label. |
| Emergency stop authority isolated from normal execution | PG-009 | CARRY_FORWARD | Reduces common-mode risk. |

## 5. Recovery/restart
| Item | Source | Disposition | Reason / consequence |
|---|---|---|---|
| Restart enters quarantine | PG-009 | CARRY_FORWARD | No direct return to execution. |
| Checkpoint restores authority | recovery research | REJECTED | Checkpoint restores state, not current authority. |
| Recovery Fence | PG-009 | CARRY_FORWARD | Binds stop/effect/epochs/owner/reconciliation. |
| Recovery owner distinct from normal executor | PG-009 | CARRY_FORWARD | Separation of recovery authority. |
| Recovery release requires explicit current authorization | PG-009 | CARRY_FORWARD | No implicit resume. |
| Recovery image automatically trusted | update research | REJECTED | Recovery artifact needs independent admission. |
| Recovery path outside common-mode analysis | common-mode | REJECTED | Recovery is itself a critical dependency. |
| Recovery as high-value attack surface | adversarial research | CARRY_FORWARD | Must receive normal trust/evidence controls. |

## 6. Update/bootstrap/rollback
| Item | Source | Disposition | Reason |
|---|---|---|---|
| Update authenticity != update authorization | safety-plane research | CARRY_FORWARD | Signature does not grant permission. |
| Provenance != safety | safety-plane | CARRY_FORWARD | Supply-chain provenance is one evidence dimension. |
| Dependency closure before admission | safety-plane/common-mode | CARRY_FORWARD | Required for coherent safety context. |
| Semantic compatibility before activation | safety-plane | CARRY_FORWARD | Signature cannot establish semantic compatibility. |
| Rollback image automatically safe | safety-plane | REJECTED | Rollback can reintroduce unsafe/obsolete state. |
| System Version Set | safety-plane | CARRY_FORWARD | Critical components must be evaluated as a coherent version context. |
| Bootstrap trust path | safety-plane | CARRY_FORWARD | Bootstrap must establish safety/recovery gates before model/planner. |
| Update journal restores authority | update research | REJECTED | Journal restores durable history, not authority. |
| Automatic rollback under UNKNOWN critical state | safety-plane | REJECTED | Ambiguous effects require reconciliation/controlled recovery. |

## 7. Evidence and epistemic state
| Item | Source | Disposition | Reason |
|---|---|---|---|
| EvidenceRecord with exact scope/effect/context | semantic contract | CARRY_FORWARD | Required for claim binding. |
| Freshness deadline | evidence research | CARRY_FORWARD | Evidence can age. |
| Explicit STALE/INVALIDATED states | proof/evidence research | CARRY_FORWARD | Evidence lifecycle must be first-class. |
| AUTHENTICATED == TRUE | evidence research | REJECTED | Authentic source can still report stale/wrong world state. |
| Logged == observed | adversarial observability | REJECTED | Telemetry can be forged/missing/reordered. |
| Independent evidence requires distinct failure domains | common-mode | CARRY_FORWARD | Process diversity alone is insufficient. |
| I0-I5 as universal safety score | common-mode | REJECTED | These are architectural independence labels, not certification scores. |
| Proof cache green flag as truth | proof research | REJECTED | Cache is optimization, not truth. |
| Proof context fingerprint | proof research | CARRY_FORWARD | Proof validity depends on exact context. |
| PROPERTY_KIND distinction | proof status | CARRY_FORWARD | Safety/liveness/refinement evidence are different. |
| Global model equals effective proof context | proof context research | REJECTED | Effective context can differ due imports/projections. |
| Current proof status derived from obligation graph | proof aggregation | CARRY_FORWARD | Avoid writable status claims. |

## 8. Formal methods
| Item | Source | Disposition | Reason |
|---|---|---|---|
| TLA+ as behavioral specification | V1-V20 | CARRY_FORWARD | Useful formal layer. |
| V1-V20 models as future canonical model | all audits | HISTORICAL_ONLY | Preserve lineage; do not patch into V21. |
| V20 global clock as complete real-world ordering proof | V20 audit | REWORK | Formal abstraction must correspond to implementation linearization. |
| TLA safety invariants | formal research | CARRY_FORWARD | Useful when actually checked in current model. |
| TLC exhaustive checking | TLC research | CARRY_FORWARD | Evidence for bounded finite models only. |
| TLC simulation == exhaustive evidence | TLC research | REJECTED | Simulation is sampled. |
| Symmetry/constraints as mere performance settings | TLC research | REJECTED | They affect explored state space and evidence meaning. |
| TLAPS as general temporal proof engine | temporal research | REJECTED | Current boundary does not justify that claim. |
| Temporal/liveness guarantee without fairness/model assumptions | fairness research | REJECTED | Must bind claim to explicit model/fairness. |
| TLC/Apalache agreement == implementation correctness | cross-validation | REJECTED | Corroboration is not implementation proof. |
| Formal model self-check by second method | formalization research | CARRY_FORWARD | Helps detect modeling errors. |
| Actual SANY/TLC execution in canonical environment | lineage | OPEN | Must be performed and recorded. |

## 9. Formal correspondence/refinement
| Item | Source | Disposition | Reason |
|---|---|---|---|
| Formal correspondence schema | PG-009 | CARRY_FORWARD | Needed to bind architecture/model/implementation. |
| Name-only state mapping | correspondence audit | REJECTED | Mapping needs pre/postconditions, affected state and prohibitions. |
| UNMAPPED/PARTIAL explicitly represented | correspondence | CARRY_FORWARD | Prevent false completeness. |
| Formal equivalence boolean asserted by checker | correspondence | REJECTED | Checker cannot manufacture equivalence. |
| Refinement/stuttering relation | refinement research | CARRY_FORWARD | Required where abstraction differs from implementation. |
| Exact implementation-to-formal correspondence | audits | OPEN | Requires implementation evidence. |

## 10. Common-mode and dependency
| Item | Source | Disposition | Reason |
|---|---|---|---|
| Failure-domain taxonomy | common-mode | CARRY_FORWARD | Required for independence claims. |
| Different process == independent | common-mode | REJECTED | Shared host/runtime/storage etc. can correlate failure. |
| Different model == independent evidence | common-mode | REJECTED | Shared data/trust/provider can correlate. |
| Different service == independent authority | common-mode | REJECTED | Shared identity/trust roots can correlate. |
| Dependency closure | common-mode/safety claim | CARRY_FORWARD | Required for safety/evidence/update/recovery claims. |
| Safety claim dependency ceiling | common-mode | REWORK | Keep assurance degradation semantics but separate structural validity from acceptance. |
| evaluate_claim returning admissible despite structural BLOCK | evaluator audit | REJECTED | Canonical contract must separate structural validity, analytical admissibility and claim acceptance. |
| Runtime dependency graph | PG-009 | CARRY_FORWARD | Must be bound to actual runtime/version context. |

## 11. Requirements/lifecycle completeness
| Item | Source | Disposition | Reason |
|---|---|---|---|
| System boundary includes humans/processes/dependencies | completeness research | CARRY_FORWARD | Prevent kernel-only design. |
| Requirement -> design -> implementation -> test -> evidence traceability | NASA comparison | CARRY_FORWARD | Bidirectional traceability is needed. |
| Requirement == policy | completeness research | REJECTED | Different ownership/lifetime/verification semantics. |
| Verification == validation | NASA comparison | REJECTED | Verification checks compliance; validation checks intended purpose/stakeholder expectations. |
| Lifecycle includes operation/maintenance/retirement | NASA | CARRY_FORWARD | Architecture must cover full lifecycle. |
| Decommissioning as process termination | completeness research | REJECTED | External effects, credentials, delegated work and recovery must be closed. |
| Data deletion requested == deletion verified | data research | REJECTED | Deletion is itself a controlled lifecycle effect. |
| Resource budget irrelevant to safety | completeness research | REJECTED | Safety/recovery/verification resources need protection from starvation. |
| Migration is ordinary update | completeness research | REJECTED | Migration requires semantic compatibility and evidence continuity. |

## 12. Human authority
| Item | Source | Disposition | Reason |
|---|---|---|---|
| Human approval as unrestricted authority | human/adversarial research | REJECTED | Approval must be authenticated and scope-bound. |
| Human input categories | authority research | CARRY_FORWARD | Instruction/delegation/preference/consent/observation/emergency must remain distinct. |
| Inferred intent creates authority | authority research | REJECTED | Ambiguity must hold/revalidate. |
| Human approval bound to exact operation/effect | human research | CARRY_FORWARD | Prevent approval/execution substitution. |
| Human fallibility as explicit threat | adversarial research | CARRY_FORWARD | Human component belongs in threat model. |

## 13. Mission/proxy
| Item | Source | Disposition | Reason |
|---|---|---|---|
| Mission/goal/subgoal/proxy distinction | mission research | CARRY_FORWARD | Prevent specification gaming. |
| Reward/metric can authorize effect | adversarial research | REJECTED | Metric is not authority. |
| Local completion == world outcome | mission research | REJECTED | External world must be independently reconciled. |

## 14. Long-running operation
| Item | Source | Disposition | Reason |
|---|---|---|---|
| Startup validation sufficient | long-run research | REJECTED | Context and assumptions age. |
| Periodic/triggered revalidation | long-run research | CARRY_FORWARD | Needed for freshness/drift. |
| State growth/resource exhaustion | completeness | CARRY_FORWARD | Must have explicit ceilings and degraded behavior. |
| Operator handoff invalidates nothing | long-run research | REWORK | Handoff must preserve/revalidate authority and context. |
| Forgotten delegated work | long-run research | CARRY_FORWARD | Requires expiry/revocation/reconciliation. |

## 15. Explicit open gates before architecture construction
1. Actual SANY/TLC execution in a reproducible environment.
2. Canonical formal model unification.
3. Implementation-level linearizability/CAS equivalence.
4. Runtime enforcement of gates/fences.
5. Fault injection and adversarial runtime tests.
6. Exact implementation-to-formal correspondence.
7. Evidence freshness/invalidation implementation.
8. External-world reconciliation under real failures.
9. Semantic/data migration integrity.
10. Temporal/liveness evidence with explicit model/fairness boundaries.
11. Full requirements/stakeholder traceability matrix.
12. Configuration/change authority and precedence semantics.
13. Long-running resource/clock/key/certificate rollover tests.
14. Decommissioning and residual-effect closure tests.

## 16. Current architectural consequences
The ledger now makes several design directions unavoidable, without yet selecting the final implementation:
- A trusted core must be smaller than the whole system boundary.
- Requirements, policy, authority, invariants, evidence, tests and operational state must remain distinct objects/concepts.
- Critical external effects require exact identity and reconciliation.
- Evidence has lifecycle, provenance, freshness, dependency and independence dimensions.
- Recovery/update/bootstrap are safety-critical control planes, not maintenance utilities.
- Formal models must be tied to implementation evidence; abstract ordering alone is insufficient.
- Human and external dependencies must be explicit parts of the system model when they participate in claims.
- Unknown must be durable where ambiguity is safety-relevant.
- Lifecycle closure, not merely runtime correctness, is required for system completeness.

## 17. Evidence status
This ledger is a research/distillation artifact.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.

No row in this ledger constitutes implementation verification.

## Next gate
Before writing the clean architecture, complete a second pass over this ledger specifically for:
- missing historical mechanisms not yet represented;
- contradictions between CARRY_FORWARD items;
- hidden coupling between layers;
- object ownership/authority conflicts;
- state-machine completeness;
- minimum trusted computing base;
- requirements-to-invariant-to-test traceability.

Only after that gate should the canonical architecture specification be drafted.
