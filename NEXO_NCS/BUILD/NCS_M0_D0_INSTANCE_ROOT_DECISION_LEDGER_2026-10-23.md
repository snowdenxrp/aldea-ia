# NCS M0 — D0 decision ledger: instance-root configuration and bootstrap

Date: 2026-10-23  
Branch: `ncs-clean-architecture`  
Status: **DESIGN LEDGER ONLY — owner decisions remain open; no runtime/test/workflow implementation**

## 1. Purpose and evidence boundary

This ledger converts D0 into reviewable subdecisions. It does not repeat the source census, close D1/D2/D3, or treat a recommendation as accepted merely because it is technically preferred.

Canonical state remains: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; implementation authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.

### Source anchors read for this ledger

- `NEXO_NCS/STATUS.md`, blob `ba77cbfe2de82ae3203dd7e6219891b0b8596990`.
- `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`, blob `22622ad2dff1c231cad31d5c4b7d875758b08958`.
- `NEXO_NCS/BUILD/NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md`, blob `2b2e16333130e9348e6af777537fa84dfe73e3e7`.
- `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md`, blob `55573c52533cb9202187588c04a97cecd9b16b99`.
- Existing caller reconciliation and D1 graph-gap specifications referenced by STATUS. Their inventories remain evidence of the source snapshot reviewed, not proof of a fully closed transitive graph.

## 2. D0 decision ledger

Status labels:
- **FIXED FACT** — directly observed in the source snapshot; not a design approval.
- **ACCEPTED DIRECTION** — owner accepted the high-level single-instance-root direction only.
- **PROPOSAL / OPEN** — recommended contract; owner has not approved the subdecision.
- **DEPENDENT** — cannot close until another contract or evidence exists.

| ID | Decision boundary | Current source evidence | Recommended rule (proposal only) | Failure if unresolved | Required acceptance evidence | Status |
|---|---|---|---|---|---|---|
| D0-01 | Root as architectural direction | Existing contract/reconciliation records Option A as the direction: one root for Continuity/Chronicle paths and cooperative admission; root is not identity/authority. | Preserve this scope; do not turn root/lock into constitutional authority or permission to execute effects. | Persistence coordination could be misrepresented as ownership or commissioning. | All D0-D3 documents retain the authority separation; tests preserve the protected-effect exclusion gate. | **ACCEPTED DIRECTION** |
| D0-02 | Public CLI configuration | Current `scripts/nexo.mjs` and Chronicle child accept separate legacy path arguments; current CLI does not provide `--root`. | Propose one explicit `--root` for instance-mode commands; reject duplicate/conflicting configuration before store I/O. | Different commands/processes may address different stores or bypass root admission. | CLI truth table for missing, repeated, malformed, and conflicting options; assert no store access or filesystem mutation on parse/config errors. | **PROPOSAL / OPEN** |
| D0-03 | Public application API | Existing application/query/store boundaries are path-oriented; low-level factories accept paths. | Public instance API receives one validated instance context; derived store paths are not caller-supplied. Keep low-level factories for isolated tests/composition only if D1 can prove production callers cannot bypass the instance boundary. | A CLI-only lock leaves direct application/factory callers uncoordinated. | API contract plus D1 allowlist/graph; negative tests for direct production bypass and forged caller context. | **PROPOSAL / DEPENDENT ON D1** |
| D0-04 | Environment-variable support and precedence | Current assistants flow uses independent `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH`, `NEXO_CONTINUITY_PATH`; this is a composite integration, not the Nexo-only CLI contract. The root proposal recommends no root env override in first migration. | Do not support a root environment override initially. If added later, resolve it at one boundary with a documented conflict rule; never silently prefer CLI, env, or child inheritance. Do not move Lúmina/world-state paths into Nexo root. | Parent/child or composite commands can silently select different roots; accidental cross-domain migration/atomicity claims. | Config precedence table; conflict tests; separate disposition for `assistants`; proof that Lúmina/world-state remain outside the Nexo root in this phase. | **PROPOSAL / OPEN** |
| D0-05 | Missing root and bootstrap | Existing owner/store code can read and, under allowed paths, initialize Continuity; opening the owner is not inherently read-only. | Normal operations require an existing directory. Bootstrap/initialization is a distinct explicit operation; status/query/preview must not create roots or stores. | Typo and missing data can be silently converted into a new empty instance; previews can mutate state. | Missing-root, file-as-root, missing-store, bootstrap-authorized and read-only-zero-mutation fixtures; record all filesystem changes. | **PROPOSAL / OPEN** |
| D0-06 | Canonicalization and aliases | Lexical normalization alone does not establish that aliases name the same directory. Current stores do not claim resistance to hostile symlink/path races. | For a cooperating local-filesystem model, require an existing root and canonicalize with `realpath` before deriving fixed paths. Define root symlink policy and reject ambiguous reserved store/lock paths. Do not claim protection against TOCTOU, hard-link/bind-mount aliases, hostile local processes, or network-filesystem semantics. | Two paths may produce separate locks for shared data, or reserved paths may redirect outside the intended root. | Fixtures for root symlink to same target, broken symlink, file as root, store/lock symlink, destination outside root, reserved-name file/directory conflicts; documented exclusions for untested alias classes. | **PROPOSAL / OPEN** |
| D0-07 | Canonical layout and collisions | Proposed names are `continuity.json`, `chronicle.json`, and a candidate root-lock directory; the lock name remains illustrative, not implemented. Existing installations may store data elsewhere. | Derive fixed filenames only after root validation. Before adopting names, inventory existing files and fail on conflicts; do not add an instance ID/manifest/marker without a demonstrated need. | Silent overwrite, competing sources of truth, or a second identity mechanism. | Layout table; collision matrix; tests prove no overwrite/rewrite during validation; migration inventory for each existing installation. | **PROPOSAL / OPEN** |
| D0-08 | Legacy `--continuity` / `--chronicle` compatibility | Existing entrypoint tests and callers rely on path-oriented options; parent delegates Chronicle append to a directly executable child. | No silent fallback and no mixed root+legacy arguments. A temporary adapter is acceptable only if it proves both legacy paths are exactly the canonical paths derived from one root; otherwise return a structured error. Whether to retain such an adapter remains open. | Legacy mode becomes a parallel persistence path that bypasses admission; abrupt removal can break documented CLI behavior. | Consumer inventory; compatibility matrix; tests for root-only, legacy-only, mixed, conflicting, direct-child and parent-child paths; migration/deprecation decision. | **PROPOSAL / OPEN** |
| D0-09 | Configuration validation side effects | Existing owner opening and store creation/initialization can do more than parse configuration. | Complete config/root validation before any store load, initialization, migration, temp cleanup or write. | Invalid configuration may still mutate or materialize state. | Instrumented negative tests showing zero store calls and zero filesystem mutations for every invalid-config fixture. | **PROPOSAL / DEPENDENT ON D1/D2** |
| D0-10 | Error contract for configuration | Existing business result shapes vary across query, append and owner APIs; root-admission result codes are not finalized. | Define stable config/root errors separately from business outcomes; unknown/ambiguous path state fails closed and is never mapped to success/empty state. | Callers may misread invalid root as missing data, successful empty query, or a business failure eligible for retry. | Consumer audit of result contracts, mapping table, CLI exit/result compatibility tests, no silent retry/fallback. | **PROPOSAL / DEPENDENT ON D2** |
| D0-11 | Data already outside the canonical root | The source inventory shows independent paths and legacy-memory import can exist; no universal canonical-root installation is proven. | No automatic move, merge, dual-write or deletion. Per-installation migration must inventory source/destination, preserve source, verify copied bytes/revisions, and use explicit cutover/rollback. | Data loss, divergent histories, provenance loss, or an unintended empty instance. | Dry-run manifest with source/destination and hashes; copy verification; interruption tests; rollback procedure; explicit cutover approval. | **PROPOSAL / DEPENDENT ON D3** |

