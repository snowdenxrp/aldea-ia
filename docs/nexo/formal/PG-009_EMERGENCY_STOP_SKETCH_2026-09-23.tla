---- MODULE PG009_Emergency_Stop_Sketch ----
EXTENDS Naturals, FiniteSets

CONSTANT Operations, Gates, Targets

ASSUME Operations # {} /\\ Gates # {} /\\ Targets # {}

VARIABLES
  opState, stopState, gateState, authority, emergencyAuthority,
  worldState, stopEpoch, releaseEpoch, gateEpoch,
  observedGateState, observedGateEpoch, observerState,
  enforcementProof, dispatchCount, observations

vars == <<opState, stopState, gateState, authority, emergencyAuthority,
           worldState, stopEpoch, releaseEpoch, gateEpoch,
           observedGateState, observedGateEpoch, observerState,
           enforcementProof, dispatchCount, observations>>

OpStates == {"NEW","PREPARED","IN_FLIGHT","UNKNOWN","BLOCKED","STOPPED"}
StopStates == {"CLEAR","REQUESTED","DELIVERED","ENFORCING","ENFORCED",
               "UNKNOWN","RECONCILING"}
GateStates == {"OPEN","CLOSED","FAILED","UNKNOWN"}
WorldStates == {"ABSENT","PRESENT","UNKNOWN"}
ObserverStates == {"ALIVE","FAILED","UNKNOWN"}
ProofStates == {"NONE","ENFORCEMENT_VERIFIED","UNKNOWN"}

Init ==
  /\\ opState = [o \\in Operations |-> "NEW"]
  /\\ stopState = [o \\in Operations |-> "CLEAR"]
  /\\ gateState = [o \\in Operations |-> "OPEN"]
  /\\ authority = [o \\in Operations |-> TRUE]
  /\\ emergencyAuthority = [o \\in Operations |-> TRUE]
  /\\ worldState = [o \\in Operations |-> "UNKNOWN"]
  /\\ stopEpoch = [o \\in Operations |-> 0]
  /\\ releaseEpoch = [o \\in Operations |-> 0]
  /\\ gateEpoch = [o \\in Operations |-> 0]
  /\\ observedGateState = [o \\in Operations |-> "UNKNOWN"]
  /\\ observedGateEpoch = [o \\in Operations |-> 0]
  /\\ observerState = [o \\in Operations |-> "ALIVE"]
  /\\ enforcementProof = [o \\in Operations |-> "NONE"]
  /\\ dispatchCount = [o \\in Operations |-> 0]
  /\\ observations = [o \\in Operations |-> "NONE"]

RequestStop(o) ==
  /\\ emergencyAuthority[o]
  /\\ stopState' = [stopState EXCEPT ![o] = "REQUESTED"]
  /\\ stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
  /\\ UNCHANGED <<opState,gateState,authority,emergencyAuthority,
                 worldState,releaseEpoch,gateEpoch,observedGateState,
                 observedGateEpoch,observerState,enforcementProof,
                 dispatchCount,observations>>

DeliverStop(o) ==
  /\\ stopState[o] = "REQUESTED"
  /\\ stopState' = [stopState EXCEPT ![o] = "DELIVERED"]
  /\\ UNCHANGED <<opState,gateState,authority,emergencyAuthority,
                 worldState,stopEpoch,releaseEpoch,gateEpoch,
                 observedGateState,observedGateEpoch,observerState,
                 enforcementProof,dispatchCount,observations>>

EnforceStop(o) ==
  /\\ stopState[o] = "DELIVERED"
  /\\ gateState[o] = "OPEN"
  /\\ gateState' = [gateState EXCEPT ![o] = "CLOSED"]
  /\\ gateEpoch' = [gateEpoch EXCEPT ![o] = @ + 1]
  /\\ stopState' = [stopState EXCEPT ![o] = "ENFORCED"]
  /\\ enforcementProof' = [enforcementProof EXCEPT ![o] = "NONE"]
  /\\ UNCHANGED <<opState,authority,emergencyAuthority,worldState,
                 stopEpoch,releaseEpoch,observedGateState,
                 observedGateEpoch,observerState,dispatchCount,observations>>

