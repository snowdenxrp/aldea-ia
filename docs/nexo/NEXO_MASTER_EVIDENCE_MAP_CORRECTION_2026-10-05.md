# NEXO MASTER EVIDENCE MAP — CORRECTION 2026-10-05

## Purpose
This correction supersedes stale statements in NEXO_MASTER_EVIDENCE_MAP_2026-10-04.md concerning AB105.117R. It does not create a new AB checkpoint and does not alter raw evidence.

## Verified correction
The master map contains historical/stale statements such as:
- "Never create a new AB105.117R."
- "AB105.117R not created."
- "No new AB105.117R created by this recovery map."
These statements are no longer valid as a description of repository history because AB105.117R already exists as a persisted raw-evidence checkpoint.

### AB105.117R authoritative record
- File: docs/nexo/AB105.117R_G0_REAL_BROKER_ORDERING_WITNESS_V2_2026-10-03.md
- checkpoint commit: 604a692b753bfac69a88819c58e95d92f594e881
- run: 37098764557
- job: 111133973894
- artifact: 11265332252
- artifact SHA-256: d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c
- executed head: 4026db554b617243c13de7f881b98473852aee7b
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
- conclusion: success
- status: VERIFIED_RAW_EVIDENCE

The checkpoint itself explicitly states that W1→R1 ordering and JMM W1→authorization HB remain UNKNOWN.

## Important artifact/run reconciliation
The master map also associates artifact 11265332252 with run 370778. The authoritative AB105.117R record associates that artifact with run 37098764557.
Until an independent raw GitHub Actions lookup resolves the earlier 370778 reference, do not use 370778 as the authoritative run identifier for artifact 11265332252. The six-link evidence gate requires the run/job/artifact chain to reconcile exactly.

Therefore:
- 37098764557 → 111133973894 → 11265332252 = VERIFIED_RAW_EVIDENCE through AB105.117R.
- 370778 → 11265332252 = HISTORICAL/UNRESOLVED reference; do not promote it as an independent sample.

This prevents accidental double-counting of the same artifact as two experiments.

## Current canonical epistemic state
- AB105.116R: protected historical anchor.
- AB105.117R: EXISTS / VERIFIED_RAW_EVIDENCE; do not recreate it.
- Real-broker temporal ordering: observed.
- W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED.
- W1→R1: UNKNOWN.
- stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- vulnerability/security impact: NOT ESTABLISHED.
- D0_RETURN: NOT equivalent to local W1.
- W1<ENQUEUE: temporal ordering only, not JMM HB.
- PR92: accepted empirical cache-identity diagnostic; not JMM proof.
- PR93: accepted source/architecture boundary audit; no HB proof.
- PR94/G0: separate real-broker temporal-ordering family; do not merge with PR92.
- PR95: execution-path unverified.
- PR96: implementation unverified.
- TLC: NOT RERUN.

## DO-NOT-REPEAT
- Do not rerun PR92/93/94 solely to recover already-established points.
- Do not rerun TLC.
- Do not add volatile/latch/barrier/Future synchronization to manufacture W1→D1.
- Do not recreate AB105.117R.
- Do not promote W1<ENQUEUE to JMM HB.
- Do not treat D0_RETURN as W1.
- Do not claim stale visibility, exploitability, vulnerability, or safety without the missing causal evidence.

## Next distinct audit
Continue chronological/evidence reconciliation only:
1. resolve historical run 370778 versus the authoritative AB105.117R run 37098764557;
2. find any remaining documents that claim AB105.117R does not exist;
3. find any remaining claim that D0_RETURN/W1<ENQUEUE establishes JMM HB;
4. reconcile all duplicate artifacts/runs before any new experiment is considered.