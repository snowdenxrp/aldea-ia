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
