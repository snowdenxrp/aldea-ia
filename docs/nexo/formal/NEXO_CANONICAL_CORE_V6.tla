---------------- MODULE NEXO_CANONICAL_CORE_V6 ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS Ops, Effects, Targets, Owners, EvidenceIds, AuthDomains, Deps
ASSUME / Ops # {} / Effects # {} / Targets # {} / Owners # {}
       / EvidenceIds # {} / AuthDomains # {} / Deps # {}

OpStates == {"PROPOSED","ADMITTED","AUTHORIZED","EXECUTING","EXTERNAL_UNKNOWN","PARTIAL","APPLIED","RECONCILED","VERIFIED","COMMITTED","QUARANTINED","STOPPED"}
EffectStates == {"UNSEEN","REQUESTED","UNKNOWN","PARTIAL","APPLIED","REVERSED","CANCELLED"}
EvidenceStates == {"NONE","OBSERVED","VALID","STALE","INVALIDATED"}
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
StopStates == {"NORMAL","REQUESTED","ENFORCING","VERIFIED"}
DepStates == {"KNOWN","UNKNOWN","COMPROMISED","STALE","INVALIDATED"}

EffectBinding == [operation: Ops, effect: Effects, target: Targets, targetFp: STRING]
AuthorityContext == [domain: AuthDomains, epoch: Nat, valid: BOOLEAN]
Lease == [state: LeaseStates, owner: Owners, generation: Nat]
Evidence == [state: EvidenceStates, operation: Ops, effect: Effects, target: Targets,
 targetFp: STRING, authorityEpoch: Nat, policyVersion: Nat, graphVersion: Nat,
 freshUntil: Nat, provenanceValid: BOOLEAN]
ReleaseAuth == [valid: BOOLEAN, operation: Ops, effect: Effects, target: Targets,
 targetFp: STRING, authorityEpoch: Nat, recoveryGeneration: Nat, nonce: Nat]

VARIABLES opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
policyVersion,graphVersion,dependencyState,requiredDeps,
evidence,recovery,reconciliation,execution,stop,stopEpoch,
releaseAuth,now

vars == <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
policyVersion,graphVersion,dependencyState,requiredDeps,evidence,
recovery,reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

Init ==
 / opState = [o in Ops |-> "PROPOSED"]
 / effectBinding in [Ops -> EffectBinding]
 / effectState in [Effects -> EffectStates]
 / authority in [Ops -> AuthorityContext]
 / admittedAuthorityEpoch = [o in Ops |-> 0]
 / policyVersion = 0
 / graphVersion = 0
 / dependencyState = [d in Deps |-> "KNOWN"]
 / requiredDeps in [Ops -> SUBSET Deps]
 / evidence in [EvidenceIds -> Evidence]
 / recovery in [Ops -> Lease]
 / reconciliation in [Ops -> Lease]
 / execution in [Ops -> Lease]
 / stop = [o in Ops |-> "NORMAL"]
 / stopEpoch = [o in Ops |-> 0]
 / releaseAuth in [Ops -> ReleaseAuth]
 / now = 0

DepsOK(o) == A d in requiredDeps[o]: dependencyState[d] = "KNOWN"

EvidenceValid(o,e) ==
 / evidence[e].state = "VALID"
 / evidence[e].operation = o
 / evidence[e].effect = effectBinding[o].effect
 / evidence[e].target = effectBinding[o].target
 / evidence[e].targetFp = effectBinding[o].targetFp
 / evidence[e].authorityEpoch = authority[o].epoch
 / evidence[e].policyVersion = policyVersion
 / evidence[e].graphVersion = graphVersion
 / evidence[e].freshUntil > now
 / evidence[e].provenanceValid

ReleaseEligible(o) ==
 / opState[o] = "VERIFIED"
 / effectState[effectBinding[o].effect] = "APPLIED"
 / authority[o].valid
 / authority[o].epoch = admittedAuthorityEpoch[o]
 / stop[o] = "NORMAL"
 / DepsOK(o)
 / reconciliation[o].state # "HELD"
 / E e in EvidenceIds: EvidenceValid(o,e)

