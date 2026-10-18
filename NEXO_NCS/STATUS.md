# NCS — STATUS / ÚNICA ENTRADA

Fecha: 2026-10-18  
Repositorio: `snowdenxrp/aldea-ia`  
Rama: `ncs-clean-architecture`

## Estado global

**M0: INCOMPLETO.** La migración de continuidad de Nexo está parcialmente implementada. La ruta de ejecución/resultados de `src/nexo/runtime.js` todavía usa funciones de memoria heredadas; no conectar el despacho al propietario de continuidad independiente hasta que exista un contrato de reconciliación y liquidación de efectos respaldado por evidencia independiente.

- **Efectos PREPARED no resueltos:** UNKNOWN; no redispatch ni replan alrededor de ellos.
- **Efectos protegidos:** STOP.
- **STEP 7:** OPEN / STOP / UNKNOWN.
- **Nexo y Lúmina:** mantener separados. No declarar terminada la migración.
- **Dispositivo real:** no se ha realizado ni verificado una migración local del usuario.

## Punto técnico más reciente

1. El adaptador genérico ahora conserva como PREPARED cualquier fallo del manejador sin prueba independiente de ausencia de efecto. Resultado: `EFFECT_OUTCOME_UNKNOWN` si la revisión observada no cambia, `PARTIAL_EFFECT_DETECTED` si cambia.
2. CI exacto PASS en código/pruebas `431978730f3b2be300fa51d3a35938ef6702e607`:
   - [Mission/restart continuity — 39105986623](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623)
   - [Semantic validation — 39105986616](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616)
   - [Outcome classification — 39105986625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625)
3. La inspección de persistencia encontró que el adaptador modifica una simulación en memoria, mientras `world-state.json` y `.nexo-continuity.json` tienen revisiones y commits separados. No existe hoy un protocolo durable conectado de ejecución de efecto + liquidación Nexo.

## Leer y continuar en este orden

1. [Handoff principal de migración M0](BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-18_MIGRATION.md)
2. [Crash cuts de reconciliación del entorno](BUILD/NCS_M0_ENVIRONMENT_RECONCILIATION_CRASH_CUTS_2026-10-18.md)
3. [Matriz de reconciliación por acción](BUILD/NCS_M0_ACTION_RECONCILIATION_CLASSIFICATION_2026-10-18.md)
4. [Checkpoint de fallos ambiguos fail-closed](BUILD/NCS_M0_AMBIGUOUS_HANDLER_FAILURE_FAIL_CLOSED_CHECKPOINT_2026-10-18.md)
5. [Contrato del propietario de continuidad Nexo](BUILD/NCS_M0_NEXO_CONTINUITY_OWNER_CONTRACT_2026-10-18.md)
6. Historial de STATUS preservado en [STATUS_HISTORY_2026-10-18.md](STATUS_HISTORY_2026-10-18.md).

## Próxima tarea obligatoria

Terminar la clasificación de reconciliación para las acciones candidatas idempotentes de reparación y probar los cortes de reinicio contra el estado persistido real. Las acciones no idempotentes deben permanecer UNKNOWN cuando falte evidencia durable específica de la operación. Después, definir el contrato mínimo de liquidación en el propietario Nexo. No integrar aún el runtime con el propietario; no inventar IDs, colas, tombstones, revisión global, reintentos, ni wrappers transaccionales.

## Principio de evidencia

Trigger → ejecución → job → head/pin → artefacto/log bruto → interpretación. Un eslabón faltante significa PENDING/UNKNOWN, nunca PASS supuesto. La documentación y CI no prueban ejecución en el dispositivo real.
