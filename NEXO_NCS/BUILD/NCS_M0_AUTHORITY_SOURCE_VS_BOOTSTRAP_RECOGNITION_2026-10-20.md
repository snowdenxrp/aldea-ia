# NCS M0 — Separación de autoridad constitucional y base técnica de bootstrap
Fecha: 2026-10-20
Rama: `ncs-clean-architecture`
Tipo: reconciliación de decisiones previas + siguiente puerta de diseño. No modifica runtime ni autoriza activación.

## Decisión previa que debe preservarse
No debe describirse el problema como si la identidad de la autoridad constitucional estuviera completamente sin decidir. La continuidad previa registra que la autoridad constitucional inicial es la del propietario humano, Kevin, expresada en la Constitución. El bootstrap técnico materializa y transmite evidencia de esa autoridad; no la crea ni se convierte en soberano.

Esta distinción no equivale a que Nexo ya pueda verificarla. La autoridad normativa puede estar definida conceptualmente mientras la ruta técnica que reconoce esa autoridad sigue sin demostrarse.

## Tres capas distintas

1. **Fuente normativa de autoridad — definida conceptualmente:** el propietario humano expresa la autoridad constitucional en la Constitución. Ningún modelo, proveedor, OS, dispositivo, aplicación, almacén, hash o clave puede sustituirlo como fuente soberana.
2. **Supuesto limitado de commissioning — aceptado como dirección de diseño (2026-10-12):** comparación reconocida por el humano, fuera de la ruta de presentación candidata de Nexo/teléfono, ligada al contenido exacto de la Constitución inmutable y a un propósito/alcance explícito. Esta aceptación es una categoría de supuesto, no selección de un mecanismo concreto.
3. **Reconocimiento técnico verificable y enforcement — no demostrado:** siguen sin elegirse el procedimiento concreto de comparación, la procedencia del verificador, el propietario del estado constitucional activo, la verificación de vigencia/revocación/sucesión y la frontera final protegida que impida bypass.

Por tanto, la frase precisa no es «no sabemos quién es la autoridad constitucional», sino: **la fuente normativa está definida conceptualmente; la forma técnica de reconocer su manifestación y mantenerla vigente no está resuelta ni implementada de manera demostrable.**

## Contratos existentes reutilizados
- `STEP_7_MINIMUM_REAL_BOOTSTRAP_ROOT_BASIS_2026-10-08.md`: relación `EXTERNAL_OR_INDEPENDENT_BOOTSTRAP_BASIS → GENESIS_TRUST_BUNDLE → NEXO_TRUST_CONTEXT`; requiere independencia, provenance protegida, currentness/revocación/sucesión y recuperación independiente.
- `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`: composición por claim, sin inferir independencia ni escoger una raíz automáticamente; insuficiencia = UNKNOWN.
- `STEP_7_GENESIS_TRUST_FOUNDATION_CONTRACT_ATTACK_2026-10-08.md`: ataques a genesis autocertificado, store como raíz, provider-root, hash-as-trust, firma histórica como currentness, measured-boot excesivo, recuperación autorraíz y common-mode; diseño sobrevive, implementación bloqueada.
- `STEP_7_CURRENT_PHONE_CANDIDATE_THREAT_MODEL_2026-10-08.md`, sección 9: la comparación humana fuera de banda fue aceptada sólo como supuesto limitado; mecanismo concreto sigue UNSELECTED/UNKNOWN y no autoriza implementación.

No se crea un contrato paralelo ni se repiten los ataques ya cerrados.

## Requisitos mínimos del procedimiento concreto aún por resolver
Antes de escribir un verificador o un constructor de Constitution Authority Context, el procedimiento debe contestar con evidencia comprobable:

