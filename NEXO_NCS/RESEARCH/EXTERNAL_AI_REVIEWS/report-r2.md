# Expediente consolidado — Auditoría documental Nexo M02 → M03 → M03-B

**Misión del expediente base (R1):** MUSE-AUTONOMY-001 — Consolidación documental M02 → M03 → M03-B
**Misión de auditoría y revisión R2:** MUSE-AUTONOMY-002 — auditoría adversarial, correcciones documentales y verificación de publicación del expediente base
**Modalidad:** ejecución autónoma, prioridad alta, exclusivamente documental
**Fecha de consolidación:** 5 de noviembre de 2026
**Fecha de consulta de las investigaciones de base:** 2026-11-05
**Estado del expediente base:** consolidación documental MUSE-AUTONOMY-001; versión R2 auditada y publicada bajo MUSE-AUTONOMY-002 (el dictamen sustantivo permanece PARTIAL)
**Dictamen:** **APROBADO CONDICIONADO** como documentación de investigación y referencia, no como especificación técnica autorizada.
**Sin autorización de implementación.** No se aprueba ninguna tecnología. NCS M0 y P07 quedan fuera de modificación. D-01 a D-12 permanecen **SIN DECIDIR** y reservadas exclusivamente al propietario.

## 0. Las siete partes integradas

Este expediente integra íntegramente las siete partes recibidas; ninguna se descarta y ninguna se reescribe por encima de su autor. Los originales se conservan sin modificar; el trabajo se realizó en el espacio aislado `~/workspace/research_notes/nexo-autonomy-001-20261105-2210/`.

| # | Parte | Origen | Contenido |
|---|---|---|---|
| P1 | Informe de investigación M02 | `~/workspace/research_notes/nexo-mision-02-20261105-2109/report.md` + 5 notas en `notes/` | Arquitectura fundamental de Nexo como infraestructura propia e independiente (55.646 bytes, 310 líneas, 20 fuentes). 10 secciones, tabla de brechas, 7 contradicciones. |
| P2 | Documento entregado M02 | `~/workspace/ts-spaces/mision-02-nexo/index.html` | Documento M02 publicado (10 secciones, 2 diagramas, 7 tablas, 7 contradicciones, 20 referencias, D-01 a D-12 SIN DECIDIR). |
| P3 | Informe de investigación M03 | `~/workspace/research_notes/nexo-mision-03-20261105-2217/report.md` + 5 notas en `notes/` | Dictamen adversarial de M02 (45.283 bytes, 211 líneas). 5 correcciones materiales, 13 riesgos omitidos, 12 requisitos a preservar, matriz T1–T14, 9 UNKNOWN. |
| P4 | Documento entregado M03 | `~/workspace/ts-spaces/mision-03-nexo/index.html` | Dictamen M03 publicado. |
| P5 | Informe de investigación M03-B | `~/workspace/research_notes/nexo-mision-03b-20261105-1947/report.md` + 8 notas en `notes/` | Segunda revisión adversarial de las 16 correcciones C01–C16 de ChatGPT (58.209 bytes, 256 líneas). Matriz C01–C16, discrepancias D1–D15, 11 correcciones materiales, 9 UNKNOWN, 7 riesgos nuevos R1–R7. |
| P6 | Documento entregado M03-B | `~/workspace/ts-spaces/mision-03-b-nexo/index.html` | Revisión M03-B publicada. |
| P7 | Hoja consolidada de erratas del propietario | `~/workspace/ts-spaces/hoja-consolidada-de-erratas-nexo/index.html` y `~/workspace/your_files/hoja-consolidada-de-erratas-nexo/hoja-consolidada-de-erratas-nexo.pdf` (4 páginas A4, verificado: C01–C16, R1–R7, U1–U9, D-01–D-12 completos) | Borrador consolidado del propietario, 5 de noviembre de 2026: dictamen APROBADO CONDICIONADO, matriz C01–C16, 12 correcciones materiales supervivientes, riesgos R1–R7, registro UNKNOWN actualizado, D-01 a D-12 SIN DECIDIR, reglas de interpretación y criterio de cierre. **Es la base de consolidación: sus estados de UNKNOWN y su lista de 12 materiales prevalecen donde difieren de M03-B (ver §11).** |

**Nota de método (EVIDENCE / PROPOSAL / HYPOTHESIS / UNKNOWN / PASS):** las etiquetas se aplican como en M02/M03/M03-B. **EVIDENCE** = verificado en fuente primaria leída o corroborado por ≥2 resúmenes independientes que citan la sección primaria (se marca el nivel). **PROPOSAL** = diseño/recomendación sin norma que lo imponga. **HYPOTHESIS** = plausible sin prueba primaria localizada. **UNKNOWN** = no evaluable / no localizado; no se convierte en verdadero o falso por inferencia. **PASS** = evidencia verificable + criterio de aceptación satisfecho; no se concede por documentación. Las fuentes secundarias se citan como secundarias, nunca como lectura primaria.

## 1. Dictamen consolidado

**M02 queda corregida** en los puntos identificados por M03 y M03-B. **M03 queda auditada** con las precisiones de esta hoja y de M03-B. **Las correcciones C01–C16 quedan evaluadas** (15 CONFIRMADA, 1 PARCIALMENTE CONFIRMADA — C14 —, 0 REFUTADA, 0 NO EVALUABLE).

El resultado es **APROBADO CONDICIONADO** como documentación de investigación y referencia, **no como especificación técnica autorizada**. No se aprueba ninguna tecnología ni se autoriza implementación. NCS M0 debe terminar antes de cualquier implementación, como ya estaba establecido.

**Fallo estructural central sin solución demostrada (heredado de M03, no resuelto por M03-B):** no existe estándar de versionado de una Constitución de agente, ni verificación de continuidad semántica/comportamental entre modelos, ni revocación o sucesión sin un tercero de confianza cuando la clave raíz se compromete o el propietario queda incapacitado. Este expediente no afirma lo contrario en ningún punto.

**Conteo consolidado (verificado en todo el documento):** 16 correcciones C01–C16 · 15 discrepancias D1–D15 · 12 correcciones materiales supervivientes · 7 riesgos nuevos R1–R7 · 9 UNKNOWN U1–U9 · 12 decisiones D-01 a D-12 SIN DECIDIR · 5 correcciones materiales de M03 · 13 riesgos omitidos de M03 · 12 requisitos a preservar de M03 · matriz de amenazas T1–T14.

## 2. Índice navegable

