# Evidencia 120 — normalización de BRItem.state y preparación del adaptador en ProgressPageFragmentBase — 2026-11-22

**Archivo:** `com/miui/backup/activity/ProgressPageFragmentBase.smali`.

**Procedencia:** dos salidas Termux pegadas directamente por el usuario:
- `sed -n '580,700p' "$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase.smali"`
- `sed -n '430,515p' "$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase.smali"`

**Clasificación:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`. Se conserva la salida textual recibida; no se cotejó el archivo local desde este entorno y no es evidencia runtime.

## 1. Fragmento original — continuación 580–700

```smali
:cond_3
:goto_0
if-eqz v3, :cond_8

.line 324
invoke-virtual {v3}, Ljava/util/ArrayList;->size()I

move-result v10

if-lez v10, :cond_8

.line 325
invoke-virtual {v3}, Ljava/util/ArrayList;->size()I

move-result v10

new-array v6, v10, [Lcom/miui/backup/service/BRItem;

.line 326
invoke-virtual {v3, v6}, Ljava/util/ArrayList;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;

move-result-object v3

check-cast v3, [Lcom/miui/backup/service/BRItem;
:try_end_0
.catch Landroid/os/RemoteException; {:try_start_0 .. :try_end_0} :catch_1

.line 327
:try_start_1
array-length v6, v3

:goto_1
if-ge v9, v6, :cond_5

aget-object v10, v3, v9

.line 328
iget v11, v10, Lcom/miui/backup/service/BRItem;->state:I

const/4 v12, 0x6

if-ne v11, v12, :cond_4

.line 329
iput v7, v10, Lcom/miui/backup/service/BRItem;->state:I
:try_end_1
.catch Landroid/os/RemoteException; {:try_start_1 .. :try_end_1} :catch_0

:cond_4
add-int/lit8 v9, v9, 0x1

goto :goto_1

:cond_5
:goto_2
move-object v6, v3

goto :goto_4

:catch_0
move-exception v6

move-object v13, v6

move-object v6, v3

move-object v3, v13

goto :goto_3

.line 333
:cond_6
:try_start_2
iget-object v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mLastItems:Ljava/util/ArrayList;

if-eqz v3, :cond_7

new-array v9, v9, [Lcom/miui/backup/service/BRItem;

.line 334
invoke-virtual {v3, v9}, Ljava/util/ArrayList;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;

move-result-object v3

check-cast v3, [Lcom/miui/backup/service/BRItem;

goto :goto_2

.line 335
:cond_7
iget-object v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mService:Lcom/miui/backup/service/IBRService;

if-eqz v3, :cond_8

.line 336
invoke-interface {v3}, Lcom/miui/backup/service/IBRService;->getBRItems()[Lcom/miui/backup/service/BRItem;

move-result-object v6
:try_end_2
.catch Landroid/os/RemoteException; {:try_start_2 .. :try_end_2} :catch_1

goto :goto_4

:catch_1
move-exception v3

.line 339
:goto_3
invoke-virtual {v3}, Landroid/os/RemoteException;->printStackTrace()V

.line 342
:cond_8
:goto_4
new-instance v3, Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;

invoke-direct {v3, p0, v4}, Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;-><init>(Lcom/miui/backup/activity/ProgressPageFragmentBase;Landroid/content/Context;)V

iput-object v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mAdapter:Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;

.line 343
```

## 2. Fragmento original — inicialización de registros y constantes 430–515

```smali
const-string v0, "mError"

const-string v1, "mStage"

const-string v2, "ProgressPageFragmentBase"

const-string v3, "initUI mState"

.line 303
invoke-virtual {p0}, Lcom/miui/backup/activity/ProgressPageFragmentBase;->getActivity()Landroidx/fragment/app/FragmentActivity;

move-result-object v4

if-eqz v4, :cond_14

invoke-virtual {p0}, Lcom/miui/backup/activity/ProgressPageFragmentBase;->getActivity()Landroidx/fragment/app/FragmentActivity;

move-result-object v4

invoke-virtual {v4}, Landroidx/fragment/app/FragmentActivity;->getIntent()Landroid/content/Intent;

move-result-object v4

if-nez v4, :cond_0

goto/16 :goto_b

.line 306
:cond_0
invoke-virtual {p0}, Lcom/miui/backup/activity/ProgressPageFragmentBase;->getActivity()Landroidx/fragment/app/FragmentActivity;

move-result-object v4

.line 308
invoke-virtual {v4}, Landroid/app/Activity;->getIntent()Landroid/content/Intent;

move-result-object v5

invoke-virtual {v5}, Landroid/content/Intent;->getExtras()Landroid/os/Bundle;

move-result-object v5

const/4 v6, 0x0

const/4 v7, 0x1

const/4 v8, -0x1

.line 310
:try_start_0
new-instance v9, Ljava/lang/StringBuilder;

invoke-direct {v9, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

iget v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mState:I

invoke-virtual {v9, v3}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

invoke-virtual {v9, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

iget v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mStage:I

invoke-virtual {v9, v3}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

invoke-virtual {v9, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

iget v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mError:I

invoke-virtual {v9}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

move-result-object v3

invoke-static {v2, v3}, Lcom/miui/backup/utils/LogUtils;->d(Ljava/lang/String;Ljava/lang/String;)V

.line 311
iget-boolean v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mIsViewResult:Z

const/4 v9, 0x0

if-eqz v3, :cond_6

.line 313
iget v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mState:I
```

## 3. Lectura técnica confirmada

### 3.1 Valor de v7

En el mismo método, antes de la rama que procesa el arreglo, el código asigna:
- `v6 = 0`
- `v7 = 1`
- `v8 = -1`

Por tanto, el `iput v7` del bloque 580–700 escribe literalmente `1` en `BRItem.state`.

### 3.2 Normalización de estado individual

En la ruta que obtiene una lista `v3` no nula y no vacía:
1. obtiene el tamaño;
2. crea un arreglo `BRItem[]`;
3. copia la lista con `ArrayList.toArray()`;
4. recorre el arreglo;
5. lee `BRItem.state`;
6. si el valor es exactamente `6`, escribe `1` en ese mismo campo.

**Conclusión directa:** antes de asignar el arreglo a `v6` y llegar al punto de creación del adaptador, esta ruta normaliza cada `BRItem` con `state==6` a `state=1`. No es solo una lectura o representación visual: existe una escritura efectiva al objeto `BRItem`.

### 3.3 Alcance de la mutación

El código itera el arreglo obtenido mediante `toArray()`. La copia es del arreglo, no una clonación de cada objeto BRItem; los elementos referenciados son los mismos objetos contenidos en la lista. En consecuencia, la asignación al campo `state` modifica los objetos BRItem referenciados, no solamente una estructura de presentación independiente.

La ruta `:cond_6` muestra alternativas con `mLastItems` y `IBRService.getBRItems()`; en el fragmento recibido no se observa que esa ruta ejecute el mismo bucle de normalización. No generalizar la mutación a todas las fuentes/rutas.

### 3.4 Selección de ruta por mState

La ventana 430–515 resuelve los registros locales:
- `v7=1`
- `v8=-1)

En la ventana 510–590 de evidencia 119, la comparación `if-eq v3, v8, :cond_1` significa que la ruta de Bundle `extra_last_britems` se toma cuando `mState == -1`. La ruta distinta de -1 consulta `BRServiceDataHolder.getBrItems()` y, si devuelve null, puede recurrir a `mLastItems`.

Esto resuelve el valor que evidencia 119 había dejado pendiente: `v8` es -1 en este método/flujo.

### 3.5 Límite de la conclusión sobre UI

El fragmento confirma creación e instalación de `ProgressItemAdapter` en `mAdapter`, pero no muestra todavía su constructor completo, el método que enlaza cada fila ni cómo se representa cada estado. No asignar semántica de éxito/error solo a partir de la normalización. El índice ya contiene notas históricas sobre estados y el adaptador; deben cotejarse con el cuerpo directo del adaptador antes de cerrar la interpretación visual.

## 4. Dedupe y relación con el expediente

- Evidencia 119 conserva el receptor parcial y el transporte de lista. Esta evidencia es su continuación y resuelve `v8=-1`, además de documentar la transformación `state 6 → 1`.
- El índice maestro ya contiene información histórica sobre `ProgressItemAdapter` (incluyendo resúmenes de conteo/estados terminales en apartados anteriores). Este bloque no sustituye ni vuelve a declarar esos resúmenes como verificados; el cuerpo directo del adaptador sigue pendiente en el flujo actual.
- El delta nuevo de fuente directa compartida es la escritura en UI/fragmento `BRItem.state=1` condicionada a que el valor previo sea 6, aplicada a los objetos de la lista convertida a arreglo en esta ruta.
- No se observan aquí escrituras a `BRItem.error`, cálculo de éxitos/errores, filtrado por estado ni construcción de las vistas individuales.
- No se observa que `mLastItems` ni la ruta `IBRService.getBRItems()` pasen por el bucle `state 6 → 1` mostrado en la rama principal.

## 5. Continuación

El siguiente objetivo ya indicado en el flujo de trabajo es el cuerpo de `ProgressPageFragmentBase$ProgressItemAdapter`: constructor, `getCount/getItem/getView` o equivalentes y cualquier lectura de `BRItem.state/error`. No repetir las ventanas 430–515, 510–590 ni 580–700 salvo discrepancia concreta.

**Estado:** normalización `6 → 1` confirmada en la ruta del arreglo; significado semántico final y representación por fila siguen abiertos. Investigación estática; no runtime.
