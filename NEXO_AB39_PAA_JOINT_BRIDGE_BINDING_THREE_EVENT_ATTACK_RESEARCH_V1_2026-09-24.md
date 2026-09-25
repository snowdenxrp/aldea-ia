# NEXO AB39 — PAA JOINT BRIDGE/BINDING THREE-EVENT ATTACK RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB38 was reread directly before this round. The target is to determine whether Qres can be absorbed jointly by LeaseBridge + AdmissionBindingClass. This round attacks the product with 3-event histories and joint dependencies.

## 2. External cross-check
Lamport's refinement material supports the use of auxiliary history information when a refinement mapping cannot be expressed directly from implementation variables. It also separates auxiliary history from ordinary implementation state. This remains a design cross-check, not a verification of Nexo. citeturn0search1

## 3. Joint attack principle
A packing function must be tested on the combined representation, not on Bridge and Binding independently. The question is whether two concrete histories can produce identical Bridge and Binding representations while differing in P_AA observation or future continuation.

## 4. Three-event separator family
J1 POLICY_CHANGE → DELEGATION_CHANGE → ADMIT.
J2 DELEGATION_CHANGE → RESOURCE_REINCARNATE → ADMIT.
J3 LEASE_ISSUE → POLICY_CHANGE → ADMIT.
J4 LEASE_EXPIRE → RETRY → ADMIT.
J5 DECIDE → AUTH_REVOKE → ADMIT.
J6 LEASE_RENEW → POLICY_CHANGE → ADMIT.
J7 AUTH_CHANGE → LEASE_RENEW → DELEGATION_CHANGE → ADMIT (4-event extension where the 3-event projection hides the joint split).
J8 RECHECK(policy) → DELEGATION_CHANGE → ADMIT.
J9 RETRY(A) → RESOURCE_REINCARNATE → ADMIT(B).
J10 LEASE_CONSUME → RETRY → ADMIT.

## 5. J1 — policy + delegation
Construct histories with equal final PolicyContext and DelegationContext labels but different ordering and bridge validity intervals. If Bridge/Binding contain only current compatibility bits, the histories collide while admission validity differs. Therefore a compatibility bit is insufficient; the relation/order or equivalent semantic result must survive.

## 6. J2 — delegation + incarnation
A bridge may be valid for delegation D and resource incarnation I1. After delegation change and reincarnation, a later admission using the same resource identifier can be invalid even when current scalar fields appear valid. Binding must include incarnation and bridge must preserve the delegation/incarnation linkage.

## 7. J3 — lease issue + policy change
A bridge issued under P1 followed by P2 can differ from a bridge whose validity was established under P2, even if the current policy is P2. If policy compatibility is evaluated only from current state, historical bridge validity can be reconstructed incorrectly.

## 8. J4 — expiry + retry
A retry may occur after bridge expiry. If retry creates a new attempt but the representation collapses attempt and bridge consumption, an old authorization can be silently inherited. Attempt binding and replay/expiry semantics must jointly survive.

## 9. J5 — decide + revoke + admit
A decision may be valid at decision time while admission is invalid after revocation. A true atomic protocol must prevent the relevant interleaving; a lease/recheck protocol must explicitly cover it. Generic `decision=true` cannot encode this.

## 10. J6 — renewal + policy
Renewal may revalidate against policy. A renewal before policy change can differ from renewal after it. If Bridge stores only current validity, future renewal behavior can be wrong.

## 11. J7 — 4-event extension
The 3-event projection can conceal a dependency among renewal, policy, and delegation. This demonstrates that a successful 3-event test does not establish closure for longer histories. Bounded depth is a test bound, not a proof bound.

## 12. J8 — recheck + delegation
A recheck that records only a Boolean can collide with a recheck that re-established policy but not delegation. A later admission then separates them. Exact fact-set semantics remain required unless encoded in another structure.

## 13. J9 — retry + incarnation
Attempt B after resource reincarnation must not inherit an authorization bound to incarnation I1 unless the protocol explicitly permits it. Resource identity alone is insufficient.

## 14. J10 — consume + retry + admit
If bridge consumption is replay-protective, consuming before retry can make retry invalid while retry before consumption can be valid. A current `bridge.valid=true` summary loses this distinction.

## 15. Product-level result
The joint attacks reject a naive claim that `LeaseBridge + AdmissionBindingClass` are automatically complete merely because each component covers its own obvious fields. Cross-component relations matter:
- policy ↔ bridge validity;
- delegation ↔ bridge validity;
- incarnation ↔ bridge/binding;
- attempt ↔ retry ↔ bridge consumption;
- renewal ↔ policy/delegation;
- admission ↔ actual bridge;
- protocol ↔ order/linearization.

## 16. Important refinement
The result does NOT prove that Qres must remain as a separate state component. It proves only that any absorption must preserve these joint relations. They may be encoded inside a richer Bridge, a richer Binding class, a derived relation, or auxiliary history.

## 17. Candidate enriched representations
Option A: `LeaseBridge*` absorbs protocol and invalidation relations.
Option B: `AdmissionBindingClass*` absorbs all admission-local protocol relations.
Option C: a derived `ProtocolRelation(admission, bridge, history)` remains auxiliary.
Option D: a quotient class combines A/B/C semantically while physical representation remains implementation-specific.

## 18. Shortest current lower-bound intuition
For the mixed protocol model, the strongest unavoidable semantic facts remain:
1. actual used admission context;
2. authorization validity at the admission point;
3. resource incarnation;
4. policy/delegation compatibility;
5. protocol validity and linearization/interval semantics;
6. replay/attempt semantics where applicable;
7. future continuation equivalence.
These are semantic dimensions, not a required number of variables.

## 19. Qres status
Qres is NOT eliminated. The joint attack makes the burden of proof stronger: a proposed absorption must preserve cross-component hyperrelations, not merely each scalar field.

## 20. AB40 frontier
1. Formalize the joint hyperrelation carried by Bridge + Binding.
2. Determine whether an enriched BridgeBinding product can absorb Qres.
3. Attack 4-event and permutation traces systematically.
4. Define the smallest relational signature sufficient for P_AA.
5. If stable, freeze semantic kernel and derive abstract Next.
6. Only then produce the next TLA+ artifact.
