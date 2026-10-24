# NCS M0 — línea de meta y criterios de aceptación

Fecha: 2026-10-24  
Estado: **PROPUESTA DE CIERRE VERIFICABLE — PENDIENTE DE ACEPTACIÓN DEL PROPIETARIO — SIN AUTORIZACIÓN DE IMPLEMENTACIÓN**

## 1. Propósito

Evitar que M0 continúe indefinidamente por revisiones repetidas y, al mismo tiempo, impedir que un cierre administrativo, documental o de CI se confunda con una instancia Nexo autorizada para ejecutar efectos protegidos.

M0 se define aquí como un **núcleo/prototipo no autoritativo**. Completar M0 no equivale a commissioning, legitimidad de la raíz, autoridad constitucional, producción segura ni permiso de dispatch o efectos protegidos.

Este documento propone criterios de aceptación falsables. No cambia por sí mismo el estado canónico, no acepta decisiones D0-D3 en nombre del propietario y no autoriza modificar runtime, tests o workflows.

## 2. Dos resultados diferentes que no deben mezclarse

### 2.1 M0_BUILD_COMPLETE

Solo puede declararse cuando se cumplen todos los criterios obligatorios de la sección 3 y la evidencia está ligada al SHA exacto que se evalúa. Las exclusiones de alcance deben estar enumeradas y aceptadas explícitamente; una brecha crítica no se convierte en exclusión por silencio.

### 2.2 PROTECTED_EFFECTS_AUTHORIZED

Es un gate separado. **No forma parte de la conclusión automática de M0_BUILD_COMPLETE y no se deriva de ella.** Requiere demostrar por separado autoridad legítima, política constitucional aplicable, límites de ejecución y el mecanismo autorizado para efectos protegidos. Mientras esa evidencia no exista, el estado sigue siendo STOP.

No crear estados persistentes ni enums nuevos en runtime por usar estas etiquetas en este documento; son etiquetas de aceptación documental propuestas.

## 3. Criterios obligatorios propuestos para M0_BUILD_COMPLETE

### A. Alcance y contratos congelados

1. El alcance de M0 y sus exclusiones están escritos de forma inequívoca; no se presenta M0 como una IA autónoma terminada ni como autoridad constitucional operativa.
2. Las decisiones de diseño necesarias para el alcance se registran como aceptadas por el propietario, rechazadas o explícitamente fuera de alcance. Las recomendaciones técnicas no cuentan como aceptación.
3. D0 (interfaz/raíz, bootstrap, aliases/rutas y tratamiento legacy), D1 (callers y no-bypass), D2 (admisión, locks, alcance de operación, persistencia/release/re-admisión) y D3 (entorno y migración, cuando pertenezcan al alcance) tienen contratos coherentes. Cualquier componente diferido se enumera con su riesgo y la afirmación de capacidad que queda prohibida.
4. La semántica de `ROOT_READY` permanece limitada a las precondiciones que se hayan aprobado. Una ruta existente no implica instancia inicializada, stores válidos, autoridad legítima ni permiso de efectos.

### B. No-bypass y frontera de autoridad

5. Existe un inventario reproducible de entrypoints y callers dentro del alcance, con imports/reexports, cargas dinámicas, procesos hijos y rutas indirectas clasificados. Toda arista sin resolver que pueda alcanzar operaciones protegidas se trata como UNKNOWN/BLOCKED, no como PASS.
6. La prueba arquitectónica de no-bypass especificada para el diseño se implementa y ejecuta después de congelar el contrato y recibir autorización separada. El resultado debe corresponder al SHA exacto; una inspección estática o un test con nombre parecido no sustituye esta evidencia.
7. La admisión técnica, la integridad de stores, la identidad criptográfica y la autorización constitucional permanecen separadas. Ningún éxito de lock/bootstrap se interpreta como autoridad.
8. Repair/dispatch y efectos protegidos siguen excluidos o bloqueados mientras su autorización no esté demostrada. M0 no puede declararlos habilitados por conveniencia de pruebas.

### C. Bootstrap, stores y recuperación

9. El primer bootstrap tiene un protocolo aprobado para raíz ausente, creación concurrente, interrupción y estado parcial. La operación normal no crea ni repara silenciosamente una raíz.
10. `BOOTSTRAP_PARTIAL`, owner incompleto/corrupto, stores ausentes o corruptos y datos contradictorios conducen a UNKNOWN/BLOCKED hasta que exista un procedimiento explícito y verificable de recuperación. La ausencia de datos no prueba que se trate de una instancia nueva.
11. Las pruebas deterministas cubren la competencia entre procesos en primer uso, fallos de creación/escritura de owner, sustitución de un lock entre validación y retirada, el segundo intento de Continuity, la limpieza compensatoria y los resultados de persistencia frente a release incierto.
12. La recuperación no puede borrar un objeto reemplazado ni re-admitir operaciones mientras un actor anterior aún pueda modificar el estado protegido. Si el mecanismo y el entorno no demuestran ambas propiedades, el resultado sigue siendo UNKNOWN/BLOCKED.
13. Persistencia, resultado de negocio, liberación del lock y re-admisión se informan por separado. No se repite automáticamente una operación de negocio porque el release falle o su resultado sea ambiguo.

