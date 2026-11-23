# Evidencia 122 — recuperación y persistencia de estado en ProgressPageFragmentBase — 2026-11-22

Procedencia: fragmentos pegados directamente por el usuario desde Termux. El mensaje no incluyó el comando original. Coordenadas físicas reportadas: 2142–2167, 2178–2316 (continuación truncada), 2643–2648 y 2731–2891. USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT; sin verificación local independiente ni runtime.

## Extractos originales preservados

### Comprobación de servicio y diálogo de aborto
El usuario compartió las instrucciones 2142–2167: consulta BRService.isServiceWorkingFromPreference(context); si devuelve true, mBtnCancel existe y su visibilidad es 0, invoca showAbortConfirmDialog() y retorna 1. En los demás casos mostrados retorna v1, cuyo valor no estaba incluido.

### onCreate()
El fragmento muestra:
- Bundle no nulo: obtiene last_state, last_stage y last_error con valor por defecto -1 y los asigna a mState, mStage y mError.
- Recupera BRServiceDataHolder.getBrItems() y lo asigna a mLastItems.
- Recupera last_progress, is_show_cancel_dialog e is_backup y los asigna a mProgress, isShowCancelDialog e isBackup.
- Recupera mZipPath del Bundle con cadena vacía como valor por defecto.
- Sin Bundle: si el contexto existe y isServiceWorkingFromPreference(context) devuelve true, recupera getBrItems() del holder y lo asigna a mLastItems.
- La continuación de onCreate() desde la línea 2306 se recibió truncada/irregular; no se reconstruye lo omitido.

### destroy y unbind
Las líneas 2643–2648 muestran llamada a ProgressItemAdapter.destroy() y después a unbindBRService(). El cuerpo de destroy() no está incluido.

### onSaveInstanceState()
El fragmento muestra:
- Guarda mState, mStage y mError en Bundle bajo last_state, last_stage y last_error.
- Si mService no es null y getBRItems() devuelve arreglo no nulo, construye ArrayList desde Arrays.asList(array) y llama BRServiceDataHolder.setBrItems().
- En la rama alternativa, si mAdapter no es null, obtiene mAdapter.getBrItems() y lo entrega a setBrItems().
- Captura RemoteException y registra RemoteException:onSaveInstanceState.
- Guarda progreso desde NumberProgressView.getScore(), mZipPath si no está vacío, isShowCancelDialog e isBackup.
- También se recibieron las líneas 2882–2891: onViewCreated() invoca initUI(view).

## Análisis estático

1. La restauración de la instancia repone estado, etapa, error, progreso, flags de diálogo/backup y ruta ZIP desde Bundle; también carga la lista de BRItem desde BRServiceDataHolder.
2. Sin Bundle, la recuperación de mLastItems depende de contexto no nulo y de que isServiceWorkingFromPreference(context) sea true.
3. Al guardar estado, la fuente preferente de BRItem es el arreglo devuelto por IBRService.getBRItems(); si esa rama no aplica, usa ProgressItemAdapter.getBrItems().
4. Arrays.asList() y el constructor ArrayList crean un contenedor de lista, pero el fragmento no muestra clonación de cada BRItem.
5. El fragmento demuestra transferencia entre IBRService/adapter y BRServiceDataHolder, no persistencia en disco. La implementación/backing storage del holder no se examina.
6. La llamada a destroy() precede a unbindBRService(); no atribuir efectos internos a destroy() sin su cuerpo.
7. La comprobación de aborto está condicionada por preferencia de servicio, existencia del botón y visibilidad cero; el retorno alternativo no puede interpretarse porque el valor de v1 no fue compartido.

## Dedupe y límites

Este material no contiene getView(), getCount() ni getItemViewType(). Aporta evidencia directa nueva sobre ciclo de vida y conservación de BRItem en memoria; no duplica la evidencia 121 sobre cableado initUI→adapter. Los detalles históricos de métodos internos del adaptador siguen siendo resúmenes y no se vuelven a declarar verificados aquí. El mensaje recibido tiene omisiones y alineación irregular; solo se preservan las instrucciones visibles.

Estado: evidencia estática directa parcial de restauración y conservación en memoria; sin prueba dinámica ni persistencia en disco.
