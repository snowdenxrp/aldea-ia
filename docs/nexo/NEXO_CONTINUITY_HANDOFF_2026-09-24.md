# NEXO — CONTINUITY HANDOFF / PERSISTENT CONTEXT

Date: 2026-09-24
Status: RESEARCH + CLEAN ARCHITECTURE DESIGN ONLY
Implementation: BLOCKED. No V21. No runtime construction until research, distillation, gap audit and evidence/observability closure gates are complete.

## 1. Non-negotiable sequence
V1–V20 lessons/evidence → research remaining gaps → adversarial review → evidence/observability closure → distillation → clean architecture from zero → formal model → technology selection → implementation → verification/fault injection.
Never patch V20 into the final architecture. Never silently discard historical research or convert an open gap into a guarantee.

## 2. Continuity rule
Work is cumulative: research → analyze → contrast → restructure → verify → save.
Every important result preserves evidence/source, conclusion, limitation, architecture consequence, contract, invariant, threat/failure mode, tests/evidence needed, uncertainty/open status, and closure rationale.
GitHub repository snowdenxrp/aldea-ia is the canonical external backup. Discrepancies between memory/context and GitHub must be investigated and recorded.

## 3. Canonical architecture lineage
A01-A04: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A01_A04_CONTEXT_AUTHORITY_OBJECTS_TRANSITIONS_V1_2026-09-24.md — cae1b010c5c95653308e14450f7158831de60824
A05-A06: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A05_A06_AUTHORITATIVE_STATE_LINEARIZATION_V1_2026-09-24.md — 8b53d4ddaaea7524cbed8db98cd59d8139437ff2
A07-A10: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A07_A10_STOP_RECOVERY_EVIDENCE_DEPENDENCIES_TCB_V1_2026-09-24.md — 3dfbe6d36e04b0906f8d8296bff4894c2b075d56
A11: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A11_FAILURE_INTERLEAVING_ADVERSARIAL_AUDIT_V1_2026-09-24.md — 7ca57559374b02aa5581b4dcefae7f602b1b929e
A12: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A12_FORMAL_BOUNDARY_CANONICAL_MODEL_V1_2026-09-24.md — 13edafd8b5cff5db9e211a02c44a5c029123f402
A13: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A13_TECHNOLOGY_INDEPENDENT_DEPLOYMENT_MAPPING_V1_2026-09-24.md — 875dd9adf29a6ff6a416d7d94f6dfd150fd5c07b
A14: docs/nexo/NEXO_CLEAN_ARCHITECTURE_A14_COMPLETENESS_SELF_AUDIT_V1_2026-09-24.md — 03004d550cee16a0e3bc44a750fb834313a70d05
Boundary/topology: docs/nexo/NEXO_CLEAN_ARCHITECTURE_SYSTEM_BOUNDARY_SEMANTIC_TOPOLOGY_V1_2026-09-24.md — 99a26f57278654ea21ff38ed60fbd168197abf8b

## 4. Clean architecture baseline
Zones: Z0 Trusted Foundation; Z1 Authoritative Safety Core; Z2 Control/Semantic Plane; Z3 Effect/Observation Plane; Z4 External World.
Z2 proposes. Z1 authorizes/adjudicates protected transitions. Z3 executes/observes. Z4 determines external reality.
INFORMATION != CAPABILITY != AUTHORITY != EFFECT != EVIDENCE.

Canonical objects: IdentityContext, AuthorityContext, Operation, EffectBinding, ControlLease/Fence, StopState, RecoveryFence, VersionSet, PolicyBaseline, InvariantBaseline, ExternalEffectIdentity, ExternalEffectState, EvidenceRecord, VerificationClaim, ReconciliationRecord, DecommissionRecord, DurableHistory.
Candidate objects remain OPEN: PrepareCertificate, TransactionContext, ExternalEffectHistory, ResourceIncarnation, ControlCommit/EffectCommit distinction, EffectClass atomicity model, RetryClass, RecoveryProgress, ContinuityAnchor, RecoveryOwnership.

Protected transition contract: TRANSITION_ID, OWNER, AUTHORITY_BASIS, REQUIRED_SCOPE, INPUT_STATE, PRECONDITIONS, READ_SET, WRITE_SET, AFFECTED_OBJECTS, LINEARIZATION_POINT_OR_EQUIVALENT, POSTCONDITIONS, FORBIDDEN_CONCURRENT_TRANSITIONS, DURABILITY_REQUIREMENT, CRASH_SEMANTICS, PARTITION_SEMANTICS, TIMEOUT_SEMANTICS, RETRY/IDEMPOTENCY_SEMANTICS, EVIDENCE_REQUIREMENTS, INVALIDATION_TRIGGERS, RECOVERY_PATH, VERIFICATION_METHOD, TRACEABILITY.

## 5. Authoritative topology
SMALL HYBRID PROTECTED AUTHORITATIVE CORE.
Only safety-relevant authority/fencing/stop/recovery/activation/closure state and exact external-effect identity/state belongs inside unless later proven otherwise.
Planning, model inference, mission decomposition, ordinary memory, embeddings/indexes, analytics, UI, telemetry aggregation, caches, non-authoritative replicas, optimization metrics, ordinary scheduling/simulation remain outside unless proven authority-critical.
P0 safety-critical durable; P1 operationally durable; P2 reconstructable.
Authority-relevant UNKNOWN → HOLD/RESTRICT, REVALIDATE or QUARANTINE.

## 6. Linearization/effect semantics
No universal mechanism assumed.
Abstract stack: protected authoritative ordering → conditional guards → fencing/epochs → durable exact intent → exact effect identity/idempotency → external reconciliation.
NEW ATTEMPT != NEW EFFECT.
Internal linearization does not prove external-world outcome.
Effect states: REQUESTED, ADMITTED, BOUND, PREPARED, FINAL_GATE, LINEARIZED, EXTERNAL_ATTEMPTED, CONFIRMED/REJECTED/UNKNOWN.

## 7. STOP/recovery
STOP: STOP_REQUESTED → STOP_ENFORCING → EXECUTION_BLOCKED/ACTUATION_INTERRUPTED → STOP_VERIFIED → RECONCILIATION_REQUIRED → RECOVERABLE/QUARANTINED.
Local STOP != remote cancellation/reversal.
Recovery starts quarantined and requires current identity, artifact/config integrity, authority, STOP state, recovery fence, reconciliation and explicit release.
Recovery cannot grant itself normal authority; recovery-of-recovery is modeled.

## 8. Evidence/dependencies/TCB
Evidence != truth.
Promotion: UNKNOWN → OBSERVED → AUTHENTICATED → CONTEXT_BOUND → VALIDATED_FOR_PROPERTY → VERIFIED_FOR_CLAIM.
Absence of telemetry != evidence of absence.
Different processes/services/models are not automatically independent; common-mode domains are claim-specific.
TCB is claim-specific and includes relevant trust/identity, authority, protected transition/linearization, STOP, effect identity, evidence validity, version/config integrity, recovery release, and continuity/anti-rollback when required.

## 9. Status and gates
A11 found 0 semantic failures under defined rules; NOT a correctness proof.
A12 formal boundary designed; SANY/TLC not executed.
A13 technology-independent deployment mapping; technology selection blocked.
A14 self-audit complete; no silent gap closure.
G-A14-01..15 remain explicit: protected-store failure semantics; trusted time; migration/schema coexistence; resource exhaustion; provider reconciliation; scalable evidence invalidation; independent observation; TCB compromise response; dispute/override governance; privacy evidence rules; automated traceability; SANY/TLC; implementation refinement; fault injection; long-duration rollover/resource testing.

Status: SUBSTANTIALLY DEFINED / DESIGN BASELINE ESTABLISHED / CORRECTNESS NOT PROVEN / FORMAL CORRECTNESS NOT PROVEN / IMPLEMENTATION CORRECTNESS NOT PROVEN / RUNTIME CORRECTNESS NOT PROVEN / DEPLOYMENT CORRECTNESS NOT PROVEN.

## 10. Research conclusions preserved
CHANGE != LOCAL MUTATION. Safety changes propagate transitively through authority/fence/version → operations/queues/caches/workers → external effect → evidence → claims → release. Incomplete propagation defaults to HOLD/RESTRICT/QUARANTINE/REVALIDATE.
CONTROL ORDER != PROPAGATION ORDER != WORLD ORDER. Revocation semantics must survive crash. Replay must be idempotent, monotonic and generation-aware. Lost external response leaves effect UNKNOWN until reconciliation.
EVENT_TIME, OBSERVATION_TIME and AUTHORITATIVE_ORDER are distinct. Wall-clock is evidence context, not serialization.
HISTORY != AUTHORITY; RESTORATION != REAUTHORIZATION; AUTHENTIC SNAPSHOT != CURRENT SNAPSHOT; NUMERIC MONOTONICITY != SEMANTIC CONTINUITY; SIGNED != FRESH.
Token issuance != token enforcement. Resource must reject stale actors. Resource incarnation/continuity matters.
External commit can precede local recording. Restored local history must not override newer external evidence. Mixed-generation state is not coherent current context.
A second crash during recovery is first-class. RecoveryProgress != RecoveryAuthority. Resource replacement creates a new incarnation. Safe non-convergence (HOLD/QUARANTINE) is preferable to unsafe convergence based on stale/mixed-generation evidence.

Cross-resource atomicity: CONTROL_ATOMICITY != COORDINATION_ATOMICITY != EFFECT_ATOMICITY != OBSERVATION_ATOMICITY. PREPARED != COMMITTED != EXTERNAL_ATTEMPTED != EXTERNAL_CONFIRMED. Partial commit is explicit reconciliation/compensation state. Compensation is a new protected effect. Idempotency does not create cross-resource atomicity. Unknown participant outcome remains UNKNOWN. Footprint cannot silently expand. Replacement requires new resource incarnation. Partition != STOP. Provider acknowledgement is evidence, not automatic world truth. Cross-domain ordering may be UNKNOWN_ORDER.

Protocol families OPEN: A strong distributed atomicity; B saga/compensation; C hybrid local atomicity + fencing + stable effect identity + reconciliation; D resource-specific protocol. No selection.

## 11. Persistent resume point
Earlier recovery/effect research remains preserved. Do not implement. Do not construct V21. Maintain DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED.

## 12. AB104.186 — VersionSet concrete candidates
AB104.185 established: global stateRevision is strongest/simple but coarse; subsystem versions improve concurrency but require dependency closure; explicit ReadSet + WriteSet + DependencySet versions/incarnations are the minimum semantically precise candidate if the dependency graph is complete.

Concrete research candidates:
- drink: W={agent hydration/need, water/resource}; D={water quality/availability, ecosystem pressure}; V={agent + water/resource + dependency versions}.
- eat_plant: W={agent hunger, plant/resource}; D={ecosystem pressure/biodiversity}; V={agent + plant/resource + ecosystem dependencies}.
- catch_fish: W={agent inventory/energy, fish}; D={ecosystem/fish availability}; V={agent + fish + ecosystem dependencies}.
- gather_wood: W={agent inventory/energy/tool, wood}; D={ecosystem/resource pressure}; V={agent + wood + ecosystem dependencies}.
- gather_stone: W={agent inventory/energy/tool, stone where mutated}; D={ecosystem stone-pressure calculation if consulted}; V={agent + stone/ecosystem dependencies}.
- farm: W={agent inventory/energy/farm assignment, farm/land}; D={soil/fertility/ecosystem pressure, settlement/technology conditions}; V={agent + farm/land + relevant dependencies}.
- harvest: W={farm food, agent inventory/needs}; D={farm state and specialization/technology inputs if consulted}; V={farm + agent + relevant dependencies}.
- trade: W={buyer/seller inventories, balances, relationships, economy history}; D={institution/governance thresholds and price state}; V={both agents + economy + relationship/institution dependencies}.
- commons contribution/withdrawal: W={agent inventory/hunger/activity, commons/institution histories}; D={institution/governance state}; V={agent + institution/commons + governance dependencies}.
- repairs: field-specific W; D must include every semantic writer capable of invalidating the repaired invariant before commit. Generic repair cannot safely claim a narrow VersionSet without field-specific contracts.

Key result: direct write-set can be local while dependency closure is wider. VersionSet must be declared before execution, captured from authoritative state, validated at final commit, and rejected if a protected version/incarnation changed. Global stateRevision remains a possible coarse fallback only.

AB104.186 is research only. No implementation/V21/formal verification/CI PASS claim.

## EXACT NEXT ACTION
AB104.187: adversarially test these VersionSets for write-skew and hidden semantic dependencies, especially trade↔institution, farm↔ecosystem, repair↔society, and research/technology/governance feedback loops. Determine whether DependencySet can be static or must be dynamically recorded from authoritative reads.

## 13. AB104.600 — SANY gate + VersionSet adversarial dependency audit

SANY evidence gate completed remotely on 2026-09-27 for the byte-correct AB104.596 TLA+ artifact.
- GitHub Actions run: 36348601604
- job: 108702709826 (sany)
- conclusion: SUCCESS
- exact pinned tla2tools.jar SHA-256: ab323b79802aedc3203b3f9af37c6aca3ed43f4e0225b36f2aa77b26de46c05f
- Java: Temurin 21.0.12+1
- SANY output: parsing, semantic processing, linting completed with no error reported.
- artifact: nexo-ab104-598-sany-evidence, artifact ID 10941820379, zip SHA-256 a5c03c078434fffbbada646c4e0c59a882c81c683f353a36a7de12042903e437
- This is SYNTAX/SEMANTIC PARSE evidence only. It is NOT TLC model checking and NOT formal correctness.

AB104.600 research commit: 3a1e7c87d35a2647b4d20c9b0d43bae860346938
Research result:
- Direct WriteSet is insufficient for semantic invariants.
- Static DependencySet is safe only if its closure is proven conservative and complete.
- Where static closure is incomplete, authority-relevant reads must be dynamically captured from the authoritative path.
- Predicate/range/aggregate dependencies must be representable or conservatively widened.
- The executed access path/instrumentation is part of the proof surface; real PostgreSQL SSI scan-path issues demonstrate that missing conflict registration can defeat an intended serializability mechanism.
- Dynamic capture must be provenance/version/incarnation bound and validated at the final gate; uninstrumented or non-authoritative reads cannot silently enlarge authority.
- Nexo adversarial targets: trade↔institution, farm↔ecosystem, repair↔society, research/technology/governance.

Important status correction:
SANY PASS closes only the parser/semantic-analysis gate for the exact artifact. TLC/model-checking remains PENDING. AB104.596's bounded-model limitation remains: it does not model provider-side acceptance followed by resource reincarnation.

## EXACT NEXT ACTION
AB104.601: adversarially audit derived-value/cache/helper-function dependency leakage and define the minimum provenance record required to prove every authority-relevant read entered the final DependencySet. Then run TLC only after the model/CFG/toolchain evidence gate is satisfied.

## 14. AB104.601 — Dependency provenance boundary
Commit: df283fce0078dede83a8022cc468c2096cbda7c3

Key result:
- Dynamic DependencySet capture is necessary where static closure is incomplete, but it does NOT prove completeness by itself.
- Derived values must preserve source dependency provenance; authority-relevant cache hits must bind source version/incarnation, dependency digest and freshness; helpers that read protected state belong inside the trusted capture boundary.
- Aggregates/predicates need predicate/range/aggregate dependency tokens or conservative enclosing versions.
- Uninstrumented authoritative access paths force INCOMPLETE_CAPTURE -> STALE_ADMISSION/HOLD/REVALIDATE.
- The dependency recorder + authoritative access boundary become claim-specific TCB for the dependency-completeness claim.
- PostgreSQL evidence: SERIALIZABLE predicate tracking depends on data actually accessed and query plan; predicate coverage includes ranges, not only returned tuples.

EXACT NEXT ACTION: AB104.602 — adversarially test provenance loss across multi-stage derivation, cache refresh races, speculative reads, external provider observations, and crash/retry between capture and final gate.


## 15. AB104.602 — Adversarial provenance-loss audit
Commit: d7bc056b66e4bec1dbe1df11169e9078258dd204
Research file: docs/nexo/NEXO_AB104_602_PROVENANCE_LOSS_AUDIT_V1_2026-09-27.md

External evidence confirms four important failure classes:
- PostgreSQL SERIALIZABLE tracks dependencies from data actually accessed and access plans; predicate/range coverage matters, and aborted transaction results are not valid evidence. citeturn0search1turn0search0
- Redis documents a concrete invalidation/GET race where a stale response can repopulate cache, plus cache flush requirements after invalidation-channel loss. citeturn1search0
- etcd distinguishes linearizable reads from serializable member-local reads that may be stale. citeturn2search12
- AWS EC2 documents eventual consistency where successful mutations may not yet be visible and NotFound does not prove non-existence. citeturn2search0

Key findings:
1. Multi-stage derivation can erase dependency identity; provenance must survive every authority-relevant derivation/helper edge.
2. Authority-relevant cache entries need source version/incarnation, derivation identity, freshness/expiry and invalidation/reconciliation generation. CACHE_HIT != CURRENT.
3. Lost invalidation delivery forces cache flush/quarantine/revalidation before authority-relevant use.
4. Speculative reads must not silently enlarge DependencySet; if their result influences the decision, dependencies are explicitly promoted.
5. External observations require provider/endpoint identity, resource incarnation, revision/consistency mode, observation time/freshness and operation identity; observation is not automatically world truth.
6. Crash/retry between capture and FINAL_GATE requires durable provenance/generation/version/incarnation/completeness state; missing provenance => fresh admission or HOLD.
7. Final gate must validate provenance/version/incarnation freshness; RECORDED != COMPLETE.
8. Dependency completeness is a claim-specific TCB spanning authoritative access capture, derivation provenance, cache coherence, external observation validation and crash-safe replay.

Open: executable nested-cache/derivation tests, speculative-branch merge tests, provider freshness/incarnation contracts, crash injection across capture→FINAL_GATE. TLC remains PENDING; SANY PASS is only parse/semantic evidence.

## EXACT NEXT ACTION
AB104.603: research executable/code-level mechanisms for provenance propagation and cache-generation/version fencing, then design the smallest adversarial test matrix covering nested derivation, cache invalidation races, speculative reads, provider observations, and crash/retry. Preserve all open gaps; do not implement Nexo/V21.


## 16. AB104.603 — Provenance propagation mechanisms + adversarial matrix
Commit: 819bcf67f4cc1776c9269392f1b6e2f77f0cec24

Research confirms ordinary distributed-context propagation is not authority provenance. W3C Baggage permits mutation and dropping under limits; OpenTelemetry context is designed for causal/telemetry propagation; neither proves DependencySet completeness. Redis provides concrete cache invalidation/generation race defenses but remains a cache mechanism, not Nexo authority fencing. citeturn0search1turn0search2turn0search0

Minimum candidate protected ProvenanceEnvelope: AdmissionID, Generation, ReadID, SourceIdentity, SourceIncarnation, SourceVersion/Revision, DerivationID/Version, ParentDigest, CacheGeneration, Freshness, ConsistencyMode, Completeness, TrustBoundary. Transport may carry a digest/reference; authoritative FINAL_GATE must bind and validate it.

15-test adversarial matrix saved: nested derivation, nested cache, refresh/invalidation race, invalidation-channel loss, speculative discarded/merged branches, stale external observation, incarnation change, crash after capture, partial-provenance retry, helper bypass, cache-of-cache, final-gate mutation, carrier truncation, generation rollback.

Open: these are test designs, not executed tests. TLC remains PENDING; SANY remains parser/semantic evidence only.

## EXACT NEXT ACTION
AB104.604: map the matrix to real code mechanisms: transactional outbox, versioned cache keys, CAS/etcd revisions, and OpenTelemetry propagation boundaries; classify each as evidence mechanism vs Nexo-specific protected semantic.


## 17. AB104.604 — Mechanism mapping: evidence vs protected semantics
Commit: 63a1b059b78cf5afd7d922c3ed34f13f0ba11fe9

Mapped real mechanisms. Transactional outbox can atomically persist local state+intent, but downstream delivery may be at-least-once and does not prove external completion. etcd revision/CAS can provide bounded authoritative version evidence inside its consistency domain, but not external fencing. Redis tracking can detect/invalidate stale cache but its invalidation is asynchronous and race-prone; it is not an authority fence. OpenTelemetry Context/Baggage provides propagation/correlation, not authoritative provenance or authorization; Baggage has no built-in integrity guarantee. citeturn0search8turn0search1turn0search0turn0search2

Critical result: no surveyed mechanism closes the whole provenance claim. Each supplies bounded evidence inside its own semantics. Nexo must prevent evidence from being silently upgraded into authority.

## EXACT NEXT ACTION
AB104.605: inspect real implementation/code paths for transactional outbox, etcd CAS/revisions, Redis tracking and OTel propagation; extract concrete failure modes that clean Nexo must forbid/quarantine.


## 18. AB104.605 — Real implementation failure modes
Commit: f6081bb19a06a7265b244c3a8d45a5cec4d4193f

Code/documentation inspection confirms concrete failure classes: transactional outbox gives local DB+outbox atomicity but downstream delivery can duplicate and requires idempotent consumers; Redis documents GET/invalidation races and cache flush on invalidation-channel loss; OTel Baggage has no built-in integrity checks; bounded CAS/revision semantics cannot be promoted into external-world fencing. citeturn0search1turn0search0turn0search5

Failure classes preserved: F1 duplicate delivery, F2 stale cache resurrection, F3 invalidation-channel loss, F4 mutable/untrusted propagation metadata, F5 local atomicity mistaken for global/external atomicity, F6 observation mistaken for current world truth.

Architecture consequence: mechanism evidence must flow through EvidenceRecord → claim-specific validation → protected admission. A successful mechanism call must never directly mint AuthorityContext.

## EXACT NEXT ACTION
AB104.606: research concrete CAS/revision semantics and crash behavior in etcd plus transactional-outbox duplicate/idempotency implementations; formulate executable fault-injection scenarios for F1/F5 and recovery UNKNOWN.


## 19. AB104.606 — CAS/revision + crash semantics
Commit: 842760b531ef02028ae84a1524117dd983129cf4

Research established ten fault-injection scenarios FI-1..FI-10 covering outbox relay crashes/duplicates, consumer ack loss, split dedup/effect transactions, etcd CAS timeout, stale serializable reads, watch-as-authority misuse, revision-only identity, local-CAS/external-effect separation, and retry-with-new-ID after UNKNOWN. etcd provides durable/strictly-serializable KV operations and revision ordering, but serializable reads may be stale and watch is not itself linearizable. Transactional outbox still requires idempotent consumers; an inbox-style atomic dedup marker + side effect closes the check-then-act crash window. citeturn0search3turn0search0turn0search10

Key gates: local commit != delivery != external effect; CAS/revision is scope-bound evidence; retry preserves logical identity until reconciliation; lost acknowledgement => UNKNOWN; stale reads/watch absence cannot authorize; dedup and side effect should share an atomicity boundary where possible.

## EXACT NEXT ACTION
AB104.607: inspect actual etcd transaction APIs/code and outbox/inbox implementations; map compare predicates, revisions, duplicate markers and retry identity into Nexo EvidenceRecords without treating implementation fields as universal semantics.


## 20. AB104.607 — concrete etcd/outbox mapping
Commit: ebd47408e4aad6ff090e76f18027146d825c5db4

Mapped real etcd Txn comparisons (version/create_revision/mod_revision/value) and transaction revision to scoped local evidence, not universal authority. Mapped transactional outbox row -> durable delivery intent, relay -> delivery attempt, consumer dedup -> processed-effect record. AWS reference confirms outbox relay can duplicate and consumers must be idempotent. citeturn0search6turn0search3turn0search0

Fault matrix FI-607-A..J now distinguishes local CAS commit/response ambiguity, outbox crashes, consumer effect/ack crashes, stale reads/watch gaps, local-CAS vs external-effect UNKNOWN, identity-changing retries, and key reincarnation.

Key boundary: etcd succeeded=true proves the transaction branch succeeded inside the etcd consistency domain; it does not prove downstream/provider/world-state mutation or cross-provider atomicity.

EXACT NEXT ACTION: AB104.608 — research etcd response/timeout ambiguity plus restore/incarnation behavior; design executable crash tests separating local CAS COMMITTED/NOT_COMMITTED/UNKNOWN from external-effect UNKNOWN.


## 21. AB104.608 — etcd timeout/restore/incarnation + crash tests
Commit: 39d56769c1542442c1307d790260712edb5e0725

Research confirms snapshot restore creates a new logical etcd cluster and overwrites member/cluster identity; restored keyspace is therefore not automatically the same authority incarnation. etcd recommends revision bumps when watch consumers/local caches exist because restored revisions can confuse observers. citeturn0search7turn0search8 AWS confirms transactional outbox can duplicate downstream delivery and requires idempotent consumers. citeturn0search0turn0search2

