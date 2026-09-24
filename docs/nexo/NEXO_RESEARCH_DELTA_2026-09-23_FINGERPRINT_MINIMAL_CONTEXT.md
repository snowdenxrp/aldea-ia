# Nexo Research Delta — fingerprint and minimal effective context

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLAPS computes proof-obligation fingerprints after canonicalizing the obligation and minimizing the context by removing symbols and hypotheses not used by the step; the fingerprint is intended to remain stable across structural proof edits that do not affect logical validity. citeturn0search23turn0search5 TLAPS also distinguishes known facts from usable facts, and only the usable context is sent to backends. citeturn0search0 Imported theorem instances retain instantiated hypotheses and may require explicit bridge facts when internal symbol identities differ. citeturn0search7

## New conclusions
1. The Nexo proof fingerprint should represent the **minimal effective logical dependency**, not blindly hash the entire repository/model.
2. Unrelated source changes should not invalidate a proof merely because a global file hash changed.
3. Conversely, a seemingly harmless change that alters a usable definition, hypothesis, imported symbol identity, or generated obligation must invalidate/recompute the affected fingerprint.
4. Therefore dependency tracking needs two layers: `GLOBAL_SOURCE_PROVENANCE` for auditability and `EFFECTIVE_LOGICAL_DEPENDENCY` for proof validity/reuse.
5. Proof-cache reuse should require equality/compatibility of the effective dependency fingerprint, while preserving the broader source provenance for traceability.
6. This gives a precise rule for future Nexo tooling: `SOURCE_CHANGED` does not imply `PROOF_INVALID`; `EFFECTIVE_DEPENDENCY_CHANGED` does.
7. The dependency minimization itself must be deterministic and recorded, otherwise cache reuse becomes difficult to reproduce independently.
8. This is compatible with the existing Nexo evidence architecture: provenance remains broad, while validity is scoped to the exact semantic dependency closure.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
