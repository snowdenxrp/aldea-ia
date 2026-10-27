# NCS M0 — revisión estática focalizada PB-08: EffectBoundary en protected transition

Fecha: 2026-10-27  
Rama examinada: `ncs-clean-architecture`  
Tipo: **hecho estático limitado — sin ejecución — sin cambio de código**

## 1. Pregunta

¿La ruta genérica `executeProtectedTransition` consume `effectBoundary.prepare` antes de ejecutar `conditionalCommit.commit`, de modo que la frontera de efectos quede aplicada por esta transición?

## 2. Evidencia fuente exacta

### `src/nexo/core/ownership.mjs`

- Blob SHA: `3b66d07e67df09b058b37716716573f6c17a2099`.
- `createCorePorts` expone `effectBoundary.prepare`; si no se inyecta una implementación, la función predeterminada lanza `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED: effectBoundary.prepare`.
- Esto demuestra que el puerto está definido en la construcción del core. No demuestra que una ruta de producción lo inyecte ni lo invoque.

Fuente: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/ownership.mjs

### `src/nexo/core/protected-transition.mjs`

- Blob SHA: `39a602b80cda8f3939b2ffed7e726d06c21b077f`.
- En `executeProtectedTransition`, el gate de autoridad se consume en L98; el candidato se ejecuta en L153; la transición llega a `ports.conditionalCommit.commit(candidate)` en L194.
- La función completa examinada no contiene una invocación a `ports.effectBoundary.prepare` entre el gate de autoridad y el commit, ni en otro punto de esa función.

Fuente con líneas: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/protected-transition.mjs#L79-L205

### Tests existentes, solo lectura estática

- `tests/nexo/protected-transition.test.mjs`, blob SHA `65353fe9e20898fb13f225ee004240b6c54687f1`, contiene casos de autoridad STOP/UNKNOWN, aislamiento, validación y commit condicional.
- La porción inspeccionada no demuestra un caso que requiera `effectBoundary.prepare` antes del commit. No se ejecutaron tests y no se afirma que ningún otro test del repositorio cubra una propiedad relacionada.

Fuente: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/protected-transition.test.mjs

## 3. Clasificación del hallazgo

- **Hecho observado:** el puerto `effectBoundary.prepare` está expuesto por `createCorePorts`, con fallback `NOT_IMPLEMENTED`; la implementación de `executeProtectedTransition` inspeccionada no llama ese puerto antes de `conditionalCommit.commit`.
- **Inferencia limitada:** esta transición genérica no aplica por sí misma `effectBoundary.prepare` como precondición previa al commit.
- **No demostrado:** que este commit genérico sea en sí mismo un efecto externo protegido; que toda ruta de producción use esta función; que no exista una frontera distinta en otra capa; que el comportamiento esté alcanzable desde un entrypoint operativo.
- **No afirmado:** vulnerabilidad explotable, bypass universal, comportamiento de producción o fallo dinámico.

## 4. Efecto sobre la matriz PB-08

PB-08 permanece **OPEN / UNKNOWN**. El resultado impide declarar que la frontera esté demostrada por esta transición. No autoriza añadir una llamada, cambiar orden, modificar tests ni diseñar una nueva autoridad. Antes de cualquier implementación debe reconciliarse el contrato STEP 3 con el alcance real de esta transición y con las rutas de producción que la consuman.

## 5. Próximo paso documental

Seguir solo la relación de callers de `executeProtectedTransition` dentro del árbol de NCS y contrastarla con el contrato STEP 3/EffectBoundary ya existente. Registrar cada caller confirmado con SHA y límites de cobertura. No repetir el censo general de 188 archivos ni ampliar a una auditoría de todos los efectos.

## 6. Estado canónico y ejecución

M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; primera creación y efectos protegidos `STOP`.

No se modificaron runtime, tests, workflows, configuración ejecutable ni dispositivo. No se ejecutaron tests/CI/Actions.


## 7. Seguimiento de callers — revisión acotada (2026-10-27)

