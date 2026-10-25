# NCS M0 — snapshot base fijado para D1
Estado: BASE DE EVIDENCIA PINNED — NO EQUIVALE A CIERRE D1
Repositorio: `snowdenxrp/aldea-ia`
Rama observada: `ncs-clean-architecture`

## 1. Identidad exacta del snapshot

- Commit HEAD observado: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree SHA: `1f63ffd83682f490482a09b974f6455605ed0767`
- Árbol recursivo: `truncated=false`
- Entradas del árbol: `3061`
- Archivos candidatos según extensión/ruta para el barrido inicial: `137`
  - `scripts/**/*.mjs|cjs|js`: 13
  - `.github/workflows/**/*.yml|yaml`: 28
  - `tests/**/*.mjs|cjs|js`: 95
  - `package.json`: 1

La cuenta de 137 es una regla de selección reproducible por rutas/extensiones, no una afirmación de que todos sean entrypoints productivos ni de que se hayan inspeccionado todas las formas de ejecución. Los archivos fuera de estas categorías —incluyendo módulos fuente, loaders, binarios o referencias indirectas— pueden seguir siendo relevantes.

## 2. Fuentes críticas recuperadas desde el commit fijado

Los siguientes blobs fueron recuperados usando el SHA del commit, no el nombre móvil de la rama. Los SHA listados coinciden con las entradas del árbol recursivo observado.

| Ruta | Blob SHA |
|---|---|
| `package.json` | `e45dc6d215db53ea2758009cd501f565634e3610` |
| `.github/workflows/nexo-m0-chronicle.yml` | `65b2bc04a015f5bd1fe010e3f3eec6e0481514e7` |
| `.github/workflows/nexo-mission-admission-continuity.yml` | `03f2a0cb8268e442ce4db434383b0f4854073d82` |
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` |
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` |
| `scripts/simulate.mjs` | `623d316c7a1efd10cc2f06a3080c0d9f06087596` |
| `scripts/nexo-runtime-session.mjs` | `f67b6fbe1b6f0098ebf23b35055cc668f96df991` |
| `scripts/nexo-repair-session.mjs` | `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5` |
| `scripts/nexo-repair-entrypoint.mjs` | `74d0fa92c447034e7454b7b846d584819ac81ffd` |
| `scripts/nexo-repair-dispatch.mjs` | `ed45438be7604d3b341cecd5fbcfc69adda2447e` |
| `src/nexo/application/index.mjs` | `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3` |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` |
| `src/nexo/application/continuity-queries.mjs` | `e1915e94e53e71d37a37952fead37ba62bdae79a` |
| `src/nexo/application/mission-request-preview.mjs` | `4e317b646d0c7b7403acfb63732dec8c3fe7778b` |
| `tests/nexo/entrypoint.test.mjs` | `ff1bd2e9d292e21e00049b354249aee684837bbc` |

## 3. Cómo usar esta base

- Todo nuevo hallazgo derivado de este pase debe citar el commit SHA y el blob SHA, o marcarse como procedente de otro snapshot.
- Antes de un pase posterior, volver a resolver el HEAD de la rama. Si cambió, capturar un nuevo tree recursivo y no mezclar silenciosamente evidencia entre commits.
- Si una fuente no puede recuperarse desde el commit fijado, registrar `UNKNOWN/BLOCKED`; no sustituirla silenciosamente por la versión actual de la rama.
- Los recuentos de archivos son un inventario inicial, no cobertura. Cada entrypoint, guard de ejecución directa, llamada de fábrica/owner, lectura persistente, proceso hijo y arista de importación necesita clasificación explícita.
- La existencia de un blob o hash no demuestra que se ejecutaran tests, CI ni que el código satisfaga el contrato.

## 4. Límites y estado

- No se ejecutó ningún código del repositorio durante la captura.
- No se modificó runtime, tests, workflows ni estado de Lúmina.
- No se ejecutaron tests ni CI.
- No se declara D1 cerrado; el manifiesto de aristas y la clasificación de ejecución permanecen incompletos.
- M0: `INCOMPLETO`; D0 técnico/evidencia: `OPEN`; D1-DESIGN: `OPEN`; D1-IMPLEMENTATION: no autorizada; D2/D3: `OPEN`; autorización: `NOT_EVALUATED`; raíz legítima: `PENDING/UNKNOWN`; efectos protegidos: `STOP`.
