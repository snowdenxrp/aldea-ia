------------------------------ MODULE NexoMinKernelReductionV1 ------------------------------
EXTENDS Naturals, FiniteSets

CONSTANTS A, B, V1, V2, T1, T2, O1, O2

Actors == {A, B}
Contexts == {V1, V2}
Targets == {T1, T2}
Effects == {O1, O2}
None == "NONE"

VARIABLES identityStatus, identityEpoch, authorityStatus, authorityEpoch,
          coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch,
          safetyContext, currentness, currentnessEpoch,
          effectStatus, effectOperation, effectKey, effectTarget, effectContext,
          recoveryStatus, recoveryOwner, recoveryEpoch, admitted

vars == <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
  coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
  currentness, currentnessEpoch, effectStatus, effectOperation, effectKey,
  effectTarget, effectContext, recoveryStatus, recoveryOwner, recoveryEpoch,
  admitted>>

Init ==
  /\ identityStatus = "ACTIVE"
  /\ identityEpoch = 0
  /\ authorityStatus = "VALID"
  /\ authorityEpoch = 0
  /\ coordOwner = None
  /\ coordEpoch = 0
  /\ actorFence = [a \in Actors |-> 0]
  /\ stopStatus = "CLEAR"
  /\ stopEpoch = 0
  /\ safetyContext = V1
  /\ currentness = "VALID"
  /\ currentnessEpoch = 0
  /\ effectStatus = "NONE"
  /\ effectOperation = None
  /\ effectKey = None
  /\ effectTarget = None
  /\ effectContext = None
  /\ recoveryStatus = "NONE"
  /\ recoveryOwner = None
  /\ recoveryEpoch = 0
  /\ admitted = FALSE

AcquireFence(a) ==
  /\ a \in Actors
  /\ coordOwner # a
  /\ coordEpoch' = coordEpoch + 1
  /\ coordOwner' = a
  /\ actorFence' = [actorFence EXCEPT ![a] = coordEpoch']
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      stopStatus, stopEpoch, safetyContext, currentness, currentnessEpoch,
      effectStatus, effectOperation, effectKey, effectTarget, effectContext,
      recoveryStatus, recoveryOwner, recoveryEpoch, admitted>>

RequestStop ==
  /\ stopStatus = "CLEAR"
  /\ stopStatus' = "BLOCKING"
  /\ stopEpoch' = stopEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, safetyContext, currentness, currentnessEpoch,
      effectStatus, effectOperation, effectKey, effectTarget, effectContext,
      recoveryStatus, recoveryOwner, recoveryEpoch, admitted>>

Revoke ==
  /\ authorityStatus = "VALID"
  /\ authorityStatus' = "REVOKED"
  /\ authorityEpoch' = authorityEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, coordOwner, coordEpoch, actorFence,
      stopStatus, stopEpoch, safetyContext, currentness, currentnessEpoch,
      effectStatus, effectOperation, effectKey, effectTarget, effectContext,
      recoveryStatus, recoveryOwner, recoveryEpoch, admitted>>

ActivateContext ==
  /\ safetyContext' = IF safetyContext = V1 THEN V2 ELSE V1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, currentness,
      currentnessEpoch, effectStatus, effectOperation, effectKey, effectTarget,
      effectContext, recoveryStatus, recoveryOwner, recoveryEpoch, admitted>>

LoseCurrentness ==
  /\ currentness' = "UNKNOWN"
  /\ currentnessEpoch' = currentnessEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      effectStatus, effectOperation, effectKey, effectTarget, effectContext,
      recoveryStatus, recoveryOwner, recoveryEpoch, admitted>>

RollbackIdentity ==
  /\ identityEpoch' = 0
  /\ authorityEpoch' = 0
  /\ coordEpoch' = 0
  /\ currentness' = "UNKNOWN"
  /\ currentnessEpoch' = currentnessEpoch + 1
  /\ UNCHANGED <<identityStatus, authorityStatus, coordOwner, actorFence,
      stopStatus, stopEpoch, safetyContext, effectStatus, effectOperation,
      effectKey, effectTarget, effectContext, recoveryStatus, recoveryOwner,
      recoveryEpoch, admitted>>

