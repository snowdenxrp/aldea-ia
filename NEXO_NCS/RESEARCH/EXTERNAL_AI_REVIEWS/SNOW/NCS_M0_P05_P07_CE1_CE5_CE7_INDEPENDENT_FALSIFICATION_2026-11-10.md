# NCS M0 — Falsación arquitectónica conjunta CE-1 / CE-5 / CE-7

## P05-C y P07-C bajo el modelo R1 aceptado

Fecha: 2026-11-10
Tipo: **ANÁLISIS DOCUMENTAL Y ARQUITECTÓNICO INDEPENDIENTE — FALSACIÓN**
Estado: **UNKNOWN / BLOCKING — NO DEMUESTRA SUFICIENCIA**
Repositorio: `snowdenxrp/aldea-ia`
Rama documental de referencia: `ncs-continuity-handoff-correction-2026-11-07`
HEAD verificado de la rama: `eee2ae772e5569ffbc90d6334f47c6633f4961fb`
(`git ls-remote` y clon público de solo lectura coinciden; clon sin modificar.)

Estado: **NO MODIFICA EL REPOSITORIO — NO IMPLEMENTA — NO EJECUTA PRUEBAS,
CI NI COMANDOS EN POCO/TERMUX — NO CAMBIA DECISIONES RATIFICADAS —
NO DECLARA M0 CERRADO — NO AUTORIZA IMPLEMENTACIÓN NI EFECTOS PROTEGIDOS.**

## 0. Fuentes canónicas consultadas (no resúmenes)

Las tres fuentes obligatorias se leyeron completas en la rama indicada,
HEAD `eee2ae77`. Hashes SHA-256 calculados sobre los archivos clonados:

| Documento | Ruta en la rama | SHA-256 (archivo) | Blob Git |
|---|---|---|---|
| Obligaciones P05/P07 (2026-11-07) | `NEXO_NCS/BUILD/NCS_M0_D2_P05_P07_CRASH_PERSISTENCE_AND_ADMISSION_PROOF_OBLIGATIONS_2026-11-07.md` | `83d70ffd470f4e35504845eaa23cf2064dc0e217b9c4145da6b0cb9f64aa6c4b` | `7af04a84` |
| P07 V2.3 delta normativo (2026-11-03) | `NEXO_NCS/BUILD/NCS_M0_D2_P07_V2_3_NORMATIVE_DELTA_2026-11-03.md` | `65de8801d0e405ee0adb055b45cfacdd83d060549c97f93f44f3a5110f728f38` | `7a6fcd2e` |
| Reconciliación P09 (2026-11-07) | `NEXO_NCS/BUILD/NCS_M0_P09_CALLER_COVERAGE_RECONCILIATION_2026-11-07.md` | `fd44f33776e1dccf91f098ab55a45cb820dcae575bdee7e304b7594548eef3bc` | `a9bcd78d` |

Fuentes de apoyo leídas completas en la misma rama (para anclar
definiciones, no para sustituir las tres anteriores):

| Documento | SHA-256 (archivo) | Uso en esta falsación |
|---|---|---|
| `NCS_M0_D2_P05_POLICY_C_TECHNICAL_DEFINITION_2026-11-03.md` | `8631af41918969b3116a6b3a5f973c3b19309fa4a2a7caa3607bd7a78a625b2f` | Semántica de P05-C, matriz de transición, E1–E9 |
| `NCS_M0_D2_P05_E1_E9_ACCEPTANCE_MATRIX_2026-11-03.md` | `310a0fafbcb047692c2e02878fcb8364d83e0a3bd8b1f946db0247d36b9d912f` | Criterios E1–E9, en especial E3/E4/E6/E7/E8 |
| `NCS_M0_D2_P07_V2_3_SCENARIO_ORACLE_DELTA_2026-11-03.md` | `f9cc5e431132b56af03c95406027c82d435fb9f6eaca7b90f78d33efab797203` | Oráculos P07-05/06/14/16/18/19/21, clases de actor B |
| `NCS_M0_D2_CURRENT_SOURCE_LOCK_RELEASE_AND_P05C_RECONCILIATION_2026-11-07.md` | `1df5153067e995c292444b81fbdb406e096bfbb366cf7306aa03aaa16f653c94` | Comportamiento estático vigente del lock/release (snapshot `d8b5ca87`) |
| `NCS_M0_D2_P07_FILESYSTEM_IDENTITY_ACCEPTANCE_CONTRACT_2026-11-03.md` | `1f74d462496f76db41e0e2fddd8167b9cd6811cf8e4504634b2081d6e37c5345` | Identidad de objeto, check/use, cleanup replacement-safe |
| `NCS_M0_55_SAFE_REVISION_FENCING_2026-10-17.md` | (leído en rama; blob no requerido aquí) | Límite explícito: el fence de revisión no prueba monotonicidad durable ante restore/rollback |

Notas de procedencia que afectan a la lectura:

1. **CE-1, CE-5 y CE-7 no existen en la rama consultada.** Una búsqueda
   por `CE-1|CE-5|CE-7|CE1|CE5|CE7` en `NEXO_NCS` no devuelve ningún
   resultado. Sus definiciones son las del encargo de esta misión y se
   toman como autoritativas para este análisis; no se les atribuye
   ningún significado previo del expediente.
2. **P07 V2.3 ratificada el 8-Nov-2026** es una decisión del propietario
   comunicada en el encargo; no se reabre. El delta canónico V2.3 es de
   2026-11-03 y su texto histórico dice `NO RATIFICADO`; esa frase es
   un snapshot anterior a la ratificación, no una contradicción con
   ella. La normativa V2.3 que se aplica aquí es la del delta más la
   ratificación posterior.
3. **No existe en la rama consultada una definición canónica de la
   operación de snapshot/restore que presupone CE-5.** Las menciones de
   `snapshot` en la rama se refieren a snapshots de estado/documento
   (aislamiento de snapshots, `structuredClone`, revisiones), no a una
   operación de restauración del filesystem. La semántica exacta de
   "restore de snapshot anterior" (qué se captura, con qué atomicidad,
   quién la ejecuta, si incluye el estado de coordinación) es
   **UNKNOWN** y se trata como premisa explícita **P-RESTORE** (§1.3),
   no como hecho establecido.
4. GitHub sigue **NOT_CONNECTED** (verificado 2026-11-10 con
   `/opt/hatch/bin/github status`: `auth_status: not_connected`).
   La consulta fue por clon público de solo lectura; nada se publicó
   ni se modificó en la rama.

## 1. Veredicto ejecutivo

**No se demuestra que exista una arquitectura abstracta capaz de
satisfacer simultáneamente P05-C y P07-C bajo el modelo R1 aceptado.**

Se construyó la arquitectura candidata más fuerte compatible con las
restricciones (§2, ACM-1: mediador obligatorio en el punto de mutación,
generación durable, identidad no reutilizable, quiescencia verificable,
BLOCKED durable y universo cerrado) y se intentó refutarla contra
CE-1, CE-5 y CE-7. El resultado:

- **CE-1 REFUTA la suficiencia** de ACM-1 en su subcaso central
  (descriptor abierto): un proceso antiguo pausado puede reanudar y
  mutar por un descriptor ya abierto sin pasar por ningún punto de
  aceptación. La refutación es **condicionada** (INFEASIBLE bajo las
  premisas de §1.3), no una imposibilidad lógica universal.
- **CE-5 REFUTA la suficiencia** de ACM-1 bajo restore: una autorización
  de `release` de un solo uso puede reactivarse restaurando un snapshot
  anterior al registro de consumo. Sin un ancla monótona fuera del
  snapshot restaurable, el un solo uso es **INFEASIBLE (condicionado)**.
- **CE-7 REFUTA la suficiencia** de ACM-1 tras terminación del proceso
  y tras restore: ningún criterio puramente descriptivo distingue a la
  vez todos los sustitutos (sin falsos positivos) y todos los objetos
  legítimos que cambiaron legítimamente (sin falsos negativos). La
  identidad post-crash es **INFEASIBLE (condicionada)** con criterios
  descriptivos; el criterio mismo de identidad está sin decidir
  (P07-A pendiente del propietario).
- **La composición también queda refutada** como demostrada: cada
  propiedad que salvaría a otra depende circularmente de una tercera
  que a su vez depende de la primera (§6). Además se encontraron
  cuatro contraejemplos nuevos (CE-8 a CE-11, §6) que atacan la
  composición incluso si CE-1, CE-5 y CE-7 se resolvieran por separado.

**Lo que NO se demuestra:** imposibilidad lógica universal. Un sistema
con un mediador obligatorio a nivel de kernel que revoque descriptores,
un ancla monótona externa al snapshot restaurable y un universo de
actores probadamente cerrado podría, en principio, satisfacer los
claims. Pero ese sistema **no es R1**, no está evidenciado en el
target, y cada uno de sus componentes es hoy una premisa sin evidencia
(ASSUMED) o un desconocido (UNKNOWN), no un mecanismo seleccionado.
Afirmar suficiencia a partir de él sería exactamente la garantía
circular que el criterio de éxito prohíbe.

**Estados que no cambian:** P05-C sigue **RATIFICADA COMO POLÍTICA**;
P05 sigue **OPEN**; P07-C sigue **UNKNOWN / BLOCKING**; P09 sigue
**OPEN / UNKNOWN**; E2/E3 siguen **PARTIAL / NOT CLOSED**; M0 sigue
**INCOMPLETO**; `authorization: NOT_EVALUATED`; commissioning y
efectos protegidos **STOP**. Ningún PASS, ningún LISTO.

### 1.1 Premisas explícitas del análisis

