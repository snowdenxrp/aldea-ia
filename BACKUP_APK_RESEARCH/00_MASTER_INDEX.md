# MIUI Backup.apk --- Expediente maestro de investigación estática

**Versión:** 0.49 --- restoreFiles signature provenance correction\
**Fecha de corte:** 2026-11-20\
**Estado:** INCOMPLETO --- consolidación documental en curso\
**Alcance:** ingeniería inversa estática de MIUI `Backup.apk`; no
implica ejecución de restauraciones, modificación del APK ni pruebas
dinámicas.

> **Regla de integridad:** este expediente distingue evidencia primaria
> observada, conclusiones conservadas en conversaciones, hipótesis y
> pendientes. Una conclusión recordada no se convierte en evidencia
> primaria por estar escrita aquí. Los fragmentos Smali completos y sus
> hashes deben añadirse cuando se recuperen de la extracción local.

------------------------------------------------------------------------

## 0. Índice y estado general

  -----------------------------------------------------------------------------------
  Área                                Estado de preservación  Observación
  ----------------------------------- ----------------------- -----------------------
  Identidad y extracción de           CONFIRMADO EN CHAT      Directorio y
  `Backup.apk`                                                herramienta
                                                              conservados; ruta, tamaño, SHA-256 y copia idéntica
                                                              recuperados del chat
                                                              16-11-2026; hash no
                                                              recalculado aquí

  Manifiesto y componentes            CONSERVADO              `MiAsistService` y
                                                              `BRService` reportados
                                                              como `exported=false`

  `MiAsistService`                    CONSERVADO              Cadena hacia
                                                              `BRService` y
                                                              `bindBRService()`

  Binder / `IBRService.Stub`          CONSERVADO              14 transacciones; lista
                                                              funcional resumida

  `BRService` / restauración          PARCIAL                 Métodos, hilo y flujo
                                                              general conservados

  `BRService$5`                       PARCIAL                 Varias ramas y
                                                              variables conservadas;
                                                              fragmentos originales
                                                              incompletos

  `BRService$FakeBackupListenerImp`   PARCIAL                 Mapeos y escrituras de
                                                              estado conservados

  `ProgressItemAdapter`               PARCIAL                 Escrituras y rutas
                                                              resumidas

  `BRItem`                            PARCIAL                 Distinción state/error
                                                              conservada

  Notificaciones / códigos globales 8 CONFIRMADO EN EL CHAT   Despacho, IDs públicos
  y 9                                                         y textos de recursos
                                                              reportados con
                                                              extracción directa

  Condiciones causales que producen 8 PENDIENTE               Hay rutas candidatas;
  y 9                                                         falta cerrar la
                                                              causalidad completa

  Registro de comandos y salidas de   NO RECUPERADO           Se conserva una
  los \~20 chats                      ÍNTEGRAMENTE            selección de
                                                              resultados, no el
                                                              transcript completo
  -----------------------------------------------------------------------------------

### Convenciones probatorias

-   **CONFIRMADO (extracción directa):** el usuario compartió en el chat
    la salida de un comando o fragmento concreto.
-   **CONSERVADO (resumen):** el dato procede de una síntesis recuperada
    de conversaciones previas, sin tener aquí el fragmento original
    completo.
-   **HIPÓTESIS / CANDIDATO:** interpretación aún no cerrada.
-   **PENDIENTE:** requiere localizar y leer el método o la rama que
    falta.
-   **NO RECUPERADO:** no hay datos suficientes para reconstruir
    fielmente el resultado original.

No se debe convertir `CONSERVADO` en `CONFIRMADO` sin volver a cotejar
la fuente local.

------------------------------------------------------------------------

## 1. Entorno de investigación

### 1.1 Rutas y variables

-   Directorio decodificado: `$HOME/backup-static/decoded`
-   Ruta observada en Termux:
    `/data/data/com.termux/files/home/backup-static/decoded`
-   Variable `D` utilizada para apuntar a:
    `$HOME/backup-static/decoded/smali`
-   Por ello, los recursos se consultan mediante
    `"$D/../res/values/..."`.
-   En mensajes anteriores también se usó `F` para apuntar a un archivo
    Smali concreto; definirla de nuevo si Termux pierde las variables.
-   Ejemplo de archivo frecuente: `BRService$5.smali`; para el shell,
    escapar `$` cuando se escriba literalmente en una ruta.

**Aviso de entorno:** el 19-11-2026 falló `"$D/res/values/public.xml"`
porque `D` apuntaba a `smali`, no a la raíz decodificada. La ruta
correcta observada fue `"$D/../res/values/public.xml"`.

### 1.2 Datos de extracción conservados

-   `BRService$5.smali`: tamaño reportado 128,021 bytes y 4,261 líneas
    (17-11-2026).
-   Apktool 3.0.3 aparece en el contexto de extracción.
-   Se mencionan directorios `smali`, `smali_classes2` y
    `smali_classes3`.

**RECUPERADO EN CHAT (16-11-2026; no recalculado en esta sesión):**
- Paquete: com.miui.backup.
- Ruta de origen: /product/priv-app/Backup/Backup.apk.
- Tamaño reportado: 16,866,352 bytes.
- Copia en Termux: $HOME/Backup.apk.
- Comparación de copia: IDENTICAL (resultado reportado por el usuario).
- SHA-256 reportado: 36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae.

**AÚN NO RECUPERADO:** versión exacta/build del APK, comando exacto de
apktool usado para decodificar, hashes de los archivos Smali y una
recomputación independiente del SHA-256. No inventar estos datos.


### 1.3 Alcance probatorio de los metadatos de origen

La ruta, el tamaño, la comparación IDENTICAL y el SHA-256 anterior son
datos recuperados de la conversación del 16-11-2026. Se clasifican como
CONFIRMADO EN CHAT porque el usuario compartió esos resultados. No se
recalcularon contra el APK del dispositivo durante esta sesión y no
sustituyen una verificación local actual. El hash identifica bytes si el
valor reportado es correcto; no demuestra por sí solo origen, versión,
firma, integridad del proceso de adquisición ni comportamiento del APK.

------------------------------------------------------------------------

## 2. Cronología recuperada

### 16-11-2026 --- `MiAsistService`, `BRService` y Binder

**CONSERVADO:**

-   Investigación estática en `$HOME/backup-static/decoded`.
-   `MiAsistService` llama:
    -   `BRService.startRestoreCommand(...)`, líneas 2939--2942.
    -   `BRService.startBackupCommand(...)`, líneas 2862--2865.
-   Después llama a `bindBRService()`.
-   `bindBRService()` construye un Intent explícito hacia `BRService`,
    añade `extra_is_from_miasist=true`, llama `startService()` y
    `bindService()`.
-   `MiAsistService` obtiene `mBRService.getBRItems()` y desregistra el
    listener al destruirse.
-   `MiAsistService` opera en proceso `:remote`.
-   `MiAsistService` y `BRService` fueron reportados como
    `exported=false`.
-   `IBRService.Stub` expone 14 transacciones de
    consulta/control/listeners, incluyendo consulta de estado/ítems y
    operaciones de pausa, abort/forceClose y registro de listeners.
-   No se identificó `startRestoreCommand` como transacción directa de
    `IBRService` en el fragmento revisado.
-   La cadena de alcanzabilidad externa y la autoridad/accesibilidad de
    Huanji quedaron pendientes.

**Pendiente histórico de esa etapa:** cuerpos completos de
`startRestoreCommand`, `onBind`, `onStartCommand`, `onTransact`,
activación y permisos. La regla de trabajo fue demostrar la cadena
completa de alcanzabilidad antes de afirmar una vía externa.

### 17-11-2026 --- flujo de restauración

**CONSERVADO:**

-   `restoreFiles()` aparece en `BRService.smali` alrededor de la línea
    12672.
-   `restoreFiles()` controla estado, guarda `mBRItems`/descriptor,
    notifica e invoca `startRestore()`; en el fragmento resumido no se
    observó validación explícita del descriptor, de los archivos o de
    autorización.
-   `startRestore()` crea y arranca `BRService$5` como hilo
    `"RestoreThread"`.
-   `BRService$5.run()` registra inicio, adquiere WakeLock/BMS,
    clasifica `mBakFilesType` e inicia `StorageMonitor`.
-   **MAPEO EN CONFLICTO — NO CERRADO:** un bloque Smali pegado por el usuario el 19-11-2026 (líneas 1391–1418 de BRService$5.run) indica 2 → mIsTransingTask, 3 → mIsFlashDriveTask, 1 → mIsLocalBackupTask. Resúmenes anteriores indicaban 2/3 → mIsTransingTask y 5 → mIsFlashDriveTask. No usar ninguno como mapeo definitivo hasta cotejar el bloque completo y todos los usos de mBakFilesType.
-   La llamada `startMonitor()` se resume así: resultado `0` continúa;
    resultado `1` produce resultado `2`; otros resultados producen `5` y
    abortan.
-   Si falla BMS, el flujo termina con error; un fallo de almacenamiento
    puede marcar `mIsAborted`.
-   En el cierre de `startRestore()` se conservó la forma
    `setState(4,v2,0,v14)`:
    -   `v16 != 0` → `v14=v16`, `v2=12`.
    -   abortado → `v14=3`, `v2=10`.
    -   normal → `v14=0`, `v2=11`.
-   Después limpia temp root/descriptor/`StorageMonitor`, llama
    `handleTaskFinish(4,v2,v14,mBRItems)` y libera WakeLock.
-   `handleTaskFinish()` tiene cuerpo reportado en
    `BRService.smali:8328`; puente sintético alrededor de línea 1835. Su
    implementación completa queda pendiente de cotejo.

### 18-11-2026 --- estados y errores de restauración

**CONSERVADO:**

-   Se inspeccionaron `BRService$FakeBackupListenerImp.smali`,
    `BRItem.smali`, `BRService$5.smali` y `ProgressItemAdapter`.
-   Se rastrearon estados 6, 7 y 8.
-   En `BRService$FakeBackupListenerImp` se reportaron tres escrituras
    directas a `BRItem.state`:
    -   línea 5719 → `state=2`.
    -   línea 5834 → `state=3`.
    -   línea 5921 → `state=1`.
-   No se encontraron escrituras directas `BRItem.state=7/8` en esa
    clase, `BRService$6` ni `BRItem` en las búsquedas resumidas.
-   `ProgressItemAdapter`:
    -   `itemStart` → `state=2`.
    -   abortos → `state=3,error=9`.
    -   errores → `state=3,error=p3`.
    -   finalización puede asignar `state=1`.
-   `BRService$5`:
    -   línea 1151: `state=v14`.
    -   línea 1259: para `files_for_backup`, hereda estado; de otro modo
        `state=4`.
    -   líneas 1283, 1336 y 1441: `state=v10`.
    -   línea 2351 → `state=6`.
    -   abortos → `state=3,error=9`.
    -   restauración fallida → `state=3`.
-   `v10` y `v14` quedaron pendientes de resolución en ese momento.
-   `BRService$5`:
    -   `v6` = BRItem.
    -   `v5` = ZipFile.
    -   `v4` = source list.
    -   `v3` = restored list.
-   Rama de error conservada:
    -   si `v5 == null` y `bakFile` es null/no existe,
        `BRItem.error=10`.
    -   si `bakFile` existe, `BRItem.error=1`.
    -   si `v5 != null`, no se asigna nuevo error en esa rama.
-   Excepciones de extracción se capturan localmente y el bucle
    continúa.
-   Listas source/restored vacías o fallo al cerrar stream pueden
    notificar listener error `7`.
-   Ruta general "Restore failed" notifica listener error `6` y
    `onRestoreEnd`; registra paquete/bakFile y asigna `BRItem.error=10`
    si falta bakFile y `v5==null`, o `1` si existe y `v5==null`; en otro
    caso conserva error previo.
-   `clearLocalFiles()` limpia `localFileList` de BRItem con paquete
    `"files_for_backup"` antes de parcelar.
-   Mapeo de códigos locales de listener conservado:
    -   `p3=0` → error 0.
    -   `p3=3` → error 2.
    -   `p3=4` → error 5.
    -   `p3=5` → error 6.
    -   `p3=6` → error 7.
    -   `p3=8` → error 6.
    -   `p3=9` → error 11.
    -   otro → error 1.
-   Reintento cuando `mState=3`, `error=7`, `retryCount<1`.
-   Estos códigos locales de listener NO deben confundirse con los
    códigos globales 8/9 de notificación.

### 19-11-2026 --- `BRService$5`, preparación, conectividad y notificación