Separated UNKNOWN domains: LOCAL_CAS_UNKNOWN versus EXTERNAL_EFFECT_UNKNOWN. Added T608-1..T608-10 executable fault-test designs covering commit-response loss, client crash, stale reads, snapshot restore, revision/watch cache confusion, outbox duplicate, consumer crash, local-CAS/external timeout, new-ID retry, and resource reincarnation. No test is marked verified until executed.

EXACT NEXT ACTION: AB104.609 — inspect exact etcd revision semantics and restore revision-bump behavior; convert T608-1..10 into a minimal runnable fault-injection harness specification, still research/design only.


## 22. AB104.609 — exact etcd revisions + runnable harness design
Commit: bb92fc9c22a05f2aea0984833956b579d68fb328

Verified: Txn comparisons are atomic conjunctions; VERSION/CREATE/MOD/VALUE/lease can be compared; successful modifying Txn increments store revision once and top-level TxnResponse header carries the response revision. etcd STM source uses ModRevision guards. citeturn0search6turn0search2 Snapshot restore creates a new logical cluster/identity; revision bump and mark-compacted are documented defenses for watch/cache consumers. citeturn0search0turn0search3

Conclusion: revision is scoped ordering/version evidence, not global authority identity. Harness H1-H8 now specifies CAS response loss, compare failure, stale read, snapshot restore, outbox duplicate, consumer crash, local-CAS/external-UNKNOWN, and resource reincarnation. No execution claimed.

EXACT NEXT ACTION: AB104.610 — research outbox/inbox atomicity boundaries and concrete idempotent-consumer implementations; derive minimum crash-safe EvidenceRecord without claiming exactly-once.


## 23. AB104.610 — outbox/inbox atomicity + minimum EvidenceRecord
Commit: bcc2a567984aa1ad7f060c30e3bdfde096e50f36

Research: outbox makes source state + publish intent atomic, but relay remains at-least-once and may duplicate; idempotent consumers track processed IDs. A transactional processed-ID/inbox record plus business mutation can establish a strong LOCAL PROCESSING claim within one consumer authority domain. citeturn0search1turn0search0turn0search4 Debezium's outbox router exposes a unique event ID usable for deduplication. citeturn0search3

Minimum EvidenceRecord now binds logical operation/effect, authority + consumer incarnations, admission/generation, contract digest, source event/revision, delivery attempt, processing/dedup state, local commit revision, external provider/resource identity, reconciliation, fault point and provenance digest.

Three claims remain separate: DELIVERY, LOCAL PROCESSING, EXTERNAL EFFECT. Only LOCAL PROCESSING is strengthened by transactional inbox atomicity; EXTERNAL EFFECT still needs provider-specific identity/fencing/reconciliation.

EXACT NEXT ACTION: AB104.611 — concrete inbox uniqueness/concurrency + CDC relay failure semantics; adversarial concurrent duplicate delivery and stale inbox restore.


## 24. AB104.611 — inbox concurrency + CDC replay
Commit: 861e2cb663da894d50238f92e39e9d6c271b9348

Current Microsoft guidance confirms concurrent duplicate delivery cannot be safely handled by read-then-process; a database uniqueness constraint must arbitrate the claim. Dedup marker + business effect should be atomic when possible; external effects need IN_PROGRESS/reconciliation semantics. citeturn0search0 Debezium emits unique outbox event IDs for consumer deduplication. citeturn0search2turn0search12 etcd Txn comparisons are atomic within its authority domain. citeturn0search1

Adversarial A611-1..10 added: concurrent duplicate, post-commit redelivery, marker/external split crash, identity collision, CDC replay/restart, reordering, stale inbox restore, cross-incarnation replay, snapshot rollback, and dedup-store unavailable.

Minimum contract: DedupKey = ConsumerDomainID + ConsumerIncarnation + LogicalEffectID + ContractDigest. CLAIMED != COMPLETED. External completion still requires authoritative provider evidence. Historical dedup state does not silently survive authority reincarnation.

EXACT NEXT ACTION: AB104.612 — CDC ordering/replay + stale snapshot recovery; causal ordering evidence must remain separate from dedup identity.


## 25. AB104.612 — CDC ordering/replay + stale restore
Commit: b7055d011c96b3d1e41fed560d169103cf2925e2

Debezium documents unique event IDs for dedup and aggregate ID as Kafka key for partition ordering; event ID alone is not causal-order evidence. citeturn0search0turn0search9 etcd restore creates a new logical cluster; revision bump + mark-compacted protect old watch/cache consumers, and a watch starting at compacted revision is explicitly canceled. citeturn0search4turn0search3turn0search10

Separated identities: DedupIdentity = ConsumerDomain + ConsumerIncarnation + EffectID + ContractDigest; CausalPosition = SourceDomain + SourceIncarnation + AggregateID + Sequence/Revision + DependencyDigest. Replay safety != causal ordering. Restore invalidates continuity assumptions unless explicit transfer exists.

T612-1..T612-10 added for replay, contract collision, reordered events, CDC restart, source/consumer snapshot restore, compacted watch, revision bump, incarnation mismatch and missing sequence.

EXACT NEXT ACTION: AB104.613 — CDC connector offset/checkpoint durability and crash/replay semantics; determine whether offsets are authoritative progress or only transport-consumer evidence.


## 26. AB104.613 — CDC offset/checkpoint boundary
Commit: fb14fed79df2685729718e2a1327e2a4f7a7ce85

Debezium exposes unique event ID for deduplication, aggregate ID as Kafka key for partition ordering, and connector/source lineage such as transaction/LSN in supported envelopes. citeturn0search0turn0search6

Conclusion: CDC offset/checkpoint is transport/connector progress evidence, not authority proof. OffsetCommitted != EventDelivered != LocalEffectCommitted != ExternalEffectCommitted. Source incarnation must bind position/LSN because restore/reincarnation changes the meaning of a position.

Added C613-1..C613-8 for checkpoint-loss replay, downstream crash, stale offset restore, connector reincarnation, snapshot-to-stream handoff, source restore, partition reordering, and event-ID collision.

EXACT NEXT ACTION: AB104.614 — concrete Kafka Connect offset commit/recovery semantics and Debezium crash windows between record processing, publication and checkpoint persistence.


## 27. AB104.614 — Kafka Connect/Debezium offset crash windows
Commit: 38ac45df4349b0d35edc5bbc0218ddfcd155857f

Kafka Connect documents periodic source-offset commits and possible reprocessing/duplication after failure. citeturn0search3 Debezium Engine explicitly says crash before offset flush can replay already-processed records, bounded by flush interval and batch size. citeturn0search5 KIP-618 can atomically commit source records + offsets to Kafka within its Kafka transaction boundary, but this does not prove downstream external effects. citeturn0search11 Persistent offset stores differ in durability; memory loses offsets on crash. citeturn0search0turn0search2 PostgreSQL CDC also documents stored-offset/replication-slot LSN mismatches, including slot recreation/reset, requiring reconciliation. citeturn0search10

Added F614-1..F614-6 to the fault harness. Core boundary: ConnectorOffsetCommitted = source/transport progress evidence only; never LocalEffectCommitted or ExternalEffectCommitted.

EXACT NEXT ACTION: AB104.615 — exact Kafka Connect EOS source guarantee/transaction boundary and what it can/cannot establish for Nexo.


## 28. AB104.615 — exact Kafka EOS source boundary
Commit: 841b556a06ae7b95382b3e9956fbde6136f73f59

KIP-618 defines source EOS as atomic commit of source records + source offsets inside Kafka transactions plus fencing of older source-task generations. The guarantee requires meaningful source offsets and exact resume capability; Kafka Connect guide confirms EOS source support from 3.3.0. citeturn0search0turn0search1

Nexo boundary: EOS_SOURCE_KAFKA is strong evidence only inside Kafka's authority/transaction domain. It does not prove source-system side effects, downstream business effects, external provider exactly-once, current-world truth after reincarnation, or cross-system atomicity. Zombie fencing is Kafka-domain evidence, not universal Nexo authority fencing.

Added T615-1..T615-6. Conclusion: model EOS as typed/scoped mechanism evidence; Claim Contract must name authority domain + transaction boundary.

EXACT NEXT ACTION: AB104.616 — Kafka transactional fencing/generation semantics and comparison with Nexo AuthorityEpoch/FenceRevision.


## 29. AB104.616 — Kafka fencing/generation vs Nexo authority
Commit: 58addc25ba6ba581dc85c5315fef8d3e4a4323fa

KIP-618: Kafka fencing uses transactional ID + producer epoch; new producer initialization bumps the epoch and fences older producer generations. Connect source EOS additionally uses task generations/config lineage. citeturn0search0turn0search2

Classification: 🟢 Kafka generation fencing as participant-local mechanism evidence; 🔵 producer epoch as possible scoped FenceEpoch; 🔴 treating Kafka epoch as universal Nexo AuthorityEpoch. Kafka fencing does not classify external effects or override Nexo authority revocation.

T616-1..T616-6 added. Exact next action: AB104.617 — Kafka transactional producer recovery/failure semantics and mapping UNKNOWN states to Nexo reconciliation.


## 30. AB104.617 — Kafka transaction recovery / UNKNOWN
Commit: 6c398bdef7376ee747a1cc0a5562761c9c393100

KIP-98: stable TransactionalId + producer epoch fencing + durable transaction recovery lets Kafka resolve incomplete transactions before a recovered producer resumes. Current TransactionCoordinator code also shows coordinator-epoch changes can occur after a transaction marker is appended, producing NOT_COORDINATOR despite durable progress. citeturn0search2turn0search0

Nexo consequence: response/error is not durable outcome. Kafka-domain transaction state must be reconciled from authoritative transaction state; external EffectOutcome remains separate. Stable identity + generation fence + durable state + recovery-before-resume is reusable 🟢, but only scoped to Kafka. T617-1..T617-6 added.

EXACT NEXT ACTION: AB104.618 — Kafka transaction coordinator failover/replication durability and lineage evidence required before trusting recovered Kafka state as Nexo EvidenceRecord input.


## 31. AB104.618 — Kafka coordinator durability/lineage
Commit: f05b2917f045dd426196337202268670f3bcfd2b

Kafka transaction metadata is persisted through the transaction-state log; current source requires successful log write/replication before completing metadata transitions and preserves producer identity/epoch lineage. initTransactions recovers incomplete transactions before reuse. citeturn0search0turn0search1turn0search2

Nexo: recovered Kafka COMMIT/ABORT is strong participant-local EvidenceRecord only after validating domain, transaction-state partition, transactionalId, producerId/epoch, coordinator lineage, observation point, freshness and recovery context. It cannot prove downstream/external effects or erase external UNKNOWN.

T618-1..T618-6 added. EXACT NEXT: AB104.619 — transaction-state replication/configuration and durability failure boundaries (ISR/minISR, unclean election, log loss/recovery), mapped to Nexo confidence + UNKNOWN/QUARANTINE.


## 32. AB104.619 — Kafka replication durability boundaries
Commit: 94db471e56a8e70573aeecde2b015e58adfc7cc1

Kafka: acks=all + min.insync.replicas constrains successful writes to sufficient ISR; Kafka documents RF=3/minISR=2 as a typical majority durability setup. Unclean leader election can select a non-ISR replica and may cause data loss. Kafka 4.x ELR changes leader-selection semantics and must be recorded as part of provenance. citeturn1search0turn1search1turn1search11

Nexo: durability evidence is conditional on replication/election regime. Unclean-election possibility can invalidate automatic trust in historical state; restore/rebuild is a new authority incarnation absent explicit continuity evidence. Added D619-1..D619-6 and T619-1..T619-6.

EXACT NEXT: AB104.620 — transaction-state topic replication/configuration + retention/compaction, and whether transaction outcome evidence can disappear/non-reconstruct; define durable anchoring requirements.


## 33. AB104.620 — Kafka transaction-state retention/reconstructability
Commit: 7a38f41341187bf3055f4991bcf2ecb0d3235381

Kafka transaction metadata is log-backed in the internal transaction-state topic; current APIs expose derived transaction state. citeturn0search3turn0search8

Nexo finding: Kafka's current transaction state is authoritative only within its current trustworthy lineage and is not a permanent historical ledger. Retention/compaction becomes an evidence-lifetime boundary. Missing historical state after retention/restore MUST NOT be interpreted as NOT_COMMITTED; if no independent durable evidence resolves it, outcome stays UNKNOWN.

Added candidate KafkaEvidenceAnchor = cluster incarnation + transaction-state partition + transactionalId + producerId/epoch + state + log position/observation revision + evidence digest + time + recovery generation. Added T620-1..T620-6.

EXACT NEXT: AB104.621 — inspect transaction-state topic source/configuration and exact cleanup/retention behavior to define minimum evidence-retention contract for Kafka-backed Nexo mechanisms.


## 34. AB104.621 — exact __transaction_state cleanup boundary
Commit: 8c6062063b8dbe4732ba443cd6c7ad72932d82ad

Apache Kafka source confirms TransactionStateManager replays transaction state from logStartOffset to logEndOffset and writes tombstones when transactional IDs expire; cached metadata is removed only after successful tombstone append. TransactionCoordinator explicitly configures transaction topic partitions, replication factor, segment bytes and minimum ISR. citeturn0search1turn0search4

Critical distinction: log retention/segment lifecycle bounds historical replay, while transactional-id expiration/tombstoning removes IDs from reconstructed current state. Therefore current API/cache absence is NOT evidence that a transaction never existed or never committed.

Nexo rule: historical claims require independent EvidenceRecord captured before evidence disappears; otherwise missing history => UNKNOWN/QUARANTINE, never NOT_COMMITTED. T621-1..T621-6 added.

EXACT NEXT: AB104.622 — inspect current Kafka transaction.state.log.* configuration/defaults and distinguish evidence-lifetime controls from operational-recovery controls.


## 35. AB104.622 — Kafka transaction.state.log.* evidence lifetime
Commit: a933fed47d3577bff7d880142d35b282d8f81d93

Current Kafka configuration references: transaction.state.log.min.isr controls acknowledgements for transaction-topic writes; transaction.state.log.replication.factor controls replication; transaction.state.log.segment.bytes affects segment/compaction/cache behavior; transactional.id.expiration.ms controls inactivity expiration, and producer IDs may expire earlier when historical writes disappear through retention. citeturn0search1turn0search2turn0search4

Classification: replication/minISR = durability/availability; segment/load/partitions = operational; retention/transactional-ID expiration = evidence lifetime/reconstructability. No single transaction.state.log.* setting provides permanent historical proof.

Nexo contract: claims needing longer retention require independent durable EvidenceRecord plus Kafka configuration fingerprint + authority incarnation. Expired/unreconstructable history => UNKNOWN/QUARANTINE, never NOT_COMMITTED. T622-1..T622-6 added.

EXACT NEXT: AB104.623 — source-level cleanup + producer-ID expiration interaction, then derive minimum EvidenceRetentionDeadline for Nexo.


## 36. AB104.623 — Kafka EvidenceRetentionDeadline
Commit: 9ca29e341f99ec54c3cf9da9b3720fc7030721cf

Current Kafka ProducerConfig/KafkaProducer source confirms transactional.id spans producer sessions and that commit/abort TimeoutException does NOT prove the broker did not receive the request. citeturn0search0turn0search1

Nexo finding: there are separate execution/recovery and metadata/history clocks. Timeout != evidence deletion; evidence deletion != NOT_COMMITTED. Defined candidate EvidenceRetentionDeadline as the earliest deployment-specific loss-of-reconstructability deadline minus safety margin. It must cover every Kafka history needed for the claim. Added T623-1..T623-6.

EXACT NEXT: AB104.624 — transaction timeout/recovery interaction + source-connector EOS offset retention; determine whether the deadline must cover both transaction-state and source-offset histories.


## 37. AB104.624 — Kafka EOS source-offset retention
Commit: e470ceb6d446cd720b3ea2d89f2872c5954f50ab

KIP-618 couples source records + primary source offsets in one Kafka transaction. EOS additionally requires meaningful source offsets and exact external-source resume semantics. Transaction boundaries remain tied to offset commits; batches exceeding transaction timeout require configuration/throughput adjustment. citeturn0search1turn0search2turn0search10

Critical: source progress has three histories: external source position; Kafka transactional source-record+primary-offset history; optional global/mirrored Connect offsets. EOS couples only the Kafka transaction boundary. A mirror can be non-transactional and retried separately. citeturn0search1

Nexo: EvidenceRetentionDeadline must cover the complete claim chain, not only __transaction_state: source lineage + primary offsets + transaction state. Missing/expired source-offset history => UNKNOWN, never NOT_PROCESSED. Added T624-1..T624-6.

EXACT NEXT: AB104.625 — source-offset reset/fencing implementation and alterOffsets crash windows; map administrative offset changes to AuthorityEpoch/AdmissionGeneration.


## 38. AB104.625 — Kafka offset reset/fencing
Commit: ce1f56cd6fbb5dc45ad5992227cbda2a77fff34d

KIP-875: EOS source offset alter/reset first fences prior tasks, then invokes connector alterOffsets and changes primary offsets transactionally. It distinguishes definite Kafka-side success from possible success when offsets are also externally managed. SourceConnector.alterOffsets is explicitly expected to be idempotent because retries can occur after offset-store failures. citeturn0search0turn0search1

Nexo finding: offset reset is an administrative authority transition, not mere metadata editing. Map it to AuthorityEpoch/FenceEpoch/Reconciliation, while external source offset changes remain a separate claim. Added C625-1..C625-6.

EXACT NEXT: AB104.626 — inspect Kafka Connect task-generation/config-topic fencing source code around stop/reset and crash windows; determine whether external alteration can occur without a durable equivalent operation identity.


## 39. AB104.626 — Kafka task-generation/config-topic fencing
Commit: c759cfc30bee65adf62b2ebfc1bd7331ff34e6b9

KIP-875: offset alter/reset is restricted to STOPPED connectors; EOS source reset fences prior tasks before invoking alterOffsets and changing/resetting primary offsets transactionally. KIP-618 scopes source-task transactional identity to group/connector/task. citeturn0search0turn0search1

Finding: config-topic task generation/fencing is participant-local coordination, not universal operation identity. A reset may span Connect config/task generation, Kafka primary offsets, and an external offset authority. Added C626-1..C626-6 and separated ConnectorIncarnation, TaskGeneration, ConfigEpoch, OffsetAuthorityIncarnation, OffsetResetOperationID, KafkaTransactionIdentity, ExternalOffsetAuthorityIdentity, FenceEpoch, ReconciliationState.

EXACT NEXT: AB104.627 — inspect implementation paths for task fencing/rebalance completion and source-offset reset ordering; build source-level crash-window matrix and identify missing durable operation identity.


## 40. AB104.627 — Kafka fencing/reset ordered checkpoints
Commit: 45eb3cb91cba014a6325a880bdd1ed815fd1bb5f

KIP-618 uses ordered config-topic checkpoints for zombie fencing: task-count generation, config-topic end observation, producer creation, and another config-topic end check. KIP-875 adds STOPPED/config-empty preconditions, fencing before alterOffsets, transactional primary-offset mutation, and end-of-offset-topic observation. citeturn0search1turn0search0

Finding: reset is a multi-domain ordered protocol, not one final CAS. Sequence: STOPPED/config-empty → fence-generation → config-topic end observed → alterOffsets → primary offset transaction → offsets-topic end observed. Each checkpoint has independent crash ambiguity. A later checkpoint cannot erase an earlier UNKNOWN. Added C627-1..C627-7.

EXACT NEXT: AB104.628 — inspect exact source code/tests for zombie fencing and reset ordering; determine whether KIP-875 has a durable operation identity or derives only participant-local transactional identity.


## 41. AB104.628 — Kafka fencing implementation identity
Commit: 486d19d8206fcf10dc3a1b3b56571d5066cc2afe

Actual Kafka Connect Worker.java uses Admin.fenceProducers over task transactional IDs (groupId+connector+taskId); task EOS producers use the same task-scoped transactional identity. KIP-875's offset-reset transaction instead uses groupId+connector. citeturn0search1turn0search0

Finding: Kafka exposes participant-local identities, but no durable Nexo-wide ResetOperationID. Successful completion of the fencing future does not itself persist a cross-domain reset operation. Crash after fencing therefore leaves a participant-local fact plus unresolved overall reset outcome. Added C628-1..C628-6.

EXACT NEXT: AB104.629 — research Admin.fenceProducers timeout/failure semantics and producer-epoch evidence; define reconciliation evidence for COMMITTED / NOT_COMMITTED / UNKNOWN fencing.


## 42. AB104.629 — Kafka fence epoch reconciliation
Commit: 8896c5b332db5fb5623597eab879f52ed0010c76

Kafka Admin.fenceProducers bumps producer epoch and recovers incomplete transaction state; the API can expose producer ID/epoch per transactional ID. Current coordinator logic also recognizes retry cases where an epoch bump may have succeeded before its response was lost. citeturn0search0turn0search4

Finding: transport success/failure alone cannot classify fencing. A newer authoritative producer epoch can establish participant-local fencing, but not global Nexo reset completion. Added C629-1..C629-6 and minimum fence evidence fields: cluster incarnation, transactional ID, prior/observed producer ID+epoch, coordinator lineage, FenceOperationID, observation position, recovery generation, evidence digest.

EXACT NEXT: AB104.630 — combine producerId/epoch evidence with transaction-state durability/retention and define minimum reconciliation evidence surviving coordinator migration and cleanup.


## 43. AB104.630 — fence evidence retention/reconciliation
Commit: a7393c92cf9dfd8e4053a47a4735f5ddc2331b91

Kafka exposes producerId/epoch evidence per transactional ID; coordinator persists transaction metadata, but producer IDs/transaction metadata can expire or become unreconstructable. Timeout can itself cause an epoch bump, so ProducerFencedException does not imply a competing writer. citeturn0search0turn0search1turn0search2turn0search3

Finding: higher epoch + valid lineage can prove participant-local fencing; missing/expired history cannot prove NOT_COMMITTED. Fencing becomes UNKNOWN when reconciliation evidence is lost. EvidenceRetentionDeadline must precede the earliest loss of required Kafka lineage, with independent Nexo EvidenceRecord for longer-lived claims. Added C630-1..C630-6.

EXACT NEXT: AB104.631 — reconcile transaction-state retention/expiration with Kafka Connect EOS source-offset retention and close or explicitly preserve remaining EvidenceRetentionDeadline gaps.


## 43. AB104.630 — Kafka fence retention reconciliation
Commit: 45da1cbdb0960f7b0a06fb7e1190c1aadced2192 (note file)

AB104.630 confirms that producer epoch is scoped fencing evidence only while Kafka cluster/coordinator lineage remains reconstructable. After transaction-state cleanup, producer-ID expiration, restore, or incarnation change, absence cannot prove NOT_COMMITTED. Timeout can still coincide with a broker-side epoch bump. EvidenceRetentionDeadline must precede loss of the Kafka history needed to distinguish COMMITTED from UNKNOWN; independent Nexo EvidenceRecord is required for claims that outlive Kafka metadata.

EXACT NEXT: AB104.631 — reconcile this retention boundary with Kafka Connect EOS source-offset history/reset semantics and explicitly close or preserve remaining UNKNOWN gaps.


## 44. AB104.631 — Kafka Connect EOS retention closure
Commit: 77b55b61d30601147df416ccfaeb221c2e991abe

EvidenceRetentionDeadline now spans three histories: external source position/resume evidence; Kafka source-record+primary-offset transaction history; Kafka transaction/coordinator/fencing lineage. If any required history expires before reconciliation, the claim becomes UNKNOWN, not NOT_COMMITTED/NOT_PROCESSED. KIP-618 also requires meaningful source offsets and exact upstream resume semantics; Kafka EOS is not external-source atomicity. citeturn0search0

Universal numeric deadline remains UNKNOWN because it is deployment/connector-specific. Remaining gap: concrete offset-storage implementations and restore/reset behavior.

EXACT NEXT: AB104.632 — research Kafka Connect offset storage (Kafka topic, file, memory, JDBC) plus reset/restore behavior and build the retention/restore claim matrix.


## 45. AB104.632 — Connect offset-storage restore matrix
Commit: 42407aadfe9d78a10524290aef57fffb640b1017

Research mapped Kafka topic, file, memory and backend-specific offset stores. Distributed Connect uses Kafka topics; standalone uses a local file. EOS can use per-connector offsets topics. Storage survival is not automatically historical authority: OffsetExists != SourceEffectCommitted; OffsetMissing != SourceEffectNotProcessed; OffsetRestored != CurrentAuthority. citeturn0search0turn0search2

