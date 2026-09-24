---------------- MODULE NEXO_CANONICAL_CORE_V7 ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS Ops, Effects, Targets, Owners, EvidenceIds, AuthDomains, Deps

OpStates == {"PROPOSED","ADMITTED","AUTHORIZED","EXECUTING","EXTERNAL_UNKNOWN","PARTIAL","RECONCILED","VERIFIED","COMMITTED","QUARANTINED","STOPPED"}
EffectStates == {"UNSEEN","REQUESTED","UNKNOWN","PARTIAL","APPLIED","REVERSED","CANCELLED"}
EvidenceStates == {"NONE","OBSERVED","VALID","STALE","INVALIDATED"}
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
StopStates == {"NORMAL","REQUESTED","ENFORCING","VERIFIED"}

EffectBindingSet == [operation: Ops, effect: Effects, target: Targets, targetFp: STRING]
AuthoritySet == [domain: AuthDomains, epoch: Nat, valid: BOOLEAN]
LeaseSet == [state: LeaseStates, owner: Owners, generation: Nat]
EvidenceSet == [state: EvidenceStates, operation: Ops, effect: Effects, target: Targets,
 targetFp: STRING, authorityEpoch: Nat, policyVersion: Nat, graphVersion: Nat,
 freshUntil: Nat, provenance: STRING]
ReleaseSet == [valid: BOOLEAN, operation: Ops, effect: Effects, target: Targets,
 targetFp: STRING, authorityEpoch: Nat, recoveryGeneration: Nat, nonce: Nat]

EffectBindings == [Ops -> EffectBindingSet]
Authorities == [Ops -> AuthoritySet]
Leases == [Ops -> LeaseSet]
Evidences == [EvidenceIds -> EvidenceSet]
Releases == [Ops -> ReleaseSet]

VARIABLES opState,effectBinding,effectState,authority,admittedEpoch,
policyVersion,graphVersion,dependencyState,requiredDeps,evidence,
recovery,reconciliation,execution,stop,stopEpoch,releaseAuth,now

vars == <<opState,effectBinding,effectState,authority,admittedEpoch,
policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

ValidBinding(b) == b.operation in Ops / b.effect in Effects / b.target in Targets
ValidAuthority(a) == a.domain in AuthDomains / a.epoch in Nat
ValidLease(l) == l.state in LeaseStates / l.owner in Owners / l.generation in Nat
ValidEvidence(x) == x.state in EvidenceStates / x.operation in Ops / x.effect in Effects
ValidRelease(x) == x.valid in BOOLEAN / x.operation in Ops / x.effect in Effects

Init ==
 / opState = [o in Ops |-> "PROPOSED"]
 / effectBinding in EffectBindings
 / authority in Authorities
 / admittedEpoch = [o in Ops |-> 0]
 / policyVersion = 0
 / graphVersion = 0
 / dependencyState = [d in Deps |-> "KNOWN"]
 / requiredDeps in [Ops -> SUBSET Deps]
 / evidence in Evidences
 / recovery in Leases
 / reconciliation in Leases
 / execution in Leases
 / stop = [o in Ops |-> "NORMAL"]
 / stopEpoch = [o in Ops |-> 0]
 / releaseAuth in Releases
 / now = 0

AcquireExecution(o,owner) ==
 / opState[o] = "ADMITTED"
 / execution[o].state # "HELD"
 / stop[o] = "NORMAL"
 / execution' = [execution EXCEPT ![o] = [state |-> "HELD",owner |-> owner,
 generation |-> @.generation + 1]]
 / opState' = [opState EXCEPT ![o] = "AUTHORIZED"]
 / UNCHANGED <<effectBinding,effectState,authority,admittedEpoch,policyVersion,
 graphVersion,dependencyState,requiredDeps,evidence,recovery,reconciliation,
 stop,stopEpoch,releaseAuth,now>>