#### 19.1 `StorageMonitor` y tipos de tarea

**CONSERVADO de conversación:**

-   **Conflicto pendiente:** el bloque directo de BRService$5.run líneas 1391–1418 recuperado el 19-11 indica 2 → mIsTransingTask, 3 → mIsFlashDriveTask, 1 → mIsLocalBackupTask; el resumen anterior afirmaba 2/3 → mIsTransingTask y 5 → mIsFlashDriveTask. Este expediente marca el mapeo como UNKNOWN / RECONCILIATION REQUIRED hasta releer la extracción local.
-   Se reinicia `StatSpeedHelper`.
-   Se crea `StorageMonitor(context,type)` y se llama `startMonitor()`.
-   Resultado `0`: continúa.
-   Resultado `1`: se asigna resultado `2`.
-   Otros resultados: resultado `5` y aborto.
-   Tipo `2` fue asociado a uso de `.tmp_bak_file` y
    `getTransTempBackupRootPath()` en un análisis anterior. `v8=1`
    cuando `mBakFilesType==2`; **no** es una bandera genérica de error.

#### 19.2 Conexión remota durante `startRestore`

**CONSERVADO de conversación:**

-   `startRestore` limpia listas y llama `bindTransFileServiceLocked`.
-   Se observó `setState(v4,3,v6)` al comenzar.
-   Si `remoteConnectedLatch` no se conecta:
    -   `setState(v4,7,v6)`.
    -   espera (`await`).
    -   registra `"not connected to remote"`.
    -   `mIsAborted=true`.
-   Si la conexión se establece, llama nuevamente `setState(v4,3,v6)`,
    prepara/restaura y continúa.
-   Se registraron mensajes como `"startRestore, prepared"` y descriptor
    null en el flujo revisado.
-   En un análisis posterior, `v13=9`, `v14=6`, `v15=7`; `v0=7` dentro
    de `:cond_c` fue interpretado como indicador de resultado de
    preparación, no como `BRItem.state=7`.
-   `v15=7` está confirmado como argumento de `setState`; su semántica
    exacta debe leerse en el método receptor.
-   `v16=8` o `9` aparece como valor que llega a `setState(4,12,0,v16)`
    en las ramas descritas más adelante.

#### 19.3 Preparación y contraseña

**CONSERVADO de conversación:**

-   Líneas 1463--1471: recupera `encryptedPwd`, extrae
    `BRItem.packageName` y llama `BRManager.setFutureTask()`.
-   Falta de espacio fuerza resultado `2` y marca aborto.
-   Líneas 1478--1486: comprueba conectividad, descifra `encryptedPwd`
    en `mPasswd`, registra estados y finaliza con `handleTaskFinish`
    cuando corresponde.
-   Sin red → `v0=4`.
-   Contraseña descifrada vacía → `v0=1`.
-   Si `v0 != 0`, llama `setState(v4,v3,v0)`,
    `handleTaskFinish(v4,v3,v0,mBRItems)` y retorna.
-   Con contraseña válida continúa.
-   Se observaron llamadas `setState(v4,v4,v6)`, `setState(v4,v3,v0)` y
    `setState(v4,v11,v6)`; significados de `v3`, `v4`, `v6`, `v11` deben
    cotejarse en el bloque original.

#### 19.4 Códigos globales 8 y 9

**CONFIRMADO EN EL CHAT mediante salidas de extracción compartidas:**

La llamada observada en `showFinishNotification` es:

``` smali
invoke-static {p1, p3}, Lcom/miui/backup/service/BRService;->getErrStringRes(II)I
```

`getErrStringRes(II)` recibe el estado global como primer argumento y el
código de error como segundo. El `packed-switch` se ejecuta sobre el
segundo argumento.

Correspondencia observada:

  --------------------------------------------------------------------------------------------------------------------------------
  Código de      Rama           ID de recurso  Nombre público                    Texto literal
  error                                                                          
  -------------- -------------- -------------- --------------------------------- -------------------------------------------------
  8              `:pswitch_3`   `0x7f12014b`   `err_router_disconnected`         `Check your router's connection and try again.`

  9              `:pswitch_2`   `0x7f120166`   `flash_drive_connection_failed`   `USB drive disconnected`
  --------------------------------------------------------------------------------------------------------------------------------

Extracciones compartidas:

``` bash
grep -n -E '0x7f12014b|0x7f120166' "$D/../res/values/public.xml"
```

Salida compartida:

``` text
6868: <public type="string" name="err_router_disconnected" id="0x7f12014b" />
6895: <public type="string" name="flash_drive_connection_failed" id="0x7f120166" />
```

Y:

``` bash
grep -n -A3 -B2 -E 'name="(err_router_disconnected|flash_drive_connection_failed)"' "$D/../res/values/strings.xml"
```

Salida compartida:

``` xml
<string name="err_router_disconnected">"Check your router's connection and try again."</string>
<string name="flash_drive_connection_failed">USB drive disconnected</string>
```

Por tanto: - `getErrStringRes(4,8)` → `0x7f12014b` → "Check your
router's connection and try again." - `getErrStringRes(4,9)` →
`0x7f120166` → "USB drive disconnected".

Las dos ramas son directas e independientes del primer argumento `4`.

**Etapa 12:** `getFinishNotificationTitle(ZII)` compara la etapa (`p3`)
con `10` y `12`; la etapa `12` sigue una ruta especial que evita la
selección ordinaria basada en transferencia/estado. El título y el
mensaje de error se calculan por separado.

**CANDIDATO CONSERVADO --- requiere cotejo del fragmento completo:** en
`BRService$5/startRestore`, `v16=8` en una rama descrita como
`v8/Themes`, o `v16=9` en Flash Drive/USB no disponible, llega a
`setState(4,12,0,v16)`. Se indicó que conserva `mLastError=8/9` si
estaba en cero. En la misma conversación se resumió que con
`mWorkingStage=12`, `setState` escribe `BRItem.state=3` y `error=9`;
este detalle debe cotejarse con el cuerpo exacto de `setState(IIII)`
para no confundir argumentos ni capas de estado.

Después se reportó: - `updatePkgStae(v14)`. -
`handleTaskFinish(4,12,v14,mBRItems)`. - `releaseWakeLock`. - Flash
Drive desregistra `StorageReceiver`. - Logs: `"startRestore, restored"`,
`"startRestore, stoped"`, `"Restoring end"`,
`"startRestore, released"`. - Tipo 5 → evento
`backup_usb_restore_finish`. - Tipo 3 → `backup_pc_restore_finish` si
`mIsFromMiAsist`; de lo contrario `backup_trans_restore_finish`. - Tipos
1 y otros: eventos aún no extraídos.

**Conclusión acotada:** conocemos con evidencia de recursos qué mensaje
presenta MIUI para los códigos globales 8 y 9. Aún no se ha cerrado
completamente la cadena causal desde la condición operativa hasta la
asignación y notificación del código.

------------------------------------------------------------------------

## 3. Distinciones que no se deben colapsar

Mantener separadas estas capas:

1.  `BRItem.state`: estado de cada elemento/paquete.
2.  `BRItem.error`: error asociado al elemento.
3.  Códigos de error del listener (`FakeBackupListenerImp` y callbacks).
4.  Argumentos de `setState(IIII)` y estado/etapa/error global del
    servicio.
5.  `mLastError` y `extra_last_errcode`.
6.  ID de recurso y texto que se muestra en notificación.

Un número igual en dos capas no demuestra que tenga el mismo
significado. En particular, los códigos locales de listener `6`, `7`,
`8`, `9` no deben confundirse automáticamente con el código global `8` o
`9` de `getErrStringRes`.


### 3.1 Semántica de setState(IIII) — corrección recuperada el 19-11

**CONFIRMADO EN CHAT mediante bloque Smali pegado por el usuario:**

- setState(III) (aprox. líneas 14061–14070) delega a setState(IIII)
  pasando (p1, p2, mUserInterruptAction, p3).
- En setState(IIII) (inicio aprox. línea 14072): p1 → mState,
  p2 → mWorkingStage, p3 → mUserInterruptAction, p4 → mLastError
  solo si mLastError era 0.
- p2==7 libera WakeLock. Por tanto, el valor 7 como segundo
  argumento de setState es una etapa global, no prueba BRItem.state=7.
- En líneas 3419–3422, si p2==10 o p2==12, o p3==2, el método
  recorre mBRItems y escribe BRItem.state=3 y BRItem.error=9;
  luego notifica el cambio de estado del servicio.

Esto obliga a mantener separadas la etapa global, mLastError,
BRItem.state y BRItem.error. La relación entre error global 8/9 y
error por elemento 9 no implica que sean el mismo código semántico.

------------------------------------------------------------------------

## 4. Pendientes priorizados

### P0 --- cerrar causalidad de códigos globales 8 y 9

1.  Recuperar el bloque completo de `BRService$5` donde se asigna
    `v16=8` o `v16=9`.
2.  Identificar con exactitud las condiciones que llevan a cada rama
    (incluida la rama llamada `v8/Themes`, que no debe renombrarse ni
    interpretarse sin el texto original).
3.  Leer el método real `setState(IIII)` y etiquetar cada parámetro por
    su uso efectivo.
4.  Confirmar dónde se escribe `mLastError`, `extra_last_errcode` y qué
    variable llega como `p3` a `getErrStringRes`.
5.  Seguir `handleTaskFinish(4,12,...)` hasta la persistencia y
    construcción de la notificación.
6.  Confirmar qué eventos de finalización corresponden a los tipos 1, 2,
    3 y 5.

### P1 --- cerrar estados y variables

1.  Resolver `v10`, `v14` y `v15` en sus bloques originales.
2.  Resolver `v16` sin inferir por su valor numérico.
3.  Leer `BRService.smali:8328` (`handleTaskFinish`) y el contexto de
    `setState(IIII)`.
4.  Revisar los bloques de `ProgressItemAdapter` conservados como
    pendientes: alrededor de líneas 445--495, 550--600, 1350--1400 y
    1450--1570, solo si siguen siendo necesarios.
5.  Confirmar la diferencia entre escrituras directas a `BRItem.state` y
    cambios globales de `BRService`.

### P2 --- completar expediente de origen

1.  Recuperar hash y metadatos exactos de `Backup.apk`.
2.  Guardar hashes de archivos Smali relevantes.
3.  Añadir bloques originales y comandos con sus salidas, con
    referencias de línea.
4.  Registrar cada método inspeccionado, incluso cuando una búsqueda no
    encontró escritores.
5.  Completar el inventario de clases revisadas y búsquedas negativas.

------------------------------------------------------------------------

## 5. Clases y métodos ya mencionados

  ------------------------------------------------------------------------------------------------
  Archivo/clase                             Método o zona                  Estado
  ----------------------------------------- ------------------------------ -----------------------
  `MiAsistService.smali`                    `startRestoreCommand`,         CONSERVADO
                                            `startBackupCommand`,          
                                            `bindBRService`, `onDestroy`   

  `BRService.smali`                         `restoreFiles`,                PARCIAL / algunos
                                            `startRestore`, `setState`,    resultados confirmados
                                            `handleTaskFinish`,            
                                            `showFinishNotification`,      
                                            `getErrStringRes`,             
                                            `getFinishNotificationTitle`   

  `BRService$5.smali`                       `run`, `startRestore` y ramas  PARCIAL
                                            de restauración                

  `BRService$6.smali`                       búsqueda de escrituras de      búsqueda negativa
                                            `BRItem.state`                 conservada

  `BRService$FakeBackupListenerImp.smali`   callbacks, mapeo de códigos y  PARCIAL
                                            escrituras de estado           

  `ProgressItemAdapter.smali`               callbacks de progreso y        PARCIAL
                                            finalización                   

  `BRItem.smali`                            campos `state`, `error`,       PARCIAL
                                            listas y parcelación           

  `IBRService.Stub`                         14 transacciones Binder        CONSERVADO
  ------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 6. Reglas para continuar sin perder trabajo

-   No repetir extracciones ya documentadas, salvo que se necesite
    recuperar el fragmento original o resolver una contradicción.
-   No afirmar causa técnica basándose únicamente en el texto de una
    notificación.
-   No inferir la semántica de una variable Smali solo por su valor
    numérico.
-   No mezclar estados de BRItem, errores de BRItem, códigos del
    listener y códigos globales.
-   Registrar las búsquedas negativas con su alcance exacto; "no
    encontrado en esta clase" no equivale a "no existe en todo el APK".
-   Toda nueva evidencia debe añadirse con fecha, ruta, método, líneas,
    comando, salida y clasificación.
