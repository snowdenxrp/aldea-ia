# NEXO COMPACTION ASSURANCE CIRCULARITY, INDEPENDENT ROOT AND CERTIFICATE SELF-JUSTIFICATION RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## Research question
Can causal closure, authority closure, claim closure, evidence retention, and compaction certificates form a circular justification that allows Nexo to erase the very information needed to justify the erasure?

## External formal-methods anchor
TLA+ treats assumptions as proof context rather than established theorems: a theorem is valid relative to its assumptions, and omitted proof steps are effectively additional assumptions. This supports a key Nexo design rule: an assurance artifact must expose its assumptions and cannot silently convert a dependency into an independently established fact. citeturn0search0turn0search12
TLA+ also distinguishes model checking from proof: TLC checks modeled behaviors/properties, while rigorous proofs may require invariance reasoning and refinement mappings. citeturn0search3turn0search14

## Core finding
The circularity attack is real at the architecture level.

A compaction certificate can become unsound if:
A. its closure proof depends on evidence that is scheduled for reclamation;
B. the evidence's currentness depends on the certificate;
C. the certificate's validity depends on a claim that the same certificate enables;
D. a second certificate is used to validate the first while both depend on each other;
E. authority closure is inferred from a historical summary whose retention was justified by the same authority closure.

Therefore:
CERTIFICATE_VALIDITY != CERTIFICATE_SELF_REFERENCE.

No certificate may be its own ultimate evidence.

## 1. Dependency graph for assurance
Introduce an explicit Assurance Dependency Graph (ADG).

Nodes:
- raw evidence
- causal summary
- authority state
- closure certificate
- claim
- compaction decision
- reclamation event
- external verification
- foundation/trust assumptions

Edges are typed:
- SUPPORTS
- DEPENDS_ON
- DERIVED_FROM
- INVALIDATES
- AUTHORIZES
- PRESERVES
- REQUIRES

A certificate is publishable only if its support subgraph is admissible and has an independent foundation boundary.

Candidate objects:
AssuranceDependencyGraph
AssuranceDependencyEdge
AssuranceRoot
CertificateDependencyClosure
IndependentAssuranceBoundary

## 2. Self-support cycle detection
Build a directed graph over assurance artifacts.

If the support graph for certificate C contains C in its own dependency closure, direct or through a cycle, then C cannot serve as an independent justification for the property that permits reclamation.

Simple rule:
C IN TRANSITIVE_DEPENDENCIES(C) -> SELF_SUPPORT -> INVALID_FOR_RECLAMATION

More generally, if an SCC contains certificates/claims/evidence where every support path ultimately stays inside that SCC and there is no trusted external support edge, the SCC is not an independent proof foundation.

This does not mean every cycle is forbidden operationally. Coordination cycles may exist. The restriction is on assurance independence, not arbitrary graph structure.

## 3. Independent root
The minimum required root is not necessarily one server or one human. It is an independently established fact/authority source that is not itself justified by the artifacts being reclaimed.

Candidate AssuranceRoot classes:
- protected immutable policy/invariant baseline;
- independently verified resource-side fence state;
- independently generated cryptographic attestation;
- formally checked theorem/specification whose assumptions are separately closed;
- external authoritative state with a documented trust boundary.

A root is only independent relative to a claim. A different host or service does not automatically create independence.

This preserves the earlier rule:
PROCESS SEPARATION != ASSURANCE INDEPENDENCE.

## 4. Circular closure attack
Attempted cycle:

CAUSAL_CLOSURE
→ proves history can be summarized
→ SUMMARY_CERTIFICATE
→ proves evidence may be compacted
→ EVIDENCE_COMPACTION
→ proves CAUSAL_CLOSURE

This must fail because the final step uses an artifact whose validity depends on the first step.

Required break:
EXTERNAL/FOUNDATIONAL SUPPORT → CAUSAL_CLOSURE
or
EXTERNAL/FOUNDATIONAL SUPPORT → CLAIM_CLOSURE
or an independently checked formal theorem establishing the abstraction relation.

## 5. Mutual certificate attack
C1 says: C2 proves the relevant historical residue is retained.
C2 says: C1 proves the authority closure that makes C2 current.

If C1 and C2 are the only support for each other:
C1 <-> C2
then neither is an independent foundation.

A cycle may become admissible only if there is an external root R such that:
R -> C1
and
R -> C2
and the mutual dependencies are coordination/derivation relations whose soundness is independently established.

## 6. Evidence-under-reclamation attack
Dangerous sequence:
1. certificate C says evidence E is no longer needed;
2. E is reclaimed;
3. C later becomes invalid due to dependency drift;
4. Nexo needs E to recompute the original claim;
5. E no longer exists.

This proves that compaction needs not only a validity condition but a future invalidation/revalidation policy.

Candidate ReclamationRollbackBoundary.

Raw evidence may be deleted only if the retained summary supports every permitted invalidation path for the certificate's lifetime.

