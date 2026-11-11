# NCS M0 — Evaluación de compatibilidad ACA-1 con ratificaciones vigentes

**Proyecto:** NEXO — NCS M0 (fundamento de continuidad)
**Rama documental de destino:** `ncs-m0-architecture-research-2026-11-10`
**Carpeta de destino:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/`
**Fecha:** 2026-11-10
**Autor:** Snow (Muse) — evaluación documental; no se modifica el repositorio.
**Estado del documento:** EVALUACIÓN — no es una arquitectura nueva, no es un canónico, no modifica ACA-1 ni las ratificaciones.
**Veredicto:** **PARTIAL — BRECHAS IDENTIFICADAS** (definido en §10).

---

## 0. Propósito, método y honestidad

### 0.1 Propósito

Evaluar exclusivamente si la arquitectura candidata ACA-1 puede satisfacer
simultáneamente las decisiones ya ratificadas del propietario y las
obligaciones P05/P07. No se crea una arquitectura nueva desde cero. No se
repiten las auditorías CE-1/CE-5/CE-7, los análisis generales de locks ni los
inventarios ya realizados: se citan por sección cuando se necesitan.

### 0.2 Lo que este documento hace y lo que no hace

**Hace:**

- Contrastar ACA-1, decisión por decisión, con D-RB-01–D-RB-09 ratificadas.
- Contrastar ACA-1 con las obligaciones O1–O9 y con los oráculos bloqueantes
  de P07 V2.3.
- Identificar contradicciones sin reinterpretar las decisiones.
- Identificar los supuestos de ACA-1 que carecen de evidencia.
- Determinar si ACA-1 puede alcanzar `PASS_GATE` dentro de R1 y del universo
  P09 ratificado.
- Separar lo satisfecho por diseño, lo que necesita mecanismo, lo que
  necesita evidencia del target y lo que requiere una futura decisión del
  propietario.
- Cuando ACA-1 no es viable para una propiedad, nombrar exactamente qué
  propiedad falla y por qué. No se inventa ninguna primitiva alternativa.

**No hace:**

- No decide nada por el propietario y no reabre ninguna decisión ratificada.
- No solicita ninguna decisión nueva: donde falta una decisión, se presenta
  la propuesta concreta ya existente (en ACA-1 §8 o en la especificación de
  rollback §7) con sus alternativas y consecuencias, y se deja la decisión
  para el propietario.
- No convierte propuestas en decisiones ni documentación en PASS.
- No modifica código, tests, workflows, STATUS, PR ni ramas de producto.
- No ejecuta tests, CI, harness, runtime, bootstrap ni comandos de
  dispositivo. No declara M0 completo.

### 0.3 Fuentes verificadas

| # | Fuente | Identificación | Uso |
|---|---|---|---|
| S1 | ACA-1, «Arquitectura candidata» (documento entregado por Snow; el nombre de archivo conserva «CLAUDE» por el encargo original, pero la autoría es de Snow y así se usa aquí) | 62.312 bytes, 850 líneas, SHA-256 `f337381fbfaea459ba38224eb9d3d06796ef011a02227d3c4455ea6985e34d13` (verificado 2026-11-10) | Objeto de la evaluación |
| S2 | Reconciliación D-RB-01–D-RB-09 | SHA-256 `f1d5e4bd98ea14b6459525f5502a120496e0105fde8c219c7f63827d0d266057` (verificado; en la rama está subida como «Reconciliación de decisiones de rollback.md», byte-idéntica) | Correcciones de alcance R-01–R-05; requisito vs mecanismo |
| S3 | Brechas y bloqueos de la reconciliación | SHA-256 `3fdb1ca415c2ac9bb44e07db575872a8582bb25f489fa17ae29c98535f4f36a8` (verificado; en la rama, byte-idéntico) | C-01–C-03, G-01–G-10, B-01–B-05 |
| S4 | P05-C, definición técnica + delta de ratificación 2026-11-07 | SHA-256 `8631af41918969b3116a6b3a5f973c3b19309fa4a2a7caa3607bd7a78a625b2f`, rama `ncs-continuity-handoff-correction-2026-11-07`, HEAD `eee2ae772e5569ffbc90d6334f47c6633f4961fb` | Política ratificada; invariantes; E1–E9 |
| S5 | P07 V2.3 delta normativo | SHA-256 `65de8801d0e405ee0adb055b45cfacdd83d060549c97f93f44f3a5110f728f38`, mismo HEAD | Regla de gate, R-OBJ/R-NAME, actor B, taxonomía |
| S6 | P07 V2.3 delta de oráculos | SHA-256 `f9cc5e431132b56af03c95406027c82d435fb9f6eaca7b90f78d33efab797203`, mismo HEAD | P07-05/06/16/18b/19/21; regla transversal de PASS |
| S7 | Obligaciones P05/P07 (O1–O9) | SHA-256 `83d70ffd470f4e35504845eaa23cf2064dc0e217b9c4145da6b0cb9f64aa6c4b`, mismo HEAD | Matriz O1–O9 |
| S8 | P08, reconciliación root→stores | SHA-256 `b905207c75973fac616a7ee643a3031fdc8b75af625867759c2bd04de66efeb3`, mismo HEAD | Brecha root→stores; candidato; ver §0.4 |
| S9 | P09, reconciliación de cobertura de callers | SHA-256 `fd44f33776e1dccf91f098ab55a45cb820dcae575bdee7e304b7594548eef3bc`, mismo HEAD | Universo declarado; gaps; matriz de cierre |
| S10 | P09 delta de loaders y grafo declarado (Snow, 2026-11-10) | SHA-256 `6e59e0e62620582d7830fd5ce04e643ce806981b93b5ccce18b9b5a11149d49b`; snapshot `d8b5ca8720908d926acc18130614cce132a43b5d` | Inventario de loaders, workflows, consumidores en repo |
| S11 | R1 aceptado + evidencia E2/E3 | SHA-256 `f720f00f37498a131c4f3d6e938334b7c4d9040d07c39a14813e95f6d756f994`, mismo HEAD | Límite R1; E2/E3 PARTIAL/NOT CLOSED |
| S12 | Matriz E1–E9; contrato de identidad filesystem; reconciliación de código vigente (lock/release) | SHA-256 `310a0faf…`, `1f74d462…`, `1df51530…`, mismo HEAD | Apoyo: E1–E9, P07-01…10, estado actual O4/O5 |

Ramas verificadas por `git ls-remote` el 2026-11-10:
`ncs-continuity-handoff-correction-2026-11-07` =
`eee2ae772e5569ffbc90d6334f47c6633f4961fb`;
`ncs-lumina-decoupling-2026-10-29` =
`d8b5ca8720908d926acc18130614cce132a43b5d`;
`ncs-m0-architecture-research-2026-11-10` = `ed19e8b3627d5243c70066e0e6c5ba0f916a6d5c`
(«Add files via upload»: la reconciliación y las brechas ya están en la
rama, subidas por el propietario; el delta P09 aún no está). El clon de
consulta es público, de solo lectura y quedó sin modificar
(`git status --porcelain` vacío). GitHub sigue NOT_CONNECTED
(`auth_status: not_connected`, verificado 2026-11-10): Snow no publica nada.

### 0.4 Discrepancias de procedencia que esta evaluación registra sin resolver por inferencia

Tres ratificaciones llegan por la instrucción del propietario de esta
misión (2026-11-10) y no están registradas con ese contenido en los
canónicos de la rama consultada. El patrón es el mismo que P07 V2.3
(S5/S6: el archivo de 2026-11-03 dice NO RATIFICADO; la ratificación del
8-Nov-2026 consta por instrucción del propietario, como ya registraron
ACA-1 §0.2 y la reconciliación §1.3). Esta evaluación toma las
ratificaciones del encargo como autoritativas para el delta, registra la
discrepancia y no finge que el contenido ratificado esté verificado en la
rama:

| Ratificación (encargo) | Estado en los canónicos consultados | Consecuencia para esta evaluación |
|---|---|---|
| P07 V2.3 ratificada | Archivo histórico NO RATIFICADO (snapshot anterior) | Se evalúa contra V2.3 como normativa ratificada |
| P08 decidida, ratificada el 9-Nov; no pedir de nuevo la ratificación del mapping | P08 OPEN / LAYOUT UNSELECTED; candidato `.nexo-continuity.json` + `.nexo-chronicle.json` **no ratificado** en el archivo | P08 se trata como **decidida**; el contenido exacto del mapping decidido no se localizó en las fuentes consultadas → ACA-1×P08 = **NO DEMOSTRADO** (no se puede verificar contra un contenido no referenciado). Brecha mínima: referenciar/registrar el contenido ya decidido, **sin** volver a pedir su ratificación |
| P09: universo declarado y verificable ratificado el 9-Nov; alcance acotado decidido; no pedir cobertura universal | P09 OPEN/UNKNOWN; el delta P09 dejó como siguiente acción única que el propietario defina el universo de despliegue | El universo se trata como **decidido**; su contenido no se localizó en las fuentes consultadas. ACA-1×P09 se evalúa contra el universo declarado (no universal): compatible en intención, **NO DEMOSTRADO** en cierre |
| P01-B/B2 quedó en opción C: no seleccionar launcher | P01-B = C — NO SELECCIONAR TODAVÍA (protocolo del equipo IA) | ACA-1 no nombra launcher (compatible literal); su ciclo de vida SUP/MED presupone un mecanismo de lanzamiento/supervisión no seleccionado → **NO DEMOSTRADO** |

Ninguna de estas discrepancias se convierte aquí en una solicitud de
decisión nueva. La brecha es de **referencia/registro** del contenido ya
decidido, no de decisión (ver §11, brecha 1).

### 0.5 Etiquetas y veredictos de celda

Etiquetas de afirmación (disciplina del expediente): **[RATIFICADO]** =
decisión del propietario; **[EVIDENCIA]** = fuente primaria verificable;
**[PROPUESTA]** = opción de diseño no aprobada; **UNKNOWN** = no resuelto,
nunca resuelto por inferencia.

Veredicto por celda de las matrices:

- **COMPATIBLE** — ACA-1, leída con las correcciones de la reconciliación
  (R-01–R-05), no contradice la ratificación/obligación y su diseño la
  cubre en el nivel que la celda exige (se indica si es por diseño, por
  política o por procedimiento propuesto).
- **INCOMPATIBLE** — ACA-1, tal como está escrita, contradice la
  ratificación/obligación. Se cita el pasaje.
- **NO DEMOSTRADO** — ACA-1 no contradice, pero la ratificación/obligación
  exige un mecanismo, una evidencia o un contenido que ACA-1 no aporta o
  que no está verificado. Es el veredicto dominante de esta evaluación.
- **NO APLICABLE** — la celda no aplica a ACA-1 en el alcance ratificado.

«Compatible» en una celda significa compatibilidad **documental de
diseño**, nunca demostración técnica: ACA-1 no está implementada ni
ejecutada, y ninguna celda de este documento declara PASS.

---

## 1. Línea base ratificada (contenido normativo)

| Elemento | Estado [RATIFICADO] | Contenido normativo que ACA-1 debe satisfacer |
|---|---|---|
| D-RB-01 A | Ratificada 2026-11-10 | Moratoria total: RB-1, RB-2, RB-3 y RB-4 fuera de R1. No existe vía futura implícitamente permitida; abrir cualquier alcance exige nueva decisión expresa |
| D-RB-02 A | Ratificada | Solo el propietario puede **ordenar y autorizar** explícitamente el rollback, mediante declaración fuera del dominio restaurable. No implica que deba ejecutarlo materialmente |
| D-RB-03 A | Ratificada | Atomicidad exigida por alcance para cualquier rollback permitido (hoy ninguno); un rollback parcial es un estado que nunca existió |
| D-RB-04 A | Ratificada | Detección por **ancla monotónica externa e independiente**. Su tecnología no está seleccionada; es un requisito, no un mecanismo realizado |
| D-RB-05 A | Ratificada | Matriz P05-C por alcance: RB-1/RB-2 UNKNOWN/BLOCKED hasta reconciliación verificada; RB-3/RB-4 BLOCKED (inaplicable sin ancla/declaración); parcial detectado → BLOCKED |
| D-RB-06 C | Ratificada | Prohibido iniciar rollback con sesiones, procesos o descriptores relevantes activos: el ejecutor debe terminarlos; si no puede, no hay rollback |
| D-RB-07 A | Ratificada | Prohibido revertir AUTH (RB-3/RB-4) mientras no exista ancla externa **realizada** (no basta su decisión) |
| D-RB-08 A | Ratificada | Cuarentena obligatoria + verificación antes de activar cualquier dato restaurado (C09) |
| D-RB-09 A | Ratificada | Registro externo obligatorio (ámbito, snapshot, ejecutor, instante, resultado). **No equivale automáticamente** al ancla monotónica de D-RB-04 A |
| P05-C | Ratificada como política 2026-11-07; P05 OPEN | Incertidumbre de release/cleanup → UNKNOWN/BLOCKED, sin recuperación automática; negocio y release separados; sin segunda limpieza destructiva por path sin identidad demostrada; D2 solo observa; sin enforcement durable/interproceso demostrado, la instancia permanece STOP. El **enforcement durable sigue pendiente** |
| P07 V2.3 | Ratificada (ver §0.4); P07-C UNKNOWN/BLOCKING | Detección ≠ prevención; retención ≠ prevención; serialización ≠ `PASS_GATE`; R-OBJ ≠ R-NAME; actor B ∈ {COVERED, RAW, PRIVILEGED, UNCLASSIFIABLE} fijado antes de ejecutar; taxonomía `harness_verdict` / `result_class` / `product_state` |
| P08 | Decidida (encargo; ver §0.4); contenido del mapping no referenciado en las fuentes | Un único dominio canónico root→stores para que todas las APIs/entrypoints compartan el mismo dominio de admisión. ACA-1 no puede verificarse contra un mapping cuyo contenido no está referenciado |
| P09 | Universo declarado y verificable ratificado el 9-Nov (encargo; ver §0.4); P09 OPEN/UNKNOWN en canónicos | Alcance **acotado y declarado**: se evalúa cobertura dentro del universo declarado, nunca cobertura universal. Consumidores externos fuera del universo: UNKNOWN / OUTSIDE DECLARED UNIVERSE |
| P01-B/B2 opción C | Vigente | **No seleccionar launcher.** Ningún mecanismo de lanzamiento queda elegido |
| R1 + E2/E3 | R1 aceptado 2026-11-02; E2/E3 PARTIAL/NOT CLOSED | Android sandbox + HOME privado Termux, invocación manual en primer plano, propietario único lanzador manual durante la ventana; excluye root/OS comprometido y procesos maliciosos mismo-UID. La aceptación del límite **no** demuestra control de los actores reales |
| A-03 (ACA-1) | UNKNOWN/PENDING | Sin evidencia específica de que Android backup/saved-state restaure el HOME de Termux; se mantiene así por instrucción expresa |
| Ninguna ratificación | — | **Ninguna autoriza implementación, pruebas, CI ni operaciones en POCO/Termux.** ACA-1 sigue siendo [PROPUESTA] en su totalidad; A-09 no solicitada ni concedida |

Estados preservados sin cambio en toda esta evaluación: P05 OPEN,
P07-C UNKNOWN/BLOCKING, P09 OPEN/UNKNOWN, E2/E3 PARTIAL/NOT CLOSED,
`authorization: NOT_EVALUATED`, raíz constitucional PENDING/UNKNOWN,
commissioning y efectos protegidos STOP, M0 INCOMPLETO.

---

## 2. Matriz ACA-1 × D-RB-01…D-RB-09

Lectura obligatoria: ACA-1 se evalúa **con** las correcciones R-01–R-05 de la
reconciliación (S2 §5) aplicadas como regla de lectura, porque esas
correcciones son interpretación fiel de ratificaciones existentes. Cuando
el texto de ACA-1 contradice la ratificación antes de la corrección, la
celda lo dice y cita el pasaje: la corrección vive en S2, no en ACA-1.

| Decisión | Veredicto | Justificación (pasaje de ACA-1 / corrección aplicada) |
|---|---|---|
| **D-RB-01 A** (moratoria RB-1–RB-4) | **INCOMPATIBLE** (texto de ACA-1) | ACA-1 §8, A-02 se titula «Moratoria RB-3/RB-4 (D-RB-01 A)» y ofrece la opción C «Solo RB-1 admitido»; ACA-1 §9 describe el claim restringido como «rollback RB-1/RB-2» manejado por la arquitectura. Ambas formulaciones reducen el alcance ratificado (S2 R-04/R-05). Bajo D-RB-01 A, la opción C de A-02 queda **sin objeto** y RB-1/RB-2 es violación prohibida, no escenario permitido. La incompatibilidad es **corregible por regla de lectura** (S2 §5), pero ACA-1 por sí sola no la corrige: un lector de ACA-1 sin S2 obtiene una moratoria de alcance indebidamente estrecho |
| **D-RB-02 A** (solo el propietario ordena/autoriza, con declaración fuera del ámbito) | **COMPATIBLE** (documental; canal no seleccionado) | ACA-1 REC exige atestación del propietario fuera de banda (§2.6 paso 6) y registro externo de la atestación; el registro externo (D-RB-09) es su forma verificable. ACA-1 no confunde ordenar/autorizar con ejecutar materialmente: los pasos materiales de REC los ejecutan MED/SUP/D2 **bajo** atestación. Pendiente: canal y formato de la declaración (S3 G-08) |
| **D-RB-03 A** (atomicidad exigida) | **NO DEMOSTRADO** | ACA-1 no aporta un mecanismo de restauración atómica por alcance: aporta **detección** de algunos sesgos por desacuerdo de GEN (CE-10, §3.6) y declara que un sesgo autoconsistente no se detecta. Detectar un parcial no es garantizar atomicidad, y verificar atomicidad exige un testigo fuera del alcance revertido (especificación de rollback §4.1) que ACA-1 no realiza (ver D-RB-04). Bajo la moratoria, la exigencia está en suspenso; su mecanismo sigue sin existir |
| **D-RB-04 A** (ancla monotónica externa) | **NO DEMOSTRADO** | ACA-1 **no realiza** el ancla: la remite a un cambio de modelo (A-08 opción B, §8/§9) y recomienda ahora la opción A (contención por política). GEN no es el ancla (ACA-1 §1.3: «No es un epoch de autoridad», C4); WIT-local es un segundo dominio **en el dispositivo** sin independencia de restore verificada (CE-14/S-4); WIT-propietario es el registro humano de D-RB-09, del que S2/S3 (C-02) establecen que **no está establecido que cuente** como ancla monotónica verificable por máquina. El requisito ratificado («la detección se hará por ancla externa») queda sin mecanismo: ACA-1 lo difiere, no lo satisface |
| **D-RB-05 A** (matriz P05-C por alcance) | **COMPATIBLE** (política de diseño; reconciliación inexistente) | La máquina de estados de ACA-1 (§2.1: NORMAL/BLOCKED/QRT/REC, sin transiciones automáticas fuera de BLOCKED, MED muerto = BLOCKED) implementa la matriz como política: BLOCKED en todos los casos; solo varía qué reconciliación podría levantarlo. Hoy **ninguna** reconciliación existe (F14/E8, S3 G-07/B-02): la compatibilidad es de la respuesta, no de la salida del BLOCKED |
| **D-RB-06 C** (sin sesiones/descriptores vivos al iniciar rollback) | **NO DEMOSTRADO** | El procedimiento SUP de ACA-1 (§2.5: cerrar admisión → SIGSTOP → verificar poseedores por `/proc` → SIGKILL → verificar grupo vacío → nueva generación) es el mecanismo propuesto para terminar sesiones, pero ACA-1 misma lo clasifica **condicional** (C-1) y registra dos contraejemplos abiertos contra él: CE-12 (escape del grupo por `setsid`/doble fork → verificación de quiescencia con falso positivo) y CE-13 (syscall en vuelo que aterriza tras la verificación). La quiescencia que D-RB-06 C exige como precondición **no es demostrable** con ese procedimiento bajo R1 (ACA-1 I-4/I-6). Bajo la moratoria la regla está subsumida; como mecanismo futuro, no está demostrado |
| **D-RB-07 A** (AUTH no se revierte) | **COMPATIBLE** (prohibición; enforcement imposible sin ancla) | ACA-1 nunca propone revertir AUTH ni re-emitir credenciales tras rollback: los leases se consumen con doble registro AUTH+WIT antes del efecto (§2.3 paso 3) y la recuperación de AUTH corrupta no tiene vía en el diseño, que es exactamente el coste declarado de la prohibición. La compatibilidad es normativa; el **enforcement** frente a un restore RB-3/RB-4 no declarado es imposible con información local (ACA-1 I-2), por lo que la prohibición descansa en moratoria + ancla pendiente, no en mecanismo |
| **D-RB-08 A** (cuarentena + verificación) | **COMPATIBLE** (diseño; predicados sin definir) | El componente QRT de ACA-1 (§1.3, §2.6 paso 3) conserva el estado sospechoso sin auto-activarlo (C09) y REC es el único camino de salida. Pendiente, y no menor: **qué se verifica** en cuarentena (integridad, coherencia RES↔COORD↔AUTH, vigencia) no está definido en ACA-1 ni en S2/S3 (G-07). La exigencia está cubierta por diseño; el procedimiento de verificación, no |
| **D-RB-09 A** (registro externo) | **COMPATIBLE** (documental; canal sin especificar) | ACA-1 prevé el registro externo en tres puntos: bloqueo (§2.4 paso 3), revocación (§2.5 paso 6) y atestación de REC (§2.6 paso 6, «registrada en el registro externo»), además de la variante WIT-propietario (A-07). El canal, formato y custodio no están especificados (S3 G-08), y el registro **no** se cuenta aquí como ancla de D-RB-04 A (ver esa celda) |

**Resumen de la matriz:** 5 COMPATIBLE (D-RB-02, 05, 07, 08, 09 — todas con
mecanismo o procedimiento pendiente), 3 NO DEMOSTRADO (D-RB-03, 04, 06),
1 INCOMPATIBLE de texto (D-RB-01, corregible solo por la regla de lectura
de S2). Ninguna celda declara la ratificación satisfecha técnicamente: una
decisión fija un requisito; la demostración exige realización + verificación.

---

## 3. Matriz ACA-1 × O1–O9

Las obligaciones son las de S7. «Estado ACA-1» cita ACA-1 §6; el veredicto de
esta evaluación aplica las ratificaciones vigentes (en particular D-RB-04 A
y la corrección de alcance) y distingue la pata de terminación/crash de la
pata de rollback.

| Obligación | Estado según ACA-1 §6 | Veredicto | Justificación |
|---|---|---|---|
| **O1** — BLOCKED sobrevive a la terminación del proceso dueño | SATISFECHO POR DISEÑO (terminación); CONDICIONAL (rollback) | **NO DEMOSTRADO** | La pata de terminación es COMPATIBLE por diseño (fail-closed: sin MED vivo y sin evidencia positiva no hay admisión; el bloqueo no depende de un registro que deba sobrevivir). La pata de rollback no: tras un RB-3/RB-4 no declarado, el rollback no se detecta (I-5) y por tanto el BLOCKED ni siquiera puede declararse. D-RB-04 A exige el ancla que lo haría detectable; no existe. La obligación completa (S7: «Prueba de crash/cierre abrupto y nueva invocación independiente») además exige evidencia de ejecución que no hay |
| **O2** — La nueva invocación descubre el estado anterior sin inferirlo por PID/edad/ausencia | CONDICIONAL (C-4) | **NO DEMOSTRADO** | ACA-1 descubre por GEN cruzada + registro externo, nunca por PID/edad/ausencia: compatible en método. Pero el descubrimiento solo funciona para RB-1/RB-2 (desacuerdo entre copias) o rollback declarado; para RB-3/RB-4 autoconsistente no hay nada que descubrir desde dentro. Sin ancla realizada, O2 queda demostrada a lo sumo para la mitad detectable de las violaciones |
| **O3** — El estado de coordinación tiene identidad estable | CONDICIONAL (C-3) | **NO DEMOSTRADO** | IDN (dirfd/`openat`, `(st_dev, st_ino, GEN, hash, nlink)`, R-OBJ/R-NAME por separado, re-validación en cada mutación) es un diseño de identidad **en vida del proceso**. Depende de S-1 (primitivas disponibles en el Node de Termux del POCO), sin verificar (O8 UNKNOWN). Post-crash/post-restore, ACA-1 misma declara la identidad UNKNOWN por defecto y la remite a atestación (I-3): eso es un procedimiento seguro, no identidad estable demostrada |
| **O4** — Release/cleanup solo afecta el objeto adquirido | CONDICIONAL (C-3) | **NO DEMOSTRADO** | El cleanup condicionado al descriptor (`unlinkat` sobre `dirfd`, re-validación inmediata antes de la syscall destructiva, §2.3 paso 4) es [PROPUESTA] con disponibilidad de la primitiva en [SUPUESTO]. Además, ACA-1 declara que la escritura RAW por path solo se **detecta**, no se impide (§1.4.1, I-1): un objeto sustituto manipulado por un writer RAW no está protegido por MED. En el código vigente la obligación está NOT SATISFIED (token→`rm(path)` no atómico, S12); ACA-1 no la ha demostrado en ningún nivel |
| **O5** — No existe readmisión por pérdida, sustitución, ilegibilidad o desaparición | SATISFECHO POR DISEÑO (pérdida/ilegibilidad/desaparición); CONDICIONAL (sustitución) | **NO DEMOSTRADO** (sustitución) | La mitad fail-closed es COMPATIBLE por diseño: pérdida/ilegibilidad/desaparición → BLOCKED sin readmisión (coherente con P05-C y con E5/E6). La mitad de sustitución se divide: sustitución con atributos distintos se detecta (IDN, D-5); sustitución con **atributos idénticos** es indetectable (I-3) y solo se contiene por QRT+REC. Como la obligación S7 exige la matriz completa de errores/ausencia/tipo inesperado **con competidor en proceso separado** (E7), y nada de eso está ejecutado, la celda global es NO DEMOSTRADO |
| **O6** — El estado solo se reclasifica mediante procedimiento aprobado | SATISFECHO POR DISEÑO | **COMPATIBLE** (arquitectura; procedimiento sin aprobar) | La máquina de estados (§2.1) no tiene transiciones automáticas fuera de BLOCKED/QRT y solo REC reclasifica, con predicados + atestación + registro. ACA-1 misma acota: «el procedimiento REC concreto requiere aprobación, A-06». La compatibilidad es de la arquitectura de estados; el procedimiento aprobado que S7 exige («Predicados explícitos, autoridad, evidencia y registro verificable») es REC, que sigue [PROPUESTA] |
| **O7** — Todo caller/writer cubierto respeta la frontera | CONDICIONAL (C-7) | **NO DEMOSTRADO** | ACA-1 (§2.2) corrige la brecha pre-read de P09 (admisión antes del primer I/O) **para clientes COVERED**. Pero: (a) P09 sigue OPEN/UNKNOWN y el universo declarado ratificado el 9-Nov no está referenciado en las fuentes (§0.4); (b) las APIs path-based actuales (`continuity-queries.mjs`, `chronicle-append.mjs`, factories/owner importables) siguen existiendo sin conversión (S9/S10 §7: autoridad no demostrada); (c) P01-B=C deja el launcher sin seleccionar y E2/E3 PARTIAL deja el control de launchers/writers sin demostrar en una ventana real; (d) los escritores RAW están fuera de la frontera por diseño (§1.4.1). Dentro del universo declarado, O7 es el objetivo de ACA-1; hoy está sin cerrar por los cuatro frentes |
| **O8** — La garantía corresponde al entorno R1 real | UNKNOWN | **NO DEMOSTRADO** | ACA-1 no presupone un entorno distinto de R1, pero la correspondencia no está verificada: sin fingerprint del target (POCO X7 Pro / Termux / Node) y sin verificar S-1–S-4, ACA-1 declara que su veredicto caería a INVIABLE incluso para el claim restringido si S-1/S-2/S-3 resultan falsas. Esta evaluación no ejecutó nada en el dispositivo, por encargo |
| **O9** — Persistencia de negocio y estado de admisión no se confunden | SATISFECHO POR DISEÑO | **COMPATIBLE** (diseño) | Resultados en dos dimensiones separadas en MED (§2.3 paso 5), sin retry de negocio ante release incierto, con oráculos separados previstos (E1/E2/E9). Es la celda más limpia de ACA-1 y coincide con el invariante ratificado de P05-C. El código vigente ya separa parcialmente `persistenceStatus`/`lockRelease` (S12: PARTIAL); ACA-1 lo lleva al diseño sin demostrarlo en ejecución |

**Resumen:** 2 COMPATIBLE (O6 arquitectura, O9 diseño), 7 NO DEMOSTRADO.
Ninguna obligación queda demostrada: las ratificaciones no demuestran
obligaciones (S2 §8.1) y ACA-1 no está implementada ni ejecutada.

---

## 4. Matriz ACA-1 × oráculos bloqueantes de P07 V2.3

Alcance: los oráculos cuyo resultado condiciona P07-C — P07-05, P07-06,
P07-16, P07-18b, P07-19 y P07-21 — más la regla transversal de PASS (S6 §7)
y, por su conexión directa con IDN, P07-02/P07-15 en una fila de apoyo.
En todos los casos rige la taxonomía S5 §5: `harness_verdict`,
`result_class` (una sola clase) y `product_state` se registran siempre, y
`PASS_GATE` exige gate completo con `gate_basis` y evidencia.

| Oráculo | Qué exige V2.3 (síntesis) | Qué aporta ACA-1 | Veredicto |
|---|---|---|---|
| **P07-05** (sustitución entre check y cleanup) | Seam interno entre última verificación y syscall destructiva; COVERED y RAW en subcasos separados; RAW = PASS_CARAC, nunca enforcement; SERIALIZATION solo si el gate sigue incompleto | D-8: re-validación + `unlinkat` condicionado al descriptor (§2.3 paso 4) | **NO DEMOSTRADO.** El diseño apunta al seam correcto, pero la primitiva es [SUPUESTO] (S-1), no hay seam real instrumentado ni intercalación ejecutada, y el subcaso RAW queda fuera de la frontera por diseño. A lo sumo, una futura ejecución sobre COVERED podría aspirar a SERIALIZATION; hoy no hay ni `harness_verdict` |
| **P07-06** (owner-write falla + path sustituido) | Matriz cutpoint × handler (fd/no-fd/foreign-fd) × clase de actor; SERIALIZATION o RETENTION_VERIFIED; PASS_GATE solo con atribución y contrato completos | MED ejecuta cleanup con fd retenido y re-verificación en aceptación; los clientes no conservan fd | **NO DEMOSTRADO.** ACA-1 elimina el handler por-path del diseño nominal (los clientes no abren RES), lo que es la dirección correcta; pero la matriz cutpoint×handler×actor no está diseñada oráculo por oráculo en ACA-1, el handler fd/no-fd/foreign-fd no está especificado al nivel que S6 exige, y la atribución completa depende de P07-A (sin decidir) |
| **P07-16** (raíz: R-OBJ / R-NAME) | Registrar `root_claim` (R-OBJ, R-NAME o BOTH) por subcaso; dirfd que sigue refiriendo RT-A **no** satisface R-NAME; detección+STOP sin tocar RT-B = `PASS/DETECTION_ONLY/STOP`, **no** PASS_GATE; SERIALIZATION solo con cobertura P09 + modelo ratificado + gate completo | IDN re-valida `fstat(fd)` (R-OBJ) y `stat(path)` (R-NAME) por separado en cada mutación (§1.3, §2.2 paso 3); divergencia → BLOCKED+QRT | **NO DEMOSTRADO.** ACA-1 respeta la separación R-OBJ/R-NAME en el diseño (compatible en método), pero: (a) no declara `root_claim` por subcaso ni fija `actor_B_class` antes de ejecutar ningún escenario; (b) su resultado ante divergencia es detención+BLOCKED, es decir `DETECTION_ONLY` en el mejor caso futuro, nunca PASS_GATE por sí solo (S5 §2 lo prohíbe expresamente para P07-16); (c) la serialización que podría contribuir al gate exige P09 cerrado y fingerprint, ambos ausentes |
| **P07-18b** (rename que desplaza destino) | Centinela B con fd retenido, hash, identidad, nombre y nlink baseline; rename normal y RENAME_NOREPLACE en subcasos distintos; rename normal que desplaza el centinela = FAIL de protección sin autoridad | ACA-1 no trata el rename de destino como operación del diseño: MED escribe con su fd retenido y no re-resuelve el path al escribir (§2.3 paso 4) | **NO DEMOSTRADO.** Que MED no re-resuelva el path reduce una vía de afectación para clientes COVERED, pero ACA-1 no especifica el oráculo P07-18b (centinela, baseline, subcasos rename/NOREPLACE, actor B) ni qué ocurre con un rename ejecutado por un writer RAW sobre el namespace de RES. Sin oráculo diseñado, no hay celda demostrable |
| **P07-19** (temporal y seam de cleanup) | Identificar A-temp, Library-temp, B-sentinel y cleanup owner; intercalación después del fallo real y antes de la syscall destructiva exacta; si el punto no es observable, UNKNOWN/INVALID, nunca PASS_GATE | D-8 + §2.3 paso 4 (cleanup condicionado); QRT conserva el estado sospechoso | **NO DEMOSTRADO.** ACA-1 no distingue A-temp/Library-temp/B-sentinel ni nombra el cleanup owner del código vigente (que en S12 sigue eliminando por path tras escaneo). El seam exacto fallo→sustitución→cleanup no está especificado en ACA-1 al nivel de S6 §5, y sin seam observable el oráculo es UNKNOWN/INVALID por definición |
| **P07-21** (hardlinks y nlink) | Oráculo separado: supervivencia de n1 y de n2, identidad por nombre y por fd, contenido/hash por fd, `nlink` antes/después, operación que produjo el delta; en Caso B, eliminar n1 ajeno es FAIL aunque n2 sobreviva (decremento de nlink = afectación al namespace de B) | IDN controla `nlink` en la re-validación (§1.3) y D-5 reclama detección de sustitución con atributos distintos | **NO DEMOSTRADO.** «Controlar nlink» no es el oráculo P07-21: ACA-1 no especifica el registro separado n1/n2/fd/nlink ni la regla de Caso B (un decremento de nlink sobre nombre ajeno no debe ocultarse bajo «n2 sigue intacto»). Además S5 §10 prohíbe usar `nlink` aislado como identidad o autorización, que es el uso que un control genérico de nlink invitaría a hacer |
| **Regla transversal (S6 §7)** | Ningún escenario declara PASS_GATE solo por detectar, detenerse, retener residuo, preservar el fd, conservar n2, observar una feature disponible, ejecutar solo el harness, ejecutar solo COVERED cuando el claim incluye RAW, o sin clase de actor fijada previamente. Escenario no ejecutado nunca es PASS | ACA-1 no ejecuta ningún escenario y su claim restringido excluye RAW | **NO DEMOSTRADO** (y PASS_GATE prohibido en el estado actual). ACA-1 es honesta en este punto (§1.1 principio 3: detección ≠ prevención; §4.1: «nada de esto está demostrado hoy»), pero la honestidad no sustituye la evidencia |
| Apoyo: **P07-02 / P07-15** | P07-02: cero interleavings = UNKNOWN; no fusionar covered/raw. P07-15: `fstat(fd)` y `stat(path)` describen referentes distintos | IDN los registra por separado (§2.2 paso 3) | **NO DEMOSTRADO** (método compatible, sin ejecución ni fijación previa de actor B) |

**Resumen:** 0 oráculos bloqueantes demostrados; 8 celdas NO DEMOSTRADO.
La distancia no es de intención —ACA-1 apunta a los seams correctos— sino de
especificación oráculo por oráculo, de fijación previa de actor B, de
primitivas sin verificar y de ejecución inexistente.

---

## 5. Contradicciones entre ACA-1 y las ratificaciones

Se listan solo contradicciones reales (texto de ACA-1 contra texto ratificado,
o presuposición de ACA-1 contra decisión vigente). Las tensiones ya resueltas
por interpretación fiel en S2 (C-01–C-03) no se repiten como
contradicciones nuevas; se cita su resolución.

| # | Contradicción | Evidencia | ¿Resoluble sin nueva decisión? |
|---|---|---|---|
| K-01 | **Alcance de la moratoria.** ACA-1 presenta la moratoria como RB-3/RB-4 (título de A-02) y ofrece «Solo RB-1 admitido» (opción C); D-RB-01 A prohíbe los cuatro alcances y no deja vía futura implícita | ACA-1 §8 A-02, §9; S2 R-04/R-05 | **Sí, por regla de lectura** (S2 §5 ya la registra): la opción C de A-02 queda sin objeto y RB-1/RB-2 se relee como violación detectable. Pero la corrección no está **en** ACA-1: cualquier uso de ACA-1 sin S2 reintroduce la contradicción. Brecha documental mínima: §11 brecha 2 |
| K-02 | **Ancla: requisito ratificado vs cambio de modelo.** D-RB-04 A exige el ancla como mecanismo de detección requerido; ACA-1 la trata exclusivamente como cambio de modelo (A-08 B) y recomienda no adoptarla ahora | S2 §4.4 / S3 C-02; ACA-1 §8 A-08, §9 | **Sí, por la distinción requisito/mecanismo** (S2 C-02): ratificar el requisito no selecciona la forma ni decide el encaje en R1. Lo que no queda resuelto es la **realización**: ACA-1 no la aporta y D-RB-04 A la exige. No es una contradicción lógica; es el hueco central entre ACA-1 y las ratificaciones |
| K-03 | **Launcher/supervisión.** P01-B=C: no seleccionar launcher. ACA-1 presupone un supervisor persistente que arranca MED, lo reinicia y lidera un grupo de procesos (§1.3 SUP, §2.5, CE-16), sin nombrar launcher | ACA-1 §1.3/§2.5; protocolo del equipo IA (P01-B=C) | **Parcialmente.** ACA-1 no *selecciona* un launcher (no contradice la letra de P01-B=C: el lanzamiento manual foreground de R1 puede alojar a SUP dentro de la sesión). Pero el ciclo de vida que SUP necesita (supervivencia, reinicio de MED, control del grupo) es un mecanismo de supervisión no seleccionado y, con E2/E3 PARTIAL, no demostrado en una ventana real. La contradicción es de **presuposición**, no de selección: ACA-1 asume como dado lo que P01-B=C deja sin elegir |
| K-04 | **Root→stores (P08).** P08 está decidida (encargo), pero ACA-1 no especifica ningún resolver root→stores: habla de RES/COORD/AUTH como conjuntos, sin fijar root, mapping ni la separación Chronicle init/append que P08 exige como contrato objetivo | ACA-1 §1.3 (RES/COORD/AUTH sin mapping); S8 §§2–3, 5 | **No evaluable** hasta referenciar el contenido decidido (§0.4). No se pide re-ratificar el mapping: se pide registrar qué se decidió. Mientras tanto, ACA-1×P08 = NO DEMOSTRADO y O7 no puede cerrarse, porque sin mapping único no hay dominio canónico de admisión que MED pueda custodiar (S8 §2) |
| K-05 | **Cobertura (P09).** ACA-1 declara su frontera completa solo «con P09 cerrado» (C-7, A-05) y a la vez diseña MED como frontera única sobre APIs que hoy son path-based e importables sin barrera | ACA-1 §1.4, §4.2 C-7, §8 A-05; S9 §3, S10 §7 | **No es contradicción lógica** (ACA-1 es honesta: RAW fuera del claim), pero sí una **incompatibilidad de estado**: el universo declarado está ratificado como alcance (encargo) y ACA-1 exige además la conversión de las APIs path-based y fixtures de bypass que no existen. El claim restringido de ACA-1 (solo COVERED del universo declarado) es compatible con «no pedir cobertura universal»; el cierre de O7 dentro de ese universo sigue sin demostrarse |
| K-06 | **Quiescencia (D-RB-06 C).** ACA-1 ofrece SUP como procedimiento de terminación verificada de sesiones y simultáneamente registra CE-12/CE-13, que lo rompen | ACA-1 §2.5 vs §7 CE-12/CE-13, §4.2 C-1 | **No resoluble dentro de R1** (ACA-1 I-4/I-6 lo declara imposible sin mediación de kernel). Es coherencia interna honesta, no contradicción retórica: el diseño nombra su propia refutación parcial. Frente a D-RB-06 C, el resultado es NO DEMOSTRADO, no INCOMPATIBLE, porque ACA-1 no afirma haber demostrado la quiescencia |

**Lo que no es contradicción** (para no inflar el registro): que ACA-1
recomiende A-08 opción A «ahora» y B «después» no contradice D-RB-04 A
(ver K-02); que GEN no sea un epoch no contradice nada (ACA-1 lo declara
explícitamente, C4); que REC confíe en el propietario no contradice
D-RB-02 A (es su consecuencia).

---

## 6. Supuestos de ACA-1 sin evidencia

ACA-1 §5.1 lista S-1–S-6 como [SUPUESTO]. Esta evaluación los confirma y
añade los supuestos implícitos que las ratificaciones vigentes hacen
visibles. «Sin evidencia» significa: no verificado en las fuentes
consultadas para este delta; no significa falso.

| Abst. | Supuesto | Depende de él | Estado de evidencia |
|---|---|---|---|
| S-1 | `openat`/`openat2`, `dirfd`, `unlinkat`, locks OFD y `/proc/PID/fd` disponibles y con semántica Linux estándar en el Node de Termux del POCO X7 Pro | IDN, D-8, C-3, verificación de poseedores (C-1) | **Sin evidencia del target** (O8 UNKNOWN). ACA-1: si S-1 es falsa, IDN degrada a check/use por path, insuficiente |
| S-2 | Un supervisor puede liderar grupo de procesos y SIGSTOP/SIGKILL a todo el grupo en Termux/Android; los procesos no escapan por defecto | Revocación (C-1, G-2) | **Sin evidencia**; CE-12 describe el escape (`setsid`/doble fork) como vía concreta |
| S-3 | IPC por socket Unix entre MED y clientes funciona en el sandbox Termux | Toda la mediación (G-4) | **Sin evidencia**; ACA-1 advierte que la alternativa (MED como biblioteca en proceso) destruiría la separación mediador/cliente y exigiría rediseño, no una asunción |
| S-4 | Los dos dominios de WIT tienen comportamiento de restore independiente | WIT (C-5) | **Sin evidencia**; CE-14 (backup integral del dispositivo) es el contraejemplo directo. Sin S-4, WIT-local se descarta y solo queda WIT-propietario |
| S-5 | El propietario puede lanzar la sesión, ejecutar la revocación y atestar fuera de banda de forma fiable | SUP, REC (C-6) | Capacidad humana/procedimental: se verifica por el procedimiento, no por test. Sin procedimiento aprobado (REC es [PROPUESTA]), S-5 no está ejercitada |
| S-6 | Los clientes legítimos pueden reescribirse para no abrir RES directamente (P09 cerrable para el universo declarado) | G-4, C-7 | **Sin evidencia**: las APIs path-based siguen importables (S9/S10); la conversión es trabajo futuro autorizado por separado |
| S-7 (nuevo en esta evaluación) | El contenido del mapping P08 decidido el 9-Nov y el del universo P09 declarado ratificado el 9-Nov son referenciables y compatibles con un único dominio de admisión custodiado por MED | O7, K-04, K-05 | **Sin evidencia en las fuentes consultadas** (§0.4): las decisiones existen por encargo; su contenido no se localizó. No se pide re-decidir: se pide referenciar |
| S-8 (nuevo) | Existe una forma de ancla externa monótona compatible con R1 (o el propietario aceptará el cambio de modelo que la aloje) | D-RB-04 A, O1/O2 (rollback), I-2/I-5 | **Sin evidencia**: ninguna forma está seleccionada (S3 G-01). ACA-1 no propone ninguna; esta evaluación tampoco la inventa |
| S-9 (nuevo) | A-03 puede resolverse con evidencia específica sobre HOME de Termux (desactivar/declarar el backup del SO) | Enforcement de la moratoria frente al SO (S3 G-02/G-03, B-01) | **UNKNOWN/PENDING** por instrucción expresa; sin evidencia específica en las fuentes |

---

## 7. ¿Puede ACA-1 alcanzar `PASS_GATE` dentro de R1 y del universo P09 ratificado?

**No.** Determinación: ACA-1, tal como está documentada, **no puede
alcanzar `PASS_GATE`** ni para P07-C ni para el conjunto P05/P07, dentro de
R1 y del universo P09 declarado. Razones, en orden de bloqueo:

1. **La regla de gate lo prohíbe en el estado actual.** S5 §2: `PASS_GATE`
   solo cuando el requisito del gate queda demostrado dentro de su alcance,
   con oráculo completo, controles válidos, fingerprint, cobertura de
   actores/writers y dependencias cerradas. ACA-1 no tiene harness, no
   tiene ejecución, no tiene fingerprint (O8 UNKNOWN), no tiene cobertura
   de writers cerrada (O7 NO DEMOSTRADO) y tiene dependencias abiertas
   (P07-A, ancla, REC). Un STOP seguro o una detección segura **no bastan**
   (S5 §2, S6 §7): es exactamente lo que ACA-1 produciría en el mejor caso.
2. **Las imposibilidades I-1–I-7 bloquean el claim universal dentro de R1.**
   I-1 (mutación por fd directo sin punto de aceptación), I-2 (single-use
   bajo RB-3/RB-4 no declarado), I-3 (identidad post-restore por atributos
   descriptivos), I-4 (retirar syscall en vuelo), I-5 (detectar rollback
   total autoconsistente sin testigo externo), I-6 (enumeración completa de
   poseedores), I-7 (anti-rollback con información puramente local). Cada
   una nombra en ACA-1 la decisión que la cambiaría (A-08 modelo nuevo, A-06
   criterio de identidad, A-05 universo cerrado); ninguna de esas
   decisiones está tomada en la forma que haría demostrable la propiedad.
3. **El claim restringido no es el gate ratificado.** ACA-1 §9 declara
   viable un claim restringido (escritores COVERED bajo SUP, detección de
   violaciones RB-1/RB-2, recuperación mediada por el propietario). Ese
   claim restringido es una **propuesta** cuya aceptación es A-08 opción A,
   sin decidir (S2 §6: 1 de 3 condiciones de estabilidad). Una arquitectura
   no redefine por sí sola el alcance de P07-C: el gate ratificado es el
   de V2.3, y dentro de él la serialización de COVERED solo contribuye a
   `PASS_GATE` «si el contrato ratificado establece que esos participantes
   y operaciones constituyen el alcance completo del claim» (S5 §5.2) —
   establecimiento que no consta.
4. **El universo P09 ratificado acota, no cierra.** Que el alcance sea el
   universo declarado (y no universal) elimina la exigencia imposible de
   cobertura universal — ACA-1 ya lo asumía al excluir RAW del claim —,
   pero dentro del universo declarado siguen faltando: referencia del
   contenido decidido (§0.4), conversión de APIs path-based / admisión
   pre-read (fila 6 de la matriz P09: FAIL / NOT IMPLEMENTED), fixtures
   negativos por clase de loader (S10 S1/S4 PARTIAL) y la clasificación de
   consumidores contra el universo (S10 S8: UNKNOWN / OUTSIDE DECLARED
   UNIVERSE hasta referenciar el contenido).
5. **R1 acota el modelo, no demuestra el entorno.** R1 aceptado + E2/E3
   PARTIAL significa que el límite de actores está aceptado y el control
   real de launchers/writers en una ventana concreta sigue sin demostrar.
   `PASS_GATE` exige cobertura de actores/writers (S5 §2): con E2/E3
   abiertos y P01-B=C (launcher no seleccionado), esa cobertura no existe
   ni siquiera para el universo declarado.

**Matiz de honestidad:** la respuesta «no» es sobre ACA-1 **tal como está
documentada y con las ratificaciones vigentes**. No es una demostración de
que ningún `PASS_GATE` restringido sea alcanzable en el futuro: el camino
ordinario (propuestas → decisiones → fingerprint → cierre P09 en el
universo declarado → harness con oráculos V2.3 sobre SHA congelado) sigue
abierto y está ordenado en §11. Lo que esta evaluación descarta es el
atajo: ningún `PASS_GATE` se alcanza por documentación, por diseño
fail-closed o por detección.

---

## 8. Clasificación de requisitos

| Clase | Requisitos | Detalle |
|---|---|---|
| **Satisfechos por diseño** (compatibilidad documental; sin demostración) | O9 (separación negocio/release); O6 en su arquitectura de estados (solo REC reclasifica); pata de terminación de O1 (fail-closed sin MED); pata pérdida/ilegibilidad/desaparición de O5; matriz de respuesta D-RB-05 A como política; cuarentena D-RB-08 A como componente; registro D-RB-09 A como puntos de registro previstos; separación R-OBJ/R-NAME en el método IDN; admisión pre-read para COVERED en el flujo §2.2 | «Por diseño» = ACA-1 provee un mecanismo cuya corrección **podría** comprobarse (ACA-1 §4.1). Nada está implementado ni ejecutado |
| **Necesitan mecanismo** (diseñados como [PROPUESTA] o sin diseñar) | Ancla externa D-RB-04 A (sin forma seleccionada); atomicidad D-RB-03 A; terminación verificada de sesiones D-RB-06 C (SUP, con CE-12/CE-13); cleanup condicionado al descriptor O4/D-8 (primitiva en supuesto); verificación en cuarentena D-RB-08 A (predicados sin definir); canal/formato/custodio del registro D-RB-09 A; conversión de APIs path-based y admisión pre-read (P03/P04, fila 6 P09); resolver root→stores P08 contra el mapping decidido | Ninguno de estos mecanismos está seleccionado como [RATIFICADO] salvo el requisito normativo que lo exige (ancla, atomicidad, cuarentena, registro) |
| **Necesitan evidencia del target** | O8 / S-1–S-4 (primitivas, grupos de procesos, IPC, independencia de WIT); A-03 (¿restaura Android backup el HOME de Termux?); E2/E3 en una ventana R1 delimitada (control sostenido de escritores y relanzadores); comportamiento real de S-2/S-3 en el POCO | Toda comprobación en el dispositivo requiere autorización específica del propietario cuando se proponga; esta evaluación no ejecutó nada |
| **Requieren futura decisión del propietario** (con propuesta ya existente en ACA-1 §8 / rollback §7; ninguna se solicita aquí) | A-01 (autorizar MED+SUP); A-04 (atestación como raíz de REC); A-05 (cierre de P09 para el universo declarado); A-06 (criterio de identidad P07-A + re-identificación); A-07 (diseño del testigo); A-08 (contención por política vs cambio de modelo); forma del ancla D-RB-04 A + su encaje en R1; canal del registro D-RB-09 A; A-03 (tras evidencia); A-09 (implementación, solo al final) | Cada una debe presentarse con la propuesta, sus alternativas y sus consecuencias antes de pedirse (ACA-1 §8 ya lo hace para A-01–A-09). **No** se pide re-ratificar el mapping P08 ni cobertura universal P09: lo que falta ahí es referencia del contenido decidido (§0.4) |

---

## 9. Qué propiedad falla exactamente (sin inventar primitivas alternativas)

ACA-1 no es viable para las propiedades siguientes. En cada caso se indica
la propiedad que falla, por qué falla bajo R1 + ratificaciones vigentes, y
qué ratificación queda sin satisfacer. No se propone ninguna primitiva
alternativa: donde ACA-1 remite a una decisión de modelo (A-08), esta
evaluación solo registra la remisión.

| Propiedad que falla | Por qué falla (demostración resumida) | Ratificación / obligación afectada |
|---|---|---|
| **Prevención de la mutación por fd directo** (I-1) | Una `write(2)` sobre un fd ya abierto no pasa por ningún punto de aceptación de MED; el kernel no revoca el fd al cambiar la generación (falsación CE-1(b)). ACA-1 solo detecta el efecto después (hash/GEN → BLOCKED) | O4/O7 en su lectura universal; P07-05/P07-06 subcaso RAW (V2.3: RAW nunca prueba enforcement). Dentro del universo declarado, la propiedad exigible es la contención de los writers **del universo**; ACA-1 la deja en detección |
| **Single-use de release bajo RB-3/RB-4 no declarado** (I-2) | El registro de consumo (AUTH+WIT) vive dentro del ámbito restaurable; el restore lo borra y el replay es indistinguible de un primer uso (CE-5; M0.55: la revisión local no prueba monotonicidad durable ante restore) | D-RB-07 A (enforcement), D-RB-04 A (sin ancla no hay detección), O1/O2 (pata rollback), E1/E2 |
| **Detección de rollback total autoconsistente sin testigo externo** (I-5) | El estado restaurado es idéntico a un estado legítimo pasado; ninguna comprobación interna distingue ambos (especificación de rollback §3.3/§3.4). GEN cruzada acuerda falsamente si las cuatro copias se revirtieron juntas | D-RB-04 A (el ancla es la única vía ratificada), D-RB-01 A (la moratoria es inenforzable frente a un rollback no declarado: S3 B-01), O2 |
| **Identidad post-restore como demostración técnica** (I-3) | Cada atributo descriptivo (dev, ino, hash, nlink, nombre) es reutilizable o copiable; el criterio de qué cuenta como «el mismo objeto» (P07-A) está sin decidir (CE-7). ACA-1 lo convierte en procedimiento (BLOCKED + atestación), no en prueba | O3/O5 (sustitución con atributos idénticos), P07-16/P07-21 (ningún PASS_GATE de identidad), D-RB-08 A en su pata de verificación (qué se verifica incluye vigencia, que la atestación decide sin demostrar) |
| **Retiro de una mutación en vuelo** (I-4) | La syscall ya entrada en el kernel no puede retirarse desde espacio de usuario; SIGSTOP reduce la ventana, no la elimina (CE-9/CE-13) | D-RB-06 C (la precondición «sin operaciones en curso» no es verificable en sentido fuerte), O5/E7 en la ventana de revocación |
| **Enumeración completa de poseedores de capacidad** (I-6) | Los fd se heredan y transfieren por canales no observables desde el registro de admisión (fork/exec/`SCM_RIGHTS`/`dup`); la inspección de `/proc` tiene carreras (CE-11/CE-12) | O7, E2/E3 (control de writers), D-RB-06 C |
| **Anti-rollback con información puramente local** (I-7) | Toda información local puede restaurarse; es la restricción expresa del encargo de ACA-1 y la conclusión F6/F7 de la especificación de rollback | D-RB-04 A en su totalidad: exige lo externo precisamente porque lo local no basta |
| **Cierre de O7 dentro del universo declarado** | No es una imposibilidad de principio como las anteriores, sino un estado: APIs path-based sin convertir, pre-read sin implementar (fila 6 P09 FAIL), loaders sin fixtures negativos (S10 S1/S4 PARTIAL), consumidores sin clasificar contra un universo cuyo contenido no está referenciado, launcher no seleccionado (P01-B=C) y E2/E3 sin ventana demostrada | O7, P09 (en su alcance acotado ratificado), E2/E3, P01-B=C |

Nota de alcance: las siete primeras son imposibilidades **condicionadas**
(R1 + restore + enforcement en espacio de usuario), no imposibilidades
lógicas universales — la misma calificación que la falsación dio a
CE-1/CE-5/CE-7. La última es una brecha de trabajo, no una imposibilidad.

---

## 10. Veredicto final

**PARTIAL — BRECHAS IDENTIFICADAS**

Definiciones aplicadas (solo para esta evaluación):

- **COMPATIBLE — DOCUMENTALMENTE** — ACA-1 satisface simultáneamente todas
  las ratificaciones y obligaciones en el nivel documental exigible, sin
  INCOMPATIBLE ni NO DEMOSTRADO en celdas bloqueantes. **No es el caso:**
  hay 1 INCOMPATIBLE de texto (D-RB-01), 3 NO DEMOSTRADO en D-RB (03, 04,
  06), 7 NO DEMOSTRADO en O1–O9 y 8 NO DEMOSTRADO en oráculos bloqueantes.
- **PARTIAL — BRECHAS IDENTIFICADAS** — ACA-1 es compatible en intención y
  en política de diseño con la mayoría de las ratificaciones (5 de 9 D-RB
  COMPATIBLE documental, O6/O9 por diseño, método R-OBJ/R-NAME correcto),
  pero quedan brechas identificadas y ordenadas (§11) que impiden
  `PASS_GATE` y el avance hacia M0. La única incompatibilidad de texto
  (D-RB-01) se resuelve por la regla de lectura ya registrada en S2, sin
  nueva decisión. **Es el caso.**
- **INCOMPATIBLE — BLOQUEO DEMOSTRADO** — existiría una contradicción que
  la interpretación fiel no puede resolver. **No es el caso:** K-01 se
  resuelve con S2 §5; K-02 con la distinción requisito/mecanismo; K-03 es
  presuposición, no selección; K-04/K-05 son NO DEMOSTRADO por contenido
  no referenciado, no contradicción demostrada.
- **UNKNOWN — EVIDENCIA INSUFICIENTE** — reservado para el caso en que ni
  siquiera las brechas puedan identificarse. **No es el caso:** las brechas
  están identificadas con evidencia exacta; lo insuficiente es la evidencia
  de demostración (mecanismos, target, ejecución), que es precisamente lo
  que «PARTIAL — BRECHAS IDENTIFICADAS» registra.

**Qué significa este veredicto:** ACA-1 sigue siendo [PROPUESTA] viable
solo como arquitectura de claim restringido **condicionada** a decisiones
y evidencias futuras (§11); no es compatible, en su estado documental
actual, con la satisfacción simultánea de las ratificaciones vigentes y
las obligaciones P05/P07. P05 sigue OPEN, P07-C UNKNOWN/BLOCKING, P09
OPEN/UNKNOWN, M0 INCOMPLETO. Ningún PASS se declara.

---

## 11. Conjunto mínimo de brechas que impiden avanzar hacia M0, ordenadas por dependencia

Sin repetir trabajo cerrado (la falsación, la especificación de rollback,
la reconciliación D-RB y el delta P09 no se rehacen; se citan). Cada brecha
indica qué la resuelve y si exige decisión del propietario. Ninguna
decisión se solicita en este documento.

| # | Brecha (dependencia) | Qué la resuelve | ¿Decisión del propietario? |
|---|---|---|---|
| 1 | **Referencia del contenido decidido el 9-Nov** (P08 mapping; universo P09 declarado; registro de P01-B=C) — bloquea K-04, K-05, O7 y cualquier verificación ACA-1×P08/P09 | Trabajo documental de referencia/registro: citar el contenido exacto ya decidido en la rama o en el registro del propietario. **No** es re-ratificar el mapping ni pedir cobertura universal | **No.** Las decisiones ya existen por encargo; falta su referencia verificable |
| 2 | **Regla de lectura de ACA-1** (K-01): ACA-1 sin S2 §5 reintroduce la moratoria estrecha | Corrigendum documental que aplique R-01–R-05 a ACA-1 (A-02 solo con alcance RB-1–RB-4; opción C sin objeto; claim restringido releído como detección de violación). No reescribe los canónicos | **No.** Es interpretación fiel de D-RB-01 A ya ratificada |
| 3 | **Ancla D-RB-04 A + canal del registro D-RB-09 A** (G-01/G-08; K-02; I-2/I-5) — bloquea O1/O2 (rollback), el fin de la moratoria y el enforcement de D-RB-07 A | Propuesta concreta de forma del ancla (ubicación, verificación, coste, encaje en R1) y del canal/formato/custodio del registro, con alternativas y consecuencias; después, decisión sobre esa propuesta | **Sí, en el futuro**, sobre la propuesta. No se solicita ahora y esta evaluación no propone ninguna forma |
| 4 | **Criterio de identidad P07-A + procedimiento de re-identificación y predicados de REC/cuarentena** (A-06; S3 G-07/B-02) — bloquea O3/O5 (sustitución), P07-16/P07-21 y la salida de cualquier BLOCKED | Especificación documental: qué cuenta como mismo objeto (con política de aliases), qué se verifica en cuarentena (integridad, coherencia RES↔COORD↔AUTH, vigencia) y los predicados de REC | **Sí, en el futuro** (A-06), sobre la especificación |
| 5 | **Decisiones de arquitectura A-01 y A-08** (y A-04/A-07 según el diseño del testigo) — bloquean la estabilidad del claim restringido (S2 §6: 1 de 3) | Presentar A-01 (MED+SUP) y A-08 (contención por política vs cambio de modelo) con las opciones y consecuencias ya redactadas en ACA-1 §8 | **Sí, en el futuro.** A-09 (implementación) solo después de 1–8 |
| 6 | **Evidencia del target** (O8; S-1–S-4; A-03) — bloquea IDN, D-8, SUP y WIT | Fingerprint del POCO/Termux/Node y evidencia específica sobre backup/HOME de Termux. Cualquier comprobación en el dispositivo requiere autorización específica cuando se proponga | La **autorización de comprobar** es del propietario en su momento; la evidencia en sí es trabajo preparatorio |
| 7 | **Cierre de P09 dentro del universo declarado + admisión pre-read** (O7; fila 6 P09 FAIL; S10 S1/S4/S6/S8) | Convertir las APIs path-based en superficie interna o exigir contexto admitido en cada export; fixtures negativos por clase de loader; clasificación de consumidores contra el universo referenciado (brecha 1). Implementación solo con autorización separada | A-05 (alcance de cierre) en su momento, sobre el trabajo |
| 8 | **E2/E3 en una ventana R1 delimitada** (control sostenido de escritores y relanzadores; P01-B=C) | Evidencia de una ventana concreta (roster, destino efectivo, mecanismos relevantes clasificados, STOP ante actor no controlado), reutilizando el inventario previo sin repetir el censo genérico | No es una decisión nueva: es evidencia contra el criterio R1 ya aceptado |
| 9 | **Harness y oráculos sobre SHA congelado** (P07-05/06/16/18b/19/21 con `actor_B_class` fijado antes de ejecutar; E1–E9; taxonomía V2.3 completa) | Ejecución autorizada por separado, sobre SHA congelado, con controles válidos y evidencia ligada. Solo aquí podría nacer un `PASS_GATE` — para el alcance que el contrato ratificado defina, no por defecto para el claim universal | La autorización de ejecución es del propietario en su momento |

**Orden de dependencia:** 1 y 2 son documentales e independientes.
3 y 4 son propuestas que preceden a decisiones. 6, 7 y 8 son evidencia y
cierre que preceden a 9. Sin 3 no hay fin de moratoria ni enforcement de
D-RB-07 A; sin 6 no hay IDN ni SUP demostrables; sin 7 y 8 no hay O7 ni
cobertura de actores, y por tanto ningún `PASS_GATE` (S5 §2). A-09
(implementación) queda después de todo lo anterior.

---

**Confirmación explícita:** esta evaluación es solo lectura y trabajo
documental. No se modificó código, tests, workflows, STATUS, PR ni ramas
de producto; no se ejecutaron tests, CI, harness, runtime, bootstrap ni
comandos de dispositivo; no se inventó evidencia ni se convirtió ninguna
propuesta en decisión; no se solicitó ninguna decisión nueva al
propietario (las brechas 3–5 y 7 describen decisiones futuras que deberán
presentarse con propuesta, alternativas y consecuencias); no se
reabrieron las decisiones ratificadas (P08 y P09 se tratan como decididas
con el alcance del encargo, sin pedir re-ratificación del mapping ni
cobertura universal); no se declara M0 completo ni ningún PASS.

---

## Anexo A. Trazabilidad

- Fuentes S1–S12 con hashes en §0.3. ACA-1 se cita por sección (§1–§9) sin
  re-auditar CE-1/CE-5/CE-7; la reconciliación D-RB se cita por §4–§6 y
  S3 por C/G/B; el delta P09 por §2–§10.
- Rama de canónicos: `ncs-continuity-handoff-correction-2026-11-07`,
  HEAD `eee2ae772e5569ffbc90d6334f47c6633f4961fb` (verificado por
  `ls-remote` y clon público de solo lectura, 2026-11-10; clon sin
  modificar).
- Rama de destino: `ncs-m0-architecture-research-2026-11-10`, HEAD
  `ed19e8b3627d5243c70066e0e6c5ba0f916a6d5c` al verificar (la
  reconciliación y las brechas ya subidas por el propietario; este
  entregable y el delta P09 pendientes de subida).
- GitHub: NOT_CONNECTED (verificado 2026-11-10). Entrega local para
  subida por el propietario.

## Anexo B. Correspondencia E1–E9 (apoyo compacto)

| Caso E | Exigencia (S4/S12) | Posición de ACA-1 | Veredicto |
|---|---|---|---|
| E1 | Persistencia confirmada + release incierto: conservar, sin retry/readmisión | O9 dos dimensiones + BLOCKED (§2.3 paso 5) | COMPATIBLE (diseño) |
| E2 | Persistencia UNKNOWN + release incierto: UNKNOWN, sin retry/readmisión | BLOCKED por defecto; crash ambiguo → BLOCKED (§2.4) | COMPATIBLE (diseño); ejecución sin demostrar |
| E3 | Cleanup no elimina sustituto | D-8 condicionado a S-1; RAW solo detectado | NO DEMOSTRADO |
| E4 | Fallo al escribir owner no autoriza cleanup destructivo de sustituto | MED único cleanup con fd retenido; handler por-path eliminado del diseño nominal | NO DEMOSTRADO (seam y matriz P07-06 sin especificar) |
| E5 | Owner ilegible/metadata inesperada = incertidumbre, no ausencia | Divergencia de identidad → BLOCKED+QRT (§2.2 paso 3) | COMPATIBLE (diseño) |
| E6 | Path ausente no basta para readmitir con actor previo no resuelto | Fail-closed: ausencia → sin evidencia → BLOCKED | COMPATIBLE (diseño); enforcement interproceso sin demostrar (O1/O2) |
| E7 | Competidor no entra durante admisión activa ni UNKNOWN/BLOCKED | MED único escritor + SUP; condicional C-1/C-7, CE-12/CE-13 | NO DEMOSTRADO |
| E8 | Solo procedimiento aprobado con predicados puede resolver | REC [PROPUESTA], sin aprobar; predicados sin definir (brecha 4) | NO DEMOSTRADO |
| E9 | Fallo pre-write probado separado de release incierto; sin retry | O9 + lease nuevo por reintento (§2.3 paso 6) | COMPATIBLE (diseño) |

*Fin del documento.*
