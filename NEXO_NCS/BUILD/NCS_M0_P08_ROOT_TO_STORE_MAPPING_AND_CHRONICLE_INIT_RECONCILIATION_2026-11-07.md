# NCS M0 — Reconciliación P08: root→stores y separación de Chronicle init/append

Fecha: 2026-11-07  
Rama de integración documental: `ncs-strategic-vision-preservation-2026-11-05`  
Base de producto aplicable: `ncs-lumina-decoupling-2026-10-29` @ `d8b5ca8720908d926acc18130614cce132a43b5d`  
Estado: **RECONCILIACIÓN ESTÁTICA — P08 OPEN — NO IMPLEMENTA NI RATIFICA LAYOUT**

## 1. Por qué se integra ahora

Se localizó trabajo previo no incorporado a la rama estratégica actual, en `ncs-m0-documentary-reconciliation-2026-11-02`:
- `NEXO_NCS/BUILD/NCS_M0_D1_D2_GAP_CLOSURE_ADDENDUM_2026-11-03.md`, blob `287e2585219206ff7281eef962b2884489719de9`, §§11–13.
- `NEXO_NCS/STATUS.md`, blob `61657ae4a589c27d1ec6c469a292fb5bf27fe04d`, deltas P08 y Chronicle del 2026-11-03.

La rama documental anterior y la rama estratégica divergieron desde `99dabcb33be1efef5c4f5e368dc95140e45ff672`; la rama estratégica contiene 58 commits propios posteriores y no debe reemplazarse con el STATUS divergente. Se porta únicamente el delta técnico relevante, reconciliándolo con el snapshot de producto común `d8b5ca8`. No se fusionan ramas ni se repiten inventarios.

## 2. P08: brecha exacta

O-08 exige una root explícita y un mapping coherente de stores. En el snapshot `d8b5ca8`:
- Los entrypoints CLI aceptan paths independientes `--continuity` y `--chronicle`.
- Las APIs de aplicación y factories reciben `filePath` directamente.
- No existe un resolver común demostrado que derive ambos stores desde una sola root validada.
- El bootstrap existente recibe `root + relativePath` para Continuity; no constituye un resolver conjunto Continuity/Chronicle.
- El destino publicado `$HOME/.nexo-continuity.json` es un objeto real con post-write verification histórica, pero esa publicación no ratifica el layout normal de ambos stores.
- La publicación no decide por sí misma el nombre, ubicación ni autorización de inicialización de Chronicle.

**Conclusión:** P08 permanece **OPEN / LAYOUT UNSELECTED**. Mientras el mapping no sea único, no puede demostrarse que todas las APIs/entrypoints compartan el mismo dominio canónico de admisión.

## 3. Candidato existente — no convertir en decisión implícita

El addendum de la rama anterior ya propuso preservar la publicación existente con este candidato:

| Elemento | Candidato | Estado |
|---|---|---|
| Root | `--root` explícita, existente y canonicalizada | Dirección O-08 aceptada; mapping pendiente |
| Continuity | `<root>/.nexo-continuity.json` | Preserva el objeto ya publicado |
| Chronicle | `<root>/.nexo-chronicle.json` | Nombre candidato; no creado ni ratificado |
| Admisión | Sin nombre ni primitiva seleccionados | Depende de P-05/P-07 |

La propuesta evita crear una segunda Continuity o mover el objeto real. El nombre Chronicle es nuevo y debe tratarse como candidato, no como destino autorizado.

Condiciones propuestas asociadas:
- Root normal debe existir y ser directorio; status/query/preview/append no crean root.
- Un único resolver deriva ambos paths; no aceptar rutas independientes ni fallback ambiental en el contrato normal.
- Rechazar flags de ruta legacy/contradictorios antes de I/O persistente.
- Symlink, directorio, tipo inesperado, corrupción, sidecar o colisión ambigua => UNKNOWN/STOP; no sobrescribir, renombrar, borrar ni elegir fuente por heurística.
- Child Chronicle recibe root explícita y la valida por sí mismo; su admisión es propia.
- No alterar formatos ni protocolos per-store como efecto colateral de P08.

**No se ratifica aquí** la pareja de nombres, el CLI, el resolver ni la migración. La selección corresponde al propietario cuando se presente el paquete de decisión completo.

## 4. Sidecars y evidencia real limitada

En los blobs inspeccionados:
- Continuity y Chronicle derivan lock per-store como `${filePath}.lock`.
- Chronicle deriva temporales por basename: `.tmp` y `.tmp-*`.
- El inventario debe abarcar stores, locks, temporales estables/únicos, symlinks y directorios con esos nombres.

Evidencia histórica de Termux reportada por el propietario:
- Root: `/data/data/com.termux/files/home`.
- Se observó en primer nivel `.nexo-continuity.json`, archivo regular, modo `0600`, UID/GID `u0_a378`, 283 bytes.
- En ese muestreo no aparecieron los sidecars/temporales candidatos ni `.nexo-chronicle.json` ni los nombres genéricos `continuity.json`/`chronicle.json`.