1. **Objeto exacto:** cómo se fija la versión/contenido inmutable de la Constitución y se vincula el commissioning a esos bytes/contenido, no sólo a un nombre, versión declarada o botón de aprobación.
2. **Comparación humana:** qué canal preexistente permite al propietario reconocer y comparar el contenido fuera de la misma ruta candidata que lo presenta o ejecuta. No asumir impresora, segundo dispositivo, hardware, proveedor o credencial no elegidos.
3. **Provenance:** qué frontera genera evidencia de que la comparación ocurrió; la aplicación que solicita aprobación no puede certificar por sí sola su legitimidad.
4. **Frescura y scope:** cómo se liga la aprobación a propósito, alcance, contexto y revisión exactos; un consentimiento anterior no se hereda automáticamente tras cambios.
5. **Estado canónico:** quién mantiene la Constitución activa y cómo se detectan conflictos, revisión obsoleta, revocación y sucesión sin confiar en una copia restaurada.
6. **Dominios de fallo:** dependencias compartidas entre canal de comparación, dispositivo, cuenta/recuperación, proveedor, almacenamiento y verificador; no llamar independiente a dos aplicaciones que comparten la misma raíz.
7. **Pérdida y recuperación:** qué ocurre al perder todos los dispositivos, revocar credenciales o cambiar el mecanismo; la recuperación no puede legitimarse a sí misma.
8. **Enforcement:** qué frontera concreta consume esa evidencia y bloquea el efecto si falta, es contradictoria, está obsoleta o no puede verificarse.

La lista es una puerta de diseño, no afirmación de que estas capacidades existan. Si un punto crítico permanece UNKNOWN, no se promueve a ESTABLISHED.

## Decisiones no autorizadas
- No elegir YubiKey, TPM, hardware, proveedor externo, quorum, múltiples humanos o múltiples credenciales por inferencia.
- No convertir el teléfono actual, ChatGPT, Termux, una sesión, un hash o una clave generada por Nexo en raíz por sí mismos.
- No implementar `createConstitutionAuthorityContext`, un verificador wrapper, una raíz de runtime, registro de confianza, almacén, UI de aprobación ni activación protegida todavía.
- No cambiar la arquitectura de Chronicle/Continuity ni reabrir auditorías cerradas de locks/persistencia.
- No ejecutar AB/TLC/Kafka congelados como parte de esta inspección documental.

## Siguiente acción M0
Realizar una revisión acotada de los artefactos constitucionales existentes para identificar si ya existe un objeto de Constitución canónico, inmutable y con revisión/hash explícitos que pueda servir como objeto exacto de comparación. Verificar el archivo fuente real y su estado en la rama; no inferirlo a partir de nombres o documentos de diseño. Si existe, documentar el vínculo que sí está probado y las brechas restantes. Si no existe, registrar ese prerrequisito concreto. No implementar aún el canal de comparación.

## Estado
- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Fuente normativa conceptual: propietario humano expresado en la Constitución.
- Procedimiento técnico de reconocimiento/provenance/currentness: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- No hubo cambio de runtime ni ejecución nueva de CI.


## Precedencia posterior — decisión de alcance 2026-10-19

Esta nota distingue correctamente la fuente normativa de la base técnica, pero su sección “Siguiente acción M0” **no es la prioridad operativa inmediata**. La decisión más reciente `NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md` ya limita el alcance inicial a una llave raíz y un dispositivo, deja la selección física/provisión/verificación pendientes y ordena continuar M0 por la coherencia entre misión persistida, estados de pasos y reconstrucción/proyección.

Por tanto, no continuar ahora una investigación general de raíz ni revisar el objeto constitucional como sustituto del trabajo M0. La raíz/bootstrap queda como restricción arquitectónica documentada; la próxima tarea es la revisión de consumidores y del contrato de discrepancia de mission-status, registrada en `NCS_M0_MISSION_STATUS_COHERENCE_CI_REVIEW_2026-10-20.md`. Esta precedencia no convierte la raíz física en implementada ni altera STOP/UNKNOWN.
