# NEXO GLOBAL AUDIT-103 — Identity Reuse Under Provider/Cluster Recreation

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Resource identity, queue identity, account/project identity, provider/cluster incarnation, snapshot restore, and cross-provider migration mappings. Attack whether mappings can preserve historical identity without an authoritative continuity proof.

No implementation. No V21. No semantic freeze.

## Fresh evidence

etcd documents that restoring a snapshot overwrites member ID and cluster ID; the restored cluster becomes a new logical cluster while preserving the keyspace contents. This is direct evidence that data continuity does not imply cluster-identity continuity. citeturn0search9turn0search5

Google Cloud Tasks documents a tombstone window after queue deletion during which recreation with the same name can be misleading; callers are instructed to verify creation with GetQueue. The name is therefore not itself sufficient evidence of incarnation continuity. citeturn0search1turn0search0

AWS Durable Execution identifies executions with durable-execution ARNs and exposes execution history keyed to that execution identity; its history events have sequential EventIds and operation IDs. This gives a provider-scoped identity boundary, not an automatic cross-provider continuity proof. citeturn0search2turn0search3

## Findings

RESTORED KEYSPACE != RESTORED CLUSTER IDENTITY

RESTORED DATA != RESTORED PROVIDER INCARNATION

SAME RESOURCE NAME != SAME RESOURCE IDENTITY

SAME QUEUE NAME != SAME QUEUE INCARNATION

SAME ACCOUNT LABEL != SAME AUTHORITY INCARNATION

SAME PROJECT NAME != SAME AUTHORITY HISTORY

PROVIDER RESOURCE ID != GLOBAL IDENTITY

PROVIDER OPERATION ID != GLOBAL EFFECT IDENTITY

EXECUTION ARN != WORLD-EFFECT IDENTITY

EVENT ID != CROSS-PROVIDER EVENT IDENTITY

SNAPSHOT CONTENT EQUALITY != IDENTITY CONTINUITY

STATE EQUALITY != HISTORY EQUALITY

MAPPING EQUALITY != AUTHORITY CONTINUITY

MIGRATION RECORD != PROOF OF COMPLETE HISTORY

CROSS-PROVIDER TRANSLATION != SEMANTIC EQUIVALENCE

AUTHENTIC OLD MAPPING + AUTHENTIC NEW MAPPING != ONE CONTINUOUS AUTHORITY

NEW PROVIDER INCARNATION != ERASURE OF OLD PROVIDER HISTORY

## Critical migration race

Let provider P1 host resource R1 and provider P2 receive a migrated representation R2.

A mapping may state:

R1 -> R2

But that mapping does not by itself prove:

- R2 is the only successor;
- no stale R1 writer can still act;
- every R1 operation is represented in R2;
- every R1 receipt/effect has been transferred;
- the authority epoch is continuous;
- provider-specific operation IDs cannot collide or be confused;
- retention gaps did not remove claim-relevant history;
- revocation state crossed the migration boundary;
- the mapping itself was issued by the current authority.

Therefore:

MAPPING != CONTINUITY PROOF

and:

CROSS-PROVIDER MAPPING + UNKNOWN HISTORY -> UNKNOWN HISTORICAL IDENTITY

## Provider/cluster recreation boundary

The etcd restore behavior is especially important: a snapshot can preserve keyspace data while deliberately creating a new logical cluster identity. citeturn0search9

Thus Nexo cannot use “same database contents” as a sufficient continuity predicate.

Candidate future invariant:

CONTINUITY(resource) requires continuity of:
identity + incarnation + authority + fencing epoch + operation namespace + effect lineage + provenance

Not yet formalized or proven.

## Cross-provider mapping requirements

Any future migration contract must separately bind:

- source provider identity/incarnation;
- destination provider identity/incarnation;
- source resource ID;
- destination resource ID;
- source operation namespace;
- destination operation namespace;
- migration event and authority;
- cutover epoch/fence;
- stale-writer rejection;
- outstanding operation inventory;
- receipt/effect reconciliation;
- revocation state;
- retained-history coverage;
- mapping completeness;
- dependency/provenance closure;
- conflict handling;
- rollback semantics.

A mapping that omits any required dimension cannot automatically be promoted to historical continuity evidence.

## FutureObs_PAA impact

A future observation from P2 can establish facts about R2 under P2's current authority, but cannot automatically establish that every historical fact about R1 transfers to R2.

Therefore:

FUTURE OBSERVATION OF DESTINATION != COMPLETE HISTORY OF SOURCE

and:

CROSS-PROVIDER IDENTITY MAPPING != FUTUREOBS_PAA CLOSURE

## Epistemic state — unchanged

P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

## Mandatory AB55/AB56 carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-104 — migration cutover and stale-writer races: source/destination overlap, fencing propagation, outstanding operations, duplicate effects, delayed receipts, rollback, and whether a cutover can establish a single authoritative effect history.

No implementation. No V21. Preserve UNKNOWN.
