# NCS M0 — análisis de la cota agregada de recursos
Fecha: 2026-10-22
Estado: ANÁLISIS DE CÓDIGO — presupuesto agregado OPEN; no declara seguridad agregada.

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

**Bloqueo real:** ambos stores generan nombres temporales únicos que incluyen PID, tiempo y secuencia. Los errores manejados limpian el temporal, pero una terminación abrupta del proceso puede dejarlo en disco. Repetidas interrupciones y reinicios pueden dejar varios temporales; el código inspeccionado no impone una cardinalidad máxima a esos residuos ni los reconcilia automáticamente. Por tanto, el disco total no tiene una cota estricta demostrada por los límites actuales.

No se recomienda borrar residuos a ciegas: antes hay que especificar cuándo un temporal es abandonado, cómo se excluye una escritura activa y cómo se conserva la verdad del archivo canónico. El contrato actual no reclama durabilidad ante pérdida de energía.

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

No añadir un semáforo global, cola, wrapper transaccional ni política de limpieza como parche aislado. Primero decidir y especificar dos fronteras coherentes:

1. **Temporales de persistencia:** un protocolo acotado y recuperable que garantice un número máximo de temporales por store, bajo el lock ya existente, y que distinga temporal abandonado de escritura incierta. Evaluar si un nombre temporal estable bajo lock permite resolver la causa raíz sin cambiar el contrato de commit.
2. **Presupuesto de heap operativo:** definir el modo de ejecución soportado para M0 (CLI local de una operación a la vez frente a múltiples operaciones/procesos). Si se requiere concurrencia, establecer un mecanismo explícito de admisión y una cota basada en el ciclo de vida real de los objetos; no inventar un número de heap sin medir/derivar la representación.

Si estas fronteras no se pueden garantizar con los contratos actuales, conservar el estado OPEN y limitar explícitamente el alcance de la afirmación; no fingir una cota.

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
