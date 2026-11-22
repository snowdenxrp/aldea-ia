# Evidencia 108 — BRService: primera escritura de mLastError mediante abortBackupAndRestore — 2026-11-22

**Procedencia:** transcripción y resultados resumidos por el usuario desde el chat anterior, compartidos el 2026-11-22.
**Clasificación:** `RECOVERED-CHAT / USER-PASTED-SUMMARY`; no `LOCAL-VERIFIED` en esta conversación.
**Archivo referido:** `BRService.smali`.
**Continuidad:** complementa la evidencia 107 sobre la escritura condicional de `mLastError`; no repite el análisis del receptor `setState(IIII)`.

## Hallazgos recuperados

- El constructor de `BRService` inicializa `mLastError=0`.
- `abortBackupAndRestore(I)V` recibe el error en `p1`. Si `mLastError` todavía vale cero, conserva `p1` en el campo; si ya es distinto de cero, no lo sobrescribe.
- En la ruta descrita, el método actualiza los elementos con `BRItem.state=3` y `BRItem.error=9`, y establece `mUserInterruptAction=2`.
- La sobrecarga sin argumentos llama a `abortBackupAndRestore(3)`.
- Los sitios de llamada compartidos para revisión fueron las ventanas físicas 1590–1630, 8035–8080 y 13730–13775. La transcripción identifica los valores 3, 7 y 7 para las rutas descritas; las dos últimas se relacionan con una rama de transferencia y una espera de conexión.
- La asignación de `mLastError` en `abortBackupAndRestore(I)V` es una escritura de primera ocurrencia: el argumento solo se conserva si el campo aún es cero.

## Relación con evidencia 106–107

La llamada de `onStartCommand` registrada en evidencia 106, `setState(mState, 0xC, 0x6)`, entrega el valor 6 como argumento candidato para `mLastError`, conforme al receptor documentado en evidencia 107. La ruta `abortBackupAndRestore(I)V` también puede establecer `mLastError` antes, siempre que el campo siga en cero.

Por tanto, no se puede afirmar que el 6 termine almacenado sin conocer el estado previo del campo y el orden real de las rutas. Las llamadas recuperadas con argumentos 3 y 7 no demuestran por sí mismas que el 6 pase por `abortBackupAndRestore(I)V`.

## Límites y trabajo pendiente

- No se aportó aquí el stdout literal de las ventanas Smali ni la firma/condiciones completas del constructor y del método; las coordenadas y conclusiones se conservan como resumen histórico.
- El origen de `p1` en cada llamada no queda identificado más allá de los valores reportados.
- No se asigna significado semántico a los códigos 3, 6, 7 o 9.
- No se demuestra ejecución dinámica ni que el valor 6 llegue a persistirse.
- No volver a extraer estas mismas ventanas salvo que una discrepancia concreta requiera cotejo local.

**Estado:** delta histórico conservado; pendiente de cotejo literal solo si resulta necesario para resolver una contradicción o una pregunta nueva.
