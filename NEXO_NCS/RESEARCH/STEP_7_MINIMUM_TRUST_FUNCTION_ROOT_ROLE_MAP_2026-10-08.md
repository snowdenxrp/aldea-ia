# STEP 7 — Minimum Semantic Trust Function / Root Role Map
Date: 2026-10-08
Status: P0 RESEARCH / SEMANTIC CANDIDATE ONLY / NOT ACCEPTED AS DEPLOYMENT CONTRACT

## Purpose
Consolidate the existing MASTER, AB104 and P/P112 trust-root findings into one role map before choosing any physical bootstrap mechanism. This follows the existing NCS handoff's exact next action. It is not a generic trust registry, quorum engine, implementation contract, or assertion that a root is deployed.

## Evidence basis reused (no historical probes rerun)
- MASTER: `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md`, including PG-006, claim-specific TCB, separate governance/recovery/update roots, and bootstrap failure semantics.
- Trust foundation / minimum TCB / root update: `docs/nexo/NEXO_TRUST_FOUNDATION_MINIMUM_TCB_RECOVERY_KEY_ROOT_UPDATE_RESEARCH_V1_2026-09-24.md`.
- Independent recovery reconstruction: `docs/nexo/AB104.445_MULTI_ROOT_RECOVERY_INDEPENDENT_TRUST_RECONSTRUCTION_2026-09-26.md`.
- Root enrollment/de-enrollment governance: `docs/nexo/AB104.446_ROOT_ENROLLMENT_DEENROLLMENT_RECOVERY_GOVERNANCE_2026-09-26.md`.
- Byzantine quorum/common-mode/root rotation/compaction: `docs/nexo/NEXO_BYZANTINE_QUORUM_COMMON_MODE_ROOT_ROTATION_MEMBERSHIP_COMPACTION_RESEARCH_V1_2026-09-24.md`.
- Live effect invalidation/scope-widening/final-gate races and P112 final-gate evidence.
- NCS Step 7 deep RATS/NIST consolidation and current trust-root handoff.
- External cross-check: RFC 9334 RATS role separation and NIST SP 800-193 logical roots for update, detection and recovery. These are technical references, not a source of Nexo constitutional legitimacy.

## Core conclusion
Do not model bootstrap as one universal `GenesisRoot`. Define semantic trust functions and the claims each may support first. A single physical mechanism may implement more than one role only when the claim-specific threat model explicitly accepts the resulting common-mode dependency and the relevant enforcement boundary remains independent of the authority being constrained.

Role separation is semantic; physical separation is a deployment choice; independence is a claim-specific property that must be evidenced. None implies the others.

## Minimum role map (candidate)

### G — Constitutional / governance legitimacy
**May establish:** which constitutional version and governance rules are legitimate; which protected actors may authorize constitutional amendments, authority-root changes, succession, or genesis commissioning.
**Must not infer:** legitimacy from a model output, a provider, an artifact signature alone, a local root list, a recovery key, a quorum count, or a self-authored approval.
**Critical dependency:** an authority/enforcement path not wholly controlled by the candidate governance state it is asked to authorize.
**Failure/unknown:** no genesis activation; no constitutional root replacement; preserve evidence and enter HOLD/NO_ACTIVATION.
**Independence:** cannot be solely self-authorized by the new root or by the compromised root it replaces.

### I — Integrity / measurement / execution-state evidence
**May establish:** bounded claims about measured boot, artifact identity, platform state, or execution measurements within its attestation scope.
**Must not infer:** that measured code is semantically safe, that the measured policy is legitimate, or that a measured instance has constitutional authority.
**Critical dependency:** measurement chain, verifier policy/configuration, evidence freshness, platform and update dependencies.
**Failure/unknown:** integrity-dependent claims become UNKNOWN/STALE; no strong claim about the unmeasured execution path.
**Independence:** verifier appraisal cannot rely solely on the same untrusted execution instance for the claim that instance is trustworthy.

