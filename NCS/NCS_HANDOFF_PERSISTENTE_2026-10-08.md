# NCS — HANDOFF PERSISTENTE Y ESTADO DE ARQUITECTURA
Fecha: 2026-10-08
Rama de respaldo: ncs-clean-architecture
Estado: documento de continuidad; NO equivale a implementación ni a auditoría cerrada.

## 0. Propósito y separación
NCS es la vía de diseño limpio de Nexo. No mezclar su construcción con la auditoría histórica CONTINUITY/AB/P/Kafka/TLC. La historia anterior sirve para extraer invariantes, errores y evidencia; no se copia como V21 ni se migra silenciosamente.
Principio permanente: “Nexo no lo queremos lleno de parches.” Si una necesidad estructural parece exigir un parche, detenerse y corregir la causa raíz del diseño antes de continuar.
No declarar un bloque guardado en la biblioteca NCS hasta confirmar la operación.

## 1. Arquitectura provisional
1. GOVERNANCE: Constitución, legitimidad, autoridad, política y límites.
2. NEXO KERNEL: identidad, referencia constitucional, estado semántico, memoria, conocimiento, modelo de sí/mundo, contexto, objetivos y compromisos.
3. DECISION & ACTION: propuesta/decisión, autorización, Operation Contract, operación/intento/ejecución/efecto y reconciliación.
4. ASSURANCE: observación, evidencia, validación/verificación; procedencia, frescura, integridad, independencia, riesgo y garantía.
5. CONTINUITY: historial, linaje, snapshots, replay, recuperación, fork/merge y Canonical State Transition Contract (CSTC).
6. FABRIC: modelos, runtimes, SO, dispositivos, almacenamiento, red, sensores, APIs e infraestructura. No es identidad ni autoridad de Nexo.

Cadena semántica:
CONSTITUTION → AUTHORITY → POLICY → CONTEXT → MODEL PROPOSAL → DECISION → AUTHORIZATION → OPERATION CONTRACT → EXECUTION → EFFECT → EVIDENCE → VERIFICATION → KNOWLEDGE → GOVERNED POLICY CHANGE.

Aprendizaje:
EXPERIENCE → OBSERVATION → EVIDENCE → VALIDATION → VERIFICATION → VERIFIED_FOR_PURPOSE → VALIDATED KNOWLEDGE → POLICY CANDIDATE → POLICY VALIDATION/GOVERNANCE → SHADOW/CANARY/APPROVAL → ACTIVE POLICY/BEHAVIOR.

## 2. Invariantes de autoridad
- Bootstrap materializa autoridad ya definida; no la crea.
- Trust anchor, key, epoch, recovery, attestation, hardware, verifier y successor no crean autoridad constitucional.
- AUTHORITY ≠ REPRESENTATION ≠ IDENTITY ≠ TRUST ANCHOR ≠ ATTESTATION ≠ KEY ≠ EPOCH ≠ RECOVERY ≠ SUCCESSOR.
- Si no se puede establecer autoridad constitucional vigente: UNKNOWN/STOP.
- Delegación no amplía autoridad: Authority(B) ⊆ Authority(A), sujeta a Constitución.
- Permiso en caché = evidencia de autoridad anterior, no autoridad actual.
- Sucesión solo por reglas constitucionales preexistentes.
- RECOVERY_ROOT ≠ SUCCESSION_AUTHORITY; NEW_EPOCH ≠ NEW_TRUST_BASIS ≠ CURRENT_AUTHORITY; NEWER ≠ AUTHORIZED; MORE INTEGRITY ≠ MORE AUTHORITY; TECHNICAL SUPERIORITY ≠ SUCCESSOR LEGITIMACY; RECOVERY ≠ SUCCESSION; FORK ≠ AUTHORITY; MERGE ≠ AUTHORITY; LEGACY ≠ CURRENT STATE; SNAPSHOT ≠ CURRENT STATE; PROVENANCE ≠ LEGITIMACY; ATTESTATION ≠ CONSTITUTIONAL AUTHORITY; EPOCH ≠ AUTHORITY; KEY CONTINUITY ≠ AUTHORITY CONTINUITY; TIMESTAMP ≠ CAUSAL ORDER; UNKNOWN ≠ SAFE TO MERGE; CANONICAL ≠ AUTHORITY; CANONICALITY ≠ CONVERGENCE; CRDT CONVERGENCE ≠ GOVERNANCE.

