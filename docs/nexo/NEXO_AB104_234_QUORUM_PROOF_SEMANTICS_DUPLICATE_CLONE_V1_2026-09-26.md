# NEXO AB104.234 — QUORUM PROOF SEMANTICS AND DUPLICATE/CLONE ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
A quorum proof establishes only the predicate defined by its membership, threshold, configuration and statement-binding rules. It does not automatically establish independence, honesty, freshness, canonicality, or absence of common-mode compromise.

## Threshold semantics
A threshold must count eligible identities, not raw signature records.
A single key/signing identity must contribute at most once.
A valid signature from an ineligible or revoked signer must not satisfy the threshold.
All counted signatures must bind the same statement digest.

TUF is a concrete reference: roles define trusted keys and thresholds; root transitions require thresholds from both the previously trusted and new root, and each KEYID contributes at most one signature. Reference only, not a Nexo choice. citeturn0search0turn0search2

## Duplicate and clone attacks
A proof may contain repeated signatures, aliases for one key, keys copied from one device, identities derived from one compromised authority, or signers under stale/rolled-back configuration.

Therefore:
distinct signatures != distinct authorities
distinct key IDs != independent failure domains

A future Nexo quorum contract must define the unit counted and independence assumptions separately.

## Configuration rollback
A quorum under C9 is not necessarily valid under current C10. Restoring C9 can make obsolete statements appear valid.
Required conceptual binding:
statement -> configuration identity/version -> trusted configuration lineage -> current authority/freshness.

## Split-brain
Two partitions may each satisfy a threshold under incompatible local configurations. Safety depends on whether both can simultaneously satisfy the actual authority rule, not merely whether each has a local majority.

Raft joint consensus is a useful reference because transitional decisions require majorities from both old and new configurations. citeturn0search3

## Root/key rotation
Root rotation has two checks:
1. Was the new configuration authorized by the trusted old authority?
2. Does the new configuration authorize the statement?

TUF uses thresholds from both the trusted old root and new root for root updates and prevents arbitrary version skipping. Reference mechanism only. citeturn0search2

## Evidence dependency
Multiple quorum claims can share one root, restored snapshot, authority configuration or freshness source. Counting them as independent observations would double-count one failure domain.

Candidate dependency:
claim -> signer -> authority_config -> root -> storage/anchor -> freshness source.

A decision engine should detect when several claims collapse onto common upstream dependencies.

## What quorum proof can establish
Potentially:
- enough eligible authorities signed one exact statement;
- signatures authenticate under accepted key configuration;
- threshold arithmetic is satisfied;
- statement is bound to a configuration/epoch;
- proof follows trusted configuration lineage.

## What quorum proof cannot establish by itself
- signer independence;
- signer honesty;
- uncompromised root;
- current configuration without freshness/lineage;
- absence of a competing quorum elsewhere;
- external effect occurrence;
- current permission from a historical statement.

SCITT similarly requires append-only and non-equivocation properties and separates verifiable statements/receipts from the relying-party decision about their meaning. citeturn0search1turn0search5

## Candidate quorum proof state machine
UNSEEN -> PARSED -> SIGNATURES_VALID -> MEMBERSHIP_VALID -> THRESHOLD_VALID -> CONFIGURATION_BOUND -> LINEAGE_VALID -> FRESHNESS_VALID -> AUTHORITY_ADMISSIBLE

Side states:
DUPLICATE_SIGNER
INELIGIBLE_SIGNER
REVOKED_SIGNER
STALE_CONFIGURATION
ROLLBACK
COMMON_MODE_DEPENDENCY
CONFLICTING_QUORUM
UNVERIFIED
QUARANTINED

No automatic transition from THRESHOLD_VALID to CURRENT_CANONICAL.

## Current prototype
No quorum-proof implementation was demonstrated in the inspected Nexo effect/recovery path. No architecture implementation added.

## AB50->AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
raw signature count != quorum authority
duplicate signatures != extra votes
distinct keys != independent authorities
threshold valid != current authority
old configuration valid != current configuration
root rotation != automatic authority
quorum proof != external effect proof
quorum proof != absence of competing branch
no V21
no architecture implementation
no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.235: adversarial evidence-dependency analysis — construct quorum graphs with shared roots, cloned identities, shared snapshots and correlated freshness; determine when apparently independent quorum claims must collapse into one failure domain, and inspect the actual repository for emerging authority/evidence structures.