#!/usr/bin/env python3
"""Deterministic, non-authoritative Nexo dependency-closure evaluator.

This module is an analysis component only. It cannot grant authority or execute
effects. Its assurance ceiling is deliberately conservative and is not a safety
proof or certification.
"""
from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from itertools import combinations
import json
from typing import Any

BAD_STATES = {"UNKNOWN", "COMPROMISED", "STALE", "INVALIDATED"}
ASSURANCE = ["I0", "I1", "I2", "I3", "I4", "I5"]
HIGH_ASSURANCE = {"I3", "I4", "I5"}
VALID_POLICIES = {"BLOCK", "RESTRICT", "HOLD", "QUARANTINE"}
HIGH_ASSURANCE_POLICIES = {"BLOCK", "HOLD", "QUARANTINE"}
VALID_DOMAINS = {
    "hardware","host","kernel","hypervisor","runtime","storage","network","dns",
    "clock","identity","credential","kms","trust_root","policy","configuration",
    "artifact","builder","package","model_provider","data_source","operator",
    "admin","observability","coordination","recovery","schema_semantics",
}

@dataclass(frozen=True)
class Finding:
    code: str
    severity: str
    message: str
    components: tuple[str, ...] = ()
    dependencies: tuple[str, ...] = ()

def _index_unique(items: list[dict[str, Any]], key: str, kind: str) -> tuple[dict[str, dict[str, Any]], list[Finding]]:
    out: dict[str, dict[str, Any]] = {}
    findings: list[Finding] = []
    for item in items:
        ident = str(item.get(key, ""))
        if not ident:
            findings.append(Finding("MISSING_IDENTIFIER", "BLOCK", f"{kind} has no {key}"))
            continue
        if ident in out:
            findings.append(Finding("DUPLICATE_IDENTIFIER", "BLOCK", f"duplicate {kind} identifier {ident}"))
            continue
        out[ident] = item
    return out, findings

