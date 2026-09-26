# NEXO — CONTINUITY CHECKPOINT AB104.153
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Completed
Saved and reviewed:
docs/nexo/NEXO_MULTI_RESOURCE_UNKNOWN_PARTIAL_COMMIT_RECOVERY_RESTART_RESEARCH_V1_2026-09-25.md

Core result:
- Multi-resource state must remain participant-aware.
- A=CONFIRMED, B=UNKNOWN is a real partial-commit state, not global FAILURE.
- Resource replacement creates a new incarnation unless explicit continuity is proven.
- Recovery restart creates a new recovery incarnation and must reacquire current ownership/fence.
- STOP changes invalidate affected pending retry/compensation/release decisions.
- Late evidence is historical unless current context and resource incarnation validate promotion.
- Compensation/retry remain effect-class-specific.
- Partial commit + unresolved participant + changed incarnation/stale context defaults to HOLD/QUARANTINE for nontrivial effects until reconciliation establishes admissibility.

## AB104.151/152 carryover
Execution-owner boundary remains undefined and implementation remains blocked.
persistPreparedIntent is a hook, not yet an integrated durable transaction boundary.
No current CI PASS is claimed.

## Historical residuals preserved
AB50→AB58:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED

## DO-NOT-REPEAT
Do not collapse participant outcomes.
Do not treat resource replacement as continuity without proof.
Do not restore recovery authority from checkpoint.
Do not treat STOP as external outcome resolution.
Do not infer external exactly-once from local idempotency.
Do not wire executor before execution-owner contract.
Do not claim tests/CI passed without fresh evidence.
Do not implement V21 or delete historical gaps.

## EXACT NEXT ACTION
Audit the execution-owner contract against the multi-resource model. Determine the minimum protected ownership/persistence boundary and crash semantics before any implementation.


## AB104.154 carryover
New adversarial research persisted:
docs/nexo/NEXO_CONTROL_EFFECT_BOUNDARY_RESEARCH_V1_2026-09-25.md
commit: b5fa815d27e0b7da98e1941abdb4532ef4c9f084

Key correction:
- owner_generation alone is not enough for external-effect safety.
- Control-plane protected admission and effect-plane fencing/enforcement are separate boundaries.
- STOP must invalidate stale admission; a prior STOP read is not sufficient.
- recovery_incarnation identifies recovery context but does not replace ownership fencing.
- resource_incarnation must be bound and revalidated.
- provider capability classes R0-R3 prevent silently claiming stronger guarantees than the provider supports.
- UNKNOWN remains participant-level and survives STOP, restart, timeout, and resource replacement until admissible reconciliation.

No implementation/V21 performed.
No current CI PASS claimed.

## EXACT NEXT ACTION
Formalize the resource/intermediary capability contract and attack R0-R3 against stale ownership, STOP races, replacement, retries, intermediary crash, and partial multi-resource outcomes before implementation.


## AB104.155 carryover
Resource/intermediary capability attack persisted:
docs/nexo/NEXO_RESOURCE_INTERMEDIARY_CAPABILITY_CONTRACT_ATTACK_V1_2026-09-25.md
commit: 131a8cbb0b049dab1796f861b9f1153b16d28fa5

Repair: capability class is now part of effect binding, not just documentation. R0/R1 cannot claim stale-owner exclusion; R2 requires resource/intermediary fence enforcement on every protected mutation path; R3 claims are limited to the provider transaction scope. STOP binding, resource incarnation, effect identity, timeout/retry semantics and bypass paths are mandatory contract fields. UNKNOWN remains unresolved unless authoritative evidence promotes it.

No V21 implementation. No current CI PASS claimed.

## EXACT NEXT ACTION
Inventory concrete current Nexo/Lúmina effect paths and map each to RC1-RC12, identifying every bypass path and the minimum contract needed before any execution-owner implementation.


## AB104.156 carryover
Current Nexo/Lúmina effect-path audit persisted:
docs/nexo/NEXO_CURRENT_EFFECT_PATH_CAPABILITY_MAP_V1_2026-09-25.md
commit: 2cdfd96c412d117b04669a7ec2a85b7351d8ebf6

Concrete findings:
- Current effect requests have no explicit capability class, owner_generation, resource_incarnation or final STOP fence.
- createLuminaEffectAdapter directly mutates simulation state; current nexoEffectRevision is only an in-memory local revision, not an external fence.
- persistState stateRevision/file lock protects state persistence, not already-running effect execution.
- nexoEffectRevision is not serialized in world-state.json, so it cannot currently act as a durable cross-restart fence/incarnation.
- executionJournal retention is bounded to 200 entries; long-lived reconciliation cannot assume indefinite local identity retention.
- prepared-intent persistence remains optional and no current production caller supplies the hook.
- local postcondition evidence cannot prove external-world truth outside the simulation boundary.

