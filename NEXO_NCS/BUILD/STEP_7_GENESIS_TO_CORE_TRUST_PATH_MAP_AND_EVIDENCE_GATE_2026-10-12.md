# NCS STEP 7 — Genesis-to-Core Trust Path Map and Evidence Gate — 2026-10-12

Status: SOURCE-INSPECTED GAP MAP — DESIGN ONLY — PROTECTED COMMISSIONING STOP

## Purpose

Record the smallest current trust/control path from a recognized Genesis basis to a protected transition, using only source inspected on branch `ncs-clean-architecture`. This document does not implement or authorize constitutional activation.

## Evidence-backed path

| Edge | Existing source evidence | Status | What is not established |
|---|---|---|---|
| 1. Independently recognized basis → Genesis verifier | `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md` defines semantics only; no source-backed Genesis verifier identified in this review. | UNKNOWN / NOT IMPLEMENTED IN EVIDENCE | Recognized root, verifier provenance, currentness, revocation, succession/recovery. |
| 2. Genesis result → Constitution Authority Context | `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md` says context must be established from an already-recognized foundation, not caller claims. No production establishment owner/path identified in reviewed source. | UNKNOWN / NOT IMPLEMENTED IN EVIDENCE | Core-owned active Constitution state and protected establishment provenance. |
| 3. Exact Constitution/context + explicit owner approval → content-bound claim | `createClaimEnvelope()` in `src/nexo/core/contracts.mjs` structurally creates a claim; it does not authenticate who approved it or bind that approval to an independently established active Constitution. | STRUCTURAL CARRIER ONLY | Protected approval owner, exact-byte/rendering binding, scope and fresh challenge/anti-replay. |
| 4. Freshness/currentness/lifecycle → authority decision | `src/nexo/core/protected-transition.mjs` calls injected `ports.authorityGate.check(claim)`; `src/nexo/core/ownership.mjs` defaults missing gate to `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED`. | PORT EXISTS; TRUSTED IMPLEMENTATION UNKNOWN | Legitimate gate provenance, stale/revoked-root behavior, lifecycle and recovery enforcement. |
| 5. Authority decision → protected transition | `executeProtectedTransition()` stops on supplied STOP/UNKNOWN and proceeds for a valid status of AUTHORIZED. | GENERIC COMPOSITION EXISTS | A caller/injected gate returning AUTHORIZED is not, by itself, evidence of legitimate authority or production wiring. |
| 6. Transition commit → actual final effect boundary | The transition uses `conditionalCommit.commit(candidate)`; `createCorePorts()` exposes `effectBoundary.prepare`, but the inspected transition does not call it. | APP-STATE COMMIT ONLY; FINAL EFFECT UNKNOWN | No demonstrated last boundary for constitutional commissioning or external/physical effects; no bypass-closure evidence. |
| 7. Missing/invalid/unknown trust → enforced no-transition | Focused tests pass for absent gate implementation and STOP/UNKNOWN outcomes at this generic composition boundary. | COMPONENT TEST EVIDENCE ONLY | Does not establish production composition, deployed-device behavior, or that every protected effect is mediated. |

## Bounded call-graph check (2026-10-12)

Repository code search for `executeProtectedTransition` returned the function definition and references in the focused composition and conditional-commit integration tests; no production call site was identified in the inspected results. Search for `resolvePolicyContext` returned its definition and focused test, with no production consumer identified. Search for `effectBoundary.prepare` returned only the default port declaration in `src/nexo/core/ownership.mjs`.

This is a bounded source-search finding, not proof against every dynamic import, external consumer, generated build, or runtime path. It is sufficient to say that this review has not identified an existing production protected-effect target to wire. Therefore do not invent one during this step; the deployment/effect target remains an explicit unresolved decision.

## Concrete persistence target check (2026-10-12)

The existing `src/nexo/adapters/conditional-commit-persist-state.mjs` adapter delegates to the `persistState` primitive. The focused integration test `tests/nexo/conditional-commit-persist-state.test.mjs` imports `loadState`, `applyState`, and `persistState` from `scripts/simulate.mjs`, writes a temporary `world-state.json`, and verifies state revision advancement and stale revision conflict. The Step 3C integration gate explicitly says that no external effect is implemented by this step.

