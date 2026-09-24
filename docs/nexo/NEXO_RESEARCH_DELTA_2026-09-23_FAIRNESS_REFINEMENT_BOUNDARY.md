# Nexo Research Delta — fairness vs refinement boundary

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLA+ defines fairness as an additional constraint on allowed behaviors. Weak and strong fairness differ in whether an action must eventually occur when continuously enabled or repeatedly enabled. citeturn0search0 Refinement is semantic: the concrete specification must have only behaviors allowed by the abstract specification, and TLA+ refinement is stuttering-insensitive. citeturn0search1 Lamport's safety material also states that fairness does not affect whether a specification satisfies a safety property when the fairness condition is a conjunct of the implementation specification. citeturn0search25

## New conclusions
1. Fairness belongs to the liveness/environment layer, not to the authority layer. It must never create permission to execute, release, commit, bypass STOP, or ignore revocation.
2. A concrete implementation may use fairness to establish progress, but its refinement mapping must still preserve the abstract safety contract independently of that progress assumption.
3. For Nexo, lease takeover can have a liveness theorem under justified fairness, while stale-owner rejection and STOP dominance remain safety properties that must not depend on fairness.
4. If a refinement check only succeeds after adding fairness, the evidence must identify whether fairness is proving progress or masking a missing safety guard. The latter is a model defect, not a successful verification.
5. Future model configs should therefore label fairness assumptions explicitly and keep safety invariants enabled in the same or a separately auditable configuration.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
