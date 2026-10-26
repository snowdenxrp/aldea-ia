# Síntesis verificable de revisiones externas — Nexo/NCS (2026-10-26)

## Propósito y límites

Este documento consolida únicamente lo que se pudo recuperar y verificar en la rama `ncs-clean-architecture` al redactarlo. No certifica que el inventario sea exhaustivo, que las IAs estén conectadas ni que todos los informes recibidos estén archivados. Es una síntesis documental; no modifica código, runtime, tests, workflows, CI, APK ni dispositivo.

## Archivos recuperados en GitHub

1. **Protocolo de colaboración entre IAs**  
   Ruta: `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/AI_COLLABORATION_PROTOCOL_2026-10-26.md`  
   Blob recuperado: `9abe4788b0c7cdb877031115185f428c22e076f5`.  
   Función: define tareas acotadas, uso moderado de Claude, roles prácticos para ChatGPT/Claude/Perplexity/Gemini/Qwen, disciplina de evidencia y prohibición de convertir informes en autorización implícita.

2. **Informe Perplexity: persistencia y durabilidad**  
   Ruta: `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/2026-10-26_PERPLEXITY_PERSISTENCE_DURABILITY.md`  
   Blob recuperado: `7edeaede2ee8fc28990c8416fde3fe8bc8147497`.  
   Función: revisión documental de la primitiva de persistencia y garantías F1/F2/F3.

3. **Órdenes de revisión independiente para Claude, Perplexity y Qwen**  
   El `STATUS.md` actual describe el paquete como **preparado, no enviado**. No se ha inferido de ello que esas tres IAs recibieran las órdenes o respondieran. La existencia de este paquete no es evidencia de revisión completada.

## Síntesis técnica del informe Perplexity

### Hallazgos que el informe atribuye a lectura estática

- La primitiva revisada usa temporal + `rename()` + control de revisión + bloqueo cooperativo, sin sincronización explícita (`fsync`) del archivo temporal ni del directorio.
- El éxito de `rename()` respalda visibilidad atómica bajo condiciones de sistema de archivos local/POSIX, pero no prueba por sí solo durabilidad frente a caída del sistema (F2) o pérdida de energía/almacenamiento (F3).
- El bloqueo protege solo a escritores cooperantes; no demuestra exclusión de todos los actores capaces de escribir.
- `loadState()` convierte errores de lectura/JSON en revisión 0, lo que puede confundir estado corrupto o ilegible con estado inicial.
- `COMMIT.UNKNOWN` agrupa casos distintos, incluidos fallos previos al reemplazo y fallos posteriores a un reemplazo ya visible. Releer el estado puede probar visibilidad, no durabilidad ni correspondencia causal.
- El informe señala una posible carrera en la recuperación de bloqueos abandonados; es una inferencia estática que requiere prueba, no un defecto dinámico reproducido.

### Límites y preguntas abiertas

- No se ejecutaron pruebas, scripts ni CI como parte de ese informe.
- No está establecido aquí el sistema operativo, sistema de archivos, hardware ni plataforma de producción.
- Las garantías F2/F3 no quedan demostradas por una lectura inmediata tras escribir ni por una sola ejecución verde.
- La causa raíz del run histórico `40270739196` permanece `UNKNOWN` en el estado canónico; este informe de durabilidad no la resuelve.
- El archivo archivado se reconstruyó a partir de bloques de conversación. No se verificó identidad byte por byte ni el SHA-256 del original.

### Consecuencia para NCS

El informe apoya mantener separadas estas afirmaciones: resultado de llamada, visibilidad del estado, durabilidad ante el modelo de fallo definido, correspondencia causal con la transición y clasificación terminal. No autoriza por sí mismo una implementación. Las propuestas de añadir sincronización, dividir outcomes ambiguos o introducir lectura estricta requieren decisión explícita, plataforma objetivo definida y pruebas de aceptación apropiadas.

## Matriz de cobertura verificable

| Fuente / IA | Archivo remoto recuperado | Alcance comprobable | Estado de ejecución |
|---|---|---|---|
| Protocolo operativo | Sí | Proceso de colaboración y evidencia | Documento; no prueba conectividad de las IAs |
| Perplexity | Sí | Persistencia y durabilidad, revisión estática | Sin tests/CI/scripts |
| Claude | No se confirma aquí un informe dentro de esta carpeta | El STATUS menciona una reconciliación Claude en BUILD, que es un artefacto distinto de esta carpeta | No se afirma una nueva respuesta a las órdenes independientes |
| Qwen | No se confirma aquí un informe dentro de esta carpeta | No se identifica en esta verificación un archivo de informe específico | UNKNOWN |
| Gemini | No se confirma aquí un informe dentro de esta carpeta | STATUS menciona una pregunta de contraste futura, no una respuesta archivada en esta carpeta | UNKNOWN |

