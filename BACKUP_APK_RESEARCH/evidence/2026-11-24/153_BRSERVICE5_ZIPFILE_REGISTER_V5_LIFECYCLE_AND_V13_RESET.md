# Evidencia 153 — BRService$5: ciclo de vida de ZipFile en v5 y reinicio de v13 — 2026-11-24

**Archivo:** `smali/com/miui/backup/service/BRService$5.smali`  
**Método:** `.method public run()V`, inicio físico 39.  
**Procedencia:** salida Termux compartida por el usuario en este chat: ventanas físicas 850–970, 950–980, 2205–2240, 2405–2435, 3485–3520 y 3550–3695.  
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. No se realizó cotejo local independiente, hash nuevo ni ejecución dinámica.

## 1. Creación y ciclo de vida de v5

La ventana 879–953 permite reconstruir la asignación inicial relevante:

- Si `mZipFilePath` es no nulo y no está vacío, el flujo intenta construir `new ZipFile(mZipFilePath)` (901–910).
- Si el constructor termina, mueve el objeto `ZipFile` a `v5` (913) y salta directamente a `:goto_e` (915), evitando la asignación nula de `:cond_1a`.
- Si la ruta es nula/vacía, el flujo llega a `:cond_1a` y asigna `v5 = null` (952–953).
- Si el constructor lanza `IOException`, el manejador registra el error y actualiza estado (917–950); después cae en `:cond_1a` y también asigna `v5 = null` (952–953).

Así, al entrar en `:goto_e`/bucle principal, `v5` representa la referencia al ZipFile construido cuando la apertura tuvo éxito, o null cuando no hubo ruta utilizable o falló el constructor. El manejador de excepción reutiliza temporalmente el registro v5 para un literal String y un entero de estado (925–948), pero la asignación explícita null de 953 normaliza el camino de fallo antes del bucle.

## 2. Relación con la comprobación del bloque de error

En la ventana 3623–3653 ya preservada en evidencia 152, `if-nez v5` evita las asignaciones mostradas a `BRItem.error` cuando la referencia es no nula. Cuando `v5` es null, la rama asigna error 1 si el archivo `bakFile` existe, o error 10 si la referencia/archivo no existe.

La evidencia 153 conecta esa comprobación con el origen de `v5`: una referencia ZipFile establecida por el camino de apertura exitosa, frente al null del camino sin ZIP o con IOException. Esta lectura queda limitada al flujo y las ventanas compartidas; no atribuye integridad del ZIP ni éxito de restauración a la mera existencia del objeto.

## 3. Reutilización de v13 antes del contador de restauración

La ventana 853–875 muestra que, antes de la inicialización del contador principal, `v13` se reutiliza como resultado booleano de `Iterator.hasNext()`, como objeto devuelto por `Iterator.next()` y como referencia a `BRItem`/su `packageName` (856–871).

Después, en `:goto_e`, la instrucción `const/4 v13, 0x0` de la línea física 958 reinicia el registro antes de la etiqueta `:goto_f` y del bucle principal (961 en adelante). Por tanto, los usos anteriores de v13 como booleano/objeto pertenecen a una fase previa y no deben confundirse con el valor numérico acumulado por los incrementos posteriores ya documentados en evidencia 139.

La ventana 2227 confirma el incremento de v13 tras la rama opcional `unpackBakSdDatas()`; las ventanas 2422 y 3503 reproducen los otros dos incrementos ya documentados en evidencia 139. No se vuelven a registrar como hallazgos nuevos.

## 4. Dedupe y límites

- Evidencia 138 ya conserva el uso final de v13 en `backup_local_restore_success_num`, el log de resumen y el cierre del método.
- Evidencia 139 ya conserva la inicialización de v13 en `:goto_e` y las coordenadas de los tres incrementos. Esta evidencia añade el contexto previo de reutilización del registro y la secuencia que lo reinicia.
- Evidencia 152 ya conserva las condiciones de asignación de `BRItem.error=1/10` y deja pendiente el origen de v5. Esta evidencia añade la creación del ZipFile, el manejo de IOException y la normalización a null.
- La interpretación de `if-nez v5` como comprobación de presencia del ZipFile depende de que no exista una reasignación intermedia que cambie ese registro; las ventanas actuales muestran el origen y los usos conocidos, pero no sustituyen una auditoría exhaustiva de todas las escrituras de v5 en el método.
- No se concluye que v13 cuente universalmente todos los elementos exitosos: los incrementos y su semántica de flujo siguen requiriendo reconstrucción completa.
- No hay ejecución dinámica ni prueba de integridad/validez del ZIP.
