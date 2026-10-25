# NCS M0 — revisión del punto de entrada y bootstrap parcial

Fecha: 2026-10-25  
Rama revisada: `ncs-clean-architecture`  
Alcance: inspección estática de scripts, almacenes y prueba de punto de entrada.  
No se ejecutaron tests/CI, no se modificó runtime y no se inspeccionó el dispositivo.

## 1. Fuentes y blobs inspeccionados

- `scripts/nexo.mjs` — `e471eb478a09aa8a9a8323795583e198cdf0a127`
- `scripts/nexo-chronicle-session.mjs` — `30a53de2f108aa255a1dfd61ce78c19788de160b`
- `src/nexo/core/continuity-store.mjs` — `9ffd28930abdbe29f5b041711cc29b74dc99fbae`
- `src/nexo/core/chronicle-store.mjs` — `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`
- `tests/nexo/entrypoint.test.mjs` — `ff1bd2e9d292e21e00049b354249aee684837bbc`

## 2. Hechos estáticos observados

### Punto de entrada y alcance

- `scripts/nexo.mjs` es un CLI explícito. El router rechaza comandos no soportados y no expone un dispatcher genérico.
- La ruta `chronicle-append` se delega a `scripts/nexo-chronicle-session.mjs` mediante `spawnSync(process.execPath, ...)`. El proceso padre espera al hijo y propaga su estado de salida; si el estado no es entero, se usa `1`.
- El CLI acepta `--initialize-continuity` y `--initialize-chronicle` como flags de la sesión Chronicle. El uso requiere contenido por stdin no interactivo.
- Estos scripts son puntos de entrada invocables por quien tenga acceso al entorno/proceso, pero esta inspección no identifica quién los lanzaría en el POCO ni qué mecanismo de instalación/supervisión se utilizaría.

### Escritura, locks y publicación de archivos

- Continuity y Chronicle usan locks cooperativos por almacén en un directorio `<filePath>.lock`, creado con `mkdir`, con un `owner.json`.
- Los almacenes serializan el documento a `<filePath>.tmp` y luego ejecutan `rename(temp, filePath)`.
- Los comentarios de ambos almacenes delimitan explícitamente las garantías: el `filePath` es configuración confiable, no una frontera de sandbox; no se afirma resistencia a ataques de symlink/path; tampoco se afirma durabilidad ante pérdida de energía ni soporte de filesystem distribuido.
- Los locks coordinan escritores cooperativos que usan el mismo contrato/ruta. No son una barrera global contra un proceso externo que ignore el lock o modifique directamente archivos, directorios de lock o rutas.
- La inicialización de Continuity comprueba que el archivo no exista bajo lock; si existe, devuelve conflicto. Chronicle tiene el comportamiento análogo. Las dos operaciones no constituyen una única transacción atómica conjunta.

### Evidencia en la prueba de entrypoint

En `tests/nexo/entrypoint.test.mjs`, líneas 473–524, la propia prueba declara que el bootstrap coordinado no es atómico entre los dos archivos. Simula que Continuity se inicializa pero la ruta padre de Chronicle no está disponible; el resultado queda bloqueado, sin dispatch ni autorización, y el estado vacío de Continuity permanece. Después simula un reintento con ruta de Chronicle válida, que completa y deja una misión/entrada, sin duplicación en el caso probado.

Esto es evidencia de un caso de prueba especificado en el repositorio, no de que el test se haya ejecutado en esta revisión ni de comportamiento medido en Android.

## 3. Consecuencia para la opción A

**La existencia de locks locales no demuestra quiescencia externa.** Proporcionan coordinación entre participantes cooperativos, pero no demuestran que todos los posibles escritores estén detenidos ni que un supervisor no pueda relanzarlos.

El flujo actual de inicialización puede crear Continuity antes de que Chronicle falle. La recuperación documentada depende de inspeccionar el estado y reintentar de forma deliberada; no convierte el bootstrap de dos archivos en una operación conjunta atómica.

Por tanto:
- Opción A: `UNKNOWN/BLOCKED`, no certificada y no refutada como imposible.
- No seleccionar B/C/D por descarte.
- No concluir que Android es el problema sin identificar primero el actor real que ejecuta este CLI o escribe los archivos.
- No asumir que el CLI Node del repositorio sea el mismo runtime que ejecuta M1 Android. El límite entre ellos sigue sin estar demostrado.

## 4. Huecos de evidencia concretos

1. **Invocador real:** no está documentado/evidenciado qué componente, operador o automatización ejecuta `scripts/nexo.mjs` en el entorno inicial.
2. **Ubicación real:** no está confirmada la ruta física de Continuity/Chronicle en el dispositivo inicial ni que sea la raíz a la que se refiere el protocolo de bootstrap.
3. **Inventario de escritores:** no hay evidencia de un inventario completo de los actores autorizados para escribir en esas rutas, ni de que ningún actor externo pueda omitir los locks.
4. **Quiescencia sostenida:** no hay un mecanismo demostrado que impida que el invocador u otro escritor reaparezca durante el bootstrap.
5. **Readmisión y recuperación:** el caso de reintento prueba una ruta concreta en el test, pero no demuestra un protocolo general de interrupción, recuperación y readmisión segura en el dispositivo.
6. **Durabilidad:** los almacenes no reclaman explícitamente garantía fsync/pérdida de energía. No tratar `rename` o un código de salida cero como prueba suficiente de durabilidad o legitimidad de la raíz.

## 5. Próxima acción acotada

Seguir lectura estática de los callers de `createNexoContinuityStore(...).initialize` y `createNexoChronicleStore(...).initialize`, así como de cualquier comando de provisioning/release que pase las rutas. El objetivo es identificar el caller operativo y si existe un contrato de bootstrap distinto del CLI de Chronicle. No hacer barrido de auditorías cerradas.

Si no existe un caller operativo definido, registrar explícitamente la ausencia como hueco de diseño y solicitar solo esta evidencia mínima: mecanismo previsto de lanzamiento, rutas previstas de los almacenes y propietario operativo de dichas rutas.

## 6. Gates sin cambio

- M0: `INCOMPLETO`
- Diseño D0/D1-DESIGN/D2/D3: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- Autorización: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
- P-01/P-05: pendientes
- Opciones A/B/C/D: ninguna seleccionada
- Tests/CI: no ejecutados en esta revisión
- Runtime/dispositivo/bootloader: sin cambios

## 7. Instrucción para Gemini

Usa este informe como checkpoint actual y continúa desde la sección 5. Verifica HEAD y blobs antes de editar. No vuelvas a hacer la evaluación general de Android ni repitas las auditorías cerradas. Localiza el caller operativo de las inicializaciones de Continuity/Chronicle y el origen de sus rutas. Si no hay caller/provisioning definido, documenta el hueco y propone evidencia mínima; no inventes un entrypoint. No selecciones opciones ni cambies runtime, tests, CI o dispositivo. «Continúa» no es autorización para acciones irreversibles.
