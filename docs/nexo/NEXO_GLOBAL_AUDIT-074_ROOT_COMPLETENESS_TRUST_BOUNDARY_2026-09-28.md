# NEXO GLOBAL AUDIT-074 — ROOT COMPLETENESS AS TRUST BOUNDARY VS EXTERNAL EVIDENCE

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Audit: GLOBAL-AUDIT-074
Status: RESEARCH / ANALYSIS ONLY — NO IMPLEMENTATION

## Scope

Compare two possible ways to justify population completeness:
A) an explicit trusted root/TCB assertion; or
B) externally evidenced completeness.

Attack surfaces: root compromise, rollback, freeze, forks, authority capture, false independence, threshold root rotation, historical reconstruction, and minimum assumptions needed for a closed negative claim.

## Research evidence

TUF is a useful concrete reference for a trust-root design. Its clients ship with trusted root keys; root metadata is versioned, threshold-signed, and updated through a continuity chain requiring thresholds from both the old and new root configurations. TUF also explicitly addresses rollback and freeze attacks. This demonstrates that a root can be an explicit trust anchor while still requiring transition and freshness protections. It does NOT demonstrate that the root's semantic population is complete. citeturn0search0turn0search2

## Findings

### F074-01 — Root trust is an assumption boundary, not a proof of universe completeness

If Nexo declares a population root authoritative, then the system may legitimately reason from that root only to the extent that the root's authority and semantic scope are explicit.

Cryptographic authenticity can establish:
  THIS ROOT WAS AUTHORIZED BY TRUSTED ROOT KEYS

It does not establish:
  THIS ROOT ENUMERATES EVERY ENTITY IN THE CLAIM DOMAIN

Therefore:
ROOT AUTHENTICITY != ROOT COMPLETENESS

### F074-02 — TCB inclusion can make completeness conditional rather than proven

Putting population-root completeness inside the TCB can close a logical dependency by assumption:

  TRUST ROOT + ASSUME ROOT COMPLETE -> CLOSED DOMAIN

That can be a valid architecture boundary if explicitly declared.

But it must not be reported as an independently proven completeness theorem.

### F074-03 — External witnesses do not automatically escape circularity

Multiple witnesses can all validate the same root while inheriting its completeness assertion.

Therefore:
MULTI-WITNESS AGREEMENT != INDEPENDENT COMPLETENESS

Independence requires a non-circular relation between the witnesses and the proposition being established.

### F074-04 — Independent provenance must be claim-relative

A witness is not independent merely because it has a different key, organization, machine, or network path.

It may still depend on:
- the same registry;
- the same census;
- the same upstream authority;
- the same snapshot;
- the same reconstruction source;
- the same software defect.

Thus independence requires dependency analysis, not identity counting.

### F074-05 — Threshold root signatures protect authorization, not semantic completeness

TUF's root transition rules require signatures from thresholds in both predecessor and successor root configurations and enforce sequential versions. This protects continuity and limits certain key-compromise/rollback attacks. citeturn0search0turn0search2

But threshold authorization still answers:
  WHO AUTHORIZED THIS ROOT?

It does not answer:
  IS THIS ROOT'S POPULATION COMPLETE?

### F074-06 — Root compromise and root incompleteness are different failure classes

A compromised root may be cryptographically unauthorized or malicious.

An honest but incomplete root may be fully authorized and correctly signed while omitting members.

Therefore security against key compromise does not imply security against semantic omission.

### F074-07 — Rollback protection does not prove historical completeness

Sequential versioning and anti-rollback can establish that an accepted root is not older than the trusted root under the protocol's rules.

They do not establish that every historical membership transition was recorded or that an omitted entity never existed.

Thus:
ANTI-ROLLBACK != HISTORICAL-COMPLETENESS

### F074-08 — Freeze protection does not prove completeness

Expiration can detect or limit indefinite withholding of newer metadata. TUF explicitly treats freeze attacks as distinct from other attacks. citeturn0search0

A fresh root can still be semantically incomplete.

Thus:
FRESHNESS != COMPLETENESS

### F074-09 — Fork consistency does not prove one fork is universe-complete

A root may be internally consistent and have valid ancestry while representing a forked or partial view of the domain.

Fork resolution therefore needs an authority/finality rule separate from completeness semantics.

### F074-10 — Root rotation preserves trust continuity, not semantic continuity

A new root can be safely authorized by predecessor/successor thresholds while changing the population model.

Therefore root transition needs separate consideration of:
- semantic scope;
- population definition;
- historical continuity;
- membership changes;
- claim-domain compatibility.

TUF's root rotation provides a useful security pattern, but not a general population-completeness theorem. citeturn0search0

### F074-11 — External evidence can reduce assumptions only if its boundary is independently grounded

