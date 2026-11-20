# Evidencia 52 — Gate de comandos MiAsist y mapa de estados del dispositivo

- Fecha: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: Smali y referencias compartidas por el usuario el 16-11-2026; recuperación de conversaciones anteriores.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para referencias concretas y constantes reportadas; no se conserva aquí el método completo.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.

## 1. Gate de entrada y parámetros de comando

Anclas históricas:
- MiAsistService.onStartCommand(): línea reportada 3691; llama isActionParamsValid().
- isActionParamsValid() inspecciona mimover_action y client_port.
- Acciones reportadas: mi_backup y mi_restore.
- Rango aceptado de client_port: 57447–57449.
- MiAsistService.startAsClientOrServer(): referencia alrededor de línea 2685.
- MiAsistService.bindBRService(): 675–708.
- MiAsistService.bindTransFileService(): 709–738.

**Límite:** el cuerpo completo de isActionParamsValid() y startAsClientOrServer() no está reproducido en esta evidencia. No inferir handshake, socket, peer identity, autenticación ni uso exacto de mDevicePort a partir del nombre del método o del rango de puertos.

## 2. Secuencia de autorización, conexión y servicio BR

Referencias directas recuperadas de MiAsistService.smali:
- STAGE_USER_AUTHORIZING: línea 2622.
- startActivity(): línea 2680.
- STAGE_REMOTE_CONNECTING: línea 2689.
- Lectura/uso de mDevicePort: línea 2706.
- STAGE_BRSERVICE_BR_START: alrededor de 2801.
- bindBRService(): alrededor de 2865.
- STAGE_BRITEMS_LOADING: alrededor de 2894.
- STAGE_BRSERVICE_TRANS_BINDING: dentro del rango 2801–2932.
- STAGE_TRANS_SERVICE_BINDED se reporta en el callback $4.
- MiAsistService$1 se crea alrededor de 2645–2649 después de STAGE_USER_AUTHORIZING; su flujo reportado contiene transiciones de estado, carga de iconos/BRItems y startRestoreCommand().
- El flujo reportado incluye startActivity() antes de STAGE_REMOTE_CONNECTING; el propósito y el componente exacto del Intent requieren el bloque completo.

Esta secuencia representa el orden de instrucciones/rangos recuperado, no prueba que todas las ramas se ejecuten en cada comando ni que startActivity() sea una pantalla de consentimiento específica sin inspeccionar el Intent.

## 3. Device state/error: constantes adicionales

El método setState(DeviceStage,DeviceError) fue localizado alrededor de MiAsistService.smali:2185.

Constantes/ubicaciones recuperadas:
| Código | Referencia histórica | Contexto reportado |
|---|---:|---|
| ERR_PARSE_SELECT_DESCRIPTOR | 1857 | fallo al parsear descriptor de selección |
| ERR_PARSE_SELECT_BRITEMS | 2024 | fallo al parsear BRItems |
| ERR_WRITE_DESCRIPTOR | 2171 | fallo de escritura del descriptor |
| ERR_NOT_OWNER_SPACE | 2528 | comprobación/estado de owner space |
| ERR_BRSERVICE_BUSY | 2556 | BRService ocupado |
| ERR_CONNECTED_FAILED | 2782 | conexión remota fallida |
| ERR_SEND_FAILED | MiAsistService$5:507 | envío fallido |
| ERR_RECEIVE_FAILED | MiAsistService$5:737 | recepción fallida |

No mezclar DeviceError de MiAsistService con:
- BRService.mLastError;
- BRItem.error;
- códigos pasados a IBRListener.onError/onCustomProgressChange;
- valores de mWorkingStage;
- códigos locales de preparación de BRService$5.

La existencia de ERR_NOT_OWNER_SPACE no contradice que isOwnerSpace() se reportara true en el método inspeccionado: puede haber otros checks, ramas o rutas; sin cuerpo completo no se resuelve la relación.

## 4. Estado de conexión y buffers recibidos

Campos reportados en MiAsistService:
- mConnectionState
- mDeviceStage
- mDeviceError
- mDevicePort
- mReceivedItemFiles
- mTransService
- mTransListener
- mServiceSyncer
- mSizePredictSyncer
- mIsLoadAppIconsDone
- mIsPredictSizeDone

MiAsistService$5:
- actualiza mediante setState();
- trabaja con mConnectionState, mDeviceStage y mDeviceError;
- registra/actualiza mReceivedItemFiles;
- contiene transiciones de conexión y errores ya inventariados en evidencia 51.

MiAsistService$6:
- usa mBackupDescriptor, mAllBRItems, mAppIconsLoadSyncer, mDeviceStage y mDeviceError;
- se relaciona con la escritura/envío del descriptor y doSendFile(String).

MiAsistService$8:
- carga loadAppBRItems()/loadFileBRItems();
- calcula tamaños;
- actualiza rutas mediante updateBakFilePath();
- utiliza ITransFileService.
Los detalles de $8 están desarrollados en evidencia 49.

No se conserva en esta recuperación el tipo genérico/estructura interna de mReceivedItemFiles ni el criterio con que se sincroniza con BRItems.

## 5. Finalización

Se reportó stopSelf() al terminar el flujo de MiAsistService. No se recuperó en este delta el bloque exacto de cleanup, ni si todas las ramas llaman stopSelf(), desregistran listeners o hacen unbind.

## 6. Límites probatorios y pendientes

1. Recuperar cuerpo completo de onStartCommand() alrededor de 3691 y el de isActionParamsValid().
2. Recuperar startAsClientOrServer() alrededor de 2685, incluyendo creación/uso de sockets, mDevicePort y validación de peer.
3. Identificar Intent exacto de startActivity() en 2680 y su relación con STAGE_USER_AUTHORIZING.
4. Recuperar setState(DeviceStage,DeviceError) alrededor de 2185 y mapear cada DeviceError a la UI/logs.
5. Seguir ERR_NOT_OWNER_SPACE y ERR_BRSERVICE_BUSY hasta sus condiciones y callers.
6. Recuperar el flujo de mReceivedItemFiles y la relación con mAllBRItems/descriptor.
7. No inferir que el puerto aceptado prueba un servidor abierto, autenticación o acceso externo.
8. Solo lectura estática.

**Conclusión:** se amplía el mapa de control MiAsist con las etapas de autorización/conexión/BRService/TransFileService, parámetros de entrada, campos de estado y errores de parsing/escritura/ocupación. No se ha reconstruido el transporte de red ni el gate completo. Estado: INCOMPLETE.
