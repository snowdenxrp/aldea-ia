# AB105.022R — Concrete resource identity cases: S3 bucket and CloudFormation custom resource
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

Do concrete resource types demonstrate that identifier stability, replacement, and incarnation semantics differ by provider/resource type, and can those semantics distinguish same-incarnation update from replacement or reuse?

## Primary evidence reviewed

AWS CloudFormation resource-type schemas define a resource type's primary identifier and may define additional identifiers, create-only properties, conditional create-only properties, and replacement strategy.

AWS's S3 CloudFormation documentation states that BucketName is a replacement property: changing it requires replacement. A user-specified bucket name cannot be used with updates that require replacement unless the name is changed.

AWS's CloudFormation custom-resource contract explicitly defines PhysicalResourceId as provider-defined and unique for that provider. For updates, keeping the same PhysicalResourceId is treated as a normal update; changing it causes CloudFormation to interpret the update as a replacement and send a delete request for the old resource.

## Findings

### F1 — S3 demonstrates a provider identity that is also a service-level name

For AWS::S3::Bucket, BucketName is a resource identifier used for import and is documented as a replacement-triggering property.

This creates a strong relation:

BucketName change -> replacement required

But the fact that a bucket name is stable across ordinary configuration changes does not prove that the bucket existed continuously during an unobserved interval. A historical continuity claim still requires retained observations and coverage.

### F2 — S3 name reuse is a distinct question from identifier equality

A bucket name can be a strong target selector, but identifier equality across two observations does not by itself establish uninterrupted historical existence. The reconstruction must still account for deletion/recreation semantics and the relevant provider guarantees about name reuse.

Therefore:

same BucketName at t1 and t2
!= automatic proof of one uninterrupted incarnation.

### F3 — Custom resources make incarnation semantics explicit

CloudFormation's custom-resource contract is unusually explicit: the provider defines PhysicalResourceId; if it remains the same across an update, CloudFormation treats the operation as a normal update. If it changes, CloudFormation interprets the update as a replacement and sends a delete request for the old physical ID.

This gives a concrete provider-contract example where identity transition has direct lifecycle semantics:

same PhysicalResourceId -> update path
changed PhysicalResourceId -> replacement path

This is strong evidence for a lifecycle boundary inside the CloudFormation custom-resource contract.

### F4 — The custom-resource rule still does not prove external historical continuity

The contract defines how CloudFormation interprets the provider's returned PhysicalResourceId during an observed update. It does not prove that an identifier was never reused outside the observed CloudFormation lifecycle, nor does it reconstruct missing historical events.

Therefore even the strongest explicit identity contract must be combined with retained observations and coverage.

### F5 — Resource-type identity is heterogeneous

The evidence now demonstrates three distinct layers that must not be collapsed:

1. CloudFormation logical identity:
   LogicalResourceId, template-scoped.

2. Resource-type identity:
   primaryIdentifier/additionalIdentifiers, defined by the resource provider schema.

3. Physical/provider identity:
   PhysicalResourceId or service-level identifier, with semantics dependent on the resource type/provider.

A generic Nexo evidence model must preserve these as separate fields.

### F6 — Replacement is positive evidence of an incarnation transition, not a retrospective history source

When a provider contract says an observed change requires replacement and the resulting event records the new identity, the evidence can establish a bounded transition:

identity_old --observed replacement--> identity_new

It does not establish the entire history before identity_old or after identity_new.

### F7 — Identity contract + observation remains the minimum safe pattern

For a historical claim crossing an acquisition boundary:

identity semantics alone -> contract knowledge, not historical fact.

identifier observation alone -> observed identity, not universal continuity.

identity semantics + retained lifecycle observations + target binding + coverage
-> bounded historical claim.

## Distinguishing cases

### Same-incarnation update

Admissible only when:
- provider/resource contract permits update without replacement;
- identity remains bound to the same target;
- lifecycle event is retained;
- coverage is sufficient for the claim.

### Replacement

Admissible when:
- provider/resource contract establishes replacement semantics;
- the replacement event is observed;
- old/new identities are bound to the operation;
- relevant coverage exists.

### Delete/recreate

Requires evidence of the delete/recreate boundary or an equivalent provider-supported lifecycle relation. Merely observing the same identifier later is insufficient.

### Identifier reuse

Requires provider-specific evidence that the identifier can be reused or a lifecycle sequence demonstrating different incarnations. If reuse cannot be ruled out and continuity is required, preserve UNKNOWN.

## Anti-collapse rules

Do not collapse:

LogicalResourceId -> provider resource identity
primaryIdentifier -> historical incarnation
BucketName equality -> uninterrupted existence
PhysicalResourceId equality -> global non-reuse
replacement capability -> observed replacement
same identifier after gap -> same incarnation
schema semantics -> historical observation
current read -> missing lifecycle history

## New distilled rule

Identity evidence is two-dimensional:

A. **What does this identifier mean?**
   Provider/resource-type contract.

B. **What happened to this identifier?**
   Retained lifecycle observation.

Historical reconstruction requires both dimensions plus scope/coverage.

## Status ledger

- Concrete resource-type contrast: FOUND.
- S3 replacement identity semantics: FOUND.
- Custom-resource explicit PhysicalResourceId replacement semantics: FOUND.
- Universal identifier non-reuse guarantee: NOT ESTABLISHED.
- Universal incarnation continuity: NOT ESTABLISHED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate the deletion/recreation and import semantics of a resource whose provider-level name can be reused, and compare them with a resource whose provider contract supplies a clearly instance-specific identifier. The goal is to determine the minimum evidence needed to distinguish identifier reuse from same-incarnation continuity across a management boundary.

Do not generalize beyond the documented resource/provider semantics.
