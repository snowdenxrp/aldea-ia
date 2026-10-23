# CHECKPOINT — RUTAS RESERVADAS Y SYMLINKS — 2026-10-23

Documento nuevo: [NCS_M0_D0_D3_RESERVED_PATH_AND_SYMLINK_POLICY_MATRIX_2026-10-23.md](NCS_M0_D0_D3_RESERVED_PATH_AND_SYMLINK_POLICY_MATRIX_2026-10-23.md), commit 7a2f2dd0fbaec192de3a134da5b27e188b207fc7.

Hallazgo: canonicalizar la raíz no basta para demostrar que continuity.json, chronicle.json, el lock de instancia y owner.json sean destinos regulares dentro de ella. La matriz separa raíz/alias, tipo de archivo reservado, symlink, bootstrap, lock y límite TOCTOU. Rechazar symlinks en nombres reservados es una propuesta candidata, no una decisión aceptada ni implementada.

No se cambió runtime/tests/workflows; tests/CI no ejecutados. Estado canónico permanece M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos STOP.

---

# CHECKPOINT — MAPA DE DEPENDENCIAS D0/D1/D2/D3 — 2026-10-23

Nuevo mapa documental: [NCS_M0_D0_D1_D2_D3_DEPENDENCY_CLOSURE_MAP_2026-10-23.md](NCS_M0_D0_D1_D2_D3_DEPENDENCY_CLOSURE_MAP_2026-10-23.md), commit ac205fda2d1ed490f54efa0ace1a3c974a1ce8c6.

El mapa separa contratos y dependencias, haciendo explícitos: D1-S0 aún necesita decisión; D1-DESIGN no equivale a prueba ejecutada; D2 necesita resolver alcance/duración de admisión del snapshot y contrato de locks; D3 depende de runtime objetivo/control real de relanzamientos; presupuesto agregado de heap/disco sigue independiente y no demostrado. Ninguna recomendación se registra como aceptación del propietario.

No se repitió el censo de callers. No se modificó runtime/tests/workflows; no se ejecutaron tests ni CI.

Estado canónico: M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

---

# NCS M0 — cross-check contractual D0/D1/D2/D3

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **REVISIÓN DOCUMENTAL — NO CIERRA GATES — SIN IMPLEMENTACIÓN**

## 1. Documentos cruzados

- `NCS_M0_OWNER_DECISION_PACKET_D0_D1_SEQUENCE_2026-10-23.md` — commit de creación `5f9aa9e75864145b13bafdc271131662fadfa7b6`.
- `NCS_M0_D2_D3_CONTRACT_GAP_RECONCILIATION_2026-10-23.md` — commit de creación `9b483a083c2c2b0bfd645caf9e5e77d3572826ef`.
- `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` — sección D3 ampliada, blob actual `bac9493af98c3f86001e323dab153bdee78b5f31`.
- `NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md` — blob `2b2e16333130e9348e6af777537fa84dfe73e3e7`.
- `NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md` — blob `55573c52533cb9202187588c04a97cecd9b16b99`.
- `NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md` — blob `abec8b1d97e6db64b79a689d113073d2559bfeda`.

- `NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md` — propuesta de evidencia operacional, commit `2fdde9d9f7df9a25a9c6bdf01d1e3ad1d1cab1a9`.
- `NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md` — entradas de entorno necesarias para elegir un mecanismo operacional, commit `f4c65b81abc19244eb777d821c7945ced45ee21e`.

Este es un cross-check entre contratos escritos. No se reabrió el censo de código y no se ejecutaron tests/CI.

## 2. Compatibilidades confirmadas

