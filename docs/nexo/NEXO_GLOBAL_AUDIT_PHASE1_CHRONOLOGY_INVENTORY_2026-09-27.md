# NEXO Global Audit — Phase 1: chronology and artifact inventory

Date: 2026-09-27
Scope: AB1 → AB104.744
Status: AUDIT IN PROGRESS. No implementation. No V21.

## Method

The repository Git tree was inspected recursively rather than relying on the `docs/nexo` directory endpoint, because that endpoint can be truncated by its result limit. The recursive Git tree returned 1,557 entries and was not truncated.

This phase inventories artifact presence and numbering only. Presence of an artifact is not evidence that its claim is correct or that associated tests executed.

## Initial inventory

- Recursive Git tree entries: 1,557
- Nexo AB/A-related paths identified: 980
- Clean-architecture A01-A14 artifacts: 10
- Continuity-related paths: 404
- AB major identifiers present: 90 of 104
- AB major identifiers not found by filename/path pattern: 1,2,3,4,5,6,11,75,78,79,81,101,102,103

Important: a missing major identifier in the current tree is NOT yet proof that the historical AB never existed. It is a reconstruction gap requiring commit/history search.

## AB1–AB100 chronology signal

Recoverable current-tree filenames begin at AB7. AB7–AB35 are mostly single primary research artifacts. AB36 is a multi-artifact research block with lettered sub-artifacts (AB36A through at least AB36Y), including TLA material. AB37–AB49 continue the PAA/quotient/refinement line.

AB50–AB56 are present as the major research chain. AB52 has two research artifacts. AB55 has a continuity markdown artifact plus executable interpreter. AB57–AB58 have executable/semantic-audit artifacts. AB59–AB100 are primarily continuity/recovery/research artifacts, with several multi-artifact checkpoints.

Known chronology evidence from commit search:
- AB50 commit: d9d6ae59574e43af7d75891208189864aeb7798c
- AB60 commit: c23c77056b727b2c961a6b62c675b317fa8df0d3
- AB61 has multiple checkpoint/reproduction/repair commits, including a348f1e67461c26074075d39fdca189fd9cac5f9
- AB62 has multiple gate-runner commits
- AB99 commit: a39d2b17ecdd806d1a90a995e27cb8afa2639874
- AB100 replay-aware repair harness commit: 4e3798e061b2386486c989eb522a2b61d1661653
- AB104.5 audit commit: b8f700f8ae68766f3a748ecd0f867d66556b2fa7

This confirms that AB identifiers are not one-commit/one-file units. The global audit must model each AB as an evidence bundle with possible checkpoint, source, execution, repair and reconciliation artifacts.

## AB104 chronology signal

Current tree contains 851 paths matching AB104.<number>, with:
- minimum observed number: AB104.2
- maximum observed number: AB104.744
- unique numeric identifiers: 654
- numeric gaps: 89
- duplicate-number groups: 185

Representative known duplicate-number groups include:
- AB104.368: four artifacts, including two differently named research artifacts plus continuity/correction artifacts.
- AB104.450: two differently named artifacts.
- AB104.508: two differently named artifacts.
- AB104.517: two differently named artifacts.
- AB104.520: two differently named artifacts.
- AB104.570: two differently named artifacts.
- AB104.571: two differently named artifacts.
- AB104.589/593/594/596: model/result artifacts coexist with markdown audits; these are not automatically duplicate research claims.
- AB104.600: three artifacts including duplicate reconciliation and VersionSet research.
- AB104.666, .679, .692, .698, .706, .711, .727: multiple similarly scoped artifacts requiring reconciliation.
- AB104.744: the research artifact and the global-audit kickoff both match the numeric token; the global-audit kickoff is NOT itself evidence of OFLE research.

AB104 numeric gaps include early and middle ranges; examples include 15, 19, 86, 89, 91–95, 97, 154–164, 168–196, 256–263, 298, 429, 458–482, 522, and 688. A gap may represent an intentional reserved/renumbered/replaced step or an unrecorded artifact; no closure conclusion is made in Phase 1.

## Critical audit implication

The AB sequence cannot safely be treated as a simple linear chain.

Observed structure:
1. Some AB numbers have one primary research artifact.
2. Some numbers have multiple artifacts with different roles.
3. Some numbers have checkpoint/reconciliation/correction artifacts carrying the same numeric identifier.
4. AB104 contains large gaps and duplicate numeric identifiers.
5. Some missing major identifiers may be historical artifacts that were never committed under the current naming scheme.

Therefore the canonical unit for the global audit will be:

`AB identifier + artifact set + commit lineage + evidence role + correction/reconciliation history`

not merely the latest filename containing that number.

## Phase-1 epistemic status

CHRONOLOGY_RECONSTRUCTED = PARTIAL
ARTIFACT_INVENTORY = YES
ALL_HISTORICAL_ABS_RECOVERED = NO
MISSING_MAJOR_ABS_RESOLVED = NO
AB104_GAPS_CLASSIFIED = NO
DUPLICATE_AB_NUMBERS_RECONCILED = NO
CLAIM_LEDGER = NOT_STARTED
CONTRADICTION_LEDGER = NOT_STARTED
ARCHITECTURE_LINEAGE_AUDIT = NOT_STARTED
IMPLEMENTATION = BLOCKED
V21 = BLOCKED

## Exact next phase — GLOBAL-AUDIT-003

1. Recover the missing major AB identifiers (AB1–6, AB11, AB75, AB78–79, AB81, AB101–103) through commit history and older artifact names.
2. Build the AB50–AB100 artifact/commit lineage because this is the most continuity-sensitive historical segment.
3. Reconcile the already-known AB104.600–711 duplicate/conflict bundle against its own reconciliation records.
4. Only after chronology is stable, begin claim-level semantic auditing.

No implementation. No V21.
