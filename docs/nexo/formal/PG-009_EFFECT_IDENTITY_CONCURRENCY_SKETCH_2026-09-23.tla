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


(* SPLIT-BRAIN / FENCED RECONCILIATION REFINEMENT
   A critical effect key has at most one active reconciliation owner at a time.
   Reconciliation ownership is separate from execution reservation.

   Let reconciliationEpoch[k] monotonically identify ownership generations and
   fenceToken[k] identify the currently valid owner. Any reconciliation commit
   must present the current token and epoch; a stale owner is rejected.

   A lease expiry creates eligibility for a successor but does not itself change
   worldState. The successor must acquire the new fence atomically, then perform
   a fresh observation. Previous observations remain historical evidence only.

   Critical retry is permitted only after the acceptance relation evaluates the
   reconciled state and the target's idempotency/reconciliation capability.

   This is a safety boundary, not a liveness guarantee: if ownership cannot be
   safely transferred or the external outcome cannot be reconciled, the system
   may remain UNKNOWN/BLOCKED rather than guessing.
*)


(* EVIDENCE SUFFICIENCY / FRESHNESS REFINEMENT
   A fresh observation is not automatically sufficient evidence of absence.
   Observation quality is modeled separately from freshness.

   Observation metadata must bind at least:
     target, observed state, observed_at/causal position, source identity,
     consistency level, visibility scope, query semantics, and verification method.

   For a retry decision, acceptance must establish that the observation can
   distinguish EFFECT_ABSENT from NOT_VISIBLE/UNKNOWN for the relevant effect
   class. If the target offers only eventual consistency, a recent ABSENT read
   may remain insufficient until a declared consistency/freshness boundary is met.

   Therefore:
     FRESH && ABSENT does not imply SAFE_TO_RETRY.
     SAFE_TO_RETRY requires an independent acceptance relation over observation
     sufficiency, target semantics, effect class, authority epoch, and current
     preconditions.

   A stale observation cannot authorize a critical retry. A fresh but insufficient
   observation also cannot authorize it. UNKNOWN remains UNKNOWN until evidence
   crosses the declared sufficiency boundary.
*)


(* WORLD-VERSION / TOCTOU REFINEMENT
   An observation is bound to a worldVersion or causal position when the target
   exposes one. Critical execution must carry the observed version as a
   precondition/fence. If the target reports a newer version, changed ETag,
   sequence, revision, or equivalent conflict marker, the prepared execution is
   invalidated and must revalidate.

   Freshness is therefore necessary but not sufficient:
     Fresh(obs) /\\ Sufficient(obs) /\\ VersionMatches(obs, precondition)
   are separate predicates.

   Required critical path:
     OBSERVE -> BIND_VERSION -> AUTHORIZE -> EXECUTE_IF_VERSION_MATCHES.

   If the target cannot expose a usable version/conditional-write boundary, Nexo
   must use a weaker target-specific safety class (for example idempotency-aware,
   reconciliation-only, at-most-once, or UNKNOWN/BLOCKED) rather than pretending
   it has compare-and-swap semantics.

   A successful execution receipt does not erase the need to verify the resulting
   world state when the target's receipt is not itself an independent world proof.
*)
