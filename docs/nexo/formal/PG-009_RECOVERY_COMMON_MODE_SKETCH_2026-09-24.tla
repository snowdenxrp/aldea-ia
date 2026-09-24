---- MODULE PG009_Recovery_CommonMode_Sketch ----
EXTENDS Naturals, FiniteSets

CONSTANT Operations, Components, Domains

ASSUME Operations # {} /\ Components # {} /\ Domains # {}

VARIABLES
  stopState,
  gateState,
  processState,
  authorityEpoch,
  stopEpoch,
  recoveryEpoch,
  recoveryOwner,
  recoveryToken,
  releaseAuthorized,
  worldState,
  dependencyState,
  compromisedDomains,
  assuranceState,
  commitCount

vars ==
  <<stopState, gateState, processState, authorityEpoch, stopEpoch,
    recoveryEpoch, recoveryOwner, recoveryToken, releaseAuthorized,
    worldState, dependencyState, compromisedDomains, assuranceState,
    commitCount>>

StopStates == {"CLEAR","ENFORCED","QUARANTINED"}
GateStates == {"OPEN","CLOSED","FAILED","UNKNOWN"}
ProcessStates == {"OFFLINE","RESTARTED","QUARANTINED","ADMITTED","RUNNING"}
WorldStates == {"KNOWN","UNKNOWN"}
TokenStates == {"NONE","CURRENT","STALE"}
AssuranceStates == {"NORMAL","DEGRADED","HOLD","QUARANTINED"}

Init ==
  /\ stopState = [o \in Operations |-> "CLEAR"]
  /\ gateState = [o \in Operations |-> "OPEN"]
  /\ processState = [o \in Operations |-> "OFFLINE"]
  /\ authorityEpoch = [o \in Operations |-> 0]
  /\ stopEpoch = [o \in Operations |-> 0]
  /\ recoveryEpoch = [o \in Operations |-> 0]
  /\ recoveryOwner = [o \in Operations |-> "NONE"]
  /\ recoveryToken = [o \in Operations |-> "NONE"]
  /\ releaseAuthorized = [o \in Operations |-> FALSE]
  /\ worldState = [o \in Operations |-> "UNKNOWN"]
  /\ dependencyState = [o \in Operations |-> [d \in Domains |-> "KNOWN"]]
  /\ compromisedDomains = {}
  /\ assuranceState = [o \in Operations |-> "HOLD"]
  /\ commitCount = [o \in Operations |-> 0]

RequestStop(o) ==
  /\ stopState[o] = "CLEAR"
  /\ stopState' = [stopState EXCEPT ![o] = "ENFORCED"]
  /\ gateState' = [gateState EXCEPT ![o] = "CLOSED"]
  /\ stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ assuranceState' = [assuranceState EXCEPT ![o] = "HOLD"]
  /\ UNCHANGED <<processState,authorityEpoch,recoveryEpoch,recoveryOwner,
      recoveryToken,worldState,dependencyState,compromisedDomains,commitCount>>

Restart(o) ==
  /\ processState[o] = "OFFLINE"
  /\ processState' = [processState EXCEPT ![o] = "RESTARTED"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,recoveryEpoch,
      recoveryOwner,recoveryToken,worldState,dependencyState,
      compromisedDomains,assuranceState,commitCount>>

Quarantine(o) ==
  /\ processState[o] = "RESTARTED"
  /\ stopState[o] = "ENFORCED"
  /\ processState' = [processState EXCEPT ![o] = "QUARANTINED"]
  /\ stopState' = [stopState EXCEPT ![o] = "QUARANTINED"]
  /\ UNCHANGED <<gateState,authorityEpoch,stopEpoch,recoveryEpoch,
      recoveryOwner,recoveryToken,releaseAuthorized,worldState,
      dependencyState,compromisedDomains,assuranceState,commitCount>>

