# NCS M0 — Auditoría adversarial de cierre (deep audit)

**Fecha:** 2026-11-10 (consulta: 2026-11-10 23:36 CST).
**Modalidad:** solo lectura sobre código, configuración, decisiones y documentos; producción de informes nuevos sin alterar fuentes ni canónicos.
**Repositorio:** `snowdenxrp/aldea-ia`.
**Rama de investigación:** `ncs-m0-architecture-research-2026-11-10`, HEAD verificado **`6283f6643cbbf67054e14a4f93006d512edafe75`** (commit «Add files via upload» que añadió únicamente el contrato de cierre `40f50d1d…`; verificado por `ls-remote` + clon público de solo lectura, sin modificar).
**Snapshot de código auditado:** rama `ncs-lumina-decoupling-2026-10-29`, **`d8b5ca8720908d926acc18130614cce132a43b5d`** (HEAD verificado; distinto del commit de publicación documental).
**STATUS canónico:** rama `ncs-continuity-handoff-correction-2026-11-07` @ `eee2ae772e5569ffbc90d6334f47c6633f4961fb`, blob `NEXO_NCS/STATUS.md` = `dfa580cc77ffafe37d26997220cbc12357328fa2` (verificado).
**Clasificaciones usadas:** DECIDED / IMPLEMENTED / TESTED / CI-VERIFIED / PROPOSAL / UNKNOWN / STOP. Ningún TESTED se otorga por leer un documento que describe una prueba; ningún CI-VERIFIED sin run ligado al SHA exacto (verificado por API pública de GitHub en esta auditoría).

**Veredicto: `M0 CLOSURE PATH PARTIAL`** — existe una ruta de cierre demostrable para el *claim restringido* (contención por política con exclusiones explícitas, o cambio de modelo); quedan bloqueos y dependencias sin resolver (ancla realizada, A-08, P07-A, fingerprint, harness/CI sobre SHA congelado). No se declara M0 terminado.

---

## 1. Alcance y método

Superficies atacadas (encargo §3): A identidad/Constitución/autoridad; B persistencia/continuidad/rollback; C P05/P07/P08/P09; D E2/E3; E ACA-1 (solo errores residuales y evidencia nueva, sin repetir la compatibilidad); F criterios de cierre (falsos PASS).

Método: (1) verificación de HEADs y blobs por `ls-remote`/`rev-parse` sobre clon público; (2) lectura directa de código del snapshot `d8b5ca87` (10 archivos clave extraídos y leídos línea a línea; `git grep` sobre `src/nexo/`, `scripts/`, `tests/`, workflows); (3) verificación de runs CI por API pública (`api.github.com/repos/snowdenxrp/aldea-ia/actions/runs?head_sha=…` y `/jobs`); (4) búsqueda exhaustiva DISC-08 en **todas** las ramas remotas; (5) contraste de las afirmaciones de informes previos (propios y de otros modelos) contra fuente primaria — ninguna se aceptó sin referencia verificada.

Límites: sin ejecución de código, tests, CI, dispositivo ni Termux; sin acceso a registros privados del propietario; la API pública de Actions solo expone runs (no logs completos en esta auditoría).

## 2. Evidencia de base verificada en esta auditoría

