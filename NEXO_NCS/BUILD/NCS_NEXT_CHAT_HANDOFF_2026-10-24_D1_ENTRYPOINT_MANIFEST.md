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


## ADDENDUM — contrato de instancia propuesto, no aceptado — 2026-10-24

Se intentó crear un documento separado con la propuesta del contrato de raíz; la operación fue bloqueada por los controles de la herramienta, así que no se afirma que ese archivo exista. Para conservar el trabajo, este resumen queda aquí.

**Propuesta técnica para revisión, no decisión del propietario:**
1. Cada CLI/API público recibe una sola raíz explícita; no recibe rutas arbitrarias de Continuity y Chronicle.
2. Operación normal exige directorio existente y estado válido; no inicializa, repara, migra ni elige rutas heredadas.
3. Canonicalizar la raíz según una política explícita de symlinks antes de derivar rutas de stores y locks.
4. Las lecturas y escrituras públicas usan la misma admisión y derivación de rutas. D2 debe definir la vida útil/alcance del snapshot antes de prometer un límite de memoria por instancia.
5. El hijo Chronicle valida la raíz cuando se ejecuta directamente; la invocación padre/hijo debe definir quién posee cada lock y evitar doble adquisición. Un booleano enviado por el caller no demuestra por sí solo que hubo admisión.
6. Bootstrap debe ser una operación separada, con precondiciones y comportamiento explícito ante inicialización parcial; operación normal no crea ni repara almacenes.
7. Las fábricas de bajo nivel pueden seguir siendo primitivas internas/de test, pero cada caller de producción debe clasificarse y las pruebas arquitectónicas deben detectar bypasses.
8. La cobertura de arquitectura debe incluir importaciones estáticas/dinámicas, `require`, loaders calculados, acceso a factories/owners, destinos de procesos hijos y filtros/comandos de workflows.

**Decisiones pendientes:** mapping y nombres exactos de los stores; si cada operación necesita ambos stores; política de symlinks/nombres reservados/colisiones; validez de raíz vacía; semántica de bootstrap parcial; coordinación de lock padre/hijo; alcance de queries/previews; límite público/API frente a primitivas internas; consumidores externos y wrappers de compatibilidad. No inventar nombres de archivos ni inferir que consumidores externos no existen.

**Criterio:** D0-C1..C4 aceptadas establecen política general, pero no resuelven todos estos detalles. D0 técnico y D1-DESIGN siguen OPEN. Esto no autoriza implementación.

La creación del documento separado fue bloqueada; este addendum es el registro persistente disponible. No hubo cambios en runtime/tests/workflows ni ejecución de tests/CI. Estado: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP.


## Addendum: reconciliation with existing root contract (2026-10-24)

Correction to the previous addendum: the existing root contract DOES contain a candidate layout; “not selected” meant not finalized as a technical decision, not that no proposal exists.

Existing candidate layout in `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` (blob `bac9493af98c3f86001e323dab153bdee78b5f31`):
- `<root>/continuity.json`: canonical Continuity store.
- `<root>/chronicle.json`: canonical Chronicle store.
- `<root>/.nexo-instance.lock/`: candidate shared-admission directory with `owner.json`; explicitly a D2 candidate, not implemented.
- Existing per-store temporary and lock naming/protocols remain unchanged in this phase.

The contract says not to add a data subdirectory, manifest, bootstrap marker, or persistent config file without proving it necessary. The shared-lock name is illustrative and does not authorize a second lock system.

The root contract already proposes operation-wide cross-process admission before protected snapshots are loaded, release in finally, UNKNOWN/blocked on acquisition/ownership/release uncertainty, preservation of current per-store lock order, and no production query/preview bypass. Low-level store factories may remain for tests/internal composition, while production enters through an instance/admission boundary.

Next work is reconciliation, not reinvention: distinguish accepted D0-C1..C4 policy from still-open technical details; close bootstrap/partial-store semantics; settle parent/child admission and lock ownership; align query/preview scope with D2 snapshot/resource guarantees; map all production entrypoints to future architecture tests. No implementation or tests authorized.

No runtime/tests/workflows changed; no tests/CI run. D0 technical/evidence OPEN; D1-DESIGN OPEN; D2/D3 OPEN; M0 INCOMPLETO; authorization NOT_EVALUATED; legitimate root PENDING/UNKNOWN; protected effects STOP.
