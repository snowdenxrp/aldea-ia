# NCS M0-E — Límite de confianza de filesystem para opción A

Fecha: 2026-10-21
Rama: ncs-clean-architecture
Estado: análisis de configuración; no se cambió runtime.

## Hallazgo

La persistencia local de Continuity/Chronicle depende de rutas que el caller configura. Los stores documentan que `filePath` es configuración confiable y no una frontera de sandbox.

- `src/nexo/core/continuity-store.mjs`: lee el archivo, deriva un lock desde la ruta, escribe un temporal y renombra al destino.
- `src/nexo/core/chronicle-store.mjs`: aplica el mismo patrón para Chronicle.
- `src/nexo/application/continuity-queries.mjs`: las consultas cargan la ruta recibida y devuelven `blocked` si la lectura falla.
- `scripts/nexo.mjs`: acepta `--continuity`; la validación del argumento no define un directorio permitido ni demuestra controles de symlink, permisos o sustitución externa.
- `scripts/nexo-chronicle-session.mjs`: acepta `--continuity` y `--chronicle` como valores de ruta y los entrega a `runNexoChronicleAppend`. El parser comprueba duplicados/forma básica, no resuelve ni restringe rutas. Esto es compatible con una herramienta CLI operada por un usuario local confiable; no debe tratarse como una interfaz segura para que contenido de misión/claims elija sus propios archivos.

## Interpretación

La opción A permite persistencia interna solo bajo un supuesto explícito: las rutas y el directorio de almacenamiento son configuración confiable del prototipo. “Local” no equivale a “seguro”, “inmutable” ni “ancla de autoridad”.

La prueba de consultas de solo lectura confirma que las funciones probadas no modifican los bytes/mtime del archivo y no crean el almacén ausente. No demuestra seguridad general del filesystem, durabilidad ante pérdida de energía ni aislamiento frente a otros procesos con acceso al directorio.

Esto no demuestra una vulnerabilidad en el despliegue actual; identifica un límite contractual que debe permanecer visible.

## Acción recomendada

1. Documentar cómo se configura la ruta en el arranque real y quién la controla.
2. No aceptar rutas de persistencia desde misiones, claims ni contenido no confiable.
3. Si se necesita protección frente a otros procesos locales, definir primero ese modelo de amenaza y diseñar el control completo de directorio, permisos y symlinks; no añadir una defensa parcial sin criterio de aceptación.
4. Mantener reparaciones, Lúmina/simulación y efectos externos bloqueados.
5. Mantener `authorization: NOT_EVALUATED`; un archivo presente o una revisión válida no prueba legitimidad.

## Evidencia relacionada

- Matriz opción A: `NEXO_NCS/BUILD/NCS_M0_E_OPTION_A_OPERATION_EFFECT_ENFORCEMENT_MATRIX_2026-10-21.md`.
- Test de consultas de solo lectura: `tests/nexo/chronicle-runtime.test.mjs`, commit `fbc0abbe89d07f19cd428e35072043a88ba2961f`; CI run `39692937285` SUCCESS para ese SHA.
- CI del checkpoint documental previo: SHA `49df5f3bfdef6f265e10989280159be5d848c378`, run `39693016386` SUCCESS. Este informe necesita CI propio.

## Estado

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. La opción A es alcance inicial, no commissioning ni autorización de efectos protegidos.
