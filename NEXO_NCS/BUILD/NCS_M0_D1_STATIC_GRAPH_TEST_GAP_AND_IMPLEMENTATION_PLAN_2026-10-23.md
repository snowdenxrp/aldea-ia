# NCS M0 — brecha del test de grafo estático D1 y plan de implementación

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **ANÁLISIS DE DISEÑO; NO IMPLEMENTADO; NO EJECUTADO**

## 1. Por qué existe este documento

El ledger D1 ya define qué debe aceptar el test arquitectónico. Esta nota concreta la diferencia entre la protección que ya existe y la garantía que todavía falta, para evitar llamar «test de no-bypass» a una comprobación más estrecha.

Fuentes exactas revisadas en esta rama:
- `tests/nexo/entrypoint.test.mjs`, blob `ff1bd2e9d292e21e00049b354249aee684837bbc`.
- `package.json`, blob `e45dc6d215db53ea2758009cd501f565634e3610`.
- `.github/workflows/nexo-m0-chronicle.yml`, blob `65b2bc04a015f5bd1fe010e3f3eec6e0481514e7`.
- `.github/workflows/nexo-mission-admission-continuity.yml`, blob `03f2a0cb8268e442ce4db434383b0f4854073d82`.
- `NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md`, blob `383adfa2d3230233bb2add71a4b4b1b3fec7ac68`.

## 2. Protección ya existente — alcance real

`tests/nexo/entrypoint.test.mjs` recorre imports y reexports estáticos con una expresión regular sobre `import/export ... from` y sigue specifiers relativos. También comprueba que el grafo de las dos CLIs Nexo no importe ciertos módulos de Lúmina/runtime legado, y verifica contratos de argumentos y respuestas de CLI.

Esto es valioso y debe conservarse. Sin embargo, **no es todavía el test D1 de cierre de callers**:
- no establece un manifiesto único de todos los entrypoints productivos desde npm, workflows y guards ejecutables;
- la extracción léxica actual no demuestra cobertura de `import()`, `require()`, loaders calculados ni aliases/reexports ambiguos;
- no clasifica cada ruta de acceso a factories/owners como `PRODUCTION_ADMITTED`, `INTERNAL_ONLY`, `TEST_ONLY` o `EXPLICIT_EXCEPTION`;
- no exige que cada acceso a stores o snapshot-loading esté detrás de una admisión de instancia;
- no comprueba de forma general los argumentos que cruzan `spawn`/`spawnSync` ni la invocación directa del proceso hijo contra el nuevo contrato `--root`;
- una ruta de import que no se resuelva o una arista que no pueda analizarse no se convierte automáticamente en `UNKNOWN/BLOCKED`.

Por tanto, el test actual prueba algunas invariantes de arquitectura y aislamiento, pero no puede cerrar D1 ni certificar ausencia de bypasses.

## 3. Algoritmo propuesto para el test D1

### 3.1 Manifiesto de entrada reproducible

Construir la lista de entrypoints desde:
1. scripts productivos declarados en `package.json`;
2. archivos `scripts/nexo*.mjs` con guard de ejecución directa;
3. comandos ejecutados por workflows de CI;
4. destinos de procesos hijos, incluidos `spawn`, `spawnSync`, `execFile` y wrappers locales demostrados.

Cada entrada debe tener clasificación explícita y motivo. Una nueva entrada no clasificada debe hacer fallar el test; no heredar clasificación por similitud de nombre.

### 3.2 Grafo de módulos

- Resolver imports estáticos, reexports nombrados y `export *` transitivamente.
- Resolver extensiones y rutas relativas con reglas explícitas; no aceptar silenciosamente un destino inexistente.
- Inspeccionar `import()`, `require()` y mecanismos de carga indirecta. Si el destino no es una cadena literal resoluble o depende de datos en runtime, marcar la arista `UNKNOWN/BLOCKED` y fallar en el grafo productivo.
- No tratar comentarios o cadenas que mencionan `import` como dependencias reales; preferir parser de JavaScript con AST sobre regex para la implementación final.
- No excluir módulos porque estén fuera de `src/nexo/`: los callers pueden llegar por scripts, reexports y adapters.
- Mantener separada la inspección de código de producción de la de `tests/**`; imports directos de stores dentro de tests no autorizan esos imports en producción.

### 3.3 Accesos sensibles y rutas de efecto

Registrar callsites de:
- `createNexoContinuityStore`, `createNexoChronicleStore`, `openNexoContinuityOwner`;
- `loadCurrent`, `initialize`, `conditionalCommit`, append de Chronicle y migración legacy;
- argumentos `--continuity`, `--chronicle`, `--root` y lectura de configuración de entorno;
- llamadas de proceso y sus argumentos/destinos;
- dispatch/repair/effect adapters, solo para comprobar que la admisión de raíz no les concede autorización.

El test debe clasificar la **ruta de ejecución**, no limitarse a buscar identificadores. Un wrapper que crea un store sigue siendo un punto de acceso aunque el caller no mencione el nombre de la factory.

### 3.4 Invariantes obligatorias

