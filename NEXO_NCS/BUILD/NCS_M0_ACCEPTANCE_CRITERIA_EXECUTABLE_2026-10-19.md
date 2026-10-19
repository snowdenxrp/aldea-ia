## M0 — verificación final de transparencia de autoridad (2026-10-19)

- La revisión detectó y cerró dos omisiones en resultados públicos Chronicle: el resultado normalizado, los rechazos tempranos y el conflicto de admisión deben conservar `authorization: "NOT_EVALUATED"` mientras no exista evaluación de autoridad.
- Implementación: `src/nexo/application/chronicle-append.mjs`, commit `2faf2b988c676dc907c9322f5e63be36200af97b` (visibilidad en conflicto, sobre la corrección inicial `aa8509e75dd7925189d54b2667bcdd2ae27e6647`).
- Regresión: `tests/nexo/chronicle-runtime.test.mjs`, commit `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; verifica resultado desconocido normalizado, datos malformados, rechazo temprano y settlement local completado.
- **CI integrado PASS:** [run 39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874), SHA exacto `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; job `Nexo M0 contracts on one SHA` SUCCESS, con los cinco grupos de pruebas SUCCESS. Chronicle específico [run 39292887749](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887749) también SUCCESS en el mismo SHA.
- **Límite:** la transparencia se corrigió; no se creó ni evaluó una raíz constitucional. Settlement local no significa autorización. Raíz/composición PENDING; efectos protegidos STOP; M0 global INCOMPLETO.

---

## Última regresión integrada observada (2026-10-19)

La corrección de visibilidad de autorización pública fue ejecutada junto con los contratos M0 en [run 39292627540](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292627540), SHA exacto `dbced55ae0f345a7677b5df4b598631ec0d78ed8`. Job `Nexo M0 contracts on one SHA` = SUCCESS; los cinco grupos de pruebas enumerados = SUCCESS. El workflow Chronicle [run 39292627699](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292627699) también terminó SUCCESS en el mismo SHA.

Este resultado añade evidencia para la revisión integrada de las regresiones en ese SHA. No convierte el M0 global en PASS: la raíz de autoridad constitucional sigue sin implementarse/evaluarse y los efectos protegidos continúan STOP.

---

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

1. La regresión específica `nexo-m0-mission-status.yml` pasó en `82f1204ae4e9298163231ab7a323233ad87777b8` ([run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361)). Además, el fix es ancestro del SHA integrado `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae` (28 commits adelante, 0 detrás; sin cambios posteriores en `continuity-queries.mjs` ni `tests/nexo/entrypoint.test.mjs`), y el run integrado [39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874) ejecutó `tests/nexo/entrypoint.test.mjs` con SUCCESS. Por ello AC1 tiene PASS para esa regresión en el SHA integrado, no UNKNOWN.
2. No se requiere forzar otra ejecución del workflow dedicado sólo por su nombre: el workflow integrado ejecutó la misma regresión en un SHA posterior y trazable. Mantener el run dedicado como evidencia focal histórica y el integrado como cobertura posterior.
3. Continuar la matriz AC1–AC6 sin reauditar criterios cuyo código/test no cambió. El bloqueo global sigue siendo raíz/decisión de autoridad no implementada y otros límites de despliegue; no la consulta canónica ya probada.


## Evidencia observada añadida — 2026-10-19

