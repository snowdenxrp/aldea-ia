# NEXO — ARQUITECTURA CONSOLIDADA
Fecha: 2026-09-23

## Propósito
Este documento preserva el estado transferible de la arquitectura conceptual de Nexo: principios, decisiones, amenazas, controles, invariantes, dependencias, gaps y siguiente punto de investigación.

## Flujo permanente
INVESTIGATE → ANALYZE → CONTRAST → RESTRUCTURE/BUILD → VERIFY → SAVE

Reglas: investigar antes de afirmar hechos actuales; contrastar fuentes y supuestos; no tratar ninguna fuente como infalible; si aparece evidencia que invalida una pieza, reconstruirla en vez de apilar parches; distinguir confirmado/provisional/unknown; convertir cada fallo descubierto en control + invariante + prueba adversarial + regresión; distinguir arquitectura diseñada de implementación realmente verificada.

## Separaciones fundamentales
MEMORY = lo que Nexo conserva.
MISSION STATE = estado de una misión.
EXECUTION HISTORY = lo que realmente fue registrado.
CHECKPOINT = snapshot reconstruible ligado a una posición del historial.
WORLD STATE = lo que existe fuera de Nexo.
TRUSTED HISTORY = historia cuya integridad, autoría, orden y autoridad pueden verificarse.
CLAIM = afirmación.
EVIDENCE = soporte de una afirmación.
FACT = hecho registrado.
VERIFIED FACT = hecho que satisface la política de verificación aplicable.

INTEGRITY OF HISTORY ≠ TRUTH OF HISTORY.
Authentication/integrity/provenance no equivalen por sí solos a verdad semántica.

## Principio central
COGNITION ≠ AUTHORITY ≠ EXECUTION ≠ VERIFICATION.

El modelo puede razonar/proponer/planear, pero no puede concederse autoridad, crear capabilities, modificar la Constitution, convertir sus propias salidas en hechos verificados, desactivar controles ni aprobar su propia modificación.

Cadena base:
TRUST ANCHOR → IDENTITY → AUTHORITY → CAPABILITY → POLICY → WORLD REVALIDATION → EXECUTION → VERIFICATION → DURABLE HISTORY → CHECKPOINT.

## Constitution + System Transition Gate
La Constitution es la raíz versionada e inmutable de las reglas: constitution_id/version/hash, invariantes protegidos, dominios de autoridad, reglas de amendment, emergency containment, trust roots, gates obligatorios, transiciones prohibidas, recovery, evaluator independence y audit.

Estado:
S={epoch,authority,capabilities,missions,goals,agents,resources,leases,policy,evidence,world,memory,transactions,external_effects,monitors,model_routes,governance,history,recovery,assurance}.

Transition:
T={transition_id,actor,mission,pre_state_refs,action,read_set,write_set,required_capabilities,authority_epoch,policy_version,evidence_refs,world_version,resource_versions,invariants,expected_delta,verification_plan,expiry}.

ALLOW(T,S) requiere los gates aplicables: identity, authority, capability, goal containment, policy, evidence/trust, world freshness, resource/lease/version, global invariants, dependency closure, anti-replay, assurance/risk y transaction/external-effect constraints.

UNKNOWN/CONFLICT/UNTRUSTED en un gate crítico => DENY/HOLD/REVALIDATE/RESTRICT; nunca fallback permisivo.

El Gate es también componente crítico: attestation, versión, constitutional hash, PEP independiente, fail-closed, monitorización y control dual para cambios constitucionales.

## Authority / Trust monotonicity
Ninguna transición ordinaria puede aumentar authority, capability, data scope o autonomy salvo transición explícitamente autorizada por Constitution/policy.
Evidence de menor assurance, tainted, stale o unknown no puede elevarse por sí misma.
Dependency Closure: decisiones críticas llevan dependencias de policy, epoch, capability, evidence, world version, model/tool identity, resource versions y trust assumptions.
Si una dependencia crítica falla, el estado dependiente se vuelve STALE/REASSESS_REQUIRED/BLOCK.
Fail-Safe Composition: perder confianza nunca aumenta autonomía.

