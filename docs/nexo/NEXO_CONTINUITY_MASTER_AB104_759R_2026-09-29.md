# NEXO CONTINUITY — MASTER HANDOFF FROM AB104.759R
Date: 2026-09-29
Canonical repo: snowdenxrp/aldea-ia
Branch: main
Purpose: preserve continuity from AB104.759R onward; this supersedes the mistaken handoff that began at AB104.862R.

## NON-NEGOTIABLE WORKING RULES
- Workflow: INVESTIGAR → ANALIZAR → CONTRASTAR → GUARDAR.
- Research/audit only. Nexo architecture is NOT being implemented.
- V21 is forbidden/not started; do not patch V20 or silently migrate.
- Never delete/overwrite historical findings. Corrections are appended explicitly.
- Never claim security, correctness, completeness, formal verification, or executed testing without evidence.
- Documentation/source evidence is not an executed test.
- Preserve UNKNOWN/PENDING and unresolved contradictions.
- For each continuation: authoritative GitHub fetch first, then fresh external/code evidence, then append to canonical records.
- Do not freeze a witness merely because a Boolean combination is logically possible.

## CANONICAL START POINT
The correct continuity anchor is **AB104.759R**, not AB104.839R or AB104.862R.

### AB104.759R — RequestChannel / stale queued work
Kafka source baseline: abf5221e...
Direct source findings:
- RequestChannel.sendRequest enqueues an already-created Request in shared ArrayBlockingQueue.
- Queue lifecycle is decoupled from socket receive lifecycle.
- No source evidence that closing a client socket automatically removes an already-queued Request.
- closeConnection is an explicit CloseConnectionResponse path, not generic revocation.
Epistemic boundary:
- SOURCE_CONFIRMED: queue/transport lifecycle separation.
- NOT_EXECUTED: exact disconnect-after-enqueue → dequeue → handler → external effect race.
Nexo distinction:
TRANSPORT_DISCONNECT != OPERATION_REVOKED
QUEUE_ENTRY != CURRENT_AUTHORITY
CHANNEL_CLOSE != EFFECT_CANCELLATION
Next: audit RequestHandler authorization/execution boundary.

### AB104.760R — correction
A previously cited continuity SHA d854ef3b... was not present/resolvable in canonical repo. It must NOT be treated as persisted evidence.
Direct Kafka evidence:
- KafkaRequestHandler dequeues and directly invokes apis.handle for normal requests.
- No generic transport-open revalidation before handler execution.
- RequestChannel queue remains decoupled from socket lifecycle.
Tests inspected did not execute the exact disconnect-after-enqueue race.
Status: source-confirmed claims only; runtime race NOT EXECUTED.

### AB104.760R2 — continuity correction
Preserved the above correction explicitly. Status:
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
Next: concrete Kafka API effect-boundary audit.

### AB104.761R — Produce authorization boundary
Concrete Kafka Produce path:
handleProduceRequest → authHelper.filterByAuthorized(request.context, WRITE, TOPIC, ...) → authorizedRequestInfo → replicaManager.handleProduceAppend → append path.
Findings:
- Real authorization gate exists.
- Gate uses already-created request.context.
- No generic second topic-WRITE authorization check was found immediately before append in audited path.
- No executed disconnect/revocation race.
- No proof of vulnerability.
Important:
REQUEST_CONTEXT_AUTHORIZATION != CURRENT_AUTHORITY
AUTHORIZATION_CHECK != REVOCATION_RECHECK
TRANSPORT_CLOSE != APPEND_CANCELLATION
ACK/RESPONSE != EFFECT_ABSENCE

### AB104.762R — authorization freshness
Fresh audit of AuthHelper/StandardAuthorizer:
- No AuthHelper result cache/memoization found.
- StandardAuthorizer evaluates against current local authorization data.
- Kafka Authorizer SPI is based on locally cached ACL state.
- ACL propagation/freshness remains a separate control-plane issue.
- Custom authorizer behavior remains UNKNOWN.
- Credential/session invalidation is separate from ACL revocation.
Key result:
CURRENT_AUTHORIZATION_RESULT is a point-in-time decision over request context/action/authorizer state; it is not automatically CURRENT_AUTHORITY_AT_EFFECT_TIME.
Next: ACL mutation → metadata publication → in-flight Produce boundary.

### AB104.763R — authorization to append
Corrected interpretation of Kafka comment “cache the result”:
- It is request-local reuse of authorizedTopics, not evidence of a persistent cross-request authorization cache.
Source trace:
T1 authorization → T2 authorizedRequestInfo → T3 ReplicaManager → T4 append.
Generic second ACL check before append: NOT FOUND in audited path.
Revocation race execution: NO.
Next: ACL mutation/publication path.

