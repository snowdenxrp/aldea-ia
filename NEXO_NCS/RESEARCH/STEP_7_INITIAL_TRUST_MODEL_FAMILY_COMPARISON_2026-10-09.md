# STEP 7 — Initial Trust Model Family Comparison and Deployment Inventory — 2026-10-09

Status: DESIGN / RESEARCH ONLY — NO TRUST FAMILY SELECTED — COMMISSIONING STOP RETAINED

## Why this document exists

The user asked whether Nexo can reuse an initial trust model already used by AI/system architectures instead of inventing one. Existing NCS research already identifies four candidate families. This note compares them against the presently stated Nexo claim classes and records what cannot yet be concluded because no concrete deployment target, protected resource, or commissioning environment has been selected.

This is a claim-relative comparison, not a new trust contract, trust engine, hardware recommendation, credential choice, or commissioning decision. Existing Root Recognition Gate, Minimum Bootstrap Composition Contract, Trust Function / Root Role Map, Constitution-to-Policy Binding, and protected-evidence contracts remain canonical owners. This note does not replace them.

## External technical cross-check

- IETF RFC 9334 (RATS Architecture): separates Attester evidence, Verifier appraisal, appraisal policy, and Relying Party decisions. It explicitly leaves trust-anchor establishment and several deployment choices to the realizing system. Therefore RATS is a reusable role model for technical evidence, not a complete first-owner/constitutional Genesis solution: https://www.rfc-editor.org/rfc/rfc9334.html
- NIST SP 800-193: separates platform firmware protection, detection, and recovery roots/chains. It supports function-specific platform trust and secure recovery, not the claim that a platform root alone establishes a human owner's constitutional authority: https://csrc.nist.gov/pubs/sp/800/193/final
- WebAuthn/FIDO-style authentication can support a scoped human-authentication ceremony, but the relying system still must establish the credential-to-owner relationship and decide what authority the authenticated act grants. Authentication is not constitutional legitimacy.

## Present Nexo claim classes and deployment gaps

| Claim class currently relevant to Nexo | What the initial model would need to establish | Concrete target / current evidence | Result |
|---|---|---|---|
| Owner identity / initial recognition | Evidence attributable to Kevin, scoped to the ceremony and bound to a fresh explicit act | No credential or ceremony independently verified or selected; no owner credential material stored | UNKNOWN |
| Constitutional genesis | Why the exact initial Constitution and its authority domain are legitimately recognized before the candidate Nexo can act | No independent recognition source or protected commissioning boundary established | UNKNOWN / blocking |
| Local software/platform integrity | Integrity properties of the exact host, boot chain, runtime and protected components relevant to a claim | Target hardware, boot model, measurement chain and protected boundary unselected | UNKNOWN |
| Policy and authority establishment | A protected source for Constitution/Policy meaning and provenance, not caller-supplied status or self-attestation | Existing contracts are design only; no implemented protected authority-source boundary | STOP |
| Offline continuity / revocation | What currentness and revocation can be established while disconnected, and the maximum stale-authority window accepted | Offline limits, connectivity assumptions, and revocation enforcement boundary unselected | UNKNOWN |
| Cross-device continuity | How a new device is recognized without inheriting authority merely from copying a snapshot or key | Device classes, transfer ceremony, and independent failure domains unselected | UNKNOWN |
| External/device effects (e.g. eventual device control) | Which last resource boundary can actually reject unauthorized effects and provide evidence of effect/no-effect | No concrete target resource or bypass closure selected | UNKNOWN |
| Recovery / replacement / succession | Previously governed rules for compromised or lost roots, recovery, and successor recognition | No independently enforceable recovery or succession basis demonstrated | UNKNOWN |

The inventory is intentionally explicit about unknowns. User goals (portable Nexo, hands-free interaction, eventual device control) are not evidence that a specific platform, device, credential, or effect boundary is already available.

