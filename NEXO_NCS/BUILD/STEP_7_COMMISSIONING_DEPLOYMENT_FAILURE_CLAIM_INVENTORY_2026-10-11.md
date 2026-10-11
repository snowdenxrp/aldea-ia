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


## Gate 1 — candidate-family stress test against IR-1 (2026-10-11)

This is a claim-capability comparison, **not a ranking or selection**. “Can in principle” means the family is not semantically disqualified by IR-1; it does not mean a concrete deployment satisfies the claim.

| Existing candidate family | IR-1 stress-test result | Minimum evidence / closure still missing | Safe disposition now |
|---|---|---|---|
| Owner-authorized ceremony plus a pre-existing protected recognition path | **Can in principle satisfy IR-1; closest semantic fit.** The ceremony can carry Kevin's bounded authorization only if its recognition basis predates and is not self-authorized by the candidate Nexo instance. A ceremony by itself does not solve recognition. | Identify the pre-existing basis and its legitimate establishment; show how Kevin is recognized; bind informed approval to exact Constitution/context; freshness/replay and currentness/revocation semantics; independent verification rules; final effect boundary and bypass closure; interruption/recovery behavior. | **UNKNOWN / not implemented.** Keep as a semantic pattern, not a selected protocol. |
| Pre-provisioned external genesis authority | **Can supply a recognition basis in principle, but carries governance-transfer risk.** It fails IR-1 if the external issuer can silently redefine the Constitution, replace Kevin, set succession, or make itself the constitutional authority without a prior rule. | Independent justification of issuer legitimacy and bounded scope; proof that issuer only supports recognition and cannot amend/replace owner authority; compromise, revocation, migration and exit rules; verification and enforcement evidence. | **Conditional / UNKNOWN.** Not default; no external issuer selected. |
| Multi-custodian / threshold commissioning | **Not justified by current governance input.** Cryptographic or organizational threshold strength cannot invent a constitutional requirement for additional custodians. It could be considered only if a prior legitimate rule defines the role and threshold. | A prior rule authorizing custodians and threshold; legitimate membership and changes; independently justified failure domains; conflict/ordering and revocation rules; proof the threshold cannot transfer or dilute Kevin's initial authority. | **Do not assume or introduce a quorum.** Current status UNKNOWN and not selected. |
| Hardware/platform-assisted root | **Insufficient alone for IR-1.** It may protect a key or support platform-integrity evidence, but hardware integrity does not establish Kevin's informed approval or constitutional legitimacy. | Actual challenge-bound attestation or key-protection evidence if that claim is material; trusted independent verifier and appraisal basis; binding from Kevin's approval to exact Constitution/context; separate governance rule and effect-boundary evidence. | **Supporting role only.** POCO properties are not currently material; no Stage A collection. |
| Hybrid / role-separated composition | **Can in principle satisfy IR-1 if composition is explicit and no role self-authorizes another.** It is not inherently independent merely because it uses multiple components, keys or providers. | Explicit role/scope composition rule; per-role provenance/currentness/revocation; common-mode dependency closure; exact-content/presentation binding; final effect-boundary and bypass proof; safe failure and migration. | **Potential design space only.** Not selected; do not create a universal composition engine. |

### What the stress test rules out now

1. **A bare ceremony** without a prior recognition basis is not enough.
2. **A vendor or external issuer by convenience** is not enough and cannot silently acquire constitutional governance.
3. **A quorum** cannot be introduced without a prior legitimate governance rule.
4. **Hardware attestation or a signed APK** cannot substitute for owner authorization, exact-content approval, or enforcement.
5. **Multiple components** do not prove independence until their claim-specific common-mode failures are closed.
6. **Any successful signature, UI confirmation, local state flag or recorded approval** remains weaker than evidence that the actual final protected boundary enforced the exact authorized transition.

### Next bounded step

The family-level analysis leaves the same decisive unknown: what pre-existing recognition basis is legitimate and available **before** the first Nexo instance is commissioned, without delegating constitutional governance to an external provider? Existing records define the semantic constraints but do not establish such a basis. Do not invent a default. Review the already-recorded bootstrap contracts for any concrete pre-existing mechanism or owner decision that supplies this basis; if none exists, report the gap plainly and ask Kevin one focused question only if choosing among governance options is genuinely necessary.

No candidate is selected. STEP 7 remains **OPEN / STOP / UNKNOWN**.


## Existing-contract check after family stress test — 2026-10-11

