# NCS M0 — Revisión final de ratificación documental P07 V2.2 + V2.3

Fecha: 2026-11-27  
Clasificación: REVISIÓN DOCUMENTAL / SOLO LECTURA  
Resultado: **RECOMENDACIÓN FAVORABLE CON ALCANCE LIMITADO Y RESERVAS EXPLÍCITAS**  
No constituye ratificación del propietario, selección de mecanismo, autorización de pruebas, implementación, commissioning ni cierre de gates.

## 1. Mandato y límites de esta revisión

El propietario autorizó preparar la revisión final de ratificación de P07 V2.2 + V2.3, incluyendo recomendación técnica y consecuencias, sin ratificar en su nombre.

La revisión se limita a los documentos versionados en GitHub. No se modificaron código, tests, workflows, configuración, estado del dispositivo, stores ni PRs. No se ejecutaron pruebas, CI, comandos Termux/POCO ni syscalls.

Base documental inspeccionada en la rama `ncs-m0-o7-p07c-traceability-2026-11-27`, punta declarada `1ca68897d5c4e1061f89d7aa32b15d2a51e94f70`:

| Artefacto | Blob SHA |
|---|---|
| P07 V2.2 — corrección normativa | `7ce10f7e02516da4438358c3d637a275001c6019` |
| P07 V2.2 — matriz y oráculos | `26404e70d39b3fd29ecfe56e0965917d973bac68` |
| P07 V2.2 — trazabilidad y evidencia | `22e8d63f725f3e304bc4ff392f6459afa941f695` |
| P07 V2.3 — delta normativo | `7a6fcd2e3d1c93fc725b43dd903f1d117efb9ee3` |
| P07 V2.3 — delta de matriz/oráculos | `39c59981a6036bb4f902560ffc9d756499174abe` |
| P07 V2.3 — delta de trazabilidad | `36c947aace1b68b2159d857cde13491ca811d006` |
| P-05/P-07 — obligaciones de crash y admisión | `7af04a84748bb1174ca5c361d8d0ed24b8d97a43` |
| Perímetro protegido O7/P07 ratificado | `ddb026275b64027f9fc95aab3861ed0614143c34` |

La punta V2.2 declarada por V2.3 es `ccba909cbcd398d30898e7db39b6a15e0f22f42a`; el antecedente común es `d8b5ca8720908d926acc18130614cce132a43b5d`. Los SHA de blobs verifican qué textos fueron recuperados, no su ratificación ni su comportamiento.

## 2. Dictamen ejecutivo

**V2.3 corrige de forma coherente y conservadora las insuficiencias documentales identificadas en V2.2. Recomiendo ratificar V2.3 únicamente como delta normativo/documental sobre los tres artefactos V2.2 identificados, con las reservas y límites de este informe.**

La recomendación no equivale a ratificar decisiones de mecanismo ni a cerrar P07. V2.3 mantiene explícitamente abiertas las decisiones reservadas al propietario y las dependencias P05, P09, P01/P02, target y evidencia.

No recomiendo una ratificación genérica de “P07 completo”, ni una autorización implícita para seleccionar locks, marcadores, tombstones, epochs, journals, daemons, primitivas filesystem o políticas de cleanup.

## 3. Correcciones V2.3 verificadas frente a V2.2

### 3.1 Detección/fail-closed separada de prevención

V2.2 ya distinguía caracterización de gate, pero P07-16 podía leerse de forma demasiado amplia al asociar detección y STOP con un resultado positivo. V2.3 corrige expresamente que:

- `DETECTION_ONLY` no satisface por sí solo P07-C.
- `RETENTION_VERIFIED` no satisface por sí solo P07-C.
- `SERIALIZATION` es evidencia intermedia y solo puede sustentar PASS_GATE cuando el alcance completo y las dependencias aplicables están demostrados.
- `PASS_GATE` exige contrato, alcance, oráculo, controles, fingerprint y dependencias completas.
- Prevención y serialización se registran como base de gate, no se infieren de un STOP seguro.

