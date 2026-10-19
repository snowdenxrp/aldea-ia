# Nexo M0 — criterios de aceptación ejecutables

Fecha: 2026-10-19  
Rama: `ncs-clean-architecture`  
Estado: **criterios definidos; cierre de M0 NO autorizado**.

## Propósito

Convertir los contratos ya implementados en resultados verificables. Este documento no declara que las pruebas hayan pasado ni sustituye sus logs. Cada resultado debe vincularse a un SHA exacto de código y pruebas, a la ejecución de CI y al artefacto/log correspondiente.

## Reglas de evidencia

- **PASS**: prueba ejecutada sobre el SHA indicado, resultado observado, log accesible y aserciones coincidentes con el criterio.
- **FAIL**: prueba ejecutada y una aserción/contrato falla.
- **UNKNOWN**: no existe ejecución observada para el SHA, falta log, el SHA probado no coincide, o la prueba no cubre el comportamiento descrito.
- Un PASS histórico sólo acredita el SHA que realmente ejecutó; no se hereda a commits posteriores.
- La documentación no convierte UNKNOWN en PASS.
- Los criterios se evalúan una vez inicialmente. Se reabren sólo si cambia el código, el contrato, el test o aparece evidencia nueva que afecte ese criterio.

## Criterios obligatorios de M0

### M0-AC1 — Consulta canónica, de solo lectura y sin fuga de payload
**Setup:** store canónico válido; incluye una misión conocida y un payload privado centinela en target/content.  
**Acción:** ejecutar `mission-status` y `status` a través del entrypoint público Nexo.  
**PASS observable:**
1. La consulta de misión lee una sola revisión y reporta `storeRevision`.
2. Si el estado almacenado y el reconstruido difieren, devuelve ambos (`persistedMissionStatus`, `missionStatus`) y `statusDiscrepancy: true`.
3. El centinela no aparece en stdout ni stderr.
4. Los bytes del store antes y después son idénticos.
5. Misión inexistente y reconstrucción no disponible terminan con códigos estructurados y sin mutación.
**Prueba candidata existente:** `tests/nexo/entrypoint.test.mjs`.  
**Estado actual:** **PASS para el alcance de esta regresión en el SHA `82f1204ae4e9298163231ab7a323233ad87777b8`**, ejecutado por [run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361), job `mission-status` (ID `118102572970`), step `Run independent Nexo entrypoint regression` = SUCCESS. El log muestra `Nexo independent entrypoint: unsupported commands fail closed; Chronicle delegates without Lúmina or content leakage.` El PASS cubre la regresión de entrypoint, incluida la proyección de misión; no equivale al cierre de M0 ni prueba autoridad legítima, durabilidad ante pérdida de energía o integridad global del repositorio.

### M0-AC2 — Admisión de misión acotada y persistible
**Setup:** misiones válidas e inválidas, incluidos inputs anidados no persistibles o estructuralmente malformados cubiertos por las regresiones existentes.  
**Acción:** intentar admitir cada misión mediante el contrato canónico.  
**PASS observable:** inputs inválidos producen rechazo estructurado antes de avanzar la revisión canónica; inputs válidos conservan los defaults y vocabulario contractual existentes. No se agregan estados ni campos por conveniencia.  
**Pruebas existentes:** `tests/nexo/continuity-contract.test.mjs` y pruebas de bounded admission.  
**Estado:** hay evidencia histórica para SHAs concretos en STATUS; no extrapolar a HEAD sin CI correspondiente.

### M0-AC3 — Gate de nueva ejecución fail-closed
**Setup:** misiones/steps en combinaciones persistidas y reconstruidas válidas e inválidas; dependencias pendientes; misión almacenada en estado no ejecutable.  
**Acción:** solicitar una nueva ejecución owner-backed.  
**PASS observable:** PREPARED/dispatch nuevo sólo puede ocurrir cuando la misión almacenada y la reconstrucción canónica satisfacen los requisitos ya definidos y las dependencias requeridas están completas. Un estado contradictorio o desconocido bloquea el dispatch. Las obligaciones preexistentes del journal siguen la ruta de recuperación antes de admitir un dispatch nuevo.  
**Límite:** esto prueba el gate de ejecución con los fixtures/credenciales de prueba usados; **no demuestra que una credencial corresponda al propietario legítimo ni resuelve la raíz de autoridad constitucional**.

