# NCS M0 — matriz de resultados para timeout de adquisición
Fecha: 2026-10-20
Estado: **propuesta de contrato por API; pendiente de implementación y validación**.
Base: fuentes inspeccionadas en el mapa `NCS_M0_LOCK_DEADLINE_CALLER_MAP_2026-10-20.md`.

## 1. Principio común

Un timeout de adquisición significa exclusivamente: **esta llamada no comenzó su fase de lectura-modificación-escritura bajo lock**. No significa que el archivo esté ausente, que la revisión haya cambiado, que una escritura fallara ni que el resultado de una persistencia iniciada sea UNKNOWN.

El deadline es absoluto, monotónico y por operación. Un único deadline se pasa por todas las mutaciones de Continuity y Chronicle dentro de la misma operación interactiva.

## 2. Matriz propuesta

| Método | Contrato actual relevante | Forma propuesta para timeout de adquisición | Motivo |
|---|---|---|---|
| Continuity `initialize(snapshot)` | Devuelve resultados `failed/conflict/committed/unknown`; adquisición fallida se normaliza a `failed` | `{status:"failed", code:"NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT", phase:"lock_acquisition", writeStarted:false}` | Conserva su contrato de resultado estructurado; el campo `writeStarted:false` separa timeout de persistencia incierta. |
| Continuity `commitIfCurrent(expectedRevision,candidate)` | Devuelve resultado estructurado para rutas no disponibles, pero actualmente propaga otras fallas de adquisición como excepción | Devolver el mismo resultado estructurado de timeout anterior, exclusivamente para deadline vencido; mantener otras excepciones/fallos según contrato existente | Timeout es resultado de dominio conocido, no un error OS. No cambiar por conveniencia el resto de errores sin revisar consumidores. |
| Chronicle `initialize()` | Devuelve `blocked/conflict/committed/unknown`; adquisición fallida se normaliza a `blocked` | `{status:"blocked", code:"NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT", phase:"lock_acquisition", writeStarted:false}` | Conserva el contrato Chronicle. |
| Chronicle `append({operationKey,content})` | Devuelve resultados de validación/read/write; otras fallas de adquisición actualmente pueden lanzar excepción | Devolver el resultado estructurado de timeout anterior, exclusivamente para deadline vencido; conservar otros errores según contrato existente | Permite al handler y a su caller distinguir el timeout de los resultados de append inciertos. |
| Chronicle effect handler | Convierte resultado no committed/already_present en `blocked` | Propagar código exacto de timeout; no declararlo completed ni verified | Timeout antes de lock no es prueba de aplicación del efecto. |
| Owner y runtime canónico | Owner mutations devuelven estados; runtime envuelve fallas previas a dispatch como bloqueadas, y después de dispatch preserva UNKNOWN/no-redispatch | Mapear timeout previo a PREPARED como bloqueado/no-dispatch; timeout posterior a PREPARED no autoriza redispatch y debe seguir la ruta de recarga/reconciliación ya existente | Mantener las invariantes actuales; no crear una nueva ruta de retry. |
| Aplicación `runNexoChronicleAppend` | Devuelve resultado público normalizado | Preservar el código de timeout y evidencia `dispatchAttempted:false` cuando ocurrió antes de dispatch; no convertir todos los timeouts en un genérico `blocked` si eso borra información de fase | La capa pública debe conservar el hecho causal que permite actuar de forma segura. |

Los campos `phase` y `writeStarted` son **propuesta**, no campos ya implementados ni parte del contrato vigente. Deben contrastarse con convenciones de resultados antes de adoptar la forma definitiva. Evitar duplicar campos si existe una representación canónica equivalente.

## 3. Adquisición que retorna tarde

Caso importante: una llamada de adquisición puede iniciar antes del deadline y resolver con éxito después. No se permite empezar la fase de escritura en ese caso.

1. Confirmar propiedad usando el mecanismo de token/owner existente; no inferir propiedad sólo por la existencia del directorio.
2. Si la propiedad está confirmada, intentar liberar únicamente ese lock.
3. Devolver timeout con `writeStarted:false` sólo si la fase protegida no comenzó.
4. Si la liberación falla, preservar el timeout de adquisición y el resultado de liberación como hechos separados. No afirmar lock liberado.
5. Si la propiedad no se puede determinar, reportar estado de lock desconocido y detenerse; no borrar el lock.
6. No reutilizar una escritura/rename iniciada previamente como si fuera timeout de adquisición.

El contrato no promete tiempo de pared máximo estricto cuando una llamada filesystem no retorna.

## 4. Preservación de recibos

No aplanar:
- `persistenceStatus` cuando el lock release falla después de una escritura;
- `lockRelease` (`failed`, `not_owned`, `released_after_retry`);
- `status:"unknown"` tras resultado de escritura/rename ambiguo;
- `preparedCommitted:"UNKNOWN"`, `journalSettled:"UNKNOWN"` o `redispatchAuthorized:false` después de un efecto posible.

El timeout no reemplaza ni reescribe una recepción de persistencia ya obtenida.

## 5. Pruebas que deben cubrir la matriz

- Timeout previo a adquisición para los cuatro métodos, con comprobación de que no se invoca escritura/rename.
- Timeout con lock retenido por proceso vivo.
- Adquisición que retorna después del deadline: no escritura, liberación sólo de lock propio.
- Fallo de liberación tras adquisición tardía: timeout + liberación fallida, sin falsa liberación.
- Los fallos OS existentes siguen diferenciados del timeout; mantener regresiones de EACCES, path unavailable, stale, owner corrupto y lock state unknown.
- Continuity timeout antes de PREPARED → `dispatchAttempted:false`.
- Chronicle append timeout después de PREPARED/posible dispatch → no segundo dispatch; reload/reconciliation.
- Timeout al persistir lineage/outcome → preservar UNKNOWN cuando la fase de persistencia realmente pudo comenzar.
- Concurrencia de misma revisión y todos los recibos actuales de write/rename y lock release siguen pasando.

## 6. Pendientes que bloquean implementación completa

1. Confirmar el presupuesto finito inicial configurable. Recomendación de arquitectura: **2.000 ms iniciales, configurable**, como hipótesis para pruebas, no garantía de tiempo de pared. Aún no es una decisión aceptada.
2. Confirmar o refinar la forma exacta de resultado (`phase`/`writeStarted`) tras revisar convenciones existentes.
3. Implementar helper monotónico mínimo y propagar un único deadline desde la frontera de aplicación, no desde cada store.
4. Implementar tests antes de considerar cualquier estado cerrado; ejecutar CI M0 sobre un SHA exacto.

## 7. Estado de seguridad

Diseño solamente: no hay cambios de runtime/tests ni CI nuevo por esta matriz.
M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.
