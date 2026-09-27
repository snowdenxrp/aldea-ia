# NEXO CONTINUITY AUDIT — AB104.600→AB104.711

Date: 2026-09-27
Status: AUDIT IN PROGRESS / NO SILENT REPAIR

## Canonical repository comparison
Compared main from AB104.600 commit 3a1e7c87d35a2647b4d20c9b0d43bae860346938 through AB104.711 commit 68feba7e4759cf233ec955169837269a552913f9. GitHub reports 163 commits ahead in this interval.

## Confirmed duplicate artifact-number anomalies
The comparison exposes multiple AB numbers with more than one similarly numbered artifact:
- AB104.666: NEXO_AB104_666_FAULT_PROXY_EXISTING_TEST_PATTERNS_2026-09-27.md and NEXO_AB104_666_FAULT_PROXY_EXISTING_TEST_PATTERN_2026-09-27.md
- AB104.679: NEXO_AB104_679_EFFECT_IDENTITY_2026-09-27.md and NEXO_AB104_679_UNIQUE_EFFECT_IDENTITY_2026-09-27.md
- AB104.692: NEXO_AB104_692_DUPLICATE_EFFECT_IDENTITY_2026-09-27.md and NEXO_AB104_692_DUPLICATE_IDENTITY_TERMINAL_2026-09-27.md
- AB104.706: NEXO_AB104_706_OFFSET_SETUP_AUTHORITY_BOUNDARY_2026-09-27.md and NEXO_AB104_706_SETUP_AUTHORITY_BOUNDARY_2026-09-27.md
- AB104.711: NEXO_AB104_711_LOG_TRUNCATION_BOUNDARY_2026-09-27.md and NEXO_AB104_711_TRUNCATION_EPISTEMIC_BOUNDARY_2026-09-27.md

These are preserved. They are not automatically treated as two independent AB steps, and neither is deleted. Exact content comparison is required before canonical selection.

## Missing persisted AB artifacts requiring investigation
The comparison output contains no AB104.688 artifact and no AB104.697 artifact, matching the known history that those two research steps were reported as unsaved. They remain UNKNOWN/PENDING as persisted continuity, not silently promoted to saved evidence.

## Additional artifact pattern
AB104.601 has both the AB104.601 provenance audit artifact and a separate research artifact named AB104_601_DERIVED_CACHE_HELPER_DEPENDENCY_LEAKAGE. This is not automatically a duplicate AB state; it must be classified as supporting research vs canonical AB artifact after content review.

## Critical correction
The audit shows that the continuity problem is broader than AB104.706 and AB104.711. Therefore the canonicality gate must cover the full AB104.600→AB104.711 range before AB104.712.

## Research evidence boundary
Official Apache Kafka current source confirms that consumer position, beginning offsets, seekToBeginning, endOffsets, and auto.offset.reset are distinct mechanisms; invalid offsets with reset=none produce an exception rather than silent repositioning. This supports the technical distinction used in AB104.709–711, but does not prove Nexo correctness or any implementation execution.

## Next exact action
Reconcile duplicate artifacts in this order: 601 supporting artifact, 666, 679, 692, 706, 711. For each: fetch exact contents, compare claims/evidence, identify ancestry, classify canonical/supporting/retry, and record result. Then separately record unsaved 688/697 as historical gaps. Only after this reconciliation may AB104.712 continue.