Se hizo una lectura estática acotada de seis módulos de integración/consumo en el HEAD observado de la rama (`b79898ca1e3f36f6096069a197fe5234e29c2d39`). En el texto de esos seis archivos no aparece una referencia literal a `executeProtectedTransition`, `protected-transition` ni `effectBoundary.prepare`:

| Archivo | Blob SHA |
|---|---|
| `src/nexo/core/owner-backed-runtime.mjs` | `a7a014489209273ce78d0103afa785728d4c467c` |
| `src/nexo/application/index.mjs` | `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3` |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` |
| `src/nexo/application/continuity-queries.mjs` | `e1915e94e53e71d37a37952fead37ba62bdae79a` |
| `src/nexo/core/continuity-operations.mjs` | `cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5` |
| `src/nexo/core/continuity-service.mjs` | `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c` |

Esto es **evidencia negativa limitada a los seis archivos enumerados**, no un barrido completo del árbol ni prueba de que no haya callers indirectos, importación dinámica, uso desde otros módulos o integración externa. El test `tests/nexo/protected-transition.test.mjs` sí importa directamente la transición, pero eso demuestra uso de prueba, no integración de producción.

### Interpretación actualizada

- Hecho: la transición no consume `effectBoundary.prepare` antes del commit en su propio cuerpo; los seis módulos seleccionados tampoco la referencian textualmente.
- Inferencia limitada: la integración de esta transición con los módulos de runtime/consumo inspeccionados no queda demostrada por esos archivos.
- UNKNOWN: callers en otros módulos, alcance de producción, uso indirecto/dinámico y si otra frontera protege los efectos externos.
- Decisión: PB-08 permanece OPEN/UNKNOWN; no hay base para declarar la frontera demostrada ni para afirmar un bypass universal.

No se modificó runtime/tests/workflows y no se ejecutaron pruebas/CI.


## 8. Reconciliación contractual — límite de la conclusión (2026-10-27)

Se contrastó el hallazgo estático con los contratos históricos de STEP 3B y STEP 3C, que ya están en el repositorio y no requieren reabrir investigaciones anteriores.

### Evidencia documental

- `NEXO_NCS/BUILD/STEP_3B_PROTECTED_TRANSITION_2026-10-08.md`, blob `591e4c52a1e29f919700ab40d6142ce3c9dfd5dc`: define la composición como validación semántica final seguida de commit condicional y outcome; su límite de seguridad dice expresamente que no implementa efectos externos irreversibles.
- `NEXO_NCS/BUILD/STEP_3C_INTEGRATION_GATE_2026-10-08.md`, blob `6428f74dc9886eb81006b92231409668d33b8182`: exige que la transición sea asíncrona en la frontera real de persistencia y que solo `ConditionalCommit` invoque la persistencia canónica.
- `NEXO_NCS/PROOF/STEP_3C_RUNTIME_VERIFICATION_2026-10-08.md`, blob `249d52cfa7d3a50b0e84e2e24b6142368c34f2a8`: registra una ejecución histórica PASS en commit `de859aa0b466c9aaa7818ee2c15e3f2261868cf3`, run `37740178286`, job `113188835156`. Ese resultado prueba solo la frontera local de persistencia en aquel commit; no es prueba de CI para el HEAD actual ni de efectos externos.
- La definición actual de `createCorePorts` (blob `3b66d07e67df09b058b37716716573f6c17a2099`) expone `effectBoundary.prepare` como puerto separado con fallback `NOT_IMPLEMENTED`; por sí sola no especifica en qué operación debe consumirse.

### Corrección de alcance

La ausencia de una llamada a `effectBoundary.prepare` dentro de `executeProtectedTransition` es un hecho estático. **No basta para clasificarla como defecto**: STEP 3B/3C describe esta transición como frontera de commit de estado y declara fuera de alcance la implementación de efectos externos. Para afirmar que esa transición debe consumir el puerto EffectBoundary hace falta un contrato aceptado que vincule ambos, o una ruta concreta de efectos que requiera ese enforcement.

Por tanto, este informe NO afirma que el cuerpo de `executeProtectedTransition` deba invocar `effectBoundary.prepare`, que exista un bypass de efectos, ni que se deba añadir esa llamada. La pregunta correcta pendiente es más acotada: ¿qué ruta concreta de NCS prepara/ejecuta un efecto externo y qué contrato aceptado exige que esa ruta consuma la frontera? Si no se encuentra una ruta y contrato concretos, el resultado permanece UNKNOWN; no se inventa integración.

### Estado actualizado

- PB-08: OPEN/UNKNOWN.
- Hecho estático: puerto EffectBoundary separado; no consumido por la transición genérica.
- No demostrado: obligación contractual de consumirlo allí, caller operativo, alcance de producción o bypass.
- Siguiente paso: trazar únicamente el registro/uso de capacidades de efecto (comenzando por `createNexoChronicleEffectContracts`) hacia su caller real, y verificar si existe una precondición de frontera aceptada. No cambiar código ni repetir auditorías históricas.

No se ejecutaron tests/CI/Actions ni se modificó runtime.


## 9. Ruta concreta de efecto encontrada — Chronicle append (2026-10-27)

La lectura posterior sí encontró una ruta de aplicación concreta para el efecto Chronicle. Esto reemplaza la hipótesis anterior de que el análisis debía seguir buscando un caller directo de `executeProtectedTransition`: la ruta real examinada usa otra composición.

### Grafo estático observado

1. `src/nexo/application/chronicle-append.mjs` importa `createNexoChronicleEffectContracts`, `createEffectAdapter` y `executeNexoStepWithContinuityOwner` (blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`).
2. En las líneas 280–401, preflight de ambos stores precede a cualquier inicialización; se crea el contrato Chronicle, se abre el owner de Continuity con `effectVerifiers`, se registra la misión si falta y luego se construye un adapter con `contracts.handlers` y `contracts.verifiers`. Finalmente se llama `executeNexoStepWithContinuityOwner`.
3. `src/nexo/core/owner-backed-runtime.mjs` (blob `a7a014489209273ce78d0103afa785728d4c467c`) acepta solo `chronicle_append` como acción no-repair demostrada en este runtime; comprueba capacidad de handler/reconciliación, estado de misión y dependencias; confirma `recordPrepared` antes de llamar `adapter.executePrepared`; después registra linaje y reconcilia, sin autorizar redispatch cuando el resultado es incierto.
4. `src/nexo/adapters/chronicle-effect.mjs` (blob `6daf742eb0048724557151a728bf807613a854e9`) provee handler, verifier y postcondition del append local de Chronicle.

