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


## Follow-up: first bootstrap race under the proposed in-root mkdir lock (2026-10-23)

A deeper read of the D2 candidate protocol in root-contract blob `bac9493af98c3f86001e323dab153bdee78b5f31` sharpens the prior bootstrap gap. The candidate says: root must already exist and be canonicalized; contenders then `mkdir(<root>/.nexo-instance.lock)`; only the creator writes `owner.json`. Separately, the root policy says a nonexistent root can be created only by explicit bootstrap, and the contract says not to add a persistent bootstrap marker without demonstrated need.

Potential race requiring an explicit contract: if bootstrap process A creates the root directory but has not yet created the in-root lock, process B can observe an existing root and create the lock first. The atomic creation of the lock serializes operations only after the lock directory exists; it does not by itself establish that root bootstrap has completed or which process owns the right to initialize stores. This is a concrete race scenario to prove or rule out, not a claim that it has already occurred in runtime.

D0-C2/D2 must define a first-creation protocol that coordinates the root creation and initialization boundary, including simultaneous bootstrap, crash after root creation but before lock acquisition, partial initialization, and retry/recovery. It must also reconcile the no-extra-marker constraint with any mechanism selected. Do not assume “root exists” means “bootstrap complete”; do not invent a global/sibling lock or silently initialize. If the contract cannot distinguish these states safely, return BLOCKED/UNKNOWN and preserve all data.

No runtime/tests/workflows changed; no tests/CI run. Canonical state unchanged.


## Follow-up: release-token check is not atomic with recursive lock removal (2026-10-23)

Targeted source inspection of `src/nexo/core/continuity-store.mjs` at blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae` confirmed the release sequence: read `owner.json`, compare `current.token` to the caller token, then call `rm(lockPath, { recursive: true, force: true })`; on failure, retry the same recursive removal once. The D2 root-lock candidate similarly proposes verify-token-then-remove.

This is a check/use interval, not an atomic ownership-and-removal operation. If the lock directory is removed/replaced after the token check but before `rm`, the removal can target the replacement directory. That interleaving requires external removal/replacement (or another actor capable of changing the lock path); it is not proof of a currently observed runtime incident or hostile-process protection claim. Nevertheless, because the contract explicitly contemplates external recovery, lock replacement, and uncertain ownership, D2 must state whether external recovery is permitted concurrently with a live release. If it is, a token check followed by recursive removal alone does not establish that only the original lock instance is removed.

Required closure: define recovery as an exclusive/offline operation with a demonstrable quiescence precondition, or select and test a filesystem protocol that safely distinguishes the lock instance being removed from a replacement. Do not assert that re-reading the token alone closes the interval; it only moves the interval. Tests should deterministically inject replacement between ownership validation and removal, verify the replacement survives, and require UNKNOWN/BLOCKED when safe ownership cannot be proven. Apply the same review to Chronicle and the proposed instance lock before claiming a shared release contract. Do not patch runtime until design/implementation authorization is explicit.

No runtime/tests/workflows changed; no tests/CI run. Canonical state unchanged.


### Cross-store confirmation and test-gap refinement

Follow-up inspection confirms the same verify-token-then-recursive-remove sequence in `src/nexo/core/chronicle-store.mjs` at blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`. Chronicle returns release failure after one failed removal; Continuity retries once and records a local failed-release path. Their contracts therefore differ even though both have the same replacement interleaving. Chronicle already comments that stale-lock check-then-remove is racy and requires explicit recovery; the release path itself still has the validation/removal interval.

Existing test files `tests/nexo/continuity-store.test.mjs` (blob `c3af56077b94c8d641979e0853de7f70fa45d82f`) and `tests/nexo/chronicle-store.test.mjs` (blob `8e182932ae98ad40c3655f6be3bf5e0585bfac26`) cover release failures and not-owned results, but the targeted search did not find a deterministic fixture that replaces the lock directory after token validation and before recursive removal. This is a test-coverage observation from source inspection, not a test run. Both store implementations also attempt recursive removal of the lock path after owner-record creation fails; that cleanup path should be included in the same replacement/ownership review rather than assumed safe.