EXACT NEXT: AB104.633 — research concrete offset-topic compaction/retention plus crash semantics of file/JDBC/custom stores; identify which can provide authoritative historical anchors and which force UNKNOWN.


## 46. AB104.633 — offset storage compaction/crash evidence
Commit: 05619d94fdb5e6ccf2f57a20ff33025a12dae3b7

Current Connect guidance requires distributed offset topics to be replicated and compacted; standalone uses a local offset file. Compaction is not archival proof: current offset != historical commit proof, and absence after compaction cannot establish NOT_COMMITTED. citeturn0search2

Storage classification: Kafka topic = bounded durable anchor; file = bounded anchor if provenance/incarnation survives; memory = no post-crash anchor; JDBC/custom = contract-dependent and UNKNOWN until concrete guarantees are evidenced.

EXACT NEXT: AB104.634 — inspect concrete Kafka Connect FileOffsetBackingStore/KafkaOffsetBackingStore source and exact flush/error crash windows.


## 47. AB104.634 — Connect offset flush crash windows
Commit: 5f9157405e98e103bc74a4829dca1b67fd1ef812

Concrete Connect evidence confirms separate offset-storage paths for regular vs EOS source connectors. Regular periodic flush can leave replay windows; an offset-store callback is not automatically proof of external processing. Distributed Kafka offset topics provide durable bounded recovery, while file storage depends on filesystem survival/provenance. citeturn0search0turn0search1

EXACT NEXT: AB104.635 — inspect exact OffsetBackingStore implementations/callback semantics and derive the minimal durable boundary for Nexo EvidenceRecord.


## 48. AB104.635 — exact OffsetBackingStore boundary
Commit: 2d1add63e50aea459080fe72ac6f505a7b3cbb60

Current Worker source confirms regular source connectors use SourceTaskOffsetCommitter, while exactly-once source support disables that separate periodic committer and uses a connector-specific OffsetBackingStore path. citeturn0search3 The durable Nexo claim begins at the backing store's authoritative persistence boundary, not merely a callback. Regular flush can replay; EOS proves Kafka-domain source-record+offset atomicity only.

EXACT NEXT: AB104.636 — inspect exact OffsetStorageWriter/OffsetBackingStore implementation and callback completion semantics; determine whether read-back is required for durable EvidenceRecord anchoring.


## 49. AB104.636 — offset commit callback durable anchor
Commit: 1583a03597df863b8eb8f67e341b4309ed3a9fbd

KIP-618 confirms EOS source offset commits are anchored by the Kafka transaction; SourceTask.commit/commitRecord callbacks occur after successful offset commit and can be skipped if the process dies afterward. Therefore callback presence/absence cannot be the durable anchor. citeturn0search5 Regular source flush remains a replay boundary. Nexo must anchor EvidenceRecord to the strongest actual storage-domain event, not connector callbacks.

EXACT NEXT: AB104.637 — inspect KafkaOffsetBackingStore/OffsetStorageWriter source for batching, serialization, flush ordering and failure callbacks; map exact crash windows.


## 50. AB104.637 — KafkaOffsetBackingStore + OffsetStorageWriter exact flush semantics
Commit: 0bf0bddc1d8b6a0c911080f3f3dbc4e1d56cbc41
Research file: docs/nexo/NEXO_AB104_637_KAFKA_OFFSET_FLUSH_SEMANTICS_2026-09-27.md

Current Apache Kafka Connect source confirms OffsetStorageWriter is a buffered asynchronous snapshot writer: beginFlush moves the current in-memory map into a flush snapshot and permits newer offsets to accumulate separately; doFlush serializes the snapshot and submits it asynchronously to OffsetBackingStore; currentFlushId suppresses late callbacks from an older/cancelled flush; write errors requeue the snapshot. KafkaOffsetBackingStore.set submits serialized entries through KafkaBasedLog.send and reports completion only after all producer callbacks succeed. KafkaOffsetBackingStore.get explicitly reads to the end before serving values to avoid stale local state. citeturn0search0

Critical Nexo boundary: local callback SUCCESS, timeout, cancellation, or error is not by itself historical Kafka truth. A late backend success can occur after the writer has locally cancelled/requeued the snapshot; therefore timeout/cancel can leave the backend outcome UNKNOWN. Callback completion must not be promoted directly to a durable Nexo EvidenceRecord.

F637-1..F637-8 preserved: pre-flush loss; crash after snapshot; serialization failure; send-before-callback ambiguity; producer callback error; timeout/cancel followed by late success; newer offsets arriving during old flush; compaction/restore erasing historical evidence.

Classification: 🟢 snapshot/async flush + stale-callback suppression; 🔵 explicit Nexo EvidenceRecord binding to Kafka position/incarnation/generation; 🔴 callback/local flush treated as universal durable or external-effect proof.

Status: RESEARCH ONLY. No implementation, no runtime fault injection, no verification claim. TLC remains PENDING.

EXACT NEXT ACTION: AB104.638 — inspect KafkaBasedLog.send()/producer callback and relevant tests/source to map send → broker ack → log visibility → readToEnd, and determine minimum authoritative reconciliation evidence after response loss.


## 51. AB104.638 — KafkaBasedLog send/ack/read-to-end reconciliation boundary
Commit: 3993fc108889449f04c957933ffa8a447d58f59b
Research file: docs/nexo/NEXO_AB104_638_KAFKA_BASED_LOG_RECONCILIATION_2026-09-27.md

Current Apache Kafka Connect source confirms KafkaBasedLog delegates writes to KafkaProducer.send(callback), configures its internal producer with acks=all and max.in.flight.requests.per.connection=1, and implements readToEnd as producer.flush() followed by reading through captured partition end offsets. READ_COMMITTED paths use Admin end-offset evidence conservatively because open transactions may not be visible through ordinary consumer end-offset semantics. citeturn0search0

Key distinction: ProducerCallbackSuccess != ReadToEndObserved != PermanentHistoricalProof. A producer callback establishes a Kafka producer completion boundary; readToEnd establishes current consumer convergence to captured log-end positions; compaction, restore and cluster incarnation still bound historical reconstructability. KAFKA-8586 is preserved as historical evidence that dispatch/success boundaries can be mishandled and must not be conflated. citeturn0search1

F638-1..F638-6 preserved: send/response-loss ambiguity; callback error; callback before local convergence; flush/read-to-end timeout; compaction loss of historical evidence; authority-incarnation change.

Status: RESEARCH ONLY. No implementation or runtime verification. TLC remains PENDING.

EXACT NEXT ACTION: AB104.639 — inspect KafkaProducer send/RecordMetadata/acks and relevant producer tests plus transaction/read-committed semantics to pin exact producer-callback success, timeout, retry and broker-failover meaning.


## 52. AB104.639 — KafkaProducer ACK/timeout/retry semantics
Commit: b93c76b0363b4fe767d348598709a2f1a279e827
Research file: docs/nexo/NEXO_AB104_639_KAFKAPRODUCER_ACK_TIMEOUT_RETRY_2026-09-27.md

Current KafkaProducer source/docs establish that send is asynchronous; the producer buffers records and a background I/O thread transmits them. `acks=all` is the strongest normal acknowledgement condition, and producer retries are bounded by delivery.timeout.ms. A successful callback supplies RecordMetadata including topic/partition/offset, providing strong Kafka-domain evidence scoped to the producer/cluster lineage. citeturn0search0turn0search2

Critical epistemic boundary: timeout/transport failure does not prove NOT_COMMITTED because the request may have reached Kafka before the client learned the result. Producer idempotence protects retries within one producer session, but application-level re-sends are not automatically deduplicated. Therefore UNKNOWN must preserve logical operation identity until authoritative reconciliation; a new application identity is not a safe substitute. citeturn0search2

F639-1..F639-7 preserved: buffered-before-send crash; response loss after transmission; successful RecordMetadata; retriable retry; delivery timeout; broker/leader failover; transactional timeout.

Status: RESEARCH ONLY. No implementation or runtime verification. TLC remains PENDING.

EXACT NEXT ACTION: AB104.640 — inspect producer tests and sender/record-accumulator paths for timeout, retriable errors, duplicate suppression, leader failover and callback ordering; convert F639 into executable adversarial test specifications.


## 53. AB104.640 — Producer Sender/RecordAccumulator adversarial matrix
Commit: 39d227bf1cc190fa9bd7a56d764694fa123fb3b5
Research file: docs/nexo/NEXO_AB104_640_PRODUCER_ADVERSARIAL_TEST_MATRIX_2026-09-27.md

RecordAccumulator source makes deliveryTimeoutMs the upper bound for reporting delivery success/failure and re-enqueues retry batches. For idempotent/transactional batches, producer ID/epoch/sequence lineage is retained specifically because a previous attempt may already have been accepted; changing sequence/identity on retry could create duplicates. Kafka producer config also documents that automatic retries resend the same record and that retries with idempotence disabled plus max.in.flight > 1 can reorder batches. citeturn0search0turn0search2

E640-1..E640-8 added: response-loss/UNKNOWN, retry-induced reorder, idempotent retry lineage, delivery timeout, failover retry, callback ordering, transactional callback vs transaction UNKNOWN, finite close with unresolved requests. Current Kafka issues confirm timeout and shutdown/retry paths are active correctness surfaces, but no Nexo/runtime test has been executed or claimed. citeturn0search3turn0search4

Status: RESEARCH ONLY. No implementation or runtime verification. TLC remains PENDING.

EXACT NEXT ACTION: AB104.641 — inspect concrete KafkaProducer/ProducerFailureHandling/MockClient tests for E640-1..8, classify exact existing coverage vs uncovered fault windows, without claiming execution unless actually run.


## 54. AB104.641 — Kafka producer test coverage audit
Commit: 65260bfd97706825325c8ca422fb778ce8c65bc2
Research file: docs/nexo/NEXO_AB104_641_KAFKA_PRODUCER_TEST_COVERAGE_2026-09-27.md

Current Apache Kafka sources document delivery.timeout.ms as the total bound for success/failure reporting, retry behavior, idempotence constraints, and max.in.flight ordering semantics. Kafka's integration test framework separately validates producer acknowledgements and consumer-observed offsets. citeturn0search0turn0search1turn0search4

Coverage audit: E640-1..8 are mostly mechanism/design covered but require targeted fault execution for Nexo claims. No tests were executed in this step. New E641-1..8 maps response-loss, reorder, idempotent failover, transactional ambiguity, timeout/late acceptance, ACK-vs-read convergence and close-timeout windows.

Important Connect finding: current Worker source configures its regular internal producer with `enable.idempotence=false`, `acks=all`, `max.in.flight.requests.per.connection=1`, and effectively unbounded delivery timeout. Thus regular Connect offset storage cannot inherit modern KafkaProducer default idempotence. citeturn0search5

Status: RESEARCH ONLY. No implementation/runtime verification. TLC remains PENDING.

EXACT NEXT ACTION: AB104.642 — inspect concrete Kafka producer failure-test implementations and MockClient fault-injection APIs, then map E641 cases to exact injected failure points and expected states.


## 55. AB104.642 — concrete Kafka producer fault-test mapping
Commit: df8a09dc75ee6473e0d5af05eb3c08763d77490f
Research file: docs/nexo/NEXO_AB104_642_MOCKCLIENT_FAILURE_MAPPING_2026-09-27.md

Concrete Apache Kafka evidence confirms targeted producer failure tests can be run with Gradle; KafkaProducer remains asynchronous and transactional commit timeout explicitly does not prove failure. A transactional commit timeout can mean the broker-side completion is still progressing, and retrying the same operation is the safe documented path. citeturn0search0turn0search3

E641-1..8 were mapped to exact fault classes: response suppression, first-batch failure before response, max.in.flight reorder, idempotent failover, transactional commit response loss, delivery-timeout/late acceptance, producer-ACK vs consumer lag, and unresolved producer close. No tests were executed.

MockClient/unit tests can prove client state-machine behavior but not broker persistence or cross-process durability; integration/system tests are required for broker/leader failure, response loss and log-visibility claims. Therefore `UNIT_TEST_PASS` and `INTEGRATION_TEST_PASS` remain distinct evidence classes and neither proves Nexo external-effect atomicity or permanent reconstructability.

Status: RESEARCH ONLY. TLC remains PENDING.

EXACT NEXT ACTION: AB104.643 — inspect concrete MockClient APIs and ProducerFailureHandling tests/source to identify exact injectable response/error primitives and build one-to-one E642 fault-point mapping.


## 56. AB104.643 — MockClient / ProducerFailureHandling exact fault-point map
Commit: 6d8761db92234e3bd102e99741db1bf67713ad90
Research file: docs/nexo/NEXO_AB104_643_MOCKCLIENT_EXACT_FAULT_POINTS_2026-09-27.md

Current Apache Kafka repo supports targeted ProducerFailureHandling tests and distinguishes unit from integration/system tests. KafkaProducer exposes testing-visible constructors accepting injected KafkaClient/Sender/RecordAccumulator/TransactionManager, making deterministic client-fault injection possible without claiming broker durability. citeturn0search0turn0search8

E642-1..8 mapped: response injection after ProduceRequest; retriable ProduceResponse; multi-in-flight failure/reorder; broker/leader failure requiring integration; transactional send vs commit response loss; delivery timeout; producer ACK vs consumer/read-to-end lag; close/force-close unresolved sends.

New invariant: `ClientCallbackState MUST NOT mint ExternalEffectOutcome.` Evidence layers remain separate: MockClient/unit → client protocol; integration → Kafka-domain behavior; Kafka reconciliation → authoritative current observation; durable Nexo EvidenceRecord → historical claim.

Status: RESEARCH ONLY. No tests executed, no implementation, no verification claim. TLC remains PENDING.

EXACT NEXT ACTION: AB104.644 — inspect actual ProducerFailureHandlingTest and MockClient source bodies around response injection, retry, timeout and callback assertions; classify direct existing coverage vs required new tests.


## 57. AB104.644 — producer failure-test body evidence boundary
Commit: 2747925127c37c7023b51a7e93dc22a1883d1d5f
Research file: docs/nexo/NEXO_AB104_644_TEST_BODY_EVIDENCE_BOUNDARY_2026-09-27.md

AB104.644 did NOT obtain a directly inspectable current Apache Kafka `ProducerFailureHandlingTest`/`MockClient` body through the available source route. The attempted direct source retrieval/search did not yield the exact current test bodies, so no method-level coverage is claimed and no test is marked executed. This is intentionally preserved as UNKNOWN/PENDING rather than inferred from repository structure or secondary descriptions.

E642-1..8 remain execution-pending. Unit/mock fault injection remains distinct from integration evidence for broker durability, response loss after acceptance, leader failure and log visibility. The evidence labels are explicit: EXACT_TEST_BODY_VERIFIED=NO; TEST_EXECUTED=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO.

Status: RESEARCH ONLY. No implementation, no verification claim. TLC remains PENDING.

EXACT NEXT ACTION: AB104.645 — retrieve the canonical Apache Kafka source snapshot or another direct source route exposing the exact current test bodies; inspect MockClient response/error queue APIs and ProducerFailureHandling assertions line-by-line. Preserve this retrieval gap until direct evidence exists.


## 58. AB104.645 — Kafka test-body retrieval boundary
Commit: aee97bcc6b84c036486f9f60ac3b069f32ddb62a

AB104.645 narrowed but did not close the Kafka producer test-body retrieval gap. Official Apache Kafka Gitiles confirms the repository/current test-running route, including targeted ProducerFailureHandlingTest execution guidance, but direct GitHub connector retrieval of the current ProducerFailureHandlingTest.java path returned 404. No exact current test body, method-level coverage, or execution is claimed.

Evidence labels remain: EXACT_TEST_BODY_VERIFIED=NO; TEST_EXECUTED=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO.

E642-1..E642-8 remain execution-pending. ClientCallbackState MUST NOT mint ExternalEffectOutcome.

EXACT NEXT ACTION: AB104.646 — navigate the official Apache Gitiles commit/tree route to locate the exact current ProducerFailureHandlingTest and MockClient paths by tree navigation or known commit, retrieve source line-by-line, and preserve any path-move/history finding. Do not infer coverage or execution.


## 59. AB104.646 — Gitiles test-path discovery
Commit: 6788f859d098b7fa6b82bd31862bcc996eb45c37

Official Apache Kafka Gitiles confirms the current targeted ProducerFailureHandlingTest route under clients:clients-integration-tests and exposes current repository history. Older history places a same-named test under core, so the path moved over time. Exact current source body was still not retrieved; no method-level coverage or execution is claimed.

Status: EXACT_TEST_BODY_VERIFIED=NO; TEST_EXECUTED=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO.

EXACT NEXT ACTION: AB104.647 — follow the current Gitiles clients/clients-integration-tests tree and commit history to retrieve the exact ProducerFailureHandlingTest source, then locate current MockClient and inspect response/error queue primitives line-by-line.


## 60. AB104.728 — Continuity synchronization / latest research checkpoint
Commit: 6aeb13897cd387d271f05e5cf7194ce1b47201e5

This section intentionally synchronizes the persistent CONTINUITY handoff with the latest research checkpoint so a future `CONTINUITY` does not resume from the older AB104.646 endpoint.

AB104.728 status:
- `SOURCE_CODE_VERIFIED=YES`
- `TEST_SOURCE_VERIFIED=YES`
- `EXHAUSTIVE_TEST_COVERAGE=UNKNOWN`
- `IMPLEMENTED=NO`
- `EXECUTED_BY_NEXO=NO`
- `BROKER_DURABILITY_VERIFIED=NO`
- `NEXO_CORRECTNESS_VERIFIED=NO`

Finding:
Current Kafka `OffsetFetcherTest` directly covers downstream validation behavior including undefined epoch/end offset, concrete truncation, stale in-flight responses after seek, leader-epoch fencing, and skipping validation for old responses. However, this does NOT establish exhaustive direct coverage of the raw `OffsetsForLeaderEpochUtils.handleResponse()` reducer.

Several protocol errors collapse into the same `partitionsToRetry` state, while authorization produces a terminal `TopicAuthorizationException`. Downstream state tests therefore cannot prove preservation of the original raw error identity after reduction.

Nexo epistemic consequence:
- Do not infer exhaustive reducer coverage from downstream retry/validation tests.
- Raw per-partition `EpochEndOffset.errorCode` provenance must be captured before reduction if Nexo relies on that distinction.
- UNKNOWN remains UNKNOWN until direct evidence closes it.
- No Kafka modification, Nexo implementation, runtime execution, broker-durability claim, or correctness claim is implied.

## EXACT CURRENT RESUME POINT
AB104.729 — inspect the actual Kafka `OffsetsForLeaderEpochUtils` test/source history and protocol-response tests to determine whether direct reducer coverage exists elsewhere. If no direct coverage exists, define the minimum Nexo adversarial test matrix without modifying Kafka.

## CONTINUITY RULE — DO NOT FALL BEHIND
Future CONTINUITY checkpoints MUST update this handoff after each material AB research checkpoint, not merely rely on an older static handoff date. The handoff must record at minimum:
1. latest AB number;
2. latest commit SHA;
3. research-file path when applicable;
4. exact verified findings;
5. explicit UNKNOWN/PENDING items;
6. implementation/verification status;
7. exact next action.

A future CONTINUITY response must treat the latest synchronized checkpoint in this file and the repository's newer AB commits as the resume source. It must never silently resume from AB104.646 or another stale endpoint when newer canonical AB records exist.


## 61. AB104.729 — OffsetForLeaderEpoch reducer direct-coverage audit
Commit: de06000031d36fab2e97a9bd00ac33fa46d770f5
Research file: docs/nexo/NEXO_AB104_729_OFFSET_FOR_LEADER_EPOCH_REDUCER_COVERAGE_AUDIT_2026-09-28.md

AB104.729 directly inspected the current Apache Kafka `OffsetsForLeaderEpochUtils.handleResponse()` source and `OffsetForLeaderEpochClientTest`. No dedicated `OffsetsForLeaderEpochUtilsTest` or direct `handleResponse()` test was found in the searched current repository. The client test covers empty response, successful NONE, authorization failure, and one representative retry error (`LEADER_NOT_AVAILABLE`), but this is not exhaustive reducer coverage.

Current reducer branch set: NONE success; seven explicitly named retry errors (`NOT_LEADER_OR_FOLLOWER`, `REPLICA_NOT_AVAILABLE`, `KAFKA_STORAGE_ERROR`, `OFFSET_NOT_AVAILABLE`, `LEADER_NOT_AVAILABLE`, `FENCED_LEADER_EPOCH`, `UNKNOWN_LEADER_EPOCH`); UNKNOWN_TOPIC_OR_PARTITION retry; TOPIC_AUTHORIZATION_FAILED terminal exception; default retry. Distinct retry errors collapse to the same `partitionsToRetry` state, so raw error provenance is not recoverable from the reduced result alone.

Minimum Nexo adversarial matrix now fixed: NONE; each explicit retry branch individually; UNKNOWN_TOPIC_OR_PARTITION; authorization terminal exception; default/unrecognized error; empty requested response; unrequested partition; mixed success/retry/authorization response; duplicate/contradictory partition entries where transport can expose them; and preservation of raw error provenance before reduction, bound to request/operation identity.

Status remains: SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; DIRECT_REDUCER_TEST_FOUND=NO; EXHAUSTIVE_REDUCER_COVERAGE=UNKNOWN; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; BROKER_DURABILITY_VERIFIED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

No Kafka modification, Nexo implementation, runtime execution, broker-durability claim, or correctness claim was made.

## EXACT CURRENT RESUME POINT
AB104.730 — inspect Kafka protocol response construction/tests and commit history around `OffsetsForLeaderEpochUtils.handleResponse()` for additional response-shape/error-code cases that could bypass the matrix, then determine whether Nexo provenance must preserve fields beyond raw `errorCode` (leader epoch/end offset/request identity) before reduction.

CONTINUITY MUST now resume from AB104.729 / de06000031d36fab2e97a9bd00ac33fa46d770f5 or any newer canonical AB commit, never silently from AB104.728 or older.


## 62. AB104.730 — OffsetForLeaderEpoch protocol-shape and provenance audit
Commit: 3fa035f0418e8c85708fb8dd17b05927c390e847
Research file: docs/nexo/NEXO_AB104_730_OFFSET_FOR_LEADER_EPOCH_PROTOCOL_PROVENANCE_AUDIT_2026-09-28.md

AB104.730 verified the protocol response shape and additional Kafka tests. OffsetForLeaderEpoch response carries error_code + partition + end_offset; v1+ also carries leader_epoch; later versions add throttle_time_ms and v4 uses compact/tagged encoding and topic identifiers. Server-side tests cover UNKNOWN_TOPIC_OR_PARTITION, NOT_LEADER_OR_FOLLOWER, and current-leader-epoch fencing outcomes. These establish raw protocol/error production, but do not close direct reducer coverage.

New provenance conclusion: raw errorCode is necessary but not sufficient when Nexo depends on the semantic meaning of the returned epoch boundary. Minimum semantic tuple for capture: topic/partition, request/operation identity, response error code, leader epoch when supplied by the protocol version, end offset, and protocol version/schema identity. Preserve sentinel/undefined leaderEpoch/endOffset values as received rather than normalizing them away. Throttle time is operational metadata unless a specific claim depends on it. Modern topic identifiers/incarnation may also need binding; topic string alone may be insufficient for an incarnation-sensitive claim.

Capture must occur at the parsed-response boundary before OffsetsForLeaderEpochUtils reduces retry-classified errors, with request/operation identity and protocol version bound.

Status: SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; PROTOCOL_SHAPE_VERIFIED=YES; DIRECT_REDUCER_COVERAGE=NO; EXHAUSTIVE_REDUCER_COVERAGE=UNKNOWN; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

No Kafka source was modified. No Nexo implementation or runtime execution was performed. No broker durability or end-to-end correctness claim was made.

## EXACT CURRENT RESUME POINT
AB104.731 — inspect exact Kafka response/request version negotiation and topic-ID/incarnation handling around OffsetForLeaderEpoch, then determine whether Nexo provenance needs broker/node identity and response/request correlation in addition to topic/partition, protocol version, errorCode, leaderEpoch, endOffset, and operation identity.

CONTINUITY MUST resume from AB104.730 / 3fa035f0418e8c85708fb8dd17b05927c390e847 or any newer canonical AB commit, never silently from AB104.729 or older.


## 63. CONTINUITY RESPONSE AUDIT / EPISTEMIC CORRECTION — 2026-09-27
Audit record: docs/nexo/NEXO_CONTINUITY_RESPONSE_AUDIT_2026-09-27.md
Audit commit: 2ac94e8bd74790753e6e5a36d7bf330c93dcce98

A retrospective continuity audit was performed after detecting that chat responses had advanced beyond the canonical GitHub checkpoint without corresponding commits.

