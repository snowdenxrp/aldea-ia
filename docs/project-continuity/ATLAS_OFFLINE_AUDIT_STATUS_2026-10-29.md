# Atlas Offline — Estado de auditoría y continuidad

**Fecha de registro:** 2026-10-29  
**Estado:** `PROPOSAL — NOT IMPLEMENTED`  
**Implementación:** no demostrada.  
**Pruebas:** ninguna declarada ni ejecutada en esta sesión.  
**NCS M0:** fuera de alcance; no modificar ni usar este expediente para alterar sus gates.

## 1. Alcance y límite probatorio

Este registro preserva la auditoría de Perplexity que el usuario pegó en la conversación, junto con las conclusiones técnicas disponibles del informe de Gemini sobre los bloques 1–5.

**El informe original completo de Gemini no está incorporado en este expediente ni estuvo disponible para cotejo literal durante la auditoría de Perplexity.** Por eso, las afirmaciones atribuidas a Gemini no pueden citarse como literales hasta recuperar el documento original. No reconstruirlo de memoria ni inventar citas.

La auditoría es documental, no implementación ni evidencia de pruebas. El estado continúa siendo `PROPOSAL — NOT IMPLEMENTED`.

## 2. Bloque 1 — Android KeyMint, version binding, rollback y atestación

### Hallazgos de Perplexity

- La documentación AOSP respalda que las autorizaciones de una clave están codificadas/verificadas en el blob de la clave, pero eso no demuestra una garantía genérica de «version binding» de datos de aplicación.
- El nombre actual de la autorización KeyMint es `Tag::ROLLBACK_RESISTANCE`; la atestación antigua puede mostrar `rollbackResistant` en versiones 1–2. No usar `TAG_ROLLBACK_RESISTANT` como si fuera el nombre actual universal.
- La resistencia a rollback se refiere al uso de claves borradas/restauradas en condiciones específicas de la implementación segura; no es protección contra todo rollback ni garantía de disponibilidad.
- La atestación expone propiedades declaradas por el KeyMint/HAL. No demuestra por sí sola integridad completa de la app, sistema operativo ni datos.
- Android Keystore/KeyMint protege material criptográfico y restricciones de uso, pero no cifra o protege automáticamente todos los datos de la aplicación.

### Fuentes citadas en la auditoría

- AOSP, Keystore features: https://source.android.com/docs/security/features/keystore/features
- AOSP, KeyMint implementer reference: https://source.android.com/docs/security/features/keystore/implementer-ref
- AOSP, key and ID attestation: https://source.android.com/docs/security/features/keystore/attestation
- Android Keystore system: https://developer.android.com/privacy-and-security/keystore

### Residuo

Verificar las propiedades reales del dispositivo objetivo mediante evidencia de atestación aplicable. Distinguir garantía de plataforma, declaración atestada y lógica que Atlas debe implementar. No afirmar que el dispositivo tiene rollback resistance sin evidencia específica.

## 3. Bloque 2 — tiempo monotónico y revocación offline

### Hallazgos de Perplexity

- `SystemClock.elapsedRealtime()` es monotónico durante el arranque actual e incluye deep sleep.
- El valor mide tiempo desde el arranque; no es persistente entre reinicios.
- La API no proporciona por sí sola una política durable de revocación offline ni un reloj confiable que sobreviva reinicios.

Fuente:
- Android SystemClock: https://developer.android.com/reference/android/os/SystemClock
- Referencia Kotlin: https://developer.android.com/reference/kotlin/android/os/SystemClock

### Residuo de diseño

Definir explícitamente:
- fuente de tiempo persistente y nivel de confianza;
- comportamiento tras reinicio;
- tratamiento de reloj alterado o no confiable;
- expiración de información de revocación;
- comportamiento sin conectividad prolongada;
- si se bloquea la función afectada cuando la revocación está caducada o es UNKNOWN.

Cualquier umbral (por ejemplo, 30 días offline) es una decisión de diseño propuesta, no una exigencia de RFC/NIST salvo que una fuente específica lo demuestre.

## 4. Bloque 3 — ISO 22320 y rutas conflictivas

### Hallazgos de Perplexity

