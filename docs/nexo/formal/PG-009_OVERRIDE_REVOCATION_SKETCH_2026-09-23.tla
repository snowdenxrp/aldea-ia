---- MODULE PG009_OVERRIDE_REVOCATION_SKETCH_2026_09_23 ----
EXTENDS Naturals, TLC

CONSTANTS
  NoOp, OpA, OpB,
  Epoch0, Epoch1,
  EffectNone, EffectPresent,
  Unknown, LocalStopped, RemoteCancelled, Verified

VARIABLES
  authorityEpoch,
  revoked,
  opStatus,
  externalEffect,
  cancellationAck,
  worldVerified,
  operationId,
  effectKey

vars ==
  <<authorityEpoch, revoked, opStatus, externalEffect,
    cancellationAck, worldVerified, operationId, effectKey>>

Init ==
  /\ authorityEpoch = Epoch0
  /\ revoked = FALSE
  /\ opStatus = "PREPARED"
  /\ externalEffect = EffectNone
  /\ cancellationAck = FALSE
  /\ worldVerified = FALSE
  /\ operationId = OpA
  /\ effectKey = "EFFECT-A"

Revoke ==
  /\ revoked' = TRUE
  /\ authorityEpoch' = Epoch1
  /\ UNCHANGED <<opStatus, externalEffect, cancellationAck,
      worldVerified, operationId, effectKey>>

Dispatch ==
  /\ ~revoked
  /\ opStatus = "PREPARED"
  /\ opStatus' = "DISPATCHED"
  /\ UNCHANGED <<authorityEpoch, revoked, externalEffect,
      cancellationAck, worldVerified, operationId, effectKey>>

RemoteCommit ==
  /\ opStatus = "DISPATCHED"
  /\ externalEffect' = EffectPresent
  /\ opStatus' = "REMOTE_COMMITTED"
  /\ UNCHANGED <<authorityEpoch, revoked, cancellationAck,
      worldVerified, operationId, effectKey>>

LocalStop ==
  /\ opStatus \in {"PREPARED", "DISPATCHED", "REMOTE_COMMITTED"}
  /\ opStatus' = "LOCAL_STOPPED"
  /\ UNCHANGED <<authorityEpoch, revoked, externalEffect,
      cancellationAck, worldVerified, operationId, effectKey>>

RemoteCancelAck ==
  /\ opStatus = "LOCAL_STOPPED"
  /\ cancellationAck' = TRUE
  /\ opStatus' = "REMOTE_CANCEL_ACK"
  /\ UNCHANGED <<authorityEpoch, revoked, externalEffect,
      worldVerified, operationId, effectKey>>

VerifyWorld ==
  /\ opStatus \in {"LOCAL_STOPPED", "REMOTE_CANCEL_ACK", "REMOTE_COMMITTED"}
  /\ worldVerified' = TRUE
  /\ opStatus' =
        IF externalEffect = EffectPresent
        THEN "EFFECT_PRESENT_VERIFIED"
        ELSE "VERIFIED_TERMINATED"
  /\ UNCHANGED <<authorityEpoch, revoked, externalEffect,
      cancellationAck, operationId, effectKey>>

BlindRetry ==
  /\ FALSE
  /\ UNCHANGED vars

Next ==
  \/ Revoke
  \/ Dispatch
  \/ RemoteCommit
  \/ LocalStop
  \/ RemoteCancelAck
  \/ VerifyWorld
  \/ BlindRetry

NoDispatchAfterEffectiveRevoke ==
  revoked = TRUE => opStatus # "DISPATCHED"

UnknownBlocksBlindRetry ==
  ~(externalEffect = Unknown /\ opStatus = "DISPATCHED")

EffectHistoryImmutable ==
  externalEffect = EffectPresent => externalEffect' = EffectPresent \/ TRUE

====

NOTE:
This is an exploratory sketch, not a verified Nexo specification.
The current model deliberately exposes an important modeling task:
- Revoke and RemoteCommit can race.
- LocalStop does not prove externalEffect = EffectNone.
- Cancellation acknowledgement is distinct from world verification.
- A production model must include operation/effect identity, authority epochs,
  fencing tokens, UNKNOWN outcome, compensation as a fresh effect, and
  atomic/conditional commit semantics where supported.

The sketch is NOT TLC-VERIFIED.