Critical correction:
- The canonical GitHub handoff inspected before this correction ended at AB104.730 / commit 3fa035f0418e8c85708fb8dd17b05927c390e847.
- No canonical repository commits for AB104.731, AB104.732 or AB104.733 were found by repository commit search.
- Therefore the prior chat presentations of AB104.731–733 are downgraded to CHAT-ONLY / UNVERIFIED and must not be treated as completed research.
- Those claims must be re-researched from direct source before entering the canonical AB chain.

AB104.730 correction:
- Its text contains a statement that later OffsetForLeaderEpoch protocol versions add topic identifiers.
- Because the later correction was never canonically saved, that specific statement is now marked NEEDS DIRECT RECHECK rather than accepted as established fact.
- No TopicID claim for OffsetForLeaderEpoch is canonical until the exact current request/response schema is directly inspected and recorded.

Restored epistemic rules:
DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED.
TEST DESIGN != TEST EXECUTION.
SOURCE INSPECTION != NEXO CORRECTNESS.
ACKNOWLEDGEMENT != EXTERNAL-WORLD TRUTH.
TIMEOUT/DISCONNECT != NOT_COMMITTED.
REDUCED RETRY STATE != RAW ERROR PROVENANCE.
CURRENT CAPABILITY STATE != HISTORICAL REQUEST CAPABILITY EVIDENCE.
CHAT-ONLY REASONING != CANONICAL CONTINUITY.

The audit does not delete or overwrite historical Git history. It adds an explicit correction layer and preserves the earlier records as historical evidence.

## EXACT CURRENT RESUME POINT — CORRECTED
AB104.731 RE-RUN.
This is NOT a continuation of the earlier chat-only AB104.731 claim. It must be freshly researched from direct current Kafka source, covering:
1. exact OffsetForLeaderEpoch request/response schema versions;
2. effective version selection/negotiation;
3. NodeApiVersions capability state;
4. request header apiVersion/correlationId/clientId;
5. broker/node identity at request and response boundaries;
6. topic identity/incarnation handling;
7. exact provenance retained before reducer loss.

No AB104.732 or AB104.733 may be assigned until this rerun has its own evidence record and canonical commit.


## 64. AB104.731 — OffsetForLeaderEpoch version/correlation/topic-identity re-run
Commit: 443b8a1a3dc3b6ea12219e3b04f401b1f24baddb
Research file: docs/nexo/NEXO_AB104_731_OFFSET_FOR_LEADER_EPOCH_VERSION_NEGOTIATION_PROVENANCE_RERUN_2026-09-27.md

This is the canonical fresh re-run. It does not inherit the prior chat-only AB104.731 claim.

Confirmed:
- Current Apache Kafka 4.1 protocol documentation shows OffsetForLeaderEpoch v4 remains topic-name based; v4 uses flexible encoding but does not show a topic UUID field. v0 lacks leader_epoch; v1+ carries leader_epoch; v2 adds throttle_time_ms; v3 adds replica_id; v4 is flexible/tagged.
- The previous AB104.730 statement that v4 itself adds topic identifiers is CORRECTED/REJECTED as a current-protocol claim.
- Current NetworkClient selects an effective request version from NodeApiVersions plus the request builder's oldest/latest allowed range. NodeApiVersions intersects broker-advertised min/max with the client range and selects the highest usable version.
- Current Fetcher/OffsetFetcher obtains NodeApiVersions for the target leader and explicitly skips OffsetForLeaderEpoch validation when no usable version is available.
- Current RequestHeader binds apiKey, apiVersion, clientId and correlationId; ClientResponse retains the original RequestHeader and destination. Network response processing binds the response to the in-flight request and validates correlation.
- Therefore provenance should bind OperationID + apiVersion + header version + correlationId + clientId + destination/node identity + per-partition raw response fields before reducer collapse.

Topic identity correction:
- KIP-516 proposed topic IDs for OffsetForLeaderEpoch.
- KAFKA-10549 later pursued topic-ID support; the relevant 2025/2026 PR discussion proposed a v5 topic-ID path while retaining v4 name-based behavior.
- The relevant PR #21126 was closed for inactivity on 2026-05-03. This is not evidence of current deployed support.
- Current protocol evidence therefore does NOT establish topic UUID/incarnation support in OffsetForLeaderEpoch. Keep TOPIC_INCARNATION and BROKER_INCARNATION explicit UNKNOWN unless independently proven.

Status:
SOURCE_CODE_VERIFIED=PARTIAL/YES;
PROTOCOL_SHAPE_VERIFIED=YES;
VERSION_SELECTION_VERIFIED=YES;
REQUEST_HEADER_CORRELATION_VERIFIED=YES;
BROKER_DESTINATION_BINDING_VERIFIED=YES;
TOPIC_ID_IN_CURRENT_PROTOCOL=NOT_ESTABLISHED;
DIRECT_OFFSETS_FOR_LEADER_EPOCH_CLIENT_BODY=NOT_RETRIEVED;
IMPLEMENTED=NO;
EXECUTED_BY_NEXO=NO;
NEXO_CORRECTNESS_VERIFIED=NO;
TLC=PENDING.

No Kafka source modified. No Nexo implementation. No runtime test. No correctness/security/deployment guarantee.

## EXACT CURRENT RESUME POINT — AB104.732
Direct code/test audit of the current OffsetForLeaderEpoch client path and provenance-loss boundary:
1. retrieve exact current OffsetsForLeaderEpochClient/OffsetFetcherUtils/NetworkClient test bodies where available;
2. verify how the parsed response reaches the reducer;
3. identify every field discarded before the Nexo capture boundary;
4. inspect direct tests for correlation mismatch, stale responses, unsupported versions and mixed-partition responses;
5. preserve topic-incarnation and broker-incarnation UNKNOWN unless direct evidence closes them.

Do not implement Nexo. Do not create V21. AB104.732 must have its own evidence record and canonical commit before AB104.733 is assigned.


## 65. AB104.732 — OffsetForLeaderEpoch client-path / provenance-loss audit
Commit: fe8f7d4b6fadbfa0ec879b4b535a813b842f105f
Research file: docs/nexo/NEXO_AB104_732_OFFSET_FOR_LEADER_EPOCH_CLIENT_PATH_PROVENANCE_LOSS_AUDIT_2026-09-27.md

Confirmed from current Apache Kafka source evidence:
- Parsed OffsetForLeaderEpoch response reaches OffsetsForLeaderEpochUtils.handleResponse(...) directly, creating a clear parsed-response → reducer boundary.
- NetworkClient retains request header, destination, in-flight request context and transport timing before reduction.
- RequestHeader contains API key, API version, header version, client ID and correlation ID.
- Response correlation is checked against the originating request correlation; mismatch is rejected.
- Disconnect/timeout states do not contain a successful parsed response and must remain distinct from a successful broker response.
- Unsupported-version rejection is distinct from broker protocol error and from timeout/disconnect.
- Reducer collapse is a real provenance-loss boundary: multiple raw retry-classified error codes can become the same partitionsToRetry membership.
- Multi-partition provenance must remain partition-specific; aggregate retry membership is insufficient evidence.

Explicit UNKNOWN:
- exact current generated OffsetsForLeaderEpochClient.java body was not directly retrieved through the available GitHub connector;
- exhaustive direct reducer test coverage;
- topic incarnation;
- broker incarnation;
- Nexo implementation/runtime correctness;
- TLC/formal correctness.

No Kafka source modified. No Nexo implementation. No runtime test. No correctness/security/deployment guarantee.

## EXACT CURRENT RESUME POINT — AB104.733
Inspect the strongest available direct Kafka tests around:
1. reducer/client behavior;
2. NetworkClient correlation mismatch;
3. stale/disconnected responses;
4. unsupported versions;
5. mixed-partition responses.
Determine which cases are directly asserted versus merely implied by source. Preserve all UNKNOWNs. Do not implement Nexo or create V21.


## 66. AB104.733 — OffsetForLeaderEpoch direct-test audit
Commit: 8d382a6062385d159220d8c1af73e10fcdc86d96
Research file: docs/nexo/NEXO_AB104_733_OFFSET_FOR_LEADER_EPOCH_DIRECT_TEST_AUDIT_2026-09-27.md

Direct current Kafka test inspection confirmed:
- OffsetForLeaderEpochClientTest directly covers empty/unexpected-empty response, success preserving errorCode/leaderEpoch/endOffset, authorization terminal failure, and one retriable error.
- OffsetFetcherTest directly covers request grouping, waiting for NodeApiVersions, skipping validation for insufficient broker capability, old response handling, undefined epoch/offset cases, stale in-flight validation after a seek, and leader-epoch fencing/revalidation.
- NetworkClientTest directly covers normal correlation to the originating request, disconnected in-flight responses retaining original correlation IDs, timeout timing, and API-version discovery/unsupported-version behavior.
- No explicit mismatched-correlation injection test was established in the inspected current NetworkClientTest. Do not infer such test coverage from source implementation.
- Multi-partition grouping exists, but exhaustive mixed success/retry/authorization combinations at the raw OffsetForLeaderEpoch reducer boundary remain UNKNOWN.
- Direct exhaustive coverage of OffsetsForLeaderEpochUtils.handleResponse remains NOT ESTABLISHED; downstream/client tests cannot reconstruct raw retry error provenance after reducer collapse.

Status remains: SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; MIXED_RAW_REDUCER_COMBINATION_COVERAGE=UNKNOWN; EXPLICIT_CORRELATION_MISMATCH_TEST=NOT_ESTABLISHED; STALE_INFLIGHT_TEST=YES; DISCONNECT_TEST=YES; UNSUPPORTED_CAPABILITY_TEST=YES; TOPIC_INCARNATION=UNKNOWN; BROKER_INCARNATION=UNKNOWN; IMPLEMENTED=NO; EXECUTED_BY_NEXO=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

No Kafka source was modified. No Nexo implementation or runtime verification was performed.

## EXACT CURRENT RESUME POINT — AB104.734
Directly search/inspect any additional current Kafka tests that may exercise the OffsetForLeaderEpoch reducer through parameterized/error matrices, and continue the exact NetworkClient correlation-mismatch rejection audit. Only direct assertions count as test evidence. Preserve UNKNOWN for absent or inaccessible tests; do not infer coverage from implementation. Do not implement Nexo or create V21.


## 67. AB104.734 — deeper direct-test audit
Date: 2026-09-27

Current Kafka source inspection added two important refinements:
- `OffsetForLeaderEpochClientTest` is a small direct suite with five focused tests: empty response, unexpected empty response, success, authorization failure, and one retriable error (`LEADER_NOT_AVAILABLE`). It does NOT enumerate every reducer error branch.
- `NetworkClientTest.testRequestTimeout` directly distinguishes successful response from timeout: success has neither disconnected nor timed-out flags; simulated timeout yields both `wasDisconnected=true` and `wasTimedOut=true`. This strengthens the transport-provenance boundary but does not establish external-world non-commitment.
- The inspected current NetworkClientTest still does not establish a deliberate mismatched-correlation response rejection test. Correlation correctness remains source/implementation evidence, not direct test evidence in the inspected file.
- OffsetFetcherTest directly covers multi-partition request grouping and several stale/fencing cases, but this is not equivalent to exhaustive raw reducer mixed-error coverage.

Epistemic status: SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; ALL_ERROR_BRANCHES_TESTED=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; EXPLICIT_CORRELATION_MISMATCH_TEST=NOT_ESTABLISHED; TIMEOUT_TEST=YES; DISCONNECT_TEST=YES; STALE_INFLIGHT_TEST=YES; UNSUPPORTED_CAPABILITY_TEST=YES; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

No Kafka source was modified and no Nexo implementation was performed.

## EXACT CURRENT RESUME POINT — AB104.735
Continue direct search for parameterized/current tests of every `OffsetsForLeaderEpochUtils.handleResponse` branch, including errors not represented by the five direct client tests. Separately locate the exact NetworkClient response-correlation validation test if one exists elsewhere in the current Kafka test tree. Preserve the distinction between implementation evidence and test evidence.


## 68. AB104.735 — OffsetForLeaderEpoch error-matrix + correlation audit
Commit: b494f831f66b95f682eb5358680f6a7e20bcf75a
Research file: docs/nexo/NEXO_AB104_735_OFFSET_FOR_LEADER_EPOCH_ERROR_MATRIX_CORRELATION_AUDIT_2026-09-27.md

Direct current Kafka source/test-tree inspection continued from AB104.734.

Findings:
- Current OffsetsForLeaderEpochUtils.handleResponse() has explicit NONE success, seven named retry errors, UNKNOWN_TOPIC_OR_PARTITION retry, TOPIC_AUTHORIZATION_FAILED terminal authorization behavior, and a default retry branch.
- No dedicated OffsetsForLeaderEpochUtilsTest or parameterized current test matrix covering every reducer branch was found in the accessible current tree.
- The current OffsetForLeaderEpochClientTest remains a five-test focused suite: empty response, unexpected empty response, success, authorization failure, and one retriable error (LEADER_NOT_AVAILABLE).
- Direct searches for the other named reducer errors did not establish additional direct tests tied to this reducer path.
- Therefore ALL_ERROR_BRANCHES_TESTED=NO and DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO. MIXED_RAW_REDUCER_COVERAGE remains UNKNOWN; absence of search hits is not proof of global absence.
- Current AbstractResponse.parseResponse explicitly compares request and response correlation IDs and throws CorrelationIdMismatchException on mismatch. This is implementation evidence of a correlation-validation boundary.
- No dedicated current test deliberately injecting a mismatched response correlation was established by the search. Existing timeout/disconnect/normal-correlation tests remain distinct and must not be treated as mismatch-injection evidence.
- Raw retry error identity remains unrecoverable after reducer collapse; Nexo provenance capture must occur before reduction.
- Candidate provenance remains OperationID + API/header/version/client/correlation/destination/timing + per-partition raw errorCode/leaderEpoch/endOffset + protocol/schema + transport outcome + independently authoritative generation/version/incarnation.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; ALL_ERROR_BRANCHES_TESTED=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; CORRELATION_VALIDATION_IMPLEMENTED=YES; EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED; TIMEOUT_TEST=YES; DISCONNECT_TEST=YES; STALE_INFLIGHT_TEST=YES; UNSUPPORTED_CAPABILITY_TEST=YES; TOPIC_INCARNATION=UNKNOWN; BROKER_INCARNATION=UNKNOWN; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

No Kafka source was modified. No Nexo implementation or runtime verification was performed.

## EXACT CURRENT RESUME POINT — AB104.736
1. Inspect current Kafka test fixtures/helpers capable of constructing raw OffsetForLeaderEpoch responses and determine whether any shared helper establishes direct reducer coverage indirectly.
2. Inspect NetworkClient.parseResponse and surrounding tests for post-correlation-mismatch behavior, distinguishing parser rejection from transport disconnect.
3. Inspect current fault-proxy/integration tests for deliberate response mutation; infrastructure capability is not test execution.
4. Preserve raw error provenance, request identity, correlation, transport outcome, and incarnation as separate evidence fields.
Do not implement Nexo. Do not create V21.


## 69. AB104.736 — OffsetForLeaderEpoch fixtures/fault-proxy/correlation audit
Commit: d73b9e089ddeb361558c7f430eff906d1dbfc0ed
Research file: docs/nexo/NEXO_AB104_736_OFFSET_FOR_LEADER_EPOCH_FIXTURES_FAULT_PROXY_CORRELATION_AUDIT_2026-09-27.md

Direct current Kafka inspection found:
- `OffsetsForLeaderEpochClient.handleResponse` is a thin adapter directly delegating to `OffsetsForLeaderEpochUtils.handleResponse(requestData, response)`.
- `OffsetsRequestManager` also directly passes parsed `OffsetsForLeaderEpochResponse` into the same reducer.
- No dedicated current `OffsetForLeaderEpochResponseTest` or reducer fixture matrix was found.
- `OffsetFetcherTest` contains helpers capable of preparing OffsetForLeaderEpoch responses and covers multi-partition/stale/fencing behavior, but helper existence does not establish exhaustive raw reducer assertions.
- Kafka's current `KafkaProtocolFaultProxy` can parse and mutate selected wire responses, disconnect, delay, blackhole requests, and track request headers by correlation ID. Its current error-injection setters do NOT include OffsetForLeaderEpoch.
- `KafkaProtocolFaultProxyTest` directly tests only single/multi-broker bootstrap behavior; it does not execute OffsetForLeaderEpoch mutation or correlation-mismatch scenarios.
- The proxy's response transformation explicitly reconstructs the response header with the originating request correlation ID, so it is not a ready-made mismatch injector.
- Current `AbstractResponse.parseResponse` remains the implementation boundary that rejects mismatched request/response correlation IDs via `CorrelationIdMismatchException`; deliberate mismatch test execution remains NOT ESTABLISHED.

Nexo consequence:
The strongest evidence capture point remains the parsed response together with the originating RequestHeader immediately before semantic reduction. Preserve operation identity, API/version/header/client/correlation/destination, timing, topic/partition, raw errorCode, leaderEpoch/endOffset, protocol/schema, transport outcome, and independently authoritative generation/version/incarnation as separate fields.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; ALL_ERROR_BRANCHES_TESTED=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; FAULT_PROXY_SUPPORTS_RESPONSE_MUTATION=YES; OFFSET_FOR_LEADER_EPOCH_FAULT_PROXY_SUPPORT=NO; EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED; TIMEOUT_TEST=YES; DISCONNECT_TEST=YES; STALE_INFLIGHT_TEST=YES; UNSUPPORTED_CAPABILITY_TEST=YES; TOPIC_INCARNATION=UNKNOWN; BROKER_INCARNATION=UNKNOWN; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

No Kafka source was modified. No Nexo implementation/runtime verification was performed.

## EXACT CURRENT RESUME POINT — AB104.737
1. Inspect OffsetFetcherTest response-building helpers and every current OffsetForLeaderEpoch-related test around them.
2. Determine whether any helper path actually asserts raw error identity before reducer loss.
3. Inspect AbstractResponse.parseResponse tests and nearby request/response tests for direct correlation-mismatch assertions.
4. Preserve the separation between infrastructure capability, source behavior, test-source presence, and executed-test evidence.
5. Only after direct evidence is exhausted, refine the minimal Nexo provenance/fault matrix.
Do not implement Nexo. Do not create V21.


## 70. AB104.737 — OffsetFetcher fixtures/raw-error/correlation audit
Commit: 8d90f97c9d5d0d1345d7e436e569c127aa3224c4
Research file: docs/nexo/NEXO_AB104_737_OFFSET_FETCHER_FIXTURES_RAW_ERROR_AND_CORRELATION_TEST_AUDIT_2026-09-27.md

Direct current OffsetFetcherTest inspection:
- `prepareOffsetsForLeaderEpochResponse` constructs a raw `OffsetForLeaderEpochResponseData` and explicitly sets topic, partition, errorCode, leaderEpoch and endOffset.
- However the helper is hard-coded to `Errors.NONE`; it is therefore not an arbitrary-error fixture/matrix.
- The tests use this helper through `client.prepareResponse(...)` and assert behavioral validation outcomes, including stale in-flight validation and successful validation.
- Multi-partition/request-grouping infrastructure exists, but no exhaustive mixed raw error matrix at the reducer boundary was established.
- Repository search for a dedicated current correlation-mismatch test did not establish one. Implementation still explicitly checks correlation IDs and throws `CorrelationIdMismatchException`; normal correlation, timeout, disconnect, stale-inflight and version-negotiation tests remain distinct evidence classes.
- The provenance boundary remains before `OffsetsForLeaderEpochUtils.handleResponse`: downstream retry state cannot reconstruct which raw error code was collapsed into retry.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; RAW_ERROR_MATRIX_VIA_OFFSETFETCHER_HELPER=NOT_ESTABLISHED; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; ALL_ERROR_BRANCHES_TESTED=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; CORRELATION_VALIDATION_IMPLEMENTED=YES; EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED; TIMEOUT_TEST=YES; DISCONNECT_TEST=YES; STALE_INFLIGHT_TEST=YES; UNSUPPORTED_CAPABILITY_TEST=YES; TOPIC_INCARNATION=UNKNOWN; BROKER_INCARNATION=UNKNOWN; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

No Kafka source was modified. No Nexo implementation/runtime verification was performed.

## EXACT CURRENT RESUME POINT — AB104.738
1. Search all current Kafka tests for construction of `EpochEndOffset` and arbitrary `Errors` values, not just OffsetFetcherTest.
2. Determine whether any test directly calls `OffsetsForLeaderEpochUtils.handleResponse` or reaches every reducer branch with constructed responses.
3. Continue correlation-mismatch audit around protocol/request tests, distinguishing implementation-only exception paths from executed tests.
4. If no direct matrix exists, preserve it explicitly as a research gap rather than implementing it in Nexo.
Do not implement Nexo. Do not create V21.


## 71. AB104.738 — broader Kafka EpochEndOffset/error-fixture search
Commit: 82cca68ea934da8406ece80c5870891fffd0eb50
Research file: docs/nexo/NEXO_AB104_738_ALL_KAFKA_EPOCH_END_OFFSET_ERROR_FIXTURE_SEARCH_2026-09-27.md

Important correction to AB104.737:
- Current Kafka does contain reusable arbitrary-error OffsetForLeaderEpoch response construction.
- `OffsetsRequestManagerTest.buildOffsetsForLeaderEpochResponseWithErrors(...)` sets each `EpochEndOffset.errorCode` from a supplied `Errors` value.
- Its inspected OffsetForLeaderEpoch use is `TOPIC_AUTHORIZATION_FAILED`.
- The same file has a parameterized `retriableErrors()` matrix, but `testRequestFailsWithRetriableError_RetrySucceeds` exercises ListOffsets, NOT the OffsetForLeaderEpoch reducer. It must not be counted as reducer coverage.
- `OffsetForLeaderEpochClientTest` still has focused direct cases: empty, unexpected empty, success, authorization failure, one retriable error.
- `FetcherTest` and core server epoch tests contain additional EpochEndOffset/error constructions, but these are not proof of exhaustive consumer-side reducer coverage.
- No direct current parameterized test was established that drives all 11 known `OffsetsForLeaderEpochUtils.handleResponse` semantic branches.
- Deliberate correlation-mismatch injection test remains NOT ESTABLISHED.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; ARBITRARY_OFLE_ERROR_FIXTURE_EXISTS=YES; ARBITRARY_OFLE_ERROR_FIXTURE_USED_FOR_EXHAUSTIVE_REDUCER_MATRIX=NO; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; ALL_ERROR_BRANCHES_TESTED=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; LISTOFFSETS_RETRIABLE_MATRIX_EXISTS=YES; LISTOFFSETS_MATRIX_IS_OFLE_REDUCER_EVIDENCE=NO; EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.739
1. Inspect every current call site of `buildOffsetsForLeaderEpochResponseWithErrors` and every OffsetForLeaderEpoch response helper in client tests.
2. Determine whether any existing test drives mixed partitions through the consumer-side reducer with multiple raw error classes in one response.
3. Inspect current `OffsetsForLeaderEpochUtils` visibility and whether a direct unit-test seam exists without production changes; research only.
4. Continue narrow correlation mismatch test search.
Do not implement Nexo. Do not create V21.


## 72. AB104.739 — OFLE helper call-sites, mixed errors, reducer visibility, correlation
Commit: 874b58e102d9d9a81625b1d366d34c8ab4bad768
Research file: docs/nexo/NEXO_AB104_739_OFLE_CALLS_MIXED_ERRORS_VISIBILITY_CORRELATION_AUDIT_2026-09-27.md

Findings:
- Current search found exactly one call site for `buildOffsetsForLeaderEpochResponseWithErrors`: `OffsetsRequestManagerTest.testValidatePositionsFailureWithUnrecoverableAuthException`.
- That call supplies one partition with `TOPIC_AUTHORIZATION_FAILED`.
- The helper can construct arbitrary raw error codes, but its only discovered OFLE call-site is authorization-only.
- `OffsetsRequestManager` directly passes parsed `OffsetsForLeaderEpochResponse` into `OffsetsForLeaderEpochUtils.handleResponse`.
- `OffsetsForLeaderEpochUtils.handleResponse` is currently `public static`, so a direct unit-test seam exists without production visibility changes.
- Reducer semantics: NONE removes from retry and records end offset; seven explicit retriable errors remain in retry; UNKNOWN_TOPIC_OR_PARTITION remains in retry; TOPIC_AUTHORIZATION_FAILED removes partition and throws terminal TopicAuthorizationException; default errors remain retryable.
- No current direct mixed-error reducer test was established.
- No dedicated deliberate correlation-mismatch test was established; implementation evidence remains separate from executed-test evidence.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; ARBITRARY_OFLE_ERROR_FIXTURE_EXISTS=YES; ARBITRARY_OFLE_ERROR_FIXTURE_CALLSITE_COVERAGE=AUTHORIZATION_ONLY; MIXED_OFLE_RAW_ERROR_CALLSITE=NOT_ESTABLISHED; DIRECT_REDUCER_SEAM=YES; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; ALL_ERROR_BRANCHES_TESTED=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; CORRELATION_VALIDATION_IMPLEMENTED=YES; EXPLICIT_CORRELATION_MISMATCH_TEST_FOUND=NO/NOT_ESTABLISHED; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.740
1. Inspect all direct tests around `OffsetsForLeaderEpochUtils` by class/package and method names, beyond textual symbol matches.
2. Specify the minimal direct branch/mixed test matrix as research only.
3. Continue correlation mismatch audit through `AbstractResponse.parseResponse` and nearby protocol tests, including raw buffer/request-header construction.
4. Preserve source-presence vs execution distinction.
Do not implement Nexo. Do not create V21.


