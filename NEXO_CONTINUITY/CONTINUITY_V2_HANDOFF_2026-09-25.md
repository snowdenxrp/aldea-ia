# NEXO CONTINUITY V2 HANDOFF — 2026-09-25

Status: CANONICAL HANDOFF / RESEARCH-INTEGRITY SAFEGUARD

## Purpose
This document is the single entry point for recovery when a ChatGPT conversation reaches a message/context/tool limit. It exists specifically to prevent research gaps, false closure, repeated proposals, and loss of partially completed work.

## Source of truth
- Repository: snowdenxrp/aldea-ia
- Branch: main
- Latest verified HEAD at creation: e0d1134ec707f3e77f9c247f7c45fb8540359e90
- Current research frontier: AB56
- Recovery keyword: CONTINUITY

## Non-loss rule
A chat is a disposable execution session. GitHub persisted artifacts are canonical.
Never infer completion from chat continuity, a summary, or a prior assistant assertion when repository evidence is available.
Never overwrite prior AB research artifacts.
Never convert UNKNOWN/PENDING into a stronger state merely because a chat ended.

## Required recovery order
1. Read this file.
2. Read NEXO_CONTINUITY/CURRENT_STATE.md.
3. Verify main HEAD and its ancestry.
4. Read CLAIM_STATUS.md, OPEN_PROBLEMS.md, NEXT_ACTIONS.md, RESEARCH_LEDGER.md and EVIDENCE_INDEX.md.
5. Read only the research artifacts relevant to the active frontier.
6. Resume at the exact NEXT_ACTIONS item. Do not restart completed research.
7. If any persisted file disagrees with another, treat the disagreement as a continuity defect: do not silently choose one. Reconcile against Git history and the latest explicit artifact.

## Epistemic firewall
Every research item must preserve:
- status: ESTABLISHED / CONDITIONAL / HYPOTHESIS / UNKNOWN / CONTRADICTED / SUPERSEDED
- evidence/provenance
- scope and assumptions
- what was actually executed
- what was not executed
- exact unresolved dependency
- next action

Do not collapse these distinctions:
RECOVERED != PROPOSED != IMPLEMENTED != TESTED != VERIFIED
BOUNDED EVIDENCE != PROOF
MATHEMATICAL NON-RECONSTRUCTIBILITY != PROTOCOL COLLISION
PAIRWISE VALIDITY != JOINT RELATIONAL VALIDITY
COMPACTION != RESTORATION
STOP != CANCEL != REVERSION != TERMINATION

## Chat-limit handoff contract
Before a substantive session ends, persist a checkpoint containing:
1. latest canonical HEAD;
2. parent/child linkage;
3. completed actions;
4. partially completed action and exact stopping point;
5. new findings and their evidence;
6. unchanged UNKNOWN/PENDING items;
7. contradictions or inconsistencies discovered;
8. exact next executable action;
9. artifacts/files touched;
10. explicit "DO NOT REPEAT" list.

If the user can no longer send another message, the next chat must be able to recover solely from the repository and this handoff. No instruction to the next chat should require it to invent a new continuity architecture.

## Current known continuity discrepancy
CONTINUITY_PROTOCOL.md previously contained an obsolete "Current verified frontier: AB51" line. CURRENT_STATE.md and the Git chain establish AB56 as the current research frontier. This is a documentation inconsistency, not permission to revert the state. It must be corrected by appending a clarification and retaining the historical text.

## Current research boundary
AB56 did not establish a ternary P_AA collision. It established a bounded lower-arity/FutureObs_PAA reconstruction and EventDAG framework. The following remain unresolved and must remain unresolved until their stated evidence exists:
- full concrete binding-state ternary enumeration
- complete executable FutureObs_PAA domain
- protocol-specific continuation legality
- complete EventDAG closure
- deterministic reconstruction under the complete criterion
- HistorySupport elimination
- LeaseBridge/AdmissionBindingClass merge
- quotient congruence
- exact refinement mapping
- semantic freeze
- TLA+/TLC/TLAPS verification

## Mandatory next research
Implement/execute the AB56 lower-arity + FutureObs_PAA + EventDAG interpreter using actual UsedAdmissionContext identity/binding equality and explicit continuation legality. Preserve UNKNOWN. Run the eight highest-value ternary attacks through the complete gate. Only after that broaden to all 286 triples; escalate to four events only if the ternary gate produces a justified residual.

## Safety against inconcrete investigations
A conclusion is not allowed to become canonical merely because it sounds plausible or because a prior summary says "done." A claim closes only when its closure condition and evidence are explicitly recorded. If a required semantic rule is absent, the result is UNKNOWN or CONDITIONAL, not an invented completion.

## Recovery instruction
A new chat receiving only:
"CONTINUITY. Recupera el estado canónico desde GitHub, verifica la cadena y continúa desde el último punto persistido. No sobrescribas ni elimines nada."
must be able to recover from this document plus the continuity directory without asking the user to re-explain the prior continuity problem.

## AB57 live frontier amendment — 2026-09-25

The research frontier has advanced from AB56 to AB57 IN PROGRESS. A conservative executable observational/EventDAG harness is persisted at:
NEXO_CONTINUITY/AB57_EXECUTABLE_OBSERVATIONAL_EVENTDAG_GATE_V1_2026-09-25.py

Its progress artifact is:
NEXO_CONTINUITY/AB57_EXECUTABLE_OBSERVATIONAL_EVENTDAG_GATE_V1_2026-09-25.md

This does not close the ternary protocol question. The next chat must resume AB57 semantic completion rather than redesigning continuity or repeating the deep audit.

## AB58 live frontier amendment — 2026-09-25

AB58 audited the AB57 executable boundary without importing undocumented protocol semantics. The audit is persisted at NEXO_CONTINUITY/AB58_AB57_HARNESS_SEMANTIC_AUDIT_2026-09-25.md. FutureObs_PAA remains non-executable as a full future-observation criterion until continuation legality is represented explicitly; EventDAG closure remains partial. The next chat must resume the AB58 exact next action rather than repeating continuity hardening or treating the harness as semantic closure.
