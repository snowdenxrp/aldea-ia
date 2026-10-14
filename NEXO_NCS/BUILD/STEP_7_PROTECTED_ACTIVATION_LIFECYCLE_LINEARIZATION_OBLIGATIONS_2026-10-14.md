# STEP 7 — Protected activation lifecycle and linearization obligations — 2026-10-14

Branch: `ncs-clean-architecture`
Status: DESIGN CANDIDATE — NOT IMPLEMENTED — OPEN / STOP / UNKNOWN

## Why this document exists

The claim-relative inventory found no currently evidenced component that both owns constitutional currentness and enforces the final protected activation. This document narrows the problem to the smallest lifecycle obligations. It does not invent a new store, root, transaction framework, fence service, retry queue, or runtime mechanism.

Inputs reused without reopening closed audits:
- `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`
- `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`
- `STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`
- `STEP_7_CLAIM_RELATIVE_DEPLOYMENT_FAILURE_DOMAIN_INVENTORY_2026-10-14.md`
- `STEP_7_CONCRETE_EXECUTION_PATH_CROSSWALK_2026-10-14.md`
- Existing P112 evidence on `persistState(expectedRevision)`, detached snapshots, and the absent demonstrated final protected sink.

## First principle: initial legitimacy cannot be computed from candidate data alone

Assume an untrusted candidate bundle contains a Constitution, its hash, a claimed owner key, a claimed verifier policy, and a claim that this bundle is current. If the only reason to accept each item is another field in the same bundle, the bundle is self-authenticating: changing the entire bundle preserves its internal consistency. Hashing or signing it does not fix the missing initial relationship; the signature still requires a previously grounded rule for why that key can authorize this claim.

Therefore the first recognized basis must come from a premise external to the candidate bundle, or the system must remain unable to activate it. Available conceptual families are:
1. owner-reviewed initial intent under the already accepted, bounded first-ceremony faithful-presentation assumption, with exact reviewed-content binding and a clearly stated limit on what that assumption proves;
2. a genuinely pre-established external trust basis, but only if its custodian, provenance, verification rule, and failure dependencies are concrete and evidenced;
3. safe non-activation while neither basis is established.

No family is selected by this document. The existing owner decision accepts faithful POCO screen presentation for the first ceremony only; it does not ratify a recovery paper, choose a key, authenticate the owner from phone possession, or authorize activation.

## Minimal semantic lifecycle

These are proof obligations and ordering constraints, not claims about existing implementation.

### L0 — Load with canonical provenance

Read the candidate canonical state through the actual state owner. The result must distinguish:
- verified canonical state with provenance and its observed revision;
- known absence under an explicitly governed first-initialization rule;
- unreadable, malformed, fallback/default, stale, conflicting, or otherwise unproven state.

Only the first two may proceed, and only under their respective established rules. A default state returned by ordinary `loadState()` recovery is not evidence of a legitimate empty constitutional state. Unknown provenance => UNKNOWN/HOLD.

### L1 — Establish the authority context

The protected boundary establishes, rather than copies from the caller:
- the exact Constitution reference/content identity being evaluated;
- the authority domain and rules applicable to this activation;
- the recognized trust-basis provenance;
- currentness/revocation/recovery/succession context;
- the claim-specific dependencies and the scope this context does and does not establish.

The candidate cannot supply its own trust anchor, declare itself current, or promote a caller-provided PASS/provenance field. A successful result establishes only this authority context, not general execution permission.

### L2 — Build a detached candidate

Construct a working candidate from the authoritative snapshot and detach the complete mutable graph that a handler could alter, including nested memory entries. Record the observed canonical revision and the precise dependencies used for this claim. A shallow top-level copy is not sufficient if nested aliases remain shared.

No protected effect may mutate the canonical live state during candidate evaluation. If that isolation cannot be shown, STOP.

### L3 — Evaluate exact activation scope

Evaluate only the named activation claim and protected effect(s). Separate:
- owner's intent to approve exact content;
- recognition of the authority basis;
- selection of the current constitutional branch;
- permission to perform this activation;
- persistence of the resulting state;
- any external-world effect and its evidence.

None of these is inferred merely from the previous item. No unresolved constitutional clause may silently become operative because it is present in a draft.

### L4 — Revalidate at the authoritative linearization point

Before the transition is considered committed, the actual authoritative owner must ensure that the conditions relied on for admission remain valid and that no conflicting currentness, revocation, succession, or dependency change can slip between validation and commit.

The invariant is:

> A change that invalidates a dependency must either take effect before the activation and force rejection/UNKNOWN, or be ordered after a provably committed activation under an explicit, governed ordering rule. There must be no interval in which an activation is reported authorized while its required authority/currentness relation is indeterminate.

A second check performed outside the final commit boundary is not enough; it creates another check-then-commit gap. `stateRevision` only helps if the authoritative commit atomically covers every dependency whose change must invalidate this activation. Current source evidence does not establish that relationship for constitutional authority.