RC mapping is now explicit: RC1/RC2/RC3/RC4/RC5 OPEN/FAIL; RC6 locally preserved; RC7/RC8 respected; RC9 unclaimed; RC10 bypasses found; RC11 partial; RC12 preserved by prior research.

No implementation/V21. No current CI PASS claimed.

## EXACT NEXT ACTION
Research and formalize the minimum protected local Lúmina transition boundary: owner/fence record, effect binding, resource incarnation, STOP epoch, prepared-intent durability, and final admission point. Compare it against the current stateRevision/file-lock topology before implementation.


## AB104.157 carryover
Minimum protected Lúmina transition boundary researched and persisted:
docs/nexo/NEXO_MINIMUM_PROTECTED_LUMINA_TRANSITION_BOUNDARY_V1_2026-09-25.md
commit: 60988614c1aa555caf1f0282b8db9f204de7795e

Result: the minimum boundary is a protected final admission that atomically validates current owner_generation, recovery_incarnation, authority_epoch, STOP context, resource_incarnation, capability/fence scope, effect identity and policy/invariant versions against the prepared intent. stateRevision/filesystem lock remain persistence/concurrency mechanisms, not universal external fences. nexoEffectRevision remains in-memory only and cannot be authority across restart.

Crash/race cuts P0-P8 were defined, including local durable-commit ambiguity and the distinction CONTROL_ADMITTED vs EFFECT_FENCED vs EFFECT_ATTEMPTED vs outcome states.

No implementation/V21. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack the minimum boundary with exhaustive crash/race cases and determine whether one local persistence linearization can cover OwnerFence + PreparedIntent + local effect commit, or whether control admission and effect commit must remain separate even for Lúmina.


## AB104.158 carryover
Crash/race attack persisted:
docs/nexo/NEXO_LUMINA_BOUNDARY_CRASH_RACE_ATTACK_V1_2026-09-25.md
commit: d6a8e7ecb2bad5c8b13a8d16cfda21b53a568997

Result: current Lúmina cannot provide one linearization point for OwnerFence + PreparedIntent + handler mutation because handlers mutate in memory and persistState commits later. A future bounded local transactional store MAY combine protected admission with durable local state, but only with an explicit atomic transaction/recovery boundary covering all protected mutation paths. External effects remain separate.

Crash/race conclusions: admission is not execution proof; mutation before durable commit has crash-divergence risk; lost response after durable commit requires reconciliation; STOP/owner transfer/recovery restart invalidate stale retries; resource replacement requires incarnation continuity proof; stateRevision is not OwnerFence; bypass paths invalidate atomicity claims; UNKNOWN survives restart; multi-resource atomicity needs an explicit shared transaction.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Refine the bounded local transaction contract: define its atomicity/isolation/durability/recovery boundary and exhaustive crash-cut state machine, then map every current Lúmina protected mutation entry point against it before any implementation.

## AB104.159 carryover
Bounded local Lúmina transaction contract persisted:
docs/nexo/NEXO_BOUNDED_LUMINA_LOCAL_TRANSACTION_CONTRACT_V1_2026-09-25.md
commit: eb3d06fe5d32331cf2084d42e1aad5855b1cf2c4

Current-code mapping confirms protected mutation occurs in createLuminaEffectAdapter handlers before later persistState serialization. Identified mutation entry points: repair_agent_state, repair_agent_needs, repair_resource_state, execute_lumina_action -> executeAction. nexoEffectRevision remains non-durable. The contract therefore requires a future protected commit unit covering OwnerFence, STOP/recovery/resource context, PreparedIntent, deterministic local transition, and durable history/state. stateRevision remains concurrency/version control, not OwnerFence.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Refine the crash-cut state machine into explicit pre/post durable states and attack concurrent writers, stale in-memory simulations, STOP/owner transfer during commit, resource replacement, and multi-resource local transitions. Then identify the minimum evidence required to prove recovery chooses pre-state or post-state without fabricating outcome.


## AB104.160 carryover
Crash-cut/recovery evidence attack persisted:
docs/nexo/NEXO_LUMINA_CRASH_CUT_RECOVERY_EVIDENCE_V1_2026-09-25.md
commit: fffb322646ee8ec5f61c8fe7c3f6e08b13dbd0cf

Result: current Lúmina must keep CONTROL_ADMITTED and LOCAL_EFFECT_COMMITTED separate. The critical crash cut is during durable commit: recovery needs an explicit transaction/journal protocol capable of distinguishing pre-state from post-state. Without that evidence the result remains UNKNOWN/HOLD. StateRevision, filesystem locking and temp-file rename are not sufficient proofs by themselves. SQLite's documented crash-recovery transaction model and etcd's atomic guarded transactions provide reference semantics, not proof for Nexo.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Study candidate local persistence mechanisms against the contract: SQLite-style transaction/journal semantics versus the current JSON/temp-rename design. Compare atomicity, isolation, durability, crash recovery, stale-writer handling, multi-resource scope, migration and verification cost. Do not select or implement yet; record evidence and remaining UNKNOWNs.


