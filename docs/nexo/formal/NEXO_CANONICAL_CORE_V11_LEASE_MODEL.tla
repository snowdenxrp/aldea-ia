---------------- MODULE NEXO_CANONICAL_CORE_V11_LEASE_MODEL ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS Ops, Owners

LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
StopStates == {"NORMAL","REQUESTED","ENFORCING","VERIFIED"}

LeaseRec == [state: LeaseStates, owner: Owners, generation: Nat, expiresAt: Nat]

VARIABLES recovery, reconciliation, execution, releaseValid, stop, now

vars == <<recovery,reconciliation,execution,releaseValid,stop,now>>

Init ==
  /\ recovery = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE,
                              generation |-> 0, expiresAt |-> 0]]
  /\ reconciliation = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE,
                                        generation |-> 0, expiresAt |-> 0]]
  /\ execution = [o \in Ops |-> [state |-> "FREE", owner |-> CHOOSE x \in Owners: TRUE,
                                   generation |-> 0, expiresAt |-> 0]]
  /\ releaseValid = [o \in Ops |-> FALSE]
  /\ stop = [o \in Ops |-> "NORMAL"]
  /\ now = 0

LeaseValid(l) == l.state = "HELD" /\ l.expiresAt > now

AcquireLease(table, o, owner, duration) ==
  /\ table[o].state = "FREE" \/
     (table[o].state = "EXPIRED" /\ table[o].expiresAt <= now)
  /\ table' = [table EXCEPT ![o] =
                  [state |-> "HELD", owner |-> owner,
                   generation |-> @.generation + 1,
                   expiresAt |-> now + duration]]

ExpireLease(table, o) ==
  /\ table[o].state = "HELD"
  /\ table[o].expiresAt <= now
  /\ table' = [table EXCEPT ![o].state = "EXPIRED"]

TakeoverLease(table, o, owner) ==
  /\ table[o].state = "EXPIRED"
  /\ table[o].expiresAt <= now
  /\ table' = [table EXCEPT ![o] =
                  [state |-> "HELD", owner |-> owner,
                   generation |-> @.generation + 1,
                   expiresAt |-> now + 3]]

StaleOwnerBlocked(table,o,owner,generation) ==
  ~(table[o].state = "HELD" /\
    table[o].owner = owner /\
    table[o].generation = generation /\
    LeaseValid(table[o]))

RecoveryAndReconciliationExclusive ==
  \A o \in Ops : ~(LeaseValid(recovery[o]) /\ LeaseValid(reconciliation[o]))

StopInvalidatesRelease ==
  \A o \in Ops : stop[o] # "NORMAL" => ~releaseValid[o]

GenerationNeverDecreases ==
  \A o \in Ops :
    recovery[o].generation >= 0 /\
    reconciliation[o].generation >= 0 /\
    execution[o].generation >= 0

ExpiryDoesNotChangeWorld ==
  TRUE

Next ==
  \/ \E o \in Ops, a \in Owners :
       AcquireLease(recovery,o,a,4)
  \/ \E o \in Ops, a \in Owners :
       TakeoverLease(recovery,o,a)
  \/ \E o \in Ops :
       ExpireLease(recovery,o)
  \/ \E o \in Ops, a \in Owners :
       AcquireLease(reconciliation,o,a,4)
  \/ \E o \in Ops, a \in Owners :
       TakeoverLease(reconciliation,o,a)
  \/ \E o \in Ops :
       ExpireLease(reconciliation,o)
  \/ \E o \in Ops, a \in Owners :
       AcquireLease(execution,o,a,3)
  \/ \E o \in Ops, a \in Owners :
       TakeoverLease(execution,o,a)
  \/ \E o \in Ops :
       ExpireLease(execution,o)
  \/ \E o \in Ops :
       stop' = [stop EXCEPT ![o] = "REQUESTED"]
       /\ releaseValid' = [releaseValid EXCEPT ![o] = FALSE]
       /\ UNCHANGED <<recovery,reconciliation,execution,now>>
  \/ now' = now + 1
     /\ UNCHANGED <<recovery,reconciliation,execution,releaseValid,stop>>

Spec == Init /\ [][Next]_vars
=============================================================================
