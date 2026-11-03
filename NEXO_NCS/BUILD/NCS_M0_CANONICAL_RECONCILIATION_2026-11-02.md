# NCS M0 — reconciliación documental canónica

**Fecha:** 2026-11-02  
**Base exacta:** `99dabcb33be1efef5c4f5e368dc95140e45ff672`  
**Rama documental:** `ncs-m0-documentary-reconciliation-2026-11-02`  
**Rama de producto/PR #110:** `ncs-lumina-decoupling-2026-10-29` — no modificada por esta reconciliación.  
**Alcance:** documentación NEXO_NCS exclusivamente. Sin runtime, tests, workflows, configuración del dispositivo ni archivo real de Continuity.

## 1. Precedencia y propósito

Este documento es la delta canónica de reconciliación al 2 de noviembre de 2026. Prevalece sobre afirmaciones históricas incompatibles en STATUS, BUILD y HANDOFF únicamente respecto de los hechos y decisiones expresamente enumerados aquí. No borra ni reescribe la historia.

Orden de lectura:
1. `NEXO_NCS/STATUS.md` — vector vigente y gates globales.
2. Este documento — reconciliación de contradicciones, decisión A y correcciones.
3. `NEXO_NCS/MASTER/README.md` y `NEXO_NCS/CORE/README.md` — principios arquitectónicos.
4. Finish line, decision register, evidencia R1/E2/E3 y handoff RE-01/RE-02, interpretados con esta delta.
5. El resto de los documentos históricos solo para su alcance temporal original.

No reabrir auditorías ya cerradas salvo contradicción concreta nueva.

## 2. Vector vigente

| Dimensión | Estado vigente |
|---|---|
| Primera publicación real vacía de Continuity | COMPLETED — ejecutada una sola vez |
| RE-01 / RE-02 | IMPLEMENTED / CI-VERIFIED / EXERCISED IN TERMUX |
| E4 | Comprobación post-write del objeto real verificada dentro del alcance observado |
| R1 | ACCEPTED BY OWNER; aceptación normativa, no prueba ambiental |
| E2 | PARTIAL / NOT CLOSED |
| E3 | PARTIAL / NOT CLOSED |
| D0 | Parcialmente ratificado; cierre integral pendiente |
| D1 | OPEN |
| D2 | OPEN |
| D3 | OPEN |
| Root legítima | PENDING / UNKNOWN |
| `authorization` | `NOT_EVALUATED` |
| `ROOT_READY` | NOT ESTABLISHED |
| `M0_BUILD_COMPLETE` | NOT ACHIEVED |
| Efectos protegidos | STOP |
| `PROTECTED_EFFECTS_AUTHORIZED` | NOT AUTHORIZED |

UNKNOWN no es PASS. La aceptación de una regla no prueba su cumplimiento en el entorno. La publicación de un objeto no concede autoridad constitucional ni permiso para efectos protegidos.

## 3. Decisión del propietario — E2/E3 y primera publicación

**DECISIÓN A — RATIFICADA EXPRESAMENTE POR EL PROPIETARIO EL 2026-11-02.**

E2/E3 son criterios independientes de cierre de M0; no fueron condiciones retroactivas para la primera publicación real de Continuity.

Consecuencias:
1. La primera publicación se conserva como COMPLETED.
2. No se invalida ni se repite.
3. E2/E3 permanecen PARTIAL donde la evidencia no satisface el criterio.
4. E2/E3 pendientes bloquean `M0_BUILD_COMPLETE` hasta que se resuelvan con evidencia suficiente o mediante exclusión de riesgo explícita y aceptada por el propietario.
5. R1 sigue siendo el límite normativo/operacional de la ventana de publicación. No se confunde con evidencia ambiental E2/E3.
6. Esta decisión no establece `ROOT_READY`, no cambia `authorization: NOT_EVALUATED` y no autoriza efectos protegidos.

Esta decisión resuelve la relación temporal entre publicación y cierre ambiental. No convierte E2/E3 en PASS ni exige repetir la publicación.

## 4. Correcciones del registro de decisiones

### 4.1 O-09

O-09 **sí está ratificada** en el registro de decisiones, sección 10. La formulación vigente es: definir primero fronteras Nexo/Lúmina, estados y dependencias permitidas/prohibidas; elegir después el refactor mínimo que haga cumplir el contrato.