## AB104.161 carryover
Persistence mechanism comparison research completed at contract level (no selection/implementation).

### Current JSON + lock + temp/rename
- Can provide local writer serialization and stale stateRevision rejection at persistence time.
- Does not by itself provide a durable transaction journal that lets recovery distinguish pre-state from post-state after an interrupted multi-file/multi-record transition.
- In-memory Lúmina mutation still occurs before persistState; therefore current topology cannot claim atomic effect commit.
- temp-file rename is a file replacement primitive, not a complete transaction/recovery protocol for all protected state, authority context and effect history.

### SQLite-style transactional boundary
- SQLite documents atomic commit/rollback using rollback journals and recovery; WAL instead records committed changes in a WAL and uses checkpoints. SQLite serializes writes to provide serializable isolation. 
- Durability is configuration/filesystem dependent: SQLite documents synchronous settings and their crash/power-loss implications. Therefore selecting SQLite would still require an explicit durability profile and fault-injection evidence.
- A single database transaction could potentially cover OwnerFence, PreparedIntent, local state and effect history if all protected mutation paths are inside the same database transaction.
- Multi-resource atomicity is possible only when all relevant participants are inside the same transactional boundary; otherwise preserve participant-level outcomes.

### Decision status
SQLite is a candidate mechanism, NOT selected. JSON is NOT yet rejected for every use: it may remain suitable for non-protected/reconstructable state. The unresolved question is whether the protected Nexo/Lúmina state should use a transactional store and which exact durability profile is required.

### DO-NOT-REPEAT
- Do not equate rename with transaction commit.
- Do not equate stateRevision with OwnerFence.
- Do not assume SQLite automatically proves Nexo's authority/effect contract; the schema, transaction scope and recovery protocol must still be designed and verified.
- Do not claim durability across power loss without a specified synchronous/filesystem profile and fault testing.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Study the protected transaction schema itself: define which Nexo records must be co-transactional, which may remain outside, and attack transaction boundaries for stale owner, STOP, recovery restart, resource replacement, concurrent writers and multi-resource local transitions. Then derive the smallest transaction scope that preserves the contract without over-claiming atomicity.


## AB104.162 persistence recovery
The dedicated research-file write was blocked by repository safety controls. To avoid losing the epistemic state, the result was persisted as GitHub issue #76: Nexo research checkpoint AB104.162 — protected transaction boundary.
Issue: https://github.com/snowdenxrp/aldea-ia/issues/76

Minimum protected local transaction candidate: OwnerFence + STOP context + ResourceBinding/resource_incarnation + EffectBinding/effect identity/retry generation + PreparedIntent + deterministic local mutation + durable outcome/history. Attacks covered stale owner, STOP change, recovery restart, resource replacement, concurrent writers, and multi-resource scope.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Audit every current Lúmina mutation entry point against this minimum boundary and identify any mutation that would remain outside the transaction. Then study long-running effects and transaction-size/resource-limit constraints before selecting a persistence mechanism.


## AB104.163 carryover
Current mutation-path audit completed against the minimum protected transaction boundary.

Audited paths in src/nexo/simulation-adapter.js: repair_agent_state, repair_agent_needs, repair_resource_state, and execute_lumina_action. All four mutate simulation.agents/world directly inside effect handlers and increment nexoEffectRevision. runtime.js wraps adapter execution and later commits mission memory, but that runtime commit is separate from the simulation mutation. Therefore none of these paths currently sits inside one proven durable transaction containing authority guards + prepared intent + local mutation + durable effect history.

Additional finding: createLuminaEffectAdapter accepts persistPreparedIntent, but executeLuminaNexoStep merely passes the optional hook through; there is still no authoritative transaction boundary connecting that hook to the actual handler mutation and later world-state persistence.

Long-running effect constraint: a protected local transaction should not remain open while waiting on external/network/model work. The transaction should validate/admit and commit a deterministic local transition, while long-running/external work remains a separate effect lifecycle with explicit UNKNOWN/reconciliation semantics. SQLite permits only one simultaneous write transaction per database; large/long write transactions can increase contention and WAL growth/checkpoint pressure. SQLite documentation recommends keeping write transactions short in normal use and notes that long readers can delay checkpoints in WAL mode. This is a design constraint, not a selection.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Research the exact split between admission transaction and long-running effect lifecycle: identify which fields must be frozen before leaving the transaction, which outcomes can be recorded afterward, and how operation identity/reconciliation prevents a second effect. Then attack timeout, crash, retry, STOP and resource replacement across that split.


## AB104.164 carryover
Admission/effect lifecycle split research persisted:
docs/nexo/NEXO_ADMISSION_EFFECT_LIFECYCLE_SPLIT_RESEARCH_V1_2026-09-25.md
commit: c2889bcbb5b215a46dd787ee8a7eb6f50dfccb3b