Therefore, the current concrete persistence target is a simulation/world-state snapshot. It is useful for verifying the application-state commit contract, but it is not an Android system/device control boundary and does not establish constitutional commissioning. This review has not identified a separate deployed Android or physical-effect target in the protected-transition call path.

## M1 Android source located (2026-10-12)

The isolated client exists at `NEXO_NCS/M1_ANDROID/`. Its source uses application ID `org.nexo.m1`, version `0.2.0-prototype`, native local inference, a pinned model SHA-256, and an Android manifest without `INTERNET`. The build workflow `.github/workflows/nexo-m1-android-build.yml` checks the native source pin and packaged permissions and uploads an APK plus evidence. This source is not connected to Genesis, `executeProtectedTransition()`, or `effectBoundary.prepare`; it is a text-only inference/presentation client, not a protected authority or device-control boundary.

This corrects the source-location finding only. No current workflow pass, artifact-to-installed-APK match, or Moto G52 runtime behavior has been verified. The installed package was previously identified as `org.nexo.m1.safetest18`, which differs from this source's application ID. The M1 README was updated to reflect the current source and this evidence limit; no app code, APK, phone state, Constitution, or authority artifact was changed.

## Historical MASTER reconciliation (bounded, 2026-10-12)

The canonical MASTER's bootstrap section gives a conceptual Genesis Trust Bundle containing Constitution hash, trust anchors, recovery authorities, policy/reference hashes, admitted artifacts/dependencies, platform measurements, initial epoch, and approval evidence. It sketches the chain:

`HARDWARE/PLATFORM ROOT → VERIFIED BOOT → MEASURED BOOT → BOOTSTRAP RUNTIME → CONSTITUTION → POLICY/REFERENCES → GATE/PEP → IDENTITY → NEXO → CAPABILITIES`

It also says Genesis activation requires an external/independent authority or threshold according to deployment. This supports the provisional reading that bootstrap needs an independently grounded trust/evidence basis outside cognition, but it does **not** select a concrete root, verifier, threshold, platform, or approval mechanism. The hardware/platform-root chain is a deployment-dependent conceptual path, not evidence that the current Android phone or M1 supplies verified/measured boot for Nexo.

The historical MASTER labels PG-005 (Verifier/Policy/Reference Integrity) and PG-006 (Bootstrap / First Trust) “closed architecturally.” Read together with its explicit “NOT implemented/TLC-verified” notes and the current source evidence, this means the semantic research direction was consolidated; it does not mean a deployable trust path or runtime enforcement was established. No historical text found in this bounded review resolves the actual verifier's provenance or names the active-Constitution state owner.

## External standards cross-check — trust roles vs constitutional authority (2026-10-12)

This bounded research cross-check used the IETF RATS architecture (RFC 9334), the current TUF specification, Android Verified Boot documentation, and NIST SP 800-193:

- **RATS (RFC 9334):** an Attester produces Evidence; a Verifier appraises it using Reference Values/Endorsements and an appraisal policy; a Relying Party separately appraises the Attestation Result for its own decision. The verifier's result supports a decision but does not automatically supply the relying party's authorization policy or governance legitimacy. Source: https://www.rfc-editor.org/rfc/rfc9334.html
- **TUF:** root metadata delegates trust to named roles and thresholds; clients must begin with a trusted root and validate root rotation through continuity from the previously trusted version. It provides robust update/rollback/freeze defenses within that trust model, but does not establish who legitimately chose the first root. Sources: https://theupdateframework.github.io/specification/v1.0.36/ and https://theupdateframework.io/docs/metadata/
- **Android Verified Boot:** verified boot can establish a chain from a platform root to the Android images protected by that boot process. The evidence is scoped to that platform chain; it does not by itself prove that Nexo's Constitution was owner-approved, that a Nexo verifier/appraisal policy is legitimate, or that a Nexo protected-effect path is mediated. The current repository does not show Nexo consuming authenticated platform attestation to establish Genesis. Source: https://source.android.com/docs/security/features/verifiedboot/verified-boot
- **NIST SP 800-193:** platform resiliency separates protection, detection, and recovery mechanisms; these mechanisms are not interchangeable. Recovery capability does not automatically confer constitutional succession authority. Source: https://csrc.nist.gov/pubs/sp/800/193/final