**Dictamen:** corrección necesaria y favorable. Evita un falso cierre por “fail-closed exitoso”.

### 3.2 Actor B y límites R1

V2.3 exige fijar antes del subcaso una clase única: `COVERED`, `RAW`, `PRIVILEGED` o `UNCLASSIFIABLE`; `NOT_PRESENT` cuando no interviene B. Prohíbe reclasificar después de observar el resultado.

La actualización posterior del 2026-11-07 reconcilia R1: R1 fue aceptado por el propietario, pero la aceptación no prueba que un proceso concreto esté cubierto. `COVERED` requiere evidencia de que su ruta está sometida a la admisión P-03/P-04; UID, instalación, nombre del proceso o pertenencia al repositorio no bastan.

**Dictamen:** corrección necesaria y favorable. Conserva el límite de confianza aceptado sin inventar cobertura real.

### 3.3 Identidad de raíz: objeto frente a nombre

V2.3 separa:

- `R-OBJ`: identidad del objeto de directorio retenido por fd/dirfd.
- `R-NAME`: continuidad del path/ancestro aprobado en el namespace.

Un descriptor que sigue apuntando a RT-A no demuestra que el nombre aprobado siga resolviendo RT-A. La separación evita declarar satisfecho el claim de raíz cuando el nombre fue desplazado o sustituido.

**Dictamen:** corrección necesaria y favorable. No decide cuál nombre es constitucionalmente canónico; P01/P02 y la autoridad de raíz siguen fuera de este delta.

### 3.4 Aliases de raíz frente a hardlinks de archivo

V2.3 separa aliases del directorio raíz (symlink, bind mount, ruta, montaje, sustitución de ancestro) de aliases de objetos archivo mediante hardlinks. P07-21 conserva el análisis de hardlinks de archivos; no se presupone hardlink de directorio.

**Dictamen:** corrección técnica favorable. La clasificación no decide por sí misma si dos rutas pertenecen al mismo dominio de autoridad; la política P07-A sigue reservada.

### 3.5 Taxonomía de resultados

V2.3 obliga a registrar independientemente:

- `harness_verdict`;
- `result_class`;
- `product_state`.

Añade `NONE` para resultados sin clase positiva y exige `gate_basis` cuando se declara `PASS_GATE`. La distinción impide que un PASS del harness sea interpretado como garantía establecida del producto.

**Dictamen:** corrección necesaria y favorable. Para evitar lecturas amplias, cualquier `ESTABLISHED` asociado a `SERIALIZATION` debe permanecer expresamente limitado al participante/alcance observado y nunca presentarse como cierre del gate completo.

### 3.6 P07-18: fixtures de rename

V2.3 exige declarar filesystem/mount, tipos de source/destination y estado previo del destino. Separa rename normal de `RENAME_NOREPLACE`, y distingue atomicidad/visibilidad (P07-18a) de protección del objeto destino (P07-18b). `EXDEV` se trata como condición de fixture, no como fallo de atomicidad local.

**Dictamen:** corrección favorable. Evita confundir atomicidad de rename con protección replacement-safe.

### 3.7 P07-04: ownership por capas

V2.3 separa `FS-OWNER` (UID/GID, mode, ACL y permisos) de `APP-OWNER` (registro/token/manifest de atribución de aplicación), con fixtures independientes. Ninguna capa aislada autoriza cleanup si ambas son necesarias para atribuir el objeto.

**Dictamen:** corrección favorable. Reduce atribución falsa de objetos y cleanup no autorizado.

### 3.8 P07-19: temporal y cleanup owner

V2.3 distingue A-temp, Library-temp, B-sentinel y el código exacto que ejecuta cleanup. Requiere conocer runtime/Node/libuv y el seam real entre fallo y syscall destructiva; si no puede observarse, el resultado es UNKNOWN/INVALID.

