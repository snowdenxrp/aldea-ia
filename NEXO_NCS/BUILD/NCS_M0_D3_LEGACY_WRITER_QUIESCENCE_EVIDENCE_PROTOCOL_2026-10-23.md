# NCS M0 — propuesta de evidencia de quiescencia para writers legacy

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **PROPUESTA DE DISEÑO — NO APROBADA — NO IMPLEMENTADA — NO EJECUTADA**

## 1. Propósito y alcance

Concretar qué evidencia sería necesaria para afirmar que los writers legacy que usan rutas como `--continuity` o `--chronicle` no están modificando los datos fuente durante una migración D3.

Este documento no demuestra que la quiescencia exista en una instalación real. No asume sistema operativo, supervisor de procesos, empaquetado de despliegue ni inventario de instalaciones. No autoriza runtime/tests/workflows y no reemplaza la aprobación explícita de D3.

## 2. Regla de decisión

La migración solo puede pasar de preparación a cutover si se satisfacen **todas** estas condiciones:

1. Se conoce el conjunto de formas de lanzamiento de writers legacy para esa instalación.
2. Se detuvieron las sesiones y los mecanismos conocidos que pueden lanzar o relanzar esos writers.
3. Existe un mecanismo operacional que impide nuevos lanzamientos durante la ventana, o una garantía equivalente demostrable para esa instalación.
4. Se inspeccionó el estado de procesos activos con cobertura suficiente para el entorno, incluyendo procesos Chronicle directos y wrappers/supervisores conocidos.
5. Se comprobaron las fuentes y sus huellas antes y después de la copia, e inmediatamente antes del cutover.
6. No hay procesos, sesiones, launchers ni rutas de lanzamiento cuyo estado sea desconocido y que puedan escribir a esas fuentes.
7. La evidencia de cada comprobación queda registrada y vinculada a la misma instalación, conjunto de fuentes y ventana de mantenimiento.

Si cualquiera de las condiciones no puede probarse, el resultado es `UNKNOWN/BLOCKED`: conservar origen y destino, no cortar, no fusionar y no declarar la migración completada.

## 3. Qué cuenta como evidencia y qué no

### Evidencia potencialmente útil, según el entorno

- Inventario específico de la instalación de comandos, scripts, wrappers, sesiones, tareas programadas y supervisores capaces de iniciar los writers.
- Registro de detención de las sesiones conocidas y de los mecanismos de relanzamiento.
- Captura del inventario de procesos del sistema operativo con hora, identidad de proceso disponible, comando/línea de ejecución y relación padre-hijo cuando el sistema la exponga.
- Verificación repetida del inventario durante la ventana, combinada con un control que impida nuevos lanzamientos.
- Hash, tamaño, ruta resuelta y revisión disponible de cada fuente antes de copiar; verificación del destino después de copiar; nueva huella de fuente inmediatamente antes del cutover.
- Registro explícito del resultado de cada paso, errores, cobertura de inspección, inicio/fin de la ventana y decisión de continuar o abortar.

### No es evidencia suficiente por sí sola

- Ausencia del lock nuevo de instancia.
- Ausencia de un único PID, búsqueda de procesos vacía o una sola captura de procesos sin controlar relanzamientos.
- Que una copia tenga un hash correcto respecto de los bytes copiados si la fuente cambió después.
- Que el archivo de origen no cambió durante un intervalo corto si un launcher todavía puede iniciar un writer después.
- Un PID/mtime en `owner.json`, porque no prueba identidad criptográfica ni que no existan otros writers.
- El resultado de tests unitarios de locks o del test de arquitectura.
- La existencia de una opción `--root` nueva mientras siguen disponibles rutas legacy.

## 4. Secuencia operacional propuesta