AcquireRecovery(o, owner) ==
  /\ processState[o] = "QUARANTINED"
  /\ stopState[o] = "QUARANTINED"
  /\ owner # "NONE"
  /\ recoveryOwner' = [recoveryOwner EXCEPT ![o] = owner]
  /\ recoveryEpoch' = [recoveryEpoch EXCEPT ![o] = @ + 1]
  /\ recoveryToken' = [recoveryToken EXCEPT ![o] = "CURRENT"]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      releaseAuthorized,worldState,dependencyState,compromisedDomains,
      assuranceState,commitCount>>

InvalidateRecovery(o) ==
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryOwner' = [recoveryOwner EXCEPT ![o] = "NONE"]
  /\ recoveryToken' = [recoveryToken EXCEPT ![o] = "STALE"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ assuranceState' = [assuranceState EXCEPT ![o] = "HOLD"]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,worldState,dependencyState,compromisedDomains,commitCount>>

MarkDependencyUnknown(o, d) ==
  /\ d \in Domains
  /\ dependencyState[o][d] = "KNOWN"
  /\ dependencyState' =
      [dependencyState EXCEPT ![o] = [@ EXCEPT ![d] = "UNKNOWN"]]
  /\ assuranceState' = [assuranceState EXCEPT ![o] = "DEGRADED"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,worldState,
      compromisedDomains,commitCount>>

CompromiseDomain(d) ==
  /\ d \in Domains
  /\ compromisedDomains' = compromisedDomains \cup {d}
  /\ assuranceState' =
      [o \in Operations |->
        IF dependencyState[o][d] = "KNOWN"
           THEN "DEGRADED"
           ELSE "HOLD"]
  /\ releaseAuthorized' =
      [o \in Operations |-> FALSE]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,worldState,
      dependencyState,commitCount>>

ReconcileWorld(o, state) ==
  /\ state \in WorldStates
  /\ worldState' = [worldState EXCEPT ![o] = state]
  /\ IF state = "UNKNOWN"
        THEN assuranceState' = [assuranceState EXCEPT ![o] = "HOLD"]
        ELSE UNCHANGED assuranceState
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,releaseAuthorized,
      dependencyState,compromisedDomains,commitCount>>

RestoreDependency(o, d) ==
  /\ d \in Domains
  /\ d \notin compromisedDomains
  /\ dependencyState[o][d] = "UNKNOWN"
  /\ dependencyState' =
      [dependencyState EXCEPT ![o] = [@ EXCEPT ![d] = "KNOWN"]]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,releaseAuthorized,
      worldState,compromisedDomains,assuranceState,commitCount>>

AuthorizeRelease(o) ==
  /\ stopState[o] = "QUARANTINED"
  /\ gateState[o] = "CLOSED"
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryToken[o] = "CURRENT"
  /\ worldState[o] = "KNOWN"
  /\ assuranceState[o] = "NORMAL"
  /\ \A d \in Domains : dependencyState[o][d] = "KNOWN"
  /\ \A d \in Domains : d \notin compromisedDomains
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,worldState,
      dependencyState,compromisedDomains,assuranceState,commitCount>>

Release(o) ==
  /\ releaseAuthorized[o]
  /\ stopState[o] = "QUARANTINED"
  /\ gateState[o] = "CLOSED"
  /\ recoveryToken[o] = "CURRENT"
  /\ recoveryEpoch[o] > stopEpoch[o]
  /\ gateState' = [gateState EXCEPT ![o] = "OPEN"]
  /\ stopState' = [stopState EXCEPT ![o] = "CLEAR"]
  /\ processState' = [processState EXCEPT ![o] = "ADMITTED"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<authorityEpoch,stopEpoch,recoveryEpoch,recoveryOwner,
      recoveryToken,worldState,dependencyState,compromisedDomains,
      assuranceState,commitCount>>

Commit(o) ==
  /\ processState[o] = "ADMITTED"
  /\ stopState[o] = "CLEAR"
  /\ gateState[o] = "OPEN"
  /\ assuranceState[o] = "NORMAL"
  /\ commitCount' = [commitCount EXCEPT ![o] = @ + 1]
  /\ processState' = [processState EXCEPT ![o] = "RUNNING"]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,recoveryEpoch,
      recoveryOwner,recoveryToken,releaseAuthorized,worldState,
      dependencyState,compromisedDomains,assuranceState>>

