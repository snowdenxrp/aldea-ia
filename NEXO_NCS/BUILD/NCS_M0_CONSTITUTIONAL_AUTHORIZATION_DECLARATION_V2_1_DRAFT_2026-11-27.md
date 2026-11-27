# NCS M0 — Declaración de autorización constitucional
**Versión:** 2.1 — Borrador revisado para ratificación del propietario  
**Estado:** PENDIENTE DE RATIFICACIÓN — NO VIGENTE  
**Fecha:** 2026-11-27  
**Autoridad constitucional actual:** Propietario de NCS

> Este documento es un borrador de autorización. Su publicación en esta rama documental no constituye ratificación, no modifica contratos vigentes, no cambia estados de M0 y no autoriza commissioning ni efectos protegidos.

## 1. Objeto y alcance

Se propone autorizar la continuación del trabajo técnico y documental estrictamente necesario para alcanzar el cierre verificable de NCS M0.

El trabajo queda limitado a contratos, obligaciones y requisitos pertenecientes al alcance de M0 que hayan sido ratificados por la autoridad correspondiente. No autoriza ampliar el alcance, incorporar capacidades nuevas ni iniciar trabajos de M1.

## 2. Autoridad y límites de Nexo

Nexo no puede:

- Autoautorizarse ni modificar unilateralmente su propia constitución.
- Ratificar sus propias propuestas normativas.
- Elevar sus privilegios o ampliar su autoridad.
- Convertir una recomendación técnica en una decisión constitucional.
- Interpretar la finalización de M0 como permiso automático para operar sobre recursos o efectos protegidos.

La autoridad constitucional actual permanece en el propietario.

## 3. Trabajo técnico propuesto

Dentro del alcance de esta declaración, se propone autorizar:

- Investigar y reconciliar contratos de M0.
- Diseñar mecanismos técnicos necesarios para satisfacer contratos de M0 previamente ratificados.
- Modificar código, pruebas y workflows cuando resulte necesario para cumplir esos contratos.
- Ejecutar pruebas locales y procesos de integración continua.
- Corregir defectos demostrados y documentar limitaciones abiertas.
- Generar, conservar y verificar evidencia técnica en GitHub.

Esta autorización no incluye funcionalidades ajenas a M0 ni implementar propuestas normativas no ratificadas. La autorización para trabajar sobre un contrato ratificado no equivale a autorización para alterar el contrato.

## 4. Integridad de pruebas y revisión independiente

Toda modificación de pruebas deberá:

1. Justificarse contra el contrato ratificado que la prueba representa, nunca contra el resultado deseado.
2. Identificar el defecto, insuficiencia o cambio legítimo que motiva la modificación.
3. Preservar la intención original de detectar incumplimientos.
4. No debilitar, eliminar ni alterar criterios de aceptación únicamente para obtener resultados satisfactorios.
5. Registrar en GitHub el motivo, alcance, diff y resultado de la modificación.
6. Mantener trazabilidad entre contrato, obligación, prueba, SHA evaluado y ejecución correspondiente.

**Revisión y aprobación:** antes de aceptar como válida una modificación de pruebas, deberá revisarla y aprobarla el propietario o una autoridad independiente expresamente designada por él. El autor del cambio no podrá aprobarlo exclusivamente por sí mismo. Si el propietario es también autor del cambio, la aprobación deberá proceder de una autoridad independiente designada. La revisión verificará la correspondencia con el contrato ratificado, la conservación de la intención de la prueba y la ausencia de debilitamiento injustificado de los criterios.

La revisión independiente propuesta en este apartado es una salvaguarda de esta declaración; no se presenta como una regla histórica ya ratificada por los contratos técnicos existentes.

Ninguna prueba modificada podrá considerarse evidencia suficiente por el mero hecho de producir PASS. Los resultados deberán ser reproducibles y corresponder al código evaluado. La condición CI-VERIFIED requerirá evidencia de CI asociada al SHA exacto que se pretende validar.

## 5. Separación normativa de P07 V2.2 y V2.3

P07 V2.2 conserva su condición de base normativa vigente.

P07 V2.3 constituye una propuesta de modificación o complemento y no podrá, antes de su ratificación expresa por la autoridad competente:

- Sustituir V2.2.
- Modificar su interpretación normativa.
- Alterar los criterios de aceptación vigentes.
- Aplicarse de facto en código, pruebas, workflows o decisiones operativas.

La evaluación técnica de V2.3 no equivale a su ratificación. Cualquier implementación deberá seguir el contrato vigente hasta que exista ratificación expresa de la modificación correspondiente.

## 6. Evidencia requerida para el cierre técnico de M0

Para declarar M0 cerrado deberán existir, como mínimo:

- Contratos y obligaciones aplicables identificados y con estado normativo inequívoco.
- Decisiones constitucionales pendientes resueltas por la autoridad competente.
- Implementación correspondiente a los contratos ratificados.
- Pruebas vinculadas a cada obligación aplicable y justificadas contra su contrato.
- Revisiones de cambios de pruebas conforme a la sección 4.
- Resultados reproducibles y evidencia de CI vinculada al SHA exacto cuando corresponda.
- Reconciliación de hallazgos, contradicciones, excepciones y riesgos pendientes.
- Evidencia preservada y verificable en GitHub.
- Estado final explícito de cada obligación, sin convertir UNKNOWN, PARTIAL u OPEN en PASS por interpretación.

Una obligación sin evidencia suficiente permanecerá abierta o UNKNOWN, según corresponda. Documentos, declaraciones, revisiones o pruebas aisladas no sustituyen evidencia técnica exigida por el contrato.

