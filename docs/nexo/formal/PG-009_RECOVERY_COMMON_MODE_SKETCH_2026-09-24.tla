---- MODULE PG009_Recovery_CommonMode_Sketch ----
EXTENDS Naturals, FiniteSets

CONSTANT Operations, Components, Domains, Dependencies
CONSTANT ComponentDependencyRefs, DependencyDependsOn, DependencyDomain, DependencyFailureDomain, ComponentFailureDomains, ComponentTrustRoots
CONSTANT OperationComponents, ExpectedCorrelatedPairs

ASSUME Operations # {} /\ Components # {} /\ Domains # {} /\ Dependencies # {}

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
  compromisedDependencies,
  assuranceState,
  commitCount

vars ==
  <<stopState, gateState, processState, authorityEpoch, stopEpoch,
    recoveryEpoch, recoveryOwner, recoveryToken, releaseAuthorized,
    worldState, dependencyState, compromisedDependencies, assuranceState,
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
  /\ dependencyState = [o \in Operations |-> [d \in Dependencies |-> "KNOWN"]]
  /\ compromisedDependencies = {}
  /\ assuranceState = [o \in Operations |-> "HOLD"]
  /\ commitCount = [o \in Operations |-> 0]

RequestStop(o) ==
  /\ stopState[o] = "CLEAR"
  /\ stopState' = [stopState EXCEPT ![o] = "ENFORCED"]
  /\ gateState' = [gateState EXCEPT ![o] = "CLOSED"]
  /\ stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ assuranceState' = [assuranceState EXCEPT ![o] = "HOLD"]
  /\ UNCHANGED <<authorityEpoch,recoveryEpoch,recoveryOwner,
      recoveryToken,worldState,dependencyState,compromisedDependencies,commitCount>>

Restart(o) ==
  /\ processState[o] = "OFFLINE"
  /\ processState' = [processState EXCEPT ![o] = "RESTARTED"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<stopState,gateState,authorityEpoch,stopEpoch,recoveryEpoch,
      recoveryOwner,recoveryToken,worldState,dependencyState,
      compromisedDependencies,assuranceState,commitCount>>

Quarantine(o) ==
  /\ processState[o] = "RESTARTED"
  /\ stopState[o] = "ENFORCED"
  /\ processState' = [processState EXCEPT ![o] = "QUARANTINED"]
  /\ stopState' = [stopState EXCEPT ![o] = "QUARANTINED"]
  /\ UNCHANGED <<gateState,authorityEpoch,stopEpoch,recoveryEpoch,
      recoveryOwner,recoveryToken,releaseAuthorized,worldState,
      dependencyState,compromisedDependencies,assuranceState,commitCount>>

AcquireRecovery(o, owner) ==
  /\ processState[o] = "QUARANTINED"
  /\ stopState[o] = "QUARANTINED"
  /\ owner # "NONE"
  /\ recoveryOwner' = [recoveryOwner EXCEPT ![o] = owner]
  /\ recoveryEpoch' = [recoveryEpoch EXCEPT ![o] = @ + 1]
  /\ recoveryToken' = [recoveryToken EXCEPT ![o] = "CURRENT"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      worldState,dependencyState,compromisedDependencies,
      assuranceState,commitCount>>

InvalidateRecovery(o) ==
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryOwner' = [recoveryOwner EXCEPT ![o] = "NONE"]
  /\ recoveryToken' = [recoveryToken EXCEPT ![o] = "STALE"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ assuranceState' = [assuranceState EXCEPT ![o] = "HOLD"]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,worldState,dependencyState,compromisedDependencies,commitCount>>

MarkDependencyUnknown(o, d) ==
  /\ d \in Dependencies
  /\ dependencyState[o][d] = "KNOWN"
  /\ dependencyState' =
      [dependencyState EXCEPT ![o] = [@ EXCEPT ![d] = "UNKNOWN"]]
  /\ assuranceState' = [assuranceState EXCEPT ![o] = "DEGRADED"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,worldState,
      compromisedDependencies,commitCount>>

CompromiseDependency(d) ==
  /\ d \in Dependencies
  /\ compromisedDependencies' = compromisedDependencies \cup {d}
  /\ assuranceState' =
      [o \in Operations |->
        IF d \in OperationDependencies(o)
           THEN IF dependencyState[o][d] = "KNOWN" THEN "DEGRADED" ELSE "HOLD"
           ELSE assuranceState[o]]
  /\ releaseAuthorized' =
      [o \in Operations |->
        IF d \in OperationDependencies(o) THEN FALSE ELSE releaseAuthorized[o]]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,worldState,
      dependencyState,commitCount>>

