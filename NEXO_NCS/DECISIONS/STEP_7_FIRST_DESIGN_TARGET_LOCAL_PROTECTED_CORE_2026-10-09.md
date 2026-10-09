# STEP 7 — First Design Target: Local Protected Core — 2026-10-09

Status: DESIGN-SCOPE DECISION — NO DEPLOYMENT TARGET / ROOT / IMPLEMENTATION SELECTED

## Decision

The first design target is the **local protected Core authority-establishment boundary**, ahead of device control.

This decision was made at the user's request to proceed with the recommended choice. It selects which architectural question to resolve first. It does NOT select a host, OS, hardware root, credential, identity ceremony, commissioning environment, or root family; it does NOT accept Path A; and it does NOT authorize implementation or activation.

## Why this is the correct order

The local Core is the narrowest useful starting boundary because constitutional authority must be recognized before downstream policy, capabilities, missions, or device effects can legitimately rely on it. Device control would add target state, effect-path closure, bypass analysis, and effect observation before the initial authority basis is established.

The existing role map and Genesis contract already separate Genesis Trust Foundation, Constitution, Identity, Policy, Recovery Authority and Execution Authority. The Constitution Authority Context contract already says that caller-supplied fields are proposals until a protected boundary establishes them. Its future-countereffects gate explicitly prohibits implementation while no independently recognized trust foundation exists.

The historical AB104.368 distinction remains binding: authority validity and target validity are independent; one cannot compensate for the other. The current choice only scopes the first design question and does not collapse those frontiers.

## First claim to resolve

> **Claim LCORE-1:** The local Core must not treat a proposed constitutional regime as the currently governing regime unless its establishment is supported by a legitimate, independently recognized Genesis Trust Foundation and claim-relevant currentness, provenance, dependency, and lifecycle evidence.

This is a design claim, not a claim that such a foundation exists today.

### What a future positive result would establish

Only that the exact constitutional regime and scope are legitimately established for subsequent governed evaluation within the declared local-Core threat boundary.

It would not by itself establish:
- that a particular user has authenticated;
- that a Policy is valid or a claim is admitted;
- that a device target is current;
- that an action is authorized or executed;
- that an external effect occurred or was prevented;
- that recovery or succession is valid beyond the exact governed scope.

### Required negative behavior

If the genesis basis, owner-recognition relation, constitutional binding, provenance, dependency closure, currentness/revocation, or relevant conflict/order is unknown, the authority-establishment result remains UNKNOWN/HOLD. The Core must not promote a model/provider output, caller-supplied field, local snapshot, hash, signature, version, epoch, or self-reported PASS into constitutional authority without a separately established basis that gives that evidence the required meaning.

This is not a universal shutdown policy. Only transitions dependent on the unresolved claim are blocked; any other safe behavior would need to be expressly permitted by the governing Constitution, which is not yet established here.

## Scope boundary

In scope now:
1. State the exact local-Core claim and its limits.
2. Identify which facts must be independently recognized versus merely measured or reported.
3. Instantiate relevant dependency/failure domains once an actual deployment environment is known.
4. Attack self-rooting, trust recursion, replay/snapshot resurrection, stale revocation, common-mode failure, owner/host substitution, provider capture, and recovery circularity.
5. Preserve the existing semantic contracts; do not create another generic trust layer.

Out of scope for this first target:
- selecting or enrolling an INE/FIDO/hardware credential;
- accepting Path A or choosing Path B;
- choosing TPM, secure boot, cloud KMS, blockchain, a vendor, a model, or a physical root family;
- defining succession for the user's daughter;
- device-control APIs, TV/home automation, broad effect execution, or a universal gateway;
- implementing Constitution Authority Context or Genesis Trust Foundation before its recognition prerequisite exists.

## Adversarial acceptance gate

Before this design claim can be considered sufficiently specified, attack at least these cases:

1. Core calls itself trusted because it is the Core.
2. Constitution data contains a valid-looking signature but no legitimate binding from signer to governing authority.
3. A valid older snapshot is replayed after revocation, replacement, or constitutional change.
4. A model/provider supplies the root reference, appraisal result, or provenance used to trust itself.
5. Local storage is intact but its authority has expired, been revoked, or lost currentness.
6. Recovery depends on the same compromised authority it claims to recover.
7. Two nominally separate supports share a material host, firmware, update, operator, policy, or recovery failure domain.
8. Identity evidence is valid but the scope of the authenticated act does not include constitutional commissioning.
9. An attacker substitutes the displayed Constitution or ceremony context between user review and binding.
10. The initial basis is unavailable and the system silently falls back to an ungoverned credential, provider, snapshot, or default.
11. A positive Core-level result is incorrectly reused as permission to execute a device action.
12. Logs accurately preserve a decision that was never legitimate, and are mistaken for proof of legitimacy.

Any unresolved prerequisite yields UNKNOWN/STOP for LCORE-1. A failure that requires adding a structural patch is a reason to stop and redesign the root contract, not add another layer.

## Evidence basis / non-duplication

This decision reuses rather than replaces:
- `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`;
- `NEXO_NCS/RESEARCH/STEP_7_INITIAL_TRUST_MODEL_FAMILY_COMPARISON_2026-10-09.md`;
- `NEXO_NCS/RESEARCH/STEP_7_DEPLOYMENT_FAILURE_DOMAIN_INVENTORY_2026-10-09.md`;
- the MASTER + AB + P/P112 evidence-integration rule and the preserved AB104.368 authority/target distinction.

The handoff and role-map already record the MASTER/P/P112 synthesis and relevant historical evidence. This step does not reopen completed AB/TLC/Kafka investigations or treat design documents as runtime proof.

## Decision and next action

- First design target: LOCAL PROTECTED CORE AUTHORITY-ESTABLISHMENT BOUNDARY.
- Actual deployment host/platform: UNKNOWN / NOT SELECTED.
- Genesis basis, credential, ceremony, root family: UNKNOWN / NOT SELECTED.
- Path A: NOT ACCEPTED. Path B: NOT ESTABLISHED. Path C remains a valid uncommissioned state.
- Implementation / enrollment / commissioning / activation: NOT AUTHORIZED.
- STEP 7: STOP/UNKNOWN remains.

**Next exact action:** attack LCORE-1 against the existing Genesis Trust Foundation and Constitution Authority Context contracts, record only uncovered contradictions or missing premises, and do not implement. After that, identify the minimum facts needed from an actual deployment environment before evaluating physical root candidates.
