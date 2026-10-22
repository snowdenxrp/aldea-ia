# NCS M0-E — Corrección acotada de limpieza de temporales (2026-10-22)

## Implementación

En `src/nexo/core/continuity-store.mjs` y `src/nexo/core/chronicle-store.mjs`, `removeStaleTemporaryFiles()` dejó de usar `readdir()` para materializar la lista completa del directorio. Ahora enumera mediante `fsModule.opendir()` y el iterador asíncrono.

Presupuesto nuevo en `src/nexo/core/resource-limits.mjs`:
- `temporaryDirectoryEntries = 10,000`: máximo de entradas totales inspeccionadas.
- `staleTemporaryFiles = 4,096`: máximo de temporales candidatos reunidos antes de borrar.

La enumeración termina antes de borrar cualquier candidato. Si la inspección falla o supera cualquiera de los límites, la operación falla de forma conservadora y no elimina candidatos parcialmente. Además, `writeEnvelope()` y `writeDocument()` solo intentan limpiar el temporal estable si el intento de escritura realmente comenzó; un límite de enumeración alcanzado antes de escribir no debe borrar ese temporal por efecto secundario.

## Regresión

Nuevo test `tests/nexo/temporary-cleanup-bounds.test.mjs`: usa un adaptador de filesystem que simula una carpeta con más temporales de los permitidos, sin crear miles de archivos reales. Comprueba para Continuity y Chronicle que el escaneo excesivo:
- no elimina ningún candidato;
- conserva byte por byte el documento canónico;
- no informa de un commit/apply exitoso.

El workflow `.github/workflows/nexo-deterministic-tests.yml` ejecuta esta regresión después de `npm test`.

## Commits de implementación

- Límites: [214c8c8](https://github.com/snowdenxrp/aldea-ia/commit/214c8c8b6feed5659732e3f593cc652dc5b37e5a)
- Continuity: [bfb19b5](https://github.com/snowdenxrp/aldea-ia/commit/bfb19b52212773420475b1eb7068d510f63fb7da)
- Chronicle: [637bd98](https://github.com/snowdenxrp/aldea-ia/commit/637bd988ee1e491b357720f718bd3bd1c87ade90)
- Regresión: [fa0324e](https://github.com/snowdenxrp/aldea-ia/commit/fa0324e084715c6357f47c621bedc9d8b11cf098)
- Workflow: [cf35026](https://github.com/snowdenxrp/aldea-ia/commit/cf35026daea4384cc36d3ce0d12eb40ac8079d7b)

## Estado de verificación

El código y la regresión están guardados en la rama `ncs-clean-architecture`. Aún no se ha confirmado el resultado de CI para el HEAD posterior a estos cambios; no declarar la corrección validada hasta revisar los logs y el SHA exacto del workflow.

## Límites de la afirmación

Esta medida acota memoria de enumeración y el número de candidatos. No demuestra protección frente a procesos hostiles que controlen el directorio, symlinks, fallos de hardware ni pérdida de energía. Las rutas locales siguen siendo configuración confiable.

Estado canónico sin cambios: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