### AB104.764R–AB104.768R
Continue the concrete Kafka ACL mutation/publication/test chain:
- ACL mutation completion vs broker authorizer freshness.
- deleteAcls completion is control-plane evidence, not automatically in-flight request cancellation.
- StandardAuthorizer local state and metadata publication must be kept distinct.
- Existing tests must be distinguished from an actually executed revocation/Produce interleaving.
- Preserve unknowns where ordering is not demonstrated.

### AB104.769R–AB104.782R — fencing/failover research
Core conclusions from the complete fencing/failover block:
- Fencing requires resource-side enforcement at the protected effect boundary.
- Read-highwater → later write is vulnerable to TOCTOU if not atomically guarded.
- Authority generation must remain distinct from operation_id, observation version, resource version, namespace, and incarnation.
- Fencing prevents stale actors; it is not an external-effect outcome oracle.
- Fencing cannot retroactively erase an already committed external effect.
- Restart/snapshot integrity does not itself prove fencing continuity.
- Raft/etcd commit/apply/effect/ack are distinct states.
- Timeout/ACK loss does not prove effect absence.
- operation_id and authority_generation solve different problems.
- Outbox provides durable local intent but does not atomically commit arbitrary external effects.
- Inbox/dedup must be receiver-side and identity/payload bound.
- Reconciliation must preserve UNKNOWN rather than collapsing it into FAILED.
- Old authority operation must not silently become a new-authority retry.
- etcd lease alone is insufficient; revisions/CAS/Txn matter.
- Kafka producer epochs and broker/leader epochs are real fencing mechanisms in their declared Kafka-managed domains.
- EtcFS generation guards demonstrate resource-side generation enforcement.
- Kubernetes resourceVersion is optimistic concurrency/freshness, not a universal authority epoch.
- Current etcd Mutex stale-incarnation Unlock path was identified as a concrete stale-incarnation concern: stale O1 unlock can delete O2 if ownership is not guarded in that path.
Do not generalize one implementation to all distributed systems.

### AB104.782R
Raft/failover test evidence block continues the distinction between:
commit / apply / effect / observation / acknowledgement.
No Nexo implementation and no formal proof.

## AB104.783R–AB104.786R / payment-effect transition
Continue the external-effect/payment evidence chain already researched:
- PostgreSQL unique idempotency keys, row locks, transactional claims, outbox, reconciliation.
- DB transaction atomicity is local; arbitrary payment/email/API external effect remains outside DB atomicity.
- Adyen idempotency keys are scoped/retained for a finite window; same-key retry semantics are provider-defined.
- Webhooks can duplicate and arrive out of order.
- Payment lifecycle must remain distinct from authority_generation.
- Local CAPTURED/accepted state is not automatically external settlement completion.
- Payment reports/history show lifecycle and correction states.
- SETTLED_REVERSED / reversal evidence demonstrates later correction without erasing prior history.

### AB104.787R — reconciliation state machine
Temporal evidence:
- Activities are at-least-once and can execute multiple times.
- External POST can duplicate after worker crash/network ambiguity.
- Activity timeout does not prove external effect absence.
- Receiver-side idempotency is distinct from scheduler deduplication.
- Claim-check/status reconciliation needs an explicit validity window.
Stripe evidence: idempotency result retention and parameter consistency.
Normalized states:
PENDING, SUBMITTED, CONFIRMED, FAILED, UNKNOWN.
UNKNOWN != FAILED.
Old authority retry != new authority authorization.
No executed Nexo race; no formal proof.

### AB104.788R–AB104.811R — adversarial taxonomy formation
The research expanded from reconciliation into concrete database/broker/payment failure classes:
- PostgreSQL isolation anomalies, serialization failure vs external retry, lost update/write skew, crashes around commit/ACK/external request, stale replicas, failover/restart, correction races, old-incarnation events, refund races, precision, partial multi-account transfer.
- RabbitMQ manual ACK at-least-once, requeue/redelivery, publisher-confirm loss, duplicate/retransmission, poison messages, in-flight ordering, ownership/rebalance, delayed duplicate, downstream uncertainty.
Canonical working 20-class taxonomy:
1 operation identity collision
2 payload-binding conflict
3 duplicate delivery/retry
4 acknowledgement ambiguity
5 transaction isolation anomaly
6 commit/apply separation
7 stale observation/order
8 state-machine transition race
9 authority-generation/fencing race
10 worker ownership/rebalance race
11 external-effect ambiguity
12 reconciliation consistency/retention
13 ledger conservation/multi-account invariant
14 correction/reversal
15 idempotency retention/reuse
16 broker/workflow liveness and poison-message behavior
17 recovery/restart continuity
18 namespace/incarnation confusion
19 authentication/source-validity failure
20 cross-domain atomicity boundary
This is a working taxonomy, NOT a completeness proof.

