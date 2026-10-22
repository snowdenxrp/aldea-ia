# NCS M0-E — inventario de rutas de entrada y cobertura de límites
Fecha: 2026-10-22
Rama: `ncs-clean-architecture`
Tipo: hallazgo documental basado en inspección del código; no cambia runtime ni declara pruebas nuevas.

## Resultado

La cobertura actual de recursos se aplica principalmente en las fronteras de store y en la entrada stdin del CLI Chronicle. No existe una admisión global compartida por todas las rutas de lectura ni una cota agregada de heap/disco. El perfil local no debe describirse como un límite total por proceso.

## Rutas identificadas

| Ruta | Entrada al recurso | Controles observados | Lo que no demuestra |
|---|---|---|---|
| CLI Chronicle | `scripts/nexo-chronicle-session.mjs` → `runNexoChronicleAppend` | stdin limitado a 256 KiB; validación del contenido en la capa de aplicación; preflight de Chronicle y Continuity; stores aplican límites propios | No limita la cantidad de procesos CLI ni otras llamadas de lectura simultáneas |
| Aplicación Chronicle | `src/nexo/application/chronicle-append.mjs` | Rechaza contenido por encima del límite de entrada antes de crear/usar la operación; crea stores y revisa ambos antes de inicializar o mutar | No es un administrador global de memoria/disco |
| Consultas Continuity | `src/nexo/application/continuity-queries.mjs` | Las funciones consultan a través de `createNexoContinuityStore(...).loadCurrent()` | Las lecturas de consulta no adquieren el lock de escritura como cuota global; pueden coexistir con otras lecturas/procesos |
| Apertura del propietario | `src/nexo/core/continuity-service.mjs` → `openNexoContinuityOwner` | Lee el store; si falta, solo inicializa con fuente legacy o autorización explícita de inicialización vacía; store aplica el contrato de bytes y persistencia | No limita el número de propietarios/lecturas abiertos simultáneamente |
| Runtime owner-backed | `src/nexo/core/owner-backed-runtime.mjs` | Carga el estado a través del owner antes de decidir el paso; acciones no admitidas se bloquean | No es una cuota agregada de lecturas ni de memoria del proceso |
| Acceso directo al store | `src/nexo/core/continuity-store.mjs`, `src/nexo/core/chronicle-store.mjs` | Lectura cruda acotada por documento; validación estructural/cardinalidad/tamaño serializado; locks cooperantes para escrituras sobre la misma ruta | El contrato de store no limita la suma de documentos, rutas, lectores o procesos |

## Qué cubren los límites existentes

- stdin: 256 KiB por invocación CLI, con rechazo cuando se demuestra el exceso.
- Chronicle: entrada individual, cantidad de entradas y documento serializado limitados en el store/capa de aplicación.
- Continuity: cardinalidades de colecciones y envelope serializado limitados; el snapshot candidato sobredimensionado se rechaza antes de adquirir el lock y conserva el archivo previo.
- Lectura raw de cada documento: el helper lee como máximo `maxBytes + 1` para distinguir exceso antes de decodificar/parsear el resto.
- Escritura: los locks por ruta coordinan escritores cooperantes; la prueba concurrente de Continuity confirma una sola revisión ganadora cuando dos candidatos compiten contra la misma revisión.

## Brechas que permanecen

1. **Heap/transitorios:** después de la lectura acotada, el código concatena buffers, decodifica UTF-8, hace `JSON.parse` y puede clonar snapshots. Los bytes serializados no miden heap V8, memoria externa de Buffer ni pico transitorio.
2. **Multiplicidad de lectores:** las consultas y `loadCurrent()` no usan un presupuesto compartido de concurrencia. Varios documentos o lecturas simultáneas pueden multiplicar el coste individual.
3. **Disco agregado:** Chronicle y Continuity tienen límites separados; temporales, locks, logs, otras rutas y otros procesos no quedan incluidos en una cuota total.
4. **Multiproceso:** no se encontró una frontera que prohíba globalmente varias invocaciones CLI. El alcance local no es enforcement de exclusividad.
5. **Confianza del sistema de archivos:** el alcance declarado asume directorios locales de confianza; este inventario no demuestra defensa contra rutas hostiles, symlinks ni escritores que ignoren los locks.

## Conclusión operativa

Para el perfil local actual, reclamar únicamente los límites por entrada/documento/store y las garantías de commit ya probadas. No reclamar límite agregado de memoria o disco, ni servicio concurrente/multiusuario.

No introducir ahora un semáforo, contador global, cola, wrapper o lock adicional: los stores y consultas tienen múltiples entradas y un mecanismo parcial podría crear una falsa garantía. Si el producto necesita una cuota total en el futuro, primero debe especificar la unidad de admisión (proceso, conjunto de stores o instancia), la vida útil del presupuesto y cómo se comparte/recupera entre procesos.

## Estado canónico

- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Este inventario no cierra el presupuesto agregado de heap/disco ni autoriza commissioning o efectos protegidos.
