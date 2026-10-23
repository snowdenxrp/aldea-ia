# NCS M0 — reconciliación D0 ↔ D1 design artifacts

Date: 2026-10-23  
Branch: `ncs-clean-architecture`  
Status: **DOCUMENTARY CROSS-CHECK — NO DESIGN GATE CLOSED**

## 1. Exact artifacts checked

The current branch versions were fetched and compared at this checkpoint:

- D0 ledger: `NEXO_NCS/BUILD/NCS_M0_D0_INSTANCE_ROOT_DECISION_LEDGER_2026-10-23.md`, commit `013dfe3f6c72c0012a190b86590688bb3dd05614`.
- Root contract: `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`, blob `22622ad2dff1c231cad31d5c4b7d875758b08958`.
- D1 caller reconciliation: `NEXO_NCS/BUILD/NCS_M0_D1_CALLER_RECONCILIATION_AND_LOCK_SCOPE_2026-10-23.md`, blob `7acc59df7fe5399c31e124ae32760186dc0ca66a`.
- D1 caller ledger: `NEXO_NCS/BUILD/NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md`, blob `383adfa2d3230233bb2add71a4b4b1b3fec7ac68`.
- D1 static graph gap: `NEXO_NCS/BUILD/NCS_M0_D1_STATIC_GRAPH_TEST_GAP_AND_IMPLEMENTATION_PLAN_2026-10-23.md`, blob `c2b415fb3f3fcf7a5eb88a10ee0338857ef35af6`.
- Decision-boundary reconciliation: `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md`, blob `55573c52533cb9202187588c04a97cecd9b16b99`.

## 2. Cross-check results

| Contract point | D0 ledger | D1 evidence | Result |
|---|---|---|---|
| Root is a persistence locator, not authority | D0-01 and non-goals | D1 artifacts retain legitimate root `PENDING/UNKNOWN` and protected effects `STOP` | Consistent |
| Single explicit root; no silent mixed configuration | D0-02, D0-04, D0-08 | Current CLI accepts legacy paths; D1 fixtures explicitly require missing-root, direct-child and root+legacy conflict coverage | Consistent; unimplemented |
| Root must exist; bootstrap is separate | D0-05 | Owner opening may initialize/import legacy state; D1 classifies owner/service as a bootstrap-sensitive boundary | Consistent; exact bootstrap contract open |
| Canonicalization and symlink limits | D0-06 | D1 reconciliation explicitly notes realpath does not resolve hard-link/mount identity and excludes hostile local filesystem behavior | Consistent; test matrix still required |
| Queries/previews require admission if canonical snapshots are covered | D0-09 and dependency notes | D1 caller ledger says path-based queries materialize snapshots and need admission under the stronger aggregate snapshot guarantee | Consistent; D2 must freeze exact scope |
| `assistants` and `simulate` are not ordinary root aliases | D0-04, D0-08 and non-goals | D1 artifacts identify cross-domain persistence, incidental owner opening and no proven multi-file atomicity | Consistent; disposition remains proposal/open |
| Chronicle child is its own boundary | D0-02, D0-08 | D1 artifacts require direct-child coverage and prohibit parent/child double acquisition | Consistent; D2 owner/lock protocol open |
| Unknown graph edges fail closed | D0-03 and dependency notes | D1 artifacts explicitly require unresolved/dynamic/computed edges to be `UNKNOWN/BLOCKED` | Consistent; graph test not implemented |
| Migration does not silently move/merge data | D0-07, D0-11 | Root contract/D1 artifacts require inventory, source preservation, dry-run, verification and explicit cutover | Consistent; D3 open |

## 3. Actual evidence caveats

1. No material D0↔D1 rule contradiction was found in this document-level cross-check. This means the written proposals align; it does **not** mean the rules are accepted, implemented, or tested.
2. The D1 caller reconciliation cites an earlier root-contract blob `1d82f04f67b5ed15a6823cc23051ec59c43629a5`. The current fetched contract is `22622ad2dff1c231cad31d5c4b7d875758b08958`; use the latter as the current contract anchor. The old SHA is historical evidence, not a current-file identifier.
3. The D1 caller ledger labels `scripts/nexo-continuity.mjs` external callers as UNKNOWN pending complete callsite search. This remains an unresolved classification, not a contradiction and not evidence that no callers exist.
4. The existing `tests/nexo/entrypoint.test.mjs` remains a partial import-isolation/CLI guard. The D1 static graph/no-bypass test is specified but not implemented or executed.
5. `assistants` and `simulate` are still design dispositions, not verified runtime blocks from this D0 work. Repair remains separately blocked by `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`.

## 4. Outcome and next dependency

- Cross-document proposal consistency: **DOCUMENTED / NO CONTRADICTION FOUND**.
- D0 detailed contract: **OPEN**.
- D1-DESIGN caller completeness and sequencing decision: **OPEN**.
- D2 admission/lock/child/release contract: **OPEN**.
- D3 migration/rollback: **OPEN**.
- Implementation authorization: **NOT_EVALUATED**.
- Runtime/tests/workflows/CLI/stores: **unchanged**; no tests or CI executed during this cross-check.

Next step is not another source census. It is to resolve the remaining D0 owner decisions and the D1-S0 sequencing gate, then finalize D2 and D3 contracts against this exact evidence set. Any implementation remains a separate explicit authorization gate.

Canonical state: M0 `INCOMPLETO`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