- El alcance público de ISO 22320:2018 describe orientación de gestión de incidentes: principios, procesos, estructura, roles, recursos, coordinación e interoperabilidad.
- No se encontró respaldo para atribuir a ISO una regla concreta que obligue a bloquear rutas conflictivas.
- La coordinación entre organizaciones es parte del alcance general, pero no debe convertirse en una obligación técnica específica de Atlas sin pasaje que la respalde.

Fuentes:
- ISO 22320:2018: https://www.iso.org/standard/67851.html
- Resumen del comité ISO/TC 292: https://committee.iso.org/sites/tc292/home/sc-1-emergency-management/projects/published/iso-22320-2018-at-a-glance.html

### Residuo

La política de bloquear rutas conflictivas debe etiquetarse como decisión de diseño/operación de Atlas, con autoridad, datos geográficos y procedimiento propios. Si no hay ruta segura verificable, no inventar una ruta alternativa: declarar indisponibilidad y remitir a instrucciones oficiales locales.

## 5. Bloque 4 — POSIX rename/fsync y SQLite WAL

### Hallazgos de Perplexity

- `rename()` ofrece atomicidad del cambio de nombre/namespace dentro de sus condiciones; no demuestra por sí solo durabilidad ante fallo eléctrico.
- Un patrón de publicación durable suele requerir escribir el temporal, sincronizar el archivo, renombrar y sincronizar el directorio, sujeto a las garantías reales del sistema de archivos/plataforma.
- SQLite WAL no proporciona atomicidad conjunta entre una base SQLite y archivos externos, ni atomicidad global entre varias bases adjuntas bajo WAL.
- La durabilidad depende de configuración, checkpoints, manejo del WAL y comportamiento del almacenamiento.

Fuentes citadas:
- La auditoría citó un artículo técnico sobre consistencia tras fallos: https://arxiv.org/html/2603.01384
- SQLite WAL: https://www2.sqlite.org/matrix/wal.html
- SQLite WAL: https://www2.sqlite.org/wal.html
- SQLite atomic commit overview: https://www3.sqlite.org/matrix/atomiccommit.html

### Residuo de diseño

Definir un protocolo de publicación y recuperación de varios componentes que especifique:
- conjunto exacto de archivos/componentes;
- hashes/identidad de bundle y manifiesto;
- estados previos, publicación completa y publicación ambigua;
- recuperación tras fallo entre pasos;
- sincronización de archivos y directorios cuando corresponda;
- tratamiento del WAL y checkpoints;
- comportamiento fail-closed ante inconsistencia.

No afirmar que `rename()`, `fsync()` y SQLite WAL forman por sí solos una transacción multicomponente.

## 6. Bloque 5 — NIST SP 800-57 Part 1 Rev. 5 y recuperación de claves

### Hallazgos de Perplexity

- La sección 8.2.2.2, *Key Recovery Function*, ofrece orientación general para evaluar la necesidad de conservar o recuperar material criptográfico caso por caso.
- No se encontró respaldo para que NIST exija un quórum offline específico ni garantice recuperación mediante quórum.
- El quórum, custodia distribuida, umbrales, recuperación de emergencia y autoridad de recuperación son decisiones de arquitectura/gobernanza que necesitan su propio modelo de amenazas.

Fuente:
- NIST SP 800-57 Part 1 Rev. 5: https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-57pt1r5.pdf

### Residuo

Verificar la sección y pasaje exactos antes de usar citas literales. Presentar el quórum como opción de diseño, no como mandato o garantía de NIST.

## 7. Contradicciones y pendientes registrados

1. **KeyMint:** confusión entre nombre del tag actual y campos de atestación antiguos; resistencia de clave no equivale a protección general contra rollback de datos.
2. **Tiempo:** `elapsedRealtime()` no persiste entre reinicios.
3. **ISO:** el bloqueo de rutas no está respaldado como regla específica por el resumen oficial consultado.
4. **Persistencia:** WAL no garantiza atomicidad multicomponente.
5. **NIST:** orientación de recuperación de claves no equivale a obligación de quórum offline.
6. **Documento original de Gemini:** pendiente de recuperar para cotejar afirmaciones literales, versiones y secciones exactas.
7. **ISO 22320:** si se necesita atribución a una cláusula específica de la norma completa, se requiere acceso legítimo al texto aplicable; no inventar una cláusula a partir del resumen público.
8. **Diseño:** falta especificar reloj/expiración offline y el protocolo de recuperación multicomponente.
9. **Dispositivo objetivo:** faltan pruebas/evidencia de atestación concreta de KeyMint en el hardware de despliegue.