## 3. Dependencies and closure order

D0 cannot be declared closed from prose alone. The recommended order is:

1. Resolve D0-02 through D0-08 as a coherent configuration contract; do not pick CLI, API, env, legacy, or symlink rules independently if they conflict.
2. Specify D0-09/D0-10 error and no-side-effect behavior against actual result consumers.
3. Reconcile the resulting public boundary with D1-DESIGN: production entrypoint manifest, caller graph, path-based factory restriction, and UNKNOWN/BLOCKED rules.
4. Only after D1-DESIGN is frozen, specify D2 admission ownership, operation scope, process-child ownership, timeout and release uncertainty.
5. Specify D3 migration/cutover/rollback and test interruptions.
6. Run cross-contract consistency review. Then request explicit implementation authorization as a separate gate.
7. After authorization, implement in a coherent unit and run tests/CI against the exact code+test SHA. Record trigger, run, job, SHA, raw artifact/log, and interpretation.

The order above is a recommendation, not an owner decision.

## 4. Explicit non-goals

- This root is a persistence locator, not the legitimate owner root, identity, key provisioning, constitutional authority or commissioning.
- Root admission does not authorize repair, dispatch, settlement or protected effects. Preserve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`.
- No guarantee of exact aggregate heap, total disk quota, hostile-process resistance, fsync durability, or network-filesystem correctness is inferred.
- No new queues, IDs, leases, retries, tombstones, transaction wrappers or parallel stores are introduced by this design ledger.
- The existing caller census is not repeated here and must not be represented as a complete transitive no-bypass proof.
- No runtime, tests, workflows, data stores or CLI were changed or executed as part of preparing this ledger.

## 5. Continuation instruction

Next work: reconcile this ledger against the latest root contract and D1 caller artifacts, then identify any D0 contradiction or missing consumer evidence. Do not re-run the already documented census absent a changed source snapshot. Do not mark any proposal accepted on the owner's behalf. Keep STATUS and the master handoff aligned with the actual repository commits and evidence.

Canonical status remains: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; implementation authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
