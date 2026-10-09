# NCS — AB104 duplicate, lineage, and stale-gap audit delta
Date: 2026-10-09
Branch: `ncs-clean-architecture`
Scope: evidence-level reconciliation of selected AB104.600–711 historical audit claims against actual file content and Git ancestry. Research-only; no implementation or execution.

## Why this pass
The historic inventory records 851 AB104-numbered paths, 654 unique numeric identifiers, 89 numeric gaps, and 185 duplicate-number groups through AB104.744. These are paths/evidence bundles, not 851 independent research steps. Filename sequence and a prior audit summary are not sufficient; compare exact artifact content, commit ancestry, and later corrections.

## Finding A — AB104.679 identity conflict: downstream contract selects one variant, but the old reconciliation overstates explicitness

### Exact ancestry
- Earlier artifact `NEXO_AB104_679_EFFECT_IDENTITY_2026-09-27.md`: commit `7fe68527f7d0d1ba9ee37cc734b802bcdc37777b`.
- Alternate artifact `NEXO_AB104_679_UNIQUE_EFFECT_IDENTITY_2026-09-27.md`: commit `c2948374a7e256a1e70043a19eabdff53db42d41`, whose parent is the earlier commit above.
- AB104.680 header encoding: commit `fcf411ab019f931c3cdfc68e6825e3fa0443a9c1`, whose parent is the alternate AB104.679 commit.

### Content comparison
- Earlier .679 freezes key = effectId, value = effectId, and a `nexo-effect-id` header carrying UTF-8(effectId); verifier requires the full identity conjunction.
- Alternate .679 changes value to `effectId + "|payload"` and says the header is not required.
- Descendant .680 freezes UTF-8 header encoding and requires key = effectId, value = effectId, and exact header identity.
- .690 and .691 reinforce raw-byte comparison, exact key/value/header agreement, and exactly one identity header; .681 says producer retries preserve the encoded record identity.

### Classification
- 🟢 RECOVERED: the descendant .680–.691 verifier contract is consistent with the earlier .679 artifact, not with the alternate .679 payload/header-optional formulation.
- 🔵 EXTENSION / DOCUMENTARY GAP: the operational semantic choice is inferable from the descendant chain, but the existing `AB104.706_711_RECONCILIATION` sentence “AB104.679 resolution is supported by downstream AB104.680-691” does not explicitly name the rejected alternate or record a formal supersession. Treat the alternate file as preserved historical conflicting specification superseded by the downstream frozen contract; do not merge its `|payload` format into the verifier.
- No implementation/execution/broker durability/Nexo correctness is established by these research files.

## Finding B — AB104.697 is persisted; old “unsaved gap” statement is stale/incorrect for the inspected repository

- The current `main` tree contains `docs/nexo/NEXO_AB104_697_END_OFFSET_BOUNDARY_2026-09-27.md`.
- Its file commit is `14bb73b747261076839a61ba2eb993a2c74e714c`, dated 2026-09-27T22:35:26Z, with parent `bd3c485814591c08c722647b4f1345c638d86d8e`.
- Its content explicitly defines `endOffsets()` as diagnostic-only, forbids using a sampled end offset as an absence cutoff, and keeps `NOT_OBSERVED` dependent on successful reads through the fixed deadline.
- Two older reconciliation reports (`NEXO_AB104_600_711_DUPLICATE_RECONCILIATION` and `NEXO_CONTINUITY_AUDIT_AB104_600_711`) claim .697 had no persisted artifact. The current tree and exact commit contradict that statement.

Classification:
- 🟢 RECOVERED: AB104.697 persisted artifact and commit ancestry verified.
- 🔴 CONFLICT: historical reconciliation's claim that .697 is unsaved is contradicted by the artifact and commit. Preserve the historical report but correct the current ledger via this additive audit; do not edit old reports or treat .697 as missing.
- AB104.688 remains not found as a named persisted artifact in the inspected current tree/search. Its absence in this scope is UNKNOWN/PENDING, not proof it never existed or was never discussed.

## Finding C — AB104.711 lifecycle variants are complementary, and .712 explicitly preserves the distinction

- The two .711 artifacts are on a direct commit chain: earlier `dafc39549dc4982bc780587c40ea1b1d1a170abb`; later `68feba7e4759cf233ec955169837269a552913f9`.
- Earlier state: `LOG_TRUNCATION_UNRESOLVED` after a valid observation epoch begins and continuity is disrupted.
- Later state: `SETUP_POSITION_INVALID` when the intended starting coordinate cannot be established before observation.
- AB104.712 (`13744cc0e8bae58c610ccc11056a967932c3236c`) explicitly retains both and says neither becomes `NOT_OBSERVED` automatically.
- Classification: 🟢 RECOVERED/RECONCILED at research-contract level. Keep both states; do not collapse them into generic absence. Source-researched only; not implemented/executed.

## Finding D — Other duplicates in this range must retain their existing roles
- .666: refinement/rewording; preserve both, later formulation is refinement.
- .692: terminal-duplicate formulation adds caveats; preserve both. First exact identity match is terminal PRESENT; this does not establish exactly-once.
- .706: refinement, not conflict; later version makes explicit that `position()` is a broker interaction and fixes the setup timing boundary.
- .601 supporting research is not automatically a second canonical .601 step.
These findings do not justify rerunning the frozen AB105/TLC/Kafka probes.

## Reconciled state after this pass
- Duplicate-number group count does not itself mean the research is contradictory or missing; classify each group by content and ancestry.
- One real documentary flaw was found: AB104.679's downstream choice is implicit rather than explicitly superseding the alternate contract.
- One false historical gap was found: AB104.697 exists and is persisted.
- One true bounded gap remains: AB104.688 is not found in the inspected current repository scope; keep UNKNOWN/PENDING.
- AB104.711's two states are preserved by .712.
- All research remains NOT_IMPLEMENTED / NOT_EXECUTED unless independent runtime evidence says otherwise.

## Next action
Perform a bounded reconciliation of the remaining AB104.600–711 inventory against current tree + exact path commit history, concentrating on every claim labelled UNSAVED/UNKNOWN and every duplicate whose “resolved” status is only asserted by a summary. Do not repeat the already-resolved .706/.711 or .692 work; use new evidence only. Then reconcile those results with the corrected AB104.759R anchor and later continuity chain before deciding any active architectural task. Keep the NCS construction STOP and all frozen no-repeat constraints.
