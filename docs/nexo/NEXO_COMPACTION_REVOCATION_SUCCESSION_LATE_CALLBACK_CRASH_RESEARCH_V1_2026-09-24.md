# NEXO COMPACTION REVOCATION SUCCESSION LATE CALLBACK CRASH RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY.
NO V21 IMPLEMENTATION.
NO V20 PATCH.
NO CORRECTNESS CLAIM.
NO SANY/TLC/TLAPS EXECUTION CLAIM.

## Research target
Attack the boundary where authority loss or constitutional succession overlaps with memory compaction/reclamation.

Target property:
NO_RECLAMATION_MAY_ERASE_INFORMATION_REQUIRED_TO_PROVE_OR_FENCE_AUTHORITY_SUCCESSION.

## External formal-methods cross-check
TLA+ treats concurrent/distributed designs as state-machine specifications and supports invariants over all reachable behaviors. TLC is an explicit-state model checker; SANY checks syntax and some semantic errors; TLAPS mechanically checks formal proofs. Refinement mappings are used to relate an implementation specification to a higher-level specification. These tools establish a verification workflow, not automatic correctness of an unmodeled architecture.
Sources:
- Lamport TLA+ Tools: https://lamport.azurewebsites.net/tla/tools.html
- Lamport invariance/refinement material: https://lamport.azurewebsites.net/tla/proving-safety.pdf
- Lamport auxiliary variables/refinement mappings: https://lamport.azurewebsites.net/pubs/auxiliary.pdf

Raft provides a useful analogy for why committed ordering and leadership changes cannot be treated as local history: committed log entries are durable and later leaders must preserve committed state. This is an analogy only, not a proof of Nexo semantics.
Source:
- Raft paper: https://raft.github.io/raft.pdf

## Core distinctions
COMPACTION_VALID != CURRENT_AUTHORITY.
SUMMARY_COMPLETE_FOR_CLAIM != WORLD_HISTORY_COMPLETE.
HISTORY_RECLAIMED != EFFECT_ERASED.
TOMBSTONE != PROOF_OF_NO_CONTINUATION.
COMPACTION_CERTIFICATE != CURRENT_SUCCESSION_AUTHORITY.
RESTORED_SUMMARY != RESTORED_AUTHORITY.
LATE_CALLBACK != CURRENT_AUTHORITY.
LATE_CALLBACK != AUTOMATICALLY_INVALID.
REVOCATION_RECORD_RETAINED != REVOCATION_ENFORCED.
PREDECESSOR_CUTOFF_RECORDED != PREDECESSOR_FENCED.
PREDECESSOR_FENCED != EXTERNAL_WORLD_QUIESCENT.

## Threat scenario
1. Authority A is current.
2. A grants capabilities and protected effects.
3. Revocation or constitutional succession begins.
4. Some raw history is selected for compaction.
5. A successor B is prepared but not yet current.
6. A late callback, queued retry, provider continuation, stale worker, or restored snapshot appears.
7. A crashes during or after compaction.
8. B attempts to prove A is fenced and its descendants are invalid.
9. If the only surviving evidence was summarized incorrectly, B could either:
   - falsely accept stale authority, or
   - conservatively lose useful assurance and remain unavailable.
10. The safe failure is the second outcome.

## New principal
Succession is itself a protected claim whose historical support has a retention floor.

Candidate object:
SuccessionRetentionBoundary
Fields:
- boundary_id
- predecessor_authority_context
- successor_candidate_context
- authority_cutoff
- constitutional_order_position
- affected_capability_generations
- delegated_descendant_generations
- effect_identity_set
- provider_continuation_set
- queue/retry/callback closure
- resource_incarnation_set
- fence generations
- stop/recovery generations
- dependency/common-mode fingerprint
- UNKNOWN set
- retained historical residue
- summary/certificate dependencies
- minimum permitted claim class
- reclamation restrictions
- invalidation triggers
- owner/current authority
- verification method

## Authority history residue
Not all raw history must survive, but every future safety claim must retain enough information to reconstruct the predicates it depends on.

Candidate:
AuthorityHistorySummary
Must preserve, at minimum:
- predecessor identity and incarnation
- predecessor authority epoch/generation
- exact cutoff ordering position
- scope of cutoff
- descendant capability lineage affected
- revocation/invalidation generation
- fencing generation and enforcement status
- protected effect identities crossing the cutoff
- unresolved external effects
- provider continuation classes
- resource incarnations
- recovery ownership/context
- root/trust context and transition identity
- dependencies and common-mode assumptions
- UNKNOWN states
- evidence/claim generation
- invalidation triggers
- provenance to retained or independently rooted evidence