-   Mantener el trabajo estático y de solo lectura. No ejecutar
    restauraciones, backups, servicios ni pruebas dinámicas salvo
    autorización expresa del usuario.

------------------------------------------------------------------------

## 7. Plantilla para nuevas evidencias

Para cada bloque nuevo:

``` text
ID:
Fecha:
APK / versión / SHA-256:
Archivo:
Método:
Líneas:
Comando de extracción:
Salida original:
Variables y registros:
Interpretación:
Clasificación: CONFIRMADO / CONSERVADO / HIPÓTESIS / PENDIENTE
Qué demuestra:
Qué NO demuestra:
Dependencias / siguiente paso:
```

------------------------------------------------------------------------

## 8. Advertencia de integridad y alcance

Este documento es una **primera consolidación recuperada**, no una
transcripción íntegra de aproximadamente 20 conversaciones. No contiene
todos los comandos ni todos los fragmentos originales. Su función
inmediata es evitar que se pierdan las conclusiones y marcar exactamente
qué evidencia falta recuperar.

**Estado final de esta versión:** útil para continuar el rastreo de
códigos globales 8 y 9; no debe tratarse como expediente probatorio
completo hasta incorporar los fragmentos Smali originales y los hashes.

------------------------------------------------------------------------

## 9. Addendum de recuperación histórica — 2026-11-19

Se recuperaron detalles adicionales de conversaciones anteriores y se
preservaron en
[`evidence/2026-11-19/02_CHAT_RECOVERY_DELTA.md`](evidence/2026-11-19/02_CHAT_RECOVERY_DELTA.md).

**Corrección importante de §2 y §19.1:** la paráfrasis anterior del
bloque `BRService$5.run()` líneas 1391–1418 era incorrecta. Los datos
recuperados del mensaje del usuario indican:

- `mBakFilesType==2` → `v8=1`.
- `mBakFilesType==3` → `mIsTransingTask=true`.
- `mBakFilesType==5` → `mIsFlashDriveTask=true`.
- `mBakFilesType==1` → `mIsLocalBackupTask=true`.

No debe repetirse el mapeo incorrecto anterior (2→transing, 3→flash).
La corrección está recuperada de la conversación, pero aún no se ha
releído el bloque completo contra el checkout local; por tanto, el
mapeo queda como DIRECT-CHAT / PENDING LOCAL-VERIFICATION, no como
LOCAL-VERIFIED.

El delta también recupera referencias adicionales de escritores de
`BRItem.state`, callbacks de `BRService$11`, flujo de transferencia
remota, ramas de `BRService$5` y referencias de entrada Binder de los
días 16–19. No contiene todavía las transcripciones ni bloques Smali
completos.

**Estado general:** INCOMPLETO. La recuperación mejora la precisión
documental, pero no cierra la causalidad de los errores globales 8/9 ni
sustituye la verificación contra los archivos locales.


## 10. Auditoría ampliada del repositorio antecedente — 2026-11-19

Se inspeccionó directamente el repositorio privado
`snowdenxrp/-nexo-drb09-external-register`. El árbol recursivo completo
de `main` devolvió 9 rutas (`truncated=false`); conserva
`G08_NON_OPERATIONAL_EVIDENCE_PLAN.md`, pero no contiene archivos
Smali, `Backup.apk`, `BRService` ni `MiAsistService` en ese árbol.

La historia de ese archivo contiene **27 commits** en total. La auditoría
inicial destacaba 17 commits relevantes de 14–15 de noviembre; no era
el recuento completo del historial. El detalle y los límites de la
inspección están en
[`evidence/2026-11-19/03_D_RB09_REPOSITORY_AUDIT.md`](evidence/2026-11-19/03_D_RB09_REPOSITORY_AUDIT.md).

La búsqueda de código en ese repositorio no devolvió coincidencias para
`BackupManager`, `MiuiBackup`, `com.miui.huanji` ni `Termux backup`;
como la indexación no está acreditada, esos ceros no se usan como prueba
de ausencia. La conclusión firme se limita al árbol completo de `main`
que sí se inspeccionó.

**Estado de la rama documental al cierre de este addendum:** verificar
HEAD y comparación con `main` en el siguiente checkpoint. No se modificó
`main` ni ninguna rama NCS.


## 11. Auditoría de los otros repositorios conocidos — 2026-11-19

Se inspeccionaron los árboles recursivos completos de todas las ramas
devueltas por GitHub para los dos repositorios restantes del inventario:

- `snowdenxrp/manual-supervivencia-nuclear`: rama `main`, 77 rutas,
  sin coincidencias de rutas relacionadas con MIUI/Backup.apk/Smali.
- `snowdenxrp/nexo-grand-mission-01`: ramas `main` (1 ruta) y
  `nexo-grand-mission-01-autonomous-2026-11-12` (32 rutas), sin
  coincidencias.

Los árboles no estaban truncados. El detalle y los límites están en
[`evidence/2026-11-19/04_REMAINING_REPOSITORIES_AUDIT.md`](evidence/2026-11-19/04_REMAINING_REPOSITORIES_AUDIT.md).

**Conclusión combinada y acotada:** en los repositorios conocidos y
refs inspeccionados no aparece una copia directa archivada de los
bloques Smali del 16–19 de noviembre. Esto no descarta almacenamiento
local, adjuntos históricos, objetos Git no alcanzables ni otras fuentes
no inventariadas.


## 12. Cadena global de errores 8/9 — recuperación adicional

Se recuperaron de conversaciones del 19-11 detalles adicionales de
`BRService$5.startRestore()`, `handleTaskFinish` y notificaciones.
El registro está en
[`evidence/2026-11-19/05_GLOBAL_ERROR_CHAIN_RECOVERY.md`](evidence/2026-11-19/05_GLOBAL_ERROR_CHAIN_RECOVERY.md).

En esa reconstrucción, Theme Manager (`com.android.thememanager`)
produce candidato `v16=8` bajo la condición `v8 != 0`; Flash Drive
sin USB produce candidato `v16=9`. Se recuperó también
`handleTaskFinish` en líneas 8328–8408, que registra estado/etapa/error,
llama a `showFinishNotification` y ejecuta `stopSelf()`.

Se registró una segunda invocación diferenciada:
`setState(3,12,9)` → `handleTaskFinish(3,12,9,mBRItems)`, en líneas
5562–5567. No debe mezclarse con el flujo de restauración que usa
`(4,12,8/9)`.

Los recursos 8/9 permanecen mapeados a
`err_router_disconnected` y `flash_drive_connection_failed`.
La causalidad completa y la reconciliación de las rutas con estado global
3/4 siguen pendientes de relectura local.


## 13. Manifiesto, MiAsistService y Binder — recuperación ampliada

Se recuperaron datos históricos adicionales de los chats del 16–17 de
noviembre: `sharedUserId="android.uid.backup"`, `allowBackup=false`,
permisos declarados, servicios no exportados, acción
`miui.intent.action.MIASIST_PROXY`, validación de `mimover_action` /
`client_port`, los 14 IDs Binder y más referencias de línea. El registro
completo, con límites probatorios, está en
[`evidence/2026-11-19/06_MANIFEST_MIASIST_BINDER_RECOVERY.md`](evidence/2026-11-19/06_MANIFEST_MIASIST_BINDER_RECOVERY.md).

Se conserva una discrepancia de anclaje: la llamada a
`startRestoreCommand` aparece en el contexto histórico alrededor de la
línea 838 y también en `MiAsistService.smali:2939–2942`. No se
normalizará hasta identificar los descriptores exactos de archivo y
método. Las declaraciones del manifiesto tampoco prueban grants
efectivos ni alcanzabilidad externa.


## 14. Ciclo de restauración y cierre — recuperación adicional

Se recuperaron detalles adicionales de `BRService$5.run()/startRestore()`:
preparación de listas, conexión remota, descriptor, contraseña cifrada,
restauración local de archivos, errores por elemento, limpieza temporal,
desconexión del servicio de transferencia y liberación de WakeLock.

El registro está en
[`evidence/2026-11-19/07_RESTORE_LIFECYCLE_RECOVERY.md`](evidence/2026-11-19/07_RESTORE_LIFECYCLE_RECOVERY.md).

Se mantienen sin reconciliar los anclajes históricos de `restoreFiles()`
(aprox. línea 12672 frente a 1351–1367) y se distingue la etapa
intermedia 8 (`setState(4,8,0)`) del cierre con etapa 12 y error 8/9.


## 15. Callbacks y reconciliación de líneas físicas / `.line`

Se recuperó una distinción crítica: las líneas físicas de `grep -n` /
`sed -n` no son los números de las directivas Smali `.line`. En
`BRService$FakeBackupListenerImp`, la correlación recuperada es:
física 1455 ↔ `.line 5719` (state 2), física 1753 ↔ `.line 5834`
(state 3), física 1273 ↔ `.line 5921` (state 1).

También se recuperaron los callbacks de `BRService$11`,
`FakeBackupListenerImp`, `ProgressItemAdapter`, sus traducciones
`p3→BRItem.error`, y un comando de búsqueda que apuntó por error al
archivo previo en vez de `BRService$5`. Detalles y límites:
[`evidence/2026-11-19/08_CALLBACK_WRITERS_AND_LINE_MAP.md`](evidence/2026-11-19/08_CALLBACK_WRITERS_AND_LINE_MAP.md).

No usar números `.line` como posiciones físicas ni atribuir la salida
del comando equivocado a `BRService$5`.


## 16. ProgressItemAdapter: conteos y semántica de finalización

Se recuperó que `getSuccessfulCount` cuenta estados 1 y 6;
`getFailedCount` equivale a total menos exitosos; `initData` trata
1/3/6 como estados finalizados y cuenta 1/6 como éxito. El adapter
normaliza `state=2` a 1 al finalizar y no mostró escrituras literales
7/8 en los rangos inspeccionados. El significado UI completo de cada
estado y el origen de state 6 siguen pendientes.

Detalle:
[`evidence/2026-11-19/09_PROGRESS_ADAPTER_UI_RECOVERY.md`](evidence/2026-11-19/09_PROGRESS_ADAPTER_UI_RECOVERY.md).


## 17. Reconciliación de mBakFilesType / v8 / v16 — 2026-11-19

La evidencia 10 conserva el **Reporte B** (conversación del 19-11):
tipo 2 → `v8=1`; tipo 3 → `mIsTransingTask`; tipo 5 →
`mIsFlashDriveTask`; tipo 1 → `mIsLocalBackupTask`.

**No es una resolución definitiva.** La evidencia 18 conserva un
**Reporte A** atribuido al 17-11: tipos 2 y 3 → `mIsTransingTask`.
Además, el bloque del 19-11 contiene directivas Smali `.line 1391–1418`
dentro de `sed -n '100,320p' "$F"`; no son líneas físicas 1391–1418.
Ambos informes se conservan con procedencia separada. Estado vigente:
`UNKNOWN — SOURCE BLOCK RECONCILIATION REQUIRED`. Véase evidencia 23.

También se recuperó la relación posterior:
`v8!=0` → candidato `v16=8`; `mIsFlashDriveTask` con USB no
disponible → candidato `v16=9`; ambos llegan al cierre con etapa 12
(`setState(4,12,0,v14)`). La cadena es coherente en los fragmentos
recuperados, pero aún NO es LOCAL-VERIFIED.

El SHA-256 reportado en la recuperación posterior es
`36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae`,
procedente de una conversación del 16-11 y de una comparación reportada
como IDENTICAL. No fue recalculado en esta sesión. La declaración
anterior de hash desconocido era correcta para el corte v0.1 y queda
actualizada únicamente como dato RECOVERED-CHAT.

**Prioridad siguiente:** cotejo de solo lectura en Termux de
`BRService$5.smali`, `setState(IIII)` y la cadena de notificación,
con hashes locales registrados. No ejecutar servicios ni restauraciones.


## 18. Productor de state 6 y conflicto en la llamada final a setState — 2026-11-19

Se conserva un reporte histórico que asocia `BRService$5.smali`
línea 1735 con `BRItem.state=6` para `files_for_backup` después de
`waitingForFilesTransingEnd()`, pero su condición de línea física está
disputada. El inventario grep directo conserva la escritura física 2351.
No afirmar dos writers físicos confirmados ni descartar el reporte 1735.
Estado vigente: coordenada 1735 / número de productores UNKNOWN; véase
evidencia 23. Las ramas de preservación 1/6/3 y los estados 1/3 de
finalización siguen siendo datos históricos separados.

