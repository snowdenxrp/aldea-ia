# NCS M0 — P07 V2.3: delta normativo sobre V2.2

Fecha: 2026-11-03  
Base inmediata: punta de la rama `ncs-p07-v2-2-documentary-proposal-2026-11-03`, commit `ccba909cbcd398d30898e7db39b6a15e0f22f42a`. Antecedente común de la propuesta V2.2: `d8b5ca8720908d926acc18130614cce132a43b5d`.  
Rama V2.3: `ncs-p07-v2-3-documentary-corrections-2026-11-03`.

Documentos coordinados:
- `NCS_M0_D2_P07_V2_3_NORMATIVE_DELTA_2026-11-03.md`
- `NCS_M0_D2_P07_V2_3_SCENARIO_ORACLE_DELTA_2026-11-03.md`
- `NCS_M0_D2_P07_V2_3_TRACEABILITY_DELTA_2026-11-03.md`

Estado: **DELTA DOCUMENTAL — NO RATIFICADO — NO SELECCIONA MECANISMO — NO IMPLEMENTA — NO AUTORIZA PRUEBAS NI EFECTOS**.

## 1. Precedencia y alcance

V2.3 es un delta explícito sobre los tres documentos V2.2 de la rama indicada. No los modifica ni los sustituye en Git. Para interpretar el contrato vigente de esta propuesta deben leerse V2.2 y aplicar después todas las reglas V2.3; en caso de conflicto, prevalece V2.3 únicamente en el punto corregido.

V2.3 corrige:
1. La diferencia entre detección/fail-closed y prevención/serialización que satisface un gate.
2. La clasificación obligatoria del actor B en cada escenario que lo utiliza.
3. La distinción entre identidad del objeto raíz y continuidad del nombre/ruta aprobada.
4. La separación entre aliases del directorio raíz y aliases de objetos archivo mediante hardlink.
5. La tipificación independiente de `harness_verdict`, `result_class` y `product_state`.
6. Los oráculos de `nlink` para P07-21.
7. La definición de fixtures de rename en P07-18.
8. La separación de ownership del filesystem y metadata de propietario de aplicación en P07-04.
9. La atribución exacta del temporal y del handler en P07-19.

No resuelve decisiones reservadas al propietario, no ratifica R1, no cierra P07-A…E ni P07-C y no constituye evidencia de comportamiento en POCO/Termux.

## 2. Regla de gate: detección no es prevención

La regla V2.2 que permitía leer P07-16 como `PASS_GATE` cuando la operación “falla cerrada sin afectar RT-B” queda reemplazada por esta regla:

- `DETECTION_ONLY`: el producto detecta una divergencia, detiene la operación protegida y conserva los objetos ajenos. Es un resultado de seguridad útil, pero **no demuestra prevención ni satisface por sí solo P07-C**.
- `RETENTION_VERIFIED`: se demuestra que el residuo se conserva conforme a una política de retención aplicable. Tampoco demuestra prevención ni satisface por sí solo P07-C.
- `SERIALIZATION`: se demuestra que los participantes cubiertos quedan ordenados por la frontera de admisión. Puede contribuir a P07-C solo si el contrato ratificado establece que esos participantes y operaciones constituyen el alcance completo del claim.
- `PREVENTION_VERIFIED`: el mecanismo impide que la operación destructiva afecte el objeto/nombre no atribuido bajo el modelo de actores ratificado y la ventana probada. Esta etiqueta se registra como evidencia detallada, no como sustituto del campo `result_class`.
- `PASS_GATE`: permitido únicamente cuando el requisito específico del gate queda demostrado dentro de su alcance, con oráculo completo, controles válidos, fingerprint, cobertura de actores/writers y dependencias cerradas. Un STOP seguro o una retención segura no bastan.

En particular, P07-16:
- divergencia detectada + STOP sin tocar RT-B = `PASS` del comportamiento de detección, `DETECTION_ONLY`, `product_state=STOP` o `UNKNOWN` según el contrato; **no `PASS_GATE` de P07-C**;
- retención verificada = `RETENTION_VERIFIED`; no `PASS_GATE`;
- solo una prevención o serialización demostrada y aplicable puede contribuir a `PASS_GATE`.

