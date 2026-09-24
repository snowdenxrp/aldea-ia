---------------- MODULE NEXO_CANONICAL_CORE_V13_LEASE_KERNEL ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners

LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
LeaseRec == [state: LeaseStates, owner: Owners, generation: Nat, expiresAt: Nat]

VARIABLES recovery, reconciliation, execution, protectedCounter, now

vars == <<recovery,reconciliation,execution,protectedCounter,now>>

Init ==
  /\ recovery = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ reconciliation = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ execution = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ protectedCounter = [o \in Ops |-> 0]
  /\ now = 0

LeaseValid(l) == l.state = "HELD" /\ l.expiresAt > now
ExpiredLease(l) == l.state = "HELD" /\ l.expiresAt <= now

RecoveryAcquire(o,a) ==
  /\ recovery[o].state = "FREE"
  /\ reconciliation[o].state # "HELD"
  /\ recovery' = [recovery EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<reconciliation,execution,protectedCounter,now>>

RecoveryExpire(o) ==
  /\ ExpiredLease(recovery[o])
  /\ recovery' = [recovery EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<reconciliation,execution,protectedCounter,now>>

RecoveryTakeover(o,a) ==
  /\ ExpiredLease(recovery[o])
  /\ reconciliation[o].state # "HELD"
  /\ recovery' = [recovery EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<reconciliation,execution,protectedCounter,now>>

ReconciliationAcquire(o,a) ==
  /\ reconciliation[o].state = "FREE"
  /\ recovery[o].state # "HELD"
  /\ reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<recovery,execution,protectedCounter,now>>

ReconciliationExpire(o) ==
  /\ ExpiredLease(reconciliation[o])
  /\ reconciliation' = [reconciliation EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,execution,protectedCounter,now>>

ReconciliationTakeover(o,a) ==
  /\ ExpiredLease(reconciliation[o])
  /\ recovery[o].state # "HELD"
  /\ reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<recovery,execution,protectedCounter,now>>

ExecutionAcquire(o,a) ==
  /\ execution[o].state = "FREE"
  /\ execution' = [execution EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 3]]
  /\ UNCHANGED <<recovery,reconciliation,protectedCounter,now>>

ExecutionExpire(o) ==
  /\ ExpiredLease(execution[o])
  /\ execution' = [execution EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,reconciliation,protectedCounter,now>>

ExecutionTakeover(o,a) ==
  /\ ExpiredLease(execution[o])
  /\ execution' = [execution EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 3]]
  /\ UNCHANGED <<recovery,reconciliation,protectedCounter,now>>

ProtectedAction(o,a,g) ==
  /\ LeaseValid(execution[o])
  /\ execution[o].owner = a
  /\ execution[o].generation = g
  /\ protectedCounter' = [protectedCounter EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<recovery,reconciliation,execution,now>>

AdvanceTime == /\ now' = now + 1
              /\ UNCHANGED <<recovery,reconciliation,execution,protectedCounter>>

Next ==
  \/ \E o \in Ops,a \in Owners : RecoveryAcquire(o,a)
  \/ \E o \in Ops : RecoveryExpire(o)
  \/ \E o \in Ops,a \in Owners : RecoveryTakeover(o,a)
  \/ \E o \in Ops,a \in Owners : ReconciliationAcquire(o,a)
  \/ \E o \in Ops : ReconciliationExpire(o)
  \/ \E o \in Ops,a \in Owners : ReconciliationTakeover(o,a)
  \/ \E o \in Ops,a \in Owners : ExecutionAcquire(o,a)
  \/ \E o \in Ops : ExecutionExpire(o)
  \/ \E o \in Ops,a \in Owners : ExecutionTakeover(o,a)
  \/ \E o \in Ops,a \in Owners,g \in Nat : ProtectedAction(o,a,g)
  \/ AdvanceTime

TypeOK ==
  /\ recovery \in [Ops -> LeaseRec]
  /\ reconciliation \in [Ops -> LeaseRec]
  /\ execution \in [Ops -> LeaseRec]
  /\ protectedCounter \in [Ops -> Nat]
  /\ now \in Nat

GenerationNeverDecreases ==
  \A o \in Ops :
    recovery[o].generation >= 0 /\ reconciliation[o].generation >= 0 /\ execution[o].generation >= 0

ExclusiveRecoveryReconciliation ==
  \A o \in Ops : ~(LeaseValid(recovery[o]) /\ LeaseValid(reconciliation[o]))

Spec == Init /\ [][Next]_vars
=============================================================================
