# Nexo M0 — gate de composición de la raíz de autoridad

Fecha: 2026-10-19  
Estado: **ALCANCE ACOTADO POR DECISIÓN POSTERIOR: UNA LLAVE RAÍZ; PROVISIÓN/PROTOCOLO/VERIFICACIÓN PENDIENTES; EFECTOS PROTEGIDOS STOP**.

## Por qué se abre este gate

El gate integrado de pruebas M0 pasó en [run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), SHA `c57be8aa6fd7e558d870c3e46feab741637b4314`. La inspección del runtime confirma, sin embargo, que la autorización del propietario no se evalúa. El test PASS demuestra los contratos implementados, no una raíz constitucional.

Esta nota **reutiliza** la investigación ya guardada. No vuelve a auditarla ni elige una clase de raíz por intuición.

## Evidencia histórica reutilizada

1. `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`: estado explícito `STOP BEFORE CODE`; no existe una trust foundation actual implementada que pueda establecer el contexto constitucional. Un constructor no puede ser su propia raíz.
2. `NEXO_NCS/BUILD/STEP_7_BOOTSTRAP_ROOT_CLASSES_FUTURE_COUNTEREFFECTS_ATTACK_2026-10-08.md`: ataque cerrado sin promover una única clase de raíz; hardware absolutista, servicio externo absolutista, autoridad humana irrestricta y quorum improvisado fueron rechazados. La composición de bootstrap sigue pendiente.
3. `docs/nexo/NEXO_AUTHORITY_FOUNDATION_BOOTSTRAP_NO_ROOT_DISASTER_RECOVERY_RESEARCH_V1_2026-09-24.md`: no-root debe ser un estado restringido; sin raíz válida no se publican claims autoritativos ni se ejecutan efectos protegidos dependientes de autoridad. La recuperación no puede depender sólo de la autoridad/estado que está recuperando.
4. `docs/nexo/AB105_077R_authorization_effective_permission_contract_2026-09-30.md`: identidad, policy, decisión de autorización y ejecución son capas distintas; una decisión guardada no autoriza automáticamente un efecto posterior.
5. `docs/nexo/AB105_078R_authorization_freshness_revocation_2026-09-30.md`: autorización válida en T0 no prueba autoridad vigente en T1; revocación solicitada no equivale a enforcement; si freshness/enforcement es UNKNOWN, resultado seguro = UNKNOWN/STOP.

## Decisión actual

**La decisión posterior NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md fija el alcance de primera fase en una llave criptográfica raíz y un dispositivo inicial.** Esto reemplaza la indecisión sobre el número de raíces, pero no selecciona un modelo físico, protocolo, provisión, verificador ni fuente independiente de la prueba. No se afirma que la llave ya exista o esté configurada, ni que la autoridad se evalúe en runtime. Teléfono y biometría no se promueven a raíz por defecto; no se elige quórum ni servicio externo sin evidencia.

La siguiente capa de arquitectura debe separar (la selección de una única llave acota el diseño, pero no fusiona estas responsabilidades):

`ROOT COMPOSITION` → `CURRENT AUTHORITY` → `AUTHORIZATION DECISION` → `PROTECTED EFFECT ADMISSION` → `EFFECT OUTCOME / RECONCILIATION`

Ninguna flecha se presume por nombre, proximidad, mismo archivo, estado `planned`, capacidad de ejecutar, firma aislada, o éxito de una prueba distinta.

## Contrato de composición pendiente

Antes de escribir código, una decisión revisable debe contestar, con evidencia y no sólo nombres de campos:

1. **Clases de raíz permitidas:** cuáles pueden participar en el bootstrap, qué afirmación puede respaldar cada una y cuáles se excluyen. No promover una clase a autoridad universal.
2. **Independencia:** qué dependencia común invalidaría la composición; la raíz no puede derivarse exclusivamente del store Nexo, del modelo, del teléfono actual o del estado que se está recuperando.
3. **Composición y conflicto:** cómo se determina que las pruebas requeridas forman una base suficiente; qué pasa con raíces concurrentes, incompatibles, obsoletas o sin orden de precedencia. No inventar mayoría/último timestamp/credencial más reciente.
4. **Scope:** qué autoridad establece la composición y qué no puede autorizar; recuperación no puede convertirse en super-root ni ampliar silenciosamente permisos.
5. **Currentness y revocación:** cómo se prueba que la autoridad sigue vigente al llegar a la puerta final de dispatch; cómo STOP y revocación cercan trabajo obsoleto.
6. **Recuperación sin dispositivos previos:** demostrar cómo el propietario legítimo se puede volver a reconocer después de perder todos los teléfonos y reinstalar Nexo, sin convertir una copia restaurada en su propia autoridad.
7. **No-root / ambiguity:** sin composición suficiente, raíz desconocida o conflicto ⇒ `AUTHORITY_UNAVAILABLE / UNKNOWN / STOP`; no dispatch protegido, no publicación autoritativa y no elevación automática.
8. **Separación de garantías:** raíz legítima no prueba enforcement; decisión de autorización no prueba que el efecto ocurrió; settlement no prueba que el propietario autorizó la operación.

## Límites explícitos

- No implementar `createConstitutionAuthorityContext(input)` como constructor de confianza.
- No mapear `authorization: "NOT_EVALUATED"` a ALLOW.
- No usar el dispositivo/biometría como autoridad única. Pueden ser evidencias o canales, si un contrato posterior lo demuestra.
- No mezclar Lúmina ni el runtime legacy con la raíz de Nexo.
- No activar sucesión de la hija en este gate. Es una capacidad futura separada y requiere su propio modelo técnico/legal.
- No reabrir AB/P audits cerrados; consultar su evidencia congelada y registrar sólo las dependencias que sigan abiertas.

## Condición de salida de este gate

El gate sólo puede pasar a diseño de implementación cuando exista:
- una composición de raíz concreta que satisfaga los requisitos anteriores;
- evidencia independiente para verificarla;
- una política de recuperación, revocación y conflicto;
- casos de prueba adversariales para pérdida total de dispositivos, raíces contradictorias, root unavailable, rollback y STOP;
- una delimitación explícita entre operaciones locales no protegidas y efectos protegidos.

Si falta cualquiera de las bases, el resultado correcto es `PENDING/UNKNOWN`, no una implementación simulada.

## Estado final de este checkpoint

- Gate de regresión M0: PASS en los SHAs probados, incluido el PASS posterior de npm test registrado en el checkpoint de continuidad.
- Admisión de autoridad en runtime: NO IMPLEMENTADA / `NOT_EVALUATED`.
- Raíz constitucional / composición de bootstrap: PENDING.
- Efectos protegidos: STOP.
- M0 global: INCOMPLETO.


## Addendum de continuidad — alcance de raíz acotado (2026-10-19)

La decisión NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md posterior a esta nota fija una llave criptográfica raíz y un dispositivo inicial. Debe leerse como una reducción de alcance, no como implementación ni como promoción de una raíz ya verificada. Las frases anteriores que dejaban abierto el número de raíces quedan superadas en ese punto; siguen pendientes el tipo físico, el protocolo de prueba, la provisión inicial independiente, la verificación y el enforcement en el último límite antes de un efecto.

**Próximo paso acotado:** especificar el contrato mínimo de provisión y verificación de esa única llave, reutilizando el contrato semántico existente. No reabrir comparación general de familias, no crear un root de software que se autentique a sí mismo y no cambiar authorization: NOT_EVALUATED ni STOP.