## Mission / Goal integrity
MISSION ROOT → Mission Contract + Goal + Scope + Success Conditions + Constraints.
Mission Root no puede mutar por modelo, agente, memoria, contenido externo o herramienta.
Adaptive refinement cambia HOW, no WHY.
Legitimate amendment cambia WHY mediante autoridad.
Hijacking cambia WHY sin autorización.

Goal lineage:
goal → parent_goal → Mission Root.

Goal Refinement Contract: goal_id, parent_goal_id, objective, refinement_type, justification, evidence_ids, affected_resources, scope_delta, constraints, success_relation, required_capabilities, policy_version, authority_epoch, expiry.

ChildGoal ⊆ ParentScope en recursos, acciones, autoridad, budget, tiempo, riesgo y efectos externos.
Fuera de scope => REAUTHORIZATION REQUEST; request ≠ authorization.

Goal Integrity Firewall:
proposal → lineage → containment → semantic diff → mission relation → policy → authority → evidence/provenance → ALLOW/REFINE/REAUTHORIZE/DENY.

No automatic scope creep.

## Goal validity / specification gaming
Goal Contract: purpose, scope, required_outcomes, forbidden_outcomes, success_conditions, proxy_metrics, world_verification, refinement_operators, assumptions, uncertainty, authority, policy_version, expiry.
Goal Proof Obligation: cada child goal conserva outcomes, prohibiciones, scope, autoridad/budget y relación de éxito.
Proxy metrics guían pero no prueban éxito.
goal satisfaction ≠ proxy satisfaction ≠ local completion ≠ world effect ≠ verified mission success.
Si cambia el mundo fuera de los supuestos, GOAL STALE → REVALIDATION.

## Evidence / provenance / taint
Evidence Provenance Envelope: evidence_id, source identity, origin, acquisition time, integrity/authentication, trust class, mission binding, parent evidence IDs, transformations, freshness, validation status.
Estados: UNTRUSTED → AUTHENTICATED → VALIDATED → CORROBORATED → VERIFIED.
AUTHENTICATED ≠ TRUE.
Taint persiste por transformaciones hasta una frontera explícita de validación.
External data no crea authority.

## Claim verification
Claim Contract: claim_id, proposition exacta, scope, evidence class, minimum sufficiency, freshness, independence, contradiction policy, verification method, world observation requirement.
Appraisal: provenance, freshness, relevance, support, completeness, sufficiency, independence/common-root correlation, contradictions, verifier trust.
Estados de fallo: CONTRADICTED, CONFLICT, INSUFFICIENT, STALE, UNKNOWN, DEPENDENCY_RISK, VERIFIER_UNTRUSTED, TRUST_BASIS_UNKNOWN.

## Independent verification
Independence es relativa al claim y failure mode. Se evalúan source/model/data/memory/policy/verifier/keys/hardware/software/provider/network/operator/control-plane/failure-domain.
Tres verificadores usando la misma fuente no son tres corroboraciones independientes.
Ladder:
L0 SELF_REPORTED
L1 AUTHENTICATED_RECEIPT
L2 INDEPENDENT_OBSERVATION
L3 CROSS_SOURCE_CORROBORATION
L4 WORLD_VERIFIED
Disagreement crítico => CONFLICT/UNKNOWN salvo política prevalidada.

## Meta-verification
Separar Claim Specification, Verification Policy, Reference Values, Verifier Implementation y Decision Policy.
Policy Contract: id/version/hash, scope, evidence requirements, freshness, independence, thresholds/reference values, assumptions, failure conditions, tests, owner/authority, expiry, dependencies.
Reference Value Contract: id/version/hash, provenance, provider, scope, validity, update authority, dependency roots, validation evidence.
Verifier Contract: id/version/build hash, dependencies, policy/reference hashes, attestation, coverage, blind spots, tests, expiry.
Cadena: CLAIM → POLICY → REFERENCES → VERIFIER → EVIDENCE → RESULT → DECISION.
Cambios materiales invalidan assurance dependiente; la historia no se reescribe.