## 3. Operaciones, efectos y evidencia
- Tiempos separados: AUTHORIZED_AT, EXECUTION_STARTED_AT, EFFECT_COMMITTED_AT, REVOKED_AT. Revocar no borra un efecto ya ocurrido.
- UNKNOWN ≠ FAILED / NOT_EXECUTED / RETRYABLE / SUCCESS. Nunca UNKNOWN EFFECT → RETRY.
- Flujo: UNKNOWN → RECONCILIATION_REQUIRED → evidencia autoritativa → EFFECT_CONFIRMED / NO_EFFECT_CONFIRMED / STILL_UNKNOWN. Solo tras NO_EFFECT_CONFIRMED y si el contrato lo permite se valora otro intento.
- operation_id persiste entre intentos y recuperación, pero no garantiza idempotencia.
- idempotency ≠ authorization / success / verification / exactly-once delivery.
- No existe transacción distribuida universal. Outbox puede persistir estado local + intención, pero OUTBOX ≠ EXTERNAL ATOMICITY. Usar transacción local durable + workflow + outbox + idempotencia + reconciliación; Saga/compensación cuando aplique.
- CLAIM ≠ EVIDENCE ≠ VALIDATED EVIDENCE ≠ VERIFIED EFFECT. Evidencia incluye procedencia, integridad, frescura, alcance, sujeto, tiempo de observación, causalidad, operation_id, independencia/dependencias comunes y assurance.
- Preferir VERIFIED_FOR_PURPOSE, no “verdad absoluta”. Evidencia insuficiente para el riesgo requerido → UNKNOWN/STOP.
- RATS: Attester produce Evidence; Verifier evalúa y produce Attestation Results; Relying Party aplica su propia política. Verifier ≠ autoridad.

## 4. Memoria y conocimiento
- Memoria = representaciones/historial persistentes, no verdad automática.
- Conocimiento = contenido validado para un propósito, con procedencia/evidencia/alcance/validez temporal/assurance/estado.
- Memory → evidence/validation → knowledge candidate → validated knowledge.
- El conocimiento puede ser provisional, obsoleto, contradictorio, rechazado, superseded o refinado; nueva evidencia reevalúa, no sobrescribe silenciosamente.
- World Model = representación interna derivada de estado, observaciones, conocimiento y evidencia; no una segunda base de conocimiento ni realidad externa.
- Contexto = estado derivado, no autoridad permanente. Contexto requerido ausente → UNKNOWN/STOP; contradicción → reconciliación.
- Goals/commitments son estado semántico de Kernel; ejecución en Decision & Action; finalización requiere evidencia/verificación.

