# NCS M0 — checkpoint tras corregir la frontera PREPARED

**Fecha:** 2026-10-19  
**Rama:** `ncs-clean-architecture`  
**Estado global:** M0 INCOMPLETO; pruebas dinámicas pendientes.

## Cambios de código publicados

1. Runtime: `src/nexo/core/owner-backed-runtime.mjs` ahora valida `Number.isSafeInteger(prepared.storeRevision)` y `prepared.storeRevision >= 0` antes de marcar despacho e invocar el adaptador.
   - Commit: `dd1abc69cd867927c2fba949a4677fc7b2e51e99`
   - [Ver diff](https://github.com/snowdenxrp/aldea-ia/commit/dd1abc69cd867927c2fba949a4677fc7b2e51e99)

2. Pruebas: `tests/nexo/chronicle-runtime.test.mjs` incluye ocho respuestas PREPARED malformadas y verifica bloqueo, `dispatchAttempted:false`, `redispatchAuthorized:false`, cero llamadas a `adapter.executePrepared` y cero invocaciones del handler.
   - Commit de regresiones base: `4203330689d6ea4072585d8cc6bca74b383ca461`; endurecimiento de aserciones: `cfd57bf8e8a74570c23908c30599126f9d76748a`
   - [Ver diff](https://github.com/snowdenxrp/aldea-ia/commit/4203330689d6ea4072585d8cc6bca74b383ca461)

3. La matriz de regresión fue actualizada para reflejar el guard implementado y los casos escritos, pero aún no ejecutados. Commit de matriz: `c57867b3131416e7d6bcf564106427a4d40a3a05`.
   - [Matriz](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_PREPARED_CONFIRMATION_REGRESSION_MATRIX_2026-10-19.md)
   - [Hallazgo original](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_PREPARED_REVISION_BOUNDARY_FINDING_2026-10-19.md)

## Verificación realizada

- Volví a leer el runtime, la prueba y la matriz desde la rama.
- Revisión estática adicional: las regresiones ahora cuentan por separado las llamadas al adaptador y al handler, de modo que no dependan solo de observar cero efectos.
- Recuperé los diffs de ambos commits y confirmé que solo cambian el guard de PREPARED y la prueba focal prevista.
- No ejecuté Node, la prueba focal, la suite Nexo ni CI. Los commits no tienen ejecuciones de workflow asociadas en la consulta disponible. No declarar PASS.

## Siguiente secuencia obligatoria

1. Ejecutar `node tests/nexo/chronicle-runtime.test.mjs`.
2. Ejecutar los tests Nexo relacionados, al menos `effect-adapter.test.mjs`, `runtime.test.mjs`, `runtime-concurrency.test.mjs`, `restart-reconstruction.test.mjs` y `protected-transition.test.mjs`.
3. Ejecutar la suite de proyecto si el entorno lo permite.
4. Inspeccionar resultados y fijarlos al SHA probado; corregir cualquier fallo antes de avanzar.
5. Mantener la decisión de autoridad separada: `authorization: NOT_EVALUATED`, efectos protegidos STOP, M0 INCOMPLETO. Esta corrección valida el contrato de revisión; no establece autoridad legítima ni una raíz de propietario.