| Tema | Resultado del cruce | Estado |
|---|---|---|
| Raíz de instancia | Todos los documentos la tratan como localizador de persistencia, no autoridad. | Consistente; subcontrato D0 OPEN. |
| Configuración legacy | D0 pide una única configuración sin fallback ambiguo; D1 registra rutas independientes actuales; D3 exige cutover explícito. | Consistente; compatibilidad aún no decidida. |
| Queries y snapshots | D1/D2 recomiendan admisión antes de materializar snapshots si se pretende una garantía agregada de snapshots vivos. | Consistente; D2 debe fijar el final exacto de la sección crítica. |
| Proceso Chronicle hijo | D1/D2 exigen cobertura de invocación directa; si el hijo adquiere lock, el padre no lo conserva durante spawnSync. | Consistente; no implementado. |
| Lock raíz y locks por store | Los contratos conservan los locks por store y reconocen sus diferencias. | Consistente; elegir primitiva raíz separada/compartida sigue OPEN. |
| Repair/dispatch | Todos los contratos separan admisión de autorización y conservan el gate de efectos. | Consistente; no se permite habilitar repair. |
| Recursos | El lock no crea cota exacta de heap ni cuota total de disco. | Consistente; garantías separadas OPEN. |
| Migración | No auto-merge, no dual-write y origen preservado hasta cutover/verificación. | Consistente a nivel de diseño; la propuesta de quiescencia y revalidación de origen ya está incorporada al contrato D3, pero sigue sin aprobarse ni probarse. |

## 3. Hueco D3 tratado documentalmente; sigue abierto como gate

La revisión anterior identificó que los procesos legacy que aceptan `--continuity`/`--chronicle` no participan en el lock de instancia propuesto. Por ello, una copia podía verificarse y aun así quedar obsoleta antes del cutover.

El contrato de raíz ahora incluye la sección 9 con esta propuesta de control:
1. Ventana explícita de quiescencia para writers legacy, incluidos procesos Chronicle invocados directamente, y procedimiento para detenerlos y comprobar que no quedan operaciones activas.
2. Huellas iniciales de hash, tamaño, revisión disponible y ruta resuelta; el dry-run no modifica fuentes ni crea stores.
3. Copia a destino de preparación y verificación de bytes/hash/revisión/semántica.
4. Comparación inmediata de huellas antes del cutover; si una fuente cambia o no puede leerse/validarse, cancelar, preservar ambos lados y reiniciar inventario, sin merge heurístico.
5. Aprobación explícita de cutover; conservar el origen y no hacer dual-write ni borrarlo en el mismo paso.
6. Si la quiescencia no puede garantizarse/detectarse: `UNKNOWN/BLOCKED`.
7. Si el nuevo destino ya recibió escrituras, rollback no copia automáticamente hacia atrás ni fusiona historiales.

Referencia actual del contrato: blob `bac9493af98c3f86001e323dab153bdee78b5f31`, commit `036c877e97475aa1489cc83d70f05c48e7fa8b9f`.

**Resultado del cross-check:** el hueco ya está documentado en el contrato y se añadió una propuesta específica de evidencia operacional. Ninguno de los documentos cierra el gate: no se ha determinado el entorno objetivo ni elegido un mecanismo concreto para una instalación real, no hay procedimiento ejecutado ni evidencia de migración. Una captura de procesos más hashes no elimina por sí sola la carrera de relanzamiento; sin prevención verificable de nuevos lanzamientos, el resultado debe seguir siendo `UNKNOWN/BLOCKED`. La quiescencia controla procesos cooperantes; no es una barrera frente a procesos locales hostiles.

## 4. Otras decisiones que no deben confundirse

- Canonicalizar `<root>` no impide que los archivos internos de store sean symlinks a rutas externas.
- PID/mtime del owner lock no son identidad criptográfica; stale no debe borrarse automáticamente.
- Una liberación de lock incierta no autoriza retry de negocio ni éxito limpio.
- El rollback tras escrituras en el nuevo destino no puede copiar hacia atrás ni fusionar historias automáticamente.
- Un cierre de D1-DESIGN no equivale a prueba de no-bypass ejecutada; el test de arquitectura requiere autorización separada.
- El cierre documental de D0-D3 no equivale a autorización para editar runtime/tests/workflows.

