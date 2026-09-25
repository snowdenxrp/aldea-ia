"""AB104.17 bounded invalidation-sensitive packed-representation attacks.

Research-only. This does not assert protocol semantics.
It checks representation preservation under explicit invalidation-history edits.
Future behavior remains UNKNOWN unless a protocol law is explicitly declared.
"""
import importlib.util
from pathlib import Path

_HARNESS = Path(__file__).with_name("AB104_11_PACKED_REPRESENTATION_HARNESS_2026-09-25.py")
_spec = importlib.util.spec_from_file_location("ab104_11_harness", _HARNESS)
if _spec is None or _spec.loader is None:
    raise RuntimeError("AB104.11 harness could not be loaded")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

UNKNOWN = _mod.UNKNOWN
TRUE = _mod.TRUE
build_minimal_example = _mod.build_minimal_example
compare_views = _mod.compare_views
future_observation = _mod.future_observation
validate_preservation = _mod.validate_preservation
PackedRecord = _mod.PackedRecord

def with_invalidation(p, event: str):
    return PackedRecord(
        bridge=p.bridge,
        admissions=p.admissions,
        invalidation_history=p.invalidation_history + (event,),
        future_semantics=p.future_semantics,
    )

def attack_policy_change():
    base = build_minimal_example()
    mutated = with_invalidation(base, "PolicyChange")
    preserved, _ = validate_preservation(mutated)
    return preserved, compare_views(mutated, "ADM1")[0]

def attack_resource_reincarnation():
    base = build_minimal_example()
    mutated = with_invalidation(base, "ResourceReincarnate")
    preserved, _ = validate_preservation(mutated)
    return preserved, compare_views(mutated, "ADM2")[0]

def attack_missing_bridge_dimension():
    base = build_minimal_example()
    reduced = PackedRecord(
        bridge=tuple((k, v) for k, v in base.bridge if k != "FreshnessValidity"),
        admissions=base.admissions,
        invalidation_history=base.invalidation_history,
        future_semantics=base.future_semantics,
    )
    preserved, _ = validate_preservation(reduced)
    return preserved, compare_views(reduced, "ADM1")[0]

def bounded_results():
    return {
        "policy_change": attack_policy_change(),
        "resource_reincarnate": attack_resource_reincarnation(),
        "missing_dimension": attack_missing_bridge_dimension(),
        "future_renew": future_observation(build_minimal_example(), "LEASE_RENEW"),
        "future_consume": future_observation(build_minimal_example(), "LEASE_CONSUME"),
    }

if __name__ == "__main__":
    print(bounded_results())
