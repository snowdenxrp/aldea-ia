# NCS M0-E — alcance real de Chronicle Append y su frontera de mutación
Fecha: 2026-10-21
Rama: `ncs-clean-architecture`
Estado: hallazgo de alcance; no constituye decisión constitucional ni autorización.

## Pregunta
¿La acción `chronicle_append` es un efecto externo/protegido, y cuáles son sus entradas y mutaciones concretas?

## Resultado ejecutivo
En el camino inspeccionado, `chronicle_append` es una **mutación persistente local** en un archivo Chronicle configurado por el caller, coordinada con admisión y journal de continuidad. No es, por sí sola, un efecto externo de Lúmina ni una prueba de autorización constitucional. Sin embargo, tampoco es una operación sin efectos: escribe historial local y puede inicializar stores cuando el caller pasa explícitamente los flags correspondientes.

La API mantiene explícitamente `authorization: NOT_EVALUATED`. Por tanto, el resultado positivo de Chronicle no puede presentarse como autorización ni como cierre de M0-E.

## Evidencia del código inspeccionado

### 1. Entradas identificadas
- CLI independiente: `scripts/nexo.mjs` acepta `chronicle-append` y delega a `scripts/nexo-chronicle-session.mjs`.
- CLI de sesión: `scripts/nexo-chronicle-session.mjs` exige `--content-stdin`, lee el contenido desde stdin y llama `runNexoChronicleAppend()`; no imprime contenido ni rutas en el resumen de salida.
- API de aplicación: `src/nexo/application/index.mjs` exporta `runNexoChronicleAppend` y consultas de continuidad; no exporta un dispatcher genérico.
- Caso de uso: `src/nexo/application/chronicle-append.mjs` crea stores a partir de rutas suministradas, preflight de ambos stores, opcionalmente inicializa el Chronicle si falta y se solicitó `initializeChronicle`, admite la misión en continuidad si no existe y ejecuta la única acción registrada `chronicle_append`.

La exportación de una API demuestra que la ruta está disponible para consumidores del módulo; no demuestra por sí sola qué consumidores externos la invocan en despliegue.

### 2. Mutación final
- `src/nexo/adapters/chronicle-effect.mjs` valida acción, IDs y `target.content`, luego llama `store.append({ operationKey: missionId + ":" + stepId, content })`.
- `src/nexo/core/chronicle-store.mjs` serializa un documento JSON con esquema/revisión/entries mediante escritura de archivo temporal y `rename`, bajo un lock de directorio. La clave de operación evita duplicados; reusar la clave con contenido distinto produce conflicto.
- El store declara expresamente que no reclama durabilidad ante pérdida de energía/`fsync`, protección anti-rollback ni resistencia a ataques de symlink/ruta. `filePath` es configuración confiable, no una frontera de sandbox.
- El caso de uso también muta el store de continuidad: puede registrar una misión y el runtime owner-backed persiste PREPARED/lineage/outcome mediante el owner. Estas escrituras de continuidad no convierten la operación en efecto externo autorizado.

### 3. Observación/reconciliación
- `src/nexo/adapters/chronicle-observation.mjs` vuelve a leer el store y compara clave/contenido/revisión observada.
- El propio módulo advierte que la observación no demuestra atribución causal.
- El handler retorna `verified: false`; el resultado público fija `authorization: NOT_EVALUATED`. No hay raíz constitucional legítima ni evaluación de autoridad conectada en esta ruta.


### 5. Inicialización de los dos stores: no es una transacción conjunta

La aplicación hace preflight de ambos archivos antes de escribir, lo cual evita inicializar el otro store cuando ya se detectó que el compañero está corrupto. Sin embargo, el flujo posterior no es atómico entre ambos archivos:

1. `openNexoContinuityOwner(... allowEmptyInitialization: initializeContinuity)` puede crear primero Continuity.
2. Después, si Chronicle faltaba, la aplicación llama `chronicleStore.initialize()`.
3. Si la inicialización de Chronicle falla por una condición que aparece después del preflight (por ejemplo, el directorio padre no está disponible para la escritura), la operación puede devolver `blocked` dejando Continuity ya creado.

Las pruebas existentes verifican el rechazo de stores compañeros corruptos durante preflight y la carrera de bootstrap concurrente; no encontré en la suite inspeccionada una aserción específica de recuperación/estado tras fallo del segundo bootstrap después de que el primero se haya confirmado. Esto identifica una **brecha de atomicidad/recuperación multi-store que debe evaluarse**, no una prueba de exploit ni una razón para agregar un rollback improvisado. La solución, si se requiere atomicidad, debe diseñarse como contrato estructural de bootstrap y recuperación, no como borrado compensatorio sin prueba de propiedad del archivo.

