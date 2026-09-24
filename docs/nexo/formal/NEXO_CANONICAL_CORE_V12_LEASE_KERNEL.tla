---------------- MODULE NEXO_CANONICAL_CORE_V12_LEASE_KERNEL ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS Ops, Owners

LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
LeaseRec == [state: LeaseStates, owner: Owners, generation: Nat, expiresAt: Nat]

VARIABLES recovery, reconciliation, execution, releaseValid, now

vars == <<recovery,reconciliation,execution,releaseValid,now>>

Init ==
  /\ recovery = [o \in Ops |-> [state |-> "FREE",
                                  owner |-> CHOOSE x \in Owners: TRUE,
                                  generation |-> 0, expiresAt |-> 0]]
  /\ reconciliation = [o \in Ops |-> [state |-> "FREE",
                                        owner |-> CHOOSE x \in Owners: TRUE,
                                        generation |-> 0, expiresAt |-> 0]]
  /\ execution = [o \in Ops |-> [state |-> "FREE",
                                   owner |-> CHOOSE x \in Owners: TRUE,
                                   generation |-> 0, expiresAt |-> 0]]
  /\ releaseValid = [o \in Ops |-> FALSE]
  /\ now = 0

LeaseValid(l) == l.state = "HELD" /\ l.expiresAt > now

RecoveryAcquire(o, owner) ==
  /\ recovery[o].state = "FREE" \/
     (recovery[o].state = "EXPIRED" /\ recovery[o].expiresAt <= now)
  /\ reconciliation[o].state # "HELD"
  /\ recovery' = [recovery EXCEPT ![o] =
                     [state |-> "HELD", owner |-> owner,
                      generation |-> @.generation + 1,
                      expiresAt |-> now + 4]]
  /\ releaseValid' = [releaseValid EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<reconciliation,execution,now>>

RecoveryExpire(o) ==
  /\ LeaseValid(recovery[o])
  /\ recovery[o].expiresAt <= now
  /\ recovery' = [recovery EXCEPT ![o].state = "EXPIRED"]
  /\ releaseValid' = [releaseValid EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<reconciliation,execution,now>>

RecoveryTakeover(o, owner) ==
  /\ recovery[o].state = "EXPIRED"
  /\ recovery[o].expiresAt <= now
  /\ reconciliation[o].state # "HELD"
  /\ recovery' = [recovery EXCEPT ![o] =
                     [state |-> "HELD", owner |-> owner,
                      generation |-> @.generation + 1,
                      expiresAt |-> now + 4]]
  /\ releaseValid' = [releaseValid EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<reconciliation,execution,now>>

ReconciliationAcquire(o, owner) ==
  /\ reconciliation[o].state = "FREE" \/
     (reconciliation[o].state = "EXPIRED" /\ reconciliation[o].expiresAt <= now)
  /\ recovery[o].state # "HELD"
  /\ reconciliation' = [reconciliation EXCEPT ![o] =
                           [state |-> "HELD", owner |-> owner,
                            generation |-> @.generation + 1,
                            expiresAt |-> now + 4]]
  /\ UNCHANGED <<recovery,execution,releaseValid,now>>

ReconciliationExpire(o) ==
  /\ LeaseValid(reconciliation[o])
  /\ reconciliation[o].expiresAt <= now
  /\ reconciliation' = [reconciliation EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,execution,releaseValid,now>>

ReconciliationTakeover(o, owner) ==
  /\ reconciliation[o].state = "EXPIRED"
  /\ reconciliation[o].expiresAt <= now
  /\ recovery[o].state # "HELD"
  /\ reconciliation' = [reconciliation EXCEPT ![o] =
                           [state |-> "HELD", owner |-> owner,
                            generation |-> @.generation + 1,
                            expiresAt |-> now + 4]]
  /\ UNCHANGED <<recovery,execution,releaseValid,now>>

ExecutionAcquire(o, owner) ==
  /\ execution[o].state = "FREE" \/
     (execution[o].state = "EXPIRED" /\ execution[o].expiresAt <= now)
  /\ execution' = [execution EXCEPT ![o] =
                     [state |-> "HELD", owner |-> owner,
                      generation |-> @.generation + 1,
                      expiresAt |-> now + 3]]
  /\ UNCHANGED <<recovery,reconciliation,releaseValid,now>>

ExecutionExpire(o) ==
  /\ execution[o].state = "HELD"
  /\ execution[o].expiresAt <= now
  /\ execution' = [execution EXCEPT ![o].state = "EXPIRED"]
  /\ UNCHANGED <<recovery,reconciliation,releaseValid,now>>

ExecutionTakeover(o, owner) ==
  /\ execution[o].state = "EXPIRED"
  /\ execution[o].expiresAt <= now
  /\ execution' = [execution EXCEPT ![o] =
                     [state |-> "HELD", owner |-> owner,
                      generation |-> @.generation + 1,
                      expiresAt |-> now + 3]]
  /\ UNCHANGED <<recovery,reconciliation,releaseValid,now>>

RecoveryProtectedAction(o, owner, generation) ==
  /\ recovery[o].state = "HELD"
  /\ recovery[o].owner = owner
  /\ recovery[o].generation = generation
  /\ recovery[o].expiresAt > now

ReconciliationProtectedAction(o, owner, generation) ==
  /\ reconciliation[o].state = "HELD"
  /\ reconciliation[o].owner = owner
  /\ reconciliation[o].generation = generation
  /\ reconciliation[o].expiresAt > now

ExecutionProtectedAction(o, owner, generation) ==
  /\ execution[o].state = "HELD"
  /\ execution[o].owner = owner
  /\ execution[o].generation = generation
  /\ execution[o].expiresAt > now

AdvanceTime ==
  /\ now' = now + 1
  /\ UNCHANGED <<recovery,reconciliation,execution,releaseValid>>

TypeOK ==
  /\ recovery \in [Ops -> LeaseRec]
  /\ reconciliation \in [Ops -> LeaseRec]
  /\ execution \in [Ops -> LeaseRec]
  /\ releaseValid \in [Ops -> BOOLEAN]
  /\ now \in Nat

RecoveryReconciliationExclusive ==
  \A o \in Ops : ~(LeaseValid(recovery[o]) /\ LeaseValid(reconciliation[o]))

GenerationNonNegative ==
  \A o \in Ops :
    /\ recovery[o].generation >= 0
    /\ reconciliation[o].generation >= 0
    /\ execution[o].generation >= 0

ExpiredLeaseHasNoCurrentOwner ==
  \A o \in Ops :
    recovery[o].state = "EXPIRED" => ~LeaseValid(recovery[o])

NoReleaseAfterRecoveryLoss ==
  \A o \in Ops :
    ~LeaseValid(recovery[o]) => ~releaseValid[o]

NoLeaseActionFromStaleGeneration ==
  TRUE

Next ==
  \/ \E o \in Ops, a \in Owners : RecoveryAcquire(o,a)
  \/ \E o \in Ops : RecoveryExpire(o)
  \/ \E o \in Ops, a \in Owners : RecoveryTakeover(o,a)
  \/ \E o \in Ops, a \in Owners : ReconciliationAcquire(o,a)
  \/ \E o \in Ops : ReconciliationExpire(o)
  \/ \E o \in Ops, a \in Owners : ReconciliationTakeover(o,a)
  \/ \E o \in Ops, a \in Owners : ExecutionAcquire(o,a)
  \/ \E o \in Ops : ExecutionExpire(o)
  \/ \E o \in Ops, a \in Owners : ExecutionTakeover(o,a)
  \/ AdvanceTime

Spec == Init /\ [][Next]_vars
=============================================================================
