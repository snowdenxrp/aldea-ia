# NEXO AB23 — P_AA SEMANTIC KERNEL PREDICATES AND PROTOCOL-INDEPENDENT ATTACK RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External methodology cross-check

Lamport's TLA+ refinement material defines implementation under a refinement mapping; his auxiliary-variable material explains that history variables may be introduced to enable such mappings. TLA+ specifications use an initial-state predicate and a next-state relation. This supports defining a protocol-independent abstract safety kernel first, then deriving concrete protocol refinements.

Abstract interpretation literature reinforces that an abstract domain is a summary of concrete executions and that transfer functions must be designed for the properties the abstraction is intended to preserve. Therefore each P_AA predicate below is claim-scoped rather than treated as universally semantic.

## 2. Protocol-independent P_AA kernel

Define the admission claim:

P_AA == forall e,t :
  Admit(e,t) =>
    exists a,b :
      AuthorityValid(a,t)
      AND CompleteBinding(b,e,a,t)
      AND PolicyCompatible(a,b,t)
      AND DelegationValid(a,b,t)
      AND IncarnationCompatible(a,b,e,t)
      AND AdmissionProtocolValid(b,e,t)

Boundary B0 is fixed by the claim/model and is therefore an assumption/parameter, not dynamic AA_Norm state in this first model.

External provider success/effect is outside P_AA.

## 3. AuthorityValid

Candidate:

AuthorityValid(a,t) :=
  HistoricallyIssued(a)
  AND EpochCurrent(a,t)
  AND NOT Revoked(a,t)
  AND DelegationChainValid(a,t)
  AND ResourceIncarnationCurrent(a,t)
  AND CapabilityScopeValid(a,t)
  AND AuthorityBoundaryAllowed(a,B0).

Important:
- epoch advancement alone does not grant authority;
- a valid historical authorization can become invalid current authorization;
- current authority does not erase historical validity;
- capability equality does not imply authority equality.

## 4. CompleteBinding

Candidate:

CompleteBinding(b,e,a,t) :=
  SubjectMatch(b,e,a)
  AND OperationMatch(b,e)
  AND AttemptMatch(b,e)
  AND ResourceMatch(b,e,a)
  AND IncarnationMatch(b,e,a)
  AND CapabilityScopeMatch(b,e,a)
  AND AuthorityEpochMatch(b,a,t)
  AND PolicyContextMatch(b,a,t)
  AND DelegationContextMatch(b,a,t)
  AND BoundaryMatch(b,e,a,B0).

This is deliberately a conjunction over the complete relational tuple.

Pairwise validity is not sufficient.

## 5. PolicyCompatible

Candidate:

PolicyCompatible(a,b,t) means that the policy context under which the admission is authorized is compatible with the current policy semantics required by P_AA at admission.

No ordering assumption is made:
policy_version_newer does not imply compatible.

Compatibility may be directional.

A policy transition can therefore invalidate a previously valid bridge without changing the bridge's syntactic identity.

## 6. DelegationValid

Candidate:

DelegationValid(a,b,t) means every delegation edge required to derive the authority represented by a is valid at the claim's authorization point and remains compatible with the binding represented by b.

A capability/scope string cannot replace delegation semantics.

Revoking a delegation can invalidate an otherwise unchanged capability.

## 7. IncarnationCompatible

Candidate:

IncarnationCompatible(a,b,e,t) :=
  ResourceIdMatches
  AND ResourceIncarnationMatches
  AND RequiredIncarnationIsCurrent.

A resource identifier without its incarnation is insufficient when resources can be recreated or replaced.

Reincarnation invalidates bindings tied to the previous generation.

## 8. AdmissionProtocolValid

Protocol-independent semantic interface:

AdmissionProtocolValid(b,e,t) is true only if the selected protocol class establishes that the authorization facts represented by a and b are valid at the admission linearization point.

Protocol classes:

ATOMIC:
  authorization and admission are one atomic semantic step.

LEASE:
  a complete bound lease/fence remains valid through admission.

RECHECK:
  required authorization facts are re-evaluated at admission.

The protocol implementation may differ, but none may omit a P_AA-relevant condition.

## 9. New kernel attacks

CM-AA95 — authority without binding:
valid authority exists but binding tuple does not match; admission must fail.

CM-AA96 — complete binding without current authority:
all tuple fields match, but current authority is revoked; admission must fail.