La matriz es una fotografía parcial de los archivos recuperados en esta comprobación, no una afirmación de que no existan informes en otras rutas o conversaciones.

## Próximo paso recomendado

1. No volver a ejecutar la revisión de persistencia ya archivada salvo que aparezca evidencia nueva o una contradicción concreta.
2. Si se reciben informes adicionales, registrar cada uno en su propio archivo, con origen, fecha, alcance, restricciones, conclusiones, incógnitas y limitaciones de integridad; después recuperarlo desde GitHub para verificarlo.
3. Antes de asignar nuevas tareas, consultar `NEXO_NCS/STATUS.md` y la tarea canónica vigente. Las órdenes marcadas como preparadas no deben tratarse como enviadas.
4. Mantener sin cambios los gates canónicos: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`, salvo actualización respaldada por evidencia y decisión autorizada.

## Clasificación

- Tipo: síntesis documental de inventario parcial.
- Implementación: ninguna.
- Tests/CI ejecutados por esta síntesis: no.
- Cambios de runtime, tests, workflows, APK o dispositivo: ninguno.
- Autoriza efectos protegidos: no.


## Ampliación de inventario: artefactos externos en otras rutas

La búsqueda de continuidad en `NEXO_NCS/STATUS.md` encontró dos artefactos relacionados que viven fuera de `RESEARCH/EXTERNAL_AI_REVIEWS`. Se recuperaron de la rama de trabajo y se revisaron sus límites declarados:

### Claude — reconciliación documental de D1

- Archivo: [`NCS_M0_CLAUDE_INDEPENDENT_D1_REVIEW_RECONCILIATION_2026-10-25.md`](../../BUILD/NCS_M0_CLAUDE_INDEPENDENT_D1_REVIEW_RECONCILIATION_2026-10-25.md).
- Blob recuperado: `389e579c448583c75697913670a75c78b579b844`.
- El propio encabezado dice que es una reconciliación documental, no cierra D1 y no autoriza implementación.
- Es evidencia de que existe una reconciliación archivada sobre una revisión aportada por Claude; no demuestra que las órdenes del 26 de octubre se enviaran ni que Claude haya respondido a ese paquete nuevo.

### Gemini — cotejo documental vinculado a issue

- `STATUS.md` enlaza [issue #107 y su comentario de revisión documental](https://github.com/snowdenxrp/aldea-ia/issues/107#issuecomment-6406372373).
- El mismo STATUS limita explícitamente el resultado a cotejo estático de blobs citados: no es una auditoría independiente de Gemini ni evidencia de runtime. Señala que, si Gemini aporta evidencia nueva, solo deben reconciliarse discrepancias concretas.
- Por tanto, se registra como un artefacto de cotejo documental relacionado con Gemini, no como prueba de una respuesta nueva o de que una orden independiente haya sido ejecutada.

### Órdenes preparadas, no enviadas

- Archivo: [`NCS_M0_INDEPENDENT_AI_REVIEW_ORDERS_2026-10-26.md`](../../BUILD/NCS_M0_INDEPENDENT_AI_REVIEW_ORDERS_2026-10-26.md).
- Blob recuperado: `e34c727bbdc0af9785e48887fdbaf43acd286cd0`.
- El documento declara que es una orden para copiar en cada IA y que no afirma que alguna haya sido contactada o haya respondido.
- El estado del repositorio y este inventario concuerdan: preparación no equivale a envío ni a resultado.

## Inventario actualizado: alcance exacto

| IA / artefacto | Evidencia recuperada | Qué sí permite afirmar | Qué no permite afirmar |
|---|---|---|---|
| Perplexity — persistencia/durabilidad | Informe en `EXTERNAL_AI_REVIEWS` | Informe documental archivado y recuperado | Tests/CI ejecutados o identidad byte por byte con el original |
| Claude — D1 | Reconciliación en `BUILD` | Existe un artefacto que registra y contrasta una revisión atribuida a Claude | D1 cerrado, implementación autorizada o respuesta a las órdenes nuevas |
| Gemini — cotejo | Referencia en `STATUS.md` a issue #107/comentario | Existe un cotejo estático documentado y con límites explícitos | Auditoría independiente nueva o validación runtime |
| Qwen — órdenes del 26 de octubre | Orden preparada; no se verificó informe de respuesta | Se preparó una solicitud | Que se envió, se respondió o existe un informe archivado en otra ruta |
| Gemini/Claude/Perplexity — paquete del 26 de octubre | Órdenes preparadas, no enviadas según STATUS | Hay un paquete documental preparado | Que esas IAs hayan recibido ese paquete o hayan respondido |

Esta ampliación corrige una limitación del primer inventario: la ausencia de un informe dentro de `EXTERNAL_AI_REVIEWS` no demuestra que no exista material relacionado en `BUILD`, `STATUS.md` o issues. El inventario sigue siendo parcial, y no se hizo un barrido exhaustivo de todos los archivos o conversaciones.