### L5 — Conditional persistence using the existing primitive

If and only if a legitimate authority/state owner is established, the existing `persistState(expectedRevision)` may be reused as the conditional whole-snapshot persistence primitive for cooperating writers. Do not build a second generic commit system.

A revision conflict means the candidate did not commit under the expected snapshot. It must not be relabeled PASS/COMMITTED; it requires the existing stale/conflict/UNKNOWN classification and whatever governed reconciliation is already applicable. Do not automatically retry an authority decision against changed dependencies without a fresh governed evaluation.

Persistence success proves only the bounded persistence operation documented by the primitive. It does not by itself prove Genesis legitimacy, Constitution currentness, protected-sink enforcement, external-world effect, or survival of arbitrary power loss.

### L6 — Classify evidence honestly

The terminal outcomes must distinguish at least:
- **ESTABLISHED/COMMITTED** — only when the exact governed condition and the authoritative commit are evidenced;
- **STALE/CONFLICT** — canonical state changed in a way that invalidates the candidate or the expected revision;
- **INVALID** — a required condition is disproven;
- **UNKNOWN/HOLD** — required provenance, currentness, dependency, ordering, or enforcement evidence is missing;
- **NO EFFECT / EFFECT UNKNOWN** — only where the actual effect boundary can evidence that conclusion.

Do not claim external success from an internal record. Do not convert UNKNOWN to failure-free success, default state, or a new root.

## Linearization-owner obligations

Before implementation, identify one real, inspectable boundary that answers all of these for the exact activation claim:

1. What state is canonical for the constitutional branch, and who has legitimate authority to designate it?
2. Which pre-established rule recognizes the initial basis without accepting the candidate's self-assertion?
3. Which authority/currentness dependencies invalidate activation if changed?
4. How are those dependencies atomically related to the commit decision, rather than merely checked earlier?
5. What serializes concurrent amendment, revocation, recovery, succession and initial activation?
6. How does the boundary distinguish canonical state from fallback/default state?
7. What is the actual protected effect of initial activation, and what alternate path can cause the same effect?
8. What durable evidence supports committed, stale, no-effect or effect-unknown classification?

If any answer is unknown, the transition remains blocked. These are not a demand for eight new components; they are eight obligations that may or may not be satisfied by an existing, legitimate mechanism.

## Adversarial traces the lifecycle must reject

| Trace | Required outcome |
|---|---|
| Candidate embeds its own root, verifier policy and “current” marker | UNKNOWN/INVALID; no self-bootstrap |
| Validly signed older Constitution is replayed after a governed revocation/succession | Reject if predecessor cutoff is established; otherwise UNKNOWN/HOLD |
| `loadState()` returns defaults after malformed/unreadable state | Not treated as canonical empty authority state |
| Authority is revoked after early gate but before final commit | Final boundary orders revocation/activation or blocks; no check-then-commit gap |
| Candidate handler mutates a nested aliased memory entry before commit | Isolation failure; STOP |
| Snapshot revision matches but an authority dependency changed outside that revision | Revision alone is insufficient; UNKNOWN/STOP |
| Persist returns revision conflict | STALE/CONFLICT, never COMMITTED |
| Persist succeeds but external protected effect is not evidenced | State persistence may be committed; external effect remains UNKNOWN |
| Two valid-looking branches conflict and only timestamp/epoch differs | No implicit winner; preserve conflict and HOLD |
| Recovery restores bytes but cannot prove current authority or predecessor cutoff | Recovery is not reauthorization; HOLD |

## What is reusable versus still absent

Reusable, within its demonstrated bounds:
- existing `persistState(expectedRevision)` whole-snapshot persistence and cooperating-writer conflict check;
- existing Core transition composition as a testable skeleton;
- existing semantic UNKNOWN/INVALID and stale/conflict concepts;
- existing source-backed P112 isolation/persistence conclusions.

Not evidenced:
- legitimate initial trust-basis recognition;
- canonical constitutional current-branch owner;
- protected authority-context establishment wired into production;
- atomic binding of constitutional currentness/dependencies to the final commit;
- a concrete initial activation effect and bypass-closed final enforcement boundary;
- production evidence that proves each terminal outcome.

Do not solve these absences by declaring `world-state.json` the Constitution root, promoting `stateRevision` to a universal authority epoch, or wiring `effectBoundary.prepare()` as a cosmetic last check.

## Decision

This lifecycle narrows the implementation contract but does not select a root family or close a gate. It establishes a necessary ordering invariant and clarifies that the existing persistence primitive is reusable only beneath a future legitimate authority owner.

The current repository does not evidence the owner or sink needed to satisfy the invariant. Thus no safe code-only patch can close STEP 7 today without first resolving that architectural authority premise.

## Non-actions

No source code or tests changed or ran. No keys, signatures, canonical digest, frozen Constitution, ceremony, recovery reference, root family, verifier, device, deployment or runtime authority was created/selected. No protected effect is authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
