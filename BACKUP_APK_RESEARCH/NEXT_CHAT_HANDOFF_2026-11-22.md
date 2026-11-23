# Handoff de continuidad — Investigación estática MIUI Backup.apk — 2026-11-22

**Propósito:** permitir que el siguiente chat continúe sin perder contexto, sin depender de la memoria conversacional y sin repetir trabajo ya realizado.

## Fuente de verdad y repositorio

- Repositorio: `snowdenxrp/aldea-ia`.
- Rama de trabajo: `backup-apk-static-research-2026-11-19`.
- Índice maestro: `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`.
- Última versión del índice verificada al actualizar este handoff: 1.22.
- Commit del índice v1.11 verificado antes de esta actualización: `9f89d32e4e7239a440ba813d488b97d1b7187d3b`.
- HEAD de rama verificado antes de esta actualización del handoff: `3500f7b5776b867d95787278c69dba1afcb42669`.
- Árbol local de trabajo referido por el usuario: `$HOME/backup-static/decoded`.
- APK investigado: MIUI `Backup.apk`; SHA-256 histórico registrado en el expediente: `36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae`. No recalcular salvo necesidad.

**Regla absoluta:** GitHub y los archivos del expediente son la fuente de verdad. La memoria del asistente y los resúmenes de chat solo ayudan a localizar información; nunca sustituyen la verificación documental.

## Protocolo obligatorio antes de continuar

1. Recuperar el estado real de GitHub: rama, HEAD, índice maestro y evidencias relacionadas.
2. Consultar el índice maestro y las evidencias antes de pedir al usuario que repita algo o antes de ejecutar un comando.
3. Usar el índice histórico de títulos de chats (evidencias 95 y 109) para identificar conversaciones anteriores pertinentes. Si el contenido del chat no está disponible, decirlo claramente; no inventar lo que contenía.
4. Comparar cada posible hallazgo con el expediente para detectar duplicados.
5. No volver a ejecutar comandos, extracciones Smali, búsquedas grep ni análisis ya completados, salvo que exista una discrepancia concreta, falte evidencia primaria necesaria o la pregunta nueva requiera un dato no preservado.
6. Clasificar la procedencia con precisión: `LOCAL-VERIFIED`, `RECOVERED-CHAT`, `USER-PROVIDED`, `PROPOSAL`, `UNKNOWN`, etc. Un resumen de chat no se eleva a evidencia local verificada.
7. Todo delta nuevo y verificable se guarda en GitHub: archivo de evidencia, actualización del índice maestro y commit. Después volver a leer los archivos y verificar SHA/contenido/commit antes de afirmar que quedó guardado.
8. No depender de memoria persistente ni dejar continuidad importante únicamente en el chat. Actualizar este handoff o crear uno nuevo cuando cambie materialmente el estado.

## Estado documental al 2026-11-22

- Evidencias 106 y 107 están en el expediente:
  - 106: cierre de `CMD_RESTORE` en `BRService.onStartCommand`, incluida la rama vacía que llama `setState(mState, 0xC, 0x6)`.
  - 107: receptor `setState(III)V` / `setState(IIII)V`, mapeo de parámetros, escritura condicional de `mLastError` y propagación a `BRItem`.
