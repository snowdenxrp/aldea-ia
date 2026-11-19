# Auditoría de recuperación — MIUI Backup.apk

**Fecha:** 2026-11-19  
**Estado:** AUDITORÍA INICIAL AMPLIADA; NO ES TRANSCRIPCIÓN ÍNTEGRA  
**Modo:** solo lectura durante la auditoría; rama documental separada creada para preservar la recuperación.

## 1. Resultado ejecutivo

- La investigación estática específica de Backup.apk comenzó en los chats recuperados el 16-11-2026. No se encontró evidencia de que sus bloques Smali, comandos o resultados se hubieran guardado en GitHub antes de esta recuperación.
- Se recuperó un SHA-256 que faltaba en el expediente v0.1: 36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae, asociado en el chat a /product/priv-app/Backup/Backup.apk, 16,866,352 bytes, copia $HOME/Backup.apk reportada IDENTICAL. Es evidencia conversacional, no recalculada ahora.
- Se encontró un expediente anterior de GitHub sobre Termux/Mi Mover/MIUI BackupManager en el repositorio privado snowdenxrp/-nexo-drb09-external-register. Es antecedente técnico relacionado, no un archivo de la ingeniería inversa directa de Backup.apk.
- La búsqueda de aldea-ia incluyó los 129 refs de rama y sus árboles recursivos de punta. No apareció ninguna ruta Backup.apk, BRService, MiAsistService ni una carpeta dedicada a esta investigación. Las únicas rutas con la palabra BACKUP fueron dos documentos de escrow de Nexo, ajenos a MIUI.
- Se detectó una contradicción de alto impacto en los resúmenes sobre mBakFilesType; queda expresamente abierta y no debe propagarse como un mapeo cerrado.

## 2. Identidad y entorno del APK — fuente conversacional

En un chat del 16-11-2026 el usuario informó:

| Campo | Valor recuperado | Clasificación |
|---|---|---|
| Paquete | com.miui.backup | CONFIRMADO EN CHAT |
| Ruta de origen | /product/priv-app/Backup/Backup.apk | CONFIRMADO EN CHAT |
| Tamaño | 16,866,352 bytes | CONFIRMADO EN CHAT |
| Copia Termux | $HOME/Backup.apk | CONFIRMADO EN CHAT |
| Resultado de comparación | IDENTICAL | CONFIRMADO EN CHAT |
| SHA-256 | 36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae | CONFIRMADO EN CHAT; NO RECALCULADO |

El usuario también informó que com.miui.huanji y com.miui.backup compartían UID 6100 en el dispositivo; el comando compartido fue:
pm list packages -U | grep 'uid:6100'
Esto es un dato de salida de dispositivo compartido en conversación, no una verificación actual.

Primer entorno de análisis: Termux; herramientas aapt, aapt2, apkanalyzer, jadx y apktool inicialmente no estaban disponibles; se informó que solo estaba disponible unzip. Se extrajeron AndroidManifest.xml, classes.dex, classes2.dex y classes3.dex. Los intentos iniciales de inspección no produjeron interpretación útil. Más tarde, la extracción decodificada quedó en $HOME/backup-static/decoded y se utilizó Apktool 3.0.3.

## 3. Recuperación de conversaciones — mapa por fecha

### 16-11-2026 — adquisición, MiAsistService, Binder

Recuperado de chats y resúmenes:

- MiAsistService contiene mBRService:IBRService, mBRServiceConnection y mBRServiceListener.
- bindBRService() construye un Intent explícito hacia BRService, añade extra_is_from_miasist=true, llama startService() y bindService().
- Llamadas a BRService.startRestoreCommand(...) en líneas 2939–2944 y startBackupCommand(...) en 2862–2865.
- MiAsistService en proceso :remote; manifiesto reportado con MiAsistService y BRService exported=false.
- IBRService$Stub contiene 14 transacciones: getBakFilesType=1, getState=2, getWorkingStage=3, getLastErrCode=4, getBRItems=5, abortBackupAndRestore=6, registerBRListener=7, unregisterBRListener=8, getTransinRemainingTime=9, getTransingUsedTime=10, getTransingTotalSize=11, forceClose=12, pause=13, getZipPath=14.
- La alcanzabilidad externa, la autoridad efectiva y la cadena completa desde Huanji quedaron UNKNOWN; exported=false y una declaración de permisos no demuestran por sí solas una ruta externa.

