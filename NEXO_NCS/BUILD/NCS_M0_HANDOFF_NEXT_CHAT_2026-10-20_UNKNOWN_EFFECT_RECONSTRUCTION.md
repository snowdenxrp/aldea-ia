# NCS — handoff M0: reconstrucción fail-closed de journal desconocido
Fecha: 2026-10-20  
Repositorio: `snowdenxrp/aldea-ia`  
Rama: `ncs-clean-architecture`

## Estado confirmado

- Código + regresiones validados en SHA exacto `dd30b70e1204750fc09fac683f30b6e7e129bfe6`.
- CI SUCCESS: determinista [39464052770](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052770), admisión/continuidad [39464053282](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053282), aceptación integrada M0 [39464053079](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053079), STEP 4 [39464052881](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052881), STEP 5 [39464052959](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052959).
- Informe de detalle: `NEXO_NCS/BUILD/NCS_M0_UNKNOWN_EFFECT_RECONSTRUCTION_FAIL_CLOSED_2026-10-20.md`.
- Checkpoint CI: `NEXO_NCS/BUILD/NCS_M0_CURRENT_CI_CHECKPOINT_2026-10-20.md`.

## Qué se corrigió

La retención preservaba estados desconocidos de `effectJournal` y sus planes, pero la reconstrucción no siempre interpretaba esos estados como incertidumbre. Un registro `future_state_v9` podía no bloquear un paso `planned`. Ahora:
- Un estado desconocido enlazado a una misión bloquea misión/paso con `NEXO_EFFECT_JOURNAL_STATUS_UNKNOWN`.
- Un efecto no terminal/unknown sin misión propietaria retenida no se ignora; reconstrucción falla cerrada.
- Los estados terminales reconocidos `settled_observed` y `reconciled_observed` conservan su comportamiento histórico.
- Los `prepared` siguen bajo reconciliación obligatoria.
- Se conservó el código de error ya establecido por tests legacy; fallos previos de CI quedan documentados como red/green.

## Instrucciones para el siguiente chat

1. Leer primero `NEXO_NCS/STATUS.md`, este handoff, el checkpoint y el informe de la corrección. Usar el checkpoint posterior para CI; no repetir búsquedas cerradas.
2. Continuar M0, no reiniciar Step 7.
3. Revisar estáticamente la siguiente frontera concreta de reconstrucción/retención de continuidad. Solo modificar runtime si aparece un contraejemplo específico y reproducible.
4. Para cada defecto: prueba adversarial mínima → fix mínimo → ejecutar workflows → verificar job, SHA exacto y conclusión → actualizar informe/checkpoint.
5. No afirmar PASS sin evidencia CI atribuible al SHA exacto.
6. No confundir CI con autoridad raíz, autenticidad de `evidence.source`, Constitución congelada o autorización de efectos protegidos.

## Estado de seguridad invariable

- M0: `INCOMPLETO`
- `authorization`: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
- Rama GitHub observada como no protegida; no se cambió configuración administrativa.
