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


## 14. Matriz de decisiones y criterios de aceptación — propuesta de cierre documental (2026-10-29)

**Estado:** `PROPOSAL — NOT IMPLEMENTED`. Esta matriz organiza decisiones y define cómo podrían verificarse; no constituye aprobación de autoridad, implementación ni evidencia de pruebas. Los criterios son propuestas para revisión, no requisitos externos atribuidos a Android, ISO o NIST.

| ID / bloque | Evidencia actualmente aceptada | Decisión pendiente | Criterio de aceptación verificable propuesto | Estado |
|---|---|---|---|---|
| A1 — KeyMint, claves | La protección/rollback de claves no equivale a integridad anti-rollback de archivos arbitrarios de Atlas. El soporte concreto del dispositivo no está probado. | ¿La atestación de hardware será requisito de despliegue? ¿Qué hacer si no está disponible o falla? | Documento de compatibilidad por dispositivo/versión; evidencia de atestación capturada y validada en el dispositivo objetivo; prueba negativa de que una clave ausente/no atestada no se trata como hardware validado. | PARTIAL; dispositivo UNKNOWN |
| A2 — Anti-rollback de datos | La propuesta Gemini exige control de versión de aplicación ligado a firmas verificadas; no hay implementación acreditada. | Definir contador/versión monotónica protegida, estado confiable y recuperación ante restauración de copia antigua. | Con un bundle válido V2 instalado, restaurar V1 debe rechazarse; una firma inválida, versión inferior, manifiesto ausente o estado de versión inconsistente debe resultar en rechazo explícito, sin marcar el bundle como vigente. Probar además instalación inicial y actualización legítima. | DECISIÓN ABIERTA |
| A3 — Tiempo tras reinicio | `elapsedRealtime()` mide desde el arranque y no ofrece continuidad entre reinicios. El umbral de 30 días es heurístico propuesto. | Definir reloj confiable, expiración, comportamiento post-reinicio y funciones disponibles con `REVOCATION_STATUS_UNKNOWN`. | Matriz de estados documentada para: mismo arranque, reinicio con reloj confiable/no confiable, expiración alcanzada, lista ausente/corrupta y sincronización exitosa. Cada caso debe indicar explícitamente operaciones permitidas/bloqueadas; nunca etiquetar una revocación caducada/desconocida como válida. Pruebas de reloj adelantado/atrasado y reinicio. | LAGUNA CONFIRMADA; política ABIERTA |
| A4 — Avisos/rutas | La matriz de autenticidad, competencia, ámbito, amenaza y vigencia es propuesta de Atlas; no se verificó una regla equivalente en el texto completo de ISO 22320. | Definir precedencia de fuentes y respuesta a conflicto irresoluble, incluyendo cómo informar al usuario sin presentar certeza falsa. | Tabla de precedencia aprobada por autoridad responsable; cada aviso almacena fuente, firma/autenticidad cuando proceda, autoridad, ámbito, hora/validez y versión. Un conflicto material no resuelto no puede generar una ruta presentada como verificada; la interfaz muestra el conflicto, procedencia y alternativa segura validada, o indica claramente que no puede calcular una ruta segura. | DISEÑO ABIERTO; ISO UNKNOWN |
| A5 — Publicación del bundle | `rename()` y transacciones SQLite/WAL individuales no dan atomicidad global entre bases y archivos externos. `bundle_id` por hash no autentica por sí solo el manifiesto. | Definir punto único de commit, orden de sincronización, firma del manifiesto, recuperación y comportamiento si ningún bundle íntegro existe. | Especificación de estados/commit y autenticidad del manifiesto; hash de cada componente y del bundle recalculado antes de activar; tras inyectar corte en cada paso, el sistema arranca con el bundle completo anterior, el nuevo completo validado o estado explícito “sin bundle válido”, nunca con una mezcla silenciosa. Probar WAL/configuración de sincronización y plataforma de almacenamiento objetivo. | LÍMITE DOCUMENTADO; PROTOCOLO UNKNOWN |
| A6 — `K_backup` | El informe propone separar lectura local de recuperación de confianza. No está aclarado si `K_backup` existe ya como componente implementado. | Definir existencia/propósito, custodios, autoridades, umbral de quórum, pérdida, compromiso, revocación, rotación y operación aislada. | Especificación de ciclo de vida con escenarios separados de pérdida, sospecha de compromiso, compromiso confirmado, custodio inaccesible, quórum no disponible y dispositivo offline permanente. Debe indicar qué datos locales siguen legibles y qué actualizaciones quedan rechazadas; la recuperación de confianza exige una cadena verificable independiente. Pruebas de cada escenario antes de declarar listo. | NO CUBIERTO; UNKNOWN |
| A7 — Fuentes normativas | El texto completo pertinente de ISO 22320 y NIST SP 800-57 §8.2.2.2 no se verificó directamente en la revisión final de Claude. | Determinar si se necesitan afirmaciones de conformidad normativa y, en tal caso, quién las valida. | Registrar edición, cláusula/página exacta, cita/paráfrasis y alcance de cada afirmación; si el texto no está disponible o no se verifica, mantener UNKNOWN y no declarar conformidad. | UNKNOWN |

