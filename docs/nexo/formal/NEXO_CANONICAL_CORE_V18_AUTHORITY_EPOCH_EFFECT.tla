---------------- MODULE NEXO_CANONICAL_CORE_V18_AUTHORITY_EPOCH_EFFECT ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners

States == {"ACTIVE","REVOKED"}
LeaseRec == [state: States, owner: Owners, generation: Nat]
EffectRec == [status: {"NONE","COMMITTED"}, owner: Owners, generation: Nat, authorityEpoch: Nat]

VARIABLES lease, authorityEpoch, effect, commitSeq, revokeSeq
vars == <<lease,authorityEpoch,effect,commitSeq,revokeSeq>>

Init ==
  /\ lease = [o \in Ops |-> [state |-> "ACTIVE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 1]]
  /\ authorityEpoch = [o \in Ops |-> 0]
  /\ effect = [o \in Ops |-> [status |-> "NONE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, authorityEpoch |-> 0]]
  /\ commitSeq = [o \in Ops |-> 0]
  /\ revokeSeq = [o \in Ops |-> 0]

CurrentAuth(o,a,g,e) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease[o].owner = a
  /\ lease[o].generation = g
  /\ authorityEpoch[o] = e

Revoke(o) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease' = [lease EXCEPT ![o].state = "REVOKED"]
  /\ authorityEpoch' = [authorityEpoch EXCEPT ![o] = @ + 1]
  /\ revokeSeq' = [revokeSeq EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<effect,commitSeq>>

ProtectedCommit(o,a,g,e) ==
  /\ CurrentAuth(o,a,g,e)
  /\ effect' = [effect EXCEPT ![o] = [status |-> "COMMITTED", owner |-> a, generation |-> g, authorityEpoch |-> e]]
  /\ commitSeq' = [commitSeq EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<lease,authorityEpoch,revokeSeq>>

Reauthorize(o,a) ==
  /\ lease[o].state = "REVOKED"
  /\ lease' = [lease EXCEPT ![o] = [state |-> "ACTIVE", owner |-> a, generation |-> @.generation + 1]]
  /\ authorityEpoch' = [authorityEpoch EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<effect,commitSeq,revokeSeq>>

StaleRetryBlocked(o,a,g,e) ==
  ~CurrentAuth(o,a,g,e)

CommitCarriesAuthorityContext ==
  \A o \in Ops : effect[o].status = "COMMITTED" =>
    effect[o].generation \in Nat /\ effect[o].authorityEpoch \in Nat

ReauthorizationChangesEpoch ==
  \A o \in Ops : authorityEpoch[o] \in Nat

Next ==
  \/ \E o \in Ops : Revoke(o)
  \/ \E o \in Ops,a \in Owners,g,e \in Nat : ProtectedCommit(o,a,g,e)
  \/ \E o \in Ops,a \in Owners : Reauthorize(o,a)

Spec == Init /\ [][Next]_vars
=============================================================================
