# STEP 7 — Trust Foundation Root Contract and Independent Recognition Gate — 2026-10-08

Status: P0 DESIGN ONLY — ROOT CHOICE UNRESOLVED — IMPLEMENTATION STOP RETAINED

## Question
What minimum contract can define Nexo's trust foundation without pretending that a software component can authenticate itself as the first authority?

## Evidence reused
- MASTER chain: TRUST ANCHOR → IDENTITY → AUTHORITY → CAPABILITY → POLICY → WORLD REVALIDATION → EXECUTION → VERIFICATION.
- Historical trust-foundation research: minimum TCB is claim-relative; the root cannot be protected only by the mechanism it controls; immutable foundation and verifiably updateable foundation are distinct legitimate families; recovery authority is not automatically normal authority.
- Current candidate attack: self-rooting, provider-rooting, Constitution circularity, snapshot resurrection, epoch/version confusion, unknown revocation, dependency laundering and self-attested provenance are rejected.
- Current repository state: no implemented, independently recognized trust foundation exists. Therefore this document is a semantic design contract, not proof of a real root.

## Root contract — minimum semantic obligations
A trust basis may be reported ESTABLISHED only if all applicable obligations are met at a protected boundary that does not derive its authority solely from the candidate root it is establishing:

1. **Root reference and scope** — identify the exact root/configuration and the claim or protected domain for which it is relied upon. No universal trust implication.
2. **Independent recognition basis** — state the pre-existing trust mechanism or explicit environment assumption that recognizes the root. The root, provider, model, candidate verifier, restored snapshot and Constitution being bootstrapped cannot be their own sole recognizer.
3. **Integrity/authenticity** — establish that the root material matches the recognized basis. A content hash alone is identity, not authority.
4. **Continuity/currentness** — determine whether this is the currently authorized root, not merely a historically authentic root. Version/epoch ordering alone is insufficient.
5. **Update/recovery/revocation** — establish applicable current permissions and status through the governing basis. Unknown status remains UNKNOWN; recovery cannot silently become normal authority.
6. **Dependency closure** — name only governed dependencies required for this specific claim. Any unresolved critical dependency prevents ESTABLISHED.
7. **Transition safety** — during replacement, retain the prior independently enforced basis until the replacement is verified, retain an independent enforcing fallback, or enter safe non-action. Never disable the old root merely because a new root claims readiness.
8. **Rollback/clone resistance** — restoring old bytes or checkpoints must not restore obsolete authority or make stale approvals current.
9. **Failure-domain statement** — enumerate the components and environmental assumptions whose compromise could invalidate the claim. Do not claim closure while a critical dependency is UNKNOWN.
10. **Bounded output** — return ESTABLISHED, UNKNOWN or INVALID with evidence/reasons. This output establishes only the trust basis for the specified claim; it grants no action authority, policy admission, execution, commit or external-effect success.

## Independent recognition families — not selected
The research supports families, not a universal winner:
- Immutable or externally provisioned root.
- Mutable root whose update is authorized and verified by a previously protected root.
- Platform/hardware root, only where the platform actually provides and independently enforces the claimed properties.
- Multiple roots/threshold arrangements, only when independence and common-mode boundaries are demonstrated for the particular claim.

These are not interchangeable implementations. The repository has not selected a device, platform, provisioning ceremony, verifier, authenticator, recovery path or enforcement boundary. Do not turn this list into a design choice by implication.

## Circularity test
For every proposed root R, ask:
- Who recognizes R before R is trusted?
- What enforces that recognition if R, its provider and its verifier are compromised?
- How is currentness/revocation known when disconnected or after rollback?
- Who authorizes R's replacement, and what remains able to enforce safety if replacement fails?
- Which assumptions are explicit environment assumptions rather than verified properties?

If an answer ultimately depends only on R or a component controlled by R, independent recognition is not established. Return UNKNOWN and stop the protected transition.

## Explicit non-goals / forbidden shortcuts
- No self-declared Core/root function, constructor, exported symbol or package name treated as security.
- No provider-supplied `trusted`, `verified`, `authoritative` or provenance flag.
- No Constitution used as its own unproven bootstrap.
- No snapshot, signature, hash, epoch or version treated alone as current authority.
- No generic trust registry, universal crypto abstraction, speculative IDs/queues/retries/fences, or new compatibility layer.
- No implementation, activation, credential enrollment, root rotation, recovery execution or external effect is authorized by this design document.

## Gate decision
The semantic contract can be specified now; its real independent-recognition mechanism cannot honestly be declared complete from current repository evidence. Therefore:
- P0: continue threat analysis and compare candidate trust bases against explicit claims and failure domains.
- P1: blocked until a concrete isolation boundary is evidenced and no-secrets/no-egress conditions are verified.
- Protected commissioning/root operations: blocked.
- If no prior independent recognition basis can be selected and demonstrated, preserve UNKNOWN/STOP rather than inventing one.

## Next action
Create a claim-relative comparison matrix for the candidate recognition families against the actual Nexo deployment needs, common-mode failures, offline currentness, recovery and future portability. Keep every unselected mechanism explicitly unresolved. Do not implement Constitution Authority Context until the root basis exists as a real protected boundary.
