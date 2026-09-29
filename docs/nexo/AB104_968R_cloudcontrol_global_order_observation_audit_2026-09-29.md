# AB104.968R — Cloud Control operation ordering versus direct-service mutation and observation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When Cloud Control serializes its own requests for a resource, can a later Cloud Control read be treated as a globally ordered observation of the resource across direct underlying-service mutations?

## Fresh evidence
AWS Cloud Control API documents that only one Cloud Control resource operation can be performed at a time on a given resource, while the same resource can still be operated on directly through the underlying service. AWS also states that ListResources includes resources regardless of whether they were provisioned through Cloud Control API, directly through the underlying service, or another mechanism such as CloudFormation. Cloud Control GetResource returns the current state of the specified resource, while resource-operation tracking is tied to its own RequestToken and ProgressEvent.

## Findings
1. Cloud Control serialization is scoped to Cloud Control operations; it is not a global serialization domain for all possible resource actors.
2. List/Get observations can include resources whose lifecycle was performed outside Cloud Control. Therefore a current read does not reveal, by itself, which interface performed the historical mutation.
3. A Cloud Control RequestToken establishes identity/tracking for that request, not a total order over direct service, CloudFormation, or other mechanisms that can affect the same resource.
4. A later GetResource observation therefore proves current provider-observed state at that time, not the complete causal history between two Cloud Control requests.
5. If a global ordering claim is required, evidence must establish a common authority/serialization domain spanning all relevant actors, or explicitly preserve a partial order.
6. This is stronger than merely saying "concurrent operations are possible": the protocol itself defines a bounded serialization domain while acknowledging external mutation paths.
7. The correct evidence model must therefore attach an actor/interface/authority domain to operations and observations before constructing historical order.
8. No new top-level interaction class is justified. The result strengthens I19/I21/I22 and classes 7, 8, 12, 17, 19; class 20 remains conditional on explicit cross-domain atomicity.

## Anti-collapse
CLOUDCONTROL_SERIALIZATION != GLOBAL_RESOURCE_SERIALIZATION
GET_RESOURCE(t2) != COMPLETE_HISTORY
REQUEST_TOKEN != GLOBAL_ORDER
CURRENT_STATE != CAUSAL_HISTORY
NO_LOCAL_CONCURRENCY != NO_EXTERNAL_MUTATION
ACTOR_DOMAIN != RESOURCE_ID
PARTIAL_ORDER != TOTAL_ORDER
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 8, 12, 17, 19.
Secondary: I18 and class 20 where identity or cross-domain atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Cloud Control gives a useful local serialization boundary, but its own documentation establishes that resources may also be created or modified through other mechanisms. A current read therefore cannot be elevated into a globally ordered historical record without additional cross-domain authority evidence. Nexo must preserve actor/interface/authority domain and partial order when global ordering is not established.
