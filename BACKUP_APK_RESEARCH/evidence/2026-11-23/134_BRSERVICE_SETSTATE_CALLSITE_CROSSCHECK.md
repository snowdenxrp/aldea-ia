# Evidencia 134 — BRService: referencias a setState(III) y cruces de llamadas — 2026-11-23

**Fuente:** salida pegada por el usuario en este chat de `grep -n -A100 -B15 -- 'setState(III)V' "$D/com/miui/backup/service/BRService.smali"`.
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`.
**Alcance:** inventario de call sites visibles en la salida; no implica ejecución dinámica.

## 1. Dedupe del cuerpo de setState

La salida vuelve a mostrar el adaptador `setState(III)V` en físicas 14061–14070 y el inicio de `setState(IIII)V` en 14072 en adelante. Este cuerpo ya está documentado en evidencia 107 (físicas 14061–14204), incluyendo la asignación de parámetros, la regla de `mLastError` y la propagación condicionada a BRItem. No se crea un segundo análisis del cuerpo ni se amplían sus efectos más allá de la ventana actual.

## 2. Call sites y contexto literal visibles

| Física | Contexto visible | Invocación observada | Límite |
|---:|---|---|---|
| 3334 | Inicialización del flujo de backup; antes se asigna `mBakFilesType=p4` y después se inicializa `mIsFromMiAsist` | `setState(3,1,0)` | Estado/etapa/tercer argumento globales; no inferir etiquetas semánticas. El encabezado del método no está en esta salida. |
| 5562 | Rama `isUsbAvaliable()==false`; después recupera `mBRItems`, llama `handleTaskFinish(3,12,9,mBRItems)` y retorna | `setState(3,12,9)` | La misma invocación ya figuraba en el índice como recuperación histórica; esta salida aporta corroboración directa pegada en el chat y contexto contiguo. No equivale a `BRItem.error=9` por sí sola. |
| 12706 | Entrada de `restoreFiles`; antes registra `restoreFiles start.`, después guarda `mBakFilesType=p3`, reinicia/actualiza datos de la operación y prepara `mBRItems` bajo condiciones posteriores | `setState(4,1,0)` | Confirma llamada al estado global en la entrada de restore; no demuestra que la restauración se ejecute o finalice. |
| 18922 | Rama de cierre/limpieza; después libera WakeLock y registra `quit HandlerThread`, y sigue con cierre de threads/reconnector y publicación de estado | `setState(0,11,0)` | Confirma llamada en la ruta visible de limpieza; no inferir por el literal 11 un significado funcional no demostrado. |
| 19512 | Rama `restoreFiles brItems is null` de `onStartCommand`; lee `mState`, carga literales 12 y 6 y después salta a `:goto_3` | `setState(mState,12,6)` | Esta llamada y su receptor ya están cubiertos por evidencias 106–107. La salida actual vuelve a mostrar el contexto de lista nula; no duplicar el análisis del receptor. |

## 3. Separación de capas

- Las invocaciones listadas llaman a `BRService.setState(III)V`; sus argumentos alimentan el estado global del servicio mediante el adaptador descrito en evidencia 107.
- La escritura a `mLastError` y la propagación de `BRItem.state/error` dependen de las condiciones internas de `setState(IIII)V` ya preservadas en evidencia 107.
- No convertir los argumentos literales 6 o 9 en afirmaciones de `BRItem.error=6/9`; tampoco confundir `p2=12) con `BRItem.state=12`.
- El bloque no añade escrituras directas `iput` a `BRItem.state` o `BRItem.error` en los call sites mostrados.

## 4. Delta y límites probatorios

**Delta conservado:** matriz contextual de llamadas a `setState(III)V` en físicas 3334, 5562, 12706, 18922 y 19512; en particular, llamada de entrada a `restoreFiles` `(4,1,0)` y llamada de cierre `(0,11,0)`, además de la corroboración/contexto de otras llamadas.

**No duplicado:** el cuerpo del método y su propagación a BRItem (evidencia 107); la llamada `(3,12,9)` ya registrada en la sección 12 del índice; la ruta `restoreFiles brItems is null` y el receptor `(mState,12,6)` (evidencias 106–107).

**No demostrado:** significado de los códigos/etapas; ejecución dinámica de cualquiera de las rutas; éxito o fallo real de backup/restore; relación causal completa entre cada caller y la notificación final. La salida es un grep contextual, no el archivo Smali completo ni una nueva verificación local independiente.