- Evidencia 108 conserva el resumen histórico de `abortBackupAndRestore(I)V`: constructor `mLastError=0`; el método conserva `p1` solo si el campo sigue en cero; la sobrecarga sin argumentos llama con 3; las rutas directas resumidas aportan 7 en transferencia/espera de conexión. Está clasificada `RECOVERED-CHAT / USER-PASTED-SUMMARY`, no `LOCAL-VERIFIED`.
- Evidencia 109 conserva la lista consolidada de 40 títulos de chats transcritos de tres capturas, como índice de navegación, no como evidencia técnica.
- Evidencia 111 conserva cuatro SHA-256 y tamaños reportados para `BRService$5.smali`, `BRService.smali`, `BRService$FakeBackupListenerImp.smali` y `MiAsistService.smali`. Procedencia `USER-FACT / RECOVERED-CHAT` del 2026-11-19; no se recuperó stdout íntegro ni se recalcularon en esta sesión. Consultar la evidencia para los valores completos; no etiquetarlos como verificación local actual.
- Evidencia 112 conserva seis coordenadas físicas adicionales reportadas para `BRService$5.smali`: 2547, 2707, 3225, 3463, 3691 y 3801. Solo son anclas `RECOVERED-CHAT`; no asignar método, campo, valor ni condición. La lista completa y los duplicados excluidos están en la evidencia.
- Evidencia 113 conserva las coordenadas físicas 121 (`state`) y 123 (`error`) de `BRItem(BRItem)`, recuperadas de chat del 2026-11-20T04:41:25Z. La semántica de copia ya constaba en evidencia 41; 113 añade únicamente las coordenadas, no writers funcionales nuevos.
- Evidencia 114 conserva el resumen del transporte de resultado en `showFinishNotification(IIILjava/util/ArrayList;)V` y la notificación ID `0x7f120037`; su limitación sobre nombres literales fue complementada por evidencia 115.
- Evidencia 115 recupera de mensajes del usuario del 2026-11-19T19:30:56Z y 19:31:46Z los extras literales `extra_last_task_state=p1`, `extra_last_workingstage=p2`, `extra_last_errcode=p3`, acción `com.miui.backup.activity.ACTION_VIEW_BRRESULT`, `localBackup=mIsFlashDriveTask xor v0`, `extra_last_britems=p4` tras `clearLocalFiles`, y el literal `SHOULDN'T RESOLVE!`. Coordenadas reportadas: bloque 14394–14574; continuación workingstage 14577–14580 y errcode 14582–14585. No se recuperó método completo ni definición de `v0`.
- Auditoría adversarial: la memoria confirma que el usuario pegó los fragmentos A–D literales de `startRestoreCommand` el 2026-11-17T03:27:35Z, pero la búsqueda actual no recuperó el payload. Evidencia 94 fue anotada; no reconstruir A–D desde resúmenes. El mensaje de 03:29:25Z contenía una salida parcial de `CMD_RESTORE`, cuya continuación posterior ya está en evidencia 94.
- El stdout completo del barrido global `BRItem.state/error` del 2026-11-19T22:37:46Z no se recuperó; una conversación del 2026-11-20 confirma que ese stdout no estaba en la memoria disponible. No sintetizar coincidencias desde resúmenes parciales.
- El índice maestro fue actualizado a v1.18. Las evidencias 111–115 conservan hashes/tamaños reportados, coordenadas adicionales de `BRService$5`, coordenadas de copia `BRItem` y detalles de transporte/notificación; su cotejo local sigue pendiente.

## Interpretación técnica conservadora de mLastError

- `setState(mState, 0xC, 0x6)`: por evidencia 107, `0xC` llega como `p2` y se asigna a `mWorkingStage`; `0x6` llega como `p4` y solo inicializa `mLastError` si su valor previo es cero.
- `abortBackupAndRestore(I)V`: según resumen recuperado en evidencia 108, también puede establecer `mLastError` si todavía vale cero.
- Las llamadas resumidas conocidas a `abortBackupAndRestore(I)V` aportan 3 y 7, no 6.
- Por tanto, no afirmar que el 6 termina almacenado: depende del valor previo de `mLastError` y del orden de las rutas.
- Mantener separados `mLastError`, `mWorkingStage`, `BRItem.state` y `BRItem.error`. No asignar significado semántico a 6/9 sin evidencia.
- No repetir las extracciones de las ventanas físicas 1590–1630, 8035–8080 y 13730–13775 solo para reconstruir lo ya resumido. Buscar primero si existe stdout literal en los chats/expediente.

## Índice de chats proporcionado por el usuario

Lista consolidada de títulos (40 entradas), útil para localizar trabajo previo. Los títulos truncados se mantienen literalmente; no inventar terminaciones:

