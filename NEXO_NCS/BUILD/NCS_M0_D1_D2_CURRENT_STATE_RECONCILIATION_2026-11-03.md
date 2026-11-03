# NCS M0 — reconciliación del estado vigente D1/D2
Fecha: 2026-11-03
Rama de referencia: `ncs-lumina-decoupling-2026-10-29`
HEAD de referencia: `99dabcb33be1efef5c4f5e368dc95140e45ff672`
Estado del checkout comunicado por el propietario: limpio en ese HEAD.
Tipo: reconciliación documental de evidencia; no declara cierre D1/D2 ni M0.

## 1. Propósito y regla de precedencia

Este documento reconcilia el registro de decisiones, el manifiesto D1, las especificaciones D2 y las deltas vigentes de `NEXO_NCS/STATUS.md` con la fotografía de código identificada arriba.

No reescribe ni elimina antecedentes. Las afirmaciones históricas siguen describiendo lo que se observó en sus fechas y SHA; cuando una delta posterior contiene evidencia nueva, esa delta gobierna el estado actual. Ninguna evidencia se proyecta a otro SHA sin comprobar que el artefacto/fuente correspondiente sea el mismo.

Estados que deben permanecer separados:

- **DECIDED:** decisión expresa del propietario.
- **DOCUMENTED:** requisito o análisis registrado.
- **IMPLEMENTED:** comportamiento presente en código.
- **TESTED / CI-VERIFIED:** test o CI ligado a un SHA concreto.
- **EXERCISED:** operación realmente ejecutada en el entorno indicado.
- **VERIFIED:** propiedad observada directamente, con alcance y límites expresos.
- **OPEN / UNKNOWN / BLOCKED:** no se infiere cierre por ausencia de errores, documentación o evidencia parcial.

Esta pasada consultó fuentes GitHub y documentos del repositorio. No ejecutó tests, CI, comandos Termux ni operaciones sobre el dispositivo o el archivo real de Continuity. El único cambio de esta unidad es este documento.

## 2. Fotografía y fuentes

La fotografía de referencia es el HEAD local comunicado por el propietario (`99dabcb...`); el commit fue recuperado en GitHub. Los siguientes blobs se inspeccionaron en ese commit:

