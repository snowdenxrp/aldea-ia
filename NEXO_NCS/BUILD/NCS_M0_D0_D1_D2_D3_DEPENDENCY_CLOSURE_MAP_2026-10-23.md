# NCS M0 — mapa de dependencias y cierre D0/D1/D2/D3

Fecha: 2026-10-23  
Rama: ncs-clean-architecture  
Estado: MAPA DE DEPENDENCIAS DOCUMENTAL — NO ACEPTA DECISIONES — NO AUTORIZA IMPLEMENTACIÓN

## 1. Propósito

Los contratos D0–D3 se relacionan, pero no son una sola decisión. Este mapa identifica qué decisiones bloquean a otras, qué evidencia puede prepararse sin aprobación y qué condiciones no deben darse por satisfechas. No repite el censo de callers y no convierte recomendaciones previas en decisiones del propietario.

Documentos base:
- NCS_M0_OWNER_DECISION_PACKET_D0_D1_SEQUENCE_2026-10-23.md
- NCS_M0_D0_INSTANCE_ROOT_DECISION_LEDGER_2026-10-23.md
- NCS_M0_D1_S0_SEQUENCE_GATE_ANALYSIS_2026-10-23.md
- NCS_M0_D2_D3_CONTRACT_GAP_RECONCILIATION_2026-10-23.md
- NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md
- NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md
- NCS_M0_D3_ENVIRONMENT_SCOPE_SEPARATION_2026-10-23.md

## 2. Dependencia de alto nivel

D0 — contrato de root/config/bootstrap/aliases/migración
  ├──> D1-DESIGN — manifiesto y reglas de grafo/allowlist/UNKNOWN
  │      └──> D1-IMPLEMENTATION — prueba de arquitectura + evidencia CI
  ├──> D2 — admisión operacional, snapshot, ownership, locks y fallos
  └──> D3 — migración y quiescencia de writers legacy
          └── depende de identificar el runtime objetivo y su control operacional

D0/D1/D2/D3 cerrados documentalmente
  └──> autorización explícita y separada de implementación
         └──> cambios runtime/tests y verificación sobre SHA exacto

Ninguno de los pasos anteriores concede autoridad constitucional ni permiso de
repair/dispatch/settlement/efectos protegidos.

El diagrama representa dependencias de trabajo, no una decisión de secuencia ya aprobada.

## 3. Ledger de cierre

| Área | Decisión o evidencia pendiente | Dependencia principal | Puede avanzarse sin decisión del propietario |
|---|---|---|---|
| D0-C1 configuración/interfaz | Fuente única de root, contrato CLI/API y rechazo de fallback ambiguo | Base del resto | Sí: comparar textos y mantener opciones explícitamente propuestas |
| D0-C2 bootstrap/existencia | Separación bootstrap vs operación normal; comportamiento ante root ausente/ilegible | D0-C1 | Sí: documentar estados y resultados esperados, sin implementar |
| D0-C3 canonicalización/aliases | Regla de symlinks, alias, path real y estado ambiguo | D0-C1; afecta D2/D3 | Sí: enumerar casos y abort criteria, sin escoger regla final |
| D0-C4 legacy/migración | Inventario, dry-run, copia/verificación, cutover y rollback sin merge heurístico | D0-C1..C3; depende de D3 para operación real | Sí: definir evidencia y condiciones de abort; no ejecutar |
| D1-S0 secuencia | Elegir separación D1-DESIGN/D1-IMPLEMENTATION o aprobar expresamente una excepción test-only | Decisión del propietario | Sí: comparar consecuencias; no cambiar tests antes de autorización |
| D1-DESIGN | Manifiesto exacto de entrypoints, edges, allowlist, reglas UNKNOWN/BLOCKED y fixtures negativos | D0 suficientemente definido para congelar la frontera | Sí: preparar especificación documental; no afirmar prueba ejecutada |
| D1-IMPLEMENTATION | Test de grafo y/o cambios necesarios; correr pruebas y vincular CI a SHA exacto | Diseño cerrado + autorización explícita | No, hasta resolver gate de implementación |
| D2 snapshot/admission | Definir operaciones admitidas antes de leer; duración de sección crítica; prohibir handles lazy fuera de contexto | D0 y alcance de garantía de snapshot | Sí: comparar escenarios y consecuencias |
| D2 locks/recovery | Caracterizar diferencias entre locks por store y decidir lock raíz compartido/separado, timeouts, release uncertainty | D0 y contrato de operación | Sí: tabla de comportamientos observables; no implementar lock aislado |
| D3 quiescencia | Identificar runtime C, operador/host D, writers y control de relanzamiento; validar hashes antes/después y cutover | D0-C4 + perfil de entorno real | Sí: criterios documentales; el procedimiento específico queda UNKNOWN hasta identificar C |
| Recursos agregados | Determinar si M0 promete límite de heap/disk además de límites por documento/entrada | Alcance de producto y D2 | Sí: conservar explícito NOT DEMONSTRATED; no prometer cuota no implementada |

