# STEP 7 — Bounded Human Comparison Protocol Candidate
Date: 2026-10-12
Status: DESIGN CANDIDATE ONLY — OWNER ACCEPTED ASSUMPTION CATEGORY; CONCRETE OUT-OF-BAND CHANNEL UNSELECTED; NO IMPLEMENTATION AUTHORIZED

## 1. Purpose

Translate Kevin's accepted bounded assumption into a reviewable commissioning procedure: Kevin may convey initial intent only after recognizing a channel outside the candidate Nexo/phone presentation path and comparing the exact Constitution and commissioning scope. This is a human trust assumption, not proof that the device, verifier, storage, or execution boundary is secure.

This record is a candidate protocol for design review, not an implemented or approved operational mechanism.

## 2. Required artifacts

Before any approval can be considered, the proposal requires:

1. **Frozen Constitution artifact:** exact bytes plus a readable rendering. Both are versioned together; changes produce a different artifact identity.
2. **Content identity:** a cryptographic digest calculated by a named, independently reviewed tool/process. The digest binds bytes; it does not prove the Constitution is legitimate or semantically safe.
3. **Commissioning context:** explicit purpose, scope, intended initial authority, and statement of what this approval does not authorize.
4. **Fresh challenge/context identifier:** unique for this commissioning attempt, not caller-supplied evidence of legitimacy. Replay handling must be specified before implementation.
5. **Owner comparison record:** which external reference Kevin recognized, what exact artifact/version/scope was compared, and the resulting decision. A log of a click alone is not proof that comparison occurred.

No actual Constitution bytes, digest, challenge value, key, version, or signature are invented in this design record.

## 3. Candidate comparison sequence

1. Prepare and freeze a proposed Constitution artifact and its readable rendering. Any subsequent edit invalidates the comparison and requires a new review.
2. Make the exact artifact identity available through a channel that Kevin already recognizes **independently of the Nexo commissioning client**. The channel must not be enrolled solely by a claim made by Nexo or by the same unverified client.
3. Kevin reviews the readable content and the declared scope; a digest comparison alone cannot substitute for understanding what is being authorized.
4. Kevin compares the artifact identity against the independently recognized reference. The comparison method must make substitutions, truncated content, revision mismatch, and scope mismatch detectable.
5. If the reference is unavailable, was created only by the candidate system, shares an unexamined recovery/account dependency, or does not match exactly, result is **UNKNOWN/HOLD**.
6. If comparison succeeds, record only a bounded statement: “owner intent was conveyed for this exact artifact and scope under the declared human-recognition assumption.” Do not promote this to “verifier trusted,” “device secure,” “Constitution currently active,” or “protected effects enforced.”
7. A separate protected verifier must validate the evidence and establish the active-Constitution state. The final action/effect boundary must enforce that state and reject bypasses. These remain independent gates.

## 4. Possible out-of-band reference forms — none selected

| Candidate | What it may provide | What it does not prove / unresolved issue |
|---|---|---|
| Physical paper copy or printed artifact identity retained by Kevin | A reference outside the phone's live UI and app/session | How the reference was produced, whether it contains the exact canonical artifact, and how amendments/replacement are handled |
| Separately controlled second device/channel | Potentially independent presentation/comparison | Must inspect shared accounts, cloud sync, recovery, administrator, software/update and network dependencies; “second device” alone is not independence |
| Another human-recognized physical or institutional reference | May supply pre-existing recognition outside Nexo | Provenance, exact-content binding, availability and lifecycle must be established |

A digest shown twice by the same client, two apps on the same phone, a newly generated key, a Git commit, or a self-reported “verified” flag is not an out-of-band reference merely because it has a different label.

## 5. Required failure semantics

- Constitution bytes/rendering/digest mismatch → **STOP**.
- Scope, purpose, version, or challenge mismatch → **STOP**.
- Reference provenance or independence cannot be established → **UNKNOWN/HOLD**.
- Human approval intent cannot be bound to exact content and context → **UNKNOWN/HOLD**.
- Currentness, conflict, or revocation cannot be established → **UNKNOWN/HOLD**.
- Verifier provenance is circular or caller-controlled → **STOP**.
- Active-Constitution state owner is missing/ambiguous → **STOP**.
- Any protected effect can bypass the final gate → **STOP**.
- Recovery, revocation, or replacement path is undefined → no production commissioning.

No failure may be converted to success by retrying with weaker checks, falling back to a caller-provided status, or adding a wrapper that repeats the same untrusted claim.

## 6. Threat review before implementation

The procedure must be attacked for: substituted Constitution; readable rendering differing from bytes; stale paper/reference after amendment; compromised preparation channel; false claim that the reference was independently recognized; replayed approval; changed commissioning scope; device/account recovery; shared dependencies; concurrent or forked active-Constitution histories; verifier substitution; and a final action path that skips enforcement.

Each test needs a named claim, reproducible input/artifact, expected STOP/UNKNOWN result, and observed evidence. Documentation alone does not prove runtime enforcement.

## 7. Open decisions and gates

- **Owner decision still needed:** which concrete independently recognized reference Kevin can actually access and recognize (for example, physical paper versus a genuinely separate device/channel). No option is assumed available.
- **Engineering evidence needed:** exact-content binding, freshness/replay behavior, verifier provenance, canonical active-Constitution state ownership, revision/conflict/currentness rules, revocation/recovery behavior, and a bypass-closed final protected boundary.
- The accepted human-recognition assumption is bounded and claim-relative. It does not authenticate its own channel or verifier, establish cryptographic independence, or authorize real protected effects.

## 8. Disposition

Use this document to review a concrete reference choice; do not implement from this candidate alone. Step 7 remains **OPEN / STOP / UNKNOWN** for protected constitutional commissioning. No source code, tests, workflows, keys, Constitution, APK, or device state changed.