1. [Dictamen consolidado](#1-dictamen-consolidado)
2. [Índice navegable](#2-índice-navegable)
3. [Registro consolidado de correcciones C01–C16](#3-registro-consolidado-de-correcciones-c01c16)
4. [Matriz de discrepancias y trazabilidad D1–D15](#4-matriz-de-discrepancias-y-trazabilidad-d1d15)
5. [Correcciones materiales supervivientes (12)](#5-correcciones-materiales-supervivientes-12)
6. [Registro de riesgos R1–R7, riesgos omitidos de M03, matriz T1–T14 y requisitos a preservar](#6-registro-de-riesgos)
7. [Registro UNKNOWN U1–U9](#7-registro-unknown-u1u9)
8. [Matriz de impactos D-01 a D-12](#8-matriz-de-impactos-d-01-a-d-12)
9. [Reglas de interpretación obligatorias](#9-reglas-de-interpretación-obligatorias)
10. [Criterio de cierre documental](#10-criterio-de-cierre-documental)
11. [Informe de autocontrol](#11-informe-de-autocontrol)
12. [Fuentes primarias rastreables](#12-fuentes-primarias-rastreables)
- [Anexo A. Archivos generados y hashes](#anexo-a-archivos-generados-y-hashes)

---

## 3. Registro consolidado de correcciones C01–C16

Veredicto global: **15 CONFIRMADA, 1 PARCIALMENTE CONFIRMADA (C14), 0 REFUTADA, 0 NO EVALUABLE.** La mayoría no corrige un error de M02: C01, C03, C08, C10 y C13 ya estaban dichas en M02; C02, C04, C15 y C16 repiten correcciones que M03 ya había hecho. Son confirmaciones, no descubrimientos (M03-B, Dictamen).

### C01 — Separar identidad, autenticación, autorización y recuperación
- **Veredicto: CONFIRMADA.**
- **Evidencia primaria (EVIDENCE):** DID Core v1.0, W3C Recommendation 19-07-2022, https://www.w3.org/TR/did-core/ — el controlador prueba control de clave sin permiso de tercero; no prueba verdad, confianza ni autorización. VC 2.0 §1.1, https://www.w3.org/TR/vc-data-model-2.0/ — "verifiability does not imply the truth of claims". NIST SP 800-63B-4, https://csrc.nist.gov/pubs/sp/800/63/b/4/final (final, julio 2025) — su objeto es autenticación; la autorización es política del sistema que consume el resultado. A2A §4.6 — la autorización es "implementation-specific".
- **Qué debe corregirse en M02:** nada sustantivo. M02 §1.5 ya decía: "confundir autenticación con autorización: probar quién firma no prueba qué puede hacer". M03 §B lo repitió y añadió que falta el mecanismo de capabilities con scope, expiración y revocación.
- **Estado en M03:** resuelto en sustancia; queda la laguna estructural ya registrada: no existe mecanismo estándar demostrado de revocación/sucesión sin tercero de confianza.
- **Redacción que debe prevalecer:** "La identidad (DID) prueba control de clave. La autenticación (AAL) prueba que el reclamante es el suscriptor. La autorización (capabilities con scope, expiración y revocación) decide qué puede hacer, dónde y hasta cuándo. La recuperación (Shamir/SLIP-39, multifirma, sucesor) es un procedimiento humano/físico independiente. Ninguna de las cuatro se deduce de otra."
- **Consecuencia arquitectónica (PROPOSAL):** cuatro subsistemas separados con claves, registros y procedimientos distintos; un VC de "soy el operador" no autoriza borrar. Impacto: D-01, D-02, D-08 (sin decidir).

### C02 — AAL3 es un nivel de garantía de autenticación, no una arquitectura universal de identidad ni una solución completa de autoridad
- **Veredicto: CONFIRMADA con precisión (precisión del propietario adoptada; ver §11 A2).**
- **Evidencia primaria (EVIDENCE en sustancia; texto verbatim §2.3.2/Ap. B y Ap. E no leído línea a línea — ver U1):** SP 800-63B-4, final julio 2025 (landing CSRC verificada en vivo; §2.3.2/Ap. B corroborados por ≥2 resúmenes independientes que citan la primaria): AAL3 exige autenticador criptográfico con clave privada no exportable y resistencia a phishing; "syncable authenticators SHALL NOT be used at AAL3" (§2.3.2); Ap. E: el cambio Rev.3→Rev.4 es que AAL3 requiere "a non-exportable cryptographic authenticator rather than a hardware-based one". Alcance: autenticación de sujetos ante sistemas gubernamentales; "not intended to constrain the development or use of standards outside of this purpose".
- **Qué debe corregirse en M02:** M02 §1.6 decía "AAL3 exige autenticador hardware con clave privada no exportable" — ya corregido por M03 (corrección 02). C02 añade el punto de alcance: AAL3 no es arquitectura de identidad ni de autoridad.
- **Estado en M03:** resuelta la mitad "hardware"; la mitad "alcance" la resuelve C02.
- **Redacción que debe prevalecer (hoja del propietario):** "AAL3 exige autenticación resistente al phishing y autenticador criptográfico no exportable en entorno aislado protegido por hardware o procesador separado con interfaz controlada. No exige necesariamente una llave externa." **Precisión del propietario adoptada (ver §11 A2):** la formulación del entorno protegido se apoya en resúmenes del §2 de SP 800-63B-4, no en una cita verbatim leída en vivo. Queda pendiente solo la verificación documental verbatim, no una decisión.
- **Consecuencia arquitectónica (PROPOSAL):** no diseñar la autoridad de Nexo como "AAL3 y listo"; AAL3 es un requisito de un componente (autenticación del operador), no de la arquitectura. Impacto: D-01, D-02, D-08.

### C03 — Firmas Git: evidencia de integridad y autoría, no de autoridad para modificar la Constitución
- **Veredicto: CONFIRMADA.**
- **Evidencia primaria (EVIDENCE, index + corroborado):** GitHub Docs, "About commit signature verification", https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification — con GPG/SSH/S/MIME se firman commits y tags; "Verified" significa "the commit is signed and the signature was successfully verified". El registro de verificación persiste aunque la clave se revoque o expire: los commits verificados previamente conservan su estado verificado ("previously verified commits retain their verified status… GitHub will not re-verify previously signed commits"); una firma verificada sigue verificada aunque la clave se revoque después. (Corrección R2, MUSE-AUTONOMY-002: la cita entrecomillada que figuraba en R1 no aparecía en la página citada; se sustituye por la redacción real de GitHub Docs, verificada por la auditoría independiente. La sustancia de C03 no cambia.) Git por defecto no verifica autoría: autor/committer son texto libre.
- **Qué debe corregirse en M02:** nada. M02 §1.7 ya lo decía: "Git + firmas: historial append-only con hash encadenado… Eso versiona *texto*; no versiona *autoridad*".
- **Estado en M03:** no tratado como punto independiente; M03 §C estableció que la integridad textual es verificable (hash + firma) y que eso es todo lo que prueba.
- **Redacción que debe prevalecer:** "Una firma Git válida prueba que el titular de una clave firmó esos bytes y que no se alteraron después. No prueba que esa clave estuviera autorizada por la cláusula de enmienda vigente, ni que el cambio fuera revisado, ni que la clave siga autorizada hoy. La autoridad vive en la Constitución anterior; la firma solo la transporta."
- **Consecuencia arquitectónica (PROPOSAL):** el verificador de enmiendas debe consultar la lista de claves autorizadas vigente en la versión anterior + estado de revocación en el momento de la decisión, no el badge "Verified". Riesgo nuevo R3. Impacto: D-03.

### C04 — MCP 2026-07-28 es un cambio material, no una actualización menor
- **Veredicto: CONFIRMADA.**
- **Evidencia primaria (EVIDENCE, verificado en vivo):** MCP, blog oficial 2026-07-28, https://blog.modelcontextprotocol.io/posts/2026-07-28/ — núcleo stateless; retirados `initialize`/`initialized` y `Mcp-Session-Id` (SEP-2575/2567); nuevo `server/discover`; MRTR sustituye sampling/elicitation/roots iniciados por servidor; Tasks pasa a extensión; Roots/Sampling/Logging deprecados (ventana mínima 12 meses); HTTP+SSE deprecado; endurecimiento de auth (RFC 9207 `iss`, CIMD sustituye DCR).
- **Qué debe corregirse en M02:** nada. M02 §3.1 ya decía que la revisión 2026-07-28 "rompe compatibilidad con revisiones anteriores en puntos concretos (sesiones, handshake, códigos de error); fijar la revisión es obligatorio". M03 lo confirmó en sustancia.
- **Estado en M03:** resuelto por completo.
- **Redacción que debe prevalecer:** "Toda integración debe fijar versión y compatibilidad. No debe tratarse MCP como una interfaz inmutable." / "Cambio material con ruptura de compatibilidad; fijar la revisión y soportar dual-era o aceptar la ruptura".
- **Consecuencia arquitectónica (PROPOSAL):** el dialecto interno de Nexo no puede ser "MCP" sin versión; la revisión fijada es parte del contrato. Impacto: D-06.

### C05 — A2A es un proyecto/especificación abierta bajo Linux Foundation; no es por sí mismo un estándar de identidad ni de autorización
- **Veredicto: CONFIRMADA. Aportación genuinamente nueva (1 de 5).**
- **Evidencia primaria (EVIDENCE en sustancia para el contenido de la spec, verificado en vivo 2026-11-05):** A2A Protocol Specification, https://a2a-protocol.org/pr-849/specification/ (versión `dev` en la página leída; v1.0.0 del 12-03-2026 y v1.0.1 de mayo de 2026 según fuentes secundarias). §1: "an open standard designed to facilitate communication and interoperability between independent, potentially opaque AI agent systems". §3.3: "Identity information is not transmitted within A2A JSON-RPC payloads; it is handled at the HTTP transport layer". §4.3: la adquisición de credenciales es "out-of-band" y "outside the scope of the A2A protocol itself". §4.6 Authorization: "the A2A Server is responsible for authorizing the request based on the authenticated client/user identity and its own policies. Authorization logic is implementation-specific". §5.1: Agent Card = documento JSON con identidad, capacidades, skills, endpoint y requisitos de autenticación. La gobernanza "Linux Foundation" no aparece en el texto de la spec leído; se apoya en fuentes secundarias (donación a Linux Foundation en junio de 2025; nota de prensa de la Linux Foundation del 23-06-2025, verificada durante la construcción del documento M03-B) y en el alojamiento en la Agentic AI Foundation desde agosto de 2026 (secundario) — ver U4.
- **Qué debe corregirse en M02:** M02 §3.1 dejó A2A como **UNKNOWN** ("no se verificó su estado normativo en esta investigación; no se afirma nada sobre él"). C05 cierra ese UNKNOWN con verificación. No refuta nada de M02.
- **Estado en M03:** no tratado. Corrección genuinamente nueva.
- **Redacción que debe prevalecer:** "A2A es un protocolo de comunicación entre agentes; no sustituye identidad ni autorización. Las credenciales se gestionan fuera del protocolo y la autorización depende de la implementación." Matiz: A2A no es vacío en identidad: estandariza *cómo se declaran* los esquemas (API key, OAuth 2.0, OIDC, mTLS, HTTP auth) y la firma opcional de tarjetas (según análisis secundario de la spec, §8.4; ver R1). Decir "no es un estándar de identidad" es correcto; decir "no tiene nada que ver con identidad" sería falso.
- **Consecuencia arquitectónica (PROPOSAL):** si Nexo adopta A2A, necesita una capa propia de identidad/autorización encima (DID/VC/capabilities) y una política de tarjetas firmadas; la tarjeta es entrada no confiable para el modelo (riesgo nuevo R1). Impacto: D-05, D-06.

### C06 — Safetensors: evitar pickle no demuestra que los pesos sean confiables, seguros o benignos
- **Veredicto: CONFIRMADA. Aportación genuinamente nueva (2 de 5).**
- **Evidencia primaria (EVIDENCE, verificado en vivo 2026-11-05):** huggingface/safetensors, README, https://github.com/huggingface/safetensors — Apache-2.0, creado 2022-09-22: "a new simple format for storing tensors safely (as opposed to pickle) and that is still fast (zero-copy)"; "The main rationale for this crate is to remove the need to use `pickle` on `PyTorch`"; "Safe: Can I use a file randomly downloaded and expect not to run arbitrary code?"; cabecera JSON (8 bytes de longitud + JSON UTF-8 con dtype/shape/data_offsets) + buffer de bytes; "Tensor values are not checked against, in particular NaN and +/-Inf could be in the file"; el buffer debe estar totalmente indexado, sin huecos. La definición de "Safe" del propio README es exclusivamente no-ejecución de código arbitrario.
- **Qué debe corregirse en M02:** M02 §3.2 decía solo: "safetensors: formato de pesos seguro (sin ejecución de código al cargar, a diferencia de pickle). No se verificó en mayor profundidad en esta investigación." La frase era correcta pero incompleta: no decía qué *no* garantiza. C06 completa el alcance.
- **Estado en M03:** no tratado. Corrección genuinamente nueva.
- **Redacción que debe prevalecer:** "El formato evita la ejecución arbitraria de código propia de la carga mediante pickle; no garantiza que los pesos sean íntegros, benignos o correctos." / "Safetensors elimina la vía de ejecución de código en la carga (sin pickle, sin opcodes, sin código ejecutable en el formato). No verifica los valores de los tensores (NaN/±Inf admitidos), no detecta pesos manipulados o con backdoor, no garantiza que el modelo sea benigno ni correcto, y no cubre el código que acompaña al repositorio (p. ej., `trust_remote_code=True` ejecuta código del repositorio)."
- **Consecuencia arquitectónica (PROPOSAL):** la cadena de confianza de pesos necesita, además del formato: hash/firma del artefacto, pinning a commit, verificación de procedencia y carga en sandbox (riesgo nuevo R2: convertir pickle→safetensors exige cargar el pickle una vez, el paso arriesgado). Impacto: D-09.

### C07 — JSONL y SQLite: no presentarlas como dos fuentes maestras independientes; definir una canónica y la otra como índice/proyección/vista
- **Veredicto: CONFIRMADA. Aportación genuinamente nueva (3 de 5).**
- **Evidencia primaria (EVIDENCE en fuentes + PROPOSAL en la elección de cuál es canónica):** SQLite como formato de fichero, https://www2.sqlite.org/draft/onefile.html (verificado en vivo): retrocompatibilidad de formato desde 3.0.0 (2004-06-18); compatibilidad del *formato*, no del esquema ni de la semántica. JSON: RFC 8259 §8.1 (dic 2017): intercambio JSON "MUST be encoded using UTF-8"; JSON Lines es una *convención* (un JSON por línea, UTF-8, `\n`), no RFC ni ISO. M03 §3: lo "canónico" exige además orden de claves, normalización Unicode, precisión numérica, timestamps RFC 3339 y canonicalización para hash (JCS RFC 8785). Dos "maestros" que pueden divergir sin un procedimiento de reconciliación son, por definición, dos fuentes de verdad en conflicto; ninguna de las fuentes citadas define un modelo de doble maestro.
- **Qué debe corregirse en M02:** M02 §2.1, regla de diseño: "*dos capas*: archivo canónico en texto plano/JSONL + SQLite (legible en 2050 con herramientas comunes)". La formulación presenta dos capas y llama "canónico" al archivo de texto mientras SQLite es la base de trabajo, sin declarar cuál manda ante una divergencia ni cómo se regenera la otra. Es ambigüedad real, no un error de hecho. La hoja del propietario precisa: "M02 ya identificaba JSONL como canónico, pero no detallaba suficientemente la reconciliación con SQLite" — coherente con M03-B; se adopta esa formulación.
- **Estado en M03:** no resuelto. M03 §3 corrigió el estatus de JSONL (convención, no estándar) y exigió canonicalización, pero no señaló la ambigüedad de doble maestro. C07 cierra una laguna de M03.
- **Redacción que debe prevalecer:** "Debe existir una sola fuente canónica. La otra representación será derivada y regenerable." / "Una sola fuente canónica: [SQLite | JSONL append-only — a decidir por el propietario, D-05]. La otra capa es una vista derivada, regenerable y nunca fuente de autoridad: si divergen, manda la canónica y la derivada se reconstruye, registrando la divergencia como evento. Ningún proceso escribe en la derivada esperando que la canónica lo adopte."
- **Consecuencia arquitectónica (PROPOSAL):** la elección canónica condiciona backup, restauración, olvido y auditoría; sin ella, una vista corrupta puede convertirse en "memoria" (M03 §D). Impacto: D-05.

### C08 — Merkle y cadenas hash: detectan alteraciones bajo ciertas condiciones; no demuestran verdad, ausencia ni legitimidad de quien registra
- **Veredicto: CONFIRMADA; corrige M02.**
- **Evidencia primaria (EVIDENCE):** RFC 9162, Certificate Transparency v2.0, dic 2021, Experimental, https://www.rfc-editor.org/rfc/rfc9162 — log append-only de Merkle, pruebas de inclusión y de consistencia, Signed Tree Head. La detección funciona respecto a una raíz/checkpoint confiable e independiente; si el atacante reescribe log + checkpoints bajo el mismo control, no hay detección. No prueba completitud (evento omitido), veracidad del contenido, ni corrección del timestamp.
- **Qué debe corregirse en M02:** dos puntos. (1) M02 §2.3: "un log no prueba que un evento *no ocurrió* (ausencia) salvo con diseños específicos; una hash chain sola no prueba ausencia, un Merkle con diseño adecuado sí". Esa última cláusula es demasiado generosa: un Merkle prueba inclusión/consistencia respecto a un STH, no la ausencia de eventos no registrados. M03 ya la corrigió en ese sentido; C08 se alinea con M03 contra M02 (ver D13). (2) M02 §2.3: "un atacante con acceso de escritura puede reescribir todo el log y recalcular la cadena si controla también la raíz anclada" — correcto y compatible con C08.
- **Estado en M03:** resuelto por completo (M03 §3 y riesgo 5: "hash sin anclaje = auto-certificación; cola truncable").
- **Redacción que debe prevalecer:** "Permiten detectar alteraciones respecto de un anclaje o checkpoint confiable. No demuestran verdad, integridad completa ni ausencia de eventos nunca registrados." / "Hash encadenado + Merkle (RFC 9162) detectan alteración de lo registrado respecto a un STH anclado externamente. No demuestran que un evento registrado sea verdadero, que no falte ningún evento, ni que quien registró tuviera legitimidad para hacerlo. La legitimidad es una regla de autorización externa al log."
- **Consecuencia arquitectónica (PROPOSAL):** el anclaje externo (STH publicado fuera del control del operador) es obligatorio, no opcional; la cola truncable exige STH con `tree_size` anclado. Impacto: D-04, D-05.

### C09 — Restauración: cuarentena y verificación antes de activar los datos restaurados; revisar la ambigüedad copiar/verificar/restaurar
- **Veredicto: CONFIRMADA. Aportación genuinamente nueva (4 de 5).**
- **Evidencia primaria (EVIDENCE en controles + PROPOSAL en la etapa de cuarentena con ese nombre):** NIST SP 800-53 Rev. 5, controles CP-9 (System Backup) y CP-10 (System Recovery and Reconstitution — "recovering and reconstituting the system to a known state") y CP-10(4) ("restore system components… from configuration-controlled and integrity-protected information representing a known, operational state") — existencia y texto corroborados por resúmenes independientes que citan la primaria (index/corrobordado 2026-11-05); CP-9(1) exige probar los backups en fiabilidad e integridad. Ningún control localizado usa la palabra "cuarentena" para la restauración: el término es **PROPOSAL**, no requisito NIST.
- **Qué debe corregirse en M02:** M02 §2.4 ya definía restaurar en 4 pasos: (1) copiar desde fuente independiente, (2) verificar hash + Merkle + firmas, (3) comparar raíz con anclaje externo, (4) registrar la restauración como evento nuevo; "si algún paso falla, la restauración se declara *no verificada*". Lo que falta es la etapa de *contención*: M02 verifica antes de activar en los pasos (2)–(3), pero no nombra un estado de cuarentena (datos restaurados retenidos, no activables, hasta verificación completa) ni distingue los tres verbos como fases con criterios de salida distintos. C09 añade esa etapa y esa distinción; no refuta el procedimiento de M02.
- **Estado en M03:** parcialmente. M03 exigió cuarentena para la *memoria experimental* (etiqueta + TTL + cuarentena antes de promoción), pero no la aplicó a la *restauración* de datos. Laguna de M03 que C09 cierra.
- **Redacción que debe prevalecer:** "La restauración debe verificarse antes de activar el contenido. La cuarentena es una propuesta de diseño, no una etapa exigida literalmente por NIST." / "Restaurar = copiar a cuarentena → verificar (hash encadenado + Merkle + firmas + raíz contra anclaje externo + procedencia) → activar solo si todo verifica → registrar la restauración como evento nuevo. Mientras está en cuarentena, lo restaurado no es activable ni consultable como memoria canónica. Si algo falla, se declara 'restauración no verificada' y no se activa ni se 'arregla' silenciosamente."
- **Consecuencia arquitectónica (PROPOSAL):** la restauración necesita un dominio de cuarentena separado de la canónica, con sus propias claves y sin escritura a canónica. Impacto: D-05, D-10.

### C10 — Frontera del Core: el Core concentra autoridad y política, no es ejecutor general; ejecución y orquestación fuera de la frontera privilegiada
- **Veredicto: CONFIRMADA con precisión (precisión del propietario adoptada; ver §11 A3).**
- **Evidencia primaria (EVIDENCE en existencia de los controles + PROPOSAL en la frontera concreta Core/ejecución en Nexo):** NIST SP 800-53 Rev. 5, SC-3 Security Function Isolation (solo baseline HIGH; heredado M03): aislar funciones de seguridad de funciones no de seguridad mediante frontera definida; AC-5 Separation of Duties; AC-6 Least Privilege. Son requisitos a implementar y evidenciar, no garantías por citarlos.
- **Qué debe corregirse en M02:** nada sustantivo. M02 §5.1: "el núcleo debe ser mínimo y sin dependencia de modelo: identidad, Constitución versionada y firmada, registro append-only y memoria canónica. Todo lo demás —modelos, herramientas, transporte— vive detrás de adaptadores desechables". M02 §6.1/§6.3: núcleo en dominio aislado, Labs por un único canal estrecho. M02 nunca hizo del Core un ejecutor general; C10 es una explicitación preventiva de un principio ya presente, no la corrección de un error.
- **Estado en M03:** resuelto en sustancia: M03 §E/F y riesgo 10 — "un agente que es a la vez autor, ejecutor y auditor viola AC-5/AC-6 por diseño si no hay separación de funciones, personas y claves"; requisito 3: "el agente nunca auto-autoriza escritura/borrado/envío".
- **Redacción que debe prevalecer (hoja del propietario):** "El Core debe conservar autoridad y política; la ejecución general debe quedar separada y limitada. NIST respalda separación de deberes y mínimo privilegio, pero no declara que todo bucle de ejecución dentro de un Core viole automáticamente sus controles." **Precisión del propietario adoptada (ver §11 A3):** M03-B formuló la separación como violación de SC-3/AC-5/AC-6 "por diseño" para un bucle de ejecución dentro del Core; la hoja del propietario limita esa atribución a NIST. La redacción prevalente está fijada por el propietario.
- **Consecuencia arquitectónica (PROPOSAL):** cualquier diseño que ponga el bucle de ejecución dentro del Core debe justificarse contra SC-3/AC-5/AC-6 como principio arquitectónico de Nexo, no como prohibición literal de NIST. Impacto: D-08, D-09.

### C11 — 200–500 pruebas es una heurística, no una garantía estadística; considerar evaluación pareada, intervalos de confianza, regresiones y bloqueos por fallos críticos
- **Veredicto: CONFIRMADA como metodología propuesta.**
- **Evidencia primaria / cálculo (EVIDENCE en cálculo + HELM; PROPOSAL en su aplicación concreta a Nexo):** (1) Ninguna norma localizada prescribe 200–500 casos para evaluar un agente; M02 la presentó como "Regla operativa PROPUESTA", no como EVIDENCIA — C11 confirma la etiqueta de M02. (2) Aritmética binomial estándar (cálculo propio, verificable): con n=200 y p=0,70, el error estándar es √(0,70·0,30/200) ≈ 0,032 → IC 95% ≈ ±6,4 puntos; con n=500, ≈ ±4,0 puntos; en el peor caso p=0,50 y n=200, ≈ ±6,9 puntos. Una "mejora" de 3 puntos con n=200 está dentro del ruido. El ejemplo GPQA Diamond (198 preguntas, IC 95% ±6,4 al 70%) ya estaba en M02 §3.3 y es coherente con este cálculo. (3) HELM (Liang et al., arXiv:2211.09110, 2022): marco multi-escenario/multi-métrica con bootstrap para intervalos. Miller (2024), arXiv:2411.00640, "Adding Error Bars to Evals" — recomienda bootstrap, intervalos y pruebas pareadas; citado vía fuente secundaria, paper no leído en este run (ver U8).
- **Qué debe corregirse en M02:** nada en el número. M02 §3.3 ya decía que la evaluación pública sirve para descartar, no para decidir, y que decidir exige evaluación propia con metadatos de validez. Lo que C11 añade es la maquinaria que M02 solo esbozó ("margen mínimo que cuenta como mejora real frente a ruido estadístico", D-07): evaluación pareada (mismo conjunto, misma plantilla), IC por diferencia, regresiones y bloqueo por fallos críticos (un fallo crítico veta el cambio aunque la media mejore).
- **Estado en M03:** parcialmente: M03 degradó la cifra HELM/lm-eval "4–5 puntos" a HYPOTHESIS/UNKNOWN, pero no desarrolló la maquinaria estadística. C11 la aporta; la cifra 4–5 sigue sin verificarse (U5).
- **Redacción que debe prevalecer:** "200–500 casos es una heurística, no un mínimo normativo. Comparaciones pareadas, mismas condiciones e intervalos de confianza mejoran la evaluación." / "Evaluación propia de 200–500 casos de la tarea real (heurística, no garantía): mismo harness, mismas plantillas, mismo snapshot; resultado informado como diferencia pareada con IC 95% (bootstrap); cambio bloqueado si la diferencia no supera el ruido, si hay regresión en casos de referencia, o si aparece un fallo crítico, aunque la media mejore."
- **Consecuencia arquitectónica (PROPOSAL):** el umbral de cambio de modelo (D-07) debe definirse en términos de diferencia pareada e IC, no de puntos absolutos. Impacto: D-07.

### C12 — Colas de mensajes: una cola validada no basta; se requieren autenticación del emisor, autorización por mensaje, protección contra replay, límites de recursos y tratamiento de contenido hostil
- **Veredicto: CONFIRMADA. Aportación genuinamente nueva (5 de 5).**
- **Evidencia primaria (EVIDENCE en controles + riesgo de inyección; PROPOSAL en la lista como requisito de diseño):** NIST SP 800-53 Rev. 5 (existencia de los controles corroborada por resúmenes independientes que citan la primaria, 2026-11-05): AC-3 Access Enforcement ("enforces approved authorizations for logical access"), SC-8 Transmission Confidentiality and Integrity, SC-5 Denial of Service Protection, SC-23 Session Authenticity (autenticidad de sesión / replay), SI-10 Information Input Validation. Ningún control ni estándar localizado prescribe exactamente la lista de seis controles para la cola interna de un agente: la lista como conjunto es **PROPOSAL** de diseño, fundada en esos controles. La validación de esquema (JSON Schema) valida sintaxis, no intención ni autorización: un mensaje bien formado puede llevar contenido hostil (M03 §E: inyección indirecta vía herramienta, **EVIDENCE** de riesgo).
- **Qué debe corregirse en M02:** M02 §6.1 definió el canal Core–Labs como "una cola de mensajes con esquema validado, sin ejecución de código, con límites de tamaño y frecuencia". Eso cubre dos de los seis controles (validación de esquema ≈ SI-10 parcial; límites de tamaño/frecuencia ≈ SC-5 parcial) y omite cuatro: autenticación del emisor, autorización por mensaje, protección contra replay y tratamiento del contenido hostil (M03 §E lo trató para herramientas, no para la cola). C12 es una corrección genuinamente nueva en cuatro de seis controles. Conteo corregido en R1 (2026-11-06): seis controles totales, dos preexistentes en M02 y cuatro incorporaciones; las apariciones anteriores de "tres de cinco" en este expediente eran aritméticamente incoherentes y quedan sustituidas por este conteo en §3, §4 (D9) y §5.
- **Estado en M03:** no resuelto; M03 no auditó la cola. Laguna de M03 que C12 cierra.
- **Redacción que debe prevalecer:** "La cola requiere validación de esquema, autenticación y autorización por mensaje, anti-replay, límites de recursos y tratamiento del contenido como dato no confiable." / "Canal Core–Labs: cola con esquema validado + autenticación del emisor por mensaje (firma, clave por emisor) + autorización por mensaje (capability con scope y expiración) + anti-replay (nonce/timestamp + ventana) + límites de recursos (tamaño, frecuencia, profundidad) + contenido tratado como dato no confiable (sin ejecución, sin instrucciones). Un mensaje que falla en cualquiera de los seis controles se descarta y se registra, no se procesa."
- **Consecuencia arquitectónica (PROPOSAL):** la cola es una frontera de confianza (SC-7) y un canal de inyección indirecta (riesgo nuevo R5); su endurecimiento es previo a cualquier uso de Labs con datos reales. Impacto: D-08, D-09.

### C13 — GGUF: facilita distribución y ejecución local en determinados entornos; no garantiza que el hardware disponible pueda ejecutar el modelo de manera útil
- **Veredicto: CONFIRMADA.**
- **Evidencia primaria (EVIDENCE):** GGUF spec, repo ggml `docs/gguf.md` (heredado M02/M03): formato de un solo fichero para inferencia con GGML, v3, desde 21-08-2023, reemplaza GGML/GGMF/GGJT; sin organismo de estándares; gobernado por llama.cpp/ggml; de facto por adopción (llama.cpp, Ollama, LM Studio). M02 §3.2 ya listaba los límites: "atado a los tipos de ggml; la cuantización cambia el comportamiento; un fichero válido puede fallar si el runtime no tiene el kernel, cambia la precisión o el proveedor de ejecución hace fallback".
- **Qué debe corregirse en M02:** nada. M02 nunca afirmó que GGUF garantizara ejecución útil en el hardware disponible; su §3.2 y su tabla de brechas decían lo contrario ("inferencia sin hardware" como límite).
- **Estado en M03:** resuelto en sustancia ("GGUF es de facto local, no estándar formal").
- **Redacción que debe prevalecer:** "GGUF es un formato de facto para inferencia; no garantiza portabilidad de rendimiento ni equivalencia entre runtimes y hardware." / "GGUF = formato de facto para distribución/ejecución local (llama.cpp). Que un modelo exista en GGUF no implica que el hardware disponible lo ejecute con latencia, contexto o calidad útiles; la cuantización y el runtime deciden."
- **Consecuencia arquitectónica (PROPOSAL):** la capacidad cognitiva local debe verificarse por ejecución medida en el hardware real (eval propia, C11), no por la existencia del fichero. Impacto: D-07.

### C14 — Criptografía poscuántica: la migración exige agilidad y planificación; no implica una expiración automática y universal de todas las claves Ed25519
- **Veredicto: PARCIALMENTE CONFIRMADA. Es la única corrección parcial de las 16, y la discrepancia es material (ver D2).**
- **Evidencia primaria (EVIDENCE, corroborado):** NIST FIPS 203 (ML-KEM), 204 (ML-DSA) y 205 (SLH-DSA), finales 13-08-2024 (heredado M03). NIST IR 8547, *Transition to Post-Quantum Cryptography Standards*, final 27-10-2026, DOI 10.6028/NIST.IR.8547 (corroborado por ≥3 resúmenes independientes del final, 2026-11-05; el PDF final no se leyó línea a línea en este run): "NIST will deprecate all quantum-vulnerable digital signature algorithms after 2030 and disallow their use under NIST standards and guidelines after 2035" — a toda fuerza, incluidos EdDSA ≥128 bits (Ed25519), ECDSA P-256 y RSA-3072. El borrador (nov 2024) solo deprecaba 112-bit tras 2030. EO 14412 / OMB M-26-15 (jun 2026): PQC para establecimiento de claves en sistemas federales de alto valor/impacto antes del 31-12-2030 y para firmas antes del 31-12-2031. IR 8547 es guía de transición federal, no estatuto universal.
- **Qué es correcto en C14:** (a) Las claves Ed25519 no "expiran automáticamente" en 2031 por un mecanismo criptográfico: seguirán verificándose matemáticamente; lo que cambia es su estatus normativo (deprecated → disallowed) bajo normas NIST. (b) La deprecación/desautorización es "bajo normas y directrices NIST", no una ley universal: un sistema privado fuera del ámbito federal no está obligado por IR 8547. (c) La migración exige agilidad criptográfica y planificación: M02 §5.2 ya lo proponía (múltiples métodos de verificación con fechas de vigencia; firma cruzada antigua→nueva).
- **Qué es incorrecto o engañoso en C14 si se lee sin matiz:** decir "no implica una expiración automática y universal" sin mencionar las fechas 2030/2035 invita a leer "Ed25519 no tiene fecha límite". Esa lectura **contradice la corrección material 03 de Misión 03** y repite, en dirección opuesta, el error de M02 (que citaba el borrador y dejaba Ed25519 fuera del paso de 2030). Bajo IR 8547 final, una identidad Ed25519 de larga vida nace con fecha de caducidad normativa: deprecated tras 2030, disallowed tras 2035 (bajo NIST); antes para sistemas federales de alto valor (firmas PQC antes del 31-12-2031).
- **Qué debe corregirse en M02:** M02 §5.2 citaba el borrador IR 8547 ("propone deprecar RSA/ECC de 112 bits tras 2030 y no permitirlos tras 2035") — ya corregido por M03. C14 no debe usarse para revertir esa corrección.
- **Estado en M03:** resuelto, y C14 no debe debilitarlo: la mitad de agilidad/planificación de C14 confirma M03; la mitad de "no expiración" debe leerse con las fechas encima.
- **Redacción que debe prevalecer:** "Ed25519 no deja de funcionar matemáticamente por una fecha. NIST IR 8547 establece deprecación después de 2030 y desautorización bajo sus normas y directrices después de 2035 para algoritmos vulnerables. Los hitos federales de alto valor/impacto incluyen establecimiento de claves en 2030 y firmas en 2031." / "La migración PQC exige agilidad criptográfica y planificación. Las claves Ed25519 no dejan de funcionar criptográficamente en una fecha, pero bajo NIST IR 8547 final (27-10-2026) quedan deprecated tras 2030 y disallowed tras 2035 bajo normas NIST (antes para sistemas federales de alto valor: firmas PQC antes del 31-12-2031). Planificar la migración a ML-DSA/SLH-DSA con firma cruzada y re-emisión antes de 2030; no tratar 2035 como fecha lejana sin hitos intermedios."
- **Consecuencia arquitectónica (PROPOSAL):** inventario de firmas RSA/ECC/Ed25519 con fecha de vigencia por clave; la identidad debe soportar varios algoritmos desde el día uno. Impacto: D-11 (y D-01/D-02 por la firma cruzada en la rotación).

### C15 — Regla 3-2-1-1-0: práctica operativa de respaldo; no es una certificación ni garantiza recuperación absoluta
- **Veredicto: CONFIRMADA.**
- **Evidencia primaria (EVIDENCE):** Veeam, https://www.veeam.com/blog/data-backup-recovery.html (heredado M03): 3 copias, 2 medios, 1 offsite, 1 inmutable/air-gapped, 0 errores verificados (SureBackup). Regla de vendedor, no NIST/ISO. La inmutabilidad dura una retención definida y depende del enforcement en la capa de almacenamiento + credenciales separadas; "0 errores" exige test de restauración real.
- **Qué debe corregirse en M02:** M02 §4.1 la presentaba como "EVIDENCIA como práctica, no norma" y §4.2 como disciplina de supervivencia, sin marcar explícitamente su origen de vendedor. M03 (corrección 04) ya corrigió el estatus. C15 confirma M03 y añade el segundo punto ("no garantiza recuperación absoluta"), que M02 §4.2 ya decía en sustancia ("un backup nunca probado es una esperanza").
- **Estado en M03:** resuelto por completo.
- **Redacción que debe prevalecer:** "Es una práctica operativa difundida por Veeam, no una certificación ni un estándar NIST/ISO. La recuperación debe probarse." / "3-2-1-1-0 es una regla práctica de respaldo de Veeam (3 copias, 2 medios, 1 externa, 1 inmutable o aislada, 0 errores verificados). No es un estándar, no es una certificación y no garantiza recuperación: la garantía es la restauración de prueba periódica, no la regla."
- **Consecuencia arquitectónica (PROPOSAL):** ninguna nueva; mantener el requisito de M03 de test de restauración con 0 errores. Impacto: D-05, D-10.

### C16 — Límites físicos: expresarse como límites prácticos o materiales respaldados por evidencia, no como teoremas universales sin demostración
- **Veredicto: CONFIRMADA.**
- **Evidencia primaria (EVIDENCE para los límites materiales concretos; HYPOTHESIS/UNKNOWN para la imposibilidad universal):** lo verificado (heredado M03): ASML único proveedor EUV, >100k componentes, 13,5 nm, 80+ pasos de litografía / 80–120 ciclos de patterning, cadena de ~30 años, capacidad de Zeiss como cuello de botella. Lo **no** verificado (heredado M03): "más de 1.000 pasos" totales ni "físicamente imposible" como proposición medida — ninguna fuente primaria localizada lo cuantifica así.
- **Qué debe corregirse en M02:** M02 §4.4 presentaba como **EVIDENCIA**: "fabricar un chip avanzado exige >1.000 pasos… La independencia *física* total es **físicamente imposible sin recursos externos**". M03 (corrección 05) ya degradó ambas afirmaciones a HYPOTHESIS/UNKNOWN y las reformuló como imposibilidad práctica/económica a escala individual. C16 confirma exactamente esa reformulación.
- **Estado en M03:** resuelto por completo.
- **Redacción que debe prevalecer:** "La fabricación avanzada de semiconductores a escala individual no es una vía práctica de independencia tecnológica. No debe presentarse como imposibilidad física universal ni sostenerse con cifras no verificadas." / "Reconstruir semiconductores avanzados desde cero a escala individual no es viable en un plazo útil: un solo proveedor EUV (ASML), >100.000 componentes por máquina, cadena de suministro de ~30 años que ningún país domina completa. Es un límite práctico/material con evidencia, no un teorema de imposibilidad física. Lo alcanzable es degradación elegante con hardware existente."
- **Consecuencia arquitectónica (PROPOSAL):** ninguna nueva; el diseño debe presupuestar degradación, no reconstrucción. Impacto: D-10, D-12.

**Resumen de veredictos C01–C16:** C01 CONFIRMADA · C02 CONFIRMADA · C03 CONFIRMADA · C04 CONFIRMADA · C05 CONFIRMADA · C06 CONFIRMADA · C07 CONFIRMADA · C08 CONFIRMADA · C09 CONFIRMADA · C10 CONFIRMADA · C11 CONFIRMADA · C12 CONFIRMADA · C13 CONFIRMADA · **C14 PARCIALMENTE CONFIRMADA** · C15 CONFIRMADA · C16 CONFIRMADA. Total: 15 + 1 = 16. Ninguna corrección de ChatGPT tuvo que refutarse, y ninguna afirmación de M02/M03 fue derribada por C01–C16 que M03 no hubiera derribado ya.

---

## 4. Matriz de discrepancias y trazabilidad D1–D15

| # | Punto | Misión 02 | Misión 03 | ChatGPT (C01–C16) | Resolución consolidada |
|---|---|---|---|---|---|
| D1 | AAL3 "en hardware" | "AAL3 exige autenticador hardware" (§1.6) | Corregido: no exportable, hardware es vía, no definición (corr. 02) | C02: AAL3 es nivel de garantía, no arquitectura universal | **Sin conflicto:** C02 confirma M03 y añade el punto de alcance. Queda la precisión del propietario sobre el entorno protegido (ver §11 A2) y U1 (ver §7). |
| D2 | Ed25519 y fechas PQC | Borrador IR 8547: solo 112-bit deprecado tras 2030 (§5.2) | Corregido: IR 8547 final depreca todo tras 2030, disallow tras 2035 (corr. 03) | C14: "no implica expiración automática y universal de Ed25519" | **Conflicto real si C14 se lee sin matiz. Prevalece M03.** No hay expiración criptográfica automática, pero sí fechas normativas 2030/2035 bajo NIST. C14 es PARCIALMENTE CONFIRMADA. No usar C14 para revertir la corrección 03 de M03. |
| D3 | 3-2-1-1-0 | "EVIDENCIA como práctica, no norma" (§4.1) | Corregido: regla de vendedor Veeam, no estándar (corr. 04) | C15: práctica operativa, no certificación, no garantiza recuperación | **Sin conflicto:** C15 confirma M03. |
| D4 | Límites físicos / EUV | ">1.000 pasos; físicamente imposible" como EVIDENCIA (§4.4) | Degradado a HYPOTHESIS/UNKNOWN (corr. 05) | C16: límites prácticos/materiales con evidencia, no teoremas | **Sin conflicto:** C16 confirma M03. |
| D5 | Divergencia HELM/lm-eval 4–5 pt | EVIDENCIA (§3.3) | No verificada: HYPOTHESIS/UNKNOWN (corr. 05) | C11 no repite la cifra; aporta maquinaria estadística | **Sin conflicto; la cifra sigue sin verificarse (U5).** C11 no la repara. |
| D6 | A2A | UNKNOWN, no verificado (§3.1) | Silencio | C05: proyecto abierto bajo Linux Foundation; no es estándar de identidad/autorización | **C05 cierra el UNKNOWN con verificación en vivo de la spec.** Sin conflicto. |
| D7 | Safetensors | Una línea, "sin ejecución de código", sin mayor profundidad (§3.2) | Silencio | C06: no demuestra pesos confiables/seguros/benignos | **C06 completa el alcance; sin conflicto.** |
| D8 | Doble maestro JSONL/SQLite | "Dos capas: archivo canónico en texto plano/JSONL + SQLite" (§2.1) | Corrigió estatus de JSONL (convención) y exigió canonicalización, pero no señaló el doble maestro | C07: definir una canónica y la otra como vista | **Laguna de M03 cerrada por C07.** Corrección material que sobrevive. Prevalece la formulación del propietario (ver C07). |
| D9 | Cola Core–Labs | Esquema validado + límites tamaño/frecuencia (§6.1) | Silencio sobre la cola | C12: autenticación, autorización por mensaje, anti-replay, contenido hostil (las 4 incorporaciones; "recursos" = límites de tamaño/frecuencia, ya existentes en M02) | **Laguna de M03 cerrada por C12** (4 de 6 controles nuevos). |
| D10 | Restauración / cuarentena | 4 pasos con verificación, sin etapa de cuarentena nombrada (§2.4) | Cuarentena exigida para memoria experimental, no para restauración | C09: cuarentena y verificación antes de activar; distinguir copiar/verificar/restaurar | **Laguna de M03 cerrada por C09** (etapa nombrada; la cuarentena es PROPOSAL, no requisito NIST — ver U7). |
| D11 | Firmas Git | "Versiona texto; no versiona autoridad" (§1.7) | Integridad textual verificable; eso es todo lo que prueba (§C) | C03: evidencia de integridad/autoría, no de autoridad | **Sin conflicto:** C03 confirma M02. Redundante, no correctiva. |
| D12 | Frontera del Core | "Core mínimo; lo demás detrás de adaptadores" (§5.1) | Autor+ejecutor+auditor viola AC-5/AC-6 (riesgo 10) | C10: Core concentra autoridad/política, no ejecuta | **Sin conflicto en sustancia; precisión del propietario adoptada** (ver §11 A3): la hoja del propietario limita la atribución a NIST. |
| D13 | Merkle y ausencia de eventos | "Un Merkle con diseño adecuado sí [prueba ausencia]" (§2.3) | No prueba completitud ni evento omitido (§3) | C08: no demuestran ausencia de eventos | **M02–M03 en desacuerdo; C08 se alinea con M03. Prevalece M03/C08. La cláusula de M02 debe retirarse.** |
| D14 | 200–500 casos | "Regla operativa PROPUESTA" (§3.3) | Degradó la cifra HELM asociada | C11: heurística, no garantía estadística | **Sin conflicto:** C11 confirma la etiqueta de M02 y añade maquinaria. |
| D15 | GGUF | Límites ya listados (§3.2) | De facto, no estándar formal | C13: facilita ejecución local; no garantiza ejecución útil | **Sin conflicto:** C13 confirma M02. |

**Trazabilidad:** cada fila D1–D15 cita la sección exacta de M02 (§), de M03 (§/corrección) y la corrección C correspondiente de §3. Las únicas resoluciones con prevalencia explícita son D2 (M03 sobre C14 sin matiz) y D13 (M03/C08 sobre M02). Las lagunas de M03 cerradas por ChatGPT son D8, D9 y D10.

---

## 5. Correcciones materiales supervivientes (12)

Lista consolidada de la hoja del propietario (12). Clasificación:

**A. Genuinamente nuevas (5) — no estaban en M02 ni en M03:**
1. **C05 — A2A:** fijar versión y mantener identidad/autorización fuera de la suposición de que el protocolo las resuelve.
2. **C06 — Safetensors:** separar seguridad del formato, procedencia de pesos y seguridad del código de ejecución.
3. **C07 — Fuente canónica:** impedir que JSONL y SQLite se conviertan en maestros divergentes.
4. **C09 — Restauración:** verificar antes de activar; mantener la cuarentena como propuesta explícita.
5. **C12 — Cola Core–Labs:** añadir autenticación, autorización, anti-replay y tratamiento de contenido hostil.

**B. Confirmaciones de las correcciones materiales de M03 (4) — no nuevas, pero revalidadas contra una tercera fuente:**
6. **C02 — AAL3:** precisar el entorno protegido y la no exportabilidad.
7. **C08 — Merkle:** corregir cualquier afirmación de prueba absoluta de ausencia.
8. **C15 — Backups:** mantener 3-2-1-1-0 como práctica y no como certificación.
9. **C16 — Fabricación:** conservar la conclusión práctica y retirar afirmaciones absolutas no demostradas.

**C. Precisiones reforzadas (2):**
10. **C10 — Core:** formular la separación como principio arquitectónico de Nexo, sin atribuir a NIST una prohibición que no expresa.
11. **C11 — Evaluación:** mantener los tamaños de muestra como heurística y exigir metodología reproducible.

**D. Corrección a la corrección (1):**
12. **C14 — PQC:** mantener explícitos los hitos 2030, 2031 y 2035. La mitad de agilidad/planificación es correcta; la mitad de "no expiración" debe completarse con IR 8547 final: Ed25519 deprecated tras 2030, disallowed tras 2035 bajo normas NIST (firmas PQC para sistemas federales de alto valor antes del 31-12-2031). No usar C14 para revertir la corrección 03 de M03.

**Nota de conteo (ver §11 B1):** M03-B listó 11 correcciones materiales (5 nuevas + C02, C15, C16, C04, C08 + C14). La hoja del propietario lista 12: añade C10 y C11 y no lista por separado C04 (que permanece CONFIRMADA en §3 y trazada en §5, sin fila en la matriz D1–D15 porque no hubo discrepancia sobre ella; corrección R2). El conteo consolidado adoptado es **12**, el de la hoja del propietario, que es la base de consolidación.

No sobrevive nada como refutación: ninguna corrección de ChatGPT fue refutada, y ninguna afirmación de M02/M03 fue derribada por C01–C16 que M03 no hubiera derribado ya.

---

## 6. Registro de riesgos

### 6.1 Riesgos nuevos R1–R7 (M03-B)

| ID | Riesgo | Tratamiento documental |
|---|---|---|
| R1 | Suplantación o manipulación de Agent Cards A2A | Tarjetas y descripciones se tratan como entrada no confiable; verificar firma y origen cuando corresponda. Afirmaciones separadas por nivel (corregido en R1, 2026-11-06): (a) **EVIDENCE, verificado en vivo en la spec (M03-B, C05):** la Agent Card es un documento JSON con identidad, capacidades, skills, endpoint y requisitos de autenticación (§5.1), y la autorización es "implementation-specific" (§4.6); la identidad no se transmite en los payloads JSON-RPC, sino en la capa HTTP (§3.3). (b) **Secundario, no EVIDENCE:** la firma JWS de la tarjeta es opcional (MAY, §8.4) y la verificación por el cliente es SHOULD, no MUST — ambas afirmaciones proceden de un análisis secundario de la spec y no fueron leídas verbatim en la primaria en M03-B; por tanto no se etiquetan como EVIDENCE. (c) **Inferencia (no hecho demostrado):** que una tarjeta sin firmar no prueba quién la publicó se deduce de (b), no es una afirmación verificada en la spec. El riesgo se conserva: una tarjeta sin firmar es entrada no confiable, de la misma clase que M03 T5 (tool poisoning) pero en el plano agente-a-agente. **Pendiente de verificación:** lectura verbatim de la spec §8.4 para confirmar MAY/SHOULD en la primaria. |
| R2 | Ejecución durante conversión de pickle y código remoto | Separar carga de pesos, conversión, código externo y ejecución; exigir procedencia y aislamiento. Afirmaciones separadas por fuente y etiqueta (corregido en R1, 2026-11-06): (a) **EVIDENCE, verificado en vivo 2026-11-06:** la documentación oficial de Python (`pickle`, https://docs.python.org/3/library/pickle.html) advierte que "The `pickle` module is not secure. Only unpickle data you trust" y que "malicious pickle data will execute arbitrary code during unpickling". (b) **HYPOTHESIS:** que convertir un checkpoint pickle a safetensors exija cargar (deserializar) el pickle una vez — el paso arriesgado — es una inferencia del flujo de conversión, no una verificación directa de una herramienta de conversión concreta en este expediente; se conserva como HYPOTHESIS, no como hecho demostrado. (c) **EVIDENCE (corroborado):** `trust_remote_code=True` ejecuta código Python del repositorio (documentación de Hugging Face Transformers, corroborada por ≥2 fuentes independientes que la citan; la página primaria no se leyó línea a línea en este run), anulando la protección del formato. (d) **EVIDENCE, verificado en vivo (M03-B):** el README de safetensors define "Safe" exclusivamente como no-ejecución de código arbitrario en la carga; no cubre el código que acompaña al repositorio. (e) **PROPOSAL:** la conversión en sandbox, el pinning a commit y la verificación de procedencia. |
| R3 | Confundir firma Git verificada con autoridad vigente | Verificar la clave contra la lista de autoridades aplicable al momento de la decisión. GitHub conserva el registro de verificación aunque la clave se revoque, expire o el contribuidor abandone la organización; los commits antiguos siguen "Verified". (EVIDENCE: GitHub Docs, index.) |
| R4 | SSRF y abuso de webhooks/push notifications A2A | Validar destinos, restringir conexiones y aplicar controles de red. La explotabilidad concreta depende de la implementación. La spec prevé autenticación secundaria en tarea (§4.5, verificado en vivo) y push notifications a webhooks del cliente; el análisis secundario de la spec advierte de abuso de push notifications (incluido SSRF) y de delegación demasiado amplia. No verificado en vivo en este run: se registra como **HYPOTHESIS**/riesgo a confirmar contra la spec antes de cualquier adopción. |
| R5 | Inyección indirecta mediante la cola Core–Labs | Autenticar y autorizar mensajes; tratar contenido como datos, nunca como instrucciones privilegiadas. Un mensaje con esquema válido puede llevar contenido hostil generado por el modelo o por Labs; la validación de esquema no sanitiza semántica. C12 mitiga, pero el riesgo enlaza C12 con M03 T4 (inyección indirecta, probabilidad alta). |
| R6 | Interpretación errónea de C14 y retraso de migración PQC | Mantener inventario de firmas y calendario de transición; revisar en D-11. Si C14 se lee como "Ed25519 no tiene fecha límite", Nexo puede llegar a 2030 sin plan de migración. Riesgo de calendario, no criptográfico. |
| R7 | Deriva de versión A2A | Fijar versión, especificación normativa y nombres de recursos; no citar simplemente «A2A». La página de la spec leída en vivo es versión `dev` y en §5.3 aún indica el well-known `agent.json`, mientras que v1.0 usa `agent-card.json`. (EVIDENCE: página leída en vivo.) |

Las probabilidades y severidades no se consideran medidas mientras no exista análisis cuantitativo o evidencia de implementación.

### 6.2 Riesgos arquitectónicos omitidos de M03 (13)

1. Tercero de confianza oculto en cada "descentralización" (registro, testigo, quorum, proveedor).
2. Umbral = umbral de ataque (colusión/coerción de T).
3. Sucesión/incapacidad sin procedimiento legal/técnico.
4. VC sin status no revocable; status list reintroduce disponibilidad.
5. Hash sin anclaje = auto-certificación; cola truncable.
6. Consolidación/resumen como pérdida silenciosa; CRDT como "verdad".
7. Lúmina sin barrera de promoción = contaminación de canónica.
8. Alias de modelo = cambio silencioso; pinning con fecha de caducidad.
9. PQC: firmas RSA/ECC con caducidad normativa 2030/2035; re-firma no planificada.
10. Agente autor+ejecutor+auditor viola AC-5/AC-6.
11. Ejecución de código generado sin sandbox desechable.
12. Olvido vs inmutabilidad sin diseño (tombstone/crypto-shredding).
13. Dependencia de proveedor único (modelo, MCP server, EUV, ledger) sin plan de salida.

### 6.3 Matriz de amenazas y escenarios de fallo T1–T14 (M03)

| # | Amenaza | Vector | Impacto | Probabilidad* | Detección | Mitigación exigible |
|---|---|---|---|---|---|---|
| T1 | Compromiso clave raíz did:key | Robo/phishing/malware | Pérdida total identidad, sin revocación | Media | Solo si se monitoriza uso | Rotación con registro, VC con status, expiración corta, HSM/vault qube |
| T2 | Recuperación fraudulenta (SLIP-39) | Colusión/coerción T tenedores | Robo total, indistinguible de recuperación legítima | Media | Ninguna sin registro | Quorum + retardo + impugnación + registro inmutable + autenticación tenedores |
| T3 | Propietario incapacitado/muerto | Sin sucesor designado | Identidad/autoridad bloqueada o usurpada | Baja-Media | — | Sucesor + quorum + retardo + acreditación externa (legal) |
| T4 | Inyección indirecta vía herramienta | Issue/email/web malicioso | Exfiltración, borrado, envío no autorizado | Alta | Baja (sin revisión) | Least privilege, aprobación humana, validación resultados |
| T5 | Tool poisoning / rug pull | Descripción MCP cambiada | Escalada silenciosa, shadowing | Media-Alta | Baja sin hash de descripciones | Pin+hash descripciones, re-revisión, allowlist |
| T6 | Cambio silencioso snapshot | Alias flotante / serving-side | Drift, regresión, ruptura de tareas | Alta | Solo con eval propia + fingerprint | Pin snapshot fechado, eval propia, registro, fecha caducidad |
| T7 | Falsa memoria / Lúmina contamina canónica | Promoción automática | Hechos falsos con autoridad | Media | Baja sin etiqueta | Etiqueta experimental, TTL, cuarentena, promoción firmada por humano |
| T8 | Sincronización propaga corrupción | Ransomware / borrado / error | Pérdida en todas las réplicas | Media | Solo con backup inmutable | Backup ≠ sync, copia inmutable offline, test restauración |
| T9 | Truncamiento / reescritura de log | Atacante con control del log | Historia reescrita, detección nula sin anclaje | Media | Solo con STH externo | STH anclado externo, monitores independientes, `tree_size` |
| T10 | Escape contenedor / qube | Bug kernel/Xen, mount, root | Escalada a host / dom0 | Baja | Monitorización | VM > contenedor para no confiable, rootless, sin mounts, IOMMU |
| T11 | Proveedor retira modelo/servidor | Deprecación, quiebra, sanción | Capacidad cognitiva perdida | Media | Calendario proveedor | Multi-proveedor, modelo local, plan de salida, re-cualificación |
| T12 | Cripto cuántica / caducidad PQC | Harvest-now-decrypt-later | Firmas/VC antiguas no confiables tras 2035 | Baja hoy, crece | — | Migrar a ML-DSA/SLH-DSA, híbridos, re-firma planificada |
| T13 | Conflicto memoria no resuelto | Dos fuentes contradictorias | Decisión sobre hecho falso | Media | Solo si se conserva conflicto | Conservar ambas + procedencia, marcar conflicto, resolución humana |
| T14 | Olvido imposible / retención ilegal | Log inmutable + dato a borrar | Incumplimiento legal / dato erróneo perpetuo | Media | — | Tombstone / crypto-shredding diseñado, no improvisado |

\* Probabilidad cualitativa de juicio, no métrica medida — **HYPOTHESIS**, no EVIDENCE.

### 6.4 Requisitos a preservar de M03 (12, mínimos, no negociables sin sustituto documentado)

1. **Identidad:** método con rotación + revocación + status consultado por verificadores; did:key solo para efímero (días-semanas) o con HSM y aceptación explícita de no-revocación.
2. **Autenticación:** AAL3 = no-exportable + phishing-resistant + 2 factores; sincronizables solo ≤AAL2; claves raíz en vault/HSM separado del agente.
3. **Autorización:** capabilities con scope, expiración y revocación, separadas de identidad; agente nunca auto-autoriza escritura/borrado/envío.
4. **Custodia:** canónica append-only + hash + STH anclado externo; esquema documentado; backup inmutable offline ≠ sync; test de restauración con 0 errores.
5. **Recuperación:** SLIP-39 solo con T≥2, autenticación de tenedores, retardo + impugnación, registro; sucesor designado con procedimiento legal.
6. **Constitución:** texto canónico UTF-8 + canonicalización + hash + firma + versionado SemVer-like; cada cambio de modelo/snapshot/prompt = re-cualificación con eval propia fijada.
7. **Memoria:** procedencia en cada registro; experimental etiquetado + TTL + cuarentena; promoción solo firmada por promotor distinto; conflictos conservados, no sobrescritos.
8. **Aislamiento:** Lúmina en VM/qube separado, sin claves canónicas, sin escritura a canónica, egress filtrado; código no confiable solo en desechable sin red/credenciales.
9. **Herramientas:** allowlist, pin+hash de descripciones, re-revisión ante cambio, aprobación humana en acciones destructivas, tokens por servidor.
10. **Modelos:** pin snapshot fechado, fingerprint, eval propia, fecha de caducidad y plan de sustitución; nunca alias flotante en producción.
11. **PQC:** inventario de firmas RSA/ECC, plan de migración a ML-DSA/SLH-DSA antes de 2030, re-firma/re-emisión.
12. **Auditoría:** registro inmutable de quién hizo qué, con qué clave, qué herramienta y qué modelo — separado de la función auditada (AC-5/SC-3).

---

## 7. Registro UNKNOWN U1–U9

**Estados fijados por el propietario en su hoja consolidada (no se cambian en este expediente):**

| ID | Tema | Estado |
|---|---|---|
| U1 | Texto exacto de AAL3 en SP 800-63B-4 | **RESUELTO** (decisión del propietario; verificación verbatim pendiente) |
| U2 | Norma que prescriba 200–500 casos | UNKNOWN |
| U3 | Exhaustividad de estándares de identidad y delegación de agentes | UNKNOWN |
| U4 | Gobernanza y versiones A2A posteriores a las fuentes primarias disponibles | PARCIAL |
| U5 | Diferencia de 4–5 puntos entre HELM y lm-eval | UNKNOWN |
| U6 | Afirmación de más de 1.000 pasos EUV e imposibilidad física | UNKNOWN |
| U7 | Exigencia normativa de una etapa denominada cuarentena | UNKNOWN |
| U8 | Verificación directa del trabajo de Miller (2024) | UNKNOWN |
| U9 | Demostración de ausencia de eventos no registrados mediante Merkle | UNKNOWN |

Motivos (M03-B, conservados):
- **U1:** heredado de M03 y no resuelto en M03-B: la landing CSRC se leyó en vivo, pero el PDF normativo completo no se leyó línea a línea. La corrección "no exportable, no hardware" descansa en ≥2 resúmenes independientes que citan el Ap. E; no se presenta como cita verbatim. **Precisión del propietario adoptada (ver §11 A1):** la hoja del propietario marca U1 RESUELTO; M03-B lo dejó pendiente por no haberse leído verbatim el PDF de SP 800-63B-4. Este expediente adopta el estado del propietario; queda pendiente solo la verificación documental verbatim, no una decisión. No se declara verificada una lectura que no se hizo.
- **U2:** ninguna norma localizada en M02, M03 ni M03-B prescribe 200–500 casos (o cualquier N) para evaluar un agente. El número sigue siendo heurística por construcción; no es un UNKNOWN por falta de búsqueda, sino por ausencia de norma localizada (la ausencia no se demuestra exhaustivamente).
- **U3:** UCAN (ucan-wg/spec v1.0, trabajo comunitario) y ZCAP-LD (borrador CCG v0.4.0) no se re-verificaron en M03-B; su estatus es heredado de M02. No se afirma que no exista nada: solo que nada localizado lo resuelve para Nexo.
- **U4:** la spec leída en vivo (versión `dev`) no menciona a la Linux Foundation en su texto; las fechas (donación junio 2025, AAIF agosto 2026, v1.0.0 12-03-2026, v1.0.1 mayo 2026) proceden de fuentes secundarias. La nota de prensa de la Linux Foundation del 23-06-2025 fue verificada durante la construcción del documento M03-B (donación), pero el alojamiento en la Agentic AI Foundation y la fecha de la v1.0.1 siguen apoyados en secundarias. Estado PARCIAL.
- **U5:** heredado de M03; C11 no la repara ni la verifica. Motivo: ninguna comparación primaria localizada.
- **U6:** heredado de M03; C16 reformula, no verifica. Motivo: ninguna fuente primaria localizada lo cuantifica así.
- **U7:** ningún control localizado usa ese término para restaurar (CP-10/CP-10(4) exigen restaurar desde información controlada e íntegra que represente un estado conocido). La cuarentena con ese nombre es PROPOSAL.
- **U8:** Miller (2024), arXiv:2411.00640, citado vía fuente secundaria; el paper no se leyó en este run. La maquinaria estadística de C11 se apoya además en el cálculo binomial propio y en HELM, no solo en Miller.
- **U9:** la frase de M02 §2.3 "un Merkle con diseño adecuado sí [prueba ausencia]" es ambigua (¿ausencia de qué, respecto a qué STH?); se resolvió a favor de la lectura M03/C08, pero no se localizó un diseño Merkle que pruebe la ausencia de eventos no registrados.

UNKNOWN no significa falso ni verdadero. No puede transformarse en PASS por repetición documental.

**Correspondencia con los UNKNOWN de M03 (9, lista anterior):** correcciones de ChatGPT (resuelto por M03-B, ya no UNKNOWN) · texto verbatim SP 800-63B-4 §2.3.2/Ap. B (→ U1) · fechas exactas DID 19-07-2022 / VC 15-05-2025 en extracto primario (corroboradas, no en líneas leídas; se conservan como salvedad de método en §12, no como UNKNOWN abierto) · cifra HELM/lm-eval 4–5 pt (→ U5) · ">1.000 pasos" EUV e imposibilidad física (→ U6) · periodo de garantía de snapshots OpenAI (fuentes secundarias en conflicto: 3 vs 6 vs 12 meses según tipo; se conserva como limitación en §11, no renumerado en U1–U9) · existencia/no-existencia exhaustiva de estándar de versionado de Constitución (→ U3 en sentido amplio; búsqueda sin resultado ≠ prueba de inexistencia) · equivalencia semántica entre modelos (sin métrica demostrada; se conserva como fallo estructural central en §1) · sucesión legal aplicable (jurisdicción no especificada; se conserva como limitación en §11).

---

## 8. Matriz de impactos D-01 a D-12

Estos impactos identifican dónde una decisión futura podría necesitar la información. **No resuelven ninguna decisión.** Todas **SIN DECIDIR**.

| Decisión | Información relevante | Correcciones que la afectan | Estado |
|---|---|---|---|
| D-01 | Identidad, autenticación, claves y transición criptográfica | C01, C02, C14 | SIN DECIDIR |
| D-02 | Autenticación y recuperación | C01, C02 | SIN DECIDIR |
| D-03 | Autoridad de enmienda y claves autorizadas | C03 | SIN DECIDIR |
| D-04 | Anclaje y verificación de registros | C08 | SIN DECIDIR |
| D-05 | Fuente canónica, almacenamiento y restauración | C05, C07, C08, C09, C15 | SIN DECIDIR |
| D-06 | Protocolo e interoperabilidad | C04, C05 | SIN DECIDIR |
| D-07 | Evaluación y sustitución de modelos | C11, C13 | SIN DECIDIR |
| D-08 | Autorización y frontera Core–Labs | C01, C02, C10, C12 | SIN DECIDIR |
| D-09 | Ejecución, herramientas y cadena de suministro | C06, C10, C12 | SIN DECIDIR |
| D-10 | Recuperación y límites operativos | C09, C14, C15, C16 | SIN DECIDIR |
| D-11 | Agilidad criptográfica y calendario PQC | C14 | SIN DECIDIR |
| D-12 | Dependencias materiales y continuidad tecnológica | C16 | SIN DECIDIR |

Cruces con Misión 01 (heredados de M02, sin cambio): D-08 profundiza su decisión 5; D-09 la 6; D-05 recoge la 2, la 7 y la 8; D-04 es la pieza que la M01 dejó abierta en la 7; D-06/D-07 profundizan la 3. Nuevas en M02, sin equivalente en M01: D-01, D-02, D-03, D-10 y D-12. Orden sugerido (sugerencia, no decisión): D-01, D-02, D-03 primero, luego D-08 y D-09, luego D-05.

---

## 9. Reglas de interpretación obligatorias

- "EVIDENCE" solo cuando exista fuente identificable y alcance verificable.
- "PROPOSAL" identifica una opción de diseño, no una decisión aprobada.
- "HYPOTHESIS" identifica una posibilidad aún no medida o demostrada.
- "UNKNOWN" identifica una cuestión no resuelta.
- "PASS" exige evidencia de implementación y pruebas aplicables; no se concede por documentación.
- Las fuentes secundarias no deben presentarse como lectura directa de una fuente primaria.
- Una norma o recomendación no debe ampliarse más allá de su ámbito de aplicación.
- Las decisiones D-01 a D-12 pertenecen exclusivamente al propietario.
- No se convierte una propuesta en requisito normativo. No se inventan referencias, pruebas, resultados ni verificaciones. No se convierte UNKNOWN en verdadero o falso mediante inferencias. Se distingue claramente entre hechos de las fuentes, correcciones documentales e interpretaciones.

---

## 10. Criterio de cierre documental

La auditoría M02 → M03 → M03-B podrá cerrarse cuando:

1. Se incorporen estas erratas a una versión consolidada.
2. Se corrijan los conteos y etiquetas de evidencia señalados.
3. Se conserven los UNKNOWN sin rellenarlos por inferencia.
4. Se mantengan D-01 a D-12 como "SIN DECIDIR".
5. Se declare expresamente que el documento no autoriza implementación.

**Declaración expresa:** este expediente no constituye especificación ejecutable, aprobación de arquitectura ni autorización para alterar NCS M0 o P07. No autoriza implementación.

**Conclusión:** la investigación queda consolidada como referencia documental condicionada. No constituye especificación ejecutable, aprobación de arquitectura ni autorización para alterar NCS M0 o P07.

---

## 11. Informe de autocontrol

### A. Precisiones del propietario adoptadas y verificaciones documentales pendientes (resuelto en R1, 2026-11-06)

En la entrega anterior estos tres puntos se presentaron como "divergencias pendientes de decisión del propietario". Esa clasificación era incorrecta: el propietario **ya proporcionó** las tres precisiones en su hoja consolidada de erratas (P7), y este expediente las adopta como redacción prevalente. Lo que queda pendiente no son decisiones del propietario, sino **verificaciones documentales**. Las decisiones reservadas al propietario siguen siendo únicamente D-01 a D-12, todas SIN DECIDIR (§8).

**A1. U1 — Precisión del propietario adoptada: RESUELTO.** La hoja del propietario (P7) fija U1 como RESUELTO "en esta revisión documental". M03 y M03-B lo habían dejado pendiente porque el PDF normativo completo de SP 800-63B-4 no se leyó línea a línea; la corrección "no exportable, no hardware" descansa en ≥2 resúmenes independientes que citan el Ap. E. Este expediente adopta el estado del propietario (U1 RESUELTO, §7). **Verificación documental pendiente (no una decisión):** leer el PDF de SP 800-63B-4 línea a línea (§2.3.2, Ap. B, Ap. E) para cerrar U1 con evidencia primaria. **No se declara verificada una lectura verbatim que no se hizo.**

**A2. C02 — Precisión del propietario adoptada: entorno protegido por hardware.** M03-B anotó como matiz que varios resúmenes del §2 de SP 800-63B-4 describen además un "hardware-protected, isolated environment" para la clave AAL3, y advirtió no presentar la formulación de M03 como cita verbatim del §2.3.2. La hoja del propietario fija como redacción prevalente: "autenticador criptográfico no exportable en entorno aislado protegido por hardware o procesador separado con interfaz controlada. No exige necesariamente una llave externa." La precisión es coherente con los resúmenes citados, pero **no es una cita verbatim verificada en vivo**; se adopta como redacción del propietario, no como cita primaria. **Verificación documental pendiente (no una decisión):** lectura verbatim del §2 de SP 800-63B-4.

**A3. C10 — Precisión del propietario adoptada: lectura limitada de NIST sobre el Core.** M03-B formuló que un bucle de ejecución dentro del Core viola SC-3/AC-5/AC-6 "por diseño". La hoja del propietario precisa: "NIST respalda separación de deberes y mínimo privilegio, pero no declara que todo bucle de ejecución dentro de un Core viole automáticamente sus controles." La precisión del propietario es correcta como lectura de alcance de la norma (los controles son requisitos a implementar y evidenciar, no una prohibición literal de una arquitectura concreta) y se adopta como redacción prevalente en §3 C10. La separación sigue siendo principio arquitectónico de Nexo (PROPOSAL), no prohibición literal de NIST. **No queda ninguna decisión pendiente en A3:** la redacción prevalente está fijada por el propietario.

### B. Inconsistencias encontradas y cómo se resolvieron

**B1. Conteo de correcciones materiales supervivientes: 11 (M03-B) vs 12 (hoja del propietario).** M03-B listó 11: 5 nuevas + C02, C15, C16, C04, C08 + C14. La hoja del propietario lista 12: 5 nuevas + C02, C08, C15, C16 + C10, C11 + C14; no lista por separado C04. **Resolución:** el conteo consolidado es **12** (hoja del propietario, base de consolidación). C04 permanece CONFIRMADA en §3 y trazada en §5; no hay pérdida de sustancia. (Corrección R2: no existe fila de C04 en la matriz D1–D15 de §4.) C10 y C11 se incluyen como precisiones reforzadas (§5 C).

**B2. M02 §2.3, contradicción interna sobre Merkle y ausencia.** M02 dice a la vez que "un log no prueba que un evento *no ocurrió* (ausencia) salvo con diseños específicos" y que "un Merkle con diseño adecuado sí [prueba ausencia]". **Resolución:** prevalece M03/C08 (D13); la cláusula de M02 se retira y la redacción prevalente es la de C08 (§3). U9 conserva la ambigüedad residual como UNKNOWN.

**B3. M02 §2.1, ambigüedad de doble maestro.** M02 llama "canónico" al archivo JSONL y a la vez presenta SQLite como segunda capa de trabajo sin regla de precedencia. **Resolución:** C07 (D8); redacción prevalente del propietario adoptada en §3 C07. No es un error de hecho de M02, es ambigüedad; así se etiqueta.

**B4. M02 §1.6, AAL3 "en hardware".** Error confirmado por M03 (corr. 02) y C02. **Resolución:** redacción prevalente de C02 (§3), con la precisión del propietario adoptada (A2, §11).

**B5. M02 §5.2, PQC según borrador IR 8547.** Error confirmado por M03 (corr. 03). **Resolución:** redacción prevalente de C14 con fechas (§3); C14 no revierte la corrección de M03 (D2).

**B6. M02 §4.1, 3-2-1-1-0 sin origen de vendedor.** M02 la presentaba como "EVIDENCIA como práctica, no norma" sin nombrar a Veeam. **Resolución:** corrección 04 de M03 + C15; redacción prevalente en §3 C15.

**B7. M02 §3.3 y §4.4, cifras sin verificación primaria.** HELM/lm-eval "4–5 puntos" (M02 citaba análisis secundario de Stanford CRFM 2024) y EUV ">1.000 pasos / físicamente imposible" (M02 citaba fuentes secundarias 2026). **Resolución:** degradadas a HYPOTHESIS/UNKNOWN por M03 (corr. 05), confirmadas por C16 y no reparadas por C11; U5 y U6 conservan el estado UNKNOWN.

**B8. M02 §3.1, A2A UNKNOWN vs M03 silencio.** M03 no trató A2A. **Resolución:** C05 cierra el UNKNOWN con verificación en vivo de la spec (D6); U4 conserva como PARCIAL lo relativo a gobernanza y versiones posteriores.

**B9. M03 §H, correcciones de ChatGPT UNKNOWN.** M03 clasificó ese punto UNKNOWN por falta del texto fuente. **Resolución:** no es una contradicción; el texto se proporcionó después y M03-B lo evaluó (15 CONFIRMADA, 1 PARCIALMENTE). El UNKNOWN H de M03 queda cerrado por M03-B y no se arrastra a U1–U9.

**B10. Duplicaciones sin contradicción (confirmaciones, no errores).** C01, C03, C08, C10 y C13 ya estaban dichas en M02; C02, C04, C15 y C16 repiten correcciones de M03. Se señalan como tales en §3 para no contarlas como descubrimientos nuevos. La matriz de trazabilidad (§4) las marca "sin conflicto".

**B11. Etiquetas de evidencia en M02, correcciones aplicadas.** M02 etiquetó como EVIDENCIA: (a) HELM/lm-eval 4–5 pt (§3.3) — degradado a HYPOTHESIS/UNKNOWN; (b) EUV >1.000 pasos e imposibilidad física (§4.4) — degradado a HYPOTHESIS/UNKNOWN; (c) AAL3 "en hardware" (§1.6) — corregido; (d) did:key implícitamente como estándar W3C (§1.2, "W3C CCG, v0.9, no Recomendación" sí se decía en M02, pero el estatus se presentaba de forma que invitaba a tratarlo como estándar) — corregido por M03 (corr. 01): es borrador CCG v0.9. Todas las etiquetas corregidas quedan registradas en §3 con su veredicto.

**B12. Referencias cruzadas verificadas.** Se comprobó que cada C01–C16 cita la sección de M02 indicada en M03-B contra el informe M02 leído íntegro (§1.5/§1.6/§1.7, §2.1/§2.3/§2.4, §3.1/§3.2/§3.3, §4.1/§4.4, §5.1/§5.2, §6.1) y que cada D1–D15 tiene resolución en §4. Se comprobó que los documentos entregados (P2, P4, P6) contienen los mismos contenidos que sus informes (verificación por extracción de texto: P2 D-01 a D-12 SIN DECIDIR ×12; P4 matriz T1–T14; P6 matriz C01–C16; P7 verificada contra el PDF de 4 páginas A4). El artefacto P7 almacena su contenido en datos JS embebidos; se verificó por conteo en el código fuente (C01–C16 presentes) y por extracción del PDF.

**B13. Errores editoriales demostrables corregidos.** (i) En M03-B, la fecha de VC 2.0 se cita como 15-05-2025 (corroborado) mientras M02 decía "mayo 2025" — unificado como 15-05-2025 corroborado, no en líneas leídas (salvedad de método, §12). (ii) En M02, la fuente #12 (SP 800-53 SC-3) se citaba vía resumen secundario de UpGuard; en §12 se marca como secundaria y se cita la primaria SP 800-53 Rev. 5. (iii) En M02, la fuente #14 (SLSA) se citaba vía glosario secundario de socket.dev y la #16 (GGUF) vía análisis secundario; en §12 se marcan como secundarias. (iv) En M02 §3.3, la cifra "Claude 2.1 perdió 5 puntos… GPT-4, 4 puntos" se presentaba como EVIDENCIA desde un análisis secundario; en §3 C11/U5 queda como no verificada. Ninguna corrección editorial alteró el significado ni la autoridad del propietario.

**B14. Correcciones de la revisión R1 (2026-11-06, cinco puntos, sin rehacer el documento).** (1) C12: el conteo "tres de cinco" era aritméticamente incoherente (la lista tiene seis controles); corregido a seis controles totales, dos preexistentes en M02 y cuatro incorporaciones, en §3 (C12), §4 (D9) y §5. Los ordinales "(1–5 de 5)" de las aportaciones genuinamente nuevas no son ese conteo: numeran las cinco aportaciones nuevas (C05, C06, C07, C09, C12) y se conservan. (2) R1: la etiqueta EVIDENCE aplicada a la opcionalidad de la firma JWS (§8.4) y al SHOULD de verificación se retiró; esas afirmaciones proceden de análisis secundario y quedan como secundarias, con lo verificado en vivo en la spec separado y la inferencia marcada como tal. (3) R2: las afirmaciones se separaron en (a) pickle inseguro — EVIDENCE verificado en vivo en la documentación oficial de Python; (b) conversión pickle→safetensors exige cargar el pickle — HYPOTHESIS, inferencia no verificada contra una herramienta concreta; (c) `trust_remote_code=True` ejecuta código del repositorio — EVIDENCE corroborado; (d) alcance de safetensors — EVIDENCE verificado en vivo; (e) sandbox/pinning/procedencia — PROPOSAL. (4) A1–A3: reclasificados de "divergencias pendientes de decisión del propietario" a precisiones del propietario ya proporcionadas y adoptadas, con verificaciones documentales pendientes que no son decisiones; D-01 a D-12 siguen SIN DECIDIR. (5) Anexo A: manifiesto completado con nombre, ruta, tamaño, SHA-256 calculado sobre el archivo real y estado de verificación de cada entregable, incluido el HTML final. Ninguna de estas correcciones eliminó ni resumió contenido válido; no se modificaron C01–C16 fuera de los cinco puntos, salvo la dependencia directa documentada en (2) sobre C05 (firma opcional de tarjetas, ahora marcada como secundaria).

### D. Informe de cambios R1 y estado final (2026-11-06)

Los cinco puntos de la revisión independiente quedaron corregidos y demostrados en esta revisión: (1) conteo C12, (2) etiqueta de R1, (3) separación de afirmaciones y fuentes de R2, (4) autoridad A1–A3, (5) Anexo A completo con hashes reales. La comparación con la versión original (diff) muestra únicamente las ediciones de estos cinco puntos más la actualización del manifiesto; ningún contenido válido se perdió. **ESTADO: PARTIAL (reconciliación R2, MUSE-AUTONOMY-002, 2026-11-06).** Los cinco criterios R1 superan la comprobación en el ámbito local (ver matriz en el dictamen de auditoría independiente), pero el estado global es PARTIAL, no PASS, por dos razones que las propias reglas de este expediente imponen: (1) la regla de §9 —"PASS" exige evidencia de implementación y pruebas aplicables y no se concede por documentación— es categórica y no admite excepción para criterios de aceptación de misión; el sentido en que R1 usó "PASS" era aceptación documental de la misión, distinto del sentido epistémico de §9, y esa distinción no estaba declarada; queda declarada aquí. (2) La integridad del documento publicado en la rama del repositorio no pudo verificarse (sin acceso a GitHub) y el manifiesto del HTML entregado en R1 estaba desactualizado respecto a los archivos vigentes; ambos puntos se corrigen en R2, pero la verificación contra la rama era UNKNOWN al redactar R2; quedó verificada posteriormente el 2026-11-07 con PASS de integridad documental, según `closure-r2.md`. Las verificaciones documentales pendientes (lectura verbatim de SP 800-63B-4 §2.3.2/Ap. B/Ap. E, del PDF final de IR 8547 y de la spec A2A §8.4) quedan como limitaciones registradas en §11 C, no como incumplimientos de aceptación: no son decisiones del propietario ni condiciones del dictamen APROBADO CONDICIONADO.

### E. Cambios R2 (MUSE-AUTONOMY-002, 2026-11-06)

Versión R2 separada, preparada por la auditoría adversarial independiente de R1 (MISIÓN MUSE-AUTONOMY-002). R1 se conserva intacto como evidencia; R2 no lo sustituye. Cambios exactos respecto a R1:

1. **H-01 — Reconciliación de PASS (§11 D):** el estado global pasa de "ESTADO: PASS" a "ESTADO: PARTIAL", con la distinción explícita entre el sentido epistémico de PASS (§9: exige evidencia de implementación, no se concede por documentación) y el sentido de aceptación documental de la misión R1 (cinco criterios demostrados en el ámbito local). La integridad contra la rama era UNKNOWN al redactar R2; la comprobación posterior del 2026-11-07 resultó PASS para los artefactos publicados, según `closure-r2.md`.
2. **H-02 — Anexo A del HTML actualizado:** el manifiesto del documento web se actualiza a los archivos vigentes, incluido el PDF R1 (141.597 bytes, 28 páginas). Ver Anexo A.
3. **H-B2 — Fila A2A de §12:** §8.4 (firma JWS opcional, SHOULD) queda como análisis secundario, no "Verificado en vivo".
4. **H-03 — Cita de C03:** la cita entrecomillada que no aparecía en la página citada se sustituye por la redacción real de GitHub Docs ("previously verified commits retain their verified status… GitHub will not re-verify previously signed commits"). La sustancia de C03 no cambia.
5. **H-04 — Corroboración:** nota explícita de limitación en §12 (los resúmenes de corroboración no se nombran en este expediente; su independencia no es comprobable desde aquí) + fuentes nombradas para la corroboración del IR 8547 final.
6. **H-05 — Referencias cruzadas de C04:** la nota de conteo de §5 decía "fila D12/D4" y B1 decía "trazada en §4"; ambas corregidas: C04 permanece CONFIRMADA en §3 y trazada en §5, sin fila en la matriz D1–D15 porque no hubo discrepancia sobre ella.
7. **H-07 — U1 en §7:** la celda de estado ahora dice "RESUELTO (decisión del propietario; verificación verbatim pendiente)".
8. **H-08 — D9:** la fila distingue las 4 incorporaciones de C12 del conjunto completo de seis controles ("recursos" ya existía en M02).
9. **H-06 — Sección añadida del HTML:** la sección de informe final que solo existe en la versión web se declara como apéndice de entrega, no como parte del expediente.

**Estado de R2:** PARTIAL (bajo la regla de §9). Los cinco criterios R1 superan la comprobación en el ámbito local tras estas correcciones; la integridad del documento publicado en la rama era UNKNOWN al redactar R2; se verificó posteriormente con PASS documental el 2026-11-07 (véase `closure-r2.md`). Las verificaciones documentales pendientes (§11 C) se mantienen como limitaciones.

### C. Limitaciones restantes

1. **U1 (ver A1):** lectura verbatim del PDF de SP 800-63B-4 (§2.3.2, Ap. B, Ap. E) no realizada en ninguna de las tres misiones. El estado RESUELTO es decisión del propietario, no verificación primaria nueva.
2. **IR 8547 final (27-10-2026):** corroborado por ≥3 resúmenes independientes del final; el PDF final no se leyó línea a línea en M03 ni en M03-B. La corrección PQC descansa en esa corroboración; no se presenta como cita verbatim primaria.
3. **Fechas DID 19-07-2022 y VC 15-05-2025:** corroboradas por ≥3 secundarios; no quedaron en los extractos leídos en vivo. Salvedad de método conservada.
4. **A2A (U4):** spec leída en vivo en versión `dev`; v1.0.0 (12-03-2026), v1.0.1 (mayo 2026), donación a Linux Foundation (junio 2025) y alojamiento en Agentic AI Foundation (agosto 2026) proceden de fuentes secundarias, salvo la nota de prensa de la Linux Foundation del 23-06-2025 verificada durante la construcción del documento M03-B.
5. **Miller (2024), arXiv:2411.00640 (U8):** citado vía secundaria; paper no leído.
6. **Periodo de garantía de snapshots OpenAI:** fuentes secundarias en conflicto (3 vs 6 vs 12 meses según tipo); no verificado en primaria.
7. **Sucesión legal aplicable:** jurisdicción no especificada en la misión; sin procedimiento legal verificado.
8. **Equivalencia semántica entre modelos:** sin métrica demostrada; fallo estructural central (§1) sin solución.
9. **NIST SP 800-53 (SC-3, AC-3/5/6, SC-5/8/23, SI-10, CP-9/10):** existencia y texto corroborados por resúmenes independientes que citan la primaria; los controles se citan como requisitos a implementar y evidenciar, no como garantías por citarlos.
10. **Chen et al. arXiv:2307.09009 (drift) e Invariant Labs (tool poisoning, abr-may 2025):** citados en secundarios; los textos originales no se leyeron en M03.
11. **LoC SQLite (2018-05-29):** lista de entonces; no presentarla como lista exhaustiva actual.
12. **Verificación de los documentos entregados:** la verificación de P2/P4/P6/P7 se hizo por extracción de texto y conteo de códigos; no se re-ejecutó una auditoría de renderizado completa de cada artefacto en esta consolidación.

---

## 12. Fuentes primarias rastreables

Nivel de verificación: **verificado en vivo** = leído directamente con `browser_open` el 2026-11-05; **index** = obtenido vía índice de búsqueda el 2026-11-05, sin lectura completa de la primaria; **corroborado** = ≥2 resúmenes independientes que citan la sección primaria; **heredado** = verificación ya hecha en M02/M03, no repetida salvo discrepancia concreta. Donde una fuente se cita como "corroborada" y no "verificada en vivo", la afirmación descansa en resúmenes que citan la primaria; no se presenta como cita verbatim primaria.

| Fuente | URL | Versión / fecha | Sección | Alcance | Nivel |
|---|---|---|---|---|---|
| DID Core v1.0 | https://www.w3.org/TR/did-core/ | W3C Recommendation, 19-07-2022 (corroborado) | Abstract, §Design Goals, §DID Syntax | Sintaxis/modelo DID, no métodos ni verdad | Verificado en vivo |
| VC Data Model v2.0 | https://www.w3.org/TR/vc-data-model-2.0/ | W3C Recommendation, 15-05-2025 (corroborado) | §1.1 (verifiability ≠ truth), §4 Basic Concepts | Modelo de datos VC, no protocolo de emisión ni revocación por defecto | Verificado en vivo |
| did:key Method v0.9 | https://w3c-ccg.github.io/did-key-spec/ | W3C CCG Draft v0.9 | Introduction, Operations, No Key Rotation, Deactivation Not Supported | Método generativo sin registro, no estándar W3C | Verificado en vivo |
| SLIP-0039 | https://github.com/satoshilabs/slips/blob/master/slip-0039.md | Final, creado 2017-12-18 | Abstract, Two-level scheme, Format | Backup de wallets HD BIP-32, no autenticación/sucesión | Verificado en vivo |
| NIST SP 800-63B-4 | https://csrc.nist.gov/pubs/sp/800/63/b/4/final | Final, julio 2025 (31-07-2025) | Landing CSRC; §2.3.2/Ap. B/Ap. E (corroborados, PDF no leído verbatim) | Autenticación federal, AAL1-3 | Verificado en vivo (landing) |
| NIST FIPS 203/204/205 | https://csrc.nist.gov/projects/post-quantum-cryptography/post-quantum-cryptography-standardization | Finales 13-08-2024 | ML-KEM / ML-DSA / SLH-DSA | KEM y firmas PQC | Heredado M03 |
| NIST IR 8547 | DOI 10.6028/NIST.IR.8547 | Final 27-10-2026 (borrador nov 2024) | Transition to PQC Standards | Guía de transición, no estatuto; depreca todo lo vulnerable tras 2030, disallow tras 2035 | Corroborado (≥3 resúmenes del final) |
| RFC 9162 | https://www.rfc-editor.org/rfc/rfc9162 | Dic 2021, Experimental, DOI 10.17487/RFC9162 | §2.1 Merkle tree, §4.9/4.10 STH | Certificate Transparency v2.0, log como tercero de confianza | Verificado en vivo |
| RFC 8259 | — | Dic 2017, Standards Track | §8.1 UTF-8 MUST | JSON | Heredado M03 |
| RFC 3629 | — | Nov 2003, STD 63 | UTF-8 | Codificación UTF-8 | Heredado M03 |
| JCS RFC 8785 | — | — | Canonicalización JSON | Canonicalización para hash | Citado en M03 §3 (no verificado en vivo en M03) |
| SQLite | https://www2.sqlite.org/draft/onefile.html | Formato retrocompatible desde 3.0.0 (2004-06-18) | §Single-file Cross-platform | Compatibilidad de formato, no de esquema | Verificado en vivo |
| Library of Congress RFS | https://loc.gov/preservation/resources/rfs/format-pref-summary.html | Página SQLite LoC 2018-05-29 | Datasets preferidos | `.db/.db3/.sqlite/.sqlite3` preferidos, UTF-8 primero | Heredado M03 |
| Syncthing FAQ | https://docs.syncthing.net/v1.18.2/users/faq.html | v1.18.2 | "Is Syncthing my ideal backup application? No…" | Sync, no backup | Heredado M03 |
| MCP 2026-07-28 | https://blog.modelcontextprotocol.io/posts/2026-07-28/ | 28-07-2026 | Stateless core, SEP-2567/2575, MRTR, deprecations | Spec abierta, no ISO/W3C | Verificado en vivo |
| MCP spec changelog | https://modelcontextprotocol.io/specification/2026-07-28/changelog | 2026-07-28 | Key Changes | Cambios de revisión | Verificado en vivo (M02) |
| A2A Protocol Specification | https://a2a-protocol.org/pr-849/specification/ | Versión `dev` leída; v1.0.0 12-03-2026, v1.0.1 mayo 2026 (secundarias) | §1, §3.3, §4.3, §4.5, §4.6, §5.1, §5.3 | Protocolo agente-a-agente; identidad en capa HTTP; autorización implementation-specific | Verificado en vivo (spec `dev`) para las secciones listadas; §8.4 (firma JWS opcional, SHOULD) procede de análisis secundario, no leído verbatim (corrección R2) |
| Linux Foundation, nota de prensa A2A | — | 23-06-2025 | Donación de A2A a Linux Foundation | Gobernanza A2A | Verificado durante la construcción del documento M03-B |
| Python `pickle` (documentación oficial) | https://docs.python.org/3/library/pickle.html | Python 3.15.2 docs, consultado 2026-11-06 | Advertencia: "The `pickle` module is not secure… malicious pickle data will execute arbitrary code during unpickling" | Deserialización pickle = ejecución de código | Verificado en vivo (R1) |
| Hugging Face Transformers, `trust_remote_code` | Documentación de Transformers (loading models / customizing models) | Consultada vía resúmenes 2026-11-06 | `trust_remote_code=True` carga y ejecuta el código Python del repositorio | Código remoto en carga de modelos | Corroborado (≥2 fuentes independientes que citan la primaria; página primaria no leída línea a línea en este run) |
| safetensors | https://github.com/huggingface/safetensors | Apache-2.0, creado 2022-09-22 | README (formato; "Safe" = no ejecución de código; valores no verificados, NaN/±Inf admitidos) | Formato de tensores sin pickle | Verificado en vivo |
| GGUF spec | https://github.com/ggml-org/ggml/blob/master/docs/gguf.md | v3, desde 21-08-2023 | Formato llama.cpp/ggml | Formato de facto, no estándar formal | Heredado M02/M03 |
| GitHub Docs, commit signature verification | https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification | — | "Verified" = firma verificable criptográficamente; registro persistente aunque la clave se revoque | Firmas Git | Index 2026-11-05 |
| NIST SP 800-53 Rev. 5 | — | Sep 2020, Rel. 5.2.0 27-08-2025 | SC-3 (HIGH), AC-3, AC-5, AC-6, SC-5, SC-8, SC-23, SI-7, SI-10, CP-9, CP-10, CP-10(4) | Catálogo de controles federales; baselines en SP 800-53B | Corroborado (resúmenes que citan la primaria) |
| NIST SP 800-34 Rev. 1 | — | 2010 | BIA, MTD/RTO/RPO, 7 pasos | Contingencia de sistemas federales | Heredado M02/M03 |
| ONNX | https://onnx.ai/onnx/_sources/repo-docs/IR.md.txt y https://onnx.ai/onnx/_sources/repo-docs/Versioning.md.txt | IR v13 (06-11-2025) | IR Specification, Versioning | Intercambio, no ejecución idéntica | Index (M02) |
| Qubes OS Architecture | https://doc.qubes-os.org/en/latest/developer/system/architecture.html | 4.3.2 | Xen, qubes, dom0 sin red | OS escritorio monousuario; no aislamiento intra-dominio | Heredado M03 |
| Veeam 3-2-1-1-0 | https://www.veeam.com/blog/data-backup-recovery.html | — | Regla 3-2-1-1-0 | Regla de vendedor, no estándar | Heredado M03 |
| HELM | arXiv:2211.09110 (Liang et al., 2022), TMLR 2023 | 2022 | Marco multi-escenario/multi-métrica con bootstrap | Evaluación con intervalos | Citado en M02/M03; paper no re-leído en M03-B |
| Miller (2024) | arXiv:2411.00640 | 2024 | "Adding Error Bars to Evals" | Bootstrap, IC, pruebas pareadas | Citado vía secundaria; paper no leído (U8) |
| OAIS / ISO 14721:2012 | https://technav.ieee.org/topic/digital-preservation/ | ISO 14721:2012 | Ingest, AIP/SIP/DIP | Marco conceptual de preservación, no implementación | Index (M02, secundaria) |
| SLSA / in-toto | https://socket.dev/glossary/supply-chain-levels-for-software-artifacts | SLSA v1.0 19-04-2023, v1.1 abr 2025, v1.2 24-11-2025 | Provenance | Procedencia de artefactos, no seguridad del código | Secundaria (M02); spec primaria slsa.dev no verificada directamente |
| UCAN Working Group | https://github.com/ucan-wg/spec | Línea v1.0, trabajo comunitario | Capabilities, delegación atenuable | No IETF ni W3C | Index (M02, citada en secundaria) |
| Shamir / SLIP-39, colapso de umbral | https://github.com/bitaps-com/pybtc/issues/59 | Issue público 2025 | Implementación no estándar de Shamir-sobre-BIP39 | Teoría sólida, implementación frágil | Index (M02, secundaria) |

*Nota: donde una fuente se cita como "corroborada" y no "verificado en vivo", la afirmación descansa en ≥2 resúmenes independientes que citan la sección primaria; no se presenta como cita verbatim primaria. Los cálculos binomiales de C11 son aritmética propia verificable, no citas.*

*Nota de limitación (R2, MUSE-AUTONOMY-002): los resúmenes de corroboración citados en §3 (C02, C09, C12, C14, R2c) no se nombran en este expediente; su independencia no es comprobable desde aquí. Para C14, la corroboración del IR 8547 final fue verificada por la auditoría independiente en cuatro fuentes nombradas: postquantum.com, Cloud Security Alliance, yaamlabs.com y quentir.ai. Para los demás casos, "corroborado" debe leerse con esta salvedad.*

---

## Anexo A. Archivos generados y hashes (R2, MUSE-AUTONOMY-002, 2026-11-06)

Manifiesto de entregables de la versión R2. Un archivo no puede contener su propio hash: los SHA-256 de `report-r2.md`, del HTML R2 y del PDF R2 se registran en el manifiesto externo `hashes-r2.md`, calculado tras la última edición. Los archivos de R1 se conservan intactos como evidencia; sus valores figuran como referencia histórica.

| Archivo | Ruta | Tamaño (bytes) | SHA-256 | Estado de verificación |
|---|---|---|---|---|
| `expediente-consolidado-nexo-r2.html` (HTML final R2) | `workspace/your_files/expediente-consolidado-nexo-r2/expediente-consolidado-nexo-r2.html` | ver `hashes-r2.md` | ver `hashes-r2.md` | VERIFICADO — hash calculado sobre el archivo real exportado; registrado en el manifiesto externo |
| `report-r2.md` (este expediente, versión R2) | `workspace/research_notes/nexo-autonomy-002/r2/report-r2.md` | ver `hashes-r2.md` | ver `hashes-r2.md` | VERIFICADO — hash calculado tras la última edición; registrado en el manifiesto externo |
| `expediente-consolidado-nexo-r2.pdf` (PDF R2) | `workspace/your_files/expediente-consolidado-nexo-r2/expediente-consolidado-nexo-r2.pdf` | ver `hashes-r2.md` | ver `hashes-r2.md` | VERIFICADO — hash calculado sobre el archivo real; registrado en el manifiesto externo |
| `notes/consolidation-method.md` (nota de método, sin cambios) | `workspace/research_notes/nexo-autonomy-001-20261105-2210/notes/consolidation-method.md` | 2.209 | `ac1efe9f9e8d7a5224f6de8011bb3ce47540e8975f7d6574d14297abd2c9a679` | VERIFICADO — hash calculado sobre el archivo real, 2026-11-06 |
| `hashes-r2.md` (manifiesto externo R2) | `workspace/research_notes/nexo-autonomy-002/r2/hashes-r2.md` | — | — | Manifiesto; contiene los SHA-256 finales de `report-r2.md`, el HTML R2, el PDF R2 y la nota de método |

**Nota de publicación y correspondencia del paquete R2 (verificación posterior):** el archivo PDF R2 citado arriba corresponde a una representación generada durante la preparación; no hay un PDF independiente publicado en esta rama. El propietario confirmó que el HTML y el PDF representan el mismo expediente y aceptó el HTML como entrega suficiente. Por tanto, el HTML R2 es el artefacto canónico publicado; no se afirma identidad binaria ni publicación del PDF. La nota de método R2 publicada es `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/consolidation-method.md` (raíz de la carpeta); la fila histórica que menciona `notes/consolidation-method.md` y 2.209 bytes corresponde a la nota R1 fuente, no a la nota R2 publicada.

**Archivos R1 conservados como evidencia (sin modificar):**

| Archivo | Ruta | Tamaño (bytes) | SHA-256 |
|---|---|---|---|
| `expediente-consolidado-nexo.html` (HTML R1) | `workspace/your_files/expediente-consolidado-nexo/expediente-consolidado-nexo.html` | 147.680 | `56330207241d88d67bde723656175c6daa8757f943bf385705f1ffffc78cbd64` |
| `report.md` (informe R1) | `workspace/research_notes/nexo-autonomy-001-20261105-2210/report.md` | 95.294 | `780c1acba72ed0f9dc99cf0bd8c81405629e01ad28c818c5bfe18b3308d967f1` |
| `expediente-consolidado-nexo.pdf` (PDF R1) | `workspace/your_files/expediente-consolidado-nexo/expediente-consolidado-nexo.pdf` | 141.597 | `6bab7c1692cb09d703c3f52c71bdc733c1ed6c7439e8c12f02d61071269c0a6d` |
| `hashes.md` (manifiesto R1) | `workspace/research_notes/nexo-autonomy-001-20261105-2210/hashes.md` | 1.514 | `690a3a520a831d2ef06c8890acf21eda65e3c6fc2d91a26c6f2264175b399e4a` |

**SHA-256 de las siete partes fuente (originales conservados, sin modificar; verificados sin cambios en R1):**

| Parte | Archivo | SHA-256 |
|---|---|---|
| P1 | `research_notes/nexo-mision-02-20261105-2109/report.md` | `8f75a49d3b196d961599a35c8d3bc97aa8cf6d11d0c4dfe6de2abec634d1f30c` |
| P3 | `research_notes/nexo-mision-03-20261105-2217/report.md` | `ccd68c91ba3dd2ae95e2af9e059456bcd9e2451cc102db1927becebf576af675` |
| P5 | `research_notes/nexo-mision-03b-20261105-1947/report.md` | `ec063ee5c7100ac109e2c3326c0a91342a813b92bd9f0aa1099be98448c32355` |
| P2 | `ts-spaces/mision-02-nexo/index.html` | `e80623e0119ca23688a6f6317beabee2489055b2af8164738b45194c6299150b` |
| P4 | `ts-spaces/mision-03-nexo/index.html` | `11b001215bbc3e7b2dca0d62994c32fb063951910945556ffcdedb842da63057` |
| P6 | `ts-spaces/mision-03-b-nexo/index.html` | `e594bc288dda4c8312ffa29c3323991b90a00559eec7f5a48d73d7dfb71b771a` |
| P7 | `ts-spaces/hoja-consolidada-de-erratas-nexo/index.html` | `5a6506ef1e6efca9840222130dd619a3a46157740188a376ed954006beb0c40a` |
| P7 | `your_files/hoja-consolidada-de-erratas-nexo/hoja-consolidada-de-erratas-nexo.pdf` | `2a89284926d639073cbc916a66c5cadad3843348f45c18002666b144bf775ca3` |

El manifiesto `hashes-r2.md` contiene los SHA-256 finales de `report-r2.md`, el HTML R2, el PDF R2 y `notes/consolidation-method.md`.
