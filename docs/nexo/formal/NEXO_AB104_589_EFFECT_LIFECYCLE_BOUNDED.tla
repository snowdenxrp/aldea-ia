---------------- MODULE NEXO_AB104_589_EFFECT_LIFECYCLE ----------------
EXTENDS Naturals

CONSTANTS
  NONE, COMMITTED, NOT_COMMITTED, UNKNOWN,
  VALID, INVALID,
  INTENT, ADMITTED, QUEUED, EXECUTING, OUTCOME, CLOSED,
  STALE,
  I1, I2

VARIABLES
  outcome,
  authority,
  admission,
  phase,
  incarnation,
  boundIncarnation,
  executed,
  compensation

vars ==
  <<outcome, authority, admission, phase, incarnation,
    boundIncarnation, executed, compensation>>

Init ==
  /\ outcome = NONE
  /\ authority = VALID
  /\ admission = NONE
  /\ phase = INTENT
  /\ incarnation = I1
  /\ boundIncarnation = I1
  /\ executed = FALSE
  /\ compensation = NONE

Admit ==
  /\ phase = INTENT
  /\ authority = VALID
  /\ admission = NONE
  /\ phase' = ADMITTED
  /\ admission' = ADMITTED
  /\ UNCHANGED <<outcome, authority, incarnation, boundIncarnation,
                  executed, compensation>>

Queue ==
  /\ phase = ADMITTED
  /\ admission = ADMITTED
  /\ phase' = QUEUED
  /\ UNCHANGED <<outcome, authority, admission, incarnation,
                  boundIncarnation, executed, compensation>>

InvalidateAuthority ==
  /\ authority = VALID
  /\ authority' = INVALID
  /\ UNCHANGED <<outcome, admission, phase, incarnation,
                  boundIncarnation, executed, compensation>>

RestoreAuthority ==
  /\ authority = INVALID
  /\ authority' = VALID
  /\ UNCHANGED <<outcome, admission, phase, incarnation,
                  boundIncarnation, executed, compensation>>

ChangeIncarnation ==
  /\ incarnation = I1
  /\ incarnation' = I2
  /\ admission' = IF admission = ADMITTED THEN STALE ELSE admission
  /\ UNCHANGED <<outcome, authority, phase, boundIncarnation,
                  executed, compensation>>

ReAdmit ==
  /\ admission = STALE
  /\ authority = VALID
  /\ phase = QUEUED
  /\ boundIncarnation' = incarnation
  /\ admission' = ADMITTED
  /\ UNCHANGED <<outcome, authority, phase, incarnation,
                  executed, compensation>>

Execute ==
  /\ phase = QUEUED
  /\ admission = ADMITTED
  /\ authority = VALID
  /\ boundIncarnation = incarnation
  /\ outcome = NONE
  /\ phase' = EXECUTING
  /\ executed' = TRUE
  /\ UNCHANGED <<outcome, authority, admission, incarnation,
                  boundIncarnation, compensation>>

ObserveCommitted ==
  /\ phase = EXECUTING
  /\ outcome' = COMMITTED
  /\ phase' = OUTCOME
  /\ UNCHANGED <<authority, admission, incarnation,
                  boundIncarnation, executed, compensation>>

ObserveNotCommitted ==
  /\ phase = EXECUTING
  /\ outcome' = NOT_COMMITTED
  /\ phase' = OUTCOME
  /\ UNCHANGED <<authority, admission, incarnation,
                  boundIncarnation, executed, compensation>>

ObserveUnknown ==
  /\ phase = EXECUTING
  /\ outcome' = UNKNOWN
  /\ phase' = OUTCOME
  /\ UNCHANGED <<authority, admission, incarnation,
                  boundIncarnation, executed, compensation>>

ReconcileCommitted ==
  /\ outcome = UNKNOWN
  /\ phase = OUTCOME
  /\ outcome' = COMMITTED
  /\ UNCHANGED <<authority, admission, phase, incarnation,
                  boundIncarnation, executed, compensation>>

ReconcileNotCommitted ==
  /\ outcome = UNKNOWN
  /\ phase = OUTCOME
  /\ outcome' = NOT_COMMITTED
  /\ UNCHANGED <<authority, admission, phase, incarnation,
                  boundIncarnation, executed, compensation>>

StartCompensation ==
  /\ outcome = COMMITTED
  /\ phase = OUTCOME
  /\ compensation = NONE
  /\ compensation' = "PENDING"
  /\ UNCHANGED <<outcome, authority, admission, phase, incarnation,
                  boundIncarnation, executed>>

CommitCompensation ==
  /\ compensation = "PENDING"
  /\ compensation' = "COMMITTED"
  /\ UNCHANGED <<outcome, authority, admission, phase, incarnation,
                  boundIncarnation, executed>>

Close ==
  /\ phase = OUTCOME
  /\ outcome # UNKNOWN
  /\ phase' = CLOSED
  /\ UNCHANGED <<outcome, authority, admission, incarnation,
                  boundIncarnation, executed, compensation>>

Next ==
  \/ Admit
  \/ Queue
  \/ InvalidateAuthority
  \/ RestoreAuthority
  \/ ChangeIncarnation
  \/ ReAdmit
  \/ Execute
  \/ ObserveCommitted
  \/ ObserveNotCommitted
  \/ ObserveUnknown
  \/ ReconcileCommitted
  \/ ReconcileNotCommitted
  \/ StartCompensation
  \/ CommitCompensation
  \/ Close

TypeOK ==
  /\ outcome \in {NONE, COMMITTED, NOT_COMMITTED, UNKNOWN}
  /\ authority \in {VALID, INVALID}
  /\ admission \in {NONE, ADMITTED, STALE}
  /\ phase \in {INTENT, ADMITTED, QUEUED, EXECUTING, OUTCOME, CLOSED}
  /\ incarnation \in {I1, I2}
  /\ boundIncarnation \in {I1, I2}
  /\ executed \in BOOLEAN
  /\ compensation \in {NONE, "PENDING", "COMMITTED"}

Safety ==
  /\ ~(phase = EXECUTING /\ admission = STALE)
  /\ ~(phase = EXECUTING /\ outcome = UNKNOWN)
  /\ ~(admission = ADMITTED /\ boundIncarnation # incarnation)
  /\ ~(phase = CLOSED /\ outcome = UNKNOWN)
  /\ ~(compensation = "COMMITTED" /\ outcome = NOT_COMMITTED)

Spec == Init /\ [][Next]_vars

THEOREM Spec => []TypeOK
THEOREM Spec => []Safety
=============================================================================
