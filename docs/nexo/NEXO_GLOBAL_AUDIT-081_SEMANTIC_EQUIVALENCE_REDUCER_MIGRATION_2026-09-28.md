# NEXO GLOBAL AUDIT-081 — Semantic Equivalence, Reducer Migration and Provenance-Preserving Replay

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-081 studies cross-version reducer equivalence, observational equivalence, migration refinement, lossless versus lossy compaction, provenance-preserving replay, fork/rejoin adversaries, and whether equivalence evidence can legitimately reduce the independence UNKNOWN without collapsing FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Findings

### 1. Equivalence is claim-relative

W3C PROV gives a concrete formal notion of equivalence: valid instances can be normalized and compared through isomorphic normal forms. It also explicitly notes that equivalent instances may be treated differently by applications whose semantics depend on syntax, such as digital signing. Therefore a generic equality relation cannot be assumed to preserve every Nexo-relevant observation.

EQUIVALENT-PROV != EQUIVALENT-FOR-EVERY-CLAIM
NORMAL-FORM-EQUALITY != UNIVERSAL-SEMANTIC-EQUIVALENCE

### 2. Reducer migration

A reducer migration can preserve output while changing the semantic path that produced it. Conversely, outputs can differ syntactically while preserving a defined claim.

Avro gives a concrete boundary: Parsing Canonical Form defines schema sameness for a particular parsing purpose, while compatibility also depends on data and serialization format. Thus canonical equivalence is purpose-scoped, not universal semantic equivalence.

SAME OUTPUT != SAME REDUCER SEMANTICS
CANONICAL SCHEMA EQUALITY != UNIVERSAL SEMANTIC EQUALITY
SCHEMA COMPATIBILITY != CLAIM EQUIVALENCE

For Nexo, reducer-version comparison must therefore name the observation contract being preserved.

### 3. Observational equivalence

A useful research distinction emerges:

Two transformations may be observationally equivalent only relative to a declared observer/claim interface.

If a future observer can distinguish information that the current contract ignores, the transformations are not universally equivalent.

CANDIDATE:
T1 ≈_O T2 only if every observation admitted by observer contract O yields equivalent claim-relevant behavior.

This is research notation only, not frozen Nexo mathematics.

### 4. Lossless versus lossy compaction

A compaction can be lossless for one query and lossy for another.

Therefore “lossless” must be bound to:
- source domain;
- claim/observer contract;
- historical interval;
- retained provenance;
- reconstruction method;
- version/epoch;
- known loss set.

LOSSLESS-FOR-O != LOSSLESS-GLOBALLY
RECONSTRUCTABLE-FOR-C != RECONSTRUCTABLE-FOR-ALL-C

### 5. Provenance-preserving replay

Replay can reproduce a prior projection without proving that the replay environment has recovered the complete original history.

A replay result should not automatically become new evidence. Its evidentiary weight depends on whether the replay introduces an independent observation or merely re-executes the same source and reducer lineage.

REPLAYED OUTPUT != NEW OBSERVATION
DETERMINISTIC REPLAY != INDEPENDENT EVIDENCE

W3C PROV's provenance model is useful here because derivation and activity relationships remain part of the history rather than being replaced by the final value alone.

### 6. Fork/rejoin adversary

Two reducer histories can fork from a shared checkpoint and later converge to identical output. Identical output does not prove identical historical path.

A rejoin operation must not silently manufacture an event ordering that was absent from the source histories.

IDENTICAL OUTPUT != IDENTICAL HISTORY
FORK + REJOIN != PROVEN CONTINUITY
MERGEABLE STATE != MERGEABLE PROVENANCE

### 7. Version transitions

Version numbers are lineage identifiers, not semantic proofs.

A version transition can be:
- compatible for one observer contract;
- incompatible for another;
- unknown where historical semantics are unavailable.

in-toto's current attestation specification illustrates scoped versioning: predicate types carry SemVer-style versions and TypeURI major versions, while unrecognized fields may be ignored under specified parsing rules. This is evidence that version compatibility is defined by the relevant layer/contract, not by version numbers alone.

VERSION METADATA != SEMANTIC PROOF
COMPATIBLE-LAYER != COMPATIBLE-WORLD

### 8. Independence reduction

Equivalence evidence can reduce an UNKNOWN only when the equivalence itself is established over the exact claim-observable boundary and its dependency closure is known.

If equivalence was produced by the same reducer, same checkpoint, same source, or same common-mode authority, the equivalence certificate is not an independent observation of that boundary.

A safe research rule is:

INDEPENDENCE UNKNOWN
-> may become bounded/conditional only if
(a) claim-observable semantics are explicitly defined,
(b) transformation equivalence is proven for that observer,
(c) dependency lineage is closed enough for the equivalence proof,
(d) no unresolved common-mode overlap remains.

Otherwise UNKNOWN remains.

### 9. FutureObs_PAA

Even a perfect equivalence proof for a historical transformation does not prove future finality.

It can show:
“these two representations are equivalent for observer O over history H.”

It cannot by itself show:
“no future observation can distinguish the claim.”

HISTORICAL OBSERVATIONAL EQUIVALENCE != FUTURE FINALITY
EQUIVALENCE PROOF != FUTUREOBS_PAA CLOSURE

## Research-only candidate boundary

For a transformation/refinement relation, record at least:

- source representation/version;
- target representation/version;
- transformation identity/version;
- observer contract;
- claim scope;
- historical interval;
- provenance/dependency lineage;
- retained and omitted information;
- reconstruction contract;
- authority/epoch/incarnation;
- equivalence/refinement evidence;
- common-mode dependencies;
- revocation/supersession state.

This is not a protocol specification.

## Verdict

Audit-081 does not close P_AA quotient congruence, independence proof, dependency completeness, retention/reconstruction soundness, or FutureObs_PAA.

Global epistemic state remains:

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

## External evidence

- W3C PROV Constraints: formal normalization, validity and equivalence of provenance instances, plus event-order constraints.
- Apache Avro specification: Parsing Canonical Form is purpose-specific; schema compatibility depends on data and encoding.
- in-toto Attestation v1.2: layer-specific semantics and versioning.
- TUF evidence retained from prior audits for bounded anti-rollback/freeze semantics.

## Next exact mission

GLOBAL-AUDIT-082 — adversarial equivalence certificates:
certificate independence, proof reuse, proof composition, refinement transitivity, observer-contract changes, reducer rollback/upgrade, replay determinism, checkpoint retention loss, and whether equivalence certificates can be selectively revoked without corrupting historical decisions or FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
