# NEXO HIDDEN CONTINUATION COMPACTION SUCCESSION ATTACK V1 — 2026-09-24

## Status
RESEARCH ONLY. NO V21. NO RUNTIME CLAIM.

## Target
Determine whether a retained causal summary can appear complete while an effect-capable continuation remains outside its closure during authority succession.

Target property:
NO_HIDDEN_CONTINUATION_MAY_SURVIVE_RECLAMATION_OUTSIDE_THE_VERIFIED_SUCCESSION_CLOSURE.

## Formal-methods boundary
TLA+ models systems as state machines with initial and next-state relations and can check invariants over reachable states. TLC checks finite configured models; refinement can relate an implementation specification to an abstract specification. These facts justify the future modeling approach but do not prove Nexo's architecture. TLAPS mechanically checks supported proof obligations, with temporal reasoning limitations documented by the project. Sources:
- https://lamport.azurewebsites.net/tla/tools.html
- https://lamport.org/pubs/yuanyu-model-checking.pdf
- https://proofs.tlapl.us/doc/web/content/Home.html
- https://github.com/tlaplus/vscode-tlaplus/blob/master/resources/knowledgebase/tla-refinement.md

## Adversarial scenario
A0 is current.
A0 grants capability C0.
C0 starts effect E0 against resource incarnation R0.
A succession cutoff K is ordered.
Raw revocation history is compacted into summary S.
Root R0 is later superseded by R1.
Successor A1 becomes current.
A callback/retry/provider continuation arrives carrying historical identity for E0.
A crash occurs before reconciliation completes.

The dangerous assumption is:
S contains all known local history, therefore no hidden continuation exists.

That implication is false unless the closure includes every effect-capable boundary.

## Hidden continuation classes
H1 queued local work
H2 delayed scheduler work
H3 retry/redrive
H4 delegated child capability
H5 provider-side continuation
H6 callback that can trigger a new effect
H7 compensation
H8 recovery worker
H9 update/bootstrap path
H10 restored process state
H11 external automation previously configured by E0
H12 resource-side asynchronous action

H1-H12 are not all equivalent. Some are evidence-only; others are effect-capable. The closure must classify them by actual ability to cause protected effects.

## Key distinction
CALLBACK_PRESENT != CALLBACK_AUTHORITY.
PROVIDER_STATE_OBSERVED != PROVIDER_STOPPED.
QUEUE_EMPTY != NO_DELAYED_WORK.
LOCAL_WORKER_STOPPED != PROVIDER_QUIESCENT.
CAPABILITY_REVOKED_LOCALLY != ALL_DESCENDANT_EFFECT_PATHS_FENCED.
SUMMARY_COMPLETE_LOCALLY != EFFECT_PATH_CLOSURE_COMPLETE.

## Closure must be boundary-oriented
A safe closure cannot only enumerate Nexo objects. It must enumerate the last effect-capable boundaries:
- local executor
- scheduler
- retry subsystem
- delegation issuer
- provider API
- provider queue
- resource controller
- update/bootstrap channel
- recovery path
- administrative break-glass path

For each boundary B, the succession claim needs one of:
1. protected cutoff/fence,
2. authoritative rejection of stale context,
3. independently verified quiescence,
4. explicit assumption that narrows the claim,
5. UNKNOWN plus degraded/quarantined claim.

## The apparent-sufficiency counterexample
Suppose S contains:
- predecessor epoch
- cutoff
- capability generation
- known queued jobs
- known external effects
- root generation
- reconciliation generation

But S omits provider-side scheduled continuation P.

After A1 activation:
P executes using an old provider-side authorization.

The summary can be internally consistent and cryptographically authentic while the global containment claim is false.

Therefore:
SUMMARY_INTEGRITY != CLOSURE_COMPLETENESS.

## Reclamation rule
Raw history may be reclaimed only after the closure certificate proves that all effect-capable paths relevant to the permitted claim are either:
- represented in the retained summary,
- fenced/rejected,
- independently bounded by an explicit environment contract,
- or excluded from the claim.

If provider continuation closure is unknown, the system may retain a weaker historical claim but may not publish global containment.

## Root rotation interaction
If S depends on root generation R0 and R0 is superseded, the system must distinguish:
- historical provenance under R0,
- current validity under R1,
- current authority,
- enforcement evidence,
- compaction authorization.

A valid old signature is not a current succession decision.

## Crash interaction
Crash after compaction but before successor publication must reconstruct:
- authoritative succession order,
- predecessor cutoff,
- retention boundary,
- closure certificate,
- unresolved effect paths,
- current root/trust context,
- current recovery ownership.