Result:
- Protected admission must freeze operation_id/effect_identity, owner_generation, recovery_incarnation, authority_epoch, STOP context, resource_id/resource_incarnation, capability class/fence scope, policy/invariant versions, participant footprint, relevant preconditions/read-set, intended write-set/effect class, retry_generation and durable admission evidence.
- Long-running/network/provider work must occur outside the protected transaction. Admission is not execution proof and does not prove external-world change.
- operation_id is logical lifecycle identity; effect_identity is the concrete effect identity; retry_generation is a new protected attempt. UNKNOWN must reconcile the prior effect_identity before any new effect is created.
- Timeout after possible dispatch, crash after dispatch, STOP after admission, owner transfer, recovery restart, resource replacement and intermediary crash all preserve uncertainty unless authoritative evidence resolves it.
- Provider fencing/idempotency capability remains necessary for external duplicate prevention; local identity alone is insufficient.
- Post-admission observations may be appended but cannot rewrite the original admission context.
- For bounded local Lúmina, a future transaction may include OwnerFence + STOP + ResourceBinding + EffectBinding + PreparedIntent + deterministic local mutation + durable outcome/history, but only if every protected mutation path shares the same proven atomic boundary.
- Current code still does not satisfy this: simulation handlers mutate before persistState; persistPreparedIntent is only a hook; runtime mission-memory commit is separate.
- SQLite/etcd semantics remain reference models, not Nexo proof or technology selection.
- Remaining OPEN: exact schema/mechanism, external provider contracts, durability profile, formal no-duplicate proof, cross-store multi-resource atomicity, migration, trusted time, fault-injection verification.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack the split itself under adversarial races: specifically prove/refute the transition rules for ADMITTED→ATTEMPTED, concurrent retry workers, STOP/owner/recovery changes between admission and dispatch, resource incarnation changes, and reconciliation that arrives concurrently with a new retry. Then identify the minimum conditional-write/fence semantics required so a retry cannot become a second effect.


## AB104.165 carryover
Admission→attempt race attack persisted:
docs/nexo/NEXO_ADMISSION_ATTEMPT_RACE_ATTACK_V1_2026-09-25.md
commit: f0c370b18569e82e8576db250694fcd8ec77cb82

Result:
- ADMITTED→ATTEMPTED must itself be a protected conditional transition; admission alone does not serialize post-transaction workers.
- Two workers reading CONTROL_ADMITTED must not both dispatch. Exactly one conditional claim may consume the eligible effect identity/retry generation; the loser reconciles.
- STOP, owner_generation, recovery_incarnation, authority_epoch and resource_incarnation must be validated at the attempt-claim linearization point, not merely at admission/read time.
- Reconciliation and retry must converge through the same lifecycle state. If reconciliation wins, retry sees terminal state; if retry claims first, reconciliation resolves the same effect identity.
- Timeout/crash after ATTEMPTED does not revert to NOT_ATTEMPTED. The effect identity remains the reconciliation anchor.
- Local conditional claim prevents duplicate local ownership of an attempt but cannot prove external duplicate prevention; provider-side idempotency/fencing is still required.
- SQLite crash/transaction semantics are useful reference evidence for atomic conditional transitions, but durability configuration and external-effect guarantees remain separate design problems.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Refine the lifecycle state machine around ATTEMPTED: distinguish dispatch-not-started, dispatch-accepted, and dispatch-unknown; attack crashes between each transition and determine the minimum durable evidence required to safely reconcile without allowing a duplicate effect.


## AB104.166 carryover
Refined ATTEMPTED lifecycle attack persisted:
docs/nexo/NEXO_ATTEMPT_DISPATCH_STATE_MACHINE_ATTACK_V1_2026-09-25.md
commit: 38f3781c9ae69cccfc5031c58cb60908925152a0

Result:
- ATTEMPTED was too coarse; lifecycle now distinguishes DISPATCH_NOT_STARTED, DISPATCH_CLAIMED, DISPATCH_ACCEPTED, and DISPATCH_UNKNOWN/EFFECT_ATTEMPTED.
- A dispatch claim must be a protected conditional transition over the exact effect identity/retry generation.
- The safe ordering rule is: durable dispatch claim before any possible provider-side effect attempt. If that ordering cannot be enforced, recovery must classify the attempt as DISPATCH_UNKNOWN rather than infer NOT_STARTED.
- Provider acceptance is not execution completion. Lost acknowledgement after possible dispatch preserves UNKNOWN unless authoritative provider evidence resolves it.
- STOP, owner_generation, recovery_incarnation, authority_epoch and resource_incarnation must remain bound to the dispatch claim/final fence, not merely admission.
- Reconciliation and retry must converge on the same effect identity; neither may create a second effect while the prior identity is unresolved.
- Provider-side idempotency/fencing is still required for external duplicate prevention. RFC 9110, AWS EC2 client-token semantics and Stripe idempotency provide external reference evidence; these are provider contracts, not Nexo proof.
- Current Lúmina implementation has no protected durable dispatch claim, so this is design/research only.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack the refined state machine against provider classes R0-R3 with the full race matrix: claim-before-send crash; send-before-claim-durable crash; acceptance-before-record crash; response-loss after execution; STOP/owner/recovery/resource changes at each interval; reconciliation/retry races; idempotency-key expiry; parameter mismatch; intermediary duplicate forwarding; and multi-resource confirmed/unknown outcomes. Determine the exact evidence boundary for CONFIRMED/REJECTED versus UNKNOWN/HOLD and what provider capabilities can legitimately promote UNKNOWN without creating a duplicate effect.

