# G-A14-01 — V5 Shared Footprint Adversarial Mini-Audit — 2026-09-24

## Research result
The finite reduction separates two questions that must not be conflated:

1. Currentness: Is the footprint result still valid for the current protected domain/context?
2. Soundness: Did the footprint result correctly identify all invariant-relevant conflicts?

An epoch/fence can address (1): changing a protected dependency domain advances its epoch and invalidates older admissions.

An epoch cannot repair (2): if an analyzer or declaration falsely says E1 and E2 are disjoint while they share an actual safety invariant, both may independently admit and violate the global invariant.

## Consequence
The minimum protected semantics do not necessarily require the entire dependency graph. They do require an authoritative, bounded conflict/disjointness relation whose soundness is itself part of the trust/refinement boundary.

Candidate:
ProtectedFootprintResult = {context, domain/relation, epoch, validity, assurance class}

The full graph may remain outside the linearization domain only if the protected validator/enforcement boundary makes the relation sound enough for the claimed invariant.

## Adversarial cases
- Shared capacity with falsely disjoint declared domains: unsafe.
- Footprint change after admission: old admission must become invalid through epoch/context change.
- Unknown dependency: cannot mean disjoint.
- Two effects with distinct effect keys but one shared invariant: must coordinate together or use a proven cross-domain protocol.
- Local linearizability of each domain: insufficient for a global invariant.

## Important refinement
A conflict_domain_id field is still not proven strictly necessary. A protected relation/result plus epoch can be sufficient if:
- the relation is authoritative for the invariant;
- its soundness assumptions are explicit;
- changes invalidate prior results;
- unknown relations conservatively block independent admission;
- final admission checks the current relation.

## Formal status
The V5 adversarial TLA+ model was saved, but SANY/TLC were NOT available/executed in the current environment. The model is therefore a formalization draft, not a formal proof.

## Gate
Implementation remains CLOSED.
Next attack: test whether a single protected footprint epoch is sufficient when one effect's footprint expands after another admission, including recovery/rollback and cross-domain handoff.