The stress test was reconciled against the already-existing records below; this is a cross-reference check, not a repeat of their full attacks:
- `NEXO_NCS/DECISIONS/STEP_7_INDEPENDENT_COMMISSIONING_RECOGNITION_REQUIREMENT_2026-10-08.md` — the independent recognition channel under Kevin's control is an accepted requirement; “another device” and “physical medium” are examples only, not a selected channel.
- `NEXO_NCS/DECISIONS/STEP_7_BOOTSTRAP_LEGITIMACY_GAP_AND_ROOT_BASIS_DECISION_2026-10-08.md` — the missing premise is an independently recognized basis; no root mechanism selected.
- `NEXO_NCS/DECISIONS/STEP_7_CLAIM_RELATIVE_GENESIS_RECOGNITION_FAMILY_COMPARISON_2026-10-08.md` — prior family comparison is already complete; it records no family selected and C3 (protected recognition) as the earliest hard blocker.
- `NEXO_NCS/BUILD/STEP_7_BOOTSTRAP_BOUNDARY_ADVERSARIAL_RECONCILIATION_2026-10-11.md` — C0 and cross-contract circularity gaps are already isolated; semantic contracts do not demonstrate a concrete implemented independent source.
- `NEXO_NCS/DECISIONS/STEP_7_RECOMMENDED_BOOTSTRAP_POSTURE_AND_SAFE_PARALLEL_PROGRESS_2026-10-09.md` — independent recognition remains the conservative recommendation; Path A was authorized for evaluation only, not accepted as the trust basis or as permission to commission.

**Result:** canonical records contain no concrete pre-existing recognition mechanism/channel, independently justified verifier, or implemented enforcement boundary. The requirement is known; the mechanism and deployment remain unresolved. Do not reopen generic family research or repeat these documents' attacks.

### Next bounded action

