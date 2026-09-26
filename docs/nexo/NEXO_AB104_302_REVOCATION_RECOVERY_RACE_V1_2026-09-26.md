# NEXO AB104.302 — Revocation/recovery races
Date: 2026-09-26
Status: RESEARCH-ONLY

## Findings
1. A valid authorization can become stale between authorization and effect; the decisive check belongs at the protected effect boundary. citeturn0search2turn0search6
2. Crash/restart makes the race harder: restoring pre-revocation state can resurrect authority unless recovery is itself fenced by newer authoritative state.
3. A monotonic generation/epoch is useful only if the effect sink enforces it. A stale worker can remain alive after its authority is replaced; receiver-side fencing rejects old generations. citeturn0search1turn0search0
4. The critical race is not merely `revoke vs execute`; it is `revoke -> recovery -> execute`, including delayed messages, queued work, stale caches, and alternate effect paths.
5. Cancellation is not equivalent to revocation finality. A queued or already accepted act may still execute unless every protected sink checks the current authority generation.
6. Recovery must not self-authorize from the very historical state whose validity is under question. The recovered node needs an externally/authoritatively established current fence before resuming protected effects.
7. Candidate invariant: `REVOCATION_COMMITTED < EFFECT_COMMIT => OLD_AUTHORITY_MUST_BE_REJECTED`, provided the sink is fully mediated and the current revocation/fence state is authoritative.
8. If authoritative ordering or path coverage cannot be established, result remains `UNKNOWN`, not safe/unsafe by assumption.

## Important boundary
The cited 2026 IETF draft explicitly limits its prevention claim to protected consequences with complete mediation and an atomic/equivalent final check-and-commit ordering. It is an Internet-Draft, not a settled standard. citeturn0search6

## Non-claims
No architecture implementation, formal verification, semantic freeze, or production-security claim.

## Next exact step
AB104.303 — study multi-hop/delegated authority during revocation and recovery: how stale delegated work is fenced when intermediate agents, queues, and providers retain old authority.
