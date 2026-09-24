---------------- MODULE NEXO_CANONICAL_CORE_V4 ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS Operations, Effects, Targets, Owners, EvidenceIds, Dependencies, AuthorityDomains

OpStates == {"PROPOSED","ADMITTED","AUTHORIZED","EXECUTING","EXTERNAL_UNKNOWN",
"PARTIALLY_APPLIED","APPLIED","RECONCILED","VERIFIED","COMMITTED","QUARANTINED","STOPPED"}
EffectStates == {"UNSEEN","REQUESTED","UNKNOWN","PARTIAL","APPLIED","REVERSED","CANCELLED"}
EvidenceStates == {"OBSERVED","VALID","STALE","INVALIDATED"}
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
StopStates == {"NORMAL","REQUESTED","ENFORCING","VERIFIED"}
DepStates == {"KNOWN","UNKNOWN","COMPROMISED","STALE","INVALIDATED"}

VARIABLES opState,effectBinding,effectState,authority,evidence,
executionLease,recoveryLease,reconciliationLease,
dependencyState,policyVersion,dependencyGraphVersion,
authorityEpoch,stopState,stopEpoch,
recoveryGeneration,reconciliationGeneration,now,
releaseAuthorization,commitNonce

vars == <<opState,effectBinding,effectState,authority,evidence,
executionLease,recoveryLease,reconciliationLease,dependencyState,
policyVersion,dependencyGraphVersion,authorityEpoch,stopState,stopEpoch,
recoveryGeneration,reconciliationGeneration,now,releaseAuthorization,commitNonce>>

ExactBinding(o,e) ==
 e.operation = o /\ e.effect = effectBinding[o].effect /\
 e.target = effectBinding[o].target /\
 e.targetFingerprint = effectBinding[o].targetFingerprint

EvidenceCurrent(o,e) ==
 e.state = "VALID" /\ ExactBinding(o,e) /\
 e.authorityEpoch = authority[o].epoch /\
 e.policyVersion = policyVersion /\
 e.dependencyGraphVersion = dependencyGraphVersion /\
 e.freshUntil > now /\ e.provenanceValid /\
 e.dependencySnapshot = effectBinding[o].requiredDependencies

DependenciesAdmissible(o) ==
 \A d \in effectBinding[o].requiredDependencies:
   dependencyState[d] = "KNOWN"

CurrentStopClear(o) ==
 stopState[o] = "NORMAL"

ReleaseEligible(o) ==
 opState[o] = "VERIFIED" /\
 effectState[o] = "APPLIED" /\
 authority[o].valid /\
 authority[o].epoch = authorityEpoch[o] /\
 CurrentStopClear(o) /\
 reconciliationLease[o] # "HELD" /\
 DependenciesAdmissible(o) /\
 \E e \in EvidenceIds: EvidenceCurrent(o,e)

AcquireRecovery(o,owner) ==
 recoveryLease[o] # "HELD" /\
 reconciliationLease[o] # "HELD" /\
 recoveryGeneration' = [recoveryGeneration EXCEPT ![o] = @ + 1] /\
 recoveryLease' = [recoveryLease EXCEPT ![o] = [state |-> "HELD",owner |-> owner,
 generation |-> @.generation + 1]] /\
 UNCHANGED <<opState,effectBinding,effectState,authority,evidence,executionLease,
 reconciliationLease,dependencyState,policyVersion,dependencyGraphVersion,
 authorityEpoch,stopState,stopEpoch,reconciliationGeneration,now,
 releaseAuthorization,commitNonce>>

AcquireReconciliation(o,owner) ==
 reconciliationLease[o] # "HELD" /\
 recoveryLease[o] # "HELD" /\
 reconciliationGeneration' = [reconciliationGeneration EXCEPT ![o] = @ + 1] /\
 reconciliationLease' = [reconciliationLease EXCEPT ![o] = [state |-> "HELD",
 owner |-> owner,generation |-> @.generation + 1]] /\
 UNCHANGED <<opState,effectBinding,effectState,authority,evidence,executionLease,
 recoveryLease,recoveryGeneration,dependencyState,policyVersion,
 dependencyGraphVersion,authorityEpoch,stopState,stopEpoch,now,
 releaseAuthorization,commitNonce>>

