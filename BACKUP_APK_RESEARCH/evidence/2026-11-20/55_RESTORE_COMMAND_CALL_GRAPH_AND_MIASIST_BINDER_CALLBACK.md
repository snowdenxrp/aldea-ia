# Evidencia 55 — Grafo de llamadas CMD_RESTORE y callbacks Binder MiAsist

- Fecha de consolidación: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: recuperación de mensajes históricos del usuario del 16–17-11-2026; algunos fragmentos se describen como pegados literalmente.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para invocaciones, annotations y descriptores indicados expresamente; RECOVERED-CHAT para el grafo sintetizado; PRIOR-ASSISTANT-OUTPUT para cualquier descripción de rama cuyo Smali literal no se recuperó.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.

## 1. Dos overloads de BRService.startRestoreCommand

Firmas recuperadas:
- `startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,int)`
- `startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,String,int,boolean)`

### 1.1 Overload de cinco argumentos: autoinvocación

El usuario pegó literalmente una instrucción equivalente a:

```smali
invoke-static {p0, p1, p2, p3, p4}, Lcom/miui/backup/service/BRService;->startRestoreCommand(Landroid/content/Context;Ljava/util/ArrayList;Lcom/miui/backup/BackupDescriptor;Ljava/lang/String;I)V
```

La llamada vuelve al overload de cinco argumentos con los mismos cinco registros/parámetros. El historial describe la instrucción como incondicional en el cuerpo mostrado y seguida por retorno; referencia de línea fuente `.line 1087`.

**Lectura estática:** el bloque recuperado es una autoinvocación recursiva directa del mismo overload. Si ese camino se ejecuta tal como está descrito, no alcanza por sí solo una llamada de inicio de servicio posterior dentro de ese método: vuelve a entrar en el mismo overload. No declarar aquí StackOverflow observado ni comportamiento runtime; no se ejecutó la app y no se recuperó el método completo circundante para excluir diferencias de extracción, control previo o instrumentación.

### 1.2 Overload de siete argumentos

El usuario pegó un bloque que indica:
- asigna `p6` a `mIsReStartCommand`;
- construye un Intent explícito hacia BRService con acción `BRService.CMD_RESTORE`;
- incluye `extra_descriptor` y `extra_descriptor_dir`;
- cuando `p6 == false`, añade `extra_britems`;
- añade `extra_zip_file_path` desde `p4`;
- cuando `p5 == 4`, añade `extra_is_from_miasist=true` y transforma el tipo de backup a 3 en `extra_bakfiles_type`;
- llama a `startService()`.

La extracción posterior conservada en evidencia 49 ubica el overload de siete argumentos en BRService.smali alrededor de la línea física 15220 y el de cinco argumentos en 15199–15215. El bloque histórico del 16-11 usa la referencia `.line 1087` para la autoinvocación. No mezclar `.line 1087` con coordenadas físicas del archivo: el primer dato es una directiva de mapeo de fuente, mientras que 15199/15220 se reportaron como posiciones físicas en una extracción posterior. La relación exacta entre versiones de archivo/extracción debe verificarse antes de normalizar coordenadas.

## 2. Callers del overload de cinco y siete argumentos

### 2.1 MiAsistService.startRestoreCommand()

El usuario pegó la invocación al overload de cinco argumentos con:
- Context de MiAsistService;
- lista null;
- descriptor null;
- ruta/string null;
- tipo 4.

La secuencia reportada llama después a `bindBRService()`. Esto conecta la ruta de inicio MiAsist con el overload de cinco argumentos; por la autoinvocación descrita en 1.1, la ruta queda con una anomalía de control pendiente. No inferir que la llamada de siete argumentos ocurra automáticamente después de la de cinco.

Referencia adicional de MiAsistService.smali: llamada a startRestoreCommand alrededor de la línea física 2939 (histórica).

### 2.2 BRService.restoreTransfering()

El usuario pegó literalmente el método `restoreTransfering()` con una llamada al overload de cinco argumentos cuando `brState == 4`. Por tanto:
- `brState==4` es condición reportada para esa invocación;
- la llamada pasa por el overload de cinco argumentos;
- el cuerpo completo y el resto de condiciones de restoreTransfering no se reproducen aquí.

### 2.3 ProgressPageFragmentBase$6

Caller separado reportado:
- `ProgressPageFragmentBase$6` invoca el overload de siete argumentos;
- argumentos descritos: descriptor, directorio, ZIP path, tipo y flag, además de los parámetros Context/lista correspondientes a la firma;
- no se debe confundir esta ruta UI con la ruta MiAsist que llama el overload de cinco argumentos.

### 2.4 RetransferUtils

- `RetransferUtils.smali:154` llama a `restoreTransfering()`.
- Grafo mínimo recuperado: `RetransferUtils → BRService.restoreTransfering() → startRestoreCommand(5 args)` cuando `brState==4`.
- No se conserva en esta evidencia el descriptor completo ni los registros/valores de argumentos de la llamada en RetransferUtils.

## 3. Rama CMD_RESTORE de BRService.onStartCommand

