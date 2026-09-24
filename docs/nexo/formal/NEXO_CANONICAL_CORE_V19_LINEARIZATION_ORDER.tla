---------------- MODULE NEXO_CANONICAL_CORE_V19_LINEARIZATION_ORDER ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners, Admins

AuthStates == {"ACTIVE","REVOKED"}
LeaseRec == [state: AuthStates, owner: Owners, generation: Nat]
EffectStates == {"NONE","COMMITTED"}
EffectRec == [status: EffectStates, owner: Owners, generation: Nat, authorityEpoch: Nat, commitSeq: Nat]

VARIABLES lease, authorityEpoch, effect, commitSeq, revokeSeq, adminEpoch
vars == <<lease,authorityEpoch,effect,commitSeq,revokeSeq,adminEpoch>>

Init ==
  /\ lease = [o \in Ops |-> [state |-> "ACTIVE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 1]]
  /\ authorityEpoch = [o \in Ops |-> 0]
  /\ effect = [o \in Ops |-> [status |-> "NONE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, authorityEpoch |-> 0, commitSeq |-> 0]]
  /\ commitSeq = [o \in Ops |-> 0]
  /\ revokeSeq = [o \in Ops |-> 0]
  /\ adminEpoch = [o \in Ops |-> 0]

CurrentAuth(o,a,g,e) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease[o].owner = a
  /\ lease[o].generation = g
  /\ authorityEpoch[o] = e

ProtectedCommit(o,a,g,e) ==
  /\ CurrentAuth(o,a,g,e)
  /\ effect' = [effect EXCEPT ![o] = [status |-> "COMMITTED", owner |-> a, generation |-> g, authorityEpoch |-> e, commitSeq |-> commitSeq[o] + 1]]
  /\ commitSeq' = [commitSeq EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<lease,authorityEpoch,revokeSeq,adminEpoch>>

Revoke(o) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease' = [lease EXCEPT ![o].state = "REVOKED"]
  /\ authorityEpoch' = [authorityEpoch EXCEPT ![o] = @ + 1]
  /\ revokeSeq' = [revokeSeq EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<effect,commitSeq,adminEpoch>>

Reauthorize(o,a,admin) ==
  /\ lease[o].state = "REVOKED"
  /\ admin \in Admins
  /\ adminEpoch[o] = adminEpoch[o]
  /\ lease' = [lease EXCEPT ![o] = [state |-> "ACTIVE", owner |-> a, generation |-> @.generation + 1]]
  /\ authorityEpoch' = [authorityEpoch EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<effect,commitSeq,revokeSeq,adminEpoch>>

StaleRetryBlocked(o,a,g,e) == ~CurrentAuth(o,a,g,e)

CommitBeforeRevoke(o) ==
  effect[o].status = "COMMITTED" /\ effect[o].authorityEpoch < authorityEpoch[o]

RevokeBeforeCommit(o,a,g,e) ==
  authorityEpoch[o] # e /\ ~CurrentAuth(o,a,g,e)

HistoricalEffectPreserved(o) ==
  effect[o].status = "COMMITTED" => effect[o].commitSeq > 0

Next ==
  \/ \E o \in Ops,a \in Owners,g,e \in Nat : ProtectedCommit(o,a,g,e)
  \/ \E o \in Ops : Revoke(o)
  \/ \E o \in Ops,a \in Owners,admin \in Admins : Reauthorize(o,a,admin)

TypeOK ==
  /\ lease \in [Ops -> LeaseRec]
  /\ authorityEpoch \in [Ops -> Nat]
  /\ effect \in [Ops -> EffectRec]
  /\ commitSeq \in [Ops -> Nat]
  /\ revokeSeq \in [Ops -> Nat]
  /\ adminEpoch \in [Ops -> Nat]

Spec == Init /\ [][Next]_vars
=============================================================================
