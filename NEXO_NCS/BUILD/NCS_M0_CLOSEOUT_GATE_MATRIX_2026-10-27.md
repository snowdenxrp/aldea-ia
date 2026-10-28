# NCS M0 — matriz finita de cierre y bloqueos reales

**Fecha:** 2026-10-27  
**Rama objetivo:** `ncs-clean-architecture`  
**Tipo:** reconciliación documental; no es acta de aceptación ni autorización de implementación.  
**Línea de meta:** [NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md](NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md)

## 1. Conclusión ejecutiva

M0 **no puede declararse completo hoy**. La línea de meta aceptada por el propietario exige contratos necesarios congelados, decisiones aplicables aceptadas o exclusiones explícitas, pruebas obligatorias implementadas y ejecutadas, CI ligado al SHA exacto y un acta criterio por criterio. La evidencia disponible en este paquete es principalmente documental; no sustituye pruebas de runtime ni autoridad.

Esta matriz es el índice finito de cierre. Reutiliza los documentos existentes; no ordena otro censo general, otra ronda de revisiones externas ni una nueva auditoría de todo el repositorio.

## 2. Estado por criterio de aceptación M0

| Criterio de la línea de meta | Estado documental actual | Bloqueo concreto para cierre | Acción mínima siguiente |
|---|---|---|---|
| A — alcance y contratos congelados | **PARCIAL / BLOQUEADO** | D0/D1/D2 siguen abiertos; el contrato consolidado de bootstrap es candidato no ratificado. P01-B permanece en C. | Reconciliar únicamente decisiones necesarias para el alcance M0 y obtener aceptación explícita; no tratar propuestas como decisiones. |
| B — no-bypass y frontera de autoridad | **ABIERTO / UNKNOWN** | No-bypass requiere la prueba arquitectónica autorizada sobre el SHA final; la revisión documental no la reemplaza. | Tras congelar contratos y recibir autorización separada, ejecutar la prueba especificada y resolver solo las aristas que afecten al alcance. |
| C — bootstrap, stores y recuperación | **BLOQUEANTE** | La regla de autoridad para la primera creación local sigue UNKNOWN/PENDING; no hay protocolo de bootstrap ratificado ni readmisión aprobada. | Resolver primero alcance/autoridad de primera creación y el contrato P-01/P-05. Sin ello, no implementar ni ejecutar bootstrap. |
| D — recursos, integridad y regresión | **PARCIAL; falta evidencia del SHA final** | Los límites de recursos previamente definidos no demuestran por sí solos todas las regresiones exigidas para el SHA final. | Reutilizar evidencia existente que corresponda exactamente al SHA; ejecutar solo pruebas obligatorias que falten tras autorización. |
| E — evidencia y reproducibilidad | **ABIERTO** | Falta acta de aceptación final con cada criterio vinculado a contrato, prueba, SHA, workflow/job/run y resultado del mismo cambio final. | Completar después de que los criterios aplicables tengan evidencia verificable; no rellenar PASS por inferencia. |

## 3. Decisiones y estados que no deben reabrirse

- **P01-B:** decisión del propietario = **C — NO SELECCIONAR TODAVÍA**. No elegir A/B por conveniencia.
- **P-05:** propuesta de release incierto/readmisión **NO RATIFICADA**. Mientras no exista protocolo aprobado aplicable, readmisión permanece `BLOCKED/UNKNOWN`.
- **Cutover/migración legacy:** fuera del alcance operativo de M0 por aceptación del propietario en la línea de meta §9. Esto no demuestra quiescencia ni cierra D3 para fases futuras.
- **Recursos:** conservar los límites y pruebas ya registrados; no rehacerlos sin una discrepancia concreta o un SHA que cambie la evidencia.
- **Revisiones externas:** los hallazgos disponibles ya se integraron en el candidato consolidado. No solicitar otra revisión general salvo contradicción material nueva y específica.
- **Autoridad:** ningún PASS documental/operacional, éxito de filesystem, lock, existencia de raíz o persistencia confirmada constituye por sí mismo autoridad constitucional.

