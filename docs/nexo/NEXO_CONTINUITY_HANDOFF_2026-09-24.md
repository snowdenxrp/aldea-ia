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