| Afirmación | Verificación directa | Resultado |
|---|---|---|
| HEAD de investigación = `6283f664…`; su diff vs `9c4d9d81…` | `git log` + `git diff --name-status` | **Confirmado**: único archivo añadido = contrato de cierre (`40f50d1d…`, byte-idéntico al local) |
| STATUS canónico blob `dfa580cc…` | `git rev-parse …:NEXO_NCS/STATUS.md` | **Confirmado** |
| Snapshot de código `d8b5ca87…` es HEAD de su rama | `ls-remote` | **Confirmado** |
| Delta P09 recuperable | Artefacto local `6e59e0e6…`, 51.219 bytes; `ls-tree` de la rama de investigación | **Recuperado localmente; sigue SIN estar en la rama** (ningún archivo `*P09_DYNAMIC*`) |
| DISC-08A/B en el repo | `git grep -i DISC-08` sobre **todas** las ramas remotas (129) | **0 resultados** fuera del propio contrato de cierre que registra la búsqueda. Conclusión acotada: DISC-08A/B **no existen en el repo público** (ninguna rama); su existencia fuera del repo sigue UNKNOWN |
| Decisiones P08/P09 del 9-Nov en canónicos | `git grep 2026-11-09` en `NEXO_NCS/` de rama canónica y `main`; `ls-tree` de archivos fechados 08/09/10-Nov | **0 registros**: la rama canónica no contiene ningún archivo fechado 2026-11-08/09/10. Las decisiones existen solo como declaración del propietario (encargos 2026-11-10) |
| CI sobre `7a7f3ffa…` (5 runs SUCCESS) | API `?head_sha=7a7f3ffa…` | **Confirmado exactamente**: 5 runs, todos success (41362046788/91/92, 41362046808/42) |
| Run citado por PR #110 (40972888688) | API `/runs/40972888688` | **head_sha = `572fe085abc11c625d13beb4885a74da2d7ffd95` ≠ `d8b5ca87…`**. El handoff del 07-11 ya advertía que el SHA probado no se exponía; ahora se conoce y **no** es el snapshot auditado |
| CI sobre el snapshot `d8b5ca87…` | API `?head_sha=d8b5ca87…` + `/jobs` | **Exactamente 1 run**: 41673470507 «NCS Lúmina Decoupling Validation», success; 1 job `focused-regression` success. **No** hay runs de aceptación/admisión/STEP sobre este SHA |
| «Sin registros CI para `5988d9b4…`» (handoff 01-11, addendum) | API `?head_sha=5988d9b4…` | **Refutado**: existen 3 runs success (STEP 4: 41394047626; STEP 5: 41394047630; decoupling: 41394047799). Cobertura parcial (sin aceptación/admisión). Corrección registrada como ADV-06 |
| Lock token→`rm(path)` no atómico; `lockReleaseFailures` volátil | Lectura directa `continuity-store.mjs` L21–L85 (snapshot) | **Confirmado** (detalle en ADV-01) |
| Queries path-based sin admisión | Lectura directa `continuity-queries.mjs` L10, L215, L272 | **Confirmado** (ADV-02) |
| Append inicializa Chronicle | Lectura directa `chronicle-append.mjs` L293–L354 | **Confirmado con matiz**: `initializeContinuity=true` está bloqueado (L293–L297, `NEXO_M0_CONTINUITY_BOOTSTRAP_OPERATION_SEPARATION_REQUIRED`), pero `initializeChronicle=true` ejecuta `chronicleStore.initialize()` dentro del append (L344–L354) (ADV-03) |
| `authorization` efectiva por passthrough | `nexo-chronicle-session.mjs` L84 `result.authorization ?? "NOT_EVALUATED"`; todos los productores leídos hardcodean `NOT_EVALUATED` | **Confirmado el passthrough; ningún productor actual inyecta otro valor** (ADV-04) |
| Repair STOP-gated en código | `scripts/nexo-repair-dispatch.mjs` y `nexo-repair-entrypoint.mjs`: `assertM0OptionAEffectAllowed` → `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` | **Confirmado** (cierra superficie de ataque, ver §6) |
| Dispatch de efectos en `src/nexo/` | `git grep dispatch` | Solo comentarios y cadenas `*_without_redispatch` en `continuity-operations.mjs`; **ningún dispatcher** (cierra superficie) |
| CLI `nexo.mjs` sin bootstrap | Lectura directa L100–L201 | Comandos: status/mission-status/draft-preview/request-preview/mission-plan + dispatch→`spawnSync` con path literal (L186–L189); sin subcomando bootstrap; desconocido → `NEXO_COMMAND_UNSUPPORTED` |

## 3. Hallazgos adversariales

Formato por hallazgo: severidad · escenario · evidencia reproducible · gate · consecuencia · contraargumento más fuerte · qué lo refutaría · corrección mínima · ¿bloquea M0?

### ADV-01 — HIGH — El release puede eliminar el lock de un actor de reemplazo y el BLOCKED no es durable interproceso

- **Escenario:** actor A valida su token en `owner.json`, pierde la CPU (o es suspendido por Android/Doze); actor B sustituye el directorio lock; A reanuda y ejecuta `rm(lockPath, recursive)` sobre el lock de B. Paralelamente, un fallo de release registrado en el `Set` process-local `lockReleaseFailures` desaparece con el proceso: otro proceso no sabe que hubo release incierto.
- **Evidencia reproducible:** `src/nexo/core/continuity-store.mjs` (snapshot `d8b5ca87`): L53–L71 (token → `readLockOwner` L68 → comprobación L69 → `rm(lockPath)` L71: check/use no atómico); segundo `rm` L78; `lockReleaseFailures` process-local L43–L50; creación de owner L53–L60. Misma familia en `chronicle-store.mjs` (token antes de release, sin retry de Continuity — caracterización del 07-11, blob `e6546c03…`, no re-leída en esta auditoría: se cita como antecedente, no como verificación nueva).
- **Gate:** G-2 (P05) / O4, O1, O5.
- **Consecuencia:** O4 no satisfecho (el código vigente puede destruir el lock de otro); O1/O5 sin demostrar interproceso; P05-C (política) sin enforcement durable.
- **Contraargumento más fuerte:** bajo R1 con un solo launcher manual y escritores cooperativos, la ventana check→rm es pequeña y el segundo `rm` solo ocurre tras fallo del primero; el daño requiere actor no cooperativo o sustitución concurrente, que R1 excluye parcialmente (same-UID malicioso fuera de garantía).
- **Qué lo refutaría:** tests de concurrencia sobre el target mostrando que la sustitución entre check y rm no puede eliminar el lock de reemplazo (p. ej., unlink por fd/dirfd con identidad verificada en el momento de la syscall), más persistencia interproceso del registro de fallo de release.
- **Corrección mínima:** en G-2: release por descriptor con re-verificación de identidad en aceptación (no por path tras check), registro durable (no `Set` volátil) del release incierto, y tests de sustitución (E3/E4) ejecutados.
- **¿Bloquea M0?** **Sí** (G-2).

