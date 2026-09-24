---------------- MODULE NEXO_CANONICAL_CORE_V2_SKETCH_2026_09_23 ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS Operations, Effects, Targets, Owners, EvidenceIds, Dependencies

OpStates == {"PROPOSED","ADMITTED","AUTHORIZED","EXECUTING","UNKNOWN","RECONCILED","VERIFIED","COMMITTED","QUARANTINED","STOPPED"}
EvidenceStates == {"ABSENT","OBSERVED","VALID","STALE","INVALIDATED"}
LeaseKinds == {"NONE","EXECUTION","RECOVERY","RECONCILIATION"}
DepStates == {"KNOWN","UNKNOWN","COMPROMISED","STALE","INVALIDATED"}

VARIABLES opState, effectBinding, authority, evidence, executionLease,
          recoveryLease, reconciliationLease, dependencyState,
          policyVersion, dependencyGraphVersion, authorityEpoch,
          stopEpoch, recoveryGeneration, reconciliationGeneration

vars == <<opState,effectBinding,authority,evidence,executionLease,
           recoveryLease,reconciliationLease,dependencyState,policyVersion,
           dependencyGraphVersion,authorityEpoch,stopEpoch,
           recoveryGeneration,reconciliationGeneration>>

(*
  Design rule:
  - leases represent coordination ownership;
  - evidence represents claims about observed external state;
  - authority represents current permission;
  - release is derived, never durable authority by itself.
*)

ExactBinding(o,e) ==
  e.operation = o /  e.effect = effectBinding[o].effect /  e.target = effectBinding[o].target /  e.targetFingerprint = effectBinding[o].targetFingerprint

CurrentEvidence(e,o) ==
  e.state = "VALID" /  ExactBinding(o,e) /  e.authorityEpoch = authority[o].epoch /  e.policyVersion = policyVersion /  e.dependencyGraphVersion = dependencyGraphVersion /  e.fresh = TRUE /  e.provenanceValid = TRUE

DependenciesAdmissible(o) ==
  A d in effectBinding[o].requiredDependencies:
    dependencyState[d] = "KNOWN"

ReleaseEligible(o) ==
  / opState[o] = "VERIFIED"
  / authority[o].valid = TRUE
  / authority[o].epoch = authorityEpoch
  / authority[o].stopEpoch = stopEpoch
  / E e in EvidenceIds: CurrentEvidence(e,o)
  / DependenciesAdmissible(o)

Init ==
  / opState = [o in Operations |-> "PROPOSED"]
  / authorityEpoch = 0
  / stopEpoch = 0
  / recoveryGeneration = 0
  / reconciliationGeneration = 0
  / executionLease = [o in Operations |-> [kind |-> "NONE", valid |-> FALSE, owner |-> NULL, generation |-> 0]]
  / recoveryLease = [o in Operations |-> [kind |-> "NONE", valid |-> FALSE, owner |-> NULL, generation |-> 0]]
  / reconciliationLease = [o in Operations |-> [kind |-> "NONE", valid |-> FALSE, owner |-> NULL, generation |-> 0]]
  / UNCHANGED <<effectBinding,authority,evidence,dependencyState,
                 policyVersion,dependencyGraphVersion>>

AcquireRecovery(o,owner) ==
  / o in Operations / owner in Owners
  / recoveryLease[o].valid = FALSE
  / reconciliationLease[o].valid = FALSE
  / recoveryGeneration' = recoveryGeneration + 1
  / recoveryLease' = [recoveryLease EXCEPT ![o] = [
       kind |-> "RECOVERY", valid |-> TRUE, owner |-> owner,
       generation |-> @.generation + 1]]
  / UNCHANGED <<opState,effectBinding,authority,evidence,executionLease,
                 reconciliationLease,dependencyState,policyVersion,
                 dependencyGraphVersion,authorityEpoch,stopEpoch,
                 reconciliationGeneration>>

AcquireReconciliation(o,owner) ==
  / o in Operations / owner in Owners
  / reconciliationLease[o].valid = FALSE
  / recoveryLease[o].valid = FALSE
  / reconciliationGeneration' = reconciliationGeneration + 1
  / reconciliationLease' = [reconciliationLease EXCEPT ![o] = [
       kind |-> "RECONCILIATION", valid |-> TRUE, owner |-> owner,
       generation |-> @.generation + 1]]
  / UNCHANGED <<opState,effectBinding,authority,evidence,executionLease,
                 recoveryLease,dependencyState,policyVersion,
                 dependencyGraphVersion,authorityEpoch,stopEpoch,
                 recoveryGeneration>>

RecordObservation(o,eid,owner,generation) ==
  / reconciliationLease[o].valid
  / reconciliationLease[o].owner = owner
  / reconciliationLease[o].generation = generation
  / ExactBinding(o,evidenceTemplate[eid])
  / evidence' = [evidence EXCEPT ![eid] = [
       state |-> "OBSERVED", operation |-> o,
       effect |-> effectBinding[o].effect,
       target |-> effectBinding[o].target,
       targetFingerprint |-> effectBinding[o].targetFingerprint,
       authorityEpoch |-> authority[o].epoch,
       policyVersion |-> policyVersion,
       dependencyGraphVersion |-> dependencyGraphVersion,
       fresh |-> TRUE, provenanceValid |-> TRUE]]
  / UNCHANGED <<opState,effectBinding,authority,executionLease,
                 recoveryLease,reconciliationLease,dependencyState,
                 policyVersion,dependencyGraphVersion,authorityEpoch,
                 stopEpoch,recoveryGeneration,reconciliationGeneration>>

VerifyEvidence(o,eid) ==
  / evidence[eid].state = "OBSERVED"
  / ExactBinding(o,evidence[eid])
  / evidence[eid].authorityEpoch = authority[o].epoch
  / evidence[eid].policyVersion = policyVersion
  / evidence[eid].dependencyGraphVersion = dependencyGraphVersion
  / evidence' = [evidence EXCEPT ![eid].state = "VALID"]
  / UNCHANGED <<opState,effectBinding,authority,executionLease,
                 recoveryLease,reconciliationLease,dependencyState,
                 policyVersion,dependencyGraphVersion,authorityEpoch,
                 stopEpoch,recoveryGeneration,reconciliationGeneration>>

ExpireReconciliation(o) ==
  / reconciliationLease[o].valid
  / reconciliationLease' = [reconciliationLease EXCEPT ![o].valid = FALSE, ![o].owner = NULL]
  / UNCHANGED <<opState,effectBinding,authority,evidence,executionLease,
                 recoveryLease,dependencyState,policyVersion,
                 dependencyGraphVersion,authorityEpoch,stopEpoch,
                 recoveryGeneration,reconciliationGeneration>>

InvalidateOnMaterialVersionChange ==
  / UNCHANGED <<opState,effectBinding,authority,evidence,executionLease,
                 recoveryLease,reconciliationLease,dependencyState,
                 policyVersion,dependencyGraphVersion,authorityEpoch,
                 stopEpoch,recoveryGeneration,reconciliationGeneration>>

TypeOK ==
  / opState in [Operations -> OpStates]
  / dependencyState in [Dependencies -> DepStates]
  / authorityEpoch in Nat / stopEpoch in Nat
  / recoveryGeneration in Nat / reconciliationGeneration in Nat

THEOREM TypeOK => TypeOK
=============================================================================