# NEXO — CONTINUITY CHECKPOINT AB104.199
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Canonical repository
snowdenxrp/aldea-ia
main

## AB104.198 carryover
CommitRecord != permission to repeat.
A verified durable CommitRecord may drive reconstruction/materialization; it never authorizes re-execution of the original effect.

## AB104.199 persisted research
File:
docs/nexo/NEXO_AB104_199_TRUST_ANCHOR_CONTINUITY_ROOT_ROTATION_ATTACK_V1_2026-09-25.md
Commit:
d8bbc9ebcc98c74f50eed67a1bcadc84d1cba57a

Core result:
The trust anchor is a separate security object. A completely self-consistent CommitRecord history is not enough if an attacker can replace the root/checkpoint that defines canonical lineage.

Research establishes the need to distinguish:
- historical validity vs current root;
- root signature validity vs authenticated root transition;
- monotonic sequence vs authority;
- current root vs superseded/revoked/compromised root;
- one valid history vs conflicting valid histories.

TUF cross-check:
Root metadata controls trusted keys and thresholds; rollback/freeze and key-compromise handling are explicit security concerns. Root compromise can require out-of-band recovery. Snapshot-style binding is a useful reference for preventing mixed-state histories. Reference evidence only; no technology selected.

RFC 9162 cross-check:
Signed tree heads bind roots to authority; consistency proofs establish append-only continuity; inconsistent views across observers remain a separate concern.

NIST cross-check:
Trust anchors are authoritative rather than derived from the chain being validated; key revocation terminates authorized use before normal expiry, including compromise response.

## Minimum conceptual protected anchor
A protected anchor must, at minimum, be independently trusted, identity/scope bound, freshness-aware, capable of authenticating root transitions, resistant to ordinary history rewrite, retained long enough to detect rollback, and usable during partial-history recovery.

Exact mechanism remains OPEN.

## Code/repository study
Canonical repository and latest AB104.198 persistence were verified. The current AB104.198 material is research/checkpoint documentation; no trust-anchor implementation is being claimed. No code implementation was changed in AB104.199.

Code-study rule:
Do not infer security properties from names/types/docs alone. Future implementation claims require tracing actual read/write/verification boundaries and fresh execution evidence.

## Historical residuals MUST remain visible
AB50→AB58:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED

## DO-NOT-REPEAT
- signed root != current root
- higher sequence != authority
- timestamp != sole freshness authority
- root replacement requires an explicit independently verifiable transition rule
- valid old root != permission to roll back
- never silently choose between valid conflicting roots
- never merge divergent device histories without evidence
- never execute effects during root uncertainty
- no V21
- no unsupported formal/CI/fault-injection claims

## EXACT NEXT ACTION — AB104.200
Attack crash/freshness persistence at root transition:
1. crash between accepting R(n+1) and persisting freshness;
2. crash after freshness persists but before root metadata persists;
3. torn root writes;
4. replay after power loss;
5. concurrent recoverers installing a new root;
6. restore from older backup;
7. device cloning;
8. minimum atomic durable tuple preventing rollback/split-brain after crash.

## CONTINUITY RULE
Next chat receiving CONTINUITY resumes at AB104.200. Preserve all UNKNOWN/PENDING states and AB50→AB58 residuals. Do not restart AB104.199 and do not propose implementation prematurely.
