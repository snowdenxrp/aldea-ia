# Registro 142 — recuperación del chat anterior y auditoría de cobertura Git — 2026-11-24

**Propósito:** preservar la continuidad y el contenido técnico recuperable de la conversación inmediatamente anterior, tras la aclaración del usuario de que “guardar todo en Git” se refería al chat completo y no solo a la evidencia 141.

**Alcance probatorio:** reconstrucción documental a partir de los resultados recuperables del chat y del cotejo con los archivos ya presentes en esta rama. **No es una transcripción íntegra del chat.** No se dispone aquí de todos los mensajes originales, comandos ni stdout completos. No se rellenan huecos con inferencias. Los datos provenientes de resúmenes o respuestas previas se mantienen separados de los extractos Smali compartidos directamente.

**Rama cotejada:** `backup-apk-static-research-2026-11-19`  
**HEAD al iniciar esta auditoría:** `80bddfb0acba418b937e2babdb31ba502432ef91`  
**Índice cotejado:** `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`, versión 1.36.  
**Estado de investigación:** INCOMPLETO; ingeniería inversa estática, sin afirmar ejecución dinámica.

---

## 1. Resultado principal de la reconciliación

El chat anterior no debe considerarse archivado únicamente porque existan las evidencias 140 y 141. La comparación recuperable muestra que sus deltas técnicos conocidos sí están distribuidos en el expediente:

- Evidencia 140: hashes/tamaños, inventario de ProgressItemAdapter, metadatos del decode y advertencia de expansión de `$5` en Bash.
- Evidencia 141: callers de `backupPackages` y `restoreFiles`, y consumo condicional de `v16` en `:goto_3f`.
- Evidencias 124, 133 y 135–139: contexto anterior al chat, incluyendo writers/estados de `BRItem`, ramas Theme/USB, convergencia, cleanup y contador `v13`.
- Evidencia 60: escrituras del campo `mBakFilesType` desde `backupPackages(p4)` y `restoreFiles(p3)`.
- Índice maestro v1.36: cronología, estado de cobertura, límites y referencias de las evidencias anteriores.

Este registro reúne esas relaciones y anota explícitamente qué información de la conversación no puede reconstruirse de forma íntegra. No vuelve a registrar como hallazgos nuevos los datos que ya están en las evidencias fuente.

## 2. Identidad del proyecto y propósito reiterados en el chat

La conversación corresponde a la investigación estática de `MIUI Backup.apk` para reconstruir cómo funciona el backup/restore de Xiaomi en el POCO X7 Pro. No se estaba creando una copia del teléfono ni ejecutando una restauración. El trabajo pertenece al expediente `BACKUP_APK_RESEARCH` y no debe mezclarse con el cierre de Nexo NCS M0.

El objetivo documental es reconstruir, a partir de Smali, creación/organización/restauración de copias, permisos, restricciones Android, tratamiento ZIP y capacidades observables. Cualquier uso futuro en Nexo queda separado del análisis actual.

## 3. Identidad de archivos y hashes recuperados

Los valores completos recuperables del chat son los siguientes. Coinciden con los datos ya preservados en evidencia 111 y reconciliados en evidencia 140; por tanto, se referencian y no se vuelven a presentar como hashes nuevos:

| Archivo | SHA-256 reportado | Bytes reportados |
|---|---|---:|
| `Backup.apk` | `36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae` | 16,866,352 (dato histórico del índice; no incluido en el stdout de hashes de este bloque) |
| `BRService$5.smali` | `7c0112052117caf5b5fb119fc807f62ea0cf42bf35fe8d7e75c38af8a18bde25` | 128,021 |
| `BRService.smali` | `163be19ee3d8a297b0f1fde3f5d95616900bdf8ccd29e379bf9dd600080efbfb` | 522,862 |
| `BRService$FakeBackupListenerImp.smali` | `fe74114ebc8315fdf9df1d4ce01e93851cc22ba3b04b326784be8dad050ecfb2` | 56,451 |
| `MiAsistService.smali` | `3c0682209d0b43849fc3ca15c094b4128d71ca0741a53c6f1c76f98a18950a69` | 111,571 |

La suma reportada de los cuatro archivos Smali es 818,905 bytes. El usuario compartió la ruta real de `BRService$5.smali`:

`/data/data/com.termux/files/home/backup-static/decoded/smali/com/miui/backup/service/BRService$5.smali`

Los hashes y tamaños son salidas compartidas por el usuario. Su repetición no equivale a un recálculo independiente efectuado por este registro.

## 4. Metadatos de extracción y recursos localizados

La salida de listado recuperada informó:

| Ruta relativa a `decoded` | Tamaño mostrado | Fecha mostrada |
|---|---:|---|
| `AndroidManifest.xml` | 19K | Nov 16 00:18 |
| `original/AndroidManifest.xml` | 33K | Nov 16 00:18 |
| `apktool.yml` | 3.8K | Nov 16 00:18 |

El inventario de archivos informó estas clases del adaptador:

- `ProgressPageFragmentBase$ProgressItemAdapter$1.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ProgressItem.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ViewHolder-IA.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ProgressItem-IA.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ViewHolder.smali`

Esto acredita únicamente las rutas/metadatos mostrados en la salida compartida. No acredita contenido del manifiesto, versión exacta de Apktool ni comando íntegro de decodificación. El análisis funcional del adaptador ya estaba en evidencias anteriores y no se duplica aquí.

