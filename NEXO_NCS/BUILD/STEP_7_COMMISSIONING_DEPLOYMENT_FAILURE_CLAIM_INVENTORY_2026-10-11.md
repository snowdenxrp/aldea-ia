# STEP 7 — Deployment and Failure-Claim Inventory for Commissioning Families — 2026-10-11

Status: P0 comparison only. No physical root, verifier, channel, authenticator, vendor, or commissioning protocol selected. No implementation authorized.

## Scope and fixed normative input
The owner's recorded governance decision is closed: Kevin is the sole initial human constitutional authority; initial commissioning must rest on his authorization. His daughter is the intended future successor but has no present authority. This inventory does not reopen that decision.

The comparison question is narrower: what technical/deployment claims would each already-permitted mechanism family need to satisfy so the uncommissioned Nexo instance can recognize the owner's act without self-bootstrap, and what remains UNKNOWN when the claim is not supported?

## Required claim tuple (not a new runtime schema)
For any candidate, evaluate:
- exact claim and authority scope (initial Constitution commissioning only);
- source of normative legitimacy (already fixed by owner decision);
- independent recognition basis existing before the candidate Nexo instance is commissioned;
- binding of owner approval to exact Constitution content/version, commissioning context, and trusted presentation;
- freshness/replay/substitution/equivocation handling;
- currentness, revocation, offline bounds and recovery;
- claim-specific dependency/failure-domain closure;
- final protected-effect boundary and bypass closure;
- interruption/loss/compromise behavior;
- evidence available to distinguish REQUESTED, AUTHORIZED, ENFORCED and UNKNOWN.

The fields above are comparison criteria, not an instruction to create a generic schema/registry.

## Candidate-family comparison

| Candidate family | What it could support | Independent basis still required | Material failure/common-mode questions | Required safe result when unresolved | Current disposition |
|---|---|---|---|---|---|
| Owner-authorized commissioning ceremony with a pre-existing protected recognition path | Authenticate the owner's bounded commissioning intent and bind it to exact Constitution/context | The recognition path must be established before the uncommissioned Nexo instance and cannot be defined/validated solely by that instance | Can the same compromised device/app/channel both display approval and alter the committed Constitution? Can a clone replay approval? Is the verifier controlled by the candidate policy? Can the owner detect content substitution/coercion? | Block protected commissioning; preserve proposal/evidence; no current constitutional authority claim | Best-aligned semantic direction; concrete channel/verifier not selected |
| Pre-provisioned external genesis authority | Supply an initial recognition basis external to the candidate Nexo instance | Legitimacy and scope of the provisioning authority, its own governance, compromise, migration and exit rules | Would this silently transfer constitutional control to a vendor/operator? Can it revoke/replace the owner or Constitution outside the owner's rule? Does Nexo remain provider-independent? | UNKNOWN if the issuer's legitimacy/scope/currentness is not independently justified | Conditional candidate only; not default |
| Multi-custodian / threshold commissioning | Combine multiple approvals if governance explicitly requires multiple custodians | Prior rule that legitimizes the custodians, membership, threshold semantics and independence of their failure domains | Shared identity provider, organization, recovery operator, communication channel, provisioning root, coercion/collusion, membership changes, conflicting quorums | UNKNOWN on unresolved membership, independence, ordering or conflicting results | Not justified by current owner decision; do not assume quorum |
| Hardware/platform-assisted root | Protect keys, boot/measurement claims or enforcement components within a bounded technical scope | Separate normative owner rule and independently established binding between owner's authorization and the Constitution | Does the hardware root prove only integrity, not legitimacy? Shared provisioning/firmware/recovery dependencies? Can replacement/migration preserve authority without self-assertion? | Hardware evidence may establish only its defined integrity claim; constitutional authority remains UNKNOWN without separate binding | Support role only; hardware-only governance rejected |
| Hybrid, role-separated composition | Combine owner authorization with independently protected recognition, integrity and enforcement roles | Explicit composition rule plus dependency closure for each claim; no role can self-authorize the others | False independence from shared keys/provider/operator/update pipeline; role confusion; partial compromise; hidden fallback; one component retires old root too early | ESTABLISHED only for the exact supported claim; otherwise UNKNOWN/INVALID; no permissive fallback | Potential future architecture, not a shortcut and not selected |

