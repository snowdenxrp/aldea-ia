# STEP 7 — MASTER / legacy research check: genesis scope and authority-owner gap — 2026-10-14

Branch: ncs-clean-architecture
Status: SOURCE RECONCILIATION ONLY — OPEN / STOP / UNKNOWN

## Question
Do the authoritative MASTER and already-existing authority-unavailable/succession research records already choose (a) the exact initial activation claim and (b) a legitimate canonical current-branch owner / final protected sink?

## Sources inspected
- `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md`, blob SHA `78872e9c86bac2738de9ab49f6f3d35a075c8bcf`.
- `docs/nexo/NEXO_AUTHORITY_UNAVAILABLE_BOUNDED_SAFETY_CONSTITUTIONAL_SUCCESSION_RELEASE_RESEARCH_V1_2026-09-24.md`, blob SHA `dee65e14288f77a283a3d88e44ae8afcc0fa9e87`.
- `NEXO_NCS/BUILD/STEP_7_SMALLEST_AUTHORITATIVE_ADMISSION_INPUTS_2026-10-08.md`, blob SHA `4bb9675d90f27ffcb4eaf88e903d65a02dcc5b2d`.
- Current-branch source crosswalk, claim-relative inventory, protected activation lifecycle and commissioning matrix.

## MASTER findings

MASTER explicitly states:
- Nexo must not self-declare trusted.
- A Genesis Trust Bundle concept includes Constitution hash, trust anchors, recovery authorities, policy/reference hashes, admitted artifacts/dependencies, platform measurements, initial epoch and approval evidence.
- The conceptual first-boot order starts with hardware/platform root and verified/measured boot, then bootstrap runtime, Constitution, policy/references, gate/PEP, identity, Nexo and capabilities.
- Bootstrap failure means NO_ACTIVATION/RECOVERY.
- Genesis activation requires an external/independent authority or a threshold arrangement depending on deployment.
- Trust anchors, recovery authority, identity issuers, capability authority, Constitution/policy signing, audit keys and data keys must be separated.
- Critical UNKNOWN/CONFLICT/UNTRUSTED conditions fail closed.

These are normative architecture requirements, not evidence that the repository has a concrete Genesis owner, a selected threshold, an established verifier, a canonical current-branch owner or a real final sink. The “depending on deployment” qualification means the deployment-specific claim and failure-domain rule must be made explicit before a root family can be selected.

The first-boot hardware/platform root in MASTER is a platform/bootstrap dependency; MASTER does not say that possession of the POCO, its fingerprint reader, Android attestation, or a phone-generated key automatically becomes Nexo's constitutional authority. Reading it that way would violate the authority separation in MASTER and the accepted narrow limit of the POCO assumption.

## Legacy bounded-safety/succession research

The 2026-09-24 research describes a conceptual safety corridor for loss of authority, succession, predecessor fencing, revalidation and explicit release. It also says bounded safety cannot grant ordinary authority, redefine succession, create a trust anchor, broaden its own scope or publish constitutional currentness; stale snapshots may restore safety configuration but not current authority.

That research contributes lifecycle requirements and anti-amplification invariants. It does not itself identify the currently authoritative Constitution branch, a production enforcement owner, or a commissioned activation scope. A conceptual corridor is not proof that the repository's runtime enforces it.

## Smallest-authoritative-inputs contract

The 2026-10-08 admission-input contract expressly says the input classes can be defined but the repository evidence is insufficient to derive a legitimate admission policy or authoritative selection rule. This supports the current stop finding: more field schemas or generic contracts cannot manufacture the missing authority decision.

## Reconciliation result

No contradictory rule was found in these inspected records. The apparent gap is not that MASTER says nothing about Genesis; it specifies the required conceptual contents and the need for an external/independent authority or deployment-governed threshold. The missing element is a **concrete, justified deployment-specific realization** tied to:
1. the exact initial activation claim and exclusions;
2. the initial recognition basis and its provenance;
3. the canonical current-branch rule;
4. the actual final protected sink and its bypass closure.

Therefore the earlier conclusion is narrowed, not reversed: MASTER provides normative requirements, but no already-selected owner/sink or exact scope sufficient to implement or commission STEP 7.

## Consequence

- Do not reinterpret hardware/platform root as constitutional owner.
- Do not select a threshold or root family merely because MASTER lists it as a possible deployment-dependent arrangement.
- Do not convert the conceptual succession/safety corridor into runtime evidence.
- Do not create a digest, key, ceremony or code path to fill the gap.
- Use the next owner-level architecture discussion only for the unresolved claim/scope and deployment trust premise; keep implementation blocked until those premises are concrete.

## Non-actions and status
No code/tests changed or ran. No root, verifier, key, signature, digest, Constitution freeze, ceremony, recovery reference, device, deployment or runtime authority was selected/created. No protected effect is authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
