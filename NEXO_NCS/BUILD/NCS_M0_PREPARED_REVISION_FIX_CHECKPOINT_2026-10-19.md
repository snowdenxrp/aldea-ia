# NCS M0 — checkpoint tras corregir la frontera PREPARED

**Fecha:** 2026-10-19  
**Rama:** `ncs-clean-architecture`  
**Estado global:** M0 INCOMPLETO. Regresiones de PREPARED y lineage ejecutadas por GitHub Actions con aceptación integrada PASS en SHA `48114cd275b98cbbf3142bb242f90d0c5c543d0a`; `npm test` completo no queda demostrado.

## Cambios de código publicados

1. Runtime: `src/nexo/core/owner-backed-runtime.mjs` ahora exige que `prepared.storeRevision` sea entero seguro no negativo y exactamente `current.storeRevision + 1`; también valida la revisión actual y bloquea antes de marcar despacho o invocar el adaptador si no existe sucesor seguro.
   - Commit inicial de validación de revisión: `dd1abc69cd867927c2fba949a4677fc7b2e51e99`; contrato de sucesor exacto: `879b9e0791696bafdb081f973ae16827cf8eab04`
   - [Ver diff](https://github.com/snowdenxrp/aldea-ia/commit/dd1abc69cd867927c2fba949a4677fc7b2e51e99)

2. Pruebas: `tests/nexo/chronicle-runtime.test.mjs` incluye diez respuestas PREPARED malformadas o contractualmente inconsistentes y verifica bloqueo, `dispatchAttempted:false`, `redispatchAuthorized:false`, cero llamadas a `adapter.executePrepared` y cero invocaciones del handler.
   - Commit de regresiones base: `4203330689d6ea4072585d8cc6bca74b383ca461`; endurecimiento de aserciones: `cfd57bf8e8a74570c23908c30599126f9d76748a`; revisiones no sucesoras: `bdef7856448b3004b4c64afc635b79f6ad862176`
   - [Ver diff](https://github.com/snowdenxrp/aldea-ia/commit/4203330689d6ea4072585d8cc6bca74b383ca461)

3. La matriz de regresión refleja los casos PREPARED y lineage; ejecución CI confirmada en el SHA actual de evidencia. Commit de matriz base: `c57867b3131416e7d6bcf564106427a4d40a3a05`; actualización de revisión sucesora: `3f8434c188c09a90056d6e44cbeee0f187c568ec`.
   - [Matriz](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_PREPARED_CONFIRMATION_REGRESSION_MATRIX_2026-10-19.md)
   - [Hallazgo inicial y corrección registrada](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_PREPARED_REVISION_BOUNDARY_FINDING_2026-10-19.md) (actualizado en commit `d1be3dbe8e805e8fbd847fa272f7f83244655581`)

## Verificación inicial (histórica; reemplazada por CI posterior)

La nota anterior de que las pruebas estaban pendientes corresponde al momento inicial de la investigación. Fue superada por las ejecuciones GitHub Actions registradas abajo. No debe usarse como estado actual.

## Siguiente secuencia

1. La prueba focal `chronicle-runtime.test.mjs` y los workflows de aceptación integrada, Chronicle vertical, mission admission/restart, STEP 4 y STEP 5 ya pasaron en el SHA actual `48114cd275b98cbbf3142bb242f90d0c5c543d0a`.
2. Ejecutar `npm test` completo y cualquier suite Nexo fuera de los workflows ya citados; no afirmar que ya pasó.
3. Continuar con el siguiente contrato real de settlement/owner-backed runtime sin reabrir auditorías cerradas ni cambiar de misión.
4. Mantener la decisión de autoridad separada: `authorization: NOT_EVALUATED`, efectos protegidos STOP, M0 INCOMPLETO. Estos guards no establecen autoridad legítima ni una raíz de propietario.

## Primera ejecución real de CI y corrección derivada

- La ejecución real `nexo-m0-chronicle` sobre SHA `bdef7856448b3004b4c64afc635b79f6ad862176` falló antes de llegar a `chronicle-runtime.test.mjs`.
- Log: `chronicle-store.test.mjs:130` esperaba que `initialize()` rechazara con la excepción interna simulada. El contrato real de `createNexoChronicleStore.initialize()` normaliza fallos de adquisición del lock como resultado `blocked / NEXO_CHRONICLE_LOCK_ACQUISITION_FAILED`, y el test no coincidía con ese contrato. El log confirma que el fallo fue la aserción “Missing expected rejection”, no la regresión PREPARED.
- Corrección del test publicada en commit `2b9f2f5f3a21dac0f3b6cf0a221e6f28c943db86`: ahora exige el resultado normalizado y sigue comprobando que el directorio `.lock` se elimine.
- Tras corregir también la expectativa equivalente en `continuity-store.test.mjs` (commit `c7b7937039eddb13cda1061cf002342146ba7bf4`) y exponer `authorization: NOT_EVALUATED` en el CLI (commit `8476f321ba1b17c840c9fbafda7d76d54b8abd07`), las ejecuciones M0 Chronicle, M0 aceptación integrada y mission-admission-continuity pasaron en el SHA `8476f321ba1b17c840c9fbafda7d76d54b8abd07`; véase la sección de verificación CI más abajo.

## Verificación CI completada en SHA exacto

En SHA `8476f321ba1b17c840c9fbafda7d76d54b8abd07`, GitHub Actions terminó con éxito en los flujos que cubren esta corrección:

- M0 aceptación integrada: `39334317092` — SUCCESS. Incluye continuidad admission/store, reconstrucción y transición protegida, Chronicle store/runtime/entrypoint, crash cuts/owner recovery y clasificación/verificación de resultados.
- Chronicle native vertical: `39334316772` — SUCCESS. Ejecutó `chronicle-store.test.mjs`, `chronicle-runtime.test.mjs` y `entrypoint.test.mjs`.
- Mission admission / restart continuity: `39334316706` — SUCCESS.
- STEP 4 semantic validation: `39334260966` — SUCCESS (SHA anterior `c7b7937039eddb13cda1061cf002342146ba7bf4`).
- STEP 5 outcome classification: `39334261022` — SUCCESS (SHA anterior `c7b7937039eddb13cda1061cf002342146ba7bf4`).

Enlaces de ejecución:
- https://github.com/snowdenxrp/aldea-ia/actions/runs/39334317092
- https://github.com/snowdenxrp/aldea-ia/actions/runs/39334316772
- https://github.com/snowdenxrp/aldea-ia/actions/runs/39334316706

Esto valida dinámicamente las regresiones de esta rama hasta el SHA indicado y la aceptación integrada enumerada por ese workflow. No equivale a pasar `npm test` completo ni a demostrar autoridad legítima del propietario. Estado constitucional permanece `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.


## Nueva corrección: confirmación de revisión de lineage

La inspección del runtime detectó un límite posterior a PREPARED: el runtime aceptaba `lineage.status === "committed"` y pasaba `lineage.storeRevision` a reconciliación sin validar que la revisión fuera segura y exactamente el sucesor de la revisión PREPARED. La llamada externa ya pudo haber ocurrido, así que un resultado malformado debe producir UNKNOWN y detener la reconciliación; nunca reintentar el efecto.

- Runtime: commit `3aa59cbfeadc7928a7592b7f0fe479b86206ccf7` añade el guard. Exige revisión PREPARED válida y menor que `Number.MAX_SAFE_INTEGER`, revisión de lineage entero seguro y `lineage.storeRevision === prepared.storeRevision + 1`. Si falla, devuelve `NEXO_EXECUTION_LINEAGE_COMMIT_NOT_CONFIRMED`, `lineageCommitted: "UNKNOWN"`, sin reconciliar, sin terminal outcome y con `redispatchAuthorized:false`.
- Regresiones: commit `48114cd275b98cbbf3142bb242f90d0c5c543d0a` prueba tres respuestas comprometidas malformadas (revisión ausente, igual a PREPARED y salto de revisión). Las tres confirman que el adaptador se invoca solo una vez, reconciliación cero veces, estado UNKNOWN y sin autorización de redispatch.
- GitHub Actions en SHA `48114cd275b98cbbf3142bb242f90d0c5c543d0a`: aceptación M0 integrada run `39335842717` SUCCESS; Chronicle native vertical `39335842965` SUCCESS; mission admission/restart `39335842749` SUCCESS; STEP 4 `39335842689` SUCCESS; STEP 5 `39335842743` SUCCESS.
- Enlaces: https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842717 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842965 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842749
- Estos workflows verifican la regresión focal y contratos integrados cubiertos por ellos, no la suite completa `npm test`, autenticación de propietario ni ejecución protegida habilitada.