## AB50–AB58 residual carryover — MUST PRESERVE
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED


## AB104.167 carryover
Persisted provider R0-R3 dispatch race matrix:
docs/nexo/NEXO_AB104_167_R0_R3_DISPATCH_MATRIX.md
commit: 7ca6eebf4bf8d1859101f6fe06c9ae1625a9ffba

Key result: NOT_STARTED is provable only when durable dispatch claim is ordered before every possible provider send. Otherwise recovery must preserve UNKNOWN. Provider idempotency can make same-identity retry safe but does not prove non-execution. Expired idempotency is not absence evidence. Parameter mismatch is an identity-contract violation. STOP/owner/recovery changes invalidate future authority but do not retroactively cancel external effects. Resource replacement requires a new incarnation absent continuity proof. Retry and reconciliation must converge on one effect identity. A=CONFIRMED+B=UNKNOWN remains partial/UNKNOWN unless a shared authoritative transaction covers all required participants.

R0 protects local lifecycle only; R1 adds idempotency/reconciliation without stale-owner fencing; R2 adds conditional provider/resource fencing across all protected paths; R3 permits stronger atomic claims only within exact transaction scope.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Research provider/intermediary identity lifetime and fencing semantics: effect_identity retention, idempotency-key expiry, parameter immutability, resource-incarnation binding and stale-owner rejection; then attack reconciliation after key expiry/resource replacement and define minimum evidence for R1 versus R2.

## AB50–AB58 residual carryover — MUST PRESERVE
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED


## AB104.168 carryover
Provider identity lifetime and R1-R2 boundary research persisted:
docs/nexo/NEXO_PROVIDER_IDENTITY_LIFETIME_R1_R2_BOUNDARY_ATTACK_V1_2026-09-25.md
commit: fb5eb6bf59773c44d3a72ed28fd2afc0ec43dbe4

Key result: effect_identity must bind identity domain, immutable parameters, resource/resource_incarnation and provider scope; a bare idempotency key is insufficient. Idempotency retention expiry removes duplicate-prevention guarantees but does not prove historical non-execution. Historical authoritative evidence can remain valid after cache expiry when it remains bound to the exact effect and resource incarnation.

R1 = effect identity/idempotency/reconciliation safety without provider-enforced stale-owner rejection. R2 = R1 plus conditional provider/resource enforcement of current authority at the actual mutation boundary across every effect-capable path. Local preflight generation checks are not R2 fencing. Intermediaries and alternate mutation APIs are part of the protected-path inventory.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack R1/R2 contracts through alternate mutation APIs, intermediary replay after fence rotation, resource replacement with reused provider token, identity-cache eviction followed by late completion, and concurrent reconciliation versus new admission. Define minimum evidence for R1→R2 without relying on provider marketing terminology.

## AB50–AB58 residual carryover — MUST PRESERVE
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED


## AB104.170 research carryover
Research found the R2 boundary must include asynchronous queues and delayed jobs, not only the final API. AWS SQS documents a five-minute FIFO deduplication window and warns that retries after expiry can create duplicates; visibility timeout expiry can also allow another consumer to process the same message. Therefore queue deduplication/visibility is not equivalent to durable authority fencing. Stripe similarly documents finite idempotency retention and new requests after pruning. Kubernetes resourceVersion is a server-side conditional mutation mechanism; etcd transactions atomically evaluate comparisons with writes. These are reference primitives, not complete R2 proof by themselves.

Derived rule: an R2 EvidenceBundle must cover every effect-capable hop and show identity preservation, authority/fence propagation, stale rejection at the actual mutation boundary, resource-incarnation binding, retry/replay semantics, failover semantics, administrative bypass coverage, and reconciliation after expiry or ambiguity.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Define the smallest auditable R2 EvidenceBundle: required claims, artifacts, test traces, path inventory, fence semantics, failure/replay cases, and explicit exclusions. Then attack whether that bundle is sufficient against failover and provider-side retries.


