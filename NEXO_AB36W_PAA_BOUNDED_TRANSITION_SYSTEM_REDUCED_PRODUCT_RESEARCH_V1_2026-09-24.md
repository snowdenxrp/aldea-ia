# NEXO AB36W — BOUNDED TRANSITION SYSTEM AND REDUCED-PRODUCT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport's official Auxiliary Variables paper states that refinement mappings may require auxiliary variables and distinguishes history variables from stuttering variables. It explicitly describes history variables as recording past behavior and stuttering steps as leaving the specification's actual variables unchanged. This supports our separation between semantic history support and physical implementation state, while warning that hidden history cannot be treated as harmless if it changes the abstract behavior. citeturn0search1

## 2. Exact bounded transition contract
Define a finite concrete protocol state C with:
- authority context;
- resource incarnation;
- policy/delegation context;
- lease/bridge records;
- admission records and actual UsedAuth/UsedBridge linkage;
- attempt state;
- protocol history support;
- claim boundary B0.
A transition is legal only when its preconditions, bindings, protocol rules, and boundary permit it. The bounded environment must not invent transitions merely because an event name exists.

## 3. Candidate action alphabet
AUTH_ISSUE, AUTH_REVOKE, EPOCH_ADVANCE, POLICY_CHANGE, DELEGATION_CHANGE, RESOURCE_REINCARNATE, LEASE_ISSUE, LEASE_EXPIRE, LEASE_RENEW, LEASE_CONSUME, ATTEMPT_CREATE, RETRY, DECIDE, ADMIT, ABORT, STUTTER.

## 4. Reduced-product candidates
R1 = AuthorityContext × ResourceIncarnation × PolicyContext × DelegationContext × LeaseBridge × AdmissionBindingClass.
R2 = R1 + ProtocolHistorySupport.
The research question is whether there exists a total reconstruction function F such that protocol semantics can be recovered from R1 plus retained auxiliary history without loss of P_AA behavior.

## 5. Reconstruction obligation
Candidate:
ProtocolSemantics = F(LeaseBridge, AdmissionBindingClass, H_residual).
F must be:
- total for every modeled concrete history;
- deterministic modulo P_AA-equivalence;
- actual-linkage preserving;
- transition-preserving;
- future-observation preserving;
- no-authority-amplifying;
- boundary preserving.
If any required input cannot be reconstructed, the abstract assessment must be UNKNOWN/PENDING rather than decisive TRUE.

## 6. Systematic shortest-trace strategy
For each dimension d:
1. construct H1/H2 differing only in d;
2. require equal values for all proposed retained components;
3. enumerate legal traces of length 0..k;
4. compare admission observations and refinement obligations;
5. record the shortest separator;
6. if none exists, mark only BOUNDED-NOT-DISTINGUISHED.
This directly tests proposed compression rather than merely testing isolated predicates.

## 7. Pairwise trace basis
The highest-value two-event relations are:
REVOKE→ADMIT;
EPOCH_ADVANCE→ADMIT;
POLICY_CHANGE→ADMIT;
DELEGATION_CHANGE→ADMIT;
RESOURCE_REINCARNATE→ADMIT;
LEASE_EXPIRE→ADMIT;
LEASE_RENEW→ADMIT;
LEASE_CONSUME→RETRY;
RETRY→ADMIT;
DECIDE→ADMIT;
DECIDE→REVOKE→ADMIT as a three-event race.
Each must be evaluated with matching and nonmatching bindings.

## 8. Joint dependency attack
Componentwise safety is insufficient. At least these triples must be explored:
POLICY_CHANGE + DELEGATION_CHANGE + ADMIT;
DELEGATION_CHANGE + RESOURCE_REINCARNATE + ADMIT;
LEASE_ISSUE + POLICY_CHANGE + ADMIT;
LEASE_EXPIRE + RETRY + ADMIT;
DECIDE + REVOKE + ADMIT;
LEASE_RENEW + POLICY_CHANGE + ADMIT.
The same final visible state can encode different P_AA outcomes when order/binding differs.

## 9. Packing test for LeaseBridge
A history dimension may be packed into LeaseBridge only if changing that dimension while preserving the bridge representation cannot alter any allowed future P_AA observation, or the bridge explicitly carries the distinction needed to prevent a false decisive assessment.
Candidate packable dimensions: issuance linkage, expiry, renewal, consumption/replay, protocol validity interval.

## 10. Packing test for AdmissionBindingClass
A dimension may be packed into AdmissionBindingClass only if the resulting class uniquely preserves the relational admission tuple and all future claim-relevant substitutions. Candidate dimensions: subject, operation, attempt, resource, incarnation, authority reference, capability/scope.

## 11. Residual history candidate
After packing, the residual may consist only of:
- atomic linearization/no-interleaving support;
- exact recheck fact-set semantics;
- invalidation/order relations not reconstructible elsewhere;
- future continuation support.
This is a candidate, not a proven lower bound.

## 12. Cross-protocol transition-space attack
ATOMIC and LEASE with identical current fields must not be merged if LEASE permits EXPIRE/RENEW/CONSUME transitions unavailable to ATOMIC. ATOMIC and RECHECK must not be merged if RECHECK creates a future obligation to re-establish specific facts. LEASE and RECHECK must not be merged if their continuation spaces differ.

## 13. Stuttering criterion
A concrete action may map to abstract STUTTER only when it preserves:
- abstract semantic context;
- actual admission linkage;
- protocol validity;
- retained history support;
- future continuation space relevant to P_AA;
- claim observations.
This is stricter than preserving only visible state fields.

## 14. UNKNOWN as an escape hatch, not a compression license
If two histories are merged but a hidden distinction can later become decisive, the abstraction must expose UNKNOWN at the point where the retained representation becomes insufficient. UNKNOWN cannot be used to justify arbitrary loss of current linkage or authority semantics.

## 15. Candidate reduced semantic product
Current strongest candidate:
SEM_AA = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + ResidualProtocolHistory.
The final term may shrink only after bounded transition attacks and reconstruction tests.

## 16. Minimality status
No global minimality theorem exists. We have only counterexample-based lower bounds and bounded candidate compressions. A successful finite compression test is evidence, not proof.

## 17. AB36X frontier
1. Execute/instantiate the bounded transition enumeration in a reproducible research artifact if tooling permits.
2. Record shortest distinguishing traces and failed compression attempts.
3. Test totality and transition preservation of F.
4. Attack the proposed residual history dimensions jointly.
5. Determine the smallest stable reduced product.
6. Draft the next TLA+ model only after the semantic product stabilizes.
