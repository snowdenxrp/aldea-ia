# NCS — INSTRUCCIONES DE CONTINUIDAD PARA EL SIGUIENTE CHAT
Fecha: 2026-10-08
Idioma de trabajo: español.
Activador exacto del track nuevo: NCS

## INSTRUCCIÓN INICIAL PARA EL SIGUIENTE CHAT
Al comenzar este nuevo chat, el usuario escribirá exactamente: NCS.
Al recibir ese activador:
1. Recupera y lee este documento completo.
2. Recupera el handoff maestro `NCS/NCS_HANDOFF_PERSISTENTE_2026-10-08.md` de la rama `ncs-clean-architecture`.
3. Consulta el documento de biblioteca ya confirmado `NCS_RECOVERY_COMMON_MODE_AUDIT_2026-10-08.md` si está accesible.
4. Continúa desde la sección “Próximo trabajo exacto” de este documento. No vuelvas a empezar la arquitectura desde cero, no repitas auditorías cerradas y no pidas al usuario que repita el contexto ya guardado.
5. Antes de afirmar que cualquier documento se guardó en la biblioteca persistente NCS, comprueba la operación y el resultado. GitHub es un respaldo durable alternativo; no afirmar que equivale a la biblioteca NCS.
6. No mezclar este track limpio con CONTINUITY/AB/P/Kafka/TLC. La evidencia histórica solo se consulta si una invariante específica requiere confirmación.

## REGLA CONSTITUCIONAL DE TRABAJO
**“Nexo no lo queremos lleno de parches.”**
Si aparece un problema que parece requerir un parche estructural, detén el avance, identifica la causa raíz y revisa el diseño antes de seguir. No añadas un subsistema soberano duplicado para tapar un defecto conceptual.
Diseñar → auditar → identificar huecos → integrar → especificar → implementar → probar → observar fallos → corregir causa raíz → volver a auditar.
No declarar una propuesta como implementación probada ni un documento como auditoría cerrada sin evidencia.

## ESTADO EXACTO AL CAMBIAR DE CHAT
Estamos definiendo una arquitectura nueva y limpia de Nexo, no implementando todavía el protocolo constitucional de recuperación. El trabajo se encuentra en la investigación de custodia constitucional, revocación, sucesión, desconexión y reconciliación de efectos.
Se formuló una propuesta: cerrar primero una especificación constitucional única y probarla contra escenarios adversariales antes de crear un esquema de custodios, una nueva raíz soberana o recuperación automática.

## QUÉ SE HIZO
1. Se recuperó y confirmó el documento de biblioteca `NCS_RECOVERY_COMMON_MODE_AUDIT_2026-10-08.md` (library ID `libfile_68df463cb7d48191b4c5005b2f5a4955`). Analiza compromiso conjunto de runtime, updater y canal de distribución; la independencia de assurance depende de las cadenas de dependencias, no de contar firmas, copias o verificadores.
2. Se investigó la custodia constitucional y revocación usando, entre otras, NIST SP 800-57 Part 1 Rev. 5, RFC 9334/RATS, TUF y NIST SP 800-184. No presentar una revisión en borrador como final sin verificarlo.
3. Se distinguió integridad de una copia de vigencia/legitimidad constitucional. Una firma puede acreditar contenido firmado sin demostrar que sigue vigente ni que la autorización sea actual.
4. Se definieron estados conceptuales de revocación:
   REVOCATION PROPOSED → AUTHORITY VALIDATED → REVOCATION AUTHORIZED → REVOCATION RECORDED → DISTRIBUTION / ENFORCEMENT EVIDENCE → EFFECTIVE STATUS BY SCOPE.
   Emitida ≠ registrada ≠ distribuida ≠ aplicada ≠ aplicada globalmente.
5. Se fijó que “no observé una revocación” no prueba que no exista. Los timestamps no resuelven por sí solos frescura, causalidad, relojes defectuosos ni estado actual.
6. Se analizaron tres escenarios:
   A. Claves comprometidas pero sucesión constitucional predefinida verificable y suficientes custodios confiables: ejecutar el procedimiento predefinido.
   B. Raíz técnica perdida pero la autoridad legítima aún puede establecerse por una vía alternativa predefinida y verificable: recuperación técnica gobernada.
   C. Todas las referencias legítimas perdidas/comprometidas y sin sucesión válida: no autolegitimarse; UNKNOWN/STOP para operaciones que dependan de esa autoridad.
