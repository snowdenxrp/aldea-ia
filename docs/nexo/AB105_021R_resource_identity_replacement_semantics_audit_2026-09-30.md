# AB105.021R — Resource-type identity and replacement semantics for acquisition-boundary reconstruction
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Can CloudFormation's PhysicalResourceId / primary identifier be treated as a stable resource-incarnation boundary when reconstructing history across import or management transitions?

## Primary evidence reviewed

AWS CloudFormation documents that each resource type has a primary identifier defined by its resource type schema. The schema also permits additional identifiers and declares create-only properties and replacement strategy.

AWS documents that a replacement update recreates a resource and generates a new physical ID. The exact update behavior is resource/property specific.

For resource import, CloudFormation requires a resource-type-specific identifier property/value. AWS explicitly states that the identifier property varies by resource type.

## Findings

### F1 — Resource identity is resource-type-specific

The resource-type schema defines a primary identifier as the properties that form the unique identifier for an instance of that resource type. Additional identifiers may also exist.

Therefore a generic Nexo rule such as:

PhysicalResourceId == universal incarnation ID

would overstate the provider contract.

The safe abstraction is:

provider_resource_type + provider_defined_primary_identifier_semantics

rather than a universal identifier assumption.

### F2 — Replacement provides an explicit incarnation boundary when documented

AWS states that a replacement recreates the resource and generates a new physical ID.

Where a resource/property update is documented as Replacement, a new physical ID is therefore evidence of a new resource instance relative to that replacement operation.

This is strong positive evidence for an incarnation transition:

old physical identity --replacement--> new physical identity

However, this does not prove that every resource type exposes replacement behavior in the same way, nor does it prove history before the earliest retained observation.

### F3 — Same identifier is not automatically proof of uninterrupted existence

The converse does not follow:

same identifier at t1 and t2 -> uninterrupted existence for [t1,t2]

That implication would require provider-specific guarantees that the identifier cannot be reused or that the underlying resource incarnation is preserved across the interval.

Without that contract, the interval remains bounded by observations.

### F4 — Import identifier is an acquisition lookup key, not historical proof

CloudFormation import uses a resource-type-specific identifier property/value to map the template logical ID to the existing target.

This establishes how the import targets a resource. It does not by itself establish when that resource was created, every prior configuration state, or continuity from a prior management relationship.

Thus:

import_identifier -> target selection

not:

import_identifier -> complete historical lineage

### F5 — Create-only properties strengthen replacement inference but do not create a retrospective journal

The resource schema can declare properties that are create-only. Changes requiring replacement can therefore be tied to provider-defined resource lifecycle semantics.

But schema semantics are not themselves historical observations. They tell us what the provider contract says an operation means; they do not prove that a particular operation occurred when no event/evidence records it.

### F6 — Primary identifier and physical identifier must remain separate concepts

A resource schema's primary identifier is a provider-defined uniqueness key for a resource instance. PhysicalResourceId is an identifier appearing in CloudFormation resource events.

They can participate in the same evidence chain, but Nexo must not silently equate their semantics.

For a custom resource, AWS explicitly documents that changing PhysicalResourceId causes CloudFormation to interpret the update as a replacement and send a delete request for the old resource. This is strong evidence that, at least for custom resources, physical-ID change has lifecycle significance.

That semantics cannot automatically be generalized to every resource type.

## Acquisition-boundary reconstruction rule

A reconstruction crossing acquisition/management boundary may treat an identity transition as an explicit incarnation boundary only when the provider/resource-type contract establishes the relation.

Positive case:

documented replacement semantics
+ provider event for the replacement
+ old/new identities bound to the operation
= bounded evidence of an incarnation transition.

Negative case:

same identifier observed at two times
+ no provider guarantee of non-reuse/continuity
= no proof of uninterrupted historical continuity.

Unknown case:

resource imported with a resource-type identifier
+ no retained pre-import lifecycle evidence
= pre-import lifecycle remains UNKNOWN except for claims directly supported by retained provider evidence.

## Anti-collapse rules

Do not collapse:

primary_identifier -> historical creation time
primary_identifier -> universal incarnation ID
PhysicalResourceId -> universal incarnation ID
same_identifier_at_t1_t2 -> continuous existence
import_identifier -> historical lineage
resource_schema -> historical observation
replacement_capability -> evidence that replacement occurred
current_resource_state -> prior lifecycle state

## New distilled evidence rule

For an identity claim across the acquisition boundary, require two distinct layers:

1. **Identity semantics**
   - provider/resource-type contract explaining what the identifier means and whether it can change/reuse.

2. **Historical observation**
   - retained provider evidence showing the identifier and lifecycle event at the relevant time.

Only their combination can support a bounded historical claim.

Conceptually:

identity_contract + observed_event + target_binding + coverage
-> bounded historical claim

identity_contract alone
-> semantics, not history

observed_identifier alone
-> observation, not universal continuity

## Status ledger

- Resource-type primary-identifier semantics: FOUND.
- Resource-specific replacement semantics: FOUND.
- Explicit new-physical-ID-on-replacement rule: FOUND in CloudFormation documentation.
- Universal no-reuse/incarnation guarantee: NOT ESTABLISHED.
- Same-ID uninterrupted continuity: NOT ESTABLISHED universally.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Select concrete high-value resource types and inspect their provider schemas/API identity and replacement semantics, including at least one resource where physical identity is stable across updates and one where replacement changes identity. Determine whether the resulting evidence can distinguish same-incarnation update, replacement, deletion/recreation, and identifier reuse without relying on timestamp inference.

Do not generalize the result beyond the resource types actually evidenced.
