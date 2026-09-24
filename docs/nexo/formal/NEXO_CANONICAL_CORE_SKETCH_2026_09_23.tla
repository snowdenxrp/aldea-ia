---------------- MODULE NEXO_CANONICAL_CORE_SKETCH_2026_09_23 ----------------
EXTENDS Naturals, FiniteSets, Sequences

CONSTANTS
  Operations, Effects, Targets, Authorities, Policies, DependencyVersions,
  Owners, EvidenceIds, TrustRoots

OpStates == {"PROPOSED","NORMALIZED","FINGERPRINTED","ADMITTED","AUTHORIZED",
             "RESERVED","PREPARED","EXECUTING","EXTERNAL_UNKNOWN",
             "PARTIALLY_APPLIED","APPLIED","OBSERVED","RECONCILED",
             "VERIFIED","COMMITTED","STOPPED","QUARANTINED"}

EffectStates == {"UNSEEN","REQUESTED","UNKNOWN","PARTIAL","APPLIED",
                 "REVERSED","CANCELLED"}

EvidenceStates == {"ABSENT","OBSERVED","VALID","INVALIDATED","STALE"}

LeaseKinds == {"NONE","EXECUTION","RECOVERY","RECONCILIATION"}

DepStates == {"KNOWN","UNKNOWN","COMPROMISED","STALE","INVALIDATED"}

VARIABLES
  opState, effectBinding, authorityCtx, evidence, lease, dependencyState,
  policyVersion, dependencyGraphVersion, trustRootState,
  stopEpoch, authorityEpoch, recoveryGeneration, reconciliationGeneration

vars == <<opState,effectBinding,authorityCtx,evidence,lease,dependencyState,
           policyVersion,dependencyGraphVersion,trustRootState,stopEpoch,
           authorityEpoch,recoveryGeneration,reconciliationGeneration>>

EffectBindingInvariant(o) ==
  o in Operations =>
    effectBinding[o] in Effects / EffectTarget[o] in Targets

ExactEvidence(e,o) ==
  e.operation = o /\
  e.effect = effectBinding[o] /\
  e.target = EffectTarget[o] /\
  e.authorityEpoch = authorityCtx[o].epoch /\
  e.policyVersion = policyVersion /\
  e.dependencyGraphVersion = dependencyGraphVersion /\
  e.state = "VALID"

DependenciesAdmissible(o) ==
  A d in RequiredDependencies[o]:
    dependencyState[d] = "KNOWN" / trustRootState[d] # "COMPROMISED"

EvidenceAdmissible(o) ==
  E e in EvidenceIds:
    evidence[e].state = "VALID" /\
    ExactEvidence(e,o) /\
    evidence[e].fresh = TRUE /\
    evidence[e].provenanceValid = TRUE

ReleaseEligible(o) ==
  o in Operations /\
  opState[o] = "VERIFIED" /\
  authorityCtx[o].valid = TRUE /\
  authorityCtx[o].epoch = authorityEpoch /\
  stopEpoch = authorityCtx[o].stopEpoch /\
  lease[o].kind = "RECOVERY" /\
  lease[o].valid = TRUE /\
  lease[o].owner # NULL /\
  lease[o].generation = recoveryGeneration /\
  EvidenceAdmissible(o) /\
  DependenciesAdmissible(o)

Init ==
  / opState = [o in Operations |-> "PROPOSED"]
  / stopEpoch = 0
  / authorityEpoch = 0
  / recoveryGeneration = 0
  / reconciliationGeneration = 0
  / UNCHANGED <<effectBinding,authorityCtx,evidence,lease,dependencyState,
                 policyVersion,dependencyGraphVersion,trustRootState>>

AcquireRecovery(o, owner) ==
  / o in Operations / owner in Owners
  / lease[o].kind = "NONE" / lease[o].valid = FALSE
  / lease[o].kind # "RECONCILIATION"
  / lease' = [lease EXCEPT ![o] = [kind |-> "RECOVERY", owner |-> owner,
                                      valid |-> TRUE,
                                      generation |-> @.generation + 1]]
  / recoveryGeneration' = recoveryGeneration + 1
  / UNCHANGED <<opState,effectBinding,authorityCtx,evidence,policyVersion,
                 dependencyGraphVersion,dependencyState,trustRootState,
                 stopEpoch,authorityEpoch,reconciliationGeneration>>

RecordObservation(o,eid,owner,generation) ==
  / lease[o].kind = "RECONCILIATION" / lease[o].valid
  / lease[o].owner = owner / lease[o].generation = generation
  / evidence' = [evidence EXCEPT ![eid] = [operation |-> o,
      effect |-> effectBinding[o], target |-> EffectTarget[o],
      authorityEpoch |-> authorityCtx[o].epoch,
      policyVersion |-> policyVersion,
      dependencyGraphVersion |-> dependencyGraphVersion,
      state |-> "OBSERVED", fresh |-> TRUE,
      provenanceValid |-> TRUE]]
  / UNCHANGED <<opState,effectBinding,authorityCtx,lease,dependencyState,
                 policyVersion,dependencyGraphVersion,trustRootState,
                 stopEpoch,authorityEpoch,recoveryGeneration,
                 reconciliationGeneration>>

VerifyEvidence(o,eid) ==
  / evidence[eid].state = "OBSERVED"
  / ExactEvidence(eid,o)
  / evidence' = [evidence EXCEPT ![eid].state = "VALID"]
  / UNCHANGED <<opState,effectBinding,authorityCtx,lease,dependencyState,
                 policyVersion,dependencyGraphVersion,trustRootState,
                 stopEpoch,authorityEpoch,recoveryGeneration,
                 reconciliationGeneration>>

InvalidateEvidence(o) ==
  / evidence' = [evidence EXCEPT ![e].state = "INVALIDATED" :> e.operation = o]
  / UNCHANGED <<opState,effectBinding,authorityCtx,lease,dependencyState,
                 policyVersion,dependencyGraphVersion,trustRootState,
                 stopEpoch,authorityEpoch,recoveryGeneration,
                 reconciliationGeneration>>

TypeOK ==
  / opState in [Operations -> OpStates]
  / dependencyState in [DependencyVersions -> DepStates]
  / stopEpoch in Nat / authorityEpoch in Nat
  / recoveryGeneration in Nat / reconciliationGeneration in Nat

THEOREM TypeOK => TypeOK
=============================================================================