| Fuente | Blob SHA | Uso en esta reconciliación |
|---|---|---|
| `NEXO_NCS/STATUS.md` | `3451a1d2b75bbc7c3de8e8e8c684f2ff7c922f0d` | Estado vigente E2/E3, publicación y gates |
| Registro D0–D3 | `53691bce19edc20c6a3acb6dd99aca4d6d58e33a` | O-08…O-11 y P-01…P-10 |
| Manifiesto D1 | `d49996d00ed46e71d6acf777dc8134ac55571570` | Baseline histórico de entrypoints/edges |
| Especificación P-03/P-04 | `baa28e3b868aa0262b9aa9edd837d06938aacd4d` | Propuesta de admisión y propiedad de locks |
| Especificación P-05 | `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c` | Propuesta de release incierto/readmisión |
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | CLI Nexo y dispatch Chronicle |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | Entry point Chronicle independiente |
| `scripts/nexo-continuity-bootstrap.mjs` | `d6547b62efcda0665e66dc111972544ea9ebe15e` | Launcher M0 de primera publicación |
| `scripts/assistants.mjs` | `5d773332acf1f762ea9e2eb48dfcf5a5267470d6` | Corte actual del launcher Lúmina |
| `scripts/simulate.mjs` | `ec322cdff76392d7c99a4f45bf35f76a8b91b667` | Persistencia de simulación y round-trip legacy |
| `src/nexo/application/continuity-queries.mjs` | `e1915e94e53e71d37a37952fead37ba62bdae79a` | APIs de query/snapshot |
| `src/nexo/application/chronicle-append.mjs` | `c1964467d68043d06e035ad59720f8cec2e52e52` | Composición de append y separación bootstrap/operación |
| `src/nexo/core/continuity-service.mjs` | `53fd7043266635b30a1e01b69bb00d28feda300c` | Bootstrap restringido y apertura de owner |
| `src/nexo/core/continuity-store.mjs` | `c1eb81bf74d2df576079b3269ac4db22d87fe7b6` | Lock/read/write de Continuity |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` | Lock/read/write de Chronicle |
| `tests/nexo/entrypoint.test.mjs` | `5bd53340301acdf2887371772f22a3730da4cd1f` | Entry point e import-graph checks acotados |
| `tests/nexo/m0-import-graph-guard.test.mjs` | `9a4e2a3ec42dcce5737555b182ca367649085405` | Clasificación de raíces y separación de grafos |
| `tests/nexo/continuity-bootstrap-launcher.test.mjs` | `ad470a44fbd98ee465baedd55ef3ffe4ccf2d590` | Contrato del launcher/preflight |
| `package.json` | `a42af401a51fde4d38488d136420506b3ed80b38` | Scripts y cadena local de tests |
| Workflow Chronicle | `65b2bc04a015f5bd1fe010e3f3eec6e0481514e7` | Cobertura CI declarada |
| Workflow mission-admission | `03f2a0cb8268e442ce4db434383b0f4854073d82` | Cobertura CI declarada |
| Workflow Lúmina/NCS decoupling | `354188c374754c23a8d017bd3f66de266f58dde3` | Regresión de separación y suite npm |
| Expediente P01-G / RE-01/02 | `bad58c6fd2ed49668b2626c7cda0d81c04bd5023` | Regla P01-G y requisitos del launcher |
| Expediente R1 / E2/E3 | `3ba45d5fd9e9e3912047f198fc2838e46849ed6f` | Criterios y evidencia operacional |
| Writer/path boundary | `4021da3eba522f6dc2b73e10cfc45e899a4817eb` | Límites del lock y del filesystem |

La coincidencia de blob SHA permite reutilizar evidencia de una fuente histórica cuando el blob no cambió. No convierte el manifiesto entero en actual: varias fuentes cambiaron y se identifican por separado arriba.

## 3. Decisiones y estado operativo vigente

| Elemento | Estado reconciliado | Alcance / límite |
|---|---|---|
| O-08 | RATIFICADO | Una raíz explícita para operación normal; sin fallback ambiental/legacy ni bootstrap implícito. La implementación del CLI normal todavía no demuestra ese contrato. |
| O-09 | RATIFICADO | Definir separación Nexo/Lúmina antes del corte mínimo; la separación de código actual tiene evidencia posterior, pero no prueba exclusividad operacional del destino. |
| O-10 | RATIFICADO | Queries, previews y Chronicle dentro del alcance requieren admisión antes de leer datos persistentes. No existe evidencia de cobertura universal en la fotografía actual. |
| O-11 | RATIFICADO | Release incierto => UNKNOWN/BLOCKED; sin retry de negocio ni readmisión hasta resolver incertidumbre. No selecciona mecanismo de recuperación. |
| P01-A | DECIDED — L | Continuity M0 es persistencia operacional local con influencia acotada; no crea Constitución, identidad ni autoridad constitucional, ni autoriza efectos protegidos. No reabrir. |
| P01-G | RULE RATIFIED BY OWNER | La primera creación L no autoritativa puede basarse en autorización operacional humana explícita, única y acotada. No reutilizar ni ampliar Constitution Authority Context; no crea Genesis Trust Foundation ni ROOT_READY. |
| P01-B — corte Nexo/Lúmina | IMPLEMENTED; test/CI evidence exists | La separación de launchers/grafos tiene código y guardas. La evidencia CI debe citarse con el SHA/run que la produjo, no proyectarse automáticamente a HEAD 99dabcb. |
| B2 / P01-B del §10.6 | C — NO SELECCIONAR TODAVÍA | Es la decisión distinta sobre alternativa de aislamiento. No confundir con el corte operacional implementado. |
| RE-01 / RE-02 | IMPLEMENTED / CI-VERIFIED / EXERCISED IN TERMUX | Launcher dedicado, preflight y enlace raíz explícita → destino efectivo; la publicación restringida posterior está completada. No repetir bootstrap. |
| E2 | PARTIAL / NOT CLOSED | R1 aceptado; el control sostenido de escritores relevantes durante la ventana no está demostrado. |
| E3 | PARTIAL / NOT CLOSED | El inventario puntual está documentado; no demuestra control sostenido de relanzadores locales relevantes. |
| E4 | VERIFIED — SCOPE LIMITED | Comprobación post-escritura del objeto real: ruta, tipo, UID, modo 0600, tamaño, hash y estructura. No prueba fsync/durabilidad ni exclusión de escritores no cooperativos. |
| P-03 / P-04 | OPEN — PROPOSAL NOT RATIFIED | Alcance/vida del snapshot, propietario de admisión por flujo y composición con locks per-store siguen pendientes. |
| P-05 | OPEN — PROPOSAL NOT RATIFIED | No se eligió mecanismo A/B de recuperación/readmisión tras release incierto. |
| P-09 | UNKNOWN / BLOCKED donde aplique | No se declara cierre de consumidores externos ni de loaders dinámicos/computados no cubiertos por los guardas estáticos. |
| NCS M0 | INCOMPLETO | E2/E3 y los gates de autoridad/commissioning/efectos permanecen separados y no cerrados. |

La publicación real del 2 de noviembre supersede los estados previos de “preflight cancelado”, “primera publicación STOP” y “E4 NOT READY” únicamente para esa instancia y esa operación. El registro de la cancelación anterior se conserva como historia. La publicación no eleva E2/E3 ni cambia `authorization: NOT_EVALUATED`, raíz constitucional `PENDING/UNKNOWN`, `ROOT_READY` no establecido, commissioning `STOP` ni efectos protegidos `STOP`.

## 4. D1 — clasificación de las superficies en el HEAD de referencia

### 4.1 CLI Nexo y Chronicle

- `scripts/nexo.mjs` sigue aceptando `--continuity` para status, mission status, plan y previews; no implementa el contrato normal de raíz única `--root` en estas rutas.
- El parser de Chronicle del CLI padre reenvía los argumentos a `scripts/nexo-chronicle-session.mjs` mediante `spawnSync`.
- `scripts/nexo-chronicle-session.mjs` sigue siendo directamente ejecutable y acepta `--continuity`, `--chronicle`, misión/paso y flags de inicialización. No exige ni valida la raíz única contractual.
- `runNexoChronicleAppend()` ahora bloquea `initializeContinuity: true` antes de abrir stores, admitir misión o ejecutar el paso (`NEXO_M0_CONTINUITY_BOOTSTRAP_OPERATION_SEPARATION_REQUIRED`). Esto demuestra separación bootstrap/operación en esa ruta; **no** demuestra root admission.
- Resultado D1: CLI normal, hijo Chronicle, mapping padre/hijo y admisión antes de I/O permanecen **OPEN**.

### 4.2 Queries, previews y APIs de aplicación

- `continuity-queries.mjs` conserva factories path-based y llama `loadCurrent()` para status, mission status/plan, draft preview y Open Loops.
- `loadCurrent()` usa el lock per-store cooperativo de Continuity. Ese lock coordina participantes del store; no equivale a una admisión de instancia que se mantenga hasta el último uso del snapshot.
- Las APIs de aplicación y las factories siguen siendo superficies invocables directamente. El CLI no puede ser tratado como único caller ni su parser como frontera universal.
- Los archivos `--draft` / `--request`, stdin/contenido Chronicle y metadata de raíz/lock son inputs distintos de los stores de negocio; su clasificación exacta en la frontera P-03 sigue pendiente.
- Resultado D1/P-03: **OPEN**. La condición O-10 no está demostrada en la fotografía actual.

### 4.3 Stores y locks existentes

- `continuity-store.mjs` conserva un lock por path. El código actual bloquea recuperación automática de locks stale; ante fallo de release intenta una limpieza adicional y, si vuelve a fallar, conserva una cuarentena en un `Set` local del proceso.
- `chronicle-store.mjs` conserva una implementación distinta: valida token antes de release y devuelve fallo si la retirada falla; no tiene el mismo retry explícito de Continuity.
- La diferencia de release es real y debe preservarse hasta caracterización y decisión; no unificar locks por conveniencia.
- Los locks per-store no prueban propiedad de una admisión de instancia común, exclusión de writers no cooperativos ni identidad segura del objeto de lock a través de una carrera check/use.
- Resultado D1/P-04/P-05: las factories y los callers requieren contexto/ownership explícitos; **OPEN**.

### 4.4 Separación Nexo/Lúmina

- En el snapshot actual, `assistants.mjs` ya no importa `openNexoContinuityOwner`, repair ni APIs Nexo; opera sobre estado del mundo y memoria de aprendizaje Lúmina.
- `simulate.mjs` ya no abre Continuity ni importa servicios Nexo. Conserva `nexoMemory` histórico solo como campo opaco de round-trip; no lo interpreta ni lo convierte en memoria operativa Nexo.
- `m0-import-graph-guard.test.mjs` clasifica explícitamente las raíces de producto, recorre imports estáticos literales y comprueba que los grafos Nexo/Lúmina no crucen las dependencias prohibidas. También clasifica wrappers de repair como gated.
- Esto actualiza el manifiesto histórico: `assistants` y `simulate` ya no deben describirse como excepciones ejecutables que abren Continuity en este snapshot. Su clasificación actual es Lúmina, con el campo legacy opaco preservado.
- Límite: un guard de imports estáticos no demuestra por sí solo inexistencia de consumers externos, carga computada no literal, escritura directa por filesystem ni exclusividad E2/E3. Tampoco convierte el dato legacy opaco en autoridad Nexo.
- Resultado: corte de dominio **IMPLEMENTED en fuente y cubierto por tests/flujo CI dedicado**; la cobertura global de callers y E2/E3 siguen separadas.

### 4.5 Repair y callers desconocidos

- Repair permanece fuera del alcance operativo M0 según O-07. Los wrappers identificados están clasificados/gated por los tests de arquitectura actuales.
- La exclusión de alcance no equivale a inalcanzabilidad universal. No declarar cerrado un caller dinámico, indirecto o externo que no haya sido resuelto contra una evidencia concreta.
- No repetir el barrido histórico de 188 archivos. Reabrir únicamente una arista concreta si cambia el source snapshot o aparece evidencia de un caller con capacidad relevante.

### 4.6 Workflows

- El workflow Chronicle ejecuta store, runtime Chronicle y entrypoint tests; sus filtros de paths no prueban root-admission coverage.
- El workflow mission-admission ejecuta tests seleccionados de runtime/store/migración/Chronicle; tampoco demuestra admisión de instancia para todos los callers.
- El workflow NCS Lúmina decoupling incluye el guard de import graph, launcher tests, regresión Lúmina y `npm test`.
- La existencia de un test en `package.json` o en un workflow no es evidencia de que ese workflow haya pasado en HEAD 99dabcb. Los PASS históricos deben conservar su SHA/run exactos. Esta pasada no ejecutó ni consultó una nueva corrida CI.

## 5. D2 — puertas que siguen abiertas

### P-03 — alcance y duración de admisión

La regla O-10 está ratificada; la propuesta concreta de P-03 no. Debe decidirse y probarse:

1. Qué operaciones públicas deben adquirir admisión antes de la primera lectura persistente de Continuity/Chronicle.
2. Qué incluye exactamente el intervalo protegido: desde antes de la primera lectura hasta el último uso del snapshot y las escrituras de la misma operación.
3. Cómo se clasifican metadata de raíz, lock/owner records, archivos externos `--draft`/`--request`, stdin y otros inputs. La lectura del protocolo de admisión no autoriza lectura anticipada de stores de negocio.
4. Cómo una API de aplicación recibe/obtiene contexto admitido y evita validación retroactiva después de `loadCurrent()`.
5. Cómo se mantiene inmutable el snapshot o se vuelve a admitir una lectura posterior.

**Estado: OPEN; propuesta no ratificada; enforcement no demostrado.**

### P-04 — propietario y composición de locks

Debe decidirse por flujo el único propietario de admisión de instancia y el contrato para helpers. El diseño debe cubrir:

- Query/preview: un solo dueño entre API pública y CLI; no ambos.
- Chronicle delegado: el padre no retiene el mismo lock mientras espera al hijo; el hijo valida/adquiere por sí mismo.
- Chronicle directo: idéntica validación y admisión, sin bypass por ejecución directa.
- Helpers: reciben contexto ya admitido y no reentran al lock de instancia.
- Factories y owner APIs: callers directos quedan clasificados; no se declaran `INTERNAL_ONLY` por intención.
- Locks per-store: preservar semánticas existentes hasta caracterización y pruebas específicas.

**Estado: OPEN; no hay contrato de ownership ratificado.**

### P-05 — release incierto y readmisión

El contrato debe mantener separadas tres dimensiones: resultado de negocio/persistencia, resultado de release y permiso de readmisión.

La implementación actual conserva diferencias relevantes: Continuity hace un retry de limpieza y mantiene cuarentena local tras fallos repetidos; Chronicle no hace ese retry. La cuarentena local no coordina procesos distintos. Una comprobación de token seguida de eliminación por path no demuestra por sí sola que se retire la misma instancia del lock si el path se reemplaza entre operaciones.

Siguen pendientes:

1. Selección expresa del criterio de readmisión (quiescencia operacional demostrable u otro mecanismo ligado a identidad del objeto).
2. Evidencia de que el actor anterior ya no puede alterar el estado protegido.
3. Pruebas de reemplazo de lock durante release/limpieza y preservación del objeto sustituto.
4. Comportamiento ante persistencia confirmada + release incierto y persistencia UNKNOWN + release incierto.
5. Criterio verificable para no permitir readmisión mientras la identidad/actividad anterior siga ambigua.

No se autoriza inferir recuperación por edad, PID aparentemente muerto, path ausente, variable local o timeout.

**Estado: OPEN; alternativas A/B no seleccionadas; no hay protocolo de recuperación/readmisión aprobado.**

## 6. Matriz D1/D2 de salida

| Gate | Estado vigente | Evidencia que sí existe | Qué impide cerrarlo |
|---|---|---|---|
| D1 — corte Nexo/Lúmina | IMPLEMENTED, alcance de imports estáticos | Fuentes actuales, guard de grafo, workflow dedicado | Consumers externos/dinámicos y alcance operacional E2/E3 no se deducen del guard |
| D1 — raíz normal | OPEN | O-08 y launcher bootstrap dedicado | CLI normal y Chronicle siguen path-based; no `--root` común |
| D1 — Chronicle hijo | OPEN | Separación bootstrap/append y tests de entrypoint | Hijo directo sin root/admission contractual |
| D1 — queries/previews | OPEN | Store reads lock-aware | Falta admisión de instancia antes de lectura y durante consumo del snapshot |
| D1 — factories/callers | PARTIAL / UNKNOWN residual | Guardas y callers internos conocidos | No se prueba cobertura universal de consumers externos/dinámicos |
| D2 — P-03 | OPEN | Requisito O-10 y propuesta documental | Alcance/inputs/duración/contexto no ratificados ni verificados |
| D2 — P-04 | OPEN | Locks per-store caracterizados parcialmente | Dueño de admisión por flujo y composición no ratificados |
| D2 — P-05 | OPEN | O-11 y comportamiento fail-closed parcial | Identidad del lock, recuperación y readmisión no resueltas |

## 7. Secuencia mínima siguiente

1. **No repetir inventarios.** Usar esta reconciliación como baseline y abrir únicamente un edge concreto si aparece evidencia nueva.
2. **Resolver P-03** en una propuesta breve de decisión: frontera pre-read, duración del snapshot y clasificación de inputs externos/metadata.
3. **Resolver P-04** con una matriz de ownership por flujo que preserve Chronicle directo/delegado y evite doble adquisición.
4. **Resolver P-05** comparando el protocolo de quiescencia R1 con los límites de identidad del filesystem; no introducir una nueva primitiva persistente sin necesidad demostrada.
5. Una vez ratificadas las decisiones, implementar únicamente los gaps resultantes y ligar tests/CI al SHA exacto. No declarar PASS por documentos o CI de un SHA anterior.

## 8. Gates superiores que no cambian

- E2: PARTIAL / NOT CLOSED.
- E3: PARTIAL / NOT CLOSED.
- E4: REAL-DESTINATION POST-WRITE OBJECT CHECK VERIFIED, alcance limitado.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional: PENDING/UNKNOWN.
- `ROOT_READY`: no establecido.
- Commissioning: STOP.
- Efectos protegidos: STOP.
- NCS M0: INCOMPLETO.
- PR #110: OPEN / DRAFT / NOT MERGED según STATUS vigente.

No repetir bootstrap. No tocar, borrar, cambiar permisos ni reinicializar `$HOME/.nexo-continuity.json`. Esta reconciliación no autoriza operación posterior, commissioning, autoridad constitucional ni efectos protegidos.