| ID | Premisa | Origen | Estado |
|---|---|---|---|
| P-R1 | Modelo R1 aceptado por el propietario el 2026-11-02: Android sandbox + HOME privado Termux, invocación manual foreground única, propietario único lanzador manual durante la ventana; excluye root/OS comprometido y procesos maliciosos con el mismo UID. E2/E3 PARTIAL/NOT CLOSED. | Deltas 2026-11-07 en P07 V2.3 y P05-C; perfil R1 (POCO X7 Pro / Android 16, Termux UID 10378, HOME `/data/data/com.termux/files/home`, `0700`) | Ratificada; aceptación del límite, no evidencia de control |
| P-P05C | P05-C ratificada como política (2026-11-07): incertidumbre de release/cleanup → UNKNOWN/BLOCKED, sin recuperación automática; sin desbloqueo manual del lock por defecto; D2 solo observa. | Delta de ratificación en definición P05-C | Ratificada como política; no es mecanismo |
| P-P07V23 | P07 V2.3 ratificada el 8-Nov-2026 (encargo). Normativa aplicable: detección ≠ prevención; R-OBJ ≠ R-NAME; clases de actor B; taxonomía `harness_verdict` / `result_class` / `product_state`. | Encargo; delta V2.3 | Ratificada; no se reabre |
| P-P09 | P09 OPEN/UNKNOWN: cobertura estática parcial de imports literales; UNKNOWN loaders no literales, consumidores externos y cobertura universal; admisión pre-read no implementada en rutas path-based. | Reconciliación P09 2026-11-07 | Vigente |
| P-RESTORE | Existe una operación de "restore de snapshot anterior" capaz de revertir el estado observable (incluido, en el peor caso, el estado de coordinación) a un punto anterior. Su alcance, atomicidad y ejecutor NO están definidos en el expediente. | Encargo (CE-5 la presupone); búsqueda en rama sin definición canónica | **ASSUMED — semántica UNKNOWN** |
| P-PAUSE | Un proceso admitido puede quedar pausado (p. ej. SIGSTOP; P07-14: SIGSTOP no es exit) y reanudarse después, conservando sus descriptores y su capacidad. | Encargo (CE-1); oráculo P07-14 | Premisa del contraejemplo |
| P-FD | Un descriptor abierto refiere a la descripción de archivo abierto (objeto) con independencia del nombre/path posterior; la escritura por descriptor no vuelve a resolver el path. | Semántica POSIX/Linux estándar; P07 V2.3 §3 (un fd/dirfd puede conservar referencia al objeto aun cuando su nombre cambie) | Premisa arquitectónica estándar; **no verificada en el target POCO/Termux** (ver §7.2) |
| P-NOMECH | No se inventa ningún marcador persistente, lock hermano, tombstone, epoch, daemon o journal como mecanismo seleccionado. Los componentes de ACM-1 (§2) se evalúan como **arquitectura abstracta candidata**, no como mecanismo aprobado. | Obligaciones §6; encargo §4 | Restricción vigente |

### 1.2 Regla de clasificación usada

Cada garantía se clasifica individualmente con el vocabulario
obligatorio del encargo. **EVIDENCED** se reserva a afirmaciones
verificadas en una fuente primaria abierta y nombrable en este
análisis (documento canónico o blob de código citados con hash).
Ninguna propiedad de un diseño hipotético se etiqueta EVIDENCED.

