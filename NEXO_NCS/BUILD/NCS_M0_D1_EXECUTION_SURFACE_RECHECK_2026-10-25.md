# NCS M0 — recheck concreto de superficies de ejecución D1
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Estado: **EVIDENCIA DE FUENTE — D1-DESIGN OPEN — NO IMPLEMENTACIÓN**

## 1. Alcance de esta pasada

Relectura de cinco fuentes relevantes en `ncs-clean-architecture`, sin repetir el barrido histórico de 188 blobs ni ejecutar el software. Se registran comportamientos observados y sus límites. No se modificó runtime, tests, workflows ni datos operativos; no se ejecutaron pruebas ni CI.

## 2. Snapshot de fuentes reconsultadas

| Archivo | Blob SHA | Evidencia observada |
|---|---|---|
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | Parser de comandos; guard de ejecución directa; rutas status/mission/preview; `spawnSync` al hijo Chronicle con argumentos reenviados sin transformar a raíz única. |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | Guard de ejecución directa; parser de `--continuity`, `--chronicle`, IDs y flags de inicialización; llama a `runNexoChronicleAppend`. |
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | Usa paths por defecto y variables de entorno para estado/memoria/Continuity; abre owner, registra misión Nexo, escribe memoria Lúmina y world-state; el flag `--nexo-repair-once` llama al wrapper de reparación. |
| `scripts/simulate.mjs` | `623d316c7a1efd10cc2f06a3080c0d9f06087596` | `main()` lee world-state, abre Continuity usando `NEXO_CONTINUITY_PATH` por defecto, permite `legacyMemory` desde `state.nexoMemory`, persiste simulación y tiene guard de ejecución directa. |
| `scripts/nexo-runtime-session.mjs` | `f67b6fbe1b6f0098ebf23b35055cc668f96df991` | Wrapper de reparación devuelve `blocked / NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`. |

## 3. Hallazgos concretos

### F-01 — La CLI Nexo no implementa aún el contrato de raíz

El parser observado exige `--continuity` en los comandos de lectura y usa el dispatch `chronicle-append` para reenviar argumentos al hijo. No se observó `--root` en la superficie revisada. Esto contradice el **TARGET** de raíz única, pero no implica que se haya autorizado un cambio. Estado: **contrato de diseño ratificado; enforcement runtime no implementado en esta superficie observada**.

### F-02 — El proceso hijo conserva una superficie de ejecución independiente por rutas

El hijo parsea paths de Continuity/Chronicle y flags de inicialización. La invocación directa es posible por su guard. El padre reenvía argumentos de Chronicle mediante `spawnSync`; la evidencia revisada no muestra transformación de paths a una raíz única ni token/contrato de admisión compartido. No inferir que el padre protege al hijo. Estado: **OPEN; contrato padre/hijo pendiente**.

### F-03 — La operación ordinaria de Lúmina tiene acoplamiento Nexo visible

`assistants.mjs` importa el owner de Continuity y el orquestador Nexo, consume `persisted.nexoMemory`, registra una misión Nexo y luego escribe memoria Lúmina y world-state. El flag de reparación pasa por el wrapper que actualmente devuelve bloqueado; esto limita ese camino específico, pero no demuestra que todas las APIs de reparación inferiores sean inaccesibles. Estado: **separación de dominios no demostrada; callers inferiores siguen sujetos a clasificación**.

### F-04 — Simulación accede a Continuity y legado de Nexo

`simulate.mjs` abre Continuity con ruta fija derivada del script y pasa `state.nexoMemory` como `legacyMemory`; la misma operación persiste el estado de simulación. No se debe “resolver” esto borrando persistencia legítima de simulación. La frontera objetivo debe eliminar la operación Nexo de la ruta ordinaria de simulación sin perder el comportamiento propio de Lúmina. Estado: **acoplamiento observado; estrategia mínima de refactor no elegida**.

### F-05 — El wrapper de reparación no prueba inaccesibilidad total

El wrapper actual es fail-closed para la sesión de reparación del entrypoint, pero el comentario del propio archivo deja los protocolos subyacentes en módulos dedicados. No se ha demostrado por esta pasada que no existan callers directos de APIs inferiores. Mantener reparación/migración/cutover fuera de M0 según O-07 y clasificar las exportaciones/callers no resueltos como UNKNOWN/BLOCKED.

### F-06 — Búsqueda de cargadores dinámicos: resultado insuficiente, no negativo

La búsqueda acotada de GitHub para `import(`, `createRequire` y nombres seleccionados no devolvió resultados utilizables. Por las limitaciones del buscador, esto **no** demuestra ausencia de importaciones dinámicas, loaders computados o consumidores externos. No elevar el estado del grafo: sigue UNKNOWN/BLOCKED en las aristas no resueltas.

## 4. Implicación para el orden de trabajo

1. No volver a rastrear los 188 blobs por nombre sin un cambio de fuente.
2. Reconciliar estas observaciones con el contrato de frontera ya registrado.
3. La decisión de diseño que falta no es si “bloquear” de manera abstracta: es definir el corte mínimo de responsabilidades que mantiene Lúmina funcional y quita la operación Nexo de sus rutas ordinarias, y definir cómo las APIs Nexo reciben la raíz/admisión.
4. Mantener la opción de separación lógica/modular como candidata hasta comparar sus límites con los callers observados. No añadir guards ficticios en el documento como si ya existieran.
5. Dejar en D2 la selección y caracterización de locks, el alcance exacto de la sección crítica de snapshots, la liberación incierta, timeout/stale y pruebas de concurrencia; D1 debe dejar definidas las responsabilidades y el contrato de no-deadlock.
6. Para cierre de D1, cualquier arista desconocida que afecte la afirmación de separación permanece bloqueante; no se acepta globalmente como riesgo para poder cerrar.

## 5. Estado canónico

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Este artefacto es una relectura documental de fuentes. No demuestra comportamiento de ejecución ni cobertura completa.