A summary that omits one of these only supports claims whose scope excludes the omitted dimension.

## Revocation compaction attack
Raw revocation event R is reclaimed.
Only summary S remains.
A late capability C presents after compaction.

Unsafe inference:
S says C belonged to revoked generation -> therefore C cannot execute.

Why unsafe:
- C may have been reissued under a later valid context.
- C may be a delegated descendant whose lineage was not included.
- C may be bound to a replacement resource incarnation.
- C may be a provider continuation not represented as a local capability.
- S may have been created under a root/policy context later revoked.
- S may not cover all effect-capable boundaries.

Required response:
C is admissible only if current authority, lineage, scope, context, fence, resource incarnation, and effect boundary are all validated. Historical summary is evidence/context, not authority.

## Late callback attack
A callback arrives after compaction.

Callback classes:
1. Evidence-only callback for an already closed effect.
2. Continuation-capable callback.
3. Retry/redrive trigger.
4. Compensation trigger.
5. Provider state notification.
6. Delegated child activation.
7. Recovery/update/bootstrap continuation.

Only class 1 can be treated as non-authoritative by construction. Classes 2-7 are effect paths and must remain inside closure or be rejected/fenced.

Therefore:
LATE_CALLBACK -> CLASSIFY -> BIND_TO_EFFECT_IDENTITY/ATTEMPT_LINEAGE -> CHECK_AUTHORITY_CONTEXT -> CHECK_REVOCATION/CUTOFF -> CHECK_RESOURCE_INCARNATION -> CHECK_PROVIDER_ENFORCEMENT -> RECONCILE OR REJECT.

## Compaction certificate circularity
Attack:
C says summary S is complete.
C is the reason raw evidence E can be reclaimed.
Later succession needs E to validate C.
If C's own validity depends on E, then reclamation destroys its support.

Rule:
CLAIM_USED_TO_JUSTIFY_ITS_OWN_INFORMATION_DELETION -> DENY.

The compaction certificate must have an assurance dependency closure independent of the raw evidence it authorizes reclaiming, or retain a durable summary/tombstone that is independently sufficient for the permitted claim.

## Root rotation during succession
A summary produced under root generation R0 remains syntactically authentic after R0 is revoked.

Unsafe:
SIGNATURE_VALID -> CURRENT_SUCCESSION_ASSURANCE.

Required:
ROOT_CUTOFF -> identify all summaries/certificates/claims relying on R0 -> invalidate or downgrade -> revalidate under R1.

Root reliance metadata must survive the raw evidence whose reclamation it authorized.

Candidate:
CompactionSuccessorDependencyClosure
tracks:
- root/trust generation
- successor transition
- predecessor cutoff
- authority epoch
- capability generations
- assurance/compaction certificate dependencies
- evidence retained/reclaimed
- external effect uncertainty
- provider continuation closure
- resource incarnations
- dependency/common-mode assumptions.

## Crash windows
W0 before compaction preparation: no reclamation.
W1 summary prepared but not committed: raw history must remain.
W2 summary committed, reclamation authorization not committed: raw history remains.
W3 reclamation authorization committed, reclamation incomplete: recovery must resume from durable boundary without assuming full deletion.
W4 reclamation partially completed: surviving residue plus summary must conservatively determine permitted claims.
W5 reclamation complete, successor pending: summary must carry the full retention floor for successor-relevant claims.
W6 successor committed, assurance not published: currentness reconstructed from authoritative order, not publication progress.
W7 successor active, late callback arrives: callback classified against successor/predecessor contexts.
W8 root rotation invalidates summary: summary becomes historical-only/degraded unless revalidated.
W9 crash and snapshot restore: snapshot cannot resurrect authority or erase a later cutoff.

## Safe reclamation protocol
DETECT_SUCCESSION_DEPENDENCY
-> FREEZE_RECLAMATION_FOR_AFFECTED_SCOPE
-> COMPUTE_AUTHORITY_HISTORY CLOSURE
-> COMPUTE_EFFECT-PATH / DELEGATION / PROVIDER CONTINUATION CLOSURE
-> IDENTIFY_UNKNOWN AND RESOURCE INCARNATION SET
-> COMPUTE_MINIMUM_RETENTION FLOOR
-> VERIFY_SUMMARY_INDEPENDENCE_AND_NON-CIRCULARITY
-> COMMIT_SUCCESSION-RELEVANT_SUMMARY
-> COMMIT_RECLAMATION_AUTHORIZATION
-> RECLAIM
-> AFTER_SUCCESSION_REVALIDATE_SUMMARY_AND_CLAIMS.

