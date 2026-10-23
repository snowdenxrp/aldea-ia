# NCS M0 — análisis de la cota agregada de recursos
Fecha original: 2026-10-22
Revisión de continuidad: 2026-10-23
Estado: ANÁLISIS DE CÓDIGO ACTUALIZADO — presupuesto agregado OPEN; no declara seguridad agregada.

## Pregunta concreta

¿Los máximos aceptados por documento garantizan por sí solos un máximo total de disco y heap para la instancia local de Nexo?

**No.** Las cotas por store limitan entradas concretas, pero no limitan todos los temporales, copias vivas, procesos concurrentes ni residuos de una interrupción.

## Evidencia de código existente (reutilizada, no nueva investigación externa)

- `src/nexo/core/resource-limits.mjs`: Chronicle 32 MiB serializados; Continuity 16 MiB serializados; lector acotado lee hasta el máximo más un byte antes de decodificar.
- `src/nexo/core/chronicle-store.mjs`: `readDocument` mantiene texto leído y luego parsea JSON; `loadCurrent` devuelve `structuredClone(document.entries)`; `writeDocument` serializa, escribe un archivo temporal y renombra.
- `src/nexo/core/continuity-store.mjs`: `readEnvelope` lee/parsea y valida; `loadCurrent` clona el snapshot; `commitIfCurrent` valida y serializa el candidato antes de escribir; `writeEnvelope` escribe un temporal y renombra.
- `src/nexo/application/chronicle-append.mjs`: una operación preflight lee ambos stores y después abre el propietario de Continuity; el camino de la operación incluye más de una representación del estado en distintas fases.
- Los dos stores tienen locks por archivo, no una cota global de memoria ni un limitador de admisión de operaciones para todo el proceso/dispositivo.

## Disco: cota parcial y fallo de cota estricta

Con ambos archivos canónicos en su máximo y un temporal de escritura por store, el pico de espacio ocupado por esos cuatro archivos sería aproximadamente:

| Archivo | Máximo serializado |
|---|---:|
| Chronicle canónico | 32 MiB |
| Temporal de Chronicle durante reemplazo | 32 MiB |
| Continuity canónico | 16 MiB |
| Temporal de Continuity durante reemplazo | 16 MiB |
| **Subtotal transitorio** | **96 MiB** |

Esto es solo un subtotal derivado, no un presupuesto de disco total. No incluye locks, logs, otros archivos de la aplicación ni temporales huérfanos.

**Corrección tras inspeccionar el HEAD actual (2026-10-23):** la descripción anterior de nombres temporales únicos ya no corresponde al código actual. Tanto `src/nexo/core/chronicle-store.mjs` como `src/nexo/core/continuity-store.mjs` usan el nombre estable `<filePath>.tmp`. Antes de escribir, `removeStaleTemporaryFiles` escanea el directorio bajo el lock existente, con topes de `temporaryDirectoryEntries=10.000` y `staleTemporaryFiles=4.096`; completa el escaneo acotado antes de borrar candidatos. Luego se escribe el temporal estable y se renombra sobre el archivo canónico. Los tests de ambos stores crean explícitamente un temporal estable y uno legacy y verifican que una escritura exitosa no deje temporales coincidentes.

**Qué mejora realmente:** con escritores cooperantes que ejecutan esta versión, el temporal creado por cada store tiene nombre estable y tamaño limitado por el máximo del documento; las interrupciones repetidas no generan una secuencia nueva de nombres temporales del propio código actual. En el caso normal, el subtotal de canónicos + un temporal por store sigue siendo 96 MiB.

**Qué no queda demostrado:** el total de disco aún no tiene una cota global. Puede haber residuos legacy anteriores, entradas ajenas, logs y otros archivos. Si el escaneo supera sus topes, la operación se bloquea antes de borrar o escribir; eso evita una limpieza parcial, pero no reduce el espacio ya ocupado. Tampoco se afirma fsync/durabilidad ante pérdida de energía. No borrar archivos fuera del patrón y protocolo conocidos, ni elevar el subtotal de 96 MiB a una garantía de disco total.

## Heap: por qué no se puede sumar 32 + 16 MiB

Los límites serializados no son equivalentes a memoria residente. Durante una lectura/commit pueden coexistir, por fases:
- chunks de lectura y el texto UTF-8 decodificado;
- el objeto producido por `JSON.parse`;
- una serialización temporal usada para medir el tamaño;
- un snapshot clonado;
- el candidato nuevo y el estado leído para comparar/reconciliar;
- texto/objetos usados por callers que mantienen sus propias referencias.

