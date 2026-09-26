# AB104.219 — Claim Contract ↔ Decision Contract ↔ Archive Certificate
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR

## Objetivo
Determinar qué puede afirmar una evidencia archivada y qué decisión operacional puede derivarse de ella, sin convertir un receipt/certificate en permiso implícito de efecto.

## Evidencia externa
RFC 9943/SCITT distingue Signed Statement de Receipt: el Statement es una afirmación identificable del issuer; el Receipt demuestra que esa afirmación fue registrada en una estructura verificable. La transparencia no elimina la posibilidad de issuer comprometido, y los relying parties deben inspeccionar y decidir a partir de la evidencia. citeturn0search0turn0search1
SCITT también separa issuer identity de transparency-service identity y permite múltiples receipts para un mismo statement. Por tanto, inclusión en un log y autoridad semántica del contenido son hechos distintos. citeturn0search0
TUF documenta rollback y freeze attacks: una versión autenticada puede ser antigua, y la protección necesita contexto de versión/frescura, no solo firma válida. citeturn0search12

## Resultado principal
Se necesitan tres capas distintas:

1. CLAIM CONTRACT — qué evidencia existe y exactamente qué afirma.
2. DECISION CONTRACT — qué conclusión permite esa evidencia bajo una política explícita.
3. EFFECT CONTRACT — qué autorización, si alguna, puede cruzar al target y bajo qué condiciones.

Una archive certificate pertenece principalmente al dominio de evidence/claim. No debe convertirse automáticamente en DecisionContract ni EffectContract.

## Claim Contract
Un claim debe incluir conceptualmente:
- claim_id / evidence_id
- issuer identity
- issuer authority context
- statement digest
- operation_id/effect_identity
- payload fingerprint cuando aplique
- target identity + target incarnation
- authority epoch/root
- boundary asserted
- asserted state
- evidence provenance
- issuance sequence/time como evidencia auxiliar
- validity/freshness context
- parent/child scope
- certificate/receipt proof.

Ejemplos de claims:
- TARGET_RECEIVED(operation X)
- TARGET_COMMITTED(child 3)
- TARGET_REJECTED_BEFORE_ACCEPTANCE(operation X)
- STREAM_REFUSED_BEFORE_PROCESSING(X)
- ARCHIVE_CONTAINS(X)
- ARCHIVE_CERTIFICATE_SEALS(range A..B)

Estos claims no son intercambiables. `ARCHIVE_CONTAINS(X)` no significa `TARGET_COMMITTED(X)`.

## Decision Contract
La decisión debe especificar qué claims son suficientes.

Ejemplo conceptual:
`EXTERNALLY_COMMITTED` requiere target-authoritative commit evidence o equivalente de confianza definida.
`NOT_COMMITTED` requiere negative evidence cuya semántica garantice que el target no aceptó/procesó el efecto durante el horizonte relevante.
`UNKNOWN_EXTERNAL` permanece si la evidencia solo demuestra envío, intención, timeout, archive inclusion o ausencia de receipt.
`PARTIAL` requiere clasificación de sub-effects.

Por tanto:
`Receipt(archive, X) → Claim: X was recorded in archive`
pero no:
`Receipt(archive, X) → Decision: X happened externally`.

## Decision ≠ permission
Aun una decisión `EXTERNALLY_COMMITTED` normalmente describe un hecho histórico. No constituye por sí sola permiso para crear un nuevo efecto.
Para una nueva ejecución se necesita un nuevo DecisionContract autorizado, con operation/effect identity, authority epoch y preconditions compatibles.

Esto conserva la regla AB104.197:
`CommitRecord ≠ permission to repeat`.

## UNKNOWN
Claims insuficientes pueden producir una decisión UNKNOWN, pero ningún certificate de archive debe transformar UNKNOWN en NOT_COMMITTED por mera ausencia de contenido.
Un certificate puede demostrar que una incertidumbre fue registrada y sellada; no puede resolverla mágicamente.

## Negative evidence
Para `NOT_COMMITTED`, el claim debe describir la semántica negativa exacta:
`TARGET_REJECTED_BEFORE_ACCEPTANCE` es diferente de `NETWORK_TIMEOUT`.
`REFUSED_STREAM` puede ser una afirmación de protocolo sobre procesamiento del stream bajo sus condiciones específicas; no debe generalizarse a todos los targets.
`ARCHIVE_ABSENCE` solo demuestra ausencia en ese archive/index y scope, no ausencia histórica universal.

## Authority binding
Cada claim debe poder evaluarse respecto de:
`issuer → scope → target incarnation → authority epoch/root → freshness`.
Una firma históricamente válida puede quedar fuera de la autoridad actual. TUF muestra por qué autenticidad y frescura deben tratarse separadamente. citeturn0search12

## Cross-system evidence
Si el issuer del claim es un target externo, su autoridad debe estar definida por EffectContract. Un receipt de un tercero demuestra como mínimo lo que su propia semántica garantiza; no amplía automáticamente esa semántica.
SCITT es una buena referencia: la Receipt prueba registro del Statement; la decisión sobre el significado del Statement queda para los verificadores/política del relying party. citeturn0search0

## Archive certificate as evidence
Un certificate de compactación puede generar claims fuertes como:
- `RANGE_SEALED`
- `HISTORY_PREDECESSOR_BOUND`
- `OPERATION_ID_PRESENT_IN_ARCHIVE`
- `UNKNOWN_STATE_PRESERVED`
- `SUB_EFFECT_SET_COMMITTED_TO_ROOT`.

Pero no debería emitir por sí mismo:
- `EXTERNAL_EFFECT_COMMITTED`
- `EXTERNAL_EFFECT_NOT_COMMITTED`
- `NEW_EXECUTION_AUTHORIZED`.

Estas últimas requieren Decision/Effect semantics adicionales.

## Ataques
- forged claim with valid archive receipt but wrong issuer scope → reject/quarantine.
- old signed claim after authority rotation → historically valid, currently stale.
- valid archive certificate + missing target receipt → remains evidence of archive state, not external commit.
- negative claim from non-authoritative intermediary → insufficient for NOT_COMMITTED.
- two claims same operation_id with different fingerprints → collision/conflict.
- two authoritative claims disagreeing on same boundary → conflict; no timestamp winner.
- certificate says UNKNOWN but decision layer interprets it as NOT_COMMITTED → policy violation.

## Código/prototipo
El effect-adapter actual demuestra una separación parcial: prepared/reconciliation evita reejecutar directamente un prepared entry; pero su idempotencyKey actual no contiene explícitamente target incarnation, authority epoch/root ni payload fingerprint. Esto es una limitación del prototipo, no una propuesta para la arquitectura final.

## Estado epistemológico
Fuerte: Claim, Decision y Effect deben permanecer separados; archive inclusion no equivale external commit; historical validity no equivale current authority.
Pendiente: grammar formal de ClaimContract/DecisionContract, authority registry, evidence dependency graph completo, canonical serialization, implementation and formal verification.

## Próximo AB104.220
Investigar el grafo de dependencias de evidencia: cómo combinar múltiples claims independientes, detectar common-mode failure, conflicto y evidencia circular antes de permitir una decisión.