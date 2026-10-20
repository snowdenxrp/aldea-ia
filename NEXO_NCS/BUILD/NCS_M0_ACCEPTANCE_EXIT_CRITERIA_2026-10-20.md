# NCS — M0: línea de meta y criterio de cierre
Fecha: 2026-10-20
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`

## Propósito obligatorio

M0 debe tener una línea de meta finita. «No declarar resuelto lo no demostrado» es una regla de evidencia, no una autorización para mantener M0 abierto indefinidamente. Este documento establece el criterio de continuidad y el borrador de aceptación que debe cruzarse con los contratos, pruebas y artefactos existentes antes de congelarlo.

**No confundir:** (1) M0 cerrado al satisfacer los criterios de aceptación acordados, con evidencia reproducible, y (2) Nexo completo como producto/sistema. Cerrar M0 no significa que todo Nexo esté terminado.

## Estado al crear este documento

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- La lista de abajo es una **propuesta de criterios de salida pendiente de mapeo y congelación**, no un resultado de pruebas ni una autorización constitucional.
- No crear digest/firma constitucional, commissioning ni provisionar llave raíz sin revisión y aprobación explícita del propietario del objeto constitucional exacto.

## Criterios propuestos de aceptación M0

### M0-A — Aceptación reproducible
Definir una batería finita de workflows/pruebas obligatorios y sus SHA aplicables. Cada ejecución exigida debe terminar en SUCCESS, con job, run ID y SHA identificables. CANCELLED, ausencia de ejecución, checks vacíos o resultados de otro SHA no cuentan como PASS.

### M0-B — Continuidad, admisión y persistencia
Las entradas y snapshots persistidos que incumplen los contratos se rechazan de forma determinista. Los estados inciertos no se convierten en éxito o autorización. Reutilizar las regresiones existentes; no repetirlas sin evidencia nueva que cuestione su cobertura.

### M0-C — Reconstrucción de resultados terminales
La evidencia terminal verificada contradictoria y la identidad/contexto de operación discordantes bloquean la continuación según los contratos existentes y no provocan redispatch por suposición. La aceptación debe citar las pruebas y CI ya existentes en el SHA exacto.

### M0-D — Diario de efectos y recuperación
Los estados desconocidos, la identidad no resoluble y los efectos preparados que requieren reconciliación permanecen bloqueados. Solo los estados terminales expresamente reconocidos por el contrato permiten continuar. La retención no debe borrar estados desconocidos que todavía requieran recuperación.

### M0-E — Autoridad legítima y frontera de efectos protegidos
Demostrar, en la ruta integrada real de Nexo, que la autoridad legítima se obtiene de una raíz/fuente con procedencia verificable, y que los efectos protegidos no pueden eludir esa comprobación. Un campo caller-supplied como `AUTHORIZED`, CI, el teléfono o evidencia autodeclarada no constituye prueba de raíz. La recuperación del propietario no debe depender de que un teléfono concreto sea la autoridad; el dispositivo puede ser canal/evidencia, no autoridad por sí solo.

## Congelar el criterio sin crear alcance infinito

Antes de declarar estos criterios congelados, construir una matriz breve con columnas: criterio, contrato fuente existente, pruebas existentes, evidencia CI por SHA, estado (PASS / FAIL / PENDING / UNKNOWN) y brecha exacta. No crear un nuevo subsistema o requisito solo porque una idea parezca útil. Los criterios se apoyan en contratos existentes y en la misión constitucional acordada; cualquier cambio de alcance requiere justificación explícita y registro.

## Regla de ejecución

1. Leer `NEXO_NCS/STATUS.md`, el handoff más reciente y los informes directamente enlazados.
2. Verificar HEAD real de `ncs-clean-architecture` antes de usar evidencia o modificar runtime.
3. Mapear primero las pruebas existentes a M0-A…M0-E; identificar pruebas ya satisfechas y huecos genuinos. No repetir auditorías cerradas.
4. Si existe una brecha, trabajar solo en la brecha bloqueante de mayor prioridad: contraejemplo reproducible mínimo → prueba adversarial → corrección mínima si procede → CI atribuible al SHA exacto → actualización de informe/STATUS/handoff.
5. No expandir M0 por hallazgos ajenos a los criterios. Registrar los no bloqueantes para una etapa posterior.
6. Declarar M0 cerrado solo cuando todos los criterios finales congelados pasen con evidencia trazable y el estado de la rama evaluada sea conocido. De lo contrario, declarar exactamente cuáles siguen FAIL/PENDING/UNKNOWN; nunca convertir falta de evidencia en PASS.
7. Una vez satisfechos todos los criterios, registrar el cierre de M0 y sus límites. No reabrirlo sin evidencia nueva que invalide una aceptación o un cambio explícito de alcance.

## Inicio del siguiente chat

La secuencia obligatoria es:
`STATUS.md → este criterio de salida → handoff vigente → HEAD actual → evidencia CI del SHA → matriz de aceptación → brecha bloqueante`.

La misión continúa siendo M0. No reiniciar Step 7 ni M1. El objetivo es cerrar M0 mediante un conjunto finito de pruebas demostradas, no investigar para siempre.
