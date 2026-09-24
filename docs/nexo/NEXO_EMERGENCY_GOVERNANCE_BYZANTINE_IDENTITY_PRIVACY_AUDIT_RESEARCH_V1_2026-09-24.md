# NEXO EMERGENCY GOVERNANCE BYZANTINE IDENTITY PRIVACY AUDIT RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. NO V21 IMPLEMENTATION. NO CORRECTNESS CLAIM.

## Target
Attack emergency governance when human recovery participants may be Byzantine or colluding, the identity provider is compromised, root trust rotates, evidence arrives late, and audit/privacy rules constrain retained evidence.

Core property:
NO_EMERGENCY_GOVERNANCE_DECISION_MAY_BECOME_CURRENT_CONSTITUTIONAL_AUTHORITY_FROM_UNRESOLVED_IDENTITY_OR_COMMON_MODE_ASSUMPTIONS.

## External cross-check
TLA+ separates state-machine specification, invariant checking, and refinement; the model and assumptions define what is actually checked. Byzantine consensus work emphasizes explicit fault assumptions and quorum intersection rather than raw signature counts. Privacy guidance also treats data minimization and purpose limitation as design constraints, creating a tension with long-term safety evidence retention. Sources:
- https://lamport.azurewebsites.net/tla/high-level-view.html
- https://lamport.azurewebsites.net/tla/tools.html
- https://arxiv.org/abs/1803.05069
- https://www.nist.gov/privacy-framework

## Core separations
IDENTITY_AUTHENTICATION != IDENTITY_TRUSTWORTHINESS.
SIGNATURE_VALIDITY != HONEST_BEHAVIOR.
HUMAN_QUORUM_COUNT != INDEPENDENT_GOVERNANCE_ASSURANCE.
AUDIT_RECORD != AUTHORITY.
PRIVACY_DELETION != SAFETY_ERASURE.
MINIMIZATION != LOSS_OF_REQUIRED_SAFETY_EVIDENCE.
HISTORICAL_PROVENANCE != CURRENT_AUTHORITY.
LATE_EVIDENCE != INVALID_EVIDENCE.

## Attack 1: compromised identity provider
Assume emergency users H1,H2,H3 authenticate through one compromised identity provider. All credentials validate.

If the IdP can forge or alter identity state, credential validity cannot establish independent governance authority.

Required:
- bind identity to authentication context and issuance generation;
- identify identity-provider dependency;
- distinguish historical attribution from current authorization;
- include IdP in common-mode closure;
- if identity trust is unresolved, do not promote a governance decision to current constitutional authority.

Candidate state:
IDENTITY_TRUST_UNRESOLVED.

## Attack 2: Byzantine human quorum
H1 signs successor S1.
H2 signs S1.
H3 signs incompatible S2.
All signatures are authentic.

The system must evaluate:
- fault model,
- membership generation,
- quorum rule,
- intersection,
- equivocation,
- failure-domain independence,
- root/trust generation,
- ordering position.

No majority-count shortcut.

Candidate response:
EQUIVOCATION_DETECTED -> FREEZE_DEPENDENT_TRANSITIONS -> RECORD_CONFLICT -> RECOMPUTE_TRUST_FORMULA -> CONTINUE ONLY IF SUCCESSION CONTRACT REMAINS SATISFIED.

## Attack 3: collusion without equivocation
Participants honestly sign the same malicious transition under a compromised common policy, operator, IdP, KMS, or governance channel.

No equivocation is necessary.

Therefore:
NO_EQUIVOCATION != NO_COMPROMISE.

Independence must be evaluated against failure domains and common-mode dependencies, not merely conflicting signatures.

## Attack 4: root rotation during emergency
Emergency decision D is valid under root R0.
R0 is cut off and R1 becomes current before D is published as constitutional currentness.

D remains historical evidence but must be revalidated or downgraded under R1.

Root transition must propagate through:
root cutoff -> dependent emergency certificates -> governance claims -> capabilities -> fences -> external effects -> compaction/reclamation permissions.

## Attack 5: late evidence
After an emergency decision, new evidence shows:
- identity provider compromise,
- participant equivocation,
- predecessor cutoff occurred earlier,
- provider continuation remained active,
- emergency credential had expired,
- common-mode dependency was compromised.

Late evidence is classified and ordered; it can invalidate, downgrade, fence, or trigger reconciliation.

No rule may say:
EMERGENCY_DECISION_ALREADY_MADE -> IMMUTABLE_CURRENT_AUTHORITY.

## Attack 6: privacy deletion removes safety-critical evidence
A raw emergency authorization record may contain personal information. Privacy requirements can require minimization or deletion.

Unsafe extremes:
KEEP_EVERYTHING_FOREVER
or
DELETE_ALL_RAW_RECORDS_AND_INFER_HISTORY_LATER.

Candidate solution:
separate identity-bearing raw evidence from a minimized safety residue.

Safety residue may contain:
- decision identity
- transition/order position
- authority/root generation
- membership generation
- authorization scope
- cryptographic commitment/digest
- evidence dependency fingerprint
- invalidation triggers
- retention class
- legal/policy basis
- permitted claim class

This does not imply that hashes alone prove the underlying event. The retained residue must be sufficient for the permitted safety claim under an explicit verification contract.

## Privacy/Safety boundary
Candidate object:
SafetyEvidenceRetentionContract

