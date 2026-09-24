NEXO - TRUST FOUNDATION COMPROMISE / MINIMUM TCB / RECOVERY-KEY AND ROOT-UPDATE RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

RESEARCH QUESTION
Can Nexo update or recover its own Trust Foundation without temporarily trusting the component being updated, and what is the minimum irreducible TCB for a strongest safety claim?

EXTERNAL CROSS-CHECKS
NIST defines Roots of Trust as highly reliable hardware, firmware or software components performing critical security functions, and says they must be secure by design. SP 800-193 discusses protecting roots by making them immutable or verifying integrity/authenticity before update, and notes that multiple independent roots/chains may be needed for comprehensive coverage. cite: turn0search6, turn0search26.
NIST SP 800-193 addresses protection, detection and secure recovery of platform firmware; it is a trust-foundation reference, not a direct Nexo architecture requirement. cite: turn0search0.
TUF separates update roles, supports threshold signatures, key replacement and offline root keys; its design treats compromise of signing keys as something the system must survive rather than assuming keys are never compromised. cite: turn0search1, turn0search5, turn0search7, turn0search8.
TLA+ refinement makes implementation-to-spec correspondence explicit: a lower-level implementation must imply the higher-level specification under a refinement mapping. cite: turn0search24, turn0search25, turn0search27.

CORE RESULT
A Trust Foundation cannot safely update itself using only authority wholly inside the component being updated. Otherwise the update authority can redefine its own safety boundary before the new boundary is established.
Candidate rule: SELF_MODIFICATION + NO_EXTERNAL_OR_PRIOR_ENFORCEMENT_BOUNDARY -> STRONG_SAFETY_CLAIM_UNAVAILABLE_DURING_TRANSITION.
The architecture therefore needs a continuity-preserving update root or a safe non-action transition.

MINIMUM TCB IS CLAIM-RELATIVE
There is no single universal Nexo TCB.
For claim C, TCB(C) is the smallest set of components, assumptions, state and external mechanisms whose compromise/failure could invalidate C and whose behavior is relied upon to prevent, authorize, or verify the protected property.
TCB != ALL SOFTWARE. TCB != ALL INFRASTRUCTURE. TCB IS CLAIM-SPECIFIC.
For an internal claim, TCB may stop at the authoritative state machine. For an external-prevention claim, it expands through enforcement boundary, resource-side fence, trust root, update path, recovery path and relevant environment assumptions.

TCB CLOSURE
CLAIM -> REQUIRED INVARIANTS -> AUTHORITY/ADMISSION -> ASSURANCE -> EFFECT BOUNDARY -> FENCE -> RESOURCE -> IDENTITY/CREDENTIALS -> TRUST ROOT -> UPDATE/RECOVERY -> DEPENDENCIES -> ENVIRONMENT ASSUMPTIONS.
Stop when a dependency is either an explicitly trusted foundation, an independently enforced boundary, or an explicit environment assumption sufficient for the claim. UNKNOWN dependency prevents claiming closure is complete.

TRUST FOUNDATION MUST HAVE A BOUNDARY
A root cannot be protected only by the mechanism it controls.
Candidate properties: protected identity; protected update authority; protected recovery authority; continuity anchor; rollback resistance; compromise detection; bounded recovery path; protected configuration; explicit dependency closure; failure-domain definition.
NIST supports the principle that roots require stronger protection than the software they protect; it describes immutability, privileged isolation, or verification before changes as possible protections. cite: turn0search26.

IMMUTABLE VS VERIFIABLY UPDATEABLE
Two legitimate designs: A) immutable foundation; B) protected mutable foundation whose changes are authorized and verified by an already-protected mechanism.
Fully self-hosting trust without a protected anchor is not a complete safety architecture.

MULTIPLE ROOTS
NIST notes complex platforms may need multiple independent roots/chains for comprehensive coverage. cite: turn0search26.
Nexo should identify required trust roots per strong claim. Shared roots create common-mode dependencies; independent roots can support claim-specific separation only when failure-domain closure supports it.
TUF's separate roles, threshold signatures and offline root keys are useful compromise-resilience patterns. cite: turn0search1, turn0search5, turn0search7.

