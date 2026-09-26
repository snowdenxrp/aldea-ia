# NEXO AB104.210 — RETENTION HORIZONS, IDEMPOTENCY EXPIRY, RESTORE CONTINUITY — V1 — 2026-09-26

## Status
Research-only. No architecture implementation, no V21, no formal verification claim.

## Objective
Determine when an old UNKNOWN_EXTERNAL can still be resolved and when target retention/restore semantics make resolution impossible without new evidence.

## Findings
1. Idempotency is a contract of the target, not a property Nexo can infer from an operation_id alone. RFC 9110 defines idempotency in terms of repeated identical intended effects; HTTP Idempotency-Key work explicitly allows server-defined expiry and recommends a request fingerprint. AWS guidance likewise describes storing the key with the response so retries can recover the prior result.
2. Therefore every external EffectContract needs an explicit retention/expiry semantic:
   - key namespace/scope;
   - payload fingerprint binding;
   - retention start and end conditions;
   - behavior after expiry;
   - whether historical lookup remains possible after key expiry;
   - target incarnation/restore semantics.
3. Critical boundary: if UNKNOWN_EXTERNAL survives beyond the target's idempotency/operation-record retention horizon and no independent durable receipt or historical ledger exists, Nexo may permanently lose the ability to distinguish "never accepted" from "accepted then forgotten". The correct result remains UNKNOWN_EXTERNAL; expiry must never be converted into NOT_COMMITTED.
4. Reuse after expiry is dangerous for historical reconciliation: the same key may represent a later logical request. Nexo therefore must not use key equality alone to correlate old and new operations. A stable Nexo operation identity plus payload fingerprint, target scope/incarnation, and target-side historical continuity are needed.
5. A target-side NOT_COMMITTED response is authoritative only if the target guarantees that the lookup covers the entire relevant acceptance horizon and its storage/history has not been rolled back past that horizon. A negative query against a restored older snapshot is insufficient.
6. Target restore creates a second continuity problem: even a durable operation registry can become misleading if restored to a point before the operation. Reconciliation therefore needs target incarnation/version/checkpoint evidence, or another trusted continuity mechanism, before treating absence as proof.
7. Cross-system receipts need issuer trust and binding. A broker ACK, transport receipt, or gateway response can prove an intermediate event, but not necessarily final target commitment. Evidence must identify exactly which boundary the receipt covers.
8. Transactional outbox evidence reinforces that publication/processing can be duplicated across crashes; downstream idempotency is therefore a semantic contract, not a magic exactly-once guarantee.
9. Partial/streaming effects are not safely collapsed into binary committed/not-committed. A target may durably accept a request while only some externally visible sub-effects complete. Reconciliation should preserve states such as ACCEPTED, PARTIAL, COMMITTED, FAILED, and UNKNOWN when the target contract exposes them.
10. Candidate minimum EffectContract fields (research model, not implementation):
   operation_id; effect_identity; payload_fingerprint; target_identity; target_incarnation; authority_epoch/root; idempotency_scope; retention_horizon; lookup_semantics; absence_guarantee; receipt_type; receipt_binding; restore/rollback semantics; partial-effect semantics; reconciliation_deadline.
11. Candidate UNKNOWN lifecycle:
   UNKNOWN_EXTERNAL -> RECONCILING -> EXTERNALLY_COMMITTED | NOT_COMMITTED | PARTIAL | UNKNOWN_PERMANENT.
   UNKNOWN_PERMANENT is not a claim that the effect did not happen; it means the available evidence can no longer resolve the historical fact.
12. Safety rule: expiration is an evidence boundary, never an execution permission. If an old UNKNOWN cannot be resolved, issuing a new effect requires a new explicit operation identity and an independently justified decision; it must not silently reuse the old identity.

## External evidence
- RFC 9110: idempotent methods can be retried after communication failure because repeated identical intended effects are equivalent; this does not mean arbitrary side effects become exactly-once.
- IETF Idempotency-Key draft -07: server-defined expiry and optional payload fingerprint; key reuse with a different payload is prohibited.
- AWS Well-Architected 2025: idempotency tokens let services recognize repeats and return the stored prior response; exactly-once behavior is difficult in distributed systems.
- Transactional outbox: relay can publish more than once after a crash before recording publication.
- AWS Durable Execution guidance: at-least-once replay is safe only for idempotent operations; external side effects require appropriate semantics.

## Code study
The canonical repo code-search surface was queried in AB104.209 for operation_id, effect_identity, idempotency, reconcile, CommitRecord, UNKNOWN_EXTERNAL, fence, receipt, and outbox with no exact matches returned. AB104.210 therefore makes no implementation claim. Future code study must trace actual effect boundaries once concrete files/symbols are found.

## Residuals carried unchanged
TERNARY_MATH_GAP=FOUND
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED

## DO-NOT-REPEAT
Do not equate expired idempotency key with NOT_COMMITTED; absence after restore with historical absence; gateway/broker ACK with final target commit; operation_id equality with proof; idempotency with fencing; exactly-once wording with a universal distributed guarantee. Do not rewrite uncertainty history. No V21. No unsupported formal/CI/fault-injection/security claims.

## Exact next action — AB104.211
Study partial/streaming external effects and reconciliation state machines in concrete systems, including acceptance-vs-completion receipts, sub-effect identities, cancellation/compensation, target-side deduplication, and crash points between sub-effects. Then return to repository code study with broader structural searches rather than exact keyword-only searches.
