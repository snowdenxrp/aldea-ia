# NEXO — Constitutional Draft (Human-Readable Working Text)
Date: 2026-10-14
Branch: ncs-clean-architecture
Status: DRAFT / NOT FROZEN / NOT COMMISSIONED / OWNER REVIEW REQUIRED

> This is a working draft assembled from recovered principles in the existing MASTER and NCS trust contracts. It is not a canonical artifact, approved Constitution, trust anchor, or authority source. It has no approved identifier/version/scope, no canonical byte rules, no digest, no signature, and no commissioning event. It must not be used to authorize protected effects.

## 0. Document status and interpretation

This text carries forward existing architectural principles for review. It does not silently resolve any item listed in “Open constitutional decisions and prerequisites.” Items marked OPEN are not operative rules and must not be inferred from surrounding prose.

The word “must” below expresses a recovered design invariant, not a claim that current code or deployment enforces it.

## 1. Foundational separations

### 1.1 Cognition, authority, execution and verification

Cognition is not authority. Authority is not execution. Execution is not verification. A model, agent, provider, memory record, tool, repository commit, successful test, or generated artifact cannot grant itself constitutional authority, approve its own modification, disable a governing control, or convert its own output into a verified fact.

### 1.2 Trust, identity, authority, capability and policy

Trust, identity, authority, capability, policy, execution, external effect and verification are distinct semantic roles. A successful result in one role does not automatically establish another role. A device credential may support an identity or possession claim within its governed scope; it does not independently establish constitutional legitimacy.

### 1.3 Evidence, integrity and truth

Integrity, authentication and provenance do not alone establish semantic truth. A stored record, signature, hash, version, timestamp, epoch, commit, attestation result or checkpoint is evidence for a bounded claim only. It does not establish authority or currentness beyond the claim and policy that validate it.

## 2. Constitutional authority and initial trust

### 2.1 No self-establishing root

A candidate Genesis bundle, key, verifier, store, provider, recovery artifact or Constitution cannot establish its own initial legitimacy solely through claims contained in that same candidate. If the required pre-existing legitimacy basis and its provenance cannot be established, authority remains UNKNOWN and commissioning must STOP.

### 2.2 Genesis and Constitution are distinct

The Genesis trust basis, constitutional regime, identity credentials, policy authority, recovery authority, succession rules, execution authority and external-effect enforcement are distinct. Establishing one does not silently establish the others.

### 2.3 No authority from technical metadata alone

A hash identifies bytes; a signature relates a statement to a key; a timestamp or epoch expresses technical ordering under its assumptions; storage preserves data under its own guarantees. None alone establishes which constitutional branch is legitimate or current.

### 2.4 Human intent and presentation assumptions

An initial owner-recognition process must make the reviewed content, intended scope and threat assumptions explicit. The exact binding mechanism between human review and the artifact remains an OPEN commissioning requirement, not an implemented guarantee in this draft. The separately recorded owner decision provisionally accepts the POCO and its screen as faithfully presenting the content for the first recognition ceremony only. That is a bounded risk assumption, not technical proof, permanent trust in the device, or an authorization for subsequent operation.

## 3. Fail-closed decision rules

### 3.1 Critical uncertainty

UNKNOWN, CONFLICT, UNTRUSTED, stale or unverifiable critical evidence, authority, ordering, currentness or dependency blocks the transition that relies on it. The system must not use a permissive fallback or treat absence of evidence as proof of safety.

### 3.2 Preserve unresolved conflicts

When legitimacy, currentness or ordering between competing revisions cannot be established, preserve the conflicting evidence and branches. Do not silently choose a winner based solely on recency, timestamp, epoch, majority, availability, replica count, vendor, or technical superiority.

### 3.3 No authority amplification

An ordinary transition must not increase authority, capability, scope or autonomy unless a separately governed constitutional transition explicitly permits that increase. Evidence of lower assurance cannot elevate itself.

## 4. Policy and decision boundaries

### 4.1 Protected policy establishment

Policy identity, semantics, scope, applicability, validity, dependencies and establishment provenance must be derived through a protected boundary rooted in an already-established constitutional context. Caller-supplied fields, labels such as AUTHORIZED or PASS, typed objects, immutable objects, hashes and asserted provenance are proposals until that protected boundary establishes their meaning.

### 4.2 Context is not a capability

A recognized Constitution Authority Context is evidence of which constitutional regime governs a bounded evaluation. By itself, it does not grant a policy, prove a claim, admit a candidate, authorize an action, commit state, execute an effect or prove world state.

### 4.3 Scope containment

A request or mission cannot widen its own authorized purpose, target, resource, action, risk, budget or effect scope. A requested scope change is not authorization. Approval for one scope must not be reused for a different or broader scope.

## 5. Execution, effects and verification

### 5.1 Protected-effect enforcement

Constitutional recognition and policy admission are not blanket permission to execute. Every in-scope protected effect requires a real, identified final enforcement boundary that applies current authority, scope and required validity/revocation checks. All bypass-capable routes must be demonstrated closed or explicitly excluded by the declared scope. If the actual sink or its enforcement cannot be demonstrated, protected effects remain STOP/UNKNOWN.

### 5.2 Execution is not an external outcome

A request, authorization, dispatch, local state commit, provider response or sink receipt does not alone prove that the intended external-world effect occurred or was legitimate. Ambiguous outcomes remain UNKNOWN and require the applicable governed reconciliation process. Do not claim cancellation or absence of effect without evidence.

### 5.3 Verification independence

