# MIUI Backup.apk --- Expediente maestro de investigación estática

**Versión:** 1.68 — E177: deleteFile, eliminación directa y espera asíncrona
**Fecha de corte:** 2026-11-25\
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

  Manifiesto y componentes            CONFIRMADO EN CHAT      `<application>` sin
                                                              `android:process`;
                                                              `MiAsistService` en
                                                              `:remote`; `BRService`
                                                              y `TransFileService`
                                                              heredan el proceso
                                                              predeterminado

  `MiAsistService`                    CONSERVADO              Cadena hacia
                                                              `BRService` y
                                                              `bindBRService()`

  Binder / `IBRService.Stub`          PARCIAL                 Stub concreto creado y
                                                              almacenado en mBinder;
                                                              onBind lo devuelve;
                                                              14 transacciones y
                                                              transporte conservados

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
apktool usado para decodificar, stdout íntegro de cálculo de hashes y una
recomputación independiente de los hashes del APK/Smali. Los cuatro
hashes y tamaños Smali reportados el 19-11 se registran en evidencia 111;
no presentarlos como recalculados en esta sesión.


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
-   **REGISTRO HISTÓRICO SUPERSEDED:** la primera recuperación de este día resumió el mapping como 2 → `mIsTransingTask`, 3 → `mIsFlashDriveTask`, 1 → local; esa lectura no debe reutilizarse. La salida directa posterior del 19-11 y la reconciliación en evidencias 18/51 ubican tipo 2 en `:cond_1`/ruta `v8`, tipo 3 en `mIsTransingTask`, tipo 5 en `mIsFlashDriveTask` y tipo 1 en `mIsLocalBackupTask`. El valor literal de `v8` sigue sin preservarse; véase sección 17 actual y evidencia 10 §1.
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

-   **Registro histórico supersedido:** una recuperación inicial atribuyó tipo 2 a `mIsTransingTask` y tipo 3 a `mIsFlashDriveTask`; esa lectura no debe reutilizarse. La salida directa posterior de `BRService$5.smali:103–186` ubica tipo 2 en `:cond_1`/ruta `v8`, tipo 3 en `:cond_2`/`mIsTransingTask`, tipo 5 en `:cond_3`/`mIsFlashDriveTask` y tipo 1 en `:cond_4`/`mIsLocalBackupTask`. La asignación literal de `v8` no está preservada. Véanse secciones 17/61 y evidencias 10, 18 y 51.
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
`setState(4,12,0,v16)`. Se indicó que conserva `mLastError=8/9` siestaba en cero. En la misma conversación se resumió que con
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

1.  Cotejar localmente el hash/metadatos reportados de `Backup.apk` solo
    si se necesita confirmar la adquisición actual.
2.  Cotejar localmente los cuatro hashes/tamaños Smali de evidencia 111;
    los valores ya están recuperados documentalmente, pero no recalculados.
3.  Recuperar bloques originales y comandos/salidas íntegros, con
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
    comando, salida y clasificación.-   Mantener el trabajo estático y de solo lectura. No ejecutar
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
7/8 en los rangos inspeccionados. El origen de state 6 ya está
parcialmente localizado: `BRService$5` física 2351 / `.line 1735`
para `files_for_backup`, más otro writer en `BRService.smali:16787–16791`.
El significado UI completo y la exhaustividad del inventario siguen abiertos.

Detalle:
[`evidence/2026-11-19/09_PROGRESS_ADAPTER_UI_RECOVERY.md`](evidence/2026-11-19/09_PROGRESS_ADAPTER_UI_RECOVERY.md).


## 17. Reconciliación de mBakFilesType / v8 / v16 — 2026-11-19

La evidencia 10 conserva el **Reporte B** (conversación del 19-11):
tipo 2 → `v8=1`; tipo 3 → `mIsTransingTask`; tipo 5 →
`mIsFlashDriveTask`; tipo 1 → `mIsLocalBackupTask`.

**Reconciliación parcial posterior (evidencias 18 §7 y 51 §9):** la salida Termux directa del 19-11 (BRService$5.smali, físicas 103–186) ubica tipo 2 en `:cond_1`/ruta `v8`, tipo 3 en `:cond_2`/`mIsTransingTask`, tipo 5 en `:cond_3`/`mIsFlashDriveTask` y tipo 1 en `:cond_4`/`mIsLocalBackupTask`. El Reporte A del 17-11 que atribuía tipo 2 y 3 a `mIsTransingTask` carece de bloque literal recuperado y no se conserva como hecho establecido. El valor exacto asignado a `v8` no está preservado: `v8=1` sigue `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`. La distinción de coordenadas también queda corregida: `.line 1391–1418` son directivas fuente dentro de la ventana física `sed -n '100,320p' "$F"`, no líneas físicas.

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

**Estado vigente:** ramas principales parcialmente reconciliadas desde salida directa; `v8` exacto y cadena causal `v8→v16=8` aún requieren fuente literal completa y cotejo local/hash. No ejecutar servicios ni restauraciones.


## 18. Productor de state 6 y llamada final setState — 2026-11-19

**Corrección de coordenadas:** `BRService$5.smali` physical line 2351 es la escritura `BRItem.state=6`; la directiva Smali `.line 1735` corresponde a esa misma instrucción. El contexto `.line 1733` ejecuta `waitingForFilesTransingEnd()`, `.line 1734` lee/compara el estado con 6 y `.line 1735` escribe state=6 para `files_for_backup`. No son dos anclajes físicos ni dos productores distintos. Evidencias 11/15 se corrigieron para reflejar esta distinción.

El inventario de `BRService$5` incluye otras escrituras de state; además evidencia 53 reporta un productor distinto en `BRService.smali:16787–16791`. No atribuir exclusividad global al flujo `files_for_backup`.

Se conserva el inventario de escritores de `BRItem.state` en `BRService$5` y llamadas a `handleTaskFinish` en líneas 99, 313, 806 y 4090. Véase [`evidence/2026-11-19/11_STATE6_FINISH_AND_CALL_SHAPE_RECOVERY.md`](evidence/2026-11-19/11_STATE6_FINISH_AND_CALL_SHAPE_RECOVERY.md).

**Corrección de setState:** evidencia 12 conserva el invoke exacto `invoke-static {v0, v4, v2, v5, v14}, ...->setState(IIII)V`, con `v4=4`, `v2=12`, `v5=0`. La llamada final es `setState(4,12,0,v14)`. La antigua forma `setState(4,0,v2,v14)` fue un error de transcripción y queda descartada. Estado: RESOLVED por DIRECT-CHAT; no LOCAL-VERIFIED.

También se conservaron ambas sobrecargas de `startRestoreCommand`. Evidencia 55 documenta el invoke directo del overload de cinco argumentos hacia el mismo overload con los mismos parámetros, seguido de return en el bloque compartido: anomalía de autoinvocación recursiva confirmada a nivel de fuente directa histórica. No se ha observado ejecución ni StackOverflow; mantener esa conclusión limitada al bloque pegado y a su procedencia.

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

**Corrección de coordenadas:** physical line 2351 y Smali `.line 1735` en `BRService$5.smali` identifican la misma escritura state=6 para `files_for_backup`; no son dos productores. Un productor distinto está reportado en `BRService.smali:16787–16791` (evidencia 53).

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

**Corrección de cobertura:** el caller concreto de `getBRItems()` ya fue pegado por el usuario en `MiAsistService.smali:1606`: `invoke-interface {v0}, IBRService->getBRItems()[LBRItem;` (evidencia 59). No volver a solicitar/localizar ese invoke. Pendiente real: recuperar el cuerpo de `Stub.asInterface(IBinder)` y la etiqueta `<application>` del manifest para resolver el proceso efectivo de BRService y la selección local/Proxy. Mantener separada la identidad de referencias in-process de la reconstrucción Parcelable interprocess.


## 36. Recuperación suplementaria de memoria y cobertura histórica — 2026-11-20

Se incorporó la evidencia 46: [`46_SUPPLEMENTAL_MEMORY_RECOVERY_AND_COVERAGE.md`](evidence/2026-11-20/46_SUPPLEMENTAL_MEMORY_RECOVERY_AND_COVERAGE.md).

La recuperación agrega anclas históricas de `MiAsistService` (líneas físicas 698/703, 727/734, 2801–2865 y 2939–2942), las sobrecargas de `BRService.startRestoreCommand` (15199–15215 y 15220–15294), la tabla resumida de 14 transacciones de `IBRService.Stub`, la separación entre activación Intent y transporte Binder, y detalles previos de callbacks/state/error/ProgressItemAdapter.

También conserva la secuencia histórica de `restoreLocalMediaFile()` (ZIP derivado desde `mCurrentBackupRootPath`; estados 3/8/9/1 según las ramas descritas) y anclas de `ArchiveHelper.unzipFiles()`. Se mantienen como RECOVERED-CHAT, no LOCAL-VERIFIED; no sustituyen las evidencias específicas ni los fragmentos Smali.

**Pendientes que siguen abiertos:** recuperar la apertura y atributos de `<application>` del manifest para resolver el proceso predeterminado y el proceso efectivo de BRService. El cuerpo de `IBRService.Stub.asInterface(IBinder)` ya está recuperado y demuestra selección local mediante `queryLocalInterface()` o fallback a Proxy (evidencia 62); no repetirlo. El callback `$2`, caller `getBRItems()` y contrato Parcelable están recuperados (evidencias 47/55/59/45); no repetirlos. Investigar sin asumir la aparente autorrecursión de la sobrecarga de cinco argumentos. El mapping `mBakFilesType` ya fue parcialmente reconciliado: tipo 2→ruta `v8`, tipo 3→`mIsTransingTask`, tipo 5→Flash Drive, tipo 1→local; queda pendiente el valor literal de `v8` y su cadena causal. No repetir evidencias 35–45.

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

**mBakFilesType / BRService$5.run():** salida Termux directa de BRService$5.smali:103–186 (19-11-2026 20:47:46Z) confirma comparación `0x2` (`v0` vs `v5`) → `:cond_1`/`v8`; `0x3` (`v9` vs `v10`) → `:cond_2`/`mIsTransingTask`; `0x5` (`v9` vs `v11`) → `:cond_3`/`mIsFlashDriveTask`; `0x1` (`v9` vs `v7`) → `:cond_4`/`mIsLocalBackupTask` (evidencia 51). La lectura reportada resume tipo 2→`v8=1`, 3→transfer, 5→Flash Drive, 1→local. Una paráfrasis anterior que atribuía tipo 2 a `mIsTransingTask` queda invalidada. No extrapolar estos flags a `BRItem.state/error` ni a un enum global. Sigue pendiente relectura local/hash independiente.

**state 6:** physical line 2351 y Smali `.line 1735` son la misma escritura en `BRService$5.smali`, tras `waitingForFilesTransingEnd()` para `files_for_backup`; no contarlas como dos writers. Evidencia 53 documenta otro writer en `BRService.smali:16787–16791`, en una clase/contexto distinto.

**Otros puntos consolidados en evidencia 47:** causalidad global 8/9 y recursos de notificación; distinción entre activación Intent y canal Binder; límites de manifest/alcanzabilidad externa; auditorías históricas de 134 ramas de `aldea-ia`, 27 commits del G08 del repo D-RB-09 y auditoría de otros dos repositorios. Todo se conserva con su clasificación RECOVERED-CHAT/DIRECT-CHAT, no como verificación local nueva.

**Siguiente orden sin repetición:** (1) cuerpo Stub.asInterface + etiqueta `<application>`/proceso efectivo BRService; (2) recuperar el valor literal asignado a `v8` y completar la cadena causal 8/9; (3) completar causalidad 8/9 y `handleTaskFinish`. La firma/callers de `restoreFiles`, el mapping parcial de `mBakFilesType` y las coordenadas state 6 ya fueron reconciliados documentalmente. El caller `getBRItems()` ya está preservado en evidencia 59. No solicitar comandos hasta acabar el cotejo documental existente. Solo lectura estática.


## 39. Recuperación suplementaria de BRService$5 y ciclo de restauración — 2026-11-20

Se incorporó evidencia 48: [`48_BRService_RESTORE_LIFECYCLE_SUPPLEMENTAL_RECOVERY.md`](evidence/2026-11-20/48_BRService_RESTORE_LIFECYCLE_SUPPLEMENTAL_RECOVERY.md).

Se recuperan detalles adicionales del 17–19 de noviembre: `restoreFiles()` como entrada (comprobación de idle/restart, asignación de tipo/estado/descriptor/items, `mIsAborted=false`, notificación e inicio de restauración); arquitectura general de `BRService$5.run()`; despacho histórico de aplicaciones con `mRestoreTaskExecutor`, `PerformAdbRestoreTask` y `BRManager.restorePackage()`; monitorización y códigos de `StorageMonitor`; conexión `ITransFileService`/latch; preparación de password/capacidad; limpieza final y métricas locales.

**Punto de integridad:** la extracción histórica del bloque de despacho de aplicaciones falló porque `$F` estaba vacío; el único error recuperado fue `sed: can't read : No such file or directory`. No se conservó raw output de ese bloque. No presentar el resumen como extracción completa.

La salida directa posterior de evidencia 51 §9 confirma las ramas: 2→`:cond_1`/ruta `v8`, 3→`:cond_2`/`mIsTransingTask`, 5→`:cond_3`/`mIsFlashDriveTask`, 1→`:cond_4`/`mIsLocalBackupTask`. La interpretación antigua `v8=1` (evidencia 02/10) no aparece como instrucción literal en el fragmento directo preservado y queda `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`; por ello, la cadena `type 2→v8→v16=8` sigue condicional.

El cierre reportado incluye `mReconnector.quit()`, `ITransFileService.stopAll(0)`, unbind, `StorageMonitor.stopMonitor()`, `setState(4,v2,0,v14)`, limpieza de temp root, `setDescriptor(null)`, `updatePkgStae(v14)`, `handleTaskFinish(...)`, liberación de WakeLock y métricas `backup_local_restore_num`/`backup_local_restore_success_num`.

**Pendientes:** cuerpo completo de `BRService$5.run()/startRestore()`, implementación de `StorageMonitor.startMonitor()`, ruta completa ZIP/zipStreamReader → executor → PerformAdbRestoreTask → BRManager.restorePackage(), y verificación de los usos restantes de `mBakFilesType`, en particular la asignación literal de `v8`. Todo lo nuevo sigue RECOVERED-CHAT/DIRECT-CHAT, no LOCAL-VERIFIED.

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
- 12856 carga 0x7; 12859 escribe ese valor en `BRItem.error`, no en state.- 12903: `BRItem.state=8`.
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

**restoreFiles:** el resumen de lifecycle (evidencia 48) describe asignación de `mBakFilesType`, `mBRItems` (salvo tipo 3), descriptor, limpieza de abort y llamada a `startRestore()`. Evidencia 34 conserva la declaración/cuerpo Smali pegados directamente por el usuario con `restoreFiles(BRItem[],com.miui.backup.data.BackupDescriptor,int)`. La recuperación directa del 20-11 también confirma dos callers en BRService.smali:19483 y 19519, ambos `invoke-direct` con el mismo descriptor singular (evidencias 57/58). La supuesta alternativa `restoreFiles(BRItem[],com.miui.backup.BackupDescriptor[],int)` fue introducida por una respuesta anterior del asistente y queda `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`; no existe conflicto entre fuentes primarias. Firma y callers: `DIRECT-CHAT / LOCAL-UNVERIFIED` hasta cotejo independiente del checkout/hash.

**Conflicto abierto:** el mensaje directo de CMD_RESTORE dice “tipo=3/reinicio” para la condición con lista ausente; un resumen anterior lo reformuló como tipo 3 o `mIsReStartCommand`. La segunda formulación no está revalidada. Mantener el texto directo y el conflicto hasta leer el bloque.


## 53. BRService$5.run() y reconciliación de restoreFiles — 2026-11-20

Se incorporó evidencia 58: [`58_BRService_RESTORE_THREAD_RUN_AND_RESTOREFILES_SIGNATURE.md`](evidence/2026-11-20/58_BRService_RESTORE_THREAD_RUN_AND_RESTOREFILES_SIGNATURE.md). Las evidencias 57/58 se actualizaron con los dos callers directos recuperados el 20-11.

**Corrección de procedencia de restoreFiles:**
- Evidencia 34 conserva el bloque Smali pegado directamente por el usuario: `restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V`.
- La supuesta variante `restoreFiles([Lcom/miui/backup/service/BRItem;[Lcom/miui/backup/BackupDescriptor;I)V` no se encontró en un mensaje histórico del usuario ni en Smali literal; fue introducida por una respuesta anterior del asistente.
- Clasificación: firma singular `USER-PASTED-SOURCE / DIRECT-CHAT`; alternativa array `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`.
- No mantener `SIGNATURE-CONFLICT` entre fuentes primarias. La firma singular y los dos callers tienen soporte `DIRECT-CHAT`; queda pendiente la relectura independiente del archivo local y su SHA-256.

**BRService$5.run():**
- Inicio reportado: asigna `mBRStartTime`, log `startRestore`, `acquireWakeLock()`, `acquireBMS()`, configura flags por `mBakFilesType`, inicia `StorageMonitor`.
- Anclas: `restoreStreamSplitApk` 1899; executor 1951/1964; creación `PerformAdbRestoreTask` 1996; `BRManager.restorePackage()` 2079; `restoreLocalMediaFile` 2419/3006/3561.
- `restoreAppData` no aparece en ese mapa de `run()`; el método separado existe alrededor de 12550.
- Lecturas `mBRItems` reportadas: 12050, 12733, 13610, 14140–14151, 16635, 16891, 17001–17010, 17114, 17170, 17183, 17345–17354, 19002, 19016, 19025.

La secuencia es USER-PASTED-SOURCE / DIRECT-CHAT para los rangos y llamadas reportados; no LOCAL-VERIFIED ni prueba éxito runtime.

La evidencia 51 incorpora además el detalle de branches `mBakFilesType` de BRService$5.smali:103–186 y corrige la atribución errónea previa de tipo 2 a `mIsTransingTask`.



## 54. Caller getBRItems y límite del getter — 2026-11-20

Se incorporó evidencia 59: [`59_GETBRITEMS_CALLER_AND_PARTIAL_GETTER_SOURCE_BOUNDARY.md`](evidence/2026-11-20/59_GETBRITEMS_CALLER_AND_PARTIAL_GETTER_SOURCE_BOUNDARY.md).

El usuario pegó `MiAsistService.smali:1606`: `invoke-interface {v0}, Lcom/miui/backup/service/IBRService;->getBRItems()[Lcom/miui/backup/service/BRItem;`. También identificó `BRService$1.smali:131` como implementación y `BRService.smali:6770` como getter interno. La clase `IBRService$Default` devuelve null en `getBRItems()` y `asBinder()`; es respaldo vacío, no la implementación operativa.

El fragmento directo de `BRService.smali:6750–6815` alcanza creación del arreglo, iteración, comparación `packageName == "files_for_backup"` y termina en `if-eqz v3, :cond_0`. No completar el cuerpo a partir de la paráfrasis ni inventar instrucciones posteriores. La transformación descrita previamente para los elementos especiales/ordinarios permanece en evidencia 45 con su procedencia y límites.

**Estado Binder:** callback `$2`, caller `getBRItems()` y transporte Stub/Proxy están identificados; rama local/Proxy no resuelta porque falta el cuerpo de `Stub.asInterface()` y el proceso efectivo de BRService. No repetir la búsqueda del caller 1606.


## 55. Reconciliación de callers restoreFiles y mBakFilesType — 2026-11-20

Se actualizaron evidencias 51, 57 y 58 con recuperaciones directas adicionales. Los invokes de BRService.smali:19483 y 19519 usan el descriptor singular `([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V`; el segundo está precedido por `const/4 v0, 0x3` y `if-eq v3, v0`. Esto confirma los callers de la firma singular de evidencia 34. La variante descriptor array queda exclusivamente como `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`.

La salida Termux de BRService$5.smali:103–186 confirma los branches `0x2→:cond_1/v8`, `0x3→:cond_2/mIsTransingTask`, `0x5→:cond_3/mIsFlashDriveTask` y `0x1→:cond_4/mIsLocalBackupTask`. La atribución antigua de tipo 2 a `mIsTransingTask` se descarta. Véanse evidencias 51, 57 y 58 para procedencia y límites.


## 56. mBakFilesType: escrituras, lecturas y ramas — 2026-11-20

Se incorporó evidencia 60: [`60_MBAKFILESTYPE_FIELD_FLOW_AND_SOURCE_LIMITS.md`](evidence/2026-11-20/60_MBAKFILESTYPE_FIELD_FLOW_AND_SOURCE_LIMITS.md).

El campo `mBakFilesType:I` está declarado en BRService.smali:267. La salida directa del usuario del 19-11 conserva `iput v4` en 3325, `const/4 v4, 0x3` en 3327 y escritura de `mIsFromMiAsist` en 3339; en `restoreFiles`, conserva `iput p3` en 12697, `const/4 p3, 0x3` en 12699 y lectura/comparación del campo con `0x3` en 12716. Las referencias grep adicionales aparecen en `copyFile` 4093, `createFile` 5676, `deleteFile` 5812, `mIsFromMiAsist` 7346, lectura de `mBakFilesType` 7355 y `makeDirs` 8762.

La salida directa de `BRService$5.smali:103–186` confirma branches para 2, 3, 5 y 1; tipo 3 configura `mIsTransingTask`, tipo 5 `mIsFlashDriveTask`, tipo 1 `mIsLocalBackupTask`; tipo 2 dirige a `:cond_1` y `v8`. La atribución previa de tipo 2 a `mIsTransingTask` queda corregida. No atribuir semántica al getter de 7355 ni comparaciones exactas en 4093/5676/5812/8762 sin cuerpos literales. Véase evidencia 60 para procedencia y límites.


## 57. Corrección de coordenadas state 6 y cierre del orden setState — 2026-11-20

Se actualizaron evidencias 11 y 15: la escritura `BRItem.state=6` de `BRService$5.smali` está en la línea física 2351 y se asocia a la directiva `.line 1735`. La aparente discrepancia era mezclar coordenadas físicas con líneas fuente Smali; no son dos escritores.

Evidencia 12 también resuelve el orden de argumentos de la llamada final: `setState(4,12,0,v14)`. La forma `setState(4,0,v2,v14)` queda invalidada. Un productor adicional state=6 se reporta en `BRService.smali:16787–16791`, evidencia 53; no inferir exclusividad del productor de `files_for_backup`.

## 58. Cierre de coordenadas y productores state 6 — 2026-11-20

Se corrigieron las evidencias 11 y 15: `BRService$5.smali` physical line 2351 corresponde a la directiva Smali `.line 1735` y a una sola escritura `BRItem.state=6` para `files_for_backup` tras `waitingForFilesTransingEnd()`. No es un conflicto entre dos líneas físicas. Además, evidencia 53 reporta otro productor en `BRService.smali:16787–16791`, por lo que no debe afirmarse exclusividad del productor de `BRService$5`.

Evidencia 12 conserva el invoke final exacto `setState(4,12,0,v14)`; la forma antigua `setState(4,0,v2,v14)` queda descartada. Véanse evidencias 11, 12, 15 y 53.

## 59. Cobertura histórica de grep MiAsist y ausencia de cuerpos literales — 2026-11-20

Se amplió evidencia 51 con los rangos físicos de grep compartidos el 16-11: `bindBRService` 675–708; `bindTransFileService` 709–738; `doSendFile` 739–829; `isActionParamsValid` 1639–1734; `sendAllBRItemsDescriptor` 2032–2047; `startAsClientOrServer` 2685–2789; `onStartCommand` desde 3691. La salida adicional contiene referencias a `MiAsistService$5/$6/$7`, pero no cuerpos completos.

El usuario confirmó que la salida era grep de ubicaciones, no bloques literales de los métodos. `BRService.routeBackupData()` y `runOnSendingThread()` no aparecieron en esa salida; tampoco se recuperaron cuerpos completos nuevos de `doSendFile`, `sendAllBRItemsDescriptor` o `$5/$6/$7`. No volver a tratar estas coordenadas como si fueran código inspeccionado.


## 60. Reconciliación Binder, proceso y mapping mBakFilesType — 2026-11-20

Se actualizaron evidencias 18 y 47.

**Binder/procesos:** el manifest directo de líneas 99–130 muestra `MiAsistService` con `android:process=":remote"`; `BRService` y `TransFileService` no tienen `android:process` ni permiso propio en sus declaraciones. El fragmento no incluye la apertura `<application>`. Por tanto, proceso efectivo de BRService y rama local/Proxy siguen condicionales: si `<application>` no fija proceso, BRService hereda el proceso predeterminado del paquete y sería distinto de `:remote`; si fija `:remote`, podría compartirlo. No afirmar cuál escenario aplica sin la etiqueta. La declaración de `IBRService$Stub.asInterface(IBinder)` y callback `$2` ya están recuperadas; el cuerpo de `asInterface` sigue pendiente.

**mBakFilesType:** la salida directa del 19-11 ubica tipo 2 en la rama `:cond_1`/`v8`, tipo 3 en `mIsTransingTask`, tipo 5 en `mIsFlashDriveTask` y tipo 1 en `mIsLocalBackupTask`. La asignación literal de `v8` no está preservada; `v8=1` sigue no verificada. El reporte antiguo que atribuía tipo 2 al flag de transferencia carece de fuente literal y queda subordinado a esta evidencia directa. No elevar todavía la cadena `v8→v16=8` a confirmación local.

**State 6:** la coordenada física 2351 y `.line 1735` identifican una sola escritura de `BRService$5`; un productor adicional está reportado en `BRService.smali:16787–16791`. El falso conflicto de coordenadas no es un pendiente activo.


## 61. Corrección de procedencia v8 y supersesión del mapping histórico — 2026-11-20

Se actualizó evidencia 10 para alinearla con la salida directa preservada en evidencia 51. El bloque de `BRService$5.smali:103–186` confirma las comparaciones y ramas: tipo 2 → `:cond_1`/ruta `v8`; tipo 3 → `:cond_2`/`mIsTransingTask`; tipo 5 → `:cond_3`/`mIsFlashDriveTask`; tipo 1 → `:cond_4`/`mIsLocalBackupTask`. La asignación literal `v8=1` no aparece en el fragmento directo preservado y sigue `PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`.

El mapping antiguo del 17-11 que atribuía tipo 2 al flag de transferencia carece de bloque literal recuperado y queda supersedido por la evidencia directa posterior, sin afirmar más de lo que muestra el branch. La cadena `type 2 → v8 → v16=8` permanece condicional hasta recuperar la instrucción que escribe `v8` y su flujo completo.


## 62. IBRService.Stub.asInterface: selección local vs Proxy — 2026-11-20

Se incorporó la evidencia 62: [`62_IBRSERVICE_STUB_ASINTERFACE_LOCAL_VS_PROXY.md`](evidence/2026-11-20/62_IBRSERVICE_STUB_ASINTERFACE_LOCAL_VS_PROXY.md).

El cuerpo completo de `IBRService$Stub.asInterface(IBinder)`, líneas físicas 71–107, fue compartido desde la extracción Smali local de Termux. Si el Binder es null, devuelve null. En caso contrario consulta `queryLocalInterface()` con el descriptor `com.miui.backup.service.IBRService`; si obtiene una interfaz no nula del tipo correcto, la devuelve directamente. En cualquier otro caso construye `IBRService$Stub$Proxy(p0)`.

