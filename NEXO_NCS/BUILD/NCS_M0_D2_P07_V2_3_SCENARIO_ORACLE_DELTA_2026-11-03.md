# NCS M0 — P07 V2.3: delta de matriz y oráculos de escenarios

Fecha: 2026-11-03  
Base: matriz V2.2 `NCS_M0_D2_P07_V2_2_SCENARIO_MATRIX_AND_TEST_ORACLES_2026-11-03.md` en rama `ncs-p07-v2-2-documentary-proposal-2026-11-03`.  
Normativa superior: `NCS_M0_D2_P07_V2_3_NORMATIVE_DELTA_2026-11-03.md`.  
Trazabilidad: `NCS_M0_D2_P07_V2_3_TRACEABILITY_DELTA_2026-11-03.md`.

Estado: **DELTA DE DISEÑO — NO EJECUTADO — NO IMPLEMENTA HARNESS — NO AUTORIZA PRUEBAS NI CAMBIOS DE RUNTIME**.

## 1. Aplicación

Este documento no elimina escenarios V2.2. Sustituye o complementa los oráculos señalados. Todos los escenarios P07-01…22 conservan el contrato común V2.2, más las reglas V2.3 de actor, resultado y evidencia.

Todo escenario con B debe declarar `actor_B_class` antes de ejecutar: `COVERED`, `RAW`, `PRIVILEGED` o `UNCLASSIFIABLE`. Si no hay B, registrar `NOT_PRESENT`. No se permite omitir el campo.

Campos obligatorios por subcaso:
- `harness_verdict`;
- `result_class` (una sola clase; `NONE` si no es positivo); y `gate_basis` cuando `result_class=PASS_GATE`;
- `product_state`;
- `actor_B_class`;
- `root_claim` si afecta raíz (`R-OBJ`, `R-NAME`, `BOTH`, `NOT_APPLICABLE`);
- `fixture_fs_source`, `fixture_fs_destination` y tipos cuando haya rename;
- baseline/post de nombres, fd, identidad contextual, hash y nlink cuando aplique.

## 2. Oráculos corregidos por escenario

| Escenario | Actor B requerido | Clase positiva permitida | Gate / corrección |
|---|---|---|---|
| P07-01 | NOT_PRESENT salvo actor de sustitución | PASS_CARAC; PASS_GATE solo política ratificada | Separar aliases de raíz/directorio de hardlinks a archivos. Hardlink de archivo se evalúa en P07-21. |
| P07-02 | COVERED y RAW en subcasos separados si B sustituye | PASS_CARAC; PASS_GATE solo para requisito de resolución dentro del modelo | Cero interleavings = UNKNOWN. No fusionar resultado covered/raw. |
| P07-03 | NOT_PRESENT salvo fixture externo | PASS_CARAC | El tipo permitido se evalúa por rol. FAIL-CLOSED no implica cleanup. |
| P07-04 | COVERED/RAW según quién altera FS-OWNER o APP-OWNER | PASS_CARAC; PASS_GATE solo si atribución/contrato completos | Separar FS-OWNER de APP-OWNER; fixtures ausente/parcial/ilegible/corrupto/ajeno por capa. |
| P07-05 | COVERED y RAW separados | SERIALIZATION para COVERED si el gate está incompleto; PASS_GATE con `gate_basis=SERIALIZATION` solo si gate completo; RAW = PASS_CARAC | Seam interno entre última verificación y syscall destructiva. RAW no prueba enforcement. |
| P07-06 | COVERED y RAW separados para sustitución | SERIALIZATION o RETENTION_VERIFIED; PASS_GATE solo con atribución y contrato completos | Matriz cutpoint × handler fd/no-fd/foreign-fd × actor class. |
| P07-07 | COVERED/RAW según procedencia del objeto | RETENTION_VERIFIED o PASS_CARAC | Token/nombre/PID/hash no atribuyen por sí solos. Huérfano UNKNOWN se retiene. |
| P07-08 | RAW para writer directo; COVERED para control cooperativo | PASS_CARAC | Resultados en subcasos separados; no PASS_GATE contra RAW. |
| P07-09 | COVERED si harness/worker participa en protocolo; RAW solo si crash actor externo | PASS_CARAC | Diferenciar crash real de fixture sembrado; signal journal y reaping. |
| P07-10 | NOT_PRESENT salvo proceso/actor que cambia disponibilidad | PASS_CARAC | Disponibilidad no equivale a suficiencia ni gate. |
| P07-11 | COVERED y RAW en subcasos si B sustituye | PASS_CARAC | Registrar fd1=I1 y fd2=I2; no claim de protección de nombre. |
| P07-12 | COVERED y RAW separados para sustitución/lock | PASS_CARAC | Lock de I1 no protege automáticamente el nombre que ahora resuelve I2. |
| P07-13 | COVERED para cooperadores; RAW no requerido salvo control explícito | PASS_CARAC | Tabla por flock/F_SETLK/OFD y lifecycle; no generalizar. |
| P07-14 | COVERED para proceso B que confirma contención | PASS_CARAC | SIGSTOP no es exit; confirmar estado T. |
| P07-15 | COVERED y RAW separados si B sustituye | PASS_CARAC | fstat(fd) y stat(path) describen referentes distintos. |
| P07-16 | COVERED y RAW separados cuando B modifica namespace | DETECTION_ONLY; SERIALIZATION si gate incompleto; PASS_GATE con `gate_basis` si gate completo | Registrar R-OBJ/R-NAME por separado. Detección+STOP o no afectar RT-B no es PASS_GATE. |
| P07-17 | COVERED para locks; RAW solo control de límite | PASS_CARAC | F_SETLK, flock y OFD independientes. |
| P07-18a | COVERED/RAW según quien compite por lectura/rename | PASS_CARAC | Mismo filesystem para claim de rename atómico usual; tipos compatibles; lector solapado. |
| P07-18b | COVERED y RAW separados para sustitución destino | DETECTION_ONLY / SERIALIZATION / PASS_GATE según evidencia | Centinela de destino. Rename normal puede desplazarlo; no aprobar P07-C por atomicidad de visibilidad. |
| P07-19 | COVERED/RAW para sustitución entre fallo y cleanup | DETECTION_ONLY / RETENTION_VERIFIED / PASS_GATE según evidencia | Separar A-temp, Library-temp, B-sentinel y cleanup owner; seam exacto o UNKNOWN. |
| P07-20 | NOT_PRESENT salvo proceso de control | PASS_CARAC | Distinguir API spy de syscall trace; file fsync y dir fsync separados. |
| P07-21 | COVERED y RAW separados en Caso B | SERIALIZATION si gate incompleto; RETENTION_VERIFIED; PASS_GATE con `gate_basis` si gate completo | Oráculo separado n1/n2/fd/nlink; decremento de nlink no debe ocultarse si afecta nombre ajeno. |
| P07-22 | RAW para actor crudo y COVERED para control cooperativo | PASS_CARAC | UIDs y permisos solo si verificados; R1 no ratificado = no enforcement claim. |

