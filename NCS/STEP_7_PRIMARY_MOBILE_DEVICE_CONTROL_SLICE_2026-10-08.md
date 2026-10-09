# NCS — STEP 7: Primary Mobile Device Control Slice
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: DESIGN / ANALYSIS ONLY — NOT IMPLEMENTATION OR RUNTIME EVIDENCE

## 1. Scope decision
The first concrete deployment slice to analyze is the user's personal cellphone, because it is the device that is ordinarily with the user and is the most plausible first interaction surface for Nexo.

This selects a *device class and role*, not a verified hardware/software target. Exact make, model, OS version, patch level, boot state, installed security features, management state, and intended control APIs remain UNKNOWN. Do not infer them from an account or app user-agent.

The phone is an interaction/execution environment, not the constitutional root of Nexo authority. Possession of the phone, successful unlock, biometric acceptance, an authenticated app session, a model response, or a cached authorization must not independently grant authority for protected actions.

## 2. What this slice is intended to learn
Map the path from a user request to a consequential phone-side effect and determine, for each effect:
- what is being requested and under which authority/permission;
- which component actually performs the last irreversible or externally consequential step;
- what evidence proves the effect occurred (not merely that it was requested);
- how identity, freshness, scope, revocation, expiry, and replay are checked;
- what happens under lock, reboot, offline operation, account/session loss, app compromise, OS compromise, stale cache, duplicate delivery, and recovery;
- whether a security boundary is independent of the component whose compromise it is meant to resist.

## 3. Candidate effect families (not yet enabled)
M1. Read-only interaction: display status or answer a question.
M2. Local reversible actions: open an app or change a non-sensitive setting.
M3. Sensitive local access: access private files, microphone/camera, location, or notifications.
M4. Credential or authority operations: reveal/use secrets, enroll/rotate a root authenticator, change recovery, or alter succession.
M5. External/consequential actions: send a message, make a purchase, unlock/control another device, publish data, or initiate a transaction.

These are analysis categories only. No permissions, integrations, or capabilities are granted by this document.

## 4. Baseline invariants to test against every path
1. Device possession is not proof of the authorized person.
2. Device unlock or biometric success is one signal, not universal Nexo authorization.
3. Authentication is not authorization; authorization is not enforcement; enforcement is not proof of effect.
4. Authority is action-, target-, scope-, and time-specific; deny or UNKNOWN when any required element is missing or conflicting.
5. Revalidate authority at the last enforceable boundary for consequential effects; a stale cached decision cannot override revocation or a newer authority epoch.
6. A request, approval prompt, API return, queue acknowledgement, or process log does not by itself prove the external effect.
7. Repeated delivery must not silently repeat a consequential effect; idempotency keys do not replace authorization checks.
8. Offline behavior must be explicitly bounded. If current authority/revocation cannot be established for a protected action, fail closed or require a pre-defined safe degraded mode; never silently promote cached state into current authority.
9. Root enrollment, root rotation, recovery, and succession are separate protected flows and remain STOPPED until independent recognition and enforcement are specified and evidenced.
10. If the phone or its privileged OS is compromised, the architecture must state which guarantees survive; do not claim the compromised endpoint can independently attest to its own trustworthiness.

## 5. Threat/failure inventory
| Condition | Required question | Initial status |
|---|---|---|
| Phone lost or stolen | Can possession alone invoke protected actions? | Requirement: NO; enforcement UNKNOWN |
| Phone unlocked by another person | What distinguishes local unlock from Nexo authority? | UNKNOWN |
| Biometric/PIN accepted | What exact assurance and scope does this provide? | UNKNOWN |
| App process compromised | Can attacker bypass policy or fabricate approvals/evidence? | UNKNOWN |
| OS/privileged service compromised | Which controls remain outside the compromised domain? | UNKNOWN |
| Phone offline | Which decisions require current revocation/authority? | UNKNOWN |
| Stale token/cache | Is expiry, epoch/fence, and revocation checked at final boundary? | UNKNOWN |
| Replayed/duplicated request | Is there durable request identity and effect reconciliation? | UNKNOWN |
| Reboot/crash during effect | Can state be reconciled without repeating the effect? | UNKNOWN |
| Recovery or replacement phone | Can recovery become an authority escalation path? | UNKNOWN |
| Late/conflicting history | Is conflict surfaced as UNKNOWN/STOP rather than resolved by arrival order? | UNKNOWN |
| External target acts asynchronously | What independent evidence confirms actual target state? | UNKNOWN |

## 6. Dependency and enforcement map — intentionally unresolved
- Human authorization ceremony / trusted presentation: UNKNOWN.
- Independent recognition of the initial constitutional authority: UNKNOWN.
- Phone hardware-backed key availability and threat model: UNKNOWN.
- OS security properties and patch/support status: UNKNOWN.
- Nexo process/app boundary and local policy location: UNKNOWN.
- Network, identity provider, and authority freshness dependency: UNKNOWN.
- Last enforcement point for each action family: UNKNOWN.
- External target and its acknowledgement/state evidence: UNKNOWN.
- Recovery, device replacement, revocation propagation, and emergency cutoff: UNKNOWN.

These UNKNOWN values are deliberate. Do not fill them by assumption; resolve them from a chosen, verified target and explicit architecture decisions.

## 7. Required next sequence
1. Identify the exact phone make/model and OS/version only if needed for platform-specific feasibility; until then, keep the analysis platform-neutral.
2. Select one initial action family, preferably read-only interaction first, and write its end-to-end claim/effect contract.
3. Trace each hop from user intent to final effect; mark trust domains and all failure modes.
4. Separate evidence of authorization, evidence of enforcement, and evidence of actual effect.
5. Compare existing root-recognition families against this failure graph without selecting a root or implementing enrollment.
6. Update the requirement matrix only when a concrete design or evidence changes a row.
7. Do not merge branches, implement privileged controls, enroll root authority, or enable protected effects as part of this analysis.

## 8. Acceptance criterion for this analysis slice
The slice is not implementation-ready until every in-scope effect has an explicit target, actor, authority/scope/freshness contract, final enforcement boundary, dependency/failure model, offline/revocation behavior, recovery/cutoff behavior, and authoritative effect-evidence definition. Any missing element remains UNKNOWN and blocks protected implementation.

## 9. Non-goals
This document does not assert that the phone is secure, that biometric authentication is sufficient, that Android-specific protections are present, or that any Nexo action is currently possible. It does not install, configure, control, or modify the phone. It does not establish runtime proof.
