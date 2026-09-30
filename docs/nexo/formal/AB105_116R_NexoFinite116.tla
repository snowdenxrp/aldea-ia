---- MODULE AB105_116R_NexoFinite116 ----
EXTENDS Naturals, TLC
CONSTANTS Ops, Fingerprints, Subjects, Incarnations, Epochs, Effects, Inputs

StateFields == <<"authority","authorityEpoch","authorityAtAdmission","authorityAtExecution","authorityAtEffect","subject","incarnation","input","admission","freshness","coverage","dependency","operationId","fingerprint","operationSubject","operationIncarnation","operationState","stop","fence","successor","exclusivity","releaseAuthority","releaseFence","releaseExclusivity","releaseRequiredAtomicity","releaseAtomicity","effectOrigin","effectState","effectId","reconstruction","reconciliation","requiredAtomicity","availableAtomicity">>
VARIABLES s

Authority == {"VALID","STALE","UNKNOWN","REVOKED"}
Epoch == {"OLD","CURRENT","FUTURE","NONE"}
Admission == {"NONE","ACCEPTED","STALE","CONFLICTING","UNKNOWN","DUPLICATE"}
Fresh == {"FRESH","STALE","UNKNOWN"}
Coverage == {"SUFFICIENT","PARTIAL","UNKNOWN"}
Dependency == {"INDEPENDENT","CORRELATED","UNKNOWN"}
OperationState == {"NONE","IN_FLIGHT","STOPPING","TERMINAL","UNKNOWN"}
Stop == {"NONE","REQUESTED","ENFORCED","UNKNOWN"}
Fence == {"NONE","ISSUED","ENFORCED","UNKNOWN"}
Successor == {"NONE","PRESENT","RELEASED"}
Exclusivity == {"NOT_ESTABLISHED","BOUNDED","PROVEN","CONFLICT","UNKNOWN"}
EffectOrigin == {"NONE","NEXO_EXECUTED","EXTERNAL_OBSERVED"}
Effect == {"NONE","OBSERVED","UNKNOWN","PARTIAL","ABSENT_UNPROVEN"}
Reconstruction == {"EMPTY","PARTIAL","COMPLETE","CONFLICT","UNKNOWN"}
Reconciliation == {"NONE","REQUIRED","COMPLETE","CONFLICT","UNKNOWN"}
Atomicity == {"ATOMIC","COMPENSATABLE","RECONCILIABLE","UNSUPPORTED"}

Init == s = [authority|->"UNKNOWN", authorityEpoch|->"NONE", authorityAtAdmission|->"UNKNOWN", authorityAtExecution|->"UNKNOWN", authorityAtEffect|->"UNKNOWN", subject|->"NONE", incarnation|->"NONE", input|->"NONE", admission|->"NONE", freshness|->"UNKNOWN", coverage|->"UNKNOWN", dependency|->"UNKNOWN", operationId|->"NONE", fingerprint|->"NONE", operationSubject|->"NONE", operationIncarnation|->"NONE", operationState|->"NONE", stop|->"NONE", fence|->"NONE", successor|->"NONE", exclusivity|->"NOT_ESTABLISHED", releaseAuthority|->"UNKNOWN", releaseFence|->"UNKNOWN", releaseExclusivity|->"UNKNOWN", releaseRequiredAtomicity|->"UNSUPPORTED", releaseAtomicity|->"UNSUPPORTED", effectOrigin|->"NONE", effectState|->"NONE", effectId|->"NONE", reconstruction|->"EMPTY", reconciliation|->"NONE", requiredAtomicity|->"UNSUPPORTED", availableAtomicity|->"UNSUPPORTED"]

EstablishAuthority == /\ s.authority # "VALID" /\ s' = [s EXCEPT !.authority = "VALID", !.authorityEpoch = "CURRENT"]
RevokeAuthority == /\ s.authority = "VALID" /\ s' = [s EXCEPT !.authority = "REVOKED"]

AdmitCurrent(i) == /\ i \in Inputs /\ (s.operationState = "NONE" \/ s.operationState = "TERMINAL") /\ s' = [s EXCEPT !.input = i, !.admission = "ACCEPTED", !.freshness = "FRESH", !.coverage = "SUFFICIENT", !.authorityAtAdmission = s.authority]
AdmitStale(i) == /\ i \in Inputs /\ (s.operationState = "NONE" \/ s.operationState = "TERMINAL") /\ s' = [s EXCEPT !.input = i, !.admission = "STALE", !.freshness = "STALE"]
AdmitConflict(i) == /\ i \in Inputs /\ (s.operationState = "NONE" \/ s.operationState = "TERMINAL") /\ s' = [s EXCEPT !.input = i, !.admission = "CONFLICTING"]

