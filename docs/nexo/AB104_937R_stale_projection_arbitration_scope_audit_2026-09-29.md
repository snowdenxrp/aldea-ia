# AB104.937R — stale projection action after arbitration: scope/version boundary audit

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does a downstream consumer acting from a stale projection after an arbitration create a distinct interaction, especially when the arbitration covers one aggregate but the downstream action spans another?

## Fresh evidence
Microsoft's event-driven architecture guidance states that consumers have independent views and eventual-consistency windows can leave different parts of a system with different current-state views; it also notes ordering/idempotency challenges and the need for correlation IDs and reconciliation. Microsoft Event Sourcing states that projections are eventually consistent, the event stream remains the source of truth, and optimistic concurrency on one event stream does not automatically resolve conflicts spanning multiple entities. AWS Saga guidance states that concurrent orchestration can produce stale data because Saga lacks transaction isolation and recommends semantic locking for such cases. Concrete open-source implementations show projection checkpoints/versioning and explicit handling of stale or out-of-order events.

## Scenario
A1 is an authoritative arbitration concerning aggregate A.
P1 has incorporated A1 and starts remediation C1 affecting aggregate B.
P2 is still at projection version v0, before A1, and independently starts C2 affecting B.
C1 and C2 may be committed, rejected, or UNKNOWN.
A later reconciliation observes that P2 acted from stale state.

## Findings
1. The stale projection is an explicit decision-context fact: DECISION_CONTEXT_VERSION(P2)=v0, while authoritative arbitration is at a later version.
2. This does not make C2 nonexistent or automatically invalid. C2 is a separate operation with its own authority, target, lifecycle, and effect outcome.
3. Whether C2 was permitted despite stale context is a policy/contract question. It cannot be inferred solely from projection age.
4. If the arbitration's declared scope is aggregate A only, its semantic disposition cannot silently be extended to aggregate B. Scope must be explicit.
5. If C2 affects B and B has its own authoritative version/invariant, that B-side authority is a separate evidence question. A1 can be relevant evidence without becoming B's authority.
6. If C1 and C2 race on B, B-side optimistic concurrency may reject one local write, but that local rejection does not universally establish absence of an external effect.
7. If both effects commit, preserve both historical facts and represent their compatibility/incompatibility and causal relations separately.
8. If C2 is later deemed invalid under the arbitration, record the invalid assessment and any remediation obligation as new facts; do not rewrite C2 as never having occurred.
9. If C2's effect is irreversible or externally visible, stale context can increase remediation burden but does not create a new semantic class by itself.
10. A projection checkpoint/version is evidence of what the consumer had observed, not proof of global system state at the moment of execution.
11. A cross-aggregate arbitration-to-action boundary is therefore best represented with explicit scope, projection version, authority source, target aggregate/version, and provenance edges.
12. The evidence still decomposes the interaction into I21 stale observation/order + I19 provenance/conflict + class 11 external-effect ambiguity + class 12 reconciliation. I24 applies when the action remains IN_PROGRESS across an authority/context transition. I9/I15/I22 apply only when their specific dimensions are present.

## Representation
A1(scope=A, version=vA)
P2(observed=v0)
DECISION(C2, based_on=P2)
TARGET(C2, B, version=vB0)
C2 -> EFFECT-4
LATER_ASSESSMENT(C2, A1)
If authoritative: INVALID_UNDER(INVARIANT-ID)
If remediation required: C3 -> EFFECT-5
COMPENSATES(C3,EFFECT-4) only when explicitly evidenced.

## Anti-collapse rules
PROJECTION_VERSION != GLOBAL_STATE_VERSION
PROJECTION_FRESHNESS != AUTHORITY
ARBITRATION_SCOPE(A) != AUTHORITY_SCOPE(B)
A1_RELEVANT_TO(B) != A1_AUTHORIZES(B)
LOCAL_CONCURRENCY_REJECTION != EXTERNAL_EFFECT_ABSENT
STALE_CONTEXT != OPERATION_INVALID
INVALID_ASSESSMENT != NONOCCURRENCE
CHECKPOINT != GLOBAL_CUTOFF
CURRENT_PROJECTION != HISTORICAL_EVENT_GRAPH

## Classification
No new top-level interaction class justified.
W19/W20 remain NOT FROZEN.
Coverage denominator remains NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
The stronger formulation is not a new class but a required provenance boundary: Nexo must distinguish what a consumer had observed, what authority actually covered, which aggregate/version was targeted, and what effect actually occurred. Cross-aggregate scope mismatch is a parameter of I21/I19/reconciliation rather than a new top-level interaction on current evidence. A concrete production witness could still justify a new candidate later; none was established by this audit.
