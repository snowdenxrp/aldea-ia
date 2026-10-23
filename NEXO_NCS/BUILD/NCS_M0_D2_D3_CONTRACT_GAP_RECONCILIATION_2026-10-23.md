# NCS M0 — reconciliación de brechas de contrato D2/D3

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **ANÁLISIS DE DEPENDENCIAS — D2/D3 OPEN — SIN IMPLEMENTACIÓN**

## 1. Propósito y fuentes

Este documento identifica decisiones de contrato que siguen abiertas al cruzar el paquete D0/D1 con el contrato de raíz, la matriz de decisiones y el análisis de recursos. No repite el censo de código ni atribuye aprobación al propietario.

Fuentes actuales de referencia:
- `NCS_M0_OWNER_DECISION_PACKET_D0_D1_SEQUENCE_2026-10-23.md`
- `NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`
- `NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md`
- `NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md`
- `NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md`

## 2. Conclusión ejecutiva

No hay una contradicción técnica inevitable entre D2 y D3, pero existen cuatro contratos que no deben fusionarse ni resolverse por suposición:

1. **Exclusión por operación vs garantía de recursos.** Un lock puede serializar operaciones cooperantes, pero no fija una cota exacta de heap V8 ni una cuota de disco. La garantía debe limitarse a la propiedad que el protocolo realmente puede probar.
2. **Admisión de instancia vs gate constitucional.** La admisión puede coordinar acceso a persistencia, pero no habilita repair, dispatch, settlement ni efectos protegidos. Esos flujos permanecen fuera del permiso que concede la raíz.
3. **Lock de raíz vs locks por store.** Se debe conservar el protocolo observable de Continuity y Chronicle. La elección entre una primitiva de raíz separada y una primitiva compartida con políticas explícitas sigue abierta; no hay base para refactorizar ambos locks mecánicamente.
4. **Raíz canónica vs datos preexistentes.** Derivar nuevos paths no resuelve dónde está la continuidad existente. D3 requiere inventario por instalación y cutover verificable; no se puede elegir ni mover una fuente automáticamente.

## 3. D2 — alcance exacto de la sección crítica

### D2-G1. ¿Qué operaciones necesitan admisión?

La recomendación vigente es admitir antes de la primera lectura todas las operaciones que cargan un snapshot canónico de Continuity/Chronicle y mantener la admisión durante el uso del snapshot y sus writes derivados. Esto incluye status, mission status, plan, previews y Open Loops, aunque sean de solo lectura.

**Por qué importa:** si la promesa se limita a “un writer a la vez”, un lector puede materializar un snapshot simultáneamente con una operación que lo modifica. Si se promete un solo snapshot protegido vivo por instancia, liberar el lock antes de devolver/consumir el snapshot no satisface la promesa.

**Decisión aún necesaria:** definir el final exacto de la sección crítica para consultas: hasta que se complete la proyección en memoria, o hasta el retorno al caller. No retener la admisión después del retorno ni permitir que una API pública devuelva un handle lazy que siga leyendo store sin contexto.

### D2-G2. ¿Qué se excluye?

- Funciones puras que operan solo sobre valores ya materializados.
- Tests y workers que ejercitan primitivas de store de forma aislada; no son prueba de admisión productiva.
- `assistants` y `simulate` mientras su semántica multi-store no esté definida y aprobada.
- Repair/dispatch/settlement/efectos protegidos: la admisión no los autoriza. No integrar ni activar esas rutas como parte de este trabajo.

Una futura ruta de repair podría necesitar coordinación de lectura/persistencia, pero eso sería una pregunta subordinada al gate constitucional separado. No es una excepción que pueda usar la raíz para recuperar permiso.

### D2-G3. ¿Quién adquiere el lock?

Si `scripts/nexo-chronicle-session.mjs` sigue siendo invocable directamente, debe validar la raíz y adquirir su propia admisión. El padre no puede conservar el mismo lock no reentrante mientras espera mediante `spawnSync`, porque el hijo esperaría sobre el lock del padre. El padre pasa una única raíz/configuración, no un token de autoridad.

Alternativa de diseño: que el padre posea toda la operación y el hijo sea un worker privado no invocable directamente. Eso exige cambiar la frontera de ejecución y demostrar que no existe invocación directa; no mezclarlo con el modelo de admisión propia del hijo.

### D2-G4. Lock raíz separado o primitiva compartida

Las pruebas y la fuente muestran diferencias observables en los locks actuales: forma del owner record, reintento de liberación, registro local de rutas con liberación fallida y tratamiento posterior de esas rutas. No se deben borrar estas diferencias por refactor.

- **Opción A — lock de raíz independiente:** menor radio de cambio inicial; añade una tercera primitiva que debe caracterizarse y mantenerse.
- **Opción B — primitiva compartida con políticas explícitas:** puede reducir duplicación, pero solo si cada comportamiento existente se conserva y las pruebas de caracterización demuestran equivalencia externa.

**Recomendación:** primero matriz de caracterización de ambos stores; después elegir. No usar “compartir código” como objetivo superior a conservar contratos observables. No implementar ninguna opción ahora.

### D2-G5. Stale, timeout y liberación incierta

Los valores candidatos existentes (espera 2.000 ms, comprobación 10 ms, stale después de 60 s con PID no vivo, sin eliminación automática) son referencias de diseño, no decisiones aprobadas.

