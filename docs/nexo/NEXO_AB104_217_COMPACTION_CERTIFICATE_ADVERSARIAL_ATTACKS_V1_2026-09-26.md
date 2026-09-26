# AB104.217 — Adversarial audit of compaction/archive certificates
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR

## Objetivo
Atacar el concepto de certificado de compactación de AB104.216 antes de considerar cualquier diseño.

## Evidencia externa
RFC 9162 define Merkle inclusion proofs y consistency proofs: una prueba de inclusión demuestra que un elemento está comprometido por una raíz; una consistency proof demuestra que un árbol posterior conserva el prefijo del árbol anterior. También usa signed tree heads para anclar las raíces. Es referencia para detectar truncación, sustitución o fork, no decisión de usar CT en Nexo.
TUF separa Snapshot de Timestamp: Snapshot ata hashes/versiones de metadatos para evitar combinar vistas de épocas distintas; su modelo contempla rollback/freeze. Esto refuerza que un archive certificate válido debe estar ligado a scope, epoch y una vista coherente, no solo a una firma.
Un Internet-Draft SCITT de agosto de 2026 describe el problema de logs locales donde registros firmados individualmente pueden ser borrados/reordenados y propone checkpoints que comprometen la historia. Es evidencia contemporánea, no decisión de Nexo.

## Ataques
### A. Falsificación
Un atacante crea un certificado con rango/digest inventados. Defensa conceptual: autenticidad + anchor confiable + predecessor + recomputación del commitment cuando el contenido está disponible. Firma válida sin anchor correcto no basta.
### B. Certificado auténtico para rama equivocada
Puede pertenecer a otra authority epoch, device incarnation, resource scope o branch. Resultado: CONFLICT/UNVERIFIED/STALE, no recuperación automática.
### C. Dos certificados para el mismo rango
Ejemplo [100..150] con roots A y B. No se elige por timestamp, llegada u orden lexicográfico. Si ambos son válidos bajo el mismo scope/epoch, existe FORK/CONFLICT que requiere evidencia/autoridad explícita.
### D. Sustitución completa de archive
Si se reemplazan records + certificado y también el anchor raíz, una historia completa puede parecer consistente. Esto reconecta con AB104.199: la seguridad depende de continuidad del trust anchor, no de autoconsistencia local.
### E. Truncación
Final truncado: range/length/final commitment incompleto. Segmento intermedio eliminado: predecessor digest/sequence gap. Archive completo pero sin historia posterior: no implica current. Resultado: INCOMPLETE/HISTORY_GAP/STALE según evidencia.
### F. Pérdida del archive index
No encontrar un record no demuestra que nunca existió. Si certificate/anchor demuestra que el rango existió, la operación sigue siendo identidad histórica conocida aunque el índice esté perdido. Sin anchor verificable, no se inventa ausencia: UNKNOWN/UNVERIFIED.
### G. Garbage collection de UNKNOWN
Eliminar físicamente UNKNOWN mientras todavía puede reconciliarse crea una ventana de replay. La identidad unresolved debe sobrevivir mediante registro vivo, archive commitment o certificado que conserve explícitamente unresolved. NOT_FOUND nunca se convierte por sí solo en NEW_OPERATION.
### H. Crash durante seal/compact
Estados conceptuales: live record durable + certificate absent = LIVE; certificate durable + old segment presente = SEALED/ARCHIVABLE; certificate durable + old segment eliminado = COMPACTED solo tras verificar certificate + anchor + availability policy; ambos incompletos = recuperación conservadora; metadata de compactado sin certificate verificable = QUARANTINE.
### I. Recuperación concurrente
Dos recoverers pueden observar el mismo segmento. Observar primero no da autoridad. Debe existir commit/fence/claim durable que impida certificados incompatibles para el mismo rango.
### J. Replay del certificado
Un certificado histórico válido puede presentarse después de una transición de authority. HISTORICALLY_VALID no equivale CURRENT_AUTHORITY. Freshness/epoch/anchor impiden que un certificado viejo se convierta en permiso actual.
### K. Key rotation
Un certificado firmado por una clave histórica puede seguir siendo verificable, pero la clave puede ya no estar autorizada. Se necesita contexto de época y transición de authority.
### L. Snapshot + archive de ramas distintas
Snapshot S42 de branch A + archive C42→C50 de branch B puede tener componentes individualmente válidos pero ser una combinación inválida si predecessor/root/epoch no coinciden. Este es el tipo de coherencia que el binding de Snapshot de TUF intenta preservar.

## Nueva separación
CERTIFICATE VALID no implica CONTENT AVAILABLE, HISTORY COMPLETE, CURRENT AUTHORITY, FRESHNESS CURRENT ni EXTERNAL EFFECT COMMITTED.
ARCHIVE ABSENT tampoco implica NOT_COMMITTED.

## Ataque especialmente importante
Puede conservarse un certificado válido de una operación UNKNOWN y eliminar la evidencia necesaria para resolverla. El certificado demuestra que UNKNOWN existió, pero no permite afirmar COMMITTED ni NOT_COMMITTED. Por tanto debe preservar explícitamente unresolved y bloquear replay mientras la incertidumbre permanezca.

## Código real inspeccionado
src/nexo/effect-adapter.js: crea prepared; no ejecuta de nuevo una entrada prepared sin reconciliación; una reconciliación bloqueada no se vuelve terminal; usa idempotencyKey; recorta journal a 200 entradas; y la excepción del handler devuelve EFFECT_OUTCOME_UNKNOWN sin llamar a persist().
tests/nexo/effect-adapter.test.mjs todavía espera exceptionJournal[0].result.code === EFFECT_OUTCOME_UNKNOWN. La discrepancia no está resuelta por inspección estática y no se afirma que los tests pasen.
Esto confirma que archive/compaction no debe diseñarse alrededor de un supuesto actual de persistencia durable de UNKNOWN.

## Estado
No se selecciona mecanismo definitivo. Merkle/checkpointing, hash chains, firmas, anchors externos y otras técnicas permanecen alternativas de investigación.

## Próximo AB104.218
Investigar la semántica exacta de un certificado para UNKNOWN/PARTIAL: comprometer sub-effects, payload fingerprints, evidence references y reconciliation horizon sin convertir el certificado en falsa prueba de commit.