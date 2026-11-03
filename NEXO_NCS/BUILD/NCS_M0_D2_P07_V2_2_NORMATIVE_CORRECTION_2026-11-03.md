# NCS M0 — P07 V2.2: corrección normativa de identidad filesystem

Fecha: 2026-11-03  
Base documental: commit `d8b5ca8720908d926acc18130614cce132a43b5d` (P07 V2.1).  
Rama de propuesta: `ncs-p07-v2-2-documentary-proposal-2026-11-03`  
Documentos coordinados:
- `NCS_M0_D2_P07_V2_2_NORMATIVE_CORRECTION_2026-11-03.md`
- `NCS_M0_D2_P07_V2_2_SCENARIO_MATRIX_AND_TEST_ORACLES_2026-11-03.md`
- `NCS_M0_D2_P07_V2_2_TRACEABILITY_PLATFORM_AND_EVIDENCE_PROTOCOL_2026-11-03.md`

Estado: **PROPUESTA DOCUMENTAL — NO RATIFICADA — NO SELECCIÓN DE MECANISMO — NO IMPLEMENTACIÓN — NO AUTORIZA PRUEBAS NI EFECTOS**.

## 1. Resultado ejecutivo

V2.2 consolida las auditorías adversariales independientes de Claude y Qwen y resuelve sus discrepancias mediante reglas de oráculo más estrictas. No declara P07-C satisfecho.

Cambios normativos centrales:

1. Se separan resultados de caracterización y resultados que satisfacen un gate: `PASS_CARAC` no equivale a `PASS_GATE`.
2. La integridad de un centinela se define por rol, descriptor, nombre, namespace y eventos observables; el hash por sí solo no prueba identidad ni permanencia del nombre.
3. La prueba de P07-C distingue prevención, serialización de participantes cubiertos y caracterización del límite frente a actores crudos.
4. Un seam de prueba solo es válido si está dentro del producto, entre la última verificación relevante y la operación destructiva efectiva. Un hook externo no demuestra la ventana TOCTOU interna.
5. P07-18 se divide en caracterización de rename y gate de protección del destino.
6. P07-19 y P07-21 reciben intercalaciones, centinelas y controles negativos explícitos.
7. P07-12 incorpora ambos órdenes de sustitución del nombre del lock.
8. P07-09 separa crash real, estados parciales sembrados, evidencia de fsync y durabilidad ante pérdida de energía.
9. P07-13 evalúa por separado `flock`, `F_SETLK` y `F_OFD_SETLK`.
10. `dirfd` se reconoce como anclaje de resolución, nunca como garantía autónoma de identidad permanente de raíz ni de compare-and-unlink.

V2.2 es una especificación documental. No selecciona un mecanismo ni autoriza implementación, pruebas o uso de Continuity real.

## 2. Alcance y dependencias

P07 define requisitos de identidad filesystem, resolución, admisión, cleanup/reemplazo y publicación para raíces, directorios, destinos, locks, temporales y objetos publicados.

P07 no:
- establece autoridad constitucional de la raíz (P01/P02);
- define por sí solo release/readmisión después de incertidumbre (P05);
- demuestra que todos los callers/writers relevantes están cubiertos (P09);
- prueba quiescencia ambiental E2/E3;
- garantiza aislamiento contra root, OS comprometido o actores hostiles excluidos por el modelo R1;
- demuestra durabilidad física ante pérdida de energía;
- convierte un fingerprint estático en evidencia de comportamiento dinámico.

Dependencias:
- **P05:** política de release/readmisión ante UNKNOWN, BLOCKED, STOP y residuos.
- **P09:** inventario y cobertura de callers/writers que deben pasar por la frontera de admisión.
- **P01/P02:** autoridad y legitimidad de la raíz; identidad filesystem no es autoridad constitucional.
- **P03/P04:** ownership de API, admisión y límites de lectura/escritura.
- **R1:** modelo de actores que debe ser ratificado; no asumir que está ratificado por aparecer en documentos técnicos.

P07-C no puede cerrarse mientras P05-C o P09 sigan abiertos en dimensiones críticas para la garantía.

## 3. Modelo de identidad e integridad

### 3.1 Entidades distintas

- **Nombre:** ruta o componente que el filesystem resuelve en un instante. Es mutable.
- **Descriptor (fd):** referencia abierta al objeto/open file description según la API y el mecanismo.
- **Objeto filesystem:** objeto al que refiere el descriptor. `(st_dev, st_ino)` es una observación contextual, no identidad eterna.
- **Contexto de resolución:** dirfd, montaje, namespace disponible, flags y componentes usados.
- **Dominio de admisión:** conjunto de operaciones que la política autoriza a serializar. No se deduce de igualdad de inode.
- **Centinela:** objeto de control cuyo rol explícito es detectar desplazamiento, sustitución, alteración o destrucción no autorizada.