Antes de congelarlos deben resolverse:
- El PID puede reutilizarse; no es identidad de propietario ni prueba criptográfica.
- Owner ausente brevemente durante `mkdir` no equivale a owner corrupto persistente.
- Owner inválido/ilegible y lock sustituido durante release deben producir UNKNOWN/BLOCKED.
- Un lock stale no debe eliminarse automáticamente; debe existir procedimiento explícito de recuperación.
- Si release no puede confirmarse, no se debe informar éxito limpio ni reintentar la operación de negocio. Definir si la cuarentena en memoria es solo defensa local o parte del contrato; no tratarla como protección entre procesos.
- El presupuesto de espera que se transmite al hijo debe ser relativo; un deadline monotónico de un proceso no se copia como valor absoluto a otro proceso.

Criterio de cierre: estados/códigos y transición de cada error definidos; pruebas de proceso concurrente y fallo de release; persistencia y bytes observados antes/después; ningún resultado ambiguo convertido en PASS.

## 4. D3 — datos existentes, cutover y rollback

### D3-G1. Inventario antes de elegir fuente

Las rutas históricas de Continuity/Chronicle pueden ser independientes y el owner puede importar `legacyMemory`. No hay evidencia de que cada instalación existente ya tenga sus archivos en el layout canónico propuesto.

Por tanto, la raíz nueva no puede simplemente asumir que `<root>/continuity.json` es la fuente correcta. El dry-run debe enumerar, por instalación:
- rutas origen detectadas y sus tipos de archivo;
- destino canónico esperado;
- existencia de múltiples candidatos o datos divergentes;
- tamaños, hashes y revisión/identificadores disponibles;
- conflictos de nombres reservados, symlinks y temporales ambiguos;
- acción prevista, sin ejecutar escrituras.

Si hay múltiples candidatos divergentes o una fuente no se puede validar, resultado BLOCKED/UNKNOWN. No escoger el más reciente por mtime ni combinar journals por heurística.

### D3-G2. Secuencia de cutover propuesta

1. **Dry-run:** solo inventario; no crea root, stores ni archivos temporales.
2. **Preparación de copia:** preservar el origen y copiar a un destino de preparación identificado en el plan; no hacer dual-write.
3. **Verificación:** comparar bytes/hash, revisión y validación semántica del destino; registrar cualquier diferencia.
4. **Aprobación explícita de cutover:** separar la autorización de la preparación. No cambiar el origen ni borrar la fuente durante la verificación.
5. **Cutover:** cambiar explícitamente la configuración usada por el entrypoint a la raíz validada; no mantener dos rutas activas en paralelo.
6. **Verificación posterior:** abrir solo mediante el contrato nuevo y comparar las invariantes de continuidad esperadas.
7. **Rollback:** volver a la configuración anterior sin reescribir la fuente original. Si el nuevo destino recibió escrituras posteriores al cutover, no sobrescribir ni fusionar automáticamente; bloquear y requerir reconciliación explícita.

### D3-G3. ¿Qué significa rollback si hubo escrituras posteriores?

Este es el principal detalle pendiente: restaurar el path antiguo después de que el nuevo store recibió nuevas operaciones puede perder continuidad o crear dos historiales divergentes. El rollback no debe ser una simple “copiar hacia atrás”.

Propuesta: durante la fase de diseño, definir una ventana de cutover y una condición explícita para rollback. Si el destino nuevo cambia después de la activación, el rollback automático queda prohibido; se conserva el origen, se captura evidencia y se solicita reconciliación manual/autoridad del propietario. No inventar merge, rebase de journal, tombstones ni dual-write para facilitar el rollback.

### D3-G4. Symlinks y rutas físicas

Canonicalizar la raíz no impide que `continuity.json` o `chronicle.json` sean symlinks a archivos externos. El contrato debe especificar y probar que los nombres reservados de stores y lock no aceptan symlinks o formas ambiguas. También debe declarar el límite frente a TOCTOU, hard links, bind mounts y procesos locales hostiles; la raíz no es un sandbox.

### D3-G5. Prueba de recursos no sustituye migración

- El límite nominal conjunto de los dos documentos es 48 MiB serializados.
- Eso no es una cota de heap.
- No hay cuota de disco total demostrada.
- El lock de instancia no garantiza espacio disponible ni persistencia frente a pérdida de energía.

D3 debe verificar bytes copiados y procedencia, no afirmar que la nueva raíz resuelve límites de memoria o disco.

## 5. Dependencias y orden coherente

1. Resolver D0-C1…C4: interfaz, bootstrap, alias/symlinks, compatibilidad legacy.
2. Confirmar la distinción D1-DESIGN / D1-IMPLEMENTATION o aprobar expresamente otra secuencia.
3. Congelar D2-G1…G5: alcance, ownership padre/hijo, lock, errores, timeout y recuperación.
4. Congelar D3-G1…G5: inventario, copia, verificación, cutover, rollback y rutas físicas.
5. Hacer cross-check entre los cuatro contratos, sin convertir el cierre documental en autorización de implementación.
6. Solicitar autorización separada y acotada para runtime/tests/workflows.
7. Solo después implementar, ejecutar tests y CI con evidencia ligada al SHA exacto.

## 6. Estado

- D2: **OPEN** — protocolo no elegido ni implementado.
- D3: **OPEN** — migración no ejecutada; no hay inventario por instalación.
- D0/D1: **OPEN**.
- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows: sin cambios; tests/CI no ejecutados en esta pasada.

## 7. Continuidad

Siguiente paso: contrastar este documento con el paquete de decisión D0/D1 y el contrato de raíz, registrar cualquier contradicción textual concreta y actualizar STATUS/handoff. No repetir el censo de código ni implementar un lock aislado mientras los contratos continúen abiertos.
