# NEXO GLOBAL AUDIT-082 — Adversarial Equivalence Certificates and Selective Revocation

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Audit-082 attacks equivalence certificates themselves: certificate independence, proof reuse/composition, refinement transitivity, observer-contract changes, reducer rollback/upgrade, replay determinism, checkpoint retention loss, selective revocation, historical-decision preservation, quorum interaction, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Findings

### 1. An equivalence certificate is evidence, not semantic truth

W3C PROV defines equivalence for valid provenance instances through normalization and isomorphism of normal forms. It also explicitly says that treating equivalent instances "in the same way" is application-specific, with digital signing given as an example where syntax can matter.

Therefore a certificate that two records are equivalent is scoped to the equivalence relation and observer contract used to establish it.

EQUIVALENCE CERTIFICATE != UNIVERSAL SEMANTIC IDENTITY
PROV EQUIVALENCE != ALL-OBSERVER EQUIVALENCE

### 2. Certificate independence

A certificate cannot prove independence merely because it is signed by a different key or stored in a different record.

If the certificate depends on the same source, reducer, normalization algorithm, checkpoint, trust root, or common evidence set, its proof is downstream of the same dependency.

DIFFERENT CERTIFICATE != DIFFERENT EVIDENCE ROOT
DIFFERENT SIGNER != INDEPENDENT PROOF

This extends the common-mode result from 079-081: the certificate's own dependency closure must be traced.

### 3. Proof reuse and composition

Reusing one equivalence proof across multiple claims is valid only if the proof's observer contract and claim scope cover all reused claims.

Composition of proofs requires explicit compatibility of:
- observer contracts;
- semantic domains;
- temporal intervals;
- authority/epoch;
- source incarnation;
- transformation versions;
- dependency closure.

PROOF REUSE != PROOF INDEPENDENCE
PROOF COMPOSITION != AUTOMATIC COMPLETENESS

A proof can be correct for C1 while being insufficient for C2.

### 4. Refinement transitivity

Transitivity is not enough by itself to establish useful Nexo equivalence.

If A refines B under observer O1 and B refines C under observer O2, the composition A→C is justified only if the intermediate semantics and observer contracts compose. A hidden loss at the B boundary can break the intended claim.

TRANSITIVE RELATION != TRANSITIVE CLAIM SUFFICIENCY
REFINEMENT CHAIN != AUTOMATIC EVIDENCE PRESERVATION

### 5. Observer-contract changes

An equivalence certificate can become insufficient when the observer contract changes.

For example, a migration may preserve all fields used by the old claim but omit a field introduced by a later observer. The old certificate remains historically valid for its original contract but cannot automatically certify the new contract.

OLD OBSERVER EQUIVALENCE != NEW OBSERVER EQUIVALENCE
CERTIFICATE VALIDITY != PERMANENT SUFFICIENCY

### 6. Reducer rollback/upgrade

A reducer rollback can recreate an older projection without restoring the exact historical dependency state. An upgrade can produce compatible outputs while changing semantics outside the old observer contract.

Version identity must therefore bind the certificate to reducer semantics and dependency lineage.

ROLLBACK != HISTORICAL RESTORATION
UPGRADE COMPATIBILITY != UNIVERSAL EQUIVALENCE

### 7. Replay determinism

Deterministic replay proves repeatability under the replay environment; it does not prove independent observation.

A replay using the same source and reducer is one derivation path, even if repeated many times.

DETERMINISTIC REPLAY != INDEPENDENT EVIDENCE
N REPLAYS != N OBSERVATIONS

### 8. Checkpoint retention loss

If an old checkpoint is expired or unavailable, a certificate may remain useful for a bounded historical statement while no longer permitting full reconstruction.

TUF/python-tuf provides a concrete analogue: expired local metadata can still participate in rollback checks. This shows that "expired for current acceptance" and "useless for every historical/security analysis" are distinct states.

EXPIRY != ERASURE
HISTORICAL UTILITY != FULL RECONSTRUCTABILITY

### 9. Selective revocation of equivalence certificates

Revoking an equivalence certificate must not automatically erase historical decisions that used it.

Current admissibility should be recomputed over affected dependency paths. Historical decision records retain their provenance and the fact that the certificate was accepted at the relevant authority/epoch, unless a separate historical-invalidity rule exists.

REVOCATION != ERASURE OF HISTORY
CURRENT RE-EVALUATION != RETROACTIVE DECISION REWRITE

If the revoked certificate was necessary to every current admissible path, dependent current claims may become UNKNOWN/REVOKED according to explicit semantics. If another sufficient path survives, universal revocation is unjustified.

### 10. Quorum interaction

Multiple equivalence certificates can create a quorum of certificates while remaining one common-mode proof if they share the same source transformation or equivalence engine.

THRESHOLD OF CERTIFICATES != THRESHOLD OF INDEPENDENT OBSERVATIONS
QUORUM OF PROOFS != PROOF OF WORLD DIVERSITY

The independence question therefore recurses into the proof-generation process.

### 11. FutureObs_PAA

Even a fully verified equivalence certificate over a fixed historical domain does not prove that future observations cannot distinguish the claim.

Equivalence can constrain a bounded historical representation; it cannot by itself establish external finality.

EQUIVALENCE CLOSURE != FUTURE FINALITY
PROOF COMPLETENESS != FUTUREOBS_PAA CLOSURE

## Research-only certificate boundary

A candidate equivalence certificate would need to bind at least:

- CertificateID
- Claim/observer contract
- source and target representations
- source/target versions
- transformation/reducer identity and version
- historical interval
- source incarnation/epoch
- scope
- equivalence/refinement relation
- proof method and assumptions
- dependency/provenance closure
- reconstruction completeness/loss set
- common-mode dependencies
- authority and revocation state.

This is research-only and not a frozen Nexo protocol.

## Verdict

Audit-082 does not close:

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

- W3C PROV Constraints: normalization, validity, equivalence, and application-specific treatment of equivalent provenance.
- Apache Avro specification: Parsing Canonical Form defines schema sameness for a specific parsing purpose; compatibility and resolution remain context-dependent.
- in-toto Attestation v1.2: separate Envelope, Statement, Predicate and Bundle layers; versioning and parsing semantics are layer-specific.
- TUF/python-tuf evidence retained from previous audits: bounded anti-rollback/freeze behavior and continued rollback relevance of expired local metadata.

## Next exact mission

GLOBAL-AUDIT-083 — attack certificate composition and authority:
equivalence-proof authority/delegation, certificate chains, common proof engines, revocation-of-proof, proof expiry, epoch transitions, conflicting equivalence certificates, historical replay after authority loss, quorum composition, and the remaining FutureObs_PAA boundary.

No implementation. No V21. Preserve UNKNOWN.
