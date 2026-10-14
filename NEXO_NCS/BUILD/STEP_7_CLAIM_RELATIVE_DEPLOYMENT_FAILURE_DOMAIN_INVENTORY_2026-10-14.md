# STEP 7 — Claim-relative deployment and failure-domain inventory — 2026-10-14

Branch: `ncs-clean-architecture`
Status: DESIGN RESEARCH ONLY — NO ROOT FAMILY SELECTED — OPEN / STOP / UNKNOWN

## Purpose

Convert the existing Trust Function / Root Role Map into a concrete claim inventory for the presently evidenced Nexo target. This is not a generic trust architecture and does not repeat closed P112 audits. It distinguishes observed repository behavior, bounded owner-accepted assumptions, and unresolved deployment/governance facts.

## Target boundary and evidence class

| Target / claim | Current evidence | What is not established | STEP 7 consequence |
|---|---|---|---|
| Owner-originated initial constitutional intent | Owner has identified himself as the initial external authority; bounded acceptance exists that the POCO screen faithfully presents exact content during the first ceremony | That phone possession alone authenticates the owner; any permanent trust in Android/POCO/app; a completed approval ceremony; exact review-to-artifact binding | A ceremony may be designed under the bounded assumption, but no approval, key or constitutional artifact may be presumed |
| Candidate Constitution content | Human-readable draft exists with recovered principles separated from OPEN and EXTENSION clauses | Frozen canonical content, approved unresolved governance choices, digest/signature, proof that reviewed bytes equal activated bytes | Draft remains non-operative; no hash/signing yet |
| Bootstrap recognition | Contracts describe typed support, claim scope, dependency closure, currentness and UNKNOWN semantics | A concrete independently recognized basis that can validate the first authority without accepting the candidate as its own root | Genesis recognition remains UNKNOWN; no bootstrap composition can self-authorize |
| Current Constitution selection | Core authority-context contract requires protected establishment and does not infer currentness from version/epoch | Canonical constitutional state owner, branch-selection rule, conflict ordering, revocation and predecessor cutoff at enforcement | No “latest version wins”, timestamp, epoch, hash or available snapshot shortcut |
| State persistence | Existing `scripts/simulate.mjs::persistState(expectedRevision)` serializes a whole simulation snapshot and coordinates cooperating writers | Constitutional legitimacy/currentness ownership; universal cooperation by future writers; complete claim dependency fencing; power-loss durability guarantee | Reuse as persistence primitive only after a legitimate owner lifecycle exists; do not promote `world-state.json` to a trust root |
| State loading / restore | `loadState()` can fall back to fresh defaults on read/parse/schema failure | A protected provenance signal distinguishing canonical state from fallback/default state | Any future protected path must classify uncertain load provenance as UNKNOWN/HOLD; do not alter ordinary simulation recovery in this research |
| Core protected transition | Existing transition composes injected authority gate, isolated candidate, semantic validation and conditional commit | Production authority-gate implementation, canonical constitutional dependency binding, final revalidation at the authoritative linearization point | Existing skeleton is not a commissioned activation path; source-level race closure is unproven |
| Runtime local mutation | Runtime adapter can mutate supplied simulation; `nexoEffectRevision` is in-memory; P112 findings identify no demonstrated final protected sink | Bypass-closed last effect boundary, canonical constitutional admission at that boundary, external effect evidence | Local simulation mutation is not a substitute for protected Constitution activation |
| Offline currentness / revocation | Existing AB104.429 and recovery/root-lifecycle research provide requirements to reuse | Maximum tolerated staleness per protected effect, how revocation becomes effective offline, who can prove predecessor cutoff | No offline permission window or grace period may be invented; unresolved currentness blocks dependent protected effects |
| Recovery / succession | Historical AB research distinguishes recovery, succession, reconciliation and reauthorization | Ratified recovery reference, legitimate successor, threshold/roles, branch precedence and fail-safe behavior when predecessor is unavailable | Recovery cannot create authority; no daughter succession or handwritten reference is presumed ratified |
| Verifier / attestation / platform integrity | RATS role separation and prior research distinguish evidence, verifier appraisal and relying-party decision | A selected verifier/trust-anchor configuration, freshness source, dependency closure, and relationship to owner authority | Attestation may support a bounded integrity claim; it cannot itself establish constitutional legitimacy |
| Final enforcement | P112 audits and current source crosswalk find no demonstrated production protected sink / bypass closure | Exact protected-effect classes and final controllable boundary for each actual deployment | No claim of protected admission or commissioning until a concrete sink and all bypass paths are evidenced |

## Failure-domain inventory

These are dependency classes to evaluate for each named claim, not a claim that every class must be a separate physical device.