La tabla especifica el mínimo por escenario; si B no interviene realmente, `NOT_PRESENT` es correcto. Si la clasificación no puede justificarse antes de ejecutar, `UNCLASSIFIABLE` y UNKNOWN-STOP.

## 3. Oráculo ampliado P07-16

Cada subcaso registra:
- `root_claim`: R-OBJ, R-NAME o BOTH;
- fd/dirfd retenido y objeto RT-A;
- path original y resolución posterior;
- RT-B y centinela independiente;
- inventario namespace pre/post;
- si el nombre original desapareció, se desplazó o se recreó;
- si la operación siguió usando RT-A, resolvió RT-B o se detuvo;
- actor_B_class y si el cambio fue covered/raw.

Combinaciones:
1. RT-A sigue abierta, path original resuelve RT-B: R-OBJ puede mantenerse; R-NAME falla.
2. RT-A sigue abierta, path original ausente: R-OBJ puede mantenerse; R-NAME falla.
3. Producto detecta el cambio y se detiene sin tocar RT-B: `PASS/DETECTION_ONLY/STOP`; no P07-C PASS_GATE.
4. B cubierto queda serializado antes de poder cambiar namespace: `PASS/SERIALIZATION` si el gate sigue incompleto; si además se satisfacen cobertura P09, modelo ratificado y todos los criterios del gate, registrar `PASS/PASS_GATE` con `gate_basis=SERIALIZATION`.
5. Prevención del cambio/efecto no atribuido demostrada en el seam relevante y para el alcance completo: candidato a `PASS_GATE` con `gate_basis=PREVENTION_VERIFIED`, sujeto a dependencias.

No declarar R-NAME satisfecho solo por conservar dirfd.

## 4. Oráculo ampliado P07-18

P07-18a:
- source y destination deben compartir filesystem para evaluar rename atómico usual;
- registrar st_dev/mount ID o evidencia equivalente para ambos;
- declarar tipo de cada entrada y si destino existe;
- ejecutar lector solapado y registrar secuencia observada;
- `EXDEV` clasifica condición cross-filesystem, no FAIL de atomicidad local;
- tipo incompatible o restricciones de directorio hacen fixture BLOCKED/INVALID según la causa.

P07-18b:
- centinela B: fd retenido, hash, identidad, nombre y nlink baseline;
- source A: atribución independiente;
- probar rename normal y RENAME_NOREPLACE en subcasos distintos;
- rename normal que desplaza nombre centinela = FAIL de protección si no hay autoridad;
- RENAME_NOREPLACE que conserva destino = caracterización de primitive; no es gate completo por sí mismo;
- actor B y cobertura de protocolo obligatorios.

## 5. Oráculo ampliado P07-19

