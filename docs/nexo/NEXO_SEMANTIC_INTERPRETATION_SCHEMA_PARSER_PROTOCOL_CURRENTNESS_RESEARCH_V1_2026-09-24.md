# NEXO — Semantic Interpretation Boundary: Schema, Parser, Canonicalization, Protocol and Constitutional Currentness V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the boundary where two components receive the same signed policy/transition artifact but parse, canonicalize, version, default, or interpret it differently.

## 2. Central finding
A cryptographically valid artifact is not necessarily one semantically identical artifact.

Core chain:
`SIGNATURE_VALIDITY != PARSED_OBJECT_IDENTITY != SEMANTIC_MEANING != AUTHORIZATION_MEANING != CURRENT_AUTHORITY`.

## 3. New object: SemanticInterpretationContext
Candidate fields:
- artifact_id
- artifact_type
- protocol_domain
- protocol_version
- schema_version
- parser_profile
- canonicalization_profile
- algorithm profile
- extension handling
- security-relevant field closure
- defaulting rules
- numeric/string/boolean semantics
- Unicode normalization rules where relevant
- validation profile
- downgrade policy
- source context
- target context
- semantic translation/adapter identity
- dependency/toolchain closure
- policy/invariant generations
- trust/root/order context
- invalidations
- publication status.

## 4. Same bytes, different meaning
A signature authenticates bytes under its cryptographic contract. It does not by itself guarantee that every consumer interprets those bytes identically.

Therefore:
`SAME_BYTES != SAME_PARSED_OBJECT`
and:
`SAME_PARSED_OBJECT != SAME_AUTHORIZATION_MEANING`.

The protocol must bind the representation/interpretation context needed for security decisions.

RFC 8949 illustrates why deterministic encoding is a protocol concern: deterministic CBOR requires explicit encoding restrictions, and its security considerations warn that hostile inputs still need robust decoder handling even when encrypted or signed. citeturn0search3

## 5. Parser differential
Two components can accept the same artifact but disagree on:
- duplicate fields;
- unknown fields;
- extension fields;
- integer range;
- floating-point representation;
- null/absent distinction;
- Unicode normalization;
- map ordering;
- nested structures;
- malformed-but-accepted syntax.

A security decision must not depend on a field whose interpretation differs across the protected path.

## 6. Signed-field closure
Candidate:
`SIGNED_SEMANTIC_CLOSURE`.

All security-relevant inputs to the authorization decision must be either:
- signed/bound;
- protected by the same authoritative state transition;
- or explicitly excluded under a protected policy.

Candidate invariant:
`SECURITY_DECISION_INPUTS ⊆ SIGNED_OR_PROTECTED_SEMANTIC_CLOSURE`.

An unsigned security-relevant default is not harmless metadata.

## 7. Duplicate-field attack
Artifact contains:
field X = allow
field X = deny

Parser A uses first occurrence.
Parser B uses last occurrence.

Cryptographic verification can succeed for both.

The semantic object differs.

Therefore duplicate-field behavior must be deterministic or rejection-based for security-relevant structures.

## 8. Unknown-field attack
P0 understands fields A/B.
P1 introduces security field C.
Old parser ignores C.
New parser enforces C.

An artifact can appear valid to the old parser while lacking the security semantics expected by the new one.

Rule:
`UNKNOWN_SECURITY_FIELD != SAFE_DEFAULT`.

Unknown security-relevant semantics must produce explicit rejection, downgrade, or compatibility proof.

## 9. Canonicalization mismatch
Two representations may serialize the same logical content differently.

If one component signs representation A and another verifies/authorizes representation B without an explicit equivalence contract, the system can have:
`SIGNATURE_VALID != SEMANTIC_IDENTITY`.

Canonicalization must therefore be bound to protocol/security context.

## 10. Algorithm confusion
Artifact may be accepted under algorithm/profile A while another component interprets the declared algorithm as B.

Verification must bind:
- algorithm;
- key usage;
- protocol;
- artifact type;
- signature purpose;
- generation;
- canonicalization.

`VALID_SIGNATURE != VALID_AUTHORIZATION`.

## 11. Downgrade attack
A newer verifier supports P2 and P1.
An attacker forces P1 because P1 is syntactically compatible but semantically weaker.

Compatibility negotiation must treat security-relevant downgrade as a protected transition.

Candidate states:
`NEGOTIATING`
`COMPATIBLE`
`ATTENUATED`
`INCOMPATIBLE`
`UNKNOWN`
`DOWNGRADE_REJECTED`.

## 12. Schema migration
Schema V1 → V2 can be:
- byte compatible;
- structurally compatible;
- semantically compatible;
- security-semantically compatible;
- authority-continuous.

These are different claims.

`SCHEMA_COMPATIBILITY != AUTHORITY_COMPATIBILITY`.

A lossy migration that removes a security distinction cannot preserve current authority without an explicit protected migration contract.

## 13. Adapter/translation boundary
If component A produces P0 and component B consumes P1 through adapter T:
`TRANSLATION_SUCCESS != SEMANTIC_EQUIVALENCE`.

The adapter must specify:
- source semantics;
- target semantics;
- transformations;
- loss set;
- unknown handling;
- security-property preservation;
- scope;
- version;
- dependencies;
- proof/evidence;
- current target authority revalidation.

## 14. Projection cannot widen authority
If a source claim has scope S, a projection to target representation cannot silently produce S' where:
`S' > S`.

Candidate:
`AUTHORITY_NON_AMPLIFICATION_CERTIFICATE`.

Unknown or lost distinctions must propagate conservatively.

## 15. Context projection
A proof/policy/evidence object moved between contexts needs an explicit projection:
`SOURCE_CONTEXT → TARGET_CONTEXT`.