## 4. Paquete documental vigente

1. [Contrato de bootstrap — candidato consolidado](NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_CONSOLIDATED_CANDIDATE_2026-10-27.md) — blob `3af18f1df75c687771aa7ceef3fe0d9b232ca45f`. Candidato, no ratificado.
2. [Matriz de decisiones P-01](NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md) — blob `f06a50892270ff1e03d5be1c3b911774fd593569`. Enlaza el candidato y desambigua etiquetas.
3. [Brecha de autoridad para primera creación](NCS_M0_P01_FIRST_CREATION_AUTHORITY_RULE_GAP_2026-10-27.md) — sigue abierta; no se presume una regla canónica por analogía.
4. [Especificación de aceptación de persistencia UNKNOWN](NCS_M0_PERSISTENCE_UNKNOWN_ACCEPTANCE_SPEC_2026-10-26.md) — propuesta documental; no equivale a pruebas ejecutadas.
5. [Registro de decisiones D0/D1/D2/D3](NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md) — fuente de decisiones aceptadas y pendientes.
6. [Línea de meta M0](NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md) — base de cierre aceptada por el propietario.

## 5. Bloqueos finitos que impiden declarar M0 completo

### B1 — Contratos/decisiones de diseño del alcance M0
**Evidencia faltante:** aceptación explícita de las decisiones técnicas necesarias para el alcance y coherencia D0–D2.  
**No hacer:** inferir decisiones a partir del código existente, de recomendaciones de modelos o de un documento candidato.

### B2 — Regla de autoridad para primera creación y contrato de bootstrap
**Evidencia faltante:** regla canónica que cubra expresamente la creación inicial local, objeto/alcance exactos y protocolo aprobado de primera creación.  
**No hacer:** crear autoridad paralela, asumir que ausencia del archivo es permiso o inferir autoridad del propietario semántico sin regla aplicable.

### B3 — Release incierto y readmisión
**Evidencia faltante:** P-05 ratificada y criterio aplicable que demuestre que un actor anterior ya no puede modificar el estado antes de readmitir.  
**No hacer:** asumir que un path ausente, PID muerto, lock cooperativo o limpieza terminada prueba readmisión segura.

### B4 — No-bypass y pruebas obligatorias
**Evidencia faltante:** prueba arquitectónica y pruebas adversariales exigidas por los contratos aprobados, ejecutadas con autorización y ligadas al SHA final.  
**No hacer:** tratar inspección estática, CI histórico o pruebas sobre otro SHA como sustituto.

### B5 — CI y acta final
**Evidencia faltante:** workflow/job/run satisfactorio sobre el SHA que contiene los cambios y pruebas finales, más acta criterio por criterio con exclusiones aceptadas.  
**No hacer:** declarar M0 completo por documentación o por CI de un commit anterior.

## 6. Secuencia de cierre — sin volver al principio

1. Resolver B1–B3 con los registros existentes y decisiones explícitas; no repetir auditorías cerradas.
2. Si el propietario no acepta una decisión necesaria, conservar el gate abierto. Una exclusión solo cuenta si está explícita y cubre el riesgo/capacidad afectados.
3. Cuando los contratos aplicables estén congelados, solicitar/confirmar autorización separada para implementar y ejecutar las pruebas obligatorias.
4. Ejecutar pruebas y CI sobre el SHA final, inspeccionar jobs y vincular cada resultado a los criterios A–E.
5. Completar el acta de aceptación. Si cualquier criterio obligatorio permanece UNKNOWN/BLOCKED, M0 continúa INCOMPLETO.

## 7. Estado canónico conservado

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`.
- P01-B: `C — NO SELECCIONAR TODAVÍA`.
- P-05: `NO RATIFICADA`.
- D0/D1/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Autoridad para primera creación / raíz legítima: `PENDING / UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación de Continuity y efectos protegidos: `STOP`.

