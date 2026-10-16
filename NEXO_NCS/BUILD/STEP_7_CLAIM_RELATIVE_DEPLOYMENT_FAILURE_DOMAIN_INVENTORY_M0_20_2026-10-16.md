# STEP 7 — Claim-relative Deployment and Failure-Domain Inventory (M0.20)
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: DESIGN INVENTORY / OWNER SCOPE NOT SELECTED / NO IMPLEMENTATION
STEP 7: OPEN / STOP / UNKNOWN

## Purpose
Advance the exact next action in the existing trust-role map and STATUS: make explicit which deployment claims are actually grounded, which target/effect classes remain unselected, and which dependencies could share a failure domain. This is an inventory, not a new trust contract and not a selection of a device, key, vendor, verifier, or effect boundary.

## Evidence sources reused (no closed audit rerun)
- `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_CURRENT_PHONE_CANDIDATE_THREAT_MODEL_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTIONAL_BOOT_COMPOSITION_SOURCE_REVIEW_2026-10-15.md`
- `NEXO_NCS/BUILD/STEP_7_RUNTIME_AUTHORITY_TO_EFFECT_PATH_SOURCE_TRACE_2026-10-15.md`
- M0.18 conditional-commit boundary review and M0.19 snapshot-isolation composition review.

## 1. Claims and protected-effect classes: present status

| Claim / class | Current evidence | Trusted facts required | Current result |
|---|---|---|---|
| G0: owner intentionally recognizes exact initial Constitution + commissioning scope | Owner accepted a bounded human-recognized out-of-band comparison as a limited design assumption on 2026-10-12; concrete comparison channel/procedure remains unselected | Exact content shown/reviewed, exact content submitted, scope/purpose binding, non-circular verifier/provenance, deliberate owner intent | UNKNOWN / NOT ESTABLISHED |
| G1: current Constitution Authority Context | Contract exists as design candidate; no protected establishment path demonstrated | Legitimate Genesis basis, exact Constitution reference, canonical current-state owner, scope/rules, dependencies, revocation/succession | UNKNOWN / BLOCKED |
| E0: ordinary Lúmina simulation mutation | Runtime trace shows adapters/handlers mutate simulation state; owner has not designated this as a constitutional protected effect | Ordinary simulation correctness and app-local state rules; not automatically constitutional authority | OUT OF STEP-7 AUTHORITY SCOPE UNLESS OWNER EXPLICITLY DESIGNATES OTHERWISE |
| E1: persistent local Nexo state / mission-outcome record | Existing state persistence and memory paths are visible; no owner-approved statement that these constitute the initial protected constitutional effect | Exact state owner, authoritative write path, revision/commit semantics, recovery/currentness, effect scope and bypass coverage | TARGET NOT SELECTED / UNKNOWN |
| E2: external or irreversible real-world effect | No concrete initial target or sink approved in reviewed records | Target/resource-side final enforcement, legitimate current authority, effect identity, no-bypass proof, outcome evidence/reconciliation | NOT SELECTED / STOP |
| E3: non-authoritative review acknowledgement (historically called Scope A candidate) | Prior source review describes it as a least-expansive candidate, not as selected or implemented | Exact content/scope binding, verifier provenance, persistence semantics, proof acknowledgement cannot trigger effects | CANDIDATE ONLY / NOT APPROVED OR IMPLEMENTED |

No effect class is promoted into the constitutional scope merely because it is technically easy to test or already has a write path.

## 2. Deployment components and possible common-mode domains

| Component/domain | Candidate role | Failure/compromise that may affect together | What is verified now |
|---|---|---|---|
| Owner's human review/intent | Convey initial recognition intent | Coercion, mistaken comparison, misunderstood scope, substituted content | Only the bounded category assumption was accepted; procedure is unselected |
| POCO X7 Pro / Android / boot chain / lock screen | Candidate interaction channel, not authority root | Device compromise, UI substitution, accessibility/overlay, account/device recovery, stolen-unlocked device | Device metadata previously inspected; no claim that it securely presents or enforces constitutional approval |
| ChatGPT/model/provider/session | Research and drafting aid | Model/provider/session compromise or content substitution | Not an authority source; cannot self-approve Constitution |
| Termux and local scripts on same phone | Potential local experiment/test harness | Same device/OS/account/storage and operator failure domain | No independent trust credit from app/process separation |
| Constitution file / local storage / backup-sync | Preserve bytes and versions | Tampering, stale restore, shared administrator/account, rollback | Bytes can be hashed; hash alone does not establish legitimacy or currentness |
| Genesis verifier / appraisal policy | Evaluate evidence under a policy | Verifier and policy share same compromised root, update pipeline, operator or provider | No legitimate verifier provenance path established |
| Core Authority Context owner/store | Hold canonical active constitutional context | Caller-forged context, stale state, store/operator compromise, update/recovery circularity | No protected owner/store implementation demonstrated |
| Currentness/revocation source | Decide whether roots/context remain current | Offline partition, stale cache, common recovery/account authority, delayed revocation | Offline bounds and safe staleness limits are unspecified |
| Recovery/succession | Restore or replace trust under prior rules | Recovery depends on compromised root; recovery actor can widen own authority | No independently enforceable recovery/succession path demonstrated |
| Runtime adapter/handler/final sink | Enforce authorization before effect | Alternate entry path, direct mutation, caller-owned precondition, shared runtime compromise | Bounded source trace found a direct adapter path outside protected transition; exhaustive deployment closure unknown |
| Canonical state commit/persistence | Persist candidate state conditionally | Non-cooperating writer, filesystem/storage failure, crash after rename, ambiguous caller result | Conditional revision check exists for cooperating writers; all-writer protocol and durability not fully established |

