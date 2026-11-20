# 44 — BRItem: addItem, clasificadores y representación toString

- Fecha de recepción: 2026-11-20
- Fuente: salida Smali pegada directamente por el usuario desde Termux.
- Archivo inspeccionado: `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali`
- Clasificación de procedencia: **DIRECT-CHAT**. El bloque fuente fue compartido en el chat; no se ejecutó ni verificó independientemente en este entorno.
- Alcance: cuatro métodos completos solicitados tras la evidencia 41. No modifica el APK ni realiza ejecución dinámica.

## 1. `addItem(String)`

Descriptor: `addItem(Ljava/lang/String;)V`; declarado `public declared-synchronized`.

Secuencia observada:
1. `monitor-enter p0`.
2. Lee `this.localFileList`.
3. Invoca `ArrayList.add(p1)`.
4. En ruta normal libera monitor y retorna.
5. En `catchall`, captura la excepción, libera monitor y la relanza.

Conclusiones:
- **CONFIRMADO EN SALIDA COMPARTIDA:** el método añade el argumento a `localFileList` y protege esta operación con el monitor de `this`.
- No se observa comprobación de duplicados ni validación explícita de null.
- Esto no demuestra que todos los demás accesos a `localFileList` estén sincronizados, ni que la lista sea thread-safe fuera de este método.
- Si `localFileList` fuera null, el acceso/llamada podría fallar; el método no contiene inicialización ni guardia visible.

## 2. `isInternalFeature()`

Lee exclusivamente `feature:I`. Compara por igualdad con:
- `0x64` = 100
- `0x65` = 101
- `0x66` = 102

Retorna true para esos tres valores y false para cualquier otro entero.

**CONFIRMADO EN SALIDA COMPARTIDA:** conjunto exacto {100, 101, 102}. No permite inferir el significado de negocio de cada feature sin consumidores/constantes adicionales.

## 3. `isMedia()`

Lee exclusivamente `type:I`. Compara por igualdad con:
- 5
- 6
- 7
- 8

Retorna true para esos cuatro valores y false para cualquier otro entero.

**CONFIRMADO EN SALIDA COMPARTIDA:** conjunto exacto {5, 6, 7, 8}. No prueba por sí solo qué formatos o rutas de medios representa cada tipo.

## 4. `toString()`

Reserva un array de 22 elementos (`0x16`) y lo pasa a `String.format`. El formato contiene exactamente estos campos, en este orden:

1. `type`
2. `packageName`
3. `feature`
4. `bakFilePath`
5. `totalSize`
6. `state`
7. `completedSize`
8. `error`
9. `progType`
10. `bakFileSize`
11. `transingCompletedSize`
12. `transingTotalSize`
13. `transingSdCompletedSize`
14. `transingSdTotalSize`
15. `sectionSize`
16. `sendingIndex`
17. `localFileList` (convertida mediante `ArrayList.toString()`)
18. `skipData`
19. `retryCount`
20. `encrypt`
21. `splitApkPath`
22. `splitFileSize`

Detalles:
- `skipData` se convierte a booleano: true únicamente si el entero vale 1; en cualquier otro caso false.
- `encrypt` se convierte a `Boolean`.
- La cadena de formato termina con `\r\n`.
- La salida expone en una cadena campos operativos y potencialmente sensibles: nombre de paquete, rutas, lista de archivos, tamaños, estado, error, tipo de progreso, reintentos y bandera de cifrado.
- `apkSize` y `dataSize` no aparecen en esta representación, en concordancia con las omisiones observadas previamente en constructor de copia y Parcelable. La coincidencia no demuestra que esos campos carezcan de consumidores en todo el APK.

**Límite de interpretación:** `toString()` crea una cadena de diagnóstico/representación. Este método no realiza por sí mismo escritura de log, persistencia ni transmisión Binder. Cualquier destino de la cadena requiere rastrear sus llamadores.

## 5. Síntesis y consecuencias para el siguiente análisis

- Los predicados clasifican independientemente por `feature` y `type`; no hay acoplamiento entre ambos en estos métodos.
- `addItem` sincroniza su propia operación de append, pero no establece una garantía global sobre la lista.
- `toString` incluye `state`, `error` y `progType` juntos, lo que refuerza la necesidad de mantenerlos como campos semánticamente distintos.
- No se ha demostrado que la cadena de `toString` sea usada por Binder ni que los 22 campos correspondan al contrato Parcelable. Son representaciones diferentes.

## 6. Siguiente objetivo

Conectar el contrato Parcelable ya documentado con una ruta Binder concreta:
1. localizar la interfaz `IBRService` y su `Stub` / `Proxy`;
2. identificar transacciones que lean/escriban `BRItem`, `BRItem[]` o listas equivalentes;
3. seguir al menos un caller real desde `MiAsistService` o el servicio relacionado hasta la transacción;
4. registrar descriptor de interfaz, código de transacción, orden de `Parcel` y dirección de llamada.

No repetir el inventario de las 23 posiciones Parcelable. No afirmar transporte Binder efectivo hasta localizar la transacción y el caller. Mantener el análisis estático/solo lectura.