1. Continuar investigación estática
2. Continuidad del análisis APK
3. Continuar investigación pendie...
4. Revisar referencias v8
5. Reconciliar Binder y procesos
6. Analizar implementación Binder
7. Consolidar investigación GitHub
8. Extraer métodos Parcelable
9. Verificar y guardar investigación
10. Reconstruir flujo BRService
11. Analizar unzipFiles
12. Verifica y guarda en Github
13. Inventario global smali
14. Extracción método smali
15. Inventario de estados smali
16. Inventario global de escrituras
17. Reconstruir Backupapk Histórica
18. Traducción de códigos
19. Análisis de estados BRItem
20. Inspeccionar Flujo Smali
21. Repetir comando grep
22. Resolver estado v3
23. Rastrear estados 6 7 8
24. New chat
25. Analizar ProgressItemAdapter
26. Opinión sobre FreeLLMAPI
27. Identificar procesador laptop
28. Análisis de finalización de tare...
29. Análisis de copia local
30. Analizar preparación restauraci...
31. Revisar flujo de restauración
32. Analizar finalización restauraci...
33. Restaurar variable F
34. Análisis de restauración
35. Extracción estática de activaci...
36. Análisis de restauración Android
37. Análisis estático Binder
38. Continuar análisis estático
39. Analizar Backup.apk
40. Continuar investigación G08

La evidencia 95 conserva una lista anterior y la 109 la amplía. Antes de volver a pedir al usuario datos ya compartidos, consultar ambas y el índice maestro.

## Próximo punto de continuación

Antes de extraer nada, comprobar si el usuario necesita cotejar los cuatro hashes/tamaños de evidencia 111 o inspeccionar las seis coordenadas nuevas de evidencia 112 o cotejar las coordenadas 121/123 de evidencia 113; no recalcular ni extraer por rutina. Continuar el análisis causal de `mLastError` solo después de buscar en las conversaciones anteriores y en GitHub si ya está preservada la salida Smali literal de constructor, `abortBackupAndRestore(I)V` y sus sitios de llamada. No ejecutar de nuevo las extracciones si el material ya existe. Si la salida literal no puede recuperarse, conservar la limitación como `RECOVERED-CHAT` y preguntar al usuario únicamente si una cuestión nueva exige ese cotejo.

## Restricciones de trabajo

- Investigación estática; no ejecutar restauraciones, pruebas runtime ni modificar el APK.
- No cambiar de rama ni hacer cambios ajenos al alcance sin autorización.
- No declarar un hallazgo guardado sin commit y verificación posterior.
- Evitar duplicar evidencias; preservar solo deltas nuevos.

## Auditoría adversarial de memoria persistente — 2026-11-22

Se realizó una búsqueda dirigida de recuerdos y resúmenes históricos posteriores a la consolidación v1.13. El cotejo se hizo contra el índice maestro y las evidencias vigentes; este apartado registra resultados de deduplicación y límites, no crea evidencia técnica nueva.

### Candidatos recuperados y reconciliación

- **Barrido global `BRItem.state/error` (chat 2026-11-19T22:36–22:39Z):** un resumen histórico de salida grep enumeraba `ArchiveHelper.smali:1741`, `CompatibilityActivity$1.smali:144/152`, `ProgressPageFragmentBase.smali:625`, `BRService$6.smali:1557/2101/2128/2495` y `BRService$7.smali:53/58`. Ya están reconciliados en las secciones/evidencias 70, 76 y 77; no duplicar. En particular, `ArchiveHelper:1741` se reconcilió con el writer `error=1` de evidencia 27; `ProgressPageFragmentBase:625` conserva ambigüedad entre coordenada física y directiva `.line`.
- **Propagaciones en `BRService.smali`:** los resúmenes citan `6855–6862` (copia entre objetos), `7004/7009` y `17431–17436` (propagación `PkgInfo.state/error` a `BRItem`). El índice ya conserva `6855–6857` como resumen de menor procedencia y las referencias 7004/7009 y 17431–17436 en la sección 46. No extender el rango 6855–6857 hasta 6862 ni atribuir semántica adicional sin el bloque Smali literal.
- **`BRService$6` lectura en 1877:** un resumen previo la describía como `iget ...->error:I`; el índice ya registra la lectura reportada en 1877 y la lectura de 2518 (sección 83). No es una definición de `v8` ni resuelve el valor escrito en `error` en 2101.
- **Rama de `BRService$6` 2110–2128:** el bloque histórico recuperado indica que `equals()` verdadero conserva `state` y falso asigna 1. Ya está documentado en evidencia 82; no identificar la cadena comparada como `files_for_backup` sin recuperar su definición.
- **`startRestoreCommand` (5 y 7 argumentos):** los resúmenes y las llamadas históricas están recogidos en evidencia 94. Los fragmentos A–D literales no se recuperaron en esta búsqueda; no reconstruirlos.
- **`handleTaskFinish` / `showFinishNotification()`:** `handleTaskFinish(IIILjava/util/ArrayList;)V` ya está documentado. Evidencias 114–115 preservan resumen del flujo y claves literales recuperadas del Intent. El cuerpo Smali completo y la definición de `v0` siguen pendientes.
- **`ArchiveHelper.unzipFiles`:** el resumen recuperado sobre ZIP, temporales y `BRItem.error=1` no se elevó a hallazgo nuevo porque la escritura `error=1` ya está reconciliada con evidencia 27 y el contexto literal adicional no fue recuperado en esta búsqueda.
- **`BRService$5` registros `v10/v14`:** una conversación indica que el barrido para resolver sus inicializaciones no se ejecutó por un error tipográfico en el comando. No existe stdout de ese barrido; no inferir valores ni repetirlo sin necesidad específica.

