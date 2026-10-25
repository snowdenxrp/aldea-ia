# NCS M0 — verificación estática del contrato de migración y separación de stores
Fecha: 2026-10-24
Estado: FUENTES Y PRUEBAS LEÍDAS; NO EJECUTADAS

## Snapshot fijado

- Commit fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`

## Evidencia adicional que refina el informe de persistencia

### 1. La omisión de `nexoMemory` en el estado de Lúmina es intencional

`tests/nexo/simulation-restart-persistence.test.mjs`, blob `b747ff5df8c91121cbd3f6e2b5c74d4efe5e91f9`, líneas 86–96, contiene aserciones explícitas de que el archivo canónico de estado de Lúmina no serializa `nexoMemory` y que la simulación no debe poseer memoria operacional Nexo.

Por tanto, el informe `NCS_M0_PERSISTENCE_OWNERSHIP_AND_ATOMICITY_TRACE_2026-10-24.md` debe leerse con esta precisión: la ausencia de `nexoMemory` en el payload de `persistState` es consistente con el contrato de separación documentado y comprobado estáticamente en esa prueba; no debe tratarse como una omisión accidental por sí sola.

### 2. Migración a Continuity es explícita y fail-closed

`src/nexo/core/continuity-service.mjs`, blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`, documenta:
- importar memoria legado solo cuando el store Nexo independiente no existe;
- una vez existente, el store separado es la fuente canónica;
- no combinar ni escribir simultáneamente copias legado;
- no crear estado vacío salvo que el llamador haya establecido independientemente que no existe estado previo del mundo.

El flujo inspeccionado implementa esa regla: intenta `store.loadCurrent()`; solo ante `NEXO_CONTINUITY_STORE_NOT_FOUND` proyecta `legacyMemory`, permite snapshot vacío solo con `allowEmptyInitialization === true`, o bloquea con `NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN`. Los errores de corrupción del store canónico no caen silenciosamente a la memoria legado.

### 3. Pruebas existentes caracterizan estas reglas (solo lectura)

`tests/nexo/continuity-migration.test.mjs`, blob `0bef1b93c6268042f14830c97e084d0a543e05f4`, contiene aserciones para:
- migrar registros Nexo y excluir `runs`, `lessons`, `patterns` de Lúmina;
- preferir el store canónico en reapertura, sin fusionar memoria legado desactualizada;
- fallar ante store canónico corrupto, en vez de usar fallback legado;
- rechazar estado previo desconocido sin bootstrap explícito;
- rechazar contexto PREPARED incompleto durante migración.

`tests/nexo/simulation-restart-persistence.test.mjs` además prueba estáticamente la separación del archivo canónico de Lúmina y el store operacional Nexo.

Estas son aserciones presentes en el código de prueba, no resultados de una ejecución actual; no se afirma que CI se haya ejecutado.

## Conclusión ajustada

- Separación de estado canónico de simulación y continuidad operacional Nexo: contrato explícito en el código y pruebas existentes.
- Compatibilidad legado: migración única cuando el store Nexo no existe, con bloqueo ante estado desconocido o contexto PREPARED inválido.
- Sigue pendiente clasificar el archivo `.lumina-assistant-memory.json`/la ruta `NEXO_LUMINA_MEMORY_PATH`, cuyo esquema de aprendizaje de asistentes contiene también una rama `nexo` de compatibilidad. La presencia de esos campos no demuestra que sean la fuente canónica de continuidad actual; el código de migración indica lo contrario una vez existe el store independiente.
- La secuencia de escrituras de `assistants.mjs` (registro de misión Nexo, memoria de aprendizaje, estado de simulación) continúa sin ser una transacción multi-store. La corrección debe centrarse en definir qué inconsistencia es aceptable y qué reconciliación ya existe, no en inventar wrappers/transacciones.
- No se demuestra fallo real, bypass, efecto protegido ni vulnerabilidad.

## Gates

Inspección estática únicamente; pruebas no ejecutadas; runtime/tests/workflows/estado Lúmina sin cambios.
M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
