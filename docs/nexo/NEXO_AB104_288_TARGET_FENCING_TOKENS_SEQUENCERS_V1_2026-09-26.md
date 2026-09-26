# NEXO AB104.288 — Target-side fencing tokens and sequencers

Date: 2026-09-26
Status: RESEARCH ONLY — no architecture implementation or semantic freeze.

## Evidence studied
Google's Chubby paper describes lock sequencers carrying the lock name, mode, and lock generation number; protected servers are expected to validate the sequencer and reject it when it is no longer valid. This directly addresses delayed/reordered requests from stale lock holders. citeturn0search0turn0search8
Chubby also has lock-delay as an imperfect fallback for servers that cannot validate sequencers; the paper explicitly treats it as risk reduction rather than equivalent protection. citeturn0search24

## Findings
1. A fencing token is useful only when the protected resource actually checks it at the effect boundary. A token held only by the coordinator is not fencing.
2. Monotonic generation numbers let the target reject operations from superseded owners. The critical property is receiver-side validation, not merely token issuance.
3. Token validity must be scoped. Candidate Nexo bindings include authority/resource identity, generation/epoch, target incarnation, operation identity, and payload fingerprint; exact schema remains undecided.
4. Lease expiration alone is insufficient against delayed messages: an old client can remain unaware that it lost authority. Sequencer/fencing makes the stale request rejectable at the receiver.
5. A lock-delay/grace period can reduce delayed-message risk when the receiver cannot validate tokens, but it is not equivalent to authoritative fencing and does not provide the same evidence semantics.
6. A valid fencing token proves that a request was presented under an accepted generation only if the receiver's validation state is authoritative. It does not by itself prove the external mutation committed.
7. Fencing prevents stale execution; it does not solve post-send UNKNOWN. The effect still needs an authoritative commit/receipt boundary and reconciliation path.
8. Therefore the strongest research candidate remains: authority generation/fence + target incarnation + operation identity/fingerprint must be checked at or atomically with the protected mutation, while historical effect outcome remains a separate evidence question.

## Nexo carry-forward invariants
`TOKEN_ISSUED != EFFECT_AUTHORIZED` unless the target validates the token against current authoritative state.

`TOKEN_ACCEPTED != EFFECT_COMMITTED` unless token validation and mutation share the same protected commit boundary.

`LEASE_EXPIRED != EFFECT_NOT_COMMITTED`.

## Explicit non-claims
- No architecture selected.
- No formal verification performed.
- No implementation performed.
- No semantic freeze declared.
- Chubby's mechanism is evidence for a distributed-systems pattern, not proof of Nexo correctness.

## Next exact research step
AB104.289 — investigate fencing-token persistence, target restore/incarnation changes, and how sequencer state survives/rejects rollback so a restored target cannot accept stale pre-restore authority.