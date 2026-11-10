# NCS M0 — Diseño independiente de solución P05/P07-C

**Autor de la entrega:** Qwen  
**Fecha de registro:** 2026-11-10  
**Tipo:** Diseño documental independiente  
**Estado:** Propuesta no decisional

> **Nota de integridad de esta copia:** el contenido se consolidó a partir de las partes que el usuario transmitió en el chat. Algunas tablas, diagramas y transiciones llegaron fragmentados o incompletos. Se organizaron los fragmentos disponibles sin completar por inferencia los pasajes ausentes. Esta copia no certifica que reproduzca la totalidad del documento original de Qwen.

---

## 1. Objeto y alcance

El documento presenta un diseño independiente para P05/P07-C. La arquitectura A no puede prometer prevención coercitiva absoluta. Bajo R1, muchos controles no evitan el ataque; lo hacen visible, inválido para consumidores correctos, o provocan fallo cerrado.

El diseño separa:
- Sobre de admisión AA.
- Verificador VR.
- Autoridad normativa, evidencial y procedimental, no coercitiva por sistema operativo bajo R1.

La propuesta busca:
- Detección criptográfica y documental.
- Fallo cerrado ante evidencia incompleta.
- Trazabilidad verificable.
- Autoridad procedimental y evidencial.
- Bloqueo operativo si el verificador se usa como puerta de aceptación.

Para mantener el documento autocontenido, Qwen adopta una lectura funcional de O1–O9. Si existiera una numeración normativa distinta, la matriz de trazabilidad deberá re-mapearse sin necesidad de cambiar la arquitectura propuesta.

## 2. Modelo de confianza y actores

### 2.1 Actores considerados

| Actor | Descripción |
|---|---|
| A0 | Operador honesto que comete errores accidentales. |
| A1 | Adversario externo con acceso posterior a copias, backups o archivos en frío. |
| A2 | Proceso local malicioso o defectuoso dentro del mismo HOME/UID de Termux. |
| A3 | Adversario con privilegios superiores al sandbox de la app o compromiso del dispositivo. |
| A4 | Ataque de ingeniería social contra el operador. |

### 2.2 Supuesto crítico

Bajo R1, A2 es el adversario más relevante para O2, O3 y autoridad de admisión. Un escritor antiguo, si tiene acceso al mismo HOME, puede leer, copiar, alterar o intentar sustituir archivos. Por tanto, ningún mecanismo puramente local dentro del mismo HOME puede garantizar prevención total contra A2.

## 3. Arquitectura A: Admisión Forense con Ancla de Testigo

**Nombre interno:** AFA-W — Admission Forensic Architecture with Witness Anchor.

La arquitectura no se basa en confiar en un lock, un token o un hash suelto. Se basa en separar el sobre de admisión AA y el verificador VR.

Bajo R1, la autoridad es normativa, evidencial y procedimental, no coercitiva por sistema operativo. Si un escritor malicioso controla el mismo HOME, puede intentar falsificar, alterar o puentear archivos, pero no podrá hacer que un VR correcto acepte el objeto si faltan firmas válidas, secuencia válida, namespace válido y ausencia de BLOCK.

### 3.1 Sobre de admisión

Sin AdmissionEnvelope válido, ningún objeto es canónicamente válido.

Campos recibidos para AdmissionEnvelope:

| Campo | Descripción |
|---|---|
| object_digest | Digest del objeto. |
| namespace_id | Identificador de namespace. |
| namespace_manifest_digest | Digest del manifiesto del namespace. |
| writer_key_fp | Fingerprint de la clave del escritor. |
| epoch | Época o generación. |
| admission_seq | Secuencia de admisión. |
| policy_hash | Hash de política. |
| p07c_status | Estado P07-C. |
| expires_at_logical | Expiración lógica. |
| signature_AA | Firma de AA. |

La identidad lógica opcional se expresa como (namespace_id, name, epoch).

### 3.2 Autoridad y verificación

- El operador humano ejecuta manualmente el flujo.
- VR es el último componente que acepta o rechaza.
- La autoridad de admisión es normativa/evidencial bajo R1.
- Sin AdmissionEnvelope válido, ningún objeto es canónicamente válido.

## 4. Flujos principales

Los fragmentos recibidos describen los siguientes controles de flujo:

- AA opera en primer plano manual.
- Se genera un draft y una declaración.
- Se calcula object_digest.
- Se valida la política y el estado P07-C.
- Se valida el escritor vigente.
- Se añade una entrada al journal.
- Se genera witness_digest.
- Se imprime o exporta el witness fuera de línea.
- Se exige re-admisión para un escritor vigente.
- Se rechaza cualquier objeto nuevo firmado por writer_key_fp revocada.
- Se rechaza AdmissionEnvelope que referencie un epoch antiguo.

### 4.1 Flujo de verificación de identidad

VR recibe objeto + namespace y:
1. Canonicaliza el objeto.
2. Recalcula object_digest.
3. Compara con AdmissionEnvelope.
4. Verifica firma AA.
5. Verifica writer_key_fp vigente.
6. Verifica namespace_id fingerprint.
7. Verifica namespace manifest digest.
8. Resuelve (namespace_id, name, epoch).
9. Detecta ambigüedad si hay múltiples candidatos.
10. Falla cerrado si hay conflicto.