The target context must be verified, and the projection must preserve all security-relevant distinctions for the target claim.

`CONTEXT_PROJECTION_CANNOT_WIDEN_AUTHORITY`.

## 16. Protocol-domain separation
A valid signature in protocol A cannot automatically authorize protocol B.

Bind:
- protocol domain;
- artifact type;
- purpose;
- role;
- key usage;
- semantic version;
- compatibility contract.

This prevents cross-protocol replay.

## 17. Role confusion
The same key can appear in:
- audit;
- recovery;
- execution;
- update;
- governance.

Key possession cannot define role semantics.

Candidate:
`KeyUsageContract`
and
`RoleBindingContext`.

## 18. Policy/parser split-brain
During partition:
component A parses P4 under parser profile X.
component B parses P4 under parser profile Y.

Both may call P4 current.

If X/Y are not proven equivalent for the security claim:
`POLICY_CURRENTNESS = UNKNOWN`.

Do not resolve by majority.

## 19. Protocol upgrade during succession
Danger:
R1 succession uses P3 under protocol V1.
Another branch uses P4 under protocol V2.

The transition must bind protocol version and semantic interpretation context.

A protocol upgrade can be part of constitutional transition if it changes authority meaning.

## 20. Toolchain dependency
Parser/canonicalization implementation can depend on:
- libraries;
- compiler;
- runtime;
- locale;
- Unicode tables;
- crypto provider;
- serialization implementation.

If any can change security-relevant semantics, they belong in the relevant dependency closure.

## 21. Deterministic serialization is necessary but insufficient
Even perfect canonical bytes do not prove:
- correct schema meaning;
- correct field interpretation;
- correct policy generation;
- correct authority;
- currentness;
- effect enforcement.

Therefore:
`CANONICAL_BYTES != CURRENT_AUTHORITY`.

## 22. Recovery and parser context
Restored state may contain an artifact that was valid under parser P1.

Current runtime may use parser P2.

Historical validity survives, but current interpretation must be revalidated.

Never let restore silently inherit old parser semantics as current authority.

## 23. Compaction
Compaction must retain interpretation metadata required to understand historical security decisions:
- protocol;
- schema;
- parser;
- canonicalization;
- algorithm;
- key usage;
- role;
- semantic translation;
- policy/invariant context.

Otherwise a compacted historical authorization can become semantically ambiguous.

## 24. Formal model implications
Future model should represent:
- artifact representations;
- parser profiles;
- canonicalization profiles;
- schema versions;
- protocol versions;
- algorithm profiles;
- role/key usage;
- security field closure;
- adapters/translations;
- downgrade;
- mixed interpretation contexts;
- policy/invariant/root generations;
- compaction/restore.

Candidate invariants:
SIB-01 SIGNATURE_VALIDITY_DOES_NOT_IMPLY_SEMANTIC_IDENTITY
SIB-02 SECURITY_DECISION_INPUTS_ARE_SIGNED_OR_PROTECTED
SIB-03 UNKNOWN_SECURITY_FIELDS_CANNOT_SILENTLY_WIDEN_AUTHORITY
SIB-04 PARSER_PROFILE_IS_CONTEXT_BOUND
SIB-05 CANONICALIZATION_IS_CONTEXT_BOUND
SIB-06 ALGORITHM_AND_KEY_USAGE_ARE_CONTEXT_BOUND
SIB-07 PROTOCOL_DOMAIN_SEPARATES_AUTHORIZATION_MEANING
SIB-08 SCHEMA_COMPATIBILITY_DOES_NOT_IMPLY_AUTHORITY_CONTINUITY
SIB-09 TRANSLATION_CANNOT_AMPLIFY_AUTHORITY
SIB-10 CROSS_PROTOCOL_REPLAY_IS_REJECTED
SIB-11 DOWNGRADE_REQUIRES_EXPLICIT_COMPATIBILITY
SIB-12 MIXED_INTERPRETATION_CONTEXT_BLOCKS_CURRENTNESS
SIB-13 RESTORE_REVALIDATES_CURRENT_INTERPRETATION
SIB-14 COMPACTION_RETAINS_SECURITY-RELEVANT_INTERPRETATION_PROVENANCE
SIB-15 PARSER/TOOLCHAIN_DEPENDENCIES_ENTER_RELEVANT_CLOSURE
SIB-16 CURRENTNESS_REQUIRES_SEMANTIC_CONTEXT_COHERENCE.

Lamport's formal-methods material distinguishes invariants from refinement: a lower-level system needs a refinement mapping to demonstrate that its behavior implements the higher-level specification, rather than merely sharing names or data structures. citeturn0search36turn0search6

## 25. New synthesis
The constitutional currentness context must include not only state versions but the semantics by which state is interpreted.

Therefore:
`CURRENTNESS = f(state, authority, ordering, dependencies, interpretation_context)`.

A cryptographically authentic artifact can still be:
- semantically ambiguous;
- interpreted under the wrong protocol;
- downgraded;
- parsed differently;
- translated lossy;
- stale;
- incompatible with current authority.

## 26. Open gaps
SIB-G1 Formal semantic-interpretation equivalence.
SIB-G2 Parser differential model.
SIB-G3 Canonicalization/refinement contract.
SIB-G4 Schema migration authority continuity.
SIB-G5 Protocol downgrade formalization.
SIB-G6 Toolchain dependency closure.
SIB-G7 Cross-protocol proof reuse.
SIB-G8 Semantic adapter proof.
SIB-G9 Compaction/restore semantic provenance.
SIB-G10 SANY/TLC/TLAPS validation.

## 27. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.