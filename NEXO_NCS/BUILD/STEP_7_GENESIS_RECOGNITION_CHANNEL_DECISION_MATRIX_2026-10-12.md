# NCS STEP 7 — Bounded Genesis Recognition Channel Decision Matrix
Date: 2026-10-12
Branch: `ncs-clean-architecture`
Status: DESIGN / OWNER-DECISION GATE — NO CHANNEL SELECTED — NO IMPLEMENTATION AUTHORIZED

## 1. Purpose and prior decision

This note narrows the already-recorded owner decision in `STEP_7_CURRENT_PHONE_CANDIDATE_THREAT_MODEL_2026-10-08.md`: Kevin accepted a *human-recognized out-of-band comparison* as a possible limited initial-commissioning assumption. He did not select a concrete channel, verifier, credential, storage owner, or enforcement mechanism.

The goal is not to reopen every historical bootstrap option. It is to distinguish which claims each candidate channel can and cannot support, and to identify the smallest unresolved owner choice before any implementation discussion.

## 2. Non-negotiable separation of claims

Four predicates remain independent:

1. **Intent** — Kevin deliberately approved exact Constitution content, version, purpose, and scope.
2. **Presentation/content binding** — the content Kevin reviewed is the same content the system submits for activation.
3. **Verifier provenance** — the verifier and its appraisal policy have a recognized basis that the candidate Constitution/repository cannot unilaterally rewrite.
4. **Enforcement/currentness** — a canonical active-Constitution owner and final protected boundary actually enforce the approved revision, scope, and revocation.

A successful hash comparison supports byte identity only. It does not establish that the content is semantically acceptable, that Kevin approved it, that the verifier is legitimate, or that runtime enforcement exists. A signature proves control of a key under its cryptographic assumptions; it does not by itself establish who legitimately selected the first key or Constitution.

## 3. Candidate channel matrix

| Candidate | Claim it may support | Unresolved assumptions / failure modes | Current disposition |
|---|---|---|---|
| A. A pre-existing, independently recognized channel/device that Kevin already trusts, used to compare the exact frozen Constitution and commissioning scope | A bounded owner-intent comparison, if recognition predates the candidate Nexo flow and content is presented/bound correctly | Must identify the actual channel; establish how content is transferred/displayed; protect against substitution, account recovery, compromise, replay, and shared dependencies | **Candidate class only; concrete channel UNKNOWN** |
| B. A physical/offline copy of the frozen human-readable Constitution plus a separately computed digest/manifest, checked against the exact submitted artifact | Human-readable intent comparison and byte-identity cross-check, if the copy and procedure have a recognized origin | A printed digest does not establish trusted origin by itself; source/print path, artifact extraction, canonical encoding, and scope still need defined handling | **Possible supplemental evidence; not independently selected as root** |
| C. Current phone, its screen, app session, Termux, local file, or key generated on that phone alone | Local interaction or reproducible local checks | Same device/software may display, alter, approve, and submit the artifact; no independent recognition basis demonstrated | **Insufficient alone for C0** |
| D. Public repository, branch name, commit hash, CI green check, release artifact, or repository account alone | Revision identity and useful source/build evidence within the declared platform trust assumptions | Candidate-controlled governance/source path; unsigned/unprotected branch evidence in current inspection; does not independently confer constitutional legitimacy or final enforcement | **Not a Genesis root or owner-approval substitute** |
| E. Android Verified Boot / hardware key attestation alone | Potentially scoped platform/key-integrity claims, only if actual evidence is collected and validated against a recognized trust anchor | Does not establish Kevin's intent, Nexo Constitution legitimacy, canonical currentness, or sink mediation; current NCS source does not integrate verified platform attestation into Genesis | **Potential future supporting evidence, not sufficient alone** |
| F. Two apps/accounts/devices that share account recovery, backup, provider, admin, OS, or trust root | At most two interfaces to evidence | Apparent channel separation can hide a common control/failure domain | **Independence UNKNOWN until dependencies are mapped** |

