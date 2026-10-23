# NCS M0 — perfil de entorno necesario para concretar D3

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **LISTA DE ENTRADAS NECESARIAS — SIN ENTORNO ASUMIDO — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Por qué hace falta este perfil

El protocolo de quiescencia describe condiciones de seguridad operacional, pero no elige un mecanismo de mantenimiento concreto. Ese mecanismo depende de dónde se ejecuta Nexo, cómo se inician sus procesos, quién controla esos lanzadores y qué garantías de inspección ofrece el entorno. Elegir systemd, un servicio Android, un contenedor, un supervisor o un proceso manual sin conocer la instalación sería inventar una condición operativa.

Este documento enumera las entradas mínimas para especificar el procedimiento por entorno. No exige publicar secretos, credenciales ni datos personales.

## 2. Perfil mínimo por instalación

### E1. Tipo de entorno de ejecución
- Sistema operativo y versión, o entorno gestionado equivalente.
- Forma de despliegue: proceso manual, servicio, tarea programada, contenedor, app móvil u otra.
- Si la migración afectará un entorno real, de prueba o solo una copia de desarrollo.

**Regla:** si no se identifica el entorno exacto, no seleccionar un mecanismo específico.

### E2. Autoridad operacional
- Qué operador/proceso tiene permiso para detener todos los writers y los launchers.
- Qué mecanismo puede impedir que vuelvan a iniciarse durante la ventana.
- Si el mecanismo puede ser inspeccionado y su resultado registrado.

**Regla:** “puedo cerrar una terminal” no demuestra que no existan otras sesiones, servicios o relanzadores.

### E3. Inventario de lanzamiento
- Comandos y entrypoints que pueden abrir/escribir Continuity o Chronicle.
- Wrappers, procesos padre/hijo, supervisores, tareas programadas y sesiones persistentes conocidos.
- Si el proceso Chronicle puede lanzarse directamente y fuera del padre principal.
- Qué consumidores externos o downstream pueden invocar esas rutas legacy.

**Regla:** una ruta desconocida o un launcher no clasificable obliga a `UNKNOWN/BLOCKED`.

### E4. Alcance físico de los datos
- Rutas resueltas de las fuentes y destino de preparación.
- Volúmenes, enlaces simbólicos/aliases, montajes o capas de almacenamiento relevantes.
- Si otros procesos/usuarios pueden escribir a esas rutas.
- Método de hash/lectura y cómo detectar error, truncamiento o cambio durante la lectura.

**Regla:** canonicalizar el directorio raíz no prueba que todos los archivos internos queden dentro de él ni que no haya otro escritor.

### E5. Ventana de mantenimiento y recuperación
- Cómo se declara y mantiene la ventana.
- Cómo se demuestra que los launchers están detenidos o bloqueados.
- Cómo se detecta una terminación incompleta, permisos insuficientes o visibilidad parcial.
- Quién puede cancelar y qué significa cancelación sin mutar la fuente.
- Cómo se preservan ambos lados y se impide rollback automático después de que el destino nuevo reciba escrituras.

**Regla:** no hay cutover si la ventana no puede mantenerse durante toda la copia y la validación final.

### E6. Evidencia y trazabilidad
- Dónde quedan logs/artefactos de inventario, detención, inspección y huellas.
- Cómo se vinculan a la instalación, las rutas exactas, la ventana y el SHA/versión ejecutada.
- Qué errores deben registrarse como fallos y cuáles dejan el resultado desconocido.
- Cómo se verifica independientemente el resultado sin depender solo del mensaje “éxito” del proceso de migración.

**Regla:** el expediente debe poder demostrar qué se comprobó y qué quedó fuera de cobertura.

## 3. Tabla de decisión

| Condición observada | Decisión requerida |
|---|---|
| Entorno y despliegue identificados; launchers inventariados; existe control verificable para impedir nuevos lanzamientos | Se puede diseñar un procedimiento específico; no significa que esté aprobado ni probado |
| Entorno conocido, pero un launcher/supervisor o consumidor externo es desconocido | `UNKNOWN/BLOCKED` |
| Solo se dispone de una captura de procesos o de ausencia de lock | `UNKNOWN/BLOCKED` |
| Se puede parar un proceso, pero no evitar relanzamiento ni inspeccionar otros writers | `UNKNOWN/BLOCKED` |
| La fuente cambia, no puede leerse, o la cobertura de inspección es parcial | Cancelar cutover; preservar ambos lados; re-inventariar |
| El destino nuevo ya recibió escrituras y se solicita rollback | Bloquear copia inversa/merge automático; exigir reconciliación explícita |
| Todo el procedimiento se ejecuta correctamente | Registrar evidencia; el cutover aún requiere aprobación explícita separada |

## 4. Qué no se necesita compartir

No incluir contraseñas, tokens, claves privadas, identificadores de cuenta, contenido privado de Continuity/Chronicle ni datos de terceros. Para diseñar el procedimiento suele bastar una descripción del sistema, forma de ejecución, control operacional disponible y rutas ficticias representativas hasta que se requiera el inventario real.

## 5. Criterio para avanzar sin bloquear el trabajo documental

Mientras el perfil no esté disponible, sí puede continuarse la revisión de consistencia de contratos, la definición de estados `UNKNOWN/BLOCKED`, los criterios de abort y el plan de evidencia. No debe escogerse ni declararse implementado un mecanismo operacional concreto, ni fingirse una prueba real de migración.

## 6. Estado

- Perfil del entorno real: **NO SUMINISTRADO / NO DETERMINADO EN ESTA REVISIÓN**.
- Procedimiento operacional ejecutable: **NO DEFINIDO**.
- D3: **OPEN**.
- D0/D1/D2: **OPEN**.
- M0: `INCOMPLETO`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows: sin cambios; tests/CI no ejecutados.

## 7. Continuidad

El siguiente chat debe usar este perfil para identificar la única información de entorno realmente necesaria, sin pedir al usuario que vuelva a describir la arquitectura Nexo completa. Una vez conocido el despliegue objetivo, comparar el mecanismo propuesto con los entrypoints legacy ya censados. No repetir el censo salvo cambio verificable de fuente. No implementar hasta que los contratos estén cerrados y exista autorización explícita.
