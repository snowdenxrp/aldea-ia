# NEXO CONTINUITY CORRECTION — AB105.117R — 2026-10-04

## Contradiction found during closure review

A later repository audit commit incorrectly states:
- AB105.117R: NOT CREATED.

Direct GitHub commit history shows that **AB105.117R was in fact created/persisted** in commit:

- commit: 604a692b753bfac69a88819c58e95d92f594e881
- message: docs(nexo): persist AB105.117R real-broker ordering witness v2
- artifact: 11265332252
- SHA reported in prior continuity: d8a9e021…

Therefore the statement “AB105.117R: NOT CREATED” is stale/incorrect and MUST NOT be used as the canonical state.

## Corrected state

- AB105.117R: **EXISTS / PERSISTED**
- Its existence does **not** change the scientific conclusion of the W1→D1 HB audit.
- TLC remains NOT RERUN in the latest closure boundary.
- PR92/PR93/PR94 remain methodologically distinct.
- W1→D1 JMM HB remains **UNKNOWN / NOT IDENTIFIED**.
- stale-read remains **NOT OBSERVED / NOT DISPROVEN**.
- security impact remains **NOT ESTABLISHED**.

## Important evidence distinction

The AB105.117R existence correction is a **continuity/documentation correction**, not a new runtime finding.

The latest inspected AB105 G0 closure document also reports the PR93 diagnostic result:
- ITERATIONS=100
- READERS=4
- OBSERVATIONS=2,939,007
- POST_RETURN_ALLOWED=0
- POST_RETURN_DENIED=2,845,069
- OVERLAP_ALLOWED=17,769
- OVERLAP_DENIED=81
- POST_RETURN_PRE_REMOVE_CACHE=0
- POST_RETURN_POST_REMOVE_CACHE=2,845,069
- POST_RETURN_UNKNOWN_CACHE=0
- POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0
- UNEXPECTED=0

That result remains diagnostic evidence: no post-return stale snapshot/ALLOWED was observed in that run, but it is not a formal JMM proof.

## DO-NOT-REPEAT

Do not recreate AB105.117R.
Do not rerun PR92/PR93/PR94 solely because of this correction.
Do not convert the temporal witness into HB proof.

## Canonical epistemic state

**W1→D1 HB:** UNKNOWN / NOT IDENTIFIED  
**Stale-read:** NOT OBSERVED / NOT DISPROVEN  
**Vulnerability:** NOT ESTABLISHED

This correction supersedes any earlier continuity note claiming AB105.117R did not exist.
