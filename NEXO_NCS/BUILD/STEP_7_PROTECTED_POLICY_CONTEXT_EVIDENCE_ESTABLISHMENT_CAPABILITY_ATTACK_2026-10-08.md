# STEP 7 — Protected PolicyContext Evidence Establishment Capability Attack — 2026-10-08

Status: ATTACK COMPLETE — CONTRACT SURVIVES

## Attacks
1. Provider injection: provider cannot call the protected meaning by constructing ordinary evidence or setting trust metadata.
2. Policy substitution: evidence must be bound to the governed policy reference actually evaluated.
3. Context substitution: claim/mission context comes from the protected Core path; provider cannot redefine it.
4. Dependency laundering: only governed claim-critical dependency requirements are established; arbitrary arrays do not become closure.
5. Provenance forgery: provenance is established by the capability boundary, not by caller fields.
6. Authority leakage: capability establishes evidence only; it cannot authorize, admit, execute, commit, enforce STOP/revocation, or resolve external effects.
7. TOCTOU: evidence is contextual and requires re-establishment after material changes before protected transition.
8. Hidden identity mechanism: the capability does not require a new operation ID, observation ID, queue, retry, tombstone, epoch, or fence.
9. Universal policy engine: the capability establishes required facts but does not absorb candidate selection, authority, validation, or commit semantics.

## Result
No root contradiction found.

The next implementation must preserve the semantic distinction between ordinary data and evidence established through the protected capability. A public constructor alone is insufficient.