### Consequence for STEP 7

No protocol, hash, signature threshold, attestation result, secure-storage flag, or boot measurement can derive the legitimacy of its own initial trust configuration without an already accepted trust assumption. The missing item is not another cryptographic primitive: it is an explicit, bounded decision about the independently recognized initial reference and the deployment boundary that will consume it.

For Nexo, keep four predicates independent:
1. **Owner intent:** the owner reviewed and approved exact constitutional bytes/rendering, version, and scope through a recognized reference channel.
2. **Verifier trust:** the verifier implementation, appraisal policy, reference data, and provenance are grounded independently of the candidate Constitution being verified.
3. **Canonical currentness:** a named Core-owned state owner and transition rule establish which Constitution is active, including revocation, rollback, conflict, recovery, and succession.
4. **Enforcement:** every protected decision/effect that relies on that state passes through a demonstrated final boundary, with bypass closure tested.

Passing one predicate must not imply another. A human comparison can support predicate 1 only under its stated recognition assumption. Android boot evidence, if later authenticated and integrated, may support a narrowly scoped platform-integrity claim; it cannot replace predicates 1, 2, 3, or 4.

**Engineering disposition:** keep implementation STOP until both (a) the concrete recognized reference/owner-approval channel and (b) the actual target deployment boundary are identified. These are different choices. Do not choose a phone, M1, manufacturer root, key, threshold, or simulated persistence target by inference. No code or protected state is authorized by this research.

## Current proof boundary

Verified in this review:
- The contracts for Genesis Trust Foundation, bootstrap composition, and Core Constitution Authority Context exist as design candidates.
- The generic protected-transition composition and injected authority-gate port exist in source.
- A missing authority-gate implementation fails closed in the focused test; CI reported PASS for the focused protected-transition workflow after the test addition.
- The final-semantic-validator fixtures were aligned to the current typed PolicyContext contract; CI reported PASS for that focused test after the fixture update.

Not verified:
- Any independently recognized Genesis root or deployed Genesis verifier.
- Any production consumer/composition connecting Genesis → active Constitution Authority Context → trusted AuthorityGate.
- A protected owner approval bound to exact constitutional bytes/rendering and commissioning scope.
- A last protected effect boundary, complete mediation, bypass closure, Android/device deployment, or constitutional activation.

## Architectural decision

Do not add a wrapper, root registry, alternate authority constructor, self-generated key/hash, or caller-provided `AUTHORIZED` value to fill these gaps. That would move or disguise the missing root instead of solving it.

Continue safe work by treating the gaps as separate proof obligations. Before implementation of a new authority mechanism, identify an existing concrete consumer and its intended protected effect target; otherwise keep the item as UNKNOWN rather than inventing a new abstraction.

## Next bounded action (reconciled 2026-10-12)

The immediate Step 7 blocker is not M1 build provenance. The M1 source inspected here is a text-only inference/presentation client and is not connected to Genesis, the protected-transition path, or a final effect boundary; proving which APK is installed would not establish the Genesis trust basis, verifier provenance, active-Constitution state owner, or bypass closure.

Continue from the existing Genesis and human-comparison contracts without creating another abstraction:
1. Keep separate the claims that (a) Kevin's intent was conveyed for exact content/scope, (b) the verifier and its appraisal policy are independently trustworthy, (c) the Constitution is current and canonically active, and (d) the final protected boundary enforces that state.
2. Use the bounded human-comparison candidate only for claim (a), under its explicit recognition assumption. No concrete reference channel or owner-approved canonical Constitution is currently evidenced, so this claim cannot yet be operationally exercised.
3. Do not implement or wire a mechanism until the concrete reference/target boundary and its claim are identified. If a later Step 7 test specifically requires M1 as a presentation channel, use M1 only for that scoped test and do not treat it as the trust root or enforcement boundary.
4. Do not rerun frozen AB/TLC/Kafka/P112 investigations or resume unrelated M1 provenance work without a concrete Step 7 dependency.

## Disposition

Step 7 safe engineering continues. Genesis Trust Foundation = UNKNOWN. Core Constitution Authority Context = NOT ESTABLISHED. Legitimate AuthorityGate composition = NOT ESTABLISHED. Final protected effect boundary = UNKNOWN. Protected constitutional commissioning = STOP.
