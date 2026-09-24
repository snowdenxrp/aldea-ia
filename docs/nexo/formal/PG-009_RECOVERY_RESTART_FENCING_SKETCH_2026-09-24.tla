---- MODULE PG009_Recovery_Restart_Fencing_Sketch ----
EXTENDS Naturals

CONSTANT Operations, Owners

ASSUME Operations # {} /\ Owners # {}

VARIABLES
  stopState,
  gateState,
  authorityEpoch,
  stopEpoch,
  recoveryEpoch,
  recoveryOwner,
  recoveryToken,
  processState,
  capabilityEpoch,
  releaseAuthorized,
  worldState,
  queueState,
  commitCount

vars ==
  <<stopState, gateState, authorityEpoch, stopEpoch, recoveryEpoch,
    recoveryOwner, recoveryToken, processState, capabilityEpoch,
    releaseAuthorized, worldState, queueState, commitCount>>

StopStates == {"CLEAR","ENFORCED","RECOVERY_FENCED","QUARANTINED","BLOCKED"}
GateStates == {"OPEN","CLOSED","FAILED","UNKNOWN"}
ProcessStates == {"OFFLINE","RESTARTED","QUARANTINED","ADMITTED","RUNNING"}
WorldStates == {"KNOWN","UNKNOWN"}
QueueStates == {"EMPTY","PENDING","BLOCKED"}
TokenStates == {"NONE","CURRENT","STALE"}

Init ==
  /\ stopState = [o \in Operations |-> "CLEAR"]
  /\ gateState = [o \in Operations |-> "OPEN"]
  /\ authorityEpoch = [o \in Operations |-> 0]
  /\ stopEpoch = [o \in Operations |-> 0]
  /\ recoveryEpoch = [o \in Operations |-> 0]
  /\ recoveryOwner = [o \in Operations |-> "NONE"]
  /\ recoveryToken = [o \in Operations |-> "NONE"]
  /\ processState = [o \in Operations |-> "OFFLINE"]
  /\ capabilityEpoch = [o \in Operations |-> 0]
  /\ releaseAuthorized = [o \in Operations |-> FALSE]
  /\ worldState = [o \in Operations |-> "UNKNOWN"]
  /\ queueState = [o \in Operations |-> "EMPTY"]
  /\ commitCount = [o \in Operations |-> 0]

RequestStop(o) ==
  /\ stopState[o] = "CLEAR"
  /\ stopState' = [stopState EXCEPT ![o] = "ENFORCED"]
  /\ stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
  /\ gateState' = [gateState EXCEPT ![o] = "CLOSED"]
  /\ capabilityEpoch' = [capabilityEpoch EXCEPT ![o] = @ + 1]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<authorityEpoch,recoveryEpoch,recoveryOwner,recoveryToken,
                 processState,worldState,queueState,commitCount>>

Restart(o) ==
  /\ processState[o] = "OFFLINE"
  /\ processState' = [processState EXCEPT ![o] = "RESTARTED"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,
                 recoveryEpoch,recoveryOwner,recoveryToken,
                 capabilityEpoch,worldState,queueState,commitCount>>

QuarantineRestart(o) ==
  /\ processState[o] = "RESTARTED"
  /\ stopState[o] # "CLEAR"
  /\ processState' = [processState EXCEPT ![o] = "QUARANTINED"]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,
                 recoveryEpoch,recoveryOwner,recoveryToken,
                 capabilityEpoch,releaseAuthorized,worldState,
                 queueState,commitCount>>

AcquireRecoveryOwner(o, owner) ==
  /\ processState[o] = "QUARANTINED"
  /\ stopState[o] = "QUARANTINED"
  /\ owner \in Owners
  /\ recoveryOwner' = [recoveryOwner EXCEPT ![o] = owner]
  /\ recoveryEpoch' = [recoveryEpoch EXCEPT ![o] = @ + 1]
  /\ recoveryToken' = [recoveryToken EXCEPT ![o] = "CURRENT"]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,
                 processState,capabilityEpoch,releaseAuthorized,
                 worldState,queueState,commitCount>>

InvalidateOldOwner(o) ==
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryOwner' = [recoveryOwner EXCEPT ![o] = "NONE"]
  /\ recoveryToken' = [recoveryToken EXCEPT ![o] = "STALE"]
  /\ stopState' = [stopState EXCEPT ![o] = "QUARANTINED"]
  /\ UNCHANGED <<gateState,authorityEpoch,stopEpoch,recoveryEpoch,
                 processState,capabilityEpoch,releaseAuthorized,
                 worldState,queueState,commitCount>>