La ratificación no demuestra aislamiento técnico completo ni selecciona aislamiento físico de scripts como solución previa.

### 4.2 Identificadores P01-B

Mantener separados los dos usos documentales:
- **P01-B de la matriz de separación operacional:** se refiere al estado de desacoplamiento operacional implementado/CI-verificado según la evidencia de su SHA.
- **B2/P01-B, decisión de propietario de la sección 10.6 del decision register:** alternativa C, no seleccionar todavía.

No fusionar estas etiquetas ni inferir que una resuelve la otra.

### 4.3 O-07, O-08, O-10 y O-11

Se mantienen como decisiones ratificadas:
- O-07 excluye repair del alcance operativo M0; no demuestra inaccesibilidad técnica de APIs lower-level.
- O-08 exige `--root` único, sin fallback ni inicialización implícita; no completa por sí solo el layout de stores.
- O-10 exige admisión antes de toda lectura persistente dentro del alcance, sin excepción read-only.
- O-11 clasifica incertidumbre de liberación como UNKNOWN/BLOCKED; no autoriza reintento de negocio ni readmisión insegura.

## 5. Corrección de la línea de meta

Los criterios 14–20 conservan el significado literal del documento de finish line:
- **14:** límites de recursos y pruebas de borde.
- **15:** rutas reservadas y tipos de filesystem.
- **16:** regresiones y CI sobre el SHA exacto que contiene implementación y tests.
- **17:** ninguna brecha UNKNOWN/BLOCKED en un camino declarado dentro del alcance M0, salvo exclusión explícita con capacidad y riesgo documentados y aceptados.
- **18:** evidencia concreta y reproducible por criterio.
- **19:** distinción entre implementado, test ejecutado, CI verificado, propuesta, decisión pendiente y comportamiento no probado.
- **20:** revisión final de consistencia D0–D3 y acta breve de aceptación M0.

E2/E3 no cambian la definición de estos criterios. Su estado PARTIAL puede contribuir a mantener bloqueado el cierre cuando deje una brecha relevante sin resolver, pero no redefine los criterios 15 o 17.

## 6. Primera publicación real — alcance exacto de la evidencia

La publicación vacía se completó una sola vez en:
- Root canónica: `/data/data/com.termux/files/home`.
- Destino efectivo: `/data/data/com.termux/files/home/.nexo-continuity.json`.
- Operación: `2a9114a056eaa483d72dc08243c29f7e7d85b8b8fe194a60c77fda8e81a6d7e9`.
- Confirmación exacta: `PUBLICAR 2a9114a056eaa483d72dc08243c29f7e7d85b8b8fe194a60c77fda8e81a6d7e9`.
- Resultado: `status=committed`, `storeRevision=0`, `authorization=NOT_EVALUATED`, `continuation=STOPPED`.
- SHA-256 del archivo: `3a1d5f25f00c7ba0e030fe8b99dda074b48f9b7950bd80d8a86f46de36236a81`.
- SHA de código reportado para la operación: `d6b657c81fae518fef214c727b9130ca0a40cac8`.

La verificación independiente reportó archivo regular, no symlink, UID Termux, modo 0600, 283 bytes y envelope/snapshot v1 con arrays operacionales vacíos.

Acredita publicación y comprobación post-write del objeto real dentro del alcance observado. No acredita durabilidad ante pérdida de energía, atomicidad frente a lectores no cooperativos, exclusión de escritores no cooperativos, seguridad frente a procesos maliciosos bajo el mismo UID, liberación/readmisión completa, `ROOT_READY` ni autoridad para efectos protegidos.

**Prohibido repetir bootstrap o tocar el archivo real para completar esta reconciliación.**

## 7. E2/E3: estado preservado

- E2.1 y E2.5: aceptación del propietario dentro de R1.
- E2.2, E2.3 y E2.4: PARTIAL.
- E3.1–E3.5: PARTIAL.
- E3.6: workflow remoto clasificado; no prueba inactividad universal ni un puente al HOME privado.

Los snapshots puntuales no prueban continuidad temporal. No se exige inventario universal de Android fuera del límite R1 aceptado. Cualquier actor relevante no clasificado dentro del alcance aplicable permanece UNKNOWN-STOP.

## 8. Handoffs históricos supersedidos