## World Model
WORLD MODEL ≠ MEMORY.
Epistemic states: VERIFIED_FACT, OBSERVED, SUPPORTED_CLAIM, BELIEF, HYPOTHESIS, PREDICTION, ASSUMPTION, UNKNOWN, CONFLICTED, STALE, INVALIDATED.
Nunca prediction→observation, belief→fact, memory→fact, probability→authority.
Belief revision conserva historia, evalúa evidencia, identifica dependencias, degrada lo no sustentado, añade lo nuevo, propaga consecuencias y revalida decisiones.
Causalidad no se infiere por simple secuencia.

## Causal reasoning / experimentation
Causal edges: CORRELATION, TEMPORAL, CAUSAL_HYPOTHESIS, VERIFIED_CAUSAL, DEPENDENCY, CONFOUNDING, UNKNOWN.
Intervention Contract: hypothesis, target, expected effect, controls, confounders, scope, resources, risk, authority, budget, stop conditions, success/falsification, observation, verification, rollback/compensation, expiry.
Experimentos E0 simulation → E5 irreversible/high-impact. Usar el nivel mínimo capaz de contestar la pregunta.
Stop conditions fuera del modelo.
Simulation/counterfactual ≠ world observation.

## External world
External systems tienen estado propio.
External Effect Contract: external_system, target, operation_id/idempotency key, preconditions, normalized parameters, expected effect, confirmation source, reversibility/compensation, timeout, expiry, ownership, reconciliation.
Timeout/crash/network ambiguity => UNKNOWN.
Retry solo con idempotency/duplicate safety explícita.
External response ≠ world truth.

## Request/state binding
Execution Binding: operation_id, actor_identity, mission_id, goal_id, resource_id, normalized_operation, normalized_parameters, target, capability_id, policy version/hash, authority epoch, resource version, evidence version, expiry, nonce.
Fingerprint = Hash(identity + mission + target + operation + parameters + capability + policy + epoch + resource_version).
REQUEST → NORMALIZE → FINGERPRINT → AUTHORIZE → BIND → EXECUTE EXACTLY THAT REQUEST → VERIFY.
Cambios materiales invalidan autorización.

## Sink integrity
Critical sink debe demostrar runtime identity, artifact digest, dependency closure, config/policy hash, attestation, request binding, observer, freshness, resource version y epoch.
Cadena: trusted boot → measured platform → admitted artifact → dependencies/config → attested process → capability → bound request → sink.
Firma/provenance del artefacto no prueba ejecución actual.
Sink receipt = evidence, no world truth.

## Capabilities / delegation / revocation
Capability(subject, mission, resource, operation, constraints, expiry, nonce, issuer, parent/delegation, audit_id).
CAP(child) ⊆ CAP(parent).
Revocation states: REQUESTED, FENCED, DRAINING, QUIESCED, ABORTED, RECONCILING, VERIFIED_TERMINATED.
Force-stop ≠ rollback.
No resurrection: trabajo revocado no continúa con autoridad stale.

## Transactions
Transaction Contract: transaction_id, mission_id, operation_ids, read/write sets+versions, leases, epoch, policy, pre/postconditions, invariants, commit/compensation/reconciliation policies, expiry, external effects.
Atomicity classes: A local atomic, B single-system transaction, C coordinated prepare/commit, D Saga/compensatable, E irreversible external, F human-mediated.
Lifecycle: PLANNED → ADMITTED → AUTHORIZED → RESERVED → PREPARED → EXECUTING → PARTIALLY_APPLIED → COMMITTING → COMMITTED → VERIFIED.
Unknown external outcome requiere reconciliation.
Finalization barrier impide TERMINATED/COMMITTED mientras existan cleanup/reconciliation/verification obligations.

## Resources / arbitration
Resource Constitution define class, owner, capacity, quotas, lease, version/fencing, admissible operations, conflict class, preemption, fairness, compensation, epoch y expiry.
Classes: SHAREABLE, COMMUTATIVE, EXCLUSIVE, NON_COMMUTATIVE, INVARIANT_COUPLED, EXTERNAL.
Arbitration: SHARE / SERIALIZE / RESERVE / PREEMPT / REPLAN / DENY / ESCALATE.
Priority changes scheduling opportunity, never authority.
Deadlock por wait-for graph; nunca se resuelve saltando authorization.

