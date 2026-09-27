---- MODULE NEXO_AB104_596_EFFECT_LIFECYCLE ----
EXTENDS Naturals
CONSTANTS NONE, COMMITTED, NOT_COMMITTED, UNKNOWN, VALID, INVALID,
  INTENT, ADMITTED_PHASE, QUEUED, EXECUTING, OUTCOME, CLOSED,
  ADMITTED, STALE, COMP_NONE, COMP_PENDING, COMP_COMMITTED, I1, I2, F1, F2

VARIABLES outcome, outcomeIncarnation, authority, fence, admission, phase,
  incarnation, boundIncarnation, boundFence, executed, compensation,
  evidence, evidenceIncarnation

vars ==
  <<outcome, outcomeIncarnation, authority, fence, admission, phase,
    incarnation, boundIncarnation, boundFence, executed, compensation,
    evidence, evidenceIncarnation>>

Init ==
  /\ outcome = NONE
  /\ outcomeIncarnation = I1
  /\ authority = VALID
  /\ fence = F1
  /\ admission = NONE
  /\ phase = INTENT
  /\ incarnation = I1
  /\ boundIncarnation = I1
  /\ boundFence = F1
  /\ executed = FALSE
  /\ compensation = COMP_NONE
  /\ evidence = NONE
  /\ evidenceIncarnation = I1

Admit ==
  /\ phase = INTENT
  /\ authority = VALID
  /\ admission = NONE
  /\ boundIncarnation' = incarnation
  /\ boundFence' = fence
  /\ phase' = ADMITTED_PHASE
  /\ admission' = ADMITTED
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, incarnation,
                  executed, compensation, evidence, evidenceIncarnation>>

Queue ==
  /\ phase = ADMITTED_PHASE
  /\ admission = ADMITTED
  /\ phase' = QUEUED
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, admission,
                  incarnation, boundIncarnation, boundFence, executed,
                  compensation, evidence, evidenceIncarnation>>

InvalidateAuthority ==
  /\ authority = VALID
  /\ authority' = INVALID
  /\ admission' = IF phase = QUEUED THEN STALE ELSE admission
  /\ UNCHANGED <<outcome, outcomeIncarnation, fence, phase, incarnation,
                  boundIncarnation, boundFence, executed, compensation,
                  evidence, evidenceIncarnation>>

AdvanceFence ==
  /\ fence = F1
  /\ fence' = F2
  /\ admission' = IF phase = QUEUED THEN STALE ELSE admission
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, phase, incarnation,
                  boundIncarnation, boundFence, executed, compensation,
                  evidence, evidenceIncarnation>>

RestoreAuthority ==
  /\ authority = INVALID
  /\ authority' = VALID
  /\ UNCHANGED <<outcome, outcomeIncarnation, fence, admission, phase,
                  incarnation, boundIncarnation, boundFence, executed,
                  compensation, evidence, evidenceIncarnation>>

ChangeIncarnation ==
  /\ incarnation = I1
  /\ incarnation' = I2
  /\ admission' = IF phase = QUEUED THEN STALE ELSE admission
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, phase,
                  boundIncarnation, boundFence, executed, compensation,
                  evidence, evidenceIncarnation>>

ReAdmit ==
  /\ phase = QUEUED
  /\ admission = STALE
  /\ authority = VALID
  /\ boundIncarnation' = incarnation
  /\ boundFence' = fence
  /\ admission' = ADMITTED
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, phase,
                  incarnation, executed, compensation, evidence,
                  evidenceIncarnation>>

Execute ==
  /\ phase = QUEUED
  /\ admission = ADMITTED
  /\ authority = VALID
  /\ boundIncarnation = incarnation
  /\ boundFence = fence
  /\ outcome = NONE
  /\ phase' = EXECUTING
  /\ executed' = TRUE
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, admission,
                  incarnation, boundIncarnation, boundFence, compensation,
                  evidence, evidenceIncarnation>>

ObserveCommitted ==
  /\ phase = EXECUTING
  /\ outcome' = COMMITTED
  /\ outcomeIncarnation' = boundIncarnation
  /\ phase' = OUTCOME
  /\ UNCHANGED <<authority, fence, admission, incarnation, boundIncarnation,
                  boundFence, executed, compensation, evidence,
                  evidenceIncarnation>>

ObserveNotCommitted ==
  /\ phase = EXECUTING
  /\ outcome' = NOT_COMMITTED
  /\ outcomeIncarnation' = boundIncarnation
  /\ phase' = OUTCOME
  /\ UNCHANGED <<authority, fence, admission, incarnation, boundIncarnation,
                  boundFence, executed, compensation, evidence,
                  evidenceIncarnation>>

