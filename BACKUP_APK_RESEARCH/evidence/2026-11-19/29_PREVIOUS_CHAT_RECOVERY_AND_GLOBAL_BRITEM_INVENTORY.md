# Evidencia 29 — Addendum de recuperación del chat anterior e inventario global BRItem.state/error

**Fecha:** 2026-11-19  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Base documental:** expediente maestro v0.12, evidencias 15 y 25–28, y contexto recuperado del chat inmediatamente anterior.  
**Procedencia:** RECOVERED-CHAT / USER-FACT. Este addendum registra solo los datos recuperados del historial conversacional y de documentos existentes. No reconstruye literalmente salidas que no están disponibles.  
**Estado:** recuperación parcial y explícitamente delimitada; no LOCAL-VERIFIED.

## 1. Propósito y límite de la verificación

El usuario pidió verificar el chat inmediatamente anterior para no perder hallazgos y preservar la continuidad en GitHub.

La recuperación disponible confirma parte de la secuencia del 19-11-2026, pero **no expone el transcript íntegro ni todas las salidas literales**. En particular, la búsqueda histórica devolvió resúmenes de hechos y referencias, no los mensajes Smali completos. Por tanto:

- No afirmar que se verificó mensaje por mensaje todo el chat.
- No reconstruir instrucciones Smali, registros, labels o resultados de grep que no estén presentes.
- Mantener los hallazgos recuperados como RECOVERED-CHAT o CONSERVADO hasta cotejarlos con los archivos locales.
- No convertir hashes abreviados en hashes completos.

## 2. Entorno y artefactos reportados en el chat

El usuario confirmó en Termux que estaban disponibles:

- `Backup.apk`
- árbol decodificado `$HOME/backup-static/decoded`
- directorios Smali `smali`, `smali_classes2` y `smali_classes3`
- archivos:
  - `BRService$5.smali`
  - `BRService.smali`
  - `BRService$FakeBackupListenerImp.smali`
  - `MiAsistService.smali`

Datos recuperados del chat:

| Archivo | Tamaño reportado | SHA-256 recuperado |
|---|---:|---|
| `BRService$5.smali` | 128,021 bytes | `7c011205…8bde25` |
| `BRService.smali` | 522,862 bytes | `163be19e…efbfb` |
| `BRService$FakeBackupListenerImp.smali` | 56,451 bytes | `fe74114e…ecfb2` |
| `MiAsistService.smali` | 111,571 bytes | `3c068220…50a69` |

Los SHA anteriores están abreviados en el contexto recuperado. No completar ni usar como identificadores criptográficos. Recalcularlos localmente antes de usarlos para fijar una base probatoria.

El SHA-256 completo reportado previamente para el APK es:
`36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae`.
Ese dato ya está documentado en el índice maestro y no se recalculó en esta recuperación.

También se recuperó que el checkout NCS estaba limpio; no es parte de esta investigación ni debe modificarse.

## 3. Inventario global de BRItem.state / BRItem.error

La secuencia recuperada del chat:

1. El usuario ejecutó un inventario `grep` de instrucciones `iput` para los campos `BRItem.state` y `BRItem.error` sobre `$HOME/backup-static/decoded/smali*`.
2. Una primera búsqueda devolvió cero coincidencias. Esa salida se refería al alcance/ruta de esa primera invocación y **no** demuestra ausencia global de escrituras.
3. El usuario comprobó que existían los tres árboles `smali`, `smali_classes2`, `smali_classes3` y compartió referencias de lecturas/escrituras completas o parciales de ambos campos.
4. El primer envío quedó explícitamente incompleto (“Falta más”).
5. El usuario envió el resto y terminó con el marcador `===== 3. FIN =====`.

El contexto recuperado identifica referencias en estas clases/archivos:

- `ArchiveHelper`
- `CompatibilityActivity$1`
- `ProgressPageFragmentBase`
- `ProgressPageFragmentBase$ProgressItemAdapter*`
- `BRItem`
- `BRService`
- `BRService$5`
- `BRService$6`
- `BRService$7`
- `BRService$11`
- `BRService$FakeBackupListenerImp`
- `MiAsistService`

Se recuperó específicamente que `MiAsistService.smali` contiene escrituras `iput` en las líneas físicas 3175–3178 y 3296–3299 (campos de estado/error según el inventario compartido). El contexto disponible no conserva la salida literal completa para atribuir con seguridad cada registro, valor y campo de esas ocho líneas; no inferirlos.

**Límite:** el inventario fue compartido por partes y su salida quedó resumida en la recuperación histórica. No está disponible aquí una transcripción íntegra de cada coincidencia, por lo que este addendum no pretende reemplazar el inventario literal ni ser un recuento exhaustivo de writers.

## 4. Hallazgo recuperado de BRService$5 — tipo de tarea y state 6

Del chat se recuperó:

- En el bloque de clasificación de `mBakFilesType`, se reportó:
  - tipo 2 → `v8=1`;
  - tipo 3 → `mIsTransingTask`;
  - tipo 5 → `mIsFlashDriveTask`;
  - tipo 1 → `mIsLocalBackupTask`.
- Se reportó una escritura de `BRItem.state=6` en la línea física 2351 de `BRService$5.smali`, asociada al debug directive `.line 1735`.
- `ProgressItemAdapter` se localizó bajo clases anidadas de `ProgressPageFragmentBase$ProgressItemAdapter*`.

Este material ya está sujeto a las correcciones de jerarquía probatoria de la evidencia 23. El mapeo `mBakFilesType` conserva conflictos históricos y sigue UNKNOWN hasta cotejar el bloque local exacto. No resolver el conflicto con este addendum.

## 5. Relación con la cadena restoreLocalMediaFile → ArchiveHelper → adapter

Los siguientes documentos existentes preservan los hallazgos detallados, sin necesidad de repetirlos ni reemplazarlos:

- Evidencia 25: caller `restoreLocalMediaFile()`, estados posteriores y helper.
- Evidencia 26: reconciliación de `state=1/error=1` y normalización global por `setState`.
- Evidencia 27: identidad de `BRItem` dentro de `ArchiveHelper.unzipFiles()` y callback de progreso.
- Evidencia 28: identidad dentro de `ProgressItemAdapter`, conteo de éxito, 100 % y lectura pendiente de `error` en `updateSingleItemUI()`.
- Evidencia 15: semántica recuperada de callbacks, state 6 y contadores del adapter.

No duplicar esas conclusiones aquí. Las condiciones pendientes siguen siendo:
1. caller de `initData([BRItem])` y origen del arreglo;
2. cuerpo completo de `updateSingleItemUI()`;
3. exposición de `BRItem[]` y continuidad desde `mBRItems`;
4. reconciliación de todo writer relevante de `state/error` a partir de la salida literal del inventario global.

## 6. Integridad y límites operativos

- No se recuperó el transcript completo del chat.
- No se recuperó aquí la salida literal íntegra de los inventarios `grep`.
- Los hashes de Smali disponibles en el contexto son abreviados; no usarlos como SHA-256 completos.
- No se leyó el checkout local ni se recalcularon hashes.
- No se ejecutó Backup/Restore, no se inició ningún servicio y no se realizaron pruebas dinámicas.
- No se modificó ni se subió el APK propietario.
- No se modificó NCS ni `main`.

**Estado:** RECUPERACIÓN DOCUMENTAL PARCIAL. Este addendum sirve para no perder las pistas recuperadas y para delimitar exactamente lo que falta; no certifica una verificación exhaustiva del chat anterior.
