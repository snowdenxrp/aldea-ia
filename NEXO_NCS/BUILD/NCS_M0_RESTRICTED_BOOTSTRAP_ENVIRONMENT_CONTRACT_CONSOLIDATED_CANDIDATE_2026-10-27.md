<!-- Consolidated candidate derived from revised candidate SHA 935bfe80f87e33003524afc39e30b7fc98debed6 and reviewed corrections proposal/addendum. New documentary candidate only; base files remain unchanged. -->

# NCS M0 — borrador de contrato verificable del entorno restringido para bootstrap de Continuity

**Fecha:** 2026-10-27  
**Estado:** BORRADOR DOCUMENTAL DERIVADO DE DECISIÓN DEL PROPIETARIO — NO RATIFICADO — ENTORNO REAL NO IDENTIFICADO NI DEMOSTRADO  
**Ámbito:** exclusivamente el diseño de la primera publicación del archivo Continuity candidato descrito en P01-A; no equivale a autorización de creación.

## 1. Decisión y base documental reutilizada

El propietario eligió permitir un entorno operativo restringido con precondiciones explícitas y verificables. Esta elección delimita el alcance permitido; no declara que un entorno concreto ya exista.

Este borrador reutiliza, sin repetir los censos ni volver a auditar sus fuentes:

- `NCS_M0_OWNER_DECISION_RESTRICTED_BOOTSTRAP_ENVIRONMENT_2026-10-27.md` — decisión de alcance.
- `NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md` — P01-A/B/C/D/E/F/G/H y sus brechas. La enumeración no implica cierre, ratificación ni autorización de ningún criterio.
- `NCS_M0_P01_EXACT_CANDIDATE_OBJECT_AND_FIELD_CONSUMER_MAP_2026-10-27.md` — el objeto candidato es el archivo Continuity ausente que una invocación real de `openNexoContinuityOwner` intenta inicializar, identificado por su `filePath` efectivo; no se ha demostrado una ruta universal.
- `NCS_M0_CONTINUITY_BOOTSTRAP_EXCLUSION_MODEL_RECONCILIATION_2026-10-27.md` — diferencia entre lock cooperativo, escritores no cooperativos y quiescencia.
- `NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md` — separación propuesta entre commit normal y bootstrap explícito; sigue siendo propuesta.
- `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md` — la evidencia de cierre debe estar ligada al contrato/código/SHA exacto.

## 2. Contrato de alcance

La primera publicación solo podrá considerarse dentro del entorno restringido cuando se hayan definido y demostrado todas las condiciones de esta tabla. “Incluido” no significa “protegido por el runtime actual”; significa únicamente que el contrato final deberá cubrir esa clase con evidencia. Las clases no identificadas se consideran desconocidas, no ausentes.

