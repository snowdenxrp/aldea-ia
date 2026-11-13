# GRAND MISSION 01 — Decisiones del propietario (Owner Decisions)

- **Estado: PENDING** hasta recibir ratificación del propietario. Este documento **prepara** decisiones; no las toma. La recomendación técnica de Snow es separable de la decisión de autoridad y nunca se registra como decisión.
- **Alcance:** D-01–D-12 (Misión 02, SIN DECIDIR), 9 decisiones de Misión 01 (pendientes), y decisiones nuevas que GRAND MISSION 01 hace necesarias. Las decisiones del expediente M0 (D-RB-*, A-01–A-09, P07-A, A-08) **no** se re-deciden aquí: pertenecen a M0.
- **Recordatorio de separaciones ya ratificadas (no son decisiones nuevas):** H-05 OPCIÓN A y D-02 documental OPCIÓN B (2026-11-10 12:17 CST) están DECIDIDAS; su aplicación/registro sigue pendiente de misión separada. La D-02 del propietario (custodia de clave raíz, abajo) es **otra** decisión.

## 1. D-01 a D-12 (Misión 02) — todas SIN DECIDIR

| ID | Decisión | Opciones / espacio de diseño | Consecuencias | Recomendación técnica (no es decisión) |
|---|---|---|---|---|
| D-01 | Método de identidad raíz | Identificador autosoberano con rotación (p. ej. familia KERI) vs identificador estático (p. ej. `did:key`) vs híbrido | `did:key` no rota sin cambiar identidad (documentado en M02/003); KERI rota pero exige gobernanza de recuperación | KERI + `did:webvh` como componentes (evidencia Misión 005), no como solución completa |
| D-02 | Custodia y recuperación de la clave raíz | Custodia única vs Shamir/SLIP-39 con custodios vs hardware | Custodia única = punto único de fallo; umbral = complejidad de recuperación | Umbral con custodios fuera del dispositivo principal; no decidir sin D-01 |
| D-03 | Cláusula de enmienda de la Constitución | Enmienda por el propietario solo vs con retraso/registro vs con testigos | Sin cláusula, la Constitución es inmutable (riesgo) o mutable sin control (riesgo mayor) | Enmienda solo del propietario, con registro en MCC y retraso de activación |
| D-04 | Anclaje externo del registro | Sin ancla vs ancla periódica (notarización) vs ancla continua | Sin ancla, el rollback del registro es indetectable desde dentro (documentado: detección ≠ prevención) | Ancla periódica mínima cuando exista infraestructura; en móvil, declarar el límite |
| D-05 | Esquema y ciclo de vida de memoria; separación Labs/Lúmina | Un almacén vs memorias separadas con contratos (operativa/episódica/semántica/procedimental) | Hoy: dos almacenes divergentes sin contrato (verificado) | Memorias separadas con contratos propios (arquitectura de esta misión §1.7) |
| D-06 | Dialecto interno y revisiones fijadas (MCP 2026-07-28) | Fijar revisiones por componente vs seguir `latest` | `latest` invalida punteros (precedente A2A/C05) | Revisiones fijadas con registro de actualizaciones como eventos MCC |
| D-07 | Evaluación propia y umbral de cambio de modelo (200–500 casos) | Umbral fijo vs por dominio con calibración | Sin umbral, un cambio de motor puede degradar sin detectarse; con umbral mal calibrado, bloqueos espurios | Umbral por dominio con E17 (calibración); el rango 200–500 sigue sin norma universal (U2 UNKNOWN) |
| D-08 | Niveles de autonomía y acciones irreversibles | N0–N3 u otra escala; lista de irreversibles | Sin escala, «autonomía» es ambigua entre cognición y autoridad | Escala que separe preparar/ejecutar; irreversibles siempre con autorización expresa |
| D-09 | Punto aislamiento–utilidad de Labs; alcance de Cyber Lab | Aislamiento total vs frontera con revisión | Labs que toca Core destruye la separación; Labs inútil no aporta | Labs sin acceso a identidad/Constitución/autoridad; cyber solo en sistemas propios/labs/CTF/autorizado |
| D-10 | RTO/RPO/retención | Valores por tipo de memoria | Sin RTO/RPO, «recuperación» no es verificable | Definir tras el primer ensayo de recuperación (E20), no antes |
| D-11 | Calendario de agilidad post-cuántica (ML-DSA/SLH-DSA) | Seguir IR 8547 (deprecación tras 2030, prohibición tras 2035) vs calendario propio | Legacy post-2035 UNKNOWN (SP 800-131A futuro) | Seguir IR 8547 como referencia; no afirmar verificación legacy |
| D-12 | Kit de bootstrap y custodios | Contenido del kit; quiénes son custodios | Sin kit, la reconstrucción es improvisación | Kit mínimo: Constitución + MCC + memoria semántica verificada + procedimiento de restauración |

