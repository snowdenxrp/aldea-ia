# NCS M0 — P07 V2.3: delta de trazabilidad y protocolo de evidencia

Fecha: 2026-11-03  
Base: documento de trazabilidad V2.2 en rama `ncs-p07-v2-2-documentary-proposal-2026-11-03`.  
Normativa: `NCS_M0_D2_P07_V2_3_NORMATIVE_DELTA_2026-11-03.md`.  
Oráculos: `NCS_M0_D2_P07_V2_3_SCENARIO_ORACLE_DELTA_2026-11-03.md`.

Estado: **DELTA DOCUMENTAL — NO RATIFICADO — NO EJECUTADO — NO AUTORIZA PRUEBAS EN DISPOSITIVO**.

## 1. Procedencia y límites de revisión

### 1.1 Artefactos V2.2 inspeccionados independientemente

Se recuperaron desde GitHub en la rama V2.2 y se verificaron los blob SHA devueltos por GitHub:

| Documento V2.2 | Blob SHA |
|---|---|
| `NCS_M0_D2_P07_V2_2_NORMATIVE_CORRECTION_2026-11-03.md` | `7ce10f7e02516da4438358c3d637a275001c6019` |
| `NCS_M0_D2_P07_V2_2_SCENARIO_MATRIX_AND_TEST_ORACLES_2026-11-03.md` | `26404e70d39b3fd29ecfe56e0965917d973bac68` |
| `NCS_M0_D2_P07_V2_2_TRACEABILITY_PLATFORM_AND_EVIDENCE_PROTOCOL_2026-11-03.md` | `22e8d63f725f3e304bc4ff392f6459afa941f695` |

Esta verificación acredita qué contenido se inspeccionó en esta revisión documental. No acredita ejecución, validez de los mecanismos, ni ratificación del contrato.

### 1.2 Revisión independiente

La revisión independiente de V2.2 identificó estas correcciones:
- P07-16: riesgo de contabilizar detección/fail-closed como PASS_GATE.
- Varios escenarios con actor B sin oráculo explícito por clase.
- P07-03/04/06/07: clasificación de resultado no uniforme.
- P07-01: hardlink de archivo confundible con alias de raíz.
- P07-16: identidad del objeto raíz y continuidad del nombre no separadas.
- P07-18: fixtures de rename sin requisitos explícitos de mismo filesystem/tipos compatibles.
- P07-04: ownership filesystem y owner record de aplicación no separados.
- P07-21: oráculo nlink/n1/n2 ambiguo.
- P07-19: temporal de producto y temporal interno de librería necesitan atribución separada.

Estos puntos se incorporan como correcciones documentales, no como hallazgos de runtime.

### 1.3 Respuesta de Qwen: no auditó V2.2

Qwen declaró expresamente que no tenía acceso al repositorio, rama ni contenido íntegro de V2.2 y que no podía verificar sus SHA. Por ello:
- su respuesta se clasifica como **AUDIT_NOT_PERFORMED / EVIDENCE_ACCESS_BLOCKED**;
- `DOCUMENTARY_NOT_VALID` se interpreta solo como “no validado por ese revisor”, no como juicio técnico adverso del texto V2.2;
- no se registra como auditoría técnica de V2.2;
- no se atribuye a Qwen confirmación ni refutación de los hallazgos V2.3;
- no se infiere que V2.2 esté corregido por el mero cambio de versión.

No sumar esa respuesta al número de revisiones técnicas completas.

### 1.4 Recuentos de hallazgos Claude

V2.2 contenía un resumen numérico de hallazgos Claude (“4 H1–H14 confirmados y 10 confirmados con matices”). V2.3 no conserva ese recuento como hecho verificado porque el resumen disponible no basta para reconciliarlo con cada H1…H14 y su clasificación original. La trazabilidad debe enumerar los hallazgos por ID y conservar su estado exacto desde el informe fuente antes de publicar totales. No inventar ni normalizar el conteo.

## 2. Matriz delta de trazabilidad

