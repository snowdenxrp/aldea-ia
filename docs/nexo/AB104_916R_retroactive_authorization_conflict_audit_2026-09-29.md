# AB104.916R — Retroactive invalidation of V1 authorization versus legitimate V2 authority
Date: 2026-09-29

## Question
Can V2 retroactively invalidate a V1 authorization after the external effect occurred, when V1 and V2 are both legitimate authorities but their rules conflict?

## Fresh evidence
W3C PROV treats revisions as new entities and provenance as records of entities, activities, agents, derivations and time. Its constraints require provenance descriptions to respect event-ordering relationships; provenance can therefore preserve the distinction between what happened and later assertions about it. PROV also explicitly supports versioning and provenance of provenance. citeturn0search0turn0search4turn0search5

## Attack
T1:
V1 is valid and authoritative for domain D.
A1 authorizes operation O1.
O1 produces irreversible EFFECT-1.

T2:
V2 becomes valid and is also authoritative for D.
V2 has an explicit retroactive clause saying certain historical V1 authorizations are no longer considered valid under V2.

Cases:
A) V2 only changes current policy.
B) V2 explicitly has retroactive authority over V1 decisions.
C) V1 and V2 are both legitimate but incompatible and no precedence rule exists.
D) V2 invalidates authorization but cannot reverse EFFECT-1.
E) V2 invalidates authorization and mandates remediation.

## Findings
1. Two legitimate authorities can produce incompatible assessments without one being universally "more true". Resolution requires a declared authority/temporal/domain rule.
2. If V2 has no retroactive clause, it governs future decisions only; applying it to T1 is anachronistic.
3. If V2 explicitly grants retroactive authority, it may create a new historical assessment that A1 was invalid under V2. This does not erase the fact that A1 existed or that EFFECT-1 occurred.
4. The semantic status must distinguish at least:
   - V1 authorization existed and was valid under V1;
   - V2 later declares that authorization invalid under its retroactive rule;
   - EFFECT-1 did or did not occur;
   - any remediation occurred or remains UNKNOWN.
5. "Invalid authorization" does not imply "effect absent".
6. If V2 mandates correction, correction is a new operation with its own authority, identity, historical target binding, and outcome.
7. If EFFECT-1 is irreversible, V2 may change the present policy/status of that historical effect without physically undoing it.
8. If V1 and V2 are both authoritative for the same retroactive claim but conflict and no precedence/transition rule exists, the system must preserve CONFLICTING/UNKNOWN rather than select by recency, source count, or implementation order.
9. Authority is therefore scoped by claim, domain, time and policy version. "Both valid" does not imply "both simultaneously decide the same claim."
10. A provenance record should preserve the V1 decision, V2 reinterpretation, authority basis, effect evidence, and any remediation chain. PROV supports representing revisions/derivations and their timing; it does not itself supply a universal policy for resolving conflicting authorities. citeturn0search0turn0search2
11. No new top-level interaction class. Existing I9/I18/I19/I21 and class11/class12 cover the interaction depending on authority, lineage, external effect and reconciliation.

## Core distinctions
V1_VALID_AT_T1 != V2_RETROACTIVELY_INVALID_UNDER_V2
AUTHORIZATION_STATUS != EFFECT_EXISTENCE
RETROACTIVE_INVALIDATION != HISTORICAL_ERASURE
CURRENT_POLICY_VALIDITY != HISTORICAL_POLICY_VALIDITY
AUTHORITY_VALIDITY != EFFECT_REVERSIBILITY
CONFLICTING_AUTHORITY != RESOLVED_AUTHORITY
NEW_REMEDIATION != ORIGINAL_EXECUTION
REMEDIATION_AUTHORITY != ORIGINAL_EXECUTION_AUTHORITY
SOURCE_RECENCY != AUTHORITY_PRECEDENCE
SOURCE_COUNT != CONFLICT_RESOLUTION

## Required contract
For a retroactive V2 invalidation to be operationally meaningful, the governing contract must specify:
- which V2 authority can act retroactively;
- exact historical scope;
- which V1 decisions are covered;
- whether V2 invalidates classification, authorization, decision, or only present policy status;
- precedence/transition rule between V1 and V2;
- treatment of already-committed and irreversible effects;
- remediation authority and target-binding;
- UNKNOWN/reconciliation behavior;
- retention/provenance requirements.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
