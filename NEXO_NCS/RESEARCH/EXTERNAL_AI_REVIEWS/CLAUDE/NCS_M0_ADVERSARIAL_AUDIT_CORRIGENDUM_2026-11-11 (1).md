# NCS M0 — Corrigendum de precisión a la auditoría adversarial de cierre (10-11-2026)

**Fecha de revisión:** 2026-11-11 (segunda corrección: D-RB-01…09 y AUTH).
**Objeto:** `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/NCS_M0_ADVERSARIAL_CLOSURE_AUDIT_2026-11-10.md` (33.541 bytes).
**Repositorio:** `snowdenxrp/aldea-ia` · **Rama:** `ncs-m0-architecture-research-2026-11-10` · **HEAD verificado:** `16d38e89b6a852707e673f34392f701ea961d951`.
**Snapshot de código revisado:** `d8b5ca8720908d926acc18130614cce132a43b5d` (rama `ncs-lumina-decoupling-2026-10-29`).
**Alcance:** solo lectura y documentación. Sin código, pruebas, dispositivo, CI, PR, ni cambios de decisiones ni de otros documentos del repositorio. No se repite ADV-11 ni los análisis cerrados.
**Estado:** este corrigendum no reemplaza la auditoría publicada (su hash no se altera). Se aplica como nota de corrección. No hay commit ni push.

---

## Resumen de cambios

| Punto | Resultado | Cambio de clasificación |
|---|---|---|
| 1. Estado de publicación | Actualizado | Sí (HEAD y lista de archivos) |
| 2. Registro P08/P09 vs. ausencia DISC-08A/B | Separado | Sí (se distinguen dos afirmaciones que la auditoría mezclaba) |
| 3. ADV-01 bajo R1 | **Conservado como UNKNOWN-STOP** en alcanzabilidad; severidad sin cambio | Precisión adicional (reintento sin verificación de token) |
| 4. ADV-03 comportamiento vs. prohibición P08 | Comportamiento confirmado; prohibición normativa **UNKNOWN** | Sí (severidad HIGH → MEDIUM; la atribución a P08 se retira) |
| 5. T-07 vs. D-RB-01…09 | **D-RB-01…09 = DECIDED** (declaración del propietario, 10-11-2026). Brecha de registro (**DOCUMENTARY GAP**) y mecanismos (**UNKNOWN**) separados. T-07 coherente en intención; no PASS | Sí (estatus de D-RB reclasificado; ya no es «pendiente de ratificación») |
| 6. T-10 y E2/E3 | **No excluibles justificadamente**; deben cerrarse o declararse por decisión expresa del propietario | Confirmado (PARTIAL no pasa a PASS) |
| 7. Prohibición de revertir/restaurar/modificar AUTH revocada o invalidada | **DOCUMENTARY GAP**: la regla normativa exacta no está en el repositorio; se identifican sus fuentes parciales | Nuevo (aclaración solicitada) |

---

## 1. Estado de publicación (corregido)

- La auditoría (§2 y §5) indica HEAD `6283f664…` con solo el contrato de cierre publicado. **Ese dato era correcto en su fecha, pero está superado.**
- HEAD actual de la rama: **`16d38e89b6a852707e673f34392f701ea961d951`** (commit «Add files via upload»). Su diff contra `6283f664` añade cinco archivos, que son los cinco documentos del paquete:
  1. `NCS_M0_ADVERSARIAL_CLOSURE_AUDIT_2026-11-10.md`
  2. `NCS_M0_BLOCKER_AND_EVIDENCE_LEDGER_2026-11-10.md`
  3. `NCS_M0_MINIMUM_SAFE_CLOSURE_PLAN_2026-11-10.md`
  4. `NCS_M0_NEXT_CHAT_HANDOFF_2026-11-10.md`
  5. `NCS_M0_OWNER_DECISIONS_AND_AUTHORIZATION_REQUIRED_2026-11-10.md`
- La carpeta `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/` tiene además documentos anteriores (contrato de cierre, especificación de rollback, ACA-1, compatibilidad, candidate architecture, CE1–CE5/CE7, reconciliación de rollback) y **un duplicado** `…COMPATIBILITY_DELTA_2026-11-10 (1).md`, ya señalado en ADV-09.
- **Delta P09: sigue sin publicar.** No existe ningún archivo `*P09*` ni `*DYNAMIC*` de ese delta en el árbol de `16d38e89`. Sigue siendo un artefacto local (`6e59e0e6…`).
- Limitación de esta verificación: el clon es parcial (`--filter=blob:none`, `--depth=1`), así que no pude confirmar por ancestría que `6283f664` sea antecesor de `16d38e89`. Sí confirmé el diff entre ambos.