### ADV-02 — HIGH — Las queries leen stores persistentes sin admisión previa (violación de O-10 en código)

- **Escenario:** cualquier importador de `src/nexo/application/index.mjs` (7 exports: 1 mutación + 6 lecturas/previews) llama `loadNexoContinuityStatus(path)` / `loadNexoMissionStatus` / `previewNexoMissionDraft` con una ruta arbitraria y obtiene el contenido del store sin raíz explícita, sin admisión de instancia y sin que exista enforcement alguno: la «admisión» del CLI no cubre al caller directo.
- **Evidencia reproducible:** `continuity-queries.mjs` L10, L215, L272: `createNexoContinuityStore({ filePath }).loadCurrent()` directo; `index.mjs` L1–L9 exporta esas funciones como «Stable public Nexo application API» (el comentario «not a generic effect dispatcher» es comentario, no enforcement); `nexo.mjs` L100–L183 invoca las mismas funciones tras parsear `--continuity` sin validación de raíz canónica.
- **Gate:** G-1 (P03/P04) / G-5 (O7).
- **Consecuencia:** O-10 (admisión antes de lectura, sin excepción read-only) incumplida en el código del snapshot; O7 abierto; P09 fila 6 (factory path-based alcanzable) sigue FAIL.
- **Contraargumento más fuerte:** en el universo declarado (CLI + tests conocidos) no hay caller malicioso demostrado; R1 limita actores; la API es «interna» por intención.
- **Qué lo refutaría:** test de arquitectura sobre SHA congelado mostrando que todo caller del universo (incluido importador directo) es rechazado antes del primer I/O sin contexto admitido — es decir, la implementación de G-1/G-5, no una declaración de intención.
- **Corrección mínima:** G-1/G-5: contexto admitido obligatorio en cada export (o conversión a superficie interna no importable por rutas), más test de no-bypass (criterio 6 de la línea de meta).
- **¿Bloquea M0?** **Sí** (G-1/G-5).

### ADV-03 — HIGH — El append de Chronicle puede inicializar el store (init/append no separados) y P08 sigue abierto en código

- **Escenario:** con `--initialize-chronicle`, una operación de append crea el Chronicle si falta (L344–L354). Un caller puede así crear estado persistente nuevo en una operación que el contrato P08 exige que solo anexe; combinado con la ausencia de resolver común root→stores, dos flujos pueden derivar stores distintos para la «misma» raíz.
- **Evidencia reproducible:** `chronicle-append.mjs` L325–L354 (preflight de ambos stores; `if (chronicleMissing && !initializeChronicle) blocked` L329; `chronicleStore.initialize()` L346); `nexo-chronicle-session.mjs` L12–L13 acepta `--initialize-chronicle` como flag de CLI; reconciliación P08 07-11 (SHA `b905207c…`): sin resolver común, candidato no ratificado en archivo, P08 OPEN/LAYOUT UNSELECTED.
- **Gate:** G-4 (P08).
- **Consecuencia:** P08 no cerrable ni en verificación (contenido decidido 9-Nov no referenciado, §5) ni en código (init dentro de append).
- **Contraargumento más fuerte:** el flag es explícito y el preflight evita inicialización parcial si el store compañero está corrupto (L317–L330); Continuity nunca se inicializa en append (L293–L297, verificado).
- **Qué lo refutaría:** mapping referenciado (B-DOC-1) + resolver común implementado + test «append sin init previo → rechazo» sobre SHA congelado.
- **Corrección mínima:** B-DOC-1 (referencia) y, tras autorización, separación init/append con raíz única.
- **¿Bloquea M0?** **Sí** (G-4).

### ADV-04 — MEDIUM — Passthrough de `authorization` y barreras por comentario: la separación de autoridad es correcta hoy, frágil por construcción

