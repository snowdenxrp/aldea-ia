# Evidencia 106 — BRService.onStartCommand: cierre de CMD_RESTORE y retorno — 2026-11-22

**Clasificación:** `LOCAL-VERIFIED` por salida `nl -ba` aportada por el usuario el 2026-11-22, archivo local `BRService.smali`, físicas 19480–19611.
**Método:** `onStartCommand(Intent;II)I`.
**Continuidad:** amplía evidencia 105; no vuelve a analizar ni sustituye sus bloques ya cotejados.

## Fragmento local verificado

### Rama de lista vacía (físicas 19487–19519)

- Si `v3 == 3`, la condición en física 19490 salta a `:cond_6`/`:goto_2`.
- Si `v3 != 3`, lee `mIsReStartCommand` (19493–19495). Si es verdadero, también salta a `:goto_2`.
- Si ambas condiciones son falsas, registra literalmente `restoreFiles brItems is null` (19500–19503), lee `mState` (19506), carga `v4=0xC` y `v5=0x6` (19508–19510), y llama `setState(mState, 0xC, 0x6)` (19512). Después salta a `:goto_3`.
- La rama `:goto_2` llama a `restoreFiles(v5, v6, v3)` (19517–19519). En este bloque `v5` es el registro que ya contiene el valor de la lista de BRItems; no inferir aquí su contenido a partir del nombre del registro.
- La rama de lista no vacía previamente cotejada en evidencia 105 llama a `restoreFiles(v0, v6, v3)` en física 19483.

### Continuación y salida del método (físicas 19540–19611)

- Después del log de restauración (19540–19543), las rutas convergen en `:goto_5`; la rama `:cond_8` registra `onStartCommand, intent is null` (19551–19559).
- En `:goto_5`, llama a `isIdleState()` (19563–19565). Si devuelve verdadero, registra literalmente `probably system killed and then restarts us. try to retransfer.` (19569–19572) y llama a `backupPackagesByRetransfering(v1)` (19575).
- A continuación vuelve a llamar a `isIdleState()` (19579–19581). Si sigue devolviendo verdadero, llama a `stopSelf()` (19583–19591) y registra `stop self because of idle state.`.
- Finalmente compara `mBakFilesType` con `3` y, si coincide, compara también `mState` con `3` (19595–19603). Si ambas comparaciones coinciden, devuelve el registro `v1` (19605); en cualquier otro caso devuelve el literal `2` (19607–19610).

## Delta frente a evidencia 105

1. Coteja localmente las condiciones exactas de la rama vacía y los tres argumentos de `setState(mState, 0xC, 0x6)`.
2. Coteja la continuación posterior al despacho: comprobación doble de `isIdleState()`, posible llamada a `backupPackagesByRetransfering(v1)`, posible `stopSelf()` y las condiciones del retorno final.
3. Cierra el rango local compartido de `onStartCommand` hasta `.end method` en física 19611.

## Límites

- Los valores `0xC` y `0x6` se registran como argumentos literales; no se les asigna significado semántico sin cotejar el receptor `setState(III)`.
- No se interpreta el valor de `v1` ni el significado contractual de los retornos `v1` y `2`; solo se documentan las instrucciones y condiciones observadas.
- La cadena del log menciona un posible reinicio del sistema, pero el texto del log no demuestra que el sistema haya matado el proceso en esta ejecución.
- La llamada a `backupPackagesByRetransfering(v1)` no demuestra que la retransmisión se haya ejecutado con éxito.
- No se demuestra ejecución dinámica, restauración efectiva, accesibilidad externa, autorización ni vulnerabilidad.
- No se modificó el APK ni se ejecutaron pruebas runtime.

**Estado:** continuación de `CMD_RESTORE` en `onStartCommand`, físicas 19480–19611, `LOCAL-VERIFIED` según salida local compartida por el usuario.
