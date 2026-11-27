# NCS M0 — Crosswalk normativo y de autorización para RAW-1 / B2 / B3

**Fecha:** 2026-11-26  
**Rama:** `ncs-m0-raw1-r1-evidence-criteria-2026-11-26`  
**HEAD base de esta reconciliación:** `cf95a245362d8340f5e2826437ec7e0f6761ef58`  
**Tipo:** reconciliación documental de procedencia, alcance y jerarquía. No crea obligaciones normativas nuevas, no ratifica propuestas y no autoriza ejecución.

## 1. Resultado ejecutivo

Los documentos RAW-1 y B2/B3 creados en esta rama son artefactos de análisis y criterios probatorios no normativos. Deben leerse dentro de la jerarquía y las decisiones siguientes:

1. La Declaración de autorización constitucional V2.1 fue ratificada expresamente el 2026-11-26. Su instrumento exacto es el blob `9ae2fca3972a8b3c688346f26f6f0a267e2454ad`; el registro de ratificación es el blob `7113f04becbd4cbe047cdb53b63b16692881e22a`, en la rama `ncs-m0-authorization-declaration-v2-1-draft-2026-11-27`, commit `7d89f37f14f81c9eb25e051515a91d3e931cd13d`.
2. La rama actual de criterios no desciende de esa rama de ratificación y no contiene el registro V2.1. La relación se conserva por referencia explícita; no se hace merge/cherry-pick automático ni se reescribe el instrumento ratificado.
3. P05-C está ratificada como política de no recuperación automática y conservación de UNKNOWN/BLOCKED ante incertidumbre. No equivale a mecanismo implementado ni a prueba de BLOCKED durable/interproceso.
4. P07 V2.2 sigue siendo la base normativa vigente. P07 V2.3 y el Contrato B del 2026-11-26 siguen siendo propuestas no ratificadas; no se pueden aplicar de facto ni elevar sus detalles a requisitos normativos por esta matriz.
5. El perímetro de activos protegidos para O7/P07 fue ratificado y sí está presente en la línea de trazabilidad de la que deriva esta rama. Nexo y Lúmina permanecen separados.

## 2. Alcance efectivo de V2.1 ratificada

La ratificación V2.1 autoriza trabajo técnico y documental estrictamente necesario para cerrar M0, pero solo sobre contratos, obligaciones y requisitos M0 ratificados. El instrumento incluye investigar/reconciliar, diseñar mecanismos para contratos ratificados, modificar código/tests/workflows cuando sea necesario, ejecutar pruebas locales/CI y preservar evidencia.

Condiciones que no deben omitirse:
- No implementar propuestas normativas no ratificadas ni alterar contratos ratificados.
- Toda modificación de pruebas debe justificarse contra el contrato, preservar la intención, documentar diff/resultado y someterse a revisión/aprobación del propietario o autoridad independiente expresamente designada; el autor no se autoaprueba exclusivamente.
- Un PASS de test no basta por sí solo; CI-VERIFIED exige evidencia CI asociada al SHA exacto.
- P07 V2.2 sigue como base normativa; V2.3 no puede sustituirla, reinterpretarla ni aplicarse de facto antes de ratificación expresa.
- La declaración excluye expresamente cambios del entorno POCO/Termux, PR #110, M1, STEP 7 anticipado, commissioning y efectos protegidos. Mantiene `authorization: NOT_EVALUATED`, commissioning STOP y protected effects STOP.
- El cierre técnico de M0 no concede autorización operativa ni levanta STOP.

La autorización general para trabajo técnico no sustituye una autorización específica que falte para una actividad concreta ni convierte una observación en evidencia si no se cumplen sus condiciones.

## 3. P05-C: política ratificada, enforcement pendiente

La línea STATUS de la rama de trazabilidad registra la decisión expresa del propietario del 2026-11-07:
- cleanup solo sobre objetos cuya atribución a la operación esté demostrada;
- ante incertidumbre, conservar residuo y mantener `UNKNOWN/BLOCKED`;
- nombre, token, PID o antigüedad, por sí solos, nunca justifican cleanup;
- no conceder readmisión cuando falta evidencia suficiente para atribuir el objeto.

Esa decisión es normativa como política P05-C. No demuestra:
- un estado BLOCKED independiente del proceso;
- supervivencia del bloqueo tras crash/terminación;
- descubrimiento por nueva invocación;
- identidad replacement-safe en el cleanup;
- procedimiento de reclasificación aprobado;
- cumplimiento de P05 por el código actual.

Por eso P05-C = RATIFICADA COMO POLÍTICA y P05 = OPEN. B3 es una brecha de enforcement de esa política, no una nueva política que esta rama ratifique.

## 4. P07 y jerarquía de los documentos