SetContext(sub, inc) == /\ sub \in Subjects /\ inc \in Incarnations /\ (s.operationState = "NONE" \/ s.operationState = "TERMINAL") /\ s' = [s EXCEPT !.subject = sub, !.incarnation = inc, !.admission = "NONE"]

StartOperation(o,f) == /\ o \in Ops /\ f \in Fingerprints /\ s.authority = "VALID" /\ s.authorityEpoch = "CURRENT" /\ s.admission = "ACCEPTED" /\ s.freshness = "FRESH" /\ s.coverage = "SUFFICIENT" /\ s.stop = "NONE" /\ s.fence # "ISSUED" /\ s.operationState = "NONE" /\ (s.operationId = "NONE" \/ o # s.operationId \/ s.incarnation # s.operationIncarnation) /\ s.subject # "NONE" /\ s.incarnation # "NONE" /\ s' = [s EXCEPT !.operationId = o, !.fingerprint = f, !.operationSubject = s.subject, !.operationIncarnation = s.incarnation, !.operationState = "IN_FLIGHT", !.authorityAtExecution = s.authority]
ReplayDuplicate(o,f) == /\ o \in Ops /\ f \in Fingerprints /\ s.operationId = o /\ s.fingerprint = f /\ s.operationId # "NONE" /\ s.subject = s.operationSubject /\ s.incarnation = s.operationIncarnation /\ s' = [s EXCEPT !.admission = "DUPLICATE"]
ReplayConflict(o,f) == /\ o \in Ops /\ f \in Fingerprints /\ s.operationId = o /\ s.fingerprint # f /\ s.operationId # "NONE" /\ s.subject = s.operationSubject /\ s.incarnation = s.operationIncarnation /\ s' = [s EXCEPT !.admission = "CONFLICTING"]

EndOperation == /\ s.operationState = "IN_FLIGHT" /\ s' = [s EXCEPT !.operationState = "TERMINAL"]
RequestStop == /\ s.operationState = "IN_FLIGHT" /\ s.stop = "NONE" /\ s' = [s EXCEPT !.stop = "REQUESTED", !.operationState = "STOPPING"]
EnforceStop == /\ s.stop = "REQUESTED" /\ s' = [s EXCEPT !.stop = "ENFORCED"]
IssueFence == /\ s.fence = "NONE" /\ s' = [s EXCEPT !.fence = "ISSUED"]
EnforceFence == /\ s.fence = "ISSUED" /\ s' = [s EXCEPT !.fence = "ENFORCED"]

ObserveExternal(e) == /\ e \in Effects /\ e # "NONE" /\ s.effectOrigin # "NEXO_EXECUTED" /\ s' = [s EXCEPT !.effectOrigin = "EXTERNAL_OBSERVED", !.effectState = "OBSERVED", !.effectId = e]
ObserveNexo(e) == /\ e \in Effects /\ e # "NONE" /\ s.effectOrigin # "EXTERNAL_OBSERVED" /\ s.operationState = "IN_FLIGHT" /\ s.authorityAtExecution = "VALID" /\ s.authority = "VALID" /\ s.stop # "ENFORCED" /\ s.admission # "DUPLICATE" /\ s.admission # "CONFLICTING" /\ s' = [s EXCEPT !.effectOrigin = "NEXO_EXECUTED", !.effectState = "OBSERVED", !.effectId = e, !.authorityAtEffect = s.authority]
MarkUnknown == /\ s.effectState # "OBSERVED" /\ s' = [s EXCEPT !.effectState = "UNKNOWN"]
ObserveAbsent(e) == /\ e \in Effects /\ e # "NONE" /\ s.effectState = "UNKNOWN" /\ s.coverage = "SUFFICIENT" /\ s' = [s EXCEPT !.effectState = "ABSENT_UNPROVEN", !.effectId = e]
SetCorrelated == s' = [s EXCEPT !.dependency = "CORRELATED"]
SetPartialCoverage == /\ s.reconstruction # "COMPLETE" /\ s' = [s EXCEPT !.coverage = "PARTIAL"]

Recover == /\ s.operationState # "NONE" /\ s' = [s EXCEPT !.reconstruction = "PARTIAL", !.reconciliation = IF s.effectState = "UNKNOWN" THEN "REQUIRED" ELSE s.reconciliation]
CompleteReconstruction == /\ s.reconstruction = "PARTIAL" /\ s.coverage = "SUFFICIENT" /\ s.effectState # "UNKNOWN" /\ s' = [s EXCEPT !.reconstruction = "COMPLETE"]
Reconcile == /\ s.reconciliation = "REQUIRED" /\ s.coverage = "SUFFICIENT" /\ s.effectState # "UNKNOWN" /\ s' = [s EXCEPT !.reconciliation = "COMPLETE"]
Reauthorize == /\ s.reconciliation = "COMPLETE" /\ s.authorityEpoch = "CURRENT" /\ s' = [s EXCEPT !.authority = "VALID"]
ContinueAfterRecovery == /\ s.reconciliation = "COMPLETE" /\ s.authority = "VALID" /\ s.authorityEpoch = "CURRENT" /\ s.effectState # "UNKNOWN" /\ s.operationState = "STOPPING" /\ s' = [s EXCEPT !.operationState = "IN_FLIGHT"]