## 2. Nueve decisiones de la Misión 01 — pendientes

Orquestación; pila de memoria; modelo local; proveedores remotos y su política; niveles de autonomía N0–N3; alcance Labs/Cyber Lab; integridad de memoria y custodia de claves; frontera Lúmina; presupuesto. Orden sugerido en su día (solo sugerencia): 5, 4, 8, después 1, 2, después 3, 6, 7, 9. **Estado: sin decidir; esta misión no las resuelve ni las reordena con efecto.**

## 3. Decisiones nuevas que GRAND MISSION 01 hace necesarias

| ID | Decisión | Opciones | Consecuencias | Recomendación técnica |
|---|---|---|---|---|
| G-01 | Arquitectura candidata de descubrimiento | A (núcleo mínimo) / **B (doble anillo, recomendada)** / C (federada) — ver `GRAND_MISSION_01_AUTONOMOUS_DISCOVERY_ARCHITECTURE.md` §7 | A: viable hoy, aislamiento débil. B: seguridad por construcción, exige sandbox validado. C: inviable hoy (depende de D-04/D-10/D-12 e infraestructura inexistente) | **B**, evolucionando desde A; C solo como horizonte |
| G-02 | Almacén canónico de memoria Nexo | Mantener sobre de Lúmina vs almacén propio (SQLite + registro) vs ambos con contrato de sincronización | Sobre de Lúmina: continuidad dependiente de CI ajeno al control de Nexo. Contrato de sincronización: complejidad permanente | Almacén propio; Lúmina como banco de pruebas externo |
| G-03 | Alcance de C (confianza de política) | Verificación criptográfica real vs degradación explícita del claim a «estructura declarada» | Criptografía: más fuerte, más trabajo. Degradación: honesto y barato, pero limita claims | Criptografía si la política va a gobernar efectos; degradación si solo documenta |
| G-04 | Destino de la cadena protegida vs ruta paralela (hallazgo D) | Cablear la cadena protegida como productiva vs declarar la ruta de Lúmina como única productiva y la cadena como referencia | Cablear: cierra la brecha P112 documentada. Declarar: honesto pero renuncia al diseño de construcción 2026-10-08 | Cablear (es el diseño de construcción del 2026-10-08); la ruta de Lúmina queda como banco de pruebas |
| G-05 | MCC como capacidad distintiva | Adoptarla como diseño objetivo vs dejarla como una memoria más | Adoptarla compromete el diseño del registro causal desde el inicio (barato ahora, caro después) | Adoptarla (es la candidata a característica distintiva; ver síntesis) |
| G-06 | Definición de «claim crítico» (activa E16) | Por dominio / por impacto / por irreversibilidad de la decisión que lo usa | Sin definición, la verificación cruzada no se activa o se activa en todo (coste doble) | Por irreversibilidad de la decisión dependiente |
| G-07 | Presupuestos de investigación autónoma (E22) | Techos por ciclo y por experimento; qué exige autorización expresa | Sin techos, S16 (interminable) es el fallo por defecto | Techos fijados por el propietario; el sistema propone dentro de ellos |
| G-08 | Umbrales de escalado al propietario (E19) | Qué decisiones escalan siempre (admisión, despliegue, irreversibles, gasto) vs cuáles prepara el sistema | Umbral bajo: autonomía inútil. Umbral alto: riesgo de autoridad | Escalar siempre admisión/despliegue/irreversible/gasto; el resto preparar |
| G-09 | Sandbox en el dispositivo real | Validar aislamiento en Poco X7 Pro/Termux vs esperar ordenador/servicio | Sin validar, B no puede reclamar seguridad; esperar frena todo | Validar lo validable en móvil (límites declarados) y marcar el resto como dependencia |
| G-10 | Publicación de los entregables de esta misión | Mantener local vs subir a la rama histórica (carpeta EXTERNAL_AI_REVIEWS) vs rama nueva | Subir a la rama histórica mezcla misión estratégica con expediente documental | Local hasta revisión independiente; luego decidir destino con el propietario |

## 4. Lo que esta misión NO decide (por diseño)

- Ninguna D-01–D-12 ni ninguna de las 9 de Misión 01.
- Ninguna decisión del expediente M0 (D-RB-*, A-01–A-09, P07-A, A-08, P05/P07/P08/P09).
- La activación de la Candidata B/C, la MCC, o cualquier componente nuevo: son PROPUESTA hasta ratificación.
- La publicación de los entregables en el repositorio.
- Cualquier UNKNOWN elevado a resuelto: U2/U3/U5, legacy post-2035, jurisdicción, texto C01–C16, P7, I-02, M-3, v1.0.1 26-vs-28, SP 800-131A, P112 OPEN, W1→R1/W1→D1.