**Conclusión:** la lógica de selección local/Proxy queda CONFIRMADA EN SMALI LOCAL COMPARTIDO. La rama efectiva para el Binder recibido por `MiAsistService$2.onServiceConnected()` continúa NO DETERMINADA. El recorrido Parcelable de `getBRItems()` aplica a la rama Proxy; no afirmar que toda llamada concreta cruza Parcel.

**Siguiente delta:** recuperar únicamente la apertura y atributos de `<application>` del manifest, sin repetir las declaraciones de servicios ya conservadas. Esto permitirá resolver el proceso predeterminado del paquete y evaluar la separación de `BRService` respecto de `MiAsistService` (declarado `:remote`). Mantener como UNKNOWN cualquier conclusión sobre la instancia Binder concreta que no se desprenda de la evidencia.


## 63. Proceso predeterminado de la aplicación y ruta Binder esperable — 2026-11-20

Se incorporó evidencia 63: [`63_MANIFEST_APPLICATION_PROCESS_AND_BINDER_ROUTE_INFERENCE.md`](evidence/2026-11-20/63_MANIFEST_APPLICATION_PROCESS_AND_BINDER_ROUTE_INFERENCE.md).

El usuario compartió la salida de Termux del bloque de `AndroidManifest.xml:82–117`. La apertura completa de `<application>` (línea 87) no contiene `android:process`. Por ello, las declaraciones de `BRService` (línea 112) y `TransFileService` (línea 113), que tampoco declaran proceso, heredan el proceso predeterminado del paquete. `MiAsistService` (línea 107) declara explícitamente `:remote`.

**Inferencia Android:** bajo la semántica estándar de procesos de componentes Android, `BRService` se ejecuta en el proceso predeterminado de la aplicación, mientras `MiAsistService` se ejecuta en el proceso separado `:remote`. Por tanto, para el enlace entre ambos, la ruta esperable de `IBRService$Stub.asInterface()` es fallback a `IBRService$Stub$Proxy`, no interfaz local. La conclusión combina el Manifest compartido con el cuerpo `asInterface()` de evidencia 62.

**Límite probatorio:** es una inferencia estática fuerte sobre la configuración declarada; no es observación runtime del Binder recibido ni excluye mecanismos no mostrados que alteren el contexto real. La instancia concreta devuelta y el transporte efectivo siguen sin confirmación dinámica. No presentar como prueba de ejecución.


## 64. Inicialización del Stub Binder de BRService y devolución por onBind — 2026-11-20

Se incorporó evidencia 64: [`64_BRSERVICE_BINDER_STUB_INITIALIZATION_AND_ONBIND_RETURN.md`](evidence/2026-11-20/64_BRSERVICE_BINDER_STUB_INITIALIZATION_AND_ONBIND_RETURN.md).

La salida directa compartida muestra que BRService crea `new BRService$1`, invoca su constructor con la instancia actual de BRService y almacena el objeto en `mBinder` (BRService.smali:2607–2611). El constructor de `BRService$1` guarda `this$0` y llama a `IBRService$Stub.<init>()`. Por tanto, `BRService$1` es el Stub concreto de `IBRService` usado por BRService.

El cuerpo de `BRService.onBind()` (18672–18679) lee `mBinder` y devuelve esa misma referencia como `IBinder`; no crea un Binder nuevo durante `onBind()`. **Conclusión estática:** el endpoint entregado por BRService es la instancia almacenada de `BRService$1`.

**Límite:** el fragmento grep no incluyó la cabecera del método que contiene la inicialización; no atribuirla a constructor/onCreate sin recuperar esa cabecera. Tampoco hay observación runtime del objeto concreto. La evidencia se clasifica `USER-PASTED-LOCAL-SMALI / DIRECT-CHAT`.


## 65. BRService$5.run(): condición v8 y códigos de salida v16 — 2026-11-20

Se incorporó evidencia 65: [`65_BRSERVICE_RESTORETHREAD_V8_V16_EARLY_EXIT_CODES.md`](evidence/2026-11-20/65_BRSERVICE_RESTORETHREAD_V8_V16_EARLY_EXIT_CODES.md).

La salida directa de Termux confirma la asignación de `v8`: `v0 == v5 → v8=1`; en caso contrario `v8=0` (BRService$5.smali:117–124). El significado de `v0` y `v5` no queda resuelto por el fragmento y no se afirma que equivalga a un valor concreto de `mBakFilesType`.

El bloque 1025–1090 confirma dos salidas anticipadas:
- `v8 != 0` → `v16=0x8` → salto a `:goto_3f`.
- `mIsFlashDriveTask == true` y `isUsbAvaliable() == false` → `v16=0x9` → salto a `:goto_3f`.

La salida grep también muestra que `v16` se prueba después en 3878 y 3997, y puede copiarse a `v14` en 3999. Antes, en 556–558, el mismo par de registros `v16:v17` se usa para el tamaño `long` de `mTransSingleItemMaxSize`; es reutilización de registros, no el mismo dato semántico.

**Reconciliación:** evidencias 10/51/60/61 ya describían ramas `mBakFilesType` y el flujo histórico de `v8/v16`, pero documentaban que la asignación literal de `v8` no estaba preservada. La evidencia 65 cierra esa brecha con el fragmento directo actual. No es un descubrimiento completamente nuevo. El mapping semántico de `v0/v5`, el significado externo de los códigos 8/9 y la propagación completa siguen pendientes.


## 18. 20-11-2026 — origen literal de v8 (evidencia 66)

**CONFIRMADO POR EXTRACCIÓN DIRECTA COMPARTIDA EN CHAT:** el fragmento físico `BRService$5.smali:90–124` muestra que `mBakFilesType` se obtiene mediante el getter sintético `-$$Nest$fgetmBakFilesType`, su resultado se mueve a `v0`, y luego `v5` recibe `const/4 v5, 0x2`. La comparación `if-ne v0, v5, :cond_1` conduce a `v8=1` cuando `mBakFilesType == 2`; en `:cond_1`, `v8=0`. Esto cierra la identidad semántica de los operandos que la evidencia 65 había dejado pendiente.

**Cadena consolidada con evidencia 65:** `mBakFilesType == 2` → `v8=1` → en `BRService$5.run()` línea física 1051 la condición `if-eqz v8, :cond_1c` no toma la rama normal; se asigna `v16=0x8` y se salta a `:goto_3f`. La salida temprana está confirmada a nivel de Smali compartido. La semántica externa del código 8 y sus efectos completos no se amplían por esta evidencia.

**Límites:** la evidencia confirma el valor de campo y la comparación; no demuestra por sí sola el origen upstream de `mBakFilesType` en cada tipo de operación, ni que el código 8 tenga una descripción concreta sin cotejar los recursos/consumidores correspondientes. No inferir que cualquier restauración de tipo 2 completa o falla de una forma determinada sin cerrar el resto del flujo.

**Procedencia:** salida de Termux pegada por el usuario, `sed -n '90,124p' "$F"`, sesión 2026-11-20. No se recalculó hash del Smali local en esta sesión. Clasificación `USER-PASTED-LOCAL-SMALI / DIRECT-CHAT`; no runtime.

**Siguiente delta:** seguir la escritura/origen de `mBakFilesType` y cotejar el código 8 con el método de notificación y recursos de error, evitando repetir la extracción ya conservada de la propagación de cierre.


## 67. ProgressItemAdapter: initData(), getView() y updateInfoView() — 2026-11-20

Se incorporó evidencia 67: [`67_PROGRESSITEMADAPTER_INITDATA_GETVIEW_UPDATEINFOVIEW.md`](evidence/2026-11-20/67_PROGRESSITEMADAPTER_INITDATA_GETVIEW_UPDATEINFOVIEW.md).

Se preservó el resumen recibido de la extracción de `ProgressItemAdapter`:

- `initData()`: reconstruye `mItems` conservando referencias a `BRItem`; estados 1/3/6 cuentan como finalizados y 1/6 como éxitos; para 1/6 puede recalcular `bakFileSize` y `completedSize`; SMS/contactos con `type==9` aportan `bakFileSize * 1000` a `mSuccessfulSize`; termina con `notifyDataSetChanged()`.
- `getView()`: infla `0x7f0d00df`, configura vistas y `ViewHolder`, copia `pkg/feature`, usa `ProgressItem.title`, delega estado/error a `updateSingleItemUI()` e instala `AccessibilityDelegate`.
- `updateInfoView()`: SMS/contactos para feature 1/2 muestran plural `0x7f10000c` usando `completedSize`; la regla general presenta porcentaje y, desde API 26, tamaño formateado de `BRItem.completedSize`, con tratamiento RTL/Bidi; la actualización requiere `ProgressPageFragmentBase.isAdded()`.
- Matriz de representación reportada: state 0 carga; 1/6 éxito; 2/4/5/7/8 progreso; 3 error según `BRItem.error`.

**Procedencia:** resumen de extracción directa trasladado por el usuario a chat, sin bloque Smali literal ni coordenadas físicas en el mensaje. Clasificación `USER-REPORTED-EXTRACTION-SUMMARY / DIRECT-CHAT`; no elevar a cotejo local independiente ni runtime.

**Pendiente inmediato:** resolver plural `0x7f10000c` y strings `0x7f120142`, `0x7f12014d`, `0x7f120149`, `0x7f120150`, `0x7f12014f`, `0x7f120143`, `0x7f1203de`. No repetir extracción de `getView()`, `initData()` ni `updateSingleItemUI()`. Véase evidencia 67.


------------------------------------------------------------------------

## 68. Alias de BRItem entre restoreLocalMediaFile() y ArchiveHelper — 2026-11-21

Se incorporó evidencia 68: [`68_RESTORELOCALMEDIAFILE_BRITEM_ALIAS_AND_ERROR_PROPAGATION.md`](evidence/2026-11-21/68_RESTORELOCALMEDIAFILE_BRITEM_ALIAS_AND_ERROR_PROPAGATION.md).

El call site reportado en `BRService.smali` mueve `p1` a `v5` (`move-object v5, p1`) y pasa esa misma referencia `BRItem` a la sobrecarga de siete argumentos de `ArchiveHelper.unzipFiles()`. Esto precisa la relación de identidad que la evidencia 49 no había registrado explícitamente desde el método contenedor. La evidencia 27 ya había localizado el invoke en `BRService.smali:12918` y dejó pendiente la procedencia del registro `v5`; evidencia 68 cierra ese punto concreto al recuperar `move-object v5, p1`. No presentar la identidad interna de `unzipFiles()` (evidencia 27) y el alias caller→helper (evidencia 68) como el mismo alcance.

**Consecuencia estática limitada:** el helper puede mutar `error` en el mismo objeto sobre el que `restoreLocalMediaFile()` realiza las transiciones de `state`. En la rama descrita, `state=1,error=1` es una combinación posible si el helper asigna error 1 y el contenedor termina con state 1 sin limpiar el error. No se afirma que la combinación se haya observado en runtime ni que ocurra en todos los casos.

**No duplicación:** las escrituras de `state/error` y el comportamiento del helper permanecen en evidencias 49 y 53; evidencia 68 conserva solo el alias explícito del call site y la consecuencia de propagación entre ambos métodos. Procedencia `USER-PASTED-SOURCE / DIRECT-CHAT`; no `LOCAL-VERIFIED`.


------------------------------------------------------------------------

## 69. Erratum — BRService.setState(IIII) ya documentado — 2026-11-21

Se corrigió la atribución de evidencia 69: el resumen de `BRService.setState(IIII)V` **ya estaba preservado** en evidencia 47, §3.1, y evidencia 26, §§1 y 3. La primera versión de evidencia 69 lo presentó incorrectamente como un hallazgo nuevo. El archivo de evidencia 69 fue reemplazado por un erratum explícito que marca esa duplicación.

No contar `setState(IIII)`, su normalización `state=3,error=9`, la liberación de WakeLock en stage 7 ni su mapeo de parámetros como nuevos hallazgos de esta ronda. El pendiente real, si se requiere para una pregunta causal, es recuperar/cotejar el cuerpo Smali literal, wrapper `setState(III)` y callers; el resumen semántico ya existe.

## 70. Ubicaciones escritoras adicionales BRItem.state/error — 2026-11-21

Se incorporó evidencia 70: [`70_SUPPLEMENTAL_BRITEM_STATE_ERROR_WRITER_LOCATIONS.md`](evidence/2026-11-21/70_SUPPLEMENTAL_BRITEM_STATE_ERROR_WRITER_LOCATIONS.md).

Se recuperaron ubicaciones de escritura no descritas en las evidencias 49/53 ni en los apartados del índice hasta evidencia 69:

- `ArchiveHelper.smali:1741` — grep reportado de `BRItem.error`, reconciliado con el writer `error=1` ya descrito en evidencia 27; no contar como writer adicional (evidencia 79).
- `CompatibilityActivity$1.smali:144/152` — escrituras reportadas de `BRItem.state/error`.
- `ProgressPageFragmentBase.smali:625` — escritura reportada de `BRItem.state`.
- `BRService$6.smali:1557/2128/2495` — escrituras reportadas de `BRItem.state`; línea 2101 de `BRItem.error`.
- `BRService$7.smali:53/58` — escrituras reportadas de `BRItem.state/error`.

**Clasificación:** ubicaciones recuperadas de resúmenes grep/conversación, sin bloques Smali literales conservados aquí. Valores, condiciones, encabezados de método y causalidad permanecen pendientes. No se duplican FakeBackupListenerImp, ProgressItemAdapter ni MiAsistService, ya descritos en otras evidencias.

La siguiente recuperación debe limitarse a los bloques de esas coordenadas, con encabezado/descriptor y ramas dominantes; no repetir búsquedas globales ni inferir valores a partir de otros escritores.


------------------------------------------------------------------------

## 71. Coordenadas complementarias BRItem.state/error — 2026-11-21

Se incorporó evidencia 71: [`71_SUPPLEMENTAL_BRITEM_STATE_ERROR_COORDINATES.md`](evidence/2026-11-21/71_SUPPLEMENTAL_BRITEM_STATE_ERROR_COORDINATES.md).

Se preservan tres ubicaciones físicas adicionales reportadas en `BRService.smali` (14173, 14178, 16697) que no aparecen en las evidencias 47/53; y siete referencias `iput/iget` de `BRItem.state/error` en `ProgressPageFragmentBase$ProgressItemAdapter.smali` (477, 582, 589, 1379, 1384, 1492, 1544). Estas últimas caen dentro de rangos ya inspeccionados y registrados en evidencia 09; no se debe repetir su extracción completa.

**Clasificación:** ubicaciones de grep recuperadas de conversación; no se conserva aquí el cuerpo literal de esas instrucciones. No asignar campo, valor, condición o método concreto sin cotejar cada instrucción.

**No duplicación:** evidencia 71 remite a evidencias 08/09/27/47/53/54/67/70 y no vuelve a documentar los métodos funcionales. La coordenada `ArchiveHelper.smali:1741` se reconcilió mediante recuperación histórica con la escritura `error=1` ya descrita en evidencia 27; no contarla como un segundo writer. Véase evidencia 79.


------------------------------------------------------------------------

## 72. BRService$5: delta de despacho de apps y postprocesamiento — 2026-11-21

Se incorporó evidencia 72: [`72_BRSERVICE_RESTORE_APP_DISPATCH_POSTPROCESS_DELTA.md`](evidence/2026-11-21/72_BRSERVICE_RESTORE_APP_DISPATCH_POSTPROCESS_DELTA.md).

Se recuperó una referencia histórica a `restoreStreamSplitApk(BRItem,ZipFile,InputStream)` alrededor de `BRService$5.smali:1683`, dentro de una extracción reportada de las líneas físicas 1653–1738. Evidencias 50/58 ya registran otro caller en la coordenada 1899. No fusionar 1683 y 1899: queda pendiente determinar si son dos invokes o distintas extracciones/builds.

Un resumen previo de la misma ruta reportó: reactivación del paquete cuando `getApplicationEnabledSetting(packageName)==2` mediante `setApplicationEnabledSetting(packageName,0,0)`; asignación `BRItem.error=1` en una ruta `IOException`; limpieza de temporales/sincronización de transferencias; y uso de `unpackBakSdDatas()` para WeChat/QQ. Estos efectos se clasifican como `RECOVERED-CHAT / PRIOR-ASSISTANT-SUMMARY`, no como fuente Smali literal en este registro.

**No duplicación:** evidencia 50/58 ya preserva las anclas de `restoreStreamSplitApk`, `prepareRestoringItems`, executor, `PerformAdbRestoreTask` y `BRManager.restorePackage`. Los cuerpos completos de estos métodos siguen pendientes; evidencia 72 añade solo la coordenada 1683, la discrepancia con 1899 y el resumen post-despacho.


------------------------------------------------------------------------

## 73. Reclasificación de escrituras literales BRService.state/error — 2026-11-21

Se incorporó evidencia 73: [`73_BRSERVICE_LITERAL_WRITES_RECLASSIFICATION.md`](evidence/2026-11-21/73_BRSERVICE_LITERAL_WRITES_RECLASSIFICATION.md).

Una recuperación de mensajes literales del usuario permitió elevar tres coordenadas previamente conservadas como grep en evidencia 71:

- `BRService.smali:14173`: `const/4 v0, 0x3` → `BRItem.state=3` en el objeto `p4`.
- `BRService.smali:14178`: `const/16 v0, 0x9` → `BRItem.error=9` en el mismo objeto `p4`.
- `BRService.smali:16697`: `const/4 v7, 0x6` → `BRItem.state=6` en el objeto `v10`.

Las dos primeras instrucciones forman una pareja de escrituras en el fragmento recuperado; no se atribuye causa ni condición sin el método completo. La tercera no se afirma que opere sobre el mismo objeto. Clasificación: `USER-PASTED-SOURCE / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.

**Corrección de procedencia, no nuevas ubicaciones:** las coordenadas ya estaban en evidencia 71; evidencia 73 conserva el contenido literal parcial y corrige su clasificación. El índice v0.73 no cuenta estas ubicaciones por segunda vez.


------------------------------------------------------------------------

## 74. Erratum de coordenadas restoreStreamSplitApk en BRService$5 — 2026-11-21

Se incorporó evidencia 74: [`74_RESTORESTREAMSPLITAPK_COORDINATE_PROVENANCE_ERRATUM.md`](evidence/2026-11-21/74_RESTORESTREAMSPLITAPK_COORDINATE_PROVENANCE_ERRATUM.md).

La recuperación dirigida del historial no encontró el supuesto bloque literal físico 1653–1738 ni el `invoke` atribuido a 1683; esa referencia queda como síntesis histórica no verificada. Para 1899, evidencias 50/58 conservan una referencia de grep, pero no un invoke literal ni una coordenada física inequívoca. El usuario sí había compartido un fragmento físico 3445–3468 con directivas `.line 1898` y `.line 1899` asociadas a escrituras de estado y `progType`; esto no prueba un call site en esa posición.

**Corrección:** no afirmar dos call sites, dos builds distintos ni que 1683/1899 sean coordenadas físicas comparables. Evidencia 72 fue corregida y enlaza a evidencia 74. Los cuerpos de `restoreStreamSplitApk` y métodos relacionados siguen pendientes.

------------------------------------------------------------------------

## 75. Contexto ampliado BRService y límite ArchiveHelper:1741 — 2026-11-21

Se incorporó evidencia 75: [`75_BRSERVICE_CONTEXT_EXPANSION_AND_ARCHIVEHELPER_GAP.md`](evidence/2026-11-21/75_BRSERVICE_CONTEXT_EXPANSION_AND_ARCHIVEHELPER_GAP.md).

Se recuperó contexto parcial adicional de dos bloques literales compartidos por el usuario:

- `BRService.smali` físico 14155–14178: recorrido de `Iterator`, cast de `p4` a `BRItem`, y escrituras `state=3` (14173) / `error=9` (14178) sobre ese objeto.
- `BRService.smali` físico 16679–16715: `v10` es un `BRItem` del bloque de totales; una rama depende de `p6`; 16697 escribe `state` usando `v7=6`; después hay acumulación de tamaño y otra escritura `state` en 16710 desde `v7`, sin conservar el valor vigente en esa segunda escritura.

No se recuperaron encabezados `.method` ni cuerpos completos para los dos bloques BRService. La recuperación posterior sí reconcilió `ArchiveHelper.smali:1741` con el writer `error=1` de evidencia 27; no es un writer adicional. Véase evidencia 79. Esta conclusión es `RECOVERED-CHAT`, no `LOCAL-VERIFIED`.


------------------------------------------------------------------------

## 76. Semántica recuperada de escritores BRService$6/$7 — 2026-11-21

Se incorporó evidencia 76: [`76_BRSERVICE_6_7_STATE_ERROR_WRITER_SEMANTICS.md`](evidence/2026-11-21/76_BRSERVICE_6_7_STATE_ERROR_WRITER_SEMANTICS.md).

La recuperación dirigida de conversaciones anteriores añadió semántica a las coordenadas ya inventariadas en evidencia 70:

- `BRService$6:1557`: conserva state para el caso `files_for_backup` cuando coincide `packageName`; de lo contrario asigna 4.
- `BRService$6:2128`: conserva state para `files_for_backup`; en la otra rama asigna 1.
- `BRService$6:2101`: escribe `BRItem.error` desde `v8`; el valor efectivo no se recuperó.
- `BRService$6:2495`: asigna state 3 en `:cond_42`, con el mensaje cercano `Backup One, result failed`.
- `BRService$7`, método `onZipFileSizeChanged(J,BRItem,String)`: en la rama verdadera de `mIsAborted`, líneas físicas 53/58 escriben state 3 y error 9 sobre el objeto `p3`.

Evidencia 70 fue ampliada con una remisión a evidencia 76. Son semánticas recuperadas de conversación/grep del usuario; no `LOCAL-VERIFIED`. No se añadieron ubicaciones nuevas ni se infirió el valor de error en 2101.


------------------------------------------------------------------------

## 77. Procedencia CompatibilityActivity y ProgressPageFragmentBase — 2026-11-21

Se incorporó evidencia 77: [`77_COMPATIBILITY_AND_PROGRESS_STATE_WRITER_PROVENANCE.md`](evidence/2026-11-21/77_COMPATIBILITY_AND_PROGRESS_STATE_WRITER_PROVENANCE.md).

- `CompatibilityActivity$1.smali:144/152`: grep literal reportado de `iput p1, v1` a `BRItem.state/error`; el origen y valor de `p1` siguen desconocidos.
- `ProgressPageFragmentBase.smali:625`: el grep reporta `iput v7, v10, BRItem.state`, pero un bloque literal conserva directiva `.line 625` para `getSuccessfulCount()` y composición de UI. El número puede ser línea física o directiva fuente; no equipararlos.
- Se conserva por separado el resumen de `initUI()` donde un `BRItem.state==6` puede cambiar a 1. No se confirma que sea la misma instrucción física que el grep 625.

Evidencia 70 fue corregida para marcar la coordenada ambigua. No se añaden writers ni se atribuye valor al `iput` sin cotejo.


------------------------------------------------------------------------

## 78. Separación de procedencia del registro v8 entre BRService$5 y BRService$6 — 2026-11-21

Se incorporó evidencia 78: [`78_BRSERVICE5_V8_CLUE_SEPARATION_FROM_BRSERVICE6.md`](evidence/2026-11-21/78_BRSERVICE5_V8_CLUE_SEPARATION_FROM_BRSERVICE6.md).

La recuperación de conversaciones encontró un bloque literal previo de `BRService$5` donde `v8=1` si `mBakFilesType==2` y `v8=0` en caso contrario; en ese método se usa después como condición de ruta. Esta información no resuelve el writer distinto reportado en `BRService$6.smali:2101`, que escribe el registro local `v8` en `BRItem.error`. La coincidencia de nombre de registro entre clases internas no prueba continuidad de valor ni equivalencia semántica.
**Erratum preventivo:** no transferir `v8=1/0` ni la condición `mBakFilesType==2` desde `BRService$5` a `BRService$6`. El valor efectivo de `BRService$6:2101` permanece desconocido; evidencia 76 sigue siendo la referencia de su estado pendiente. Evidencia 78 no añade writers ni convierte la pista histórica en verificación local.


------------------------------------------------------------------------

## 79. Reconciliación ArchiveHelper:1741 con el writer error=1 de evidencia 27 — 2026-11-21

Se incorporó evidencia 79: [`79_ARCHIVEHELPER_1741_DUPLICATE_OF_EVIDENCE27.md`](evidence/2026-11-21/79_ARCHIVEHELPER_1741_DUPLICATE_OF_EVIDENCE27.md).

La recuperación histórica aporta el encabezado del overload de siete argumentos de `ArchiveHelper.unzipFiles()` (línea física 1244), el alias `v1 <- p3` y el bloque `const/4 v0, 0x1` seguido de `iput v0, v1, ...BRItem;->error:I`, ya descrito en evidencia 27. El grep reportado en `ArchiveHelper.smali:1741` coincide con esa instrucción. La directiva fuente `.line 369` no debe confundirse con la coordenada física 1741.

**Corrección del inventario:** `ArchiveHelper:1741` no es un writer adicional; es el writer `error=1` del overload de siete argumentos ya documentado. Evidencias 70 y 75 fueron actualizadas para retirar la duplicación y reemplazar su estado previo `UNKNOWN`. La reconciliación procede de historial de conversación, no de verificación local actual.


------------------------------------------------------------------------

## 80. Vecindad BRService$6.error: lecturas 1997/2105 y writers 2101/2128 — 2026-11-21

Se incorporó evidencia 80: [`80_BRSERVICE6_ERROR_READ_WRITE_NEIGHBORHOOD.md`](evidence/2026-11-21/80_BRSERVICE6_ERROR_READ_WRITE_NEIGHBORHOOD.md).

La recuperación histórica reporta `iget BRItem.error` en 1997 y 2105, además de `iget BRItem.state` en 2120, alrededor del writer `iput v8, v11, ...BRItem.error` en 2101 y el writer de `BRItem.state` en 2128. Este delta conserva las coordenadas vecinas; no demuestra flujo de control ni que la lectura posterior consuma el valor escrito. La lectura de state en 2120 tampoco prueba por sí sola la condición de la escritura de state en 2128. El valor efectivo de `v8`, el método/descriptor y las ramas permanecen desconocidos. No transferir el significado de `v8` de `BRService$5` a `BRService$6` (evidencia 78).


------------------------------------------------------------------------

## 82. Bloque literal parcial de la rama state en BRService$6 — 2026-11-20

Se incorporó evidencia 82: [`82_BRSERVICE6_STATE_WRITER_LITERAL_BRANCH_CONTEXT.md`](evidence/2026-11-20/82_BRSERVICE6_STATE_WRITER_LITERAL_BRANCH_CONTEXT.md).

La recuperación del mensaje literal del usuario del 2026-11-19T21:22:58Z añadió el bloque atribuido a líneas físicas 2110–2128: compara una cadena en `v0` con `BRItem.packageName` de `v11`; si `equals()` es verdadero, lee y conserva `BRItem.state`; si es falso, carga `1`; finalmente escribe el resultado en `BRItem.state`. Esto contextualiza las ramas del writer 2128, previamente resumidas en evidencia 76.

**Límite:** no se recuperó el encabezado `.method` ni la definición previa de `v0`; no identificar todavía la cadena comparada como `files_for_backup`. El bloque no define `v8` ni resuelve el writer `BRItem.error` de 2101. Evidencia 80 mantiene abiertas las lecturas/escrituras vecinas y la causalidad entre error y state. Clasificación `USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.


