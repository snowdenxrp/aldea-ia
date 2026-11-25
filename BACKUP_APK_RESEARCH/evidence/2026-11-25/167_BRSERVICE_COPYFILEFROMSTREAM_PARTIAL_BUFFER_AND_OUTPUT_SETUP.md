# Evidencia 167 — BRService.copyFileFromStream: preparación de destino y bucle parcial — 2026-11-25

## Fuente y alcance

Salida compartida por el usuario desde Termux:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"
sed -n '4185,4350p' "$D/BRService.smali"
```

La ventana comienza en la definición privada `copyFileFromStream(int, BRItem, InputStream, String, long)Z`, línea física 4185. La salida termina en mitad del bucle de copia; no contiene el resto del método ni `.end method`.

## Observaciones directas

- Los parámetros se mueven a registros locales: `p1` a `v0`, `p3` a `v10` (InputStream) y `p4` a `v11` (ruta destino).
- Registra origen y destino, llama `Utils.newDirChangePath(destino)` y crea un `File` para el destino.
- Si `getParentFile()` devuelve null, retorna false. Si el directorio padre no existe, llama `Utils.makeDirs(parent)`; en esta ventana no se comprueba el valor booleano retornado.
- Si el InputStream es null, registra `inputStream is null` y retorna false.
- Antes de copiar, llama `notifyTransFileProgressChange`. Cuando `p1 == 3`, el argumento de ruta de origen notificada es null; en otro caso usa la ruta absoluta del destino representado por el File local.
- Abre `FileOutputStream(destination)`, crea un búfer de 0x8000 bytes (32 KiB) y entra en un bloque try que lee desde el InputStream y escribe los bytes leídos al FileOutputStream.
- El fragmento muestra acumulación de bytes y consulta de `SystemClock.elapsedRealtime()` para lógica de progreso; la salida se interrumpe durante esa lógica, en la línea física aproximada 4350.

## Límites

No se ha recibido todavía el resto del método. Por tanto, esta evidencia no determina:
- si el InputStream de entrada se cierra;
- si el FileOutputStream se cierra o se hace flush explícito;
- cómo se manejan IOException y otros handlers/catchall;
- qué condiciones producen true/false después de iniciar la copia;
- si existe borrado del destino parcial ante error.

No inferir fuga de recursos ni éxito/integridad de la copia a partir de esta ventana.

## Dedupe

E165 ya conserva el caller ZIP-entry que entrega InputStreams a `copyFileFromStream`; E166 conserva la rama File→File de `localFileList` y la ubicación del receptor. E167 añade únicamente el inicio/cuerpo parcial del método receptor: preparación del destino, guardias, apertura del output y tamaño del búfer.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash nuevo del Smali y sin ejecución dinámica. Expediente INCOMPLETO.
