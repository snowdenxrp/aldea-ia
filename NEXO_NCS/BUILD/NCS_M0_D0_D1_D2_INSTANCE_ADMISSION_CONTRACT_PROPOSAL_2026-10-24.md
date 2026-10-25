# NCS M0 — propuesta de contrato de instancia D0/D1/D2
Fecha: 2026-10-24
Rama objetivo: `ncs-clean-architecture`
Estado: PROPUESTA DOCUMENTAL — NO ACEPTADA — NO IMPLEMENTADA

## 1. Alcance y límites

Este documento convierte los huecos de diseño ya observados en un contrato candidato verificable. No altera el contrato aceptado por el propietario, no elige decisiones reservadas, y no autoriza cambios de runtime, tests, workflows ni CI.

Evidencia base:
- `NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md`
- `NCS_M0_D0_D1_SOURCE_CONTRACT_DISCREPANCY_REVIEW_2026-10-24.md`
- `NCS_M0_D1_ENTRYPOINT_INVENTORY_NOTE_2026-10-24.md`
- `NCS_M0_NEXO_LUMINA_SEPARATION_CONTRACT_2026-10-24.md`

Los archivos fuente citados en esos documentos siguen siendo el snapshot revisado; antes de implementar se deberán volver a comprobar los blobs contra el HEAD exacto. Este texto no demuestra que el código actual satisfaga el contrato.

## 2. Contrato candidato: raíz y rutas

### 2.1 Interfaz pública

- Cada operación ordinaria recibe exactamente una raíz explícita mediante `--root <directory>` o el equivalente tipado de API.
- Rechazar ausencia de raíz, más de una raíz, raíz vacía y mezcla de `--root` con rutas directas de almacén (`--continuity`, `--chronicle`).
- No aceptar raíz desde variables de entorno, configuración implícita, directorio actual como fallback ni rutas legacy en la primera versión.
- Las rutas directas de almacén quedan limitadas a primitivas internas/de prueba; no son una interfaz alternativa de producción.
- La resolución de comandos no debe crear almacenes, importar datos, reparar estado ni seleccionar automáticamente un almacén distinto.

### 2.2 Derivación de rutas

La raíz es la única entrada de identidad de instancia. Un módulo de instancia deriva las rutas de Continuity, Chronicle y locks a partir de ella. Los llamadores no derivan esas rutas por separado.

Antes de derivar rutas, exigir que la raíz exista y sea un directorio legible; obtener una forma canónica conforme a una política explícita de symlinks/aliases. Si la forma canónica no puede determinarse, hay colisión o el estado es ambiguo, abortar sin mutación.

**Decisión reservada:** la política exacta de symlinks (rechazar todos, permitir solo los que resuelvan de forma estable u otra regla) no se selecciona aquí. Tampoco se afirma protección contra carreras hostiles del filesystem sin una primitiva y prueba específicas.

### 2.3 Bootstrap separado

Bootstrap es una operación distinta y explícita, no un modo implícito de la operación normal.

- La operación normal requiere raíz existente y almacenes existentes, válidos y compatibles con el contrato.
- Raíz ausente, almacén ausente, formato inválido o estado parcialmente inicializado producen fallo cerrado y ningún efecto persistente.
- Bootstrap declara su objetivo, precondiciones, archivos que puede crear y resultado verificable. No importa ni fusiona datos legacy.
- Un fallo parcial de bootstrap no puede ser reinterpretado como éxito; su recuperación queda como estado explícito pendiente, sin reparación automática.
- La interfaz exacta y las garantías de atomicidad de bootstrap quedan abiertas hasta caracterizar el filesystem y el almacenamiento actual.

## 3. Contrato candidato: admisión y snapshots (D2)

### 3.1 Alcance de admisión

Si el producto promete una sola instancia con estado/snapshot coherente y recursos acotados, la admisión debe ocurrir antes de la primera lectura persistente canónica. Eso incluye:
- estado y consultas de misión;
- planes y Open Loops;
- previews de borrador y solicitud;
- append/commit;
- cualquier API pública que materialice snapshots o abra stores/owners.

No basta con proteger solo la escritura: una consulta que abre un store y ejecuta `loadCurrent()` antes de admitir la raíz ya ha cruzado la frontera de persistencia.

**Decisión reservada:** el propietario aún debe fijar la garantía exacta de snapshot, cuánto dura su sección crítica y si la garantía de recursos es por documento, por operación o por instancia. Hasta entonces, tratar toda lectura canónica como dentro de la frontera es la opción conservadora de diseño, no un contrato aceptado adicional.

### 3.2 Contexto admitido y reentrada