- **EVIDENCED**: evidencia verificable del target (documento canónico
  o blob citados; se indica el alcance exacto, p. ej. "estático,
  snapshot `d8b5ca87`").
- **ASSUMED**: premisa necesaria sin evidencia en el target.
- **UNKNOWN**: no se puede determinar con la evidencia disponible.
- **INFEASIBLE**: contradicción demostrada bajo premisas explícitas.
  Siempre se indica si es **condicionada** (bajo P-R1 + P-RESTORE +
  P-FD, etc.) o **universal** (lógica, independiente del modelo).
  Ningún INFEASIBLE de este informe es universal; todos son
  condicionados, y se dice explícitamente.
- **NOT_APPLICABLE**: fuera del alcance declarado, con justificación.

Distinciones que se mantienen en todo el informe (encargo §3–§4):

- Detección ≠ retención ≠ serialización ≠ prevención (V2.3 §2).
  `DETECTION_ONLY` y `RETENTION_VERIFIED` no son `PASS_GATE`.
- Autorización ≠ prueba de quiescencia. Un token válido prueba que
  alguien fue autorizado en un instante; no prueba que nadie más
  pueda actuar ahora.
- Lock cooperativo ≠ fencing. Un lock que los participantes cubiertos
  respetan no impide actuar a quien no lo respeta o a quien ya tiene
  el descriptor.
- Identidad descriptiva ≠ identidad estable. Coincidir en nombre,
  contenido, metadatos o token no demuestra ser el mismo objeto.
- Ausencia de registro, PID, edad o timeout ≠ terminación ni
  quiescencia.
- Política (P05-C) ≠ mecanismo (enforcement durable/interproceso).
  La ratificación de la política no crea el mecanismo.

## 2. Arquitectura abstracta evaluada

### 2.1 La candidata más fuerte: ACM-1

Para que la falsación tenga fuerza, no se evalúa el código vigente
(ya refutado como insuficiente por la reconciliación de 2026-11-07:
O4 y O5 no satisfechas, O1–O3/O6–O8 UNKNOWN, O9 PARTIAL) ni una
arquitectura débil. Se evalúa **ACM-1**, la composición más fuerte
que puede formularse dentro de las restricciones, con seis
componentes. Si ACM-1 cae, ninguna variante más débil sobrevive; si
un componente de ACM-1 exige una premisa sin evidencia, esa premisa
queda registrada como ASSUMED/UNKNOWN, no como demostrada.

**ACM-1 — Mediador obligatorio con generación, identidad no
reutilizable y BLOCKED durable:**

- **M — Mediador obligatorio en el punto de mutación.** Toda mutación
  sobre el recurso pasa por M. M verifica, en el instante de
  aceptación (no en el instante de autorización), tres cosas:
  generación vigente, identidad del objeto y credencial de un solo
  uso no consumida. M es el único escritor efectivo.
- **G — Generación/epoch durable y monótona.** Cada admisión y cada
  release incrementan la generación. Toda autorización lleva
  (generación, identidad-objeto, nonce). Una autorización de una
  generación anterior es inválida en cualquier generación posterior.
- **I — Identidad no reutilizable del objeto.** En la adquisición se
  genera un identificador único ligado al objeto adquirido, nunca
  reutilizado para otro objeto. El registro durable vincula
  identificador ↔ objeto.
- **Q — Quiescencia verificable.** M no admite una nueva generación
  hasta verificar que ningún poseedor de capacidad de la generación
  anterior puede actuar: M mantiene el registro de poseedores y
  dispone de un medio de revocación de sus capacidades.
- **B — BLOCKED durable.** Toda incertidumbre de release/cleanup deja
  un registro durable que M consulta antes de admitir. El registro
  sobrevive a crash, terminación del proceso dueño y desaparición o
  sustitución del path.
- **U — Universo cerrado de actores.** Todos los writers y callers
  del universo declarado pasan por M; no existe ruta de escritura
  fuera de M. (Equivale a P09 cerrado para ese universo.)

ACM-1 es deliberadamente generosa: concede a la arquitectura todo lo
que el expediente prohíbe inventar como mecanismo (ancla durable,
mediador, epoch) **a título de hipótesis**, para comprobar si incluso
así sobrevive a los contraejemplos. La concesión es metodológica:
nada de ACM-1 está seleccionado, ratificado ni evidenciado.

### 2.2 Modelo de autoridad y enforcement (requerido, §5.A)

| # | Componente | Qué decide | Quién tiene capacidad real de impedir una mutación | Cómo se impide (en ACM-1) | Clasificación |
|---|---|---|---|---|---|
| 1 | **Autoridad para admitir una operación** | Si una invocación puede operar sobre el recurso en una generación dada. | M, solo si M es obligatorio (U) y verifica en aceptación (no en autorización). | M rechaza en el instante de aceptación toda solicitud cuya (generación, nonce) no sea vigente y no consumida. | **ASSUMED** (M no existe; U depende de P09, OPEN) |
| 2 | **Identidad del objeto y namespace** | Sobre qué objeto y bajo qué nombre/namespace actúa la operación. | Nadie, tras terminación del proceso o restore, con criterios descriptivos (§5). Durante la vida del proceso, el descriptor retenido (R-OBJ). | Registro I + verificación R-OBJ/R-NAME por separado (V2.3 §3). | **INFEASIBLE (condicionado)** tras terminación/restore; **ASSUMED** en vida del proceso |
| 3 | **Coordinación entre participantes** | Orden (serialización) de los participantes cubiertos. | M, solo entre participantes COVERED que efectivamente pasan por M. | M serializa solicitudes admitidas. | **ASSUMED** (COVERED no demostrable por UID/nombre; P09 OPEN); serialización ≠ prevención (V2.3 §2) |
| 4 | **Aceptación efectiva de una mutación** | El instante en que una mutación queda aceptada y su efecto es atribuible. | Solo el ejecutor real de la mutación. Si la mutación se ejecuta por descriptor abierto fuera de M, M no está en el punto de aceptación y no puede impedirla. | M ejecuta la mutación (o la autoriza atómicamente con su ejecución). Cualquier ejecución fuera de M es un bypass. | **INFEASIBLE (condicionado)** para mutaciones por descriptor abierto; **ASSUMED** para mutaciones vía M |
| 5 | **Neutralización de operaciones antiguas** | Que una operación autorizada en G1 no produzca efectos en G2. | Nadie, para capacidades ya entregadas (descriptor abierto, fd heredado, syscall en vuelo). M solo puede rechazar *nuevas solicitudes* que pasen por él. | Revocación de capacidades (Q). No existe medio evidenciado de revocación de descriptores en el target. | **INFEASIBLE (condicionado)** — núcleo de CE-1 |
| 6 | **Release y readmisión** | Si un release es efectivo y único, y si una readmisión es lícita. | M, solo si el registro de consumo sobrevive a crash y a restore (ancla fuera del snapshot). | Consumo atómico credencial+efecto; registro B durable; readmisión solo por procedimiento aprobado con predicados demostrados (E8). | **INFEASIBLE (condicionado a restore)**; **ASSUMED** sin restore |
| 7 | **Recuperación después de crash y restore** | Qué estado observa una nueva invocación y qué puede inferir de él. | Nadie puede inferir quiescencia del estado restaurado: el estado restaurado es indistinguible del estado de un pasado en que el actor antiguo aún podía actuar. | B debe sobrevivir al restore; eso exige que B no viva dentro del snapshot restaurable. | **INFEASIBLE (condicionado a P-RESTORE)** sin ancla externa; **UNKNOWN** en cuanto a la semántica de restore |

**Lectura del modelo.** La capacidad real de impedir una mutación
reside únicamente en el ejecutor de la mutación o en un mecanismo
que controle ese ejecutor (kernel, filesystem, mediador que sea el
único escritor). Una verificación en un componente distinto del
ejecutor solo impide mutaciones de quienes voluntariamente le
preguntan. Por eso la fila 4 es la decisiva: ACM-1 desplaza el punto
de aceptación a M, pero CE-1 (§4) muestra un camino de mutación cuyo
punto de aceptación no es M. Y por eso la fila 5 es la segunda
decisiva: admitir no es revocar; entregar una capacidad y después
cambiar la generación no retira la capacidad entregada.

El código vigente ilustra el mismo patrón en pequeño (EVIDENCED,
estático, snapshot `d8b5ca87`, blobs `c1eb81bf` / `59d2fdeb` según la
reconciliación 2026-11-07): el release lee `owner.json`, compara el
token y después ejecuta `rm(lockPath, {recursive:true, force:true})`
por nombre, con un segundo intento por el mismo path; `lockReleaseFailures`
es un `Set` en memoria del proceso que se limpia ante ENOENT y permite
readmisión; el lock stale (>60 s y PID no vivo) se rechaza sin
auto-reap. Es decir: verificación por token seguida de borrado por
nombre (check/use no atómico), marca de fallo volátil, y ausencia de
estado durable independiente. La reconciliación lo clasifica:
O4 y O5 NO SATISFECHAS; O1–O3 y O6–O8 UNKNOWN; O9 PARTIAL.
ACM-1 se construye precisamente para no repetir esos defectos, y aun
así cae (§4–§6).

## 3. Modelo de amenazas y actores

### 3.1 Actores (clases V2.3 §4, aplicadas a los contraejemplos)

| Actor | Clase | Descripción | Qué puede hacer dentro de R1 |
|---|---|---|---|
| `P_old` | **COVERED** (fue admitido en G1) | Proceso antiguo: obtuvo acceso, quedó pausado, reanuda. | Actuar con sus capacidades ya entregadas (descriptor abierto, fd heredado). **No es malicioso**: es un participante legítimo con autorización obsoleta. La exclusión R1 de "procesos maliciosos con el mismo UID" **no lo excluye**. |
| `P_new` | **COVERED** | Nueva generación admitida (G2) que intenta avanzar. | Operar vía M con autorización vigente. |
| `M` | (mediador hipotético) | Único escritor de ACM-1. | Verificar y ejecutar o rechazar solicitudes que pasen por él. No controla escrituras que no pasen por él. |
| `B_raw` | **RAW** | Writer que ignora el protocolo (API path-based directa, import directo de stores, escritura directa por path). | Escribir sin pasar por M. P09 demuestra que estas rutas existen como superficie importable (APIs path-based, `application/index.mjs`, stores por path, `loadCurrent()` antes de admisión). |
| `B_priv` | **PRIVILEGED** | root / OS comprometido. | Todo. |
| `B_unk` | **UNCLASSIFIABLE** | Actor cuya clase no puede determinarse antes del subcaso. | Resultado UNKNOWN-STOP (V2.3 §4 regla 4). |
| `R` (restore) | No es un proceso: es una **operación sobre el estado** | Reversión a un snapshot anterior. | Revertir registros de consumo, generaciones y BLOCKED si viven dentro del snapshot. No es un actor que M pueda serializar: actúa sobre el pasado de M. |

### 3.2 El punto ciego de R1: el pasado propio

R1 excluye al adversario externo (root/OS comprometido, proceso
malicioso mismo UID) y delimita el entorno a la sesión manual
interactiva Termux. Lo que R1 **no** excluye —y lo que CE-1, CE-5 y
CE-7 explotan— es el **pasado propio del sistema**:

- Una autorización legítima que sobrevive a su generación (CE-1).
- Un registro de consumo legítimo que el restore borra (CE-5).
- Una identidad legítima que el restore o la sustitución falsifica
  (CE-7).

Ninguno de estos tres actores es hostil en el sentido de R1. Son el
sistema actuando contra su propio estado anterior con medios
totalmente ordinarios (reanudar, restaurar, renombrar). Por eso la
aceptación de R1 no dispone de ninguno de los tres contraejemplos, y
por eso "cerrar el universo de actores" no puede significar solo
"excluir a los maliciosos": debe incluir también a los participantes
legítimos del pasado, y eso exige revocación y anclas, no solo
exclusión.

### 3.3 Capacidades del adversario (modelo de falsación)

El análisis concede al contraejemplo solo capacidades ordinarias,
dentro de R1:

- Pausar/reanudar un proceso propio (SIGSTOP/SIGCONT; P07-14).
- Hacer fork antes de la pausa; heredar descriptores; pasar un
  descriptor por `SCM_RIGHTS` a otro proceso cooperativo.
- Sustituir un objeto por path (rename, unlink+create, bind mount,
  symlink) entre la comprobación y el uso.
- Crear hardlinks adicionales de un objeto (P07-21).
- Ejecutar restore de un snapshot anterior (P-RESTORE).
- Invocar APIs públicas path-based sin pasar por admisión (P09:
  superficie existente, EVIDENCED estáticamente).
- Reintentar una operación cuyo resultado se desconoce tras
  timeout/crash.

No se conceden: root, OS comprometido, procesos maliciosos mismo
UID (excluidos por R1), ni conocimiento del contenido de claves o
tokens no observables. Si la falsación necesita menos que esto, se
dice; si necesitara más, la refutación sería más débil y se
señalaría. No es el caso: CE-1/5/7 se sostienen con lo concedido.

## 4. Secuencias temporales CE-1, CE-5 y CE-7

Notación: `G1, G2` generaciones; `O` objeto recurso; `fd(O)` descriptor
abierto sobre `O`; `Auth(X, G, N)` autorización del actor X en
generación G con nonce N; `M.accept(...)` punto de aceptación del
mediador; `t0 < t1 < ...` orden temporal. "Rechaza" significa que la
mutación no produce efecto sobre el recurso; "detecta" significa que
se observa la divergencia y se detiene sin impedir el efecto por
otro camino (V2.3 §2).

### 4.1 CE-1 — Proceso antiguo pausado que reanuda con capacidad de mutar

**Definición (encargo).** Proceso antiguo pausado después de comprobar
su autorización; una nueva generación es admitida y el proceso antiguo
reanuda su ejecución con capacidad de modificar el recurso.

**Secuencia canónica S1 (descriptor abierto — subcaso decisivo):**

| Tiempo | Actor | Evento |
|---|---|---|
| t0 | `P_old` | Obtiene acceso: admisión en G1, `Auth(P_old, G1, N1)`. Abre `O` y retiene `fd(O)`. |
| t1 | `P_old` / M | M comprueba la autorización de `P_old` (válida en G1) y admite la operación. La comprobación es **anterior** a la pausa. |
| t2 | Sistema | `P_old` queda pausado (SIGSTOP). No termina: SIGSTOP no es exit (P07-14). Conserva `fd(O)`, su memoria y su capacidad. |
| t3 | M | Nueva generación intenta avanzar: M incrementa G1 → G2, admite a `P_new` con `Auth(P_new, G2, N2)`. M registra que G1 está revocada. |
| t4 | Sistema | `P_old` reanuda (SIGCONT). |
| t5 | `P_old` | Intenta una mutación sobre el recurso. |
| t6 | ? | **Punto de aceptación de la mutación.** ¿Quién decide, y dónde? |

**Análisis por camino de mutación en t5–t6:**

**(a) Mutación vía API de M.** `P_old` solicita la mutación a M con
`Auth(P_old, G1, N1)`. M verifica en aceptación: G1 ≠ G2 vigente →
rechaza. **Este subcaso lo supera ACM-1.** Es el único subcaso que
depende de comprobar en aceptación y no en autorización, y por eso el
encargo pregunta explícitamente por esa distinción. Pero es también
el subcaso más débil del contraejemplo: presupone que `P_old`
coopera volviendo a preguntar.

**(b) Mutación por descriptor abierto — REFUTA.** `P_old` ejecuta
`write(fd(O), ...)` directamente, sin solicitar nada a M. No hay
punto de aceptación en M: el punto de aceptación es la syscall
`write(2)` sobre una descripción de archivo abierto que el kernel
no ha revocado. El cambio de generación G1 → G2 es un hecho en el
registro de M; no es un hecho en el kernel ni en el descriptor.
**M no puede rechazar lo que nunca se le presenta.** La mutación
produce efecto. La generación no revoca descriptores: ningún
mecanismo evidenciado en el target revoca un `fd` por cambio de
generación, y un mediador en espacio de usuario no puede
interponerse en `write(2)` sobre un `fd` que no emitió.
Clasificación de "M impide la mutación por fd abierto":
**INFEASIBLE (condicionado a P-R1 + P-FD)**. La única vía que lo
impediría —mediador obligatorio a nivel de kernel/syscall que
revoque o filtre descriptores— es **PRIVILEGED** en términos de
V2.3 (mecanismo de SO), está fuera de R1 y no está evidenciada
(UNKNOWN como disponibilidad en el target; ASSUMED como diseño).

**(c) Descriptor heredado (fork antes de la pausa) — REFUTA.**
`P_old` hace `fork()` en t1.5; el hijo `P_child` hereda `fd(O)`.
La pausa y la revocación alcanzan a `P_old`; `P_child` no está en
el registro de poseedores de M (o lo está como "proceso", no como
"poseedor de capacidad"). `P_child` muta por su copia del
descriptor. La enumeración de poseedores (Q) es incompleta por
construcción: el grafo de herencia de descriptores no es observable
desde el registro de admisión. **INFEASIBLE (condicionado)** para Q
como verificación completa; Q queda **UNKNOWN** como mecanismo.

**(d) Mutación ya en vuelo — REFUTA.** `P_old` inició la syscall de
mutación antes de t2 (o la despachó a la capa de almacenamiento
antes de la pausa); su efecto se hace visible después de t3. La
comprobación en aceptación ocurrió antes del despacho; el efecto
aterriza después. Ninguna comprobación en espacio de usuario cubre
una syscall ya en vuelo. Es la misma estructura check/use que
P07-19 exige observar en el seam exacto, trasladada a la frontera
kernel. **INFEASIBLE (condicionado)** sin serialización a nivel de
syscall.

**(e) Descriptor pasado por `SCM_RIGHTS` — REFUTA (variante de (c)).**
`P_old` transfiere `fd(O)` a un ayudante cooperativo antes de la
pausa. El ayudante no fue admitido nunca; no figura en ningún
registro; muta. La capacidad circula por un canal que M no observa.
P09 (OPEN) impide afirmar que ese canal no existe.

**Veredicto CE-1.** ACM-1 rechaza la mutación antigua **solo** en el
subcaso (a), el cooperativo. Los subcasos (b)–(e) producen efecto.
Como P05-C/P07-C exigen impedir la mutación (no solo detectar que
ocurrió ni solo rechazar a quien pregunta), **CE-1 refuta la
suficiencia de ACM-1**. La distinción autorización/aceptación es
necesaria pero no suficiente: lo decisivo es **dónde está el punto
de aceptación real**, y para un descriptor abierto el punto de
aceptación real no es M.

Corolario: la quiescencia (Q) no puede verificarse enumerando
procesos, porque la capacidad no vive en los procesos: vive en los
descriptores, y los descriptores se heredan, se transfieren y
sobreviven a la pausa. Verificar Q exigiría un censo del grafo de
descriptores, que el sistema no expone de forma fiable a espacio de
usuario (inspección de `/proc/PID/fd` con carreras frente a
fork/exec; disponibilidad y semántica en Termux/Android,
UNKNOWN — §7.2).

### 4.2 CE-5 — Replay de una autorización antigua de `release` después de restore

**Definición (encargo).** Replay de una autorización antigua de
`release` después de restore.

**Secuencia canónica S5 (crash en cada punto relevante).**
Pasos ordenados de un release con credencial de un solo uso:

1. `M` emite `Rel(G2, N)` (credencial de release, un solo uso).
2. `M` registra duramente `N` como consumida (consume-record).
3. Se ejecuta el efecto de release (liberación / borrado / cambio de
   estado del recurso).
4. `M` acusa recibo del resultado al solicitante.
5. (R) Restore de un snapshot anterior a alguno de los pasos 2–4.

**Matriz de crash/restore por punto de corte:**

| Corte | Estado tras crash/restore | ¿Reintento seguro? | ¿Replay posible? |
|---|---|---|---|
| Crash entre (1) y (2) | `N` no consumida; efecto no ejecutado. | Sí: reintentar con `N` es seguro (efecto aún no ocurrió). | No es replay: es primer uso. |
| Crash entre (2) y (3) | `N` consumida (si el registro sobrevivió); efecto no ejecutado. | Ambiguo: el solicitante no sabe si el efecto ocurrió. Reintentar con `N` nueva ejecuta el efecto una vez (seguro si el efecto es idempotente y el objeto es el mismo — ver CE-7); no reintentar deja el recurso retenido (seguro pero sin liveness; P05-C prefiere BLOCKED a reintentar). | No, si el registro de consumo sobrevivió. |
| Crash entre (3) y (4) | Efecto ejecutado; acuse perdido. El solicitante cree que el release puede no haber ocurrido y reintenta. | **No distinguible** del corte anterior desde la posición del solicitante: "efecto ejecutado, acuse perdido" es indistinguible de "efecto no ejecutado". | **Sí, si el restore revierte (2):** el snapshot anterior a (2) resucita `N` como no consumida; la repetición de `Rel(G2, N)` se acepta como primer uso y el efecto se ejecuta por segunda vez. |
| Restore (R) a snapshot anterior a (2), en cualquier momento posterior | `N` vuelve a figurar como no consumida; el registro de consumo ha dejado de existir. | No: toda decisión basada en el registro restaurado es una decisión sobre un pasado que ya no es el presente. | **Sí: replay efectivo.** La credencial es indistinguible de una credencial nueva. |
| Liberación concurrente | Dos liberadores `R_a`, `R_b` presentan credenciales (iguales o distintas). Solo uno debe ganar. | La determinación del ganador debe ser atómica y durable. Un crash durante la determinación deja a ambos creyendo que ganaron tras restore a un snapshot previo a la decisión. | **Sí:** tras restore, ambos replays pueden aceptarse. |
| Respuesta ambigua / timeout | El solicitante agota el timeout esperando el acuse de (4); el resultado es desconocido. | P05-C ordena conservar UNKNOWN/BLOCKED y no reintentar ni readmitir. La **política** es correcta. Pero su **enforcement** tras restore exige que el registro BLOCKED sobreviva al restore (fila 7 de §2.2). Si BLOCKED vive dentro del snapshot, el restore lo borra y la nueva invocación no ve la incertidumbre. | **Sí, por borrado del BLOCKED:** la nueva invocación admite lo que la política prohibía. |
| Reintento de operación de resultado desconocido | La operación pudo ejecutarse o no; no hay evidencia. | Solo es seguro si el efecto es idempotente **y** el objeto es el mismo (CE-7) **y** la credencial es fresca. Las tres condiciones juntas no se demuestran. | El reintento es indistinguible del replay; sin ancla externa no hay criterio que los separe. |

**Por qué el un solo uso no sobrevive al restore (argumento).**
El un solo uso es una propiedad de un **registro**: "N ya fue usada".
Un restore es una operación que **sustituye el registro por una
versión anterior**. Si el registro vive dentro del ámbito restaurado,
el restore borra el hecho mismo del uso. Para que el uso sobreviva,
el registro debe vivir **fuera** del ámbito restaurado: un ancla
monótona independiente (contador externo, log externo, dispositivo
externo). Esa ancla es exactamente el componente que ACM-1 no tiene
evidenciado: es ASSUMED como diseño y su existencia en el target es
UNKNOWN; además inventarla como mecanismo está prohibido sin
decisión aplicable (Obligaciones §6). El argumento es circular si se
intenta salvar de otro modo: "el registro sobrevive porque el
restore no lo toca" presupone que el restore no toca el registro,
pero el alcance del restore es UNKNOWN (P-RESTORE). No se puede
definir el restore como "lo que no toca el registro" y a la vez
usar el registro como prueba de que el restore no lo tocó.

**Corroboración interna del expediente.** M0.55 (revisión de fence
de revisión, 2026-10-17) declara expresamente que su corrección
"no prueba monotonicidad durable ante restore/rollback" (`does not
prove durable monotonicity across restore/rollback`). Es decir: el
único mecanismo de monotonicidad revisado en el expediente ya
reconoce por escrito que el restore lo invalida. La falsación CE-5
no introduce una duda nueva: formaliza una limitación ya registrada.

**Veredicto CE-5.** Bajo P-RESTORE, la autorización de `release`
**no es realmente de un solo uso**: es de un solo uso por
**línea temporal** (por historia del registro), no por credencial.
Un restore crea una línea temporal en la que el uso no ocurrió, y
dentro de esa línea la credencial es válida. **CE-5 refuta la
suficiencia de ACM-1.** Clasificación: **INFEASIBLE (condicionado
a P-RESTORE)**. Sin restore (una sola línea temporal, crash sin
reversión), el un solo uso con registro durable es un diseño
plausible: **ASSUMED**, no evidenciado en el target (no existe
implementación ni harness).

**Nota sobre idempotencia.** A veces se propone salvar CE-5 haciendo
el efecto de release idempotente ("re-ejecutarlo no daña"). La
propuesta falla por composición con CE-7: un release re-ejecutado
tras sustitución del objeto no es idempotente sobre el mismo objeto,
porque el objeto ya no es el mismo. La idempotencia presupone la
identidad que CE-7 refuta. Ver §6.1.

### 4.3 CE-7 — Identidad descriptiva que no demuestra que el objeto post-restore sea el originalmente adquirido

**Definición (encargo).** Identidad descriptiva que no permite
demostrar que el objeto posterior al restore sea el objeto
originalmente adquirido.

**Tesis.** La identidad que sobrevive a la terminación del proceso y
al restore es necesariamente **descriptiva** (un registro de
atributos). Ningún conjunto de atributos descriptivos demuestra
identidad de objeto, porque cada atributo es reutilizable, copiable
o mutable, y porque el criterio que distingue "mismo objeto" de
"sustituto indistinguible" no está definido (P07-A pendiente del
propietario). La falsación se hace por separado para cada fase, como
exige el encargo.

**a) Identidad durante la vida del proceso.**
Mientras el proceso vive y retiene el descriptor, R-OBJ se sostiene
por continuidad de custodia: el `fd` refiere al mismo inode
independientemente del nombre (V2.3 §3). Límites: (i) el `fd` prueba
continuidad desde su apertura, no que lo abierto fuera el objeto
aprobado (si la apertura ocurrió tras una sustitución, el `fd`
custodia al sustituto); (ii) la custodia muere con el proceso;
(iii) la custodia no se transfiere al restore. Clasificación:
**ASSUMED** (mecanismo plausible, no demostrado en el target;
depende de P-FD).

