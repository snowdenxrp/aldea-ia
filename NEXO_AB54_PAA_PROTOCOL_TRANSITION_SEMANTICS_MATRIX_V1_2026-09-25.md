# NEXO AB54 — P_AA PROTOCOL TRANSITION-SEMANTICS MATRIX V1 — 2026-09-25

Status: RESEARCH ONLY. No implementation, no TLC/TLAPS, no semantic freeze.

## 1. Purpose

AB53 required an explicit transition-semantics matrix before rerunning the ternary protocol/read-set search.

This artifact consolidates the previously persisted AB25/AB26/AB36/AB38/AB49 semantics into one machine-oriented matrix.

It does not invent missing protocol rules. Where prior research does not specify an exact condition, the cell is UNKNOWN rather than silently completed.

## 2. Canonical action schema

Every action is represented as:

A = <Pre, ReadSet, Post/Mutation, Frame, Invalidation, HistorySupport, AdmissionLink, Observation, UnknownCondition>

The earlier six-contract form is retained. AB54 makes ReadSet, Observation and UnknownCondition explicit so the AB51 read-set gate can be tested.

## 3. Transition matrix

| Action | Precondition | Semantic read-set | Mutation/Post | Invalidation | HistorySupport | Admission linkage | P_AA observation / UNKNOWN |
|---|---|---|---|---|---|---|---|
| AUTH_ISSUE | permitted issuer + issuance conditions | issuer authority, policy/delegation, boundary, target subject/scope | create authority context + issuance position | none automatic | issuance identity/position | none | no admission assessment; UNKNOWN if required issuance facts missing |
| AUTH_REVOKE | target authority exists | authority identity/current validity, dependent bindings | authority becomes non-current-valid | dependent authority/bridge validity changes | revocation event/order | prior admission links unchanged | future admissions may fail; exact propagation remains protocol-dependent |
| EPOCH_ADVANCE | permitted epoch transition | current epoch + transition authority | advance epoch | epoch-bound contexts may become stale | epoch transition | historical links unchanged | current validity may change; exact stale rule may remain UNKNOWN |
| POLICY_CHANGE | permitted policy transition | policy context + affected compatibility relations | current policy changes | affected bindings re-evaluated | compatibility-relevant policy transition | prior links unchanged | P_AA may change for future admission; historical linkage is not rewritten |
| DELEGATION_CHANGE | permitted delegation transition | delegation relation + dependent authority/bridge bindings | delegation changes | dependent validity recomputed | delegation transition | prior links unchanged | P_AA may change; exact dependency closure must be explicit |
| RESOURCE_REINCARNATE | permitted reincarnation | resource identity/incarnation + bound leases/classes | new resource incarnation | old-incarnation bindings/leases incompatible | incarnation boundary | historical admissions remain linked to old incarnation | future old-incarnation admission invalid/UNKNOWN if lineage evidence missing |
| LEASE_ISSUE | valid authority + complete binding + LEASE + issuance allowed | authority, binding tuple, protocol class, policy/delegation/incarnation, boundary | create lease with interval | none to authority | issuance + interval + bridge linkage | future admission may reference lease | no current admission result |
| LEASE_EXPIRE | lease exists | lease identity + interval/expiry | lease becomes non-valid | lease-based admission validity changes | expiry position | existing admissions unchanged | future admission may fail |
| LEASE_RENEW | renewal permitted | lease, expiry, renewal authority, current authority/policy/delegation/incarnation, bridge state | extend/replace validity according to protocol | successor validity as defined | renewal event/order | future admission references resulting bridge | missing renewal authority/history => UNKNOWN |
| LEASE_CONSUME | lease valid + consumption permitted | lease identity, replay/consumption state, admission/attempt binding | consume/mark replay state | future reuse may become invalid | consumption event | binds consumption to actual attempt/admission context | replay-sensitive future admission can change |
| ATTEMPT_CREATE | operation permits attempt creation | operation, subject, resource, boundary | create attempt identity | none automatic | attempt creation | future admission must bind to attempt | no admission assessment |
| RETRY | retry permitted | prior attempt, retry policy, protocol, bridge/authorization inheritance rules | new attempt or explicitly same attempt | prior bridge cannot transfer implicitly | retry relation | future admission must explicitly bind | missing inheritance rule => UNKNOWN |
| DECIDE | decision inputs available | authority, policy, delegation, resource/incarnation, attempt, protocol inputs | create decision record | none automatically | decision reference/position | decision alone does not establish admission linkage | decision != admission; future invalidation may intervene |
| RECHECK | RECHECK protocol + exact fact-set available | exact fact-set, mutation state, attempt, policy/delegation/incarnation, boundary | create recheck result | mutation/invalidity detected by checked facts | exact fact-set + recheck order/result | result must be linked to actual admission | missing fact-set/order/result linkage => UNKNOWN |
| ADMIT | actual admission linkage + protocol valid + all P_AA predicates | UsedAdmissionContext, authority, binding, policy, delegation, incarnation, protocol validity, boundary, required bridge/recheck facts | create admission record | none to historical validity | admission linkage + position | creates authoritative UsedAdmissionContext | TRUE only when required predicates are established; missing decisive evidence => UNKNOWN |
| ABORT | abort permitted | pending admission state + relevant linkage | close/abort internal admission state | internal pending state may close | abort event where relevant | does not erase prior linkage | no inference about external-world effect |
| STUTTER | no P_AA-relevant change | all P_AA-relevant abstract context + future continuation capability | no semantic mutation | none | no relevant support lost | unchanged | legitimate only if current and future P_AA behavior is preserved |

