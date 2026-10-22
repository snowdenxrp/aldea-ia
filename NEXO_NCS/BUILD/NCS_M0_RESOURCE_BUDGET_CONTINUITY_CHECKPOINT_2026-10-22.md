# NCS M0 — checkpoint de capacidad de Continuity
Fecha: 2026-10-22
Rama: `ncs-clean-architecture`
Estado: pruebas focalizadas añadidas y CI verificado; presupuesto agregado todavía OPEN.

## Fuente de continuidad
- Entrar por `NEXO_NCS/STATUS.md`.
- La decisión numérica aceptada permanece en `NEXO_NCS/DECISIONS/NCS_M0_RESOURCE_BUDGET_PROFILE_ACCEPTED_2026-10-22.md`.
- No volver a investigar los principios generales de AB104.397/AB104.398 ni repetir suites anteriores sin un fallo nuevo.
- No cambiar a la tarea intención→borrador hasta atender el presupuesto agregado que queda abierto.

## Trabajo añadido en este checkpoint
Commit de tests: `cd9082d8e81bf2fe2c38f849f39de7429d300ea0`.

En `tests/nexo/continuity-store.test.mjs`:
1. Snapshot estructuralmente válido cuyo envelope excede el máximo: `commitIfCurrent` debe devolver `NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED`, preservar el archivo byte por byte y mantener revisión 0.
2. Dos snapshots válidos de 14 MiB compiten contra la misma revisión: un único `committed`, un `conflict`, revisión final 1, envelope final dentro del máximo y contenido completo de uno de los candidatos.

## CI para el SHA exacto de código y pruebas
Los cinco workflows reportaron `completed/success`, todos con el mismo `head_sha=cd9082d8e81bf2fe2c38f849f39de7429d300ea0`:
- [Persistencia determinista](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783628)
- [STEP 4 — validación semántica](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783712)
- [STEP 5 — clasificación de resultados](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783868)
- [Regresión de aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783772)
- [Admisión de misión y continuidad de reinicio](https://github.com/snowdenxrp/aldea-ia/actions/runs/39788783802)

El job de continuidad confirma el paso `Run node tests/nexo/continuity-store.test.mjs` en `success`. Los cambios de STATUS/handoff son commits documentales posteriores; no atribuirles estos resultados de CI.

## Brecha restante
El perfil individual se aplica con límites de lectura cruda, cardinalidad y tamaño serializado, pero esto **no demuestra un máximo agregado de heap o disco**:
- Chronicle: hasta 32 MiB serializados.
- Continuity: hasta 16 MiB serializados.
- La serialización, buffers, snapshots clonados y objetos parseados pueden coexistir durante una operación; no asumir que el pico de heap equivale a 48 MiB.
- No declarar seguridad para servicio concurrente/multiusuario ni inventar una cifra agregada sin derivación del runtime.

## Siguiente paso
Construir un presupuesto agregado local de heap/disco a partir de las rutas de código y copias realmente simultáneas:
1. inventariar los buffers/snapshots/documentos simultáneamente vivos en append/load/commit;
2. separar límites persistidos de heap transitorio y disco;
3. derivar una cota conservadora, o declarar exactamente qué dimensión no puede acotarse con la arquitectura actual;
4. si requiere cambiar estructura, detenerse y resolver la causa raíz antes de parchear;
5. añadir pruebas sólo para la cota derivada, no repetir los cinco workflows completos sin necesidad.

No implementar rotación, truncamiento, borrado, colas, reintentos ni wrappers transaccionales inventados.

## Estado canónico
M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Análisis agregado posterior (2026-10-22)

- Añadido [NCS_M0_AGGREGATE_RESOURCE_BOUND_ANALYSIS_2026-10-22.md](NCS_M0_AGGREGATE_RESOURCE_BOUND_ANALYSIS_2026-10-22.md).
- Hallazgo de disco: subtotal canónico+temporal = 96 MiB en el peor instante modelado (32+32 Chronicle, 16+16 Continuity), pero no es cota total porque los temporales únicos pueden quedar huérfanos tras una terminación abrupta.
- Hallazgo de heap: no se puede sumar 32+16 MiB; hay strings, objetos parseados, serializaciones y snapshots clonados. No hay cuota global de heap ni límite de concurrencia entre stores/procesos.
- El análisis documental se registró en STATUS por commit `4ef935ed90f8bf0826457776fecce4eaf5b81a71`; no es cambio de runtime ni tiene CI propio.
- Siguiente: resolver estructuralmente el protocolo acotado de temporales y definir el modo de concurrencia soportado por M0. No volver a ejecutar las pruebas ya cerradas salvo que cambie el código relevante.