## 2. Registro de decisiones P08/P09 vs. ausencia documental de DISC-08A/B

La auditoría mezcla dos afirmaciones distintas. Se separan:

**2a. Decisiones P08 y P09 (9-Nov).**
- **Registro:** existen solo como declaración del propietario en el encargo del 10-11-2026 (21:41 CST, según el contrato de cierre). El handoff y el ledger las registran como «DECIDED-declarada / trazabilidad incompleta».
- **Contenido:** no está en el repositorio. Ningún archivo fechado 2026-11-08/09/10 aparece en los documentos revisados. El contenido exacto del mapping P08 y del universo P09 **no es verificable** desde el repositorio.
- **No se reconstruye ni se re-ratifica nada.** Cualquier afirmación sobre el contenido de P08/P09 queda en UNKNOWN hasta que T-01 lo referencie.

**2b. DISC-08A/B.**
- **Hecho verificado por la auditoría:** búsqueda `git grep -i DISC-08` sobre las 129 ramas remotas, con 0 resultados fuera del propio contrato de cierre.
- **Hecho no repetido aquí:** en esta revisión, una búsqueda sobre el árbol de `16d38e89` agotó el tiempo sin resultado (5 min). No la repetí. En los documentos del paquete, DISC-08 aparece solo como «no localizado».
- **Conclusión correcta:** DISC-08A/B **no se encontraron en las ramas consultadas**. No se establece que no existan fuera del repositorio. Su estado sigue en UNKNOWN por trazabilidad.

**Nota:** la auditoría (§5.3) afirma «no existen en el repo público». Debe leerse como «no localizados en las 129 ramas consultadas».

## 3. ADV-01 — reevaluación bajo R1

**Código (verificado en `d8b5ca87`, `continuity-store.mjs`):**
- L67–L71: el release lee `owner.json`, compara el token y después ejecuta `rm(lockPath, recursive)`. Check y uso no son atómicos.
- **Precisión nueva:** en el reintento tras un fallo del primer `rm` (L78), **no se vuelve a comprobar el token**. Se borra la ruta sin verificar la identidad del propietario. La auditoría citaba ese reintento sin señalar esta diferencia.
- `lockReleaseFailures` es un `Set` de proceso (L43–L50), volátil como indica la auditoría.

**Alcanzabilidad dentro del modelo R1:**
- R1 excluye root/OS comprometido y procesos maliciosos del mismo UID (canónico: P-R1, `P05_P07_CE1_CE5_CE7` §1).
- R1 **no** excluye procesos del mismo UID que escriben de buena fe. El documento de cierre (línea 511) reconoce que en Termux **no hay aislamiento fuerte entre procesos del mismo UID**.
- La auditoría (ADV-08) señala que `npm run assistants` y `npm run simulate` abren Continuity en flujos mixtos. Son escritores potenciales del mismo UID, dentro del repositorio.
- Por tanto, el contraargumento de la auditoría («R1 excluye el daño») **no cierra**: lo excluido es el actor malicioso, no un escritor concurrente benigno.

**Qué falta para reclasificar:** demostrar que no existe ningún otro escritor del mismo UID durante una operación. Eso requiere E2/E3 con ventana delimitada y roster (RE-01/RE-02), que siguen UNKNOWN, y la única inspección disponible (02-11) caduca ante reboot o cambio de entorno.

**Resultado:** **alcanzabilidad dentro de R1 = UNKNOWN-STOP** (se conserva). La severidad HIGH y el bloqueo de G-2 no cambian. No se reclasifica a LOW ni a «no alcanzable».

## 4. ADV-03 — comportamiento comprobado vs. prohibición normativa atribuida a P08

**Comportamiento comprobado (`chronicle-append.mjs`, snapshot `d8b5ca87`):**
- L296–L298: `initializeContinuity=true` está bloqueado. Es la separación para **Continuity**.
- L344–L353: si Chronicle falta y `initializeChronicle=true`, el append ejecuta `chronicleStore.initialize()`. **Esto sí ocurre en el código.**
- L293–L295 (comentario): la prohibición de inicializar y continuar está escrita **solo para Continuity**.

