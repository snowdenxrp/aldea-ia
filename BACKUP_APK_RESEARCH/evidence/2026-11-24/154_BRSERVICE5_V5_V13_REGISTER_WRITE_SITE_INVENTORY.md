# Evidencia 154 — BRService$5: inventario grep de operandos destino v5/v13 — 2026-11-24

**Archivo referido:** `decoded/smali/com/miui/backup/service/BRService$5.smali`  
**Método de interés:** `.method public run()V`, cabecera física previamente identificada en línea 39.  
**Procedencia:** salida Termux compartida por el usuario en este chat, mediante grep sobre `$F`.  
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash del Smali y sin ejecución dinámica.

## 1. Salida literal recibida

Comando:

```sh
grep -nE '^[[:space:]]*[a-z][a-z0-9/-]*[[:space:]]+v(5|13)(,|[[:space:]]|$)' "$F"
```

Coordenadas y líneas reportadas:

```text
97:    move-result-object v5
111:    const/4 v5, 0x2
245:    new-instance v13, Ljava/lang/StringBuilder;
261:    move-result-object v13
272:    const/16 v13, 0x9
608:    iget-object v13, v1, Lcom/miui/backup/service/BRService$5;->this$0:Lcom/miui/backup/service/BRService;
612:    move-result-object v13
694:    move-object/from16 v13, v17
696:    check-cast v13, Lcom/miui/backup/service/BRItem;
699:    iget-object v13, v13, Lcom/miui/backup/service/BRItem;->packageName:Ljava/lang/String;
804:    move-result-object v5
856:    move-result v13
858:    if-eqz v13, :cond_19
862:    move-result-object v13
864:    check-cast v13, Lcom/miui/backup/service/BRItem;
869:    iget-object v13, v13, Lcom/miui/backup/service/BRItem;->packageName:Ljava/lang/String;
913:    move-object v5, v0
923:    new-instance v13, Ljava/lang/StringBuilder;
925:    const-string v5, "can't create zipFile: mZipFilePath"
929:    iget-object v5, v1, Lcom/miui/backup/service/BRService$5;->this$0:Lcom/miui/backup/service/BRService;
933:    move-result-object v5
939:    move-result-object v5
948:    move-result v5
953:    const/4 v5, 0x0
958:    const/4 v13, 0x0
1509:    if-eqz v5, :cond_2a
2227:    add-int/lit8 v13, v13, 0x1
2266:    const/4 v13, 0x0
2304:    move-object v13, v10
2307:    if-eqz v13, :cond_3a
2422:    add-int/lit8 v13, v13, 0x1
2437:    if-eqz v5, :cond_47
3011:    if-eqz v5, :cond_59
3503:    add-int/lit8 v13, v13, 0x1
3635:    if-nez v5, :cond_5d
3646:    if-nez v5, :cond_5d
3844:    const/4 v5, -0x1
3885:    const/4 v5, 0x4
3891:    const-wide/16 v5, 0x1f4
3908:    const-string v5, "InterruptedException"
3945:    const-string v5, "RemoteException"
4045:    const/4 v5, 0x0
4088:    const/4 v5, 0x4
```

## 2. Lectura preliminar estrictamente limitada

- Las líneas 2266 (`const/4 v13, 0x0`) y 2304 (`move-object v13, v10`) son escrituras posteriores al inicio del contador y a su primer incremento (línea 2227). Sus contextos y rutas de control no se han recibido todavía. No se concluye si la línea 2266 reinicia el contador en una ruta que luego llega al resumen, ni si 2304 pertenece a una ruta alternativa o a una fase con reutilización de registro.
- Las líneas 856/862/869 ya están descritas en evidencia 153 como reutilización de v13 en el iterador previo; la línea 958 reinicia v13 a cero antes del bucle principal.
- Las líneas 2227, 2422 y 3503 son los tres incrementos ya conservados en evidencia 139; no se registran otra vez como hallazgos.
- Las líneas 1509, 2307, 2437, 3011, 3635 y 3646 son instrucciones de bifurcación/lectura, no escrituras por sí mismas.
- Para v5, las líneas 913 y 953 ya están descritas en evidencia 153. Las líneas 97, 111, 804, 3844, 3885, 3891, 3908, 3945, 4045 y 4088 requieren contexto para decidir si son definiciones, valores temporales, resultados de llamadas o reutilización posterior del registro.
- El patrón grep no distingue lecturas y escrituras en instrucciones de dos operandos: por ejemplo `add-int/lit8 v13, v13, 0x1` sí escribe el destino, mientras que `if-eqz v13` solo lee. En instrucciones como `iget-object v13,...` el registro destino sí se escribe; `check-cast v13` modifica/verifica el tipo del mismo registro.

## 3. Próximo contexto necesario

Solicitar solo ventanas nuevas para:
- v13: físicas 2245–2320, para examinar el reset de línea 2266 y la asignación desde v10 en 2304.
- v5: físicas 70–125 y 780–820, para identificar definiciones previas; 3825–3960 y 4025–4105, para determinar si pertenecen a handlers/finalización y si están dentro del mismo `run()V`.
- No volver a solicitar 850–970, 2205–2240, 2405–2435, 3485–3520 ni 3550–3695: ya están recibidas y preservadas en evidencias 132, 138, 139, 152 y 153.

**Estado:** inventario preservado; semántica de las escrituras nuevas PENDIENTE. No se cierra el flujo global de v5 ni de v13.
