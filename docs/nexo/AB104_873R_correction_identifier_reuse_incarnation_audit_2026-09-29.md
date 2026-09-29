# AB104.873R — correction/reversal identifier reuse + incarnation audit

Date: 2026-09-29
Parent: AB104.872R
Mode: research/audit only

## Question
Can restart/failover/incarnation boundaries cause correction/reversal identifier reuse, and does delayed reuse create a new interaction beyond I17 + I18 + I19 + I21?

## Fresh evidence
- Adyen documents PSP references as globally unique 16-character references for transactions/requests; modification references are unique identifiers for modification requests. This is provider-specific evidence that identifier reuse is excluded by contract in this domain. citeturn0search0turn0search3
- Adyen referenced refunds explicitly retain the original payment PSP reference while assigning a separate PSP reference to the refund, preserving lineage. citeturn0search6
- AWS documents that idempotency can intentionally be scoped per Region or Availability Zone; the same client token may therefore represent separate operations in different scopes. This is not correction-ID evidence, but confirms that scope must be explicit rather than inferred. citeturn0search12
- AWS ECS similarly defines idempotency within a cluster, reinforcing that identity/deduplication domains are contract-scoped. citeturn0search14

## Attack
R1 creates correction C1 for operation E1. Provider/recovery boundary creates incarnation R2. If correction identifiers are reusable, C1-id is later assigned to C2 for R2. A delayed C1 arrives after C2 exists.

## Analysis
A. Provider contract guarantees global uniqueness across the relevant lifetime: identifier collision is excluded by that provider contract. No new class.

B. Identifier is scoped to region/domain/incarnation: delayed old C1 and new C2 can share the value only if the scope is omitted. The resulting ambiguity is I18; correction semantics remain I19; stale/delayed ordering adds I21. No new class.

C. Identifier is recycled after retention expiry: this is an identity-lifetime/retention boundary. If the old event can still arrive, it combines I15 + I18 + I19 + I21. If external effect is ambiguous, class 11; if reconciliation is required, class 12.

D. Restart alone changes an identifier namespace: restart is not itself proof of a new identity domain. An explicit incarnation/generation contract is required. Without it, preserve UNKNOWN/INCOMPARABLE rather than infer lineage.

E. C1 and C2 have the same correction ID but distinct original-operation lineage: lineage wins only if the contract makes lineage authoritative. Identifier equality alone must not merge them.

## Key refinement
`IDENTIFIER_REUSE != NEW_TOP_LEVEL_INTERACTION`

Identifier reuse is a manifestation of namespace/incarnation/retention semantics. It becomes dangerous when delayed historical events cross that identity boundary. The interaction is therefore already represented by I17/I18/I19/I21 and, when applicable, I15/class 11/class 12.

Also:
`RESTART != INCARNATION_CHANGE`

A restart may preserve or change logical identity depending on the system contract; it must not be treated as an automatic new authority/identity epoch.

## Disposition
No new top-level interaction class frozen.
I17 remains distinct/untested; I18 + I19 + I21 absorb the identity/reversal case.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

## Candidate invariants
- INV-TE-51: Identifier reuse is safe only within an explicitly bounded identity/retention contract.
- INV-TE-52: Restart must not implicitly change logical identity without an explicit incarnation/generation boundary.
- INV-TE-53: Correction identifier equality must not merge events whose authoritative lineage differs.
- INV-TE-54: Delayed events crossing an expired identity namespace preserve UNKNOWN/INCOMPARABLE until lineage is established.
- INV-TE-55: Provider uniqueness guarantees are domain-specific evidence and must not be generalized to all providers.

## Next
AB104.874R — investigate restart/failover plus credential/key rotation: whether a correction from a previous credential/security principal can remain valid after rotation, and whether that produces anything beyond I17/I18/I19/I21 or exposes a distinct authentication/source-validity interaction (class 19).

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
