# NCS M0 — P07 V2.1: corrección normativa de identidad filesystem

Fecha: 2026-11-03  
Rama: `ncs-lumina-decoupling-2026-10-29`  
Base: contrato P07 (2026-11-03), comparación Android/Termux (2026-11-03), consolidaciones adversariales Claude, DeepSeek y Qwen recibidas en conversación.  
Estado: **CORRECCIÓN DOCUMENTAL — PROPUESTA TÉCNICA — NO RATIFICADA COMO CAMBIO DE AUTORIDAD — NO SELECCIÓN — NO IMPLEMENTACIÓN — NO AUTORIZA PRUEBAS**

## 1. Resultado ejecutivo

P07 V2.1 corrige contradicciones y falsos oráculos de la V2. No selecciona una primitiva ni declara P07 cerrado.

Conclusiones normativas:

1. `(st_dev, st_ino)` identifica un objeto observado dentro de un contexto filesystem y mientras la identidad sea válida; no es identidad eterna ni prueba de autoridad.
2. Un descriptor abierto mantiene una referencia al objeto abierto; no garantiza que un nombre continúe resolviendo a ese objeto.
3. `stat/fstat` seguido de `unlink/unlinkat/rename` por nombre no es compare-and-unlink ni prevención de sustitución.
4. `dirfd/openat/openat2` puede anclar/restringir resolución de rutas; no crea por sí solo una operación destructiva condicionada a inode.
5. La exclusión de actores hostiles del mismo UID en R1 no excluye carreras entre operaciones cooperativas ni errores del propio protocolo.
6. Si el sistema no puede demostrar que cleanup afecta únicamente al objeto atribuido a la operación, no ejecuta cleanup destructivo por nombre: conserva el residuo y devuelve `UNKNOWN/BLOCKED` según el caso.
7. Exclusividad de creación, coordinación, atomicidad de visibilidad, persistencia y durabilidad física son propiedades diferentes.
8. Los veredictos del harness son independientes del estado del producto.

## 2. Alcance y dependencias

P07 define requisitos de identidad y frontera filesystem para raíz, directorios, destinos, lock objects, temporales y objetos publicados.

P07 no:
- establece autoridad constitucional de la raíz (P01/P02);
- decide release/readmisión tras incertidumbre (P05);
- demuestra cobertura de todos los callers/writers (P09);
- prueba quiescencia ambiental E2/E3;
- garantiza aislamiento contra root, OS comprometido o actores hostiles excluidos por R1;
- demuestra durabilidad física ante pérdida de energía.

Dependencias:
- P05 gobierna el estado operativo tras release incierto; P07 solo entrega observaciones verificables.
- P09 debe demostrar qué writers/callers entran por la frontera cubierta. Una primitiva no prueba que todos la utilicen.
- R1 limita el modelo de actores, pero no convierte una operación path-based vulnerable en segura.
- P03/P04 ratificadas gobiernan admisión, ownership de API y límites de lectura/escritura; P07 no crea un bypass ni traslada la admisión a stores.

## 3. Modelo de identidad

### 3.1 Objeto, nombre, descriptor y dominio

- **Nombre:** componente o secuencia de componentes que el filesystem resuelve en un instante. Es mutable.
- **Descriptor (fd):** referencia abierta a un objeto/open file description conforme a la semántica de la API. Permite operaciones descriptor-bound.
- **Objeto filesystem:** entidad referida por el descriptor. `(st_dev, st_ino)` es una observación práctica de identidad, no un identificador eterno.
- **Contexto de resolución:** directorio ancla, montaje, namespace disponible, flags y cadena de componentes usados para resolver un nombre.
- **Dominio de admisión:** conjunto de operaciones que la política autoriza a serializar bajo una misma frontera. No se deduce automáticamente de igualdad de inode.

### 3.2 Límites de identidad

1. El inode puede reutilizarse después de que el objeto deje de existir. La comparación debe tener en cuenta la vida del objeto y, cuando sea relevante, mantener el descriptor abierto durante la ventana de observación.
2. `st_dev/st_ino` no expresa por sí solo el contexto de montaje ni la autoridad asociada a una ruta.
3. Un bind mount y un symlink no son aliases equivalentes. Deben probarse y clasificarse por separado.
4. Dos nombres hardlink pueden referir al mismo inode; eso no obliga a fusionar dominios de autorización sin política explícita.
5. Un dirfd ancla el directorio abierto, incluso si su nombre cambia; no congela los nombres contenidos ni prueba que el directorio sea la raíz constitucional aprobada.
6. El tamaño, mtime, ctime, PID, timestamp y nombre temporal son atributos/evidencias auxiliares, no identidad suficiente por sí solos.

### 3.3 Descriptor-bound y name-bound

Operaciones típicamente descriptor-bound incluyen `fstat`, `fsync`, `ftruncate`, `fchmod` y operaciones de lectura/escritura sobre fd.

