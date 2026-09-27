# NEXO AB104.701 — Consumer close and hidden commit boundary
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact current Kafka finding

Kafka 4.1.2's close semantics may complete pending commits and leave a consumer group when the consumer uses group membership; if auto-commit is enabled, close may commit current offsets. With enable.auto.commit=false, the verifier does not have background auto-commit enabled. The current API still permits close to perform group/coordination cleanup when group membership exists. citeturn0search0turn0search1

## Frozen base-test decision

The verifier uses manual assign() rather than subscribe(), and enable.auto.commit=false. Therefore it does not need consumer-group offset commits for the observation path.

However, close() remains cleanup, not evidence. The test must freeze the observation result BEFORE close().

## Stronger isolation choice

Because manual assign avoids dynamic group membership, the verifier should not rely on group leave/rebalance semantics at all. The base verifier records no committed consumer offset and performs no commitSync/commitAsync.

If the current Kafka API requires a cleanup timeout, use a bounded close operation after evidence freeze. Any close exception becomes CLEANUP_ERROR and must not rewrite PRESENT, NOT_OBSERVED, or READ_PATH_ERROR.

## Hidden-commit boundary

The following are forbidden in the base verifier:
- enable.auto.commit=true;
- commitSync();
- commitAsync();
- subscribe() solely for convenience;
- interpreting a successful close as evidence that the target record was committed.

The verifier's evidence is the direct record observation, not Kafka consumer offset state.

## Cleanup classification

Observation terminal state is frozen before close:
- PRESENT remains PRESENT even if close fails;
- NOT_OBSERVED remains NOT_OBSERVED only if its read path had already completed successfully;
- READ_PATH_ERROR remains READ_PATH_ERROR;
- cleanup failure is appended as independent CLEANUP_ERROR.

No cleanup result may upgrade or downgrade the observation claim.

## Important correction to earlier terminology

"Close cannot alter verifier evidence" is too strong if interpreted as literally having no broker interaction: close can perform coordination/cleanup depending on consumer mode. The correct claim is narrower:

`close() cannot alter the already-frozen observation classification.`

## Status

VERIFIED:
- current close may perform pending commit/group cleanup;
- auto-commit can commit during close, so it must be disabled;
- manual assignment + no commit APIs minimize coordination surface;
- close is cleanup and must occur after evidence freeze.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.702: inspect the exact current manual-assignment consumer behavior around group.id absence and determine whether the verifier can omit group.id entirely, eliminating consumer-group coordination from the evidence path.