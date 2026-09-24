# PG-009 — Formal Unification Audit
Fecha: 2026-09-24
Estado: diseño de unificación; NO verificado por SANY/TLC.

## Objetivo
Intentar romper la arquitectura formal por inconsistencias entre sketches, fixtures y contratos antes de añadir nuevas propiedades.

## Ataques adversariales de consistencia
F-01 evidence de A usada en B → DENY
F-02 target de A sustituido por target B → DENY
F-03 evidence correcta con generation vieja → DENY
F-04 authority epoch viejo → DENY
F-05 policy version cambia después de evidence → INVALIDATE/REVALIDATE
F-06 dependency KNOWN→UNKNOWN → HOLD/DENY
F-07 dependency KNOWN→COMPROMISED → HOLD/DENY
F-08 lease expira → cambia ownership; no inferir NO_EFFECT
F-09 owner anterior intenta actuar → DENY
F-10 recovery adquiere con reconciliation lease activa → DENY
F-11 reconciliation adquiere con recovery lease activa → DENY
F-12 STOP durante ADMITTED/RUNNING → ejecución bloqueada y release invalidado
F-13 revoke authority durante recovery → fence + invalidación
F-14 rollback a artifact anterior incompatible → DENY/QUARANTINE
F-15 componentes separados comparten trust root → no declarar independencia plena
F-16 observadores comparten data source manipulado → no contar como evidencia independiente
F-17 process restart → no release
F-18 checkpoint restore → no authority restore
F-19 network timeout → UNKNOWN, no NO_EFFECT
F-20 firma válida de artifact mal configurado → authenticity != safety

## Nuevas contradicciones estructurales

U-01 — Una sola variable worldState mezcla epistemología y realidad.
Solución: separar observed_state, evidence_state, verified_world_state y external_effect_state.

U-02 — Evidence necesita identidad y versión.
Debe ligarse a effect_id, target, fingerprint, authority epoch, policy version, dependency graph version y freshness.

U-03 — Invalidation debe ser explícita.
Cambios materiales posteriores deben invalidar evidence previa; no basta recalcular eligibility.

U-04 — Recovery y reconciliation necesitan ownership separado.
Ya están separados; la integración canónica debe conservarlo.

U-05 — Formal correspondence debe mapear estados y transiciones, no sólo nombres.
Debe declarar precondiciones, postcondiciones, variables afectadas y prohibiciones.

U-06 — Independencia necesita un objeto de claim.
No es una propiedad absoluta de dos componentes; depende del claim, failure domains y trust assumptions.

## Reestructuración propuesta

El modelo formal canónico deberá tener cinco objetos centrales:
1. Operation — intención ejecutable exacta.
2. EffectBinding — efecto externo, target, fingerprint y precondiciones.
3. AuthorityContext — autoridad, capability y epoch.
4. EvidenceRecord — observación, provenance, freshness, dependency closure y versiones.
5. ControlLease — ownership/fencing para recovery y reconciliation.

ReleaseEligible debe derivarse de estos objetos y no de un booleano aislado como worldState=KNOWN.

## Estado de pruebas

Los puntos anteriores son pruebas de diseño/adversariales y resultados esperados, no resultados de ejecución. SANY/TLC y tests runtime aún no están ejecutados en este entorno. No se afirma PASS.

## Próximo bloque

Construir el modelo formal canónico unificado, generar fixtures y propiedades desde él, ejecutar SANY/TLC y tests ejecutables, y tratar cualquier divergencia como defecto de especificación en vez de parche local.
