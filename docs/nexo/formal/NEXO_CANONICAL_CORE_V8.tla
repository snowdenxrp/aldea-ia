---------------- MODULE NEXO_CANONICAL_CORE_V8 ----------------
EXTENDS Naturals, FiniteSets

CONSTANTS o1, fx1, t1, alice, bob, ev1, ev2, dep1

Ops == {o1}
Effects == {fx1}
Targets == {t1}
Owners == {alice,bob}
EvidenceIds == {ev1,ev2}
Deps == {dep1}

OpStates == {"PROPOSED","ADMITTED","AUTHORIZED","EXECUTING","EXTERNAL_UNKNOWN","RECONCILED","VERIFIED","COMMITTED","STOPPED"}
EffectStates == {"UNSEEN","REQUESTED","UNKNOWN","APPLIED"}
EvidenceStates == {"NONE","OBSERVED","VALID","STALE","INVALIDATED"}
LeaseStates == {"FREE","HELD","EXPIRED","REVOKED"}
StopStates == {"NORMAL","REQUESTED","ENFORCING","VERIFIED"}
DepStates == {"KNOWN","UNKNOWN","COMPROMISED"}

EffectBinding == [operation: Ops, effect: Effects, target: Targets, targetFp: {"fp1"}]
Authority == [epoch: Nat, valid: BOOLEAN]
Lease == [state: LeaseStates, owner: Owners, generation: Nat]
Evidence == [state: EvidenceStates, operation: Ops, effect: Effects, target: Targets,
 targetFp: {"fp1"}, observedEffect: EffectStates, authorityEpoch: Nat,
 policyVersion: Nat, graphVersion: Nat, freshUntil: Nat, provenance: BOOLEAN]
Release == [valid: BOOLEAN, operation: Ops, effect: Effects, target: Targets,
 targetFp: {"fp1"}, authorityEpoch: Nat, recoveryGeneration: Nat, nonce: Nat]

VARIABLES opState,effectBinding,effectState,authority,admittedEpoch,
policyVersion,graphVersion,dependencyState,evidence,recovery,
reconciliation,execution,stop,stopEpoch,releaseAuth,now

vars == <<opState,effectBinding,effectState,authority,admittedEpoch,policyVersion,
graphVersion,dependencyState,evidence,recovery,reconciliation,execution,
stop,stopEpoch,releaseAuth,now>>

Init ==
 / opState = [o1 |-> "PROPOSED"]
 / effectBinding = [o1 |-> [operation |-> o1,effect |-> fx1,target |-> t1,targetFp |-> "fp1"]]
 / effectState = [fx1 |-> "UNSEEN"]
 / authority = [o1 |-> [epoch |-> 0,valid |-> TRUE]]
 / admittedEpoch = [o1 |-> 0]
 / policyVersion = 0
 / graphVersion = 0
 / dependencyState = [dep1 |-> "KNOWN"]
 / evidence = [ev1 |-> [state |-> "INVALIDATED",operation |-> o1,effect |-> fx1,target |-> t1,
 targetFp |-> "fp1",observedEffect |-> "UNKNOWN",authorityEpoch |-> 0,
 policyVersion |-> 0,graphVersion |-> 0,freshUntil |-> 0,provenance |-> FALSE],
 ev2 |-> [state |-> "INVALIDATED",operation |-> o1,effect |-> fx1,target |-> t1,
 targetFp |-> "fp1",observedEffect |-> "UNKNOWN",authorityEpoch |-> 0,
 policyVersion |-> 0,graphVersion |-> 0,freshUntil |-> 0,provenance |-> FALSE]]
 / recovery = [o1 |-> [state |-> "FREE",owner |-> alice,generation |-> 0]]
 / reconciliation = [o1 |-> [state |-> "FREE",owner |-> alice,generation |-> 0]]
 / execution = [o1 |-> [state |-> "FREE",owner |-> alice,generation |-> 0]]
 / stop = [o1 |-> "NORMAL"]
 / stopEpoch = [o1 |-> 0]
 / releaseAuth = [o1 |-> [valid |-> FALSE,operation |-> o1,effect |-> fx1,target |-> t1,
 targetFp |-> "fp1",authorityEpoch |-> 0,recoveryGeneration |-> 0,nonce |-> 0]]
 / now = 0

