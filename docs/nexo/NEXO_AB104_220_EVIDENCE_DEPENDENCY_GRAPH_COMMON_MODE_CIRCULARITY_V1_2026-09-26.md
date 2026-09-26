# AB104.220 — Evidence Dependency Graph / Independence / Common-Mode Failure
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR

## Objetivo
Determinar cuándo múltiples claims constituyen evidencia realmente adicional y cuándo son copias, derivados o dependen del mismo fallo común.

## Evidencia externa
RFC 9334 RATS define Evidence como un conjunto de Claims sobre un Target Environment y establece que el Verifier debe valorar relevancia, cumplimiento y oportunidad; además exige asociación segura con el entorno correcto. Esto respalda separar claim individual de su appraisal.
RFC 9943/SCITT separa Signed Statement de Receipt y enfatiza consistencia/no-equivocación de la estructura verificable. Un receipt demuestra inclusión; no convierte por sí mismo el statement en verdad.

## Hallazgo central
Dos claims no equivalen automáticamente a dos evidencias.
A = target afirma COMMITTED; B = archive registra la afirmación A. B depende de A y del mismo issuer/target. A+B no deben contarse como dos fuentes independientes para superar una política de confianza.
Modelo conceptual: claim -> issuer -> substrate -> observation boundary -> dependencies -> evidence. La decisión debe evaluar el grafo, no solo contar firmas.

## Clases de dependencia
1. DIRECT: claim observado directamente en el boundary relevante.
2. DERIVED: claim calculado de otros claims.
3. CORROBORATING: evidencia independiente que observa el mismo hecho desde otro boundary.
4. COMMON_MODE: varios claims comparten issuer, dispositivo, almacenamiento, reloj, red, snapshot o raíz de confianza.
5. CIRCULAR: A valida B y B valida A sin una raíz independiente.
6. CONFLICTING: claims incompatibles sobre la misma identidad/boundary.
7. STALE: evidencia históricamente válida pero fuera de la autoridad/frescura requerida.

## Regla de independencia
different signatures != independent evidence.
La independencia útil requiere, según la política, separación suficiente de issuer/authority, observation boundary, storage/history, trust root, target incarnation, failure domain y time/freshness source.
No se fija todavía una fórmula universal de independencia.

## Ejemplo
Target receipt + local CommitRecord + archive certificate pueden parecer tres pruebas. Pero si todos derivan del mismo target response y una misma base mutable, son una sola raíz de evidencia con transformaciones posteriores.
En cambio, target authoritative ledger + independent attested target observation pueden aportar corroboración, siempre que sus failure domains y autoridad estén realmente separados.

## Circularidad
Ejemplo prohibido: Decision D se usa para emitir claim C; C se usa como evidencia para justificar D. Sin una evidencia raíz independiente, esto no aumenta confianza.

## Conflicto
Dos claims válidos COMMITTED(op, fp1) y COMMITTED(op, fp2), con mismo operation_id y fingerprints distintos, implican COLLISION/CONFLICT, no mayoría por conteo.
Dos autoridades distintas que discrepan deben conservar ambas ramas y entrar en resolución/quarantine según policy.

## Archive certificates
Un archive certificate añade continuidad de rango, identidad de registros, compromiso criptográfico y estado histórico preservado.
No añade por sí solo una observación nueva del target. Por ello target claim + archive receipt normalmente es evidencia reforzada de integridad/continuidad del claim, no dos observaciones independientes de ejecución.

## Decision admissibility
Antes de producir una decisión: validar sintaxis/canonicalización; autenticidad; issuer/authority; subject/operation/effect binding; target incarnation; freshness; construir dependencias; identificar claims derivados; detectar common-mode; detectar circularidad; detectar conflictos; comprobar evidencia suficiente para la conclusión específica; solo entonces producir DecisionContract.

## UNKNOWN/PARTIAL
UNKNOWN no se resuelve por acumulación ciega de claims.
PARTIAL debe conservar el grafo por sub-effect. Un claim padre PARTIAL no autoriza reejecutar hijos UNKNOWN. Para resolver un hijo se necesita evidencia admisible sobre ese hijo o una garantía explícita de target que cubra su identidad.

## Qué nunca debe conceder permiso
Ninguna de estas, por sí sola, debe convertirse en EXECUTE: archive inclusion; local journal presence/absence; timestamp; receipt de transporte sin semántica target; firma histórica fuera de authority epoch; dos claims derivados del mismo root; mayoría numérica sin authority/quorum contract; ausencia de registro fuera de retention guarantee; claim que depende circularmente de la decisión que pretende justificar.

## Code study
La búsqueda estructural del repositorio para Claim Contract, Decision Contract, evidence dependency, common-mode y effect contract no devolvió coincidencias en la superficie de code-search disponible. Esto NO demuestra que no exista lógica relacionada; solo significa que no se encontró con esos términos. Los archivos ya inspeccionados en AB104.213-215 siguen siendo evidencia del prototipo, no de la arquitectura futura.

## Estado
FUERTE: contar claims no basta; provenance/dependency/common-mode deben ser explícitos para decisiones de alta confianza.
PENDIENTE: definir representación formal del Evidence Dependency Graph, independencia/failure domains, reglas de agregación, autoridad de raíces y pruebas adversariales.
AB50→AB58 residuals unchanged.
No implementación, no V21.

## Próximo AB104.221
Atacar el Evidence Dependency Graph con escenarios de common-mode: reloj comprometido, misma base restaurada, issuer comprometido, trust-root comprometido, snapshot compartido, quorum con miembros correlacionados y claims aparentemente independientes.