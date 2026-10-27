# NCS M0 — Contrato candidato de frontera: bootstrap, autoridad, persistencia y concurrencia
Fecha: 2026-10-27
Estado: **CANDIDATO DE DISEÑO — NO RATIFICADO — STOP ANTES DE IMPLEMENTAR**

## 0. Propósito y alcance

Este documento convierte los hallazgos estáticos recientes en propiedades comprobables, sin proponer una reparación de código todavía. No reemplaza MASTER, CORE, la Constitución ni el gate de Trust Foundation. No habilita efectos protegidos. No cierra M0.

Ámbito limitado: bootstrap e inicialización de continuidad/Chronicle, migración de `legacyMemory`, admisión de misiones y transición hacia cualquier despacho o persistencia de dominio en las rutas revisadas.

## 1. Invariantes propuestos para ataque

**B1 — Bootstrap no implica autoridad.** Inicializar un store, migrar datos, cargar una snapshot o reconstruir una misión nunca establece por sí mismo autoridad constitucional, política aplicable ni permiso de ejecución.

**B2 — Bootstrap no debe cruzar silenciosamente al despacho.** Una invocación cuyo propósito sea inicializar, migrar o validar el estado de almacenamiento no debe, como efecto lateral de esa misma ruta, admitir una misión, preparar un efecto, despachar un adapter ni mutar el dominio Chronicle. Si el producto requiere una operación combinada, debe definirse explícitamente como una operación diferente con gates completos; no se presume permitida por un flag de inicialización.

**B3 — UNKNOWN es cerrado.** Si la autoridad actual, integridad de la fuente, resultado de persistencia, propiedad del lock, identidad del estado o condición de concurrencia requerida es UNKNOWN, la ruta no avanza hacia admisión/dispatch. No hay fallback permisivo desde `authorization: NOT_EVALUATED`.

**B4 — Datos operativos no son credenciales.** `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`, `legacyMemory`, snapshots, hashes, revisions, PREPARED, lineage y recovery records pueden ser evidencia/estado operativo; ninguno es por sí solo raíz de confianza o autoridad actual.

**B5 — Separación Nexo/Lúmina.** Una ruta de simulación o asistentes no debe convertir memoria de simulación/learning en autoridad Nexo ni permitir que una migración operacional Nexo altere silenciosamente el estado de Lúmina. El intercambio de datos, si se permite, necesita contrato de esquema, dirección, finalidad y límites explícitos; los archivos separados no prueban aislamiento semántico.

**B6 — Persistencia declarada con precisión.** Éxito de una escritura en un archivo no demuestra transacción entre Continuity y Chronicle, durabilidad ante pérdida de energía, exclusión de escritores externos ni verdad de un efecto externo. Cada afirmación de persistencia debe indicar store, revisión, límite de atomicidad y evidencia.

**B7 — La coordinación solo cubre a sus participantes.** Un lock por path solo permite afirmar serialización entre escritores que lo respetan y comparten las mismas suposiciones de ruta/FS. No se presume exclusión de procesos que lo ignoren, paths alternativos, procesos externos ni otros dispositivos.

**B8 — Reparación fuera de M0.** El gate local de Opción A no demuestra que todas las rutas de reparación estén globalmente inalcanzables. Mientras el inventario de rutas no cierre esa propiedad, el resultado es UNKNOWN y no se declara exclusión global demostrada.

## 2. Separación de fases y efectos permitidos

| Fase | Propósito permitido bajo este candidato | No debe implicar |
|---|---|---|
| Descubrimiento/lectura | Identificar store presente/ausente/corrupto y obtener evidencia no autoritativa | Crear, reparar, admitir o despachar |
| Inicialización vacía explícita | Crear únicamente el estado inicial documentado, si el contrato de bootstrap lo permite | Migración implícita, misión nueva o efecto de dominio |
| Migración heredada | Proyectar solo campos permitidos a un store nuevo bajo un contrato versionado | Promoción de autoridad, importación indiscriminada o fallback que oculte corrupción |
| Reconciliación de persistencia | Clasificar committed/conflict/failed/unknown con evidencia del store | Convertir UNKNOWN en éxito ni repetir un efecto externo automáticamente |
| Admisión de misión | Operación separada, con contexto y requisitos propios | Derivarse solo de que bootstrap terminó |
| PREPARED/dispatch/settlement | Fuera de bootstrap; sujeto al gate de autoridad y al límite de efecto correspondiente | Ser autorizado por journal, replay, CLI flag, provider, modelo o snapshot |

Esta tabla es una propuesta semántica, no una descripción de comportamiento ya garantizado por la implementación.

## 3. Precondiciones candidatas para avanzar a una ruta de efecto

Antes de admitir o despachar una acción, la ruta tendría que poder demostrar, desde la frontera gobernada correspondiente:

1. raíz de confianza y autoridad actual reconocidas independientemente del estado operativo cargado;
2. Constitución/política aplicables e identidad/contexto del objetivo;
3. capacidad y permisos para la acción concreta;
4. integridad y actualidad de las dependencias requeridas;
5. resultado de persistencia conocido y compatible con el estado esperado;
6. estado de concurrencia/fencing suficiente para el límite del efecto real;
7. gate de STOP/revocación vigente y enforcement comprobado en la frontera que puede producir el efecto;
8. evidencia de que la ruta no puede eludir esos controles por bootstrap, migración, recuperación, CLI o entrypoint alternativo.