### D. Recursos, integridad y regresión

14. Los límites de recursos incluidos en el alcance tienen contratos explícitos y pruebas de borde; rechazos por exceso no deben producir persistencia, dispatch ni mutaciones laterales no autorizadas.
15. Las pruebas de rutas reservadas y tipos de filesystem cubren la política que el propietario haya aprobado. No se afirma defensa universal contra TOCTOU, aliases de mounts o actores locales hostiles si el modelo no lo demuestra.
16. Las regresiones requeridas para cada contrato se ejecutan en CI sobre el SHA que contiene tanto implementación como tests. Se inspeccionan los jobs y sus conclusiones; un run de otro SHA o solo de documentación no cuenta como evidencia del cambio.
17. No queda ninguna brecha UNKNOWN/BLOCKED en un camino declarado dentro del alcance de M0. Una brecha solo puede quedar fuera de alcance mediante exclusión explícita, con capacidad afectada y riesgo documentados y aceptados.

### E. Evidencia y reproducibilidad

18. Cada criterio se vincula a evidencia concreta: archivo/contrato, test, SHA, job/run y resultado. Debe poder repetirse la comprobación sin depender de memoria conversacional.
19. Se distingue expresamente entre: implementado; test ejecutado; CI verificado; propuesta documental; decisión pendiente; y comportamiento no probado.
20. Se registra una revisión final de consistencia entre D0-D3 y un acta breve de aceptación M0 que enumere criterios PASS, exclusiones aceptadas y criterios fallidos. No se declara M0 completo si falta una aprobación requerida o evidencia obligatoria.

## 4. Condiciones de NO CIERRE

M0 permanece INCOMPLETO si ocurre cualquiera de las siguientes condiciones:

- una decisión del propietario necesaria para el alcance sigue pendiente;
- el test arquitectónico o una prueba adversarial obligatoria no está implementado/ejecutado;
- CI no corresponde al SHA exacto o no se puede verificar su resultado;
- el bootstrap o la re-admisión depende de una suposición sobre el entorno;
- se infiere autoridad a partir de la existencia de una raíz, un lock o una prueba verde;
- una brecha crítica se etiqueta como aceptable sin una exclusión de alcance explícita;
- los resultados de persistencia y liberación se confunden o un resultado ambiguo provoca retry automático de negocio.

## 5. Secuencia de cierre propuesta, sin repetir investigación

1. El propietario acepta, modifica o rechaza esta línea de meta y confirma el alcance exacto de M0.
2. Se resuelven únicamente las decisiones de diseño necesarias para ese alcance, reutilizando los ledgers y matrices existentes; no se repiten censos ni auditorías sin cambio de fuente.
3. Se congela el diseño verificable y se obtiene autorización explícita separada para implementar tests/runtime/workflows.
4. Se implementan solo las pruebas y cambios requeridos por los contratos aceptados; cualquier necesidad de una nueva decisión detiene ese cambio.
5. Se ejecuta CI y se verifica el SHA exacto, los jobs y los resultados.
6. Se completa el acta de aceptación criterio por criterio. Los fallos permanecen abiertos; no se convierten en PASS por documentación.
7. Se declara M0_BUILD_COMPLETE únicamente si todos los criterios obligatorios aplicables pasan y las exclusiones han sido aceptadas.
8. El gate PROTECTED_EFFECTS_AUTHORIZED permanece independiente y en STOP hasta su demostración y autorización propias.

## 6. Qué no pretende esta propuesta

- No afirma que todos los criterios estén implementados o probados hoy.
- No selecciona una opción de bootstrap, lock/recovery, alias o migración en nombre del propietario.
- No asume runtime objetivo, sistema operativo, operador o control de relanzamiento.
- No añade markers, locks, IDs, colas, retries, tombstones ni otros mecanismos de runtime.
- No cambia el estado canónico ni autoriza commissioning, repair, dispatch o efectos protegidos.

## 7. Estado al redactar

M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización de implementación `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Este documento es una propuesta para hacer explícita la línea de meta. Su presencia en GitHub no significa que el propietario haya aceptado sus criterios.
