# AB104 — Renewal / Consumption Evidence Matrix

Status: RESEARCH ONLY. No protocol law is invented. Unknown means unresolved evidence, not empty behavior.

## LEASE_RENEW

| Dimension | Evidence-backed content | Status |
|---|---|---|
| C1 source context | lease, expiry, renewal authority, current authority/policy/delegation/incarnation, bridge context | VERIFIED_FROM_EVIDENCE |
| C2 legality | renewal authority is a required semantic dimension; complete eligibility, especially expired/non-current cases, is not specified | UNKNOWN |
| C3 post-state | complete extension-vs-replacement identity and resulting expiry/lease state not recovered | UNKNOWN |
| C4 frame/invalidation | authority/policy/delegation/incarnation changes can invalidate binding; exact renewal frame/rebinding law incomplete | UNKNOWN |
| C5 observation mapping | admission linkage is required, but all successor observations are not derivable from recovered law | UNKNOWN |
| C6 enumeration | no exhaustive renewal successor universe recovered | UNKNOWN |

## LEASE_CONSUME

| Dimension | Evidence-backed content | Status |
|---|---|---|
| C1 source context | lease + attempt/replay/consumption identity are supported by AB49/AB100 | VERIFIED_FROM_EVIDENCE |
| C2 legality | consume/replay is a canonical separator, but complete admissibility conditions are not recovered | UNKNOWN |
| C3 post-state | AB100 models ReplayState mutation conservatively; complete protocol post-state is not established | UNKNOWN |
| C4 frame/invalidation | replay state must remain distinct from lease validity; complete invalidation/frame law absent | UNKNOWN |
| C5 observation mapping | actual admission binding and resulting P_AA observation linkage remains incomplete | UNKNOWN |
| C6 enumeration | no complete consume/replay successor domain recovered | UNKNOWN |

## Evidence discipline

Field presence is not a transition law. A candidate experiment is admissible only where every transition assumption used by the experiment is explicitly supported. Missing law remains UNKNOWN. No KNOWN_EMPTY result may be inferred from failure to recover a successor.

## Research consequence

Neither LEASE_RENEW nor LEASE_CONSUME currently reaches the completeness gate required for definitive FutureObs_PAA results. The correct next experiment is therefore adversarial and conditional: enumerate only evidence-supported orderings and compare observations; separately record unresolved branches rather than fabricating successors.
