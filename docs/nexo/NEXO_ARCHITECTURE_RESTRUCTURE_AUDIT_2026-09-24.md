# NEXO — REESTRUCTURACIÓN Y AUDITORÍA DE CONSISTENCIA
Fecha: 2026-09-24
Estado: AUDITORÍA ARQUITECTÓNICA EN CURSO

## 1. Propósito
Revisión transversal para detectar contradicciones, supuestos ocultos, duplicación de autoridades, estados ambiguos, garantías sobreafirmadas y divergencias entre arquitectura, esquemas, implementación ejecutable y modelos formales.

Regla de madurez: DESIGNED → SPECIFIED → IMPLEMENTED → TESTED → FORMALLY_CHECKED → INTEGRATED → VERIFIED. Un estado superior no se infiere automáticamente de uno inferior.

## 2. Conclusión principal
La arquitectura acumulada tiene una base coherente, pero el crecimiento incremental por Property Gaps creó un riesgo de coherencia local sin coherencia global. La solución no es seguir agregando invariantes aisladas: hay que consolidar un núcleo canónico de estados, autoridades, identidades y transiciones, y derivar los gaps desde ese núcleo.

## 3. Contradicciones e inconsistencias detectadas

### C-01 — PG-009 tiene dos significados
El snapshot histórico define PG-009 como Semantic/Data Migration Integrity; la investigación posterior lo amplió a recovery fencing, safety-plane updates, common-mode failure, formal correspondence y external-effect identity. No es una contradicción técnica directa, pero sí una contradicción de taxonomía.
Decisión: conservar la historia y dividir conceptualmente en PG-009-SM, PG-009-RF, PG-009-SP, PG-009-CM y PG-009-EE.

### C-02 — Hay dos capas formales para recovery/external effects
El modelo recovery/common-mode no contiene todavía toda la identidad operation/effect/target, mientras existe un sketch separado que sí la modela. Riesgo: dos fuentes formales divergentes.
Decisión: el sketch separado es auxiliar; antes de afirmar cobertura formal global debe integrarse o mapearse explícitamente al modelo canónico.

### C-03 — Documentación de correspondencia contiene afirmaciones históricas obsoletas
Parte de la documentación conserva la descripción de clausura formal de un solo salto aunque el desarrollo posterior añadió clausura recursiva.
Decisión: los textos históricos se preservan como historia; el estado actual debe salir de un único ledger reconciliado.

### C-04 — KNOWN puede ser demasiado fuerte en el formal sketch
ReconcileWorld puede representar KNOWN sin una cadena explícita de evidencia, procedencia y frescura. Eso puede confundir afirmación de reconciliación con prueba del mundo.
Decisión: separar OBSERVED, EVIDENCE_VALID y WORLD_VERIFIED. KNOWN no debe equivaler automáticamente a WORLD_VERIFIED.

### C-05 — Generation monotonicity no es todavía un teorema temporal
Las propiedades actuales garantizan esencialmente que generation sea no negativa; eso no demuestra por sí solo que nunca retroceda entre estados.
Decisión: demostrar el incremento mediante transiciones temporales o rebajar el nombre de la propiedad.

### C-06 — Lease y verdad del efecto son hechos distintos
Lease válida o expirada describe coordinación/ownership. No prueba ausencia, cancelación ni reversión del efecto externo.
Regla: LEASE_EXPIRED no implica NO_EFFECT; OWNER_LOST no implica EFFECT_ABSENT.

### C-07 — I0-I5 puede confundirse con un score
I0-I5 son etiquetas arquitectónicas de independencia. El evaluator calcula un ceiling heurístico.
Decisión: el evaluator solo restringe/informa admission; no es certificación ni puntuación universal de seguridad.

### C-08 — CLOSED es demasiado fuerte como estado
Varios gaps se describen como cerrados arquitectónicamente aunque faltan integración runtime, pruebas reales, TLC, fault injection o world verification.
Decisión: usar el ciclo DESIGNED / SPECIFIED / IMPLEMENTED / TESTED / FORMALLY_CHECKED / INTEGRATED / VERIFIED.