StartExecution(o) ==
 / opState[o] = "AUTHORIZED"
 / execution[o].state = "HELD"
 / stop[o] = "NORMAL"
 / opState' = [opState EXCEPT ![o] = "EXECUTING"]
 / effectState' = [effectState EXCEPT ![effectBinding[o].effect] = "REQUESTED"]
 / UNCHANGED <<effectBinding,authority,admittedEpoch,policyVersion,graphVersion,
 dependencyState,requiredDeps,evidence,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

MarkUnknown(o) ==
 / opState[o] = "EXECUTING"
 / effectState[effectBinding[o].effect] = "REQUESTED"
 / effectState' = [effectState EXCEPT ![effectBinding[o].effect] = "UNKNOWN"]
 / opState' = [opState EXCEPT ![o] = "EXTERNAL_UNKNOWN"]
 / UNCHANGED <<effectBinding,authority,admittedEpoch,policyVersion,graphVersion,
 dependencyState,requiredDeps,evidence,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

AcquireRecovery(o,owner) ==
 / recovery[o].state # "HELD"
 / reconciliation[o].state # "HELD"
 / recovery' = [recovery EXCEPT ![o] = [state |-> "HELD",owner |-> owner,
 generation |-> @.generation + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,
 reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

AcquireReconciliation(o,owner) ==
 / reconciliation[o].state # "HELD"
 / recovery[o].state # "HELD"
 / reconciliation' = [reconciliation EXCEPT ![o] = [state |-> "HELD",
 owner |-> owner,generation |-> @.generation + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 execution,stop,stopEpoch,releaseAuth,now>>

Observe(o,eid) ==
 / reconciliation[o].state = "HELD"
 / evidence' = [evidence EXCEPT ![eid] = [
 state |-> "OBSERVED",operation |-> o,effect |-> effectBinding[o].effect,
 target |-> effectBinding[o].target,targetFp |-> effectBinding[o].targetFp,
 authorityEpoch |-> authority[o].epoch,policyVersion |-> policyVersion,
 graphVersion |-> graphVersion,freshUntil |-> now + 5,
 provenance |-> "BOUND"]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,
 reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

VerifyEvidence(o,eid) ==
 / evidence[eid].state = "OBSERVED"
 / evidence[eid].operation = o
 / evidence[eid].effect = effectBinding[o].effect
 / evidence[eid].targetFp = effectBinding[o].targetFp
 / evidence[eid].provenance = "BOUND"
 / evidence' = [evidence EXCEPT ![eid].state = "VALID"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,
 reconciliation,execution,stop,stopEpoch,releaseAuth,now>>

ReconcileApplied(o,eid) ==
 / effectState[effectBinding[o].effect] = "UNKNOWN"
 / reconciliation[o].state = "HELD"
 / evidence[eid].state = "VALID"
 / evidence[eid].operation = o
 / effectState' = [effectState EXCEPT ![effectBinding[o].effect] = "APPLIED"]
 / opState' = [opState EXCEPT ![o] = "RECONCILED"]
 / UNCHANGED <<effectBinding,authority,admittedEpoch,policyVersion,graphVersion,
 dependencyState,requiredDeps,evidence,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

VerifyOperation(o,eid) ==
 / opState[o] = "RECONCILED"
 / evidence[eid].state = "VALID"
 / evidence[eid].operation = o
 / evidence[eid].effect = effectBinding[o].effect
 / evidence[eid].targetFp = effectBinding[o].targetFp
 / evidence[eid].freshUntil > now
 / opState' = [opState EXCEPT ![o] = "VERIFIED"]
 / UNCHANGED <<effectBinding,effectState,authority,admittedEpoch,policyVersion,
 graphVersion,dependencyState,requiredDeps,evidence,recovery,reconciliation,
 execution,stop,stopEpoch,releaseAuth,now>>

ReleaseEligible(o) ==
 / opState[o] = "VERIFIED"
 / effectState[effectBinding[o].effect] = "APPLIED"
 / authority[o].valid
 / authority[o].epoch = admittedEpoch[o]
 / stop[o] = "NORMAL"
 / A d in requiredDeps[o]: dependencyState[d] = "KNOWN"
 / reconciliation[o].state # "HELD"
 / E e in EvidenceIds:
    evidence[e].state = "VALID" / evidence[e].operation = o
    / evidence[e].effect = effectBinding[o].effect
    / evidence[e].targetFp = effectBinding[o].targetFp
    / evidence[e].authorityEpoch = authority[o].epoch
    / evidence[e].policyVersion = policyVersion
    / evidence[e].graphVersion = graphVersion
    / evidence[e].freshUntil > now
    / evidence[e].provenance = "BOUND"