Produce a short *decision-readiness comparison* only between the already-recorded accepted requirement (independent recognition channel under Kevin's control) and the existing Path A bounded-assumption candidate. Determine whether Path A can satisfy the accepted independent-recognition requirement without weakening it; use its recorded assumptions and attack results, and do not add a new family or presume owner acceptance. If Path A cannot satisfy the requirement, record it as evaluation-only/ineligible for protected commissioning under the current requirement and keep the independent-channel path as the unresolved design track. No new governance question is needed unless the comparison demonstrates an actual conflict between previously accepted requirements.


## Path A vs accepted independent-recognition requirement — decision-readiness result (2026-10-11)

### Requirement comparison

The accepted requirement in `STEP_7_INDEPENDENT_COMMISSIONING_RECOGNITION_REQUIREMENT_2026-10-08.md` requires an independent recognition channel under Kevin's control and permits activation to remain blocked when that channel is unavailable or unverifiable. The Path A preflight/evaluation explicitly assumes an owner-supervised event and an honest, uncompromised presentation environment; it does not prove those assumptions and explicitly cannot claim resistance to a compromised commissioning host.

| Test | Accepted independent-recognition requirement | Path A bounded assumption | Result |
|---|---|---|---|
| Recognition basis exists before candidate Nexo self-asserts | Required | Path A cannot let candidate Nexo create its own prior-recognition fact; the proposed environmental assumptions do not themselves provide a separate basis | **Not satisfied by Path A alone** |
| Candidate host/presentation may be compromised | The recognition claim must be independently justified under its threat model; if not, remain blocked | Path A explicitly assumes no active compromise and says it cannot resist a compromised host/presentation path | **Materially weaker; cannot substitute for the accepted requirement** |
| Exact Constitution/context binding, replay, currentness, revocation | Required | Still separately required and not implemented; assumptions do not create enforcement | **UNKNOWN / not satisfied** |
| Protected verifier and final effect boundary | Required | No independently justified verifier or enforcement boundary is established by Path A | **UNKNOWN / not satisfied** |
| Owner acceptance | Independent recognition requirement already accepted; mechanism not selected | Path A assumptions have not been explicitly accepted | **Path A remains evaluation-only** |

### Disposition

**Path A is not eligible as a substitute for the accepted independent-recognition requirement.** It may remain a bounded research comparator, but it must not be used to weaken the accepted requirement or justify protected commissioning. Path B—an actually identified, independently grounded recognition basis—remains the required design direction, but no concrete channel, verifier or basis is evidenced yet.

This is not a selection of a second device, physical medium, hardware root or external provider. The next necessary input is a concrete, owner-controlled channel candidate that can be evaluated against the already-accepted threat model. If no suitable channel is currently available, the safe result is to leave commissioning unestablished and continue only non-protected development. No change to the Constitution's normative authority is needed to reach this conclusion.


## Owner expands candidate scope — POCO and Moto G52 comparison (2026-10-11)

### Owner decision and boundary

Kevin explicitly states he is comfortable evaluating the POCO for both M1 and a possible role in constitutional-authorization recognition. This supersedes the earlier POCO-M1-only scope decision. It does **not** select the POCO, establish a root of trust, or authorize device operations. The candidate set for bounded design comparison is now:
- **POCO:** already used for M1; candidate use is permitted by Kevin, but shared-device and common-mode compromise must be evaluated.
- **Moto G52:** Kevin owns it and can unlock it; about one quarter of its display is not visible. It is physically separate from the POCO, but usability and reliable presentation/review may be impaired.

### Same-claim comparison

| Requirement / risk | POCO used for M1 + possible recognition | Moto G52 as separate candidate | Current evidence |
|---|---|---|---|
| Pre-existing recognition basis before Nexo self-asserts | Not established by sharing the device with M1 | Not established merely by being another physical device | **UNKNOWN for both** |
| Kevin can review and approve exact Constitution/version/context | Potentially possible, but actual review path and content binding are not designed or tested | Potentially impaired by the invisible display area; exact usable interaction is not assessed | **UNKNOWN for both** |
| Independent verifier/provenance not rewritable by candidate Nexo | Not established; M1/Nexo components may share device/platform/developer-controlled state | Not established; separate hardware alone does not identify a trustworthy verifier or prior key/basis | **UNKNOWN for both** |
| Cross-component/common-mode compromise | Shared device with M1 increases the need to analyze whether candidate app, OS, storage, UI or credentials can influence the recognition path | Physical separation reduces some same-device common modes but leaves platform, owner, supply-chain, credential and process risks to analyze | **Unclosed for both; different risk profiles** |
| Freshness, replay, currentness and revocation | No recognition protocol or lifecycle evidence supplied | No recognition protocol or lifecycle evidence supplied | **UNKNOWN for both** |
| Recovery, loss, replacement and migration | No lifecycle design selected | No lifecycle design selected; damaged display adds a practical availability concern | **UNKNOWN for both** |
| Final protected-effect enforcement | No protected verifier/boundary implementation evidenced | No protected verifier/boundary implementation evidenced | **UNKNOWN for both** |

### Decision

Neither candidate can currently satisfy IR-1 on the evidence available. The POCO is not disqualified solely because it runs M1; the Moto G52 is not preferred solely because it is separate. The decision must follow the concrete recognition protocol, independent provenance/verifier, failure-domain analysis and proof of enforcement—not device ownership or convenience.

### Next bounded step

Compare the concrete interaction and trust boundaries each candidate could actually support using existing canonical contracts. Identify whether either provides a **pre-existing, independently justified recognition basis** and how Kevin can inspect and approve the exact authorization context. Do not invent a new root or select a technology to fill the gap. If neither candidate can supply that basis, keep protected commissioning **OPEN / STOP / UNKNOWN** and continue only non-protected work. No device commands, installation, APK/signing changes or commissioning are authorized by this candidate-scope decision.


## Concrete interaction/trust-boundary comparison — POCO vs Moto G52 (2026-10-11)

### Purpose and scope

This is the bounded next step after Kevin expanded the candidate scope to allow the POCO to be considered for both M1 and constitutional-recognition interaction. It reuses the existing phone threat model, Root Recognition Gate, Trust Function / Root Role Map and accepted IR-1 requirement. It does not repeat the general family comparison and does not select or implement a mechanism.

### Separate roles before comparing devices

For this commissioning claim, keep these functions semantically distinct:
1. **Human presentation/review:** show Kevin the exact Constitution bytes/identity, version and commissioning scope in a form he can meaningfully inspect.
2. **Owner approval input:** capture a deliberate, explicit approval of that exact context; silence, a generic unlock, or ordinary conversation is not approval.
3. **Recognition/provenance:** establish why the approval channel and verifier were recognized before the uncommissioned candidate asks for trust, without candidate self-certification.
4. **Freshness/currentness/lifecycle:** reject replay and establish relevant current authorization/revocation/recovery state.
5. **Protected decision/effect enforcement:** prove the last boundary that can authorize the constitutional transition actually enforced the exact decision, rather than merely displaying or logging it.

One device may physically support more than one role only if the claim-specific common-mode risks are justified. Physical separation is neither universally mandatory nor proof of independence.

### Candidate interaction and trust-boundary result

| Function / boundary | POCO (M1 + possible recognition interaction) | Moto G52 (separate physical candidate) |
|---|---|---|
| Human presentation/review | In principle usable as an interaction surface, but no commissioning screen or verified exact-content presentation exists in evidence. If the same candidate-controlled app can show one context and submit another, approval must remain UNKNOWN. | In principle a separate interaction surface, but the reported invisible quarter of the display may prevent reliable inspection of some exact content or context. No usable layout or verified presentation exists in evidence. |
| Explicit owner approval | Kevin permits evaluating it; that permission is not itself a designed or tested approval protocol. Device unlock/ordinary app use must not be equated with constitutional approval. | Ownership and unlockability are reported, but neither establishes an explicit, content-bound approval protocol. |
| Prior recognition / provenance | No pre-existing basis or independent verifier is evidenced. Same-device M1/OS/storage/UI may share a failure domain with the candidate that consumes the approval. | Physical separation from POCO reduces some same-device common modes, but there is still no evidenced prior recognition basis, protected verifier or proof of provenance. Shared accounts, recovery, provider, network or administration remain unassessed. |
| Exact Constitution/context binding | No authenticated presentation-to-submission binding is implemented or evidenced. A digest can identify content but cannot establish who authorized it. | Same missing binding. The display defect adds a usability/inspection uncertainty rather than solving or changing the legitimacy problem. |
| Freshness, revocation, recovery | No selected protocol or currentness enforcement evidence. | No selected protocol or currentness enforcement evidence. |
| Final protected enforcement | No Nexo protected commissioning boundary or bypass-closure evidence is established by using the POCO for M1. | No Nexo protected commissioning boundary or bypass-closure evidence is established by having another physical device. |

### Findings

- **Neither candidate presently establishes IR-1.** This is an evidence/design gap, not a verdict that either phone is unusable.
- The POCO is not disqualified solely because M1 uses it. But if M1/candidate Nexo, its UI, local state or OS can control both the approval request and the decision that consumes it, the resulting common-mode risk must be explicitly bounded; a separate app or shell on the same phone does not automatically create independence.
- The Moto G52's physical separation is a possible reduction of some shared-device risks, not an independent recognition basis. The damaged display can prevent reliable human verification of exact content and cannot be hand-waved away.
- A hybrid in which one phone displays and another approves does not automatically close the gap: both must bind to the same exact Constitution/context and the verifier must have a pre-established legitimacy basis. Do not add a two-phone ceremony merely to create the appearance of independence.
- Neither candidate can currently be selected as root, verifier, channel, or final effect boundary. The missing basis cannot be replaced with a hash, signature, screen lock, app name, successful gesture, or extra device.

### Next decision-ready step

Before any implementation, identify whether an actually **pre-existing, independently recognized** owner-controlled basis already exists that can verify the exact approval context and survive candidate-app self-assertion. The current evidence does not identify one. Do not assume one exists and do not ask Kevin to re-confirm device ownership or whether the POCO may be evaluated. If the prior basis remains absent, the correct result is still OPEN / STOP / UNKNOWN; continue only non-protected design work. No device commands, installations, APK/signing changes, credential enrollment, or protected commissioning.


## Existing-basis evidence check after phone comparison (2026-10-11)

### Records checked

The current branch's canonical records were cross-checked against the question “is there already an owner-controlled recognition basis that exists before Nexo commissioning and can bind Kevin's approval to exact Constitution/context?” The relevant evidence includes:
- `STEP_7_INDEPENDENT_COMMISSIONING_RECOGNITION_REQUIREMENT_2026-10-08.md` — accepted requirement, explicitly not a selected channel or implementation.
- `STEP_7_BOOTSTRAP_LEGITIMACY_GAP_AND_ROOT_BASIS_DECISION_2026-10-08.md` — explicitly records the missing initial/ongoing legitimacy basis and no selected root.
- `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md` — semantic obligations only; no implemented independent-recognition mechanism.
- `STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md` — maps functions and gaps; no physical root/verifier selected.
- `STEP_7_CURRENT_PHONE_CANDIDATE_THREAT_MODEL_2026-10-08.md` — phone is only a candidate interaction channel; the concrete enrollment basis and verifier remain unselected.
- The newest dated `STATUS.md` and this inventory's owner-expanded POCO/Moto comparison.

### Result and epistemic boundary

**No pre-existing owner-controlled recognition basis, independently justified verifier, or protected enforcement boundary is evidenced in the reviewed repository records.** This is a bounded finding about available evidence, not proof that Kevin possesses no other pre-existing credential or medium outside the repository.

The following do not fill that gap by themselves: knowing a device PIN; ownership of a phone; running M1/Termux or another app; using two phones; a screen-lock event; a hash/signature without a separately justified recognition basis; a provider/account session; or a UI message saying approved/verified. None establishes all of owner attribution, exact Constitution/context binding, freshness/currentness, revocation/recovery, verifier independence and final enforcement.

### Disposition

The unresolved premise is now precisely scoped: identify a legitimate, pre-existing owner-controlled recognition basis (or an explicitly accepted and adversarially bounded human-recognition ceremony) and show how its authority is enforced without the uncommissioned Nexo candidate certifying itself. No such basis is currently evidenced, and no candidate mechanism should be invented to conceal that absence.

Until that premise is resolved, **constitutional commissioning remains OPEN / STOP / UNKNOWN**. Continue only non-protected design work. No device commands, installs, credential enrollment, APK/signing changes, or protected commissioning.
