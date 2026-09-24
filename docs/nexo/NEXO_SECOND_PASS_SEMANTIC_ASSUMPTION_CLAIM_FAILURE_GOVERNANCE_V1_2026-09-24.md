# NEXO SECOND-PASS GAP CLOSURE — SEMANTIC NORMALIZATION, ASSUMPTIONS, CLAIM COMPOSITION, FAILURE COMPOSITION, SELF-VERIFICATION V1 — 2026-09-24

Status: RESEARCH / PRE-CONSTRUCTION GATE
Decision: ARCHITECTURE REMAINS BLOCKED

## 1. Research basis

NIST SP 800-160 Rev. 1 frames trustworthy systems engineering as a lifecycle discipline covering requirements, architecture, implementation, integration, verification, validation, review, risk treatment and stakeholders. It treats trustworthiness as an emergent system property rather than a property of one isolated security mechanism. citeturn0search0turn0search7

NIST's architecture guidance also calls for maintaining traceability of security aspects across architecture and related engineering processes. citeturn0search26

NIST SP 800-53 Rev. 5.1 explicitly treats separation of duties as a system-enforced concern rather than merely an organizational statement. citeturn0search24

This round therefore focuses on four second-order questions:
1. Do our concepts have unique semantics?
2. Can claims compose without hidden assumptions?
3. Can combined failures remain conservative?
4. Can the architecture baseline verify/change itself without self-authorizing?

## 2. Semantic normalization

The current vocabulary contains mechanisms that are related but must not be merged merely for convenience.

### 2.1 Epoch

Canonical meaning:
A version/fence boundary that invalidates previously issued authority or coordination context.

An epoch is NOT:
- a timestamp;
- a lease duration;
- a proof of world state;
- a generic counter with no invalidation semantics.

### 2.2 Generation

Canonical meaning:
A monotonically advancing identifier for a specific ownership/coordination lineage.

Generation is NOT automatically:
- authority;
- global ordering;
- world truth.

### 2.3 Fence

Canonical meaning:
A mechanism by which an older actor/context becomes unable to perform a protected transition.

A fence is therefore an enforcement property, not merely a number.

### 2.4 Lease

Canonical meaning:
A time/ownership coordination mechanism that says which actor may currently coordinate a scoped transition.

Lease validity does NOT prove:
- authority;
- external-world outcome;
- absence of an old effect.

### 2.5 Authority context

Canonical meaning:
The currently valid, scoped authorization basis for a principal to request/perform a protected transition.

Authority is distinct from:
coordination;
world truth;
verification.

### 2.6 Evidence validity

Canonical meaning:
Whether a specific observation remains admissible for a specific claim under its context, freshness, provenance and dependency constraints.

Evidence validity is NOT:
truth in every context;
authority;
proof that the observer is independent.

### 2.7 Trust level

Canonical meaning:
A bounded statement about provenance/authentication/context/validation of a datum.

Trust level is claim-relative and must never silently become authority.

### 2.8 Assurance state

Canonical meaning:
Current system ability to support a defined set of claims under stated evidence/dependency conditions.

Assurance is NOT a safety score.

### 2.9 Claim

Canonical meaning:
A bounded proposition about a defined scope/effect/state, with explicit evidence, assumptions and expiry.

A claim must always identify:
scope, context, evidence set, assumptions, freshness, dependencies, policy/invariant version and invalidation conditions.

### 2.10 VersionSet

Canonical meaning:
The complete safety-relevant compatibility context required for a protected transition.

It includes, where applicable:
runtime;
safety gate;
verifier;
policy;
configuration;
schema;
state-machine semantics;
trust-root version;
dependency graph;
recovery protocol;
formal model context.

An individual component's valid signature does not make the VersionSet valid.

## 3. Canonical distinctions that remain mandatory

AUTHORITY != COORDINATION != WORLD TRUTH

EVIDENCE != CLAIM

CLAIM != ASSURANCE

LEASE != AUTHORITY

GENERATION != FENCE

FENCE != EPOCH

EVENT_TIME != AUTHORITATIVE_ORDER

CHECKPOINT != AUTHORITY

UPDATE AUTHENTICITY != UPDATE AUTHORIZATION

PROVENANCE != TRUTH

VERIFICATION != VALIDATION

LOCAL SUCCESS != WORLD OUTCOME

WORLD OUTCOME != MISSION SUCCESS

These distinctions become architecture-level vocabulary rules.

## 4. Assumption budget

Every safety-relevant assumption receives one class:

A0 — TCB guaranteed.
A1 — architecturally enforced.
A2 — continuously monitored and fail-closed.
A3 — externally supplied/contracted assumption.
A4 — unknown/unverified.

Rules:

- A0/A1 may directly support protected guarantees.
- A2 may support a claim only while monitoring evidence is valid.
- A3 must be explicit in the claim and cannot be silently promoted to internal guarantee.
- A4 cannot support a safety-critical release.
- A change in an assumption's class invalidates affected claims.

Examples:
Trusted storage semantics may be A0/A1 only if actually enforced and verified.
External provider truth is normally A3.
Unknown observer independence is A4.
A4 on a critical dependency forces HOLD/RESTRICT/REVALIDATE rather than normal release.

## 5. Claim-composition contract

Claims compose only when a composition record proves compatibility.

For claims C1..Cn, the composition must compare:

- scope;
- operation/effect identity;
- target;
- authority context;
- policy/invariant version;
- VersionSet;
- dependency closure;
- failure domains;
- trust roots;
- time/freshness;
- linearization point;
- evidence validity;
- invalidation state;
- assumptions;
- observer independence;
- recovery/update state.

Define:

COMPOSABLE(C1...Cn)
iff
all required shared-context predicates hold
AND
no blocking dependency/failure-domain contradiction exists
AND
all claims remain valid at the same decision point.

Otherwise:
COMPOSITION_UNKNOWN / HOLD / REVALIDATE.

Important:
C1.valid ∧ C2.valid does NOT imply COMPOSABLE.

## 6. Claim composition cannot manufacture independence

Two claims from different processes are not independent merely because their process IDs differ.

Independence must be demonstrated against:
hardware;
host;
runtime;
storage;
network;
identity;
trust root;
policy;
dependency;
model/provider;
data;
administrator;
observer;
clock;
coordination;
recovery.

If a required independence relation collapses, assurance is reduced according to the claim contract.

## 7. Claim composition cannot manufacture freshness

A fresh claim about A does not refresh an old claim about B.

Every composed claim retains the minimum applicable freshness boundary unless an explicit transformation/revalidation establishes a new one.

## 8. Claim composition cannot manufacture world truth

Internal authorization + successful local execution + internal log
does not automatically equal:
EXTERNAL_EFFECT_VERIFIED.

External effect verification requires the exact external effect identity and appropriate observation/reconciliation evidence.

## 9. Failure-composition contract

Failure handling must classify combinations by their effect on protected claims.

Canonical combined-failure classes:

F0 — independent benign degradation.
F1 — combined uncertainty.
F2 — safety-context conflict.
F3 — authority ambiguity.
F4 — external-effect ambiguity.
F5 — evidence integrity loss.
F6 — common-mode collapse.
F7 — recovery integrity loss.

Rules:

- Any combination that can grant stale authority → HOLD/RESTRICT.
- Any combination that can erase UNKNOWN → UNKNOWN/HOLD.
- Any combination that can bypass STOP → STOP/HOLD.
- Any combination that can resurrect authority from old state → QUARANTINE.
- Any combination that invalidates required evidence → REVALIDATE.
- Any combination whose failure-domain independence assumption collapses → ASSURANCE_DEGRADED or stronger claim-specific response.

## 10. Pairwise analysis is not sufficient

The architecture must identify combinations that are safety-critical because their effects interact.

Mandatory composed scenarios:

1. STOP + partition + stale actor
2. UPDATE + crash + storage rollback
3. RECOVERY + UNKNOWN + observer loss
4. DECOMMISSION + delayed message + snapshot restore
5. TRUST-ROOT rollover + evidence invalidation + recovery
6. POLICY change + verification race + cached evidence
7. LEASE expiry + network partition + delayed command
8. RESOURCE exhaustion + emergency stop
9. MIGRATION + concurrent write + rollback
10. COMMON-MODE failure + independent-verifier claim.

The architecture does not need exhaustive enumeration of every combinatorial failure, but it must define a compositional rule and identify a bounded high-risk set for formal/model checking and fault injection.

## 11. Architecture self-verification

The architecture baseline is itself a controlled artifact.

Define roles:

ARCHITECTURE_AUTHOR
ARCHITECTURE_REVIEWER
FORMAL_VERIFIER
IMPLEMENTATION_VERIFIER
CHANGE_AUTHORITY
SAFETY_AUTHORITY
TRUST_AUTHORITY.

No single ordinary runtime component receives all of these powers.

A verifier may report:
PASS / FAIL / INCONCLUSIVE / STALE.

A verifier must not:
rewrite the invariant;
change the claim definition;
alter the trust root;
suppress a failed result;
promote stale evidence;
modify the architecture baseline merely to make its own result pass.

## 12. Architecture change transaction

Canonical lifecycle:

PROPOSE_CHANGE
→ CLASSIFY_CHANGE
→ IDENTIFY_AFFECTED_CLAIMS
→ IDENTIFY_AFFECTED_INVARIANTS
→ IDENTIFY_AFFECTED_FORMAL_MODELS
→ IDENTIFY_AFFECTED_REFINEMENT_MAPPINGS
→ IDENTIFY_AFFECTED_TESTS/EVIDENCE
→ INDEPENDENT_REVIEW
→ VERIFY
→ AUTHORIZE
→ STAGE
→ ACTIVATE
→ REBASELINE
→ REVERIFY.

