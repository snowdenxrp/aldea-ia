# NCS M0 — bloqueo de provisión independiente de la raíz (2026-10-19)

**Estado:** BLOQUEADO POR FALTA DE FUENTE/PROCEDIMIENTO DEMOSTRADO  
**Misión:** M0  
**No cambia:** `M0 = INCOMPLETO`, `authorization = NOT_EVALUATED`, efectos protegidos = `STOP`.

## 1. Pregunta concreta

¿Existe en el entorno actualmente evidenciado un procedimiento real que permita establecer el fingerprint de la única llave raíz **independientemente** del store de continuidad que Nexo pretende validar?

**Respuesta con la evidencia disponible: todavía no está demostrado.** Esto no afirma que tal procedimiento no pueda existir; afirma que no hay fuente, medio ni ceremonia concretos seleccionados y verificables en el estado actual del proyecto.

## 2. Hechos conservados

- La decisión de una llave raíz y un dispositivo inicial está aceptada como alcance, no como implementación: [decisión de alcance](../DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md).
- El borrador semántico de autoridad exige una provisión independiente, prueba de posesión con desafío fresco y enforcement en la última frontera: [contrato semántico, sección 9](./NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md).
- No hay evidencia en el repositorio de una llave física seleccionada, adquirida, provisionada o configurada; tampoco de un fingerprint real cuya procedencia independiente se haya verificado.
- El teléfono candidato, el sistema operativo, el modelo, una cuenta de proveedor, el repositorio GitHub, un snapshot restaurado o el propio store de continuidad no se convierten automáticamente en raíz confiable. Ninguno está demostrado aquí como canal independiente de provisión.
- La prueba criptográfica de posesión no corrige una provisión inicial no confiable: sólo demuestra control de la clave privada correspondiente al pin que ya se confía.
- La evidencia CI del runtime y del settlement no cambia el estado de autoridad; valida contratos de software, no identidad del propietario ni procedencia del pin.

## 3. Decisión operativa

No seleccionar hardware por inferencia ni implementar un verificador que acepte un pin autoprovisionado desde el mismo estado que pretende autenticar.

Hasta que la fuente independiente y su procedimiento sean concretos y reproducibles:

- composición de raíz: `UNKNOWN / NOT ESTABLISHED`;
- autoridad del propietario: `NOT_EVALUATED`;
- dispatch de efectos protegidos: `STOP`;
- M0: `INCOMPLETO`.

No crear una raíz de software que se autentique a sí misma, un mock `AUTHORIZED`, una nueva cuenta como autoridad, ni un flujo de recuperación desde snapshots. No añadir infraestructura de persistencia para esconder esta brecha.

## 4. Puerta de salida del bloqueo

El bloqueo sólo se puede cerrar con evidencia concreta de todos los puntos siguientes, no sólo con una propuesta:

1. Fuente/canal independiente identificado y disponible.
2. Procedimiento de provisión y comparación del fingerprint que no dependa del store de Nexo ni de una afirmación del caller.
3. Clave y algoritmo concretos, con vector reproducible de firma/verificación.
4. Desafío fresco y pruebas negativas de replay, pin alterado, clave ausente y firma inválida.
5. Comprobación de autoridad vigente/revocación y prueba de enforcement en la frontera real antes del efecto.
6. Regresiones adversariales y CI observado en el SHA exacto.

Si no se puede demostrar el punto 1, no procede implementar los puntos posteriores como si la raíz ya fuese confiable.

## 5. Siguiente acción M0

Mantener el bloqueo visible en `STATUS.md` y en el handoff. El siguiente avance válido será aportar evidencia de un canal de provisión independiente disponible o registrar una nueva restricción concreta que permita evaluarlo. No repetir la comparación general de familias criptográficas; no reabrir M1 ni STEP 7.


## Addendum — candidato técnico identificado, sin disponibilidad ni prueba (2026-10-19)

La revisión de fuentes oficiales identifica una ruta candidata concreta: **llave física con PIV/NFC usando YubiKit para Android**, con YubiKey 5 NFC como ejemplo compatible según documentación de Yubico. Esto reduce la incertidumbre técnica, pero **no cierra el bloqueo**: no hay evidencia de adquisición, integración en Nexo ni prueba en el POCO X7 Pro. Tampoco existe aún un fingerprint provisionado independientemente del store de continuidad.

Evaluación y fuentes: [NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md](./NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md).

No seleccionar automáticamente el hardware, no instalar dependencias ni generar código de integración antes de confirmar disponibilidad y compatibilidad real. Android Keystore/StrongBox tampoco se presume disponible: requiere verificar attestation/nivel de seguridad en el dispositivo concreto. M0 sigue INCOMPLETO, autoridad NOT_EVALUATED y efectos protegidos STOP.

