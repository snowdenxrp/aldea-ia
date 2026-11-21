# Evidencia 79 — Reconciliación de ArchiveHelper:1741 con el writer error=1 ya documentado

- Fecha de consolidación: 2026-11-21
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: recuperación dirigida de conversaciones del usuario del 2026-11-19, mensajes alrededor de 22:36–22:43Z; contraste con evidencia 27 y grep reportado en el mismo bloque de conversación.
- Clasificación: USER-REPORTED-GREP / RECOVERED-CHAT para coordenada 1741; USER-PASTED-SOURCE / DIRECT-CHAT conservada en evidencia 27 para el cuerpo del overload; PRIOR-ASSISTANT-OUTPUT para la transcripción exacta recuperada en la conversación de 22:41–22:42Z.
- No LOCAL-VERIFIED; no ejecución dinámica.

## 1. Writer ya documentado en evidencia 27

Evidencia 27 conserva el método:

~~~smali
.method public static unzipFiles(Ljava/io/File;Ljava/lang/String;Lcom/miui/backup/IFileZipSizeChangedListener;Lcom/miui/backup/service/BRItem;ZLjava/io/InputStream;Ljava/util/List;)V
~~~

La declaración fue reportada en ArchiveHelper.smali:1244. Al inicio del método:

~~~smali
move-object/from16 v1, p3
move-object/from16 v0, p5
~~~

Por tanto, v1 conserva la referencia del cuarto parámetro p3, un BRItem.

El bloque de escritura preservado por evidencia 27 es:

~~~smali
const/4 v0, 0x1
.line 369
iput v0, v1, Lcom/miui/backup/service/BRItem;->error:I
~~~

La condición descrita en esa evidencia es que, después de la operación de rename/copia, el archivo de destino no existe. La escritura asigna error=1 al mismo BRItem recibido en p3.

## 2. Reconciliación con la coordenada 1741

El grep reportado por el usuario el 2026-11-19T22:36:21Z identificó:

~~~smali
iput v0, v1, Lcom/miui/backup/service/BRItem;->error:I
~~~

en ArchiveHelper.smali:1741.

En la recuperación posterior del mismo hilo (22:41–22:43Z) aparece el contexto del overload de siete argumentos, la declaración en la línea física 1244, el alias v1 <- p3, y la misma secuencia literal const/4 v0, 0x1 seguida del iput. La directiva fuente asociada al bloque en evidencia 27 es .line 369; no confundir esa directiva con el número físico 1741.

**Reconciliación documental:** la coordenada reportada 1741 corresponde al writer error=1 que ya está descrito en evidencia 27, no a un segundo writer semánticamente independiente. La conclusión se basa en coincidencia de clase, método, registros, instrucción y contexto recuperado; no en una lectura actual del archivo local.

## 3. Corrección de inventario y alcance

- Mantener evidencia 27 como descripción funcional principal del writer y del alias BRItem.
- Mantener evidencia 70 como inventario de coordenadas, pero marcar ArchiveHelper:1741 como duplicado del writer de evidencia 27.
- La coordenada 1741 no debe contarse como writer adicional al calcular cobertura de productores BRItem.error.
- La identidad v1 <- p3 y el error 1 se limitan al overload de siete argumentos descrito; no extrapolar a otros overloads.
- El call site de BRService.smali:12918 y el alias caller→helper de evidencia 68 permanecen como una capa separada del análisis.

## 4. Estado probatorio

| Afirmación | Estado |
|---|---|
| Existe grep reportado en ArchiveHelper:1741 para iput v0,v1,...BRItem.error | USER-REPORTED-GREP |
| El overload de siete argumentos está declarado en 1244 | USER-PASTED-SOURCE / RECOVERED-CHAT |
| En ese overload v1 recibe p3 | USER-PASTED-SOURCE / DIRECT-CHAT según evidencia 27 |
| El bloque literal asigna error=1 a v1 | USER-PASTED-SOURCE / DIRECT-CHAT según evidencia 27 |
| 1741 es el mismo writer descrito en evidencia 27 | RECOVERED-CHAT por reconciliación de instrucción/contexto; no LOCAL-VERIFIED |

**Resultado:** se resuelve la posible duplicación del inventario: ArchiveHelper:1741 no añade un writer nuevo; remite al writer error=1 del overload de siete argumentos ya documentado en evidencia 27.