### C-09 — Separación de procesos no demuestra independencia
Servicios o procesos distintos pueden compartir host, kernel, hypervisor, storage, identidad, root, policy, artifact, operator o semantics.
Decisión: independencia siempre es claim-relative y dependency-closure-relative.

### C-10 — Emergency STOP no garantiza cancelación externa
STOP puede bloquear nueva ejecución local mientras un efecto externo previamente emitido permanece UNKNOWN.
Decisión: emergency-stop y external-effect reconciliation son máquinas separadas unidas por una barrera explícita de reconciliación.

### C-11 — Rollback no es automáticamente seguro
Un artefacto anterior puede ser auténtico pero incompatible con schema, policy, state, security epoch o efectos pendientes.
Decisión: rollback entra por la misma admission/reconciliation machinery que una transición gobernada nueva.

### C-12 — Correspondence no es equivalence
Schema, evaluator, fixtures y TLA+ son representaciones distintas.
Decisión: cualquier PARTIAL/UNMAPPED permanece explícito; compartir vocabulario no prueba equivalencia formal.

## 4. Arquitectura canónica reestructurada

Layer 0 — Constitution / Trust Root: reglas protegidas, invariantes, authority domains, amendment y trust anchors.
Layer 1 — Identity / Authority: actor, authority, epoch, capability, mission y scope.
Layer 2 — Mission / Goal / Intent: mission root → goal → refinement → executable request.
Layer 3 — Request / Effect Identity: operation_id → effect_id/effect_key → target_id → normalized parameters → preconditions → fingerprint.
Layer 4 — Policy / Admission: authority + capability + containment + policy + evidence + world freshness + versions + epochs + dependency closure + risk.
Layer 5 — Coordination / Fencing: authority epoch, stop epoch, gate epoch, recovery generation, reconciliation generation. Leases coordinate; no prueban hechos del mundo.
Layer 6 — Execution / Actuation: consume únicamente la solicitud exacta ya autorizada.
Layer 7 — Observation / Reconciliation: evidencia ligada a operation/effect/target + owner/generation + authority epoch + time/freshness + provenance + dependency closure + relevant versions.
Layer 8 — Verification / Assurance: claim exacto contra evidencia e independencia requerida.
Layer 9 — Durable History / Recovery: conserva lineage; recovery restaura estado pero no authority.

## 5. Máquina canónica de efectos críticos
PROPOSED → NORMALIZED → FINGERPRINTED → ADMITTED → AUTHORIZED → RESERVED → PREPARED → EXECUTING → EXTERNAL_UNKNOWN / PARTIALLY_APPLIED / APPLIED → OBSERVED → RECONCILED → VERIFIED → COMMITTED.
Emergency: STOP_REQUESTED → STOP_ENFORCING → EXECUTION_BLOCKED / ACTUATION_INTERRUPTED → STOP_VERIFIED → RECONCILIATION_REQUIRED.
Recovery: RESTARTED → QUARANTINED → IDENTITY_ATTESTED → ARTIFACT_CONFIG_VERIFIED → CURRENT_FENCE_OBSERVED → CURRENT_AUTHORITY_VALIDATED → RECOVERY_OWNER_ACQUIRED → RECOVERY_RECONCILED → RELEASE_ELIGIBLE → EXPLICIT_RELEASE.
No transition is implied by reboot, timeout, lease expiry, missing telemetry, process exit, new operation ID or local success.

## 6. Regla canónica de evidencia
CLAIM → EXACT SCOPE → EXACT EFFECT IDENTITY → PROVENANCE → FRESHNESS → DEPENDENCY CLOSURE → INDEPENDENCE/CORRELATION → POLICY → VERIFICATION → DECISION.
Evidence is usable only when it concerns the same semantic object, is fresh enough, was produced under admissible authority/epoch, depends on still-trusted domains, has not been invalidated, and satisfies the claim policy.

## 7. Semántica canónica de UNKNOWN
UNKNOWN es estado epistemológico, no interpretación permisiva.
Timeout, network loss, missing telemetry, lease expiry, process exit y valid signature no se transforman automáticamente en NO_EFFECT, EFFECT_ABSENT, WORLD_SAFE o AUTHORIZED.

