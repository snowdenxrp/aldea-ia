# NEXO AB104.280 — Recovery frontier as a multi-dimensional tuple
Date: 2026-09-26
Status: RESEARCH ONLY — no architecture implementation

## Question
Whether recovery can safely be represented by one revision/sequence number when authority, target state, operation history, evidence/archive coverage, and semantic state can advance independently.

## Findings
1. A single monotonic revision is not generally sufficient to describe coherent recovery across independently versioned domains.
2. etcd explicitly exposes multiple dimensions: global revisions are monotonic; keys also have create revision, modification revision, and per-key version. Compaction removes revisions before the compaction revision. This demonstrates that one global revision does not replace domain-specific state/history metadata. [etcd data model]
3. etcd/raft snapshots carry at least snapshot index, term, and configuration state. Current raft restore rejects obsolete snapshots by committed index and restores both log/state and configuration. This is evidence that recovery state is already multi-dimensional even inside one consensus subsystem: index alone is accompanied by term and configuration. [etcd-io/raft]
4. Raft restart requires persistent HardState, entries, and snapshot; snapshot/log metadata and durable ordering are part of recovery, not a single application-level revision. [etcd-io/raft]
5. Therefore Nexo should treat recovery as a coherence problem among frontiers, not as selection of the largest number.

## Candidate research model (NOT final architecture)
A recovery frontier can be represented conceptually as:
F = (
  authority_root,
  authority_epoch/generation,
  authority_config_digest,
  target_id,
  target_incarnation,
  resource_version/CAS frontier,
  operation_registry/dedupe frontier,
  effect_evidence frontier,
  archive/retention coverage frontier,
  schema/semantic version,
  predecessor/lineage digest
)
The exact fields remain OPEN. This tuple is a research model, not an architecture decision.

## Coherence rule
VALID(component_i) does not imply VALID(join(component_1...component_n)).
Recovery must establish cross-component lineage/coherence and verify that no restored component predates a required authority fence, target incarnation boundary, semantic transition, or evidence-coverage requirement. If frontiers are incomparable, contradictory, or insufficiently covered, recovery must not synthesize executable permission from them; candidate state is RECOVERY_INCOHERENT / UNKNOWN.

## Important distinction
A revision can prove ordering inside its own domain. It cannot by itself prove:
- current authority,
- current target incarnation,
- target-side effect commit,
- complete negative evidence,
- semantic compatibility after schema/policy change,
- archival coverage,
- cross-domain atomicity.

Thus “highest revision wins” is not a valid generic recovery rule.

## Direct prototype relevance
The current prototype evidence already identified:
- effect idempotency key is missionId:stepId;
- local nexoEffectRevision exists;
- effect journal is bounded;
- no demonstrated joint frontier binding authority generation + target incarnation + resource version + operation identity/fingerprint + evidence coverage;
- no demonstrated target-side common linearization point.
These remain prototype observations, not claims about the eventual Nexo architecture.

## Consequences for later architecture research
A future recovery mechanism should separately validate:
A) authority lineage/current fence,
B) target identity/incarnation,
C) resource/version frontier,
D) operation/dedupe history,
E) effect/evidence coverage,
F) archive/retention continuity,
G) schema/semantic compatibility,
then validate the cross-domain relation among them.

## Unresolved
- Exact minimal frontier dimensions.
- Whether some dimensions can be derived from authenticated lineage rather than stored independently.
- Formal partial-order definition and join/incomparability rules.
- Exact UNKNOWN vs CONFLICT classification for mismatched frontiers.
- Implementation and formal verification have NOT been performed.

## Preserved historical constraints
AB50→AB58 residuals remain unchanged:
TERNARY_MATH_GAP=FOUND;
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS;
TERNARY_PAA_COLLISION=UNKNOWN;
EVENTDAG_CLOSURE=PARTIAL;
RECONSTRUCTION=BOUNDED_ONLY;
SEMANTIC_FREEZE=NOT_DECLARED;
FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55's bounded boolean enumeration and AB56 FutureObs_PAA interpreter gap remain unresolved.

## Next exact research step
AB104.281 — investigate partial orders/join semantics for multi-dimensional recovery frontiers and when two frontiers are comparable, mergeable, conflicting, or UNKNOWN.
