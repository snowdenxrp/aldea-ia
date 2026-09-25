# NEXO — Authority Order, Loss Algebra, Relational Claims and Composition Adversarial Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No V21. No V20 patching. No SANY/TLC/TLAPS execution.

## Objective

Stress-test AB3-G1..AB3-G8 and determine which candidate semantics survive adversarial cases before any formal TLA+ encoding.

## 1. External cross-check

Abstract interpretation supports abstraction/concretization relations and, where appropriate, Galois connections; it also supports compositional construction of complex abstract domains. Importantly, the abstraction framework is about preserving the semantics relevant to the chosen property, not automatically preserving every possible property. citeturn0search2turn0search3turn0search26

Lamport's TLA+ material confirms that refinement mappings are semantic correspondences and that auxiliary/history variables can be necessary to construct them. citeturn0search0turn0search24

These are methodological cross-checks only; they do not prove Nexo properties.

## 2. AB3-G1 — Claim-relative representation survives adversarial testing

Candidate:

Rep_P(c,a)

must be indexed by claim P.

Adversarial test:
- c contains resource incarnation R1 and R2;
- abstraction a retains only provider ID;
- accounting claim depends only on aggregate provider identity;
- historical-effect claim depends on exact incarnation.

Result:
- a may be sufficient for the accounting claim;
- a is insufficient for the historical-effect claim.

Therefore one universal abstraction-soundness bit is unsound.

Candidate invariant:
REPRESENTATION_VALIDITY_IS_CLAIM_RELATIVE.

## 3. AB3-G2 — Authority ordering

A Boolean authorized/not-authorized state is insufficient.

Candidate authority context:

A = (subject, capability, resource, scope, issuer, epoch, delegation, revocation, boundary)

Candidate partial order:

A1 <=auth A2 iff every authority assertion represented by A1 is contained in A2 under identical identity/resource/currentness/boundary semantics.

Important correction:
This ordering is not ordinary information precision.

A2 may contain more information than A1 while granting no additional authority.

Therefore:

information_precision_order != authority_order.

## 4. Authority order must be epoch-sensitive

Adversarial case:

A1 = authorized at epoch 7.
A2 = authorized at epoch 7 + current epoch 8 + revocation at epoch 8.

A naive set-based authority comparison could incorrectly treat A1 as still sufficient.

Current authority requires:
- current epoch;
- revocation closure;
- delegation validity;
- issuer validity;
- resource identity/incarnation;
- boundary.

Thus:

HISTORICAL_AUTHORITY != CURRENT_AUTHORITY.

## 5. Authority non-amplification theorem target

Candidate target:

If Rep_P(c,a) and a entails authority A# for claim P, then every concrete c' represented by a must entail authority sufficient for A# under the same P boundary.

If any represented c' lacks A#, the abstraction is authority-amplifying and cannot publish the authority claim.

This is a theorem target, not yet proven.

## 6. AB3-G3 — Loss algebra

A flat set of lost fields is inadequate.

Candidate LossAtom:

L = (distinction, scope, affected_claims, impact, dependencies, resolution_evidence, invalidators)

Candidate impact order:

BENIGN < DEGRADING < BLOCKING

UNKNOWN is not simply another loss level; it is an epistemic result about whether the omitted distinction matters.

Therefore:

LOSS_IMPACT != CLAIM_RESULT.

Candidate aggregate:
Loss(P,A) = least upper bound of claim-relevant LossAtoms under a future impact algebra.

The exact lattice is OPEN.

## 7. Loss monotonicity is directional

Adding a newly discovered loss cannot justify a stronger claim.

But adding information can sometimes:
- resolve UNKNOWN;
- reveal a violation;
- reveal that a prior claim was overbroad.

Therefore information refinement is not monotonically claim-strengthening.

Candidate:
MORE_INFORMATION => SAME_OR_STRONGER_KNOWLEDGE is not universally true when previously hidden violations are discovered.

What is safe is:
MORE_INFORMATION => CLAIM_SCOPE_MAY_STAY, SHRINK, INVALIDATE, OR BECOME_MORE_PRECISE.

## 8. AB3-G4 — k-ary relational claims

For P with relational arity k:

Rep_k(C,A,P)

