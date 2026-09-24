# NEXO — Cross-Protocol Semantic Domain Separation Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No runtime/formal verification claimed.

## 1. Attack target

Investigate whether a cryptographically valid artifact can acquire unintended authority when reused across protocols, roles, verification profiles, generations, or semantic domains.

Core distinction:

SYNTACTIC_EQUALITY != CONTEXT_IDENTITY != SEMANTIC_EQUIVALENCE

And:

VALID_SIGNATURE_IN_PROTOCOL_A != VALID_AUTHORIZATION_IN_PROTOCOL_B

## 2. External evidence

WebAuthn explicitly binds signed assertions to contextual data such as operation type, challenge, origin, and RP ID; its specification states that the operation type helps prevent signature-confusion attacks and requires validation of contextual fields. W3C WebAuthn Level 4 continues to require origin validation. RFC 9421 defines signed HTTP component identifiers, canonicalization rules, and a shared signature context between signer and verifier. RFC 6943 notes that security-relevant canonicalization requires all parties to agree on the same canonical form/algorithm.

These sources support the architectural principle that signature validity alone is insufficient: the verifier must establish the intended semantic/contextual binding.

## 3. Adversarial cases

DP-A same bytes, different protocol meaning.
Payload P is identical in Audit, Recovery, and Execution protocols. A generic verifier accepts one signature over P and downstream code treats validity as portable authorization.

Required result: DENY cross-domain reuse unless an explicit compatibility/composition contract exists.

DP-B same digest, different semantic context.
Two artifacts produce the same referenced digest because the digest covers payload but omits protocol purpose, target scope, policy generation, or artifact type.

Required result: digest equality is not semantic identity.

DP-C same signature, different role.
A key signs an artifact as Auditor; another verifier consumes the same signature as Executor or Recovery Authority.

Required result: key identity does not imply role identity. Usage/role binding is required.

DP-D same key, multiple protocols.
A single signing key is accepted in several protocols with different authorization meanings.

Required result: key reuse must not implicitly transfer authority between protocols. Usage/domain separation must be explicit.

DP-E canonicalization disagreement.
Signer and verifier interpret the same logical object through different canonicalization/parsing rules.

Required result: no security decision from a representation whose canonicalization contract is ambiguous or inconsistent.

DP-F algorithm/version/profile confusion.
An artifact verifies under a technically valid algorithm/profile but is interpreted under a different protocol version or verification profile.

Required result: verification profile is part of security context; downgrade or profile substitution must not silently widen authority.

DP-G audit-to-authority confusion.
Historical audit evidence is mistaken for an authorization artifact.

Required result: provenance/evidence artifacts cannot become authority merely because their signatures verify.

DP-H recovery-to-execution confusion.
Recovery approval or safety evidence is repackaged as ordinary execution authorization.

Required result: protocol-purpose binding and explicit transition are required.

DP-I semantic aliasing.
Two differently named or versioned fields encode values that are treated as equivalent by a generic adapter.

Required result: semantic equivalence is claim-relative and cannot be inferred from field/value similarity.

DP-J replay after context change.
A once-valid artifact is replayed after policy, membership, root, authority epoch, effect identity, or dependency context changes.

Required result: historical validity does not establish current authority.

## 4. Candidate architecture objects

- ProtocolDomainContext
- SemanticBindingContext
- DomainSeparatedDigest
- AuthorizationMeaning
- VerificationProfile
- RoleBindingContext
- KeyUsageContract
- SignaturePurposeBinding
- ArtifactTypeIdentity
- CrossProtocolCompatibilityContract
- SemanticEquivalenceClaim
- ContextProjectionCertificate

These are research candidates, not implementation commitments.

## 5. Candidate security binding

A protected authorization artifact should conceptually bind, as applicable:

protocol/domain
protocol version
artifact type
semantic purpose
canonicalization profile
target/effect identity
scope
authority epoch
policy generation
membership/root generation
dependency context
resource incarnation
ordering domain
transaction/causal context
key usage/role
invalidation context

