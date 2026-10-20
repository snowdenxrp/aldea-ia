# NCS M0 — Estado de la regresión de mission-status y prioridad de continuidad
Fecha: 2026-10-20
Rama: `ncs-clean-architecture`
Tipo: verificación de evidencia existente y delimitación de siguiente trabajo. No se cambió runtime ni se ejecutó CI manualmente.

## Precedencia de decisiones
La decisión más reciente de alcance, `NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md`, está aceptada: una llave raíz y un dispositivo inicial para la primera versión; tipo/modelo, provisión y verificación física de la llave pendientes; recuperación tras pérdida irrecuperable fuera del alcance inicial. Esa decisión también indica explícitamente que **M0 no se reinicia** y que el siguiente trabajo inmediato es cerrar la coherencia entre misión persistida, estados de pasos y reconstrucción/proyección, revisando CI de `continuity-queries.mjs` y su regresión antes de más cambios.

La exploración AuthorityGate/root de este chat fue documental y no cambió runtime; no debe desplazar esa prioridad M0 ni volver a abrir la comparación general de raíces.

## Fuente y contrato observados
- `src/nexo/application/continuity-queries.mjs`, blob `557b97e5338258dfe3b7755f9a22221e4b114994`.
- `src/nexo/core/continuity-operations.mjs`, blob `f0ff97bd6dcb8543ce5bb97f85d482a1e1c4e6aa`.
- `tests/nexo/entrypoint.test.mjs`, blob `e053a1c855425c021089369f11751ad6f6251cbc`.
- `.github/workflows/nexo-m0-mission-status.yml`, blob `416c84e3015fe2a211f0d9936221a04d93132637`.

La consulta de misión lee el snapshot canónico una sola vez, busca la misión persistida y reconstruye el estado desde esa misma revisión. Devuelve separadamente `persistedMissionStatus`, `missionStatus` y `statusDiscrepancy`. La regresión prepara una misión persistida como `completed` con un paso aún `planned`; espera que la consulta exponga `persistedMissionStatus: completed`, `missionStatus: planned`, `statusDiscrepancy: true`, y verifica que no se emita el payload privado ni se modifique el archivo.

La reconstrucción también tiene pruebas de PREPARED no resuelto: misión y paso se reconstruyen como bloqueados, con `NEXO_EFFECT_RECONCILIATION_REQUIRED`, sin filtrar el target ni modificar el snapshot. Esto protege el riesgo de convertir una operación posiblemente ejecutada en una acción aparentemente ejecutable tras reinicio.

