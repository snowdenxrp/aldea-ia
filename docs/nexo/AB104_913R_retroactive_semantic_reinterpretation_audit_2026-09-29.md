# AB104.913R — Legitimate retroactive semantic reinterpretation audit
Date: 2026-09-29

## Question
V1 and V2 are both valid provider semantics, and V2 explicitly permits reinterpretation of selected historical events. What evidence and contract boundaries are required so that reinterpretation is legitimate without erasing historical meaning?

## Fresh evidence
- Microsoft Event Sourcing states that persisted events are immutable; event versioning lets consumers select handling logic by version, while upcasting transforms older schemas at read time without changing stored events. Compensating events are separate historical events.
- AWS Event Sourcing similarly treats the event store as immutable historical record, recommends event versioning, and distinguishes replay/current-state derivation from external system effects.
- W3C PROV models provenance with entities, activities, agents, time, derivation and qualified relationships; its constraints provide consistency conditions for provenance instances. Provenance is therefore suitable for representing which interpretation/derivation produced a result, rather than replacing the underlying entity/history.

## Attack
T1:
Historical event E1 is stored under V1.
V1 semantics: E1 has meaning M1.
C2 remains UNKNOWN.

T2:
Provider publishes V2.
V2 is explicitly declared retroactive for a bounded historical domain D and states that E1 may be interpreted as M2 under specified migration rules.

Cases:
A) V2 changes only schema representation; E1's historical fact remains identical.
B) V2 adds a documented semantic interpretation with explicit effective scope and migration rule.
C) V2 silently changes the meaning of E1.
D) V2 conflicts with a prior externally committed effect derived from M1.
E) V2 reinterpretation is authorized but provenance does not preserve whether M1 or M2 was used for an earlier decision.

## Findings
1. A legitimate retroactive reinterpretation must be an explicit versioned policy/contract, not an accidental consequence of deploying new code.
2. It must define scope: which historical entities/events, from what time/version/domain, and what transformation or interpretation applies.
3. The original stored event/fact should remain identifiable; reinterpretation should be represented as a new interpretation/migration/derivation rather than silently overwriting history.
4. Schema upcasting is not the same as changing the historical fact. It transforms representation while preserving the stored event.
5. A true semantic reinterpretation changes the interpretation layer, not necessarily the underlying historical event identity.
6. If an earlier external decision/effect was made under M1, V2 does not automatically make that historical decision invalid. A separate correction/reconciliation policy is required.
7. If V2 retroactively changes the semantics of an old event and provenance cannot establish which semantic version governed an earlier decision, the historical decision may become UNKNOWN even if the event itself remains known.
8. Retroactive policy must not silently convert an old UNKNOWN into EXECUTED solely because V2 now maps the state to a different interpretation.
9. A valid reinterpretation requires at minimum: version identity, effective scope/time, authority for retroactive change, deterministic transformation rule, preserved original evidence, and provenance linking old interpretation to new interpretation.
10. No new top-level interaction class is justified; the case remains I19/I21 + class11/class12 and existing provenance/version distinctions.

## Refinements
- RETROACTIVE_POLICY != RETROACTIVE_ERASURE
- SEMANTIC_REINTERPRETATION != HISTORICAL_FACT_REWRITE
- SCHEMA_UPCAST != SEMANTIC_REINTERPRETATION
- V2_INTERPRETATION != V1_DECISION
- NEW_INTERPRETATION != NEW_HISTORICAL_EVENT
- EFFECT_HISTORY != CURRENT_INTERPRETATION
- RETROACTIVE_AUTHORITY MUST BE EXPLICIT
- RETROACTIVE_SCOPE MUST BE BOUNDED
- ORIGINAL_EVIDENCE MUST REMAIN IDENTIFIABLE
- PROVENANCE MUST LINK PRIOR_INTERPRETATION → NEW_INTERPRETATION
- V2_REINTERPRETATION != PROOF_OF_PREVIOUS_EXECUTION
- PRIOR_EFFECT_CORRECTION REQUIRES SEPARATE POLICY

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
