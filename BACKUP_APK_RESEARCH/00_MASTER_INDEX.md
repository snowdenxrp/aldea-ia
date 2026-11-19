# MIUI Backup.apk --- Expediente maestro de investigación estática

**Versión:** 0.2 --- primera consolidación\
**Fecha de corte:** 2026-11-19\
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

Se recuperó el contexto preciso del bloque pegado por el usuario en la
conversación del 19-11:

- `mBakFilesType==2` → `v8=1`.
- La comparación separada `mBakFilesType==3` → `mIsTransingTask`.
- `mBakFilesType==5` → `mIsFlashDriveTask`.
- `mBakFilesType==1` → `mIsLocalBackupTask`.

Por tanto, la frase anterior que atribuía a los tipos 2 y 3
`mIsTransingTask` era incorrecta. El índice v0.1 de Library conserva
esa síntesis antigua; no se sobrescribe, pero queda supersedida por
esta reconciliación y por el registro
[`evidence/2026-11-19/10_MBAKFILESTYPE_V8_V16_RECONCILIATION.md`](evidence/2026-11-19/10_MBAKFILESTYPE_V8_V16_RECONCILIATION.md).

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

Se recuperó que `BRService$5.smali:1735` asigna `BRItem.state=6`
al elemento `files_for_backup` después de
`waitingForFilesTransingEnd()`. También se recuperaron ramas de
preservación de estados 1/6/3 (1789–1790), normalización de
`files_for_backup` (1967–1968) y fallo a state 3 (1983). Esto reduce
la incertidumbre del origen de state 6, pero no cierra su semántica UI
ni excluye otros productores.

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

**Siguiente verificación local:** recuperar los dos bloques completos
de FakeBackupListenerImp, resolver `p3=2`, cotejar los dos anclajes
state-6 y extraer el render/bind del adapter. Continúa siendo análisis
estático y de solo lectura.


## 23. Auditoría cruzada de repositorios e historial — 2026-11-19

El inventario conectado de GitHub devolvió cuatro repositorios del owner:
`aldea-ia`, `manual-supervivencia-nuclear`,
`nexo-grand-mission-01` y `-nexo-drb09-external-register`.
Los tres repositorios adicionales ya tenían auditoría de árboles de ramas
en el registro 04; no contienen rutas de Smali MIUI.

La búsqueda de mensajes de commits a nivel owner para
`Backup.apk`, `BRService`, `MiAsistService` y `MIUI` devolvió cero.
Los 3 hits de `Termux` corresponden a commits del repositorio privado
external-register y solo modifican `G08_NON_OPERATIONAL_EVIDENCE_PLAN.md`.
Sus parches fueron inspeccionados: documentan Termux targetSdk 28,
allowBackup=false y el límite de la migración Xiaomi; son contexto
antecedente, no evidencia de Backup.apk.

Búsquedas de código owner-scoped para nombres/claves de la investigación
devolvieron cero; no son concluyentes para repositorios privados no
indexados. La primera página de PRs/issues de aldea-ia no mostró
investigación MIUI; el endpoint de releases devolvió cero. Gists no
pudieron auditarse con la superficie disponible y permanecen NOT AUDITED.

Informe:
[`evidence/2026-11-19/16_CROSS_REPOSITORY_HISTORY_AND_SURFACE_AUDIT.md`](evidence/2026-11-19/16_CROSS_REPOSITORY_HISTORY_AND_SURFACE_AUDIT.md).


## 24. Paquete de verificación local de solo lectura

Se añadió una secuencia reproducible para Termux que:
- localiza y calcula SHA-256 de los Smali relevantes en todos los
  subdirectorios dex;
- enumera todas las escrituras directas a `BRItem.state`;
- recupera los callbacks completos de FakeBackupListenerImp;
- resuelve el conflicto state 6 entre las líneas físicas 1735 y 2351;
- coteja `setState(IIII)` y `handleTaskFinish`;
- recupera los métodos de conteo/render de ProgressItemAdapter.

Archivo:
[`evidence/2026-11-19/17_LOCAL_READ_ONLY_VERIFICATION_BATCH.md`](evidence/2026-11-19/17_LOCAL_READ_ONLY_VERIFICATION_BATCH.md).

Todos los comandos son de lectura; no ejecutan servicios ni backups/restores,
ni modifican APK, extracción o Git. Este paso es necesario porque esta
sesión no tiene acceso directo al filesystem Termux del dispositivo.


## 25. ERRATUM: coordenadas Smali y conflicto de procedencia — 2026-11-19

Se detectó que algunos informes mezclaron líneas físicas del archivo
con directivas Smali `.line`. El bloque de 19-11 con `.line 1391–1418`
proviene de una extracción física `sed -n '100,320p' "$F"`; no debe
citarse como líneas físicas 1391–1418.

Hay dos informes históricos del mapeo `mBakFilesType`:
- 17-11, dato de usuario recuperado: 2→`mIsTransingTask`,
  3→`mIsTransingTask`, 5→`mIsFlashDriveTask`, 1→`mIsLocalBackupTask`.
- 19-11, interpretación del asistente de un bloque con directivas
  `.line`: 2→`v8=1`, 3→`mIsTransingTask`,
  5→`mIsFlashDriveTask`, 1→`mIsLocalBackupTask`.

El bloque de 17-11 no está recuperado verbatim; el de 19-11 tampoco
tiene aún instrucciones Smali completas recuperadas. No sabemos si son
versiones distintas, bloques distintos o una lectura errónea. Por tanto,
el mapeo queda **UNKNOWN — SOURCE BLOCK RECONCILIATION REQUIRED**.
La sección 5 del documento 10 no debe elevarse a conclusión final hasta
cotejar el archivo local y su hash.

También se corrige la afirmación de dos productores físicos de state 6:
la búsqueda grep recuperada reporta la escritura en línea física 2351;
la referencia 1735 no está demostrada como línea física y puede ser una
directiva `.line`. Véase erratum.

[`evidence/2026-11-19/18_ERRATUM_COORDINATES_AND_TYPE_MAPPING_PROVENANCE.md`](evidence/2026-11-19/18_ERRATUM_COORDINATES_AND_TYPE_MAPPING_PROVENANCE.md).

**Estado probatorio:** corrección documental incorporada; falta lectura
local. No se modificó el APK ni la extracción Smali.