CM-AA97 — compatible policy claim with incompatible current policy:
historical policy context matches but current compatibility fails.

CM-AA98 — valid delegation snapshot with current delegation revocation:
historical delegation was valid, current delegation is not.

CM-AA99 — same resource ID, wrong incarnation:
all scalar identity fields appear correct except generation.

CM-AA100 — fresh lease, stale authority:
lease freshness passes but AuthorityValid fails.

CM-AA101 — valid authority, stale lease:
authority passes but selected LEASE protocol validity fails.

CM-AA102 — recheck omission:
RECHECK implementation omits one P_AA predicate and admits incorrectly.

CM-AA103 — atomicity forgery:
implementation claims ATOMIC but allows an observable relevant revocation between authorization and admission.

CM-AA104 — protocol-dependent semantics:
same semantic context produces different P_AA result solely because protocol class changed. This is forbidden unless the claim explicitly parameterizes that assumption.

CM-AA105 — boundary substitution:
an otherwise valid binding crosses the fixed B0 claim boundary. It must fail.

CM-AA106 — composite binding alias:
all individual fields are valid in isolation but the jointly assembled tuple was never authorized.

## 10. Kernel completeness obligation

The predicate list is not yet proven complete.

Required test:

For every omitted concrete distinction d, construct two histories h1,h2 identical in all kernel inputs but differing in d.

If there exists a future allowed continuation where P_AA differs, d is claim-relevant and must be:
- represented in the abstract state,
- represented in auxiliary history sufficient for refinement,
- or explicitly classified as UNKNOWN/PENDING.

This turns “minimality” into a countermodel-driven obligation rather than an intuition.

## 11. Reduced product implication

The six AA_Norm components are not assumed independent.

Cross-component constraints include:
- authority ↔ incarnation;
- authority ↔ delegation;
- authority ↔ policy;
- lease ↔ authority;
- lease ↔ policy;
- lease ↔ delegation;
- lease ↔ incarnation;
- admission binding ↔ every identity dimension.

Therefore the first formal model should treat AA_Norm as a relational/reduced product, not as six unrelated variables.

## 12. Refinement mapping

Candidate:

M_AA(c,h) =
  (
    AuthorityConsequences(c,h),
    ResourceIncarnation(c,h),
    PolicyConsequences(c,h),
    DelegationConsequences(c,h),
    ReducedFenceLeaseContext(c,h),
    AdmissionBindingClass(c,h)
  )

A concrete transition may map to:
- a corresponding abstract transition;
- a permitted stuttering step;
- or an explicitly represented UNKNOWN/PENDING state where the abstraction lacks sufficient information.

It must never map a concrete denied state to an abstract authorized state.

## 13. History support

Candidate minimum history categories remain:
authority issuance/revocation;
epoch changes;
delegation changes;
policy changes;
resource incarnation changes;
lease issuance/expiry/replay;
attempt creation/retry;
admission temporal position.

Not all must be stored as raw events. The question is whether the mapping can reconstruct every distinction required by future P_AA behavior.

## 14. Protocol matrix

| Predicate | ATOMIC | LEASE | RECHECK |
|---|---|---|---|
| AuthorityValid | required | required | required |
| CompleteBinding | required | required | required |
| PolicyCompatible | required | required | required |
| DelegationValid | required | required | required |
| IncarnationCompatible | required | required | required |
| Protocol validity | atomic point | valid bound lease | admission recheck |
| External success | outside claim | outside claim | outside claim |

This matrix is semantic, not an implementation guarantee.

## 15. Candidate finite domain

Subjects 2; Operations 2; Attempts 2; Resources 2; Incarnations 2; Epochs 2; Policies 2; Delegations 2; Leases 2; Capabilities/scopes 2; temporal positions 3; fixed B0.

No completeness or symmetry theorem has been established for these bounds.

## 16. AB23 result

The protocol-independent kernel is now explicitly defined.

The six-component AA_Norm remains the active abstraction candidate.

CM-AA95..106 attack every kernel predicate and the cross-product relationships.

The kernel has NOT been proven complete.

## 17. AB24 frontier

1. Attack every kernel predicate with transition-level traces, not only static states.
2. Derive the exact abstract Next relation from these predicates.
3. Test whether any omitted distinction can produce a future split.
4. Formalize the quotient condition over kernel states plus auxiliary history.
5. Only after that draft the first TLA+ module.