Different applications, processes, keys, vendors, or accounts are not counted as independent without dependency/failure-domain closure. The table identifies possible common-mode relationships; it does not assert that every listed component is active in one deployed Nexo system.

## 3. Currentness and revocation under offline operation

No defensible numeric offline grace period can be selected from current evidence. Do not invent a TTL or assume device clock/epoch/local revision proves currentness.

- If a claim depends on whether the Constitution/root is current and no governed currentness/revocation evidence is available, result remains UNKNOWN/HOLD.
- A cached prior PASS may support history of a past decision, not present authority by itself.
- Any future allowed offline mode must be explicitly claim/effect-specific and governed before implementation; high-consequence or irreversible actions cannot silently inherit a permissive stale window.
- Recovery may restore bounded functions only under pre-established rules; it cannot establish its own legitimacy.

## 4. Final enforcement ownership

The current source evidence does not identify a selected constitutional effect sink with complete mediation. The inspected runtime can call an effect adapter without invoking `executeProtectedTransition()`; the protected transition also trusts injected ports and does not call the currently `NOT_IMPLEMENTED` `effectBoundary.prepare` port. This is a documented architecture gap, not authorization to attach a gate to an arbitrary function.

Before any runtime wiring, owner-approved scope must identify:
1. exact effect class and consequence boundary;
2. state/resource owner and last effect-capable sink;
3. every reachable entry path to that sink;
4. which existing contract owns enforcement there;
5. how legitimate Genesis/current Constitution context reaches that owner without caller assertion;
6. how the sink rejects stale/revoked authority and reports committed, not committed, or uncertain effect outcomes.

Until those are known, protected effects remain STOP.

## 5. Recognition-family comparison: only what current evidence supports

- Immutable provisioning / pre-established predecessor root / platform-measured root / multiple-root threshold are **not ranked or selected** by this inventory.
- The human-recognized comparison is an accepted limited assumption category, but no concrete procedure or independent verifier has been established.
- Platform or hardware claims may only support properties the target actually measures/enforces; they do not confer constitutional legitimacy.
- Multiple roots count as independent only after common-mode dependencies and compromise boundaries are established for the specific claim.
- Local phone + Termux, multiple apps, model plus provider, or two records in one store do not establish independence by separation alone.
- No family can be selected until the owner-approved effect claim, threat boundary, currentness requirement and final enforcement owner are concrete.

## 6. Decisions / non-decisions

**Established as design constraints**
- Trust, identity, authority, capability, policy, execution, effect and verification remain distinct.
- Owner intent must bind to exact Constitution content and commissioning scope.
- Initial Genesis recognition and routine restart revalidation are separate.
- Unknown required currentness, provenance, dependency, order or enforcement blocks dependent protected transitions.

**Not established**
- Actual initial protected effect class.
- Concrete human comparison procedure or trusted presentation path.
- Legitimate independent verifier/root provenance.
- Canonical active-Constitution state owner and currentness/revocation source.
- Allowed offline staleness bounds.
- Production effect sink, exhaustive bypass closure, or deployment identity.
- Permitted physical role sharing.

**No implementation authorized.** No code, tests, workflow, device, key, or Constitution changes were made or run for this inventory.

## Next exact action
Do not create another general trust contract. The remaining irreducible input is owner-governed scope: choose what the *first narrowly bounded constitutional recognition operation* is intended to do and what it must not be able to do. The least expansive candidate in prior research is a non-authoritative review acknowledgement that records human review of exact Constitution bytes/scope but grants no authority and triggers no protected effects; it remains a candidate, not a decision. If that is not the desired scope, do not infer an alternative from current simulation/persistence code.

After the scope is explicitly decided, map only that effect's sink and entry paths and compare recognition families against the resulting threat/failure-domain inventory. Until then, do not wire production runtime or activate effects.

STEP 7 = OPEN / STOP / UNKNOWN.
Constitution = DRAFT / NOT FROZEN / NOT COMMISSIONED.
Protected effects = STOP.
