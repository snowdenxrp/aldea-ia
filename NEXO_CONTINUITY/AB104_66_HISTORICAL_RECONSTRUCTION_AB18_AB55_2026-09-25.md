# AB104.66 — HISTORICAL RECONSTRUCTION AB18→AB55 — 2026-09-25

Status: CANONICAL RESEARCH AUDIT / ADDITIVE. No protocol semantics promoted.

## Purpose
Reconstruct the semantic chain from the earliest recovered relational/lease work through AB55 to identify any historical evidence that can legitimately close current UNKNOWN states.

## Reconstructed chain

### AB18 — relational foundation
Commit: 321fc62a8e648809702f2747a89755208f6d9227
- Binding_PAA is one joint relational predicate, not independent booleans.
- Candidate LeaseBridge includes AttemptBinding, FreshnessValidity, ReplayBinding and TemporalValidity.
- Completeness is adversarial: omitted information is safe only if no concrete pair can differ in P_AA.
- No formal completeness proof or executable transition law.

### AB25 — history/linkage foundation
Commit: 8de08f7b61ec11da21638ff3988dee23ea51b553
- UsedAdmissionContext is historical evidence of actual linkage, not validity.
- Six-part action contract: Pre, Post, Frame, Invalidation, HistorySupport, AdmissionLink.
- LeaseIssue and LeaseExpire are described; Retry inheritance remains protocol-dependent.
- Hidden-history CM-AA132 explicitly identifies prior lease consumption/replay as potentially claim-relevant.
- History may be removed only if every allowed future continuation preserves P_AA, or the abstraction safely returns UNKNOWN/PENDING.

### AB26 — transition/quotient refinement
Commit: 9785992bac45988413838aace8ea835fa7c1389e
- LeaseExpire is explicit.
- No complete LeaseRenew/LeaseConsume transition law is recovered.
- LeaseBridge vs AdmissionBindingClass cannot be merged without future-behavioral equivalence.
- Temporal ordering remains open.

### AB49 — HistorySupport vocabulary
Commit: b4dfd5553826073a3099f7e2b8ad11327b6a1781
- Lease interval, expiry, renewal, consumption and replay are explicitly allowed HistorySupport primitives.
- Lease separator includes renewal semantics, replay/consumption, invalidation, bridge-to-admission linkage and renewal authority.
- This establishes these as legitimate semantic dimensions, NOT as complete transition laws.
- No semantic freeze.

### AB50/AB51/AB52 — ternary mathematics vs protocol semantics
AB50 and AB51 establish bounded transition/collision methodology and ternary joint-separator research.
AB52's bounded mathematical/projection search found no residual under its instantiated closures, but this was conditional on complete legal transition semantics.
The structural count (286 triples × 19 partial orders × 3 protocols = 16,302 skeletons) is not concrete protocol-state exhaustiveness.

### AB53 — conservative correction
Commit: a229d37985e67881f32799938353e1cb339b3a90
- Restores UNKNOWN_DUE_TO_MISSING_SEMANTICS.
- Explicitly leaves C2 legality, C3 complete post-state/successor law and C6 exhaustive successor domain unresolved.
- Requires an explicit transition-semantics matrix before protocol-level closure.

### AB54 — normalized matrix
Commit: ee3704e24e746116e049770944feeb308e2a5737
- Canonical action schema becomes <Pre, ReadSet, Post/Mutation, Frame, Invalidation, HistorySupport, AdmissionLink, Observation, UnknownCondition>.
- LEASE_RENEW reads lease/expiry/renewal authority/current authority-policy-delegation-incarnation/bridge; mutation is described only as extend/replace validity "according to protocol"; exact successor validity remains unspecified.
- LEASE_CONSUME reads lease/replay-consumption/admission-attempt binding; mutation is "consume/mark replay state"; future reuse may become invalid.
- AB54 explicitly says the executable-state gap remains and TERNARY_PROTOCOL_RESIDUAL remains UNKNOWN.
- Exact next experiment is an interpreter that must return UNKNOWN rather than inventing missing legal successors.

### AB55 — finite interpreter
Source commit: d11479da99e93e463adefcae9cadfbdc7dfecb4d
Record commit: 51496bdd0d5237b540d6093d359df646b2d90cb2
- Eight ternary attacks executed over a bounded domain.
- LEASE_RENEW correctly propagates UNKNOWN because AB54 lacks exact successor validity.
- RETRY and MUTATION also propagate UNKNOWN.
- Critical discrepancy: LEASE_CONSUME concretely sets lease_valid=False in the interpreter, although AB54 only specifies "consume/mark replay state" and says future reuse "may" become invalid. AB54 does NOT establish that consumption is equivalent to lease invalidation.
- Therefore that mutation is a research assumption/instrumentation choice, not canonical protocol law.
- Result record itself remains conservative and does not claim proof.

## Historical conclusion

The full recovered chain strengthens, rather than weakens, the current epistemic boundary.

No recovered artifact from AB18→AB55 supplies a complete executable LEASE_RENEW successor law or a complete LEASE_CONSUME successor/history law.

The strongest new actionable finding is the AB55 LEASE_CONSUME mutation discrepancy:
AB55's code contains a concrete mutation (lease_valid=False) that is stronger than AB54's documented semantics. It must not be used to close LEASE_CONSUME UNKNOWN.

No concrete P_AA collision is established.
No ternary protocol sufficiency is established.
No HistorySupport elimination is established.
No LeaseBridge/AdmissionBindingClass merge is established.
AB65 execution remains NOT_VERIFIED.

## Recovery boundary

AB36/AB38 remain unrecovered through the available commit-search route. AB79 explicitly records that this is route-specific negative evidence, not proof of nonexistence.

## Exact next action

Use the historical chain as the canonical semantic baseline. Do not repeat broad lexical searches already exhausted.

Next productive target:
1. inspect AB54/AB55 lineage for any later artifact that explicitly repairs LEASE_CONSUME or LEASE_RENEW;
2. if none, construct a minimal paired-history test showing why lease_valid=False cannot be promoted without an explicit law;
3. separately recover any AB36/AB38 material through a genuinely different canonical path if available.

DO-NOT-REPEAT:
- do not treat AB55's lease_valid=False as canonical;
- do not infer renewal/consumption semantics from field names;
- do not convert AB52's conditional bounded result into protocol proof;
- do not use workflow-run absence from the current connector as proof AB65 never executed.
