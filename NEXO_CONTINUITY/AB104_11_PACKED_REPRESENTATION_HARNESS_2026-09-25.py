"""AB104.11 research-only packed representation harness.

This module is deliberately conservative:
- every packed field carries value/provenance/status;
- LeaseBridge and AdmissionBindingClass are reconstructed as separate views;
- unresolved protocol semantics return UNKNOWN;
- no historical AB50/AB51 artifact is modified.
"""
from dataclasses import dataclass
from typing import Dict, Tuple, Any, FrozenSet

KNOWN = "KNOWN"
UNKNOWN = "UNKNOWN"
TRUE = "TRUE"
FALSE = "FALSE"

BRIDGE_FIELDS = (
    "SubjectBinding", "OperationBinding", "AttemptBinding",
    "ResourceBinding", "ResourceIncarnationBinding",
    "AuthorityContextBinding", "PolicyCompatibilityBinding",
    "DelegationValidityBinding", "CapabilityScopeBinding",
    "BoundaryBinding", "FreshnessValidity", "ReplayBinding",
    "TemporalValidity",
)

@dataclass(frozen=True)
class Field:
    value: Any
    provenance: str
    status: str = KNOWN

@dataclass(frozen=True)
class AdmissionLink:
    admission_id: str
    attempt_id: str
    used_context: Tuple[Tuple[str, Any], ...]
    provenance: str
    status: str = KNOWN

@dataclass(frozen=True)
class PackedRecord:
    bridge: Tuple[Tuple[str, Field], ...]
    admissions: Tuple[AdmissionLink, ...]
    invalidation_history: Tuple[str, ...] = ()
    future_semantics: Tuple[Tuple[str, str], ...] = ()

def bridge_view(p: PackedRecord) -> Dict[str, Field]:
    return dict(p.bridge)

def admission_view(p: PackedRecord) -> Dict[str, AdmissionLink]:
    return {x.admission_id: x for x in p.admissions}

def reconstruct_bridge(p: PackedRecord) -> Tuple[str, Dict[str, Field]]:
    b = bridge_view(p)
    missing = [k for k in BRIDGE_FIELDS if k not in b]
    unresolved = [k for k in BRIDGE_FIELDS if k in b and b[k].status == UNKNOWN]
    if missing or unresolved:
        return UNKNOWN, b
    return KNOWN, b

def reconstruct_admission_class(
    p: PackedRecord, admission_id: str
) -> Tuple[str, AdmissionLink | None]:
    a = admission_view(p).get(admission_id)
    if a is None or a.status == UNKNOWN:
        return UNKNOWN, a
    return KNOWN, a

def compare_views(
    p: PackedRecord, admission_id: str
) -> Tuple[str, Dict[str, Any]]:
    bs, b = reconstruct_bridge(p)
    ads, a = reconstruct_admission_class(p, admission_id)
    if bs == UNKNOWN or ads == UNKNOWN:
        return UNKNOWN, {"bridge": b, "admission": a}
    return KNOWN, {"bridge": b, "admission": a}

def future_observation(
    p: PackedRecord, continuation: str
) -> str:
    # The harness refuses to invent unresolved laws.
    declared = dict(p.future_semantics)
    if declared.get(continuation) != KNOWN:
        return UNKNOWN
    # This harness only establishes representational reconstruction.
    # Protocol-specific P_AA execution is intentionally outside its scope.
    return UNKNOWN

def validate_preservation(p: PackedRecord) -> Tuple[str, Tuple[str, ...]]:
    b = bridge_view(p)
    missing = tuple(k for k in BRIDGE_FIELDS if k not in b)
    bad = tuple(
        k for k in BRIDGE_FIELDS
        if k in b and b[k].status not in (KNOWN, UNKNOWN)
    )
    if missing:
        return FALSE, missing
    if bad:
        return FALSE, bad
    return TRUE, ()

def build_minimal_example() -> PackedRecord:
    fields = tuple(
        (k, Field(
            value=f"{k}:B0",
            provenance="AB18-candidate/AB104.8-preservation-contract",
            status=KNOWN,
        ))
        for k in BRIDGE_FIELDS
    )
    links = (
        AdmissionLink(
            "ADM1", "A1",
            (("attempt", "A1"), ("bridge", "B0")),
            "AB26-admission-link",
        ),
        AdmissionLink(
            "ADM2", "A2",
            (("attempt", "A2"), ("bridge", "B0")),
            "AB26-admission-link",
        ),
    )
    return PackedRecord(
        bridge=fields,
        admissions=links,
        invalidation_history=("PolicyChange",),
    )

if __name__ == "__main__":
    p = build_minimal_example()
    print("preservation:", validate_preservation(p))
    print("ADM1:", compare_views(p, "ADM1")[0])
    print("ADM2:", compare_views(p, "ADM2")[0])
    print("future RENEW:", future_observation(p, "LEASE_RENEW"))