## Failure-domain inventory to complete before any mechanism selection
These are currently deployment UNKNOWNs, not assumptions to fill with defaults:
1. Initial commissioning device(s) and whether any are uncommissioned/untrusted at the moment of approval.
2. Whether the approval presentation and the protected commit boundary share a process, OS, device, update channel, or administrator.
3. Which components can independently change Constitution bytes, verifier rules, trusted roots, owner credentials, or enforcement policy.
4. Whether the chosen recognition basis survives loss of the primary device without making backup/recovery the new constitutional root.
5. Whether the owner can revoke a lost/compromised authenticator through a path not controlled by that authenticator.
6. How currentness is established while offline and what exact protected claims become unavailable when revocation/currentness cannot be checked.
7. Which protected effects exist during commissioning and which final resource boundary rejects all uncommissioned protected effects.
8. Whether a candidate's verifier, UI/presentation, storage, update mechanism, and audit evidence share material common-mode dependencies.
9. How failed/partial commissioning is rolled back or quarantined without resurrecting old/revoked authority.
10. Which evidence survives a crash and what that evidence does NOT prove (e.g. recorded approval vs enforced authority).
11. What migration/device replacement means for the semantic Constitution binding and owner authority, without provider lock-in.
12. Which recovery actions are pre-authorized safety-only operations versus governance/constitutional changes.

## Decision gates
A candidate cannot proceed merely because it is convenient, cryptographically strong, hardware-backed, local, external, multi-party, or easy to implement. It must satisfy the exact claim under an explicit deployment/failure model.

- If normative legitimacy is unclear: stop; however, the owner legitimacy choice is already closed for initial commissioning.
- If independent recognition basis is unclear: UNKNOWN/STOP.
- If trusted presentation/exact content binding is unclear: do not treat approval as informed authorization.
- If currentness/revocation or failure-domain closure is unclear: block dependent protected activation.
- If the last effect-capable boundary or bypass closure is unknown: do not claim enforcement.
- If commissioning partially completes or crashes: retain evidence and remain blocked until state is reconciled; never infer success from a local flag, snapshot, or signature alone.
- If candidates conflict and the pre-established rule cannot order them: preserve conflict and remain UNKNOWN/SAFETY_ONLY as authorized.

## Current conclusion
The owner-authority decision is sufficient to state the normative source of initial authorization, but it is not sufficient to select a technical mechanism. The remaining work is a deployment-specific trust/failure model and evidence/enforcement claim, not another generic root abstraction.

No candidate family is selected. No root or verifier is commissioned. No Constitution Authority Context is implemented. No runtime, cryptographic, formal-method, or enforcement proof is claimed.

## Exact next action
Using the user's actual intended first deployment only when that deployment is described in canonical project records, complete the failure-domain rows from existing repository evidence. Mark unavailable details UNKNOWN rather than guessing. If a material deployment choice is absent from canonical records and cannot be inferred without governance, ask one focused question only after the evidence-backed candidates and trade-offs are reduced to that choice.


## Continuity reconciliation addendum — 2026-10-11 (supersedes the earlier next-action line above)

This addendum resolves the apparent conflict between the inventory's next action and the later Android/M1 evidence documents. It does not select a mechanism or change the original findings.

### Failure-domain rows populated only from canonical records already present