## 8. Regla de continuidad

- No repetir la auditoría completa sin evidencia nueva o contradicción concreta.
- Recuperar el informe original de Gemini y compararlo contra esta auditoría.
- Luego solicitar a Claude una revisión adversarial solo de residuos y contradicciones.
- Conservar `UNKNOWN`, `PARTIAL` y límites de evidencia; no convertir propuestas en garantías normativas.
- No afirmar implementación, pruebas, seguridad o preparación para despliegue.

## Estado final

`PROPOSAL — NOT IMPLEMENTED`. La auditoría de Perplexity fue aportada en conversación y se preserva aquí en forma consolidada; este documento no afirma que el original completo de Gemini esté archivado. No se reportan cambios de código ni pruebas. NCS M0 permanece separado.


## Delta de fuentes locales — 2026-10-29

### Manzanillo: mapas de tsunami y cautela de validación

Fuente municipal: https://tsunami.manzanillo.gob.mx/

El sitio de Protección Civil y Bomberos de Manzanillo presenta once zonas de evacuación, mapas, rutas y puntos de encuentro, además de material de preparación ante tsunamis. La propia página incluye una advertencia explícita: **las rutas y los puntos de encuentro están en validación comunitaria; la versión es preliminar y se debe seguir la señalización instalada en campo**.

Tratamiento para Atlas Offline:
- Guardar el enlace y los mapas como fuentes locales candidatas, no como rutas ya validadas por Atlas.
- Registrar la fecha de consulta y la versión/fecha de cada PDF descargado, si la hay.
- No inferir que todos los trazados son definitivos a partir de la existencia del portal o de los simulacros de 2026.
- Mantener la instrucción de emergencia basada en señales naturales y seguir señalización y autoridad local; la navegación sin conexión no debe sustituir las instrucciones de Protección Civil/CAT-SEMAR.
- Pendiente: extraer metadatos de los once mapas y comprobar si cada PDF declara fecha de emisión/revisión, autoridad responsable y estado de validación.

Esta evidencia no resuelve los cinco bloques técnicos del informe Gemini/Perplexity; es un hallazgo local complementario y debe permanecer separado de la revisión de KeyMint, reloj offline, conflictos de avisos, consistencia multiarchivo y recuperación de claves.


## 9. Informe original de Gemini recibido — 2026-10-29

El usuario aportó el informe de arquitectura original, bloques 1–5. Se preserva su contenido como resumen de propuesta; no equivale a verificación independiente de todas las citas ni a implementación.

### Bloque 1 — Android KeyMint y rollback resistance

Gemini afirma que TEE/StrongBox/KeyMint pueden aplicar restricciones de uso de claves relacionadas con rollback de sistema/componentes, pero que eso no garantiza integridad, estructura ni validez semántica de archivos de aplicación como PMTiles o SQLite. Propone separar la protección del almacén de claves de la lógica de datos y añadir control de versiones/anti-rollback de aplicación vinculado a firmas verificadas por claves protegidas por KeyMint.

**Reconciliación con Perplexity:** compatible en lo central. La resistencia a rollback de claves no equivale a protección general de archivos/datos. Debe evitarse el nombre genérico incorrecto `TAG_ROLLBACK_RESISTANT` cuando el tag actual es `Tag::ROLLBACK_RESISTANCE`; el campo `rollbackResistant` aparece en ciertos formatos/versiones de atestación. No asumir que el dispositivo concreto ofrece la propiedad sin evidencia de atestación del hardware objetivo.

Fuentes registradas: https://source.android.com/docs/security/features/keystore/implementer-ref ; https://source.android.com/docs/security/features/keystore/attestation ; https://developer.android.com/privacy-and-security/keystore