- **Escenario:** `nexo-chronicle-session.mjs` L84 reemite `result.authorization ?? "NOT_EVALUATED"`: si un productor futuro (o una versión modificada) devolviera otro valor, el CLI lo propagaría sin validación. Análogamente, `index.mjs` declara «not a generic effect dispatcher» solo en comentario: nada impide a un importador usar `runNexoChronicleAppend` como dispatcher de mutación con rutas arbitrarias (ver ADV-02).
- **Evidencia reproducible:** L84 citado; productores leídos (`chronicle-append.mjs` L12, L92–L93, L373; `continuity-queries.mjs` L101–L368; `nexo.mjs` L147, L165) hardcodean `authorization: "NOT_EVALUATED"` en **todos** los paths leídos; `dispatchAttempted: false` y `redispatchAuthorized: false` igualmente hardcodeados (`chronicle-append.mjs` L13, L201–L252).
- **Gate:** G-1/G-9 (separación autoridad/admisión, criterio 7).
- **Consecuencia:** hoy **no** existe ruta observada que convierta NOT_EVALUATED en autorización efectiva (hallazgo acotado); el riesgo es de evolución: la barrera depende de que todos los productores sigan hardcodeando el estado.
- **Contraargumento más fuerte:** el passthrough con default NOT_EVALUATED es precisamente el patrón fail-closed; exigir validación adicional sin productor que lo viole sería especulativo.
- **Qué lo refutaría:** un productor en el snapshot que devuelva `authorization` distinta de NOT_EVALUATED alcanzable desde un entrypoint — no encontrado en los archivos leídos; una búsqueda exhaustiva de productores quedaría cubierta por el test de no-bypass de G-5.
- **Corrección mínima:** en la implementación G-1, validar el campo en la frontera del CLI (rechazar/ignorar valores distintos de NOT_EVALUATED mientras `authorization` siga NOT_EVALUATED globalmente) y convertir el comentario de `index.mjs` en enforcement (ADV-02).
- **¿Bloquea M0?** **No por sí solo**; forma parte obligada de G-1/G-5.

### ADV-05 — MEDIUM — Riesgo de crédito CI indebido: el expediente ya contiene un caso (run de PR #110 ≠ snapshot; snapshot con CI parcial)

- **Escenario:** un cierre futuro cita «CI PASS» genérico. El expediente muestra el patrón: el handoff del 07-11 citó el run 40972888688 de PR #110 sin SHA expuesto; la API muestra hoy que ese run cubre `572fe085…`, **no** `d8b5ca87…`. Y el snapshot auditado `d8b5ca87…` tiene **un solo** workflow CI (decoupling, job `focused-regression`), no la batería M0 (aceptación/admisión/STEP 4/5).
- **Evidencia reproducible:** API pública citada en §2 (runs 40972888688, 41673470507, `?head_sha=` para los tres SHAs); jobs de 41673470507 = 1 (`focused-regression`, success).
- **Gate:** G-8 (CI) / G-9 (acta).
- **Consecuencia:** si el acta concediera CI-VERIFIED a `d8b5ca87` por el run de decoupling, declararía verificadas propiedades (admisión, aceptación integrada) que ese workflow no ejecuta. Falso PASS de proceso, no de código.
- **Contraargumento más fuerte:** nadie ha declarado aún CI-VERIFIED para `d8b5ca87` en los canónicos; el handoff fue explícito en su cautela. El hallazgo es preventivo, no un PASS falso ya emitido.
- **Qué lo refutaría:** un acta que cite runs por ID con `head_sha` = SHA de cierre y jobs inspeccionados (criterio 16) — es decir, la disciplina de §9 del contrato, aplicada.
- **Corrección mínima:** el ledger (§2 de este paquete) registra CI por SHA y por workflow; el acta debe hacer lo mismo. Sin corrección de código.
- **¿Bloquea M0?** **Sí, en G-8** (no hay CI de cierre; el CI existente no lo sustituye).

### ADV-06 — MEDIUM — Corrección de evidencia: el handoff 01-11 afirmó «sin registros CI» para `5988d9b4…`; la API muestra 3 runs success

- **Escenario:** un auditor futuro reutiliza la afirmación «no CI» y descarta evidencia real, o al contrario, la eleva a «CI-VERIFIED completo».
- **Evidencia reproducible:** API `?head_sha=5988d9b4…` → 41394047626 (STEP 4), 41394047630 (STEP 5), 41394047799 (decoupling), todos success; ausentes: aceptación integrada y admisión/continuidad.
- **Gate:** G-8.
- **Consecuencia:** la clasificación correcta para `5988d9b4…` es **CI parcial** (3/5 familias de workflows M0), no «sin CI» ni «CI-VERIFIED completo». No cambia ningún gate (ese SHA no es el de cierre).
- **Contraargumento más fuerte:** en la fecha del handoff (02-11) las consultas disponibles del autor no devolvieron registros; la afirmación era honesta con su evidencia. La corrección es de estado actual, no de mala fe.
- **Qué lo refutaría:** que los runs citados no correspondieran a ese `head_sha` — la consulta por `head_sha` exacto los devuelve, y el patrón `7a7f3ffa` (5/5) valida el método.
- **Corrección mínima:** nota de corrección en el ledger/handoff de este paquete (hecha); sin tocar el handoff histórico.
- **¿Bloquea M0?** **No.**

