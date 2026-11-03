# NCS M0 — contrato objetivo D1 y clasificación de entrypoints

**Fecha:** 2026-11-02  
**Base de código examinada:** `99dabcb33be1efef5c4f5e368dc95140e45ff672`  
**Rama documental:** `ncs-m0-documentary-reconciliation-2026-11-02`  
**Estado:** PROPUESTA TÉCNICA DE CIERRE DE DISEÑO — NO RATIFICADA COMO IMPLEMENTACIÓN  
**Autorización:** no autoriza cambios de runtime, tests, workflows, CI ni acceso/modificación de la instancia real.

## 1. Decisión de diseño recomendada

D1 debe usar un **modelo de múltiples entrypoints clasificados con admisión obligatoria por operación**, no un requisito artificial de entrypoint único.

El invariante normativo ya ratificado por O-10 es:

> Ningún camino dentro del alcance que lea el snapshot canónico de Continuity o Chronicle puede efectuar su primera lectura persistente antes de adquirir una admisión válida para esa operación. Ser read-only no crea una excepción.

Consecuencias:
- Puede haber varios entrypoints legítimos.
- Cada entrypoint que pueda alcanzar una lectura persistente debe adquirir admisión, o delegar antes de cualquier lectura a un único flujo que la adquiera.
- Ningún helper/factory público debe permitir saltarse la frontera desde un caller de producción.
- Un caller desconocido, dinámico, externo o no clasificable se marca UNKNOWN/BLOCKED; no se cuenta como cerrado.
- El contrato se verifica por camino y por frontera de lectura, no por el nombre del CLI ni por un grep de imports.

Esta opción satisface O-10 sin exigir que toda función pura o cada parser obtenga un lock, y sin transferir automáticamente autoridad Nexo a Lúmina.

## 2. Secuencia obligatoria

Para cualquier operación que pueda leer el snapshot canónico:

1. Parsear argumentos y validar su gramática sin leer stores persistidos.
2. Rechazar argumentos duplicados, contradictorios, faltantes o flags de bootstrap incompatibles con el modo normal.
3. Resolver la única raíz explícita `--root` conforme a O-08.
4. Canonicalizar la raíz y rechazar ambigüedad antes de derivar rutas.
5. Adquirir la admisión de instancia para esa operación.
6. Solo después de admisión, derivar/abrir stores y efectuar la primera lectura persistente.
7. Mantener la admisión durante todo el intervalo en que el snapshot leído pueda influir en la decisión o resultado de la operación.
8. Completar la operación y resolver el release según el contrato D2.
9. Si el release es incierto, conservar el resultado de negocio/persistencia observado por separado y bloquear readmisión conforme a O-11/P05 pendiente.

La admisión no puede depender de leer Continuity o Chronicle primero. La lectura de metadatos estrictamente necesaria para validar/canonicalizar `--root`, adquirir el lock o resolver identidad del lock debe ser especificada en D2; no se declara exenta por silencio.

## 3. Clasificación de superficies conocidas en el snapshot de código

La siguiente clasificación resume la revisión directa ya realizada en el HEAD indicado. No es una afirmación de cobertura completa de todos los consumidores externos/dinámicos.

| Superficie | Comportamiento observado/relevancia | Clasificación D1 objetivo |
|---|---|---|
| `scripts/nexo.mjs` | CLI principal acepta `--continuity`; no se observó contrato completo de `--root` obligatorio ni admisión común previa a lecturas | Entry point de producción: validar root y adquirir admisión antes de delegar a cualquier lectura |
| `scripts/nexo-chronicle-session.mjs` | Proceso hijo ejecutable directamente; acepta flags de store de forma independiente; requiere validación propia | Entry point de producción independiente: parsear/validar root, adquirir su propia admisión y luego leer/append |
| `scripts/nexo.mjs` → child Chronicle | Padre usa `spawnSync`; no debe mantener una admisión que el hijo vuelva a adquirir | Padre valida args/decide delegación sin retener lock de instancia mientras espera; hijo es dueño de admisión |
| `src/nexo/application/continuity-queries.mjs` | Queries status/mission-status/plan/preview/Open Loops abren store path-oriented y ejecutan `loadCurrent()` | API de aplicación con precondición: solo invocable tras admisión vigente; alternativamente wrapper de operación admitida que no exponga lectura sin gate |
| `src/nexo/application/chronicle-append.mjs` | Construye factories/owner y carga stores; orden de apertura/lectura debe quedar detrás de admisión | API de aplicación: no abrir owner/store ni leer antes de comprobar que el caller posee admisión |
| `src/nexo/core/continuity-service.mjs` | Servicio crea store desde path | Servicio/factory interna; no debe ser ruta pública de producción que permita leer sin admisión |
| `continuity-store.mjs` / `chronicle-store.mjs` | Factories exportadas por path; primitives pueden ser llamadas directamente | Primitives internas; el grafo de callers debe demostrar que no quedan consumers productivos fuera de wrappers admitidos |
| `scripts/nexo-continuity.mjs` | Compatibilidad/reexport de owner API | Clasificar como compatibilidad, consumidor externo y política de soporte; no presumir que reexport equivale a gate |
| `assistants.mjs` | En el HEAD revisado no importa owner Continuity, runtime repair, mission builder ni path de Continuity | Mantener fuera del flujo ordinario Nexo; preservar separación Nexo/Lúmina |
| `simulate.mjs` | En el HEAD revisado no importa Continuity; mantiene `nexoMemory` opaco | Mantener estado Lúmina opaco; no inferir que `nexoMemory` sea Continuity Nexo ni persistencia autorizada |

