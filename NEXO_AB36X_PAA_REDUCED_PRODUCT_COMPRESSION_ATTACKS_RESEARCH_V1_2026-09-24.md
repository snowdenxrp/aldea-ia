# NEXO AB36X — REDUCED PRODUCT COMPRESSION ATTACKS RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport's official Auxiliary Variables material makes the refinement obligation explicit as implementation implication under a refinement mapping and explains that history variables can be added when the mapping cannot be expressed using ordinary implementation variables. It also distinguishes history variables from stuttering variables. This directly supports treating the residual protocol history as an auxiliary semantic support candidate rather than automatically as implementation state. citeturn0search1

## 2. Objective
Attack the candidate reduced product:
SEM_AA = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + ResidualProtocolHistory.
The goal is to determine which residual dimensions can be reconstructed from the first six components and which cannot.

## 3. Compression C1 — remove explicit protocol label
Candidate: eliminate ProtocolClass and reconstruct ATOMIC/LEASE/RECHECK from bridge/binding/history.
Attack:
- ATOMIC and LEASE share current bridge fields but differ in legal EXPIRE/RENEW transitions.
- ATOMIC and RECHECK share current authority fields but differ in whether authorization facts are re-established at admission.
- LEASE and RECHECK share current validity but differ in future renewal/expiry obligations.
Result: protocol label itself is not proven necessary, but protocol semantics must remain reconstructible.

## 4. Compression C2 — remove atomic linearization support
Attack: same current state, one history permits REVOKE between DECIDE and ADMIT and one has a genuine atomic point. Result differs. Reject unless atomicity is encoded equivalently in another retained component.

## 5. Compression C3 — remove recheck fact-set
Attack: both records say recheck=true. One rechecked policy/delegation/incarnation, the other only authority. A later policy/incarnation change creates different admission behavior. Reject Boolean-only representation.

## 6. Compression C4 — remove invalidation order
Attack: POLICY_CHANGE and DELEGATION_CHANGE occur in different orders with a lease/admission in between. Current state can converge while historical protocol validity differs. Reject unless order is recoverable from bridge/binding semantics.

## 7. Compression C5 — remove retry/attempt support
Attack: same operation but different attempt binding. A retry can either inherit or require new authorization. Reject whenever the protocol contract is attempt-scoped.

## 8. Compression C6 — remove lease renewal history
Attack: renewal before versus after authority change. If renewal validates authority, outcomes differ. Conditional rejection: removable only under a protocol contract where renewal has no claim-relevant revalidation and the bridge summary preserves all future renewal behavior.

## 9. Compression C7 — remove lease consumption/replay state
Attack: consumed bridge versus unused bridge followed by RETRY. Conditional: reject if replay semantics distinguish them; removable only if replay is semantically inert and future transition space remains equivalent.

## 10. Compression C8 — remove bridge issuance linkage
Attack: B1 was actually issued for the admission; B2 is another valid bridge. If only generic validity is retained, witness substitution becomes possible. Reject unless issuance/admission relation is encoded in LeaseBridge or AdmissionBindingClass.

## 11. Compression C9 — remove UsedAdmissionContext
Reject unconditionally for P_AA as currently defined. Existence of any valid authority/bridge cannot substitute for the authority/bridge actually used by the admission.

## 12. Compression C10 — remove resource incarnation
Reject for incarnation-sensitive P_AA. Same resource_id with a new incarnation can invalidate a previously issued bridge.

## 13. Compression C11 — remove epoch/currentness
Reject. Epoch monotonicity does not establish validity of the old authority or create replacement authority.

## 14. Compression C12 — collapse policy and delegation into one generic 'valid context'
Reject. They have independent semantics and joint hyperdependencies. A generic validity bit can conceal which dependency invalidated the bridge.

## 15. Compression C13 — remove future continuation support
Reject. Current observation equality is insufficient when future transition spaces differ. Future behavior must be retained or reconstructible.

## 16. Surviving candidate residual
After these attacks, the likely residual is not a raw event log. It is a semantic support object containing only distinctions not recoverable from Bridge/Binding:
- atomic linearization/no-interleaving semantics;
- exact recheck fact-set semantics;
- unrecoverable invalidation/order relations;
- future continuation equivalence support.
This is still a candidate lower bound, not a proof of minimality.

## 17. Packing theorem candidate
A dimension d can be removed from ResidualProtocolHistory only if there exists a reconstruction F_d from the retained product such that:
1. F_d is defined for every modeled concrete history;
2. actual UsedAdmissionContext is preserved;
3. all legal successors are represented or matched;
4. P_AA observations are preserved for every bounded continuation;
5. no authority is introduced by abstraction;
6. unresolved cases become UNKNOWN before decisive use.

## 18. Important refinement distinction
The research model should not force every history variable into implementation state. The correct target is a refinement mapping from concrete implementation state plus auxiliary history into the abstract semantic product. If a history variable is only needed for the mapping and can be existentially hidden without changing the implementation behavior, it need not become physical runtime state. This is consistent with Lamport's treatment of auxiliary variables. citeturn0search1

## 19. Current status
Rejected or conditionally rejected compressions give a semantic lower bound. No universal minimality theorem yet. No claim that R1 alone is sufficient.

## 20. AB36Y frontier
1. Define the residual support object formally as a quotient class rather than a bag of fields.
2. Test whether residual support can be reduced to a finite relation over admission, bridge, and event-order nodes.
3. Attack pairwise-independent residual dimensions jointly.
4. Define the reconstruction function F and bounded obligations.
5. Only then decide whether the next TLA+ abstract state can omit explicit ProtocolHistorySupport variables.