### 17-11-2026 — restauración y BRService$5

- restoreFiles() en BRService.smali alrededor de línea 12672; guarda mBRItems/descriptor, notifica y llama startRestore().
- startRestore() crea BRService$5 como hilo RestoreThread.
- BRService$5.smali: 4,261 líneas / 128,021 bytes reportados.
- restoreFiles líneas 1351–1367; startRestore líneas 1375–1380 / 2061; BRService$5.run() desde aprox. 1379.
- Se revisaron WakeLock, BMS, StorageMonitor, remoteConnectedLatch, preparación, contraseña cifrada y finalización. Los bloques originales completos deben recuperarse desde el checkout local para convertir los resúmenes en evidencia primaria.

### 18-11-2026 — escrituras de estados y errores

- ProgressItemAdapter: itemStart asigna state=2; abortos state=3,error=9; errores state=3,error=p3; finalización puede asignar state=1.
- BRService$FakeBackupListenerImp: escrituras directas conservadas en líneas 5719→2, 5834→3, 5921→1. Búsquedas negativas de state 7/8 en alcance limitado; no equivalen a ausencia en todo el APK.
- BRService$5: referencias a state=v14 (1151), state=4 (1259, salvo files_for_backup), state=v10 (1283, 1336, 1441), state=6 (2351), y rutas state=3,error=9. v10 y v14 se deben resolver desde el bloque original.
- Mapeo local de errores del listener conservado: p3=0→0; 3→2; 4→5; 5→6; 6→7; 8→6; 9→11; otro→1. No confundir con los códigos globales 8/9 de notificación.

### 19-11-2026 — conexión, preparación, setState, notificación

- Bloque directo reportado de BRService$5.run, líneas 1391–1418: mapeo de tipos que entra en conflicto con el resumen anterior (véase §5).
- setState(III) líneas 14061–14070 delega a setState(IIII) como (p1,p2,mUserInterruptAction,p3).
- setState(IIII): p1→mState; p2→mWorkingStage; p3→mUserInterruptAction; p4→mLastError si el anterior era 0; p2==7 libera WakeLock.
- Si p2==10 o 12, o p3==2, se recorren mBRItems y se asigna BRItem.state=3, BRItem.error=9.
- getErrStringRes(II) recibe estado global y código de error; 8→err_router_disconnected / “Check your router's connection and try again.”; 9→flash_drive_connection_failed / “USB drive disconnected”.
- La causalidad completa que produce globalmente 8/9 todavía no está cerrada.

## 4. GitHub: auditoría de snowdenxrp/aldea-ia

Metadatos observados: repo público, rama predeterminada main; HEAD leído durante esta auditoría: 8686bdb49729007cfa7376538b893a0eacae6c50. El repositorio tenía 129 refs de rama.

### 4.1 Árboles de ramas

Se consultaron los árboles recursivos de las 129 puntas de rama. No apareció ningún path que identificara la investigación de MIUI Backup.apk, BRService o MiAsistService. Los únicos dos paths con “BACKUP” fueron:

- docs/nexo/AB104.450_BACKUP_ESCROW_DISASTER_THRESHOLD_RECOVERY_2026-09-26.md
- docs/nexo/AB104.450_THRESHOLD_BACKUP_ESCROW_DISASTER_RECOVERY_2026-09-26.md

Ambos tratan de escrow/recuperación de Nexo, no de Xiaomi/MIUI. La búsqueda de nombres de ramas con backup, apk y miui no devolvió ramas.

### 4.2 Búsquedas de código, commits, issues y PRs

- Búsqueda de código en main para Backup.apk, BRService y MiAsistService: sin resultados. La búsqueda de código cubre la rama predeterminada; por sí sola no basta para descartar ramas, por eso se inspeccionaron también las puntas de las 129 ramas.
- Búsqueda de commits por Backup.apk, MIUI, BRService y MiAsistService: sin resultados.
- Búsqueda de commits por backup: dos resultados en aldea-ia, ambos documentos Nexo AB104.450 sobre backup escrow.
- Búsqueda de commits por restore: 26 resultados; se inspeccionaron los 26 cambios de archivo. Todos correspondían a Nexo/Lúmina, simulación, workflows o investigación de restauración de Nexo; ninguno a MIUI Backup.apk.
- Búsqueda de issues y PRs por Backup.apk: sin resultados.

