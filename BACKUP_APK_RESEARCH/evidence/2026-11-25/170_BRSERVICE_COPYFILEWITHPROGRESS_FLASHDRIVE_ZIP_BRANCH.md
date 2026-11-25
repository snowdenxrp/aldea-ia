# Evidencia 170 — BRService.copyFileWithProgress: preparación y rama ZIP de Flash Drive — 2026-11-25

## Fuente y alcance

Salida compartida por el usuario desde Termux:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"
sed -n '4600,4740p' "$D/BRService.smali"
```

La ventana corresponde al método `copyFileWithProgress(int, File, File)Z`, cuyo encabezado aparece al final de E169. La salida recibida se interrumpe dentro del bucle de copia; no contiene el final del método.

## Observaciones directas

- Si el archivo origen `p2` existe, obtiene su longitud en `v16`; inicializa contador `v18=0`.
- Lee `mIsLocalBackupTask`. Si es false, emite una notificación inicial mediante `notifyTransFileProgressChange`: etapa/estado 1, ruta absoluta del origen y ruta absoluta del destino, excepto cuando `p1==3`, caso en que la ruta destino notificada se pasa como null. El total comunicado es la longitud del archivo y el progreso inicial es cero.
- Define `v15=3` como valor usado después para comparar `p1`.
- Si `p1==3`, `mIsFlashDriveTask==true` y `mIsUsbFold==false`, entra en la rama ZIP:
  - obtiene la ruta absoluta del archivo destino;
  - calcula un substring comenzando en `mCurrentBackupRootPath.length()+1`;
  - crea un `ZipEntry` con ese nombre relativo;
  - obtiene `mZipOutputStream` y llama al método privado `putNextEntry(ZipOutputStream,ZipEntry)`;
  - abre un `FileInputStream` sobre el archivo origen `p2`;
  - crea un búfer de `0x8000` (32 KiB);
  - lee repetidamente el FileInputStream; mientras el resultado sea positivo, llama `outputStreamWrite(mZipOutputStream,buffer,0,count)` y suma el número leído al contador `v18`;
  - después de cada escritura consulta `SystemClock.elapsedRealtime()`; el fragmento termina antes de mostrar la continuación de esa lógica.

## Límites

- No se ha recibido el resto del bucle ni el cierre de `FileInputStream`, el cierre de la entrada ZIP, las notificaciones posteriores, los handlers ni el retorno.
- No concluir que el stream se cierra o queda abierto; falta la continuación del método.
- La condición `p1==3 && mIsFlashDriveTask && !mIsUsbFold` es específica de esta rama. No generalizarla a todas las copias ni a todos los destinos USB.
- El cálculo del nombre relativo presupone que la ruta destino permite ese substring; esta ventana no muestra validación adicional ni permite inferir el comportamiento ante rutas incompatibles.
- No se conoce aún el cuerpo de `putNextEntry` ni `outputStreamWrite`; no atribuirles semántica adicional.

## Dedupe

E169 solo identifica el inicio de `copyFileWithProgress`; E170 conserva el primer bloque sustantivo de este método. No mezcla este método File→File con `copyFileFromStream` de E167–E169.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente INCOMPLETO.
