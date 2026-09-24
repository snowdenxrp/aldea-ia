# NEXO ASSURANCE PARTITION, STALE WITNESSES, ROOT ROTATION AND RECOVERY RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External cross-check
SPIFFE trust bundles provide a useful analogy: bundle sequence numbers are monotonic and can be used for update ordering/supersession; bundle contents are scoped to a trust domain and should not be pooled across domains; bundle maps are intended to be ingested atomically as a state-of-world view. This supports Nexo's need for explicit generation, trust-context, scope and atomic-assurance semantics, but does not prove Nexo's architecture. citeturn0search0turn0search1turn0search2

## Core result
Assurance cannot safely be treated as an unordered bag of valid evidence.

Candidate rule:
`VALID(E_i) + VALID(E_j) != VALID(COMPOSE(E_i,E_j))`

when evidence arrives across partitions, generations, root transitions, incarnations, recovery epochs or incompatible dependency closures.

The assurance object therefore needs its own versioned state machine and a protected publication boundary.

## 1. Evidence is not timeless
A signed evidence record may remain cryptographically valid after its semantic validity has expired.

Separate:
- cryptographic validity;
- contextual validity;
- freshness;
- currentness;
- authority relevance;
- claim relevance.

Candidate:
`SIGNATURE_VALID -> AUTHENTIC_RECORD`
not
`SIGNATURE_VALID -> CURRENT_ASSURANCE`.

## 2. Partitioned witness
W1 becomes partitioned at authority epoch A10 and continues observing resource incarnation I1.

Meanwhile the authoritative system advances to:
A11, fence generation 43, resource incarnation I2.

W1 later sends evidence signed under A10/I1.

The evidence can be authentic and still be unusable for a current A11/I2 claim.

Candidate state:
`AUTHENTIC_STALE`

It must not silently enter the current assurance bundle.

## 3. Late evidence is not automatically bad evidence
A late record may still be useful for:
- historical reconstruction;
- proof of an earlier state;
- causality analysis;
- reconciliation;
- detecting divergence.

Therefore late evidence should be retained but classified by context.

`LATE != INVALID`
`LATE != CURRENT`

## 4. Assurance itself needs a generation
Candidate:
`assurance_generation`

Every published assurance bundle is associated with:
- assurance generation;
- authority epoch;
- root/trust generation;
- policy generation;
- resource incarnation;
- dependency closure fingerprint;
- composition contract version.

A newer assurance generation supersedes an older one only under explicit ordering rules.

## 5. Assurance state machine
Candidate states:

`UNREQUESTED`
→ `COLLECTING`
→ `CONTEXT_FROZEN`
→ `EVIDENCE_CLASSIFIED`
→ `DEPENDENCIES_COMPUTED`
→ `COMPOSITION_ELIGIBLE`
→ `ASSURANCE_PUBLISHED`
→ `SUPERSEDED`
→ `INVALIDATED`
→ `RECONCILIATION_REQUIRED`

Additional terminal/degraded states:
`UNKNOWN`, `QUARANTINED`.

No direct:
`OLD_ASSURANCE -> CURRENT_ASSURANCE`
without a protected transition.

## 6. Context freeze
Once a claim starts composition, Nexo must freeze the required context tuple.

Candidate tuple:
- claim_id;
- effect scope;
- resource identity;
- resource incarnation;
- fence generation;
- authority epoch;
- trust/root generation;
- policy/invariant generation;
- dependency-closure generation;
- assurance composition version.

Evidence arriving after the freeze must be classified against that tuple rather than silently changing the claim underneath the composer.

## 7. Root rotation
Attack:
- W1 signs under R1;
- root rotates to R2;
- W2 signs under R2;
- both records validate under their own historical trust contexts.

They cannot be merged as one current claim unless the transition contract explicitly defines continuity across R1→R2.

SPIFFE's trust bundle model similarly uses a monotonically increasing sequence number for update ordering and supports staged key rotation, where old and new keys can coexist during a defined transition. citeturn0search0turn0search3

Candidate states:
`ROOT_STABLE`
`ROOT_TRANSITION`
`ROOT_CUTOFF`

