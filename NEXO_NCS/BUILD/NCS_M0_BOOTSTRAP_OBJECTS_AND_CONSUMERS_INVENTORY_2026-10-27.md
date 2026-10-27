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
