# NCS M0 / P-01 — ataque de evidencia a Genesis Trust Foundation (2026-10-27)

**Estado:** ANÁLISIS DOCUMENTAL — DISEÑO CANDIDATO NO CERRADO — NO IMPLEMENTACIÓN / NO TEST / NO CI  
**Rama:** `ncs-clean-architecture`  
**Propósito:** convertir el contrato mínimo STEP 7 en preguntas de falsación y evidencia exigible, sin elegir proveedor, dispositivo, protocolo de enrolamiento ni mecanismo de bootstrap.

## 1. Resultado ejecutivo

El contrato mínimo de Genesis Trust Foundation define semántica útil, pero sigue marcado `DESIGN CANDIDATE — ATTACK REQUIRED`. No es una base técnica ya reconocida. La inspección documental no identifica todavía un mecanismo independiente que produzca `ESTABLISHED` para la raíz inicial bajo el modelo de amenazas actual.

La YubiKey puede, según el modelo y la configuración que finalmente se elijan, custodiar o usar material criptográfico. Eso no decide por sí solo quién autorizó el enrolamiento, qué Constitución queda vinculada, cómo se establece la validez actual ni qué frontera rechaza una afirmación no reconocida. El canal telefónico candidato conserva el mismo límite: posible canal humano, no raíz técnica demostrada.

**Decisión operativa conservada:** primera creación de Continuity permanece `STOP`; no se elige la condición normativa pendiente por inferencia y no se crea una autoridad paralela.

## 2. Ataque por campo semántico

| Campo del contrato | Pregunta de falsación | Evidencia mínima exigible antes de declarar `ESTABLISHED` | Si falta |
|---|---|---|---|
| `genesisTrustReference` | ¿La referencia identifica una base gobernada real o solo un nombre/ID declarado por el caller? | Referencia vinculada al objeto y procedimiento aprobados, con origen verificable fuera de la afirmación del componente que pide confianza. | `UNKNOWN`; no resolver referencia por conveniencia ni crear identidad universal. |
| `rootAuthorityBasis` | ¿Qué hace legítima la base y por qué esa legitimidad no depende del propio Nexo/archivo que intenta establecer? | Regla normativa explícita más procedimiento de reconocimiento independiente del objeto candidato. El procedimiento concreto sigue pendiente. | `UNKNOWN`; firma/hash/archivo local no bastan por sí solos. |
| `constitutionBinding` | ¿Está ligado el contenido constitucional exacto aprobado o solo una etiqueta/versión seleccionada por un caller? | Vinculación inequívoca al contenido exacto y a la decisión de aprobación correspondiente, sin confundir aprobación humana con enforcement técnico. | `INVALID` si contradice la vinculación requerida; `UNKNOWN` si no puede verificarse. |
| `integrityContext` | ¿Las mediciones o afirmaciones de integridad provienen de una fuente adecuada al modelo de amenazas, o solo de software candidato? | Identificar qué hechos de integridad son realmente necesarios, su fuente y sus límites. No exigir ni inventar medición de arranque sin amenaza que la justifique. | `UNKNOWN` cuando el hecho sea necesario y no esté disponible. |
| `independenceContext` | ¿El verificador o fuente de confianza depende del mismo dispositivo, cuenta, store o código cuya autoridad intenta reconocer? | Mapa explícito de dependencias y dominios de fallo; justificar qué independencia es suficiente para el modelo de amenazas aceptado. | `UNKNOWN`; no declarar independencia a partir de separación nominal. |
| `validityContext` | ¿Cómo se determina vigencia, revocación, sustitución y recuperación sin que un snapshot antiguo se certifique a sí mismo? | Regla de vigencia/caducidad/revocación aplicable al alcance inicial y estado verificable de esa regla. Sucesión y recuperación avanzada siguen fuera del alcance inicial salvo decisión posterior. | `UNKNOWN` si la actualidad afecta legitimidad; nunca inferir vigencia por timestamp/epoch local. |
| `establishmentProvenance` | ¿La procedencia la emite la frontera que verifica la base o la declara el solicitante? | Evidencia protegida emitida por la frontera de reconocimiento, ligada a los campos y a la operación concretos. | Rechazar procedencia autodeclarada; resultado `UNKNOWN` o `INVALID` según contradicción. |
| Resultado `ESTABLISHED | UNKNOWN | INVALID` | ¿Se preservan ausencia, error, contradicción y estado no evaluado como resultados distintos? | Tabla de transición completa y consumidores que no conviertan `UNKNOWN` en permiso, valor por defecto o inicialización silenciosa. | `STOP`; no escribir ni avanzar hacia efectos protegidos. |

