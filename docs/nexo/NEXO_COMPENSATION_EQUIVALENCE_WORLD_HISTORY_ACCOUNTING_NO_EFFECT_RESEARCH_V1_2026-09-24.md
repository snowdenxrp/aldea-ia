# NEXO — Compensation Equivalence, World-History Preservation, Accounting and No-Historical-Effect Claims V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Central finding
COMPENSATION_SUCCESS != HISTORICAL_ERASURE.
STATE_RESTORATION != WORLD_HISTORY_RESTORATION.
NET_ZERO != NO_EFFECT.

A compensation may reduce or reverse a current resource delta while leaving an irreversible historical event, audit fact, side effect, fee, notification, causal dependency, or third-party effect.

NIST incident-response guidance treats detection, response and recovery as distinct parts of an incident lifecycle, supporting the architectural distinction between recovering current operation and erasing history. [[WEB_CITATIONS]]

## 1. Three different claims
CurrentStateRestored, AccountingBalanced and HistoricalEffectAbsent are distinct claims.

CURRENT_STATE_RESTORED != ACCOUNTING_BALANCED != HISTORICAL_EFFECT_ABSENT.

## 2. Counterexample
E1 transfers 100. E2 transfers 100 back. Current balance may equal the original balance, while E1 and E2 still occurred, notifications may have been sent, fees charged, timestamps/order changed, or third parties may have reacted. Net-zero cannot justify a no-history claim.

## 3. Reversibility classes
R0 exactly reversible with verified causal inverse; R1 state-reversible but history-retaining; R2 compensable with residual effects; R3 partially reversible; R4 irreversible; R5 unknown. Classes are property/provider specific.

## 4. Compensation relation
Candidate relation Compensates(E2,E1,P) binds source effect, compensation effect, target/resource incarnation, provider contract, causal relation, ordering, policy/invariant, authority, residual effects, evidence and reconciliation. A compensation recommendation is not compensation authority.

## 5. No universal inverse
Some external effects have no true inverse: messages delivered, information disclosed, third-party actions triggered, irreversible deletion, physical actuation, resource consumption. Nexo cannot invent an inverse because a data model exposes a reverse operation.

## 6. Accounting is weaker than history
A ledger showing +100 and -100 may establish an accounting relation if the ledger is trustworthy and complete. It does not establish E1 never happened.

## 7. State restoration is weaker than causal restoration
A resource can return to the same observable state while its history differs. Separate STATE_EQUIVALENCE, HISTORY_EQUIVALENCE and CAUSAL_EQUIVALENCE claims.

## 8. Compensation can create new uncertainty
If E1 is UNKNOWN and E2 compensates it, later evidence may prove E1 succeeded. The world then contains E1 and E2; compensation does not erase the original uncertainty or history.

## 9. Concurrent effects
A compensation for E1 can interact with E3 from another actor. Compensation safety therefore requires an effect-interaction contract, not only knowledge of E1.

## 10. Third-party effects
Notifications, downstream jobs, replicas, caches, audit records, external decisions, provider charges and physical actions can survive restoration of the original resource. Effect closure must include relevant continuations.

## 11. Privacy deletion versus safety provenance
Privacy/data-retention rules may require deletion of ordinary content, but deleting security-relevant provenance can invalidate claims about authority, effect identity, revocation, incident response and reconciliation. Retention must be property-specific and governed by a protected retention contract. NIST's 2025 evidence-management work discusses preservation, integrity, retention and chain of custody as distinct evidence-management concerns. [[EVIDENCE_CITATION]]

## 12. Compensation storms
UNKNOWN → compensation → compensation-of-compensation → reconciliation effect → corrective effect can become unbounded. Existing compensation termination and uncertainty-budget research remains required.

## 13. Strong no-historical-effect claim
Candidate requirements: complete relevant effect-path closure; complete external observation capability for the claim; provider contract capable of detecting/attesting absence; resource-incarnation continuity; causal ordering; no hidden continuation; no unresolved third-party effect; retained provenance sufficient for the claim; explicit absence-capable evidence contract.
Otherwise NO_EFFECT_CLAIM = UNKNOWN.

## 14. Absence evidence is asymmetric
Positive evidence can establish an effect occurred. Absence requires an observation mechanism capable of detecting the effect across the relevant boundary. NO_RECORD != NO_EFFECT.

