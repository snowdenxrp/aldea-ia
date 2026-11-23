# Evidencia 119 — receptor parcial de resultados en ProgressPageFragmentBase — 2026-11-22

**Archivo/método:** `ProgressPageFragmentBase.smali`; fragmento del flujo que selecciona la lista de BRItem según el estado de la pantalla y el Bundle recibido.

**Procedencia:** salida compartida directamente por el usuario en este chat tras ejecutar:
`sed -n '510,590p' "$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase.smali"`.

**Clasificación:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`. El texto Smali se conserva tal como fue pegado; no se ejecutó ni cotejó independientemente contra el archivo local desde este entorno. No es evidencia runtime.

## 1. Fragmento original recibido

### 1.1 Receptor ProgressPageFragmentBase, ventana solicitada 510–590

```smali
if-eqz v3, :cond_6

.line 313
iget v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mState:I

if-eq v3, v8, :cond_1

.line 314
invoke-static {}, Lcom/miui/backup/bean/BRServiceDataHolder;->getInstance()Lcom/miui/backup/bean/BRServiceDataHolder;

move-result-object v3

invoke-virtual {v3}, Lcom/miui/backup/bean/BRServiceDataHolder;->getBrItems()Ljava/util/ArrayList;

move-result-object v3

if-nez v3, :cond_3

.line 315
iget-object v10, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mLastItems:Ljava/util/ArrayList;

if-eqz v10, :cond_3

move-object v3, v10

goto :goto_0

:cond_1
if-eqz v5, :cond_2

const-string v3, "extra_last_britems"

.line 319
invoke-virtual {v5, v3}, Landroid/os/Bundle;->getParcelableArrayList(Ljava/lang/String;)Ljava/util/ArrayList;

move-result-object v3

.line 320
invoke-virtual {p0}, Lcom/miui/backup/activity/ProgressPageFragmentBase;->getContext()Landroid/content/Context;

move-result-object v10

if-eqz v10, :cond_3

invoke-virtual {p0}, Lcom/miui/backup/activity/ProgressPageFragmentBase;->getContext()Landroid/content/Context;

move-result-object v10

invoke-static {v10}, Lcom/miui/backup/service/BRService;->isServiceWorkingFromPreference(Landroid/content/Context;)Z

move-result v10

if-nez v10, :cond_3

.line 321
invoke-static {}, Lcom/miui/backup/bean/BRServiceDataHolder;->getInstance()Lcom/miui/backup/bean/BRServiceDataHolder;

move-result-object v10

invoke-virtual {v10}, Lcom/miui/backup/bean/BRServiceDataHolder;->getmProgress()I

move-result v10

iput v10, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mProgress:I

goto :goto_0

:cond_2
move-object v3, v6

:cond_3
:goto_0
if-eqz v3, :cond_8

.line 324
invoke-virtual {v3}, Ljava/util/ArrayList;->size()I

move-result v10

if-lez v10, :cond_8
```

### 1.2 Implementación de clearLocalFiles, ventana solicitada 3970–4070

```smali
.line 1162
invoke-static {p0, v0, v1, v0}, Lcom/miui/backup/service/BRService;->setWorkingPreference(Landroid/content/Context;III)V

return-void

.end method

.method private clearLocalFiles(Ljava/util/ArrayList;)V
.locals 3
.annotation system Ldalvik/annotation/Signature;
value = {
"(",
"Ljava/util/ArrayList<",
"Lcom/miui/backup/service/BRItem;",
">;)V"
}
.end annotation

if-nez p1, :cond_0

return-void

.line 4975
:cond_0
invoke-virtual {p1}, Ljava/util/ArrayList;->iterator()Ljava/util/Iterator;

move-result-object p1

:cond_1
:goto_0
invoke-interface {p1}, Ljava/util/Iterator;->hasNext()Z

move-result v0

if-eqz v0, :cond_2

invoke-interface {p1}, Ljava/util/Iterator;->next()Ljava/lang/Object;

move-result-object v0

check-cast v0, Lcom/miui/backup/service/BRItem;

const-string v1, "files_for_backup"

.line 4976
iget-object v2, v0, Lcom/miui/backup/service/BRItem;->packageName:Ljava/lang/String;