Los siguientes handoffs conservan valor histórico, pero sus estados de publicación/preflight anteriores no describen el estado vigente:
- `HANDOFF/NCS_NEXT_CHAT_2026-11-02_RE01_RE02_TERMUX_VALIDATION.md`: registra una etapa previa a la publicación real.
- `HANDOFF/NCS_NEXT_CHAT_2026-11-02_R1_INVENTORY_CLOSURE.md`: incluye el preflight cancelado y estados E4/publicación anteriores.

Para el estado vigente, usar STATUS y esta reconciliación, además de las secciones posteriores de evidencia real en el documento R1/E2/E3. No repetir el preflight cancelado ni el launcher.

## 9. CI y pruebas: límites de atribución

- CI de cinco workflows SUCCESS en SHA `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`: evidencia de ese SHA, no del HEAD documental.
- CI RE-01/RE-02 SUCCESS, run `41520427582`, SHA `a8de84deeeb4e28cf22a5b40c182143d49754293`.
- Termux en SHA `112c54e34bf7c0b15c3d8565f2bb628cf07498ec`: salida de suite completa observada, pero exit code no registrado independientemente; no declarar PASS formal.
- No hay CI acreditado en HEAD base `99dabcb33be1efef5c4f5e368dc95140e45ff672`.

No convertir CI de otro SHA en CI del SHA evaluado. Los cambios documentales de esta rama tampoco son validación de runtime.

## 10. D1/D2/D3 y próximos límites

- D1 permanece OPEN: clasificación completa de entrypoints/APIs/callers, contrato de root/mapping, Chronicle parent/child y admisión antes de lecturas persistentes no están cerrados.
- D2 permanece OPEN: ownership de admisión, jerarquía de locks, release uncertainty, identidad del objeto y recuperación requieren contrato y evidencia.
- D3 permanece OPEN.
- P03/P04/P05 continúan como propuestas/gates abiertos; esta reconciliación no los ratifica.
- No inferir inaccesibilidad de repair por su exclusión de alcance.
- No migrar ni hacer dual-write legacy.

## 11. Alcance de esta reconciliación

Esta rama contiene cambios documentales únicamente. No se modificaron runtime, tests, workflows, package scripts, configuración del dispositivo ni la instancia real de Continuity. No se ejecutaron pruebas ni CI. No se modificó PR #110 ni su rama original.

La rama se crea desde el HEAD de referencia para mantener intacto PR #110. Esta reconciliación no declara M0 completo ni concede nuevas autorizaciones de ejecución.


---

## DELTA — ACLARACIONES CONTRACTUALES D1/D2 (2026-11-03)

Se añadió [NCS M0 — addendum de cierre de brechas D1/D2](NCS_M0_D1_D2_GAP_CLOSURE_ADDENDUM_2026-11-03.md), que precisa:
- delegación pura Chronicle: el padre no lee ni adquiere; el child es owner de la operación;
- reentrada: rechazo/STOP antes de lecturas adicionales y helpers sin readquisición;
- allowlist de metadatos de raíz y del I/O propio del protocolo de admisión antes de la primera lectura del snapshot;
- criterios binarios separados para cierre de diseño y verificación de implementación;
- consecuencia de mantener UNKNOWN el ownership de estado legacy.

Estas aclaraciones son propuestas técnicas y no ratifican P03/P04/P05. P05, P06, P07, P08 y P09 permanecen OPEN. D1/D2/D3 siguen OPEN; D1/D2 implementation no autorizada; no se ejecutaron tests/CI ni se modificó runtime. Root legítima PENDING/UNKNOWN; authorization NOT_EVALUATED; ROOT_READY NOT ESTABLISHED; M0_BUILD_COMPLETE NOT ACHIEVED; efectos protegidos STOP.


## DELTA — ANÁLISIS P05 (2026-11-03)

Se añadió [P05 recovery policy decision analysis](NCS_M0_D2_P05_RECOVERY_POLICY_DECISION_ANALYSIS_2026-11-03.md). Conclusión: no retry de negocio ni readmisión automática tras release incierto; la regla fail-closed local no basta por sí sola para garantizar bloqueo cross-process después de terminar el proceso. P05 sigue OPEN hasta demostrar quiescencia externa o un mecanismo de lock ligado a identidad del objeto. No se elige una primitiva ni se añade infraestructura persistente. No hay cambios de runtime/tests/CI.


