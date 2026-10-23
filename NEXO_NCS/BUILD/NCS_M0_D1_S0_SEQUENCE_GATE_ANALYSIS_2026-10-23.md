# NCS M0 — D1-S0 sequencing gate: design closure versus implementation proof

Date: 2026-10-23  
Branch: `ncs-clean-architecture`  
Status: **DECISION ANALYSIS — OWNER DECISION NOT RECORDED; NO IMPLEMENTATION AUTHORIZATION**

## 1. Why this gate exists

The root contract and D1 design artifacts contain a real sequencing cycle:

- Rule A: D1 is not closed until the architecture/no-bypass test exists and passes.
- Rule B: do not modify tests/runtime/workflows until D0/D1/D2/D3 design is closed.

If both are applied literally, D1 cannot be closed and implementation cannot begin. The root contract already proposes distinguishing design closure from implementation proof. This note evaluates that distinction and its acceptance boundary; it does not decide for the owner.

## 2. Options

### Option 1 — Split D1 into D1-DESIGN and D1-IMPLEMENTATION (recommended)

**D1-DESIGN** closes only when the exact source snapshot has:
1. A reproducible entrypoint manifest from package scripts, workflows, executable guards and child-process launch sites.
2. Caller/factory/owner/store-access classification with no unexplained production caller.
3. Explicit production/test/helper allowlists and disposition of `assistants`, `simulate`, legacy exports and direct child invocation.
4. A specified graph algorithm, resolver policy and negative fixtures.
5. A fail-closed rule: unresolved import, computed/dynamic load, unknown caller or ambiguous process edge is `UNKNOWN/BLOCKED`, not allowed.
6. Cross-reference consistency with the D0/D2/D3 design contracts.

D1-DESIGN does **not** assert that runtime admission exists, that the graph test passes, or that the system is safe to commission.

**D1-IMPLEMENTATION** remains open until the architecture test and necessary runtime changes are implemented under explicit authorization, tests are run, negative fixtures demonstrate expected failures, and CI evidence is tied to the exact combined code+test SHA.

Advantages: removes the logical cycle; preserves a clear separation between specified design and executable proof; prevents an unimplemented test from being described as PASS.

Costs/risks: requires precise naming/status discipline so a reader does not mistake design closure for operational closure.

### Option 2 — Keep D1 as a single gate

Under this option, D1 stays open until its test is implemented and passes. To make progress, the owner must explicitly amend the prohibition on changing tests before D0/D1/D2/D3 design closure, authorizing a narrowly scoped test-only change earlier.

Advantages: one D1 status label.

Costs/risks: sequencing authorization becomes entangled with design closure; test assumptions may encode a D2/D3 contract that later changes; a test-only commit could be mistaken for authorization to modify runtime. A strict change manifest and prohibition on runtime changes would be necessary.

### Option 3 — Close D1 from documents alone, without a separate implementation status

Not recommended. This would blur a specified graph with an executed graph test and risk presenting unproven no-bypass behavior as established.

## 3. Recommendation

Adopt Option 1 as the process model, **subject to explicit owner confirmation**. It is the cleanest way to retain both constraints: no runtime/test changes before contracts are designed, and no security claim until executable proof exists.

Recommended status vocabulary:

- `D1-DESIGN: OPEN` until all six criteria in Option 1 are evidenced.
- `D1-DESIGN: CLOSED` only after the criteria are reviewed against an exact source snapshot and remaining edges are not UNKNOWN.
- `D1-IMPLEMENTATION: NOT_STARTED` before implementation authorization.
- `D1-IMPLEMENTATION: IN_PROGRESS` only after a separately recorded authorization and bounded change scope.
- `D1-IMPLEMENTATION: VERIFIED` only after test/CI evidence tied to the exact code+test SHA; any unresolved graph edge or failing negative fixture prevents this state.

This vocabulary is proposed; it does not replace the current canonical status before owner approval.

## 4. Implementation boundary if Option 1 is accepted

Acceptance of the process model would authorize only the **sequencing distinction**, not implementation. A later separate authorization must specify the allowed change scope, such as:
- architecture test and its fixtures;
- runtime/API/CLI/root-admission implementation;
- package test chain and CI workflows;
- whether these are one coherent implementation unit or staged commits.

Do not infer permission to modify any of these from the phrase “continúa sin límites” or from closure of a design gate. No protected effects, repair, dispatch, settlement, or owner-authority claims are enabled by D1.

## 5. Evidence needed to close D1-DESIGN

Before design closure, reconcile the exact source snapshot and current artifacts for:
- entrypoint manifest and caller ledger;
- direct/indirect store factories and owner exports;
- unresolved external callers of `scripts/nexo-continuity.mjs`;
- `assistants` and `simulate` disposition;
- child Chronicle admission ownership;
- import/re-export/dynamic-load resolver policy;
- negative fixture list and expected failure codes;
- relationship to D0 config, D2 admission/lock/release, and D3 migration/rollback.

Do not rerun the full source census without a changed source snapshot. Resolve the recorded UNKNOWN caller through a targeted callsite search or retain it as UNKNOWN/BLOCKED if the evidence is insufficient.

## 6. Decision record

- Option 1: **RECOMMENDED; NOT YET ACCEPTED BY OWNER**.
- Option 2: available only if the owner explicitly changes the sequence constraint.
- Option 3: rejected as an evidence discipline because it conflates design with proof.
- Runtime/tests/workflows/CLI/stores: unchanged in this review.
- Tests/CI: not executed.
- Implementation authorization: `NOT_EVALUATED`.

Canonical state remains M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