| # | Claim / failure domain | Evidence-backed record | Current disposition |
|---|---|---|---|
| 1 | Initial commissioning device and trust state | The Android/M1 matrix records a user-reported POCO Android phone used for M1. No canonical record says this phone is the actual initial Constitution-commissioning device or establishes its trust state at that moment. | **UNKNOWN** whether POCO is the commissioning device; do not equate M1 target with Genesis target. |
| 2 | Approval presentation vs protected commit boundary | No deployment record identifies the actual approval UI, verifier, commit process, OS/device separation, or administrators. | **UNKNOWN**; no independence claim. |
| 3 | Components able to change Constitution, verifier, roots, credentials, policy | MASTER first-boot note and trust-role map distinguish integrity from legitimacy but select no concrete deployment components. | **UNKNOWN** for the actual deployment; no mechanism selected. |
| 4 | Loss of primary device / backup and recovery | Matrix records a user-reported JKS backup under `Download/Nexo-Backup`; it is an M1 signing-key backup, not an authorized constitutional recovery path. | Backup existence does not establish recovery semantics; **UNKNOWN** for constitutional continuity. |
| 5 | Revocation path independent of lost authenticator | No canonical deployment-specific revocation channel or independently controlled revoker is identified. | **UNKNOWN**; no offline revocation guarantee. |
| 6 | Offline currentness and bounded protected claims | No deployment-specific freshness source, revocation window, or offline authorization bound is selected. | **UNKNOWN**; dependent protected activation must remain blocked when currentness is unestablished. |
| 7 | Final protected-effect boundary and bypass closure | Existing contracts require a real protected boundary, but no concrete effect-capable component or bypass test is demonstrated. | **NOT DEMONSTRATED**; do not claim enforcement. |
| 8 | Common-mode dependencies among UI, OS, verifier, storage, updates, evidence | Android/M1 matrix identifies reported platform/app/tooling facts only; no component/dependency topology is recorded. | **UNKNOWN**; apparent role separation cannot be treated as independence. |
| 9 | Interrupted or partial commissioning | The inventory's safe semantic rule says remain blocked and reconcile evidence after interruption; no deployment implementation is demonstrated. | Semantic disposition documented; actual rollback/quarantine behavior **UNKNOWN**. |
| 10 | Crash-surviving evidence and its limits | No commissioning run, raw runtime log, or crash-recovery artifact exists in the inspected canonical records. | **UNKNOWN**; no claim of durable evidence or enforced state. |
| 11 | Migration / device replacement | Provider independence is a project constraint, but no actual migration protocol or tested replacement path is selected. | **UNKNOWN**; preserve authority binding without assuming exportability or continuity. |
| 12 | Safety-only recovery vs constitutional governance | Canonical governance rules prohibit recovery from silently becoming unrestricted constitutional authority; no deployed recovery path is selected. | Semantic constraint established; deployed separation **UNKNOWN**. |

### Android collection gate

The later Android/M1 matrix and read-only collection contract are compatible with this inventory, but they do not supersede it. Stage A commands only report local platform properties. They do not resolve the higher-priority unknown of whether the POCO is intended to be the commissioning device, nor establish independent authority, revocation, or final-boundary enforcement. Therefore **do not run Stage A yet**. First resolve the deployment-intent ambiguity; collect platform properties only if the chosen, still-uncommissioned deployment makes a specific platform claim material.

### Current next action

Ask one focused deployment-scope question: **Is the POCO/Android phone intended to be the actual first device that commissions Nexo's Constitution, or is it only the M1 prototype/test device while commissioning is still a separate, undecided deployment?** Keep all mechanism choices open. No commands, code, APK changes, root selection, or protected commissioning before that answer and a claim-specific reason for any further evidence collection.


## Decision-gap map — 2026-10-11 (after owner confirms M1-only device scope)

This section supersedes the old deployment-scope question in the preceding reconciliation addendum. Kevin confirmed that the POCO remains an M1 test device; it is **not designated as the initial Constitution-commissioning device**. The actual commissioning deployment remains undecided. This resolves the scope ambiguity, not the trust gap.

### What is already fixed vs still open

