# NCS M0 — Contratos documentales O7 y P07-C/P05: cobertura y enforcement

Fecha: 2026-11-26  
Rama: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`  
Base documental: `NCS_M0_P05_P07_WRITER_EXCLUSION_FRONTIER_AFTER_TERMUX_2026-11-26.md` (blob `864296afb12a10642799a010ef7d7378f0d7c2cd`; commit reportado `66cc890f2eef2e5f7ab0c103838e6199bd8015a3`).  
Tipo: contrato de aceptación propuesto; no es implementación, decisión de primitiva, ratificación del propietario ni autorización de pruebas.

## 0. Propósito y límites

Convertir la frontera identificada tras Termux en dos contratos verificables y no intercambiables:

- **Contrato A — O7/P09:** cobertura de actores y escritores dentro de un claim de despliegue explícitamente acotado.
- **Contrato B — P07-C/P05:** enforcement, identidad del objeto, cleanup replacement-safe y bloqueo durable ante crash.

Este documento no selecciona `flock`, `fcntl`, OFD locks, marcadores, tombstones, epochs, daemons, journals ni otra primitiva. No autoriza cambios de código, configuración, bootstrap, tests, CI, ejecución en dispositivo, publicación ni efectos protegidos.

## 1. Modelo de claims: separar lo que se demuestra

| Claim | Objeto de prueba | No demuestra por sí solo |
|---|---|---|
| P09 | Todos los callers/consumidores Nexo incluidos en el alcance atraviesan la admisión requerida | Que no existan escritores no-Nexo o escritores RAW |
| O7 | Todos los actores capaces de afectar el objeto protegido están cubiertos o excluidos con evidencia suficiente | Que el mecanismo de exclusión resista crash o cleanup sobre sustitutos |
| P07-A/B | Las rutas cubiertas convergen en el objeto protegido y su identidad se mantiene verificable | Que todos los actores usen esas rutas |
| P07-C | El protocolo de coordinación y su recuperación no permiten readmisión insegura ni cleanup de otro objeto | Que el universo de escritores esté completo |
| P05 | La política de exclusión y estado bloqueado tiene enforcement demostrable | Que una política documental esté implementada |

**Regla:** ninguna evidencia de P09 puede elevar O7 automáticamente. Ninguna evidencia de enforcement puede cerrar O7 si la enumeración de actores sigue incompleta. Ninguna captura puntual del shell prueba ausencia global de actores.

## 2. Contrato A — Cobertura O7/P09

### A1. Declaración obligatoria del alcance

Toda afirmación de cobertura debe declarar antes de evaluarse:

1. **Entorno:** el límite R1 aceptado: Android sandbox, HOME privado de Termux y operación manual en foreground.
2. **Activos:** identidad lógica y ubicación/ruta del store protegido; archivos auxiliares que puedan cambiar admisión, coordinación o recuperación.
3. **Ventana:** cuándo aplica la afirmación (sesión, arranque, ejecución o intervalo definido).
4. **Actores incluidos:** procesos, módulos, APIs, scripts, launchers, tareas, servicios y consumidores que puedan escribir, renombrar, truncar, reemplazar, borrar o alterar permisos/estado relevante.
5. **Exclusiones:** clases fuera del claim, con justificación y evidencia; nunca por mera ausencia en una búsqueda parcial.

El claim R1 no se extiende implícitamente a root, sistema operativo ni procesos hostiles con el mismo UID. Cualquier escritor, servicio, job, addon o actor adicional no excluido expresamente dentro del alcance mantiene el resultado en UNKNOWN/STOP.

### A2. Inventario mínimo de actores y capacidades

El inventario debe mantener filas independientes para:

- Callers Nexo que importan o invocan APIs de Continuity.
- Entry points Nexo dedicados, incluido bootstrap y comandos declarados en package scripts.
- Procesos Lúmina u otros no-Nexo que puedan recibir paths por configuración o argumentos.
- Funciones de persistencia que acepten paths suministrados por caller.
- Launchers de shell, accesos directos, perfiles, scripts locales y comandos de paquete.
- Tareas programadas, servicios, procesos persistentes, jobs y ejecuciones en segundo plano dentro del alcance.
- Addons, plugins, integraciones y consumidores externos habilitados en el despliegue.
- Operaciones indirectas que puedan modificar el objeto: symlink/hardlink cuando aplique, rename, unlink, truncado, reemplazo, cambio de permisos o modificación del directorio padre.

Para cada fila registrar: actor/entrypoint, origen de invocación, capacidad exacta, path/alias de entrada, objeto que puede alcanzar, mecanismo de admisión usado (o ausencia), evidencia, alcance temporal y clasificación.

### A3. Paths y aliases

- Toda variable de entorno, argumento, configuración o API que permita elegir un path debe tratarse como una capacidad de alias hasta que exista una restricción demostrada.
- `UNSET` en un shell capturado significa únicamente “no configurada en ese entorno y momento”.
- No equivale a “imposible de configurar”, “no heredada por otro launcher” ni “ausente de todos los procesos”.
- Un path predeterminado no demuestra que todos los callers usen ese path.
- Una búsqueda por nombres de dos scripts no constituye inventario exhaustivo de launchers ni de scripts de paquete.
- Si un actor puede escribir al mismo objeto por una ruta RAW, debe contarse en O7 aunque no importe código Nexo y no aparezca en P09.

### A4. Evidencia necesaria para incluir o excluir

**Para incluir un actor:** evidencia de la ruta de invocación y de su capacidad de escritura o mutación del objeto protegido, estática o dinámica según el claim.

**Para excluir un actor:** evidencia positiva de que, dentro del alcance declarado, carece de capacidad efectiva para alcanzar o mutar el objeto. La ausencia de coincidencias en una búsqueda, una variable UNSET o la ausencia de un proceso durante una captura no bastan por separado.

**Para afirmar cobertura universal dentro de R1:** inventario reproducible de entrypoints, launchers, configuración heredable, tareas/servicios activos o habilitables y APIs expuestas; límites explícitos del entorno; y demostración de que todo actor incluido converge en enforcement o está efectivamente impedido de alcanzar el objeto.

Si no puede acotarse el universo de actores del despliegue, el claim universal O7 permanece UNKNOWN/STOP. No sustituir “todos los escritores” por “todos los escritores que encontramos”.

### A5. Criterios de salida O7

- **CLOSED:** alcance R1 explícito; inventario de actores reproducible y completo respecto de ese alcance; aliases y rutas RAW controlados o excluidos con evidencia; todo escritor incluido sujeto a enforcement común; ningún actor relevante sin clasificación.
- **PARTIAL:** solo una parte del inventario o de las rutas está demostrada. Debe nombrarse la frontera pendiente; no implica cierre.
- **UNKNOWN/STOP:** alcance o universo de actores no acotado, alias indirecto sin resolver, launcher/servicio/job/addon no clasificado o evidencia insuficiente para excluir.
- **CONTRADICTED:** evidencia positiva de un escritor relevante capaz de afectar el objeto sin enforcement requerido.

P09 se evalúa en paralelo y por separado con su propio grafo de callers. El cierre de P09 no cambia el estado O7 sin satisfacer A1–A5.

## 3. Contrato B — P07-C/P05: enforcement y estado durable

Todo candidato futuro debe demostrar todas las propiedades siguientes, no solo describirlas.

### B1. Identidad del objeto coordinador y del objeto protegido

- Identificar por separado el objeto de coordinación y el objeto de datos protegido.
- Demostrar qué identidad se verifica en adquisición, uso, liberación y recuperación.
- Vincular la verificación con el objeto realmente operado, no solo con un nombre de path o token.
- Definir el comportamiento ante ausencia, sustitución, renombrado, symlink/hardlink, cambio de inode, directorio padre sustituido e ilegibilidad, según los casos aplicables al modelo R1.
- Aplicar el oráculo C3 ya ratificado: clasificar el rol del inode antes de interpretar cambios de `nlink`. C3 no se reabre como decisión pendiente.

### B2. Cleanup/release replacement-safe

- Identificar el objeto exacto sobre el que actúa el cleanup.
- Demostrar que la operación de eliminación/liberación no puede actuar sobre un sustituto creado entre comprobación y operación.
- Definir el resultado ante mismatch de identidad, desaparición, permisos insuficientes, error parcial y crash.
- No aceptar como prueba suficiente una validación previa por nombre seguida de unlink/rename por nombre sin vínculo atómico demostrado entre objeto validado y objeto afectado.
- Si la seguridad depende de cooperación, declarar qué actores cooperan y resolver la cobertura de todos ellos en O7.

### B3. BLOCKED durable e independiente del proceso

- Un fallo que comprometa la integridad de coordinación debe dejar un estado bloqueado que sobreviva a la terminación del proceso dueño.
- Una nueva invocación debe poder observar ese estado y rechazar la readmisión antes de cualquier operación protegida.
- La ausencia/ENOENT, sustitución, corrupción, ilegibilidad o estado ambiguo no pueden interpretarse como autorización para reintentar o readmitir.
- El estado no puede depender exclusivamente de memoria del proceso, PID vivo, antigüedad de archivo o existencia de un lock efímero.
- Deben definirse persistencia, orden de operaciones, crash windows y condiciones exactas de observabilidad; no basta afirmar “durable”.

### B4. Recuperación y reclasificación

- No hay recuperación automática por mera expiración, desaparición del dueño o ausencia de lock.
- Debe existir procedimiento de reclasificación aprobado que determine qué evidencia permite pasar de UNKNOWN/BLOCKED a un estado operativo.
- El procedimiento debe distinguir fallos recuperables, evidencia insuficiente y contradicción de identidad.
- La autoridad para reclasificar no nace de un addon, caller, lock, proceso o mecanismo técnico.
- Hasta que el procedimiento esté definido y autorizado, la salida ante ambigüedad es UNKNOWN/STOP.

### B5. Crash consistency

El candidato debe enumerar las operaciones persistentes y analizar los puntos de crash entre cada par de pasos relevantes, incluyendo como mínimo: creación/adquisición, escritura, sincronización, publicación/rename, release/cleanup, persistencia del estado bloqueado y nueva admisión.

Para cada ventana debe indicar:
- estado durable posible tras reinicio/nueva invocación;
- identidad del objeto que puede observarse;
- si readmisión queda permitida o denegada;
- si cleanup puede afectar un sustituto;
- evidencia que respalda la conclusión.

No se presume atomicidad, durabilidad de directorio, orden de persistencia ni semántica de filesystem sin evidencia específica del entorno y operación.

### B6. Criterio de salida P07-C/P05

- **CLOSED:** B1–B5 demostrados para el entorno y actores cubiertos; crash windows cerradas; cleanup replacement-safe; BLOCKED observable por nueva invocación; procedimiento de reclasificación aprobado; O7 cubierto.
- **PARTIAL:** propiedades concretas demostradas, pero una o más siguen abiertas; enumerar exactamente cuáles.
- **UNKNOWN/BLOCKING:** falta identidad del objeto, análisis de crash, prueba de durabilidad, procedimiento aprobado o cobertura O7.
- **CONTRADICTED:** existe una ruta demostrada de readmisión insegura, cleanup sobre sustituto o pérdida de BLOCKED ante crash.

## 4. Matriz de no-sustitución de evidencia

| Evidencia observada | Puede respaldar | No puede cerrar |
|---|---|---|
| Grafo estático de imports/callers | P09 parcial | O7 |
| Variables UNSET en una captura | Estado de ese shell/instante | Ausencia global de alias |
| Consulta de procesos sin coincidencias | No observación de esos procesos en esa ventana | Ausencia de launchers/servicios futuros |
| Inventario de scripts conocidos | Cobertura de esos scripts | Inventario universal de actores |
| Lock cooperativo | Coordinación entre participantes que lo usan | Escritor RAW que lo ignora |
| Path canónico | Convergencia de rutas que lo respetan | Escritor con path configurable |
| Token/nonce | Correlación lógica definida por su contrato | Identidad del inode realmente eliminado |
| Lock efímero | Exclusión mientras la primitiva y participantes lo sostengan | BLOCKED durable después de crash |
| Tombstone/marker propuesto | Nada hasta demostrar sus propiedades | Cobertura O7 o autorización de mecanismo |
| Test local aislado | Caso concreto probado en ese entorno | CI-VERIFIED, universalidad o cierre M0 |

## 5. Relación con O1–O9 y estado heredado

Este contrato debe evaluarse contra O1–O9 sin reabrir decisiones ya ratificadas:

- O1: GAP — BLOCKED durable tras terminar el dueño no demostrado.
- O2: CONTRADICTED-CODE/GAP — predicados PID/edad observados en rutas inspeccionadas; cobertura completa no demostrada.
- O3: escenarios definidos; identidad del target real UNKNOWN.
- O4: CONTRADICTED-CODE/GAP — validación y cleanup por nombre no vinculan atómicamente el objeto comprobado con el eliminado.
- O5: CONTRADICTED-CODE/GAP — ausencia/ENOENT puede permitir reintento/readmisión en seams descritos.
- O6: GAP — procedimiento aprobado de reclasificación inexistente/no demostrado.
- O7: UNKNOWN — cobertura de todos los escritores no demostrada.
- O8: UNKNOWN — fingerprint reproducible del target ligado al SHA y evidencia completa de actores/permisos pendientes.
- O9: PARTIAL — separación observada en rutas concretas; readmisión sin resolver.
- C3/G2: decisión del propietario resuelta; aplicar el oráculo por rol de inode.

Estado de política heredado: P05-C **RATIFICADA COMO POLÍTICA**; P05 **OPEN**. P07-C **UNKNOWN/BLOCKING**. P09 **OPEN/UNKNOWN**. O7 **UNKNOWN**. M0 **INCOMPLETO**.

Estos estados son la línea base documental de esta unidad, no una reevaluación de los artefactos de implementación ni una afirmación de que el contenido se haya probado en runtime.

## 6. Próxima unidad permitida

La siguiente unidad documental debe ser una evaluación de trazabilidad: mapear cada fila de actores/paths conocida (incluidos RAW-1/RAW-2 y entrypoints declarados) a A1–A5 y mapear cada hallazgo O1–O9/C3 a B1–B6. Cada fila debe citar artefacto y evidencia exacta o permanecer UNKNOWN.

No repetir inventarios ya realizados ni solicitar otra ronda genérica de Termux. Si falta evidencia de un hecho concreto, identificar primero el hecho, la fuente documental que podría probarlo y por qué el dato cambiaría una clasificación. No ejecutar comandos en el dispositivo como sustituto de esta evaluación documental.

## 7. Restricciones y autorización

- `authorization: NOT_EVALUATED`.
- Sin cambios de código, configuración, workflows, bootstrap o runtime.
- Sin tests, CI, commissioning, publicación ni efectos protegidos.
- Sin selección o creación de una primitiva de coordinación.
- Sin cambios a PR #110 ni ramas de producto.
- Este documento es **PROPOSAL / CONTRACT FOR REVIEW**, no DECIDED, IMPLEMENTED, TESTED ni CI-VERIFIED.
