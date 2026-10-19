# M0 — contrato genérico de efectos de Nexo
Fecha: 2026-10-18
Estado: gate de diseño; no es implementación ni autorización de dispatch.

## Evidencia actual
- `src/nexo/runtime.js` ejecuta `adapter.execute()` antes de persistir el outcome en la memoria legacy.
- `persistPreparedIntent` es opcional; no garantiza que lineage y settlement lleguen al owner.
- `createNexoContinuityOwner()` expone `recordPrepared` y `recordExecutionLineage`, pero no settlement genérico. `reconcilePrepared()` devuelve `NEXO_EFFECT_RECONCILIATION_REQUIRED`.
- El adapter de Lúmina modifica simulación en memoria. Eso no demuestra observación ambiental durable después de restart.
- El store canónico declara que su revisión coordina escritores locales, pero no es autoridad ni prueba de efecto externo y no promete fsync/power-loss durability.

## Decisión
No hacer cutover mediante callback aislado ni registrar el PREPARED después del dispatch. Una acción solo puede ejecutarse desde el runtime genérico si tiene contrato explícito de reconciliación verificable. Si falta, bloquear antes de invocar el adapter.

## Contrato por acción
1. **Admisión:** reconstruir misión/paso desde snapshot canónico; identidad, target, idempotency key y dependencias deben coincidir.
2. **PREPARED:** requerir commit condicional confirmado antes del dispatch. Si devuelve UNKNOWN o lanza, no despachar; reconciliar primero.
3. **Dispatch:** clasificar excepciones como resultado desconocido si pudo haber efecto parcial; no reintentar automáticamente.
4. **Lineage:** registrar resultado y revisión solo contra PREPARED existente y coincidente.
5. **Reconciliación:** un verificador confiable específico de la acción debe observar el estado real persistido y distinguir aplicado/no aplicado/desconocido después de restart.
6. **Settlement:** transición CAS del journal solo con resultado de reconciliación ligado a la misma operación; nunca por `adapter.status` solamente.
7. **Outcome:** registrar después de reconciliación/settlement; `completed` requiere evidencia verificable con procedencia comprobable.

## Orden de implementación
1. Definir estados y contrato de reconciliación/settlement; un callback libre del solicitante no puede validar su propio efecto.
2. Añadir pruebas de identidad incorrecta, conflicto CAS, commit UNKNOWN, resultado terminal sin reconciliación, replay de PREPARED y restart aplicado/no aplicado/desconocido.
3. Implementar la transición del owner determinada por esas pruebas.
4. Conectar el runtime exigiendo PREPARED confirmado antes del dispatch; verificar que acciones sin contrato nunca invocan el adapter.
5. Integrar la entrada real y probar crash/replay/restart con estado ambiental persistido.
6. Registrar SHA, runs y artefactos observados en STATUS.

## Prohibiciones
- No convertir el dispatcher repair-only en genérico por renombrado.
- No añadir segundo ledger, retries automáticos, tombstones o wrappers transaccionales sin necesidad demostrada.
- No afirmar atomicidad cross-store.
- No mezclar continuidad Nexo con estado de mundo, agentes o memoria de Lúmina.
- Efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

## Criterio de salida
Una acción con contrato explícito debe demostrar PREPARED → dispatch → lineage → reconciliación → settlement → outcome tras interrupciones, sin doble ejecución ni finalización inventada. Tests aislados de métodos no bastan. M0 sigue INCOMPLETO.


## Persistencia local y contrato de rutas (actualización 2026-10-18)

- Ambos stores reciben `filePath` como configuración confiable. El path no es un sandbox ni una frontera de autorización; quien configura el CLI/runtime debe seleccionar un directorio local de confianza y evitar que procesos no confiables modifiquen archivos, directorios padre o locks.
- No se afirma resistencia a symlink/path attacks ni se aceptan rutas de filesystem distribuido como soporte validado. No se debe interpretar la ruta proporcionada por un caller no confiable como segura por estar validada como string.
- La recuperación automática de locks obsoletos fue retirada: el patrón check-then-remove podía borrar un lock nuevo. Ante lock obsoleto se devuelve un código `*_LOCK_STALE_RECOVERY_REQUIRED`; el operador solo debe retirarlo tras verificar que no queda proceso propietario activo. No eliminar locks en caliente ni reintroducir reaper automático por antigüedad/PID.
- El test multiproceso de Chronicle demuestra que dos escritores cooperantes conservan ambas entradas en filesystem local normal de CI. No demuestra seguridad frente a actores hostiles, eliminación manual concurrente, todos los interleavings ni durabilidad ante pérdida de energía.
- Siguiente: decidir si el despliegue aceptará explícitamente el modelo de directorio local privado/cooperación confiable, o si necesita una capa de locking del sistema operativo con garantías más fuertes. No fingir que canonicalizar una ruta por sí solo resuelve las carreras de filesystem.


## Implementación posterior — allowlist explícita en runtime owner-backed (2026-10-18)

- Se extrajo la transición owner-backed adapter-agnostic a `src/nexo/core/owner-backed-runtime.mjs`; la entrada Chronicle importa ese módulo sin importar estáticamente el runtime mixto de Lúmina.
- El runtime bloquea ahora toda acción no incluida explícitamente en la vertical validada: `chronicle_append`. Repair actions devuelven `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED`; otras acciones devuelven `NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED` antes de PREPARED, incluso si un caller registra un handler/verifier arbitrario.
- Tests: `tests/nexo/chronicle-runtime.test.mjs` verifica que una acción genérica no alcanza PREPARED ni dispatch; `tests/nexo/runtime.test.mjs` fue actualizado para reflejar la allowlist y mantiene pruebas de PREPARED UNKNOWN/verificador ausente con la única acción habilitada.
- CI: [39179449609 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179449609) para Chronicle/entrada; en SHA `64e175a0c641357c40922bbeb6a74cd8eb63bdf0` [39179591854 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591854) (admission/continuity), [39179591845 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591845) (outcome/restart) y [39179591868 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591868) (semantic validation).
- Esto aplica el gate de diseño; no completa el runtime genérico. No añadir acciones hasta tener contrato independiente de reconciliación, settlement y outcome probado tras restart. M0 permanece INCOMPLETO.