## Candidate family comparison

| Candidate family | What it can plausibly contribute | What it does not solve by itself | Nexo portability / operational consequence | Current disposition |
|---|---|---|---|---|
| A. Immutable or externally provisioned root | A pre-established reference/credential introduced through a separate provisioning or owner-recognition path | Does not prove the provisioning path was legitimate, private, uncoerced, current, or bound to the exact Constitution; does not itself enforce later actions | Potentially portable if the protected reference can be transferred safely, but every transfer/replacement needs governed recognition and dependency analysis | Candidate only; provisioning source/ceremony unknown |
| B. Mutable root updated by a previously protected predecessor | Governed rotation, update and de-enrollment after a predecessor has already been legitimately established | Cannot solve Genesis from nothing; a new root cannot authorize itself; recovery from a compromised predecessor requires a separately governed path | Good lifecycle pattern after Genesis, but creates predecessor, cutoff, rollback, recovery and failure-to-activate obligations | Not a Genesis solution alone |
| C. Platform/hardware root (e.g. secure/measured boot, TPM-like capabilities, hardware-backed authenticator) | Bounded claims about device key protection, boot/integrity measurement, and platform recovery when independently enforced and properly provisioned | Does not establish owner legitimacy or constitutional authority; vendor/manufacturing/firmware and appraisal policy become dependencies; measurement scope is limited | Strongly platform-specific; may complicate portability and replacement; must be evaluated per actual device and effect boundary | No platform selected; not assumed available |
| D. Multiple roots / threshold arrangement | Can reduce dependence on one source if the governance rule and genuinely independent failure domains are established | Count, majority, separate keys/processes or vendors do not prove independence; does not create a legitimate first rule for resolving conflicting roots | Potentially more resilient but adds recovery, availability, conflict and common-mode analysis; must not be added without a concrete requirement | No quorum or multi-root design authorized |

## Finding: what can be reused

The most reusable existing model is a **separation of roles and evidence**, not a prepackaged authority root:

1. Use RATS-style roles to distinguish evidence production, evidence appraisal, and relying-party decisions for bounded technical claims.
2. Use platform root/chain mechanisms only for the integrity and recovery properties the actual platform demonstrably provides.
3. Use a scoped authentication ceremony to contribute owner-identity evidence.
4. Keep constitutional recognition, policy authority, and final effect enforcement as separate Nexo-governed claims.

No single one of these supplies the whole Genesis relation. Their composition still needs a legitimate initial recognition basis, explicit scope, freshness, dependency closure, currentness/revocation, recovery semantics, and an enforceable final boundary. An AI/model/provider cannot choose its own root or upgrade an attestation result into constitutional authority.

## Decision

- Reuse of RATS role separation as a conceptual architecture aid: SUPPORTED, bounded to technical evidence and appraisal.
- Reuse of platform/hardware trust: CONDITIONAL on a concrete target and demonstrated platform properties; none selected.
- Reuse of human authentication: CONDITIONAL as identity evidence only; no credential or ceremony selected.
- Root family winner: NOT DETERMINED.
- Genesis recognition: NOT ESTABLISHED.
- Path A: NOT ACCEPTED.
- Path B: NOT ESTABLISHED; no concrete pre-existing credential/relationship with independently verifiable provenance has been accepted as the basis.
- Path C: remain uncommissioned UNKNOWN/STOP remains valid.
- No implementation, enrollment, key creation, root rotation, recovery, commissioning or activation is authorized by this comparison.

## Exact next action

Do not repeat general trust research or create another trust abstraction. The next design decision requires selecting a concrete target claim for the first deployment (for example, a local protected Core instance versus a specific device-control effect) and inventorying its actual host/platform capabilities, external dependencies, offline requirements, recovery assumptions, and last effect boundary. Until that target exists, any family ranking would be false precision. Preserve all unresolved fields as UNKNOWN and keep STEP 7 STOP.
