# NEXO HISTORICAL ATTRIBUTION POST-REVOCATION AUDIT REPLAY CLOCK ORDER RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. NO V21 IMPLEMENTATION. NO CORRECTNESS CLAIM.

## Target
Test whether historical attribution can be preserved after privacy deletion, key compromise, revocation, audit replay, clock manipulation, and late evidence without accidentally becoming a bypass to current authority.

## External cross-check
Lamport's distributed-systems work distinguishes physical clock readings from event ordering: in distributed systems, the happened-before relation is generally only a partial order, and physical clocks are imperfect. TLA+ models concurrent systems with initial states and next-state relations and is intended for precise safety specifications. These sources support separating observation time from authoritative ordering; they do not prove Nexo's design. Sources:
- https://lamport.azurewebsites.net/pubs/time-clocks.pdf
- https://lamport.azurewebsites.net/tla/high-level-view.html
- https://lamport.azurewebsites.net/tla/book.html

## Core separations
HISTORICAL_ATTRIBUTION != CURRENT_AUTHORITY.
AUTHENTIC_LOG_REPLAY != CURRENT_PERMISSION.
TIMESTAMP_VALIDITY != AUTHORITATIVE_ORDER.
POST_REVOCATION_SIGNATURE != CURRENT_AUTHORITY.
KEY_CONTINUITY != AUTHORITY_CONTINUITY.
AUDIT_RECONSTRUCTION != WORLD_RECONSTRUCTION.
PRIVACY_RESIDUE != RAW_IDENTITY.
RAW_IDENTITY_DELETION != EVENT_ERASURE.
LATE_EVIDENCE != AUTOMATICALLY_INVALID.

## Attack 1: post-revocation replay
An emergency decision D was legitimately signed under root R0 and authority epoch E0.
Later E0 is revoked.
An archived audit record for D is replayed to a fresh process.
The record is authentic and historically valid.

Unsafe:
VALID(D) -> CURRENT_AUTHORITY(D).

Required:
D can establish historical attribution only.
Any current effect requires a fresh current authorization transition bound to current root/authority/context.

## Attack 2: key compromise after valid history
Key K was honest when it signed D, then compromised.
A forged event F is produced using K after compromise.
Both D and F verify cryptographically.

A signature alone cannot establish event-time trust after key compromise.

Candidate KeyTrustInterval:
- key_id
- key_generation
- valid_from_order
- valid_until_order
- compromise_detection_order
- revocation_order
- root generation
- issuance context
- dependent artifact closure.

The system must classify a signature against its relevant issuance/order context, not merely current cryptographic validity.

## Attack 3: audit replay with manipulated clocks
Audit record A says 10:01.
Record B says 10:00.
Their timestamps appear to establish B before A.

This is unsafe unless the system's contract defines trusted real-time ordering with sufficient clock assumptions.

For distributed events, the authoritative order should be represented independently of display timestamps. Lamport's work explicitly notes that distributed event ordering is generally a partial order and that physical clocks are imperfect.

Candidate fields:
- event_time
- observation_time
- authoritative_order_position
- causal_predecessor_set
- source_clock_generation
- clock_trust_context.

No wall-clock timestamp alone can establish a protected succession cutoff.

## Attack 4: replay after root rotation
D was valid under R0.
R0 is superseded by R1.
Replay of D must preserve provenance but cannot automatically regain current authority.

Rule:
HISTORICAL_VALIDITY(R0,D) does not imply CURRENT_VALIDITY(R1,D).

Dependent current claims require revalidation under the successor trust context.

## Attack 5: privacy-minimized residue replay
A minimized residue contains:
decision digest, transition id, root generation, authority epoch, ordering position.

It is sufficient for historical attribution under its contract.

An attacker replays it as if it were a capability.

Required type separation:
HistoricalResidue -> Evidence/Provenance only.
CapabilityBinding -> Current authorization only.

There must be no implicit conversion.

## Attack 6: audit duplication and reordering
The same event may appear:
- twice,
- in different batches,
- through two observers,
- after delayed delivery,
- after compaction.

Evidence identity must use event/effect identity plus provenance, not record count.

DUPLICATE_RECORD != DUPLICATE_EFFECT.
REORDERED_OBSERVATION != REORDERED_WORLD_EVENT.

## Attack 7: late evidence after deletion
Raw evidence is deleted according to a privacy retention rule.
Later evidence arrives showing:
- credential compromise before the apparent decision,
- predecessor cutoff earlier than recorded,
- a provider continuation,
- conflicting governance statement.

If the retained safety residue cannot establish the necessary property, the claim must degrade. Missing raw data must never be reconstructed by optimistic inference.

## Candidate object: HistoricalAttributionRecord
Fields:
- attribution_id
- event/effect identity
- subject identity or privacy-preserving reference
- issuance context
- root generation
- authority epoch
- membership generation
- authoritative order position
- evidence provenance
- key trust interval
- privacy classification
- retention basis
- current-authority exclusion marker
- invalidation triggers
- permitted historical claims.

