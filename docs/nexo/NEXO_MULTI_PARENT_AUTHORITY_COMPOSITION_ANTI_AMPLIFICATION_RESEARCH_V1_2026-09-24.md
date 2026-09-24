NEXO - MULTI-PARENT SHARED CHILD AUTHORITY / COMPOSITION / REVOCATION RACE RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
What happens when one child capability depends on two or more parents with different scopes, epochs, claim strengths and revocation states? How do we prevent authority amplification by composing permissions that no single parent authorized?

WEB CROSS-CHECKS
RFC 8693 distinguishes delegation from impersonation and describes token exchange where downstream credentials can be more narrowly scoped; it also models target audience/resource and scope as distinct constraints. This supports treating multi-parent delegation as an explicit composition policy rather than simple union of rights. cite: turn0search0, turn0search1.
RFC 9700 recommends minimum privilege and audience restriction, with the resource server checking that a token is intended for that resource. This supports target-specific enforcement at the final boundary. cite: turn0search2.
NIST SP 800-162 defines ABAC as authorization based on subject, object, requested operation and sometimes environment attributes evaluated against policy/rules. This supports treating the combined parent context as an explicit authorization input rather than merging opaque permissions. cite: turn0search3.

CORE RESULT
Multiple parents create a new authority-composition problem.
Naive union is forbidden:
ChildScope = ParentA.Scope UNION ParentB.Scope.
Because A may authorize R1 and B may authorize R2, while the child would gain R1+R2 even though no parent individually authorized that combined authority.

KEY RULE
COMPOSITION IS NOT INHERITANCE.
Every multi-parent child needs an explicit CompositionContract that defines whether parent authorities are:
- conjunctive (ALL required);
- disjunctive (ANY sufficient);
- intersection-only;
- bounded union;
- complementary for different dimensions;
- mutually exclusive;
- conditionally composable;
- or UNKNOWN.

DEFAULT SAFETY RULE
If the composition semantics are not explicitly defined, treat the combined authority as UNKNOWN and do not publish the stronger child capability.

THREE DIFFERENT OPERATIONS
1. INTERSECTION: Child rights = A ∩ B. Safest default for shared authority.
2. UNION: Child rights = A ∪ B. Potentially amplifying and requires explicit policy.
3. PRODUCT/COMPOSITION: A supplies one dimension and B another. This is the dangerous case because neither parent alone may authorize the resulting effect.

AUTHORITY AMPLIFICATION EXAMPLE
A:
scope = write(R1)
claim = RESOURCE_SAFE
epoch = A17

B:
scope = approve(R1)
claim = POLICY_APPROVED
epoch = B42

Child K:
write(R1) + approve(R1) => execute(R1).
If no parent individually authorized execute(R1), the child has synthesized a new authority.
Therefore:
ChildEffectSet cannot be inferred merely from the union or Cartesian product of parent rights.

COMPOSITION CONTRACT
Candidate fields:
- composition_id;
- parent_ids;
- required parent count/logic;
- authority dimensions supplied by each parent;
- exact operation/effect classes;
- target/resource scope;
- claim-strength requirements;
- epoch/generation bindings;
- policy/invariant versions;
- dependency closure;
- resource incarnations;
- fence requirements;
- delegation depth/budget;
- revocation semantics;
- invalidation triggers;
- linearization point;
- crash/recovery semantics;
- forbidden combinations;
- evidence requirements.

CAPABILITY DERIVATION
Child capability must be derived from a protected composition transition:
PARENTS CURRENT
→ COMPOSITION VALID
→ NO AMPLIFICATION
→ SCOPE/CLAIM/FENCE COMPATIBLE
→ CHILD_BINDING COMMITTED.

NO PARTIAL PARENT ACCEPTANCE
If K depends on A AND B, then:
A stale => K stale.
B stale => K stale.
A revoked => K stale.
B revoked => K stale.
A context incompatible => K stale.
B context incompatible => K stale.
Unless the contract explicitly defines the dependency as optional/disjunctive.

AND VS OR
AND composition:
K valid iff A_current AND B_current.
OR composition:
K may remain valid if at least one permitted parent remains current, but the resulting scope must still be within that parent's independently authorized envelope.
OR must never silently become UNION.

