# NCS M0 — P-05/P-07: matriz verificable de obligaciones O1–O9 (copia reconciliada)

Fecha original: 2026-11-25
Reconciliación documental: 2026-11-26. Esta copia conserva la matriz original y corrige únicamente la lectura G2/C3 a la luz del commit remoto `87decf9ec993b24f88ab2fb38bdeb117f458df3a`.
Rama de trabajo documental: `ncs-docs-reconciliation-p05-p07-2026-11-25` (local; ver estado de publicación en el informe de reconciliación)
Base: `ncs-continuity-handoff-correction-2026-11-07` @ `ae6234f71d773a4d9276bbc1810fa71edd6f1eee`
Snapshot de código de referencia: `d8b5ca8720908d926acc18130614cce132a43b5d` (solo referencia estática)

Estado: **MATRIZ DOCUMENTAL — NO EJECUTADA — NO SELECCIONA MECANISMO — NO IMPLEMENTA — NO AUTORIZA PRUEBAS**

## 1. Leyenda de estado

- **DEFINIDO-NO-EJECUTADO**: existe escenario en V2.2/V2.3 que cubre el requisito. No hay evidencia de ejecución. Nunca equivale a PASS.
- **GAP**: no hay escenario suficiente en V2.2/V2.3 o no hay evidencia para el requisito.
- **UNKNOWN**: el requisito depende de un dato no observado (target, cobertura, fingerprint).
- **CONTRADICTED-CODE**: el código del snapshot contradice el requisito (ver addendum K1–K3 en `NCS_M0_D2_CURRENT_SOURCE_LOCK_RELEASE_AND_P05C_RECONCILIATION_2026-11-07.md`, §9).
- **CONFLICTO-PROPIETARIO**: la normativa y una decisión del propietario no coinciden; no se decide aquí.

Ningún estado de esta matriz es PASS, TESTED ni CI-VERIFIED.

## 2. Obligaciones O1–O9 (ratificadas como criterios de aceptación, 2026-11-07)

| ID | Obligación → requisito | Escenario(s) | Precondición | Intercalación | Oráculo | Evidencia necesaria | Dependencia | Estado |
|---|---|---|---|---|---|---|---|---|
| O1 | Estado BLOCKED sobrevive a la terminación del dueño. Requisito: estado en almacenamiento independiente del proceso. | Ninguno en V2.2/V2.3. Propuesta: `P05-S-O1` (no definido). | Mecanismo de cuarentena durable seleccionado y autorizado (no existe). | SIGKILL del dueño después de escribir BLOCKED y antes del release; luego nueva invocación independiente. | Nueva invocación lee BLOCKED y falla cerrado sin recuperación automática. | Crash real, reaping confirmado, lectura por proceso separado, sin inferir estado por PID/edad/ausencia. | Mecanismo (ninguno seleccionado); P05 enforcement; R1 fingerprint. | **GAP** (K2: el estado de release fallido es solo process-local) |
| O2 | Nueva invocación descubre el estado previo sin inferirlo por PID, edad ni ausencia. | P07-07 (huérfano/token/PID; cubre parcialmente). Sin escenario para edad >60 s con PID muerto. | Lock o estado existente con PID muerto y antigüedad controlada. | Variar PID vivo/muerto, edad, ausencia momentánea. | El resultado depende solo del estado persistido, no de PID/edad. | Matriz de descubrimiento con cada predicado aislado. | P07-B (identidad/tipo); P05. | **CONTRADICTED-CODE** (K3: predicado PID+edad en L131–139) y **GAP** de escenario |
| O3 | Identidad estable del objeto de coordinación entre invocaciones. | P07-12 (sustitución de lock), P07-15 (fstat vs stat), P07-16 (R-OBJ/R-NAME). | Fixture con objeto y nombre identificados; filesystem declarado. | Sustitución del nombre entre validación y uso. | Identidad del objeto (`st_dev`, `st_ino` observados, sin tratarlos como eternos) antes y después; R-OBJ y R-NAME separados. | Inventario namespace pre/post; fd retenido; fingerprint del target. | P07-A (aliases); P07-B (target); R1. | **DEFINIDO-NO-EJECUTADO** para escenarios; **UNKNOWN** para target real |
| O4 | Release/cleanup solo afecta el objeto adquirido. | P07-19 (cleanup tras fallo), P07-06 (cutpoint × handler fd/no-fd), P07-05 (seam de serialización). | Atribución del objeto demostrada (ver G1). Seam interno exacto en el producto. | Sustitución entre el fallo inyectado y la syscall destructiva (no barrera externa). | Centinela con fd, nombre, identidad, nlink; el objeto sustituto no se elimina. | Seam instrumentado; traza del orden fallo→sustitución→cleanup; centinela. | G1 (atribución); seam del producto (no existe); P07-C (sin mecanismo). | **CONTRADICTED-CODE** (K1: `rm` por nombre tras validar token) y **GAP** de seam |
| O5 | Sin readmisión por pérdida, sustitución, ilegibilidad o desaparición del estado. | P07-07 (huérfano retenido). Sin escenario para ENOENT ni readmisión. | Marca o lock existente; path desaparecido o sustituido. | Desaparición del path entre fallo de release y nueva adquisición. | Ausencia del path no habilita adquisición; tipo inesperado y error de lectura fallan cerrado. | Matriz de error/ausencia/tipo, competidor en proceso separado. | O1 (estado durable); P05 resolución. | **CONTRADICTED-CODE** (K2: ENOENT borra marca y readmite) y **GAP** de escenario |
| O6 | Reclasificación de BLOCKED solo mediante procedimiento aprobado. | Ninguno. | Procedimiento de resolución definido y aprobado por el propietario (no existe). | No aplica. | Predicados explícitos, autoridad, evidencia y registro verificable. | Documento de procedimiento aprobado; registro verificable. | Propietario (P05 resolución); O1. | **GAP** |
| O7 | Todo caller/writer cubierto respeta la frontera de admisión. | P07-08 (writer directo), P07-22 (actores). Cobertura en P09. | Universo declarado ratificado (09-11); loaders no literales UNKNOWN. | Writer cubierto y writer crudo en subcasos separados. | Cobertura demostrada dentro del universo; caracterización del límite para crudos. | Fixtures de bypass; cobertura de loaders y consumidores externos. | P09; R1. | **UNKNOWN** (P09 OPEN/UNKNOWN) |
| O8 | La garantía corresponde al entorno R1 real. | P07-22 (UIDs y permisos solo si verificados). | Target fingerprint del POCO (filesystem, montaje, kernel/API, permisos). | No aplica (es evidencia de entorno). | Fingerprint reproducible asociado al SHA. | Fingerprint del dispositivo; observación de actores. | E2/E3 (PARTIAL/NOT CLOSED); R1 aceptado (límite, no prueba). | **UNKNOWN** |
| O9 | Persistencia de negocio y estado de admisión no se confunden. | P07-16 (detección ≠ prevención); P07-21 (oráculos separados). | Resultado de negocio y de release registrados por separado. | Fallo de release tras commit exitoso. | Oráculos separados por subproceso (ver O9a–O9c). | Registro por campo. | P03/P04; P05. | **PARTIAL** (ver subcriterios) |

