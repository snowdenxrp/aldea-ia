# NCS M0 — Plan mínimo de cierre seguro

**Fecha:** 2026-11-10. **Veredicto de ruta:** `M0 CLOSURE PATH PARTIAL` (auditoría adversarial §7).
**Principio:** mínimo necesario para demostrar cumplimiento del claim restringido con exclusiones explícitas, o del modelo cambiado si el propietario lo elige en T-03. Sin alcance M1/STEP 7/YubiKey. Sin reactivar nada del moratorio D-RB-01 (RB-1–RB-4 prohibidos; se detecta su violación, no se «habilita» ningún alcance).

## 1. Tareas (ID · gate · resultado · dependencias · aceptación · responsable · riesgo de omitir · terminación objetiva)

| ID | Gate | Tarea | Resultado esperado | Dependencias | Evidencia de aceptación | Responsable sugerido | Riesgo de no hacerla | Terminación objetiva |
|---|---|---|---|---|---|---|---|---|
| T-01 | G-4/G-5 | **B-DOC-1:** referenciar/registrar contenido exacto P08 (mapping), P09 (universo), P01-B=C; constancia DISC-08A/B | G-4/G-5 verificables contra contenido localizable | Ninguna (documental) | Ruta+blob del registro; propietario confirma coincidencia sin re-decidir | Snow prepara, propietario registra | G-4/G-5 y ACA-1×P08/P09 quedan NO DEMOSTRADO para siempre | Un auditor sin contexto lee el contenido decidido desde el repo |
| T-02 | G-2/G-3 | **B-DOC-2 + especificaciones:** corrigendum ACA-1 (R-01–R-05); especificación P07-A + predicados REC/cuarentena; propuesta de ancla + canal de registro (con alternativas) | 3 paquetes PROPUESTA listos para decidir | T-01 (para P08/P09) | Documentos PROPUESTA con propiedad garantizada/no garantizada por opción | Snow | Decisiones tomadas sin predicados → oráculos sin criterio de éxito | Paquetes entregados; ninguna PROPUESTA registrada como decisión |
| T-03 | G-2/G-3 | **Decisiones:** A-08 (claim restringido+exclusiones **o** cambio de modelo), forma del ancla, P07-A, A-01 (+A-04/A-07 si aplica) | Criterio de éxito definido para G-2/G-3 | T-02 | Registros de decisión con contenido exacto y fecha | **Propietario** | Sin A-08 la ruta es inviable o ambigua (§11 del contrato) | Decisiones registradas y compatibles con R1/D-RB (verificación documental) |
| T-04 | G-7/G-6 | **Fingerprint + A-03 + pre-checks:** inspección de solo lectura (S-1–S-4, backup/HOME, roster E2/E3, RE-01/RE-02) | O8/S-1–S-4 PASS/FAIL/UNKNOWN por primitiva; A-03 resuelta/acotada | Autorización de inspección; T-03 (saber qué primitivas importan) | Informe ligado a SHA/entorno/versiones | Propietario autoriza; ejecución POCO/Termux por quien el propietario designe | Implementar sobre primitivas inexistentes (SUP/IDN indemostrables) | Informe firmado; FAIL sin alternativa → vuelta a T-03 |
| T-05 | G-4/G-5 | **Cierre P08/P09 técnico (tras autorización):** resolver común + separación init/append; conversión/contexto en APIs path-based; fixtures negativos del guard; clasificación de consumidores | O7 demostrable en el universo referenciado | T-01, T-03 (arquitectura), T-04 (primitivas) | Tests: raíz única, append sin init rechazado, fixtures rechazan cada clase de loader, no-bypass | Implementador autorizado | Bypass por importador directo (ADV-02/07) persiste | Tests verdes sobre SHA de trabajo + guard con fixtures |
| T-06 | G-1 | **Admisión pre-read:** dueño por flujo, contexto en helpers, validación de frontera `authorization` (ADV-04) | O-10 cumplida en código en todos los flujos del universo | T-05 (resolver), T-03 | 10 casos §7 spec P03/P04 + test de no-bypass | Implementador autorizado | Lectura persistente sin admisión (ADV-02) | Casos §7 verdes sobre SHA de trabajo |
| T-07 | G-2/G-3 | **Mecanismo durable:** BLOCKED durable + single-use contra ancla + cuarentena/REC según predicados; release por descriptor (ADV-01) | P05-C con enforcement; P07-C con prevención/serialización *en el claim decidido* | T-02, T-03, T-04 | E1–E9 + crash/restart/restore replay (CE-5) + sustitución E3/E4 | Implementador autorizado | BLOCKED volátil; lock de reemplazo eliminable (ADV-01) | Matriz E1–E9 sin UNKNOWN en el alcance decidido |
| T-08 | G-3 | **Harness P07:** P07-05/06/16/18b/19/21 con `actor_B_class` fijado por escenario **antes** de ejecutar; taxonomía V2.3 completa | Oráculos con resultado honesto (PASS_GATE solo donde V2.3 lo permite) | T-07, T-04 | Resultados por escenario ligados a SHA+entorno+comando | Implementador/tester autorizado | DETECTION_ONLY leído como PASS_GATE (falso PASS) | Cada oráculo bloqueante con veredicto y taxonomía; seams no observables = UNKNOWN/INVALID |
| T-09 | G-8 | **CI sobre SHA congelado:** congelar SHA (código+tests), ejecutar batería M0, inspeccionar jobs por ID | G-8 CI-VERIFIED para el SHA de cierre | T-05…T-08 | Runs con `head_sha` = SHA congelado, todos success, jobs citados | CI (tras autorización) | Crédito CI de SHA ajeno (ADV-05) | Lista de run IDs + jobs success; ningún job requerido en fallo |
| T-10 | G-6 | **Ventana E2/E3 con operación:** pre-checks → operación de cierre → verificación; STOP ante actor no controlado | G-6 demostrado en ventana delimitada (o exclusión declarada) | T-04, T-09 (operación = la del SHA de cierre) | Registro de ventana (fechas, SHA, roster, resultado) | Propietario (launcher único R1) | E2/E3 queda PARTIAL para siempre (ADV-08) | Ventana completada sin actor no controlado, o PARTIAL reconocido en el acta |
| T-11 | G-9 | **Acta de cierre:** 20 criterios PASS/exclusión; claim en primera línea; exclusiones con capacidad/riesgo; supuestos residuales; «fuera de alcance tras el cierre» | `M0_BUILD_COMPLETE` legítimo (o M0 sigue INCOMPLETO con lista exacta) | T-09, T-10 | Acta firmada por el propietario | Snow redacta, propietario firma | Falso PASS de alcance (ADV-12) | Acta aceptada; `PROTECTED_EFFECTS_AUTHORIZED` sigue STOP |
| T-12 | Transversal | **Higiene:** subir delta P09 + este paquete; resolver duplicado «(1)»; corrigendum §15.4 si el propietario lo quiere in situ | Expediente sin duplicados ni citas obsoletas | Ninguna (documental) | Hashes verificados en rama (Snow verifica tras subida) | Propietario sube; Snow verifica | Citas cruzadas erróneas (ADV-09) | Un ejemplar por entregable en SNOW; HEAD y hashes informados |