invoke-virtual {v1, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

move-result v1

if-eqz v1, :cond_1

iget-object v1, v0, Lcom/miui/backup/service/BRItem;->localFileList:Ljava/util/ArrayList;

invoke-virtual {v1}, Ljava/util/ArrayList;->size()I

move-result v1

if-lez v1, :cond_1

.line 4977
iget-object v0, v0, Lcom/miui/backup/service/BRItem;->localFileList:Ljava/util/ArrayList;

invoke-virtual {v0}, Ljava/util/ArrayList;->clear()V

goto :goto_0

:cond_2
return-void

.end method
```

## 2. Lectura técnica del receptor — solo lo visible en esta ventana

El fragmento contiene dos rutas de selección de la lista:

1. **Cuando `mState != v8`:** obtiene el singleton `BRServiceDataHolder`, consulta `getBrItems()` y usa ese resultado si no es null. Si `getBrItems()` es null y `mLastItems` no es null, asigna `mLastItems` a `v3`. El valor concreto de `v8` no está resuelto en este fragmento.
2. **Cuando `mState == v8`:** si `v5` (Bundle en el contexto del bloque) no es null, recupera la clave literal `extra_last_britems` mediante `Bundle.getParcelableArrayList(String)` y asigna el resultado a `v3`. Si `v5` es null, la rama `:cond_2` asigna `v6` a `v3`.

En la ruta del Bundle, el fragmento consulta el contexto y `BRService.isServiceWorkingFromPreference(context)`. Si el contexto existe y el servicio no está marcado como trabajando, lee `BRServiceDataHolder.getmProgress()` y lo asigna a `ProgressPageFragmentBase.mProgress`. Si el contexto es null o el servicio sigue trabajando, salta a `:cond_3` sin esa actualización de progreso.

Las rutas convergen en `:goto_0`: comprueba si `v3` es null y, si no lo es, obtiene su tamaño y comprueba si es mayor que cero. El bloque termina antes de mostrar qué procesamiento sigue a esa comprobación.

## 3. Dedupe y relación con evidencias anteriores

- **clearLocalFiles:** el comportamiento ya estaba resumido en evidencias 116 y 118 y en el índice. Este bloque directo corrobora el resumen: null retorna; itera; filtra por `packageName == "files_for_backup"`; limpia solo `localFileList` si no está vacía. No es un writer nuevo de `BRItem.state` ni `BRItem.error`, ni elimina el BRItem. Se conserva aquí el texto fuente recibido para trazabilidad; no se cuenta como hallazgo conceptual duplicado.
- **Transporte desde BRService:** evidencias 114–118 ya preservan que `showFinishNotification()` agrega `extra_last_britems` después de `clearLocalFiles(p4)` cuando `p4 != null`. Evidencia 119 no vuelve a contar ese transporte como descubrimiento nuevo.
- **Delta nuevo de esta salida:** se conserva el cuerpo parcial del consumidor y la bifurcación entre `BRServiceDataHolder.getBrItems()`, `mLastItems`, el Bundle `extra_last_britems` y `v6`; además, la actualización condicional de `mProgress` desde `BRServiceDataHolder.getmProgress()` y la comprobación de null/tamaño de la lista.
- La referencia histórica a la recuperación del extra en la línea física 541 queda complementada por el cuerpo compartido en esta ventana. No confundir directivas `.line 319–324` con coordenadas físicas.

## 4. Límites y continuación

- No se conserva aquí el encabezado `.method` del método contenedor; la ventana comienza dentro de un método.
- No se conoce el valor de `v8`, ni se debe asignar un estado semántico a esa comparación.
- Los significados de `v5` y `v6` se describen únicamente por el uso visible en este fragmento; no inferir su origen fuera de la ventana.
- No se ha visto aún el código posterior a `if-lez v10, :cond_8`; por tanto, no afirmar almacenamiento definitivo, filtrado, recorrido, modificación o representación UI de cada BRItem.
- No se observan escrituras a `BRItem.state` ni `BRItem.error` en esta ventana.
- El siguiente fragmento ya solicitado por el flujo de trabajo es la continuación física 580–700 del mismo archivo. Debe analizarse como continuación, sin repetir la extracción 510–590.

**Estado:** fragmento receptor parcial preservado; el procesamiento posterior de la lista y la presentación de resultados permanecen abiertos. Investigación estática únicamente.
