# Evidencia 82 — Bloque literal de la rama state en BRService$6 (2110–2128)

- Fecha de registro: 2026-11-20.
- Rama: `backup-apk-static-research-2026-11-19`.
- Procedencia: mensaje literal del usuario recuperado de la conversación del 2026-11-19T21:22:58Z.
- Clasificación: `USER-PASTED-SMALI / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
- Alcance: análisis estático; no ejecución dinámica.

## 1. Fragmento literal recuperado

El usuario compartió el siguiente bloque atribuido a las líneas físicas 2110–2128 de `BRService$6.smali`:

```smali
.line 2584
iget-object v3, v11, Lcom/miui/backup/service/BRItem;->packageName:Ljava/lang/String;
invoke-virtual {v0, v3}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
move-result v0
if-eqz v0, :cond_38
iget v0, v11, Lcom/miui/backup/service/BRItem;->state:I
goto :goto_21
:cond_38
const/4 v0, 0x1
:goto_21
iput v0, v11, Lcom/miui/backup/service/BRItem;->state:I
```

El fragmento no incluye el encabezado `.method`, ni el inicio del método, ni la definición de `v0` antes de `invoke-virtual`.

## 2. Conclusión estática limitada

El bloque confirma la lógica local del writer de state:

- Se compara mediante `String.equals()` el objeto de cadena en `v0` con `BRItem.packageName` de `v11`.
- Si `equals()` devuelve verdadero, `if-eqz` no salta; se lee el `BRItem.state` existente en `v0` y se salta a `:goto_21`. Por tanto, se conserva el state previo.
- Si `equals()` devuelve falso, se toma `:cond_38`, se carga `v0=1` y se escribe ese valor en `BRItem.state`.
- El mismo objeto `v11` recibe la escritura final.

Esto proporciona el detalle de ramas que faltaba en la descripción resumida de evidencia 76 para `BRService$6:2128`: la comparación es `equals(BRItem.packageName)`; igualdad conserva el estado y desigualdad asigna 1.

## 3. Relación con las otras coordenadas de BRService$6

El bloque no contiene la escritura `BRItem.error` de 2101 ni su registro fuente `v8`. Aunque evidencia 80 conserva lecturas de error en 1997 y 2105 y la lectura de state en 2120, este fragmento por sí solo no establece el flujo de control que conecta esas instrucciones con el writer de 2101.

La instrucción `iget state` dentro del bloque coincide con la coordenada reportada 2120; el writer final coincide con 2128. El fragmento recuperado permite describir la lógica de state, pero no resuelve la definición de `v8`, el valor escrito en error ni la causalidad error→state.

## 4. No duplicación y estado

- Evidencia 76 ya resumía que 2128 conserva state para `files_for_backup` o asigna 1; evidencia 82 aporta ahora el fragmento literal parcial de la comparación y sus ramas.
- Evidencia 80 conserva la vecindad de lecturas/escrituras y sigue siendo la referencia para las coordenadas 1997/2101/2105/2120/2128.
- No inferir que la cadena comparada sea necesariamente `files_for_backup`: el literal recuperado solo muestra `equals(BRItem.packageName)`; identificar el origen del registro `v0` requiere recuperar sus definiciones dominantes.
- No se recuperó el encabezado del método ni el bloque previo de definición de `v0`.
- La evidencia procede del historial de conversación, no de cotejo actual con el archivo local.

**Resultado:** el writer `BRService$6:2128` queda contextualizado por un bloque literal parcial: igualdad de nombres de paquete conserva state; desigualdad asigna state=1. El vacío de `BRService$6:2101/v8` permanece abierto.
