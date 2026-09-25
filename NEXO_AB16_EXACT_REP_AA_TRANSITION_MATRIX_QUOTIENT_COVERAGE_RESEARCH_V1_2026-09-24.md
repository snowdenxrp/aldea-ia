# NEXO AB16 — EXACT Rep_AA, TRANSITION MATRIX, QUOTIENT COVERAGE AND PENDING-DECISION REDUCTION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No theorem claimed proven.

## 1. External cross-check

Lamport explicitly describes history variables as auxiliary variables used to construct refinement mappings, and notes that refinement can require variables not present in the higher-level observable state. TLA+ refinement is therefore compatible with keeping admission-history support separate from AAState. Cousot's abstraction work treats abstraction/concretization as context-dependent and describes reduced products as a way to combine abstract domains while exchanging observations between components. These sources support the methodology, not Nexo correctness.

## 2. Exact candidate Rep_AA

Let h be a concrete history/context satisfying the chosen environment, boundary and threat assumptions.

Let a be an AA abstract state.

Candidate:

Rep_AA(h,a) iff all of the following hold:

R1 Authority:
a.authority represents the current P_AA-relevant authorization consequences applicable to the subject/resource/incarnation/capability/scope at the relevant position.

R2 Resource:
a.resourceIncarnation equals the concrete incarnation relevant to the admission binding.

R3 Policy:
a.policyContext preserves the policy facts needed to decide compatibility for P_AA.

R4 Delegation:
a.delegationContext preserves the delegation facts needed to decide current validity.

R5 Freshness:
a.fenceContext preserves the required freshness/order/binding facts whenever decision and admission are non-atomic.

R6 Pending bridge:
if the protocol has a non-atomic decision/admission interval, either a.pendingDecision is represented or an equivalent lease/fence relation is reconstructible.

R7 Admission:
a.admissionBindingClass identifies the P_AA-equivalence class of the relevant concrete admission binding.

R8 History support:
any distinction omitted from a but needed to reconstruct R1-R7 is present in declared auxiliary history.

R9 No hidden authority:
no omitted fact may independently increase the authorization consequences represented by a.

R10 Boundary:
the mapping is evaluated under the same Z1->Z3 claim boundary and does not import Z4 external-success semantics.

## 3. Quotient construction

Define:

h1 ~AA h2 iff
Rep_AA(h1,a) and Rep_AA(h2,a) for some a
and every P_AA-relevant allowed continuation preserves identical claim results.

This is intentionally stronger than simple snapshot equality.

A practical candidate representation is therefore a reduced product of claim-relevant components, not an arbitrary tuple compression.

## 4. Transition coverage matrix

| Concrete transition | Required retained/recoverable dimension | Quotient risk |
|---|---|---|
| IssueAuthority | authority, subject, scope/capability | authority amplification |
| RevokeAuthority | authority currentness, time/order | stale authorization |
| AdvanceEpoch | epoch/currentness | epoch alias |
| ChangeDelegation | delegation | unchanged-capability trap |
| ChangePolicy | policy compatibility | policy alias |
| ReincarnateResource | resource incarnation | stale resource binding |
| IssueFence | fence binding/freshness | fence-as-authority |
| ExpireFence | fence freshness/order | stale lease |
| Decide | authority + policy + delegation + fence bridge | decision/admission gap |
| Admit | all admission binding dimensions | wrong binding |
| Retry | operation/attempt | implicit inheritance |
| Abort | no P_AA external-success inference | false no-effect |

## 5. Countermodel coverage CM-AA1..33

The current basis can be partitioned:

Authority/currentness:
CM-AA1, 2, 5, 15, 17

Resource incarnation:
CM-AA3, 12, 20, 23, 27

Capability/scope:
CM-AA4, 5

Fence/lease:
CM-AA6, 14, 21, 26, 30

Policy:
CM-AA7, 19, 22, 29

Operation/attempt:
CM-AA8, 24, 26

History/temporal:
CM-AA9, 11, 12, 20, 25, 33

Reduction/refinement:
CM-AA13, 17, 31, 32, 33

Delegation:
CM-AA16, 18, 28