must preserve the relation among the k contexts.

Adversarial case:
- C1 and C2 use distinct providers;
- abstraction retains provider class only;
- both map to the same abstract provider class.

The abstraction may erase the very distinction needed to prove independence.

Therefore:
NODE_DISTINCTNESS != INDEPENDENCE.

Independence requires a claim-specific common-mode/dependency relation.

## 9. Independence must be a relational property

Candidate independence claim:

Independent_k(C1...Ck,P)

requires no prohibited shared dependency within the defined common-mode closure.

The exact definition depends on the threat model.

Thus:
- different process IDs do not prove independence;
- different machines do not prove independence;
- different providers do not prove independence if they share a common trust/recovery/control root.

This preserves the earlier hypergraph principle.

## 10. AB3-G5 — Composition theorem target

Candidate composition theorem:

If:
1. Rep_P(c,a1);
2. Rep_P(a1,a2);
3. boundary(a2) is no wider than boundary(a1);
4. every P-required distinction in a2 is preserved through both stages;
5. composed loss is sound;
6. authority is non-amplifying at each stage;
7. currentness/history semantics are preserved;
8. relational arity is preserved;
9. required hyperedges are preserved;

then a representation relation from c to a2 may be derivable.

The word “may” is deliberate: the exact theorem still requires a formal definition of transitivity/composition.

## 11. Sequential composition is not pairwise composition

A1 can preserve a distinction D.
A2 can preserve D relative to A1.
Yet a third abstraction A3 may destroy a dependency relation that was implicit rather than explicit.

Therefore future composition must track:
- explicit distinctions;
- derived distinctions;
- hyperedges;
- boundary assumptions;
- loss closure.

Composition must be evaluated on the composed semantic context, not only local interfaces.

## 12. AB3-G6 — Witness extraction

For existential/historical claims, candidate witness package:

W = (identity, provenance, temporal_position, authority_context, resource_incarnation, causal_context, boundary, evidence_chain)

A witness is sufficient only if every required component of P is supported.

This prevents:
“some event happened”
from being promoted to:
“this specific authorized effect happened at this historical point.”

Candidate invariant:
WITNESS_IDENTITY_ALONE_IS_INSUFFICIENT.

## 13. Witnesses can be individually valid but jointly inconsistent

Adversarial case:
- witness W1 says authority epoch 4;
- witness W2 says resource incarnation 9;
- witness W3 says provider execution 12;
- each is individually valid;
- no concrete history connects all three.

Combining them naively creates a synthetic event that never existed.

Therefore:
WITNESS_SET_VALIDITY != JOINT_WITNESS_CONSISTENCY.

This is another hyperedge requirement.

## 14. AB3-G7 — Absence capability

Candidate:

AbsenceCapable(B,E,[t1,t2])

requires that boundary B covers the relevant event class E for the complete interval/scope and has sufficient observation/retention guarantees to make absence meaningful.

If any relevant observation path is outside B:

NoWitness != NoEvent.

This is stronger than merely “we looked and found nothing.”

## 15. Negative evidence has coverage requirements

To establish historical absence, candidate requirements include:
- temporal coverage;
- spatial/system coverage;
- identity coverage;
- event-class coverage;
- observation completeness;
- retention completeness;
- tamper/integrity assumptions;
- known bypass-path closure.

Missing any required coverage component yields UNKNOWN unless independently excluded.

## 16. AB3-G8 — TLA+ variable classification

Candidate rule:

A variable is ABSTRACT STATE if changing it can change the truth value of the abstract claim.

A variable is AUXILIARY/HISTORY if it is needed to establish the refinement mapping but is existentially eliminable from the abstract specification.

A variable cannot be called auxiliary merely because it is inconvenient.

Lamport's work explicitly describes history variables as auxiliary variables that remember past behavior and uses auxiliary variables to construct refinement mappings. citeturn0search0turn0search24

## 17. New finding — history can become semantic

If a claim is historical, then the relevant historical distinction is part of the claim semantics even if the implementation stores it only indirectly.

Therefore:

IMPLEMENTATION_HISTORY may be auxiliary,
but
CLAIM_REQUIRED_HISTORY cannot be semantically discarded.