## 5. Mapeo de mBakFilesType: estado de lo recuperado

El expediente conserva el mapping corroborado por el análisis previo:

- `1` → `mIsLocalBackupTask`
- `3` → `mIsTransingTask`
- `5` → `mIsFlashDriveTask`
- `2` → ruta especial asociada a `:cond_1`/registro `v8`; el valor literal de `v8` no está confirmado en la evidencia primaria actualmente enlazada.

En una respuesta anterior del asistente dentro del chat se afirmó `v8=1`. Como el fragmento Smali primario que demostraría ese literal no está preservado en el material recuperable de esta auditoría, se mantiene **PRIOR-ASSISTANT-OUTPUT / UNVERIFIED**. No elevar `v8=1` a CONFIRMADO ni usarlo como premisa para análisis posterior hasta recuperar y cotejar la ventana Smali correspondiente.

Los eventos estadísticos de tipos 1/3/5 ya forman parte del contexto de la evidencia 138 (líneas físicas 4124–4145, según la referencia recuperada); no se registran de nuevo como delta de este chat.

## 6. BRItem.state y estado global del servicio

El expediente anterior ya conserva un inventario de 13 sitios de escritura de `BRItem.state` en `BRService$5`, así como la escritura `state=6` en coordenada física 2351 / `.line 1735`, condicionada a que el estado previo no sea 6 y situada después de `waitingForFilesTransingEnd()` (evidencia 124).

La cifra de 13 es un inventario de la clase según el análisis previo; no prueba que todos los escritores estén completamente explicados ni que el inventario cubra otras clases. Mantener separados:
- escrituras de `BRItem.state/error`;
- llamadas `setState(...)` del estado global del servicio;
- valores `mBakFilesType`;
- códigos de notificación/resultado 8 y 9.

En particular, `setState(4,8,0)` no demuestra por sí solo una escritura `BRItem.state=8`.

## 7. Deltas de callers y control de flujo

Los siguientes resultados se conservan en evidencia 141 y se resumen aquí solo como mapa de cobertura:

1. Caller de `backupPackages` desde descriptor: el tramo visible fija el cuarto argumento entero `p4=3`; no se recuperó el encabezado completo del método caller.
2. Caller de `backupPackages` desde Intent: el valor leído con `getIntExtra` se mueve a `v4`/argumento `p4`; el default procede de `v13`, cuyo valor concreto no está resuelto.
3. Caller de `restoreFiles`: el entero del Intent usa default `1` y se pasa como `p3`; la ruta alternativa conserva ese mismo argumento.
4. En `BRService$5 :goto_3f`, `setState(4,8,0)` y el sleep de 500 ms solo se ejecutan si `mIsTransingTask==true`, `mIsAborted==false` y `v16==0`. Los valores `v16=8/9` documentados en las ramas Theme/USB no satisfacen la última condición.
5. El fragmento consumidor no lee `v4`; no atribuir a `v4=10` la omisión de esa rama.
6. El cleanup posterior ya está enlazado a evidencia 136; no duplicar sus efectos.

## 8. Corrección de procedencia del comando Bash

La conversación detectó que la asignación:

```bash
F="$S/BRService$5.smali"
```

expande `$5` como parámetro posicional en Bash. Sin imprimir el valor efectivo de `F`, los greps posteriores no prueban que el archivo consultado fuera `BRService$5.smali`. La forma literal correcta es:

```bash
F="$S/BRService\$5.smali"
```

La advertencia completa y sus efectos sobre los greps se conservan en evidencia 140. No usar aquellas salidas ambiguas para ampliar el inventario de writers/lecturas de `BRService$5`.

## 9. Pendientes que sobreviven al chat

1. Recuperar el encabezado y contexto completo del caller #1 de `backupPackages`.
2. Resolver el default `v13` del caller #2 de `backupPackages`.
3. Recuperar la ventana Smali que determine el literal de `v8` y la cadena causal del tipo 2; `v8=1` sigue sin verificación primaria.
4. Completar el flujo de `v13`: redefiniciones, usos, guardias y convergencias antes de asignarle semántica global.
5. No inferir exclusividad/globalidad de los 13 escritores de `BRItem.state` sin ampliar el inventario de clases y call paths.
6. No convertir metadatos de listado en contenido inspeccionado ni hashes reportados en verificación independiente.

## 10. Auditoría de cobertura y limitación de recuperación

**Ya preservado en Git antes de este registro:**
- evidencia 140: hashes/tamaños, inventario ProgressItemAdapter, metadatos XML/YML y corrección de procedencia del grep;
- evidencia 141: callers, origen de argumentos, consumo de `v16`, deduplicación y pendientes;
- evidencias 60, 124, 132–139: contexto técnico anterior al chat y referencias cruzadas;
- índice maestro v1.36: cronología y estado global.

**No recuperado íntegramente:** la transcripción literal de todos los mensajes del chat anterior, todos los comandos Termux en su orden exacto, stdout completo de cada comando y todos los fragmentos Smali originales pegados. Este registro no afirma haber reconstruido esos elementos. Si se recuperan mensajes o bloques adicionales, deben cotejarse contra este registro y las evidencias citadas; guardar únicamente deltas nuevos y verificables.

**Conclusión:** se preserva la totalidad del contenido técnico recuperable en el contexto disponible, con procedencia y límites explícitos. No se presenta como transcripción completa ni como nueva confirmación de comportamiento. La investigación sigue INCOMPLETA y estática.
