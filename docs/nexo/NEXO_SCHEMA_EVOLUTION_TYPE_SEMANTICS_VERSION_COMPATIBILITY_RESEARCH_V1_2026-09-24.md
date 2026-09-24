# NEXO — Schema Evolution / Type Semantics / Version Compatibility Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No formal/runtime/deployment verification claimed.

## 1. Attack objective
Investigate whether schema evolution, version negotiation, adapters, or apparently backward-compatible fields can silently change authorization semantics.

Core rules:
SCHEMA COMPATIBILITY != AUTHORIZATION COMPATIBILITY
FIELD NAME EQUALITY != FIELD SEMANTIC EQUALITY
PARSE COMPATIBILITY != SECURITY COMPATIBILITY
BACKWARD COMPATIBILITY != SAFE AUTHORITY CONTINUITY

## 2. External evidence
RFC 9368 shows that protocol version compatibility must be explicitly specified and that implementations must not assume compatibility between versions. It also demonstrates that version compatibility can be directional and that version negotiation requires validation to prevent downgrade attacks.
RFC 7696 states that cryptographic algorithm selection or negotiation should be integrity protected because otherwise downgrade attacks can influence algorithm choice. RFC 7507 documents how fallback to older protocol versions can be exploited to weaken security. These standards support treating version negotiation as security state rather than a convenience feature.

## 3. Adversarial cases
SE-A Same field name, changed meaning. Version N defines `scope` as resource scope; N+1 uses it as mission scope. A generic adapter maps the same field name and silently widens authority.
SE-B Optional-to-security-critical evolution. A field absent in old versions becomes security-relevant in a new version. Old representations can no longer be treated as semantically complete.
SE-C Required-to-optional downgrade. A field required for current authorization becomes optional in an older profile. Successful parsing does not prove safe compatibility.
SE-D Enum extension confusion. A new enum value is interpreted by an old verifier as an unknown/default value that has permissive behavior.
SE-E Boolean polarity/default change. Missing or unknown fields receive different defaults across versions, changing admission semantics.
SE-F Numeric unit change. Same field name changes units, precision, range, or overflow behavior. A valid value in one schema has different security meaning in another.
SE-G Identifier type migration. Integer, string, UUID, URI, or normalized identifier representations are treated as interchangeable without a protected equivalence contract.
SE-H Version negotiation outside the signed context. A message is signed, but the negotiated version/profile is supplied separately and can be altered or downgraded.
SE-I Adapter laundering. A compatibility layer converts an older artifact into a newer-looking object and the authoritative verifier cannot determine which security semantics were absent from the source.
SE-J Lossy migration. Migration drops a field, history, generation, dependency, or uncertainty marker but still emits an apparently valid current artifact.
SE-K Split verifier profiles. Edge verifier accepts legacy semantics while Z1 assumes modern semantics, creating cross-zone semantic disagreement.
SE-L Same schema, different policy generation. Structure is unchanged but policy meaning changes. Structural compatibility falsely suggests authorization continuity.
SE-M Capability resurrection after restore. A historical schema/version is restored and interpreted as current because the object parses successfully.
SE-N Version confusion in delegated capability. Parent capability is current but child artifact uses an older schema with weaker scope semantics.
SE-O Migration replay. A valid migration certificate from one generation is replayed after root, membership, policy, resource incarnation, or authority epoch changes.

## 4. Candidate objects
SchemaIdentity; FieldSemanticIdentity; SchemaGeneration; VersionCompatibilityContract; SemanticMigrationContract; LossyMigrationCertificate; DefaultSemanticsContract; EnumCompatibilityContract; UnitSemanticsContract; IdentifierEquivalenceContract; AdapterTransformationContract; ProfileNegotiationContext; MigrationAuthorityBinding.

## 5. Semantic field identity
A security-relevant field should be treated as more than its serialized name. Candidate identity:
FieldSemanticIdentity = name + type + units + domain + default semantics + range + normalization + interpretation + policy role + generation.
Two fields with the same serialized name are not equivalent unless an explicit compatibility claim proves preservation of all security-relevant semantics.

## 6. Compatibility classes
C0 BYTE_COMPATIBLE: representation can be parsed.
C1 STRUCTURALLY_COMPATIBLE: schema structure can be mapped.
C2 SEMANTICALLY_COMPATIBLE: relevant meanings are preserved.
C3 SECURITY_SEMANTICALLY_COMPATIBLE: authorization-relevant meanings and constraints are preserved.
C4 AUTHORITY_CONTINUOUS: current authority can safely continue under the new representation.
Critical rule: C0/C1/C2 never automatically imply C3 or C4.

