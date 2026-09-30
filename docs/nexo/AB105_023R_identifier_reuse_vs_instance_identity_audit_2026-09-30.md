# AB105.023R — Identifier reuse vs instance-specific identity across deletion/recreation
Date: 2026-09-30
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Research question

What minimum evidence distinguishes deletion/recreation plus identifier reuse from continuity of the same incarnation across a management boundary, when comparing a reusable provider-level name with an instance-specific identifier?

## Primary evidence reviewed

AWS S3 naming documentation states that general-purpose bucket names are globally unique within a partition while the bucket exists, but after deletion the name can become available again and another AWS account can create a new bucket with the same name. AWS also states that the name may not become available immediately and may not become available again.

AWS CloudFormation documents physical IDs as identifiers for physical resource instances. Its examples distinguish an EC2 instance ID from an S3 bucket name. EC2 instance identity documents contain the instanceId and instance attributes for the launched instance.

CloudFormation import requires an identifier property and identifier value that identify the existing target resource; import validation establishes that the resource exists and conforms to the resource-type schema, but import itself is not a retrospective lifecycle record.

## Findings

### F1 — S3 proves that name equality can cross incarnations

S3 explicitly permits a deleted general-purpose bucket name to become available for reuse, including by another account in the same partition. Therefore:

same BucketName at t1 and t2
!= proof of same bucket incarnation.

The second observation can refer to a newly created resource after the first was deleted.

This is direct provider evidence of identifier reuse as a real lifecycle possibility, not merely a theoretical concern.

### F2 — The management boundary makes target lookup different from historical identity

CloudFormation import identifies an existing resource by a resource-type-specific identifier and validates that the target exists and conforms to the schema. This establishes a present target relationship:

import(identifier X at t2) -> resource X exists and is importable at t2.

It does not establish:

resource X at t2 == resource X at t1

unless an additional lifecycle/identity bridge exists.

Therefore import evidence must remain current-target evidence unless accompanied by retained historical evidence.

### F3 — Instance-specific identifiers provide a stronger identity dimension

CloudFormation uses an EC2 instance ID as an example of a physical ID, while EC2's instance identity document contains the instanceId and launch-related attributes for that instance. This is materially different from a reusable service-level name such as an S3 bucket name: the evidence is attached to an individual launched instance rather than merely to a selectable name.

However, the evidence reviewed here does NOT establish a universal AWS-wide non-reuse theorem for every physical/instance identifier. Therefore the safe abstraction is not “instance ID can never be reused”; it is “the provider supplies a stronger instance-binding contract than a reusable name, subject to the documented semantics of that resource type.”

### F4 — Positive transition evidence is stronger than identifier equality

A deletion/recreation sequence can be established when retained lifecycle records bind:

old identity -> deletion event -> recreation/create event -> new identity.

If the provider contract additionally establishes that the identity changed because a replacement occurred, this can establish an incarnation boundary.

Conversely, if only the same reusable identifier is observed before and after an evidence gap, the correct state is UNKNOWN for uninterrupted continuity.

### F5 — Minimum evidence for same-incarnation continuity

For a claim crossing an acquisition/management boundary, the minimum safe pattern is:

1. identity contract — what the identifier means for this resource type;
2. target binding — evidence that the observation refers to the intended resource;
3. lifecycle evidence — retained creation/update/delete/replacement observations as applicable;
4. incarnation relation — explicit provider semantics or observed old/new identity transition;
5. temporal coverage — enough retained evidence to cover the interval relevant to the claim;
6. provenance/integrity — evidence that the retained records are attributable to the claimed source and scope.

If any component required by the specific claim is absent, the historical claim must be bounded or preserved as UNKNOWN.

### F6 — Two concrete cases

Reusable provider-level name (S3):

BucketName equality -> strong target selector, but not continuity proof.

Deletion + later creation with the same name -> potentially different incarnation.

Instance-specific physical identifier (EC2):

instanceId + provider instance evidence -> stronger binding to one launched instance.

But a historical continuity claim still requires lifecycle coverage; the identifier alone does not fill an unobserved interval.

### F7 — Import cannot manufacture missing history

Import establishes that a current resource exists and is eligible for management by the importing stack. AWS explicitly recommends drift detection after import to compare expected and actual configuration. Therefore import should be modeled as a management-boundary event, not as a synthetic reconstruction of all prior lifecycle state.

## Anti-collapse rules

Do not collapse:

- reusable name -> incarnation identity;
- import identifier -> historical lineage;
- identifier equality -> uninterrupted existence;
- present existence -> historical existence throughout a gap;
- physical/instance identifier -> universal non-reuse theorem;
- deletion/recreation capability -> observed deletion/recreation;
- replacement semantics -> retrospective lifecycle history;
- current drift result -> complete prior configuration history.

## New distilled rule

Identifier strength is not sufficient by itself. Historical continuity requires an identity contract plus lifecycle evidence covering the relevant interval.

For reusable names, equality across a gap is explicitly non-conclusive when the provider permits reuse.

For instance-specific identifiers, the identity binding is stronger, but continuity remains bounded by the provider's documented semantics and retained lifecycle coverage.

Operationally:

reusable_identifier(t1) == reusable_identifier(t2) + gap -> UNKNOWN continuity

instance_bound_identifier(t1/t2) + provider lifecycle evidence + coverage -> bounded continuity claim

delete(old) + create(new) + explicit identity transition -> incarnation boundary

## Status ledger

- Provider-level name reuse as a concrete lifecycle possibility: FOUND (S3).
- Import as current-target evidence rather than historical proof: FOUND.
- Instance-specific physical identity as a stronger binding dimension: FOUND.
- Universal non-reuse theorem across providers/resource types: NOT ESTABLISHED.
- Universal continuity from identifier equality: REJECTED.
- Acquisition-boundary closure: NOT CLOSED GLOBALLY.
- Reconstruction: BOUNDED/PER-CLAIM ONLY.
- W19/W20: NOT FROZEN.
- Coverage denominator: NOT FROZEN.
- Formal verification: NOT PERFORMED.
- Implementation: NOT STARTED.
- Architecture/semantic freeze: NOT DECLARED.
- AB50–AB58 unresolved ternary/EventDAG state: CARRIED FORWARD UNCHANGED.

## Exact next research direction

Investigate whether retained provider-side lifecycle evidence can establish a complete creation→management→deletion/recreation chain for a concrete resource, and determine how gaps in that chain must be represented when some lifecycle records are unavailable. Compare provider-native event history with CloudFormation's management history and test whether either source can legitimately close an acquisition-boundary claim without an explicit completeness/coverage guarantee.

Do not generalize beyond documented provider semantics or observed evidence.
