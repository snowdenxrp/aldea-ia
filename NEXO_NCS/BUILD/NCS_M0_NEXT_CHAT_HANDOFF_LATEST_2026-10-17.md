# NCS M0 — latest continuation handoff

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Latest increment: M0.35 — reject duplicate required evidence IDs

Record: [M0.35 — Reject duplicate required evidence identifiers](NCS_M0_35_REJECT_DUPLICATE_REQUIRED_EVIDENCE_IDS_2026-10-17.md)
- Source commit: `e891a20a8971fa9df3b6b7d04def5a9c09bd93e3`
- Test commit / CI head: `4a605acd7cc4087261db45d8bab012a7c227c5a4`
- STEP 4 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989570129 — success
- STEP 5 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989570134 — success

STEP 4 now returns `UNKNOWN` if a required claim-critical evidence ID is duplicated in the validation requirements, rather than allowing a non-unique identifier to support PASS. Regression covers duplicate `dep-a` entries. This does not authenticate authority or source labels.

## Latest increment: M0.34 — validate builder claim before authority gate

Record: [M0.34 — Validate claim-builder output before authority gate](NCS_M0_34_VALIDATE_BUILDER_CLAIM_BEFORE_AUTHORITY_GATE_2026-10-17.md)
- Source commit: `8a793eabfe4fd2c09ec49fc465ab69612443b0e9`
- Test commit / CI head: `2cdee9f5ec0ab45667b2dcee0fb5ac633091bf42`
- M0 core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989443967 — success
- STEP 4 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989443881 — success
- STEP 5 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989443922 — success

The transition now validates/detaches the claim-builder output through `createClaimEnvelope()` before calling the authority gate. Regression confirms malformed blank claim ID is rejected and authority gate call count remains zero. This validates structure only, not truth or authority provenance.

## Previous increment: M0.33 — revalidate ClaimEnvelope at candidate boundary

Record: [M0.33 — Revalidate ClaimEnvelope at candidate boundary](NCS_M0_33_REVALIDATE_CLAIM_ENVELOPE_AT_CANDIDATE_BOUNDARY_2026-10-17.md)
- Source commit: `e409a27fa43d8778ce12b2af7f5a488022d158e5`
- Test commit / CI head: `1155acd9c7ffa9b9fdb96a6ab32fa7a2adf6c8a7`
- M0 core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354196 — success
- STEP 4 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354182 — success
- STEP 5 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354194 — success
- policyContext contract CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989354155 — success

`createCandidate()` rebuilds the supplied claim through `createClaimEnvelope()`, rejecting look-alike objects that bypass required-string/collection checks and detaching the validated claim. Regression covers blank claim ID, malformed string collection, and detachment.

## Previous increment: M0.32 — reject blank required strings

Record: [M0.32 — Reject blank required strings in core contracts](NCS_M0_32_REJECT_BLANK_REQUIRED_STRINGS_2026-10-17.md)
- Source commit: `d2354fab87163210b3c9ffae82bfe9afc7d9a689`
- Test commit / CI head: `930c038484fdd70ff7cc38ee56d34484850fa745`
- M0 core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062031
- STEP 4 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062021
- STEP 5 CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062023
- policyContext contract CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38989062010

## Previous increment: M0.31 — cyclic semantic comparison returns UNKNOWN


Record: [M0.31 — Cyclic semantic comparison returns UNKNOWN](NCS_M0_31_CYCLIC_SEMANTIC_COMPARISON_UNKNOWN_2026-10-17.md)
- Source commit: `ade3552a7c8f1345deb5e91ebf446415b1d2f8b0`
- Test commit / CI head: `2efa8631e41cf32691a2b74fdfb51240cc6d36c9`
- STEP 4 CI PASS: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988852975
- STEP 5 CI PASS: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988852849

The semantic validator now maps cyclic/non-JSON-comparable target, target-incarnation, or policy-context comparisons to typed UNKNOWN rather than letting JSON serialization throw out of the validator. Ordinary comparable mismatches remain FAIL. This is bounded contract hardening, not source authentication or production-path proof.

## Previous latest increment: M0.30 — normalize known non-authoritative source labels

## Latest increment: M0.36 — scope semantic decision to claim-critical requirements