| Elemento | Regla requerida para el contrato | Estado de evidencia |
|---|---|---|
| Objeto de destino | Identificar la invocación, el `filePath` efectivo y el objeto exacto que sería creado; enlazar la evidencia al path y a la revisión evaluados. No asumir `<root>/continuity.json` universal. | Parcial: clase de objeto identificada; path y bytes iniciales efectivos no fijados universalmente. |
| Finalidad del objeto | Definir explícitamente su semántica y límites. No tratar el store como trust anchor, identidad, permiso, política constitucional ni autorización de efectos. | Requiere resolución canónica de P01-A/P01-G; no se presume satisfecho. |
| Invocación de bootstrap | Criterio propuesto: ser una operación explícita y separada del commit normal; no continuar en la misma invocación hacia admisión, PREPARED, dispatch, reparación, reconciliación ni mutaciones de dominio. El alcance exacto del aislamiento sigue pendiente por P01-B/B2. | No demostrado end-to-end; P01-B abierto; propuesta no ratificada. |
| Escritores cooperativos | Enumerar los entrypoints/procesos que comparten y respetan el mismo protocolo de coordinación. La coordinación cooperativa solo cubre a los participantes demostrados. | Parcial; no equivale a cobertura completa. |
| Escritores no cooperativos | Identificar todos los procesos o entrypoints que pueden escribir el destino sin respetar ese protocolo. Para cada uno, demostrar que no puede escribir durante la ventana de bootstrap o bloquear la operación si no puede demostrarse. | UNKNOWN; exclusión no demostrada. |
| Procesos previos, legacy o supervisores | Identificar procesos que puedan continuar, reanudarse o relanzarse y que tengan capacidad de escritura directa o indirecta sobre el objeto. Excluir una ruta del alcance de M0 no demuestra que el proceso esté detenido. | UNKNOWN; no hay evidencia de barrera de entorno. |
| Otros consumidores del path | Identificar aliases, rutas alternativas, invocaciones directas, procesos hijos y consumidores que puedan llegar al mismo objeto. No inferir exhaustividad desde el inventario estático existente. | P01-H pendiente; no reabrir el censo completo salvo discrepancia concreta. |
| Estado previo | Distinguir ausencia real de objeto existente válido, inválido/corrupto, ilegible, inaccesible y resultado de inspección indeterminado. Cualquier objeto existente debe preservarse; error de lectura/permisos/I/O no equivale a ausencia. | Requisito documental claro; no verificado end-to-end. |
| Publicación concurrente | Demostrar la propiedad de no sobrescritura ante la competencia relevante, incluyendo escritores fuera del lock cooperativo si están dentro del modelo de amenaza. Un lock cooperativo por sí solo no satisface esta condición. | UNKNOWN; no elegir aquí una primitiva técnica. |
| Resultado indeterminado | Si no puede saberse si la publicación ocurrió, conservar `UNKNOWN / STOP`, no afirmar ausencia de mutación y no reintentar automáticamente. | Requisito de diseño; integración/reconciliación no demostrada. |
| Autoridad | Usar solo la frontera canónica cuando su contrato cubra expresamente esta operación y su reconocimiento independiente esté demostrado. Ausencia, caller, lock, path o snapshot no constituyen autoridad. No crear una autoridad paralela. Ningún PASS documental u operacional, prueba satisfactoria, evidencia de exclusión, persistencia confirmada, éxito de filesystem ni permiso técnico para intentar la operación constituye por sí mismo autoridad legítima para crear Continuity o ejecutar efectos protegidos. | P01-G PENDING/UNKNOWN. |
| Trazabilidad | Vincular cada comprobación a evidencia observable, objeto/path efectivo, entorno concreto, contrato y SHA exactos; separar análisis estático, prueba dinámica y evidencia operacional. | P01-H NOT RUN / NOT VERIFIED para el contrato final. |

## 3. Precondiciones de entrada que el entorno real debe demostrar

Todas son obligatorias. Esta lista define qué debe probarse; no afirma que ya exista una herramienta o mecanismo para hacerlo.

