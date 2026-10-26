# NCS M0 — Revisión de resultado de commit y reconciliación (2026-10-26)

## Alcance y límites

Revisión estática de solo lectura en `ncs-clean-architecture` de:
- `scripts/simulate.mjs`
- `src/nexo/adapters/conditional-commit-persist-state.mjs`
- `src/nexo/core/protected-transition.mjs`
- `src/nexo/core/ownership.mjs`
- `tests/nexo/conditional-commit-persist-state.test.mjs`

No se ejecutaron tests ni CI. No se modificaron runtime, tests, workflows ni dispositivo. Este documento no selecciona el contrato de rutas ni autoriza implementación.

## Hallazgos observables

### 1. La frontera string/URL llega hasta operaciones de archivo

- `createPersistStateConditionalCommit()` rechaza `statePath` salvo que sea una cadena no vacía.
- `persistState()` usa `statePath.pathname` para derivar lock, prefijo temporal, directorio y nombre base.
- El flujo principal declara `STATE_PATH` como `new URL(...)`, y llama `persistState(STATE_PATH, ...)`.
- Por tanto, al menos el caller principal y el contrato del adaptador no comparten un tipo uniforme de ruta. Para una cadena, `.pathname` es indefinido; para una URL, `.pathname` no equivale necesariamente a una ruta nativa decodificada.
- Esto es un defecto estático independiente; no prueba por sí solo la excepción primaria exacta del run CI `40270739196`.

### 2. La clasificación de commit pierde detalle útil para diagnóstico

- El adaptador captura errores de persistencia: preserva `STATE_REVISION_CONFLICT` como conflicto condicional y transforma otros errores en `COMMIT.UNKNOWN`, conservando solo `errorCode` (o `PERSISTENCE_UNKNOWN`).
- `executeProtectedTransition()` convierte `COMMIT.UNKNOWN` en `RECONCILE_REQUIRED` con la razón genérica `conditional commit outcome is UNKNOWN`; no incluye el `errorCode` del resultado del adaptador.
- Si `conditionalCommit.commit()` lanza directamente, la transición conserva `error.code` en la razón cuando existe, pero no la causa completa. Esto es una diferencia observable entre “el adaptador devolvió UNKNOWN” y “el puerto lanzó”.
- La pérdida de detalle dificulta distinguir fallos de ruta, escritura, rename, cleanup y resultados realmente inciertos sin inspeccionar logs externos. No se recomienda incluir mensajes arbitrarios o rutas sensibles en salidas públicas; definir un diagnóstico estructurado y acotado requiere decisión de diseño.

### 3. La limpieza temporal tiene alcance amplio y errores silenciados

- Antes de escribir, `persistState()` enumera el directorio calculado y elimina todos los nombres cuyo prefijo coincide con el temporal derivado del destino.
- El bloque completo de enumeración y eliminación captura y descarta cualquier error.
- En el bloque de escritura/rename, el error primario se relanza, pero el intento de borrar el temporal también silencia su propio error.
- `finally` ejecuta `releaseLock()`; si la liberación falla, puede propagarse desde el `finally` y ocultar un error anterior. Esta interacción debe verificarse mediante pruebas dirigidas, no darse por ocurrida.
- La revisión estática no demuestra si existen writers concurrentes que compartan ese prefijo ni que el lock sea correcto; dado el uso de `.pathname`, la validez de la exclusión mutua depende primero de resolver el contrato de ruta.

### 4. El core ya conserva una clasificación segura, pero no suficiente observabilidad

- El resultado de commit solo se considera `SAFE_COMMIT` cuando el puerto devuelve `COMMITTED`.
- Conflicto de revisión produce `STALE_CANDIDATE`; resultado `UNKNOWN`, forma inválida o excepción producen `RECONCILE_REQUIRED`.
- Este comportamiento evita promover un commit incierto a éxito. No equivale a reconciliar el estado persistido: el puerto `reconciliation.reconcile` existe, pero `executeProtectedTransition()` no lo invoca en el tramo inspeccionado.
- El puerto `effectBoundary.prepare` también existe en `createCorePorts()`, pero no es invocado por `executeProtectedTransition()` en el archivo inspeccionado. Esto es consistente con que la ruta de efectos protegidos siga sin demostrarse; no debe reinterpretarse como autorización de efectos.

## Criterios candidatos de aceptación (no ejecutados)

1. Para cada tipo de entrada admitido, normalizar la ruta una sola vez antes de lock, lectura de revisión, limpieza, escritura, rename y liberación.
2. Un error de entrada/ruta debe fallar antes de crear locks, temporales o modificar el destino.
3. Los errores de limpieza no deben borrar ni sustituir la causa primaria; la política de errores secundarios debe ser explícita y testeada.
4. Un resultado de persistencia indeterminado no puede producir `SAFE_COMMIT`; debe permanecer en `RECONCILE_REQUIRED` hasta que una reconciliación independiente demuestre el estado.
5. La observabilidad de diagnóstico debe distinguir, como mínimo, conflicto de revisión, fallo de escritura, fallo de rename, fallo de cleanup y estado final incierto mediante códigos estables; no exponer secretos ni depender de texto libre.
6. Las pruebas deben comprobar el contenido final, revisión, ausencia de temporales huérfanos bajo el alcance declarado, y comportamiento cuando falla cada etapa. Añadir casos de ruta URL `file:`, espacios y caracteres no ASCII solo tras ratificar el contrato.
7. Probar el error de `releaseLock()` junto con un error previo para fijar si la causa primaria se conserva y cómo se registra el error secundario.
8. Demostrar por separado qué proceso(s) escriben o relanzan escritores y cuál es el alcance de exclusión mutua; no inferir quiescencia global desde el lock de un solo caller.

## Estado / decisión

- Causa exacta del run CI `40270739196`: `UNKNOWN`; este análisis no ejecutó ni reprodujo el fallo.
- Contrato A/B/C para rutas: no ratificado.
- Política de rutas relativas, symlinks y plataformas: pendiente.
- Observabilidad y política de cleanup: pendiente de diseño.
- Implementación: no autorizada por este documento.
- Gates canónicos sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.
