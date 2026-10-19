# NCS M0 — nota de diseño: recuperación segura de locks locales

Fecha: 2026-10-19  
Estado: DISEÑO ABIERTO; no autoriza implementación ni efectos protegidos.

## 1. Problema observado

Los stores locales de Continuity y Chronicle usan un directorio fijo `<filePath>.lock`. La adquisición hace `mkdir(lockPath)` y después escribe `owner.json`. Si `mkdir` funciona y la escritura del owner falla, el lock puede quedar sin un owner legible. Un escritor posterior puede esperar y, tras el umbral de antigüedad, exigir recuperación manual.

Esto es una condición de recuperación incompleta, no evidencia de corrupción del snapshot ni autorización para borrar el lock.

## 2. Por qué se retiró el arreglo inicial

Se intentó eliminar el directorio por ruta en el catch cuando fallaba owner.json. La revisión identificó una carrera TOCTOU: la ruta puede desaparecer y ser recreada por otro proceso entre la creación inicial y la limpieza. El `rm(lockPath)` puede entonces borrar un lock nuevo que no pertenece a esta adquisición.

Agregar `stat(lockPath)` antes de `rm(lockPath)` no soluciona la carrera: el reemplazo todavía puede ocurrir entre ambas operaciones. La comprobación de token seguida de eliminación por ruta también requiere analizarse dentro de cualquier nuevo protocolo; no debe suponerse que la identidad se mantiene solo porque la ruta coincide.

PR #106 se cerró sin merge y no dejó código de producción integrado: https://github.com/snowdenxrp/aldea-ia/pull/106.

## 3. Invariantes que debe satisfacer cualquier diseño nuevo

1. **No borrar locks ajenos:** una operación solo puede liberar el lock cuya propiedad puede demostrar; la igualdad del pathname no es prueba suficiente.
2. **Fallos fail-closed:** owner ausente, ilegible o estado ambiguo nunca permite entrar a la sección crítica.
3. **Concurrencia entre procesos:** dos escritores concurrentes no pueden obtener la exclusión mutua a la vez, ni siquiera durante adquisición, liberación o recuperación.
4. **Crash cuts:** probar cortes tras creación, durante escritura del owner, tras owner completo, durante operación crítica, durante liberación y durante recuperación.
5. **Sin recuperación por tiempo solamente:** la edad de un lock no basta para demostrar que se puede borrar sin afectar a un propietario nuevo.
6. **Errores preservados:** un fallo al establecer el lock debe propagarse sin ocultarse detrás de un resultado de commit.
7. **Mismos criterios para ambos stores:** Continuity y Chronicle pueden compartir una abstracción solo si las invariantes y la evidencia de ambas implementaciones se mantienen; no duplicar parches divergentes.
8. **Alcance explícito:** el store local documenta que no ofrece protección contra procesos no confiables que mutan las rutas ni garantías de fsync/power-loss; no presentar un lock local como autoridad Nexo ni como protección distribuida.

## 4. Opciones y estado

- **A. Mantener fail-closed y recuperación manual explícita.** Es el comportamiento actual cuando se detecta un lock stale. Seguro frente a una reclamación automática, aunque puede requerir intervención tras un fallo durante la adquisición. Aceptable como línea base mientras no haya protocolo probado.
- **B. Rediseñar la publicación/propiedad del lock.** Investigar un protocolo donde el objeto de lock pueda prepararse con identidad propia y publicarse atómicamente, o usar un mecanismo de exclusión nativo que permita demostrar la propiedad. No asumir que un directorio temporal más `rename`, un token o un `stat` seguido de `rm` resuelven el problema sin demostrar la semántica exacta del sistema de archivos y la plataforma.
- **C. Reclamación automática de lock por antigüedad/PID.** Rechazada como solución aislada: no demuestra que el pathname no haya sido reemplazado y no evita la carrera check-then-remove.

No se elige B hasta definir el contrato de plataforma, operaciones atómicas disponibles, semántica de error y pruebas de concurrencia. Si no se puede demostrar una solución segura para el entorno soportado, mantener A.

## 5. Evidencia mínima antes de implementar

- Matriz de cortes de fallo para ambos stores.
- Pruebas multiproceso que fuerzan intercalaciones de adquisición/liberación/recovery.
- Inyección de errores en creación y escritura del owner, incluyendo error antes/después de cambios visibles.
- Evidencia de que el propietario A nunca puede borrar el lock publicado por B.
- CI real para las pruebas nuevas y los regresivos existentes.
- Revisión del diff y de los límites declarados del store; sin afirmar durabilidad o resistencia a procesos hostiles que no se implementa.

## 6. Estado de misión

No hay fix integrado ni CI nuevo que certifique esta condición. M0 sigue INCOMPLETO. Los efectos protegidos permanecen STOP. Nexo y Lúmina siguen separados.