### Orden de resolución recomendado

1. **Aclarar límites de confianza y amenazas:** A1, A2 y A6 (claves, anti-rollback de datos y recuperación de confianza).
2. **Definir operación segura offline:** A3 y A4 (reinicio/revocación y avisos/rutas).
3. **Especificar consistencia y recuperación:** A5 (publicación multiarchivo).
4. **Verificar atribuciones normativas:** A7, sin retrasar decisiones de diseño que pueden formularse sin afirmar conformidad.
5. Convertir cada criterio en pruebas de aceptación reproducibles solo tras aprobar alcance, dispositivo/plataforma y autoridad de diseño. Hasta entonces, no ejecutar efectos protegidos ni declarar la arquitectura implementada.

### Condiciones de salida documental propuestas

Atlas no debe pasar a estado “arquitectura cerrada” hasta que cada decisión A1–A7 tenga: (a) responsable/autoridad identificada, (b) decisión explícita o justificación de UNKNOWN, (c) criterio de aceptación aprobado, (d) evidencia enlazada cuando se alegue verificación y (e) riesgos residuales documentados. El cierre documental no equivale a implementación, seguridad demostrada ni pruebas superadas.

**Sin cambios de código ni pruebas ejecutadas.** NCS M0 permanece fuera de alcance.


## 15. Resolución técnica propuesta — primera pasada de límites de confianza (2026-10-29)

**Estado:** PROPOSAL — NOT APPROVED — NOT IMPLEMENTED. Este delta desarrolla A1, A2 y A6 en el orden recomendado. No aprueba autoridad, custodia, quórum ni despliegue; no acredita hardware ni pruebas.

### Principio común

Separar y nombrar tres propiedades que no son intercambiables:

1. **Integridad/autenticidad:** los bytes y el manifiesto coinciden con una firma/cadena de confianza aceptada.
2. **Frescura/no rollback:** la versión aceptada no es anterior a una versión que el sistema ya haya reconocido como más reciente.
3. **Disponibilidad/recuperabilidad:** existen datos legibles y un camino de recuperación.

Una firma válida o un hash válido, por sí solos, no prueban frescura. Una copia local legible no demuestra que siga siendo confiable. La indisponibilidad de una autoridad no autoriza a inventar una validación.

### A1 — KeyMint y atestación del dispositivo

**Recomendación técnica provisional**
- Tratar KeyMint/Keystore como protección del material de clave y de las operaciones autorizadas, no como anti-rollback automático de PMTiles, SQLite, manifiestos o archivos arbitrarios.
- Antes de declarar capacidades de hardware, identificar el dispositivo/versión objetivo y capturar evidencia de atestación verificable; documentar exactamente qué propiedad acredita y qué queda fuera.
- Si la atestación está ausente, falla o no puede verificarse, el sistema no debe mostrar el dispositivo como HARDWARE-ATTESTED. Puede existir un modo degradado de lectura/verificación criptográfica local, pero no debe elevar sus garantías ni habilitar una operación que requiera explícitamente la propiedad ausente.
- No convertir la atestación en requisito universal de toda lectura offline sin una decisión de producto/autoridad; decidir por separado qué operaciones exigen qué garantía.

**Decisión que sigue abierta a la autoridad responsable**
- ¿La atestación es requisito de despliegue para alguna o todas las funciones de confianza elevada?
- ¿Qué funciones quedan disponibles si el dispositivo no ofrece una atestación verificable?