Se recuperó además el inventario de escritores de `BRItem.state` en
`BRService$5` y las llamadas a `handleTaskFinish` en líneas 99, 313,
806 y 4090. El detalle está en
[`evidence/2026-11-19/11_STATE6_FINISH_AND_CALL_SHAPE_RECOVERY.md`](evidence/2026-11-19/11_STATE6_FINISH_AND_CALL_SHAPE_RECOVERY.md).

**Conflicto crítico:** una síntesis anterior dice que la llamada final
es `setState(4,v2,0,v14)`; el mensaje recuperado del usuario dice
explícitamente `setState(4,0,v2,v14)`. No elegir una forma. La orden
`invoke-*` original y el cuerpo de `setState(IIII)` deben cotejarse
juntos. Estado: UNKNOWN-STOP para el orden de argumentos.

También se conservaron anclajes de sobrecargas de
`startRestoreCommand` (5 y 7 argumentos), sin dar por probada la
supuesta recursión del overload de 5 argumentos.


## 19. setState(IIII) y llamada final — orden de argumentos resuelto

Se recuperó el bloque Smali pegado por el usuario para
`BRService.smali:14072–14220` y el invoke final literal de
`BRService$5.run()`. La llamada final usa los registros
`{v0,v4,v2,v5,v14}`, con `v4=4`, `v2=12`, `v5=0`; por tanto es
`setState(4,12,0,v14)`. Queda descartada como transcripción errónea la
forma anterior `setState(4,0,v2,v14)`.

El método asigna `p1→mState`, `p2→mWorkingStage`,
`p3→mUserInterruptAction`, y `p4→mLastError` solo si el error previo
era cero. Con `p2==7` libera WakeLock. Con `p2==10/12` o `p3==2`,
marca cada BRItem como `state=3,error=9`, si la lista existe y no está
vacía; luego notifica cambio de estado y actualiza preferencias.

Esto explica la separación: error global 8 puede coexistir con
`BRItem.error=9`, pues el método escribe el marcador de error por
elemento 9 en etapa 12, mientras conserva el candidato global 8/9 en
`mLastError`.

Detalle y callers relacionados:
[`evidence/2026-11-19/12_SETSTATE_ARGUMENTS_AND_FINAL_CALL.md`](evidence/2026-11-19/12_SETSTATE_ARGUMENTS_AND_FINAL_CALL.md).

**Estado:** orden de argumentos RESOLVED-DIRECT-CHAT; falta releer el
checkout local para alcanzar LOCAL-VERIFIED.


## 20. Auditoría completa de árboles de ramas de aldea-ia

Se enumeraron 134 ramas (100 + 34) y se consultó el árbol Git recursivo
del commit tip de cada una. Los 134 árboles devolvieron
`truncated=false`. El filtro de rutas incluyó Backup, MIUI, Mi Mover,
Termux, `BRService`, `MiAsistService`, `ProgressItemAdapter`,
`BRItem` y APK.

No apareció en ninguna rama preexistente una ruta que contenga la
investigación Smali directa de MIUI Backup.apk. Los hits de “BACKUP”
restantes son documentos de escrow de Nexo; los hits de Termux son
documentos NCS de filesystem/inspección, no archivos de MIUI Backup.

El informe completo está en
[`evidence/2026-11-19/13_COMPLETE_ALDEA_BRANCH_TREE_AUDIT.md`](evidence/2026-11-19/13_COMPLETE_ALDEA_BRANCH_TREE_AUDIT.md).

**Alcance:** esto cierra la inspección de árboles de puntas de las 134
ramas actuales, no la búsqueda de objetos Git inalcanzables/eliminados,
historiales no referenciados, Gists, PRs, Actions artifacts, otros
repositorios no inventariados ni almacenamiento local.


## 21. Búsqueda de mensajes de commits

Se buscaron mensajes de commits en `aldea-ia` con
`Backup.apk`, `BRService`, `MiAsistService`, `MIUI Backup`,
`miui`, `termux`, `mover` y `backup`. Las búsquedas específicas
de MIUI/Smali devolvieron cero resultados. “backup” devolvió dos
commits de septiembre de 2026 que solo añaden documentos de escrow
Nexo, no investigación Xiaomi.

Detalle:
[`evidence/2026-11-19/14_COMMIT_MESSAGE_SEARCH_AUDIT.md`](evidence/2026-11-19/14_COMMIT_MESSAGE_SEARCH_AUDIT.md).

Esto audita mensajes de commits, no el contenido de todos los parches
históricos ni objetos Git no alcanzables.


## 22. Callbacks y semántica de estados BRItem — 2026-11-19

Se consolidaron los bloques históricos pegados para
`BRService$FakeBackupListenerImp`, `BRService$11` y
`ProgressItemAdapter`.

Hallazgos recuperados:
- FakeBackupListenerImp escribe estados 1, 2 y 3 en las posiciones
  físicas 1273, 1455 y 1753; sus `.line` Smali son 5921, 5719 y 5834.
- En el callback de restauración, `state=3` se escribe antes de mapear
  `p3` a `BRItem.error`; `p3=6→error=7` y `p3=8→error=6`.
- El callback de backup finaliza con state 1 cuando `error==0`; la
  condición de retry con error 7 no significa state 7.
- BRService$11 inicia items con state 2 y maneja errores con state 3;
  sus valores `p3` también se traducen a `BRItem.error`.
- ProgressItemAdapter cuenta state 1 y 6 como éxito; state 1, 3 y 6
  como estados terminales. State 6 es éxito en la UI/conteo.

**Conflicto abierto:** existen dos anclajes históricos para state 6 en
`BRService$5.smali`: línea física 2351 en el inventario previo y 1735
en el contexto posterior de `files_for_backup`. No se fusionan sin
comparar el mismo archivo y hash.

Registro detallado:
[`evidence/2026-11-19/15_CALLBACK_STATE_SEMANTICS_AND_STATE6_CONFLICT.md`](evidence/2026-11-19/15_CALLBACK_STATE_SEMANTICS_AND_STATE6_CONFLICT.md).

## 23. Callers de initData y separación de rutas Binder — 2026-11-19

Se incorporó la evidencia 33: [`33_BRITEM_ARRAY_CALLERS_AND_BINDER_SPLIT.md`](evidence/2026-11-19/33_BRITEM_ARRAY_CALLERS_AND_BINDER_SPLIT.md).

La extracción recibida localiza los callers de `ProgressItemAdapter.initData`, varios de ellos precedidos por `IBRService.getBRItems()`, el getter `BRService.getBRItems()`, y la ruta proxy/stub de Binder consumida por `MiAsistService`. Se mantiene separada la colección `BRService.mBRItems:ArrayList` del campo `MiAsistService.mBRItems:BRItem[]`.

**Nuevo orden P0:** leer el cuerpo y registros de `restoreFiles` (especialmente la escritura reportada en línea 12733), sus dos callers, el getter, el Parcelable de `BRItem` y el bloque de asignación en `MiAsistService`. Después cerrar la procedencia del array en los callers de `initData` y la lógica visual de `updateSingleItemUI`.

**Límite:** DIRECT-CHAT; la salida grep cubre el árbol `smali` apuntado por `$D`, no acredita cobertura de `smali_classes2/3`. No se ha demostrado continuidad de identidad desde `ArchiveHelper` hasta el adapter ni reconstrucción Parcelable efectiva en una llamada concreta.

## 24. restoreFiles y getBRItems: semántica de referencias — 2026-11-19

Se incorporó la evidencia 34: [`34_RESTOREFILES_GETBRITEMS_REFERENCE_SEMANTICS.md`](evidence/2026-11-19/34_RESTOREFILES_GETBRITEMS_REFERENCE_SEMANTICS.md).

**Corrección de la lectura previa:** en `restoreFiles(BRItem[], BackupDescriptor, int)`, `p3` es el entero de tipo y se almacena mediante `iput p3,...->mBakFilesType:I`. Luego el mismo registro se reutiliza para crear un `ArrayList` a partir de `Arrays.asList(p1)`, que se asigna a `mBRItems`. La interpretación anterior de una asignación directa de `p3` objeto a `mBRItems` queda corregida.

El caller de `v4.toArray(new BRItem[])` crea un array nuevo, pero conserva las referencias de los elementos. `restoreFiles` crea otro contenedor `ArrayList`, también sin clonar los elementos. El getter `getBRItems()` crea un array nuevo y devuelve referencias originales para los elementos ordinarios; para `files_for_backup` crea un BRItem nuevo y copia campos seleccionados, incluidos `state` y `error`, compartiendo la referencia `localFileList`.

**Límite:** conclusiones confirmadas en los fragmentos pegados por el usuario, no LOCAL-VERIFIED por relectura/hash independiente. La semántica in-process no demuestra identidad a través de Binder/Parcel. Siguiente prioridad: Parcelable de `BRItem`, asignación en `MiAsistService`, origen del segundo argumento array `v5` y callers locales/remotos de `initData`.


## 25. BRItem Parcelable: inventario inicial de entrypoints — 2026-11-19

Se incorporó la evidencia 35:
[`35_BRITEM_PARCELABLE_ENTRYPOINT_INVENTORY.md`](evidence/2026-11-19/35_BRITEM_PARCELABLE_ENTRYPOINT_INVENTORY.md).

La extracción local compartida identifica `BRItem.smali` en
`smali/com/miui/backup/service/` y confirma que la clase implementa
`Parcelable`, declara `CREATOR` (asignado en línea física 158), y
contiene constructor `BRItem(Parcel)` (línea 278),
`describeContents()` (línea 700) y
`writeToParcel(Parcel,int)` (línea 1012).

**Estado:** entrypoints CONFIRMADOS por salida local pegada. Aún no se
han inspeccionado los cuerpos ni comparado los campos y el orden de
lectura/escritura. No afirmar todavía simetría Parcelable ni
reconstrucción de `state`, `error` o `localFileList` a través de
Binder.

**Siguiente extracción P0:** inicializador estático/implementación de
`CREATOR`, constructor Parcel completo, `describeContents()` y
`writeToParcel()`; después cotejar los campos serializados en ambas
direcciones.


## 26. BRItem Parcelable: comparación de lectura y escritura — 2026-11-19

Se incorporó la evidencia 36: [`36_BRITEM_PARCELABLE_READ_WRITE_COMPARISON.md`](evidence/2026-11-19/36_BRITEM_PARCELABLE_READ_WRITE_COMPARISON.md).

Los cuerpos compartidos de `BRItem(Parcel)` y `writeToParcel(Parcel,int)` presentan 23 posiciones de lectura/escritura en el mismo orden y con operaciones correspondientes. Se confirma que `state` y `error` se escriben/leen como enteros y que `localFileList` usa `writeList/readArrayList` con ClassLoader de `String`. `describeContents()` devuelve 0; `<clinit>()` crea `BRItem$1` y lo asigna a `CREATOR`.

**Límites:** salida local compartida, aún no LOCAL-VERIFIED por relectura/hash. Faltan `BRItem$1.smali`, comparación con todos los campos declarados, resolución de helpers sintéticos boolean y conexión con una transacción Binder concreta. No afirmar copia profunda ni identidad de elementos de `localFileList`.

**Siguiente extracción P0:** `BRItem$1.smali`, todos los `.field` de `BRItem.smali`, helpers Parcel/boolean y ruta Stub/Proxy/caller de `BRItem[]`.


## 27. BRItem Creator y campos de instancia no serializados — 2026-11-19

Se incorporó la evidencia 37: [`37_BRITEM_CREATOR_AND_UNSERIALIZED_FIELDS.md`](evidence/2026-11-19/37_BRITEM_CREATOR_AND_UNSERIALIZED_FIELDS.md).

La salida de `BRItem$1.smali` confirma que `createFromParcel(Parcel)` crea un `BRItem` nuevo mediante `BRItem.<init>(Parcel)`; `newArray(int)` crea un array `BRItem[]`. El inventario de campos declara 25 campos de instancia: 23 aparecen en el contrato Parcelable observado y dos, `apkSize` y `dataSize`, no aparecen en la escritura ni lectura. En la reconstrucción nueva no reciben valores desde el Parcel; el constructor compartido tampoco muestra asignación explícita para ellos, por lo que comienzan en cero como campos `long`, hasta cualquier asignación posterior.

**Pendiente:** implementación de los helpers sintéticos boolean, asignaciones/consumidores de `apkSize` y `dataSize`, y conexión con transacción Binder concreta. Evidencia basada en salidas pegadas; no LOCAL-VERIFIED por relectura/hash.



## 28. Búsquedas de helper boolean y referencias apkSize/dataSize — 2026-11-19