During `ROOT_TRANSITION`, cross-generation composition requires an explicit transition proof.

## 8. Resource replacement during partition
Attack:
- W1 sees I1;
- resource is replaced and becomes I2;
- W1 remains partitioned;
- W2 sees I2;
- both report fence state.

Current containment for I2 cannot be established by combining W1/I1 with W2/I2 unless the claim explicitly concerns historical I1 and separately current I2.

Candidate rule:
`INCARNATION_MISMATCH -> SPLIT_CLAIM_OR_QUARANTINE`.

## 9. Recovery creates another generation boundary
Recovery cannot simply restore the last serialized assurance object and call it current.

Recovery must classify:
- restored authority epoch;
- restored assurance generation;
- root generation;
- resource incarnation;
- fence generation;
- evidence freshness;
- dependency closure.

A recovered assurance may become:
`RESTORED_HISTORICAL`
then require revalidation before:
`CURRENT_ASSURANCE`.

## 10. Monotonicity requirement
Candidate invariant:
`ASSURANCE_GENERATION_MUST_NOT_REGRESS`.

If persistent storage returns generation 20 after generation 21 was published, Nexo must detect the regression.

Candidate response:
`ASSURANCE_STATE_REGRESSION -> QUARANTINE`.

This parallels the monotonic sequence concept used for trust-bundle update ordering. citeturn0search0turn0search1

## 11. Atomic publication
An assurance bundle should not become visible halfway through composition.

Candidate publication transaction:
1. freeze context;
2. gather evidence IDs;
3. compute dependency closure;
4. compute independence vector;
5. verify context compatibility;
6. calculate composition result;
7. assign assurance generation;
8. persist complete bundle;
9. atomically publish pointer/current generation.

Consumers see either:
- previous complete bundle; or
- new complete bundle.

Not a partially assembled assurance state.

SPIFFE's bundle-map guidance provides a useful external analogy: the consumer should ingest the whole map atomically and regard it as the state of the world at that time. citeturn0search5

## 12. Out-of-order arrival
Evidence sequence:
E10 arrives
E12 arrives
E11 arrives later.

Nexo must not infer:
`E12 means E11 was valid/current`.

Instead:
- accept E11 as historical if valid;
- compare generations;
- recompute only if the claim's current context requires it;
- never regress published assurance.

## 13. Revalidation after late evidence
Late evidence can invalidate an existing claim if it demonstrates:
- prior false assumption;
- hidden bypass;
- resource replacement;
- root compromise;
- generation regression;
- missing dependency;
- contradictory effect.

Therefore published assurance needs invalidation hooks.

`NEW_EVIDENCE -> DEPENDENT_CLAIM_ANALYSIS -> INVALIDATE/DEGRADE/NO_CHANGE`.

This is not the same as blindly replacing the bundle with the latest record.

## 14. Root loss
W2 has current observations but its root becomes unavailable or revoked.

Its old records may remain useful historically but cannot necessarily support new current assurance.

Candidate classification:
`CURRENT_OBSERVATION + TRUST_CONTEXT_INVALID -> NOT_CURRENTLY_ASSURED`.

## 15. Partition healing
When the partition heals, do not merge all states.

Candidate sequence:
`PARTITION_HEALED`
→ `DISCOVER_DIVERGENCE`
→ `ALIGN_AUTHORITY_ORDER`
→ `CLASSIFY_EVIDENCE`
→ `CHECK_ROOT_TRANSITIONS`
→ `CHECK_INCARNATIONS`
→ `RECOMPUTE_DEPENDENCY_CLOSURE`
→ `RECONCILE_EFFECTS`
→ `RECOMPUTE_ASSURANCE`
→ `PUBLISH_NEW_GENERATION`

The old partition-local assurance remains historical unless explicitly revalidated.

## 16. Majority after recovery
Suppose five witnesses all have individually valid old records.

After recovery they agree with each other but disagree with the authoritative current state.

Five old records cannot outvote a current protected ordering transition merely by count.

Therefore:
`EVIDENCE_COUNT != AUTHORITY_ORDER`.

Assurance informs claims; it does not replace the authoritative ordering domain.