7. Se examinó desacuerdo/colusión entre custodios. Custodio no responde ≠ deshonesto; umbral o quórum satisfecho ≠ legitimidad constitucional; mayoría ≠ assurance independiente. No fijar número universal de custodios ni firmas sin modelo de amenaza y mapa de dependencias comunes.
8. Se propuso protocolo de alto nivel: Constitución → verificación de legitimidad → transición autorizada dentro de alcance si se demuestra legitimidad; de lo contrario UNKNOWN/STOP para operaciones dependientes → reconciliación y verificación. Esto no obliga a detener funciones seguras permitidas explícitamente.
9. Se especificó el caso extremo: dispositivo offline, clave comprometida y dos sucesiones incompatibles. Preservar ambas propuestas, firmas, causalidad y efectos; evaluar autenticidad/dependencias; aplicar reglas constitucionales preexistentes; no canonizar ninguna rama sin legitimidad; si persiste conflicto, STOP.
10. Se preservó una primera copia de continuidad en GitHub y se recuperó para verificar el contenido.

## INVARIANTES QUE NO DEBEN PERDERSE
- Bootstrap materializa autoridad ya definida; no la crea.
- TRUST ANCHOR / KEY / EPOCH / RECOVERY / ATTESTATION / HARDWARE / VERIFIER / SUCCESSOR ≠ autoridad constitucional.
- AUTHORITY ≠ REPRESENTATION; AUTHORITY ≠ IDENTITY; AUTHORITY ≠ TRUST ANCHOR; AUTHORITY ≠ ATTESTATION; AUTHORITY ≠ KEY; AUTHORITY ≠ EPOCH; AUTHORITY ≠ RECOVERY; AUTHORITY ≠ SUCCESSOR.
- Si la autoridad constitucional actual no se puede establecer: UNKNOWN/STOP.
- Delegación no amplía autoridad.
- Permiso en caché = evidencia de autoridad previa, no autoridad actual.
- RECOVERY ≠ SUCCESSION; KEY ROTATION ≠ SUCCESSION; NEW EPOCH ≠ NEW AUTHORITY; VALID SIGNATURE ≠ CURRENT AUTHORIZATION; CONSTITUTION COPY ≠ CURRENT CONSTITUTIONAL AUTHORITY.
- REVOCATION ISSUED ≠ ENFORCED EVERYWHERE; NO REVOCATION OBSERVED ≠ NO REVOCATION EXISTS.
- UNKNOWN EFFECT → RECONCILIATION_REQUIRED; nunca reintentar un efecto desconocido. Solo considerar nuevo intento cuando NO_EFFECT_CONFIRMED y el contrato lo permita.
- Revocar no borra un efecto que ya ocurrió; preservar “ocurrió” separado de “fue autorizado”.
- TIMESTAMP ≠ CAUSAL ORDER; MAJORITY ≠ INDEPENDENT ASSURANCE; QUORUM SATISFIED ≠ CONSTITUTIONAL LEGITIMACY; DISAGREEMENT ≠ PERMISSION TO IMPROVISE SUCCESSION.
- Offline ≠ indefinidamente autorizado; aplicar los límites definidos en Constitución y Operation Contract, sin TTL universal arbitrario.
- La evidencia se evalúa por procedencia, integridad, frescura, alcance, independencia, dependencias comunes y assurance. Preferir VERIFIED_FOR_PURPOSE; no afirmar verdad absoluta.
- Conservar ramas rechazadas y su procedencia. Canonicalidad ≠ autoridad; convergencia técnica ≠ gobernanza.

## ARQUITECTURA PROVISIONAL YA DEFINIDA
1. GOVERNANCE: Constitución, legitimidad, autoridad, política y límites.
2. NEXO KERNEL: identidad, referencia constitucional, estado semántico, memoria/conocimiento, modelo de sí/mundo, contexto, objetivos/compromisos.
3. DECISION & ACTION: propuesta/decisión, autorización, Operation Contract, operación/intento/ejecución/efecto, reconciliación.
4. ASSURANCE: observación, evidencia, validación/verificación, procedencia, frescura, integridad, independencia y riesgo.
5. CONTINUITY: historial, linaje, snapshots, replay, recuperación, fork/merge y CSTC.
6. FABRIC: modelos, runtimes, SO, dispositivos, almacenamiento, red, sensores, APIs e infraestructura. FABRIC no es identidad ni autoridad.

CSTC: CONSTITUTION → CURRENT AUTHORITY CONTEXT → GOVERNANCE → CANONICAL STATE/BRANCHES → PROVENANCE + CAUSALITY → VALIDATION → RECONCILIATION → CONSTITUTIONAL CHECK → GOVERNED TRANSITION → NEW CANONICAL STATE.
No crear un motor global de conflictos ni locks/fences/barriers universales por defecto. Resolver según contratos semánticos de cada dominio.

