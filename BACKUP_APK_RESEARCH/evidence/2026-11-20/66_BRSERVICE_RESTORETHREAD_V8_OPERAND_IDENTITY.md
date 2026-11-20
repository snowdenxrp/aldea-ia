# Evidencia 66 — BRService$5.run(): identidad de v0/v5 y semántica de v8

- Fecha: 2026-11-20
- Rama documental: `backup-apk-static-research-2026-11-19`
- Fuente: salida de Termux pegada directamente por el usuario: `sed -n '90,124p' "$F"`.
- Clasificación: `USER-PASTED-LOCAL-SMALI / DIRECT-CHAT`; no relectura independiente del archivo ni hash local verificado en esta sesión.
- Alcance: líneas físicas 90–124 de `BRService$5.smali`.
- Solo análisis estático; no se ejecutó backup/restore ni se observaron estados runtime.

## 1. Fragmento primario

```smali
iget-object v0, v1, Lcom/miui/backup/service/BRService$5;->this$0:Lcom/miui/backup/service/BRService;
invoke-static {v0}, Lcom/miui/backup/service/BRService;->-$$Nest$fgetmBakFilesType(Lcom/miui/backup/service/BRService;)I
move-result v0

const/4 v5, 0x2
const/4 v6, 0x0
const/4 v7, 0x1

if-ne v0, v5, :cond_1
const/4 v8, 0x1
goto :goto_0

:cond_1
const/4 v8, 0x0
```

## 2. Conclusión directa

- `v0` contiene el valor leído del campo `BRService.mBakFilesType` mediante su getter sintético.
- `v5` contiene el entero literal `2`.
- Por tanto, `v8=1` si y solo si `mBakFilesType == 2`; en caso contrario `v8=0`.
- Se resuelve así la identidad semántica de `v0` y `v5` que la evidencia 65 había dejado abierta.

## 3. Cadena consolidada con evidencia 65

La evidencia 65 conserva la rama posterior en `BRService$5.run()`:

`mBakFilesType == 2` → `v8=1` → `if-eqz v8, :cond_1c` no salta → `v16=0x8` → `goto/16 :goto_3f`.

La relación entre el tipo 2 y la asignación temprana del código 8 queda confirmada por dos fragmentos primarios compartidos por el usuario en Termux. Esto no basta para asignar al código 8 un texto de error o una semántica externa no observada.

## 4. Límites probatorios

- Fuente directa compartida, pero no relectura independiente ni hash del archivo local en esta sesión.
- No se demuestra aquí el origen upstream del campo `mBakFilesType` en todos los caminos.
- No se demuestra aquí el efecto runtime, ni el texto visible asociado al código 8.
- No se repite la propagación de cierre ya conservada; el siguiente trabajo debe investigar únicamente el delta semántico pendiente.

**Estado:** `CONFIRMADO EN FRAGMENTO SMALI COMPARTIDO` para `mBakFilesType == 2 → v8=1`; cadena `v8=1 → v16=8` consolidada con evidencia 65. `UNKNOWN/PENDIENTE` para origen upstream completo y significado externo del código 8.
