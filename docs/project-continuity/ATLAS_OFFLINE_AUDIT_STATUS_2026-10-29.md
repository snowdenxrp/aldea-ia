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
