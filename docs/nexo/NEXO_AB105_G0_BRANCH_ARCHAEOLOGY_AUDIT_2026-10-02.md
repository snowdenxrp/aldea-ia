# NEXO AB105 G0 — branch archaeology audit 2026-10-02

## Why this audit exists
The discovery of `nexo-ab105-g0-compile-probe-ci` indicates the repository contains prior experimental paths that may already solve, partially solve, or duplicate pieces of the current ordering witness. Therefore the current PR #94 workflow must not be treated as the only implementation history.

## Branches inspected
The G0 branch family includes:
- nexo-ab105-g0-authorize-snapshot-diagnostic
- nexo-ab105-g0-bootstrap
- nexo-ab105-g0-cache-identity-diagnostic
- nexo-ab105-g0-compile-probe-ci
- nexo-ab105-g0-current-compile-gate
- nexo-ab105-g0-describe-isolation
- nexo-ab105-g0-jmm-causal-window
- nexo-ab105-g0-jmm-causal-window-v2
- nexo-ab105-g0-jmm-direct-race
- nexo-ab105-g0-jmm-direct-race-corrected
- nexo-ab105-g0-jmm-publication-discriminator
- nexo-ab105-g0-multibroker-discriminator
- nexo-ab105-g0-ordering-witness
- nexo-ab105-g0-ordering-witness-run
- nexo-ab105-g0-production-standard-authorizer
- nexo-ab105-g0-propagation-window
- nexo-ab105-g0-propagation-window-discriminator
- nexo-ab105-g0-propagation-window-metadata-warmup
- nexo-ab105-g0-runtime-api-fix-v2
- nexo-ab105-g0-runtime-compile-fix
- nexo-ab105-g0-runtime-design
- nexo-ab105-g0-runtime-exec
- nexo-ab105-g0-runtime-exec-corrected

## Important finding
The branch family contains multiple generations of the G0 harness. At least one older compile-probe path has a clean API usage pattern:
- common Kafka `AclBindingFilter`
- explicit `ResourceType.TOPIC`
- literal topic-name string
- `ResourcePattern(ResourceType.TOPIC, "nexo-g0", ...)`

Other generations contain duplicated/incorrect naming patterns such as using a topic-name constant and a static `ResourceType.TOPIC` under the same identifier. Some also contain duplicate imports or test-only direct `TargetAuthorizer.authorize()` calls that are not equivalent to a real network RPC.

## Scientific consequence
The repository history itself is now an evidence source that must be audited before declaring the current harness design complete. A prior compile-success does not establish runtime correctness, and a prior runtime witness does not automatically establish the current W1→ENQUEUE→DEQUEUE→R1 ordering question.

## Status
- Repository archaeology: IN PROGRESS
- Existing compile-safe API pattern: CONFIRMED
- Existing real-runtime harness generations: CONFIRMED
- Current PR #94 ordering harness: still has known compile defects
- Real ordering witness: NOT EXECUTED
- NEXO_ORDER evidence: NONE
- W1→R1: UNKNOWN
- AB105.116R: UNCHANGED
- AB105.117R: NOT CREATED
- TLC: NOT RERUN

## DO-NOT-REPEAT
Do not assume PR #94 is the first or only G0 implementation. Before writing another harness, compare the prior runtime/JMM/publication branches for reusable executable structure and explicitly classify each piece as compile-only, direct-authorize, real-RPC, or ordering-witness evidence.