### 3.1 Clasificación de APIs de bajo nivel

La exclusión de repair por O-07 es una exclusión de alcance operativo, no una prueba de inaccesibilidad técnica. Las superficies lower-level `runNexoRepairSession`, `runNexoRepairOnce`, `dispatchPreparedRepair` y los edges Lúmina/effect-adapter deben permanecer declarados EXCLUDED/BLOCKED para el flujo M0 operativo, salvo que una prueba de grafo demuestre una restricción técnica. No se debe describirlas como “imposibles de invocar”.

### 3.2 Callers que siguen UNKNOWN

Este documento no cierra:
- imports dinámicos/computados no enumerados;
- `require()` u otros mecanismos CommonJS;
- consumers externos de factories/exportaciones;
- callers no productivos que puedan acceder directamente a stores;
- otros procesos/hijos que puedan leer los mismos archivos;
- caminos futuros añadidos después del SHA de referencia.

Cada arista no clasificada conserva UNKNOWN/BLOCKED hasta evidencia específica. No repetir el barrido general de 188 archivos: resolver solo las aristas concretas identificadas y las que surjan de cambios posteriores.

## 4. Contrato padre/hijo Chronicle

Regla propuesta:
- Padre y child validan la gramática de argumentos que les corresponde.
- El padre no adquiere ni mantiene el lock de instancia durante `spawnSync`.
- El child Chronicle es un entrypoint real, directamente invocable y responsable de validar `--root`, canonicalizar y adquirir su propia admisión antes de abrir/leer Continuity o Chronicle.
- El padre no transmite una “admisión heredada” ni un token que el child acepte como sustituto de su propio protocolo.
- Flags duplicados, contradictorios, ausentes o de bootstrap en modo normal se rechazan antes de cualquier lectura persistente.
- El mapping root→store paths debe ser determinista y común, pero el layout exacto de Continuity/Chronicle sigue OPEN; no asumir nombres ni ubicaciones no ratificados.

Esta regla mantiene la decisión de diseño ya asentada: **el hijo posee su admisión**. No adoptar el modelo Gemini de lock global heredado por el hijo.

## 5. APIs internas y superficie pública

Objetivo:
- Separar operaciones admitidas (status, mission-status, mission-plan, Open Loops, previews y Chronicle append) de primitives de store.
- Evitar que un caller de producción pueda construir un owner o store y leer directamente sin demostrar admisión.
- No es obligatorio que cada función pura adquiera lock: parseo, validación sintáctica y cómputo sobre datos ya cargados pueden permanecer puros.
- Una API que acepte un snapshot ya cargado no crea bypass por sí sola; la frontera crítica es quién obtuvo ese snapshot y bajo qué admisión.
- La admisión debe ser explícita en el diseño de llamadas, no una convención implícita ni una bandera booleana falsificable.

No se prescribe todavía la forma de API (token, closure, context object o composición privada). Elegir el mecanismo de implementación solo después de caracterizar la arquitectura actual y revisar P03/P04. No inventar un token de seguridad que no resista callers no cooperativos o procesos hostiles.

## 6. Límites de estado Nexo/Lúmina

- Continuity y Chronicle canónicos: dominio Nexo, sujeto al contrato de admisión.
- World simulation / learning memory: dominio Lúmina.
- `state.nexoMemory` y ramas legacy: ownership histórico no demostrado; no migrar, fusionar, dual-write ni borrar por inferencia.
- `assistants.mjs` y `simulate.mjs`: exclusión del flujo ordinario Nexo no equivale por sí sola a aislamiento técnico completo.
- No transferir admisión/autoridad Nexo a Lúmina, ni convertir memoria de simulación en memoria operacional Nexo.