### M0-AC4 — Journal, resultado terminal y replay sin duplicación
**Setup:** operación Chronicle soportada, store de continuidad y journal canónicos; repetir la misma identidad de misión/paso tras reiniciar el proceso.  
**Acción:** ejecutar una vez, volver a abrir el owner y repetir la solicitud.  
**PASS observable:** la primera operación registra evidencia terminal coherente; el replay observa el settlement existente, no vuelve a despachar ni duplica la entrada; una salida `completed` no se deriva únicamente de texto o una etiqueta caller-supplied.  
**Pruebas existentes:** suite de entrypoint/Chronicle, pruebas de settlement y crash cuts.  
**Límite:** consistencia estructural del journal no equivale a procedencia criptográfica, durabilidad frente a pérdida de energía ni atomicidad con un sistema externo.

### M0-AC5 — Fallos, reinicio y reconciliación conservan incertidumbre
**Setup:** cortes de proceso en cada frontera ya modelada de prepare/dispatch/observación/settlement, resultados ambiguos y evidencia incompleta.  
**Acción:** reiniciar y recuperar el store/journal después de cada corte.  
**PASS observable:** ninguna obligación incierta se considera completada sin evidencia contractual; el replay no autoriza por sí mismo un segundo efecto; los estados desconocidos, huérfanos o con identidad incoherente bloquean en vez de desaparecer del cálculo.  
**Prueba requerida:** suite existente de crash cuts y logs de la ejecución correspondiente al SHA probado. No sustituirla por tests unitarios aislados.

### M0-AC6 — Entry points Nexo estrechos y separados de Lúmina/legacy
**Setup:** entrypoints públicos y su grafo de imports local transitivo.  
**Acción:** ejecutar la regresión de entrypoint y enviar comandos no soportados.  
**PASS observable:** API pública sólo expone los casos de uso Nexo aprobados; comandos desconocidos fallan cerrados sin dispatch; el grafo Nexo auditado no importa memoria/runtime/simulación legacy prohibidos; el contenido privado no aparece en salida.  
**Límite:** esto prueba el grafo auditado desde los entrypoints independientes, no aislamiento total de todo el repositorio. El puente legacy opt-in permanece documentado y no debe usarse como autoridad del Nexo independiente.

## Cierre

M0 sólo puede cerrarse cuando todos los criterios obligatorios tengan PASS observado sobre el SHA de cierre y exista una matriz que enlace cada criterio a test, workflow/run, job, log y SHA. Un criterio FAIL requiere corregir causa raíz y volver a ejecutar pruebas relevantes. UNKNOWN bloquea el cierre.

Los siguientes asuntos no se deben ocultar ni declarar resueltos por estas pruebas: legitimidad de la raíz de autoridad del propietario; recuperación tras pérdida de todos los dispositivos; resistencia a rollback/manipulación del filesystem y a pérdida de energía; coordinación offline entre varios dispositivos; sucesión futura y su dimensión legal; confirmación humana de efectos financieros/irreversibles. Deben conservar su propio estado y seguir en STOP cuando afecten un efecto protegido. No se incorporan automáticamente al alcance de cada test de M0, pero impiden afirmar que Nexo está listo para activación segura.

## Punto de continuación inmediato

1. Obtener y revisar una ejecución real de `.github/workflows/nexo-m0-mission-status.yml` que pruebe un SHA posterior a la corrección `82f1204ae4e9298163231ab7a323233ad87777b8`.
2. Si no se puede recuperar ese run, ejecutar manualmente el workflow si el repositorio lo permite; registrar SHA exacto y logs. Hasta entonces M0-AC1 permanece UNKNOWN.
3. Construir una matriz de evidencia compacta para AC1–AC6 usando sólo runs existentes y verificables. No reauditar cada criterio si su código y prueba no cambiaron.


## Evidencia observada añadida — 2026-10-19

- Primera ejecución del workflow: [run 39264987091](https://github.com/snowdenxrp/aldea-ia/actions/runs/39264987091), SHA `4b6423404d5ad2e901e3b3eccb5db6e2140ee492`, FAILURE en `tests/nexo/entrypoint.test.mjs:185`: la consulta devolvió `NEXO_MISSION_RECONSTRUCTION_UNAVAILABLE` porque el consumidor esperaba un wrapper que la función pura no devuelve.
- Fix: `82f1204ae4e9298163231ab7a323233ad87777b8`.
- Reejecución por push: [run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361), mismo workflow, mismo test, SHA del fix exacto, SUCCESS. El job y el paso de regresión quedaron completados con conclusión SUCCESS.
- La secuencia fallo → corrección → éxito es evidencia trazable; no borrar ni reetiquetar el primer fallo. Los commits documentales posteriores no cambian el SHA probado.
