# NEXO AB17 — CROSS-ENTITY BINDING, DOMAIN COVERAGE, REDUCED-PRODUCT MINIMIZATION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## External cross-check

Lamport's refinement material confirms that history variables can support refinement mappings and that refinement may require information not present in the higher-level state. Cousot's reduced-product work supports combining abstract components by exchanging observations so that relations between components improve precision; abstraction should be chosen in the context of the property being modeled. These are methodological references, not evidence that the Nexo model is correct.

## 1. Cross-entity binding is not optional architecturally

AB16 exposed a limitation of singleton identity domains. The first model can use singleton Subjects/Resources/Operations only if it explicitly excludes cross-entity binding attacks.

But P_AA itself contains a matching relation:
Matches(a,e,t)

Therefore subject/resource/operation binding is semantically part of the claim unless the boundary contract explicitly fixes those identities.

A stronger first model should therefore use two values for at least:
- subjects
- resources
- operations

This permits the smallest direct cross-binding countermodels.

## 2. New cross-entity countermodels

CM-AA34 — cross-subject lease reuse:
Lease authorized for S1 is presented by S2.

CM-AA35 — cross-resource lease reuse:
Lease authorized for R1@I1 is presented for R2@I1.

CM-AA36 — cross-operation lease reuse:
Lease authorized for O1/A1 is presented for O2/A2.

CM-AA37 — cross-entity composite alias:
A composite token encodes subject and resource but omits operation binding; token is accepted for another operation.

CM-AA38 — subject-resource substitution:
All scalar authority fields remain individually valid, but the subject-resource pair is not the pair that was authorized.

CM-AA39 — operation-resource substitution:
Operation is authorized but for a different resource.

CM-AA40 — attempt cross-binding:
A1's binding is attached to A2 while operation identity remains the same.

These establish that the claim is relational, not a collection of independent scalar checks.

## 3. Consequence: reduced product, not independent fields

A Cartesian tuple such as:

(subjectDomain × resourceDomain × operationDomain × authorityDomain ...)

does not by itself encode which combinations are jointly authorized.

The abstract state therefore needs a relational binding component, or a reduction relation that exchanges observations among components.

Candidate:
BindingRelationContext

with relations:
subject ↔ resource
subject ↔ operation
operation ↔ resource
operation ↔ attempt
binding ↔ authority
binding ↔ incarnation
binding ↔ policy
binding ↔ delegation
binding ↔ fence

This is exactly where a reduced-product interpretation is useful: independent components are reduced using cross-component observations rather than treated as independent truths.

## 4. Important distinction

The existence of a reduced product does NOT mean we need to store all relations explicitly.

The semantic requirement is:

If two concrete states differ in a relation that P_AA can observe in a future continuation, the abstraction must not merge them.

Thus relational context may be:
- explicit state,
- a canonical composite binding identifier,
- a derived relation,
- or auxiliary history,
provided Rep_AA can recover it.

## 5. Updated semantic state candidate

AAState** candidate:

AuthorityContext
ResourceIncarnation
PolicyContext
DelegationContext
FenceLeaseContext
AdmissionBindingClass

plus a claim-relative BindingRelationContext if those relations are not derivable from the above.

PendingDecision remains conditional.

This is a reduction, not yet a proof of minimality.

## 6. Can BindingRelationContext be eliminated?

Candidate elimination condition:

BindingRelationContext is removable if:

Matches(subject, operation, resource, attempt, authority, policy, delegation, fence)

is functionally derivable from the retained composite binding and contexts.

If not, it is semantically required.

A composite identifier can replace the relation only if its construction is injective over all P_AA-relevant tuples.

Therefore:

COMPOSITE_ID != RELATIONAL_BINDING unless injectivity/decodability is established.

## 7. Finite-domain candidate revision

For the stronger first model:

Subjects = 2
Operations = 2
Attempts = 2
Resources = 2
ResourceIncarnations = 2
AuthorityEpochs = 2
Policies = 2
Delegations = 2
Fences/Leases = 2
Capabilities/Scopes = 2
TemporalPositions >= 3

The model remains intentionally finite and bounded.

The use of 2 for each identity domain is not claimed mathematically minimal. It is the smallest direct basis that can express the discovered cross-binding substitutions.

## 8. Symmetry reduction

Because the two subjects/resources/operations are initially structurally symmetric, one may be used as a distinguished witness and the other as a substitution target.

This can reduce reasoning burden without collapsing the semantic domain to one value.

However, any symmetry reduction must preserve the relational bindings being tested.

## 9. New countermodel: relationally valid scalars, invalid tuple