1. **Entorno identificado:** registrar la instancia/dispositivo o entorno de ejecución concreto, sistema de archivos relevante, identidad de la invocación y configuración efectiva que determina el destino. Si el entorno no puede identificarse sin ambigüedad: `STOP / UNKNOWN`.
2. **Destino fijado para esta invocación:** obtener el `filePath` efectivo y demostrar que la evidencia corresponde al mismo objeto que usaría la publicación. No sustituirlo por un nombre de ruta propuesto.
3. **Inventario acotado de capacidad de escritura:** usar los inventarios ya existentes para identificar qué procesos y rutas pueden escribir el destino, incluidos procesos previos/legacy, cargas dinámicas, reexports y procesos hijos relevantes. Registrar las aristas concretas no resueltas; no declarar que una clase no existe por no aparecer en una búsqueda.
4. **Exclusión efectiva durante la ventana crítica:** demostrar que cada escritor capaz de modificar el destino está cubierto por la coordinación contractual o impedido de escribir durante toda la operación. Si un escritor relevante no puede identificarse, detenerse. El contrato no prescribe todavía cómo obtener esa propiedad.
5. **No reanudación:** demostrar que los escritores excluidos no pueden continuar o reanudarse durante la ventana, incluso por supervisor o proceso hijo. Una observación puntual de “no está ejecutándose” no basta si puede volver a ejecutarse.
6. **Clasificación fiable del estado:** demostrar que la comprobación distingue ausencia de errores y de cualquier objeto existente. Un resultado ambiguo no habilita creación.
7. **No sobrescritura:** demostrar que la publicación no reemplaza un objeto que otro escritor haya creado o cambiado en la ventana relevante. No usar la mera comprobación previa de ausencia como prueba de exclusión.
8. **Aislamiento de operación — P01-B/B2 pendiente:** el aislamiento descrito es un criterio propuesto, no una decisión de alcance ratificada. El propietario eligió C — no seleccionar todavía — en el Registro D0–D3 §10.6. No se seleccionan A ni B. Mientras P01-B siga abierto, esta precondición no puede marcarse satisfecha, el contrato no puede congelarse y la primera creación permanece STOP. No se infiere permiso para continuar hacia operaciones protegidas.
9. **Autoridad y semántica del objeto:** resolver P01-A/P01-G por contrato canónico aplicable. Si el store no puede clasificarse y limitarse sin inferir autoridad, no publicar.
10. **Evidencia vinculada:** guardar el resultado de cada comprobación junto con el entorno, destino, instante/ventana pertinente y SHA de contrato/código. La evidencia debe poder relacionarse sin ambigüedad con la operación evaluada.
11. **Fallos cerrados:** definir antes de cualquier ejecución autorizada qué sucede si una comprobación falla, expira, no es observable o pierde validez durante la operación. La respuesta es detenerse; no degradar silenciosamente a un modo más permisivo.
12. **Vigencia durante la operación:** demostrar que las condiciones críticas se mantienen desde la comprobación previa hasta la conclusión de la publicación y la inspección final definida en §5, antes de dar por terminada la ventana de exclusión. Si no puede demostrarse continuidad de la condición, el resultado no se trata como PASS.

## 4. Evidencia mínima que debe acompañar una futura evaluación

Para cada precondición, el paquete de evidencia debe identificar:

- la afirmación exacta que se evalúa;
- el modelo de amenaza aplicable y su identificador/revisión, o `UNKNOWN / NO RATIFICADO` si no existe uno aceptado;
- las clases de escritores incluidas, cómo se identificaron y la evidencia que cubre cada clase;
- cada clase excluida, la decisión que permite excluirla y su justificación; la ausencia en un inventario no demuestra que una clase no exista;
- los eventos observables que delimitan el inicio y fin de la ventana relevante y la evidencia de vigencia durante todo el intervalo;
- actores, rutas, aliases, procesos o capacidades no resueltos; si podrían escribir el objeto y no se puede determinar su relevancia, resultado `UNKNOWN / STOP`.
- el objeto/path efectivo y entorno concreto;
- la fuente observable que la sustenta y el método de comprobación;
- el código/contrato exacto evaluado mediante SHA;
- el intervalo temporal o condición de vigencia que cubre;
- el resultado: demostrado, fallido o desconocido;
- la evidencia observable que sustenta la frontera de control del entorno y la exclusión/no reanudación de cada clase relevante;
- limitaciones, procesos/rutas sin resolver y posibles causas de invalidación.

No basta con una lista declarativa de procesos “permitidos”, un lock presente, una comprobación estática, una ejecución sintética de dos participantes cooperativos, un test no ejecutado o un CI de otro SHA. Ninguno de esos elementos, aislado, demuestra exclusión efectiva del entorno real.

## 5. Reglas de decisión

