# NCS M0 — Propuesta de línea de meta y criterios de aceptación (2026-10-26)

## Estado y autoridad de este documento

- Tipo: propuesta de criterios de salida; documentación únicamente.
- Rama de referencia: `ncs-clean-architecture`.
- La propuesta de línea de meta sigue sin ratificación del owner; no cambia gates canónicos.
- No modifica runtime, tests, workflows, dispositivo ni permisos.
- No declara M0 completo ni autoriza efectos protegidos.
- Relacionado con: [Gate del contrato de producto para outcomes UNKNOWN](NCS_M0_UNKNOWN_OUTCOME_PRODUCT_CONTRACT_GATE_2026-10-26.md) y [Matriz de aceptación UNKNOWN](NCS_M0_UNKNOWN_OUTCOME_ACCEPTANCE_TEST_MATRIX_2026-10-26.md).

## Propósito

Definir una línea de meta finita para M0 como núcleo/prototipo no autoritativo. M0 no necesita convertirse en un sistema de autoridad raíz ni resolver automáticamente todos los outcomes ambiguos para poder cerrar su alcance inicial; pero cualquier criterio de cierre debe demostrar que las capacidades incluidas son reproducibles y que las capacidades no autorizadas siguen bloqueadas.

El contrato de producto para `COMMIT.UNKNOWN` ya tiene la alternativa A ratificada por el owner: conservar el outcome no resuelto hasta intervención explícita, sin reintento automático. Esta propuesta de línea de meta, por separado, sigue sin ratificación.

## Alcance que puede cerrarse en M0

M0 puede considerarse candidato a aceptación únicamente dentro de su alcance documentado y no autoritativo. No significa que Nexo tenga autoridad raíz, continuidad universal, recuperación automática, sucesión, ejecución privilegiada o efectos protegidos habilitados.

## Línea de meta propuesta

Todos los grupos siguientes deben tener evidencia trazable. Una descripción, un archivo de diseño o un run de CI sin su HEAD y resultado relevante no basta por sí solo.

### G1 — Alcance y arquitectura

- La documentación identifica explícitamente qué pertenece a M0 y qué queda fuera.
- Se conserva la separación Modelo ≠ Nexo, OS ≠ Nexo, Dispositivo ≠ Nexo y Lúmina ≠ Nexo.
- No se introduce mezcla de memoria operativa Nexo con estado de simulación Lúmina.
- No se incorpora un monolito `GenesisRoot` ni autoridad implícita.

### G2 — Persistencia y admisión

- Los límites de admisión documentados se prueban con casos en el límite y por encima del límite.
- Los rechazos ocurren antes de dispatch/persistencia cuando así lo exige el contrato, y la prueba verifica explícitamente ausencia de mutación.
- El contrato de rutas de persistencia opción B se mantiene cubierto por pruebas; el resultado de CI debe vincularse al HEAD exacto.
- No se afirma durabilidad ante caída del SO o pérdida de energía (F2/F3) sin contrato y evidencia específicos.

### G3 — Outcomes ambiguos

- `COMMIT.UNKNOWN` no se promociona por inferencia a `SAFE_COMMIT`.
- La transición conserva una clasificación conservadora y no inventa evidencia causal.
- El reconciliador sigue fail-closed; no se conecta al flujo sin contrato ratificado, evidencia independiente y autorización específica.
- La decisión de producto sobre `UNKNOWN` no resuelto frente a reconciliación automática se registra como decisión explícita, no como supuesto.
- Los códigos de error y diagnósticos no se convierten en afirmaciones sobre el estado durable.

### G4 — Frontera de autoridad y efectos

- La autoridad raíz continúa `PENDING/UNKNOWN` hasta que exista evidencia independiente y verificable que satisfaga el contrato aplicable.
- Los efectos protegidos permanecen `STOP` mientras no se prueben autoridad legítima y una frontera de ejecución real.
- No se declara segura la ausencia global de retries, relanzadores o escritores si el inventario y su alcance no son exhaustivos.
- No se habilita bootstrap, commissioning, delegación ni sucesión por inferencia.

### G5 — Reproducibilidad y evidencia

- Cada aceptación de runtime tiene una prueba identificable, un resultado observable y el commit exacto probado.
- Los runs de CI se clasifican por workflow, job, HEAD y conclusión; un run exitoso no se generaliza a toda la suite.
- Las afirmaciones no probadas se mantienen como `UNKNOWN`, `PENDING` o `BLOCKED`, según corresponda.
- Las decisiones pendientes, exclusiones y limitaciones se conservan en el handoff de continuidad.

## Criterios de no aceptación

M0 no pasa su línea de meta si ocurre cualquiera de estos casos:

1. Se declara commit seguro a partir de un resultado ambiguo sin evidencia suficiente.
2. Se habilita un efecto protegido sin autoridad legítima y frontera de ejecución demostradas.
3. Una prueba o documento se presenta como si fuera evidencia de ejecución que no ocurrió.
4. Se afirma que un modelo de fallo, un inventario de escritores o una ruta de ejecución está cubierto sin evidencia suficiente.
5. Se fusionan límites de M0 con objetivos futuros como autoridad raíz, sucesión, multi-dispositivo o recuperación avanzada.

## Estado actual contra la propuesta

| Grupo | Estado documental actual | Brecha principal |
|---|---|---|
| G1 — Alcance y arquitectura | Parcialmente documentado | Completar evidencia de aceptación consolidada |
| G2 — Persistencia y admisión | Hay cambios acotados y runs específicos exitosos | No generalizar a durabilidad F2/F3 ni a CI global |
| G3 — Outcomes ambiguos | Matriz UO-01–UO-10 y gate publicados; alternativa A ratificada como contrato de producto | Aceptación end-to-end de la implementación pendiente |
| G4 — Autoridad y efectos | STOP / PENDING / UNKNOWN | No hay autorización ni prueba para activarlos |
| G5 — Reproducibilidad | Hay runs identificados por HEAD | Falta una declaración final de aceptación que consolide la evidencia requerida |

Estos estados son una lectura de los artefactos y registros referenciados, no una nueva ejecución de pruebas ni una auditoría exhaustiva.

## Próxima acción de menor riesgo

1. Ratificar o rechazar explícitamente la propuesta de línea de meta como criterio de cierre M0.
2. Aplicar la decisión de producto ya ratificada para `COMMIT.UNKNOWN` (alternativa A); mantener pendiente la evidencia de aceptación end-to-end.
3. Solo después, preparar una lista de aceptación final que enlace las pruebas existentes y marque con precisión las que faltan. Cualquier modificación de runtime/tests distinta de la reparación de rutas ya autorizada requiere autorización acotada propia.

## Gates que no cambian por este documento

- M0: `INCOMPLETO`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Reconciliación: diseño pendiente, no integrada.
- Contrato de producto `COMMIT.UNKNOWN`: alternativa A ratificada; aceptación de implementación pendiente de evidencia.
- Causa primaria exacta del run CI histórico `40270739196`: `UNKNOWN`.