Contract action remains: specify whether recovery can run concurrently with release; test replacement interleavings in release and failed-owner initialization; preserve Chronicle/Continuity behavior differences unless an authorized, tested refactor changes them. Runtime/tests/workflows unchanged; no tests/CI run.


---

# CHECKPOINT — D2 PROTOCOLO DE ADMISIÓN: LECTURA DIRIGIDA — 2026-10-23

Revisión dirigida del contrato de raíz (blob `bac9493af98c3f86001e323dab153bdee78b5f31`), del candidato D2 y de `tests/nexo/root-bootstrap-protocol.test.mjs` (blob `996c031224ba4544d8982ca4fd1762e9d4f44dc0`). No se repitió el censo de callers.

## Hallazgos concretos

1. **El test no prueba el bootstrap de instancia.** Pese al nombre del archivo, verifica el vector wire-format de un challenge y una firma ECDSA/SHA-256 con fixture de software. No ejercita creación de raíz, carrera de primer lock, escritura fallida de `owner.json`, admisión entre procesos ni liberación. Es cobertura criptográfica de protocolo de prueba, no evidencia de concurrencia/bootstrap.
2. **Primer uso sigue sin protocolo completo.** El candidato D2 presupone raíz existente y usa `mkdir(<root>/.nexo-instance.lock)`; no resuelve cómo coordinar la creación autorizada de raíz, la inicialización parcial y el lock inicial sin una ventana en la que un segundo proceso pueda adelantarse o ambos interpreten estado parcial como instancia lista. No agregar un lock hermano, marcador persistente o creación implícita por intuición. D0-C2/D2 deben definirlo; si no hay protocolo defendible, bootstrap permanece BLOCKED/UNKNOWN.
3. **El owner record ausente tiene una tolerancia temporal, pero no una prueba de propiedad completa.** Reintentar `ENOENT` durante la escritura inicial es candidato, no prueba de que el creador siga siendo dueño ni de que el directorio no haya sido sustituido. La creación fallida de `owner.json` y su limpieza deben probar que nunca eliminan un lock de reemplazo.
4. **Liberación conserva una carrera check/use.** Leer y validar el token antes de `rm(lockPath,{recursive:true})` no ata la eliminación al mismo objeto validado si se permite reemplazo concurrente. Requiere decidir y hacer cumplir recuperación externa offline/exclusiva, o seleccionar una primitiva que distinga la instancia de lock a retirar. No declarar protección contra actores locales hostiles.
5. **Persistencia y release son dos resultados distintos.** Si la operación ya escribió o el commit no puede determinarse y luego falla la liberación, conservar el resultado de persistencia observado junto con `release_uncertain`; bloquear nuevas operaciones de esa raíz y no reintentar automáticamente la operación de negocio. Esta regla es consistente con el contrato, pero necesita pruebas de error tras commit y fallo de release.

## Pruebas mínimas antes de cerrar D2

- Dos procesos compiten por primer bootstrap; el perdedor no inicializa ni lee como si la instancia estuviera lista.
- El creador falla antes/durante/después de escribir `owner.json`; el estado queda UNKNOWN/BLOCKED sin borrar lock ajeno.
- Inyección determinista de reemplazo del lock entre validación del token y limpieza, tanto en liberación normal como tras fallo de creación del owner; el reemplazo debe sobrevivir o el diseño debe impedir esa carrera.
- Fallo de release después de persistencia confirmada y después de persistencia ambigua: resultado compuesto fiel, sin retry de negocio y sin nueva admisión local.
- Recuperación externa concurrente contra liberación viva: rechazarla por contrato o probar el mecanismo escogido; no asumir exclusión operacional sin evidencia.

Estado: **solo revisión documental**. No se modificaron runtime/tests/workflows; no se ejecutaron tests ni CI. M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

Siguiente paso: añadir una matriz D2 de estados/transiciones (root absent/partial/ready; lock absent/owner-writing/owned/stale/unknown/releasing/release-uncertain) y revisar cada transición contra los invariantes anteriores. Mantener la matriz como propuesta hasta cerrar D0-C2/D2 y obtener autorización explícita de implementación.


---

# CHECKPOINT — MATRIZ CANDIDATA DE ESTADOS D2 — 2026-10-23