## Global composition
LOCAL AUTHORIZATION + GLOBAL SAFETY CHECK.
CURRENT WORLD → ACTION → EXPECTED NEW STATE → GLOBAL INVARIANTS → ALLOW/DENY.
Global budgets: impact, exposure, privilege, delegation, fanout, retry, compute, irreversibility, external effects, privacy.
Cascade response: observe → throttle → stop fanout → quarantine → preserve evidence → reassess.
SAFE PROGRESS o SAFE ABORT + RECOVERY PATH.

## Multi-agent collective safety
Collective State tracks agents, communication edges, shared resources, shared evidence, delegation ancestry, budgets and coordinated effects.
Signals: NORMAL, RAPID_COORDINATION, COORDINATION_DRIFT, COMMON_MODE_RISK, CORRELATED_FAILURE, COLLUSION_SUSPECTED.
Signals no son veredictos de intención.
Information sharing = capability.
Collective response: OBSERVE → THROTTLE → LIMIT COMMUNICATION → FREEZE SPAWNING → FENCE → QUARANTINE → REVOKE → RECONCILE.

## Governance / human authority
Separar PROPOSAL → DELIBERATION → AUTHORIZATION → EXECUTION → VERIFICATION.
Votes = evidence; votes ≠ authority.
Critical operations separan proposer/approver/executor/verifier cuando sea posible.
Human approval se liga a operación exacta, parámetros normalizados, target, scope, evidence, policy, epoch, risk, expiry, nonce y UI version.
Cambios invalidan aprobación.
Emergency authority solo containment: STOP/FENCE/REVOKE/ISOLATE/QUARANTINE.

## Privacy / memory sovereignty
Data Constitution: id, owner/controller, subjects, classification, purpose, allowed uses, mission, provenance, sensitivity, retention, disclosure, sharing, jurisdiction/policy, encryption, deletion, audit, expiry.
Purpose binding evita reutilización silenciosa.
Memory access es capability READ/WRITE/SHARE/DELETE/EXPORT con purpose/mission/scope/expiry.
Derived data conserva lineage.
Deletion: ACTIVE → EXPIRING → RESTRICTED → DELETE_REQUESTED → QUARANTINED → DELETED/CRYPTO_ERASED → VERIFIED.
Audit conserva evidencia mínima, no payload sensible innecesario.

## Memory integrity / forgetting
Tiers: WORKING, EPISODIC, SEMANTIC, PROCEDURAL/SKILL, IDENTITY/CONTINUITY, SECURITY/AUDIT, QUARANTINED.
Memory Record conserva sources, provenance, purpose, mission, epistemic state, freshness, dependencies, sensitivity, TTL, review, version, parents, derived_from, contradictions y status.
Memory admission no depende solo de un flag del modelo.
Forgetting puede ser deletion, suppression, archive, demotion, summarization o expiry.
Compression preserva uncertainty y lineage.
Memory poisoning: WRITE → SCHEMA → PROVENANCE → TAINT → VALIDATION → POLICY → VERSIONED COMMIT.

## Temporal consistency
Separar wall-clock, monotonic time y logical/causal order.
observed_at ≠ received_at.
Tiempo = value + uncertainty.
Temporal states: FUTURE_TIMESTAMP, CLOCK_SKEW, STALE, OUT_OF_ORDER, CAUSALLY_INCOMPATIBLE, TIME_UNCERTAIN.
Freshness es claim-relative.

## Concurrent conflicts
Tipos: CAUSALLY_ORDERED, CONCURRENT_NONCONFLICTING, CONCURRENT_CONFLICTING, AUTHORITY_CONFLICT, INVARIANT_CONFLICT, UNKNOWN.
Automatic merge solo con merge law validado y preservación de invariants.
Critical conflict usa serialization/quorum/epoch/fencing/block/revalidate.
No last-write-wins universal.

