# NEXO AB21 — P_AA ABSTRACT NEXT AND HISTORY RESEARCH V1 — 2026-09-24

Status: research only; no implementation, TLA+ execution, TLC execution, or formal proof.

## Core finding

Separate the claim semantics from the concrete admission protocol.

Define:
AuthAtAdmission(e,t) := exists a,b : AuthorityValid(a,t) AND CompleteBinding(b,e,a,t) AND AdmissionProtocolValid(b,e,t).

Then P_AA is the admission-safety claim over AuthAtAdmission. L1 atomic check, L2 lease/fence interval, and L3 admission recheck are protocol classes that must refine this semantic predicate; they are not different claims.

## Abstract state candidate

AA_Norm =
AuthorityConsequences,
ResourceIncarnation,
PolicyConsequences,
DelegationConsequences,
ReducedFenceLeaseContext,
AdmissionBindingClass.

The first model keeps the Z1-to-Z3 claim boundary fixed (B0). A dynamic boundary is a separate extension and is not implied by B0.

## Abstract actions

IssueAuthority: changes authority consequences; does not itself admit.

RevokeAuthority: invalidates current authority as modeled; does not erase historical admission validity.

AdvanceEpoch: changes currentness; grants no authority.

ChangeDelegation: changes delegation validity and invalidates incompatible bridges.

ChangePolicy: changes policy compatibility and invalidates incompatible bridges.

ReincarnateResource: changes incarnation and invalidates bindings to the old incarnation.

IssueLease: requires valid authority and complete bindings; creates freshness/binding state but not authority.

ExpireLease: invalidates bridge freshness but does not itself revoke authority.

CreateAttempt/Retry: creates explicit attempt binding; retry does not silently inherit authorization.

Admit: requires current authority, matching incarnation, compatible policy/delegation, complete joint binding, and the chosen admission protocol semantics.

Abort: ends the internal path; it makes no claim about external effect.

Stutter: allowed only when the abstract claim state is unchanged.

## Concrete history vocabulary

AuthorityEvent, PolicyEvent, DelegationEvent, ResourceEvent, LeaseEvent, AttemptEvent, and AdmissionEvent are candidate history records. Their exact encoding remains open.

History is auxiliary unless changing it can change a future P_AA result while the proposed abstract state is unchanged.

## Refinement mapping

M_AA(implementation_state, auxiliary_history) = Normalize_PAA(...)

Required properties:
- no authority amplification;
- currentness preserved;
- resource incarnation preserved;
- policy and delegation compatibility preserved;
- relational binding preserved;
- freshness/replay semantics preserved;
- relevant history remains recoverable;
- Z4 provider outcomes remain outside this claim.

## New temporal countermodels

CM-AA69 revoke/admit ordering.
CM-AA70 policy/admit ordering.
CM-AA71 incarnation/admit ordering.
CM-AA72 delegation/admit ordering.
CM-AA73 epoch/admit ordering.
CM-AA74 lease-expiry/admit ordering.

These require an explicit admission authorization point.

## Remaining open proof obligation

Quotient completeness:

If two concrete histories map to the same AA_Norm state, every allowed future P_AA-relevant continuation must yield the same claim result, unless the abstraction explicitly returns UNKNOWN/PENDING.

This remains unproven.

## Candidate finite model

Subjects 2; operations 2; attempts 2; resources 2; incarnations 2; epochs 2; policies 2; delegations 2; leases 2; capabilities/scopes 2; temporal positions 3; fixed boundary B0.

## AB22 frontier

Attack protocol-parameter separation; define AuthorityValid, CompleteBinding and AdmissionProtocolValid; attack reduction of ReducedFenceLeaseContext; attack separation of AdmissionBindingClass from lease history; establish or refute transition stability; only then draft TLA+.