**Criterio de aceptación propuesto**
- Matriz dispositivo/versión/capacidad, con evidencia verificable.
- Casos negativos: atestación ausente, inválida, no verificable o con propiedades inferiores a las requeridas; ninguno puede ser presentado como hardware validado.
- Pruebas sobre el hardware real antes de afirmar compatibilidad. En este expediente aún no se han ejecutado.

### A2 — Anti-rollback de datos Atlas

**Recomendación técnica provisional**
- Verificar firma del manifiesto y hashes de cada componente antes de activar un bundle; registrar por separado signature_valid, integrity_valid y freshness_valid.
- El manifiesto firmado debe incluir al menos identidad de bundle, secuencia/versionado monotónico definido, versión de esquema y hashes de todos los componentes obligatorios. La firma autentica el contenido firmado, pero no prueba que sea la versión más reciente.
- El último número de secuencia aceptado debe residir en un ancla de confianza que no pueda restaurarse junto con la copia de datos que se intenta rechazar. La tecnología concreta de esa ancla queda UNKNOWN hasta verificar las capacidades del dispositivo/plataforma.
- Si no existe un ancla anti-rollback verificable, declarar explícitamente que el sistema solo valida autenticidad/integridad, no frescura fuerte contra restauración completa de una copia antigua. No presentar un contador guardado en el mismo almacenamiento restaurable como protección suficiente.
- Ante secuencia inferior, estado de secuencia inconsistente, firma inválida o componente faltante/corrupto: no activar el bundle; conservar lectura del último bundle íntegro ya aceptado solo si su estado confiable sigue disponible. Si no puede determinarse cuál es el último confiable, mostrar NO_VERIFIABLE_BUNDLE y no inventar confianza.

**Decisiones que siguen abiertas**
- Qué ancla de frescura puede usarse en el dispositivo objetivo y si requiere hardware específico, autoridad externa o una combinación.
- Qué funciones deben bloquearse cuando solo se puede demostrar integridad, pero no frescura.
- Cómo recuperar el estado monotónico perdido sin permitir que una copia antigua se convierta silenciosamente en vigente.

**Criterio de aceptación propuesto**
- Con V2 aceptado, restaurar únicamente los archivos V1 se rechaza.
- Restaurar juntos V1 y todo estado local que pretenda anclar la versión debe probarse como caso separado; si el diseño no puede detectarlo, la limitación se declara, no se oculta.
- Firma inválida, versión inferior, manifiesto ausente, componente inconsistente y ancla ausente/corrupta producen estados explícitos y no activación silenciosa.
- Instalación inicial y actualización legítima se prueban en el dispositivo y almacenamiento objetivo. Ninguna de estas pruebas está ejecutada.

### A6 — K_backup y recuperación de confianza

**Recomendación técnica provisional**
- No asumir que K_backup ya existe como componente real: su existencia e implementación son UNKNOWN.
- Si se confirma como requisito, definir su propósito exacto antes de elegir mecanismo: copia de disponibilidad, clave de descifrado, clave de firma, autoridad de recuperación o combinación. No reutilizar una sola etiqueta para funciones criptográficas distintas.
- Separar tres flujos: (a) pérdida de una clave sin evidencia de compromiso, (b) compromiso confirmado o sospechado, (c) pérdida de todos los medios de recuperación. Cada flujo requiere política propia.
- La lectura de datos locales puede preservarse solo cuando la integridad y las condiciones de uso sigan siendo verificables; nunca convertir “se puede leer” en “está vigente y confiable”.
- Rechazar actualizaciones que no encadenen a una autoridad de confianza válida. La revocación/rotación requiere un mecanismo autenticado; si el sistema está permanentemente offline, documentar que no puede conocer revocaciones futuras que nunca recibió.
- No fijar todavía número de custodios, umbral de quórum, identidades ni autoridad de sucesión. Son decisiones de gobernanza del propietario, no consecuencias técnicas automáticas de NIST.

**Decisiones reservadas a la autoridad responsable**
- Confirmar si K_backup debe existir y qué protege.
- Nombrar custodios/autoridades y aprobar el umbral de recuperación, separación de funciones y reglas de rotación/revocación.
- Aprobar qué capacidades siguen disponibles ante pérdida, compromiso o inaccesibilidad de la recuperación.

