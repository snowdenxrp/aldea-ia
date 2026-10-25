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


## 4.1 Aclaración de caller: servicio fail-closed no equivale a migración explícita para el operador

La inspección posterior de `scripts/simulate.mjs` (blob `623d316c7a1efd10cc2f06a3080c0d9f06087596`) precisa un límite importante de la conclusión anterior:

- En `main()`, la ruta ordinaria del simulador calcula si existe `world-state.json`, carga el estado y llama directamente a `openNexoContinuityOwner()`.
- Esa llamada transmite automáticamente `legacyMemory: state.nexoMemory ?? null` y configura `allowEmptyInitialization: !stateExists`.
- Por ello, la regla interna de `continuity-service.mjs` —importar legado solo cuando falta el store Nexo independiente— es condicional y fail-closed frente a ciertos estados, pero el caller actual puede activar esa importación como efecto colateral de una ejecución ordinaria de simulación si el estado cargado contiene memoria heredada.
- Si el archivo del mundo no existe, el mismo caller permite inicialización vacía de Continuity. La inspección estática no demuestra que esa ruta esté autorizada como bootstrap de Nexo, ni que la ausencia del archivo de Lúmina pruebe por sí sola la ausencia de todo estado Nexo anterior.
- `persistState()` omite `nexoMemory` del payload canónico de Lúmina. Esto es coherente con el contrato de separación y las aserciones existentes; no debe revertirse para conservar una copia operativa de Nexo.

### Garantías que faltan en el contrato de caller

1. La operación ordinaria de simulación/Lúmina no abre Continuity, no migra legado y no inicializa un store Nexo.
2. La migración de memoria heredada y el bootstrap vacío tienen entrypoints explícitos separados, con aprobación y criterios propios; no se activan por el mero hecho de ejecutar la simulación.
3. La decisión entre “no existe estado previo” y “estado previo desconocido” se basa en el inventario de estado Nexo relevante, no únicamente en la existencia de `world-state.json`.
4. Los fallos, ausencia o corrupción del store Nexo no alteran ni impiden la persistencia legítima de Lúmina, salvo que un contrato de integración separado y autorizado defina expresamente otra conducta.
5. Los criterios de aceptación prueban ambos lados de la frontera: la persistencia de Lúmina sigue funcionando y la ruta ordinaria de Lúmina no produce efectos persistentes Nexo. Un test de separación del payload por sí solo no prueba ausencia de side effects en el caller.

Esto es una discrepancia de diseño/caller frente al objetivo D1, no evidencia de pérdida de datos ni una vulnerabilidad demostrada. No se propone cambiar código todavía. Deben mantenerse separados el contrato interno de migración, la clasificación del caller y la política de bootstrap/recuperación D2; no se infiere que el diseño de recuperación haya sido ratificado.

