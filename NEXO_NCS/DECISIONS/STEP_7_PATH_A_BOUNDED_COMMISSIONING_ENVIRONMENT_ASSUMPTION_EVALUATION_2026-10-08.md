# NCS — Path A: Bounded Commissioning-Environment Assumption
Date: 2026-10-08
Status: OWNER AUTHORIZED EVALUATION ONLY — CANDIDATE MODEL; NOT SELECTED FOR DEPLOYMENT; NO COMMISSIONING

## Authorization boundary
Kevin explicitly authorized evaluating Path A as a design option, with the condition that it not be implemented and Nexo not be activated. This authorizes analysis of the assumption, not acceptance of the assumption as true, not an enrollment ceremony, and not a production decision.

## Purpose
Determine whether a one-time, directly supervised commissioning environment can be stated narrowly enough to advance Step 7 design without pretending it supplies cryptographic proof of the first trust root.

This reuses, rather than replaces:
- `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE`
- `STEP_7_GENESIS_RECOGNITION_BASIS_PRECONDITION`
- `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT`
- `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT`
- `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT`
- `STEP_7_MINIMUM_VERIFIER_EVIDENCE_BIOMETRIC_COMMISSIONING_CLAIM`

No new runtime trust layer or root type is introduced.

## Proposed narrow assumption set (for evaluation, not yet accepted)
If a future commissioning design relies on Path A, it must explicitly state all assumptions below and identify which are unverified:

A1. **Owner-supervised event:** Kevin is physically present and intentionally participates in one bounded commissioning event. This is an environmental assumption until a legitimate recognition mechanism exists; a chat statement or repository record does not prove presence.

A2. **Honest presentation and input path:** The display/input path presents the exact canonical Constitution and commissioning request without substitution. This is assumed, not proven, unless independently verified evidence later supports it.

A3. **No active compromise during ceremony:** The relevant device, OS, application, input/display path, and any credential/key service are not actively compromised during the event. The assumption is explicitly vulnerable to malware, privileged compromise, deceptive UI, malicious updates, and coercion.

A4. **Exact bounded approval:** The owner approves only the named Constitution identity/version/content digest and the named commissioning context shown in that event. The approval conveys no mission authority, policy-change authority, recovery/succession authority, general execution permission, or future blanket consent.

A5. **Fresh, single-use event:** The event has a unique context and cannot be replayed or silently reused. If no protected mechanism can enforce freshness and one-time consumption, this requirement is not met and the claim remains UNKNOWN.

A6. **No silent fallback:** Any later biometric candidate must meet its already documented strong, per-operation requirements. Screen unlock, weak biometric, device PIN, app boolean, or local file is not silently equivalent.

A7. **No claim of independent verification:** Any property resting only on A1–A3 is labeled ASSUMED, not independently evidenced. Hashes and signatures can bind content after a trust basis exists; they do not establish the first authority by themselves.

## What Path A could support if its assumptions were explicitly accepted later
At most, a *conditional, one-time commissioning claim under declared environmental assumptions* for a specified Constitution and bounded commissioning context. Its trust statement must expose those assumptions and be invalidated if their stated conditions are known to have failed.

It would not support a claim that the phone/app/OS is secure, that Kevin's biometric is uniquely attributable to him, that the bootstrap root is independent, that authority remains current after compromise/recovery, or that protected enforcement is complete.

## What Path A cannot honestly solve
- It cannot turn the candidate phone or Termux into an independent root.
- It cannot make a self-reported app flag, local file, hash, signature, biometric result, or repository commit into prior recognition.
- It cannot prove the human-facing presentation is honest if A2 is merely assumed.
- It cannot establish revocation/currentness while the governing authority and its enforcement path remain undefined.
- It cannot prove all privileged paths are gated.
- It cannot authorize external effects or silently bootstrap general Nexo authority.

## Failure semantics
- Required assumption unaccepted or ambiguous: `UNKNOWN/HOLD`.
- Evidence shows a stated assumption was false or content/context differs: `INVALID` for that specific commissioning attempt.
- A required freshness, verifier, or enforcement capability is absent: `UNKNOWN/STOP`, not a weaker fallback.
- A later known compromise or conflict: quarantine the dependent commissioning claim; do not let the claim authenticate its own recovery.

## Focused countereffect review
1. **Assumption laundering:** Writing an assumption in a contract is not evidence it is true. Mitigation: label assumptions separately from evidence in every result.
2. **Consent overreach:** Agreement to evaluate Path A is not consent to use it. Mitigation: this document records evaluation-only authority.
3. **Biometric overclaim:** Biometric success does not prove unique human identity or a clean UI. Mitigation: retain those as separate claims/assumptions.
4. **Bootstrap circularity:** The candidate verifier cannot validate itself using a trust record it creates. Mitigation: no ESTABLISHED result for the independent-root claim.
5. **Replay/rollback:** A stored approval can be copied/restored. Mitigation: no commissioning claim is accepted unless freshness/one-time consumption has a justified enforcement basis.
6. **Compromised host:** An attacker controlling app/OS may substitute the action or falsify the ceremony. Mitigation: disclose as a fundamental Path A limitation; if resistance to this attacker is required, Path A alone is insufficient.
7. **Recovery/succession:** Initial owner intent cannot automatically govern later recovery or succession. Mitigation: those remain separate blocked authority transitions.
8. **Production effect leakage:** A commissioning artifact might be misused as general authority. Mitigation: scope it to one Constitution/context and deny all mission, policy, recovery, succession, and execution authority.

## Result
Path A is coherent only as an explicit *conditional environmental assumption*, not as a demonstrated independent trust root. It can advance the design discussion by making the risk envelope and limits concrete. It does not currently satisfy the protected Genesis Trust Foundation gate.

**Current result remains BLOCKED/UNKNOWN.** No deployment assumption has been accepted as true, no root/verifier is established, and no code, key, enrollment, ceremony, activation, or production effect is authorized.

## Next gate
Before any implementation, a separate owner decision would have to explicitly accept the precise assumption set and its risk envelope. Then the design would still need a technically justified way to bind the exact approval, freshness, lifecycle, and scope, and a protected enforcement boundary. If the owner requires protection against a compromised commissioning device/OS, reject Path A alone and require an independent recognition basis instead.