### Conclusión y siguiente recuperación

La auditoría amplió la recuperación de `showFinishNotification()` con evidencias 115–117 y actualizó la evidencia 94 para dejar constancia de que los fragmentos A–D literales fueron pegados históricamente pero no pudieron recuperarse en esa búsqueda. El índice queda en v1.18. El stdout completo del barrido global `BRItem.state/error` tampoco está disponible en memoria. Próximo avance: recuperar el mensaje original A–D o el bloque Smali completo de `showFinishNotification()`; no reconstruir lo ausente.

**Procedencia de esta auditoría:** búsqueda de memoria persistente y resúmenes de asistente; cotejo documental contra el índice v1.13 y evidencias 27, 70, 76, 77, 82, 83 y 94. No es evidencia Smali primaria ni verificación local del APK.

## Auditoría adversarial adicional de memoria — 2026-11-22 (segunda pasada)

Se cruzaron nuevos resultados de búsqueda de memoria persistente con las secciones pertinentes del índice v1.16 y las evidencias 45, 52, 94, 96 y las secciones 101–102. No se crea una nueva evidencia técnica porque los candidatos ya estaban cubiertos o carecen de fuente literal recuperable.

### Candidatos y resultado del cotejo

- **MiAsistService / gate de comando:** la evidencia 52 ya conserva onStartCommand(), isActionParamsValid(), mimover_action, client_port, acciones mi_backup/mi_restore, puertos 57447–57449 y anclas de isOwnerSpace()/conexión/bindBRService()/bindTransFileService(). Un resumen de memoria mencionó además isBRServiceAvailable(), pero esa llamada no aparece en evidencia 52 ni en el índice v1.16 recuperado; no incorporarla ni tratarla como confirmada sin el mensaje fuente.
- **IBRService / getBRItems():** evidencia 45 ya contiene la transacción 5, Stub/Proxy, arreglo nuevo, copia selectiva de files_for_backup, referencia compartida de localFileList dentro del proceso y referencias originales para los demás elementos. La búsqueda no recuperó un delta literal adicional. La pregunta local-vs-Proxy permanece pendiente según evidencia 45/62.
- **BRService$11 callbacks:** el índice ya conserva el guard checkRunningTaskIndex(), acceso mBRItems[mRunningItemIndex] y notificación de progreso en onRestoreProgress() (sección 101), con procedencia USER-PASTED-SOURCE / RECOVERED-CHAT. No se recuperó Smali literal adicional.
- **BRService$11 escrituras de state:** sección 102/evidencia 96 ya conserva las cinco coordenadas físicas 766, 863, 1141, 1589 y 1754; no asignar método/valor/condición sin contexto.
- **CMD_RESTORE en BRService.onStartCommand():** evidencia 96 ya corrige la antigua interrupción aparente después de extra_zip_file_path. La continuación recuperada describe extra_britems no vacío → toArray() y restoreFiles(BRItem[],v6,v3); lista vacía → restoreFiles(null,v6,v3) solo si v3==3 o mIsReStartCommand; en otro caso log restoreFiles brItems is null y setState(...). Física 19417–19426 ancla la lectura ZIP; .line 913/915 son directivas, no coordenadas físicas. No repetir la descripción antigua truncada ni confundirla con el cuerpo de restoreFiles().
- **restoreTransfering() y BRService$5:** las ramas brState==3 → CMD_BACKUP + extra_is_retransfering=true y brState==4 → startRestoreCommand(5 args) ya están en la sección de retransferencia del índice. El mapping mBakFilesType y v8 ya fue reconciliado por evidencias 51/57/58/60/61/65/78; no trasladar el v8 de BRService$5 a BRService$6:2101.
- **Otros resúmenes:** ProgressItemAdapter, BRService.smali:12849–12956, 16787–16791 y BRService$5 en 103–186 ya están cubiertos en evidencias/índice. No se recuperaron bloques fuente adicionales ni un stdout nuevo.