The current-authority exclusion marker is important: provenance objects cannot silently become authorization objects.

## Candidate object: CurrentAuthorizationBinding
Fields:
- binding_id
- operation/effect identity
- current authority context
- current root generation
- current membership generation
- current policy/invariant generation
- capability lineage
- scope
- fence generation
- resource incarnation
- dependency closure
- expiry
- invalidation triggers.

No field should allow HistoricalAttributionRecord to substitute for this binding.

## Candidate object: EventOrderContext
Fields:
- order_domain
- order_generation
- authoritative_order_position
- causal predecessor set
- event time
- observation time
- clock trust context
- partition/reconciliation generation
- root/membership context.

## Replay classification
R0 provenance-only replay: permitted as historical evidence.
R1 claim recomputation: permitted if context remains sufficient.
R2 current-authority request: requires fresh authorization.
R3 effect redrive: requires new current admission or explicit continuation contract.
R4 recovery input: permitted only as evidence and subject to current trust/reconciliation.
R5 constitutional succession evidence: requires current root/membership/order validation.

## Revocation boundary
Revocation must distinguish:
- artifact authenticity,
- historical attribution,
- current authorization,
- effect enforcement,
- world outcome.

A revoked key can still authenticate that a historical record was signed by that key if the historical trust interval supports that claim. Revocation does not retroactively erase history.

But that historical fact cannot grant current authority.

## Clock attack
Clock manipulation can alter:
- expiry evaluation,
- event freshness,
- timeout interpretation,
- audit ordering,
- succession timing.

Therefore protected transitions require an explicit clock contract. If the contract cannot establish the necessary ordering or freshness, use UNKNOWN/HOLD/QUARANTINE rather than inferring from local time.

## Candidate ClockTrustContract
Fields:
- clock_id/source
- clock_generation
- trust root
- synchronization assumptions
- maximum uncertainty
- monotonicity guarantee
- rollback detection
- ordering use permitted
- freshness use permitted
- expiry use permitted
- failure response.

The contract may permit a clock for display while forbidding it as an authority-order source.

## Audit privacy rule
A privacy deletion transition itself becomes safety-relevant when the deleted information supports:
- authority succession,
- revocation closure,
- effect reconciliation,
- legal/audit claims required by policy,
- incident reconstruction.

Deletion must be evaluated against active claim dependencies.

## New invariants
HA-01 historical attribution cannot become current authority.
HA-02 cryptographic validity cannot substitute for event-time trust after key compromise.
HA-03 wall-clock timestamps cannot establish authoritative succession order unless explicitly covered by a trusted clock contract.
HA-04 replay cannot resurrect revoked authority.
HA-05 minimized provenance residue cannot be used as a capability.
HA-06 duplicate audit records cannot be counted as independent evidence.
HA-07 observation reorder cannot be treated as world-event reorder.
HA-08 late evidence can invalidate or degrade a historical-derived current claim.
HA-09 privacy deletion cannot leave a stronger safety claim than retained evidence supports.
HA-10 key trust intervals are part of evidence context.
HA-11 root rotation requires revalidation of current claims derived from predecessor-root evidence.
HA-12 recovery can consume historical evidence but cannot derive current authority from history alone.
HA-13 clock rollback or uncertainty must not silently extend authority.
HA-14 audit logs are evidence and require dependency closure.
HA-15 historical provenance and current authorization must have non-coercible type boundaries.
HA-16 event identity and effect identity are distinct where one event may trigger multiple attempts/effects.

## Major conclusion
Historical evidence should be deliberately useful for provenance while being structurally incapable of granting current authority.

The architecture therefore needs a one-way conceptual boundary:
HISTORICAL_EVIDENCE -> SUPPORTS_CLAIM
but never:
HISTORICAL_EVIDENCE -> CURRENT_AUTHORITY.

Current authority must be produced by a protected current transition.

## Formalization target
Model:
- key compromise intervals
- root rotation
- revocation
- privacy deletion
- replay
- duplicate/reordered audit records
- clock skew/rollback
- late evidence
- historical residues
- current authorization bindings
- succession cutoffs.

Primary safety property:
NO_REPLAY_OF_HISTORICAL_EVIDENCE_MAY_CREATE_CURRENT_AUTHORITY_WITHOUT_A_CURRENT_PROTECTED_AUTHORIZATION_TRANSITION.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement. No runtime fault injection.

## Next attack
HISTORICAL ATTRIBUTION + KEY ROTATION + THRESHOLD SIGNATURES + PRIVACY DELETION + AUDIT FORK + MERGE/RECONCILIATION.

Question:
Can multiple historical signatures from different generations be combined into a current authorization claim without accidentally creating authority from evidence that was never jointly authorized?