------------------------------------------------------------------------

## 81. Contexto histórico adicional ProgressPageFragmentBase — 2026-11-20

Se incorporó evidencia 81: [`81_PROGRESSPAGEFRAGMENTBASE_RECOVERED_TRANSITION_CONTEXT.md`](evidence/2026-11-20/81_PROGRESSPAGEFRAGMENTBASE_RECOVERED_TRANSITION_CONTEXT.md).

La recuperación dirigida del historial añadió que una extracción literal descrita como líneas físicas 580–700 contenía, bajo directivas `.line 328–329`, una transición condicionada por `BRItem.state == 6` que escribe `state = v7`. El valor de `v7` no quedó identificado. No equiparar las directivas `.line 328–329` con las coordenadas físicas 618/625 ni concluir que ese writer sea el grep 625. Evidencias 70/77/80 mantienen abierto el cotejo físico y la relación entre la lectura de 618 y el writer 625.

**Clasificación:** `RECOVERED-CHAT / USER-REPORTED-SOURCE-CONTEXT`; no `LOCAL-VERIFIED`. El vacío de `ProgressPageFragmentBase` permanece abierto.

------------------------------------------------------------------------

## 83. Ampliación del inventario BRService$6.error — 2026-11-20

Se incorporó evidencia 83: [`83_BRSERVICE6_ERROR_READ_INVENTORY_EXPANSION.md`](evidence/2026-11-20/83_BRSERVICE6_ERROR_READ_INVENTORY_EXPANSION.md).

La recuperación del mensaje original del usuario del 2026-11-19T22:37:03Z preserva el inventario de doce coordenadas de `BRService$6.smali`. Añade la lectura de `BRItem.error` reportada en la línea física 2518 y respalda directamente la lectura de la línea 1877, que antes se había recuperado solo mediante un resumen posterior.

El inventario también incluye 1508, 1529, 1549, 1557, 1997, 2101, 2105, 2120, 2128 y 2495, ya documentadas en distintas evidencias. No demuestra que las instrucciones pertenezcan a una misma rama ni que las lecturas de error alimenten el writer 2101. La definición y el valor efectivo de `v8` siguen abiertos.

**Clasificación:** `USER-REPORTED-GREP / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.

------------------------------------------------------------------------

## 84. Pista de inicialización previa de v7 en ProgressPageFragmentBase — 2026-11-20

Se incorporó evidencia 84: [`84_PROGRESSPAGE_INITUI_V7_PREINITIALIZATION_CLUE.md`](evidence/2026-11-20/84_PROGRESSPAGE_INITUI_V7_PREINITIALIZATION_CLUE.md).

La recuperación de dos solicitudes del usuario del 2026-11-18 conserva que el rango físico 430–515 de `ProgressPageFragmentBase.smali`, identificado como `initUI()`, contiene `const/4 v7, 0x1`. Un rango posterior solicitado (580–700) contiene una lectura de `BRItem.state` y una escritura de state desde `v7`, con etiquetas y directivas `.line 324–343`. Evidencia 81 ya conservaba que en ese contexto se compara state con 6.

Esto estrecha el valor candidato de `v7` a 1, pero no demuestra que no exista una redefinición de `v7` entre ambos rangos ni que el writer sea inequívocamente el grep físico 625. No declarar cerrada la transición `6→1`; falta recuperar el bloque continuo y cotejar encabezado, etiquetas y coordenadas.

**Clasificación:** `RECOVERED-CHAT / USER-REPORTED-SOURCE-CONTEXT`; no `LOCAL-VERIFIED`.


------------------------------------------------------------------------

## 85. Sitios adicionales de uso de v8 en BRService$5.run() — 2026-11-21

Se incorporó evidencia 85: [`85_BRSERVICE5_V8_ADDITIONAL_USE_SITES.md`](evidence/2026-11-20/85_BRSERVICE5_V8_ADDITIONAL_USE_SITES.md).

La recuperación del mensaje original del usuario del 2026-11-20T23:28:05Z conserva el grep de referencias a `v8` en `BRService$5.smali`: definiciones en 119/124 y usos en 1051, 1235 (`move/from16 v35, v8`) y 1728 (`if-eqz v8, :cond_2d`). Las definiciones 119/124 y el uso 1051 ya estaban documentados en evidencias 65/66; el delta nuevo son las coordenadas 1235 y 1728.

No se recuperó el bloque literal alrededor de 1235 ni de 1728. No se atribuye significado a `v35`, no se infiere el efecto de `:cond_2d` y no se afirma que esos usos estén controlados por las definiciones 119/124 sin cotejar el flujo completo.

**Clasificación:** `USER-REPORTED-GREP / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.


------------------------------------------------------------------------

## 86. Inventario ampliado de referencias v8 en BRService$5 — 2026-11-21

Se incorporó evidencia 86: [`86_BRSERVICE5_V8_ADDITIONAL_REFERENCE_INVENTORY.md`](evidence/2026-11-21/86_BRSERVICE5_V8_ADDITIONAL_REFERENCE_INVENTORY.md).

La recuperación del mensaje del usuario del 2026-11-20T23:28:05Z amplía el grep de `BRService$5.smali` con referencias físicas reportadas en 2297, 2364, 2391 y 3807, además de 1235/1728 ya registradas en evidencia 85.

La referencia 2364 se coteja con un bloque Smali literal previo (físico 2338–2364): después de leer `BRItem.feature` y `BRItem.error`, aparece `move/from16 v35, v8`, en el mismo fragmento que incluye una escritura `BRItem.state=6`. No fusionar esta coordenada con la copia reportada en 1235: son sitios distintos. El significado de `v35` y su consumidor posterior no están establecidos.

Las referencias 2297, 2391 y 3807 permanecen como grep sin instrucción literal recuperada. Tampoco se recuperó el bloque alrededor de 1728 ni los efectos de `:cond_2d`. No se atribuye semántica a `v8/v35`, ni se demuestra que todas las referencias dependan de las definiciones 119/124.

**Clasificación:** `USER-REPORTED-GREP / USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`. No se ejecutaron comandos locales.

------------------------------------------------------------------------

## 87. Recuperación histórica de contexto literal BRService$5 — 2026-11-21

Se incorporó evidencia 87: [`87_BRSERVICE5_HISTORICAL_LITERAL_CONTEXT_RECOVERY.md`](evidence/2026-11-21/87_BRSERVICE5_HISTORICAL_LITERAL_CONTEXT_RECOVERY.md).

La recuperación de mensajes originales del usuario del 2026-11-17T23:20:47Z añade contexto literal parcial para dos referencias ya inventariadas en evidencia 85:

- En torno a `BRService$5:1728`, `if-eqz v8, :cond_2d` aparece después de `:cond_2c` y del log `"Restore One, checked bak"`. El camino de caída comienza a construir un `File` usando `getTransTempBackupRootPath()` y el nombre `.tmp_bak_file`. El cuerpo de `:cond_2d` no se recuperó.
- En torno a `BRService$5:1235`, se recupera el contexto parcial `:cond_1f` / `:goto_10` / `move/from16 v35, v8` / `goto/16 :goto_2f`; el contexto previo fue descrito como comparación de `packageName`, sin recuperar sus instrucciones completas.

Mensajes separados del 2026-11-17T23:35:19Z–23:36:25Z también describen `:goto_21` con escritura `BRItem.error`, `:cond_39`/`:goto_22`, otra copia `v35 <- v8` en 1738 bajo `:cond_3c`, y notificaciones `notifyItemTaskError(...,7)` / `notifyItemTaskEnd()` cerca de 1753–1755. Debido a solapamientos y discrepancias de coordenadas/etiquetas, no se ensamblan con el extracto 1690–1750 como un único bloque continuo.

**Límites:** no se recuperó el cuerpo de `:cond_2d`, no se demuestra que las definiciones 119/124 dominen el uso 1728, no se identifica el consumidor de `v35`, ni se resuelve definitivamente el significado de `v8`. Clasificación `USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`. Evidencias 85/86 no se duplican.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 88. Recuperación histórica del bucle ZIP y fallo de restauración BRService$5 — 2026-11-21

Se incorporó evidencia 88: [`88_BRSERVICE5_ZIP_LOOP_AND_RESTORE_FAILURE_CONTEXT.md`](evidence/2026-11-21/88_BRSERVICE5_ZIP_LOOP_AND_RESTORE_FAILURE_CONTEXT.md).

La recuperación dirigida de mensajes originales del usuario del 2026-11-17T23:21:54Z, 23:26:16Z y 23:27:21Z añade contexto localizado:

- En el rango físico aproximado 3190–3345 (`.line 1861–1881`), `v8` fue descrito como índice de un bucle `ArrayList`; `v5` participa en `ZipFile.getEntry/getInputStream`, y el stream se asigna a `v7` antes de `copyFileFromStream`. Se reportaron handlers `:catch_b`/`:catch_c` y el log `"copyFileFromStream error"`.
- En la región física aproximada 3578–3615 (`.line 1952–1953`), se recupera la rama de restauración fallida: `onError(...,6)` / `notifyItemTaskError(...,6)`, `onRestoreEnd()`, logs `"Restore failed, for : "` y `"bakFile = "`; con `v5 == null`, `BRItem.error=1` si `bakFile` existe y `10` si es null/no existe.
- El resumen general de `error=1/10` y notificaciones ya constaba en la sección histórica del 18-11 y evidencia relacionada; no se cuenta como writer nuevo. La aportación específica es preservar timestamps/coordenadas y separar de forma explícita el uso de `v8` como índice local en la región ZIP.

**Límites:** esta recuperación no dispone del bloque Smali literal íntegro ni del método continuo. No demuestra que el `v5` descrito en la región ZIP conserve el valor hasta la región de error, ni permite transferir el significado de `v8` a otros offsets de `BRService$5`. Clasificación `RECOVERED-CHAT / USER-PASTED-SMALI`; no `LOCAL-VERIFIED`.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 89. Separación de usos disjuntos de v8 en BRService$5 — 2026-11-21

Se incorporó evidencia 89: [`89_BRSERVICE5_V8_DISJOINT_REGISTER_USE_RECONCILIATION.md`](evidence/2026-11-21/89_BRSERVICE5_V8_DISJOINT_REGISTER_USE_RECONCILIATION.md).

La recuperación de análisis históricos distingue tres ubicaciones:

- Físico 2787–2790: un resumen del 2026-11-19T22:13:43Z describe `v8` como valor 3 en una ruta asociada a `mIsAborted`, con escritura `BRItem.state=3` en 2790.
- Físico 3211, dentro del rango ZIP 3190–3345: un resumen del 2026-11-19T21:22:13Z conserva `if-ge v8, v0`; el mensaje del usuario del 2026-11-17T23:26:16Z ya describía `v8` como índice del bucle `ArrayList`.
- Directivas fuente `.line 1897–1898`: un resumen del 2026-11-19T04:40:43Z conserva `const/4 v8, 0x7`, seguido de una escritura de `v4` (no `v8`) a `BRItem.state`. Por tanto, ese fragmento no demuestra `state=7`.

**Límites:** las ubicaciones proceden de resúmenes históricos del asistente salvo la descripción del usuario del bucle ZIP. No se recupera un bloque literal continuo ni se demuestra continuidad/dominancia de `v8` entre regiones. Clasificación mixta `RECOVERED-CHAT`; no `LOCAL-VERIFIED`.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 90. Contexto parcial de writers v10 en BRService$5 — 2026-11-21

Se incorporó evidencia 90: [`90_BRSERVICE5_V10_STATE_WRITER_CONTEXT.md`](evidence/2026-11-21/90_BRSERVICE5_V10_STATE_WRITER_CONTEXT.md).

La recuperación de mensajes del usuario del 2026-11-19 añade contexto parcial a dos escrituras ya inventariadas:

- Físico 1336 (`.line 1569`): tras `if-nez v14, :cond_23`, `iput v10, v6, ...BRItem.state:I`; inmediatamente después, `iput v3, v6, ...BRItem.error:I`.
- Físico 1441 (`.line 1589`): tras comprobaciones relacionadas con `isGMSAPP`, `iput v10, v6, ...BRItem.state:I`; después, `const/16 v0, 0xd` y `iput v0, v6, ...BRItem.error:I`.

Las escrituras de `state=v10` ya estaban en el inventario previo; no se cuentan como hallazgo nuevo. El delta es la relación local con las guardias y los writers de error. La procedencia/valor de `v10` permanece desconocida en ambos sitios.

**Límites:** no se recuperó definición dominante de `v10`, método completo ni todas las condiciones. No se infiere un estado numérico. Clasificación `USER-REPORTED-GREP / USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 91. Referencias v10 y contexto de ramas BRService$5 — 2026-11-21

Se incorporó evidencia 91: [`91_BRSERVICE5_V10_REFERENCE_AND_BRANCH_CONTEXT.md`](evidence/2026-11-21/91_BRSERVICE5_V10_REFERENCE_AND_BRANCH_CONTEXT.md).

La recuperación de mensajes originales del usuario del 2026-11-19 amplía el inventario de `v10`:

- Física 134: `const/4 v10, 0x3` (definición reportada; método y alcance no recuperados).
- Física 1283: writer `state=v10` en rama `:cond_22`, descrita como aplicación Pad deshabilitada; contexto parcial incluye `:goto_12`, `if-eqz v0, :cond_22`, `.line 1560` y constantes previas `v4=0xa`, `v16=8/9`.
- Física 1336: writer `state=v10` en rama `:cond_23`, descrita como paquete de sistema inexistente; guardia reportada `if-nez v14, :cond_23`; a continuación `error=v3`.
- Física 1441: writer `state=v10` después de comprobaciones `isGMSAPP), descrita como GMS no instalado; a continuación `error=0xd`.
- Físicas 1641/1675: `const/4 v10, 0x7`; física 1701: `if-nez v10, :cond_2c`; física 1781: `move-object v10, v4`.

**Límites:** las escrituras 1283/1336/1441 ya estaban inventariadas; no son writers nuevos. No se recuperaron límites de método ni flujo continuo. No se demuestra que `v10=3` en 134 o `v10=7` en 1641/1675 alcance cualquiera de esas escrituras. El valor efectivo de `state` sigue sin resolverse. Clasificación `RECOVERED-CHAT`; no `LOCAL-VERIFIED`.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 92. Flujo ZIP, aborto y cierre BRService$5 — 2026-11-21

Se incorporó evidencia 92: [`92_BRSERVICE5_ZIP_LOOP_ABORT_AND_CLOSE_CONTEXT.md`](evidence/2026-11-21/92_BRSERVICE5_ZIP_LOOP_ABORT_AND_CLOSE_CONTEXT.md).

La recuperación de mensajes originales del usuario del 2026-11-17T23:26:16Z y 23:26:48Z amplía el flujo descrito en evidencia 88:

- En las directivas fuente `.line 1861–1873` se reportan `const/4 v7, 0x0`, `const/4 v8, 0x0`, etiqueta `:goto_32`, iteración con `v8`, y una ruta de aborto que carga `v10=9` y escribe `BRItem.error=9`.
- En `.line 1881–1900` se reportan `:goto_33`, log `"copyFileFromStream error"`, incremento de `v8` y retorno a `:goto_32`; el cierre fallido y la lista restaurada vacía conducen a notificaciones con código 7. En el contexto de cierre se reportan `BRItem.state=1` y `progType=0`.
- El código 7 de notificación no se equipara a una escritura `BRItem.error=7` o `BRItem.state=7`. El aborto `error=9` es distinto de la rama posterior `v5==null` con `error=1/10` ya documentada en evidencia 88.