### 3.2 Predicado de integridad por rol

No existe un predicado universal idéntico para todos los objetos. Cada fixture debe declarar el rol del objeto y sus cambios permitidos.

Para un **centinela de sustitución** que debe permanecer intacto, el predicado mínimo es:

1. El descriptor retenido sigue refiriendo al objeto centinela esperado.
2. El contenido/hash por descriptor coincide con el baseline cuando el contrato exige inmutabilidad.
3. El objeto mantiene al menos el vínculo esperado y el valor de `nlink` satisface la regla específica del fixture.
4. El nombre protegido continúa resolviendo al mismo objeto cuando la propiedad bajo prueba exige conservar ese nombre.
5. El inventario de namespace antes/después no muestra desaparición, sustitución ni aparición no explicada.
6. Los eventos de namespace, si existe un mecanismo de observación validado, no muestran desplazamiento transitorio.
7. Si no se puede observar un desplazamiento transitorio que el claim necesita excluir, el resultado es UNKNOWN, no PASS.

No exigir `nlink` inmutable para todos los roles: una eliminación autorizada de un nombre propio puede reducirlo legítimamente. El oráculo define el valor esperado por objeto, rol y operación.

Distinciones obligatorias:
- **Desaparición de nombre:** el nombre deja de resolver al objeto.
- **Desplazamiento:** el nombre resuelve a otro objeto, aunque el objeto original sobreviva por fd u otro hardlink.
- **Destrucción del objeto:** el objeto deja de existir cuando ya no conserva referencias/nombres según la semántica del filesystem.
- **Recreación:** un nombre vuelve a existir con objeto diferente, aunque el contenido sea idéntico.
- **Alteración:** cambia contenido o metadata protegida sin autorización.

Hash igual no demuestra identidad; inode igual observado una sola vez no demuestra permanencia del nombre; fd retenido no demuestra que el nombre siga vinculado.

### 3.3 Límites de fd, dirfd e identidad

1. Un fd conserva una referencia al objeto abierto; no garantiza que una ruta siga apuntando a él.
2. `fstat(fd)` describe el objeto abierto; `stat(path)` describe la resolución actual del nombre.
3. `dirfd` ancla un directorio abierto y las operaciones relativas pueden limitar el punto de partida de resolución.
4. `dirfd/openat/openat2` no congelan el nombre final ni convierten `unlinkat` en compare-and-unlink.
5. Renombrar o sustituir el nombre de la raíz no invalida necesariamente el fd abierto; tampoco prueba que el nombre original siga siendo la raíz aprobada.
6. `(st_dev, st_ino)` puede reutilizarse tras el fin de vida del objeto y debe interpretarse dentro del contexto de montaje y vida observado.

### 3.4 Operaciones name-bound y descriptor-bound

No clasificar una operación como descriptor-bound si su implementación vuelve a resolver un path.

- Descriptor-bound típicas: `fstat`, `fsync`, `ftruncate`, `fchmod`, lectura/escritura por fd.
- Name-bound típicas: `stat/lstat`, `openat`, `unlinkat`, `renameat`, `linkat`.

La presencia de un dirfd reduce el espacio de resolución, pero no hace condicional una operación destructiva al inode previamente inspeccionado.

## 4. Requisitos P07-A…P07-E

### P07-A — Identidad de raíz y política de aliases

Requisito:
- La raíz efectiva y el contexto de resolución se registran y anclan cuando la implementación lo permita.
- Symlink final/intermedio, hardlink, bind mount, ruta relativa y montaje son clases distintas.
- La igualdad de inode no fusiona automáticamente dominios de admisión.
- Diferencias textuales de path tampoco separan automáticamente dominios.

Aceptación:
1. Política de aliases aprobada por el propietario antes de selección.
2. Cada clase se clasifica explícitamente como mismo dominio, dominio separado, prohibida o no observable.
3. Hardlinks a directorios no se presuponen: el escenario hardlink aplica a objetos donde la plataforma/filesystem lo permita.
4. Escape por `..`, symlink prohibido o resolución fuera del límite produce STOP.
5. Política ausente o ambigua => BLOCKED/UNKNOWN; no PASS.

### P07-B — Identidad, tipo y contrato del destino

