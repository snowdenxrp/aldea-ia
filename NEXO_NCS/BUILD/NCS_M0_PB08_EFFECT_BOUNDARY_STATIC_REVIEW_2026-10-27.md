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