## 5. Respuestas y propiedades de identidad

### 5.1 Canonicalización e identidad de objeto

Elementos recibidos:
- Canonicalización determinista.
- Hash del objeto canónico.
- Firma del escritor si aplica.
- Contrafirma de AA vinculando object_digest con namespace y epoch.

### 5.2 Identidad de namespace

Elementos recibidos:
- namespace_id no basado en nombre visible.
- Fingerprint de clave de namespace.
- Manifiesto firmado.
- Root o ancla de namespace pre-registrada.
- Resolución solo por (namespace_id, name, epoch).

**Propiedades declaradas:**
- Detección de sustitución accidental o no firmada.
- Detección de ambigüedad de nombrado.
- Prevención de homónimos lógicos si el manifiesto es válido.

**Límites declarados:**
- Si la raíz de confianza está comprometida, la identidad puede ser falsificada.
- Si el objeto está firmado por una clave robada, la firma será válida pero la identidad estará comprometida.

### 5.3 Pérdida, sustitución, corrupción o ambigüedad

La regla general recibida es: si la evidencia no es completa, verificable y no ambigua, el estado es UNKNOWN y se trata como BLOCKED.

| Evento o condición | Detección / respuesta recibida |
|---|---|
| Sustitución de objeto | Hash/firma no coincide; REJECT; BLOCKED si hay evidencia de ataque. |
| Pérdida de ancla, clave, objeto, manifiesto o witness | Verificación incompleta → UNKNOWN → BLOCKED; recuperación solo con ceremonia explícita. |
| Falta de witness exigido por política | UNKNOWN y se trata como BLOCKED. |
| Fallo de verificación | BLOCKED/UNVERIFIED; nunca OPEN silencioso. |
| Conflicto o ambigüedad | Falla cerrado. |

### 5.4 Garantías que no pueden obtenerse bajo R1

En los fragmentos recibidos se enumeran:
1. Prevención de ejecución de un escritor antiguo.
2. Aislamiento fuerte entre escritor y verificador dentro del mismo HOME.
3. Protección total de claves privadas almacenadas en HOME.

## 6. Invariantes recibidos

| Invariante | Regla |
|---|---|
| INV-4 | Una identidad lógica (namespace_id, name, epoch) no puede apuntar a dos objetos distintos sin BLOCK. |
| INV-8 | Si falta witness exigido por política, el estado es UNKNOWN y se trata como BLOCKED. |
| INV-9 | Cualquier fallo de verificación produce BLOCKED/UNVERIFIED, nunca OPEN silencioso. |
| INV-10 | P07-C UNKNOWN mantiene bloqueadas todas las operaciones que dependan de su resolución. |

## 7. Matriz O1–O9

La matriz recibida contiene las siguientes filas:

| Obligación | Control principal en A | Cobertura real bajo R1 | Estado |
|---|---|---|---|
| O1: Autoridad de admisión | Policy + AA + VR + operador | Cubierta como autoridad normativa y evidencial; no coercitiva frente a A2 | Parcial-funcional |
| O2: Escritor antiguo | Epoch, revocación, tickets, VR | Cubierta como inadmisibilidad de salida; no garantiza detener proceso | Parcial |
| O3: BLOCK tras rollback | BLOCK dossier + journal + witness | Cubierta solo si witness externo existe y se consulta | Parcial |
| O4: Identidad de objeto | Canonicalización + hash + AA | Cubierta para detección; no evita firma con clave comprometida | Cubierto detectivo |
| O5: Identidad de namespace | namespace_id + fingerprint + manifest | Cubierta si root de namespace está íntegra | Cubierto detectivo |
| O6: Pérdida | Fail-closed + UNVERIFIED | Cubierta como respuesta segura; no garantiza recuperación | Cubierto procedimental |
| O7: Sustitución | Hash + firmas + manifest digest | Cubierta si no hay compromiso de claves/root | Cubierto detectivo |
| O8: Corrupción | Hash-chain + firmas + verificación | Cubierta para detección; no siempre recuperación | Cubierto detectivo |
| O9: Ambigüedad | IDs canónicos + conflicto => BLOCK | Cubierta como fallo cerrado | Cubierto |

## 8. Matriz de contraejemplos CE

Qwen indica que el informe Snow se toma como antecedente para CE-1, CE-5 y CE-7, sin reeditarlo. Para CE-8 a CE-11 se usa una extensión operativa pendiente de ratificación formal si no estuvieran ya definidas en otro documento.

Filas y fragmentos recibidos:

| CE | Caso | Tratamiento en A | Estado |
|---|---|---|---|
| CE-1 | Pérdida de ancla, clave, objeto, manifiesto o witness | Verificación incompleta → UNKNOWN → BLOCKED; recuperación solo con ceremonia explícita | BLOCKED |
| CE-5 | Sustitución de objeto, namespace, escritor o estado | Mismatch de digest, fingerprint, firma o epoch → REJECT; si hay evidencia de ataque → BLOCKED | BLOCKED/REJECT |
| CE-10 | Escritor antiguo todavía activo | Revocación + epoch + rechazo de tickets; bajo R1 no asegura kill del proceso | Parcial; BLOCK si intenta admisión inválida |