### Bloque 2 — reloj offline y revocación

Gemini reconoce que `SystemClock.elapsedRealtime()` es monotónico durante el arranque y no está sujeto a cambios del reloj de pared, pero reinicia su base temporal en cada reinicio. Propone marcas relativas firmadas, un umbral heurístico de caducidad (ejemplo: 30 días) y fallback a `REVOCATION_STATUS_UNKNOWN` si expira la sincronización.

**Reconciliación con Perplexity:** compatible. El umbral de 30 días es una propuesta de diseño, no un requisito de Android ni una regla normativa demostrada. Debe definirse qué ocurre después de reinicio, con estado persistente, hora manipulada y sincronización expirada; no puede tratarse `elapsedRealtime()` como reloj durable entre arranques.

Fuente: https://developer.android.com/reference/android/os/SystemClock

### Bloque 3 — avisos contradictorios, ISO 22320 y rutas

Gemini propone una matriz de autenticidad, competencia, ámbito geográfico, amenaza y vigencia; si persiste un conflicto material entre fuentes del mismo nivel, marcar el tramo `UNKNOWN` y bloquear su uso por el enrutador.

**Reconciliación con Perplexity:** no se identifica contradicción técnica central. La matriz y el bloqueo son decisiones de diseño/seguridad de Atlas; no deben atribuirse a ISO 22320 como algoritmo o mandato explícito sin cláusula verificable. La política requiere definir qué significa “mismo nivel”, autoridad para resolver conflictos, vigencia y alcance geográfico.

Fuentes: https://www.iso.org/standard/67851.html ; https://committee.iso.org/sites/tc292/home/sc-1-emergency-management/projects/published/iso-22320-2018-at-a-glance.html

### Bloque 4 — persistencia, rename/fsync, PMTiles y SQLite WAL

Gemini advierte que atomicidad de renombrado y transacciones SQLite no garantizan atomicidad global entre manifiesto, PMTiles y varias bases de datos. Propone staging, sincronización, publicación del manifiesto por rename y validación con hash SHA-256/bundle_id al reiniciar.

**Reconciliación con Perplexity:** compatible en el riesgo principal. Ajuste técnico importante: no decir que `rename()` más `fsync()` garantizan por sí solos un protocolo transaccional universal. El protocolo debe definir la secuencia y el comportamiento ante fallos; sincronizar archivos/directorios según las garantías de la plataforma, gestionar WAL/checkpoints y verificar todos los componentes antes de admitir el bundle. `bundle_id` y staging son propuestas, no implementaciones ni garantías ya demostradas.

Fuentes: https://www2.sqlite.org/matrix/wal.html ; https://www2.sqlite.org/wal.html ; https://www3.sqlite.org/matrix/atomiccommit.html

### Bloque 5 — pérdida/compromiso de K_backup y recuperación

Gemini propone separar recuperación de disponibilidad local de recuperación de confianza. Ante compromiso, exige un paquete de revocación firmado por quórum; ante pérdida completa de K_backup, conservar lectura de datos locales pero no aceptar actualizaciones no verificadas.

**Reconciliación con Perplexity:** compatible en que NIST ofrece orientación general de gestión/recuperación de claves y no impone un quórum offline específico. El quórum, los miembros, el umbral, la revocación, la rotación, la recuperación ante pérdida total y el criterio para volver a confiar son decisiones de arquitectura y gobernanza pendientes. El comportamiento de solo lectura tras pérdida/compromiso es propuesta, no una garantía implementada.

Fuente: https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-57pt1r5.pdf

### Resultado del cotejo Gemini + Perplexity

- No aparece una contradicción material que invalide el núcleo de los cinco bloques; Perplexity respalda las principales limitaciones técnicas.
- Se corrigen las atribuciones normativas: el bloqueo de rutas, 30 días offline, bundle_id, protocolo de staging y quórum son propuestas de diseño, no mandatos demostrados de ISO/NIST/Android.
- Riesgo crítico transversal: varias decisiones están formuladas como arquitectura propuesta sin evidencia de implementación ni pruebas de fallo/recuperación.
- Pendientes: atestación real del dispositivo objetivo; política temporal durable y caducidad; reglas de autoridad/conflicto de avisos; protocolo reproducible de publicación/recuperación multicomponente; modelo de amenaza y gobernanza de quórum.
- Estado sigue `PROPOSAL — NOT IMPLEMENTED`. No se ha inspeccionado el hardware objetivo, ejecutado pruebas de persistencia ni probado recuperación de claves.