- **Revisión documental limitada:** solo puede afirmarse que el texto está documentalmente consistente en el alcance establecido si identifica las precondiciones y evidencia requeridas y no contiene contradicciones documentales materiales sin resolver. Esto es una evaluación de calidad del texto, no un PASS de P01, no una precondición satisfecha y no una autorización. No implica que el entorno real esté identificado ni que P01-A, P01-B o P01-G estén cerrados. Los puntos dependientes de decisiones abiertas deben etiquetarse como pendientes. El contrato no puede declararse congelado mientras esas decisiones sigan abiertas o no ratificadas.
- **Resultado operacional futuro:** solo podrá afirmarse con evidencia real autorizada y vinculada al entorno/path/SHA exactos. Este borrador no produce tal resultado. Ningún resultado documental u operacional sustituye la autoridad legítima ni el permiso separado de ejecución.
- **Separación de resultados:** conservar independientes (a) resultado de negocio/persistencia, (b) resultado relativo al fin de la exclusión y, cuando aplique, release del lock, y (c) readmisión. Solo se clasifica como «fallo demostrado antes de cualquier escritura» si la evidencia demuestra que no ocurrió escritura. Si la publicación pudo comenzar, una condición perdió vigencia durante ella o el resultado final es incierto, persistencia=`UNKNOWN`; no inferir ausencia de mutación ni reintentar automáticamente.
- **Persistencia confirmada:** solo podrá clasificarse como confirmada cuando, después de la publicación y antes de dar por terminada la ventana de exclusión, una inspección observable y vinculada al entorno, destino y SHA evaluados permita clasificar el destino como el objeto previsto por el contrato aplicable. La evidencia debe identificar qué se inspeccionó y qué predicado contractual se comprobó. Si la inspección falta, es ambigua, no corresponde al mismo destino/operación o no permite determinar que el objeto previsto quedó publicado, persistencia permanece `UNKNOWN`. La inspección final no sustituye la demostración de exclusión durante toda la operación ni prueba por sí sola que un escritor no cooperativo no interfirió. No se prescribe una primitiva, hash, inode ni mecanismo concreto.
- **Fin de la exclusión y release:** “fin de la exclusión” designa el evento observable definido por el contrato final para el entorno elegido que termina la ventana en que los escritores relevantes deben permanecer excluidos; no presupone lock, archivo, token o primitiva específica. Si el mecanismo elegido usa un lock, su release se registra por separado conforme a P-05. No se equiparan automáticamente ambos conceptos.
- **Readmisión, release y limpieza inciertos:** P-05 sigue siendo propuesta no ratificada. Mientras no exista un protocolo aprobado aplicable, readmisión permanece `BLOCKED/UNKNOWN`; no se infiere readmisión ni retry automático de negocio por la sola ausencia de una ruta/lock. La incertidumbre de release y la de limpieza se registran sin tratarlas como el mismo evento ni asignarles efectos de recuperación no aprobados. La incertidumbre de release/limpieza no cambia retrospectivamente el resultado de persistencia.
- **STOP / UNKNOWN:** cualquier escritor relevante desconocido, precondición no demostrada, evidencia ambigua/desfasada, objeto cambiado, posible reanudación, error de inspección o pérdida de vigencia.
- **No sobrescritura:** si el destino existe, es inválido o no puede clasificarse, no se reemplaza como parte del bootstrap. Si existe y puede clasificarse como válido, el bootstrap de primera creación no lo reemplaza ni reescribe; no se inventa aquí un estado de runtime para ese caso y, si no puede determinarse el resultado permitido por el contrato/API canónica, se conserva `UNKNOWN / STOP`.
- **Sin retry automático:** un resultado indeterminado no autoriza repetir la publicación; requiere la vía de reconciliación que se defina y autorice por separado.

## 6. Límites de este borrador y brechas que siguen abiertas

Este documento hace explícito el criterio de aceptación documental, pero **no define un entorno real**, no demuestra precondiciones, no ratifica la propuesta técnica ni el protocolo D3, y no elige mecanismo de filesystem, lock, aislamiento, supervisor o quiescencia.

Persisten, como mínimo:

- P01-A: contrato final de finalidad/no autoridad del objeto.
- P01-B: aislamiento end-to-end de la invocación.
- P01-C: procedimiento y no reanudación/quiescencia verificable.
- P01-D: exclusión y no sobrescritura para todas las clases relevantes.
- P01-E: clasificación end-to-end de estado previo.
- P01-F: resultado indeterminado y reconciliación autorizada.
- P01-G: autoridad canónica aplicable a la creación.
- P01-H: pruebas/evidencia ligadas al SHA exacto, tras congelación contractual y autorización separada.
- Modelo de amenaza aplicable y partición aceptada de clases de escritores incluidas/excluidas, junto con el tipo de evidencia observable que demostraría la frontera de control del entorno y la exclusión/no reanudación de cada clase relevante. Si el modelo no está identificado/aceptado o una clase capaz de escribir no puede clasificarse, el resultado permanece `UNKNOWN / STOP`.

No se repite el inventario general ni se vuelve a abrir STEP 7, Chronicle/PB-08 o la investigación histórica. Si una fuente existente contradice este borrador, registrar solo la discrepancia concreta y resolverla contra la fuente canónica.

## 7. Estado y siguiente paso

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`; no se cierra ningún subcriterio por este borrador.
- P01-B: `C — NO SELECCIONAR TODAVÍA`.
- P-05: `NO RATIFICADA`.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Raíz legítima: `PENDING / UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación de Continuity y efectos protegidos: `STOP`.
- Runtime/tests/workflows/configuración ejecutable/dispositivo: sin cambios.
- Tests/CI/Actions: no ejecutados.

**Siguiente paso documental:** reconciliar este contrato con la decisión del propietario y los apartados aplicables de la matriz P-01; resolver únicamente contradicciones concretas y actualizar la matriz con el estado de cada precondición. No declarar el entorno “definido” en sentido operacional hasta que el entorno real se identifique y exista evidencia autorizada. Cualquier implementación o prueba dinámica requiere autorización separada y explícita.


## 8. Reutilización del intake de entorno ya existente — sin repetir preguntas contestadas

El perfil D3 existente ya registra que el primer entorno de prototipo previsto es el **POCO X7 Pro con Android**, y que una futura PC no debe asumirse disponible ni asignársele una configuración todavía desconocida. Este dato se reutiliza; no se vuelve a preguntar qué plataforma se pretende usar para el prototipo.

**Límite importante:** conocer la plataforma del prototipo no demuestra que la primera publicación de Continuity de NCS M0 vaya a ejecutarse en ese dispositivo, ni determina el modo real de lanzamiento, la capacidad para impedir relanzamientos o la evidencia de exclusión. Por tanto, no se presenta ese dato como entorno objetivo de bootstrap ya identificado.

Para el entorno concreto de esta operación, las únicas lagunas de intake inmediato que permanecen son las ya enumeradas en el perfil D3:

- **E1, solo la parte pendiente:** confirmar si esta operación de bootstrap M0 se refiere al prototipo del POCO/Android o a otro entorno concreto; no repetir la elección general de plataforma del prototipo.
- **E2:** quién o qué tiene control verificable para detener todos los escritores/launchers relevantes e impedir su reinicio durante la ventana.
- **E3:** modo real de lanzamiento y procesos, wrappers, supervisores o consumidores capaces de escribir/relanzar; lo no conocido permanece desconocido.
- **E4:** solo después de fijar el entorno y lanzamiento, identificar las propiedades relevantes del almacenamiento y posibles escritores externos.

No se exige resolver ahora todo E1–E6 ni compartir rutas privadas, secretos o credenciales. Si E2/E3 no se pueden establecer, el contrato no debe rellenar la brecha con un mecanismo supuesto: P01-C/P01-D siguen `UNKNOWN` y la publicación sigue `STOP`.


## 9. Reconciliación con la aprobación expresa de la regla provisional (2026-10-28)

