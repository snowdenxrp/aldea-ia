# NCS M0 — cross-check contractual D0/D1/D2/D3

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **REVISIÓN DOCUMENTAL — NO CIERRA GATES — SIN IMPLEMENTACIÓN**

## 1. Documentos cruzados

- `NCS_M0_OWNER_DECISION_PACKET_D0_D1_SEQUENCE_2026-10-23.md` — commit de creación `5f9aa9e75864145b13bafdc271131662fadfa7b6`.
- `NCS_M0_D2_D3_CONTRACT_GAP_RECONCILIATION_2026-10-23.md` — commit de creación `9b483a083c2c2b0bfd645caf9e5e77d3572826ef`.
- `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` — sección D3 ampliada, blob actual `bac9493af98c3f86001e323dab153bdee78b5f31`.
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
| Migración | No auto-merge, no dual-write y origen preservado hasta cutover/verificación. | Consistente a nivel de diseño; la propuesta de quiescencia y revalidación de origen ya está incorporada al contrato D3, pero sigue sin aprobarse ni probarse. |

## 3. Hueco D3 tratado documentalmente; sigue abierto como gate

La revisión anterior identificó que los procesos legacy que aceptan `--continuity`/`--chronicle` no participan en el lock de instancia propuesto. Por ello, una copia podía verificarse y aun así quedar obsoleta antes del cutover.

El contrato de raíz ahora incluye la sección 9 con esta propuesta de control:
1. Ventana explícita de quiescencia para writers legacy, incluidos procesos Chronicle invocados directamente, y procedimiento para detenerlos y comprobar que no quedan operaciones activas.
2. Huellas iniciales de hash, tamaño, revisión disponible y ruta resuelta; el dry-run no modifica fuentes ni crea stores.
3. Copia a destino de preparación y verificación de bytes/hash/revisión/semántica.
4. Comparación inmediata de huellas antes del cutover; si una fuente cambia o no puede leerse/validarse, cancelar, preservar ambos lados y reiniciar inventario, sin merge heurístico.
5. Aprobación explícita de cutover; conservar el origen y no hacer dual-write ni borrarlo en el mismo paso.
6. Si la quiescencia no puede garantizarse/detectarse: `UNKNOWN/BLOCKED`.
7. Si el nuevo destino ya recibió escrituras, rollback no copia automáticamente hacia atrás ni fusiona historiales.

Referencia actual del contrato: blob `bac9493af98c3f86001e323dab153bdee78b5f31`, commit `036c877e97475aa1489cc83d70f05c48e7fa8b9f`.

**Resultado del cross-check:** el hueco ya está documentado en el contrato, pero no está cerrado como gate: es una propuesta no aprobada, no hay procedimiento operacional ejecutado ni evidencia de migración. La quiescencia controla procesos cooperantes; no es una barrera frente a procesos locales hostiles.

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
5. Confirmar que la sección 9 de D3 cubre quiescencia y huellas de origen; definir qué evidencia operacional demuestra que no quedan writers activos y cómo se aborta si no puede demostrarse.
6. Cerrar la consistencia documental D0-D3 sobre los blobs exactos; registrar las decisiones aún reservadas al propietario.
7. Solo tras decisiones explícitas, autorizar por separado implementación y tests; ligar logs, jobs y resultados al SHA exacto.

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

Actualizar STATUS y handoff con el hecho de que el riesgo D3 ya fue incorporado al contrato, y enfocar el siguiente análisis en cómo demostrar operacionalmente quiescencia de writers cooperantes y abortar de forma segura. No repetir el censo de código ni implementar.