No se permite convertir un resultado seguro pero incompleto en cierre de gate por lenguaje como “fail-closed exitoso”.

## 3. Identidad raíz: objeto y namespace son propiedades separadas

Cada escenario de raíz debe declarar dos claims independientes:

**R-OBJ — identidad del objeto raíz**
- ¿La operación sigue anclada al objeto de directorio aprobado que se abrió/retuvo?
- Registrar fd/dirfd, identidad contextual del objeto y montaje.
- Un fd/dirfd puede conservar una referencia al objeto aun cuando su nombre cambie.

**R-NAME — identidad del nombre aprobado**
- ¿El path/ancestro aprobado sigue resolviendo al objeto aprobado dentro del namespace relevante?
- Registrar componentes de ruta, resolución y namespace/mount context.
- Un rename de RT-A puede conservar el objeto abierto mientras el path original pasa a resolver RT-B o queda ausente.

No fusionar R-OBJ y R-NAME. Para cada subcaso P07-16, el oráculo indicará cuál de ambos claims se exige. Si el contrato exige ambos, ambos deben pasar. Si el requisito constitucional/autoridad de raíz no está resuelto por P01/P02, P07 no puede decidir qué nombre es canónico ni aprobar una sustitución de nombre por inferencia técnica.

**P07-16 no aprueba** simplemente porque un dirfd continúe refiriendo RT-A. Tampoco aprueba porque la operación se detenga sin tocar RT-B: eso es detección/contención, no prevención del cambio de namespace.

## 4. Actor B: clasificación obligatoria y oráculo por clase

Todo escenario con actor B debe declarar exactamente una clase antes de ejecutar:

- `COVERED`: participante incluido en el protocolo de admisión ratificado.
- `RAW`: actor que ignora el protocolo; fuera de enforcement salvo decisión expresa del modelo R1.
- `PRIVILEGED`: root/OS/actor privilegiado fuera del modelo declarado, salvo ratificación explícita en contrario.
- `UNCLASSIFIABLE`: la evidencia no permite clasificarlo.

Reglas:
1. `COVERED`: el oráculo evalúa admisión/serialización y la operación cubierta. No exigir una intercalación que el protocolo correcto impide; sí demostrar contención y orden.
2. `RAW`: caracterizar el límite. No reclamar prevención por un lock advisory ni usar un resultado favorable accidental para afirmar enforcement.
3. `PRIVILEGED`: no extrapolar resultados al modelo ordinario. Resultado `NOT_APPLICABLE` o `BLOCKED` según el objetivo, con razón explícita.
4. `UNCLASSIFIABLE`: `UNKNOWN-STOP`; no PASS.
5. No se puede cambiar la clase de B después de observar el resultado para convertir FAIL/UNKNOWN en PASS.
6. Si un escenario requiere dos clases, ejecutar subcasos separados y etiquetados; no mezclar resultados.

La matriz V2.3 identifica los escenarios afectados en el documento de oráculos.

## 5. Taxonomía de resultado obligatoria

Los tres campos son independientes y se registran siempre:

### 5.1 `harness_verdict`
`PASS | FAIL | UNKNOWN | BLOCKED | INVALID | NOT_APPLICABLE`

Describe si el harness ejecutó válidamente el escenario y si el oráculo definido se satisfizo.

### 5.2 `result_class`
Una sola clase principal por subcaso:
- `PASS_CARAC`: caracterización correcta de primitiva/semántica/límite.
- `PASS_GATE`: requisito de gate demostrado con todos sus criterios.
- `DETECTION_ONLY`: divergencia detectada y operación detenida; no prevención.
- `SERIALIZATION`: participantes cubiertos ordenados por la frontera, cuando la serialización está demostrada pero aún no se ha satisfecho el gate completo.
- `RETENTION_VERIFIED`: residuo retenido de forma comprobada.
- `NONE`: no se alcanzó una clase positiva por FAIL/UNKNOWN/BLOCKED/INVALID/NOT_APPLICABLE.

