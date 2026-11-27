# NCS M0 — RAW-1: criterios de evidencia R1 para cerrar la incertidumbre de configuración

**Fecha:** 2026-11-26  
**Rama:** `ncs-m0-raw1-r1-evidence-criteria-2026-11-26`  
**Base:** `ncs-m0-o7-p07c-traceability-2026-11-27`, HEAD `1ca68897d5c4e1061f89d7aa32b15d2a51e94f70`  
**Snapshot de producto:** `d8b5ca8720908d926acc18130614cce132a43b5d`  
**Tipo:** especificación documental de evidencia; no es autorización de ejecución, prueba, implementación, ratificación normativa ni cierre O7/P09.

## 1. Pregunta probatoria exacta

RAW-1 ya está confirmado como **escritor condicional estático**: `scripts/assistants.mjs` obtiene `NEXO_LUMINA_MEMORY_PATH` del entorno y puede llegar a `fs.writeFile(MEMORY_PATH, ...)`. Si el destino efectivo coincide con el archivo Continuity protegido y la precondición de JSON parseable se cumple, el flujo puede sobrescribirlo sin que se observe admisión Nexo en ese tramo.

Lo que no está demostrado es si una invocación concreta dentro de R1 recibió un destino efectivo que aliasara el archivo Continuity protegido, ni si ocurrió una escritura real. La captura Termux anterior solo acredita que el alias no fue observado en aquel shell/instante.

La siguiente unidad probatoria debe responder, para **una invocación R1 identificada**:

1. ¿Qué ejecutable/launcher y qué SHA/blob de código se invocaron?
2. ¿Qué valor efectivo recibió esa invocación para `NEXO_LUMINA_MEMORY_PATH` (UNSET o valor configurado)?
3. ¿A qué objeto filesystem resolvería ese valor en el contexto de esa invocación?
4. ¿Ese objeto es el archivo Continuity protegido, otro objeto protegido del perímetro ratificado, o un destino fuera de él?
5. ¿La observación se obtuvo sin ejecutar la ruta de escritura?

No convertir la respuesta sobre una invocación en una afirmación permanente sobre todas las sesiones, launchers o procesos futuros.

## 2. Unidad de observación y vinculación

Una observación válida debe estar vinculada a una única ventana R1 y registrar como mínimo:

- Identificador local de la sesión/ventana y fecha/hora local, sin incluir secretos ajenos.
- Dispositivo y contexto R1 ya declarados: Android sandbox, HOME privado Termux, invocación manual foreground.
- Revisión Git exacta, SHA del commit y blobs de los archivos relevantes: entrypoint `scripts/assistants.mjs`, launcher/package script y store Continuity.
- Launcher realmente utilizado (por ejemplo, package script o invocación directa), directorio de trabajo y cadena de procesos padre/hijo hasta el entrypoint.
- UID/identidad de proceso pertinente, HOME efectivo y ruta de proyecto efectiva.
- Estado de `NEXO_LUMINA_MEMORY_PATH` en el entorno **del proceso que ejecutaría el entrypoint**, no solo en una shell distinta: `UNSET` o valor exacto de ruta. No volcar el entorno completo ni otras variables.
- Resolución de ruta en el mismo contexto: ruta absoluta normalizada, componentes symlink relevantes y destino final si existe.
- Para el target existente: tipo de objeto y fingerprint filesystem disponible (`st_dev`, `st_ino`, `nlink`, owner y mode), comparados con el archivo Continuity protegido identificado en esa misma ventana. Registrar también los límites de lo que Android/Termux permite observar.
- Resultado y limitaciones de la captura; hash/integridad del artefacto de evidencia cuando sea posible.

Una ruta textual igual no basta por sí sola para demostrar identidad de objeto; un inode observado en un instante tampoco demuestra continuidad futura del nombre. Si el destino no existe, está inaccesible, es ambiguo o la resolución no puede verificarse, clasificar UNKNOWN.

## 3. Regla de seguridad para obtener la evidencia

**No ejecutar `npm run assistants`, `node scripts/assistants.mjs` ni otra ruta que alcance la escritura con un alias al perímetro protegido.** El propósito es observar configuración y resolver destino, no provocar el efecto que se está investigando.

La obtención debe ser estrictamente no mutante respecto de Continuity, Chronicle, locks, temporales, archivos de publicación y namespaces protegidos. No editar variables para forzar el alias, no crear un fixture en el store real, no iniciar simulación, no borrar/renombrar/mover archivos, no abrir bootstrap/repair ni hacer cleanup.

Si la observación descubre que el destino efectivo resuelve a cualquier objeto del perímetro protegido, detener el procedimiento antes de invocar el escritor. Conservar la evidencia de configuración y clasificar el seam como **RAW-1 CONFIGURED-TO-PROTECTED / STOP**; no intentar demostrar la escritura mediante una ejecución real.