## Partition / disaster recovery
Modes: CONNECTED, DEGRADED, PARTITION_SUSPECTED, PARTITIONED, QUORUM_LOST, RECOVERY, RECONCILING.
Safety > availability para authority crítica.
Degraded: NORMAL → READ_ONLY → LOCAL_SAFE_MODE → CONTAINMENT_ONLY → OFFLINE.
Quorum loss no permite nuevas authority changes ni efectos irreversibles coordinados.
Solo un critical authority epoch activo.
Recovery verifica epochs, rechaza ramas stale, reconcilia, crea nuevo epoch, reemite capabilities y verifica mundo.
Sin trust path independiente: TRUST_UNRECOVERABLE.

## Root of trust / clean recovery
Separar trust anchors, recovery authority, identity issuers, capability authority, policy/constitution signing, audit keys y data keys.
Root compromise: SUSPECTED → FROZEN → ISOLATED → EVIDENCE_PRESERVED → ROOT_REVOKED → CLEAN_RECOVERY → NEW_EPOCH → REATTESTED → REISSUED → VERIFIED.
Nuevo root criptográficamente independiente.
Recovery no depende exclusivamente del root comprometido.
Snapshot no puede resurrect revoked authority.

## Bootstrap / first trust
Nexo no se autodeclara confiable.
Genesis Trust Bundle contiene constitution hash, trust anchors, recovery authorities, policy/reference hashes, admitted artifacts/dependencies, platform measurements, initial epoch y approval evidence.
First boot: HARDWARE/PLATFORM ROOT → VERIFIED BOOT → MEASURED BOOT → BOOTSTRAP RUNTIME → CONSTITUTION → POLICY/REFERENCES → GATE/PEP → IDENTITY → NEXO → CAPABILITIES.
Bootstrap failure => NO_ACTIVATION/RECOVERY.
Genesis activation requiere autoridad externa/independiente o threshold según deployment.

## Continuity across change
Continuity = lineage + authorized transition, no nombre idéntico.
Cada material change crea nueva version/epoch y fresh capabilities.
Continuity proof: old admitted state + authorized transition + provenance + dependency/config validation + attestation + new epoch + assurance evidence.
Old credentials nunca se heredan ciegamente.
Fork/cloned snapshot no puede reclamar operational identity sin transición autorizada y fresh attestation.
Key rotation conserva validación histórica según policy pero impide uso nuevo de claves revocadas.

## Partial update / mixed-version safety
Admitted System Version Set = Runtime + Gate + Verifier + Model + Dependencies + Policy + Config + Schema + State-machine + Epoch.
Una combinación no admitida no es ACTIVE para critical operations.
Update: PROPOSED → DIFFED → PROVENANCE_VERIFIED → DEPENDENCY_VERIFIED → EVALUATED → APPROVED → STAGED → ATTESTED → CANARY → ACTIVE → VERIFIED.
Staged transition: OLD → PREPARE NEW → VERIFY NEW → FENCE OLD → ACTIVATE NEW → ATTEST → VERIFY → COMMIT.
Crash recovery usa update journal y attestation; no asume atomicidad.
Rollback es una nueva transición gobernada, no viaje temporal.
Irreversible schema/data migration puede impedir rollback de software.

## Self-observation / monitoring
Telemetry channels: SELF, ENFORCEMENT, WORLD, SECURITY/RESOURCE.
Self-report = low assurance.
Critical monitoring fuera del modelo.
Monitor states: HEALTHY, DEGRADED, BLIND, TAMPER_SUSPECTED, COMPROMISED, UNKNOWN.
Missing telemetry = UNKNOWN/TELEMETRY_GAP.
Monitor compromise reduce assurance/autonomy.

## Behavioral integrity / deception resistance
Behavioral Integrity Contract: goal, scope, predicted effect, evidence, tool sequence/risk, success, expiry.
Comparar claim vs trace vs world.
Anomaly classes: CLAIM_ACTION_MISMATCH, PLAN_ACTION_MISMATCH, TOOL_PATTERN_ANOMALY, RESOURCE_ANOMALY, GOAL_DRIFT, AUTHORITY_SEEKING_PATTERN, VERIFICATION_AVOIDANCE, MONITOR_INTERFERENCE, MEMORY_TAMPERING_ATTEMPT, ROUTE_MANIPULATION, APPROVAL_PRESENTATION_MISMATCH, PEER_COORDINATION_ANOMALY.
Anomaly ≠ proof of malicious intent.
Approval UI debe representar el mismo normalized executable request.

