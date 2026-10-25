# NCS M0 — inventario acotado de callers y hueco de ruta raíz

Fecha: 2026-10-25  
Rama: `ncs-clean-architecture`  
Tipo: revisión estática documental. Sin tests/CI, cambios de runtime o acciones en el dispositivo.

## Fuentes y blobs

- `scripts/nexo.mjs` — `e471eb478a09aa8a9a8323795583e198cdf0a127`
- `scripts/nexo-chronicle-session.mjs` — `30a53de2f108aa255a1dfd61ce78c19788de160b`
- `src/nexo/application/chronicle-append.mjs` — `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`
- `src/nexo/core/continuity-service.mjs` — `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`
- `src/nexo/core/continuity-store.mjs` — `9ffd28930abdbe29f5b041711cc29b74dc99fbae`
- `src/nexo/core/chronicle-store.mjs` — `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`
- `tests/nexo/entrypoint.test.mjs` — `ff1bd2e9d292e21e00049b354249aee684837bbc`
- `NEXO_NCS/BUILD/NCS_M0_ROOT_CONTRACT_VS_EXISTING_CLI_CONFORMANCE_2026-10-25.md` — decisión documental vigente sobre `--root` y ausencia de conformidad del CLI actual.

## 1. Call chain observado

1. `scripts/nexo.mjs` recibe el comando `chronicle-append` y crea un proceso Node hijo para `scripts/nexo-chronicle-session.mjs`. El estado de salida del hijo se propaga; si no hay estado entero, el padre usa código 1.
2. `scripts/nexo-chronicle-session.mjs` parsea flags `--continuity`, `--chronicle`, `--initialize-continuity`, `--initialize-chronicle`, `--mission`, `--step`, `--content-stdin` y llama a `runNexoChronicleAppend`.
3. `src/nexo/application/chronicle-append.mjs` construye stores con `filePath: continuityPath` y `filePath: chroniclePath`, lee ambos stores como preflight y después abre Continuity con `openNexoContinuityOwner`. La inicialización de Chronicle puede ocurrir después de abrir/inicializar Continuity.
4. `src/nexo/core/continuity-service.mjs` puede llamar a `store.initialize(snapshot)` si el archivo falta y se permite la inicialización vacía.
5. Los stores escriben en `<filePath>.tmp` y renombran al destino; usan locks locales cooperativos por ruta.

## 2. Callers adicionales inspeccionados

- `scripts/nexo-repair-session.mjs` recibe un `owner`, un `store` y `statePath` ya construidos. No define por sí mismo el origen de las rutas ni crea la raíz canónica.
- `scripts/nexo-repair-entrypoint.mjs` recibe dependencias y rutas por argumento de función; no es por sí solo un contrato de provisioning de raíz.
- `scripts/nexo-runtime-session.mjs` es un módulo pequeño de delegación; la lectura de la fuente no aportó un contrato de raíz única.
- `scripts/nexo-continuity.mjs` es un reexport mínimo de `openNexoContinuityOwner`, no un launcher de entorno.
- `NEXO_NCS/M1_ANDROID` no tiene integración demostrada con estos scripts/CLI. No asumir que Android M1 los lanza.

La revisión no demuestra que estos sean todos los invocadores posibles en el repositorio completo ni en el entorno instalado; sí muestra que los entrypoints examinados aceptan rutas explícitas y que la procedencia operacional de esas rutas no está fijada por esos módulos.

## 3. Contraste con la raíz canónica ya ratificada

El contrato de diseño ya ratificado requiere una raíz única explícita `--root <directory>`, sin fallback ambiental/legacy, bootstrap separado y explícito, canonicalización antes de derivar rutas y admisión antes de leer stores dentro del alcance.

Los entrypoints inspeccionados aún aceptan rutas independientes `--continuity` y `--chronicle` y flags independientes de inicialización. En los módulos examinados no aparece la resolución de una raíz única ni una transición conjunta verificable a `ROOT_READY`.

No se modifica ni reabre el principio ratificado. El hallazgo es una brecha de conformidad entre el contrato de diseño y el CLI existente.

## 4. Efecto sobre la evaluación de opción A

- Los locks de stores solo coordinan participantes que respetan esos locks. No demuestran quiescencia externa universal.
- La prueba de entrypoint documenta un escenario de inicialización parcial y un reintento; no prueba el comportamiento en el POCO X7 Pro ni una transacción atómica entre stores.
- Sin el caller operativo, la ubicación de la raíz y el propietario autorizado de esas rutas, no es posible definir un predicado empírico completo de quiescencia.
- Opción A permanece `UNKNOWN/BLOCKED`; B/C/D no se seleccionan.
- No se infiere que la opción A sea imposible, ni que todos los procesos Android deban controlarse si no pueden escribir o relanzar escritores de la raíz.

## 5. Evidencia mínima que falta

1. Identidad del invocador real del bootstrap en el entorno inicial (manual/CLI, app, servicio o herramienta de provisioning).
2. Raíz física prevista y regla para derivar las rutas de Continuity/Chronicle desde ella.
3. Lista de actores que pueden escribir o lanzar escritores sobre esa raíz y autoridad para detenerlos.
4. Condición observable que mantiene cerrada la admisión durante bootstrap y antes de la readmisión.
5. Política ante corte entre inicializaciones, cierre de proceso, lock irresuelto y resultado de persistencia desconocido.

Si el despliegue aún no está definido, registrar explícitamente que no existe caller operativo seleccionado; no inventar uno ni resolverlo añadiendo flags/wrappers por inferencia.

## 6. Estado

- M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`.
- D1-IMPLEMENTATION `NO AUTORIZADA`.
- Autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- P-01/P-05 pendientes; A/B/C/D sin seleccionar.
- Tests/CI no ejecutados en esta revisión; runtime, workflow y dispositivo sin cambios.

## 7. Instrucción para Gemini

Lee primero `NEXO_NCS/STATUS.md`, luego el protocolo de equipo y este informe. Continúa con el hueco de diseño: raíz única y caller operativo. El principio `--root <directory>` ya está ratificado; no volver a debatirlo ni implementar nada por inferencia. Si no hay despliegue definido, formula una solicitud de evidencia mínima al propietario y mantén `UNKNOWN/BLOCKED`. No repetir auditorías cerradas. No tests/CI, runtime, dispositivo ni bootloader.
