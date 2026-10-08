# STEP 7 — Commissioning and Constitutional Succession: Semantic Rule
Date: 2026-10-08
Track: NCS clean architecture
Status: ARCHITECTURAL RULE CANDIDATE — SEMANTIC BOUNDARY CLARIFIED; DEPLOYMENT MECHANISM NOT SELECTED; NOT IMPLEMENTED.

## Why this record exists
This is a synthesis of the existing NEXO Master Architecture, constitutional succession research, authority/assurance/evidence circular-composition research, and the NCS Trust Function Root Role Map and Bootstrap Legitimacy Gap decision. It does not reopen those completed investigations or claim new runtime/formal verification.

## Established constraints recovered from the existing architecture
1. Nexo must not self-declare trusted.
2. Genesis activation requires an external/independent authority or a threshold arrangement appropriate to the deployment.
3. Cognition, authority, execution, and verification remain distinct.
4. Human approval is bounded and bound to the exact operation/context; it is not a universal bypass.
5. A snapshot restores state, not current authority. A signature, certificate, epoch, hash, attestation, model statement, or hardware measurement alone does not create legitimacy.
6. Recovery/succession preparation is not authority. A successor remains a candidate until the constitutional succession rule, ordering, required predecessor cutoff/fencing, dependencies, and enforcement claims are verified.
7. If the trust basis, authority, currentness, revocation, succession order, or required enforcement is UNKNOWN, preserve evidence and enter the applicable blocked/authority-unavailable/safety state. Do not infer success or fall back permissively.
8. Existing AB/P evidence is a source of constraints and failure patterns, not a reason to silently migrate the old implementation into NCS.

## Semantic rule proposed for architecture-level acceptance
**Constitutional legitimacy and technical authentication are separate requirements.**

- The constitutional rule defines *who or what is legitimately allowed to commission Nexo, approve constitutional amendments, and authorize succession*, within the user's stated governance model.
- The commissioning ceremony creates the initial binding between that rule, the initial Constitution, and the protected trust basis.
- A deployment-specific mechanism (for example, pre-provisioned external authority, owner-authorized commissioning, threshold custodians, or a hybrid) may authenticate and protect that binding. The mechanism cannot define its own legitimacy merely because it is technically secure.
- The initial authority source must be established independently of the system state it is being asked to authorize. Nexo, its model, a newly created policy, a verifier controlled by that policy, or a recovery process cannot bootstrap its own authority.
- Succession must be explicitly authorized by the already-recognized constitutional rule. The successor cannot decide its own eligibility, order, membership, or currentness.
- Technical evidence can support the appraisal of commissioning/succession, but it does not substitute for the normative rule that makes the transition legitimate.

This is a proposed semantic boundary for review, not a claim that a final commissioning model has already been selected.

## Distinguish four questions
A. **Legitimacy:** Which human/governance rule is entitled to authorize the initial Constitution and its amendments?
B. **Authentication:** How does Nexo establish that the commissioning action came from the legitimate source and binds the exact Constitution/context?
C. **Protection/currentness:** How are the basis, revocation, compromise, offline state, and currentness protected and checked?
D. **Succession/recovery:** What pre-authorized rule orders successors, cuts off predecessors where needed, and handles lost/compromised roots without self-promotion?

A mechanism answering B or C does not automatically answer A or D.

## Candidate mechanism families — not selected
- Owner-authorized commissioning ceremony with an independently protected channel.
- Pre-provisioned external genesis authority.
- Multi-custodian or threshold commissioning/succession.
- Hardware/platform-assisted root, only as a protected component of a wider legitimacy rule.
- Hybrid model with distinct roles for constitutional authorization, platform integrity, recovery, and succession.

No candidate should be selected by convenience alone. Evaluate only against the actual deployment threat model and the existing constitutional authority principle. Do not assume a hardware root, cloud/provider, threshold, local key, or human ceremony is universally best.

## Required decision criteria
For every candidate, document:
- legitimate source and exact scope of authority;
- independent establishment and circularity resistance;
- binding to the exact Constitution/version and commissioning intent;
- protection against replay, substitution, coercion, equivocation, and stale snapshots;
- currentness and revocation during connected and offline operation;
- lost-device, lost-key, compromise, migration, replacement, and recovery behavior;
- succession ordering, predecessor cutoff, and conflicting candidates;
- common-mode and failure-domain assumptions;
- privacy, user agency, and availability trade-offs;
- countereffects if commissioning/recovery is interrupted;
- evidence required for each claim and the safe state when evidence is absent.

