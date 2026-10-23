# NCS M0 — propuesta de decisión: raíz de instancia y concurrencia

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **PROPUESTA TÉCNICA — NO ACEPTADA POR EL PROPIETARIO; NO IMPLEMENTAR AÚN**

## 1. Pregunta que necesita decisión

¿Debe una instancia local de Nexo tener una raíz de configuración común que sea propietaria de Chronicle y Continuity y que permita imponer una frontera de admisión de operaciones compartida, o deben mantenerse las APIs actuales que reciben rutas independientes y dejar explícitamente sin garantía la concurrencia agregada?

Esta es una decisión de contrato y de superficie pública. No debe resolverse con un lock aislado derivado de una ruta arbitraria.

## 2. Evidencia actual

- `runNexoChronicleAppend(options)` recibe `continuityPath` y `chroniclePath` independientes.
- `scripts/nexo.mjs` deriva `chronicle-append` a `scripts/nexo-chronicle-session.mjs` mediante un proceso hijo.
- `src/nexo/application/continuity-queries.mjs` tiene entradas separadas para status, mission-status, mission-plan, previews y Open Loops.
- `src/nexo/core/continuity-service.mjs` expone `openNexoContinuityOwner`; las factories de stores pueden usarse por rutas internas adicionales.
- Chronicle y Continuity mantienen locks separados por archivo. El deadline monotónico compartido de una operación de append limita la espera de cada capa, pero no serializa todas las operaciones de la instancia.
- Por tanto, dos operaciones que compartan solo una de las rutas, dos procesos CLI o una consulta simultánea pueden coexistir. El lock de Chronicle no es un lock de Continuity y viceversa.
- Los almacenes ya usan un temporal estable `.tmp` y limpieza acotada bajo su lock propio. No se necesita reimplementar esa parte para abordar la concurrencia agregada.

## 3. Opciones

### Opción A — raíz canónica de instancia con admisión compartida

Una configuración confiable de instancia define un único directorio/raíz y las rutas derivadas para Chronicle, Continuity y el mecanismo de admisión. Todos los entrypoints de la instancia usan esa configuración. La admisión común cubre la operación completa y todos los puntos de entrada que puedan materializar snapshots/documentos relevantes; no basta con poner el lock solo en el CLI o solo en `runNexoChronicleAppend`.

**Ventajas**
- Hay un referente estructural común para los dos almacenes.
- Permite definir y probar una política de concurrencia por instancia entre procesos.
- Evita que la operación de append mantenga varias representaciones de estados grandes mientras otra operación Nexo hace lo mismo, siempre que todas las entradas estén dentro de la frontera.
- Ofrece un lugar coherente para fijar el perfil local de recursos y documentar rutas confiables.

**Costes y riesgos**
- Cambia el contrato de configuración/CLI que hoy acepta dos rutas independientes.
- Requiere migrar coherentemente las consultas, previews, owner-service, CLI y usos internos; cualquier bypass invalida la garantía.
- Un lock común no crea autoridad constitucional, durabilidad ante pérdida de energía ni resistencia a procesos locales hostiles.
- Serializar lecturas con escrituras reduce concurrencia. Un límite de concurrencia no equivale por sí solo a una cota exacta de heap de V8.
- El control de rutas y la recuperación del lock deben reutilizar contratos existentes; no crear una segunda identidad de instancia ni un estado de autoridad paralelo.

**Criterios mínimos antes de aceptar**
1. Contrato explícito de raíz de instancia confiable y reglas de derivación de rutas.
2. Inventario completo de todos los entrypoints y fábricas que pueden cargar o mutar esos almacenes.
3. Una sola frontera de admisión compartida por procesos y usada por todas las entradas relevantes.
4. Tests de proceso separado: mientras una operación mantiene la admisión, la segunda no materializa ni muta la instancia; al liberarse, continúa o falla de forma estructurada.
5. Tests de timeout/fallo de adquisición: cero escritura, cero despacho y preservación de archivos/revisiones.
6. Tests que demuestren que no queda un camino de entrada sin el contrato; el mero test del CLI no basta.
7. Declaración separada de las garantías no cubiertas: heap exacto, archivos ajenos, cuotas del sistema operativo, fsync y procesos hostiles.

### Opción B — mantener rutas independientes y declarar la limitación

Se conserva la API actual. Los locks por almacén protegen las mutaciones cooperantes del archivo individual; no se afirma que la instancia esté globalmente serializada ni que tenga una cota agregada de heap/disco.

**Ventajas**
- No cambia la superficie actual ni introduce una raíz implícita.
- Evita añadir infraestructura antes de que exista una necesidad de producto aceptada.
- Conserva la honestidad del estado actual: límites por documento sí; límite global de recursos no.

**Costes y riesgos**
- El presupuesto agregado de heap sigue OPEN y no se debe afirmar soporte de concurrencia acotada.
- Dos procesos pueden coexistir y retener múltiples snapshots/serializaciones.
- El disco total sigue sin cuota global; los temporales actuales están acotados por almacén, pero los residuos legacy y otros archivos no quedan cubiertos por el subtotal de 96 MiB.
- Esta opción no satisface una futura exigencia de garantía agregada sin una decisión posterior.

### Opción C — lock solo en el CLI o solo en append

**No recomendada como solución de la brecha.** Las consultas, APIs de owner y factories de store tienen rutas distintas; los procesos que no pasan por el wrapper podrían saltarse el lock. Sería una mejora parcial, no una garantía de instancia, y podría inducir una afirmación falsa de seguridad.

## 4. Recomendación técnica

Si el requisito de producto es una instancia local de Nexo con concurrencia acotada y recursos previsibles, recomiendo **Opción A**, pero únicamente como cambio estructural aprobado y migrado de extremo a extremo. No recomiendo implementar ahora un lock aislado ni cambiar las rutas CLI por inferencia.

Si el propietario no acepta cambiar el contrato de configuración en M0, elegir Opción B y dejar el presupuesto agregado OPEN es más correcto que fingir que el modo serial ya está impuesto.

**No aceptar Opción A solo porque sea la recomendación técnica.** Hace falta decisión explícita sobre el cambio de contrato antes de tocar runtime.

## 5. Separación de garantías

Incluso si se acepta Opción A:
- La admisión global puede limitar operaciones Nexo concurrentes; no establece por sí sola una cota exacta de heap.
- La cota de 96 MiB sigue siendo un subtotal transitorio de dos canónicos y dos temporales máximos, no una cuota total de disco.
- Los residuos legacy/archivos ajenos requieren una política de capacidad distinta; no borrar archivos por heurística.
- Los locks y revisiones no son autoridad, rollback protection ni prueba de efectos externos.
- M0 sigue sin commissioning ni efectos protegidos.

## 6. Estado canónico

M0: `INCOMPLETO`  
Autorización: `NOT_EVALUATED`  
Raíz legítima: `PENDING/UNKNOWN`  
Efectos protegidos: `STOP`