ObserveUnknown ==
  /\ phase = EXECUTING
  /\ outcome' = UNKNOWN
  /\ outcomeIncarnation' = boundIncarnation
  /\ phase' = OUTCOME
  /\ UNCHANGED <<authority, fence, admission, incarnation, boundIncarnation,
                  boundFence, executed, compensation, evidence,
                  evidenceIncarnation>>

RecordCommittedEvidence ==
  /\ phase = OUTCOME
  /\ outcome = UNKNOWN
  /\ evidence' = COMMITTED
  /\ evidenceIncarnation' = outcomeIncarnation
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, admission,
                  phase, incarnation, boundIncarnation, boundFence, executed,
                  compensation>>

RecordNotCommittedEvidence ==
  /\ phase = OUTCOME
  /\ outcome = UNKNOWN
  /\ evidence' = NOT_COMMITTED
  /\ evidenceIncarnation' = outcomeIncarnation
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, admission,
                  phase, incarnation, boundIncarnation, boundFence, executed,
                  compensation>>

ReconcileCommitted ==
  /\ outcome = UNKNOWN
  /\ evidence = COMMITTED
  /\ evidenceIncarnation = outcomeIncarnation
  /\ outcome' = COMMITTED
  /\ UNCHANGED <<outcomeIncarnation, authority, fence, admission, phase,
                  incarnation, boundIncarnation, boundFence, executed,
                  compensation, evidence, evidenceIncarnation>>

ReconcileNotCommitted ==
  /\ outcome = UNKNOWN
  /\ evidence = NOT_COMMITTED
  /\ evidenceIncarnation = outcomeIncarnation
  /\ outcome' = NOT_COMMITTED
  /\ UNCHANGED <<outcomeIncarnation, authority, fence, admission, phase,
                  incarnation, boundIncarnation, boundFence, executed,
                  compensation, evidence, evidenceIncarnation>>

StartCompensation ==
  /\ outcome = COMMITTED
  /\ phase = OUTCOME
  /\ compensation = COMP_NONE
  /\ authority = VALID
  /\ compensation' = COMP_PENDING
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, admission,
                  phase, incarnation, boundIncarnation, boundFence, executed,
                  evidence, evidenceIncarnation>>

CommitCompensation ==
  /\ compensation = COMP_PENDING
  /\ authority = VALID
  /\ compensation' = COMP_COMMITTED
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, admission,
                  phase, incarnation, boundIncarnation, boundFence, executed,
                  evidence, evidenceIncarnation>>

Close ==
  /\ phase = OUTCOME
  /\ outcome # UNKNOWN
  /\ phase' = CLOSED
  /\ UNCHANGED <<outcome, outcomeIncarnation, authority, fence, admission,
                  incarnation, boundIncarnation, boundFence, executed,
                  compensation, evidence, evidenceIncarnation>>

Next ==
  \/ Admit \/ Queue \/ InvalidateAuthority \/ AdvanceFence
  \/ RestoreAuthority \/ ChangeIncarnation \/ ReAdmit \/ Execute
  \/ ObserveCommitted \/ ObserveNotCommitted \/ ObserveUnknown
  \/ RecordCommittedEvidence \/ RecordNotCommittedEvidence
  \/ ReconcileCommitted \/ ReconcileNotCommitted
  \/ StartCompensation \/ CommitCompensation \/ Close

TypeOK ==
  /\ outcome \in {NONE, COMMITTED, NOT_COMMITTED, UNKNOWN}
  /\ outcomeIncarnation \in {I1, I2}
  /\ authority \in {VALID, INVALID}
  /\ fence \in {F1, F2}
  /\ admission \in {NONE, ADMITTED, STALE}
  /\ phase \in {INTENT, ADMITTED_PHASE, QUEUED, EXECUTING, OUTCOME, CLOSED}
  /\ incarnation \in {I1, I2}
  /\ boundIncarnation \in {I1, I2}
  /\ boundFence \in {F1, F2}
  /\ executed \in BOOLEAN
  /\ compensation \in {COMP_NONE, COMP_PENDING, COMP_COMMITTED}
  /\ evidence \in {NONE, COMMITTED, NOT_COMMITTED}
  /\ evidenceIncarnation \in {I1, I2}

Safety ==
  /\ ~(phase = EXECUTING /\ admission = STALE)
  /\ ~(phase = EXECUTING /\ boundIncarnation # incarnation)
  /\ ~(admission = ADMITTED /\ boundIncarnation # incarnation)
  /\ ~(admission = ADMITTED /\ boundFence # fence)
  /\ ~(phase = CLOSED /\ outcome = UNKNOWN)
  /\ ~(compensation = COMP_COMMITTED /\ outcome = NOT_COMMITTED)
  /\ ~(outcome = UNKNOWN /\ evidence # NONE /\ evidenceIncarnation # outcomeIncarnation)

Spec == Init /\ [][Next]_vars
====