## 73. AB104.740 — direct reducer matrix + correlation parser audit
Commit: b982137a5b2e07a6415d0c013805c376c9cffa30
Research file: docs/nexo/NEXO_AB104_740_DIRECT_REDUCER_MATRIX_CORRELATION_PARSER_AUDIT_2026-09-27.md

Findings:
- No current dedicated `OffsetsForLeaderEpochUtilsTest` was found.
- `OffsetsForLeaderEpochUtils.handleResponse` is `public static`, so a direct test seam exists without production visibility changes.
- A minimum direct research matrix was frozen: all 11 reducer semantic branches, empty response, unrequested partition, duplicate response characterization, multi-partition, mixed error classes, authorization mixed response, and raw-error-to-result mapping.
- Matrix is a DESIGN/RESEARCH SPECIFICATION only; it was NOT executed.
- Current RequestContextTest demonstrates matching response correlation parsing, but no deliberate mismatch injection was established.
- AbstractResponse implementation remains evidence that mismatched correlation IDs raise `CorrelationIdMismatchException`; implementation evidence is not test-execution evidence.
- Existing KafkaProtocolFaultProxy reconstructs response headers with the originating correlation ID, so it is not currently a mismatch injector.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; DIRECT_REDUCER_TEST_CLASS_FOUND=NO; DIRECT_REDUCER_SEAM=YES; MINIMUM_MATRIX_DESIGNED=YES; MINIMUM_MATRIX_EXECUTED=NO; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; MATCHED_CORRELATION_TEST_EVIDENCE=YES; DELIBERATE_MISMATCH_TEST_EVIDENCE=NO/NOT_ESTABLISHED; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.741
1. Inspect exact `AbstractResponse.parseResponse` implementation and response-header version handling for OffsetForLeaderEpoch-relevant versions.
2. Inspect test fixtures capable of serializing responses with controlled response-header correlation IDs.
3. Finish duplicate/missing/unrequested response-shape audit.
4. Then freeze the research gap and update continuity.
Do not implement Nexo. Do not create V21.


## 74. AB104.741 — exact correlation parser + duplicate/shape audit
Commit: 99aede50e28c256d39377597133b44bdd6579173
Findings:
- `AbstractResponse.parseResponse(ByteBuffer, RequestHeader)` derives response-header version from API key/version, parses the ResponseHeader, checks correlation ID, and only then parses the API response body.
- Correlation mismatch therefore fails before API-specific response parsing.
- `ResponseHeader` has a concrete serialization path with controlled correlation ID; RequestResponseTest has positive round-trip/matching correlation evidence.
- No deliberate mismatch test was established.
- OFLE reducer duplicate entries are not explicitly rejected. Source inspection shows order-dependent behavior:
  * retry -> NONE removes partition and stores end offset;
  * NONE -> retry leaves partition removed from retry;
  * NONE -> NONE overwrites stored end offset;
  * authorization removes from retry and ultimately throws.
- Missing requested partitions remain retryable because retry set begins with all requestData keys.
- Unrequested response partitions are explicitly ignored.
- No dedicated current tests were established for duplicate/missing/unrequested OFLE response-shape cases.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; CONTROLLED_CORRELATION_SERIALIZATION_PATH=YES; POSITIVE_CORRELATION_TEST=YES; DELIBERATE_MISMATCH_TEST_EXECUTED=NO/NOT_ESTABLISHED; DUPLICATE_RESPONSE_EXPLICIT_TEST=NO/NOT_ESTABLISHED; MISSING_RESPONSE_EXPLICIT_TEST=NO/NOT_ESTABLISHED; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.742
1. Search Kafka tests specifically for duplicate OFLE response entries, missing requested partitions, and unrequested partitions.
2. Search for direct correlation-mismatch construction using ResponseHeader/ByteBuffer/RequestHeader.
3. Inspect OFLE response serialization/version tests and response-header versions exercised.
4. Determine which remaining gaps require execution versus source evidence.
No Nexo implementation. No V21.


## 75. AB104.743 — OFLE response-shape + correlation follow-up audit
Commit: dfb7cdcacb06d5aa06ed700448f2e09e4b207a7c
Research file: docs/nexo/NEXO_AB104_743_OFLE_RESPONSE_SHAPE_CORRELATION_AUDIT_2026-09-28.md

Current Kafka source evidence at commit abf522e1ca5d7f4375baddc4da004da9fcb6e9ca was inspected.
- OffsetsForLeaderEpochUtils.handleResponse initializes retry from all requested partitions; unrequested response partitions are ignored; missing requested partitions therefore remain retryable.
- Duplicate response entries are not explicitly rejected. Reducer behavior is order-dependent for stored endOffset and effectively monotonic for retry-removal after a successful/authorization entry.
- AbstractResponse.parseResponse parses the versioned ResponseHeader, compares correlation IDs, and throws CorrelationIdMismatchException before API-body parsing on mismatch. This is implementation evidence only.
- Search did not establish a dedicated duplicate, missing, unrequested OFLE response-shape test or a deliberate correlation-mismatch execution test.
- RequestResponseTest provides controlled response-header/serialization infrastructure and OFLE response construction, but inspected evidence does not establish exhaustive OFLE response-shape coverage across API versions or deliberate mismatch execution.

Nexo consequence: preserve RequestHeader + ResponseHeader + API/version + correlation + raw response entries + transport outcome + authoritative generation/incarnation before semantic reduction. Keep separate claims for parse success, correlation match, requested-set completeness, absence of extras/duplicates, raw error preservation, reducer correctness, and incarnation validity. Tolerated/ignored malformed or extra input is not proof of semantic completeness.

Status:
SOURCE_CODE_VERIFIED=YES; TEST_SOURCE_VERIFIED=YES; CORRELATION_VALIDATION_IMPLEMENTED=YES; CONTROLLED_CORRELATION_SERIALIZATION_PATH=YES; DELIBERATE_CORRELATION_MISMATCH_EXECUTED=NO/NOT_ESTABLISHED; DUPLICATE_OFLE_TEST_EXECUTED=NO/NOT_ESTABLISHED; MISSING_OFLE_TEST_EXECUTED=NO/NOT_ESTABLISHED; UNREQUESTED_OFLE_TEST_EXECUTED=NO/NOT_ESTABLISHED; DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO; MIXED_RAW_REDUCER_COVERAGE=UNKNOWN; API-VERSION_EXHAUSTIVE_RESPONSE-SHAPE-COVERAGE=UNKNOWN; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.744
1. Inspect current Kafka response-header/version tests and exact OFLE Request/Response serialization tests.
2. Determine whether controlled ByteBuffer construction can establish a research-only deliberate correlation mismatch path without production changes.
3. Search parameterized response-shape tests by API key/version for indirect duplicate/missing/unrequested coverage.
4. If execution evidence remains absent, freeze gaps rather than infer coverage.
Do not implement Nexo. Do not create V21.


## 76. AB104.744 — OFLE serialization/version + correlation-mismatch evidence audit
Commit: 17d163ebfffd6805b981d3a2f9fa0f83db24d468
Research file: docs/nexo/NEXO_AB104_744_OFLE_SERIALIZATION_VERSION_CORRELATION_AUDIT_2026-09-28.md

Correction/refinement to AB104.743: current Kafka test fixture RequestTestUtils.serializeResponseWithHeader accepts an arbitrary correlationId and constructs the versioned ResponseHeader. Current server test ForwardingManagerTest.testResponseCorrelationIdMismatch uses requestCorrelationId + 1, establishing executed generic response-correlation mismatch evidence. This is NOT OFLE-specific.

Current status:
- GENERIC_CORRELATION_MISMATCH_EXECUTED=YES
- OFLE_CORRELATION_MISMATCH_EXECUTED=NO/NOT_ESTABLISHED
- CONTROLLED_OFLE_MISMATCH_CONSTRUCTION=YES
- DIRECT_REDUCER_EXHAUSTIVE_COVERAGE=NO
- DUPLICATE_OFLE_TEST=NO/NOT_ESTABLISHED
- MISSING_OFLE_TEST=NO/NOT_ESTABLISHED
- UNREQUESTED_OFLE_TEST=NO/NOT_ESTABLISHED
- API-VERSION_EXHAUSTIVE_OFLE_SHAPE_COVERAGE=UNKNOWN
- NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

RequestTestUtils serializes the response using response.apiKey().responseHeaderVersion(version); AbstractResponse.parseResponse independently derives the response-header version from the request API key/version before correlation validation and API-body parsing. This provides a concrete research path for OFLE-specific mismatch/version testing without production changes.

Nexo consequence: distinguish generic fault-injection capability and execution from OFLE-specific execution, reducer coverage, and version-complete coverage. Do not promote generic evidence into OFLE evidence.

## EXACT CURRENT RESUME POINT — AB104.745
1. Inspect exact OFLE Request/Response schema versions and current RequestResponseTest loops/parameterization.
2. Determine supported OFLE version set and whether generic protocol serialization tests indirectly cover every version.
3. Inspect whether a small research-only execution can route a deliberately mismatched OFLE response through NetworkClient without production changes.
4. Freeze remaining gaps explicitly; no implementation/V21.


## 77. AB104.745 — OFLE version + client-test inventory audit
Commit: ba4089ccbdc6324b476c2248a85d69b22603214d
Research file: docs/nexo/NEXO_AB104_745_OFLE_VERSION_CLIENT_TEST_AUDIT_2026-09-28.md

New evidence: MessageTest.testOffsetForLeaderEpochVersions() exercises OFLE request message round-trips across the supported version range and explicitly checks version 2 currentLeaderEpoch and version 3 replicaId transitions. This is request serialization/version evidence, not reducer semantic closure. No dedicated OFLE response-version test with analogous naming was found.

Current OffsetForLeaderEpochClientTest directly executes: empty response; unexpected empty response (requested partition absent -> remains retryable); successful NONE response; authorization failure; retriable error. Therefore AB104.743/744 gap is refined: missing requested partition IS executed/covered. Unrequested response partition remains NOT ESTABLISHED. Duplicate partition remains NOT ESTABLISHED. Mixed duplicate/error ordering remains NOT ESTABLISHED. OFLE-specific correlation mismatch remains NOT ESTABLISHED. Generic Kafka mismatch execution remains YES.

Status:
OFLE_REQUEST_MESSAGE_ROUNDTRIP_VERSION_COVERAGE=YES; OFLE_REQUEST_VERSION_TRANSITIONS_EXPLICITLY_TESTED=YES; OFLE_RESPONSE_VERSION_ROUNDTRIP_DEDICATED=NOT_ESTABLISHED; OFLE_CLIENT_EMPTY_RESPONSE=EXECUTED; OFLE_CLIENT_MISSING_REQUESTED_PARTITION=EXECUTED; OFLE_CLIENT_UNREQUESTED_PARTITION=NOT_ESTABLISHED; OFLE_CLIENT_DUPLICATE_PARTITION=NOT_ESTABLISHED; OFLE_CLIENT_MIXED_DUPLICATE_ORDER=NOT_ESTABLISHED; OFLE_CLIENT_CORRELATION_MISMATCH=NOT_ESTABLISHED; OFLE_DIRECT_REDUCER_EXHAUSTIVE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.746
1. Search all current OFLE client/helper tests for indirect unrequested or duplicate response entries.
2. Inspect OFLE response schema/version handling specifically.
3. If no additional coverage, freeze the minimal remaining response-shape matrix and evidence boundary.
4. No production modification; no Nexo implementation; no V21.


## 78. AB104.746 — OFLE indirect response coverage audit
Commit: 01bf42a6fa81a85f1bd91e6f5c25819c788ec27c

Repository-wide search confirms production reducer behavior for unrequested OFLE response partitions: OffsetsForLeaderEpochUtils.handleResponse explicitly logs and ignores them. No dedicated consumer reducer test executing this branch was found. A separate core AbstractFetcherThreadTest has an OFLE-related unrequested-partition scenario, but it exercises a different server/fetcher layer and cannot count as consumer reducer coverage.

RequestResponseTest.createLeaderEpochResponse() constructs a multi-topic/multi-partition OFLE response and participates in generic response error-count testing, but does not feed the response into OffsetsForLeaderEpochUtils.handleResponse. It therefore establishes response object construction, not reducer semantics. It does not establish duplicate/unrequested consumer behavior.

Refined matrix: OFLE_REQUEST_MESSAGE_ROUNDTRIP_VERSION_COVERAGE=YES; OFLE_RESPONSE_OBJECT_GENERIC_CONSTRUCTION=YES; OFLE_RESPONSE_REDUCER_UNREQUESTED_EXECUTED=NO; OFLE_RESPONSE_REDUCER_MISSING_REQUESTED_EXECUTED=YES; OFLE_RESPONSE_REDUCER_DUPLICATE_EXECUTED=NO; OFLE_RESPONSE_REDUCER_DUPLICATE_ORDER_EXECUTED=NO; OFLE_RESPONSE_REDUCER_MIXED_DUPLICATE_ERROR_EXECUTED=NO; OFLE_RESPONSE_REDUCER_CORRELATION_MISMATCH_EXECUTED=NO; OFLE_SERVER/FETCHER_UNREQUESTED_SCENARIO=YES_BUT_DIFFERENT_LAYER; DIRECT_REDUCER_EXHAUSTIVE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.747
Inspect RequestResponseTest all-version loops plus OFLE response header/version path; establish precisely what generic response serialization tests establish and do not establish for OFLE, then freeze protocol-vs-reducer boundary. No production changes.


## 79. AB104.747 — OFLE protocol-version serialization boundary
Commit: c133bdb1a0a541bac6a46e2e9917975a2dd63850

Correction/refinement: RequestResponseTest.testSerialization() iterates every ApiKeys value and every apiKey.allVersions(). For OFFSET_FOR_LEADER_EPOCH, getResponse() returns createLeaderEpochResponse(), and checkResponse() serializes, parses with AbstractResponse.parseResponse(apiKey, readable, version), reserializes, and compares bytes. Therefore generic OFLE RESPONSE wire round-trip across all supported API versions is YES. Earlier wording saying response-version coverage was "not established" must be refined to mean dedicated semantic/shape coverage was not established. History is preserved; this is a correction.

The OFLE response fixture is version-independent and contains three unique partition records across two topics. It does not exercise unrequested entries, duplicates, conflicting duplicate order, or deliberate OFLE correlation mismatch. Generic response-header/framing machinery is covered, but OFLE-specific correlation mismatch remains NOT EXECUTED.

Final protocol/reducer boundary: PROTOCOL_REQUEST_ROUNDTRIP_ALL_OFLE_VERSIONS=YES; PROTOCOL_RESPONSE_ROUNDTRIP_ALL_OFLE_VERSIONS=YES; PROTOCOL_HEADER_GENERIC_COVERAGE=YES; OFLE_SPECIFIC_CORRELATION_MISMATCH_EXECUTED=NO; CONSUMER_REDUCER_MISSING_REQUESTED_EXECUTED=YES; CONSUMER_REDUCER_UNREQUESTED_EXECUTED=NO; CONSUMER_REDUCER_DUPLICATE_EXECUTED=NO; CONSUMER_REDUCER_MIXED_DUPLICATE_ERROR_EXECUTED=NO; CONSUMER_REDUCER_EXHAUSTIVE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.748
Inspect whether existing test utilities can construct a deliberately mismatched OFLE response header and route it through current NetworkClient/ConsumerNetworkClient without production changes. If only generic mismatch coverage exists, preserve distinction. No implementation/V21.


## 80. AB104.748 — OFLE correlation-mismatch injection boundary
Commit: 8827c7a9273cee0d8695946f9ed9604abd14bc2a

OffsetForLeaderEpochClientTest uses ConsumerNetworkClient + MockClient. MockClient.prepareResponse(AbstractResponse) stores a response body and later creates ClientResponse using request.makeHeader(version), so this normal mock path does not provide an independently serialized response header/correlation ID. Generic RequestTestUtils.serializeResponseWithHeader supports arbitrary correlation IDs, and a generic ForwardingManagerTest deliberately executes requestCorrelationId+1, but that path is not OFLE-specific and is not routed through OffsetForLeaderEpochClientTest.

Therefore: GENERIC_CORRELATION_MISMATCH_EXECUTED=YES; OFLE_CORRELATION_MISMATCH_WIRE_CONSTRUCTION=YES via generic utility; OFLE_CORRELATION_MISMATCH_THROUGH_CONSUMER_CLIENT=NO/NOT_ESTABLISHED; OFLE_CORRELATION_MISMATCH_DEDICATED_TEST=NO. Response-body mocking must not be conflated with wire-level response-header mismatch.

## EXACT CURRENT RESUME POINT — AB104.749
Inspect MockClient/KafkaClient test infrastructure plus existing Selector/NetworkClient tests for the smallest current lower-level path that can inject RequestTestUtils.serializeResponseWithHeader(OFLE, version, wrongCorrelationId) and observe actual correlation-mismatch behavior. If unavailable, record exact blocker. No production changes/V21.


## 81. AB104.749 — OFLE lower-level correlation injection path
Commit: 8c314ea5b5f140f53c163efa836178109ec2de68

Current NetworkClientTest provides the needed lower-level mechanism: real NetworkClient + MockSelector, a real ClientRequest/in-flight correlation, and raw NetworkReceive injection using RequestTestUtils.serializeResponseWithHeader(...), whose correlation ID is independently supplied. NetworkClient.handleCompletedReceives() passes the raw payload to NetworkClient.parseResponse(...), which delegates to AbstractResponse parsing and propagates CorrelationIdMismatchException for ordinary request correlations.

But current evidence does NOT establish an OFLE-specific mismatch execution. Existing raw receive examples use Produce/telemetry and matching correlation IDs. Repository search did not establish a dedicated CorrelationIdMismatchException assertion through selector.completeReceive. Therefore: NETWORKCLIENT_RAW_RESPONSE_INJECTION=YES; ARBITRARY_RESPONSE_CORRELATION_CONSTRUCTION=YES; GENERIC_RAW_RESPONSE_PATH_EXECUTED=YES; OFLE_RAW_RESPONSE_PATH_EXECUTED=NO; OFLE_CORRELATION_MISMATCH_EXECUTED=NO; OFLE_CORRELATION_MISMATCH_EXCEPTION_ASSERTED=NO; PRODUCTION_CHANGE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.750
Inspect relevant NetworkClientTest setup/request-version helpers and determine whether a minimal OFLE mismatch test can be specified entirely from existing test infrastructure; separately inspect MockSelector completion semantics and NetworkClient.poll to establish whether the exception surfaces directly or through disconnect/error handling. Research only; do not implement test or production code.


## 82. AB104.750 — MockSelector/NetworkClient exception surface
Commit: aab35df8b2757f1563885d89ecfd4ceacba706a9

MockSelector.completeReceive(NetworkReceive) directly appends to completedReceives; it performs no parsing/validation/disconnect. NetworkClient.poll() invokes selector.poll(), then handleCompletedReceives(), which calls NetworkClient.parseResponse(receive.payload(), req.header). For ordinary request correlations, NetworkClient.parseResponse propagates CorrelationIdMismatchException. There is no catch around parseResponse in handleCompletedReceives, so a deliberately mismatched raw response should surface from NetworkClient.poll() when a matching in-flight request exists.

Minimal OFLE mismatch test is therefore specifiable entirely with existing infrastructure, without production changes: real OFLE request builder/version → send → real correlation ID → OffsetsForLeaderEpochResponse → serializeResponseWithHeader with same OFLE version and non-matching correlation → MockSelector.completeReceive(NetworkReceive) → assert poll throws CorrelationIdMismatchException. This remains TEST DESIGN ONLY; not executed.

Status: MOCKSELECTOR_RAW_RECEIVE_INJECTION=YES; POLL_TO_HANDLE_COMPLETED_RECEIVE=YES; MISMATCH_EXCEPTION_PROPAGATION_PATH=SOURCE_ESTABLISHED; MINIMAL_OFLE_TEST_SPECIFIABLE=YES; MINIMAL_OFLE_TEST_EXECUTED=NO; OFLE_CORRELATION_MISMATCH_ASSERTED=NO; OFLE_REDUCER_EXHAUSTIVE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.751
Inspect current OFLE request builder/version setup in NetworkClientTest or adjacent consumer tests, determine exact supported OFLE version and required request data for the minimal test specification, and verify whether correlationId+1 is safe relative to reserved SASL ranges. Do not implement.


## 83. AB104.751 — OFLE builder/version and correlation-range audit
Commit: 52c4ba39d175c7da4ba830ec7249dbef4b84c2a1

Current OffsetsForLeaderEpochRequest.Builder.forConsumer accepts versions 3 through ApiKeys.OFFSET_FOR_LEADER_EPOCH.latestVersion() and sets replicaId=-1. Follower builder is version 4 only. Version 3 is therefore the simplest stable consumer target for the proposed wire mismatch experiment. A minimal request can contain one topic/partition/epoch.

SaslClientAuthenticator reserves only the top 8 signed-int correlation IDs: MAX_RESERVED_CORRELATION_ID=Integer.MAX_VALUE and MIN_RESERVED_CORRELATION_ID=MAX-7. Therefore blind request.correlationId()+1 is not unconditionally safe; a deterministic non-reserved mismatch must be selected/checked.

Status: OFLE_CONSUMER_BUILDER_MIN_VERSION=3; OFLE_CONSUMER_BUILDER_RANGE=3..latestVersion; OFLE_FOLLOWER_BUILDER_VERSION=4; OFLE_MINIMAL_REQUEST_SPECIFIABLE=YES; BLIND_CORRELATION_PLUS_ONE_UNCONDITIONALLY_SAFE=NO; NON_RESERVED_MISMATCH_CONSTRUCTIBLE=YES; MINIMAL_OFLE_MISMATCH_TEST_SPECIFIABLE=YES; MINIMAL_OFLE_MISMATCH_EXECUTED=NO; OFLE_CORRELATION_MISMATCH_ASSERTED=NO; OFLE_REDUCER_EXHAUSTIVE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.752
Inspect NetworkClientTest construction/correlation allocator to determine whether a fresh NetworkClient test deterministically begins at a low non-reserved correlation ID. Then inspect existing OffsetsForLeaderEpochResponse construction helpers to specify the smallest valid response object for the wire mismatch test. Research only; do not implement.


## 84. AB104.752 — NetworkClient correlation allocator and minimal OFLE response
Commit: b6f9a0ad4caa355e2cbedf1a0dc4fcaf8a641176

NetworkClientTest resets MockSelector per test and uses a real NetworkClient. Its awaitReady() comment establishes ApiVersions bootstrap response correlation 0, but this does not establish that a subsequently created OFLE ClientRequest has correlation 0 or 1. The actual ClientRequest exposes request.correlationId(), so the safest design is to observe the actual ID and inject a deliberately non-reserved, non-equal response ID; no blind +1 invariant is needed.

RequestResponseTest contains a generic createLeaderEpochResponse() fixture with multiple partitions. For mismatch testing, the semantic response is rejected at header correlation validation before OFLE reducer processing, so a structurally valid one-topic/one-partition response is sufficient in principle.

Status: NETWORKCLIENT_TEST_REAL_CLIENT=YES; SELECTOR_RESET_PER_TEST=YES; BOOTSTRAP_APIVERSIONS_CORRELATION_0=SOURCE_ESTABLISHED; FIXED_OFLE_REQUEST_CORRELATION_0_OR_1=NOT_ESTABLISHED; ACTUAL_REQUEST_CORRELATION_AVAILABLE=YES; EXPLICIT_NON_RESERVED_MISMATCH=REQUIRED; GENERIC_OFLE_RESPONSE_FIXTURE=YES; MINIMAL_ONE_TOPIC_ONE_PARTITION_RESPONSE=SPECIFIABLE; MINIMAL_OFLE_MISMATCH_EXECUTED=NO; OFLE_CORRELATION_MISMATCH_ASSERTED=NO; OFLE_REDUCER_EXHAUSTIVE=NO; NEXO_IMPLEMENTED=NO; NEXO_RUNTIME_EXECUTED=NO; NEXO_CORRECTNESS_VERIFIED=NO; TLC=PENDING.

