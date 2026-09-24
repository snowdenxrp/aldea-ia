---- MODULE PG009_EffectIdentity_Concurrency_Sketch ----
EXTENDS Naturals, FiniteSets

CONSTANT Operations, Effects, Targets

ASSUME Operations # {} /\ Effects # {} /\ Targets # {}

VARIABLES
  opStatus, opId, effectKey, target, effectClass,
  effectState, worldState, authority, revocation,
  ledger, observations, owner

vars == <<opStatus, opId, effectKey, target, effectClass,
           effectState, worldState, authority, revocation,
           ledger, observations, owner>>

EffectStates ==
  {"NEW","PREPARED","IN_FLIGHT","UNKNOWN","RECONCILING",
   "PRESENT","ABSENT","VERIFIED","BLOCKED","CONFLICT"}

Classifications ==
  {"SAME_OPERATION_REPLAY","SAME_EFFECT_LEGITIMATE_REPEAT",
   "EFFECT_COLLISION","SEMANTICALLY_DIFFERENT","UNKNOWN"}

Init ==
  /\ opStatus = [o in Operations |-> "NEW"]
  /\ opId = [o in Operations |-> o]
  /\ effectKey = [o in Operations |-> CHOOSE e in Effects : TRUE]
  /\ target = [o in Operations |-> CHOOSE t in Targets : TRUE]
  /\ effectClass = [o in Operations |-> "CRITICAL"]
  /\ effectState = [o in Operations |-> "NEW"]
  /\ worldState = [o in Operations |-> "UNKNOWN"]
  /\ authority = [o in Operations |-> TRUE]
  /\ revocation = [o in Operations |-> FALSE]
  /\ ledger = [o in Operations |-> FALSE]
  /\ observations = [o in Operations |-> "NONE"]
  /\ owner = [o in Operations |-> "UNCLASSIFIED"]

Prepare(o) ==
  /\ opStatus[o] = "NEW"
  /\ authority[o] /\ ~revocation[o]
  /\ effectState' = [effectState EXCEPT ![o] = "PREPARED"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

Dispatch(o) ==
  /\ effectState[o] = "PREPARED"
  /\ authority[o] /\ ~revocation[o]
  /\ effectState' = [effectState EXCEPT ![o] = "IN_FLIGHT"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

LoseOutcome(o) ==
  /\ effectState[o] = "IN_FLIGHT"
  /\ effectState' = [effectState EXCEPT ![o] = "UNKNOWN"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

Observe(o,s) ==
  /\ effectState[o] \\in {"UNKNOWN","RECONCILING","IN_FLIGHT"}
  /\ s \\in {"PRESENT","ABSENT","UNKNOWN"}
  /\ worldState' = [worldState EXCEPT ![o] = s]
  /\ observations' = [observations EXCEPT ![o] = "FRESH"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    effectState,authority,revocation,ledger,owner>>

ClassifySameOperation(a,b) ==
  /\ a # b
  /\ opId[a] = opId[b]
  /\ owner' = [owner EXCEPT ![b] = "SAME_OPERATION_REPLAY"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    effectState,worldState,authority,revocation,ledger,observations>>

ClassifySameEffect(a,b) ==
  /\ a # b
  /\ effectKey[a] = effectKey[b]
  /\ target[a] = target[b]
  /\ owner' = [owner EXCEPT ![b] = "EFFECT_COLLISION"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    effectState,worldState,authority,revocation,ledger,observations>>

PermitLegitimateRepeat(o) ==
  /\ owner[o] = "SAME_EFFECT_LEGITIMATE_REPEAT"
  /\ effectClass[o] # "FORBID_REPEAT"
  /\ effectState' = [effectState EXCEPT ![o] = "PREPARED"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

BlockCollision(o) ==
  /\ owner[o] = "EFFECT_COLLISION"
  /\ effectState' = [effectState EXCEPT ![o] = "BLOCKED"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

Verify(o) ==
  /\ effectState[o] \\in {"RECONCILING","PRESENT"}
  /\ worldState[o] = "PRESENT"
  /\ effectState' = [effectState EXCEPT ![o] = "VERIFIED"]
  /\ ledger' = [ledger EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,observations,owner>>

Revoke(o) ==
  /\ revocation' = [revocation EXCEPT ![o] = TRUE]
  /\ authority' = [authority EXCEPT ![o] = FALSE]
  /\ IF effectState[o] \\in {"NEW","PREPARED","UNKNOWN","RECONCILING"}
       THEN effectState' = [effectState EXCEPT ![o] = "BLOCKED"]
       ELSE UNCHANGED effectState
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,ledger,observations,owner>>

