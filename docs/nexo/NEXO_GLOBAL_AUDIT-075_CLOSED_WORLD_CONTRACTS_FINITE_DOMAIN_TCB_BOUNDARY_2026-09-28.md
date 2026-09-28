# NEXO GLOBAL AUDIT CONTINUITY — AUDIT-075

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Audit: GLOBAL-AUDIT-075
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Result

Audit-075 studied closed-world contracts, finite-domain witnesses, domain-root termination, and the minimum trusted boundary required to interpret absence as a negative fact.

Core result:

CLOSED-WORLD CONTRACT != PROOF OF WORLD COMPLETENESS

A closed-world contract can legitimately define the semantic universe for a claim. But unless the contract's authority, scope, membership, version/epoch, temporal boundary, and completeness assumptions are themselves justified, it is a trust boundary rather than an independently demonstrated fact.

The research confirms the distinction between open-world and closed-world semantics: under open-world reasoning, failure to derive a fact leaves it unresolved; under closed-world reasoning, failure can be interpreted as falsehood only because completeness is part of the adopted semantics. [Reiter/Vardi database literature]

TUF was used as a concrete trust-boundary example: its client begins from trusted root metadata supplied out-of-band, and its verification workflow protects version/rollback/freeze and delegated trust. This demonstrates an explicit trust anchor and state machine, not proof that the root's semantic universe is complete. citeturn0search0

## Findings

### F075-01 — Closed-world semantics is an assumption with scope

A closed-world interpretation can convert failure to prove P into NOT-P, but only within the domain covered by that closed-world contract.

Therefore:
NO PROOF != NOT-P outside the declared closed world.

### F075-02 — Finite enumeration is not automatically complete

A finite list proves finiteness of the listed representation, not that the representation contains every member of the intended semantic population.

Need separate evidence for:
- universe definition;
- enumeration completeness;
- enumeration freshness;
- historical validity;
- authority.

### F075-03 — A finite witness can terminate traversal without proving the universe

A root object saying "these are all members" can terminate a dependency walk operationally. It does not, by itself, prove that no omitted member exists.

Thus:
TRAVERSAL TERMINATION != SEMANTIC COMPLETENESS.

### F075-04 — The minimum TCB can be explicit rather than disguised

If Nexo chooses a closed-world root as a trust assumption, that is not inherently invalid. The critical requirement is to mark it explicitly as TCB/trust rather than presenting it as independently proven evidence.

Candidate boundary:
ROOT DOMAIN AUTHORITY + AUTHORITY SEMANTICS + VERSION/EPOCH + SCOPE + COMPLETENESS CONTRACT.

TCB completeness itself remains UNKNOWN.

### F075-05 — External witnesses can reduce but do not automatically eliminate trust

Two or more witnesses can independently attest to a population boundary only if their evidence dependencies and authority roots are themselves sufficiently independent for the claim.

Therefore:
MULTIPLE WITNESSES != INDEPENDENT COMPLETENESS PROOF.

### F075-06 — Self-certifying completeness remains circular

If the only evidence that authority A's population is complete is A's own assertion that it is complete, the evidence does not escape the root trust assumption.

This is not a cryptographic failure; it is an epistemic boundary.

### F075-07 — Finite-domain closure is claim-relative

A domain may be complete for one claim and incomplete for another.

Candidate closure must bind:
ClaimScope, DomainDefinition, PopulationDefinition, EnumerationVersion, AuthorityEpoch, SourceIncarnation, ObservationInterval, CompletenessSemantics, Retention/ReconstructionContract, FutureObs boundary.

Not frozen.

### F075-08 — Temporal closure is separate from domain closure

Even a complete finite population at T1 does not prove the same population remains complete at T2.

Therefore:
DOMAIN CLOSURE != TEMPORAL FINALITY.

### F075-09 — Membership changes reopen prior negative claims

Join, removal, split, merge, re-keying, and incarnation changes can alter whether a previous absence claim remains valid for the current projection.

Historical claim validity and current claim admissibility must remain separate.

