# NCS M0 — Informe Qwen: suficiencia lógica condicionada de O7/P07-C/P05

Fecha: 2026-11-26
Repositorio: `snowdenxrp/aldea-ia`
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`
Snapshot declarado en la misión: `d8b5ca8720908d926acc18130614cce132a43b5d`

## 0. Validez y alcance del informe

Qwen declara expresamente que en su sesión no tuvo acceso al repositorio ni a los documentos fuente. No pudo leer íntegramente la frontera, los contratos, O1–O9, B1–B6, R1, P09 ni el texto ratificado C3/G2.

Por ello:
- No emite veredicto sobre la suficiencia real de los contratos.
- Todas las conclusiones sobre el Plano D (documentos NCS) permanecen **UNKNOWN**.
- El informe aporta criterios de suficiencia lógica, patrones de contradicción y contraejemplos abstractos del Plano M (modelo lógico), no hallazgos verificados contra el snapshot.
- No modifica código, configuración, ramas ni PR #110.
- No reabre C3/G2.

**Regla de atribución:** no presentar los contraejemplos abstractos de Qwen como reproducciones del código NCS ni como contradicciones confirmadas de los documentos.

## 1. Resultado ejecutivo

Qwen sostiene que el inventario de escritores, por sí solo, no demuestra cobertura universal de O7. Para probar cobertura hace falta justificar un universo cerrado de efectuadores o mediación completa: toda transición que pueda afectar el objeto protegido o el namespace relevante debe pasar por el contrato o quedar excluida mediante un supuesto ambiental explícito y defendible.

También identifica requisitos lógicos para identidad de objeto, cleanup replacement-safe, bloqueo durable, recuperación serializada y modelo de crash. Su aplicabilidad al contrato NCS queda **UNKNOWN** hasta cotejar el texto real.

## 2. Patrones de contradicción candidatos K1–K7

Son patrones condicionales: solo constituyen contradicción documental si el texto real contiene las cláusulas en conflicto.

- **K1 — Cuantificadores incompatibles:** O cuantifica todos los escritores, pero enforcement cubre solo cooperativos mientras se declara cobertura universal.
- **K2 — Identidad confundida con integridad:** B1 garantiza identidad continua, pero se deriva integridad del contenido sin excluir escritores no mediados.
- **K3 — Fail-open:** B3 exige no-readmisión, pero ausencia/vacío/corrupción se interpreta como permiso.
- **K4 — Cleanup por nombre:** B2 exige replacement-safe, pero eliminación se direcciona por nombre tras comprobar identidad previamente.
- **K5 — Recovery no serializado:** B3 exige bloqueo monotónico y B4 permite readmisión concurrente sin precedencia frente a un nuevo bloqueo.
- **K6 — Orden de durabilidad incompatible:** cleanup ocurre antes de hacer durable la decisión que lo justifica.
- **K7 — Path sin control del namespace:** una garantía se indexa por path sin declarar control exclusivo o supuestos equivalentes del namespace.

Aplicabilidad a los documentos NCS: **UNKNOWN**.

## 3. Criterios lógicos de suficiencia

### 3.1 O7 / P09

Qwen propone mantener la distinción:
- O7: propiedad sobre ejecuciones/efectos de escritores.
- P09: contrato sobre participantes/callers Nexo.

La derivación de O7 requiere que ambos contratos y el enforcement cubran universos compatibles, sin circularidad. Un inventario de escritores sirve como evidencia sobre un snapshot, pero no cierra por sí mismo el universo de ejecuciones futuras, dinámicas o externas.

La cobertura universal exigiría justificar:
1. clausura del universo de efectuadores;
2. mediación completa o exclusión demostrada;
3. frontera de procesos/host/permisos;
4. supuestos explícitos sobre cooperatividad, namespace, identidad y modelo de crash.

### 3.2 Identidad del objeto (B1)

La identidad debe ser estable e independiente del nombre, con reutilización detectable o acotada. Además, la identidad comprobada debe estar vinculada al objeto afectado en el instante del efecto, no solo al instante de una comprobación previa.

Escenarios abstractos que propone cotejar:
- unlink y recreación del mismo nombre;
- rename-over;
- retarget de symlink;
- sustitución del directorio padre;
- aliasing de varios nombres a un objeto;
- reutilización de identificadores;
- vistas de namespace divergentes;
- mutación in-place conservando identidad.

### 3.3 Cleanup replacement-safe (B2)

Criterios necesarios:
- efecto de eliminación condicionado a identidad en el instante del efecto, o control exclusivo del namespace que excluya sustitución;
- idempotencia;
- seguridad ante cleanups concurrentes;
- orden durable decisión → efecto.

Una secuencia check-then-act por nombre no satisface por sí sola esos criterios.

### 3.4 BLOCKED durable (B3)

Criterios necesarios:
- transición monotónica;
- salida únicamente mediante autoridad B4;
- default-deny ante ausencia, vacío, parcialidad, corrupción, versión desconocida o estado stale;
- durabilidad del registro y de su entrada de directorio antes de ack o efecto dependiente;
- clave por identidad, no solo por nombre;
- independencia de señales de liveness no durables.

### 3.5 Recuperación y crash consistency (B4/B5)

B4 debería definir autoridad única, revalidación de invariantes, transición durable y precedencia/serialización frente a nuevas decisiones BLOCKED.

B5 debería declarar modelo de crash y tabla de órdenes de durabilidad para decisión, efecto, registro y ack, con resultado default-deny en cada ventana ambigua.

### 3.6 C3/G2

No se reabre. Qwen no tuvo el texto ratificado, por lo que su aplicación documental es UNKNOWN. El cotejo futuro debe verificar que el alcance ratificado se cita correctamente y que ningún otro contrato reclama cobertura sobre una zona exceptuada sin justificación independiente.

## 4. Contraejemplos abstractos del Plano M

Estos ejemplos son demostraciones lógicas genéricas, no reproducciones de NCS:

- **CE-1:** tras comprobar que el nombre apunta a objeto i1, otro actor sustituye el vínculo y la operación por nombre elimina i2.
- **CE-2:** mantener abierto un handle a i1 no obliga a que una operación posterior sobre el nombre afecte a i1.
- **CE-3:** ABA por recreación y reutilización de identificador observable.
- **CE-4:** crash después de decidir BLOCKED en memoria pero antes de persistirlo.
- **CE-5:** registro creado vacío o contenido durable sin entrada de directorio durable.
- **CE-6:** recuperación que persiste readmisión concurrentemente con un nuevo bloqueo.
- **CE-7:** cleanup anterior a la durabilidad de la decisión que lo justifica.
- **CE-8:** mutación in-place conserva identidad, pero cambia contenido.
- **CE-9:** aliasing o sustitución del prefijo del path evade una garantía indexada solo por nombre.

Su aplicabilidad a B1–B6/O1–O9 queda **UNKNOWN** hasta cotejar el contrato fuente.

## 5. Requisitos adicionales candidatos R-A–R-G

- **R-A (O7/R1):** universo de efectuadores cerrado y argumento de mediación completa, con frontera y exclusiones explícitas.
- **R-B (B1):** identidad independiente del nombre, estabilidad/no-reutilización detectable y vínculo entre identidad comprobada y efecto.
- **R-C (B2):** efecto condicionado a identidad, idempotencia, concurrencia segura y orden durable.
- **R-D (B3):** monotonicidad, default-deny ante ambigüedad, durabilidad del registro y namespace antes de ack/efecto.
- **R-E (B4):** autoridad única, revalidación, serialización contra nuevos bloqueos, transición durable y auditabilidad.
- **R-F (B5):** modelo de crash explícito, tabla de órdenes de durabilidad y supuestos del sustrato declarados.
- **R-G (C3/G2):** referencia exacta al alcance ratificado y prohibición de reclamar cobertura fuera de ese alcance sin justificación.

Son requisitos candidatos de Qwen, no decisiones NCS ratificadas.

## 6. Matriz y regla de evaluación propuestas

Qwen no llenó O1–O9 × B1–B6 porque no tuvo los enunciados. Propuso que una celda solo cuente como soporte si el contrato B, bajo supuestos A explícitos, implica la parte correspondiente de O. Un O solo estaría demostrado si la conjunción de soportes cubre íntegramente su propiedad; parcial si depende de supuestos no declarados; contradicho si se admite una ejecución que lo viola; UNKNOWN en otro caso.

La fila O7 requeriría, como mínimo, argumento de cobertura R-A junto con identidad, cleanup, bloqueo durable y crash consistency.

## 7. Recomendación y próximos datos

Qwen pidió acceso íntegro a:
1. frontera P05/P07 posterior a Termux;
2. contratos O7/P07-C/P05;
3. definiciones de O1–O9, B1–B6, R1 y P09;
4. texto ratificado C3/G2, si está en otro artefacto.

La vía correcta para continuar es facilitarle el contenido íntegro o habilitarle acceso verificable. No se debe pedirle que convierta los criterios abstractos en un veredicto sobre textos que no ha leído.

## 8. Estado NCS preservado

- O7: sin cierre; el informe Qwen no lo verifica.
- P09: UNKNOWN/OPEN.
- P07-C: UNKNOWN/BLOCKING.
- P05-C: política ratificada; P05 OPEN.
- C3/G2: decisión del propietario resuelta; no reabrir.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos y commissioning: **STOP**.
- M0: **INCOMPLETO**.

No se eligió primitiva ni se autorizó implementación, configuración, tests, CI, ejecución de dispositivo, publicación o cambios en PR #110.