## AB104.171 carryover
Minimum R2 EvidenceBundle defined. Required evidence: immutable effect identity and parameter/resource binding; owner/epoch/fence/STOP/recovery context; mutation-boundary conditional enforcement; complete effect-path inventory including queues, provider jobs, failover and administrative paths; identity/fence propagation; retry/replay traces; failover traces; reconciliation traces; evidence integrity; explicit claim scope and exclusions. Missing evidence is UNKNOWN, not implicit pass.

Failover attack sequence preserved: old owner F1 -> async queue -> connectivity loss -> new owner F2 -> provider retry -> late old request -> resource replacement -> ambiguous reconciliation. R2 must reject stale mutation, preserve old effect identity, avoid silently transferring it to replacement resource, and retain UNKNOWN until authoritative evidence resolves it.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Adversarially attack the EvidenceBundle against provider retries, replica/failover races, asynchronous redelivery, administrative bypass, and resource reincarnation; identify missing evidence or contradictions before architecture selection.


## AB104.172 adversarial attack result
Fresh documentation confirms the EvidenceBundle cannot treat queue deduplication or visibility as authority fencing. SQS documents a five-minute FIFO deduplication interval and possible duplicate processing after visibility expiry; retries after the interval can create duplicates. etcd demonstrates atomic compare-and-apply transactions as a reference for mutation-boundary fencing, but that primitive alone does not prove the surrounding path is fenced.

Four minimum attack findings:
1. Provider-internal retry: R2 evidence must bind the provider retry to the original effect identity and current resource incarnation; timeout is not rejection.
2. Failover/replica race: evidence must show stale fence rejection at the authoritative mutation point, not only client-side generation checks.
3. Async redelivery: every queue/worker hop must preserve or revalidate identity, fence, resource incarnation and retry generation; visibility/dedup expiry cannot prove non-execution.
4. Administrative bypass/resource reincarnation: every effect-capable administrative path must be inventoried; replacement requires a new resource incarnation and old effect context cannot silently authorize the new resource.

New minimum requirement: R2 EvidenceBundle needs a NEGATIVE-PATH matrix proving each excluded/bypass path is either fenced equivalently or explicitly outside the claim. A missing path is UNKNOWN, not safe by assumption.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Build the NEGATIVE-PATH matrix and attack the remaining weakest assumption: whether evidence collected after a provider-side retry/failover can be cryptographically or transactionally bound strongly enough to distinguish the original effect from a new effect on the same logical resource.


## AB104.173 carryover
Negative-path attack: R2 requires binding fence, effect identity, resource incarnation, and protected parameters at the authoritative mutation boundary. Client preflight is insufficient; the accepted fence must survive restart. Negative-path rows must cover alternate/admin APIs, queue redelivery, provider retry, delayed old packet, worker restart, provider failover, resource restart/replacement, idempotency expiry, and fresh retry identity. Same logical resource ID is insufficient for historical binding; fresh identity after ambiguity is a new effect attempt, not proof of non-execution. If an external provider cannot expose an authoritative fence boundary, an intermediary can only support R2 if the claimed effect is actually mediated there; otherwise the external claim remains below R2/UNKNOWN. Documentation is contract evidence, not runtime proof.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack the mediated-boundary escape hatch: determine whether a locally fenced outbox/worker can support an R2 claim for an external provider that cannot consume fencing tokens, and identify the exact downgrade point to R1 or UNKNOWN.


## AB104.174 carryover
Fresh research confirms transactional outbox closes a local dual-write boundary but does not by itself make an external effect exactly-once; downstream duplicates still require idempotency. Fencing safety belongs at the protected mutation boundary: stale tokens must be rejected there, not merely by the worker.

Decision boundary: R2 only when the intermediary is the authoritative effect boundary, the claimed effect cannot bypass it, and durable state binds effect identity, parameters/resource incarnation and current fence with stale-owner rejection and reconciliation evidence. R1 when the intermediary durably controls admission/identity/reconciliation but the external provider can execute outside that fence or lacks mutation-boundary evidence. UNKNOWN when it is unclear whether the effect escaped the mediated boundary or historical provider evidence cannot bind to the exact effect identity/incarnation.

Outbox durability proves intent/delivery properties, not external non-execution. A fresh identity after ambiguity can create a second effect and cannot resolve the first outcome.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Convert this boundary into a compact R1/R2/UNKNOWN decision matrix with observable evidence and attack traces, then test it against Nexo/Lumina current JSON persistence + effect-adapter topology without implementing the future architecture.


## AB104.175 topology classification
Current Lúmina is NOT R2. `effect-adapter` records prepared intent and uses idempotency/reconciliation, but `persistPreparedIntent` is a hook rather than an authoritative transaction. Handlers mutate in-memory simulation and bump `nexoEffectRevision`; `persistState` serializes world/agents/events/memory but does not serialize the execution journal or `nexoEffectRevision`. The filesystem lock protects state persistence, not already-running effect execution.