Límites: fue un muestreo no mutante de primer nivel; no inspeccionó contenido, subdirectorios, aliases/mounts ni ausencia futura. No prueba que los nombres estén libres globalmente ni autoriza crear Chronicle. No repetir este inventario salvo cambio material o contradicción; si P08 exige ampliar el alcance, especificar exactamente la brecha antes de pedir una observación nueva.

## 5. Chronicle: inicialización y append deben ser operaciones distintas

Hallazgo estático en:
- `src/nexo/application/chronicle-append.mjs`, blob `c1964467d68043d06e035ad59720f8cec2e52e52`.
- `scripts/nexo-chronicle-session.mjs`, blob `30a53de2f108aa255a1dfd61ce78c19788de160b`.
- `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.

El parser CLI admite `--initialize-chronicle` y lo transmite como `initializeChronicle: true`. El caso de uso `runNexoChronicleAppend()` puede llamar a `chronicleStore.initialize()` cuando el store falta y esa opción está activa. Esto combina creación del store y append dentro de la misma operación.

Contrato objetivo ya propuesto en el addendum D1/P08:
1. Append nunca inicializa ningún store.
2. Chronicle ausente => BLOCKED/UNAVAILABLE, sin archivo, sidecar, envelope ni inicialización incidental.
3. `--initialize-chronicle` debe retirarse del parser normal; si se recibe, rechazo explícito antes de abrir/leer stores.
4. La API normal append no expone `initializeChronicle`; cambiar solo el default a false no basta.
5. Inicialización Chronicle es un caso de uso separado, con root/mapping ratificado, admisión propia antes de primera lectura persistente, lock per-store y autorización humana explícita para el destino mostrado.
6. Inicializar y append no comparten invocación; la inicialización termina sin append.
7. Preservar formato actual: `NEXO_CHRONICLE` v1, revision 0, entries vacías. No reemplazar objetos existentes o ambiguos.

Esto es una corrección contractual propuesta, no una implementación. No se ha probado en runtime ni en tests en este snapshot.

## 6. Dependencias y secuencia sin repetir trabajo

| Gate | Qué aporta esta reconciliación | Qué falta |
|---|---|---|
| P08 | Brecha root→stores concreta y candidato ya estudiado | Ratificación del mapping + verificación de compatibilidad/colisiones dentro del alcance |
| P-03/P-04 | Fronteras D1–D6 ratificadas | Enforcement antes de cualquier lectura persistente |
| P-05 | Prohibición de retry/readmisión tras incertidumbre | Mecanismo durable/interproceso conforme P-05-C |
| P-07 | Contrato de identidad y oráculos O1–O9 existentes | Root/target identity y cleanup/release replacement-safe |
| P-09 | Callers conocidos ya reconciliados en artefacto 2026-11-07 | Loaders no literales, consumidores externos y universo de deployment siguen UNKNOWN |
| E2/E3 | Evidencia histórica de inventario puntual R1 | Control sostenido dentro de la ventana real; no repetir inventario genérico |

Orden de cierre:
1. Presentar para decisión del propietario el mapping P08 como candidato único que preserva Continuity; no implementarlo por inferencia.
2. Resolver P-05/P-07 con una primitiva que satisfaga O1–O9; P08 no puede compensar ni rebajar esos gates.
3. Con P08 ratificado y P05/P07 resueltos, implementar el resolver común y enforcement D1/P03-P04 con autorización específica.
4. Añadir/revisar pruebas negativas de append/init y pre-I/O admission, solo tras autorización de tests.
5. Cerrar P09/E2/E3 y verificar CI/evidencia ligada al SHA final.
6. Solo entonces preparar acta de cierre M0.

## 7. Estado

- P08: **OPEN / LAYOUT UNSELECTED**.
- Mapping candidato: `.nexo-continuity.json` + `.nexo-chronicle.json`, no ratificado.
- Chronicle init/append separation: **BRECHA ESTÁTICA IDENTIFICADA; CORRECCIÓN NO IMPLEMENTADA**.
- P-03/P-04: D1–D6 RATIFICADAS; enforcement pendiente.
- P-05-C: RATIFICADA; P-05 OPEN.
- P07-C: UNKNOWN/BLOCKING.
- P-09: OPEN/UNKNOWN.
- E2/E3: PARTIAL/NOT CLOSED.
- M0: **INCOMPLETO**; `M0_BUILD_COMPLETE` NOT ACHIEVED.
- `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; commissioning y efectos protegidos STOP.

Solo lectura estática de fuentes y documentación. No se modificó runtime, tests, workflows, layout, stores ni dispositivo. No se ejecutaron tests, CI/Actions, comandos POCO/Termux, bootstrap, inicialización Chronicle ni efectos protegidos.
