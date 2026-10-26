# NCS M0 — Siguiente diseño de frontera de reconciliación (2026-10-26)

## Estado y alcance

Diseño estático de solo lectura sobre la rama `ncs-clean-architecture`. Este documento refina el siguiente paso después de la reparación de rutas de persistencia opción B.

- No modifica runtime, tests ni workflows.
- No ejecuta tests ni CI.
- No autoriza efectos protegidos ni altera los gates canónicos.
- No reabre la causa histórica del run CI `40270739196`; su causa primaria exacta sigue `UNKNOWN`.

## Evidencia del código actual

1. `createPersistStateConditionalCommit()` convierte los errores de persistencia distintos de `STATE_REVISION_CONFLICT` en `COMMIT.UNKNOWN` y conserva un `errorCode` estable o `PERSISTENCE_UNKNOWN`.
2. `executeProtectedTransition()` acepta `COMMITTED` como base para `SAFE_COMMIT`; un `CONDITIONAL_CONFLICT` produce `STALE_CANDIDATE`; `UNKNOWN`, un resultado malformado o una excepción del commit llevan a `RECONCILE_REQUIRED`.
3. Cuando el adaptador devuelve `COMMIT.UNKNOWN`, la transición actualmente reduce el diagnóstico a `conditional commit outcome is UNKNOWN` y no propaga el `errorCode` que ya está disponible. Si el puerto lanza directamente, la transición puede conservar `error.code` en la razón; son rutas diagnósticas distintas.
4. El puerto `reconciliation.reconcile()` existe, pero `executeProtectedTransition()` no lo invoca en el camino inspeccionado.
5. `createReconciler()` devuelve `UNRESOLVED` para los casos válidos actuales. Correctamente no confía en campos de evidencia controlados por el llamador que simplemente afirman `authoritative: true`.
6. La implementación de STEP 6 no tiene un verificador de confianza independiente ni una fuente durable autenticada conectada. Invocarla ahora no establece si el commit ocurrió.
7. La reparación de rutas opción B ya está implementada y su workflow determinista fue verificado en el HEAD registrado en `STATUS.md`. No es necesario repetir ese trabajo como parte de este diseño.

## Distinción que debe conservarse

- **Resultado de la llamada:** qué devolvió o lanzó el puerto de persistencia.
- **Estado durable observado:** qué snapshot se puede leer y validar después.
- **Correspondencia causal:** si la evidencia durable demuestra que ese snapshot pertenece a la transición candidata concreta.
- **Clasificación terminal:** qué outcome permite emitir el contrato una vez probados los hechos anteriores.

Una revisión de snapshot que coincide con `expectedRevision + 1` puede ser evidencia relevante, pero por sí sola no demuestra necesariamente causalidad si otro writer puede producir la misma revisión o estado. No declarar `SAFE_COMMIT` solo por coincidencia de revisión, lectura exitosa, ausencia de error o limpieza completada.

## Frontera mínima candidata

Antes de integrar la reconciliación, el diseño debe especificar una lectura posterior independiente que:

1. Lee el estado persistido sin confiar en el resultado en memoria del intento de escritura.
2. Valida que el archivo/snapshot pueda leerse y que su estructura e integridad cumplan el contrato vigente.
3. Comprueba la revisión durable y la compara con la revisión esperada y la candidata.
4. Determina si los datos disponibles vinculan de manera suficiente el snapshot con la transición que quedó incierta.
5. Devuelve un resultado tipado y conservador; ante corrupción, lectura fallida, conflicto o causalidad no demostrada, conserva la incertidumbre.
6. No muta estado canónico, no vuelve a ejecutar la transición, no reintenta y no invoca efectos externos.
7. No acepta un campo de evidencia del llamador como autoridad por sí solo.

No añadir un identificador de operación, journal, cola, retry, tombstone ni protocolo de fencing hasta demostrar que el contrato actual no puede establecer correspondencia causal sin ese mecanismo. Si se demuestra que hace falta, detenerse y definirlo como decisión separada antes de implementarlo.

## Diagnóstico estructurado

La siguiente revisión debe evaluar si el outcome puede conservar el código de error ya tipado sin filtrar mensajes arbitrarios, rutas absolutas ni datos sensibles. Como mínimo, las pruebas deben distinguir:

- conflicto condicional conocido;
- fallo conocido previo a mutación;
- resultado de persistencia incierto;
- lectura posterior imposible;
- snapshot legible pero revisión incompatible;
- snapshot candidato verificable sin correspondencia causal suficiente.

No introducir códigos de diagnóstico nuevos en runtime como parte de este documento. La taxonomía final y su audiencia siguen pendientes de decisión.

## Pruebas de aceptación requeridas antes de cualquier integración

- `COMMITTED` solo se emite por la ruta de contrato ya definida; un `UNKNOWN` nunca se transforma directamente en éxito.
- El código estable del error del adaptador no se pierde silenciosamente en la clasificación de incertidumbre, una vez ratificada la forma diagnóstica.
- Lectura posterior fallida o snapshot inválido permanece sin resolver.
- Una revisión inesperada no se declara como commit de la transición candidata.
- La coincidencia de revisión sin prueba de correspondencia causal no se promueve automáticamente a `SAFE_COMMIT`.
- Evidencia controlada por el llamador, accessors, formas malformadas y errores de lectura no pueden autorizar una resolución.
- El reconciliador no tiene capacidades de commit, autorización, ejecución, retry, cola ni efecto externo.
- Tests separados cubren la máquina de estados, el adaptador con filesystem y los casos de lectura posterior; la CI debe identificar exactamente qué suite y HEAD verifica.

## Decisión y gates

Este documento propone criterios de diseño; no ratifica la semántica final ni autoriza implementación.

- M0: `INCOMPLETO`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Reconciliación de commit incierto: `DISEÑO PENDIENTE`; no está integrada ni demuestra durabilidad causal.
- Causa primaria exacta del run CI `40270739196`: `UNKNOWN`.
- No afirmar CI global verde; solo workflows concretos cuyos runs están documentados pueden declararse verificados.

## Próximo paso

Contrastar estos criterios con el contrato vigente de persistencia y la matriz de observabilidad ya existente. Resolver primero la cuestión semántica de correspondencia causal y diagnóstico. No modificar runtime sin autorización explícita acotada para ese cambio posterior.