## 7. Terminología y separación de las puertas de autorización

Para evitar que términos relacionados se confundan, esta declaración distingue:

1. **Commissioning:** puerta de autorización separada. El cierre técnico de M0 no constituye commissioning ni lo autoriza.
2. **Repair:** ejecución de acciones de reparación sobre estado o recursos. Las acciones identificadas en el runtime M0 —`repair_agent_state`, `repair_agent_needs` y `repair_resource_state`— permanecen bloqueadas mientras no exista el contrato de settlement aplicable y la autorización correspondiente. La observación de reparación en modo de solo lectura no equivale a ejecutar una reparación.
3. **Dispatch de efectos externos/protegidos:** invocación que puede producir un efecto fuera del estado interno de Nexo. No queda autorizada por esta declaración ni por un PASS de M0.
4. **Protected effects:** categoría de efectos sujetos a su propia puerta de autorización, identificada en la línea de meta como `PROTECTED_EFFECTS_AUTHORIZED`. Esta puerta es independiente de `M0_BUILD_COMPLETE`.

El término genérico “dispatch” no deberá interpretarse como una prohibición o autorización indiscriminada de toda operación interna. En particular, el append interno de Chronicle tiene un contrato técnico propio y no debe confundirse con dispatch de un efecto externo protegido. Esta precisión terminológica no amplía ni concede permisos de ejecución.

Mientras no exista decisión independiente y evidencia suficiente, se mantienen:

- `commissioning: STOP`
- `protected_effects: STOP`
- `authorization: NOT_EVALUATED`

## 8. Separación entre cierre técnico y autorización operativa

El cierre técnico de M0 no implica:

- Levantar automáticamente STOP.
- Cambiar `authorization: NOT_EVALUATED`.
- Autorizar commissioning.
- Habilitar repair, dispatch de efectos externos ni otros efectos protegidos.
- Conceder acceso a recursos protegidos.
- Autorizar operaciones autónomas.

Cualquier cambio de estas condiciones requerirá una decisión independiente, expresa y documentada de la autoridad competente, sustentada en evidencia específica para el efecto que se pretenda autorizar.

## 9. Separación Nexo / Lúmina

Se mantiene la separación arquitectónica, normativa y operativa entre Nexo y Lúmina.

Esta declaración no permite transferir autoridad, estado, permisos, memoria protegida ni responsabilidades entre ambos sistemas. Cualquier afirmación de integración o separación técnica deberá respaldarse con evidencia correspondiente al alcance evaluado.

## 10. Sucesión futura

Se reconoce la posibilidad de una sucesión futura conforme a los mecanismos constitucionales que se establezcan.

La designación de una persona como posible sucesora no le concede autoridad operativa, privilegios, permisos de modificación ni capacidad de ratificación en el presente. Tampoco modifica automáticamente los permisos de lectura, acceso a la constitución o consulta del historial de decisiones.

Cualquier atribución futura de autoridad deberá producirse mediante un procedimiento expreso, verificable y válido conforme a la constitución de NCS.

## 11. Exclusiones expresas

Esta declaración no comprende:

- Activación operativa de Nexo.
- Commissioning ni efectos protegidos.
- Desarrollo o implementación de M1.
- Implementación anticipada de STEP 7.
- Modificaciones del entorno operativo del dispositivo POCO X7 Pro o Termux.
- Cambios en PR #110.
- Modificaciones constitucionales o implementación de propuestas normativas no ratificadas.

## 12. Preservación y continuidad

Todo avance relevante, corrección, decisión, evidencia y transferencia de continuidad deberá preservarse en GitHub.

Antes de declarar una publicación como realizada se deberá verificar el commit, los archivos afectados y su presencia en el remoto. No se considerará preservado un trabajo que exista únicamente en una conversación, una sesión local o un informe de otra IA.

Se deberá evitar repetir investigaciones ya realizadas y reutilizar evidencia previa cuando siga siendo válida para el alcance evaluado.

## 13. Declaración final y ratificación

Esta declaración propone autorizar trabajo técnico y documental para cerrar NCS M0, respetando los límites normativos y de autoridad aquí establecidos.

La aceptación técnica, el cierre de M0 y la autorización operativa son decisiones independientes y no podrán inferirse unas de otras.

**Este documento solo entrará en vigor cuando sea ratificado expresamente por el propietario de NCS.**

- **Firmante:** Pendiente.
- **Estado de ratificación:** PENDIENTE.
- **Fecha de ratificación:** Pendiente.

---

## Registro de revisión V2.1

- Se incorpora una revisión/aprobación por el propietario o autoridad independiente designada para cambios de pruebas; el autor no puede aprobar exclusivamente su propio cambio.
- Se precisa que la revisión independiente es una salvaguarda propuesta en esta declaración, no una regla previa que se atribuya falsamente a los contratos ratificados.
- Se contrasta la terminología con la línea de meta M0, el gate genérico de efectos, la auditoría de frontera de dispatch, el contrato de settlement y el checkpoint de reparación.
- Se distingue commissioning, ejecución de repair, dispatch de efectos externos/protegidos y la puerta `PROTECTED_EFFECTS_AUTHORIZED`.
- Se aclara que Chronicle append interno no debe confundirse con dispatch de efecto externo protegido; esto no concede permisos ni cambia el estado STOP.
- Esta revisión es documental. No ratifica P07 V2.3, no modifica el estado de M0, no declara PASS/CI-VERIFIED y no autoriza commissioning ni efectos protegidos.