## Adversarial evaluation
Evaluation environment es security boundary.
Modelo no controla hidden tests, evaluator, scoring, fixtures o release authority.
Usar hidden/sequestered tests, differential testing, behavior invariance, sandbagging analysis, world outcomes, metamorphic/property/mutation tests y monitor blind-spot tests.
Eval-awareness signal ≠ proof of intent.

## Model replacement / routing / learning
Identity ≠ model.
New model: shadow → canary → admission → fresh credentials.
No capability inheritance.
Fallback pre-admitted, bounded y authority ≤ primary.
Routing considera task, risk, capability, verification, budgets, privacy, allowed models, fallback y failure-domain diversity.
Learning: OBSERVATION → EVIDENCE → CANDIDATE → EVALUATION → ADMISSION → DEPLOYMENT.
Improvement no aumenta automáticamente authority/capabilities/data/network/delegation/budget/autonomy.
L4+ security/control-plane changes requieren independent admission.

## Supply chain
Cada executable artifact/config/dependency tiene provenance, version, integrity, dependency closure, admission y revocation.
source → build → dependencies → artifact → deployment → runtime attestation.
SBOM/AIBOM/provenance apoyan assurance pero no prueban semantic safety.
Compromised dependency puede invalidar assurance transitivamente.

## Physical boundary
Cuando Nexo controla sistemas físicos:
AI intent → Safety Gate → Independent Safety Controller → Hard Limits/Interlocks → Actuator → Physical World.
Sensores: freshness/range/plausibility/calibration/cross-check.
AI no puede aumentar safety limits.
Loss of communication no puede aumentar actuation.

## Threat graph
Threat Contract: preconditions, attacker capabilities, assets, entry vector, trust boundaries, assumptions, impact, signals, invariants, containment, recovery, uncertainty.
Attack path: entry → influence → authority → execution → persistence/cascade → impact.
Minimal-cut analysis identifica fallos comunes que podrían atravesar todas las barreras.
Critical effect closure requiere containment + reconciliation + verification, no solo alert.

## Assurance case
CLAIM → CONTEXT/ASSUMPTIONS → THREATS → SUBCLAIMS → INVARIANTS → CONTROLS → ENFORCEMENT → TESTS → EVIDENCE → MONITORING → RECOVERY.
Estados: UNSUPPORTED, PARTIAL, SUPPORTED, VERIFIED, STALE, CONTRADICTED, UNKNOWN, INVALIDATED.
Cada critical effect debe tener threat coverage, invariant, enforcement point, telemetry, verification, recovery, dependency closure, evidence y regression.

## Property gaps
PG-001 Complete Mediation / Enforcement Bypass — arquitectónicamente cerrado.
PG-002 Request/State Binding / TOCTOU — cerrado.
PG-003 Sink Integrity / Effect Authenticity — cerrado arquitectónicamente; requiere integración real de attestation/sink.
PG-004 Independent Verification / False Corroboration — cerrado arquitectónicamente; requiere failure-domain mapping y tests reales.
PG-005 Verification Policy / Reference / Verifier Integrity — cerrado arquitectónicamente.
PG-006 Bootstrap Integrity / First Trust — cerrado arquitectónicamente.
PG-007 Continuity Across Change — cerrado arquitectónicamente.
PG-008 Partial Update / Atomicity — cerrado arquitectónicamente.
PG-009 Semantic/Data Migration Integrity — ABIERTO.

## PG-009
Pregunta: ¿Puede una versión nueva interpretar distinto un dato histórico aunque ningún bit esté corrupto?
Riesgos: schema drift, enum drift, unit drift, temporal semantics, epistemic drift, policy semantic drift, memory migration, provenance loss, uncertainty loss, changed meaning of VERIFIED/SUCCESS/AUTHORITY.
Objetivo:
OLD SEMANTICS → EXPLICIT MAPPING → NEW SEMANTICS → INVARIANT PRESERVATION → GOLDEN TESTS → DIFFERENTIAL/ROUND-TRIP/METAMORPHIC/NEGATIVE TESTS → ADMISSION.
Si preservación semántica no puede demostrarse: BLOCK/RESTRICT.