### AB104.812R–AB104.824R — cross-product and interaction grammar
Required cross-products researched:
1 fencing + retry
2 serialization/isolation failure + external effect
3 rebalance/ownership + delayed response
4 correction/reversal + stale evidence
5 retention/compaction expiry + redelivery/retry
6 recovery/restart + namespace/incarnation reuse
7 cancellation/timeout + external effect
8 poison-message liveness + terminal/UNKNOWN
Then expanded through NIST combinatorial testing and FaultFuzz.
Interaction grammar:
G=(A,T,Q,B,O,E)
A predicate axes; T temporal relations; Q arity (2/3 default, 4+ only if causally necessary); B protected boundary; O outcomes; E evidence condition.
Temporal relations include BEFORE/AFTER/OVERLAPS/DURING/CONCURRENT/RETRY-AFTER/RECOVERY-BETWEEN and normalized PRE/POST/OVERLAP/RETRY/RECOVERY/CORRECTION.
Candidate interactions I1 onward must be reduced by semantic equivalence, reachability, protected-boundary distinction, and concrete evidence.

### AB104.825R–AB104.838R
Refined W13/W14/W2, provenance/authentication/authority interaction, durable intent + external effect + ACK loss + retry, effect-journal distinctions, confirmed-effect correction/reversal, freshness, INCOMPARABLE/CONFLICTING, idempotency expiry and parameter binding.
Key distinctions:
- ID/IntentDurable
- EffectKnowledge
- DedupCapability
- AckKnowledge
- NEWER / EQUAL-DUPLICATE / OLDER / INCOMPARABLE
- CONFLICTING only when scoped contract proves mutual incompatibility; it never selects a winner.
- I22 = idempotency expiry → retry → possible second effect; parameterized.
- I23 = same idempotency key + different parameters; absorbed by operation identity/payload binding.
- I24 = provider IN-PROGRESS + coordinator retry; independent candidate.
- I25 = accepted/reserved → authority generation changes → delayed completion; parameterized by resource-side fencing.
- I26 = accepted/reserved → cancellation/expiry → delayed completion; empirically supported semantic interaction but witness not frozen.
- I27 = model-level residual around conflicting transitions; no empirical witness established.
No new top-level class frozen.

## AB104.839R–AB104.862R — current continuation state
### AB104.839R
Fencing phases:
PRE-ACCEPTANCE
ACCEPTED/RESERVED
COMMITTED EFFECT
POST-COMMIT OBSERVATION
F1 stale epoch before acceptance → reject.
F2 stale/current epoch race before acceptance → atomic resource-side comparison.
F3 old epoch accepted/reserved then new epoch → resource lifecycle/reconciliation required.
F4 old epoch commits before new epoch → cannot retroactively prevent.
F5 old epoch after new epoch → resource-side fence should reject.
Fencing = prevention, not outcome oracle.

### AB104.840R
I24 attack: IN-PROGRESS cannot be UNKNOWN/CONFIRMED/FAILED aliases.
ACCEPTED_OR_RESERVED retained as semantic audit category, not universal enum.
F2 requires atomic admission/compare-and-accept.
F3 requires explicit lifecycle/reconciliation semantics.

### AB104.841R–AB104.843R
I24 remains independent.
ACCEPTED_OR_RESERVED cannot safely collapse into UNKNOWN or CONFIRMED universally.
Minimum boundary semantics: admission authority, generation/identity check, durable provider state, reconciliation path, historical evidence.
I25/I26 retained as distinct candidates.
Minimum lifecycle graph introduced.

### AB104.844R
A save attempt was blocked by tool security. DO NOT claim its prose was persisted unless independently confirmed. This is a required epistemic correction.

### AB104.845R–AB104.848R
Typed-event model established four dimensions:
- Attempt state
- Resource lifecycle
- Effect knowledge
- Correction/reversal
Freshness is partial; timestamps alone insufficient.
INCOMPARABLE ≠ CONFLICTING.
CONFLICTING requires scoped contract-proven incompatibility and no ordering; no winner selection.
No independent production witness for unresolved conflict found.

### AB104.852R–AB104.855R
Executable/open-source cross-checks:
- Temporal activities can execute multiple times.
- Stable idempotency keys and receiver-side protection are distinct.
- I27 remained model-level residual.
- Temporal cancellation and Adyen/Stripe lifecycle evidence refined I25/I26.
- Kafka producer epoch and EtcFS generation guards showed resource-side fencing can absorb I25 in applicable contracts.
Verify exact historical commit SHAs from GitHub before relying on assistant-reported hashes.

