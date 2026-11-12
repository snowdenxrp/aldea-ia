# NCS M0 — Decisiones y autorizaciones realmente pendientes

**Fecha:** 2026-11-10. **Regla:** aquí solo aparecen decisiones **no tomadas** o autorizaciones **no concedidas**. Nada de lo ya ratificado se pide de nuevo.

## Delta de decisión del propietario — 2026-11-12

**D-A01 — RATIFICADA, opción A (2026-11-12).** El propietario aprueba MED + SUP de ACA-1 exclusivamente como arquitectura conceptual para el claim M0 restringido bajo R1: MED será el único escritor mediado de los stores; los clientes no tendrán acceso directo a los descriptores/archivos de RES; SUP será lanzado manualmente por el propietario en foreground y solo controlará cooperativamente su propio grupo de procesos; la comunicación clientes–MED será por IPC Unix. RAW queda fuera del claim. Los supuestos S-1 (primitivas/descriptor APIs y locks en Termux), S-2 (contención de procesos/señales y ausencia de escape en Android/Termux) y S-3 (fiabilidad del IPC Unix en Termux) permanecen UNKNOWN/no evidenciados. CE-12 (escape/supervivencia de procesos y carreras en `/proc`) y CE-13 (syscalls en vuelo que aterrizan después de la revocación) son límites conocidos, no garantías resueltas. La ratificación no demuestra O1–O9, no cierra P05/P07-C ni P09, no satisface D-RB-04 A ni levanta D-RB-01. No autoriza implementación, pruebas, CI, inspección/operación de dispositivo, commissioning ni efectos protegidos.

**D-A08 — RATIFICADA, opción A.** El propietario autoriza mantener R1 y aceptar un claim de cierre M0 restringido, con exclusiones explícitas; las garantías imposibles I-1–I-7 se contienen por política dentro del alcance declarado. Se rechaza cualquier cambio implícito de modelo (opción B). Esta decisión no autoriza MED/SUP, no selecciona ni realiza el ancla externa monotónica D-RB-04 A, no levanta la moratoria D-RB-01 (RB-1–RB-4 continúan prohibidos y cualquier rollback conocido o sospechado implica STOP/UNKNOWN), no autoriza implementación, pruebas, CI, operaciones de dispositivo ni efectos protegidos. D-RB-04 A sigue siendo requisito ratificado cuya forma y realización permanecen pendientes. La decisión A-08 no convierte ningún gate en PASS ni declara T-02/T-03/M0 completos.


**D-A06 / D-P07A — RATIFICADA, opción A (2026-11-12).** El propietario aprueba el criterio P07-A y el procedimiento REC de re-identificación con estas restricciones: identidad del objeto y nombre/ruta se verifican por separado; los atributos descriptivos no prueban identidad post-restore; si la identidad no es verificable, el objeto permanece bloqueado (`UNKNOWN/STOP`); la re-identificación posterior requiere atestación externa/off-band del propietario registrada fuera del objeto restaurado; no se infieren equivalencias entre aliases sin política aprobada. A-04 (atestación del propietario como raíz de confianza) permanece como decisión separada y pendiente; esta ratificación no la define ni la satisface, no demuestra técnicamente I-3, no realiza D-RB-04 A, no levanta D-RB-01 ni autoriza implementación, REC operativo, pruebas, CI, dispositivo o efectos protegidos.

## 1. Decisiones del propietario pendientes (sin solicitarlas en este documento)

| ID | Decisión | Estado hoy | Qué desbloquea | Cuándo se presentará |
|---|---|---|---|---|
| D-ANCLA | Forma del ancla monotónica externa (D-RB-04 A) + encaje en R1; canal/formato/custodio del registro (D-RB-09 A) | Requisito DECIDED; **forma PENDIENTE** | Enforcement single-use bajo restore; fin verificable de la moratoria | En T-03, con propuesta T-02 |
| D-P07A | Criterio de identidad y procedimiento de re-identificación P07-A | **RATIFICADA, opción A (2026-11-12)** con límites del delta superior; aliases sin política siguen sin equivalencia inferida | O3/O5, P07-16/P07-21, readmisión (E8), sujetos a A-04 y enforcement posterior | No volver a solicitar; aplicar solo tras decisiones/autorizaciones técnicas separadas |
| D-A01 | Arquitectura de mediación/supervisión (MED+SUP de ACA-1) | **RATIFICADA, opción A (2026-11-12), solo conceptual** | Define la dirección arquitectónica de G-1/G-2/G-3; no habilita implementación | No volver a solicitar; conservar S-1/S-2/S-3 UNKNOWN y límites CE-12/CE-13 |
| D-A04/A07 | Atestación del propietario como raíz de REC; diseño del testigo | PENDIENTE, condicionadas al diseño | Recuperación controlada G-2/G-3 | En T-03 si el diseño las requiere |
| D-A03 | Clasificación del SO/backup (¿restaura HOME de Termux?) | UNKNOWN/PENDING — **se resuelve con evidencia (T-04), no con votación previa** | Enforzabilidad de la moratoria frente al OS | Tras T-04 |
| D-P08/P09 (contenido) | **No es decisión nueva**: P08 decidida y universo P09 ratificado el 9-Nov (declarado por el propietario) | Contenido **no referenciado** en el repo | Verificabilidad de G-4/G-5 | T-01 es referencia/registro, no re-ratificación |
| D-DISC | DISC-08A/B | **No localizados** en el repo (129 ramas) ni en workspace | Desconocido hasta localizarlos | Primero localizar (T-01); solo entonces clasificar |
| D-01…D-12 / Misión 01 (9) | SIN DECIDIR (expedientes 004/005) | Fuera de la ruta M0 salvo intersección futura | — | No se reabren en este paquete |

**Decisiones ya tomadas que NO se vuelven a pedir:** A-01 opción A (MED+SUP conceptual bajo R1, 12-11); A-08 opción A (12-11); A-06/P07-A opción A (12-11); R1 (02-11); P01-B=C; D1–D6 + O-08/O-10/O-11; P05-C + cleanup atribuible + afectación reversible (07-11); P07 V2.3 (8-Nov, declarada); P07-A opción A (12-Nov); P08/P09 (9-Nov, declaradas); D-RB-01…09 (10-Nov); línea de meta (24-10); H-05 A / D-02 B documentales.

## 2. Autorizaciones de ejecución pendientes (separadas, en orden)

1. **T-04:** inspección de solo lectura en POCO/Termux (fingerprint, A-03, pre-checks E2/E3). Sin bootstrap, sin crear archivos, sin detener procesos.
2. **T-05…T-07 (A-09):** implementación limitada a los contratos decididos en T-03. Cualquier necesidad de decisión nueva detiene el cambio.
3. **T-08:** ejecución de tests/harness sobre SHA congelado, con `actor_B_class` fijado por escenario. Sin efectos protegidos.
4. **T-09:** CI sobre el SHA congelado (jobs inspeccionados por ID).
5. **T-10:** ventana R1 con operación real (propietario como launcher único; STOP ante actor no controlado; invalida ante reboot/update).
6. **T-11:** firma del acta (incluidas exclusiones, si las hay).

Ninguna de estas autorizaciones levanta: commissioning, `ROOT_READY`, `authorization` (NOT_EVALUATED), efectos protegidos (STOP), fusión de PR #110/#111, ni el moratorio D-RB-01.