- P07 V2.2: base normativa vigente.
- P07 V2.3: propuesta no ratificada. No sustituye V2.2 ni modifica sus criterios vigentes.
- Contrato A/B de O7 y P07-C/P05 del 2026-11-26: propuesta de aceptación/no normativa, no ratificada.
- Matriz O1–O9 reconciliada: los criterios O1–O9 están identificados como ratificados el 2026-11-07; las filas G1/G3/G4/G5 y cualquier expansión posterior no deben presentarse como ratificadas por defecto. G2/C3 representa una decisión ya ratificada del propietario, no una obligación nueva.
- C3: decisión del propietario resuelta; clasificar rol del inode antes de interpretar `nlink`; cualquier cambio de `nlink` de un inode protegido constituye afectación. No reabrirla como decisión pendiente.

Fuentes de referencia en GitHub:
- Contrato A/B propuesto, blob `43f83749350705c1e1cfc698032652b27228acf4`.
- Matriz O1–O9 reconciliada, blob `44559bd80a6872cdc0a6a4621953de0d7facba6b`.
- Definición técnica P05-C (documento histórico cuyo encabezado dice “no ratificada” porque precede la decisión posterior), blob `97e24c03d2c63dbab025a8a9912d788a63d9c125`. Su encabezado histórico no invalida la ratificación posterior de la política registrada en STATUS.
- Reconciliación C3/G2, blob `bf22a8b1f2d319994100d40c0698f1ec8a370cf1`.
- Ratificación del perímetro O7/P07, blob `ddb026275b64027f9fc95aab3861ed0614143c34`.

## 5. Crosswalk de los criterios RAW-1 / B2 / B3

| Artefacto de esta rama | Naturaleza | Relación con la base ratificada | Lo que no puede hacer |
|---|---|---|---|
| RAW-1 R1 effective-path evidence criteria | Protocolo probatorio de observación acotada | Aporta evidencia para la cobertura de actores/capacidades O7 y para distinguir capacidad estática de configuración/runtime | No ratifica Contrato A, no cierra P09/O7, no prueba escritura runtime ni crea obligación de captura universal |
| B2 replacement-safe criteria | Descomposición técnica no normativa | Principalmente O4; también identidad O3 y no-readmisión O5; bajo P07 V2.2 vigente y P05-C | No sustituye P07 V2.2 ni adopta V2.3/Contrato B como norma |
| B3 durable BLOCKED criteria | Descomposición técnica no normativa | O1, O5, O6 y O9c; operacionaliza el gap de enforcement de P05-C | No selecciona mecanismo, no ratifica una solución de cuarentena ni crea procedimiento de recovery |

Los términos B2/B3 se usan como etiquetas técnicas del contrato propuesto del 26-11 y del estado de trabajo; no son una segunda matriz normativa paralela a O1–O9. Los oráculos y estados autoritativos siguen siendo los contratos ratificados y sus obligaciones vigentes.

## 6. Precisión sobre evidencia R1

La especificación RAW-1 describe qué datos permitirían clasificar una invocación concreta sin ejecutar el escritor. No constituye por sí misma permiso para una captura en POCO/Termux. V2.1 excluye modificaciones del entorno operativo del dispositivo y la autorización específica de observación no se debe inferir de una autorización documental.

Si una observación posterior se autoriza expresamente:
- debe ser no mutante y acotada a una invocación R1;
- no se ejecuta el entrypoint si el destino resuelve al perímetro protegido;
- UNSET/default solo permite “NO ALIAS OBSERVED IN THIS INVOCATION”;
- cualquier destino ambiguo permanece UNKNOWN;
- no se repite la captura genérica previa ni el censo P09.

## 7. Estado consolidado

- V2.1: RATIFICADA; su registro vive en rama separada y se referencia aquí sin fusionar.
- P05-C: RATIFICADA COMO POLÍTICA; P05: OPEN.
- P07 V2.2: base normativa vigente.
- P07 V2.3 / Contrato A-B: NO RATIFICADOS.
- Perímetro protegido O7/P07: RATIFICADO.
- C3/G2: decisión semántica resuelta.
- RAW-1: capacidad estática CONFIRMED; alias efectivo R1 UNKNOWN; runtime write NOT OBSERVED.
- B2: gap replacement-safe en seams inspeccionados; mapeado a O4/O3/O5.
- B3: gap durable/interproceso; mapeado a O1/O5/O6/O9c.
- O7 UNKNOWN/OPEN; P09 OPEN/UNKNOWN; P07-C UNKNOWN/BLOCKING; E2/E3 PARTIAL/NOT CLOSED.
- `authorization: NOT_EVALUATED`; commissioning/protected effects STOP; NCS M0 INCOMPLETO.

## 8. Regla de continuación

La siguiente unidad M0 debe actualizar la trazabilidad canónica existente, no duplicar inventarios. Cada afirmación debe vincularse al contrato ratificado, obligación O1–O9, snapshot/blob y clase de evidencia (estática, configuración observada, runtime, test, CI, plataforma). Si la fuente o el gate no está demostrado, conservar UNKNOWN/OPEN.

No iniciar M1, STEP 7, funcionalidades nuevas ni rediseños. No seleccionar primitivas por inferencia. No declarar PASS/CI-VERIFIED sin evidencia vinculada al SHA exacto.
