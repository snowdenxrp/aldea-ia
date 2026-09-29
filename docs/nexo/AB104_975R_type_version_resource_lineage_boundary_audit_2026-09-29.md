# AB104.975R — resource type version binding does not establish resource-state lineage

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does binding a Cloud Control request to a specific resource type version establish that the resource state used and the eventual external effect share an exclusive, unchanged resource lineage?

## Fresh evidence
AWS documents that private resource types can specify a TypeVersionId for a resource operation; if omitted, the default version is used. AWS separately documents that UpdateResource first retrieves current state, composes the desired state, and then invokes the update handler. AWS also states that a resource operation can consist of multiple calls to the underlying service, can partially complete, and is not rolled back on failure. The ProgressEvent identifies the request and resource, but its TypeName/TypeVersionId semantics do not constitute a resource version or compare-and-swap proof for the underlying resource.

## Findings
1. TypeVersionId binds the resource-handler/type-definition version used for the operation; it is not a version of the target resource state.
2. Therefore TYPE_VERSION_ID_MATCH does not prove RESOURCE_STATE_VERSION_MATCH.
3. A request can be semantically tied to one handler version while the target resource is concurrently changed by another actor or operation domain.
4. A successful terminal status still establishes the request's terminal status, not exclusive historical lineage of every underlying mutation.
5. A later current-state match can corroborate an observed state but cannot convert type-version identity into causal uniqueness.
6. If the resource/provider exposes an independent resource generation/version and the handler enforces it at effect time, that additional evidence can narrow the uncertainty. This remains provider/resource-specific.
7. No new top-level interaction class is justified. The result strengthens I19/I21/I22 and classes 7, 8, 9, 11, 12, 17, 18, 19; class 20 remains conditional.

## Anti-collapse
TYPE_VERSION_ID != RESOURCE_STATE_VERSION
HANDLER_VERSION_MATCH != RESOURCE_LINEAGE_PROOF
SUCCESS != EXCLUSIVE_HISTORY
RESOURCE_IDENTIFIER != RESOURCE_VERSION
CURRENT_STATE_MATCH != CAUSAL_UNIQUENESS
REQUEST_IDENTITY != EFFECT_HISTORY
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 8, 9, 11, 12, 17, 18, 19.
Conditional: class 20 where cross-domain atomicity is explicitly claimed.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.975R separates semantic handler version from target resource version. A TypeVersionId can identify which resource-type definition executed the request, but it does not prove that the target resource remained on one exclusive state lineage through the external effect. Nexo must not substitute handler-version identity for resource-version or effect-lineage evidence.
