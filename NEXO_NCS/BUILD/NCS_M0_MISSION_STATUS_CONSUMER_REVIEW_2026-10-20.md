# NCS M0 — revisión dirigida de consumidores de mission-status

Fecha: 2026-10-20  
Rama: `ncs-clean-architecture`  
Tipo: inspección estática de fuentes y pruebas existentes; sin cambios de runtime ni ejecución de CI en esta revisión.

## Pregunta

¿Hay un consumidor que convierta una respuesta bloqueada o una discrepancia terminal de `loadNexoMissionStatus()` en una misión utilizable?

## Evidencia de implementación

- `src/nexo/application/continuity-queries.mjs`, blob `432a53038d1527ada0d1be9bb77769aaaf2df9ee`: lee una revisión canónica una sola vez. Si el estado persistido es `completed` pero la reconstrucción no lo respalda, retorna `status: "blocked"`, `code: "NEXO_MISSION_STATUS_DISCREPANCY"` y `statusDiscrepancy: true`, omitiendo `steps`. La consulta no muta el snapshot.
- `src/nexo/application/index.mjs`, blob `7871645de355bc37ae074f4372ea960b887145be`: reexporta la consulta como API pública estrecha; no procesa su resultado.
- `scripts/nexo.mjs`, blob `3dfa9abde16e6dbf03a5d4cbc7f1004da6d99ad1`: la CLI imprime el resultado y establece código de salida 1 salvo que `result.status === "reconstructed"`. Por tanto, la respuesta `blocked` no se trata como éxito.
- `tests/nexo/entrypoint.test.mjs`, blob `644ddec437606ccd9ed0651ccf631e8b95ac4801`: incluye regresión de discrepancia terminal: código de salida 1, código `NEXO_MISSION_STATUS_DISCREPANCY`, `statusDiscrepancy: true`, sin `steps`, sin filtración del sentinel privado y sin mutación del archivo.

## Inventario adicional dirigido

Se inspeccionaron las referencias a los campos/función en estos archivos, sin encontrar usos directos adicionales de `loadNexoMissionStatus`, `statusDiscrepancy` o `NEXO_MISSION_STATUS_DISCREPANCY`:

- `src/nexo/application/chronicle-append.mjs` — blob `ccb09c6874b9173963811073150c87b75f53bf2f`
- `src/nexo/core/continuity-operations.mjs` — blob `f0ff97bd6dcb8543ce5bb97f85d482a1e1c4e6aa`
- `src/nexo/core/continuity-store.mjs` — blob `9b2bf50c26a76826f40f6761e07c1537db284262`
- `scripts/nexo-chronicle-session.mjs` — blob `647bc9662fbb7441ec9e30c1aab8b9239e66beda`
- `scripts/nexo-continuity.mjs` — blob `f08969f2d77a2e90f74d01c96242e29de89e3f22`
- `scripts/nexo-repair-entrypoint.mjs` — blob `74d0fa92c447034e7454b7b846d584819ac81ffd`
- `scripts/nexo-repair-session.mjs` — blob `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5`
- `scripts/nexo-runtime-session.mjs` — blob `c1691c8df42c641051fd96fb7fe4c907c0742d23`
- `scripts/nexo-repair-dispatch.mjs` — blob `ed45438be7604d3b341cecd5fbcfc69adda2447e`
- `scripts/nexo-repair-mission-verification.mjs` — blob `6f9c58cac203faa65e23c1a076af4746f5c22324`
- `scripts/nexo-repair-preparation.mjs` — blob `3e978dc11c6f4d7f9e5f61c722629be34f6404a0`
- `scripts/nexo-repair-settlement.mjs` — blob `2f6e91d494b4edb012c2b2db5a077b875c5b0348`
- `tests/nexo/assistants-runtime-cli.test.mjs` — blob `d9a1bf720c92674e3c7922355e1add7b5db0e810`
- `tests/nexo/restart-reconstruction.test.mjs` — blob `ed4e201c242f0031ce373043ff8587ed89c26b87`
- `tests/nexo/continuity-migration.test.mjs` — blob `0bef1b93c6268042f14830c97e084d0a543e05f4`
- `tests/nexo/continuity-contract.test.mjs` — blob `737c5ad42307496cc1e010174f00c28b9a1e13f8`
- `tests/nexo/repair-session.test.mjs` — blob `5d35378de425d5fdbcf86f39d980d2ccf708a188`
- `tests/nexo/repair-mission-verification.test.mjs` — blob `cd676e1805516ed7b2cad0a18709e945e15261cd`

El árbol inspeccionado procede de la rama objetivo `ncs-clean-architecture`, tree SHA `599d4d24499acb0a63a6f4b4102c1fd8a32127f0`. La búsqueda de código global del conector no proporcionó resultados utilizables para esa rama; por eso esta conclusión se limita a los archivos y consumidores examinados y no afirma una prueba matemática de ausencia en todo el repositorio.

## Conclusión y decisión

No se encontró un consumidor que ignore el bloqueo en el alcance inspeccionado. El único consumidor de consulta observado es la CLI, que falla cerrada; la API pública solo reexporta la función. La prueba de entrypoint ya cubre la discrepancia terminal. **No se justifica un cambio de runtime ni una prueba duplicada en este punto.**

La siguiente puerta de M0 no cambia: mantener los efectos protegidos en `STOP` y avanzar al siguiente bloqueo documentado en la prioridad vigente, sin reabrir la investigación de raíz/AuthorityGate ni afirmar que la autorización legítima esté implementada.

## Validación

- Runtime modificado: no.
- Pruebas modificadas/ejecutadas: no.
- CI nuevo: no.
- Resultado: hallazgo negativo acotado, documentado; M0 sigue incompleto.