**Límites:** son fragmentos/contextos recuperados del chat, no transcripción completa; no se recuperaron condiciones ni coordenadas físicas completas. El `v10=9` de esta rama no se conecta con los writers state `v10` 1283/1336/1441. Clasificación `USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 93. Recuperación cronológica parcial y límites de cobertura — 2026-11-21

Se incorporó evidencia 93: [`93_CHRONOLOGICAL_RECOVERY_COVERAGE_LIMITS.md`](evidence/2026-11-21/93_CHRONOLOGICAL_RECOVERY_COVERAGE_LIMITS.md).

La recuperación de memoria confirma el punto de continuidad `ProgressItemAdapter.updateInfoView()` y los ocho recursos pendientes (un plural `0x7f10000c` y siete strings `0x7f120...`). La semántica funcional ya estaba resumida; no se repitió el análisis ni se registró una nueva conclusión técnica.

Se conserva la pauta de recuperación por intervalos consecutivos de 30 minutos desde `2026-11-19 18:56:55 UTC`. La recuperación disponible no contiene transcripciones completas ni demuestra cobertura íntegra de esos intervalos; por ello ninguno se marca como revisado. La ausencia en memoria resumida no prueba ausencia en el historial.

**Clasificación:** `RECOVERED-CHAT / CONTINUITY-ONLY`; no `LOCAL-VERIFIED`. Continuar con mensajes originales y cotejo contra evidencias existentes, sin repetir extracciones de `updateInfoView()`.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 94. Rutas de restauración de cinco y siete argumentos; recepción CMD_RESTORE — 2026-11-21

Se incorporó evidencia 94: [`94_RESTORE_OVERLOAD_RECURSION_AND_CMD_RESTORE_RECEIVER.md`](evidence/2026-11-21/94_RESTORE_OVERLOAD_RECURSION_AND_CMD_RESTORE_RECEIVER.md).

**Auditoría adversarial 2026-11-22:** memoria persistente confirma que el usuario pegó los fragmentos Smali literales A–D el 2026-11-17T03:27:35Z (rutas `$HOME/backup-static/decoded/smali/...`), pero la búsqueda actual no recuperó el payload literal; el contenido técnico permanece resumido y no debe reconstruirse. El mensaje del 03:29:25Z también contenía una salida parcial literal de `CMD_RESTORE` y quedó cortado al leer `extra_zip_file_path`; la continuación posterior hasta `restoreFiles(...)` ya está en el addendum de evidencia 94. La búsqueda confirmó que el stdout completo del barrido global `BRItem.state/error` del 2026-11-19T22:37:46Z no está disponible en la memoria consultada; no sintetizarlo desde resúmenes parciales.

El resumen compartido por el usuario distingue dos rutas que no deben mezclarse:

- La sobrecarga de cinco argumentos `startRestoreCommand(Context, ArrayList, BackupDescriptor, String, int)` se reporta como autorrecursiva: invoca la misma firma con los mismos argumentos y retorna solo después de esa llamada, sin condición de salida ni delegación a siete argumentos. Se reportan como llamadores `MiAsistService.startRestoreCommand()` y `BRService.restoreTransfering()` cuando `brState == 4`.
- Se recupera un llamador adicional: `RetransferUtils.smali:154` → `BRService.restoreTransfering(Context, BackupDescriptor)`. Esto amplía la cadena de posibles entradas a la sobrecarga recursiva.
- Existe una ruta independiente desde `ProgressPageFragmentBase$6.smali:275` que invoca directamente la sobrecarga de siete argumentos con datos recuperados de un Bundle y contexto de restauración.
- La sobrecarga de siete argumentos prepara `CMD_RESTORE`, extras de descriptor/directorio/ZIP/tipo/lista y llama a `Context.startService(Intent)`; se reporta una condición adicional de inicio en primer plano en determinadas circunstancias de Android API 26+.
- `BRService.onStartCommand()` reconoce `CMD_RESTORE` y recupera parte de sus extras y descriptor, pero la recuperación inicial se interrumpía al comenzar a leer `extra_zip_file_path`, pero el mensaje histórico del usuario del 2026-11-17T05:16:53Z conserva continuación hasta `restoreFiles(...)`: lista no vacía → `toArray()` y `restoreFiles(BRItem[], v6, v3)`; lista vacía → `restoreFiles(null, v6, v3)` solo si `v3==3` o `mIsReStartCommand`; de otro modo log `restoreFiles brItems is null` y `setState(...)`. Física 19417–19426 ancla la lectura de ZIP; `.line 913/915` ancla las llamadas, no líneas físicas.

**Límites y clasificación:** `USER-PASTED-SUMMARY / RECOVERED-CHAT`, no `LOCAL-VERIFIED`. No se recibió aquí el Smali literal completo para cotejo independiente. La ejecución efectiva, la equivalencia de ambas rutas, la accesibilidad externa y la autorización siguen sin demostrarse. No clasificar como vulnerabilidad.

La evidencia 94 amplía la continuidad; no sustituye ni reanaliza los hallazgos previos de Binder, servicios o el flujo ZIP de `BRService$5`. La continuación parcial de `CMD_RESTORE` se corrigió en evidencia 105; no repetir la búsqueda histórica del mismo bloque. Falta el cotejo local y la recuperación del texto fuente íntegro.



------------------------------------------------------------------------

## 95. Índice visual de títulos de chats recuperados — 2026-11-21

Se incorporó evidencia 95: [95_CHAT_TITLE_INDEX_SCREENSHOT.md](evidence/2026-11-21/95_CHAT_TITLE_INDEX_SCREENSHOT.md).

La captura compartida por el usuario aporta 14 títulos visibles relacionados con Binder/procesos, MiAsistService, Parcelable, BRService, unzipFiles, inventarios Smali, historial y códigos. Dos rótulos aparecen truncados o podrían ser texto del chat abierto: “Continuar investigación pendie…” y “Referencias v8”.

**Límite:** los títulos son pistas de navegación, no evidencia técnica ni prueba de cobertura. No se atribuyen hallazgos a un chat por su nombre ni se infiere que la lista sea completa. Clasificación USER-PROVIDED-SCREENSHOT / CHAT-TITLE-INDEX; no LOCAL-VERIFIED.


------------------------------------------------------------------------

## 96. Recuperación histórica dirigida de cinco objetivos pendientes — 2026-11-21

Se incorporó evidencia 96: [96_TARGETED_HISTORICAL_RECOVERY_FIVE_OPEN_OBJECTIVES.md](evidence/2026-11-21/96_TARGETED_HISTORICAL_RECOVERY_FIVE_OPEN_OBJECTIVES.md).

La recuperación dirigida no devolvió cuerpos completos para `RetransferUtils.restoreTransfering()`, `BRService.restoreTransfering(Context, BackupDescriptor)`, `TransFileService/ITransFileService`, `CompatibilityActivity$1` ni `ProgressPageFragmentBase`. Para `BRService.onStartCommand()` sí se recuperó una continuación parcial de `CMD_RESTORE` posterior a `extra_zip_file_path` (evidencia 105); no se recuperó el bloque consecutivo íntegro.

La recuperación sí devolvió detalles de `IBRService.getBRItems()` (transacción 5) y `IBRService$Stub.asInterface()`; ambos se cotejaron como duplicados de evidencias 45 y 62 y no se registran como hallazgos nuevos.

**Clasificación:** `RECOVERED-CHAT / CONTINUITY-ONLY`; no `LOCAL-VERIFIED`. Se mantienen abiertos los cinco objetivos y se registra esta ronda para evitar repetir búsquedas históricas idénticas. El addendum de evidencia 96 registra además contexto USER-FACT del 2026-11-16 sobre `IBRService.Stub.onTransact()` (descriptor, `enforceInterface`, IDs 1–14 y tipos Parcel) y el orden reportado del gate `MiAsistService.onStartCommand()`; no se recuperó código literal ni se atribuyó ese transporte a `TransFileService`. El mismo expediente añade el ciclo de vida caller-side de `TransFileService` desde `MiAsistService`: Intent explícito, `startService` + `bindService`, `connectToHost`/`acceptDevice`, unregister/unbind y cleanup en `onDestroy`; añade también preservación de `lastModified` durante unzip. Estos datos son USER-FACT/RECOVERED-CHAT, no el cuerpo ni el contrato Binder interno de `ITransFileService`.

------------------------------------------------------------------------

## 97. Bootstrap de listener Binder en BRService — 2026-11-21

Se amplió la evidencia 96 con un delta histórico del lado servidor:

- `BRService$1` extiende `IBRService$Stub`; su constructor conserva `this$0` e invoca el constructor del Stub.
- `registerBRListener(IBRServiceListener)` agrega el listener a `mRemoteCallbackList` y, según el dato histórico recuperado, le envía inmediatamente `onServiceStateChange(IIII)` con el estado actual.
- `BRService` conserva el Binder en `mBinder`, creado como `new BRService$1(this)`; `onBind()` devuelve esa referencia.
- `MiAsistService` declara `mBRService`, `mBRServiceConnection` y `mBRServiceListener`; instancia la conexión como `new MiAsistService$2(this)`.

**Delta real:** el registro de listener no solo conserva la referencia en `mRemoteCallbackList`; el contexto histórico reporta una notificación inmediata de estado al listener recién registrado. Los detalles generales de `MiAsistService$2` ya estaban preservados y no se duplican.

**Procedencia:** `USER-FACT / RECOVERED-CHAT` del 16-11-2026; no bloque Smali literal recuperado en esta ronda ni `LOCAL-VERIFIED`. No se recuperaron los cuatro valores concretos enviados a `onServiceStateChange(IIII)`, ni semántica de sincronización o manejo de fallos. Véase evidencia 96, addendum “BRService Binder listener bootstrap”.

------------------------------------------------------------------------

## 98. Alcance de autorización visible en IBRService.Stub.onTransact — 2026-11-21

La evidencia 96 incorpora una observación acotada del bloque `IBRService.Stub.onTransact` compartido directamente por el usuario el 16-11-2026:

- El fragmento muestra `enforceInterface("com.miui.backup.service.IBRService")` y el despacho de las transacciones 1–14.
- En las ramas visibles no se identificó una comprobación explícita adicional de UID o permisos del caller (`getCallingUid`, `checkCallingPermission`, `enforceCallingPermission` u otra equivalente).
- `enforceInterface` valida el descriptor Binder; por sí solo no demuestra autorización por UID/permiso.

**Límite de seguridad:** no equivale a demostrar acceso irrestricto ni una vulnerabilidad. La alcanzabilidad continúa condicionada por `exported`, obtención real del Binder, permisos, identidad de proceso, controles en métodos llamados y capas externas. La observación se limita al bloque compartido, no a todo el APK/framework.

**Procedencia:** `USER-PASTED-SOURCE / DIRECT-CHAT`, no `LOCAL-VERIFIED` en esta ronda. Véase evidencia 96, addendum “alcance de la comprobación de identidad en IBRService.Stub.onTransact”.


------------------------------------------------------------------------

## 99. Callbacks de descriptor y transferencia en MiAsistService$5/$6 — 2026-11-21

Se amplió la evidencia 96 con recuperación histórica de los callbacks:

- **$5:** después de la conexión actualiza `mConnectionState`; participa en el envío del descriptor y transición a `STAGE_BRSERVICE_BR_START`; procesa el descriptor seleccionado recibido en `STAGE_SELECT_DESCRIPT_RECEIVED`, con referencias a `mBackupDescriptor`, `mReceivedItemFiles` y `mHandler`. Inventario de callbacks reportado: progreso/notificación 155 y 181–195; recepción de descriptor 675; acción backup 683–687; archivos recibidos/Handler 769–778; llamadas a `setState` en 225, 314, 367, 528, 555, 578 y 745.
- **$6:** callback de `sendAllBRItemsDescriptor()`; consulta fecha, tamaño, items, acción, etapa y error; sincroniza/espera `mAppIconsLoadSyncer` y `mIsLoadAppIconsDone`; participa en `doSendFile(String)`. Ante fallo se reporta `STAGE_START_DESCRIPT_SENDING` + `ERR_WRITE_DESCRIPTOR`. Referencias reportadas a `sendAllBRItemsDescriptor()`/`doSendFile()` en 8/185 y `setState` en 245.

**Delta:** se conserva la relación entre el callback $5 y la recepción/selección del descriptor, y el resumen funcional de $6 como callback de envío, sin duplicar códigos/etapas ya indexados.

**Procedencia y límites:** `USER-FACT / RECOVERED-CHAT`, mensajes del 2026-11-16T16:46:59Z y 2026-11-16T18:06:58Z. No se recuperó en esta ronda el cuerpo Smali íntegro; coordenadas históricas reportadas, no `LOCAL-VERIFIED`. No se infiere el protocolo de transporte, la semántica exacta de la espera ni la atomicidad del envío. Véase evidencia 96, addendum “callbacks de transferencia y descriptor en MiAsistService$5/$6”.


------------------------------------------------------------------------

## 100. Inventario de referencias BRItem en callbacks y carga UI — 2026-11-21

Se amplió la evidencia 96 con un inventario grep histórico del 2026-11-20T00:04:42Z:

- `BRService$11` contiene referencias a `mBRItems` en las coordenadas físicas reportadas 69, 527, 594, 844, 916, 1122, 1296, 1666 y 1735.
- `BRService$6` contiene referencias reportadas en 106, 259, 306, 569, 944, 952, 973, 1226, 1235, 1343, 1351, 1372, 3417, 3528, 3557 y 3746.
- `ProgressPageFragmentBase$7$1` a `$7$7` llaman `IBRService.getBRItems()` y luego `ProgressItemAdapter.initData(BRItem[])` (rango reportado 97–180); el bloque base presenta referencias de carga en 676–719.

**Delta:** se identifican los siete callbacks UI concretos y se preservan las coordenadas de referencias a `mBRItems` en `BRService$6/$11`. El contrato Binder `getBRItems()`, el caller de `MiAsistService` y la semántica general de `ProgressItemAdapter.initData()` ya estaban documentados y no se repiten como hallazgos nuevos.

**Procedencia y límites:** `USER-FACT / RECOVERED-CHAT`, salida grep reportada el 2026-11-20T00:04:42Z; no bloques Smali completos ni `LOCAL-VERIFIED`. Las referencias no prueban si cada acceso lee o escribe, ni su método/condición/orden. No inferir una llamada Binder distinta por cada callback ni mutación de cada referencia. Véase evidencia 96, addendum “inventario de referencias BRItems en callbacks y carga de UI”.


## 101. BRService$11: guard de índice activo y progreso de restauración — 2026-11-21

La recuperación histórica del chat del 2026-11-19T04:43:51Z añade precisión al comportamiento de los callbacks de inicio:

- `onBackupStart()` y `onRestoreStart()` comprueban `checkRunningTaskIndex()` antes de operar con el elemento activo.
- La ruta reportada accede a `mBRItems[mRunningItemIndex]`, asigna `state=2` y notifica el inicio correspondiente.
- `onRestoreProgress()` notifica el progreso de restauración.

**Qué no es nuevo:** la escritura de `state=2`, la gestión de `state=3`/errores y la traducción `p3→BRItem.error` ya estaban en sección 22/evidencias 08 y 15. Las referencias grep a `mBRItems` ya están en sección 100/evidencia 96. El delta aquí es el guard `checkRunningTaskIndex()`, el acceso indexado mediante `mRunningItemIndex` y la notificación de progreso.

**Procedencia y límites:** `USER-PASTED-SOURCE / RECOVERED-CHAT`, mensaje histórico del usuario del 2026-11-19T04:43:51Z. No se recupera en esta ronda el bloque Smali literal ni se verifican las ramas completas, argumentos de notificación o conducta cuando el guard falla. No `LOCAL-VERIFIED`; no inferir sincronización ni exclusión mutua. Véase evidencia 96, addendum “BRService$11 start/progress callbacks”.


## 102. BRService$11: coordenadas de escrituras state reportadas por grep — 2026-11-21

La recuperación de la búsqueda literal del 2026-11-19T04:37:50Z conserva cinco coordenadas físicas reportadas para escrituras de `BRItem.state` en `BRService$11.smali`: **766, 863, 1141, 1589 y 1754**.

**Delta frente a sección 22:** el tipo general de comportamiento (inicio con state 2 y manejo de error con state 3) ya estaba documentado; el inventario de sección 100 recogía referencias a `mBRItems`, no las coordenadas concretas de estas escrituras. Se añade solo la lista de coordenadas.

**Procedencia y límites:** `USER-FACT / USER-REPORTED-GREP / RECOVERED-CHAT`, mensaje del usuario 2026-11-19T04:37:50Z. No se recuperó stdout original ni contexto Smali. No asignar método, valor, rama, elemento ni orden a las posiciones individuales; no afirmar exhaustividad ni `LOCAL-VERIFIED`. La línea 1589 corresponde aquí a `BRService$11.smali`, no a otros archivos. Véase evidencia 96, addendum “coordenadas grep de escrituras BRItem.state en BRService$11”.


------------------------------------------------------------------------

## 103. MiAsistService$8: coordenadas recuperadas de métodos y campos — 2026-11-21

Se incorporó evidencia 103: [103_MIASSISTSERVICE8_COORDINATE_RECOVERY.md](evidence/2026-11-21/103_MIASSISTSERVICE8_COORDINATE_RECOVERY.md).

La recuperación del chat “Reconstrucción de MiAsistService” (mensajes del usuario del 2026-11-16T21:06:49Z y continuación 21:07:00Z) conserva 18 anclas físicas reportadas en `MiAsistService$8.smali`:

- 297: `updateAppBRItemSize`; 541: `loadFileBRItemByType`; 671: `updateItemTotalSize`.
- 796/799/811/813: referencias a `mCurrentDate`; 827/867/869: referencias a `mCurrentRootPath`.
- 959: `mTotalSize`; 1059/1061/1064: `loadAppBRItems` / `loadFileBRItems`.
- 1132: `updateBakFilePath`; 1191: `mAllBRItems`; 1220–1347: progreso/notificación; la continuación en 1347 menciona `-$$Nest$fputmLastUpdateTime`.
**Delta frente a sección 40:** la responsabilidad general y los nombres de métodos de `$8` ya estaban resumidos; no estaban preservadas estas coordenadas físicas concretas. Se añade únicamente el inventario de anclas.

**Procedencia y límites:** `USER-PASTED-SMALI / RECOVERED-CHAT`, pero el contexto recuperado contiene líneas/anclas sueltas y referencias, no cuerpos completos ni encabezados `.method`. No atribuir ramas, valores, orden, efectos ni semántica de sincronización no conservados. No `LOCAL-VERIFIED`; no afirmar exhaustividad. Véase evidencia 103.


------------------------------------------------------------------------

## 104. ProgressPageFragmentBase$6: lecturas Bundle antes de startRestoreCommand — 2026-11-21

Se incorporó evidencia 104: [104_PROGRESSPAGEFRAGMENTBASE6_BUNDLE_READS.md](evidence/2026-11-21/104_PROGRESSPAGEFRAGMENTBASE6_BUNDLE_READS.md).

La recuperación del mensaje del usuario del 2026-11-17T03:27:35Z añade detalle a la ruta de siete argumentos ya resumida en sección 94: en `ProgressPageFragmentBase$6.smali`, ventana física 245–290, se reportan lecturas de Bundle para `extra_descriptor`, `extra_descriptor_dir` y `extra_zip_path`, mediante `getParcelable`, `getString` (con default en `v1`) y `getInt` (con uso de `v6`). Se conserva además `.line 1187`, registros `v4`–`v10` y la llamada en línea física 275.

**Delta frente a sección 94:** se precisan claves, métodos de lectura, ventana física y registros; no se vuelve a registrar la llamada de siete argumentos como hallazgo nuevo.

**Límites:** no se recuperó el bloque íntegro ni el encabezado `.method`; faltan valores completos, orden de instrucciones y condiciones. No confundir física 275 con `.line 1187`, ni reconstruir la invocación o inferir semántica de registros. Clasificación `USER-FACT / RECOVERED-CHAT`; no `LOCAL-VERIFIED`. El estado de ejecución efectiva sigue PENDIENTE.


------------------------------------------------------------------------

## 105. BRService.onStartCommand: continuación parcial de CMD_RESTORE — 2026-11-21

Se incorporó evidencia 105: [105_CMD_RESTORE_CONTINUATION_PARTIAL_RECOVERY.md](evidence/2026-11-21/105_CMD_RESTORE_CONTINUATION_PARTIAL_RECOVERY.md).

El mensaje histórico del usuario del 2026-11-17T05:16:53Z corrige el límite previo de evidencia 94/96. El usuario aportó después salida local `nl -ba` para físicas 19410–19490, verificando el despacho de lista no vacía hasta 19485:

- Física 19417 asigna `mDescriptorPath`; `extra_zip_file_path` se lee en 19419–19422 y se asigna a `mZipFilePath` en 19426.
- `extra_britems` no vacío: `ArrayList.toArray()` produce `BRItem[]` y se llama `restoreFiles(BRItem[], v6, v3)`.
- Lista vacía: `restoreFiles(null, v6, v3)` solo si `v3==3` o `mIsReStartCommand`.
- Lista vacía sin esas condiciones: log literal `restoreFiles brItems is null` y llamada a `setState(...)`.
- La llamada de lista no vacía está localmente en 19483 bajo `.line 913`. `.line 915` y la rama de lista vacía siguen siendo referencias históricas, no cotejadas en esta salida.

**Corrección de estado:** ya no es correcto afirmar que la continuación se corta al comenzar `extra_zip_file_path`. La continuación está recuperada parcialmente, no íntegramente.

**Límites:** el bloque local disponible termina en 19490, dentro de la rama vacía; falta la continuación posterior para cotejar las condiciones y argumentos exactos de `setState`. No confundir con el cuerpo independiente `restoreFiles(...)` reportado alrededor de física 12672. Clasificación mixta: despacho no vacío `LOCAL-VERIFIED`; rama vacía parcialmente `RECOVERED-CHAT`.

------------------------------------------------------------------------

## 106. BRService.onStartCommand: rama vacía y cierre de CMD_RESTORE — 2026-11-22

Se incorporó evidencia 106: [106_BRSERVICE_ONSTARTCOMMAND_CMD_RESTORE_TAIL.md](evidence/2026-11-22/106_BRSERVICE_ONSTARTCOMMAND_CMD_RESTORE_TAIL.md).

El usuario compartió salida local `nl -ba` de `BRService.smali`, físicas 19480–19620. El fragmento completa el bloque que evidencia 105 había dejado parcialmente pendiente:

- Lista vacía: si `v3==3` o `mIsReStartCommand` es verdadero, llama a `restoreFiles(v5,v6,v3)`; en caso contrario registra `restoreFiles brItems is null` y llama a `setState(mState,0xC,0x6)`.
- Tras el despacho, `onStartCommand` comprueba `isIdleState()`; si es verdadero, registra el mensaje de posible reinicio y llama a `backupPackagesByRetransfering(v1)`. Después vuelve a comprobar el estado idle y llama a `stopSelf()` si sigue idle.
- El retorno final es `v1` únicamente cuando `mBakFilesType==3` y `mState==3`; en cualquier otro caso devuelve `2`.

**Delta frente a evidencia 105:** se verifican los argumentos de `setState`, la continuación de recuperación/retransferencia, el cierre idle y las condiciones del retorno. No se duplican las instrucciones ya registradas en evidencia 105.

**Clasificación:** `LOCAL-VERIFIED` para las físicas 19480–19611, basándose en la salida local aportada el 2026-11-22. Los significados de `0xC`, `0x6`, `v1` y los códigos de retorno siguen sin resolverse semánticamente; no se infiere ejecución efectiva ni éxito de retransmisión.

------------------------------------------------------------------------

## 107. BRService.setState: receptor y propagación a BRItem — 2026-11-22

Se incorporó evidencia 107: [107_BRSERVICE_SETSTATE_RECEIVER_AND_BRITEM_PROPAGATION.md](evidence/2026-11-22/107_BRSERVICE_SETSTATE_RECEIVER_AND_BRITEM_PROPAGATION.md).

Las salidas locales compartidas por el usuario cubren `BRService.smali`, físicas 14061–14204, e incluyen las sobrecargas `setState(III)V` y `setState(IIII)V`:

- La sobrecarga de tres argumentos inserta el valor actual de `mUserInterruptAction` como tercer argumento.
- En la llamada de evidencia 106, `setState(mState, 0xC, 0x6)`, el valor 12 (`0xC`) llega como `p2` y se asigna a `mWorkingStage`; el valor 6 llega como `p4` y solo inicializa `mLastError` si este todavía es cero.
- La propagación a `mBRItems` está dentro de la rama de actualización (alguno de `mState`, `mWorkingStage` o `mUserInterruptAction` difiere). Allí se activa si `p2==10`, `p2==12` o `p3==2`; con lista no nula/no vacía, todos los elementos reciben `BRItem.state=3` y `BRItem.error=9`.
- Después llama a `notifyServiceStateChange()` y `setWorkingPreference(Context, III)` con `p1`, `p2` y `mBakFilesType`.

**Delta frente a evidencia 106:** queda cotejado el receptor que evidencia 106 dejó explícitamente pendiente. No se repite el análisis de `onStartCommand`. Los significados semánticos de los códigos 6 y 9 y de la etapa 12 siguen sin identificarse; no se infiere ejecución dinámica ni vulnerabilidad.

**Clasificación:** `LOCAL-VERIFIED` según las salidas `nl -ba` aportadas el 2026-11-22.


------------------------------------------------------------------------

## 108. BRService: primera escritura de mLastError mediante abortBackupAndRestore — 2026-11-22

Se incorporó evidencia 108: [108_BRSERVICE_ABORTBACKUPANDRESTORE_MLASTERROR_RECOVERY.md](evidence/2026-11-22/108_BRSERVICE_ABORTBACKUPANDRESTORE_MLASTERROR_RECOVERY.md).

La transcripción recuperada del chat anterior informa que el constructor inicializa `mLastError=0`; `abortBackupAndRestore(I)V` conserva `p1` solo si el campo sigue en cero; la ruta descrita asigna `BRItem.state=3`, `BRItem.error=9` y `mUserInterruptAction=2`. La sobrecarga sin argumentos aporta 3; las rutas de transferencia y espera de conexión aportan 7 según el resumen histórico.

**Relación con evidencias 106–107:** esta ruta es otro posible origen previo de `mLastError`; no demuestra que el 6 de `setState(mState,0xC,0x6)` se almacene. No se repite el análisis de `setState(IIII)`.

**Procedencia y límites:** `RECOVERED-CHAT / USER-PASTED-SUMMARY`; no se recuperó stdout Smali literal en esta conversación. No `LOCAL-VERIFIED`. No repetir las ventanas físicas salvo necesidad concreta de cotejo.

------------------------------------------------------------------------

## 109. Ampliación del índice de títulos de chats — 2026-11-22

Se incorporó evidencia 109: [109_CHAT_TITLE_INDEX_EXPANSION.md](evidence/2026-11-22/109_CHAT_TITLE_INDEX_EXPANSION.md).

Se conserva la lista consolidada de 40 títulos transcritos por el usuario a partir de tres capturas, ampliando la evidencia 95. Los rótulos truncados se mantienen tal como fueron aportados.

**Uso:** índice de navegación para localizar conversaciones previas antes de pedir al usuario que repita material o ejecutar comandos. Los títulos no prueban contenido técnico ni cobertura.


------------------------------------------------------------------------

## 110. Handoff durable para siguientes chats — 2026-11-22

Se creó [NEXT_CHAT_HANDOFF_2026-11-22.md](NEXT_CHAT_HANDOFF_2026-11-22.md) como punto de entrada obligatorio para continuar la investigación sin depender de memoria conversacional.

El handoff consolida: repositorio/rama, fuente de verdad, protocolo de verificación, reglas anti-repetición, clasificación de procedencia, estado de evidencias 106–113, análisis conservador de `mLastError`, lista de 40 títulos de chats y próximo punto de continuación.

**Regla:** al abrir un chat nuevo, leer primero este handoff y después el índice maestro y las evidencias pertinentes. Verificar el HEAD real; los SHA históricos no se presumen actuales.

**Clasificación:** documento de continuidad operativa; no añade evidencia técnica primaria ni autoriza nuevas extracciones o pruebas.

------------------------------------------------------------------------

## 111. Hashes y tamaños reportados de cuatro archivos Smali — 2026-11-22

Se incorporó [evidencia 111](evidence/2026-11-22/111_SMALI_FILE_HASHES_AND_SIZES_RECOVERED.md).

La recuperación del mensaje del usuario del 2026-11-19T20:47:46Z (14:47 CST) aporta los SHA-256 y tamaños reportados para:

- `BRService$5.smali`: 128,021 bytes.
- `BRService.smali`: 522,862 bytes.
- `BRService$FakeBackupListenerImp.smali`: 56,451 bytes.
- `MiAsistService.smali`: 111,571 bytes.

Los cuatro hashes completos están en evidencia 111. **Procedencia:** `USER-FACT / RECOVERED-CHAT`; el usuario reportó cálculo local desde Termux el 19-11-2026. No se recuperó el comando/stdout íntegro y no se recalcularon en esta sesión. Por ello, el delta corrige la afirmación de que los hashes no se habían recuperado, pero no equivale a verificación criptográfica actual.

**No es nuevo:** los mappings `mBakFilesType`, los hallazgos de `ProgressItemAdapter`, `BRItem` y Binder/`MiAsistService` ya estaban documentados en secciones y evidencias anteriores; no se duplican.

------------------------------------------------------------------------



------------------------------------------------------------------------

## 112. Coordenadas históricas adicionales de BRService$5 — 2026-11-22

Se incorporó [evidencia 112](evidence/2026-11-22/112_BRSERVICE5_ADDITIONAL_WRITE_COORDINATES_RECOVERED.md).

Un mensaje del usuario del 2026-11-19T04:38:21Z conserva la lista de coordenadas físicas de `BRService$5.smali`: 1151, 1259, 1283, 1336, 1441, 2351, 2547, 2707, 2790, 3225, 3463, 3691 y 3801. Las primeras siete ya tenían cobertura y no se duplican. Se añaden solo seis anclas no encontradas en el índice/evidencias 87–92: **2547, 2707, 3225, 3463, 3691 y 3801**.

**Procedencia y límites:** `USER-FACT / USER-REPORTED-COORDINATE-LIST / RECOVERED-CHAT`; no se recuperó stdout Smali íntegro. No atribuir método, campo, valor, condición ni semántica. La coordenada 3691 es específica de `BRService$5.smali`, no la referencia independiente 3691 de `MiAsistService.smali`. Mantener 3801 separada de 3807 (evidencia 86).

------------------------------------------------------------------------



------------------------------------------------------------------------

## 113. Coordenadas de copia de state/error en BRItem(BRItem) — 2026-11-22

Se incorporó [evidencia 113](evidence/2026-11-22/113_BRITEM_COPY_CONSTRUCTOR_STATE_ERROR_COORDINATES.md).

La recuperación del mensaje histórico del usuario del 2026-11-20T04:41:25Z añade coordenadas físicas exactas al constructor de copia ya documentado en evidencia 41: línea **121** copia `state` mediante `iget/iput`; línea **123** copia `error` mediante `iget/iput`. También se reiteró que `localFileList` se copia a una lista nueva mediante `addAll`, y que `apkSize/dataSize` no aparecen como referencias internas, solo como declaraciones.

**Delta estrictamente limitado:** las semánticas generales ya constaban en evidencia 41; evidencia 113 solo agrega las coordenadas físicas 121/123. No contarlas como nuevos writers funcionales de Backup ni como mutaciones de un objeto preexistente. Procedencia `USER-FACT / RECOVERED-CHAT`; no se recuperó stdout íntegro ni se verificó el Smali local en esta sesión.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 114. Transporte de resultado en showFinishNotification — 2026-11-22

Se incorporó [evidencia 114](evidence/2026-11-22/114_SHOW_FINISH_NOTIFICATION_RESULT_TRANSPORT_RECOVERED.md).

La recuperación de memoria persistente encontró resúmenes históricos del bloque compartido por el usuario para `BRService.showFinishNotification(IIILjava/util/ArrayList;)V`. El método transmite estado global, etapa y código de error a la pantalla de resultados; cuando `p4 != null`, llama a `clearLocalFiles(p4)` y agrega la lista mediante `putParcelableArrayListExtra("extra_last_britems", ...)`. También calcula el título con `getFinishNotificationTitle(mIsTransingTask,p1,p2)`, el recurso de error con `getErrStringRes(p1,p3)`, crea la notificación mediante `NotificationUtils.createNotification(...)` y la publica con ID `0x7f120037`.

**Delta y límites:** los métodos de título/error, la limpieza `clearLocalFiles()` y `handleTaskFinish()` ya tenían cobertura previa. Evidencia 114 añade el transporte a la pantalla de resultados, la condición de `p4`, la clave `extra_last_britems` y el ID de notificación. Los nombres literales completos de los tres primeros extras y el bloque Smali íntegro no se recuperaron. La procedencia es `PRIOR_ASSISTANT_SUMMARY / RECOVERED-CHAT` basada en un bloque histórico compartido por el usuario; no es `LOCAL-VERIFIED` ni transcripción primaria completa.

------------------------------------------------------------------------

------------------------------------------------------------------------

## 115. Claves literales y extras de showFinishNotification — 2026-11-22

Se incorporó [evidencia 115](evidence/2026-11-22/115_SHOW_FINISH_NOTIFICATION_LITERAL_EXTRAS_RECOVERED.md), recuperada de mensajes del usuario del 2026-11-19T19:30:56Z y 19:31:46Z.

El Intent usa la acción literal `com.miui.backup.activity.ACTION_VIEW_BRRESULT`. Los extras reportados son `extra_last_task_state=p1`, `extra_last_workingstage=p2` y `extra_last_errcode=p3`. También se recuperó `localBackup = mIsFlashDriveTask xor v0` (la definición de `v0` no está disponible), y `extra_last_britems` recibe `p4` después de `clearLocalFiles(p4)`. El bloque contiene el literal `SHOULDN'T RESOLVE!`.

Las líneas físicas 14394–14574 corresponden al bloque principal compartido. La continuación sitúa `extra_last_workingstage` en 14577–14580 y `extra_last_errcode` en 14582–14585; se mencionan además `extra_title`, `PendingIntent` y `getFinishNotificationTitle`, sin coordenadas precisas recuperadas para esos elementos.

**Procedencia y límites:** `USER-PASTED-SMALI / RECOVERED-CHAT); no se recuperó el bloque completo ni se cotejó localmente. La evidencia 115 complementa y actualiza la limitación original de evidencia 114 sobre los nombres literales de los extras. No inferir la definición de `v0`, argumentos completos del PendingIntent/notificación ni ejecución en todas las ramas.

------------------------------------------------------------------------


## 116. Implementación de clearLocalFiles y consumidor de resultados — 2026-11-22

Se incorporó [evidencia 116](evidence/2026-11-22/116_CLEAR_LOCAL_FILES_AND_RESULT_CONSUMER_RECOVERED.md), recuperada de mensajes del usuario del 2026-11-18 y 2026-11-19.

La implementación histórica reportada de `BRService.clearLocalFiles(ArrayList<BRItem>)` retorna si la lista es null; itera los BRItem y, para el elemento cuyo `packageName.equals("files_for_backup")`, vacía `localFileList` si contiene elementos. Coordenadas físicas reportadas: 3977–4040; directivas `.line` 4975–4977. El reporte especifica que no modifica `BRItem.state`, `BRItem.error`, `packageName`, la lista principal ni elimina el elemento.

En `showFinishNotification`, se reportó la llamada a `clearLocalFiles(p4)` seguida de `putParcelableArrayListExtra("extra_last_britems", p4)` cuando `p4 != null`; coordenadas físicas 14592–14600 (inserción 14595–14597), `.line` 4962–4963. También se recuperó `extra_title=v1` y `PendingIntent.getActivity(..., flags=0xc000000)`; argumentos completos no disponibles. En el consumidor `ProgressPageFragmentBase.smali` se reportaron línea física 541 para recuperación de `extra_last_britems` y línea 2397 para la acción `ACTION_VIEW_BRRESULT`; no se recuperó el cuerpo completo del receptor.

**Procedencia y límites:** `USER-PASTED-SMALI / RECOVERED-CHAT`; fragmentos descritos por el usuario en mensajes históricos, no cotejados localmente en esta sesión. No confundir la limpieza de `localFileList` con modificación de estado ni con eliminación del BRItem.



------------------------------------------------------------------------

## 117. Segmento Smali directo de showFinishNotification — 2026-11-23

Se incorporó [evidencia 117](evidence/2026-11-23/117_SHOW_FINISH_NOTIFICATION_PRIMARY_SEGMENT.md).

El usuario compartió en este chat la salida de grep que contiene el encabezado y el segmento físico 14394–14574 de `BRService.showFinishNotification(IIILjava/util/ArrayList;)V`. A diferencia de las evidencias 114–116, que conservaban resúmenes y detalles recuperados de conversaciones históricas, evidencia 117 preserva el segmento Smali directo compartido ahora.

**Delta cotejado:** se confirma en el texto visible `stopForeground(true)); la bifurcación `mIsTransingTask` que construye el Intent con el literal `SHOULDN'T RESOLVE!`; la selección de recursos de título según `mIsFlashDriveTask`, tablet y `p1==3`; el umbral `getSwDp() < 600`; la elección entre Intent explícito a `ProgressPageActivity` y deep link a `PROGRESS_PAGE_ACTIVITY`; y la acción `ACTION_VIEW_BRRESULT` junto con el inicio de la preparación del extra `localBackup`.

**No duplicado:** la acción, el nombre de `localBackup`, los extras globales, el literal `SHOULDN'T RESOLVE!`, el transporte de `p4), `clearLocalFiles) y las referencias del consumidor ya constaban en evidencias 114–116. Evidencia 117 no los vuelve a contar como hallazgos independientes; aporta la fuente directa para el segmento inicial y precisa el flujo de construcción del Intent y selección de interfaz.

**Procedencia y límites:** `USER-PROVIDED / CURRENT-CHAT-GREP-OUTPUT`; salida de grep compartida por el usuario, no ejecutada independientemente aquí. El fragmento se corta en física 14574, al comenzar la carga de `extra_last_task_state`. No permite concluir si el método completo invoca callbacks; tampoco muestra aún el transporte final de lista/notificación. No es verificación local independiente ni evidencia de ejecución dinámica.

------------------------------------------------------------------------


------------------------------------------------------------------------

## 118. Continuación y cierre de showFinishNotification — 2026-11-23

Se incorporó [evidencia 118](evidence/2026-11-23/118_SHOW_FINISH_NOTIFICATION_COMPLETION.md), continuación directa del segmento preservado en evidencia 117.