Fields:
- retention_id
- claim/purpose
- minimum required evidence
- raw evidence class
- minimized residue
- provenance commitment
- authority/root context
- membership context
- dependency/common-mode closure
- retention duration/rule
- deletion trigger
- legal/policy constraint
- revalidation requirement
- invalidation triggers
- permitted claim scope
- owner.

Rule:
CLAIM_SCOPE_AFTER_DELETION <= VERIFIED_RESIDUE_SCOPE.

If deletion destroys evidence needed for a stronger safety claim, the claim must be weakened before deletion.

## Identity privacy attack
If a safety claim needs to know that "authorized participant P approved transition T", storing P's full identity forever may exceed the claim's need.

Candidate architecture:
raw identity evidence -> protected access-controlled retention -> minimized cryptographic/provenance residue -> claim-specific verification.

But the residue must not become self-authenticating merely because it contains a digest.

## Audit attack
Audit logs can be delayed, duplicated, reordered, partially deleted, or generated by the same compromised subsystem.

Therefore:
AUDIT_LOG_PRESENT != AUDIT_TRUTH.
AUDIT_LOG_COUNT != INDEPENDENT_EVIDENCE.

Audit is evidence with dependency closure, not constitutional authority.

## Emergency succession protocol
AUTHORITY_DEGRADED
-> ENTER_BOUNDED_SAFETY
-> FREEZE_NEW_CONSTITUTIONAL_SCOPE_EXPANSION
-> AUTHENTICATE_RECOVERY_ACTORS
-> EVALUATE_IDENTITY_TRUST
-> EVALUATE_MEMBERSHIP_GENERATION
-> EVALUATE_BYZANTINE_QUORUM
-> COMPUTE_FAILURE-DOMAIN/COLLUSION CLOSURE
-> CHECK_ROOT_CURRENTNESS
-> ESTABLISH_PROTECTED_ORDER
-> CHECK_PREDECESSOR_CUTOFF
-> VERIFY_EMERGENCY_SCOPE
-> FENCE_PREDECESSOR
-> ACTIVATE_SUCCESSOR ONLY IF CONTRACT SATISFIED
-> REVALIDATE_LATE_EVIDENCE
-> RECONCILE_EXTERNAL_EFFECTS
-> DERIVE_CLAIMS
-> EXPLICIT_RELEASE.

Unresolved identity/quorum/root/order -> AUTHORITY_UNRESOLVED or SAFETY_ONLY.

## New candidate object: GovernanceTrustContext
Binds:
- governance membership
- identity authority
- authentication generation
- root/trust generation
- membership generation
- quorum/fault model
- failure-domain closure
- common-mode dependencies
- ordering domain
- emergency scope
- evidence set
- privacy/minimization contract
- retention residue
- invalidation triggers
- permitted claims.

## New candidate object: GovernanceDecisionCertificate
Binds:
- decision_id
- transition_id
- governance trust context
- membership generation
- quorum evidence
- equivocation status
- root generation
- ordering position
- predecessor cutoff
- emergency scope
- dependency closure
- evidence retention boundary
- permitted claim
- expiry/revalidation.

## New candidate invariants
GOV-01 authentication validity cannot alone establish constitutional authority.
GOV-02 identity-provider compromise invalidates unsupported independence claims.
GOV-03 quorum count cannot substitute for the specified fault/intersection contract.
GOV-04 no-equivocation cannot prove absence of collusion/common-mode compromise.
GOV-05 root rotation invalidates or downgrades dependent currentness when required.
GOV-06 late evidence can invalidate emergency-derived assurance.
GOV-07 emergency scope cannot amplify itself.
GOV-08 privacy deletion cannot silently preserve a stronger claim than the retained residue supports.
GOV-09 audit records are evidence, not authority.
GOV-10 minimized residue cannot claim properties not supported by its provenance contract.
GOV-11 unresolved governance ordering yields AUTHORITY_UNRESOLVED.
GOV-12 human quorum independence is claim-specific.
GOV-13 historical attribution does not imply current authority.
GOV-14 emergency recovery cannot approve its own constitutional currentness.
GOV-15 external effects created during emergency recovery require normal effect identity, fencing, and reconciliation.
GOV-16 recovery snapshot cannot resurrect revoked governance authority.
GOV-17 deletion/compaction is itself a protected transition when it affects future safety claims.
GOV-18 no emergency governance path may create a new trust root unless an explicit preauthorized constitutional succession rule allows it.

## Major conclusion
Emergency governance must be modeled as a bounded authority domain with explicit identity, membership, fault, dependency, privacy, retention, ordering, and succession semantics.

Privacy does not justify keeping every identity-bearing record forever; safety does not justify deleting the only evidence needed for a current claim. The architecture needs claim-specific retention and minimized safety residue, with stronger claims automatically degraded when the residue is insufficient.

The safe constitutional corridor remains:
CONSTITUTIONAL TRUST -> BOUNDED SAFETY -> GOVERNED RECOVERY -> PROTECTED SUCCESSION -> PREDECESSOR CUTOFF -> SUCCESSOR -> REVALIDATION -> EXPLICIT RELEASE.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement. No runtime or fault-injection result.

## Next attack
EMERGENCY GOVERNANCE + PRIVACY RETENTION + KEY COMPROMISE + AUDIT REPLAY + CLOCK/ORDER MANIPULATION + POST-REVOCATION EVIDENCE, targeting whether historical attribution can be preserved without accidentally becoming a backdoor to current authority.