## 10. Verificación técnica focalizada adicional de Perplexity — 2026-10-29

Este delta aporta precisión a los cinco bloques; no reabre la auditoría general ni demuestra implementación.

1. **KeyMint / rollback resistance — PARCIAL.** La verificación focalizada especifica que `Tag::ROLLBACK_RESISTANCE` protege frente a la reutilización de claves borradas/restauradas en las condiciones de implementación segura, con posible dependencia de almacenamiento protegido como RPMB; la creación puede fallar si el almacenamiento protegido está lleno. La atestación no prueba integridad completa del dispositivo ni de datos de aplicación. En el expediente se mantiene la distinción entre el tag actual y el campo de atestación `rollbackResistant`; para evitar generalizar entre formatos, verificar la versión concreta de atestación antes de describir el campo. Fuente primaria: https://source.android.com/docs/security/features/keystore/implementer-ref

2. **Reloj / revocación offline — CONFIRMADO como límite.** La documentación de `AlarmManager` confirma además que las alarmas basadas en `ELAPSED_REALTIME` usan tiempo desde el arranque y se eliminan al apagar/reiniciar. Esto refuerza que `elapsedRealtime()` solo sirve para intervalos dentro del arranque actual y no resuelve caducidad durable por sí solo. Fuente: https://developer.android.com/reference/kotlin/android/app/AlarmManager

3. **ISO 22320 / bloqueo de rutas — CONFIRMADO como límite de atribución.** La evidencia primaria pública consultada describe gestión de incidentes y cooperación interorganizacional, no un requisito específico de bloqueo automático de rutas. Mantener el bloqueo como política propia de Atlas, con autoridad, ámbito y reglas de conflicto definidos; no atribuirlo a ISO sin cláusula comprobada.

4. **Persistencia multiarchivo — CONFIRMADO como límite.** SQLite WAL no da atomicidad de conjunto entre bases adjuntas ni entre una base y archivos externos. `rename()` no basta para durabilidad; el orden de sincronización y las garantías concretas dependen del sistema de archivos/plataforma. El protocolo de manifiesto, journal/estados, verificación de hashes y recuperación sigue pendiente de especificación y pruebas.

5. **NIST / quórum offline — CONFIRMADO como límite de atribución.** La sección 8.2.2.2 de SP 800-57 Part 1 Rev. 5 trata la función de recuperación de claves y evaluación caso por caso; no prescribe quórum offline. El quórum puede elegirse por diseño, pero exige modelo de amenazas, custodia, umbral, pérdida/compromiso y recuperación.

**Resultado:** la revisión focalizada de Perplexity no presenta una contradicción material nueva con Gemini ni con el expediente previo; agrega precisión sobre borrado/rollback de claves y pérdida de alarmas tras reinicio. Las decisiones arquitectónicas permanecen propuestas. Estado global: `PROPOSAL — NOT IMPLEMENTED`; no se modificó código, no se ejecutaron pruebas y NCS M0 sigue fuera de alcance.


## 11. Revisión adversarial provisional de Claude — 2026-10-29

**Alcance y límite:** Claude informa que revisó los tres expedientes y el issue #109 por extracción, no como texto bruto completo; además considera la revisión provisional porque faltaba completar la secuencia de tareas A–D. No es cierre definitivo. No se modificó código ni NCS M0.

### Riesgos y ajustes de clasificación

1. **Revocación offline, reinicio y rollback — riesgo de diseño abierto.** Claude confirma que `elapsedRealtime()` no persiste entre reinicios y que aún no está cerrada la política de expiración. El riesgo de aceptar manifiestos/listas de revocación obsoletos después de reiniciar es hipotético, pero material si la aplicación falla en modo abierto. La política de rechazo ante revocación expirada/reloj desconocido debe definirse explícitamente; el ejemplo de 30 días sigue siendo propuesta, no requisito de plataforma.

