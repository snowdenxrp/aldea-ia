# NEXO AB105 CONTINUITY — HISTORICAL DESIGN FRONTIER / 2026-10-05

## CONTINUITY RULE — EXPLICIT
CONTINUITY MUST RECOVER THE ENTIRE RESEARCH PATH, NOT ONLY THE LAST CHECKPOINT.
NADA DE LO INVESTIGADO SE PIERDE, SE OMITE NI SE REEMPLAZA SILENCIOSAMENTE.
TODO HALLAZGO, CONTRADICCIÓN, ESTADO, EVIDENCIA, INTENTO FALLIDO Y DECISIÓN DE “NO REPETIR” FORMA PARTE DE LA CONTINUIDAD.

CONTINUITY MUST PRESERVE:
- historical findings and their epistemic state;
- exact pins, commits, runs, jobs, artifacts and hashes when known;
- contradictions and later corrections;
- failed save/experiment attempts (never convert failure into success);
- closed hypotheses and DO-NOT-REPEAT instructions;
- current frontier and next genuinely new action.

## AUTHORITATIVE PROJECT STATE
Kafka exact pin:
99b940733a9f6bc409457dba7108f08421d81e42

Current AB105 state:
- W1→D1 JMM happens-before: UNKNOWN / NOT IDENTIFIED
- W1→ENQUEUE publication edge: NOT IDENTIFIED
- stale ACL read: NOT OBSERVED / NOT DISPROVEN
- vulnerability: NOT ESTABLISHED
- W1→R1: UNKNOWN
- 117R remains authoritative real-broker temporal witness
- TLC: NOT_RERUN
- Do NOT rerun 117R/G0/TLC/PR92/PR93/PR94 or add artificial synchronization.

## RECENTLY DISCOVERED HISTORICAL FRONTIER
A new, genuinely distinct line was identified: StandardAuthorizer's design genealogy.

Historical sequence:
1. KAFKA-14214 / commit 6c6b8e2: read-write locking was introduced in StandardAuthorizerData for consistent concurrent ACL reads / ordering.
2. KAFKA-14828 / commit df137752542c005c6998c37c03222ffbeca0f349: the read/write locks were later removed in favor of persistent data structures.
3. Our pinned implementation contains immutable AclCache structures and a plain aclCache field.

IMPORTANT EPISTEMIC DISTINCTION:
- Immutable/persistent data structures can establish structural snapshot consistency.
- They do NOT, by themselves, prove a Java Memory Model happens-before edge from the writer thread executing W1 to an unrelated request thread executing D1.
- Therefore the historical discovery does NOT close AB105.
- It is evidence that the concurrency/ordering design evolved, and the exact replacement guarantee must be reconstructed before drawing conclusions.

## WHY THIS WAS MISSED BY THE PREVIOUS AUDIT
The prior audit correctly searched the pinned implementation and the current request/metadata path, but did not systematically reconstruct the historical design genealogy from the earlier lock implementation through its removal.
This is a gap in audit coverage, NOT evidence that earlier conclusions were false.
The new historical frontier must be treated as additive evidence and reconciled with all prior checkpoints.

## CLOSED / DO-NOT-REPEAT
Do not repeat:
- 117R real-broker witness
- G0/PR94 ordering witness
- PR92 in-process cache identity diagnostic
- PR93 production source/local behavioral audit
- D1 snapshot structural diagnostic
- RequestChannel ENQUEUE→DEQUEUE proof
- KafkaRequestHandler DEQUEUE→handler path
- Plugin construction path
- startup authorizer futures/readiness
- metadata-loader lastAppliedOffset request-admission searches already closed
- artificial volatile/latch/barrier/Future synchronization
- TLC historical model unless genuinely new evidence requires it
- recreate failed checkpoint attempts as if successful.

## PRESERVED EVIDENCE FAMILIES
1. Source audit: MetadataLoader → BrokerMetadataPublisher → AclPublisher → StandardAuthorizerData/W1.
2. Request path: Processor → RequestChannel ENQUEUE → DEQUEUE → KafkaRequestHandler → AuthHelper → StandardAuthorizer.authorize/D1.
3. Real-broker temporal witness: run 37098764557, job 111133973894, artifact 11265332252, SHA-256 d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c, workflow run 94, head 4026db554b617243c13de7f881b98473852aee7b.
4. Historical G0 and PR92/93 evidence remain distinct and must not be merged into JMM proof.
5. Controller → metadata log → broker MetadataLoader → AclPublisher → W1 is architecturally traced, but no production request-admission barrier converting loader state into D1 visibility has been identified.

## NEXT ACTION — STRICT
Reconstruct the exact diff and rationale across:
6c6b8e2 → df137752542c005c6998c37c03222ffbeca0f349 → 99b940733a9f6bc409457dba7108f08421d81e42

Questions to answer:
A. What guarantee did KAFKA-14214's lock provide?
B. Why was the lock removed in KAFKA-14828?
C. What exact mechanism replaced the lock?
D. Did the replacement provide only immutable snapshot consistency, or also cross-thread publication/visibility?
E. Are there regression/concurrency tests that establish the intended guarantee?
F. Can that guarantee be mapped specifically to W1→D1 in our pin?

Acceptance rule:
- Do not infer causality from commit titles alone.
- Do not treat trunk/current code as evidence for the exact pin.
- Distinguish structural consistency, ordering, visibility, and JMM happens-before.
- If no explicit W1→D1 publication guarantee is found, retain UNKNOWN.

## CONTINUITY RECOVERY REQUIREMENT
When CONTINUITY is invoked, recover ALL of the above plus prior saved checkpoints and contradictions. Never reduce CONTINUITY to the newest document or newest commit.