| Order | Question / condition | What canonical records establish | What remains UNKNOWN / next design obligation |
|---|---|---|---|
| 0 — normative authority | Who may authorize initial commissioning? | Closed owner decision: Kevin is the sole initial human constitutional authority. His daughter is a future intended successor, with no current authority. | Do not reopen this governance choice. Technical evidence must not silently replace it. |
| 1 — independent recognition | How can an uncommissioned candidate recognize Kevin's act without asking that same candidate to certify itself? | Trust-role map: evidence cannot establish its own trust anchor/appraisal policy; no implemented Policy authority owner or Constitution Authority Context establishment path has been demonstrated. | **Primary blocker.** Specify the minimum property of a pre-existing recognition basis, its legitimacy source and independence claim. Do not choose a device, vendor, key type or ceremony before this claim is testable. |
| 2 — informed authorization / exact binding | What exactly did Kevin approve? | Existing inventory requires binding approval to exact Constitution content/version and commissioning context, with trusted presentation. | No actual presentation/commit design or substitution/equivocation evidence exists. Define the claim and adversarial cases; approval of a hash alone or a generic “approve” signal is insufficient without a trusted content/context binding. |
| 3 — currentness and replay | Can an old, copied, revoked or context-mismatched approval be reused? | Existing contracts require freshness/replay handling and distinguish REQUESTED, AUTHORIZED, ENFORCED and UNKNOWN. | No currentness source, replay bound, revocation path or offline limit selected. Define when authorization is current enough and when the safe result must be UNKNOWN/STOP. |
| 4 — enforcement | What component makes the constitutional transition real, and blocks all bypasses? | Trust-role map separates authority from execution/effect; inventory says the final protected-effect boundary is not demonstrated. | No identified final effect-capable boundary or bypass closure. Must be named and evidenced before any mechanism can be called enforcing. |
| 5 — interruption, loss, recovery, migration | What happens if commissioning crashes, the authenticator is lost, or the device is replaced? | Semantic rule: preserve evidence, remain blocked after ambiguous/partial completion; recovery must not silently gain constitutional authority. M1 JKS backup is only a reported APK-signing backup. | No deployed rollback/quarantine, independent revocation, safety-only recovery, or migration protocol. These remain later mandatory gates; do not let recovery become a substitute governance root. |
| 6 — failure-domain closure | Are the recognition, presentation, verifier, storage, update, evidence and effect roles genuinely independent for the claim? | Trust-role map says physical separation is conditional; separate processes/keys/providers alone do not prove independence. | No actual deployment topology exists yet. Once a candidate is proposed, map common-mode dependencies and state exactly which compromises invalidate which claims. |

### Recommended next design action

Work only on **Gate 1: the independent-recognition claim** using the existing trust-role map and commissioning contracts. Write a short candidate-neutral statement of what must already be true before the first Nexo instance can accept Kevin's authorization, what evidence could support that statement, and what remains UNKNOWN if the verifier or evidence source shares the candidate's own authority. Then adversarially test that statement against self-bootstrap, circular validation and silent transfer of governance to an external provider.

Do not draft a new generic root/registry/schema; do not select a physical root, verifier, channel, vendor, quorum or authenticator; do not run Android Stage A; do not modify M1 or commission protected state. If the candidate-neutral claim cannot be stated without choosing a genuinely normative governance rule, stop and ask one focused question. Otherwise continue with the existing recorded constraints.

**Disposition remains: STEP 7 OPEN; CORE TRUST / POLICY AUTHORITY BOOTSTRAP STOP / UNKNOWN.**


## Gate 1 design result — candidate-neutral independent-recognition claim (2026-10-11)

### Claim IR-1

Before any initial constitutional transition is accepted, there must be a **pre-established, claim-scoped basis for recognizing Kevin's authorization** whose legitimacy and verification rules do not derive solely from the uncommissioned Nexo instance, the Constitution bytes that instance proposes, or evidence that the same candidate instance can fabricate or redefine.