ReconcileWorld(o, state) ==
  /\ state \in WorldStates
  /\ worldState' = [worldState EXCEPT ![o] = state]
  /\ IF state = "UNKNOWN"
        THEN assuranceState' = [assuranceState EXCEPT ![o] = "HOLD"]
        ELSE UNCHANGED assuranceState
  /\ IF state = "UNKNOWN"
        THEN releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
        ELSE UNCHANGED releaseAuthorized
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,
      dependencyState,compromisedDependencies,commitCount>>

RestoreDependency(o, d) ==
  /\ d \in Dependencies
  /\ d \notin compromisedDependencies
  /\ dependencyState[o][d] = "UNKNOWN"
  /\ dependencyState' =
      [dependencyState EXCEPT ![o] = [@ EXCEPT ![d] = "KNOWN"]]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,releaseAuthorized,
      worldState,compromisedDependencies,assuranceState,commitCount>>

RevalidateAssurance(o) ==
  /\ GraphReferencesKnown
  /\ stopState[o] = "QUARANTINED"
  /\ gateState[o] = "CLOSED"
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryToken[o] = "CURRENT"
  /\ worldState[o] = "KNOWN"
  /\ AllOperationDependenciesKnown(o)
  /\ NoCompromisedOperationDependencies(o)
  /\ assuranceState' = [assuranceState EXCEPT ![o] = "NORMAL"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,worldState,dependencyState,
      compromisedDependencies,commitCount>>

AuthorizeRelease(o) ==
  /\ GraphReferencesKnown
  /\ stopState[o] = "QUARANTINED"
  /\ gateState[o] = "CLOSED"
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryToken[o] = "CURRENT"
  /\ worldState[o] = "KNOWN"
  /\ assuranceState[o] = "NORMAL"
  /\ AllOperationDependenciesKnown(o)
  /\ NoCompromisedOperationDependencies(o)
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<stopState,gateState,processState,authorityEpoch,stopEpoch,
      recoveryEpoch,recoveryOwner,recoveryToken,worldState,
      dependencyState,compromisedDependencies,assuranceState,commitCount>>

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
      recoveryToken,worldState,dependencyState,compromisedDependencies,
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
      dependencyState,compromisedDependencies,assuranceState>>

NoCommitDuringStop ==
  \A o \in Operations :
    stopState[o] # "CLEAR" => processState[o] # "RUNNING"

CommitRequiresClearStop ==
  \A o \in Operations :
    processState[o] = "RUNNING" => stopState[o] = "CLEAR"

RestartDoesNotRelease ==
  \A o \in Operations :
    processState[o] = "RESTARTED" => releaseAuthorized[o] = FALSE

UnknownDependencyBlocksRelease ==
  \A o \in Operations :
    (\E d \in OperationDependencies(o) : dependencyState[o][d] = "UNKNOWN")
      => releaseAuthorized[o] = FALSE

CompromisedDependencyBlocksRelease ==
  \A o \in Operations :
    (\E d \in OperationDependencies(o) : d \in compromisedDependencies)
      => releaseAuthorized[o] = FALSE

NormalAssuranceRequiresKnownDependencies ==
  \A o \in Operations :
    assuranceState[o] = "NORMAL"
      => AllOperationDependenciesKnown(o)

StaleRecoveryCannotRelease ==
  \A o \in Operations :
    recoveryToken[o] = "STALE" => releaseAuthorized[o] = FALSE

WorldUnknownBlocksRelease ==
  \A o \in Operations :
    worldState[o] = "UNKNOWN" => releaseAuthorized[o] = FALSE



(***************************************************************************)
(* Concrete component/dependency graph correspondence. The constants below *)
(* are supplied by the canonical fixture and deliberately model relations   *)
(* explicitly; the model does not infer independence from process labels.   *)
(***************************************************************************)

GraphReferencesKnown ==
  /\ \A c \in Components :
       ComponentDependencyRefs[c] \subseteq Dependencies
  /\ \A d \in Dependencies :
       DependencyDependsOn[d] \subseteq Dependencies
  /\ \A d \in Dependencies :
       DependencyDomain[d] \in Domains
  /\ \A o \in Operations :
       OperationComponents[o] \subseteq Components

RECURSIVE ReachDependency(_,_)

ReachDependency(d, seen) ==
  IF d \in seen
    THEN {}
    ELSE {d} \cup UNION {
      ReachDependency(child, seen \cup {d}) :
        child \in DependencyDependsOn[d]
    }