### DELTA P05 — FUENTE DE LOCKS FIJADA A SHA (2026-11-03)

La revisión estática de las fuentes del SHA base de producto `99dabcb33be1efef5c4f5e368dc95140e45ff672` quedó incorporada en el análisis P05:
- Continuity blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`: retry de retirada por path y `lockReleaseFailures` local al proceso.
- Chronicle blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`: token-check seguido de retirada por path, sin cuarentena cross-process; `loadCurrent()` no adquiere lock per-store.
- Ninguna de esas fuentes demuestra identidad del objeto durante release/readmisión.

P05 sigue OPEN. No se ejecutaron pruebas de carrera ni se seleccionó mecanismo de recuperación. El análisis no cambia autorización ni estado M0.

### DELTA P05 — B1 contrastado con D1 (2026-11-03)

Se amplió el análisis P05 con una comparación estática de B1/flock frente a los entrypoints y APIs del SHA de producto `99dabcb33be1efef5c4f5e368dc95140e45ff672`.
- La API pública `src/nexo/application/index.mjs` reexporta queries y Chronicle append; las factories de Continuity/Chronicle también están exportadas. Un wrapper `flock(1)` alrededor del CLI no cubre consumidores directos.
- Envolver el CLI padre completo retendría admisión durante `spawnSync`; el child Chronicle no debe heredarla y debe adquirir la propia. Esto hace incompatible ese wrapper global con la composición D1.
- B1 requiere todavía adquisición nativa dentro del owner Node o una frontera obligatoria de procesos/APIs con todos los callers clasificados. Ninguna está diseñada ni verificada.
- B1 = CANDIDATO CON BRECHA D1 IDENTIFICADA — NO SELECCIONADO. P05, D1 y D2 permanecen OPEN.
- Solo documentación; sin runtime/tests/CI, sin comandos Termux, sin cambios al dispositivo ni a la instancia real de Continuity.
### DELTA P05 — VIABILIDAD DE LOCK DENTRO DE NODE (2026-11-03)

El análisis P05 se amplió con secciones 11.9–11.11 sobre la integración de `flock(2)` dentro del owner Node y la frontera de las factories:
- El `package.json` del SHA producto examinado no declara dependencias ni addons nativos; el runtime usa `node:fs`/`node:fs/promises` y no se identificó una integración flock existente.
- Un mutex JavaScript no coordina procesos. `flock(1)` externo no cubre APIs importables y un wrapper del padre entra en conflicto con Chronicle child.
- Un addon/helper nativo sería candidato no presente ni validado en Termux. Además, las factories exportadas de stores tendrían que exigir contexto de operación admitida para evitar bypasses internos.
- No se selecciona ni autoriza addon, helper, broker o refactor. P05/D1/D2 siguen OPEN.
### DELTA D1 — FRONTERA DE FACTORIES Y STORES (2026-11-03)

El addendum D1/D2, §11, registra una inspección estática puntual de factories/callers en SHA producto `99dabcb...`.
- Proteger solo CLI o `application/index.mjs` es insuficiente: queries, Chronicle append, continuity-service y scripts de repair alcanzan `loadCurrent()` por rutas distintas; las factories de ambos stores siguen exportadas desde módulos internos.
- Candidato mínimo no seleccionado: owner de admisión por operación; stores exigen capacidad/contexto admitido; helpers consumen snapshot/contexto y no reabren stores; manifest/import-graph guard limita imports internos; Chronicle child valida y adquiere su propia admisión.
- La capacidad JavaScript no reemplaza el lock cross-process de D2/P05. ESM privado/símbolo/convención no constituye frontera contra código arbitrario con acceso al repo.
- La inspección no es manifest exhaustivo y no acredita ausencia de imports dinámicos/consumidores externos ni enforcement. Repair callers siguen clasificados según exclusiones M0, no como PASS.
- No se unifican factories ni se selecciona broker/addon/helper. P03/P04/P05 y D1/D2 siguen OPEN; implementación/tests/CI no autorizados.
### DELTA D1 — VIOLACIÓN ESTÁTICA O-10 EN SHA PRODUCTO (2026-11-03)

