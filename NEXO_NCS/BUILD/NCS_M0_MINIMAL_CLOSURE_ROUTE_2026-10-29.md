## RECONCILIACIÓN MÁS RECIENTE — ESTADO TRAS FB-03/FB-04 Y AISLAMIENTO LÚMINA (2026-10-29)

Esta delta prevalece sobre cualquier instrucción histórica incompatible más abajo.

### Trabajo nuevo ya documentado

- FB-02: **PASS/CERRADO** en el alcance de separar bootstrap Continuity de operación Chronicle, con CI en SHA `86e73525f8c63e143b5860d77f0d191e54213976`. No repetir su prueba ni reabrir el bypass Chronicle ya corregido/validado.
- FB-03: inventario estático del entrypoint/launcher en [NCS_M0_FB03_REPOSITORY_LAUNCHER_INVENTORY_2026-10-29.md](NCS_M0_FB03_REPOSITORY_LAUNCHER_INVENTORY_2026-10-29.md). El repo declara Node.js (`node scripts/nexo.mjs`); vínculo de app M1 → NCS y mecanismo de inicio automático permanecen UNKNOWN.
- FB-04: brechas S1/S2/S3 registradas en [NCS_M0_FB04_STATIC_PUBLICATION_GAPS_2026-10-29.md](NCS_M0_FB04_STATIC_PUBLICATION_GAPS_2026-10-29.md). Evaluación condicional de mecanismos en [NCS_M0_FB04_PUBLICATION_MECHANISM_ASSESSMENT_2026-10-29.md](NCS_M0_FB04_PUBLICATION_MECHANISM_ASSESSMENT_2026-10-29.md): `rename` tras `access` no demuestra no-replace; `link` es solo candidato condicionado al filesystem; `open("wx")` directo no publica contenido completo atómicamente. No se seleccionó ni implementó mecanismo.
- Lúmina: PR #110 [NCS M0: decouple Lúmina launchers from Nexo Continuity](https://github.com/snowdenxrp/aldea-ia/pull/110) permanece OPEN/DRAFT, no fusionada. CI focalizado y `npm test` pasaron en SHA `572fe085abc11c625d13beb4885a74da2d7ffd95`. El workflow activo de Lúmina no se modificó. No confundir este resultado con evidencia de M0 en POCO.
- `NEXO_NCS/STATUS.md` es el registro canónico más reciente y prevalece sobre tablas históricas de este documento que todavía digan FB-02 OPEN.

### Gates actuales

- M0 **INCOMPLETO**.
- FB-01 OPEN/UNKNOWN: raíz legítima y destino real no demostrados.
- FB-02 PASS/CERRADO solo para la separación bootstrap/Chronicle probada en el SHA indicado.
- FB-03 OPEN/UNKNOWN; E2/E3 UNKNOWN.
- FB-04 OPEN/UNKNOWN; no-replace, path stability y control de writers no demostrados.
- FB-05/P-05 NO RATIFICADA.
- FB-06/FB-07 OPEN; aceptación final todavía requiere evidencia trazable al mismo SHA y pruebas ambientales aplicables.
- P01-B = C — NO SELECCIONAR TODAVÍA; E4 NOT READY; D0–D3 OPEN según STATUS.
- Raíz PENDING/UNKNOWN; `authorization: NOT_EVALUATED`.
- Primera publicación operativa de Continuity y efectos protegidos: STOP.

### Próximo trabajo permitido sin nueva autorización

Continuar diseño/documentación condicional de criterios de aceptación FB-04 y preparar la matriz de evidencia FB-06/FB-07. No modificar runtime/tests/workflows, no ejecutar tests/CI, no seleccionar entorno/primitiva, no usar comandos POCO, no crear Continuity real ni fusionar PR #110 sin autorización específica.

---

## DELTA — EVIDENCIA ACTUALIZADA PARA FB-01 (2026-10-29)

- El contrato de la API dedicada FB-01 sí pasó dentro del workflow integrado en SHA `86e73525f8c63e143b5860d77f0d191e54213976`: [integrated M0](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618309). El workflow también pasó los tests de migración legacy: [bounded admission/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618189).
- No repetir esos tests ni la inspección estática de `continuity-service.mjs`. La evidencia automatizada no acredita que una raíz real sea legítima ni que se mantenga un control contra todos los escritores.
- FB-01 queda OPEN/UNKNOWN en cuanto a root legítima y aplicabilidad al destino real. FB-03/FB-04 siguen OPEN/UNKNOWN por E2/E3, TOCTOU y writers no cooperativos.
- Próxima acción: documentar/obtener evidencia real del entorno y de su control de launchers/writers, con autorización específica antes de cualquier comando o instalación en el POCO. No bootstrap real ni efectos protegidos.
- Estado global **M0 INCOMPLETO**.

---

## DELTA DE CONTINUIDAD — 2026-10-29, posterior a FB-02

- **FB-02 PASS/CERRADO** para separar bootstrap de Continuity y operación Chronicle en una sola invocación. SHA validado: `86e73525f8c63e143b5860d77f0d191e54213976`.
- CI PASS en ese SHA: [integrated M0](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618309), [Chronicle native](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618133), [bounded admission/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618189), [deterministic persistence](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618328), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618177), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/40940618334).
- La ejecución y los fixtures de FB-02 están validados; no repetirlos ni volver a investigar el bypass histórico.
- **Siguiente prioridad técnica: FB-01** — comprobar qué evidencia de contrato/tests ya existe para la API dedicada de bootstrap y cerrar solo lo que se sostenga en el SHA probado. No crear Continuity real ni conectar un launcher.
- M0 sigue INCOMPLETO. FB-01 OPEN/UNKNOWN; FB-03/FB-04 OPEN/UNKNOWN; FB-05 pendiente; FB-06/FB-07 pendientes según STATUS. Raíz PENDING/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY; `authorization: NOT_EVALUATED`; publicación real y efectos protegidos STOP.
- No repetir auditorías estáticas, no ejecutar comandos del POCO, no hacer bootstrap real ni efectos protegidos.