Decommission ==
  /\ identityStatus = "ACTIVE"
  /\ identityStatus' = "DECOMMISSIONED"
  /\ identityEpoch' = identityEpoch + 1
  /\ authorityStatus' = "REVOKED"
  /\ authorityEpoch' = authorityEpoch + 1
  /\ UNCHANGED <<coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch,
      safetyContext, currentness, currentnessEpoch, effectStatus,
      effectOperation, effectKey, effectTarget, effectContext, recoveryStatus,
      recoveryOwner, recoveryEpoch, admitted>>

Recover(a) ==
  /\ a \in Actors
  /\ recoveryStatus = "NONE"
  /\ recoveryStatus' = "QUARANTINED"
  /\ recoveryOwner' = a
  /\ recoveryEpoch' = recoveryEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, effectStatus, effectOperation, effectKey,
      effectTarget, effectContext, admitted>>

ReleaseRecovery(a) ==
  /\ a \in Actors
  /\ recoveryStatus = "QUARANTINED"
  /\ recoveryOwner = a
  /\ currentness = "VALID"
  /\ authorityStatus = "VALID"
  /\ identityStatus = "ACTIVE"
  /\ stopStatus = "CLEAR"
  /\ coordOwner = a
  /\ actorFence[a] = coordEpoch
  /\ recoveryStatus' = "RELEASED"
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, effectStatus, effectOperation, effectKey,
      effectTarget, effectContext, recoveryOwner, recoveryEpoch, admitted>>

Admit(a, o, t, c) ==
  /\ a \in Actors
  /\ o \in Effects
  /\ t \in Targets
  /\ c \in Contexts
  /\ identityStatus = "ACTIVE"
  /\ authorityStatus = "VALID"
  /\ stopStatus = "CLEAR"
  /\ currentness = "VALID"
  /\ safetyContext = c
  /\ coordOwner = a
  /\ actorFence[a] = coordEpoch
  /\ recoveryStatus # "QUARANTINED"
  /\ effectStatus = "NONE"
  /\ admitted' = TRUE
  /\ effectStatus' = "PENDING"
  /\ effectOperation' = o
  /\ effectKey' = o
  /\ effectTarget' = t
  /\ effectContext' = c
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, recoveryStatus, recoveryOwner, recoveryEpoch>>

MarkUnknown ==
  /\ effectStatus = "PENDING"
  /\ effectStatus' = "UNKNOWN"
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, effectOperation, effectKey, effectTarget,
      effectContext, recoveryStatus, recoveryOwner, recoveryEpoch, admitted>>

Next ==
  \/ \E a \in Actors : AcquireFence(a)
  \/ RequestStop
  \/ Revoke
  \/ ActivateContext
  \/ LoseCurrentness
  \/ RollbackIdentity
  \/ Decommission
  \/ \E a \in Actors : Recover(a)
  \/ \E a \in Actors : ReleaseRecovery(a)
  \/ \E a \in Actors, o \in Effects, t \in Targets, c \in Contexts :
       Admit(a, o, t, c)
  \/ MarkUnknown

Inv_NoUnauthorizedAdmission ==
  admitted =>
    /\ authorityStatus = "VALID"
    /\ identityStatus = "ACTIVE"
    /\ stopStatus = "CLEAR"
    /\ currentness = "VALID"
    /\ effectContext = safetyContext
    /\ coordOwner # None
    /\ actorFence[coordOwner] = coordEpoch

Inv_StopDominates == stopStatus = "BLOCKING" => ~admitted
Inv_NoResurrection == identityStatus = "DECOMMISSIONED" => authorityStatus = "REVOKED"
Inv_Currentness == admitted => currentness = "VALID"
Inv_ContextBinding == admitted => effectContext = safetyContext
Inv_EffectIdentityStable == admitted => effectOperation # None /\ effectKey = effectOperation

Safety ==
  /\ Inv_NoUnauthorizedAdmission
  /\ Inv_StopDominates
  /\ Inv_NoResurrection
  /\ Inv_Currentness
  /\ Inv_ContextBinding
  /\ Inv_EffectIdentityStable

Spec == Init /\ [][Next]_vars
=============================================================================
