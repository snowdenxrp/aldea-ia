# NCS — Hallazgo de frontera del presupuesto agregado de recursos

Fecha: 2026-10-22  
Rama de trabajo: `ncs-clean-architecture`  
Tipo: análisis de código acotado; **sin cambios de runtime ni ejecución de tests**.

## Conclusión ejecutiva

Los límites por-store ya implementados sí rechazan documentos/entradas fuera de sus topes, y la limpieza de temporales reduce residuos de escrituras cooperantes. Sin embargo, el código actual **no demuestra una cota agregada de heap ni de disco**. No es correcto sumar tamaños JSON como si fueran memoria residente, ni convertir los límites por archivo en una garantía de consumo total.

El bloqueo no se resuelve eligiendo otro número. Falta definir y aplicar el **ámbito operativo al que pertenecería el presupuesto**: un proceso aislado, una instancia de servicio, o varias invocaciones/procesos concurrentes. No se añade ahora un semáforo, cola, wrapper ni límite arbitrario porque eso elegiría arquitectura sin una frontera de admisión definida.

## Evidencia directa del runtime actual

1. `src/nexo/core/resource-limits.mjs`
   - `readUtf8FileBounded` limita la lectura cruda de cada archivo a `maxBytes + 1`, antes de decodificar/parsear.
   - Acumula chunks y después hace `Buffer.concat(...).toString("utf8")`; el parseo JSON y las copias posteriores ocurren además de esos bytes.
   - `serializedUtf8Bytes` mide la representación JSON serializada, no el heap V8 ni la memoria máxima transitoria.
2. `src/nexo/core/chronicle-store.mjs`
   - `loadCurrent` lee/parsea el documento y devuelve `structuredClone(document.entries)`; esa lectura no adquiere el lock de escritura.
   - El lock serializa escritores cooperantes para una ruta; no limita la cantidad de lectores ni la suma de operaciones concurrentes sobre distintas rutas.
3. `src/nexo/core/continuity-store.mjs`
   - `loadCurrent` lee/parsea y luego clona el snapshot.
   - `commitIfCurrent` protege la revisión/escritura cooperante de un store, pero no constituye un presupuesto de heap de proceso ni un presupuesto global entre stores.
4. `scripts/nexo-chronicle-session.mjs`
   - El CLI limita stdin a 256 KiB y luego crea el buffer concatenado y la cadena UTF-8. Este límite protege esa entrada concreta; no limita el número de procesos CLI simultáneos ni el heap total del host.
5. `package.json`
   - `npm test` ejecuta una cadena de pruebas secuencial, lo que describe el runner de tests; no impone una restricción de concurrencia al runtime importado por otras aplicaciones.

## Qué sí está acotado y qué no

| Dominio | Estado demostrable |
|---|---|
| Bytes crudos de una lectura Chronicle/Continuity individual | Acotados por el máximo del documento más el byte centinela, si la ruta usa el helper |
| Tamaño serializado de una escritura por store | Rechazado si excede el límite local |
| Cardinalidad de colecciones Continuity / entradas Chronicle | Límites locales validados |
| Temporales de una escritura cooperante por ruta de store | Un nombre temporal estable; limpieza de temporales estables/heredados coincidentes dentro del lock |
| Heap máximo por operación | No medido ni acotado directamente por los bytes JSON |
| Heap agregado por proceso | No garantizado ante operaciones concurrentes y copias/parseos |
| Heap agregado de host / varios procesos | No garantizado |
| Disco agregado | No garantizado entre documentos, locks, logs, rutas múltiples, residuos no coincidentes ni otros procesos |
| Capacidad multiusuario/concurrente | No declarada ni probada |

## Decisión técnica provisional

- Mantener los topes por-store actuales; no cambiarlos por intuición.
- Mantener **OPEN** el presupuesto agregado de heap/disco.
- No declarar listo un modo de servicio concurrente/multiusuario con base en estas pruebas.
- Antes de introducir enforcement global, decidir el límite operativo que se quiere garantizar y su ámbito real. La solución debe cubrir todas las rutas de admisión relevantes; un contador local a un solo store no bastaría si el proceso puede abrir stores distintos o si hay procesos independientes.
- Si se necesita una garantía dura de memoria del host, debe existir también una frontera externa de aislamiento/capacidad del proceso/entorno. El límite de heap de una operación no es equivalente a una cuota total de memoria residente.
- No conectar esto con autorización constitucional: M0 sigue incompleto y el presupuesto de recursos no habilita efectos protegidos.

## Siguiente tarea concreta

1. Definir, sin inferencia, el modo operativo de M0 que se pretende soportar primero (invocación CLI aislada, proceso persistente de instancia única, o servicio con concurrencia).
2. Para ese modo, derivar una frontera verificable de admisión y un presupuesto de memoria/disco cuyo ámbito sea explícito.
3. Solo entonces elegir el punto único de enforcement o la separación de procesos que sea necesaria, reutilizando locks/contratos existentes y evitando colas/reintentos o capas paralelas por conveniencia.
4. Añadir pruebas de concurrencia en el mismo ámbito de esa garantía y documentar qué no cubren. No declarar el agregado cerrado hasta que la prueba y el límite correspondan a la misma unidad operativa.

## Estado canónico

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