## Invariantes maestras
Las invariantes acumuladas cubren authority monotonicity, capability containment, goal lineage, trust monotonicity, dependency closure, fail-safe composition, global invariants, resource fencing, operation-id duplicate safety, unknown external effects, model-output separation, memory/evidence authority separation, exact approval/request binding, no resurrection, split-brain prevention, checkpoint safety, evaluator independence, privacy/purpose containment, critical verification, immutable history, collective budgets, security-control availability, physical safety, complete mediation, sink binding, verifier integrity, bootstrap integrity, continuity lineage y mixed-version fencing.
Los IDs históricos de invariantes no deben renumerarse. Los nuevos continúan desde el último ID asignado en el registro canónico.

## Artifacts canónicos
Coverage Matrix
Gap Register
Critical Effect Registry
Common-Mode Dependency Map
Assurance Case
Assurance Dependency Graph
Assumption Registry
Counterexample Ledger
Effect Surface Registry
Verification Source Registry
Trust Dependency Graph
Mission Dependency Graph
Conflict Graph
Update Journal
Version Lineage Graph
Regression Test Registry.

## Estado
Arquitectura conceptual consolidada hasta PG-008.
PG-009 abierto.
La arquitectura es diseño; su implementación debe probarse con formal model checking, property tests, adversarial tests, fault injection, recovery tests y world verification.

## Regla de continuidad
No borrar historia para “arreglarla”. Las correcciones son nuevos eventos/versiones.
No confundir un snapshot con la fuente de verdad.
No confundir una alerta con cierre.
No confundir un modelo mejor con mayor autoridad.

## Siguiente investigación
1. Schema evolution/compatibility.
2. Event-sourcing/history semantic compatibility.
3. Database/data migration safety.
4. Memory/checkpoint migration.
5. Temporal/epistemic/policy semantic compatibility.
6. Semantic Migration Contract.
7. Semantic-preservation invariants.
8. Golden/differential/round-trip/metamorphic/negative tests.
9. Adversarial migration attacks.
10. Verify → restructure if needed → save.

---
Este documento es un snapshot arquitectónico transferible. No sustituye las fuentes originales, código, pruebas ni evidencia de implementación.


## Current PG-009 continuation — 2026-09-24

The snapshot above is historical baseline content. The current PG-009 state is maintained by the canonical index, continuity log, and dated delta artifacts; this section preserves the link without rewriting historical sections.

### Recovery/restart fencing
After emergency STOP, restart is not release. A durable recovery fence binds stop/gate/recovery epochs, recovery ownership, current authority, capabilities, policy/invariant/dependency versions, world/reconciliation conditions and artifact/config/runtime admission. Checkpoint restore restores state, not authority. INV-629..648. Artifact: docs/nexo/PG-009_RECOVERY_RESTART_FENCING_2026-09-24.md. Formal sketch: docs/nexo/formal/PG-009_RECOVERY_RESTART_FENCING_SKETCH_2026-09-24.tla. NOT TLC-VERIFIED.

### Safety-plane update / rollback / bootstrap trust
A signed or attested artifact is not automatically authorized or semantically safe. Safety-plane updates require digest binding, provenance/attestation verification, dependency closure, semantic/policy compatibility, common-mode review, independent admission, staged activation, post-activation verification and reconciliation. Rollback is a new governed transition; recovery artifacts require an independently protected authenticated path. INV-649..668. Artifact: docs/nexo/PG-009_SAFETY_PLANE_UPDATE_ROLLBACK_BOOTSTRAP_2026-09-24.md. NOT implemented/TLC-verified.

### Current PG-009 next point
Common-mode/correlated-failure analysis across safety, recovery, update, identity, storage, network, policy, verifier and executor domains; then expand/correct formal modeling and run TLC when tooling is available.