Operaciones como `openat`, `stat`, `unlinkat` y `renameat` resuelven nombres. El uso de dirfd limita el punto de partida, pero no convierte el nombre final en una referencia estable al inode previamente observado.

No afirmar que una operación es descriptor-bound si su implementación vuelve a resolver un path.

## 4. Requisitos P07-A…P07-E corregidos

### P07-A — Identidad de raíz y política de aliases

Requisito:
- Resolver la raíz efectiva una vez para la operación y conservar una referencia anclada cuando la implementación lo permita.
- Definir explícitamente qué aliases pertenecen al mismo dominio de admisión.
- No fusionar dominios automáticamente solo porque dos observaciones `(st_dev, st_ino)` coincidan.
- No separar dominios automáticamente por diferencias textuales de path.
- Symlink, bind mount, hardlink, ruta relativa y montaje deben ser clases de alias distintas.

Aceptación:
1. Política de aliases aprobada y documentada antes de la selección.
2. Comparación de identidad acompañada de contexto de resolución disponible.
3. Escape por `..`, symlink no permitido o resolución fuera del límite produce STOP.
4. Incapacidad de determinar alias o contexto relevante produce UNKNOWN.
5. La identidad filesystem no se presenta como autoridad constitucional.

### P07-B — Identidad del destino y tipo

Requisito:
- Cada rol filesystem define tipo permitido, ownership/permisos esperados y contrato de contenido.
- Tipo se valida sobre el objeto abierto cuando sea posible, no mediante un stat separado seguido de uso por nombre.
- Tamaño cero no es tipo inválido por defecto; solo se rechaza si el contrato específico exige contenido no vacío.
- El tamaño es estado mutable, no parte de la identidad estable.

Aceptación:
1. Distinguir archivo regular, directorio, symlink, FIFO, socket y dispositivo.
2. Evitar bloquear al abrir FIFO; usar una estrategia de inspección no bloqueante o metadata sin seguir enlaces.
3. Rechazar symlink cuando el rol no lo permite.
4. Ownership/permisos no verificables => UNKNOWN/BLOCKED; nunca interpretar como ausencia.
5. Tipo inesperado => STOP sin cleanup destructivo.

### P07-C — Vinculación de operación destructiva al objeto validado

Requisito:
- Una operación de cleanup, eliminación o reemplazo no puede afectar un sustituto que no fue atribuido a la operación.
- Las comprobaciones `stat`, `fstat` o comparaciones de inode antes de una operación por nombre no constituyen por sí solas prevención.
- `unlinkat(dirfd,name)` no es compare-and-unlink.
- `renameat/renameat2` no valida que `old_name` siga apuntando al inode previamente inspeccionado.
- `open(path) → fstat(fd) → unlink(path)` tampoco proporciona esa garantía.

Aceptación:
1. Identificar una primitiva o protocolo de exclusión que garantice el requisito bajo el modelo R1 y el conjunto de writers cubiertos.
2. Demostrar que la operación destructiva afecta al objeto atribuido, no solo que detecta una divergencia previa.
3. Incluir control positivo: la operación autorizada realmente se realiza sobre el objeto de prueba propio.
4. Incluir control negativo: el sustituto centinela permanece intacto bajo intercalación reproducible.
5. Si la garantía depende de que todos los writers respeten admisión, esa dependencia debe demostrarse por P09 y la frontera P03/P04.
6. Si no se puede demostrar, no hacer cleanup destructivo por nombre; conservar el residuo y devolver UNKNOWN/BLOCKED.
7. El error de lectura de owner, metadata ausente, corrupta o ilegible nunca autoriza cleanup.

**No son soluciones suficientes por sí solas:** comparar inode inmediatamente antes de unlink; mantener fd abierto mientras se elimina por nombre; usar PID/timestamp/token; usar dirfd sin una garantía adicional de exclusión; hacer stat después del rename; repetir la comprobación.

### P07-D — Publicación, visibilidad y durabilidad

Mantener propiedades separadas:

1. **Exclusividad de creación:** por ejemplo, creación atómica con exclusión de nombre bajo la semántica real del FS.
2. **Coordinación:** locks advisory entre participantes que respetan el protocolo.
3. **Atomicidad de visibilidad:** lectores observan el nombre antes/después de un rename atómico bajo las condiciones aplicables; no implica fencing.
4. **Persistencia solicitada:** éxito de fsync del archivo y, cuando corresponde, del directorio.
5. **Supervivencia observada a crash de proceso:** observación tras terminación del proceso, sin inferir pérdida de energía.
6. **Durabilidad ante pérdida de energía:** claim separado que requiere evidencia específica de filesystem/hardware; no se demuestra con process crash.

Aceptación:
- Definir punto de linealización y resultado por fase.
- Distinguir fsync del archivo de fsync del directorio.
- Separar resultado de persistencia de resultado de release.
- No exigir que una fase sin fsync pierda datos para considerar válida la prueba.
- Error de fsync/rename se clasifica; no se convierte en éxito ni fallback silencioso.
- Temporal huérfano no se elimina si la identidad no puede atribuirse de forma segura.

