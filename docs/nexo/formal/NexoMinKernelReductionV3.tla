------------------------------ MODULE NexoMinKernelReductionV3 ------------------------------
EXTENDS Naturals, FiniteSets

CONSTANTS A, B, V1, V2, T1, T2, O1, O2
Actors == {A, B}
Contexts == {V1, V2}
Targets == {T1, T2}
Effects == {O1, O2}
None == "NONE"

VARIABLES identityStatus, identityEpoch, authorityStatus, authorityEpoch,
  coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
  currentness, currentnessEpoch, admissionStatus, admissionActor, admissionFence,
  admissionAuthorityEpoch, admissionContext, admissionTarget, admissionOperation,
  admissionEffectKey, effectStatus, recoveryStatus, recoveryOwner, recoveryEpoch,
  unknownFloor, compactedThrough

vars == <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
  coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
  currentness, currentnessEpoch, admissionStatus, admissionActor,
  admissionFence, admissionAuthorityEpoch, admissionContext, admissionTarget,
  admissionOperation, admissionEffectKey, effectStatus, recoveryStatus,
  recoveryOwner, recoveryEpoch, unknownFloor, compactedThrough>>

Init ==
  /\ identityStatus = "ACTIVE" /\ identityEpoch = 0
  /\ authorityStatus = "VALID" /\ authorityEpoch = 0
  /\ coordOwner = None /\ coordEpoch = 0 /\ actorFence = [a \in Actors |-> 0]
  /\ stopStatus = "CLEAR" /\ stopEpoch = 0 /\ safetyContext = V1
  /\ currentness = "VALID" /\ currentnessEpoch = 0
  /\ admissionStatus = "NONE" /\ admissionActor = None /\ admissionFence = 0
  /\ admissionAuthorityEpoch = 0 /\ admissionContext = None /\ admissionTarget = None
  /\ admissionOperation = None /\ admissionEffectKey = None
  /\ effectStatus = "NONE" /\ recoveryStatus = "NONE"
  /\ recoveryOwner = None /\ recoveryEpoch = 0
  /\ unknownFloor = 0 /\ compactedThrough = 0

AcquireFence(a) ==
  /\ a \in Actors /\ coordEpoch' = coordEpoch + 1 /\ coordOwner' = a
  /\ actorFence' = [actorFence EXCEPT ![a] = coordEpoch']
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      stopStatus, stopEpoch, safetyContext, currentness, currentnessEpoch,
      admissionStatus, admissionActor, admissionFence, admissionAuthorityEpoch,
      admissionContext, admissionTarget, admissionOperation, admissionEffectKey,
      effectStatus, recoveryStatus, recoveryOwner, recoveryEpoch, unknownFloor,
      compactedThrough>>

RequestStop ==
  /\ stopStatus = "CLEAR" /\ stopStatus' = "BLOCKING" /\ stopEpoch' = stopEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, safetyContext, currentness,
      currentnessEpoch, admissionStatus, admissionActor, admissionFence,
      admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, effectStatus, recoveryStatus,
      recoveryOwner, recoveryEpoch, unknownFloor, compactedThrough>>

Revoke ==
  /\ authorityStatus = "VALID" /\ authorityStatus' = "REVOKED" /\ authorityEpoch' = authorityEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, coordOwner, coordEpoch, actorFence,
      stopStatus, stopEpoch, safetyContext, currentness, currentnessEpoch,
      admissionStatus, admissionActor, admissionFence, admissionAuthorityEpoch,
      admissionContext, admissionTarget, admissionOperation, admissionEffectKey,
      effectStatus, recoveryStatus, recoveryOwner, recoveryEpoch,
      unknownFloor, compactedThrough>>

ActivateContext ==
  /\ safetyContext' = IF safetyContext = V1 THEN V2 ELSE V1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, currentness,
      currentnessEpoch, admissionStatus, admissionActor, admissionFence,
      admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, effectStatus, recoveryStatus,
      recoveryOwner, recoveryEpoch, unknownFloor, compactedThrough>>