## Adversarial acceptance tests required before implementation
1. Nexo starts with no established basis and claims that its generated Genesis bundle authorizes itself.
2. A model or provider asserts that Kevin approved commissioning without an independently bound approval event.
3. A valid signature authenticates a Constitution that was never legitimately commissioned.
4. A current-looking snapshot resurrects revoked or superseded authority.
5. A recovery agent uses its own recovery result to validate its own authority.
6. Two successors have locally valid evidence but no common authoritative ordering.
7. The predecessor can still cause protected effects after successor activation.
8. Connectivity returns after offline operation, but revocation/currentness evidence is stale or unavailable.
9. A device migration preserves bits but changes the semantic meaning or authority scope of the Constitution.
10. A protected mechanism is compromised or shares a failure domain with the verifier/policy it is meant to validate.

For each: expected outcome must be BLOCK/UNKNOWN/QUARANTINE or a narrower explicitly pre-authorized safety state, unless an independently established rule provides a verified transition.

## What this resolves — and what remains open
Resolved at the semantic level: legitimacy cannot be inferred from technical authentication; bootstrap and succession require a previously defined authority rule and an independently protected binding. This is already implied by the Master and prior research, and is being made explicit here.

Still open: choose the commissioning/succession model for the intended Nexo deployment, including whether the first binding is owner-authorized, externally provisioned, threshold-based, or hybrid; specify exact evidence and failure handling; attack the selected contract.

Not authorized by this record: implementation, creation of a generic trust registry/independence engine, selection of a universal GenesisRoot, or declaring any trust foundation implemented.

## Next exact action
Cross-check the candidate families against the intended local-first personal Nexo deployment and the constitutional authority principle already recorded in the Master. Eliminate only candidates that contradict existing invariants; do not invent a mechanism or claim the user's preference is known where it is not. If the remaining choice materially depends on an unrecorded user governance preference, ask one focused question before freezing the decision. Then attack the semantic contract before selecting cryptographic/hardware details.

## Provenance and verification boundary
Inputs: `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md`; `docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md`; `docs/nexo/NEXO_AUTHORITY_UNAVAILABLE_BOUNDED_SAFETY_CONSTITUTIONAL_SUCCESSION_RELEASE_RESEARCH_V1_2026-09-24.md`; `docs/nexo/NEXO_AUTHORITY_ASSURANCE_EVIDENCE_CIRCULAR_COMPOSITION_RESEARCH_V1_2026-09-24.md`; NCS Step 7 Trust Function Root Role Map; Bootstrap Legitimacy Gap and Root Basis Decision.
This document is a design synthesis. No implementation, runtime test, TLC/SANY run, or deployment verification is claimed.


## Candidate-family elimination against the recorded Nexo deployment goals — 2026-10-08

This section reuses the concrete commissioning threat model, initial-verifier options and the existing local-first/provider-independence requirements. It narrows the semantic choice without selecting hardware, vendor, channel, protocol, threshold or root.

### Candidates that cannot stand alone
- **Candidate verifies itself:** rejected. It directly violates non-circular genesis and cannot create its own legitimacy.
- **Hardware/platform root alone:** insufficient as the governance model. It may support integrity, key protection or enforcement, but cannot decide who is legitimately entitled to establish Nexo's Constitution.
- **Immutable/pre-protected local root alone:** insufficient for genesis unless a prior legitimate provisioning act is independently established. Immutability preserves a basis; it does not make an illegitimate basis legitimate.
- **External provisioning authority alone:** not accepted as a default. It can be a candidate only if its own legitimacy, scope, governance, exit/migration and compromise handling are explicitly justified; otherwise it silently transfers constitutional control to the issuer.
- **Threshold/multi-custodian ceremony as a default:** not justified by current evidence or the recorded personal-assistant goal. Threshold arithmetic does not establish legitimacy or failure-domain independence. It remains available only if the governance model explicitly requires multiple custodians.
- **Universal hybrid root:** not a valid shortcut. A hybrid can combine role-specific supports only under an explicit composition rule and dependency closure; complexity or the number of components does not create independence.

### Best-aligned semantic direction — proposal, not accepted decision
The direction most consistent with the recorded goal of a personal, local-first, provider-independent Nexo is:

1. **Legitimacy rule:** explicit owner-authorized commissioning under the intended Constitution, with the owner's authority defined normatively before technical authentication.
2. **Independent recognition:** the initial approval must be recognized through a pre-existing basis outside the uncommissioned Nexo instance. The concrete channel and verifier are not selected.
3. **Exact binding:** the ceremony must bind approval to the exact Constitution identity/content/version and commissioning context, using freshness/replay protections and meaningful presentation. This does not prove freedom from every form of coercion.
4. **Bounded scope:** commissioning establishes the initial constitutional binding only; it does not grant arbitrary future action permissions, silently approve amendments, or appoint all future successors.
5. **Succession:** later amendment and succession follow a rule established by the recognized Constitution. The technical recovery mechanism cannot choose its own legitimacy or become a second Constitution.
6. **Failure semantics:** if the owner/legitimacy source cannot be authenticated or currentness is unresolved, keep dependent protected activation blocked. Preserve safe, non-dependent functions only where independently authorized. Do not silently substitute a provider, recovery key, threshold, or device.