### P07-E — Permisos y modelo de actores

Clases:
1. Participantes cooperativos que respetan admisión.
2. Otros procesos del mismo UID que ignoran el protocolo: fuera del claim de enforcement R1, pero sus límites deben declararse.
3. Root, OS comprometido y actores privilegiados: fuera del modelo R1.

Aceptación:
- Declarar quién puede crear, renombrar, borrar y sustituir durante la ventana.
- Inspección puntual de permisos no equivale a exclusión sostenida.
- Un lock advisory coordina cooperadores; no impide a un writer directo ignorarlo.
- Las carreras entre participantes cubiertos siguen dentro del requisito.
- Actor o permiso crítico no clasificable => UNKNOWN-STOP.

## 5. Veredictos: harness vs producto

### 5.1 Harness (por escenario)

- `PASS`: precondiciones satisfechas y oráculo completo observado.
- `FAIL`: el comportamiento contradice el requisito.
- `UNKNOWN`: evidencia insuficiente o resultado ambiguo.
- `BLOCKED`: la prueba no pudo iniciarse por una precondición o permiso ausente.
- `INVALID`: el harness, fixture, control o intercalación no prueba lo que afirma.
- `NOT_APPLICABLE`: escenario fuera de la plataforma/modelo, con justificación.

### 5.2 Producto (por propiedad)

- `ESTABLISHED`: requisito demostrado dentro del alcance explícito.
- `DEGRADED`: solo se satisface una garantía más débil, declarada expresamente.
- `UNKNOWN`: no se puede establecer.
- `STOP`: operación protegida no debe continuar.

No mapear automáticamente harness PASS a producto ESTABLISHED. Cada propiedad requiere cobertura de todos los escenarios aplicables, entorno/fingerprint válido y resolución de dependencias.

## 6. Matriz de aceptación corregida

| Propiedad | Estado de evaluación actual | Claim permitido |
|---|---|---|
| Exclusividad de creación | Baseline documentado; target no probado aquí | Solo creación de nombre bajo primitivas/FS comprobados |
| Coordinación cooperativa | Advisory, semántica concreta pendiente de prueba | Solo participantes que respetan el lock |
| Atomicidad de visibilidad | Documentada para rename bajo condiciones | No equivale a fencing ni durabilidad |
| Persistencia de archivo/directorio | UNKNOWN en POCO | No reclamar hasta prueba específica |
| Durabilidad ante pérdida de energía | UNKNOWN / no demostrada | No reclamar |
| Detección de sustitución | Posible mediante observación de identidad, aún no probada en target | Detección puntual, no prevención |
| Prevención de sustitución | UNKNOWN; no hay mecanismo seleccionado | No reclamar |
| Cleanup replacement-safe | UNKNOWN / bloqueante P07-C | No ejecutar cleanup ambiguo por nombre |
| Aislamiento contra writer no cooperativo mismo UID | Fuera del claim R1 | Documentar límite; no afirmar enforcement |
| Autoridad de raíz | Fuera de P07 | No inferir autoridad desde filesystem |

## 7. Reglas de selección y cierre

No seleccionar mecanismo por disponibilidad aislada. Cada candidato debe evaluarse en cinco ejes separados: resolución de raíz/aliases, tipo/identidad del objeto, admisión, cleanup/reemplazo, publicación/durabilidad.

No se cierra P07 por:
- stat/lstat aislados;
- igualdad de inode sin política de alias;
- `O_NOFOLLOW` tratado como protección de toda la ruta;
- flock/fcntl presentado como mandatory;
- stat/fstat seguido de unlink;
- rename presentado como compare-and-swap de inode;
- fsync presentado como garantía física;
- pruebas de un solo proceso para una propiedad interproceso;
- pruebas sin control positivo y centinela negativo;
- harness PASS sin fingerprint/alcance reproducible.

Cierre requiere contrato ratificado, mecanismo seleccionado y autorizado, escenarios aplicables completos, evidencia SHA del harness, fingerprint del entorno, oráculos válidos, P09 resuelto para callers cubiertos, P05 resuelto para release/readmisión y claims limitados al modelo probado.

## 8. Estado

- P07: **OPEN**.
- V2.1: **propuesta de corrección documental; pendiente de revisión/ratificación**.
- P07-A…E: requisitos corregidos propuestos; no demostrados.
- Mecanismo seleccionado: **NINGUNO**.
- P05-C: **OPEN / NOT RATIFIED**.
- P09: **OPEN / UNKNOWN**.
- Pruebas ejecutadas para esta V2.1: **NINGUNA**.
- Runtime/tests/workflows/configuración/dispositivo: **SIN CAMBIOS**.
- NCS M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; commissioning y efectos protegidos STOP.