O-09 exige definir fronteras antes de elegir refactor. Esta tabla conserva como UNKNOWN lo que aún no está resuelto.

## 7. Condiciones de cierre de diseño D1

D1-DESIGN solo podrá proponerse CLOSED cuando exista:
1. Manifest versionado de entrypoints y APIs con caller, dominio, capacidad de lectura y política de invocación directa.
2. Regla inequívoca de admisión antes de la primera lectura persistente para todas las operaciones dentro del alcance, incluyendo queries y previews.
3. Contrato padre/child Chronicle coherente con ownership del child y sin lock heredado.
4. Contrato de root/mapping compatible con O-08, con layout aún no ratificado explícitamente marcado como abierto.
5. Frontera explícita Nexo/Lúmina sin migración/dual-write implícitos.
6. Lista finita de edges UNKNOWN/BLOCKED con consecuencia de alcance; ninguna arista desconocida declarada PASS.
7. Criterios de verificación que puedan ligarse a tests y a SHA exacto después de autorización independiente.
8. Separación visible entre propuesta, ratificación, implementación, test ejecutado y CI.

## 8. Puertas que no se cierran aquí

- D1-IMPLEMENTATION: NO AUTORIZADA por este documento.
- Tests negativos, pruebas de composición, import-graph/AST, subprocess tests y CI: requieren autorización específica posterior.
- D2 admission/release, identidad del lock, release uncertainty, readmission y recovery: OPEN.
- D3: OPEN.
- Root legítima: PENDING/UNKNOWN.
- `authorization: NOT_EVALUATED`; `ROOT_READY` no establecido.
- `M0_BUILD_COMPLETE`: NOT ACHIEVED.
- Efectos protegidos: STOP.

## 9. Orden de trabajo posterior

1. Reconciliar este contrato con las decisiones P03/P04 sin volver a reauditar el repositorio entero.
2. Resolver layout root→store mapping y la gramática exacta de flags con O-08; mantener abierto lo no decidido.
3. Cerrar la clasificación de callers desconocidos solo mediante evidencia puntual y ligada al SHA.
4. Preparar tests de aceptación por operación y primer read boundary.
5. Solicitar autorización separada para implementar D1 y otra para ejecutar tests/CI.
6. No avanzar a D2 release/recovery como si D1 ya estuviera cerrado.

## 10. Estado de este artefacto

Documento creado como propuesta técnica en rama documental independiente. No altera la rama de producto ni PR #110. No modifica runtime/tests/workflows/package scripts ni el archivo real de Continuity. No se ejecutaron tests o CI. No constituye cierre D1 ni nueva decisión del propietario.


---

## DELTA DE ACLARACIÓN — COMPOSICIÓN, REENTRADA Y PRE-I/O (2026-11-03)

La interpretación técnica propuesta de este contrato se complementa con [NCS M0 — addendum de cierre de brechas D1/D2](NCS_M0_D1_D2_GAP_CLOSURE_ADDENDUM_2026-11-03.md), especialmente §§3–7.

Reglas aclaradas:
- En delegación pura Chronicle, el padre no adquiere admisión ni lee stores; el child es el único owner y adquiere su admisión propia. Si el padre necesita leer snapshot, esa lectura es una operación admitida propia y no puede mantener el lock mientras espera al child ni transferir un snapshot tras liberar como si siguiera vigente.
- Los helpers no readquieren admisión ni reabren stores; reciben datos ya cargados dentro de la operación admitida.
- La reentrada debe rechazarse/STOP antes de otra lectura persistente; la frontera de adquisición/composición impide que helpers actúen como owners alternos.
- La lista permitida de I/O previo a admisión y las operaciones expresamente prohibidas se fijan en el addendum §5. No existe excepción general a O-10.
- Las condiciones D1 se separan entre cierre de diseño y verificación de implementación; no son PASS ni autorización de tests.

Estado sin cambio: D1 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; root legítima PENDING/UNKNOWN; authorization NOT_EVALUATED; ROOT_READY NOT ESTABLISHED; M0_BUILD_COMPLETE NOT ACHIEVED; efectos protegidos STOP.

## 11. DELTA — separación estricta entre Chronicle initialization y append (2026-11-03)

### 11.1 Hallazgo estático ligado al SHA de referencia

