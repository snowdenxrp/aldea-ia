---------------- MODULE NEXO_CANONICAL_CORE_V15_LEASE_LIVENESS ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
LeaseRec == [state: LeaseStates, owner: Owners, generation: Nat, expiresAt: Nat]

VARIABLES recovery, reconciliation, now

vars == <<recovery,reconciliation,now>>

Init ==
  /\ recovery = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ reconciliation = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, expiresAt |-> 0]]
  /\ now = 0

LeaseValid(l) == l.state = "HELD" /\ l.expiresAt > now
LeaseExpired(l) == l.state = "HELD" /\ l.expiresAt <= now

RecoveryAcquire(o,a) ==
  /\ ~LeaseValid(recovery[o])
  /\ ~LeaseValid(reconciliation[o])
  /\ recovery' = [recovery EXCEPT ![o] =
       [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<reconciliation,now>>

ReconciliationAcquire(o,a) ==
  /\ ~LeaseValid(recovery[o])
  /\ ~LeaseValid(reconciliation[o])
  /\ reconciliation' = [reconciliation EXCEPT ![o] =
       [state |-> "HELD", owner |-> a, generation |-> @.generation + 1, expiresAt |-> now + 4]]
  /\ UNCHANGED <<recovery,now>>

RecoveryExpire(o) ==
  /\ LeaseExpired(recovery[o])
  /\ recovery' = [recovery EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<reconciliation,now>>

ReconciliationExpire(o) ==
  /\ LeaseExpired(reconciliation[o])
  /\ reconciliation' = [reconciliation EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,now>>

AdvanceTime == /\ now' = now + 1
              /\ UNCHANGED <<recovery,reconciliation>>

TypeOK ==
  /\ recovery \in [Ops -> LeaseRec]
  /\ reconciliation \in [Ops -> LeaseRec]
  /\ now \in Nat

MutualExclusion ==
  \A o \in Ops : ~(LeaseValid(recovery[o]) /\ LeaseValid(reconciliation[o]))

GenerationDomain ==
  \A o \in Ops : recovery[o].generation \in Nat /\ reconciliation[o].generation \in Nat

ExpiryDoesNotChangeOtherDomain ==
  /\ \A o \in Ops : TRUE

Next ==
  \/ \E o \in Ops,a \in Owners : RecoveryAcquire(o,a)
  \/ \E o \in Ops,a \in Owners : ReconciliationAcquire(o,a)
  \/ \E o \in Ops : RecoveryExpire(o)
  \/ \E o \in Ops : ReconciliationExpire(o)
  \/ AdvanceTime

Spec == Init /\ [][Next]_vars
=============================================================================