Esta tabla es un instrumento de ataque documental; no afirma que el contrato o la implementación ya satisfagan esos requisitos.

## 3. Ataques transversales obligatorios

1. **Autenticidad ≠ legitimidad:** un objeto firmado correctamente puede haber sido firmado por una clave aún no legitimada, revocada o vinculada a contenido incorrecto.
2. **Integridad ≠ autoridad:** bytes íntegros y un archivo con formato válido no prueban permiso para crear Continuity.
3. **Aprobación humana ≠ enforcement:** una aprobación del contenido constitucional no demuestra que la frontera técnica la haya reconocido ni que la operación local concreta esté cubierta.
4. **Hardware ≠ ceremonia de enrolamiento:** la posesión de un dispositivo criptográfico no prueba quién lo enroló, bajo qué regla ni cómo se reconoce su clave.
5. **Persistencia ≠ estado actual:** snapshot, hash, revisión, epoch, timestamp o journal local no prueban por sí solos actualidad ni ausencia de rollback.
6. **Ausencia ≠ permiso:** la falta de Continuity no autoriza su creación; corrupción y error de lectura tampoco deben tratarse como ausencia.
7. **Separación nominal ≠ independencia:** otro módulo, archivo o proceso puede compartir dispositivo, cuenta, código, sistema operativo o autoridad de configuración.
8. **Bootstrap ≠ operación normal:** una operación explícita de primera creación no debe continuar en la misma invocación hacia admisión, PREPARED, dispatch, reconciliación o mutaciones de dominio sin un contrato separado que lo permita.
9. **Core portable ≠ proveedor elegido:** el contrato semántico no debe codificar una marca de hardware; un adaptador específico, si se elige en el futuro, debe demostrar cómo satisface el contrato sin redefinirlo.
10. **Recuperación ≠ segunda raíz oculta:** ningún artefacto de recuperación debe autenticar por sí mismo la base que lo autoriza.

## 4. Dependencias no resueltas que bloquean una conclusión

- La decisión normativa que cubre la primera creación del objeto local no está demostrada por la elección de alcance M0 A.
- La base independiente y el procedimiento de reconocimiento inicial siguen sin establecerse.
- El contrato STEP 7 requiere ataque adversarial adicional; no existe evidencia aquí de una implementación integrada que produzca `ESTABLISHED`.
- La frontera de Continuity y todos los consumidores deben probar que la existencia/formato del archivo no eleva autoridad ni permite efectos.
- La configuración de instancia y el path efectivo son inputs de una operación concreta; no debe inventarse una ruta universal.
- Quiescencia, exclusión de escritores y semántica de resultados ambiguos permanecen dependencias separadas.
- No se ha elegido ni configurado una YubiKey para Nexo; este documento no recomienda comprar, instalar o enrolar hardware.

## 5. Criterio de salida de este análisis

Este documento solo puede marcarse como análisis completado cuando las preguntas anteriores estén mapeadas a decisiones canónicas o evidencia identificada, no cuando se escriba código. Para cerrar el diseño se necesita, como mínimo:

1. decisión normativa explícita que cubra o excluya la primera creación local;
2. definición de la base independiente y del proceso de reconocimiento, sin autoridad paralela;
3. contrato de resultados y no-autorización para `UNKNOWN`/ausencia/corrupción/error;
4. mapa de consumidores y exclusiones verificables para Continuity;
5. modelo de amenazas y dependencias aceptado para evaluar independencia e integridad.

Solo después de cerrar diseño se puede solicitar autorización separada para implementación y pruebas. Esa autorización tampoco autoriza por sí sola efectos protegidos.

## 6. Estado canónico

- M0: `INCOMPLETO`.
- P-01 / P01-A / P01-G: `OPEN / UNKNOWN`.
- D0 / D1 / D2 / D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Genesis Trust Foundation: `DESIGN CANDIDATE — ATTACK REQUIRED`; no reconocida como base técnica.
- Raíz legítima: `PENDING / UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación de Continuity: `STOP`.
- Efectos protegidos: `STOP`.

Solo documentación. No se modificaron runtime, tests, workflows, configuración ni dispositivo; no se ejecutaron tests, CI o Actions.