**Criterio de aceptación propuesto**
- Modelo de amenazas y tabla de escenarios: pérdida, sospecha/confirmación de compromiso, custodio inaccesible, quórum no disponible, rotación, revocación y dispositivo permanentemente offline.
- Para cada escenario: autoridad que puede actuar, prueba criptográfica requerida, datos legibles, operaciones bloqueadas y ruta de recuperación.
- Pruebas negativas: una actualización sin cadena de confianza válida nunca se acepta; la recuperación no puede restaurar silenciosamente una clave/versión revocada.
- Ninguna autoridad, custodia ni quórum se considera aprobado por este documento.

### Resultado de esta primera pasada

- **Recomendación técnica:** distinguir autenticidad, frescura y disponibilidad; nunca inferir una de otra.
- **A1:** política de atestación por capacidad, pendiente de decisión de despliegue y prueba del hardware objetivo.
- **A2:** anti-rollback fuerte requiere un ancla de frescura independiente del conjunto de datos restaurable; si no se dispone de ella, declarar la limitación.
- **A6:** confirmar existencia y función de K_backup antes de diseñar su ciclo de vida; custodios/quórum siguen reservados a autoridad.
- **Siguiente paso del orden:** convertir las decisiones abiertas de A1/A2/A6 en una lista breve de decisiones del propietario y después pasar a A3/A4. No iniciar código ni pruebas hasta que el alcance y el entorno objetivo estén aprobados.

**Sin cambios de código ni pruebas ejecutadas.** El estado global continúa PROPOSAL — NOT IMPLEMENTED; NCS M0 permanece fuera de alcance.


## 16. Operación offline: revocación, reinicio y avisos contradictorios (A3/A4) — propuesta (2026-10-29)

**Estado:** PROPOSAL — NOT APPROVED — NOT IMPLEMENTED. Se define una política candidata y sus estados observables para revisión; no se afirma que exista código ni que haya sido probada. Los plazos de caducidad, la jerarquía de autoridades y las funciones protegidas requieren aprobación explícita.

### A3 — Modelo de estados para confianza offline

#### Estados propuestos

- **TRUST_CURRENT:** firma/cadena de confianza válida; manifiesto y componentes íntegros; versión no inferior al ancla de frescura disponible; información de revocación dentro de la política de vigencia aprobada.
- **TRUST_STALE:** la última información de revocación verificada ha superado su periodo de vigencia, o no puede demostrarse que siga vigente.
- **REVOCATION_STATUS_UNKNOWN:** no se dispone de información de revocación verificable suficiente, por ejemplo por ausencia, corrupción, reinicio con tiempo no confiable o estado persistente inconsistente.
- **TRUST_REVOKED:** existe evidencia autenticada y verificable de que una clave, autoridad, paquete o versión fue revocada.
- **BUNDLE_INVALID:** firma, manifiesto, hash, versión o componente obligatorio no pasa la validación.
- **NO_VERIFIABLE_BUNDLE:** no existe un bundle íntegro cuya cadena de confianza y estado puedan verificarse.

Estos estados no deben colapsarse en un único booleano. TRUST_STALE y REVOCATION_STATUS_UNKNOWN no significan que se haya probado un compromiso; significan que no se puede confirmar el estado actual de confianza. TRUST_REVOKED requiere evidencia autenticada, no una mera falta de conexión.

#### Tabla candidata de transición y operación

