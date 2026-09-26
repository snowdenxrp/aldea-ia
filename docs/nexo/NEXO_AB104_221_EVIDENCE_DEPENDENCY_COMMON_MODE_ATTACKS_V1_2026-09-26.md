# AB104.221 — Evidence Dependency Graph: Common-Mode Adversarial Audit
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR

## Objetivo
Atacar la aparente independencia de múltiples claims y determinar cuándo un fallo común invalida toda una rama de evidencia.

## Evidencia externa estudiada
RFC 9334 separa Evidence, Verifier/Appraisal Policy y Relying Party/decision. También exige asociación segura con el Target Environment y trata freshness como propiedad propia, con epoch/nonce u otros mecanismos según el protocolo. Esto respalda que autenticidad, identidad del target, appraisal y freshness no sean una sola propiedad. citeturn0search0
SCITT define receipts como pruebas de inclusión de Signed Statements y trata non-equivocation como consistencia de la estructura verificable. Una inclusión consistente no convierte automáticamente el statement en verdad semántica. citeturn0search2turn0search3
TUF documenta rollback y freeze attacks, mostrando que evidencia auténtica puede ser antigua o repetida indefinidamente si no existe una defensa de freshness/rollback. citeturn0search1

## Ataque A — reloj compartido comprometido
Claims de varios componentes pueden tener timestamps diferentes pero depender del mismo reloj manipulable. Timestamp agreement no constituye independencia.
Regla: el reloj puede aportar orden temporal, pero no debe ser la única raíz de freshness cuando el atacante controla ese failure domain.

## Ataque B — misma base restaurada
Target receipt, local CommitRecord y archive certificate pueden parecer tres fuentes. Si todos provienen de la misma base restaurada a un snapshot antiguo, comparten el rollback.
Resultado: no se suman como evidencia independiente. La continuidad del storage debe ser evaluada por separado.

## Ataque C — issuer comprometido
Diez claims firmados por el mismo issuer comprometido siguen teniendo una misma raíz de autoridad. Multiplicar firmas no recupera independencia.
RATS refuerza la necesidad de trust anchors y appraisal policy; la confianza en el issuer/Verifier es un componente distinto del contenido firmado. citeturn0search0

## Ataque D — trust-root comprometido
Si dos supuestas fuentes terminan en el mismo trust root comprometido, su diversidad aparente no es diversidad criptográfica/autoridad.
Una rotación o nueva firma no debe considerarse independiente si el atacante controla la raíz que autoriza la rotación.

## Ataque E — snapshot compartido
Dos dispositivos restaurados desde la misma imagen pueden producir claims distintos pero compartir exactamente la misma historia rollbackable. Device IDs diferentes no garantizan historia independiente.

## Ataque F — quorum correlacionado
3 de 5 firmantes pueden satisfacer un umbral sintáctico y aun así compartir proveedor, imagen, almacenamiento, operador o trust root. Quorum count no equivale automáticamente a independencia.
Por tanto, un futuro quorum policy debe definir elegibilidad y failure domains; no basta con contar claves.

## Ataque G — claims aparentemente independientes
Un verifier puede producir Claim B a partir de Claim A y firmarlo. B tiene autoridad de verifier, pero no constituye una observación independiente de A. Su valor puede ser el appraisal/transformación, no una segunda medición del hecho.
Esto coincide con RATS: Evidence es valorada por un Verifier mediante appraisal policy y produce Attestation Results que luego usa el Relying Party. Son roles/artefactos distintos, no automáticamente observaciones independientes. citeturn0search0

## Ataque H — freshness falsa
Un claim correctamente firmado puede ser viejo. TUF muestra el patrón de rollback/freeze; RATS también trata freshness explícitamente. Por ello `signature_valid = true` no implica `fresh = true`. citeturn0search0turn0search1

## Ataque I — archive + source + receipt
Un archive certificate y un receipt de transparencia pueden demostrar continuidad/inclusión de una afirmación fuente. Si ambos derivan del mismo statement, su combinación fortalece integridad y disponibilidad histórica, pero no crea una segunda observación del target.

## Ataque J — conflicto entre ramas
Dos grafos de evidencia pueden ser internamente válidos y terminar en conclusiones incompatibles. No debe resolverse por arrival time, timestamp, número de nodos o tamaño del archivo.
Debe existir una autoridad/policy explícita para resolver el conflicto; mientras tanto, QUARANTINE/CONFLICT.

## Resultado conceptual
Un Evidence Dependency Graph debe poder responder, antes de una decisión:
- ¿quién originó cada claim?
- ¿qué observó realmente?
- ¿qué claims derivó?
- ¿qué trust root autoriza al issuer?
- ¿qué storage/history comparte?
- ¿qué target incarnation observa?
- ¿qué freshness mechanism usa?
- ¿qué failure domains comparte?
- ¿existen ciclos?
- ¿existen conflictos?
- ¿qué parte del grafo queda inválida si una raíz falla?

## Regla de common-mode
Si una raíz común falla, todos los claims dependientes deben degradarse conjuntamente; no deben conservarse artificialmente como votos independientes.

## Regla para UNKNOWN/PARTIAL
Common-mode failure no resuelve UNKNOWN. Al contrario: puede ampliar la incertidumbre.
Para PARTIAL, la dependencia debe calcularse por sub-effect; un único root failure puede invalidar múltiples hijos.

## Lo que nunca debe convertirse en permiso
Un conjunto de claims aparentemente numeroso no autoriza EXECUTE si su independencia no está demostrada según la policy.
En particular: firmas múltiples del mismo root, timestamps múltiples del mismo reloj, receipts de la misma cadena, snapshots compartidos, quorum correlacionado o claims derivados no deben convertirse automáticamente en autorización.

## Estado epistemológico
FUERTE: common-mode y dependencia deben formar parte explícita del appraisal antes de contar evidencia.
PENDIENTE: modelo formal de failure-domain labels, independencia mínima por decisión, propagación de invalidación y reglas de quorum.
AB50→AB58 residuals unchanged.
No implementación, no V21, no afirmación de verificación formal.

## Próximo AB104.222
Investigar propagación de invalidación: si una raíz de evidencia se revoca, corrompe o queda stale, cómo se recalculan claims derivados, decisiones históricas y permisos pendientes sin reescribir el pasado.