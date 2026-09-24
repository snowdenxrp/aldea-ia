# V8 Executability Audit — 2026-09-23

A direct source inspection of `NEXO_CANONICAL_CORE_V8.tla` found blockers stronger than the previously recorded toolchain absence.

## E-X01 — Boolean conjunction syntax is not executable as currently stored

The retrieved source uses lines such as ` / opState = ...` throughout `Init`, guards, and invariants where TLA+ requires conjunction operators (`/\\`). The stored artifact therefore cannot be treated as an executable TLA+ module in its current form.

This must be repaired in a canonical rewrite, not by assuming display/tool formatting.

## E-X02 — Set domains referenced by TypeOK are undefined

`TypeOK` references `EffectBindingSet`, `AuthoritySet`, `EvidenceSet`, `LeaseSet`, and `ReleaseSet`, but the module does not define these sets. Consequently the type predicate is not self-contained.

## E-X03 — Earlier 'first candidate for execution' status was too optimistic

The static audit previously recorded V8 as the first candidate for SANY/TLC execution. Direct source inspection now supersedes that assessment: V8 is currently a specification draft with concrete syntax/domain blockers. No formal execution result exists.

## E-X04 — Next action must be a structural rewrite

Do not append patches to V8. Create V9 from the semantic contract, with:
- explicit finite record domains;
- executable TLA+ conjunction/disjunction syntax;
- complete `TypeOK` domains;
- explicit owner/generation parameters;
- lease expiry/takeover;
- STOP fence state;
- release authorization consumption;
- exact evidence binding;
- finite freshness/time model;
- explicit transition guards and postconditions.

## Status

V8: DESIGN DRAFT / NOT EXECUTABLE / NOT SANY-CHECKED / NOT TLC-CHECKED.
