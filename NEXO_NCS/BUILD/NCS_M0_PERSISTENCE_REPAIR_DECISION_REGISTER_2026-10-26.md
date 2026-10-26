# NCS M0 — Registro de decisiones para reparación de persistencia (2026-10-26)

Estado: recomendación técnica no ratificada. No autoriza implementación ni cambia runtime/tests/workflows.

## Hechos observados
- `scripts/simulate.mjs` define `STATE_PATH` como URL `file:` y lo pasa a `persistState()`.
- El test fallido crea `statePath` como cadena nativa absoluta.
- El adaptador de commit exige cadena, mientras `persistState()`, `lockPathFor()` y los temporales usan `.pathname` y además pasan el valor a APIs de filesystem.
- Para una cadena, `.pathname` es `undefined`: hay una incompatibilidad estática confirmada. No demuestra por sí sola la excepción exacta del CI.
- Run `40270739196`, job `121402789784`: test `tests/nexo/conditional-commit-persist-state.test.mjs:88:10`, actual `RECONCILE_REQUIRED`, esperado `SAFE_COMMIT`.

## Recomendación para ratificación del owner

1. **Contrato de ruta:** elegir provisionalmente opción B de la matriz: aceptar cadena nativa o URL `file:` solo en `persistState()`; normalizar una vez al inicio a ruta nativa absoluta; rechazar tipos inválidos, valores vacíos y esquemas no `file:` antes de adquirir locks o tocar archivos.
2. **Adaptador:** mantener `createPersistStateConditionalCommit()` string-only por ahora. No ampliar la API del adaptador como parte de esta reparación.
3. **Rutas relativas:** rechazarlas en la frontera canónica para evitar dependencia implícita de `cwd`.
4. **Identidad de destino:** derivar lectura, revisión, lock, temporal, rename y limpieza de la misma ruta normalizada. Ubicar temporales junto al destino.
5. **Symlinks:** no inventar una política nueva durante el arreglo mínimo; mantener esta decisión explícitamente abierta y probar riesgos antes de cambiar semántica.
6. **Commit desconocido:** nunca convertir `COMMIT.UNKNOWN` en `SAFE_COMMIT`. No relajar la aserción para silenciar el fallo.
7. **Diagnóstico:** capturar `status` y `errorCode` tipados del adaptador, sin snapshot ni datos sensibles de rutas.
8. **Errores secundarios:** probar write, rename, limpieza temporal y release lock; preservar el error primario y no afirmar éxito si el resultado durable no está demostrado.

## Secuencia mínima de validación futura
- Probar ruta absoluta string, URL `file:` equivalente, espacios/caracteres codificados, esquema inválido, tipo inválido y ruta relativa.
- Reproducir el test aislado y observar `status`/`errorCode`.
- Inyectar fallos de escritura, rename, cleanup y release lock; verificar el destino independientemente.
- Ejecutar test aislado y suite CI completa solo después de ratificar el contrato y autorizar implementación.

## Estado
Esta recomendación no sustituye la decisión del owner. Causa exacta del CI sigue `UNKNOWN`; M0 `INCOMPLETO`; D1-IMPLEMENTATION `NO AUTORIZADA`; authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No se ejecutaron pruebas.
