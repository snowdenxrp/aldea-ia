# V5 Immediate Audit — 2026-09-23

V5 attempted the required structural move toward a finite TLA+ model. Audit was performed immediately rather than treating the draft as verified.

## Blocking defects

### V5-B01 — EffectBinding variables are referenced but not declared
Release/Evidence predicates reference effectBindingEffect, effectBindingTarget and effectBindingTargetFp, but no corresponding variables/constants are declared or initialized.

**Impact:** model is not SANY-ready.

### V5-B02 — admittedAuthorityEpoch is referenced but not declared
Release eligibility compares the current authority epoch with admittedAuthorityEpoch[o], but the variable is absent.

**Impact:** authority admission fencing cannot be checked.

### V5-B03 — Init uses CHOOSE over nonempty sets without a finite configuration contract
The draft assumes Ops, Effects, Targets, Owners, EvidenceIds, AuthDomains, Deps, PolicyVersions and GraphVersions are nonempty where CHOOSE is used. A bounded config must make this explicit.

### V5-B04 — Required dependency binding is duplicated incorrectly
REQUIRED_DEPENDENCIES(o) references requiredDeps[o] before the variable is initialized. This is harmless as a definition but redundant; canonical model should have one authoritative binding.

### V5-B05 — Lease records are represented by parallel scalar maps
The structural intent is per-operation ownership/generation/state, but the model still uses separate maps. This increases the chance of cross-field inconsistency. V6 should use explicit finite records for each lease domain.

### V5-B06 — Effect transitions are still absent
EffectState is declared, but no action currently moves UNSEEN→REQUESTED→UNKNOWN/PARTIAL/APPLIED etc. Thus ReleaseEligible can depend on an APPLIED state that the model cannot reach from Init.

### V5-B07 — Evidence observation/verification actions are absent
Evidence is initialized invalidated, but there is no ObserveEffect or VerifyEvidence action in Next. Therefore valid evidence is unreachable.

### V5-B08 — STOP enforcement is absent
Only RequestStop exists. ENFORCING/VERIFIED are declared but unreachable.

### V5-B09 — Recovery/reconciliation acquisition is absent
Recovery state starts FREE, but AuthorizeRelease requires HELD recovery. Therefore release authorization is unreachable.

### V5-B10 — Policy/dependency/trust invalidation actions are absent
The model cannot demonstrate the critical property that previously valid evidence/release authorization becomes unusable after material safety-context change.

## Structural conclusion

V5 successfully exposed the exact implementation burden needed for an executable canonical model, but it is **not accepted**. The defects are structural, so another incremental patch would recreate the V3/V4 patch chain.

Next reconstruction should:
1. define immutable EffectBinding records;
2. define AuthorityContext and admitted epoch explicitly;
3. define Lease records;
4. define Evidence records;
5. define reachable actions for admission, effect execution, observation, verification, lease acquisition, STOP enforcement, revocation and context invalidation;
6. make every critical action atomic;
7. provide a minimal finite CFG;
8. run SANY, then TLC, before claiming any invariant result.

Status: DESIGNED/SPECIFIED, NOT IMPLEMENTED/TESTED/FORMALLY_CHECKED.
