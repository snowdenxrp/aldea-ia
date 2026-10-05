# NEXO AB105 — W1→D1 HB Closure Review — 2026-10-05

Kafka source pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Purpose
Closure review after the production-path source audit. This is not a new runtime experiment.

## Result
The inspected production paths establish:
- MetadataLoader -> AclPublisher -> W1: identified.
- ENQUEUE -> DEQUEUE: identified through RequestChannel/ArrayBlockingQueue publication.
- DEQUEUE -> D1: identified by handler program order.

No production synchronizes-with/publication edge was identified that closes:
W1 -> [cross-domain publication] -> ENQUEUE -> DEQUEUE -> D1.

## Critical distinction
Temporal order such as W1 < ENQUEUE, D0_RETURN < client request, or D1 after ENQUEUE is not by itself Java Memory Model happens-before. HB requires program order and/or synchronizes-with edges and transitive closure.

## Volatile data
StandardAuthorizer.data is volatile, but incremental ACL mutation replaces the plain aclCache field inside the existing StandardAuthorizerData instance. The volatile access to data therefore does not, by itself, establish publication of the later nested aclCache assignment when the same data object remains in use.

## Epistemic state
HB(W1->D1): UNKNOWN / NOT IDENTIFIED.
Stale-read execution: NOT OBSERVED / NOT DISPROVEN.
Security vulnerability: NOT ESTABLISHED.

This is a bounded source-audit conclusion, not proof of absence or proof that stale visibility is impossible.

## Reconciliation
AB105.117R remains an existing verified raw real-broker witness. Do not recreate it.
Historical run 370778 versus authoritative AB105.117R run 37098764557 remains an identity reconciliation issue; artifact 11265332252 is authoritative under 37098764557 and must not be counted twice.

## DO-NOT-REPEAT
PR92, PR93, PR94/G0, TLC, and artificial synchronization additions are not repeated.

## Next action
Perform final claim-language sweep over prior AB105 documentation for overclaims. Any claim of proven W1->D1 HB, proven stale-read execution, or vulnerability must be downgraded unless backed by an independent accepted evidence chain.