### F075-10 — A closed-world contract can narrow UNKNOWN, not erase it globally

A contract may legitimately convert some previously UNKNOWN negative claims into determinate claims within its exact declared boundary.

It cannot automatically close:
- unrelated populations;
- hidden domains;
- future observations;
- missing historical intervals;
- unresolved dependency closure;
- out-of-contract event classes.

### F075-11 — TUF illustrates explicit trust anchoring and anti-rollback, not universe completeness

TUF's root metadata is explicitly trusted out-of-band, and the client verifies chained root updates, thresholds, versions, expiration, rollback and freeze conditions. citeturn0search0

This supports a useful Nexo distinction:
TRUST ANCHOR + STATE TRANSITION INTEGRITY != SEMANTIC UNIVERSE COMPLETENESS.

### F075-12 — Closed-world assumptions can create contradictions if the domain contract is wrong

Database theory documents that closed-world evaluation can lead to inconsistency in general, while its behavior differs fundamentally from open-world semantics. citeturn0search1turn0search5

Therefore Nexo must not silently switch between:
OPEN_WORLD / UNKNOWN
and
CLOSED_WORLD / FALSE

without recording the semantic contract responsible for the transition.

### F075-13 — Minimum trusted boundary is not yet minimal

A candidate TCB boundary can be stated, but proving it is minimal requires a dependency-reduction argument showing that removing any component makes the claim unsound and that no unnecessary component remains.

Therefore:
CANDIDATE TCB != PROVEN MINIMAL TCB.

### F075-14 — Finite domain does not solve FutureObs_PAA

Even with a finite, explicitly closed population, a later admissible observation can reopen a negative claim unless the temporal/finality boundary excludes it.

Therefore:
FINITE DOMAIN != FUTUREOBS_PAA CLOSURE.

### F075-15 — Completeness certificates need their own provenance

A completeness certificate is evidence about the population boundary itself.

Its issuer, authority, scope, epoch, source incarnation, derivation, witnesses, retention and revocation state therefore enter the evidence dependency graph.

### F075-16 — Closed-world contracts must not be treated as universal defaults

A contract for one query or mission cannot silently become a global rule for all Nexo knowledge.

Negative claims remain claim-relative.

## New distinctions

- CLOSED-WORLD CONTRACT != PROOF OF WORLD COMPLETENESS
- FINITE ENUMERATION != ENUMERATION COMPLETENESS
- TRAVERSAL TERMINATION != SEMANTIC COMPLETENESS
- MULTIPLE WITNESSES != INDEPENDENT COMPLETENESS PROOF
- SELF-CERTIFIED COMPLETENESS != INDEPENDENT COMPLETENESS
- DOMAIN CLOSURE != TEMPORAL FINALITY
- FINITE DOMAIN != FUTUREOBS_PAA CLOSURE
- TRUST ANCHOR != SEMANTIC UNIVERSE COMPLETENESS
- CANDIDATE TCB != PROVEN MINIMAL TCB
- QUERY-SCOPED CLOSURE != GLOBAL KNOWLEDGE CLOSURE

## Audit verdict

GLOBAL-AUDIT-075 does NOT close population completeness or FutureObs_PAA.

It does establish a clean research boundary:

Nexo may eventually choose either:
A) an explicit trusted closed-world root for a narrowly defined claim domain; or
B) an externally evidenced completeness mechanism.

But neither should be silently represented as universally proven completeness.

The correct epistemic state remains UNKNOWN wherever the completeness contract is absent, outside scope, stale, revoked, or dependent on unresolved roots.

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

Do not erase, overwrite, or silently reinterpret this.

## Next exact mission

GLOBAL-AUDIT-076 — Completeness-contract revocation, scope changes, and semantic re-opening:
1. revoking or superseding a completeness contract;
2. scope expansion/contraction;
3. population split/merge;
4. epoch transitions;
5. stale completeness certificates;
6. historical claims versus current projections;
7. whether completeness evidence can be revoked without erasing historical validity;
8. propagation through dependent negative claims;
9. interaction with quorum certificates and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
