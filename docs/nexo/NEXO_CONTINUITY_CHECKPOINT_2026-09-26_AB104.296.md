# NEXO CONTINUITY CHECKPOINT — AB104.296

Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main

## Completed
- AB104.296 researched: canonical payload fingerprints, semantic equivalence, serialization stability, and schema migration boundaries.
- Research commit: d23730974cf3a996e83c4eb2b447eba3bebe695a

## Carry-forward
- Byte equality and semantic equality are different claims.
- Canonicalization can stabilize representation fingerprints but does not define application-level semantic equivalence.
- Fingerprints should bind the canonicalization/schema/version used to produce them.
- Migration must not silently preserve an old fingerprint unless an authenticated semantic-preservation contract establishes equivalence.
- Candidate layers: representation digest, canonical payload digest, optional semantic-operation digest. Exact scheme UNSELECTED.
- Fingerprint match proves equality under the specified representation/version, not automatically semantic equivalence.

## Constraints
Research only. No architecture implementation, formal verification, semantic freeze, V21 patching, overwrite/delete, or silent migration. Preserve AB50→AB58 unresolved findings.

## Next exact action
AB104.297 — study semantic-equivalence contracts for schema migration and whether migrated payloads can safely retain original operation identity/fingerprint without replay or collision ambiguity.

## DO-NOT-REPEAT
- Canonicalization != semantic equivalence.
- Schema migration != automatic fingerprint equivalence.
- Same operation ID + changed fingerprint must not silently become a retry.