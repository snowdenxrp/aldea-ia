---------------- MODULE NEXO_CANONICAL_CORE_V3 ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS Operations, Effects, Targets, Owners, EvidenceIds, Dependencies

OpStates == {"PROPOSED","ADMITTED","AUTHORIZED","EXECUTING","EXTERNAL_UNKNOWN",
             "PARTIALLY_APPLIED","APPLIED","OBSERVED","RECONCILED","VERIFIED",
             "COMMITTED","QUARANTINED","STOPPED"}
EvidenceStates == {"OBSERVED","VALID","STALE","INVALIDATED"}
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
DepStates == {"KNOWN","UNKNOWN","COMPROMISED","STALE","INVALIDATED"}

VARIABLES opState, effectBinding, authority, evidence,
          executionOwner, executionGeneration,
          recoveryOwner, recoveryGeneration, recoveryLease,
          reconciliationOwner, reconciliationGeneration, reconciliationLease,
          dependencyState, policyVersion, dependencyGraphVersion,
          authorityEpoch, stopEpoch, stopActive, releaseNonce, commitNonce

vars == <<opState,effectBinding,authority,evidence,executionOwner,
 executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
 reconciliationOwner,reconciliationGeneration,reconciliationLease,
 dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
 stopEpoch,stopActive,releaseNonce,commitNonce>>

ExactBinding(o,e) ==
  e.operation = o /\
  e.effect = effectBinding[o].effect /\
  e.target = effectBinding[o].target /\
  e.targetFingerprint = effectBinding[o].targetFingerprint

EvidenceCurrent(o,e) ==
  e.state = "VALID" /\ ExactBinding(o,e) /\
  e.authorityEpoch = authority[o].epoch /\
  e.policyVersion = policyVersion /\
  e.dependencyGraphVersion = dependencyGraphVersion /\
  e.fresh = TRUE /\ e.provenanceValid = TRUE

DependenciesAdmissible(o) ==
  \A d \in effectBinding[o].requiredDependencies:
    dependencyState[d] = "KNOWN"

ReleaseEligible(o) ==
  opState[o] = "VERIFIED" /\
  authority[o].valid /\
  authority[o].epoch = authorityEpoch /\
  authority[o].stopEpoch = stopEpoch /\
  ~stopActive /\
  recoveryLease[o] = "HELD" /\
  reconciliationLease[o] = "FREE" /\
  \E e \in EvidenceIds: EvidenceCurrent(o,e) /\
  DependenciesAdmissible(o)

AcquireRecovery(o,owner) ==
  o \in Operations /\ owner \in Owners /\
  recoveryLease[o] # "HELD" /\
  reconciliationLease[o] # "HELD" /\
  recoveryGeneration' = recoveryGeneration + 1 /\
  recoveryOwner' = [recoveryOwner EXCEPT ![o] = owner] /\
  recoveryLease' = [recoveryLease EXCEPT ![o] = "HELD"] /\
  UNCHANGED <<opState,effectBinding,authority,evidence,executionOwner,
    executionGeneration,reconciliationOwner,reconciliationGeneration,
    reconciliationLease,dependencyState,policyVersion,dependencyGraphVersion,
    authorityEpoch,stopEpoch,stopActive,releaseNonce,commitNonce>>

ExpireRecovery(o) ==
  recoveryLease[o] = "HELD" /\
  recoveryLease' = [recoveryLease EXCEPT ![o] = "EXPIRED"] /\
  recoveryOwner' = [recoveryOwner EXCEPT ![o] = NULL] /\
  UNCHANGED <<opState,effectBinding,authority,evidence,executionOwner,
    executionGeneration,recoveryGeneration,reconciliationOwner,
    reconciliationGeneration,reconciliationLease,dependencyState,
    policyVersion,dependencyGraphVersion,authorityEpoch,stopEpoch,
    stopActive,releaseNonce,commitNonce>>

AcquireReconciliation(o,owner) ==
  o \in Operations /\ owner \in Owners /\
  reconciliationLease[o] # "HELD" /\
  recoveryLease[o] # "HELD" /\
  reconciliationGeneration' = reconciliationGeneration + 1 /\
  reconciliationOwner' = [reconciliationOwner EXCEPT ![o] = owner] /\
  reconciliationLease' = [reconciliationLease EXCEPT ![o] = "HELD"] /\
  UNCHANGED <<opState,effectBinding,authority,evidence,executionOwner,
    executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
    dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
    stopEpoch,stopActive,releaseNonce,commitNonce>>