## 4. Explicit read-set decomposition by protocol

ATOMIC:
A1 linearization point; A2 relevant-interleaving exclusion; A3 invalidation ordering; A4 immutable historical linkage; A5 boundary.

LEASE:
L1 issuance-to-admission linkage; L2 expiry/interval; L3 renewal semantics; L4 replay/consumption; L5 policy/delegation/epoch/incarnation/boundary invalidation; L6 bridge-to-admission linkage; L7 renewal authority.

RECHECK:
R1 exact fact-set; R2 recheck-to-admission order; R3 mutation detection; R4 actual result linkage; R5 attempt identity; R6 boundary.

A protocol may not silently inherit semantics belonging only to another protocol.

## 5. P_AA observation contract

P_AA = authorization-to-admission safety.

For an actual admission record r, P_AA requires the linked authority/binding context to satisfy:
- AuthorityValid;
- CompleteBinding;
- PolicyCompatible;
- DelegationValid;
- IncarnationCompatible;
- AdmissionProtocolValid.

UsedAdmissionContext is evidence of which context was actually used; it must not be defined in terms of validity.

If required linkage or decisive support cannot be established, the conservative result is UNKNOWN/PENDING rather than TRUE.

External provider execution/success remains outside the P_AA boundary.

## 6. Cross-transition invalidation closure

Explicit dependencies:
AUTH_REVOKE -> dependent authority/bridge validity
EPOCH_ADVANCE -> epoch-bound validity
POLICY_CHANGE -> affected policy compatibility
DELEGATION_CHANGE -> dependent delegation validity
RESOURCE_REINCARNATE -> old-incarnation compatibility
LEASE_EXPIRE -> lease admission validity
LEASE_RENEW -> resulting bridge validity and temporal semantics
LEASE_CONSUME -> replay/consumption availability
RETRY -> attempt-scoped binding
RECHECK -> exact fact-set validity at its defined order

No dependency may be inferred merely because two records contain similar fields.

## 7. Read-set classification

SEMANTIC_EXPLICIT = directly specified by prior research.
SEMANTIC_DERIVED = deterministic consequence of explicit retained relations.
UNKNOWN = dependency identified but transition semantics insufficient to decide it.

This prevents structural assumptions from becoming protocol law.

## 8. Ternary-search readiness

AB54 closes the documentation/normalization gap at the action-schema level, but not the complete executable-state gap.

Ready for mapping AB51 ternary candidates onto named transition reads and identifying reconstructible distinctions.

Still not ready to claim exhaustive protocol closure because concrete value domains, all binding assignments, some invalidation propagation details, and exact environment continuation generation remain bounded/partly unspecified.

Therefore:
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS

## 9. Highest-value ternary attacks

1. POLICY_CHANGE + DELEGATION_CHANGE + ADMIT
2. DELEGATION_CHANGE + RESOURCE_REINCARNATE + ADMIT
3. LEASE_RENEW + POLICY_CHANGE + ADMIT
4. LEASE_EXPIRE + RETRY + ADMIT
5. DECIDE + AUTH_REVOKE + ADMIT
6. RECHECK + MUTATION + ADMIT
7. RETRY + LEASE_CONSUME + ADMIT
8. RESOURCE_REINCARNATE + LEASE_RENEW + ADMIT

For each: equalize lower-arity facts; identify actual read-set; construct smallest legal future continuation; compare FutureObs_PAA; reconstruct if possible; otherwise UNKNOWN.

## 10. Four-event gate

A ternary candidate must survive lower-arity equality -> order closure -> invalidation closure -> protocol read-set -> reconstruction -> FutureObs_PAA before four-event escalation.

No fully specified survivor is established by AB54.

## 11. HistorySupport

AB54 does not eliminate HistorySupport.

A support fact is removable only if every legal transition that could read it can derive an equivalent result from retained facts, or safely return UNKNOWN/PENDING, while preserving future P_AA observations.

## 12. LeaseBridge / AdmissionBindingClass

No merge.

AdmissionBindingClass identifies the relational admission tuple.
LeaseBridge carries protocol transport/validity/renewal/replay semantics.

A merger remains a separate future-observation quotient problem.

## 13. Exact next experiment

Construct a finite transition interpreter over the AB54 schema with:
- two-valued identities/contexts where AB50 permits;
- explicit UNKNOWN as a third epistemic value;
- partial-order event histories;
- protocol-specific read functions;
- deterministic invalidation closure;
- actual UsedAdmissionContext linkage.

Execute the eight highest-value ternary attacks before broadening to all 286 triples.

The interpreter must return UNKNOWN when a transition precondition depends on an unmodeled semantic rule rather than inventing a legal successor.

## 14. Status

AB54 is a semantic normalization artifact.

It does not prove ternary sufficiency, a P_AA collision, HistorySupport eliminability, or a LeaseBridge/AdmissionBindingClass merge. It does not begin formal verification.

It converts the next step from defining what a read-set might be to executing the explicitly documented read-set while preserving UNKNOWN for unspecified semantics.
