"""AB104.17 bounded invalidation-sensitive packed-representation attacks.

Research-only. This does not assert protocol semantics.
It checks representation preservation under explicit invalidation-history edits.
Future behavior remains UNKNOWN unless a protocol law is explicitly declared.
"""
from NEXO_CONTINUITY.AB104_11_PACKED_REPRESENTATION_HARNESS_2026-09-25 import (
    UNKNOWN, TRUE, build_minimal_example, compare_views, future_observation,
    validate_preservation, PackedRecord,
)

def with_invalidation(p: PackedRecord, event: str) -> PackedRecord:
    return PackedRecord(
        bridge=p.bridge,
        admissions=p.admissions,
        invalidation_history=p.invalidation_history + (event,),
        future_semantics=p.future_semantics,
    )

def attack_policy_change() -> tuple[str, str]:
    base = build_minimal_example()
    mutated = with_invalidation(base, "PolicyChange")
    preserved, _ = validate_preservation(mutated)
    return preserved, compare_views(mutated, "ADM1")[0]

def attack_resource_reincarnation() -> tuple[str, str]:
    base = build_minimal_example()
    mutated = with_invalidation(base, "ResourceReincarnate")
    preserved, _ = validate_preservation(mutated)
    return preserved, compare_views(mutated, "ADM2")[0]

def attack_missing_bridge_dimension() -> tuple[str, str]:
    base = build_minimal_example()
    reduced = PackedRecord(
        bridge=tuple((k, v) for k, v in base.bridge if k != "FreshnessValidity"),
        admissions=base.admissions,
        invalidation_history=base.invalidation_history,
        future_semantics=base.future_semantics,
    )
    preserved, _ = validate_preservation(reduced)
    return preserved, compare_views(reduced, "ADM1")[0]

def bounded_results() -> dict[str, object]:
    policy = attack_policy_change()
    reinc = attack_resource_reincarnation()
    omitted = attack_missing_bridge_dimension()
    return {
        "policy_change": policy,
        "resource_reincarnate": reinc,
        "missing_dimension": omitted,
        "future_renew": future_observation(build_minimal_example(), "LEASE_RENEW"),
        "future_consume": future_observation(build_minimal_example(), "LEASE_CONSUME"),
    }

if __name__ == "__main__":
    print(bounded_results())