2. **ISO 22320 — limitar la afirmación normativa.** La página pública de alcance no basta para concluir qué cláusulas contiene el texto completo de una norma de pago. La evidencia disponible no demuestra que ISO 22320 exija bloqueo automático de rutas, pero la formulación fuerte “la norma no respalda/no contiene” queda UNKNOWN hasta revisar el texto completo o una fuente normativa autorizada con cláusulas. Por ahora, atribuir el bloqueo a una política propia de Atlas y no a ISO.

3. **NIST SP 800-57 Rev. 5 §8.2.2.2 — verificación del cuerpo pendiente.** Claude pudo confirmar el título de la sección en el índice, pero no leer el cuerpo. Aunque Perplexity informa haber verificado la sección y concluye que no prescribe quórum offline, la evidencia incorporada en este expediente no debe elevarse a certeza normativa hasta cotejar directamente el texto de la sección. Estado de la afirmación “NIST no exige quórum offline”: UNKNOWN en esta revisión adversarial, no una contradicción probada. Mantener el quórum como propuesta de diseño sin atribuirlo a NIST.

4. **KeyMint en el dispositivo objetivo — UNKNOWN.** La documentación de plataforma no demuestra que el teléfono de despliegue concreto tenga una configuración/atestación que soporte la propiedad requerida. La atestación y la capacidad real deben verificarse en el dispositivo objetivo antes de confiar en ellas.

5. **Persistencia multiarchivo — límite técnico documental conservable, protocolo sin cierre.** La documentación SQLite WAL respalda que no hay atomicidad conjunta entre múltiples bases bajo WAL ni entre bases y archivos externos. El protocolo de publicación, sincronización y recuperación sigue pendiente de especificación y pruebas. No declarar que staging, `fsync`, `rename` o `bundle_id` ya garantizan recuperación.

### Estado provisional de cierre

- Se puede cerrar como decisión de diseño que el bloqueo de rutas conflictivas es una política de Atlas; no atribuirla a ISO 22320 sin cláusula verificada.
- Mantener abiertas: política fail-closed ante revocación expirada/reloj desconocido; evidencia KeyMint del dispositivo objetivo; protocolo multiarchivo; modelo de amenaza y gobernanza de recuperación/quórum.
- ISO 22320 y NIST SP 800-57: afirmaciones normativas específicas permanecen UNKNOWN hasta comprobar el texto completo relevante.
- Estado global: `PROPOSAL — NOT IMPLEMENTED`. Sin implementación ni pruebas.


## 12. Revisión adversarial final de Claude — 2026-10-29

**Límite de evidencia:** esta revisión se basa en extracción documental y no incluye el informe original de Gemini; por tanto, no permite un contraste literal con Gemini. Claude tampoco pudo leer directamente el cuerpo de las referencias Android de KeyMint/SystemClock ni el cuerpo de NIST §8.2.2.2. SQLite se contrastó mediante un espejo documental. La etiqueta “final” describe esta ronda de revisión, no el cierre de los riesgos.

### Hallazgos consolidados

1. **KeyMint / rollback — PARTIAL; dispositivo objetivo UNKNOWN.** La resistencia a rollback de claves no debe tratarse como garantía de version binding o anti-rollback de bundles, bases de datos y archivos de Atlas. La capacidad concreta del dispositivo y la atestación exigida para despliegue siguen sin evidencia. Decisiones pendientes: mecanismo anti-rollback propio y si la atestación específica es condición obligatoria de despliegue. No afirmar que el texto Android quedó verificado directamente en esta ronda.

2. **Revocación offline tras reinicio — laguna de diseño CONFIRMADA; detalle de plataforma PARTIAL.** `elapsedRealtime()` no ofrece continuidad temporal entre reinicios. Sin política explícita, una lista antigua podría aceptarse por error como vigente. Pendiente definir estado al reiniciar sin reloj confiable, funciones que se bloquean con revocación caducada/UNKNOWN y criterio de recuperación. El umbral de 30 días sigue siendo una propuesta, no requisito de Android. El fail-closed debe especificar qué funciones se degradan o bloquean; no basta con una etiqueta abstracta.

