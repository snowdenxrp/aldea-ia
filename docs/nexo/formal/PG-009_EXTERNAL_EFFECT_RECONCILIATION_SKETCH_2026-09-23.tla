---- MODULE PG009_ExternalEffectReconciliation ----
EXTENDS Naturals, FiniteSets

CONSTANT Effects, OpIds, Targets

ASSUME Effects # {} /\ OpIds # {} /\ Targets # {}

VARIABLES
    status, operation, effectKey, target, attempt, receipt,
    worldObservation, ledger, authority, revocation, verified

vars ==
    <<status, operation, effectKey, target, attempt, receipt,
      worldObservation, ledger, authority, revocation, verified>>

Init ==
    /\ status = [e \in Effects |-> "NOT_STARTED"]
    /\ operation = [e \in Effects |-> CHOOSE o \in OpIds : TRUE]
    /\ effectKey = [e \in Effects |-> e]
    /\ target = [e \in Effects |-> CHOOSE t \in Targets : TRUE]
    /\ attempt = [e \in Effects |-> 0]
    /\ receipt = [e \in Effects |-> FALSE]
    /\ worldObservation = [e \in Effects |-> "UNKNOWN"]
    /\ ledger = [e \in Effects |-> FALSE]
    /\ authority = [e \in Effects |-> TRUE]
    /\ revocation = [e \in Effects |-> FALSE]
    /\ verified = [e \in Effects |-> FALSE]

Prepare(e) ==
    /\ e \in Effects /\ status[e] = "NOT_STARTED"
    /\ authority[e] /\ ~revocation[e]
    /\ status' = [status EXCEPT ![e] = "PREPARED"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

Send(e) ==
    /\ e \in Effects /\ status[e] = "PREPARED"
    /\ authority[e] /\ ~revocation[e]
    /\ status' = [status EXCEPT ![e] = "SENT"]
    /\ attempt' = [attempt EXCEPT ![e] = @ + 1]
    /\ UNCHANGED <<operation, effectKey, target, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

RemoteUnknown(e) ==
    /\ e \in Effects /\ status[e] = "SENT"
    /\ status' = [status EXCEPT ![e] = "REMOTE_UNKNOWN"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

RemoteConfirm(e) ==
    /\ e \in Effects /\ status[e] \in {"SENT", "REMOTE_UNKNOWN"}
    /\ status' = [status EXCEPT ![e] = "REMOTE_CONFIRMED"]
    /\ receipt' = [receipt EXCEPT ![e] = TRUE]
    /\ UNCHANGED <<operation, effectKey, target, attempt,
                    worldObservation, ledger, authority, revocation, verified>>

BeginVerification(e) ==
    /\ e \in Effects
    /\ status[e] \in {"REMOTE_CONFIRMED", "REMOTE_UNKNOWN"}
    /\ status' = [status EXCEPT ![e] = "VERIFICATION_PENDING"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

ObservePresent(e) ==
    /\ e \in Effects /\ status[e] = "VERIFICATION_PENDING"
    /\ worldObservation' = [worldObservation EXCEPT ![e] = "PRESENT"]
    /\ UNCHANGED <<status, operation, effectKey, target, attempt, receipt,
                    ledger, authority, revocation, verified>>

ObserveAbsent(e) ==
    /\ e \in Effects /\ status[e] = "VERIFICATION_PENDING"
    /\ worldObservation' = [worldObservation EXCEPT ![e] = "ABSENT"]
    /\ UNCHANGED <<status, operation, effectKey, target, attempt, receipt,
                    ledger, authority, revocation, verified>>

CommitVerified(e) ==
    /\ e \in Effects
    /\ status[e] = "VERIFICATION_PENDING"
    /\ worldObservation[e] = "PRESENT"
    /\ status' = [status EXCEPT ![e] = "VERIFIED"]
    /\ verified' = [verified EXCEPT ![e] = TRUE]
    /\ ledger' = [ledger EXCEPT ![e] = TRUE]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, authority, revocation>>

