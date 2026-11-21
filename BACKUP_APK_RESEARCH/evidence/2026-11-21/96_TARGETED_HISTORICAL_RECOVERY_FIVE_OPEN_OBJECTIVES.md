# Recuperación histórica dirigida: cinco objetivos pendientes — 2026-11-21

**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Base documental revisada:** `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`, sección 95; HEAD conocido al iniciar esta actualización: `d326ad461d753c05ac7d5680fd4b48c74e705c21`.  
**Método:** recuperación dirigida de contexto histórico de conversaciones anteriores usando los títulos de chats de la captura como pistas; cotejo contra el índice maestro vigente. No se ejecutó el dispositivo ni se realizaron extracciones locales.

## Resultado por objetivo

| Objetivo | Resultado de la recuperación disponible | Estado |
|---|---|---|
| `RetransferUtils.restoreTransfering()` | No se recuperó el cuerpo completo. Se conserva únicamente la llamada reportada en `RetransferUtils.smali:154` a `BRService.restoreTransfering(Context, BackupDescriptor)`. | `UNKNOWN / NOT RECOVERABLE FROM AVAILABLE CONTEXT` |
| `BRService.restoreTransfering(Context, BackupDescriptor)` | No se recuperó el cuerpo completo. Las ramas `brState==3` → `CMD_BACKUP` + `extra_is_retransfering=true` y `brState==4` → overload de cinco argumentos ya están en evidencias 57 y 94. | `PARTIAL / ALREADY PRESERVED` |
| Continuación de `BRService.onStartCommand()` tras `extra_zip_file_path` | No se recuperaron instrucciones posteriores. El fragmento histórico sigue truncado al comenzar esa lectura. La descripción previa de extras, descriptor, `restoreFiles()` y caso de lista null ya está en evidencia 56 / sección 51. | `UNKNOWN / NOT RECOVERABLE FROM AVAILABLE CONTEXT` |
| `TransFileService` / `ITransFileService` Binder | No se recuperaron declaración de interfaz, Stub/Proxy, transaction IDs, `onTransact`, parcel marshalling ni cuerpos de transferencia. Se mantienen únicamente las anclas previas: manifest/proceso, `bindTransFileService` grep 709–738 y recepción de `ITransFileService` por `MiAsistService$4`; véanse evidencias 43/51 y 59. | `PARTIAL / BODY AND TRANSACTIONS UNKNOWN` |
| `CompatibilityActivity$1` / `ProgressPageFragmentBase` | No apareció bloque literal adicional. Permanecen los greps reportados de `iput p1` a `BRItem.state/error` en CompatibilityActivity$1 y el writer reportado en ProgressPageFragmentBase, con ambigüedad de coordenadas físicas frente a `.line`. Evidencias 70, 77, 81 y 84 ya contienen el contexto disponible. | `UNKNOWN / NO NEW SOURCE BLOCK` |

## Deduplicación Binder

La recuperación histórica devolvió detalles de `IBRService` que no constituyen hallazgos nuevos:

- `IBRService.getBRItems()`: transacción Binder 5; Stub usa `Parcel.writeTypedArray(...,1)`; Proxy ejecuta `transact(5,...,0)`, `readException()` y `createTypedArray(BRItem.CREATOR)`. Ya preservado en evidencia 45.
- `IBRService$Stub.asInterface(IBinder)`: null → null; consulta `queryLocalInterface("com.miui.backup.service.IBRService")`; devuelve interfaz local compatible o crea `IBRService$Stub$Proxy`. Ya preservado en evidencia 62.
- El manifest/proceso y la inferencia sobre ruta Proxy también están cubiertos por evidencias 45, 62 y 63; no se duplican.

Estos detalles pertenecen a `IBRService`, no prueban la estructura Binder de `TransFileService` ni autorizan extrapolar sus transaction IDs.

## Procedencia y límites

- Esta actualización registra el resultado de una recuperación de contexto histórico, no una nueva extracción del APK.
- No se recuperó texto Smali literal nuevo para los cinco objetivos.
- Los resúmenes de conversaciones anteriores no se elevan a `USER-PASTED-SOURCE` ni a `LOCAL-VERIFIED`.
- Las coordenadas grep no se reinterpretan como bloques fuente; las directivas `.line` no se confunden con líneas físicas.
- No se afirma que el historial completo haya sido inspeccionado: la recuperación disponible es parcial y no equivale a transcript íntegro.
- No se realizaron cambios al APK, al dispositivo, ni pruebas dinámicas.

## Continuidad sin repetición

No repetir como tareas de recuperación ya ejecutadas en esta ronda:

1. Buscar los cuerpos completos de ambos `restoreTransfering()` en los resúmenes históricos disponibles.
2. Buscar la continuación de `CMD_RESTORE` después de `extra_zip_file_path` en los resúmenes históricos disponibles.
3. Buscar la interfaz/Stub/Proxy de `TransFileService` en los resúmenes históricos disponibles.
4. Buscar bloques literales de CompatibilityActivity$1 y ProgressPageFragmentBase en los resúmenes históricos disponibles.
5. Volver a registrar los detalles de `IBRService.getBRItems()` y `Stub.asInterface()`, ya preservados en evidencias 45 y 62.

**Siguiente fuente necesaria para cerrar los pendientes:** bloques fuente originales recuperables de los chats o cotejo futuro contra los archivos Smali locales. Hasta entonces, mantener los estados abiertos y no reconstruir código por inferencia.


## Addendum — contexto histórico adicional de IBRService y gate MiAsist (2026-11-21)

Una segunda búsqueda histórica focalizada recuperó referencias USER-FACT del 2026-11-16 17:03–17:04 UTC. No recuperó el bloque Smali literal.

### IBRService.Stub.onTransact

El usuario había descrito que `IBRService.Stub.onTransact(int, Parcel, Parcel, int)`:
- usa el descriptor `com.miui.backup.service.IBRService`;
- aplica `enforceInterface`;
- maneja IDs de transacción 1–14;
- lee listeners mediante `Parcel.readStrongBinder()`;
- transporta valores de retorno de tipos int, long, String y typed array.

Esto complementa el catálogo de 14 transacciones ya mencionado en evidencia 37 y el transporte de `getBRItems()`/transacción 5 ya preservado en evidencia 45. No se recuperó aquí la tabla completa método↔ID ni los bloques por transacción; no inferirla.

### Gate de MiAsistService

El usuario describió que `MiAsistService.onStartCommand()` valida, en ese orden, `isActionParamsValid()`, `isOwnerSpace()` e `isBRServiceAvailable()`, antes de llamar a `bindTransFileService()`. También describió que `startRestoreCommand()` delega a `BRService.startRestoreCommand(Context, ArrayList, BackupDescriptor, String, int)`.

El índice ya conservaba las anclas de `isActionParamsValid()`, `bindTransFileService()`, `isOwnerSpace()` y la delegación a BRService en evidencias 37, 51, 52 y 59; el delta aquí es la secuencia explícita del gate y la mención de `isBRServiceAvailable()`. No se recuperó el cuerpo de esos validadores ni el bloque continuo de `onStartCommand()`.

**Clasificación:** `USER-FACT / RECOVERED-CHAT`; no `USER-PASTED-SOURCE` ni `LOCAL-VERIFIED`. Este addendum pertenece a `IBRService` y al gate de `MiAsistService`; no aporta interfaz, Stub/Proxy ni transaction IDs de `TransFileService/ITransFileService`.
