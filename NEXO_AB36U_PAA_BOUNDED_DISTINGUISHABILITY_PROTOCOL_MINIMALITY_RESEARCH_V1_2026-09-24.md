# NEXO AB36U — BOUNDED DISTINGUISHABILITY AND PROTOCOL MINIMALITY RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport's official material distinguishes history variables, which record past behavior, from stuttering variables and explains that refinement mappings may require auxiliary variables. It also notes that lower-level implementations may take extra steps that correspond to abstract stuttering. This supports using auxiliary protocol history in the research model without assuming every history fact must become implementation state. citeturn0search1turn0search2

## 2. Bounded distinguishability objective
For a finite protocol-history domain D and bounded continuation depth k, define Dist_k(d) = true when there exist two concrete histories differing only in distinction d and an allowed continuation of depth <= k that yields different P_AA observations or different refinement obligations.
If Dist_k(d)=true, d cannot be safely removed at bound k. If Dist_k(d)=false, d is only a candidate for removal; this is bounded evidence, not a universal theorem.

## 3. Continuation model
Candidate continuation alphabet:
AUTH_REVOKE, EPOCH_ADVANCE, POLICY_CHANGE, DELEGATION_CHANGE, RESOURCE_REINCARNATE, LEASE_EXPIRE, LEASE_RENEW, LEASE_CONSUME, RETRY, DECIDE, ADMIT, ABORT, STUTTER.
Only transitions permitted by the protocol/boundary/environment contract are included.

## 4. Observation comparison
For each continuation trace c, compare:
Obs_AA(h1,c) versus Obs_AA(h2,c).
The comparison includes TRUE_JUSTIFIED, FALSE and UNKNOWN, actual admission linkage, and any refinement obligations required by P_AA.
A distinction is distinguishable if a trace causes any claim-relevant divergence.

## 5. Protocol-history dimensions under attack
Candidate dimensions:
D1 atomic linearization;
D2 lease issuance-to-admission relation;
D3 lease expiry;
D4 lease renewal provenance/order;
D5 lease consumption/replay state;
D6 rechecked authority facts;
D7 recheck-to-admission binding/order;
D8 attempt identity;
D9 resource incarnation;
D10 authority epoch/currentness;
D11 policy compatibility context;
D12 delegation validity context;
D13 actual UsedAuth/UsedBridge linkage;
D14 boundary;
D15 relevant invalidation order.

## 6. D1 atomic linearization
Bounded trace: hidden REVOKE between DECIDE and ADMIT. The trace distinguishes genuine atomic admission from pseudo-atomic sequencing. D1 remains required unless atomicity is encoded elsewhere.

## 7. D2 lease issuance relation
If issuance is not linked to the admitted bridge/context, another bridge can substitute. D2 is required unless the same relation is encoded in Bridge/AdmissionBinding semantics.

## 8. D3 expiry
Trace: LEASE_EXPIRE -> ADMIT versus ADMIT -> LEASE_EXPIRE. If protocol semantics distinguish them, expiry/order cannot be erased.

## 9. D4 renewal provenance
Trace: AUTH_CHANGE -> LEASE_RENEW -> ADMIT. Compare with LEASE_RENEW before AUTH_CHANGE. If renewal requires authorization revalidation, provenance/order is distinguishable.

## 10. D5 consumption/replay
Trace: ADMIT/CONSUME -> RETRY. Compare with non-consumed bridge -> RETRY. If replay policy differs, consumption state is necessary.

## 11. D6/D7 recheck semantics
A recheck flag without the exact re-established facts or its binding to the actual admission is distinguishable under policy/delegation/incarnation changes. Therefore recheck semantics must be reconstructible.

## 12. D8 attempt identity
Trace: initial admission -> retry. If authorization is attempt-scoped, collapsing attempt IDs changes the observation. Attempt identity is conditional on protocol semantics but mandatory when retry behavior depends on it.

## 13. D9 incarnation
Trace: resource reincarnation -> admission/retry. Resource_id equality does not imply incarnation equality. D9 is mandatory for incarnation-sensitive claims.

## 14. D10/D11/D12 authority, policy, delegation
These are already semantic lower-bound dimensions from the authorization kernel. Protocol history may compress their event log, but cannot erase the claim-relevant validity semantics.

## 15. D13 actual linkage
Two valid witnesses can coexist. Only the witness actually linked to the admission may support P_AA. Therefore UsedAuth/UsedBridge linkage cannot be replaced by existence of some valid witness.

## 16. D14 boundary
Changing boundary assumptions can change whether the same protocol behavior is in scope. Boundary is a contract parameter, not an ordinary mutable history field. It must be fixed or explicitly represented.

## 17. D15 invalidation order
Policy, delegation, revocation, epoch and incarnation events can be individually harmless but jointly decisive. Pairwise current-state equality does not establish equivalent invalidation history.

## 18. Candidate minimality test
A dimension d is a bounded candidate for elimination only when:
1. Dist_k(d)=false for the chosen continuation bound;
2. UsedAdmissionContext remains reconstructible;
3. no authority amplification appears;
4. UNKNOWN is produced if an omitted distinction becomes decisive;
5. quotient transition stability holds within the bound.

## 19. Important limitation
`Dist_k(d)=false` does NOT prove d is globally unnecessary. It only says no distinguishing continuation was found within the explicit finite domain, protocol contract and depth k. Conversely, one counterexample is sufficient to reject the proposed elimination under that contract.

## 20. Expected finite exploration
Small identity domains remain sufficient to expose substitution attacks:
Subjects=2, Operations=2, Attempts=2, Resources=2, Incarnations=2, Epochs=2, Policies=2, Delegations=2, Bridges=2, Capabilities/Scopes=2.
Protocol classes remain ATOMIC, LEASE, RECHECK. Boundary B0 is fixed.
Continuation depth should be at least 3 for first-order race attacks and increased where renewal/retry chains require it.

## 21. Result
We now have a concrete bounded test for semantic minimality. It separates:
- proven counterexample at a bound;
- no counterexample found at a bound;
- universal proof.
Only the first is currently decisive. The second remains research evidence.

## 22. AB36V frontier
1. Instantiate the bounded continuation relation as a mathematical transition system.
2. Enumerate all protocol-dimension deletion candidates and minimal distinguishing traces.
3. Identify the shortest counterexample for each rejected compression.
4. Compare protocol dimensions that can be packed into LeaseBridge or AdmissionBindingClass.
5. Derive the smallest semantic summary surviving bounded attacks.
6. Only after this, design the next conservative TLA+ model and seek an actual TLC toolchain.
