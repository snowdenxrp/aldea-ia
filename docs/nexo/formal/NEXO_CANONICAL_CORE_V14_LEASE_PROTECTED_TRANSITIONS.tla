---------------- MODULE NEXO_CANONICAL_CORE_V14_LEASE_PROTECTED_TRANSITIONS ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
LeaseRec == [state: LeaseStates, owner: Owners, generation: Nat, expiresAt: Nat]

VARIABLES recovery, reconciliation, execution, recoveryCount, reconciliationCount, executionCount, now

vars == <<recovery,reconciliation,execution,recoveryCount,reconciliationCount,executionCount,now>>

Init ==
  /\ recovery = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ reconciliation = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ execution = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ recoveryCount = [o \in Ops |-> 0]
  /\ reconciliationCount = [o \in Ops |-> 0]
  /\ executionCount = [o \in Ops |-> 0]
  /\ now = 0

LeaseValid(l) == l.state = "HELD" /\ l.expiresAt > now
ExpiredLease(l) == l.state = "HELD" /\ l.expiresAt <= now

RecoveryAcquire(o,a) ==
  /\ recovery[o].state = "FREE" \/ ExpiredLease(recovery[o])
  /\ reconciliation[o].state # "HELD"
  /\ recovery' = [recovery EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<reconciliation,execution,recoveryCount,reconciliationCount,executionCount,now>>

RecoveryExpire(o) ==
  /\ ExpiredLease(recovery[o])
  /\ recovery' = [recovery EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<reconciliation,execution,recoveryCount,reconciliationCount,executionCount,now>>

RecoveryProtected(o,a,g) ==
  /\ LeaseValid(recovery[o])
  /\ recovery[o].owner = a
  /\ recovery[o].generation = g
  /\ recoveryCount' = [recoveryCount EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<recovery,reconciliation,execution,reconciliationCount,executionCount,now>>

ReconciliationAcquire(o,a) ==
  /\ reconciliation[o].state = "FREE" \/ ExpiredLease(reconciliation[o])
  /\ recovery[o].state # "HELD"
  /\ reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<recovery,execution,recoveryCount,reconciliationCount,executionCount,now>>

ReconciliationExpire(o) ==
  /\ ExpiredLease(reconciliation[o])
  /\ reconciliation' = [reconciliation EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,execution,recoveryCount,reconciliationCount,executionCount,now>>

ReconciliationProtected(o,a,g) ==
  /\ LeaseValid(reconciliation[o])
  /\ reconciliation[o].owner = a
  /\ reconciliation[o].generation = g
  /\ reconciliationCount' = [reconciliationCount EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<recovery,reconciliation,execution,recoveryCount,executionCount,now>>

ExecutionAcquire(o,a) ==
  /\ execution[o].state = "FREE" \/ ExpiredLease(execution[o])
  /\ execution' = [execution EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 3]]
  /\ UNCHANGED <<recovery,reconciliation,recoveryCount,reconciliationCount,executionCount,now>>

ExecutionExpire(o) ==
  /\ ExpiredLease(execution[o])
  /\ execution' = [execution EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,reconciliation,recoveryCount,reconciliationCount,executionCount,now>>

ExecutionProtected(o,a,g) ==
  /\ LeaseValid(execution[o])
  /\ execution[o].owner = a
  /\ execution[o].generation = g
  /\ executionCount' = [executionCount EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<recovery,reconciliation,recoveryCount,reconciliationCount,now>>

AdvanceTime == /\ now' = now + 1
              /\ UNCHANGED <<recovery,reconciliation,execution,recoveryCount,reconciliationCount,executionCount>>

Next ==
  \/ \E o \in Ops,a \in Owners : RecoveryAcquire(o,a)
  \/ \E o \in Ops : RecoveryExpire(o)
  \/ \E o \in Ops,a \in Owners,g \in Nat : RecoveryProtected(o,a,g)
  \/ \E o \in Ops,a \in Owners : ReconciliationAcquire(o,a)
  \/ \E o \in Ops : ReconciliationExpire(o)
  \/ \E o \in Ops,a \in Owners,g \in Nat : ReconciliationProtected(o,a,g)
  \/ \E o \in Ops,a \in Owners : ExecutionAcquire(o,a)
  \/ \E o \in Ops : ExecutionExpire(o)
  \/ \E o \in Ops,a \in Owners,g \in Nat : ExecutionProtected(o,a,g)
  \/ AdvanceTime

TypeOK ==
  /\ recovery \in [Ops -> LeaseRec]
  /\ reconciliation \in [Ops -> LeaseRec]
  /\ execution \in [Ops -> LeaseRec]
  /\ recoveryCount \in [Ops -> Nat]
  /\ reconciliationCount \in [Ops -> Nat]
  /\ executionCount \in [Ops -> Nat]
  /\ now \in Nat

ExclusiveRecoveryReconciliation ==
  \A o \in Ops : ~(LeaseValid(recovery[o]) /\ LeaseValid(reconciliation[o]))

GenerationStateDomain ==
  \A o \in Ops : recovery[o].generation \in Nat /\ reconciliation[o].generation \in Nat /\ execution[o].generation \in Nat

Spec == Init /\ [][Next]_vars
=============================================================================