**b) Identidad después de terminar el proceso.**
No queda referencia viva. Solo queda el registro descriptivo: path,
nombre, token, hash de contenido, metadatos, número de inode. Cada
atributo falla por separado (ver tabla). El proceso nuevo no puede
distinguir "el objeto adquirido, que sobrevivió" de "un objeto
distinto que satisface la descripción". Clasificación:
**INFEASIBLE (condicionado)** para la demostración de identidad
con criterios descriptivos.

**c) Identidad después de restore.**
El restore sustituye objeto y registro por sus versiones de T0. El
objeto post-restore es una **copia temporal** del objeto de T0, no
el objeto que existía en el instante de la adquisición si entre
ambos hubo mutaciones legítimas, y es indistinguible de un
sustituto plantado con los mismos atributos. Peor: una sustitución
ocurrida entre T0 y el restore desaparece del registro (el restore
borra la evidencia de la sustitución, igual que borra el consumo
en CE-5). La pregunta "¿es este el objeto originalmente adquirido?"
carece de respuesta decidible: bajo un criterio estricto de
identidad (mismo inode, misma historia causal) la respuesta es no;
bajo un criterio descriptivo (mismos atributos) la respuesta es sí
para el sustituto también. Como el criterio no está definido, el
claim no es evaluable. Clasificación: **INFEASIBLE (condicionado)**
con criterios descriptivos; **UNKNOWN** en cuanto al criterio
mismo (decisión del propietario pendiente, P07-A).

