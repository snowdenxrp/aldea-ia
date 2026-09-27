# NEXO AB104.606 — CAS/revision + crash semantics and fault-injection scenarios
Date: 2026-09-27
Status: research only.

## Evidence
- etcd KV operations are durable and strictly serializable; revisions form a logical ordering. Linearizable reads reflect current consensus, while serializable reads may be stale. Watch delivery is not itself linearizable, so consumers must validate revisions. 
- Transactional outbox solves the local DB+outbox dual-write problem, but relays can publish duplicates. AWS explicitly requires idempotent consumers; an inbox-style atomic dedup marker + side effect avoids the check-then-act crash window.

## Fault scenarios
FI-1 OUTBOX_PUBLISH_THEN_CRASH: DB+outbox committed; relay publishes EffectID; relay crashes before marking sent. Retry publishes same EffectID. Expected: downstream dedup/inbox accepts at most one logical effect; duplicate delivery is recorded as duplicate evidence, not a new authorization.
FI-2 OUTBOX_CRASH_BEFORE_PUBLISH: outbox committed; relay crashes before broker submission. Expected: durable outbox remains pending; retry is same logical operation, not a new EffectID.
FI-3 CONSUMER_EFFECT_THEN_ACK_CRASH: downstream effect committed; consumer crashes before ack/dedup persistence. Expected: retry MUST reconcile/dedup atomically; never infer NOT_COMMITTED from missing ack.
FI-4 DEDUP_MARKER_THEN_EFFECT_SPLIT: if dedup marker and business effect are separate transactions, crash can produce marker-without-effect or effect-without-marker. Expected: protected consumer uses atomic marker+effect where possible; otherwise UNKNOWN/reconciliation.
FI-5 ETCD_CAS_SUCCESS_CLIENT_TIMEOUT: transaction may be durably committed while client response is lost. Expected: NO_RESPONSE != NOT_COMMITTED; reconcile using operation/commit identity and revision before retry.
FI-6 ETCD_SERIALIZABLE_READ_AS_FINAL_GATE: stale member-local read used to authorize mutation. Expected: reject; final gate uses linearizable/authoritative read or equivalent protected evidence.
FI-7 WATCH_AS_AUTHORITY: missing/delayed watch event treated as proof state never changed. Expected: reject; watch is notification/evidence and current state requires authoritative read/revision check.
FI-8 REVISION_ONLY_IDENTITY: revision reused/ambiguous across restored/incarnated authority domains. Expected: revision is scoped evidence, never the complete authority identity.
FI-9 EXTERNAL_EFFECT_AFTER_LOCAL_CAS: local CAS succeeds, provider mutation times out. Expected: external outcome UNKNOWN until provider reconciliation; local CAS cannot mint external COMMITTED.
FI-10 RETRY_WITH_NEW_ID_AFTER_UNKNOWN: external effect may have committed, but retry uses a new EffectID. Expected: prohibited for same logical effect; reconcile original identity first.

## Derived Nexo gates
G1: local durable commit, message delivery, and external effect outcome are three separate claims.
G2: CAS/revision evidence is scope-bound by store incarnation/domain.
G3: retry preserves logical identity unless reconciliation proves NOT_COMMITTED.
G4: acknowledgement loss creates UNKNOWN, not rollback.
G5: final admission cannot rely on stale serializable reads or watch absence.
G6: dedup state and side effect should share atomicity boundary; otherwise unresolved ambiguity remains.

## Next
AB104.607: inspect actual etcd transaction API/code and outbox/inbox implementations for how compare predicates, revisions, duplicate markers, and retry identity are represented; map them to Nexo evidence records without treating implementation fields as universal semantics.