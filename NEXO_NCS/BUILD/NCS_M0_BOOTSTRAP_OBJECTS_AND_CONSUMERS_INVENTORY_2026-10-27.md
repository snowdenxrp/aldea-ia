# NCS M0 — Inventario estático de objetos de bootstrap y consumidores

**Fecha:** 2026-10-27  
**Rama:** `ncs-clean-architecture`  
**Estado:** EVIDENCIA ESTÁTICA PARCIAL — DOCUMENTACIÓN ÚNICAMENTE — NO IMPLEMENTACIÓN / NO TEST / NO CI

## 1. Propósito y límite

Este documento responde una pregunta concreta: qué objetos de persistencia aparecen en los contratos de diseño y qué objetos/rutas se observan en las fuentes actuales relacionadas con la inicialización de Continuity y Chronicle.

No es un inventario exhaustivo del filesystem ni un grafo transitivo cerrado. No demuestra que los paths usados por cada despliegue sean iguales, que las rutas se hayan ejecutado, que exista una raíz canónica operativa ni que un objeto sea inofensivo en todos sus consumidores. La clasificación de «no autoritativo» exige una decisión de alcance y evidencia de consumidores; no se deduce del nombre del archivo.

## 2. Fuentes exactas consultadas

| Archivo | Blob SHA observado | Qué aporta |
|---|---|---|
| `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` | `bac9493af98c3f86001e323dab153bdee78b5f31` | Layout propuesto de raíz, contrato de admisión y límites de garantías. |
| `NEXO_NCS/BUILD/NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md` | `3c48fadfaeaa7dfbbee01bd40d619bdbf9da2c83` | Decisión aceptada de separar inicialización explícita del commit normal; no autoriza implementación. |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | CLI hijo; acepta `--continuity`, `--chronicle`, `--initialize-continuity`, `--initialize-chronicle` y ejecuta `runNexoChronicleAppend`. |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` | Preflight de ambos stores, inicialización condicional y posterior admisión de misión / operación Chronicle. |
| `src/nexo/core/continuity-service.mjs` | `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c` | Inicializa Continuity desde proyección legacy o snapshot vacío cuando el caller lo permite. |
| `src/nexo/core/continuity-store.mjs` | `9ffd28930abdbe29f5b041711cc29b74dc99fbae` | Envelope Continuity, lock por ruta y creación inicial exclusiva cooperativa. |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` | Documento Chronicle, lock por ruta y creación inicial. |
| `NEXO_NCS/BUILD/NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md` | `d49996d00ed46e71d6acf777dc8134ac55571570` | Clasificación de entrypoints y excepciones D1; grafo transitivo permanece abierto. |

Los SHA son blobs observados en esta consulta de la rama indicada, no prueba de que hayan sido ejecutados o probados por CI.

## 3. Objetos de persistencia y estado de evidencia

| Objeto / clase | Evidencia documental o estática | Consumidores/efectos conocidos en el alcance inspeccionado | Clasificación actual |
|---|---|---|---|
| Archivo Continuity indicado por `continuityPath` | Store de Continuity con envelope `NEXO_CONTINUITY_STORE`, versión 1, revisión y snapshot. | `openNexoContinuityOwner`; admisión/reconstrucción de misiones y pasos; intentos, `doNotRepeat`, ejecuciones y journal de efectos según el snapshot. | Operacionalmente significativo. No es prueba de autoridad; no está demostrado que todo consumidor externo esté inventariado. |
| Archivo Chronicle indicado por `chroniclePath` | Store Chronicle con schema `NEXO_CHRONICLE`, versión 1, revisión y entradas. | Append de contenido Chronicle; contratos de efecto/settlement asociados a la ruta de append. | Operacionalmente significativo. No es raíz de autoridad; no se demuestra aislamiento universal de consumidores. |
| Directorio `<filePath>.lock/` | Ambas factories derivan el lock de la ruta del archivo; intentan crear el directorio y luego escribir el registro de propietario. | Coordinación de escritores que usan el mismo protocolo cooperativo. | Mecanismo de coordinación local, no autoridad. No garantiza exclusión de escritores que ignoren el lock ni protección contra actores locales hostiles. |
| `<filePath>.lock/owner.json` | Registro de propietario del lock con PID/token (y `createdAt` en Continuity). | Lectura para reconocer propiedad y liberar lock. | Metadato de coordinación, no credencial constitucional. No demuestra por sí mismo legitimidad ni permiso de efecto. |
| Temporales de persistencia (`.tmp` y variantes heredadas) | Las stores contienen lógica de escritura temporal y exploración/limpieza de temporales; el contrato de raíz advierte que los temporales/locks existentes requieren política explícita. | Escritura/reemplazo de los archivos de store y recuperación/limpieza según el store. | Objetos transitorios con impacto en integridad. No asumir que son marcadores de bootstrap ni que su ausencia prueba un estado nuevo. |
| `<root>/.nexo-instance.lock/` y `owner.json` de admisión compartida | Aparecen como layout/candidato en el contrato de raíz de instancia. | La garantía buscada sería serializar la operación completa de instancia entre procesos cooperantes. | PROPUESTA DE DISEÑO; no afirmar que exista en runtime ni confundirlo con los locks por-store actuales. |
| Estado Lúmina/simulación/legacy memory | El manifiesto D1 clasifica `assistants.mjs` y `simulate.mjs` como excepciones de diseño; el servicio Continuity acepta `legacyMemory` y puede proyectarlo si el store no existe. | Las rutas de simulación/asistentes pueden persistir estado de mundo y/o pasar memoria legacy a Continuity. | Frontera Nexo/Lúmina pendiente de demostrar para todas las rutas. Una proyección de datos no establece autoridad; la separación semántica completa no puede afirmarse sin contrato/consumidores. |

### Precisión sobre nombres

`continuity.json` y `chronicle.json` son nombres del layout propuesto, no valores forzados por las factories mostradas: las fuentes de runtime reciben `filePath`/`continuityPath`/`chroniclePath`. Por tanto, no se afirma que todas las ejecuciones actuales creen literalmente esos dos nombres ni bajo una raíz común.

## 4. Orden observado en la ruta Chronicle

La inspección estática de `runNexoChronicleAppend` muestra esta secuencia de alto nivel:

1. Valida opciones e identidad de misión/paso.
2. Construye las factories de ambos stores con rutas independientes y una deadline compartida.
3. Hace preflight de ambos stores para detectar ausencia/errores antes de inicializar cualquiera.
4. Si un store está ausente y no se proporcionó la bandera de inicialización correspondiente, bloquea.
5. Abre el owner de Continuity, con `allowEmptyInitialization` derivado de `initializeContinuity`.
6. Si Chronicle estaba ausente y la inicialización fue solicitada, inicializa Chronicle.
7. Continúa hacia admisión de misión y ejecución de la operación Chronicle.

Esto documenta una brecha contractual a resolver: la bandera de inicialización no es una prueba de autoridad; además, la ruta no se detiene necesariamente al terminar la creación de los stores. No se afirma que el camino se haya ejecutado en este trabajo ni se concluye que todo dispatch sea un efecto externo protegido. El resultado público conserva `authorization: NOT_EVALUATED`; eso no equivale a autorización.

## 5. Respuesta provisional a la pregunta de alcance

Con la evidencia actual **no está justificado clasificar todo el bootstrap como estrictamente no autoritativo**: los stores de Continuity participan en admisión/reconstrucción y journal operativo; Chronicle participa en la ruta de append; las fuentes aceptan rutas de archivos como configuración y el grafo de consumidores no está cerrado.

Tampoco está demostrado que esos archivos sean la raíz constitucional o establezcan autoridad. La conclusión correcta es más limitada:

