---- MODULE PG009_ExternalEffectIdentity_Sketch ----
EXTENDS Naturals, FiniteSets

CONSTANT Operations, Effects, Targets, EffectOperation, EffectTarget

ASSUME Operations # {} /\ Effects # {} /\ Targets # {}
ASSUME EffectOperation \in [Effects -> Operations]
ASSUME EffectTarget \in [Effects -> Targets]

VARIABLES
  reconciliationOwner,
  reconciliationGeneration,
  reconciliationLeaseValid,
  reconciliationEffect,
  reconciliationTarget,
  worldState,
  releaseAuthorized

vars ==
  <<reconciliationOwner, reconciliationGeneration, reconciliationLeaseValid,
    reconciliationEffect, reconciliationTarget, worldState, releaseAuthorized>>

WorldStates == {"KNOWN","UNKNOWN"}

Init ==
  /\ reconciliationOwner = [o \in Operations |-> "NONE"]
  /\ reconciliationGeneration = [o \in Operations |-> 0]
  /\ reconciliationLeaseValid = [o \in Operations |-> FALSE]
  /\ reconciliationEffect = [o \in Operations |-> "UNKNOWN"]
  /\ reconciliationTarget = [o \in Operations |-> "UNKNOWN"]
  /\ worldState = [o \in Operations |-> "UNKNOWN"]
  /\ releaseAuthorized = [o \in Operations |-> FALSE]

AcquireReconciliation(o, owner) ==
  /\ reconciliationOwner[o] = "NONE"
  /\ reconciliationLeaseValid[o] = FALSE
  /\ reconciliationOwner' = [reconciliationOwner EXCEPT ![o] = owner]
  /\ reconciliationGeneration' = [reconciliationGeneration EXCEPT ![o] = @ + 1]
  /\ reconciliationLeaseValid' = [reconciliationLeaseValid EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<reconciliationEffect,reconciliationTarget,worldState,releaseAuthorized>>

ExpireReconciliation(o) ==
  /\ reconciliationLeaseValid[o]
  /\ reconciliationLeaseValid' = [reconciliationLeaseValid EXCEPT ![o] = FALSE]
  /\ reconciliationOwner' = [reconciliationOwner EXCEPT ![o] = "NONE"]
  /\ reconciliationEffect' = [reconciliationEffect EXCEPT ![o] = "UNKNOWN"]
  /\ reconciliationTarget' = [reconciliationTarget EXCEPT ![o] = "UNKNOWN"]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<reconciliationGeneration,worldState>>

ReconcileEffect(o, owner, generation, effect) ==
  /\ reconciliationLeaseValid[o]
  /\ reconciliationOwner[o] = owner
  /\ generation = reconciliationGeneration[o]
  /\ effect \in Effects
  /\ EffectOperation[effect] = o
  /\ reconciliationTarget' = [reconciliationTarget EXCEPT ![o] = EffectTarget[effect]]
  /\ reconciliationEffect' = [reconciliationEffect EXCEPT ![o] = effect]
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<reconciliationOwner,reconciliationGeneration,reconciliationLeaseValid,worldState>>

ReconcileWorld(o, owner, generation, effect, state) ==
  /\ reconciliationLeaseValid[o]
  /\ reconciliationOwner[o] = owner
  /\ generation = reconciliationGeneration[o]
  /\ reconciliationEffect[o] = effect
  /\ effect \in Effects
  /\ EffectOperation[effect] = o
  /\ state \in WorldStates
  /\ worldState' = [worldState EXCEPT ![o] = state]
  /\ IF state = "UNKNOWN"
       THEN releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
       ELSE releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<reconciliationOwner,reconciliationGeneration,reconciliationLeaseValid,reconciliationEffect,reconciliationTarget>>

AuthorizeRelease(o, effect) ==
  /\ reconciliationEffect[o] = effect
  /\ effect \in Effects
  /\ EffectOperation[effect] = o
  /\ reconciliationTarget[o] = EffectTarget[effect]
  /\ worldState[o] = "KNOWN"
  /\ reconciliationLeaseValid[o] = TRUE
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<reconciliationOwner,reconciliationGeneration,reconciliationLeaseValid,reconciliationEffect,reconciliationTarget,worldState>>

Release(o, effect) ==
  /\ releaseAuthorized[o]
  /\ reconciliationEffect[o] = effect
  /\ EffectOperation[effect] = o
  /\ reconciliationTarget[o] = EffectTarget[effect]
  /\ worldState[o] = "KNOWN"
  /\ releaseAuthorized' = [releaseAuthorized EXCEPT ![o] = FALSE]
  /\ UNCHANGED <<reconciliationOwner,reconciliationGeneration,reconciliationLeaseValid,reconciliationEffect,reconciliationTarget,worldState>>

NoCrossOperationEvidence ==
  \A o \in Operations :
    reconciliationEffect[o] # "UNKNOWN" =>
      EffectOperation[reconciliationEffect[o]] = o

TargetBindingCorrect ==
  \A o \in Operations :
    reconciliationEffect[o] # "UNKNOWN" =>
      reconciliationTarget[o] = EffectTarget[reconciliationEffect[o]]

UnknownEffectIdentityBlocksRelease ==
  \A o \in Operations :
    reconciliationEffect[o] = "UNKNOWN" => releaseAuthorized[o] = FALSE

StaleOwnerCannotReconcile ==
  \A o \in Operations :
    ~reconciliationLeaseValid[o] => reconciliationOwner[o] = "NONE"

LeaseDoesNotCrossOperation ==
  \A e \in Effects :
    reconciliationEffect[EffectOperation[e]] = e =>
      EffectOperation[e] = EffectOperation[e]

=============================================================================
(* DESIGN STATUS: formal sketch only; not SANY/TLC verified.
   This module isolates exact operation/effect/target binding.
   It does not model external-world cancellation, Byzantine behavior,
   freshness, provenance, dependency common-mode, CAS/linearizability,
   or physical actuation. *)
