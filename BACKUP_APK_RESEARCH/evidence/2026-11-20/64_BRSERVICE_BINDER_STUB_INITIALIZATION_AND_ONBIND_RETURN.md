# Evidencia 64 — inicialización del Stub Binder de BRService y devolución por onBind

- Fecha: 2026-11-20
- Rama: `backup-apk-static-research-2026-11-19`
- Fuente: salida de Termux pegada por el usuario desde BRService.smali y BRService$1.smali.
- Clasificación: `USER-PASTED-LOCAL-SMALI / DIRECT-CHAT`. No se releyeron los archivos locales desde este entorno ni se calcularon hashes independientes.
- Alcance: campo mBinder, inicialización BRService.smali:2607–2611, onBind():18672–18679 y constructor BRService$1:22–31.
- Solo análisis estático; no se ejecutó el servicio ni se observó una conexión Binder real.

## 1. Inicialización

La salida compartida mostró el campo:

```smali
.field private mBinder:Landroid/os/Binder;
```

Y el bloque de asignación:

```smali
.line 695
new-instance v3, Lcom/miui/backup/service/BRService$1;
invoke-direct {v3, p0}, Lcom/miui/backup/service/BRService$1;-><init>(Lcom/miui/backup/service/BRService;)V
iput-object v3, p0, Lcom/miui/backup/service/BRService;->mBinder:Landroid/os/Binder;
```

El bloque crea BRService$1, le pasa la instancia actual de BRService y almacena el objeto en mBinder. El grep compartido no incluyó la cabecera del método contenedor; no atribuir la inicialización a constructor, onCreate u otro callback sin recuperar esa cabecera.

## 2. Tipo del Stub

El constructor compartido de BRService$1 contiene:

```smali
.class Lcom/miui/backup/service/BRService$1;

.method constructor <init>(Lcom/miui/backup/service/BRService;)V
    .locals 0
    iput-object p1, p0, Lcom/miui/backup/service/BRService$1;->this$0:Lcom/miui/backup/service/BRService;
    invoke-direct {p0}, Lcom/miui/backup/service/IBRService$Stub;-><init>()V
    return-void
.end method
```

BRService$1 conserva la referencia a BRService en this$0 e invoca el constructor de IBRService$Stub. Por tanto, BRService$1 es el Stub concreto de IBRService usado por BRService.

## 3. Devolución por onBind

El cuerpo compartido:

```smali
.method public onBind(Landroid/content/Intent;)Landroid/os/IBinder;
    .locals 0
    iget-object p1, p0, Lcom/miui/backup/service/BRService;->mBinder:Landroid/os/Binder;
    return-object p1
.end method
```

onBind() lee mBinder y devuelve esa misma referencia como IBinder. No instancia un Binder nuevo dentro de onBind().

## 4. Conclusión y límites

- **CONFIRMADO EN SMALI COMPARTIDO:** se construye BRService$1(this) y se almacena en mBinder.
- **CONFIRMADO EN SMALI COMPARTIDO:** el constructor de BRService$1 llama a IBRService$Stub.<init>() y conserva la referencia a BRService.
- **CONFIRMADO EN SMALI COMPARTIDO:** onBind() devuelve mBinder.
- **CONCLUSIÓN ESTÁTICA:** el endpoint que BRService entrega mediante onBind() es la instancia almacenada de BRService$1; onBind() no crea un Binder nuevo.
- **NO OBSERVADO EN RUNTIME:** identidad del objeto devuelto en una ejecución real y conexión efectiva.
- **PENDIENTE SOLO SI RESULTA NECESARIO:** cabecera del método contenedor de la inicialización, no incluida en la salida grep recibida.

Esta evidencia cierra el origen estático del Binder de BRService. No repetir la extracción de onBind(), asignación mBinder ni constructor de BRService$1 salvo que una cuestión posterior requiera el método contenedor o su orden de ejecución.
