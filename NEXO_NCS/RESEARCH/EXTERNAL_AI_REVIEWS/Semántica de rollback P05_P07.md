# NCS M0 — Semántica de rollback para P05/P07

## Especificación documental y decisiones del propietario

Fecha: 2026-11-10
Tipo: **ESPECIFICACIÓN DOCUMENTAL — NO RATIFICADA COMO CONJUNTO —
NO IMPLEMENTA — NO EJECUTA PRUEBAS, CI NI COMANDOS EN POCO/TERMUX —
NO MODIFICA EL REPOSITORIO NI EL CÓDIGO**
Repositorio: `snowdenxrp/aldea-ia`
Rama documental de referencia: `ncs-continuity-handoff-correction-2026-11-07`
HEAD verificado de la rama: `eee2ae772e5569ffbc90d6334f47c6633f4961fb`
(clon público de solo lectura; GitHub sigue NOT_CONNECTED.)

Estado: **NO DECLARA M0 CERRADO — NO AUTORIZA IMPLEMENTACIÓN NI
EFECTOS PROTEGIDOS — NO DECIDE POR EL PROPIETARIO.**

## 0. Propósito, método y separación obligatoria

### 0.1 Propósito

Esta tarea **no es otra auditoría de CE-1/CE-5/CE-7**. Su única
materia es la ambigüedad identificada en la falsación entregada
2026-11-10: la operación de rollback ("restore de snapshot
anterior") no tiene definición canónica en el expediente. Sin esa
definición, CE-5 no es cerrable ni siquiera en principio
(falsación, §1.1 premisa P-RESTORE y §10 paso 2). Esta
especificación convierte la ambigüedad en cuatro alcances precisos
y comparables, para que el propietario pueda decidir.

### 0.2 Documento base

Informe de falsación ya entregado:

- `NCS_M0_P05_P07_CE1_CE5_CE7_INDEPENDENT_FALSIFICATION_2026-11-10.md`
- 70.990 bytes, SHA-256
  `8f1bb64646db47553ffe9c29541b827110e80ce09120eac0fe8a06ff477ae8b9`
- Veredicto: UNKNOWN / BLOCKING; imposibilidad condicionada,
  no universal; nuevos contraejemplos CE-8 a CE-11 abiertos.

Este documento **usa** ese informe y **no lo repite**: cuando necesita
un resultado de la falsación lo cita por sección (p. ej. "falsación
§4.2") en lugar de re-argumentarlo. La única excepción es el resumen
mínimo del §6, que mapea cada alcance a CE-1/CE-5/CE-7 en una tabla.

### 0.3 Etiquetas obligatorias

Toda afirmación material lleva una de estas etiquetas. La etiqueta
es parte del contenido, no decoración.

| Etiqueta | Significado | Ejemplo de uso |
|---|---|---|
| **[RATIFICADO]** | Decisión expresa del propietario o política ratificada | R1 aceptado; P05-C ratificada |
| **[EVIDENCIA]** | Verificado en una fuente primaria abierta y nombrable (documento canónico o blob, con hash o referencia) | M0.55: sin monotonicidad durable ante restore/rollback |
| **[SUPUESTO]** | Premisa técnica necesaria sin evidencia en el target | "El rollback se ejecuta copiando archivos" |
| **[PROPUESTA]** | Recomendación u opción no ratificada; nunca una decisión | Todas las recomendaciones del §7 |
| **[DECISIÓN DEL PROPIETARIO]** | Solo el propietario puede decidirlo; aquí se presentan opciones y consecuencias, no una decisión | Si el rollback forma parte de R1 |

Reglas: una [PROPUESTA] nunca se registra como [RATIFICADO]; un
[SUPUESTO] nunca se presenta como [EVIDENCIA]; una [DECISIÓN DEL
PROPIETARIO] nunca se resuelve por inferencia técnica en este
documento.

### 0.4 Fuentes

| Fuente | Uso | Estado |
|---|---|---|
| Falsación CE-1/CE-5/CE-7, 2026-11-10 (§0) | Base: P-RESTORE, ACM-1, CE-5, CE-8/CE-10 | Entregada, SHA-256 verificado `8f1bb646…` |
| Obligaciones P05/P07, 2026-11-07 (rama, HEAD `eee2ae77`, SHA-256 `83d70ffd…`) | O1–O9; prohibición de inventar marcador/epoch/daemon/journal | Canónico en rama |
| P05-C definición técnica + delta de ratificación 2026-11-07 (SHA-256 `8631af41…`) | Semántica de P05-C; UNKNOWN/BLOCKED; E1–E9 | Política [RATIFICADO]; resto canónico |
| P07 V2.3 delta normativo + oráculos (SHA-256 `65de8801…` / `f9cc5e43…`) | Detección ≠ prevención; R-OBJ ≠ R-NAME; clases de actor B | Normativa [RATIFICADO] 8-Nov-2026 (encargo) |
| Reconciliación P09, 2026-11-07 (SHA-256 `fd44f337…`) | P09 OPEN/UNKNOWN; APIs path-based; loaders no literales | Canónico en rama |
| Reconciliación lock/release vigente, 2026-11-07 (SHA-256 `1df51530…`) | Token → `rm(path)`; `lockReleaseFailures` volátil; stale refusal | [EVIDENCIA] estática, snapshot `d8b5ca87` |
| Contrato del owner de Continuity, 2026-10-18 (rama) | C4, C6; store sin rollback resistance; "snapshot restore" no prueba autoridad | Canónico en rama |
| M0.55 fencing de revisión, 2026-10-17 (rama) | Sin monotonicidad durable ante restore/rollback | [EVIDENCIA] |
| M0.66 registro canónico, 2026-10-17 (rama) | Sin protección frente a restore/rollback | [EVIDENCIA] |
| Criterios de aceptación ejecutables, 2026-10-19 (rama) | Rollback/manipulación del filesystem: asunto abierto, STOP si afecta efecto protegido | Canónico en rama |
| Matriz de aceptación de despliegue del store, 2026-10-19 (rama) | `storeRevision` no es anti-rollback; no evita rollback a un archivo anterior válido | [EVIDENCIA] |
| GLOBAL-AUDIT-109 / STEP_7 (rama) | Checkpoint restaurado no prueba ausencia de efecto ni autoridad vigente; historia de backup auténtica no prueba autoridad vigente | [EVIDENCIA] |
| Dictamen Misión 03 (dossier R2) | C09: restauración exige cuarentena y verificación antes de activar datos restaurados (copia ≠ verificación ≠ restauración); C15: 3-2-1-1-0 es práctica operativa, no garantía de recuperación absoluta | Correcciones sobrevivientes del dictamen |
| Documentos M1 Android, 2026-10-09 (rama) | Backup del SO y saved-state son dominios separados del proceso de la app; M1 excluye backup de conversación | Canónico en rama (M1, no M0) |

GitHub: NOT_CONNECTED (verificado 2026-11-10). Nada publicado por
este análisis; entrega local para revisión del propietario.

## 1. Vocabulario: qué es rollback y qué no es

### 1.1 Definiciones

**Rollback (reversión)** [definición de este documento, PROPUESTA
de vocabulario, no ratificada]: operación que sustituye el estado
actual de un conjunto definido de datos por el estado de ese
conjunto capturado en un instante anterior T0. La operación tiene
cuatro parámetros obligatorios, sin los cuales no está definida:
**ámbito** (qué conjuntos de datos incluye), **origen** (qué snapshot
de T0 se usa), **ejecutor** (quién la realiza y con qué autoridad) y
**atomicidad** (si se aplica todo o nada).

**Snapshot** [SUPUESTO de trabajo]: copia capturada del estado de un
ámbito en un instante. No se presupone cómo se captura (copia de
archivos, backup del SO, imagen) ni que la captura fuera atómica:
la captura misma puede ser parcial, y eso es una ambigüedad
adicional que este documento registra pero no resuelve (ver §4.1).

**Restore** [definición]: el acto de aplicar un snapshot. Rollback
es restore con un snapshot **anterior** al estado actual y con
intención de revertir. Un restore de un snapshot posterior (avance)
no es rollback y queda fuera de este documento.

**Currentness (vigencia)** [EVIDENCIA, contrato del owner C6 y
STEP_7]: propiedad de ser el estado vigente, no solo un estado
válido. Un estado restaurado puede ser válido (JSON correcto,
firma/hash correctos) sin ser vigente. "Persisted record ≠
authority" y "valid JSON/schema ≠ current canonical history"
(contrato del owner). La historia de backup auténtica no prueba
autoridad vigente (STEP_7).

**Cuarentena** [EVIDENCIA, C09 del dictamen M03]: estado en el que
los datos restaurados se conservan sin activarse hasta verificarlos.
Copia ≠ verificación ≠ restauración: copiar los bytes no es
verificarlos, y verificarlos no es activarlos.

### 1.2 Lo que rollback NO es

| Operación | Diferencia con rollback |
|---|---|
| Crash y reinicio sin restore | El estado en disco no retrocede; solo se pierde el estado en memoria. No resucita credenciales consumidas. |
| Recuperación de lock stale | Rechazo de un lock antiguo sin borrarlo (reconciliación 2026-11-07 §2: stale → `STALE_RECOVERY_REQUIRED`, sin auto-reap). No es rollback: no sustituye estado. |
| Diagnóstico D2 | Solo observa evidencia externa y metadata; no abre stores canónicos, no modifica locks ni concede readmisión (P05-C). Observar no es revertir. |
| Retry / reintento | Repetir una operación hacia adelante. El rollback mueve el estado hacia atrás; el reintento no. |
| Reset / borrado | Eliminar el estado sin sustituirlo por uno anterior. Un reset no resucita credenciales (no hay estado anterior que las declare no usadas); un rollback sí. |
| Migración / actualización | Cambio de formato o versión hacia adelante, con regla de conversión. No es una reversión temporal. |

### 1.3 Los cuatro conjuntos de datos

La comparación de alcances exige nombrar los conjuntos con
precisión. Las definiciones son [PROPUESTA] de vocabulario,
construidas a partir de los contratos canónicos citados.

| Conjunto | Contenido | Base canónica |
|---|---|---|
| **RES — recurso protegido** | Estado de negocio/persistencia: documento de Continuity (`NEXO_OPERATIONAL_CONTINUITY`: `missions`, `attempts`, `executions`, `effectJournal`, `doNotRepeat`) y documento Chronicle. Es el estado cuya persistencia P05-C ordena conservar por separado del release. | Contrato del owner (schema v1); P05-C §4 (separación negocio/release); E1–E9 |
| **COORD — registros de coordinación** | Estado que ordena el acceso: directorios lock + `owner.json` (PID/token), `storeRevision` (revisión local de conditional-commit), registros de generación/epoch si existieran, marcas de BLOCKED/UNKNOWN si existieran, registros de diagnóstico D2. | Reconciliación lock/release 2026-11-07; obligaciones O1–O6 |
| **AUTH — autorizaciones** | Decisiones de autoridad y credenciales: admisiones concedidas, tokens, nonces y credenciales de release de un solo uso, obligaciones PREPARED (misión/paso/acción/destino) y sus resultados terminales, registros de revocación. | P03/P04 D1–D6; contrato del owner (PREPARED); E8 |
| **DOM — dominio local** | Todo lo anterior **más** el resto del estado local bajo control del propietario en el entorno R1: resto de HOME privado Termux (configuración, logs, manifiestos, registros), estado guardado de la app Android (saved-state) y copias/backup locales. Excluye el SO mismo y todo lo que esté fuera del sandbox/HOME. Si el ámbito incluye el código (checkout del repositorio) es una sub-decisión dentro de D-RB-01: este documento lo trata como **no incluido por defecto** y lo señala como opción. | R1 (Android sandbox + HOME privado Termux); documentos M1 (backup del SO como dominio separado) |

Nota sobre PREPARED: una obligación PREPARED pertenece a la vez a
COORD (coordina la ejecución) y a AUTH (es una obligación ligada a
una admisión). Para los alcances de este documento se clasifica en
**AUTH**, porque su reversión resucita una obligación de efecto:
si PREPARED desaparece por rollback mientras el efecto ya se
despachó, el efecto queda sin registro (incertidumbre E2). La
clasificación alternativa (PREPARED en COORD) no cambia ninguna
conclusión de los alcances 3 y 4, y solo desplaza un síntoma en el
alcance 2; se registra la alternativa para no ocultar la decisión.

### 1.4 Los cuatro alcances

| Alcance | Conjuntos revertidos | Conjuntos que permanecen en el presente |
|---|---|---|
| **RB-1** | RES | COORD, AUTH, resto de DOM |
| **RB-2** | RES + COORD | AUTH, resto de DOM |
| **RB-3** | RES + COORD + AUTH | Resto de DOM |
| **RB-4** | RES + COORD + AUTH + resto de DOM (integral) | Nada local (salvo lo externo al dominio: el mundo, los efectos ya producidos, la memoria del ejecutor) |

RB-1 a RB-4 forman una escala de inclusión estricta: cada alcance
contiene al anterior. Esa monotonía es la que permite comparar
consecuencias: lo que empeora de RB-1 a RB-4 no es un accidente de
cada alcance, es la pérdida progresiva de todo punto de referencia
externo al ámbito revertido.

## 2. Hechos ratificados y evidencia vigente (base común)

Todo lo de esta sección es [RATIFICADO] o [EVIDENCIA]; nada aquí es
una propuesta. Si un alcance contradice un hecho de esta sección, es
el alcance el que queda en cuestión, no el hecho.

| # | Hecho | Etiqueta y fuente |
|---|---|---|
| F1 | R1 aceptado por el propietario (2026-11-02): Android sandbox + HOME privado Termux, invocación manual foreground única, propietario único lanzador manual durante la ventana; excluye root/OS comprometido y procesos maliciosos con el mismo UID. E2/E3 PARTIAL/NOT CLOSED. La aceptación del límite no prueba control de los actores reales. | [RATIFICADO] Deltas 2026-11-07 en P07 V2.3 y P05-C |
| F2 | P05-C ratificada como política (2026-11-07): incertidumbre de release/cleanup → UNKNOWN/BLOCKED, sin recuperación automática; no se repite la operación de negocio; no hay segunda limpieza destructiva por path sin identidad demostrada; ausencia, edad, PID, timeout, error de parseo o estado local no prueban release ni quiescencia; D2 solo observa; si no se demuestra enforcement durable/interproceso de BLOCKED, la instancia permanece bloqueada y M0 STOP. | [RATIFICADO] Delta de ratificación en definición P05-C |
| F3 | P07 V2.3 ratificada (8-Nov-2026): detección ≠ prevención; retención ≠ prevención; serialización ≠ `PASS_GATE`; R-OBJ ≠ R-NAME; actor B clasificado (COVERED/RAW/PRIVILEGED/UNCLASSIFIABLE); `PASS_GATE` exige oráculo completo, cobertura de actores/writers y dependencias cerradas. | [RATIFICADO] Encargo; delta V2.3 |
| F4 | P09 OPEN/UNKNOWN: cobertura estática parcial de imports literales; UNKNOWN loaders no literales, consumidores externos y cobertura universal; admisión pre-read no implementada en rutas path-based observadas. | [EVIDENCIA] Reconciliación P09 2026-11-07 |
| F5 | El código vigente no demuestra cuarentena durable ni cleanup replacement-safe: release con token → `rm(path)` (check/use no atómico); `lockReleaseFailures` es un `Set` en memoria que ENOENT limpia y permite readmisión; stale lock se rechaza sin auto-reap. O4/O5 NO SATISFECHAS; O1–O3/O6–O8 UNKNOWN; O9 PARTIAL. | [EVIDENCIA] Reconciliación lock/release 2026-11-07, snapshot `d8b5ca87` |
| F6 | El store local no reclama resistencia a rollback: "does not claim fsync/power-loss durability, rollback resistance…"; "The local store revision is not an authority epoch or global fence"; `storeRevision` coordina escritores cooperantes, no proporciona autoridad, fencing global ni anti-rollback; "no evita rollback a un archivo anterior válido". | [EVIDENCIA] Contrato del owner 2026-10-18; matriz de despliegue 2026-10-19 |
| F7 | Ningún mecanismo revisado prueba monotonicidad durable ante restore/rollback (M0.55, M0.66). La revisión local es una primitiva de concurrencia de almacenamiento, no una prueba de currentness tras restore (contrato del owner C4). | [EVIDENCIA] M0.55, M0.66, contrato del owner C4 |
| F8 | Un restore exitoso no prueba autoridad vigente (contrato del owner C6: el store no puede inferir autoridad actual de "a successful snapshot restore"). Un checkpoint restaurado no prueba ausencia de efecto ni autoridad vigente (GLOBAL-AUDIT-109). La historia de backup auténtica no prueba autoridad vigente (STEP_7). | [EVIDENCIA] Contrato del owner C6; GLOBAL-AUDIT-109; STEP_7 |
| F9 | La restauración exige cuarentena y verificación antes de activar los datos restaurados (copia ≠ verificación ≠ restauración). | [EVIDENCIA] Corrección C09, dictamen Misión 03 (sobreviviente) |
| F10 | La resistencia a rollback/manipulación del filesystem es un asunto abierto que debe seguir en STOP cuando afecte a un efecto protegido; no se oculta ni se declara resuelto por los tests. No se demuestra una fuente canónica que detecte rollback/revocación antes del sink (E-05, PARCIAL). | [EVIDENCIA] Criterios de aceptación ejecutables 2026-10-19; matriz de aceptación 2026-10-20 |
| F11 | El backup del SO y el saved-state de Android son dominios separados del proceso de la app y pueden restaurar estado sin intervención de la app. | [EVIDENCIA] Documentos M1 Android 2026-10-09 (ámbito M1, no M0) |
| F12 | La práctica 3-2-1-1-0 es una práctica operativa de backup, no una certificación ni una garantía de recuperación absoluta. | [EVIDENCIA] Corrección C15, dictamen Misión 03 |
| F13 | No existe en la rama consultada una definición canónica de la operación de rollback (ejecutor, ámbito, atomicidad). Las menciones de rollback en el expediente hablan de *resistencia* a rollback, no de una operación definida. | [EVIDENCIA] Falsación 2026-11-10 §0.3 y §10; búsqueda en rama (esta especificación, §0.4) |
| F14 | No existe procedimiento aprobado de recuperación/readmisión (E8 sin ruta positiva). D2 no desbloquea. La readmisión futura exige decisión expresa del propietario y procedimiento concreto demostrado (O6). | [RATIFICADO] P05-C; obligaciones O6; matriz E1–E9 (E8) |

Consecuencia inmediata de F6–F8 (se enuncia aquí porque condiciona
toda la comparación): **hoy no existe en el target ningún componente
que detecte un rollback ni que distinga un estado vigente de un
estado restaurado.** Cualquier alcance cuya seguridad dependa de
detectar el rollback depende de un mecanismo que no existe. Esa es
la razón por la que los alcances se comparan también por su
*detectabilidad*, no solo por lo que revierten.

## 3. Comparación de los cuatro alcances

Cada alcance se especifica en las siete dimensiones exigidas por el
encargo. Las celdas indican su etiqueta: lo que es consecuencia
lógica de F1–F14 se marca [EVIDENCIA] o [RATIFICADO]; lo que depende
de cómo se ejecute el rollback, [SUPUESTO]; lo que exige una
decisión, [DECISIÓN DEL PROPIETARIO]; lo que se propone aquí,
[PROPUESTA].

### 3.1 RB-1 — Restauración únicamente del recurso protegido

| Dimensión | Especificación |
|---|---|
| **Qué datos regresan** | Solo RES (documento Continuity y documento Chronicle) vuelve a T0. COORD (locks, `owner.json`, `storeRevision`), AUTH (admisiones, nonces, PREPARED) y el resto de DOM permanecen en el presente. [PROPUESTA de delimitación] |
| **Quién ejecuta y con qué autoridad** | [DECISIÓN DEL PROPIETARIO] (D-RB-02). La opción mínima compatible con R1 es el propietario, manualmente, con declaración explícita. Un ejecutor distinto del propietario (herramienta, script, SO) es una ampliación de autoridad que debe decidirse: quien puede revertir RES puede borrar efectos registrados. El SO (backup/saved-state) como ejecutor no está contemplado en R1 y debe clasificarse (F11). |
| **Atómica o parcial** | [SUPUESTO] El rollback de RES es en la práctica una sustitución de archivos (uno o varios). Sin un mecanismo transaccional, un crash durante la sustitución deja RES mezclado: parte en T0, parte en presente. La atomicidad total es [PROPUESTA] como requisito (D-RB-03), no un hecho. Si RES tiene varios archivos, la sustitución archivo a archivo no es atómica. |
| **Detección de incompleta o ambigua** | **Detectable en principio, por inconsistencia interna.** COORD y AUTH permanecen en el presente y referencian el estado de RES que ya no existe: `storeRevision` en COORD es posterior a la revisión del RES restaurado; PREPARED en AUTH referencia misiones/attempts que RES ya no contiene (violación de C2: toda entrada PREPARED debe conservar misión y paso coincidentes). Esa inconsistencia es detectable **si** existe una comprobación cruzada RES↔COORD↔AUTH [SUPUESTO: la comprobación no existe hoy; es [PROPUESTA] como requisito, D-RB-04]. Sin la comprobación, la inconsistencia es invisible y el sistema opera sobre datos viejos creyéndolos vigentes. Un rollback parcial (algunos archivos de RES) produce el mismo tipo de inconsistencia, pero dentro de RES: detectable solo por manifiesto+hashes del snapshot [SUPUESTO: el manifiesto debe existir y no estar incluido en el ámbito revertido]. |
| **Sesiones, descriptores y operaciones en curso** | Los descriptores abiertos no se cierran por un rollback de archivos: un `fd` sigue refiriendo al inode que abrió. Si el rollback sustituye el archivo (unlink+create), los poseedores del `fd` siguen escribiendo en el **inode antiguo** (pre-rollback) mientras los lectores por path ven el **objeto restaurado**: split-brain entre poseedores de `fd` y lectores por path (falsación §4.1(b)). Si el rollback sobrescribe in place, los poseedores del `fd` ven el contenido restaurado sin haberlo solicitado. Las operaciones en curso (incluidas las PREPARED despachadas) quedan en incertidumbre E2: su resultado no puede atribuirse ni al estado presente ni al restaurado. [EVIDENCIA de la semántica de `fd`: falsación P-FD; verificación en el target: UNKNOWN] |
| **¿Autorización anterior vuelve a parecer válida?** | **No, para AUTH.** Las credenciales consumidas permanecen consumidas porque AUTH no se revierte: un nonce usado sigue usado, un release ejecutado sigue ejecutado en AUTH. No hay resurrección de autorizaciones. **Sí, indirectamente, para el recurso:** una admisión vigente (AUTH presente) pasa a operar sobre un RES antiguo; la autorización es válida, pero su objeto ya no es el que la autorización describía (CE-7 en forma leve: identidad del objeto vs. identidad del registro). La autorización no resucita; el **objeto** retrocede bajo una autorización vigente. |
| **Respuesta que exige P05-C** | **UNKNOWN/BLOCKED hasta reconciliación verificada.** La inconsistencia RES↔COORD↔AUTH es incertidumbre de release/admisión en el sentido de P05-C (F2): no se puede determinar qué operaciones corresponden a qué estado. [RATIFICADO] La readmisión normal queda bloqueada; la activación de los datos restaurados exige cuarentena y verificación previas (F9). La readmisión aprobada no existe hoy (F14): solo cabe BLOCKED hasta que exista procedimiento aprobado. Si la inconsistencia no se detecta (sin comprobación cruzada), el sistema incumple P05-C **en silencio**: ese es el riesgo específico de RB-1, y la razón por la que la comprobación cruzada es requisito, no adorno. |

### 3.2 RB-2 — Restauración del recurso y de los registros de coordinación

| Dimensión | Especificación |
|---|---|
| **Qué datos regresan** | RES + COORD vuelven a T0. AUTH (admisiones, nonces, PREPARED, revocaciones) y el resto de DOM permanecen en el presente. [PROPUESTA de delimitación] |
| **Quién ejecuta y con qué autoridad** | [DECISIÓN DEL PROPIETARIO] (D-RB-02). Mismo análisis que RB-1, agravado: quien revierte COORD puede **recrear un lock** que ya fue liberado o **borrar un lock** que protegía una operación en curso. Revertir COORD es ejercer autoridad sobre la admisión misma, no solo sobre los datos: es una decisión de autoridad, no una operación de archivos. |
| **Atómica o parcial** | [SUPUESTO] Igual que RB-1, con un ámbito mayor y por tanto más puntos de corte: un crash durante el rollback puede dejar RES en T0 y COORD en presente (es decir, degenerar en RB-1 parcial) o a la inversa. La atomicidad **entre conjuntos** (RES y COORD juntos) es el requisito nuevo: sin ella, un rollback RB-2 interrumpido es indistinguible de un RB-1. [PROPUESTA] D-RB-03. |
| **Detección de incompleta o ambigua** | **Parcialmente detectable, por inconsistencia entre COORD y AUTH.** RES y COORD son coherentes entre sí en T0 (el rollback es autoconsistente dentro de su ámbito), así que la comprobación RES↔COORD ya no detecta nada. Lo que queda es el desajuste COORD↔AUTH: la generación en COORD es T0 mientras AUTH contiene admisiones/nonces/revocaciones posteriores a T0 (p. ej. un nonce consumido después de T0 que COORD en T0 declara no usado, o una revocación posterior a T0 que COORD en T0 desconoce). Detectable **si** existe comprobación cruzada COORD↔AUTH [SUPUESTO; PROPUESTA D-RB-04]. Sin ella, el rollback es indetectable desde dentro. Un rollback parcial (RES en T0, COORD en presente) es detectable como RB-1; un rollback parcial inverso (COORD en T0, RES en presente) produce locks de T0 sobre datos presentes: detectable solo si RES y COORD se comparan por revisión/generación. |
| **Sesiones, descriptores y operaciones en curso** | Todo lo de RB-1, más: **los locks revierten.** Un lock liberado después de T0 reaparece como adquirido (falso positivo de exclusión: la nueva invocación se bloquea sin dueño vivo — seguro pero sin liveness, y P05-C lo trata como UNKNOWN/BLOCKED, no como prueba de dueño). Un lock adquirido después de T0 desaparece (falso negativo: la nueva invocación admite mientras el poseedor antiguo sigue vivo con su `fd` — interacción directa con CE-1: el poseedor antiguo conserva capacidad aunque COORD diga que no hay nadie). Las operaciones en curso quedan en incertidumbre E2, igual que en RB-1, con el agravante de que el registro que permitiría reconstruirlas (COORD) también retrocedió. |
| **¿Autorización anterior vuelve a parecer válida?** | **No en AUTH, sí en COORD.** AUTH no se revierte: los nonces consumidos siguen consumidos. Pero COORD en T0 puede declarar vigente una generación que AUTH ya cerró, o declarar libre un recurso que AUTH tiene admitido. El resultado práctico es el inverso de RB-1: en RB-1 la autorización vigente opera sobre un objeto viejo; en RB-2 una **coordinación vieja** puede admitir una operación que AUTH ya había excluido (o excluir una que AUTH había admitido). La autorización en sí no resucita; la **decisión de admisión** puede contradecirse. |
| **Respuesta que exige P05-C** | **UNKNOWN/BLOCKED hasta reconciliación verificada.** [RATIFICADO] La contradicción COORD↔AUTH es incertidumbre sobre quién está admitido y sobre qué: exactamente el caso que P05-C ordena bloquear. Cuarentena y verificación previas a cualquier activación (F9). Readmisión aprobada: no existe (F14). Si no existe comprobación COORD↔AUTH, el incumplimiento es silencioso, como en RB-1 pero con un ámbito mayor de silencio: RES↔COORD ya no lo delata. |

### 3.3 RB-3 — Restauración del recurso, coordinación y autorizaciones

| Dimensión | Especificación |
|---|---|
| **Qué datos regresan** | RES + COORD + AUTH vuelven a T0. Solo el resto de DOM (logs, manifiestos, registros fuera de estos tres conjuntos) permanece en el presente. [PROPUESTA de delimitación] |
| **Quién ejecuta y con qué autoridad** | [DECISIÓN DEL PROPIETARIO] (D-RB-02). Quien ejecuta RB-3 ejerce la máxima autoridad operativa del dominio: puede resucitar autorizaciones, revocar revocaciones y borrar obligaciones PREPARED. Es indistinguible, en sus efectos, de ejercer la autoridad raíz sobre el estado operativo. Por eso su autorización no puede ser implícita ni delegada a una herramienta por defecto: es una decisión de la misma familia que D-01/D-02 (custodia y autoridad raíz), y debe tratarse como tal. Un ejecutor automático (backup del SO, script) en este alcance equivale a delegar la autoridad raíz a ese ejecutor. |
| **Atómica o parcial** | [SUPUESTO] Igual que RB-2, con tres conjuntos. Un crash durante el rollback degenera en RB-2 o RB-1 parciales. La atomicidad entre los tres conjuntos es [PROPUESTA] como requisito (D-RB-03). Nótese la circularidad: el registro que acreditaría la atomicidad (un diario del rollback) pertenece a COORD o a DOM; si pertenece a COORD, el rollback lo revierte; si pertenece a DOM, sobrevive pero debe estar fuera del ámbito (ver RB-4 y D-RB-09). |
| **Detección de incompleta o ambigua** | **Indetectable desde dentro.** RES, COORD y AUTH son mutuamente coherentes en T0: el estado restaurado es exactamente un estado que el sistema ocupó legítimamente. Ninguna comprobación interna (revisión, hash, consistencia cruzada) puede distinguir "estamos en T0 porque nunca avanzamos" de "estamos en T0 porque retrocedimos". [EVIDENCIA de la estructura: F7, F8.] Solo un **ancla externa** al ámbito revertido puede detectarlo: un registro fuera de DOM, un contador monótono en hardware/TEE, la memoria del ejecutor, un log externo. [SUPUESTO: ningún ancla existe hoy; PROPUESTA D-RB-04.] Un rollback parcial sí es detectable (degenera en RB-2/RB-1, con sus inconsistencias), **pero solo si el sistema llega a observar el estado parcial**: si el rollback se completa, no queda rastro del parcial. La detección de "incompleto" exige observar durante la operación, no después. |
| **Sesiones, descriptores y operaciones en curso** | Todo lo de RB-1 y RB-2, más: las sesiones y operaciones en curso pierden también su registro de autorización. Un proceso con `fd` abierto y admisión vigente en el presente se encuentra, tras RB-3, con una AUTH en T0 que puede no conocerlo (su admisión ocurrió después de T0): el proceso es, a ojos del sistema restaurado, un actor sin admisión que conserva capacidad de mutar (CE-1 en su forma más grave: el sistema ya no puede ni siquiera identificar al poseedor antiguo). Las obligaciones PREPARED posteriores a T0 desaparecen: efectos despachados quedan sin registro, y su resultado es UNKNOWN permanente (E2) hasta reconciliación externa. Si el proceso en curso reintenta su operación, el sistema restaurado lo trata como operación nueva. |
| **¿Autorización anterior vuelve a parecer válida?** | **Sí. Este es el caso CE-5.** Un nonce consumido después de T0 vuelve a figurar como no usado; una credencial de release ejecutada vuelve a ser válida; una revocación posterior a T0 desaparece y la autorización revocada vuelve a parecer vigente; una admisión denegada después de T0 puede volver a concederse con los mismos datos. [EVIDENCIA de la estructura: falsación §4.2; F7.] La resurrección no es un fallo de implementación: es la definición misma de RB-3. Cualquier autorización anterior a T0 que no había sido consumida en T0 es indistinguible de una autorización fresca. |
| **Respuesta que exige P05-C** | **BLOCKED — y, sin ancla externa, BLOCKED inaplicable.** [RATIFICADO] P05-C ordena UNKNOWN/BLOCKED ante la incertidumbre, y la incertidumbre aquí es total (el sistema no puede saber que retrocedió). Pero el enforcement de BLOCKED exige que alguien o algo **sepa** que hubo rollback: sin ancla externa ni declaración del ejecutor, el sistema procede como si nada hubiera ocurrido y P05-C se incumple en silencio. Por tanto RB-3 admite solo dos posturas conformes con P05-C: (a) **prohibirlo** mientras no exista ancla externa y procedimiento aprobado (moratoria, D-RB-01 opción A); o (b) permitirlo únicamente con **declaración obligatoria del ejecutor por un canal fuera del ámbito** (D-RB-04 opción C) seguida de BLOCKED y cuarentena (F9) hasta reconciliación. La readmisión aprobada no existe hoy (F14). Cualquier tercera postura ("permitirlo y confiar en que se detecte") contradice F7/F8. |

### 3.4 RB-4 — Restauración integral de todo el dominio local

| Dimensión | Especificación |
|---|---|
| **Qué datos regresan** | RES + COORD + AUTH + resto de DOM: todo el estado local bajo control del propietario en el entorno R1 vuelve a T0. Incluye logs, manifiestos, registros de diagnóstico D2 y cualquier diario local del rollback. [PROPUESTA de delimitación] Quedan fuera, por definición, el SO mismo, los efectos externos ya producidos (mensajes enviados, efectos ejecutados fuera del dominio) y la memoria del ejecutor. Si el ámbito incluye el código (checkout), debe declararse (D-RB-01): por defecto **no incluido** en esta especificación. |
| **Quién ejecuta y con qué autoridad** | [DECISIÓN DEL PROPIETARIO] (D-RB-02). El ejecutor de RB-4 es, en la práctica, quien controla el dominio: el propietario manualmente, o el SO mediante backup/saved-state (F11). El caso del SO es el más grave: Android puede restaurar el estado guardado de la app sin intervención ni declaración del propietario, es decir, un rollback integral ejecutado por un actor que no es el propietario, sin autoridad delegada y sin registro. [EVIDENCIA: F11.] Clasificar ese caso es parte de D-RB-02: o se desactiva, o se declara, o se acepta como ejecutor con sus consecuencias. |
| **Atómica o parcial** | [SUPUESTO] Un rollback integral es una operación sobre muchos archivos y probablemente sobre varios mecanismos (archivos, backup del SO, saved-state). Su atomicidad total es inverosímil sin un mecanismo diseñado para ello; un crash durante RB-4 produce un dominio mezclado (parte en T0, parte en presente) sin que ningún registro local pueda decir qué parte es cuál, porque los registros también se revirtieron. La atomicidad es [PROPUESTA] como requisito (D-RB-03), pero debe reconocerse: exigir atomicidad integral sin mecanismo es exigir una propiedad que nadie ha demostrado. |
| **Detección de incompleta o ambigua** | **Imposible desde dentro, por definición.** En RB-4 no sobrevive ningún registro local del rollback, incluida la constancia de que un rollback ocurrió, de que fue parcial o de qué snapshot se usó. La detección exige un testigo **externo al dominio**: un log fuera de HOME, un contador en hardware/TEE, una contraparte externa, la memoria humana del ejecutor. [SUPUESTO: ninguno existe hoy.] Un rollback parcial integral es el peor caso de detección: el dominio mezclado es indistinguible de un dominio coherente pero con datos corruptos o desactualizados, y cualquier diagnóstico local (D2) opera sobre datos que pueden ser los revertidos. |
| **Sesiones, descriptores y operaciones en curso** | El estado en disco retrocede; los procesos en ejecución no forman parte del snapshot de datos y conservan memoria y descriptores del presente. El resultado es el split-brain máximo: procesos del presente operando sobre un disco del pasado, con registros de autorización del pasado que no los conocen (RB-3 agravado). Los efectos externos ya producidos no se pueden "des-producir": el dominio restaurado afirma que nunca ocurrieron mientras el mundo afirma que sí (GLOBAL-AUDIT-109: el checkpoint restaurado no prueba ausencia de efecto). Una operación PREPARED despachada antes del rollback puede ejecutarse dos veces (una antes, una después, al reintentarse desde el estado restaurado que la desconoce) sin que ningún registro local lo detecte. |
| **¿Autorización anterior vuelve a parecer válida?** | **Sí, como en RB-3, y además sin testigo.** Toda autorización anterior a T0 no consumida en T0 es válida; toda revocación posterior a T0 desaparece. La diferencia con RB-3 es que en RB-3 queda al menos el resto de DOM (logs, manifiestos) como testigo potencial; en RB-4 ni siquiera eso. La resurrección es total e indetectable. |
| **Respuesta que exige P05-C** | **BLOCKED por política; inaplicable sin testigo externo.** [RATIFICADO] Como en RB-3, P05-C ordena BLOCKED ante la incertidumbre, pero el sistema no puede saber que debe bloquearse. RB-4 es, por tanto, **incompatible con P05-C/P07-C mientras no exista un ancla externa** (D-RB-04 opción A) o una prohibición efectiva del ejecutor automático (D-RB-02). Las únicas posturas conformes son: (a) prohibir RB-4 (moratoria); o (b) permitirlo solo con testigo externo obligatorio y BLOCKED posterior. Permitirlo sin testigo es aceptar que P05-C puede incumplirse en silencio, lo que contradice F2. La readmisión aprobada no existe hoy (F14). |

### 3.5 Tabla comparativa resumida

| Dimensión | RB-1 (RES) | RB-2 (RES+COORD) | RB-3 (RES+COORD+AUTH) | RB-4 (integral) |
|---|---|---|---|---|
| Conjuntos revertidos | RES | RES, COORD | RES, COORD, AUTH | Todos los locales |
| Detectable desde dentro | Sí, por inconsistencia RES↔COORD↔AUTH (si existe comprobación) | Parcial: solo por COORD↔AUTH | **No**: autoconsistente en T0 | **No**: ni siquiera queda testigo local |
| Autorización resucitada | No en AUTH; objeto retrocede bajo autorización vigente | No en AUTH; la coordinación puede contradecir a AUTH | **Sí**: nonces, releases, revocaciones | **Sí**, y sin testigo |
| Sesiones/`fd` en curso | Split-brain `fd` vs. path | + locks revertidos (falsos positivos y negativos) | + poseedores no identificables; PREPARED desaparecidas | + procesos del presente sobre disco del pasado; efectos externos duplicables |
| Respuesta P05-C | UNKNOWN/BLOCKED hasta reconciliación; cuarentena (F9) | UNKNOWN/BLOCKED hasta reconciliación; cuarentena (F9) | BLOCKED; inaplicable sin ancla/declaración | BLOCKED por política; inaplicable sin testigo externo |
| Condición mínima para permitirlo | Comprobación cruzada RES↔COORD↔AUTH | Comprobación COORD↔AUTH + atomicidad RES+COORD | Declaración del ejecutor fuera del ámbito + ancla externa (o prohibición) | Testigo externo obligatorio (o prohibición) |

## 4. Cuestiones transversales

### 4.1 Atomicidad: qué significa y por qué es circular

Atómico significa aquí: o todos los conjuntos del alcance vuelven
a T0, o ninguno. [PROPUESTA de definición.] En la práctica, un
rollback es una secuencia de operaciones sobre archivos (o sobre
mecanismos del SO), y un crash en medio deja un estado mezclado.
Ese estado mezclado es exactamente el contraejemplo CE-10 de la
falsación (snapshots sesgados: RES en T0, COORD en T1 — una
combinación que nunca existió). La atomicidad se garantizaría con
un diario transaccional del rollback (primero registrar la
intención, luego aplicar, luego confirmar). Pero el diario es
estado, y el estado pertenece a algún conjunto: si pertenece a
COORD, el rollback lo revierte (en RB-2/3/4); si pertenece a DOM,
sobrevive en RB-1/2/3 pero no en RB-4. La garantía de atomicidad
depende de un registro que el propio rollback puede borrar: es la
misma circularidad que CE-8 (la decisión del mediador también tiene
CE-5) aplicada al rollback. Conclusión: la atomicidad total es
exigible como **requisito** [PROPUESTA, D-RB-03], pero su
**verificación** exige un testigo fuera del ámbito revertido, y ese
testigo es una decisión (D-RB-04/D-RB-09), no un hecho.

La captura del snapshot tiene el mismo problema en espejo: un
snapshot capturado mientras el sistema escribe puede mezclar
instantes (RES de T0, COORD de T0+ε). Un rollback a un snapshot
incoherente restaura una incoherencia. [SUPUESTO.] La coherencia de
la captura debe especificarse junto con la atomicidad de la
aplicación; ambas son D-RB-03.

### 4.2 Detección: qué puede detectar cada mecanismo

| Mecanismo de detección | Detecta RB-1 | Detecta RB-2 | Detecta RB-3 | Detecta RB-4 | Límite |
|---|---|---|---|---|---|
| Comprobación cruzada RES↔COORD↔AUTH (revisión/generación) | Sí | Parcial (COORD↔AUTH) | No (autoconsistente) | No | La comprobación no existe hoy [SUPUESTO]; debe diseñarse [PROPUESTA] |
| Manifiesto + hashes del snapshot | Sí (si el manifiesto está fuera del ámbito) | Sí (idem) | Solo el parcial, y solo durante la operación | No (el manifiesto se revierte) | El manifiesto es estado; su ubicación es parte del alcance |
| Declaración del ejecutor (canal fuera del ámbito) | Sí | Sí | Sí | Sí | Depende de que el ejecutor declare y diga la verdad; no detecta rollback no declarado (p. ej. SO automático) |
| Ancla externa monótona (contador/log fuera del dominio; hardware/TEE) | Sí | Sí | Sí | Sí | No existe hoy [SUPUESTO]; es un mecanismo nuevo que exige decisión (falsación N2) |
| Inspección de logs locales / D2 | Sí (si los logs sobreviven) | Parcial | No (los logs de AUTH se revirtieron; los de DOM pueden delatarlo) | No | D2 solo observa; no puede distinguir "viejo" de "restaurado" sin referencia externa |
| Contenido/hash de los datos | No (los datos restaurados son válidos) | No | No | No | Validez ≠ vigencia (F8) |

Lectura: **ningún mecanismo interno detecta RB-3/RB-4.**
Solo la declaración del ejecutor o un ancla externa los detectan.
Esa es la consecuencia técnica central de esta especificación, y es
la que obliga a las decisiones D-RB-01, D-RB-02 y D-RB-04.

### 4.3 Sesiones, descriptores y operaciones en curso (común a los alcances)

Tres hechos gobiernan todos los alcances; se enuncian una vez aquí
para no repetirlos en cada alcance:

1. **Un rollback de archivos no cierra descriptores ni mata
   procesos.** [EVIDENCIA de semántica: falsación P-FD; verificación
   en el target UNKNOWN.] El poseedor de un `fd` conserva capacidad
   de mutar sobre el inode que abrió, con independencia de lo que el
   rollback haga con el path. Todo rollback con sesiones vivas es,
   por tanto, un rollback con actores que el estado restaurado no
   conoce.
2. **Una operación en curso durante el rollback tiene resultado
   UNKNOWN.** No se puede atribuir su efecto al estado presente ni
   al restaurado, ni saber si se ejecutó una vez, dos veces o
   ninguna. Es el caso E2 de la matriz P05-C, agravado por la
   reversión del registro. [RATIFICADO por P05-C: E2 → UNKNOWN/
   BLOCKED, sin retry ni readmisión.]
3. **Una obligación PREPARED despachada y luego revertida es un
   efecto sin registro.** Si el efecto se produjo fuera del dominio
   (o se producirá por reintento desde el estado restaurado), el
   sistema no puede reconciliarlo: viola C2 (toda PREPARED debe
   conservar misión y paso coincidentes) y deja el resultado en
   UNKNOWN permanente hasta reconciliación externa.
   [EVIDENCIA: contrato del owner C2; GLOBAL-AUDIT-109.]

De 1–3 se sigue una condición transversal [PROPUESTA, D-RB-06]: un
rollback permitido exige como precondición la **quiescencia** de
las sesiones (ninguna operación en curso, ningún descriptor abierto
sobre el ámbito). Y se sigue también su dificultad: verificar la
quiescencia es el problema CE-1/Q de la falsación (enumerar
poseedores de capacidad), no resuelto. La precondición debe
enunciarse con su dificultad, no darse por sentada.

### 4.4 El ejecutor que no es el propietario: el SO

F11 [EVIDENCIA] establece que el backup del SO y el saved-state de
Android son dominios separados del proceso de la app y pueden
restaurar estado sin intervención de la app. Eso significa que
RB-4 (y en parte RB-1, si el backup del SO cubre los archivos de
RES) puede ser ejecutado por **Android mismo**, sin declaración,
sin registro y sin autoridad delegada por el propietario. Un
rollback ejecutado por el SO no es un caso marginal: es el ejecutor
más probable de un rollback no declarado en el entorno R1. La
especificación debe clasificarlo (D-RB-02, opción C): o se desactiva
el backup/saved-state para el dominio, o se declara como ejecutor
con sus consecuencias, o se acepta el riesgo con BLOCKED permanente.
No clasificarlo es dejar el ejecutor más probable fuera de la
especificación. [PROPUESTA de clasificación; la decisión es del
propietario.]

## 5. Respuesta P05-C por alcance (matriz de decisión rápida)

| Alcance | ¿Detectable? | ¿Resucita autorizaciones? | Clasificación P05-C | Postura operativa |
|---|---|---|---|---|
| RB-1 | Sí, con comprobación cruzada | No (AUTH intacto) | **UNKNOWN** (incertidumbre RES↔COORD↔AUTH) | **BLOCKED** hasta reconciliación verificada; cuarentena F9; sin readmisión normal |
| RB-2 | Parcial (COORD↔AUTH) | No en AUTH; contradicción COORD↔AUTH | **UNKNOWN** | **BLOCKED** hasta reconciliación verificada; cuarentena F9; sin readmisión normal |
| RB-3 | No, desde dentro | **Sí** | **UNKNOWN** (total; el sistema no sabe que retrocedió) | **BLOCKED**; inaplicable sin declaración/ancla; prohibir o condicionar (D-RB-01) |
| RB-4 | No, ni testigo local | **Sí**, sin testigo | **UNKNOWN** (total) | **BLOCKED** por política; inaplicable sin testigo externo; prohibir o condicionar (D-RB-01) |
| Cualquier alcance, rollback parcial detectado | Sí (inconsistencia) | Según el parcial | **UNKNOWN** | **BLOCKED**; nunca continuar en silencio sobre un estado mezclado |
| Cualquier alcance, rollback no declarado y no detectado | No | Según el alcance | **UNKNOWN** (no clasificado: el sistema cree estar en estado válido) | Incumplimiento silencioso de P05-C; es el riesgo que las decisiones deben eliminar |

Sobre "readmisión aprobada": P05-C admite en principio una
readmisión por procedimiento aprobado con predicados demostrados
(E8), pero ese procedimiento **no existe** (F14). Por tanto, en
esta especificación "readmisión aprobada" no es una opción
disponible hoy en ningún alcance: es una casilla futura que solo se
abre cuando el propietario apruebe el procedimiento. Ninguna fila de
la tabla anterior la ofrece como respuesta actual. [RATIFICADO.]

Sobre UNKNOWN vs BLOCKED: UNKNOWN es la clasificación del estado
(no se sabe si el release/la admisión son válidos); BLOCKED es la
postura operativa (no se admite operación normal). P05-C exige
ambas ante incertidumbre (F2). No son alternativas entre las que
elegir: son dos caras de la misma respuesta. La tabla las distingue
solo para precisar qué se clasifica y qué se hace.

## 6. Efecto sobre el veredicto de la falsación (resumen, sin re-auditar)

| Contraejemplo | RB-1 | RB-2 | RB-3 | RB-4 |
|---|---|---|---|---|
| CE-5 (replay de release tras restore) | No se produce: AUTH no se revierte; el nonce consumido sigue consumido | No se produce en AUTH; pero la contradicción COORD↔AUTH puede admitir una operación excluida | **Se produce**: el nonce resucita; es el caso exacto de CE-5 | **Se produce**, sin testigo |
| CE-1 (proceso antiguo con descriptor) | No se resuelve: el `fd` sobrevive al rollback; el split-brain `fd`/path se agrava | Se agrava: los locks revertidos crean falsos negativos (admitir con poseedor vivo) | Se agrava al máximo: el poseedor ya no es identificable por AUTH | Igual que RB-3, con procesos del presente sobre disco del pasado |
| CE-7 (identidad descriptiva) | Se agrava en forma leve: autorización vigente sobre objeto retrocedido | Se agrava: COORD de T0 sobre RES de T0 es coherente, pero AUTH del presente los contradice | El estado restaurado es indistinguible del estado original de T0: identidad indemostrable | Igual que RB-3, sin testigo local |
| CE-8 (decisión del mediador) | El diario del rollback, si existe, es vulnerable al mismo problema | Igual | Igual | Igual |
| CE-10 (snapshots sesgados) | Un rollback parcial **es** un snapshot sesgado | Un rollback RB-2 interrumpido **es** RB-1: el sesgo es la forma del parcial | Un rollback RB-3 interrumpido es RB-2/RB-1 | Un rollback integral parcial es un dominio mezclado indetectable |

Consecuencia: **definir el rollback no refuta la falsación ni la
confirma de nuevo: la precisa.** RB-1 y RB-2 mantienen CE-5
contenido (a costa de inconsistencias detectables que exigen
BLOCKED); RB-3 y RB-4 son CE-5 en su forma pura. Ningún alcance
resuelve CE-1 ni CE-7: el rollback no revoca descriptores ni crea
identidad. Si el propietario decide prohibir RB-3/RB-4, CE-5 queda
contenido por **prohibición**, no por mecanismo: es una contención
por política, y debe registrarse como tal (depende de que la
prohibición se cumpla, incluido el SO como ejecutor).

## 7. Tabla de decisiones concretas

Cada decisión lleva: opciones, consecuencias y recomendación
razonada. **Las recomendaciones son [PROPUESTA]: no deciden nada.**
El propietario decide cada una; puede decidirlas en distinto orden
y con distintas combinaciones, pero las dependencias entre ellas se
señalan para que ninguna decisión se tome sin ver su coste.

| ID | Decisión | Opciones | Consecuencias | Recomendación razonada [PROPUESTA] |
|---|---|---|---|---|
| D-RB-01 | ¿Forma el rollback parte del alcance aceptado de R1? | **A.** No: rollback fuera de R1; cualquier rollback → STOP/UNKNOWN (moratoria hasta D-RB-04). **B.** Sí, solo RB-1. **C.** Sí, RB-1 y RB-2. **D.** Sí, todos los alcances, con ancla externa. | **A:** máxima seguridad; coste: sin vía de recuperación ante corrupción de RES; la moratoria debe hacerse cumplir también frente al SO (D-RB-02). **B:** permite recuperar RES corrupto; exige comprobación cruzada y cuarentena; CE-5 contenido. **C:** añade el riesgo de contradicción COORD↔AUTH; exige atomicidad entre conjuntos. **D:** exige ancla externa inexistente hoy; sin ella, RB-3/RB-4 incumplen P05-C en silencio. | **A como postura inmediata, con B como vía futura.** Razón: hoy no existe detección (F6–F8, F14) ni ancla; admitir RB-3/RB-4 sería admitir un incumplimiento silencioso de P05-C. La moratoria no es una prohibición permanente: es la postura conforme mientras D-RB-04 no se resuelva. Si el propietario necesita una vía de recuperación antes, B es la única con detección interna posible. Depende de D-RB-02, D-RB-04, D-RB-06. |
| D-RB-02 | ¿Quién ejecuta el rollback y con qué autoridad? | **A.** Solo el propietario, manualmente, con declaración explícita por canal fuera del ámbito. **B.** Propietario + herramienta designada por él. **C.** Cualquier actor con acceso al HOME, incluido el SO (backup/saved-state). **D.** Nadie: ningún ejecutor autorizado (equivale a prohibir el rollback). | **A:** trazabilidad máxima; coste operativo alto; no cubre el SO. **B:** operativo; la herramienta hereda autoridad de rollback: debe auditarse como ejecutor de autoridad raíz. **C:** realista (F11) pero delega autoridad raíz al SO sin decisión; rollback no declarado posible. **D:** coherente con D-RB-01 A; exige desactivar backup/saved-state del dominio. | **A, con C clasificado explícitamente.** Razón: revertir AUTH es ejercer autoridad raíz (RB-3); no puede delegarse por defecto. El SO como ejecutor debe desactivarse para el dominio o declararse como ejecutor con BLOCKED posterior; dejarlo sin clasificar es dejar el ejecutor más probable fuera de la especificación (§4.4). Depende de D-RB-01. |
| D-RB-03 | ¿Se exige atomicidad del rollback? | **A.** Sí: todo o nada por alcance, como requisito de cualquier rollback permitido. **B.** Se permite parcial, con detección obligatoria y BLOCKED posterior. **C.** No se exige nada. | **A:** el parcial es detectable como inconsistencia; coste: exige mecanismo (diario) con su propia circularidad (§4.1). **B:** realista ante crash durante rollback; convierte todo parcial en BLOCKED, sin liveness. **C:** el parcial es indistinguible de un estado válido: incumplimiento silencioso. | **A como requisito, con B como modo de fallo.** Razón: un rollback parcial es un snapshot sesgado (CE-10); permitirlo sin más es permitir un estado que nunca existió. La atomicidad debe exigirse aunque su verificación requiera testigo externo (D-RB-04): exigirla sin verificarla es insuficiente, pero no exigirla es peor. |
| D-RB-04 | ¿Cómo se detecta un rollback? | **A.** Ancla externa monótona (contador/log fuera del dominio; hardware/TEE). **B.** Verificación cruzada interna (generación/revisión entre RES, COORD, AUTH) + manifiesto+hashes. **C.** Declaración obligatoria del ejecutor por canal fuera del ámbito. **D.** Ninguna (se acepta la indetectabilidad). | **A:** única que detecta RB-3/RB-4; es un mecanismo nuevo, exige decisión y no existe hoy. **B:** detecta RB-1 y parcialmente RB-2; no detecta RB-3/RB-4; debe diseñarse. **C:** detecta todos los alcances si el ejecutor declara; no detecta el rollback no declarado (SO). **D:** incompatible con P05-C para RB-3/RB-4 (incumplimiento silencioso). | **C como mínimo obligatorio inmediato; B como requisito para RB-1/RB-2; A como condición previa para permitir RB-3/RB-4.** Razón: cada mecanismo cubre un subconjunto distinto (§4.2); ninguno cubre todo solo. La combinación C+B hace viables RB-1/RB-2; solo A hace viables RB-3/RB-4. D es inaceptable bajo P05-C. Depende de D-RB-01, D-RB-09. |
| D-RB-05 | ¿Qué respuesta P05-C se aplica por alcance? | **A.** La matriz del §5: RB-1/RB-2 UNKNOWN/BLOCKED hasta reconciliación; RB-3/RB-4 BLOCKED (inaplicable sin ancla/declaración); parcial detectado → BLOCKED. **B.** BLOCKED uniforme para cualquier rollback conocido, sin distinción de alcance. **C.** UNKNOWN sin BLOCKED (clasificar pero permitir operación). | **A:** proporcional; exige la maquinaria de detección de D-RB-04. **B:** más simple y más seguro; coste: bloquea incluso RB-1 reconciliable. **C:** contradice F2 (P05-C exige BLOCKED ante incertidumbre); no conforme. | **A.** Razón: es la aplicación directa de P05-C [RATIFICADO] a cada alcance; B es aceptable como postura más conservadora si el propietario prefiere simplicidad sobre disponibilidad, pero A ya es conservadora (BLOCKED en todos los casos; solo varía qué reconciliación lo levanta, y hoy ninguna existe, F14). C debe rechazarse. |
| D-RB-06 | ¿Qué se exige de sesiones, descriptores y operaciones en curso antes de un rollback? | **A.** Quiescencia como precondición: ninguna operación en curso, ningún descriptor abierto sobre el ámbito; verificada antes de ejecutar. **B.** Rollback con sesiones vivas permitido; todo lo en curso se clasifica UNKNOWN (E2) y se bloquea después. **C.** Prohibir el rollback si hay sesiones vivas (el ejecutor debe terminarlas; si no puede, no hay rollback). | **A:** elimina el split-brain `fd`/path; verificar quiescencia es el problema CE-1/Q no resuelto: la precondición puede ser inverificable. **B:** no exige lo inverificable, pero deja efectos sin atribuir y poseedores con capacidad tras el rollback. **C:** operativo y simple; terminar sesiones puede ser imposible sin matar procesos (y matarlos es una decisión). | **C como regla, con A como su justificación.** Razón: B deja poseedores con capacidad que el estado restaurado no conoce (CE-1 agravado, §4.3); A es lo correcto pero su verificación es el problema abierto de quiescencia. C es la forma ejecutable de A: si no se puede demostrar quiescencia, no hay rollback. La dificultad de verificar A debe registrarse, no ocultarse. Depende de D-RB-01, D-RB-02. |
| D-RB-07 | ¿Se permite revertir AUTH (alcances RB-3/RB-4)? | **A.** No: se prohíben los alcances que revierten AUTH mientras no exista ancla externa (D-RB-04 A). **B.** Sí, con re-emisión de credenciales frescas e invalidación de las antiguas tras el rollback. **C.** Sí, sin más. | **A:** contiene CE-5 por prohibición; coste: sin recuperación de AUTH corrupta. **B:** es la forma futura correcta, pero exige procedimiento aprobado inexistente (F14) y un medio de invalidar credenciales que el rollback acaba de resucitar (circular). **C:** resurrección de autorizaciones sin control: contradice P05-C. | **A.** Razón: B es circular (invalidar con un registro que el rollback puede revertir) y hoy no tiene procedimiento; C contradice F2. A es la única postura conforme mientras no exista ancla externa. Si el propietario necesita recuperar AUTH, debe hacerlo por un procedimiento aprobado nuevo, no por rollback. |
| D-RB-08 | ¿Se aplica cuarentena y verificación antes de activar datos restaurados? | **A.** Sí: cuarentena obligatoria + verificación antes de activar (C09). **B.** Activación directa. **C.** Activación con verificación posterior. | **A:** conforme con C09 [EVIDENCIA]; coste: los datos restaurados no son utilizables hasta verificar. **B:** rápido; activa datos no verificados: contradice C09. **C:** admite operar sobre datos no verificados durante la ventana: el daño puede ocurrir antes de la verificación. | **A.** Razón: C09 ya lo exige como corrección sobreviviente del dictamen; no es una opción nueva sino una exigencia existente que esta especificación aplica al rollback. B y C contradicen C09. La verificación debe definirse (qué se verifica: integridad, coherencia RES↔COORD↔AUTH, vigencia) como trabajo documental posterior; la cuarentena no depende de esa definición para exigirse. |
| D-RB-09 | ¿Se registra el rollback fuera del ámbito revertido? | **A.** Sí: registro externo obligatorio (fuera de DOM o en canal externo) con ámbito, snapshot, ejecutor, instante y resultado. **B.** Registro local (dentro de DOM). **C.** Sin registro. | **A:** crea el testigo que RB-3/RB-4 necesitan para ser detectables; es la forma documental del ancla (D-RB-04 C). **B:** inútil para RB-3/RB-4 (el registro se revierte); útil solo para RB-1/RB-2. **C:** ningún testigo: RB-3/RB-4 indetectables por construcción. | **A, como precondición de cualquier rollback permitido.** Razón: sin registro externo no hay declaración verificable (D-RB-04 C) ni detección de RB-3/RB-4; el registro es barato comparado con el ancla hardware (D-RB-04 A) y es su sustituto documental mínimo. Debe especificarse qué canal externo (el propietario decide el canal; este documento no lo inventa). Depende de D-RB-02, D-RB-04. |

### 7.1 Lectura conjunta de la tabla

Las nueve decisiones no son independientes. El grafo mínimo de
dependencias es:

- D-RB-01 (alcance de R1) depende de D-RB-04 (detección) y D-RB-02
  (ejecutor): no se puede decidir el alcance sin saber si el
  rollback es detectable y quién lo ejecuta.
- D-RB-03 (atomicidad) y D-RB-09 (registro externo) son
  precondiciones de D-RB-04 (detección), no adornos.
- D-RB-05 (respuesta P05-C) es aplicación de F2, no una decisión
  libre: la única libertad real es entre A y B, y C está excluida
  por contradicción con lo ratificado.
- D-RB-07 (prohibir revertir AUTH) es la contención de CE-5 por
  prohibición; si el propietario la rechaza, debe aceptar D-RB-04 A
  (ancla externa) como sustituto, no la ausencia de contención.
- D-RB-08 (cuarentena) no es opcional en sentido estricto: C09 ya
  la exige. La decisión real es qué verificación concreta se
  aplica, no si se aplica cuarentena.

Si el propietario decide solo D-RB-01 A (moratoria) y deja el resto
pendiente, la postura es completa y conforme: moratoria + ninguna
otra decisión urgente, salvo clasificar al SO como ejecutor
(D-RB-02 C) y desactivar o declarar su backup. Esa es la vía mínima
recomendada si no se quiere decidir el resto ahora.

## 8. Recomendación del siguiente paso documental [PROPUESTA]

1. **Decidir D-RB-01 y D-RB-02 primero.** Sin saber si el rollback
   pertenece a R1 y quién puede ejecutarlo (incluido el SO), el
   resto de la especificación no puede aplicarse. La recomendación
   es moratoria (D-RB-01 A) con clasificación explícita del SO
   (D-RB-02).
2. **Si se admite algún rollback (D-RB-01 B/C), decidir D-RB-04 y
   D-RB-09 antes de ejecutarlo:** declaración obligatoria del
   ejecutor, registro externo y comprobación cruzada entre conjuntos
   como requisitos previos, no posteriores.
3. **No autorizar implementación, harness ni pruebas** de rollback
   hasta que D-RB-01–D-RB-04 estén decididas: sin alcance, ejecutor
   y detección definidos, cualquier prueba mediría un mecanismo sin
   especificación.
4. **Registrar esta especificación junto a la falsación** como el
   par que cierra P-RESTORE como ambigüedad: la falsación demostró
   que sin definición de restore CE-5 no es cerrable; esta
   especificación da la definición (cuatro alcances) y las
   decisiones que la hacen operativa. P-RESTORE deja de ser
   "semántica UNKNOWN" y pasa a ser "semántica definida, decisión
   pendiente".
5. **Mantener los estados:** P05-C [RATIFICADO] como política; P05
   OPEN; P07-C UNKNOWN/BLOCKING; P09 OPEN/UNKNOWN; E2/E3 PARTIAL/
   NOT CLOSED; M0 INCOMPLETO; `authorization: NOT_EVALUATED`; raíz
   constitucional PENDING/UNKNOWN; commissioning y efectos
   protegidos STOP. Esta especificación no cambia ningún estado:
   define lo que habría que decidir para cambiarlos.

---

## Anexo A. Trazabilidad y verificación de esta entrega

- Método: especificación documental a partir de la falsación
  entregada (SHA-256 verificado `8f1bb646…`) y de las decisiones
  ratificadas; cuatro alcances comparados en siete dimensiones;
  separación [RATIFICADO]/[EVIDENCIA]/[SUPUESTO]/[PROPUESTA]/
  [DECISIÓN DEL PROPIETARIO] en cada afirmación material.
- Verificación de fuentes en rama `ncs-continuity-handoff-
  correction-2026-11-07`, HEAD `eee2ae77` (re-clonada y verificada
  2026-11-10 tras la limpieza de `/tmp`): búsqueda de
  rollback/backup/restauración en `NEXO_NCS/BUILD` confirma que el
  expediente habla de *resistencia* a rollback, no de una operación
  definida (F13); contrato del owner leído completo (C4, C6).
- No se repite la auditoría general CE-1/CE-5/CE-7: los resultados
  se citan por sección de la falsación (§6).
- No se decide por el propietario si el rollback forma parte de R1
  (D-RB-01 presentada con opciones y consecuencias; la recomendación
  es [PROPUESTA]).
- No se modifican repositorio, código, pruebas, CI, Termux ni
  dispositivo. No se declara M0 cerrado.
- GitHub: NOT_CONNECTED (verificado 2026-11-10). Entrega local para
  revisión del propietario.

## Anexo B. Glosario mínimo

- **RB-1..RB-4:** alcances de rollback (§1.4).
- **RES/COORD/AUTH/DOM:** conjuntos de datos (§1.3).
- **Currentness:** vigencia; validez ≠ vigencia (F8).
- **Cuarentena:** datos restaurados conservados sin activar hasta
  verificar (F9, C09).
- **Ancla externa:** registro o contador fuera del ámbito revertido
  que permite detectar un rollback (D-RB-04 A).
- **Snapshot sesgado:** combinación de conjuntos de instantes
  distintos que nunca existió como estado (CE-10).
- **Split-brain `fd`/path:** poseedores de descriptor y lectores
  por path que observan objetos distintos tras el rollback (§4.3).

*Fin del documento.*
