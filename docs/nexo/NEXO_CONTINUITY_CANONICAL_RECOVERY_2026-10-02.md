# NEXO — CANONICAL CONTINUITY RECOVERY
Fecha: 2026-10-02
Repo canónico: snowdenxrp/aldea-ia
Propósito: recuperación tras pérdida del chat. Este archivo NO sustituye la evidencia primaria; consolida el estado verificable.

## REGLA DE AUTORIDAD
1. GitHub commit/PR/Actions raw evidence > continuidad conversacional > memoria.
2. Un checkpoint documental nunca puede convertir UNKNOWN en VERIFIED.
3. Si dos documentos contradicen el estado real del repo, prevalece el estado comprobado directamente y la discrepancia se registra.
4. No reconstruir pasos perdidos por inferencia.
5. Toda continuación debe preservar UNKNOWN/PENDING y DO-NOT-REPEAT.

## ANCLA EXPERIMENTAL
AB105.116R = INTACT / NO MODIFICAR
AB105.117R = NOT_CREATED
TLC = NO_RERUN

## PR #89 / CÓDIGO EJECUTADO
PR #89 = OPEN / NOT MERGED
Base main = 399a7cefb207c847ec132405a447103b3568f6f3
Head branch = nexo-ab105-g0-jmm-causal-window-v2
EXECUTED_HEAD = 0388dce81a2e08dd90f96f6806fe74683ed6f543
Pinned Kafka = 99b940733a9f6bc409457dba7108f08421d81e42

El commit ejecutado 0388dce fue contrastado directamente: la corrección Checkstyle extrajo la clasificación a ClassificationCounts y auxiliares, sin cambiar el criterio observation.enter > writerObservation.exit, la ventana, iteraciones, readers, removeAcl, authorize, almacenamiento local ni introducir sincronización de carrera.
CLASSIFICATION_SEMANTICS = PRESERVED
RACE_SYNCHRONIZATION_ADDED = FALSE
EXPERIMENT_SEMANTIC_DRIFT = NOT_FOUND

## EVIDENCIA RAW VERIFICADA
Run 36965213770 / job 110707365331:
ITERATIONS=100 READERS=4 OBSERVATIONS=2531489
POST_RETURN_ALLOWED=0
POST_RETURN_DENIED=2466195
OVERLAP_ALLOWED=18300
OVERLAP_DENIED=62
UNEXPECTED=0

Run 36965213781 / job 110707365140:
ITERATIONS=100 READERS=4 OBSERVATIONS=5556071
POST_RETURN_ALLOWED=0
POST_RETURN_DENIED=5457434
OVERLAP_ALLOWED=29225
OVERLAP_DENIED=68
UNEXPECTED=0

TWO_RUNS_RAW_VERIFIED = TRUE
POST_RETURN_ALLOWED_BOTH_RUNS = 0
OVERLAP_ALLOWED_BOTH_RUNS = OBSERVED
UNEXPECTED_BOTH_RUNS = 0

## INTERPRETACIÓN EPISTÉMICA
POST_RETURN_ALLOWED > 0 = witness conductual de ALLOWED después del retorno medido de removeAcl; mecanismo causal exacto = UNKNOWN.
POST_RETURN_ALLOWED = 0 = ausencia del witness en las ejecuciones realizadas; NO prueba imposibilidad.
OVERLAP_ALLOWED > 0 = concurrencia temporal observada; NO prueba stale visibility.
JMM_HB = NOT_IDENTIFIED
STALE_READ = UNKNOWN
STALE_ALLOWED = NOT_OBSERVED_IN_CURRENT_RUNS
CACHE_VERSION_WITNESS = ABSENT
MECHANISM_ATTRIBUTION = UNKNOWN
EXPLOITABILITY = UNKNOWN
GENERALIZATION = UNKNOWN
PRODUCTION_IMPACT = UNKNOWN
SECURITY_CONCLUSION = NOT_ESTABLISHED

## MECANISMO INSPECCIONADO
StandardAuthorizer.authorize() toma una referencia local de data.
StandardAuthorizerData.aclCache es plain.
removeAcl() construye/reemplaza un AclCache immutable.
StandardAuthorizerData está documentada como no thread-safe.
No se identificó una publicación común por mutación steady-state entre W1 removeAcl y R1 authorize.
Plugin.get() devuelve la misma referencia y no añade sincronización.
Metadata/event synchronization identificada termina en el dominio de metadata; RequestChannel publica Request, no el estado ACL.
La discrepancia comentario-versus-implementación sobre un read-write lock permanece registrada y NO debe resolverse por supuesto.

## FRONTERA METODOLÓGICA
El harness actual es un discriminador conductual/temporal válido.
No es un witness directo de JMM happens-before ni de identidad/version del AclCache.
No modificar AB105.116R para obtener una atribución secundaria salvo que una nueva fase sea explícitamente autorizada y separada de la evidencia existente.

## SIGUIENTE ACCIÓN CANÓNICA
No repetir TLC.
No repetir los dos runs ya verificados.
No crear AB105.117R.
No modificar AB105.116R.
Continuar desde la frontera de atribución causal: formalizar exactamente qué puede y qué no puede establecer el witness conductual existente y buscar evidencia adicional sólo si no altera la carrera ni mezcla diagnóstico con prueba.
Toda nueva evidencia debe guardarse inmediatamente en un checkpoint con: fuente exacta, SHA/run/job, observación, interpretación, UNKNOWN/PENDING y DO-NOT-REPEAT.

## RECUPERACIÓN
Si un chat futuro pierde contexto, cargar primero este archivo y después contrastar directamente el HEAD/PR/Actions actuales. Nunca asumir que una continuidad conversacional anterior es más reciente que GitHub.