Si el destino es UNSET o resuelve al default `.lumina-assistant-memory.json`, registrar únicamente **NO ALIAS OBSERVED IN THIS INVOCATION**. Esto no prueba exclusión universal, ausencia de configuración en otra sesión, ni enforcement.

## 4. Clasificación obligatoria de resultados

| Resultado observado | Clasificación permitida | Lo que NO permite afirmar |
|---|---|---|
| Variable UNSET en el proceso/launcher capturado; default resuelto fuera del perímetro | NO ALIAS OBSERVED — INVOCATION-BOUNDED | No prueba ausencia global, futura o en otros launchers |
| Variable configurada; destino resuelto fuera del perímetro | CONFIGURED-OUTSIDE-PERIMETER — INVOCATION-BOUNDED | No prueba que todas las rutas/aliases estén excluidos |
| Variable configurada; destino coincide con objeto Continuity o cualquier objeto del perímetro ratificado | CONFIGURED-TO-PROTECTED — STOP | No ejecutar el escritor; no afirmar que la escritura ocurrió |
| Valor no observable, launcher distinto, resolución ambigua, symlink/mount no resoluble, fingerprint insuficiente | UNKNOWN — EVIDENCE INSUFFICIENT | No convertir ausencia de evidencia en ausencia de alias |
| Evidencia de una escritura real preexistente, independiente y atribuible | AFFECTATION OBSERVED, con alcance temporal y objeto precisos | No generalizar a todos los launchers ni declarar cobertura completa |

La etiqueta `RUNTIME WRITE NOT OBSERVED` debe permanecer si no existe evidencia independiente de una escritura real. La capacidad estática RAW-1 permanece CONFIRMED aunque una invocación concreta no tenga alias.

## 5. Qué cierra y qué no cierra esta unidad

Una observación bien vinculada puede cerrar únicamente la pregunta de **configuración efectiva de RAW-1 en esa invocación/ventana**. No cierra por sí sola:

- O7 completo: inventario de todos los actores/capacidades capaces de afectar el perímetro.
- P09: cobertura de callers/entrypoints dentro del universo declarado.
- Control permanente de variables de entorno, launchers futuros, procesos hijos, loaders dinámicos o consumidores externos.
- Enforcement común de admisión para escritores Lúmina.
- RAW-2: la ruta `NEXO_STATE_PATH` sigue con su precondición de schema y no se debe volver a afirmar que sobrescribe Continuity existente sin contraejemplo.
- B2 replacement-safe cleanup, B3 durable/interprocess BLOCKED, ni P07-C/P05.
- Cualquier PASS, CI-VERIFIED, autorización de commissioning o efecto protegido.

Para cerrar O7 se necesita además una demostración de exclusión/enforcement que cubra los actores relevantes del perímetro ratificado, o un claim de cobertura explícitamente más estrecho con límites aceptados por la autoridad correspondiente. Una captura de entorno aislada no satisface ese requisito.

## 6. Evidencia mínima que debe conservarse

El paquete de una observación R1, si se autoriza en una etapa posterior, debe incluir:

1. Contexto R1 y ventana exacta.
2. SHA de producto y blobs exactos de launcher/entrypoint/store.
3. Cadena de invocación y proceso que recibió el entorno efectivo.
4. Estado de la variable, sin volcar otras variables.
5. Resolución del destino y comparación del fingerprint contra el perímetro.
6. Declaración explícita de que no se ejecutó la ruta escritora ni se mutaron objetos protegidos.
7. Clasificación según §4, limitaciones y hash del paquete de evidencia.

No crear una segunda captura genérica de shell. No repetir el censo P09, la búsqueda previa de `assistants.mjs|simulate.mjs`, ni el inventario Termux ya documentado. La nueva observación solo aporta valor si se liga a una invocación real concreta y responde a los campos anteriores.

## 7. Estado y autorización

- RAW-1 static conditional writer: **CONFIRMED**.
- Alias configurado en R1: **UNKNOWN / NOT ESTABLISHED**; la captura previa solo fue puntual.
- Escritura runtime sobre Continuity protegido: **NOT OBSERVED**.
- O7: **UNKNOWN / OPEN**.
- P09: **OPEN / UNKNOWN** en el universo declarado.
- P07-C: **UNKNOWN / BLOCKING**.
- P05-C: **RATIFICADA**; P05: **OPEN**.
- `authorization: NOT_EVALUATED`.
- Commissioning / protected effects: **STOP**.
- NCS M0: **INCOMPLETO**.

Este documento define criterios probatorios; **no autoriza** una nueva captura en dispositivo, una ejecución del entrypoint, pruebas, cambios de código, selección de mecanismo, cleanup, readmisión ni efectos protegidos. Cualquier observación posterior requiere autorización específica para esa actividad y debe respetar el STOP ante un destino protegido.