TRUST ROOT UPDATE
UPDATE_REQUEST -> CLAIM/TCB IMPACT CLOSURE -> CURRENT_ROOT_AUTHORIZATION -> NEW_ROOT_ARTIFACT_AUTHENTICATION -> NEW_ROOT_POLICY/CONFIG VALIDATION -> DEPENDENCY CLOSURE -> CONTINUITY COMPATIBILITY -> INSTALL/PREPARE -> ACTIVATE -> INDEPENDENT VERIFICATION -> CONTINUITY COMMIT -> INVALIDATE OLD UPDATE RIGHTS -> REVALIDATE DEPENDENT CLAIMS -> RELEASE.
No step permits the new root to self-declare itself current before protected verification.

ROOT UPDATE GAP
Dangerous: R0 current -> R1 prepared -> R0 disabled -> R1 fails -> no root can enforce safety.
Safe alternatives: R0 remains protected until R1 verified; an independent fallback root remains capable of enforcing the safety property; or the affected capability enters safe non-action.

RECOVERY KEY
Recovery authority is not automatically normal authority.
Candidate separation: NORMAL_UPDATE_KEY, RECOVERY_KEY, DECOMMISSION_KEY, EMERGENCY_STOP_AUTHORITY, ASSURANCE_FENCE_AUTHORITY.
A recovery key that can silently install arbitrary new normal authority effectively becomes a normal root and enlarges the TCB.
Therefore RECOVERY_AUTHORITY != NORMAL_AUTHORITY unless explicitly defined and bounded.
TUF's offline/threshold root patterns are useful compromise-resilience analogies. cite: turn0search1, turn0search5, turn0search7.

ROLLBACK AND ABA
Rollback must not restore old authority generation, root keys, fence generation, recovery authority or resource binding merely because old bytes are restored.
RESTORED_ROOT_ARTIFACT + OLD_CONTEXT != CURRENT_TRUST_FOUNDATION.
Root R1 -> R2 -> rollback -> R1 bytes restored must not let stale authority regain power. Candidate RootIncarnation = logical_root_id + trust_generation + continuity_anchor.

COMPROMISED ROOT
DETECT -> SAFETY CUTOFF -> REVOKE/QUARANTINE -> PROTECT CURRENT EFFECT BOUNDARIES -> ACTIVATE INDEPENDENT FALLBACK -> ESTABLISH NEW ROOT -> REBUILD DEPENDENCIES -> VERIFY -> REVALIDATE CLAIMS -> EXPLICIT RELEASE.
If no independent fallback exists, strongest claims become unavailable. This is a claim downgrade, not proof that the world is safe.

TCB AND COMMON-MODE FAILURE
Two roots are not independent if they share the same trust root, signing key, update channel, storage, hypervisor/runtime, credential source, policy/config, operator or recovery mechanism.
MULTIPLE_ROOTS != INDEPENDENCE without failure-domain closure.

TCB MINIMIZATION
Target MINIMAL SOUND TCB, not MINIMAL NOMINAL TCB.
A dependency can be outside TCB only if its behavior is irrelevant to the claim, behind an independently enforced boundary, constrained by a sufficient environment contract, or outside scope because the claim was weakened.

DYNAMIC AUTHORITY
Plugins/providers/delegations can expand TCB when they gain effect capability, update capability, trust-root access, fence control, policy modification, recovery authority or claim-publication capability. Dynamic discovery therefore triggers TCB/closure recomputation when claim-relevant authority or enforcement changes.

SELF-MODIFICATION RULE
A component may not change the mechanism that determines whether its own modification is safe without an already-protected boundary deciding that transition.
Candidate SELF_MODIFY(C) requires CURRENT_EXTERNAL_OR_PRIOR_BOUNDARY(C), UPDATE_AUTHORITY_CURRENT, IMPACT_CLOSURE_COMPLETE, NEW_CONTEXT_VALID, ENFORCEMENT_VERIFIED and CONTINUITY_COMMITTED. Otherwise HOLD / QUARANTINE / SAFE_NON_ACTION.

CANDIDATE TrustFoundationContract
foundation_id; logical identity; incarnation/generation; protected claims; root keys/identities; update authority; recovery authority; decommission authority; continuity anchor; rollback semantics; compromise response; immutable/protected components; failure-domain closure; dependency closure; environment assumptions; verification method; update protocol; recovery protocol; claim scope; invalidation triggers.

CANDIDATE TCBClaim
claim_id; claim_strength; protected property; included/excluded components; trust roots; enforcement boundaries; dependency closure; environment assumptions; failure domains; update/recovery closure; proof/refinement context; evidence; verification status; invalidation conditions.