El addendum D1/D2 §12 registra un hallazgo concreto en SHA `99dabcb33be1efef5c4f5e368dc95140e45ff672`: `runNexoChronicleAppend()` hace `loadCurrent()` de Chronicle y Continuity antes de llamar `openNexoContinuityOwner()`; las queries read-only llaman `loadCurrent()` directamente sin admisión de instancia visible; `openNexoContinuityOwner()` hace su primera lectura antes de devolver el owner. Los locks per-store no equivalen a admisión de instancia O-10.
- Clasificación: STATIC ORDERING VIOLATION IDENTIFIED en las rutas inspeccionadas; no es prueba de carrera ni de ejecución en Termux.
- Corrección requiere rediseño D1-IMPLEMENTATION: admitir antes de preflight, dar admisión propia a queries read-only y mantener Chronicle child como owner independiente. No basta mover el lock dentro de `openNexoContinuityOwner()`.
- D1-IMPLEMENTATION NO AUTORIZADA; no se modificó código ni se ejecutaron tests/CI. D1/D2/P05 OPEN.
### DELTA D1 — SECUENCIA CORRECTIVA O-10 (2026-11-03)

El addendum §12.6 fija una secuencia de referencia no ratificada: queries read-only y Chronicle append validan/normalizan primero, resuelven root, adquieren admisión antes de crear/leer stores, usan un snapshot bajo la misma admisión y liberan según D2/P05; Chronicle child conserva owner independiente. `openNexoContinuityOwner()` no puede hacer primera lectura sin admisión; bootstrap sigue separado. No se selecciona API/lock/contexto/layout. Depende de P03/P04/P05 y mapping P08; no autoriza implementación/tests.
### DELTA P08 — ROOT→STORE MAPPING NO RESUELTO (2026-11-03)

El addendum D1/D2 §13 contrasta O-08 con el SHA de producto `99dabcb...`: `scripts/nexo.mjs` y el Chronicle child siguen aceptando paths `--continuity`/`--chronicle`; application APIs y factories reciben `filePath` caller-supplied; no hay resolver común `--root` que derive ambos destinos. Los nombres `continuity.json`/`chronicle.json` siguen siendo ilustrativos, no layout ratificado. La publicación real `$HOME/.nexo-continuity.json` no fija el destino Chronicle ni el layout normal.
- Dictamen: P08 OPEN / LAYOUT UNSELECTED; bloquea D1 hasta mapping común inequívoco.
- Pendiente: destino Continuity (adoptar o no el objeto publicado), destino Chronicle, reglas de root existente/flags legacy, canonicalización/aliases, propagación al child y tratamiento de datos existentes.
- No se seleccionan filenames ni migración; sin runtime/tests/CI.
### DELTA P08 — CANDIDATO DE LAYOUT QUE CONSERVA CONTINUITY (2026-11-03)

El addendum §13.5 propone, sin ratificar ni implementar: `<root>/.nexo-continuity.json` + `<root>/.nexo-chronicle.json`, ambos derivados de una única `--root` explícita/canonicalizada.
- Continuity conserva el destino exacto de la primera publicación real, evitando segunda fuente o migración de ese objeto.
- Chronicle es nombre candidato nuevo; no se presume que exista ni se inicializa en append. Requiere inventario de colisiones y bootstrap separado.
- No se decide nombre/primativa de admisión; P03/P04/P05 siguen abiertos. No se alteran formatos ni locks per-store.
- P08 permanece OPEN hasta inventario no mutante en root real y compatibilidad Chronicle; no se toca instancia real ni se autoriza implementación/tests/CI.
### DELTA P08 — SIDEcars Y COLISIONES DERIVADAS (2026-11-03)

El addendum §13.6 confirma por inspección estática que ambos stores derivan `<filePath>.lock`; Chronicle deriva temporales por basename (`.tmp`, `.tmp-*`); bootstrap Continuity valida root+relativePath pero no resuelve ambos stores ni hace root-aware a las factories normales.
- Para el candidato `.nexo-continuity.json` / `.nexo-chronicle.json`, el inventario no mutante debe cubrir documentos, `.lock`, temporales estables/únicos, symlinks y directorios conflictivos.
- No borrar locks/temporales durante inventario. No se afirma que esos sidecars existan en el dispositivo.
- P08 sigue OPEN; sin inspección del filesystem del dispositivo ni cambios runtime/tests/CI.