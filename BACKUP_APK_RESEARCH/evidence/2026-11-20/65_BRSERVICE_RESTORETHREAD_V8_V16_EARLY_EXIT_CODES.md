# Evidencia 65 — BRService$5.run(): condición v8 y códigos de salida v16

- Fecha: 2026-11-20
- Rama documental: `backup-apk-static-research-2026-11-19`
- Fuente: salidas de Termux pegadas directamente por el usuario desde `BRService$5.smali`.
- Clasificación: `USER-PASTED-LOCAL-SMALI / DIRECT-CHAT`; no relectura independiente del archivo ni hash local verificado en esta sesión.
- Alcance: grep de `v8` (todas las coincidencias mostradas), grep de `v16` y bloque físico 1025–1090.
- Método analizado: `BRService$5.run()`, hilo RestoreThread.
- Solo análisis estático; no se ejecutó restore ni se observaron estados runtime.

## 1. Condición que produce v8

La salida directa de `grep -n -C 3 'v8'` mostró:

```smali
if-ne v0, v5, :cond_1
const/4 v8, 0x1
goto :goto_0

:cond_1
const/4 v8, 0x0
```

Coordenadas físicas: 117–124. Por tanto, `v8=1` cuando `v0 == v5`, y `v8=0` cuando son distintos. La identidad semántica de `v0` y `v5` no queda establecida por estos fragmentos; no asignarles significado sin recuperar su definición/carga.

El registro vuelve a ser consultado en las líneas físicas 1051 y 1728 mediante `if-eqz v8`. La salida grep también mostró movimientos de preservación `move/from16 v35, v8` en 1235, 2297, 2364 y 2391, y una restauración `move/from16 v8, v35` en 3807.

## 2. Código v16 = 0x8

El bloque literal 1025–1090 muestra que, después de la comprobación de paquete `com.android.thememanager` y de actualizar `isRestoreTheme` cuando corresponde, se evalúa `v8`:

```smali
:cond_1b
if-eqz v8, :cond_1c

const/16 v4, 0xa
const/16 v16, 0x8

goto/16 :goto_3f
```

Así, cuando `v8 != 0`, se asigna el código entero `0x8` a `v16` y se salta a `:goto_3f`, evitando la ruta normal que sigue en `:cond_1c`. La condición fuente exacta es `v0 == v5`; su significado de dominio sigue pendiente.

## 3. Código v16 = 0x9

El mismo bloque muestra:

```smali
:cond_1c
iget-object v0, v1, Lcom/miui/backup/service/BRService$5;->this$0:Lcom/miui/backup/service/BRService;
invoke-static {v0}, Lcom/miui/backup/service/BRService;->-$$Nest$fgetmIsFlashDriveTask(Lcom/miui/backup/service/BRService;)Z
move-result v0

if-eqz v0, :cond_1d

iget-object v0, v1, Lcom/miui/backup/service/BRService$5;->this$0:Lcom/miui/backup/service/BRService;
invoke-static {v0}, Lcom/miui/backup/service/BRService;->-$$Nest$misUsbAvaliable(Lcom/miui/backup/service/BRService;)Z
move-result v0

if-nez v0, :cond_1d

const/16 v4, 0xa
const/16 v16, 0x9

goto/16 :goto_3f
```

Condición compuesta confirmada: `mIsFlashDriveTask == true` y `isUsbAvaliable() == false`. En ese caso se asigna `v16=0x9` y se salta a `:goto_3f`.

## 4. Usos posteriores observados por grep

La salida directa de `grep -n -C 3 'v16'` mostró:

- 556–558: `v16:v17` recibe inicialmente el `long` de `mTransSingleItemMaxSize` y se pasa a `SysUtils.isStorageSpaceEnough(J)Z`. Es un uso anterior y distinto; no confundirlo con los códigos enteros posteriores.
- 1055 y 1079: asignaciones enteras `0x8` y `0x9`.
- 3828: `move/from16 v16, v2`, otra asignación cuyo valor concreto depende de `v2`.
- 3878: `if-nez v16, :cond_63`.
- 3997–3999: `if-eqz v16, :cond_66` y, si no es cero, `move/from16 v14, v16`.

Estos usos apoyan que `v16` transporta un resultado/código entero hacia la zona de cierre, pero el significado final de cada código y la interacción completa con `v2`, `v14` y `:goto_3f` requieren el bloque literal de esas regiones. No afirmar aún el texto de error ni el estado externo correspondiente a 8 o 9.

## 5. Reconciliación con evidencia anterior

- Evidencias 10, 51, 60 y 61 ya conservaban el mapping de ramas de `mBakFilesType` y advertían que la asignación literal de `v8` no estaba preservada en los fragmentos primarios disponibles.
- La salida directa actual cierra esa brecha concreta: confirma `v8=1` si `v0==v5`, y `v8=0` en caso contrario.
- No resuelve por sí sola qué valor representa `v0` ni cuál `v5`; por tanto, no eleva automáticamente a CONFIRMADO el mapping semántico `mBakFilesType==2`.
- El patrón de códigos `v16=8/9` ya había sido comentado en el análisis histórico del 17-11; esta evidencia consolida la fuente Smali directa y corrige el límite documental, no presenta toda la ruta como descubrimiento nuevo.

## 6. Pendientes delimitados

1. Recuperar la definición/carga de `v0` y `v5` antes de la comparación de las líneas 117–124, solo si es necesario para resolver la semántica de `v8`.
2. Leer `:goto_3f` y las regiones 3815–3905 y 3870–4010 para describir el destino y la propagación exacta de los códigos, sin extrapolar desde grep.
3. No repetir la extracción completa de `run()`; continuar con rangos pequeños y solo cuando el delta lo requiera.

**Estado:** evidencia documental añadida; semántica de `v0/v5`, significado externo de los códigos 8/9 y cierre completo de la propagación permanecen pendientes.