SetSuccessor == /\ s.successor = "NONE" /\ s' = [s EXCEPT !.successor = "PRESENT"]
ProveExclusivity == /\ s.fence = "ENFORCED" /\ s' = [s EXCEPT !.exclusivity = "PROVEN"]
SetAtomicity(req,avail) == /\ req \in Atomicity /\ avail \in Atomicity /\ s' = [s EXCEPT !.requiredAtomicity = req, !.availableAtomicity = avail]
AtomicitySatisfied == s.requiredAtomicity # "ATOMIC" \/ s.availableAtomicity = "ATOMIC"
ReleaseSuccessor == /\ s.successor = "PRESENT" /\ s.authority = "VALID" /\ s.authorityEpoch = "CURRENT" /\ s.fence = "ENFORCED" /\ s.exclusivity = "PROVEN" /\ s.stop # "ENFORCED" /\ s.reconciliation # "REQUIRED" /\ s.effectState # "UNKNOWN" /\ AtomicitySatisfied /\ s' = [s EXCEPT !.successor = "RELEASED", !.releaseAuthority = s.authority, !.releaseFence = s.fence, !.releaseExclusivity = s.exclusivity, !.releaseRequiredAtomicity = s.requiredAtomicity, !.releaseAtomicity = s.availableAtomicity]

Next == \/ EstablishAuthority \/ RevokeAuthority \/ (\E i \in Inputs : AdmitCurrent(i)) \/ (\E i \in Inputs : AdmitStale(i)) \/ (\E i \in Inputs : AdmitConflict(i)) \/ (\E sub \in Subjects, inc \in Incarnations : SetContext(sub,inc)) \/ (\E o \in Ops, f \in Fingerprints : StartOperation(o,f)) \/ (\E o \in Ops, f \in Fingerprints : ReplayDuplicate(o,f)) \/ (\E o \in Ops, f \in Fingerprints : ReplayConflict(o,f)) \/ EndOperation \/ RequestStop \/ EnforceStop \/ IssueFence \/ EnforceFence \/ (\E e \in Effects : ObserveExternal(e)) \/ (\E e \in Effects : ObserveNexo(e)) \/ MarkUnknown \/ (\E e \in Effects : ObserveAbsent(e)) \/ SetCorrelated \/ SetPartialCoverage \/ Recover \/ CompleteReconstruction \/ Reconcile \/ Reauthorize \/ ContinueAfterRecovery \/ SetSuccessor \/ ProveExclusivity \/ (\E req \in Atomicity, avail \in Atomicity : SetAtomicity(req,avail)) \/ ReleaseSuccessor

TypeOK == /\ s \in [authority:Authority, authorityEpoch:Epoch, authorityAtAdmission:Authority, authorityAtExecution:Authority, authorityAtEffect:Authority, subject:({"NONE"} \cup Subjects), incarnation:({"NONE"} \cup Incarnations), input:({"NONE"} \cup Inputs), admission:Admission, freshness:Fresh, coverage:Coverage, dependency:Dependency, operationId:({"NONE"} \cup Ops), fingerprint:({"NONE"} \cup Fingerprints), operationSubject:({"NONE"} \cup Subjects), operationIncarnation:({"NONE"} \cup Incarnations), operationState:OperationState, stop:Stop, fence:Fence, successor:Successor, exclusivity:Exclusivity, releaseAuthority:Authority, releaseFence:Fence, releaseExclusivity:Exclusivity, releaseRequiredAtomicity:Atomicity, releaseAtomicity:Atomicity, effectOrigin:EffectOrigin, effectState:Effect, effectId:({"NONE"} \cup Effects), reconstruction:Reconstruction, reconciliation:Reconciliation, requiredAtomicity:Atomicity, availableAtomicity:Atomicity]

S1_ExecutionAuthority == s.effectOrigin = "NEXO_EXECUTED" => s.authorityAtExecution = "VALID"
S1_EffectAuthority == s.effectOrigin = "NEXO_EXECUTED" => s.authorityAtEffect = "VALID"
S4_ReleaseRequirements == s.successor = "RELEASED" => /\ s.releaseAuthority = "VALID" /\ s.releaseFence = "ENFORCED" /\ s.releaseExclusivity = "PROVEN"
S7_CompleteNeedsCoverage == s.reconstruction = "COMPLETE" => s.coverage = "SUFFICIENT"
S10_AtomicRequirement == s.successor = "RELEASED" /\ s.releaseRequiredAtomicity = "ATOMIC" => s.releaseAtomicity = "ATOMIC"

====