# NCS M0 — G-08: decisión del propietario sobre el registro externo D-RB-09

**Estado:** PROPUESTA PARA DECISIÓN DEL PROPIETARIO. G-08 continúa UNKNOWN hasta ratificación expresa y verificación de la configuración elegida.  
**Fecha:** 2026-11-13  
**Alcance:** canal, formato y custodia del registro externo exigido por D-RB-09 A y utilizado por la atestación P-R1.6 de REC.  
**No autoriza:** REC operativo, readmisión, rollback, implementación, pruebas, CI, inspección del dispositivo, commissioning ni efectos protegidos.

## 1. Base normativa ya ratificada

- **D-RB-09 A:** todo rollback debe tener un registro externo, fuera del ámbito revertido, con ámbito, snapshot, ejecutor, instante y resultado.
- **D-RB-02 A:** solo el propietario puede ejecutar manualmente un rollback y debe declararlo explícitamente por un canal fuera del ámbito.
- **A-04 opción A:** REC exige atestación explícita del propietario, fuera de banda, específica del incidente y registrada externamente.
- **P-R1.6:** la atestación debe describir qué ocurrió (crash, rollback declarado y alcance, intervención) y qué debe activarse o descartarse en QRT. Es necesaria, no suficiente.
- **D-RB-04 A:** exige un ancla externa monótona. Permanece RATIFICADA pero NO SATISFECHA y fuera del claim restringido M0 actual.

## 2. Distinciones que G-08 debe preservar

1. El registro D-RB-09 es evidencia de auditoría y procedencia.
2. La atestación A-04/P-R1.6 es una declaración del propietario vinculada al incidente y a la decisión sobre QRT.
3. El ancla D-RB-04 es un mecanismo externo monótono de detección. El registro humano no se considera equivalente.
4. Registrar un evento no demuestra que el evento haya sido detectado, impedido o ejecutado correctamente.
5. La existencia del registro no levanta D-RB-01, no satisface P-R1.1…P-R1.5 ni P-R1.7 y no habilita P-R1.8.

## 3. Requisitos mínimos del canal

El canal elegido debe:
- residir fuera del dominio susceptible de rollback/restauración que se está evaluando;
- permitir al propietario registrar manualmente el incidente y su atestación;
- conservar el registro cuando el estado local restaurable retroceda;
- permitir recuperar y revisar el registro sin depender del estado local sospechoso;
- no ser presentado como inmutable, monotónico o independiente de su proveedor salvo evidencia específica;
- tener una identificación inequívoca del custodio y un procedimiento de acceso/revisión.

La satisfacción de estos requisitos no se presume por elegir una plataforma. Debe verificarse documentalmente y, cuando corresponda, mediante evidencia autorizada.

## 4. Alternativas para decisión

### Opción A — Registro remoto bajo control exclusivo del propietario (recomendada para evaluación)

- **Canal candidato:** repositorio remoto privado dedicado, separado del checkout y de los datos operativos de Nexo.
- **Formato candidato:** un registro Markdown por incidente, con campos estructurados obligatorios y una sección de atestación literal del propietario. Evita mantener dos representaciones canónicas.
- **Custodio candidato:** propietario, como único responsable de crear y conservar los registros.
- **Ventajas:** separación clara del HOME restaurable; trazabilidad legible; encaja con el flujo documental GitHub ya utilizado por el propietario.
- **Límites:** no garantiza inmutabilidad, monotonía, disponibilidad permanente, identidad fuerte del autor ni timestamp confiable. El propietario o el proveedor podrían modificar o eliminar registros. No satisface D-RB-04 A.
- **Decisión necesaria:** ratificar si el propietario acepta este canal, formato y custodia; el repositorio concreto y sus controles deben identificarse antes de declarar G-08 cerrado.

### Opción B — Registro físico bajo custodia del propietario

- **Canal candidato:** soporte físico conservado fuera del dispositivo y del dominio restaurable.
- **Formato candidato:** una hoja/entrada normalizada por incidente, con los mismos campos mínimos y atestación firmada por el propietario.
- **Custodio candidato:** propietario.
- **Ventajas:** separación física respecto del HOME y de su backup local.
- **Límites:** búsqueda, copia, disponibilidad, pérdida, alteración y correlación temporal requieren tratamiento propio. No proporciona por sí solo monotonía verificable ni satisface D-RB-04 A.
- **Decisión necesaria:** ratificar soporte, formato, custodia y ubicación física concreta.

### Opción C — Servicio externo de registro con auditoría administrada