def _canonical_fingerprint(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return sha256(payload.encode("utf-8")).hexdigest()

def _schema_findings(claim: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    required = {
        "claim_id","protected_function","assurance_level","components","dependencies",
        "failure_domains","trust_roots","authority_domains","policy_version",
        "invariant_version","dependency_graph_version","unknown_dependency_policy","review",
    }
    for key in sorted(required - claim.keys()):
        findings.append(Finding("SCHEMA_REQUIRED_FIELD", "BLOCK", f"missing required field {key}"))
    if claim.get("assurance_level") not in ASSURANCE:
        findings.append(Finding("SCHEMA_ASSURANCE", "BLOCK", "invalid assurance level"))
    if claim.get("unknown_dependency_policy") not in VALID_POLICIES:
        findings.append(Finding("SCHEMA_UNKNOWN_POLICY", "BLOCK", "invalid unknown-dependency policy"))
    if claim.get("assurance_level") in HIGH_ASSURANCE and claim.get("unknown_dependency_policy") not in HIGH_ASSURANCE_POLICIES:
        findings.append(Finding("SCHEMA_HIGH_ASSURANCE_POLICY", "BLOCK", "high assurance requires BLOCK/HOLD/QUARANTINE"))
    if not isinstance(claim.get("components"), list):
        findings.append(Finding("SCHEMA_COMPONENTS", "BLOCK", "components must be an array"))
    if not isinstance(claim.get("dependencies"), list):
        findings.append(Finding("SCHEMA_DEPENDENCIES", "BLOCK", "dependencies must be an array"))
    return findings

def evaluate_claim(claim: dict[str, Any]) -> dict[str, Any]:
    findings = _schema_findings(claim)
    components, cf = _index_unique(claim.get("components", []), "component_id", "component")
    dependencies, df = _index_unique(claim.get("dependencies", []), "dependency_id", "dependency")
    findings.extend(cf)
    findings.extend(df)

    closure: dict[str, set[str]] = {cid: set() for cid in components}

    def visit(root: str, dep_id: str, path: tuple[str, ...]) -> None:
        if dep_id in path:
            findings.append(Finding("DEPENDENCY_CYCLE", "BLOCK", f"dependency cycle detected at {dep_id}", (root,), path + (dep_id,)))
            return
        dep = dependencies.get(dep_id)
        if dep is None:
            findings.append(Finding("MISSING_DEPENDENCY", "BLOCK", f"component references unknown dependency {dep_id}", (root,), (dep_id,)))
            return
        if dep_id in closure[root]:
            return
        closure[root].add(dep_id)
        children = dep.get("depends_on", [])
        if not isinstance(children, list):
            findings.append(Finding("SCHEMA_DEPENDS_ON", "BLOCK", f"{dep_id}.depends_on must be an array", (root,), (dep_id,)))
            return
        for child in sorted(map(str, children)):
            visit(root, child, path + (dep_id,))

    for cid in sorted(components):
        refs = components[cid].get("dependency_refs", [])
        if not isinstance(refs, list):
            findings.append(Finding("SCHEMA_DEPENDENCY_REFS", "BLOCK", f"{cid}.dependency_refs must be an array", (cid,)))
            continue
        for dep_id in sorted(map(str, refs)):
            visit(cid, dep_id, ())

    for dep_id, dep in dependencies.items():
        if dep.get("domain") not in VALID_DOMAINS:
            findings.append(Finding("SCHEMA_DOMAIN", "BLOCK", f"invalid dependency domain for {dep_id}", dependencies=(dep_id,)))
        if dep.get("state") not in {"KNOWN", *BAD_STATES}:
            findings.append(Finding("SCHEMA_STATE", "BLOCK", f"invalid dependency state for {dep_id}", dependencies=(dep_id,)))

    for cid, deps in closure.items():
        for dep_id in sorted(deps):
            state = dependencies[dep_id].get("state")
            if state in BAD_STATES:
                findings.append(Finding(f"DEPENDENCY_{state}", "BLOCK", f"{cid} depends on {dep_id} in state {state}", (cid,), (dep_id,)))

    comp_domains: dict[str, set[str]] = {}
    comp_roots: dict[str, set[str]] = {}
    comp_authority: dict[str, set[str]] = {}
    for cid in components:
        comp = components[cid]
        domains, roots, auth = set(), set(map(str, comp.get("trust_roots", []))), set()
        if comp.get("authority_domain"):
            auth.add(str(comp["authority_domain"]))
        for dep_id in closure[cid]:
            dep = dependencies[dep_id]
            if dep.get("failure_domain"):
                domains.add(str(dep["failure_domain"]))
            if dep.get("independence_group"):
                domains.add("independence:" + str(dep["independence_group"]))
            if dep.get("domain") == "trust_root":
                roots.add(dep_id)
            if dep.get("domain") in {"authority","identity","credential","kms"}:
                auth.add(dep_id)
        comp_domains[cid], comp_roots[cid], comp_authority[cid] = domains, roots, auth

    correlated = []
    for a, b in combinations(sorted(components), 2):
        shared_domains = sorted(comp_domains[a] & comp_domains[b])
        shared_roots = sorted(comp_roots[a] & comp_roots[b])
        shared_auth = sorted(comp_authority[a] & comp_authority[b])
        if shared_domains or shared_roots or shared_auth:
            reasons = []
            if shared_domains: reasons.append("failure_domain")
            if shared_roots: reasons.append("trust_root")
            if shared_auth: reasons.append("authority")
            correlated.append({
                "components": [a, b], "reasons": reasons,
                "shared_failure_domains": shared_domains,
                "shared_trust_roots": shared_roots,
                "shared_authority": shared_auth,
            })
            findings.append(Finding("CORRELATED_COMPONENTS", "RESTRICT", f"{a} and {b} share a relevant dependency domain", (a, b)))

    unknown = sorted({d for ds in closure.values() for d in ds if dependencies[d].get("state") == "UNKNOWN"})
    compromised = sorted({d for ds in closure.values() for d in ds if dependencies[d].get("state") == "COMPROMISED"})
    stale = sorted({d for ds in closure.values() for d in ds if dependencies[d].get("state") in {"STALE", "INVALIDATED"}})

    ceiling = "I5"
    if correlated:
        ceiling = "I2"
    if stale or unknown:
        ceiling = "I1" if not compromised else "I0"
    if compromised or any(f.code in {"MISSING_DEPENDENCY","DEPENDENCY_CYCLE","SCHEMA_REQUIRED_FIELD","SCHEMA_ASSURANCE","SCHEMA_UNKNOWN_POLICY"} for f in findings):
        ceiling = "I0"

    requested = claim.get("assurance_level", "I0")
    admissible = requested in ASSURANCE and ASSURANCE.index(requested) <= ASSURANCE.index(ceiling)
    if requested in HIGH_ASSURANCE and claim.get("unknown_dependency_policy") not in HIGH_ASSURANCE_POLICIES:
        admissible = False

    output = {
        "claim_id": claim.get("claim_id"),
        "requested_assurance": requested,
        "maximum_admissible_assurance": ceiling,
        "admissible": bool(admissible),
        "dependency_closure": {k: sorted(v) for k, v in sorted(closure.items())},
        "correlated_component_pairs": correlated,
        "unknown_dependencies": unknown,
        "compromised_dependencies": compromised,
        "stale_or_invalidated_dependencies": stale,
        "findings": [f.__dict__ for f in findings],
        "authority_granted": False,
        "effects_executed": False,
    }
    output["graph_fingerprint"] = _canonical_fingerprint({
        "components": claim.get("components", []),
        "dependencies": claim.get("dependencies", []),
        "failure_domains": claim.get("failure_domains", []),
        "trust_roots": claim.get("trust_roots", []),
        "authority_domains": claim.get("authority_domains", []),
        "dependency_graph_version": claim.get("dependency_graph_version"),
    })
    return output
