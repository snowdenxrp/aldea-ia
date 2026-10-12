# NCS STEP 7 — Final Effect Admission, Revocation Linearization, and Fencing Contract
Date: 2026-10-12
Branch: `ncs-clean-architecture`
Status: DESIGN CONTRACT / ADVERSARIAL REVIEW REQUIRED / NO IMPLEMENTATION AUTHORIZED
Scope: Resolve the semantic gap between current Constitution authority and admission of a protected effect. This document does not select a hardware, cloud, database, or human root.

## 1. New conclusion

The remaining revocation/TOCTOU problem is not solved by adding a second `authorityGate.check()`, copying an `authorityEpoch` into a candidate, or calling `effectBoundary.prepare()` without a real enforcement owner.

The required property is **linearizable final effect admission**: the authority-currentness decision and the sink's decision to admit the effect must have a single, identifiable ordering point with Constitution activation/revocation. A token or epoch is useful only if the canonical authority owner and the actual sink enforce it; caller-supplied values are not proof.

The current `executeProtectedTransition()` checks authority before isolation/execution/validation, then calls `conditionalCommit.commit(candidate)`. The candidate does not bind a verified current-Constitution generation, and the commit adapter only supplies state-revision compare-and-set semantics. Therefore current source does not establish the property above.

## 2. Exact semantics required

Define:
- `C`: canonical current Constitution revision/digest and its scope.
- `G`: monotonic authority generation/fence owned by the canonical authority owner.
- `R`: revocation/STOP state and generation.
- `Q`: exact protected claim (operation class, target identity/incarnation, effect parameters, and claim-critical dependencies).
- `O`: stable operation identity used for duplicate recognition at the sink; not authority.
- `S`: actual effect sink/admission owner.

A final admission may be accepted only if, at the sink's enforcement point:
1. Genesis has already been independently established under the chosen threat model.
2. The current Constitution and scope are recognized from the canonical owner, not caller-provided metadata.
3. The decision is bound to the exact `Q`, `C`, `G`, target/incarnation, and relevant dependency/version set.
4. The generation is still current and not revoked at the admission linearization point.
5. The sink has not already accepted `O` with conflicting parameters; duplicate/replay semantics are explicit.
6. The sink atomically admits the effect under those checks, or rejects/returns UNKNOWN. A state-file commit elsewhere is not this sink unless it is the actual protected effect and shares the relevant atomicity boundary.

This is a semantic contract, not a proposed new universal object or module. The fields must be represented by existing owners where possible; do not create a generic registry or duplicate state merely to carry them.

## 3. Revocation ordering rule

The architecture must choose and document a precise linearization rule:

- If revocation/Constitution replacement linearizes before effect admission, the sink must reject the stale generation.
- If effect admission linearizes first, a later revocation cannot truthfully claim that the already-admitted effect never happened. It must block subsequent admissions and invoke any explicitly defined cancellation/compensation/reconciliation contract for in-flight effects.
- If the system cannot establish which event linearized first, outcome is `UNKNOWN`; do not infer denial, non-execution, or safe rollback from a timeout or lost response.
- “STOP requested” is not “STOP enforced.” A revocation record written in one store is not global enforcement unless every relevant sink checks/fences against it or an equivalent enforceable protocol exists.

This avoids the impossible promise that changing a local policy instantly cancels every remote effect, including an effect already accepted by a disconnected external service.

## 4. Why local state revision is insufficient

The current conditional-commit adapter passes `expectedRevision` and `stateRevision = expectedRevision + 1` to `persistState`. The inspected simulation persistence primitive acquires a local directory lock, reads the current state revision, writes a temporary JSON file, and renames it. This can protect a narrow local state update under its assumptions; it does not compare a Constitution generation or revoke a remote command at an external sink.

Consequently:
- `stateRevision` != Constitution revision.
- persistence lock != authority fence.
- atomic file replacement != atomic remote effect.
- `operationId`/idempotency != authorization or revocation.
- a second pre-commit authority check != linearizable final admission.
- a signed token/attestation != permission to perform every action in every scope.

Keep the existing adapter in its narrow persistence role. Do not relabel its tests as Genesis/currentness/complete-mediation evidence.

## 5. External sink feasibility gate

For each concrete effect class, determine whether the actual sink can enforce a current fence/generation at its own admission point.

