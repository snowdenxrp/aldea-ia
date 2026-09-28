# NEXO GLOBAL AUDIT-078 — SHARED/COMMON-MODE DEPENDENCIES AND SELECTIVE REVOCATION

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Audit shared provenance roots, common-mode dependencies, selective versus global invalidation, duplicate evidence, overlapping scopes, quorum/common-root fan-out, cycle/cut-set analysis, reconstruction boundaries, and FutureObs_PAA.

## Research evidence

W3C PROV treats provenance as a dependency-bearing history and defines normalization/equivalence plus event-ordering constraints. It also gives a concrete example where circular derivation produces an impossible strict-order cycle. This supports explicit cycle detection but does not provide Nexo's evidence-independence algebra. citeturn0search0turn0search2

python-tuf tests demonstrate that an expired local timestamp can remain relevant for rollback protection. This is useful evidence that one dependency state can be inadmissible for current acceptance while remaining relevant to another security decision. citeturn0search1

## Findings

### F078-01 — Shared provenance root creates correlated dependency

If claims C1 and C2 ultimately depend on the same authoritative root R, they cannot be treated as independent merely because their immediate records, signatures, observers, or paths differ.

SHARED ROOT != INDEPENDENT EVIDENCE

### F078-02 — Common-mode dependency can be hidden below different paths

Two apparently different evidence paths may converge on the same root, reconstruction checkpoint, mapping registry, membership authority, trust bundle, or reducer.

Therefore independence must be evaluated over dependency closure, not by counting visible paths.

VISIBLE PATH COUNT != EVIDENCE DIVERSITY

### F078-03 — Revoking a common root does not imply every claim is globally invalid

A root transition should affect only claims whose admissibility depends on the revoked semantic boundary.

A claim that shares infrastructure but has an independent admissibility path must be evaluated separately.

COMMON INFRASTRUCTURE != UNIVERSAL INVALIDATION

### F078-04 — Conversely, selective revocation cannot preserve claims that still depend on the revoked boundary

If C depends essentially on R and no independent sufficient path exists, revocation of R can reopen C even when C has a different immediate certificate.

DIFFERENT CERTIFICATE != INDEPENDENT ROOT

### F078-05 — Dependency cuts are useful analysis objects, not yet an algebra

A minimal cut set can identify dependencies whose failure disconnects all admissible evidence paths for a claim. But identifying a graph cut does not by itself prove that the cut corresponds to semantic necessity.

GRAPH CUT != PROVEN SEMANTIC NECESSITY

### F078-06 — Duplicate evidence must collapse under common ancestry

Two records generated from the same observation, migration, snapshot, attestation root, or common reconstruction checkpoint must not gain evidentiary weight merely because they have distinct representations.

DISTINCT REPRESENTATION != DISTINCT EVIDENCE

### F078-07 — Overlapping scopes require semantic relation before propagation

If two claims overlap textually, propagation cannot assume full overlap, disjointness, or containment until scope semantics, aliases, hierarchy and incarnation are established.

TEXTUAL OVERLAP != PROVEN CLAIM OVERLAP

### F078-08 — Partial revocation can produce mixed current states

If a shared root is revoked only for S1 while a claim spans S1 union S2, the result cannot automatically become globally REVOKED. The reducer may need to partition the claim, retain supported portions, and mark the unresolved portion UNKNOWN.

PARTIAL REVOCATION != GLOBAL REVOCATION

### F078-09 — Quorum members sharing a root are not automatically independent

A quorum with N distinct signers can still depend on one common membership registry, trust root, completeness certificate, observation source, or reconstruction snapshot.

SIGNER COUNT != INDEPENDENCE

### F078-10 — Common-mode revocation can fan out across quorum-derived claims

If the common root is claim-essential, many quorum certificates can reopen simultaneously even though each certificate remains cryptographically authentic.

AUTHENTICITY PRESERVATION != SEMANTIC SUFFICIENCY

### F078-11 — Cycle detection is necessary but not sufficient

Acyclic dependency graphs avoid one class of self-supporting evidence, but acyclicity alone does not establish completeness, independence, or semantic sufficiency.

ACYCLIC != COMPLETE
ACYCLIC != INDEPENDENT

### F078-12 — Reconstruction checkpoints are common-mode dependencies

If several claims are reconstructed from the same historical checkpoint and that checkpoint omits claim-relevant history, the claims share the same reconstruction weakness.

SHARED CHECKPOINT != INDEPENDENT RECONSTRUCTION

