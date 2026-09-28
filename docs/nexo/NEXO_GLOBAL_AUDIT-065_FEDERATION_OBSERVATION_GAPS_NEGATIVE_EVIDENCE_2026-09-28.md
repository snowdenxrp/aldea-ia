# NEXO GLOBAL AUDIT-065 — FEDERATION OBSERVATION GAPS / NEGATIVE EVIDENCE
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack negative claims in federation: whether missing bundles/events can establish absence; freshness expiry versus semantic revocation; sequence gaps/reset; validator population completeness; offline validators and hidden state; cache eviction/evidence loss; deletion/termination observations; and claims such as "no active credential", "no current root", or "no revocation".

## External evidence studied
SPIFFE states that bundle contents change over time, recommends periodic refresh, and uses spiffe_sequence for freshness/order when present. An empty trust bundle can indicate that previously published keys have been revoked, but an empty or unusable bundle can also arise when a client does not understand a newly introduced key type. Thus an observed empty usable-key set is semantically meaningful only with the surrounding protocol/version interpretation. citeturn0search0turn0search1

SPIFFE also states that federation termination requires deleting the local foreign bundle and propagating that deletion to validators; re-establishment starts the lifecycle over. This supports distinguishing an observed deletion from a proof that no other authoritative copy or event exists. citeturn0search0

TUF documents rollback, freeze and fast-forward attacks, illustrating why absence of newer metadata from an observation path cannot automatically be interpreted as proof that newer state does not exist. citeturn0search5

## Findings

### A — Missing bundle/event is not proof of nonexistence
Failure to retrieve a bundle, event, revocation, or credential record establishes at most an observation failure unless the source/domain has an authoritative completeness contract.

DISTINCTION:
NOT OBSERVED != NOT EXISTED
NOT RETRIEVED != NOT ISSUED

### B — Freshness expiry is not semantic revocation
A bundle becoming older than its refresh hint does not itself revoke the keys represented by that bundle. Conversely, receiving a fresh bundle does not prove that no revocation exists outside the covered source/domain.

DISTINCTION:
STALE != REVOKED
FRESH != COMPLETE

### C — Sequence gaps are evidence of missing history, not proof of event absence
Seeing sequence 10 after 8 shows a gap if the sequence semantics guarantee contiguous issuance, but it does not establish what happened at 9 without an authoritative gap/reconstruction contract.

DISTINCTION:
SEQUENCE GAP != PROVEN NONEXISTENCE

### D — Sequence reset/reinitialization is an incarnation boundary
A sequence number restarting at 1 after state loss, domain reinitialization, or system replacement cannot automatically be compared with the old sequence space. The sequence must bind to a source/trust-domain incarnation or equivalent epoch.

DISTINCTION:
SAME SEQUENCE VALUE != SAME HISTORY

### E — Validator population completeness is claim-relevant
A certificate saying "all validators report no active credential" is meaningful only if the validator population is itself authoritative and complete for the claim. Unknown/offline/partitioned validators can contain relevant state.

DISTINCTION:
ALL OBSERVED VALIDATORS != ALL RELEVANT VALIDATORS

### F — Offline validators create hidden state
A validator that has been offline may retain an older bundle or authorization state. Requiring it to discard that state on reconnect is different from proving that the old state never existed or was never used.

DISTINCTION:
OFFLINE != EMPTY
DISCONNECTED != REVOKED

### G — Cache eviction destroys evidence, not necessarily history
Deleting a cached bundle removes local reconstructability. It does not prove the underlying trust relationship or credential state ceased to exist.

DISTINCTION:
CACHE ABSENCE != SOURCE ABSENCE
EVIDENCE LOSS != EVENT ERASURE

### H — Deletion/termination is scoped
SPIFFE federation termination specifies deleting the local foreign bundle and ceasing polling, with propagation to validators. That is an operational termination of the local federation relationship; it is not by itself a universal historical statement that the foreign trust domain never existed or that every past credential was invalid. citeturn0search0

DISTINCTION:
LOCAL TERMINATION != GLOBAL ERASURE
DELETION != HISTORICAL NONEXISTENCE

### I — "No active credential" requires a completeness domain
To establish absence of an active credential, the observation domain must define all relevant issuers, keys, subjects/incarnations, validity intervals, revocation sources, and issuance paths. Otherwise an unseen issuer or retained foreign state can defeat the negative claim.

