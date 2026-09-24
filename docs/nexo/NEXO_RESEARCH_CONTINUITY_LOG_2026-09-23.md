# NEXO — RESEARCH / CONTINUITY LOG
Fecha de snapshot: 2026-09-23

## Método obligatorio
INVESTIGATE → ANALYZE → CONTRAST → RESTRUCTURE/BUILD → VERIFY → SAVE

## Investigación consolidada
1. Durable execution / exactly-once:
   history durable no garantiza exactly-once external. Usar operation_id,
   idempotency, reconciliation.
2. Identity/capability/delegation:
   identidad separada de authority; capabilities acotadas; child ⊆ parent;
   revocation + epochs + fencing.
3. Root of trust:
   trust anchor, identity, capability, recovery y data keys separados;
   clean recovery requiere trust path independiente.
4. RATS / attestation:
   Attester → Evidence → Verifier → Relying Party. Freshness, reference
   values y appraisal policy son dependencias de trust.
5. History/checkpoints:
   hash/Merkle/signatures prueban integridad, no verdad. Snapshot optimiza
   recuperación pero no sustituye history.
6. Goal hijacking:
   Mission Root protegido; goal lineage, refinement contract, semantic diff,
   plan-level validation y reauthorization fuera de scope.
7. Evidence/provenance:
   taint, lineage, corroboration y claim contracts. Repetir una fuente no crea
   independencia.
8. Global composition:
   acciones individualmente válidas pueden romper invariants al combinarse.
   Añadidos global invariants, effect interaction graph, budgets y blast radius.
9. External world:
   tool success ≠ world truth. Unknown external outcomes requieren
   reconciliation.
10. Temporal consistency:
   wall-clock ≠ causal order; observed_at ≠ received_at; time uncertainty.
11. Concurrency:
   no todo se puede CRDT/last-write-wins; critical state requiere strong
   coordination/fencing.
12. Collective agents:
   collective state, communication graph, common-mode dependencies, bounded
   fanout, collective goal integrity.
13. Governance:
   proposal/deliberation/authorization/execution/verification separados;
   votes son evidencia, no autoridad.
14. Specification gaming:
   proxy success no demuestra mission success; world-level verification.
15. Formal assurance:
   TLA+/model checking para invariants/contracases del modelo; runtime
   enforcement + fault injection + world verification para implementación.
16. Supply chain:
   source → build → artifact → deployment → runtime attestation; provenance
   no es semantic safety.
17. Complete mediation:
   todo effect surface debe pasar por enforcement point; direct bypass tests.
18. TOCTOU:
   request fingerprint + canonicalization + state/version binding + final PEP.
19. Sink integrity:
   runtime/artifact/config/dependency binding y sink receipt.
20. Verification integrity:
   claim/policy/reference/verifier/result/decision separados.
21. Bootstrap:
   Nexo no puede autodeclarar su primer trust; genesis bundle + external
   authority + measured boot.
22. Continuity:
   material change = new version/epoch + re-admission + fresh capabilities.
23. Partial updates:
   no asumir atomicidad global; staged activation, update journal,
   mixed-version fencing.
24. Self-monitoring:
   self telemetry es baja assurance; enforcement/world channels son externos.
25. Behavioral integrity:
   claim/trace/world divergence es anomaly, no prueba de intención.
26. Adversarial evaluation:
   evaluator/test fixtures/scoring fuera del control del candidato;
   hidden/sequestered/differential testing.
27. Model routing/learning:
   routing es control-plane; learning no crea authority; fallback no aumenta
   scope.
28. Assurance cases:
   cada critical effect necesita claim→threat→invariant→control→enforcement
   →test→evidence→monitor→recovery.
29. Semantic/data migration:
   byte/schema compatibility no garantiza semantic/epistemic/policy/authority
   compatibility. Se añadió Semantic Migration Contract, explicit mapping,
   information-loss rules, differential/round-trip/metamorphic tests,
   migration state machine e invariants INV-195..215.
30. Semantic refinement:
   migration debe relacionar estados fuente/destino mediante una relación
   semántica y preservar observables. Se añadió commuting-square/replay test,
   migration algebra, mixed-version states, backfill governance, protected
   authority switch y governed upcasters. Invariants INV-216..230.

