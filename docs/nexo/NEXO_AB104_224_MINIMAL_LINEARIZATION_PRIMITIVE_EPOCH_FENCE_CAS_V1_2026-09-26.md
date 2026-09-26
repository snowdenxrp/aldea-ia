# NEXO AB104.224 — MINIMAL LINEARIZATION PRIMITIVE: EPOCH vs FENCE vs CONDITIONAL VERSION V1 — 2026-09-26

## Status
Research/study only. No architecture implementation, no V21, no formal verification claim.

## Mission
Compare three candidate primitives for ordering authority revocation/rotation against effect acceptance: authority epoch; resource-scoped fencing token; target-side conditional version/CAS.

## Findings

### 1. Authority epoch
An authority epoch identifies the generation under which an authorization was issued and lets E2 supersede E1. It is useful for root rotation, revocation and replay rejection.
A worker-held epoch is insufficient. The target must have an authoritative current epoch and reject older epochs at the acceptance boundary.
Limitation: a global epoch can be too coarse unless scope is carefully defined.

### 2. Resource-scoped fencing token
A monotonically increasing token attached to a resource gives a direct stale-worker property: the resource remembers the highest accepted fence and rejects older tokens.
This matches the classic fencing-token pattern: a delayed client holding an older token is rejected by the protected resource. The resource server must actively check the token; client-side lease expiration alone is insufficient. External reference: Kleppmann. citeturn0search0
Candidate invariant: presented_fence < target_current_fence => REJECT
Remaining problem: fence state needs continuity across target restore, cloning and resource reincarnation. A rollbackable counter can re-enable an old token.

### 3. Conditional target version / CAS
A target-side compare-and-set condition can provide a linearization point when the target atomically checks expected version and performs the effect/state transition.
Conceptually: ACCEPT(effect) iff target.version == expected_version; then atomically advance/commit.
Limitation: if the effect is external to the versioned target, a local CAS does not automatically fence that external boundary.

## Comparison
| Primitive | Stale worker defense | Scope | Main weakness |
|---|---|---|---|
| authority epoch | strong only if target enforces it | global or scoped | potentially coarse; target must know current epoch |
| resource fencing token | direct and resource-specific | resource/incarnation | counter/anchor must survive rollback/clone |
| conditional target version | strong when effect is atomic with target state | target object | insufficient if effect crosses another boundary |

No final architecture choice is made.

## Minimal safety boundary discovered
The minimum useful primitive is not merely an authorization artifact. It is a target-enforced conditional acceptance rule whose ordering is tied to authority freshness.
A generic form is: accept(effect, authority_context, expected_target_state) -> atomically verify current authority/resource state -> accept or reject -> produce bound evidence.
A worker-side check before this point is only advisory evidence.

## Race matrix
1. E1 authorization -> E2 revocation -> stale E1 reaches target. Target fence/version rejects: NOT_COMMITTED only if rejection semantics guarantee no acceptance. Without target fencing, effect may occur and outcome can be UNKNOWN.
2. E1 accepted -> E2 revocation. Historical effect remains E1-authorized; revocation changes future admissibility.
3. E2 revocation -> delayed E1. Target must reject stale E1.
4. Target restore rolls fence from 41 to 33. Old token 34 could become acceptable again unless rollback-resistant continuity exists.
5. Resource destroyed/recreated with same ID. Fence must bind resource incarnation, not only resource ID.
6. Two devices hold E1 during partition. Both may have valid historical authority; only target current acceptance prevents stale effects after E2.
7. Partial/streaming effect. Fence must apply at the actual child-effect boundary, not only the parent request.

## RATS/TUF cross-check
RATS separates Verifier appraisal from Relying Party authorization and states that freshness is policy-dependent. It also notes that state may change immediately after evidence is generated, so freshness alone does not eliminate races. citeturn0search1
TUF snapshot metadata binds a coherent view so clients cannot be shown individually valid metadata combined from different times, while Timestamp provides freshness/expiration behavior. This supports separating validity, coherence and freshness. citeturn0search2turn0search3

## Restore/clone consequence
AB104.201-203 established that atomic durable storage and authenticity do not automatically provide anti-rollback authority continuity.
Therefore fencing must be evaluated with target rollback, backup restore, device clone, resource reincarnation, root rotation, device replacement and multi-device quorum.

## Current repository study
Repeated searches for getStateVersion, stateVersion, idempotencyKey, and effectJournal through the available GitHub code-search surface returned no search matches in this pass. This does NOT override the direct file inspection already performed in AB104.223. No implementation is being added.

## Open questions for AB104.225
1. Can target-side CAS and a resource fence be composed without contradictory authorities?
2. What exact durable tuple must survive restore to prevent fence rollback?
3. How should resource incarnation be generated and retired?
4. How should global authority epochs interact with per-resource fences?
5. What happens when revocation is authoritative but the target is partitioned?
6. Can an effect be accepted during partition while preserving a deterministic linearization history?
7. How do partial/streaming child effects inherit or advance fences?
8. What evidence proves a stale rejection crossed no external effect boundary?
9. What happens when target state and authority root are restored from different snapshots?

## AB50→AB58 residuals
Unchanged: TERNARY_MATH_GAP = FOUND; TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION = UNKNOWN; EVENTDAG_CLOSURE = PARTIAL; RECONSTRUCTION = BOUNDED_ONLY; SEMANTIC_FREEZE = NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED.
AB55 was only minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks.

## DO-NOT-REPEAT
- epoch carried by worker != target-enforced freshness
- fencing token != safe if token state can rollback
- local CAS != external fencing unless it guards the actual effect boundary
- historical authorization != current permission
- valid signature != current authority
- revocation != historical erasure
- rejection != NOT_COMMITTED unless rejection semantics guarantee non-acceptance
- no V21
- no architecture implementation
- no unsupported verification claims

## Exact next mission
AB104.225: attack composition of global authority epoch + resource-scoped fence + target CAS, with restore/clone/partition and partial-effect interleavings; continue actual code study and external research.