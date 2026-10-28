# NCS M0 — registro de decisión explícita de alcance U para bootstrap de Continuity

**Fecha:** 2026-10-27  
**Rama:** `ncs-clean-architecture`  
**Tipo:** registro documental de decisión del propietario; no ratifica contratos ni autoriza operación.

## Decisión del propietario

> Para el alcance del objeto de bootstrap M0 de Continuity, mi decisión es U.

## Significado exacto

`U` significa que el alcance del objeto todavía no puede demostrarse ni clasificarse con seguridad como:

- `L`: almacenamiento local estrictamente no autoritativo; o
- `C`: estado constitucional o que afecta a la autoridad.

No se elige L ni C. Tampoco se presume que el objeto sea inocuo por ser local, que sea una raíz constitucional, que quede excluido del alcance o que exista permiso de escritura. La incertidumbre es explícita y debe conservarse como tal.

## Decisiones y gates independientes que permanecen intactos

- **P01-A (objeto/alcance):** `OPEN / UNKNOWN`; decisión de alcance = `U`.
- **P01-B (separación operacional):** `C — NO SELECCIONAR TODAVÍA`. La decisión U no modifica ni sustituye P01-B.
- **P-05:** `NO RATIFICADA`; readmisión `BLOCKED/UNKNOWN` mientras no exista protocolo aprobado aplicable.
- **Regla legítima para primera creación:** `PENDING / UNKNOWN`.
- **Raíz legítima:** `PENDING / UNKNOWN`.
- **Primera creación de Continuity:** `STOP`.
- **Efectos protegidos:** `STOP`.
- **authorization:** `NOT_EVALUATED`.
- **D0/D1/D2/D3:** `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`.
- **M0:** `INCOMPLETO`.

## Consecuencias

Esta decisión solo clasifica el estado del conocimiento sobre el alcance. No ratifica el contrato candidato ni define la regla legítima de primera creación. No autoriza implementación, escrituras, pruebas, CI/Actions, cambios de runtime/tests/workflows/configuración ejecutable, instalación o configuración de hardware, ni acciones sobre el dispositivo.

No se ejecutaron pruebas, CI ni Actions. No se afirma evidencia de runtime.

## Fuentes relacionadas

- `NEXO_NCS/BUILD/NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md`
- `NEXO_NCS/BUILD/NCS_M0_P01_FIRST_CREATION_AUTHORITY_RULE_GAP_2026-10-27.md`
- `NEXO_NCS/BUILD/NCS_M0_CLOSEOUT_GATE_MATRIX_2026-10-27.md`
