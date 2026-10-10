# STEP 7 — Recommended Bootstrap Posture and Safe Parallel Progress — 2026-10-09

Status: TECHNICAL RECOMMENDATION RECORDED; NOT A CONSTITUTIONAL COMMISSIONING DECISION; NO ROOT, CEREMONY, CREDENTIAL, KEY, OR ACTIVATION AUTHORIZED.

## Why this record exists

The owner delegated the technical recommendation because the trust/commissioning alternatives are not yet accessible enough for him to choose safely. This delegation authorizes analysis and a recommendation; it does not transfer constitutional authority to the assistant and does not itself approve commissioning, risk acceptance, a trust root, or a ceremony.

## Recommendation

**Do not treat the current unverified phone, its local UI, local files, a newly generated key, a hash, or a local confirmation as an independently established trust root for protected Nexo commissioning.**

Also **do not freeze all Nexo development while this boundary remains unresolved**. Separate low-risk construction and experimentation from protected authority.

### Track A — may proceed under an explicitly untrusted development posture

Work may continue on architecture, interfaces, simulations, non-sensitive local prototypes, tests, and reversible experiments where the environment is treated as untrusted and the work cannot silently establish authority or cause protected external effects.

Required constraints:
- no real commissioning, activation, root enrollment, authority promotion, or protected-Core claim;
- no production secrets or credentials placed in the development prototype;
- no irreversible/high-impact external actions;
- no claim that local test success establishes deployment integrity;
- UNKNOWN/STOP at any protected boundary;
- development artifacts must be clearly distinguishable from commissioned authority and production state.

These are limits on the development posture, not a claim that the phone is secure.

### Track B — protected commissioning remains blocked

Before protected commissioning, the design must establish a defensible basis for all of the following, scoped to the actual deployment:
1. Kevin's intentional approval of the exact Constitution version/content and included/excluded authority scope;
2. freshness and replay resistance for that specific approval;
3. a protected record of the approval and establishment provenance;
4. the integrity assumptions of the device/channel that presents and records the ceremony;
5. currentness/revocation behavior when offline;
6. recovery/replacement without silently reviving a compromised root;
7. the final enforcement boundary and evidence that prohibited bypass paths are closed.

A local signature/hash can bind bytes; it cannot alone prove who approved them, what they saw, whether the channel was compromised, or that the resulting authority is protected. Biometrics, a witness, an identity credential, or platform attestation may contribute narrowly scoped evidence only after their own trust assumptions and limits are established. None becomes Nexo's constitutional authority by default.

## Treatment of the owner-only bootstrap candidate

The owner-initiated bootstrap under a declared initial trust assumption remains a candidate for **study**, not the recommended basis for protected commissioning on the current unverified phone. It can only be reconsidered after a claim-relative threat analysis explains what the assumption permits, what it cannot resist, what recovery looks like, and which controls reduce the risk. Studying it is not acceptance; acceptance is not implementation; implementation is not runtime proof; runtime proof is not deployment proof.

The more conservative alternative—requiring an independently established recognition basis before any protected commissioning—remains the default recommendation. It does not require a third party to become constitutional authority: an independent mechanism may provide bounded integrity/recognition evidence while Kevin remains the sole constitutional authority under the current governance preference.

## Next concrete work (reuse the existing inventory; do not duplicate it)

The repository already contains `NEXO_NCS/BUILD/STEP_7_CLAIM_RELATIVE_DEPLOYMENT_FAILURE_DOMAIN_INVENTORY_2026-10-09.md` and the design candidate `NEXO_NCS/BUILD/STEP_7_M1_READ_ONLY_INTERACTION_BOUNDARY_CANDIDATE_2026-10-08.md`. Do not create a second inventory or reopen broad trust-family research.

Next, perform a bounded **design-only readiness review** of that existing M1 read-only slice against the claim-relative inventory and MASTER/Core constraints:
- confirm that it truly remains separate from commissioning and has no tools/effects, durable memory, credentials, network egress, or silent remote fallback;
- distinguish semantic guarantees from runtime-enforced properties and explicitly list every unverified platform/runtime assumption;
- identify the smallest useful read-only prototype that could be developed without claiming protected authority, privacy/no-egress, or production security;
- check whether the existing repo already contains the relevant code/tests before proposing anything new;
- do not change code, add dependencies, choose a model/platform, or create runtime/network/persistence paths without explicit implementation authorization.

If M1 cannot be made meaningfully useful under those limits, report that rather than manufacturing a parallel workstream. Protected commissioning remains separately STOP.

## Explicit non-claims

- P1/P2 are not resolved.
- Step 7 is not passed.
- Path A is not accepted; Path B is not established; Path C remains uncommissioned UNKNOWN/STOP.
- No physical trust-root family, ceremony, credential, key, quorum, provider, device root, or recovery authority is selected.
- No runtime or production-security evidence is added by this record.
- This record is a technical recommendation, not a Constitution amendment or delegation of constitutional authority.
