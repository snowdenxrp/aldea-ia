# NEXO AB104.706/711 — duplicate artifact reconciliation
Date: 2026-09-27
Status: RECONCILED / NO IMPLEMENTATION

## AB104.706
Two files were compared exactly.
- Earlier: NEXO_AB104_706_SETUP_AUTHORITY_BOUNDARY_2026-09-27.md
- Later: NEXO_AB104_706_OFFSET_SETUP_AUTHORITY_BOUNDARY_2026-09-27.md
- Ancestry: later commit a5f85ed7d9846a046e5eeb44d2696697a31729c4 is one commit ahead of 73e5d2a1997d8a7aa3ae23d3972268c7a50ae0fa.
- Classification: REFINEMENT, not conflict.
- Common invariant: beginningOffsets is setup/diagnostic evidence; seekToBeginning is lazy; position() can perform remote initialization; successful position establishes the verifier starting coordinate; none of this proves effect presence/absence.
- Later artifact adds the explicit distinction that position() is a broker interaction and freezes the timing/setup-failure boundary.
- Resolution: retain both historical artifacts; use the later formulation as the current refined statement. Do not delete or overwrite the earlier record.

## AB104.711
Two files were compared exactly.
- Earlier: NEXO_AB104_711_LOG_TRUNCATION_BOUNDARY_2026-09-27.md
- Later: NEXO_AB104_711_TRUNCATION_EPISTEMIC_BOUNDARY_2026-09-27.md
- Ancestry: later commit 68feba7e4759cf233ec955169837269a552913f9 is one commit ahead of dafc39549dc4982bc780587c40ea1b1d1a170abb.
- Classification: REFINEMENT WITH COMPLEMENTARY STATES.
- Earlier defines LOG_TRUNCATION_UNRESOLVED after observation has begun and preserves the fact that continuity was disrupted.
- Later defines SETUP_POSITION_INVALID when the intended starting coordinate cannot be established before observation.
- Resolution: both states are valid at different lifecycle points. Do not merge them into one generic absence state. Keep both historical artifacts; current model distinguishes setup invalidation from post-start truncation.

## Evidence chain
AB104.679 resolution is supported by downstream AB104.680-691: exact UTF-8 header, stable key/value identity, producer-batch identity stability, and exact-one-header conjunction. AB104.706/711 now likewise preserve lifecycle-specific epistemic distinctions.

## Historical gaps
AB104.688 and AB104.697 remain UNSAVED historical research gaps. No commit is claimed for them.

## Next
AB104.712: inspect exact Kafka LogTruncationException metadata/recovery semantics and determine the minimum evidence needed to distinguish ordinary invalid offset from actual truncation without overclaiming causality.