LoseCurrentness ==
  /\ currentness = "VALID" /\ currentness' = "UNKNOWN"
  /\ currentnessEpoch' = currentnessEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      admissionStatus, admissionActor, admissionFence, admissionAuthorityEpoch,
      admissionContext, admissionTarget, admissionOperation, admissionEffectKey,
      effectStatus, recoveryStatus, recoveryOwner, recoveryEpoch,
      unknownFloor, compactedThrough>>

Decommission ==
  /\ identityStatus = "ACTIVE" /\ identityStatus' = "DECOMMISSIONED"
  /\ identityEpoch' = identityEpoch + 1 /\ authorityStatus' = "REVOKED"
  /\ authorityEpoch' = authorityEpoch + 1
  /\ UNCHANGED <<coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch,
      safetyContext, currentness, currentnessEpoch, admissionStatus,
      admissionActor, admissionFence, admissionAuthorityEpoch, admissionContext,
      admissionTarget, admissionOperation, admissionEffectKey, effectStatus,
      recoveryStatus, recoveryOwner, recoveryEpoch, unknownFloor, compactedThrough>>

Recover(a) ==
  /\ a \in Actors /\ recoveryStatus = "NONE"
  /\ recoveryStatus' = "QUARANTINED" /\ recoveryOwner' = a
  /\ recoveryEpoch' = recoveryEpoch + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, admissionStatus, admissionActor,
      admissionFence, admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, effectStatus, unknownFloor,
      compactedThrough>>

ReleaseRecovery(a) ==
  /\ a \in Actors /\ recoveryStatus = "QUARANTINED" /\ recoveryOwner = a
  /\ currentness = "VALID" /\ authorityStatus = "VALID"
  /\ identityStatus = "ACTIVE" /\ stopStatus = "CLEAR"
  /\ coordOwner = a /\ actorFence[a] = coordEpoch
  /\ recoveryStatus' = "RELEASED"
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, admissionStatus, admissionActor,
      admissionFence, admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, effectStatus, recoveryOwner,
      recoveryEpoch, unknownFloor, compactedThrough>>

Admit(a,o,t,c) ==
  /\ a \in Actors /\ o \in Effects /\ t \in Targets /\ c \in Contexts
  /\ identityStatus = "ACTIVE" /\ authorityStatus = "VALID"
  /\ stopStatus = "CLEAR" /\ currentness = "VALID" /\ safetyContext = c
  /\ coordOwner = a /\ actorFence[a] = coordEpoch
  /\ recoveryStatus # "QUARANTINED" /\ admissionStatus = "NONE"
  /\ admissionStatus' = "COMMITTED" /\ admissionActor' = a
  /\ admissionFence' = coordEpoch /\ admissionAuthorityEpoch' = authorityEpoch
  /\ admissionContext' = c /\ admissionTarget' = t
  /\ admissionOperation' = o /\ admissionEffectKey' = o
  /\ effectStatus' = "PENDING"
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, recoveryStatus, recoveryOwner, recoveryEpoch,
      unknownFloor, compactedThrough>>

ExecutionEligible ==
  /\ admissionStatus = "COMMITTED" /\ identityStatus = "ACTIVE"
  /\ authorityStatus = "VALID" /\ stopStatus = "CLEAR"
  /\ currentness = "VALID" /\ safetyContext = admissionContext
  /\ coordOwner = admissionActor /\ actorFence[admissionActor] = coordEpoch
  /\ admissionFence = coordEpoch /\ admissionAuthorityEpoch = authorityEpoch
  /\ recoveryStatus # "QUARANTINED"

