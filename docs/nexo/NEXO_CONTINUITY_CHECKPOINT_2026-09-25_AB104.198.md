# NEXO — CONTINUITY CHECKPOINT AB104.198
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Canonical repository
snowdenxrp/aldea-ia
main

## AB104.197 carryover
CommitRecord != permission to repeat.
A verified durable CommitRecord drives reconstruction/materialization; it never authorizes re-execution of the original effect.

## AB104.198 persisted research
File:
docs/nexo/NEXO_AB104_198_COMMITRECORD_INTEGRITY_AUTHENTICITY_CORRUPTION_ATTACK_V1_2026-09-25.md
Commit:
4d5e79d100942421275785315e95e9d47ab98046

Core result:
A CommitRecord cannot be trusted merely because it exists or parses.

Recovery must distinguish:
1. CONTENT INTEGRITY
2. PROVENANCE/AUTHENTICITY
3. LINEAGE
4. SEMANTIC COMPATIBILITY
5. CURRENT AUTHORITY

Digest integrity does not prove authorship. Internal hash chaining does not establish canonical lineage without an independently trusted anchor. A cryptographically valid historical record can be non-current. Missing/truncated predecessors are not to be fabricated. A valid record incompatible with materialized state enters inconsistency/quarantine analysis rather than rewriting history.

Candidate verification pipeline:
trusted anchor -> canonical parse -> structural completeness -> integrity -> authenticity -> sequence/predecessor lineage -> operation/effect binding -> VersionSet/prepared-intent compatibility -> authority/resource/STOP checks -> reconstruction eligibility -> idempotent materialization -> convergence verification -> recovery complete.

If the authoritative record cannot be verified:
- do not promote it to authoritative committed state;
- do not execute the original effect;
- classify as unverified/quarantined/incomplete according to evidence.

SQLite WAL research cross-check:
- valid frames use salts and cumulative checksums;
- recovery scans forward and stops at the first invalid checksum;
- last valid commit frame determines the recovered WAL boundary;
- WAL-index is reconstructed from persistent WAL rather than trusted as the authoritative history.
These are reference semantics, not Nexo proof.

Transparency-log research cross-check:
Merkle roots + inclusion/consistency proofs demonstrate useful separation between integrity, append-only lineage, and signed authority. This is a reference model, not a technology decision.

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
- Do not treat CommitRecord existence/parseability as trust.
- Do not equate digest with authenticity.
- Do not equate historical authenticity with current authority.
- Do not use timestamps as sole ordering authority.
- Do not silently select between conflicting valid histories.
- Do not rewrite historical evidence to fit materialized state.
- Do not execute an effect because CommitRecord verification fails.
- Do not implement V21.
- Do not claim CI/formal verification/fault-injection success without evidence.

## EXACT NEXT ACTION — AB104.199
Attack trust-anchor continuity:
1. root/checkpoint authenticity and rotation;
2. key compromise/revocation;
3. valid-but-superseded roots;
4. two valid conflicting roots;
5. rollback to an older trusted root;
6. divergent cross-device histories;
7. minimum protected anchor preventing a forged/replayed complete history from becoming canonical.

## CONTINUITY RULE
Next chat receiving CONTINUITY must resume at AB104.199, preserve all UNKNOWN/PENDING states and historical residuals, and not restart or propose implementation prematurely.
