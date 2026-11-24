# Evidencia 140 — reconciliación de hashes, metadatos del decode y procedencia de comandos — 2026-11-24

**Procedencia:** salidas Termux pegadas directamente por el usuario en el chat actual; no ejecutadas ni verificadas independientemente por este registro.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; delta documental y de procedencia. No es un nuevo hallazgo de comportamiento.

## 1. Hashes y tamaños: coincidencia con evidencia 111

El usuario compartió stdout de `sha256sum` para:

| Archivo | SHA-256 reportado | Bytes reportados |
|---|---|---:|
| `Backup.apk` | `36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae` | No incluido en este bloque |
| `BRService$5.smali` | `7c0112052117caf5b5fb119fc807f62ea0cf42bf35fe8d7e75c38af8a18bde25` | 128021 |
| `BRService.smali` | `163be19ee3d8a297b0f1fde3f5d95616900bdf8ccd29e379bf9dd600080efbfb` | 522862 |
| `BRService$FakeBackupListenerImp.smali` | `fe74114ebc8315fdf9df1d4ce01e93851cc22ba3b04b326784be8dad050ecfb2` | 56451 |
| `MiAsistService.smali` | `3c0682209d0b43849fc3ca15c094b4128d71ca0741a53c6f1c76f98a18950a69` | 111571 |

La salida de `wc -c` reportó un total de 818905 bytes para los cuatro Smali. Los cuatro hashes y tamaños coinciden exactamente con evidencia 111; el hash de APK coincide con §1.2 del índice maestro. Por deduplicación, no se crean nuevos valores ni se reemplaza evidencia 111. Este bloque sí conserva el stdout íntegro que no figuraba en la evidencia 111.

**Límite:** el stdout es aportado por el usuario; no equivale a recomputación criptográfica independiente en esta sesión.

## 2. Advertencia crítica: variable F y atribución de los greps

El comando compartido definió:

```bash
F="$S/BRService$5.smali"
```

En Bash, dentro de comillas dobles, `$5` se expande como el quinto parámetro posicional. Para referirse literalmente al nombre con `$5`, la forma correcta es:

```bash
F="$S/BRService\$5.smali"
```

El usuario no imprimió el valor efectivo de `F` ni el de `$5`. En una sesión interactiva ordinaria sin quinto parámetro posicional, la primera asignación produce una ruta terminada en `BRService.smali`, no `BRService$5.smali`. Por ello, los resultados inmediatamente posteriores de:

- `grep ... mBakFilesType "$F"`
- `grep ... BRItem;->state:I "$F"`

**no pueden atribuirse con seguridad a BRService$5.smali**. No se usan para validar writers, coordenadas o ramas de esa clase. Si el quinto parámetro posicional tenía otro valor, la ruta efectiva tampoco está documentada. La identidad del archivo consultado queda UNKNOWN para esos dos greps.

Esta advertencia no invalida los hashes de la tabla: `sha256sum` y `wc -c` recibieron rutas literales independientes de `F`.

## 3. Inventario ProgressItemAdapter

El `find` reportó seis archivos:

- `ProgressPageFragmentBase$ProgressItemAdapter$1.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ProgressItem.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ViewHolder-IA.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ProgressItem-IA.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter.smali`
- `ProgressPageFragmentBase$ProgressItemAdapter$ViewHolder.smali`

Esto confirma únicamente que esas rutas fueron reportadas por la salida compartida. No añade análisis funcional nuevo; el análisis del adaptador se conserva en evidencias previas.

## 4. Metadatos del decode

El usuario compartió salida de `find "$D" -maxdepth 2 ... -exec ls -lh`:

| Ruta relativa a decoded | Tamaño mostrado | Fecha mostrada |
|---|---:|---|
| `AndroidManifest.xml` | 19K | Nov 16 00:18 |
| `original/AndroidManifest.xml` | 33K | Nov 16 00:18 |
| `apktool.yml` | 3.8K | Nov 16 00:18 |

La salida acredita presencia y metadatos de listado reportados, no contenido, hash, versión exacta de Apktool ni comando de decodificación.

## 5. Dedupe y estado

- Hashes y tamaños de cuatro Smali: duplicados exactos de evidencia 111.
- Hash de APK: duplicado de §1.2 del índice.
- Mapeo de `mBakFilesType` y writers de `BRItem.state`: no se incorporan desde el grep de procedencia ambigua. Las conclusiones válidas ya preservadas en evidencias 126–139 no se modifican.
- ProgressItemAdapter: inventario adicional, sin nuevo hallazgo funcional.
- Metadatos XML/YML: delta documental nuevo, sin contenido inspeccionado.

**Conclusión:** este registro mejora la trazabilidad y corrige una posible atribución errónea de archivo; no demuestra nuevo comportamiento del APK. Investigación estática únicamente; sin ejecución dinámica, modificación del APK ni verificación local independiente.