**d) Sustitución del objeto.**
Un sustituto con los mismos atributos descriptivos (mismo path,
mismo contenido copiado, mismo token copiado de `owner.json`, mismos
metadatos ajustados con `touch`/`chmod`) satisface cualquier
comprobación descriptiva. La comprobación actual del código vigente
(token leído **por path**) es circular en este sentido: lee el token
del objeto al que el path resuelve **ahora** y lo compara con el
esperado; si el sustituto porta el token copiado, la comprobación
pasa. EVIDENCED (estático): el release lee `owner.json` y compara
el token antes de `rm(path)` (reconciliación 2026-11-07, §2–§3).

**e) Reutilización de identificadores.**

| Identificador | Reutilización | Consecuencia |
|---|---|---|
| Path / nombre | Recreados tras borrado; R-NAME ≠ R-OBJ (V2.3 §3). | El nombre puede resolver a otro objeto (P07-16, combinaciones 1–2). |
| PID | Reutilizado por el SO tras terminación. | PID no prueba que el actor anterior viva ni que el actual sea el anterior (P05-C §3.5; E6). |
| Token (bearer) | Copiable: poseer la cadena no prueba ser el objeto; la cadena puede copiarse a otro objeto. | La comprobación por token es comprobación de posesión de la cadena, no de identidad del objeto. |
| Número de inode (`st_ino` + `st_dev`) | Reutilizable tras borrado; no sobrevive a cambio de filesystem ni a restore en otro filesystem. | Igualdad de (dev, ino) no prueba mismidad a través de borrado+recreación ni de restore. |
| Hash de contenido | No es identidad: mismo contenido, objetos distintos; contenido copiable a un sustituto. | Un sustituto con contenido copiado pasa; un objeto legítimo con contenido actualizado falla. |
| Metadatos (tamaño, mtime, modo, owner) | Mutables y ajustables por el mismo UID (`touch`, `chmod`, `chown` en su caso). | No distinguen sustituto de original. |
| `nlink` | Compartido entre hardlinks; un decremento no dice qué nombre se eliminó (P07-21). | No comparar `nlink` aislado como identidad ni usar su igualdad como autorización (V2.3 §10). |

**f) Rename y hardlink.**
- *Rename:* conserva R-OBJ (el `fd` sigue refiriendo al objeto),
  rompe R-NAME (el path original puede resolver a otro objeto o
  quedar ausente). Una operación que sigue el nombre tras un rename
  actúa sobre otro objeto; una que sigue el `fd` actúa sobre el
  objeto original aunque su nombre ya no sea el aprobado. Ambas
  lecturas son "correctas" bajo un claim y "incorrectas" bajo el
  otro; V2.3 §3 exige declararlas por separado. Sin decisión sobre
  cuál es canónico (P01/P02 raíz pendiente), el rename deja el claim
  indeterminado.
- *Hardlink:* dos nombres, un objeto. Eliminar `n1` (autorizado para
  `n1`) disminuye `nlink` y afecta al namespace de `n2` (P07-21
  Caso B: FAIL aunque el contenido sobreviva y `n2` siga presente).
  La identidad del objeto no resuelve la autoridad sobre cada
  nombre: saber que es el mismo inode no dice si se tenía autoridad
  para eliminar ese nombre. La política de aliases sigue pendiente
  del propietario (V2.3 §6).

**g) Cambio de namespace.**
Bind mount, mount namespace, symlink en un componente del path,
`chroot`: el mismo path resuelve a objetos distintos según el
namespace. R-NAME es relativo al namespace; el contrato no fija
cuál namespace es canónico. Un `fd` abierto antes del cambio es
inmune al cambio posterior, pero una **nueva apertura** tras el
cambio resuelve distinto. La identidad post-restore hereda esta
indeterminación: el restore puede devolver el objeto en un namespace
distinto sin que ningún atributo descriptivo lo revele.

**h) Objeto legítimo que no puede volver a identificarse (falso
negativo).**
El reverso de la sustitución: un criterio descriptivo estricto
(igualdad de hash, mtime, tamaño) rechaza un objeto legítimo cuyo
contenido cambió legítimamente tras la adquisición (p. ej. un
append autorizado) o cuyos metadatos cambiaron (mtime en escritura).
Soundness (rechazar todo sustituto) y completeness (aceptar todo
objeto legítimo) no pueden satisfacerse a la vez con criterios
descriptivos, porque distinguir "mutación legítima" de
"sustitución" exige **provenance** (registro de mutaciones
autorizadas), y el registro de provenance necesita la misma
identidad que debe establecer (circular), o un mediador que observe
todas las mutaciones (P09 OPEN: no se demuestra que todas las
mutaciones sean observadas).

**Veredicto CE-7.** La identidad descriptiva no demuestra que el
objeto post-restore sea el originalmente adquirido, **ni siquiera
en principio** con los atributos disponibles: cada atributo es
reutilizable o copiable, y el criterio de identidad está sin
definir. **CE-7 refuta la suficiencia de ACM-1.** La única
identidad que funciona (custodia viva por descriptor) no sobrevive
a la terminación ni al restore, que son precisamente los casos que
P05-C y P07-C deben cubrir. Distinción raíz/nombre: la identidad
del **objeto raíz** (R-OBJ, continuidad de custodia) y la identidad
del **nombre aprobado** (R-NAME, resolución del path en un
namespace) son claims independientes (V2.3 §3); CE-7 muestra que
tras terminación/restore **ninguno** de los dos es demostrable con
medios descriptivos, y que confundirlos (inferir R-OBJ desde
R-NAME, o viceversa) es el error que el sustituto explota.

## 5. Matriz de garantías y evidencia

Cada fila: garantía, clasificación obligatoria, justificación en una
línea y fuente. **EVIDENCED** solo para hechos verificados en fuentes
primarias abiertas (documento canónico o blob). Las propiedades de
ACM-1 como diseño no son EVIDENCED.

