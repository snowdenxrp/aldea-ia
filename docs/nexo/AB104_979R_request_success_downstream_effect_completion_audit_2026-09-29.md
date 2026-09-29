# AB104.979R — retained request status does not prove downstream effect completion

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When a Cloud Control RequestToken remains observable and reports SUCCESS, does that provider-side terminal status prove that all asynchronous downstream work associated with the operation has completed?

## Fresh evidence
AWS states that Cloud Control resource requests are asynchronous and that a single resource operation can consist of multiple calls to the underlying service. AWS also explicitly states that canceling a Cloud Control request does not terminate asynchronous operations that may already have started on downstream services. The RequestToken and ProgressEvent track the Cloud Control resource operation request. The documentation does not state that RequestToken retention is an authoritative ledger of every downstream asynchronous effect after the handler's interaction with the service.

## Findings
1. RequestToken is an identity for tracking the Cloud Control resource operation request; it is not automatically an identity for every downstream asynchronous effect.
2. A retained terminal ProgressEvent therefore establishes provider-side request status, not universal completion of all downstream work.
3. The seven-day request-record horizon is an observability boundary for the Cloud Control request, not an effect-lifetime boundary.
4. A downstream service can have its own operation identity, status, retry, retention, and completion semantics; those must be treated as separate evidence domains unless the provider contract explicitly binds them.
5. Therefore REQUEST_STATUS_SUCCESS does not universally imply ALL_DOWNSTREAM_EFFECTS_COMMITTED.
6. Conversely, absence of a retained RequestToken record after expiry does not prove absence of downstream effects.
7. This sharpens the previously established distinction between request identity and effect identity and strengthens I19/I21/I22 plus classes 11, 12, 15, 17, 19.
8. No new top-level interaction class is justified.

## Anti-collapse
REQUEST_TOKEN != DOWNSTREAM_EFFECT_ID
REQUEST_SUCCESS != ALL_DOWNSTREAM_EFFECTS_COMMITTED
REQUEST_RECORD_RETENTION != EFFECT_RETENTION
REQUEST_STATUS != GLOBAL_EFFECT_LEDGER
DOWNSTREAM_ASYNC_WORK != REQUEST_RECORD_LIFETIME
REQUEST_RECORD_ABSENCE != EFFECT_ABSENCE
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22.
Interactions: I15; classes 11, 12, 15, 17, 19.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.979R establishes a provider-boundary rule: retained SUCCESS for a Cloud Control request is not a universal downstream-effect completion oracle. Nexo must keep request-status evidence separate from downstream effect evidence unless an explicit provider contract closes that relation.