### F078-13 — Partial history loss must remain localized

If only one dependency branch loses reconstructability, unrelated branches should not be globally erased. Conversely, if all admissible paths require the lost branch, affected claims remain UNKNOWN.

LOCAL LOSS != GLOBAL LOSS
ESSENTIAL LOSS != LOCALIZED IMPACT

### F078-14 — Revocation authority is itself a dependency

A root-revocation event requires authenticated authority, target identity/incarnation, scope, epoch, interval, and provenance. If its authority boundary is unresolved, propagation of the revocation itself remains UNKNOWN.

REVOCATION AUTHENTICITY != REVOCATION IMPACT

### F078-15 — Historical common-mode relationships must be retained

A later split of a root does not retroactively make earlier evidence independent. Historical dependency remains historical provenance even if current architecture separates components.

CURRENT SEPARATION != HISTORICAL INDEPENDENCE

### F078-16 — FutureObs_PAA remains outside graph-local closure

Even if every currently known dependency path is closed, future observations can still alter a claim unless a separate finality/completeness contract closes the relevant observation domain.

DEPENDENCY CLOSURE != FUTURE FINALITY

## Candidate research-only dependency model — NOT FROZEN

For each claim C, maintain a provenance dependency graph whose nodes may include:

- claim;
- evidence record;
- derivation;
- source observation;
- authority;
- trust root;
- membership/population contract;
- scope mapping;
- epoch/incarnation;
- reconstruction checkpoint;
- revocation/supersession certificate;
- quorum certificate.

A candidate independence relation would require proving absence of claim-relevant shared dependency roots, common-mode transformations, common reconstruction boundaries, and unresolved overlap.

If independence cannot be established, evidence should not receive independent-weight semantics merely because it is separately signed or separately stored.

This is research only; no Nexo protocol is frozen.

## Candidate selective-revocation rule — NOT FROZEN

For claim C and changed dependency D:

1. Determine whether D is in C's admissibility closure.
2. Determine the semantic scope/interval/incarnation intersection.
3. Determine whether D is essential to every currently admissible evidence path.
4. Remove or downgrade only the affected support paths.
5. Re-evaluate whether an independent sufficient path remains.
6. Preserve historical decisions and provenance.
7. If the result cannot be determined because of missing semantics/history, return UNKNOWN.
8. Do not infer FutureObs_PAA closure from this process.

## New distinctions

- SHARED ROOT != INDEPENDENT EVIDENCE
- VISIBLE PATH COUNT != EVIDENCE DIVERSITY
- COMMON INFRASTRUCTURE != UNIVERSAL INVALIDATION
- DIFFERENT CERTIFICATE != INDEPENDENT ROOT
- GRAPH CUT != PROVEN SEMANTIC NECESSITY
- DISTINCT REPRESENTATION != DISTINCT EVIDENCE
- TEXTUAL OVERLAP != PROVEN CLAIM OVERLAP
- PARTIAL REVOCATION != GLOBAL REVOCATION
- SIGNER COUNT != INDEPENDENCE
- AUTHENTICITY PRESERVATION != SEMANTIC SUFFICIENCY
- ACYCLIC != COMPLETE
- ACYCLIC != INDEPENDENT
- SHARED CHECKPOINT != INDEPENDENT RECONSTRUCTION
- LOCAL LOSS != GLOBAL LOSS
- ESSENTIAL LOSS != LOCALIZED IMPACT
- REVOCATION AUTHENTICITY != REVOCATION IMPACT
- CURRENT SEPARATION != HISTORICAL INDEPENDENCE
- DEPENDENCY CLOSURE != FUTURE FINALITY

## Verdict

GLOBAL-AUDIT-078 does NOT close dependency completeness, independence proof, quorum semantics completeness, population completeness, or FutureObs_PAA.

It establishes a narrower boundary: selective revocation requires dependency-closure analysis, common-mode detection, scope/interval/incarnation matching, and preservation of independent support. Graph cuts and acyclicity are useful analysis mechanisms but are not yet proven semantic algebras.

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

## Mandatory carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-079 — Common-mode evidence under transformations and reconstruction:
- derived-record duplication;
- normalization and equivalence;
- migrations/compaction;
- shared attestation roots;
- shared observation sources;
- common reducers;
- reconstruction checkpoints;
- independence after transformation;
- selective revocation propagation;
- quorum interaction;
- FutureObs_PAA boundary.

No implementation. No V21. Preserve UNKNOWN.