### Conclusión

No se crea evidencia 116 ni se modifica el índice v1.16: esta pasada no produjo un delta técnico que supere el material ya preservado. Se actualiza únicamente este handoff para dejar constancia de la deduplicación y de las correcciones de procedencia/alcance. Próxima acción válida: recuperar mensajes fuente literales pendientes, no repetir las búsquedas o extracciones ya documentadas.

**Procedencia:** búsqueda de memoria persistente y resúmenes históricos; cotejo contra el índice maestro v1.16 y evidencias existentes. No es fuente Smali primaria ni verificación local.

## Auditoría adversarial adicional de memoria — 2026-11-22 (tercera pasada)

Se amplió la búsqueda por fechas (2026-11-18 y 2026-11-19), títulos de conversaciones y términos literales `clearLocalFiles`, `showFinishNotification`, `extra_last_britems`, `ACTION_VIEW_BRRESULT`, `ProgressPageFragmentBase` y `PendingIntent`. El cotejo contra el índice v1.16 mostró un delta genuino: el índice solo conservaba un resumen de `clearLocalFiles` y declaraba que su implementación literal no se había recuperado.

### Delta preservado

- Evidencia 116 recupera el método `clearLocalFiles(ArrayList<BRItem>)`: null retorna; itera BRItem; para `packageName.equals("files_for_backup")`, vacía `localFileList` si no está vacía. Coordenadas físicas reportadas 3977–4040 y directivas `.line` 4975–4977.
- El efecto es acotado: no modifica `BRItem.state`, `BRItem.error`, `packageName`, la lista principal ni elimina el BRItem.
- En `showFinishNotification`, la llamada a `clearLocalFiles(p4)` precede a la inserción de `extra_last_britems=p4`; coordenadas físicas reportadas 14592–14600 (inserción 14595–14597), `.line` 4962–4963.
- Se recuperaron además `extra_title=v1` y `PendingIntent.getActivity(..., flags=0xc000000)`; argumentos completos no disponibles.
- En `ProgressPageFragmentBase.smali` se reportaron línea física 541 para la recuperación de `extra_last_britems` y 2397 para la acción `ACTION_VIEW_BRRESULT`. Son anclas, no el cuerpo del receptor.
- Se creó evidencia 116 y el índice maestro pasó a v1.17. Procedencia `USER-PASTED-SMALI / RECOVERED-CHAT`; no es verificación local.

### Límites que siguen abiertos

- Los fragmentos A–D de `startRestoreCommand` no reaparecieron como texto literal; no reconstruirlos.
- El stdout completo del barrido global `BRItem.state/error` del 2026-11-19 sigue sin recuperarse.
- El método completo `showFinishNotification` y el receptor completo de `ProgressPageFragmentBase` tampoco se recuperaron.
- La evidencia 116 no demuestra comportamiento runtime ni autoriza extrapolar cómo la pantalla consume o presenta los extras.

**Procedencia de esta pasada:** búsqueda de memoria persistente por fecha, título y palabras literales; cotejo contra índice v1.16 y evidencias 114–115. No se repitieron extracciones Smali locales.


## Actualización de continuidad — evidencia 117 (2026-11-23)

El usuario compartió directamente la salida de grep del segmento físico 14394–14574 de `BRService.showFinishNotification(IIILjava/util/ArrayList;)V`. Se creó evidencia 117 y el índice maestro pasó a v1.18.

