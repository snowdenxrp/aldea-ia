# AB104.20 — Renewal/consumption evidence-boundary synthesis — 2026-09-25

Status: RESEARCH ONLY. No protocol law is inferred; no semantic freeze, formal verification, or integrated implementation.

## Objective

Continue from AB104.19 by converting the recovered AB20/AB24/AB25/AB26/AB54 and AB94-AB104 evidence into an explicit boundary for LEASE_RENEW and LEASE_CONSUME.

## Recovered facts

1. P_AA admission safety is claim-relative: the authority/bridge context must be the context actually used by the admission. An unrelated valid witness is insufficient.
2. Lease validity is joint across authority/currentness, policy, delegation, incarnation, boundary, freshness and relational admission linkage.
3. LEASE_RENEW reads lease/expiry, renewal authority, current authority/policy/delegation/incarnation and bridge state, but the complete renewal mutation law is not recovered.
4. LEASE_CONSUME is represented in the research harness as replay/consumption state, but the complete protocol law for legality, post-state, replay scope and successor enumeration is not recovered.
5. LeaseBridge and AdmissionBindingClass remain semantically distinct; structural packing does not prove behavioral congruence.
6. Historical admission linkage is immutable evidence; later invalidation does not rewrite what context was actually used at the admission point.

## Gate matrix

| Dimension | LEASE_RENEW | LEASE_CONSUME |
|---|---|---|
| C1 source context | PARTIAL/KNOWN | PARTIAL/KNOWN |
| C2 legality | UNKNOWN | UNKNOWN |
| C3 complete post-state | UNKNOWN | UNKNOWN |
| C4 frame/invalidation | UNKNOWN | UNKNOWN |
| C5 observation/admission mapping | PARTIAL/UNKNOWN | PARTIAL/UNKNOWN |
| C6 complete successor domain | UNKNOWN | UNKNOWN |

## Decisive unresolved distinctions

LEASE_RENEW:
- extension versus replacement;
- renewal eligibility after expiry;
- exact renewal authority/currentness condition;
- policy/delegation/incarnation interaction at renewal;
- bridge retention versus rebinding;
- replay/history effects;
- exhaustive successor domain.

LEASE_CONSUME:
- exact legality precondition;
- whether consumption mutates lease validity, replay state, attempt state, or multiple components;
- scope of replay protection;
- whether a consumed context can be renewed/retried/reused;
- exact admission linkage;
- exhaustive successor domain.

## Consequence

The evidence is now sufficient to state exactly what a complete model must represent, but not sufficient to choose the protocol law for the unresolved dimensions.

Therefore:
- LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
- LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
- TERNARY_PAA_COLLISION = UNKNOWN
- QUOTIENT_CONGRUENCE = UNKNOWN
- EVENTDAG_CLOSURE = PARTIAL
- RECONSTRUCTION = BOUNDED_ONLY
- AB65_EXECUTION = NOT_VERIFIED

No 286-triple expansion is justified by this round.

## Bounded experiment rule

A future bounded experiment may instantiate an explicit hypothetical completion only if it labels that completion as an experimental assumption and never promotes its result to protocol evidence. A protocol conclusion requires recovered source evidence or a verified specification that establishes the corresponding law.

## Next action

Recover or inspect the strongest remaining historical artifacts around AB20/AB24/AB36/AB38 and any source that can establish concrete renewal/consumption legality, post-state, bridge replacement/retention, retry inheritance, expiry ordering, or replay semantics. In parallel, the AB65 workflow remains a separate execution-verification track; do not conflate local harness execution with repository-connected gate execution.
