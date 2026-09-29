# AB104.919R — Multiple context windows while an external operation remains IN_PROGRESS
Date: 2026-09-29

## Question
An operation starts under safe context C1, remains IN_PROGRESS while context changes to unsafe C2, then becomes safe again under C3. Does the operation have one continuous authorization or multiple authority windows?

## Fresh evidence
AWS event sourcing treats events as immutable chronological history and distinguishes replay/state reconstruction from external-system updates; external effects need explicit control. Microsoft documents that long-running compensating workflows are eventually consistent, can fail/retry, and need explicit progress/correlation; it also identifies clear points of no return and irreversible steps. These sources support modeling temporal authorization and external-effect lifecycle separately rather than deriving completion authority from a single start event. citeturn0search5turn0search0

## Attack
T1: C1 safe; V1 authorizes O1; O1 becomes IN_PROGRESS.
T2: C2 unsafe; V2 says new completion is not permitted.
T3: C3 safe again; V3 permits comparable effects.
O1 has not reached terminal outcome during T2/T3.

## Findings
1. There is no universal rule that C3 automatically revives O1. Revival requires an explicit contract.
2. A start-time authorization can be modeled as a durable permit, bounded lease, snapshot decision, or continuously revalidated authority. These semantics are materially different.
3. If authorization is a lease/window, C1 may authorize only until expiry; C2 can invalidate continuation; C3 may require a NEW authorization rather than silently reviving the old one.
4. If the contract explicitly defines authorization as durable for O1 until terminal completion, C2 may change current safety/remediation requirements without invalidating O1's execution authority. This is domain-specific.
5. If V2 forbids completion and C3 later permits it, the system must preserve the T2 rejection/invalidity interval and prove that C3 authorization actually covers the same logical operation and target. A current policy alone is insufficient.
6. Reusing O1 under C3 must not accidentally become a new logical operation unless the contract explicitly says so. Operation identity, authorization identity, and attempt identity are distinct.
7. If O1's provider-side execution may continue autonomously through C2, the local policy transition does not prove absence of an effect. Reconciliation remains necessary.
8. If C3 authorizes a retry after UNKNOWN, it must be distinguished from a retry after FAILED; UNKNOWN means the prior external outcome is unresolved.
9. If an irreversible effect occurs during C2, C3 cannot erase the historical effect; it can only authorize a new compensating/remediating operation if policy permits.
10. If multiple effects belong to O1, each effect may fall into different context windows; operation-level authorization cannot automatically establish identical authorization/safety for every effect.
11. No new top-level interaction class. This is primarily I24 IN_PROGRESS plus I9/I19/I21 and class11/class12; I15/I22 participate when retry/idempotency horizons matter.

## Core distinctions
CONTEXT_WINDOW != OPERATION_IDENTITY
AUTHORIZATION_WINDOW != OPERATION_IDENTITY
C3_AUTHORIZATION != AUTOMATIC_REVIVAL
REAUTHORIZATION != RETRY_OF_SAME_OPERATION
ATTEMPT_IDENTITY != OPERATION_IDENTITY
UNKNOWN != FAILED
CURRENT_POLICY != HISTORICAL_AUTHORIZATION
POLICY_REJECTION_AT_T2 != EFFECT_ABSENCE
C3_AUTHORITY != PROOF_OF_NO_C2_EFFECT
OPERATION_STATUS != PER_EFFECT_AUTHORIZATION
REVIVAL_REQUIRES_EXPLICIT_CONTRACT

## Required contract
A long-running external operation crossing multiple policy/context windows must define:
- authorization validity model (snapshot, lease, durable permit, continuous revalidation);
- exact validity interval;
- whether context changes suspend, revoke, or merely reclassify an in-progress operation;
- whether a later safe context can reauthorize the same operation;
- binding between new authorization and operation/target/incarnation;
- attempt/retry identity;
- provider-side continuation behavior;
- reconciliation and UNKNOWN handling;
- irreversible-effect treatment;
- per-effect versus operation-level authorization.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
