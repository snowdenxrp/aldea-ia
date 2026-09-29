# AB104.918R — Context transition while external effect is IN_PROGRESS
Date: 2026-09-29

## Question
What happens when an external operation begins under a safe context, remains IN_PROGRESS, and the context changes before the external effect reaches a terminal outcome?

## Fresh evidence
AWS Event Sourcing describes immutable event history and explicitly notes that external-system updates during replay require separate control. Microsoft compensating transactions are eventual, can fail, can be retried, and require correlation/audit of original and compensating operations. W3C PROV models activities over time and instantaneous events, supporting explicit temporal provenance.

## Attack
T1: context C1; V1 authorizes O1; O1 is submitted; provider reports IN_PROGRESS.
T2: context changes to C2; V2 says completion is no longer permitted/safe.
T3: provider may complete, fail, remain pending, or become UNKNOWN. Local system may cancel, fence, or compensate.

## Findings
1. Authorization at start does not by itself establish permission to complete after a context transition unless the contract makes authorization durable for the operation lifetime.
2. AUTHORIZATION_AT_SUBMISSION != AUTHORIZATION_AT_COMPLETION unless explicitly contract-bound.
3. Context transition is a separate historical fact; it does not retroactively change whether O1 was authorized at T1.
4. An external-effect contract must define whether validity is checked at submission, acceptance, execution, commit, completion, continuously, or through a lease/expiry. No universal rule exists.
5. If revalidation is required and V2 rejects completion, local rejection does not prove the provider did not complete.
6. If the provider can complete independently, outcome must be reconciled; CANCEL_REQUESTED != CANCELLED and FENCE_ACCEPTED != EFFECT_ABSENT.
7. If completion and context transition are concurrent, arrival order is insufficient for causal ordering unless the domain contract supplies an authoritative ordering relation.
8. If effect commits after context change, its status depends on the declared contract: it can be an invalid/unsafe completion, a still-valid completion under start-time authorization, or UNKNOWN if the contract is silent.
9. If effect commits before context change but acknowledgment arrives afterward, historical effect time governs; receipt time does not rewrite it.
10. Multiple external effects from one operation can cross the boundary independently; operation-level status cannot automatically imply identical safety status for each effect.
11. UNKNOWN cancellation/remediation remains UNKNOWN until positive evidence or reconciliation resolves it.
12. No new top-level class. This is primarily I24 IN_PROGRESS interacting with I9/I19/I21 and class11/class12; I15/I22 may participate for retries/idempotency.

## Core distinctions
AUTHORIZATION_AT_START != AUTHORIZATION_AT_COMPLETION
CONTEXT_CHANGE != RETROACTIVE_EXECUTION_INVALIDATION
IN_PROGRESS != EFFECT_ABSENT
CANCEL_REQUESTED != CANCELLED
FENCE_ACCEPTED != EFFECT_ABSENT
REJECTION_AT_T2 != PROVIDER_NON_EXECUTION
RECEIPT_TIME != EFFECT_TIME
ARRIVAL_ORDER != CAUSAL_ORDER
OPERATION_STATUS != PER_EFFECT_SAFETY_STATUS
UNKNOWN != FAILED
UNKNOWN != CANCELLED

## Required contract
- authorization validity interval;
- authorization check point(s);
- behavior when context changes while IN_PROGRESS;
- cancellation/fencing semantics and evidence limits;
- authoritative effect timestamp/order semantics;
- per-effect versus operation-level status;
- reconciliation source and UNKNOWN behavior;
- retry/idempotency after context change;
- irreversible-effect treatment.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