### 4.3 Otros repositorios del propietario

La cuenta tenía cuatro repositorios visibles en el inventario: snowdenxrp/aldea-ia, snowdenxrp/manual-supervivencia-nuclear, snowdenxrp/nexo-grand-mission-01 y snowdenxrp/-nexo-drb09-external-register.

- manual-supervivencia-nuclear: el único commit localizado por “backup” trataba de energía y seguridad eléctrica, no de APK.
- nexo-grand-mission-01: no surgió evidencia de Backup.apk en las búsquedas de código/commits realizadas.
- -nexo-drb09-external-register (privado): conserva contexto técnico antecedente sobre Termux, Xiaomi local backup, Mi Mover y MIUI BackupManager, pero no se encontró en las búsquedas disponibles una ruta o commit que contenga el análisis Smali de Backup.apk.

**Límite:** se recuperó el archivo conocido G08_NON_OPERATIONAL_EVIDENCE_PLAN.md y los commits asociados; no se afirma que se haya inspeccionado el árbol recursivo completo de los tres repositorios privados.

## 5. Hallazgo adversarial: contradicción mBakFilesType

Hay dos mapeos incompatibles en el material recuperado:

- Bloque directo que el usuario pegó el 19-11-2026, BRService$5.run líneas 1391–1418: 2 → mIsTransingTask, 3 → mIsFlashDriveTask, 1 → mIsLocalBackupTask.
- Resumen anterior del expediente: 2/3 → mIsTransingTask, 5 → mIsFlashDriveTask, 1 → mIsLocalBackupTask.

No se debe “resolver” esta contradicción por intuición. Releer el bloque completo en:
$HOME/backup-static/decoded/smali/com/miui/backup/service/BRService$5.smali
y seguir todas las comparaciones/usos de mBakFilesType. Hasta entonces:
mBakFilesType mapping = UNKNOWN / RECONCILIATION REQUIRED.

## 6. Fuente antecedente en el repositorio privado D-RB-09

Archivo: G08_NON_OPERATIONAL_EVIDENCE_PLAN.md en snowdenxrp/-nexo-drb09-external-register. Su estado es plan documental/no operacional; no es autorización para ejecutar operaciones. Contiene:

- Termux v0.119.0-beta.3, versionCode 1022, targetSdk 28, allowBackup=false según revisión de fuente/build; no demuestra identidad byte-a-byte del APK instalado.
- Distinción entre Android cloud backup, device-to-device, ADB backup y mecanismos Xiaomi.
- Evidencia pública de integración de framework Xiaomi con com.miui.huanji, broadcasts START_RESTORE/END_RESTORE, servicio MiuiBackup y Android backup agents, procedente de mirror de framework, no de la build exacta del POCO X7 Pro.
- Configuración de permisos de com.miui.huanji en un dump de POCO peridot, no rodin; no transferir esos grants al dispositivo del usuario.
- Lead de configuración etiquetado rodin en un árbol público inconsistente; su procedencia no permite tratarlo como dump stock coherente.
- Conclusión explícita: acceso de Mi Mover al HOME privado de Termux y transferencia real de ese HOME permanecen UNKNOWN / NOT TESTED.

### 6.1 Commits del antecedente (todos modifican el mismo archivo)

