# Evidencia 63 — proceso predeterminado de la aplicación y ruta Binder esperable

- Fecha de recepción: 2026-11-20
- Rama: `backup-apk-static-research-2026-11-19`
- Fuente primaria: salida de Termux pegada por el usuario desde `$HOME/backup-static/decoded/AndroidManifest.xml`.
- Clasificación: `USER-PASTED-LOCAL-MANIFEST / DIRECT-CHAT`. El contenido se compartió directamente en la conversación; no se releyó el archivo local desde este entorno ni se calculó hash independiente.
- Alcance: apertura de `<application>` y declaraciones de servicios, líneas 87 y 107–113 del XML mostrado.
- Solo análisis estático; no se ejecutaron servicios ni operaciones Backup/Restore.

## 1. Fragmento relevante recibido

```xml
<application android:allowBackup="false" android:appComponentFactory="androidx.core.app.CoreComponentFactory" android:extractNativeLibs="true" android:icon="@drawable/new_icon" android:label="@string/app_name" android:largeHeap="true" android:name="com.miui.backup.BackupApp" android:networkSecurityConfig="@xml/network_security_config" android:requestLegacyExternalStorage="true" android:resizeableActivity="false" android:supportsRtl="true" android:theme="@style/MainTheme" android:uiOptions="splitActionBarWhenNarrow">
    ...
    <service android:exported="false" android:foregroundServiceType="systemExempted" android:name="com.miui.backup.service.MiAsistService" android:process=":remote">
        <intent-filter>
            <action android:name="miui.intent.action.MIASIST_PROXY"/>
        </intent-filter>
    </service>
    <service android:exported="false" android:foregroundServiceType="systemExempted" android:name="com.miui.backup.service.BRService"/>
    <service android:exported="false" android:foregroundServiceType="systemExempted" android:name="com.miui.backup.service.TransFileService"/>
```

La etiqueta `<application>` no contiene atributo `android:process`.

## 2. Consecuencia de configuración

- `MiAsistService` declara explícitamente `android:process=":remote"`.
- `BRService` no declara `android:process`; al no haber proceso predeterminado en `<application>`, hereda el proceso predeterminado del paquete.
- `TransFileService` tampoco declara `android:process`; hereda el mismo proceso predeterminado.
- En consecuencia, según la semántica estándar de Android, `MiAsistService` está configurado para un proceso separado del proceso predeterminado donde se ejecuta `BRService` y `TransFileService`.

No hay evidencia en el fragmento de que `BRService` o `TransFileService` compartan `:remote`.

## 3. Reconciliación con IBRService.Stub.asInterface()

La evidencia 62 conserva el cuerpo de `IBRService$Stub.asInterface(IBinder)`:
- Devuelve interfaz local solo si `queryLocalInterface(descriptor)` produce un objeto no nulo del tipo `IBRService`.
- En otro caso construye `IBRService$Stub$Proxy`.

Dado que el cliente `MiAsistService` y el servicio `BRService` están declarados en procesos distintos, la ruta esperable para su Binder es la rama Proxy. Esto hace que el recorrido síncrono Stub/Proxy y Parcelable descrito en evidencia 45 sea el transporte esperado para llamadas como `getBRItems()`.

## 4. Límites

- Esta es una inferencia estática basada en el Manifest compartido y la lógica de `asInterface()`; no es una traza runtime.
- No se observó el objeto Binder concreto entregado a `onServiceConnected()`, ni se ejecutó el servicio.
- La conclusión describe la configuración declarada del APK; no sustituye la verificación del entorno efectivo ni excluye mecanismos externos no visibles en los fragmentos.
- No afirmar que el usuario observó la ruta Proxy en ejecución.
- No repetir la extracción de `asInterface()`, callback `MiAsistService$2.onServiceConnected()`, caller `getBRItems()` ni transacciones Binder ya documentadas.

## 5. Clasificación final

- **CONFIRMADO EN MANIFEST COMPARTIDO:** `<application>` no fija proceso predeterminado.
- **CONFIRMADO EN MANIFEST COMPARTIDO:** `MiAsistService` declara `:remote`.
- **CONFIRMADO EN MANIFEST COMPARTIDO:** `BRService` y `TransFileService` no declaran proceso propio.
- **INFERENCIA ESTÁTICA FUERTE:** `MiAsistService` y `BRService` están configurados en procesos distintos; la ruta esperable de `asInterface()` es Proxy.
- **NO OBSERVADO:** Binder concreto y ruta efectivamente tomada en runtime.
