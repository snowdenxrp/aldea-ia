# NEXO CONTINUITY CANONICALITY POLICY

Date: 2026-09-27
Status: CANONICAL POLICY

## Purpose
Prevent continuity drift, duplicate AB steps, lost-response gaps, and unsupported claims across chats.

## Canonical source
1. GitHub repository `snowdenxrp/aldea-ia`, branch `main`, is the canonical source of Nexo research continuity.
2. Repository state, commit ancestry, tracked artifacts, and saved evidence outrank chat memory and visible assistant responses.
3. Chat responses are secondary communication only. A finding is not canonical merely because it appeared in a response.

## Mandatory continuation gate
Before continuing an AB sequence, inspect the real repository state relevant to the previous steps. At minimum verify:
- current main ancestry;
- AB number and commit(s);
- changed file(s);
- whether the AB has exactly one canonical state;
- duplicates, retries, interrupted writes, conflicting artifacts, and missing saves;
- implementation/execution/verification status.

If the repository and conversation disagree, do not guess. Preserve the discrepancy as UNKNOWN/PENDING and reconcile it from repository evidence.

## One-AB / one-canonical-state rule
Each AB step must resolve to one canonical state. Multiple commits carrying the same AB number are treated as duplicate/retry candidates, not silently merged into one state.

Existing duplicate history MUST NOT be deleted, rewritten, or hidden. The reconciliation record must identify:
- all duplicate/retry commits;
- their ancestry/order;
- their files/content differences;
- which state is canonical and why, once evidence establishes it;
- unresolved uncertainty when evidence is insufficient.

## Evidence integrity
Never fabricate:
- commits or commit SHAs;
- files or file contents;
- test executions;
- formal verification;
- security/correctness claims;
- tool results.

Distinguish explicitly between researched/design evidence, implementation, execution, formal verification, runtime evidence, and deployment evidence.

UNKNOWN/OPEN/PENDING states must survive future continuations until actually resolved.

## Interrupted or lost response rule
If a response appears to have stopped, disappeared, or been replaced:
1. Do not reconstruct its missing content from intuition or memory.
2. Inspect GitHub around the affected AB range.
3. Determine what was actually persisted.
4. Treat any unpersisted finding as UNKNOWN/PENDING.
5. Never claim the lost response was recovered unless repository evidence supports it.

## No-overwrite rule
Historical evidence, V1-V20 lessons, prior audits, contradictions, and unresolved gaps remain preserved. New research may supersede a conclusion only through an explicit, evidence-backed reconciliation; it must not silently erase the historical state.

## CONTINUITY command
When the user says CONTINUITY, recover from this policy plus the latest repository state and existing continuity records. Resume from the next verified action without re-asking already established context and without inventing missing state.

## Workflow
INVESTIGAR -> ANALIZAR -> CONSTRUIR only when authorized by the research stage -> GUARDAR.
For the current Nexo phase, research/audit comes before clean architecture and implementation.

## Current known anomaly baseline
As of 2026-09-27, repository search found duplicate-number candidates for AB104.706 and AB104.711. These remain historical evidence and require reconciliation; no deletion or silent merge is permitted.