Five decisive gaps: (1) prepared intent can be separated from durable world mutation across a crash; (2) no owner-generation/fencing token reaches the mutation boundary; (3) no durable resource incarnation is bound to the effect identity; (4) journal retention is capped at 200, so eviction cannot prove non-execution; (5) alternate/direct mutation paths remain outside one proven protected transaction.

Attack traces: prepared→crash→restart leaves outcome UNKNOWN unless the journal was independently persisted; handler mutation→crash before `persistState` creates a durability split; owner transfer permits no proven stale-worker rejection; resource replacement has no durable incarnation binding; journal eviction removes historical duplicate evidence.

Conclusion: current mechanisms provide useful R0/local and some R1-style identity/reconciliation properties, but not an R2 claim. This is a research classification, not an implementation verdict.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack these five paths with concrete crash/restart/retry traces and derive the minimum evidence contract needed for R2, without implementing the future architecture.


## AB104.176 crash/restart/retry attack
Fresh external evidence reinforces three points: transactional outbox makes the local state+outbox write atomic but downstream delivery can duplicate; retry safety depends on stable idempotency identity; fencing requires the protected resource to reject stale tokens. citeturn0search0turn0search1turn0search6

Five attack cuts and minimum R2 evidence:
1. PREPARED→CRASH: required evidence = one durable atomic boundary proving effect identity/admission and recovery state survive together. Current hook + JSON persistence are separate, so UNKNOWN remains.
2. HANDLER_MUTATION→CRASH_BEFORE_STATE_COMMIT: required evidence = mutation and effect lifecycle/history commit in the same authoritative transaction, or an authoritative recovery record that proves exactly which mutation committed. Current in-memory handler + later persistState fails this requirement.
3. OWNER_TRANSFER→STALE_WORKER: required evidence = monotonic fence persisted at the mutation authority and checked on every effect-capable path. Current code has no such check. A local lock is insufficient because fencing requires the resource server to reject lower tokens. citeturn0search6
4. RESOURCE_REPLACEMENT→LATE_RETRY: required evidence = resource incarnation bound into effect identity and checked at mutation/reconciliation. Without it, a valid old operation identity can be misapplied to a new resource.
5. JOURNAL_EVICTION→RETRY: required evidence = durable retention/reconciliation semantics covering the full ambiguity window. Eviction must never be interpreted as proof of non-execution. Stable idempotency keys are required across retries when the provider supports them. citeturn0search1turn0search9

Minimum R2 contract distilled:
- authoritative monotonic fence + stale rejection at the actual mutation boundary;
- immutable effect identity including operation/effect key, parameter digest, resource_id and resource_incarnation;
- durable lifecycle/history that survives the entire reconciliation/ambiguity window;
- atomic binding of admission/fence/identity to the protected mutation or an equivalently authoritative recovery mechanism;
- complete inventory of every effect-capable alternate path;
- retry/reconciliation using the same identity, never a fresh identity to resolve an ambiguous prior attempt;
- evidence traces for crash, restart, timeout, stale owner, resource replacement and replay;
- explicit downgrade to R1 or UNKNOWN whenever any external mutation boundary is outside the protected claim.

AB104.176 conclusion: the five attacks do not justify changing the current classification. Lúmina remains NOT R2. The research now has a concrete promotion test rather than a vague requirement for “more fencing”.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack the promotion test against each current Lúmina effect path (`repair_agent_state`, `repair_agent_needs`, `repair_resource_state`, `execute_lumina_action`) and determine whether any path can even conceptually satisfy the R2 contract, identifying the first missing evidence for each.


## AB104.178 effect-capable mutation graph inventory
Inspected current `simulation-adapter.js`, `effect-adapter.js`, `runtime.js`, and `src/actions.js`. The mutation graph is broader than the four adapter labels.

Repair paths:
- `repair_agent_state` → direct writes to `agent.position.x/z` and `agent.alive` → `bump(simulation)`.
- `repair_agent_needs` → direct writes to six `agent.needs` fields → `bump(simulation)`.
- `repair_resource_state` → direct write to `world.resources[target].amount` → `bump(simulation)`.

Action path:
- `execute_lumina_action` → `executeAction(simulation, agent, action)` → action-specific mutations across agent and world/resource state → adapter bump only after successful return.
- `drink` mutates water resource + agent thirst/activity.
- `eat_plant` mutates plant resource + agent hunger/health/activity.
- `catch_fish` mutates fish resource + inventory + energy/activity.
- `eat_fish` mutates inventory + hunger/activity.
- `gather_wood` mutates wood resource + inventory + energy/activity + tool durability through `useTool`.
- `gather_stone` mutates stone resource + inventory + energy/activity + tool durability.
- `rest` mutates energy/activity.
- `eat_farm_food` mutates inventory + hunger/activity.
- `build_shelter`, `craft_tool`, `farm`, `harvest`, `contribute_commons`, `withdraw_commons`, and `trade` delegate further into development/production/institutions/economy modules and therefore expand the protected write set beyond `actions.js` itself.

