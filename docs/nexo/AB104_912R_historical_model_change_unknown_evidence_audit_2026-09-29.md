# AB104.912R — Historical evidence under later provider model/semantic change
Date: 2026-09-29

## Question
A provider previously declared a closed and complete transition model under which a state was uniquely caused by C2. Later the provider changes its semantics/model. Does the older contract remain sufficient to resolve an UNKNOWN that arose under the older model?

## Fresh evidence
- Microsoft Event Sourcing guidance states persisted events are the permanent source of information, should remain immutable, and schema evolution should use versioning/upcasting; changing application code does not change historical events.
- AWS Event Sourcing guidance separates immutable event history from derived projections and requires event versioning as schemas evolve. External-system queries may be stored because their result can depend on time.
- W3C PROV supports versioning, derivation, time, provenance of provenance, and distinct target URIs for different revisions. PROV therefore provides a model for retaining historical claims without treating a later representation as the same revision.
- W3C PROV constraints define validation of a provenance instance as consistency of the represented history, rather than making later observations automatically rewrite prior provenance.

## Attack
At T1:
Provider contract V1 declares a closed transition model M1.
C2 is invoked.
Response is lost.
C2 = UNKNOWN.

At T2:
Provider changes semantics/model to V2.
The same current state S is now reachable through additional path P2 that did not exist under M1.

Question:
Can the T2 model retroactively invalidate the T1 inference, or can T1 evidence still resolve C2?

Cases:
A) V1 contract was valid and complete for the effect domain at T1, and the provider preserves historical version semantics.
B) V2 merely adds a new transition after T1.
C) V2 changes the interpretation of an old state/event retroactively.
D) V1 contract was never actually authoritative/comprehensive.
E) provider supplies versioned historical provenance explicitly identifying the operation.

## Findings
1. A later semantic change does not automatically erase a valid historical fact or historical contract interpretation.
2. If V1 was authoritative and complete for the relevant domain/time at T1, then V2's later-added transition does not retroactively create an alternative T1 causal path.
3. However, if the old contract did not guarantee historical completeness or the provider does not preserve which semantic version governed the effect, later model change can make the original causal inference non-recoverable.
4. A current V2 state query must not be applied to a T1 UNKNOWN as though V2 had governed T1.
5. Historical evidence must be evaluated under the contract/version that governed the relevant effect time, with explicit version binding.
6. If the provider retroactively changes the meaning of an old persisted event/state without preserving its prior semantics, historical auditability is weakened; this is a provenance/history integrity issue, not evidence that C2 occurred.
7. Versioned provider history/provenance directly bound to C2 can resolve UNKNOWN even after later model evolution.
8. Therefore CURRENT_SEMANTICS != HISTORICAL_SEMANTICS, and MODEL_VERSION != EFFECT_TIME unless the contract explicitly binds them.
9. No new top-level interaction class is justified; this remains class11/class12 plus I19/I21 and the existing provenance/version/incarnation distinctions.

## Refinements
- CURRENT_SEMANTICS != HISTORICAL_SEMANTICS
- MODEL_VERSION MUST BE BOUND TO EFFECT_TIME FOR HISTORICAL INFERENCE
- LATER_TRANSITION != RETROACTIVE_CAUSAL_PATH
- VERSION_EVOLUTION != HISTORICAL_ERASURE
- CURRENT_MODEL != HISTORICAL_CONTRACT
- HISTORICAL_CONTRACT_VALIDITY IS TIME/DOMAIN SCOPED
- RETROACTIVE_REINTERPRETATION != PROOF_OF_EXECUTION
- VERSIONED_PROVENANCE CAN PRESERVE HISTORICAL MEANING
- UNKNOWN CANNOT BE RESOLVED BY APPLYING A LATER MODEL WITHOUT A DECLARED BRIDGE

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
