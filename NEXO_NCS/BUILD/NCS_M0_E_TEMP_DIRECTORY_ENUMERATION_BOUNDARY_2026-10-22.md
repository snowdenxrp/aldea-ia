# NCS M0-E — Frontera de enumeración de temporales (2026-10-22)

## Verificación CI

El workflow de persistencia determinista que estaba pendiente terminó en SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853183497. Esto confirma esa ejecución, no que M0 esté completo.

## Hallazgo estático

En `src/nexo/core/continuity-store.mjs` y `src/nexo/core/chronicle-store.mjs`, las lecturas del documento canónico y de `*.lock/owner.json` usan `readUtf8FileBounded`. El owner record está limitado a 4096 bytes y el lector rechaza el exceso al observar el byte centinela.

Ambos stores también tienen `removeStaleTemporaryFiles()`, que ejecuta `readdir(directory, { withFileTypes: true })` y materializa la lista completa del directorio antes de filtrar temporales `.tmp` y `.tmp-*`. El contrato declara que el path y directorio padre son configuración local confiable; no reclama resistencia ante procesos hostiles que controlen el directorio. Por tanto, este hallazgo no prueba un bypass de autoridad ni una vulnerabilidad explotable: identifica consumo de memoria proporcional al número total de entradas del directorio.

## Decisión

No implementar todavía un límite numérico arbitrario. Un recuento posterior a `readdir` no limita la memoria ya consumida. El siguiente paso es definir el comportamiento contractual seguro al alcanzar un límite y evaluar una enumeración incremental (por ejemplo, `opendir`) que no materialice todo el directorio. Debe fallar de forma conservadora, no borrar temporales parcialmente ni tocar el documento canónico, y cubrir adaptadores `fsModule` y directorios con muchos temporales.

No hubo cambios de runtime ni de límites en esta revisión.

## Estado canónico

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