| ID | Garantía | Clasificación | Justificación / fuente |
|---|---|---|---|
| G1 | Rechazo de mutación antigua vía API cuando M re-verifica en aceptación | ASSUMED | Diseño ACM-1, subcaso CE-1(a). M no existe; sin implementación ni harness. |
| G2 | Rechazo de mutación antigua por descriptor abierto | **INFEASIBLE (condicionado a P-R1 + P-FD)** | §4.1(b): no hay punto de aceptación en M; el kernel no revoca el fd. Solo un mediador a nivel de syscall lo impediría (fuera de R1). |
| G3 | Revocación de capacidad tras cambio de generación | **INFEASIBLE (condicionado)** | Admitir ≠ revocar; la capacidad entregada (fd) sobrevive al cambio de registro. §4.1(b)–(c). |
| G4 | Quiescencia verificable de poseedores antiguos (Q) | UNKNOWN | Enumeración del grafo de descriptores no demostrada; fork/`SCM_RIGHTS` la incompletan. §4.1(c),(e). |
| G5 | Credencial de release de un solo uso, sin restore | ASSUMED | Diseño plausible con registro durable; sin implementación ni evidencia en el target. |
| G6 | Credencial de release de un solo uso, con restore | **INFEASIBLE (condicionado a P-RESTORE)** | §4.2: el restore revierte el registro de consumo. Corroborado por M0.55 (sin monotonicidad durable ante restore/rollback). |
| G7 | Atomicidad consume-record + efecto de release | **INFEASIBLE (condicionado a P-RESTORE)** | Exige log transaccional fuera del snapshot; el log dentro del snapshot es reversible. §4.2. |
| G8 | BLOCKED durable tras crash (sin restore) | UNKNOWN | Sin estado durable demostrado; `lockReleaseFailures` es volátil (EVIDENCED estático, ver G18). Obligaciones O1: UNKNOWN. |
| G9 | BLOCKED durable tras restore | **INFEASIBLE (condicionado a P-RESTORE)** | Si BLOCKED vive en el snapshot, el restore lo borra. Sin ancla externa no hay supervivencia. §4.2 (timeout). |
| G10 | Identidad R-OBJ durante la vida del proceso (custodia por fd) | ASSUMED | Plausible por continuidad de custodia (V2.3 §3); no demostrada en el target; no prueba que lo abierto fuera lo aprobado. §4.3(a). |
| G11 | Identidad R-OBJ tras terminación del proceso | **INFEASIBLE (condicionado)** | Sin referencia viva solo quedan atributos descriptivos reutilizables. §4.3(b),(e). |
| G12 | Identidad R-NAME tras rename / cambio de namespace | UNKNOWN | Namespace canónico sin decidir (P01/P02 pendiente); R-NAME es relativo al namespace. §4.3(f),(g). |
| G13 | Distinción sustituto vs. objeto legítimo post-restore | **INFEASIBLE (condicionado)** | Criterios descriptivos admiten falsos positivos y falsos negativos; el criterio mismo está sin definir. §4.3(c),(h). |
| G14 | Cleanup replacement-safe (operación atómica condicionada a identidad) | UNKNOWN | Ningún seam demostrado en el target; el código vigente es check/use por path (G17). Oráculo P07-19/21 pendiente. |
| G15 | Cobertura universal de writers/callers (P09 cerrado) | UNKNOWN | P09 OPEN/UNKNOWN (reconciliación 2026-11-07): loaders no literales, consumidores externos, pre-read no implementado. |
| G16 | Mediador obligatorio en el punto de mutación (M) | ASSUMED | Componente hipotético de ACM-1; no existe; su obligatoriedad exige U (G15) y enforcement a nivel de ejecución. |
| G17 | Ancla independiente fuera del snapshot restaurable | ASSUMED | Ninguna en el alcance R1; inventarla es decisión de mecanismo no autorizada aquí. Necesaria para G6/G7/G9. |
| G18 | `lockReleaseFailures` es volátil y ENOENT permite readmisión | **EVIDENCED (estático, snapshot `d8b5ca87`)** | Reconciliación 2026-11-07 §2: `Set` en memoria; ENOENT limpia la marca y permite continuar. Blob `c1eb81bf`. |
| G19 | Release vigente: token → `rm(path)`, check/use no atómico | **EVIDENCED (estático, snapshot `d8b5ca87`)** | Reconciliación 2026-11-07 §2–§3; blobs `c1eb81bf` / `59d2fdeb`. O4/O5 NO SATISFECHAS. |
| G20 | Stale lock (>60 s, PID no vivo) se rechaza sin auto-reap | **EVIDENCED (estático, snapshot `d8b5ca87`)** | Reconciliación 2026-11-07 §2–§3. Es fail-closed parcial, no prueba O1–O5. |
| G21 | Módulos vigentes no reclaman fsync/durabilidad ante pérdida de energía ni resistencia a path-attack | **EVIDENCED (estático, snapshot `d8b5ca87`)** | Reconciliación 2026-11-07 §4. Limita O8. |
| G22 | Detección de divergencia (`DETECTION_ONLY`) | ASSUMED | Detectar y detenerse es diseñable; no es prevención ni `PASS_GATE` (V2.3 §2). Sin harness en el target. |
| G23 | Separación negocio/release (O9) en rutas de fallo | **EVIDENCED (estático, parcial)** | Reconciliación 2026-11-07 §5: `persistenceStatus` y `lockRelease` separados. PARTIAL; no resuelve P05/P07/cobertura. |
| G24 | Serialización de participantes COVERED por la frontera | ASSUMED | Contribuye a P07-C solo si el contrato ratificado establece que esos participantes y operaciones son el alcance completo (V2.3 §2). Alcance no establecido (P09 OPEN). |
| G25 | Revisión/fence con monotonicidad durable ante restore/rollback | **INFEASIBLE (condicionado a P-RESTORE)** para el mecanismo revisado; UNKNOWN en general | M0.55: "no prueba monotonicidad durable ante restore/rollback". Ningún otro mecanismo revisado lo prueba. |
| G26 | Protección frente a root/OS comprometido o proceso malicioso mismo UID | NOT_APPLICABLE | Fuera del alcance R1 por definición (excluidos por el modelo aceptado). No se reclama ni se evalúa. |
| G27 | Protección frente a escritor RAW que ignora el protocolo | **INFEASIBLE (condicionado)** para enforcement cooperativo | Un lock advisory no obliga a quien lo ignora (V2.3 §4, RAW). Solo un mediador obligatorio a nivel de ejecución lo impediría (G16, ASSUMED). |
| G28 | Readmisión por procedimiento aprobado (E8) | UNKNOWN | No existe procedimiento aprobado ni predicados demostrados; D2 no desbloquea. E8 sin ruta positiva. |

**Lectura de la matriz.** Ninguna garantía de las que deciden
P05-C/P07-C es EVIDENCED como propiedad de una arquitectura
suficiente. Las únicas filas EVIDENCED describen el código vigente
y sus límites (G18–G21, G23 parcial), y todas apuntan en la misma
dirección: el sistema actual no demuestra cuarentena durable,
identidad replacement-safe ni cobertura. Las filas que sostendrían
la suficiencia (G2, G3, G6, G7, G9, G11, G13) son INFEASIBLE bajo
las premisas explícitas; las restantes son ASSUMED o UNKNOWN.
No hay combinación de filas ASSUMED/UNKNOWN que produzca una
suficiencia demostrada: asumirlas todas a la vez es precisamente la
garantía circular prohibida.

## 6. Composición conjunta y contraejemplos nuevos

### 6.1 La circularidad de ACM-1

Incluso concediendo todos los componentes de ACM-1 como hipótesis,
la composición se sostiene sobre dependencias circulares:

1. **M necesita I:** para verificar en aceptación, M debe saber
   sobre qué objeto versa la solicitud. Sin identidad, M no puede
   distinguir la mutación legítima sobre `O` de la mutación sobre
   un sustituto.
2. **I necesita M:** la identidad solo es estable si todas las
   mutaciones que podrían cambiar el objeto pasan por un observador
   que actualice el registro. Sin M obligatorio, el objeto puede
   cambiar sin que el registro lo sepa (RAW, descriptor abierto,
   restore).
3. **M necesita B:** para que el rechazo de M sobreviva al crash,
   el estado BLOCKED debe ser durable y consultado antes de admitir.
4. **B necesita un ancla fuera del snapshot:** si B vive dentro del
   ámbito restaurable, el restore lo borra (CE-5). El ancla necesita
   a su vez identidad (¿ancla de qué objeto?) y necesita a M para
   ser consultada.
5. **Q necesita U:** la quiescencia exige enumerar a todos los
   poseedores de capacidad; eso exige un universo cerrado.
6. **U necesita P09 cerrado:** el universo cerrado es exactamente
   lo que P09 declara OPEN/UNKNOWN. Y P09 no puede cerrarse sin
   demostrar que cada writer pasa por M, que es lo que U afirma.

Cada propiedad se apoya en la siguiente; ninguna se apoya en
evidencia del target. La composición no es una arquitectura con
fundamento: es un ciclo de premisas. Romper el ciclo en cualquier
punto (p. ej. conceder un ancla externa) no lo cierra: traslada la
carga a la premisa concedida, que sigue sin evidencia y exige una
decisión del propietario (nuevo mecanismo, nuevo alcance, nueva
autoridad).

### 6.2 Contraejemplos nuevos (propuestos por esta falsación; no ratificados)

**CE-8 — Ambigüedad de la decisión del mediador (el mediador
también tiene CE-5).**
M decide admitir o rechazar una solicitud y registra su decisión.
Crash durante el registro de la decisión: la decisión se ejecutó
o no, y el solicitante reintenta. El reintento de la *solicitud*
es indistinguible del replay de la *decisión*. M no resuelve
CE-5: lo desplaza un nivel (del release a la decisión de admitir).
Incluso con M perfecto, la frontera decisión/registro tiene la
misma estructura de exactamente-una-vez que CE-5 refuta bajo
restore. Ataca: G5–G7, G16. Clasificación: **INFEASIBLE
(condicionado a P-RESTORE)**, misma forma que CE-5.

**CE-9 — Mutación en vuelo en la frontera de la syscall.**
La comprobación en aceptación ocurre antes del despacho; el efecto
aterriza después. Un proceso que ya entró en la syscall (o cuyo
write ya fue aceptado por la capa de almacenamiento) no puede ser
detenido por un cambio de generación posterior, aunque M revoque
su autorización en ese intervalo. Ninguna comprobación en espacio
de usuario cubre una syscall en vuelo; solo serialización a nivel
de kernel. Ataca: G1, G2, G4. Clasificación: **INFEASIBLE
(condicionado a P-R1)** para enforcement en espacio de usuario.