Requisito:
- Cada rol define tipo permitido, ownership/permisos y contrato de contenido.
- Validar el objeto abierto mediante fd cuando sea posible.
- Tamaño cero no es tipo inválido por defecto.
- FIFO se inspecciona sin bloquear el harness.
- Tipo inesperado no autoriza cleanup.

Aceptación:
1. Distinguir regular, directorio, symlink, FIFO, socket y dispositivo cuando esté disponible.
2. Distinguir metadata ausente, ilegible, corrupta, parcial y ajena.
3. Ownership/permisos no verificables => UNKNOWN/BLOCKED.
4. Tipo inesperado => STOP sin cleanup destructivo.

### P07-C — Vinculación replacement-safe de operaciones destructivas

Requisito:
Una operación de cleanup, eliminación o reemplazo no debe afectar un objeto sustituto que no fue atribuido a la operación autorizada.

No son garantías suficientes por sí solas:
- `stat/fstat` seguido de `unlink/unlinkat/rename` por nombre;
- mantener fd abierto y luego eliminar por nombre;
- comparar inode inmediatamente antes de unlink;
- usar PID, timestamp, token, tamaño o nombre temporal;
- usar dirfd sin garantía adicional;
- inspeccionar después del rename;
- repetir una comprobación sin cerrar la ventana de carrera.

Aceptación:
1. Declarar qué participantes están cubiertos por el protocolo y qué operaciones deben pasar por admisión.
2. Para participantes cubiertos, demostrar serialización real y orden observable; no exigir una intercalación que el mecanismo correcto impide.
3. Para actores crudos, caracterizar el límite R1 sin reclamar enforcement fuera del modelo.
4. Si se reclama prevención de sustitución dentro de una ventana, el seam debe estar en el producto entre última verificación relevante y syscall destructiva.
5. El seam debe preservar la secuencia real de ejecución; una barrera externa o decorativa no prueba la ventana.
6. Incluir control positivo del harness y control positivo del producto cuando el contrato permite cleanup propio.
7. Incluir centinela negativo cuya identidad, nombre y namespace se comprueben conforme a §3.2.
8. Si no se puede instrumentar u observar una propiedad necesaria, resultado UNKNOWN.
9. Si la atribución no está demostrada, no ejecutar cleanup destructivo por nombre; conservar residuo y devolver estado conservador.
10. Owner ausente, parcial, ilegible, corrupto o ajeno nunca autoriza cleanup.

**Resultados permitidos:** prevención demostrada, serialización demostrada, detección/fail-closed caracterizada, o UNKNOWN. No mezclarlos.

### P07-D — Creación, coordinación, visibilidad, persistencia y crash

Propiedades independientes:
1. Exclusividad de creación.
2. Coordinación advisory entre participantes cooperativos.
3. Atomicidad de visibilidad del nombre.
4. Persistencia solicitada de archivo.
5. Persistencia solicitada de entrada de directorio.
6. Supervivencia observada a crash de proceso.
7. Durabilidad ante pérdida de energía.

Un process crash no es power-loss test. La presencia de datos tras SIGKILL no prueba que fsync se ejecutó. La ausencia de fsync no obliga a que los datos desaparezcan.

Aceptación:
- Cada cutpoint se expresa como `última syscall completada → siguiente syscall pendiente`.
- El proceso anuncia el cutpoint y queda detenido antes de que el harness envíe señal.
- Se registra quién envió la señal y se espera la terminación/reaping antes de inspeccionar estado de proceso.
- Estados parciales sembrados por el harness se etiquetan como fixtures, no como resultado de crash real.
- La emisión de fsync requiere evidencia de nivel API o syscall tracing declarado; no se infiere del estado final.
- fsync de archivo y fsync de directorio se registran por separado.
- Durabilidad física queda fuera salvo evidencia específica apropiada.

### P07-E — Permisos y modelo de actores

Clases:
1. Participante cubierto: actor que debe respetar la frontera de admisión definida por el modelo ratificado.
2. Actor crudo/no cooperativo: ignora el protocolo; queda fuera de enforcement R1 si así se ratifica, pero puede servir para caracterizar límites.
3. Root/OS comprometido/actor privilegiado: fuera del modelo declarado R1.

Aceptación:
- Cada escenario con actor B declara `clase(B) = cubierto | crudo | privilegiado | no_clasificable`.
- Para B cubierto, oráculo de serialización/admisión.
- Para B crudo, oráculo de caracterización, sin reclamar prevención.
- Para actor no clasificable, UNKNOWN-STOP.
- Advisory locks no se describen como mandatory ni como protección contra writer directo.

## 5. Veredictos y clases de resultado

### 5.1 Veredicto del harness