- Primera ejecución del workflow: [run 39264987091](https://github.com/snowdenxrp/aldea-ia/actions/runs/39264987091), SHA `4b6423404d5ad2e901e3b3eccb5db6e2140ee492`, FAILURE en `tests/nexo/entrypoint.test.mjs:185`: la consulta devolvió `NEXO_MISSION_RECONSTRUCTION_UNAVAILABLE` porque el consumidor esperaba un wrapper que la función pura no devuelve.
- Fix: `82f1204ae4e9298163231ab7a323233ad87777b8`.
- Reejecución por push: [run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361), mismo workflow, mismo test, SHA del fix exacto, SUCCESS. El job y el paso de regresión quedaron completados con conclusión SUCCESS.
- La secuencia fallo → corrección → éxito es evidencia trazable; no borrar ni reetiquetar el primer fallo. Los commits documentales posteriores no cambian el SHA probado.


## Matriz inicial de evidencia por criterio (actualizada 2026-10-19)

| Criterio | Evidencia observada | Evaluación precisa |
|---|---|---|
| AC1 — consulta canónica / solo lectura / no fuga | [Integrated acceptance run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), SHA `c57be8aa6fd7e558d870c3e46feab741637b4314`; más [mission-status run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361) | **PASS en el SHA integrado**: regresión de entrypoint pasó después del fix. |
| AC2 — admisión persistible | [Integrated acceptance run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), step `Canonical continuity admission and store`; históricos [39210288131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288131), [39197992970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992970) | **PASS en SHA integrado** y evidencia histórica adicional. |
| AC3 — gate fail-closed | [Integrated acceptance run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), steps `Reconstruction and protected transition contracts` y `Chronicle store, runtime, and public entrypoints`; históricos [39210288131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288131), [39264921967](https://github.com/snowdenxrp/aldea-ia/actions/runs/39264921967) | **PASS en SHA integrado** para gate contractual; no demuestra raíz de autoridad legítima. |
| AC4 — journal / settlement / replay | [Integrated acceptance run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), step `Chronicle store, runtime, and public entrypoints`; más [Chronicle native run 39291153543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291153543) | **PASS en SHA integrado** para journal/replay contractual. No prueba procedencia criptográfica ni durabilidad de hardware. |
| AC5 — crash cuts / recuperación | [Integrated acceptance run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), step `Crash cuts and owner recovery`; históricos [39210287996](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210287996), [39209200872](https://github.com/snowdenxrp/aldea-ia/actions/runs/39209200872) | **PASS en SHA integrado** para las suites de crash/recovery enumeradas. No demuestra power-loss durability más allá del modelo de prueba. |
| AC6 — entrypoints estrechos / separación auditada | [Integrated acceptance run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), step `Chronicle store, runtime, and public entrypoints`; más [Chronicle native run 39291153543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291153543) | **PASS en SHA integrado**: entrypoint regresión pasó. El alcance es el grafo auditado, no todo el repositorio. |

### Lectura de la matriz

La corrección del query no sólo pasó el workflow específico: el workflow Chronicle también se ejecutó en el SHA posterior `7f83195657df829d993226cf909c8f76f655d23b` y pasó store, runtime y entrypoint. Se añadió `src/nexo/application/continuity-queries.mjs` y `src/nexo/application/index.mjs` a los paths de `.github/workflows/nexo-m0-chronicle.yml` porque la regresión de entrypoint consume esos módulos; así futuras modificaciones de la consulta no dejan obsoleto el test de integración.

**Cierre global aún bloqueado:** AC2, AC3 y AC5 sólo tienen PASS históricos en la matriz; se necesita una ejecución integrada de los criterios obligatorios sobre un SHA de cierre, o una política de evidencia explícita que permita fijar cada criterio a su último SHA relevante sin afirmar que es el mismo build. No mezclar ambos modelos.


## Resultado del gate integrado de aceptación — 2026-10-19

**PASS observado:** [run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), SHA exacto `c57be8aa6fd7e558d870c3e46feab741637b4314`, workflow `.github/workflows/nexo-m0-acceptance.yml`. El job `Nexo M0 contracts on one SHA` concluyó SUCCESS. Los cinco pasos de contrato terminaron SUCCESS:
1. Canonical continuity admission and store.
2. Reconstruction and protected transition contracts.
3. Chronicle store, runtime, and public entrypoints.
4. Crash cuts and owner recovery.
5. Goal verification and outcome classification.

Esto da evidencia integrada AC1–AC6 sobre un mismo SHA. El commit probado añadió el workflow; los cambios posteriores anotados en STATUS/handoff/documentación no alteraron código de producción ni tests. Este PASS es del conjunto de regresiones enumerado, no prueba seguridad de raíz de autoridad, durabilidad física, resistencia global a rollback/tampering ni autoriza efectos protegidos.

**Decisión de estado:** el gate de regresión M0 pasa en el SHA indicado; M0 como misión completa permanece INCOMPLETO hasta cerrar explícitamente los bloqueos arquitectónicos fuera del alcance de estos tests. Efectos protegidos siguen STOP.