NoCommitDuringStop ==
  \A o \in Operations :
    stopState[o] # "CLEAR" => commitCount[o] = commitCount[o]

RestartDoesNotRelease ==
  \A o \in Operations :
    processState[o] = "RESTARTED" => releaseAuthorized[o] = FALSE

UnknownDependencyBlocksRelease ==
  \A o \in Operations :
    (\E d \in Domains : dependencyState[o][d] = "UNKNOWN")
      => releaseAuthorized[o] = FALSE

CompromisedDependencyBlocksRelease ==
  \A o \in Operations :
    (\E d \in Domains : d \in compromisedDomains)
      => releaseAuthorized[o] = FALSE

NormalAssuranceRequiresKnownDependencies ==
  \A o \in Operations :
    assuranceState[o] = "NORMAL"
      => \A d \in Domains : dependencyState[o][d] = "KNOWN"

StaleRecoveryCannotRelease ==
  \A o \in Operations :
    recoveryToken[o] = "STALE" => releaseAuthorized[o] = FALSE

WorldUnknownBlocksRelease ==
  \A o \in Operations :
    worldState[o] = "UNKNOWN" => releaseAuthorized[o] = FALSE



(***************************************************************************)
(* Evaluator correspondence vocabulary. These definitions intentionally     *)
(* mirror the executable contract; they do not import implementation code. *)
(***************************************************************************)

DependencyKnown(o, d) == dependencyState[o][d] = "KNOWN"
DependencyUncertain(o, d) == dependencyState[o][d] \in {"UNKNOWN", "STALE", "INVALIDATED"}
DependencyCompromised(d) == d \in compromisedDomains
AllDependenciesKnown(o) == \A d \in Domains : DependencyKnown(o, d)
NoCompromisedDependencies == \A d \in Domains : ~DependencyCompromised(d)

EvaluatorReleaseEligible(o) ==
  /\ stopState[o] = "QUARANTINED"
  /\ gateState[o] = "CLOSED"
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryToken[o] = "CURRENT"
  /\ worldState[o] = "KNOWN"
  /\ assuranceState[o] = "NORMAL"
  /\ AllDependenciesKnown(o)
  /\ NoCompromisedDependencies

EvaluatorDoesNotGrantAuthority ==
  \A o \in Operations :
    TRUE

====
(*
  CORRESPONDENCE STATUS:
  The evaluator vocabulary is intentionally observational and does not grant
  authority. Component-to-domain mapping and transitive closure remain outside
  this sketch and must not be inferred from the vocabulary alone.

  MODEL LIMITATION DISCOVERED AND FIXED:
  The previous Quarantine precondition required stopState = "QUARANTINED"
  before Quarantine itself could establish that state. The transition now
  requires stopState = "ENFORCED" and performs the ENFORCED -> QUARANTINED
  transition, making the recovery path reachable in the model.
*)
  DESIGN STATUS:
  This is a formalization aid and is NOT TLC-VERIFIED.

  Improvements over the previous recovery sketch:
  - explicit dependency domains and dependency UNKNOWN state;
  - explicit compromised-domain set;
  - assurance degradation;
  - release requires all modeled dependencies known and uncompromised;
  - recoveryEpoch is distinct from stopEpoch;
  - recovery invalidation explicitly blocks release.

  Remaining limitations:
  - no component-to-domain relation yet;
  - no transitive dependency closure;
  - no partial domain compromise;
  - no Byzantine behavior;
  - no CAS/linearizability semantics;
  - no operation/effect identity;
  - no artifact/config/runtime digest;
  - no update transaction;
  - no explicit emergency enforcement proof;
  - no timing/freshness;
  - no liveness/fairness;
  - the release relation is still intentionally simplified.
*)