### A — Identity / attestation / credential binding
**May establish:** a bounded association among a subject/device/incarnation and an authenticator or attestation identity.
**Must not infer:** current authorization, Constitution authority, independence, or permission for a specific effect.
**Critical dependency:** enrollment legitimacy, authenticator provenance, anti-replay/freshness, revocation/currentness, verifier trust.
**Failure/unknown:** reject protected authentication or keep it at a non-authoritative recognition level.
**Independence:** enrollment and verifier paths must be examined for common-mode control; two credentials or devices do not automatically provide independent evidence.

### R — Recovery / succession authority
**May establish:** a bounded recovery transition under a previously legitimate recovery policy, including quarantine, restoration to a permitted state, and proposing/admitting a replacement recovery incarnation where explicitly authorized.
**Must not infer:** unrestricted normal authority, power to rewrite the Constitution, permission to lower its own threshold, or legitimacy merely because normal authority is unavailable.
**Critical dependency:** pre-established recovery legitimacy, independence from the compromised closure, predecessor cutoff, current recovery policy, uniqueness/order of successor, old-root invalidation, effect reconciliation.
**Failure/unknown:** QUARANTINED/UNKNOWN; do not choose between conflicting successors by timestamp, generation, count, or local preference.
**Independence:** must not depend exclusively on the root being recovered. Recovery cannot silently promote itself into constitutional authority.

### U — Update / configuration admission
**May establish:** that a specific artifact/configuration change satisfies an authorized update policy, provenance and compatibility requirements.
**Must not infer:** that a signed update is currently authorized, semantically safe, or allowed to enlarge authority.
**Critical dependency:** current update authority, dependency closure, rollback protection, semantic compatibility, a safety boundary that remains enforceable during transition.
**Failure/unknown:** retain old verified state if safe; otherwise safe non-action. Never disable the old boundary before the replacement is verified or an independent fallback is enforceable.
**Independence:** the component being updated cannot be the sole judge of whether its own update preserves safety.

### D — Detection / monitoring / compromise evidence
**May establish:** observations, alarms, divergence, suspected compromise, or evidence requiring quarantine.
**Must not infer:** that detection alone selects a legitimate successor root or authorizes release from containment.
**Critical dependency:** sensor/provenance integrity, observation coverage, freshness, independent corroboration appropriate to the claim.
**Failure/unknown:** retain uncertainty; detection gaps reduce assurance. A monitor may trigger containment without becoming a governance root.
**Independence:** separate observations help only if common-mode dependencies are considered; different keys or vendors are not proof of independence.

### W — Historical continuity / external-resource witness
**May establish:** bounded facts about previously observed history, an external resource's state, or evidence that two views diverged.
**Must not infer:** current constitutional authority, completeness of unseen history, or which conflicting root must win.
**Critical dependency:** witness scope, retention floor, freshness, consistency evidence, identity and independence of the witness.
**Failure/unknown:** historical evidence remains historical; currentness is UNKNOWN. Do not resurrect authority from a snapshot or infer missing events.
**Independence:** a witness can be independent for one claim but not another; resource state is not authority history.

## Cross-role rules / invariants
1. **Role scope:** `ROLE_VALID(R, claim C)` never means `GLOBAL_TRUST`; each role supports only named claim classes.
2. **No authority transitivity by implication:** integrity evidence does not grant identity; identity does not grant authority; recovery does not grant normal or constitutional authority; update approval does not authorize expanded scope.
3. **Currentness is a separate predicate:** authentic signatures, valid historical receipts, old snapshots, or matching bytes do not establish current authority.
4. **Transition invalidation:** a change in a claim-relevant root, policy, membership, verifier, platform, recovery owner, or dependency makes dependent admissions stale until revalidated.
5. **Root succession is an ordered protected transition:** predecessor cutoff, successor uniqueness, old-root invalidation, affected-effect reconciliation and explicit release must be resolved; new-key creation is not new trust.
6. **Independence is claim-relative:** evaluate the minimum dependency closure capable of falsifying the specific claim, including enrollment, verifier, update, recovery, identity, operator, cloud/KMS, platform and enforcement dependencies as applicable.
7. **No scalar trust score:** quorum count, signature count, device count, generation, or timestamp cannot substitute for the required predicates or protected ordering.
8. **No weaker fallback:** missing roots, offline revocation, conflict, or recovery difficulty must not silently lower thresholds or expand authority.
9. **Enforcement boundary:** a valid result is not protection unless the relevant effect boundary actually rejects stale, revoked, or unauthorized context.
10. **Claim-relative TCB:** include every dependency whose failure can falsify the claim; do not claim closure while a critical dependency is UNKNOWN.
11. **No false atomicity:** persistence conflict tokens and global revisions are not semantic authority fences unless the protected contract proves that property.
12. **Safe non-action:** if the transition cannot preserve an enforceable boundary, protected activation/release stays blocked.

