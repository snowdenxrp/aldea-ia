# NCS — Latest Step 7 handoff (2026-10-16)

Branch: `ncs-clean-architecture`
Repository: https://github.com/snowdenxrp/aldea-ia
Operational status: STEP 7 = `OPEN / STOP / UNKNOWN`
Security objective: Direction B / L2.
Constitution: DRAFT / NOT FROZEN / NOT COMMISSIONED / OWNER REVIEW REQUIRED.
Protected effects: STOP. Do not commission or activate.

## Purpose and precedence

This handoff consolidates the latest bounded work and next action so a new chat does not repeat completed research. Use it as the latest continuation pointer, while preserving the detailed historical records linked below. `NEXO_NCS/STATUS.md` remains a large historical/operational record (456 KB at the time of this handoff); its current top begins with M0.1 and does not serve as a concise latest M0.17 index. Do not rewrite that large file wholesale just to make it a summary.

## Latest verified progress

### M0.15 — Semantic requirement source label
Record: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_15_SEMANTIC_REQUIREMENT_SOURCE_LABEL_2026-10-16.md
- Required requirements with missing, non-string, or whitespace-only source labels now yield UNKNOWN.
- CI: STEP 4 run 38979977867 and STEP 5 run 38979977868 succeeded.
- Limitation: source is only a label; it is not authenticated authority.

### M0.16 — Malformed final semantic validation result
Record: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_16_MALFORMED_FINAL_VALIDATION_RESULT_FAIL_CLOSED_2026-10-16.md
- Protected transition now requires validator result `reasons` and `evidence` to be arrays; malformed shape returns UNKNOWN before commit.
- Regression tests verify no commit for malformed PASS/FAIL results.
- CI: STEP 4 run 38980153223, STEP 5 run 38980153231, M0 workflow run 38980153205 succeeded.
- Source commit: `71bdc30bd7c3f84c4c134b24a87daeddf4dcdc45`; tests/head: `9fe296b41a8ee8d18f12e2c3f4ecba1019ae041c`.

### M0.17 — Candidate expectedRevision preservation
Record: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_17_CANDIDATE_REVISION_PRESERVATION_2026-10-16.md
- Candidate must preserve the exact requested expectedRevision, not merely return a non-negative integer.
- Regression test requests revision 1 but executor returns revision 2; transition rejects before semantic validation and commit, with both call counts zero.
- CI: STEP 4 run 38980210565, STEP 5 run 38980210484, M0 workflow run 38980210530 succeeded.
- Source commit: `c1dd1cfc230bf26fbbb109b7db5ef172dd50d982`; tests/head: `d0794939196db91fd380aa133e74805a1e135401`.

### M0.18 — Conditional-commit boundary source audit
Record: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_18_CONDITIONAL_COMMIT_BOUNDARY_SOURCE_AUDIT_2026-10-16.md
- Reviewed current protected-transition, conditional-commit adapter, canonical `persistState`, and focused integration-test source.
- Confirmed candidate.expectedRevision flows to `persistState`; the persistence primitive acquires its sibling lock, reloads canonical state while holding the lock, and rejects revision mismatch before writing.
- Adapter maps `STATE_REVISION_CONFLICT` to `CONDITIONAL_CONFLICT`; other persistence errors map to `UNKNOWN`.
- No new test/CI run was performed in M0.18. Existing P112 records remain the evidence for cooperating-writer races and write/rename failure tests; no power-loss durability is claimed.
- This does not prove all writers cooperate, production runtime reachability, legitimate authority, or bypass closure.
- Audit commit: `805bf055f0bf70b64b54ff49fafdf0160a516d1c`.