Admit(o) ==
 / opState[o] = "PROPOSED"
 / authority[o].valid
 / admittedAuthorityEpoch' = [admittedAuthorityEpoch EXCEPT ![o] = authority[o].epoch]
 / opState' = [opState EXCEPT ![o] = "ADMITTED"]
 / UNCHANGED <<effectBinding,effectState,authority,policyVersion,graphVersion,
 dependencyState,requiredDeps,evidence,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

AcquireRecovery(o,owner) ==
 / opState[o] in {"ADMITTED","AUTHORIZED","EXECUTING","EXTERNAL_UNKNOWN","PARTIAL","APPLIED","RECONCILED","VERIFIED"}
 / recovery[o].state # "HELD"
 / reconciliation[o].state # "HELD"
 / recovery' = [recovery EXCEPT ![o] = [state |-> "HELD",owner |-> owner,
 generation |-> @.generation + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,
 reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

AcquireReconciliation(o,owner) ==
 / reconciliation[o].state # "HELD"
 / recovery[o].state # "HELD"
 / reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD",
 owner |-> owner,generation |-> @.generation + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 execution,stop,stopEpoch,releaseAuth,now>>

RequestEffect(o) ==
 / opState[o] = "ADMITTED"
 / stop[o] = "NORMAL"
 / execution[o].state # "HELD"
 / opState' = [opState EXCEPT ![o] = "EXECUTING"]
 / effectState' = [effectState EXCEPT ![effectBinding[o].effect] = "REQUESTED"]
 / execution' = [execution EXCEPT ![o] = [state |-> "HELD",owner |-> CHOOSE x in Owners: TRUE,
 generation |-> @.generation + 1]]
 / UNCHANGED <<effectBinding,authority,admittedAuthorityEpoch,policyVersion,
 graphVersion,dependencyState,requiredDeps,evidence,recovery,reconciliation,
 stop,stopEpoch,releaseAuth,now>>

MarkExternalUnknown(o) ==
 / opState[o] = "EXECUTING"
 / effectState[effectBinding[o].effect] = "REQUESTED"
 / effectState' = [effectState EXCEPT ![effectBinding[o].effect] = "UNKNOWN"]
 / opState' = [opState EXCEPT ![o] = "EXTERNAL_UNKNOWN"]
 / UNCHANGED <<effectBinding,authority,admittedAuthorityEpoch,policyVersion,
 graphVersion,dependencyState,requiredDeps,evidence,recovery,reconciliation,
 execution,stop,stopEpoch,releaseAuth,now>>

AcquireReconcileAndObserve(o,eid,owner) ==
 / reconciliation[o].state # "HELD"
 / recovery[o].state # "HELD"
 / evidence' = [evidence EXCEPT ![eid] = [
      state |-> "OBSERVED",operation |-> o,effect |-> effectBinding[o].effect,
      target |-> effectBinding[o].target,targetFp |-> effectBinding[o].targetFp,
      authorityEpoch |-> authority[o].epoch,policyVersion |-> policyVersion,
      graphVersion |-> graphVersion,freshUntil |-> now + 5,
      provenanceValid |-> TRUE]]
 / reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD",
      owner |-> owner,generation |-> @.generation + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,execution,
 stop,stopEpoch,releaseAuth,now>>

VerifyEvidence(o,eid) ==
 / evidence[eid].state = "OBSERVED"
 / evidence[eid].operation = o
 / evidence[eid].effect = effectBinding[o].effect
 / evidence[eid].targetFp = effectBinding[o].targetFp
 / evidence' = [evidence EXCEPT ![eid].state = "VALID"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,
 reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

ReconcileApplied(o) ==
 / effectState[effectBinding[o].effect] = "UNKNOWN"
 / reconciliation[o].state = "HELD"
 / effectState' = [effectState EXCEPT ![effectBinding[o].effect] = "APPLIED"]
 / opState' = [opState EXCEPT ![o] = "RECONCILED"]
 / UNCHANGED <<effectBinding,authority,admittedAuthorityEpoch,policyVersion,
 graphVersion,dependencyState,requiredDeps,evidence,recovery,reconciliation,
 execution,stop,stopEpoch,releaseAuth,now>>