## 5. Orden de dependencia coherente

1. Decidir D1-S0: separación D1-DESIGN/D1-IMPLEMENTATION o alternativa expresamente aprobada.
2. Congelar D0: interfaz/root, bootstrap, canonicalización/alias y legacy paths.
3. Congelar D1-DESIGN: manifiesto/allowlist/UNKNOWN-BLOCKED y fixtures, sin declarar que el test ya pasó.
4. Congelar D2: alcance de snapshot, ownership padre/hijo, lock, timeout y recuperación.
5. Confirmar que la sección 9 de D3 cubre quiescencia y huellas de origen; definir qué evidencia operacional demuestra que no quedan writers activos y cómo se aborta si no puede demostrarse.
6. Cerrar la consistencia documental D0-D3 sobre los blobs exactos; registrar las decisiones aún reservadas al propietario.
7. Solo tras decisiones explícitas, autorizar por separado implementación y tests; ligar logs, jobs y resultados al SHA exacto.
8. Antes de cerrar D3, especificar para el entorno real el control que suspende/prevence relanzamientos y demostrar el abort fail-closed ante escritores activos/ambiguos, visibilidad parcial o cambio de huellas.

Este orden es una recomendación de ingeniería, no una decisión aceptada automáticamente.

## 6. Estado canónico

- D0/D1/D2/D3: `OPEN`.
- M0: `INCOMPLETO`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows: sin cambios.
- Tests/CI: no ejecutados en esta revisión.

## 7. Continuidad

STATUS y handoff deben registrar el nuevo perfil de entorno requerido. Siguiente: identificar el despliegue objetivo y comparar sus controles reales con el protocolo; mientras no se conozca, continuar solo la revisión documental y mantener D3 OPEN. No repetir el censo de código ni implementar.


## 8. Cross-check de decisiones frente a gates de evidencia — 2026-10-23

Se contrastaron el paquete de decisión del propietario, el ledger D0, la matriz D0/D2/D3, el análisis D1-S0, el mapa de dependencias y la matriz nueva de rutas reservadas. No apareció una contradicción textual que justifique reabrir el censo de callers. Sí queda una distinción de proceso importante:

- **Decisión reservada al propietario:** D1-S0; interfaz exacta D0-C1; bootstrap D0-C2; política de alias/symlinks D0-C3; migración D0-C4; y detalles finales del contrato D2. Las recomendaciones no son aceptación.
- **Gate de evidencia:** D1 requiere prueba arquitectónica ejecutada sobre un SHA; D2 requiere pruebas de concurrencia, ownership y release incierto; D0-C3 requiere fixtures negativos de rutas; recursos agregados requieren contrato/medición aparte; D3 requiere entorno objetivo y evidencia real de quiescencia/cutover/rollback.
- La matriz de symlinks no contradice D0-C3: descompone la política de raíz y los destinos reservados en casos de prueba. El comportamiento de rechazar todos los symlinks sigue sin aprobar.
- El paquete D1-S0 ofrece dividir diseño e implementación como recomendación, pero esa división sigue pendiente del propietario. No se escribieron tests para evitar saltarse el gate.
- D3 no puede cerrarse solo con más documentos si el runtime objetivo y los controles de relanzamiento siguen sin identificarse.

Este cross-check es documental. No cambió código, tests ni workflows; no se ejecutaron tests/CI. Estado canónico intacto: M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


## Wording reconciliation — D2/D3 reserved-path policy (2026-10-23)

A targeted cross-check found one over-prescriptive sentence in `NCS_M0_D2_D3_CONTRACT_GAP_RECONCILIATION_2026-10-23.md`: it said the contract must reject symlinks for reserved store/lock names, while the owner decision packet and reserved-path matrix correctly leave D0-C3 policy OPEN and do not approve universal rejection. This was a wording inconsistency, not evidence of a runtime defect.

