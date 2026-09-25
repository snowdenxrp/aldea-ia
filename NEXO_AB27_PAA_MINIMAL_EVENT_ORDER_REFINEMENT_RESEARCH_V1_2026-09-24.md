# NEXO AB27 — P_AA MINIMAL EVENT-ORDER STRUCTURE, ORDER EQUIVALENCE, AND CLAIM-RELATIVE REFINEMENT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. Research cross-check
Lamport's official TLA+ material states that history variables record past behavior and may be required for a refinement mapping; stuttering steps are allowed only when relevant variables remain unchanged. This supports treating P_AA-relevant ordering as semantic information rather than assuming a fixed number of timestamp slots.

## 2. Minimal event-order object
The current target is not a full event log and not integer timestamps.
Candidate: Ord_AA = (E, <=_AA, type, bindings, validity_scope)
Where E is the set of P_AA-relevant events; <=_AA is the smallest order relation required to distinguish admission outcomes; type identifies the semantic event; bindings identify affected authority/resource/policy/delegation/lease/attempt objects; validity_scope records claim/protocol scope.
Candidate events: AUTH_ISSUE, AUTH_REVOKE, EPOCH_ADVANCE, DELEGATION_CHANGE, POLICY_CHANGE, RESOURCE_REINCARNATE, LEASE_ISSUE, LEASE_EXPIRE, ATTEMPT_CREATE, RETRY, DECIDE, ADMIT, ABORT.

## 3. Order relevance
An ordering relation is P_AA-relevant only if reversing or removing it can change the P_AA assessment for some allowed continuation. Raw chronological order is stronger than necessary.

## 4. Candidate order-equivalence
h1 ~=ord h2 iff there is a binding-preserving correspondence between P_AA-relevant events such that event types and claim-relevant bindings correspond, all order relations required to determine P_AA are preserved, and differences outside the P_AA relevance closure are ignored.

## 5. Attack on order compression
CM-AA155 revoke/admit inversion; CM-AA156 policy/admit inversion; CM-AA157 delegation/admit inversion; CM-AA158 incarnation/admit inversion; CM-AA159 lease-expire/admit inversion; CM-AA160 lease-issue/admit inversion; CM-AA161 retry/lease inversion; CM-AA162 decide/revoke inversion; CM-AA163 compound ordering where final state matches but intermediate bridge validity differs; CM-AA164 unrelated-event collapse; CM-AA165 same partial order with different irrelevant event placement; CM-AA166 same event count with different order/causal relation.

## 6. Order versus causality
ORDER != CAUSALITY != COMMON_MODE. Precedence does not imply causation, and common-mode dependency is a separate relation.

## 7. Minimal order closure
OrdClosure_PAA(H) is the closure of only those order relations needed to evaluate P_AA. It must be claim-, boundary-, and protocol-scoped; stable under irrelevant-event insertion; sufficient to reconstruct admission linkage and validity; and conservative when information is missing. Unknown ordering must produce UNKNOWN rather than inferred order.

## 8. Event insertion test
For an event x outside the current closure, insert x at every position consistent with the remaining order. If every placement gives the same P_AA result, x/position is potentially removable. If any placement changes P_AA, it is relevant. This is a minimization test, not a completeness proof.

## 9. Hidden-order attacks
CM-AA167 hidden invalidation insertion; CM-AA168 hidden lease renewal; CM-AA169 hidden policy compatibility change; CM-AA170 hidden delegation replacement; CM-AA171 hidden resource reincarnation; CM-AA172 hidden retry; CM-AA173 hidden bridge issuance; CM-AA174 hidden admission-link change.

## 10. LeaseBridge and AdmissionBindingClass
Remain semantically separate. AdmissionBindingClass represents the actual admitted relational tuple; LeaseBridge represents protocol history carrying authorization into admission. They cannot be identified without a future-behavioral quotient.

## 11. Claim-relative refinement obligation
Rep_PAA(Hc,Ha) requires: same P_AA-relevant current context; actual admission linkage preserved; required order relations preserved; lease/bridge invalidation preserved; no authority amplification; every concrete P_AA-relevant transition represented abstractly; irrelevant concrete transitions may stutter; unknown correspondence remains UNKNOWN/PENDING.

## 12. Stuttering restriction
A concrete event may map to stuttering only if it changes no P_AA-relevant state, admission linkage, retained history needed for future P_AA, or future P_AA-relevant continuation set. Lamport defines stuttering in terms of leaving relevant variables unchanged. Citation: https://lamport.azurewebsites.net/tla/rhtml/stuttering-step.html

## 13. New stuttering countermodels
CM-AA175 history-only revocation; CM-AA176 history-only retry; CM-AA177 history-only lease consumption; CM-AA178 history-only admission linkage; CM-AA179 hidden order change. Each keeps visible AA_Norm equal now but permits a future P_AA split.

## 14. Finite exploration
Do not freeze temporal cardinality. For bounded exploration, enumerate event permutations over a finite event set while preserving object bindings. A bounded result is bounded evidence, not a completeness proof.

## 15. Result
The minimal temporal representation should be an ordered, claim-scoped event structure rather than a fixed three-slot timeline. The order closure must be derived from P_AA behavior.
MINIMAL_EVENT_ORDER != MINIMAL_EVENT_LOG.
No TLA+ module is drafted yet.

## 16. AB28 frontier
1. Derive exact P_AA order dependencies among event pairs.
2. Determine transitive consequences versus independently required relations.
3. Attack partial-order reduction with concurrent-event countermodels.
4. Define claim-relative bisimulation/refinement over concrete and abstract event structures.
5. Re-evaluate whether AA_Norm + Ord_AA + LeaseBridge + AdmissionBindingClass is the smallest semantic kernel.
6. Only then draft the first TLA+ specification.