# NCS — HANDOFF PARA NUEVO CHAT — 2026-10-23
## Punto exacto de continuidad tras revisión D2

**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `ncs-clean-architecture`  
**Palabra de entrada para retomar:** `NCS`  
**Estado del documento:** checkpoint de continuidad; no es una decisión constitucional ni autorización de runtime.

## 1. Instrucciones obligatorias para el próximo chat

1. Al recibir exactamente `NCS`, no saltes directamente a investigaciones históricas ni repitas auditorías cerradas.
2. Ruta de entrada: `NEXO_NCS/STATUS.md → MASTER/CORE → BUILD → este handoff / trabajo actual`.
3. Lee primero este handoff y el checkpoint contractual más reciente antes de proponer trabajo:
   - [Cross-contract checkpoint D0/D1/D2/D3](NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md)
   - [D2 matrix de estados/transiciones](NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md)
   - [Opciones de bootstrap D0-C2](NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md)
   - [Nuevo análisis de cuarentena por release incierto](NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md)
4. No repitas el censo de callers, import graph o auditorías anteriores salvo que un SHA/snapshot nuevo muestre un cambio material.
5. No inventes IDs, estados, colas, locks globales, marcadores persistentes, retries, tombstones, wrappers transaccionales ni mecanismos externos para cerrar huecos. Cualquier mecanismo nuevo es una decisión de diseño que debe justificarse y aprobarse.
6. No trates “continúa sin límites” como aprobación de decisiones reservadas al propietario ni como autorización para modificar runtime/tests/workflows.
7. Mantén separado lo implementado y verificado de las propuestas documentales. No declares tests/CI ejecutados si no se ejecutaron, ni éxito por inferencia.
8. No hagas nuevos cambios de runtime ni escribas pruebas antes de cerrar los gates de diseño y obtener autorización separada.
9. No reescribas ciegamente `NEXO_NCS/STATUS.md` (archivo grande, historial de sincronización incompleto). Usa handoffs/addenda específicos y deja referencias verificables.
10. Si una escritura remota se intenta, verifica luego el archivo exacto, blob SHA y commit SHA. No declares persistencia si la herramienta no devolvió éxito y el archivo no puede releerse.

## 2. Estado canónico — no alterar por inferencia

- M0: `INCOMPLETO`.
- D0 / D1 / D2 / D3: `OPEN`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Autorización para efectos protegidos: no demostrada; efectos protegidos `STOP`.
- `RUNTIME_TARGET = NOT_DETERMINED`: no se ha documentado/seleccionado el runtime C objetivo; esto **no** demuestra que no exista un runtime.
- La vía de escritura documental por GitHub connector ha funcionado para varios archivos de BUILD, pero eso no equivale a checkout local, autorización de runtime, prueba CI ni legitimidad de la raíz.
- En esta revisión no se modificó runtime, tests ni workflows; no se ejecutaron tests/CI.

## 3. Trabajo realizado en la sesión más reciente

### 3.1 Lecturas verificadas

Se recuperaron los siguientes archivos de la rama `ncs-clean-architecture`:

- `NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md` — blob devuelto por la última lectura: `824050fc2827bf678514a7acdfe1921f2f2ffe48`.
- `NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md` — lectura previa identificó estados de root, lock, owner record, operación, persistencia, release y bootstrap parcial. Su SHA debe volver a comprobarse al continuar si se necesita precisión de contenido.
- `NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md` — comparación de cuatro opciones sin decisión del propietario: A) bootstrap offline con quiescencia demostrable; B) staging/publicación atómica; C) marcador persistente (no coordina concurrencia por sí solo); D) coordinación externa (introduce su propio problema de identidad/recuperación).
- `NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md` — blob `a1804c3128692abb856f5169be5f8c21729508f3`.
- `NCS_M0_D2_INITIALIZATION_SEMANTICS_VS_TRIGGER_RECONCILIATION_2026-10-23.md` — blob `05599a912492b4ead93c50c0e753a62e6fe9027e`.
- `NCS_M0_D2_ROOT_READY_SEMANTICS_RECONCILIATION_2026-10-23.md` — blob conocido `36bc58655a12e9681fa52a4660dc3971e8467336`.

