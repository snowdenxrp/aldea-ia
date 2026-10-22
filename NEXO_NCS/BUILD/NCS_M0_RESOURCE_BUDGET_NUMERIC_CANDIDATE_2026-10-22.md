# NCS M0 — candidato numérico inicial para presupuesto de recursos
Fecha: 2026-10-22
Estado: **PERFIL NUMÉRICO ACEPTADO COMO BASE; IMPLEMENTACIÓN/VALIDACIÓN EN CURSO**

Decisión del propietario: `NEXO_NCS/DECISIONS/NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md`. Los números son límites operativos iniciales aceptados como base, no capacidades medidas ni garantías de rendimiento.

## 1. Decisión registrada

El propietario acepta este perfil conservador como base de implementación para la instancia local de Nexo bajo Opción A. Los números son topes operativos iniciales, no capacidades medidas del dispositivo ni garantías de rendimiento. Deben verificarse con fixtures representativos antes de cerrar el subcriterio.

Este documento no modifica la decisión de alcance inicial, no aprueba la Constitución, no establece autoridad raíz y no habilita efectos protegidos.

## 2. Perfil candidato

| Recurso | Máximo candidato | Aplicación |
|---|---:|---|
| Contenido crudo de `--content-stdin` | 256 KiB | Bytes del flujo antes de decodificar y acumular todo el contenido |
| Contenido de una entrada Chronicle | 256 KiB | Bytes UTF-8 del campo content, validado también en el caso de uso |
| Entradas Chronicle | 10,000 | Cantidad de entradas después del append candidato |
| Documento Chronicle serializado | 32 MiB | Bytes exactos de la representación persistida, incluidos delimitadores/newline que formen parte del formato |
| Colección `missions` de Continuity | 10,000 elementos | Cardinalidad del snapshot candidato |
| Colección `attempts` de Continuity | 20,000 elementos | Cardinalidad del snapshot candidato |
| Colección `doNotRepeat` de Continuity | 20,000 elementos | Cardinalidad del snapshot candidato |
| Colección `executions` de Continuity | 10,000 elementos | Cardinalidad del snapshot candidato |
| Colección `effectJournal` de Continuity | 20,000 elementos | Cardinalidad del snapshot candidato |
| Envelope/snapshot Continuity serializado | 16 MiB | Bytes exactos antes de persistir |
| Presupuesto combinado de persistencia | Sin límite agregado inicial | Se proponen límites independientes por store; revisar si la ejecución pasa a ser servicio persistente o multiusuario |

`KiB` y `MiB` se interpretan en base binaria: 1 KiB = 1,024 bytes; 1 MiB = 1,048,576 bytes.

## 3. Justificación y límites de la recomendación

- El límite de 256 KiB de entrada acota el coste de lectura/decodificación y mantiene el contenido individual muy por debajo del presupuesto máximo de Chronicle.
- El máximo de 32 MiB de Chronicle y 16 MiB de Continuity limita el tamaño de cada documento completo que el store puede tener que leer, serializar y escribir como unidad.
- Los topes de cardinalidad limitan estructuras con muchos elementos pequeños; los topes de bytes cubren elementos grandes. Ambos son necesarios.
- El máximo de entradas es deliberadamente más amplio que un registro de prueba, pero no debe interpretarse como capacidad probada: el límite total de bytes suele alcanzarse antes.
- Los límites son de integridad y consumo acotado, no de retención histórica ilimitada. Al alcanzarlos, la propuesta inicial rechaza nuevas escrituras y conserva el estado existente.
- No se propone rotación, compactación, borrado automático ni purga del journal. Cualquiera de esos mecanismos requiere política de retención, trazabilidad y recuperación separada.
- No se ha medido todavía latencia, consumo máximo de heap ni comportamiento en condiciones de memoria baja. Antes de aceptar, los tests deben demostrar límites de bytes y ausencia de mutación; una prueba de rendimiento puede ajustar los topes sin cambiar su semántica.

## 4. Semántica obligatoria

1. Los límites son inclusivos: se acepta exactamente el máximo; se rechaza cualquier valor superior.
2. Las medidas de texto se hacen en bytes UTF-8, no en unidades UTF-16 ni en número de caracteres.
3. La validación ocurre antes de admisión de misión y antes de `writeDocument`/`writeEnvelope`.
4. El lector stdin deja de acumular en cuanto puede demostrar que el máximo se ha superado.
5. Un rechazo por límite previo a escritura produce cero mutaciones y no crea stores/locks/directorios como efecto lateral evitable.
6. Los fallos posteriores al inicio de escritura conservan los resultados de conflicto/UNKNOWN existentes; no se clasifican retroactivamente como exceso de límite.
7. Nunca se truncan datos, nunca se declara completitud si hubo truncamiento y nunca se elimina información histórica automáticamente.
8. Se reutilizan los estados de resultado existentes. El código público específico se elige después de inventariar los códigos actuales; no se crea una familia paralela de outcomes.