---

# NCS M0 — ruta mínima de cierre y bloqueos no sustituibles por documentación

Fecha: 2026-10-29  
Estado: RECONCILIACIÓN DOCUMENTAL; SIN CAMBIOS EJECUTABLES; NO AUTORIZA EJECUCIÓN.

## Propósito

Evitar repetir el mapa de llamadas, el inventario general de Continuity, la revisión de legacy o la auditoría de persistencia. Este documento ordena únicamente los bloqueos M0 ya documentados y distingue lo que puede hacer el trabajo técnico de lo que requiere decisión del propietario o evidencia de ejecución.

## Evidencia ya existente que se reutiliza

- `NEXO_NCS/STATUS.md`: estado y deltas canónicos.
- `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_TRACEABILITY_2026-10-28.md`: NC-01/NC-02, mapa estático de llamadas, matriz de bloqueos y RE-01…RE-09.
- `NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-10-29_FB01_BOOTSTRAP_DEDICATED.md`: alcance autorizado, API dedicada, pruebas escritas no ejecutadas y límites.
- `NEXO_NCS/BUILD/NCS_M0_POCO_E2_E3_EVIDENCE_GAP_2026-10-29.md`: brecha concreta del entorno POCO/Android.

No se vuelve a inspeccionar el mismo grafo de llamadas ni a recontar archivos. La brecha estática de no-bypass ya está demostrada; el resultado de pruebas sigue siendo desconocido.

## Ruta mínima de cierre

| Orden | Trabajo que hace avanzar M0 | Evidencia/autoridad que falta | Condición de parada |
|---|---|---|---|
| 1. FB-01 — regla y destino | Mantener el contrato del bootstrap dedicado ya implementado; reconciliar la regla limitada aprobada con el objeto y destino concretos, sin escribirlos. | Base legítima para la raíz y aplicabilidad demostrable al destino efectivo. La raíz sigue PENDING/UNKNOWN. | No crear Continuity ni inferir autoridad a partir de que exista una ruta de archivo. |
| 2. FB-02 — no-bypass | Usar NC-01/NC-02 ya escritos como contrato de aceptación. El bypass Chronicle conocido debe quedar bloqueado/separado o demostrablemente fuera del flujo permitido antes de afirmar no-bypass. | Autorización específica para cambiar runtime/tests y decisión aplicable de frontera. La autorización previa limitada a FB-01 no autoriza conectar el bootstrap ni alterar callers. | No conectar la API a CLI/launcher ni cambiar legacy por inferencia. |
| 3. FB-03 — aislamiento/E2/E3 | Evaluar solo el entorno real una vez identificado: lanzador, relanzamiento, escritores incluidos y control verificable durante la ventana. | Entorno y mecanismo reales aún UNKNOWN; P01-B continúa C — NO SELECCIONAR TODAVÍA. | No escoger Termux, app propia, lock o mecanismo de filesystem sin decisión/evidencia. |
| 4. FB-04 — publicación segura | Conservar las condiciones STOP para estado previo, conflictos y resultados ambiguos. | Garantía verificable de no-sobrescritura/recuperación que resuelva TOCTOU y escritores no cooperativos; no existe aún. | El preflight de temporales no autoriza publicación real. |
| 5. FB-05 — política | Mantener separadas las propuestas técnicas de las decisiones de política. | P-05 sigue NO RATIFICADA; recuperación/readmisión no se decide por inferencia. | No definir política en nombre del propietario. |
| 6. FB-06/FB-07 — aceptación | Tras resolver los bloqueos anteriores, fijar un SHA candidato, revisar el diff y ejecutar únicamente con autorización expresa. | Pruebas negativas y CI vinculados al mismo SHA, más evidencia ambiental pertinente. No hay PASS actual. | Sin autorización de ejecución, no correr tests, CI/Actions, bootstrap ni efectos. |

## Estado de evidencia

- **Implementado:** API dedicada de bootstrap y pruebas de contrato añadidas en archivos; el estado de archivos no demuestra que las pruebas pasen.
- **Inspeccionado estáticamente:** relación root→destino en la API candidata; ausencia de owner devuelto por esa API; ruta Chronicle compuesta capaz de inicializar Continuity y continuar a operación; callers legacy identificados.
- **Probado:** NO en esta secuencia; no se ejecutaron tests ni CI/Actions.
- **Autorizado:** modificación limitada original de FB-01. No incluye pruebas, CI/Actions, conectar la API a un launcher, bootstrap real, primera publicación operativa ni efectos protegidos.

## Gates preservados

- M0 INCOMPLETO.
- FB-01 y FB-02 OPEN/UNKNOWN; FB-03/FB-04 OPEN/UNKNOWN; FB-06/FB-07 OPEN.
- P01-B = C — NO SELECCIONAR TODAVÍA.
- P-05 NO RATIFICADA.
- D0/D1/D2/D3 OPEN.
- D1-IMPLEMENTATION NO AUTORIZADA fuera del alcance limitado FB-01.
- Raíz PENDING/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY.
- `authorization: NOT_EVALUATED`.
- Primera creación operativa de Continuity y efectos protegidos STOP.

## Próxima acción

No repetir trabajo de investigación. La siguiente acción técnica solo puede ser una de estas dos, según autorización y evidencia nuevas: (a) resolver mediante decisión explícita la frontera/alcance necesario para modificar y probar no-bypass, o (b) documentar evidencia concreta del entorno real E2/E3. Hasta entonces, mantener el código y los gates sin cambios.