## Evidencia CI revisada
- Workflow `Nexo M0 — canonical mission status projection`: [run 39375282715](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375282715), head `04a8c5fd417b0a52e2cea2976cf71448f4811e3c`, conclusión `success`; job `mission-status` y paso `Run independent Nexo entrypoint regression` terminaron `success`.
- Comparación de ese SHA con HEAD documental `d78be9a21fc1cad7d2d19a6ba527ff282be73a38`: los archivos de fuente/test/workflow citados arriba no figuran entre los archivos cambiados. Por tanto el run es evidencia aplicable a esos bytes concretos, no un run ejecutado en el HEAD documental.
- Pruebas deterministas en el HEAD documental: [run 39428590480](https://github.com/snowdenxrp/aldea-ia/actions/runs/39428590480), SHA `d78be9a21fc1cad7d2d19a6ba527ff282be73a38`, `success`. Este workflow no sustituye la regresión dedicada de mission-status.

## Interpretación exacta
Lo demostrado es que la regresión actual **detecta y expone** la discrepancia persistida/reconstruida, y que el test dedicado pasa en su SHA. No se debe decir que el estado discrepante ya se repara o se normaliza: la API lo informa mediante `statusDiscrepancy: true`; no muta el almacenamiento ni elige silenciosamente uno de los dos estados.

Queda una decisión de contrato M0 que debe resolverse desde el comportamiento esperado del consumidor: si la discrepancia se considera un resultado informativo explícito suficiente o si la proyección pública debe retornar `blocked` cuando detecta contradicción. No cambiar ese contrato sin revisar consumidores y añadir una regresión dirigida; no convertir una consulta read-only en una reparación implícita.

## Próxima acción recomendada
1. Revisar los consumidores de `loadNexoMissionStatus` y la CLI `mission-status` para determinar si alguien trata `status: reconstructed` como estado de misión sin comprobar `statusDiscrepancy`.
2. Si hay consumidor que puede ignorar la discrepancia, endurecer la proyección/CLI con una salida fail-closed explícita, manteniendo el snapshot sin cambios; añadir pruebas para CLI y API.
3. Si todos los consumidores preservan/obligan a revisar la discrepancia, documentar esa obligación y ampliar regresión donde falte.
4. Ejecutar el workflow dedicado y las regresiones M0 relevantes en el SHA exacto que incluya los cambios. No inferir CI de otro SHA.
5. No mezclar esta tarea con la selección física de la llave raíz. Mantener el alcance inicial de una llave/ un dispositivo como decisión de arquitectura, sin afirmar que el mecanismo ya esté implementado.

## Estado global
M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`. Esta nota no afirma que la discrepancia esté cerrada; establece evidencia existente y el siguiente límite concreto.


## Cierre de la regresión selectiva — implementación y CI (2026-10-20)

Se revisó `scripts/nexo.mjs`: la CLI asigna exit code 1 cuando el resultado no es `reconstructed`; antes ignoraba `statusDiscrepancy` si la consulta regresaba `reconstructed`. El primer cambio tentativo que bloqueaba **toda** diferencia falló porque una misión persistida como `planned` puede reconstruirse legítimamente como `awaiting_verification`. Esa ejecución fallida se conserva como evidencia del límite de la regla, no como PASS: [run 39429434598](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429434598), SHA `b2e446fbba0ca4291dc0fdc3a9a1e008d56f0352).

La regla se afinó en `src/nexo/application/continuity-queries.mjs` (blob `432a53038d1527ada0d1be9bb77769aaaf2df9ee`): el estado `planned` es metadata persistida/histórica y puede diferir de la reconstrucción; una afirmación persistida `completed` sí queda bloqueada si la vista canónica reconstruida no es `completed`. El resultado bloqueado conserva sólo diagnóstico acotado (`missionId`, revisión, ambos estados y código `NEXO_MISSION_STATUS_DISCREPANCY`), no pasos que parezcan una proyección utilizable ni payload privado. La consulta sigue siendo read-only.

### Evidencia CI exacta del cambio afinado
SHA: `f07840b2222f55124e200c2866789834fa6904dd`.
- [Mission status projection — run 39429700787](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700787): success; el paso `Run independent Nexo entrypoint regression` pasó.
- [Deterministic persistence — run 39429700840](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700840): success.
- [M0 integrated acceptance — run 39429700796](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700796): success; los pasos de continuidad, reconstrucción/transición y entrypoints pasaron.
- [Chronicle native vertical — run 39429700814](https://github.com/snowdenxrp/aldea-ia/actions/runs/39429700814): success.

La prueba de contradicción de `tests/nexo/entrypoint.test.mjs` exige ahora exit code 1, `status: blocked`, código `NEXO_MISSION_STATUS_DISCREPANCY`, estados persistido/reconstruido visibles y ausencia de pasos/payload. El caso legítimo `planned → awaiting_verification` conserva respuesta `reconstructed`; no se convierte cualquier diferencia en bloqueo. No se muta la misión persistida para “arreglar” la consulta.

### Interpretación
La regresión selectiva está cerrada para este contrato en el SHA indicado. Esto no demuestra coherencia global de cada consumidor externo ni autoriza efectos protegidos. No hubo cambio de autoridad ni de Chronicle runtime. M0 sigue `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.