### 6. Prueba focal añadida: fallo del segundo store y recuperación explícita

En `tests/nexo/chronicle-runtime.test.mjs` se añadió un escenario reproducible:

- Continuity usa una ruta válida; Chronicle usa un directorio padre que no existe.
- Se solicita explícitamente inicializar ambos. Continuity se inicializa, pero la inicialización de Chronicle devuelve `NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE`.
- La prueba afirma que el resultado es `blocked`, `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, Continuity queda vacío, y Chronicle sigue ausente.
- Después de crear el directorio faltante, se reintenta con `initializeContinuity: false` y `initializeChronicle: true`. La prueba exige que la operación complete sin reinicializar Continuity, con una misión y una entrada Chronicle.

Esto valida un contrato de **fallo explícito y recuperación por reintento**, no atomicidad entre archivos. El código runtime no se cambió. El test se guardó en commit `8deabb5ca0b314ecd6a699a4b7a8bcb3f470c767`. CI confirmado para el SHA final `f410ab92dd113a4b3188232575098e8b02fb1371`: Run determinista [39691648024](https://github.com/snowdenxrp/aldea-ia/actions/runs/39691648024), job [tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39691648024/job/119539048110): `completed/success`; `Run tests`: SUCCESS. SHA evaluado: `f410ab92dd113a4b3188232575098e8b02fb1371`.


### 4. Qué no queda demostrado
- No se demuestra que la escritura Chronicle sea un sink externo, una acción irreversible fuera del dispositivo o una mutación Lúmina.
- Tampoco se demuestra que la configuración de rutas, los permisos del proceso o el filesystem sean una frontera de seguridad contra otro código/proceso local.
- No se demuestra que todos los callers potenciales estén inventariados en despliegue; sí se identifican la CLI, el export de API y el caso de uso.
- No se demuestra raíz/procedencia, Constitución exacta vigente, Policy/contexto confiables ni autorización para ejecutar cualquier efecto protegido.

## Clasificación de alcance provisional
| Operación | Clasificación basada en código | Autoridad constitucional |
|---|---|---|
| Consultar estado/reconstruir misión | Lectura local | No evaluada |
| Admitir misión / PREPARED / lineage / outcome | Escritura del store de continuidad local | No evaluada |
| Append de Chronicle | Escritura persistente local de contenido suministrado | No evaluada |
| Inicializar stores mediante flags explícitos | Bootstrap de persistencia local | No evaluada |
| Reparación, acciones Lúmina o efectos externos | No habilitados por esta API Chronicle | STOP |

Esta tabla describe el camino inspeccionado, no todas las rutas posibles del repositorio ni un entorno de producción.

## Consecuencia para M0
1. Chronicle Append puede encajar en un alcance técnico inicial de lectura/diagnóstico/persistencia interna **solo si el propietario selecciona ese alcance y se mantiene explícito que no está autorizado constitucionalmente**.
2. No hace falta etiquetar Chronicle como efecto externo para reconocer que tiene consecuencias persistentes y necesita integridad, control de rutas, recuperación y límites claros.
3. El límite técnico actual sigue siendo insuficiente para afirmar que la raíz legítima gobierna el último punto de mutación. La acción es local, pero la legitimidad de su ejecución no está evaluada.
4. No cambiar runtime ni habilitar acciones adicionales como parte de este hallazgo.

## Próxima tarea
Derivar un inventario de los puntos de escritura local por operación (Chronicle vs continuidad), su política de inicialización y su exposición a configuración de rutas; contrastarlo con las opciones de alcance A/B/C sin elegir por el propietario. Después, actualizar pruebas solo para un hueco nuevo reproducible. Mantener M0 `INCOMPLETO`, `authorization: NOT_EVALUATED`, raíz `PENDING/UNKNOWN`, efectos protegidos `STOP`.

## Archivos fuente
- `src/nexo/application/index.mjs`
- `src/nexo/application/chronicle-append.mjs`
- `scripts/nexo.mjs`
- `scripts/nexo-chronicle-session.mjs`
- `src/nexo/adapters/chronicle-effect.mjs`
- `src/nexo/adapters/chronicle-observation.mjs`
- `src/nexo/core/chronicle-store.mjs`
- `src/nexo/core/owner-backed-runtime.mjs`