- Los archivos de store son persistencia operacional con consecuencias de control de flujo y registro.
- Los locks/owner records son coordinación, no autoridad.
- La propuesta de raíz compartida es distinta de los locks por-store existentes.
- La autoridad constitucional, el permiso para crear persistencia y el permiso para efectos siguen siendo preguntas separadas.
- Hasta que el propietario delimite el alcance de M0 y se cierre el grafo de consumidores aplicable, el alcance de bootstrap local permanece `UNKNOWN/PENDING`; no se implementa una suposición.

## 6. Qué falta, sin repetir el censo completo

1. Mapear los consumidores ya conocidos de los dos stores a las colecciones/entradas que leen o escriben; reusar el manifiesto D1 y el mapa de consumidores existente.
2. Identificar solo las rutas que consumen directamente snapshots, entradas Chronicle, locks/owner records o temporales fuera de los callers ya documentados.
3. Decidir explícitamente si M0 permite crear estos stores como persistencia operacional no autoritativa, bajo qué precondiciones y con qué exclusiones. La etiqueta «no autoritativo» no debe interpretarse como «sin consecuencias operativas».
4. Mantener la separación explícita de inicialización (opción B ya aceptada como diseño) y la pregunta independiente de qué precondición legitima la creación.
5. Solo tras contrato congelado y autorización específica: diseñar/ejecutar pruebas de aislamiento, preservación, concurrencia y rutas no-bypass en el SHA exacto.

## 7. Estado y límites

- M0: `INCOMPLETO`.
- D1-DESIGN: `OPEN`; grafo de consumidores no cerrado.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Alcance del bootstrap local: `UNKNOWN/PENDING`.
- Autoridad para la primera creación local: `UNKNOWN/PENDING`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- No se modificaron runtime, tests, workflows o configuración ejecutable.
- No se ejecutaron pruebas, CI ni Actions.

## 8. Continuidad para la siguiente sesión

Leer primero `NEXO_NCS/STATUS.md`, luego este inventario y el manifiesto D1 existente. Continuar con el paso 6.1: mapear consumidores concretos a los objetos ya identificados y registrar únicamente aristas sin resolver. No repetir el inventario de entrypoints ni declarar el grafo cerrado por esta tabla. No implementar ni ejecutar pruebas sin autorización separada.


## 9. Matriz de consumidores concretos — actualización dirigida (2026-10-27)

Consulta estática adicional de los blobs indicados; no se ejecutaron los módulos.

| Objeto / colección | Consumidor directo confirmado en el snapshot consultado | Relación observable | Límite / arista todavía abierta |
|---|---|---|---|
| Snapshot completo Continuity | `src/nexo/core/continuity-snapshot.mjs` (`56cbd1753f1fa3fb67c3592e5a5664b58d96c4c3`) | Declara exactamente `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`; describe el objeto como continuidad operacional. | La descripción del módulo no demuestra que todos los consumidores downstream respeten una separación de autoridad. |
| `missions` | `src/nexo/core/continuity-operations.mjs` (`cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5`); `src/nexo/application/chronicle-append.mjs` (`5a20044bcddbaee79d0117934eefaea5f3b2c3bc`) | Operación registra misión; Chronicle busca la misión por ID y admite una nueva si no existe. | Faltan todos los consumers indirectos de misiones/pasos y una prueba de que cada ruta de admisión esté dentro de la frontera de autoridad aprobada. |
| `attempts` | `src/nexo/core/continuity-operations.mjs` (`cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5`) | Registra resultados de intentos; la misma operación puede añadir una entrada `doNotRepeat`. `src/nexo/orchestrator.js` (`de257324cabfaae69219f71e598bb83c1aafc0a1`) expone conteos de señales de memoria al construir misiones. | El mapa no prueba exhaustividad de toda lectura de intentos ni corrección ante todo estado de fallo. |
| `doNotRepeat` | `src/nexo/orchestrator.js` (`de257324cabfaae69219f71e598bb83c1aafc0a1`) | `repeatBlocked` puede excluir pasos cuyo action/target coincide con una restricción de memoria. | Es una influencia directa sobre planificación, no una autorización. Falta cerrar otras entradas de planificación y el límite Nexo/Lúmina en todos los callers. |
| `executions` | `src/nexo/core/continuity-operations.mjs` (`cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5`) | Registra resultado de adapter con clave de idempotencia y preserva primer resultado para la misma identidad. | No demuestra que cada efecto externo tenga registro correlacionado ni que un registro sea prueba de efecto real. |
| `effectJournal` | `src/nexo/core/continuity-operations.mjs` (`cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5`); `src/nexo/application/continuity-queries.mjs` (`e1915e94e53e71d37a37952fead37ba62bdae79a`) | Operaciones validan obligaciones y estados; consulta de estado informa conteos de entradas, obligaciones PREPARED y estados observados. | La consulta es de lectura, pero muestra que el journal participa en el estado operativo. Falta enumerar todos los consumidores que condicionan dispatch/settlement/reconciliation. |
| Entradas Chronicle | `src/nexo/core/chronicle-store.mjs` (`59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`); ruta `src/nexo/application/chronicle-append.mjs` (`5a20044bcddbaee79d0117934eefaea5f3b2c3bc`) | El store carga entradas y la ruta de append crea/usa contratos de efecto para persistir contenido. | No se cierra aquí el conjunto de lectores Chronicle ni se demuestra que el registro represente un efecto externo verificado. |
| Lock y `owner.json` por-store | `src/nexo/core/continuity-store.mjs` (`9ffd28930abdbe29f5b041711cc29b74dc99fbae`); `src/nexo/core/chronicle-store.mjs` (`59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`) | Coordinan participantes que adquieren el mismo lock derivado de la ruta. | El escritor no cooperante, los procesos externos y la semántica exacta del filesystem objetivo quedan fuera de lo probado. No equivale al lock de instancia propuesto. |

### Aristas no resueltas resultantes

1. **Admisión → runtime/adapter:** el caller Chronicle puede pasar de store bootstrap a admisión y `executeNexoStepWithContinuityOwner` en la misma invocación. La presencia de `authorization: NOT_EVALUATED` no resuelve la legitimidad de esa transición.
2. **Legacy memory → Continuity:** la proyección conserva las cinco colecciones de `memory.nexo`; la ausencia del archivo más una memoria legacy no nula puede tomar la ruta de proyección aunque `allowEmptyInitialization` no sea la causa de la inicialización. La legitimidad de importar esa memoria y la separación Nexo/Lúmina requieren una regla explícita.
3. **Journal → reconciliación/dispatch:** el journal afecta obligaciones y estados operativos, pero no es raíz de confianza. Debe mantenerse separado el significado de registro, verificación de resultado y autoridad para iniciar un efecto.
4. **Query → snapshot:** `continuity-queries.mjs` lee directamente el store y deriva conteos operativos. La inclusión de todas las lecturas/preview en la frontera de admisión sigue dependiendo de D2.
5. **Lock local → creación:** el lock protege solo a participantes cooperantes. No se ha demostrado la garantía frente a escritores ajenos al protocolo ni la atomicidad de la creación entre los dos stores.

**Cierre de esta actualización:** la matriz aclara consumidores directos de las cinco colecciones y varias aristas; no cierra D1 ni autoriza a reclasificar el bootstrap como inocuo/no autoritativo. Se mantienen UNKNOWN donde falta evidencia. Ningún test/CI/Actions ejecutado; no se cambió código ejecutable.


## 10. Lectores de Chronicle y límites de la API pública (actualización dirigida, 2026-10-27)

Fuentes adicionales de la misma rama:

| Archivo | Blob SHA | Observación estática |
|---|---|---|
| `src/nexo/application/index.mjs` | `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3` | Exporta `runNexoChronicleAppend` como único caso de uso mutador de Chronicle; las otras exportaciones enumeradas son consultas de Continuity y previews de misión. |
| `src/nexo/adapters/chronicle-effect.mjs` | `6daf742eb0048724557151a728bf807613a854e9` | Usa el store de Chronicle mediante `loadCurrent` y `append` para observar/validar la operación y verificar la entrada. |
| `src/nexo/core/chronicle-settlement-contract.mjs` | `4d04930cbf67b5943916cc497dd44b14c87e27bd` | El contrato dice explícitamente que el registro estructural de settlement no es autenticación, atribución causal ni garantía de durabilidad. |
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | Router CLI independiente; enruta `chronicle-append` al hijo y expone status/mission status/plan/previews basados en Continuity. |

