# NEXO CONTINUITY PROTOCOL

Canonical project: snowdenxrp/aldea-ia
Current verified frontier: AB51

## Recovery keyword

CONTINUITY

When a new chat begins with "CONTINUITY", reconstruct project state from this directory before continuing. Do not rely on conversational memory when repository evidence is available.

## Canonical rule

Git history and persisted research artifacts are the source of truth. Never overwrite prior AB artifacts. New research extends the chain with a new artifact/commit.

## Per-round persistence contract

Every substantive research round must persist:
1. research findings and reasoning;
2. evidence/provenance;
3. established facts;
4. hypotheses and UNKNOWN/PENDING items;
5. decisions and rejected alternatives when material;
6. open problems;
7. exact next action;
8. continuity state and current commit.

After persistence, verify parent/child commit linkage and record the resulting SHA in CURRENT_STATE.md.

## Epistemic rules

Never promote bounded evidence to proof. Preserve UNKNOWN as UNKNOWN. Never erase contradictory or superseded research; append a new artifact explaining the change and its evidence.

## New-chat recovery procedure

1. Read CURRENT_STATE.md.
2. Read CLAIM_STATUS.md, OPEN_PROBLEMS.md and NEXT_ACTIONS.md.
3. Read RESEARCH_LEDGER.md and EVIDENCE_INDEX.md for the relevant frontier.
4. Verify the current HEAD and parent chain in GitHub.
5. Continue from NEXT_ACTIONS without restarting prior work.

## Required completion state

A round is not considered safely complete until its research is persisted and the continuity files point to the new verified HEAD.


## Continuity V2 loss-prevention amendment — 2026-09-25

The current research frontier is AB56; the old AB51 header above is historical/stale documentation and must not be used for recovery. See CONTINUITY_V2_HANDOFF_2026-09-25.md as the entry point.

A chat may terminate before the user can send another message. Therefore every substantive round must be persisted before its final response whenever technically possible; the next chat must recover from GitHub alone.

A handoff is complete only when it records the exact stopping point, partial work, unresolved semantics, evidence boundaries, and a DO-NOT-REPEAT list. A summary may not promote epistemic status.

On recovery, if continuity files disagree, verify Git ancestry and the newest explicit artifact before proceeding; never silently choose a conflicting value.