Se incorporó la evidencia 38: [`38_HELPER_AND_FIELD_REFERENCE_SEARCH_NOT_DETERMINED.md`](evidence/2026-11-19/38_HELPER_AND_FIELD_REFERENCE_SEARCH_NOT_DETERMINED.md).

Las búsquedas iniciales no produjeron resultados visibles, pero no permiten concluir ausencia: la expresión de búsqueda del helper no estaba ajustada a la directiva Smali; los patrones `->apkSize:` y `->dataSize:` comienzan con guion y se usaron sin `--`, además de suprimir stderr; la búsqueda se limitó a un subdirectorio. Los tres objetivos quedan **NO DETERMINADOS**.

Siguiente paso: localizar el helper con `find` en todo el árbol decodificado y buscar referencias de campos con patrones fijos protegidos por `--` en todos los árboles `smali*`.


## 29. Helper localizado y referencias de campos refinadas — 2026-11-19

Se incorporó la evidencia 39: [`39_HELPER_LOCATED_AND_FIELD_SEARCH_REFINED.md`](evidence/2026-11-19/39_HELPER_LOCATED_AND_FIELD_SEARCH_REFINED.md).

La búsqueda sobre todo el árbol decodificado localizó `smali/com/miui/backup/Utils$$ExternalSyntheticApiModelOutline0.smali`, candidato para resolver los helpers sintéticos usados por `BRItem.encrypt`; su contenido aún no se ha inspeccionado.

La búsqueda literal de `->apkSize:` no produjo coincidencias visibles en el árbol completo. La búsqueda de `->dataSize:` sí encontró referencias, pero sus descriptores pertenecen a `PackageStats.dataSize` y `AESExtraDataRecord.dataSize`, no a `BRItem.dataSize`. Por ello, los resultados no demuestran uso del campo de BRItem.

**Siguiente paso:** inspeccionar el helper, buscar el descriptor exacto `Lcom/miui/backup/service/BRItem;->dataSize:J` y rastrear asignaciones/consumidores de ambos campos. No inferir ausencia absoluta ni consecuencias funcionales.


## 30. BRItem.encrypt: helper boolean y búsquedas exactas de campos — 2026-11-19

Se incorporó la evidencia 40: [`40_BRITEM_ENCRYPT_BOOLEAN_HELPER_AND_EXACT_FIELD_SEARCH.md`](evidence/2026-11-19/40_BRITEM_ENCRYPT_BOOLEAN_HELPER_AND_EXACT_FIELD_SEARCH.md).

El helper `Utils$$ExternalSyntheticApiModelOutline0` contiene wrappers que delegan directamente a `Parcel.readBoolean()` y `Parcel.writeBoolean(Z)`. Las referencias de `BRItem.smali` en líneas físicas 471 y 1113 invocan esos wrappers; en el contrato Parcelable corresponden al campo `encrypt`. Queda confirmado que este campo se lee/escribe como booleano, no como entero manual.

Las búsquedas de descriptores exactos `Lcom/miui/backup/service/BRItem;->apkSize:J` y `...;->dataSize:J` en todo el árbol decodificado no produjeron coincidencias visibles. No se observaron accesos directos con esos descriptores; reflexión, JNI u otros mecanismos quedan NO DETERMINADOS.

**Siguiente prioridad:** inspeccionar constructor ordinario y métodos restantes de BRItem para determinar si los campos declarados pero no parcelados tienen asignaciones/consumidores indirectos; después conectar Parcelable con Stub/Proxy y un caller concreto de `BRItem[]`. No afirmar que se haya demostrado transporte Binder efectivo.


## 31. BRItem: constructores ordinarios y semántica de copia — 2026-11-19

Se incorporó la evidencia 41:
[`41_BRITEM_CONSTRUCTORS_AND_COPY_SEMANTICS.md`](evidence/2026-11-19/41_BRITEM_CONSTRUCTORS_AND_COPY_SEMANTICS.md).

El inventario de métodos confirma constructores vacío, por tipo, Parcel y copia, además de `addItem`, `isInternalFeature`, `isMedia` y `toString`. Los constructores vacío y por tipo establecen valores predeterminados; los campos no asignados conservan sus valores Java iniciales. En particular, `apkSize` y `dataSize` permanecen en cero en objetos recién construidos por esas rutas.

El constructor `BRItem(BRItem)` copia explícitamente la mayoría de los campos operativos, pero omite `apkSize` y `dataSize`. Para `localFileList`, crea una lista nueva y ejecuta `addAll`: nuevo contenedor, mismas referencias de elementos (copia superficial).

Esto coincide con la omisión de `apkSize` y `dataSize` en Parcelable, pero no permite afirmar que ambos campos sean globalmente inútiles ni que nunca se asignen fuera de `BRItem`.

**Siguiente prioridad:** inspeccionar los métodos restantes de `BRItem` y enlazar Parcelable con la transacción Stub/Proxy y un caller concreto. La evidencia sigue siendo DIRECT-CHAT, no LOCAL-VERIFIED.


## 32. Recuperación de continuidad Parcelable y chat anterior — 2026-11-20

Se incorporó la evidencia 42:
[`42_CHAT_CONTINUITY_BRITEM_PARCELABLE.md`](evidence/2026-11-20/42_CHAT_CONTINUITY_BRITEM_PARCELABLE.md).

Se recuperó el HEAD previo de la rama (`cf802ea24ca98dd30ffb6a1282e4a9f4827224c1`) y el estado del índice v0.25. El chat inmediatamente anterior contiene el inicio de una nueva extracción del constructor vacío (`BRItem.smali`, líneas 163–218), pero el fragmento disponible termina después de `const-string`. La evidencia 42 conserva literalmente el comando y el fragmento recuperable, y marca explícitamente lo que no pudo recuperarse; no inventa el resto de la salida.

Las evidencias 35–41 permanecen como registro acumulado del contrato Parcelable, 23 posiciones de lectura/escritura, Creator, campos no serializados, helper boolean y semántica de constructores/copia. No se repite su análisis como trabajo nuevo.

**Estado:** continuidad documental RECUPERADA PARCIALMENTE. El detalle completo del constructor vacío ya figura en evidencia 41 como CONFIRMADO EN CHAT, pero el nuevo fragmento del chat actual está truncado y no constituye una segunda verificación independiente.

**Siguiente prioridad:** conservar la salida íntegra del constructor vacío si se vuelve a compartir; inspeccionar `addItem`, `isInternalFeature`, `isMedia` y `toString`; después enlazar Parcelable con una transacción Binder Stub/Proxy y un caller efectivo. No afirmar transporte Binder concreto antes de esa conexión.


## 33. Recuperación suplementaria del contexto histórico — 2026-11-20

Se incorporó la evidencia 43:
[`43_SUPPLEMENTAL_CHAT_RECOVERY_2026-11-19.md`](evidence/2026-11-20/43_SUPPLEMENTAL_CHAT_RECOVERY_2026-11-19.md).

La recuperación adicional fija el SHA-256 reportado del APK, el HEAD histórico de la rama durante el 19-11-2026 (distinto del HEAD actual), los tamaños y hashes Smali truncados (sin completarlos), y resume anclas ya conservadas de `BRService$5`, `BRService$11`, `ProgressItemAdapter` y `restoreLocalMediaFile()`. Se cotejó contra evidencias 08, 09, 25 y 29 para no duplicar ni alterar sus conclusiones.

**No se recuperó:** transcript completo del chat anterior, hashes Smali completos ni salida íntegra de grep. No elevar RECOVERED-CHAT a LOCAL-VERIFIED. Permanecen vigentes las reglas de separar `state`, `error`, `progType`, códigos de listener y `mWorkingStage`, así como línea física frente a `.line` Smali.

## 34. BRItem: addItem, clasificadores y representación toString — 2026-11-20

Se incorporó la evidencia 44:
[`44_BRITEM_ADD_ITEM_CLASSIFIERS_TOSTRING.md`](evidence/2026-11-20/44_BRITEM_ADD_ITEM_CLASSIFIERS_TOSTRING.md).

La salida Smali compartida confirma que `addItem(String)` añade a `localFileList` bajo el monitor de `this`; `isInternalFeature()` reconoce exactamente feature 100, 101 y 102; `isMedia()` reconoce exactamente type 5, 6, 7 y 8. `toString()` compone 22 campos e incluye state/error/progType, rutas, lista de archivos, tamaños, retryCount y encrypt. `skipData` se representa como booleano true solo para el entero 1; la cadena termina en CRLF.

La evidencia es DIRECT-CHAT, basada en salida pegada por el usuario, no LOCAL-VERIFIED en este entorno. `toString()` no demuestra por sí mismo logging, persistencia ni transmisión Binder.

**Siguiente prioridad:** conectar Parcelable con `IBRService.Stub/Proxy`, identificar códigos de transacción y seguir un caller concreto que transporte `BRItem` o `BRItem[]`. No repetir el inventario de las 23 posiciones Parcelable ni afirmar transporte efectivo antes de demostrar la ruta.



## 35. IBRService Binder: getBRItems y semántica de referencias — 2026-11-20

Se incorporó la evidencia 45: [`45_IBRSERVICE_BINDER_GETBRITEMS_REFERENCE_TRANSFORM.md`](evidence/2026-11-20/45_IBRSERVICE_BINDER_GETBRITEMS_REFERENCE_TRANSFORM.md).

La salida Smali compartida confirma que `IBRService.getBRItems()` usa la transacción Binder 5: el Stub devuelve `BRItem[]` con `writeTypedArray` y el Proxy reconstruye el arreglo con `createTypedArray(BRItem.CREATOR)`. La implementación concreta es `BRService$1`, que hereda de `IBRService$Stub` y delega en `BRService.getBRItems()`.

El getter crea un arreglo exterior nuevo. Para `files_for_backup`, crea un `BRItem` nuevo y copia `type`, `feature`, `packageName`, tamaños, `state`, `error`, `progType` y la referencia `localFileList`; esta última no se clona. Para los elementos ordinarios inserta directamente la referencia original de cada `BRItem` en el arreglo.

**Límite:** DIRECT-CHAT, no LOCAL-VERIFIED por relectura/hash independiente. La ruta Proxy/Parcel reconstruye objetos en el receptor. El manifest pegado por el usuario sitúa MiAsistService en `:remote`, mientras que BRService no tiene `android:process` explícito en su declaración de servicio; falta la etiqueta `<application>` para resolver la herencia de proceso. Por tanto, no se declara todavía si el caller concreto toma Proxy o interfaz local de `Stub.asInterface()`. El retorno del getter cuando `mBRItems` es null tampoco se afirma porque el fragmento recibido no contiene la instrucción de retorno posterior al log.

**Siguiente prioridad:** no repetir la localización de `onServiceConnected()` (ya recuperada). Recuperar el cuerpo exacto de `Stub.asInterface(IBinder)` y la etiqueta `<application>` del manifest; resolver el proceso efectivo de BRService y conectarlo con el caller `getBRItems()` de MiAsistService. Mantener separada la identidad de referencias in-process de la reconstrucción Parcelable interprocess.


## 36. Recuperación suplementaria de memoria y cobertura histórica — 2026-11-20

Se incorporó la evidencia 46: [`46_SUPPLEMENTAL_MEMORY_RECOVERY_AND_COVERAGE.md`](evidence/2026-11-20/46_SUPPLEMENTAL_MEMORY_RECOVERY_AND_COVERAGE.md).

La recuperación agrega anclas históricas de `MiAsistService` (líneas físicas 698/703, 727/734, 2801–2865 y 2939–2942), las sobrecargas de `BRService.startRestoreCommand` (15199–15215 y 15220–15294), la tabla resumida de 14 transacciones de `IBRService.Stub`, la separación entre activación Intent y transporte Binder, y detalles previos de callbacks/state/error/ProgressItemAdapter.

También conserva la secuencia histórica de `restoreLocalMediaFile()` (ZIP derivado desde `mCurrentBackupRootPath`; estados 3/8/9/1 según las ramas descritas) y anclas de `ArchiveHelper.unzipFiles()`. Se mantienen como RECOVERED-CHAT, no LOCAL-VERIFIED; no sustituyen las evidencias específicas ni los fragmentos Smali.

**Pendientes que siguen abiertos:** completar `MiAsistService → bindBRService → ServiceConnection → onServiceConnected → IBRService.Stub.asInterface(IBinder) → mBRService → getBRItems()`; resolver Proxy frente a interfaz local; investigar sin asumir la aparente autorrecursión de la sobrecarga de cinco argumentos; reconciliar el mapeo histórico conflictivo de `mBakFilesType`; no repetir evidencias 35–45.

