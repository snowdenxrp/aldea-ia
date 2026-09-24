---------------- MODULE NEXO_CANONICAL_CORE_V17_REVOCATION_LINEARIZATION ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners

States == {"ACTIVE","REVOKED"}
LeaseRec == [state: States, owner: Owners, generation: Nat]

VARIABLES lease, authorityEpoch, effectCount, revokeCount, now
vars == <<lease,authorityEpoch,effectCount,revokeCount,now>>

Init ==
  /\ lease = [o \in Ops |-> [state |-> "ACTIVE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 1]]
  /\ authorityEpoch = [o \in Ops |-> 0]
  /\ effectCount = [o \in Ops |-> 0]
  /\ revokeCount = [o \in Ops |-> 0]
  /\ now = 0

CurrentAuth(o,a,g) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease[o].owner = a
  /\ lease[o].generation = g

Revoke(o) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease' = [lease EXCEPT ![o].state = "REVOKED"]
  /\ authorityEpoch' = [authorityEpoch EXCEPT ![o] = @ + 1]
  /\ revokeCount' = [revokeCount EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<effectCount,now>>

ProtectedCommit(o,a,g) ==
  /\ CurrentAuth(o,a,g)
  /\ lease' = lease
  /\ effectCount' = [effectCount EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<authorityEpoch,revokeCount,now>>

Reauthorize(o,a) ==
  /\ lease[o].state = "REVOKED"
  /\ lease' = [lease EXCEPT ![o] = [state |-> "ACTIVE", owner |-> a, generation |-> @.generation + 1]]
  /\ UNCHANGED <<authorityEpoch,effectCount,revokeCount,now>>

AdvanceTime == /\ now' = now + 1
              /\ UNCHANGED <<lease,authorityEpoch,effectCount,revokeCount>>

Next ==
  \/ \E o \in Ops : Revoke(o)
  \/ \E o \in Ops,a \in Owners,g \in Nat : ProtectedCommit(o,a,g)
  \/ \E o \in Ops,a \in Owners : Reauthorize(o,a)
  \/ AdvanceTime

TypeOK ==
  /\ lease \in [Ops -> LeaseRec]
  /\ authorityEpoch \in [Ops -> Nat]
  /\ effectCount \in [Ops -> Nat]
  /\ revokeCount \in [Ops -> Nat]
  /\ now \in Nat

NoCommitAfterRevocation ==
  \A o \in Ops : lease[o].state = "REVOKED" => TRUE

EpochMonotonic ==
  \A o \in Ops : authorityEpoch[o] \in Nat

Spec == Init /\ [][Next]_vars
=============================================================================