El checkpoint contractual incluye hallazgos sobre la ambigüedad de la interfaz de raíz D0-C1, alias/canonicalización D0-C3, primer bootstrap antes de existir un lock dentro de la raíz, y carrera check/use al retirar un lock.

### 3.2 Nuevo documento de análisis D2

Se creó y se releyó satisfactoriamente:

`NEXO_NCS/BUILD/NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md`

- Blob SHA verificado: `2bdfb593c04bd52ecdeb052934525eba006f6c16`.
- Trata el alcance de la cuarentena cuando el release del lock queda incierto y diferencia tres resultados:
  1. resultado de negocio/persistencia (confirmado, fallido antes de escribir o desconocido);
  2. resultado de liberación (confirmado, fallido o incierto);
  3. posibilidad de admitir operaciones nuevas (bloqueada mientras el lock/actor/estado sea ambiguo).
- Expone un riesgo contractual: si hay un segundo intento de `rm(path)`, un actor podría haber retirado/reemplazado el path entre intentos; no afirmar que haya ocurrido en runtime. Aplica también a limpieza tras fallo al crear/escribir `owner.json`.
- Propone pruebas deterministas de reemplazo, persistencia confirmada + release incierto, persistencia desconocida + release incierto, proceso competidor y recuperación con path ausente/ilegible/reemplazado.
- Es propuesta documental, no norma aprobada; no cambia runtime/tests/workflows y no ejecuta CI.

### 3.3 Alcance real del trabajo

No se editó el checkpoint existente en esta última operación ni se sincronizó `STATUS.md`. Este handoff es el nuevo punto de entrada y referencia el addendum que sí fue verificado. El checkpoint contractual previo tiene material histórico detallado, incluida la regla de que release incierto no permite retry automático de negocio y debe bloquear nuevas admisiones hasta una resolución segura.

## 4. Hallazgos técnicos que no deben perderse

### A. Primer bootstrap / D0-C2 + D2

El lock candidato está dentro de la raíz: `<root>/.nexo-instance.lock/`. La operación normal rechaza una raíz inexistente y solo bootstrap explícito podría crearla. Por tanto, el lock interior no coordina el intervalo previo a su propia existencia.

Carrera a resolver por contrato: proceso A crea el directorio raíz y pausa; B ve la raíz existente y crea primero el lock. “Root exists” no demuestra bootstrap completo. También hay que resolver caída después de crear raíz, inicialización parcial, dos bootstraps simultáneos, fallo de escritura de `owner.json` y recuperación. No inventar lock hermano/global, marcador persistente ni inicialización implícita. Si no hay protocolo defendible, bootstrap `BLOCKED/UNKNOWN`.

### B. Liberación y recuperación de locks

- Continuity y Chronicle tienen contratos de release distintos.
- Ambas fuentes identificadas usan verificación del token seguida de retirada recursiva por path; eso deja un intervalo check/use ante reemplazo externo del path.
- Continuity ha tenido un segundo intento de retirada; Chronicle devuelve fallo después de un intento. No unificar mecánicamente.
- La limpieza tras fallo de creación de owner también requiere demostrar que no borra un lock reemplazado.
- Decidir si recuperación externa debe ser exclusivamente offline con quiescencia demostrable o elegir y probar un protocolo filesystem que distinga la instancia a retirar. No asumir que releer el token cierra la carrera.
- Persistencia y release son resultados separados. Si persistencia ya está confirmada y release falla, preservar ambos hechos; no reintentar el negocio. Si persistencia es ambigua, mantener `UNKNOWN`; no reintentar el negocio.

### C. D0-C1, D0-C3, D0-C4