| Sink capability | Allowed claim |
|---|---|
| Sink atomically checks current generation/revocation and admits effect under the same serialization boundary | May be evaluated for protected admission, subject to Genesis, scope, bypass, and evidence gates |
| Sink supports fencing token but generation authority is not independently trusted or stale tokens can still pass | Not sufficient; UNKNOWN/STOP |
| Sink supports idempotency only | Duplicate suppression only; no revocation guarantee |
| Sink is external and cannot participate in fencing/conditional admission | Do not claim revocation-enforced effects there; keep that class non-effectful/bounded or STOP |
| Sink's result is lost after request | UNKNOWN until authoritative reconciliation; do not blindly repeat non-idempotent effects |

No sink has yet been identified and demonstrated for a deployed Nexo target. Therefore this gate remains unassessed for production, not passed.

## 6. Required adversarial tests before any implementation can claim this contract

These are test obligations, not tests executed in this research pass.

1. **Revocation wins:** authorize generation G; pause before sink admission; revoke/advance to G+1; resume; sink rejects G.
2. **Admission wins:** sink admits under G; then revocation linearizes; record that admission preceded revocation, reject subsequent G operations, and reconcile any in-flight result honestly.
3. **Constitution replacement:** candidate was derived under C1; C2 becomes current before admission; C1 candidate is rejected unless a specifically governed transition says otherwise.
4. **Stale/replayed fence:** replay a prior valid decision or generation after a newer generation; sink rejects it.
5. **Target substitution:** preserve claim ID but alter target/incarnation/effect parameters; sink rejects mismatch.
6. **Duplicate operation:** repeat O with same payload and then conflicting payload; same-payload result follows defined idempotency semantics, conflicting payload is rejected/UNKNOWN.
7. **Crash/timeout ambiguity:** lose the reply after possible admission; recovery does not assert “not executed” and does not blindly duplicate the effect.
8. **Bypass:** invoke the actual sink through every reachable alternate entrypoint/capability/IPC path; unauthorized direct invocation is structurally denied.
9. **Authority-owner outage or stale cache:** no cached authorization silently overrides unknown currentness; result is UNKNOWN/STOP.
10. **Recovery/rollback:** restore an older state snapshot; it cannot lower the effective fence or resurrect a revoked generation.
11. **Sink incapable of fencing:** expected result is design rejection or explicitly restricted capability, not a simulated PASS.
12. **Build/deployment binding:** evidence is invalidated if artifact, sink, topology, credentials/capabilities, or policy owner changes outside the declared closure.

Tests must exercise the actual sink and its authority owner. Injecting `AUTHORIZED` into a Core unit test is still useful for transition semantics, but it cannot satisfy these obligations.

## 7. Architecture decision boundary (do not cross early)

Before coding, name and evidence all four:
1. The independently established Genesis basis and the threat assumptions under which it is recognized.
2. The canonical owner and serialization rule for active Constitution/revocation generation.
3. The actual target deployment, effect sink(s), and every route to them.
4. The atomicity/fencing mechanism the sink itself enforces, plus the failure/reconciliation semantics.

If any of these is absent, do not implement a ceremonial epoch, extra authority check, new registry, or generic transaction wrapper. Continue with bounded research and keep commissioning `UNKNOWN / STOP`.

## 8. Evidence and source boundaries

Reviewed branch sources:
- `src/nexo/core/protected-transition.mjs` — authority check occurs before candidate execution; final call is conditional commit.
- `src/nexo/adapters/conditional-commit-persist-state.mjs` — maps persistence revision conflicts to conditional conflict; does not check Constitution authority.
- `scripts/simulate.mjs` — local simulation state lock/revision/temp-write/rename; not demonstrated as canonical Constitution store or external effect sink.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md` — Genesis semantics remain a design candidate, not an established physical root.
- G-A14 closure research distinguishes enumerated sinks, build closure, deployment closure, enforcement, and evidence; one level never implies the next.

External architectural basis: RFC 9334 separates Attester, Verifier, and Relying Party and describes trust anchors as a prerequisite for trusting verifier results. It does not make attestation results self-authorizing: https://www.rfc-editor.org/rfc/rfc9334.html

## 9. What changed in this pass

- Re-read `NEXO_NCS/STATUS.md`, the current STEP 7 handoff, Genesis foundation contract, G-A14 closure research, `protected-transition.mjs`, `conditional-commit-persist-state.mjs`, and `scripts/simulate.mjs`.
- New result: the decisive missing contract is sink-level linearizable admission ordered against Constitution replacement/revocation—not merely “recheck authority before commit.”
- No production code, tests, workflows, keys, Constitution, APK, or runtime state changed.
- No tests were run. This document is design research only.
- Overall status remains OPEN / STOP / UNKNOWN.
