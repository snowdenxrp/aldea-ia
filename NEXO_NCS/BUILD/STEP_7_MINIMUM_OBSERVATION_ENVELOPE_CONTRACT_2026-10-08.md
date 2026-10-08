# NEXO NCS — STEP 7 MINIMUM OBSERVATION ENVELOPE CONTRACT
Date: 2026-10-08
Status: DESIGN READY — implementation not started

## Evidence integration: MASTER -> AB -> P -> NCS

### MASTER
- Claim-specific provenance must survive compression/reconstruction.
- Models/providers propose; Core governs.
- UNKNOWN is first-class; missing evidence is not negative evidence.
- Admission is distinct from final semantic validation and commit.
- Do not invent identity/queues/retries/tombstones merely to close a design gap.

### AB
- Action+target is not sufficient claim identity.
- WriteSet-only validation is insufficient.
- Target identity and incarnation are distinct when recreation is possible.
- Helper/cache/derived summaries are not authority boundaries.
- Admission success does not establish commit/effect success.
- Historical AB105/TLC/Kafka findings remain frozen evidence and are not reopened here.

### P/P112
- Current production findings are small objects: severity/code plus optional agent/resource/amount/message.
- No current production finding has a structured observation ID or universal evidence object.
- Visual/render and time/sample observations are not automatically reproducible from canonical state.
- Aggregate findings require dependency closure, not just the final scalar.
- SPECIALIST_ERRORS is a derived meta-finding and cannot replace its underlying specialist dependencies.
- Current mission persistence drops code/source/reason/evidence; action reconstruction is therefore not claim reconstruction.

## NCS minimum semantic contract

The first implementation should introduce only two planning-boundary concepts:

### ObservationEnvelope
Represents the producer-side observation/proposal before mission admission.

Minimum semantic content, preserving fields when actually supplied by the producer:
- source: producer identity/provenance;
- code: finding/observation class;
- severity: retained as policy input only when policy actually uses it;
- target: affected agent/resource/other target identity when supplied;
- targetIncarnation: only when the observation source actually supplies it;
- inputs: the causal observation values that established the finding;
- freshness: observation/sample/version context when actually supplied;
- derivedProvenance: dependency information when the finding is derived from other observations/findings;
- proposedAction: action/payload selected by the producer when present;
- explanatory: message/reason/UI text, explicitly non-authoritative unless a later policy contract promotes it;
- existingIdentity: preserve an existing producer/run/sample identity only if one actually exists.

The envelope does NOT manufacture an observation ID when none exists.

### MissionCandidate
Represents a planning candidate created from an ObservationEnvelope.

Minimum semantic content:
- the ObservationEnvelope itself or a loss-preserving reference to every field needed to reconstruct it;
- the candidate claim/action derived from the observation;
- explicit admission state: ADMITTED or NOT_ADMITTED when the planner has sufficient evidence to classify it;
- UNKNOWN when the information required to classify admission is insufficient;
- admission-relevant dependency/provenance retained rather than replaced by action+target.

NOT_ADMITTED means only that the candidate did not enter the bounded admitted mission set. It does not mean FAILED, RESOLVED, COMMITTED, or RETRIED.

## ClaimEnvelope boundary

MissionCandidate is not itself the protected claim.

When a candidate proceeds toward protected transition, Core constructs the existing ClaimEnvelope from the claim-specific causal/provenance information that actually supports the protected claim.

Therefore:

ObservationEnvelope -> MissionCandidate -> ClaimEnvelope

No planning object receives authorization or commit authority from this conversion.

## Dedupe rule

Existing action+target dedupe in buildNexoMission() is not sufficient to establish observational equivalence.

The implementation may compress two observations only when the claim-critical causal dimensions relevant to the candidate are established equivalent. If equivalence cannot be established from available evidence, the observations must not be silently treated as the same claim.

This contract does not define a new observation ID, queue, tombstone, retry, or continuation mechanism to solve collisions.

## Finding-class mapping

The minimum causal inputs identified by P/P112 are:

- Visual: target + finding code + render predicate(s) + producer provenance + observation boundary/freshness when relevant.
- Explorer: target + exploration predicates + relevant observation boundary + producer provenance.
- Behavior: population/sample boundary + current activity values or equivalent dependency closure + producer provenance.
- Routine: target + active sequence + missing phase predicate + producer provenance.
- Ecosystem: resource identity + observed amount + observation boundary/version when relevant + producer provenance.
- Society: population membership + social values/dependency closure + aggregate computation provenance + producer provenance.
- Audit/meta finding: underlying specialist findings/dependencies; the meta-message alone is insufficient.

These are evidence classifications, not a command to persist every report field.

## Missing provenance semantics

If a field is claim-critical for a candidate but is unavailable, the planner must not fabricate it.

Whether that absence causes UNKNOWN versus rejection as an invalid candidate depends on the concrete claim/admission contract. STEP 7 does not silently decide this for every finding class.

This keeps the distinction:
- absent evidence != false predicate;
- absent identity != invented identity;
- missing claim provenance != successful reconstruction.

## Non-bypass invariants
1. Provider/assistant cannot authorize or commit.
2. ObservationEnvelope cannot mutate canonical state.
3. MissionCandidate cannot final-validate or commit.
4. Dedupe cannot erase claim-critical provenance.
5. NOT_ADMITTED cannot become FAILED/RESOLVED by implication.
6. UNKNOWN cannot become PASS through planning.
7. Audit/meta findings cannot erase their underlying dependency closure.
8. Global revision cannot substitute for claim-specific observation provenance.
9. No fabricated observation identity.
10. Structural conflict => STOP and redesign.

## Implementation boundary

Before implementation, tests must establish only the semantic guarantees above. The implementation must remain a loss-preserving boundary adapter, not a new durable observation ledger.

If the tests cannot express the contract without inventing an identity lifecycle, queue, retry, tombstone, transaction wrapper, or legacy compatibility path, STOP.

## Remaining UNKNOWN/PENDING
- Exact concrete shape of each producer causal inputs must be implemented from current source without guessing.
- Exact rule for when missing producer provenance yields UNKNOWN vs INVALID remains claim-specific.
- Producer trust semantics remain open.
- Durable raw observation recovery remains unproven.
- No external-effect semantics are introduced.

## Why evidence is sufficient to proceed
MASTER, AB and P/P112 converge on the same minimum boundary: preserve causal provenance across observation -> mission planning without promoting proposals to authority and without inventing an identity mechanism. The remaining uncertainty is deliberately isolated to claim-specific input shapes and admission classification, so the next implementation can be minimal and testable without guessing beyond the evidence.