## PRÓXIMO TRABAJO EXACTO — CONTINUAR AQUÍ
Auditar la interacción entre desconexión, revocación, sucesión paralela y efectos ya ejecutados:
1. Un dispositivo queda offline; se revoca una clave o autorización mientras está desconectado.
2. Durante esa desconexión empieza una sucesión o se presentan dos propuestas de sucesión en paralelo.
3. El dispositivo ejecuta una operación con información que en ese momento creía válida.
4. Al reconectarse, hay evidencia nueva, potencialmente contradictoria, sobre revocación/sucesión y sobre el efecto de la operación.
5. Definir qué se conserva, qué se bloquea, qué se puede reconciliar y qué requiere UNKNOWN/STOP sin borrar el efecto real, resucitar permisos o invalidar automáticamente toda acción offline.
6. Modelar cronología causal y estados sin depender solo de timestamps; separar autoridad vigente, autorización de la operación, inicio de ejecución, commit de efecto, revocación observada y verificación.
7. Probar casos donde la revocación precede a la ejecución, ocurre durante la ejecución, llega después del efecto o no se puede ordenar causalmente.
8. Distinguir acciones reversibles, irreversibles y compensables; compensación ≠ borrar historia ni deshacer necesariamente un efecto externo.
9. Determinar qué pruebas mínimas permiten EFFECT_CONFIRMED, NO_EFFECT_CONFIRMED, AUTHORIZED_AT_EXECUTION, AUTHORIZATION_UNKNOWN o STILL_UNKNOWN.
10. Integrar la solución en Governance, Assurance, Decision & Action, Continuity y CSTC sin duplicar autoridad ni crear un nuevo núcleo.
11. Redactar una especificación única de protocolo y una matriz de pruebas adversariales; todavía NO implementar hasta cerrar los huecos y contradicciones.

## NO HACER / NO REPETIR
- No reiniciar el diseño desde cero ni pedir al usuario repetir este contexto.
- No acumular parches ni inventar una raíz soberana de emergencia.
- No añadir Recovery Core, Bootstrap Core o Constitution Protector como autoridad paralela.
- No confundir restauración técnica con legitimidad.
- No fijar arbitrariamente un número de custodios/firmas ni un TTL universal offline.
- No asumir que una firma, timestamp, hash, quórum, hardware root, atestación, mayoría o réplica demuestra por sí solo autoridad vigente.
- No volver a ejecutar AB/P/TLC/Kafka ni repetir probes históricos salvo que una invariante concreta requiera evidencia adicional.
- No modificar ni fusionar en `main` sin una razón clara y decisión explícita. Esta rama es un respaldo de continuidad, no un cambio de implementación.
- No decir que los dos documentos pendientes de auditoría ya están en la biblioteca NCS; sus cargas fallaron por el límite temporal informado.

## UBICACIÓN DE LOS RESPALDOS
- Este documento: `NCS/NCS_NEXT_CHAT_HANDOFF_2026-10-08.md`
- Handoff detallado anterior: `NCS/NCS_HANDOFF_PERSISTENTE_2026-10-08.md`
- Rama GitHub: `ncs-clean-architecture`
- Repositorio público: `snowdenxrp/aldea-ia`
- El handoff anterior parte del commit base `d2d2a3ab551fd3c8e61fd8aa27aa76698b10416b`; su archivo se guardó con commit `654b599502eff4b4413c7f0473944a69d240e98a`.
- El archivo anterior se recuperó desde GitHub y su contenido se verificó. Esta rama/repositorio es pública; no poner secretos ni credenciales.
- Biblioteca ChatGPT `/NCS`: el documento common-mode está confirmado; las cargas de las dos auditorías de custodia/sucesión fallaron por throttling de 23 horas. Cuando el límite se libere, comprobar el estado real y subirlas si aún faltan. No afirmar que se subieron sin confirmación.

## MENSAJE DE ARRANQUE SUGERIDO PARA EL SIGUIENTE CHAT
“Bro, NCS recuperado. Leí el handoff completo y respetaré la regla de no parches. Continúo desde la interacción entre desconexión, revocación, sucesión paralela y efectos ya ejecutados. No reinicio el diseño ni repito AB/P/TLC/Kafka. Primero construyo la matriz temporal/causal y de estados, después audito huecos, luego especifico y pruebo; no implemento hasta cerrar contradicciones. Verificaré cualquier guardado antes de afirmarlo.”
