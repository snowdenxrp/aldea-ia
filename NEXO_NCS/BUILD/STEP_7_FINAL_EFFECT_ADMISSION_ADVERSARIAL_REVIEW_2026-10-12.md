# NCS STEP 7 — Adversarial Review of Final-Effect Admission and Revocation
Date: 2026-10-12
Branch: `ncs-clean-architecture`
Status: DESIGN REVIEW — NO IMPLEMENTATION AUTHORIZED — COMMISSIONING STOP

## 1. Review target and method

This review attacks the current design contract:
`NEXO_NCS/BUILD/STEP_7_FINAL_EFFECT_ADMISSION_REVOCATION_LINEARIZATION_CONTRACT_2026-10-12.md`.

It reuses, rather than repeats, the semantic research in:
- `docs/nexo/AB104.369_AUTHORITY_CAS_ATOMIC_FRONTIER_2026-09-26.md`;
- `docs/nexo/AB104.370_AUTHORITY_CHANGE_TIMELINE_2026-09-26.md`;
- `docs/nexo/NEXO_LINEARIZATION_PROTOCOL_OPTIONS_IMPLEMENTABILITY_GATE_V1_2026-09-24.md`.

The current code remains the evidence target:
- `src/nexo/core/protected-transition.mjs`;
- `src/nexo/adapters/conditional-commit-persist-state.mjs`;
- `scripts/simulate.mjs`.

This is a source/design review. No tests were run and no runtime behavior was changed.

## 2. Review result

The core invariant survives: authority currentness and protected-effect admission need a real, identifiable ordering point. However, the phrase “revocation linearizes before effect admission” is only meaningful after the architecture names **where revocation becomes effective**, and how that fact is enforced at every sink.

A central generation value alone does not prove that a disconnected or stale-cache sink has stopped accepting an older generation. A revocation write at the authority owner and an admission at a separate sink are two events unless a mechanism gives them a defined order.

## 3. Adversarial cases

### A1 — Revocation committed centrally; fence update delayed

1. The authority owner changes generation from G to G+1 and records revocation.
2. The update to sink S is delayed or lost.
3. S still believes G is current and accepts an operation carrying G.

If the system reports global revocation as already enforced at step 1, the guarantee is false.

Required disposition:
- Either S checks the authoritative generation as part of its own atomic admission;
- or the protocol does not report the revocation as enforced for S until S has acknowledged an enforceable barrier/fence;
- or the capability/route to S is independently disabled under a documented, enforceable protocol.

Until then, report revocation as REQUESTED/PENDING or UNKNOWN, not globally ENFORCED. If the architecture cannot prevent stale acceptance, this effect class cannot claim revocation-enforced safety.

### A2 — Multiple sinks, one unavailable

Suppose S1 and S2 accept the same class of protected effect. S1 acknowledges the new fence; S2 is offline.

A global “STOP enforced” result is not justified merely because S1 acknowledged. The system must either:
- track enforcement per sink and retain global UNKNOWN/STOP while S2 remains reachable with stale authority; or
- prove that S2's authority/capability/route is independently disabled; or
- prove the architecture has only one exclusive sink and that no alternate path can reach the target.

A sink inventory is therefore part of the revocation contract, not only a deployment checklist. Unknown sinks prevent a complete-mediation claim.

### A3 — Sink admission races the revocation acknowledgement

The authority owner may begin revocation while a sink request is already in flight. A client-side STOP flag or local cancellation does not establish whether the sink accepted the request first.

The result must be ordered by the actual enforceable admission/revocation protocol:
- admission linearizes first: record that the effect was admitted before revocation; revocation blocks later admissions and the in-flight result is reconciled;
- revocation barrier linearizes first: stale admission is rejected;
- order or outcome cannot be established: UNKNOWN.

Do not reinterpret a lost response, timeout, or cancelled client task as proof that the effect was not accepted.

### A4 — Scope or policy changes without generation change

If an authority-relevant scope, policy, dependency, target identity, or revocation state can change while G stays constant, a generation-only check is insufficient.

The contract must require one of:
- every authority-relevant change advances the authoritative generation; or
- the final admission predicate compares the exact relevant version/hash/scope set atomically as well as G.

This rule must be owned by the canonical authority state owner. A caller-supplied epoch or a claim's copied context cannot establish it.

### A5 — Fence rollback during recovery

If the authority owner or sink restores an older snapshot and accepts a lower generation as current, a previously stale operation can become acceptable again.

