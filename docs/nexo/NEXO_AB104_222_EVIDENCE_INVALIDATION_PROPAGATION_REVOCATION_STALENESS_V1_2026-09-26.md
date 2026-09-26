# AB104.222 — Evidence Invalidation Propagation / Revocation / Staleness
Fecha: 2026-09-26
Estado: INVESTIGACIÓN / NO IMPLEMENTAR

## Objetivo
Estudiar qué sucede cuando una raíz de evidencia, issuer, trust root, target incarnation o freshness anchor deja de ser confiable, sin borrar ni reescribir la evidencia histórica.

## Evidencia externa
RFC 9943/SCITT deja claro que transparencia registra Statements y produce Receipts, pero la gestión posterior de cambios y notificaciones queda fuera del protocolo. Por tanto, una receipt histórica no significa que el statement conserve indefinidamente autoridad operacional. citeturn0search0
TUF separa roles y metadata, utiliza expiración y versiones para detectar metadata obsoleta, y usa Snapshot para impedir combinaciones incoherentes de metadata. Esto proporciona un patrón importante: invalidar una dependencia no requiere borrar el registro histórico; cambia su admisibilidad actual. citeturn0search14turn0search5

## Distinción fundamental
Hay que conservar dos cosas simultáneamente:
1. HISTORICAL FACT: qué claim existió, quién lo emitió y qué evidencia lo respaldaba en ese momento.
2. CURRENT ADMISSIBILITY: si ese claim puede seguir siendo usado para una decisión actual.

Revocar una clave, issuer o root NO debe reescribir la historia.
Pero una decisión futura tampoco debe fingir que la evidencia sigue siendo actual.

## Propagación
Modelo conceptual:
root R
→ claim C
→ derived claim D
→ decision Q
→ pending effect P

Si R pasa a REVOKED/COMPROMISED/STale:
- C conserva existencia histórica, pero cambia de estado de admisibilidad.
- D queda INVALIDATED/STALE si depende materialmente de C.
- Q debe ser reevaluada según policy.
- P no debe ejecutarse si Q depende de evidencia ahora inadmisible.

Importante: esto no significa que el efecto histórico desaparezca. Solo impide utilizar la evidencia invalidada como autoridad presente.

## Revocación no es retroceso histórico
Si una operación realmente ocurrió mientras la autoridad era válida, una revocación posterior no convierte mágicamente el hecho en NOT_COMMITTED.
El historial debe conservar:
effect identity, operation_id, authority epoch/root, evidence references, historical decision and later revocation event.

## Staleness
Un claim puede ser auténtico y no revocado, pero estar stale.
TUF usa expiración y versiones para detectar metadata antigua y prevenir freeze/rollback. citeturn0search5turn0search14
Por tanto, APPRAISED_AT y VALID_FOR pueden ser distintos de ISSUED_AT.

## Pending permissions
Una autorización pendiente no debe convertirse en efecto solo porque fue autorizada antes de una invalidación.
Regla candidata:
`permission.validated_under = authority_epoch/root + evidence_digest + freshness context`.
Antes del efecto, se debe verificar que esos preconditions siguen vigentes.
Si la autoridad/evidence root cambió, la autorización pendiente pasa a REVALIDATION_REQUIRED o BLOCKED, no EXECUTE.

## Cascade pero no borrado
Estados conceptuales:
ACTIVE → STALE / REVOKED / COMPROMISED / CONFLICTING
y dependientes:
VALID → NEEDS_REAPPRAISAL → INVALIDATED / STALE / QUARANTINED.

La propagación debe ser monotónica respecto del conocimiento: agregar evidencia de revocación puede reducir la admisibilidad actual, pero no debe eliminar el registro histórico de lo que ocurrió.

## Diferenciar clases
REVOCATION: autoridad explícitamente retirada.
COMPROMISED: confianza rota por evidencia de compromiso.
STALE: evidencia fuera de ventana/freshness, sin afirmar compromiso.
CONFLICTING: existen ramas incompatibles.
UNAVAILABLE: no se puede consultar la evidencia necesaria.
UNKNOWN: el hecho externo sigue sin resolución.
No deben colapsarse en un solo FAILED.

## Archive certificate
Un archive certificate puede preservar que un claim existió y cuál era su estado histórico. Si la raíz que lo autenticaba queda comprometida, el certificate sigue siendo evidencia histórica de la existencia del registro, pero no necesariamente evidencia admisible para una decisión actual.
Si el archive root mismo queda comprometido, también debe propagarse la incertidumbre a claims que dependían exclusivamente de él.

## Revalidación
No todo claim dependiente debe recalcularse por completo ante cualquier cambio.
La dependency graph debe permitir identificar qué decisiones dependen de la raíz afectada y cuáles tienen una ruta independiente suficiente.
Esto evita tanto el error de ignorar una revocación como el error opuesto de invalidar todo el sistema sin justificación.

## Code study
La búsqueda estructural actual para revocation/stale/authority epoch/recovery quarantine/permission no encontró coincidencias con esos términos exactos en el code-search disponible. Esto no prueba ausencia. El prototipo ya estudiado en effect-adapter/runtime sigue siendo evidencia parcial y no contiene una demostración de esta cadena completa.

## Ataques
- root revocado después de autorización pero antes de ejecución → pending permission debe revalidarse.
- root comprometido después de ejecución → histórico preservado; no borrar el efecto.
- stale claim usado como current authority → bloquear/reappraise.
- archive intacto pero trust root invalidado → histórico sí, autoridad actual no.
- unavailable evidence → UNKNOWN/BLOCKED, no inferir NOT_COMMITTED.
- conflicto entre root epochs → QUARANTINE, no elegir por timestamp.

## Estado epistemológico
FUERTE: historical truth y current admissibility deben separarse; invalidación debe propagarse a dependientes sin reescribir historia.
PENDIENTE: grafo formal de propagación, estados monotónicos, versionado de policy, reglas de revalidación y pruebas de crash/concurrencia.
AB50→AB58 residuals unchanged.
No implementación, no V21.

## Próximo AB104.223
Investigar race conditions: revocación/rotación concurrente con decisión y ejecución; determinar el punto de fencing que impide que una autorización stale produzca un efecto.