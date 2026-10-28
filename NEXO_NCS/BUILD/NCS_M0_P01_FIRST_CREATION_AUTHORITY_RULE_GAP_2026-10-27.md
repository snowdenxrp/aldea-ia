# NCS M0 — brecha de regla legítima para la primera creación P-01 (2026-10-27)

**Estado:** RECONCILIACIÓN DOCUMENTAL — NO RATIFICACIÓN — NO IMPLEMENTACIÓN / NO TEST / NO CI
**Base:** línea de meta M0 aceptada, registro D0–D3, decisión de estado ausente, propuesta de bootstrap explícito, contrato candidato de frontera, reconciliación adversarial, STEP 7 y mapa exacto del candidato Continuity.

## 1. Pregunta acotada

¿Las decisiones aceptadas ya definen una regla legítima que permita crear por primera vez el archivo Continuity operacional M0, sin convertir ese archivo ni al caller en autoridad?

Esta nota no vuelve a decidir si el bootstrap debe estar separado del commit normal: ese principio ya está aceptado. Examina solo la regla legítima para la primera creación del objeto candidato.

## 2. Resultado de la reconciliación

**No se encontró en los artefactos revisados una regla ya aceptada que resuelva explícitamente la legitimidad de la primera creación local de Continuity.** Esto es un resultado de la documentación consultada, no prueba de que no exista en cualquier otro artefacto del repositorio o en una decisión externa no registrada.

Las decisiones existentes cubren puntos diferentes:

- **Alcance A:** el almacenamiento M0 se pretende local y estrictamente no autoritativo. No prueba que el objeto real esté aislado de todos los consumidores.
- **Separación B:** el commit normal no auto-inicializa; el bootstrap es una operación explícita y separada. No define quién/qué legitima la primera creación ni el procedimiento operativo completo.
- **Contrato candidato de frontera:** prohíbe derivar autoridad de stores, snapshots, flags o callers y exige UNKNOWN/STOP ante incertidumbre. Es candidato de contrato, no ratificación de una autoridad nueva.
- **Constitution Authority Context:** se establece desde una Trust Foundation ya reconocida; no puede construirse desde afirmaciones del caller.
- **Genesis Trust Foundation:** define una dirección de diseño de raíz independiente, pero permanece como contrato mínimo de investigación/diseño; no demuestra que exista una frontera implementada.
- **Gate STEP 7:** exige STOP BEFORE CODE hasta que la Trust Foundation esté explícita.

La conclusión es deliberadamente estrecha: **la regla de primera creación sigue PENDING/UNKNOWN**. No se deduce que todo write local necesite necesariamente una raíz constitucional; tampoco se deduce que el alcance A autorice el write por sí mismo.

## 3. No confundir las tres afirmaciones

| Afirmación | Estado |
|---|---|
| El archivo Continuity no es por sí mismo una raíz constitucional o credencial | Principio de diseño compatible con los contratos revisados; la propiedad negativa end-to-end aún necesita evidencia |
| La operación de bootstrap está separada conceptualmente del commit normal | Aceptado como principio de diseño; el aislamiento ejecutable de callers no está demostrado |
| Existe una regla legítima que permite crear por primera vez ese archivo bajo las condiciones exactas de M0 | PENDING/UNKNOWN; no se ha identificado en los artefactos revisados una decisión aceptada que la cierre |

Ninguna fila sirve como evidencia sustituta para otra.

## 4. Límite semántico: autoridad no es sinónimo de cualquier permiso local

Los documentos STEP 7 tratan la legitimidad de la autoridad constitucional y prohíben autoestablecer la raíz a partir de estado/caller. No definen explícitamente, en los textos revisados, una política completa para cada escritura de almacenamiento operativo no autoritativo.

Por ello no es correcto insertar por inferencia una nueva BootstrapAuthority, owner, credential, ID persistente, gate universal o raíz paralela. Tampoco es correcto inferir que «el usuario es owner del proyecto» baste como protocolo técnico de primera creación. Si el proyecto requiere una regla normativa de operación local distinta de la autoridad constitucional, debe formularse y reconciliarse con los contratos canónicos antes de implementación; no inventarse aquí.

## 5. Forma mínima de una decisión futura, sin predeterminar la respuesta

Si el registro canónico no cubre la brecha, la decisión del propietario debe contestar, con referencia al objeto exacto:

1. **Objeto y alcance:** archivo Continuity bajo el path efectivo de la instancia; snapshot inicial y esquema permitidos.
2. **Base normativa:** qué decisión/contrato ya aceptado permite la operación o qué decisión nueva del propietario se requiere; sin atribuir autoridad al caller ni al contenido persistido.
3. **Separación operacional:** garantía de que una operación cuyo propósito sea bootstrap termina antes de admisión, PREPARED, dispatch, reconciliación o mutación de dominio.
4. **Precondiciones locales:** cómo se distingue ausencia real de corrupción/error/conflicto y cómo se conserva estado existente; cómo se trata UNKNOWN sin retry automático.
5. **Límites declarados:** escritores y entorno cubiertos, quiescencia, exclusión y límites que seguirán UNKNOWN.
6. **Evidencia de cierre:** pruebas autorizadas y CI ligados al SHA exacto, solo después de congelar contrato y obtener autorización separada.

Esta lista no crea estados de runtime ni prescribe una primitiva de filesystem. Es el contenido mínimo que debe cubrir la decisión o los contratos existentes para que el tema no vuelva a abrirse por ambigüedad.

## 6. Relación con la línea de meta M0

No se crea una segunda línea de meta. La brecha se asigna a P01-A/P01-G y a los criterios de bootstrap/persistencia ya incluidos en NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md. El gate PROTECTED_EFFECTS_AUTHORIZED permanece independiente.

M0 no pasa a completo por haber creado esta nota ni por tener un contrato candidato. Para cerrar la brecha se necesita una decisión normativa rastreable, un contrato congelado, propiedades operacionales verificables y evidencia ligada al SHA final.

## 7. Estado canónico y límites de esta nota

- M0: INCOMPLETO.
- P-01 / P01-A / P01-G: OPEN / UNKNOWN.
- D0/D1/D2/D3: OPEN; D1-IMPLEMENTATION: NO AUTORIZADA.
- Regla legítima de primera creación: PENDING/UNKNOWN.
- Raíz: PENDING/UNKNOWN; authorization: NOT_EVALUATED; efectos protegidos: STOP.
- Solo documentación. No se modificaron runtime, tests, workflows ni configuración ejecutable; no se ejecutaron tests, CI o Actions.

## 8. Punto exacto para continuar

Leer STATUS.md, esta nota y NCS_M0_P01_EXACT_CANDIDATE_OBJECT_AND_FIELD_CONSUMER_MAP_2026-10-27.md. Si el propietario no ha decidido la regla y ningún contrato canónico ya aceptado la cubre, detener la inferencia y presentar una sola decisión concreta sobre la legitimidad de la primera creación. No reabrir el censo de callers, no implementar y no pedir a otras IAs que elijan autoridad por el propietario.


## 9. Cruce adicional con la investigación histórica de autoridad (2026-10-27)

Se contrastó esta brecha con `docs/nexo/NEXO_AUTHORITY_FOUNDATION_BOOTSTRAP_NO_ROOT_DISASTER_RECOVERY_RESEARCH_V1_2026-09-24.md` (blob consultado: `34555b7d26e142372823ef9f9eafe91107707d2e`).

Ese artefacto, marcado expresamente **RESEARCH ONLY**, sí contiene principios históricos relevantes para autoridad constitucional y recuperación:

- autoridad no se deriva circularmente del estado recuperado, snapshot, clave, epoch ni declaración del propio sistema;
- sin una raíz externa válida o contrato de recuperación previamente establecido, el sistema permanece no autoritativo;
- una autoridad humana/organizativa solo es una raíz válida si forma parte de un proceso de gobernanza definido explícitamente;
- la investigación no selecciona el mecanismo concreto ni demuestra una frontera implementada.

**Límite de aplicabilidad:** esos principios refuerzan que el archivo Continuity no puede legitimarse a sí mismo. Sin embargo, el documento trata principalmente de continuidad de autoridad, publicación autoritativa y recuperación; no establece explícitamente una política normativa para la primera escritura de almacenamiento M0 local, estrictamente no autoritativo. Por tanto, no cierra P01-A/P01-G ni autoriza la creación inicial.

La búsqueda de esta ronda fue acotada a términos de primera creación, bootstrap, raíz y escrituras locales en el repositorio. No equivale a una búsqueda exhaustiva de todas las decisiones externas, conversaciones ni documentos históricos. El resultado correcto sigue siendo: **principio general de autoridad corroborado; regla específica de primera creación local no localizada en las fuentes consultadas; PENDING/UNKNOWN**.

No se altera la línea de meta ni los gates. Sin cambios ejecutables, tests, workflows o configuración; no se ejecutaron tests/CI/Actions.


## 10. Reconciliación con la selección histórica del canal humano (2026-10-27)

Se revisaron también:

- `NEXO_NCS/BUILD/STEP_7_CURRENT_PHONE_CANDIDATE_THREAT_MODEL_2026-10-08.md` (blob `e3ec6533495438e20fdbf6e0b989eaaad86b829c`);
- `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md` (blob `b93a2fd8e730d54bbe43493db137dc1b4d13d964`);
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md` (blob `e65df41ff98f7e53a8574ca5295a947023cb8b30`).

El registro histórico sí conserva una elección del propietario para examinar su teléfono/canal actual como **candidato** de canal humano y una hipótesis acotada para transmitir aprobación del contenido constitucional exacto. El mismo threat model dice explícitamente que C0 sigue UNESTABLISHED, que no se seleccionó mecanismo ni base de enrollment y que la elección del dispositivo no declara confiables al teléfono, sistema operativo, cuenta o aplicación.

El mapa de roles STEP 7 confirma que la ceremonia de reconocimiento inicial y la frontera de enforcement siguen sin establecerse. El contrato mínimo Genesis Trust Foundation continúa como candidato de diseño y prohíbe que el objeto candidato se autentique a sí mismo.

**Conclusión de aplicabilidad:** esta decisión histórica no debe perderse, pero tampoco ampliarse por analogía. Se refiere a investigar un canal candidato para aprobación constitucional; no autoriza ese canal como raíz técnica ni define la primera creación de Continuity local no autoritativo. La brecha P-01 específica permanece PENDING/UNKNOWN. No hace falta volver a pedir al propietario que seleccione de nuevo el teléfono como candidato; lo pendiente es el contrato/procedimiento que haga verificable cualquier uso autorizado de un canal y si tal procedimiento cubre este objeto local.

No se infiere aprobación de contenido constitucional, commissioning, confianza del dispositivo, autoridad raíz ni permiso de escritura. Sin cambios ejecutables, tests, workflows o configuración; no se ejecutaron tests/CI/Actions.


## 11. Decisión explícita del propietario: mantener STOP (2026-10-27)

El propietario confirmó: **“Mantenemos stop”**, al preguntar si la base reconocida pendiente era la YubiKey ya considerada.

Interpretación acotada y vinculante para la continuidad documental:
- La primera creación del objeto Continuity M0 permanece bloqueada mientras la base legítima aplicable no esté definida y técnicamente reconocida.
- La YubiKey sigue siendo una candidata de hardware criptográfico considerada previamente; su elección o posesión no demuestra por sí sola configuración, enrolamiento, legitimidad de la raíz, reconocimiento por la frontera protegida ni permiso para inicializar Continuity.
- El canal del teléfono para transmitir aprobación de contenido constitucional sigue siendo candidato histórico; no se eleva a raíz técnica ni a autoridad de primera creación.
- No se crea una autoridad paralela para bootstrap ni se interpreta el alcance local no autoritativo como autorización de escritura.
- No se cambia la política por ausencia, conveniencia, presión de continuidad ni por esta anotación.

**Estado:** regla legítima de primera creación PENDING/UNKNOWN; primera creación STOP; raíz legítima PENDING/UNKNOWN; authorization: NOT_EVALUATED; efectos protegidos STOP; M0 INCOMPLETO; P-01/P01-A/P01-G OPEN / UNKNOWN.

Esta ratificación conserva la condición de parada; no autoriza implementación, pruebas, CI, instalación, configuración de la YubiKey ni acciones sobre el dispositivo.


---

## 12. Decisión explícita del propietario sobre el alcance del objeto — U (2026-10-27)

El propietario decidió: **“Para el alcance del objeto de bootstrap M0 de Continuity, mi decisión es U.”**

Se registra con el significado exacto siguiente:
- U significa que el alcance del objeto todavía no puede demostrarse ni clasificarse con seguridad como L (almacenamiento local estrictamente no autoritativo) ni como C (estado constitucional o que afecta a la autoridad).
- No se selecciona L ni C, no se presume que el objeto sea inocuo por ser local, y tampoco se presume que sea una raíz constitucional.
- P01-A permanece OPEN / UNKNOWN.
- P01-B permanece **C — NO SELECCIONAR TODAVÍA**; esta decisión U es independiente y no cambia P01-B.
- La regla legítima para la primera creación permanece PENDING / UNKNOWN; primera creación de Continuity STOP; raíz legítima PENDING / UNKNOWN; authorization: NOT_EVALUATED; efectos protegidos STOP; M0 INCOMPLETO.
- No se ratifica ningún contrato candidato. No se autoriza implementación, escrituras, pruebas, CI/Actions, configuración ejecutable, instalación/configuración de hardware ni acciones sobre el dispositivo.

La decisión U delimita honestamente lo que aún no se conoce; no levanta ningún gate ni resuelve por sí misma la regla legítima de primera creación.
