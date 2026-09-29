# AB104.911R — Causal uniqueness hypothesis vs historical effect evidence
Date: 2026-09-29

## Question
A current provider state appears uniquely reachable if correction C2 occurred. Can that apparent causal uniqueness resolve an UNKNOWN outcome when the uniqueness depends on an assumed model of all external causes?

## Fresh evidence
- AWS Event Sourcing treats the event store as the historical record and derives current state by replay; this separates state reconstruction from complete historical evidence.
- W3C PROV models provenance through entities, activities, derivations and qualified generation/usage relationships; provenance is therefore explicit evidence about how a result was produced, not merely the result itself.
- The current IETF Action Evidence Boundary draft requires EXECUTED evidence matched to the exact action, operation identifier, provider environment and audience; it requires INDETERMINATE when invocation may have reached the effecting system but authoritative evidence does not establish EXECUTED or FAILED.

## Attack
C2 is dispatched and becomes UNKNOWN.
Later provider query returns S_final.

Local model M says:
S_final can only be produced if C2 executed.

But the system cannot prove that M enumerates every external actor, manual operation, asynchronous job, correction, migration path, or provider-side process that can also produce S_final.

Cases:
A) M is a formally declared and provider-backed complete transition model.
B) M is only a local model inferred from observed API behavior.
C) provider has undocumented/opaque actors that can produce the same state.
D) provenance/history endpoint independently links S_final to C2.

## Findings
1. Apparent causal uniqueness is only evidence if the model establishing uniqueness is itself authoritative and complete for the relevant effect domain.
2. A local closed-world assumption cannot automatically be promoted to a proof of historical execution against an external open-world system.
3. If the provider contract formally establishes that S_final is reachable only through C2, and the query is bound to the exact target/incarnation, then the state can resolve C2 under that contract.
4. If uniqueness is merely inferred from the client's known transitions, C2 remains UNKNOWN because an unobserved external path could produce the same state.
5. A provenance/history record that explicitly links C2 to S_final is stronger direct evidence and can resolve the UNKNOWN when identity and authority are valid.
6. Therefore causal uniqueness is not a property of the observed state alone; it is a property of state + complete authoritative transition model + identity binding.
7. This is another instance of COMPLETE_LOCAL_MODEL != COMPLETE_EXTERNAL_HISTORY.
8. No new top-level interaction class is justified. The case remains class11/class12 plus I19/I21 and the existing provenance/authority distinctions.

## Refinements
- APPARENT_CAUSAL_UNIQUENESS != PROVEN_CAUSAL_UNIQUENESS
- LOCAL_CLOSED_WORLD_ASSUMPTION != EXTERNAL_HISTORY_COMPLETENESS
- STATE_UNIQUENESS REQUIRES AUTHORITATIVE TRANSITION-CLOSURE
- OBSERVED_TRANSITIONS != ALL_POSSIBLE_TRANSITIONS
- CURRENT_STATE + INCOMPLETE_MODEL != EXECUTED_PROOF
- PROVENANCE_LINK > INFERRED_CAUSALITY WHEN BOTH ARE AVAILABLE
- AUTHORITATIVE_MODEL + EXACT_TARGET_BINDING MAY RESOLVE UNKNOWN
- UNKNOWN REMAINS WHEN AN UNMODELED CAUSAL PATH IS POSSIBLE

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