## 5. CSTC, canonicalidad y recuperación
CSTC: CONSTITUTION → CURRENT AUTHORITY CONTEXT → GOVERNANCE → CANONICAL STATE/BRANCHES → PROVENANCE + CAUSALITY → VALIDATION → RECONCILIATION → CONSTITUTIONAL CHECK → GOVERNED TRANSITION → NEW CANONICAL STATE.
Considera transition_id, dominio, estado canónico actual, candidato, linaje/procedencia, causalidad, Constitución/autoridad vigente, delegación/autorización, política, compatibilidad/conflictos, requisitos de evidencia/assurance, precondiciones, punto de commit/linearización, efectos, operaciones in-flight, semántica de fallo, reconciliación, verificación y registro de activación.
Canonicalidad por dominio: autoridad/gobernanza/revocación/política activa requieren consistencia gobernada fuerte; conocimiento/memoria/observaciones son mergeables si la semántica lo permite; dispositivos/runtimes pueden divergir temporalmente; operaciones/efectos usan estados explícitos y reconciliación.
Concurrente ≠ conflicto. No crear un motor global de resolución: cada dominio usa su contrato. CAUSAL ORDER ≠ AUTHORITY ORDER; CONVERGENCE ≠ GOVERNANCE; NEWEST ≠ AUTHORIZED; MAJORITY ≠ INDEPENDENT ASSURANCE.
Recovery: snapshot → reconstrucción → posición → comparar con estado autoritativo actual → same/behind/ahead/diverged → validar/replay/reconciliar/stop. Snapshot = evidencia histórica, no estado/autoridad actual. No resucitar autoridad revocada. Offline ≠ inválido, pero tampoco autoridad indefinida: límites según Constitución y Operation Contract.
Fork/merge: procedencia → análisis causal → autoridad → política → conflictos → reconciliación → transición autorizada → nuevo estado canónico. Conservar ramas rechazadas. Una rama maliciosa puede tener hashes/logs válidos y efectos reales sin autoridad legítima; preservar “ocurrió” y “no fue autorizado”. No hace falta lock/fence/barrier global universal; seguridad por semántica.

## 6. Auto-modificación
A) Cambio de implementación que preserva contratos: autónomo solo si Change Contract preautorizado delimita el espacio y evidencia/pruebas muestran equivalencia relevante.
B) Expansión de capacidad: nuevos tools/sensores/APIs/dispositivos/modelos; no hereda permisos automáticamente.
C) Cambio de conducta/política: candidato/shadow/evaluación; no autoactivar si altera autoridad/restricciones/riesgo.
D) Gobernanza/Constitución: identidad, Constitución, autoridad, sucesión, delegación, revocación e invariantes; fuera del aprendizaje autónomo ordinario.
EVOLUTION ≠ AUTHORITY; SELF-MODIFICATION ≠ CONSTITUTIONAL AMENDMENT; CAPABILITY EXPANSION ≠ AUTHORITY EXPANSION; MODEL UPDATE ≠ IDENTITY CHANGE; CODE UPDATE ≠ GOVERNANCE UPDATE; KNOWLEDGE UPDATE ≠ POLICY ACTIVATION.
Change Contract no es capa nueva: contrato de transición especializado en Decision & Action, evaluado por Assurance, gobernado por Governance si corresponde y registrado en Continuity. Incluye IDs, versiones, clase semántica, interfaces/dependencias, capacidades, impacto sobre política/autoridad, invariantes, pruebas/assurance, shadow/canary, frontera de activación, operaciones en curso, desactivación/revocación/recuperación, procedencia y criterios STOP.
SHADOW ≠ AUTHORIZATION; CANARY ≠ AUTHORITY; EVALUATION ≠ APPROVAL. Quien actualiza no puede legitimarse a sí mismo. MODIFICATION CAPABILITY ≠ MODIFICATION AUTHORITY; CODE EXECUTION ≠ GOVERNANCE; BUILD PROVENANCE ≠ LEGITIMACY; CAPABILITY ≠ PERMISSION.
SLSA/SSDF informan procedencia de build, no legitimidad constitucional. TUF es analogía técnica para root rotation/threshold/anti-rollback/freeze/mix-and-match, no Constitución. NIST SP 800-193 separa roots of trust de actualización/detección/recuperación; pueden compartir dependencias.

