# Evidencia 31 — IBRService.getBRItems() hacia ProgressItemAdapter: callers y UI

**Fecha:** 2026-11-19  
**Procedencia:** DIRECT-CHAT; salida de grep pegada por el usuario. No LOCAL-VERIFIED por inspección independiente del checkout.  
**Alcance:** solo lectura estática. No se ejecutó Backup/Restore, servicios ni pruebas dinámicas; no se modificó el APK.

## 1. Alcance de la búsqueda

El usuario ejecutó los patrones sobre `"$D"` y `"$D/com/miui/backup"`. Las rutas devueltas pertenecen a:

`/data/data/com.termux/files/home/backup-static/decoded/smali/`

Por tanto, esta salida demuestra cobertura del árbol `smali` usado por `$D`, pero no permite afirmar que `smali_classes2` y `smali_classes3` también quedaran cubiertos por estos comandos.

## 2. Callers de initData

Se encontraron invocaciones a `ProgressItemAdapter.initData([Lcom/miui/backup/service/BRItem;)V` en:

- `ProgressPageFragmentBase$7$2.smali:101`
- `ProgressPageFragmentBase$7$3.smali:105`
- `ProgressPageFragmentBase$7$4.smali:115`
- `ProgressPageFragmentBase$7$1.smali:154` y `:180`
- `ProgressPageFragmentBase$7$5.smali:105`
- `ProgressPageFragmentBase$7$6.smali:113`
- `ProgressPageFragmentBase$7$7.smali:113`
- `ProgressPageFragmentBase.smali:719`

En las clases `$7$2`, `$7$3`, `$7$4`, `$7$5`, `$7$6` y `$7$7`, el grep también encuentra inmediatamente antes de la llamada la invocación Binder `IBRService.getBRItems()[Lcom/miui/backup/service/BRItem;`. En `$7$1` hay dos rutas distintas: una crea un array (`:146`) y otra obtiene el array mediante `IBRService.getBRItems()` (`:176`); ambas llaman initData (`:154`, `:180`).

El método principal `ProgressPageFragmentBase.smali` muestra otra secuencia con arrays y llamada Binder en las líneas 597–719, incluida la llamada a initData en 719. También crea un `ListScollThread` con el array en línea 748.

**Conclusión acotada:** hay varios caminos de inicialización/refresco de la UI. No deben colapsarse en una sola ruta sin leer los cuerpos y el contexto de cada clase interna.

## 3. Exposición del array por el servicio

La salida muestra:

- `BRService.smali:243`: campo `mBRItems:Ljava/util/ArrayList;`.
- `BRService.smali:609–612`: bridge sintético `-$$Nest$fgetmBRItems` que devuelve el campo.
- `BRService.smali:1765–1768`: bridge sintético `-$$Nest$mgetBRItems` que invoca el método privado `getBRItems()`.
- `BRService.smali:6770`: definición de `getBRItems()[Lcom/miui/backup/service/BRItem;`.
- `BRService$1.smali:131`: implementación de `IBRService.getBRItems()`; línea 143 invoca el bridge del servicio.
- `BRService.smali:3492` y `:11027`: escrituras del campo `mBRItems` observadas en el grep.

La misma búsqueda encuentra numerosas lecturas de `mBRItems` en BRService y clases internas, lo cual es compatible con que el servicio mantenga una colección central, pero no sustituye la lectura de los métodos productores.

**Pendiente de lectura:** cuerpo completo de `getBRItems()` (6770 en adelante) para determinar si crea un array nuevo y cómo copia los elementos desde ArrayList; cuerpo de `BRService$1.getBRItems()` (131 en adelante) para cerrar el paso Binder.

## 4. updateSingleItemUI

La búsqueda encontró:

- invocación en `ProgressPageFragmentBase$ProgressItemAdapter.smali:855`;
- definición privada en `:869`;
- segunda invocación en `:2267`.

La salida actual no contiene el cuerpo del método. Evidencia 28 ya había registrado que el método lee `BRItem.error` alrededor de la línea 954; sigue pendiente determinar las ramas exactas y su efecto sobre icono, texto, visibilidad o estado visual. No afirmar todavía que una fila con `state=1,error=1` se muestre como éxito o error.

## 5. Reconciliación provisional de identidad

Sumado a evidencia 27 (ArchiveHelper conserva la referencia BRItem recibida) y evidencia 28 (initData pasa cada elemento al constructor de ProgressItem, que conserva la referencia), esta salida identifica la ruta de obtención del array a través de IBRService.

**Aún no queda demostrado** que el BRItem pasado por `BRService.smali:12918` sea el mismo objeto incluido en el array retornado en el momento relevante, ni que no haya reemplazos/mutaciones intermedias. Para cerrar esa identidad hay que leer el call site del helper, el getter y los métodos que asignan/reemplazan `mBRItems`.

## 6. Siguiente extracción P0

Solicitar fragmentos con rutas exactas, no usar una variable de archivo no verificada:

1. `ProgressPageFragmentBase$ProgressItemAdapter.smali`: líneas 869–1015 y 2250–2280.
2. `BRService.smali`: líneas 6755–6910 (getter y método adyacente).
3. `BRService$1.smali`: líneas 120–165 (implementación Binder).
4. `ProgressPageFragmentBase$7$1.smali`: líneas 130–190 (dos caminos de initData).
5. `ProgressPageFragmentBase.smali`: líneas 580–755 (camino principal y ListScollThread).
6. Después, volver a `BRService.smali:12918` para reconstruir los registros del overload de siete argumentos de ArchiveHelper y la procedencia de BRItem.

No hace falta volver a ejecutar los tres grep ya compartidos. Los rangos anteriores son el siguiente paso de lectura, no afirmaciones sobre contenido aún no recibido.
