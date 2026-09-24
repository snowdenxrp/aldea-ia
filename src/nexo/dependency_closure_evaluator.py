#!/usr/bin/env python3
"""Deterministic, non-authoritative Nexo dependency-closure evaluator."""
from __future__ import annotations
from dataclasses import dataclass
from itertools import combinations
from typing import Any

BAD_STATES = {"UNKNOWN", "COMPROMISED", "STALE", "INVALIDATED"}
ASSURANCE = ["I0", "I1", "I2", "I3", "I4", "I5"]

@dataclass(frozen=True)
class Finding:
    code: str
    severity: str
    message: str
    components: tuple[str, ...] = ()
    dependencies: tuple[str, ...] = ()

def _index(items: list[dict[str, Any]], key: str) -> dict[str, dict[str, Any]]:
    return {str(x[key]): x for x in items}

def evaluate_claim(claim: dict[str, Any]) -> dict[str, Any]:
    components = _index(claim.get("components", []), "component_id")
    dependencies = _index(claim.get("dependencies", []), "dependency_id")
    findings: list[Finding] = []
    direct = {cid: set(map(str, c.get("dependency_refs", []))) for cid, c in components.items()}
    closure = {cid: set() for cid in components}

    def visit(root: str, dep_id: str, path: tuple[str, ...]) -> None:
        if dep_id in path:
            findings.append(Finding("DEPENDENCY_CYCLE","BLOCK",f"dependency cycle detected at {dep_id}",(root,),path+(dep_id,)))
            return
        dep = dependencies.get(dep_id)
        if dep is None:
            findings.append(Finding("MISSING_DEPENDENCY","BLOCK",f"component references unknown dependency {dep_id}",(root,),(dep_id,)))
            return
        if dep_id in closure[root]:
            return
        closure[root].add(dep_id)
        for child in dep.get("depends_on", []):
            visit(root, str(child), path+(dep_id,))

    for cid, refs in direct.items():
        for dep_id in refs:
            visit(cid, dep_id, ())

    for cid, deps in closure.items():
        for dep_id in deps:
            state = dependencies[dep_id].get("state")
            if state in BAD_STATES:
                findings.append(Finding(f"DEPENDENCY_{state}","BLOCK",f"{cid} depends on {dep_id} in state {state}",(cid,),(dep_id,)))

    comp_domains, comp_roots, comp_authority = {}, {}, {}
    for cid, comp in components.items():
        domains, roots, auth = set(), set(map(str, comp.get("trust_roots", []))), set()
        if comp.get("authority_domain"): auth.add(str(comp["authority_domain"]))
        for dep_id in closure[cid]:
            dep = dependencies[dep_id]
            if dep.get("failure_domain"): domains.add(str(dep["failure_domain"]))
            if dep.get("independence_group"): domains.add("independence:"+str(dep["independence_group"]))
            if dep.get("domain") == "trust_root": roots.add(dep_id)
            if dep.get("domain") in {"authority","identity","credential","kms"}: auth.add(dep_id)
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
            correlated.append({"components":[a,b],"reasons":reasons,"shared_failure_domains":shared_domains,"shared_trust_roots":shared_roots,"shared_authority":shared_auth})
            findings.append(Finding("CORRELATED_COMPONENTS","RESTRICT",f"{a} and {b} share a relevant dependency domain",(a,b)))

    unknown = sorted({d for ds in closure.values() for d in ds if dependencies[d].get("state")=="UNKNOWN"})
    compromised = sorted({d for ds in closure.values() for d in ds if dependencies[d].get("state")=="COMPROMISED"})
    stale = sorted({d for ds in closure.values() for d in ds if dependencies[d].get("state") in {"STALE","INVALIDATED"}})

    ceiling = "I5"
    if correlated: ceiling = "I2"
    if stale or unknown: ceiling = "I1" if not compromised else "I0"
    if compromised or any(f.code in {"MISSING_DEPENDENCY","DEPENDENCY_CYCLE"} for f in findings): ceiling = "I0"

    requested = claim.get("assurance_level","I0")
    admissible = requested in ASSURANCE and ASSURANCE.index(requested) <= ASSURANCE.index(ceiling)
    policy = claim.get("unknown_dependency_policy")
    if requested in {"I3","I4","I5"} and policy not in {"BLOCK","HOLD","QUARANTINE"}:
        admissible = False
        findings.append(Finding("HIGH_ASSURANCE_UNKNOWN_POLICY","BLOCK","high assurance requires BLOCK/HOLD/QUARANTINE for unknown dependencies"))

    return {
        "claim_id": claim.get("claim_id"),
        "requested_assurance": requested,
        "maximum_admissible_assurance": ceiling,
        "admissible": bool(admissible),
        "dependency_closure": {k: sorted(v) for k,v in closure.items()},
        "correlated_component_pairs": correlated,
        "unknown_dependencies": unknown,
        "compromised_dependencies": compromised,
        "stale_or_invalidated_dependencies": stale,
        "findings": [f.__dict__ for f in findings],
        "authority_granted": False,
        "effects_executed": False,
    }
