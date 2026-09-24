# NEXO — Temporal Closure × Causal Identity × Generation Compatibility Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Determine when a later object, resource, authority context, effect, or evidence record may legitimately be treated as the continuation of an earlier one.

## 2. Core distinction
`IDENTIFIER_CONTINUITY != CAUSAL_CONTINUITY != AUTHORITY_CONTINUITY != RESOURCE_CONTINUITY`.

The same logical name, hash, provider ID, key, or generation label does not by itself prove that the later object is the same security-relevant entity.

NIST's zero-trust architecture emphasizes evaluating the current context of the requester/resource and not granting implicit trust merely from identity, location, or prior access. This supports treating current context as a separate question from historical identity. citeturn0search0turn0search1

## 3. Four identities that must remain separate

### LogicalIdentity
"What object/name does the system say this is?"

### CausalIdentity
"Is this state/effect/resource causally connected to the predecessor under the protected continuity contract?"

### AuthorityIdentity
"Is this the currently authorized authority lineage?"

### ResourceIncarnation
"Which concrete incarnation of the external resource is involved?"

A single identifier may refer to different incarnations over time.

## 4. Continuity is a claim, not an assumption
Candidate `ContinuityClaim`:
- source context
- target context
- continuity type
- property being preserved
- causal bridge
- ordering context
- dependency closure
- resource incarnation relation
- trust context
- transformations
- losses/unknowns
- invalidations
- verification method
- expiration/currentness rule.

A continuity claim must be scoped to a property.

`CONTINUITY_FOR_PROPERTY_A != CONTINUITY_FOR_ALL_PROPERTIES`.

## 5. Four continuity classes

C0 — IDENTIFIER_ONLY:
Same identifier/name. No security continuity.

C1 — REPRESENTATIONAL:
A documented transformation maps representations.

C2 — CAUSAL:
Protected evidence establishes a causal predecessor/successor relation.

C3 — SECURITY_CONTEXT:
Causal relation plus relevant authority, policy, dependency, effect-path, enforcement and trust context continuity.

C4 — AUTHORITY_CONTINUOUS:
All conditions needed to treat the successor as authorized continuation are explicitly preserved and current.

Only C4 can potentially support authority continuity, and even C4 is a claim requiring a protected transition. It is not inferred merely from C0-C3.

## 6. Resource replacement
Example:
R@incarnation0 exists at T0.
R is destroyed/replaced.
R@incarnation1 appears with the same provider resource ID.

Then:

`provider_id(R0) == provider_id(R1)`
does not imply
`R0 == R1`.

Historical evidence may still establish facts about R0. It must not silently authorize an operation against R1.

Candidate `ResourceIncarnation`:
resource_namespace
resource_id
incarnation_id
creation/activation boundary
predecessor/successor relation
provider evidence
causal/order context
trust context
fence generation
effect history
replacement reason
verification status.

## 7. Snapshot restore
A restored snapshot may reproduce an old logical state without reproducing:
- current authority;
- current lease/fence;
- current root;
- current dependency closure;
- current provider state;
- current resource incarnation;
- current external effect history.

Therefore:

`RESTORED_STATE != RESTORED_AUTHORITY`
and
`SNAPSHOT_CONTINUITY != WORLD_CONTINUITY`.

Recovery must re-establish current continuity rather than inherit it from the snapshot.

## 8. Effect identity
An effect continuation needs both:
`EffectIdentity`
and
`AttemptIdentity`.

Same effect identity can legitimately have multiple attempts; a new attempt must not silently become a new semantic effect.

But:

`EFFECT_IDENTITY_CONTINUITY != AUTHORITY_CONTINUITY`.

An old effect may still be identifiable while its authority context is revoked.

## 9. Authority continuity
A process can continue running with:
- the same process ID;
- same binary;
- same memory;
- same credential;
- same lease token;
- same operation ID.

None alone establishes current authority.

Current authority requires a current protected authority context and all required invalidation/closure checks.

This matches NIST's emphasis on continuous evaluation rather than treating initial authorization as permanently sufficient. citeturn0search1turn0search2

## 10. Generation compatibility
A generation vector should be treated as a typed semantic object, not a numeric tuple.