Verification must state the exact claim, scope, evidence requirements, freshness, dependencies, failure domains, verifier identity and limitations. Multiple checks are not independent merely because they use different processes, keys, devices or vendors when they share a material dependency. A verifier cannot establish its own trust basis from its own result.

## 6. History, recovery and continuity

### 6.1 History is not legitimacy

Durable history and checkpoints should preserve provenance, ordering, conflicts and invalidation. Persistence, integrity, a valid old snapshot or successful reconstruction does not alone prove truth, authority or currentness.

### 6.2 Recovery cannot self-authorize

Recovery may restore only capabilities already bounded by a previously established governing rule. It must not create its own trust root, widen its own scope into ordinary governance, silently activate succession, or resurrect stale/revoked authority. If the recognized recovery basis is missing or uncertain, the result remains UNKNOWN/STOP.

### 6.3 Succession is separately governed

No succession may be inferred solely from kinship, device access, possession of a key, absence of the predecessor, technical recency or availability of a snapshot. A succession path must be established by a prior governing rule and must resolve legitimacy and predecessor cutoff. Conflicting or unproven succession remains UNKNOWN/STOP.

### 6.4 Emergency containment is not general authority

Emergency containment must remain within a pre-authorized bounded role. It cannot silently become unrestricted governance, ordinary execution authority, succession, policy rewriting or authority expansion. Its concrete triggers, powers, duration and exit rules remain OPEN and are not defined by this draft.

## 7. Change control and audit

### 7.1 Amendment cannot be inferred

The exact rule for determining material change and binding a review to bytes/scope remains an EXTENSION candidate to be specified against the canonicalization and amendment contracts. Until a governed rule exists, do not assume a prior review applies to changed content or scope.

The MASTER's requirement for dual control over constitutional changes is preserved as a design invariant; it is not optional. The concrete roles, separation of failure domains, approval threshold, key arrangement and implementation are still OPEN and must be specified without assuming that two keys, devices or processes are independent merely because they differ. The complete amendment procedure and activation/currentness semantics remain OPEN.

### 7.2 Evidence discipline

A claim that a gate passes must bind the relevant threat/claim, exact artifact and inputs, trigger, run/job, code/configuration pin, raw output/log and interpretation. Missing evidence links mean PENDING/UNKNOWN, not PASS. Design, source inspection, unit tests, runtime verification and deployment evidence must remain distinct.

### 7.3 Repository activity is not commissioning

A commit, green CI run, digest calculation, generated key or successful unit test does not by itself freeze or commission this Constitution, prove the verifier actually running, establish canonical currentness, or prove that a deployed protected sink enforces the rules.

## 8. Open constitutional decisions and prerequisites — NOT OPERATIVE

The following are intentionally unresolved and cannot be filled by inference:

1. **Canonical identity and rendering:** exact Constitution identifier, revision/version, UTF-8/canonicalization rules, deterministic complete rendering and content-to-rendering binding.
2. **Initial scope:** exact domains governed by the first recognized revision and explicit exclusions. No initial scope is selected here.
3. **Amendment governance:** who may propose/review/approve; required approval threshold; exact content/scope binding; activation point; conflict handling; retirement of predecessor revision.
4. **Canonical currentness:** which protected state owner establishes the active Constitution, ordering, revocation, rollback resistance and offline uncertainty. No implemented owner is currently demonstrated.
5. **Succession:** triggers, evidence, approval, predecessor cutoff, competing claims and future-successor eligibility. The owner's daughter has no current authority by this draft.
6. **Recovery:** what recognized reference or credential survives loss, who may invoke recovery, its limits and how recovery itself is governed. The proposed handwritten record has not been separately ratified as a recovery authority/reference.
7. **Emergency containment:** triggers, allowed actions, scope, duration, audit, exit conditions and relationship to normal authority.
8. **Verifier:** exact intended verifier, provenance, policy/reference configuration, dependency closure and proof that the intended verifier is actually executing.
9. **Protected sink and deployment:** actual target, final effect-capable sink, canonical state owner, runtime composition, revocation enforcement and bypass closure.
10. **Genesis basis:** the pre-existing legitimacy basis and protected establishment path that cannot be self-created by the candidate.
11. **Constitution-to-Policy implementation:** protected Core-owned establishment of the constitutional context and governed Policy source.
12. **Adversarial acceptance:** all mandatory commissioning matrix gates, including replay, substitution, stale/rollback state, revocation races, recovery, verifier substitution and all in-scope sink paths.

## 9. Separately tracked proposed extensions — NOT OPERATIVE

These are useful candidate refinements but are not silently elevated into recovered constitutional rules:
- A deterministic canonicalization and human-readable rendering specification.
- The exact mechanism binding reviewed content and scope to a fresh one-use approval context; the need to bind these is a gate, but this mechanism is not specified here.
- A precise definition of material change and a complete amendment/currentness state-transition procedure.
- A claim-specific final-sink enforcement and bypass-evidence requirement.
- A machine-checkable traceability link from each clause to its normative source and acceptance evidence.

Each extension requires review against MASTER + AB + P/P112 and must not duplicate or contradict an existing contract.

## 10. Commissioning status

This document is for human-readable review and architecture development only. It is not ready for canonical serialization or digest generation while the OPEN decisions and extensions remain unresolved. The owner must review the complete content after those matters are addressed and before any future approval ceremony.

No key, signature, digest, commissioning transcript or frozen Constitution is created here. No code or tests are changed or run by this document-only step.

**Current status: STEP 7 OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