**Lo que no está sustentado:** la auditoría afirma que «el contrato P08 exige que solo anexe». **No hay fuente exacta** en el repositorio para esa prohibición. El contenido de P08 no está referenciado (punto 2). El comentario del código tampoco establece append-only para Chronicle.

**Clasificación corregida:**
- Comportamiento de código: **confirmado** (init de Chronicle dentro del append).
- Prohibición normativa atribuida a P08 que el init viola: **UNKNOWN** (sin fuente exacta).
- Riesgo «dos flujos derivan stores distintos»: **UNKNOWN**, depende del mapping P08 no referenciado.
- Severidad: **HIGH → MEDIUM**. El riesgo es real, pero su gravedad normativa depende de un contrato no verificable.
- G-4 sigue **bloqueado**: no hay resolver común implementado, y la separación init/append aparece en el propio documento de cierre como «corrección de contrato propuesta» (línea 114).

## 5. T-07 — consistencia con D-RB-01…09

### 5.1 Estatus de D-RB-01…09 (corregido)

El propietario ratificó las nueve decisiones D-RB-01…09 el 10-11-2026. Esta revisión las toma como **DECIDED**. El repositorio no contiene el registro de esa ratificación; su fuente es la declaración del propietario. No se solicita una nueva ratificación.

Se distinguen tres categorías, que no deben mezclarse:

| Categoría | Qué abarca | D-RB afectadas |
|---|---|---|
| **DECIDED** | Decisión ratificada por el propietario (10-11-2026) | D-RB-01…09, como conjunto |
| **DOCUMENTARY GAP** | Falta reconciliar los registros y eliminar etiquetas «[PROPUESTA]» obsoletas. Incluye: (a) la opción concreta (A/B/C/D) que el propietario eligió en cada D-RB no está registrada en el repositorio; (b) el documento fuente conserva «NO RATIFICADA COMO CONJUNTO» y «[PROPUESTA]» en cada recomendación; (c) `OWNER_DECISIONS…` lista D-RB como tomadas sin texto de opción | D-RB-01…09 |
| **UNKNOWN** | Mecanismos técnicos aún no definidos | Ancla (forma y canal de D-RB-04/09), verificación frente al SO (D-RB-02 C, A-03), quiescencia (D-RB-06, CE-12/CE-13), predicados de REC y de verificación de cuarentena (D-RB-08) |

**Advertencia de atribución:** el documento de rollback presenta, en cada D-RB, una opción **recomendada** marcada como [PROPUESTA]. Esta corrección **no atribuye** al propietario esas recomendaciones: solo dice que la ratificación existe y que la opción elegida es una brecha documental.

### 5.2 Verificación de T-07

| Requisito | Qué dice T-07 | Veredicto |
|---|---|---|
| **BLOCKED** (D-RB-05) | BLOCKED durable | Decisión DECIDED. Mecanismo UNKNOWN: depende de la detección (D-RB-04). Coherente en intención |
| **Ancla** (D-RB-04, D-RB-09) | Single-use contra ancla | Requisito DECIDED; **forma y canal UNKNOWN** (S-8 sin evidencia). T-07 no puede ejecutarse ni verificarse antes de T-03 |
| **Cuarentena** (D-RB-08) | Cuarentena según predicados | Decisión DECIDED. Predicados de verificación UNKNOWN (T-02) |
| **REC / sin readmisión automática** | Cuarentena/REC según predicados | Regla de no readmisión automática con fuente ratificada (P05-C) y de diseño (ACA-1 D-6). **Predicados REC UNKNOWN**: sin ellos no hay criterio para decidir readmisión |
| **Moratoria total** (D-RB-01) | T-07 no reactiva RB-1…RB-4 | Decisión DECIDED. T-07 no reactiva la moratoria. Opción concreta registrada: DOCUMENTARY GAP |
| **Prohibición de revertir AUTH** (D-RB-07) | No mencionada | **Omisión en T-07.** Debe exigirse como criterio de aceptación en E8/CE-5 (ver §5.3) |
| **Quiescencia** (D-RB-06) | No mencionada | Aceptable: la moratoria la subsume. Mecanismo de quiescencia UNKNOWN |

**Resultado:** **T-07 es coherente en intención con D-RB-01…09 decididas, no verificable en sus mecanismos y no PASS.** Correcciones de texto: (i) añadir la prohibición de revertir AUTH a su aceptación; (ii) declarar que la readmisión automática queda prohibida por construcción y no solo «según predicados».