Otherwise reclamation is irreversible information loss that can turn future uncertainty into false certainty.

## 7. Authority closure attack
Suppose authority closure says all old capabilities are fenced.
But the proof of fencing is stored only in evidence E.
The compaction certificate allows E to be deleted.
Then the certificate itself cannot later demonstrate that authority closure still holds after a crash/recovery.

Therefore AUTHORITY_CLOSURE_PROOF must have a durable current representation independent of the raw evidence it permits deleting.

Candidate EnforcementClosureCertificate.

It should bind:
- effect boundary;
- enforcement mechanism;
- current fence generation;
- provider/resource identity;
- verification method;
- verification context;
- invalidation conditions.

## 8. Claim closure attack
A claim can depend on a causal summary.
The causal summary can depend on a compaction certificate.
The certificate can depend on the claim.

That is an assurance cycle.

Candidate rule:
CLAIM_USED_TO_JUSTIFY_ITS_OWN_INFORMATION_DELETION -> DENY

A claim may be a consumer of a summary but cannot be the sole independent justification for deleting the information necessary to validate that claim.

## 9. Crash between summary commit and reclamation
The sequence needs an explicit protected boundary:

PREPARE_COMPACTION
→ VERIFY_SUPPORT_GRAPH
→ COMMIT_SUMMARY
→ COMMIT_RECLAMATION_AUTHORIZATION
→ RECLAIM

If crash occurs after summary commit but before reclamation, recovery may safely retain both.

If crash occurs after reclamation, recovery must rely on the summary plus independent root.

The architecture must never require the deleted raw history to prove that its deletion was safe after the deletion has become durable.

## 10. Two-phase reclamation candidate
A safer candidate protocol:

COMPACTION_REQUEST
→ FREEZE_RELEVANT_CONTEXT
→ BUILD_ASSURANCE_DEPENDENCY_GRAPH
→ DETECT_SUPPORT_CYCLES
→ ESTABLISH_INDEPENDENT_ROOT
→ VERIFY_CLOSURE
→ COMMIT_CAUSAL_SUMMARY
→ COMMIT_RECLAMATION_BOUNDARY
→ RECLAIM
→ VERIFY_POST_RECLAMATION_ASSURANCE

If post-reclamation verification cannot succeed from retained state, the reclamation claim must be weaker or the raw history retained.

## 11. New invariants
CR-01: No reclamation certificate may be its own ultimate support.
CR-02: A support cycle without an independent root cannot establish an assurance claim.
CR-03: Information deletion MUST NOT destroy the only evidence required to detect future invalidation of the deletion decision.
CR-04: Authority closure MUST have a durable representation independent of the raw evidence it permits reclaiming.
CR-05: A claim MUST NOT justify deletion of information whose future validity is required to revalidate that same claim.
CR-06: Mutual certificates require an independent foundation; mutual dependency alone is insufficient.
CR-07: Crash recovery after reclamation MUST NOT require deleted raw history.
CR-08: Independence is claim-specific and must include common-mode dependency closure.
CR-09: A certificate's assumptions must be explicit, versioned, and invalidatable.
CR-10: If the support graph cannot be shown acyclic relative to its independent root, the safe result is HOLD/RETAIN/QUARANTINE.

## New objects
- AssuranceDependencyGraph
- AssuranceDependencyEdge
- AssuranceRoot
- CertificateDependencyClosure
- IndependentAssuranceBoundary
- EnforcementClosureCertificate
- ReclamationRollbackBoundary
- CompactionClaimContext
- AssuranceSCC
- AssuranceFoundation

## Important distinction
ASSURANCE CYCLE != AUTHORITY CYCLE.

An authority graph may contain coordination cycles under explicit composition rules. An assurance cycle is dangerous specifically when a claim is being justified only by artifacts that depend on that same claim or on the deletion it authorizes.

This is consistent with formal-methods practice: assumptions belong in the proof context and are not silently elevated into proved facts. citeturn0search0turn0search13

## Preliminary architecture consequence
The Assurance Plane must be treated as a separate protected domain with its own dependency graph.

The clean architecture should eventually distinguish:
1. EFFECT GRAPH
2. AUTHORITY GRAPH
3. CAUSAL/INFORMATION GRAPH
4. ASSURANCE DEPENDENCY GRAPH

Cross-graph claims must identify which graph supplies the independent root.

## Next unresolved attack
The next attack is stronger:
INDEPENDENT ROOT ROTATION / COMPROMISE DURING COMPACTION.

Questions:
- What if the root used to justify compaction is revoked immediately afterward?
- Can a new root validate a summary created under the old root?
- Does root rotation invalidate the compaction certificate?
- What if root A and root B overlap during transition?
- Can a snapshot restore an old assurance root?
- What happens if root compromise is discovered after raw history has already been reclaimed?
- Can root rotation itself depend on the compacted evidence?

No correctness guarantee is claimed.