ObserveEffect(o,eid,owner,generation) ==
 reconciliationLease[o].state = "HELD" /\
 reconciliationLease[o].owner = owner /\
 reconciliationLease[o].generation = generation /\
 evidence' = [evidence EXCEPT ![eid] = [state |-> "OBSERVED",
 operation |-> o,effect |-> effectBinding[o].effect,target |-> effectBinding[o].target,
 targetFingerprint |-> effectBinding[o].targetFingerprint,
 authorityEpoch |-> authority[o].epoch,policyVersion |-> policyVersion,
 dependencyGraphVersion |-> dependencyGraphVersion,
 dependencySnapshot |-> effectBinding[o].requiredDependencies,
 freshUntil |-> now + 1,provenanceValid |-> TRUE]] /\
 UNCHANGED <<opState,effectBinding,effectState,authority,executionLease,
 recoveryLease,recoveryLease,reconciliationLease,dependencyState,
 policyVersion,dependencyGraphVersion,authorityEpoch,stopState,stopEpoch,
 recoveryGeneration,reconciliationGeneration,now,releaseAuthorization,commitNonce>>

VerifyEvidence(o,eid) ==
 evidence[eid].state = "OBSERVED" /\
 ExactBinding(o,evidence[eid]) /\
 evidence[eid].authorityEpoch = authority[o].epoch /\
 evidence[eid].policyVersion = policyVersion /\
 evidence[eid].dependencyGraphVersion = dependencyGraphVersion /\
 evidence' = [evidence EXCEPT ![eid].state = "VALID"] /\
 UNCHANGED <<opState,effectBinding,effectState,authority,executionLease,
 recoveryLease,reconciliationLease,dependencyState,policyVersion,
 dependencyGraphVersion,authorityEpoch,stopState,stopEpoch,
 recoveryGeneration,reconciliationGeneration,now,releaseAuthorization,commitNonce>>

AdvanceTime ==
 now' = now + 1 /\
 evidence' = [evidence EXCEPT ![e].state =
   IF @.state = "VALID" /\ @.freshUntil <= now + 1 THEN "STALE" ELSE @.state] /\
 UNCHANGED <<opState,effectBinding,effectState,authority,executionLease,
 recoveryLease,reconciliationLease,dependencyState,policyVersion,
 dependencyGraphVersion,authorityEpoch,stopState,stopEpoch,
 recoveryGeneration,reconciliationGeneration,releaseAuthorization,commitNonce>>

AuthorizeRelease(o) ==
 ReleaseEligible(o) /\
 recoveryLease[o].state = "HELD" /\
 releaseAuthorization' = [releaseAuthorization EXCEPT ![o] = [
   authorityEpoch |-> authority[o].epoch,effect |-> effectBinding[o].effect,
   target |-> effectBinding[o].target,generation |-> recoveryLease[o].generation,
   nonce |-> @.nonce + 1,valid |-> TRUE]] /\
 UNCHANGED <<opState,effectBinding,effectState,authority,evidence,executionLease,
 recoveryLease,reconciliationLease,dependencyState,policyVersion,
 dependencyGraphVersion,authorityEpoch,stopState,stopEpoch,
 recoveryGeneration,reconciliationGeneration,now,commitNonce>>

Commit(o) ==
 ReleaseEligible(o) /\
 releaseAuthorization[o].valid /\
 releaseAuthorization[o].authorityEpoch = authority[o].epoch /\
 releaseAuthorization[o].effect = effectBinding[o].effect /\
 releaseAuthorization[o].target = effectBinding[o].target /\
 releaseAuthorization[o].generation = recoveryLease[o].generation /\
 recoveryLease[o].state = "HELD" /\
 opState' = [opState EXCEPT ![o] = "COMMITTED"] /\
 releaseAuthorization' = [releaseAuthorization EXCEPT ![o].valid = FALSE] /\
 commitNonce' = commitNonce + 1 /\
 UNCHANGED <<effectBinding,effectState,authority,evidence,executionLease,
 recoveryLease,reconciliationLease,dependencyState,policyVersion,
 dependencyGraphVersion,authorityEpoch,stopState,stopEpoch,
 recoveryGeneration,reconciliationGeneration,now>>

RequestStop(o) ==
 stopState[o] = "NORMAL" /\
 stopState' = [stopState EXCEPT ![o] = "REQUESTED"] /\
 stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1] /\
 releaseAuthorization' = [releaseAuthorization EXCEPT ![o].valid = FALSE] /\
 UNCHANGED <<opState,effectBinding,effectState,authority,evidence,
 executionLease,recoveryLease,reconciliationLease,dependencyState,
 policyVersion,dependencyGraphVersion,authorityEpoch,recoveryGeneration,
 reconciliationGeneration,now,commitNonce>>

TypeOK ==
 opState \in [Operations -> OpStates] /\
 effectState \in [Effects -> EffectStates] /\
 dependencyState \in [Dependencies -> DepStates] /\
 stopState \in [Operations -> StopStates] /\
 authorityEpoch \in [AuthorityDomains -> Nat] /\
 stopEpoch \in [Operations -> Nat] /\
 recoveryGeneration \in [Operations -> Nat] /\
 reconciliationGeneration \in [Operations -> Nat] /\
 now \in Nat

THEOREM TypeOK => TypeOK
=============================================================================