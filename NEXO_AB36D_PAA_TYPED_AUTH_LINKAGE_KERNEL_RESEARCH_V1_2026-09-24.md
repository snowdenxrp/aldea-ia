# NEXO AB36D — TYPED AUTHORITY / IMMUTABLE LINKAGE KERNEL RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. The repository TLA draft remains unverified. The attempted repository write of a new .tla artifact was blocked by the tool security layer; no false commit is reported.

## 1. AB36B re-read
AB36B confirmed the central weakness: authority identity was represented by subject rather than a stable authorization identifier, and admission history was represented as sets plus separate maps rather than one immutable admission record.

## 2. Corrected typed state
Use finite identifiers: AuthId, BridgeId, AdmissionId, EventId.

Authority: AuthRec = subject, resource, incarnation, epoch, capability, scope, policy, delegation, boundary.
Bridge: BridgeRec = subject, operation, attempt, resource, incarnation, auth_id, epoch, policy, delegation, protocol, freshness, consumption, boundary.
Admission: AdmissionRec = subject, operation, attempt, resource, incarnation, usedAuth, usedBridge, protocol, boundary, admissionEvent.

This makes USED/LINKED != VALID and AUTH_IDENTITY != SUBJECT_ID.

## 3. Actual-linkage invariant
For every admitted record a: usedAuth(a) is one specific AuthId; usedBridge(a) is one specific BridgeId; bridge.usedAuth = usedAuth(a); the admission record itself is immutable after ADMIT.
A later revocation, policy change, delegation change, or reincarnation MUST NOT rewrite these historical references.

## 4. Assessment kernel
TRUE_JUSTIFIED requires: actual used authority; actual used bridge; relational binding of subject/operation/attempt/resource/incarnation; authority valid under the claim temporal scope; epoch current/compatible; policy compatible; delegation valid; resource incarnation compatible; protocol-specific validity; permitted boundary.
Otherwise assessment is UNKNOWN until an explicit FALSE condition is modelled.

## 5. Critical temporal correction
The current kernel cannot use current state blindly for historical claims. CurrentAuthValid is appropriate only for current admission validity. Historical reconstruction requires AuthValidAt(admission, history, admissionEvent).

## 6. Event DAG
EventId maps to EventType with PRECEDES, BINDS, INVALIDATES, BRIDGES, CONSUMES relations. The DAG is claim-relative, not a full implementation log. It must preserve enough history to reconstruct authority, policy, delegation, incarnation and bridge validity at the admission point.

## 7. Protocol separation
ATOMIC: authorization/admission semantic point is atomic.
LEASE: bridge carries authorization context through an interval and must remain valid, unexpired, correctly bound and non-replayed.
RECHECK: required authorization facts are re-established at admission.
The common claim kernel can be shared, but AdmissionProtocolValid must differ by protocol class.

## 8. New countermodels
CM-AA301: same subject, two AuthIds; admission linked to revoked AuthId while another remains valid. Subject-only representation is unsound.
CM-AA302: same operation/resource, two BridgeIds; admission linked to expired bridge while another is fresh.
CM-AA303: current policy equals admission policy after a later compensating change, but policy was incompatible at admission.
CM-AA304: delegation revoked and later restored; final state looks valid but historical admission validity differs.
CM-AA305: resource incarnation changes and later returns to an aliased bounded identifier; identifier equality alone cannot establish continuity.
CM-AA306: epoch advances without replacement authority; epoch monotonicity cannot manufacture current authority.
CM-AA307: admission usedAuth differs from bridge.auth; bridge validity cannot repair linkage mismatch.
CM-AA308: lease consumed after admission; later consumption must not rewrite historical use.
CM-AA309: RECHECK represented as a static bridge, incorrectly turning admission-time re-establishment into issuance-time state.
CM-AA310: ATOMIC represented as a lease, introducing artificial expiry or hiding the atomic linearization point.

## 9. Refinement consequence
R_AA must preserve AuthId identity, AdmissionId identity, immutable UsedContext, event-position support, bridge-to-authority binding, protocol class, and claim-relative temporal scope, in addition to the earlier state/linkage/invalidation/history/order/boundary obligations.

## 10. External cross-check
Lamport's Auxiliary Variables material describes history variables as recording past behavior and explains that auxiliary variables may be needed to construct a refinement mapping. His TLA material distinguishes stuttering from history variables. This supports claim-relevant history as refinement support, but does not validate the Nexo abstraction. citeturn0search18turn0search7

## 11. Current status
OPEN: exact AuthValidAt; event update rules; policy compatibility; delegation validity; epoch semantics; protocol transitions; complete Next; syntactic TLA validation; TLC; refinement proof.
No verification claim is made.

## 12. AB36E frontier
1. Define AuthValidAt from EventDAG.
2. Define immutable ADMIT and exact UsedContext.
3. Define AUTH_ISSUE, REVOKE and EPOCH transitions.
4. Define POLICY_CHANGE, DELEGATION_CHANGE and REINCARNATE.
5. Define LEASE issue, expiry and consume.
6. Define DECIDE, RETRY and ADMIT for ATOMIC/LEASE/RECHECK.
7. Attack current-vs-historical reconstruction.
8. Only then produce the next tool-checked TLA artifact or obtain a real TLA+ toolchain.
