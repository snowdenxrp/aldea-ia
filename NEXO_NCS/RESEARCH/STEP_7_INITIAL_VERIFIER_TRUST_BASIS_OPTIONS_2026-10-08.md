# STEP 7 — Initial Verifier Trust Basis Options
Date: 2026-10-08
Status: ARCHITECTURAL COMPARISON; NO OPTION SELECTED; NO IMPLEMENTATION AUTHORIZED

## 1. Why this is the next boundary
The attacked independent-channel enrollment contract exposed that an authenticator cannot make an untrusted verifier enforce a decision. Existing Master/Trust Foundation research already establishes:
- TCB is claim-relative and must include the enforcement boundary, trust root, update/recovery path and relevant dependencies.
- A root cannot be protected only by the mechanism it controls.
- Recursion terminates only at an explicitly trusted foundation, independently enforced boundary, or a bounded environmental assumption sufficient for the claim.
- If dependency closure is UNKNOWN, the claim cannot be described as closed.
Sources already in the repository:
- `docs/nexo/NEXO_TRUST_FOUNDATION_MINIMUM_TCB_RECOVERY_KEY_ROOT_UPDATE_RESEARCH_V1_2026-09-24.md`
- `docs/nexo/NEXO_SECOND_ORDER_FENCE_UPDATE_TRUST_ROOT_CONTINUITY_RESEARCH_V1_2026-09-24.md`
- `docs/nexo/AB104.443_VENDOR_PROVIDER_TRUST_BOUNDARY_ATTACK_2026-09-26.md`
- `docs/nexo/AB104.444_SINGLE_VENDOR_TOTAL_COMPROMISE_2026-09-26.md`
This comparison reuses their conclusions; it does not rerun old attacks or claim implementation/formal verification.

## 2. Required distinction
Three questions must not be collapsed:
1. **Artifact identity:** which exact source/build/package is under discussion?
2. **Verifier trust:** why should the environment executing the verification/enforcement code be trusted for the stated claim?
3. **Constitutional legitimacy:** why is the human/governance act that binds the Constitution legitimate?

A source hash or signature can help with artifact identity under a known key. It does not by itself establish verifier trust or constitutional legitimacy.

## 3. Candidate initial verifier bases

### V1 — Explicit bounded owner-verified prototype assumption
**Claim:** For a limited research/prototype deployment, Kevin explicitly accepts a particular pre-existing environment and a specific verification procedure as a bounded assumption.
**Possible evidence:** exact source revision, build/package digest, provenance, independent verification steps and recorded environment assumptions.
**Strength:** Makes the initial assumption visible instead of pretending there is a self-bootstrapping technical proof; allows low-risk development and testing without asserting production security.
**Risks:** Human comparison can be mistaken; the machine running verification may be compromised; build reproducibility and provenance may be incomplete; assumption is not portable automatically.
**Allowed claim:** “This prototype relies on the explicitly stated owner/environment assumption and verified artifact identity to the extent evidenced.” Not “Nexo's root is universally trusted,” not “production-secure,” and not “external actions are safely enforced.”
**Disposition:** Viable as a *research/prototype assumption only* if explicitly accepted and tightly bounded; not sufficient for production activation.

### V2 — Independently verified source/build/package path
**Claim:** The deployed verifier corresponds to reviewed source and a defined build/package.
**Possible evidence:** source revision, build provenance, reproducible or independently reproduced build, signed artifact from an explicitly governed signer, digest comparison through a separate channel, software/update transparency and rollback protection.
**Strength:** Can establish bounded correspondence/provenance claims and make supply-chain changes detectable.
**Risks:** Source host, compiler/toolchain, dependencies, build worker, signing key, release process and update channel are trust dependencies. A signature does not prove source semantics or the legitimacy of the signing authority. A hash comparison is only as trustworthy as the path carrying the expected hash.
**Disposition:** Candidate for future verifier assurance; requires a dependency/failure-domain map and independent evidence. No single repository/vendor may become an invisible constitutional root.