El fragmento compartido por el usuario completa el método hasta `.end method`. Confirma los extras globales `extra_last_task_state=p1`, `extra_last_workingstage=p2`, `extra_last_errcode=p3) y `extra_title=v1`. Confirma además que, **si `p4 != null`**, se ejecuta `clearLocalFiles(p4)` y después se agrega la misma lista al Intent mediante `putParcelableArrayListExtra("extra_last_britems", p4)`.

Después se crea `PendingIntent.getActivity(p0,v2,p4,0x0c000000)`; se calculan título y recurso de error mediante `getFinishNotificationTitle(mIsTransingTask,p1,p2)` y `getErrStringRes(p1,p3)`; finalmente `NotificationUtils.createNotification(...)` crea la notificación y `mNotificationManager.notify(0x7f120037,...)` la publica.

**Conclusión:** queda confirmado el transporte conjunto del resultado global y de la lista de resultados individuales hacia la pantalla, con la lista condicionada a `p4 != null` y limpiada antes de adjuntarse. Esto no demuestra cómo el consumidor procesa cada BRItem ni que existan callbacks `onRestoreEnd()`/`onError()`. No inferir significado de estados ni presentación por aplicación.

**Dedupe:** evidencias 114–116 ya contenían resúmenes históricos de esos nombres y operaciones. El delta de 118 es la continuación Smali directa que confirma el orden, condición, argumentos y cierre del método; no se cuentan nuevamente como descubrimientos conceptuales independientes.

**Procedencia y límites:** `USER-PROVIDED / CURRENT-CHAT-SED-OUTPUT`; salida de `sed` compartida por el usuario, no verificada localmente de forma independiente. Evidencias 117 y 118, en conjunto, contienen el método completo según los fragmentos compartidos. El receptor de `ACTION_VIEW_BRRESULT` sigue pendiente.

------------------------------------------------------------------------


------------------------------------------------------------------------

## 119. Receptor parcial de resultados en ProgressPageFragmentBase — 2026-11-22

Se incorporó [evidencia 119](evidence/2026-11-22/119_PROGRESSPAGEFRAGMENTBASE_RESULT_RECEIVER_PARTIAL.md), con las salidas Smali compartidas en este chat para las ventanas físicas solicitadas 3970–4070 de `BRService.smali` y 510–590 de `ProgressPageFragmentBase.smali`.

**Cotejo/dedupe:**
- `clearLocalFiles(ArrayList<BRItem>)` queda corroborado por fuente directa actual: solo limpia `localFileList` del elemento `files_for_backup`; no es un writer de `state/error` ni elimina el BRItem. El comportamiento ya estaba documentado en evidencias 116/118; no se cuenta como hallazgo conceptual nuevo.
- El transporte `showFinishNotification() → extra_last_britems` ya está cubierto por evidencias 114–118 y no se duplica.
- **Delta nuevo:** el receptor parcial distingue la ruta `mState != v8` (consulta `BRServiceDataHolder.getBrItems()`, con fallback a `mLastItems` si el resultado es null) de la ruta `mState == v8` (si el Bundle `v5` existe, recupera `extra_last_britems` mediante `getParcelableArrayList`; si no, usa `v6`). En la ruta del Bundle, si el contexto existe y `isServiceWorkingFromPreference(context)` devuelve false, actualiza `mProgress` desde `BRServiceDataHolder.getmProgress()`. Las rutas convergen en comprobaciones de null y tamaño de la lista.
- No se ha resuelto el valor de `v8`, ni el procesamiento posterior de los BRItem, ni su presentación UI. La ventana no muestra escrituras a `BRItem.state/error`.

**Procedencia y límites:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; salida directa pegada por el usuario, no verificación local independiente ni runtime. Véase evidencia 119. La continuación física 580–700 sigue siendo el siguiente fragmento pendiente; no repetir 510–590.


------------------------------------------------------------------------

## 120. Normalización de BRItem.state y preparación del adaptador — 2026-11-22

Se incorporó [evidencia 120](evidence/2026-11-22/120_PROGRESSPAGEFRAGMENTBASE_STATE_NORMALIZATION_AND_ARRAY_PREPARATION.md), con las salidas directas compartidas para las ventanas físicas 580–700 y 430–515 de `ProgressPageFragmentBase.smali`.

**Delta confirmado:**
- La ventana 430–515 asigna `v7=1` y `v8=-1`; por tanto, en el flujo documentado en evidencia 119, la ruta `mState == v8` equivale a `mState == -1` y es la que recupera `extra_last_britems` del Bundle.
- La ventana 580–700 convierte la lista no vacía a `BRItem[]`, recorre sus elementos y, cuando `BRItem.state == 6`, escribe `1` en el mismo campo mediante `iput v7`.
- El arreglo contiene referencias a los mismos objetos BRItem; no es una clonación de cada elemento. La escritura modifica esos objetos referenciados.
- Después de la iteración, la ruta asigna el arreglo a `v6` y converge en la creación/instalación de `ProgressItemAdapter`.

**Alcance y cautelas:**
- La mutación `6 → 1` está confirmada en la ruta que procesa la lista `v3` no nula/no vacía. No extenderla sin prueba a las alternativas `mLastItems` o `IBRService.getBRItems()`, que aparecen en otra rama del fragmento y no muestran aquí el mismo bucle.
- No se observan escrituras a `BRItem.error`, conteo de éxitos/errores, filtrado ni enlace de filas en este segmento.
- El índice contiene notas históricas sobre `ProgressItemAdapter`; el cuerpo directo del adaptador sigue siendo el siguiente objetivo para cotejar el significado visual de los estados.

**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; no verificación local independiente ni runtime. Véase evidencia 120.


------------------------------------------------------------------------

## 121. Cableado de ProgressItemAdapter desde ProgressPageFragmentBase — 2026-11-22

Se incorporó [evidencia 121](evidence/2026-11-22/121_PROGRESSPAGEFRAGMENTBASE_ADAPTER_WIRING_GREP.md), basada en la salida de:

`grep -n -A220 'ProgressItemAdapter' "$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase.smali"`

**Delta directo nuevo del archivo padre:**
- `initUI()` instancia `ProgressPageFragmentBase$ProgressItemAdapter` con el fragmento/contexto y almacena la instancia en `mAdapter`.
- Antes de `initData(v6)`, establece `ProgressItemAdapter.isSaveInstance=true` cuando `mLastItems != null`; si no, lo establece cuando `mIsViewResult == true` y `v6 != null`.
- Pasa el arreglo `BRItem[] v6` a `initData()`.
- Obtiene el `ListView` por ID `0x7f0a021f`, guarda `mListView` y conecta el adaptador mediante `ListView.setAdapter()`.
- Publica un `ListScollThread` con una `WeakReference` al ListView y el mismo arreglo `v6`.

**Dedupe:** los detalles funcionales históricos de `initData/getView/updateInfoView`, estados y porcentajes ya constan en evidencias 54 y 67; no se vuelven a atribuir como hallazgos nuevos. La salida actual no contiene los cuerpos internos de `getView()`, `getCount()` ni `getItemViewType()`.

**Corrección de objetivo:** el grep se ejecutó sobre el archivo padre `ProgressPageFragmentBase.smali`; sus hits muestran referencias/callsites, no el cuerpo de la clase interna. El archivo a inspeccionar para métodos del adapter es `ProgressPageFragmentBase$ProgressItemAdapter.smali` en el directorio `smali/com/miui/backup/activity/`.

**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; no verificación local independiente ni runtime. Véase evidencia 121.


------------------------------------------------------------------------

## 122. Restauración y conservación de estado en ProgressPageFragmentBase — 2026-11-22

Se incorporó [evidencia 122](evidence/2026-11-22/122_PROGRESSPAGEFRAGMENTBASE_INSTANCE_STATE_AND_ITEM_RETENTION.md).

**Delta de fuente directa compartida:**
- onCreate() restaura mState, mStage y mError desde last_state/last_stage/last_error; también mProgress, isShowCancelDialog, isBackup y mZipPath.
- Con Bundle no nulo, obtiene BRServiceDataHolder.getBrItems() y lo asigna a mLastItems.
- Sin Bundle, si hay contexto y isServiceWorkingFromPreference(context) devuelve true, también carga mLastItems desde BRServiceDataHolder.
- onSaveInstanceState() guarda estado/etapa/error y transfiere BRItem a BRServiceDataHolder: primero desde IBRService.getBRItems() si devuelve arreglo no nulo; en la rama alternativa, desde ProgressItemAdapter.getBrItems().
- La ruta del servicio construye ArrayList desde Arrays.asList(array); no se observa clonación individual de BRItem.
- Se observa llamada a ProgressItemAdapter.destroy() antes de unbindBRService(); el cuerpo de destroy() no se recibió.
- La comprobación de aborto llama showAbortConfirmDialog() solo cuando la preferencia indica servicio activo, el botón existe y su visibilidad es 0.

**Límites:** no demuestra persistencia en disco ni contiene getView/getCount/getItemViewType. No reemplaza la inspección del archivo Smali separado del adaptador. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; fragmentos incompletos y sin runtime.


------------------------------------------------------------------------

## 123. ProgressItemAdapter: callbacks, estado activo y contabilidad de tamaños — 2026-11-22

Se incorporó [evidencia 123](evidence/2026-11-22/123_PROGRESSITEMADAPTER_CALLBACK_STATE_AND_SIZE_ACCOUNTING.md), basada en los bloques compartidos desde Termux para `itemStart`, `setItemsAborted`, `updateWorkingItemProgress`, `workingItemError` y `workingItemFinished`.

**Delta directo:**
- `itemStart` localiza paquete/feature, asigna `mWorkingIndex`, escribe `state=2`, actualiza la fila, desplaza el ListView y recalcula progreso total.
- `setItemsAborted` recorre todos los elementos y escribe `state=3,error=9` sin filtrar estado previo.
- `updateWorkingItemProgress` solo vuelve a buscar cuando `mWorkingIndex==-1`; actualiza `progType/completedSize` y solo inicializa `totalSize` cuando el valor existente es cero y el nuevo no es `-1`.
- `workingItemError` escribe `state=3,error=p3`; en el fragmento no reinicia `mWorkingIndex` ni recalcula progreso total.
- `workingItemFinished` contiene una secuencia condicional precisa de transición/contadores, calcula `bakFileSize`, puede ajustar `completedSize` con `totalSize` o `bakFileSize`, suma `splitFileSize` y acumula `mSuccessfulSize` con la excepción ×1000 para MMS/Contacts tipo 9.
- **Corrección:** el cuerpo directo muestra que `workingItemFinished` reinicia `mWorkingIndex=-1`, no `-2` como decía el resumen previo de evidencia 54. La evidencia 54 fue anotada para reflejarlo.

**Dedupe:** evidencia 54 ya resumía las mutaciones generales y el factor ×1000; evidencia 67 ya conservaba resúmenes de `initData/getView/updateInfoView`. La evidencia 123 aporta detalle de las condiciones/orden de instrucciones y corrige el valor de reinicio; no reabre ni duplica los métodos cubiertos por 67.

**Límites:** no se recibieron los cuerpos de `findProgressItemIndex`, `getBRItemSize`, `computeTotalProgress`, `updateSingleItem` ni `ProgressItem.updateProgress`. No atribuir unidades físicas a los campos de tamaño ni semántica universal a los códigos de estado/error. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`, sin verificación local independiente ni runtime.


------------------------------------------------------------------------

## 124. Writers de BRItem.state en BRService$5, BRService$6 y FakeBackupListenerImp — 2026-11-22

Se incorporó [evidencia 124](evidence/2026-11-22/124_BRITEM_STATE_WRITES_BACKUP_SERVICE_CALLBACKS.md), basada en las ventanas físicas compartidas desde Termux para `BRService$5.smali`, `BRService$6.smali` y `BRService$FakeBackupListenerImp.smali`.

**Delta de contexto directo:**
- `BRService$5`: la rama de `files_for_backup` que espera el fin de transferencia puede escribir `state=6` si el estado previo es distinto; dos ramas de aborto escriben `state=3,error=9`; otra rama escribe `state=1,progType=0` solo si el estado previo no es 1, 6 ni 3 y después notifica fin de ítem.
- `BRService$6`: la rama `:cond_42` escribe `state=3` y registra `Backup One, result failed`.
- `FakeBackupListenerImp`: `onBackupStart` escribe explícitamente `state=2`; `onError` escribe `state=3`; `onBackupEnd` escribe `state=v3`, cuyo valor no se resuelve con la ventana recibida, y después escribe `progType=v4`.

**Dedupe y límites:** las coordenadas físicas ya figuraban en el inventario grep anterior; evidencia 124 añade el contexto de instrucciones y condiciones, no nuevos writers independientes. No se resolvieron los registros fuente de las escrituras restantes ni el mapping completo de `p3` en `onError`. Las líneas `.line` de Smali no son coordenadas físicas. Véase evidencia 124 para las ventanas exactas, procedencia y pendientes.

**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`; fragmentos compartidos por el usuario, no verificados independientemente aquí y sin ejecución dinámica.


------------------------------------------------------------------------

## 125. ProgressItemAdapter: detalle de initData, filtros, getters y mapping visual de errores — 2026-11-22

Se incorporó [evidencia 125](evidence/2026-11-22/125_PROGRESSITEMADAPTER_INITDATA_STATE_FILTER_UI_ERROR_MAPPING_AND_GETTERS.md), basada en las ventanas Smali compartidas directamente por el usuario desde Termux: 1875–2060, 2061–2420, 2421–2600 y 869–1207.

**Delta respecto de evidencias 67 y 123:**
- Precisa el filtro de `initData()`: solo agrega BRItem con `state=1/3/6`; los tres incrementan `mFinishedAndFailedCount), pero solo 1/6 recorren contabilidad de éxito/tamaño.
- Documenta el ajuste condicional de `completedSize`: `progType==0`, `isSaveInstance), estado de `completedSize), excepción `files_for_backup) y fallback a `bakFileSize).
- Añade el comportamiento exacto de `getSpecificStatePkgs()`, `getSuccessfulCount()`, `getFailedCount()`, `getSuccessfulSize()`, `getItem()` y `getItemId()`.
- Precisa que `getFailedCount()` es `getCount()-getSuccessfulCount()`, no un conteo exclusivo de `state==3`.
- Añade el mapping directo `BRItem.error → resource ID` para 2, 5, 6, 7, 9, 11 y fallback.
- Registra la diferencia contextual: `state=6) se cuenta como éxito en getters/contabilidad, pero la rama directa de `updateSingleItemUI()` lo envía a la barra de progreso. No generalizar fuera de la ruta observada.
- Observa que `initData()` incrementa `mSuccessfulCount` sin reiniciarlo en el cuerpo compartido; `getSuccessfulCount()` recalcula iterando `mItems`. Queda pendiente localizar otros lectores antes de evaluar impacto.

**Dedupe:** `getView()`, la matriz general de estados, `updateInfoView()` y el resumen general de `initData()` ya constaban en evidencia 67; callbacks y parte de la contabilidad ya constaban en evidencia 123. Esta evidencia preserva únicamente el detalle literal adicional y no los duplica como hallazgos independientes.

**Procedencia y límites:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; ventanas compartidas por el usuario, no cotejadas independientemente contra el archivo local ni ejecutadas dinámicamente. Los IDs de recursos no se traducen a textos en esta evidencia.



------------------------------------------------------------------------

## 126. BRService$5: selección de estado previo a preload y escrituras condicionadas — 2026-11-22

Se incorporó [evidencia 126](evidence/2026-11-22/126_BRService5_PRELOAD_STATE_ASSIGNMENTS.md), basada en las ventanas físicas 1125–1170, 1235–1300 y 1310–1460 de `BRService$5.smali`.

**Delta contextual:**
- Writer 1151: `state=v14) cuando `findBakInCachePath(bakFileName)` devuelve ruta no nula; el valor de `v14` no se resuelve.
- Writer 1259: si el paquete es `files_for_backup`, conserva el estado actual; para otros paquetes escribe explícitamente `state=4`; luego notifica preload.
- Writers 1283 y 1336: ramas de aplicación deshabilitada / elemento de sistema cuyo paquete no existe escriben `state=v10,error=v3`; ambos registros siguen sin valor resuelto.
- Writer 1441: rama de GMS no instalado para paquete GMS escribe `state=v10,error=13); `v10` sigue sin resolverse.

**Dedupe:** las coordenadas ya estaban en el inventario grep. Evidencia 126 añade condiciones y operandos visibles, sin declarar nuevos writers. Las líneas 1544 y 1557–1589 se conservan en evidencia 124 y no se duplican.

**Procedencia y límites:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`; ventanas del usuario no verificadas independientemente ni ejecutadas dinámicamente. Pendiente rastrear definiciones de `v14), `v10) y `v3) y recuperar ventanas completas sin corrupción de formato.


------------------------------------------------------------------------

## 127. Resolución de BRItem.state en FakeBackupListenerImp.onBackupEnd — 2026-11-23

Se incorporó [evidencia 127](evidence/2026-11-23/127_FAKEBACKUPLISTENER_ONBACKUPEND_STATE_REGISTER_RESOLUTION.md), recuperada de las ventanas históricas compartidas por el usuario para `BRService$FakeBackupListenerImp.smali` (físicas 1100–1165, 1160–1225 y 1220–1290).

**Corrección de evidencia 124:** el bloque anterior al writer contiene `const/4 v3, 0x1`; las ventanas intermedias no muestran redefinición de `v3` antes de la instrucción física 1273 `iput v3, v0, BRItem.state`. Por tanto, esa escritura asigna `state=1`. La descripción anterior de `v3` como no resuelto queda supersedida para este writer.

**Dedupe y límites:** las escrituras del adaptador vuelven a aparecer en evidencia 123 y no se duplican. El grep global mezcla lecturas y escrituras. Un intento malformado de asignar `F` para `BRService$5.smali` falló en Bash; el grep posterior siguió apuntando al archivo previo del adaptador y no produjo extracción de `BRService$5`. No afirmar que ese archivo fue inspeccionado por ese comando. Procedencia `USER-PROVIDED / RECOVERED-CHAT-TERMUX-OUTPUT`; no es verificación local independiente ni runtime.


------------------------------------------------------------------------

## 128. Contexto de guardias de transferencia y preload en BRService$5 — 2026-11-23

Se incorporó [evidencia 128](evidence/2026-11-23/128_BRSERVICE5_PRELOAD_AND_TRANSFER_GUARD_CONTEXT.md), basada en las ventanas físicas compartidas por el usuario 1050–1160 y 1200–1300 de `BRService$5.smali`.

**Delta contextual:**
- El writer físico 1151 (`state=v14`) está dentro de la rama `shouldSkipBRItem(mState, BRItem)`; además requiere transferencia activa, estado igual a `v7`, paquete distinto de `files_for_backup` y resultado no nulo de `findBakInCachePath()`. El valor dominante de `v14` sigue sin resolverse.
- La ventana 1200–1300 corrobora el writer físico 1259: conserva el estado actual para `files_for_backup`, asigna 4 a los demás paquetes y llama después a `notifyItemTaskPreload()`.
- La rama `AppUtils.isPadDisableApps(packageName)` confirma el writer físico 1283 (`state=v10`), la escritura contigua `error=v3` y la llamada `notifyItemTaskError(...,v3)`. Los valores dominantes de `v10` y `v3` siguen UNKNOWN.

**Dedupe:** evidencia 126 ya documentaba las coordenadas y parte de estas condiciones; evidencia 128 añade contexto de guardias y orden de instrucciones, sin declarar writers nuevos. No conectar `v10=3` reportado en otra región con el writer 1283 sin demostrar alcance/flujo. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; no verificación local independiente ni runtime.

------------------------------------------------------------------------

## 129. BRService$5: convergencia en :goto_9 y flujo de v2 — 2026-11-23

Se incorporó [evidencia 129](evidence/2026-11-23/129_BRSERVICE5_GOTO9_V2_STATUS_REGISTER_FLOW.md), basada en la ventana física 520–620 de `BRService$5.smali` compartida directamente por el usuario.

**Delta contextual:**
- En `:cond_d`, `mIsAborted=true` selecciona `v0=3`; falso selecciona `v0=6`. `:cond_e` selecciona `v0=2`. Estas rutas convergen en `:goto_7`, que escribe `v7` en `mIsAborted`; el valor dominante de `v7` permanece UNKNOWN.
- `:cond_f` consulta `isStorageSpaceEnough(mTransSingleItemMaxSize)`. Si no hay espacio, escribe `v7` en `mIsAborted`, asigna `v2=2` y salta a `:goto_9`.
- En la ruta que alcanza `:goto_8`, `move v2,v0` hace que `v2` reciba el valor seleccionado previamente en `v0`.
- La rama local puede llamar a `updateLocalRestoreItems(mDescriptorPath)`.
- `:goto_9` recupera descriptor e items y llama a `BRServiceDataHolder.setBRServiceFileList(descriptor,items)`. La ventana termina tras cargar el literal de log `"startRestore, transed"`; todavía no muestra el consumidor posterior de `v2`.

**Dedupe y límites:** evidencia 128 cubre las guardias de transferencia/preload en otras ventanas; evidencia 129 añade el flujo de registros y la convergencia de esta ventana, no nuevos writers de `BRItem.state/error`. No se resuelve el valor de `v7`, el consumidor posterior de `v2` ni la semántica global de los valores 2/3/6. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`, sin cotejo local independiente ni runtime.


------------------------------------------------------------------------

## 130. BRService$5: contraseña cifrada y preparación de future task — 2026-11-23

Se incorporó [evidencia 130](evidence/2026-11-23/130_BRSERVICE5_ENCRYPTED_PASSWORD_FUTURE_TASK_PACKAGES.md), basada en la ventana física 620–740 compartida por el usuario.

**Delta contextual:**
- Tras el log `"startRestore, transed"`, recupera `mBackupDescriptor`; si es null propaga null, y si existe lee `encryptedPwd`. El valor resultante se asigna a `BRService.mEncryptedPasswd`.
- Si `mBRItems` no es null, crea una nueva `ArrayList`, recorre los BRItem y agrega únicamente cada `packageName` (String). Entrega esa lista a `BRManager.setFutureTask(List)`. No son copias de BRItem.
- Comprueba `TextUtils.isEmpty(mEncryptedPasswd)`. En la rama no vacía obtiene Context desde `val$contextRef` y llama a `ConnectivityHelper.getInstance(context)`; el bloque no muestra efectos posteriores.
- La ventana no consume `v2`; su consumidor sigue pendiente.

**Dedupe y límites:** no hay escrituras a `BRItem.state/error`. `mEncryptedPasswd` pertenece a BRService y no debe confundirse con `BRItem.error`. Evidencia 129 documenta el flujo anterior y la convergencia en `:goto_9`; evidencia 130 añade solo la continuación 620–740. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`, sin verificación local independiente ni runtime.


------------------------------------------------------------------------

## 131. BRService$5: conectividad, descifrado de contraseña y consumidor de v2 — 2026-11-23

Se incorporó [evidencia 131](evidence/2026-11-23/131_BRSERVICE5_CONNECTIVITY_DECRYPTION_V2_CONSUMER.md), basada en la ventana física 740–860 de `BRService$5.smali` compartida directamente por el usuario.

**Delta contextual:**
- Tras obtener `ConnectivityHelper`, consulta `isNetworkConnected()`. Sin conexión asigna `v0=4) y salta a la salida anticipada.
- Con conexión, llama a `setState(v4,v4,v6)), descifra `mEncryptedPasswd` mediante `EncryptPassword.decryptPasswdFromXiaomiAccount(context,...)` y guarda el resultado en `mPasswd`.
- Si `mPasswd` está vacío, asigna `v0=1); si no, `v0=0). La salida no nula llama a `setState(v4,v3,v0)`, `handleTaskFinish(v4,v3,v0,mBRItems)` y retorna.
- En `:cond_17`, tras el log `"startRestore, decrypted"`, `v2==0) habilita `setState(v4,v11,v6)`; `v2!=0) omite esa llamada. Después comienza la iteración de `mBRItems`.
- Queda localizado el consumidor de `v2` anunciado como pendiente en evidencia 129/130. Su semántica funcional y los valores de `v11)/`v6) siguen sin resolverse.

**Dedupe y límites:** no hay escrituras directas a `BRItem.state/error` en esta ventana. La iteración de items solo comienza; el cuerpo queda fuera del bloque. Las llamadas a `setState` no se clasifican como escrituras BRItem. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`, sin cotejo local independiente ni runtime.


------------------------------------------------------------------------

## 132. BRService$5: recorrido de packageName y apertura de ZipFile — 2026-11-23

Se incorporó [evidencia 132](evidence/2026-11-23/132_BRSERVICE5_PACKAGE_ITERATION_ZIPFILE_OPEN.md), basada en la ventana física 850–970 de `BRService$5.smali` compartida directamente por el usuario.

**Delta contextual:**
- Completa el cuerpo visible del iterador inicial de `mBRItems`: obtiene cada BRItem, lee `packageName` y ejecuta `equals("files_for_backup")). En el texto recibido no aparece `move-result` ni bifurcación basada en ese booleano; después asigna `v11=5) y repite. No afirmar filtrado/selección.
- Comprueba `mZipFilePath`: null/vacío evita la apertura; ruta no vacía intenta construir `ZipFile`.
- Apertura exitosa conserva ZipFile en `v5`. `IOException` genera log, recupera `mState` y llama a `setState(mState,v3,v14)`; después `v5=null). Las rutas null/vacío también dejan `v5=null).
- En `:goto_e` inicializa `v11=0), `v13=0); `:goto_f` recupera `mBRItems`, carga `v3=11) y comprueba null, con destino `:cond_62`.

**Dedupe y límites:** evidencia 131 ya cubría la entrada al iterador y la obtención de PackageManager; evidencia 132 preserva el cuerpo compartido, la preparación de ZipFile y el comienzo de la siguiente fase. No hay writes directos a `BRItem.state/error`. La llamada a `setState` no se clasifica como mutación directa de BRItem. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`, sin cotejo local independiente ni runtime.


------------------------------------------------------------------------

## 133. BRService$5: guardias del bucle individual, Theme Manager y USB — 2026-11-23

Se incorporó [evidencia 133](evidence/2026-11-23/133_BRSERVICE5_ITEM_LOOP_THEME_AND_USB_GUARDS.md), basada en la ventana física 960–1080 de `BRService$5.smali` compartida directamente por el usuario.

**Delta contextual:**
- Desde `:goto_f`, el procesamiento continúa solo si `mBRItems != null`, `mIsAborted == false` y `v11 < mBRItems.size()`; de lo contrario salta a `:cond_62`.
- Obtiene `mBRItems[v11]` como `BRItem` en `v6` y registra su `packageName` y `type` en el mensaje `"Restore One, start"`.
- Si `packageName == "com.android.thememanager"`, escribe `v7` en `BRService.isRestoreTheme`. El valor efectivo de `v7` sigue UNKNOWN.
- Si `v8` es verdadero, asigna `v4=10` y `v16=8), saltando a `:goto_3f`.
- Si `v8` es falso y `mIsFlashDriveTask` es verdadero, consulta `isUsbAvaliable()`. Si USB no está disponible, asigna `v4=10` y `v16=9), y continúa hacia `:goto_3f`.

