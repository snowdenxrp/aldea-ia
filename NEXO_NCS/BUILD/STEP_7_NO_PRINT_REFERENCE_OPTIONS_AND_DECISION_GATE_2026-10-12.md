# STEP 7 — No-Print Reference Options and Decision Gate
Date: 2026-10-12
Status: DESIGN / DECISION SUPPORT ONLY — NO REFERENCE CHANNEL SELECTED — NO IMPLEMENTATION OR PROTECTED COMMISSIONING AUTHORIZED

## Purpose
Advance the already accepted bounded human-recognition assumption without requiring immediate printing and without falsely treating two apps on one phone as independent. This document narrows the owner decision and identifies what can proceed safely while the concrete reference is unavailable.

## Fixed constraints
- Kevin is the normative initial human constitutional authority. This governance choice is closed.
- A human-recognized out-of-band comparison is an accepted bounded assumption category, not a concrete mechanism.
- POCO/M1 is a prototype/test device, not designated as the initial constitutional commissioning device.
- A Git commit, digest, signature, local key, app label, or self-reported VERIFIED/AUTHORIZED value does not establish its own legitimacy.
- Two apps on one phone, two displays fed by the same unverified source, or a second device sharing an unexamined account/recovery/update dependency are not automatically independent.
- No concrete Constitution bytes, digest, challenge, key, or approval record may be fabricated for a real commissioning attempt.
- Missing reference, unclear provenance, mismatch, or scope uncertainty means UNKNOWN/HOLD; no protected commissioning or effects.

## Candidate options without immediate printing

### Option A — Existing physical reference already held by Kevin
Potential value: can exist outside the current phone/app presentation path.
Required evidence: establish how it was produced, which exact Constitution revision/scope it represents, whether it can be compared completely, and how amendments invalidate it.
Availability: UNKNOWN. Do not assume an existing copy exists.
Disposition: viable only if an already-existing and recognizable exact reference is actually available.

### Option B — A genuinely separate device/channel already controlled and recognized by Kevin
Potential value: may provide a separate presentation path for comparison.
Required evidence: trace artifact origin and inspect shared account/cloud synchronization, recovery, administrators, updates, and source control. A second screen is insufficient.
Availability: UNKNOWN. Do not assume Kevin has such a device/channel.
Disposition: conditional candidate, not selected.

### Option C — Existing external human-recognized reference or custodian
Potential value: a previously recognized source outside the candidate Nexo client may anchor the human comparison.
Required evidence: establish provenance, scope, exact-content binding, availability, dependency/failure domains, and that the custodian does not silently gain constitutional authority.
Availability: UNKNOWN. No custodian is selected or presumed.
Disposition: conditional candidate; must not transfer governance away from Kevin.

### Option D — Generate a new reference from the current phone, then compare it on that same phone
Potential value: convenience only.
Problem: circular provenance; both the proposal and reference may be changed by the same source. A digest detects byte mismatch only relative to a trusted digest; it does not create trust.
Disposition: rejected as an independent Genesis reference.

### Option E — Wait until a valid external reference can be created/recognized
Potential value: avoids pretending a missing reference exists and permits continued safe engineering.
Cost: protected commissioning remains unavailable.
Disposition: safe fallback when A–C cannot be established. This is not abandonment of STEP 7.

## Decision rule
Do not choose A, B, or C from convenience or assumption. First establish which option actually exists and is already recognizable to Kevin independently of the uncommissioned Nexo client. If none is established, select E for protected commissioning while continuing non-protected construction and adversarial tests with explicitly synthetic fixtures.

## Work that can proceed without the real reference
1. Audit and test the generic protected-transition behavior with synthetic inputs only; clearly label these as component tests, not Genesis trust evidence.
2. Define negative cases: caller-injected AUTHORIZED result, missing verifier, changed Constitution bytes/rendering/scope, replayed approval, stale or revoked authority, conflicting active revisions, interruption, and bypass of final boundary.
3. Specify expected outcomes (STOP/UNKNOWN, no protected transition) without claiming the production system enforces them.
4. Inspect the existing code for an actual composition point and last effect-capable boundary only when new source evidence is available; do not repeat completed broad inventories or create a placeholder store/wrapper.
5. Keep the initial commissioning scope narrow: recognize one exact initial Constitution/version/context only. Do not infer permission for policies, missions, tools, external effects, amendment, recovery, or succession.

## Separate gates that a reference does not close
Even a valid human comparison does not by itself establish:
- non-circular verifier provenance;
- a canonical Core-owned active-Constitution state owner with revision/conflict/currentness semantics;
- revocation, replay, recovery, replacement, and crash/interruption behavior;
- a real final protected activation/effect boundary and closure of bypass paths.

## Decision checkpoint
Ask Kevin one focused availability question only after this comparison: does he actually have (A) an existing physical reference, (B) a separate already-recognized device/channel with potentially independent dependencies, or (C) an existing recognized external human/custodian reference? If none, no more channel-selection questioning is needed now; preserve E and continue safe synthetic engineering.

## Disposition
No reference option is selected. No keys, hashes, signatures, Constitution artifacts, tests, workflows, device state, or APKs are changed by this document. STEP 7 investigation/construction remains ACTIVE; protected constitutional commissioning remains OPEN / STOP / UNKNOWN.