`SERIALIZATION` es un resultado intermedio y una posible base probatoria, no un sinónimo de `PASS_GATE`. Si la serialización es el mecanismo y además se satisfacen todos los criterios del gate, registrar `result_class=PASS_GATE` y un campo adicional obligatorio `gate_basis` con `SERIALIZATION` (o `PREVENTION_VERIFIED`, según corresponda), más las referencias de evidencia. Si el gate no está completo, registrar `result_class=SERIALIZATION`. La misma regla aplica a cualquier mecanismo que contribuya al gate. No duplicar dos clases principales en un mismo subcaso.

### 5.3 `product_state`
`ESTABLISHED | DEGRADED | UNKNOWN | STOP`

Describe el estado de la garantía del producto, no el éxito del harness. Un harness PASS puede coexistir con `product_state=STOP` o `UNKNOWN`.

### 5.4 Tabla mínima de combinación

| Observación | harness_verdict | result_class | product_state |
|---|---|---|---|
| Detección válida y STOP, sin prevención | PASS | DETECTION_ONLY | STOP |
| Residuo retenido conforme a política | PASS | RETENTION_VERIFIED | STOP o UNKNOWN según gate |
| Cooperadores serializados, gate aún incompleto | PASS | SERIALIZATION | ESTABLISHED solo para ese alcance |
| Serialización o prevención demostrada y gate completo | PASS | PASS_GATE; `gate_basis=SERIALIZATION` o `PREVENTION_VERIFIED` | ESTABLISHED para ese gate |
| Escenario no ejercido / seam no observable | UNKNOWN | NONE | UNKNOWN |
| Precondición externa ausente | BLOCKED | NONE | UNKNOWN |
| Harness no demuestra la intercalación reclamada | INVALID | NONE | UNKNOWN |
| Contraejemplo reproducible | FAIL | NONE | STOP |

La tabla no autoriza mapear automáticamente el estado; cada escenario conserva sus precondiciones y dependencias.

## 6. Aliases: raíz versus objeto archivo

Corregir P07-A/P07-01:

- **Root/directory namespace aliases:** symlink final/intermedio, bind mount, ruta relativa/absoluta, montaje distinto, sustitución de componente/ancestro. Son candidatos a cambiar la resolución o el contexto del directorio raíz.
- **File-object aliases:** hardlinks entre nombres de un archivo regular u otro tipo que el filesystem permita. Son múltiples nombres del mismo objeto archivo, no una segunda raíz de directorio.
- No asumir hardlinks a directorios en Linux ordinario; no diseñar el escenario P07-01 como si fueran una clase de alias de raíz.
- P07-21 conserva la prueba de hardlinks de archivo, identidad del objeto y autoridad sobre cada nombre.
- La política de aliases sigue pendiente del propietario; la taxonomía técnica no decide si dos nombres pertenecen al mismo dominio de autoridad.

## 7. Ownership: filesystem versus aplicación

P07-04 debe separar al menos dos capas:

**FS-OWNER**
- UID/GID, mode bits, ACL si aplica, ownership del inode y permisos de búsqueda de directorios.
- Registrar por objeto y por proceso efectivo.
- Un cambio de UID/GID no prueba ni invalida por sí mismo el owner record de Nexo.

**APP-OWNER**
- Registro/token/manifest de propietario que usa la aplicación para atribuir el objeto.
- Estados: válido, ausente, parcial/truncado, ilegible, corrupto, ajeno, duplicado o contradictorio.
- No inferir procedencia desde nombre, PID, timestamp, tamaño, hash o token no autenticado.

Cada fixture indica qué capa se manipula. Si ambas cambian, ejecutar subcasos separados y un caso combinado. Ninguna capa aislada autoriza cleanup si la otra es necesaria para atribución.

## 8. P07-18: condiciones de fixture rename

