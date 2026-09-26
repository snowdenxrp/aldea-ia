# NEXO AB104.351 — Cross-attestation and circular trust

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS explicitly models trust relationships between Attester, Verifier, Endorser, Reference Value Provider and Relying Party, including cases where one role must establish trust in another through attestation. It also relies on configured trust anchors and appraisal policy rather than signatures alone. citeturn0search0turn0search8 The current 2026 RATS Endorsements draft further separates evidence, endorsements/reference values, and authoritative appraisal policy. citeturn0search1turn0search11

## Finding
Cross-attestation can reduce reliance on a single operator, but it does **not automatically create independence**. If A authenticates B while B's independence metadata ultimately depends on A, the evidence graph is circular and cannot establish the disputed independence claim by itself.

Candidate dependency rule:
`IndependenceEvidence(A,B) is admissible only if its support graph reaches an independent trust root for the claim, or the policy explicitly accepts the shared root.`

Candidate states:
`ACYCLICALLY_CORROBORATED | CIRCULAR_DEPENDENCY | SHARED_ROOT | UNKNOWN | CONFLICT`.

Nexo should therefore model a dependency graph for domain attestations and require a claim-specific non-circular support path. A signature authenticates the statement's issuer; it does not break a dependency cycle or prove the underlying domain separation.

## Invariants
`CROSS_ATTESTATION != AUTOMATIC_INDEPENDENCE`
`AUTHENTIC_SIGNATURE != ACYCLIC_SUPPORT`
`DEPENDENCY_CYCLE => INDEPENDENCE_UNKNOWN` unless the claim policy explicitly defines the shared root as trusted.
`SHARED_ROOT != INDEPENDENT_ROOTS`.

## Status
Exact trust-root semantics, graph closure rules and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.352 — study authenticated dependency-graph closure: how Nexo can prove that all dependencies relevant to an independence claim have been enumerated without assuming graph completeness.
