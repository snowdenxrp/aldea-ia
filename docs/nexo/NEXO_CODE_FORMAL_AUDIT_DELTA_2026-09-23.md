# NEXO CODE / FORMAL AUDIT DELTA — 2026-09-23

## Scope
Inspected current executable dependency evaluator, its adversarial unit tests, and the current recovery/common-mode TLA+ sketch. This is an audit finding record, not a claim of verification.

## Concrete executable finding
### E-01 — blocking structural findings are not universally tied to admissibility
evaluate_claim() computes admissible from requested assurance versus the heuristic assurance ceiling. A missing dependency or cycle collapses the ceiling to I0. Therefore a caller requesting I0 can potentially receive admissible=true even though the evaluator emitted a BLOCK finding.
The current tests assert admissible=false for the high-assurance base claim when a dependency is missing, but they do not test the I0 case. This is a semantic ambiguity in the executable contract.
Decision: do not patch this locally. Canonical contract must distinguish structural validity, analysis admissibility at assurance, and safety-claim acceptance. Any BLOCK structural error must make structural_valid=false; assurance ceiling is not allowed to turn malformed/incomplete closure into an accepted safety claim.

## Concrete formal findings
### F-01 — worldState remains epistemically over-compressed
The current TLA+ sketch has worldState = {KNOWN, UNKNOWN}. ReconcileWorld(..., KNOWN, ...) directly writes worldState=KNOWN without an evidence record, provenance, freshness, effect identity, target binding, or verification transition.
Conceptual path: reconciliation owner -> ReconcileWorld(KNOWN) -> RevalidateAssurance -> AuthorizeRelease -> Release.
Decision: canonical model must replace this with observation/evidence/verification state. Reconciliation may record evidence; it must not directly establish verified world truth.

### F-02 — release eligibility is still richer than its underlying model
EvaluatorReleaseEligible checks stop/gate/recovery/dependencies/worldState, but does not yet bind exact operation/effect/target, evidence freshness/provenance, policy version, dependency graph version, target fingerprint, or effect identity.
Decision: this sketch cannot become the canonical release model. Its release predicate must eventually be derived from the canonical five-object state.

### F-03 — generation properties are mislabeled as monotonicity
RecoveryGenerationMonotonic and RecoveryGenerationOnlyAdvancesOnAcquire currently assert only recoveryGeneration >= 0.
Decision: replace with transition obligations: acquire implies generation' = generation + 1; non-acquire implies generation' = generation; takeover must use the new generation.

### F-04 — reconciliation evidence survives as an untyped world fact
ExpireReconciliationLease clears ownership and lease but preserves worldState. That is not necessarily wrong; the problem is that the retained value has no explicit freshness/provenance/validity semantics.
Decision: evidence should be durable independently of ownership, but validity must be recomputed against freshness, identity, versions, authority epoch, dependency closure, and invalidation.

### F-05 — duplicated assignments exist in RequestStop
The current RequestStop action contains duplicate primed assignments for reconciliationOwner and reconciliationLeaseValid.
Decision: remove duplicates during canonical rewrite rather than patching the sketch.

### F-06 — formal model and executable evaluator are not semantically equivalent
The TLA+ model uses worldState, recovery/reconciliation leases and a simplified release predicate. Python computes assurance ceilings, correlated components, graph fingerprints and schema findings. The artifacts overlap but are not equivalent.
Decision: correspondence must be derived after canonical state/transition definition. No claim of semantic equivalence.

## Required redesign before implementation
Canonical release admission should consume Operation + EffectBinding + AuthorityContext + EvidenceRecord + ControlLease + DependencyClosure/SafetyClaim + SafetyPlane/TrustContext and derive eligibility through one pure relation. No cached release boolean may bypass this derivation.

## Test obligations created by this audit
1. I0 + missing dependency => structural invalidity must be visible and must not be mistaken for an accepted safety claim.
2. Reconcile observed value without verification => release denied.
3. Correct evidence with stale policy version => release denied or revalidation required.
4. Correct evidence with stale authority epoch => release denied.
5. Evidence for effect A supplied to effect B => denied.
6. Evidence with stale target identity/fingerprint => denied.
7. Lease expiry + still-fresh evidence => ownership changes without asserting effect absence.
8. Lease expiry + stale evidence => release denied.
9. Trust-root compromise after evidence creation => affected evidence invalidated.
10. Dependency graph change after evidence creation => revalidation required.
11. Authority revoke during recovery => stale owner cannot authorize/release.
12. Stop during external UNKNOWN => local execution blocked but external reconciliation remains required.

## Status
Code audit: FINDINGS RECORDED.
Canonical evaluator redesign: NOT IMPLEMENTED.
Canonical TLA+ unification: NOT IMPLEMENTED.
Tests for these new obligations: NOT RUN.
SANY/TLC: NOT RUN.