3. **Avisos/rutas contradictorias — política Atlas; atribución normativa UNKNOWN.** No atribuir a ISO 22320 una regla de bloqueo sin cláusula verificable. La revisión del alcance público no permite afirmar qué exige el texto completo de la norma. Decisión pendiente: bloquear ante conflicto o mostrar ambas fuentes con fecha/procedencia; definir autoridad prevalente y evitar dejar al usuario sin información accionable. La señalización física y las instrucciones vigentes de Protección Civil son candidatas de prioridad operativa, pero la jerarquía exacta debe documentarse y validarse localmente.

4. **Bundle multiarchivo — límite técnico documentado; protocolo UNKNOWN.** WAL no garantiza atomicidad de conjunto entre bases/archivos externos, y `rename()` no constituye por sí solo un protocolo durable de commit. Una caída podría dejar manifiesto y datos en versiones distintas. Como propuesta por evaluar —no decisión aprobada— Claude sugiere un único punto de commit, recuperación al último bundle íntegro verificado o a estado “sin datos”, y considerar `synchronous=FULL` si se usa SQLite. La durabilidad real sigue dependiendo del sistema de archivos, plataforma y hardware; requiere especificación y pruebas de fallos.

5. **K_backup / recuperación de claves — NO CUBIERTO; UNKNOWN.** El expediente previo no define suficientemente la existencia, propósito, custodia, recuperación, rotación ni revocación de `K_backup` ante compromiso. Antes de decidir quórum hay que definir modelo de amenazas, autoridades y procedimiento de pérdida/compromiso. El quórum es una decisión de gobernanza/arquitectura; no afirmar conformidad con NIST mientras no se verifique el cuerpo pertinente de SP 800-57 §8.2.2.2. Mantener este tema separado de NCS M0.

### Decisiones pendientes para cierre Atlas

- Estado y permisos tras reinicio con reloj/revocación desconocidos; caducidad offline.
- Anti-rollback de datos y criterio de atestación del dispositivo.
- Resolución de avisos contradictorios sin dejar al usuario sin orientación segura.
- Protocolo de commit, validación de integridad y recuperación de bundle multiarchivo.
- Ciclo de vida y gobernanza de `K_backup`.
- Verificación directa del texto relevante de Android, NIST y, si se requiere una afirmación normativa, ISO 22320.
- Recuperar/incorporar el original de Gemini para contraste literal, no reconstruirlo desde resúmenes de terceros.

**Estado global:** `PROPOSAL — NOT IMPLEMENTED`. No hay implementación ni pruebas acreditadas. NCS M0 no se modificó.


## 13. Informe original de arquitectura Gemini — bloques 1–5 (aportado por el usuario, 2026-10-29)

**Estado:** `PROPOSAL — NOT IMPLEMENTED`. El texto original completo de los cinco bloques se ha recibido en la conversación y queda consolidado a continuación como referencia primaria de la propuesta arquitectónica. Esto resuelve la limitación previa de Claude sobre no disponer del original para contraste literal; no implica que las afirmaciones normativas o técnicas hayan sido verificadas independientemente.

### Bloque 1 — Android KeyMint y Rollback Resistance

- **Fuentes citadas por el informe:** AOSP, Android Keystore y KeyMint (`TAG_ROLLBACK_RESISTANT`).
- **Tesis:** la resistencia a rollback de claves del hardware seguro (TEE/StrongBox) no garantiza integridad ni ausencia de rollback de datos arbitrarios de la aplicación, como PMTiles o SQLite.
- **Incertidumbre:** soporte de hardware variable entre fabricantes/dispositivos.
- **Propuesta:** control de versiones y anti-rollback a nivel de aplicación, vinculado a firmas verificadas con claves protegidas por KeyMint.
- **Condición pendiente:** precisar la semántica exacta de los tags/campos según versión de Android/atestación y verificar el dispositivo objetivo. No afirmar que KeyMint por sí mismo valida los datos de Atlas.

### Bloque 2 — Reloj offline, `elapsedRealtime()` y revocación

