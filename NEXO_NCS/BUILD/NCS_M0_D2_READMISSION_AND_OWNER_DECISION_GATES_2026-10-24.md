# NCS M0 — D2: re-admisión tras release incierto y límites de decisión
Fecha: 2026-10-24
Rama: `ncs-clean-architecture`
Estado: **ANÁLISIS DOCUMENTAL PROPUESTO — D2 OPEN — SIN IMPLEMENTACIÓN**

## 1. Evidencia de continuidad verificada

El handoff de continuidad anterior apunta al commit `e54f46eb834d69b518d46061398a5bf50160ab28`. El workflow `Nexo — deterministic persistence tests`, run `40047742391`, terminó `success` en ese SHA. El job `tests` completó los pasos `Run tests` y `Bounded temporary cleanup regression`.

Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/40047742391

Esta CI ejecuta las pruebas ya existentes del workflow. **No** implementa ni ejecuta el contrato adversarial propuesto en el handoff; tampoco prueba la política de re-admisión completa ni cierra D2.

## 2. Política segura de re-admisión: lo que sí se puede afirmar

Después de `LOCK_RELEASE_UNCERTAIN`:

1. No reintentar automáticamente la operación de negocio, aunque el resultado de persistencia sea UNKNOWN.
2. No convertir una persistencia confirmada en fallo de negocio por el solo hecho de que release sea incierto.
3. No considerar que la ausencia actual del path demuestra por sí sola que ya no existe un actor vivo capaz de volver a tocarlo.
4. No admitir una nueva operación mientras el estado/identidad del lock o la posibilidad de una limpieza viva sigan ambiguos.
5. La cuarentena en memoria de un proceso no coordina otros procesos; no es una garantía global.
6. No añadir automáticamente un marcador persistente, lock hermano, identificador, cola o estado nuevo para resolver esa limitación.

Esto fija el comportamiento fail-closed, pero **no determina aún el mecanismo suficiente para retirar la cuarentena**. La condición verificable de re-admisión debe ser elegida dentro del protocolo aprobado y cubrir tanto el path presente/ilegible/reemplazado como el caso de un actor anterior que aún pueda actuar.

## 3. Relación con bootstrap parcial

`BOOTSTRAP_PARTIAL` permanece `UNKNOWN/BLOCKED`. “Recuperación explícita” significa que existe un disparador explícito; no prueba autoridad suficiente, integridad ni permiso para descartar datos.

Antes de permitir recuperación deben quedar definidos y probados:
- estados recuperables frente a estados que deben permanecer bloqueados;
- actor y alcance autorizados para la recuperación;
- inventario/preservación previa a toda mutación;
- operaciones permitidas y condiciones de aborto;
- evidencia de finalización que permita reconsiderar admisión;
- conducta ante crash durante la recuperación y ante un segundo proceso concurrente.

Recuperar técnicamente no legitima la raíz constitucional ni habilita repair, dispatch, commissioning u otros efectos protegidos. Ausencia/corrupción no significa “instancia nueva”.

## 4. Decisiones del propietario frente a trabajo técnico

### Decisiones reservadas al propietario (no aceptadas por este documento)
- D0-C1: interfaz/configuración exacta de la raíz.
- D0-C2: protocolo de primer bootstrap y recuperación parcial.
- D0-C3: política de alias, symlinks y tipos aceptados en rutas reservadas.
- D0-C4/D3: estrategia y condiciones de migración/cutover legacy.
- D1-S0: separación diseño/implementación u otra opción aprobada.
- D2: alcance exacto de la sección crítica/snapshots, contrato de ownership/release, mecanismo de recuperación y criterio para re-admisión.
- D3: perfil real del entorno y control verificable que impida relanzamientos durante quiescencia.

### Evidencia/trabajo técnico requerido después de esas decisiones
- pruebas deterministas de reemplazo entre validación y retirada, incluida la segunda retirada de Continuity;
- limpieza de owner fallida sin borrar un lock reemplazado;
- pruebas cross-process de primer bootstrap y admisión;
- prueba de no re-admisión mientras un actor previo pueda afectar el path;
- tests de rutas conforme a la política D0-C3 finalmente aprobada;
- medición de recursos agregados separada de la garantía del lock;
- CI ligada al SHA exacto y evidencia operacional D3 del entorno seleccionado.

Las pruebas no eligen una política del propietario; una decisión documental tampoco equivale a prueba ejecutada.

## 5. Orden de cierre sin duplicar auditorías

1. Mantener el censo de callers y auditorías ya documentados como cerrados; no repetirlos sin evidencia nueva.
2. Resolver explícitamente el paquete de decisiones D0/D1/D2 que bloquea el contrato.
3. Con las decisiones fijadas, convertir el contrato adversarial ya registrado en tests deterministas, solo tras autorización separada de implementación/tests.
4. Probar el mecanismo elegido, sin introducir estado persistente nuevo por conveniencia.
5. Tratar D3 y el presupuesto agregado como gates independientes; no declararlos resueltos por pruebas de lock.
6. Actualizar el estado solo con evidencia verificable vinculada al SHA exacto.

## 6. Estado canónico

- M0: `INCOMPLETO`.
- D0/D1/D2/D3: `OPEN`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows modificados en esta revisión: **no**.
- CI del SHA del handoff: **success**, pero no cubre los nuevos tests propuestos.
- Contrato adversarial de reemplazo/release: **especificado, no implementado ni ejecutado**.

Este documento registra análisis y límites; no aprueba políticas, no modifica runtime/tests/workflows y no cierra ningún gate.
