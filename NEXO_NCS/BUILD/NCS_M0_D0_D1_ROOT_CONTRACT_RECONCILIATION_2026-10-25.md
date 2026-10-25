# NCS M0 — reconciliación del contrato de raíz con D1
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Estado: DOCUMENTACIÓN DE RECONCILIACIÓN — NO AUTORIZA IMPLEMENTACIÓN

## 1. Hallazgo

La matriz `NCS_M0_D1_MINIMUM_RESPONSIBILITY_CUT_AND_CLOSURE_MATRIX_2026-10-25.md` debe leerse junto al registro de decisiones y al contrato de raíz. El contrato ya no es una propuesta íntegramente pendiente: O-01…O-04 del registro ratifican los principios D0-C1…C4. No obstante, eso no equivale a que la CLI/API o el runtime cumplan el contrato.

## 2. Decisiones de diseño ratificadas

- Una sola raíz explícita por operación: `--root <directory>`.
- Sin override ambiental ni fallback legacy en la primera versión.
- La operación normal requiere raíz existente/válida; bootstrap separado y explícito.
- Canonicalizar la raíz antes de derivar rutas; la ambigüedad bloquea.
- No realizar migración automática, dual-write ni merge heurístico; migración/cutover fuera de M0 hasta identificar y verificar el destino.

Fuente normativa: `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, §2, O-01…O-04; ratificación del propietario en §8. El documento de contrato de raíz, §§8 y 14–15, contiene además recomendaciones técnicas que deben distinguirse de esas decisiones ratificadas.

## 3. Recomendaciones técnicas existentes, no todas ratificadas por separado

El contrato de raíz recomienda:
- no usar variable de entorno en la primera migración;
- exigir raíz existente y resolverla mediante `realpath` antes de derivar paths;
- conservar los locks por almacén y añadir una capa de admisión por instancia;
- mantener el orden raíz → lock per-store;
- cuando el CLI padre delega a Chronicle, hacer que el proceso hijo valide la raíz y sea dueño de la admisión; el padre no debe mantener un lock que el hijo necesite;
- bloquear ante ownership/release incierto y no recuperar stale locks automáticamente.

Estas recomendaciones pueden guiar el diseño y son coherentes con la dirección ratificada, pero no deben registrarse como una ratificación nueva del propietario ni como comportamiento de runtime.

## 4. Qué sigue abierto en D1/D2

1. Contrato exacto de flags de inicialización/bootstrap y cómo distinguir el flujo de operación normal del bootstrap explícito.
2. Compatibilidad de `--continuity`/`--chronicle` existentes: rechazo explícito o adaptador solo si la equivalencia canónica se demuestra. No hacer fallback silencioso.
3. Tratamiento probado de symlinks/aliases y límites de `realpath`; no prometer garantías sobre mounts o frente a TOCTOU hostil.
4. Clasificación reproducible de callers directos/indirectos/dinámicos y APIs de bajo nivel.
5. Sección crítica, vida útil de snapshots, protocolo del lock, release incierto, timeout/stale y pruebas de concurrencia (D2).
6. Confirmar en código y pruebas que el hijo Chronicle valida independientemente la raíz y no hay doble adquisición ni bypass.

## 5. Corrección de lectura para la matriz D1

Donde la matriz dice que “la gramática root/Chronicle no está ratificada”, leer con precisión:
- el **principio básico de raíz explícita y sin fallback ambiental/legacy** sí está ratificado;
- los **detalles de gramática CLI, flags de bootstrap, compatibilidad, canonicalización y propiedad efectiva de admisión** no están todos cerrados;
- ninguna de estas decisiones demuestra implementación ni permite cerrar D1/D2.

La regla “admisión antes de la primera lectura persistente dentro del alcance ratificado” ya es un objetivo de diseño; lo pendiente es el mapa completo de callers, el límite operativo y la demostración del cumplimiento.

## 6. Estado conservador

- M0: `INCOMPLETO`
- D0: `OPEN` por detalles técnicos/evidencia restantes; O-01…O-04 no se reabren.
- D1-DESIGN: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- D2/D3: `OPEN`
- Authorization: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`

No se modificaron runtime, tests, workflows ni datos. No se ejecutaron tests ni CI. Este documento solo elimina una ambigüedad de interpretación entre artefactos.