## 7. Common-mode compromise
Documento de biblioteca confirmado: NCS_RECOVERY_COMMON_MODE_AUDIT_2026-10-08.md (library ID libfile_68df463cb7d48191b4c5005b2f5a4955).
- Analizar compromiso conjunto de runtime + updater + distribución.
- No añadir Recovery Core/Bootstrap Core/Constitution Protector.
- Independencia de assurance es propiedad de la cadena de dependencias, no del número de componentes, firmas, copias o verificadores.
- MULTIPLE VERIFIERS ≠ INDEPENDENT ASSURANCE; MULTIPLE SIGNATURES ≠ INDEPENDENT TRUST ROOTS; REPLICA COUNT ≠ FAILURE INDEPENDENCE; OFFLINE ≠ UNCOMPROMISED; HARDWARE ROOT ≠ CONSTITUTIONAL AUTHORITY; RECOVERY CAPABILITY ≠ RECOVERY LEGITIMACY; RECOVERY SUCCESS ≠ AUTHORITY ESTABLISHED; TECHNICAL RECOVERY ≠ COMPLETE NEXO RECOVERY.
- Por garantía: claim exacto, productor/verificador/autorizador, dependencias de software/clave/hardware/admin/proveedor/red/reloj/almacenamiento/build/evidencia, fallos common-mode, componente independiente superviviente, amenaza fuera de alcance y STOP.
- No toda garantía necesita independencia absoluta/hardware separado; depende del riesgo y del contrato.

## 8. Custodia constitucional, revocación y sucesión — investigación abierta
Fuentes revisadas en la conversación:
- NIST SP 800-57 Part 1 Rev. 5: sospecha de compromiso de clave → estado comprometido/revocación, registrar transición y notificar a usuarios conocidos. Se tomó Rev. 5 como final publicada; no presentar una revisión posterior como final sin comprobarlo.
- RFC 9334/RATS: Attester → Evidence → Verifier → Attestation Results → Relying Party; frescura depende de política y evidencia puede quedar obsoleta tras generarse.
- TUF: actualizaciones de root con umbral de firmas del root antiguo y nuevo; anti-rollback; claves raíz offline; si se compromete el umbral, recuperación puede exigir actualización out-of-band y ser extremadamente difícil.
- NIST SP 800-184: planificación de recuperación, prioridades, dependencias, playbooks y pruebas.
Estados de revocación:
REVOCATION PROPOSED → AUTHORITY VALIDATED → REVOCATION AUTHORIZED → REVOCATION RECORDED → DISTRIBUTION / ENFORCEMENT EVIDENCE → EFFECTIVE STATUS BY SCOPE.
Emitida ≠ registrada ≠ distribuida ≠ aplicada ≠ aplicada globalmente. “No observé una revocación” no demuestra que no exista.
Una firma puede demostrar integridad del contenido sin demostrar vigencia/legitimidad actual. No resolver con timestamps solos: reloj puede fallar, evidencia puede estar obsoleta, timestamp no prueba causalidad.
Offline: no fijar TTL universal sin análisis; contratos definen alcance, frescura, operaciones permitidas, sincronización de revocaciones y reconciliación. Si la operación requiere autoridad actual y no puede establecerse → UNKNOWN/STOP para esa operación, no necesariamente detener todo el sistema.
Escenarios:
A) claves comprometidas, pero sucesión constitucional verificable y suficientes custodios confiables: seguir procedimiento predefinido.
B) raíz técnica perdida, autoridad legítima aún verificable por procedimiento alternativo predefinido e independiente: recuperación técnica gobernada.
C) todas las referencias legítimas se perdieron/comprometieron y no existe vía de sucesión válida: no autolegitimarse; UNKNOWN/STOP; intervención humana solo si la Constitución la define previamente.
CONSTITUTION COPY ≠ CURRENT CONSTITUTIONAL AUTHORITY; VALID SIGNATURE ≠ CURRENT AUTHORIZATION; KEY ROTATION ≠ SUCCESSION; NEW EPOCH ≠ NEW AUTHORITY; OFFLINE ≠ INDEFINITELY AUTHORIZED; RECOVERY ≠ SUCCESSION; UNKNOWN ≠ PERMISSION.
Custodios y desacuerdo:
- Custodio no responde ≠ deshonesto.
- Discrepancia honesta requiere procedimiento predefinido.
- Compromiso de custodio exige evaluar alcance/dependencias.
- Quorum/umbral satisfecho no demuestra legitimidad si hay colusión o el modelo de amenaza no la cubre.
QUORUM SATISFIED ≠ CONSTITUTIONAL LEGITIMACY; CUSTODIAN UNAVAILABLE ≠ CUSTODIAN DISHONEST; MAJORITY ≠ INDEPENDENT ASSURANCE; THRESHOLD SECURITY ≠ SECURITY AGAINST ALL COLLUSION; DISAGREEMENT ≠ PERMISSION TO IMPROVISE SUCCESSION.
No fijar número universal de custodios/firmas antes de definir modelo de amenaza y dependencias comunes: administradores, hardware, proveedor, recuperación de cuentas y canales.

