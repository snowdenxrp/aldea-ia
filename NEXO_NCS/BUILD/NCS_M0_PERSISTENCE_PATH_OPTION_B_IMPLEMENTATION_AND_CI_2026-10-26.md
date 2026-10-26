# NCS M0 — Implementación de política de rutas B y evidencia CI (2026-10-26)

## Decisión y alcance autorizado

El owner ratificó la opción B y autorizó modificar el runtime y los tests de persistencia conforme a esa política. El cambio se limita al contrato de rutas de `persistState()` y sus pruebas. No autoriza ni modifica efectos protegidos, autoridad raíz, bootstrap ni otros gates canónicos.

## Cambios realizados

- `scripts/simulate.mjs` (commit `b96d8f6694aa87601d1da1b85f0c337d62b84f85`): añade normalización de ruta en la frontera de `persistState()`. Acepta cadena nativa absoluta o URL `file:`, rechaza cadena vacía/relativa, tipos no admitidos y URLs de otros esquemas. Convierte URL `file:` con `fileURLToPath()` para decodificar correctamente segmentos codificados. La ruta nativa normalizada se usa para lock, revisión, temporal, directorio, `rename` y limpieza.
- `tests/nexo/conditional-commit-persist-state.test.mjs` (commit `d65b5d65ff0ea8efc18cc7397737eb6abe3f68ae`): añade cobertura para URL `file:` con espacio codificado, persistencia observable, y rechazo de ruta relativa, esquema HTTP y tipo inválido. Se conservan las aserciones de commit condicional y de resultado desconocido.

## Evidencia CI

- Workflow: `Nexo — deterministic persistence tests`.
- Run: `40366480168` — [ver ejecución](https://github.com/snowdenxrp/aldea-ia/actions/runs/40366480168).
- HEAD comprobado: `d65b5d65ff0ea8efc18cc7397737eb6abe3f68ae`.
- Job `tests` (`121725486016`): `completed / success`.
- Paso `Run tests`: `success`.
- Paso `Bounded temporary cleanup regression`: `success`.
- Run complementario de persistencia en el commit del runtime: `40366433571`, `success`.
- Run de verificación STEP 3A/3B/3C en el HEAD de tests: `40366480102`, `success`.

Esto verifica que la suite de ese workflow pasó en el HEAD citado; no equivale a afirmar que toda la CI del repositorio está verde ni que la causa primaria histórica del run `40270739196` fue capturada directamente. La hipótesis de incompatibilidad de ruta/tipo era consistente con el arreglo y el test fallido ya no bloquea la suite, pero no se debe afirmar que se capturó retrospectivamente su excepción original.

## Estado de gates

- Reparación de persistencia bajo alcance autorizado: implementada; workflow determinista de persistencia verificado en el HEAD citado.
- M0: `INCOMPLETO`.
- D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: autorización limitada a esta reparación de persistencia; no es autorización general de implementación Nexo.
- Authorization: `NOT_EVALUATED` para efectos protegidos.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Bootstrap A/B/C/D: sin seleccionar.

## Límites pendientes

- No se definió una nueva política de symlinks.
- No se rediseñaron los errores secundarios de cleanup/release-lock.
- No se alteró la semántica de `COMMIT.UNKNOWN` / `RECONCILE_REQUIRED` ni se relajaron aserciones.
- No se afirma que la reconciliación de outcomes ambiguos ya esté implementada.