This prevents an incorrect TLA+ model that proves a present-state property while the real claim is historical.

## 18. New finding — composition needs a dependency-aware product

Cousot's reduced-product literature supports combining abstract domains while exchanging information between components. citeturn0search26turn0search6

For Nexo, a naive Cartesian product of:
Authority × History × Effect × Retention

is not enough.

Candidate Nexo product must also carry:
- cross-domain hyperedges;
- dependency closure;
- common-mode relations;
- boundary assumptions;
- invalidation/currentness;
- loss/unknown propagation.

Call this provisionally:

Dependency-Aware Claim Product (DACP).

DACP is a research construct, not an implementation.

## 19. New adversarial principle — synthetic joins are unsafe

If A1, A2, A3 are separately sound summaries, joining facts from them is unsafe unless a compatibility relation proves they refer to one jointly realizable concrete context.

Therefore:

PAIRWISE_WITNESS_VALIDITY != JOINT_REALIZABILITY.

This directly generalizes the prior hypergraph finding.

## 20. Candidate invariants AD4-01..AD4-20

AD4-01 REPRESENTATION_IS_CLAIM_RELATIVE
AD4-02 INFORMATION_ORDER_AND_AUTHORITY_ORDER_ARE_DISTINCT
AD4-03 AUTHORITY_ORDER_IS_EPOCH_AND_BOUNDARY_SENSITIVE
AD4-04 ABSTRACTION_CANNOT_AMPLIFY_AUTHORITY
AD4-05 LOSS_IMPACT_IS_DISTINCT_FROM_CLAIM_RESULT
AD4-06 DISCOVERED_LOSS_CANNOT_STRENGTHEN_A_CLAIM
AD4-07 INFORMATION_REFINEMENT_MAY_SHRINK_CLAIM_SCOPE
AD4-08 RELATIONAL_CLAIMS_REQUIRE_K_ARY_SEMANTICS
AD4-09 NODE_DISTINCTNESS_DOES_NOT_PROVE_INDEPENDENCE
AD4-10 COMMON_MODE_CLOSURE_IS_REQUIRED_FOR_INDEPENDENCE
AD4-11 COMPOSITION_REQUIRES_COMPOSED_LOSS_CLOSURE
AD4-12 COMPOSITION_REQUIRES_BOUNDARY_COMPATIBILITY
AD4-13 COMPOSITION_REQUIRES_AUTHORITY_NON_AMPLIFICATION
AD4-14 WITNESS_IDENTITY_ALONE_IS_INSUFFICIENT
AD4-15 WITNESS_SET_REQUIRES_JOINT_CONSISTENCY
AD4-16 ABSENCE_REQUIRES_COVERAGE_CAPABILITY
AD4-17 NO_WITNESS_DOES_NOT_PROVE_NO_EVENT_WITHOUT_ABSENCE_CAPABILITY
AD4-18 CLAIM_REQUIRED_HISTORY_CANNOT_BE_HIDDEN_AS_SEMANTICALLY_IRRELEVANT
AD4-19 SYNTHETIC_JOINS_REQUIRE_JOINT_REALIZABILITY
AD4-20 DEPENDENCY_AWARE_PRODUCT_REQUIRES_CROSS_DOMAIN_RELATIONS

## 21. Remaining gaps

AB3-G1: representation relation still needs formal composition laws.
AB3-G2: authority partial order and revocation algebra remain open.
AB3-G3: Loss algebra/lattice remains open.
AB3-G4: formal k-ary hyperproperty semantics remains open.
AB3-G5: composition theorem remains open.
AB3-G6: formal witness extraction/realizability remains open.
AB3-G7: formal absence-capability semantics remains open.
AB3-G8: TLA+ variable derivation remains intentionally deferred.

New:
AB4-G1 formalize joint realizability of witness sets.
AB4-G2 formalize dependency-aware product.
AB4-G3 formalize common-mode closure.
AB4-G4 determine whether authority forms a partial order, preorder, or richer structure.
AB4-G5 define claim-result lattice and UNKNOWN propagation.
AB4-G6 define semantic equivalence of composed abstractions.

## Verification boundary

Research only. No implementation and no formal execution. No theorem claimed proven.