Antes de interpretar un resultado como caracterización de rename:
- declarar filesystem/mount de source y destination;
- para el caso de rename atómico usual, source y destination deben estar en el mismo filesystem; si no, `EXDEV` es un resultado de condición de fixture, no evidencia sobre atomicidad;
- declarar tipo de source y destination (regular-file→regular-file, directory→directory u otro caso expresamente permitido);
- declarar si destination está ausente o preexistente;
- respetar restricciones de reemplazo de directorios no vacíos y tipos incompatibles;
- separar `rename` normal de `RENAME_NOREPLACE`;
- si el target no soporta la operación, clasificar disponibilidad sin generalizar.

P07-18a es caracterización de visibilidad. P07-18b es un oráculo de protección de destino; el hecho de que rename normal reemplace el nombre destino no satisface P07-C.

## 9. P07-19: objeto temporal y seam de cleanup

P07-19 debe identificar expresamente:
1. **A-temp:** archivo temporal creado/abierto por el producto y atribuido a ejecución A.
2. **Library-temp:** cualquier temporal interno creado por Node/libuv/copyFile, si la implementación exacta realmente lo usa.
3. **B-sentinel:** objeto independiente creado por B, con fd retenido y baseline de nombre, identidad, contenido y nlink.
4. **Cleanup owner:** código exacto que intenta eliminar qué nombre/objeto y bajo qué condición de error.

No equiparar A-temp con Library-temp. No atribuir al producto una limpieza interna de libuv sin inspeccionar versión, build y fuente exacta realmente cargada.

La intercalación exigida para el claim de sustitución debe ocurrir después del fallo real inyectado y antes de la operación destructiva concreta del handler. Si el handler delega la operación a una función interna no instrumentable, registrar esa limitación; no sustituirla por una barrera externa y llamarla seam interno. Si el punto exacto no puede observarse, UNKNOWN/INVALID, nunca PASS_GATE.

## 10. P07-21: oráculo explícito de hardlink y nlink

Para cada subcaso registrar separadamente:
- supervivencia del nombre n1;
- supervivencia del nombre n2;
- identidad contextual del objeto al que resuelve cada nombre;
- identidad del objeto retenido por fd;
- contenido/hash por fd;
- `nlink` antes y después;
- operación exacta que produjo el delta de nlink.

Caso A — A elimina su propio n1:
- n1 debe quedar ausente;
- n2 debe seguir resolviendo al objeto original;
- fd debe seguir refiriendo al objeto original mientras permanezca abierto;
- `nlink_after = nlink_before - 1` si se eliminó exactamente un hardlink y no hubo otras mutaciones; cualquier delta distinto requiere explicación, de lo contrario UNKNOWN.

Caso B — n1 es/sustituye a hardlink ajeno n2:
- si n1 pertenece a B y n2 es el nombre ajeno protegido, el cleanup de A no puede eliminar n1 ni n2 salvo atribución autorizada demostrada;
- n2 debe seguir presente y resolver al mismo objeto protegido;
- si A elimina n1, n2 puede seguir apuntando al mismo inode mientras `nlink` disminuye en uno: esto sigue siendo una afectación al namespace de B y es FAIL si A carecía de autoridad sobre n1;
- “n2 intacto” significa nombre presente, misma identidad contextual y contenido protegido; registrar por separado el cambio de nlink compartido. No ocultar un decremento de nlink bajo la frase “n2 sigue intacto”.

No comparar `nlink` aislado como identidad ni usar su igualdad como autorización.

## 11. Estado conservador

Estas correcciones no resuelven:
- política P07-A;
- modelo R1 y definición final de COVERED/RAW;
- P05-C release/readmisión y retención;
- P09 cobertura de callers/writers;
- autoridad de raíz P01/P02;
- mecanismo replacement-safe;
- suficiencia de evidencia de target.

Estado: P07 OPEN; P07-C UNKNOWN/BLOCKING; P05-C OPEN/NOT RATIFIED; P09 OPEN/UNKNOWN; mecanismo seleccionado NINGUNO; harness NO IMPLEMENTADO; pruebas NO EJECUTADAS; authorization NOT_EVALUATED; raíz constitucional PENDING/UNKNOWN; commissioning/efectos protegidos STOP; NCS M0 INCOMPLETO.

La existencia de este delta no constituye ratificación ni autorización de ejecución.