ComponentDependencyClosure(c) ==
  UNION {
    ReachDependency(d, {}) :
      d \in ComponentDependencyRefs[c]
  }

ComponentDomainClosure(c) ==
  { DependencyDomain[d] : d \in ComponentDependencyClosure(c) }

ComponentDerivedFailureDomains(c) ==
  ComponentFailureDomains[c] \cup
  { DependencyFailureDomain[d] : d \in ComponentDependencyClosure(c) }

ComponentDerivedTrustRoots(c) ==
  ComponentTrustRoots[c] \cup
  { d : d \in ComponentDependencyClosure(c) /\
        [d \in Dependencies] /\
        DependencyDomain[d] = "trust_root" }

SharedFailureDomain(a, b) ==
  ComponentDerivedFailureDomains(a) \cap ComponentDerivedFailureDomains(b) # {}

SharedTrustRoot(a, b) ==
  ComponentDerivedTrustRoots(a) \cap ComponentDerivedTrustRoots(b) # {}

CorrelatedComponents(a, b) ==
  SharedFailureDomain(a, b) \/ SharedTrustRoot(a, b)

FormalCorrelatedPairs ==
  { <<a, b>> :
      a, b \in Components /\
      a # b /\
      CorrelatedComponents(a, b) }

FormalCorrelationMatchesFixture ==
  FormalCorrelatedPairs = ExpectedCorrelatedPairs

NoFalseIndependence ==
  \A a, b \in Components :
    a # b /\
    <<a, b>> \in FormalCorrelatedPairs
      => CorrelatedComponents(a, b)

(***************************************************************************)
(* Evaluator correspondence vocabulary. These definitions intentionally     *)
(* mirror the executable contract; they do not import implementation code. *)
(***************************************************************************)

DependencyKnown(o, d) == dependencyState[o][d] = "KNOWN"
DependencyUncertain(o, d) == dependencyState[o][d] \in {"UNKNOWN", "STALE", "INVALIDATED"}
DependencyCompromised(d) == d \in compromisedDependencies
OperationDependencies(o) ==
  UNION { ComponentDependencyClosure(c) :
    c \in OperationComponents[o] }

AllOperationDependenciesKnown(o) ==
  \A d \in OperationDependencies(o) : DependencyKnown(o, d)

NoCompromisedOperationDependencies(o) ==
  \A d \in OperationDependencies(o) : ~DependencyCompromised(d)

AllDependenciesKnown(o) == \A d \in Dependencies : DependencyKnown(o, d)
NoCompromisedDependencies == \A d \in Dependencies : ~DependencyCompromised(d)

EvaluatorReleaseEligible(o) ==
  /\ stopState[o] = "QUARANTINED"
  /\ gateState[o] = "CLOSED"
  /\ recoveryOwner[o] # "NONE"
  /\ recoveryToken[o] = "CURRENT"
  /\ worldState[o] = "KNOWN"
  /\ assuranceState[o] = "NORMAL"
  /\ AllOperationDependenciesKnown(o)
  /\ NoCompromisedOperationDependencies(o)

EvaluatorDoesNotGrantAuthority ==
  \A o \in Operations :
    ~EvaluatorAuthorityGranted(o)

EvaluatorAuthorityGranted(o) == FALSE

EvaluatorEffectsExecuted(o) == FALSE

ReleaseAuthorizationMatchesEligibility ==
  releaseAuthorized[o] = TRUE <=> EvaluatorReleaseEligible(o)

ReleaseAuthorizedImpliesEligible ==
  \A o \in Operations :
    releaseAuthorized[o] => EvaluatorReleaseEligible(o)

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
  - release is scoped to dependencies reachable from the operation's declared components;
  - release authorization is required to remain exactly aligned with current evaluator release eligibility;
  - Python admissibility remains a richer assurance-level decision; this sketch models release eligibility, not the full assurance ceiling;
  - world UNKNOWN and recovery acquisition explicitly clear prior release authorization;
  - graph validity is required before revalidation/authorization;
  - recoveryEpoch is distinct from stopEpoch;
  - recovery invalidation explicitly blocks release.

  Remaining limitations:
  - component-to-dependency relation is represented explicitly through ComponentDependencyRefs;
  - recursive dependency closure is represented by ReachDependency/ComponentDependencyClosure;
  - operation-scoped dependency closure is represented by OperationComponents/OperationDependencies;
  - canonical correlation can be checked against ExpectedCorrelatedPairs;
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
