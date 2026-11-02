# NCS M0 — evaluación semántica del objeto Continuity para P01-A/P01-G

Fecha: 2026-11-01
Rama: `ncs-lumina-decoupling-2026-10-29`
Código de referencia: `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`
Estado: ANÁLISIS ESTÁTICO DE EVIDENCIA; NO RECLASIFICA LA DECISIÓN DEL PROPIETARIO; NO AUTORIZA CREACIÓN.

## 1. Pregunta

Determinar qué demuestra el código actual sobre la semántica del archivo Continuity candidato: si es una fuente de autoridad constitucional o un store de continuidad operacional con consecuencias de flujo. No se reabre el censo de callers.

## 2. Evidencia del modelo de datos

El envelope del store es `NEXO_CONTINUITY_STORE`, versión 1, con `storeRevision` y un snapshot de:
- `missions`: misiones admitidas y pasos;
- `attempts`: historial de intentos;
- `doNotRepeat`: restricciones consultadas por planificación;
- `executions`: linaje/idempotencia de ejecución;
- `effectJournal`: obligaciones PREPARED y seguimiento/reconciliación de efectos.

No contiene, en el esquema inspeccionado, campos declarados como clave raíz, identidad criptográfica, Constitución, policy binding o credencial de owner. La ausencia de esos campos no basta por sí sola para probar que ningún consumidor derive autoridad del objeto; debe cruzarse con los contratos y consumidores dentro del alcance.

## 3. Evidencia de semántica operacional

El código actual de `continuity-owner.mjs` declara y aplica lo siguiente:
- El owner puede admitir una misión y persistir una obligación PREPARED antes del dispatch de un adaptador.
- `recordOutcome()` persiste una afirmación de resultado; el comentario explícito indica que no liquida `effectJournal` ni autoriza efectos.
- `recordExecutionLineage()` registra linaje del resultado del adaptador, pero no liquida el journal ni afirma por sí solo que el efecto externo sea terminal.
- `recordPrepared()` devuelve resultados con `authorization: NOT_EVALUATED`; los estados PREPARED existentes se tratan como obligación no resuelta, no como permiso para redispatch.
- `reconcilePrepared()` conserva `causalAttribution: NOT_ESTABLISHED`, `redispatchAuthorized: false` y `authorization: NOT_EVALUATED` en el resultado observado.
- `publicChronicleResult()` fuerza `authorization: NOT_EVALUATED` y `redispatchAuthorized: false`; el código comenta que no hay evaluador de autoridad owner conectado a este prototipo.

Conclusión acotada: el store tiene **consecuencia operacional real** porque sus datos participan en admisión de misiones, preparación, planificación e interpretación de recuperación. En el código inspeccionado no aparece como una fuente que establezca autoridad constitucional ni como evaluador que autorice efectos protegidos. No debe describirse como dato inerte, pero tampoco como raíz de confianza demostrada.

## 4. Separación de conceptos que debe quedar explícita

| Concepto | Qué significa para este objeto |
|---|---|
| Autoridad constitucional | No está establecida por el archivo Continuity, su revisión, su lock, su snapshot ni su existencia. |
| Autoridad/permiso para efectos protegidos | El store no lo evalúa en el código inspeccionado; los resultados conservan `NOT_EVALUATED` y no autorizan redispatch. |
| Influencia operacional | Sí existe: misiones, `doNotRepeat`, PREPARED, linaje y journal afectan planificación, admisión y recuperación. |
| Integridad/continuidad de estado | Sí es una responsabilidad del store; corrupción, ausencia ambigua o resultado incierto deben bloquear. |

Por tanto, «no autoritativo» no puede significar «sin influencia en el comportamiento». La formulación técnicamente sostenible, si el propietario la acepta, sería: **persistencia operacional local M0, con influencia acotada en el flujo, que nunca establece identidad/Constitución/autoridad ni concede por sí misma permiso para efectos protegidos**.

## 5. Lo que esta evidencia no demuestra

- No demuestra exhaustividad de todos los consumidores o imports dinámicos del repositorio.
- No demuestra que ningún dato del store pueda influir indirectamente en una decisión protegida fuera de los caminos inspeccionados.
- No establece la base normativa legítima para la primera escritura.
- No establece el path real, el snapshot de una instancia ni el entorno de primera publicación.
- No demuestra exclusión ambiental, quiescencia, protección frente a writers no cooperativos ni defensa frente a TOCTOU.
- No convierte los tests de fixtures temporales en evidencia de publicación real en POCO.

## 6. Relación con las decisiones del propietario

- El propietario eligió `U` para P01-A: no clasificar el objeto como local no autoritativo (`L`) ni como constitucional/autoridad (`C)) mientras la evidencia no lo permita.
- El propietario aprobó la regla provisional de primera creación el 2026-10-28, pero esa regla exige que se definan el propósito/clasificación del objeto exacto, la regla legítima aplicable y las precondiciones verificables antes de permitir creación. La aprobación no autoriza la escritura.
- El propietario confirmó mantener `STOP` mientras la base legítima aplicable no esté definida y reconocida.
- La autorización técnica del 2026-11-01 para terminar M0 permite desarrollar y verificar código; no sustituye una decisión reservada sobre clasificación/autoridad ni habilita primera publicación.

Este análisis no modifica esas decisiones.

## 7. Recomendación técnica pendiente de ratificación

La evidencia favorece una distinción: el objeto no parece ser una raíz constitucional ni un credential store; sí es estado operacional con consecuencias sobre el flujo de Nexo. Si la categoría `L` se define como «local, operacional y no fuente de autoridad constitucional/permiso de efectos», podría ser semánticamente compatible con el código. Si `L` exige que el objeto carezca de influencia operacional, la evidencia no permite clasificarlo como `L`.

No escoger entre esas interpretaciones por el propietario. Hasta que el significado de `L` y la clasificación del objeto exacto estén aceptados, P01-A conserva `U / OPEN / UNKNOWN`. P01-G permanece `PENDING / UNKNOWN`; primera creación `STOP`.

## 8. Estado

M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-A `U`; P01-G `PENDING / UNKNOWN`; P01-B separación operacional implementada/CI-verificada según su delta, mientras B2/P01-B conserva `C — NO SELECCIONAR TODAVÍA`; P01-C/P01-D `OPEN / UNKNOWN`; P-05 no ratificada; raíz legítima `PENDING / UNKNOWN`; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos `STOP`.

Solo análisis documental. No se modificó runtime, tests, workflows, configuración ejecutable ni dispositivo; no se ejecutaron pruebas/CI/Actions ni se creó Continuity.
