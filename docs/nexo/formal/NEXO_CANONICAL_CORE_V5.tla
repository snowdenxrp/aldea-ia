---------------- MODULE NEXO_CANONICAL_CORE_V5 ----------------
EXTENDS Naturals, FiniteSets, TLC

CONSTANTS Ops, Effects, Targets, Owners, EvidenceIds, AuthDomains, Deps, PolicyVersions, GraphVersions

OpStates == {"PROPOSED","ADMITTED","AUTHORIZED","EXECUTING","EXTERNAL_UNKNOWN","PARTIAL","APPLIED","RECONCILED","VERIFIED","COMMITTED","QUARANTINED","STOPPED"}
EffectStates == {"UNSEEN","REQUESTED","UNKNOWN","PARTIAL","APPLIED","REVERSED","CANCELLED"}
EvidenceStates == {"OBSERVED","VALID","STALE","INVALIDATED"}
LeaseKinds == {"EXECUTION","RECOVERY","RECONCILIATION"}
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
StopStates == {"NORMAL","REQUESTED","ENFORCING","VERIFIED"}
DepStates == {"KNOWN","UNKNOWN","COMPROMISED","STALE","INVALIDATED"}

REQUIRED_DEPENDENCIES(o) == requiredDeps[o]

VARIABLES opState,effectState,authorityEpoch,authorityValid,opDomain,
requiredDeps,dependencyState,policyVersion,graphVersion,
evidenceState,evidenceOp,evidenceEffect,evidenceTarget,evidenceTargetFp,
evidenceAuthorityEpoch,evidencePolicyVersion,evidenceGraphVersion,
evidenceFreshUntil,evidenceProvenanceValid,
recoveryState,recoveryOwner,recoveryGen,
reconciliationState,reconciliationOwner,reconciliationGen,
executionState,stopState,stopEpoch,releaseAuth,releaseNonce,now

vars == <<opState,effectState,authorityEpoch,authorityValid,opDomain,
requiredDeps,dependencyState,policyVersion,graphVersion,
evidenceState,evidenceOp,evidenceEffect,evidenceTarget,evidenceTargetFp,
evidenceAuthorityEpoch,evidencePolicyVersion,evidenceGraphVersion,
evidenceFreshUntil,evidenceProvenanceValid,
recoveryState,recoveryOwner,recoveryGen,
reconciliationState,reconciliationOwner,reconciliationGen,
executionState,stopState,stopEpoch,releaseAuth,releaseNonce,now>>

Init ==
 / opState = [o in Ops |-> "PROPOSED"]
 / effectState = [e in Effects |-> "UNSEEN"]
 / authorityEpoch = [d in AuthDomains |-> 0]
 / authorityValid = [o in Ops |-> TRUE]
 / opDomain in [Ops -> AuthDomains]
 / requiredDeps in [Ops -> SUBSET Deps]
 / dependencyState = [d in Deps |-> "KNOWN"]
 / policyVersion in PolicyVersions
 / graphVersion in GraphVersions
 / evidenceState = [e in EvidenceIds |-> "INVALIDATED"]
 / evidenceOp = [e in EvidenceIds |-> CHOOSE o in Ops: TRUE]
 / evidenceEffect = [e in EvidenceIds |-> CHOOSE x in Effects: TRUE]
 / evidenceTarget = [e in EvidenceIds |-> CHOOSE t in Targets: TRUE]
 / evidenceTargetFp = [e in EvidenceIds |-> "NONE"]
 / evidenceAuthorityEpoch = [e in EvidenceIds |-> 0]
 / evidencePolicyVersion = [e in EvidenceIds |-> CHOOSE p in PolicyVersions: TRUE]
 / evidenceGraphVersion = [e in EvidenceIds |-> CHOOSE g in GraphVersions: TRUE]
 / evidenceFreshUntil = [e in EvidenceIds |-> 0]
 / evidenceProvenanceValid = [e in EvidenceIds |-> FALSE]
 / recoveryState = [o in Ops |-> "FREE"]
 / recoveryOwner = [o in Ops |-> CHOOSE x in Owners: TRUE]
 / recoveryGen = [o in Ops |-> 0]
 / reconciliationState = [o in Ops |-> "FREE"]
 / reconciliationOwner = [o in Ops |-> CHOOSE x in Owners: TRUE]
 / reconciliationGen = [o in Ops |-> 0]
 / executionState = [o in Ops |-> "FREE"]
 / stopState = [o in Ops |-> "NORMAL"]
 / stopEpoch = [o in Ops |-> 0]
 / releaseAuth = [o in Ops |-> FALSE]
 / releaseNonce = [o in Ops |-> 0]
 / now = 0