**CE-10 — Snapshots sesgados (composición de restores).**
El estado de coordinación y el estado del recurso se restauran
desde snapshots tomados en **instantes distintos** (o con ámbitos
distintos): recurso en T0, registro del mediador en T1. El estado
combinado resultante **nunca existió**: p. ej. recurso anterior al
release con registro posterior al consumo de la credencial (o a la
inversa). Ninguna invariante demostrada en una línea temporal única
se sostiene en la combinación. La atomicidad del snapshot compuesto
es un problema de snapshot distribuido sin evidencia ni definición
(P-RESTORE no define atomicidad). Ataca: G6–G9, G16, la composición
entera. Clasificación: **UNKNOWN** en cuanto a la semántica de
restore (no definida); **INFEASIBLE (condicionado)** si los
snapshots son independientes, como presupone P-RESTORE.

**CE-11 — Herencia y transferencia de capacidad fuera del registro.**
Fork antes de la pausa, herencia de `fd` por `exec`, transferencia
por `SCM_RIGHTS`, o descriptor duplicado con `dup(2)`: la capacidad
circula por canales que el registro de admisión no observa. Matar,
revocar o enumerar "el proceso antiguo" no alcanza a sus
descendientes ni a los receptores. La quiescencia exigiría un censo
del grafo completo de descriptores, con carreras frente a fork/exec
y sin disponibilidad demostrada en el target. Ataca: G4, G3, U.
Clasificación: **UNKNOWN** (mecanismo de censo no demostrado);
**INFEASIBLE (condicionado)** como verificación completa.

Estos cuatro contraejemplos son **nuevos**: no figuran en el
expediente consultado (búsqueda sin resultados para CE-1/5/7 y
revisión de P07-01…22, E1–E9 y O1–O9, donde no aparecen sus formas
exactas). Se registran como abiertos, no como ratificados. CE-8 y
CE-10 son los más graves para la composición: atacan al mediador y
al restore mismos, no a una propiedad aislada, por lo que
sobreviven incluso si CE-1, CE-5 y CE-7 se resolvieran por separado.

## 7. Imposibilidades lógicas frente a desconocimientos del target

### 7.1 Imposibilidad lógica universal: NO demostrada

Ninguna de las refutaciones de §4–§6 es una imposibilidad lógica
universal. No se demuestra que *ningún* sistema pueda satisfacer
P05-C/P07-C. Lo que se demuestra es **imposibilidad condicionada**:
bajo P-R1 (espacio de usuario, sin mediador de kernel, sin ancla
externa) + P-RESTORE (el estado de coordinación es reversible) +
P-FD (los descriptores sobreviven a la generación), ACM-1 y toda
variante más débil caen ante CE-1/5/7. Cambiar las premisas cambia
el resultado —pero cambiar las premisas es cambiar el modelo
aceptado o inventar un mecanismo, y ambas cosas exigen decisión del
propietario. La distinción importa: declarar imposibilidad universal
sería tan infundado como declarar suficiencia. El resultado correcto
es **UNKNOWN / BLOCKING con imposibilidad condicionada demostrada**.

### 7.2 Desconocimientos del target (Android/Termux) que impiden cerrar

1. **Semántica de restore (P-RESTORE).** Qué se restaura, con qué
   atomicidad, quién lo ejecuta, si incluye el estado de
   coordinación. Sin definición, CE-5 no puede cerrarse ni siquiera
   en principio: no se sabe qué es "el snapshot anterior".
2. **Semántica filesystem en el POCO/Termux real.** Reutilización
   de inodos, atomicidad de rename, durabilidad fsync, comportamiento
   de `unlinkat`/`openat2`/`dirfd`, montajes y namespaces en el
   filesystem concreto bajo HOME privado. P07-D/E siguen OPEN; el
   fingerprint del target (O8) no existe.
3. **Disponibilidad y semántica de primitivas en el Node del
   dispositivo.** `openat2`, `unlinkat`, OFD locks, `flock` sobre el
   filesystem real, inspección de `/proc/PID/fd`. Ninguna verificada
   en ejecución en el target; los documentos son diseño, no
   evidencia de ejecución.
4. **Semántica de pausa/reanudación y herencia de descriptores.**
   P-FD se asume como semántica POSIX estándar; su verificación en
   Android/Termux (incluido el comportamiento del sandbox y del
   ciclo de vida de procesos Android frente a procesos Termux) es
   UNKNOWN. P07-14 confirma que SIGSTOP no es exit, pero no cierra
   la semántica de reanudación con descriptores.
5. **Control sostenido de launchers/writers (E2/E3).** PARTIAL/NOT
   CLOSED: no se demuestra que durante una ventana no aparezca un
   writer no controlado, ni que un proceso pausado no sea
   relanzado.
6. **Universo de actores (P09).** Loaders no literales, consumidores
   externos, procesos hijos y dispatch indirecto: UNKNOWN.
7. **Criterio de identidad (P07-A).** Qué cuenta como "el mismo
   objeto" y qué como sustituto; política de aliases; autoridad de
   raíz P01/P02. Pendiente del propietario.

### 7.3 Qué es imposibilidad y qué es desconocimiento (resumen)

| Cuestión | Veredicto |
|---|---|
| Impedir mutación por fd abierto con mediador en espacio de usuario | INFEASIBLE (condicionado a P-R1 + P-FD) |
| Un solo uso de release bajo restore con registro dentro del snapshot | INFEASIBLE (condicionado a P-RESTORE) |
| Identidad post-crash con criterios puramente descriptivos | INFEASIBLE (condicionado) |
| Quiescencia completa por enumeración de procesos | INFEASIBLE (condicionado) como verificación completa; UNKNOWN como mecanismo |
| Existencia de *alguna* arquitectura suficiente en *algún* modelo | UNKNOWN (no se demuestra imposibilidad universal) |
| Semántica de restore, filesystem y primitivas en el target | UNKNOWN |
| Cobertura universal de actores | UNKNOWN (P09 OPEN) |
| Criterio de identidad y política de aliases | UNKNOWN (decisión del propietario) |

## 8. Condiciones necesarias para suficiencia

Cada condición indica qué mecanismo abstracto la proporcionaría y
qué evidencia permitiría verificarla. Ninguna está satisfecha hoy;
todas son necesarias conjuntamente (no son alternativas), y cada
una exige una decisión del propietario o una evidencia del target
que hoy no existe. No son una propuesta tecnológica aprobada: son
el precio de la suficiencia, enunciado para que el propietario
decida si quiere pagarlo.

| ID | Condición necesaria | Mecanismo abstracto que la proporcionaría | Evidencia que la verificaría | Estado |
|---|---|---|---|---|
| N1 | Mediador obligatorio en el punto real de mutación (syscall), no solo en la API | Interposición a nivel de kernel/filesystem que filtre o revoque descriptores; o mediador que sea el único escritor con ejecución atómica verificación+efecto | Demostración de que ningún camino de escritura (fd, RAW, hijo, restore) elude al mediador; fixtures negativos por cada camino (P09 cerrado) | ASSUMED; fuera de R1 como está |
| N2 | Ancla monótona independiente fuera del snapshot restaurable | Contador/log externo al ámbito de restore, con monotonicidad durable ante crash y restore | Crash/restore en cada punto de corte (§4.2) con el ancla intacta; definición del ámbito de restore (P-RESTORE) | ASSUMED; mecanismo no autorizado |
| N3 | Identidad no reutilizable con provenance | Identificador único por objeto + registro de mutaciones autorizadas observado por el mediador; criterio de identidad decidido (P07-A) | Sustitución adversarial con atributos idénticos rechazada; objeto legítimo mutado aceptado; ambos oráculos P07-16/21 superados | UNKNOWN (criterio sin decidir) |
| N4 | Quiescencia verificable (censo de capacidades) | Registro de poseedores de descriptores + revocación efectiva + censo del grafo de herencia/transferencia | Fork/`SCM_RIGHTS`/reanudación tras pausa sin mutación efectiva; oráculo P07-14 ampliado | UNKNOWN; INFEASIBLE como verificación completa sin N1 |
| N5 | Semántica de restore definida y atómica | Definición canónica de la operación de restore: ámbito, atomicidad, ejecutor, inclusión del estado de coordinación | CE-10 resuelto: snapshots compuestos con atomicidad demostrada o con ámbitos declarados y disjuntos | UNKNOWN (no definida) |
| N6 | Universo cerrado de actores (P09 cerrado) | Delimitación del universo de despliegue + conversión de APIs path-based en superficie interna o con contexto admitido + resolución de loaders no literales | Reconciliación P09 cerrada para el universo declarado; fixtures de bypass negativos | UNKNOWN (P09 OPEN) |
| N7 | Matriz de crash en cada punto relevante, ejecutada en el target | Harness con barreras deterministas, procesos separados, crash/restore reales, fingerprint del target | E1–E9 + oráculos V2.3 con `PASS_GATE` y `gate_basis` explícitos; SHA congelado | UNKNOWN (harness no implementado; pruebas no ejecutadas) |
| N8 | Decisiones del propietario pendientes | P07-A (identidad/aliases), P01/P02 (autoridad de raíz y nombre canónico), procedimiento de recuperación/resolución (E8), aceptación o rechazo de N1/N2 como cambio de modelo | Decisiones expresas registradas; ninguna inferida | Pendientes; solo el propietario decide |

**Advertencia sobre N1+N2.** Conceder N1 y N2 cambia el modelo:
N1 introduce un mecanismo privilegiado/de SO (fuera de R1 como
está aceptado) y N2 introduce un componente externo al snapshot
(nuevo mecanismo durable, hoy prohibido inventar sin decisión).
Concederlas sin decisión del propietario sería redefinir R1 por
inferencia técnica. Por eso se enuncian como condiciones, no como
recomendación de implementación.

## 9. Conclusión sobre P05-C/P07-C y respuestas a las 8 preguntas

### 9.1 Conclusión