## 8. Conclusiones
1. El núcleo reusable es exact-bound state transition bajo authority gobernada.
2. Identity, authority, effect identity, evidence identity y world identity no deben colapsarse.
3. Epochs/generations/leases son fences de coordinación, no verdad epistemológica.
4. Recovery es una nueva frontera de autorización.
5. Emergency STOP termina/controla ejecución local pero puede dejar una obligación externa de reconciliación.
6. Common-mode analysis debe formar parte de cada safety claim de alta assurance.
7. Los safety claims expiran ante cambios materiales de dependencies, policy, semantics, artifacts, authority o world assumptions.
8. Los modelos formales deben converger hacia un modelo canónico o tener correspondence explícita.
9. Evaluators pueden restringir admission, nunca convertirse en authority.
10. No usar VERIFIED hasta contar con evidencia real de implementación, pruebas y/o formal checking según la claim.

## 9. Huecos de mayor riesgo
H1 — Freshness/provenance/version binding de evidencia de efectos externos.
H2 — Unificación del modelo formal recovery/common-mode con external-effect identity.
H3 — Ejecución real de SANY/TLC.
H4 — Linearizability/CAS y carreras distribuidas de owner/generation/lease.
H5 — Enforcement real en los sinks críticos.
H6 — Fault injection para partitions, stale credentials, root compromise, storage rollback, clock skew, update crashes, takeover y external UNKNOWN.
H7 — Semantic/data migration original sigue abierto y debe cerrarse por separado.

## 10. Regla contra parches
Si un descubrimiento cambia state identity, authority boundary, effect identity, evidence semantics, epoch/generation semantics, dependency closure o recovery semantics, no se agrega un parche aislado.
Proceso obligatorio: DISCOVER CONTRADICTION → TRACE TO CANONICAL STATE/TRANSITION → REMOVE DUPLICATE DEFINITION → UPDATE DERIVATIONS → UPDATE FORMAL MODEL → UPDATE EXECUTABLE CONTRACT → ADD ADVERSARIAL TEST → RECONCILE DOCUMENTATION → VERIFY.

## 11. Estado
Arquitectura: COHERENT BASE, RESTRUCTURING REQUIRED.
Formal: PARTIAL / NOT TLC-VERIFIED.
Evaluator: IMPLEMENTED / TEST EXECUTION NOT CONFIRMED.
Safety-plane/recovery: DESIGNED, not runtime-verified.
External-effect identity: DESIGNED + isolated formal sketch, not integrated/verified.
Semantic/data migration: OPEN.

Historical artifacts remain immutable records. Current-state claims must come from the reconciled architecture and current continuity ledger.

### 2026-09-23 — canonical core research sketch

A first canonical-core formal sketch was created after the code/formal audit. It introduces the intended five-object center (Operation, EffectBinding, AuthorityContext, EvidenceRecord, ControlLease) plus dependency/trust context and explicitly separates effect state from evidence state.

Artifact:
docs/nexo/formal/NEXO_CANONICAL_CORE_SKETCH_2026_09_23.tla
Commit: eabcc4beabf68a018ec79a47c4268a97b20f527c

Important status: this is a DESIGN/RESEARCH SKETCH only. It is NOT syntactically checked, NOT SANY-verified, NOT TLC-verified, and NOT implementation-equivalent. It deliberately exposes the shape of the unified model before implementation.

New design rule:
Observation may create EvidenceRecord(OBSERVED), but only a separate verification transition may make evidence VALID. Release eligibility must consume exact effect/target binding, current authority/policy/dependency versions, freshness/provenance, lease fencing, and dependency/trust admissibility.

The sketch itself still requires correction before formal execution: concrete target/effect/operation maps and record schemas need a fully typed finite model; the evidence invalidation expression is illustrative rather than executable TLA+; release currently assumes a recovery lease and must be reconciled with the intended distinction between recovery ownership and completed reconciliation evidence. These are intentionally recorded as open work, not hidden.

Next step: continue adversarial study of canonical object boundaries and derive executable contracts/tests only after the formal vocabulary is corrected.
