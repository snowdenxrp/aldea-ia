---------------- MODULE NEXO_CANONICAL_CORE_V20_GLOBAL_LINEARIZATION ----------------
EXTENDS Naturals

CONSTANTS Ops, Owners, Admins

AuthStates == {"ACTIVE","REVOKED"}
LeaseRec == [state: AuthStates, owner: Owners, generation: Nat]
EffectStates == {"NONE","COMMITTED"}
EffectRec == [status: EffectStates, owner: Owners, generation: Nat, authorityEpoch: Nat, linearization: Nat]
AdminRec == [enabled: BOOLEAN, epoch: Nat]

VARIABLES lease, authorityEpoch, effect, admin, clock, lastEvent
vars == <<lease,authorityEpoch,effect,admin,clock,lastEvent>>

Init ==
  /\ lease = [o \in Ops |-> [state |-> "ACTIVE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 1]]
  /\ authorityEpoch = [o \in Ops |-> 0]
  /\ effect = [o \in Ops |-> [status |-> "NONE", owner |-> CHOOSE x \in Owners: TRUE, generation |-> 0, authorityEpoch |-> 0, linearization |-> 0]]
  /\ admin = [o \in Ops |-> [enabled |-> TRUE, epoch |-> 0]]
  /\ clock = 0
  /\ lastEvent = [o \in Ops |-> 0]

CurrentAuth(o,a,g,e) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease[o].owner = a
  /\ lease[o].generation = g
  /\ authorityEpoch[o] = e

NextClock == clock + 1

ProtectedCommit(o,a,g,e) ==
  /\ CurrentAuth(o,a,g,e)
  /\ effect' = [effect EXCEPT ![o] = [status |-> "COMMITTED", owner |-> a, generation |-> g, authorityEpoch |-> e, linearization |-> NextClock]]
  /\ clock' = NextClock
  /\ lastEvent' = [lastEvent EXCEPT ![o] = NextClock]
  /\ UNCHANGED <<lease,authorityEpoch,admin>>

Revoke(o) ==
  /\ lease[o].state = "ACTIVE"
  /\ lease' = [lease EXCEPT ![o].state = "REVOKED"]
  /\ authorityEpoch' = [authorityEpoch EXCEPT ![o] = @ + 1]
  /\ clock' = NextClock
  /\ lastEvent' = [lastEvent EXCEPT ![o] = NextClock]
  /\ UNCHANGED <<effect,admin>>

Reauthorize(o,a,adminId) ==
  /\ lease[o].state = "REVOKED"
  /\ admin[ o ].enabled = TRUE
  /\ adminId \in Admins
  /\ lease' = [lease EXCEPT ![o] = [state |-> "ACTIVE", owner |-> a, generation |-> @.generation + 1]]
  /\ authorityEpoch' = [authorityEpoch EXCEPT ![o] = @ + 1]
  /\ admin' = [admin EXCEPT ![o].epoch = @.epoch + 1]
  /\ clock' = NextClock
  /\ lastEvent' = [lastEvent EXCEPT ![o] = NextClock]
  /\ UNCHANGED <<effect>>

StaleRetryBlocked(o,a,g,e) == ~CurrentAuth(o,a,g,e)

CommitLinearizedBeforeRevoke(o) ==
  /\ effect[o].status = "COMMITTED"
  /\ effect[o].authorityEpoch < authorityEpoch[o]
  /\ effect[o].linearization > 0

RevokeLinearizedAfterCommit(o) ==
  CommitLinearizedBeforeRevoke(o) /\ lastEvent[o] >= effect[o].linearization

RevokeBeforeOldCommitImpossible(o,a,g,e) ==
  /\ authorityEpoch[o] # e
  /\ ~CurrentAuth(o,a,g,e)

GlobalClockDomain == clock \in Nat

TypeOK ==
  /\ lease \in [Ops -> LeaseRec]
  /\ authorityEpoch \in [Ops -> Nat]
  /\ effect \in [Ops -> EffectRec]
  /\ admin \in [Ops -> AdminRec]
  /\ clock \in Nat
  /\ lastEvent \in [Ops -> Nat]

Next ==
  \/ \E o \in Ops,a \in Owners,g,e \in Nat : ProtectedCommit(o,a,g,e)
  \/ \E o \in Ops : Revoke(o)
  \/ \E o \in Ops,a \in Owners,adminId \in Admins : Reauthorize(o,a,adminId)

Spec == Init /\ [][Next]_vars
=============================================================================