| Evento/condición | Estado resultante propuesto | Comportamiento mínimo propuesto |
|---|---|---|
| Arranque normal; firma, integridad, frescura y revocación verificadas dentro de política | TRUST_CURRENT | Permitir solo las funciones autorizadas para este nivel de confianza. |
| Reinicio; no existe una fuente de tiempo confiable que permita calcular vigencia entre arranques | REVOCATION_STATUS_UNKNOWN o TRUST_STALE | No declarar vigente la revocación. Permitir, como máximo, lectura local de datos ya verificados cuando su integridad y uso seguro sigan siendo demostrables; bloquear actualización de confianza, aceptación de claves nuevas y otras operaciones que dependan de estado actual. |
| La lista/paquete de revocación está ausente o corrupto | REVOCATION_STATUS_UNKNOWN | No sustituirla por “sin revocaciones”. Mantener bloqueadas las operaciones que necesitan estado de revocación actual. |
| Periodo de vigencia aprobado expiró sin sincronización verificable | TRUST_STALE | No renovar vigencia usando solo reloj de pared no confiable o tiempo monotónico de un arranque anterior. |
| Evidencia autenticada de revocación aplicable | TRUST_REVOKED | Rechazar el material revocado; no reactivarlo por restaurar una copia antigua. |
| Firma, hash o manifiesto inválido | BUNDLE_INVALID | No activar el bundle. Conservar un bundle previo únicamente si su propia confianza sigue verificable. |
| Ningún bundle disponible puede verificarse | NO_VERIFIABLE_BUNDLE | Informar claramente que no hay datos confiables verificables; no fabricar una ruta ni afirmar que la copia local es segura. |
| Sincronización autenticada satisfactoria y estado consistente | Recalcular estado | Actualizar únicamente tras verificar firma, cadena, secuencia, revocación y componentes completos. |

#### Política de tiempo: límites explícitos

- elapsedRealtime() puede medir intervalos dentro del mismo arranque, pero no determina por sí solo cuánto tiempo real transcurrió entre reinicios.
- Un timestamp firmado acredita que un emisor firmó ese valor; no hace confiable el reloj local ni prueba que el tiempo transcurrido desde su emisión sea conocido.
- Un plazo como 30 días solo puede fijarse tras analizar el modelo de amenazas y las consecuencias de datos de revocación antiguos. No se adopta aquí ningún plazo.
- Si la plataforma no ofrece reloj confiable entre reinicios y no hay autoridad externa disponible, el sistema debe expresar la incertidumbre. No puede prometer simultáneamente disponibilidad offline indefinida y conocimiento de revocaciones futuras.
- El comportamiento exacto tras reinicio depende de qué funciones se intenten usar; evitar un bloqueo total indiscriminado, pero tampoco elevar a vigente un estado que no puede comprobarse.

#### Decisiones pendientes de autoridad

1. Periodo máximo de vigencia de revocación y quién lo determina.
2. Operaciones permitidas por estado, especialmente lectura de mapas, navegación, publicación de bundles y aceptación/rotación de claves.
3. Si alguna función requiere sincronización reciente obligatoria.
4. Qué fuente temporal se considera confiable y cómo se recupera la confianza tras reinicio.
5. Qué autoridad emite, firma, distribuye y revoca listas/paquetes de revocación.

### A4 — Conflictos de avisos y rutas

#### Regla candidata de seguridad

- Cada aviso debe conservar procedencia, autoridad emisora, ámbito geográfico, amenaza, hora de emisión, vigencia, versión y evidencia de autenticidad cuando exista.
- La comparación no debe basarse solo en “más reciente” ni solo en una puntuación numérica. La autoridad competente para la amenaza y el área, la aplicabilidad geográfica, la autenticidad y la vigencia deben evaluarse por separado.
- Si dos avisos materialmente incompatibles no pueden ordenarse mediante una regla previamente aprobada, marcar el área/tramo afectado como CONFLICT_UNRESOLVED. No presentar una ruta que dependa de ese tramo como “segura” o “verificada”.
- La interfaz debe mostrar el conflicto, la procedencia y la hora de cada aviso, y comunicar qué no se pudo verificar.
- Si existe una alternativa cuya seguridad esté respaldada por una fuente competente y vigente, puede mostrarse con su procedencia y límites. Si no existe una alternativa verificada, declarar que Atlas no puede calcular una ruta segura y mostrar instrucciones oficiales generales que sí estén verificadas; no inventar desvíos.
- Las señales físicas de evacuación y las instrucciones de autoridades locales competentes pueden ser críticas, pero la jerarquía exacta y el tratamiento de contradicciones deben validarse localmente. No afirmar que ISO 22320 prescribe este algoritmo.

#### Precedencia candidata (requiere validación local)

1. Instrucción auténtica y vigente de la autoridad legalmente competente para esa amenaza y zona.
2. Instrucción auténtica y vigente de otra autoridad oficial con competencia aplicable, cuando no contradiga una orden superior identificada.
3. Fuente oficial secundaria o agregador, solo si conserva procedencia, vigencia y alcance comprobables.
4. Reporte no oficial o crowdsourced: señal complementaria; no puede por sí solo invalidar una orden oficial verificada ni certificar una ruta como segura.