P05-C es una **política correcta** (conservar UNKNOWN/BLOCKED sin
recuperación automática) y P07 V2.3 es una **normativa correcta**
(detección ≠ prevención; R-OBJ ≠ R-NAME; actor B clasificado;
taxonomía de resultado). Ninguna de las dos es, ni pretende ser, un
mecanismo. La pregunta de esta misión era si existe una arquitectura
abstracta capaz de satisfacerlas simultáneamente bajo R1. La
respuesta es: **no demostrado; y la candidata más fuerte cae ante
los tres contraejemplos por imposibilidad condicionada.**

P05 permanece **OPEN** por falta de enforcement y evidencia, como
antes. P07-C permanece **UNKNOWN / BLOCKING**, como antes. Esta
falsación no empeora el estado: lo precisa. Lo que antes era "no se
ha demostrado mecanismo" ahora es "se ha demostrado que la
arquitectura más fuerte compatible con R1 no basta, y se sabe
exactamente qué premisas habría que cambiar para que bastara (§8)".
Ese es un avance documental, no un cierre.

### 9.2 Respuestas

**1. ¿Existe una arquitectura abstracta suficiente para P05-C y
P07-C bajo R1?**
No demostrado. ACM-1 (§2), la candidata más fuerte, es refutada
por CE-1 (descriptor abierto), CE-5 (replay tras restore) y CE-7
(identidad descriptiva), y su composición es circular (§6.1).
La imposibilidad es condicionada a P-R1 + P-RESTORE + P-FD; la
imposibilidad universal no se demuestra. Veredicto: **UNKNOWN /
BLOCKING**.

**2. ¿Puede impedirse que un proceso antiguo actúe con un descriptor
abierto?**
No bajo R1. Por API sí (re-verificación en aceptación, CE-1(a));
por descriptor abierto no: no hay punto de aceptación en el
mediador y el kernel no revoca el descriptor al cambiar la
generación. Solo un mediador a nivel de syscall/kernel lo
impediría, fuera de R1 y sin evidencia en el target. Veredicto:
**INFEASIBLE (condicionado)**.

**3. ¿Puede impedirse el replay de release después de restore?**
No sin un ancla monótona fuera del snapshot restaurable. El
registro de consumo vive dentro del ámbito restaurado y el restore
lo borra; la credencial resucita como no usada. La política P05-C
(UNKNOWN/BLOCKED, no reintentar) es la respuesta correcta a nivel
de política, pero su enforcement tras restore exige la misma ancla.
Veredicto: **INFEASIBLE (condicionado a P-RESTORE)**. Corroborado
por M0.55.

**4. ¿Puede demostrarse identidad post-crash sin depender de nombre
o metadatos reutilizables?**
No con criterios descriptivos: cada atributo es reutilizable,
copiable o mutable, y el criterio de identidad está sin definir.
La única identidad que funciona (custodia viva por descriptor) no
sobrevive a la terminación ni al restore. Demostrarla exigiría
provenance observada por un mediador obligatorio (N3) o un criterio
decidido por el propietario (P07-A). Veredicto: **INFEASIBLE
(condicionado)** con medios descriptivos; **UNKNOWN** en cuanto al
criterio.

**5. ¿Qué garantías requieren un mediador obligatorio en el punto de
mutación?**
Todas las decisivas: rechazo en aceptación (G1), neutralización de
operaciones antiguas (G3), single-use (G5–G7), BLOCKED durable
(G8–G9), identidad en el instante de mutación (G10/G13/G14),
serialización con alcance completo (G24) y quiescencia (G4). Y el
mediador mismo requiere durabilidad ante crash/restore (N2) y
universo cerrado (N6). Sin mediador obligatorio en el punto real
de mutación (syscall), cada garantía se reduce a cooperación
voluntaria. Veredicto: **el mediador es necesario pero no
suficiente** (CE-8 muestra que el mediador mismo tiene el problema
CE-5).

**6. ¿Qué condiciones permanecen desconocidas en Android/Termux?**
Las siete de §7.2: semántica de restore; semántica filesystem
(inodos, rename, fsync, primitivas); disponibilidad de
`openat2`/`unlinkat`/OFD/`/proc` en el Node del dispositivo;
semántica de pausa/reanudación y herencia de descriptores en el
sandbox; control sostenido E2/E3; universo de actores P09;
criterio de identidad P07-A. Ninguna puede resolverse por
inferencia documental: requieren observación del dispositivo o
decisión del propietario, y la observación requiere autorización
específica (no concedida aquí).

**7. ¿Qué parte del claim debe permanecer UNKNOWN mientras P09 siga
OPEN?**
Todo cuantificador universal: "ningún writer puede…", "toda
mutación pasa por…", "ningún poseedor antiguo puede actuar",
"el universo de actores es…". P09 OPEN significa que el conjunto
de escritores es desconocido; cualquier claim universal sobre él
es UNKNOWN por construcción, con independencia de cómo se resuelvan
CE-1/5/7. En particular: U (G15), Q (G4), obligatoriedad de M
(G16) y cualquier `PASS_GATE` que presuponga cobertura completa
(V2.3 §2: `PASS_GATE` exige cobertura de actores/writers).

**8. ¿Existe algún contraejemplo adicional que invalide la
composición?**
Sí: CE-8 (ambigüedad de la decisión del mediador), CE-9 (mutación
en vuelo), CE-10 (snapshots sesgados) y CE-11 (herencia y
transferencia de capacidad fuera del registro), §6.2. CE-8 y CE-10
son los más graves porque atacan al mediador y al restore mismos:
incluso si CE-1, CE-5 y CE-7 se resolvieran por separado, la
composición seguiría sin demostrarse. Quedan registrados como
contraejemplos abiertos, no ratificados.

## 10. Recomendación del siguiente paso documental

**No implementar. No seleccionar tecnología. No ejecutar pruebas.
No declarar M0 cerrado.** El siguiente paso es documental y pertenece
al propietario; se propone en este orden:

1. **Registrar el resultado.** Incorporar este veredicto
   (UNKNOWN / BLOCKING con imposibilidad condicionada) y los nuevos
   contraejemplos CE-8 a CE-11 al expediente, como refutación de la
   suficiencia de ACM-1 bajo R1. No reabrir decisiones ratificadas
   (R1, P05-C, P07 V2.3).
2. **Definir restore antes de cualquier otro trabajo sobre CE-5.**
   Sin una definición canónica de la operación de snapshot/restore
   (ámbito, atomicidad, ejecutor, inclusión del estado de
   coordinación), CE-5 no es cerrable ni siquiera en principio.
   Esta definición es una unidad documental previa, no una
   implementación.
3. **Decidir el propietario sobre N1/N2.** Si el propietario no
   acepta cambiar el modelo (mediador a nivel de syscall, ancla
   externa al snapshot), la imposibilidad condicionada se convierte
   en el resultado estable del expediente: P05 OPEN y P07-C
   UNKNOWN/BLOCKING se mantienen, y el trabajo futuro se limita a
   documentar, no a buscar una arquitectura suficiente dentro de
   R1. Si las acepta como cambio de modelo, se autorizaría una
   unidad documental posterior que especifique N1/N2 como
   **propuesta** (no como selección) con sus propias falsaciones.
4. **No autorizar harness ni pruebas** hasta que N5 (semántica de
   restore) y las decisiones N8 estén resueltas: ejecutar E1–E9 o
   los oráculos V2.3 sin esas definiciones produciría resultados
   `UNKNOWN`/`INVALID`, no evidencia.
5. **Mantener P09 OPEN explícitamente** como el bloqueo del
   cuantificador universal (§9.2.7): ningún cierre parcial de
   CE-1/5/7 debe presentarse como cierre del claim mientras P09
   siga OPEN.

**Criterio de éxito de esta misión (verificado).** El trabajo es útil
precisamente porque concluye que la suficiencia no puede demostrarse:
un UNKNOWN / BLOCKING correctamente justificado, con la imposibilidad
condicionada demostrada y las condiciones de suficiencia enunciadas,
es preferible a una arquitectura aparentemente completa apoyada en
garantías circulares. No se declara M0 cerrado; no se autoriza
implementación ni efectos protegidos.

---

## Anexo A. Trazabilidad y verificación de esta entrega

- Método: lectura directa de los canónicos en la rama indicada
  (HEAD `eee2ae77`, verificado por `ls-remote` y clon público de
  solo lectura); falsación adversarial de la arquitectura candidata  más fuerte (ACM-1); clasificación por garantía con el vocabulario
  obligatorio; distinción imposibilidad condicionada / universal.
- No se reconstruyó ningún documento a partir de resúmenes: las tres
  fuentes obligatorias y las de apoyo se leyeron completas; sus
  SHA-256 están en §0.
- No se repite el inventario general de callers, locks o P09: P09 se
  cita solo en lo que afecta al cuantificador universal (§9.2.7) y
  a la composición (§6.1).
- No se afirma cobertura universal en ningún punto.
- No se asumen garantías de filesystem, Android, Termux o anclas
  externas sin evidencia: cada asunción está etiquetada ASSUMED o
  UNKNOWN (§5, §7.2, §8).
- GitHub: NOT_CONNECTED (verificado 2026-11-10). Nada publicado por
  este análisis; la entrega es local para revisión del propietario.
- Estado final: P05-C RATIFICADA COMO POLÍTICA; P05 OPEN; P07-C
  UNKNOWN / BLOCKING; P09 OPEN / UNKNOWN; E2/E3 PARTIAL / NOT
  CLOSED; M0 INCOMPLETO; `authorization: NOT_EVALUATED`; raíz
  constitucional PENDING/UNKNOWN; commissioning y efectos protegidos
  STOP.

*Fin del documento.*