### 2.1 Subcriterios de O9 (separación commit, release y readmisión)

| ID | Obligación → requisito | Escenario(s) | Precondición | Intercalación | Oráculo | Evidencia necesaria | Dependencia | Estado |
|---|---|---|---|---|---|---|---|---|
| O9a | Commit de negocio registrado independientemente del estado de admisión. | Ninguno en P07. Corresponde a P03/P04 (pre-read). | Commit exitoso del store. | Fallo de release posterior. | `persistenceStatus` distinto de `lockRelease`. | Campo separado en el resultado. | P03/P04 (enforcement pre-read pendiente). | **PARTIAL** (presente en rutas observadas; K1/K2 no lo afectan) |
| O9b | Release registrado sin deducir readmisión. | P07-19. | Release fallido. | Reintento por nombre. | El resultado de release no autoriza nueva adquisición. | Registro de `released_after_retry` separado de `released`. | O4; K1. | **GAP** |
| O9c | Readmisión solo tras procedimiento aprobado. | Ninguno. | Estado BLOCKED. | No aplica. | Readmisión rechazada sin procedimiento. | Procedimiento aprobado. | O6. | **GAP** |

## 3. Obligaciones añadidas en esta fase (propuesta de cobertura, no ratificadas)

Estas filas no alteran O1–O9. Expresan propuestas de cobertura para requisitos que O1–O9 no cubren explícitamente. Una propuesta no revoca ni convierte en pendiente una decisión del propietario ya existente; en particular, G2 describe la decisión C3 del 2026-11-07.

