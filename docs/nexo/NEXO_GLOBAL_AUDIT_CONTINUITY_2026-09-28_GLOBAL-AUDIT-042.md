# GLOBAL-AUDIT-042 CONTINUITY

Audit commit: f29e79aea53cfafbf96dfecb6d9b27176c2c91c9
Previous continuity: daa5116998775f8a14c47339610a6a1861c179d7

Completed quorum certificate replay/cross-epoch composition/evidence reclamation attack.

Certificates must bind claim scope, membership epoch, participant incarnation, evidence generation and exact operation/effect context. Signature validity alone does not prevent semantic replay.

Cross-epoch composition requires an explicit reconfiguration relation; `VALID(Q1) + VALID(Q2) != VALID(Q1 ∪ Q2)` by default.

Historical certificates can remain valid evidence for historical claims after participant revocation, while no longer supporting current authority claims.

Evidence reclamation is claim-relative. Deletion is safe only when every in-scope future claim has an authoritative reconstruction path and deletion cannot change the compatible-history set. `DELETION != SEMANTICALLY_IRRELEVANT`.

Aggregate digests may be insufficient to reconstruct participant incarnation, epoch transition or dependency provenance. Nested certificates also do not automatically inherit all semantic properties of their dependencies; transitive provenance remains claim-dependent.

No formal proof/TLC/TLAPS/runtime fault injection. No implementation/V21.
Next: GLOBAL-AUDIT-043 — evidence retention horizons, legal future claims and finite-retention effects on FutureObs semantics.
Carryover unchanged: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; quorum semantics completeness UNKNOWN; retention/reconstruction soundness UNKNOWN; formal verification NOT PERFORMED.
