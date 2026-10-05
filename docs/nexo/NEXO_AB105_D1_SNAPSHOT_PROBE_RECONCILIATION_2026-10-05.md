# NEXO AB105 — D1 Snapshot Probe Reconciliation — 2026-10-05

## Purpose

Reconcile the proposed new D1 `aclCacheSnapshot` structural probe against the already executed AB105 authorize-snapshot diagnostic. This checkpoint records the decision before any new experiment.

## Exact pinned source

Kafka pin:
`99b940733a9f6bc409457dba7108f08421d81e42`

File:
`metadata/src/main/java/org/apache/kafka/metadata/authorizer/StandardAuthorizerData.java`

Verified path:

`authorize() → findAclRule() → AclCache aclCacheSnapshot = aclCache`

The same local `aclCacheSnapshot` is passed to both `checkSection()` calls. `AclCache` is immutable.

## Prior executed diagnostic recovered

Existing branch:
`nexo-ab105-g0-authorize-snapshot-diagnostic`

Checkpoint:
`docs/nexo/NEXO_AB105_G0_AUTHORIZE_SNAPSHOT_DIAGNOSTIC_CHECKPOINT_2026-10-02.md`

Executed evidence:
- run: 37037323460
- job: 110938623014
- artifact: 11240801816
- artifact SHA-256: 6acacf4881843b194ca3c3782b5b5b267184023565daac13f045e813ac3cb18b
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

That diagnostic already observed the internal authorization snapshot boundary and reported no post-return ALLOWED plus no observed post-return authorization using the pre-remove cache identity/snapshot identity. It explicitly classified JMM causality as UNKNOWN.

## Reconciliation

The proposed structural D1 probe would inspect the same local `aclCacheSnapshot` boundary already covered by the prior diagnostic.

Therefore it is **not** promoted to a new experiment merely to obtain another observation of the same boundary.

No workflow is executed by this checkpoint.

No latch, volatile gate, barrier, Future, synchronized block, queue, or other artificial W1→D1 synchronization is introduced.

## Current epistemic state

- W1 → D1 JMM happens-before: UNKNOWN / NOT IDENTIFIED.
- Stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- Security vulnerability: NOT ESTABLISHED.
- W1 → R1: UNKNOWN.
- AB105.117R: EXISTS and remains authoritative VERIFIED_RAW_EVIDENCE; do not recreate.
- TLC: NOT RERUN.

## Decision

The remaining high-value question is not whether another probe can observe the same D1 snapshot. That boundary already has diagnostic coverage.

Future work must target a genuinely different missing edge, if one exists, especially:
`W1 → publication/currentness boundary → request admission`

Any new experiment must demonstrate a new observation point or causal discriminator rather than repeat the existing cache/snapshot diagnostic.