### Relación con EffectBoundary

En los tres módulos de la ruta indicada no aparece una llamada a `createCorePorts` ni a `effectBoundary.prepare`. Esto es un hecho estático de esos módulos, no prueba de que no exista una frontera externa en otra capa.

La ruta demuestra que hay un **efecto de persistencia Chronicle** y una composición PREPARED → dispatch → lineage → reconciliation. No demuestra por sí sola que el puerto `effectBoundary.prepare` sea el mecanismo contractual requerido para ese append: el contrato de STEP 3B/3C se refiere a commit condicional del estado del Core y excluye explícitamente efectos externos. La clasificación de Chronicle append como “efecto protegido” sujeto a ese puerto debe derivarse de un contrato aceptado, no del nombre del puerto ni de una analogía.

### Estado de la pregunta y próximo paso

- Caller operativo dentro del código de aplicación: **identificado estáticamente** para Chronicle append.
- Integración de esa ruta con el puerto `effectBoundary.prepare`: **no observada en los módulos citados**.
- Obligación contractual de que Chronicle append consuma ese puerto: **UNKNOWN**.
- Bypass explotable o incumplimiento de contrato: **no demostrado**.
- Próximo paso documental: localizar el contrato vigente que clasifica el append Chronicle y define el punto de enforcement para efectos persistentes/protegidos. Si no existe o no es aceptado, registrar la brecha de contrato y no modificar runtime por inferencia.

No se ejecutaron tests/CI/Actions; no se modificó runtime.