BeginExecution(a) ==
  /\ a = admissionActor /\ ExecutionEligible
  /\ admissionStatus' = "EXECUTING" /\ effectStatus' = "IN_FLIGHT"
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, admissionActor, admissionFence,
      admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, recoveryStatus, recoveryOwner,
      recoveryEpoch, unknownFloor, compactedThrough>>

MarkUnknown ==
  /\ effectStatus = "IN_FLIGHT" /\ effectStatus' = "UNKNOWN"
  /\ unknownFloor' = unknownFloor + 1
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, admissionStatus, admissionActor,
      admissionFence, admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, recoveryStatus, recoveryOwner,
      recoveryEpoch, compactedThrough>>

RetryUnknown ==
  /\ effectStatus = "UNKNOWN" /\ admissionStatus = "EXECUTING"
  /\ admissionOperation # None /\ effectStatus' = "UNKNOWN"
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, admissionStatus, admissionActor,
      admissionFence, admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, recoveryStatus, recoveryOwner,
      recoveryEpoch, unknownFloor, compactedThrough>>

Compact ==
  /\ unknownFloor = compactedThrough
  /\ compactedThrough' = compactedThrough
  /\ UNCHANGED <<identityStatus, identityEpoch, authorityStatus, authorityEpoch,
      coordOwner, coordEpoch, actorFence, stopStatus, stopEpoch, safetyContext,
      currentness, currentnessEpoch, admissionStatus, admissionActor,
      admissionFence, admissionAuthorityEpoch, admissionContext, admissionTarget,
      admissionOperation, admissionEffectKey, effectStatus, recoveryStatus,
      recoveryOwner, recoveryEpoch, unknownFloor>>

Next ==
  \/ \E a \in Actors : AcquireFence(a)
  \/ RequestStop
  \/ Revoke
  \/ ActivateContext
  \/ LoseCurrentness
  \/ Decommission
  \/ \E a \in Actors : Recover(a)
  \/ \E a \in Actors : ReleaseRecovery(a)
  \/ \E a \in Actors, o \in Effects, t \in Targets, c \in Contexts : Admit(a,o,t,c)
  \/ \E a \in Actors : BeginExecution(a)
  \/ MarkUnknown
  \/ RetryUnknown
  \/ Compact

Inv_EligibilitySafety ==
  ExecutionEligible =>
    /\ identityStatus = "ACTIVE" /\ authorityStatus = "VALID"
    /\ stopStatus = "CLEAR" /\ currentness = "VALID"
    /\ safetyContext = admissionContext /\ coordOwner = admissionActor
    /\ actorFence[admissionActor] = coordEpoch
    /\ admissionFence = coordEpoch /\ admissionAuthorityEpoch = authorityEpoch

Inv_StopBlocksExecution == stopStatus = "BLOCKING" => ~ExecutionEligible
Inv_RevokeBlocksExecution == authorityStatus = "REVOKED" => ~ExecutionEligible
Inv_CurrentnessBlocksExecution == currentness # "VALID" => ~ExecutionEligible

Inv_AdmissionBinding ==
  admissionStatus # "NONE" =>
    /\ admissionOperation # None /\ admissionEffectKey = admissionOperation
    /\ admissionContext # None /\ admissionTarget # None

Inv_UnknownIdentity ==
  effectStatus = "UNKNOWN" =>
    /\ admissionOperation # None /\ admissionEffectKey = admissionOperation

Inv_UnknownFloor == compactedThrough <= unknownFloor
Inv_NoResurrection == identityStatus = "DECOMMISSIONED" => authorityStatus = "REVOKED"

Safety ==
  /\ Inv_EligibilitySafety
  /\ Inv_StopBlocksExecution
  /\ Inv_RevokeBlocksExecution
  /\ Inv_CurrentnessBlocksExecution
  /\ Inv_AdmissionBinding
  /\ Inv_UnknownIdentity
  /\ Inv_UnknownFloor
  /\ Inv_NoResurrection

Spec == Init /\ [][Next]_vars
=============================================================================