InvUnknownNoBlindRetry ==
  \\A o \\in Operations :
    effectState[o] = "UNKNOWN" => effectState[o] # "PREPARED"

InvVerifiedNeedsWorldEvidence ==
  \\A o \\in Operations :
    effectState[o] = "VERIFIED" =>
      /\ worldState[o] = "PRESENT" /\ ledger[o]

InvRevocationRemovesAuthority ==
  \\A o \\in Operations : revocation[o] => ~authority[o]

InvIdentityStable ==
  \\A o \\in Operations : opId[o] = o

InvCollisionNotImplicitlyIndependent ==
  \\A a,b \\in Operations :
    (a # b /\ effectKey[a] = effectKey[b] /\ target[a] = target[b])
      => owner[a] # "UNCLASSIFIED" \\/ owner[b] # "UNCLASSIFIED"

InvReceiptNotWorldTruth ==
  \\A o \\in Operations :
    effectState[o] = "VERIFIED" => worldState[o] = "PRESENT"

====

(* REFINEMENT NOTES
   This sketch intentionally does not claim atomic uniqueness yet.
   Required next-state refinement:
   1. represent an atomic reservation/ownership record per effect_key;
   2. make acquisition a single transition, not check-then-set;
   3. distinguish SAME_OPERATION_REPLAY from EFFECT_COLLISION;
   4. permit SAME_EFFECT_LEGITIMATE_REPEAT only under explicit policy;
   5. stale observations cannot authorize a new irreversible attempt;
   6. authority/revocation changes invalidate uncommitted reservations;
   7. crash after external effect but before ledger commit enters UNKNOWN/reconciliation.
*)


(* ATOMIC RESERVATION REFINEMENT
   reservationKey[o] is the authoritative reservation identity.
   reservationOwner[k] is either NONE or the operation owning k.
   Claim(k,o) must be modeled as one atomic transition: it succeeds only if
   reservationOwner[k] = NONE, otherwise it returns CONFLICT/REPLAY according
   to the independent acceptance relation. A read followed by a write is not
   an implementation of Claim.

   Authority epoch is part of the reservation context. A reservation created
   under epoch E cannot silently authorize execution under E+1. Revocation or
   epoch change invalidates an uncommitted reservation and requires revalidation.

   External execution remains outside this local atomic boundary. Therefore:
   reservation acquired + external result unknown = RECONCILING/UNKNOWN,
   never ABSENT merely because the local completion record is missing.
*)


(* LEASE/CRASH REFINEMENT
   A reservation lease is coordination state, not evidence that the external effect
   did or did not occur. Expiry permits a new reconciliation decision, not automatic
   execution. A successor must first classify the predecessor as NO_ATTEMPT,
   EFFECT_CONFIRMED, EFFECT_ABSENT, or UNKNOWN.

   If UNKNOWN, a new irreversible execution is forbidden unless the target protocol
   supplies a safe idempotency/reconciliation guarantee or an explicit authority
   transition permits a bounded at-most-once strategy. Otherwise remain in
   RECONCILING/UNKNOWN.

   A lease expiration never erases operation_id, effect_key, attempt history, or
   authority epoch. Historical identity survives lease turnover.

   Revocation or epoch change blocks the old owner from executing, but does not
   imply that an already-dispatched external effect was cancelled. Recovery must
   reconcile the external world independently.
*)


(* RECONCILIATION-LEASE REFINEMENT
   ReservationLease and ReconciliationLease are distinct coordination objects.
   A reservation controls admission to a new external attempt; a reconciliation
   lease controls who may investigate an already-uncertain attempt.

   ReconcileClaim(effectKey, reconciler, epoch, lease) must be atomic. At most
   one active reconciler may own a critical effect key at a given reconciliation
   epoch. A second reconciler must observe ACTIVE_RECONCILIATION and not perform
   a competing irreversible retry.

   Reconciliation lease expiry does not imply effect absence. A successor first
   acquires reconciliation ownership, preserves the predecessor attempt history,
   and re-reads the external world using a fresh observation boundary.

   A stale reconciler cannot commit a new world fact after ownership changes.
   Commit of reconciliation evidence must bind effectKey + reconciliationEpoch
   + owner/fencing token + observation freshness/version.

   This prevents split-brain recovery: two recoverers cannot both conclude that
   UNKNOWN means ABSENT and independently trigger the same irreversible effect.
*)
