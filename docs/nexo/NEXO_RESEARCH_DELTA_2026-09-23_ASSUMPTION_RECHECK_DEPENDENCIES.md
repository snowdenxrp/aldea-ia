# Nexo Research Delta — assumption recheck dependencies

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS models proof obligations in an explicit context containing constants, variables, assumptions and established facts; the proof manager tracks that context and generates obligations for proof steps and cited facts. citeturn0search18turn0search0 TLA+ module semantics treat module assumptions as hypotheses of the theorem rather than independently proved facts. citeturn0search2turn0search20 TLAPS documentation also distinguishes current proof status from a previously cached/displayed status and allows forgetting prior results. citeturn0search4

## New conclusions
1. The assumption boundary must be dependency-aware, not just a static list attached to a theorem.
2. Each assumption should have an identity, classification, version/fingerprint, owner/source, validity scope, and independent evidence reference when one exists.
3. A proof claim should be invalidated or downgraded when a materially relevant assumption changes, expires, is reclassified, or loses its supporting evidence.
4. If an assumption is unchanged but its supporting evidence becomes stale, the proof itself becomes `ASSUMPTION_UNSUPPORTED` rather than automatically `FALSE`.
5. If an assumption is explicitly trusted as an axiom, the claim can remain logically valid under that axiom, but its assurance boundary must expose the axiom rather than presenting the result as assumption-free.
6. Proof dependencies should therefore form a DAG: `CLAIM → OBLIGATION → CONTEXT → ASSUMPTION/FACT → EVIDENCE`, with versioned edges.
7. A clean recheck should verify both the proof obligations and the validity of the assumption/evidence boundary relevant to the claim.
8. This prevents a subtle circularity: proving a safety theorem using an assumption that was itself derived from the same unverified implementation path.

## Important boundary
TLAPS can establish the logical consequence of the current context; it does not by itself establish that an external system satisfies every implementation/environment assumption in that context. That remains a refinement/validation obligation.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
