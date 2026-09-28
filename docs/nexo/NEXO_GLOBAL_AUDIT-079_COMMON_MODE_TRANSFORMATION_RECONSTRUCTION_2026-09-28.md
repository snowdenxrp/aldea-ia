# NEXO GLOBAL AUDIT-079 — Common-Mode Evidence Under Transformation and Reconstruction

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

This audit tests whether evidence that is duplicated, normalized, migrated, compacted, re-attested, reduced, or reconstructed can legitimately become independent evidence, and how selective revocation should propagate through those transformations.

No Nexo implementation is proposed. No V21. No semantic freeze.

## Findings

### 1. Derived-record duplication

A second record derived from the same source observation does not create a second evidence root. Representation multiplicity is not evidentiary independence.

DERIVED DUPLICATE != INDEPENDENT EVIDENCE
SECOND RECORD != SECOND OBSERVATION

### 2. Normalization and equivalence

W3C PROV defines normalization and equivalence for valid provenance: equivalent valid instances can differ syntactically while preserving the same normalized information. This gives a concrete warning for Nexo: syntactic diversity after normalization must not be counted as evidence diversity. PROV equivalence is also application-specific when deciding how equivalent representations should be treated operationally.

NORMALIZATION != NEW EVIDENCE
EQUIVALENT REPRESENTATIONS != INDEPENDENT SUPPORT

PROV also requires event-order consistency and rejects histories containing an impossible strict-precedence cycle.

### 3. Migration and compaction

Apache Iceberg demonstrates that snapshot/metadata retention and manifest reuse are explicit lifecycle mechanisms: manifests may be reused across snapshots, while snapshot expiration removes historical snapshots according to retention policy. A rewritten representation can therefore preserve a current data view while losing historical distinctions needed for a later claim.

CURRENT RECONSTRUCTION != HISTORICAL COMPLETENESS
COMPACTION SUCCESS != SEMANTIC PRESERVATION
RETAINED VIEW != RETAINED PROVENANCE

A migration/compaction is admissible for a claim only if the claim-relevant distinctions are preserved or reconstructible under an explicit historical contract. Otherwise the result must remain UNKNOWN for that boundary.

### 4. Shared attestation roots

in-toto separates envelope authentication, statement/subject binding, predicate semantics, and bundles. Subjects are bound by digest; predicates can carry arbitrary type-specific metadata. This supports a useful dependency distinction: multiple authenticated statements may still share the same subject, producer, predicate semantics, upstream material, or attestation root.

MULTIPLE ATTESTATIONS != MULTIPLE INDEPENDENT ROOTS
SUBJECT DIGEST EQUALITY != EVIDENCE INDEPENDENCE
AUTHENTICATED != SEMANTICALLY INDEPENDENT

Thresholds in an attestation workflow likewise do not automatically establish independent observations if the attestations share claim-relevant upstream dependencies.

### 5. Shared observation sources

Different readers, scanners, replicas, or observers that consume the same underlying source snapshot should not be treated as independent merely because their records or signatures differ.

Candidate dependency identity must therefore include source observation identity, source incarnation/epoch, acquisition checkpoint, transformation lineage, and common upstream dependencies.

### 6. Common reducers

A common reducer can create many projections from one evidence set. Agreement between those projections does not establish independence if they share the same reducer inputs or semantic assumptions.

COMMON REDUCER != INDEPENDENT REDUCERS
DETERMINISTIC AGREEMENT != INDEPENDENT CONFIRMATION

A reducer's own correctness is not established by producing stable output.

### 7. Reconstruction checkpoints

TUF provides a concrete anti-rollback example: python-tuf tests explicitly preserve rollback checking even when local timestamp metadata has expired. Thus metadata can be unusable for one acceptance purpose while still carrying information necessary for another security check.

This reinforces a claim-relative treatment of historical artifacts:

EXPIRED-FOR-ADMISSION != USELESS-FOR-ALL-ANALYSIS

Reconstruction must preserve the distinction between current admissibility and historical evidence dependency.

### 8. Independence after transformation

Independence must be evaluated after tracing transformations backward, not from the final records. A safe research boundary is:

1. identify the claim;
2. trace every claim-supporting transformation backward;
3. identify shared source observations, trust roots, attestation roots, checkpoints, membership registries, mappings and reducers;
4. bind those dependencies to epoch/incarnation and scope;
5. account for information loss introduced by normalization, migration, compaction or reconstruction;
6. only then evaluate whether remaining support paths are independent.

If any claim-relevant overlap or lost-history condition is unresolved, independence remains UNKNOWN.

### 9. Selective revocation propagation

Revoking a shared dependency must not automatically revoke every downstream claim. Propagation should affect only claims for which the dependency lies in the current admissibility closure, overlaps the claim's semantic scope/interval/incarnation, and is necessary to every currently admissible support path.

If an independent sufficient path remains, the claim need not be revoked solely because another path failed.

SHARED DEPENDENCY != UNIVERSAL REVOCATION
REVOCATION AUTHENTICITY != REVOCATION IMPACT

Historical decisions and provenance must remain intact even when the current claim projection changes.

### 10. Quorum interaction

A quorum of transformed records can still be one evidentiary dependency if the records share the same source, checkpoint, reducer, trust root, or common observation. Signature count and observer count therefore remain insufficient to prove evidence diversity.

QUORUM COUNT != INDEPENDENT COVERAGE
THRESHOLD AUTHENTICATION != EVIDENCE INDEPENDENCE

### 11. FutureObs_PAA boundary

None of the above closes FutureObs_PAA. Transformation equivalence, authenticated attestation, anti-rollback, retention policy, or reconstructed history can establish bounded properties about preserved evidence, but they do not prove that no claim-relevant future observation can reopen the claim.

TRANSFORMATION CLOSURE != FUTURE FINALITY
RECONSTRUCTION COMPLETENESS != FUTUREOBS_PAA CLOSURE

## Candidate research-only dependency model

A transformed evidence node may need, at minimum:

- EvidenceID
- UnderlyingSourceID
- SourceIncarnation/Epoch
- Observation/Occurrence identity
- Transformation/Derivation lineage
- Normalization or equivalence relation
- Migration/Compaction version
- Reconstruction checkpoint
- Attestation/Trust root
- Scope and claim interval
- Membership/population contract
- Reducer identity/version
- LossSet / reconstruction completeness
- Revocation/supersession dependencies
- CommonModeGroup or overlap relation

This is NOT a frozen protocol and is not an implementation specification.

## Verdict

P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

## Mandatory AB55/AB56 carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.

AB56 specified the missing interpreter but did not close FutureObs_PAA.

The carryover remains an explicit unresolved task and must not be silently absorbed by later audits.

## External evidence

- W3C PROV Constraints: normalization, validity, equivalence, event-order constraints and strict-cycle detection.
- in-toto Attestation Framework v1.2: separated envelope/statement/predicate/bundle layers and digest-bound subjects.
- TUF specification and python-tuf tests: version/expiry/rollback/freeze semantics and preservation of rollback checks with expired local metadata.
- Apache Iceberg format: snapshot retention, manifest reuse, metadata history and expiration; RewriteManifests preserves the active-file set while creating a new snapshot.

## Next exact mission

GLOBAL-AUDIT-080 — attack the remaining boundary from the other direction:
transformation-induced false independence, semantic-loss certificates, reducer version transitions, checkpoint fork/rejoin, attestation-chain common roots, selective revocation under reconstructed history, quorum over transformed evidence, and whether any bounded closure can legitimately constrain FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