Admit ==
 / opState[o1] = "PROPOSED"
 / authority[o1].valid
 / admittedEpoch' = [admittedEpoch EXCEPT ![o1] = authority[o1].epoch]
 / opState' = [opState EXCEPT ![o1] = "ADMITTED"]
 / UNCHANGED <<effectBinding,effectState,authority,policyVersion,graphVersion,
 dependencyState,evidence,recovery,reconciliation,execution,stop,stopEpoch,
 releaseAuth,now>>

AcquireExecution(owner) ==
 / opState[o1] = "ADMITTED"
 / execution[o1].state = "FREE"
 / stop[o1] = "NORMAL"
 / execution' = [execution EXCEPT ![o1] = [state |-> "HELD",owner |-> owner,
 generation |-> @.generation + 1]]
 / opState' = [opState EXCEPT ![o1] = "AUTHORIZED"]
 / UNCHANGED <<effectBinding,effectState,authority,admittedEpoch,policyVersion,
 graphVersion,dependencyState,evidence,recovery,reconciliation,stop,stopEpoch,
 releaseAuth,now>>

StartExecution ==
 / opState[o1] = "AUTHORIZED"
 / execution[o1].state = "HELD"
 / stop[o1] = "NORMAL"
 / opState' = [opState EXCEPT ![o1] = "EXECUTING"]
 / effectState' = [effectState EXCEPT ![fx1] = "REQUESTED"]
 / UNCHANGED <<effectBinding,authority,admittedEpoch,policyVersion,graphVersion,
 dependencyState,evidence,recovery,reconciliation,execution,stop,stopEpoch,
 releaseAuth,now>>

MarkUnknown ==
 / opState[o1] = "EXECUTING"
 / effectState[fx1] = "REQUESTED"
 / effectState' = [effectState EXCEPT ![fx1] = "UNKNOWN"]
 / opState' = [opState EXCEPT ![o1] = "EXTERNAL_UNKNOWN"]
 / UNCHANGED <<effectBinding,authority,admittedEpoch,policyVersion,graphVersion,
 dependencyState,evidence,recovery,reconciliation,execution,stop,stopEpoch,
 releaseAuth,now>>

AcquireReconciliation(owner) ==
 / reconciliation[o1].state = "FREE"
 / recovery[o1].state # "HELD"
 / reconciliation' = [reconciliation EXCEPT ![o1] = [state |-> "HELD",
 owner |-> owner,generation |-> @.generation + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,evidence,recovery,execution,
 stop,stopEpoch,releaseAuth,now>>

Observe(eid) ==
 / reconciliation[o1].state = "HELD"
 / evidence' = [evidence EXCEPT ![eid] = [
 state |-> "OBSERVED",operation |-> o1,effect |-> fx1,target |-> t1,
 targetFp |-> "fp1",observedEffect |-> "APPLIED",authorityEpoch |-> authority[o1].epoch,
 policyVersion |-> policyVersion,graphVersion |-> graphVersion,
 freshUntil |-> now + 5,provenance |-> TRUE]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

VerifyEvidence(eid) ==
 / evidence[eid].state = "OBSERVED"
 / evidence[eid].operation = o1
 / evidence[eid].effect = fx1
 / evidence[eid].targetFp = "fp1"
 / evidence[eid].observedEffect = "APPLIED"
 / evidence[eid].provenance
 / evidence[eid].freshUntil > now
 / evidence' = [evidence EXCEPT ![eid].state = "VALID"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

