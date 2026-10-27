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