El propietario aprobó la regla provisional de primera creación. La aprobación queda registrada en `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md` §10.7 y en `NCS_M0_P01_FIRST_CREATION_AUTHORITY_RULE_GAP_2026-10-27.md` §13.

**Efecto sobre este candidato:** la regla normativa de no inferir permiso por ausencia, código existente o éxito técnico, y de mantener STOP/UNKNOWN cuando falte evidencia, está aprobada. Esta aprobación no ratifica este contrato consolidado en su totalidad, no selecciona un mecanismo de filesystem ni declara demostrado el entorno restringido. Este archivo conserva su estado de candidato documental.

**Precondiciones todavía no satisfechas:**

- E1 parcial: identificar si esta operación concreta de bootstrap M0 se ejecutaría en el POCO X7 Pro/Android u otro entorno. El dispositivo previsto para el prototipo no demuestra que sea el entorno de esta operación.
- E2: evidencia de quién/qué puede detener todos los escritores y launchers relevantes e impedir que se reinicien durante la ventana de exclusión.
- E3: modo efectivo de lanzamiento y lista verificable de procesos, wrappers, supervisores y consumidores capaces de escribir o relanzar. Los actores no identificados permanecen UNKNOWN.
- E4, solo después de E1–E3: propiedades relevantes del almacenamiento efectivo y posibles escritores externos, sin presumir garantías de exclusión.
- Enlace de evidencia al objeto/ruta efectivos y al SHA exacto evaluado; inspección estática sola no prueba exclusión operacional.

No se deben pedir de nuevo datos generales ya registrados sobre la plataforma del prototipo. La siguiente pregunta de intake se limita a esta operación concreta: **¿el bootstrap M0 de Continuity se pretende ejecutar en el POCO X7 Pro/Android, o en otro entorno?** La respuesta solo identifica el objetivo; no demuestra E2/E3 ni autoriza ejecución. Si no se puede responder o verificar, mantener STOP/UNKNOWN.

Gates intactos: alcance U; P01-A OPEN/UNKNOWN; P01-B C — NO SELECCIONAR TODAVÍA; P-05 NO RATIFICADA; D0/D1/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; raíz PENDING/UNKNOWN; authorization NOT_EVALUATED; primera creación y efectos protegidos STOP; M0 INCOMPLETO. No runtime/tests/workflows/configuración ejecutable modificados; no pruebas/CI/Actions ejecutados.


## 10. E1 resuelto como identificación de objetivo, no como prueba operacional (2026-10-28)

El propietario confirmó expresamente: **para la operación específica de primera creación de Continuity, el entorno previsto es el POCO X7 Pro con Android**.

Alcance exacto de la respuesta:
- **E1 — objetivo previsto: IDENTIFICADO** como POCO X7 Pro / Android.
- Esta respuesta no demuestra que el entorno esté configurado o aislado, que el dispositivo sea exclusivo, que todos los escritores/launchers estén controlados, ni que la primera creación tenga autoridad legítima.
- No resuelve E2 (control verificable de detención y prevención de reinicio), E3 (modo real de lanzamiento y escritores/launchers verificables) ni E4 (almacenamiento y escritores externos).
- No ratifica este contrato, no autoriza implementación o pruebas dinámicas y no cambia ningún gate canónico.

Siguiente requisito: establecer E2/E3 mediante evidencia del entorno real previsto. Reutilizar el protocolo D3 existente solo como criterio de evidencia; no duplicarlo ni afirmar que está ejecutado. Si el control de lanzamiento o la cobertura de escritores no se pueden verificar, mantener `UNKNOWN / STOP`.

Estado canónico intacto: M0 `INCOMPLETO`; alcance U; P01-A `OPEN / UNKNOWN`; P01-B `C — NO SELECCIONAR TODAVÍA`; P-05 `NO RATIFICADA`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz `PENDING / UNKNOWN`; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos `STOP`. Solo documentación; sin cambios ejecutables ni pruebas/CI/Actions.