## EXACT CURRENT RESUME POINT — AB104.753
Inspect ClientRequest/RequestHeader correlation allocator itself (where NetworkClient obtains the next correlation ID) and determine whether a test-local deterministic method exists to force or observe a safe non-reserved mismatch without production changes. Then inspect exact OFLE response data constructors for a one-topic/one-partition response. Research only; do not implement.


## 85. AB104.753 — OFLE correlation allocator + minimal response audit
Commit: c2337e0c329bf9bf1399129494c7d379997852db
Research file: docs/nexo/NEXO_AB104_753_OFLE_CORRELATION_ALLOCATOR_MINIMAL_RESPONSE_AUDIT_2026-09-28.md

Current Kafka NetworkClient source establishes that the correlation allocator is owned by NetworkClient: the `correlation` field starts at 0, `nextCorrelationId()` is package-visible for testing, skips the reserved SASL range, and `newClientRequest(...)` passes the allocated value into ClientRequest. RequestHeader only stores/serializes the supplied correlation ID and does not allocate it.

Therefore a fresh NetworkClient has deterministic allocator initialization at 0, but the proposed OFLE test must observe the actual ClientRequest.correlationId() rather than assume the OFLE request is 0 or 1, because bootstrap/internal requests may consume earlier IDs. The test-visible allocator helper exists but consuming an ID through it changes allocator state, so observation is preferable.

Safe mismatch design: after observing the actual request ID, inject any response correlation ID that is both different and outside the reserved SASL range. Blind +1 is unnecessary and should not be treated as an invariant.

Current OffsetsForLeaderEpochResponse accepts OffsetForLeaderEpochResponseData directly. Existing test construction demonstrates one topic result containing EpochEndOffset records with topic, partition, error code, leader epoch and end offset. A one-topic/one-partition structurally valid response is sufficient in principle because correlation validation precedes OFLE reducer processing.

Status remains:
OFLE_CORRELATION_ALLOCATOR_SOURCE_VERIFIED=YES
NETWORKCLIENT_INITIAL_CORRELATION=0
TEST_VISIBLE_NEXT_CORRELATION_HELPER=YES
ACTUAL_CLIENTREQUEST_CORRELATION_OBSERVABLE=YES
REQUESTHEADER_ALLOCATION=NO
MINIMAL_ONE_TOPIC_ONE_PARTITION_RESPONSE=SPECIFIABLE
MINIMAL_OFLE_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.754
Inspect exact current NetworkClientTest/OFLE test imports and assertion idioms needed to route a real OFLE request through MockSelector.completeReceive, and determine whether an existing test can execute the minimal mismatch path without production changes. If execution is still not performed, freeze the executable recipe and continue remaining response-shape evidence. No implementation/V21.


## 86. AB104.754 — OFLE mismatch execution-path audit
Commit: b53695a8552cb57cdc7f22acb3d946629b9e7a05
Research file: docs/nexo/NEXO_AB104_754_OFLE_MISMATCH_EXECUTION_PATH_AUDIT_2026-09-28.md

Current Kafka NetworkClientTest already contains the required lower-level pattern: awaitReady → real ClientRequest → send → poll until in-flight → RequestTestUtils.serializeResponseWithHeader(...) → MockSelector.completeReceive(NetworkReceive) → NetworkClient.poll(). It already imports JUnit assertThrows, NetworkReceive, RequestTestUtils and MockSelector. Therefore no new infrastructure or production modification is required in principle.

ClientRequest exposes requestBuilder(), apiKey(), and correlationId(); AbstractRequest.Builder exposes latestAllowedVersion(). The dedicated OffsetForLeaderEpochClientTest remains unsuitable for a wire-level mismatch because ConsumerNetworkClient + MockClient constructs the response using the request's own header path. The lower-level NetworkClientTest boundary is the correct execution surface.

Minimal OFLE mismatch recipe is fully specifiable: consumer OFLE builder → supported version → real ClientRequest → observe correlation → choose different non-reserved response correlation → one-topic/one-partition OffsetsForLeaderEpochResponse → serialize with OFLE response header → inject raw NetworkReceive → assert NetworkClient.poll() throws CorrelationIdMismatchException.

This is still NOT EXECUTED. Source evidence establishes the path, but execution must not be inferred.

Status:
NETWORKCLIENT_RAW_RECEIVE_INJECTION=YES
OFLE_REQUEST_BUILDER_PATH=SPECIFIABLE
OFLE_RESPONSE_HEADER_SERIALIZATION=YES
DELIBERATE_NONMATCHING_CORRELATION_CONSTRUCTION=YES
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.755
Inspect the current OFLE builder's required request-data types/constructors and the exact version selected by the client path; determine whether the minimal OFLE mismatch test can be specified byte-for-byte from existing public/test-visible constructors. Preserve NOT EXECUTED until an actual test run is observed. No implementation/V21.


## 87. AB104.755 — OFLE minimal request construction audit
Commit: 5515c852926cb859cfe7f7ae697b1d978c417ac9
Research file: docs/nexo/NEXO_AB104_755_OFLE_MINIMAL_REQUEST_CONSTRUCTION_AUDIT_2026-09-28.md

Exact current source confirms the minimal consumer OFLE request is directly constructible from existing message types. Builder.forConsumer receives OffsetForLeaderTopicCollection, creates OffsetForLeaderEpochRequestData, sets replicaId=-1 and permits versions 3..latest. The production helper OffsetsForLeaderEpochUtils.prepareRequest constructs each topic with OffsetForLeaderTopic, each partition with OffsetForLeaderPartition, then sets partition, leaderEpoch and currentLeaderEpoch before calling Builder.forConsumer.

Therefore a one-topic/one-partition request is fully specifiable without hidden factories. Version 3 is the clean minimum consumer target. This is construction evidence, not execution evidence.

Status:
MINIMAL_OFLE_REQUEST_CONSTRUCTION=BYTE/CONSTRUCTOR_SPECIFIABLE
CONSUMER_MIN_VERSION=3
CONSUMER_BUILDER_RANGE=3..latest
SINGLE_TOPIC_SINGLE_PARTITION=SPECIFIABLE
RESPONSE_SINGLE_TOPIC_SINGLE_PARTITION=SPECIFIABLE
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.756
Inspect NetworkClient.parseResponse / handleCompletedReceives at exact source level and verify the mismatch is surfaced before OFLE response body/reducer processing. Do not count source-level proof as executed behavior.


## 88. AB104.756 — OFLE correlation exception boundary audit
Commit: 5eede126aaee1de7a458e73726c613b8f31a1bf4
Research file: docs/nexo/NEXO_AB104_756_OFLE_CORRELATION_EXCEPTION_BOUNDARY_AUDIT_2026-09-28.md

Source-level result: NetworkClient.handleCompletedReceives obtains the in-flight request and immediately calls NetworkClient.parseResponse(receive.payload(), req.header). parseResponse delegates to AbstractResponse.parseResponse and rethrows CorrelationIdMismatchException for normal non-reserved correlations. This occurs before throttle handling, response dispatch, completion callback, or OFLE reducer processing. Therefore the planned mismatch reaches the header-validation boundary before the OFLE body is processed.

Important caveat preserved: inFlightRequests.completeNext(source) occurs before parseResponse, so the request is removed from the in-flight collection before the mismatch is surfaced. Higher-level retry/recovery semantics remain unverified.

Status:
NETWORKCLIENT_PARSE_RESPONSE_BOUNDARY=SOURCE_VERIFIED
CORRELATION_CHECK_PRECEDES_OFLE_BODY_PROCESSING=SOURCE_VERIFIED
NORMAL_NON_RESERVED_MISMATCH_RETHROWN=SOURCE_VERIFIED
SASL_RESERVED_EXCEPTION_SPECIAL_CASE=SOURCE_VERIFIED
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.757
Inspect AbstractResponse.parseResponse and ResponseHeader parsing at exact source level, including where correlation IDs are compared and whether the API body is parsed only after that comparison. Preserve NOT EXECUTED until a real OFLE test run is observed.


## 89. AB104.757 — AbstractResponse correlation parse-order audit
Commit: 0278d04085a9f6234796bf1a8d42803191d43302
Research file: docs/nexo/NEXO_AB104_757_ABSTRACT_RESPONSE_CORRELATION_PARSE_ORDER_AUDIT_2026-09-28.md

Exact source result: AbstractResponse.parseResponse first parses the versioned ResponseHeader, then compares requestHeader.correlationId() with responseHeader.correlationId(). Only if they match does it instantiate ByteBufferAccessor over the post-header buffer and dispatch the API body parser. For OFFSET_FOR_LEADER_EPOCH, the dispatch target is OffsetsForLeaderEpochResponse.parse(readable, version). Therefore a correlation mismatch prevents OFLE body parsing.

Precision preserved: header parsing itself occurs before comparison and advances the buffer. The proven boundary is correlation validation BEFORE API body parsing, not “zero parsing occurred.”

Status:
RESPONSE_HEADER_PARSE_SOURCE_VERIFIED=YES
CORRELATION_COMPARE_SOURCE_VERIFIED=YES
CORRELATION_COMPARE_PRECEDES_API_BODY_PARSE=YES
OFLE_BODY_PARSE_DISPATCH_SOURCE_VERIFIED=YES
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.758
Inspect exact OFLE response parser entry point and generated response-data constructor/schema path to determine whether a structurally valid minimal body is sufficient for the mismatch test and whether any version-specific response-header/body coupling remains relevant. Preserve NOT EXECUTED.


## 90. AB104.758 — OFLE response parser/schema audit
Commit: 00979765c2a59328f77a1971c87cf26f017a383c
Research file: docs/nexo/NEXO_AB104_758_OFLE_RESPONSE_PARSER_SCHEMA_AUDIT_2026-09-28.md

Exact source confirms OffsetsForLeaderEpochResponse.parse(readable, version) constructs OffsetForLeaderEpochResponseData(readable, version). AbstractResponse dispatches to this parser only after correlation validation. Existing Kafka tests construct OffsetForLeaderEpochResponseData with OffsetForLeaderTopicResult and EpochEndOffset, confirming the planned one-topic/one-partition response shape.

The body uses the same API version supplied by the request header; no separate response-version selector is required for the mismatch test. A structurally valid minimal body is preferred so the test isolates correlation validation rather than malformed-body behavior.

Status:
OFLE_RESPONSE_PARSER_SOURCE_VERIFIED=YES
OFLE_RESPONSE_DATA_CONSTRUCTOR_PATTERN=SOURCE_VERIFIED
ONE_TOPIC_ONE_PARTITION_RESPONSE=SPECIFIABLE
BODY_VERSION_COMES_FROM_REQUEST_API_VERSION=SOURCE_VERIFIED
SEPARATE_RESPONSE_VERSION_SELECTOR_REQUIRED=NO
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.759
Inspect RequestTestUtils.serializeResponseWithHeader and underlying serialization to prove the chosen response correlation ID is encoded into the wire header with the selected OFLE version/body. Preserve NOT EXECUTED.


## 91. AB104.759 — OFLE wire header serialization audit
Commit: 912f334ce715143f6625aced0392939e8356f6b4
Research file: docs/nexo/NEXO_AB104_759_OFLE_WIRE_HEADER_SERIALIZATION_AUDIT_2026-09-28.md

Exact source chain: RequestTestUtils.serializeResponseWithHeader(response, version, correlationId) -> new ResponseHeader(correlationId, response.apiKey().responseHeaderVersion(version)) -> AbstractResponse.serializeWithHeader -> RequestUtils.serialize. RequestUtils writes the header first, then the API message using the selected API version. Thus the deliberately chosen correlation ID is actually serialized into the wire header, not merely retained as test metadata.

The complete mismatch construction is now source-specifiable: valid minimal OFLE response + actual request API version + different non-reserved correlation ID -> serializeResponseWithHeader -> NetworkReceive injection. This is still construction evidence, not execution evidence.

Status:
RESPONSE_CORRELATION_ID_WIRE_ENCODED=SOURCE_VERIFIED
RESPONSE_HEADER_VERSION_DERIVED_FROM_OFLE_VERSION=SOURCE_VERIFIED
OFLE_BODY_SERIALIZED_AFTER_HEADER=SOURCE_VERIFIED
NON_RESERVED_MISMATCH_CONSTRUCTION=SPECIFIABLE
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.760
Inspect NetworkReceive construction and MockSelector.completeReceive/poll path once more at exact source level, then freeze the complete no-production-change OFLE mismatch test recipe. Do not execute yet unless the mission explicitly transitions to execution; preserve NOT EXECUTED.


## 92. AB104.760 — OFLE NetworkReceive injection audit
Commit: be0e5bec8f990a17c35015212e71e85c63f8b7ad
Research file: docs/nexo/NEXO_AB104_760_OFLE_NETWORKRECEIVE_INJECTION_AUDIT_2026-09-28.md

Exact source confirms NetworkReceive(String, ByteBuffer) directly carries the serialized payload; MockSelector.completeReceive only queues it; NetworkClient.poll processes completed receives through handleCompletedReceives and parseResponse. Existing repository tests already use this same injection structure with real NetworkReceive + poll.

The complete no-production-change OFLE mismatch recipe is now frozen: real NetworkClient/MockSelector -> real consumer OFLE ClientRequest -> observe actual correlation/version -> choose different non-reserved response correlation -> valid minimal OFLE response -> serializeResponseWithHeader -> NetworkReceive injection -> poll -> assert CorrelationIdMismatchException.

This remains test-design/source evidence only. No OFLE-specific mismatch test has been executed.

Status:
NETWORKRECEIVE_DIRECT_PAYLOAD_CONSTRUCTION=SOURCE_VERIFIED
MOCKSELECTOR_COMPLETE_RECEIVE=SOURCE_VERIFIED
NETWORKCLIENT_POLL_TO_COMPLETED_RECEIVES=SOURCE_VERIFIED
EXACT_INJECTION_PATTERN_EXISTING_IN_REPO=YES
OFLE_SPECIFIC_MISMATCH_RECIPE=FROZEN
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.761
Inspect existing NetworkClientTest setup/fixture helpers needed to instantiate the real OFLE ClientRequest without production changes, and determine the smallest concrete test location/fixture reuse. Preserve the frozen recipe and NOT EXECUTED.


## 93. AB104.761 — OFLE NetworkClientTest fixture audit
Commit: 3ccb897bd7bb2b4bc97a5c2b8d1ef8d0e57b0995
Research file: docs/nexo/NEXO_AB104_761_OFLE_NETWORKCLIENT_TEST_FIXTURE_AUDIT_2026-09-28.md

Current NetworkClientTest already supplies the smallest reusable real-client harness: MockTime, MockSelector, singleton Node, TestMetadataUpdater, real NetworkClient, awaitReady(), newClientRequest(), send(), poll(), actual ClientRequest.correlationId(), raw NetworkReceive injection, and assertThrows. awaitReady must precede OFLE request construction because bootstrap/API-version traffic can consume correlation IDs.

The OFLE mismatch test can live directly in clients/src/test/java/org/apache/kafka/clients/NetworkClientTest.java and requires only test-source imports/message construction. No production source change is required.

Status:
NETWORKCLIENTTEST_REUSABLE_REAL_CLIENT=YES
MOCKSELECTOR_REUSABLE=YES
AWAITREADY_REUSABLE=YES
REAL_CLIENTREQUEST_CONSTRUCTION=SOURCE_VERIFIED
ACTUAL_CORRELATION_OBSERVABLE=YES
OFLE_BUILDER_TEST_ONLY_ADDITION=REQUIRED
PRODUCTION_CHANGE_REQUIRED=NO
SMALLEST_TEST_LOCATION=NetworkClientTest.java
OFLE_SPECIFIC_MISMATCH_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.762
Inspect exact OFLE test-only imports and concrete one-topic/one-partition builder syntax against current Kafka test sources, then produce final compile-level test skeleton. Preserve NOT EXECUTED unless execution is explicitly authorized.


## 94. AB104.762 — OFLE compile-level test skeleton audit
Commit: afe0a7b1f23535714c469deb1bf1433d4f342a23
Research file: docs/nexo/NEXO_AB104_762_OFLE_COMPILE_SKELETON_AUDIT_2026-09-28.md

Source verification established exact test-only generated message imports and concrete one-topic/one-partition construction for both OFLE request and response. Consumer Builder.forConsumer supports version 3+. Existing production helper confirms OffsetForLeaderTopic/OffsetForLeaderPartition construction. Response uses OffsetForLeaderTopicResult + EpochEndOffset with partition/errorCode/leaderEpoch/endOffset.

The compile-level skeleton is fully specified and requires no production change. It remains uncompiled/unexecuted. The planned assertion is CorrelationIdMismatchException from NetworkClient.poll after injecting a valid OFLE response serialized with a different non-reserved correlation ID.

Status:
OFLE_REQUEST_IMPORTS_SOURCE_VERIFIED=YES
OFLE_REQUEST_ONE_TOPIC_ONE_PARTITION=SOURCE_VERIFIED
OFLE_RESPONSE_ONE_TOPIC_ONE_PARTITION=SOURCE_VERIFIED
REQUEST_VERSION_3_SUPPORTED=YES
TEST_SKELETON_COMPILE_LEVEL=SPECIFIED
TEST_COMPILED=NO
TEST_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.763
Inspect current NetworkClientTest correlation-mismatch tests and helper naming to determine whether the final OFLE test should reuse an existing assertion/helper or add a dedicated test method. Preserve NOT EXECUTED.


## 94. AB104.762 — OFLE compile-level test skeleton audit
Commit: 7cf73582fb95e6aa63209c8f05c571a4c4b5e152
Research file: docs/nexo/NEXO_AB104_762_OFLE_COMPILE_SKELETON_AUDIT_2026-09-28.md

Exact generated nested message types and construction syntax are source-confirmed. Minimal request: OffsetForLeaderTopicCollection -> OffsetForLeaderTopic("test") -> OffsetForLeaderPartition(partition=0, leaderEpoch=1, currentLeaderEpoch=1) -> Builder.forConsumer(topics), with supported minimum version 3. Minimal response: OffsetForLeaderEpochResponseData -> OffsetForLeaderTopicResult("test") -> EpochEndOffset(partition=0, Errors.NONE, leaderEpoch=1, endOffset=0) -> OffsetsForLeaderEpochResponse.

The compile-level skeleton is now specified with exact test-only imports. It has NOT been compiled or executed. Existing NetworkClientTest already provides Errors and assertThrows imports; the remaining additions are OFLE message/request/response classes plus CorrelationIdMismatchException.

Status:
OFLE_REQUEST_IMPORTS_SOURCE_VERIFIED=YES
OFLE_REQUEST_ONE_TOPIC_ONE_PARTITION=SOURCE_VERIFIED
OFLE_RESPONSE_ONE_TOPIC_ONE_PARTITION=SOURCE_VERIFIED
REQUEST_VERSION_3_SUPPORTED=YES
TEST_SKELETON_COMPILE_LEVEL=SPECIFIED
TEST_COMPILED=NO
TEST_EXECUTED=NO
OFLE_CORRELATION_MISMATCH_ASSERTED=NO
OFLE_REDUCER_EXHAUSTIVE=NO
NEXO_IMPLEMENTED=NO
NEXO_RUNTIME_EXECUTED=NO
NEXO_CORRECTNESS_VERIFIED=NO
TLC=PENDING

## EXACT CURRENT RESUME POINT — AB104.763
Inspect current NetworkClientTest correlation-mismatch tests and helper naming to determine whether the final OFLE test should reuse an existing assertion/helper or add a dedicated test method. Preserve NOT EXECUTED.


## 95. AB104.743R — evidence re-audit
Commit: 3d2a3de6174e034a5f27c9d1d07a9f8ea8f431b8
AB104.743 was re-investigated directly against Kafka source/test code rather than accepted from prior notes. Confirmed: OFLE reducer semantics, correlation validation order, NetworkClientTest response injection helpers, and arbitrary correlation serialization. Not confirmed: direct NetworkClient mismatch assertion, OFLE-specific mismatch execution, duplicate/unrequested/missing OFLE test execution, or exhaustive reducer coverage.

Important correction: server ForwardingManagerTest.testResponseCorrelationIdMismatch deliberately constructs requestCorrelationId + 1, but asserts UNKNOWN_SERVER_ERROR after an Envelope/ForwardingManager path; this must NOT be promoted to direct NetworkClient/OFLE CorrelationIdMismatchException execution evidence.

### Exact next re-audit
AB104.744R: directly inspect the response-header/version serialization tests and OFLE RequestResponseTest cases, then compare their actual assertions with the claims made in AB104.744. Preserve all gaps and do not execute unless explicitly required.


## 96. AB104.744R — evidence re-audit
Commit: 26024bfb66d2bcf28786a4b8dd4771eb16f04a0c
Direct source/test inspection confirms:
- RequestResponseTest.testSerialization() includes OFFSET_FOR_LEADER_EPOCH in the generic all-ApiKey/all-supported-version serialization matrix.
- RequestResponseTest explicitly maps OFLE to createLeaderEpochRequestForReplica(1).
- Generic response-header serialization/parsing checks correlation ID round-trip.
- OffsetFetcherTest has real valid OFLE response construction and consumer-layer request matching/validation, plus a reusable response helper.

Not established:
- dedicated OFLE response-version assertions independent of generic matrix;
- OFLE correlation mismatch execution;
- duplicate/unrequested/conflicting duplicate OFLE response tests;
- exhaustive reducer matrix.

Exact next mission: AB104.745R — re-audit the claimed OFLE client-test coverage directly, including empty/missing response, NONE, authorization, retriable errors, and whether duplicate/unrequested/correlation mismatch are actually executed.


## 97. AB104.745R — evidence re-audit
Commit: ebc44a47c64e6bec5391106c48b2140a105a405d
Direct inspection of OffsetForLeaderEpochClientTest.java confirms five tests: empty response, unexpected empty response, OK/NONE response, unauthorized topic, and retriable error.

Important precision correction:
- requested partition absent from an otherwise empty response = EXECUTED/ASSERTED;
- response containing an unrequested partition = NOT EXECUTED;
- duplicate response partition = NOT EXECUTED;
- conflicting duplicate/order = NOT EXECUTED;
- OFLE correlation mismatch = NOT EXECUTED;
- exhaustive reducer error matrix = NOT EXECUTED.

Exact next mission: AB104.746R — re-audit repository-wide indirect OFLE coverage for unrequested response partitions and duplicate/conflicting response shapes, distinguishing production semantics from tests that actually execute those cases.


## 98. AB104.746R — repository-wide OFLE shape re-audit
Commit: 2ec621fa53195ee4e119e3d45485d51c10f5b708
Repository search and direct OffsetFetcherTest inspection found strong valid expected-partition integration coverage, including request matching against expected partition sets. No dedicated OFLE execution was found for an unrequested response partition, duplicate response partition, or conflicting duplicate ordering. Generic duplicate tests in other Kafka APIs are not transferable evidence.

Status:
UNREQUESTED_OFLE_RESPONSE_EXECUTED=NO
DUPLICATE_OFLE_RESPONSE_EXECUTED=NO
CONFLICTING_DUPLICATE_OFLE_RESPONSE_EXECUTED=NO
VALID_EXPECTED_PARTITION_INTEGRATION=YES

Exact next mission: AB104.747R — re-audit OFLE protocol-version boundary evidence, especially whether the all-version RequestResponseTest actually gives OFLE response round-trip assertions versus only generic API coverage, and inspect MessageTest/version-specific OFLE cases.


## 99. AB104.747R — OFLE protocol-version boundary re-audit
Commit: 6d5c8243086e9cc550495106890086932a99941a
Direct inspection shows MessageTest has OFLE-specific request version coverage, but no analogous dedicated response-version test. More importantly, RequestResponseTest.testSerialization() iterates versions generically, while its OFLE request factory ignores the loop version and builds the follower request with the version-4-only builder; its OFLE response factory also does not receive the loop version. Therefore generic all-API serialization must not be counted as a dedicated OFLE response-version matrix.

Status:
OFLE_REQUEST_VERSION_TEST=YES
OFLE_RESPONSE_VERSION_TEST=NO
GENERIC_ALL_API_SERIALIZATION=YES_BUT_NOT_DEDICATED_OFLE_VERSION_EVIDENCE
OFLE_RESPONSE_VERSION_TRANSITIONS=NOT_ESTABLISHED

Exact next mission: AB104.748R — re-audit the OFLE correlation-mismatch injection path, including MockClient/ConsumerNetworkClient limitations and lower-level NetworkClient/MockSelector construction, without treating a recipe as executed evidence.


