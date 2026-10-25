# NCS M0 — estado de criterios de aceptación y evidencia
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Fuente normativa de trabajo: `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md` (blob `e37a98ecfe1dcdccfef3cb0c5c98e0f2cb7d1287`).
Tipo: clasificación documental preliminar basada en registros ya existentes; no constituye acta de aceptación M0.

## Estado canónico
M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Convenciones
- **DECIDIDO**: aceptación explícita del propietario registrada.
- **DOCUMENTADO**: existe contrato/propuesta/registro; no significa ratificado.
- **EVIDENCIA PENDIENTE**: falta demostrar comportamiento en el SHA pertinente.
- **NO APLICABLE SOLO SI SE ACEPTA EXCLUSIÓN**: no se puede marcar PASS sin decisión explícita de alcance.
- Este documento no convierte ninguna categoría en PASS de M0.

## Matriz de estado A–E

| Criterio | Estado preliminar | Evidencia/referencia ya existente | Bloqueo concreto para aceptación |
|---|---|---|---|
| A1 Alcance M0 no autoritativo y exclusiones claras | DOCUMENTADO; base de cierre aceptada | Línea de meta §1–2 y §9; STATUS/handoff | Verificar que decisiones necesarias para el alcance elegido estén aceptadas o excluidas explícitamente |
| A2 Decisiones necesarias aceptadas/rechazadas/diferidas | PARCIAL: O-08/O-10 y O-11 registrados; varias decisiones abiertas | Registro D0–D3; restricciones D2 | Resolver P-01, P-03/P-04/P-05 y detalles CLI/caller aplicables; no confundir propuesta con decisión |
| A3 Contratos coherentes D0–D3 | DOCUMENTADO PARCIAL; no cerrado | Reconciliación root D0/D1, P-03/P-04, P-05, matriz bootstrap | Contratos y estados deben concordar y contar con decisiones del propietario; D3 depende del alcance/entorno |
| A4 Semántica limitada de ROOT_READY | DOCUMENTADO como restricción; predicados no cerrados | Gap review bootstrap parcial | Definir y aprobar predicados verificables; ausencia de raíz no implica bootstrap implícito |
| B5 Inventario reproducible de entrypoints/callers | PARCIAL / UNKNOWN en edges no resueltos | Manifiesto D1, caller ledger, snapshot fijado; grep de Claude no reproducible con datos comunicados | Cerrar solo edges relevantes pendientes usando snapshot/comando/hash reproducibles; no repetir barrido de 188 archivos por rutina |
| B6 Prueba arquitectónica no-bypass implementada y ejecutada | PENDIENTE; implementación no autorizada | Línea de meta §3.B y caller ledger/test spec | Requiere contrato congelado y autorización separada; después, resultado ligado al SHA de código+tests |
| B7 Separación admisión/integridad/identidad/autoridad | PRINCIPIO DOCUMENTADO; verificación pendiente | O-08/O-10, D2 constraints | Evidencia separada por cada propiedad; un lock o root path no demuestra autoridad |
| B8 Repair/dispatch/efectos protegidos excluidos o bloqueados | STOP canónico; composición no demostrada | Reachability report y STATUS | Mantener STOP; no promover a habilitado por conveniencia de M0 |
| C9 Protocolo de bootstrap aprobado | PENDIENTE | Opciones D0-C2, gap review, matriz de aceptación A/B/C/D | Decisión del propietario y contrato de concurrencia/fallos/estado parcial |
| C10 Bootstrap parcial, owner/stores corruptos/ausentes fail-closed | CONTRATO PARCIAL; aceptación no demostrada | Gap review bootstrap parcial; matriz de estados D2 | Predicados y resultados de salida aprobados, con pruebas reproducibles |
| C11 Pruebas adversariales de concurrencia/release | PENDIENTE; no ejecutadas en esta pasada | Finish line §3.C; P-05 E1–E9 propuestos | Casos deben convertirse en tests autorizados y ejecutarse en SHA exacto |
| C12 No borrar objeto reemplazado / no readmitir con actor anterior activo | PROPUESTA; evidencia ambiental pendiente | P-05, alternativas de recuperación, perfil D3 | Elegir política aprobada y demostrar identidad/quiescencia en modelo de filesystem y entorno real |
| C13 Persistencia, negocio, release y readmisión separados; sin retry automático | REQUISITO DOCUMENTADO; comportamiento global no verificado | P-05 release uncertainty spec | Contrato ratificado y tests de aceptación; no inferir éxito por path ausente |
| D14 Límites de recursos en alcance y pruebas de borde | EVIDENCIA HISTÓRICA EXISTE para límites específicos; cobertura M0 actual no revalidada aquí | Handoff de presupuesto y pruebas previamente registradas | Reusar resultados fijados; solo abrir brechas si la garantía de alcance las exige |
| D15 Política de filesystem/rutas aprobada y probada | PENDIENTE para garantías específicas | Root contract, D0/D2 matrices | Aprobar límites del modelo; no afirmar defensa universal contra TOCTOU/actores locales hostiles |
| D16 CI de implementación+tests en SHA exacto | PENDIENTE para los contratos aún no implementados | Finish line §3.E; runs anteriores solo sirven para sus SHA | Requiere autorización, cambio implementado y tests/CI del mismo SHA |
| D17 Ningún UNKNOWN/BLOCKED dentro del alcance declarado | NO SATISFECHO hoy; estado global abierto | Estado canónico y registros de puertas | Cerrar evidencia o aceptar exclusión explícita con riesgo/capacidad afectada |
| E18 Trazabilidad requisito→test→SHA→job/run | DOCUMENTADO PARCIAL; falta para trabajo futuro | Finish line, STATUS y handoffs | Añadir evidencia solo cuando existan ejecución y CI pertinentes |
| E19 Etiquetas documentado/decidido/implementado/verificado/excluido | ESTA MATRIZ ESTABLECE CONVENCIÓN, no certifica criterios | Finish line §8.2 | Aplicar con fuente verificable por criterio y evitar etiquetas ambiguas |
| E20 revisión final D0–D3 + acta de aceptación | PENDIENTE | Finish line §3.E y §5 | Solo redactar cuando los gates aplicables estén resueltos; no anticipar PASS |