UNION IS SPECIAL
If union is permitted, the union itself is a new authority transition requiring an explicit authority grant.
It cannot be inferred from two independently valid parent capabilities.

COMPLEMENTARY AUTHORITIES
Sometimes A and B intentionally supply separate dimensions.
Example:
A = ability to access resource R1.
B = ability to perform operation O1.
Combining them may be legitimate only if policy explicitly says A+B can authorize O1(R1).
This is not simple inheritance; it is a policy-defined relation.

REVOCATION RACE
A and B are current at T0.
K derived.
T1: A revoked.
T2: B remains current.
K must become invalid if it is conjunctive.
If K is rederived from B alone under an OR contract, it must receive a new identity/context, not silently continue as the old K.

WHY IDENTITY MATTERS
Old K = composition(A17,B42).
After A revocation, new K = B43 alone.
These must not be the same capability identity.
Otherwise stale consumers may treat a weakened child as the old stronger child.

CLAIM STRENGTH COMPOSITION
Do not use numeric averaging or max/min without semantics.
Candidate claim composition operator must be explicit.
Examples:
CONJUNCTIVE safety claim may require both claims.
MIN operator can be sound only when claim lattice semantics justify it.
MAX is generally unsafe because it can select a strong claim whose scope/context does not cover the combined effect.
UNDEFINED => UNKNOWN.

DIFFERENT EPOCHS
A@A17 and B@B42 are not made coherent by having both current timestamps.
Need a composition context that binds both at a single protected authorization decision.
Wall-clock proximity is not semantic coherence.

DIFFERENT POLICY VERSIONS
A approved under P9.
B under P12.
If the combined effect requires one coherent policy baseline, P9/P12 mismatch invalidates composition.
If policy explicitly allows cross-version composition, that compatibility relation must itself be protected and versioned.

DIFFERENT RESOURCE INCARNATIONS
A targets R1@I7.
B targets R1@I8.
Same logical resource name does not establish same resource identity.
Child composition is UNKNOWN unless an explicit compatibility/transfer contract proves that the combination is meaningful.

DIFFERENT TRUST ROOTS
Independent trust roots can be useful, but combining them does not automatically strengthen the child claim.
If A and B are both required, the resulting claim depends on the joint trust model.
Common-mode dependencies must be included in the dependency closure.

REVOCATION PROPAGATION
For conjunctive K:
A change → K invalidation.
B change → K invalidation.
For disjunctive K:
A change may not invalidate K if B independently satisfies the entire required contract.
But partial B must not be silently combined with stale A.

STALE CACHE ATTACK
Consumer caches Kstrong = composition(A17,B42).
A revoked.
Consumer has not received invalidation.
At use time, final boundary checks current composition context.
Kstrong rejected.
This repeats the prior result: cache is candidate state, not final authority.

CHILD REDELEGATION
If K delegates K2, K2 must inherit the exact effective composition context.
K2 cannot discard parent dependencies.
Lineage must preserve:
root parents → composition contract → effective authority envelope → child.

NO PARENT DROPPING
After K2 exists, deleting one parent from its metadata does not make it valid.
Parent dependencies are part of identity and currentness.
Any change requires a new protected derivation.

QUEUED MULTI-PARENT CHILD
Queue entry must retain composition context.
Worker cannot dequeue K and reconstruct it from currently available individual parent claims using an implicit union.
The queue item identifies the exact authorized composition.

RECOVERY
After crash:
1 restore historical composition state;
2 obtain current parent contexts;
3 validate composition contract;
4 validate epochs/generations;
5 validate scope and claims;
6 validate fences/resource incarnations;
7 classify child currentness;
8 only then allow re-use.
Recovery must not recreate K from stale snapshots alone.

ROLLBACK / ABA
A17/B42 -> A18 revoked -> rollback to A17.
Old K must not become current merely because both old parent records reappear.
Continuity context must detect resurrection of an obsolete authority state.

MULTI-PARENT TRANSFER
Changing parent set is itself a new authorization transition.
K(A,B) -> K(A,C) is not a mutation of the same semantic authority.
New child identity/context is required unless an explicit continuity contract proves equivalence.

