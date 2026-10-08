# STEP 7 — Independent Channel Enrollment and Binding Contract Candidate
Date: 2026-10-08
Status: MECHANISM-NEUTRAL CANDIDATE; ROOT/VERIFIER ASSUMPTIONS OPEN; NOT IMPLEMENTATION-AUTHORIZED

## 1. Authority and scope
This contract derives from the accepted requirement that initial commissioning must use an independent recognition channel under Kevin's control. It defines the minimum claims for enrollment/binding without selecting a device, token, provider, protocol or physical medium.

It establishes at most a narrowly scoped association between a recognized channel credential and one commissioning ceremony. It does not establish constitutional legitimacy by itself, prove that the verifier is trustworthy, authorize arbitrary actions, or define recovery/succession.

## 2. Preconditions that must be established separately
Before enrollment can be treated as valid, the deployment must identify:
1. The legitimate human/governance rule authorizing the ceremony.
2. The recognition channel and how Kevin recognizes/controls it independently of the candidate Nexo instance.
3. The channel's credential generation/provisioning process and the evidence that the presented public key belongs to that channel.
4. The verifier/presentation boundary that will validate and display the ceremony; its software/integrity assumptions must not be hidden.
5. The canonical commissioning object: deployment identity, Constitution identity/version/content representation, material summary and ceremony context.
6. The currentness/revocation source and safe behavior when unavailable.
7. The recovery/replacement rule, or explicit root-unavailable/HOLD semantics if no legitimate recovery basis exists.

Any missing precondition is UNKNOWN; enrollment must not manufacture it.

## 3. Candidate enrollment ceremony
A deployment-specific ceremony may be accepted only if it can demonstrate all applicable properties below:
- **Explicit intent:** Kevin initiates enrollment and approves the exact channel/credential binding. Silence, normal conversation, model inference and provider assertion do not count.
- **Independent recognition:** the channel is already under Kevin's control or is established through a separately accepted human-controlled out-of-band process; it is not first trusted solely because the candidate Nexo instance names it.
- **Credential proof:** a fresh challenge is answered by the credential associated with the channel; public-key binding is established by an independent method appropriate to the threat model.
- **Exact scope:** enrollment binds one credential/channel identity, one deployment and a defined commissioning purpose. It does not automatically grant amendment, recovery, succession or general execution authority.
- **Context binding:** the response binds a canonical commissioning object containing deployment identity, exact Constitution identity/version/content digest, ceremony context and freshness challenge.
- **Replay protection:** challenge is unpredictable/unique, expires under a governed rule, is consumed once, and cannot be reused across deployments or contexts.
- **Presentation:** the user is shown enough material to distinguish the intended Constitution/context from a substituted one; the rendered summary is bound to the exact canonical object.
- **Currentness:** credential status, prior enrollment, revocation and competing binding claims are checked against the designated lifecycle authority. Unknown currentness blocks positive enrollment.
- **Evidence record:** preserve the enrollment act, credential reference, exact object/context, challenge, result, dependencies, lifecycle status and limitations. Audit evidence is not enforcement.
- **Fail-closed result:** return ESTABLISHED only when every required premise is supported; otherwise INVALID for contradiction or UNKNOWN for missing/uncertain evidence.

## 4. Required separation of claims
Keep separate:
- Kevin's normative authority to commission;
- recognition of the independent channel;
- proof of control of its credential;
- integrity/trustworthiness of the verifier and display;
- approval of the exact constitutional object;
- currentness/revocation;
- activation/enforcement of resulting authority.

A valid signature proves only the claims supported by its key binding and protocol. It does not prove that the user saw the intended content, that the verifier executed the check honestly, that the root is normatively legitimate, or that a revocation is enforced everywhere.

## 5. Enrollment replacement and recovery
- Adding a second channel is a governed enrollment transition, not silent key replacement.
- Lost/stolen/suspected-compromised channel: suspend/hold the affected protected path as policy allows; preserve evidence; do not automatically trust a recovery account.
- Replacement requires an existing authorized transition rule and evidence that the replacement was approved by a still-legitimate authority.
- If the only recognized channel/root is lost or disputed and no independent succession rule applies, enter ROOT_AUTHORITY_UNAVAILABLE/HOLD. Availability pressure does not authorize self-promotion.
- Provider migration must preserve authority semantics and allow portability; provider ownership of recovery must not silently become constitutional authority.
- Old and new channel overlap, predecessor cutoff, revocation propagation and in-flight ceremonies require explicit semantics before implementation.

## 6. Known impossibility boundary / open assumption
If the candidate Nexo verifier itself is malicious or fully compromised, it can ignore the enrollment result, misrepresent its meaning or falsely claim activation. An external channel's signature cannot make untrusted verifier software enforce the Constitution. Therefore, the design must separately establish the verifier/effect boundary's trustworthiness under a declared threat model, or limit claims to “approval evidence was produced” rather than “Nexo is securely commissioned.”

No channel-enrollment protocol can solve this by adding another field or another signature. The trustworthiness and update/migration of the verifier are a separate root-basis obligation.

## 7. Adversarial acceptance tests
1. Candidate supplies attacker public key while showing the expected channel name.
2. Enrollment is replayed across another deployment or Constitution version.
3. Challenge is reused concurrently on two replicas.
4. The independent channel approves one digest while the candidate displays another summary.
5. Verifier accepts any signature or skips revocation checks after crash/restore.
6. Same provider/account/OS/update/recovery controls both candidate and channel.
7. Recovery account enrolls a replacement channel without a still-legitimate authorization.
8. Revocation occurs while candidate is offline.
9. Enrollment succeeds but verifier/effect boundary is compromised and ignores the resulting policy.
10. Ceremony is interrupted after signature creation but before durable binding/activation.
11. User approves a credential binding but the implementation expands it to constitutional amendment or arbitrary execution authority.
12. Two valid-looking channel bindings conflict without an established ordering rule.

Each test must state expected enforcement point and evidence; a test that only validates a signature is insufficient.

## 8. Decision
Keep this as a mechanism-neutral contract candidate. Do not implement enrollment or activate Trust Foundation/Constitution Authority Context until the verifier/root assumptions, channel enrollment basis, currentness/revocation, recovery and future-countereffects review are resolved.

## 9. Next exact action
Attack the verifier trust boundary and initial public-key binding specifically. Determine whether the accepted deployment assumptions provide an independently trusted verifier/update path. If not, root legitimacy remains unresolved and technical channel selection must stop; do not add a wrapper that pretends the verifier is trusted.
