# STEP 7 — Scope A negative acceptance tests and proof gates

Date: 2026-10-14  
Branch: `ncs-clean-architecture`  
Status: TEST SPECIFICATION ONLY / NO HOST SELECTED / NO IMPLEMENTATION / NOT EXECUTED

## 1. Purpose and scope

Define falsifiable acceptance tests for a future, narrowly scoped Scope A record: a locator and record of a human review of a specific constitutional candidate, while legitimacy and currentness remain unestablished.

This document is a test specification, not test evidence. No implementation or selected runtime currently exists for these tests. No case below is marked PASS, FAIL or runtime-verified.

Scope A MUST NOT grant a Constitution Authority Context, mission admission, `executeAction()`, protected mutation, external action, or any general execution capability. A review record is evidence about a review event, not a source of constitutional authority.

## 2. Required result vocabulary

- **REVIEW-RECORDED (bounded):** only if the selected implementation can bind the human review event to the exact candidate identity/content and can demonstrate its own stated guarantees. It still does not mean canonical, current, legitimate or authorized.
- **UNKNOWN:** evidence is absent, malformed, inconsistent, stale, incomplete, unverifiable, or the write outcome is ambiguous.
- **STOP / QUARANTINE:** a detected conflict, substitution, unauthorized path, or violation of a required invariant prevents continued use.
- **NOT APPLICABLE / NOT RUN:** no selected host or executable implementation exists.

No fallback, default, empty record, timestamp, hash, app signature, local file, Git reference or device identifier may be silently promoted to REVIEW-RECORDED or current authority.

## 3. Negative acceptance matrix

Each case is a mandatory negative test for any future candidate design. Expected outcomes are requirements, not results already observed.

| ID | Adversarial setup | Required result | Evidence required to claim test passed |
|---|---|---|---|
| SA-N01 Candidate substitution | Change candidate bytes after the review screen was prepared, or swap its repository revision/blob immediately before recording. | STOP or UNKNOWN; never report the changed candidate as the one reviewed. | Test fixture with both exact byte sequences; captured presentation-to-record binding; output and log showing mismatch rejection. |
| SA-N02 Truncation / corruption | Truncate the record, corrupt a required field, alter encoding, or provide a schema-invalid object. | UNKNOWN/STOP; no constructed empty record and no success-shaped fallback. | Fixtures for each corruption; actual reader output; proof default/fallback paths do not turn invalid input into acceptance. |
| SA-N03 Partial write / process death | Interrupt the write at each supported boundary, including process termination where the selected host permits testing. | No false success. Either old complete state or new complete state under a proved host contract; otherwise UNKNOWN and reconciliation. | Host-specific fault injection; raw persisted bytes before/after; restart/read-back output; documented durability limits. |
| SA-N04 Stale restore / rollback | Restore a backup, copied file, old app data or earlier candidate/review record. | May report historical record as historical only; must not infer currentness or fresh review. If freshness cannot be established, UNKNOWN. | Explicit restore fixture and observed result; source and freshness assumptions documented; no reliance on local timestamp alone. |
| SA-N05 Uncertain commit | Force the storage operation to return an ambiguous result or lose acknowledgment after a possible commit. | UNKNOWN until authoritative read/reconciliation determines the actual outcome; no blind retry and no premature success claim. | Fault-injected commit/acknowledgment path, authoritative read evidence, classification trace. If the host cannot expose/reconcile this, host is unsuitable for the stronger claim. |
| SA-N06 Concurrent writers | Two review writes race from the same observed state or one writes while the other changes the candidate reference. | Conflict must be detected or outcome remain UNKNOWN; no silent last-writer-wins claim of correctness. | Deterministic race test, both requested candidates, stored final bytes, conflict classification. |
| SA-N07 Duplicate/replayed review | Replay a prior event or submit a valid old record as if it were a fresh review. | Historical evidence may be displayed as such; it cannot prove a fresh review of the present candidate. | Replay fixture and output proving distinction between historical event and fresh review; no invented identity fields unless separately specified by a contract. |
| SA-N08 Missing/unreadable record | Remove the record or deny read access. | UNKNOWN/NOT RECORDED, never an accepted empty constitutional state. | Missing-file and permission/error fixtures; complete fallback-path inspection; observed outputs. |
| SA-N09 Unauthorized mutation path | Attempt record changes through exported Android components, IPC, backup/restore surfaces, debug/test hooks or other app-accessible paths relevant to the selected host. | Reject unauthorized path or classify the record as untrusted/UNKNOWN. | Inventory of exported components/IPC and storage surfaces; tests on each in-scope path; exact build/configuration tested. |
| SA-N10 Substituted app/Core/runtime | Replace the application, Core bundle, runtime or update artifact with a different build that can still write a plausible record. | A self-reported record cannot claim independent assurance against this adversary. Either a separately justified boundary detects/rejects substitution, or the assurance claim is explicitly reduced and STOP retained for this threat. | Exact artifact/build identity chain and independent verification evidence; adversarial substitution test. A hash calculated and trusted by the same substituted component is insufficient. |
| SA-N11 Compromised OS / deceptive input-output | Assume privileged OS control, rooted runtime, deceptive overlay/accessibility/input, or falsified screen and local storage. | No claim of resistance unless an independent trusted path is demonstrated. Under this threat, UNKNOWN/STOP is required. | Defined threat assumptions and evidence from a genuinely independent path. Android sandbox, Keystore, Verified Boot status or a second app alone is not proof against every listed case. |
| SA-N12 Reference-to-effect noninterference | Trace every read/write/callback and attempt to use the Scope A record to admit missions, construct authority context, call `executeAction()`, mutate protected state or trigger external effects. | No authority/effect path exists. Any reachable path is a design failure; stop and redesign rather than add a superficial conditional. | Source-level call graph plus runtime negative tests/instrumentation for each actual sink; tests fail closed on attempted connection. Static search alone is not sufficient proof of complete bypass closure. |
| SA-N13 Error/fallback coercion | Force parse, storage, verification or runtime errors that trigger defaults, fallback state or “recovery” behavior. | UNKNOWN/STOP; no fallback to a success-shaped record. | Error-path inventory and injected failures; observed output and persisted state. |
| SA-N14 Device migration / reinstall | Move app data or reinstall/change device and then present the record. | Treat as historical/unverified unless migration provenance and freshness are explicitly governed and proved. | Migration/reinstall test and output; explicit distinction between copied evidence and current authority. |
| SA-N15 Candidate display mismatch | Show a rendering that omits or changes clauses while the record points to different underlying bytes. | No REVIEW-RECORDED claim unless the reviewed presentation is demonstrably bound to the exact candidate identity and complete rendering. | Full-rendering fixture, exact byte/revision mapping, captured review binding and adversarial display test. The accepted POCO assumption is limited to the first ceremony; it does not prove future app rendering. |

