# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.217

## Persisted
- Research: docs/nexo/NEXO_AB104_217_COMPACTION_CERTIFICATE_ADVERSARIAL_ATTACKS_V1_2026-09-26.md
- Commit: 3180110b059c188b5800f71794bbe3bcd01ab5a4

## Findings
- Valid certificate does not imply content availability, complete history, current authority, current freshness, or external effect committed.
- Same range with two valid certificates is a fork/conflict, never resolved by timestamp/arrival.
- Full archive replacement remains undetectable if the trust anchor itself is replaceable; anchor continuity remains fundamental.
- Missing archive index/record is not proof of non-existence.
- UNKNOWN must survive compaction as an unresolved historical identity and continue blocking blind replay.
- Crash during seal/compact needs explicit durable state transitions; incomplete metadata must not authorize deletion or re-execution.
- Concurrent recoverers need durable claim/fence semantics; observation order is not authority.
- Snapshot + archive must bind branch/root/epoch/predecessor; individually valid components can form an invalid combined history.

## Code correction preserved
- Current effect-adapter exception path returns EFFECT_OUTCOME_UNKNOWN without persist().
- Current test expects that UNKNOWN result inside exceptionJournal. Static inspection alone cannot establish test pass; no verification claim made.

## Next exact mission
AB104.218: research certificate semantics for UNKNOWN/PARTIAL, sub-effects, payload fingerprints, evidence references and reconciliation horizons.

## DO-NOT-REPEAT
- No certificate-as-commit shortcut.
- No archive absence => NOT_COMMITTED.
- No silent fork choice.
- No architecture implementation/V21.
- No unsupported formal/CI/fault-injection claims.