| ID | Obligación → requisito | Escenario(s) | Precondición | Intercalación | Oráculo | Evidencia necesaria | Dependencia | Estado |
|---|---|---|---|---|---|---|---|---|
| G1 (propuesta O10) | Cleanup solo de objetos cuya atribución a la operación esté demostrada. Nombre, token, PID o antigüedad no bastan. Ante incertidumbre: conservar residuo y mantener UNKNOWN/BLOCKED. | P07-07 (huérfano); P07-04 (APP-OWNER por capas); P07-19 (cleanup owner). | Registro de atribución (APP-OWNER válido, o ausencia que impide cleanup). | Atribución alterada entre creación y cleanup. | Cleanup no ocurre sin atribución; residuo conservado. | Registro de atribución verificable; prueba de conservación. | P07-B; P05 resolución. | **GAP** (no existe escenario que pruebe la regla; el código no implementa atribución verificada: K1 usa token) |
| G2 (propuesta O11) | Cualquier desplazamiento temporal del nombre protegido o modificación de `nlink` del objeto protegido cuenta como afectación, aunque se restaure (decisión C3 del propietario, 2026-11-07). | P07-16 (R-NAME); P07-18b (centinela de destino); P07-21 (Caso A y Caso B). | Objeto protegido con nombre centinela y `nlink` baseline; rol del inode clasificado. | Desplazamiento transitorio o decremento de `nlink`. | Si el inode es protegido, cualquier delta es afectación; si es temporal propio no protegido, cleanup solo bajo contrato específico; rol desconocido = UNKNOWN/BLOCKED. | Traza de namespace y `nlink` antes/después; observación del desplazamiento transitorio y clasificación del rol. | Decisión C3 ya ratificada; reconciliación del oráculo P07-21 por rol. | **DECISIÓN C3 RATIFICADA; COBERTURA DEL ORÁCULO GAP**. No existe conflicto propietario ni se requiere nueva decisión para esta semántica. |
| G3 | Separación de commit, release y readmisión como oráculos independientes. | Ver O9a–O9c. | — | — | — | — | — | **PARTIAL** |
| G4 | Cuarentena durable y prohibición de readmisión sin evidencia. | Combina O1 + O5 + G1. | Mecanismo de cuarentena (no existe). | Crash + ausencia + sustitución. | BLOCKED persiste; ninguna readmisión sin procedimiento. | Ver O1, O5, O6. | P05 mecanismo; propietario. | **GAP** |
| G5 | Recuperación y reclasificación autorizada. | Combina O6 + O9c. | Procedimiento aprobado. | No aplica. | Reclasificación solo por procedimiento registrado. | Documento de procedimiento; registro. | Propietario. | **GAP** |

**Reconciliación G2/C3 (2026-11-26):** el commit remoto `87decf9ec993b24f88ab2fb38bdeb117f458df3a` confirma que la decisión del propietario del 2026-11-07 ya resuelve la semántica de afectación por desplazamiento temporal del nombre protegido o cambio de `nlink`. Para P07-21 Caso A, primero se clasifica el inode: si es protegido, cambiar `nlink` es afectación; si es temporal propio no protegido, solo cabe cleanup bajo su contrato específico; si el rol es ambiguo, UNKNOWN/BLOCKED. La matriz original confundía esta decisión resuelta con un conflicto pendiente. La corrección no aporta ejecución ni cierra P07-C.

## 4. Resumen de estado por obligación

| Estado | Obligaciones |
|---|---|
| CONTRADICTED-CODE | O2 (predicado), O4 (cleanup por nombre), O5 (readmisión por ENOENT) |
| GAP | O1, O6, G1, G4, G5, O9b, O9c |
| UNKNOWN | O7, O8 |
| DECISIÓN RATIFICADA / COBERTURA GAP | G2: C3 ratificado; aplicación del criterio por rol en P07-21 pendiente |
| DEFINIDO-NO-EJECUTADO | O3 (escenarios definidos; target UNKNOWN) |
| PARTIAL | O9, O9a, G3 |

Ninguna fila está en PASS. Ninguna fila tiene evidencia de ejecución.

## 5. Dependencias externas que bloquean el cierre

1. Mecanismo de cuarentena durable (no seleccionado; prohibido inventarlo sin decisión y autorización).
2. Seam interno exacto en el producto para O4 (no existe).
3. Fingerprint del target en el POCO (O8).
4. Cobertura P09 de loaders y consumidores externos (O7).
5. Procedimiento de resolución aprobado (O6, G5).
6. Aplicación documental de la decisión C3 ya ratificada al oráculo P07-21; no requiere nueva decisión del propietario.
7. Política de aliases P07-A y target P07-B.

## 6. Estado

- O1–O9: criterios ratificados; ninguna fila verificada.
- P05: OPEN. P-05-C: RATIFICADA COMO POLÍTICA.
- P07-C: UNKNOWN / BLOCKING.
- C3: RESUELTO por decisión del propietario del 2026-11-07; véase reconciliación remota `87decf9ec993b24f88ab2fb38bdeb117f458df3a`. Esto no cierra P07-C.
- P09: OPEN / UNKNOWN.
- E2/E3: PARTIAL / NOT CLOSED.
- Mecanismo seleccionado: NINGUNO.
- Harness: NO IMPLEMENTADO. Pruebas: NINGUNA EJECUTADA.
- `authorization: NOT_EVALUATED`. Commissioning y efectos protegidos: STOP. NCS M0: INCOMPLETO.