# NEXO CONTINUITY CHECKPOINT — AB104.287

Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main

## Completed
- AB104.287 researched using Raft and current etcd documentation.
- Research commit: 0f93f7276508dea7ed68cb727c0571fd236e5a10

## Carry-forward findings
- Raft/consensus can linearize the state it controls; it does not automatically linearize arbitrary external resources.
- etcd atomic transactions show the stronger pattern of checking guards and applying mutations in one target-side atomic boundary.
- External fencing must be enforced at the actual mutation boundary; coordinator-side stale authorization is insufficient.
- Mutation and receipt sharing one atomic boundary is stronger evidence than a receipt in a separate domain; otherwise crash gaps can remain UNKNOWN.
- Nexo recovery frontier remains multidimensional/partial-order rather than a single scalar revision.

## Constraints preserved
- Research/study only.
- No architecture implementation, V21 patching, formal verification, or semantic freeze.
- Historical AB50→AB58 unresolved findings remain preserved.
- No overwrite/delete/silent migration.

## Next exact action
AB104.288 — investigate target-side fencing/token mechanisms and lease/sequencer patterns, including Chubby-style sequencers and modern resource-version fencing, for stale-authority rejection at the actual effect boundary.

## DO-NOT-REPEAT
- Consensus commit != external effect commit without shared/equivalent protected boundary.
- Client pre-read authorization != target-side acceptance.
- A domain revision != a global Nexo recovery frontier.