**Nuevo material directo:** instrucciones iniciales de `showFinishNotification`, incluyendo `stopForeground(true)`, bifurcación `mIsTransingTask` con Intent que contiene `SHOULDN'T RESOLVE!`, selección de recursos según `mIsFlashDriveTask`/tablet/`p1==3`, umbral de 600 dp, creación de Intent explícito o deep link, y acción `ACTION_VIEW_BRRESULT`. El segmento se corta en física 14574; no contiene el cierre del método ni permite concluir sobre callbacks.

**Dedupe:** evidencias 114–116 ya contenían resúmenes históricos de transporte, extras, `clearLocalFiles) y consumidor. Evidencia 117 conserva la fuente directa de la parte inicial y precisa su flujo, sin volver a contar los elementos anteriores como hallazgos nuevos.

**Siguiente paso:** continuar únicamente con la salida que falta de `showFinishNotification()` desde después de física 14574, si el usuario la comparte. En particular, cotejar extras, envío condicional de `p4), creación/publicación de notificación y el destino de `:goto_4`. Después, inspeccionar el cuerpo completo del receptor de `ACTION_VIEW_BRRESULT` solo cuando exista el fragmento; no inferir callbacks a partir de la mitad inicial. Mantener la clasificación de evidencia 117 como salida compartida por el usuario, no verificación local independiente.


## Actualización de continuidad — evidencia 118 (2026-11-23)

El usuario compartió la salida de `sed -n '14570,14780p' .../BRService.smali`, que contiene la continuación de `showFinishNotification()` y su cierre. Se creó evidencia 118 y el índice maestro pasó a v1.19.

**Conclusión confirmada por el fragmento:** el Intent transmite `extra_last_task_state=p1`, `extra_last_workingstage=p2`, `extra_last_errcode=p3) y `extra_title=v1). Cuando `p4 != null`, llama a `clearLocalFiles(p4)` y agrega la lista mediante `putParcelableArrayListExtra("extra_last_britems",p4)`. Luego crea `PendingIntent.getActivity(...,0x0c000000)`, calcula título y recurso de error con `getFinishNotificationTitle(mIsTransingTask,p1,p2)` y `getErrStringRes(p1,p3)`, construye la notificación con `NotificationUtils.createNotification(...)` y la publica con `mNotificationManager.notify(0x7f120037,...)`. El método termina en `.end method`.

**Dedupe/procedencia:** evidencias 114–116 ya contenían resúmenes históricos de estos elementos; evidencia 118 conserva la continuación Smali directa y el orden/condición/argumentos. Evidencias 117+118 cubren el método completo según los segmentos compartidos por el usuario. Clasificación `USER-PROVIDED / CURRENT-CHAT-SED-OUTPUT`, no verificación local independiente ni runtime.

**Siguiente punto de trabajo:** no repetir la extracción de `showFinishNotification()`. Investigar el receptor de `ACTION_VIEW_BRRESULT` en `ProgressPageFragmentBase.smali` y el consumo de `extra_last_britems` y extras globales. Las antiguas anclas físicas 541 y 2397 son pistas de navegación, no sustituyen el cuerpo del receptor. Objetivo: determinar cómo la pantalla consume cada BRItem y si lee `state/error`; no inferir callbacks ni semántica de estados sin fuente.


## Actualización de continuidad — evidencia 119 (2026-11-22)

El usuario indicó que continuará compartiendo, en el orden ya solicitado por el chat anterior, las salidas de Termux. El chat actual debe limitarse a verificar cada bloque, cotejarlo con el índice/evidencias y guardar únicamente los deltas nuevos, sin cambiar la secuencia ni pedir repeticiones.

Se creó evidencia 119 y se actualizó el índice maestro a v1.20.

**Contenido recibido y deduplicado:**
- El bloque directo de `BRService.clearLocalFiles(ArrayList<BRItem>)` confirma el comportamiento ya descrito en evidencias 116/118: vacía solo `localFileList` del elemento `files_for_backup`; no modifica `state/error`, no elimina el BRItem. Se preserva el texto fuente en evidencia 119 como corroboración, sin contarlo como hallazgo conceptual nuevo.
- El bloque físico 510–590 de `ProgressPageFragmentBase.smali` añade el receptor parcial: ruta `mState != v8` consulta `BRServiceDataHolder.getBrItems()` y recurre a `mLastItems` si el resultado es null; ruta `mState == v8` recupera `extra_last_britems` del Bundle si está disponible, o asigna `v6` cuando no lo está. En la ruta del Bundle, una condición de contexto/servicio controla la actualización de `mProgress` desde `BRServiceDataHolder.getmProgress()`. Las rutas convergen en comprobaciones de null/tamaño.
- No se ha visto el procesamiento posterior de los BRItem ni se ha resuelto `v8`; no inferir valores de estado ni presentación UI. No hay escrituras visibles de `BRItem.state/error` en esta ventana.