This is a recommendation at the semantic level because it best preserves the stated goals without granting a provider or model constitutional authority. It is **not** a decision that any particular channel, verifier, device, credential or platform is trustworthy, and it does not unblock implementation.

### Remaining governance choice that cannot be inferred from technical research
The material unresolved choice is whether the user wants **owner-authorized commissioning as the normative legitimacy rule** (with the technical method still open), or wants a different legitimate governance model such as multiple custodians or a pre-designated external authority. No security standard or cryptographic mechanism can answer that normative question for the owner.

### Current decision state
- 🟢 Self-verifying genesis and hardware-only governance are eliminated as standalone bases.
- 🟢 Provider authority, threshold governance and hybrid composition remain conditional, not defaults.
- 🔵 Owner-authorized commissioning is the best-aligned semantic proposal, **not yet accepted as a frozen governance decision**.
- 🔴 No concrete verifier/root/channel selected; Trust Foundation and Constitution Authority Context remain blocked.
- 🔴 No implementation authorized.

The current NIST SP 800-63B-4 guidance is relevant to authenticator binding, invalidation and account recovery lifecycle, but it governs digital authentication practice; it does not determine Nexo's constitutional legitimacy rule. See https://csrc.nist.gov/pubs/sp/800/63/b/4/final.


## Explicit owner governance decision — 2026-10-08

**Decision received from the owner:** “La autoridad soy yo y después de mi sería mi hija … todo solo sobre mi autorización.”

This explicitly resolves the previously open normative choice for the initial Nexo governance model:

1. **Initial constitutional authority:** Kevin is the sole initial human authority entitled to authorize Nexo's initial commissioning. No model, provider, device, recovery agent, local process, or technical credential may appoint itself or another party as constitutional authority.
2. **Owner authorization is the legitimacy rule; authentication remains separate.** The system must still establish, through a yet-unselected independently trusted mechanism, that a commissioning/amendment/other protected authorization genuinely came from Kevin and binds the exact action and Constitution/context. A claimed approval, voice match, local flag, valid signature, or recovered snapshot alone is not sufficient proof.
3. **Future intended successor:** Kevin's daughter is the intended successor after him. She is currently a baby and has no present Nexo authority by virtue of this stated future intention. This is a succession intention, not a current credential, delegation, or automatic transfer.
4. **Succession details remain to be governed before any transfer:** the exact triggering condition and evidence (including death, permanent incapacity, or any other condition), her eligibility/assumption ceremony, how she is authenticated at that future time, how Kevin's authority is fenced/revoked where applicable, and how disputes or unavailable evidence are handled must be specified in advance while Kevin can authorize those rules. Do not invent or infer these details, and do not let the successor or recovery mechanism decide them unilaterally.
5. **Scope of “only on my authorization”:** constitutional legitimacy, commissioning, protected authority-root changes, constitutional amendments, and succession must trace to Kevin's authorization under the Constitution until a valid, pre-authorized succession occurs. This does not mean every harmless interaction or low-risk operation must require a fresh explicit human approval; ordinary capabilities must remain separately bounded by the Constitution, policy and action-specific risk. No operation may bypass those limits by invoking “owner authorization.”
6. **No technical selection or activation implied:** this decision does not select a phone, voice/face method, cryptographic authenticator, verifier, hardware root, vendor, protocol, or recovery design. It does not accept the bounded prototype verifier assumption and does not authorize protected implementation.

### State after the owner's decision
- 🟢 Normative initial authority choice: ACCEPTED — sole initial authority is Kevin.
- 🟢 Intended future successor: ACCEPTED as an intention — Kevin's daughter after him; she has no present authority.
- 🔵 Detailed succession trigger and transfer ceremony: OPEN; must be governed explicitly before any transfer.
- 🔴 Independent authentication/verifier/root, enrollment, currentness, recovery and enforcement: unresolved; protected activation remains blocked.
- 🔴 Implementation and protected root operations: NOT AUTHORIZED.

### Next required work
Do not ask again who holds initial authority. Continue P0 research by adversarially reviewing this owner-approved semantic rule for coercion, disputed intent, incapacity/death evidence, compromised/lost channels, succession races, predecessor fencing, Constitution amendment and future transfer to a currently minor successor. Separate questions that Kevin can decide normatively from mechanism properties that can be tested. Do not freeze a specific succession trigger or implementation mechanism without explicit authorization and supporting evidence.