### ADV-07 — MEDIUM — P09: el guard no ve `import(expr)` ni hay fixtures negativos; la superficie importable muta sin admisión

- **Escenario:** un loader futuro con `import(expr)` no literal pasaría el guard (que solo parsea specifiers literales) sin detección; hoy ya existen 2 `import(expr)` fuera de la clausura (código muerto CDN y child-script de test con URL fijada) que el guard no clasifica. Además, cualquier módulo importable puede invocar la mutación de append con rutas arbitrarias (ADV-02/ADV-04).
- **Evidencia reproducible:** delta P09 (artefacto local `6e59e0e6…`, §5 de este paquete): 2 `import(expr)` no literales en 201 archivos; 0 require/eval/vm; guard sin parseo de `import(expr)` y sin fixtures negativos (superficies S1/S4 PARTIAL); `index.mjs` 7 exports.
- **Gate:** G-5 (P09/O7).
- **Consecuencia:** P09 no cerrable: falta PASS del guard ligado al SHA, fixtures negativos y clasificación de consumidores contra el universo referenciado.
- **Contraargumento más fuerte:** en el snapshot no hay loader malicioso y la clausura desde las 7 raíces está limpia (0 no resueltos, 0 bare); el riesgo es de evolución y de importadores fuera del repo (UNKNOWN/OUTSIDE por definición).
- **Qué lo refutaría:** guard con parseo de `import(expr)` + fixtures negativos por clase + test de no-bypass sobre SHA congelado, con consumidores clasificados contra el universo B-DOC-1.
- **Corrección mínima:** G-5 según §8 del contrato; ninguna acción sobre los 2 `import(expr)` actuales fuera de clasificarlos (ya hecho en el delta).
- **¿Bloquea M0?** **Sí** (G-5).

### ADV-08 — MEDIUM — E2/E3: evidencia puntual de 02-11, launcher/destino sin definir (RE-01/RE-02 UNKNOWN) y writers mixtos en repo

- **Escenario:** la ventana R1 de cierre se apoya en la inspección del 02-11 (HOME 0700, snapshot de procesos limpio, jobs vacíos). Esa evidencia caduca ante reboot/update/cambio de entorno y no cubre una ventana con operación. Además, `npm run assistants` y `npm run simulate` abren Continuity en flujos mixtos (STATUS, clasificación E3 versionada `e1400d6e…`): existen writers potenciales fuera del CLI Nexo dentro del propio repo.
- **Evidencia reproducible:** R1 doc (SHA `f720f00f…`): E2/E3 PARTIAL/NOT CLOSED, RE-01/RE-02 UNKNOWN; assessment E2/E3 28-10 §2/§4 (Termux candidato no seleccionado como mecanismo suficiente; pasos A–D); handoff 01-11 addendum (sin launcher dedicado: `nexo-continuity.mjs` solo re-exporta, sin subcomando bootstrap — confirmado en esta auditoría: `nexo-continuity.mjs` = 2 líneas, `nexo.mjs` sin bootstrap).
- **Gate:** G-6 (E2/E3) / G-7 (RE-01/RE-02).
- **Consecuencia:** E2/E3 no puede pasar de PARTIAL sin ventana delimitada con operación y launcher/destino definidos; las ausencias observadas en 02-11 no son exhaustividad.
- **Contraargumento más fuerte:** R1 ya acepta un criterio acotado (no exige prueba universal de ausencia) y la primera publicación restringida se ejecutó bajo ese criterio con comprobación post-escritura (E4 limitado); para M0_BUILD_COMPLETE podría bastar una ventana análoga documentada, sin launcher permanente (P01-B=C).
- **Qué lo refutaría:** registro de ventana de cierre (pre-checks → operación → verificación, roster, destino efectivo) sin actor no controlado, ligado al SHA de cierre.
- **Corrección mínima:** G-6/G-7 según §6 etapas 3/6 del contrato; P01-B=C se mantiene (no seleccionar launcher por inferencia).
- **¿Bloquea M0?** **Sí** (G-6).

### ADV-09 — LOW — Higiene documental: duplicado «(1)», §2.1 obsoleto y formulación de §15.4