ReconcileApplied(eid) ==
 / effectState[fx1] = "UNKNOWN"
 / evidence[eid].state = "VALID"
 / evidence[eid].observedEffect = "APPLIED"
 / reconciliation[o1].state = "HELD"
 / effectState' = [effectState EXCEPT ![fx1] = "APPLIED"]
 / opState' = [opState EXCEPT ![o1] = "RECONCILED"]
 / UNCHANGED <<effectBinding,authority,admittedEpoch,policyVersion,graphVersion,
 dependencyState,evidence,recovery,reconciliation,execution,stop,stopEpoch,
 releaseAuth,now>>

VerifyOperation(eid) ==
 / opState[o1] = "RECONCILED"
 / evidence[eid].state = "VALID"
 / evidence[eid].freshUntil > now
 / opState' = [opState EXCEPT ![o1] = "VERIFIED"]
 / UNCHANGED <<effectBinding,effectState,authority,admittedEpoch,policyVersion,
 graphVersion,dependencyState,evidence,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

ReleaseEligible ==
 / opState[o1] = "VERIFIED"
 / effectState[fx1] = "APPLIED"
 / authority[o1].valid
 / authority[o1].epoch = admittedEpoch[o1]
 / stop[o1] = "NORMAL"
 / dependencyState[dep1] = "KNOWN"
 / reconciliation[o1].state # "HELD"
 / E e in EvidenceIds:
    evidence[e].state = "VALID" / evidence[e].observedEffect = "APPLIED"
    / evidence[e].authorityEpoch = authority[o1].epoch
    / evidence[e].policyVersion = policyVersion
    / evidence[e].graphVersion = graphVersion
    / evidence[e].freshUntil > now
    / evidence[e].provenance

AcquireRecovery(owner) ==
 / recovery[o1].state = "FREE"
 / reconciliation[o1].state # "HELD"
 / recovery' = [recovery EXCEPT ![o1] = [state |-> "HELD",owner |-> owner,
 generation |-> @.generation + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,evidence,reconciliation,execution,
 stop,stopEpoch,releaseAuth,now>>

AuthorizeRelease ==
 / ReleaseEligible
 / recovery[o1].state = "HELD"
 / releaseAuth' = [releaseAuth EXCEPT ![o1] = [valid |-> TRUE,operation |-> o1,
 effect |-> fx1,target |-> t1,targetFp |-> "fp1",authorityEpoch |-> authority[o1].epoch,
 recoveryGeneration |-> recovery[o1].generation,nonce |-> @.nonce + 1]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,evidence,recovery,reconciliation,
 execution,stop,stopEpoch,now>>

Commit ==
 / releaseAuth[o1].valid
 / releaseAuth[o1].authorityEpoch = authority[o1].epoch
 / releaseAuth[o1].recoveryGeneration = recovery[o1].generation
 / ReleaseEligible
 / opState' = [opState EXCEPT ![o1] = "COMMITTED"]
 / releaseAuth' = [releaseAuth EXCEPT ![o1].valid = FALSE]
 / UNCHANGED <<effectBinding,effectState,authority,admittedEpoch,policyVersion,
 graphVersion,dependencyState,evidence,recovery,reconciliation,execution,
 stop,stopEpoch,now>>

RequestStop ==
 / stop[o1] = "NORMAL"
 / stop' = [stop EXCEPT ![o1] = "REQUESTED"]
 / stopEpoch' = [stopEpoch EXCEPT ![o1] = @ + 1]
 / releaseAuth' = [releaseAuth EXCEPT ![o1].valid = FALSE]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,evidence,recovery,reconciliation,
 execution,now>>

EnforceStop ==
 / stop[o1] = "REQUESTED"
 / stop' = [stop EXCEPT ![o1] = "ENFORCING"]
 / execution' = [execution EXCEPT ![o1].state = "REVOKED"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,evidence,recovery,reconciliation,
 stopEpoch,releaseAuth,now>>

VerifyStop ==
 / stop[o1] = "ENFORCING"
 / stop' = [stop EXCEPT ![o1] = "VERIFIED"]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,evidence,recovery,reconciliation,
 execution,stopEpoch,releaseAuth,now>>