## 17. Currentness vector
Candidate:
`CurrentnessVector`

Dimensions:
- evidence timestamp/sequence;
- authority epoch;
- root generation;
- resource incarnation;
- fence generation;
- policy version;
- dependency closure version;
- observation freshness.

A claim is current only if its required dimensions satisfy the claim contract.

## 18. Assurance invalidation is monotonic in safety
When uncertainty increases, assurance may move downward:
`C7 -> C5 -> C3 -> C0/UNKNOWN`.

It must not move upward merely because no contradictory evidence has yet arrived.

Candidate principle:
`ABSENCE_OF_NEW_EVIDENCE != NEW_ASSURANCE`.

## 19. Recovery must not resurrect authority
Restoring an old assurance bundle must never itself restore authority that had expired, been revoked, fenced, or superseded.

Therefore:
`RESTORED_ASSURANCE != RESTORED_AUTHORITY`.

Authority must be re-admitted through its own protected transition.

## 20. Proposed assurance linearization boundary
The strongest conclusion of this round:

**Assurance needs its own protected publication/linearization boundary.**

Not necessarily a separate consensus system, but a clearly defined transition at which Nexo declares:

`ASSURANCE_GENERATION = G`
`CONTEXT = C`
`CLAIM = K`
`DEPENDENCY_CLOSURE = D`
`EVIDENCE_SET = E`
`COMPOSITION_RESULT = R`

and thereafter all consumers reference that immutable bundle by generation.

A later generation can supersede it; a historical generation cannot silently mutate in place.

## New invariants
AR-01: Cryptographic validity does not imply current assurance.
AR-02: Late evidence may be historical without being current.
AR-03: Assurance generations must not regress.
AR-04: Published assurance must be atomically complete.
AR-05: Context must be frozen before composition.
AR-06: Cross-root-generation evidence requires an explicit transition contract.
AR-07: Cross-resource-incarnation evidence cannot silently form one current claim.
AR-08: Recovery cannot restore assurance directly to current without revalidation.
AR-09: Recovery cannot restore authority merely by restoring assurance state.
AR-10: Out-of-order evidence cannot regress published assurance.
AR-11: New evidence may invalidate or degrade old claims through dependency analysis.
AR-12: Partition healing requires reconciliation before current assurance publication.
AR-13: Evidence count cannot replace authoritative ordering.
AR-14: Absence of contradictory evidence does not increase assurance.
AR-15: Assurance publication requires a protected linearization/publication boundary.
AR-16: Historical evidence must remain distinguishable from current evidence.
AR-17: Trust/root revocation propagates to dependent assurance claims.
AR-18: Assurance context includes dependency/common-mode closure.

## Candidate objects
- AssuranceStateMachine
- AssuranceGeneration
- AssuranceContext
- CurrentnessVector
- AssurancePublicationRecord
- AssuranceInvalidationRecord
- AssuranceContextTransition
- AssuranceRecoveryRecord
- AssuranceLineage
- AssuranceGenerationAnchor

## Architecture consequence
The architecture now has a fifth semantic boundary:

1. SafetyOrderingDomain — authoritative order/authority.
2. ProtectedEnforcementContract — external effect enforcement.
3. EnforcementAssurance — evidence about enforcement.
4. AssurancePublicationBoundary — immutable/versioned publication of a coherent assurance result.
5. External Reconciliation — what actually occurred in the world.

The fifth boundary does not replace ordering. It prevents evidence composition from becoming an unversioned, mutable side channel that can accidentally promote stale state.

## Open boundary
Next attack:
`ASSURANCE GENERATION ANCHOR FAILURE / ROLLBACK / SPLIT-BRAIN PUBLICATION`.

Scenario:
- two assurance publishers operate during partition;
- each creates generation G+1;
- both are locally valid;
- one later becomes authoritative;
- a stale publisher reappears and tries to publish its G+1 or G+2;
- persistent storage has partially rolled back;
- consumers observe different current assurance pointers.

Question:
What must anchor assurance generation and publication so that two locally valid publishers cannot both become the current assurance authority?

No correctness guarantee is claimed.
