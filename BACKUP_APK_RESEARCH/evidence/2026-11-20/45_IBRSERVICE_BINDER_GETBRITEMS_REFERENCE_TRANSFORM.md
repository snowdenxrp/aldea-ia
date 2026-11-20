# 45 — IBRService Binder: getBRItems y semántica de referencias

- Fecha de recepción: 2026-11-20
- Fuente: salidas Smali pegadas directamente por el usuario desde Termux.
- Archivos inspeccionados:
  - `IBRService.smali`
  - `IBRService$Stub.smali`
  - `IBRService$Stub$Proxy.smali`
  - `IBRService$Default.smali`
  - `BRService$1.smali`
  - `BRService.smali`
- Clasificación de procedencia: **DIRECT-CHAT**. No se ejecutó el APK ni se verificaron independientemente los archivos locales en este entorno.
- Alcance: consulta Binder `getBRItems()`, despacho, implementación concreta y transformación del arreglo. Investigación estática/solo lectura.

## 1. Interfaz, Stub y Proxy

La interfaz `IBRService` declara `getBRItems()[Lcom/miui/backup/service/BRItem;` y usa el descriptor `com.miui.backup.service.IBRService`.

La extracción compartida confirma:
- Código de transacción de `getBRItems()`: 5 (`0x5`).
- `IBRService$Stub.onTransact()` despacha la llamada a `getBRItems()` y escribe el resultado con `Parcel.writeTypedArray(array, 1)`.
- `IBRService$Stub$Proxy.getBRItems()` ejecuta `transact()` con flags 0, llama `readException()` y reconstruye el resultado con `Parcel.createTypedArray(BRItem.CREATOR)`.
- La llamada es una transacción Binder con respuesta; no es `oneway`.

La clase `IBRService$Default` es una implementación vacía de respaldo: `asBinder()` devuelve null, `getBRItems()` devuelve null, getters enteros devuelven 0 y métodos de control inspeccionados no hacen nada. No es la implementación operativa del servicio.

## 2. Implementación concreta Binder

`BRService$1` declara:

```smali
.class Lcom/miui/backup/service/BRService$1;
.super Lcom/miui/backup/service/IBRService$Stub;
```

Su constructor guarda la instancia `BRService` en `this$0` e inicializa `IBRService$Stub`.

El método `BRService$1.getBRItems()`:
1. recupera `this$0`;
2. invoca `BRService.-$$Nest$mgetBRItems(BRService)`;
3. devuelve el arreglo recibido;
4. captura `Exception`, registra `Exception getBRItems` y lanza una `RuntimeException` que envuelve la excepción.

Esto confirma la delegación desde el Stub concreto al getter privado de `BRService`.

## 3. Getter interno y arreglo exterior

`BRService.getBRItems()` consulta `mBRItems:ArrayList`.

Cuando `mBRItems` no es null:
- crea un arreglo nuevo `BRItem[]` cuyo tamaño es el tamaño actual de la lista;
- recorre `mBRItems` por índice, preservando el orden;
- obtiene cada referencia `BRItem`;
- distingue el caso cuyo `packageName` es exactamente `files_for_backup`.

Por tanto, el contenedor de salida es un arreglo nuevo; eso no significa que todos sus elementos sean objetos nuevos.

## 4. Tratamiento de files_for_backup

Para el elemento cuyo `packageName` es exactamente `files_for_backup`, el getter crea un `BRItem` nuevo usando el constructor por `type` y copia explícitamente:

- `type` (argumento del constructor);
- `feature`;
- `packageName`;
- `totalSize`;
- `completedSize`;
- `transingCompletedSize`;
- `transingTotalSize`;
- `state`;
- `error`;
- `progType`;
- `localFileList`.

En el último campo, el Smali hace `iget-object` de la lista desde el objeto original y `iput-object` en el nuevo objeto. No crea otra `ArrayList`: ambos BRItem comparten la misma referencia de `localFileList` dentro del proceso del servicio.

**Clasificación:** copia superficial selectiva de `BRItem`; no es clonación profunda. `state` y `error` se preservan explícitamente en esta copia especial.

## 5. Tratamiento de los demás elementos

Para cualquier elemento que no cumpla la igualdad exacta con `files_for_backup`, el getter ejecuta directamente `aput-object v2, v0, v1`.

Por tanto, el arreglo recién construido contiene la misma referencia de objeto `BRItem` que estaba en `mBRItems` para esos elementos ordinarios. No se observa copia de esos objetos en esta rama.

## 6. Límite entre referencias locales y Binder

La semántica anterior describe la construcción del resultado dentro de `BRService` antes de la respuesta Binder.

En la ruta Proxy observada, el Stub escribe el arreglo tipado en el Parcel y el Proxy crea un arreglo receptor mediante `BRItem.CREATOR`. Por ello, no debe confundirse la conservación de referencias dentro del proceso de `BRService` con identidad de objeto compartida entre procesos: el recorrido remoto por Proxy/Parcel reconstruye los objetos receptores.

**No determinado todavía:** si el caller concreto de `MiAsistService` en línea física 1606 recibe el servicio a través del Proxy o de una ruta local de `Stub.asInterface()`. La existencia del Proxy y su reconstrucción Parcelable no demuestra por sí sola qué rama tomó ese caller en una ejecución concreta.

La salida compartida muestra que, cuando `mBRItems` es null, el método registra `getBRItems mBRItems is null`. El fragmento recibido no incluye la instrucción de retorno posterior a ese bloque; no se asigna aquí un valor de retorno para ese caso.

## 7. Conclusiones y límites

- **CONFIRMADO EN SALIDA COMPARTIDA:** transacción Binder 5 para `getBRItems()`, despacho mediante Stub y reconstrucción mediante Proxy.
- **CONFIRMADO EN SALIDA COMPARTIDA:** `BRService$1` hereda de `IBRService$Stub` y delega al getter privado de `BRService`.
- **CONFIRMADO EN SALIDA COMPARTIDA:** el getter crea un arreglo exterior nuevo.
- **CONFIRMADO EN SALIDA COMPARTIDA:** `files_for_backup` se copia a un BRItem nuevo con los campos enumerados; `state` y `error` se copian, mientras `localFileList` comparte la referencia original dentro del proceso.
- **CONFIRMADO EN SALIDA COMPARTIDA:** los elementos ordinarios se insertan en el arreglo con sus referencias originales.
- **NO DETERMINADO:** si el caller concreto usa Proxy o interfaz local; tampoco se ha demostrado identidad de objeto compartida a través de procesos.
- **LÍMITE DE PROCEDENCIA:** DIRECT-CHAT; no LOCAL-VERIFIED por relectura/hash independiente.

No se inspeccionaron ni ejecutaron operaciones de backup/restauración, ni se modificó el APK o el dispositivo.

## 8. Siguiente objetivo

Seguir la obtención de `IBRService` por `MiAsistService`: conexión/binding, `onServiceConnected()`, llamada a `IBRService$Stub.asInterface(IBinder)`, asignación a `mBRService` y caller de `getBRItems()`. Determinar si la ruta usa Proxy o interfaz local sin inferirlo solo por la existencia de las clases generadas.
