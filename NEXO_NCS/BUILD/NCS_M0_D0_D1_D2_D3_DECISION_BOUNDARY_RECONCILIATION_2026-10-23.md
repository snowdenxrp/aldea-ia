# NCS M0 — reconciliación de límites de decisión D0/D1/D2/D3

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **REVISIÓN DOCUMENTAL; PROPUESTAS NO ELEVADAS A DECISIONES; SIN IMPLEMENTACIÓN**

## 1. Hallazgo de consistencia

Los documentos existentes usan expresiones que pueden confundirse si se leen sin distinguir niveles:

- `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` indica que “Opción A” fue aceptada como **dirección de diseño**, y explícitamente aclara que eso no autoriza editar runtime ni prueba que la raíz exista o funcione.
- `NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md` conserva D0-C1…C4, D1-S0/C1…C3, D2-C1…C4 y D3-C1…C2 como decisiones pendientes y propuestas, no aprobadas.
- El ledger D1 y la nueva brecha del test arquitectónico confirman que la matriz de callers y el test de no-bypass no están cerrados ni implementados.

No hay contradicción técnica necesaria: aceptar una dirección arquitectónica de raíz de instancia no significa aprobar cada detalle de interfaz, lock, migración o ejecución. Sí existe un riesgo documental de que alguien interprete “Opción A aceptada” como luz verde de implementación. Esta nota fija la separación para continuidad; no cambia decisiones del propietario.

## 2. Cuatro niveles que no deben colapsarse

| Nivel | Qué incluye | Estado |
|---|---|---|
| L0 — dirección arquitectónica | Una raíz de instancia única para derivar rutas de Continuity/Chronicle y coordinar operaciones cooperantes; separada de autoridad constitucional. | Aceptada como dirección, según el contrato de raíz existente. |
| L1 — contrato detallado | Precedencia CLI/API/env, raíz existente/bootstrap, symlinks/aliases, legacy paths, scope de queries, semántica child process, lock y resultados de release incierto, migración y rollback. | OPEN; recomendaciones no equivalen a aprobación. |
| L2 — cierre de diseño verificable | Ledger completo de callers, clasificación transitiva, reglas UNKNOWN/BLOCKED, fixtures, matriz de pruebas y límites de garantía. | OPEN; el análisis del grafo y la especificación mejoraron, pero no prueban completitud ni se ejecutaron. |
| L3 — implementación y evidencia | Runtime/API, tests, workflows, pruebas cross-process y CI sobre SHA exacto. | No autorizado por los documentos de diseño; sin cambios ni ejecución en esta revisión. |

## 3. Recomendaciones técnicas para preparar la decisión (no aprobadas)

### D0 — configuración
- Una única raíz explícita por operación.
- Rechazar combinaciones mixtas de raíz y rutas independientes; sin fallback silencioso.
- Raíz debe existir y ser directorio para operaciones normales. Bootstrap/migración separados y explícitos.
- Definir política real de canonicalización/symlinks antes de afirmar que dos rutas comparten lock.
- Validación de configuración sin I/O de stores ni escrituras.

### D1 — callers y APIs
- Separar `D1-DESIGN` de `D1-IMPLEMENTATION`; mantener D1 OPEN hasta que el diseño y sus criterios de aceptación estén congelados.
- Un test de AST/grafo futuro debe partir de entrypoints observables en package.json, workflows, guards CLI y child-process sites; clasificar cada ruta; unresolved/dynamic/computed edges no demostrados = UNKNOWN/BLOCKED.
- Mantener las factories low-level y sus tests de store, pero impedir que producción las use por una ruta paralela fuera de la frontera de instancia.
- Excluir assistants/simulate de la instancia ordinaria hasta definir la semántica multi-store; no atribuir atomicidad al lock raíz.

### D2 — admisión
- La garantía buscada debe decir con precisión si cubre toda operación que materializa snapshots o solo escrituras. La recomendación vigente es cubrir todas las operaciones que leen/materializan snapshots canónicos.
- Mantener intactos los locks per-store en la primera implementación; no unificarlos mecánicamente.
- Orden propuesto: raíz → store. Una sola frontera adquiere la raíz; los helpers reciben contexto y no reentran.
- En el CLI actual, si Chronicle sigue siendo proceso hijo directo, el hijo valida la raíz y es dueño de su propia admisión; el padre no conserva el mismo lock mientras espera.
- Timeout, propiedad incierta o release no confirmado: resultado bloqueado/UNKNOWN; nunca retry de negocio ni éxito limpio automático.
- Ningún mecanismo de admisión confiere autoridad, habilita repair/dispatch ni convierte una validación semántica en legitimidad.

### D3 — migración y rollback
- Dry-run con inventario de fuente/destino y hashes; copia/verificación; cutover explícito; rollback reproducible.
- Sin merge heurístico, dual-write ni borrado del origen en el mismo paso de cutover.
- Tratar heap agregado y cuota total de disco como garantías independientes: la admisión no las crea.

## 4. Puertas de dependencia

Orden recomendado para que una decisión no dependa de un contrato inestable:

1. **D0**: fijar raíz, precedencia, bootstrap y alias/symlinks.
2. **D1-DESIGN**: congelar manifiesto y clasificación de entrypoints/callers; fijar UNKNOWN/BLOCKED y fixtures.
3. **D2**: fijar scope de admisión, orden de locks, timeout, release incierto y dueño del lock entre procesos.
4. **D3**: fijar transición de rutas legacy, dry-run, cutover y rollback.
5. **Revisión de coherencia**: verificar que los cuatro contratos se corresponden y que ninguno promete más de lo que otro implementará.
6. **Decisión explícita de implementación**: solo después, y como autorización separada, modificar runtime/tests/workflows en una unidad coherente.
7. **Prueba de aceptación**: ejecutar pruebas locales/cross-process y CI en SHA exacto de implementación+tests; guardar trigger, run, job, SHA, logs y resultado.

Este orden es una recomendación de ingeniería, no un cierre automático de gates ni una aceptación en nombre del propietario.

## 5. Invariantes que sobreviven a todos los niveles

- La raíz es localizador de persistencia, no identidad ni autoridad.
- La adquisición del lock es coordinación entre procesos cooperantes, no sandbox ni autorización constitucional.
- Un error desconocido, un import no resuelto, una ruta sin clasificación o un estado de release incierto no es PASS.
- No se reabre el runtime de reparación/dispatch; permanece excluido por el gate M0 existente.
- No se afirma límite duro de heap/disco a partir de límites por documento ni de un lock.
- No se declaran implementaciones ni pruebas que no se hayan realizado.

## 6. Estado al cierre de esta revisión

- Dirección de raíz de instancia: aceptada como dirección de diseño (según documento existente).
- Detalles D0/D1/D2/D3: OPEN.
- Test arquitectónico D1: especificado parcialmente, no implementado ni ejecutado.
- Runtime/tests/workflows: sin cambios en esta revisión.
- Tests/CI: no ejecutados en esta revisión.
- M0: INCOMPLETO.
- Autorización: NOT_EVALUATED.
- Raíz legítima: PENDING/UNKNOWN.
- Efectos protegidos: STOP.