Candidate:
`GenerationCompatibilityClaim(A,B,P)`

where P is the protected property.

Compatibility requires:
1. same relevant semantic domain;
2. compatible policy/invariant semantics;
3. compatible trust context;
4. compatible authority ordering;
5. compatible dependency closure;
6. compatible effect-path closure;
7. compatible enforcement boundary;
8. compatible resource incarnations;
9. no intervening invalidation relevant to P;
10. causal/order bridge.

Failure or UNKNOWN => no automatic continuity.

## 11. Compatibility classes

G0 EXACT_CONTEXT:
same protected context and no relevant change.

G1 EXPLICIT_EQUIVALENT:
new context differs representationally but a verified equivalence preserves the required property.

G2 ATTENUATED:
successor context is deliberately weaker and the claim is reduced accordingly.

G3 REAUTHENTICATED:
continuity cannot be established, but a fresh protected authorization creates a new context.

G4 UNKNOWN:
insufficient information.

G5 CONFLICTED:
two incompatible successor contexts exist.

Only G0/G1 can support direct continuity for a claim, and only when the claim contract permits it. G2 can support only an explicitly weaker claim. G3 is a new authority transition, not continuity.

## 12. Temporal gap attack
T0: C0 is valid.
T1: provider replaces resource.
T2: authority is revoked.
T3: process restarts from snapshot.
T4: old operation ID is replayed.
T5: provider accepts the same textual resource ID.

Naive design:
"same operation + same resource ID = continue."

Correct design:
- resource incarnation mismatch;
- authority context stale;
- restored context stale;
- effect continuation requires new admission;
- provider acceptance is evidence of acceptance, not proof that the old authority was still valid.

Result: HOLD/QUARANTINE unless a protected continuity/reauthorization transition establishes the necessary current context.

## 13. Late evidence
Evidence at T5 may prove that an earlier event happened. It cannot automatically prove that the authority or closure at T5 is current.

Thus:
`HISTORICAL_ATTRIBUTION != CURRENT_AUTHORIZATION`.

This preserves the earlier historical-audit research.

## 14. Causal bridge
A successor claim needs an explicit bridge from predecessor to successor.

Candidate bridge types:
- SAME_OBJECT
- REPLACED_BY
- RESTORED_FROM
- DERIVED_FROM
- RETRIED_AS
- REDRIVEN_AS
- DELEGATED_FROM
- ROTATED_FROM
- MIGRATED_FROM
- RECONCILED_WITH
- UNKNOWN.

The bridge type is semantic; it cannot be inferred merely from matching IDs.

## 15. Bridge validity
A bridge needs:
`source`
`target`
`relation`
`ordering context`
`evidence`
`dependencies`
`resource incarnations`
`trust context`
`scope`
`property preserved`
`loss/unknown set`
`invalidations`.

A bridge can preserve one property while failing another.

Example:
RESTORED_FROM may preserve configuration bytes but not current authority.

## 16. Generation rollover
Numeric generations eventually wrap or are compacted.

Therefore:
`generation_number != unique historical identity`.

A safe implementation needs either:
- non-reusing monotonic identity;
- protected generation epoch;
- rollover transition with retained predecessor boundary;
- or an equivalent mechanism.

Rollover itself is a protected transition.

## 17. Forks
A context can fork:

A@G10 → B@G11
A@G10 → C@G11

Both may be locally valid but mutually incompatible.

Therefore:
`VALID(A	o B) + VALID(A	o C) != VALID(B,C)`.

Merge requires an explicit protected composition/merge contract and authoritative ordering.

This connects directly to the earlier audit-fork/merge and multi-parent authority research.

## 18. Split brain
During partition:
P1 derives successor S1.
P2 derives successor S2.

Both may have valid local credentials.

That does not prove:
`CURRENT(S1) AND CURRENT(S2)`.

If the contexts conflict, authority becomes unresolved until the SafetyOrderingDomain establishes one compatible order or a bounded safety state is entered.

## 19. Root rotation
Root R0 → R1 is not merely a new key.

It changes trust context.

Old continuity claims dependent on R0 must be classified against the root cutoff.

`ROOT_CONTINUITY != AUTHORITY_CONTINUITY`.