- D0-C1: `--root` + objeto API validado y sin variable de entorno es recomendación, no decisión aceptada.
- D0-C3: alias, symlinks, tipos de archivo reservados y canonicalización siguen OPEN. No dar por aprobado el rechazo universal de symlinks ni afirmar que aliases convergen sin contrato y pruebas.
- Canonicalizar raíz no demuestra que Continuity, Chronicle, lock de instancia y `owner.json` sean archivos regulares dentro de esa raíz.
- D0-C4: migración explícita; no auto-merge, no dual-write y no borrado del origen en el mismo paso. Quiescencia requiere control de relanzamientos específico de instalación; una captura de procesos + hashes no elimina por sí sola la carrera. Sin prevención verificable de nuevos writers: `UNKNOWN/BLOCKED`.

### D. D1 y pruebas de arquitectura

- D1-S0 sigue reservado al propietario: dividir D1-DESIGN y D1-IMPLEMENTATION es propuesta, no decisión aceptada.
- D1-DESIGN no equivale a un test ejecutado.
- El test `tests/nexo/root-bootstrap-protocol.test.mjs` previamente revisado solo prueba un vector de challenge/firma ECDSA con fixture de software; no prueba bootstrap de instancia ni concurrencia de locks.
- El test de grafo estático/allowlist con fixtures negativos se ha propuesto, no implementado ni ejecutado.

### E. Recursos y alcance

- Chronicle 32 MiB y Continuity 16 MiB son límites por documento, no un límite de heap total ni cuota total de disco.
- No se ha demostrado un presupuesto agregado de memoria/disco.
- La admisión de operaciones/snapshots entre todos los entrypoints sigue abierta.
- `RUNTIME_TARGET = NOT_DETERMINED`; no inferir que el POCO X7 Pro/M1 sea el runtime C de Continuity/Chronicle.

## 5. Decisiones reservadas al propietario y gates

No decidir por el usuario:
- D0-C1: interfaz/configuración exacta de raíz.
- D0-C2: protocolo de primer bootstrap.
- D0-C3: política de symlinks/alias/objetos reservados.
- D0-C4: política de migración legacy.
- D1-S0: orden/separación de diseño y prueba/implementación.
- D2: alcance/duración de admisión, contrato de lock/recovery y recuperación de release incierto.
- D3: entorno objetivo, quiescencia, cutover y rollback.

Implementación/tests solo después de decisiones explícitas y autorización separada. Las recomendaciones documentales no son decisiones del propietario.

## 6. Siguiente trabajo recomendado — acotado, sin repetir investigaciones

1. Leer este handoff, luego `STATUS.md`, `MASTER/CORE` y el checkpoint contractual, atendiendo a sus SHAs actuales.
2. Verificar que la matriz D2 y el addendum de release incierto son coherentes en:
   - alcance de cuarentena entre procesos;
   - si/quién puede recuperar mientras un release está vivo;
   - path ausente vs actor todavía vivo;
   - limpieza de owner y segundo intento de retirada;
   - persistencia confirmada/ambigua separada del release.
3. Revisar el contrato de raíz solo en estos puntos; no rehacer la lectura total ni el censo de callers.
4. Si hay contradicción material, escribir un addendum corto con citas a los SHAs exactos y actualizar este handoff/checkpoint con el SHA devuelto; si no la hay, documentar explícitamente que no apareció contradicción nueva.
5. Después, seguir con recuperación de bootstrap parcial y condiciones de `ROOT_READY`, sin introducir nuevos estados persistentes salvo aprobación explícita.
6. No implementar todavía: mantener la actividad en revisión documental hasta resolver los gates.

## 7. Evidencia histórica de CI (no confundir con el estado actual)

Runs conocidos de un SHA anterior de Open Loops:
- npm test/determinism: run `39980113239`, job `120504886619`, SUCCESS.
- STEP 4: `39980113168`, SUCCESS.
- STEP 5: `39980113209`, SUCCESS.

Estos runs acreditan únicamente ese código/SHA y esos jobs. No prueban decisiones D0-D3, legitimidad de la raíz, runtime C ni autorización para efectos protegidos. En esta revisión actual no se ejecutaron tests ni CI.

## 8. Estado final y regla de honestidad

M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

No afirmar que el trabajo está implementado cuando solo es documento; no afirmar que el test pasó si no se ejecutó; no interpretar falta de evidencia como ausencia del sistema. Mantener UNKNOWN-STOP.