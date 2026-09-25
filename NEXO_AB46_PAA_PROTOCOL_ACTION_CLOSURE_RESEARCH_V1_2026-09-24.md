# NEXO AB46 — PAA PROTOCOL ACTION CLOSURE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Baseline
AB45 was reread directly before this round. This round derives action-contract obligations from the protocol semantic algebra rather than treating ContinuationRules as an oracle.

## 2. External cross-check
Lamport's official material describes TLA+ Next as the relation specifying which steps may happen, and refinement mappings as substitutions from lower-level state expressions into a higher-level specification. Auxiliary variables may be needed to construct that mapping; stuttering is legitimate only when relevant abstract variables remain unchanged. citeturn0search8turn0search19turn0search18turn0search6

## 3. Generic action contract
For protocol p, each semantic action is `A_p = <Pre_p, Post_p, Frame_p, Invalidation_p, HistorySupport_p, AdmissionLink_p>`. These are semantic obligations, not necessarily six implementation variables.

## 4. ATOMIC derivation
Pre: required authorization context exists, complete binding is established, boundary permits, and atomic linearization precondition holds. Post: admission occurs at the semantic linearization point with used authorization/binding immutably linked. Frame: unrelated state does not change claim-relevant abstract context. Invalidation: relevant invalidation cannot interleave across the atomic point; later events do not rewrite historical linkage. HistorySupport: enough order information establishes the linearization point and absence of prohibited interleaving. AdmissionLink: admission references the actual authority/binding used at the point.

## 5. LEASE derivation
Pre: bridge issued and bound to subject/operation/attempt/resource/incarnation/authority/policy/delegation/boundary under the lease contract. Post: admission uses the bridge while valid and linked to the actual admission. Frame: unrelated state remains unchanged abstractly. Invalidation: expiry, revocation, epoch, policy, delegation, incarnation, replay/consumption, and boundary changes invalidate the bridge exactly under contract. HistorySupport: issuance, admission, expiry/renewal, consumption, and invalidation ordering sufficient to assess the actual bridge. AdmissionLink: immutable linkage among admission, used bridge, and authorization context.

## 6. RECHECK derivation
Pre: admission attempt exists and required recheck can establish the complete P_AA fact set. Post: required facts are re-established at admission and actual admission is linked to that result. Frame: unrelated state does not alter claim-level context. Invalidation: claim-relevant mutation between recheck and admission is either excluded or forces failure/UNKNOWN according to contract. HistorySupport: exact recheck fact-set and order relative to admission are reconstructible. AdmissionLink: actual admission references the recheck result/facts used, not an unrelated valid check.

## 7. Common obligations
Across protocols: actual admission linkage; authority validity at admission; complete binding; policy/delegation/incarnation/boundary semantics; no-authority-amplification; immutable historical linkage; UNKNOWN for unresolved required distinctions; no Z4 external-success inference.

## 8. Protocol differences are transition semantics
The same current TRUE_JUSTIFIED observation can arise in all three protocols while legal successors differ. Protocol semantics must therefore determine guards and invalidations, not merely current observation.

## 9. Generic Next candidate
`Next_AA == \\E p \\in Protocols : Next_p`, where each `Next_p` is the disjunction of protocol-specific action contracts plus valid stuttering. This is conceptually cleaner than encoding protocol behavior as an observation predicate.

## 10. Stuttering gate
A concrete step may map to abstract stutter only if it preserves claim-relevant kernel state, actual linkage, protocol semantic obligations, required order/invalidation support, boundary semantics, and future observation behavior. A step changing lease expiry, renewal rights, recheck fact-set, actual linkage, or relevant invalidation order is not automatically stutter merely because current output stays TRUE_JUSTIFIED. citeturn0search6turn0search18

## 11. History support is not arbitrary logging
`HistorySupport_p` means the minimal claim-relative distinctions required to reconstruct the action's semantic obligations. It is not equivalent to retaining the entire event log.

## 12. Auxiliary-history boundary
Auxiliary history may define the refinement mapping and reconstruct historical linkage, but cannot manufacture authority, change the claim boundary, or turn an unknown historical distinction into a justified fact. Auxiliary variables serve refinement, not new external authority. citeturn0search0turn0search19

## 13. Generic schema test
A single action schema is sound only if protocol p supplies semantics for every required field. Missing protocol semantics cannot default to TRUE; they must be explicitly irrelevant by contract or become UNKNOWN.

## 14. New reduction
`ContinuationRules` is no longer a primitive candidate. It is derived from closure of `Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink` over the allowed action alphabet. This avoids circularity.

## 15. Remaining open issue
We have not proven that these six obligations jointly determine all future P_AA observations. A hidden protocol distinction may still survive. The next attack must search for two histories satisfying identical six-contract projections but different future observations.

## 16. AB47 frontier
1. Construct collision pairs with identical six-contract projections.
2. Attack sufficiency separately for ATOMIC, LEASE, RECHECK.
3. Attack joint protocol collisions.
4. Determine whether HistorySupport can be reduced to explicit order/invalidation/linkage relations.
5. If no separator remains within bounded exploration, prepare semantic-freeze candidate, explicitly marking bounded evidence as not proof.
