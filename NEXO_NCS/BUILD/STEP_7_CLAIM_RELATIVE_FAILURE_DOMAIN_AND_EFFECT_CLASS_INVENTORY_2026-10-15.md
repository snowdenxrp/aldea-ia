# STEP 7 — Claim-relative failure-domain and effect-class inventory — 2026-10-15

Branch: `ncs-clean-architecture`  
Status: DESIGN INVENTORY ONLY — NO TARGET, ROOT, CEREMONY, OR IMPLEMENTATION SELECTED

## 1. Purpose and basis

The existing trust-role map's next action is to inventory concrete target capabilities and protected-effect classes before choosing a recognition family. This document performs that bounded inventory using the already-inspected source trace and current trust contracts. It does not repeat the closed historical audits and does not infer runtime guarantees from design documents.

Existing evidence reused:
- `STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`
- `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`
- `STEP_7_CURRENT_PHONE_CANDIDATE_THREAT_MODEL_2026-10-08.md`
- `STEP_7_CONCRETE_MUTATION_BOUNDARY_SOURCE_TRACE_2026-10-14.md`
- `STEP_7_OWNER_APPROVAL_TRUST_PATH_COMPARISON_2026-10-15.md`
- Existing MASTER + AB + P/P112 semantics as cited in those records.

## 2. Claims must not be collapsed

| Claim | What it could establish | What it does not establish |
|---|---|---|
| Human review/presentation | Owner was presented a specific complete artifact under a stated presentation assumption | Artifact legitimacy, key enrollment, canonical currentness, effect permission |
| Owner intent/approval | Owner deliberately approved a precisely bounded statement/scope | That the statement was legitimate under a governing Constitution or current |
| Key identity/custody | A statement was signed by a particular key, under a defined key relation | Who legitimately enrolled the key, informed intent, authority, truth or currentness |
| Device/software integrity | Bounded properties of measured/verified components under an identified appraisal policy | Constitutional legitimacy, components outside coverage, or the correctness/currentness of policy itself |
| Genesis Trust Foundation | The explicitly governed initial basis from which constitutional trust may be recognized | Constitution contents, identity, policy, recovery, mission or execution authority by itself |
| Constitution Authority Context | Which constitutional regime is in force for a claim, if its provenance/currentness are established | Actual enforcement at an effect sink |
| Effect admission | A specific operation is allowed at the final effect-capable boundary under the required current dependencies | That an external effect succeeded unless the resource/effect boundary supplies evidence |
| Continuity/recovery | History and restoration under pre-established rules | Legitimacy or currentness merely because a record was restored |

No claim may be promoted to a stronger row without a separately specified composition rule and evidence.

## 3. Candidate target capability inventory

| Candidate | Evidence currently available | Material common-mode / failure domain | Disposition |
|---|---|---|---|
| POCO X7 Pro as initial presentation channel | Owner-selected candidate channel; bounded assumption that its screen faithfully presents content for the first ceremony only | Physical device, boot chain, OS/updates, account/app/session, rendering/accessibility/keyboard, storage/backup and network dependencies are not independently appraised for this claim | Presentation assumption only; not a root or long-term verifier |
| YubiKey 5 NFC | Official vendor SDK documentation supports PIV/OpenPGP signing from Android with suitable integration; no project integration tested | It protects key custody after enrollment but has no trusted Constitution display; phone still may choose bytes, explain scope, and control verifier | Optional future signer component; not bootstrap root |
| Moto G52 offline | Physical spare exists; no selected build, trusted parser, app provenance, boot-state proof, or recovery/rollback procedure for this purpose | Offline mode reduces network paths only. Hardware/OS/app/display/update/provisioning and human transfer are still dependencies; common origin of code or copied configuration may couple it to POCO | Candidate for a bounded experiment only; not independent by assumption |
| Termux on POCO | Existing local command-line capability and clipboard testing in prior M1 work | Same handset/OS; scripts/packages and command output are not independently trusted evidence | Engineering utility only; no trust credit |
| Git repository / GitHub Actions | Repository history and exact CI run evidence are available for narrow source/test claims | Repository credentials, branch/commit policy, workflow definitions and runner environment are not the owner's independent constitutional root | Source/evidence provenance support only; not constitutional ratification |
| External verifier / independent display | No verifier implementation, separately trusted policy owner, or independent trusted display path selected | Trust-anchor provisioning and policy-currentness themselves require a pre-existing basis | Required question, not an available component yet |

The accepted POCO presentation assumption is deliberately narrow. It must not be generalized to the POCO OS, Core, signing bytes, storage, verifier, future operation or final enforcement.

## 4. Existing effect-capable paths and classes

The source trace identifies the following concrete simulation mutations and records, but does **not** designate any as the owner-approved activation target:

1. **World/simulation mutation:** simulation tick and `executeAction(simulation, agent, intent)` mutate simulation state; ordinary Lúmina and Nexo adapter paths share the primitive.
2. **Nexo adapter effects:** registered effect handlers call `executeAction` for actions such as rest, eating/drinking, fishing, gathering, building/crafting/farming, contributions/withdrawals and trade. These are simulation effects, not proof of authorization for future real-world actions.
3. **Outcome/history recording:** runtime records mission/execution/outcome in Nexo memory. Recording an outcome is not the same as gating the original mutation.
4. **Prepared intent/journal/reconciliation:** journal or prepared records do not prove an effect did not occur; reconciliation is not an authority root.
5. **Snapshot persistence:** `scripts/simulate.mjs::persistState(expectedRevision)` is the existing conditional whole-snapshot persistence owner for cooperating writers. It is not shown as the final commit of the Nexo runtime path traced above and does not confer constitutional authority.
6. **Future external/protected effects:** no deployment-specific real-world sink is selected or demonstrated; do not invent one or infer that simulation checks protect it.

### Consequence

The current code evidence does not provide a justified single insertion point for a universal authority check. `executeAction` is shared with ordinary simulation and the admission footprint includes dependencies beyond the action call. Any future target must first specify whether it protects a simulation mutation, durable state transition, external side effect, or a combination, then trace every caller and last effect-capable boundary.

## 5. Failure-domain and currentness obligations by claim

- **Owner intent:** session identity, physical possession, PIN, touch or successful UI response are insufficient alone. Exact scope and reviewed-content binding remain unresolved.
- **Artifact integrity:** hash identifies bytes only after canonical bytes/artifact scope are defined. It does not establish the artifact as legitimate.
- **Key enrollment:** no key may appoint itself or be enrolled solely by accepting a fingerprint presented by the same candidate host whose legitimacy is in question.
- **Verifier provenance:** verifier policy and trust anchors must have a pre-existing establishment basis; an appraisal result cannot authenticate its own policy.
- **Currentness/revocation:** local time, revision, epoch, latest local file, repository head or lack of a newer record do not independently prove canonical currentness. Offline inability to resolve required currentness remains UNKNOWN.
- **Rollback/replay/conflict:** preserve competing evidence; do not choose based only on timestamps, sequence numbers or availability. Any later protocol must bind its decision to governed predecessor/fencing and revocation dependencies.
- **Final effect enforcement:** the last effect-capable resource boundary must enforce the applicable decision with the required current dependencies. A STOP flag, local invalidation, signed approval or successful test does not prove bypass closure.
- **Recovery/succession:** no recovery key, spare device, restored snapshot or future successor can silently become a second root. Recovery rules must be authorized before the crisis or remain UNKNOWN.

## 6. What this inventory rules out

1. Buying a YubiKey as if it solved initial legitimacy.
2. Calling the Moto G52 independent merely because it can be offline.
3. Treating the POCO display assumption as a blanket trusted-device claim.
4. Creating a local review record and calling it independent proof.
5. Inserting an arbitrary gate into shared `executeAction` without an approved protected-effect scope.
6. Adding a generic trust registry, quorum, queue, retry, global epoch, second commit primitive or other mechanism to mask missing root semantics.
7. Re-running CI or adding tests before the actual target and trust claim are selected; current green runs remain narrow source/test evidence only.

## 7. Minimum decision still needed before implementation

The owner-facing design must answer, in this order:

1. **Initial claim:** Is the immediate goal only a record that the owner reviewed a draft, or a genuine constitutional ratification? These are not interchangeable. No ratification is recorded.
2. **Threat claim:** Must the ceremony withstand a malicious/substituted Core or compromised POCO OS, or is the previously accepted first-ceremony presentation assumption explicitly sufficient for a lower-assurance, non-authoritative review record?
3. **Independent path:** What component can show/parse the same complete artifact and bind it to the signed/approved statement, and what establishes that component's own provenance? If no such path is justified, keep the stronger claim UNKNOWN.
4. **Effect class:** Which exact effect boundary is in scope first: candidate-document recording, simulation-state mutation, durable constitutional state transition, or a future external effect? Do not pick by convenience.
5. **Currentness:** Which already-governed basis resolves revocation, competing versions and recovery at the point the claim is consumed? If none exists, no current authority may be asserted.

These are unresolved decisions, not a form for the owner to fill out and not permission to implement. Research may continue by mapping existing contracts; code/device/key changes remain blocked until the answers and their evidence requirements are explicit.

## 8. Disposition

- No device, host, verifier, signer, trust anchor, artifact version, ceremony, or effect target selected.
- No Constitution review/ratification event is claimed.
- No key, signature, digest, implementation, tests, workflow, dependency, APK, deployment or device configuration changed.
- The source trace and existing contracts are reused; no closed historical audit was rerun.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