Los locks por archivo evitan que dos writers cooperantes reemplacen simultáneamente el mismo store, pero no imponen un máximo global a operaciones concurrentes en el mismo proceso. Tampoco limitan la suma de memoria de varios procesos CLI ejecutados a la vez. El tamaño JSON máximo no ofrece por sí solo una cota exacta y comprobada del heap de V8, dado el coste de objetos, strings, arrays y copias.

**Conclusión de heap:** no existe en el runtime inspeccionado una cuota agregada de heap ni un límite de concurrencia global del que se pueda derivar una cifra máxima. No declarar seguro el uso concurrente/multiusuario.

## Decisión arquitectónica recomendada

No añadir un semáforo global, cola, wrapper transaccional ni política de limpieza como parche aislado.

1. **Temporales de persistencia:** el protocolo de nombre estable y limpieza acotada ya existe en el HEAD inspeccionado; no reimplementar esa solución. El trabajo restante es delimitar qué se puede afirmar sobre residuos legacy y sobre el directorio confiable. Si el escaneo alcanza el límite, el resultado conservador es bloqueo, no borrado parcial.
2. **Presupuesto de heap operativo:** los locks son por almacén, no por operación Nexo completa. Chronicle y Continuity pueden ser usados por operaciones/procesos distintos en paralelo. El tamaño JSON limita el documento persistido, pero no ofrece una cota exacta de heap de V8 ni limita el número total de procesos. No inventar un multiplicador de heap.
3. **Decisión pendiente para una garantía de concurrencia:** definir si M0 solo documenta uso local no concurrente (sin afirmar que el runtime lo impone), o si exige enforcement de una sola operación activa que cubra el flujo completo y todos los entrypoints/procesos. La segunda opción necesita una frontera común de instancia/rutas y un contrato explícito; los locks por archivo no pueden fingir que ya lo hacen.

Mientras esa decisión no esté implementada y probada, mantener OPEN el presupuesto agregado de heap y la cota total de disco. La implementación actual sí mejora el número de temporales nuevos por store, pero no demuestra una cota total de recursos del proceso/dispositivo.

## Evidencia ya cerrada y no repetir

CI de código/pruebas `cd9082d8e81bf2fe2c38f849f39de7429d300ea0`:
- [Persistencia determinista](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783628)
- [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783712)
- [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783868)
- [Aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783772)
- [Admisión/continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783802)

Esos resultados prueban los tests de ese SHA, no este análisis documental ni una cota agregada.

## Estado canónico

Perfil individual: aceptado como base y con pruebas de frontera/concurrencia reportadas arriba.
Presupuesto agregado de disco: OPEN.
Presupuesto agregado de heap: OPEN.
M0: `INCOMPLETO`; autorización: `NOT_EVALUATED`; raíz legítima: `PENDING/UNKNOWN`; efectos protegidos: `STOP`.


## Revisión de código vigente — 2026-10-23

La afirmación histórica de temporales únicos queda sustituida por la revisión anterior. Fuentes inspeccionadas en la rama `ncs-clean-architecture`:

- `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`: `removeStaleTemporaryFiles` y `writeDocument` usan temporal estable `.tmp`, limpieza bajo el lock del store y límites de escaneo.
- `src/nexo/core/continuity-store.mjs`, blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`: mismo protocolo para `writeEnvelope`.
- `src/nexo/core/resource-limits.mjs`, blob `98355d5dc8298695233495d4bab2264b3eeba7b3`: máximos de directorio y cantidad de residuos legacy.
- `tests/nexo/chronicle-store.test.mjs` y `tests/nexo/continuity-store.test.mjs`: los tests cubren temporales legacy + estable y su ausencia tras una escritura exitosa.

Esta revisión es documental: no modifica runtime ni vuelve a ejecutar suites cerradas. No se afirma CI nuevo para esta revisión documental. El checkpoint anterior de Continuity (`cd9082d8e81bf2fe2c38f849f39de7429d300ea0`) conserva su evidencia histórica para ese SHA.

## Próxima decisión única

Resolver el modo de concurrencia que M0 soporta y qué garantías se compromete a imponer. No añadir un lock global hasta trazar todos los entrypoints y definir una raíz de instancia común; no aceptar el modo serial como garantía si solo aparece en documentación. Si no se decide enforcement, registrar explícitamente que el heap agregado y el disco total siguen sin cota estricta.
