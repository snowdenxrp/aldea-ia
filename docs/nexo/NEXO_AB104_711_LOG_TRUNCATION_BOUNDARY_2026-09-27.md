# NEXO AB104.711 — Log truncation as explicit epistemic state
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Current Kafka finding

Kafka 4.1 exposes LogTruncationException when a consumer detects that its position or fetched data is inconsistent with the current log because records were truncated. OffsetOutOfRangeException represents an invalid requested position. The consumer API distinguishes these from an ordinary empty poll. citeturn0search0turn0search4

## Frozen decision

Do not collapse truncation into NOT_OBSERVED.

Introduce an observational state:

LOG_TRUNCATION_UNRESOLVED

This means the verifier's read window lost continuity: the partition changed underneath the verifier in a way that prevents a clean absence claim from the collected evidence.

## Classification

- Exact identity observed before truncation -> PRESENT remains valid.
- Truncation/offset invalidation before any exact identity -> LOG_TRUNCATION_UNRESOLVED.
- OffsetOutOfRange during setup before observation -> HARNESS_SETUP_FAILURE unless a deliberately bounded retry establishes a fresh valid starting position before the observation deadline begins.
- Empty polls without truncation -> continue under AB104.699.

## Critical rule

A log-truncation event is not proof that the effect never existed. It only proves that the intended observation path no longer has a continuous readable history sufficient for the requested absence claim.

Therefore the state is epistemic, not a broker failure claim.

## Why this is stronger than HARNESS_SETUP_FAILURE

Once observation has begun, truncation can invalidate evidence already collected about the absence of the target after a position boundary. Treating it merely as harness failure loses the causal fact that the observation history was disrupted.

The harness may additionally record the underlying Kafka exception and affected partition/offsets.

## Frozen state machine

SETUP -> HARNESS_SETUP_FAILURE | VERIFYING
VERIFYING -> PRESENT | READ_PATH_ERROR | LOG_TRUNCATION_UNRESOLVED | NOT_OBSERVED

NOT_OBSERVED requires continuous successful reads through the deadline.
LOG_TRUNCATION_UNRESOLVED is terminal and never converts to NOT_OBSERVED automatically.

## Status

VERIFIED:
- Kafka distinguishes truncation/invalid-offset conditions from empty polling;
- truncation can invalidate continuity of an absence observation;
- absence must not be inferred across an unresolved log discontinuity.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step

AB104.712: determine whether a post-truncation re-seek can ever preserve the original experiment's observation semantics, or whether recovery must always start a new observation epoch rather than silently continuing the old one.