Corrected the D2/D3 reconciliation document so D0-C3 must first decide accepted object/symlink cases; tests must then enforce the approved policy. The correction does not choose that policy on the owner's behalf.

Correction commit: `92821951db0c47bb0904560635cc3cd1cf7baf4f`.
Corrected document blob: `79b554a0d4d056eebb569d1e8ab98405421cbe9b`.

No runtime/tests/workflows changed; no tests/CI run. Canonical state unchanged: D0/D1/D2/D3 OPEN; M0 INCOMPLETO; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.


## Follow-up: root configuration interface wording (2026-10-23)

Targeted review of the current root-contract blob `bac9493af98c3f86001e323dab153bdee78b5f31` found an internal wording ambiguity, not an accepted interface decision: §1.1 says CLI/env remains a subdecision and that env may be considered as a transport; later recommendations (including the detailed CLI/API boundary) recommend `--root` plus a validated API instance object and no root environment variable in the first migration. The owner decision packet likewise lists `--root`/no env as a recommendation, not an owner-approved decision.

Correct resolution: keep D0-C1 OPEN; treat explicit `--root` + validated API object/no env as the current recommendation only, and do not implement or infer owner approval. A narrow edit to the 146 KB root contract was attempted but blocked by tool security controls; therefore the root-contract wording itself has **not** been changed. This note records the ambiguity so it is not mistaken for a decision.

No runtime/tests/workflows changed; no tests/CI run. Canonical state unchanged.


## Follow-up: canonicalization recommendation versus open D0-C3 (2026-10-23)

A second targeted read of root-contract blob `bac9493af98c3f86001e323dab153bdee78b5f31` found a policy-level ambiguity: §1.2 says not to claim route aliases converge until the symlink/canonicalization contract is decided and tested, while the later recommendation table says symlinks resolving to the same directory “must converge.” The table is in a recommendations section, but its normative wording can be misread as already-selected behavior.

Interpretation pending owner decision: D0-C3 remains OPEN; “same resolved directory converges” is only a candidate recommendation, not current runtime behavior or accepted policy. Before implementation, the root contract should label it explicitly as proposed and specify how realpath identity, symlink races, and mount aliases are bounded. The earlier matrix still correctly leaves reserved-child symlink cases undecided.

A direct edit to the 146 KB root contract was blocked by tool security controls during the previous correction attempt; no source wording has been changed. This checkpoint records the ambiguity, not a policy decision.
No runtime/tests/workflows changed; no tests/CI run. Canonical state unchanged.


## Follow-up: bootstrap versus in-root admission ordering (2026-10-23)

A targeted check of root-contract blob `bac9493af98c3f86001e323dab153bdee78b5f31` found an unresolved ordering edge across D0-C2/D2. The root-resolution contract rejects a nonexistent root in normal operation and says root creation is only allowed through a separate explicit bootstrap operation (sections 1.2 and the root policy table). Yet the acceptance criteria later say owner bootstrap, legacy initialization, and commit/append use the same admission; the proposed lock lives inside the root as `<root>/.nexo-instance.lock/`.

This is not necessarily a contradiction if bootstrap first establishes a safely coordinated root, but the bootstrap's first coordination point is not specified by these statements. An in-root lock cannot be acquired before the root/lock directory exists. Do not silently create the root before validation or invent a sibling/global lock. D0-C2 and D2 must explicitly specify the first-creation race/coordination protocol, the exact mutations permitted during bootstrap, and fail-closed behavior if two bootstrap attempts race or ownership is uncertain. If no defensible protocol is chosen, bootstrap stays blocked/UNKNOWN rather than bypassing admission.

Status: concrete contract gap; not implemented. This is distinct from the earlier D0-C1 interface and D0-C3 canonicalization wording notes. No runtime/tests/workflows changed; no tests/CI run. Canonical state unchanged.
