# AB104.21 — Evidence-constrained event-order frontier — 2026-09-25

Status: RESEARCH ONLY.

## Purpose

Continue AB104.20 by extracting the strongest reusable semantic constraint from AB20/AB24/AB26 for the renewal/consumption investigation: P_AA-relevant order must be represented explicitly enough to distinguish reversals that can change admission validity.

## Recovered constraints

- AB20 identifies authorization linearization as an unresolved semantic parameter and lists revoke/admit, policy/admit, incarnation/admit, delegation/admit, epoch/admit, and lease-expiry/admit races.
- AB24 establishes that P_AA is claim-relative and requires the actual UsedAdmissionContext, not an arbitrary valid witness.
- AB26 establishes that three temporal positions are not generally sufficient; a model must either enumerate relevant orderings, use an ordered event/history structure, or prove omitted order irrelevant.
- AB26 also states that historical admission linkage is immutable and that LeaseBridge and AdmissionBindingClass remain semantically distinct until behavioral congruence is established.

## Implication for LEASE_RENEW / LEASE_CONSUME

A bounded experiment may safely vary only event orderings whose transition assumptions are explicit. The following pairs are P_AA-relevant candidate separators, not asserted protocol laws:

1. POLICY_CHANGE ↔ LEASE_RENEW
2. LEASE_EXPIRE ↔ LEASE_RENEW
3. DELEGATION_CHANGE ↔ LEASE_RENEW
4. RESOURCE_REINCARNATE ↔ LEASE_RENEW
5. CONSUME ↔ RETRY
6. CONSUME ↔ LEASE_RENEW
7. REVOKE ↔ CONSUME
8. CONSUME ↔ ADMIT
9. RENEW ↔ ADMIT

For each pair, a concrete classification requires complete Pre/Post/Frame/Invalidation/AdmissionLink semantics. Without those, the result is UNKNOWN rather than a guessed successor.

## Important separation

Event-order sensitivity is not itself a proof of a ternary P_AA collision. To establish a collision, two histories must be observationally equivalent under the defined lower-arity quotient and then diverge in a future P_AA observation. Merely obtaining different states or different orderings is insufficient.

## Next

Use the event-order frontier to target only missing source laws. Do not encode hypothetical renewal/consume mutations into the canonical interpreter. If no source closes a pair's transition law, preserve UNKNOWN and move to the next highest-value evidence target.