**Sobre la verificación frente al SO:** la moratoria no puede hacerse cumplir frente al SO mientras la clasificación del SO (D-RB-02 C) siga sin registro de opción (DOCUMENTARY GAP) y A-03 esté UNKNOWN. Esto no lo resuelve T-07.

### 5.3 Prohibición de revertir, restaurar o modificar AUTH revocada o invalidada

**Lo que sí está en el repositorio (fuentes parciales):**
- **D-RB-07** (tabla de decisiones): la opción recomendada prohíbe «los alcances que revierten AUTH mientras no exista ancla externa». Se refiere a los alcances RB-3 y RB-4 de rollback.
- **P05-C ratificado** (documento de cierre, línea 278): sin readmisión sin procedimiento aprobado; respuesta por defecto UNKNOWN/BLOCKED, sin retry.
- **Regla de diseño** (candidate architecture D-6 y G-5; ACA-1 O5): ninguna readmisión automática; recuperación solo por procedimiento del propietario con predicados.
- **Contrato C6 del propietario** (citado en la especificación de rollback, F8): un restore exitoso no prueba autoridad vigente; el store no puede inferir autoridad actual de un restore exitoso.

**Lo que no está en el repositorio (brecha documental):**
- No localizo, en los documentos revisados, una regla normativa **exacta** que diga que una autorización ya revocada o invalidada:
  1. no puede restaurarse por ningún camino (restore, reconciliación RB-1/RB-2, release o readmisión);
  2. no puede modificarse (edición de registros, re-validación o re-emisión) salvo por un procedimiento aprobado.
- D-RB-07 cubre la reversión por rollback RB-3/RB-4. No dice, según el texto disponible, si cubre RB-1/RB-2 ni la edición directa de registros de AUTH.
- **Clasificación:** **DOCUMENTARY GAP**. No se inventa su contenido. La regla debe formularse y registrarse por el propietario en su registro de decisiones, reconciliando D-RB-07 con P05-C.
- **Criterio propuesto para T-07 (derivado, no normativo):** ninguna ruta del mecanismo reactiva ni modifica una autorización revocada o invalidada sin procedimiento aprobado. Su estatus es DOCUMENTARY GAP hasta que la regla exacta quede registrada.

## 6. T-10 — E2/E3 y el claim restringido

**Fuentes:**
- Documento de cierre, línea 230: si la ventana no se autoriza, «el acta lo registra como exclusión o como gate abierto, **no como PASS**».
- Criterio 17 de la línea de meta y G-9: exclusiones solo con capacidad afectada, riesgo documentado y aceptación del propietario, y **ningún criterio obligatorio dentro del alcance en UNKNOWN/BLOCKED**.
- Línea 82: R1 «gobierna el modelo de actores de todos los gates».
- ADV-08 clasifica G-6 como **bloqueante** de M0.

**Análisis:**
- Excluir E2/E3 **no es justificable** en el claim restringido tal como está redactado. El claim es «contención por política» *dentro de R1*, y el control de actores de R1 es precisamente E2/E3. Excluirlos dejaría el claim sin su frontera de actores, es decir, sería otro claim.
- Lo que sí es posible es una **exclusión declarada** por decisión expresa del propietario, con la capacidad afectada nombrada (escritores del mismo UID durante la ventana, ausencia de launcher dedicado, RE-01/RE-02). Eso no es una justificación documental: es una decisión de alcance.
- Si el propietario no acepta esa exclusión, la vía es T-10 (ventana con operación) o un cambio de modelo (A-08).

**Resultado:** **E2/E3 no pueden excluirse justificadamente con la documentación actual.** Quedan **PARTIAL / NOT CLOSED**. Solo pueden figurar en el acta como exclusión o gate abierto, nunca como PASS, y la exclusión requiere decisión expresa del propietario. «PARTIAL» **no** se convierte en «PASS».

## 7. Impacto sobre los bloqueos de cierre M0

