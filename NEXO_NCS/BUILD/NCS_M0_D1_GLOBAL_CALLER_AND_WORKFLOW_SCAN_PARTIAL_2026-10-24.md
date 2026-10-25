# NCS M0 — cierre parcial de referencias globales, workflows y acoplamiento de memoria
Fecha: 2026-10-24
Estado: INSPECCIÓN ESTÁTICA — SNAPSHOT FIJADO — SIN EJECUCIÓN

## 1. Snapshot

- Commit fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`
- Se revisaron `package.json`, 8 workflows seleccionados y módulos de entrada/asistentes más relevantes fuera de `src/nexo/**`. No se ejecutó ningún workflow ni comando.

## 2. Hallazgo de workflows: hay rutas operativas separadas del CLI de reparación

Archivos y blobs del snapshot:

| Archivo | Blob SHA | Referencias estáticas |
|---|---|---|
| `package.json` | recuperado por el snapshot | `npm run assistants` → `node scripts/assistants.mjs`; `npm run simulate` → `node scripts/simulate.mjs`; `npm run nexo` → `node scripts/nexo.mjs`; `npm test` encadena numerosas pruebas Nexo/Lúmina |
| `.github/workflows/lumina-simulation.yml` | `e11a11b5101c992396737f3520c427c2c6c4f350` | Tiene pasos `npm test`, `npm run assistants` y `npm run simulate` |
| `.github/workflows/nexo-m0-repair-crash-cuts.yml` | `35e93581fd33912165f7adfb9656952e76c567fa` | Incluye filtros para módulos `scripts/nexo-repair-*.mjs`, `scripts/assistants.mjs` y pruebas específicas de reparación |
| `.github/workflows/nexo-m0-acceptance.yml` | `60323063fe6656eb7e7710825f327fa7e39526c3` | Incluye filtros de cambios para scripts de entrypoint/reparación y ejecuta grupos de pruebas de reparación/entrypoint |
| `.github/workflows/nexo-deterministic-tests.yml` | `3ebd313baecccaa42d89c995dfe8cdbd7f95400a` | Ejecuta `npm test` |
| `.github/workflows/nexo-m0-settlement-replay.yml` | `7952c82139b36e10e99004a4aea60a3d383ea366` | Filtra y ejecuta pruebas de settlement/crash cuts |
| `.github/workflows/nexo-m0-chronicle.yml` | `65b2bc04a015f5bd1fe010e3f3eec6e0481514e7` | Filtra y ejecuta la prueba de entrypoint |
| `.github/workflows/nexo-m0-mission-status.yml` | `416c84e3015fe2a211f0d9936221a04d93132637` | Filtra y ejecuta la prueba de entrypoint |

Interpretación: estos workflows son rutas de validación y/o ejecución de scripts de la aplicación, no prueban por sí mismos un bypass. La presencia de `npm run assistants` y `npm run simulate` en el workflow Lúmina significa que el análisis de callers no puede limitarse a los entrypoints llamados “Nexo”. No se infiere que un workflow haya corrido ni que esté habilitado actualmente.

## 3. Memoria de asistentes: separación de datos aún necesita contrato explícito

`src/assistants/memory.js` (blob `fce69ce466e9b033b1c9f654d16beac49a82852c`) contiene funciones `recordNexoPlan`, `recordNexoExecution`, `recordNexoOutcome` y normaliza una rama `nexo` que incluye misiones, intentos, ejecuciones y `effectJournal`. Las referencias se sitúan dentro de un módulo de memoria de asistentes y forman parte del estado que se normaliza/persiste por el flujo de asistentes.

La prueba `tests/assistants.test.mjs` (blob `5bc77be1b7a987d936efa4d5105996eaa76437da`) verifica el desacoplamiento de objetos anidados de la instantánea de origen. Esa prueba de copia profunda no demuestra separación de propiedad, persistencia ni autoridad entre Nexo y Lúmina.

Esto concuerda con la separación arquitectónica ya documentada: el almacenamiento/continuidad operacional de Nexo no debe tratarse como idéntico al estado de simulación/memoria de Lúmina. No se cambia ni elimina ninguna persistencia aquí.

## 4. Resultado global acotado

- La CLI conocida de reparación usa el wrapper bloqueado; las APIs inferiores tienen consumidores directos en tests.
- En el subconjunto de `src/nexo/**` inspeccionado no se observaron importaciones directas de las APIs inferiores de reparación.
- Fuera de `src/nexo/**`, el módulo de memoria de asistentes contiene APIs de registro Nexo en estado de asistentes, y workflows ejecutan los scripts `assistants` y `simulate`.
- Esto identifica una ruta de acoplamiento de datos y superficies de ejecución que requieren una clasificación de propiedad/frontera. No prueba una ruta de efecto protegido, bypass, vulnerabilidad ni ejecución no autorizada.
- La cobertura no equivale a un grafo completo de todos los módulos/archivos, imports dinámicos, reexports, workflows, dependencias o consumidores externos. Las aristas no demostradas siguen `UNKNOWN/BLOCKED`.

## 5. Próximo paso técnico

1. Leer completo el flujo `assistants.mjs → memory.js → persistencia de estado` y `simulate.mjs` para delimitar qué registros Nexo se escriben en qué almacén y con qué finalidad.
2. Clasificar workflows por trigger y por efectos (tests, simulación, artefactos), sin asumir que están activos por existir en el repositorio.
3. Convertir la separación de propiedad/persistencia en un criterio de diseño verificable antes de proponer cualquier cambio de runtime.
4. No implementar ni ejecutar tests/CI sin autorización explícita separada.

## 6. Gates

Solo lectura estática y documentación. Runtime/tests/workflows/estado Lúmina no modificados; no tests/CI.
M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