A successor under R1 needs a protected transition establishing:
- R1 authenticity;
- trust-context binding;
- predecessor cutoff;
- descendant invalidation where required;
- enforcement verification;
- assurance recomputation.

## 20. Schema/parser migration
A schema migration can preserve bytes or fields while changing semantics.

Therefore:
`PARSE_CONTINUITY != SEMANTIC_CONTINUITY`
and
`SCHEMA_COMPATIBILITY != AUTHORITY_COMPATIBILITY`.

A migrated object needs semantic translation/equivalence proof for the protected property.

Lamport's refinement work reinforces this direction: implementation-level state is related to higher-level state through an explicit refinement mapping rather than by assuming the two representations mean the same thing. citeturn0search14turn0search16

## 21. Formal implication
The future TLA+ model should represent causal identity and generation compatibility explicitly enough to express:
- replacement;
- restore;
- fork;
- merge;
- root rotation;
- revocation;
- provider continuation;
- resource incarnation change;
- late observation;
- partition;
- recovery.

A refinement mapping can then state how implementation objects map to abstract continuity relations instead of assuming identifier equality is semantic equality. Lamport describes refinement mappings as state functions connecting lower-level and higher-level specifications. citeturn0search14

## 22. Candidate invariants
CI-01 IDENTIFIER_CONTINUITY_DOES_NOT_IMPLY_CAUSAL_CONTINUITY
CI-02 CAUSAL_CONTINUITY_DOES_NOT_IMPLY_AUTHORITY_CONTINUITY
CI-03 RESOURCE_IDENTITY_MUST_INCLUDE_INCARNATION_WHERE_REPLACEMENT_IS_POSSIBLE
CI-04 RESTORE_DOES_NOT_RESTORE_CURRENT_AUTHORITY
CI-05 SAME_EFFECT_ID_DOES_NOT_RESTORE_CURRENT_AUTHORITY
CI-06 GENERATION_NUMBER_ALONE_DOES_NOT_PROVE_COMPATIBILITY
CI-07 CONTINUITY_IS_PROPERTY_SCOPED
CI-08 UNKNOWN_CONTINUITY_CANNOT_BE_PROMOTED_TO_CONTINUOUS_AUTHORITY
CI-09 CONFLICTING_SUCCESSORS_REQUIRE_ORDER_OR_QUARANTINE
CI-10 ROOT_ROTATION_INVALIDATES_AFFECTED_CURRENTNESS_CLAIMS
CI-11 SCHEMA/PARSER TRANSFORMATION CANNOT WIDEN SECURITY SEMANTICS
CI-12 LATE_EVIDENCE_CANNOT_CREATE_CURRENT_AUTHORITY
CI-13 SNAPSHOT_RESTORE_REQUIRES_CURRENT_CONTEXT_REVALIDATION
CI-14 FORKED_CONTEXTS_REQUIRE_EXPLICIT_MERGE/COMPOSITION
CI-15 ROLLOVER_CANNOT_REUSE_SECURITY-RELEVANT_GENERATION_IDENTITY
CI-16 NEW_AUTHORITY_AFTER_GAP_IS_REAUTHORIZATION_UNLESS_EXPLICIT_CONTINUITY_IS_PROVEN

## 23. New synthesis
We can now define a stronger concept:

`CURRENTNESS = f(identity, causal continuity, authority, closure, resource incarnation, trust context, ordering, invalidation)`.

Not:
`CURRENTNESS = identifier + generation`.

The important consequence is that currentness is derived from a protected context, not stored as a free-floating boolean.

## 24. Open gaps
CG1 Formal algebra for continuity relations.
CG2 Exact causal bridge semantics for restore/replacement/redrive/delegation.
CG3 Minimal evidence needed to prove C2/C3/C4 continuity.
CG4 Compatibility under partial dependency closure.
CG5 Fork/merge continuity with common-mode dependencies.
CG6 Generation rollover and compaction formalization.
CG7 Formal relationship between continuity and SafetyClosure fixed point.
CG8 Implementation refinement of provider/resource incarnation discovery.
CG9 Adversarial tests for identifier reuse and stale generation replay.
CG10 Long-duration causal identity retention/compaction.

## 25. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.