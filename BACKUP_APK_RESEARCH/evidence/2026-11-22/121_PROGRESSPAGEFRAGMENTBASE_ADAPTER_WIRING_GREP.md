# Evidencia 121 — referencias y cableado de ProgressItemAdapter desde ProgressPageFragmentBase — 2026-11-22

**Archivo consultado:** `com/miui/backup/activity/ProgressPageFragmentBase.smali`.

**Comando ejecutado por el usuario:**
```bash
grep -n -A220 'ProgressItemAdapter' "$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase.smali"
```

**Procedencia:** salida pegada directamente por el usuario desde Termux. Clasificación `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; no verificación local independiente ni runtime.

## 1. Extractos originales relevantes recibidos

### 1.1 Declaración de la clase interna y campo adaptador

```smali
10:        Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;,
...
43:.field private mAdapter:Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;
...
139:.method static bridge synthetic -$$Nest$fgetmAdapter(Lcom/miui/backup/activity/ProgressPageFragmentBase;)Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;
...
142:    iget-object p0, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mAdapter:Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;
```

### 1.2 Referencias de initUI() al adaptador (salida física 694–750)

```smali
694:    new-instance v3, Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;
695-
696:    invoke-direct {v3, p0, v4}, Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;-><init>(Lcom/miui/backup/activity/ProgressPageFragmentBase;Landroid/content/Context;)V
697-
698:    iput-object v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mAdapter:Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;
699-
700-    .line 343
701-    iget-object v4, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mLastItems:Ljava/util/ArrayList;
702-
703-    if-nez v4, :cond_9
704-
705-    iget-boolean v4, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mIsViewResult:Z
706-
707-    if-eqz v4, :cond_a
708-
709-    if-eqz v6, :cond_a
710-
711-    .line 344
712-    :cond_9
713:    iput-boolean v7, v3, Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;->isSaveInstance:Z
714-
715-    .line 346
716-    :cond_a
717-    iget-object v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mAdapter:Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;
718-
719:    invoke-virtual {v3, v6}, Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;->initData([Lcom/miui/backup/service/BRItem;)V
720-
721-    const v3, 0x7f0a021f
722-
723-    .line 347
724-    invoke-virtual {p1, v3}, Landroid/view/View;->findViewById(I)Landroid/view/View;
725-
726-    move-result-object v3
727-
728-    check-cast v3, Landroid/widget/ListView;
729-
730-    iput-object v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mListView:Landroid/widget/ListView;
731-
732-    .line 348
733-    iget-object v4, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mAdapter:Lcom/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter;
734-
735-    invoke-virtual {v3, v4}, Landroid/widget/ListView;->setAdapter(Landroid/widget/ListAdapter;)V
736-
737-    .line 349
738-    iget-object v3, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mListView:Landroid/widget/ListView;
739-
740-    new-instance v4, Lcom/miui/backup/activity/ProgressPageFragmentBase$ListScollThread;
741-
742-    new-instance v7, Ljava/lang/ref/WeakReference;
743-
744-    iget-object v9, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mListView:Landroid/widget/ListView;
745-
746-    invoke-direct {v7, v9}, Ljava/lang/ref/WeakReference;-><init>(Ljava/lang/Object;)V
747-
748-    invoke-direct {v4, v7, v6}, Lcom/miui/backup/activity/ProgressPageFragmentBase$ListScollThread;-><init>(Ljava/lang/ref/WeakReference;[Lcom/miui/backup/service/BRItem;)V
749-
750-    invoke-virtual {v3, v4}, Landroid/widget/ListView;->post(Ljava/lang/Runnable;)Z
```

### 1.3 Registros del constructor de ProgressPageFragmentBase visibles en el mismo grep (líneas 315–357)

```smali
315:.method public constructor <init>()V
...
333:    const/4 v1, -0x1
...
336:    iput v1, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->mState:I
...
344:    iput-boolean v0, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->bindSuccess:Z
...
348:    iput-boolean v0, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->isBackup:Z
...
357:    iput-boolean v0, p0, Lcom/miui/backup/activity/ProgressPageFragmentBase;->isFirstInit:Z
```

La salida también incluyó declaraciones de campos, accessors sintéticos bridge y otras referencias al adaptador en el método padre. No incluyó el cuerpo de los métodos internos de `ProgressItemAdapter`.

## 2. Lectura técnica limitada a lo visible

- `initUI()` instancia `ProgressPageFragmentBase$ProgressItemAdapter` con el fragmento y el contexto, y lo guarda en `mAdapter`.
- Antes de `initData(v6)`, asigna `isSaveInstance=true` si se cumple `mLastItems != null`; en caso contrario, solo lo asigna si `mIsViewResult == true` y `v6 != null`. Esta es la lectura literal del flujo de ramas mostrado; no atribuir todavía el significado funcional del flag.
- Pasa el arreglo `v6: BRItem[]` a `ProgressItemAdapter.initData()`.
- Obtiene el `ListView` por ID `0x7f0a021f`, lo almacena en `mListView` y conecta el adaptador mediante `ListView.setAdapter(ListAdapter)`.
- Programa un `ListScollThread` con una `WeakReference` al ListView y el mismo arreglo `v6`; después lo publica con `ListView.post(Runnable)`.
- El constructor del fragmento inicializa `mState=-1`, `bindSuccess=false`, `isBackup=true` e `isFirstInit=true` en las instrucciones visibles. El valor `mState=-1` también concuerda con el valor resuelto en evidencia 120 para el método `initUI()`; no se necesita inferir el valor desde este constructor para la rama de Bundle.

## 3. Dedupe y relación con el expediente

El índice ya contiene evidencias históricas 54 y 67 con resúmenes de `ProgressItemAdapter.initData()`, `getView()`, `updateInfoView()`, estados y porcentajes. También contiene evidencia 71 con coordenadas de accesos a `BRItem.state/error` en el archivo separado del adaptador. Por ello:
- No se vuelve a presentar como hallazgo nuevo la semántica histórica de los estados ni la lógica interna de `getView()`.
- El delta de esta salida es el cableado directo desde `ProgressPageFragmentBase.initUI()`: condición de `isSaveInstance`, llamada concreta `initData(v6)`, conexión del ListView y publicación del hilo de scroll con el mismo arreglo.
- La salida no demuestra los métodos `getView()`, `getCount()`, `getItemViewType()`, ni comparaciones de `state/error` dentro del cuerpo del adaptador.

## 4. Límite y siguiente extracción

El comando buscó `ProgressItemAdapter` dentro de `ProgressPageFragmentBase.smali`, que es el archivo de la clase contenedora. Los hits muestran referencias y llamadas, no el cuerpo de la clase interna. El archivo Smali separado que debe inspeccionarse es:

`$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase\$ProgressItemAdapter.smali`

No afirmar que el cuerpo del adaptador se recibió en este bloque. La siguiente extracción debe dirigirse a ese archivo y conservar encabezados de método y coordenadas físicas. No repetir el grep sobre el archivo padre salvo que se busque otra referencia concreta.

**Estado:** cableado de initUI hacia el adaptador preservado; métodos internos del adaptador no inspeccionados en esta entrega. Investigación estática únicamente.