| Corrección | Escenario | Propiedad | Evidencia mínima futura | Dependencia |
|---|---|---|---|---|
| D23-01 detección ≠ prevención | P07-05/06/16/18b/19/21 | P07-C | seam interno, resultado de cleanup, centinela y claim explícito | P05-C, P09, R1 |
| D23-02 actor B por clase | P07-02/04/05/06/07/08/09/11/12/13/14/15/16/17/18a/18b/19/21/22 | P07-C/E y A/B/D según caso | clase fijada antes de ejecutar, subcasos separados, evidencia de admisión | R1, P09 |
| D23-03 taxonomía resultado | P07-03/04/06/07 y todos | A…E | tres campos independientes con combinación válida | contrato V2.3 |
| D23-04 aliases raíz/archivo | P07-01/21 | P07-A/C | resolución root/mount vs n1/n2 hardlink | decisión propietario P07-A |
| D23-05 objeto/nombre raíz | P07-16 | P07-A/C | fd/dirfd, path, namespace, RT-A/RT-B, root_claim | P01/P02, P07-A |
| D23-06 rename fixture | P07-18a/b | P07-C/D | filesystem común, tipos, destino, timeline | target fingerprint |
| D23-07 ownership por capa | P07-04 | P07-B/C | UID/GID/mode/ACL vs APP-OWNER fixtures | P03/P04, P05 |
| D23-08 nlink por nombre/objeto | P07-21 | P07-A/C | n1/n2/fd/hash/nlink antes/después | FS target |
| D23-09 temporal y cleanup owner | P07-19 | P07-C/D | versión exacta Node/libuv, función, syscall, seam | target runtime |
| D23-10 trazabilidad Claude | §1.4 | procedencia | IDs fuente reconciliados; no total sin evidencia | informe original |

## 3. Campos mínimos del registro por ejecución

Además de V2.2, exigir:
- `actor_B_class` antes de iniciar el subcaso;
- `root_claim` para escenarios de raíz;
- `result_class` única y `NONE` para no positivos;
- `product_state` separado del harness;
- source/destination filesystem y tipo para rename;
- FS-OWNER y APP-OWNER como capas independientes;
- n1/n2/fd/hash/nlink como observaciones distintas;
- temporal exacto y cleanup owner en P07-19;
- causa de cada UNKNOWN/BLOCKED/INVALID;
- evidencia de que la intercalación/seam se alcanzó realmente.

## 4. Niveles de evidencia: aclaración

Mantener las clases V2.2:
DOCUMENTARY, STATIC_SOURCE, RUNTIME_API, SYSCALL_TRACE, CONTROLLED_EXERCISE, TARGET_FINGERPRINTED, CI_VERIFIED y PRODUCT_EXERCISED.

No confundir:
- SHA/blob verificado con contenido revisado;
- contenido revisado con documento ratificado;
- documento ratificado con mecanismo implementado;
- test del harness con ruta real del producto;
- detección/STOP con prevención;
- fingerprint con ausencia de writers;
- process crash con power-loss durability.

La evidencia de `PASS_GATE` requiere todas las capas aplicables; una sola clase de evidencia no sustituye dependencias.

## 5. Gates y dependencias

| Gate | Estado |
|---|---|
| Ratificación V2.3 | NO RATIFICADA |
| P07 general | OPEN |
| P07-A | OPEN / decisión de aliases pendiente |
| P07-B | OPEN / evidencia de target pendiente |
| P07-C | UNKNOWN / BLOCKING |
| P07-D | OPEN / claims limitados |
| P07-E | OPEN / R1 no ratificado |
| P05-C | OPEN / NOT RATIFIED |
| P09 | OPEN / UNKNOWN |
| R1 | OPEN / NO RATIFICADO |
| Mecanismo seleccionado | NINGUNO |
| Harness implementado | NO |
| Pruebas ejecutadas | NINGUNA |
| authorization | NOT_EVALUATED |
| Raíz constitucional | PENDING / UNKNOWN |
| Commissioning / efectos protegidos | STOP |
| NCS M0 | INCOMPLETO |

## 6. No ejecución

La elaboración de V2.3 se limita a documentación. No se han ejecutado:
- tests Node/npm;
- CI o workflows;
- comandos Termux/POCO;
- syscalls o experimentos filesystem;
- bootstrap/publicación;
- lectura/escritura del objeto real de Continuity;
- cambios de runtime, tests o configuración;
- cambios a PR #110.

La rama V2.3 no autoriza ninguna de esas acciones.

## 7. Criterio de revisión siguiente

La revisión siguiente debe recibir los tres documentos V2.2 y los tres deltas V2.3, o el contenido consolidado equivalente. Debe evaluar específicamente:
1. que cada override tenga precedencia inequívoca;
2. que no haya escenarios con actor B sin clase;
3. que ninguna detección/retención se eleve a PASS_GATE;
4. que R-OBJ y R-NAME estén separados en P07-16;
5. que rename y hardlink tengan fixtures/oráculos válidos;
6. que las dependencias P05/P09/P01/P02/R1 permanezcan abiertas donde corresponde.

La revisión es documental y de solo lectura. No solicitar ejecución ni ratificación de autoridad.
