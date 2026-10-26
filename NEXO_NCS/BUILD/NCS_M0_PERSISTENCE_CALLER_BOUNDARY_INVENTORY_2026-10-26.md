# NCS M0 — Inventario de callers y fronteras de persistencia (2026-10-26)

Estado: revisión documental de fuentes; no es una auditoría exhaustiva del repositorio ni una autorización de implementación.

## Anclaje de lectura

- Rama consultada: `ncs-clean-architecture`.
- HEAD observado al iniciar la revisión: `6c4bc757d076857cfe385106d6a734c8c1ee6761`.
- Fuente principal: `scripts/simulate.mjs`.
- Adaptador: `src/nexo/adapters/conditional-commit-persist-state.mjs`.
- Pruebas consultadas: `tests/nexo/conditional-commit-persist-state.test.mjs` y `tests/nexo/simulation-restart-persistence.test.mjs`.
- Contrato/decisión relacionada: [matriz de decisión del contrato de rutas](NCS_M0_PERSISTENCE_PATH_CONTRACT_DECISION_MATRIX_2026-10-26.md).

## Inventario acotado de tipos observados

| Frontera / caller | Forma observada de `statePath` | Evidencia estática | Implicación |
|---|---|---|---|
| `scripts/simulate.mjs` — ruta principal | `STATE_PATH` es URL `file:` | `new URL("../world-state.json", import.meta.url)`; el flujo principal pasa `STATE_PATH` a `loadStateStrict()` y `persistState()`. | La implementación interna que lee/renombra debe aceptar URL o convertirla de forma consistente. |
| `persistState()` | La función recibe el valor del caller sin normalización central visible | `acquireStateLock(statePath)`; `lockPathFor()` concatena `.pathname`; temporal y directorio se derivan también de `.pathname`; `rename(tempPath, statePath)` usa el valor original como destino. | String y URL no se comportan igual. Con string, `.pathname` es indefinido; con URL, `.pathname` puede no representar correctamente una ruta nativa con caracteres codificados. |
| Adaptador de commit condicional | Exige una cadena no vacía | `createPersistStateConditionalCommit()` rechaza `statePath` que no sea string y reenvía ese string a `persistState()`. | Su contrato es más estrecho que los callers URL observados en las pruebas de persistencia. |
| `conditional-commit-persist-state.test.mjs` | Cadena nativa absoluta | Construye `statePath = path.join(tempDir, "world-state.json")`. | Esta prueba cubre el contrato string del adaptador, pero no valida por sí sola la interoperabilidad URL/string. |
| `simulation-restart-persistence.test.mjs` | URL `file:` en varios flujos | Construye `pathToFileURL(path.join(dir, "world-state.json"))` y pasa el resultado a carga/persistencia. | Evidencia directa de uso de URL en los callers de persistencia; incluye directorios temporales. |
| Worker de concurrencia de reinicio | Convierte la URL a pathname para pasar el argumento al proceso hijo | El worker recibe una ruta serializada en argv y el test conserva una URL para el proceso padre. | La frontera entre proceso padre/hijo agrega otra conversión; no demuestra por sí sola que la ruta sea segura para todos los caracteres/OS. |

## Hallazgos y límites

1. **Incompatibilidad de tipos confirmada estáticamente:** el adaptador requiere string, las pruebas de reinicio pasan URL `file:` directamente a `persistState()`, y `persistState()` deriva rutas auxiliares mediante `.pathname`.
2. **La ruta principal usa URL `file:`:** por tanto, la inconsistencia no se limita a un caso de prueba aislado.
3. **El destino y los auxiliares no comparten una normalización explícita:** lock/temporales/directorio se derivan del `.pathname`, mientras que `rename()` recibe el `statePath` original.
4. **La causa exacta del fallo CI sigue UNKNOWN:** el run existente `40270739196` muestra `RECONCILE_REQUIRED` frente a `SAFE_COMMIT`, pero el log consultado no conserva la excepción primaria que permitiría atribuir la falla únicamente a esta incompatibilidad.
5. **No se declara exhaustividad:** este inventario se limita a las fuentes indicadas y a búsquedas de símbolos. No demuestra que todos los callers, scripts, workflows o consumidores indirectos hayan sido identificados.

## Próximo criterio documental

Antes de implementar, ratificar una única política de frontera:
- escoger A (solo ruta nativa string) o B (string y URL `file:` con normalización central) o C (URL interna);
- especificar rutas relativas, URL no-`file:`, espacios/caracteres codificados, enlaces simbólicos y comportamiento multiplataforma;
- garantizar que lock, lectura de revisión, temporal, escritura, rename, limpieza y liberación usan la misma ruta nativa normalizada;
- mantener el adaptador de commit en su contrato explícito y decidir por separado si debe aceptar URL o solo string;
- conservar el error primario si falla cleanup y nunca interpretar una excepción de persistencia como commit confirmado.

## Estado de ejecución

Solo lectura y documentación. No se modificaron runtime, pruebas ni workflows. No se ejecutaron pruebas ni CI. No se ha seleccionado opción A/B/C; D1-IMPLEMENTATION continúa NO AUTORIZADA. M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.
