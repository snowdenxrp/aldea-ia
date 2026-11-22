# Evidencia 107 — BRService.setState: receptor y propagación a BRItem — 2026-11-22

**Clasificación:** `LOCAL-VERIFIED` por salidas `nl -ba` compartidas por el usuario el 2026-11-22, archivo local `BRService.smali`, físicas 14061–14204.
**Métodos:** `setState(III)V` y `setState(IIII)V`.
**Continuidad:** resuelve el receptor de la llamada registrada en evidencia 106: `setState(mState, 0xC, 0x6)`. No repite el análisis de `onStartCommand`.

## 1. Sobrecarga de tres argumentos (físicas 14061–14070)

`setState(III)V` lee el campo actual `mUserInterruptAction` y delega a la sobrecarga de cuatro argumentos:

```smali
iget v0, p0, BRService->mUserInterruptAction:I
invoke-direct {p0, p1, p2, v0, p3}, BRService->setState(IIII)V
```

Por tanto, la llamada de evidencia 106:

```smali
setState(mState, 0xC, 0x6)
```

se traduce en los argumentos efectivos:

- `p1 = mState`
- `p2 = 12` (literal `0xC`)
- `p3 = mUserInterruptAction` leído en ese momento
- `p4 = 6` (literal `0x6`)

**Distinción:** `0xC` no se pasa como código de error. Se recibe en el segundo argumento, que la implementación asigna a `mWorkingStage`. El valor `0x6` llega como cuarto argumento y puede inicializar `mLastError`.

## 2. Actualización de estado y error (físicas 14072–14125)

- Si `p2 == 7`, se llama primero a `releaseWakeLock()` (14075–14080).
- La implementación compara `p1` con `mState`, `p2` con `mWorkingStage` y `p3` con `mUserInterruptAction` (14084–14094).
- Si los tres valores ya coinciden, salta al retorno sin ejecutar la actualización ni las notificaciones posteriores.
- Si alguno difiere, actualiza `mState=p1` bajo `synchronized(mSyncer)`; después escribe `mWorkingStage=p2` y `mUserInterruptAction=p3` (14098–14115).
- Lee `mLastError`; solo cuando el valor anterior es cero escribe `p4` en `mLastError` (14118–14124).

En consecuencia, para la llamada de evidencia 106, `0x6` es un valor candidato a inicializar `mLastError`, pero no sobrescribe un valor previo distinto de cero. El Smali observado no identifica aquí el significado semántico del código 6.

## 3. Propagación a todos los BRItem (físicas 14126–14180)

La rama de propagación se habilita cuando se cumple al menos una de estas condiciones:

- `p2 == 10`, o
- `p2 == 12`, o
- `p3 == 2`.

Esta evaluación ocurre dentro de la rama de actualización descrita en §2; por tanto, el método ya tuvo que detectar un cambio en `mState`, `mWorkingStage` o `mUserInterruptAction`.

Además, `mBRItems` debe ser no nulo y no estar vacío. Entonces itera la lista completa y, para cada objeto `BRItem`, escribe:

```smali
const/4 v0, 0x3
iput v0, p4, BRItem->state:I

const/16 v0, 0x9
iput v0, p4, BRItem->error:I
```

Resultado literal observado:

- Cada elemento de `mBRItems` recibe `state = 3`.
- Cada elemento de `mBRItems` recibe `error = 9`.

No es una actualización limitada al elemento activo: el iterador recorre todos los elementos de la lista.

Para la llamada de evidencia 106, `p2=12`, por lo que satisface la condición de etapa 12. La propagación efectiva también depende de que haya ocurrido un cambio detectado por la comparación previa y de que `mBRItems` sea no nulo/no vacío.

## 4. Notificación y preferencia de trabajo (físicas 14182–14190)

Después de la rama de propagación, dentro de la misma rama general de actualización:

- llama a `notifyServiceStateChange()` (14184);
- lee `mBakFilesType` (14187);
- llama a `setWorkingPreference(Context, III)` con `p1`, `p2` y `mBakFilesType` (14189).

La llamada a `setWorkingPreference` no recibe `p4` ni `mLastError` como argumento.

## 5. Distinción de campos y códigos

| Destino | Valor observado | Regla |
|---|---:|---|
| `mWorkingStage` | 12 (`0xC`) | se asigna desde `p2` cuando hay cambio |
| `mLastError` | 6 (`0x6`) | se asigna desde `p4` solo si el valor anterior es cero |
| `BRItem.state` | 3 | se asigna a cada elemento si se activa la propagación |
| `BRItem.error` | 9 | se asigna a cada elemento si se activa la propagación |

Los valores 6 y 9 pertenecen a campos distintos y no deben confundirse. Esta evidencia no asigna nombres o significados semánticos a esos códigos.

## 6. Límites

- Evidencia estática del cuerpo Smali compartido; no demuestra que esta ruta se haya ejecutado dinámicamente.
- No se infiere el significado de `mWorkingStage=12`, `mLastError=6`, `BRItem.state=3` ni `BRItem.error=9` más allá de sus destinos y condiciones de escritura observados.
- No demuestra que la lista contenga elementos en la ruta concreta de `onStartCommand`; la propagación está condicionada a la comprobación de nulidad/vacío.
- No demuestra éxito o fallo de una restauración, ni una vulnerabilidad.
- No se modificó el APK ni se ejecutaron pruebas runtime.

**Estado:** receptor de `setState(mState, 0xC, 0x6)` cotejado localmente en físicas 14061–14204. Delta nuevo frente a evidencia 106; no repetir el análisis de `onStartCommand`.
