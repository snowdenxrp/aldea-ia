# NCS M0 — reconciliación FB-01 con decisiones ya tomadas

**Fecha:** 2026-10-28  
**Rama:** `ncs-clean-architecture`  
**Tipo:** reconciliación documental acotada; no implementación, pruebas ni autorización de ejecución.

## Resultado ejecutivo

FB-01 no debe reabrirse como si faltara preguntar al propietario qué alcance desea. Las decisiones disponibles ya delimitan dos puntos, pero no cierran la evidencia contractual:

1. El propietario eligió **U** para la clasificación del objeto de bootstrap: no se puede demostrar que sea estrictamente local/no autoritativo ni afirmar que sea estado constitucional. U sigue siendo `UNKNOWN/BLOCKED`; no es una selección provisional de L.
2. El propietario aprobó la **regla provisional de primera creación** el 2026-10-28. Esa aprobación es normativa y limitada: no clasifica el objeto como L, no ratifica el contrato completo, no acredita la autoridad raíz, no selecciona el aislamiento P01-B y no autoriza la operación real.
3. El mapa del objeto/campos documenta que el snapshot Continuity alimenta reconstrucción/admisión de misiones, planificación, intentos, `doNotRepeat`, linaje de ejecuciones y journal de efectos. Por tanto, no es correcto describirlo como inocuo. A la vez, esos usos operacionales no demuestran por sí solos que el store sea una raíz constitucional; ambas propiedades requieren límites contractuales explícitos y evidencia adecuada.

## Evidencia documental reutilizada

- `NCS_M0_P01_FIRST_CREATION_AUTHORITY_RULE_GAP_2026-10-27.md`, §§11–13: decisión U del propietario y aprobación de regla provisional; P01-A/G permanecen abiertos.
- `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, §§10.7 y 11: alcance U, regla provisional aprobada, primera creación STOP.
- `NCS_M0_P01_EXACT_CANDIDATE_OBJECT_AND_FIELD_CONSUMER_MAP_2026-10-27.md`, §§1–3 y 6: el candidato es el archivo Continuity ausente identificado por el `filePath` efectivo de una invocación; no existe ruta universal demostrada; el snapshot tiene consecuencias operacionales.
- `NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_CONSOLIDATED_CANDIDATE_2026-10-27.md`: candidato no ratificado; destino efectivo, no autoridad, exclusión y pruebas siguen pendientes.
- `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`: M0 es un núcleo/prototipo no autoritativo; `M0_BUILD_COMPLETE` y `PROTECTED_EFFECTS_AUTHORIZED` son gates separados.

## Estado correcto de FB-01

| Pregunta | Resolución actual |
|---|---|
| ¿Qué clase de objeto se evalúa? | Archivo Continuity que un `openNexoContinuityOwner` concreto intentaría inicializar si está ausente. |
| ¿Hay un path universal fijado? | No. Debe vincularse a una invocación y a su `filePath` efectivo; no asumir `<root>/continuity.json`. |
| ¿El propietario eligió el alcance del objeto? | Sí: U. No volver a pedir esa misma elección. |
| ¿La regla provisional fue aprobada? | Sí, con límites explícitos. No equivale a permiso de ejecución. |
| ¿P01-A está cerrado? | No: falta un contrato verificable sobre semántica, alcance y propiedades no autoritativas del objeto concreto. |
| ¿P01-G/autoridad de primera creación está cerrado? | No: la regla provisional aprobada no prueba por sí sola el reconocimiento independiente aplicable ni crea una autoridad legítima. |
| ¿Se puede crear ahora? | No. Primera creación permanece STOP. |

## Próximo paso mínimo

No repetir la pregunta de alcance ni reauditar los consumidores ya mapeados. El siguiente trabajo documental es reconciliar la regla provisional aprobada con un contrato que especifique para la invocación concreta:

1. qué datos iniciales puede contener el snapshot y cuáles quedan excluidos;
2. qué consumidores pueden leerlo y qué decisiones operacionales puede influir;
3. qué propiedades no autoritativas deben mantenerse (no establece raíz, identidad, credenciales, policy binding ni permiso de efectos);
4. cómo se demuestra la separación entre inicialización, admisión/PREPARED/dispatch y mutaciones de Chronicle;
5. qué evidencia exacta sigue faltando para declarar estas propiedades verificadas sobre el SHA y el destino efectivos.

Este trabajo no debe inventar un owner/autoridad paralela, una ruta universal, una nueva primitiva de filesystem ni una política de recuperación. Si el contrato no puede demostrar la separación, conservar U/STOP. Después se reevalúan los gates P01-A/G; no se adelanta P01-B, E2/E3 ni P-05.

## Gates sin cambio

- M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`.
- P01-A `OPEN / UNKNOWN`; P01-B `C — NO SELECCIONAR TODAVÍA`; P01-G `PENDING / UNKNOWN`.
- Alcance del objeto: U; P-05 `NO RATIFICADA`.
- D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`.
- E2/E3 `UNKNOWN`; E4 `NOT READY`; raíz legítima `PENDING / UNKNOWN`; `authorization: NOT_EVALUATED`.
- Primera creación de Continuity y efectos protegidos `STOP`.

No se ejecutó código, tests, CI/Actions, bootstrap ni cambios de dispositivo. Este documento es reconciliación, no ratificación del contrato ni PASS de M0.