### M0.19 — Snapshot-isolation composition boundary review
Record: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_19_SNAPSHOT_ISOLATION_COMPOSITION_BOUNDARY_REVIEW_2026-10-16.md
- `createCandidate()` uses `structuredClone(state)`, but the transition API trusts the injected SnapshotIsolator and checks only that its result is not undefined.
- The focused integration test injects a `structuredClone()` isolator; this does not prove production composition.
- The inspected runtime effect path does not invoke `executeProtectedTransition()` before the adapter effect path. This is bounded source review, not exhaustive bypass proof.
- No source/test/workflow change or test run; no patch was justified because a shallow reference check would not prove deep graph isolation and would not repair missing runtime composition.
- Review commit: `54ab3ba875a3d6910ba970bce2ec9d0140283d94`.

## Previous M0 work to reuse, not repeat

The same branch contains M0.1–M0.14 and their test/evidence records, including:
- Observation/candidate data boundary and deep immutability (M0.1/M0.12).
- Bounded observation-candidate caller trace (M0.2).
- Observation equivalence tests (M0.5).
- Outcome classifier contracts and malformed input shape (M0.6/M0.13).
- Core isolation/contract collection shape (M0.7/M0.14).
- Reconciliation caller-trust marker limitation (M0.8).
- Six/seven focused Core contract commands in CI (M0.9 and M0.11 onward).
- Authority result provenance boundary (M0.10).
- Legacy planner non-authority regression guard (M0.11).

Do not rerun closed AB/TLC/P112 research. Reuse the existing STEP 7 authority-source composition, runtime authority-to-effect source trace, initial authority bootstrap decision gate, Genesis premise L2 feasibility adjudication, and external trusted review candidate screen records from 2026-10-12 through 2026-10-16.

## Known unresolved architectural blockers

1. No demonstrated legitimate initial owner/Genesis authority source or independent, verifiable binding.
2. ClaimEnvelope `claimId` is only shape-validated; no legitimate claim-identity binding has been demonstrated. Do not invent IDs from timestamps, sequence counters, array positions, missionId, action+target, or ad hoc hashes.
3. `executeProtectedTransition()` still trusts the authority-gate port. Tests injecting `AUTHORIZED` prove only composition under that injection, not legitimate authority.
4. `effectBoundary.prepare` defaults to `NOT_IMPLEMENTED` and is not invoked by the protected transition.
5. No proven production runtime → constitutional gate → final protected sink → canonical commit path; runtime wiring and bypass closure remain unproven.
6. M0.17 plus M0.18 establish candidate revision preservation and a cooperating-writer canonical revision check; all-writer protocol coverage, production runtime reachability, power-loss durability, and complete mediation remain unproven. M0.19 additionally confirms the transition trusts an injected SnapshotIsolator; production isolation composition remains UNKNOWN.
7. Reconciliation's `authoritative: true` marker remains caller-trust, already documented in M0.8/STEP 6. Do not reframe this as a new finding or reopen STEP 6.

## Next bounded action

Continue source review at the conditional-commit boundary, without activating it:
- inspect the current conditional-commit implementation and its tests;
- establish whether expected revision is checked atomically against canonical state, and what the adapter's state ownership and failure/uncertain-commit semantics are;
- if a concrete contract gap exists, add a narrow regression test and update this handoff with exact source/test commit and CI runs;
- if the guarantee cannot be demonstrated from code, record UNKNOWN/PENDING rather than infer it.
Do not connect runtime, add authority mapping, commission Constitution, or create another APK/phone task.

## Evidence discipline

Focused CI passes are not full repository `npm test`, production runtime reachability, authority legitimacy, or bypass-closure proof. Keep each claim scoped to its exact test and source boundary. Missing proof remains UNKNOWN/PENDING.

## Key recent commits

- M0.15 source: `56aa2758c8edbac73fc88eed2da094f28daf3605`; tests: `8371b99d344ba2eafd404ee72421168f3f01860f`.
- M0.16 source: `71bdc30bd7c3f84c4c134b24a87daeddf4dcdc45`; tests: `9fe296b41a8ee8d18f12e2c3f4ecba1019ae041c`.
- M0.17 source: `c1dd1cfc230bf26fbbb109b7db5ef172dd50d982`; tests: `d0794939196db91fd380aa133e74805a1e135401`.