Nuevo documento: [NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md](NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md), commit de creación `f27981d451b76a67c96d6db3b28e6a0004d7caad`.

La matriz enumera estados de raíz, lock, owner record, operación, persistencia, liberación y bootstrap parcial; define transiciones candidatas, fallos seguros y pruebas necesarias. Mantiene como problemas separados: (a) coordinación del primer bootstrap antes de existir el lock dentro de raíz, (b) reemplazo del lock entre comprobación del token y borrado, (c) limpieza tras fallo de escritura del owner, y (d) resultado de persistencia versus release incierto. No elige políticas owner-reserved ni supone resuelto el protocolo.

El test `root-bootstrap-protocol.test.mjs` verifica únicamente un vector criptográfico de software; no prueba bootstrap de instancia ni concurrencia de locks. No se modificó runtime/tests/workflows y no se ejecutaron tests/CI. Estado canónico permanece M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos STOP.

Siguiente: contrastar esta matriz con la decisión D0-C2 y las opciones de recuperación externa; solo después de decisión explícita y autorización separada podrá prepararse implementación y pruebas.


---

# CHECKPOINT — OPCIONES D0-C2 PARA PRIMER BOOTSTRAP — 2026-10-23

Nuevo análisis documental: [NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md](NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md), commit de creación `5cbe2e7f2fcc095296d4804dab6c30b59ad19e11`.

Compara cuatro alternativas sin elegir por el propietario: A) bootstrap offline con quiescencia operacional demostrable; B) staging y publicación atómica con arbitraje de publicadores; C) marcador persistente de inicialización, que no sustituye la exclusión; D) coordinación externa a la raíz, que añade su propio problema de identidad/recuperación. Recomendación provisional no vinculante: no habilitar bootstrap concurrente/autónomo sin protocolo probado; considerar A solo si la quiescencia puede imponerse y evidenciarse, de lo contrario evaluar B según garantías del filesystem. C/D requieren necesidad demostrada. Ninguna opción está aceptada ni implementada.

D0-C2 sigue OPEN hasta resolver qué convierte una raíz parcial en lista, cómo se impiden relanzamientos y qué recuperación explícita se permite. Runtime/tests/workflows sin cambios; tests/CI no ejecutados. Estado canónico permanece M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos STOP.


---

# CHECKPOINT — GATE DE PREPARACIÓN D0-C2 / ENTORNO — 2026-10-23

Nuevo documento: [NCS_M0_D0_C2_DECISION_READINESS_AND_ENVIRONMENT_GATE_2026-10-23.md](NCS_M0_D0_C2_DECISION_READINESS_AND_ENVIRONMENT_GATE_2026-10-23.md), commit de creación `bc387fbda827f7e8bf637fc103f99b8cc6247ef8`, blob verificado `4147a778f2aa625fe4e11905ef9bc96d91226a3d`.

Revisión cruzada con el perfil D3: el runtime C y el host/operador D siguen sin determinarse. Por ello, la opción A solo es evaluable si existe un entorno elegido donde pueda imponerse y evidenciarse la quiescencia; B depende de garantías reales del filesystem; C no coordina por sí solo; D añade una nueva identidad y recuperación de lock. No hay base factual para elegir ninguna como política aceptada. La entrada mínima para el próximo avance es confirmar si ya existe una primera instancia que usará Continuity/Chronicle; si no, documentar RUNTIME_TARGET = NOT_SELECTED y mantener D3 OPEN.

El documento define criterios candidatos para ROOT_READY y recuperación parcial, sin añadir marcadores, locks, IDs ni decisiones. Solo documentación; runtime/tests/workflows sin cambios; tests/CI no ejecutados. Estado canónico intacto.

---
# RECUPERACIÓN DE CONTEXTO — ¿YA SE HABÍA ELEGIDO RUNTIME C? — 2026-10-23

Se revisó el contexto de conversaciones anteriores y el handoff maestro disponible, además de los documentos D3 y el gate D0-C2. El resultado es consistente: el POCO X7 Pro está documentado como dispositivo del prototipo local M1, pero **no** como decisión de que allí correrá la primera instancia que use Continuity/Chronicle. No se encontró una decisión explícita de runtime C ni de host/operador D.

