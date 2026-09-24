# Nexo Research Delta — effective context projection stability

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS distinguishes the growing set of known facts from the smaller usable context supplied to a backend; the usable set is deliberately controlled because excessive facts can make proving harder. citeturn0search3turn0search11 The Proof Manager canonicalizes and minimizes the effective obligation context before fingerprinting it. citeturn0search11turn0search16 Recent TLAPS discussion also confirms that assumptions/facts used by a local step must be explicitly represented in the proof context/BY structure, while certain top-level or unnumbered facts are treated specially. citeturn0search2

## New conclusions
1. The effective-context projection is itself a semantic input to Nexo verification and must be reproducible.
2. Context minimization must preserve logical sufficiency: removing irrelevant facts is safe only when they are genuinely irrelevant to the generated obligation.
3. A change in proof structure can legitimately leave the obligation fingerprint unchanged when its logical boundary is unchanged; this is desirable reuse, not a verification shortcut.
4. A change in which facts are actually usable can alter the obligation even if the source-level target remains identical; that requires a new obligation fingerprint or explicit compatibility proof.
5. Future Nexo tooling should record the selected usable-context identifiers and the canonicalization/minimization algorithm version used to derive the fingerprint.
6. Context projection should be deterministic across verifier runs; otherwise identical semantic inputs could produce non-reproducible cache decisions.
7. This creates a distinct evidence boundary: `CONTEXT_SELECTION_ALGORITHM` is part of the verification toolchain, while `SELECTED_CONTEXT` is part of the proof obligation itself.
8. Therefore a clean recheck after changing context-selection/canonicalization logic should not silently reuse old results, even when the target theorem text is unchanged.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