El test falla cuando:
- existe entrypoint de producción no clasificado;
- un caller productivo alcanza una factory/owner path-based sin frontera de instancia admitida;
- un import/reexport/llamada de proceso no se resuelve;
- una carga dinámica/computada puede alcanzar persistencia y no se puede demostrar su destino;
- el hijo Chronicle puede operar sin raíz explícita y admisión propia;
- se combinan `--root` y rutas legacy contradictorias o se aceptan rutas legacy en modo instancia;
- `assistants` o `simulate` abren/migran Continuity de manera incidental, mientras sigan excluidos por decisión de diseño;
- una prueba/fixture es importada por un entrypoint productivo;
- el test intenta ejecutar repair, dispatch, efectos externos o transiciones protegidas.

## 4. Fixtures negativos requeridos

Cada fixture debe demostrar que el test rechaza, no solo que una búsqueda encuentra un texto:
1. import directo de una factory path-based desde una nueva CLI;
2. reexport indirecto hacia una factory;
3. import dinámico literal y dinámico calculado;
4. módulo importado inexistente;
5. ciclo de imports válido sin bucle del analizador;
6. child process que omite `--root`;
7. mezcla/conflicto de `--root` con `--continuity`/`--chronicle`;
8. caller nuevo de `package.json` sin clasificación;
9. wrapper que abre el store sin mencionar la factory en el entrypoint;
10. ruta que llega a repair/dispatch y no debe ganar permiso por adquirir la raíz.

Las fixtures deben ser datos fuente aislados o módulos temporales; no deben escribir en los almacenes reales del proyecto ni invocar efectos.

## 5. Integración de test y CI — condición futura

Cuando D1-DESIGN y los contratos D0/D2/D3 estén cerrados y exista autorización explícita de implementación:
- añadir el test al comando `npm test` de forma explícita, porque ese comando es una cadena enumerada, no un glob;
- incluir su ruta y las rutas de módulos del contrato en los `paths` del workflow correspondiente;
- añadir ejecución del test en el workflow de Chronicle y, si cubre la API de Continuity/instancia compartida, en el workflow de Continuity;
- verificar el SHA exacto combinado de código+test y conservar los logs/jobs;
- ejecutar también fixtures negativos y comprobar que fallan por el código esperado, no por error de entorno.

Los workflows actuales no prueban admisión de raíz: el de Chronicle ejecuta store, runtime Chronicle y `entrypoint.test.mjs`; el de Continuity ejecuta suites seleccionadas de stores/runtime/migración. No modificar workflows ahora.

## 6. Decisión de secuencia pendiente

La matriz D0/D2/D3 plantea separar `D1-DESIGN` (inventario, clasificación, algoritmo y fixtures especificados) de `D1-IMPLEMENTATION` (test codificado y ejecutado después del cierre del contrato). Esta nota amplía el diseño, pero no atribuye al propietario una decisión que todavía no consta.

No se debe escribir ni ejecutar el test de cierre hasta resolver esa secuencia y congelar las decisiones de raíz, alcance de admisión, child process, locks y migración. Tampoco se debe usar la ausencia de ejecución como excusa para declarar D1 cerrado.

## 7. Estado y límites

- D1: **OPEN**. Test de cierre no implementado ni ejecutado.
- D0/D2/D3: **OPEN**.
- Runtime, tests y workflows: **sin cambios en esta revisión**.
- Tests/CI: **no ejecutados en esta revisión**.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

La futura prueba será una barrera arquitectónica estática y de fixtures, no una prueba formal de seguridad, de autoridad constitucional ni de ausencia de toda ejecución indirecta posible.


## Actualización de secuencia y política D0 (2026-10-24)

El propietario aceptó D1-S0: separar D1-DESIGN de D1-IMPLEMENTATION. También aceptó D0-C1…D0-C4 como contrato de diseño para M0. Las menciones anteriores a estas decisiones como “pendientes de aprobación” se conservan como registro histórico, pero ya no describen el estado vigente.

La revisión actual sigue sin acreditar una prueba de grafo completa. El test actual de `entrypoint.test.mjs` es una guarda parcial basada en regex para imports/reexports estáticos; no demuestra el manifiesto completo de entrypoints, cargas dinámicas/calculadas, rutas path-based a factories/owners, ni aristas de proceso. La aceptación D0 proporciona política para definir el manifiesto y sus reglas, no evidencia de que se hayan aplicado.

Siguiente cierre documental D1-DESIGN: producir un manifiesto reproducible con procedencia por entrada (package scripts, workflow commands, direct-execution guards y child-process targets), clasificar cada entrada y acceso sensible, documentar resolución de cada arista y dejar `UNKNOWN/BLOCKED` donde el destino no se resuelva. Revisar el artefacto contra la política D0 aceptada y el snapshot exacto. No codificar ni ejecutar el test arquitectónico hasta el gate separado de implementación.

Estado: D1-DESIGN `OPEN`; D1-IMPLEMENTATION no autorizada; sin cambios runtime/tests/workflows; CI no ejecutado. M0 `INCOMPLETO`; D0/D1/D2/D3 siguen abiertos como gates de evidencia/diseño; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