**Regla:** antes de solicitar nuevos comandos, reconciliar el expediente completo y los hallazgos existentes. Solo lectura estática; no ejecutar servicios ni operaciones de Backup/Restore.


## 37. Lifecycle de MiAsistService y superficie de acceso — 2026-11-20

Se amplió la evidencia 46 con una segunda recuperación histórica del 16-11-2026. Añade detalles de `MiAsistService.onStartCommand()` (`mi_backup`/`mi_restore`), validación de `client_port` 57447–57449, `isOwnerSpace()` reportado como true, `onBind()` que devuelve null, conexiones `MiAsistService$2`/ `$4`, asignaciones `mBRService`/`mTransService`, etapas y el catálogo nominal de 14 transacciones de `IBRService.Stub`.

También conserva la superficie del manifest: los tres servicios `MiAsistService`, `BRService`, `TransFileService` reportados como `exported=false`; acción `miui.intent.action.MIASIST_PROXY`; permisos `BACKUP_PROXY` y `BACKUP_FILE_SERVER` reportados como `signatureOrSystem`; intermediarios exportados identificados sin demostrar que alcancen la ruta protegida. La alcanzabilidad externa, autorización efectiva y restauración de datos privados permanecen UNKNOWN/NOT DEMONSTRATED.

**Procedencia:** RECOVERED-CHAT; no LOCAL-VERIFIED. La conexión concreta del caller sigue abierta en la evidencia 45. No repetir el inventario Binder ni asumir que la acción de Intent anula `exported=false`.


## 38. Reconciliación Binder y estados de restauración — 2026-11-20

Se incorporó evidencia 47: [`47_BINDER_CONNECTION_AND_RESTORE_STATE_RECONCILIATION.md`](evidence/2026-11-20/47_BINDER_CONNECTION_AND_RESTORE_STATE_RECONCILIATION.md).

**Corrección del pendiente Binder:** evidencia 02 ya documentaba `MiAsistService$2.smali:38–106`: `onServiceConnected()` invoca `IBRService$Stub.asInterface(IBinder)`, asigna `mBRService` y registra listener; desconexión limpia la referencia. El usuario también pegó la declaración `.method public static asInterface(Landroid/os/IBinder;)Lcom/miui/backup/service/IBRService;` (16-11-2026 16:47:53Z), pero no su cuerpo. No volver a localizar ni extraer desde cero el callback `$2`. El fragmento directo de manifest líneas 107–113 muestra MiAsistService en `:remote` y no muestra `android:process` en la declaración de BRService; falta la etiqueta `<application>` para determinar el proceso heredado. Pendiente real: recuperar el cuerpo exacto de `Stub.asInterface()`, la etiqueta `<application>` y conectar el proceso efectivo con el caller `MiAsistService.smali:1600–1620`.

**Corrección de setState:** evidencia 12 resuelve el conflicto de evidencia 11 mediante la instrucción Smali exacta. La llamada final es `setState(4,12,0,v14)`, no `setState(4,0,v2,v14)`. Con errores globales 8/9, el método puede almacenar `mLastError=8/9` y escribir simultáneamente `BRItem.state=3,error=9` por la condición de etapa 12. Son capas distintas.

**restoreFiles:** evidencia 34 corrige la lectura inicial de evidencia 33: firma de instancia con `p1=BRItem[]`, `p2=BackupDescriptor`, `p3=int`; el entero se guarda en `mBakFilesType` y luego el registro se reutiliza como destino para crear `ArrayList(Arrays.asList(p1))). No interpretar `iput-object p3` aislado como asignación del entero a `mBRItems`.

**mBakFilesType:** el mejor mapeo histórico recuperado de evidencia 02 es 2→v8=1, 3→transfer, 5→Flash Drive, 1→local. La paráfrasis que intercambiaba los valores 2/3/5 es incorrecta y no debe reutilizarse. Sigue sin LOCAL-VERIFIED hasta cotejar el bloque completo.

**state 6:** mantener separados línea física y directiva `.line`. La evidencia 43 reporta línea física 2351 con directiva cercana `.line 1735`; evidencia 11 describe el contexto de `files_for_backup` tras `waitingForFilesTransingEnd()`. No asumir dos escrituras distintas hasta cotejar el bloque original.

**Otros puntos consolidados en evidencia 47:** causalidad global 8/9 y recursos de notificación; distinción entre activación Intent y canal Binder; límites de manifest/alcanzabilidad externa; auditorías históricas de 134 ramas de `aldea-ia`, 27 commits del G08 del repo D-RB-09 y auditoría de otros dos repositorios. Todo se conserva con su clasificación RECOVERED-CHAT/DIRECT-CHAT, no como verificación local nueva.

**Siguiente orden sin repetición:** (1) Stub.asInterface + etiqueta `<application>`/proceso efectivo BRService; (2) caller getBRItems; (3) reconciliar coordenadas restoreFiles y usos de mBakFilesType; (4) state 6; (5) causalidad 8/9 y handleTaskFinish. No solicitar comandos hasta acabar el cotejo documental existente. Solo lectura estática.


## 39. Recuperación suplementaria de BRService$5 y ciclo de restauración — 2026-11-20

Se incorporó evidencia 48: [`48_BRService_RESTORE_LIFECYCLE_SUPPLEMENTAL_RECOVERY.md`](evidence/2026-11-20/48_BRService_RESTORE_LIFECYCLE_SUPPLEMENTAL_RECOVERY.md).

Se recuperan detalles adicionales del 17–19 de noviembre: `restoreFiles()` como entrada (comprobación de idle/restart, asignación de tipo/estado/descriptor/items, `mIsAborted=false`, notificación e inicio de restauración); arquitectura general de `BRService$5.run()`; despacho histórico de aplicaciones con `mRestoreTaskExecutor`, `PerformAdbRestoreTask` y `BRManager.restorePackage()`; monitorización y códigos de `StorageMonitor`; conexión `ITransFileService`/latch; preparación de password/capacidad; limpieza final y métricas locales.

**Punto de integridad:** la extracción histórica del bloque de despacho de aplicaciones falló porque `$F` estaba vacío; el único error recuperado fue `sed: can't read : No such file or directory`. No se conservó raw output de ese bloque. No presentar el resumen como extracción completa.

Se reafirma como mapping mejor soportado de `mBakFilesType` el de evidencia 02: 2→v8=1, 3→`mIsTransingTask`, 5→`mIsFlashDriveTask`, 1→`mIsLocalBackupTask`. Resúmenes antiguos que asignaban 2 y 3 a transferencia son contradictorios y no deben reutilizarse.

El cierre reportado incluye `mReconnector.quit()`, `ITransFileService.stopAll(0)`, unbind, `StorageMonitor.stopMonitor()`, `setState(4,v2,0,v14)`, limpieza de temp root, `setDescriptor(null)`, `updatePkgStae(v14)`, `handleTaskFinish(...)`, liberación de WakeLock y métricas `backup_local_restore_num`/`backup_local_restore_success_num`.

