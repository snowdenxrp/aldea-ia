# Evidencia 53 — Escrituras directas y propagación BRItem.state/error en BRService.smali

- Fecha: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: bloques Smali y grep compartidos por el usuario el 19-11-2026; recuperación focalizada de conversación.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para instrucciones y coordenadas explícitas; PRIOR-ASSISTANT-SUMMARY para secuencias cuyo texto exacto no fue recuperado.
- No LOCAL-VERIFIED por relectura del checkout en esta sesión. No ejecución dinámica.

## 1. Inventario grep de BRService.smali

El usuario reportó un grep global con escrituras de campo en:
- 5201
- 5363
- 5519
- 6857
- 12854
- 12903
- 12956
- 16787 / 16791
- 16710
- 16914
- 17153
- 17431

También se reportó lectura de state en 6855.

Otros reportes recuperados mencionan escrituras en 7004/7009 y 17431–17436 propagando desde PkgInfo. No se conservaron firmas/nombres de método para los bloques de estas coordenadas. No asignarles método por conjetura.

## 2. Bloque físico 12849–12956 — restoreLocalMediaFile

**USER-PASTED-SOURCE con instrucciones explícitas:**
- Línea física 12851: escribe BRItem.state=3.
- Línea 12856: carga constante 0x7.
- Línea 12859: iput p2, p1, BRItem.error:I; por tanto el valor 7 se escribe en BRItem.error, no en state.
- Línea 12903: escribe BRItem.state=8.
- Líneas 12948/12953 preparan el resultado según mIsAborted.
- Línea 12956: escribe BRItem.state=9 si abortado, o state=1 si no.

Este bloque es consistente con el resumen de restoreLocalMediaFile() conservado en evidencia 49. La instrucción de 12859 es especialmente importante: no interpretar const/4 p2,0x7 como state=7 porque el iput de destino es BRItem.error.

Los nombres/descriptores completos del método no estaban visibles en el fragmento recuperado aquí; la atribución a restoreLocalMediaFile proviene de su contexto de conversación/rango y debe mantenerse como ancla histórica hasta verificar encabezado del método.

## 3. Bloque 16787–17436 — escrituras y copias adicionales

**USER-PASTED-SOURCE / coordenadas recuperadas:**
- 16787: const/4 v7, 0x6.
- 16791: iput de ese valor a BRItem.state; escritura directa state=6.
- 16914: iput p1 a BRItem.state.
- 16917: iput p2 a BRItem.error.
- 17141: literal files_for_backup.
- 17153: iput v1 a BRItem.state.
- 17158: iput de valor 9 a BRItem.error.
- 17431–17436: copia de PkgInfo.state a BRItem.state y de PkgInfo.error a BRItem.error.

Los nombres/firmas de métodos no estaban visibles en la recuperación. No asumir que estas asignaciones pertenecen a un único método o a la misma ruta funcional.

**Importancia:** 16787–16791 es otro productor histórico de BRItem.state=6 fuera de la coordenada 2351/.line 1735 de BRService$5.smali. El valor 6, por tanto, no debe describirse como exclusivo de files_for_backup o de una sola clase sin completar el inventario global.

## 4. Otros bloques — nivel de certeza separado

### 4.1 Coordenadas 5201, 5363 y 5511–5519

La recuperación de conversación atribuye al resumen previo:
- 5201: notifyItemTaskStart(...), luego const/4 v6,0x2 e iput v6,p1,BRItem.state; state=2.
- 5363: const/4 v8,0x7 e iput v8,p1,BRItem.state; state=7.
- 5511–5519: p2=3 si mIsAborted, de lo contrario p2=1; iput p2,...BRItem.state.

**Procedencia:** las coordenadas aparecen en el grep reportado por el usuario, pero la secuencia literal de instrucciones de estos bloques no se conservó como texto de usuario en la recuperación actual. La interpretación state=7 en 5363 debe tratarse como PRIOR-ASSISTANT-SUMMARY, pendiente de verificar el iput real y su destino; no elevarla a fuente directa.

### 4.2 Coordenadas 6855–6857

Resumen recuperado:
- 6855: iget v4,v2,BRItem.state.
- 6857: iput v4,v3,BRItem.state.
- El bloque también copia completedSize, transingCompletedSize y transingTotalSize.
- Un resumen previo añadió propagación de error en 6855–6862, pero el texto exacto no se conserva aquí.

La interpretación disponible es copia de estado/tamaños entre instancias BRItem, no una nueva asignación semántica de estado. Mantenerla como resumen hasta releer instrucciones completas.

## 5. Reconciliación con búsquedas negativas anteriores

- Evidencias 08/15 documentan búsquedas negativas limitadas a FakeBackupListenerImp, ProgressItemAdapter y bloques concretos: no encontraron escrituras directas state=7/8 dentro de esos ámbitos.
- El bloque 12849–12956 sí muestra state=8 en BRService.smali, fuera de esos ámbitos. Esto no invalida aquellas búsquedas limitadas, pero impide generalizar su resultado a todo BRService o al APK.
- La escritura state=7 en 5363 aparece solo en resumen previo, no en fuente directa recuperada. Mantener UNKNOWN hasta comprobar el iput y campo destino.
- El valor 7 en 12856/12859 es inequívocamente BRItem.error=7, no state.
- El estado 6 tiene múltiples productores reportados: BRService$5 (línea física 2351 / .line 1735) y BRService.smali (16787–16791). Sus contextos son distintos y no deben fusionarse.

## 6. Límites y pendientes

1. Recuperar encabezados y descriptores de método que contienen 12849–12956 y 16787–17436.
2. Preservar el bloque literal 5201–5205, 5358–5365 y 5511–5521 para confirmar el presunto state=7 y su destino.
3. Leer 6850–6865 completo para establecer campos copiados (state/error/tamaños) y aliasing de objetos.
4. Seguir PkgInfo.state/error desde su productor hasta el BRItem destino.
5. Actualizar inventario global de state 6: no asumir exclusividad del producer files_for_backup.
6. No usar búsquedas negativas acotadas para afirmar ausencia global de state 7/8.
7. No pedir nueva extracción hasta reconciliar el material ya preservado; solo lectura estática.

**Conclusión:** el bloque de restoreLocalMediaFile contiene state=3/error=7/state=8/final state=9 o 1. Otros bloques BRService contienen escrituras/copia de state 6 y propagación PkgInfo→BRItem. La hipótesis de state=7 en línea 5363 queda en cuarentena por procedencia incompleta. Estado general: INCOMPLETE.
