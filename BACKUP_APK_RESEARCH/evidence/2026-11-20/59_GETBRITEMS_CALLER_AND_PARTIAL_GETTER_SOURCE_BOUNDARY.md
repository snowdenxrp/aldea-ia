# Evidencia 59 — Caller getBRItems y límite del fragmento del getter

- Fecha de consolidación: 2026-11-20
- Rama: `backup-apk-static-research-2026-11-19`
- Fuente: recuperación de mensajes históricos con Smali y referencias pegadas directamente por el usuario el 20-11-2026.
- Clasificación: `USER-PASTED-SOURCE / DIRECT-CHAT` para el invoke de MiAsistService y el fragmento parcial del getter; referencias a coordenadas/implementaciones sin cuerpo literal completo se etiquetan por separado.
- Alcance: caller concreto de `IBRService.getBRItems()`, implementación de respaldo Default y límite exacto del fragmento disponible de `BRService.getBRItems()`.
- Solo análisis estático; no ejecución dinámica ni operaciones Backup/Restore.

## 1. Caller concreto en MiAsistService

El usuario pegó la instrucción en `MiAsistService.smali:1606`:

```smali
invoke-interface {v0}, Lcom/miui/backup/service/IBRService;->getBRItems()[Lcom/miui/backup/service/BRItem;
```

También identificó:
- `BRService$1.smali:131`: implementación del método de interfaz `getBRItems()`.
- `BRService.smali:6770`: getter interno `getBRItems()`.

La instrucción en 1606 demuestra que ese caller invoca la interfaz `IBRService` a través de `v0`. No demuestra por sí sola si `v0` contiene un Proxy remoto o la instancia local devuelta por `Stub.asInterface()`. La conexión y asignación de `mBRService` están documentadas por separado en evidencias 02/47/55; falta el cuerpo de `Stub.asInterface()` y la resolución del proceso efectivo de BRService.

## 2. Descriptor y método de interfaz

El usuario pegó el encabezado de `IBRService.smali`:
- clase `Lcom/miui/backup/service/IBRService;`;
- descriptor de interfaz `com.miui.backup.service.IBRService`;
- método abstracto `getBRItems()[Lcom/miui/backup/service/BRItem;`;
- declaración con `RemoteException`.

El transporte Stub/Proxy para transacción 5 y Parcelable ya está documentado en evidencia 45. No se duplica aquí.

## 3. Implementación Default: rama de respaldo no operativa

El usuario pegó `IBRService$Default.smali`, líneas 1–100. En el bloque compartido:
- `asBinder()` devuelve null;
- `getBRItems()` devuelve null;
- getters enteros mostrados devuelven 0;
- métodos de control mostrados son no-op.

Esta clase es la implementación Default vacía de respaldo; no identificarla como el servicio operativo. La implementación Binder concreta reportada es `BRService$1`, que hereda de `IBRService$Stub` (evidencia 45).

## 4. Fragmento parcial del getter interno BRService.getBRItems()

El usuario pegó un fragmento de `BRService.smali:6750–6815`, que incluye:
- creación de un nuevo arreglo `BRItem[]`;
- iteración sobre `mBRItems`;
- obtención/cast del elemento;
- comparación de `packageName` con la cadena exacta `files_for_backup`;
- el texto recuperado termina en la instrucción/branch `if-eqz v3, :cond_0`.

**Límite estricto:** el fragmento recuperado termina en ese branch. No se completan las instrucciones posteriores ni se reconstruye el cuerpo desde el resumen. La transformación detallada del elemento `files_for_backup` y el tratamiento de elementos ordinarios están descritos en evidencia 45 a partir de la salida compartida en aquella sesión, pero este delta no aporta el Smali faltante después de `:cond_0`.

La referencia `BRService.smali:6770` identifica el método interno en el mapa de coordenadas del usuario; no se usa para alterar el límite literal del fragmento 6750–6815.

## 5. Estado de la ruta Binder

Confirmado por fuentes compartidas:
1. `MiAsistService$2.onServiceConnected()` llama `IBRService$Stub.asInterface(IBinder)`, asigna el resultado a `mBRService` y registra listener (evidencias 02/47/55).
2. El caller `MiAsistService.smali:1606` invoca `IBRService.getBRItems()`.
3. El Stub/Proxy transporta `BRItem[]` mediante transacción 5 y Parcelable (evidencia 45).

No resuelto:
- cuerpo de `IBRService$Stub.asInterface(IBinder)`;
- rama local vs Proxy para el Binder realmente devuelto;
- proceso efectivo de BRService, porque falta el contexto `<application>` del manifest;
- cuerpo literal íntegro de `BRService$1.getBRItems()` y del getter `BRService.getBRItems()`.

No inferir acceso externo, autorización ni transporte remoto solo por la presencia de clases Proxy/Stub o por el invoke-interface.

## 6. Siguiente trabajo sin repetición

1. Recuperar `IBRService$Stub.asInterface(IBinder)` completo.
2. Resolver proceso efectivo de BRService con el bloque `<application>` y declaración de servicio.
3. Solo si el contexto histórico aporta más fuente, completar el getter interno a partir de Smali literal; no volver a solicitar/afirmar el fragmento ya recibido.
4. Mantener la distinción entre el invoke-interface confirmado y el objeto concreto almacenado en `v0`.

**Estado:** caller de `getBRItems()` identificado; selección Proxy/local sigue `UNKNOWN`; cuerpos de getter permanecen parciales.