La lista es un conjunto de obligaciones a resolver con los contratos canónicos existentes, no una invitación a crear un nuevo “gate universal” monolítico. Si una obligación no tiene dueño canónico o evidencia, se mantiene PENDING/UNKNOWN y la ruta permanece cerrada.

## 4. Estados de salida que no deben colapsarse

- `COMMITTED`: el store confirmó el cambio dentro de su contrato local; no significa autoridad ni efecto externo.
- `CONFLICT`: el estado observado no satisface la precondición; no sobrescribir ni reinterpretar como inicialización vacía.
- `FAILED`: se conoce una falla según el contrato; puede haber persistencia parcial que debe expresarse por separado.
- `UNKNOWN`: no se puede establecer con evidencia suficiente si la operación quedó aplicada; detener el avance y no inferir éxito.
- `NOT_EVALUATED`: la autorización no se evaluó; no es equivalente a ALLOW.
- `STOP`: la ruta protegida no puede avanzar hasta que el enforcement y la condición de reanudación estén demostrados.

No se añade un nuevo enum de runtime en este documento. Los nombres describen distinciones semánticas ya presentes en los contratos/estados citados y deben reconciliarse con los propietarios canónicos antes de cualquier cambio.

## 5. Criterios falsables de aceptación documental/técnica futura

Cada criterio requiere evidencia identificable; leer código o ver un test no equivale a ejecutarlo.

- **A1 Bootstrap aislado:** demostrar que inicializar/migrar no alcanza admisión, PREPARED, dispatch ni mutación Chronicle en una sola invocación. Incluir éxito, archivo ausente, corrupción, conflicto, error de lock y resultado UNKNOWN.
- **A2 Autoridad independiente:** demostrar que ninguna entrada operativa, CLI flag, proveedor, modelo, snapshot, journal o constructor local puede fabricar autoridad actual. Reutilizar el gate canónico de Trust Foundation; no inventar uno local.
- **A3 Separación de dominio:** demostrar qué datos pueden cruzar entre Nexo y Lúmina, en qué dirección y con qué validación; probar que el fallo de un lado no produce mutación no autorizada en el otro.
- **A4 Persistencia acotada:** especificar y verificar por separado atomicidad de archivo, consistencia multi-store, durabilidad ante crash/power-loss y recuperación tras resultado ambiguo. No inferir una propiedad a partir de otra.
- **A5 Concurrencia dentro del alcance:** enumerar writers/procesos/paths incluidos; probar coordinación entre escritores cooperativos y definir explícitamente el resultado si los escritores externos quedan fuera de alcance. La garantía del filesystem objetivo necesita evidencia específica.
- **A6 STOP y reparación:** enumerar rutas capaces de producir efectos y demostrar que STOP y exclusión de reparaciones se aplican en el límite real, no solo en una CLI o wrapper.
- **A7 Línea de meta M0:** declarar explícitamente qué incluye y excluye M0, qué propiedades quedan demostradas, cuáles permanecen UNKNOWN y qué no puede hacer el prototipo. M0 no puede llamarse completo mientras una propiedad obligatoria carezca de evidencia o aceptación explícita de su límite.

## 6. Fuera de alcance / prohibiciones de inferencia

Este candidato no aprueba implementación, no autoriza effects, no propone un nuevo trust root, no convierte el archivo de continuidad en autoridad, no prescribe una primitiva de filesystem sin analizar compatibilidad, no declara exhaustivo el inventario global de callers, no presume entorno Android verificado, no afirma que un fallo concurrente haya sido reproducido y no permite que el proyecto siga indefinidamente reabriendo auditorías cerradas sin una contradicción nueva.

## 7. Preguntas adversariales que bloquean la ratificación

1. ¿Puede un caller activar bootstrap y provocar una mutación de dominio o dispatch en la misma invocación?
2. ¿Qué mecanismo existente y previamente reconocido determina la autoridad actual cuando el estado persistido se restaura, copia o migra?
3. ¿Qué significa exactamente “persistido” en cada store y qué eventos de crash están cubiertos?
4. ¿Cuáles son los writers reales incluidos en el contrato y cuáles quedan explícitamente fuera?
5. ¿Puede una ruta de reparación o de simulación alcanzar el mismo límite de efecto sin pasar por el gate requerido?
6. ¿Qué pruebas ejecutadas y evidencias independientes serían suficientes para aceptar cada propiedad?
7. ¿Qué condición exacta, observable y finita marca la línea de meta de M0?

Hasta resolverlas mediante MASTER/CORE y los contratos propietarios existentes, este documento permanece candidato y **STOP BEFORE CODE**.

## 8. Base de evidencia de esta versión

- `NEXO_NCS/BUILD/NCS_M0_STATIC_CONSUMER_MAP_QWEN_CONSOLIDATION_2026-10-27.md` — mapa estático, consumidores y límites de concurrencia.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md` — candidato de binding Constitución→Policy; no autoriza acción.
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md` — gate explícito STOP antes de código hasta que exista Trust Foundation reconocido.
- `NEXO_NCS/STATUS.md` — estado y handoff de continuidad.

No se ejecutaron código, tests, CI ni Actions al redactar esta propuesta.