DISTINCTION:
NO MATCH IN DATABASE != NO ACTIVE CREDENTIAL

### J — "No current root" requires an authority-complete root domain
A validator finding no root in its current bundle cannot conclude that no current root exists unless the bundle source is authoritative for the relevant trust domain and the bundle observation is complete/current.

DISTINCTION:
NO ROOT IN OBSERVED BUNDLE != NO CURRENT ROOT

### K — "No revocation" is especially dangerous
Absence of a revocation record may mean no revocation exists, the revocation has not propagated, the relevant issuer/source is missing, retention has expired, or the query scope is incomplete.

DISTINCTION:
NO REVOCATION OBSERVED != NO REVOCATION EXISTS

### L — Freeze attacks demonstrate the danger of negative inference
TUF's freeze attack model shows that repeatedly serving previously valid metadata can prevent clients from learning about newer state. Therefore "nothing newer was observed" cannot safely become "nothing newer exists" without an independent freshness/completeness mechanism. citeturn0search5

### M — Negative evidence has its own provenance
A negative claim needs provenance for:
- observation source;
- source authority;
- population/domain;
- observation interval;
- freshness;
- query/filter semantics;
- retention completeness;
- partition/connectivity state;
- source incarnation/epoch;
- dependency closure;
- conflict/revocation status.

A signed "no result" response is not automatically a complete negative proof.

### N — Positive and negative evidence are asymmetric
One authoritative observed revocation can establish a positive event if its semantics are admissible. Absence of that event from a non-complete observation path cannot establish its nonexistence.

DISTINCTION:
POSITIVE EVENT EVIDENCE != NEGATIVE ABSENCE EVIDENCE

## Attack matrix

| Negative claim | Missing boundary | Result |
|---|---|---|
| No active credential | complete issuer/key/subject/interval domain | UNKNOWN without completeness |
| No current root | authoritative current root domain | UNKNOWN |
| No revocation | complete revocation source/interval | UNKNOWN |
| No newer bundle | freshness + anti-freeze evidence | UNKNOWN |
| Sequence 10 after 8 | meaning of missing 9 | gap only; absence UNKNOWN |
| Sequence reset to 1 | source incarnation | incomparable until bound |
| Validator set says all clear | validator population completeness | UNKNOWN if population incomplete |
| Cache contains nothing | source/history completeness | no conclusion about underlying state |
| Federation terminated | scope of termination | local current state only unless broader authority is proven |
| Offline validator | hidden retained state | UNKNOWN |

## Candidate negative-claim closure boundary
A negative claim "there is no X in domain D during interval I" can become deterministic only if evidence establishes:
1. exact subject/resource/credential scope;
2. authoritative population of relevant issuers/validators/sources;
3. complete observation domain;
4. observation interval and temporal semantics;
5. freshness/anti-freeze guarantee;
6. source/trust-domain incarnation and epoch;
7. retention/reconstruction completeness;
8. query/filter semantics;
9. conflict/revocation closure;
10. dependency/common-mode closure;
11. authoritative statement that the observation domain is sufficient to exclude X.

This is a candidate audit boundary only. It is NOT a frozen Nexo protocol and does not prove R1-R5 completeness/minimality.

## Result
FOUND:
- missing observations cannot establish nonexistence without completeness;
- freshness expiry is distinct from revocation;
- sequence gaps reveal missing observation/history but do not prove event absence;
- sequence reset requires an incarnation boundary;
- validator population completeness is claim-relevant;
- offline validators can retain hidden state;
- cache eviction is evidence loss, not event erasure;
- federation termination is scoped and does not erase history;
- negative claims require their own provenance and completeness contract;
- TUF freeze attacks illustrate why absence of newer observation is unsafe as negative evidence;
- positive event evidence and negative absence evidence are asymmetric.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete negative-evidence algebra; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

NOT PERFORMED:
implementation; formal verification; runtime/fault injection; V21; semantic freeze.

## Global epistemic state — preserve exactly
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-066
Attack negative-evidence composition and absence certificates:
- whether multiple incomplete "no X" observations can ever compose into a complete absence claim;
- partitioned domain coverage;
- overlapping observation scopes;
- duplicate/common-mode negative evidence;
- conflicting positive evidence arriving after absence certification;
- expiry/revocation of absence certificates;
- absence certificate replay and rollback;
- completeness claims about the population itself;
- whether negative certificates can safely feed authorization decisions without converting UNKNOWN into false certainty.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