1. **Human intent and presentation:** owner, display/application path, artifact selection, review-to-artifact binding. The owner-accepted POCO assumption covers faithful presentation for the first ceremony only; it does not prove biometric identity or platform integrity.
2. **Artifact authenticity and continuity:** candidate Constitution bytes, digest/signature if later selected, source of verification policy, canonical branch ordering. A valid signature can authenticate a statement by a key but cannot independently make the key authoritative.
3. **Trust-root provisioning:** who established the verifier/trust-anchor configuration, through what out-of-band or previously protected rule, and whether that rule is independent of the candidate it recognizes.
4. **Currentness and revocation:** active branch, revocation source, stale/offline state, recovery and successor ordering, predecessor cutoff. Unknown critical currentness means UNKNOWN, not “use the newest available.”
5. **Storage and recovery:** canonical load provenance, backups/snapshots, restore operator, fallback behavior, and shared dependencies with the trust root. Persistence integrity is not current authority.
6. **Execution and commit:** mutable aliases, detached working graph, exact claim dependencies, final semantic revalidation, existing conditional whole-snapshot persistence, and how a revision conflict is classified. The persistence revision is not a substitute for the full authority dependency set.
7. **Final protected resource:** last component capable of causing each protected effect, all alternate/bypass paths, and evidence that denial at that point actually prevents the effect. A STOP request or local flag is not proof of enforcement.
8. **Common-mode administration and updates:** shared owner/operator, account, firmware/update path, verifier policy, backup/recovery key, provider or organizational control. Distinct keys/accounts/devices do not count as independent without claim-specific evidence.

## Recognition-family comparison against this target

| Family | What it could help establish | Blocking dependency in this target | Disposition |
|---|---|---|---|
| Owner-reviewed initial ceremony under the accepted honest-presentation assumption | Human-originated intent for one exact initial artifact, within a bounded first-ceremony threat model | Exact artifact binding, treatment of unresolved clauses, canonical currentness after activation, independent final enforcement and recovery governance remain open | Candidate for continued design, not approved or sufficient by itself |
| Out-of-band / externally provisioned trust bundle | A pre-established verifier/root relation if its provenance and delivery are independently grounded | No concrete provisioning authority, channel, custody or verification boundary has been selected/evidenced | Do not select by name alone; needs a specific, auditable claim and dependency closure |
| Previously protected mutable-root update | Safe root rotation or succession after an already trusted predecessor authorizes it | It cannot solve the first-root problem; predecessor cutoff and currentness enforcement remain unproven | Useful only after a legitimate initial basis and final gate exist |
| Platform/hardware root (measured boot, TPM-like facility, Android attestation) | Bounded device/software integrity or key-protection claims under a trusted verifier/policy | Does not establish the owner's constitutional intent or current Constitution by itself; actual device/verifier dependencies not selected | Supporting evidence only; no hardware/provider selected |
| Multi-root / threshold / witness composition | Resilience against a stated failure class if independence and governing threshold are real | No ratified roles, threshold, failure-domain independence, conflict rule or offline-currentness semantics | Not selectable; no generic quorum engine |
| Git commit/hash/snapshot as the root | Historical byte identity or repository lineage | Repository history cannot by itself establish owner authority, currentness or final enforcement | Rejected as a standalone authority basis |

## Architectural result

No candidate family currently closes the full chain:

`owner intent → recognized initial basis → exact Constitution artifact → current-branch rule → protected authority context → final effect boundary`

The chain is deliberately not collapsed into one root, store, verifier or ceremony. The evidence currently supports a **bounded ceremony design question**, but not a physical-root selection or commissioning.

The smallest next decision-independent design step is to specify a claim-relative activation lifecycle around the already-existing persistence primitive, while keeping legitimacy external to that primitive:

`verified canonical load + provenance`
→ `detached working state`
→ `claim-specific authority/currentness dependencies`
→ `candidate activation evaluated under the recognized rule`
→ `final revalidation at the authoritative commit boundary`
→ `existing persistState(expectedRevision)`
→ `explicit committed / stale / UNKNOWN outcome`

This is a semantic lifecycle proposal only. It does not imply that `world-state.json` is the Constitution owner, that the present Core path already implements it, or that the existing state revision covers constitutional dependencies. Do not implement it until the legitimate current-branch rule and the protected effect it governs are identified.

## Gate checklist

- [x] Reuse existing root-role, Constitution-context, bootstrap-composition, AB and P112 conclusions; no broad historical audit repeated.
- [x] Keep simulation persistence distinct from constitutional legitimacy.
- [x] Treat POCO faithful presentation as a first-ceremony bounded assumption only.
- [ ] Identify the pre-established rule that recognizes the initial constitutional basis without self-rooting.
- [ ] Define the exact claim scope and target protected effect(s) governed by the initial activation.
- [ ] Establish the current-branch, revocation, recovery and predecessor-cutoff rule.
- [ ] Identify a final protected enforcement boundary and demonstrate bypass closure.
- [ ] Bind authority/currentness dependencies to the authoritative linearization point.
- [ ] Keep all unresolved conditions UNKNOWN/HOLD; no fallback authority.

## Non-actions and status

No source code or tests changed or ran. No keys, signatures, digest, frozen Constitution, approval ceremony, physical root, verifier, device, deployment or runtime authority was created or selected. No handwritten recovery reference was ratified. No protected effect is authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
