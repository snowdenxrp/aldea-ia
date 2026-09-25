# NEXO AB36V — BOUNDED PROTOCOL DISTINGUISHING TRACES RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Objective
Instantiate the bounded distinguishability relation conceptually and derive shortest separating traces for protocol-history dimensions. This is finite research evidence, not a universal proof.

## 2. External cross-check
Lamport's official material supports the use of history variables to record past behavior for refinement mappings and distinguishes them from stuttering variables. Lower-level implementations may take extra steps that map to abstract stuttering. This supports keeping protocol history auxiliary where semantics permit, but does not permit hiding a step that changes future abstract behavior. citeturn0search1turn0search3

## 3. Trace criterion
For histories H1,H2 differing only in dimension d, a trace c is distinguishing when:
Obs_AA(H1,c) != Obs_AA(H2,c), or the required refinement/linkage obligations differ.
ShortestDist(d) is the minimum length of such a legal trace under the finite contract.

## 4. D1 — atomic linearization
Shortest candidate separator:
REVOKE -> ADMIT
where H1 has a true atomic DECIDE+ADMIT point before REVOKE and H2 exposes a hidden interleaving between DECIDE and ADMIT.
Conclusion: atomicity semantics cannot be removed unless encoded equivalently elsewhere.

## 5. D2 — lease issuance-to-admission relation
Shortest candidate separator:
LEASE_ISSUE(B1) -> ADMIT(using B2)
when B1 is the valid issued bridge and B2 is another valid-looking bridge.
Conclusion: issuance/admission linkage is necessary unless AdmissionBindingClass+LeaseBridge uniquely reconstruct it.

## 6. D3 — expiry/order
Shortest separator:
LEASE_EXPIRE -> ADMIT
versus
ADMIT -> LEASE_EXPIRE.
Conclusion: if admission validity is evaluated at admission, expiry ordering is claim-relevant and cannot be erased.

## 7. D4 — renewal provenance
Candidate separator:
AUTH_CHANGE -> LEASE_RENEW -> ADMIT
versus
LEASE_RENEW -> AUTH_CHANGE -> ADMIT.
If renewal requires current authority, the assessments differ. If renewal semantics are purely mechanical and do not revalidate authority, the distinction may be removable under that protocol contract.
Status: CONDITIONAL, contract-dependent.

## 8. D5 — consumption/replay
Candidate separator:
ADMIT/CONSUME -> RETRY.
Compare consumed versus unconsumed bridge. If replay is forbidden, observations differ. If replay is explicitly allowed without semantic change, consumption can be omitted.
Status: CONDITIONAL.

## 9. D6/D7 — recheck semantics
Candidate separator:
POLICY_CHANGE -> RECHECK -> ADMIT
where H1 rechecks policy+delegation+incarnation and H2 rechecks authority only.
Conclusion: `recheck=true` is not a sufficient semantic representation. Exact re-established facts and admission binding must be reconstructible.

## 10. D8 — attempt identity
Candidate separator:
ADMIT(attempt A) -> RETRY(attempt B).
If authorization is attempt-scoped, collapsing A/B changes whether retry is authorized. Status: CONDITIONAL on protocol contract, but mandatory whenever retry semantics are attempt-sensitive.

## 11. D9 — resource incarnation
Candidate separator:
RESOURCE_REINCARNATE -> RETRY/ADMIT.
Same resource_id with different incarnation can invalidate an earlier bridge. Incarnation is therefore mandatory for incarnation-sensitive authorization/admission.

## 12. D10 — authority epoch/currentness
Candidate separator:
EPOCH_ADVANCE -> ADMIT
without a valid replacement authority. Current epoch alone cannot prove the prior authority remains valid.
Conclusion: epoch/currentness semantics cannot be replaced by monotone epoch numbering.

## 13. D11/D12 — policy/delegation
Candidate separators:
POLICY_CHANGE -> ADMIT
DELEGATION_CHANGE -> ADMIT.
Joint separator:
POLICY_CHANGE -> DELEGATION_CHANGE -> ADMIT.
The joint trace is important because componentwise summaries may each look safe while their interaction changes P_AA.

## 14. D13 — actual used linkage
Shortest conceptual separator is witness substitution:
AuthA valid, AuthB valid, Admission linked to AuthA, abstraction retains only “some valid authority exists.”
The abstract witness can then be substituted by AuthB. Therefore actual UsedAuth/UsedBridge linkage is irreducible unless uniquely encoded elsewhere.

## 15. D14 — boundary
Boundary is not a normal event dimension. It is a contract parameter. A boundary change between representatives is not a valid equivalence comparison unless the contract explicitly permits dynamic boundary changes.

## 16. D15 — invalidation order
Shortest useful joint separator:
INVALIDATE -> RESTORE -> ADMIT
versus
RESTORE -> ADMIT.
Restoration does not automatically erase historical invalidation. If the protocol semantics depend only on current validity, the distinction may be irrelevant; if they depend on historical lease/replay state, it remains relevant.

## 17. Cross-protocol collision matrix
ATOMIC vs LEASE: distinguishable by EXPIRE/RENEW availability unless lease semantics are fully encoded as inert metadata.
ATOMIC vs RECHECK: distinguishable by hidden interleaving or by the set of facts re-established.
LEASE vs RECHECK: distinguishable by future renewal/expiry/recheck obligations unless those are reconstructed identically.

## 18. Minimal semantic packing candidates
Potentially packable into LeaseBridge:
- issuance relation;
- expiry/renewal state;
- replay/consumption semantics;
- protocol-specific validity interval;
provided future behavior is preserved.

Potentially packable into AdmissionBindingClass:
- subject/operation/attempt/resource/incarnation linkage;
- authority reference;
- capability/scope relation;
provided no protocol semantics are lost.

Likely residual ProtocolHistorySupport:
- atomic linearization or equivalent no-interleaving evidence;
- recheck fact-set semantics;
- invalidation/order facts not recoverable from bridge/binding;
- future continuation support.

## 19. Important distinction
A shortest distinguishing trace rejects a proposed compression. It does not prove that the retained representation is globally minimal. Conversely, no separator within the tested finite domain does not prove eliminability.

## 20. Research conclusion
The bounded analysis supports a two-level lower bound:
A) semantic dimensions that must remain representable;
B) physical fields/events that may be compressed if their behavior is preserved.
The current strongest candidate remains:
AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + ProtocolHistorySupport,
with several history dimensions conditionally packable into LeaseBridge/BindingClass.

## 21. AB36W frontier
1. Define the exact bounded transition relation, including legal preconditions.
2. Enumerate all pairwise and selected three-event traces systematically.
3. Compute shortest separators rather than hand-selected examples.
4. Test whether the proposed packing functions are total and transition-preserving.
5. Attack the residual ProtocolHistorySupport itself.
6. Derive a candidate reduced semantic product and only then return to TLA+.
