# NCS — handoff de continuidad — 2026-10-24 — D1 manifest

## Puerta de entrada obligatoria para el siguiente chat

Seguir el orden del proyecto: `NEXO_NCS/STATUS.md → MASTER/CORE → BUILD → trabajo actual`. No iniciar automáticamente investigaciones antiguas ni repetir el censo ya hecho. STATUS.md fue consultado en esta sesión y su primer checkpoint visible aún refleja el checkpoint D1-S0 anterior; este handoff más reciente supersede sus instrucciones de “revisar artefactos” solo en lo que respecta al avance documental D1 aquí descrito. No se afirma que STATUS.md haya sido actualizado.

## Punto exacto alcanzado

Se creó y verificó en GitHub el manifiesto documental:
- [NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md](NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md)
- Commit: `325bc58c490aaacb7cf75152f4113b4019ad73ad`
- Blob: `9b5f9796cd19a1355decf027700926ee4ec45260`
- Rama: `ncs-clean-architecture`

El documento consolida el ledger de entrypoints, referencias de `package.json`, CLI padre/hijo, rutas de consulta y preview, fábricas de stores, excepciones de `assistants.mjs` y `simulate.mjs`, y los filtros/comandos de los workflows. Está verificado por lectura posterior en GitHub.

## Conclusiones documentales

- La cobertura de `tests/nexo/entrypoint.test.mjs` es parcial: las importaciones estáticas no cierran `import()`, `require`, cargadores calculados, acceso por rutas a fábricas/owners ni aristas de procesos hijos.
- `scripts/nexo.mjs` ejecuta `scripts/nexo-chronicle-session.mjs` mediante `spawnSync`; el hijo también es ejecutable por separado. El contrato de admisión de raíz del hijo y la prevención de doble bloqueo/deadlock siguen abiertos.
- Consultas y previews cargan snapshots; D2 debe decidir si toda lectura de snapshot canónico entra en la garantía de admisión acotada. El ledger recomienda incluirlas si se pretende prometer un único snapshot/heap vivo acotado por instancia.
- Los workflows son explícitos y con filtros de rutas; eso no demuestra que cubran los nuevos archivos de admisión. No se modificaron.
- `assistants.mjs` y `simulate.mjs` son EXPLICIT_EXCEPTION solo como clasificación de diseño, no están bloqueados en runtime.
- Aristas dinámicas, consumidores externos, destinos generados y guards no inspeccionados permanecen `UNKNOWN/BLOCKED`.

## Restricciones y estado canónico

- D0-C1…D0-C4 aceptadas como contrato de diseño; D1-S0 aceptada: diseño e implementación son gates separados.
- La aceptación no cierra D0 técnico ni D1 y no autoriza implementación.
- No cambiar runtime/tests/workflows ni ejecutar CI sin autorización explícita separada.
- M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- No hubo cambios de runtime/tests/workflows y no se ejecutaron pruebas/CI en este paso.

## Siguiente paso

Continuar el cierre documental D1 desde el manifiesto nuevo, sin rehacer el inventario de 2.982 entradas: comprobar de forma reproducible el conjunto de guards de ejecución directa y formas de carga de módulos del snapshot exacto; clasificar cada arista. Toda incertidumbre sigue `UNKNOWN/BLOCKED`. Después cerrar los contratos de diseño pendientes y los criterios de aceptación, sin declarar D1 cerrado hasta que se demuestre.

## ADDENDUM — revisión de discrepancias D0/D1 del 2026-10-24

Después del manifiesto se inspeccionaron los archivos exactos de la rama `ncs-clean-architecture` y se registró esta revisión:
- [NCS_M0_D0_D1_SOURCE_CONTRACT_DISCREPANCY_REVIEW_2026-10-24.md](NCS_M0_D0_D1_SOURCE_CONTRACT_DISCREPANCY_REVIEW_2026-10-24.md)
- Commit de creación: `2970a6388acd0f1a30fa866abba171ddc43c961e` (confirmar lectura del archivo y SHA de blob antes de citar como verificado).

Hallazgo nuevo y concreto: el contrato aceptado D0-C1..C4 aún no coincide con el código actual. `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs` aceptan rutas de almacenes (`--continuity`, `--chronicle`) y el hijo expone flags de inicialización; los parsers revisados no implementan `--root`. `continuity-queries.mjs` crea directamente un store desde `continuityPath`; las fábricas de store siguen basadas en rutas. La prueba de entrypoint actual verifica ese comportamiento previo, no el contrato nuevo aceptado. Esto es una discrepancia documental/runtime observada, no un permiso para corregir el código sin autorización.

También se verificó que los workflows tienen filtros de rutas explícitos y ejecutan listas selectivas de pruebas; no ejecutan todo `npm test`. No se debe afirmar que el contrato root está cubierto por CI.

Siguiente paso recomendado: completar el diseño de cómo una raíz única se traduce a rutas de stores, cómo se separa bootstrap de operación normal, cómo consultas/previews participan en la admisión, y cómo el hijo Chronicle valida el contexto sin doble bloqueo. Mantener UNKNOWN/BLOCKED para consumidores no inspeccionados. No tocar runtime/tests/workflows ni ejecutar CI; la implementación sigue sin autorización explícita.

Estado canónico sin cambios: M0 `INCOMPLETO`; D0 técnico/evidencia `OPEN`; D1-DESIGN `OPEN`; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