**Dedupe y límites:** evidencia 132 ya documenta la inicialización de `v11/v13` y la entrada a `:goto_f`; evidencia 133 añade guardias de iteración, lectura/log por elemento y las ramas de tema/USB. No hay escrituras directas a `BRItem.state/error`; `isRestoreTheme` es campo de BRService. No atribuir semántica a `v4`, `v16`, `v7`, `v8` ni a los literales 8/9. Las directivas `.line 1519–1528` no son coordenadas físicas. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`, sin cotejo local independiente ni runtime.


------------------------------------------------------------------------

## 134. BRService: referencias a setState(III) y cruces de llamadas — 2026-11-23

Se incorporó [evidencia 134](evidence/2026-11-23/134_BRSERVICE_SETSTATE_CALLSITE_CROSSCHECK.md), basada en la salida de grep contextual compartida directamente por el usuario.

**Delta:** inventario contextual de llamadas a `setState(III)V`:
- Física 3334: `setState(3,1,0)` en el flujo de inicialización de backup.
- Física 5562: `setState(3,12,9)` en la rama USB no disponible, seguida de `handleTaskFinish(3,12,9,mBRItems)`. La llamada ya estaba registrada como recuperación histórica; el bloque actual aporta corroboración y contexto contiguo.
- Física 12706: `setState(4,1,0)` en la entrada de `restoreFiles`.
- Física 18922: `setState(0,11,0)` en la ruta visible de limpieza/cierre del servicio.
- Física 19512: `setState(mState,12,6)` en la rama `restoreFiles brItems is null`; llamada y receptor ya cubiertos por evidencias 106–107.

**Dedupe:** el cuerpo de `setState(III/IIII)`, sus reglas de asignación y la propagación a BRItem ya están preservados en evidencia 107 y no se duplican. La llamada `(3,12,9)) ya figuraba en la sección 12; la rama de lista nula y su receptor ya figuran en evidencias 106–107.

**Límites:** los argumentos son parámetros de estado global del servicio; no convertir los literales 6/9 en afirmaciones directas sobre `BRItem.error`, ni el segundo argumento 12 en `BRItem.state=12`. No se demuestra ejecución dinámica, ni éxito/fallo efectivo de backup/restore. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; no se declara verificación local independiente.


------------------------------------------------------------------------

## 135. BRService$5: continuación de :goto_3f — 2026-11-23

Se incorporó [evidencia 135](evidence/2026-11-23/135_BRSERVICE5_GOTO3F_STAGE12_HANDOFF.md), basada en el grep contextual compartido por el usuario (ventanas físicas reportadas alrededor de 1042–1120 y 3831–3875).

**Delta:** `:goto_3f` obtiene `mRunningItemIndexLock`, entra al monitor, escribe `-1` en `mRunningItemIndex`, sale y registra `"startRestore, restored"`. La continuación visible consulta `mIsTransingTask` y, si es verdadero, lee `mIsAborted`; el bloque termina antes de mostrar la continuación completa.

**Dedupe y límites:** evidencia 133 ya conserva las guardias Theme/USB y la convergencia hacia `:goto_3f`; evidencia 135 añade el efecto del destino y el comienzo de su continuación. El fragmento no muestra consumo de `v16` ni escritura directa a `BRItem.state/error`. No inferir el destino final de `v16`. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; no verificación local independiente ni runtime.

------------------------------------------------------------------------

## 136. BRService$5: :goto_3f, estado global 8 y cleanup — 2026-11-23

Se incorporó [evidencia 136](evidence/2026-11-23/136_BRSERVICE5_GOTO3F_TRANSINGTASK_STATE8_CLEANUP.md), continuación directa de la salida Termux compartida por el usuario.

**Delta:** el `setState(4,8,0)` y la espera de 500 ms solo ocurren si `mIsTransingTask` es verdadero, `mIsAborted` es falso y `v16==0`. Si está abortado o `v16!=0`, salta ese bloque. Después se observa cleanup: `mReconnector.quit()`, `mTransFileService.stopAll(0)` (con captura/log de `RemoteException`) y `unbindTransFileService()`. En `:cond_64` comienza la comprobación de `mIsLocalBackupTask`, pero el fragmento termina antes de mostrar su destino.

**Dedupe y límites:** evidencia 135 ya conserva el reset sincronizado de `mRunningItemIndex`, el log y el inicio de esta rama. `setState(4,8,0)` es una llamada de estado global del servicio; no demuestra `BRItem.state=8`. No se resuelve el destino final de `v16` ni la rama local. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`, sin cotejo independiente ni runtime.
------------------------------------------------------------------------

## 137. BRService$5: cierre, estado final y limpieza — 2026-11-23

Se incorporó [evidencia 137](evidence/2026-11-23/137_BRSERVICE5_RESTORE_FINAL_STATE_RELEASE_AND_TEMP_CLEANUP.md), continuación de la salida Termux compartida por el usuario.

**Delta:** si `mIsLocalBackupTask` es verdadero realiza `unbindTransFileService()` adicional; luego registra `startRestore, stoped`, llama `BRManager.release(observer)` y `StorageMonitor.stopMonitor()`. En la selección final, `v16!=0` asigna inicialmente `v14=v16` y `v2=12`, pero el flujo posterior en `:goto_43` vuelve a asignar `v2=10` si `mIsAborted` o `v2=11` si no. `v14` queda como `v16` cuando no es cero; con `v16==0`, toma 3 si está abortado o 0 si no. Llama `setState(4,v2,0,v14)`, elimina el contenido de `getTransTempBackupRootPath()` mediante `Utils.deleteContents()` y registra `Restoring end`.

**Dedupe y límites:** evidencia 136 cubre el cleanup previo y la entrada a la rama local. La llamada `setState` es del estado global del servicio, no una escritura directa demostrada de `BRItem.state/error`. El bloque termina al obtener `BRServiceDataHolder`; no se infiere la continuación. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`, sin cotejo independiente ni runtime.

------------------------------------------------------------------------

## 138. BRService$5: finalización, métricas y liberación — 2026-11-23

Se incorporó [evidencia 138](evidence/2026-11-23/138_BRSERVICE5_RESTORE_FINISH_METRICS_AND_TASK_COMPLETION.md), basada en las ventanas físicas 4060–4170, 4160–4225 y 4220–4285 de `BRService$5.smali` compartidas por el usuario.

**Delta:** después de `Restoring end`, el flujo limpia el descriptor con `setDescriptor(null)`, llama a `updatePkgStae(v14)`, ejecuta `handleTaskFinish(4,v2,v14,mBRItems)` y libera WakeLock. Si `mIsFlashDriveTask` es verdadero, también desregistra el storage receiver. Luego registra `startRestore, released`.

La telemetría de finalización solo se procesa cuando `v2==v3`: `mBakFilesType==1` registra `backup_local_restore_finish`; tipo 3 selecciona `backup_pc_restore_finish` o `backup_trans_restore_finish` según `mIsFromMiAsist`; tipo 5 registra `backup_usb_restore_finish`. En la ruta local, el evento finish se registra antes de consultar `mIsAborted`. Si no está abortado, registra el total `mBRItems.size()`, el contador `v13` como éxito y el log `total restore: ..., total susses count: ...`. Las ramas convergen en `return-void`; la salida excepcional libera el monitor y relanza la excepción.

**Dedupe y límites:** evidencia 137 termina al obtener `BRServiceDataHolder.getInstance()`; evidencia 138 conserva únicamente la continuación posterior. No resolver los valores/significados generales de `v2`, `v3`, `v13` o `v14`; no equiparar los eventos de telemetría con éxito efectivo; no atribuir a `handleTaskFinish` efectos internos no examinados. No se demuestra ejecución dinámica ni resultado real en dispositivo. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`, sin cotejo local independiente.

------------------------------------------------------------------------

## 139. BRService$5: coordenadas iniciales de incrementos de v13 — 2026-11-23

Se incorporó evidencia 139: [139_BRSERVICE5_V13_INCREMENT_SITES_INITIAL_CONTEXT.md](evidence/2026-11-23/139_BRSERVICE5_V13_INCREMENT_SITES_INITIAL_CONTEXT.md).

El usuario confirmó que el archivo consultado era `BRService$5.smali`; las tres coordenadas 2227, 2422 y 3503 pertenecen a `.method public run()V`. Los fragmentos inmediatos muestran:

- **2227:** incremento después de la región que puede llamar a `unpackBakSdDatas()` para WeChat/QQ; el incremento queda después de `:cond_38`, por lo que no se atribuye exclusivamente a esos paquetes.
- **2422:** incremento en `:goto_24`, tras la llamada a `restoreLocalMediaFile()` en la rama `mIsFlashDriveTask`, `packageName == "files_for_backup"` y `v3 != null`. La ruta `v3 == null` salta a otra etiqueta y no pasa por ese incremento.
- **3503:** incremento inmediatamente después de `MediaScannerConnection.scanFile()`; las guardias de entrada completas no se recuperaron.

Evidencias 132 y 138 ya conservan, respectivamente, la inicialización `v13=0` en `:goto_e` y el uso final de `v13` en la métrica/log local de restauración. Evidencia 139 añade solo las nuevas coordenadas y su contexto inmediato. No se concluye todavía que todos los incrementos alimenten el mismo contador efectivo ni que `v13` represente universalmente restauraciones exitosas: faltan rastrear redefiniciones, usos, guardias y convergencias. Procedencia `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; no cotejo local independiente ni ejecución dinámica.


------------------------------------------------------------------------

## 140. Reconciliación final de salidas Termux recuperadas — 2026-11-24

Se incorporó [evidencia 140](evidence/2026-11-24/140_TERMUX_HASH_DECODE_METADATA_AND_COMMAND_PROVENANCE_RECONCILIATION.md), reconciliando los bloques Termux compartidos en este chat con la evidencia previa.

**Hashes y tamaños — DEDUPE, no hallazgo nuevo:** los cuatro SHA-256 y tamaños de Smali coinciden exactamente con evidencia 111 (2026-11-22). El SHA-256 de `Backup.apk` coincide con el valor ya conservado en §1.2. La salida actual aporta el stdout íntegro de `sha256sum` y `wc -c` como procedencia adicional, pero sigue siendo salida compartida por el usuario, no recomputación independiente. No se crean hashes nuevos ni se altera evidencia 111.

**Corrección crítica de procedencia del grep:** el comando define `F="$S/BRService$5.smali"` sin escapar el signo `$`. En Bash, `$5` se expande como el quinto parámetro posicional; por tanto, el nombre de destino no queda demostrado como `BRService$5.smali`. En una sesión interactiva ordinaria sin ese parámetro, `F` apuntaría a `BRService.smali`. Como no se imprimió `printf '%s\n' "$F"` ni se mostró el valor de `$5`, las salidas de los greps de `mBakFilesType` y `BRItem.state` de este bloque **no se atribuyen a BRService$5.smali**. No deben usarse para confirmar coordenadas o writers de esa clase. Las conclusiones anteriores de BRService$5 continúan dependiendo de las ventanas correctamente identificadas preservadas en las evidencias 126–139.

**Inventario ProgressItemAdapter:** el `find` sí reporta la clase base `ProgressPageFragmentBase$ProgressItemAdapter.smali` y cinco clases internas relacionadas. Es corroboración de presencia/ruta; el análisis funcional ya resumido en evidencias previas no se duplica.

**Metadatos del decode:** el bloque adicional confirma presencia y metadatos reportados de `decoded/AndroidManifest.xml` (19K), `decoded/original/AndroidManifest.xml` (33K) y `decoded/apktool.yml` (3.8K), todos con fecha mostrada Nov 16 00:18. No aporta contenido, hashes, versión exacta de Apktool ni comando de decodificación.

**Estado reconciliado:** no se identifica un nuevo hallazgo técnico de comportamiento. Se conserva un delta de procedencia y metadatos, junto con una advertencia de atribución de archivo que impide usar el grep ambiguo como evidencia de `BRService$5`. La investigación sigue INCOMPLETA; no se infieren ejecución dinámica, causalidad no demostrada ni integridad criptográfica actual.


------------------------------------------------------------------------

## 141. BRService: callers de mBakFilesType y consumo de v16 en :goto_3f — 2026-11-24

Se incorporó [evidencia 141](evidence/2026-11-24/141_BRSERVICE_MBAKFILESTYPE_CALLERS_AND_GOTO3F_V16_CONSUMPTION.md), basada en extractos Smali compartidos directamente por el usuario.

**Delta preservado:**
- Caller desde descriptor de transferencia: el contexto visible prepara BRItems, contraseña cifrada, ruta raíz y TransDeviceInfo; fija el argumento entero cuarto de backupPackages (p4) en 3. El encabezado completo del método caller no quedó visible por una transcripción de terminal parcialmente mezclada.
- Caller desde Intent: getIntExtra(...) produce v11, que se mueve a v4 y llega como p4 a backupPackages. El valor por defecto es v13, no resuelto en el extracto.
- Caller de restoreFiles: el tercer argumento (p3) procede de getIntExtra(...) con default 1; tanto la ruta con BRItems como la ruta alternativa conservan v3.
- En BRService$5.:goto_3f, setState(4,8,0) y sleep(500 ms) solo ocurren si mIsTransingTask==true, mIsAborted==false y v16==0. Los valores v16=8/9 preservados en evidencia 133 no satisfacen esa última condición.
- El fragmento de consumo no lee v4; no se atribuye a v4=10 la decisión condicional. El cleanup posterior ya está cubierto por evidencia 136.

**Dedupe:** evidencias 133, 135 y 136 conservan las ramas de asignación, convergencia y cleanup. Evidencia 141 añade el origen de argumentos en los callers y el consumo condicional de v16; no crea writers directos de BRItem.state/error.

**Límites:** llamadas setState son estado global del servicio, no prueba de BRItem.state=8. No se resuelve el default v13, no se amplía la semántica completa de los tipos, y no se reconstruye el encabezado ausente del caller #1. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin verificación local independiente ni ejecución dinámica.

**Estado:** investigación INCOMPLETA; evidencia estática documental.

------------------------------------------------------------------------

## 142. Recuperación del chat anterior y auditoría de cobertura Git — 2026-11-24

Se incorporó [registro 142](evidence/2026-11-24/142_PREVIOUS_CHAT_RECOVERY_AND_GIT_COVERAGE_AUDIT.md) para responder a la aclaración del usuario: la solicitud de “guardar todo en Git” se refería a preservar el contenido relevante del chat anterior completo, no solo la evidencia 141.

El registro 142 consolida el mapa de cobertura de ese chat: hashes y tamaños (deduplicados contra evidencia 111/140), metadatos del decode, inventario ProgressItemAdapter, mapeo conocido de `mBakFilesType`, estado de `BRItem`, callers/consumo de `v16`, advertencia Bash sobre `$5`, pendientes y procedencia. Enlaza evidencias 60, 124, 133, 135–141 y distingue los datos ya guardados de los elementos que no pudieron recuperarse íntegramente.

**Límite importante:** el registro 142 es una reconstrucción documental de todo el contenido recuperable en el contexto disponible; no es la transcripción íntegra del chat. No se promueve `v8=1` a confirmado: continúa como PRIOR-ASSISTANT-OUTPUT / UNVERIFIED hasta recuperar el fragmento Smali primario. La investigación sigue INCOMPLETA y estática.

------------------------------------------------------------------------

## 143. Recuperación parcial del encabezado del caller #1 de backupPackages — 2026-11-24

Se incorporó [evidencia 143](evidence/2026-11-24/143_BRSERVICE_BACKUPPACKAGES_CALLER1_HEADER_RECOVERY_PARTIAL.md), basada en la salida de grep compartida desde Termux.

**Delta:** se recupera el encabezado del caller #1 previamente incompleto: `BRService.backupPackagesByRetransfering(Z)V`, con `.locals 17`; la invocación a `backupPackages(...)` aparece en la línea física 3774. La invocación del caller desde Intent queda localizada en la línea física 19318.

**Dedupe y límites:** evidencia 141 ya conservaba el argumento `p4=3` del caller #1, el origen Intent del caller #2 y el default `v13` aún no resuelto. Evidencia 143 no vuelve a registrar esas conclusiones como nuevas. El cuerpo del caller #1 no se recibió íntegramente; la recuperación del encabezado es parcial y procede de salida compartida por el usuario, sin cotejo local independiente ni ejecución dinámica.

**Pendientes:** recuperar el cuerpo/contexto completo del caller #1; resolver el default `v13` del caller #2; recuperar el literal `v8` y la cadena causal del tipo 2; completar el rastreo de `v13`. Investigación INCOMPLETA y estática.

------------------------------------------------------------------------

## 144. Caller de backupPackages desde onStartCommand y default de extra_bakfiles_type — 2026-11-24

Se incorporó [evidencia 144](evidence/2026-11-24/144_ONSTARTCOMMAND_BACKUPPACKAGES_INTENT_DEFAULT_TYPE.md), basada en la ventana Smali compartida desde Termux.

**Delta confirmado en el extracto:** dentro de `BRService.onStartCommand(Intent;II)I`, rama `CMD_BACKUP`, la ruta normal lee `extra_bakfiles_type` con `getIntExtra(..., v13)` cuando `v13=1`; luego mueve el resultado a `v4`, que ocupa el argumento entero `p4` de `backupPackages(...)`. Así, el default de ese extra en esta ruta es **1** y se resuelve el pendiente que evidencia 141/143 habían dejado como `v13` desconocido. Antes de la invocación, `v13` se reutiliza para el último booleano; no confundir ambos usos.

**Distinción de rutas:** si `extra_is_retransfering=true`, el flujo llama a `backupPackagesByRetransfering(Z)V` y salta la llamada directa normal. No generalizar el default 1 a ese camino ni a todos los caminos de backup.

**Pendientes:** cuerpo/contexto íntegro del caller #1; literal `v8` y cadena causal del tipo 2; rastreo integral de `v13` donde tenga relevancia independiente. Investigación INCOMPLETA y estática.

------------------------------------------------------------------------

## 145. Cuerpo del caller #1 backupPackagesByRetransfering — 2026-11-24

Se incorporó [evidencia 145](evidence/2026-11-24/145_BRSERVICE_BACKUPPACKAGESBYRETRANSFERING_CALLER1_BODY.md), basada en el rango Smali compartido desde Termux.

**Delta:** se recupera el cuerpo sustancial del caller #1. Antes de llamar a backupPackages, obtiene el descriptor con RetransferUtils.getProgress; exige descriptor no nulo y brState==3; en retransmisión automática (p1=true) detiene el flujo cuando autoRetransferCnt>=3 y, si continúa, incrementa mAutoRetransferCnt; con p1=false reinicia ese campo a cero. Restaura los campos currentSendedSdFile y pendingFiles, reconstruye TransDeviceInfo desde los campos del descriptor, obtiene BRItems y ruta con tipo 3, calcula el booleano de cifrado a partir de que encryptedPwd no esté vacío, y pasa p4=3. El booleano final de la llamada procede de p1.

**Reconciliación:** el tipo 3 de este caller pertenece a la ruta de retransmisión basada en descriptor; no contradice el default 1 de extra_bakfiles_type en la ruta normal CMD_BACKUP, documentado en evidencia 144. El valor p4=3 ya constaba en evidencia 141 y no se cuenta como hallazgo aislado nuevo.

**Cautela:** la salida recibida presenta desalineación de espacios/tabulaciones en la región de movimientos de registros y llamada. La reconstrucción se registra con esa limitación; no hay cotejo local independiente ni ejecución dinámica.

**Pendientes:** literal v8 y cadena causal del tipo 2; confirmar con extracción limpia cualquier detalle de asignación de registros que dependa de la región desalineada; investigación INCOMPLETA y estática.



------------------------------------------------------------------------

## 146. BRService$5: v8, tipo 2, copia temporal y ruta de restorePackage — 2026-11-24

Se incorporó [evidencia 146](evidence/2026-11-24/146_BRSERVICE5_V8_TYPE2_TEMP_COPY_AND_RESTORE_MANAGER_PATH.md), basada en ventanas Smali y el inventario completo de referencias a `v8` compartidos directamente por el usuario desde Termux.

**Hallazgo confirmado en los extractos:** `v8` se asigna como 1 cuando `mBakFilesType==2`, y como 0 en caso contrario (líneas físicas 119–124). El inventario de referencias muestra que, antes del consumidor en 1728, no hay redefinición de `v8`; las referencias intermedias 1051 y 1235 lo leen/mueven. Por tanto, el tipo 2 conduce a la rama que crea `.tmp_bak_file` bajo `getTransTempBackupRootPath()`, llama a `mcopyFile(4, v4, v10)` y sustituye la referencia local `v4` por el archivo temporal.

**Rama alternativa:** con `v8==0`, se evalúa `mIsTransingTask`; si es true se conserva `v4`; si es false se evalúa `mIsFlashDriveTask` y, para paquetes distintos de WeChat y QQ, puede llamarse a `unpackBakSdDatas(v4, localFileList)`. Ambas rutas convergen en `:goto_17`.

**Convergencia posterior:** se documentan las dos rutas de preparación de descriptor (PerformAdbRestoreTask o pipe/zipStreamReader) y la llamada alternativa a `BRManager.restorePackage(packageName, feature, passwd, absolutePath(v4), listener, descriptor)`. No se observa asignación a `v16` en las ventanas recibidas. No se vincula el valor `v16=8/9` de evidencia 133 con esta rama de tipo 2.

**Límites:** no se demuestra éxito de copia/restauración, efecto dinámico, estado final ni cadena completa hasta `mLastError`. El SHA-256 `7c0112052117caf5b5fb119fc807f62ea0cf42bf35fe8d7e75c38af8a18bde25` fue reportado por el usuario; no se recalculó localmente. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT, sin cotejo local independiente.

**Estado:** investigación estática INCOMPLETA; evidencia 146 añade el literal de la condición de tipo 2 y su ruta de copia temporal/restauración, sin promover inferencias fuera de los extractos.


------------------------------------------------------------------------

## 17. Evidencia 147 — continuación de BRService$5 tras restorePackage (24-11-2026)

**CONFIRMADO EN CHAT mediante salida directa de Termux; véase [Evidencia 147](evidence/2026-11-24/147_BRSERVICE5_RESTORE_RESULT_STATE_ERROR_AND_V35_CONTINUATION.md).**

- Líneas 2145–2180: rama condicional registra una aplicación deshabilitada y llama `PackageManager.setApplicationEnabledSetting(packageName, 0, 0)`.
- Líneas 2188–2224: en tarea Flash Drive se comparan los paquetes WeChat/QQ; la rama coincidente llama `unpackBakSdDatas(v4, BRItem.localFileList)`.
- Líneas 2278–2287: el catch de IOException escribe `v7` en `BRItem.error` y registra la excepción. No se observa escritura a `mLastError` en esta ventana.
- Líneas 2245–2249 y 2301–2314: se intenta eliminar el archivo temporal en la ruta ordinaria y en catch-all; no se verifica el resultado booleano de `File.delete()`.
- Líneas 2297, 2364 y 2391: se copia `v8` a `v35` en rutas concretas; no se atribuye semántica persistente al registro.
- Líneas 2316–2386: para `mIsTransingTask==true` y `packageName=="files_for_backup"`, se espera el fin de transferencia; si el estado previo no es 6, se escribe `BRItem.state=6` y se llama `notifyTransItemChange(...)`.
- Líneas 2393–2420: para tarea Flash Drive y `files_for_backup`, si `v3!=0`, se llama `restoreLocalMediaFile(BRItem, false, v3)`.

**Límites:** la ventana no contiene la invocación previa completa a `BRManager.restorePackage`; no demuestra un valor de retorno ni el éxito de esa llamada. Tampoco cierra `mLastError`, las ramas posteriores ni el resultado de `restoreLocalMediaFile`. El expediente sigue INCOMPLETO.


------------------------------------------------------------------------

## 18. Evidencia 148 — BRService$5: restauración local, cancelación, estado y MediaScanner — 2026-11-24

Se incorporó [evidencia 148](evidence/2026-11-24/148_BRSERVICE5_LOCAL_FILE_RESTORE_STATE_ABORT_AND_MEDIA_SCAN.md), basada en las ventanas 2410–2600 y 2580–2780 compartidas directamente desde Termux.

**Delta preservado:**
- La lista local se obtiene desde `BRItem.localFileList` o, si es null/vacía, desde `BRServiceDataHolder.getTypeBRServiceFileList(getZipSuffixType(packageName,type))`.
- Si la lista final es null/vacía, se llama `notifyItemTaskError(packageName, feature, 7)` y después `notifyItemTaskEnd(packageName, feature)`. No se observa escritura de 7 en `BRItem.error`.
- Durante el recorrido, `mIsAborted` verdadero produce escrituras explícitas `BRItem.state=3` y `BRItem.error=9`.
- La extracción obtiene ZipEntry/InputStream y llama `copyFileFromStream(4, BRItem, inputStream, path, transingTotalSize)`. Si devuelve true, agrega la ruta absoluta a una lista para MediaScanner; si devuelve false, solo registra `copyOneFile error, file lost` en este fragmento.
- Excepciones de copia y de cierre del InputStream se registran; no se observa asignación directa a `BRItem.error` en esos manejadores.
- Tras el cierre, si el estado es 1, 6 o 3, se conserva. Para cualquier otro estado se escribe `state=1`, `progType=0` y se llama `notifyItemTaskEnd(packageName,feature)`.
- La lista de rutas copiadas se pasa a `MediaScannerConnection.scanFile(context, paths, null, null)`.
- La ruta alternativa `:cond_47` comienza a iterar `BRItem.localFileList` cuando `v5` es null, pero la ventana acaba en 2780 y queda pendiente.

**Cautelas:** no asignar significado semántico global a los códigos 1/3/6 o error 9; no equiparar notificación de error 7 con escritura de campo; no inferir éxito dinámico ni cierre de `mLastError`/resultado de `restorePackage`. El expediente sigue INCOMPLETO.

------------------------------------------------------------------------

## 19. Evidencia 149 — BRService$5: ruta alternativa de restauración local, IOException y MediaScanner — 2026-11-24

Se incorporó [evidencia 149](evidence/2026-11-24/149_BRSERVICE5_ALTERNATIVE_LOCAL_RESTORE_COPY_ERROR_AND_MEDIA_SCAN.md), basada en las ventanas físicas 2750–2940 y 2920–3120 compartidas directamente desde Termux.

**Delta preservado:**
- En la ruta `:cond_47`, itera `BRItem.localFileList` y vuelve a comprobar `mIsAborted`; el aborto escribe `BRItem.state=3` y `BRItem.error=9`.
- Normaliza cada ruta con `normalizeAbsoluteSdPath(originalPath, mCurrentBackupRootPath)`, llama `Utils.newDirChangePath(originalPath)` y ejecuta `BRService.copyFile(4, File(normalizedPath), File(originalPath))`.
- Tras el retorno normal de la copia, agrega la ruta absoluta original a la lista de MediaScanner. Obtiene la fecha mediante `getModifyTimeByReceiveFileMap`, la parsea como long y llama `File.setLastModified`; el retorno booleano no se consume. El catch RuntimeException solo registra y continúa.
- El catch IOException notifica progreso de transferencia con código 4, rutas normalizada/original y tamaños 0/longitud del archivo; escribe directamente `BRItem.error=1`, registra la excepción y continúa el iterador. No se observa en ese catch escritura directa de `BRItem.state` ni finalización inmediata.
- Al terminar la iteración o salir por aborto, llama `MediaScannerConnection.scanFile` con las rutas agregadas y salta a `:goto_25`.
- La continuación local comprueba `mIsLocalBackupTask` y paquete `files_for_backup`; si `v3` no es null, llama `restoreLocalMediaFile(BRItem,false,v3)`. En otra rama vuelve a obtener la lista local o la lista alternativa por sufijo; si queda vacía, notifica error 7 y fin de tarea, sin mostrar escritura de `BRItem.error=7`.