ObserveGate(o) ==
  /\\ observerState[o] = "ALIVE"
  /\\ observedGateState' =
        [observedGateState EXCEPT ![o] = gateState[o]]
  /\\ observedGateEpoch' =
        [observedGateEpoch EXCEPT ![o] = gateEpoch[o]]
  /\\ observations' = [observations EXCEPT ![o] = "FRESH"]
  /\\ UNCHANGED <<opState,stopState,gateState,authority,
                 emergencyAuthority,worldState,stopEpoch,releaseEpoch,
                 gateEpoch,observerState,enforcementProof,dispatchCount>>

VerifyEnforcement(o) ==
  /\\ stopState[o] = "ENFORCED"
  /\\ gateState[o] = "CLOSED"
  /\\ observerState[o] = "ALIVE"
  /\\ observedGateState[o] = "CLOSED"
  /\\ observedGateEpoch[o] = gateEpoch[o]
  /\\ enforcementProof' =
        [enforcementProof EXCEPT ![o] = "ENFORCEMENT_VERIFIED"]
  /\\ UNCHANGED <<opState,stopState,gateState,authority,
                 emergencyAuthority,worldState,stopEpoch,releaseEpoch,
                 gateEpoch,observedGateState,observedGateEpoch,
                 observerState,dispatchCount,observations>>

Dispatch(o) ==
  /\\ opState[o] = "PREPARED"
  /\\ authority[o]
  /\\ gateState[o] = "OPEN"
  /\\ stopState[o] = "CLEAR"
  /\\ enforcementProof[o] = "NONE"
  /\\ opState' = [opState EXCEPT ![o] = "IN_FLIGHT"]
  /\\ dispatchCount' = [dispatchCount EXCEPT ![o] = @ + 1]
  /\\ UNCHANGED <<stopState,gateState,authority,emergencyAuthority,
                 worldState,stopEpoch,releaseEpoch,gateEpoch,
                 observedGateState,observedGateEpoch,observerState,
                 enforcementProof,observations>>

LoseExternalOutcome(o) ==
  /\\ opState[o] = "IN_FLIGHT"
  /\\ opState' = [opState EXCEPT ![o] = "UNKNOWN"]
  /\\ worldState' = [worldState EXCEPT ![o] = "UNKNOWN"]
  /\\ UNCHANGED <<stopState,gateState,authority,emergencyAuthority,
                 stopEpoch,releaseEpoch,gateEpoch,observedGateState,
                 observedGateEpoch,observerState,enforcementProof,
                 dispatchCount,observations>>

RevokeAuthority(o) ==
  /\\ authority' = [authority EXCEPT ![o] = FALSE]
  /\\ stopState' = [stopState EXCEPT ![o] = "REQUESTED"]
  /\\ stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
  /\\ enforcementProof' = [enforcementProof EXCEPT ![o] = "NONE"]
  /\\ UNCHANGED <<opState,gateState,emergencyAuthority,worldState,
                 releaseEpoch,gateEpoch,observedGateState,
                 observedGateEpoch,observerState,dispatchCount,
                 observations>>

ObserveWorld(o,s) ==
  /\\ s \\in WorldStates
  /\\ worldState' = [worldState EXCEPT ![o] = s]
  /\\ observations' = [observations EXCEPT ![o] = "FRESH"]
  /\\ UNCHANGED <<opState,stopState,gateState,authority,
                 emergencyAuthority,stopEpoch,releaseEpoch,gateEpoch,
                 observedGateState,observedGateEpoch,observerState,
                 enforcementProof,dispatchCount>>