### Qué puede afirmarse

- En la API pública consultada, el mutador Chronicle expuesto es `runNexoChronicleAppend`; el store ofrece `loadCurrent`, `initialize` y `append`.
- El adapter Chronicle lee el estado actual para resolver idempotencia/observación y luego opera sobre el store. La entrada persistida incluye `operationKey` y `content`; el contrato de settlement local no acredita por sí solo que el efecto sea auténtico, causalmente atribuible ni durable ante pérdida de energía.
- No se encontró en las exportaciones públicas inspeccionadas un endpoint separado de lectura/listado de Chronicle. Esta afirmación se limita a `application/index.mjs` y `scripts/nexo.mjs`; no es una búsqueda exhaustiva de todos los consumidores internos o externos del repositorio.
- Las consultas de status/plan/preview enumeradas en la API pública leen Continuity, no se deben etiquetar como lectores Chronicle solo porque pertenecen a la misma aplicación.
- El contrato del store advierte que `filePath` es configuración confiable, no sandbox; no se afirma resistencia a symlink/path attacks ni rollback protection.

### Aristas que quedan abiertas

1. **Adapter → observación → append → settlement:** falta evidencia de ejecución/CI vinculada a un SHA exacto para comprobar los caminos de éxito, conflicto y resultado desconocido; el código estático no sustituye esas pruebas.
2. **API pública vs consumidores privados:** la ausencia de exportación de lectura Chronicle no prueba que no existan imports internos directos del store ni consumidores fuera del repositorio.
3. **Persistencia local vs veracidad:** una entrada Chronicle o un settlement estructural no deben promoverse a prueba de efecto externo ni a autoridad constitucional.
4. **Configuración de ruta:** sigue pendiente el contrato aprobado para validar que ambas rutas de store pertenecen a la raíz de instancia legítima y no se escapan de su ámbito.

No se cierra D1 con esta sección. La clasificación sigue siendo parcial, basada en los archivos citados; no se ejecutaron módulos, tests, CI ni Actions.


## 11. Cadena de observación Chronicle: append, verificación y atribución (2026-10-27)

Fuentes estáticas de la rama `ncs-clean-architecture`:

| Archivo | Blob SHA | Función relevante |
|---|---|---|
| `src/nexo/adapters/chronicle-effect.mjs` | `6daf742eb0048724557151a728bf807613a854e9` | Construye handler, verifier y postcondition para la acción `chronicle_append`. |
| `src/nexo/adapters/chronicle-observation.mjs` | `82c7531fcb143f38a5f121ffcc5b5ab44a9d419f` | Vuelve a leer el store y compara la clave de operación y el contenido esperado. |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` | `append` persiste `operationKey` + `content`; `loadCurrent` devuelve revisión y entradas. |
| `src/nexo/core/chronicle-settlement-contract.mjs` | `4d04930cbf67b5943916cc497dd44b14c87e27bd` | Valida la forma de un settlement local sin elevarla a autenticación, atribución causal o garantía de durabilidad. |

### Secuencia que muestra el código

1. El handler valida la forma de la operación y llama `store.append({ operationKey: missionId + ":" + stepId, content })`.
2. Si el store informa `committed` o `already_present`, el handler devuelve `status: completed` pero conserva `verified: false`.
3. El verifier llama a `observeChronicleOperation`, que vuelve a cargar el store y comprueba si hay exactamente una entrada con la clave y el contenido esperado.
4. La observación devuelve `applied` cuando encuentra una coincidencia exacta, `not_applied` si no encuentra ninguna, y `unknown` para entradas duplicadas, conflicto de contenido, estado inválido o fallo de lectura.
5. La observación declara `causalAttribution: not_established`; por tanto, la coincidencia persistida acredita el estado local observado, no que esta invocación concreta causó la entrada ni que represente un efecto externo.

### Consecuencia para la clasificación

- **Resultado del handler ≠ verificación posterior:** `completed` con `verified: false` no debe describirse como efecto verificado.
- **Observación local ≠ autoridad:** una entrada coincidente no autoriza el efecto que se registró ni demuestra una raíz constitucional legítima.
- **Ausencia observada ≠ permiso para repetir:** `not_applied` es una observación en una revisión concreta; no resuelve por sí misma carreras posteriores ni concede autorización de redispatch.
- **UNKNOWN debe permanecer UNKNOWN:** un store ilegible o con forma inesperada no debe convertirse en éxito inferido.
- Esta cadena es específica del adapter Chronicle inspeccionado. No demuestra que otros adapters ni todas las rutas de efecto compartan las mismas garantías.

### Evidencia aún necesaria

1. Pruebas de contrato vinculadas al SHA exacto que demuestren las transiciones handler → verifier → postcondition en éxito, contenido conflictivo, ausencia, duplicado y fallo de lectura.
2. Confirmación de que la máquina de estados de `executeNexoStepWithContinuityOwner` no confunde `completed` con `verified` antes de la postcondition.
3. Definición separada de qué evidencia basta para autorizar un efecto y qué evidencia basta para afirmar que el efecto ocurrió.
4. Contrato de raíz/rutas y admisión previa a la primera lectura persistente, aún abierto en D1/D2.

Esta sección registra semántica estática observada; no se ejecutó el flujo. No cierra D1, no ratifica B2 y no autoriza cambios de implementación.


## 12. Cruce con owner-backed runtime: PREPARED, recuperación y resultado terminal (2026-10-27)

Fuente estática adicional: `src/nexo/core/owner-backed-runtime.mjs`, blob SHA `a7a014489209273ce78d0103afa785728d4c467c`.

### Evidencia observada en el código

- Antes de un dispatch nuevo, el runtime comprueba que el adapter admita la acción y que adapter y owner dispongan de reconciliación; también reconstruye misión/paso y comprueba estado y dependencias.
- Registra `PREPARED` y exige respuesta `committed`, confirmación `preparedCommitted: true` y una revisión exactamente incrementada antes de llamar a `adapter.executePrepared`. Ante resultado desconocido, no despacha.
- El runtime contiene una rama de recuperación de obligaciones Chronicle ya existentes. La recuperación consulta/reconcilia el estado; los comentarios del código indican que reiniciar no debe redispatchar una operación Chronicle sin observarla.
- Después de la reconciliación, registra un resultado terminal con evidencia `nexo-chronicle-persisted-invariant`. Comprueba también el contrato de revisión de ese registro; si no puede confirmarlo, devuelve `UNKNOWN` en vez de promoverlo a completado.
- La operación Chronicle es la única acción no-repair con contrato end-to-end de verifier + settlement + resultado terminal que el módulo declara habilitada. Las acciones de repair tienen un rechazo separado hasta disponer de su contrato de settlement.

### Interpretación limitada

Esta evidencia reduce una incertidumbre concreta: **en el runtime inspeccionado, `completed` del handler no parece ser suficiente por sí solo para producir el resultado terminal final**. Existe una etapa posterior de reconciliación y confirmación de resultado terminal. Esto es una lectura estática del código, no una prueba ejecutada.

No demuestra:
- que todos los entrypoints lleguen a este runtime bajo una autoridad legítima;
- que las rutas de persistencia estén vinculadas a una raíz de instancia autorizada;
- que la observación Chronicle establezca causalidad o veracidad de un efecto en el mundo externo;
- que todos los consumidores, adapters o procesos externos respeten esta secuencia;
- que el comportamiento concurrente y los cortes de proceso cumplan el contrato en el entorno objetivo.

### Pendientes de verificación

1. Contrastar esta secuencia con las pruebas existentes sin ejecutarlas ni cambiar código; identificar exactamente qué pruebas cubren PREPARED, recuperación, postcondition y resultado terminal.
2. Mantener separadas las afirmaciones «el runtime local exige una reconciliación» y «el sistema está autorizado para iniciar el efecto»: la segunda sigue sin demostrarse.
3. Vincular cualquier conclusión futura de comportamiento a una ejecución de tests/CI autorizada y al SHA exacto.

No se modificó runtime ni tests; esta actualización es documental. D1 sigue OPEN, D1-IMPLEMENTATION NO AUTORIZADA y los efectos protegidos permanecen STOP.


## 13. Matriz estática de cobertura de tests para PREPARED → reconciliación → resultado terminal (2026-10-27)

Inspección de texto de tests en la rama; **no se ejecutaron**:

| Test | Blob SHA | Cobertura visible en el archivo |
|---|---|---|
| `tests/nexo/chronicle-runtime.test.mjs` | `0bf35f0dc1aadb121a8b2145b4963bacd5641c04` | Dependencias y estado canónico antes de PREPARED; commit PREPARED desconocido/conflictivo/malformado; confirmación de revisión; fallo de handoff de lock; lineage; reconciliación desconocida; recuperación sin redispatch; postcondition y resultado terminal; conflictos/errores de outcome. |
| `tests/nexo/continuity-migration.test.mjs` | `0bef1b93c6268042f14830c97e084d0a543e05f4` | No permite lineage sin PREPARED; rechaza finalización basada solo en afirmación del caller; reconstrucción de settlement Chronicle sin outcome; evidencia/identidad discordante; forma canónica del outcome; recuperación de obligaciones PREPARED y settlement observado. |

### Anclas concretas encontradas en el texto

- En `chronicle-runtime.test.mjs`: caso nominal con orden explícito `prepare → dispatch → lineage → reconcile → outcome` (aprox. líneas 500–560); PREPARED conflictivo/desconocido/malformado y revisión inválida (aprox. 550–700); lineage/reconciliación desconocidos y handoff inseguro (aprox. 700–820); recuperación y replay de outcome sin redispatch (aprox. 880–980); pruebas del adapter real y postcondition (aprox. 1050–1450); rutas de bootstrap en el tramo posterior.
- En `continuity-migration.test.mjs`: validación de lineage/PREPARED (aprox. 100–210); reconstrucción y binding de evidencia de settlement/outcome Chronicle (aprox. 300–535); formas y respuestas de `recordOutcome`, incluida recuperación (aprox. 640–760).

### Qué cubre y qué no prueba

- La **presencia estática** de estos casos da evidencia de que los archivos contienen aserciones específicas para los contratos citados. No acredita que pasen hoy, que se ejecuten en CI, ni que correspondan al mismo SHA del runtime actual.
- La matriz es parcial: no se ha establecido aquí que todas las ramas, todos los entrypoints, todos los adaptadores ni todas las condiciones de filesystem estén cubiertos.
- Las pruebas con owners/adapters simulados verifican contratos del runtime frente a esos dobles; no prueban por sí solas durabilidad física, concurrencia con escritores externos no cooperantes, raíz de instancia legítima o autoridad constitucional.
- La inspección textual identificó una batería amplia sobre postcondition y replay, pero todavía debe revisarse el diff entre SHA de tests y runtime, y confirmarse la selección real de tests/CI antes de hacer afirmaciones de cobertura ejecutada.

### Próximo paso preciso

1. Comparar el blob SHA del test con el SHA actual de `owner-backed-runtime.mjs` y sus imports para evitar atribuir cobertura a una implementación distinta.
2. Identificar los nombres exactos de test/runner y workflows que ejecutarían esta batería; documentar selección y evidencia CI existente, sin disparar una ejecución nueva.
3. Mantener separadas cobertura textual, resultado de test ejecutado y evidencia CI vinculada a commit.

Esta sección es un mapa estático de cobertura declarada, no un informe de ejecución ni cierre de D1.


## 14. Selección del runner y vínculo con los blobs actuales (2026-10-27)

Fuentes consultadas en la misma rama:

| Archivo | Blob SHA | Dato verificable por inspección |
|---|---|---|
| `package.json` | `e45dc6d215db53ea2758009cd501f565634e3610` | El script `test` encadena explícitamente `node tests/nexo/chronicle-runtime.test.mjs`. No enumera `tests/nexo/continuity-migration.test.mjs` en la cadena mostrada. |
| `src/nexo/runtime.js` | `9d3d5109753e8ba96fc287c269da275112645523` | Exporta `executeNexoStepWithContinuityOwner` desde `src/nexo/core/owner-backed-runtime.mjs`. |
| `src/nexo/core/owner-backed-runtime.mjs` | `a7a014489209273ce78d0103afa785728d4c467c` | Implementa la secuencia runtime descrita en §12. |
| `tests/nexo/chronicle-runtime.test.mjs` | `0bf35f0dc1aadb121a8b2145b4963bacd5641c04` | Importa el runtime público y contiene casos de contrato descritos en §13. |
| `tests/nexo/continuity-migration.test.mjs` | `0bef1b93c6268042f14830c97e084d0a543e05f4` | Contiene casos de migración/reconstrucción/settlement; su inclusión en la cadena `npm test` no está demostrada por el script inspeccionado. |

### Consecuencia

- Hay una ruta declarada en `package.json` para ejecutar `chronicle-runtime.test.mjs` a través de `npm test`, pero esto **no demuestra que se haya ejecutado**, que esté verde ni que CI utilice ese script.
- La cobertura de `continuity-migration.test.mjs` es visible en el archivo, pero su selección automática por el script `test` no se acredita aquí. Puede existir otra ruta de ejecución; no se afirma que el archivo nunca se ejecute.
- No se pudo identificar una ruta de workflow CI a partir de los dos nombres convencionales consultados (`.github/workflows/ci.yml` y `.github/workflows/tests.yml` no están presentes en esa rama con esos nombres). Esto no prueba ausencia de workflows: no se enumeró el directorio completo.
- Los SHA de blob identifican contenidos individuales; para atribuir un resultado de test a una versión exacta debe existir un run/commit de CI verificable y una relación explícita con el árbol de ese commit.

### Pendiente mínimo de evidencia CI

1. Identificar el workflow realmente configurado en la rama y su comando de test.
2. Verificar si `continuity-migration.test.mjs` está seleccionado por otra ruta o requiere inclusión explícita.
3. Registrar un run existente y su SHA exacto si está disponible; no disparar un run nuevo en este trabajo.

No se ejecutaron tests, `npm test`, CI ni Actions. No se modificó `package.json`, workflows ni código ejecutable.


## 15. Corrección de selección de tests: workflows específicos sí existen (2026-10-27)

La búsqueda adicional encontró los workflows reales en esta rama; por tanto, la incertidumbre de §14 se resuelve parcialmente. La conclusión de §14 sobre la ausencia de selección en el script general `package.json` sigue siendo cierta, pero no implicaba ausencia de otra ruta de ejecución.

| Workflow | Blob SHA inspeccionado | Selección relevante |
|---|---|---|
| `.github/workflows/nexo-m0-acceptance.yml` | `60323063fe6656eb7e7710825f327fa7e39526c3` | Trigger `push` filtrado a `ncs-clean-architecture` y paths; también `workflow_dispatch`. Ejecuta `chronicle-runtime.test.mjs` y, en el paso “Crash cuts and owner recovery”, `continuity-migration.test.mjs`. |
| `.github/workflows/nexo-m0-repair-crash-cuts.yml` | `35e93581fd33912165f7adfb9656952e76c567fa` | Trigger `push` a la misma rama con paths específicos; también `workflow_dispatch`. Ejecuta `continuity-migration.test.mjs` como paso independiente y pruebas de reparación relacionadas. |

Fuentes directas:
- [Workflow de aceptación M0](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-acceptance.yml)
- [Workflow de crash cuts y reparación](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-repair-crash-cuts.yml)

### Límites de la evidencia actual

- Queda demostrada **la selección declarada por los archivos YAML**; no queda demostrado que un run se haya disparado para los SHA de tests/runtime inspeccionados ni que haya pasado.
- El endpoint de runs consultado para el commit documental del checkpoint no devolvió runs asociados; ese resultado no es un historial exhaustivo, porque la operación disponible filtra runs asociados a pull requests y devuelve solo la primera página.
- El estado combinado de checks para el commit documental también devolvió una lista vacía. Como el commit solo cambia documentación, esto no prueba fallo de tests ni ausencia de ejecución para commits anteriores.
- Búsquedas de texto no produjeron un run ID verificable. No atribuir los runs históricos de otros workflows Nexo a estos dos workflows.
- Para cerrar la evidencia de ejecución hace falta consultar el historial de Actions de cada workflow y vincular un run a su `head_sha`; después, comprobar jobs, pasos y conclusión. No se disparó ni reintentó ningún workflow.

### Estado actualizado de cobertura

1. `chronicle-runtime.test.mjs`: selección declarada en ambos flujos pertinentes, con alcance exacto condicionado por triggers/path filters.
2. `continuity-migration.test.mjs`: selección declarada tanto en el workflow de aceptación M0 como en el workflow de crash cuts.
3. Tests ejecutados/CI verde para SHA exacto: **NO VERIFICADO en esta revisión**.

Esta sección corrige y precisa §14; no cambia los gates de NCS ni autoriza ejecución.


## 16. Por qué el checkpoint documental no demuestra ni dispara CI (2026-10-27)

Cruce de los triggers/path filters de §15 con los commits de documentación recientes:

- Los dos workflows relevantes filtran `push` por cambios en rutas de código, tests, `package.json` y/o el propio YAML del workflow. No incluyen `NEXO_NCS/STATUS.md` ni `NEXO_NCS/BUILD/**` como rutas de trigger.
- Los commits recientes `4059f658038c09cdf78607af625c8ebd5fde43e9` y `f5a778fd7a90401a49a2b59d8a6150e1514225d7` son cambios documentales. Por los filtros declarados, no deben interpretarse como evidencia de que los workflows se dispararon; tampoco son el SHA de runtime/tests que habría que validar.
- La consulta disponible de runs por commit tiene una limitación explícita: solo devuelve runs asociados a pull requests y la primera página. La consulta de estado combinado del commit documental devolvió cero checks. Ninguno de esos resultados permite concluir que no existan runs históricos para otros commits.
- En las herramientas GitHub disponibles en esta sesión no aparece una acción de solo lectura para listar directamente el historial general de runs por `workflow_id`/archivo. Las acciones disponibles consultan runs asociados a un commit bajo esa limitación, o requieren un `run_id` ya conocido para inspeccionar jobs/logs. No se adivinó un run ID ni se usaron acciones de re-ejecución.

### Ruta de verificación externa, sin mutación

Abrir manualmente el historial de cada workflow y elegir una ejecución cuya rama sea `ncs-clean-architecture`:
- [Runs de aceptación M0](https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-acceptance.yml)
- [Runs de crash cuts M0](https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-repair-crash-cuts.yml)

Para cada ejecución, registrar `run_id`, `head_sha`, evento, conclusión del job, pasos concretos ejecutados y SHA/blob de los archivos de test/runtime que realmente estaban en ese commit. Si no hay una ejecución que coincida con los SHA relevantes, el estado correcto sigue siendo **CI NO VERIFICADO**, no “falló” ni “pasó”.

No se inició, canceló ni reintentó ningún workflow; no se ejecutaron pruebas ni se modificó código ejecutable.


## 17. Trazabilidad de pruebas frente a criterios B.5–B.7 (2026-10-27)

Esta sección refina la evaluación inicial tras inspeccionar los cuerpos de prueba, no solo su presencia en el workflow. Es una revisión estática; no ejecuta pruebas ni declara criterios satisfechos.

### B.5 — Inventario reproducible de entrypoints/callers y aristas

- `tests/nexo/entrypoint.test.mjs`, blob `ff1bd2e9d292e21e00049b354249aee684837bbc`, contiene `auditNexoImportGraph`: recorre recursivamente imports y re-exports relativos desde `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs`; rechaza dependencias de una lista explícita de módulos legacy y afirma que el grafo alcanza `chronicle-append.mjs` y consultas públicas, sin llegar a `src/nexo/runtime.js`.
- Es cobertura arquitectónica concreta, no ausencia de cobertura. El parser visible usa una expresión regular para imports/exports estáticos y rutas relativas. No demuestra cobertura de `import()` dinámico, resolución por alias/loader, procesos externos que no sean los escenarios expresamente probados, todos los callers del repositorio ni todas las rutas indirectas que el contrato D1 incluya.
- El grafo parte de dos raíces declaradas en esa prueba; por tanto, no equivale a un censo completo de todos los entrypoints/callers del sistema.

**Estado B.5:** evidencia parcial útil; inventario transitivo completo de todos los callers y aristas no demostrado.

### B.6 — Prueba arquitectónica de no-bypass ejecutada y ligada al SHA

- La prueba de entrypoint incluye guardas de import graph y rechaza comandos genéricos como `execute`, `run`, `simulate`, `shell`, `http`, `effect` y `repair` en la interfaz de entrada comprobada.
- `tests/nexo/protected-transition.test.mjs`, blob `65353fe9e20898fb13f225ee004240b6c54687f1`, prueba resultados del gate inyectado, incluido STOP y validación contra campos de autorización/raíz/Constitución proporcionados por el caller. Eso comprueba el contrato del componente probado; no acredita que cada caller real llegue a él ni que el gate inyectado sea la raíz constitucional legítima.
- `tests/nexo/chronicle-runtime.test.mjs`, blob `0bf35f0dc1aadb121a8b2145b4963bacd5641c04`, comprueba múltiples estados desconocidos y precondiciones de PREPARED/dispatch/resultado. Su alcance es el runtime y los escenarios incluidos en esa suite.
- No se ha recuperado una ejecución de Actions ligada a los SHA exactos de estos tests y del runtime. Su contenido no demuestra que se hayan ejecutado o pasado.

**Estado B.6:** tests presentes y relevantes; ejecución ligada al SHA evaluado y prueba arquitectónica exhaustiva de no-bypass siguen sin verificarse.

### B.7 — Separación entre admisión técnica, stores, identidad y autoridad constitucional

- `chronicle-runtime.test.mjs` comprueba expresamente que algunos resultados públicos UNKNOWN expongan `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y `redispatchAuthorized: false`.
- `protected-transition.test.mjs` comprueba que ciertos campos de autoridad/raíz/Constitución suministrados por el caller no se conviertan en contexto de política confiable.
- Estas aserciones respaldan propiedades locales de los módulos cubiertos; no demuestran por sí mismas una raíz legítima, una política constitucional operativa ni una frontera común aplicada a todos los entrypoints.

**Estado B.7:** separación local con evidencia de test; garantía global y legitimidad constitucional no demostradas.

### Conclusión y siguiente paso acotado

La revisión confirma cobertura arquitectónica real en `entrypoint.test.mjs`; la descripción anterior se corrige para no insinuar que solo contiene comprobaciones superficiales. El gap que permanece es más específico: alcance del grafo frente al inventario D1 completo, cobertura de aristas dinámicas/indirectas según el contrato, y evidencia de ejecución de los SHA relevantes.

Siguiente trabajo documental: cruzar las raíces y exclusiones de `auditNexoImportGraph` con el inventario de callers ya existente y registrar únicamente aristas fuera de su alcance. No repetir el censo completo ni modificar tests/runtime para resolverlo sin autorización separada.

Estados: revisión estática; tests no ejecutados en esta etapa; CI no vinculado a SHA de runtime/tests; D1-DESIGN OPEN; D1-IMPLEMENTATION NO AUTORIZADA; efectos protegidos STOP.


## 18. Cruce de raíces de entrypoint con callers directos de Continuity (2026-10-27)

Comparación estática de las dos raíces de `auditNexoImportGraph` (documentadas en §17) contra los consumidores directos previamente identificados. Se verificaron las referencias actuales en la rama `ncs-clean-architecture`:

| Archivo | Blob actual | Referencia a `openNexoContinuityOwner` | Relación con raíces del test |
|---|---|---|---|
| `scripts/nexo.mjs` | ver test de entrypoint | raíz de auditoría | Raíz explícita |
| `scripts/nexo-chronicle-session.mjs` | ver test de entrypoint | raíz de auditoría | Raíz explícita |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` | import en línea 1; uso en línea 326 | El test afirma que llega transitivamente a este caso de uso desde las raíces |
| `scripts/simulate.mjs` | `1b5e39b681486f583c1779770c52dd913227dfa1` | import en línea 3; uso en línea 262 | No es una raíz explícita de `auditNexoImportGraph`; su cobertura por esa función no está demostrada |
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | import en línea 9; uso en línea 50 | No es una raíz explícita de `auditNexoImportGraph`; su cobertura por esa función no está demostrada |

### Interpretación estricta

- Esto identifica dos consumidores directos que quedan fuera de las raíces explícitas de la guardia de import graph. No significa automáticamente que sean vulnerabilidades ni que estén dentro del alcance congelado de D1; esa clasificación depende del contrato y del mapa de callers existente.
- El workflow de aceptación incluye `entrypoint.test.mjs`, pero eso no incorpora automáticamente `scripts/simulate.mjs` ni `scripts/assistants.mjs` al recorrido recursivo: la función sigue las dependencias de las raíces dadas, no busca todos los consumidores del repositorio.
- El workflow de repair/crash-cuts incluye pruebas específicas para rutas de reparación, pero su selección no sustituye clasificar cada caller ni demostrar que todos convergen en una frontera autorizada.
- Acción siguiente, documental y acotada: comparar estos dos consumidores con el alcance de D1 y el censo existente; si el censo ya los clasifica, reutilizar esa clasificación. No repetir el inventario global, no declarar bypass sin evidencia y no cambiar runtime/tests.

Estado: hallazgo de cobertura/alcance estático pendiente de clasificación D1; no se ejecutaron pruebas ni CI.


## 19. Clasificación D1 reutilizada: excepciones de diseño, no barreras de runtime (2026-10-27)

Se contrastó el hallazgo de §18 con el manifiesto D1 existente (blob `d49996d00ed46e71d6acf777dc8134ac55571570`) y el registro de decisiones (blob `7dfd8058bad81c4cb70eb16c2c71e2d0f870d973`). No se rehizo el censo.

### Clasificación ya documentada

- `scripts/assistants.mjs` y `scripts/simulate.mjs` están marcados como `EXPLICIT_EXCEPTION — DESIGN ONLY`: quedan fuera de la ruta de instancia Nexo ordinaria mientras se define/verifica una frontera separada.
- El manifiesto dice expresamente que esta exclusión **no es protección de runtime** y no demuestra inaccesibilidad ni admisión de raíz.
- El registro mantiene P-HIST-08 y P-02 abiertos: contrato de integración/exclusión explícita y fronteras Nexo/Lúmina para ambos consumidores pendientes; no se debe asumir que sus accesos actuales están bloqueados.
- El manifiesto también señala que `assistants.mjs` ejecuta su ruta operacional al cargar el módulo, abre Continuity, persiste estado Lúmina/mundo y tiene una rama opcional de reparación; el wrapper de reparación bloquea esa acción concreta bajo Option A, pero no bloquea toda la ruta ordinaria.
- `simulate.mjs` tiene guardia de ejecución directa para `main()`, pero contiene helpers exportados y usa la ruta legacy fija de Continuity, vinculada a estado/memoria de simulación. Tampoco se ha demostrado que comparta la raíz canónica de la instancia Nexo.

### Resolución del hallazgo de §18

Los dos consumidores no son una incógnita nueva del inventario: ya están clasificados como excepciones de diseño. La incógnita pendiente es de cierre: confirmar que esa exclusión sigue siendo la decisión de alcance de M0 y definir/evidenciar su frontera de estado Nexo/Lúmina; no convertirla en una afirmación de bloqueo técnico. No se reabre el censo ni se deduce vulnerabilidad solo por el hecho de que el test de import graph no los use como raíces.

### Siguiente paso documental

Reutilizar P-HIST-08/P-02 y el manifiesto existente para anotar la condición exacta de salida de ambas excepciones, distinguiendo:
1. exclusión del alcance operativo ordinario M0;
2. comportamiento ejecutable actualmente presente;
3. evidencia necesaria para afirmar inaccesibilidad o aislamiento real.

No cerrar P-02/P-HIST-08 ni cambiar el alcance en nombre del propietario. No modificar runtime/tests/workflows ni ejecutar pruebas.

Estado: D1-DESIGN OPEN; D1-IMPLEMENTATION NO AUTORIZADA; excepciones documentales, no barreras técnicas demostradas.


## 20. Condiciones de salida para las excepciones P-02 / P-HIST-08 (2026-10-27)

Base documental reutilizada:
- Registro de decisiones `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, blob `7dfd8058bad81c4cb70eb16c2c71e2d0f870d973`, filas P-HIST-08 y P-02.
- Manifiesto D1 `NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md`, blob `d49996d00ed46e71d6acf777dc8134ac55571570`, incluidas las excepciones de diseño y sus límites.
- No se modifica ni se cierra ninguna decisión de propietario.

### A. `scripts/assistants.mjs` — integración compuesta Nexo + Lúmina

**Clasificación actual:** excepción de diseño; su exclusión no es una barrera de runtime. La ruta operacional observada toca Continuity, memoria de aprendizaje Lúmina y estado del mundo; no hay evidencia de atomicidad multi-store.

**Condiciones documentales mínimas para salir de la excepción:**
1. Decisión explícita sobre el alcance: permanecer fuera de la ruta ordinaria M0 o integrar únicamente una suboperación Nexo mediante una API de instancia admitida. No convertir estado del mundo ni memoria Lúmina en estado de raíz Nexo por conveniencia.
2. Contrato de propiedad por cada estado/store: quién lo posee, qué operación puede leer/escribirlo y qué persistencia queda fuera de la instancia Nexo.
3. Si se decide integración de la suboperación Nexo, evidencia de que esa suboperación recibe la admisión de instancia/root definida y no puede evitarla por import/reexport o llamada directa path-based.
4. Contrato de fallos entre stores explícitamente no-atómico, salvo que se diseñe y acepte por separado una garantía transaccional real. No inferir atomicidad a partir del orden secuencial.
5. Test arquitectónico dirigido a la decisión ratificada y ejecución ligada al SHA evaluado antes de afirmar bloqueo/aislamiento probado.

**Evidencia actual:** la decisión previa propone integración compuesta y mantener world-state/memoria Lúmina fuera de la raíz Nexo; sigue siendo propuesta, no autorización de implementación ni prueba ejecutable de aislamiento.

### B. `scripts/simulate.mjs` — simulación y estado legacy

**Clasificación actual:** excepción de diseño; abre Continuity por ruta legacy y enlaza inicialización/memoria legacy con el estado de simulación. No se demuestra raíz canónica compartida.

**Condiciones documentales mínimas para salir de la excepción:**
1. Decisión explícita: mantenerla fuera del alcance operativo ordinario M0, o especificar una integración independiente de simulación con frontera de instancia.
2. Definir si la simulación puede inicializar estado Continuity ausente; la ausencia de archivo de mundo no debe interpretarse como prueba de autoridad ni de legitimidad del root.
3. Definir propiedad y semántica de migración del estado legacy y de `legacyMemory`; no fusionar automáticamente el estado del mundo con la memoria Nexo.
4. Si se integra, probar que todas las rutas exportadas y la ruta CLI respetan la frontera elegida; el guard de ejecución directa no cubre automáticamente helpers exportados ni llamadas importadas.
5. Test y ejecución vinculados al SHA exacto antes de afirmar aislamiento, ausencia de bypass o consistencia entre stores.

**Evidencia actual:** el manifiesto documenta la excepción y el uso de ruta legacy; no demuestra que esté bloqueada técnicamente ni que la integración esté aceptada.

### C. Regla común de cierre

P-02/P-HIST-08 solo pueden pasar de abiertos a resueltos después de que el propietario decida el alcance de cada excepción, el contrato de estados/dependencias esté escrito, el inventario de aristas relevante coincida con esa decisión y exista evidencia de prueba acorde con la afirmación. Si solo existe una decisión de excluirlos, registrar `OUT OF SCOPE BY DECISION` (una vez ratificada), no `BLOCKED AT RUNTIME`. Si falta la decisión o la evidencia, mantener `OPEN / UNKNOWN`.

Esto es una matriz propuesta de salida para revisión; no ratifica opciones, no cierra P-02/P-HIST-08, no autoriza implementación y no añade una nueva línea de meta.

Estado: documental únicamente; D1/D2 OPEN; M0 INCOMPLETO; no se ejecutaron pruebas/CI/Actions.


## 21. Orden de resolución documental de P-01…P-10 (2026-10-27)

**Objetivo:** establecer un orden de trabajo que reduzca retrabajo y respete dependencias conceptuales. Esta sección no cambia el registro canónico, no convierte la secuencia en decisiones ratificadas y no cierra ninguna P.

### Secuencia propuesta

1. **P-01 — Bootstrap de raíz:** documentar el procedimiento explícito y la evidencia exigida para quiescencia/publicación. Mantener creación implícita cerrada. No interpretar el bootstrap como autoridad constitucional.
2. **P-02 — Fronteras Nexo/Lúmina:** decidir el alcance de `assistants.mjs`, `simulate.mjs` y rutas relacionadas, apoyándose en §20. Sin frontera de dominio no se debe elegir el refactor mínimo.
3. **P-03 — Alcance de admisión:** fijar qué consultas, previews, snapshots y lecturas persistentes quedan dentro de la sección de admisión; alinear API, CLI y proceso hijo Chronicle.
4. **P-04 — Propiedad/composición de locks:** describir las primitivas existentes por cada actor y ruta antes de decidir un protocolo común; no asumir que un lock local cubre invocaciones directas o escritores no cooperativos.
5. **P-05 y P-06 — Incertidumbre de liberación y stale/timeout:** tratarlos conjuntamente en diseño, sin fusionar sus decisiones. P-05 debe definir evidencia de que el actor anterior ya no puede escribir; P-06 debe definir política de edad/timeout sin tratar edad o PID como autorización suficiente.
6. **P-07 — Rutas reservadas y alias de filesystem:** especificar modelo aceptado/rechazado y límites de garantías después de aclarar las fronteras de estado y locks.
7. **P-08 — Compatibilidad API/CLI:** mapear cada consumidor conocido contra la raíz única y las decisiones de bootstrap/admisión ya acordadas; ningún fallback silencioso.
8. **P-09 — Consumidores/aristas pendientes:** cerrar solo las aristas concretas contra un snapshot de árbol identificado. Mantener UNKNOWN cuando no se pueda demostrar exhaustividad o descartar una ruta de bypass.
9. **P-10 — Matriz de evidencia final:** para cada criterio aplicable, enlazar contrato, decisión, test, SHA exacto, workflow/run/job y resultado. Una prueba presente en el árbol no equivale a ejecución; una ejecución sin vínculo con el SHA evaluado no demuestra ese snapshot.

### Dependencias y control de orden

- P-01 y P-02 son entradas de diseño; no se presume que una resuelva la otra.
- P-03 depende de una frontera de dominio suficientemente definida en P-02 y debe ser coherente con el protocolo de bootstrap de P-01.
- P-04 informa el diseño de P-05/P-06; no autoriza por sí mismo una primitiva nueva.
- P-07 y P-08 deben respetar las decisiones previas sobre dominio, bootstrap, admisión y locks.
- P-09 se realiza contra contratos y snapshot identificados, no mediante un nuevo censo histórico general.
- P-10 es consolidación final de evidencia, no sustituto de resolver los puntos previos.

### Criterio de parada

Si una decisión de propietario, una precondición legítima, una garantía del filesystem, un límite de concurrencia o una evidencia necesaria no está disponible, marcar el elemento correspondiente `PENDING/UNKNOWN` y detener la inferencia dependiente. No elegir una opción por descarte. No implementar ni ejecutar pruebas/CI como parte de esta secuencia sin autorización explícita independiente.

Estado: propuesta de orden documental; P-01…P-10 continúan abiertos según el registro canónico.


## 22. P-01 — matriz dirigida de inicialización y consumidores (2026-10-27)

**Pregunta acotada:** ¿la inicialización explícita de almacenamiento Continuity puede separarse, en las rutas observadas, de admisión, PREPARED, dispatch o mutación Chronicle? Esta matriz consolida referencias estáticas ya inspeccionadas; no es un análisis exhaustivo del árbol ni una prueba de runtime.

| Ruta/consumidor | Evidencia estática identificada | Qué permite afirmar | Qué NO permite afirmar |
|---|---|---|---|
| `src/nexo/core/continuity-service.mjs` → `openNexoContinuityOwner` | Blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`; `allowEmptyInitialization` por defecto es `false`; si hay `legacyMemory`, proyecta esa memoria; si no hay memoria y no se permite vacío, devuelve `NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN`; en caso permitido llama a `store.initialize(snapshot)`. | La inicialización se expone como decisión explícita del caller; la ausencia no se convierte automáticamente en snapshot vacío por el valor por defecto del servicio. | No demuestra legitimidad de la creación ni que el snapshot creado sea inofensivo para todos los consumidores. |
| `src/nexo/core/continuity-snapshot.mjs` | Blob `56cbd1753f1fa3fb67c3592e5a5664b58d96c4c3`; el snapshot tiene `missions`, `attempts`, `doNotRepeat`, `executions` y `effectJournal`; la proyección declara que no persiste ni concede autoridad. | El contrato expresa intención de que el snapshot no sea una credencial de autoridad. | El comentario no demuestra el uso de todos los consumidores ni la separación de la ruta de ejecución. |
| `src/nexo/core/continuity-store.mjs` | Blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`; `initialize(snapshot)` gestiona inicialización y resultados `committed/conflict/failed/unknown`. | Existe una primitiva de inicialización con resultados explícitos y tratamiento de resultado indeterminado en el contrato local. | No demuestra que la creación sea exclusiva frente a todo escritor relevante ni que su invocación esté autorizada por un owner canónico. |
| `src/nexo/application/chronicle-append.mjs` | Blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`; la ruta acepta `initializeContinuity` y `initializeChronicle`, preflight de ambos stores, abre el owner y luego continúa a admisión/ejecución en la misma operación cuando las precondiciones locales pasan. | La inicialización no está demostrada como una invocación aislada del resto del flujo Chronicle en esta ruta. Esto bloquea afirmar que la separación Opción A ya está demostrada. | No demuestra por sí solo que se haya producido un efecto real en una ejecución concreta; la conclusión es de estructura estática. |
| `scripts/simulate.mjs` | El manifiesto D1 y §§18–20 documentan apertura de Continuity con `allowEmptyInitialization` condicionado por ausencia de estado de simulación, seguido de persistencia del mundo. | Existe acoplamiento estático entre ausencia de estado de simulación e inicialización Continuity en esa ruta. | No demuestra que el estado inicial conceda autoridad; tampoco demuestra que el comando esté bloqueado técnicamente. |
| `scripts/assistants.mjs` | El manifiesto D1 y §§19–20 documentan apertura de Continuity, registro de misión y escrituras de memoria Lúmina/estado del mundo en el mismo flujo compuesto. | La excepción de diseño no equivale a aislamiento de runtime y la inicialización no puede declararse inocua sin delimitar el alcance compuesto. | No demuestra atomicidad multi-store ni una ruta protegida autorizada. |

### Resultado de P-01 en este punto

- **Alcance elegido por el propietario:** Opción A — estudiar únicamente almacenamiento local M0 estrictamente no autoritativo y acotado.
- **Protocolo concreto:** pendiente; P-01 continúa OPEN/UNKNOWN.
- **Separación arquitectónica:** no demostrada. En particular, la ruta Chronicle puede estructuralmente seguir desde inicialización a admisión/ejecución dentro de la misma invocación, y los consumidores de snapshot incluyen el journal operacional.
- **Autoridad de bootstrap:** no definida ni inferible desde la ausencia, el lock, el snapshot inicial o los datos del caller. No crear `BootstrapAuthority` paralelo ni ampliar Constitution Authority Context por analogía.
- **Concurrencia/creación exclusiva:** requisito pendiente de demostración para todos los escritores relevantes; el lock cooperativo no es suficiente si hay escritores no cooperativos.
- **Estado existente corrupto/inválido:** preservar; no reinterpretarlo como ausencia.
- **Error o resultado ambiguo:** UNKNOWN/STOP, sin reintento automático ni afirmación de ausencia de mutación sin evidencia.

### Criterio de salida documental antes de proponer implementación

1. Identificar qué archivo/objeto concreto se pretende crear y demostrar que no establece ni condiciona confianza, autoridad constitucional ni estado protegido.
2. Cerrar el mapa de consumidores del estado inicial para las rutas que podrían alcanzar admisión, PREPARED, dispatch o Chronicle; toda arista relevante no resuelta permanece UNKNOWN/BLOCKED.
3. Especificar el esquema inicial y resultados usando contratos canónicos existentes, sin crear autoridad paralela.
4. Resolver P-01 (procedimiento/quiescencia/creación concurrente) y sus dependencias con P-02/P-03 antes de declarar el contrato listo.
5. Obtener autorización específica posterior antes de modificar runtime/tests/workflows o ejecutar pruebas/CI.

Este resultado es una reconciliación estática dirigida, no un pase de criterios de aceptación. No cambia la decisión de alcance, no cierra P-01, no autoriza implementación y no afirma que se ejecutaran tests.


## 23. Cruce de P-01 contra la línea de meta M0 (2026-10-27)

**Fuente de aceptación:** `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`, blob `e37a98ecfe1dcdccfef3cb0c5c98e0f2cb7d1287`. Se conserva como línea de meta aceptada como base; este cruce no crea una segunda línea de meta ni cambia sus criterios.

| Criterio de la línea de meta | Evidencia reutilizable | Estado probatorio para P-01 | Falta para PASS |
|---|---|---|---|
| §3.1–3.3: alcance, decisiones del propietario y contratos D0–D3 coherentes | Decisión de alcance Opción A en el contrato candidato; registro canónico D0–D3 | **PARCIAL**: el alcance del almacenamiento local está elegido; el contrato final de bootstrap y las decisiones de implementación siguen abiertos. | Resolver P-01 y dependencias P-02/P-03; identificar exclusiones/capacidades afectadas aceptadas, sin convertir recomendaciones en decisiones. |
| §3.5–3.6: inventario reproducible de callers/no-bypass y prueba arquitectónica ejecutada | Manifiesto D1; §§18–22 de este inventario; test estático de grafo descrito en §17 | **PARCIAL / NO EJECUTADO EN ESTA REVISIÓN**: hay evidencia estática dirigida y límites identificados, no prueba exhaustiva del grafo ni ejecución ligada a un SHA de implementación. | Congelar contrato y snapshot de árbol; resolver aristas dinámicas/indirectas relevantes; obtener autorización separada para pruebas y vincular resultado al SHA exacto. |
| §3.7–3.8: separación entre admisión, stores, identidad y autoridad; reparación/dispatch excluidos o bloqueados | Contrato de bootstrap §§149–170 y §§194–247; owner-backed runtime y matriz de consumidores | **NO PASS**: la ruta Chronicle puede continuar a admisión/PREPARED/dispatch y mutación Chronicle después de inicializar Continuity en la misma invocación; `authorization: NOT_EVALUATED` no es un freno. | Resolver y documentar la frontera de bootstrap aislado; no asumir autoridad; verificar las rutas del alcance con pruebas autorizadas. |
| §3.C.9–3.C.10: protocolo de bootstrap/recovery y estados parciales/corruptos | Contrato candidato §§149–170; opciones históricas de bootstrap y recuperación; store con resultados committed/conflict/failed/unknown | **NO PASS**: existen requisitos y manejo local de resultados, pero no hay protocolo ratificado con garantías demostradas de quiescencia, creación concurrente y estado parcial. | Decisión de procedimiento, límites del filesystem, writers relevantes, reconciliación autorizada de UNKNOWN y preservación de datos inválidos. |
| §3.C.12: no borrar objetos reemplazados ni re-admitir mientras actor anterior pueda escribir | Opciones D2 de release/recovery y protocolo de quiescencia legacy | **UNKNOWN / NO DEMOSTRADO** para P-01: la documentación define preguntas, pero no hay entorno objetivo ni prueba de quiescencia para todos los escritores. | Si aplica a la capacidad dentro de alcance, identificar entorno/actores y evidencia operacional verificable; si se excluye, decisión explícita y limitación aceptada. |
| §3.E.16 y §3.E.18: regresiones en CI y trazabilidad test/SHA/job/run | Inventario §15–§16; workflow YAMLs identificados y límites de recuperación de runs | **NO VERIFICADO**: los YAML declaran selección de tests; no se ha vinculado una ejecución al SHA exacto que demuestre estos criterios. | Tras contrato congelado y autorización de pruebas, ejecutar/verificar CI sobre el SHA que contiene contrato aplicable, implementación y tests; registrar run/job/steps/resultados. |
| §3.E.20: acta final criterio por criterio | Línea de meta M0 y este cruce documental | **PENDIENTE**: esta tabla es una preevaluación de P-01, no el acta de aceptación M0. | Solo redactar el acta final después de evaluar todos los criterios aplicables y obtener las aprobaciones requeridas. |

### Clasificación final de la preevaluación P-01

- **Reutilizable:** alcance Opción A; línea de meta M0; contrato candidato; manifiesto D1; inventario estático de consumidores; criterios BA-01…BA-10 ya documentados.
- **Parcial:** identificación de callers directos conocidos y contratos locales de inicialización/resultados.
- **No demostrado:** separación de bootstrap respecto de admisión/dispatch; quiescencia general; creación exclusiva frente a todos los escritores; tratamiento autorizado de UNKNOWN; ausencia de bypass global.
- **No ejecutado/verificado en este checkpoint:** pruebas nuevas, pruebas arquitectónicas sobre un contrato congelado y CI ligado al SHA exacto.

### Decisión de continuidad

P-01 permanece **OPEN / UNKNOWN**. La línea de meta aceptada no se modifica. La elección de alcance Opción A y la preferencia de separar bootstrap de commit condicional no equivalen a ratificar el protocolo final ni a autorizar implementación. Mantener D1/D2/D3 en sus estados canónicos; no declarar M0_BUILD_COMPLETE ni PROTECTED_EFFECTS_AUTHORIZED.

Este cruce es documental. No se modificaron runtime, tests, workflows ni configuración; no se ejecutaron pruebas, CI o Actions.
