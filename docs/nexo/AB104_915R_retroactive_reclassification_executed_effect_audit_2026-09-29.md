# AB104.915R — Retroactive safety reclassification versus already-executed external effect
Date: 2026-09-29

## Question
V2 retroactively reclassifies a historical fact/effect as unsafe, while an external action was already executed under V1. Can the reclassification itself invalidate the prior execution?

## Fresh evidence
Microsoft Azure Event Sourcing states the event store is a permanent source of information: historical events should not be updated; correction/undo is represented by a new compensating event. W3C PROV models revisions as new derived entities and distinguishes entities, activities, agents, generation, derivation and responsibility. These support separating historical fact, later assessment, and later corrective activity.

## Attack
T1:
E1 occurs; EFFECT-1 is externally committed.
V1 classifies the operation as acceptable.
A decision D1 under V1 authorizes/causes EFFECT-1.

T2:
V2 is explicitly retroactive and classifies the historical situation as unsafe.
Question: does V2 retroactively make EFFECT-1 "not executed" or erase D1?

## Findings
1. No. Reclassification does not erase a fact or committed external effect.
2. V2 can establish a new present assessment that the historical situation is unsafe under V2.
3. If V2 has explicit retroactive corrective authority, it may trigger a NEW corrective operation against EFFECT-1. That operation has its own authority, operation identity, target binding, idempotency and outcome.
4. The corrective operation is not evidence that EFFECT-1 never happened.
5. If the external effect is irreversible, the correction may be impossible, partial, compensating, or only administrative; the historical effect remains.
6. V2 cannot retroactively manufacture a missing authorization failure unless the contract explicitly defines the historical authorization as subject to retroactive validity rules. Even then, the resulting status is a new legal/policy assessment, not erasure of execution evidence.
7. If D1's governing V1 authorization is itself retroactively declared invalid by an explicit contract, the system must preserve at least: original authorization decision, V1 basis, V2 invalidation/reclassification, and any resulting correction/remediation activity.
8. A current policy may govern what to do NOW without rewriting what happened THEN.
9. If V2 requires remediation and target lineage is incomplete, remediation target remains UNKNOWN rather than being inferred from current resource ID.
10. If the corrective effect itself is externally ambiguous, preserve UNKNOWN and reconcile; do not infer success from the V2 classification.
11. No new top-level interaction class. Existing I19/I21 + class11/class12 cover the case; I9/I18/I15/I22 can participate depending on authority, incarnation and retry semantics.

## Core separation
HISTORICAL_FACT != HISTORICAL_ASSESSMENT != EXECUTED_EFFECT != CORRECTIVE_EFFECT

Also:
RECLASSIFICATION != ERASURE
UNSAFE_ASSESSMENT != NON_EXECUTION
RETROACTIVE_POLICY != RETROACTIVE_PHYSICAL_REVERSAL
INVALIDATED_AUTHORIZATION != ABSENT_EFFECT
CORRECTION != ORIGINAL_EXECUTION
CURRENT_REMEDIATION_AUTHORITY != HISTORICAL_EXECUTION_AUTHORITY
CORRECTION_SUCCESS != ORIGINAL_EFFECT_ERASURE
IRREVERSIBLE_EFFECT != UNKNOWN_EFFECT

## Required contract for retroactive invalidation
If a domain truly permits retroactive invalidation of prior authorization, the contract must explicitly define:
- covered historical domain/time;
- authority and version of the retroactive rule;
- what is invalidated: authorization, classification, decision, or effect;
- whether invalidation is declarative or requires physical/administrative correction;
- treatment of irreversible effects;
- required provenance and evidence retention;
- remediation authority and target-binding rules;
- resolution semantics for UNKNOWN corrective outcomes.

Absent such a contract, V2 should be treated as a new assessment/remediation policy, not as a mechanism that rewrites historical execution.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 unfrozen. FutureObs_PAA open. V21 forbidden.