## Sharing rules — what can and cannot be concluded now
- **Must remain semantically distinct:** governance legitimacy; identity/credential binding; integrity evidence; recovery authority; update admission; detection; execution/effect verification. This does not force seven separate devices.
- **Potential physical co-location:** roles may share a platform or service only after the claim-specific threat model documents shared failure modes, the combined TCB, the effect on independent claims, update/recovery dependencies, and the fallback if that shared domain is compromised.
- **Must not be called independent solely because:** keys differ; processes/services differ; devices differ; organizations use different names; quorum count is above threshold; attestations are signed; or a provider says components are isolated.
- **No universal separation matrix yet:** exact MUST-NOT-SHARE relationships depend on protected claims and concrete enforcement architecture. The repository does not yet establish a deployed verifier/root or enough deployment facts to safely freeze physical co-location rules.

## NIST/RATS cross-check
RATS separates trust-anchor configuration, Attester/Evidence, Endorser/Endorsements, Verifier/Appraisal Policy and Relying Party; appraisal results depend on the relying party's trust anchors and policy. NIST SP 800-193 treats update, detection and recovery as distinct root-of-trust functions. This supports role decomposition, not an assertion that any particular mechanism is independent or constitutionally legitimate. See RFC 9334 and NIST SP 800-193; NIST digital identity guidance is relevant to authenticator binding, invalidation and recovery lifecycle but does not decide Nexo governance.

## Future-countereffects gate
- A universal GenesisRoot would couple constitutional authority, integrity, identity and recovery; compromise of one mechanism could amplify across roles.
- A generic independence engine or trust registry would add machinery without a concrete contract proving it necessary.
- Excessive role fragmentation could create coordination and migration complexity without increasing real independence.
- Physical co-location may be reasonable for weaker claims but unsafe for stronger claims; a single global rule would either overconstrain deployment or understate risk.
- A recovery root that can rewrite normal/constitutional authority becomes an unbounded second constitution.
- A role map can be mistaken for enforcement; labels and typed records do not enforce boundaries.
- Therefore this remains a semantic research map, not an implementation schema or authorization to select roots.

## Decision
- 🟢 Existing MASTER/AB/P research already supports role-specific trust, claim-relative TCB, common-mode closure, bounded recovery, anti-rollback, currentness, and fail-closed transitions.
- 🟢 The actionable synthesis is to map functions/claims before selecting a physical root; no new root mechanism is justified by this review.
- 🔵 The map is a candidate semantic aid, not accepted as a frozen contract.
- 🔵 Concrete deployment role owners, channels, verifiers, physical co-location, independent enforcement and recovery/succession remain unselected/unproven.
- 🔴 Trust Foundation, Constitution Authority Context, genesis activation, and protected authority implementation remain BLOCKED.
- 🔴 Future-countereffects gate remains CLOSED.

## Exact next action
Attack this map for missing/overlapping authority and circular dependencies, especially:
1. emergency STOP / safety containment vs constitutional authority;
2. human succession vs machine recovery vs pre-authorized emergency recovery;
3. integrity verifier vs enforcement/effect boundary;
4. root replacement when all known roots share a common-mode dependency;
5. offline operation and revocation/currentness.
Do not implement the map, choose a physical root, or reopen closed historical probes.