- **Fuente citada:** documentación Android SDK de `SystemClock`.
- **Tesis:** `elapsedRealtime()` es monotónico y útil para medir intervalos desde el arranque, pero no mantiene continuidad tras reiniciar.
- **Incertidumbre:** reinicios o cortes de energía durante periodos offline.
- **Propuesta:** marcas relativas firmadas en el manifiesto, umbral heurístico propuesto de 30 días y estado `REVOCATION_STATUS_UNKNOWN` si expira la sincronización sin validar la red.
- **Condición pendiente:** un timestamp relativo firmado no establece por sí solo cuánto tiempo real transcurrió entre reinicios. Definir explícitamente el estado post-reinicio, caducidad, funciones permitidas/bloqueadas y recuperación. Los 30 días son una decisión propuesta, no un requisito de Android.

### Bloque 3 — Avisos contradictorios, ISO 22320 y bloqueo de rutas

- **Fuente citada:** ISO 22320:2018.
- **Tesis:** se propone una matriz de autenticidad, competencia, ámbito, amenaza y vigencia; un conflicto material no resuelto marcaría el segmento `UNKNOWN` y bloquearía su uso por el enrutador.
- **Incertidumbre:** directivas oficiales contradictorias o desactualizadas durante una emergencia.
- **Condición pendiente:** la revisión adversarial no dispone del texto completo de ISO para validar las atribuciones normativas. Tratar la matriz y el bloqueo como política propia de Atlas, no como algoritmo prescrito por ISO. Definir jerarquía de autoridad, procedencia/fecha visible y conducta del producto para evitar dejar al usuario sin orientación segura.

### Bloque 4 — Persistencia, `rename`/`fsync`, PMTiles y SQLite WAL

- **Fuentes citadas:** POSIX.1-2008 y documentación SQLite WAL.
- **Tesis:** las garantías de una operación sobre un archivo y las transacciones de una base no crean atomicidad global entre múltiples bases y archivos externos.
- **Propuesta:** directorio `.stage/`, sincronización explícita, SQLite `PRAGMA synchronous = FULL`, reemplazo atómico del manifiesto y validación de un `bundle_id` basado en SHA-256 tras reiniciar.
- **Condición pendiente:** propuesta aún no especificada ni probada. Un hash verifica coincidencia/integridad respecto al manifiesto de confianza, pero no demuestra por sí solo que el manifiesto sea auténtico, vigente o consistente con una publicación completa. Definir el punto único de commit, orden de escritura/sincronización, autenticidad del manifiesto, recuperación tras cada posible interrupción y comportamiento cuando no haya un bundle íntegro. No prometer durabilidad universal en SD/USB ni en hardware no verificado.

### Bloque 5 — Pérdida/compromiso de `K_backup` y recuperación de claves

- **Fuente citada:** NIST SP 800-57 Part 1 Rev. 5.
- **Tesis:** separar recuperación de disponibilidad local (leer datos existentes) de recuperación de confianza (aceptar actualizaciones nuevas); preservar lectura local tras pérdida de clave y rechazar actualizaciones no verificadas.
- **Propuesta:** ante compromiso, paquete de revocación firmado por quórum; ante pérdida, mantener funcionalidad local sin reinicio destructivo.
- **Condición pendiente:** definir si `K_backup` existe en la arquitectura prevista, propósito, custodios, autoridad de recuperación, revocación/rotación, composición y umbral del quórum, y tratamiento si el quórum o la conectividad son inaccesibles. No afirmar conformidad con NIST ni atribuirle un quórum obligatorio sin verificar el texto normativo aplicable.

### Contraste con la revisión adversarial final de Claude

El informe original confirma que los cinco temas ya estaban planteados como propuestas e incertidumbres; no resuelve por sí solo los riesgos que Claude dejó abiertos. Se mantienen como decisiones pendientes: anti-rollback de datos; estado y permisos tras reinicio; resolución de avisos contradictorios; protocolo de commit/recuperación del bundle; ciclo de vida de `K_backup`. El texto original queda incorporado para permitir contraste literal futuro.

**Sin cambios de código ni pruebas acreditadas.** Estado global `PROPOSAL — NOT IMPLEMENTED`; NCS M0 permanece fuera de alcance.