**Pendientes:** cuerpo completo de `BRService$5.run()/startRestore()), implementación de `StorageMonitor.startMonitor()`, ruta completa ZIP/zipStreamReader → executor → PerformAdbRestoreTask → BRManager.restorePackage(), y verificación de todos los usos de `mBakFilesType`. Todo lo nuevo sigue RECOVERED-CHAT, no LOCAL-VERIFIED.


## 40. ArchiveHelper, restoreLocalMediaFile y tareas MiAsist/transferencia — 2026-11-20

Se incorporó evidencia 49: [`49_ARCHIVEHELPER_AND_MIASIST_TRANSFER_RECOVERY.md`](evidence/2026-11-20/49_ARCHIVEHELPER_AND_MIASIST_TRANSFER_RECOVERY.md).

Recuperación del 19-11:
- `ArchiveHelper.unzipFiles(File,String,IFileZipSizeChangedListener,BRItem,boolean,InputStream,List<String>)`, siete argumentos, inicio reportado en línea física 1244.
- Sobrecarga de cuatro argumentos alrededor de 1959, que delega a la de siete argumentos alrededor de 1994.
- Callers: `BRService.smali:12918` y `BRService$UnpackThread.smali:81`.
- La extracción recibe BRItem directamente, actualiza progreso/callback con la misma referencia, asigna `error=1` en la rama de archivo restaurado ausente y continúa el ciclo ZIP; procesa .tmp, rename/fallback copy, registra errores y agrega rutas absolutas a la lista de salida. No se recuperó el cuerpo literal completo en este addendum; no elevar a LOCAL-VERIFIED.
- `BRService$UnpackThread` captura Exception, registra `UnpackThread delete file` y llama `File.delete()`; el éxito de borrado no está demostrado.

Se amplía `restoreLocalMediaFile(BRItem,boolean,InputStream)`, inicio reportado `BRService.smali:12772`: deriva `backup_<suffix>.zip`, usa `Utils.getZipSuffixType(packageName,type)`, estados reportados 3/error7 cuando falta ZIP e InputStream, 8 antes de unzip, 9 si abortado y 1 al finalizar normalmente.

Se preserva la cadena de inner classes de MiAsistService:
- `$1`: tras autorización, `startLoadAppIconsTask → startLoadBRItemsTask → startRestoreCommand`.
- `$2`: conexión IBRService; ya detallada en evidencia 02/47.
- `$4`: recibe ITransFileService, asigna `mTransService`, marca `STAGE_TRANS_SERVICE_BINDED/ERR_NONE` y registra listener.
- `$5`: etapas de carga BRItems.
- `$8`: `loadAppBRItems`, `loadFileBRItems`, `updateAppBRItemSize`, `updateItemTotalSize`, `updateBakFilePath`; accede a ITransFileService, syncers, fecha/raíz/tamaño y callbacks AsyncTask.

Se recuperan firmas de `startRestoreCommand` de cinco y siete argumentos. La sobrecarga de siete construye Intent `CMD_RESTORE`, añade descriptor/dir, items opcionales, ZIP, origen MiAsist y tipo; el caso `p5==4` añade `extra_is_from_miasist=true` y tipo 3. La aparente autorrecursión de la sobrecarga de cinco argumentos sigue sin cerrarse. Las coordenadas 1087/1091 y 15199/15220 no se fusionan hasta identificar archivo/descriptor exacto.

También se conserva `RetransferUtils.smali:154 → restoreTransfering(...)` como ruta histórica candidata, sin cuerpo completo.

**Pendientes:** cuerpo íntegro de unzipFiles y restoreLocalMediaFile; resultado de File.delete(); descriptor exacto y coordenadas de overloads startRestoreCommand; ruta RetransferUtils/restoreTransfering. No repetir trabajo ya documentado. Solo lectura estática.


## 41. Despacho de restauración de aplicaciones y métodos BRService — 2026-11-20

Se incorporó evidencia 50: [`50_APP_RESTORE_DISPATCH_AND_RESTORE_METHODS_RECOVERY.md`](evidence/2026-11-20/50_APP_RESTORE_DISPATCH_AND_RESTORE_METHODS_RECOVERY.md).

Recuperación de fuente pegada el 16-11:
- `restoreAppData(String,int,int)`, definición reportada `BRService.smali:12550`, bloque fuente alrededor de 2188–2207: deshabilita paquete, deriva rutas FullBackup, llama `BRManager.moveData` y `moveAndFixData`, establece estado mediante `AppUtils.setAppState(...,1,p3)`; excepción log `move data error`; movimiento fallido llama `onError(p1,p2,1)`.
- `BRService.onBind` 18672, `onCreate` 18681, `onStartCommand` 19067; despacho `CMD_RESTORE` 19362–19379 lee `extra_is_from_miasist` y asigna `BackupApp.mIsBackupTask/mIsFromMiAsist`.
- Sobrecarga de siete argumentos de `startRestoreCommand` pegada en 15220–15267: Intent CMD_RESTORE, descriptor/dir, BRItems opcionales, ZIP path, bandera de origen y tipo; `p5==4` marca MiAsist y tipo 3.
- Referencias de grep: `restoreStreamSplitApk` definición 13035, caller BRService$5:1899, llamada a startRestoreCommand 13409; `prepareRestoringItems` callers BRService$5:395/447; `restoreAppData` caller BRService$11:1337; llamadas de medios BRService$5:2419/3006/3561.
- `PerformAdbRestoreTask` referencia RestorePolicy en rango 1435–2050; enum: IGNORE, ACCEPT, ACCEPT_IF_APK. Solo grep recuperado, sin cuerpo de policy.

**Vacío real:** no se recuperaron cuerpos íntegros de `restoreStreamSplitApk`, `prepareRestoringItems`, `PerformAdbRestoreTask`, `BRManager.restorePackage/moveData`, executor ni ZIP/zipStreamReader. La extracción histórica de BRService$5 falló por variable `$F` vacía; no se conservó stdout del despacho de apps. No inventar el contenido faltante.

**Estado:** ruta de activación CMD_RESTORE y descripción de restoreAppData preservadas; flujo de restauración de apps incompleto. Solo lectura estática.


## 42. Pipeline de transferencia MiAsist, etapas y errores de comunicación — 2026-11-20

Se incorporó evidencia 51: [`51_MIASIST_TRANSFER_PIPELINE_AND_ERROR_STAGES.md`](evidence/2026-11-20/51_MIASIST_TRANSFER_PIPELINE_AND_ERROR_STAGES.md).

Nuevos detalles recuperados de Smali pegado el 16-11:
- Anclas MiAsist: `doSendFile(String)` alrededor de 739 (también invocaciones reportadas 809/2127), `sendAllBRItemsDescriptor()` alrededor de 2032, `startRestoreCommand()` 2917, `bindBRService()` 675–708, `bindTransFileService()` 709–738, `startAsClientOrServer()` 2685.
- `MiAsistService$6`: callback vinculado a `sendAllBRItemsDescriptor`, constructor `(MiAsistService,String)`, usa `mCurrentDate`, `mTotalSize`, `mAllBRItems`, `mDeviceAction/Stage/Error`, sincronización de iconos y `doSendFile(String)`; creado 2036 e iniciado 2043. `ERR_WRITE_DESCRIPTOR` se reporta en $6:241–245 y en MiAsistService alrededor de 2171.
- `MiAsistService$7`: constructor `(MiAsistService)`, creado 2874–2885 y ejecutado mediante `executeOnExecutor()`; no se recuperó su cuerpo. No atribuirle el trabajo de $8.
- `MiAsistService$5`: `ERR_CONNECTED_FAILED` 223, `ERR_SEND_FAILED` 507, `ERR_RECEIVE_FAILED` 737; etapas `STAGE_REMOTE_DISCONNECTED` 363–367, `STAGE_START_DESCRIPT_SENDED` 526–528, `STAGE_END_DESCRIPTOR_SENDED` 576–578; conexión etapa 221–225 y éxito 310–314. `$1` incluye `STAGE_AUTH_USER_AGREE` y secuencia carga iconos/BRItems → startRestoreCommand.
- `BRService.routeBackupData(Context,String,int,ParcelFileDescriptor,OutputStream)`, líneas 5967–5971: cabeceras MIUI/Android, socket→OutputStream, `writeEndFlag`, `flush()`.
- `BRService.runOnSendingThread(Runnable)`, líneas 5461–5466: HandlerThread `SendingThread`, Handler y `post(Runnable)`.

**Límites de seguridad/protocolo:** no se ha recuperado el cuerpo completo de `doSendFile`, `sendAllBRItemsDescriptor`, $6/$7, `routeBackupData` ni Runnable concreto. No afirmar que el envío de descriptor de MiAsist y routeBackupData son el mismo canal. No inventar framing, checksum o autenticación.

**Binder/UID:** se conserva una referencia a `Binder.clearCallingIdentity()` en `BRService.smali:7380`, pero falta el bloque, token y pareja `restoreCallingIdentity()`; no inferir bypass/privilegios. El valor UID numérico 6100 aparece solo como recuerdo no verificado; el manifest declara `sharedUserId="android.uid.backup"`, que no demuestra UID efectivo. Mantener separados sharedUserId, UID instalado, Binder calling UID y permisos efectivos.

**Pendientes:** cuerpos de transferencia MiAsist, $7, etapas $5, routeBackupData/callers, Runnable de SendingThread, bloque clearCallingIdentity/restoreCallingIdentity. Todo sigue DIRECT-CHAT/RECOVERED-CHAT, no LOCAL-VERIFIED. Solo lectura estática.


## 43. Gate de comandos MiAsist y mapa de estados del dispositivo — 2026-11-20

Se incorporó evidencia 52: [`52_MIASIST_COMMAND_GATE_AND_DEVICE_STATE_MAP.md`](evidence/2026-11-20/52_MIASIST_COMMAND_GATE_AND_DEVICE_STATE_MAP.md).

Anclas adicionales recuperadas:
- `MiAsistService.onStartCommand()` alrededor de 3691 llama `isActionParamsValid()`; parámetros `mimover_action`/`client_port`, acciones `mi_backup`/`mi_restore`, puertos 57447–57449.
- `startAsClientOrServer()` alrededor de 2685; `mDevicePort` alrededor de 2706. No se recuperó el cuerpo de socket/handshake.
- Secuencia reportada: `STAGE_USER_AUTHORIZING` 2622 → `startActivity()` 2680 → `STAGE_REMOTE_CONNECTING` 2689 → uso `mDevicePort` 2706 → `STAGE_BRSERVICE_BR_START` 2801 → `bindBRService()` 2865 → `STAGE_BRITEMS_LOADING` 2894 y `STAGE_BRSERVICE_TRANS_BINDING` en el rango 2801–2932.
- `setState(DeviceStage,DeviceError)` alrededor de 2185.
- Errores: `ERR_PARSE_SELECT_DESCRIPTOR` 1857, `ERR_PARSE_SELECT_BRITEMS` 2024, `ERR_WRITE_DESCRIPTOR` 2171, `ERR_NOT_OWNER_SPACE` 2528, `ERR_BRSERVICE_BUSY` 2556, `ERR_CONNECTED_FAILED` 2782; envío/recepción en evidencia 51.
- Campos recuperados: `mConnectionState`, `mDeviceStage`, `mDeviceError`, `mDevicePort`, `mReceivedItemFiles`, `mTransService`, `mTransListener`, `mServiceSyncer`, `mSizePredictSyncer`, `mIsLoadAppIconsDone`, `mIsPredictSizeDone`.
- $5 actualiza estado/conexión y archivos recibidos; $6 usa descriptor/items/syncer de iconos/estado; $8 carga app/file BRItems, tamaños y rutas.

**Límites:** el cuerpo de `startAsClientOrServer()`, Intent de `startActivity()`, gate completo `isActionParamsValid()`, mapeo DeviceError→UI y cleanup no están recuperados. La existencia de `ERR_NOT_OWNER_SPACE` no se resuelve con el retorno histórico true de `isOwnerSpace()` sin ver callers/ramas. No inferir peer autenticado ni socket abierto solo por el puerto. Clasificación RECOVERED-CHAT / DIRECT-CHAT; no LOCAL-VERIFIED.


## 44. Corrección de procedencia: clearCallingIdentity y UID 6100 — 2026-11-20

Se corrigió la sección 5 de evidencia 51 tras una búsqueda histórica focalizada:
- La referencia `Binder.clearCallingIdentity()` alrededor de `BRService.smali:7380` aparece en un resumen previo (evidencia 06), pero no se recuperó texto Smali pegado por el usuario ni el bloque circundante. Clasificación correcta: `PRIOR-ASSISTANT-SUMMARY / UNVERIFIED-REFERENCE`, no USER-PASTED-SOURCE.
- No se recuperó token, caller, llamadas posteriores ni `restoreCallingIdentity()`. No hacer inferencias de bypass/elevación desde esa referencia.
- UID numérico 6100: la búsqueda no encontró dumpsys, pm list packages, PackageManager, manifest, instalación, salida de comando ni inferencia documentada que lo origine. La distinción previa entre 6100 y `sharedUserId="android.uid.backup"` fue afirmación de asistente sin soporte. Clasificación: `UNKNOWN / UNSUPPORTED`; no citar como dato del paquete.
- El único dato histórico disponible es la declaración `sharedUserId="android.uid.backup"`, que no determina UID Linux instalado, Binder calling UID ni grants efectivos.

Esta corrección reduce el nivel de certeza respecto de la versión anterior del expediente y prevalece sobre cualquier mención más antigua en evidencia 06/51. No se eliminó la referencia histórica: se conserva con procedencia y límites explícitos.


## 45. Escrituras directas y propagación BRItem.state/error en BRService — 2026-11-20

Se incorporó evidencia 53: [`53_BRService_DIRECT_STATE_ERROR_WRITERS_AND_PROPAGATION.md`](evidence/2026-11-20/53_BRService_DIRECT_STATE_ERROR_WRITERS_AND_PROPAGATION.md).

**Bloque 12849–12956 (contexto restoreLocalMediaFile):**
- 12851: `BRItem.state=3`.
- 12856 carga 0x7; 12859 escribe ese valor en `BRItem.error`, no en state.
- 12903: `BRItem.state=8`.
- 12948/12953 preparan final según `mIsAborted`; 12956 escribe state=9 si abortado o state=1 si no.
- No se recuperó encabezado/descriptor del método en el mismo fragmento; mantener atribución como ancla histórica contextual.

**Bloque 16787–17436:**
- 16787/16791: constante 6 → escritura directa `BRItem.state=6`.
- 16914/16917: copia `p1` a state y `p2` a error.
- 17141: literal `files_for_backup`; 17153/17158: state desde `v1` y error 9.
- 17431–17436: propagación `PkgInfo.state/error` → `BRItem.state/error`.
- Firmas/nombres de métodos no estaban visibles. Este producer adicional de state 6 impide atribuir ese estado exclusivamente al flujo `files_for_backup` de `BRService$5`.

**Bloques con procedencia más débil:**
- 5201 state=2 tras `notifyItemTaskStart`, 5511–5519 state=3 si abortado o 1 si normal, y 6855–6857 copia de state/tamaños son resúmenes recuperados.
- La supuesta escritura state=7 en 5363 es solo PRIOR-ASSISTANT-SUMMARY; mantener UNKNOWN hasta verificar el iput y su campo destino.
- Las búsquedas negativas de evidencias 08/15 solo cubrían clases/rangos concretos; no prueban ausencia global. El bloque 12849–12956 demuestra state=8 en BRService.smali fuera de esos ámbitos.

**Regla de interpretación reforzada:** el valor 7 en 12856/12859 es `BRItem.error=7`, no state. No deducir destino de un campo por la constante; leer el iput.

La procedencia de `clearCallingIdentity()` y UID 6100 se corrige en sección 44 y evidencia 51: referencia line 7380 no tiene fuente primaria recuperada; UID 6100 carece de soporte y queda UNSUPPORTED.


## 46. Ampliación de procedencia de propagación BRService/PkgInfo — 2026-11-20

Evidencia 53 se amplió con referencias históricas adicionales:
- BRService.smali:7004/7009: resumen previo describe lectura de `PkgInfo.state/error` y escritura hacia `BRItem.state/error`; clase concreta, método y caller desconocidos.
- BRService.smali:16821, 16843–16845 y 16870–16872: lecturas state/error reportadas, sin bloque completo ni método.
- `clearLocalFiles(ArrayList)`: resumen previo indica que limpia `localFileList` de `files_for_backup` sin cambiar state/error; no hay fuente literal recuperada.
- Se reitera relación `showFinishNotification`/extras y `getErrStringRes(8/9)`, ya documentada en evidencia 47.

Estas ampliaciones no elevan la clasificación: lo que no procede de instrucciones pegadas sigue marcado PRIOR-ASSISTANT-SUMMARY; no se conocen encabezados .method/callers para esos bloques.


## 47. Ampliación ArchiveHelper y restoreLocalMediaFile — 2026-11-20

Se amplió evidencia 49 con detalles adicionales recuperados:
- `restoreLocalMediaFile()`: si `mCurrentBackupRootPath` es null, retorna; el resto del flujo conserva la derivación ZIP por `Utils.getZipSuffixType`, error 7/state 3 si falta ZIP e InputStream, state 8 al extraer y state 9/1 al terminar. La continuación completa sigue siendo resumen, no bloque Smali literal.
- `unzipFiles`: callback reportado `onZipFileSizeChanged(long,BRItem,String)` recibe la misma referencia; entrada desde InputStream o FileInputStream; nombres inválidos pasan por `getRealFileName()/buildValidName()`; fallback `Utils.copyFile()` si falla rename y el destino no existe; ZipException registra error, imprime, cierra ZIP y retorna en la ruta descrita.
- Sobrecarga de cuatro argumentos delega a la de siete con listener/BRItem nulos y booleano false, según resumen histórico.
- Única llamada adicional localizada: `BRService.smali:12918`.

La evidencia conserva estos datos como DIRECT-CHAT/RECOVERED-CHAT según procedencia; no se ha recuperado aquí el cuerpo literal completo. No elevar a LOCAL-VERIFIED.


## 48. ProgressItemAdapter: UI, progreso y referencias BRItem — 2026-11-20

Se incorporó evidencia 54: [`54_PROGRESSITEMADAPTER_UI_AND_REFERENCE_SEMANTICS.md`](evidence/2026-11-20/54_PROGRESSITEMADAPTER_UI_AND_REFERENCE_SEMANTICS.md).

Nuevos detalles recuperados:
- `initData(BRItem[])` conserva orden del array y cada `ProgressItem.brItem` mantiene la misma referencia BRItem, sin copia reportada.
- Éxito: state 1/6; terminado no exitoso: state 3; en progreso: state 2. `getFailedCount = total - successful`; initData marca terminales 1/3/6 y no usa `error` para esa clasificación.
- `updateProgress()`: state 0/3 → 0%; state 1/6 → 100%; state 2/4/5/7/8 → `completedSize/totalSize*100`, máximo 99%.
- `mSuccessfulSize`: suma `getBRItemSize()`; excepción `com.android.mms`/`com.android.contacts` con `type==9`: multiplica por 1000.
- Título: `Category.getItemString()` para categorías no-app/no-MMS-Contacts; apps/MMS-Contacts usan `Utils.getFeatureName(context,packageName,feature)`, fallback `getFeatureNameFromBakFileName(bakFilePath)`.
- `updateSingleItemUI()` línea 869 (callers 855/2267) lee `BRItem.error` alrededor de 954, pero el efecto visual completo no se conservó.

**Límite:** no se recuperaron recursos/labels/iconos completos ni el mapping visual por error; no inventar. La referencia local Java del adapter no altera las cautelas de identidad tras Binder/Parcelable de evidencia 45.


## 49. Corrección del mapping de progreso y recursos de layout — 2026-11-20

Evidencia 54 se amplió con una corrección basada en el dato directo recuperado:
- `updateProgress()`: state 0/3 → 0%; state 1/6 → 100%; state 2/4/5/7/8 → porcentaje `completedSize/totalSize` limitado a 99%.
- Layout ProgressItemAdapter: `0x7f0d00df`; vistas title `0x7f0a02ba`, info `0x7f0a02b9`, status/loading `0x7f0a02bb`.
- IDs restantes y strings/drawables para errores 2/5/6/7/9/11 no sobreviven en el contexto recuperado; no reconstruirlos ni usar un mapping de error de resúmenes anteriores como hecho.

Esta corrección prevalece sobre la paráfrasis anterior más estrecha que asignaba cálculo porcentual solo a state 2.


## 50. Grafo CMD_RESTORE y callback Binder MiAsist — 2026-11-20

Se incorporó evidencia 55: [`55_RESTORE_COMMAND_CALL_GRAPH_AND_MIASIST_BINDER_CALLBACK.md`](evidence/2026-11-20/55_RESTORE_COMMAND_CALL_GRAPH_AND_MIASIST_BINDER_CALLBACK.md).

**Hallazgo crítico: overload de cinco argumentos**
- Firma: `startRestoreCommand(Context,ArrayList<BRItem>,BackupDescriptor,String,int)`.
- El usuario pegó una instrucción `invoke-static {p0,p1,p2,p3,p4}` dirigida al mismo overload, con los mismos parámetros. La referencia de línea fuente es `.line 1087`; el bloque se describe como incondicional y seguido por return.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT. Lectura estática: autoinvocación recursiva directa en el bloque descrito. No afirmar StackOverflow observado ni runtime.
- No mezclar `.line 1087` con líneas físicas 15199/15220 de otra extracción.

**Overload de siete argumentos**
- Guarda p6 en `mIsReStartCommand`.
- Construye Intent explícito CMD_RESTORE con descriptor/directorio, BRItems condicionales, ZIP path y bakfiles type.
- Si p5==4, incluye `extra_is_from_miasist=true` y convierte el tipo a 3.
- Invoca `startService()`.

**Grafo de callers recuperado**
1. `MiAsistService.startRestoreCommand()` llama overload 5 args con lista/descriptor/string null y tipo 4; la secuencia exterior llama después `bindBRService()`.
2. `BRService.restoreTransfering()` llama overload 5 args cuando `brState==4`.
3. `RetransferUtils.smali:154` llama `restoreTransfering()`.
4. `ProgressPageFragmentBase$6` llama overload 7 args con descriptor, directorio, ZIP path, tipo y flag.

Estas rutas no se fusionan: la variante MiAsist/restoreTransfering pasa por la autoinvocación; la ruta de ProgressPageFragmentBase usa el overload que construye el Intent.

**IBRService Binder callback**
- `MiAsistService$2.onServiceConnected()`: recibe IBinder, usa `IBRService$Stub.asInterface()`, asigna `mBRService` y registra listener.
- `onServiceDisconnected()` limpia la referencia; logs reportados “BRService onServiceConnected” / “BRService onServiceDisconnected”.
- Esto acredita conversión/almacenamiento de interfaz; no determina si asInterface devuelve Stub local o Proxy.

**$6/$7**
- $6 annotation `sendAllBRItemsDescriptor()V`, constructor (MiAsistService,String), invoca `doSendFile(...)`, creado alrededor de 2036 e iniciado alrededor de 2043.
- $7 annotation `startLoadAppIconsTask(Context)`, también se reportó llamada a `doSendFile(...)`; creado 2874–2885 y ejecutado con `executeOnExecutor()`.
- No trasladar tareas atribuidas a $8 a $7; cuerpos completos siguen pendientes.

**Límite:** la descripción de la rama `CMD_RESTORE` de `onStartCommand()` que lee extras proviene de un resumen anterior del asistente, no del Smali literal recuperado. Sigue sin revalidar. La ejecución efectiva y el resultado de la autoinvocación no se probaron dinámicamente.


## 51. Recuperación parcial directa de CMD_RESTORE — 2026-11-20

Se incorporó evidencia 56: [`56_BRSERVICE_CMD_RESTORE_ENTRY_BRANCH_RECOVERY.md`](evidence/2026-11-20/56_BRSERVICE_CMD_RESTORE_ENTRY_BRANCH_RECOVERY.md). También se corrigió procedencia en evidencia 55 y se ampliaron 51/52.

**BRService.onStartCommand(CMD_RESTORE):** un mensaje histórico del usuario (16-11-2026 16:50:47Z) describe que:
- lee `extra_is_from_miasist`, `extra_bakfiles_type` (default 1), `extra_britems` y `extra_zip_file_path`;
- obtiene descriptor desde `BRServiceDataHolder` o `extra_descriptor_dir`;
- llama `restoreFiles()` si hay BRItems o en la condición descrita como tipo 3/reinicio;
- con lista null registra `restoreFiles brItems is null` y llama `setState(mState,0xc,6)`.

**Límite crítico:** el registro termina truncado en “retorna 1 en tipo…”. No se conoce la condición de retorno ni el cuerpo completo. Esta información es USER-FACT / DIRECT-CHAT, pero no es Smali literal reproducido ni LOCAL-VERIFIED.

**MiAsistService bridges y clase $5:**
- `MiAsistService.smali:416–453` contiene bridges Nest para `doSendFile(String)`, `sendAllBRItemsDescriptor()`, `startRestoreCommand()` y `startBackupCommand()`; solo delegan a métodos privados.
- $5 también contiene referencias a `STAGE_BRITEMS_LOADING`, `getItemName`, `updateProgressNotification`, `ERR_CONNECTED_FAILED` y `STAGE_REMOTE_CONNECTED`.
- Sigue sin recuperarse el cuerpo literal completo de doSendFile, sendAllBRItemsDescriptor, startAsClientOrServer, routeBackupData, runOnSendingThread ni $5/$6/$7.

**Manifest:** se recuperó la declaración `foregroundServiceType="systemExempted"` para MiAsistService, junto a proceso `:remote`, action `miui.intent.action.MIASIST_PROXY` y `exported=false` (evidencia 52). Este atributo no demuestra acceso externo ni autorización.

La sección 3 de evidencia 55 fue corregida: la rama CMD_RESTORE ya no se clasifica enteramente como resumen de asistente; los detalles explícitos anteriores se clasifican como USER-FACT / DIRECT-CHAT con truncamiento declarado.


## 52. Ramas de restoreTransfering y arranque de RestoreThread — 2026-11-20

Se incorporó evidencia 57: [`57_RETRANSFER_BRANCHES_AND_RESTORE_THREAD_RECOVERY.md`](evidence/2026-11-20/57_RETRANSFER_BRANCHES_AND_RESTORE_THREAD_RECOVERY.md) y se amplió la sección correspondiente de evidencia 55.

**RetransferUtils / restoreTransfering:**
- `RetransferUtils.smali:154` llama `BRService.restoreTransfering(Context,BackupDescriptor)`.
- Rama `brState==3`: inicia `CMD_BACKUP` y añade `extra_is_retransfering=true`.
- Rama `brState==4`: llama `startRestoreCommand(5 args)`.
- No se conocen todos los demás valores de brState ni el cuerpo íntegro del método.

**RestoreThread:**
- `startRestore()` crea una `WeakReference`, instancia `BRService$5("RestoreThread")` y llama `start()`.
- Esto acredita el arranque del hilo descrito, no que el restore finalice correctamente.

**restoreFiles:** el resumen de lifecycle (evidencia 48) describe asignación de `mBakFilesType`, `mBRItems` (salvo tipo 3), descriptor, limpieza de abort y llamada a `startRestore()`. Evidencia 34 conserva fuente Smali directa pegada por el usuario con `restoreFiles(BRItem[],com.miui.backup.data.BackupDescriptor,int)`. La supuesta alternativa `restoreFiles(BRItem[],com.miui.backup.BackupDescriptor[],int)` no procede de un mensaje del usuario ni de Smali literal: fue introducida por una respuesta anterior del asistente y queda `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`. Se retira el estado de conflicto entre firmas primarias. La firma singular sigue `DIRECT-CHAT / LOCAL-UNVERIFIED` hasta cotejar el archivo/hash exacto.

**Conflicto abierto:** el mensaje directo de CMD_RESTORE dice “tipo=3/reinicio” para la condición con lista ausente; un resumen anterior lo reformuló como tipo 3 o `mIsReStartCommand`. La segunda formulación no está revalidada. Mantener el texto directo y el conflicto hasta leer el bloque.


## 53. BRService$5.run() y corrección de procedencia de restoreFiles — 2026-11-20

Se incorporó evidencia 58: [`58_BRService_RESTORE_THREAD_RUN_AND_RESTOREFILES_SIGNATURE.md`](evidence/2026-11-20/58_BRService_RESTORE_THREAD_RUN_AND_RESTOREFILES_SIGNATURE.md). Evidencia 57 fue corregida para no presentar una firma como resuelta.

**Corrección de procedencia de restoreFiles:**
- Evidencia 34 conserva el bloque Smali pegado directamente por el usuario: `restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V`.
- La supuesta variante `restoreFiles([Lcom/miui/backup/service/BRItem;[Lcom/miui/backup/BackupDescriptor;I)V` no se encontró en un mensaje histórico del usuario ni en Smali literal; fue introducida por una respuesta anterior del asistente.
- Clasificación: firma singular `USER-PASTED-SOURCE / DIRECT-CHAT`; alternativa array `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`.
- No mantener `SIGNATURE-CONFLICT` entre fuentes primarias. La firma singular sigue sin relectura independiente del archivo local y su SHA-256.
- Las referencias a invocaciones en BRService.smali:19483 y 19519 siguen sin invokes literales recuperados; no usarlas para confirmar la firma.

**BRService$5.run():**
- Inicio reportado: asigna `mBRStartTime`, log `startRestore`, `acquireWakeLock()`, `acquireBMS()`, configura flags por `mBakFilesType`, inicia `StorageMonitor`.
- Anclas: `restoreStreamSplitApk` 1899; executor 1951/1964; creación `PerformAdbRestoreTask` 1996; `BRManager.restorePackage()` 2079; `restoreLocalMediaFile` 2419/3006/3561.
- `restoreAppData` no aparece en ese mapa de `run()`; el método separado existe alrededor de 12550.
- Lecturas `mBRItems` reportadas: 12050, 12733, 13610, 14140–14151, 16635, 16891, 17001–17010, 17114, 17170, 17183, 17345–17354, 19002, 19016, 19025.

La secuencia es USER-PASTED-SOURCE / DIRECT-CHAT para los rangos y llamadas reportados; no LOCAL-VERIFIED ni prueba éxito runtime.

