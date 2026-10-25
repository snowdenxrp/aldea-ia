# NCS M0 — conformidad documental del contrato de raíz frente al CLI existente

Fecha: 2026-10-25  
Rama: `ncs-clean-architecture`  
Estado: **ANÁLISIS ESTÁTICO DOCUMENTAL — NO RATIFICA NUEVAS DECISIONES — SIN CAMBIOS DE RUNTIME/TESTS/CI**

## 1. Propósito y límites

Mapear los principios de raíz ya ratificados contra el CLI Node.js y las stores inspeccionadas. Este documento no reabre el principio de raíz explícita, no escoge A/B/C/D para bootstrap, no define todavía la gramática CLI final y no autoriza implementación.

## 2. Fuentes y revisiones

- Registro canónico: `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, blob `d5d62906b365dcfbefa4b5606dcafbce842a75b6`.
- Contrato raíz/D1: `NCS_M0_D0_D1_ROOT_CONTRACT_RECONCILIATION_2026-10-25.md`, blob `99e9fe8a57639e96f5f114b6ef722bfb4652a33b`.
- Especificación P-03/P-04: `NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md`, blob `baa28e3b868aa0262b9aa9edd837d06938aacd4d`.
- Gap review bootstrap parcial/recuperación: `NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md`, blob `e184a52033e265021ee66d6b020fecab6024ed2a`.
- CLI padre: `scripts/nexo.mjs`, blob `e471eb478a09aa8a9a8323795583e198cdf0a127`.
- CLI hijo Chronicle: `scripts/nexo-chronicle-session.mjs`, blob `30a53de2f108aa255a1dfd61ce78c19788de160b`.
- Use case Chronicle: `src/nexo/application/chronicle-append.mjs`, blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`.
- Continuity store: `src/nexo/core/continuity-store.mjs`, blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
- Chronicle store: `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.
- Entry point tests: `tests/nexo/entrypoint.test.mjs`, blob `ff1bd2e9d292e21e00049b354249aee684837bbc`.
- Android M1 Activity: `NEXO_NCS/M1_ANDROID/app/src/main/kotlin/org/nexo/m1/MainActivity.kt`, blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`.

## 3. Matriz de conformidad

| Decisión / gate | Principio ya ratificado o requisito vigente | Evidencia del CLI/store inspeccionado | Estado de conformidad |
|---|---|---|---|
| O-01 / O-08 | Una raíz explícita única por operación: `--root <directory>`; sin override ambiental ni fallback legacy. | Los entrypoints actuales aceptan `--continuity` y `--chronicle` como rutas separadas; no se encontró el contrato `--root` en esos parsers. | **NO DEMOSTRADO EN RUNTIME** |
| O-02 / P-01 | Operación normal con raíz existente; bootstrap separado y explícito; protocolo de bootstrap concreto aún pendiente. | CLI hijo admite `--initialize-continuity` y `--initialize-chronicle` independientes. No se demostró una operación única de bootstrap de raíz. | **PARCIAL / P-01 OPEN** |
| O-03 | Canonicalizar raíz antes de derivar rutas; ambigüedad bloquea. | Los stores reciben `filePath` como configuración de confianza; no afirman ser frontera sandbox ni defensa frente a symlink/path attacks. No se observó resolución contractual de `--root` en el CLI. | **NO DEMOSTRADO EN RUNTIME** |
| O-04 | No migración automática, dual-write ni merge heurístico en el alcance acordado. | La inspección documental no prueba que los entrypoints legacy estén bloqueados ni que exista una migración; tampoco autoriza añadirla. | **ENFORCEMENT NO DEMOSTRADO** |
| O-10 / P-03 | Admisión antes de primera lectura persistente dentro del alcance; consultas/read-only no quedan exentas. | La especificación P-03/P-04 caracteriza queries como path-oriented y no demuestra admisión de instancia universal; el CLI no prueba cobertura de callers directos. | **OPEN / NO DEMOSTRADO** |
| P-04 | Propiedad explícita de admisión entre padre, hijo y APIs directas; sin deadlock ni bypass. | El padre usa `spawnSync`; el hijo es directamente invocable. La especificación dice que ambos caminos aún deben validar/adquirir bajo un contrato común. | **OPEN** |
| P-05 | Release incierto bloquea readmisión hasta evidencia suficiente; no limpiar objetos reemplazados. | Los stores tienen semánticas de lock/release distintas; no se ejecutaron pruebas en esta revisión y no se puede inferir el estado de actores en el entorno real. | **OPEN / UNKNOWN** |
| P-01 (quiescencia) | La opción A exige detener escritores/launchers relevantes e impedir su reanudación durante la intervención. | No hay despliegue/supervisor del CLI demostrado en el POCO. La app Android M1 no importa este runtime ni se muestra como su launcher. | **UNKNOWN/BLOCKED** |
| `BOOTSTRAP_PARTIAL → ROOT_READY` | Requiere protocolo aprobado, integridad, autoridad, quiescencia y evidencia de salida. | El test de entrypoint documenta que Continuity puede quedar inicializada cuando falla Chronicle; no se identificó una salida de raíz única `ROOT_READY`. | **CONTRATO CONJUNTO AUSENTE/NO DEMOSTRADO** |

## 4. Distinción entre principios ratificados y detalles abiertos

**No volver a someter a decisión:** raíz explícita única, sin fallback ambiental/legacy, bootstrap no implícito, canonicalización antes de derivar paths y admisión antes de lecturas persistentes dentro del alcance ratificado.

**Siguen abiertos:** gramática exacta de flags de bootstrap; rechazo/adaptación de `--continuity`/`--chronicle`; layout; política sobre aliases/symlinks/mounts y límites TOCTOU; propietario efectivo de admisión; cobertura de callers directos/indirectos; relación padre/hijo; contrato de recuperación/readmisión; mecanismo operacional que puede demostrar quiescencia.

No rellenar esos detalles por inferencia ni implementar un wrapper para hacer que el estado aparente conformidad.

## 5. Consecuencia para evaluar la opción A

El problema más temprano no es probar exhaustivamente todos los daemons Android. Primero debe quedar trazado qué implementación concreta crea la raíz canónica ratificada y qué actor la invoca. La fuente Android M1 y el CLI Node.js son componentes separados; no hay evidencia revisada de integración/despliegue de este CLI en el POCO X7 Pro.

La opción A sigue siendo una alternativa razonable solo si el despliegue real permite demostrar quiescencia sostenida de los escritores y relanzadores relevantes. Con la evidencia actual, **A = UNKNOWN/BLOCKED, no certificada y no seleccionada**. B/C/D permanecen sin seleccionar.

## 6. Gates y estado de ejecución

- M0: `INCOMPLETO`.
- D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Authorization: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- P-01/P-03/P-04/P-05: pendientes.
- No se ejecutaron tests ni CI en esta revisión.
- No hubo cambios de runtime, workflow, instalación ni dispositivo.

## 7. Próximo paso

Continuar documentalmente con el inventario mínimo de callers de los dos entrypoints actuales y contrastarlo con el contrato `--root` ya ratificado. Identificar solo las rutas que leen o mutan las stores canónicas; no hacer barrido general ni repetir auditorías cerradas. Si la invocación/despliegue real no se puede establecer desde el repo, dejarla `UNKNOWN` y no certificar la opción A.
