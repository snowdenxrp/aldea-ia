# NCS M0 — borrador de protocolo criptográfico de bootstrap de raíz (2026-10-19)

**Estado:** ESPECIFICACIÓN PROPUESTA; NO IMPLEMENTADA, NO VALIDADA EN HARDWARE  
**Misión:** M0  
**No cambia:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP.

## 1. Propósito y dependencia

Definir el protocolo de posesión de la llave para que la implementación posterior no invente codificación, nonce ni firma durante el desarrollo. Este borrador se apoya en el candidato externo PIV/NFC evaluado en [NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md](./NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md).

YubiKit documenta firma PIV con ECC P-256 y `SHA256withECDSA` desde una clave privada almacenada en la llave: https://developers.yubico.com/yubikit-android/piv/. Esto respalda la compatibilidad técnica del algoritmo con el candidato, pero no demuestra que el usuario tenga una llave ni que el flujo funcione en el POCO concreto.

## 2. Perfil criptográfico propuesto

- Algoritmo de clave: ECDSA sobre NIST P-256 / secp256r1.
- Firma: ECDSA con SHA-256 (`SHA256withECDSA`).
- Codificación de firma transportada: DER ASN.1 ECDSA signature, tal como la entrega la API PIV/JCA; el verificador rechaza codificaciones malformadas y no normaliza silenciosamente valores inválidos.
- Codificación de clave pública: SubjectPublicKeyInfo DER (SPKI).
- Fingerprint: `SHA-256(SPKI_DER)`, 32 bytes, representado como 64 dígitos hexadecimales minúsculos en el registro técnico. No calcularlo sobre el certificado completo ni sobre una representación textual PEM.
- Generación del desafío: 32 bytes aleatorios de un CSPRNG del entorno Android (`SecureRandom`), generados por el runtime, nunca suministrados por el caller ni por el modelo.
- Dominio de firma exacto, bytes ASCII y un byte NUL final de separador:

```text
NEXO-ROOT-BOOTSTRAP-V1\0 || challenge[32]
```

El firmante aplica SHA-256/ECDSA a esa secuencia exacta. No se firma JSON, texto hexadecimal del desafío, timestamp ni campos serializados por un caller.

## 3. Verificación y replay

1. Cargar el pin SPKI provisionado previamente por el procedimiento independiente; si falta, no coincide o su procedencia no está establecida, devolver UNKNOWN y STOP.
2. Generar exactamente 32 bytes nuevos mediante CSPRNG.
3. Construir el mensaje con el prefijo exacto y los 32 bytes del desafío.
4. Solicitar la firma a la llave física; no aceptar una firma que no se vincule al desafío activo.
5. Verificar con la clave pública fijada y ECDSA/SHA-256. Una firma matemáticamente inválida es INVALID; fallo de NFC, llave ausente, excepción, timeout o evidencia insuficiente es UNKNOWN.
6. Aceptar como máximo una respuesta para ese desafío dentro de la invocación activa. Un nuevo intento crea otro desafío. Nunca reutilizar una respuesta previa ni reintentar automáticamente un efecto por fallo de bootstrap.
7. Descartar el desafío y la respuesta tras la decisión; no escribirlos en el store de continuidad ni registrarlos en contexto del modelo.

Una firma válida sólo prueba posesión/control de la clave privada correspondiente al pin para el desafío actual. No demuestra que la provisión inicial fuese legítima, que el SO/aplicación estén íntegros, que la autoridad siga vigente ni que una acción esté autorizada.

## 4. Pin y provisión — requisito todavía abierto

El perfil anterior **no puede habilitarse** hasta que exista un procedimiento de provisión independiente del store de continuidad. El candidato debe establecer:
- cómo se genera la clave en la llave y se obtiene su clave pública;
- qué fuente independiente presenta el fingerprint y cómo se compara;
- cómo se evita que una reinstalación/snapshot elija un pin nuevo sin autorización;
- cómo se conserva la referencia externa y qué ocurre si se pierde;
- qué afirmación de integridad (si alguna) se verifica sobre la aplicación/dispositivo durante provisión.

Una nota física manuscrita podría servir como referencia fuera del store, pero no está aceptada todavía como ceremonia final ni prueba la integridad de la aplicación que presenta el fingerprint. No hay impresora requerida por diseño, pero la alternativa manual necesita controles contra error de transcripción y un procedimiento comprobable.

## 5. Matriz de pruebas antes de implementar

- Vector fijo de prueba con clave pública, mensaje, firma DER y resultado esperado; clave privada de fixture sólo en pruebas, jamás en el producto.
- Mensaje modificado, byte de desafío modificado, firma truncada, firma DER malformada, clave pública diferente y curva/algoritmo inesperado → rechazo.
- Desafío anterior repetido frente a un desafío nuevo → rechazo.
- CSPRNG falla, llave ausente, PIN cancelado/incorrecto, NFC interrumpido o API no disponible → UNKNOWN/STOP sin fallback a una clave software.
- Pin ausente, alterado o provisionado desde snapshot/store → UNKNOWN/STOP.
- Reinicio y reinstalación no crean un nuevo pin automáticamente.
- CI de las pruebas criptográficas y prueba física con llave + POCO, identificando SHA del código, modelo/versión del dispositivo, firmware de la llave y resultado bruto.

## 6. Separación obligatoria

Este protocolo sólo puede cubrir la prueba de posesión de la raíz. La cadena completa permanece:

`ROOT COMPOSITION` → `CURRENT AUTHORITY` → `AUTHORIZATION DECISION` → `PROTECTED EFFECT ADMISSION` → `EFFECT OUTCOME / RECONCILIATION`

No implementa ni sustituye la vigencia/revocación de autoridad, el alcance por acción/recurso ni el enforcement en la frontera real de efecto. Hasta que cada capa tenga evidencia propia, `authorization: NOT_EVALUATED` y efectos protegidos STOP.

## 7. Decisión pendiente

- Algoritmo/codificación: propuesta concreta para revisión, no aceptada como implementación.
- Fuente independiente del pin y ceremonia: pendiente.
- Hardware: candidato YubiKey 5 NFC/PIV, no seleccionado/adquirido/probado.
- Integración Android/YubiKit: no implementada.
- Vector de prueba: pendiente.
- CI/hardware real: pendiente.

No escribir aún el verificador de producción. El siguiente paso es cerrar el procedimiento de provisión independiente y confirmar disponibilidad física; después, congelar este perfil, crear el vector reproducible y diseñar las pruebas negativas antes de conectar el bootstrap al runtime.
