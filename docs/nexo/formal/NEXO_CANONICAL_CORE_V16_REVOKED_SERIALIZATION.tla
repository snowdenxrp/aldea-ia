---------------- MODULE NEXO_CANONICAL_CORE_V16_REVOKED_SERIALIZATION ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
LeaseRec == [state: LeaseStates, owner: Owners, generation: Nat, expiresAt: Nat]

VARIABLES recovery, reconciliation, acquireSeq, now
vars == <<recovery,reconciliation,acquireSeq,now>>

Init ==
  /\ recovery = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ reconciliation = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ acquireSeq = [o \in Ops |-> 0]
  /\ now = 0

LeaseValid(l) == l.state = "HELD" /\ l.expiresAt > now
ExpiredLease(l) == l.state = "HELD" /\ l.expiresAt <= now

Recover(o,a) ==
  /\ recovery[o].state \in {"FREE","EXPIRED"}
  /\ ~LeaseValid(reconciliation[o])
  /\ recovery' = [recovery EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ acquireSeq' = [acquireSeq EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<reconciliation,now>>

Reconcile(o,a) ==
  /\ reconciliation[o].state \in {"FREE","EXPIRED"}
  /\ ~LeaseValid(recovery[o])
  /\ reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ acquireSeq' = [acquireSeq EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<recovery,now>>

ExpireRecovery(o) ==
  /\ ExpiredLease(recovery[o])
  /\ recovery' = [recovery EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<reconciliation,acquireSeq,now>>

ExpireReconciliation(o) ==
  /\ ExpiredLease(reconciliation[o])
  /\ reconciliation' = [reconciliation EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,acquireSeq,now>>

RevokeRecovery(o) ==
  /\ recovery[o].state = "HELD"
  /\ recovery' = [recovery EXCEPT ![o].state = "REVOKED"]
  /\ UNCHANGED <<reconciliation,acquireSeq,now>>

RevokeReconciliation(o) ==
  /\ reconciliation[o].state = "HELD"
  /\ reconciliation' = [reconciliation EXCEPT ![o].state = "REVOKED"]
  /\ UNCHANGED <<recovery,acquireSeq,now>>

ReauthorizeRecovery(o,a) ==
  /\ recovery[o].state = "REVOKED"
  /\ recovery' = [recovery EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<reconciliation,acquireSeq,now>>

ReauthorizeReconciliation(o,a) ==
  /\ reconciliation[o].state = "REVOKED"
  /\ reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<recovery,acquireSeq,now>>

AdvanceTime == /\ now' = now + 1
              /\ UNCHANGED <<recovery,reconciliation,acquireSeq>>

TypeOK ==
  /\ recovery \in [Ops -> LeaseRec]
  /\ reconciliation \in [Ops -> LeaseRec]
  /\ acquireSeq \in [Ops -> Nat]
  /\ now \in Nat

RevokedNotAcquirable ==
  \A o \in Ops : recovery[o].state = "REVOKED" => recovery[o].state # "FREE" /\ recovery[o].state # "EXPIRED"

ReconciliationRevokedNotAcquirable ==
  \A o \in Ops : reconciliation[o].state = "REVOKED" => reconciliation[o].state # "FREE" /\ reconciliation[o].state # "EXPIRED"

MutualExclusion ==
  \A o \in Ops : ~(LeaseValid(recovery[o]) /\ LeaseValid(reconciliation[o]))

SerializationWitness ==
  \A o \in Ops : acquireSeq[o] \in Nat

Next ==
  \/ \E o \in Ops,a \in Owners : Recover(o,a)
  \/ \E o \in Ops,a \in Owners : Reconcile(o,a)
  \/ \E o \in Ops : ExpireRecovery(o)
  \/ \E o \in Ops : ExpireReconciliation(o)
  \/ \E o \in Ops : RevokeRecovery(o)
  \/ \E o \in Ops : RevokeReconciliation(o)
  \/ \E o \in Ops,a \in Owners : ReauthorizeRecovery(o,a)
  \/ \E o \in Ops,a \in Owners : ReauthorizeReconciliation(o,a)
  \/ AdvanceTime

Spec == Init /\ [][Next]_vars
=============================================================================