CANDIDATE TRUST STATES
FOUNDATION_CURRENT, FOUNDATION_UPDATE_PREPARED, FOUNDATION_UPDATE_VERIFIED, FOUNDATION_UPDATE_COMMITTED, FOUNDATION_DEGRADED, FOUNDATION_COMPROMISED, FOUNDATION_QUARANTINED, FOUNDATION_RECOVERY, FOUNDATION_UNKNOWN.
UNKNOWN/COMPROMISED cannot support strongest claims.

CANDIDATE INVARIANTS INV-TCBF-01..40
01 TCB is claim-specific.
02 TCB closure includes every dependency capable of invalidating the claim.
03 unknown dependency prevents strong closure.
04 TCB minimization cannot remove a claim-relevant dependency.
05 trust foundation cannot self-authorize unsafe modification.
06 foundation update is a protected transition.
07 foundation recovery is a protected transition.
08 recovery authority is not automatically normal authority.
09 root generation is part of continuity.
10 root ABA is forbidden.
11 rollback does not restore old authority.
12 signed artifact is not sufficient for currentness.
13 authenticated update is not sufficient for semantic compatibility.
14 update compatibility is claim-specific.
15 old foundation remains protected until new foundation is verified or fallback exists.
16 no unsafe root transition gap.
17 independent fallback must be independently enforceable.
18 multiple roots do not automatically mean independence.
19 common-mode dependencies reduce independence.
20 trust-root compromise invalidates dependent claims.
21 recovery keys must be bounded.
22 break-glass remains inside closure.
23 update path belongs to TCB closure when it can alter protected behavior.
24 recovery path belongs to TCB closure when it can alter protected behavior.
25 resource replacement changes trust binding.
26 fence generation belongs to trust continuity.
27 policy/invariant generation belongs to trust continuity when claim-relevant.
28 environment assumptions are explicit.
29 trust foundation scope is claim-specific.
30 trust foundation does not prove world truth.
31 historical root state does not grant current authority.
32 restored root state requires current continuity.
33 TCB changes invalidate dependent proofs/assurance.
34 dynamic authority expansion triggers TCB recomputation.
35 self-modification requires a pre-existing safety boundary.
36 safe non-action is valid fallback during root transition uncertainty.
37 false-stale is preferable to false-current.
38 no strong claim across unresolved foundation transition.
39 formal refinement is required before implementation assurance.
40 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: For claim C, if TCB(C) is soundly closed, its trust foundation is protected by a mechanism outside the mutable portion being updated, every safety-critical update preserves an enforceable boundary throughout transition, rollback cannot restore prior authority generation, recovery authority is bounded, and dependent claims are revalidated after foundation changes, then the trust foundation can be updated/recovered without requiring the updated component to establish its own safety authority.
If the protected boundary disappears during the transition, strongest safety claims must be unavailable for that interval.

MINIMUM IRREDUCIBLE TCB RESULT
We cannot honestly claim a universal tiny TCB.
The irreducible TCB for a claim is the smallest sound closure of all mechanisms whose failure could make the protected claim false while bypassing the remaining enforcement boundary.
Recursive but terminating rule: TCB(C) -> dependencies -> boundaries -> trust roots -> update/recovery -> foundations -> explicit assumptions. Stop at declared trust foundations or explicit assumptions.

ARCHITECTURE CONSEQUENCE
Clean architecture now needs an explicit Trust Foundation layer below normal Authority/Assurance machinery:
Z0 TRUST FOUNDATION
Z1 AUTHORITATIVE SAFETY CORE
Z2 CONTROL / ASSURANCE / SEMANTIC PLANE
Z3 EFFECT / OBSERVATION
Z4 EXTERNAL WORLD
Z0 is not everything trusted forever. It is a claim-scoped, explicitly bounded foundation with continuity, update protection, recovery protection, compromise response and TCB closure.

DEEP RULE
THE COMPONENT THAT IS BEING UPDATED CANNOT BE THE SOLE AUTHORITY THAT DECIDES WHETHER ITS OWN UPDATE REMAINS SAFE.

No implementation or formal verification is claimed.

NEXT ATTACK
TCB COMPOSITION + MULTIPLE TRUST FOUNDATIONS + PARTIAL COMPROMISE + COMMON-MODE FAILURE + CLAIM-SPECIFIC ROOTS + ASSURANCE/EXECUTION CROSSING.
Question: if different strong claims use different trust foundations, can Nexo safely compose them without accidentally creating a hidden common root or silently promoting a weaker foundation into a stronger authority?