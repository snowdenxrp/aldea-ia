# NEXO AB104.309 — Target idempotency, receipts, and UNKNOWN_EXTERNAL

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Target-side idempotency can make a retry safe when the target durably binds an operation identity to the same request semantics and can return the prior result. It does not by itself prove that an ambiguous request completed unless the target can provide authoritative state/receipt evidence.

## Evidence
AWS documents idempotency tokens as a way to safely retry mutating requests and describes parameter mismatch as a conflict. Microsoft documents that exactly-once guarantees of a broker do not automatically cover external side effects. These support separating duplicate suppression from effect observation. citeturn0search1turn0search4turn0search8

## Nexo consequence
1. Target idempotency record should bind operation identity plus effect-determining request semantics; same identity with materially different semantics => CONFLICT, not a second operation.
2. A successful idempotency lookup/receipt can resolve UNKNOWN_EXTERNAL only when the receipt is authoritative for the target's actual commit boundary.
3. A missing idempotency record is not automatically NOT_COMMITTED: retention expiry, replication lag, restore, or incomplete coverage can leave the outcome unknown.
4. If a timeout occurs after the target may have committed, retry is permitted only under the target's proven idempotency contract or after authoritative reconciliation.
5. Receipt evidence must be scoped to target identity/incarnation and operation identity; historical receipts do not automatically establish current authority.
6. Idempotency retention/expiry must be modeled explicitly. Expiry removes deduplication evidence; it does not prove absence of the historical effect.

## Candidate resolution states
- IDEMPOTENT_REPLAY_CONFIRMED: target returned authoritative prior result.
- EFFECT_CONFIRMED: authoritative target evidence establishes commit.
- DEFINITIVELY_REJECTED: target provides authoritative rejection with no commit.
- UNKNOWN_EXTERNAL: outcome remains unresolved.
- CONFLICT: same operation identity is bound to incompatible effect semantics/evidence.

## Explicit non-claims
Idempotency is not a universal exactly-once mechanism and is not equivalent to fencing, authorization, or historical proof of absence.

## Next
AB104.310 — study idempotency retention/eviction, target restore, and how deduplication evidence interacts with incarnation changes.