Esta lista es una hipótesis de diseño, no una determinación legal universal. Si no puede demostrarse competencia, autenticidad, vigencia o ámbito, la fuente no debe recibir precedencia por simple etiqueta de “oficial”.

#### Criterios de aceptación propuestos para A4

- Pruebas con avisos compatibles, incompatibles, caducados, fuera de zona, sin firma/verificación, con autoridad desconocida y con timestamps contradictorios.
- Un conflicto material no resuelto nunca produce una ruta etiquetada como verificada/segura a través del tramo afectado.
- La interfaz conserva y muestra la procedencia/tiempo de los avisos relevantes, sin ocultar incertidumbre.
- La prueba incluye el caso de no existir alternativa segura conocida: el resultado debe ser “no se puede verificar una ruta segura”, no una ruta inventada.
- La política de precedencia requiere revisión de una autoridad local competente antes de usarse en una emergencia real.

### Decisiones del propietario/autoridad aún necesarias

- Aprobar o modificar los estados y la tabla de operaciones de A3.
- Definir la caducidad de revocación, la fuente temporal aceptada y las operaciones que requieren frescura.
- Aprobar la política de conflicto A4 y la jerarquía de fuentes con validación local.
- Designar la autoridad responsable de revisar y mantener esas reglas.

### Resultado de la segunda pasada

Se propone fail-closed de forma **selectiva**: bloquear la operación que exige confianza actual cuando esta no se puede demostrar, sin afirmar que toda lectura offline debe detenerse automáticamente. La lectura local solo puede continuar cuando la integridad de esos datos y la seguridad de la función siguen siendo verificables. La política de rutas evita certeza falsa y no sustituye a Protección Civil ni a la señalización física.

**Sin cambios de código ni pruebas ejecutadas.** Estado global PROPOSAL — NOT IMPLEMENTED; NCS M0 permanece fuera de alcance.


## 17. Protocolo candidato de publicación y recuperación de bundle (A5) — propuesta (2026-10-29)

**Estado:** PROPOSAL — NOT APPROVED — NOT IMPLEMENTED. Protocolo candidato para revisión; no demuestra garantías de la plataforma objetivo y no se ha implementado ni probado.

### Objetivo y límites

Un bundle puede incluir manifiesto, PMTiles, bases SQLite y otros componentes. La atomicidad de un rename individual o de una transacción SQLite no crea atomicidad para el conjunto. Solo debe activarse un conjunto completo cuya identidad, autenticidad e integridad se hayan verificado.

Separar:
- **Integridad:** los bytes corresponden a los hashes declarados.
- **Autenticidad:** el manifiesto está firmado por una autoridad admitida y la firma/cadena se valida.
- **Frescura:** la secuencia no viola el ancla anti-rollback disponible.
- **Commit:** punto único documentado a partir del cual la nueva versión puede considerarse publicada.
- **Recuperación:** después de una interrupción, determinar si existe un bundle completo verificable, sin mezclar versiones.

### Estructura lógica propuesta

- Directorio bundles/<bundle-id>/: componentes inmutables de una versión.
- Directorio staging/<transaction-id>/: componentes aún no publicados.
- manifest: bundle-id, secuencia, versión de esquema, componentes obligatorios, tamaños, hashes, autoridad/clave de firma y metadatos de emisión/validez.
- active-pointer: registro de selección de bundle, protegido según el modelo de confianza aprobado.
- previous-valid: referencia al último bundle completo verificado, si puede preservarse sin introducir rollback silencioso.

Los nombres son ilustrativos; no representan rutas existentes ni una decisión final de almacenamiento.

### Secuencia candidata