## 4. Cross-cutting proof gates

Before executing the matrix, a concrete host proposal must supply all of the following:

1. **Host and threat scope:** identify device, OS/build, runtime, storage, app/Core artifact and adversaries included/excluded. The user's permission to modify any available device is permission to evaluate options, not evidence that any device is trustworthy.
2. **Candidate identity:** specify how exact bytes, revision, scope and complete human-readable rendering are linked. A path or branch name alone is mutable.
3. **Review-event binding:** specify what is actually attested by the event, what remains a human assertion, and how a later reader distinguishes a fresh event from copied historical data.
4. **Storage contract:** specify write atomicity, durability limits, concurrency/conflict behavior, restart behavior and handling of ambiguous outcomes for the chosen host. Do not invent a second commit primitive where the existing conditional snapshot commit is the relevant primitive; first prove whether its revision domain covers the required dependencies.
5. **No-effect boundary:** identify actual call graph and every protected/external sink in the selected build. Scope A must not be accepted as an input that can confer authority.
6. **Artifact/build provenance:** explain how the tested app/Core/runtime corresponds to the inspected source and how substitution is detected. Self-report alone does not establish this.
7. **Independent verification:** state which claims can be checked independently of the component making them. If no independent boundary exists against malicious Core/OS, narrow the assurance claim or retain STOP.
8. **Reproducibility:** pin source revision, build/toolchain, device/OS, test inputs, commands, raw outputs and artifacts. Preserve failures and UNKNOWN outcomes, not just summaries.

## 5. Device strategy — evaluation allowed, no device selected

The owner has explicitly clarified that any available device may be modified if justified. This expands the engineering option space but does not change the authority model.

Evaluate devices by role and failure domain, not by number of devices:

- **POCO X7 Pro:** candidate for current Android-host experiments; its first-ceremony presentation assumption does not establish ongoing OS/app/runtime integrity.
- **Moto G52 / Moto E22i:** may be evaluated as a separate human-comparison, recovery-reference or test device. A second handset is not an independent trust root merely because it is physically separate; shared accounts, copied secrets, shared software/update assumptions and common operator errors can couple failure domains.
- **Dedicated/reconfigured device or alternate OS:** may be researched if it provides a concrete, verifiable improvement. Unlocking a bootloader, rooting, flashing firmware or changing OS may weaken Verified Boot, erase data, introduce supply-chain risks or reduce support. Do not do any of these until a specific security property, recovery path, compatibility plan and rollback/data-loss plan are documented.
- **Hardware authenticator (e.g. YubiKey):** can support possession-bound cryptographic operations after enrollment; it does not create the initial trust anchor, prove which content was reviewed, or determine canonical currentness by itself.
- **Termux / embedded runtime:** a convenient shell or runtime is not automatically an isolated production host. Do not promote it to the trust boundary without a threat-specific demonstration.

No device, alternate OS, hardware key, runtime or storage backend is selected by this document. No purchase, wipe, unlock, root, flash, APK install or key generation is authorized here.

## 6. Execution order

1. Select and justify a concrete host only after its trust-boundary claim is explicit.
2. Map actual candidate data flow and sinks before writing Scope A implementation.
3. Review the proposed data model and failure semantics against MASTER + AB + P/P112; resolve any contradiction before coding.
4. Implement only the minimum bounded candidate-reference behavior, if the host can meet the agreed claim.
5. Run SA-N01 through SA-N15 as applicable; record every case as PASS/FAIL/UNKNOWN/NOT RUN with raw evidence.
6. If SA-N10/SA-N11 are in scope and no independent defense exists, do not relabel the result as secure: retain STOP or narrow the threat model explicitly.
7. Update STATUS with exact commit/run/job/artifact references. A document-only pass is never runtime proof.

## 7. Current disposition

- Established: a repository locator can identify a candidate document (Level 0 only).
- Not established: a local runtime, truthful persistent review record, currentness, independent verifier, canonical Constitution owner, protected sink or complete bypass closure.
- Not executed: every test in this document.
- No code or tests changed or ran. No keys/signatures/digest/Constitution freeze/APK/device configuration/deployment/runtime authority changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
