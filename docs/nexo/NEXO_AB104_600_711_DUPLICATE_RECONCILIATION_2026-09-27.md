# NEXO AB104.600–711 DUPLICATE ARTIFACT RECONCILIATION
Date: 2026-09-27
Status: RECONCILED AT ARTIFACT LEVEL; HISTORICAL DUPLICATES PRESERVED

## Result
The suspected continuity problem is confirmed as a pattern of sequential commits that introduce alternate artifacts under the same AB number. The later commits are direct descendants of the earlier commits in each inspected pair (ahead_by=1, behind_by=0). This is sequential duplicate/alternate artifact creation, not branch divergence.

## AB104.666
Two artifacts exist: FAULT_PROXY_EXISTING_TEST_PATTERNS and FAULT_PROXY_EXISTING_TEST_PATTERN.
Both describe the same research area. The later artifact is a refinement/rewording with slightly different emphasis on the existing integration pattern.
Classification: DUPLICATE/REFINEMENT ARTIFACT. Preserve both. The later artifact is the more recent refinement, but the earlier one remains historical.

## AB104.679
Two artifacts conflict materially on the frozen identity contract.
Earlier EFFECT_IDENTITY: key=effectId, value=effectId, plus nexo-effect-id header; verifier requires all three.
Later UNIQUE_EFFECT_IDENTITY: key=effectId, value=effectId+|payload, with header not required.
These are materially different experimental contracts and cannot be silently merged.
Classification: CONFLICTING ALTERNATE SPECIFICATIONS. Canonical identity contract = UNKNOWN/PENDING until reconciled against subsequent AB104.680–691 evidence. No implementation may assume either one solely from the AB104.679 number.

## AB104.692
Two artifacts describe the same terminal-duplicate policy. The later artifact adds explicit caveats: no exactly-once claim, no verifier offset commit, and explicit handling of truncation before a match.
Classification: REFINEMENT. Later artifact is the stronger/current research formulation; earlier remains historical evidence.

## AB104.706
Two artifacts describe the same setup-authority boundary. The later artifact is a shorter reformulation; both agree that beginningOffsets/ListOffsets and resolved position are setup evidence, not effect evidence, and that setup failure cannot become NOT_OBSERVED.
Classification: DUPLICATE/REFINEMENT. Later formulation can be treated as current wording; earlier remains preserved.

## AB104.711
Two artifacts are materially different in state semantics.
Earlier artifact introduces LOG_TRUNCATION_UNRESOLVED for truncation after observation begins.
Later artifact introduces SETUP_POSITION_INVALID for inability to establish the intended starting coordinate, with a stricter auto.offset.reset=none rule.
These are not identical states: they correspond to different timing points in the verifier lifecycle.
Classification: COMPLEMENTARY BUT UNMERGED STATES. Retain both as distinct timing cases. The combined state model remains PENDING until AB104.712 research resolves whether they need separate states or a parameterized reason.

## AB104.688 / AB104.697
No persisted AB artifact was found in the 600–711 comparison for these numbers. Their historical research conclusions remain UNSAVED/UNKNOWN as persisted continuity. Do not treat them as saved evidence merely because they were discussed in chat.

## AB104.601 supporting artifact
The separate research/AB104_601_DERIVED_CACHE_HELPER_DEPENDENCY_LEAKAGE artifact is supporting research, not automatically a second AB104.601 step. It remains linked as supporting evidence to the canonical AB104.601 audit.

## Canonical continuity consequence
AB104.600–711 is NOT a clean one-file-per-AB sequence. Future CONTINUITY recovery must use artifact classification, not filename numbering alone.

Rules frozen:
- duplicate/refinement artifacts are preserved;
- conflicting specifications remain UNKNOWN/PENDING until reconciled;
- complementary lifecycle states may coexist and must not be collapsed;
- no implementation proceeds from an unresolved conflicting specification;
- historical chat text cannot promote an unsaved artifact to canonical evidence.

## Next exact action
Continue reconciliation by checking AB104.680–691 against the AB104.679 identity conflict, then AB104.693–711 against the two truncation timing states. Only after those dependency checks should AB104.712 define the next research question.
