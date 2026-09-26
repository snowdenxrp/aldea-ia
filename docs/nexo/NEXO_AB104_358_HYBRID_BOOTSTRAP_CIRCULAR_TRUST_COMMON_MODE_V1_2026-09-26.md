# NEXO AB104.358 — Hybrid bootstrap without circular trust V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS models trust as configured relationships among relying parties, verifiers, endorsers and trust anchors, and notes bootstrap may depend on previously established key material. citeturn0search1turn0search2 RFC 6024 requires recovery from trust-anchor compromise/loss and identifies initial bootstrap as a separate configuration boundary. citeturn0search0turn0search3 DNSSEC rollover requirements provide a concrete pattern: successor trust can be authenticated by an existing uncompromised anchor, while recovery after compromise of all configured anchors requires an out-of-band path. citeturn0search7turn0search8

## Finding
A hybrid Nexo bootstrap should not combine authorities by simply counting signatures. Each recovery authority must contribute a claim-scoped, independently justified statement. The combination layer then checks whether the authorities have an admissible dependency relationship.

Candidate structure:
BootstrapEvidence = {authority_id, authority_type, statement_digest, scope, epoch, frontier, dependencies, independence_profile, freshness, transition_binding}

Candidate combination states:
HYBRID_VALID | PARTIALLY_SUPPORTED | COMMON_MODE | CIRCULAR | ORDER_CONFLICT | SCOPE_CONFLICT | UNKNOWN | CONFLICT

Candidate rule:
A hybrid bootstrap is admissible only if:
1. each authority is independently anchored or its dependency chain terminates in an already accepted root;
2. no authority depends circularly on another authority whose validity depends on the first;
3. shared infrastructure is explicitly represented rather than counted as independence;
4. all authorities bind the same transition/claim scope and compatible epoch/frontier;
5. disagreement is classified as CONFLICT, not resolved by majority unless a prior policy defines quorum semantics;
6. a quorum can establish only the claim covered by its protocol—not arbitrary external truth.

## Important result
The safer composition is policy-defined authority ordering + dependency graph + claim-specific quorum, not an undifferentiated N-of-M trusted-signature rule.

SIGNATURE_QUORUM != INDEPENDENT_QUORUM
MULTIPLE_ROOTS != AUTOMATICALLY_INDEPENDENT_ROOTS
HYBRID_AUTHORITY != UNIVERSAL_AUTHORITY
DISAGREEMENT => CONFLICT/STOP unless an authenticated prior policy defines resolution.

## Bootstrap failure
If all candidate authorities depend on the same compromised/rolled-back root, the graph has a common-mode failure even when multiple signatures exist. If no admissible independent recovery path remains, Nexo stays UNKNOWN/STOP.

## Status
Exact quorum protocol, independence thresholds, recovery ceremony and authority-ordering formalism remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.359 — study authority disagreement: when two independently authenticated recovery authorities produce different frontiers, how Nexo must preserve both evidence branches and classify the result without inventing a winner.
