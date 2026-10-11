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
