# Evidencia 26 — Reconciliación de state=1/error=1 en la ruta normal — 2026-11-19

**Estado:** ANÁLISIS DOCUMENTAL / HIPÓTESIS CONDICIONAL; sin nueva extracción local.
**Base:** evidencias 07, 12, 15 y 25 de esta rama, todas clasificadas como DIRECT-CHAT o RECOVERED-HISTORICAL según su procedencia. No se eleva ningún resumen histórico a LOCAL-VERIFIED.
**Alcance:** precisar la interacción entre el caller local, ArchiveHelper, setState(IIII), callbacks y conteo del adapter. Sin ejecución de Backup/Restore ni modificación del APK.

## 1. Resultado nuevo: matiz exacto de la ruta normal

La evidencia 12 conserva el significado de los cuatro argumentos de `setState(IIII)`:

1. `p1` → `mState`.
2. `p2` → `mWorkingStage`.
3. `p3` → `mUserInterruptAction`.
4. `p4` → `mLastError`, solo si el valor previo es cero.

La normalización masiva de elementos ocurre si `p2==10`, `p2==12` **o** `p3==2`. En ese caso, para los elementos de `mBRItems`, escribe `BRItem.state=3` y `BRItem.error=9`.

La evidencia 07/12 conserva que el cierre ordinario usa stage 11, mientras que el cierre abortado usa 10 y el cierre por error global usa 12. Por tanto:

- Stage 11, por sí solo, no activa la normalización masiva.
- No es correcto decir que stage 11 la excluye absolutamente: la condición independiente `p3==2` también la activa.
- En la llamada final de la ruta normal descrita en el bloque conservado, los argumentos reportados corresponden a `setState(4,11,0,0)`; si ese bloque y el orden de argumentos se mantienen, tampoco se cumple `p3==2`.
- La confirmación definitiva requiere volver a cotejar el bloque completo de cierre y la instancia de `mBRItems` en la extracción local.

## 2. Callback: por qué no se puede presumir reparación del par

La evidencia 15 conserva que `workingItemFinished()` puede convertir `state=2` en `state=1` y que fuerza `state=1` cuando `error==0`. También conserva que, en la rama descrita, un error no nulo preserva el estado existente.

Consecuencia estrictamente condicional: si el caller ya escribió `state=1`, el mismo objeto pasa por esa rama de callback con `error=1`, y no existe otra escritura intermedia, el callback no demuestra que vaya a convertirlo a `state=3`; el resumen disponible apunta a que puede conservar el estado 1.

No está probado que este callback concreto se ejecute para el objeto de `restoreLocalMediaFile()`, ni que ocurra después de la escritura del caller. Por ello, no se afirma que el par sobreviva en todos los caminos.

## 3. Cadena condicional completa

La hipótesis que merece verificación queda expresada sin saltos:

1. `ArchiveHelper.unzipFiles()` recibe un `BRItem` y asigna `error=1` cuando no aparece el destino final (evidencia 25; síntesis recuperada).
2. El caller `restoreLocalMediaFile()` vuelve de la invocación y asigna `state=1` cuando `mIsAborted` es falso (evidencia 25; bloque compartido en chat).
3. No hay limpieza de `error` ni comprobación `error==0` entre ambos puntos (no demostrado exhaustivamente; debe cotejarse el bloque íntegro y sus excepciones).
4. La finalización global ordinaria usa stage 11 y, según la llamada final recuperada, acción 0; por tanto, no activa la normalización masiva de stage 10/12 ni la condición alternativa de acción 2.
5. Si se ejecuta el callback descrito en evidencia 15 con el mismo objeto y `error!=0`, el material recuperado no demuestra una reparación del estado 1.
6. Si ese mismo objeto (o una copia que preserve ambos campos) llega al adapter, `state=1` entra en el conteo de éxito; `error=1` no aparece como condición excluyente en la regla de conteo recuperada.

**Resultado:** existe una ruta técnicamente plausible para que un elemento con `state=1,error=1` sea contado como éxito. Sigue siendo **HIPÓTESIS FUERTE / RIESGO DE INCONSISTENCIA**, no bug demostrado.

## 4. Qué no se debe fusionar

- `ArchiveHelper.error=1`: destino final no encontrado, según el resumen recuperado.
- `BRService$5.error=1`: productor alternativo cuando `bakFile` existe y `v5==null` (evidencias 02/25).
- `BRItem.state=1`: estado del elemento que el adapter cuenta como éxito.
- `BRItem.error=1`: campo independiente; no se borra por el mero hecho de escribir state 1.
- `mLastError=8/9`: error global; no es el mismo campo que `BRItem.error`.
- `setState` stage 10/12 o acción 2: normalización masiva sobre `mBRItems`, no prueba de que cualquier objeto BRItem sea alcanzado.

La existencia de un destino no acredita por sí sola integridad del contenido; tampoco se ha demostrado que el helper carezca de validaciones adicionales.

## 5. Pruebas documentales mínimas para cerrar o descartar la hipótesis

| Prioridad | Dato necesario | Qué resuelve |
|---|---|---|
| P0 | Firma y cuerpo completo de `ArchiveHelper.unzipFiles()` (overload de 7 argumentos) | Identidad del parámetro BRItem, todas las escrituras de error, salidas y excepciones |
| P0 | Bloque íntegro de `restoreLocalMediaFile()` alrededor del invoke y retorno | Mismo objeto, orden exacto, limpieza/consulta de error y ramas posteriores |
| P0 | Origen de la instancia: construcción/selección de BRItem y pertenencia a `mBRItems` | Si la normalización global puede alcanzarla |
| P1 | Callback real asociado a esta ruta y su orden | Si `workingItemFinished()` interviene y qué estado conserva |
| P1 | Recorrido hasta adapter, incluyendo copias/parcelación | Si los dos campos llegan juntos al conteo |
| P2 | Validaciones completas del helper | Diferencia entre existencia, extracción correcta e integridad |

No es necesario repetir el inventario global de escritores ni volver a solicitar la continuación de `restoreLocalMediaFile()`: el usuario indicó que su extracción de ese método terminó.

## 6. Estado y límites

- **CONFIRMADO EN CHAT:** semántica de argumentos/condición OR de `setState(IIII)` (evidencia 12); reglas resumidas del adapter/callback (evidencia 15); flujo local/helper recuperado (evidencia 25).
- **HIPÓTESIS FUERTE:** coexistencia `state=1,error=1` y posible conteo de éxito.
- **UNKNOWN:** identidad exacta de la instancia entre helper, caller, `mBRItems` y adapter; escrituras intermedias no contenidas en los bloques; validación íntegra de archivos.
- **NO REALIZADO:** lectura local nueva, ejecución runtime, backup/restore, modificación del APK.

La conclusión debe permanecer abierta hasta que la cadena de identidad y orden de escrituras quede probada o refutada.