The exact cryptographic encoding remains open. The architectural requirement is that a verifier cannot silently omit security-relevant context.

## 6. Important boundary

Context projection must not amplify authority.

A projection from a richer artifact/context into a narrower verifier representation is safe only if the projection contract proves that no security-relevant distinction has been discarded for the claim being evaluated.

Candidate rule:

CONTEXT_PROJECTION_CANNOT_WIDEN_AUTHORITY

## 7. Candidate invariants

DP-01 SAME_BYTES_DO_NOT_IMPLY_SAME_AUTHORIZATION_MEANING
DP-02 SAME_SIGNATURE_DOES_NOT_TRANSFER_ACROSS_PROTOCOL_DOMAIN
DP-03 KEY_REUSE_REQUIRES_EXPLICIT_USAGE_SEPARATION
DP-04 VERIFIER_PROFILE_IS_PART_OF_SECURITY_CONTEXT
DP-05 CANONICALIZATION_IS_SECURITY_RELEVANT
DP-06 CROSS_PROTOCOL_REUSE_DENY_BY_DEFAULT
DP-07 SEMANTIC_EQUIVALENCE_IS_CLAIM_RELATIVE
DP-08 CONTEXT_PROJECTION_CANNOT_WIDEN_AUTHORITY
DP-09 DOMAIN_SEPARATION_MUST_SURVIVE_REPLAY_AND_REPACKAGING
DP-10 SAME_DIGEST_PLUS_DIFFERENT_CONTEXT_IS_NOT_AUTOMATICALLY_SAME_OBJECT
DP-11 HISTORICAL_SIGNATURE_VALIDITY_DOES_NOT_CREATE_CURRENT_AUTHORITY
DP-12 AUDIT_OR_RECOVERY_EVIDENCE_CANNOT_BECOME_EXECUTION_AUTHORITY_BY_REPACKAGING

## 8. Proposed verification pipeline

SIGNATURE VERIFICATION
→ CONTEXT BINDING
→ ARTIFACT TYPE/PURPOSE CHECK
→ CANONICALIZATION PROFILE CHECK
→ PROTOCOL/VERSION COMPATIBILITY
→ ROLE/KEY-USAGE CHECK
→ GENERATION COMPATIBILITY
→ TRANSACTION/CAUSAL COMPATIBILITY
→ DEPENDENCY/FAILURE-DOMAIN CLOSURE
→ EXPLICIT COMPOSITION/COMPATIBILITY CONTRACT
→ CURRENT AUTHORITY VALIDATION
→ EFFECT-SPECIFIC ADMISSION

Any missing security-critical context becomes UNKNOWN/HOLD or DENY rather than being inferred.

## 9. Relation to existing architecture

This attack reinforces:

INFORMATION != CAPABILITY != AUTHORITY != EFFECT != EVIDENCE

It also extends the existing semantic identity research:

SYNTACTIC_EQUALITY != CONTEXT_IDENTITY != SEMANTIC_EQUIVALENCE

and the latest historical-signature composition finding:

VALID(A)+VALID(B)+VALID(C) != JOINT_AUTHORIZATION(A,B,C)

A valid cryptographic primitive remains necessary but is not sufficient for semantic authorization.

## 10. Formalization target

The future formal model should represent protocol domain, semantic purpose, verification profile, role/key usage, canonicalization profile, and context projection explicitly enough to express forbidden transitions such as:

VALID(A, domain=X) -> AUTHORIZED(B, domain=Y)

without a protected compatibility/composition transition.

It should also model cross-protocol replay, representation ambiguity, version downgrade, and role confusion as adversarial behaviors.

## 11. Verification boundary

Not verified by SANY/TLC.
Not implementation-refined.
Not runtime-tested.
Not fault-injected.
Not deployment-verified.

This document is a research artifact and preserves the distinction between candidate invariant and verified property.
