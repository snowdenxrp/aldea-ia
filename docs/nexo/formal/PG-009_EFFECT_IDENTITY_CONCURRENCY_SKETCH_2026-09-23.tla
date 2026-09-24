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
