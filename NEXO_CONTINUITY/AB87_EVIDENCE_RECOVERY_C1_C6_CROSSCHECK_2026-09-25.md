# AB87 — EVIDENCE RECOVERY C1-C6 CROSSCHECK — 2026-09-25

Status: RESEARCH ONLY. No implementation, semantic freeze, formal verification, or 286-triple expansion.

## Objective

Close the recovery loop requested by AB76: inspect AB25, AB26, AB36/AB38 recovery status, and AB49 for any evidence that moves a decisive C1-C6 dimension for LEASE_RENEW, RETRY, MUTATION, or RECHECK from UNKNOWN/PARTIAL to complete.

## Findings

### AB25
AB25 provides a strong historical admission-linkage rule: UsedAdmissionContext must be reconstructed from actual admission linkage/history and must not be manufactured from validity predicates. It also gives the six-part transition contract: Pre, Post, Frame, Invalidation, HistorySupport, AdmissionLink. This strengthens C1/C5 methodology, but does not provide complete legality/post-state/enumeration for the four unresolved events.

### AB26
AB26 gives a complete abstract contract for existing actions such as PolicyChange, ResourceReincarnate, LeaseIssue, LeaseExpire, RetryAttempt, Decide and Admit. It explicitly keeps RetryAttempt conditional because retry may create a new attempt or, only if the protocol says so, retain the same attempt. It therefore does not close RETRY C2/C3/C6. AB26 also rejects premature merging of LeaseBridge and AdmissionBindingClass and requires future-behavioral equivalence.

### AB36 / AB38
The available GitHub commit-search route did not recover standalone AB36 or AB38 artifacts. This is not evidence that they never existed. AB79 already recorded this limitation. No new canonical content was recovered in this crosscheck that can legitimately close a C2/C3/C6 dimension.

### AB49
AB49 remains a research round and does not supply a complete transition law for the four unresolved events. It therefore cannot be promoted to protocol closure merely by naming an event sequence.

## Cross-event matrix

| Event | C1 | C2 | C3 | C4 | C5 | C6 | Result |
|---|---|---|---|---|---|---|---|
| LEASE_RENEW | PARTIAL/KNOWN | UNKNOWN | UNKNOWN | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN |
| RETRY | KNOWN/PARTIAL | UNKNOWN | UNKNOWN | UNKNOWN | PARTIAL | UNKNOWN | UNKNOWN |
| MUTATION | PARTIAL/KNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN/PARTIAL | UNKNOWN | UNKNOWN |
| RECHECK | PARTIAL/KNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Important refinement

AB25/AB26 improve the definition of what evidence is required, especially historical admission linkage and the six-part action contract. They do not retroactively complete the unresolved events. A methodological contract is not itself a concrete event law.

Therefore no dimension is promoted from UNKNOWN to KNOWN merely because AB25/AB26 define the field that must eventually be supplied.

## Protocol boundary

The current canonical corpus now supports a stronger statement:

The unresolved status is not caused by failure to name the relevant semantic dimensions. The corpus names them explicitly. The unresolved status is caused by missing concrete protocol laws for legality, post-state, invalidation/history effects, observation linkage, and/or exhaustive successor domains of the four events.

This is a semantic-evidence boundary, not an enumeration failure.

## Ternary conclusion

TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN

No concrete Nexo B-case is established.

## Gate

Do not expand to 286 triples.
Do not alter AB61/AB65 semantics.
Do not merge LeaseBridge and AdmissionBindingClass.
Do not freeze temporal cardinality at three positions.
Do not synthesize LEASE_RENEW, RETRY, MUTATION, or RECHECK semantics.

## Next exact action

The evidence-recovery branch is exhausted for the currently reachable AB25/AB26/AB36/AB38/AB49 material. Proceed to a bounded event-order attack using only already explicit AB25/AB26 transition rules, while preserving UNKNOWN whenever an unresolved event participates. This can test whether known transition ordering itself exposes a P_AA distinction without pretending the missing event laws are complete.