**Siguiente entrada esperada del usuario:** salida ya solicitada de `sed -n '580,700p' "$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase.smali"`. Tratarla como continuación; no volver a pedir ni ejecutar 510–590.


## Actualización de continuidad — evidencia 120 (2026-11-22)

El usuario continúa compartiendo las salidas Termux en el orden ya indicado por el chat anterior. No cambiar la secuencia ni pedir extracciones ya realizadas. Verificar cada bloque contra índice/evidencias, deduplicar y guardar solo deltas nuevos.

Se creó evidencia 120 y el índice maestro pasó a v1.21.

**Nuevo material recibido:**
- Ventana física 580–700 de `ProgressPageFragmentBase.smali`: en la ruta de lista `v3` no nula/no vacía, se convierte `ArrayList<BRItem>` a `BRItem[]`, se recorren sus objetos y se lee `BRItem.state`. Si es 6, se escribe `v7` al campo.
- Ventana física 430–515 del mismo método resuelve `v7=1` y `v8=-1`. Así, la mutación demostrada es `BRItem.state: 6 → 1`; y la ruta `mState == v8` de evidencia 119 es `mState == -1`, la ruta que obtiene `extra_last_britems` desde el Bundle.
- El arreglo se crea con `ArrayList.toArray()`; sus elementos son las mismas referencias BRItem, de modo que la escritura afecta los objetos referenciados y no una copia profunda.
- Tras la iteración, el arreglo se asigna a `v6` y se crea/instala `ProgressItemAdapter`.

**Cautelas:** la normalización solo queda probada en esta ruta de lista `v3`; no extenderla a `mLastItems` ni a `IBRService.getBRItems()` sin fuente. No se ven escrituras de `error`, cálculo de resultados ni enlace de filas. El cuerpo directo del adaptador sigue pendiente. No convertir resúmenes históricos del índice sobre el adaptador en verificación primaria nueva.

**Siguiente objetivo ya planteado:** continuar con el cuerpo de `ProgressPageFragmentBase$ProgressItemAdapter` (constructor y métodos de conteo/obtención/enlace de filas), sin repetir las ventanas 430–515, 510–590 o 580–700.


## Actualización de continuidad — evidencia 121 (2026-11-22)

El usuario continúa compartiendo salidas Termux en el orden solicitado. Verificar, deduplicar y preservar; no pedir que repita comandos ni cambiar la secuencia sin necesidad.

Se guardó evidencia 121 y el índice maestro pasó a v1.22.

**Salida recibida:** `grep -n -A220 'ProgressItemAdapter' .../ProgressPageFragmentBase.smali`. Esta búsqueda fue sobre el archivo padre, no sobre el archivo Smali separado de la clase interna.

**Delta directo del callsite `initUI()`:**
- instancia el `ProgressItemAdapter` y guarda `mAdapter`;
- asigna `isSaveInstance=true` si `mLastItems != null`, o si `mIsViewResult && v6 != null`;
- llama `initData(v6)` con el arreglo `BRItem[]`;
- conecta el adapter al `ListView` ID `0x7f0a021f`;
- publica `ListScollThread(WeakReference(ListView), v6)` mediante `ListView.post()`.

**No duplicar:** la semántica histórica de `initData/getView/updateInfoView`, estados y porcentajes ya aparece en evidencias 54/67. La salida no contiene los cuerpos internos de los métodos de la clase adapter.

**Siguiente objetivo preciso:** inspeccionar el archivo separado:
`$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase\$ProgressItemAdapter.smali`.
Obtener primero encabezados y coordenadas de métodos; luego extraer únicamente los métodos que correspondan al orden de investigación. No repetir el grep en el archivo padre ni asumir que el contenido de esta salida es el cuerpo del adapter.
