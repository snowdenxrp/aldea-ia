# NCS M0 — factibilidad de una raíz criptográfica externa en Android (2026-10-19)

**Estado:** CANDIDATO TÉCNICAMENTE VIABLE; NO SELECCIONADO NI PROBADO EN EL DISPOSITIVO REAL  
**Misión:** M0  
**No cambia:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP.

## Conclusión ejecutiva

La ruta externa mejor respaldada por la documentación oficial revisada es **una llave física con PIV y NFC, usando YubiKit para Android**, por ejemplo YubiKey 5 NFC. Esto es una **opción candidata**, no una selección ni una afirmación de que el usuario ya tenga el hardware. No se debe comprar ni implementar nada automáticamente a partir de este documento.

La documentación oficial de Yubico confirma:
- YubiKey 5 NFC puede autenticarse mediante NFC en Android: https://developers.yubico.com/Mobile/Android/
- YubiKit tiene módulos Android y PIV para operaciones criptográficas de firma con una clave privada almacenada en la llave; el ejemplo usa ECC P-256 y `SHA256withECDSA`: https://developers.yubico.com/yubikit-android/piv/
- El código de ejemplo de PIV muestra que la firma se calcula en el dispositivo de llave y no requiere exportar la clave privada: https://github.com/Yubico/yubikit-android/blob/main/piv/README.adoc

## Lo que esta evidencia demuestra y lo que no

**Demuestra:** existe una biblioteca oficial para que una aplicación Android se comunique con una llave compatible por NFC/USB y solicite operaciones PIV de firma.

**No demuestra:**
- que el usuario haya adquirido una llave;
- que la combinación concreta POCO X7 Pro + firmware de llave + política PIN/touch funcione sin incidencias;
- que Nexo tenga ya integración Android/YubiKit;
- que el fingerprint de la clave pública esté provisionado independientemente del store de continuidad;
- que la aplicación, Android o el estado de autoridad estén íntegros;
- que una firma de posesión autorice por sí sola cualquier acción.

Hay incidencias públicas recientes sobre operaciones PIV por NFC y políticas de touch en ciertas combinaciones de Android/YubiKey; por ello la compatibilidad debe probarse en el dispositivo real antes de declarar PASS: https://github.com/Yubico/yubikit-android/issues/360

## Ceremonia candidata para diseñar, no ejecutar aún

Cuando exista una llave física compatible, especificar y probar una única ceremonia reproducible:

1. Generar la clave de firma dentro de la llave, no importar una clave privada desde el store de Nexo. Definir el slot PIV y política PIN/touch después de confirmar compatibilidad.
2. Exportar sólo la clave pública/certificado y calcular su fingerprint canónico.
3. Establecer el fingerprint mediante un registro fuera del store de continuidad —por ejemplo, un registro físico escrito y comprobado durante la provisión— y documentar exactamente qué app/medio mostró el fingerprint y cómo se comprobó. No aceptar el fingerprint que aparezca por primera vez en un snapshot restaurado.
4. En arranque, generar un desafío criptográficamente fresco y firmado con separación de dominio; verificar la firma contra el fingerprint previamente establecido.
5. Probar ausencia de llave, PIN fallido, firma incorrecta, replay, fingerprint alterado, reinicio/restauración y resultado de NFC ambiguo. Un fallo o falta de evidencia mantiene UNKNOWN/STOP.
6. Mantener separadas la prueba de posesión, la vigencia/revocación de autoridad, la decisión de autorización y la admisión del efecto.

Un registro escrito manualmente podría evitar la necesidad de impresora, pero su formato, control de errores y procedimiento de comparación aún deben diseñarse y probarse. No se afirma que ese paso, por sí solo, resuelva la integridad del sistema operativo o del programa que muestra el fingerprint.

## Alternativa que no se acepta por defecto

Android Keystore puede usar claves respaldadas por TEE/StrongBox, pero Android exige comprobar la propiedad real mediante `KeyInfo`/attestation; la disponibilidad de StrongBox varía por dispositivo. No hay evidencia de que el POCO X7 Pro concreto proporcione StrongBox para el algoritmo requerido ni se ha medido su nivel de seguridad. Por tanto, no reemplazar la llave externa por una clave software/Keystore basándose únicamente en que el teléfono usa Android 16.

Fuentes oficiales:
- Android Keystore: https://developer.android.com/privacy-and-security/keystore
- Key attestation y niveles `TrustedEnvironment` / `StrongBox`: https://source.android.com/docs/security/features/keystore/attestation

## Puerta para salir del bloqueo

Antes de código de producción hacen falta:
- disponibilidad real de la llave física y confirmación de compatibilidad NFC en el POCO;
- procedimiento independiente de pin/fingerprint acordado y reproducible;
- algoritmo y codificación canónica fijados, con vector de firma/verificación;
- implementación Android mínima que use la llave y mantenga privada la clave;
- pruebas negativas de frescura, replay, clave ausente, pin alterado y fallo/ambigüedad de NFC;
- evidencia CI y prueba en hardware real; y, por separado, enforcement de autoridad vigente en la última frontera antes del efecto.

**Próximo paso:** conservar YubiKey 5 NFC + PIV/NFC/YubiKit como candidato técnico principal, sin afirmar selección o disponibilidad. No hay motivo para volver a comparar familias en general. Si no se dispone del hardware, continuar con contratos y pruebas que no requieran root real, pero mantener el bloqueo constitucional.

## M0 — perfil criptográfico de bootstrap redactado, pendiente de provisión (2026-10-19)

- Borrador: [NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md](./NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md).
- Se propone un perfil preciso para revisión: P-256/ECDSA-SHA256, SPKI DER con fingerprint SHA-256, desafío CSPRNG de 32 bytes y mensaje con dominio `NEXO-ROOT-BOOTSTRAP-V1\0`. Es especificación documental, no código ni vector validado.
- El pin/fingerprint independiente sigue sin ceremonia aceptada; hardware candidato no adquirido/probado. No escribir aún el verificador de producción ni conectar la firma a dispatch.
- Próxima puerta: cerrar provisión del pin, confirmar disponibilidad/compatibilidad de hardware, crear vector criptográfico reproducible y pruebas negativas; después CI y prueba física. M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.

