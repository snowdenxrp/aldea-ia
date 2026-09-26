# NEXO AB104.244 — MIGRATION GRAPH AUTHORITY, BRANCH MERGE AND NON-ESCALATION ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
A migration branch is not authoritative merely because every node is individually valid. Authority must be established for the branch as a whole, and a merge must be an explicitly authorized state transition.

## Branch authority
Candidate branch admissibility requires trusted predecessor, continuous verified lineage, semantic compatibility, current authority context, target-incarnation compatibility, migration-policy authorization, no invalidated dependency, and freshness/anti-rollback evidence.

A branch signed by an old but historically valid root can remain historical evidence while being ineligible to mutate current state after an authority transition.

## Merge rule
A merge must bind BOTH parent branch digests and the exact merge policy. Candidate fields: merge_id, parent_digests, resulting_state_digest, authority_root/epoch, target incarnation, schema/semantic versions, conflict-resolution policy, executor identity, predecessor/lineage evidence, freshness and retention.

Two branches with different state claims are not merged by choosing the newer timestamp, longer chain, or first arrival.

## Non-escalation invariant
Migration cannot increase authority merely because its transformation output contains a stronger authority value.

Candidate invariant:
MIGRATION_OUTPUT_AUTHORITY <= AUTHORITY_GRANTED_BY_AUTHENTICATED_TRANSITION

unless an explicit authority-transition record authorizes the new authority under the trusted root/configuration.

A data/schema migration therefore cannot manufacture a new root, epoch, signer eligibility, target incarnation, or effect permission.

## Attacks
1. Branch substitution: valid alternate branch from the same predecessor.
2. Merge laundering: unauthorized branch included in an authorized merge.
3. Authority smuggling: higher epoch/root copied from input without authenticated transition.
4. Partial merge: one parent committed but merge incomplete; merged state remains unavailable.
5. Merge replay: same merge_id with different parents/output => collision/conflict.
6. Concurrent merge workers: different results require claim/fence and deterministic conflict handling.
7. Old-branch resurrection: restored snapshot exposes superseded branch as current.
8. Cross-incarnation merge: state from target A merged into B without explicit rebind evidence.
9. Semantic laundering: migration makes UNKNOWN/UNVERIFIED appear COMMITTED.
10. Dependency rollback: downstream merge remains visible after required predecessor frontier is restored below it.

## Safe merge frontier
trusted anchor -> validate each parent branch -> validate merge authorization -> validate dependencies -> validate resulting state -> durable merge commit -> revalidate dependent permissions.

If any required parent/dependency is UNKNOWN, the merge remains BLOCKED/UNKNOWN and cannot authorize downstream effects.

## Concurrent workers
Local mutexes do not establish distributed authority. A merge worker must be fenced by authoritative migration scope/epoch or target-side equivalent. Same merge identity with different content is a collision, not a retry.

## External references
Raft joint consensus demonstrates the general principle that incompatible old/new configurations need an explicit overlap transition rather than direct unilateral switching. TUF separates root authority from other roles and binds metadata into coherent signed/versioned views; it explicitly addresses rollback and key compromise. PostgreSQL dependency tracking is a concrete example of dependency-aware state changes.

## Code study
GitHub code search for migration/schema/effect/reconstruction keywords returned no indexed matches in this pass. This does NOT prove absence from the repository; earlier direct code inspection remains the evidence for the prototype effect path.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

AB55 remains only the minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
Valid node != authoritative branch; valid branches != merge; merge != authority transition; timestamp/length/arrival != arbitration; schema migration != authority grant; historical root != current permission; local lock != distributed fence; partial merge != committed merge; UNKNOWN dependency != executable permission; no V21; no implementation; no unsupported verification claims.

## Exact next mission
AB104.245: migration rollback and compensation attacks — inverse migrations, authority rollback versus representation rollback, partially reversed chains, compensation as new effect, stale workers, and anti-resurrection after rollback.