## Qué está realmente cerrado hoy

1. La línea de meta M0 fue aceptada como base de trabajo; esa aceptación no es una aceptación final de M0.
2. Los principios de raíz explícita O-08 y admisión previa a lecturas persistentes O-10 están registrados como ratificados en diseño. No están implementados por esa ratificación.
3. O-11 registra que la incertidumbre de release/readmisión debe bloquear y no provocar retry automático de negocio; los detalles del mecanismo siguen abiertos.
4. Hay especificaciones y matrices documentales para P-03/P-04/P-05 y opciones de bootstrap. No son contratos completos ratificados, tests ejecutados ni evidencia de runtime.

## Próxima secuencia mínima

1. Resolver P-01: decisión del propietario sobre el requisito operacional de bootstrap inicial (si se puede exigir instalación manual/offline y quiescencia demostrable). Si no se conoce el entorno, conservar UNKNOWN; no adivinar.
2. Alinear P-03/P-04: admisión antes de primera lectura persistente, alcance de snapshot y propietario único por flujo, incluido Chronicle hijo.
3. Resolver P-05 coordinadamente: política de release incierto y evidencia suficiente para readmisión.
4. Fijar los detalles de CLI/caller necesarios para el alcance, sin reabrir O-08/O-10 ni repetir el censo completo.
5. Presentar el paquete de tests y autorización separada. Solo tras autorización implementar y ejecutar; verificar CI en el SHA exacto.
6. Completar el acta M0 criterio por criterio. Hasta entonces, M0 sigue INCOMPLETO.

## No hacer
- No seleccionar bootstrap A/B/C/D ni recuperación A/B por inferencia.
- No ejecutar tests/CI ni modificar runtime/tests/workflows sin autorización explícita separada.
- No marcar criterios PASS por documentación, por CI antiguo o por ausencia de resultados.
- No habilitar commissioning, repair, dispatch ni efectos protegidos.

## Verificación de esta pasada
Documento de estado y trazabilidad solamente. No tests/CI. No cambios de runtime/tests/workflows/datos operativos. Estado canónico sin cambios.