## 100. AB104.748R — OFLE correlation-mismatch path re-audit
Commit: 7d86a91f264f005fe34e5d65ea8639371f28737b
Direct inspection confirms OffsetForLeaderEpochClientTest uses ConsumerNetworkClient + MockClient normal prepared responses only; no independent response correlation ID or mismatch assertion exists. NetworkClientTest does provide a real NetworkClient + real ClientRequest + actual correlationId + serializeResponseWithHeader with caller-selected correlation + MockSelector.completeReceive injection, but its demonstrated execution uses matching IDs and non-OFLE responses. Therefore the raw mechanism is evidenced, but OFLE-specific mismatch execution remains NO.

Status:
ARBITRARY_RESPONSE_CORRELATION_CONSTRUCTION=YES
RAW_NETWORKCLIENT_INJECTION=YES
NORMAL_MATCHING_EXECUTION=YES
OFLE_SPECIFIC_MISMATCH_EXECUTION=NO
DIRECT_OFLE_MISMATCH_ASSERTION=NO

Exact next mission: AB104.749R — re-audit the lower-level NetworkClient correlation path and exception surface, verifying completeNext/parseResponse behavior and whether any existing test actually asserts CorrelationIdMismatchException rather than merely constructing mismatched data.


## 100. AB104.748R2 — correlation injection correction/confirmation
Commit: c8b1527a27466f2dce120127c7cdd4259e32dbb2
Fresh source inspection confirms the 748R boundary. MockClient response helpers derive ClientResponse headers from the pending request, so they do not provide independent response-correlation injection. NetworkClientTest does provide independent wire construction through serializeResponseWithHeader(response, version, correlationId) plus NetworkReceive/MockSelector injection and NetworkClient.poll; inspected tests exercise matching IDs. No OFLE-specific mismatch execution or direct NetworkClient mismatch assertion was found.

Status:
MOCKCLIENT_INDEPENDENT_CORRELATION=NO
LOW_LEVEL_ARBITRARY_CORRELATION=YES
LOW_LEVEL_MATCHING_EXECUTION=YES
OFLE_MISMATCH_EXECUTION=NO
DIRECT_OFLE_NETWORKCLIENT_MISMATCH_ASSERTION=NO

Exact next mission: AB104.749R — re-audit the lower-level NetworkClient/MockSelector path and determine whether the existing raw injection infrastructure is actually sufficient to execute an OFLE mismatch, while keeping “constructable recipe” separate from “executed evidence.”


## 100. AB104.748R — OFLE correlation mismatch re-audit
Commit: 33cb809648a51b9b71f4a83d843397820df356ac
Direct recheck confirms: OffsetForLeaderEpochClientTest only uses normal MockClient responses; no independently selected response correlation ID and no mismatch assertion. NetworkClientTest has real NetworkClient + ClientRequest + MockSelector + raw NetworkReceive injection, but its inspected matching-response path uses the request correlation ID. RequestTestUtils permits arbitrary correlation IDs. Repository search found no dedicated NetworkClientTest CorrelationIdMismatchException assertion.

Status:
OFLE_MISMATCH_EXECUTED=NO
DIRECT_NETWORKCLIENT_MISMATCH_ASSERTION=NO
RAW_INJECTION_MECHANISM=YES
ARBITRARY_CORRELATION_CONSTRUCTION=YES
MATCHING_NETWORKCLIENT_EXECUTION=YES

Exact next mission: AB104.749R — re-audit the lower-level NetworkClient/MockSelector path and determine precisely whether any existing test executes an independently correlated response through `completeReceive`, including exception surface and request lifecycle, without treating the available recipe as executed evidence.


## 101. AB104.749R — lower-level NetworkClient mismatch re-audit
Commit: 930a354aa7e0aa1032657c07d67f8a354eefa135
Direct NetworkClient source inspection confirms `handleCompletedReceives` calls `inFlightRequests.completeNext(source)` before `parseResponse(receive.payload(), req.header)`. `parseResponse` rethrows ordinary non-reserved CorrelationIdMismatchException; SASL-reserved mismatch has a special SchemaException branch. Thus a mismatch reaches parsing after the corresponding in-flight request has already been removed. This is source-derived lifecycle evidence, not executed-test evidence.

Status:
RAW_RECEIVE_INJECTION=YES
MATCHING_RESPONSE_EXECUTION=YES
MISMATCH_CONSTRUCTION=YES
NETWORKCLIENT_MISMATCH_EXECUTION=NO
DIRECT_MISMATCH_ASSERTION=NO
POST_MISMATCH_INFLIGHT_BEHAVIOR=SOURCE_DERIVED_ONLY

Exact next mission: AB104.750R — re-audit the MockSelector/NetworkClient exception surface: how `completeReceive` queues the receive, how `poll()` reaches `handleCompletedReceives`, whether the mismatch escapes/can be asserted at the test boundary, and whether any existing test already exercises that exact surface.


## 102. AB104.750R — MockSelector → NetworkClient.poll() re-audit
Commit: 0a192dcfabe104209fcdfcaec12525d4c1c2c410
Direct inspection confirms `MockSelector.completeReceive()` appends the `NetworkReceive` directly to `completedReceives`; `NetworkClient.poll()` reaches `handleCompletedReceives()`. Existing `NetworkClientTest.checkSimpleRequestResponse()` executes this completeReceive→poll path with a matching correlation ID. No dedicated execution was found where an independently correlated response traverses the full path and asserts the mismatch exception.

Status:
MOCKSELECTOR_DIRECT_RECEIVE_INJECTION=YES
MOCKSELECTOR_POLL_PATH=YES
MATCHING_COMPLETE_RECEIVE_TO_POLL=YES
INDEPENDENT_CORRELATION_CONSTRUCTION=YES
INDEPENDENT_CORRELATION_FULL_PATH=NO
DIRECT_EXCEPTION_ASSERTION=NO
POST_MISMATCH_INFLIGHT_BEHAVIOR=SOURCE_DERIVED_ONLY

Next exact mission: AB104.751R — inspect `InFlightRequests.completeNext`, connection/request ordering, and tests around multiple in-flight requests to determine whether a correlation mismatch can consume the wrong queued request and what evidence exists for FIFO assumptions. Do not infer correctness from the data structure alone; distinguish source semantics from executed tests.


## 103. AB104.751R — InFlightRequests ordering/mismatch re-audit
Commit: 7042ea4f167845866a0fd8031f8b388220bedfa3
Direct source: `InFlightRequests.add()` uses `addFirst`; `completeNext()` uses `pollLast`, so completion is FIFO/oldest-first. `NetworkClient.handleCompletedReceives()` calls `completeNext(source)` before correlation validation. Therefore a response is associated with the oldest in-flight request before its correlation ID is checked; this is source-derived, not executed mismatch evidence.

Existing `NetworkClientTest.testDisconnectWithMultipleInFlights()` proves two in-flight requests and disconnect completion order, but does not inject a mismatching response.

Status:
FIFO_QUEUE_SEMANTICS=SOURCE_CONFIRMED
MULTIPLE_INFLIGHT_DISCONNECT_ORDER=EXECUTED_TEST_EXISTS
CORRELATION_LOOKUP_BEFORE_COMPLETE_NEXT=NO
MULTIPLE_INFLIGHT_MISMATCH_EXECUTION=NO
POST_MISMATCH_QUEUE_STATE=SOURCE_DERIVED_ONLY
DIRECT_MISMATCH_ASSERTION=NO

Next exact mission: AB104.752R — inspect `NetworkClient.handleCompletedReceives` exception handling and outer `poll()` lifecycle, including whether a parse exception aborts processing of remaining completed receives, and whether any cleanup/failure path is triggered automatically. Distinguish source behavior from tests.


## 104. AB104.752R — NetworkClient.poll() mismatch exception lifecycle
Commit: 3edc50432912d8652027f7ab48c2bf5ca8cda050
Direct source confirms `poll()` invokes `handleCompletedReceives()` before disconnection/timeout/rebootstrap processing and before `completeResponses()`. `handleCompletedReceives()` has no local catch around `parseResponse()`, and `poll()` has no catch around the completed-action block. Therefore an ordinary `CorrelationIdMismatchException` escapes `poll()`, preventing the remaining processing in that invocation. Since `completeNext(source)` occurs before parsing, the associated in-flight entry has already been removed. `completeResponses()` catches callback exceptions only and cannot catch a parse mismatch that occurs earlier.

Status:
POLL_EXCEPTION_ESCAPES=SOURCE_CONFIRMED
REQUEST_REMOVED_BEFORE_PARSE=SOURCE_CONFIRMED
REMAINING_POLL_PROCESSING_AFTER_MISMATCH=SOURCE_DERIVED_NOT_EXECUTED
COMPLETE_RESPONSES_CATCH_PARSE=NO
DEDICATED_POLL_MISMATCH_TEST=NO
POST_EXCEPTION_QUEUE_STATE=NOT_EXECUTED

Next exact mission: AB104.753R — inspect selector completed-receive list lifecycle/clearing and whether an exception can cause the same receive to be replayed or discarded on the next poll. Also inspect disconnect/error handling around the affected connection. Keep source-derived and executed evidence separate.


## 105. AB104.753R — completed-receive retention/replay re-audit
Commit: 486558ef34462865602c3a5228b487b9c7033d1d
Direct test-harness source: `MockSelector.completeReceive()` appends directly to `completedReceives`; `MockSelector.poll()` does not clear that list; `NetworkClient.handleCompletedReceives()` does not clear it. Thus an exception can leave the mock receive in the list until explicit clearing. This is NOT production-selector replay evidence and must not be generalized. NetworkClient disconnect/timeout paths do clear in-flight requests, but those phases occur after `handleCompletedReceives()` and therefore are not reached in the same poll if parsing throws.

Status:
MOCK_RECEIVE_RETENTION=SOURCE_CONFIRMED
REPLAY_AFTER_MISMATCH_EXECUTED=NO
PRODUCTION_SELECTOR_REPLAY=NOT_ESTABLISHED
DISCONNECT_CLEARS_INFLIGHT=SOURCE_CONFIRMED
DISCONNECT_PHASE_AFTER_PARSE_EXCEPTION=NOT_REACHED_BY_SOURCE_ORDER

Next exact mission: AB104.754R — inspect the production selector's `completedReceives()` lifecycle and clear semantics, plus relevant selector/network tests, to avoid overgeneralizing the MockSelector result. Determine whether production completed receives are drained before/after NetworkClient processing and what happens if processing throws.


## 106. AB104.754R — production Selector completed-receive lifecycle
Commit: 5758cf17944267bb56ecaafb5bed48b5562e1b80
Direct Kafka source inspection established that production `Selector.poll()` calls `clear()` at the start, and `clear()` clears `completedReceives`. This differs materially from MockSelector. `NetworkClient` does not explicitly clear completed receives. Therefore a receive is retained for processing during the current selector-poll interval, but a subsequent production selector poll clears the prior receive before new I/O processing. Replay after a NetworkClient parse exception is NOT EXECUTED; non-replay on a subsequent production selector poll is source-derived, not experimentally verified. SocketServer has a distinct explicit `clearCompletedReceives()` path after processing.

Status: PRODUCTION_SELECTOR_CLEAR_AT_POLL_START=SOURCE_CONFIRMED; REPLAY_AFTER_MISMATCH_EXECUTED=NO; NEXT-POLL_NONREPLAY=SOURCE_DERIVED_NOT_EXECUTED.

Next exact mission: AB104.755R — inspect the SocketServer processing/exception path and relevant tests to determine whether completed receives are cleared even when request processing throws, and whether disconnect/close state can leave a buffered receive or cause a second processing attempt.


## AB104.759R — RequestChannel stale-work boundary
Audit commit: f2299f81808e3d8d3beb30d2fd0d2a87a4b0eaa5
Direct source: RequestChannel.sendRequest() places the already-created Request in a shared ArrayBlockingQueue, decoupling it from the socket receive lifecycle. No source path in RequestChannel automatically removes an already-queued Request merely because its client socket closes. Response routing later depends on request.processor; if the Processor has been removed/shut down, the response is dropped. clear()/shutdown() can clear queues, but this is lifecycle/shutdown behavior, not per-socket revocation.

Status: TRANSPORT_DISCONNECT != OPERATION_REVOKED; QUEUE_ENTRY != CURRENT_AUTHORITY; CHANNEL_CLOSE != EFFECT_CANCELLATION. Exact runtime sequence socket close -> queued request executes -> external effect was NOT_EXECUTED.

Next exact mission: AB104.760R — inspect Kafka request-handler/RequestChannel integration and tests around queued requests after disconnect, including whether handlers revalidate connection/session state before processing and whether any API-specific cancellation exists. Do not assume generic transport closure cancels application work.


## AB104.760R — RequestHandler revalidation boundary
Audit commit: d854ef3b59358cd7a5da8571dd7558dac8407a71
KafkaRequestHandler receives a queued Request and directly invokes `apis.handle(request, requestLocal)` after dequeue. The generic handler does not revalidate that the originating transport/channel is still open before invoking the API handler. Ordinary exceptions are caught/logged and the request buffer is released in finally. Callback work can also be rescheduled onto a request thread through RequestChannel without a generic transport-authority revalidation.

Evidence boundary: exact runtime interleaving enqueue -> socket close -> handler executes -> external effect was NOT_EXECUTED. API-specific authorization may exist inside individual handlers, but that is separate evidence and cannot be generalized.

Status: HANDLER_TRANSPORT_REVALIDATION=NOT_PRESENT_GENERICALLY; QUEUED_WORK_AFTER_CLOSE_RUNTIME=NOT_EXECUTED; API_SPECIFIC_AUTHORIZATION=OPEN.

Next exact mission: AB104.761R — select concrete Kafka APIs with externally meaningful effects and audit whether their handler-level checks bind execution to current connection/session/authority, or whether authorization is entirely request-local. Do not generalize from one API.


## 107. AB104.760R2 — correction of unverified continuity entry

Correction audit commit: 0dfefee25802225aea25b38faa9048ea8d2927ef
Research artifact: docs/nexo/NEXO_AB104_760R2_CONTINUITY_CORRECTION_2026-09-28.md

The handoff contains an earlier AB104.760R entry citing commit d854ef3b59358cd7a5da8571dd7558dac8407a71b. Fresh GitHub verification found that SHA does not exist in the canonical repository and the corresponding artifact could not be resolved. It is therefore preserved as historical text but MUST NOT be treated as persisted evidence.

Fresh direct re-audit at Kafka commit abf522e1ca5d7f4375baddc4da004da9fcb6e9ca confirms the substantive source claim independently: KafkaRequestHandler dequeues a Request and directly invokes apis.handle() without a generic transport-open/session-currentness revalidation; RequestChannel decouples queued Request objects from socket lifecycle. KafkaRequestHandlerTest was inspected, but the exact disconnect-after-enqueue interleaving was NOT executed/found as a dedicated assertion.

Status: SOURCE_CONFIRMED for generic handler behavior; exact disconnect-after-enqueue runtime interleaving NOT_EXECUTED; API-specific authorization/effect cancellation OPEN. No Nexo implementation, V21, formal verification, or runtime Nexo execution.

EXACT NEXT ACTION: AB104.761R — select concrete Kafka APIs with externally meaningful effects and audit whether handler-level checks bind execution to current connection/session/authority, or whether authorization is entirely request-local. Do not generalize from one API.


## 108. AB104.761R — Kafka Produce authorization boundary

Artifact commit: a90246e9b687c171242e6c4bb3a738f4b3a3ab50
Artifact: docs/nexo/NEXO_AB104_761R_PRODUCE_AUTHORIZATION_AUDIT_2026-09-28.md

Fresh direct audit at Kafka commit abf522e1ca5d7f4375baddc4da004da9fcb6e9ca: Produce authorization is evaluated with authHelper.filterByAuthorized(request.context, WRITE, TOPIC, ...) before replicaManager.handleProduceAppend(...). This is a real authorization gate, but the audited path does not show a second generic current-authority/session revalidation immediately before the append. The request context belongs to the already-created queued Request. For acks=0, closeConnection on processing error is transport/error handling, not proof of append cancellation or rollback.

Exact adversarial interleaving authorize -> revoke/disconnect -> append was NOT executed and was not found as a dedicated test assertion. Therefore current authorization after revocation remains OPEN/UNKNOWN at this boundary. Preserve distinctions: REQUEST_CONTEXT_AUTHORIZATION != CURRENT_AUTHORITY; AUTHORIZATION_CHECK != REVOCATION_RECHECK; TRANSPORT_CLOSE != APPEND_CANCELLATION.

EXACT NEXT ACTION: AB104.762R — audit authHelper.filterByAuthorized implementation, including caching/memoization and identity/session inputs, for stale authorization after revocation or credential changes.


## 109. AB104.762R — AuthHelper authorization freshness / revocation audit
Artifact commit: 419f1beb93f9fd78ad8c4503e8518bb48666b48d

Fresh source audit: AuthHelper contains no result cache/memoization; StandardAuthorizer evaluates against its current local ACL data on each authorize call. Kafka Authorizer is synchronous over locally cached ACL state, while ACL mutation/publication is asynchronous across the metadata path. Therefore AUTHHELPER_RESULT_CACHE was not found, but LOCAL_AUTHORIZER_STATE freshness remains material. REQUEST_CONTEXT != LIVE_AUTHORITY_EPOCH; ACL revocation does not itself establish cancellation of an already admitted/queued request. Custom authorizer cache semantics remain open.

Status: SOURCE_AUDITED_NO_CACHE_FOUND; STANDARD_AUTHORIZER_CURRENT_STATE_LOOKUP=SOURCE_CONFIRMED; ACL_UPDATE_ASYNC_INTERFACE=SOURCE_CONFIRMED; IN_FLIGHT_REVOCATION=OPEN. No Nexo implementation, V21, formal verification, or executed race.

## 110. AB104.763R — Produce authorization-to-append boundary audit
Artifact commit: 4f294faffb3a938b85c1806b80650c4c9d9d2793

KafkaApis performs topic WRITE authorization once, stores authorizedRequestInfo, then hands the already-authorized records to ReplicaManager append. The source contains request-local reuse of authorization results, not a cross-request cache. No generic second ACL authorization call was found between authorization and append. Transactional checks are separate. The revocation interleaving ALLOW -> revoke -> append remains source-permitted but NOT executed.

Status: PRODUCE_AUTHORIZATION_BEFORE_APPEND=SOURCE_CONFIRMED; REQUEST_LOCAL_REUSE=SOURCE_CONFIRMED; GENERIC_SECOND_ACL_CHECK=NOT_FOUND_IN_AUDITED_PATH; REVOCATION_RACE=NOT_EXECUTED; EFFECT-TIME_REVOCATION_FENCE=NOT_ESTABLISHED.

## 111. AB104.764R — ACL mutation → metadata publication → broker authorizer freshness
Artifact commit: cb5dfd944c32c4054c1a9e1a21cfafee8487c3fa

ACL state is persisted in the KRaft metadata log. AclPublisher applies ACL deltas to broker-local StandardAuthorizerData in order; snapshot loading replaces ACL state coherently. Metadata readiness is an initialization barrier, not a per-request revocation barrier. Source permits I(authorize ALLOW) < R(revocation committed) < P(local publication) < A(append), and also I < R < A < P; these are source-derived orderings, not executed races. No dedicated upstream test for ALLOW -> revoke -> in-flight Produce -> append was established.

Status: ACL_METADATA_ORDER=SOURCE_CONFIRMED; BROKER_LOCAL_PUBLICATION=SOURCE_CONFIRMED; PER_REQUEST_REVOCATION_FENCE=NOT_FOUND; IN_FLIGHT_CANCEL=NOT_ESTABLISHED; EXECUTED_RACE=NO.

## 112. AB104.765R — DeleteAcls completion versus broker authorization freshness
Artifact commit: 4a84b71e556ded453f6ae730608756b5102ef6dd

DeleteAcls response waits for the configured mutation future; the KRaft controller path persists the ACL deletion in the metadata log before completing that control-plane operation. This is stronger than an in-memory controller mutation but does not establish that every broker has applied removeAcl to local StandardAuthorizerData. Therefore DELETE_ACLS_RESPONSE = CONTROL_PLANE_COMMIT/PERSISTENCE EVIDENCE, not GLOBAL_BROKER_AUTHORIZER_FRESHNESS and not proof that an in-flight Produce was revoked.

Status: DELETE_ACLS_PERSISTENCE=SOURCE_CONFIRMED; GLOBAL_BROKER_APPLICATION_BEFORE_RESPONSE=NOT_ESTABLISHED; IN_FLIGHT_REVOCATION=NOT_ESTABLISHED; EXECUTED_RACE=NO.

EXACT NEXT ACTION: AB104.766R — audit broker MetadataLoader/AclPublisher delivery semantics and metadata offset/freshness APIs. Determine whether a broker can prove that its local authorizer has applied at least metadata offset D before an effect, and whether normal Produce uses such proof. Preserve distinction between broker caught-up-to-D and request re-authorized-after-D.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.766R; preserve all UNKNOWN/NOT_EXECUTED states; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.

## 113. AB104.766R — Broker metadata publication and ACL freshness boundary
Artifact commit: 25a49d1d32bdb0b69b5fc65e9b44980e279427fb

Current BrokerMetadataPublisher records newImage.highestOffsetAndEpoch(); ACL delta is handed to AclPublisher during committed metadata publication. AclPublisher applies ordered ACL changes to ClusterMetadataAuthorizer/StandardAuthorizer local state, giving a meaningful broker-local applied-version point D1 once publication completes. However normal Produce authorizes first, constructs authorizedRequestInfo, and passes records onward; no generic second ACL authorization or effect-time metadata-offset fence was found. Therefore D0=ACL committed, D1=target broker applied ACL, D2=effect attempt remain distinct: D0 != D1 and D1 != D2. KIP-801/metadata readiness provide a consistency/readiness model, not instantaneous cluster-wide revocation.

Status: BROKER_METADATA_HAS_OFFSET=SOURCE_CONFIRMED; ACL_PUBLISHER_RECEIVES_COMMITTED_METADATA=SOURCE_CONFIRMED; ACL_ORDER_PRESERVED=SOURCE_CONFIRMED; BROKER_LOCAL_APPLIED_STATE=SOURCE_CONFIRMED; GENERIC_PRODUCE_EFFECT_TIME_REAUTHORIZATION=NOT_FOUND; CONTINUOUS_REVOCATION_FENCE=NOT_FOUND; EXECUTED_RACE=NO; CUSTOM_AUTHORIZER_GENERALIZATION=OPEN.

EXACT NEXT ACTION: AB104.767R — search Kafka tests and metadata-loader APIs for explicit offset-observation/barrier primitives (wait-for-metadata/high-watermark mechanisms), determine whether any can force broker observation of ACL version D1 before an operation, and compare with real effect-time revocation/fencing systems.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.767R; preserve all UNKNOWN/NOT_FOUND/NOT_EXECUTED states; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.

## 114. AB104.767R — Metadata freshness barriers versus effect-time authorization
Artifact commit: f78dbb08a7ba9ecec7022a12bb1cb2b1b8ff18bc

Audit found startup/catch-up barriers for Kafka authorization metadata, including initial high-watermark loading and broker metadata publication. These establish readiness/applied-state boundaries but no generic caller-supplied ACL metadata-offset barrier consumed by normal Produce. KafkaProducer topic-metadata waiting is not an authorization fence. KIP-801 confirms brokers maintain StandardAuthorizer state along the metadata timeline while authorization can continue during ordered ACL application. Comparison with etcd shows the stronger pattern: a revision predicate is evaluated by the protected resource at the effect boundary; ZooKeeper zxid and Kubernetes ResourceVersion similarly provide ordering/version identities but do not by themselves fence arbitrary external effects.

Key distinction: OBSERVED/APPLIED_AUTHORITY_VERSION != EFFECT_AUTHORIZATION_FENCE. A broker may prove BROKER_APPLIED_VERSION >= D without proving EFFECT_ACCEPTED_ONLY_IF_AUTHORITY_VERSION >= D. The latter requires effect-boundary enforcement or equivalent reauthorization.

Status: AUTHORIZER_STARTUP_READINESS=SOURCE_CONFIRMED; INITIAL_HIGH_WATERMARK_LOAD=SOURCE_CONFIRMED; BROKER_METADATA_HIGH_WATERMARK_STARTUP=SOURCE_CONFIRMED; ACL_ORDERED_APPLICATION=SOURCE_CONFIRMED; GENERIC_CALLER_SUPPLIED_ACL_OFFSET_BARRIER=NOT_FOUND; PRODUCE_EFFECT_TIME_REAUTHORIZATION_ON_METADATA_VERSION=NOT_FOUND; CLIENT_AWAIT_TOPIC_METADATA_AS_AUTHORIZATION_FENCE=NOT_VALID; ETCD_REVISION_COMPARE=SOURCE_CONFIRMED; ZOOKEEPER_ZXID_ORDER=SOURCE_CONFIRMED; EXECUTED_KAFKA_REVOCATION_RACE=NO.