| Fecha UTC | Commit | Mensaje |
|---|---|---|
| 2026-11-14 03:35:14 | f4c7eef4eb190d3ab9f281cb197e923fb7c706a6 | Add source-level Termux backup findings without closing A-03 |
| 2026-11-14 03:35:20 | ac5c96712025ff9220c41ab04faa30403b3e508e | Qualify G-08 conclusion with Termux backup source evidence |
| 2026-11-15 05:01:27 | 998e19275b5addb0089a2975d046059f450ff142 | Correct G-08 Android D2D scope for Termux target API 28 |
| 2026-11-15 05:02:01 | 3fcb78f80030203513266da9bfb751ab76a926f8 | Record Mi Mover as a separate unverified G-08 restore path |
| 2026-11-15 05:02:08 | 7d6b91db7ce8bd98a9c2df65613ba9ee8bc8bf3b | Refresh G-08 checkpoint after Mi Mover clarification |
| 2026-11-15 05:06:29 | 7b4e32d434e2997676ecdf3fd6e25256a0f6208c | Add POCO X7 Pro and HyperOS 3 backup evidence limits |
| 2026-11-15 05:08:37 | 078393dcc87c66f3cbe9066a9f7f14ec3ce4a1b9 | Document AOSP compatibility override path and Xiaomi evidence gap |
| 2026-11-15 05:12:03 | 55e4469e2eeb7ed988c0241ff3e517a0ac0338ef | Qualify Xiaomi local-backup third-party app limitation |
| 2026-11-15 05:18:37 | 6777b1514b088737d41b979361114fe6a6d92cbc | Document Xiaomi local-backup restore and encryption limits |
| 2026-11-15 06:13:06 | ef82191eb27af93883d45efe53c0c4acced979f7 | Document Android backup paths and Keystore continuity limits for G-08 |
| 2026-11-15 14:57:30 | e77ed9195e9b7ce02709262a458dc0594b290690 | Clarify Mi Mover private-app-data evidence boundary for G-08 |
| 2026-11-15 14:59:20 | 05cb16f1ebd1d5d9c74d6407d327c009f389efbb | Refine Mi Mover privacy and POCO firmware evidence boundary |
| 2026-11-15 14:59:27 | 529367bb94d765701dcefd36a4c66b7753b86c90 | Integrate Mi Mover privacy and firmware caveats into G-08 conclusion |
| 2026-11-15 15:02:11 | b4184d9cd16a10b21bb3a52b201bc2bb4710b255 | Document Xiaomi Mi Mover BackupManager integration evidence and device-scope limits |
| 2026-11-15 15:02:25 | abdffaaa9b57a34e0fb04d522d5b0fed6afafdc8 | Refine Xiaomi package-scoped backup service evidence |
| 2026-11-15 15:07:09 | 53dff288cd85e4e663a959612bbe000c49b51e01 | Document rodin Mi Mover backup configuration lead with provenance caveats |
| 2026-11-15 15:07:32 | 656703ad722e012f0b25816363afdb4d87866c57 | Cross-check rodin backup-domain SELinux rules and limit private-data inference |

Estos commits son del propietario snowdenxrp y documentan contexto G-08; no son commits de la investigación Smali iniciada el 16-11.

## 7. Expediente existente en ChatGPT Library

La búsqueda de Library encontró 00_MASTER_INDEX.md, 24,580 bytes, 549 líneas, versión 0.1, con cronología del 16 al 19 de noviembre, estado de recuperación y pendientes. Se encontró más de una entrada con el mismo nombre; la identidad exacta/duplicación debe reconciliarse antes de limpiar o reemplazar cualquiera. El archivo v0.1 se conserva sin sobrescribir; esta auditoría crea la versión 0.2 en GitHub.

## 8. Lo que NO se ha recuperado íntegramente

- Transcripciones completas de todas las conversaciones de la investigación.
- Todos los bloques Smali originales pegados, con contexto anterior/posterior.
- Todos los comandos Termux y sus salidas exactas.
- Hashes de los archivos Smali y hash recalculado del APK.
- Versión exacta del APK y comando exacto de decodificación.
- Causalidad completa de los códigos globales 8/9 hasta persistencia/notificación.
- Cierre de la contradicción de mBakFilesType.

La memoria conversacional y los resúmenes recuperados son pistas para localizar evidencia, no sustitutos de los bloques originales.

## 9. Próximas prioridades de recuperación

1. Cotejar el mapeo de mBakFilesType contra el Smali local, sin ejecutar servicios.
2. Recuperar bloques originales de setState(IIII), handleTaskFinish(), showFinishNotification(), getErrStringRes(II), y las ramas de v16=8/9.
3. Recuperar los bloques de BRService$5 en líneas 1391–1503, 1522–1542, 1986–2037 y el método de cierre, junto con comandos y salidas exactas.
4. Completar los eventos de finalización para tipos de tarea 1/2/3/5, sin asumir que el mapeo de tipos está cerrado.
5. Registrar búsquedas negativas con clase, patrón, comando y alcance exactos.
6. Incorporar un archivo de evidencia por sesión con fragmentos originales inmutables.

## 10. Límites de seguridad

Trabajo estático y de solo lectura. No ejecutar backup/restore, no iniciar servicios, no probar escritura sobre otras apps, no modificar APK, no descargar ni flashear firmware, no ejecutar tests dinámicos ni operaciones de dispositivo sin autorización separada y explícita. No inferir permisos efectivos desde declaraciones ni accesibilidad externa desde exported solamente.