## 15. Compensation equivalence classes
CE0 EXACT_INVERSE; CE1 STATE_RESTORING; CE2 ACCOUNTING_RESTORING; CE3 PARTIAL_COMPENSATION; CE4 RESIDUAL_EFFECTS; CE5 UNKNOWN_COMPENSATION; CE6 CONFLICTING_COMPENSATION; CE7 QUARANTINED.

## 16. ExternalEffectHistory
Candidate retained claim-relevant fields: effect identity, attempt identity, resource incarnation, provider execution ID, causal predecessor/successor, authorization context, observation, reconciliation, compensation relation, residual effects, invalidation and retention boundary. This is not necessarily a complete global history; claim scope must be explicit.

## 17. History compression
Compaction may replace raw events with causal summaries only if every distinction required by active claims survives. COMPACTION != HISTORY_ERASURE and SUMMARY_VALIDITY != ORIGINAL_EVENT_ABSENCE.

## 18. Recovery
RESTORE → identify uncertain effects → identify compensations → build joint effect graph → reconcile resources/incarnations → classify residual history → recompute claims → revalidate authority/fences → release or quarantine.

## 19. Provider contract floor
For claims stronger than current-state restoration, provider capabilities must support the claim. If the provider cannot expose historical execution or absence semantics, Nexo must weaken the claim. CLAIM_STRENGTH <= PROVIDER_OBSERVABILITY/CONTROL_CONTRACT.

## 20. Formal implications
Future model needs effect graph, history relation, compensation relation, reversibility class, residual-effect set, accounting state, current resource state, historical attribution, observation/absence capability, retention boundary and third-party continuation closure.

Lamport's TLA+ material describes history variables as a way to record past behavior when needed for refinement, directly relevant to keeping historical facts distinct from current state. [[LAMP_CITATION]]

## 21. Candidate invariants
WH-01 COMPENSATION_SUCCESS_DOES_NOT_ERASE_HISTORY
WH-02 STATE_RESTORATION_DOES_NOT_PROVE_HISTORY_RESTORATION
WH-03 ACCOUNTING_BALANCE_DOES_NOT_PROVE_NO_EFFECT
WH-04 NO_UNIVERSAL_INVERSE_EFFECT
WH-05 COMPENSATION_IS_A_PROTECTED_EFFECT
WH-06 COMPENSATION_RELATION_IS_PROPERTY_SPECIFIC
WH-07 THIRD_PARTY_SIDE_EFFECTS_REMAIN_IN_EFFECT_CLOSURE
WH-08 UNKNOWN_SOURCE_EFFECT_CANNOT_BE_ERASED_BY_COMPENSATION
WH-09 ABSENCE_CLAIM_REQUIRES_ABSENCE_CAPABLE_OBSERVATION
WH-10 NO_RECORD_DOES_NOT_PROVE_NO_EFFECT
WH-11 HISTORY_RETENTION_IS_CLAIM_SPECIFIC
WH-12 COMPACTION_CANNOT_ERASE_CLAIM_RELEVANT_PROVENANCE
WH-13 COMPENSATION_CHAINS_REQUIRE_TERMINATION_BOUNDS
WH-14 PROVIDER_OBSERVABILITY_BOUNDS_CLAIM_STRENGTH
WH-15 RECOVERY_MUST_RECONCILE_EFFECT_AND_COMPENSATION_GRAPH
WH-16 HISTORICAL_ATTRIBUTION_CANNOT_RESURRECT_CURRENT_AUTHORITY
WH-17 RESIDUAL_EFFECTS_MUST_BE_EXPLICITLY_CLASSIFIED
WH-18 NET_ZERO_CANNOT_BE_PROMOTED_TO_NO_HISTORY.

## 22. Open gaps
WH-G1 Formal history-equivalence algebra.
WH-G2 Provider inverse contracts.
WH-G3 Absence-capable observation.
WH-G4 Third-party side-effect closure.
WH-G5 Compensation under concurrent effects.
WH-G6 Accounting/history relationship.
WH-G7 Retention/compaction proof boundary.
WH-G8 Recovery with partially observed compensation.
WH-G9 Formal refinement.
WH-G10 SANY/TLC/TLAPS validation.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.