## Reestructuraciones principales
- Se creó System Transition Gate como cross-layer commit point.
- Se añadió Authority Monotonicity.
- Se añadió Trust Monotonicity.
- Se añadió Dependency Closure.
- Se añadió Fail-Safe Composition.
- Se añadió Global Invariant Ledger y Counterexample Ledger.
- Se añadió Effect Surface Registry y Complete Mediation.
- Se añadió Execution Binding para TOCTOU.
- Se añadió Sink Integrity Contract.
- Se añadió Verification Independence Contract.
- Se añadió Verification Constitution.
- Se añadió Bootstrap Constitution/Genesis Trust Bundle.
- Se añadió Continuity Contract y version lineage.
- Se añadió staged update/partial update safety.
- Se añadieron artifacts de assurance y gap register.

## Estado de gaps
PG-001 Complete Mediation — cerrado arquitectónicamente.
PG-002 Request/State Binding — cerrado arquitectónicamente.
PG-003 Sink Integrity — cerrado arquitectónicamente; implementación pendiente.
PG-004 Independent Verification — cerrado arquitectónicamente; mapping/tests pendientes.
PG-005 Verifier/Policy/Reference Integrity — cerrado arquitectónicamente.
PG-006 Bootstrap / First Trust — cerrado arquitectónicamente.
PG-007 Continuity Across Change — cerrado arquitectónicamente.
PG-008 Partial Update / Atomicity — cerrado arquitectónicamente.
PG-009 Semantic/Data Migration Integrity — abierto.

## Qué NO debe afirmarse
- No decir que Nexo está “demostrado seguro” solo por tener esta arquitectura.
- No decir que TLA+ prueba toda la implementación.
- No decir que firmas/provenance prueban verdad.
- No decir que consenso mayoritario prueba hechos.
- No decir que un modelo confiado puede sustituir enforcement.
- No decir que rollback deshace efectos externos irreversibles.
- No decir que una alerta equivale a ataque cerrado.
- No decir que una anomalía prueba intención maliciosa.
- No decir que un benchmark demuestra seguridad en producción.

## Resultado PG-009 — 2026-09-23
PG-009 permanece abierto. La arquitectura ahora trata migración semántica como una capa propia. Un migration tool es un artifact gobernado; mixed-version critical state requiere compatibility contract; UNKNOWN no puede convertirse en VERIFIED por migración; historical policy/authority references permanecen version-bound; checkpoints y memory requieren semantic compatibility; destructive contract queda detrás de verification gates. Evidencia principal revisada: Apache Avro schema compatibility, Microsoft event-sourcing guidance, research on event-sourced schema evolution, OpenStack migration phases y 2026 expand/contract guidance.

## Siguiente punto
PG-009 Semantic/Data Migration Integrity — continuar con equivalencia formal, upcasters deterministas, crash recovery, checkpoint/memory migration, policy/authority compatibility, semantic diff, golden fixtures, differential replay y clean recovery.


31. PG-009 concurrent-write/cutover research:
   se añadió moving-source model, synchronization modes, dual-write divergence controls,
   normalized dual-read comparison, protected authority cutover, durable migration journal,
   crash-safe batch recovery, old-path retirement and invariants INV-231..240.
   Cross-check: Fowler Parallel Change/CI/Canary and Debezium schema-history/schema-evolution guidance.

32. PG-009 semantic-equivalence research:
   defined data-class-specific equivalence, non-vacuity requirements, three-level proof,
   explicit concurrent-write interleavings, snapshot/consistency boundaries, and independent
   acceptance relation. Added invariants INV-241..250. Next: formal small TLA+ model and policy/authority historical compatibility.

33. PG-009 first formalization:
   added TLA+ concurrency model sketch for backfill, concurrent source writes,
   divergence/catch-up and protected authority cutover. Status explicitly MODEL SKETCH,
   not TLC-verified. Added INV-251..255. Next: complete phase/recovery semantics, add
   duplicate/retry and cutover races, then run TLC and analyze counterexamples.

34. PG-009 crash-safe formalization:
   extended the TLA+ sketch with durable journal, in-flight state and recovery action.
   Added INV-256..260. Explicitly recorded that theorem text is not verification evidence;
   next work is model cleanup, full crash interleavings, duplicate operation IDs, target/journal
   consistency, cutover races, semantic abstraction and actual TLC checking.

35. PG-009 cutover-race finding:
   formal reasoning showed that preparation-time validation can become stale before authority commit.
   Added explicit cutover-fence design and invariants INV-261..265. The model is still not TLC-verified.
   Next: complete fence semantics, define whether late writes are blocked or incorporated, and model-check.