The design must specify monotonicity across crash, restore, replacement, backup recovery, and owner transfer. If monotonic currentness cannot be established, the recovered system must remain UNKNOWN/STOP until the authoritative generation and sink fences are reconciled. A snapshot alone cannot restore authority.

### A6 — “Gateway” proposed as a substitute for sink fencing

A single gateway can be a candidate enforcement boundary only if it is the exclusive path to the actual target, owns or securely controls the target credentials, serializes admission against revocation, and has defined handling for ambiguous provider responses. If callers can bypass it, or another process can use the provider credential directly, the gateway is not complete mediation.

Even an exclusive gateway cannot claim that an already accepted remote effect was cancelled by a later STOP. Provider semantics and reconciliation remain necessary.

## 4. Refined invariant

For each protected sink S, define the **effective revocation point** as the point after which S is guaranteed to reject every operation whose authority context is stale under the declared contract.

Then:
1. A revocation is globally ENFORCED only if every in-scope sink is past its effective revocation point, or every remaining route/capability is independently proven disabled.
2. If any in-scope sink's state or reachability is unknown, global enforcement is UNKNOWN/STOP.
3. An effect admitted before the effective revocation point is not retroactively erased; it must be tracked and reconciled honestly.
4. A generation/fence is useful only when the sink enforces it and rollback cannot resurrect an older accepted generation.
5. The exact Constitution revision/scope and every authority-relevant policy/dependency change must be bound to the same final predicate, either through a monotonic generation rule or explicit atomic version checks.

This is a semantic requirement, not a new universal registry or wrapper. Do not implement a generic revocation coordinator before the actual sink topology and ownership are known.

## 5. Mapping to current NCS source

- `executeProtectedTransition()` performs the injected authority check before candidate execution and final semantic validation, then invokes `conditionalCommit.commit(candidate)`. It does not provide sink-level ordering against a later Constitution change.
- `createPersistStateConditionalCommit()` binds the candidate to `expectedRevision` for the supplied persistence primitive, not to the current Constitution generation or a remote sink's accepted fence.
- `scripts/simulate.mjs` uses a local directory lock, a state revision check, a temporary JSON file, and rename. This is a simulation persistence path, not evidence of multi-sink revocation enforcement or an external effect boundary.
- No actual deployed Nexo effect sink or canonical active-Constitution state owner has been identified in the reviewed branch evidence. Therefore the refined invariant cannot yet be implemented against a real target without inventing the target.

The etcd API is an illustrative primary-source example of the boundary of atomic transactions: comparisons and writes in one etcd transaction are evaluated atomically within that store. It does not make an independent remote effect part of the same transaction. Source: https://etcd.io/docs/v3.7/learning/api/

## 6. Required implementation gates after a real target is identified

Before selecting or implementing a mechanism, identify and evidence:
1. All sinks and all reachable routes to each sink.
2. The canonical authority owner and the exact event at which Constitution replacement/revocation becomes effective.
3. Whether each sink can check current authority atomically, enforce a monotonic fence, or be exclusively mediated by a serialized gateway.
4. How revocation acknowledgement is distinguished from revocation request.
5. How multiple-sink enforcement is represented when one sink is unreachable.
6. How scope/policy/dependency changes invalidate prior decisions.
7. How generation monotonicity survives restore, failover, and ownership transfer.
8. How in-flight effects and lost acknowledgements are reconciled without claiming cancellation or non-execution without evidence.
9. Tests at the actual sink for delayed propagation, disconnected sink, stale cache, rollback, direct bypass, and admission/revocation races.
10. Build/deployment evidence tying those tests to the exact target and enforcement topology.

If no sink can enforce stale-authority rejection and no exclusive mediated boundary can be proved, the safe design decision is to keep that effect class non-effectful or STOP—not to downgrade the requirement.

## 7. Disposition

- Core linearization principle: REUSED / CONSISTENT WITH AB104.369–.370.
- Effective revocation point and per-sink enforcement acknowledgement: MUST BE EXPLICIT IN ANY DEPLOYMENT CONTRACT.
- Actual target/sink topology: UNKNOWN.
- Canonical active-Constitution owner and Genesis basis: NOT ESTABLISHED.
- Production enforcement and bypass closure: UNKNOWN.
- Commissioning: OPEN / STOP / UNKNOWN.
- No code, tests, workflows, keys, Constitution artifact, APK, device, deployment, or runtime state changed in this review.