### V3 — Hardware/platform-assisted execution and update root
**Claim:** Hardware/platform mechanisms protect selected keys or constrain/measure boot/update state.
**Possible evidence:** platform-specific secure boot/attestation/update properties, key protection, measured state and independent verifier.
**Strength:** Can add enforcement or integrity evidence below the candidate software layer.
**Risks:** Manufacturer, firmware, boot chain, attestation roots, updates, recovery and platform lifecycle; measured state does not prove constitutional legitimacy. Vendor total compromise must remain in the threat model.
**Disposition:** Supporting mechanism only; not a complete genesis basis.

### V4 — External provisioning authority
**Claim:** An external issuer provides the expected verifier artifact/root reference or initial binding.
**Possible evidence:** issuer authorization, signed provisioning record, published governance and lifecycle.
**Strength:** Can provide a pre-existing reference independent of the candidate device.
**Risks:** Issuer legitimacy, provider capture, outage, policy changes, recovery control, portability and exit. If the issuer can change constitutional authority unilaterally, it becomes an unaccepted governor.
**Disposition:** Conditional only; reject if authority scope/exit cannot be bounded.

### V5 — Separate trusted execution/verifier environment
**Claim:** A separately established environment validates commissioning evidence and enforces a bounded policy independent of the candidate application.
**Possible evidence:** environment identity, isolation boundary, update authority, attestation/provenance, effect-boundary linkage and compromise response.
**Strength:** Could separate verification from the candidate application.
**Risks:** This environment has its own root, updates, recovery and verifier trust. Merely moving code to another process/device creates no independent trust by itself.
**Disposition:** Candidate only if an existing, independently established boundary is actually available and its claims can be evidenced; do not assume such an environment exists.

### V6 — “The candidate verifies itself”
**Claim:** Nexo's own initial software or generated key says it is trusted.
**Strength:** Convenience only.
**Risks:** Direct circularity; compromise can redefine the verifier and its own rules.
**Disposition:** REJECT as sole trust basis.

## 4. Comparative result
No candidate universally closes the root. The Master permits an explicitly declared, bounded environment assumption as a legitimate endpoint for a claim-relative TCB, but that is not equivalent to proof of production security. A prototype can be honest about an accepted assumption while production authority remains blocked.

The only acceptable next step is to decide which claims are needed at this stage:
- For architecture research and local, non-consequential prototype work, V1 may be sufficient if explicitly accepted, isolated and non-authoritative.
- For protected constitutional activation or external effects, V1 alone is insufficient; the relevant verifier, update, recovery and effect-boundary dependencies must be independently justified.
- V2/V3/V4/V5 may contribute later, but must not be selected without concrete deployment evidence and a failure-domain map.

This is an architectural disposition, not an assumption that Kevin has already approved a specific V1 environment.

## 5. Adversarial gate for any chosen basis
1. Artifact hash is correct but artifact is malicious or does not match the reviewed source.
2. Signature is valid but signer authority is illegitimate or compromised.
3. Source is reviewed but build toolchain/dependency injects malicious code.
4. Reproducible build matches a malicious source revision.
5. Update key is revoked but offline verifier accepts old state.
6. Hardware attestation is valid but the attested configuration permits a compromised app.
7. Candidate verifier can bypass checks after successful commissioning.
8. Recovery/update process replaces the verifier or root without authorized transition.
9. Expected digest arrives over the same compromised channel as the artifact.
10. A valid verifier result is treated as proof of constitutional legitimacy or external effect.
11. Provider exits or changes policy, and migration silently changes authority.
12. Root is lost; emergency replacement tries to self-authorize.

Expected behavior: preserve evidence; claims whose assumptions are unmet remain UNKNOWN; protected activation/effects remain blocked. Do not add a generic wrapper to hide a missing foundation.

## 6. Decision
No verifier basis selected. The next governance question is not “which tool is strongest?” but “which bounded initial assumptions, if any, are acceptable for a non-authoritative prototype, and which claims remain blocked until stronger evidence exists?” The current user has accepted an independent channel requirement, but has not selected a concrete verifier/platform/build trust assumption.

## 7. Next exact action
Reconcile V1's bounded-prototype distinction with the NCS architecture's permitted non-dependent work. Draft an explicit capability boundary separating safe design/local test work from protected commissioning, root changes, secrets, and external effects. Attack whether any supposedly harmless prototype capability can mutate or claim authority. Do not request or infer acceptance of a concrete device/vendor until a genuine deployment choice is necessary.
