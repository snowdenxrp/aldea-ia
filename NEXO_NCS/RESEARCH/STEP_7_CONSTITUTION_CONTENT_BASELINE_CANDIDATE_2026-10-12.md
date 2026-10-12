# STEP 7 — Constitution Content Baseline Candidate — 2026-10-12

Status: OWNER-REVIEW DRAFT / PROPOSAL ONLY / NOT A GOVERNING CONSTITUTION / NOT APPROVED FOR FREEZING OR COMMISSIONING

## Purpose and strict status

This document assembles a human-readable candidate baseline from already-recorded Nexo architectural principles so that the owner can review the proposed meaning before any future exact-content comparison is designed.

It is not the canonical Constitution, does not replace MASTER or existing contracts, does not settle unresolved governance conflicts, and does not grant live authority. Its presence, Git history, commit identifier, or any later digest must not be treated as constitutional legitimacy.

No real commissioning digest, challenge, credential, signature, or approval record is to be created from this proposal.

## Candidate clauses supported by existing sources

### B1 — Separation of semantic roles

Trust, identity, authority, capability, policy, execution, effect, and verification are distinct. Information is not instruction; instruction is not permission; permission is not authority; authority is not action. A valid record, signature, hash, version, epoch, snapshot, or successful application-state commit cannot be promoted into a stronger claim without a separate governed rule and claim-specific evidence.

Traceability: `docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md`; `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`; AB constraints recorded in the Step 7 trust contracts.

### B2 — Model, provider, operating system, device, and interface are not Nexo

Nexo Core is intended to remain independent of any single model provider, operating system, device, or user interface. These are replaceable or bounded environments/adapters, not constitutional authorities. Model output may propose, reason, plan, or explain; it cannot grant itself authority or directly produce protected effects.

Traceability: `docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md`; `NEXO_NCS/RESEARCH/STEP_7_CONSTITUTION_CONTENT_PROVENANCE_MATRIX_2026-10-09.md` (C-16).

### B3 — Lúmina is separate from Nexo's authority

Lúmina is a simulation/laboratory environment. Simulated state, simulated observations, model output, and learning results are not by themselves evidence of the external world, constitutional authority, or permission to execute real-world effects. Learning may propose knowledge, strategies, or changes but may not silently change the Constitution, weaken controls, grant authority, or self-approve critical changes.

Traceability: `docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md`; content-provenance matrix C-16.

### B4 — Claim-specific trust and no self-authentication

A trust basis is meaningful only for a named claim, scope, and threat model. Evidence cannot establish the trust anchor or appraisal rules used to validate that same evidence. A candidate Genesis bundle, local file, model/provider output, self-generated key, digest, signature, or self-reported status cannot establish its own constitutional legitimacy. Multiple records or devices do not prove independence when material dependencies are shared or unknown.

Traceability: `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`; `NEXO_NCS/BUILD/STEP_7_GENESIS_TRUST_FOUNDATION_ATTACK_REVIEW_2026-10-12.md`.

### B5 — Unknown, invalid, conflict, and stop semantics

If required authority, provenance, scope, currentness, dependency, ordering, or verification evidence is missing or conflicting, the dependent protected transition must not proceed. The result remains UNKNOWN/HOLD/STOP unless a governed rule supports a more specific result. There is no silent permissive fallback, automatic succession, or authority promotion from availability pressure.

Traceability: Trust Function / Root Role Map; Genesis recognition precondition; existing AB and P/P112 evidence-integration constraints.

### B6 — Constitution and Policy are separate but bound

The Constitution defines the governing authority domains, constraints, and governance rules. A Policy cannot originate its own authority. A Policy binding must be established under the recognized constitutional regime and bind the relevant policy identity/semantics, authority domain, applicability, validity, dependencies, and protected establishment provenance. A valid binding does not automatically authorize every action.

Traceability: `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`; `NEXO_NCS/BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`.

### B7 — Approval must be bounded to exact content and purpose

Any future initial-commissioning approval process must make the complete relevant Constitution revision, its human-readable meaning, version, commissioning context, and narrow scope reviewable; bind the approval to that exact content/context and a fresh request; and reject mismatches, replay, stale evidence, or unknown status. A digest may support byte comparison only against a separately recognized digest; it does not create legitimacy or prove that the human-readable meaning matches the approved bytes.

Traceability: content-provenance matrix C-09/C-13; bounded human-comparison protocol candidate. This is a design requirement, not evidence that a trusted presentation or approval path exists.

### B8 — Initial activation must not imply broad operational authority

The narrow first-transition candidate is recognition of exactly one initial Constitution/version/context. That transition alone does not authorize missions, policy selection, admission, tools, model/provider actions, device/TV control, execution, external effects, amendment, root rotation, recovery, succession, delegation, or autonomous operation. Each would require its own governed basis and transition.

