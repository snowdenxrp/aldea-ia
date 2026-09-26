# NEXO CONTINUITY CHECKPOINT — AB104.281
Date: 2026-09-26
Research commit: ae8ad26c72ceb21cb6c1d5cdbdd8d7a9e61f379d
AB104.281 completed — research only.

Finding: recovery frontiers are better modeled as a partial order than a scalar. F1<=F2 requires component-wise coverage plus lineage/dependency compatibility. Incomparable frontiers are not ordered by numeric revision. A join is valid only if authenticated lineage, authority/fence, target incarnation, evidence coverage, semantic compatibility, and dependency constraints permit it. Contradiction => CONFLICT; insufficient evidence => UNKNOWN.

AB50→AB58 residuals unchanged; AB104.256/257/259 and prior PENDING items remain unresolved. No implementation or architecture freeze.

Next exact action: AB104.282 — authenticated lineage/dependency graphs and compact frontier certificates.
DO-NOT-REPEAT: do not use max(revision) as a generic recovery join; do not turn candidate algebra into architecture.