Suppose Root A says population P is complete and Witness B says A is correct.
If B's evidence ultimately depends on A, no independent completeness proof has been added.

If B comes from an independently grounded source, the combined system may reduce the uncertainty, but the independence contract itself becomes another proof obligation.

### F074-12 — There is no free escape from the completeness root

A negative claim requires some boundary at which the system stops asking:
"How do we know this domain is complete?"

Possible answers are:
1. explicit trusted axiom/TCB boundary;
2. independently evidenced finite domain;
3. formally defined closed-world contract whose completeness is itself part of the trusted environment;
4. another proven construction that terminates the dependency chain.

If none is supplied, completeness remains UNKNOWN.

### F074-13 — Minimum-assumption closure must be explicit

A future Nexo negative-claim contract should distinguish at least:
- domain definition;
- population authority;
- authority trust basis;
- membership completeness assumption/evidence;
- observation completeness;
- temporal finality;
- dependency closure;
- reconstruction guarantees.

A claim must not silently inherit completeness from an unrelated authority.

### F074-14 — A trusted root can close a model while preserving epistemic honesty

It is not inherently wrong to use a trusted population root.
The correct statement is:

  COMPLETE-WITHIN-TRUSTED-DOMAIN

rather than:

  PROVEN-GLOBALLY-COMPLETE

unless the stronger property has independent evidence.

This distinction is important for Nexo's future authority/evidence separation.

### F074-15 — FutureObs_PAA remains a separate closure problem

Even if population completeness is accepted as a trusted-root assumption, a later admissible event can invalidate a temporal negative claim unless the claim's finality boundary excludes that future observation.

Therefore:
POPULATION ROOT CLOSURE != FutureObs_PAA CLOSURE

### F074-16 — Root compromise recovery is itself evidence-sensitive

TUF demonstrates that compromised root thresholds can require out-of-band recovery and that some root-key compromise cases cannot be safely repaired solely through ordinary repository updates. citeturn0search0turn0search1

For Nexo, this reinforces that recovery authority and ordinary observation authority must not be conflated.

### F074-17 — Semantic migration can invalidate historical completeness claims

A root/schema migration may preserve cryptographic continuity while changing the meaning of membership categories or domain boundaries.

Therefore historical reconstruction must preserve semantic version and interpretation context, not merely root hashes and signatures.

This directly connects to GLOBAL-AUDIT-045's migration/reconstruction carryover.

### F074-18 — The strongest result is a three-way separation

The research now distinguishes:

AUTHORIZATION:
  Was this root authorized?

COMPLETENESS:
  Does it enumerate the whole claimed domain?

FINALITY:
  Can later observations change the claim?

No one of these may be substituted for another.

## New distinctions

- ROOT AUTHENTICITY != ROOT COMPLETENESS
- TRUST ROOT != PROVEN UNIVERSE
- MULTI-WITNESS AGREEMENT != INDEPENDENT COMPLETENESS
- DIFFERENT KEYS != INDEPENDENT EVIDENCE
- ROOT SECURITY != SEMANTIC OMISSION SECURITY
- ANTI-ROLLBACK != HISTORICAL-COMPLETENESS
- FRESHNESS != COMPLETENESS
- FORK CONSISTENCY != UNIVERSE COMPLETENESS
- ROOT ROTATION != SEMANTIC CONTINUITY
- AUTHORIZATION != COMPLETENESS
- COMPLETENESS != FINALITY
- POPULATION ROOT CLOSURE != FutureObs_PAA CLOSURE
- CRYPTOGRAPHIC CONTINUITY != SEMANTIC CONTINUITY

## Audit verdict

GLOBAL-AUDIT-074 does not close population completeness.

A trusted root can be a legitimate explicit TCB boundary. If adopted, the claim must be scoped as complete relative to that trusted domain rather than represented as an independently proven universal fact.

External witnesses only add independent evidence if their completeness basis is itself independently grounded. Otherwise the system risks circular certification.

The minimum unresolved boundary is:

  WHAT IS THE NON-CIRCULAR TERMINATION POINT
  FOR THE CLAIM THAT THE POPULATION DOMAIN IS COMPLETE?

Current answer: UNKNOWN.

No implementation.
No V21.
Semantic freeze NOT DECLARED.
Preserve UNKNOWN.

## Epistemic state

P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
population completeness boundary = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next audit

GLOBAL-AUDIT-075 — Closed-world contracts, finite-domain witnesses, and the minimum trusted boundary:
- formal closed-world versus open-world semantics;
- finite-domain enumeration witnesses;
- authenticated completeness manifests;
- independent census mechanisms;
- impossibility/circularity cases;
- minimum TCB needed for domain closure;
- historical domain reconstruction;
- interaction with negative claims and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
