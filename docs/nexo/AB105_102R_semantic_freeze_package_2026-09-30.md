# AB105.102R — Semantic Freeze Package index and remaining behavior-changing choices

Date: 2026-09-30
Chain: AB105.101R -> AB105.102R

## Objective
Construct the compact semantic-freeze package index and isolate only choices that could still change Nexo behavior. This is a freeze-readiness artifact, not an implementation.

## Fresh primary evidence
NIST SP 800-53A distinguishes assessment procedures from the controls being assessed and supports traceability from requirements to assessment objectives, evidence, and findings. citeturn0search1turn0search2
RFC 9334 separates Evidence, Verifier appraisal, Attestation Results, and Relying-Party appraisal, supporting a freeze package in which each semantic layer has explicit inputs, outputs, and appraisal boundaries rather than one merged state. citeturn0search0turn0search3

## Freeze package index
SF-01 — Identity / Incarnation Contract
Defines identity envelope, incarnation boundaries, management-vs-physical transitions, and UNKNOWN rules.

SF-02 — Observation Contract
Defines observation identity, source, freshness, coverage, conflict, and appraisal context.

SF-03 — Evidence Dependency Contract
Defines dependency graph, common-mode relationships, independence classes, and bounded UNKNOWN handling.

SF-04 — Claim / Appraisal Contract
Defines claim scope, evidence requirements, appraisal state, provenance, and uncertainty.

SF-05 — Decision Contract
Defines intended action, consequence class, required assurance, authority, freshness, dependency and fail state.

SF-06 — Authority / Epoch / STOP Contract
Defines current authority, epochs, revocation/fencing boundaries, STOP states and release conditions.

SF-07 — Replay / Idempotency Contract
Defines operation identity, replay recognition, duplicate handling and reconciliation.

SF-08 — External Effect Contract
Defines effect identity, lifecycle, expected/observed/unobservable effects, and reconciliation.

SF-09 — EventDAG Reconstruction Contract
Defines reconstruction coverage, ordering, forks, terminality, completeness states and claim-relative bounded completeness.

SF-10 — Recovery / Migration / Successor Exclusivity Contract
Defines checkpoint coverage, recovery reauthorization, effect reconciliation, authority transfer and successor release.

SF-11 — Configuration / Causal Evidence Contracts
Defines configuration observations and actor/API provenance without collapsing either into physical lifecycle causality.

SF-12 — Historical Ternary Compatibility Boundary
Explicitly records the missing TERNARY_TRANSITION_SEMANTICS_SPEC and all dependent historical claims.

## Behavior-changing choices audit
### B1 — What counts as current authority?
Status: DEFINED at generic layer: policy-bound current decision + epoch/freshness/enforcement boundary.
Remaining: concrete enforcement mechanism.

### B2 — When does UNKNOWN force STOP?
Status: DEFINED as consequence/policy-dependent through Decision Contract.
Remaining: consequence-class policy values.

### B3 — When can recovery release a successor?
Status: DEFINED through successor-exclusivity predicate.
Remaining: concrete exclusion/fencing mechanism.

### B4 — What is an external effect?
Status: semantically defined by effect identity/lifecycle contract.
Remaining: provider adapter mapping.

### B5 — When is EventDAG reconstruction complete enough?
Status: claim-relative rule defined: all admissible reconstructions must be decision-equivalent for bounded completeness.
Remaining: formal proof and concrete history source.

### B6 — How is historical ternary behavior reconstructed?
Status: BLOCKED.
Reason: missing semantic artifact.

### B7 — How is cross-resource atomicity achieved?
Status: OPEN DESIGN CHOICE.
Reason: protocol selection materially changes semantics and failure behavior; it must not be chosen by assumption.

### B8 — What is the exact formal verification model boundary?
Status: OPEN verification-design choice.
Reason: semantic contracts are largely ready, but the model decomposition and abstraction boundary must be fixed before proof.

## Freeze conclusion
Only two unresolved behavior-changing semantic/design areas remain outside the historical compatibility branch:
1. cross-resource atomicity protocol selection;
2. exact formal-model boundary.

The historical ternary artifact is a separate BLOCKED compatibility dependency.
Concrete provider mechanisms are implementation choices and must satisfy the frozen generic contracts rather than redefine them.

## Anti-drift rule
After semantic freeze, an implementation discovery that changes a frozen contract is a CONTRADICTION requiring an explicit semantic revision record. It must not silently mutate the contract.
An implementation limitation that merely fails to satisfy a frozen contract is an IMPLEMENTATION GAP, not a semantic change.

## Result
SEMANTIC_FREEZE_PACKAGE = INDEXED
GENERIC_CONTRACTS = READY_OR_READY_WITH_EXPLICIT_UNKNOWN
BEHAVIOR_CHANGING_OPEN_CHOICES = 2
HISTORICAL_TERNARY = BLOCKED_LOCAL_DEPENDENCY
PROVIDER_MECHANISMS = IMPLEMENTATION_ADAPTERS
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.103R — adversarial audit of the two remaining behavior-changing choices: cross-resource atomicity and formal-model boundary. Goal is to determine whether either has a hidden dependency on the historical ternary branch or whether both can be isolated and frozen separately.