**Dedupe y límites:** evidencia 148 conserva la ruta ZIP y el escaneo multimedia asociado; evidencia 149 añade la ruta alternativa de copia local y su catch IOException. El catch IOException de evidencia 147 pertenece a otro tramo y no se equipara automáticamente. No se atribuye semántica global a los códigos de estado/error ni se demuestra éxito dinámico, efecto real de `setLastModified` o finalización del escaneo. La extracción termina en línea 3120; la continuación queda pendiente. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT, sin cotejo local independiente ni ejecución dinámica.

**Estado:** investigación INCOMPLETA; evidencia estática documental.

------------------------------------------------------------------------

## 20. Evidencia 150 — BRService$5: cálculo de tamaño y segundo recorrido de extracción ZIP — 2026-11-24

Se incorporó [evidencia 150](evidence/2026-11-24/150_BRSERVICE5_ALTERNATIVE_RESTORE_SIZE_AND_ZIP_STREAM.md), continuación de evidencia 149 desde la línea 3121.

**Delta preservado:**
- Si `BRItem.transingTotalSize` ya es distinto de cero, esta rama lo conserva. Si es cero, consulta `mTransingTotalSizeMap` mediante el sufijo `v3`; usa el valor de mapa cuando es distinto de cero y, si falta o vale cero, calcula `v4.size() × 0x100 × 0x400` (262144 bytes / 256 KiB por elemento).
- Inicia un segundo recorrido de `v4`. Antes de cada elemento comprueba `mIsAborted`; si está activo, escribe `BRItem.state=3` y `BRItem.error=9`, y salta a `:goto_35`.
- Para cada ruta obtiene la ruta relativa respecto al almacenamiento externo, localiza la entrada con `ZipFile.getEntry`, obtiene su `InputStream` y prepara `copyFileFromStream(4, BRItem, inputStream, originalPath, transingTotalSize)`.
- La extracción termina en la propia invocación, línea 3300; retorno, tratamiento de errores, cierre del flujo, avance del bucle y destino de `:goto_35` permanecen pendientes.

**Límites:** 256 KiB es un factor de estimación por elemento, no un tamaño real demostrado. Análisis estático de salida Termux compartida por el usuario; no hay ejecución dinámica ni cotejo local independiente. El expediente continúa INCOMPLETO.

------------------------------------------------------------------------

## 21. Evidencia 151 — BRService$5: resultado de copia ZIP, cierre de flujo y finalización — 2026-11-24

Se incorporó [evidencia 151](evidence/2026-11-24/151_BRSERVICE5_ALTERNATIVE_RESTORE_COPY_RESULT_FINAL_STATE_AND_NOTIFICATIONS.md), continuación de evidencia 150 desde la línea 3301.

**Delta preservado:**
- Si `copyFileFromStream` devuelve true, la ruta absoluta se agrega a `v3`; si devuelve false, se registra `copyOneFile error, file lost`, sin escritura directa visible a `BRItem.error` en ese bloque. Las excepciones de obtención/copia se registran como `copyFileFromStream error` y el bucle continúa.
- Al terminar el bucle o entrar por `:goto_35`, se intenta cerrar el InputStream si el registro es no nulo. Una excepción de cierre genera `notifyItemTaskError(..., 7)` y `notifyItemTaskEnd(...)`; no se observa escritura directa a `BRItem.error` en ese bloque.
- Si `v3` (rutas copiadas) está vacía y `v4` (lista de origen) no, se notifican error 7 y fin de tarea.
- Si el estado no es 1, 6 o 3, se escribe `state=1`, `progType=0` y se notifica fin. Los estados 1, 6 y 3 quedan excluidos de esa normalización.

**Límites:** notificar error 7 no demuestra asignación de `BRItem.error=7`; la ventana termina durante `MediaScannerConnection.scanFile`. Análisis estático de salida Termux aportada por el usuario, sin ejecución dinámica ni cotejo local independiente. El expediente continúa INCOMPLETO.

------------------------------------------------------------------------

## 23. Evidencia 153 — BRService$5: ciclo de vida de ZipFile en v5 y reinicio de v13 — 2026-11-24

Se incorporó [evidencia 153](evidence/2026-11-24/153_BRSERVICE5_ZIPFILE_REGISTER_V5_LIFECYCLE_AND_V13_RESET.md).

La salida Termux de las ventanas físicas 850–970 confirma que `run()V` intenta construir `ZipFile(mZipFilePath)`; en el camino exitoso mueve el objeto a `v5` y salta a `:goto_e`. Si la ruta es nula/vacía o el constructor lanza `IOException`, el flujo llega a `:cond_1a` y asigna `v5=null` antes del bucle principal. El manejador reutiliza temporalmente v5 para String/estado, pero la asignación null normaliza el camino de fallo.

La ventana 853–875 muestra que v13 se reutiliza antes como booleano de `Iterator.hasNext()` y como objeto/BRItem. La instrucción física 958 (`:goto_e`) lo reinicia a cero antes del bucle principal; esos usos previos no pertenecen al contador numérico posterior. Las tres coordenadas de incremento y el uso final no se duplican: ya constan en evidencias 139 y 138.

Esta evidencia conecta el origen de v5 con las comprobaciones de `BRItem.error=1/10` documentadas en evidencia 152. La lectura de `if-nez v5` como presencia del ZipFile queda condicionada a que no haya reasignaciones intermedias no cubiertas; no se afirma integridad del ZIP ni éxito de restauración. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente ni ejecución dinámica.

------------------------------------------------------------------------

## 22. Evidencia 152 — BRService$5: escaneo multimedia, ruta alternativa y asignación de error — 2026-11-24

Se incorporó [evidencia 152](evidence/2026-11-24/152_BRSERVICE5_MEDIA_SCAN_ALTERNATE_RESTORE_AND_ERROR_ASSIGNMENT.md), continuación de evidencia 151 desde la línea 3501.

**Delta preservado:**
- La rama convierte las rutas acumuladas en un array y llama `MediaScannerConnection.scanFile(context, paths, null, null)`; después incrementa `v13` y regresa a `:goto_26`. La llamada no confirma que el escaneo haya terminado.
- La ruta alternativa construye `mCurrentBackupRootPath/backup_<suffix>.zip` y llama `restoreLocalMediaFile(BRItem, false, InputStream)`, regresando después a `:goto_38`.
- La ruta de fallo llama `BackupRestoreListener.onError(packageName, feature, 6)` y `onRestoreEnd(...)`, y registra `Restore failed`.
- Si el ZIP existe y `v5 == false`, escribe `BRItem.error=1`; si la referencia es nula o el archivo no existe y `v5 == false`, escribe `BRItem.error=10`. El código 6 de la notificación no es el valor asignado a `BRItem.error` en estas ramas.

**Límites:** origen/significado de `v5` pendiente; no inferir integridad del ZIP a partir de `File.exists()`. La ventana termina al inicio de la rama que comprueba `BRItem.error` (línea 3680). Análisis estático de salida Termux aportada por el usuario; expediente INCOMPLETO.

------------------------------------------------------------------------

## 24. Evidencia 154 — BRService$5: inventario grep de operandos destino v5/v13 — 2026-11-24

Se incorporó [evidencia 154](evidence/2026-11-24/154_BRSERVICE5_V5_V13_REGISTER_WRITE_SITE_INVENTORY.md), con el inventario completo de ocurrencias que el patrón grep del usuario devolvió para v5/v13.

**Delta relevante:** aparecen escrituras posteriores a la inicialización principal de v13: `const/4 v13, 0x0` en la línea física 2266 y `move-object v13, v10` en la 2304. Sus contextos y rutas de control están pendientes; no se puede asumir que el contador iniciado en 958 alcance el resumen sin redefiniciones. Las coordenadas 2227, 2422 y 3503 ya constan en evidencia 139 y no se duplican. Para v5, el inventario agrega ocurrencias candidatas en 97, 111, 804 y 3844–4088, todavía sin contexto suficiente para clasificar sus valores; las asignaciones 913/953 y los usos de error están preservados en evidencias 153/152.

El patrón también devuelve lecturas de registros en bifurcaciones y operaciones aritméticas; por tanto, la salida se conserva como inventario de operandos destino/candidatos, no como listado ya validado de escrituras semánticas. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT, sin cotejo local independiente ni ejecución dinámica. Estado INCOMPLETO.

------------------------------------------------------------------------

## 25. Evidencia 155 — BRService$5: v13 en limpieza excepcional y reutilizaciones de v5 — 2026-11-24

Se incorporó [evidencia 155](evidence/2026-11-24/155_BRSERVICE5_V13_EXCEPTION_CLEANUP_AND_V5_REGISTER_REUSE.md), con el contexto físico 2245–2320, 70–125, 780–820, 3825–3960 y 4025–4105.

**Delta principal:** las asignaciones `v13=0` (2266) y `v13=v10` (2304) están dentro de handlers `catchall` que convergen en `:goto_23`, limpian mediante `File.delete()` la referencia temporal si existe y relanzan la excepción. No son reinicios del contador en el flujo normal hacia el resumen. Se contextualizan además ocurrencias v5: 97/804 son resultados `mBRItems` en rutas tempranas de finalización; 111 es constante para comparar `mBakFilesType`; las ocurrencias 3844–4088 son valores/argumentos de índice, estado, espera y logging, no la ZipFile. La evidencia 154 queda parcialmente clasificada; no se declara auditoría exhaustiva de todos los usos.

Dedupe: no se repiten incrementos 2227/2422/3503 ni el uso final de v13, conservados en evidencias 139/138. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente ni ejecución dinámica. Expediente INCOMPLETO.


------------------------------------------------------------------------

## 26. Evidencia 156 — BRService$5: comprobaciones de v5 y selección de rutas de restauración — 2026-11-24

Se incorporó [evidencia 156](evidence/2026-11-24/156_BRSERVICE5_V5_ZIPFILE_GATED_RESTORE_BRANCHES.md), basada en las ventanas físicas 1485–1535, 2410–2465 y 2980–3040 compartidas desde Termux.

**Delta preservado:**
- En 1509, v5 null desvía a `:cond_2a`; con v5 no null se comprueba además `File.exists()` sobre v4, y la ausencia del archivo también desvía a `:cond_2a`.
- En 2437, v5 null desvía a `:cond_47`, ruta alternativa local descrita en evidencias 148/149. Con v5 no null continúa por la rama que obtiene `BRItem.localFileList` o consulta `BRServiceDataHolder.getTypeBRServiceFileList(getZipSuffixType(packageName,type))`.
- En 3011, v5 null desvía a `:cond_59`; con v5 no null continúa por otra rama que obtiene la lista local directa o la lista de `BRServiceDataHolder`. No se atribuye semántica adicional a `:cond_59` fuera del fragmento.
- Las guardias confirman que v5 participa en la selección de rutas de restauración, no solo en las asignaciones de `BRItem.error` ya documentadas en evidencia 152.

**Dedupe y límites:** los cuerpos de recorrido de listas y la ruta alternativa ya constan en evidencias 148/149; evidencia 156 conserva únicamente la relación de las tres guardias con v5. La comprobación `File.exists()` no demuestra integridad ZIP ni éxito de restauración. El vínculo entre inicialización y guardias se apoya en evidencias 153–155, sin declarar auditoría exhaustiva de todos los usos. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT, sin cotejo local independiente ni ejecución dinámica. Estado INCOMPLETO.


------------------------------------------------------------------------

## 27. Evidencia 157 — BRService$5: destinos :cond_2a y :cond_59 — 2026-11-24

Se incorporó [evidencia 157](evidence/2026-11-24/157_BRSERVICE5_COND2A_AND_COND59_DESTINATIONS.md), basada en las ventanas físicas 1678–1745 y 3498–3565 compartidas desde Termux.

**Delta preservado:**
- `:cond_2a` inicializa v3 a cero. Comprueba v4: si es null o `File.exists()` devuelve false, cae en `:cond_2b`; la prueba `if-eqz v3` conduce entonces a `:cond_3b`. Si v4 existe, salta a `:cond_2c`. Los cuerpos de ambos destinos quedan pendientes.
- `:cond_59` calcula el sufijo y construye la ruta `mCurrentBackupRootPath/backup_<suffix>.zip`, crea un `File` y luego llama `restoreLocalMediaFile(BRItem,false,v3)`. No se observa en la ventana apertura del File ni obtención de InputStream desde él; no se afirma que ese ZIP sea el flujo entregado. El origen de v3 queda pendiente.

**Dedupe y límites:** E148/E149 ya describen la ruta alternativa `:cond_47`; E156 conserva las guardias de entrada. E157 añade únicamente los destinos iniciales de `:cond_2a` y `:cond_59`. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT, sin cotejo local independiente ni ejecución dinámica. Pendientes: cuerpos de `:cond_2c`/`:cond_3b` y procedencia de v3 en `:cond_59`. Expediente INCOMPLETO.


------------------------------------------------------------------------

## 28. Evidencia 158 — BRService$5: destinos :cond_2c y :cond_3b — 2026-11-24

Se incorporó [evidencia 158](evidence/2026-11-24/158_BRSERVICE5_COND2C_AND_COND3B_TRANSFER_BRANCHES.md), basada en las ventanas físicas 1708–1790 y 2308–2391 compartidas desde Termux.

**Delta preservado:**
- En `:cond_2c`, cuando v8 no es cero, se obtiene `getTransTempBackupRootPath()`, se construye `.tmp_bak_file` y se llama `copyFile(4,v4,tempFile)`; después v4 se reasigna al archivo temporal y el flujo salta a `:goto_17`.
- Cuando v8 es cero, `:cond_2d` comprueba `mIsTransingTask`; si está activo conserva v4 y salta a `:goto_17`; si no, continúa a `:cond_2e` y empieza la comprobación de `mIsFlashDriveTask`.
- En `:cond_3b`, si hay transferencia activa y el paquete es `files_for_backup`, se llama `waitingForFilesTransingEnd()`; si BRItem.state no es 6, se escribe 6; después se notifica mediante `notifyTransItemChange(...)` y se salta a `:goto_25`. Las demás condiciones continúan por `:cond_3c`.

**Dedupe y límites:** E157 conserva la entrada a ambos destinos; E158 añade sus cuerpos parciales. No se atribuye semántica no demostrada a los argumentos de `copyFile`, no se afirma que el archivo temporal sea el origen del InputStream de `:cond_59`, y no se infiere apertura o integridad de ZIP. Continúan pendientes la procedencia de v3 en `:cond_59` y las continuaciones de `:cond_2e` / `:cond_3c` si se requiere cerrar esas rutas. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT, sin cotejo local independiente ni ejecución dinámica. Expediente INCOMPLETO.


------------------------------------------------------------------------

## 29. Evidencia 159 — BRService$5: procedencia de v3 y ruta null-stream hacia :cond_59 — 2026-11-24

Se incorporó [evidencia 159](evidence/2026-11-24/159_BRSERVICE5_COND59_NULL_STREAM_CONTROL_FLOW.md), basada en las ventanas físicas 1540–1680, 2385–2435, 2975–3020 y 3505–3570, más los contextos 2990–3065 y 1650–1730 compartidos desde Termux.

**Delta confirmado en el flujo de control:**
- La ruta ordinaria obtiene un ZipEntry con ZipFile.getEntry() y después un InputStream con ZipFile.getInputStream(); move-result-object v3 sustituye el ZipEntry por el flujo en la línea física 1661.
- Las llamadas ordinarias de restauración local en 2419 y 3006 están precedidas por la comprobación v3 != null.
- En la ruta alternativa, línea 2999, v3 == null conduce a :cond_4c. Allí, línea 3011, v5 == null conduce directamente a :cond_59.
- La reasignación v3 = BRItem.packageName de la línea 3017 solo ocurre en la caída cuando v5 != null; queda omitida en el salto directo a :cond_59. Por tanto, v3 sigue siendo null al llegar a la llamada de línea 3561.
- :cond_59 construye un File con la ruta mCurrentBackupRootPath/backup_<suffix>.zip, pero ese objeto no se pasa como argumento a restoreLocalMediaFile(BRItem,false,v3). El cuarto argumento v3 es null.

**Corrección y límites:** E157 dejaba pendiente el origen de v3 en :cond_59; E159 resuelve ese punto concreto. No se afirma que el ZIP construido sea irrelevante para el método receptor: restoreLocalMediaFile puede abrir/derivar la ruta mediante su propia lógica interna, cuyo cuerpo debe cotejarse. No se infiere integridad ZIP, restauración exitosa ni ejecución dinámica. E156 conserva las guardias de v5 y E158 las ramas de transferencia; no se duplican.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash del Smali y sin ejecución dinámica. Expediente INCOMPLETO.


------------------------------------------------------------------------

## 30. Evidencia 160 — BRService: receptor restoreLocalMediaFile y fallback ZIP/stream — 2026-11-25

Se incorporó [evidencia 160](evidence/2026-11-25/160_BRSERVICE_RESTORELOCALMEDIAFILE_AND_ZIP_STREAM_FALLBACK.md), consolidación de la continuación del análisis de `BRService$5.run()`, el método privado `BRService.restoreLocalMediaFile(BRItem, boolean, InputStream)` y el caller `BRService$11`.

