# STEP 7 — Scope A host threat model and trust boundary

Date: 2026-10-14  
Branch: `ncs-clean-architecture`  
Status: DESIGN / RESEARCH ONLY / NO HOST SELECTED / NO IMPLEMENTATION

## 1. Decision this document answers

What threat model must a local Scope A candidate-review reference survive, and does the current Android/Javet lead demonstrate the required boundary?

Scope A is limited to recording/reporting the identity/reference of a specifically reviewed draft while its legitimacy and currentness remain unestablished. It does not authorize a Constitution Authority Context, missions, `executeAction()`, protected mutation or external effects.

## 2. Relevant accepted assumptions — and strict limits

The owner accepted only this bounded initial-ceremony premise: the POCO screen faithfully presents the exact content submitted for approval during the first recognition ceremony. This is not a permanent trust assumption for the device, OS, app, runtime, future display, storage or verifier.

The following are **not** accepted or established:
- that the current or future Nexo APK is the reviewed build;
- that the app/runtime will honestly record the owner's decision;
- that local storage is tamper-proof, rollback-proof or durable against every failure;
- that a Git path/blob, app signature, device credential or Android Keystore key establishes constitutional authority;
- that Javet's Node Permission Model isolates malicious Core code;
- that an Android host or final protected sink has been selected.

Do not extend the ceremony assumption into a general runtime trust assumption.

## 3. Threat classes and required outcomes

| Threat / failure | Android or design control that may help | What remains unproven / required result |
|---|---|---|
| Accidental corruption, truncation, malformed record, partial write | Strict schema, integrity check, atomic write protocol and read-back | Any ambiguity must report UNKNOWN; never synthesize an empty/reviewed record. Atomicity and durability must be proved for the selected host. |
| Ordinary third-party app attempts to read/alter app-private data | Android's per-app UID/kernel sandbox, if correctly configured | Does not protect against the same app's own code, privileged compromise, rooted/debugged device, or a malicious update. Verify no exported/writable IPC path. |
| Backup/restore, reinstall, app migration, copied file or old snapshot | Explicit restore policy and review-event binding | Restored or stale state must not automatically imply current review; provenance/currentness remains UNKNOWN unless separately proved. |
| Git branch/path moves or candidate content changes | Pin exact revision/content locator; re-fetch and compare the complete content shown | Git metadata is locator-only. Mismatch, truncation or inability to bind presentation to the record prevents a truthful REVIEWED state. |
| Concurrent write, uncertain commit result, process death | Host-specific atomicity/conflict contract and read-after-write verification | Do not claim success if commit outcome is uncertain; return UNKNOWN and require reconciliation/re-review. |
| Malicious or substituted Nexo app/Core/runtime fabricates or alters a review record | Reproducible build, app-signing/update-chain controls and independent review may reduce risk | These are not yet demonstrated. A component cannot establish that its own code is honest merely by storing a record. If this adversary is in scope, local self-reported REVIEWED is not trustworthy without an independent boundary. |
| Compromised OS/kernel/root or deceptive display/input/accessibility path | Android Verified Boot and sandboxing provide platform defenses under their own assumptions | No evidence here proves the target device remains uncompromised or that all display/input paths are honest. The owner’s premise covers only the first ceremony's presentation. Under active OS compromise, report UNKNOWN/STOP unless an independent trusted path exists. |
| Replay/rollback to an earlier record | Monotonic/versioned state and an independently trusted freshness source could help | No canonical currentness owner or rollback-resistant state is established. Local timestamps, file order and hashes are insufficient. |
| Local reference accidentally reaches mission/effect authorization | Separate data model/API, no authority-bearing fields, call-graph/sink inventory and negative tests | No local runtime path or protected sink has been demonstrated. This is a hard implementation blocker. |

## 4. What Android's sandbox does and does not give us

Official Android documentation describes per-app UID/process isolation enforced by the kernel, and describes app signing as part of app identity and update controls. These mechanisms are relevant to isolating one installed app from ordinary other apps on a correctly configured device. They are not a proof that Nexo's own code is honest, that the screen is truthful, that an installed update is the reviewed build, or that a local record has constitutional authority.

Sources:
- Android Application Sandbox: https://source.android.com/docs/security/app-sandbox
- Android security features (sandbox, app signing, Keystore, Verified Boot): https://source.android.com/docs/security/features
- Android Keystore system and its limits under OS compromise: https://developer.android.com/privacy-and-security/keystore

Android Keystore may protect key material from extraction and restrict key use. It cannot by itself prove which constitutional bytes the owner reviewed, make a self-reported local review event true, or establish canonical constitutional currentness. No key is needed or authorized for this Scope A design step.

## 5. Javet disposition

The existing Android host gate records that Javet documents Android Node/V8 artifacts but disables the V8 sandbox on Android, and that Node's Permission Model is a defense-in-depth seat belt for trusted code, not a security boundary against malicious code.

Therefore:
- Javet Node mode may be investigated for semantic compatibility with the existing ESM Core, but this is a **semantics experiment only**.
- Do not claim that enabling Node permissions contains hostile or substituted Core code.
- Do not select Javet as a security boundary for constitutional authority.
- If the intended threat model requires isolation from malicious Core/runtime code, Javet plus permission flags does not satisfy it. Identify an independent boundary with evidence or keep STOP.
- No APK iteration is justified by this document.

## 6. Minimum honest Scope A assurance level

Before a runtime is selected, distinguish two different claims:

**Level 0 — repository preparation:** a repository revision/blob locates a candidate document. It says nothing about whether the owner reviewed it. This is the only level currently established.

**Level 1 — local app's self-reported review record:** a selected Nexo app reports that a review event was recorded. This can be an operational convenience, but without verified host/build trust and exact presentation binding it must not be described as independently trustworthy proof of owner review.

A future claim stronger than Level 1 would require evidence outside the record-producing component that binds the owner decision to the exact complete content/scope and verifies the intended recording/verifying code. The required independent mechanism has not been selected. Do not invent a third level or imply that Level 1 is sufficient for constitutional authority.

Even a truthful Scope A review record remains non-authoritative: it does not prove that the candidate is legitimate, canonical, current, approved, or authorized for missions/effects.

## 7. Decision

**Host threat boundary NOT ESTABLISHED; no runtime/store selected; do not implement Scope A yet.**

For the current design:
1. Continue only with repository-level candidate identification and review preparation.
2. If/when the owner confirms a draft was reviewed, record that decision in a bounded decision document only after exact content/scope binding is truthful. Do not fabricate the event from the fact that text was displayed in chat.
3. Before a local record is implemented, require an explicit owner-level threat-model decision about whether a self-reported app record is acceptable as a convenience or whether independent verification is required. This decision must not be silently inferred from the accepted first-ceremony display premise.
4. Then identify one actual host and write boundary; specify corruption/rollback/restore/conflict semantics; trace all callers; prove the record cannot be consumed as authority or reach mission/effect paths; and test negative paths.
5. If the threat model requires protection against malicious/substituted Core or a compromised OS and no independent boundary is demonstrated, remain STOP and leave the feature unimplemented.

## 8. Explicit non-actions

No code/tests changed or ran. No Android host/runtime selected or integrated. No APK, key, signature, digest, Constitution freeze, review event, ceremony, Authority Context, deployment or protected effect was created or authorized. The source-backed Android statements above are platform-level capabilities, not evidence of the POCO's live security state.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