- **Escenario:** un auditor cita la copia «(1)» como fuente independiente, o cita el §2.1 del contrato (HEAD `9c4d9d81`, «delta P09 no en rama») como estado actual, cuando el HEAD real es `6283f664` y el contrato ya está publicado.
- **Evidencia reproducible:** `ls-tree` de la rama: dos archivos de compatibilidad con el mismo blob `c970b186…`; diff `9c4d9d81→6283f664` = solo el contrato de cierre; delta P09 sigue ausente (verificado).
- **Revisión de §15.4 pedida por el encargo:** la formulación «la moratoria es inenforzable frente a rollback no declarado» es **sustantivamente correcta pero imprecisa**: lo inenforzable no es la moratoria como norma (prohíbe RB-1–RB-4 con independencia de la detección), sino su **verificación** frente a un rollback ejecutado por un ejecutor no declarado (A-03 UNKNOWN). Formulación corregida propuesta: *«Sin ancla realizada ni ejecutor clasificado, la violación de la moratoria por rollback no declarado no es detectable desde dentro del dominio; la moratoria sigue vigente como prohibición y su cumplimiento frente al SO permanece UNKNOWN»*. Se recomienda adoptarla en un corrigendum, sin reescribir el artefacto publicado (integridad de hash `40f50d1d…` ya en rama).
- **Gate:** transversal (G-9/acta).
- **Consecuencia:** riesgo de citas cruzadas erróneas; ningún gate técnico.
- **Contraargumento más fuerte:** los hashes permiten distinguir copias; el §2.1 era correcto en su fecha (23:18 CST) y el addendum §15 ya matizaba fuentes.
- **Qué lo refutaría:** un corrigendum publicado que actualice §2.1 y §15.4 con nuevo hash, y la retirada o renombrado del duplicado «(1)» por el propietario.
- **Corrección mínima:** B-DOC-3/B-DOC-5 del contrato + nota de corrección en el ledger de este paquete (hecha en §5). **Decisión deliberada:** no se reescribe el contrato publicado; la corrección viaja en estos 5 entregables.
- **¿Bloquea M0?** **No** (bloquea la *limpieza* del acta si no se hace).

### ADV-10 — HIGH — ACA-1 residual: sin B-DOC-1/2 y sin A-01/A-08 no puede servir como contrato de cierre (y dos presuposiciones nuevas a vigilar)

- **Escenario:** se adopta ACA-1 como «la arquitectura de cierre» por su completitud documental. Residuales verificados: (a) A-02 título/opción C contradicen D-RB-01 A en el texto (K-01; solo lo resuelve la regla R-01–R-05 de S2, ausente de ACA-1); (b) SUP presupone supervisión de grupo de procesos mientras P01-B=C deja el launcher sin seleccionar (K-03) y S-2/S-3 están sin fingerprint; (c) GEN y WIT-local no realizan D-RB-04 A (compatibilidad §4: D-RB-04 NO DEMOSTRADO); (d) Qwen AFA-W no es alternativa independiente que resuelva (a)–(c): también depende de witness externo y su O1–O9 es funcional, no normativa.
- **Evidencia reproducible:** compatibilidad `c970b186…` §3–§6 (K-01…K-06, S-1…S-9, matrices); ACA-1 `f337381f…` §8 (A-01…A-09 sin decidir salvo moratoria); Qwen `b1b08e1b…` §7/§9/§12 (O3 parcial solo con witness; B = cambio de R1); Gemini `f66cb3f2…` §4/§6 (OFD advisory; sin aislamiento intra-UID) — apoya (b)/(c) desde plataforma.
- **Gate:** G-2/G-3.
- **Consecuencia:** ACA-1 es PROPUESTA compatible en intención (5/9 D-RB documental, O6/O9 por diseño) pero **no** un contrato: faltan corrigendum, decisiones A-01/A-08, fingerprint S-1–S-4 y predicados REC/P07-A.
- **Contraargumento más fuerte:** ACA-1 nunca se presentó como aprobada (su §9 declara PARCIAL y §1.1 «nada demostrado hoy»); el riesgo es de *lectura* posterior, no del documento.
- **Qué lo refutaría:** corrigendum B-DOC-2 aplicado + decisiones A-01/A-08 registradas + fingerprint compatible — entonces ACA-1 (o su sucesora) podría elevarse a contrato de implementación para el claim restringido.
- **Corrección mínima:** ninguna sobre ACA-1 en esta auditoría (es PROPUESTA ajena al canónico); la ruta la trata en etapas 0–2 del plan.
- **¿Bloquea M0?** **Sí, vía** A-01/A-08/ancla (ya en la ruta crítica; no es un bloqueo *nuevo*).

### ADV-11 — INFORMATIONAL — `CLOSED — EVIDENCE SUFFICIENT` (superficies de ataque cerradas en el snapshot, con alcance acotado)