If any cannot be reconstructed, recovery must not infer the missing fact. It degrades or quarantines.

## Candidate object: HiddenContinuationSet
Fields:
- continuation_id
- source_effect_id
- attempt_lineage
- capability_lineage
- authority_epoch
- successor_context
- provider/resource boundary
- resource incarnation
- trigger type
- effect capability
- known/unknown status
- fence generation
- invalidation generation
- dependency closure
- observation/evidence generation

Candidate object: ContinuationClosureCertificate
Fields:
- certificate_id
- succession transition
- cutoff order
- included continuation set
- excluded boundaries and explicit assumptions
- effect-capable boundary set
- fencing evidence
- root/trust context
- dependency/common-mode closure
- resource incarnations
- UNKNOWN set
- permitted claim scope
- invalidation triggers
- verification method

## Strong design condition
For any succession claim C, let E(C) be the set of effect-capable boundaries relevant to C.

Then:
VERIFIED_CLOSURE(C) requires every b in E(C) to be either:
- closed by authoritative transition,
- fenced/rejecting stale context,
- covered by an explicit bounded environment contract,
- or excluded from C's claim scope.

An unknown boundary cannot be silently treated as closed.

This is a candidate formal condition, not a proved theorem.

## Interaction with compaction
Compaction should record not only what history was retained, but what closure assumptions made the reclamation safe.

Thus the compaction certificate must bind:
- claim scope
- effect-path closure fingerprint
- succession cutoff
- authority context
- root generation
- capability/delegation lineage
- resource incarnations
- enforcement boundaries
- UNKNOWN set
- environment contract
- dependency/common-mode fingerprint

Changing any of these may invalidate the certificate.

## Interaction with repeated merge/split
After split, a later merge expands the coordination closure. Historical summaries from each side cannot automatically compose into a complete merged history.

MERGE(A,B) requires conflict/interaction closure before stronger merged claims.
If a residual dependency was compacted away on either side, the merged claim must exclude it or enter UNKNOWN/QUARANTINE.

Therefore:
SPLIT -> COMPACTION -> MERGE is not generally lossless.

## Candidate protocol
SUCCESSION_DEPENDENCY_DETECTED
-> FREEZE_RECLAMATION
-> FREEZE_NEW_CROSS-SCOPE_EFFECTS
-> ENUMERATE_EFFECT-CAPABLE_BOUNDARIES
-> COMPUTE_HIDDEN_CONTINUATION_CLOSURE
-> CLASSIFY_KNOWN_UNKNOWN
-> FENCE_OR_EXCLUDE_UNKNOWN_BOUNDARIES
-> ESTABLISH_SUCCESSION_RETENTION_FLOOR
-> VERIFY_CERTIFICATE_NON-CIRCULARITY
-> COMMIT_SUMMARY
-> COMMIT_RECLAMATION_AUTHORIZATION
-> RECLAIM
-> COMMIT_SUCCESSOR
-> RECONCILE_LATE_CONTINUATIONS
-> RECOMPUTE_ASSURANCE
-> PUBLISH_ONLY_WITHIN_VERIFIED_SCOPE

## New candidate invariants
HC-01: No reclaimed history is required by a currently permitted succession claim.
HC-02: No effect-capable continuation remains outside the verified closure of a global containment claim.
HC-03: Unknown boundary status cannot be promoted to closed.
HC-04: Historical summary integrity cannot imply closure completeness.
HC-05: Root rotation invalidates dependent current-assurance claims when required.
HC-06: A late callback cannot inherit predecessor authority.
HC-07: Resource incarnation changes invalidate incompatible continuation bindings.
HC-08: Recovery cannot infer predecessor fencing from absence of local work.
HC-09: Merge cannot promote two partial summaries into complete global history without closure evidence.
HC-10: Compaction certificate validity is claim-scoped and context-bound.

## New negative result
Even a causally complete local history may be insufficient for a global succession claim if the environment remains open-world.

Thus:
LOCAL_CAUSAL_COMPLETENESS != GLOBAL_EFFECT_CLOSURE.

A strong global claim requires a closed/bounded environment contract or an explicit weakening of the claim.

## Next attack
BYZANTINE QUORUM + COMMON-MODE COMPROMISE + ROOT ROTATION + MEMBERSHIP CHANGE + COMPACTION.

Question:
Can a recovery trust contract safely establish a unique successor when quorum evidence, root trust, membership generation, compaction certificates, and common-mode dependencies can change concurrently?

No answer is assumed yet.