Release(o) ==
  /\\ stopState[o] = "ENFORCED"
  /\\ gateState[o] = "CLOSED"
  /\\ authority[o]
  /\\ emergencyAuthority[o]
  /\\ enforcementProof[o] = "ENFORCEMENT_VERIFIED"
  /\\ observerState[o] = "ALIVE"
  /\\ worldState[o] # "UNKNOWN"
  /\\ stopEpoch[o] = releaseEpoch[o]
  /\\ gateState' = [gateState EXCEPT ![o] = "OPEN"]
  /\\ stopState' = [stopState EXCEPT ![o] = "CLEAR"]
  /\\ releaseEpoch' = [releaseEpoch EXCEPT ![o] = @ + 1]
  /\\ gateEpoch' = [gateEpoch EXCEPT ![o] = @ + 1]
  /\\ enforcementProof' = [enforcementProof EXCEPT ![o] = "NONE"]
  /\\ UNCHANGED <<opState,authority,emergencyAuthority,worldState,
                 stopEpoch,observedGateState,observedGateEpoch,
                 observerState,dispatchCount,observations>>

GateFailure(o) ==
  /\\ gateState[o] = "CLOSED"
  /\\ gateState' = [gateState EXCEPT ![o] = "FAILED"]
  /\\ stopState' = [stopState EXCEPT ![o] = "UNKNOWN"]
  /\\ enforcementProof' = [enforcementProof EXCEPT ![o] = "UNKNOWN"]
  /\\ UNCHANGED <<opState,authority,emergencyAuthority,worldState,
                 stopEpoch,releaseEpoch,gateEpoch,observedGateState,
                 observedGateEpoch,observerState,dispatchCount,observations>>

ObserverFailure(o) ==
  /\\ observerState[o] = "ALIVE"
  /\\ observerState' = [observerState EXCEPT ![o] = "FAILED"]
  /\\ enforcementProof' = [enforcementProof EXCEPT ![o] = "UNKNOWN"]
  /\\ UNCHANGED <<opState,stopState,gateState,authority,
                 emergencyAuthority,worldState,stopEpoch,releaseEpoch,
                 gateEpoch,observedGateState,observedGateEpoch,
                 dispatchCount,observations>>

NoDispatchWhileEnforced ==
  \\A o \\in Operations :
    stopState[o] = "ENFORCED" => gateState[o] # "OPEN"

NoImplicitRelease ==
  \\A o \\in Operations :
    stopEpoch[o] > releaseEpoch[o] =>
      stopState[o] # "CLEAR"

UnknownDoesNotAuthorize ==
  \\A o \\in Operations :
    stopState[o] = "UNKNOWN" => gateState[o] # "OPEN"

WorldUnknownIsNotAbsence ==
  \\A o \\in Operations :
    worldState[o] = "UNKNOWN" => worldState[o] # "ABSENT"

GateFailureBlocksRelease ==
  \\A o \\in Operations :
    gateState[o] = "FAILED" => stopState[o] # "CLEAR"

VerifiedImpliesClosed ==
  \\A o \\in Operations :
    enforcementProof[o] = "ENFORCEMENT_VERIFIED" =>
      /\\ gateState[o] = "CLOSED"
      /\\ observedGateState[o] = "CLOSED"
      /\\ observedGateEpoch[o] = gateEpoch[o]

UnknownProofDoesNotAuthorize ==
  \\A o \\in Operations :
    enforcementProof[o] = "UNKNOWN" =>
      stopState[o] # "CLEAR"

====

(* MODEL REVIEW NOTES
   This revision deliberately removes the previous
   ReleaseAfterFailureIsForbidden action because it was an unsafe
   anti-example that opened a FAILED gate. An executable TLA+ model
   must not contain a transition that contradicts the intended safety
   contract unless it is explicitly modeled as an environment fault.

   It also fixes two architectural coupling problems:
   1. emergency STOP no longer depends on ordinary execution authority;
   2. revocation no longer claims that enforcement already occurred.

   The model now distinguishes:
   REQUESTED -> DELIVERED -> ENFORCED -> ENFORCEMENT_VERIFIED
   and separately models gate/observer failure.

   LIMITATIONS:
   - no timing bounds;
   - no Byzantine executor/gate behavior;
   - no explicit common-mode domains;
   - no physical actuation;
   - no challenge/admission proof;
   - no target-specific external cancellation semantics;
   - no stale recovery-owner model;
   - no fail-safe/fail-operational profiles.

   This remains a deliberately small architecture sketch.
   It is NOT TLC-VERIFIED.
*)