CM-AA41:
Subject S1 is authorized.
Resource R1 is valid.
Operation O1 is valid.
Authority epoch is current.
Policy is compatible.
Delegation is valid.
Fence is fresh.

But the authorization relation is:
S1 -> O1 -> R2

while admission requests:
S1 -> O1 -> R1.

All scalar predicates pass; the joint tuple is not authorized.

This directly reinforces:

PAIRWISE/SCALAR VALIDITY != JOINT RELATIONAL VALIDITY.

The hypergraph work from earlier rounds is therefore relevant even to the first narrow claim.

## 10. Lease reduction attack

Attempt to replace PendingDecision with FenceLeaseContext.

The lease must bind the full relational tuple, not merely scalar fields:

(subject, operation, attempt, resource, incarnation, authority, policy, delegation, boundary)

Otherwise CM-AA34..41 can bypass the bridge.

Therefore a lease is not merely:
lease_id + expiry.

It is a claim-scoped authorization bridge.

## 11. New countermodels against lease binding

CM-AA42 — lease has subject/resource but not operation.
CM-AA43 — lease has operation/resource but not subject.
CM-AA44 — lease binds operation/attempt but not resource incarnation.
CM-AA45 — lease binds all identities but not policy compatibility.
CM-AA46 — lease binds policy but not delegation.
CM-AA47 — lease binds all above but not boundary/scope.

Each is a distinct omission attack.

## 12. Exact finite coverage contract

The first finite model now has two possible modes:

MODE-NARROW:
singleton identity domains with explicit assumptions excluding cross-entity binding.

MODE-COVERAGE:
two-element identity domains and direct testing of cross-entity binding.

Given that the claim explicitly contains Matches(a,e,t), MODE-COVERAGE is the more semantically faithful research model. This is a coverage statement, not an evaluative ranking.

## 13. Minimality status

We can now distinguish three notions:

Field minimality:
fewest stored fields.

Semantic minimality:
fewest abstract distinctions needed to preserve P_AA.

Model-domain minimality:
fewest finite values needed to exercise the chosen countermodel families.

These are not equivalent.

A representation may have more implementation fields but fewer semantic classes through a canonical relation, or vice versa.

## 14. Candidate invariants

AD17-01 P_AA_MATCHING_IS_RELATIONAL
AD17-02 CROSS_ENTITY_BINDING_IS_CLAIM_RELEVANT
AD17-03 SINGLETON_ID_DOMAINS_REQUIRE_EXPLICIT_SCOPE_EXCLUSION
AD17-04 TWO_ELEMENT_ID_DOMAINS_CAPTURE_BASIC_SUBSTITUTION_ATTACKS
AD17-05 SCALAR_VALIDITY_DOES_NOT_IMPLY_TUPLE_VALIDITY
AD17-06 COMPOSITE_ID_REQUIRES_PAA_RELEVANT_INJECTIVITY
AD17-07 REDUCED_PRODUCT_MUST_PRESERVE_REQUIRED_RELATIONS
AD17-08 LEASE_IS_A_CLAIM_SCOPED_BRIDGE_NOT_A_RAW_TOKEN
AD17-09 LEASE_BINDING_MUST_INCLUDE_REQUIRED_RELATIONAL_TUPLE
AD17-10 SYMMETRY_REDUCTION_MUST_PRESERVE_BINDING_COUNTERMODELS
AD17-11 FIELD_MINIMALITY_IS_NOT_SEMANTIC_MINIMALITY
AD17-12 SEMANTIC_MINIMALITY_IS_NOT_DOMAIN_MINIMALITY
AD17-13 PENDING_DECISION_REDUCTION_REQUIRES_COMPLETE_BRIDGE
AD17-14 NO_RELATIONAL_AUTHORITY_AMPLIFICATION

## 15. AB17 status

G1 advanced — cross-entity binding attacked.
G2 advanced — identity domains expanded to two as coverage candidate.
G3 advanced — reduced-product requirement clarified.
G4 advanced — composite binding elimination criterion.
G5 advanced — lease bridge attacked.
G6 advanced — finite-domain coverage contract.
G7 open — exact relational quotient.
G8 open — final Rep_AA completeness.
G9 open — TLA+.

## 16. AB18 frontier

1. Derive the exact relational binding predicate.
2. Determine whether BindingRelationContext can be reduced into AdmissionBindingClass.
3. Attack the reduced relation with all CM-AA34..47.
4. Determine exact lease/fence relational tuple and whether PendingDecision disappears.
5. Build a final CM-AA coverage matrix.
6. Derive the smallest semantic quotient, not merely the smallest field set.
7. Only then draft the first TLA+ model.