Interpretación precisa: RUNTIME_TARGET = NOT_DETERMINED (no hay selección documentada). Esto **no** demuestra que físicamente no exista un entorno; evita convertir falta de evidencia en la afirmación de que no existe. No pedir al propietario que reconstruya la investigación anterior ni volver a censar callers. La siguiente entrada mínima, cuando sea necesaria, es confirmar si ya se seleccionó un despliegue real. Mientras tanto, continuar revisión portable de contratos, sin escoger bootstrap A/B/C/D ni cerrar D3.

No se modificó runtime/tests/workflows; no se ejecutaron tests/CI. Estado canónico sin cambios.

---
# REVISIÓN DIRIGIDA — SEMÁNTICA DE ROOT_READY ENTRE D2 Y D0-C2 — 2026-10-23

Se encontró una ambigüedad documental nueva al comparar la matriz D2 con el gate D0-C2:

- En la matriz D2, ROOT_READY describe una raíz existente, directorio y validada según la política de configuración; después todavía se intenta adquirir el lock y validar owner/stores.
- En el gate D0-C2, ROOT_READY se usa de manera más amplia, incluyendo configuración, política de rutas, estado de bootstrap, stores inicializados/validados, admisión/ownership y, cuando aplique, quiescencia operacional.

Estas descripciones pueden ser compatibles si la matriz usa ROOT_READY para la **ruta raíz** y el gate para la **instancia operativa lista**, pero hoy el mismo token sugiere dos alcances. No se declara defecto de runtime ni se cambia el nombre/estado por inferencia.

Recomendación documental no aceptada: antes de implementar, definir explícitamente si ROOT_READY nombra solo la validación de la ruta o la instancia completa; distinguir por texto los niveles de estado sin añadir estados/campos persistentes nuevos innecesarios. La admisión del lock y la autorización constitucional deben seguir siendo independientes; una raíz/instancia técnicamente lista no legitima autoridad ni habilita efectos protegidos.

No se repitió el censo de callers. Solo documentación; runtime/tests/workflows sin cambios, tests/CI no ejecutados. Estado canónico sin cambios.

---
# RECONCILIACIÓN PROPUESTA — SEMÁNTICA ROOT_READY — 2026-10-23

Documento nuevo: NCS_M0_D2_ROOT_READY_SEMANTICS_RECONCILIATION_2026-10-23.md, commit de creación f36644a68065b749c621540db5bcf81b50839653, blob verificado 36bc58655a12e9681fa52a4660dc3971e8467336.

La matriz D2 usa ROOT_READY para la ruta validada antes de lock/stores; el gate D0-C2 parece usarlo para la instancia global lista. Recomendación documental: mantener el término con alcance local en D2 y describir en D0-C2 la conjunción de precondiciones para admitir operación normal, sin crear estados/markers persistentes ni conceder autoridad. Los documentos originales no se modificaron unilateralmente; la recomendación no está aceptada por el propietario.

No runtime/tests/workflows changes; tests/CI no ejecutados. Estado canónico sin cambios.

---
# REVISIÓN DIRIGIDA — SEMÁNTICA DE DATOS VS DISPARADOR LEGACY — 2026-10-23

Documento nuevo: NCS_M0_D2_INITIALIZATION_SEMANTICS_VS_TRIGGER_RECONCILIATION_2026-10-23.md, commit de creación 78e3838e642f8af783414c07e912e669efa82aac, blob verificado 05599a912492b4ead93c50c0e753a62e6fe9027e.

El contrato de raíz pide preservar la semántica de inicialización, pero también señala que algunos callers legacy pueden disparar bootstrap/migración implícitos y recomienda eliminarlos como side effect incidental. Reconciliación propuesta: preservar las reglas de datos y precedencia una vez que una migración explícita es autorizada; no asumir que deba preservarse el disparador implícito. Lectura/preview no deben crear ni migrar stores por accidente. Es precisión de diseño, no cambio de runtime ni autorización.

El documento ROOT_READY anterior permanece propuesta editorial no aprobada. Runtime/tests/workflows sin cambios; tests/CI no ejecutados. Estado canónico sin cambios.
