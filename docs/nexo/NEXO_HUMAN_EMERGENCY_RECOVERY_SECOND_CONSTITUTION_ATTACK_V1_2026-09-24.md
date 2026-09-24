# NEXO HUMAN EMERGENCY RECOVERY SECOND CONSTITUTION ATTACK V1 — 2026-09-24

## Status
RESEARCH ONLY. NO V21 IMPLEMENTATION. NO CORRECTNESS CLAIM.

## Target
Attack coexistence of normal constitutional authority, machine recovery, human emergency recovery, and preauthorized safety authority under partition, common-mode compromise, Byzantine evidence, root succession, and late evidence.

Core property:
NO_EMERGENCY_PATH_MAY_AMPLIFY_ITSELF_INTO_UNPREAUTHORIZED_CONSTITUTIONAL_AUTHORITY.

## External cross-check
TLA+ models concurrent/distributed systems as state machines with initial and next-state relations and supports checking invariants over model behaviors. Refinement mappings relate lower-level behavior to higher-level specifications. Byzantine consensus research likewise distinguishes safety from liveness and makes assumptions such as fault model and synchrony explicit. These sources inform the verification boundary; they do not prove this architecture.
Sources:
- https://lamport.azurewebsites.net/tla/high-level-view.html
- https://lamport.azurewebsites.net/tla/proving-safety.pdf
- https://lamport.azurewebsites.net/tla/byzpaxos.html
- https://arxiv.org/abs/1803.05069

## Core distinction
EMERGENCY_SAFETY_AUTHORITY != CONSTITUTIONAL_AUTHORITY.
HUMAN_RECOVERY_CREDENTIAL != CURRENT_CONSTITUTIONAL_AUTHORITY.
MACHINE_RECOVERY_CREDENTIAL != CURRENT_CONSTITUTIONAL_AUTHORITY.
PREAUTHORIZED_SCOPE != UNBOUNDED_SCOPE.
RECOVERY_PROGRESS != RECOVERY_AUTHORITY.
EMERGENCY_ACTION != AUTHORITY_SUCCESSION.
SAFETY_CONTAINMENT != GOVERNANCE_REDEFINITION.

## Threat model
Normal constitutional ordering is unavailable or partitioned.
Machine recovery path A is available.
Human emergency path H is available.
A preauthorized safety root permits STOP, fencing, evidence preservation, reconciliation, and bounded containment.
A common dependency may be compromised.
A late Byzantine statement arrives.
Root R0 may be revoked or rotated.
Two recovery candidates may exist.

The dangerous architecture is one where H can say "the machine constitution is unavailable, therefore I am now the constitution."

That creates a second constitution and an authority-amplification path.

## Emergency Safety Envelope
Candidate object: SafetyCapabilityEnvelope.

It may authorize only explicitly predeclared operations such as:
- maintain STOP
- activate resource-side fences
- reject protected effects
- preserve durable evidence
- reconcile external effects
- quarantine
- isolate compromised components
- maintain already-authorized containment
- prepare a succession proposal
- preserve constitutional transition evidence.

It must not automatically authorize:
- redefining constitutional rules
- changing membership rules
- inventing a new root
- widening protected scope
- granting unrestricted mission authority
- declaring itself current constitutional authority
- approving its own successor
- rewriting historical ordering.

Invariant:
SAFETY_CAPABILITY_SCOPE <= PREAUTHORIZED_SAFETY_SCOPE.

## HumanRecoveryAuthorization
Candidate object:
- authorization_id
- issuer/governance root
- human identity
- authentication context
- emergency rule
- permitted scope
- affected resources
- permitted transitions
- duration/expiry
- ordering position
- predecessor authority state
- required witnesses/quorum
- common-mode dependency closure
- audit/evidence requirements
- revocation/invalidation triggers
- succession restrictions.

Human identity is authentication evidence, not by itself constitutional authority.

## Human recovery modes
H0 observation only
H1 safety containment
H2 recovery proposal
H3 authorized recovery transition
H4 constitutional succession authority only if the constitution explicitly grants this path and its transition rules are satisfied.

H4 must not be inferred from H1-H3.