**Delta conservado:**
- El método receptor fue localizado en `BRService.smali`, alrededor de la línea física 12772 (`.line 3136–3168)); el puente/caller sintético aparece en `BRService$11.smali:1478`.
- Según el fragmento directo compartido en el chat, el receptor deriva `backup_<suffix>.zip` desde `mCurrentBackupRootPath`. Si el archivo falta y el InputStream también es null, la ruta reportada asigna `state=3,error=7` y notifica error/fin. Si existe el archivo o el stream no es null, pasa ambos a `ArchiveHelper.unzipFiles`, registra el estado de extracción y después finaliza según aborto/éxito.
- La evidencia histórica 27 de `ArchiveHelper.unzipFiles` conserva la distinción: stream no nulo usa `ZipInputStream`; stream null abre `FileInputStream(File)`. Por tanto, un argumento null no significa por sí solo ausencia de fuente: el receptor puede usar el ZIP local.
- El resumen recuperado de `BRService$11.smali:3765–3788` describe lectura de `mZipFilePath`, apertura de `ZipFile`, selección de `backup_qq.zip` o `backup_wechat.zip`, extracción de InputStream y entrega al receptor; si falla la apertura, el stream queda null y continúa hacia el receptor. Esta parte permanece `RECOVERED-CHAT / PRIOR-ASSISTANT-SUMMARY`, pendiente de cotejo con el bloque literal.
- Esto complementa E159: `:cond_59` entrega null y no pasa su objeto File local; el receptor puede reconstruir la ruta a partir del BRItem y la raíz, y ArchiveHelper puede abrir el archivo local. No se afirma éxito ni integridad del ZIP.

**Dedupe y continuidad:** E153–E159 permanecen como evidencias independientes; no se duplican sus hallazgos. El SHA-256 reportado de `BRService$5.smali` y el mapping `v8=1` cuando `mBakFilesType==2` se conservan como contexto ya registrado, no como nuevos hallazgos de E160.

**Siguiente objetivo aceptado:** rastrear todas las escrituras, lecturas y limpiezas de `mZipFilePath`, así como las condiciones que activan cada ruta. Cotejar el bloque de `BRService$11` y el método receptor completos antes de elevar los resúmenes a evidencia primaria.

**Procedencia y límites:** el resumen de `restoreLocalMediaFile` procede de una salida directa compartida por el usuario, recuperada aquí sin transcripción literal completa; el bloque de `BRService$11` se conserva como resumen histórico, no como fuente primaria. No `LOCAL-VERIFIED`, no ejecución dinámica. El expediente continúa **INCOMPLETO**.



------------------------------------------------------------------------

## 31. Evidencia 161 — BRService: consumidores de mZipFilePath, extracción split APK y limpieza — 2026-11-25

Se incorporó [evidencia 161](evidence/2026-11-25/161_BRSERVICE_MZIPFILE_RESTORE_STREAM_SPLITAPK_AND_CLEANUP.md), basada en las ventanas Termux de `BRService$11.smali:1350–1530, 1535–1585 y 1575–1645`, y `BRService.smali:13020–13085 y 13135–13215`.

**Delta preservado:**
- Se coteja con salida literal el bloque de `BRService$11` que E160 conservaba como resumen: lee `mZipFilePath`, intenta abrir `ZipFile`, selecciona `backup_qq.zip` o `backup_wechat.zip`, obtiene un InputStream y llama `restoreLocalMediaFile(BRItem, boolean, InputStream)`. Si la ruta es null/vacía o falla la apertura, el stream queda null y el flujo llega al receptor. Si falla la obtención del stream, registra `can't get zipInputStream` y notifica error 7 antes de la unión del flujo.
- Después de la llamada, el callback comprueba `BRItem.error==0` y `splitApkPath` no vacío; si el archivo split existe, agrega su longitud a `totalSize` y `completedSize`.
- La limpieza exige que `mZipFilePath` no esté vacío y que el archivo correspondiente exista; entonces obtiene el directorio padre del File creado desde `BRItem.splitApkPath` y llama `FileUtils.deleteFile(parent)`. El objeto eliminado no es directamente el archivo `mZipFilePath`. No se demuestra que la eliminación tenga éxito.
- La ventana 13020–13085 identifica el método `restoreStreamSplitApk(BRItem, ZipFile, InputStream)`. La continuación muestra que elimina la extensión de `mZipFilePath`, concatena ese prefijo con el `splitApkPath` previo, actualiza el campo con la ruta absoluta, crea el directorio/archivo de destino y comienza a copiar desde un InputStream en bloques de 1024 bytes. El método no está recuperado completo.
- Se corrige la atribución provisional del intercambio anterior: el fragmento físico 13075–13123 pertenece a `restoreStreamSplitApk`, no se atribuye a `handleTaskFinish`. `getZipPath()` simplemente devuelve `mZipFilePath`.

**Dedupe y límites:** E160 conserva el resumen del receptor `restoreLocalMediaFile` y el contrato de `ArchiveHelper.unzipFiles`; E161 no los duplica. El inventario anterior de `mZipFilePath` y la escritura visible desde `extra_zip_file_path` tampoco se repiten. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Quedan pendientes el método `restoreStreamSplitApk` completo y el ciclo de vida/origen de `extra_zip_file_path`. El expediente sigue **INCOMPLETO**.


------------------------------------------------------------------------

## 32. Evidencia 162 — BRService.restoreStreamSplitApk: método completo, streams y limpieza — 2026-11-25

Se incorporó [evidencia 162](evidence/2026-11-25/162_BRSERVICE_RESTORE_STREAM_SPLITAPK_COMPLETE_METHOD_AND_STREAM_CLEANUP.md), basada en la salida completa de Termux para `BRService.smali:13035–13362` y el grep de referencias dentro del mismo archivo.

**Delta preservado:**
- Si `splitApkPath` está vacío, el método omite la búsqueda de entrada y llega a la limpieza; si la entrada ZIP no existe, cierra el stream recibido (si no es null) y retorna.
- Si la entrada existe, obtiene un nuevo InputStream con `ZipFile.getInputStream(entry)` y sobrescribe el registro `p3`, que inicialmente contenía el InputStream recibido como argumento.
- Construye el destino concatenando el prefijo de `mZipFilePath` anterior a su último punto con el `splitApkPath` previo; actualiza el campo con la ruta absoluta.
- Crea el directorio padre solo si no existe, llama `mkdirs()` y `createNewFile()` en esa rama sin comprobar sus booleanos; después abre FileOutputStream.
- Copia en bloques de 1024 bytes mediante BufferedOutputStream, hace flush y cierra el buffer. Después intenta cerrar explícitamente también el FileOutputStream subyacente.
- Los handlers ordinarios y catchall intentan cerrar el FileOutputStream y el InputStream actualmente referenciado por `p3`; catchall relanza la excepción. No se observa `ZipFile.close()` en el cuerpo.
- **Hallazgo acotado:** en la rama de entrada ZIP existente, el parámetro InputStream original se sobrescribe antes de la limpieza y no aparece otra referencia a él dentro del método. No se observa su cierre local en esa rama; el caller podría administrarlo externamente y debe revisarse antes de concluir una fuga.
- El grep dentro de `BRService.smali` devuelve la definición privada (13035), el puente sintético (2101) y la llamada interna del puente (2104); no cubre callers en otros archivos.

**Dedupe y límites:** E161 ya conservaba la identificación parcial y el comienzo del método; E162 añade el cuerpo completo y la gestión de recursos. No se duplican los consumidores `mZipFilePath` de E161 ni el receptor/fallback de E160. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Pendiente rastrear el puente en todos los directorios Smali y revisar el caller para determinar la propiedad del stream original. Después continuar con el origen/ciclo de vida de `extra_zip_file_path`. Expediente INCOMPLETO.


------------------------------------------------------------------------

## 33. Evidencia 163 — BRService$5: caller de restoreStreamSplitApk y flujo posterior — 2026-11-25

Se incorporó [evidencia 163](evidence/2026-11-25/163_BRSERVICE5_CALLER_RESTORE_STREAM_SPLITAPK_AND_POSTCALL_FLOW.md), basada en el grep global del puente sintético y la ventana `BRService$5.smali:1815–1965`.

**Delta preservado:**
- El grep global encontró la invocación del puente en `BRService$5.smali:1899`; la otra coincidencia es la definición del puente en `BRService.smali:2101`.
- El caller entrega `v3` como InputStream, junto con `BRItem v6` y `ZipFile v5`, al puente que delega en `restoreStreamSplitApk`.
- Tras regresar, usa el mismo `ZipFile v5` para obtener otra entrada basada en el basename de `BRItem.bakFilePath`, obtiene un nuevo InputStream `v0`, crea un pipe, construye `zipStreamReader` y lo entrega a `BackupApp.workExecutor`.
- El array de descriptores del pipe se guarda en `v3`, sobrescribiendo el registro del caller que contenía el InputStream original. El `v0` posterior es un stream distinto del original entregado al método split.
- La sobrescritura de `p3` en el método receptor no altera el registro `v3` del caller. En el tramo posterior compartido no aparece un cierre explícito del InputStream original; todavía deben inspeccionarse el contexto previo, el resto del método y sus handlers/catchall antes de concluir si existe fuga o cierre externo.

**Dedupe y límites:** E162 ya contiene el cuerpo completo del método privado y la sobrescritura de su parámetro local. E163 añade el caller y distingue el stream original del stream entregado al lector del pipe. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Siguiente paso: recuperar el método contenedor completo y rastrear asignaciones/cleanup de `v3`. Después, continuar con el origen/ciclo de vida de `extra_zip_file_path`. Expediente INCOMPLETO.


------------------------------------------------------------------------

## 34. Continuidad operativa — rutas corregidas y lecturas recibidas — 2026-11-25

Durante la continuación posterior a E163 se detectó que los comandos
anteriores omitían el subdirectorio `smali/`. Por ello, las rutas no
resolvían los archivos y **no llegaron a leer su contenido**. El usuario
confirmó que los tres archivos existen en:

`$HOME/backup-static/decoded/smali/com/miui/backup/service`

La ruta correcta se define así:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"
```

Lecturas solicitadas (ya recibidas parcialmente en el chat):

- `BRService.smali`: líneas físicas 13190–13320, continuación de
  `restoreStreamSplitApk` (excepciones y cierre).
- `BRService$zipStreamReader.smali`: líneas físicas 180–280, final de
  `run()`.
- `BRService$5.smali`: líneas físicas 1935–2005, continuación del
  caller tras crear la tubería.

Comando exacto compartido para la siguiente lectura:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"

echo "===== Líneas totales ====="
wc -l "$D/BRService.smali" "$D/BRService\$zipStreamReader.smali" "$D/BRService\$5.smali"

echo
echo "===== restoreStreamSplitApk: excepciones y cierre ====="
sed -n '13190,13320p' "$D/BRService.smali"

echo
echo "===== zipStreamReader: final de run() ====="
sed -n '180,280p' "$D/BRService\$zipStreamReader.smali"

echo
echo "===== BRService$5: continuación tras crear la tubería ====="
sed -n '1935,2005p' "$D/BRService\$5.smali"
```

**Actualización tras recibir las salidas:** las tres ventanas se recibieron el 2026-11-25. La continuación de `BRService.smali` solapa el cleanup ya preservado en E162 y no se duplica. La cola de `zipStreamReader.run()` y la continuación de `BRService$5` hacia `PerformAdbRestoreTask` aportan deltas nuevos, registrados en E164.

**Clasificación:** la corrección de rutas permanece como continuidad operativa; las observaciones nuevas se clasifican en E164. E160–E163 permanecen sin duplicación.

**Siguiente paso:** completar el constructor/inicio de `zipStreamReader.run()` y el resto de `BRService$5` hasta `.end method`, incluidos handlers y cleanup de los descriptores. Mantener el expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 35. Evidencia 164 — zipStreamReader cleanup y continuación de BRService$5 — 2026-11-25

Se incorporó [evidencia 164](evidence/2026-11-25/164_ZIPSTREAMREADER_CLEANUP_AND_BRSERVICE5_RESTORE_TASK_CONTINUATION.md), basada en las ventanas Termux `BRService$zipStreamReader.smali:180–280` y `BRService$5.smali:1935–2005`, además del cotejo de `BRService.smali:13190–13320` y los conteos físicos de los tres archivos.

**Delta preservado:**
- El final de `zipStreamReader.run()` intenta cerrar el OutputStream local y el campo `mZipInputStream` tanto en la ruta de error de transferencia como en la ruta catchall que relanza la excepción.
- Después de entregar el lector del pipe, el caller `BRService$5` comprueba `mRestoreTaskExecutor.isShutdown()`; si no está apagado, construye y ejecuta `PerformAdbRestoreTask` con Context, ParcelFileDescriptor, BRItem, contraseña y BackupRestoreListener, y después llama a `waitForRestoreTaskEnd()`.
- La ventana de `restoreStreamSplitApk` solapa la limpieza de streams ya descrita en E162; no se crea un hallazgo duplicado.

**Límites:** las ventanas no muestran el constructor/inicio de `zipStreamReader.run()`, el destino de `:goto_1c`, el resto de `BRService$5` hasta `.end method`, ni todos los handlers/cierres de descriptores. No se afirma fuga, cierre completo de ambos extremos del pipe ni restauración exitosa. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo y sin ejecución dinámica.

**Siguiente paso:** completar constructor e inicio de `zipStreamReader`; recuperar `BRService$5` desde el destino de `:goto_1c` hasta el final del método y revisar todos los caminos de cleanup. Después continuar con `extra_zip_file_path`. Expediente INCOMPLETO.


------------------------------------------------------------------------

## 36. Evidencia 165 — BRService$5: continuación posterior a :goto_1c y streams ZIP por archivo — 2026-11-25

Se incorporó [evidencia 165](evidence/2026-11-25/165_BRSERVICE5_POST_GOTO1C_RESTORE_BRANCH_AND_ZIP_ENTRY_STREAM.md), basada en las ventanas Termux `BRService$zipStreamReader.smali:1–179` y `BRService$5.smali:2070–2760`, con ubicación de `:goto_1c` en la línea física 2083.

**Delta preservado:**
- El constructor de `zipStreamReader` guarda el array en `mPipe` y el InputStream en `mZipInputStream`. El inicio de `run()` crea el FileOutputStream usando específicamente `mPipe[1].getFileDescriptor()`, lee del InputStream almacenado y escribe al descriptor. E164 ya conserva la limpieza; E165 añade el mapeo del índice usado.
- El destino de `:goto_1c` continúa con comprobación de app del sistema y, para paquetes no sistémicos, consulta el estado de habilitación; si el valor es 2, llama `setApplicationEnabledSetting(packageName, 0, 0)`.
- Continúa la rama de tareas flash-drive/WeChat/QQ y puede invocar `unpackBakSdDatas`.
- En una rama de `files_for_backup`, si el registro es InputStream no nulo, se llama `restoreLocalMediaFile(BRItem, false, InputStream)`. En la rama alternativa con lista, las rutas se obtienen de `BRItem.localFileList` o `BRServiceDataHolder`.
- La rama de lista itera rutas, obtiene entradas de `ZipFile`, abre streams con `getInputStream`, los pasa a `copyFileFromStream`, acumula rutas absolutas de copias reportadas como correctas y, al terminar el bucle, intenta cerrar la referencia actual `v7`. También puede invocar `MediaScannerConnection.scanFile`.
- Se conservan los handlers observados: IOException asigna el código de error al BRItem y elimina el temporal si existe; catchall elimina el temporal y relanza.

**Dedupe y límites:** E163 conserva el caller y la preparación del pipe; E164 conserva el cleanup de `zipStreamReader.run()` y la tarea `PerformAdbRestoreTask`. E165 no duplica esos hallazgos. No está demostrado que `copyFileFromStream` cierre cada stream, que el descriptor complementario del pipe se cierre, ni que el InputStream original se cierre. La ventana termina en otra rama y no llega a `.end method`.

**Siguiente paso:** continuar `BRService$5.smali` desde la línea 2760 hasta el final del método; recuperar `BRService.copyFileFromStream` completo y revisar asignaciones/cierres del InputStream original. Después continuar con `extra_zip_file_path`.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 37. Evidencia 166 — BRService$5: rama localFileList y localización de copyFileFromStream — 2026-11-25

Se incorporó [evidencia 166](evidence/2026-11-25/166_BRSERVICE5_LOCAL_FILELIST_COPY_AND_COPYFILEFROMSTREAM_LOCATOR.md), basada en la ventana Termux `BRService$5.smali:2760–2900` y el grep de referencias a `copyFileFromStream` en `BRService.smali`.

**Delta preservado:**
- La rama `localFileList` itera rutas y, si `mIsAborted` es true, asigna `BRItem.state=3,error=9`.
- En la ruta no abortada, normaliza la ruta contra `mCurrentBackupRootPath`, llama `Utils.newDirChangePath` y ejecuta el puente `copyFile(BRService,4,File(destino normalizado),File(origen))`.
- Si `copyFile` retorna sin IOException, agrega la ruta absoluta del File de origen a la lista; después consulta el tiempo de modificación mediante `getModifyTimeByReceiveFileMap` e intenta aplicarlo con `File.setLastModified`. La RuntimeException de parseo/aplicación se registra.
- El grep localiza el puente sintético `-$$Nest$mcopyFileFromStream` en la línea física 1685 y la definición privada `copyFileFromStream` en la línea física 4185 de `BRService.smali`; todavía no se ha recuperado el cuerpo.

**Dedupe y límites:** E165 ya conserva la rama distinta de streams ZIP por entrada que llama a `copyFileFromStream`. E166 añade la rama File→File y las coordenadas del método receptor. La ventana termina antes de los handlers y del final de `BRService$5.run()`. No se afirma que `copyFileFromStream` cierre los streams ni se concluye fuga.

**Siguiente paso:** recuperar el método completo `BRService.copyFileFromStream` desde la línea física 4185 hasta `.end method`, incluidos handlers y cierres. Expediente **INCOMPLETO**.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica.


------------------------------------------------------------------------

## 38. Evidencia 167 — BRService.copyFileFromStream: preparación de destino y bucle parcial — 2026-11-25

Se incorporó [evidencia 167](evidence/2026-11-25/167_BRSERVICE_COPYFILEFROMSTREAM_PARTIAL_BUFFER_AND_OUTPUT_SETUP.md), basada en la salida Termux de `BRService.smali:4185–4350`.

**Delta preservado:**
- El método privado `copyFileFromStream(int, BRItem, InputStream, String, long)Z` registra origen/destino, normaliza el destino mediante `Utils.newDirChangePath` y crea el File de salida.
- Si el destino no tiene padre, retorna false. Si el padre no existe, llama `Utils.makeDirs`; el resultado booleano no se comprueba en la ventana recibida.
- Si el InputStream es null, registra el error y retorna false.
- Notifica el inicio del progreso; con `p1==3`, la ruta de origen notificada es null; de otro modo usa la ruta absoluta del destino.
- Abre `FileOutputStream`, crea un búfer de 32 KiB (`0x8000`) y comienza un bucle que lee del InputStream y escribe al output. También acumula bytes y consulta `elapsedRealtime()` para la lógica de progreso.

**Dedupe y límites:** E165 conserva el caller ZIP-entry; E166 conserva la rama File→File y la ubicación del receptor. E167 añade solo la preparación y el inicio parcial del método receptor. La salida se interrumpe en mitad del bucle, antes de handlers y `.end method`; no permite determinar cierres, flush, manejo completo de errores, retorno final ni borrado de destino parcial. No inferir fuga ni éxito/integridad.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 39. Evidencia 168 — BRService.copyFileFromStream: progreso, sync y cierre normal — 2026-11-25

Se incorporó [evidencia 168](evidence/2026-11-25/168_BRSERVICE_COPYFILEFROMSTREAM_PROGRESS_SYNC_AND_PARTIAL_HANDLERS.md), basada en la continuación Termux de `BRService.smali:4340–4500`.

**Delta preservado:**
- Durante la copia, cuando transcurren más de 16 ms desde la última notificación, el método informa progreso si `mIsLocalBackupTask` es false; comunica bytes acumulados, destino absoluto y total esperado.
- Al alcanzar EOF notifica la etapa/estado 3. Para `p1==3`, la ruta de origen notificada es null; en otro caso usa la ruta absoluta del destino.
- Ejecuta `FileOutputStream.flush()` y `FileDescriptor.sync()`.
- Registra la ruta/contador e incrementa `imageTotalCount`.
- En la ruta normal visible cierra `FileOutputStream` y retorna true.
- La salida llega a `:catch_1`, pero no contiene los cuerpos completos de los handlers ni `.end method`.

**Dedupe y límites:** E167 ya conserva la preparación y el inicio del bucle. E168 añade progreso, sincronización, contador y cierre normal. No determina cierre del InputStream, cierre de FileOutputStream en rutas excepcionales, borrado de destino parcial ni retorno tras errores. No inferir cierre universal ni fuga.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 40. Evidencia 169 — BRService.copyFileFromStream: handlers y final del método — 2026-11-25

Se incorporó [evidencia 169](evidence/2026-11-25/169_BRSERVICE_COPYFILEFROMSTREAM_EXCEPTION_HANDLERS_AND_METHOD_END.md), basada en la salida Termux de `BRService.smali:4480–4600`.

**Delta preservado:**
- La ruta normal cierra `FileOutputStream` y retorna `v2` (el retorno true de la ruta normal ya está respaldado por E168).
- `:catch_0` y `:catch_1` convergen en `:goto_4`; se registra `IOException`, se cierra `FileOutputStream` y se retorna `v14`. No se atribuye valor booleano a `v14` sin cotejar su asignación previa.
- `:catchall_0` prepara la referencia de output y llega a `:goto_5`; allí cierra `FileOutputStream` y relanza la excepción.
- El método termina en `.end method`; a continuación comienza `copyFileWithProgress`, un método distinto.
- En el cuerpo revisado no aparece cierre explícito del InputStream. Esto no resuelve si el caller lo administra externamente ni demuestra una fuga.

**Dedupe y límites:** E167 conserva preparación y bucle inicial; E168 conserva progreso, EOF, flush/sync y cierre normal; E169 añade handlers y final del método. No se afirma eliminación de destino parcial ni se asigna semántica a `v14`. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo del Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 41. Evidencia 170 — BRService.copyFileWithProgress: preparación y rama ZIP Flash Drive — 2026-11-25

Se incorporó [evidencia 170](evidence/2026-11-25/170_BRSERVICE_COPYFILEWITHPROGRESS_FLASHDRIVE_ZIP_BRANCH.md), basada en la salida Termux de `BRService.smali:4600–4740`.

**Delta preservado:**
- Si existe el archivo origen, obtiene su longitud e inicializa el contador de bytes.
- Si no es tarea local, emite progreso inicial con origen/destino absolutos; para `p1==3`, la ruta destino notificada es null.
- La rama ZIP se activa bajo la condición conjunta `p1==3`, `mIsFlashDriveTask==true` y `mIsUsbFold==false`.
- Calcula el nombre de ZipEntry a partir de la ruta absoluta destino, recortando el prefijo de `mCurrentBackupRootPath) más un separador; crea ZipEntry y llama `putNextEntry`.
- Abre FileInputStream sobre el archivo origen, crea búfer de 32 KiB y escribe bloques en `mZipOutputStream` mediante `outputStreamWrite`, acumulando bytes.
- La salida termina dentro del bucle, tras consultar `elapsedRealtime()`; no contiene el resto del método.

**Límites:** no afirmar cierre del FileInputStream, cierre de ZipEntry, progreso final, handlers ni retorno. No generalizar la rama a todas las copias USB. Los cuerpos de `putNextEntry` y `outputStreamWrite` no están incluidos. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 42. Evidencia 171 — BRService.copyFileWithProgress: cierre de rama ZIP y progreso de copia directa — 2026-11-25

Se incorporó [evidencia 171](evidence/2026-11-25/171_BRSERVICE_COPYFILEWITHPROGRESS_ZIP_COMPLETION_AND_DIRECT_COPY_PROGRESS.md), basada en la continuación Termux de `BRService.smali:4740–4880`.

**Delta preservado:**
- En la rama ZIP Flash Drive, cuando vence el intervalo de notificación y la tarea no es local, informa etapa/estado 2 con ruta absoluta del origen, destino null, bytes acumulados y longitud total; después actualiza la marca temporal.
- Al salir del bucle ZIP llama `closeEntry(mZipOutputStream)` y cierra silenciosamente el InputStream referenciado por `v12` mediante `IOUtils.closeQuietly`; después salta a `:goto_7`.
- Se identifica la rama separada File → File: abre `FileInputStream` sobre `v11`, `FileOutputStream` sobre `p3` y un búfer de 4 KiB. Lee hasta resultado negativo, escribe cada bloque y acumula bytes.
- La notificación periódica de la copia directa comunica etapa/estado 2, origen absoluto de `p2` y selecciona el destino entre `v20` o la ruta absoluta de `p3` según la comparación `v10 == v15`.

**Dedupe y límites:** E170 ya conserva el comienzo del método y el bucle ZIP; E171 añade la cola de progreso/cierre ZIP y el inicio de la rama File → File. No se generaliza el cierre ZIP a la copia directa. La ventana termina antes de completar la notificación directa y no muestra cierres de sus streams, flush/sync, handlers, retorno ni limpieza de destino parcial. Tampoco muestra el destino de `:goto_7`. No se atribuye semántica a `v10`, `v15` o `v20` más allá de la selección observada.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 43. Evidencia 172 — BRService.copyFileWithProgress: cierre de copia directa y finalización común — 2026-11-25

Se incorporó [evidencia 172](evidence/2026-11-25/172_BRSERVICE_COPYFILEWITHPROGRESS_DIRECT_COPY_CLEANUP_AND_COMMON_COMPLETION.md), basada en la continuación Termux de `BRService.smali:4860–5000`.

**Delta preservado:**
- En la rama File → File, al alcanzar EOF, intenta cerrar primero `FileOutputStream` y después `FileInputStream`. Cada `IOException` de cierre se captura y registra; la ruta continúa hacia `:goto_7`.
- `:goto_7` es el punto de finalización común al que llega también la rama ZIP preservada en E171.
- Si la tarea no es local, el método emite notificación final de etapa/estado 3 con origen absoluto de `p2`, destino seleccionado entre `v20` y la ruta absoluta de `p3` según `v10 == v15`, y ambos argumentos long iguales a la longitud `v16`.
- Si la tarea es local, omite esa notificación. Después retorna `v23`, cuyo valor no se resuelve en esta ventana.

**Dedupe y límites:** E170–E171 conservan preparación, rama ZIP y comienzo de copia directa. E172 añade los cierres directos en EOF y la convergencia/finalización común. Los cierres observados no se extienden a excepciones durante lectura/escritura: falta inspeccionar el destino de `:catchall_0`. No se afirma que los bytes realmente escritos coincidan con `v16`, que el destino sea íntegro, ni se atribuye valor a `v23`. No se demuestra borrado de destino parcial ni flush/sync en esta rama.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 44. Evidencia 173 — BRService.copyFileWithProgress: cleanup excepcional y origen inexistente — 2026-11-25

Se incorporó [evidencia 173](evidence/2026-11-25/173_BRSERVICE_COPYFILEWITHPROGRESS_EXCEPTIONAL_CLEANUP_AND_MISSING_SOURCE.md), basada en la continuación Termux de `BRService.smali:4980–5120`.

**Delta preservado:**
- Los handlers `:catchall_1`, `:catchall_2` y `:catchall_3` convergen en `:goto_a`, conservando la excepción original y las referencias disponibles de los streams.
- El cleanup intenta cerrar condicionalmente el `FileOutputStream` y luego el `FileInputStream`; las `IOException` de cierre se registran mediante `LogUtils.e`.
- Tras el cleanup se relanza la excepción original con `throw v1`.
- Si el archivo origen no existe, registra `src file not exist: ` más la ruta absoluta de `p2`, crea una `IOException` con ese mensaje y la lanza.
- El método termina en `.end method`; a continuación comienza `copyLocalMediaFile(BRItem, boolean)`.

**Dedupe y límites:** E172 conserva la ruta normal y la finalización común; E173 añade cleanup excepcional y origen inexistente. Los cierres excepcionales son intentos condicionados a referencias no nulas; no se garantiza éxito si el cierre lanza IOException. No se observa borrado del destino parcial, rollback ni sync en esta rama. No se asigna valor a `v23` ni se analiza el método siguiente.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.


------------------------------------------------------------------------

## 45. Evidencia 174 — BRService.copyLocalMediaFile: selección de archivos, empaquetado ZIP y manejo de errores — 2026-11-25

Se incorporó [evidencia 174](evidence/2026-11-25/174_BRSERVICE_COPYLOCALMEDIAFILE_ZIP_PACKAGING_AND_EXCEPTION_HANDLING.md), basada en las tres ventanas Termux `BRService.smali:5120–5560`, que cubren el método completo.

**Delta preservado:**
- El método filtra `files_for_backup`, WeChat y QQ; para la lista local recorre `localFileList` desde `sendingIndex` con comprobación de aborto.
- Para `p2 == true`, selecciona la ruta externa WeChat/QQ, obtiene subarchivos con `Utils.getAllSubfiles()` y los incorpora a la lista de empaquetado.
- Si no está abortado, asigna `state=7`, crea el ZIP temporal `backup_<suffix>.zip` mediante `ArchiveHelper.zipFiles()`, abre una entrada del mismo nombre en el ZIP principal y transfiere el ZIP temporal con un búfer de 32 KiB.
- En la ruta normal elimina el ZIP temporal, cierra la entrada ZIP y cierra el InputStream con `IOUtils.closeQuietly()`.
- El handler `:catch_0` captura `Exception`, registra `zip file error` y la absorbe. Para `p2 == false`, el método puede asignar después `state=1` si no está abortado, incluso tras ese error capturado.
- Para `files_for_backup`, finaliza con `progType=0` y `notifyItemTaskEnd()`.
- En la rama `SDK_INT < 23`, `v6` queda nulo y se utiliza posteriormente como `Set` mediante `addAll()` o `size()`, según la existencia/directorio de la ruta. El bytecode indica posible `NullPointerException`; la alcanzabilidad práctica depende del `minSdkVersion` y del entorno.
- Si ocurre una excepción después de abrir el InputStream, el handler salta las operaciones normales visibles de borrado del temporal, `closeEntry()` y cierre silencioso del stream. Se documenta falta de garantía de cleanup excepcional, sin afirmar fuga universal.
- La asignación final de estado está condicionada por `p2 == false`; no se extrapola a `p2 == true`.

**Dedupe y límites:** E173 termina antes de este método y no lo cubre. E174 consolida las tres ventanas completas compartidas, sin duplicar E170–E173. No se demuestra integridad del ZIP principal, rollback de una entrada parcial ni éxito real por la mera asignación `state=1`. No se realizó ejecución dinámica ni cotejo local independiente; no hay hash nuevo del Smali. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Expediente **INCOMPLETO**.

**Siguiente paso:** continuar con el siguiente método localizado, `copyToUsb(String)`, comenzando por la ventana Termux `BRService.smali:5560–5700`. Antes de avanzar, mantener la distinción entre el empaquetado ZIP local aquí documentado y la copia USB del método siguiente.

------------------------------------------------------------------------

## 46. Evidencia 175 — BRService.copyToUsb: disponibilidad USB, normalización de ruta y resultado de copia — 2026-11-25

Se incorporó [evidencia 175](evidence/2026-11-25/175_BRSERVICE_COPYTOUSB_AVAILABILITY_PATH_NORMALIZATION_AND_COPY_RESULT.md), basada en las ventanas Termux `BRService.smali:5520–5590` y `5560–5700`, que permiten reconstruir el método completo.

**Delta preservado:**
- `copyToUsb(String)` comprueba `isUsbAvaliable()`. Si no está disponible, ejecuta `setState(3,12,9)`, `handleTaskFinish(3,12,9,mBRItems)` y retorna sin copiar.
- Si USB está disponible, normaliza la ruta mediante `normalizeAbsoluteSdPath(p1,mCurrentBackupRootPath)`, construye Files para ruta original y normalizada y las compara con `TextUtils.equals()`.
- Si las rutas difieren, llama `copyFile(1, originalFile, normalizedFile)`. Si captura `IOException`, registra `copy to Usb error`, consulta dos veces la longitud del original y notifica `notifyTransFileProgressChange(4,p1,null,length,length)`; absorbe la excepción.
- Si las rutas coinciden, omite `copyFile()`, consulta dos veces la longitud del original y notifica `notifyTransFileProgressChange(3,p1,null,length,length)`.
- El método retorna después de esas ramas; a continuación comienza `createFile(File)`.

**Dedupe y límites:** E174 solo localizaba este método como siguiente objetivo; no documentaba su cuerpo. E175 añade su flujo completo. Los códigos numéricos se preservan como argumentos literales, sin asignarles semántica adicional. La captura de IOException no prueba éxito de copia. No se inspeccionó el interior de `copyFile()`; por tanto, no se concluye sobre rollback, borrado parcial, sync o integridad de destino. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.

**Siguiente paso:** continuar con `createFile(File)`, comenzando por la siguiente ventana física de Termux después de la definición observada, por ejemplo `BRService.smali:5700–5840`. Mantener separados el wrapper USB `copyToUsb` y el método receptor `copyFile`, que requerirá análisis propio si se necesita establecer garantías de copia.

------------------------------------------------------------------------

## 47. Evidencia 176 — BRService.createFile: creación directa y espera de operación asíncrona — 2026-11-25

Se incorporó [evidencia 176](evidence/2026-11-25/176_BRSERVICE_CREATEFILE_DIRECT_AND_ASYNC_LATCH.md), basada en las ventanas Termux `BRService.smali:5650–5740` y `5700–5840`, que recuperan el método completo.

**Delta preservado:**
- Si `mBakFilesType != 5`, llama `Utils.createFile(file,true)`. Si devuelve verdadero, retorna; si devuelve falso, registra `fail to create file` con la ruta absoluta y lanza `IOException`.
- Si `mBakFilesType == 5`, entra en el monitor de `mFileOpLatch`, reinicia el `AtomicBoolean` a falso, crea e inicia `BRService$20(this,file)` y espera mediante `wait()`.
- Tras la espera, si el latch está en verdadero retorna; si está en falso lanza `IOException`. Una `InterruptedException` se registra como `createFile wait error` y el método continúa con la lectura del latch.
- El bloque `catchall` sale del monitor antes de propagar excepciones.
- No se observa timeout explícito en la espera. El productor de la señal y el resultado de la operación asíncrona quedan pendientes de inspeccionar en `BRService$20`.

**Dedupe y límites:** E175 solo localizaba `createFile(File)` como método siguiente y no documentaba su cuerpo. E176 añade el método completo sin duplicar E170–E175. No se infiere el contrato interno de `Utils.createFile`, ni quién cambia el latch a verdadero, ni éxito dinámico. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.

**Siguiente paso:** continuar con `deleteFile(File)`, cuyo comienzo aparece al final de la ventana `5700–5840`; recuperar primero su continuación y final. Después, si se necesita cerrar la ruta asíncrona de creación, analizar por separado `BRService$20`.

------------------------------------------------------------------------

## 48. Evidencia 177 — BRService.deleteFile: eliminación directa y espera de operación asíncrona — 2026-11-25

Se incorporó [evidencia 177](evidence/2026-11-25/177_BRSERVICE_DELETEFILE_DIRECT_AND_ASYNC_LATCH.md), basada en las ventanas Termux `BRService.smali:5730–5860` y `5820–5910`, que recuperan el método completo.

**Delta preservado:**
- Si `mBakFilesType != 5`, llama directamente a `Utils.deleteFile(file)` y continúa a la salida común.
- Si `mBakFilesType == 5`, entra en el monitor de `mFileOpLatch`, reinicia el `AtomicBoolean` a falso, crea e inicia `BRService$19(this,file)` y espera mediante `wait()`.
- Tras la espera, si el latch está en verdadero retorna; si está en falso lanza `IOException`. Una `InterruptedException` se registra como `deleteFile wait error` y el método continúa con la lectura del latch.
- El bloque `catchall` sale del monitor antes de propagar excepciones.
- No se observa timeout explícito. El productor de la señal y el resultado de la operación asíncrona quedan pendientes de inspeccionar en `BRService$19`.

**Dedupe y límites:** E176 documenta `createFile(File)` y solo menciona `BRService$19` como hilo creado por el método de eliminación cuyo cuerpo estaba pendiente. E177 añade el método completo sin duplicar E170–E176. No se infiere el contrato interno de `Utils.deleteFile`, ni quién cambia el latch a verdadero, ni éxito dinámico. Procedencia USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente **INCOMPLETO**.

**Siguiente paso:** continuar con `directSendFileIfNetworkIdle()`, cuyo inicio aparece al final de la ventana `5820–5910`; recuperar su cuerpo completo. Los hilos `BRService$19` y `BRService$20` pueden analizarse después como unidades separadas para determinar la señalización y el resultado real de las operaciones asíncronas.