- `PASS`: precondiciones, intercalación y oráculo completos observados.
- `FAIL`: contraejemplo reproducible respecto al requisito.
- `UNKNOWN`: evidencia insuficiente o ambigua.
- `BLOCKED`: precondición externa no satisfecha.
- `INVALID`: fixture, control, seam o intercalación no prueba lo que afirma.
- `NOT_APPLICABLE`: escenario fuera del target/modelo con razón documentada.

### 5.2 Clase del resultado

Además del veredicto, registrar una clase:

- `PASS_CARAC`: caracterización correcta de una primitiva, limitación o estado.
- `PASS_GATE`: propiedad del gate demostrada dentro del alcance y dependencias declarados.
- `DETECTION_ONLY`: divergencia detectada y operación detenida; no prueba prevención.
- `SERIALIZATION`: participantes cubiertos quedaron ordenados por la frontera.
- `RETENTION_VERIFIED`: residuo conservado de forma comprobada por política fail-closed.

`PASS_CARAC` nunca se convierte automáticamente en `PASS_GATE`.

### 5.3 Estado del producto

- `ESTABLISHED`: propiedad demostrada dentro del alcance explícito.
- `DEGRADED`: garantía más débil declarada y aceptada.
- `UNKNOWN`: propiedad no establecida.
- `STOP`: operación protegida no debe continuar.

No mapear harness PASS a producto ESTABLISHED sin cobertura aplicable, fingerprint válido, oráculos correctos y dependencias cerradas.

## 6. Limpieza y residuos

Hasta que el propietario ratifique política de cleanup:
- no se presupone que el producto deba limpiar en todos los errores;
- el harness puede tener un control propio de capacidad de limpieza, separado del comportamiento del producto;
- si el producto tiene política de retención, `RETENTION_VERIFIED` puede ser resultado positivo del contrato sin llamarlo cleanup PASS;
- residuo de procedencia desconocida, metadata corrupta o fd perdido se conserva;
- no se adopta un temporal preexistente solo por nombre, token, PID, timestamp o contenido coincidente;
- la política de límites de acumulación de residuos y readmisión corresponde a P05/decisión del propietario.

## 7. Reglas de selección y cierre

No seleccionar mecanismo por disponibilidad aislada. Evaluar por separado:
- raíz/aliases y contexto;
- tipo/identidad;
- admisión y actores;
- cleanup/reemplazo;
- publicación/visibilidad/persistencia.

P07 no cierra por:
- stat/lstat aislados;
- igualdad de inode sin política;
- O_NOFOLLOW como protección de toda la ruta;
- flock/fcntl como mandatory;
- stat/fstat seguido de unlink;
- rename como compare-and-swap de inode;
- fsync como durabilidad física;
- prueba de un solo proceso para propiedad interproceso;
- intercalación sin control de que realmente ocurrió;
- PASS sin fingerprint reproducible.

Cierre exige, como mínimo:
1. contrato ratificado;
2. mecanismo seleccionado y autorizado por la autoridad correspondiente;
3. escenarios aplicables y controles completos;
4. harness implementado con SHA;
5. evidencia por escenario y fingerprint exacto;
6. P09 resuelto para callers/writers cubiertos;
7. P05 resuelto para release/readmisión;
8. claims limitados al modelo y target efectivamente probados.

## 8. Decisiones reservadas al propietario

No inferir ni cerrar por redacción:
- política de aliases P07-A;
- si el producto puede limpiar objetos propios o solo retener en incertidumbre;
- qué evidencia puede atribuir un huérfano post-crash;
- definición de participante cubierto y ventana R1;
- si sustitución reversible cuenta como “afectar” a efectos de P07-C;
- si detección + fail-closed satisface algún gate o solo caracterización;
- límite de residuos acumulados y relación con P05;
- alcance de pruebas estadísticas para carreras durante resolución;
- ratificación del modelo de actores R1.

## 9. Estado

- P07: **OPEN**.
- P07-C: **UNKNOWN / BLOCKING**.
- V2.2: **propuesta documental en rama aislada; no ratificada**.
- Mecanismo seleccionado: **NINGUNO**.
- Harness P07: **NO IMPLEMENTADO**.
- Pruebas P07: **NINGUNA EJECUTADA POR ESTA PROPUESTA**.
- P05-C: **OPEN / NOT RATIFIED**.
- P09: **OPEN / UNKNOWN**.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional: PENDING/UNKNOWN.
- Commissioning y efectos protegidos: STOP.
- NCS M0: **INCOMPLETO**.
- Runtime, tests, workflows, configuración y dispositivo: **SIN CAMBIOS**.
