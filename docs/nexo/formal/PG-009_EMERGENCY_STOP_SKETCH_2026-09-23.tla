---- MODULE PG009_Emergency_Stop_Sketch ----
EXTENDS Naturals, FiniteSets

CONSTANT Operations, Gates, Targets

ASSUME Operations # {} /\ Gates # {} /\ Targets # {}

VARIABLES
  opState, stopState, gateState, authority, worldState,
  stopEpoch, releaseEpoch, dispatchCount, observations

vars == <<opState, stopState, gateState, authority, worldState,
           stopEpoch, releaseEpoch, dispatchCount, observations>>

OpStates == {"NEW","PREPARED","IN_FLIGHT","UNKNOWN","BLOCKED","STOPPED"}
StopStates == {"CLEAR","REQUESTED","ENFORCING","ENFORCED","UNKNOWN","RECONCILING"}
GateStates == {"OPEN","CLOSED","FAILED","UNKNOWN"}
WorldStates == {"ABSENT","PRESENT","UNKNOWN"}

Init ==
  /\ opState = [o \in Operations |-> "NEW"]
  /\ stopState = [o \in Operations |-> "CLEAR"]
  /\ gateState = [o \in Operations |-> "OPEN"]
  /\ authority = [o \in Operations |-> TRUE]
  /\ worldState = [o \in Operations |-> "UNKNOWN"]
  /\ stopEpoch = [o \in Operations |-> 0]
  /\ releaseEpoch = [o \in Operations |-> 0]
  /\ dispatchCount = [o \in Operations |-> 0]
  /\ observations = [o \in Operations |-> "NONE"]

RequestStop(o) ==
  /\ authority[o] = TRUE
  /\ stopState' = [stopState EXCEPT ![o] = "REQUESTED"]
  /\ stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<opState,gateState,authority,worldState,releaseEpoch,
                 dispatchCount,observations>>

EnforceStop(o) ==
  /\ stopState[o] = "REQUESTED"
  /\ gateState[o] = "OPEN"
  /\ gateState' = [gateState EXCEPT ![o] = "CLOSED"]
  /\ stopState' = [stopState EXCEPT ![o] = "ENFORCED"]
  /\ UNCHANGED <<opState,authority,worldState,stopEpoch,releaseEpoch,
                 dispatchCount,observations>>

Dispatch(o) ==
  /\ opState[o] = "PREPARED"
  /\ authority[o]
  /\ gateState[o] = "OPEN"
  /\ stopState[o] = "CLEAR"
  /\ opState' = [opState EXCEPT ![o] = "IN_FLIGHT"]
  /\ dispatchCount' = [dispatchCount EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<stopState,gateState,authority,worldState,stopEpoch,
                 releaseEpoch,observations>>

LoseExternalOutcome(o) ==
  /\ opState[o] = "IN_FLIGHT"
  /\ opState' = [opState EXCEPT ![o] = "UNKNOWN"]
  /\ worldState' = [worldState EXCEPT ![o] = "UNKNOWN"]
  /\ UNCHANGED <<stopState,gateState,authority,stopEpoch,releaseEpoch,
                 dispatchCount,observations>>

RevokeAuthority(o) ==
  /\ authority' = [authority EXCEPT ![o] = FALSE]
  /\ stopState' = [stopState EXCEPT ![o] = "ENFORCED"]
  /\ UNCHANGED <<opState,gateState,worldState,stopEpoch,releaseEpoch,
                 dispatchCount,observations>>

ObserveWorld(o,s) ==
  /\ s \in WorldStates
  /\ worldState' = [worldState EXCEPT ![o] = s]
  /\ observations' = [observations EXCEPT ![o] = "FRESH"]
  /\ UNCHANGED <<opState,stopState,gateState,authority,stopEpoch,
                 releaseEpoch,dispatchCount>>

Release(o) ==
  /\ stopState[o] = "ENFORCED"
  /\ gateState[o] = "CLOSED"
  /\ authority[o] = TRUE
  /\ worldState[o] # "UNKNOWN"
  /\ gateState' = [gateState EXCEPT ![o] = "OPEN"]
  /\ stopState' = [stopState EXCEPT ![o] = "CLEAR"]
  /\ releaseEpoch' = [releaseEpoch EXCEPT ![o] = @ + 1]
  /\ UNCHANGED <<opState,authority,worldState,stopEpoch,dispatchCount,
                 observations>>

GateFailure(o) ==
  /\ gateState[o] = "CLOSED"
  /\ gateState' = [gateState EXCEPT ![o] = "FAILED"]
  /\ stopState' = [stopState EXCEPT ![o] = "UNKNOWN"]
  /\ UNCHANGED <<opState,authority,worldState,stopEpoch,releaseEpoch,
                 dispatchCount,observations>>

ReleaseAfterFailureIsForbidden(o) ==
  /\ gateState[o] = "FAILED"
  /\ stopState[o] = "UNKNOWN"
  /\ gateState' = [gateState EXCEPT ![o] = "OPEN"]
  /\ stopState' = [stopState EXCEPT ![o] = "CLEAR"]
  /\ UNCHANGED <<opState,authority,worldState,stopEpoch,releaseEpoch,
                 dispatchCount,observations>>

NoDispatchWhileEnforced ==
  \A o \in Operations :
    stopState[o] = "ENFORCED" => gateState[o] # "OPEN"

NoImplicitRelease ==
  \A o \in Operations :
    stopEpoch[o] > releaseEpoch[o] =>
      stopState[o] # "CLEAR"

UnknownDoesNotAuthorize ==
  \A o \in Operations :
    stopState[o] = "UNKNOWN" => gateState[o] # "OPEN"

WorldUnknownIsNotAbsence ==
  \A o \in Operations :
    worldState[o] = "UNKNOWN" => worldState[o] # "ABSENT"

GateFailureBlocksRelease ==
  \A o \in Operations :
    gateState[o] = "FAILED" => stopState[o] # "CLEAR"

====

(* MODEL LIMITATIONS
   This is a deliberately small architecture sketch.
   It does NOT model timing bounds, Byzantine components, physical actuation,
   correlated/common-mode failures, or actual external cancellation semantics.

   Critical next refinements:
   1. separate authority plane from emergency plane;
   2. model independent dependency domains and common-mode failure;
   3. make release a fenced conditional transition;
   4. model stale recovery owners;
   5. distinguish stop enforcement from world-state verification;
   6. model fail-safe versus fail-operational profiles;
   7. add multiple operations sharing a target/gate;
   8. run TLC only after the model is syntactically and semantically reviewed.

   This file is NOT TLC-VERIFIED.
*)
