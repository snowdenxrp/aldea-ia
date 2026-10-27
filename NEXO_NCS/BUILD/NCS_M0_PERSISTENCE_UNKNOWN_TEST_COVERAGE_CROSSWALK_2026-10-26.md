# NCS M0 — Mapa de cobertura existente frente a R1–R4

**Fecha:** 2026-10-26  
**Tipo:** revisión documental de cobertura estática; no se ejecutaron pruebas en este avance.  
**Rama:** `ncs-clean-architecture`.  
**Propósito:** evitar duplicar pruebas ya existentes y aislar las brechas de integración para persistencia y `UNKNOWN`.

## Archivos inspeccionados

- `tests/nexo/conditional-commit-persist-state.test.mjs` — blob `6170e52f6f04e74126b49afad2ccf39b187b45c9`.
- `tests/nexo/simulation-restart-persistence.test.mjs` — blob `b747ff5df8c91121cbd3f6e2b5c74d4efe5e91f9`.
- `tests/nexo/protected-transition.test.mjs` — blob `65353fe9e20898fb13f225ee004240b6c54687f1`.
- `src/nexo/adapters/conditional-commit-persist-state.mjs` — blob `d6dc517f9c7841a957749804d612fbfe6e66c9a6`.
- `scripts/simulate.mjs` — blob `1b5e39b681486f583c1779770c52dd913227dfa1`.

Estos son SHA de contenido de archivo, no SHA de commit. El HEAD del repositorio no se volvió a consultar de forma independiente durante esta revisión; usar el SHA de referencia de la revisión anterior con esa salvedad.

## Cobertura que SÍ existe

### T1 — Estado estricto (loader aislado)

`simulation-restart-persistence.test.mjs` importa `loadStateStrict` y comprueba:

- estado ausente → `NEXO_STATE_NOT_FOUND`;
- JSON inválido → `NEXO_STATE_INVALID_JSON`;
- revisión ausente → `NEXO_STATE_REVISION_UNKNOWN`;
- esquema inválido → `NEXO_STATE_SCHEMA_INVALID`.

Esto prueba el contrato del loader estricto, no prueba que el adaptador condicional lo utilice. No declarar R1 cerrado.

### T2 — Commit condicional real en ruta feliz

`conditional-commit-persist-state.test.mjs` construye `createPersistStateConditionalCommit({ persistState, statePath, clock })`, integra el adaptador con `executeProtectedTransition` y comprueba `SAFE_COMMIT`, revisión incrementada y conflicto de revisión obsoleta.

Esto sí cubre la ruta feliz y un conflicto del adaptador con archivo real. No prueba un archivo corrupto a través del adaptador ni un error después de que el destino haya cambiado.

### T3 — Errores de persistencia clasificados como UNKNOWN

El test de adaptador inyecta una función `persistState` que lanza un error con `code: EIO` y verifica `COMMIT.UNKNOWN` + `errorCode: EIO`; también lanza `{}` y verifica `PERSISTENCE_UNKNOWN`.

Son stubs de fallo, no una prueba del resultado de disco después de una mutación parcial. No cubren el getter hostil `error.code`.

### T4 — Errores de escritura y rename antes del reemplazo

`simulation-restart-persistence.test.mjs` inyecta un fallo de `writeFile` y un fallo de `rename`; comprueba que la revisión y `savedAt` del destino quedan intactos y que no quedan archivos temporales en el caso probado.

No simula una operación que complete el reemplazo y luego lance un error. No demuestra F2/F3.

### T5 — Transición aislada ante UNKNOWN

`protected-transition.test.mjs` comprueba que una excepción del commit y un resultado `COMMIT.UNKNOWN` llevan a `RECONCILE_REQUIRED`. Comprueba también varias entradas malformadas/getters hostiles en contratos de transición.

No cubre un getter hostil en el objeto de error leído por el adaptador, ni acredita que `executeProtectedTransition` sea el consumidor del runtime real.

## Brechas concretas que siguen abiertas

| ID | Brecha | Prueba mínima faltante | Resultado que debe observarse |
|---|---|---|---|
| G1 | Adaptador + archivo corrupto | Crear archivo con bytes conocidos e invocar el adaptador real con el `persistState` canónico | No convertir el archivo inválido en revisión cero; bytes originales preservados |
| G2 | Estado ausente vs estado corrupto | Separar explícitamente ambos casos usando la ruta condicional real | Códigos/resultados distintos conforme al contrato ratificado |
| G3 | Getter hostil en `error.code` | `persistState` stub lanza objeto con getter `code` que lanza | El adaptador no deja escapar la excepción del getter; retorna incertidumbre estable |
| G4 | Error después del reemplazo | Inyectar una primitiva que realice el reemplazo y después lance | Resultado `UNKNOWN`; inspección del archivo reconoce si el nuevo estado está visible sin afirmar durabilidad |
| G5 | Consumidor integrado | Conectar el flujo real que deba consumir el outcome y comprobar bloqueo/no redispatch | La incertidumbre no se transforma en éxito ni autoriza dispatch duplicado |
| G6 | Contrato de `persisted` | Revisar todos los productores/consumidores del campo antes de cambiarlo | Ningún `false` implica ausencia de mutación si eso no fue demostrado |
| G7 | Durabilidad F2/F3 | Decisión de alcance y protocolo específico de plataforma, seguido de prueba correspondiente | Ninguna afirmación de durabilidad más fuerte que la evidencia |

## Precisión sobre el diseño

El adaptador actualmente llama a `persistState(statePath, candidate.state, clock(), { expectedRevision, stateRevision })`. No pasa `loadCurrentState` explícitamente. La primitiva canónica debe inspeccionarse junto con sus defaults antes de concluir qué cargador termina usando en todos los casos. La mera existencia de `loadStateStrict` no demuestra que el adaptador lo invoque.

La corrección de R1 no debe introducir una sustitución global e indiscriminada de `loadState`: el loader tolerante puede seguir teniendo una función legítima en la simulación. La aceptación se aplica a la lectura autoritativa utilizada por el commit condicional.

## Orden de ejecución recomendado

1. Diseñar primero G1/G2 con pruebas de archivo real y definir el resultado contractual para archivo ausente frente a archivo corrupto.
2. Añadir G3 para blindar la clasificación de errores.
3. Añadir G4 para diferenciar fallo previo al reemplazo de incertidumbre posterior al reemplazo.
4. Resolver el consumidor y la semántica de `persisted` antes de G5/G6.
5. Mantener F2/F3 fuera de cualquier afirmación de aceptación hasta que el owner ratifique el alcance y exista evidencia por plataforma.

## No realizado en este documento

- No se ejecutaron tests ni CI.
- No se modificó runtime, tests, workflows o configuración.
- No se creó un consumidor para `executeProtectedTransition`.
- No se cierra M0 ni se cambia el estado canónico.