**Dictamen:** corrección crítica y favorable. Evita atribuir al producto operaciones internas de una librería sin evidencia de la versión realmente cargada.

### 3.9 P07-21: nlink y hardlinks

V2.3 obliga a observar por separado n1, n2, fd, identidad, hash y nlink. Explicita que eliminar un nombre ajeno puede afectar el namespace aunque otro hardlink mantenga el contenido accesible.

**Dictamen:** mejora necesaria de oráculo. La aplicación de la regla a escenarios concretos debe respetar la decisión del propietario sobre autoridad de nombres y qué constituye “afectar”; este documento no debe utilizarse para resolver silenciosamente esa reserva.

### 3.10 Trazabilidad y procedencia

V2.3 corrige el recuento de hallazgos Claude que no podía reconciliarse con IDs fuente. También registra que Qwen no auditó V2.2 por falta de acceso al repositorio; su respuesta no debe contarse como auditoría técnica de V2.2.

**Dictamen:** corrección favorable. No presentar a Qwen como auditor que confirmó o refutó V2.2 ni publicar totales de hallazgos no reconciliados.

## 4. Compatibilidad con decisiones posteriores ratificadas

La propuesta debe leerse aplicando sus deltas posteriores, no copiando tablas históricas sin precedencia:

1. **P-05-C:** ratificada por el propietario el 2026-11-07 como política UNKNOWN/BLOCKED sin recuperación automática. P-05 continúa OPEN por falta de mecanismo, enforcement durable/interproceso, resolución y evidencia.
2. **R1:** aceptado por el propietario el 2026-11-02 como límite del modelo de confianza. Esto no cierra P07-E, E2/E3 ni demuestra que actores reales estén controlados.
3. **Perímetro protegido O7/P07:** ratificado el 2026-11-27. Incluye Continuity, locks/coordinación, temporales/publicación/reemplazo y raíz/namespace relevante. Chronicle permanece separado pero protegido contra interferencias/colisiones. Rutas/capacidades de Lúmina que puedan afectar Continuity entran en el análisis de capacidad, sin presumir que fueron ejercidas.
4. **Separación Nexo/Lúmina:** se mantiene. Esta ratificación no fusiona stores, identidad, autoridad ni sincronización.

La declaración de perímetro del 2026-11-27 no ratifica V2.3, no selecciona mecanismo y no autoriza ejecución. V2.3 tampoco cambia `authorization: NOT_EVALUATED`.

## 5. Reservas del propietario que deben permanecer abiertas

La ratificación documental propuesta debe declarar expresamente que NO resuelve:

- Política de aliases P07-A y pertenencia de nombres/aliases al dominio de autoridad.
- Autoridad constitucional de la raíz y nombre canónico (P01/P02).
- Si el producto puede limpiar objetos propios o debe retenerlos ante incertidumbre.
- Qué evidencia atribuye un huérfano después de crash.
- Qué participantes concretos son COVERED; la clase requiere prueba por ruta/caller.
- Si sustitución reversible cuenta como “afectar” para cada claim P07-C.
- Si detección + STOP satisface algún requisito parcial; nunca convertirlo por defecto en P07-C PASS_GATE.
- Límites de residuos acumulados y relación con P05/readmisión.
- Alcance aceptable de pruebas estadísticas de carreras.
- Cualquier selección de mecanismo y los claims que dicho mecanismo puede sostener.

Estas reservas son decisiones explícitas, no defectos que deban resolverse por inferencia técnica. Si una decisión es necesaria para un escenario, ese escenario queda BLOCKED/UNKNOWN hasta decisión aplicable.

## 6. Dependencias y consecuencias que no cambian

La ratificación documental V2.3 no cierra:

| Elemento | Estado que debe conservarse |
|---|---|
| P05-C | RATIFICADA como política |
| P05 | OPEN |
| P07 general | OPEN |
| P07-C | UNKNOWN / BLOCKING |
| P07-A/B/D/E | OPEN donde corresponda |
| P09 | OPEN / UNKNOWN |
| O7 | UNKNOWN / OPEN |
| O8 | UNKNOWN |
| O9 | PARTIAL |
| E2/E3 | PARTIAL / NOT CLOSED |
| Mecanismo P07 | NINGUNO SELECCIONADO |
| Harness P07 | NO IMPLEMENTADO según expediente consultado |
| Pruebas P07 | NO EJECUTADAS según expediente consultado |
| CI exacto | No demostrado por esta revisión |
| authorization | NOT_EVALUATED |
| Raíz constitucional | PENDING / UNKNOWN |
| Commissioning / efectos protegidos | STOP |
| NCS M0 | INCOMPLETO |

La brecha P05/P07 documentada sigue siendo material: un lock efímero puede dar exclusión viva, pero no demuestra cuarentena durable después de crash; un lock file por nombre tampoco demuestra identidad estable ni readmisión segura. Las obligaciones O1–O9 del análisis P-05/P-07 siguen siendo necesarias. P09 permanece abierto por loaders no literales, consumidores externos y universo de callers/writers no cerrado.

## 7. Recomendación de ratificación propuesta

Recomiendo que el propietario ratifique **solo** lo siguiente:

> Se ratifican los tres documentos P07 V2.2 como base documental y los tres documentos P07 V2.3 como delta normativo, de matriz/oráculos y de trazabilidad que prevalece únicamente en los puntos que corrige. Esta ratificación acepta las distinciones y requisitos documentales descritos en V2.3 para la evaluación futura de P07.
>
> Esta ratificación no selecciona mecanismo, no decide las reservas del apartado 5, no amplía el modelo R1, no declara participantes COVERED sin evidencia, no cierra P05/P07/P09/O7/E2/E3, no modifica `authorization: NOT_EVALUATED`, no levanta STOP y no autoriza por sí sola implementación, pruebas, CI, operaciones Termux/POCO, commissioning, cleanup, readmisión ni efectos protegidos.
>
> Toda implementación o prueba posterior debe contar con la autorización M0 aplicable, respetar el perímetro protegido ratificado y producir evidencia ligada al SHA exacto. Los gates conservan UNKNOWN/BLOCKING cuando falte cualquier dependencia o prueba exigida.

**Resultado recomendado si el propietario acepta el texto:** V2.2 + V2.3 = CONTRATO DOCUMENTAL RATIFICADO PARA EVALUACIÓN; P07 sigue OPEN y P07-C sigue UNKNOWN/BLOCKING hasta que se demuestren mecanismo, cobertura, oráculos, harness, fingerprint y dependencias.

## 8. Conclusión

No encontré en los deltas revisados una razón técnica para rechazar las correcciones V2.3. Son mayoritariamente endurecimientos de oráculos, trazabilidad y límites de claim, no selección de mecanismo. Sus consecuencias son conservadoras y compatibles con P-05-C, R1 aceptado y el perímetro O7/P07 ratificado, siempre que se preserven las reservas y dependencias enumeradas.

**Recomendación final: FAVORABLE A RATIFICACIÓN DOCUMENTAL LIMITADA, NO A CIERRE DE P07 NI A EJECUCIÓN AUTOMÁTICA.**

No se realizó ratificación en nombre del propietario.

## 9. Registro de ejecución de esta revisión

- Actividad: lectura y comparación documental GitHub.
- Código/tests/workflows/configuración: sin cambios.
- Termux/POCO: no utilizado.
- Pruebas/CI/Actions: no ejecutadas.
- Stores Continuity/Chronicle/Lúmina: no accedidos ni modificados.
- PRs: sin cambios.
- Próximo paso: decisión expresa del propietario sobre el texto exacto de ratificación del apartado 7.