ExactEvidence(o,e) ==
 / evidenceState[e] = "VALID"
 / evidenceOp[e] = o
 / evidenceEffect[e] = effectBindingEffect[o]
 / evidenceTarget[e] = effectBindingTarget[o]
 / evidenceTargetFp[e] = effectBindingTargetFp[o]
 / evidenceAuthorityEpoch[e] = authorityEpoch[opDomain[o]]
 / evidencePolicyVersion[e] = policyVersion
 / evidenceGraphVersion[e] = graphVersion
 / evidenceFreshUntil[e] > now
 / evidenceProvenanceValid[e]

DepsOK(o) ==
 A d in requiredDeps[o]: dependencyState[d] = "KNOWN"

ReleaseEligible(o) ==
 / opState[o] = "VERIFIED"
 / effectState[effectBindingEffect[o]] = "APPLIED"
 / authorityValid[o]
 / authorityEpoch[opDomain[o]] = admittedAuthorityEpoch[o]
 / stopState[o] = "NORMAL"
 / DepsOK(o)
 / reconciliationState[o] # "HELD"
 / E e in EvidenceIds: ExactEvidence(o,e)

AuthorizeRelease(o) ==
 / ReleaseEligible(o)
 / recoveryState[o] = "HELD"
 / releaseAuth' = [releaseAuth EXCEPT ![o] = TRUE]
 / releaseNonce' = [releaseNonce EXCEPT ![o] = @ + 1]
 / UNCHANGED <<opState,effectState,authorityEpoch,authorityValid,opDomain,requiredDeps,
 dependencyState,policyVersion,graphVersion,evidenceState,evidenceOp,evidenceEffect,
 evidenceTarget,evidenceTargetFp,evidenceAuthorityEpoch,evidencePolicyVersion,
 evidenceGraphVersion,evidenceFreshUntil,evidenceProvenanceValid,recoveryState,
 recoveryOwner,recoveryGen,reconciliationState,reconciliationOwner,reconciliationGen,
 executionState,stopState,stopEpoch,now>>

Commit(o) ==
 / releaseAuth[o]
 / ReleaseEligible(o)
 / recoveryState[o] = "HELD"
 / opState' = [opState EXCEPT ![o] = "COMMITTED"]
 / releaseAuth' = [releaseAuth EXCEPT ![o] = FALSE]
 / UNCHANGED <<effectState,authorityEpoch,authorityValid,opDomain,requiredDeps,
 dependencyState,policyVersion,graphVersion,evidenceState,evidenceOp,evidenceEffect,
 evidenceTarget,evidenceTargetFp,evidenceAuthorityEpoch,evidencePolicyVersion,
 evidenceGraphVersion,evidenceFreshUntil,evidenceProvenanceValid,recoveryState,
 recoveryOwner,recoveryGen,reconciliationState,reconciliationOwner,reconciliationGen,
 executionState,stopState,stopEpoch,releaseNonce,now>>

RequestStop(o) ==
 / stopState[o] = "NORMAL"
 / stopState' = [stopState EXCEPT ![o] = "REQUESTED"]
 / stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
 / releaseAuth' = [releaseAuth EXCEPT ![o] = FALSE]
 / UNCHANGED <<opState,effectState,authorityEpoch,authorityValid,opDomain,requiredDeps,
 dependencyState,policyVersion,graphVersion,evidenceState,evidenceOp,evidenceEffect,
 evidenceTarget,evidenceTargetFp,evidenceAuthorityEpoch,evidencePolicyVersion,
 evidenceGraphVersion,evidenceFreshUntil,evidenceProvenanceValid,recoveryState,
 recoveryOwner,recoveryGen,reconciliationState,reconciliationOwner,reconciliationGen,
 executionState,now,releaseNonce>>

AdvanceTime ==
 / now' = now + 1
 / evidenceState' = [e in EvidenceIds |->
      IF evidenceState[e] = "VALID" /\ evidenceFreshUntil[e] <= now + 1
      THEN "STALE" ELSE evidenceState[e]]
 / UNCHANGED <<opState,effectState,authorityEpoch,authorityValid,opDomain,requiredDeps,
 dependencyState,policyVersion,graphVersion,evidenceOp,evidenceEffect,evidenceTarget,
 evidenceTargetFp,evidenceAuthorityEpoch,evidencePolicyVersion,evidenceGraphVersion,
 evidenceFreshUntil,evidenceProvenanceValid,recoveryState,recoveryOwner,recoveryGen,
 reconciliationState,reconciliationOwner,reconciliationGen,executionState,stopState,
 stopEpoch,releaseAuth,releaseNonce>>

Next == E o in Ops:
  RequestStop(o) / Commit(o) / AuthorizeRelease(o)
  / AdvanceTime

=============================================================================