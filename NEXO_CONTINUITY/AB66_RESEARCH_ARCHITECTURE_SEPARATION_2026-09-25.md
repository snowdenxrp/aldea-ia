# AB66 — RESEARCH/ARCHITECTURE SEPARATION AND EPISTEMIC HYGIENE

Date: 2026-09-25
Status: RESEARCH CHECKPOINT — no architecture freeze, no integrated Nexo implementation.

## Purpose

This artifact establishes a hard separation between (1) durable research history, (2) current epistemic state, (3) experimental implementations, and (4) future Nexo architecture. Persistence is evidence preservation; it is not architectural endorsement.

## Canonical rule

GitHub is the canonical research record. Chat memory is a continuity index only. Earlier AB artifacts remain immutable historical evidence and must not be silently promoted, rewritten, deleted, or treated as final architecture.

## Epistemic classes

- EVIDENCE/FACT: supported by a source, reproducible experiment, or verified repository fact.
- HYPOTHESIS: proposed explanation or design claim awaiting tests.
- UNKNOWN: evidence is insufficient to decide.
- PENDING: the missing evidence/test is identified but not completed.
- FAILED/REJECTED: a specific hypothesis or implementation claim was contradicted under its stated conditions.
- EXPERIMENTAL IMPLEMENTATION: code used to investigate a question; not automatically a production component.
- VERIFIED: a claim or artifact has been reproduced/checked under explicitly stated conditions; scope matters.

No class may be upgraded merely because a later chat remembers it.

## Anti-contamination rules

1. Historical AB artifacts are append-only research history. Corrections create a new AB artifact or an explicit appended reconciliation; they do not rewrite history.
2. Experimental code is not architecture. A runner, harness, interpreter, workflow, patch, adapter, or compatibility layer remains experimental unless an explicit architecture review later accepts it.
3. UNKNOWN must never be collapsed into FALSE, TRUE, an empty set, identity, or a concrete successor without evidence.
4. PENDING must retain its exact missing obligation and next test.
5. Contradictions must remain visible and be reconciled explicitly; the newer artifact may supersede an interpretation, but must preserve the older observation and explain the disposition.
6. Memory summaries must not be used as sole evidence for technical conclusions; recover the canonical GitHub artifacts before resuming substantive work.
7. The final architecture must be derived from requirements, evidence, formal semantics, counterexamples, and verified properties—not from the accumulated shape of experimental patches.

## Research-to-architecture gate

Before integrated Nexo implementation, require:

A. Research closure: relevant state of the art, real systems/runtimes, threat model, alternatives, and counterexamples have been studied.
B. Semantic closure: required transition, identity, authorization, delegation, temporal, provenance, continuation, observation, and failure semantics are explicit; unresolved items remain UNKNOWN/PENDING.
C. Model closure: abstract state, invariants, observational equivalence/quotient, refinement obligations, and concurrency/order semantics are defined to the necessary scope.
D. Attack closure: high-value attacks have executable tests and their residuals are classified with provenance.
E. Reconstruction closure: any claimed lower-arity sufficiency survives future-observation and deterministic reconstruction tests under the stated domain.
F. Verification plan: formalization (e.g. TLA+/TLC/TLAPS where justified) has explicit variables, invariants, refinement obligations, and limits.
G. Architecture review: compare candidate architectures against the research record without selecting a winner by intuition alone; record rejected alternatives and reasons.
H. Implementation gate: only after A–G reach their defined closure criteria may integrated implementation begin.

A failed or unresolved gate blocks assembly; it does not trigger another patch by default.

## Current disposition of AB50–AB65

These artifacts remain valuable research history. They are not a pile of components to assemble. AB55/AB61/AB62/AB65 runners are experimental research infrastructure. AB65 execution remains NOT VERIFIED. TERNARY_PAA_COLLISION remains UNKNOWN. Semantic freeze and formal verification remain open.

## Immediate research consequence

The next round must first investigate epistemic successor-set semantics and canonical lower-arity observational equivalence, while continuing external research on partial observation, three-valued runtime verification, provenance/identity/authorization, temporal continuation semantics, and event-order models. Only evidence-supported semantic changes may modify the research harness. No integrated Nexo assembly is authorized by this checkpoint.

## DO-NOT-REPEAT

- Do not restart AB50–AB65 from scratch.
- Do not treat persisted artifacts as final architecture.
- Do not convert UNKNOWN into a concrete state to make a test run.
- Do not use implementation fields as canonical observations without an observability argument.
- Do not broaden to 286 triples while the eight-attack semantic gate remains incomplete.
- Do not begin integrated Nexo assembly merely because the repository contains many experimental artifacts.

## Continuity recovery

On CONTINUITY: read this artifact plus CONTINUITY_V2_HANDOFF, CURRENT_STATE, NEXT_ACTIONS, RESEARCH_LEDGER, and OPEN_PROBLEMS; verify the repository HEAD/parent chain; then continue the active investigation from the exact open frontier. Preserve all UNKNOWN/PENDING states and all prior artifacts.