ChangePolicy ==
 / policyVersion' = policyVersion + 1
 / releaseAuth' = [releaseAuth EXCEPT ![o1].valid = FALSE]
 / evidence' = [evidence EXCEPT ![e].state =
 IF evidence[e].state = "VALID" THEN "INVALIDATED" ELSE evidence[e].state]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 graphVersion,dependencyState,recovery,reconciliation,execution,stop,stopEpoch,now>>

CompromiseDependency ==
 / dependencyState[dep1] = "KNOWN"
 / dependencyState' = [dependencyState EXCEPT ![dep1] = "COMPROMISED"]
 / releaseAuth' = [releaseAuth EXCEPT ![o1].valid = FALSE]
 / evidence' = [evidence EXCEPT ![e].state =
 IF evidence[e].state = "VALID" THEN "INVALIDATED" ELSE evidence[e].state]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,recovery,reconciliation,execution,stop,stopEpoch,now>>

RevokeAuthority ==
 / authority' = [authority EXCEPT ![o1] = [epoch |-> @.epoch + 1,valid |-> FALSE]]
 / releaseAuth' = [releaseAuth EXCEPT ![o1].valid = FALSE]
 / evidence' = [evidence EXCEPT ![e].state =
 IF evidence[e].state = "VALID" THEN "INVALIDATED" ELSE evidence[e].state]
 / UNCHANGED <<opState,effectBinding,effectState,admittedEpoch,policyVersion,
 graphVersion,dependencyState,recovery,reconciliation,execution,stop,stopEpoch,now>>

AdvanceTime ==
 / now' = now + 1
 / evidence' = [e in EvidenceIds |->
 IF evidence[e].state = "VALID" /\ evidence[e].freshUntil <= now + 1
 THEN [evidence[e] EXCEPT !.state = "STALE"] ELSE evidence[e]]
 / UNCHANGED <<opState,effectBinding,effectState,authority,admittedEpoch,
 policyVersion,graphVersion,dependencyState,recovery,reconciliation,execution,
 stop,stopEpoch,releaseAuth>>

Next ==
 / Admit
 / AcquireExecution(alice)
 / AcquireExecution(bob)
 / StartExecution
 / MarkUnknown
 / AcquireReconciliation(alice)
 / AcquireReconciliation(bob)
 / Observe(ev1)
 / Observe(ev2)
 / VerifyEvidence(ev1)
 / VerifyEvidence(ev2)
 / ReconcileApplied(ev1)
 / ReconcileApplied(ev2)
 / VerifyOperation(ev1)
 / VerifyOperation(ev2)
 / AcquireRecovery(alice)
 / AcquireRecovery(bob)
 / AuthorizeRelease
 / Commit
 / RequestStop
 / EnforceStop
 / VerifyStop
 / ChangePolicy
 / CompromiseDependency
 / RevokeAuthority
 / AdvanceTime

Spec == Init /\ [][Next]_vars
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

NoCommitWithoutAuthorization == opState[o1] = "COMMITTED" => releaseAuth[o1].valid = FALSE
NoReleaseAfterStop == stop[o1] # "NORMAL" => ~releaseAuth[o1].valid
ExactEvidenceBinding == A e in EvidenceIds: evidence[e].state = "VALID" => evidence[e].operation = o1 /\ evidence[e].effect = fx1 /\ evidence[e].target = t1 /\ evidence[e].targetFp = "fp1"
RecoveryReconciliationMutualExclusion == ~(recovery[o1].state = "HELD" /\ reconciliation[o1].state = "HELD")
UnknownEffectNotApplied == effectState[fx1] = "UNKNOWN" => opState[o1] = "EXTERNAL_UNKNOWN"
StaleEvidenceBlocksRelease == (A e in EvidenceIds: evidence[e].state # "VALID" / evidence[e].freshUntil <= now) => ~ReleaseEligible
=============================================================================