- La frontera de instancia valida raíz y produce un contexto de operación con rutas derivadas.
- Las funciones internas reciben ese contexto o dependencias explícitas ya derivadas; no vuelven a admitir la misma instancia de manera anidada.
- Los helpers de preview pueden delegar en otros helpers, pero no adquieren una segunda admisión/lock de instancia.
- Los stores mantienen sus locks actuales hasta que D2 caracterice y apruebe cualquier cambio. Un lock de instancia y los locks por store son garantías distintas; no se sustituyen por inferencia.
- Ningún handle lazy, iterador o callback que lea persistentemente puede escapar de la vida útil admitida sin que su contrato lo permita explícitamente.

## 4. Contrato candidato: padre y proceso hijo Chronicle

El padre `scripts/nexo.mjs` puede analizar/enrutar la petición y lanzar el hijo; no debe mantener un lock no reentrante de instancia mientras espera que el hijo intente adquirirlo.

El hijo `scripts/nexo-chronicle-session.mjs` es una frontera de ejecución independiente:
- cuando se ejecuta directamente, debe validar `--root` y efectuar su propia admisión;
- cuando lo lanza el padre, recibe la misma raíz explícita, pero no debe confiar en un booleano del padre como prueba de admisión;
- el contrato de coordinación debe establecer quién posee el lock en cada tramo y evitar adquisición duplicada;
- un argumento de rutas legacy, ausencia de raíz o combinación ambigua se rechaza antes de abrir/leer/escribir almacenes;
- timeout, terminación del hijo, liberación fallida y resultado desconocido requieren estados explícitos; un proceso terminado no prueba por sí solo que el lock se liberó ni que el commit ocurrió.

**Decisión reservada:** no se selecciona aquí entre admisión del padre y transferencia de ownership al hijo. Se necesita caracterizar el lock actual, el comportamiento de `spawnSync` y las garantías de release antes de elegir el protocolo.

## 5. Frontera Nexo/Lúmina

- Los entrypoints ordinarios de Nexo no importan ni invocan Lúmina para operar sobre Nexo.
- `assistants.mjs` y `simulate.mjs` siguen clasificados como excepciones de diseño fuera del camino ordinario Nexo, no como rutas ya bloqueadas en runtime.
- Preservar la persistencia legítima del mundo y la memoria de aprendizaje de Lúmina.
- No borrar, importar, fusionar ni duplicar automáticamente `persisted.nexoMemory`; cualquier migración es una operación separada, explícita y autorizada.
- Las APIs inferiores de reparación siguen `UNKNOWN/BLOCKED` para cualquier caller de producción no resuelto. Un wrapper bloqueado no prueba exclusión global.

## 6. Aceptación documental D1: criterio de cierre

D1-DESIGN solo puede declararse cerrado cuando exista evidencia vinculada a un snapshot de código exacto de que:
1. cada entrypoint productivo está enumerado desde scripts de paquete, comandos de workflow y guards de ejecución directa;
2. cada arista alcanzable está clasificada: import/export estático, import dinámico, `require`, loader calculado, factory/owner, lectura de snapshot, proceso hijo y destino generado;
3. cada arista tiene fuente/resultado identificable; aristas dinámicas, externas, computadas o no inspeccionadas quedan explícitamente `UNKNOWN/BLOCKED`, nunca se infieren cerradas;
4. la interfaz de raíz, bootstrap, consultas/previews y coordinación padre/hijo está especificada sin contradicciones;
5. las excepciones de Lúmina y las APIs de reparación inferiores tienen clasificación y límites documentados;
6. las pruebas arquitectónicas negativas están especificadas, incluyendo raíz ausente, mezcla raíz+rutas legacy, hijo sin raíz, módulos no resueltos y accesos incidentales desde Lúmina;
7. la estrategia de workflows identifica los archivos que deberán activar CI, sin afirmar cobertura hasta implementar y ejecutar pruebas tras autorización separada.

La implementación de esas pruebas, cualquier cambio de runtime/workflows y su ejecución quedan fuera de este documento.

## 7. Bloqueos no resueltos

- Política exacta de symlinks/aliases y colisiones.
- Garantía de snapshot y duración de sección crítica.
- Protocolo de lock y ownership entre padre e hijo; timeout y release uncertainty.
- Inventario completo de guards y cargadores dinámicos/computados en el snapshot exacto.
- Consumidores externos y downstream no inspeccionados.
- Bootstrap parcial y recuperación sin auto-repair.
- Entorno operativo D3, cutover y rollback.
- Autorización separada para implementación.

## 8. Estado y no-claims

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`; este documento no lo cierra.
- D1-IMPLEMENTATION: no autorizada.
- D2/D3: `OPEN`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows: sin cambios en este trabajo.
- Tests/CI: no ejecutados.