Traceability: `NEXO_NCS/BUILD/STEP_7_INITIAL_CONSTITUTION_ACTIVATION_SCOPE_AND_BOUNDARY_DECISION_2026-10-11.md`.

### B9 — Emergency containment is not unrestricted execution

The existing MASTER baseline describes emergency authority primarily in terms of STOP, FENCE, REVOKE, ISOLATE, and QUARANTINE, not unrestricted execution or governance replacement. Emergency and recovery modes must have bounded authority and explicit transitions; they cannot silently widen their scope or become a second constitutional root.

Traceability: `docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md`; Trust Function / Root Role Map. Exact deployed enforcement is not established.

### B10 — History, snapshots, recovery, and succession do not create authority

A snapshot can preserve data but cannot alone prove that stored authority remains legitimate or current. Rollback cannot resurrect revoked authority. A successor or fork does not automatically inherit Nexo's operational identity or authority. Recovery, replacement, succession, conflict ordering, and continuity require prior governed rules and a legitimate recognition basis.

Traceability: MASTER preservation addendum; AB104.451/.452 and existing recovery/succession cross-checks summarized in content-provenance matrix C-11/C-12.

## Explicit unresolved items — not silently filled by this draft

### U1 — Meaning of “external/independent authority or threshold” in MASTER

The historical MASTER bootstrap sentence can be read as requiring either (A) an external constitutional decision-maker or (B) an independently grounded technical/evidentiary mechanism that supplies evidence for verifying the owner's authorization without becoming constitutional authority.

**Owner's current interpretation (2026-10-12; tentative):** Kevin believes the intended meaning was likely option B. This is consistent with the prior NCS trust-role discussion: evidence/attestation/appraisal is separate from verifier, relying party, and authorization; appraisal can yield a scoped verification result but does not itself grant constitutional authority. The existing trust-role map also states that evidence cannot establish the trust anchor or appraisal policy used to validate that same evidence.

This narrows the likely intended meaning but does not prove the historical author's intent or define a valid mechanism. Do not silently rewrite the historical MASTER sentence. Treat option B as the working interpretation for further design, while preserving the original wording and marking the formal reconciliation as **PROVISIONAL / OWNER-REVIEW**, not as a commissioned trust basis. The mechanism must still have claim-specific scope, independently recognized provenance, dependency closure, currentness, and fail-closed semantics; it may verify evidence of Kevin's authorization but may not replace Kevin as constitutional authority.

### U2 — Actual canonical Constitution content and approval

This candidate is not yet the canonical Constitution and has not been approved clause-by-clause. The existing content-provenance matrix is an inventory, not the Constitution. No canonical bytes or digest exist for this candidate as a governing regime.

### U3 — Initial trust basis and verifier

No concrete independently recognized reference, enrollment basis, Genesis verifier, verifier provenance, or protected AuthorityGate implementation is established. A human-comparison assumption does not substitute for these technical requirements.

### U4 — Human-readable rendering bound to exact bytes

Canonical serialization, rendering equivalence, how material meaning/scope is presented, and proof that displayed content equals committed content remain unresolved.

### U5 — Currentness, revocation, offline behavior, amendment, and conflict ordering

No stale window, offline permission set, revocation path, amendment procedure, supersession rule, or conflict-ordering mechanism is selected. Do not invent defaults.

### U6 — Recovery, replacement, and succession

No operational recovery root, replacement ceremony, successor eligibility/proof, dispute process, interim authority, or succession activation is established. The recorded future-successor preference is not current authority.

### U7 — Canonical active-Constitution owner and final enforcement

The reviewed source does not evidence a canonical Core-owned active-Constitution state owner, a production Genesis-specific AuthorityGate, or a last protected activation/effect boundary with bypass closure. This draft cannot supply those missing implementations.

## Owner-review gate

Before this baseline can become a candidate for exact-content comparison:

1. Review each B-clause for meaning and traceability; reject or revise any clause that goes beyond existing decisions without labeling it as a proposal.
2. Resolve or explicitly preserve U1 as an unresolved conflict; do not pretend the Constitution is complete while the conflict affects the meaning of authority.
3. Decide which unresolved items belong in the first constitutional text versus later governed procedures, without silently filling technical gaps with normative wording.
4. Produce a new explicitly reviewed revision if changes are made. Only then may a separate comparison design discuss how that exact revision would be recognized.
5. Keep technical establishment and enforcement gates separate. Approval of text does not commission Nexo.

## Disposition

Proposal-only content baseline assembled for owner review. No canonical Constitution is frozen or approved; no root, reference channel, credential, verifier, state owner, or final effect boundary is selected. No code, test, workflow, APK, device, key, or protected state is changed or authorized. Step 7 remains active; protected commissioning remains OPEN / STOP / UNKNOWN.