VerifyOperation(o) ==
 / opState[o] = "RECONCILED"
 / E e in EvidenceIds: EvidenceValid(o,e)
 / opState' = [opState EXCEPT ![o] = "VERIFIED"]
 / UNCHANGED <<effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

AuthorizeRelease(o) ==
 / ReleaseEligible(o)
 / recovery[o].state = "HELD"
 / releaseAuth' = [releaseAuth EXCEPT ![o] = [
      valid |-> TRUE,operation |-> o,effect |-> effectBinding[o].effect,
      target |-> effectBinding[o].target,targetFp |-> effectBinding[o].targetFp,
      authorityEpoch |-> authority[o].epoch,
      recoveryGeneration |-> recovery[o].generation,
      nonce |-> @.nonce + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,stop,stopEpoch,now>>

Commit(o) ==
 / releaseAuth[o].valid
 / releaseAuth[o].operation = o
 / releaseAuth[o].effect = effectBinding[o].effect
 / releaseAuth[o].target = effectBinding[o].target
 / releaseAuth[o].targetFp = effectBinding[o].targetFp
 / releaseAuth[o].authorityEpoch = authority[o].epoch
 / releaseAuth[o].recoveryGeneration = recovery[o].generation
 / ReleaseEligible(o)
 / opState' = [opState EXCEPT ![o] = "COMMITTED"]
 / releaseAuth' = [releaseAuth EXCEPT ![o].valid = FALSE]
 / UNCHANGED <<effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,stop,stopEpoch,now>>

RequestStop(o) ==
 / stop[o] = "NORMAL"
 / stop' = [stop EXCEPT ![o] = "REQUESTED"]
 / stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
 / releaseAuth' = [releaseAuth EXCEPT ![o].valid = FALSE]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,now>>

EnforceStop(o) ==
 / stop[o] = "REQUESTED"
 / stop' = [stop EXCEPT ![o] = "ENFORCING"]
 / execution' = [execution EXCEPT ![o].state = "REVOKED"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,stopEpoch,releaseAuth,now>>

VerifyStop(o) ==
 / stop[o] = "ENFORCING"
 / stop' = [stop EXCEPT ![o] = "VERIFIED"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,stopEpoch,releaseAuth,now>>

InvalidateContext(o) ==
 / authority[o].epoch # admittedAuthorityEpoch[o] / ~authority[o].valid
 / ~DepsOK(o)
 / releaseAuth' = [releaseAuth EXCEPT ![o].valid = FALSE]
 / evidence' = [evidence EXCEPT ![e].state =
      IF evidence[e].operation = o THEN "INVALIDATED" ELSE evidence[e].state]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,
 reconciliation,execution,stop,stopEpoch,now>>

AdvanceTime ==
 / now' = now + 1
 / evidence' = [e in EvidenceIds |->
      IF evidence[e].state = "VALID" /\ evidence[e].freshUntil <= now + 1
      THEN [evidence[e] EXCEPT !.state = "STALE"] ELSE evidence[e]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedAuthorityEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,
 reconciliation,execution,stop,stopEpoch,releaseAuth>>

TypeOK ==
 / opState in [Ops -> OpStates]
 / effectState in [Effects -> EffectStates]
 / authority in [Ops -> AuthorityContext]
 / admittedAuthorityEpoch in [Ops -> Nat]
 / dependencyState in [Deps -> DepStates]
 / evidence in [EvidenceIds -> Evidence]
 / recovery in [Ops -> Lease]
 / reconciliation in [Ops -> Lease]
 / execution in [Ops -> Lease]
 / stop in [Ops -> StopStates]
 / stopEpoch in [Ops -> Nat]
 / releaseAuth in [Ops -> ReleaseAuth]
 / now in Nat

=============================================================================