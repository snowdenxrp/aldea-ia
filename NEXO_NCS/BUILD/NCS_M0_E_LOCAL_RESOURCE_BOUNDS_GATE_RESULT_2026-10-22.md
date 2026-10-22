# NCS M0-E — resultado acotado de suficiencia de límites locales

Fecha: 2026-10-22  
Rama: `ncs-clean-architecture`  
Tipo: evaluación de código, pruebas y CI existente; no modifica runtime ni afirma ejecuciones nuevas.

## Resultado

**Los límites locales por documento/store y la integridad de commit por-store están implementados y tienen evidencia de prueba suficiente en las rutas revisadas; el límite stdin de Chronicle también está implementado.** No puede cerrarse todavía el límite por entrada local en general: una revisión posterior encontró que las rutas CLI `mission-draft-preview` y `mission-request-preview` leen archivos JSON sin un límite de bytes previo. Esto no cierra el presupuesto agregado ni habilita servicio concurrente/multiusuario.

## Evidencia revisada

- Perfil aceptado: stdin 256 KiB; entrada Chronicle 256 KiB UTF-8; Chronicle 10.000 entradas / 32 MiB serializados; Continuity con máximos por colección y envelope de 16 MiB.
- Lectura: `readUtf8FileBounded` limita bytes crudos a `maxBytes + 1` antes de decodificar y parsear. Chronicle y Continuity lo usan para leer sus documentos canónicos.
- Escritura: los stores comprueban cardinalidad/tamaño serializado antes de persistir; las escrituras cooperantes se coordinan mediante el lock de la ruta.
- Continuity: `tests/nexo/continuity-store.test.mjs` incluye rechazo de un snapshot estructuralmente válido que supera 16 MiB preservando bytes y revisión, y dos candidatos cercanos al límite compitiendo por la misma revisión: un commit y un conflicto; los bytes persistidos se cotejan con el envelope canónico.
- CI histórica exacta para SHA `20b3e1b51616c93862a2cad2e502c143c35b77ef`: cinco workflows SUCCESS:
  - [Integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971051)
  - [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971089)
  - [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971053)
  - [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971086)
  - [Bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39811971113)

Estos workflows no se atribuyen al HEAD documental actual y no se ejecutaron de nuevo durante esta evaluación.

## Cobertura de rutas y límites de la conclusión

El inventario [M0-E resource entrypoint coverage](NCS_M0_E_RESOURCE_ENTRYPOINT_COVERAGE_2026-10-22.md) cubre CLI Chronicle, capa de aplicación, consultas Continuity, apertura del owner, runtime owner-backed y acceso directo a los stores. La revisión adicional de `scripts/nexo.mjs` encontró que `mission-draft-preview` y `mission-request-preview` usan `fs.readFile` seguido de `JSON.parse` sin un límite previo. Hallazgo: [NCS_M0_E_MISSION_PREVIEW_INPUT_BOUNDARY_FINDING_2026-10-22.md](NCS_M0_E_MISSION_PREVIEW_INPUT_BOUNDARY_FINDING_2026-10-22.md).

No se demuestra:

- un límite de heap V8 o de memoria transitoria por operación;
- una cuota agregada de heap/disco entre Chronicle, Continuity, consultas, rutas o procesos;
- exclusión forzada de varias invocaciones CLI simultáneas;
- aislamiento frente a procesos locales no confiables, ataques de ruta/symlink ni durabilidad ante pérdida de energía.

Una lectura acotada aún puede concatenar buffers, decodificar, parsear JSON y clonar estructuras. Por ello, los límites JSON no equivalen a un techo de memoria residente.

## Disposición

- Límites por documento/store y stdin Chronicle: **VALIDADOS EN LAS RUTAS CUBIERTAS POR LA EVIDENCIA**.
- Límite de entrada local completo: **PENDING** hasta acotar las dos entradas JSON de vista previa.
- Presupuesto agregado de heap/disco: **OPEN**.
- Concurrencia multiproceso/multiusuario: **NO DECLARADA NI GARANTIZADA**.
- M0: `INCOMPLETO`; autorización: `NOT_EVALUATED`; raíz legítima: `PENDING/UNKNOWN`; efectos protegidos: `STOP`.

No añadir una cola, semáforo, contador o wrapper global sin definir antes una unidad de admisión y probar que cubre todas las rutas y procesos relevantes. Para el prototipo local, conservar el límite agregado como brecha explícita y no bloquear el siguiente trabajo de Nexo que no requiera afirmar capacidad concurrente.