For one commissioning attempt, the accepted evidence must bind together all of the following as one bounded authorization:
- Kevin as the authorized human under the already-closed owner governance decision;
- the exact Constitution content/version and commissioning context being approved;
- an informed approval presented in a way that exposes relevant content/context substitution, rather than a bare generic approval signal;
- the initial-commissioning scope and a fresh, non-replayable attempt/context;
- current authority status under a pre-established revocation/offline rule;
- a verification decision made under rules the candidate instance cannot self-authorize or silently rewrite;
- the exact transition that the final protected-effect boundary will permit.

**Failure rule:** if the identity-to-authorization link, exact content/context binding, recognition basis, freshness/currentness, or final enforcement condition is UNKNOWN, invalid, conflicting or unverifiable, do not accept the constitutional transition. Preserve available proposal/evidence, report the unresolved state, and remain blocked; do not silently fall back to the candidate's own assertion.

This is a semantic claim, not a proposed cryptographic protocol or new runtime schema. It does not require all roles to be on separate physical devices. Any shared component must instead be evaluated against the specific compromise that could let it both counterfeit recognition and alter the approved transition.

### Circularity and governance-transfer attack results

| Attack | Required rejection condition | What the current evidence establishes |
|---|---|---|
| Self-bootstrap: candidate Nexo declares its own verifier/root trusted | The candidate's own claim, generated key, local flag, package signature, model output, hash, or self-reported platform state cannot alone establish the pre-existing legitimacy of its recognition basis. | Trust-role map explicitly rejects evidence establishing its own trust anchor/appraisal policy. No concrete recognition basis is implemented. |
| Circular validation: verifier trusts policy supplied by the candidate whose authorization is being checked | The rule that validates the evidence must itself have an independently justified prior authority/provenance; if it is merely accepted because the candidate says so, the chain is circular and the result remains UNKNOWN. | No implemented Policy authority owner or Constitution Authority Context establishment path has been demonstrated. |
| Bare cryptographic proof: signature/hash is treated as constitutional legitimacy | A valid signature/hash can support a bounded key-statement or byte-equality claim only; it does not independently prove Kevin's informed approval, currentness, scope, legitimacy or enforcement. | Existing trust-role map records this invariant. No protocol or signer is selected. |
| External-provider substitution: provider's account/root becomes constitutional authority | An external service may only be considered for a narrowly specified support role; it must not gain unrecorded power to choose/amend the Constitution, replace Kevin, define succession, or unilaterally revoke/transfer constitutional authority. Its own legitimacy, scope, compromise and exit must be justified. | Provider independence is a project constraint; no external authority is selected or assumed legitimate. |
| Same-component approval/commit compromise | If one component can mispresent what Kevin approves and commit different bytes, that component's evidence alone cannot establish informed exact binding. Either show the claim survives the stated compromise model or keep it UNKNOWN. | Actual presentation, verifier, commit boundary and bypass closure remain unimplemented/UNKNOWN. |
| Lost/revoked authenticator replay | Approval evidence cannot remain accepted beyond its pre-established currentness/revocation conditions; inability to determine status must block the dependent transition. | No deployment-specific revocation path, freshness source or offline bound is selected. |
| “Authorized” confused with “enforced” | Recognition/approval evidence is not proof the final effect boundary applied the transition. Enforcement requires separate evidence from the actual last effect-capable boundary and bypass analysis. | Final protected-effect boundary is NOT DEMONSTRATED. |

### Gate 1 conclusion and next bounded step

IR-1 is sufficiently defined at the semantic level to continue without asking Kevin to choose a normative governance rule. It does **not** select a device, verifier, key, ceremony, vendor, quorum, physical root or implementation.

Next, use the existing candidate-family comparison to evaluate only whether each family can in principle supply IR-1's pre-established recognition basis without self-bootstrap or governance transfer. Keep the evaluation at claim/failure-domain level; do not rank convenience or choose a mechanism. For any family whose legitimacy, independence or enforcement depends on a fact not in canonical evidence, mark it UNKNOWN and state the missing proof.

Disposition remains **STEP 7 OPEN; CORE TRUST / POLICY AUTHORITY BOOTSTRAP STOP / UNKNOWN**.