## 2. Paralelismo y secuencia forzada

- **Paralelo inmediato (sin autorización de ejecución):** T-01, T-02, T-12.
- **Secuencia forzada:** T-02 → T-03 → T-04 → (T-05 ∥ T-06 ∥ T-07, con T-05 antes de T-06 por el resolver) → T-08 → T-09 → T-10 → T-11.
- **Cadena crítica:** T-01 → T-02(ancla) → T-03 → T-04 → T-07 → T-08 → T-09 → T-11. T-05/T-06/T-10/T-12 no alargan la ruta si corren en paralelo.
- **Puntos de detención obligada:** T-03 elige claim universal en R1 (ruta inviable → volver a A-08); T-04 con FAIL en primitiva necesaria sin alternativa (→ T-03); cualquier decisión nueva durante T-05…T-07 (→ detener ese cambio, volver a T-03); seam no observable en T-08 (→ UNKNOWN/INVALID, gate abierto); actor no controlado en T-10 (→ STOP).

## 3. Cierre por categorías

- **Cerrable ahora, solo documentalmente:** T-01, T-02, T-12 (y el borrador del acta T-11).
- **Requiere intervención técnica (tras autorización):** T-04 (inspección), T-05, T-06, T-07, T-08, T-09 (CI), T-10 (ventana con operación).
- **Requiere decisión del propietario:** T-03 completa; autorizaciones de T-04…T-10; firma T-11.
- **No debe realizarse durante M0:** bootstrap de instancia nueva, commissioning, dispatch/efectos protegidos, fusión de PR #110/#111, cualquier mecanismo de rollback RB-1–RB-4, M1/STEP 7/YubiKey, selección de launcher por inferencia (P01-B=C).

## 4. Optimización aplicada

Se excluyeron deliberadamente: re-censos P09, re-auditorías CE/locks/P08 (cerradas salvo contradicción), cobertura universal P09, harness de escenarios no bloqueantes, y cualquier mejora sin dependencia hacia un gate. Cada tarea restante desbloquea al menos un gate o un oráculo; ninguna es «mejora» libre.