1. **Admisión:** validar autoridad de origen, firma del manifiesto, secuencia, esquema, lista exacta de componentes y límites de tamaño.
2. **Staging:** escribir componentes en el área temporal; no modificar el bundle activo durante descarga/escritura.
3. **Persistencia:** cerrar y sincronizar archivos según las garantías de la plataforma. Para SQLite, definir durabilidad, tratamiento de WAL y checkpoint. synchronous=FULL no sustituye pruebas del almacenamiento real.
4. **Verificación del conjunto:** recalcular tamaños y hashes de todos los componentes obligatorios; verificar manifiesto, firma, esquema, secuencia y coherencia entre componentes. Un bundle-id derivado de hashes no autentica el manifiesto.
5. **Sellado:** impedir modificaciones del candidato durante publicación; sincronizar directorios/metadata donde la plataforma lo soporte y documentar límites.
6. **Commit único:** reemplazar el registro de selección solo si la plataforma documenta la atomicidad necesaria. Debe apuntar a un bundle ya completo y verificado. Si no puede demostrarse commit durable, no afirmar atomicidad garantizada.
7. **Confirmación:** actualizar el ancla de frescura coordinadamente con el commit. Sigue sin resolverse cómo recuperarse si puntero y ancla se actualizan en órdenes distintos o falla la persistencia entre ambos. No implementar hasta definirlo.
8. **Limpieza diferida:** borrar staging y bundles antiguos solo después de verificar que el bundle activo es válido y que la política no necesita la copia anterior.

### Recuperación al iniciar

- Validar el puntero; nunca confiar en él sin verificar su contenido.
- Verificar manifiesto, firma, hashes, esquema y secuencia del bundle apuntado.
- Si falla, examinar un bundle previo solo si sigue verificable y no contradice el ancla anti-rollback ni evidencia de revocación.
- Si frescura es UNKNOWN, no escoger simplemente el bundle con mayor número encontrado en disco: el almacenamiento local puede restaurarse o manipularse.
- Si no puede demostrarse qué bundle es admisible, entrar en NO_VERIFIABLE_BUNDLE; no mezclar archivos de versiones distintas ni crear un manifiesto sustituto.
- Registrar causa de recuperación y evidencia relevante sin exponer secretos criptográficos.

### Matriz de fallos que debe probarse

| Punto de interrupción | Resultado requerido propuesto |
|---|---|
| Escritura de componente en staging | El activo anterior permanece intacto; staging incompleto no se activa. |
| Después de escribir, antes de verificar hashes | El candidato no se activa. |
| Firma inválida o verificación fallida | Rechazo explícito; activo anterior solo si sigue verificable. |
| Después de verificar, antes del commit | Candidato no activo; recuperación puede descartarlo o volver a verificarlo. |
| Durante reemplazo del puntero activo | Tras reinicio, seleccionar solo un puntero válido a bundle completo o declarar NO_VERIFIABLE_BUNDLE. |
| Después del commit, antes de actualizar el ancla | Estado ambiguo: resolver con registro de commit recuperable o bloquear activación; nunca decidir silenciosamente. |
| Durante actualización del ancla | No aceptar combinación que permita rollback; recuperar estado o declarar UNKNOWN/NO_VERIFIABLE_BUNDLE. |
| Durante limpieza del bundle anterior | El activo nuevo permanece íntegro; limpieza idempotente y diferida. |
| WAL incompleto o checkpoint pendiente | Aplicar recuperación SQLite documentada y verificar consistencia; no asumir que el archivo principal basta. |
| Sin espacio, error de sincronización o error de E/S | No declarar commit exitoso sin evidencia; conservar estado previo verificable o declarar estado no verificable. |

### Criterios de aceptación propuestos

- La especificación identifica el único punto de commit y coordina el ancla anti-rollback.
- El manifiesto se autentica y cada componente obligatorio se verifica individualmente y contra la identidad del bundle.
- La inyección de fallos produce el bundle anterior completo, el nuevo completo verificado o estado explícito sin bundle verificable; nunca mezcla silenciosa.
- Las pruebas cubren dispositivo y almacenamiento objetivo, reinicio forzado, falta de espacio, error de sincronización, WAL/checkpoint y restauración de copias antiguas.
- Las garantías de atomicidad/durabilidad corresponden a la plataforma probada; si no pueden demostrarse, se documenta la limitación.

### Bloqueo técnico principal

La coordinación entre el puntero de bundle activo y el ancla de frescura/anti-rollback sigue abierta. Dos escrituras independientes no forman una transacción atómica. La arquitectura debe justificar un registro de commit recuperable o mecanismo equivalente que sobreviva a fallos y restauraciones. Hasta resolverlo, A5 permanece UNKNOWN para implementación segura.

**Sin cambios de código ni pruebas ejecutadas.** NCS M0 permanece fuera de alcance.