## 9. Propuesta de protocolo — pendiente de especificación y pruebas
No implementar aún un nuevo esquema de custodios, nueva raíz soberana ni recovery automático. Cerrar una especificación constitucional y probar:
1. quién autoriza sucesión, condiciones, evidencia y caso de custodios ausentes;
2. amenazas/dependencias comunes entre custodios;
3. revocación durante desconexión;
4. efectos antes/después de revocación;
5. recuperación de claves y reconstrucción del estado;
6. ramas en conflicto y evidencia contradictoria;
7. criterios UNKNOWN/STOP;
8. que ningún componente pueda concederse autoridad a sí mismo.
Flujo: CONSTITUCIÓN → verificación de legitimidad → legitimidad demostrada: transición autorizada dentro de alcance; legitimidad desconocida: UNKNOWN/STOP para operaciones dependientes → reconciliación y verificación.
No significa detener todo Nexo: mantener funciones seguras explícitamente permitidas por la Constitución.
Caso extremo: dispositivo offline, clave comprometida y dos sucesiones incompatibles. Preservar ambas propuestas/firmas/causalidad/efectos; evaluar autenticidad y dependencias comprometidas; aplicar reglas constitucionales preexistentes; reconciliar efectos reales sin declarar ninguna rama canónica sin legitimidad; si persiste conflicto, STOP. Historial válido puede describir hechos reales sin demostrar autorización.

## 10. Próximo trabajo exacto
Continuar auditando interacción entre desconexión, revocación, sucesión paralela y efectos ya ejecutados:
- revocación durante desconexión;
- sucesión iniciada en paralelo;
- acciones ejecutadas antes de recibir nueva autoridad;
- reconciliar sin resucitar permisos, borrar efectos ni invalidar automáticamente acciones offline.
Después consolidar especificación cruzada con Governance, Assurance, Continuity y CSTC, sin duplicar subsistemas.
No repetir investigaciones cerradas ni reabrir AB/P/TLC/Kafka salvo que una invariante concreta exija evidencia histórica nueva.

## 11. Estado de almacenamiento y transparencia
- Auditoría common-mode confirmada en biblioteca /NCS.
- Intentos de carga de NCS_CONSTITUTIONAL_CUSTODY_REVOCATION_AUDIT_2026-10-08.md y NCS_CUSTODIAN_SUCCESSION_AUDIT_2026-10-08.md fallaron por límite temporal de carga de biblioteca (mensaje: volver a intentarlo en 23 horas). No afirmar que están en biblioteca.
- Este handoff se guarda como respaldo durable en la rama GitHub ncs-clean-architecture del repositorio público snowdenxrp/aldea-ia, separado de main; no fusionar con main sin decisión explícita. El contenido de esta rama es público.
- Rama creada desde el commit main d2d2a3ab551fd3c8e61fd8aa27aa76698b10416b. Este documento es continuidad de diseño, no código ni evidencia de runtime.