En `src/nexo/application/chronicle-append.mjs` blob `c1964467d68043d06e035ad59720f8cec2e52e52`, `runNexoChronicleAppend()` recibe `initializeChronicle` como booleano. Después de validar/preflight de los stores, si Chronicle está ausente y `initializeChronicle` es `true`, el propio flujo de append invoca `chronicleStore.initialize()` antes de continuar con la admisión/append. Por tanto, la API de append conserva una ruta que combina inicialización y operación ordinaria. Este es un hallazgo estático del blob indicado; no es una prueba de ejecución ni de carrera.

### 11.2 Regla objetivo propuesta

1. `runNexoChronicleAppend()` no inicializa Continuity ni Chronicle bajo ninguna combinación de argumentos.
2. La opción `initializeChronicle` debe desaparecer del contrato público de append. Mientras exista por compatibilidad, cualquier presencia —`true` o `false`— debe rechazarse como argumento no admitido, o la capa CLI debe rechazar el flag antes de invocar el caso de uso. No debe tratarse `false` como una autorización futura ni ignorarse silenciosamente un flag desconocido.
3. Si Chronicle está ausente, append devuelve BLOCKED/UNAVAILABLE antes de admisión de misión, efectos o escritura. No crea archivo, directorio, lock de inicialización ni envelope vacío como side effect.
4. La inicialización Chronicle es una operación separada y explícita. Debe validar la misma root O-08 y mapping P08, adquirir su propia admisión de instancia antes de cualquier lectura persistente (O-10), y ejecutar la inicialización del store bajo el lock per-store correspondiente.
5. La inicialización no puede compartir una invocación con append, mission admission, dispatch, step execution ni efectos. Tras inicializar, la operación termina; cualquier append posterior es una nueva operación con admisión independiente.
6. La operación separada requiere autorización operacional humana explícita para crear Chronicle en el destino efectivo mostrado previamente. La autorización de la primera publicación de Continuity del 2026-11-02 no se extiende a Chronicle ni a otras inicializaciones.
7. Una query/read-only con Chronicle ausente no lo crea; devuelve estado unavailable/blocked según el contrato de query. No se permite inicialización implícita por status, preview, query, append, reparación o fallback.
8. El documento inicial debe conservar el schema/version del store soportado (`NEXO_CHRONICLE`, v1, revision 0, entries vacías) salvo una decisión de formato separada. No sobrescribir, migrar ni reemplazar objetos existentes o de tipo desconocido.

### 11.3 Casos de aceptación futuros

| Entrada/estado | Resultado requerido |
|---|---|
| Append sin Chronicle | BLOCKED/UNAVAILABLE; ninguna inicialización ni escritura |
| Append con `initializeChronicle: true` | Rechazo antes de I/O persistente |
| Append con `initializeChronicle: false` | Rechazo si la propiedad/flag aún forma parte de la entrada; retirar del contrato en versión limpia |
| CLI append con `--initialize-chronicle` | Rechazo antes de abrir/leer stores |
| Query con Chronicle ausente | Sin creación; resultado unavailable/blocked |
| Inicialización Chronicle independiente sin autorización explícita | STOP antes de crear el objeto |
| Inicialización independiente autorizada | Root/mapping validados, admisión propia antes de primera lectura, inicialización explícita y terminación sin append |
| Inicialización + append en una invocación | Rechazo; nunca componer ambos efectos |

Estos son criterios de diseño/pruebas futuras, no tests ejecutados. La inicialización separada aún depende de P03/P04/P05 y P08; no se elige aquí su CLI, API, nombre de archivo final ni primitiva de admisión.

### 11.4 Estado

Esta regla es una propuesta técnica para completar D1 y P08. D1-DESIGN no queda cerrado por documentarla; D1-IMPLEMENTATION sigue NO AUTORIZADA. P08 permanece OPEN hasta mapping ratificado; P03/P04/P05 siguen OPEN. No se modifica runtime, no se crea Chronicle y no se autoriza tests/CI, bootstrap ni efectos protegidos.
### 11.5 Evidencia adicional de la frontera CLI

En `scripts/nexo-chronicle-session.mjs` blob `30a53de2f108aa255a1dfd61ce78c19788de160b`, el parser incluye `--initialize-chronicle` en el conjunto de flags admitidos y convierte su presencia en `initializeChronicle: true` al construir los argumentos de `runNexoChronicleAppend()`. Por tanto, la ruta no es solo una opción interna: existe un flag CLI aceptado que alcanza el caso de uso. La corrección futura debe retirar el flag del parser normal y rechazar explícitamente su uso antes de cualquier apertura/lectura de stores; no basta con cambiar el valor por defecto.