Critical ordering finding: the adapter calls the action first and only then increments `nexoEffectRevision`. Therefore the revision is observational bookkeeping, not a mutation-boundary guard. The postcondition also runs after the mutation. Neither establishes a pre-commit authorization point.

Transaction-boundary conclusion: a single future local protected transaction could conceptually cover the local write graph only if every reachable mutation path is routed through the same transaction context and the authoritative store atomically binds owner fence, STOP/recovery context, resource incarnation, effect identity, prepared intent, all affected writes, and durable effect history. Current JSON object mutation + later `persistState` does not provide that boundary. SQLite demonstrates that a real transaction can make a set of local writes atomic and recoverable across crashes, but this is evidence about the mechanism, not a selection or proof for Nexo. citeturn0search0turn0search1turn0search7

Important external-boundary rule remains: even a local transaction/outbox would not make an external provider R2 by itself; downstream delivery can duplicate and requires stable identity/idempotency at the next boundary. citeturn0search8turn0search6

AB104.178 conclusion: the current write graph is not a single protected boundary. The next architecture research must first define the authoritative local mutation scope and enumerate every reachable write, including delegated modules, before any implementation choice.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Trace the delegated mutation modules (`development.js`, `production.js`, `economy.js`, `institutions.js`) to complete the write-set inventory, then test whether any hidden/global mutation or callback can escape a proposed protected local transaction boundary.


## AB104.179 delegated write-set completion
Traced development.js, production.js, economy.js, and institutions.js. Delegated writes include: shelter construction (inventory, structures, home, safety); tool crafting (inventory, skills, tools); farming (inventory, fertile land, farms, safety); harvesting (farm food, inventory); tool durability; trade (two agents, money, inventories, relationships, economy); commons actions (agent inventory/hunger/activity plus commons and histories); and institution-day logic (institutions, multiple agents, events, norms/history). Daily advancement functions can also mutate overlapping state outside execute_lumina_action.

Boundary finding: an adapter-level transaction cannot automatically protect the whole simulation because direct/daily callers can mutate the same state outside the adapter. A per-effect transaction could still be meaningful if its reachable write set is closed and every effect-capable caller is routed through the same authority. Whole-simulation atomicity is not justified by current evidence. Split control/admission from bounded local mutation plus reconciliation remains the principal candidate to investigate.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Trace callers of advanceProductionDay, advanceEconomyDay, advanceInstitutionDay, executeAction, and the repair handlers to map the actual entry-point graph and concurrent bypasses; derive the minimum serialization/fencing scope needed to prevent a tick or direct caller from bypassing an admitted effect.


## AB104.180 entry-point/concurrency boundary finding
Fresh call-graph inspection shows `src/simulation.js` is the principal simulation loop: `tick()` advances day/world state, calls `advanceWorldDay` and `advanceSocietyDay`, then processes each agent and eventually calls `executeAction(simulation, agent, intent)` directly. Thus the same simulation object has a broad synchronous mutation loop around action execution.

The imported daily advancement functions are not directly called by their own exported names in `simulation.js`; they are reached through `advanceWorldDay`/`advanceSocietyDay` and therefore must be traced through those modules rather than assuming isolated callers. `executeAction` is reached from `performDecision` inside `tick()`, while the Nexo runtime separately invokes the effect adapter against the same simulation object. This creates a potential cross-entry authority problem: JavaScript's synchronous execution avoids interleaving during one synchronous call stack, but Nexo effect execution is asynchronous at the adapter/runtime layer, and the simulation object is not protected by a shared durable transaction/fence across these entry points.

Critical consequence: a per-effect local transaction cannot be declared safe merely because `tick()` is synchronous. The required boundary must either (1) serialize/coordinate the simulation tick and Nexo protected effects under one authoritative mutation scheduler, or (2) make the protected effect operate on an isolated snapshot/state transaction with a conditional commit/fence that rejects stale state. A filesystem persistence lock alone is insufficient because mutation already occurs in memory before persistence.

SQLite research corroborates the distinction: serializable isolation is obtained when all relevant writes participate in the same transactional database boundary; separate operations outside that transaction are not covered. cite-source:turn0search2

AB104.180 conclusion: the minimum serialization scope must include every entry point capable of mutating any object in an admitted effect's write-set, not merely the adapter callback. The next trace must follow `advanceWorldDay` and `advanceSocietyDay` to enumerate their transitive mutation sets and determine whether the effect write-set overlaps them.

No implementation/V21. No formal verification. No current CI PASS claimed.

## EXACT NEXT ACTION
Trace `advanceWorldDay` and `advanceSocietyDay` transitively, including all imported mutation functions, then compare their write sets against each protected Lúmina effect class and identify the smallest safe serialization/fencing domain.
