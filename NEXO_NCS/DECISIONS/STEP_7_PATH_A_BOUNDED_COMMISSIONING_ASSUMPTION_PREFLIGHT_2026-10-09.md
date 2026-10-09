# STEP 7 — Path A Bounded Commissioning Assumption Preflight
Date: 2026-10-09
Status: DESIGN-ONLY PREFLIGHT — ASSUMPTIONS NOT ACCEPTED — NO COMMISSIONING AUTHORIZED

## Purpose
Prepare Path A as the explicitly bounded alternative in the existing Genesis recognition decision gate, without selecting a root, designing a ceremony, implementing a verifier, enrolling credentials, or activating Nexo. This is a focused preflight, not another root-family taxonomy and not a claim that Path A is safe or sufficient.

## Current evidence boundary
- Path B remains BLOCKED/UNKNOWN: repository and recovered Library records identify no concrete pre-existing external recognition artifact/relationship whose provenance, scope, currentness, recovery and failure domains can be independently established.
- The current phone is only a candidate presentation/approval channel. Possession, account access, voice/biometric match, signature validity, a hash, repository history or an app's “approved” label does not establish prior recognition or current constitutional authority.
- Kevin's normative role as sole initial constitutional decision-maker is recorded. That governance intent does not, by itself, authenticate a future approval message or prove enforcement.
- The existing STEP_7_GENESIS_RECOGNITION_BASIS_PRECONDITION, STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT, STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP, claim-relative failure-domain inventory and recognition-family comparison remain canonical. This note narrows Path A for evaluation; it does not replace them.

## Candidate Path A assumption envelope — not accepted
If Kevin later explicitly accepts Path A for further design, it must state and bound all of the following. Listing an assumption here does not mean it is true.

A1. **One-time commissioning environment:** for the narrowly scoped event, the relevant presentation, input, operating system/runtime, application, storage, and any transport path are assumed not to be actively manipulated in a way that substitutes the approver, content, context, or result. This is a risk assumption, not a verified property.

A2. **Direct owner participation:** Kevin intentionally participates in the exact commissioning event. A voice/face/biometric match, possession of the phone, account login, or model inference alone is not accepted as proof of this premise.

A3. **Exact content and context:** the decision concerns one identified Constitution version/content, one declared deployment and one exact commissioning action. A content hash can identify bytes only; it cannot by itself establish that Kevin saw those bytes, that the presentation path was honest, or that the content is legitimate.

A4. **No self-created prior recognition:** the candidate Nexo instance, its model, updater, repository, local file, snapshot, or credential being authorized cannot manufacture the prior-recognition fact or attest to its own legitimacy.

A5. **One-time and non-transferable scope:** any eventual recognition would apply only to the exact stated genesis claim and context. It does not silently authorize other deployments, future missions, policy changes, root rotation, recovery, succession, code updates, or external effects.

A6. **Explicitly limited compromise claim:** Path A does not claim resistance to a compromised commissioning host, compromised presentation path, or compromised environment. If that resistance is required, Path A alone is insufficient and cannot pass the gate.

A7. **Separate lifecycle and enforcement:** later currentness, revocation, replacement, recovery/succession, protected verifier legitimacy, and enforcement at each privileged/effect boundary remain separate requirements. Path A does not solve them by implication.

A8. **Fail-closed outcome:** any missing, conflicting, stale, interrupted, unbound or unverifiable required condition yields UNKNOWN/HOLD or INVALID according to the already-defined contract. No fallback, timestamp, newest snapshot, majority, model confidence, or convenience can convert it to ESTABLISHED.

A9. **First-code/updater circularity:** an uncompromised display or host does not prove that the initial code, verifier, updater, or artifact channel is legitimate. If the initial software itself must be trusted, Path A must explicitly assume the relevant artifact and delivery path are not malicious; that assumption is not proven by the artifact's own signature, build provenance, or self-check. The candidate code/updater cannot be the sole authority for validating its own legitimacy.

## Focused attack preflight
Before any future decision to accept the assumptions, evaluate these failure cases against the exact proposed deployment and claim. Reuse existing attacks where already covered; do not duplicate their full analyses.

1. **Content substitution:** displayed/reviewed Constitution differs from the bytes submitted to the protected boundary.
2. **Owner substitution or coercion:** the event is attributed to Kevin without adequate basis, or the owner is impersonated/coerced.
3. **Host/presentation compromise:** malware, overlays, modified runtime, malicious input path or misleading display substitutes the request or result.
4. **Replay/context mix-up:** a prior approval is reused for another device, deployment, Constitution revision, purpose or interrupted ceremony.
5. **Self-enrollment:** the candidate instance creates the credential, enrollment record, verifier state or provenance that is then used to authorize itself.
6. **Common-mode dependency:** presentation, evidence, verifier, logs, update channel and recovery all rely on the same compromised account/provider/device/policy path while being called “independent.”
7. **Interruption and ambiguous completion:** crash or partial persistence leaves the establishment outcome unknown; retry must not create a second or broader authority.
8. **Lifecycle gap:** no justified way exists to establish currentness, revocation, replacement, recovery or succession after commissioning.
9. **Enforcement bypass:** the approval is recorded but a privileged transition or target effect can bypass the required boundary.
10. **Post-commissioning mutation:** a later update changes the recognition semantics, Constitution binding or authority path without the same governed transition rules.
11. **First-code/updater bootstrap circularity:** the initial verifier/updater validates itself or the initial artifact channel, or the mechanism installing the protections can alter those protections without a separately justified authority basis. If the proposed solution requires a new sovereign bootstrap core to break this cycle, STOP and revisit the architecture rather than adding another core.

## Acceptance gate — all required; no implicit acceptance
Path A may advance beyond design only after a separate, explicit owner decision accepts or rejects the precise assumption envelope and its stated risks. “Continue” is not acceptance.

Even after explicit acceptance, implementation remains blocked until the proposed deployment demonstrates:
- exact claim and deployment scope;
- an auditable binding between owner action, presented content, submitted content and commissioning context;
- protected provenance that the candidate instance cannot self-assert;
- one-time/replay and interruption semantics;
- a justified verifier/recognition boundary and its dependency closure, including the first-code/updater trust basis;
- lifecycle/currentness/revocation/recovery handling appropriate to the claim;
- target-specific enforcement and bypass closure;
- safe UNKNOWN/HOLD behavior for every missing or conflicting required fact.

If any requirement depends on the candidate Nexo instance trusting its own unsupported assertion, stop and revisit the architecture root. Do not add a new sovereign bootstrap core or a generic trust engine to hide the circularity.

## Comparison against Path B
- Path B, if a real pre-existing basis is identified, could supply evidence for prior recognition without relying solely on the candidate commissioning environment. It would still need scope, currentness, recovery, verifier legitimacy and enforcement.
- Path A makes the commissioning-environment assumption explicit but does not prove it, and offers no claim of surviving a compromised commissioning host.
- Neither path is currently established or selected. Path C — remain uncommissioned with UNKNOWN/STOP — remains the valid outcome if no path meets its gate.

## Result
Path A has been prepared only as a bounded assumption envelope and attack checklist. A focused cross-check against the recovered self-modification audit exposed a distinct bootstrap gap, now stated explicitly: trust in the first code/updater cannot be inferred from the code/updater validating itself. No assumption was accepted; no ceremony, hardware, provider, key, credential, verifier, runtime, or root was selected. No code, enrollment, protected activation, production effect, or Lúmina change was authorized. STEP 7 remains STOP.
