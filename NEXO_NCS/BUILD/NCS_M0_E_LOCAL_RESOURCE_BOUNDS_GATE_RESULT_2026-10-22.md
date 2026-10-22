# NCS M0-E — resultado acotado de suficiencia de límites locales

Fecha: 2026-10-22  
Rama: `ncs-clean-architecture`  
Tipo: evaluación de código, pruebas y CI existente; no modifica runtime ni afirma ejecuciones nuevas.

## Resultado

**Los límites locales por entrada/documento/store y la integridad de commit por-store están implementados y tienen evidencia de prueba suficiente para este subcriterio acotado.** Esto no cierra el presupuesto agregado de recursos ni habilita servicio concurrente/multiusuario.

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

El inventario [M0-E resource entrypoint coverage](NCS_M0_E_RESOURCE_ENTRYPOINT_COVERAGE_2026-10-22.md) y la inspección de callers confirman que las rutas revisadas —CLI Chronicle, capa de aplicación, consultas Continuity, apertura del owner, runtime owner-backed y acceso directo a los stores— llegan a los stores con validación local. La cobertura depende de usar estas rutas/validadores; no convierte un path local de confianza en sandbox.

No se demuestra:

- un límite de heap V8 o de memoria transitoria por operación;
- una cuota agregada de heap/disco entre Chronicle, Continuity, consultas, rutas o procesos;
- exclusión forzada de varias invocaciones CLI simultáneas;
- aislamiento frente a procesos locales no confiables, ataques de ruta/symlink ni durabilidad ante pérdida de energía.

Una lectura acotada aún puede concatenar buffers, decodificar, parsear JSON y clonar estructuras. Por ello, los límites JSON no equivalen a un techo de memoria residente.

## Disposición

- Subcriterio local por entrada/documento/store: **VALIDADO EN EL ALCANCE ACOTADO DESCRITO**.
- Presupuesto agregado de heap/disco: **OPEN**.
- Concurrencia multiproceso/multiusuario: **NO DECLARADA NI GARANTIZADA**.
- M0: `INCOMPLETO`; autorización: `NOT_EVALUATED`; raíz legítima: `PENDING/UNKNOWN`; efectos protegidos: `STOP`.

No añadir una cola, semáforo, contador o wrapper global sin definir antes una unidad de admisión y probar que cubre todas las rutas y procesos relevantes. Para el prototipo local, conservar el límite agregado como brecha explícita y no bloquear el siguiente trabajo de Nexo que no requiera afirmar capacidad concurrente.