## The second-constitution attack
Suppose constitutional anchor A is unavailable.
Human H activates a safety credential.
H uses that credential to change membership.
The changed membership then validates H.
H uses the new membership to validate a new root.
The new root validates H's original action.

This is circular authority amplification.

Rule:
CURRENTNESS_CANNOT_BE_ESTABLISHED_SOLELY_BY_A_TRANSITIVE_CHAIN_DERIVED_FROM_THE_CANDIDATE_CURRENTNESS.

The emergency path needs an external/rooted succession rule whose validity does not depend on the result it is authorizing.

## Machine + human split-brain
Machine recovery M chooses successor S1.
Human recovery H chooses S2.
Both are individually legitimate under their local emergency rules.

If no protected ordering domain can establish dominance:
AUTHORITY_UNRESOLVED.

Human status does not provide an automatic tie-break.
Machine status does not provide an automatic tie-break.

The resolution must come from the predeclared governance/recovery contract or remain unresolved.

## Human quorum
A human quorum is not automatically independent.

Members can share:
- organization
- identity provider
- communication channel
- administrator
- legal/governance root
- device fleet
- recovery infrastructure
- common-mode compromised evidence.

Therefore:
HUMAN_QUORUM_COUNT != INDEPENDENT_GOVERNANCE_ASSURANCE.

Candidate HumanRecoveryQuorumContract must define membership, independence/failure domains, conflict rules, succession scope, emergency powers, and transition ordering.

## Late evidence attack
After H authorizes containment, evidence arrives showing:
- the predecessor had already been cut off;
- the human credential was revoked;
- root R0 was compromised;
- a provider continuation was active;
- membership M1 had already superseded M0.

Late evidence is not automatically invalid because it is late.

Required:
LATE_EVIDENCE -> AUTHENTICATE -> CONTEXT_BIND -> ORDER -> IMPACT_ANALYSIS -> INVALIDATE/DOWNGRADE/FENCE -> RECOMPUTE_CLAIMS.

The emergency authority must itself be subject to invalidation if its foundation is later disproven.

## Break-glass is an effect path
Break-glass credentials, emergency config, update/bootstrap artifacts, recovery keys and operator commands are themselves effect-capable paths.

Therefore:
BREAK_GLASS != OUTSIDE_THE_MODEL.

They belong to effect-path closure and common-mode analysis.

## Root compromise during human recovery
If the root authorizing H is compromised:
- historical actions may remain historically attributable;
- current authority may be revoked;
- descendant capabilities may require invalidation;
- current assurance may degrade;
- external effects require reconciliation.

Signature validity does not preserve current authority after trust compromise.

## Human override and safety-only
Human recovery can safely preserve:
STOP
FENCE
QUARANTINE
EVIDENCE
RECONCILIATION
PREAUTHORIZED_CONTAINMENT

It cannot use safety powers to create new constitutional powers unless the constitution explicitly contains that transition and its independent conditions are met.

## Candidate EmergencyAuthorityEnvelope
Fields:
- envelope_id
- constitutional_parent
- emergency_mode
- scope
- allowed_actions
- forbidden_actions
- root/trust context
- membership context
- authority epoch
- emergency epoch
- ordering domain
- expiry
- common-mode closure
- evidence dependencies
- successor restrictions
- revocation triggers
- resource/effect boundaries
- permitted claim class.

## Candidate AuthorityAmplificationGuard
Reject any transition where:
1. the acting emergency authority's permitted scope expands;
2. the expansion is justified only by state produced under that same emergency authority;
3. no independent constitutional transition authorizes the expansion.

Form:
EMERGENCY_SCOPE(t+1) > EMERGENCY_SCOPE(t)
AND justification_depends_on_emergency_output
AND no_external_succession_authority
-> DENY.

## Crash and restart
Human recovery process crash:
- progress/checkpoints survive only as evidence;
- restart does not preserve authority;
- reauthentication/revalidation is required;
- stale emergency envelopes are fenced.

Machine recovery crash follows the same rule.

Snapshot restore cannot resurrect a revoked emergency authority.

## Common-mode compromise
If human and machine recovery both depend on the same identity provider, KMS, policy store, update source, or operator, their apparent independence can disappear.