Record: [M0.36 — Scope semantic decision to claim-critical requirements](NCS_M0_36_SCOPE_SEMANTIC_DECISION_TO_REQUIRED_EVIDENCE_2026-10-17.md)
- Source commit: `17431cff0bc9e1c13fb74dd0bb7741f4fe416ba3`
- Regression test commit: `eea37c61c75a725bec28e0c9331d37e53f3ef66f`
- STEP 4 source-head run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993022847 — success
- STEP 4 test-head run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993025244 — pending at handoff update
- STEP 5 test-head run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38993025169 — pending at handoff update

Fixed a decision-scope defect: unrelated context requirements with FAILED/invalid status no longer change a claim's decision. Only IDs required by the claim are classified for authority/status; missing required evidence remains UNKNOWN and a required FAILED item remains FAIL. Confirm the test-head CI runs before treating M0.36 as fully verified.

## Active lane

Continue non-authoritative Nexo Core M0. Do not restart M0.1–M0.30 research and do not pivot into STEP 7. STEP 7 remains a separate activation blocker: OPEN / STOP / UNKNOWN; bounded non-activated core construction may continue.

## Latest increment: M0.30 — normalize known non-authoritative source labels

Record: [M0.30 — Normalize known non-authoritative source labels](NCS_M0_30_NORMALIZE_NONAUTHORITATIVE_SOURCE_LABELS_2026-10-17.md)
- Source commit: `0976fcf7a8c825c86a371a1cf7d0259acc263acc`
- Test commit / CI head: `ca3e025ee106d4051e20aa9a24f49163fd854be8`
- Source: `src/nexo/core/final-semantic-validator.mjs`
- Test: `tests/nexo/final-semantic-validator.test.mjs`
- Focused CI passed:
  - STEP 4: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988396835
  - STEP 5: https://github.com/snowdenxrp/aldea-ia/actions/runs/38988396800

Known non-authoritative labels are normalized by trim + lowercase before matching `cache/helper/derived`. This closes a case/whitespace inconsistency but does not authenticate any source label.

## Previous increments

- M0.29 — [malformed required claim items fail closed](NCS_M0_29_MALFORMED_REQUIRED_CLAIM_ITEM_FAIL_CLOSED_2026-10-17.md), source `6635b8b2015a00ec749c037b5e5dd92175b627b1`, test/CI head `5cfcdd06c7f3866c82eaea37ef0789447bac1d0b`. STEP 4/STEP 5 focused CI passed.
- M0.28 — [detached result evidence](NCS_M0_28_DETACHED_RESULT_EVIDENCE_2026-10-17.md), source `eb5e50c3bf5ca2cddec4e46e63531b6a1c72890e`, test/CI head `6ef02115c86c259363d28e363c8d0468f3c35b9f`. Focused M0/STEP4/STEP5/policy-context CI passed.
- M0.27 — [preconstruct success outcome before commit](NCS_M0_27_PRECOMMIT_SUCCESS_OUTCOME_CONSTRUCTION_2026-10-17.md), source `aafe369082dec64599558ed7769c2e6e1988a846`, test/CI head `dcee4a5e5dd2b5d80ab6163cd6137eb51c882aa4`. Focused M0/STEP4/STEP5 CI passed.

## Remaining limits

- No full-repository test run is claimed.
- No production runtime → protected transition → final sink path is proven.
- No legitimate authority source, authority-port composition, or bypass closure is established.
- No production deployment/device test occurred.
- STEP 7 remains OPEN / STOP / UNKNOWN; no Constitution commissioning or protected effects.

## Next action

Continue only where there is a concrete, contract-grounded gap in the remaining non-STEP-7 core. Cross-check M0.1–M0.30 and AB/P records first. Prefer a narrow regression and coherent fix, then focused CI. Avoid broad speculative audits and avoid repeating completed work.

## Continuity references

- Current status: [NEXO_NCS/STATUS.md](../STATUS.md)
- M0.30 report: [NCS_M0_30_NORMALIZE_NONAUTHORITATIVE_SOURCE_LABELS_2026-10-17.md](NCS_M0_30_NORMALIZE_NONAUTHORITATIVE_SOURCE_LABELS_2026-10-17.md)
- M0.29 report: [NCS_M0_29_MALFORMED_REQUIRED_CLAIM_ITEM_FAIL_CLOSED_2026-10-17.md](NCS_M0_29_MALFORMED_REQUIRED_CLAIM_ITEM_FAIL_CLOSED_2026-10-17.md)
- STEP 7 handoff preserved separately: [NCS_STEP_7_NEXT_CHAT_HANDOFF_LATEST_2026-10-16.md](NCS_STEP_7_NEXT_CHAT_HANDOFF_LATEST_2026-10-16.md)
