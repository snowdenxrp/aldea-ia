# NCS M0 — agregado de recursos: límites demostrados y brecha restante

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **ANÁLISIS DE FUENTE; NO IMPLEMENTADO; NO EJECUTADO**

## 1. Propósito

Continuar desde el checkpoint de Open Loops y la matriz D0/D1/D2/D3. Este documento cuantifica únicamente los límites que están expresados en la fuente actual y separa esos límites de las garantías agregadas que aún no existen. No reabre el contrato de Open Loops ni autoriza cambios de runtime/tests/workflows.

## 2. Snapshot de fuente consultado

- `src/nexo/core/resource-limits.mjs` — blob `98355d5dc8298695233495d4bab2264b3eeba7b3`
- `src/nexo/core/continuity-store.mjs` — blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`
- `src/nexo/core/chronicle-store.mjs` — blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`
- `scripts/nexo.mjs` — blob `e471eb478a09aa8a9a8323795583e198cdf0a127`
- `scripts/nexo-chronicle-session.mjs` — blob `30a53de2f108aa255a1dfd61ce78c19788de160b`
- `package.json` — blob `e45dc6d215db53ea2758009cd501f565634e3610`

Los identificadores anteriores son blobs de fuente consultados en la rama, no prueba de ejecución.

## 3. Límites explícitos observados

| Recurso | Límite en fuente | Qué sí significa | Qué no demuestra |
|---|---:|---|---|
| Documento Chronicle | 32 MiB serializados | Se rechaza un documento que exceda el límite al validar/escribir y la lectura usa el lector acotado | Cuota total del directorio ni heap máximo del proceso |
| Documento Continuity | 16 MiB serializados | Se limita el tamaño serializado del snapshot/documento | Tamaño de objetos V8, copias temporales ni suma entre procesos |
| Entradas Chronicle | 10.000 | Máximo de entradas del documento validado | Máximo de memoria real ni costo uniforme por entrada |
| Colecciones Continuity | 10.000 misiones, 20.000 attempts, 20.000 doNotRepeat, 10.000 executions, 20.000 effectJournal | Límites por colección además del tamaño del documento | Presupuesto agregado de todos los objetos/colecciones |
| Entrada stdin | 256 KiB | Acumulación rechazada tras superar ese tamaño | Coste total de buffers/cadenas/resultados derivados |
| Entrada mission preview | 4 MiB | Límite declarado para esa entrada | Cota de heap agregada con un snapshot ya cargado |
| Owner de lock | 4 KiB | Lectura del owner de lock acotada | Cota de número total de locks/archivos |
| Entradas de directorio temporal | 10.000 | Límite para el escaneo temporal correspondiente | Cuota del directorio; el resto de archivos también ocupa disco |
| Temporales obsoletos | 4.096 | Límite de limpieza de temporales obsoletos | Límite de residuos de otros tipos ni espacio total ocupado |

Los documentos persistidos canónicos tienen límites nominales de 16 MiB + 32 MiB = **48 MiB serializados en conjunto**. Esta suma no es un límite de memoria: lectura, decodificación UTF-8, parseo JSON, snapshots, validación, serialización y buffers pueden coexistir en memoria.

## 4. Brecha de memoria agregada

1. El lector acotado lee bloques de hasta 64 KiB y se detiene al superar `maxBytes`; después concatena buffers y decodifica a texto.
2. La fuente luego parsea/valida los documentos y crea objetos JS. En rutas de escritura, la serialización genera representación textual adicional.
3. Los locks actuales son por almacén y no cubren todas las lecturas `loadCurrent()`. Entradas distintas pueden mantener snapshots simultáneos; procesos distintos multiplican la exposición.
4. Por tanto, los límites por documento limitan entrada persistida individual, pero no establecen una cota exacta de heap V8 ni una cota agregada por instancia/proceso.

**No calcular ni inventar un multiplicador fijo de heap** (por ejemplo, 2×/3×/5×) sin una medición reproducible y sin declarar la plataforma/versión Node y el perfil de carga. Una medición empírica no sería por sí sola una garantía dura.

## 5. Brecha de disco agregado

- Los límites de documento y de escaneo temporal no limitan el total de bytes de todos los archivos bajo la raíz.
- La limpieza temporal es acotada; archivos no reconocidos, residuos no cubiertos por el patrón de limpieza, archivos legacy o procesos externos pueden consumir espacio adicional.
- Dos almacenes tienen sus locks y temporales propios. La admisión común aún no existe, por lo que no se puede afirmar un presupuesto agregado exclusivo de instancia.
- No existe evidencia en este análisis de cuota filesystem, reserva de espacio, límite global de archivos ni garantía de espacio disponible durante escritura.

## 6. Conclusión técnica

El estado correcto sigue siendo:

- límites por documento/colección: **EXISTEN EN FUENTE**;
- máximo nominal de los dos documentos canónicos juntos: **48 MiB serializados**;
- cota dura de heap agregado: **NO DEMOSTRADA / OPEN**;
- cuota total de disco de instancia: **NO DEMOSTRADA / OPEN**;
- exclusión de operaciones completas entre entrypoints: **NO IMPLEMENTADA / OPEN**;
- autorización constitucional y efectos protegidos: sin cambio; autorización `NOT_EVALUATED`, raíz legítima `PENDING/UNKNOWN`, efectos `STOP`.

La decisión D2 debe elegir y probar el alcance de admisión antes de hablar de exclusión de snapshots. La decisión sobre cuota dura de disco/heap es separada: un lock por sí solo no crea cuota, y la admisión de raíz no es autoridad.

## 7. Siguiente secuencia recomendada (propuesta, no aprobación)

1. Mantener el análisis D1 como diseño: completar la matriz de callers transitivos contra un snapshot de árbol exacto y enumerar cualquier mecanismo no clasificable como `UNKNOWN/BLOCKED`.
2. Cerrar subdecisiones de D0 sobre raíz, alias/symlinks, inicialización y compatibilidad antes de implementar.
3. Cerrar D2: alcance de sección crítica, orden de locks, timeout, fallos de release y comportamiento del proceso hijo.
4. Tratar presupuesto de heap/disco como garantía distinta. Si el producto necesita cuota dura, especificar mecanismo y fallo seguro por separado; no fingir que el lock resuelve ese problema.
5. Solo después de esas puertas, implementar la API de instancia y las pruebas arquitectónicas/multiproceso; ejecutar CI sobre el SHA exacto de implementación + tests.

## 8. Evidencia de ejecución

No se modificó runtime, tests ni workflows. No se ejecutaron tests ni CI durante esta revisión. Este documento registra análisis de fuente y no cambia el estado constitucional.