Reclamation is therefore downstream of authority ordering and assurance, not an independent housekeeping operation.

## Retention classes
R0 FULL_RAW: retain raw history.
R1 SUCCESSION_CRITICAL: retain compacted historical residue sufficient for predecessor cutoff/fencing/descendant invalidation.
R2 CLAIM_SCOPED: retain only what supports a bounded claim.
R3 HISTORICAL_PROVENANCE: retain enough for historical audit but not current safety.
R4 RECLAIMABLE: safe to delete only when no active claim, succession, recovery, reconciliation, or effect-path dependency requires it.

The transition R4 must be protected and claim-scoped.

## Safe downgrade
If compaction leaves insufficient information for a stronger claim:
- do not reconstruct missing history by inference;
- degrade claim scope;
- preserve UNKNOWN;
- fence effect paths if required;
- enter AUTHORITY_UNAVAILABLE or QUARANTINED when exclusivity cannot be established.

This follows the broader architecture rule:
CLAIM_SCOPE <= VERIFIED_CLOSURE_SCOPE.

## Succession retention floor
Candidate theorem-like design condition:
A reclamation is admissible only if every protected future claim required for succession can be established from:
1. retained raw evidence,
2. a causally complete summary,
3. independently rooted enforcement evidence,
4. authoritative ordering,
5. current trust/policy/invariant context,
6. complete required effect-path closure,
7. explicit UNKNOWN states,
8. current resource incarnations.

If any required predicate depends on reclaimed information that is not represented independently and durably, reclamation is unsafe for that claim.

This is a design condition, not a proved theorem.

## Important negative result
There is no universal minimum number of retained records.
The retention floor is claim-specific and closure-specific.
A smaller summary is safe only when the omitted history is proven irrelevant to the permitted claim.

## Merge/split implication
ECC split cannot reclaim cross-boundary history merely because current interaction ceased.
The split must first establish:
- no active cross-boundary effect path,
- no unresolved provider continuation,
- no delegated descendant crossing boundary,
- no mission-invariant dependency crossing boundary,
- no future reconciliation dependency,
- no succession/recovery dependency,
- historical residue sufficient for future claims.

## Formal model target
The future TLA+ model should include:
- Authority contexts A and B
- succession cutoff
- capability generations
- delegated descendants
- provider continuations
- effect identities
- resource incarnations
- UNKNOWN effects
- compaction summary
- reclamation authorization
- root generation
- recovery crash/restart
- late callbacks
- authoritative ordering
- enforcement state
- claim publication

Target safety invariants:
CRS-01 no stale predecessor authority after cutoff.
CRS-02 no protected effect crosses cutoff without a valid continuation transition.
CRS-03 reclamation cannot destroy the information required by the permitted succession claim.
CRS-04 compaction certificate cannot self-justify its own evidence deletion.
CRS-05 root rotation invalidates/downgrades dependent compaction assurance when required.
CRS-06 late callbacks cannot regain authority from historical evidence.
CRS-07 UNKNOWN survives compaction unless independently resolved.
CRS-08 snapshot restore cannot resurrect predecessor authority.
CRS-09 claim scope cannot exceed verified retained closure.
CRS-10 recovery cannot convert compacted history into new authority without protected ordering.
CRS-11 resource incarnation changes invalidate incompatible historical bindings.
CRS-12 partial compaction cannot be promoted to global containment.

## Verification boundary
SANY/TLC/TLAPS have NOT been run for this research.
No implementation refinement has been performed.
No runtime/fault-injection result exists.
The findings are architectural design constraints and candidate proof obligations.

## Conclusion
Compaction must become an authority-aware operation. During succession, reclamation is not merely memory management: it can alter what future recovery can prove and what fences it can safely enforce.

The safe abstraction is:
AUTHORITY ORDER -> CLOSURE -> RETENTION FLOOR -> INDEPENDENT SUMMARY -> RECLAMATION AUTHORIZATION -> RECLAMATION -> SUCCESSION REVALIDATION.

The critical invariant remains:
NO_RECLAMATION_MAY_ERASE_INFORMATION_REQUIRED_TO_PROVE_OR_FENCE_AUTHORITY_SUCCESSION.

Next attack:
COMPACTION + REVOCATION + ROOT ROTATION + SUCCESSION + LATE CALLBACK + STALE CAPABILITY + CRASH, with concurrent reconciliation and partial provider enforcement, looking specifically for a counterexample where the retained summary appears sufficient but a hidden continuation survives outside its closure.
