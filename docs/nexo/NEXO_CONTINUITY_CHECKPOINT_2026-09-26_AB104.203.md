# NEXO — CONTINUITY CHECKPOINT AB104.203
Date: 2026-09-26
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

Research file:
docs/nexo/NEXO_AB104_203_MULTIDEVICE_CONTINUITY_QUORUM_EQUIVOCATION_ATTACK_V1_2026-09-26.md
Commit: f13568de1c0104f2fb94dd8f731b943d1cae79f8

## External research
Studied Raft consensus, RFC 9162 Certificate Transparency consistency/equivocation, and NIST Byzantine/quorum/threshold-cryptography material.

## Core result
Multiple devices do not automatically create a quorum. Independent authority identities/incarnations and explicit membership/trust semantics are required.

Safety/availability finding:
During a network partition, a device may continue local/offline work, but a side without sufficient canonical authority must not promote a conflicting canonical root. Offline branch != canonical commit.

Equivocation finding:
Two individually valid roots for the same authority scope/epoch must be preserved as conflicting evidence, not merged or resolved by timestamp/arrival order.

Consistency finding:
Merkle consistency can prove append-only relationship but cannot by itself decide which conflicting history is canonical. Nexo therefore needs both history-consistency evidence and authority/quorum evidence.

Membership finding:
Adding/removing/replacing a device changes authority and is itself a security transition. Device replacement needs explicit incarnation transition and retirement/revocation of the old incarnation.

Clone finding:
Three signatures are not necessarily three independent authorities if the same key/state was cloned. Quorum must account for independent protected identities/incarnations.

New invariant:
CANONICAL_ROOT_COMMIT requires BOTH valid root-transition evidence AND valid authority evidence for the current membership/incarnation configuration.

Code study:
Canonical repo search did not establish a verified runtime implementation of this multi-device authority model. No implementation/security guarantee is claimed. Future architecture claims must trace actual persistence, recovery, fencing, identity/incarnation, membership and external-effect boundaries.

Historical residuals AB50→AB58 remain unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
- multiple signatures != independent quorum
- local epoch != canonical authority
- offline branch != canonical commit
- Merkle consistency != authority selection
- membership list != secure membership transition
- replacement != clone
- no silent fork merge
- no timestamp/arrival tie-break
- no V21
- no unsupported verification claims

## EXACT NEXT ACTION — AB104.204
Attack quorum reconfiguration and recovery: membership add/remove, overlapping quorums, partition during reconfiguration, compromised-member removal, device replacement/key rotation, unavailable quorum recovery, offline/canonical reconciliation, and minimum evidence required to leave QUARANTINE.

## CONTINUITY
Next CONTINUITY resumes directly at AB104.204. Preserve all UNKNOWN/PENDING states and AB50→AB58 residuals; do not restart AB104.203.
