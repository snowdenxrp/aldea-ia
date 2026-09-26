# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.222

## Persisted
- Research: docs/nexo/NEXO_AB104_222_EVIDENCE_INVALIDATION_PROPAGATION_REVOCATION_STALENESS_V1_2026-09-26.md
- Commit: 10ac371bda61d27c6e392a96c5ea4eeb6b9decd4

## Core result
- Historical fact and current admissibility must be separate.
- Revoking/compromising a root does not rewrite historical claims/effects.
- A claim may remain historically valid while becoming inadmissible for current decisions.
- Dependent derived claims and decisions must be reappraised when a material root becomes stale/revoked/compromised.
- Pending permission must not execute solely because it was authorized before invalidation; it requires current revalidation/fencing.
- REVOCATION, COMPROMISED, STALE, CONFLICTING, UNAVAILABLE and UNKNOWN are distinct states.
- Archive certificate can preserve historical existence without preserving current authority.

## External anchors
- SCITT: transparency provides historical registration/receipt; subsequent management changes are outside the transparency mechanism.
- TUF: expiration/versioning and coherent snapshots help reject stale, rollbacked or frozen metadata.

## Code-study limitation
- Search for revocation/stale/authority epoch/recovery quarantine/permission with exact terms returned no matches in available code-search surface; not proof of absence.

## Residuals
AB50→AB58 ternary/event/reconstruction/semantic/formal gaps unchanged.

## Next exact mission
AB104.223: race conditions between revocation/rotation, decision and effect execution; identify fencing boundary that prevents stale authorization from producing an effect.

## DO-NOT-REPEAT
- revocation != historical erasure
- stale != compromised
- unavailable != NOT_COMMITTED
- old authorization != current permission
- archive history != current authority
- no V21, no architecture implementation, no unsupported verification claims