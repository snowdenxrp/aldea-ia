# NCS M0 — revisión adversarial del contrato candidato frente a línea de meta y decisiones canónicas

Fecha: 2026-10-27  
Rama: `ncs-clean-architecture`  
Estado: **REVISIÓN DOCUMENTAL — NO RATIFICA EL CANDIDATO — STOP ANTES DE IMPLEMENTAR**

## 1. Pregunta de esta revisión

¿El contrato candidato de bootstrap/autoridad/persistencia complementa los contratos M0 ya aceptados como base, o introduce una segunda línea de meta, autoridad nueva o una garantía más amplia que la evidencia permite?

Fuentes consultadas directamente en la rama:
- `NEXO_NCS/BUILD/NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md` (base de cierre aceptada por el propietario, no autorización de implementación).
- `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`.
- `NEXO_NCS/BUILD/NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md`.
- `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`.
- `NEXO_NCS/BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md`.
- `NEXO_NCS/BUILD/NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md`.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`.
- `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`.
- `NEXO_NCS/BUILD/NCS_M0_BOOTSTRAP_AUTHORITY_PERSISTENCE_BOUNDARY_CONTRACT_CANDIDATE_2026-10-27.md`.

La lectura de documentos no sustituye el grafo ejecutable, las pruebas, CI ni una decisión del propietario.

## 2. Resultado ejecutivo

**No hace falta crear otra línea de meta M0.** Ya existe una base de cierre aceptada por el propietario: `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`. El contrato candidato debe funcionar como un complemento de obligaciones para bootstrap/persistencia y mapearse a esa línea de meta, no reemplazarla ni inventar un segundo cierre.

Se mantienen tres niveles diferentes:
1. **Decisión de alcance:** Opción A limita el almacenamiento inicial M0 a estado local no autoritativo; reparación/migración/cutover no entran por defecto.
2. **Contrato operacional:** Opción B separa inicialización explícita de commit condicional normal y prohíbe auto-inicialización silenciosa.
3. **Autoridad constitucional:** la fuente independiente y vigente de legitimidad no está implementada/demostrada; no se deriva de A, B, una raíz de directorio, un lock ni un store.

No se encontró contradicción documental que invalide A o B. Se encontraron dependencias abiertas que impiden declarar el contrato listo para implementación.

## 3. Alineación y obligaciones existentes

| Tema del candidato | Contrato canónico existente | Evaluación |
|---|---|---|
| M0 no autoritativo; efectos protegidos separados | Línea de meta §1–2; root contract §0 | Alineado. `M0_BUILD_COMPLETE` y `PROTECTED_EFFECTS_AUTHORIZED` siguen siendo gates distintos. |
| No-bypass, entrypoints y procesos hijos | Línea de meta §3.B; manifiesto D1 | Alineado, pero el grafo transitivo sigue OPEN; la inspección documental no lo cierra. |
| Bootstrap separado; ausencia no autoriza creación | Registro D0–D3 O-02; decisión de estado ausente | Alineado. Protocolo concreto, quiescencia y evidencia de exclusión de escritores siguen pendientes. |
| No migración automática, dual-write ni merge heurístico | Registro D0–D3 O-04; root contract | Alineado. No inferir que todas las rutas legacy estén bloqueadas en runtime. |
| UNKNOWN/STOP y sin retry automático de negocio | Línea de meta §3.C; decisión de estado ausente | Alineado. Los resultados deben mapearse a contratos existentes; no añadir enums runtime por este documento. |
| Persistencia/lock/efecto como afirmaciones separadas | Root contract; línea de meta §3.B–E | Alineado. Lock de instancia no es raíz de autoridad ni prueba de efecto externo. |
| Constitution Authority Context | Contrato Core de STEP 7 | Compatible solo como owner semántico constitucional; el contexto requiere una Trust Foundation ya reconocida y no concede ejecución. La inicialización local no está explícitamente cubierta por analogía. |
| Genesis Trust Foundation | Contrato candidato de STEP 7 | Sigue candidato sujeto a ataque; no se ha demostrado la base de confianza independiente ni la ruta de establecimiento protegida. |

## 4. Mapeo de A1–A7 a la línea de meta aceptada

Los criterios A1–A7 del contrato candidato son sub-obligaciones; no reemplazan los criterios A–E de la línea de meta M0.

| Candidato | Criterio de línea de meta principal | Qué evidencia futura cerraría la obligación |
|---|---|---|
| A1 Bootstrap aislado | B.5–B.6; C.9–C.13; E.18–E.20 | Contrato de alcance congelado; inventario de rutas; pruebas adversariales de inicialización/migración y no-bypass ligadas al SHA final. |
| A2 Autoridad independiente | B.7–B.8; G5 en registro D0–D3 | Trust Foundation establecida independientemente y enlazada al contexto constitucional por una frontera protegida. No se sustituye por test verde o datos del caller. |
| A3 Separación Nexo/Lúmina | A.3; excepción explícita en manifiesto D1 | Decidir si simulate/assistants quedan excluidos del M0 operativo; si se incluyen, contrato de cruce de datos y pruebas de aislamiento. La clasificación documental actual no es enforcement. |
| A4 Persistencia acotada | C.9–C.13; D.14–D.16 | Protocolo de bootstrap/recuperación aprobado y pruebas separadas de atomicidad, consistencia multi-store y durabilidad dentro del entorno objetivo declarado. |
| A5 Concurrencia | C.11–C.13; E.18 | Alcance explícito de writers/procesos/rutas y pruebas del sistema de archivos objetivo; declarar UNKNOWN para escritores externos fuera del modelo. |
| A6 STOP y reparación | B.5–B.8; O-07; D1 manifest | Grafo de rutas de efecto cerrado y enforcement probado en el límite real. El gate local de Opción A no demuestra exclusión global de repair. |
| A7 Línea de meta M0 | Línea de meta §2–5 y aceptación O-06 | Usar la línea de meta existente; actualizar su acta solo cuando haya evidencia por criterio, exclusiones aceptadas y SHA exacto. |

## 5. Contradicciones aparentes y límites

### 5.1 “Autoridad para inicializar almacenamiento” no debe convertirse en autoridad constitucional

La frase puede ser ambigua. Para el alcance A, la inicialización de estado local no autoritativo es una operación de persistencia limitada; no puede establecer/modificar raíz constitucional ni autorizar efectos. Sin embargo, el contrato de ausencia de estado exige precondiciones previas a implementación. No se ha identificado evidencia suficiente para declarar que esas precondiciones estén satisfechas hoy.

No resolver esa dependencia inventando un actor, un credential, un `BootstrapAuthority`, un identificador persistente ni un gate universal.

### 5.2 B2 no es todavía una regla canónica ratificada

El candidato propone que la inicialización/migración no alcance admisión/dispatch en la misma invocación. Es una obligación de diseño que debe concretarse dentro de D0/D1/D2 y recibir el tratamiento de decisión que corresponda. La ruta Chronicle observada es una brecha estática relevante, pero este documento no decide por sí solo el diseño de runtime.

### 5.3 La línea de meta existente es deliberadamente exigente

La línea de meta M0 ya exige contratos congelados, no-bypass, protocolo de bootstrap, manejo de corrupción/UNKNOWN, concurrencia, pruebas adversariales, CI ligado al SHA y un acta final. La presencia de criterios en Markdown no los satisface. No reducir esa línea de meta para hacer coincidir el estado actual.

## 6. Próxima secuencia mínima, sin repetir auditorías

1. Mantener el candidato como **NO RATIFICADO** y congelar por ahora su alcance documental.
2. Resolver las decisiones de diseño abiertas usando el registro D0–D3 y el manifiesto D1 existentes; no volver a censar las rutas ya documentadas salvo que haya cambio de fuente o edge nuevo.
3. Delimitar explícitamente si la separación A1/B2 se exige para todo bootstrap M0 o solo para la inicialización local no autoritativa incluida en A. No tratar esta propuesta como decisión del propietario.
4. Actualizar la matriz de trazabilidad existente para vincular obligaciones de bootstrap a los criterios A–E de la línea de meta, sin duplicar el acta ni crear una segunda línea de cierre.
5. Solo tras decisión explícita y autorización separada de implementación, implementar los cambios/tests necesarios y ejecutar CI sobre el SHA que los contiene. No se autoriza esa fase en esta revisión.

## 7. Estado y evidencia

- Esta revisión fue documental y de lectura de los contratos nombrados.
- No se ejecutó runtime, tests, CI ni GitHub Actions.
- No se modificó runtime, tests, workflows ni configuración ejecutable.
- No se cerró D0/D1/D2/D3 ni el grafo transitivo.
- M0 permanece `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; exclusión global de repair `UNKNOWN`.
- Resultado: **sin contradicción que invalide las decisiones A/B; con dependencias críticas aún abiertas. No implementar todavía.**