36. PG-009 fence-policy analysis:
   modeled BLOCKED, INVALIDATE, and CATCH-UP dispositions for writes during cutover fencing.
   Established INV-266..270: no mutation may disappear from migration state; unresolved fence-invalidating mutations block authority advancement; blocked writes need visible retry/failure semantics; catch-up preserves identity/provenance/ordering/evidence.
   Formal model remains a design sketch and is not TLC-verified.

36. PG-009 fence-policy formalization:
   the cutover boundary now explicitly distinguishes BLOCK_WRITES, INVALIDATE, and CATCH_UP semantics. Silent acceptance of late authoritative writes is forbidden. The TLA+ artifact remains a sketch; next step is normalization to one selected policy, complete variable/action semantics, and TLC verification with preserved counterexamples.


37. PG-009 model normalization:
   replaced the accumulated exploratory TLA+ sketch with a cleaner explicit state machine: BACKFILLING -> VERIFYING -> CUTOVER_PREPARED -> CUTOVER_FENCED -> CUTOVER, explicit FencePolicy, late-write handling, crash/inflight state, recovery, and authority-safety invariant. This remains unverified until a TLC-capable environment executes it. The cleanup is intended to make the next formal check meaningful rather than layering more partial actions onto the earlier sketch.

38. PG-009 operation identity/retry research:
   extended the formal migration sketch with stable operation identities, an operation ledger,
   replay-safe same-ID handling, explicit same-ID/different-payload identity conflicts, and
   authority blocking on unresolved identity conflicts. Added invariants INV-271..280.
   Important limitation preserved: operation identity establishes logical identity, not semantic correctness.
   Different operation IDs can still represent the same critical semantic effect; duplicate-effect detection
   is therefore the next research point. The model remains a sketch and is NOT TLC-verified.

39. PG-009 semantic duplicate-effect research:
   operation identity was separated from effect identity. Research cross-check confirms idempotency
   tokens protect repeated logical requests but do not provide a universal semantic duplicate detector.
   Added Effect Identity / Semantic Deduplication Contract, governed effect_key canonicalization,
   durable effect ledger, UNKNOWN blocking, operation-class-specific duplicate rules and adversarial cases.
   Added invariants INV-281..292. PG-009 remains OPEN; next step is formalizing effect identity/reconciliation
   and connecting it to external-world verification without claiming universal exactly-once semantics.

40. PG-009 external-effect uncertainty research:
   connected migration/idempotency research to the existing External Effect Contract. Established that
   absence of a local commit is not evidence of absence of an external effect. Added explicit REMOTE_UNKNOWN,
   reconciliation matrix, four evidence planes, external reconciliation capability classes R0-R4, bounded
   exactly-once interpretation, and invariants INV-293..302. Next: formalize external-effect reconciliation
   and crash interleavings while preserving local certainty vs receipt vs world verification.

41. PG-009 external-effect reconciliation formal sketch:
   created docs/nexo/formal/PG-009_EXTERNAL_EFFECT_RECONCILIATION_SKETCH_2026-09-23.tla.
   The model separates NOT_STARTED/PREPARED/SENT/REMOTE_UNKNOWN/REMOTE_CONFIRMED/
   VERIFICATION_PENDING/VERIFIED/RECONCILIATION_REQUIRED/BLOCKED, plus operation identity,
   effect key, receipt, world observation, local ledger, authority and revocation.
   It explicitly models the crash-before-ledger boundary and requires reconciliation before
   returning from UNKNOWN toward execution. Important: this is an exploratory TLA+ sketch,
   NOT TLC-VERIFIED. It also intentionally does not claim that receipt proves world truth.
   Next refinement: model multiple effects sharing a target/effect key, legitimate repeats,
   semantic collisions, stale observations, and explicit forbidden blind retry transitions.

42. PG-009 refinement review: current external-effect sketch is intentionally single-effect and is not sufficient for semantic deduplication. Current AWS guidance reinforces that idempotency must be applied deliberately, keys must remain stable across retries, and indiscriminate idempotency can be an anti-pattern. This supports the next refinement: distinguish SAME_OPERATION_REPLAY, SAME_EFFECT_LEGITIMATE_REPEAT, EFFECT_COLLISION, and UNKNOWN before suppressing execution. The sketch scope was explicitly marked before concurrency refinement. Commit 0d0a6c53996a010f99cd39058e8b7501efd148e8.