- **Canal candidato:** servicio externo que mantenga historial de cambios y controles de acceso.
- **Formato candidato:** esquema estructurado definido por el servicio, acompañado de la atestación del propietario.
- **Custodia candidata:** propietario como responsable de la atestación; proveedor como operador técnico del almacenamiento.
- **Ventajas:** puede ofrecer controles de acceso, historial y recuperación independientes del dispositivo.
- **Límites:** introduce dependencia, proveedor, cuenta, disponibilidad y semántica de auditoría que aún no han sido evaluados. No implica inmutabilidad ni monotonía.
- **Decisión necesaria:** seleccionar proveedor y cuenta concretos, revisar sus controles y definir la separación de responsabilidades.

## 5. Esquema mínimo propuesto para cada incidente

Los campos siguientes reflejan requisitos ya presentes; no añaden una autorización:

- **incident_id:** identificador único del incidente, cuya regla de generación debe aprobarse.
- **recorded_at:** instante de registro, con zona horaria explícita; no se trata como reloj confiable ni como orden monotónico.
- **event_class:** crash ambiguo / rollback declarado / rollback sospechado / intervención / otro, sin forzar UNKNOWN a una clase conocida.
- **rollback_scope:** RB-1 / RB-2 / RB-3 / RB-4 / no determinado.
- **snapshot_reference:** referencia al snapshot relacionado, sin asumir que su hash o identidad estén verificados.
- **executor:** actor declarado; si es desconocido, conservar UNKNOWN.
- **outcome:** resultado declarado, incluido fallo o resultado indeterminado.
- **qrt_reference:** referencia al estado y diagnóstico en cuarentena, si existe.
- **owner_attestation:** declaración explícita, específica del incidente, fuera de banda, que describa qué ocurrió y qué debe activarse o descartarse en QRT.
- **owner_decision:** disposición declarada del propietario sobre QRT; nunca equivale por sí sola a readmisión.
- **record_custodian:** custodio responsable de conservar el registro.

El esquema es PROPUESTA: no debe tratarse como formato ratificado ni implementarse antes de la decisión correspondiente.

## 6. Recomendación

Evaluar primero la **Opción A**: registro remoto privado dedicado, un Markdown por incidente y custodia exclusiva del propietario. Es la alternativa que mejor aprovecha el flujo documental ya disponible sin introducir un proveedor de registro adicional ni confundir el registro con un ancla monotónica.

Esta recomendación no selecciona ni crea un repositorio, no define credenciales, no configura protección de ramas y no afirma que GitHub sea inmutable. Esos detalles deben quedar identificados y comprobados antes de cerrar G-08.


## 6A. Restricción de confidencialidad del repositorio actual

La consulta de metadatos de GitHub del 2026-11-13 confirma que `snowdenxrp/aldea-ia` tiene visibilidad **PUBLIC**. Por tanto, no debe utilizarse como canal de atestaciones personales ni como repositorio de incidentes con datos sensibles, salvo que el propietario decida expresamente que el contenido puede ser público y se haya minimizado/sanitizado.

La Opción A recomendada debe interpretarse como **un repositorio remoto privado dedicado**, no como publicación de atestaciones en el repositorio público actual. No se ha creado ese repositorio ni se ha seleccionado su nombre, configuración o permisos. Su creación y configuración requieren decisión/autorización expresa del propietario.

## 7. Condiciones objetivas para cerrar G-08 documentalmente

G-08 solo puede pasar de UNKNOWN a DECIDED cuando el propietario ratifique explícitamente:
1. canal concreto;
2. formato concreto;
3. custodio concreto;
4. alcance del registro y confirmación de que permanece fuera del dominio restaurable.

G-08 solo puede pasar a DOCUMENTED/VERIFIED cuando además exista evidencia identificable de:
- ubicación/canal elegido;
- acceso y custodia;
- plantilla o esquema vigente;
- prueba documental de que el canal no forma parte del dominio local restaurable.

La verificación del canal no prueba que cada registro futuro sea verdadero, completo, oportuno o monotónico. Cada incidente requerirá su propia atestación y revisión.

## 8. Estado que no cambia

- A-04: RATIFICADA, opción A.
- D-RB-09 A: RATIFICADA; registro externo obligatorio.
- D-RB-04 A: RATIFICADA, NO SATISFECHA.
- D-RB-01 A: moratoria íntegra; RB-1…RB-4 prohibidos; rollback conocido o sospechado → STOP/UNKNOWN.
- G-08: UNKNOWN hasta decisión del propietario.
- REC/readmisión operativa: BLOQUEADO.
- P05: OPEN.
- P07-C: UNKNOWN/BLOCKING.
- M0: INCOMPLETO.

**Ninguna opción de este documento autoriza operaciones protegidas.**
