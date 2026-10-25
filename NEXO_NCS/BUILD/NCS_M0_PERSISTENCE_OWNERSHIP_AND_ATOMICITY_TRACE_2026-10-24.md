# NCS M0 — trazado de persistencia assistants/simulate y límites de atomicidad
Fecha: 2026-10-24
Estado: INSPECCIÓN ESTÁTICA — SNAPSHOT FIJADO — NO EJECUTADO

## 1. Snapshot y archivos

Fuente fijada: commit `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.

| Archivo | Blob SHA | Evidencia |
|---|---|---|
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | Lee estado de simulación, abre Continuity Owner, lee/escribe memoria de asistentes y persiste estado de simulación |
| `scripts/simulate.mjs` | `623d316c7a1efd10cc2f06a3080c0d9f06087596` | Carga estado, abre Continuity Owner y persiste el avance del mundo |
| `src/assistants/memory.js` | `fce69ce466e9b033b1c9f654d16beac49a82852c` | Normaliza memoria de aprendizaje y conserva una rama `nexo` con registros y `effectJournal` |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` | Usa stores Nexo específicos de Chronicle y Continuity |

## 2. Rutas de persistencia observadas

### `scripts/assistants.mjs`

1. Define rutas separadas:
   - estado de simulación: `NEXO_STATE_PATH` si está definido, si no la ruta predeterminada usada por el módulo de simulación;
   - memoria de aprendizaje/asistentes: `NEXO_LUMINA_MEMORY_PATH` o `.lumina-assistant-memory.json`;
   - continuidad Nexo: `NEXO_CONTINUITY_PATH` o `.nexo-continuity.json`.
2. Carga el estado de simulación y abre Continuity Owner, pasando `persisted.nexoMemory` como `legacyMemory`.
3. Lee y normaliza la memoria de aprendizaje con `createLearningMemory`; forma un objeto de memoria Nexo desde `continuity.current.snapshot` para construir la misión.
4. Registra la misión mediante `continuity.owner.recordMission`.
5. Escribe la memoria de aprendizaje mediante `fs.writeFile(MEMORY_PATH, ...)`.
6. Después llama a `persistState(STATE_PATH, ...)`.
7. Si se proporciona `--nexo-repair-once`, llama al wrapper de reparación después de esas escrituras.

Por tanto, hay al menos tres almacenes/rutas conceptualmente distintas en este flujo: memoria de aprendizaje de asistentes, estado de simulación y continuidad Nexo. La misión se registra en Continuity antes de que se escriban la memoria de aprendizaje y el estado de simulación. Esas operaciones no forman una única transacción atómica.

### `scripts/simulate.mjs`

1. Lee el estado de simulación (estricto si el archivo existe; con inicialización de simulación si no).
2. Abre Continuity Owner desde `.nexo-continuity.json`, pasando el posible campo legado `state.nexoMemory`.
3. Avanza la simulación y llama a `persistState`.
4. `persistState` adquiere el lock del estado, comprueba la revisión esperada, escribe un archivo temporal y lo renombra sobre el archivo de estado.

El payload de estado escrito por `persistState` incluye versión, revisión, marca de tiempo, mundo, agentes y eventos; el objeto literal inspeccionado no incluye `nexoMemory`. Esto significa que el campo legado no se preserva en esa serialización concreta. No demuestra pérdida de la continuidad actual, que se mantiene en el store separado; sí requiere que la migración/compatibilidad del campo legado tenga un contrato explícito y probado.

## 3. Qué demuestra y qué no

**Demuestra estáticamente:**
- Las rutas de almacenamiento están separadas por función y archivo.
- `assistants.mjs` registra continuidad, luego escribe memoria de aprendizaje y luego estado de simulación.
- La escritura de la memoria de aprendizaje y la escritura del estado no comparten un commit/transacción visible en este flujo.
- `persistState` tiene lock/revisión y escritura temporal-renombrado para el archivo de estado individual; esa protección no convierte la secuencia completa en una transacción multi-store.
- `simulate.mjs` no incluye `nexoMemory` en el payload nuevo observado.

**No demuestra:**
- Que haya ocurrido un fallo parcial en producción.
- Que un efecto protegido sea ejecutable o que se haya producido un bypass.
- Que exista o no un mecanismo adicional de reconciliación en otras capas.
- Que la memoria de aprendizaje y la continuidad Nexo deban compartir almacenamiento. De hecho, su separación puede ser apropiada si sus propietarios y contratos se definen claramente.

## 4. Riesgo de diseño a resolver (sin declarar vulnerabilidad)

El caso de diseño es la consistencia entre tres escrituras independientes: (A) continuidad/registro de misión, (B) memoria de aprendizaje y (C) estado de simulación. Un fallo después de A y antes de B/C puede dejar revisiones desalineadas; un fallo después de B y antes de C puede dejar memoria actualizada con un snapshot de simulación antiguo. Esto es una consecuencia posible del orden estático, no una observación de fallo real.

No propongo añadir una transacción genérica, cola, tombstone, retry ni wrapper. La siguiente fase debe determinar si estos datos deben tener autoridad/vida independiente, si la inconsistencia es aceptable y qué evidencia mínima de reconciliación se exige. La decisión debe documentarse antes de tocar runtime.

## 5. Próximos pasos

1. Inspeccionar `openNexoContinuityOwner` y la migración desde `legacyMemory` para establecer si el campo legado se importa, rechaza o queda ambiguo.
2. Revisar pruebas existentes de migración/restart para localizar qué contrato está efectivamente verificado, sin ejecutarlas.
3. Proponer un criterio de aceptación documental para propiedad, persistencia y recuperación de cada almacén.
4. No editar runtime/tests/workflows ni ejecutar CI sin autorización explícita separada.

## 6. Gates

Solo lectura estática y documentación; sin tests/CI. Runtime, tests, workflows y estado Lúmina no modificados.
M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
