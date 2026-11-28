# NCS M0 — Ratificación de decisiones reservadas P07-A / P05-O6 / cleanup / residuos

**Fecha:** 2026-11-27  
**Tipo:** Decisión expresa del propietario  
**Estado:** RATIFICADO EN EL ALCANCE INDICADO  
**Base:** `NCS_M0_P07_A_P05_O6_OWNER_DECISION_SHEET_2026-11-27.md`  
**Contrato:** P07 V2.2 + V2.3 ratificado el 2026-11-27; P05-C ratificado previamente.

## 1. Declaración del propietario

Después de recibir la recomendación técnica consolidada A / A / A+B / A, el propietario respondió:

> «Si estás tiemblen de acuerdo acepto»

En contexto, esta respuesta acepta expresamente la combinación recomendada de las cuatro decisiones de la hoja. La recomendación técnica fue confirmada por el asistente. Se registra, por tanto, la ratificación del propietario en los términos siguientes.

## 2. Decisiones ratificadas

### D1 — P07-A: aliases y dominio de admisión — Alternativa A

Se adopta para M0 una política estricta de raíz única:
- Una sola raíz explícita y aprobada constituye el dominio de admisión.
- Symlink en componentes de resolución protegida, bind mount/alias de montaje, ruta alternativa o resolución ambigua no quedan aceptados por defecto; producen STOP/UNKNOWN salvo clasificación expresa posterior.
- Hardlinks de archivos se mantienen como clase distinta; no se equiparan a alias de raíz ni se presume hardlink de directorio.
- No se infiere identidad estable a partir de igualdad textual de paths ni de una observación aislada de `(st_dev, st_ino)`.

Esta decisión no elige ni ratifica la raíz constitucional. P01/P02 permanecen aplicables.

### D2 — P05 O6 / G5: autoridad y procedimiento de reclasificación — Alternativa A

Se adopta revisión manual del propietario por incidente:
- Ningún proceso, lock, PID, token, TTL, timestamp ni ausencia de archivo puede reclasificar por sí solo UNKNOWN/BLOCKED.
- Cada incidente requiere expediente de evidencia que incluya identidad de objetos/namespace, causa del bloqueo, estado de procesos y ventana R1, residuos, atribución APP-OWNER, SHA exacto y límites de verificación.
- La transición requiere decisión expresa del propietario registrada antes de cualquier readmisión o cleanup.
- Si falta evidencia, existe incertidumbre o no hay decisión expresa, permanece BLOCKED/UNKNOWN.

No se autoriza recuperación automática ni se concede autoridad autónoma al mecanismo.

### D3 — P07-B/C: APP-OWNER para cleanup de temporales propios — Alternativas A+B

Se adopta atribución estricta por operación y retención como fallback:
- APP-OWNER debe vincular el objeto exacto con una operación admitida y con el rol/lifecycle del objeto.
- Debe distinguirse de FS-OWNER (UID/GID/mode/ACL/permissions).
- Token, nombre, PID, antigüedad, hash o propiedad filesystem aislados no bastan.
- Si no se demuestra atribución e identidad del objeto realmente afectado, se conserva el residuo y el estado permanece UNKNOWN/BLOCKED.
- Tras error ambiguo, terminación o crash, no se autoriza cleanup automático por inferencia.

### D4 — Residuos y acumulación — Alternativa A

Durante M0:
- Los residuos ambiguos se retienen indefinidamente.
- No se autoriza TTL, borrado por antigüedad, cuota ni purga automática.
- Si la acumulación amenaza el espacio disponible, se detiene la operación y se solicita revisión del propietario; la presión de almacenamiento no crea autoridad de cleanup.
- La readmisión permanece bloqueada mientras el residuo afecte la identidad o namespace protegido.

## 3. Límites y no inferencias

Esta ratificación:
- Fija política y autoridad para las cuatro decisiones indicadas; no demuestra implementación ni enforcement.
- No selecciona flock, fcntl/OFD, dirfd/openat2, SQLite, marker, tombstone, epoch, journal, daemon, hardlink ni ninguna otra primitiva.
- No demuestra que B2 replacement-safe cleanup ni B3 durable BLOCKED estén satisfechos.
- No resuelve por sí sola la raíz constitucional P01/P02.
- No declara COVERED a RAW-1 ni a ningún actor sin evidencia efectiva de admisión/exclusión.
- No cierra P05, P07, P09, O7, O8, O9, E2 ni E3.
- No cambia `authorization: NOT_EVALUATED`.
- No autoriza implementación fuera de las autorizaciones M0 previamente vigentes, ejecución Termux/POCO, bootstrap, publicación, cleanup, readmisión, commissioning ni efectos protegidos.
- No levanta STOP.

## 4. Consecuencias obligatorias para diseño y evidencia

1. Todo alias no clasificado debe quedar STOP/UNKNOWN; la implementación no puede ampliar silenciosamente el dominio de raíz.
2. Toda salida de BLOCKED requiere expediente y decisión manual expresa del propietario por incidente.
3. Cleanup requiere APP-OWNER e identidad del objeto afectado demostrados en el seam real; si no, retener.
4. No hay purga automática ni readmisión por antigüedad, PID, lock ausente, ENOENT o presión de almacenamiento.
5. Las pruebas futuras deben separar harness_verdict, result_class y product_state; ningún PASS de harness sustituye evidencia de producto ni autoriza PASS_GATE por sí solo.

## 5. Estados de gates conservados

- P07-A: política de aliases ratificada; implementación/evidencia pendiente.
- P07-C: UNKNOWN/BLOCKING.
- P05-C: política ratificada; P05 permanece OPEN.
- O6/G5: política de autoridad ratificada; implementación/evidencia de reclasificación pendiente.
- O7: UNKNOWN/OPEN; cobertura RAW-1/enforcement no demostrado.
- P09: OPEN/UNKNOWN.
- O8: UNKNOWN.
- O9: PARTIAL.
- E2/E3: PARTIAL.
- CI exact-SHA: no demostrado como evidencia de cierre.
- `authorization: NOT_EVALUATED`.
- Commissioning y efectos protegidos: STOP.
- NCS M0: INCOMPLETE.

**Resultado:** DECISIONES DEL PROPIETARIO A / A / A+B / A RATIFICADAS Y REGISTRADAS. LOS GATES TÉCNICOS PERMANECEN ABIERTOS.