Otros fragmentos de la matriz/amenazas:
- Robo de claves en HOME: el mismo UID puede leer archivos si no hay protección externa; riesgo de suplantación de escritor o AA.
- Epoch/generación: invalida credenciales y tickets antiguos; amenaza de replay de writer antiguo y tickets viejos; rollback de epoch si no hay witness.
- Revocación firmada: declaración normativa de exclusión de un escritor; persiste el riesgo de uso posterior de claves antiguas ante VR correcto y de procesos antiguos que siguen escribiendo basura o robando claves.

## 9. Amenazas residuales bajo R1

Los fragmentos recibidos declaran que la arquitectura A:
- No garantiza prevención contra escritor antiguo.
- No garantiza rollback-resistance sin witness.
- No garantiza aislamiento fuerte entre escritor y verificador dentro del mismo HOME.
- No garantiza protección total de claves privadas almacenadas en HOME.

## 10. Arquitectura B: alternativa que requiere cambiar R1

Se presenta una alternativa con separación más fuerte:

| Componente | Cambio respecto a A |
|---|---|
| Writer | Confinado en UID/sandbox distinto. |
| Admission Authority | Servicio aislado con clave en hardware keystore. |
| Verifier | Proceso independiente con acceso solo lectura a estado canónico. |
| Storage | Directorio protegido por MAC o almacenamiento append-only. |
| Rollback protection | Rollback index, secure timestamp o contador hardware. |
| Old writer kill | OS puede terminar/aislar procesos. |
| Witness | Puede seguir existiendo, pero ya no es único punto de resistencia. |

### 10.1 Beneficios de B

- O1 más fuerte: autoridad protegida por aislamiento.
- O2 más fuerte: el sistema puede impedir ejecución o acceso del escritor revocado.
- O3 más fuerte: rollback puede detectarse/bloquearse por contador confiable.
- O4/O5 más fuertes: claves y manifiestos protegidos por keystore/MAC.
- Menor dependencia del operador para controles básicos.

### 10.2 Costes de B

- Viola R1.
- Requiere decisión explícita.
- Puede requerir dispositivo, perfil, permisos o configuración distinta.
- Introduce dependencia de hardware/OS.
- Puede no ser portable.
- No es aceptable como decisión si R1 permanece ratificada.

**Estado de B:** propuesta no decisional; no es decisión tomada.

## 11. Decisiones pendientes

Los fragmentos recibidos enumeran, entre otras, estas cuestiones:
1. Definir si witness externo es obligatorio para O3.
2. Definir si se permite almacenamiento inmutable o append-only mediante SELinux/MAC.
3. Definir algoritmo de hash y canonicalización exactos.
4. Definir custodia de clave AA: persistente en HOME, passphrase, papel, split-key o externa.
5. Definir tratamiento de objetos antiguos ya admitidos tras revocación de escritor.

También se recibieron estas declaraciones de estado:
- La autoridad de admisión es normativa y evidencial.
- La exclusión de escritor antiguo es por inadmisibilidad, no por kill garantizado.
- BLOCK persistente depende de witness externo o, en su ausencia, se degrada a BLOCKED por política.
- Las garantías son de detección, fallo cerrado y trazabilidad, no de prevención absoluta.

## 12. Conclusión recibida

Si las obligaciones O1–O9 se interpretan como requisitos de prevención fuerte, entonces A no es suficiente y debe evaluarse B como propuesta separada, requiriendo cambio formal de R1.

La opción B permanece como propuesta y no constituye decisión tomada.

## 13. Declaración final

Este documento es exclusivamente documental.

No modifica:
- Repositorio.
- Código.
- Pruebas.
- CI.
- Termux.
- Dispositivo.
- Configuración de Android.
- Estado de M0.

No declara:
- Cierre de M0.
- Cierre de P05.
- Resolución de P07-C.
- Ratificación adicional alguna.

**Estados declarados por Qwen:**
- P05 permanece OPEN.
- P07-C permanece UNKNOWN/BLOCKING.
- No se declara resuelto P07-C.
- M0 no se declara cerrado.

*Fin del documento.*

---

## Anexo de integridad de recepción

La conversación transmitió el documento en varios fragmentos. Se preservaron los conceptos, afirmaciones, estados y tablas que pudieron reconstruirse de forma directa. No se completaron por inferencia los siguientes pasajes ausentes o incompletos:
- La tabla funcional O1–O9 anunciada al inicio, que podría diferir de la matriz O1–O9 posterior.
- Parte de los diagramas de los flujos principales de AA/VR.
- Filas intermedias de la matriz CE.
- El contenido completo de la tabla de amenazas residuales y de la tabla de decisiones pendientes.
- Posibles secciones intermedias no incluidas en los fragmentos recibidos.

Por tanto, esta publicación debe tratarse como **consolidación fiel de las partes recibidas**, no como verificación byte a byte del archivo original de Qwen.