| Gate | Estado tras esta revisión | Bloquea cierre |
|---|---|---|
| G-1 P03/P04 (admisión pre-read) | DECIDED / no IMPLEMENTED; queries path-based sin admisión (ADV-02) | **Sí** |
| G-2 P05 (durable/release) | Release no atómico confirmado; alcanzabilidad R1 de ADV-01 = **UNKNOWN-STOP**; D-RB-01…09 DECIDED, pero la forma del ancla es UNKNOWN; prohibición de revertir/modificar AUTH = DOCUMENTARY GAP | **Sí** |
| G-3 P07-C | UNKNOWN/BLOCKING; P07-A, REC/cuarentena, harness sin ejecutar | **Sí** |
| G-4 P08 | Init de Chronicle en append confirmado; mapping no referenciado; prohibición normativa UNKNOWN | **Sí** |
| G-5 P09 | Universo no referenciado; guard sin fixtures negativos; `import(expr)` no clasificado (ADV-07) | **Sí** |
| G-6 E2/E3 | PARTIAL / NOT CLOSED; no excluible sin decisión del propietario | **Sí** |
| G-7 fingerprint / A-03 | Sin inspección vigente (S-1–S-4, A-03 UNKNOWN) | **Sí** |
| G-8 CI sobre SHA congelado | No existe CI de cierre. El único CI sobre `d8b5ca87` es `focused-regression` (decoupling); no cubre admisión ni aceptación | **Sí** |
| G-9 acta | PENDIENTE; requiere G-1…G-8 o exclusiones aceptadas | Depende de los anteriores |

**Decisiones del propietario aún abiertas (no incluyen D-RB-01…09):** A-08 (alcance del claim o cambio de modelo), forma del ancla y canal de registro (requisito D-RB-04/09 DECIDED; forma UNKNOWN), D-P07A, D-A01, D-A04/A07, D-A03.

**Efecto de esta corrección:** D-RB-01…09 dejan de bloquear como «pendientes de ratificación». Siguen bloqueando G-2 por sus mecanismos técnicos no definidos y por la brecha de registro. El número de gates bloqueados no cambia.

## 8. Lo que sigue en UNKNOWN / STOP

**Mecanismos técnicos (UNKNOWN):**
- **Forma y canal del ancla externa monótona** (D-RB-04 A / D-RB-09 A; S-8 sin evidencia).
- **Verificación frente al SO** (D-RB-02 C, backup/saved-state; A-03 sin clasificar).
- **Quiescencia** (D-RB-06): procedimiento SUP con contraejemplos CE-12 y CE-13 abiertos.
- **Predicados de REC, de verificación de cuarentena y criterio P07-A**: sin especificar.
- **Fingerprint S-1–S-4 y E2/E3 con roster y destino (RE-01/RE-02)**: sin evidencia vigente.
- **Alcanzabilidad de ADV-01 dentro de R1**: UNKNOWN-STOP (no puede probarse la ausencia de otros escritores del mismo UID).

**Contenido o trazabilidad (UNKNOWN):**
- **Contenido de P08 y P09 (9-Nov)**: no referenciado. G-4/G-5 no verificables.
- **Prohibición normativa atribuida a P08 (append-only)**: UNKNOWN.
- **Ubicación de DISC-08A/B**: no localizados en las 129 ramas consultadas.

**Brechas documentales (DOCUMENTARY GAP):**
- **Opción elegida en cada D-RB-01…09**: no registrada en el repositorio.
- **Estatus en el documento de rollback**: sigue marcado «NO RATIFICADA COMO CONJUNTO» y las recomendaciones como [PROPUESTA]; falta reconciliar y eliminar etiquetas obsoletas.
- **Regla exacta de no restaurar ni modificar AUTH revocada o invalidada**: no localizada (ver §5.3).

Sin cambio: `authorization: NOT_EVALUATED`; commissioning y efectos protegidos en STOP; raíz constitucional PENDING/UNKNOWN; P05 OPEN; P07-C UNKNOWN/BLOCKING; P09 OPEN/UNKNOWN; E2/E3 PARTIAL/NOT CLOSED; M0 INCOMPLETO; PR #110 OPEN/DRAFT/NOT MERGED.

## 9. Límites de esta revisión

- Lectura de código limitada a las líneas citadas de dos archivos del snapshot `d8b5ca87`.
- No se repitieron la búsqueda de DISC-08 sobre todas las ramas, ni la consulta de CI por API, ni ADV-06 a ADV-12. Se mantienen tal como los registró la auditoría, con su fecha.
- La ratificación de D-RB-01…09 el 10-11-2026 se toma como declaración del propietario. El repositorio no contiene su registro.
- No se ejecutó ninguna prueba, CI ni comando en dispositivo o Termux.
- El clon es parcial; la verificación de ancestría entre HEAD no fue posible.
- No se declara ningún gate como PASS, TESTED, IMPLEMENTED ni CI-VERIFIED. M0 **no** se declara cerrado.