1. **Identificar instalación y fuentes.** Enumerar las rutas reales de Continuity/Chronicle, sus aliases/symlinks relevantes y todos los lanzadores conocidos. Si el inventario no es completo, detenerse.
2. **Entrar en mantenimiento.** Detener sesiones y suspender los mecanismos conocidos de inicio/relanzamiento. Registrar quién/cuál mecanismo lo hizo y el resultado.
3. **Establecer prevención de nuevos lanzamientos.** Usar un control apropiado al entorno que pueda demostrarse. Si no existe forma de prevenir o detectar de forma fiable nuevos lanzamientos, no avanzar a cutover.
4. **Inspeccionar procesos activos.** Buscar todos los writers dentro del alcance definido, incluidos procesos Chronicle directos y procesos hijos. Si hay proceso ambiguo, acceso denegado, visibilidad parcial o identidad no resoluble, tratarlo como desconocido y bloquear.
5. **Registrar huellas iniciales.** Para cada fuente, registrar ruta resuelta, hash de bytes, tamaño y revisión disponible. El dry-run no debe crear stores ni modificar fuentes.
6. **Copiar a preparación y verificar.** No mutar ni borrar el origen. Verificar bytes/hash, revisión y contrato semántico del destino.
7. **Revalidar antes de cutover.** Repetir inspección operacional y comparar la huella de cada fuente con la inicial. Cualquier writer nuevo/ambiguo, cambio de fuente, fallo de lectura o evidencia incompleta cancela el cutover.
8. **Autorizar cutover explícitamente.** Registrar una decisión separada para la instalación y el inventario exactos. No inferirla de completar los pasos anteriores.
9. **Preservar y vigilar.** Mantener el origen intacto según el plan aprobado. Tras la primera escritura en el destino nuevo, no permitir rollback automático que copie hacia atrás o fusione historiales.

Esta secuencia es un esquema, no una receta portátil ya validada. El mecanismo concreto de bloqueo de lanzamientos debe especificarse para la instalación real.

## 5. Carrera residual y límite de la afirmación

Una inspección de procesos es una instantánea; no elimina por sí misma la carrera entre la inspección y el siguiente lanzamiento. Las huellas de archivos detectan algunos cambios en la fuente, pero no prueban por sí solas que no hubo escrituras seguidas de restauración de bytes, ni que no exista un proceso dormido que escriba después.

Por tanto, la afirmación válida debe ser limitada: **“quiescencia operacional demostrada para los launchers y writers enumerados, bajo el mecanismo de mantenimiento específico y durante la ventana registrada”**. No afirmar “ningún proceso local puede escribir” ni “la raíz está protegida contra procesos hostiles”.

Si la instalación no dispone de un control verificable para impedir nuevos lanzamientos o el inventario de writers es incompleto, la conclusión obligatoria es `UNKNOWN/BLOCKED`, aunque los hashes coincidan.

## 6. Registro mínimo de evidencia propuesto

Un expediente de migración debería conservar, como mínimo:

- Identificador legible de instalación y ventana; no inventar un ID global de runtime.
- Lista versionada de fuentes y launchers considerados, con rutas resueltas.
- Procedimiento y resultado de detener/suspender sesiones y relanzamientos.
- Evidencia de la cobertura y resultado de inspección de procesos, incluidos errores y limitaciones.
- Huellas iniciales, huellas del destino tras la copia y huellas finales de origen.
- Resultado semántico de la verificación de destino.
- Cualquier condición desconocida y la decisión de bloquear/abortar.
- Aprobación explícita de cutover, si se alcanza esa etapa.
- Preservación del origen y disposición de rollback, sin merge ni copia inversa automáticos.

Este registro documenta la operación; no es por sí mismo una raíz de autoridad constitucional ni concede permiso para ejecutar efectos protegidos.

## 7. Criterios de cierre D3 relacionados con quiescencia

D3 no puede declararse cerrado solo por añadir este documento. Requiere, al menos:

- Elegir y documentar el mecanismo concreto de mantenimiento/prevención de lanzamientos para el entorno de despliegue.
- Probar que el procedimiento detecta writers activos y bloquea ante visibilidad parcial, proceso ambiguo, cambio de huellas y error de lectura.
- Demostrar abort/cancelación sin mutación del origen cuando falle cualquier precondición.
- Verificar el cutover y rollback según el contrato aprobado, sin dual-write, merge heurístico ni copia automática hacia atrás.
- Adjuntar evidencia de la ejecución real al SHA y artefactos correspondientes; una especificación no equivale a prueba.

## 8. Estado canónico

- Esta propuesta: **PENDIENTE DE REVISIÓN**.
- D3: **OPEN**.
- D0/D1/D2: **OPEN**.
- M0: `INCOMPLETO`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows: sin cambios; no se ejecutaron tests/CI en este trabajo.

## 9. Continuidad

El siguiente análisis debe decidir si el alcance y la terminología de esta propuesta son coherentes con D3 y qué dato del entorno será necesario antes de poder convertirla en un procedimiento ejecutable. No inventar controles específicos de SO/supervisor sin conocer el entorno. No reabrir el censo de código salvo que cambie la fuente. No implementar hasta que los contratos y la autorización separada estén explícitos.