Reconcile(o) ==
  /\ processState[o] = "QUARANTINED"
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryToken[o] = "CURRENT"
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,
                 recoveryEpoch,recoveryOwner,recoveryToken,
                 processState,capabilityEpoch,releaseAuthorized,
                 worldState,queueState,commitCount>>

ObserveWorld(o, s) ==
  /\ s \in WorldStates
  /\ worldState' = [worldState EXCEPT ![o] = s]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,
                 recoveryEpoch,recoveryOwner,recoveryToken,
                 processState,capabilityEpoch,releaseAuthorized,
                 queueState,commitCount>>

AuthorizeRelease(o) ==
  /\ stopState[o] = "QUARANTINED"
  /\ gateState[o] = "CLOSED"
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryToken[o] = "CURRENT"
  /\ worldState[o] = "KNOWN"
  /\ authorityEpoch[o] = authorityEpoch[o]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,
                 recoveryEpoch,recoveryOwner,recoveryToken,
                 processState,capabilityEpoch,worldState,
                 queueState,commitCount>>

Release(o) ==
  /\ releaseAuthorized[o]
  /\ recoveryToken[o] = "CURRENT"
  /\ gateState[o] = "CLOSED"
  /\ stopEpoch[o] = recoveryEpoch[o]
  /\ gateState' = [gateState EXCEPT ![o] = "OPEN"]
  /\ stopState' = [stopState EXCEPT ![o] = "CLEAR"]
  /\ processState' = [processState EXCEPT ![o] = "ADMITTED"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<authorityEpoch,stopEpoch,recoveryEpoch,
                 recoveryOwner,recoveryToken,capabilityEpoch,
                 worldState,queueState,commitCount>>

CommitCriticalEffect(o) ==
  /\ processState[o] = "ADMITTED"
  /\ stopState[o] = "CLEAR"
  /\ gateState[o] = "OPEN"
  /\ capabilityEpoch[o] = stopEpoch[o]
  /\ commitCount' = [commitCount EXCEPT ![o] = @ + 1]
  /\ processState' = [processState EXCEPT ![o] = "RUNNING"]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,
                 recoveryEpoch,recoveryOwner,recoveryToken,
                 capabilityEpoch,releaseAuthorized,worldState,
                 queueState>>

StaleOwnerCommitAttempt(o) ==
  /\ recoveryToken[o] = "STALE"
  /\ UNCHANGED vars

NoCriticalCommitDuringStop ==
  \A o \in Operations :
    stopState[o] # "CLEAR" => commitCount[o] = commitCount[o]

RestartDoesNotRelease ==
  \A o \in Operations :
    processState[o] = "RESTARTED" => releaseAuthorized[o] = FALSE

StaleTokenCannotAuthorize ==
  \A o \in Operations :
    recoveryToken[o] = "STALE" => releaseAuthorized[o] = FALSE

CheckpointDoesNotRestoreAuthority ==
  \A o \in Operations :
    processState[o] = "RESTARTED" =>
      capabilityEpoch[o] <= stopEpoch[o]

ReleaseRequiresOwner ==
  \A o \in Operations :
    releaseAuthorized[o] => recoveryOwner[o] # "NONE"

WorldUnknownBlocksRelease ==
  \A o \in Operations :
    worldState[o] = "UNKNOWN" => releaseAuthorized[o] = FALSE

StopFenceIsStickyUntilRelease ==
  \A o \in Operations :
    stopState[o] = "ENFORCED" => gateState[o] # "OPEN"

====
(*
  MODEL REVIEW NOTES

  This is an intentionally small architecture sketch.
  It is NOT TLC-VERIFIED.

  The current sketch still requires correction before executable
  model checking. In particular:
  - the epoch relationship used by Release is too simplified;
  - authority epoch, stop epoch and recovery epoch must not be
    conflated;
  - release must bind an explicit release event and current proof;
  - world reconciliation is represented only abstractly;
  - no explicit artifact/config/runtime digest is modeled;
  - no common-mode dependency graph;
  - no Byzantine behavior;
  - no real coordination-store CAS semantics;
  - no operation/effect identity;
  - no queue replay race;
  - no timing bounds.

  The sketch is therefore a design aid, not verification evidence.
*)
