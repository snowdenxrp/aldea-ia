# STEP 7 — Genesis Recognition Candidate Comparison
Date: 2026-10-08
Track: NCS clean architecture
Status: DESIGN RECONCILIATION — NO TECHNICAL ROOT SELECTED — NOT IMPLEMENTATION-AUTHORIZED

## Scope
This record narrows the already-listed genesis-basis families against the current MASTER, Trust Function / Root Role Map, Bootstrap Legitimacy Gap decision, Commissioning/Succession Semantic Rule, Commissioning Model Narrowing, and the attacked Minimum Commissioning Binding Contract. It does not reopen their generic attacks and does not select a key, TPM, provider, protocol, or ceremony.

## Reconciled result
Two questions must remain separate:
1. **Legitimacy source:** the existing governance principle supports an explicit commissioning act authorized by Kevin under the Constitution; Nexo, a model, provider, device, or recovery path cannot invent that authority.
2. **Recognition/authentication:** Nexo still needs a pre-established basis independent of the uncommissioned state being authorized, capable of recognizing that exact act and binding it to the exact constitutional content/context.

The first is semantically narrowed by existing decisions. The second remains a genuine technical/governance gap. Naming an API, storing a key, checking a signature, or declaring a device “Core” cannot close it.

## Candidate-family comparison

| Family | What it can contribute | Why it cannot independently solve genesis legitimacy | Disposition |
|---|---|---|---|
| Owner-authorized commissioning | Preserves the intended human/governance source and explicit consent | The ceremony still needs a way to authenticate the owner and protect the exact act without trusting the uncommissioned device | RETAIN as legitimacy rule; authentication open |
| Pre-provisioned external genesis authority | Can supply a prior independently governed reference/binding | The provisioning authority itself needs legitimate governance; portability, capture, compromise, and exit must be bounded | CONDITIONAL candidate only |
| Hardware/platform root | May protect keys or establish bounded integrity/measurement claims | Does not establish who legitimately governs Nexo; manufacturer, firmware, update, and recovery are dependencies | SUPPORTING mechanism only, never legitimacy source |
| Previously protected local root | Can preserve continuity after an earlier legitimate establishment | Cannot establish the first legitimate root; loss/compromise needs an independent recovery basis or safe non-action | CONTINUITY only after genesis |
| Multi-custodian/threshold | May reduce one-custodian compromise for a specifically governed transition | Adds custodians, availability and common-mode assumptions; no existing threat-model result justifies it as the default | DEFER; no threshold by convenience |
| Hybrid | Can assign separate roles to human legitimacy, independent recognition, integrity, recovery and succession | Composition itself needs a governed binding and dependency closure; overlapping roots cannot be counted as independent | ARCHITECTURAL POSSIBILITY, not selected |

## Narrowed architectural conclusion
The compatible semantic shape is:
**explicit owner-authorized commissioning + a pre-established, independently recognizable authentication basis + exact Constitution/context binding + governed currentness/revocation/recovery rules.**

“Independent” is claim- and threat-model-relative, not a synonym for another key, process, provider, device, or physical component. Its dependency/failure-domain closure must be demonstrated. No universal independence engine or universal GenesisRoot is justified.

This shape does **not** decide where the initial basis lives or how the owner is authenticated. Those choices depend on a concrete deployment threat model and portability/recovery expectations. The record must not convert “Kevin is the intended authority” into the unsupported claim “this particular device can securely recognize Kevin.”

## Required threat cases for the eventual concrete mechanism
- Compromised or malicious first device fabricates owner approval.
- Coerced owner approval or approval bound to the wrong Constitution/context.
- Provider/vendor controls the only recognition or update path.
- Owner unavailable; no implied consent or model/provider delegation.
- Offline verifier cannot establish current revocation status.
- Root/credential loss or compromise; recovery cannot self-promote.
- Device/provider/storage migration changes authority scope or restores stale authority.
- Two successors conflict; no time, epoch, chain length or availability heuristic may invent constitutional order.
- Commissioning is interrupted between preparation and activation.
- The independent basis shares a common-mode dependency with the candidate it is supposed to authenticate.

Expected result when a required premise is not established: UNKNOWN/blocked dependent constitutional activation; preserve evidence; continue only independently authorized safe functions.

## Decision boundary
- No candidate family is universally sufficient.
- Owner-authorized commissioning remains the preferred semantic legitimacy source from existing governance constraints.
- The recognition basis and concrete deployment mechanism remain unselected.
- No implementation of Trust Foundation or Constitution Authority Context is authorized.
- No runtime, cryptographic, hardware, formal, or deployment verification is claimed.

## Next exact action
The next necessary input is the concrete deployment threat model for the first commissioning act: which independent recognition channel(s) are acceptable, what compromise assumptions are in scope, and what recovery/portability properties are required. Only ask for a governance preference if existing MASTER/decisions do not settle it. Then compare concrete mechanisms against that model and attack the selected binding before implementation.