### AB104.856R
Concrete Adyen lifecycle:
- delayed/manual capture;
- cancellation async;
- CAPTURE can later become CAPTURE_FAILED;
- EXPIRE is terminal in its declared lifecycle;
- CAPTURE success is not irrevocable terminal effect.
Saved commit: 8d88951b32518ebda3f7f6e79595ac18cc36a9ba.

### AB104.857R
Corrected shorthand:
DO NOT model COMMITTED → FAILED for Adyen capture case.
Correct:
ACCEPTED/SUBMITTED → downstream pending → FAILED.
Candidate invariants INV-TE-05.
Saved commit: f56fcdba08fad36508fd9cf4dd8e054553646ddc.

### AB104.858R
Typed effect graph + freshness closure:
- legal: ACCEPTED/SUBMITTED→FAILED, ACCEPTED/SUBMITTED→COMMITTED, COMMITTED→CORRECTED/REVERSED;
- UNKNOWN→COMMITTED/FAILED only with authoritative evidence;
- forbidden generic resurrection/regression/duplicate-effect assumptions.
Saved commit: 2bc93ccc0470cd64d11da501682b8b72cab684c0.

### AB104.859R
Attack of unresolved CONFLICTING same-resource terminal events.
Reduction:
identical identity → duplicate;
provider sequence/causal relation → newer/older;
no order → incomparable;
incomparable + proven incompatibility → conflicting.
No production witness found; W19 not frozen.

### AB104.860R
Full typed effect-state/freshness closure:
NOT_ACCEPTED, ACCEPTED_OR_RESERVED, SUBMITTED, IN_PROGRESS, COMMITTED, FAILED, EXPIRED, CANCELLED, CORRECTED, REVERSED, UNKNOWN.
No missing generic legal transition requiring new state family.
Saved commit: a3f1cb917498e74d08345d2e84b056d590d0eec8.

### AB104.861R
Concrete Adyen evidence:
capture success=true → submitted downstream → later CAPTURE_FAILED.
Semantic witness YES; provider evidence YES; vulnerable implementation NOT ESTABLISHED; new top-level class NO.
INV-TE-06 / INV-TE-07 candidates.
Saved commit: c0ff643b36f70453404e37e8fa76c1874061b374.

### AB104.862R
Concrete correction/reversal evidence:
SUBMITTED → terminal/settled → CORRECTED/REVERSED.
Adyen exposes refund/reversal lifecycle events including REFUNDED_REVERSED and SETTLED_REVERSED; Event Sourcing evidence supports immutable original history + compensating correction events.
Conclusion: I19 remains correct semantic family; no new top-level interaction/class justified.
INV-TE-08 / INV-TE-09 candidates.
Saved commit: c5d59e3023de348cdfa43cab461b10c16fcd93a4.

## CURRENT DISPOSITION
I19: empirically supported semantic family / witness not frozen.
I20: independent / untested.
I21: distinct / untested.
I22: parameterized.
I23: absorbed.
I24: independent / untested.
I25: parameterized coverage.
I26: empirically supported semantic interaction / witness not frozen.
I27: model-level residual / empirical witness not established.
W19: NOT FROZEN.
W20: NOT FROZEN.
20 top-level classes: UNFROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture freeze: NOT DECLARED.

## HISTORICAL NON-NEGOTIABLE CARRYOVER
AB56 did NOT close FutureObs_PAA.
Status that must persist:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED
AB55 only executed minimal boolean 64 states × 6 total orders = 384 per attack for 8 attacks; it was NOT full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## EXACT NEXT ACTION
AB104.863R:
Attack the ordering boundary around correction/reversal:
- concrete provider/executable implementations;
- duplicate correction events;
- delayed correction;
- out-of-order correction;
- stale pre-correction projection racing reconciliation.
Question:
Does I21 (stale observation/order) fully cover correction + freshness + reconciliation, or is there a genuinely independent interaction?
Requirements:
- seek concrete incident/test/code evidence;
- documentation alone cannot freeze a witness;
- if reducible, absorb it;
- if independent and evidenced, preserve as a candidate without prematurely freezing;
- do not add a top-level class merely because a Boolean combination is logically possible.

## NEXT CHAT START RULE
When the user says CONTINUITY or CONTINÚA:
1. Recover THIS handoff starting at AB104.759R.
2. Fetch authoritative GitHub state before making continuity claims.
3. Start fresh research specifically for AB104.863R.
4. Do not ask the user to repeat context.
5. Do not revert to the mistaken AB104.862R-only handoff.
