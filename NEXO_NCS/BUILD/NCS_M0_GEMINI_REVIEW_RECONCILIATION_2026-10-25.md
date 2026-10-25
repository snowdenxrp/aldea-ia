# NCS M0 — reconciliación de la revisión Gemini — 2026-10-25

## Alcance y estatus

Evaluación documental de la respuesta Gemini proporcionada por el propietario en el chat. No es verificación independiente de código nuevo ni aprobación de implementación. Se contrasta con las decisiones ratificadas y con los hallazgos fuente registrados en el manifiesto D1 y el recheck de superficies de ejecución.

## Dictamen

La respuesta es sustancialmente coherente con el estado canónico, pero su recomendación de Opción B no debe convertirse en decisión oficial sin ratificación del propietario. Se conservan las tres opciones como alternativas de diseño hasta que el contrato de fronteras/prohibiciones esté suficientemente definido y el propietario seleccione el corte mínimo.

### Aceptado como coherente con decisiones existentes

- Exigir un único `--root` explícito, sin bootstrap/fallback ambiental implícito en operación normal.
- Validar la raíz de forma independiente en el Chronicle hijo cuando sea ejecutado directamente; no confiar en que heredar argumentos pruebe admisión.
- Sujetar las lecturas persistentes de consultas, previews y Chronicle incluidas en el alcance acordado a admisión; no crear excepción por ser “solo lectura”.
- Mantener `UNKNOWN/BLOCKED` cuando falte evidencia; incertidumbre de liberación de lock no autoriza reintento de negocio ni readmisión automática.
- Preservar la persistencia legítima de memoria de aprendizaje y estado del mundo de Lúmina.
- No hacer migración implícita de `state.nexoMemory`, ni borrado, merge heurístico o dual-write sin una ruta de migración separada y autorizada.

### Correcciones y límites necesarios

1. **Opción B no ratificada.** La inyección de interfaces/guards es una recomendación, no una decisión del propietario. No se debe congelar D1 por preferencia de Gemini. La decisión ratificada exige primero definir fronteras y dependencias prohibidas, y después elegir el refactor mínimo.
2. **Un guard lógico no demuestra aislamiento.** Debe documentarse qué entrypoints públicos llegan a la frontera admitida, qué primitivas son internas/test-only, y qué evidencia impide bypasses. Si el grafo transitorio/dinámico/externo no puede cerrarse, esa afirmación queda `UNKNOWN/BLOCKED`.
3. **Wrapper bloqueado ≠ API inalcanzable.** Las APIs inferiores de stores/owners/reparación deben clasificarse por separado: `PUBLIC/PRODUCTION ENTRYPOINT`, `INTERNAL PRIMITIVE`, `TEST-ONLY`, o `UNKNOWN/BLOCKED`, según evidencia. No declararlas “inalcanzables fuera de admisión” sin prueba de caller reachability.
4. **Argumentos hijo/padre.** Pasar una ruta absoluta `--root` es requisito de diseño, no prueba de que ambas partes canonicalicen de forma idéntica ni de que no existan argumentos contradictorios. Definir contrato de argumentos y propietario de admisión; no introducir un segundo lock ni hacer que el padre retenga un lock no reentrante mientras espera un hijo que necesite ese mismo lock.
5. **Separación Lúmina/Nexo.** El objetivo no es eliminar la persistencia de Lúmina ni imponer aislamiento físico de archivos. El corte debe retirar las operaciones Nexo de los comandos ordinarios de Lúmina sin desactivar sus responsabilidades propias.
6. **D1 vs D2.** D1 define fronteras, entrypoints, argumentos, invariantes y prohibiciones. D2 debe resolver primitiva/propiedad del lock, sección crítica exacta de snapshots, incertidumbre de liberación, timeout/stale y condiciones de readmisión. No declarar resuelto el lock en D1 por el solo uso de UNKNOWN/BLOCKED.

## Matriz de opciones — estatus conservador

- **A — separación de puntos de entrada:** alternativa de diseño. Puede retirar llamadas Nexo de `assistants.mjs` y `simulate.mjs`, pero hay que preservar memoria de aprendizaje y estado del mundo de Lúmina y evaluar flujos que esperaban el registro implícito de misiones.
- **B — interfaces/guards de admisión:** recomendación de Gemini, no ratificada. Necesita prueba de cobertura de todos los entrypoints/callers; un guard en una ruta no protege automáticamente exports de bajo nivel.
- **C — aislamiento físico de archivos:** no seleccionado; no se asume necesario ni queda descartado para siempre. No autoriza reestructuración o implementación.

No se elige ninguna opción en este documento.

## Evidencia que sigue faltando

- Resolución semántica de aristas dinámicas/computadas y consumidores externos que no quedan cubiertos por el barrido de identificadores.
- Clasificación respaldada por fuente de las APIs de store/owner/reparación y sus callers de producción, internos y de prueba.
- Contrato de mapping `--root` → rutas canónicas de stores, validación padre/hijo y rechazo de rutas/banderas contradictorias.
- Evidencia reproducible de que las lecturas persistentes de queries/previews/Chronicle entran por la admisión acordada.
- Más adelante, pruebas adversariales y CI ligadas al SHA exacto, solo tras diseño congelado y autorización de implementación.

La falta de evidencia de ausencia no se interpreta como ausencia. El barrido histórico de 188 archivos no se repite salvo cambio de fuente o evidencia concreta que lo justifique.

## Resultado y continuidad

Esta revisión es documental. No se modificaron runtime, tests, workflows ni datos operativos; no se ejecutaron tests ni CI.

Estado canónico:
- M0: `INCOMPLETO`
- D0 técnico/evidencia: `OPEN`
- D1-DESIGN: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- D2/D3: `OPEN`
- Authorization: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`

Siguiente paso: reconciliar estas clasificaciones con el manifiesto D1 y el registro de decisiones; continuar únicamente con superficies y aristas pendientes, y solicitar ratificación del propietario solo cuando haya una decisión de diseño concreta que no esté ya resuelta. No repetir auditorías cerradas ni presentar diseño como implementación verificada.