- **Nexo/Lúmina:** guard `tests/nexo/m0-import-graph-guard.test.mjs` presente en el snapshot; delta P09: 0 aristas Nexo→Lúmina y 0 Lúmina→Nexo desde las 7 raíces (63 módulos); ningún workflow M0 lanza proceso de producto Nexo (los 31 workflows clasificados en el delta; el único proceso programado persistente es Lúmina `lumina-simulation.yml`). **Alcance:** estático, snapshot `d8b5ca87`, imports literales; dinámicos/externos siguen UNKNOWN (ADV-07).
- **Dispatch/efectos protegidos:** ningún dispatcher en `src/nexo/` (solo cadenas `*_without_redispatch`); repair STOP-gated por `assertM0OptionAEffectAllowed` (lectura directa); `authorization`/`dispatchAttempted`/`redispatchAuthorized` hardcodeados en paths leídos. **Alcance:** archivos leídos en esta auditoría + grep de `src/nexo/`; un barrido exhaustivo de productores pertenece al test de no-bypass de G-5.
- **Continuity no establece identidad/Constitución/autoridad:** `continuity-queries.mjs` devuelve proyecciones con `authorization: NOT_EVALUATED` y comentarios explícitos («never dispatches, reconciles, or authorizes work», L261); ningún campo de autoridad se deriva del store en los archivos leídos. **Alcance:** mismos límites de lectura.
- **Consecuencia:** estas superficies **no** requieren nueva investigación salvo cambio de SHA/seam (protocolo de no repetición). Se marcan CLOSED para no reabrirlas por rutina.
- **¿Bloquea M0?** **No.**

### ADV-12 — MEDIUM — El criterio de cierre permite exclusiones: el falso PASS sería de *alcance*, no de prueba

- **Escenario:** se declara `M0_BUILD_COMPLETE` sobre el claim restringido y un lector posterior lo entiende como garantía universal (prevención frente a RAW, rollback-resistance total). La línea de meta lo permite *solo* con exclusiones explícitas (criterio 17) y separación de `PROTECTED_EFFECTS_AUTHORIZED` (§2.2); el riesgo es documental: un acta que entierre las exclusiones en anexos.
- **Evidencia reproducible:** línea de meta §2–§4 y §9 (aceptación 24-10: separación de resultados, sin cierre por documentación/CI de otro SHA); contrato §11 F-1 y §13 (condiciones 1–6) — la mitigación ya existe en diseño.
- **Gate:** G-9 (acta).
- **Consecuencia:** PASS formalmente válido pero materialmente engañoso si el alcance no encabeza el acta.
- **Contraargumento más fuerte:** el contrato §13 ya exige claim escrito, exclusiones con capacidad/riesgo y supuestos residuales; el riesgo residual es de redacción del acta, no del criterio.
- **Qué lo refutaría:** acta con el alcance del claim en su primera línea, exclusiones enumeradas con capacidad afectada y la lista «fuera de alcance tras el cierre» (contrato §13/dictamen Q8) firmada por el propietario.
- **Corrección mínima:** requisito de formato del acta en el plan de cierre (T-12, §6 de este paquete).
- **¿Bloquea M0?** **No** si el acta sigue §13; **sí** si se omite.

## 4. Falsación de los criterios de cierre (superficie F)

| Pregunta del encargo | Respuesta con evidencia |
|---|---|
| ¿Puede existir un PASS falso? | Sí, por tres vías demostradas en el expediente: crédito CI de SHA ajeno (ADV-05, caso real: run 40972888688), detección leída como PASS_GATE (prohibida por V2.3 §2; ACA-1 lo evita en texto, sin ejecución), y claim restringido leído como universal (ADV-12) |
| ¿Puede una prueba pasar sin verificar la propiedad? | Sí: el único CI sobre `d8b5ca87` es `focused-regression` de decoupling; los tests de store (per-store) no prueban admisión de instancia (spec P03/P04 §4: «no confundir test de store con test de admisión»); un harness P07 solo-COVERED no cubre RAW (V2.3) |
| ¿Puede un SHA distinto recibir crédito de CI? | Sí, y ocurrió como *riesgo* documentado (ADV-05); la API permite hoy distinguirlo por `head_sha` — el acta debe citar runs por ID |
| ¿Puede evidencia documental confundirse con prueba ejecutada? | Sí: P07-01…22 son escenarios diseñados, no ejecutados (STATUS V2.1); O1–O9 son criterios, no resultados (handoff §4.4); ACA-1/Qwen/Gemini son PROPUESTA/investigación |
| ¿Puede declararse cerrado un gate con UNKNOWN/PARTIAL/STOP? | Solo por violación del proceso: todos los gates están hoy en esos estados y la línea de meta §4 lo prohíbe («brecha crítica etiquetada como aceptable sin exclusión explícita») |
| ¿Dependencias sin registrar? | Dos nuevas a vigilar: (i) G-1 depende del resolver P08 (B-DOC-1) — ya en §5 del contrato; (ii) la ventana E2/E3 de cierre depende de RE-01/RE-02 (launcher/destino) — P01-B=C impide «resolverlo» eligiendo launcher por inferencia; se registra en el ledger |

