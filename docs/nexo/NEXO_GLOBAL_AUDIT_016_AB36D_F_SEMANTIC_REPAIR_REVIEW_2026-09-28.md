# NEXO GLOBAL-AUDIT-016 — AB36D–F SEMANTIC REPAIR REVIEW — 2026-09-28

## Result
Direct primary inspection confirms that AB36D is a substantive semantic repair specification, AB36E derives the historical-validity/EventDAG obligation, and AB36F sharpens the reconstruction/minimal-closure target. None is proof or model-checking evidence.

## AB36D
Commit 9d1de1a1a011045ac87d08c980613ebf25e4d9a5. It replaces subject-only identity with finite AuthId/BridgeId/AdmissionId/EventId and defines typed immutable linkage. It explicitly preserves USED/LINKED != VALID and AUTH_IDENTITY != SUBJECT_ID. It also separates ATOMIC/LEASE/RECHECK semantics and introduces countermodels CM-AA301..310.

Classification: 🔵 EXTENSION/REPAIR. The semantic requirements are materially stronger, but the document itself lists exact AuthValidAt, event update rules, complete Next, TLA syntax validation, TLC and refinement proof as OPEN.

## AB36E
Commit 5f4b39a82e01096eb88f819377e9fa2669dd67ea. It shifts the frontier from identity to historical reconstruction: AuthValidAt must be evaluated against claim-relative EventDAG history rather than current state. Countermodels CM-AA311..320 show current-state equality can conceal different admission histories. It defines a candidate predecessor closure and a conservative evaluator that returns UNKNOWN when required history/order is missing.

Classification: 🔵 EXTENSION/RESEARCH, with a strong lower-bound/countermodel result, not a theorem.

## AB36F
The primary artifact sharpens the minimal-closure criterion: removing history is safe only if all allowed future continuations preserve assessment or conservatively force UNKNOWN, UsedContext remains reconstructible, and removed distinctions cannot become relevant. It explicitly distinguishes semantic dimensions from physical variables.

Classification: 🔵 EXTENSION/BOUNDARY DEFINITION. It does not prove that the proposed closure is complete.

## Cross-stage conclusion
AB36D fixes the identity/linkage class of defects identified in AB36B/C at the semantic specification level. AB36E/F expose the deeper problem: immutable linkage alone is insufficient; historical validity and future-safe closure are separate obligations.

Therefore:
ACTUAL_USED_CONTEXT ≠ HISTORICAL_VALIDITY
HISTORICAL_VALIDITY ≠ FUTURE_CLOSURE
EVENT_DAG_DECLARED ≠ EVENT_DAG_COMPLETE
LOWER_BOUND ≠ MINIMALITY THEOREM

## Verification status
No evidence from these artifacts establishes TLC/TLAPS execution, complete TLA validation, quotient congruence, FutureObs_PAA sufficiency, lease completeness, or protocol completeness.

## Next
GLOBAL-AUDIT-017: inspect AB36G–J, specifically whether consistent-history/LossSet and closure-composition work actually establishes soundness/completeness or only candidate algebra and countermodels.