COMPOSITION GRAPH
Instead of a simple tree, authority becomes a DAG/hypergraph:
A ─┐
   ├─ Composition C1 → K1
B ─┘

K1 ─┐
    ├─ C2 → K2
C ──┘

Revocation and currentness must propagate over dependency hyperedges, not merely parent pointers.

NEW OBJECT: CompositionContract
Defines exactly how multiple parent authorities combine, which dimensions each contributes, and what combinations are forbidden.

NEW OBJECT: EffectiveAuthorityEnvelope
The result of a validated composition. It contains only rights that are explicitly justified by the composition contract; it is not the raw union of parent permissions.

NEW OBJECT: AuthorityDependencySet
Exact set of parent claims/capabilities, generations, policies, fences, resource incarnations and trust dependencies on which the child depends.

NEW OBJECT: CompositionContext
Protected snapshot of the parent dependency set plus composition semantics at child issuance/use.

NEW INVARIANT FAMILY INV-MP-01..44
01 multi-parent composition is explicit.
02 parent rights are never implicitly unioned.
03 child rights must be justified by CompositionContract.
04 conjunctive dependencies require every required parent current.
05 disjunctive dependencies never become implicit union.
06 complementary dimensions require explicit policy.
07 a child cannot gain an effect unauthorized by the composition contract.
08 parent scope attenuation is preserved.
09 parent claim-strength constraints are preserved.
10 parent target/resource constraints are preserved.
11 parent resource incarnations remain bound.
12 parent epochs/generations remain bound.
13 parent policy versions remain bound.
14 parent fence generations remain bound.
15 parent dependency closure remains bound.
16 stale parent invalidates dependent child when dependency is mandatory.
17 revoked parent invalidates dependent child when dependency is mandatory.
18 UNKNOWN parent state is not treated as CURRENT.
19 UNKNOWN composition semantics block strong child publication.
20 old child identity cannot represent a new parent set.
21 parent replacement requires explicit rederivation.
22 child re-delegation preserves all mandatory parent dependencies.
23 dropping parent metadata cannot restore authority.
24 queued child retains exact CompositionContext.
25 recovery reconstructs currentness, not authority from snapshot.
26 rollback cannot resurrect old composition authority.
27 cache cannot bypass final composition check.
28 child capability identity includes composition context.
29 child use checks current dependency set or equivalent fence.
30 composition itself has a protected linearization point.
31 composition proof is claim-specific.
32 policy-version mismatch is UNKNOWN unless compatibility is explicit.
33 resource-incarnation mismatch is UNKNOWN unless transfer is explicit.
34 different trust roots do not automatically imply stronger assurance.
35 common-mode dependencies remain visible.
36 union of claims is not equivalent to union of authority.
37 max claim strength is not automatically sound.
38 min claim strength is sound only under defined lattice semantics.
39 historical child use is not erased by parent revocation.
40 external effects remain separately reconciled.
41 multi-parent revocation closure follows dependency hyperedges.
42 no protected effect may use an unresolved composition.
43 formal refinement is required before implementation assurance.
44 formal/runtime/deployment correctness remains unproven.

CANDIDATE SAFETY PROPERTY
For any child K derived from parent dependency set D, every protected effect E admitted under K must be authorized by the explicit CompositionContract over the CURRENT state of every mandatory dependency in D.

CANDIDATE ANTI-AMPLIFICATION PROPERTY
EffectiveAuthorityEnvelope(K) must be a subset of the authority relation proven by CompositionContract(D), never an emergent union/product of parent capabilities.

IMPORTANT DISTILLATION
The clean architecture should treat multi-parent authority as a hyperedge with its own identity, lifecycle, invalidation and proof context.
Simple parent-child capability trees are insufficient once multiple authorities contribute to one effect.

NEXT ATTACK
COMPOSITION HYPERGRAPH + CYCLES + MUTUAL DELEGATION + REVOCATION + RECOVERY. Question: what happens when authority dependencies form cycles (A depends on B, B depends on C, C depends on A), and how do we prevent circular authority from bootstrapping itself or making revocation undecidable?