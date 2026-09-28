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