This matrix deliberately does not choose a hardware vendor, cloud, blockchain, threshold, key scheme, or platform root.

## 4. Smallest safe sequence

1. **Draft and freeze the candidate constitutional content for review**: canonical bytes/encoding, human-readable rendering, version, purpose, scope, and digest. “Freeze for review” is not activation and grants no execution authority.
2. **Name the pre-existing recognition basis** Kevin will use to review the frozen content. It must be recognized independently of the candidate Nexo approval flow under the explicitly accepted threat assumption. If no such basis can be named, stop rather than manufacture one from the candidate system.
3. **Define the comparison transcript**: what Kevin sees, what exact content/scope he compares, what response constitutes approval, how the submitted artifact is proven to match, how freshness/replay is handled, and what happens if presentation or identity is uncertain.
4. **Separately establish verifier provenance**: identify who/what validates the comparison and why its rules cannot be changed unilaterally by the candidate Constitution/repository.
5. **Separately identify canonical current-Constitution ownership and the activation boundary**: define revision ordering, conflicts, revocation, recovery, and the actual last protected boundary.
6. **Adversarially test the concrete composition before any protected activation**. A test of a hash, UI, key, or approval record alone cannot close all four predicates.

If step 2 is unavailable, C0 remains UNKNOWN. If steps 4–5 are unavailable, even a correctly conveyed human approval does not authorize protected commissioning.

## 5. Threat-model constraints carried forward

- Phone possession is not identity.
- A generic “yes”, button press, session identity, or caller-supplied `approved/verified/current` field is not proof of owner intent.
- A candidate app cannot authenticate its own presentation or verifier provenance by self-report.
- A key or hash cannot bootstrap its own legitimacy.
- Recovery cannot replace the initial trust basis by validating a recovery artifact under the same disputed root.
- Offline/unavailable currentness means UNKNOWN/HOLD, not permission.
- A locally committed approval record is not proof that the real activation/effect boundary enforced it.
- Do not install another APK, change signing keys, create a new registry/wrapper, or activate protected effects as part of this design review.

## 6. External standards cross-check

RFC 9334 separates Attester evidence, Verifier appraisal, and the Relying Party's application-specific decision. It explicitly describes trust anchors as the basis for trusting verifier results; the verifier result does not make itself trusted. Source: https://www.rfc-editor.org/rfc/rfc9334.html

The TUF update framework demonstrates that secure root rotation and rollback/freeze protections operate *within an already trusted root model*. Such mechanisms can preserve trust continuity, but cannot determine who legitimately selected the very first root. Source: https://theupdateframework.github.io/specification/v1.0.36/

Android Verified Boot is scoped to the Android boot chain and images protected by that chain. Even valid platform evidence would not alone prove owner intent, Constitution legitimacy, or Nexo sink enforcement. Source: https://source.android.com/docs/security/features/verifiedboot/verified-boot

## 7. Exact unresolved owner choice

Before code, the owner must be able to answer:

**Which pre-existing channel or physical reference does Kevin already recognize independently of the candidate Nexo approval flow, and how will he use it to compare the exact frozen Constitution and commissioning scope?**

This is not a request to trust the current phone, GitHub, ChatGPT, Termux, or an automatically generated key. If no independent recognition basis exists in the intended threat model, the honest result is that initial commissioning cannot yet be established under that model. The architecture must not invent evidence.

## 8. Disposition

- Human-recognized out-of-band comparison: accepted as a bounded candidate assumption only.
- Concrete recognition channel: UNKNOWN / NOT SELECTED.
- Frozen exact Constitution artifact: NOT ESTABLISHED.
- Verifier provenance: UNKNOWN.
- Canonical active-Constitution owner: UNKNOWN.
- Actual target/final activation sink and bypass closure: UNKNOWN.
- Implementation / protected commissioning: NOT AUTHORIZED.
- STEP 7: OPEN / STOP / UNKNOWN.

No code, tests, workflows, keys, Constitution artifact, APK, device, deployment, or runtime state changed. No tests were run.
