# NCS M0 — checkpoint de continuidad verificada y siguiente frontera (2026-10-19)

**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama de trabajo:** `ncs-clean-architecture`  
**Palabra para abrir el siguiente chat:** `NCS`  
**Misión:** M0. No cambiar a M1 ni reiniciar STEP 7.

> Este checkpoint complementa y corrige la prioridad del handoff anterior. No declara que el HEAD actual haya quedado verificado: la integración GitHub disponible permitió leer los archivos de la rama y comparar commits, pero no expuso directamente el SHA del ref de la rama. El siguiente chat debe resolver eso antes de tocar código.

## 1. Fuentes que se leyeron en la rama

- `NEXO_NCS/STATUS.md` — blob observado `f1dcffee3501f38b2c102826478fd6d34d5c9e0f`.
- `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-19_LINEAGE_GUARD.md` — blob observado `955f0b174320d035492ca69aac1286a84d05c77c`.
- `NEXO_NCS/BUILD/NCS_M0_PREPARED_REVISION_FIX_CHECKPOINT_2026-10-19.md` — blob observado `a972f7bd67fe3311bcaf866414890b67c290fad6`.
- `src/nexo/core/owner-backed-runtime.mjs` — blob observado `13637c85e167f39302efcf05a36085968abc6d44`.
- `src/nexo/core/continuity-owner.mjs` — blob observado `07f3df47d33da08c38b1f6ebee9b782a68f85847`.
- `src/nexo/core/chronicle-settlement-contract.mjs` — blob observado `4d04930cbf67b5943916cc497dd44b14c87e27bd`.
- `src/nexo/core/continuity-store.mjs` — blob observado `3278a06abf34de5b4648b03d1c574237565326c9`.
- `tests/nexo/chronicle-runtime.test.mjs` — blob observado `a805db507849994ca7db3f44ecd5ba4d6ecd5344`.
- `package.json` — blob observado `4dc20952fdf027299c57b765a254ab389cd28e4e`.

Estos son SHA de blobs, no SHA de commit ni prueba de CI.

## 2. Evidencia CI conservada

Código + regresiones de lineage probados en SHA exacto:

`48114cd275b98cbbf3142bb242f90d0c5c543d0a`

Los cinco workflows fueron observados completados con éxito:

- M0 integrado: [39335842717](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842717)
- Chronicle vertical: [39335842965](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842965)
- Admisión / continuidad tras reinicio: [39335842749](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842749)
- STEP 4: [39335842689](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842689)
- STEP 5: [39335842743](https://github.com/snowdenxrp/aldea-ia/actions/runs/39335842743)

El handoff documental anterior es commit `10a03faea974160025f907302467277647ba2e8c`. La comparación GitHub confirmó que ese commit está 2 commits por delante de `48114cd...`, sin commits detrás; el diff incluye el handoff nuevo y una modificación del checkpoint. No etiquetar esos commits documentales como código probado. El ref exacto de la rama todavía debe verificarse de forma directa en el siguiente chat.

**No se ha demostrado la suite completa `npm test`.** En `package.json`, `npm test` encadena muchas pruebas generales y Nexo; debe ejecutarse en CI o en un entorno real compatible y registrarse el SHA exacto.

## 3. Estado que no puede cambiarse por inferencia

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- No se ha implementado ni probado la raíz criptográfica legítima del propietario.
- Una llave criptográfica y un dispositivo inicial son el alcance de primera fase decidido; modelo físico, protocolo y configuración siguen sin seleccionarse/validarse. La llave no autoriza automáticamente cada efecto.
- `chronicle_append` es la única acción no-repair con contrato integrado descrito; las acciones de reparación siguen bloqueadas.
- Ante incertidumbre posterior a un posible efecto: `UNKNOWN`, nunca redispatch automático.
- Nexo y Lúmina permanecen separados.
- No repetir auditorías cerradas ni instalar/reabrir M1 o STEP 7 sin evidencia nueva concreta.

## 4. Brechas estáticas que ya están registradas y no deben perderse

### PREPARED / procedencia
`STATUS.md` registra una matriz de respuestas PREPARED malformadas y un modelo de confianza del recibo. La forma del objeto no demuestra que su procedencia sea canónica. La arquitectura actual considera `executePrepared()` una API interna de composición dentro de una misma base de confianza; no se debe afirmar que es sandbox ni frontera de autorización. No resolver con booleanos, callbacks controlados por el mismo consumidor, otro journal o una envoltura transaccional.

### Ruta legacy
La inspección documentada no encontró un caller de producción actual de `executeLuminaNexoStep()`; existe una ruta legacy que puede mutar simulación si se invoca, pero no hay evidencia de que sea una ruta protegida de producción activa. No declarar bypass de producción observado ni migrar todas las acciones.

### Outcome terminal — nueva pista de auditoría acotada, aún no validada dinámicamente
En `src/nexo/core/owner-backed-runtime.mjs`, `recordChronicleTerminalOutcome()` acepta `outcome.status === "committed"` o `"already_recorded"` y luego devuelve `status: "completed"` / `terminalOutcomeRecorded: true`, sin validar en esa capa que la respuesta identifique una revisión segura coherente con `expectedRevision`.

El contrato del almacén real sugiere la distinción esperada:
- `committed`: revisión nueva exacta `expectedRevision + 1`;
- `already_recorded`: misma revisión `expectedRevision`, si el contrato idempotente realmente garantiza que ese outcome idéntico ya existe.

El runtime recibe el owner por inyección; las pruebas ya usan owners simulados. Por eso se debe comprobar si una respuesta de owner malformada (revisión ausente, igual, salto, negativa/no segura) puede producir falsamente un terminal `completed`. Esto es un **candidato de brecha de contrato**, no un fallo dinámico confirmado ni prueba de bypass de producción.

**Próximo paso técnico prioritario:** inspeccionar el contrato exacto de `recordOutcome`, sus resultados idempotentes y el replay tras pérdida de respuesta; añadir solo regresiones de respuestas alcanzables/contrato público. Si se confirma la brecha, ajustar el runtime para preservar UNKNOWN tras efecto potencial, con `terminalOutcomeRecorded: "UNKNOWN"`, `redispatchAuthorized: false`, y sin convertir un recibo ambiguo en completed. Mantener el caso real `already_recorded` válido. Ejecutar prueba focal y CI sobre el SHA exacto; no declarar PASS antes de ver el resultado.

## 5. Orden de continuidad obligatorio

1. Leer primero `NEXO_NCS/STATUS.md`, después este checkpoint y el handoff/checkpoint previos.
2. Verificar el SHA del HEAD real de `ncs-clean-architecture`, comparar con `48114cd...` y `10a03fa...`, e inspeccionar los runs de CI asociados al SHA actual. No inferir el HEAD a partir del nombre de rama ni de un commit documental.
3. Terminar la auditoría acotada del resultado terminal descrita arriba, sin reabrir el análisis general de PREPARED ya cerrado.
4. Identificar contrato, caso concreto, test de regresión y workflow que lo ejecutará antes de modificar código.
5. Ejecutar la prueba focal y el workflow correspondiente. Registrar SHA exacto, enlaces y resultado. Luego intentar `npm test` completo en una vía soportada.
6. Actualizar `STATUS.md` con una entrada breve al inicio solo si se puede conservar el archivo completo sin truncarlo; no reemplazar un STATUS de cientos de miles de caracteres con una extracción parcial. Mantener este checkpoint y actualizar el handoff para enlazarlo.
7. Mantener `authorization: NOT_EVALUATED`, efectos protegidos `STOP` y M0 `INCOMPLETO` hasta que haya evidencia independiente que justifique cambiar esos estados.

## 6. No hacer

- No volver a investigar AB104.759R, AB104.999R→AB105.000R, AB104.151, P112, AB105.116R, TLC, P34/P35 sin evidencia nueva concreta.
- No volver a M1 ni STEP 7.
- No inventar queues, retries, tombstones, IDs, transacciones, rollback ni una nueva infraestructura de persistencia.
- No afirmar que un mock prueba la raíz legítima del propietario.
- No equiparar settlement local, resultado terminal, autorización y efecto protegido.
- No declarar la suite completa aprobada sin ejecutar `npm test`.

**Regla final:** el repo es la fuente de continuidad. Cada cambio de código debe tener test focal, CI sobre SHA exacto y una entrada de evidencia. Si una operación de documentación falla, reportarlo claramente.
