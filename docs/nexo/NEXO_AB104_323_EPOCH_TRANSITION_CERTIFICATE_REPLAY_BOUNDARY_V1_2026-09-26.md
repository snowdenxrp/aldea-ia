# NEXO AB104.323 — Epoch transition certificates and replay boundary

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Epoch transitions create a race boundary: evidence from the previous epoch may arrive after the new epoch is active. RFC 9334 recommends explicit epoch handling and notes transition races; possible mechanisms include signed epoch counters, current/previous epoch windows, retries, or buffering. citeturn0search0turn0search28

BFT systems likewise bind progress to views/QCs and persist safety-critical locked state across recovery; a certificate's validity is therefore inseparable from the configuration/view context in which it was created. citeturn0search11turn0search12

## Nexo consequence
A transition certificate should establish a **new authority frontier**, not silently extend old execution authority. Old-epoch certificates may remain historical evidence, but admission to current execution requires proof that the transition was accepted under the new authority/configuration.

Candidate transition binding:
`old_epoch + new_epoch + old_config_digest + new_config_digest + transition_statement_digest + predecessor_digest + quorum/authority evidence + transition frontier`

Candidate rules:
1. Old certificate + new epoch observed => historical evidence, not automatically executable authority.
2. New certificate without authenticated predecessor/transition lineage => `RECONFIG_UNKNOWN`.
3. Evidence from an old epoch received after transition must be classified using an explicit epoch window/freshness policy; timestamp alone is insufficient.
4. Replaying an old transition certificate must not recreate a previously superseded authority frontier.
5. Conflicting transition certificates => `CONFLICT`; do not resolve by numeric epoch alone without trusted lineage/configuration semantics.

## Candidate states
`TRANSITION_AUTHENTICATED | TRANSITION_PENDING | HISTORICAL_ONLY | RECONFIG_UNKNOWN | REPLAY_REJECTED | CONFLICT`

No final transition protocol or epoch window selected.

## Next
AB104.324 — study rollback/recovery across an authority transition: whether restoring pre-transition state can resurrect old certificates, and what monotonic barrier is required before effects resume.
