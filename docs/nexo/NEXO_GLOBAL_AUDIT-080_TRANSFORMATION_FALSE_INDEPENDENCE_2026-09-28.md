# NEXO GLOBAL AUDIT-080 — Transformation-Induced False Independence and Reconstructed Evidence

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-080 attacks the remaining boundary from the opposite direction: whether transformations can falsely create independence, whether semantic-loss certificates can safely bound what was lost, how reducer/checkpoint versions affect evidence identity, how attestation chains share roots, how selective revocation behaves after reconstruction, and whether quorum over transformed evidence changes the FutureObs_PAA boundary.

No implementation. No V21. No semantic freeze.

## Findings

### 1. Transformation-induced false independence

A transformation can create multiple outputs from one input without creating multiple observations. Normalization can also collapse syntactic diversity into an equivalent normal form.

Therefore independence must be evaluated over the pre-transformation dependency graph, not merely the post-transformation records.

TRANSFORMATION FAN-OUT != EVIDENCE FAN-OUT
NORMALIZED DIVERSITY != INDEPENDENT OBSERVATION

W3C PROV explicitly defines normalization/equivalence and notes that equivalent valid instances can differ syntactically while conveying the same normalized information. Its event-order constraints also reject strict-order cycles.

### 2. Semantic-loss certificates

A certificate saying that a transformation lost fields or history is evidence about the transformation, not proof that every claim-relevant distinction was lost.

Conversely, a certificate saying "no loss" is insufficient unless the preservation contract defines the semantic observation boundary being preserved.

LOSS DECLARATION != COMPLETE LOSS CHARACTERIZATION
NO DECLARED LOSS != SEMANTIC PRESERVATION

A research-only LossSet therefore needs scope, source interval, transformation version, preserved/recoverable fields, known omissions, reconstruction method, and authority/provenance. This remains a candidate structure, not a protocol.

### 3. Reducer version transitions

Two reducers producing identical output do not establish semantic equivalence unless their claim-relevant semantics are shown equivalent.

A version number is useful for binding lineage but does not itself prove compatibility.

SAME OUTPUT != SAME SEMANTICS
VERSION DIFFERENCE != SEMANTIC DIFFERENCE
VERSION EQUALITY != SEMANTIC EQUIVALENCE

A reducer transition therefore becomes an evidence dependency. If the old reducer semantics cannot be reconstructed or compared for the relevant claim, independence and correctness remain UNKNOWN.

### 4. Checkpoint fork/rejoin

A checkpoint identifies a reconstruction boundary, not automatically a unique historical truth.

Forked checkpoints can represent divergent histories. Rejoining them by selecting one checkpoint, unioning records, or taking a later snapshot does not prove that the resulting history ever existed authoritatively.

CHECKPOINT IDENTITY != HISTORICAL TRUTH
FORK REJOIN != PROVEN HISTORICAL CONTINUITY
UNION OF HISTORIES != HISTORY THAT OCCURRED

TUF provides a concrete bounded example: its client workflow uses version ordering, hash binding and snapshot metadata to prevent rollback and mix-and-match attacks; these mechanisms protect defined metadata relationships but do not prove completeness of an external universe.

### 5. Attestation-chain common roots

in-toto separates envelope authentication, statement/subject binding, predicate semantics and bundles. That separation makes dependency tracing possible, but multiple authenticated attestations can still share upstream subject material, producers, predicates, checkpoints or trust roots.

MULTIPLE SIGNATURES != MULTIPLE OBSERVATIONS
ATTESTATION CHAIN != INDEPENDENT ROOT CHAIN

in-toto v1.2 explicitly defines these four layers and binds statements to subjects while leaving predicate semantics type-specific.

### 6. Selective revocation after reconstruction

A reconstructed dependency may be revoked without implying that every historical use of that dependency was invalid.

Current admissibility and historical decision validity must remain separate.

Revocation propagation should therefore evaluate:
1. dependency membership in the current claim's admissibility closure;
2. scope/interval/incarnation intersection;
3. whether the dependency is necessary to every currently admissible path;
4. whether reconstruction preserved the relevant revocation ordering;
5. whether an independent sufficient path survives.

If reconstruction lost a claim-relevant revocation boundary, the current claim should remain UNKNOWN rather than being automatically revoked or retained.

### 7. Quorum over transformed evidence

A quorum of transformed records may have one common observation root.

TUF's threshold signing rule is deliberately scoped: each key contributes at most one signature toward threshold. This prevents duplicate signatures from inflating the threshold, but threshold satisfaction itself is not evidence that the signed statements arose from independent observations.

THRESHOLD MET != OBSERVATION DIVERSITY PROVEN
UNIQUE KEYIDS != INDEPENDENT WORLD OBSERVATIONS

Therefore quorum semantics remain incomplete for Nexo.

### 8. FutureObs_PAA

Transformation, semantic-loss accounting, checkpoint integrity, attestation, revocation propagation and quorum checks can establish bounded statements about retained evidence.

None establishes that no future claim-relevant observation can occur.

Even TUF's anti-rollback/freeze machinery is bounded to defined metadata/update semantics: it rejects older versions and expired metadata under its specified workflow, but that is not a general theorem of future-world closure.

BOUNDED HISTORY INTEGRITY != FUTURE FINALITY
ANTI-ROLLBACK != FUTUREOBS_PAA CLOSURE
TRANSFORMATION COMPLETENESS != FUTUREOBS_PAA CLOSURE

## Research-only boundary extracted

For any candidate independence judgment, Nexo would need to trace:

claim
-> admissibility decision
-> reducer/projection
-> transformation lineage
-> reconstruction checkpoint
-> source observation(s)
-> attestation/trust root
-> membership/population authority
-> scope mapping
-> revocation/supersession state.

Then evaluate semantic overlap, common-mode dependencies, information loss, historical ordering, epoch/incarnation, and unresolved gaps.

A failure to establish independence is not itself proof of dependence; the safe result is UNKNOWN.

## Important negative result

Audit-080 found no justified generic algebra that converts:

- transformed evidence into independent evidence;
- a loss certificate into complete semantic-loss knowledge;
- reducer versioning into semantic equivalence;
- checkpoint rejoin into historical truth;
- threshold signatures into independent observations;
- bounded historical reconstruction into FutureObs_PAA closure.

## Global epistemic state

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

This remains an explicit unresolved task.

## Next exact mission

GLOBAL-AUDIT-081 — attack semantic equivalence and reducer migration more deeply:
cross-version reducer equivalence, observational equivalence, migration refinement, lossless vs lossy compaction, provenance-preserving replay, fork/rejoin adversaries, and whether any equivalence proof can safely reduce the independence UNKNOWN without collapsing FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