CrashBeforeLedger(e) ==
    /\ e \in Effects
    /\ status[e] \in {"SENT", "REMOTE_CONFIRMED", "VERIFICATION_PENDING"}
    /\ ledger[e] = FALSE
    /\ status' = [status EXCEPT ![e] = "REMOTE_UNKNOWN"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

RecoverUnknown(e) ==
    /\ e \in Effects /\ status[e] = "REMOTE_UNKNOWN"
    /\ status' = [status EXCEPT ![e] = "RECONCILIATION_REQUIRED"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

ReconcilePresent(e) ==
    /\ e \in Effects
    /\ status[e] = "RECONCILIATION_REQUIRED"
    /\ worldObservation[e] = "PRESENT"
    /\ status' = [status EXCEPT ![e] = "VERIFICATION_PENDING"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

ReconcileAbsent(e) ==
    /\ e \in Effects
    /\ status[e] = "RECONCILIATION_REQUIRED"
    /\ worldObservation[e] = "ABSENT"
    /\ status' = [status EXCEPT ![e] = "PREPARED"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

RetryBlocked(e) ==
    /\ e \in Effects /\ status[e] = "REMOTE_UNKNOWN"
    /\ status' = [status EXCEPT ![e] = "BLOCKED"]
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, authority, revocation, verified>>

Revoke(e) ==
    /\ e \in Effects
    /\ revocation' = [revocation EXCEPT ![e] = TRUE]
    /\ authority' = [authority EXCEPT ![e] = FALSE]
    /\ IF status[e] \in {"NOT_STARTED", "PREPARED", "REMOTE_UNKNOWN",
                         "RECONCILIATION_REQUIRED"}
       THEN status' = [status EXCEPT ![e] = "BLOCKED"]
       ELSE UNCHANGED status
    /\ UNCHANGED <<operation, effectKey, target, attempt, receipt,
                    worldObservation, ledger, verified>>

Next ==
    \/ \E e \in Effects : Prepare(e)
    \/ \E e \in Effects : Send(e)
    \/ \E e \in Effects : RemoteUnknown(e)
    \/ \E e \in Effects : RemoteConfirm(e)
    \/ \E e \in Effects : BeginVerification(e)
    \/ \E e \in Effects : ObservePresent(e)
    \/ \E e \in Effects : ObserveAbsent(e)
    \/ \E e \in Effects : CommitVerified(e)
    \/ \E e \in Effects : CrashBeforeLedger(e)
    \/ \E e \in Effects : RecoverUnknown(e)
    \/ \E e \in Effects : ReconcilePresent(e)
    \/ \E e \in Effects : ReconcileAbsent(e)
    \/ \E e \in Effects : RetryBlocked(e)
    \/ \E e \in Effects : Revoke(e)

Spec == Init /\ [][Next]_vars

InvUnknownBlocksBlindRetry ==
    \A e \in Effects : status[e] = "REMOTE_UNKNOWN" => ~verified[e]

InvReceiptNotWorldTruth ==
    \A e \in Effects :
        receipt[e] = TRUE /\ worldObservation[e] # "PRESENT"
        => ~verified[e]

InvVerifiedRequiresObservation ==
    \A e \in Effects :
        verified[e] =>
            /\ status[e] = "VERIFIED"
            /\ worldObservation[e] = "PRESENT"
            /\ ledger[e] = TRUE

InvRevocationBlocksUnstarted ==
    \A e \in Effects : revocation[e] => authority[e] = FALSE

InvStableIdentity ==
    \A e \in Effects :
        effectKey[e] = e /\ operation[e] \in OpIds

THEOREM Spec => []InvUnknownBlocksBlindRetry
THEOREM Spec => []InvReceiptNotWorldTruth
THEOREM Spec => []InvVerifiedRequiresObservation
THEOREM Spec => []InvRevocationBlocksUnstarted
THEOREM Spec => []InvStableIdentity

(***********************************************************
Next refinement: this is intentionally a single-effect sketch.
It is NOT the final semantic-deduplication model until concurrent
operations, legitimate repeats, semantic collisions and stale
observations are modeled and TLC-checked.
***********************************************************)
====