Therefore:
HUMAN_RECOVERY + MACHINE_RECOVERY != INDEPENDENT_RECOVERY
unless their relevant failure-domain closure proves independence for the claim.

## Concurrent root succession
Human emergency authority may prepare a successor while machine recovery prepares another.

Neither can self-declare current.
The transition requires:
- protected ordering
- uniqueness rule
- predecessor cutoff
- membership/current trust validation
- dependency closure
- fencing
- enforcement verification
- external reconciliation
- explicit publication.

## Safe emergency protocol
AUTHORITY_DEGRADED
-> ENTER_BOUNDED_SAFETY
-> FREEZE_NEW_CONSTITUTIONAL_TRANSITIONS
-> PRESERVE_EVIDENCE
-> CLOSE_EMERGENCY_EFFECT_PATHS
-> AUTHENTICATE_RECOVERY_ACTORS
-> VALIDATE_EMERGENCY_SCOPE
-> DETECT_CONFLICTING_RECOVERY_CANDIDATES
-> ESTABLISH_PROTECTED_ORDER
-> VALIDATE_SUCCESSION_RULE
-> FENCE_PREDECESSOR
-> ACTIVATE_SUCCESSOR_IF_UNIQUE
-> REVALIDATE_EMERGENCY_ARTIFACTS
-> RECONCILE_EXTERNAL_EFFECTS
-> RECOMPUTE_ASSURANCE
-> EXPLICIT_RELEASE.

If uniqueness cannot be established:
AUTHORITY_UNRESOLVED / SAFETY_ONLY / QUARANTINE.

## Candidate invariants
HR-01 emergency safety authority cannot redefine its own constitutional scope.
HR-02 human authentication does not imply constitutional authority.
HR-03 machine recovery authentication does not imply constitutional authority.
HR-04 emergency containment cannot silently become mission authority.
HR-05 human and machine recovery cannot self-resolve an unordered conflict.
HR-06 emergency powers cannot be amplified through a self-derived chain.
HR-07 break-glass/update/bootstrap paths are included in effect-path closure.
HR-08 late evidence can invalidate or degrade emergency-derived claims.
HR-09 snapshot restore cannot resurrect revoked emergency authority.
HR-10 common-mode dependencies prevent unsupported independence claims.
HR-11 human quorum requires explicit failure-domain/governance semantics.
HR-12 successor uniqueness requires protected ordering and an explicit succession rule.
HR-13 emergency authority cannot approve its own constitutional currentness.
HR-14 safety-only mode cannot create unrestricted authority.
HR-15 recovery progress is not authority.
HR-16 external effects created during emergency recovery remain ordinary protected effects.
HR-17 unresolved constitutional ordering requires bounded safety or quarantine, not local winner selection.
HR-18 emergency authority scope cannot exceed its preauthorized envelope without an independent constitutional transition.

## Major conclusion
The safe design is not to make humans "more powerful" during constitutional failure. It is to make emergency authority intentionally narrow, durable, auditable, and unable to self-amplify.

The constitutional corridor becomes:
NORMAL_CONSTITUTION
-> AUTHORITY_DEGRADED
-> BOUNDED_SAFETY
-> RECOVERY_CANDIDATES
-> GOVERNED_SUCCESSION
-> PREDECESSOR_CUTOFF
-> SUCCESSOR_ACTIVE
-> CONTRACT_REVALIDATION
-> ASSURANCE_RECOMPUTATION
-> EXPLICIT_RELEASE.

No step permits:
EMERGENCY -> NEW_CONSTITUTION
without an independently authorized succession transition.

## Verification boundary
No SANY/TLC/TLAPS execution was performed. No implementation refinement or runtime fault injection is claimed.

## Next attack
HUMAN EMERGENCY AUTHORITY + BYZANTINE HUMAN QUORUM + COMPROMISED IDENTITY PROVIDER + ROOT ROTATION + LATE EVIDENCE + AUDIT/PRIVACY CONSTRAINTS.

Question:
Can the system distinguish a legitimate emergency governance transition from a coordinated or common-mode forged emergency transition without making the emergency path itself an unrestricted constitutional root?