AuthorizeRelease(o) ==
 / ReleaseEligible(o)
 / recovery[o].state = "HELD"
 / releaseAuth' = [releaseAuth EXCEPT ![o] = [
 valid |-> TRUE,operation |-> o,effect |-> effectBinding[o].effect,
 target |-> effectBinding[o].target,targetFp |-> effectBinding[o].targetFp,
 authorityEpoch |-> authority[o].epoch,recoveryGeneration |-> recovery[o].generation,
 nonce |-> @.nonce + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,stop,stopEpoch,now>>

Commit(o) ==
 / releaseAuth[o].valid
 / releaseAuth[o].operation = o
 / releaseAuth[o].effect = effectBinding[o].effect
 / releaseAuth[o].targetFp = effectBinding[o].targetFp
 / releaseAuth[o].authorityEpoch = authority[o].epoch
 / releaseAuth[o].recoveryGeneration = recovery[o].generation
 / ReleaseEligible(o)
 / opState' = [opState EXCEPT ![o] = "COMMITTED"]
 / releaseAuth' = [releaseAuth EXCEPT ![o].valid = FALSE]
 / UNCHANGED <<effectBinding,effectState,authority,admittedEpoch,policyVersion,
 graphVersion,dependencyState,requiredDeps,evidence,recovery,reconciliation,
 execution,stop,stopEpoch,now>>

RequestStop(o) ==
 / stop[o] = "NORMAL"
 / stop' = [stop EXCEPT ![o] = "REQUESTED"]
 / stopEpoch' = [stopEpoch EXCEPT ![o] = @ + 1]
 / releaseAuth' = [releaseAuth EXCEPT ![o].valid = FALSE]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,now>>

EnforceStop(o) ==
 / stop[o] = "REQUESTED"
 / stop' = [stop EXCEPT ![o] = "ENFORCING"]
 / execution' = [execution EXCEPT ![o].state = "REVOKED"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,stopEpoch,releaseAuth,now>>

VerifyStop(o) ==
 / stop[o] = "ENFORCING"
 / stop' = [stop EXCEPT ![o] = "VERIFIED"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,evidence,recovery,
 reconciliation,execution,stopEpoch,releaseAuth,now>>

Invalidate(o) ==
 / ~authority[o].valid / authority[o].epoch # admittedEpoch[o]
 / E d in requiredDeps[o]: dependencyState[d] # "KNOWN"
 / releaseAuth' = [releaseAuth EXCEPT ![o].valid = FALSE]
 / evidence' = [evidence EXCEPT ![e].state =
 IF evidence[e].operation = o THEN "INVALIDATED" ELSE evidence[e].state]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,
 reconciliation,execution,stop,stopEpoch,now>>

AdvanceTime ==
 / now' = now + 1
 / evidence' = [e in EvidenceIds |->
 IF evidence[e].state = "VALID" /\ evidence[e].freshUntil <= now + 1
 THEN [evidence[e] EXCEPT !.state = "STALE"] ELSE evidence[e]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,requiredDeps,recovery,
 reconciliation,execution,stop,stopEpoch,releaseAuth>>

TypeOK ==
 / opState in [Ops -> OpStates]
 / effectState in [Effects -> EffectStates]
 / effectBinding in [Ops -> EffectBindingSet]
 / authority in [Ops -> AuthoritySet]
 / evidence in [EvidenceIds -> EvidenceSet]
 / recovery in [Ops -> LeaseSet]
 / reconciliation in [Ops -> LeaseSet]
 / execution in [Ops -> LeaseSet]
 / stop in [Ops -> StopStates]
 / stopEpoch in [Ops -> Nat]
 / releaseAuth in [Ops -> ReleaseSet]
 / now in Nat

=============================================================================