## 7. Migration rule
A migration that loses security-relevant information cannot silently create a current authorization artifact.
Candidate:
LOSSY_MIGRATION + SECURITY_RELEVANT_LOSS -> HOLD/DENY/REQUIRE_EXPLICIT_REAUTHORIZATION

A migration certificate must bind at least source schema/generation, target schema/generation, transformation identity, semantic preservation claims, lost information, policy/invariant context, authority context, dependency context, and invalidation conditions.

## 8. Version negotiation rule
Negotiated version/profile is part of the protected security context whenever it changes parsing, canonicalization, authorization, cryptographic policy, or effect semantics.
Candidate:
NEGOTIATED_PROFILE != CURRENT_AUTHORIZATION_CONTEXT unless explicitly bound and validated.
Downgrade requires an explicit compatibility proof that preserves every security-relevant semantic property needed by the claim.

## 9. Defaults and unknowns
Security-relevant missing/unknown values must not acquire permissive defaults merely because an older schema used them.
Candidate:
UNKNOWN_SECURITY_SEMANTIC != SAFE_DEFAULT
and
UNSPECIFIED_SECURITY_FIELD -> HOLD/DENY unless the contract explicitly proves a safe interpretation.

## 10. Adapter boundary
Any adapter that changes semantic representation is a security-relevant transformation boundary.
Candidate pipeline:
SOURCE_ARTIFACT → SOURCE_CONTEXT_VALIDATION → TRANSFORMATION_AUTHORIZATION → SEMANTIC_MAPPING → LOSS/UNKNOWN ANALYSIS → TARGET_CONTEXT_BINDING → TARGET_AUTHORITY_REVALIDATION

An adapter cannot manufacture missing authority context from structural similarity.

## 11. Candidate invariants
SE-01 SCHEMA_COMPATIBILITY_DOES_NOT_IMPLY_AUTHORIZATION_COMPATIBILITY
SE-02 FIELD_NAME_EQUALITY_DOES_NOT_IMPLY_FIELD_SEMANTIC_EQUALITY
SE-03 PARSE_COMPATIBILITY_DOES_NOT_IMPLY_SECURITY_COMPATIBILITY
SE-04 BACKWARD_COMPATIBILITY_DOES_NOT_IMPLY_AUTHORITY_CONTINUITY
SE-05 SECURITY_RELEVANT_DEFAULTS_ARE_PART_OF_THE_SECURITY_CONTRACT
SE-06 UNKNOWN_SECURITY_FIELDS_CANNOT_RECEIVE_IMPLICIT_PERMISSIVE_DEFAULTS
SE-07 VERSION_NEGOTIATION_IS_SECURITY_STATE_WHEN_SEMANTICS_CHANGE
SE-08 LOSSY_MIGRATION_CANNOT_CREATE_CURRENT_AUTHORITY_WITHOUT_EXPLICIT_PROOF
SE-09 ADAPTER_TRANSFORMATION_CANNOT_WIDEN_AUTHORITY
SE-10 C0/C1/C2_COMPATIBILITY_CANNOT_PROMOTE_TO_C3/C4_AUTOMATICALLY
SE-11 MIGRATION_CERTIFICATES_ARE_CONTEXT- AND GENERATION-BOUND
SE-12 CURRENT_POLICY/ROOT/MEMBERSHIP CHANGES INVALIDATE RELEVANT MIGRATION ASSURANCE
SE-13 SAME_SCHEMA_WITH_NEW_POLICY_SEMANTICS_IS_NOT_AUTHORITY_CONTINUITY
SE-14 RESTORED_PARSEABLE_ARTIFACT_IS_NOT_RESTORED_CURRENT_AUTHORITY
SE-15 DELEGATED_ARTIFACTS_INHERIT_NO MORE AUTHORITY THAN THEIR CURRENT SEMANTIC CONTRACT

## 12. New synthesis
The previous attack established that representation transformation cannot widen authority. This round shows that schema evolution is itself a transformation graph.
Therefore:
SCHEMA GRAPH + ADAPTER GRAPH + AUTHORITY GRAPH must not be collapsed into one generic compatibility relation.
Compatibility must be claim-specific and directional where necessary.

## 13. Formalization target
Future formal model should represent schema generations, field semantic identities, defaults, enum/range/type semantics, migration transformations, loss sets, version negotiation, policy generation, and authority continuity separately.
Adversarial model should include downgrade, lossy migration, default changes, enum confusion, unit/type changes, adapter laundering, migration replay, and cross-zone verifier disagreement.

## 14. Verification boundary
No SANY/TLC verification. No implementation refinement. No runtime testing. No fault injection. No deployment verification.
Research finding only.