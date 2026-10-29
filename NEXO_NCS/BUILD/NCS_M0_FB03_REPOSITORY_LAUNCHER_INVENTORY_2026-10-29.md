# NCS M0 — Inventario estático de entrypoints y lanzadores (2026-10-29)

**Estado:** STATIC REPOSITORY REVIEW — NOT IMPLEMENTED — NOT EXECUTED — NOT DEVICE EVIDENCE.

## 1. Alcance

Revisión de archivos concretos en `ncs-clean-architecture` para determinar qué entrypoints Node.js están definidos y si el repositorio contiene evidencia directa de un launcher Android que conecte la app Nexo M1 instalada con NCS.

No se inspeccionó el teléfono, no se ejecutó código, no se instaló software y no se hizo bootstrap.

## 2. Hechos observados

### 2.1 Entry point npm

`package.json` declara:

- `nexo: node scripts/nexo.mjs`
- `simulate: node scripts/simulate.mjs`
- `assistants: node scripts/assistants.mjs`

Esto acredita el modo de ejecución previsto desde el repositorio: Node.js mediante scripts npm. No acredita qué runtime utiliza una app Android instalada ni que la app invoque alguno de esos comandos.

### 2.2 Entry point Nexo

`scripts/nexo.mjs`:

- se ejecuta como módulo Node.js;
- enruta comandos de estado/preview y el comando Chronicle;
- para Chronicle usa `spawnSync(process.execPath, [chronicleEntrypoint, ...parsed.args])`;
- el hijo es `scripts/nexo-chronicle-session.mjs`;
- no contiene código de Android Activity, Service, BroadcastReceiver, WorkManager, Termux:Boot ni integración con una app Android.

`scripts/nexo-chronicle-session.mjs` importa el caso de uso Chronicle desde `src/nexo/application/index.mjs` y procesa entrada stdin; es un wrapper Node.js, no un launcher Android.

`scripts/nexo-continuity.mjs` es solo un compatibility re-export de servicios Continuity; tampoco es un launcher.

### 2.3 CI

`.github/workflows/nexo-m0-acceptance.yml` ejecuta pruebas en `ubuntu-latest`, instala Node.js 22 y ejecuta archivos de test directamente con Node. Tiene permisos `contents: read`. Esta evidencia describe CI, no el runtime del POCO ni el proceso de una app Android.

### 2.4 Evidencia Android ausente en la búsqueda realizada

La búsqueda del repositorio por `AndroidManifest.xml`, `settings.gradle`, `capacitor.config`, `launcher`, y referencias a `Termux node` no devolvió archivos de integración Android/launcher en los resultados consultados.

Esto es un resultado limitado de búsqueda, no una prueba exhaustiva de inexistencia de cualquier integración fuera del índice o en otra rama/repositorio.

## 3. Conclusión permitida

- **CONFIRMADO:** el entrypoint del repositorio NCS es Node.js (`node scripts/nexo.mjs`).
- **NO DEMOSTRADO:** que la app Nexo M1 instalada ejecute ese entrypoint.
- **NO DEMOSTRADO:** que el inicio automático que observa el propietario corresponda a un servicio Node, Termux, Android WorkManager u otro mecanismo concreto.
- **NO AUTORIZADO NI REALIZADO:** configurar Node/Termux en el POCO, modificar la app M1, conectar su launcher a NCS o ejecutar bootstrap.

Por tanto, la relación M1 → NCS permanece **UNKNOWN** y no debe usarse como precondición para el análisis estático restante de M0.

## 4. Consecuencia para FB-03 / E2 / E3

El repositorio por sí solo no identifica el conjunto real de procesos que pueden escribir el destino Continuity en el POCO. En consecuencia, no permite afirmar exclusión de escritores, control de relanzamiento, aislamiento ambiental ni quiescencia sostenida.

Para cerrar la brecha ambiental se necesitará evidencia del entorno real y de sus límites de acceso/ejecución. Hasta entonces:

- FB-03: OPEN / UNKNOWN.
- FB-04: OPEN / UNKNOWN.
- E2/E3: UNKNOWN.
- E4: NOT READY.
- raíz legítima: PENDING / UNKNOWN.
- `authorization: NOT_EVALUATED`.
- primera publicación de Continuity y efectos protegidos: STOP.
- M0: INCOMPLETO.

## 5. Próximo trabajo estático

Continuar con el análisis del contrato de publicación FB-04 y las precondiciones de entorno ya definidas. No repetir la búsqueda general de launcher salvo nueva evidencia concreta de un archivo/app distinto.
