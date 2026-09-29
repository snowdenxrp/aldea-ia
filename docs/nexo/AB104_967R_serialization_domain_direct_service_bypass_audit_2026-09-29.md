# AB104.967R — same-resource serialization versus direct-service bypass

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If Cloud Control serializes its own operations on a resource, does that guarantee that the resource's full historical state is serialized across all actors and services?

## Fresh evidence
AWS Cloud Control API states that only one resource operation at a time can be performed on a given resource through Cloud Control API. The same documentation explicitly states that the resource can still be operated on directly through the underlying service, and warns that doing so can lead to unpredictable behavior. Cloud Control also states that resource operations are individually independent and that a single request may partially apply across multiple underlying calls. AWS therefore defines a serialization boundary for Cloud Control operations, not a universal serialization boundary for every actor capable of changing the resource.

## Findings
1. Cloud Control's one-operation-at-a-time rule is a local protocol serialization guarantee, not universal resource-history serialization.
2. A direct underlying-service operation can occur outside that Cloud Control serialization domain.
3. Therefore absence of a concurrent Cloud Control request does not prove absence of a concurrent or intervening underlying-service operation.
4. A later Cloud Control observation can therefore be stale relative to direct-service activity unless the provider contract establishes a common authoritative ordering boundary.
5. Cloud Control's request token orders/tracks a particular request, but does not establish a total order over all operations on the resource across all interfaces.
6. This creates a distinct evidence dimension: serialization-domain membership. Evidence must identify whether an operation occurred inside or outside the authority/order domain being relied upon.
7. A resource identifier remains insufficient to infer global operation ordering; the same resource can be affected by operations from multiple interfaces.
8. If Nexo needs to assert a global historical order, it must establish a provider-defined common authority/serialization mechanism; otherwise preserve a partial order or UNKNOWN.
9. No new top-level interaction class is justified. This strengthens I19/I21/I22 and classes 7, 8, 11, 12, 17, 19; class 20 remains conditional on explicit atomicity.

## Anti-collapse
LOCAL_SERIALIZATION != GLOBAL_SERIALIZATION
NO_CLOUDCONTROL_CONCURRENT_REQUEST != NO_DIRECT_SERVICE_OPERATION
REQUEST_ORDER != GLOBAL_RESOURCE_ORDER
RESOURCE_ID != GLOBAL_OPERATION_ORDER
CURRENT_OBSERVATION != COMPLETE_GLOBAL_HISTORY
PARTIAL_ORDER != TOTAL_ORDER
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 8, 11, 12, 17, 19.
Secondary: I15, I18 and class 20 where idempotency, identity, or cross-domain atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
Cloud Control's serialization guarantee is scoped to Cloud Control operations. Because the underlying resource can also be changed through a direct service interface, Nexo cannot promote local serialization into global historical ordering. The future evidence model must record the serialization/authority domain of each observation and preserve partial order or UNKNOWN when cross-domain ordering is not established.