RecordObservation(o,eid,owner,generation) ==
  reconciliationLease[o] = "HELD" /\
  reconciliationOwner[o] = owner /\
  reconciliationGeneration = generation /\
  ExactBinding(o,evidenceTemplate[eid]) /\
  evidence' = [evidence EXCEPT ![eid] = [
    state |-> "OBSERVED", operation |-> o,
    effect |-> effectBinding[o].effect,
    target |-> effectBinding[o].target,
    targetFingerprint |-> effectBinding[o].targetFingerprint,
    authorityEpoch |-> authority[o].epoch,
    policyVersion |-> policyVersion,
    dependencyGraphVersion |-> dependencyGraphVersion,
    fresh |-> TRUE, provenanceValid |-> TRUE]] /\
  UNCHANGED <<opState,effectBinding,authority,executionOwner,
    executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
    reconciliationOwner,reconciliationGeneration,reconciliationLease,
    dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
    stopEpoch,stopActive,releaseNonce,commitNonce>>

VerifyEvidence(o,eid) ==
  evidence[eid].state = "OBSERVED" /\
  ExactBinding(o,evidence[eid]) /\
  evidence[eid].authorityEpoch = authority[o].epoch /\
  evidence[eid].policyVersion = policyVersion /\
  evidence[eid].dependencyGraphVersion = dependencyGraphVersion /\
  evidence' = [evidence EXCEPT ![eid].state = "VALID"] /\
  UNCHANGED <<opState,effectBinding,authority,executionOwner,
    executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
    reconciliationOwner,reconciliationGeneration,reconciliationLease,
    dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
    stopEpoch,stopActive,releaseNonce,commitNonce>>

InvalidateEvidenceForVersion(o) ==
  \E e \in EvidenceIds:
    e.operation = o /\
    (e.policyVersion # policyVersion \/
     e.dependencyGraphVersion # dependencyGraphVersion \/
     e.authorityEpoch # authority[o].epoch) /\
  evidence' = [evidence EXCEPT ![e].state =
    IF @.operation = o /\
       (@.policyVersion # policyVersion \/
        @.dependencyGraphVersion # dependencyGraphVersion \/
        @.authorityEpoch # authority[o].epoch)
    THEN "INVALIDATED" ELSE @] /\
  UNCHANGED <<opState,effectBinding,authority,executionOwner,
    executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
    reconciliationOwner,reconciliationGeneration,reconciliationLease,
    dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
    stopEpoch,stopActive,releaseNonce,commitNonce>>

RequestStop ==
  stopActive' = TRUE /\
  stopEpoch' = stopEpoch + 1 /\
  UNCHANGED <<opState,effectBinding,authority,evidence,executionOwner,
    executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
    reconciliationOwner,reconciliationGeneration,reconciliationLease,
    dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
    releaseNonce,commitNonce>>

RevokeAuthority(o) ==
  authority[o].valid /\
  authority' = [authority EXCEPT ![o].valid = FALSE] /\
  authorityEpoch' = authorityEpoch + 1 /\
  recoveryLease' = [recoveryLease EXCEPT ![o] = "REVOKED"] /\
  recoveryOwner' = [recoveryOwner EXCEPT ![o] = NULL] /\
  reconciliationLease' = [reconciliationLease EXCEPT ![o] = "REVOKED"] /\
  reconciliationOwner' = [reconciliationOwner EXCEPT ![o] = NULL] /\
  UNCHANGED <<opState,effectBinding,evidence,executionOwner,
    executionGeneration,recoveryGeneration,dependencyState,policyVersion,
    dependencyGraphVersion,stopEpoch,stopActive,releaseNonce,commitNonce>>

AuthorizeRelease(o) ==
  ReleaseEligible(o) /\
  releaseNonce' = releaseNonce + 1 /\
  UNCHANGED <<opState,effectBinding,authority,evidence,executionOwner,
    executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
    reconciliationOwner,reconciliationGeneration,reconciliationLease,
    dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
    stopEpoch,stopActive,commitNonce>>

Commit(o) ==
  ReleaseEligible(o) /\
  opState' = [opState EXCEPT ![o] = "COMMITTED"] /\
  commitNonce' = commitNonce + 1 /\
  UNCHANGED <<effectBinding,authority,evidence,executionOwner,
    executionGeneration,recoveryOwner,recoveryGeneration,recoveryLease,
    reconciliationOwner,reconciliationGeneration,reconciliationLease,
    dependencyState,policyVersion,dependencyGraphVersion,authorityEpoch,
    stopEpoch,stopActive,releaseNonce>>

TypeOK ==
  /\ opState \in [Operations -> OpStates]
  /\ recoveryLease \in [Operations -> LeaseStates]
  /\ reconciliationLease \in [Operations -> LeaseStates]
  /\ dependencyState \in [Dependencies -> DepStates]
  /\ authorityEpoch \in Nat /\ stopEpoch \in Nat
  /\ recoveryGeneration \in Nat /\ reconciliationGeneration \in Nat
  /\ stopActive \in BOOLEAN

THEOREM TypeOK => TypeOK
=============================================================================