**Límites de esta matriz:** no modifica runtime, tests, workflows, configuración ejecutable ni dispositivo. No afirma que se hayan ejecutado pruebas, CI o acciones operativas. Su función es fijar el orden de cierre y evitar que el proyecto vuelva a una investigación general.

## 8. Reconciliación aplicada de decisiones aceptadas con B1–B3 (2026-10-27)

Esta sección actualiza la lectura de los gates con las decisiones explícitas ya registradas; no crea una decisión nueva del propietario.

### B1 — qué queda resuelto y qué no

- **Resuelto como base de diseño:** O-01/O-08 fijan una raíz explícita por operación, sin fallback ambiental/legacy; O-02 fija que la operación normal requiere raíz existente/válida y que bootstrap es separado y explícito; O-03 exige canonicalizar antes de derivar rutas y bloquear ambigüedad; O-04/O-08 excluyen migración automática y fallback legacy en el alcance acordado.
- **No resuelto:** esos acuerdos no clasifican el objeto de primera creación ni fijan su finalidad y consumidores exactos. La decisión explícita **U** registrada en `NCS_M0_OWNER_DECISION_BOOTSTRAP_SCOPE_U_2026-10-27.md` prevalece sobre cualquier línea histórica de la matriz P-01 que diga «Alcance elegido: Opción A». U significa que no está demostrado ni L (almacenamiento estrictamente no autoritativo) ni C (estado constitucional/que afecta autoridad).
- **Resultado B1:** los principios de raíz/operación normal se conservan; el contrato del objeto y el alcance de bootstrap no se congelan. P01-A = `OPEN / UNKNOWN`; P01-B = `C — NO SELECCIONAR TODAVÍA`.

### B2 — regla de autoridad para primera creación

- O-02 separa bootstrap de operación normal, pero dice expresamente que no selecciona el protocolo concreto ni demuestra quiescencia.
- O-09 ordena definir primero las fronteras Nexo/Lúmina; no demuestra aislamiento actual ni autoridad de primera creación.
- O-10/O-11 y los principios de STOP/UNKNOWN impiden inferir seguridad de reanudación/readmisión o permiso a partir de locks, persistencia o estado técnico; no aportan una regla positiva que legitime la primera creación local.
- La investigación documental acotada registrada en `NCS_M0_P01_FIRST_CREATION_AUTHORITY_RULE_GAP_2026-10-27.md` no localizó una regla canónica aceptada que cubra expresamente esa operación. No debe ampliarse por analogía el Constitution Authority Context, la decisión histórica sobre un canal humano candidato ni la propiedad conceptual del proyecto.
- **Resultado B2:** regla legítima de primera creación = `PENDING / UNKNOWN`; primera creación = `STOP`; no inventar autoridad paralela ni pedir a otra IA que elija autoridad en nombre del propietario.

### B3 — release incierto y readmisión

- O-11 fija la regla de seguridad: incertidumbre sobre release implica `UNKNOWN / BLOCKED`, sin reintento/readmisión automática.
- Esa decisión es una regla de bloqueo, no una demostración de que exista un protocolo completo aprobado. P-05 sigue `NO RATIFICADA`; B3 no puede cerrarse por O-11 solo.

### Siguiente paso mínimo

No hace falta otra auditoría general ni otra ronda de modelos. B1–B3 ya están reconciliados hasta el límite de las decisiones existentes. La única vía para avanzar más allá del estado documental es resolver las decisiones explícitas que faltan: clasificación/finalidad del objeto (B1), regla aplicable de primera creación (B2) y ratificación de P-05 (B3). Hasta entonces, no congelar el candidato ni implementar/ejecutar bootstrap.

**Estado posterior a esta reconciliación:** M0 `INCOMPLETO`; D0–D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; P01-A `OPEN / UNKNOWN`; P01-B `C`; P01-G `PENDING / UNKNOWN`; P-05 `NO RATIFICADA`; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos `STOP`. Esta actualización es documental; no se ejecutaron tests, CI ni Actions.