## 4. Hallazgos de dependencia que deben preservarse

1. **D1-S0 es un bloqueo de secuencia real.** La prueba de arquitectura no está implementada; la prohibición de cambiar tests antes del cierre de diseño impide fingir su ejecución. La separación de gates es recomendación no aceptada. Alternativa: decisión explícita y acotada de test-only. No asumir ninguna de las dos.
2. **Admisión de raíz no equivale a autoridad.** Una raíz selecciona/coordina persistencia; no valida por sí misma dueño legítimo ni habilita efectos protegidos.
3. **La garantía de snapshot determina el alcance de D2.** Si se promete un snapshot consistente por instancia, las consultas y previews que materializan snapshots necesitan admisión antes de la lectura. Debe decidirse el final de la sección crítica y evitar handles lazy fuera del contexto admitido.
4. **Lock de raíz y locks por store son contratos diferentes.** No elegir entre reutilizar la primitiva y crear una separada antes de caracterizar release, concurrencia, recuperación y efectos observables.
5. **D3 no puede cerrarse solo con diseño de archivos.** La captura de procesos más hashes no bloquea por sí sola una carrera de relanzamiento. Sin control operativo verificable de todos los writers, UNKNOWN/BLOCKED.
6. **Presupuesto de recursos y lock son independientes.** El lock no impone cuota de heap ni límite agregado de disco; no prometer esas propiedades sin contrato y prueba propios.

## 5. Orden de trabajo documental recomendado (no aprobado como decisión)

1. Registrar las decisiones reservadas al propietario y evitar que propuestas se interpreten como aceptación.
2. Terminar el cross-check de textos y sus referencias por blob exacto; corregir contradicciones documentales concretas solamente.
3. Mantener D1-S0 como decisión pendiente, sin cambiar runtime/tests.
4. Definir el ámbito de despliegue C: si la primera instancia que usa Continuity/Chronicle existe o no existe todavía. No inferirlo del entorno de desarrollo, CI ni del prototipo M1.
5. Si C existe, recopilar solo la información operacional mínima para D3; si no existe, registrar “sin runtime objetivo seleccionado” y dejar el procedimiento operacional pendiente.
6. No implementar hasta tener contratos cerrados y autorización explícita separada. Después, verificar cambios/tests/CI contra SHA exacto.

## 6. Estado canónico

- D0/D1/D2/D3: OPEN.
- D1-S0: decisión del propietario pendiente.
- M0: INCOMPLETO.
- Autorización de implementación: NOT_EVALUATED.
- Raíz legítima: PENDING/UNKNOWN.
- Efectos protegidos: STOP.
- Runtime/tests/workflows: sin cambios.
- Tests/CI: no ejecutados en esta revisión.

## 7. Continuidad

Leer primero NEXO_NCS/STATUS.md, después el contrato maestro/decisiones aplicables y este mapa; no reiniciar investigación cerrada. Próximo trabajo: actualizar el cross-contract checkpoint, STATUS y handoff con este mapa y seguir la revisión documental dirigida. No repetir el censo completo de callers salvo cambio verificable de la fuente.
