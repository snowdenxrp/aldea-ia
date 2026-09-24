# NEXO G-A14-01 — Multi-Domain Footprint Mini-Audit V1 — 2026-09-24

1. A single conflict-domain identifier cannot represent an effect spanning multiple protected domains.
2. Per-domain epochs can preserve concurrency better than one global epoch, but only if every relevant domain is bound to the admission.
3. Freshness does not establish soundness: a perfectly current but false-negative footprint remains unsafe.
4. The protected validator therefore needs a soundness/assurance status in addition to currentness.
5. Unknown or unsupported dynamic footprint must not be interpreted as disjoint.
6. Full dependency graphs remain candidates for external analysis; the protected core needs the bounded authoritative relation and its invalidation lineage.

Formal status: NOT_PROVEN. SANY/TLC not executed. Runtime implementation not started. Gate CLOSED.