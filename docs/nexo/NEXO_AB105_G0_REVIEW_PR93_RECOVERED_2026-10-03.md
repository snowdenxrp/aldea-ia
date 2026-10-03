# NEXO AB105 G0 — recuperación de evidencia PR #93 — 2026-10-03

## Hallazgo de revisión
La revisión posterior detectó que PR #93 contenía una ejecución real que no habíamos incorporado al resumen activo.

PR: #93 `AB105 G0 authorize snapshot diagnostic (draft)`
Run: `37037323460`
Job: `110938623014`
Head ejecutado: `ed095b1254da730e8b4d15eb3e5203ed50fa0f2d`
Kafka: `99b940733a9f6bc409457dba7108f08421d81e42`
Artifact: `11240801816`
Digest: `sha256:6acacf4881843b194ca3c3782b5b5b267184023565daac13f045e813ac3cb18b`

## Resultado crudo
`ITERATIONS=100 READERS=4 OBSERVATIONS=2939007 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=2845069 OVERLAP_ALLOWED=17769 OVERLAP_DENIED=81 POST_RETURN_PRE_REMOVE_CACHE=0 POST_RETURN_POST_REMOVE_CACHE=2845069 POST_RETURN_UNKNOWN_CACHE=0 POST_RETURN_PRE_REMOVE_SNAPSHOT=0 POST_RETURN_POST_REMOVE_SNAPSHOT=2845069 POST_RETURN_UNKNOWN_SNAPSHOT=0 POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0 UNEXPECTED=0`

## Qué sí establece
- Ejecutó 100 iteraciones con 4 lectores contra el `StandardAuthorizer` al pin exacto.
- El path `findAclRule()` toma un único snapshot local de `aclCache` por autorización y lo reutiliza para la decisión.
- En 2,845,069 observaciones clasificadas como posteriores al retorno del writer, no apareció `ALLOWED`.
- En esas observaciones no apareció el cache pre-remove ni como lectura previa ni como snapshot interno de `authorize()`.
- Sí existieron 17,769 `OVERLAP_ALLOWED`, por lo que el experimento demuestra que la ventana concurrente previa/alrededor de `removeAcl()` es observable y no fue simplemente un test que nunca encontró concurrencia.

## Qué NO establece
- No demuestra JMM happens-before global W1→AUTH.
- No demuestra que un stale-read sea imposible.
- No demuestra seguridad general del mecanismo.
- No es equivalente al witness real-broker de 10 ciclos: este es un stress diagnostic local del authorizer, no una ejecución end-to-end del broker.
- La instrumentación `ThreadLocal` y lecturas reflexivas son diagnóstico y pueden afectar timing; por ello el resultado es evidencia conductual acotada, no una prueba formal.

## Revisión metodológica adicional
El test usa `Thread.join()` solo después de terminar la ventana de observación para recoger/clasificar resultados; no se usa para liberar lectores después de `removeAcl()`. Esto no introduce un gate W1→reader durante la medición.

La clasificación temporal usa `System.nanoTime()`. La comparación post-return es útil como discriminador experimental, pero no convierte timestamps en una relación JMM formal.

## Estado correcto
🟢 PR93 runtime diagnostic = EVIDENCE RECOVERED / ACCEPTED AS BOUNDED LOCAL BEHAVIORAL EVIDENCE.
🟢 POST_RETURN_ALLOWED = NOT_OBSERVED (2,845,069 observations).
🟢 POST_RETURN_PRE_REMOVE_CACHE/SNAPSHOT = NOT_OBSERVED.
🟢 OVERLAP_ALLOWED = OBSERVED (17,769).
🔵 JMM HB = UNKNOWN.
🔵 stale-read possibility = UNKNOWN.
🔵 generalization/exploitability/production impact = UNKNOWN.
🔴 vulnerability = NOT_DECLARED.

## Relationship to later real-broker witness
PR93 strengthens the bounded evidence because it probes the exact `aclCache` snapshot boundary directly, while the later real-broker witness proves temporal ordering through W1→ENQUEUE→DEQUEUE→AUTH. They answer different questions and must not be collapsed into one theorem.

## DO-NOT-REPEAT
No AB105.117R.
No TLC rerun.
No merge of PR93 as canonical Kafka source.
No re-run of the same PR93 diagnostic unless a genuinely new hypothesis requires it.