## 5. Gates antes de cerrar la implementación

- [x] Ejecutar tests con contenido ASCII y multibyte en 256 KiB − 1 byte, exactamente 256 KiB y 256 KiB + 1 byte.
- [x] Crear fixtures Chronicle representativos para límites de cantidad y serialización; confirmar que el presupuesto de 32 MiB se mide sobre los bytes realmente escritos.
- [x] Crear fixtures de helper para cada cardinalidad y el límite serializado de Continuity; falta probar rechazo de snapshot válido sobre límite dentro del store.
- [x] Comprobar preservación de bytes en rechazos Chronicle y preservación del tamaño del archivo Continuity sobredimensionado; falta una prueba de rechazo de commit de Continuity con snapshot válido.
- [ ] Chronicle: probado con dos appends concurrentes cerca del límite. Continuity: falta la prueba concurrente equivalente cerca de su frontera.
- [x] Confirmar que las pruebas actuales de conflicto, escritura ambigua y UNKNOWN siguen pasando.
- [x] Ejecutar workflows en SHA exacto y registrar run/job/SHA en `NEXO_NCS/STATUS.md`.
- [ ] Si los fixtures o pruebas de rendimiento muestran que los topes son inadecuados, ajustar el perfil aceptado mediante una decisión explícita; no ocultar cambios en una constante.

## 6. Estado

- Perfil numérico: **ACEPTADO COMO BASE**.
- Implementación: **INICIAL IMPLEMENTADA; VALIDACIÓN PARCIAL**.
- Subcriterio de presupuesto: **PENDING**.
- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.


## Cross-check with prior aggregate-budget research

The earlier research `docs/nexo/NEXO_SCOPE_ENVELOPE_CARDINALITY_FANOUT_AGGREGATE_SAFETY_RESEARCH_V1_2026-09-24.md` establishes that individual limits do not prove aggregate safety, that count differs from resource cost, and that capacity relevant to safety must not be overcommitted under concurrent admissions.

That research concerns broader ScopeEnvelope/effect budgets and must not be re-run or collapsed into this local-persistence task. Its principle does, however, constrain interpretation of this candidate:

- The per-store maxima here are **local document bounds only**; they do not prove a combined disk budget, peak heap bound, throughput bound, or global Nexo resource budget.
- The table's “no combined budget” entry means only that no aggregate limit is proposed for this first local persistence slice; it must not be interpreted as proof that aggregate use is safe or unbounded by design.
- Before Nexo gains concurrent/multi-session service operation or broader effect admission, aggregate capacity and serialized admission/reservation must be designed from a concrete capacity model. Do not add a fake reservation layer to the current local store.
- For this slice, test that each store enforces its own bound and explicitly retain combined storage/peak-heap capacity as a separate **OPEN** question.

No numeric aggregate quota is added because there is no measured capacity baseline or accepted allocation policy. This is an explicit uncertainty, not an implicit pass.

## Validación de lectura del estado previo — requisito añadido

El máximo de documento completo debe proteger ambos sentidos del ciclo de persistencia: **lectura/parseo del documento actual y escritura del candidato**. En el código revisado, Chronicle y Continuity cargan el archivo completo como texto y llaman a `JSON.parse` sin comprobar primero los bytes crudos. En consecuencia, un máximo aplicado solo antes de `writeDocument`/`writeEnvelope` no protege frente a un archivo existente que ya sea excesivo.

Antes de aceptar el perfil, añadir pruebas para Chronicle y Continuity que carguen un archivo preexistente por encima del máximo y demuestren rechazo fail-closed, sin parseo completo, sin admisión ni escritura y con bytes/revisión preservados. La medición debe hacerse sobre bytes crudos antes de materializar el texto completo; no basta con `raw.length` después de `readFile(..., "utf8")`.

Este requisito no cambia los topes aceptados como base. La implementación y validación de lectura acotada siguen sujetas a evidencia del SHA exacto.

## Aclaración de implementación para lectura acotada

No basta con cargar el documento entero en un `Buffer` y medir su longitud: el consumo máximo ya ocurrió. El store debe leer de forma acotada, contar bytes crudos durante la lectura y detenerse al detectar más que el máximo, antes de decodificar y parsear. `stat` puede anticipar un rechazo pero no es el control definitivo, ya que no evita carreras entre la inspección y la lectura. Los tests deben probar límite de bytes consumidos, cancelación, ausencia de `JSON.parse` al exceder y preservación de bytes/revisión.

Los valores numéricos están **ACEPTADOS COMO BASE**; la implementación y validación siguen pendientes de cierre.