Safety-semantic changes cannot use a lightweight configuration path.

## 13. Change classes

C0 — cosmetic/non-semantic.
C1 — operational parameter.
C2 — behavior/configuration.
C3 — safety/policy semantic.
C4 — authority/trust-root semantic.
C5 — formal-model/evidence semantic.

C3–C5 require stronger review and re-verification.

A formal-model change that weakens an invariant is not “just a documentation update.”

## 14. Architecture baseline integrity

The baseline must have:
baseline_id;
parent_baseline;
content fingerprint;
dependency fingerprint;
formal-model fingerprint;
requirements fingerprint;
verification evidence set;
assumption set;
approval/change authority;
activation time/order;
superseded claims;
expiry/review status.

The baseline itself cannot be considered verified merely because it is signed.

## 15. Verification criteria cannot self-weaken

A critical meta-invariant:

**A change cannot become valid merely by changing the definition of validity used to evaluate that change.**

Changing verification criteria must itself be classified as a safety-semantic change.

## 16. Semantic duplication audit result

Current concepts can be normalized as follows:

- authority_epoch = authority invalidation boundary;
- coordination_epoch/generation = coordination lineage; only one canonical mechanism should survive implementation;
- recovery_epoch = recovery-fence lineage, not authority;
- gate_epoch = safety-gate lineage if independently necessary; otherwise derived from VersionSet/fence context;
- lease_generation = coordination ownership lineage;
- claim_validity = derived from evidence/context;
- assurance_state = derived from current claim/dependency support;
- evidence_trust_level = evidence provenance/validation dimension.

Before architecture design, the exact minimum representation must be chosen. Redundant counters are prohibited unless each has a distinct invariant and owner.

## 17. New architecture invariants

META-01: architecture verification criteria cannot be weakened by the subject being verified.

META-02: verifier output cannot modify the rules that determine its own authority.

META-03: a valid claim cannot be composed with an incompatible-context claim to create a valid composite claim.

META-04: claim composition preserves exact effect identity and scope.

META-05: claim composition cannot manufacture independence.

META-06: claim composition cannot manufacture freshness.

META-07: claim composition cannot manufacture external-world truth.

META-08: A4 assumptions cannot support safety-critical release.

META-09: context changes invalidate affected claims.

META-10: safety-semantic architecture changes require re-verification.

META-11: changing verification criteria is itself a governed semantic change.

META-12: redundant safety state is prohibited unless it has unique semantics, owner and verification obligation.

META-13: failure composition cannot convert UNKNOWN into NOT_APPLIED without valid external evidence.

META-14: failure composition cannot clear STOP without the defined release authority.

META-15: recovery cannot resurrect decommissioned authority.

META-16: no baseline may declare itself verified solely through its own mutable runtime state.

## 18. Result of this second-order pass

The previous 50-gap sweep is now materially reduced conceptually.

The four major second-order gaps are no longer undefined:
- semantic vocabulary is normalized;
- assumptions have classes;
- claim composition has a contract;
- failure composition has a conservative rule;
- architecture self-verification has a governed lifecycle.

However, these are DESIGNATED/RESEARCH-CLOSED semantics, not implementation verification.

Still OPEN:
- exact authoritative-store topology;
- exact cross-store transaction/serialization mechanism;
- trusted time implementation;
- external reconciliation implementation;
- negative evidence formalization;
- large-scale evidence invalidation;
- resource exhaustion protocol;
- delegation implementation semantics;
- TCB compromise behavior;
- actual SANY/TLC execution;
- runtime refinement tests;
- fault injection;
- migration;
- long-duration rollover;
- final semantic-minimum reduction.

## 19. Mandatory next pass

Now the next audit should be different:

**RE-AUDIT V1–V20 AGAINST THIS NORMALIZED VOCABULARY.**

For every historical mechanism:
- identify old term;
- map to canonical term;
- identify whether semantics changed;
- identify hidden coupling;
- reclassify CARRY_FORWARD / REWORK / REJECTED / HISTORICAL_ONLY / OPEN;
- identify affected invariants;
- identify evidence obligations;
- identify whether any historical PASS is invalidated by the new semantics.

Only after this reconciliation can the architecture requirements be frozen.

## 20. Gate

Architecture: BLOCKED.
V1–V20 reconciliation: REQUIRED.
Clean architecture design: NOT STARTED.
Implementation: BLOCKED.

The purpose is deliberate: the future architecture must be a derivation from the reconciled semantic baseline, not a fresh interpretation of old patches.
