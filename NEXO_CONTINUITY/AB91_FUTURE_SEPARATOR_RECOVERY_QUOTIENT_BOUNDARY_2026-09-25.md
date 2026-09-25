# AB91 — FUTURE-SEPARATOR RECOVERY AND QUOTIENT BOUNDARY — 2026-09-25

Status: RESEARCH ONLY. No implementation, semantic freeze, formal verification, or 286-triple expansion.

## Objective

Continue AB90 by searching canonical history for an explicit future operation that simultaneously reads attempt-bound admission context and LeaseBridge/bridge state.

## Canonical search performed

Commit-history searches for:
- admission binding / attempt / bridge / replay / consumption
- AdmissionBindingClass
- LeaseBridge

returned no indexed commit results in the current GitHub search surface.

This is an index/search limitation, not proof that such artifacts never existed.

## Recovered semantic basis

AB90 establishes:
- CreateAttempt creates a distinct attempt identity.
- Admit uses actual admission linkage.
- LeaseBridge and AdmissionBindingClass have distinct semantic roles.
- Current BridgeValid equality does not itself reconstruct UsedAdmissionContext.attemptId.
- A future separator is possible if a legal operation reads the attempt-bound admission context.

## New formal cross-check

The external TLA+ material confirms that:
- actions are predicates over current and next states;
- Next denotes the relation of possible successive-state pairs;
- nondeterministic actions may have multiple successors;
- equivalence therefore requires preservation over the relevant allowed successor relation, not merely equality of current fields.

This supports the AB90 quotient obligation but does not create a missing Nexo transition law.

## Result

No explicit legal future operation was recovered that simultaneously provides:
1. attempt-bound admission-context read;
2. LeaseBridge read;
3. complete precondition;
4. complete post-state;
5. complete invalidation/frame;
6. exhaustive successor domain.

Therefore the candidate H1/H2 separator remains:

FUTURE_SEPARATOR_PATTERN = IDENTIFIED
CONCRETE_LEGAL_SEPARATOR = NOT_ESTABLISHED

The merge decision remains:

LEASEBRIDGE_ADMISSION_BINDING_MERGE = NOT_JUSTIFIED
MERGE_SAFETY = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN

## Important distinction

We must not convert "no indexed future operation found" into "no future operation exists".

Likewise, we must not declare the two representations equivalent merely because the currently recovered operations cannot separate them.

The correct epistemic state is UNKNOWN until either:
A. a legal future separator is recovered; or
B. a complete reconstruction plus future-equivalence argument is established over the relevant transition domain.

## Exact next action

Search adjacent canonical artifacts by known commit chronology and inspect diffs around AB25/AB26/AB36P/AB39/AB45/AB49 for any operation or history primitive that can read both dimensions. If recovery remains empty, preserve the quotient as UNKNOWN and move to the next independently unresolved semantic gate rather than manufacture a separator.

Do not expand to 286 triples, modify AB61/AB65, declare semantic freeze, or assemble integrated Nexo.