EXACT NEXT ACTION: AB104.768R — audit Kafka request/append test infrastructure for authorization versus append-side state transitions, search for ACL mutation during in-flight Produce, and inspect ReplicaManager/request-channel boundaries for generation/version/fencing checks that could invalidate already-authorized records. Do not infer safety or exploitability from source ordering alone.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.768R; preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.

## 115. AB104.768R — Produce authorization versus append boundary
Artifact commit: d4734235080388be9e79f816733ffdae01be66c4

KafkaApis currently evaluates topic WRITE authorization, stores the authorized records in request-local authorizedRequestInfo, validates them, and passes them directly to ReplicaManager.handleProduceAppend. No generic second topic ACL authorization call was found between authorization and append, and no ACL metadata offset/generation was found being passed as an append-time fence. This confirms an authorization-before-append boundary but does not by source ordering alone prove any particular revocation race is executable. A third-party running-producer ACL-removal scenario reports subsequent attempts being denied, but it is not Apache Kafka's own deterministic proof of the exact in-flight interleaving.

Status: SOURCE_PATH_AUTH_BEFORE_APPEND=SOURCE_CONFIRMED; REQUEST_LOCAL_AUTHORIZATION_REUSE=SOURCE_CONFIRMED; GENERIC_SECOND_TOPIC_ACL_CHECK_BEFORE_APPEND=NOT_FOUND_IN_AUDITED_PATH; ACL_GENERATION_PASSED_TO_REPLICA_APPEND=NOT_ESTABLISHED; APPEND_SIDE_AUTHORIZATION_FENCE=NOT_ESTABLISHED; DEDICATED_UPSTREAM_IN_FLIGHT_REVOKE_TEST=NOT_ESTABLISHED; EXECUTED_DETERMINISTIC_RACE=NO.

EXACT NEXT ACTION: AB104.769R — inspect ReplicaManager.handleProduceAppend and append/purgatory/partition boundaries for hidden generation/state checks (leader epoch, partition epoch, transaction/producer epoch, etc.). Separate partition/producer correctness mechanisms from ACL authority freshness, and inspect upstream tests for ACL-change/Produce ordering guarantees.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.769R; preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.

## 116. AB104.769R — ReplicaManager/Partition/UnifiedLog append boundary

Artifact: NEXO_AB104_769R_REPLICAMAN_APPEND_AUTHORITY_AUDIT_2026-09-30.md (artifact creation was attempted but the connector blocked that write; findings are persisted here to avoid losing continuity)

Fresh direct audit of Apache Kafka trunk:
- ReplicaManager.handleProduceAppend has no generic ACL reauthorization step. Non-transactional Produce proceeds from the request-local authorized records into appendRecords.
- appendRecords -> appendRecordsToLeader -> appendToLocalLog -> Partition.appendRecordsToLeader is the append chain.
- Partition.appendRecordsToLeader holds leaderIsrUpdateLock, requires a local leader, and passes the partition's current leaderEpoch to UnifiedLog.appendAsLeader. This is partition leadership/replication correctness, not ACL authority freshness.
- UnifiedLog validates records and then validates producer/transaction state. Producer epoch checks, duplicate-batch detection, transaction VerificationGuard, and transaction-version handling are real safeguards, but they are scoped to producer/transaction state and do not consult an ACL generation or current principal authorization.
- Delayed Produce/purgatory is entered after local append results; it waits for replica/high-watermark conditions and does not create an ACL effect-time reauthorization fence.
- Repository search found no dedicated upstream test proving the exact ACL ALLOW -> revoke -> in-flight Produce -> append interleaving.

Critical separation:
PARTITION_LEADER_EPOCH != ACL_AUTHORITY_EPOCH
PRODUCER_EPOCH != ACL_AUTHORITY_EPOCH
TRANSACTION_VERIFICATION_GUARD != ACL_AUTHORITY_FENCE
REPLICATION/HW_PURGATORY != EFFECT_TIME_AUTHORIZATION_FENCE

Status: REPLICAMAN_APPEND_PATH=SOURCE_CONFIRMED; PARTITION_LEADER_CHECK=SOURCE_CONFIRMED; LEADER_EPOCH_BOUNDARY=SOURCE_CONFIRMED; PRODUCER_EPOCH_VALIDATION=SOURCE_CONFIRMED; TRANSACTION_VERIFICATION=SOURCE_CONFIRMED; ACL_AUTHORITY_GENERATION_AT_APPEND=NOT_FOUND_IN_AUDITED_PATH; GENERIC_ACL_REAUTHORIZATION_AT_EFFECT=NOT_FOUND_IN_AUDITED_PATH; ACL_FENCE_PASSED_TO_APPEND=NOT_FOUND_IN_AUDITED_PATH; ACL_REVOKE_INFLIGHT_PRODUCE_TEST=NOT_FOUND_IN_SEARCH; EXECUTED_DETERMINISTIC_RACE=NO; EXPLOITABILITY_OF_EXACT_RACE=UNKNOWN.

No Nexo implementation, V21, formal verification, or runtime Nexo execution.

EXACT NEXT ACTION: AB104.770R — inspect UnifiedLog/ProducerStateManager validation and upstream tests specifically for producer-epoch/transaction guards that may look like generic effect fencing; then audit KafkaApis tests around ACL mutation and Produce scheduling for any synchronization point between authorization and append. Keep ACL authority freshness separate from producer/transaction epochs.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.770R; preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.

## 117. AB104.770R–772R — Large-tranche audit: producer/transaction fencing, KafkaApis tests, ACL boundary

### AB104.770R — ProducerStateManager fencing separation
Direct source audit of ProducerStateManager, UnifiedLog and ProducerStateManagerTest.
- ProducerStateManager explicitly uses producer epoch to fence zombie writers and tracks producer id, epoch, sequence and last offsets.
- UnifiedLog rejects stale producer epochs for transactional client/coordinator appends when an active producer entry has a newer epoch; duplicate batches are separately detected.
- Transaction VerificationGuard prevents stale/ABA transaction verification from authorizing an invalid transactional append.
- These guards are tied to producer/transaction identity and partition-local producer state. No ACL principal, ACL metadata revision, authorizer generation, or topic WRITE authorization snapshot participates in these checks.
- Producer-state tests confirm epoch fencing and sequence behavior, but they do not test ACL revocation during an already-authorized Produce.
Status: PRODUCER_EPOCH_FENCE=SOURCE_CONFIRMED; SEQUENCE_FENCE=SOURCE_CONFIRMED; TRANSACTION_VERIFICATION_GUARD=SOURCE_CONFIRMED; ACL_AUTHORITY_BINDING=NOT_FOUND; ACL_REVOCATION_DURING_PRODUCER_FENCE=NOT_TESTED.

### AB104.771R — KafkaApis Produce test boundary
Direct audit of current core/src/test/scala/unit/kafka/server/KafkaApisTest.scala.
- The audited Produce tests exercise request construction, ReplicaManager callback behavior, response mapping and producer-epoch error translation.
- The test shouldReplaceProducerFencedWithInvalidProducerEpochInProduceResponse confirms that an INVALID_PRODUCER_EPOCH returned by ReplicaManager is surfaced correctly; it does not represent an ACL freshness test.
- Search of the test file found no dedicated test method implementing ACL ALLOW -> revoke -> in-flight Produce -> append, nor a test asserting a second ACL authorization at append/effect time.
- Therefore absence of such a test in this file is source/test evidence only; it is not proof that no test exists elsewhere in the repository.
Status: PRODUCE_RESPONSE_TESTS=SOURCE_CONFIRMED; PRODUCER_EPOCH_RESPONSE_MAPPING=SOURCE_CONFIRMED; INFLIGHT_ACL_REVOKE_TEST_IN_KAFKAAPISTEST=NOT_FOUND; EFFECT_TIME_ACL_REAUTH_TEST_IN_KAFKAAPISTEST=NOT_FOUND; REPOSITORY_WIDE_TEST_ABSENCE=UNKNOWN.

### AB104.772R — Consolidated authority-boundary result
The large-tranche evidence now establishes a clean separation:
ACL AUTHORIZATION -> request-local authorized records -> PARTITION LEADERSHIP/PRODUCER/TRANSACTION VALIDATION -> append.
The downstream mechanisms can reject stale producer/transaction state without re-establishing current ACL authority. Current Kafka documentation defines PRODUCE topic WRITE authorization as the normal produce authorization, while ACLs are managed through the authorization subsystem. This is consistent with the source path audited above. [Web sources: Apache Kafka authorization documentation; current KafkaApis source.]
No audited source introduced an ACL generation/fence at the append boundary.
Therefore: EFFECT_TIME_ACL_REAUTHORIZATION=NOT_FOUND_IN_AUDITED_PATH; ACL_AUTHORITY_GENERATION_PASSED_TO_APPEND=NOT_FOUND; PRODUCER_EPOCH_AS_ACL_FENCE=FALSE; PARTITION_LEADER_EPOCH_AS_ACL_FENCE=FALSE; TRANSACTION_VERIFICATION_AS_ACL_FENCE=FALSE; EXACT_INFLIGHT_REVOKE_RACE=NOT_EXECUTED; EXPLOITABILITY=UNKNOWN.

Important: this does NOT mean Kafka has been proven vulnerable to the exact race. It means the audited downstream mechanisms do not close that race by acting as an ACL freshness fence, while deterministic race execution remains outstanding.

No Nexo implementation, V21, formal verification, or runtime Nexo execution.

EXACT NEXT ACTION: AB104.773R — repository-wide search for ACL mutation + Produce concurrency/integration tests, including security/integration test suites and authorizer publication tests; determine whether any existing test actually controls the interleaving or merely verifies eventual authorization changes. If none exists, preserve UNKNOWN and design (but do not yet execute) the smallest deterministic race experiment.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.773R; preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.

## 118. AB104.773R — Repository-wide ACL mutation + Produce concurrency/test-boundary audit

Fresh upstream Kafka audit (trunk) searched unit, integration, security/authorizer, metadata-authorizer and client-security test surfaces for ACL mutation + Produce concurrency and authorization-publication synchronization.

### Evidence found
- `EndToEndAuthorizationTest.scala` has end-to-end Produce/ACL tests and explicit ACL deletion, but the audited flows are sequential: ACLs are added/removed and then subsequent requests are issued. The tests use `waitAndVerifyAcls` to establish broker-local ACL state before exercising the next operation. No deterministic ALLOW -> revoke -> already-admitted/in-flight Produce -> append interleaving was found.
- `AuthorizerIntegrationTest.scala` contains ACL removal and Produce tests. It also contains an important transactional boundary test: a producer sends inside a transaction, ACLs are removed, and `commitTransaction()` is expected to fail with `TransactionalIdAuthorizationException`. This demonstrates a later transactional authorization check, but it is NOT evidence of a second ACL check at the non-transactional Produce append boundary.
- `GroupAuthorizerIntegrationTest.java` explicitly verifies ACL deletion and separately verifies unauthorized Produce after authorization has been removed. Its ACL deletion helper waits for the deletion to be observable. No barrier/latch controls the exact authorization-to-append interleaving.
- `StandardAuthorizerTest.java`, `ClusterMetadataAuthorizerTest.java`, and authorizer-related unit surfaces cover authorization/data behavior and metadata publication semantics, but the audited search did not find a deterministic Produce request paused between authorization and append while an ACL deletion is concurrently committed/published.
- Search for `CountDownLatch` in the principal ACL/authorizer integration-test surfaces did not find such a synchronization primitive in the relevant tests. This is evidence about the searched surfaces, not proof that no concurrency primitive exists anywhere in Kafka.
- Kafka's public `Authorizer` contract explicitly leaves concurrent update guarantees to the authorizer implementation. The current StandardAuthorizer model uses broker-local authorizer state, so publication/freshness and effect-time authorization remain distinct claims.

### Important distinction
Existing tests establish:
1. ACL present -> Produce allowed.
2. ACL absent/removed and published -> later Produce denied.
3. ACL removed after a transactional send -> later transaction commit can be denied.

They do NOT establish:
ACL ALLOW at request authorization -> ACL revoke commits/publishes -> same already-authorized non-transactional Produce crosses append boundary -> deterministic observed effect.

No test found in the audited surfaces binds the revocation event to a controlled pause between `KafkaApis` authorization and `ReplicaManager/Partition/UnifiedLog` append. Therefore the exact race remains NOT_EXECUTED.

Status: ACL_MUTATION_TESTS=SOURCE_CONFIRMED; SEQUENTIAL_REVOKE_THEN_PRODUCE_TESTS=SOURCE_CONFIRMED; TRANSACTIONAL_POST_REVOKE_AUTH_CHECK=SOURCE_CONFIRMED; DETERMINISTIC_INFLIGHT_NONTRANSACTIONAL_PRODUCE_REVOKE_TEST=NOT_FOUND_IN_AUDITED_SEARCH; AUTHORIZATION_PUBLICATION_TESTS=SOURCE_CONFIRMED; INTERLEAVING_CONTROL_AT_AUTHORIZATION_APPEND_BOUNDARY=NOT_FOUND_IN_AUDITED_SEARCH; REPOSITORY_WIDE_ABSENCE=UNKNOWN; EXACT_RACE=NOT_EXECUTED; EXPLOITABILITY=UNKNOWN.

No Nexo implementation, V21, formal verification, or runtime Nexo execution.

### EXACT NEXT ACTION
AB104.774R — design the smallest deterministic race experiment without executing it yet. The experiment must create a real Produce request, establish the authorization decision, pause before append, revoke/delete the ACL and establish the relevant publication point, then release the Produce into append; instrument the append/effect outcome separately from the authorization result. First identify the narrowest safe injection/control point in Kafka test infrastructure and define the expected observations for both outcomes. Preserve UNKNOWN until an actual controlled execution exists.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.774R; preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.


## 119. AB104.774R — Deterministic race experiment: narrowest injection point

Artifact: findings persisted directly in this canonical handoff.

The smallest controllable boundary identified in current Kafka source is between KafkaApis.handleProduceRequest and ReplicaManager.handleProduceAppend.

Source evidence:
- KafkaApis constructs authorizedRequestInfo only after authHelper.filterByAuthorized(... WRITE, TOPIC, ...).
- The same method then calls replicaManager.handleProduceAppend(... entriesPerPartition = authorizedRequestInfo, ...).
- KafkaApisTest already injects a configurable Authorizer into KafkaApis and mocks ReplicaManager; its Produce tests capture the handleProduceAppend call.
- ReplicaManager.handleProduceAppend is the real handoff into transactional verification and then appendRecords; a test-only subclass/spied real instance can therefore block immediately on entry and later delegate to the real implementation.

This yields a precise test-only pause point:
T0 ACL ALLOW -> T1 KafkaApis authorization returns ALLOW -> T2 handleProduceAppend entered and blocks -> T3 ACL deletion is committed/published to the target broker -> T4 release handleProduceAppend -> T5 real append/effect observed.

Important limitation:
A mocked ReplicaManager can prove the authorization-to-handoff interleaving but cannot prove the actual log effect. The final experiment therefore needs a real ReplicaManager/Partition/UnifiedLog path after the barrier, not only a Mockito callback.

Status: NARROWEST_HANDOFF_POINT=SOURCE_IDENTIFIED; TEST_ONLY_BLOCK_AT_HANDLE_PRODUCE_APPEND=FEASIBLE_IN_PRINCIPLE; REAL_EFFECT_PATH=REQUIRED; EXACT_RACE=NOT_EXECUTED.

## 120. AB104.775R — StandardAuthorizer snapshot/currentness semantics

Fresh direct source audit of StandardAuthorizer.

StandardAuthorizer keeps a volatile StandardAuthorizerData data. Its authorize method takes the current data reference into curData and evaluates all actions against that snapshot. ACL add/remove operations update the authorizer's local state; snapshot loading can replace the ACL cache coherently.

Critical consequence for the experiment:
- Authorization result is computed from a broker-local authorizer snapshot.
- The result returned to KafkaApis does not carry an ACL revision/generation that is later checked by ReplicaManager.
- Once filterByAuthorized has returned ALLOW and authorizedRequestInfo has been constructed, the already-authorized records are independent of later ACL publication unless another authorization/fence occurs.
- This is a source-semantics observation, not proof that the race has been executed.

Status: STANDARD_AUTHORIZER_LOCAL_SNAPSHOT=SOURCE_CONFIRMED; AUTHORIZATION_RESULT_CARRIES_ACL_VERSION=NOT_FOUND_IN_AUDITED_PATH; POST_AUTHORIZATION_VERSION_RECHECK=NOT_FOUND_IN_AUDITED_PATH; EXACT_RACE=NOT_EXECUTED.

## 121. AB104.776R — Race oracle and observation contract

Defined the minimum observations needed to avoid ambiguous results.

Required timeline:
1. Establish topic WRITE ACL for the test principal.
2. Start one real Produce request.
3. Confirm the request has crossed authorization and reached the controlled handleProduceAppend barrier.
4. While Produce is paused, delete/revoke the topic WRITE ACL.
5. Establish the target broker's relevant ACL publication point; separately record controller/metadata commit evidence if available.
6. Verify that a fresh authorization for the same principal/topic is DENIED after publication.
7. Release the paused Produce into the real append path.
8. Record both the Produce response and the actual log/effect outcome independently.

Interpretation contract:
- ALLOW-before-revoke + effect-after-revoke = exact in-flight revocation race observed.
- ALLOW-before-revoke + no-effect is not automatically proof of an ACL fence; the rejection reason and exact boundary must be identified.
- ALLOW-before-revoke + PRODUCER/LEADER/TRANSACTION error does not prove ACL protection.
- DENY-before-append because authorization was repeated would establish effect-time reauthorization.
- Failure to reach the barrier, failure to prove broker ACL publication, or test infrastructure failure leaves the race UNKNOWN.

Status: OBSERVATION_CONTRACT=DEFINED; EFFECT_AND_AUTH_RESULT_SEPARATED=REQUIRED; SAFETY_INFERENCE_FROM_SINGLE_ERROR=DISALLOWED; EXACT_RACE=NOT_EXECUTED.

## 122. AB104.777R — Upstream test-harness feasibility audit

Current Kafka unit-test infrastructure confirms two useful capabilities:
- KafkaApisTest.createKafkaApis(authorizer = ...) can inject a real/custom Authorizer instance into the KafkaApis under test.
- KafkaApisTest currently uses a mocked ReplicaManager for many Produce tests, proving the handoff can be intercepted without changing production code.

For the real-effect experiment, however, a mocked ReplicaManager is insufficient. The test must preserve the real ReplicaManager.handleProduceAppend -> appendRecords -> appendRecordsToLeader -> Partition/UnifiedLog chain after the synchronization point. The safest architecture is therefore a test-only real ReplicaManager instance with a narrow override/interceptor at handleProduceAppend, or an equivalent test hook that blocks before delegating to the real implementation.

The audit did not establish yet that the full multi-broker integration harness exposes a supported constructor/injection path for replacing the production ReplicaManager with that controlled test instance. That harness-injection question is therefore still OPEN and must be audited before any implementation or execution.

Status: KAFKAAPIS_TEST_AUTHORIZER_INJECTION=SOURCE_CONFIRMED; MOCK_RM_INTERCEPTION=SOURCE_CONFIRMED; REAL_RM_EFFECT_REQUIRED=SOURCE_CONFIRMED; FULL_INTEGRATION_RM_INJECTION_POINT=OPEN; EXACT_RACE=NOT_EXECUTED.

## 123. AB104.778R — Barrier completeness: authorization publication versus effect boundary

The experiment must not use only the controller DeleteAcls response as its revoke barrier. Prior audit established that DeleteAcls completion proves control-plane persistence but does not by itself prove every target broker has applied the deletion.

Therefore the race requires two separate revocation facts:
D0 = ACL deletion committed/persisted in the metadata/control plane.
D1 = target broker's local StandardAuthorizer has applied the deletion and now denies a fresh authorization.
D2 = paused Produce crosses the append/effect boundary.

The decisive ordering is D0 < D1 < D2. D0 < D2 without D1 is insufficient to distinguish a stale broker authorizer from an effect-time fence.

Status: CONTROL_PLANE_COMMIT=INSUFFICIENT_ALONE; TARGET_BROKER_ACL_DENIAL_AFTER_PUBLICATION=REQUIRED; D0_D1_D2_SEPARATION=SOURCE_DEFINED; EXACT_RACE=NOT_EXECUTED.

No Nexo implementation, V21, formal verification, or runtime Nexo execution.

### EXACT NEXT ACTION
AB104.779R — audit the Kafka integration-test/server harness for the narrowest supported way to control or substitute the target broker's ReplicaManager while retaining the real StandardAuthorizer + metadata publication + Partition/UnifiedLog effect path. In parallel, identify the strongest existing broker-local ACL publication observation that can establish D1 without conflating it with controller commit D0. Do not execute the race yet.

CONTINUITY RULE: If chat stops, recover this same canonical handoff first; resume at AB104.779R; preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED; do not create parallel handoffs; AB105.116R remains canonical model anchor; research-only, no implementation/V21, no formal verification claim.

## 124. AB104.779R — Integration harness exposes the real broker and ReplicaManager

Audited Kafka's current KRaft integration harness. `KafkaServerTestHarness` exposes `brokers: mutable.Buffer[KafkaBroker]`, and `KafkaBroker` exposes `replicaManager: ReplicaManager` and `dataPlaneRequestProcessor: KafkaApis`. Therefore the running target broker's real ReplicaManager is directly reachable from an integration test.

The harness creates real `BrokerServer` instances through `QuorumTestHarness.createBroker`; `BrokerServer` constructs its own real ReplicaManager during startup and wires that same instance into KafkaApis. This is stronger than the earlier unit-test mock path: the test can observe/control the actual broker object without replacing the production ReplicaManager constructor.

New consequence: the remaining problem is not how to substitute ReplicaManager. The cleanest test-only control point is to instrument the existing real target broker's ReplicaManager, but the audit has not yet established a supported runtime interception mechanism for `handleProduceAppend` (the method may not be overridable in the required way). We must inspect its declaration and existing subclass/test patterns before deciding whether a wrapper, subclass at broker construction, or a lower append hook is possible.

Status: REAL_BROKER_ACCESS=SOURCE_CONFIRMED; REAL_REPLICA_MANAGER_ACCESS=SOURCE_CONFIRMED; KAFKAAPIS_REAL_PATH=SOURCE_CONFIRMED; RUNTIME_INTERCEPTION_MECHANISM=OPEN; EXACT_RACE=NOT_EXECUTED.

## 125. AB104.780R — Broker-local ACL publication observation: harness-level target

The integration harness also exposes each broker's `authorizerPlugin`, while `KafkaServerTestHarness.pickAuthorizerForWrite` can obtain an authorizer for writes. However, selecting the controller authorizer is not sufficient for D1; D1 requires the target broker's own local authorizer to deny a fresh authorization after ACL deletion.

The correct observation contract is therefore broker-local: use the target broker's `authorizerPlugin.get.get.authorize(...)` (or the strongest equivalent public authorizer API available in the harness) for the same principal/topic/action. The observed result must transition from ALLOWED before deletion to DENIED after the deletion has been published to that target broker.

This gives a practical D1 witness independent of the controller DeleteAcls completion. We still need to audit how existing tests wait for ACL publication and whether directly invoking the target authorizer is sufficient evidence for the metadata publication boundary, rather than merely reading a local object.

Status: TARGET_BROKER_AUTHORIZER_ACCESS=SOURCE_CONFIRMED; D1_LOCAL_DENIAL_WITNESS=FEASIBLE_IN_PRINCIPLE; PUBLICATION_WAIT_SEMANTICS=OPEN; EXACT_RACE=NOT_EXECUTED.

## 126. AB104.781R — ReplicaManager interception audit begins: declaration and test seams

Next source check is deliberately narrow: inspect the declaration/signature/visibility of `ReplicaManager.handleProduceAppend`, its subclasses or test doubles, and any existing integration/unit seam that can pause execution without modifying production behavior. Do not execute the race and do not infer a fence from a test seam alone.

No Nexo implementation, V21, formal verification, or runtime Nexo execution.

### EXACT NEXT ACTION
AB104.781R — inspect `ReplicaManager.handleProduceAppend` declaration and existing override/decorator/test-hook patterns; then inspect target-broker ACL publication wait helpers in the integration tests. Preserve UNKNOWN until the complete controlled path is established.

CONTINUITY RULE: recover this same canonical handoff first; resume at AB104.781R; preserve UNKNOWN/NOT_FOUND/NOT_EXECUTED; no parallel handoffs; AB105.116R remains canonical model anchor.