Boundary:
CM-AA10

This coverage is strong but not exhaustive proof. A single countermodel can cover multiple dimensions, and absence of a countermodel does not establish completeness.

## 6. PendingDecision reduction

PendingDecision can be removed from the abstract state only if:

1. every decision consequence needed by P_AA is represented by a lease/fence object or relation;
2. the lease is bound to subject;
3. resource incarnation is bound;
4. operation and attempt are bound;
5. authority epoch/currentness requirement is bound;
6. policy compatibility is bound;
7. delegation validity is bound;
8. boundary/scope is bound;
9. freshness/expiry is explicit;
10. replay/collision semantics are explicit;
11. admission-time validity can be evaluated;
12. no later transition can change a required authorization consequence without either invalidating the bridge or making the abstract state reflect UNKNOWN/PENDING.

If these hold, PendingDecision is derivable rather than primitive.

If not, retaining PendingDecision is semantically safer.

## 7. Important distinction: decision snapshot vs authority state

Even if PendingDecision disappears, the admission bridge must not become a copy of current AuthorityContext.

A decision can be validly made at t1 while current authority changes at t2. The model must define whether the protocol uses:
- atomic decision/admission,
- a lease/fence validity interval,
- revalidation at admission.

Therefore current authority and admitted authorization remain distinct semantic concepts.

## 8. Finite-domain refinement

Candidate domain basis from AB15 remains:

Subjects=1
Operations=1
Attempts=2
Resources=1
Incarnations=2
Epochs=2
Policies=2
Delegations=2
Fences/leases=2
Capabilities/scopes=2
Temporal positions>=3

New finding:
a separate provider-execution identifier is not required for P_AA because external provider execution is outside the claim boundary. Introducing it into the first model would risk accidentally importing C3/external-success semantics into a C1 authorization claim.

## 9. Symmetry reduction candidates

Subject, operation and resource singleton domains are plausible for the first model only if the claim is not testing cross-entity isolation.

Attempts cannot be singleton because retry distinction is already P_AA-relevant.

Incarnation, epoch, policy, delegation, fence and capability require at least two values because their adversarial pairs are explicitly represented.

Temporal positions need an ordered structure, not merely an unordered finite set.

## 10. New countermodels against proposed finite basis

CM-AA34 — cross-subject lease reuse.
This is not represented with Subjects=1.

CM-AA35 — cross-resource lease reuse.
Not represented with Resources=1.

CM-AA36 — cross-operation lease reuse.
Not represented with Operations=1.

Therefore singleton identity domains are acceptable only if the first model explicitly assumes no cross-entity binding attack.

This does NOT mean those attacks are architecturally irrelevant. It means they are outside the first model's coverage unless domains are expanded.

## 11. Coverage contract for singleton domains

The first finite model must explicitly state:

NO_CROSS_SUBJECT_BINDING_ATTACKS
NO_CROSS_RESOURCE_BINDING_ATTACKS
NO_CROSS_OPERATION_BINDING_ATTACKS

as model assumptions if those domains remain singleton.

Alternatively, expand each domain to 2 and test the binding relations directly.

Architecturally, expanding to 2 is safer for coverage but increases state space. No choice is yet declared final.

## 12. Refined status

AB16-G1 advanced — exact candidate Rep_AA.
AB16-G2 advanced — transition matrix.
AB16-G3 advanced — CM-AA coverage matrix.
AB16-G4 advanced — PendingDecision elimination contract.
AB16-G5 advanced — finite-domain boundary clarified.
AB16-G6 open — exact quotient completeness/minimality.
AB16-G7 open — final domain choice.
AB16-G8 open — TLA+ draft.

## 13. AB17 frontier

1. Attack the quotient with cross-entity binding dimensions.
2. Decide singleton vs two-element identity domains based on claim coverage, not convenience.
3. Derive exact authorization predicate from Rep_AA.
4. Test whether all retained dimensions are independently necessary or whether a reduced-product relation can eliminate another component.
5. Determine whether FenceLeaseContext can replace PendingDecision without hidden currentness errors.
6. Build final finite model coverage matrix.
7. Only then write the first narrow TLA+ specification.