Un resumen de asistente posterior afirmó que la rama `CMD_RESTORE` de `onStartCommand()` lee `extra_is_from_miasist`, `extra_bakfiles_type`, `extra_britems`, descriptor y `mDescriptorPath`. La conversación recuperada no contiene el bloque literal de esa rama; por tanto, esta descripción queda **PRIOR-ASSISTANT-OUTPUT / NO REVALIDATED**. No usarla como prueba primaria ni dar por cerrada la transición entre Intent y ejecución restore.

Anclas históricas de archivo reportadas en una extracción posterior:
- `BRService.onBind()`: alrededor de línea física 18672.
- `BRService.onStartCommand()`: alrededor de línea física 19067.
- `restoreAppData(String,int,int)`: alrededor de línea física 12550; bridge sintético reportado alrededor de 2085.

## 4. MiAsistService$2: conexión Binder a IBRService

El usuario pegó el cuerpo de `MiAsistService$2.onServiceConnected()` y `onServiceDisconnected()`. Hechos recuperados:
- recibe el `IBinder` de la conexión;
- llama a `IBRService$Stub.asInterface()`;
- asigna la interfaz resultante a `MiAsistService.mBRService`;
- llama a `registerBRListener()`;
- al desconectarse, limpia `mBRService` (asignación null);
- logs literales reportados: `"BRService onServiceConnected: "` y `"BRService onServiceDisconnected: "`.

Esto demuestra que el callback convierte el Binder recibido en una referencia IBRService y la guarda. No demuestra por sí solo si `asInterface()` devuelve implementación local o Proxy en la ejecución concreta; depende de `queryLocalInterface()`/Binder y del contexto de procesos. La tabla de transacciones IBRService ya está preservada en evidencias 06/45; no repetirla.

## 5. MiAsistService$6 y $7: anotaciones y límites

### $6
- Annotation/método reportado: `sendAllBRItemsDescriptor()V`.
- El usuario identificó que la clase llama a `doSendFile(...)`.
- En la extracción de MiAsistService, se instancia $6 alrededor de 2036 y se llama `start()` alrededor de 2043.
- Constructor reportado: `(MiAsistService,String)`.
- El cuerpo exacto de la clase no se recupera en este documento; campos, coordinación con iconos y errores de descriptor están ampliados en evidencia 51.

### $7
- Annotation/método reportado: `startLoadAppIconsTask(Context)`.
- El usuario reportó también una llamada a `doSendFile(...)` en esta clase.
- En MiAsistService.smali, creación de $7 alrededor de 2874–2885 y ejecución mediante `executeOnExecutor()`.
- Constructor reportado: `(MiAsistService)`.
- No trasladar a $7 las tareas `loadAppBRItems/loadFileBRItems/updateBakFilePath`, que están atribuidas a $8 en evidencia 49.
- No inferir orden de transferencia, bytes enviados ni que $7 complete el descriptor; faltan cuerpo completo y callers.

## 6. Separación de rutas y conclusiones

El material recuperado apunta a, al menos, dos entradas distintas a restore:
1. MiAsistService → overload 5 args (parámetros null/null/null/4) → autoinvocación recursiva descrita → bindBRService() en la secuencia exterior.
2. ProgressPageFragmentBase$6 → overload 7 args → Intent CMD_RESTORE → startService().

Una tercera ruta es:
3. RetransferUtils → restoreTransfering() → overload 5 args si brState==4.

Estas rutas no deben fusionarse. La ruta de siete argumentos contiene la construcción explícita del Intent; la de cinco argumentos presenta la autoinvocación anómala. La existencia de la ruta UI de siete argumentos no prueba que la ruta MiAsist de cinco argumentos llegue a ella.

## 7. Pendientes de alto valor

1. Verificar en la fuente del repositorio/checkout el descriptor y cuerpo completo de los dos overloads, preservando la directiva `.line 1087` separada de las líneas físicas 15199/15220.
2. Leer `restoreTransfering()` completo y registrar condición `brState==4`, argumentos exactos y acciones posteriores.
3. Leer `ProgressPageFragmentBase$6` completo para fijar los siete argumentos y la semántica del flag.
4. Leer `BRService.onStartCommand()` alrededor de la rama CMD_RESTORE y validar qué extras consume; no reutilizar el resumen de asistente como evidencia.
5. Completar $6/$7 solo si se recuperan bloques nuevos; no repetir annotations/constructores ya preservados.
6. Mantener la distinción de `IBRService.Stub.asInterface()`: callback Binder demostrado; rama local/Proxy no demostrada.
7. Solo lectura estática. No iniciar BRService, no enviar intents, no ejecutar restore ni probar la ruta.

**Conclusión:** se recuperó un grafo de llamadas más preciso y una anomalía crítica: el overload de cinco argumentos se autoinvoca con los mismos parámetros en el bloque descrito, mientras que el overload de siete argumentos construye el Intent CMD_RESTORE. MiAsistService y restoreTransfering usan la variante de cinco argumentos; ProgressPageFragmentBase$6 usa la de siete. La rama CMD_RESTORE de onStartCommand y la ejecución efectiva siguen pendientes de verificación primaria.
