# NEXO — Parser / Canonicalization / Algorithm Confusion / Downgrade Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/runtime verification claimed.

## 1. Attack objective
Attack the semantic boundary after signature verification: can two components interpret one protected artifact differently while both report successful cryptographic verification?

Core rule:
CRYPTOGRAPHIC VALIDITY != SEMANTIC VALIDITY
SAME BYTES != SAME PARSED OBJECT != SAME AUTHORIZATION MEANING

## 2. External evidence
RFC 8785 explains that hashing/signing require invariant representation and defines canonical JSON so producer and consumer operate on a consistent representation. RFC 6376 treats canonicalization as part of signature verification and requires verifiers to reject unrecognized canonicalization algorithms. W3C WebAuthn requires verification of signed contextual fields such as operation type, challenge, origin, and RP scope.

## 3. Adversarial cases
PC-A Parser differential: different components parse the same serialized artifact differently due to duplicate fields, ambiguous types, malformed-but-tolerated values, Unicode normalization, numeric representations, or extension handling. Reject or quarantine if interpretation is not uniquely determined.
PC-B Canonicalization mismatch: signer uses C1 while verifier reconstructs with C2. No authorization unless the exact profile is bound and compatible.
PC-C Signed/unsigned field confusion: signature covers one representation while downstream code reads a different unbound field. Authoritative verification must bind the exact semantic object.
PC-D Signature wrapping / duplicate object: a valid signed object is embedded beside an attacker-controlled object and another component selects the wrong instance. Require unique object identity/path or explicit binding.
PC-E Algorithm confusion: metadata permits selection of an algorithm/profile different from the authorization contract. Algorithm/profile is security context.
PC-F Version downgrade: older verification profile omits security-relevant context. No downgrade when omitted context can affect authorization.
PC-G Extension confusion: one component ignores an extension while another treats it as security-relevant. Unknown security-relevant extensions cause HOLD/DENY unless contract defines them.
PC-H Numeric/type ambiguity: 1, 1.0, '1', true, null, or oversized integers become equivalent in one layer but distinct in another. Type semantics must be bound.
PC-I Unicode/normalization ambiguity: differing normalization changes identifier equality or policy matching. Security-critical identifier canonicalization must be explicit.
PC-J Parser differential across trust zones: edge normalization changes semantics before Z1 receives the object. Parsing/normalization becomes part of the trust boundary.

## 4. Candidate objects
ParserProfile; CanonicalizationProfile; AlgorithmProfile; VerificationProfile; SemanticObjectIdentity; SignedFieldClosure; SecurityRelevantFieldSet; RepresentationBinding; ProtocolVersionContext; DowngradePolicy; ExtensionHandlingContract; ParserEquivalenceClaim; CanonicalizationCompatibilityClaim; SignatureWrappingGuard.

## 5. Signed semantic closure
Candidate concept: SIGNED_SEMANTIC_CLOSURE = all security-relevant semantic inputs influencing the protected decision whose provenance is bound to the authenticated artifact.
Candidate invariant: SECURITY_DECISION_INPUTS ⊆ SIGNED_OR_PROTECTED_SEMANTIC_CLOSURE, with exceptions only where a protected protocol contract defines trusted external inputs and their binding.

## 6. Representation boundary
RAW_BYTES → PARSE_UNDER_BOUND_PROFILE → CANONICAL_OBJECT → SIGNED_SEMANTIC_CLOSURE → CONTEXT_BINDING → VERSION/ALGORITHM COMPATIBILITY → CURRENT AUTHORITY → EFFECT ADMISSION
A generic parser result is not automatically authoritative.

## 7. Downgrade rule
OLDER_PROFILE_MAY_BE_USED_ONLY_IF_EXPLICIT_COMPATIBILITY_PROOF_PRESERVES_ALL_SECURITY_RELEVANT_SEMANTICS. Otherwise DOWNGRADE → HOLD/DENY.

## 8. Cross-zone rule
Z3/Z4 adapters may transform representations, but a transformation affecting authorization semantics must produce a new protected semantic artifact or explicit transformation certificate.
PARSE != AUTHENTICATE
NORMALIZE != AUTHORIZE
VERIFY_SIGNATURE != VERIFY_MEANING

## 9. Candidate invariants
PC-01 CRYPTOGRAPHIC_VALIDITY_DOES_NOT_IMPLY_SEMANTIC_VALIDITY
PC-02 SAME_BYTES_DO_NOT_IMPLY_SAME_PARSED_OBJECT
PC-03 SECURITY_RELEVANT_CANONICALIZATION_IS_PART_OF_SECURITY_CONTEXT
PC-04 UNBOUND_SECURITY_FIELDS_CANNOT_INFLUENCE_AUTHORIZATION
PC-05 UNKNOWN_SECURITY_RELEVANT_EXTENSION -> HOLD/DENY
PC-06 DUPLICATE/AMBIGUOUS_SECURITY_OBJECT -> HOLD/DENY
PC-07 ALGORITHM_PROFILE_IS_BOUND_TO_AUTHORIZATION_CONTEXT
PC-08 DOWNGRADE_CANNOT_REMOVE_SECURITY_RELEVANT_SEMANTICS
PC-09 PARSER_BOUNDARIES_ARE_TRUST_BOUNDARIES_WHEN_SEMANTICS_CHANGE
PC-10 SIGNED_SEMANTIC_CLOSURE_MUST_COVER_AUTHORIZATION_INPUTS
PC-11 REPRESENTATION_TRANSFORMATION_CANNOT_WIDEN_AUTHORITY
PC-12 VALID_SIGNATURE_ON_ONE_OBJECT_DOES_NOT_AUTHORIZE_A_DIFFERENT_OBJECT_INSTANCE

## 10. Relation to prior research
This extends SYNTACTIC_EQUALITY != CONTEXT_IDENTITY != SEMANTIC_EQUIVALENCE; CONTEXT_PROJECTION_CANNOT_WIDEN_AUTHORITY; and VALID_SIGNATURE_IN_PROTOCOL_A != VALID_AUTHORIZATION_IN_PROTOCOL_B.

## 11. Formalization target
The future model should explicitly represent raw representation, parser/canonicalization profile, semantic object identity, signed field closure, verification profile, algorithm/version, protocol domain, transformation/projection, and current authority context. Adversarial behaviors should include parser disagreement, duplicate-object selection, signed/unsigned substitution, algorithm confusion, downgrade, extension ambiguity, and transformation between trust zones.

## 12. Verification boundary
No SANY/TLC verification. No implementation refinement. No runtime testing. No fault injection. No deployment verification.
Research finding only.