# AB104.218 — UNKNOWN/PARTIAL archive certificate semantics
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR

## Objetivo
Definir qué debe preservar un certificado cuando una operación no es un booleano simple sino UNKNOWN, PARTIAL o un conjunto de sub-effects.

## Evidencia externa
SCITT separa Signed Statement, Receipt y Verifiable Data Structure. Un Receipt demuestra inclusión de una declaración en una estructura verificable; no convierte por sí mismo la declaración en verdadera ni resuelve el significado operacional de su contenido. La arquitectura también contempla consistencia/no-equivocación y auditoría. Se usa aquí como evidencia conceptual, no como selección de tecnología para Nexo. citeturn0search1turn0search2
RFC 9162/Certificate Transparency aporta la distinción entre inclusion proof y consistency proof: una prueba puede demostrar que un elemento pertenece a una historia comprometida y otra que una historia posterior conserva la anterior. Para Nexo esto sugiere separar inclusión de evidencia de continuidad de historia.

## Hallazgo principal
Un certificado para UNKNOWN no debe intentar probar si el efecto ocurrió. Debe probar que una afirmación de incertidumbre concreta existía en un punto verificable.

Por tanto:
`CERT(UNKNOWN) = commitment to unresolved claim + identity + scope + evidence boundary + freshness/authority + reconciliation horizon`

y NO:
`CERT(UNKNOWN) = proof of non-execution`

## Semántica mínima de identidad
Cada operación debe conservar operation_id/effect_identity estable. Para cada identidad se debe ligar, cuando aplique:
- payload_fingerprint
- target_identity
- target_incarnation
- authority_epoch/root
- effect granularity
- parent operation_id
- child/sub-effect identity
- sequence/chunk index
- ordering dependency si el target la exige.

Una misma operation_id con distinto payload_fingerprint debe ser COLLISION/PAYLOAD_MISMATCH, no una nueva oportunidad de ejecución.

## UNKNOWN
UNKNOWN significa que la evidencia disponible no permite decidir todavía entre estados incompatibles. El certificado debe preservar:
- qué boundary fue alcanzado o pudo ser alcanzado;
- última evidencia observada;
- fuente/issuer de la evidencia;
- scope e incarnation de la fuente;
- timestamp/sequence como evidencia secundaria, no autoridad única;
- reconciliation horizon/deadline;
- qué consultas/receipts faltan;
- authority vigente al momento de la decisión;
- estado explícito UNKNOWN.

El certificado NO debe contener una frase ambigua como 'effect pending' sin identificar el boundary y la evidencia que originó la incertidumbre.

## PARTIAL
PARTIAL no debe representarse como un solo estado de padre si existen sub-effects independientes.
Modelo conceptual:
`Parent operation → child_1, child_2, ... child_n`
Cada child conserva identidad, fingerprint y estado/evidencia propio.
Aggregate:
- ALL children committed → COMMITTED;
- NONE committed + autoridad negativa suficiente → NOT_COMMITTED;
- mezcla committed/not committed → PARTIAL;
- cualquier child materialmente UNKNOWN → aggregate UNKNOWN/PARTIAL_WITH_UNKNOWN según semántica;
- compensación posterior no borra el commit histórico; se registra como nuevo effect.

## Certificate commitment
El certificado debe comprometer un conjunto o mapa determinista de claims/sub-effects, no solamente un aggregate booleano. Conceptualmente:
`certificate_digest = Commit(scope, epoch, predecessor, operation-set, status-set, evidence-refs, fingerprints, horizon, policy-version)`
El algoritmo exacto queda abierto.

## Evidence references
Una referencia de evidencia debe ser verificable y estar ligada a su emisor/contexto. No basta con guardar una URL, texto o timestamp.
Una receipt externa puede probar inclusión en el ledger del emisor; la confianza en su contenido depende de la autoridad y semántica del emisor. SCITT distingue precisamente la declaración del issuer del receipt de transparencia. citeturn0search2

## Reconciliation horizon
El certificado debe conservar el horizonte dentro del cual UNKNOWN puede resolverse, o declarar explícitamente que la resolución ya no es posible.
Si expira el horizonte sin evidencia suficiente:
`UNKNOWN → UNKNOWN_PERMANENT`
NO:
`UNKNOWN → NOT_COMMITTED`

UNKNOWN_PERMANENT tampoco autoriza repetir automáticamente. Su identidad histórica sigue siendo conocida.

## Compaction attack
Un atacante intenta compactar un parent PARTIAL dejando solo el aggregate. Esto puede ocultar qué child se ejecutó.
Defensa conceptual: el commitment debe cubrir cada child o un commitment verificable de su conjunto, y la reconstrucción debe poder distinguir child committed, child unknown y child absent.

## Archive certificate replay
Un certificado antiguo de UNKNOWN puede ser auténtico pero stale. Debe verificarse authority epoch/root, target incarnation y freshness antes de usarlo para una decisión actual.

## Fork
Dos certificados del mismo operation_id/rango pero con diferentes fingerprints, child sets o roots no son dos resultados alternativos para escoger: son conflicto/fork. Preservar ambos y bloquear la decisión que pudiera producir un efecto duplicado.

## Código actual relacionado
El prototype effect-adapter conserva idempotencyKey y prepared state y exige reconciliation antes de reejecutar. Sin embargo, el journal se limita a 200 entradas y el camino de excepción devuelve EFFECT_OUTCOME_UNKNOWN sin persist(). Por ello el modelo de certificado investigado aquí no debe inferirse del actual journal.

## Estado epistemológico
Confirmado conceptualmente: UNKNOWN y PARTIAL necesitan identidad y evidencia a nivel de boundary/sub-effect; compaction debe preservar incertidumbre y no crear permiso de replay.
Pendiente: esquema formal, serialización canónica, proof system, autoridad de receipts, retention/availability guarantees, crash atomicity, implementación y fault injection.

## Residuales AB50→AB58
Se preservan sin cambio: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

## Próximo AB104.219
Investigar la relación entre certificado de archive, Claim Contract y Decision Contract: qué claims son admisibles para convertir UNKNOWN/PARTIAL en una decisión y cuáles nunca deben otorgar permiso de efecto.