## 5. Recuperación de evidencia pendiente (encargo §5)

1. **Delta P09:** recuperado. Artefacto local `~/workspace/research_notes/nexo-m0-p09-delta-2026-11-10/SNOW/NCS_M0_P09_DYNAMIC_LOADER_AND_DECLARED_GRAPH_DELTA_2026-11-10.md`, 51.219 bytes, 427 líneas, SHA-256 `6e59e0e62620582d7830fd5ce04e643ce806981b93b5ccce18b9b5a11149d49b`, misión Snow 2026-11-10 sobre snapshot `d8b5ca87` (15/15 blobs del informe P09 coinciden). **No está en la rama de investigación** al HEAD `6283f664` (verificado por `ls-tree`): su publicación sigue pendiente (B-DOC-3). No se repitió el análisis de los 63 módulos.
2. **Decisiones P08/P09 del 9-Nov:** no localizadas en ningún registro del repo (búsqueda §2). Existen como declaración del propietario en los encargos del 10-Nov. **Qué falta y por qué importa:** el *contenido* (mapping P08; lista del universo P09). Sin él, G-4/G-5 no son verificables y ACA-1×P08/P09 permanece NO DEMOSTRADO. Acción: B-DOC-1 (referencia/registro), nunca re-ratificación.
3. **DISC-08A/B:** ausentes de las 129 ramas remotas y del workspace (única mención: el contrato de cierre que registra la búsqueda). **Qué falta:** un registro (ruta+sección+blob) que los defina. **Por qué importa:** desconocido — si algún gate depende de ellos, ese gate es UNKNOWN por trazabilidad hasta localizarlos. No se concluye inexistencia fuera del repo.
4. **§2.1 del contrato (publicación obsoleta):** corregido en este paquete (ledger + handoff): HEAD real `6283f664…`, contrato publicado byte-idéntico (`40f50d1d…`), delta P09 aún sin subir. **Decisión deliberada:** no se reescribe el artefacto publicado (su hash ya está verificado en rama); la corrección viaja aquí y se recomienda corrigendum si el propietario quiere el contrato actualizado in situ.
5. **§15.4 (rollback no declarado):** revisado; formulación propuesta en ADV-09 (distinguir vigencia de la norma vs detectabilidad de su violación).
6. **Duplicado «(1)»:** mismo blob `c970b186…` que el original de compatibilidad; **no** es ACA-1 (que es `f337381f…`, archivo distinto). Resolución: tratarlo como duplicado de subida; su retirada/renombrado es decisión del propietario sobre su rama (B-DOC-3); los entregables de este paquete lo citan como duplicado, nunca como fuente.

## 6. Superficies cerradas sin nueva investigación

Marcadas **CLOSED — EVIDENCE SUFFICIENT** (ADV-11): separación Nexo/Lúmina (estático, snapshot), ausencia de dispatcher en `src/nexo/`, repair STOP-gated, `authorization` no efectiva en productores leídos, CLI sin bootstrap, Continuity sin derivación de autoridad en archivos leídos. Reapertura solo ante cambio de SHA, seam nuevo o contradicción concreta (protocolo de no repetición).

## 7. Veredicto

**`M0 CLOSURE PATH PARTIAL`**. La ruta existe y es mínima para el claim restringido (contrato §6, refinada en el plan de este paquete), pero no está *demostrada* hasta resolver: ancla realizada (D-RB-04), A-08, P07-A, fingerprint/A-03, implementación G-1/G-4/G-5, harness P07 y CI sobre SHA congelado. Si se exigiera el claim universal dentro de R1, el veredicto sería NOT DEMONSTRATED por imposibilidad condicionada (I-1–I-7), no por falta de trabajo documental.

**Confirmación:** solo lectura; sin modificación de código, decisiones, PR ni canónicos; sin ejecución de pruebas/CI/dispositivo; sin declarar ningún gate cerrado por inferencia; sin autorizar mecanismos del moratorio; sin ampliar a M1/STEP 7/YubiKey. Estados preservados: P05 OPEN, P07-C UNKNOWN/BLOCKING, P09 OPEN/UNKNOWN, E2/E3 PARTIAL/NOT CLOSED, M0 INCOMPLETO, `authorization: NOT_EVALUATED`, commissioning/efectos STOP.
