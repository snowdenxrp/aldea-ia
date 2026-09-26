# NEXO — CONTINUITY CHECKPOINT AB104.205
Date: 2026-09-26
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Persisted research
File: docs/nexo/NEXO_AB104_205_BYZANTINE_EQUIVOCATION_QUORUM_EVIDENCE_ATTACK_V1_2026-09-26.md
Commit: b464f5003631f59854658a21504378680678ceff

## Core findings
A valid signature does not prove non-equivocation. A member can sign two conflicting roots and both signatures can individually verify. Equivocation is a relation between valid statements and therefore requires explicit evidence binding signer/incarnation, scope, epoch and both conflicting statement digests.

A quorum certificate must bind one exact decision, predecessor, configuration and freshness. A certificate saying only “Q members approved” is insufficient.

Threshold signatures compress evidence that enough shares participated, but do not by themselves prove honest authority if the threshold is compromised; nor do they necessarily expose an auditable signer set. Individually signed quorum certificates expose participants but are larger. Neither representation alone solves authority correctness.

Minimum conceptual QC validation now includes:
SIGNATURES_VALID
+ SIGNER_SET_ELIGIBLE
+ THRESHOLD_SATISFIED
+ SAME_STATEMENT_DIGEST
+ SAME_EPOCH
+ SAME_CONFIG
+ FRESHNESS_VALID
+ PREDECESSOR_BOUND
+ NO_REVOCATION_CONFLICT

This is a research predicate, not implemented code.

A stale offline device with a valid old QC is HISTORICALLY_VALID but not necessarily CURRENTLY_AUTHORIZED. Conflicting recovery authorities must enter CONFLICT/QUARANTINE rather than being resolved by timestamp or arrival order.

Equivocation evidence must itself become durable security evidence; volatile-only evidence is insufficient for permanent authority decisions.

## Code study
Canonical repo remains snowdenxrp/aldea-ia / main. AB104.204 continuity explicitly records that no verified Nexo quorum/reconfiguration implementation exists yet. Repository search did not establish implementation of the AB104.205 predicates. No implementation claim is made. Future audit must trace actual membership persistence, signer eligibility, certificate construction/verification, freshness, revocation, conflict handling and external-effect gates.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

## DO-NOT-REPEAT
- signature validity != non-equivocation
- threshold signature != honest authority after threshold compromise
- do not assemble a QC from different statement digests
- stale QC != current authority
- do not silently choose conflicting recovery authorities
- preserve equivocation evidence
- documentation != implementation
- no V21
- no unsupported formal/CI/fault-injection claims

## EXACT NEXT ACTION — AB104.206
Attack authority-to-effect boundary:
1. valid QC after revocation;
2. revocation racing with effect execution;
3. stale QC replay;
4. effect idempotency vs authority freshness;
5. fencing external workers after quorum changes;
6. unknown effect outcomes during recovery;
7. minimum decision/effect contract preventing an old canonical certificate from authorizing a new external effect.

## CONTINUITY RULE
Next CONTINUITY resumes directly at AB104.206. Preserve all UNKNOWN/PENDING states and AB50→AB58 residuals; do not restart AB104.205.
