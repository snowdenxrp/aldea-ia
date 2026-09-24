# Nexo V18 Continuity Addendum — 2026-09-23

V18 binds committed effects to owner + generation + authorityEpoch at the modeled protected commit boundary. Revoke increments authorityEpoch and makes the prior authorization tuple stale; reauthorization increments both generation and authorityEpoch. This separates ownership lineage from authorization era.

Audit result: a committed historical effect must remain recorded after later revocation, while revocation must not be interpreted as external cancellation. The model still lacks a non-vacuous commit-vs-revoke order relation and an explicit independent reauthorization authority. No SANY/TLC verification was performed.

Artifacts:
- docs/nexo/formal/NEXO_CANONICAL_CORE_V18_AUTHORITY_EPOCH_EFFECT.tla — 3c5d0920f8e9a206af5380594137f845bc87ca4c
- docs/nexo/NEXO_CANONICAL_CORE_V18_AUTHORITY_EPOCH_EFFECT_AUDIT.md — dea40e0859469ca284ce8ceb1cfbbadda7ecfe33
- docs/nexo/NEXO_V18_CONTINUITY_ADDENDUM_2026-09-23.md — this commit

Important: the main continuity log was not overwritten because its current blob SHA was not available in the successful fetch response. This addendum preserves the checkpoint without fabricating a replacement history.
