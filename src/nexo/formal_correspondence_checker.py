#!/usr/bin/env python3
"""Machine-checkable correspondence checks between the executable claim contract
and the PG-009 formal vocabulary.

This checker detects declared gaps; it does not prove semantic equivalence.
"""
from __future__ import annotations
from typing import Any

REQUIRED_MAPPING = ("domain_mapping", "state_mapping", "assurance_mapping", "component_mapping", "dependency_relation", "failure_domain_mapping", "trust_root_mapping", "coverage")

def check_correspondence(claim: dict[str, Any], mapping: dict[str, Any]) -> dict[str, Any]:
    findings: list[dict[str, str]] = []
    for key in REQUIRED_MAPPING:
        if key not in mapping:
            findings.append({"code": "MAPPING_REQUIRED_FIELD", "severity": "BLOCK", "message": f"missing mapping field {key}"})

    domain_mapping = mapping.get("domain_mapping", {})
    state_mapping = mapping.get("state_mapping", {})
    assurance_mapping = mapping.get("assurance_mapping", {})
    coverage = mapping.get("coverage", {})
    component_mapping = mapping.get("component_mapping", {})
    dependency_relation = mapping.get("dependency_relation", {})
    failure_domain_mapping = mapping.get("failure_domain_mapping", {})

    for comp in claim.get("components", []):
        cid = comp.get("component_id")
        if cid not in component_mapping:
            findings.append({"code": "FORMAL_COMPONENT_UNMAPPED", "severity": "BLOCK", "message": f"component {cid!r} has no formal mapping"})
        if cid in component_mapping and "dependency_refs" not in component_mapping[cid]:
            findings.append({"code": "FORMAL_COMPONENT_RELATION_UNMAPPED", "severity": "BLOCK", "message": f"component {cid!r} has no dependency relation mapping"})

    for dep in claim.get("dependencies", []):
        did = dep.get("dependency_id")
        if did not in dependency_relation:
            findings.append({"code": "FORMAL_DEPENDENCY_RELATION_UNMAPPED", "severity": "BLOCK", "message": f"dependency {did!r} has no formal dependency relation mapping"})
        if dep.get("failure_domain") and did not in failure_domain_mapping:
            findings.append({"code": "FORMAL_FAILURE_DOMAIN_UNMAPPED", "severity": "BLOCK", "message": f"dependency {did!r} has no formal failure-domain mapping"})

    for dep in claim.get("dependencies", []):
        domain = dep.get("domain")
        if domain not in domain_mapping:
            findings.append({"code": "FORMAL_DOMAIN_UNMAPPED", "severity": "BLOCK", "message": f"dependency domain {domain!r} has no formal mapping"})
        if dep.get("state") not in state_mapping:
            findings.append({"code": "FORMAL_STATE_UNMAPPED", "severity": "BLOCK", "message": f"dependency state {dep.get('state')!r} has no formal mapping"})

    requested = claim.get("assurance_level")
    if requested not in assurance_mapping:
        findings.append({"code": "FORMAL_ASSURANCE_UNMAPPED", "severity": "BLOCK", "message": f"assurance level {requested!r} has no formal mapping"})

    for feature in ("component_to_domain", "transitive_closure", "graph_fingerprint", "finding_taxonomy"):
        status = coverage.get(feature)
        if status != "MAPPED":
            findings.append({"code": "FORMAL_COVERAGE_GAP", "severity": "RESTRICT", "message": f"{feature} correspondence is {status or 'UNDECLARED'}"})

    return {
        "claim_id": claim.get("claim_id"),
        "mapping_version": mapping.get("version"),
        "consistent": not any(f["severity"] == "BLOCK" for f in findings),
        "formally_equivalent": False,
        "findings": findings,
    }
