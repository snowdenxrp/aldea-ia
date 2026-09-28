# GLOBAL-AUDIT-018 — AB36K–N REVIEW — 2026-09-28

AB36K–N were inspected as the next semantic layer after AB36J.

## Findings
AB36K attacks candidate closure laws rather than assuming them. It distinguishes conditional monotonic information addition from unsafe universal monotonicity; refutes unconditional intersection soundness, unique minimal closure, current-state quotient for historical claims, fixed-point-implies-soundness, pairwise completeness, unconditional composition and reclamation transitivity. This is adversarial progress, not proof.

AB36L advances the semantic information preorder/normalization frontier. The important boundary is that an information preorder is meaningful only relative to a claim and interpretation contract; normalization can preserve semantics only if it preserves claim-relevant concretization/observation obligations. A normalized representation is not automatically a quotient theorem.

AB36M makes concretization and consistent-history sets explicit and continues the distinction between semantic restriction justified by evidence/contracts and narrowing caused by representation. It strengthens the need for joint realizability and claim-relative LossSet semantics.

AB36N analyzes union/intersection composition. Compatible conjunction can correspond to history-set intersection; safe forgetting can correspond to a history-set superset. Raw field union/intersection is explicitly rejected as a semantic law. Empty concretization is inconsistency, not safety. Witness splicing across different histories is unsafe.

## Audit conclusion
This stage does NOT establish a least closure theorem, quotient theorem, or compositional theorem. Instead it eliminates several tempting but invalid algebraic shortcuts.

The semantic object is now better characterized as:
CLAIM-SCOPED CONTRACT + RETAINED DISTINCTIONS/RELATIONS + CONCRETIZATION SET + LOSS/UNKNOWN CONDITIONS + OBSERVATION/REFINEMENT OBLIGATIONS.

Therefore:
FIXED_POINT != SOUNDNESS
NORMALIZATION != QUOTIENT_PROOF
FIELD_UNION != HISTORY_UNION
FIELD_INTERSECTION != HISTORY_INTERSECTION
EMPTY_CH != TRUE
SOUND_COMPONENTS != AUTOMATICALLY SOUND_COMPOSITION

## Verification
No TLC/TLAPS/formal verification established by these artifacts.

## Next
GLOBAL-AUDIT-019 → AB36O–R, focusing on semantic preorder characterization, protocol composition, protocol histories, linearization and reconstruction/lower-bound claims.