# NCS M0 — contrato de aceptación para entorno restringido de primera publicación

**Fecha:** 2026-10-29  
**Estado:** PROPUESTA DOCUMENTAL — NO RATIFICADA COMO PROCEDIMIENTO — NO IMPLEMENTADA — NO EJECUTADA  
**Alcance:** FB-03 / FB-04, P01-C/D/E/F y evidencia E2/E3  
**Fuentes que reutiliza:** decisión del propietario sobre entorno restringido (2026-10-27), modelo de exclusión/bootstrap (2026-10-27), brecha E2/E3 POCO (2026-10-29), protocolo D3 de quiescencia (2026-10-23) y ruta mínima de cierre M0.

## 1. Decisión de alcance que se aplica

El propietario ya autorizó como decisión normativa permitir que la primera publicación de Continuity opere bajo un **entorno operativo restringido**, con precondiciones explícitas y verificables. No se requiere convertir esa decisión en una promesa de exclusión frente a cualquier proceso local no cooperativo.

El entorno restringido no está definido ni demostrado. Este documento propone los criterios que tendría que satisfacer; no afirma que el POCO, Termux, Node.js ni ningún otro entorno actual los satisfaga.

La garantía admisible debe expresarse con límites: **ningún proceso fuera del conjunto autorizado puede escribir o sustituir el objeto Continuity durante la ventana de primera publicación, porque el entorno impide ese acceso o impide su lanzamiento; los procesos dentro del conjunto autorizado están identificados y sujetos al contrato de publicación.** No equivale a resistencia frente a un administrador/root hostil ni a una garantía universal del sistema operativo.

## 2. Separación de los dos problemas

FB-03 y FB-04 son condiciones independientes y ambas son necesarias:

- **FB-03 — aislamiento ambiental (E2/E3):** identificar el entorno, los launchers y escritores relevantes; demostrar que los procesos no autorizados no pueden iniciar o acceder al destino durante toda la ventana.
- **FB-04 — publicación exclusiva y estado (TOCTOU):** demostrar que la operación no reemplaza un destino preexistente o concurrente y que la publicación no depende únicamente de una comprobación previa susceptible a carrera.

Un lock cooperativo puede coordinar participantes que lo respetan, pero no demuestra por sí solo ninguna de las dos garantías frente a procesos fuera del protocolo. Una inspección de procesos vacía tampoco demuestra que no pueda ocurrir un relanzamiento posterior.

## 3. Precondiciones mínimas del entorno restringido

Antes de considerar cualquier primera publicación, la evidencia debe identificar y satisfacer todas estas condiciones:

1. **Identidad del entorno:** plataforma, usuario/identidad de ejecución, aplicación o runtime, directorio raíz efectivo, filesystem y mecanismo real de lanzamiento. Los valores deben proceder del entorno observado, no de supuestos del repositorio.
2. **Objeto exacto:** raíz explícita validada y ruta relativa que produce el destino efectivo. Registrar la ruta resuelta y demostrar que no escapa de la raíz admitida. No aceptar fallback implícito.
3. **Conjunto de escritores autorizados:** enumerar los procesos y entrypoints que pueden escribir el objeto durante la ventana. La lista debe corresponder a la instalación real, no a todos los archivos del repositorio.
4. **Exclusión de los demás:** demostrar mediante controles del entorno que ningún proceso fuera del conjunto autorizado puede escribir el destino ni sustituirlo, y que no puede iniciar un writer durante la ventana. Si el sistema no permite demostrarlo, STOP.
5. **Control sostenido:** identificar quién o qué mantiene el control durante toda la ventana y cómo se detecta su pérdida. Una captura puntual de procesos, cerrar una app o terminar una terminal no basta si existe una vía de relanzamiento.
6. **Integridad del espacio de destino:** demostrar que el directorio padre y sus componentes relevantes no pueden ser sustituidos por un actor fuera del conjunto autorizado durante la operación. La resolución de rutas y el control de symlinks deben pertenecer a la garantía demostrada, no a una inferencia por nombre de ruta.
7. **Observabilidad:** conservar evidencia fechada de las comprobaciones, errores, cobertura y resultado. Si una comprobación no puede observarse o repetirse con cobertura suficiente, la condición es UNKNOWN.

La evidencia E2 debe cubrir el control de detención y prevención de relanzamientos. La evidencia E3 debe vincular los entrypoints del repositorio con el modo real de lanzamiento y los escritores de esa instalación. No se puede completar E2/E3 solo mediante análisis estático.

## 4. Criterios mínimos de publicación (FB-04)

La implementación candidata actual hace comprobaciones de preflight y usa coordinación cooperativa en el store. Eso no demuestra publicación exclusiva frente a una carrera posterior al preflight.

El contrato de publicación que se someta a aceptación debe demostrar, sobre el destino efectivo:

- **No reemplazo:** si el destino existe antes o aparece concurrentemente, la operación no lo sustituye ni trunca sus bytes.
- **Exclusión en el punto de publicación:** la propiedad de no reemplazo debe mantenerse en la operación efectiva de publicación, no depender solo de `access()` u otra inspección previa.
- **Estado previo conservador:** destino válido, corrupto, inaccesible, temporal preexistente o estado no clasificable no se reinterpretan como ausencia.
- **Temporales conservadores:** temporales preexistentes o de propietario/estado desconocido producen STOP; no se limpian automáticamente como parte de bootstrap M0.
- **Resultado ambiguo:** si puede haber ocurrido una mutación pero no se puede confirmar el resultado, clasificar UNKNOWN y detener la ruta afectada. No retry automático, no rollback especulativo y no efectos protegidos.
- **Vínculo de destino:** la operación debe demostrar que el objeto publicado es exactamente el destino derivado de la raíz explícita admitida.
- **Evidencia ligada al código:** pruebas negativas y CI deben ejecutarse sobre el mismo SHA que contiene el contrato y la implementación evaluados.

Este apartado expresa propiedades exigibles; no elige API del sistema operativo, primitiva de filesystem, estrategia de lock, transacción ni garantía de durabilidad ante pérdida de energía. Esas decisiones requieren inspección del filesystem/entorno real y revisión técnica posterior.

## 5. Matriz de evidencia y clasificación

| Condición | Evidencia necesaria | Si falta o es ambigua |
|---|---|---|
| Entorno y launcher identificados | Identidad del entorno y cadena de lanzamiento observadas | E3 UNKNOWN |
| Writers relevantes identificados | Inventario ligado a la instalación y al destino | E3 UNKNOWN |
| Relanzamiento bloqueado durante la ventana | Control activo y evidencia observable de que sigue vigente | E2 UNKNOWN |
| Acceso de writers externos excluido | Control de permisos/aislamiento efectivo sobre el destino y sus padres | FB-03 STOP |
| Destino no reemplazable | Prueba de conflicto/preexistencia/concurrencia ligada al SHA | FB-04 UNKNOWN |
| Estado previo clasificado conservadoramente | Pruebas de ausente, válido, corrupto, inaccesible, temporal y conflicto | FB-04 UNKNOWN |
| Resultado ambiguo fail-closed | Prueba de corte/error en cada frontera de mutación pertinente | FB-04 UNKNOWN |
| Evidencia reproducible | SHA, ejecución, logs y resultado íntegro | FB-06/FB-07 OPEN |

No se permite compensar una fila UNKNOWN con evidencia de otra fila. En particular, CI no demuestra E2/E3, y una lista de procesos no demuestra no-reemplazo.

## 6. Secuencia de evaluación — no es una receta de ejecución

1. Identificar y documentar el entorno previsto. El destino previsto conocido sigue siendo POCO X7 Pro / Android; el mecanismo de lanzamiento real continúa sin demostrar.
2. Relacionar el entorno con los entrypoints ya inventariados, sin repetir el censo de código.
3. Determinar qué control ambiental puede impedir acceso y relanzamiento de escritores fuera del conjunto autorizado. Si no existe o no es observable, no avanzar.
4. Revisar el contrato de publicación contra el filesystem y el destino efectivos; no aceptar un preflight como sustituto de exclusión en el punto de publicación.
5. Solo tras fijar el contrato, preparar pruebas negativas y CI vinculados al SHA exacto, con autorización específica.
6. Mantener primera publicación STOP hasta que autoridad de raíz, entorno, exclusión y publicación estén resueltos por separado.

No ejecutar comandos del POCO, instalar/configurar software, crear Continuity real ni activar efectos protegidos como parte de esta propuesta.

## 7. Decisiones que este documento no toma

- No selecciona Termux + Node.js ni confirma que estén instalados/disponibles.
- No selecciona P01-B ni una opción A/B/C/D.
- No define una garantía frente a administrador/root hostil.
- No legitima la raíz ni establece ROOT_READY.
- No ratifica P-05 ni política de recuperación/readmisión.
- No aprueba D3 para migración/cutover legacy; D3 se reutiliza solo como referencia de disciplina de evidencia, sin extender su alcance automáticamente.
- No autoriza runtime, tests, CI/Actions, instalación, bootstrap real ni publicación.

## 8. Resultado y próximo punto de decisión

La decisión de entorno restringido del propietario permite acotar la garantía. **El contrato de aceptación propuesto queda definido a nivel de propiedades, pero no está ratificado ni demostrado en una instalación.** El siguiente dato que desbloquea trabajo técnico es la identidad del mecanismo real que ejecutaría el bootstrap y el control verificable que puede impedir writers externos y relanzamientos en el POCO.

Hasta obtener esa evidencia: E2/E3 UNKNOWN; E4 NOT READY; FB-03/FB-04 OPEN/UNKNOWN; raíz legítima PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; primera publicación y efectos protegidos STOP; M0 INCOMPLETO.