La matriz de inyección debe indicar:
- función exacta que falla y error devuelto;
- punto exacto en la secuencia del producto;
- objeto temporal que se creó (A-temp o Library-temp);
- descriptor retenido por A y por B;
- nombre que el handler intentará eliminar;
- syscall/API destructiva exacta del cleanup;
- actor_B_class;
- evidencia de que B sustituyó después del fallo y antes del cleanup;
- identidad/nombre/hash/nlink del centinela antes/después.

Si no puede demostrarse el orden fallo → sustitución → cleanup dentro de la secuencia real, escenario UNKNOWN/INVALID. No usar documentación general de Node como prueba de implementación interna libuv. Revisión de fuente exacta no reemplaza ejercicio del producto.

## 6. Oráculo ampliado P07-21

Para Caso A:
- registrar nlink0;
- eliminar n1 solo si A tiene atribución autorizada;
- comprobar n1 ausente, n2 presente y apuntando al objeto original;
- fd sigue al objeto original;
- nlink1 esperado nlink0−1 si no hay mutaciones adicionales.

Para Caso B:
- B crea n1 como hardlink al objeto protegido n2, o sustituye n1 con ese hardlink;
- A no tiene autoridad sobre n1;
- comprobar n1 y n2 por separado;
- si A elimina n1, n2 puede sobrevivir con mismo inode pero nlink disminuye: es FAIL de autoridad sobre namespace aunque el contenido sobreviva;
- si n2 desaparece o cambia identidad/contenido sin autorización, FAIL adicional;
- si delta nlink no concuerda con operaciones observadas, UNKNOWN.

## 7. Regla transversal de PASS

Ningún escenario puede declarar PASS_GATE solo por:
- detectar una sustitución;
- detenerse de forma conservadora;
- retener residuo;
- preservar el fd mientras el nombre protegido se desplazó;
- conservar n2 mientras A eliminó sin autoridad n1;
- observar una syscall/feature disponible;
- ejecutar solo el harness sin ruta real del producto;
- ejecutar solo actores cubiertos cuando el claim pretende incluir actores crudos;
- obtener resultado favorable sin clase de actor fijada previamente.

El escenario no ejecutado nunca es PASS. Todo `PASS_GATE` debe incluir `gate_basis` y referencias de evidencia. La falta de seam no se compensa con sleeps, reintentos o intercalaciones externas.

## 8. Estado

- Matriz P07-01…22: definida por V2.2 más este delta.
- Pruebas ejecutadas: NINGUNA.
- Harness implementado: NO.
- Mecanismo seleccionado: NINGUNO.
- P07: OPEN.
- P07-C: UNKNOWN/BLOCKING.
- P05-C: OPEN/NOT RATIFIED.
- P09: OPEN/UNKNOWN.
- NCS M0: INCOMPLETO.


---

## DELTA — ESTADO VIGENTE DE DEPENDENCIAS (2026-11-07)

- P-05-C: RATIFICADA POR EL PROPIETARIO como política UNKNOWN/BLOCKED sin recuperación automática; P-05 continúa OPEN por falta de mecanismo/enforcement/resolución/evidencia.
- P-09: OPEN/UNKNOWN. La cobertura literal del guard existente es parcial y no cierra loaders computados ni consumidores externos.
- P07-C: UNKNOWN/BLOCKING. La ratificación de P-05-C y la existencia de guardas estáticas no satisfacen oráculos de identidad/cleanup replacement-safe ni cobertura de actores.
- Ningún escenario recibe PASS/PASS_GATE por esta delta. Harness NO IMPLEMENTADO según la evidencia documental consultada; pruebas NO EJECUTADAS.
- NCS M0 INCOMPLETO; commissioning/efectos protegidos STOP.


---

## DELTA — CLASIFICACIÓN DE ACTORES BAJO R1 ACEPTADO (2026-11-07)

La frase de §2 «R1 no ratificado = no enforcement claim» queda superada en cuanto al estado de autoridad: el propietario **ACEPTÓ R1 el 2026-11-02**. La regla vigente es:

- R1 define el límite de confianza aceptado; no demuestra que los actores reales estén dentro de él ni que estén controlados.
- `COVERED` solo puede asignarse a un participante cuya ruta esté demostrablemente sometida al protocolo de admisión P-03/P-04; no se infiere por UID, instalación, nombre de proceso o pertenencia al repo.
- `RAW` sigue siendo actor que ignora el protocolo y queda fuera del enforcement cooperativo, sujeto al límite R1.
- `PRIVILEGED` sigue fuera del modelo aceptado.
- Si no puede determinarse la clase antes del subcaso: `UNCLASSIFIABLE` → UNKNOWN-STOP.
- P07-E continúa OPEN; E2/E3 PARTIAL/NOT CLOSED; P-09 OPEN/UNKNOWN.
- P07-C UNKNOWN/BLOCKING; ningún escenario recibe PASS_GATE por esta actualización.

No se ejecutaron escenarios, harness, tests ni CI.
