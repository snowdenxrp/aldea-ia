# NCS M0 — cross-check contractual D0/D1/D2/D3

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **REVISIÓN DOCUMENTAL — NO CIERRA GATES — SIN IMPLEMENTACIÓN**

## 1. Documentos cruzados

- `NCS_M0_OWNER_DECISION_PACKET_D0_D1_SEQUENCE_2026-10-23.md` — commit de creación `5f9aa9e75864145b13bafdc271131662fadfa7b6`.
- `NCS_M0_D2_D3_CONTRACT_GAP_RECONCILIATION_2026-10-23.md` — commit de creación `9b483a083c2c2b0bfd645caf9e5e77d3572826ef`.
- `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` — blob `22622ad2dff1c231cad31d5c4b7d875758b08958`.
- `NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md` — blob `2b2e16333130e9348e6af777537fa84dfe73e3e7`.
- `NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md` — blob `55573c52533cb9202187588c04a97cecd9b16b99`.
- `NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md` — blob `abec8b1d97e6db64b79a689d113073d2559bfeda`.

Este es un cross-check entre contratos escritos. No se reabrió el censo de código y no se ejecutaron tests/CI.

## 2. Compatibilidades confirmadas

| Tema | Resultado del cruce | Estado |
|---|---|---|
| Raíz de instancia | Todos los documentos la tratan como localizador de persistencia, no autoridad. | Consistente; subcontrato D0 OPEN. |
| Configuración legacy | D0 pide una única configuración sin fallback ambiguo; D1 registra rutas independientes actuales; D3 exige cutover explícito. | Consistente; compatibilidad aún no decidida. |
| Queries y snapshots | D1/D2 recomiendan admisión antes de materializar snapshots si se pretende una garantía agregada de snapshots vivos. | Consistente; D2 debe fijar el final exacto de la sección crítica. |
| Proceso Chronicle hijo | D1/D2 exigen cobertura de invocación directa; si el hijo adquiere lock, el padre no lo conserva durante spawnSync. | Consistente; no implementado. |
| Lock raíz y locks por store | Los contratos conservan los locks por store y reconocen sus diferencias. | Consistente; elegir primitiva raíz separada/compartida sigue OPEN. |
| Repair/dispatch | Todos los contratos separan admisión de autorización y conservan el gate de efectos. | Consistente; no se permite habilitar repair. |
| Recursos | El lock no crea cota exacta de heap ni cuota total de disco. | Consistente; garantías separadas OPEN. |
| Migración | No auto-merge, no dual-write y origen preservado hasta cutover/verificación. | Consistente; detalle de concurrencia durante copia falta (ver §3). |

## 3. Hueco adicional encontrado: escritores legacy durante migración

El plan D3 describe dry-run, copia/verificación, cutover y rollback, pero aún debe definir qué ocurre si un proceso antiguo que acepta `--continuity`/`--chronicle` sigue escribiendo al origen mientras se hace la copia. El lock nuevo de instancia no coordina esos procesos antiguos si no participan en él.

Sin una regla de quiescencia o detección de cambios, puede verificarse una copia que quedó obsoleta antes del cutover y perder las últimas operaciones del origen.

**Propuesta para D3 (no aprobada):**
1. El plan de migración debe declarar una ventana de mantenimiento/quiescencia para todo writer legacy, incluyendo sesiones directas del hijo Chronicle.
2. Antes de copiar, registrar hashes/revisiones/tamaños de los orígenes y confirmar que no hay operaciones legacy activas mediante el procedimiento operacional definido; no inferirlo solo de ausencia del lock nuevo.
3. Después de copiar y validar, volver a leer y comparar la fuente con la huella inicial inmediatamente antes del cutover. Si cambió, cancelar cutover y volver a inventariar; no hacer merge automático.
4. La autorización de cutover debe ser explícita. La copia/verificación no debe desactivar ni borrar la fuente.
5. Si no se puede garantizar quiescencia ni detectar escritores, el resultado de migración queda UNKNOWN/BLOCKED y no se declara completado.

Este control tampoco protege contra un proceso local hostil que ignore el protocolo. Es un control de operación cooperante y debe declararse así.

## 4. Otras decisiones que no deben confundirse

- Canonicalizar `<root>` no impide que los archivos internos de store sean symlinks a rutas externas.
- PID/mtime del owner lock no son identidad criptográfica; stale no debe borrarse automáticamente.
- Una liberación de lock incierta no autoriza retry de negocio ni éxito limpio.
- El rollback tras escrituras en el nuevo destino no puede copiar hacia atrás ni fusionar historias automáticamente.
- Un cierre de D1-DESIGN no equivale a prueba de no-bypass ejecutada; el test de arquitectura requiere autorización separada.
- El cierre documental de D0-D3 no equivale a autorización para editar runtime/tests/workflows.

## 5. Orden de dependencia coherente

1. Decidir D1-S0: separación D1-DESIGN/D1-IMPLEMENTATION o alternativa expresamente aprobada.
2. Congelar D0: interfaz/root, bootstrap, canonicalización/alias y legacy paths.
3. Congelar D1-DESIGN: manifiesto/allowlist/UNKNOWN-BLOCKED y fixtures, sin declarar que el test ya pasó.
4. Congelar D2: alcance de snapshot, ownership padre/hijo, lock, timeout y recuperación.
5. Congelar D3: inventario, quiescencia de writers legacy, copia/verificación, cutover y rollback.
6. Revisión cruzada final, decisión explícita de implementación, cambio coherente, tests/CI en SHA exacto.

Este orden es una recomendación de ingeniería, no una decisión aceptada automáticamente.

## 6. Estado canónico

- D0/D1/D2/D3: `OPEN`.
- M0: `INCOMPLETO`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows: sin cambios.
- Tests/CI: no ejecutados en esta revisión.

## 7. Continuidad

Actualizar STATUS y handoff con el nuevo hueco D3. El siguiente paso es completar la condición de quiescencia/verificación de fuentes legacy en el contrato de migración y revisar el texto, sin volver a censar código ni implementar.
