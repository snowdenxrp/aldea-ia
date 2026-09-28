# NEXO GLOBAL AUDIT-056 — REVOCATION SCOPE ALGEBRA / SEMANTIC PARTITIONING
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Result

Scope is not merely a label attached to a revocation. Conflict resolution depends on the semantic relation between target scopes.

Findings:
- intersection, union and subsumption require a defined scope semantics;
- hierarchical scopes can create partial overlap that cannot be reduced to a simple winner;
- wildcard/global revocations need explicit expansion/coverage semantics;
- aliases and source incarnations must not be conflated by stable identifiers alone;
- partial restoration can leave different portions of a scope in different states;
- emergency overlays need explicit scope and temporal boundaries;
- partitioning a scope can itself depend on authority or registry evidence, so the partition may remain UNKNOWN;
- a resolver must preserve the provenance of the partition, not only the resulting fragments.

W3C PROV treats provenance validity as requiring explicit consistency and ordering constraints; its model includes entities, agents, derivations and collections, supporting the need to distinguish identity and relationship semantics rather than relying on raw identifiers. citeturn0search1turn0search2 TUF provides a concrete scoped-delegation example: delegated roles can be trusted for specific target path patterns, including partial trust, rather than receiving universal authority. citeturn0search0turn0search5

## Scope relations

Candidate relations for research:
- DISJOINT
- EQUAL
- SUBSCOPE
- SUPERSCOPE
- PARTIAL_OVERLAP
- UNKNOWN_RELATION

These are not a frozen Nexo protocol.

A deterministic result is justified only when the relation itself is established by authoritative semantics.

## Adversarial cases

1. R1 revokes X under S1; R2 restores X under S2; S1 and S2 partially overlap. The overlap cannot inherit either operation without an explicit restoration/revocation precedence rule.
2. A wildcard scope appears global syntactically but its authority is limited to one namespace. Syntax cannot establish semantic globality.
3. Two aliases refer to the same logical subject but different historical incarnations. Merging them can manufacture a conflict.
4. A hierarchical parent scope and child scope have different authorities. Parent dominance cannot be inferred from hierarchy alone.
5. A partition depends on an external registry whose state changed. The old partition may no longer be reconstructible.
6. An emergency overlay expires while an ordinary revocation remains active. Expiration of the overlay must not erase the ordinary history.

## Scope partition boundary

For deterministic projection, the resolver needs:
TargetIdentity + SourceIncarnation + ScopeDefinition + ScopeRelation + Authority + Epoch + EffectiveInterval + OperationSemantics + ProvenanceClosure.

If scope relation is UNKNOWN, the affected overlap must remain UNKNOWN rather than being silently assigned to one side.

## Key distinctions

SCOPE LABEL != SCOPE SEMANTICS
WILDCARD SYNTAX != GLOBAL AUTHORITY
HIERARCHY != PRECEDENCE
PARTIAL OVERLAP != UNIVERSAL CONFLICT
ALIAS EQUALITY != INCARNATION EQUALITY
PARTITIONED SCOPE != PROVEN SEMANTIC PARTITION
EXPIRED OVERLAY != ERASED HISTORY
DETERMINISTIC PARTITION != PROVEN CORRECTNESS

## Epistemic state

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
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-057

Attack identity and incarnation semantics at the revocation boundary:
- stable identity versus historical incarnation;
- aliases, re-keying and key rotation;
- resource reincarnation;
- scope inheritance across incarnation changes;
- revocation issued before versus after reincarnation;
- restoration after reincarnation;
- identity-resolution failures and UNKNOWN;
- common-mode identity registries.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
