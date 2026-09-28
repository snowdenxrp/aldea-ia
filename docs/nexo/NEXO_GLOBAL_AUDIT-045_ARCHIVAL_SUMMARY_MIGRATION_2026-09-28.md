# GLOBAL-AUDIT-045 — ARCHIVAL SUMMARY COMPOSITION & RECONSTRUCTION MIGRATION

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit only

## Boundary

This audit attacks the semantic boundary left by GLOBAL-AUDIT-044: whether repeated archival-summary transformations and later reconstruction/schema migration can preserve historical meaning rather than merely preserve bytes, hashes, or decodability.

No implementation, V21, formal verification, TLC/TLAPS, or runtime fault-injection was performed in this audit.

## External evidence reviewed

W3C PROV treats versions/revisions as distinct provenance entities and models derivation, generation, usage, invalidation, time and responsibility explicitly. Its semantics also distinguish precise from imprecise derivation. This supports treating a migrated representation as a new derived artifact with explicit provenance rather than silently replacing the historical representation.

Schema-evolution systems demonstrate that syntactic/schema compatibility is a narrower property than preservation of application semantics. Confluent distinguishes backward/forward/full compatibility and explicitly distinguishes non-transitive from transitive compatibility. Incompatible changes require migration rules or separate migration paths. Apache Avro uses schema resolution/defaults when reading older data, which can supply values absent from the historical encoding.

## Attack A — individually acceptable summaries compose unsafely

Let S0 contain distinction d required by future claim C.
T1 produces S1 and records LossSet L1.
T2 is locally acceptable for S1 and records LossSet L2.

Even if T1 and T2 are each acceptable under their local contracts, C can fail if d is not represented in S1 but is still required by T2's claimed reconstruction scope, or if T2's contract reasons over a distinction that T1 already collapsed.

Therefore local soundness is not sufficient for compositional soundness. A composition contract must account for the cumulative loss boundary, not merely validate each adjacent transformation.

Required invariant candidate:
LossSet(S0 -> Sn) must conservatively include every distinction that cannot be reconstructed from Sn under the original claim scope and reconstruction contract.

## Attack B — migration can preserve integrity while changing meaning

A migration M: SummaryV1 -> SummaryV2 may be byte-valid, hash-valid, schema-valid and still change interpretation.

Examples:
- a missing historical field receives a V2 default;
- an old enum/value is mapped into a newer semantic category;
- event-order information is normalized away;
- an old incarnation identifier is replaced by a current resource identifier;
- an old invalidation state is collapsed into a current status;
- an imprecise historical derivation is treated as precise.

The result can pass structural validation while creating a stronger historical claim than V1 supported.

Conclusion: integrity of the migrated artifact does not establish semantic preservation.

## Attack C — adjacent compatibility is not enough

A chain V1 -> V2 -> V3 may have pairwise-compatible transformations while the composed transformation loses a distinction needed by a V1-era claim. This mirrors the distinction in schema-evolution systems between compatibility with the latest version and transitive compatibility across all historical versions.

For Nexo, even transitive schema compatibility would still be insufficient by itself: the required property is claim-relative semantic preservation, including provenance, event ordering, incarnation, invalidation and negative-space/completeness information.

## Attack D — version identity must bind the reconstruction semantics

Historical evidence cannot safely be reconstructed by saying only “SummaryVersion=2”.

Minimum candidate binding:
- SummaryVersion
- DerivationID + DerivationVersion
- exact source artifact/history range
- claim scope
- loss/completeness boundary
- admission linkage
- event-order contract
- resource/incarnation bindings
- dependency closure status
- invalidation/revocation state
- authority/membership/resource epochs where relevant
- reconstruction contract identity
- migration provenance and predecessor identity

If the applicable historical derivation rule is unavailable or its semantics cannot be established, reconstruction must return UNKNOWN rather than silently using the current rule.

## Attack E — migration across epochs

A migration executed after authority/resource/membership rollover may accidentally resolve historical identifiers against current identities. This can create false continuity.

Historical identity must remain bound to its historical incarnation/epoch. A migration may introduce a new representation, but it must not rewrite the historical identity relation without an explicit, evidenced transition contract.

## Attack F — UNKNOWN is itself semantic state

If V1 recorded incomplete provenance, unknown ordering, unresolved dependency closure, or a non-reconstructable loss, V2 must not replace that with an apparently concrete value merely because the new schema requires one.

A default inserted by schema resolution is a representation rule, not evidence that the historical value was that default.

Therefore:
UNKNOWN_V1 -> concrete_V2 requires positive evidence/refinement.
UNKNOWN_V1 -> UNKNOWN_V2 is conservative when the distinction remains unresolved.
LossSet/completeness metadata must survive migration even when the payload schema changes.

## Provisional contract

A migration M is eligible to be treated as semantics-preserving for claim C only if there is an explicit refinement/observational-equivalence argument showing that every distinction observable by C in the source representation is either:
1. preserved in V2, or
2. reconstructible from V2 plus authoritative preserved provenance, with the reconstruction rule bound to the historical source semantics.

Otherwise the result is MIGRATED-BUT-NOT-PROVEN and claims depending on the missing distinction remain UNKNOWN.

## Findings

1. Repeated summary transformations require cumulative loss accounting.
2. Schema compatibility/decodability is not semantic equivalence.
3. Historical derivation/version identity must be immutable provenance, not inferred from the current interpreter.
4. Defaults and normalization can silently strengthen historical meaning.
5. Epoch/incarnation bindings must survive migration.
6. UNKNOWN and completeness boundaries must be first-class migratable state.
7. Integrity-valid migrated artifacts can still be semantically incomplete.

## Epistemic status

FOUND as semantic attack results / candidate contract requirements.
NOT formally proven.
NOT implemented.
No runtime verification performed.

Existing UNKNOWN states remain unchanged, including FutureObs_PAA and P_AA quotient congruence.

## Next attack

GLOBAL-AUDIT-046 should attack whether the proposed cumulative LossSet + reconstruction-contract model itself composes across branching histories, forks/merges, and multiple independently migrated archival summaries, including conflicting migration provenance.

