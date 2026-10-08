# STEP 7 — Minimum Trust Role Map Adversarial Review
Date: 2026-10-08
Status: P0 DESIGN ATTACK / NO IMPLEMENTATION / ROLE MAP NOT FROZEN

## Target
Attack `STEP_7_MINIMUM_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md` for role overlap, circular authority, unhandled emergency paths, verifier/enforcement coupling, common-mode total loss and offline currentness.

This is a semantic review of existing findings, not a runtime test, formal proof, or new mechanism.

## Attack A — Emergency STOP is mistaken for a constitutional root
**Scenario:** Nexo loses governance connectivity or detects a possible compromise. A STOP-capable component blocks protected effects, then claims that because it can stop the system it may also choose a replacement root or authorize restart.

**Result:** STOP/containment and constitutional authority are different scopes. A safety mechanism may be allowed to reduce capability or prevent effects under a pre-authorized policy without gaining authority to amend the Constitution, appoint a successor, lower recovery requirements, or release the stop. STOP REQUESTED, STOP OBSERVED, STOP ENFORCED and RELEASE AUTHORIZED remain distinct. A containment authority may be physically separate or part of a larger mechanism, but it cannot promote itself by exercising a one-way restrictive power.

**Failure state:** STOP/HOLD remains enforced; recovery decision remains unresolved. Restart is not release.

## Attack B — Human succession, machine recovery and emergency recovery collapse into one role
**Scenario:** The normal owner authenticator is lost, machine recovery is unavailable, and an emergency safety mechanism can still act. The system treats whichever actor is reachable as the new owner.

**Result:** Reachability does not establish legitimacy. Three questions must remain separate:
1. **Governance legitimacy:** who is entitled under pre-existing rules to appoint or recognize a successor?
2. **Recovery mechanics:** which technical process restores a bounded service or trust function under that legitimate decision?
3. **Emergency containment:** which pre-authorized action may reduce risk while legitimacy is unresolved?

A human may be the legitimate decision-maker without the device/channel used to communicate the decision being trusted. A machine may execute a recovery protocol without having authority to decide who should govern. Emergency recovery can preserve or restore only the scope explicitly pre-authorized; it cannot become a hidden constitutional amendment path.

**Failure state:** No legitimate successor => no new constitutional authority. Preserve history/effects and remain QUARANTINED/NO_ACTIVATION. Do not infer that loss of the current root transfers its powers to recovery.

## Attack C — Integrity verifier declares the effect boundary safe
**Scenario:** A verifier reports a valid measurement or appraisal, then assumes the protected action must be blocked if the report says deny—or safe to execute if it says allow. The actual effect boundary has no demonstrated binding to the verifier's decision, current authority, or incarnation.

**Result:** Evidence appraisal and enforcement are separate predicates. A correct verdict that is not consumed by an enforcing boundary is advisory only. Conversely, an effect boundary cannot establish its own independence merely by checking a report generated inside the same untrusted closure. The claim must identify where stale/revoked/unauthorized operations are actually rejected and how that rejection is evidenced.

**Failure state:** If enforcement cannot be established, no strong prevention claim; protected effect remains blocked or classified UNKNOWN. No new generic coordinator is justified by this gap alone.

## Attack D — Every known root shares one common-mode dependency
**Scenario:** Governance, identity, update and recovery use different keys, but all enrollment, signing, policy distribution, update and revocation depend on the same compromised provider/control plane. That provider is lost or suspected compromised.

**Result:** Distinct role labels and keys do not supply independent trust. If all admissible roots depend on the suspected domain and no previously established outside authority remains, the system has no demonstrated basis to promote a replacement. Do not bootstrap a new external authority from the compromised domain's own statement, select the largest quorum, or infer independence from organizational names.

**Failure state:** Freeze/quarantine the affected trust domain; preserve evidence; no protected root replacement. Safe non-action may be the only honest result until an independently justified basis is available. This is an availability loss, not permission to invent authority.

## Attack E — Offline operation and revocation/currentness
**Scenario:** Nexo is offline and has a valid previously signed credential, root list and approval receipt. The root may since have been revoked, policy changed, device replaced, or governance generation superseded.

**Result:** Authenticity of cached material does not establish currentness. Offline operation can only make claims bounded by an explicit freshness/currentness model that the applicable enforcement boundary can actually enforce (for example, pre-authorized limited scope and an enforceable expiry/fence where justified). This review does not select such a model. If the relevant revocation or authority-currentness predicate cannot be established, protected actions whose safety depends on it remain HOLD/UNKNOWN; there is no silent offline downgrade.

**Failure state:** Permit only those narrowly bounded offline behaviors already authorized by a proven policy; otherwise safe non-action. Never treat absence of a revocation message as evidence that no revocation occurred.

## Attack F — Role map itself becomes a fake security mechanism
**Scenario:** An implementation serializes the role names, marks each as trusted, and treats the existence of a complete map as proof of independence and enforcement.

**Result:** The map is only a semantic analysis aid. It does not instantiate roots, protect keys, prove enrollment, close dependencies, enforce revocation, order transitions, or block effects. Typed records, hashes, signatures, and a completed checklist do not replace the concrete boundary and evidence required by each claim.

**Failure state:** No implementation or assurance credit from the map itself.

## Attack G — Recovery root can rewrite the rules that constrain recovery
**Scenario:** A recovery key is permitted to replace itself, change governance thresholds, or sign a new Constitution because normal authority is unavailable.

**Result:** This creates a circular self-promotion path and turns recovery into unbounded normal/constitutional authority. If a broader recovery or succession power is desired, it must be granted by a prior legitimate governance rule and bounded in scope, triggers, effects, and transition semantics. A lost root cannot supply the missing authorization for its own successor.

**Failure state:** Reject the self-authorized expansion; remain in bounded recovery/containment or NO_ACTIVATION.

## Cross-layer result
The role map survives as a **useful semantic decomposition**, but it does not establish the concrete root, trust channel, or enforcement mechanism. The attacks sharpen four constraints:
- restrictive STOP authority must not self-promote to release/governance authority;
- governance legitimacy, recovery mechanics and emergency containment are separate;
- verifier output must be connected to a demonstrated enforcement boundary;
- no independent root basis means no protected root replacement, even if that sacrifices availability;
- offline currentness requires a bounded, enforceable claim; cached authenticity alone is insufficient.

These are consistent with MASTER, AB104 root/recovery work, AB109 STOP/revocation invariants, and P112 final-gate principles. They do not justify another layer or generic independence engine.

## Future-countereffects gate
No new mechanism proposed. Avoid adding a universal emergency root, universal currentness service, quorum engine, root registry, or coordinator. Such machinery would not itself solve governance legitimacy or enforcement. The concrete deployment threat model must decide whether any physical role-sharing is acceptable.

## Decision
- 🟢 Role decomposition remains useful as a candidate semantic map.
- 🟢 No contradiction with MASTER/AB/P112 found in this attack.
- 🔵 Role map not frozen; physical role sharing and deployment claims remain unselected.
- 🔴 No verifier/root/channel is proven or accepted for genesis.
- 🔴 Trust Foundation, Constitution Authority Context, protected commissioning and protected authority implementation remain BLOCKED.
- 🔴 Future-countereffects gate remains CLOSED.

## Exact next action
Before accepting the map, cross-check it against the canonical NCS contracts for Trust Foundation, Genesis Trust Foundation, Bootstrap Composition and Independence/Failure Domain, and record any missing invariant or semantic overlap. If no new gap is found, freeze only the semantic map (not the deployment mechanism) and return to the highest-level unresolved governance decision. Do not repeat historical AB/P probes or implement from this review.