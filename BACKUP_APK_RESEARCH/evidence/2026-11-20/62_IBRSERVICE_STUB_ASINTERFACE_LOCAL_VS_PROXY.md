# Evidencia 62 — IBRService.Stub.asInterface: selección local vs Proxy

- Fecha de recepción: 2026-11-20
- Rama: `backup-apk-static-research-2026-11-19`
- Fuente primaria: salida completa de Termux pegada por el usuario desde `$HOME/backup-static/decoded/smali/com/miui/backup/service/IBRService$Stub.smali`.
- Clasificación: `USER-PASTED-LOCAL-SMALI / LOCAL-VERIFIED-AT-USER-ENVIRONMENT`. La ruta y el contenido del método se mostraron directamente en la salida del comando; no se releyó el archivo desde este entorno ni se calculó hash independiente.
- Alcance: cuerpo íntegro de `IBRService$Stub.asInterface(IBinder)`, líneas físicas 71–107.
- Solo análisis estático. No ejecución de servicios ni operaciones Backup/Restore.

## 1. Fuente literal recibida

```smali
.method public static asInterface(Landroid/os/IBinder;)Lcom/miui/backup/service/IBRService;
    .locals 2

    if-nez p0, :cond_0

    const/4 p0, 0x0

    return-object p0

    :cond_0
    const-string v0, "com.miui.backup.service.IBRService"

    .line 83
    invoke-interface {p0, v0}, Landroid/os/IBinder;->queryLocalInterface(Ljava/lang/String;)Landroid/os/IInterface;

    move-result-object v0

    if-eqz v0, :cond_1

    .line 84
    instance-of v1, v0, Lcom/miui/backup/service/IBRService;

    if-eqz v1, :cond_1

    .line 85
    check-cast v0, Lcom/miui/backup/service/IBRService;
    return-object v0

    .line 87
    :cond_1
    new-instance v0, Lcom/miui/backup/service/IBRService$Stub$Proxy;

    invoke-direct {v0, p0}, Lcom/miui/backup/service/IBRService$Stub$Proxy;-><init>(Landroid/os/IBinder;)V
    return-object v0
.end method
```

## 2. Flujo demostrado

1. Si `p0 == null`, devuelve null.
2. Si no es null, consulta `queryLocalInterface()` con el descriptor exacto `com.miui.backup.service.IBRService`.
3. Si el resultado es no nulo y `instance-of IBRService` es verdadero, devuelve directamente esa interfaz local.
4. Si no se cumplen ambas condiciones, construye y devuelve `IBRService$Stub$Proxy(p0)`.

No hay una tercera implementación ni una heurística adicional en el cuerpo recibido.

## 3. Relación con getBRItems()

Combinado con la evidencia 45:
- La rama local permite invocación directa de la interfaz y no fuerza por sí misma el recorrido Stub/Proxy ni Parcelable.
- La rama Proxy usa el método Proxy `getBRItems()`, que realiza la transacción síncrona 5, y el Stub responde con `writeTypedArray`; el Proxy reconstruye el arreglo mediante `createTypedArray(BRItem.CREATOR)`.
- Por tanto, el transporte Parcelable está demostrado para la rama Proxy, pero no se debe atribuir a cada llamada concreta sin determinar qué objeto devuelve `asInterface()` para el Binder recibido.

La lógica de selección está confirmada; la rama efectiva del caller sigue sin determinarse.

## 4. Qué queda por resolver

El caller de `MiAsistService.smali:1606` invoca `IBRService.getBRItems()` mediante la interfaz. El callback `MiAsistService$2.onServiceConnected()` pasa el Binder a `asInterface()` y guarda el resultado en `mBRService` (evidencias 47/55/59).

Para decidir qué rama se toma en la conexión concreta falta:
- el contexto de apertura `<application>` del manifest, para conocer si el proceso predeterminado del paquete está fijado;
- confirmar el proceso efectivo de `BRService` frente a `MiAsistService` (declarado `:remote`);
- si se necesita certeza sobre la instancia Binder entregada, seguir la implementación/instanciación del Stub y el contexto real de conexión. La configuración de procesos permite inferir la separación, pero no reemplaza la observación del objeto Binder.

El fragmento de manifest ya recuperado en evidencia 47 cubre declaraciones de servicios pero no incluye la apertura de `<application>`; no volver a solicitar esas declaraciones. El delta necesario es el bloque que contiene la apertura y atributos de `<application>`.

## 5. Conclusiones y clasificación

- **CONFIRMADO EN SMALI LOCAL COMPARTIDO:** selección local mediante `queryLocalInterface` + comprobación de tipo.
- **CONFIRMADO EN SMALI LOCAL COMPARTIDO:** fallback a `IBRService$Stub$Proxy`.
- **CONFIRMADO EN SMALI LOCAL COMPARTIDO:** Binder null produce retorno null.
- **NO DETERMINADO:** cuál rama se toma en la conexión concreta de MiAsistService.
- **NO DETERMINADO:** proceso efectivo de BRService hasta recuperar `<application>` completo.
- **NO AFIRMAR:** que todas las llamadas `getBRItems()` pasan por Parcel; eso solo aplica a la ruta Proxy demostrada.

## 6. Próximo paso sin repetición

Recuperar únicamente la apertura `<application>` y sus atributos del AndroidManifest.xml, conservando el contexto suficiente para cerrar la etiqueta. Después reconciliar el proceso de los tres servicios ya inventariados. No repetir el cuerpo `asInterface()`, callback `$2`, caller `getBRItems()` ni contrato Parcelable.
