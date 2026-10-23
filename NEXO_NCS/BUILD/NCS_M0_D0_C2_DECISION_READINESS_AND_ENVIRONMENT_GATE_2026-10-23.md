# NCS M0 — D0-C2: preparación de decisión y gate de entorno

Fecha: 2026-10-23  
Estado: **ACLARACIÓN DE DEPENDENCIAS — SIN DECISIÓN DEL PROPIETARIO — SIN IMPLEMENTACIÓN**

## 1. Conclusión de la revisión cruzada

El análisis comparativo de bootstrap presenta cuatro opciones, pero todavía no hay una base factual para seleccionar una. El documento de perfil de entorno registra que el runtime objetivo C y el host/operador de migración D no están determinados. El prototipo M1 en POCO X7 Pro no queda designado como runtime de Continuity/Chronicle por inferencia.

Por tanto:
- La opción A (bootstrap offline) es la menos invasiva **solo si** existe un entorno identificable y se puede imponer/evidenciar la quiescencia y la prevención de relanzamientos.
- La opción B (staging/publicación) no puede validarse hasta conocer el filesystem, la semántica de publicación y cómo todos los lectores evitan el staging.
- La opción C (marcador) no soluciona por sí sola la exclusión y no debe agregarse sin demostrar necesidad.
- La opción D (coordinación externa) añade un artefacto y un contrato de identidad/recuperación; no debe convertirse en default.
- Sin el ámbito C, no se puede afirmar que ninguna opción cumpla el contrato operativo real. D0-C2/D2 siguen OPEN.

Esto no significa que el desarrollo documental deba detenerse: los estados y gates se pueden especificar; lo que no puede hacerse es declarar elegida/probada una solución operacional concreta.

## 2. Gate de información mínimo

La siguiente información requerida es una sola decisión factual inicial, no una encuesta de arquitectura:

**¿Ya existe un entorno elegido para la primera instancia Nexo que leerá o escribirá Continuity/Chronicle?**

- **No existe todavía:** registrar RUNTIME_TARGET = NOT_SELECTED; mantener D3 OPEN; continuar con diseño portable y no seleccionar mecanismo de quiescencia/cutover.
- **Sí existe:** identificar solo tipo de entorno y modo de inicio (por ejemplo, proceso manual, servicio, app, tarea, supervisor). No compartir claves, tokens, datos privados ni contenido de stores. Después se determina qué mecanismo puede detener todos los writers y evitar relanzamientos.

Esta pregunta no elige por sí misma D0-C2 ni autoriza implementación. Solo habilita evaluar si A es viable o si hace falta analizar B con garantías reales del filesystem.

## 3. Criterios de ROOT_READY a definir antes de implementación

Una raíz no debe declararse lista solo porque el directorio exista. El contrato deberá exigir, bajo las políticas D0-C1/C2/C3 aprobadas:

1. Configuración de raíz explícita y validada según D0-C1.
2. Tipo/canonicalización/alias resueltos según D0-C3; sin asumir universalmente aceptar o rechazar symlinks.
3. Estado de bootstrap conocido; no se interpreta una raíz parcial como instalación nueva.
4. Stores existentes o inicializados únicamente mediante el flujo explícito autorizado; integridad y límites validados antes de admitir operaciones.
5. Admisión y ownership del lock satisfechos conforme a D2; la existencia del directorio lock por sí sola no es suficiente.
6. No hay writers/launchers desconocidos cuando el procedimiento requiere quiescencia; la evidencia debe corresponder al runtime real.
7. Ninguna de estas condiciones se interpreta como raíz criptográficamente legítima, autorización constitucional ni permiso de efectos protegidos.

Si cualquier punto no puede demostrarse, estado UNKNOWN/BLOCKED; no reparar, migrar ni crear silenciosamente.

## 4. Contrato de recuperación parcial

Hasta que se diseñe y pruebe un procedimiento explícito:
- Una raíz creada con stores ausentes, owner record incompleto, lock dudoso o estado de escritura ambiguo se clasifica BOOTSTRAP_PARTIAL o UNKNOWN, no ROOT_READY.
- La operación normal no crea, completa, borra ni corrige la instancia.
- No se limpia recursivamente una ruta solo porque el proceso actual esperaba haberla creado.
- La recuperación requiere evidencia de quiescencia si aplica, identificación inequívoca de la instancia y una decisión explícita del operador/propietario.
- Si no puede demostrarse la propiedad del objeto a retirar o la integridad de los datos, conservar el estado y bloquear.

Este documento no define todavía el comando ni el formato de recuperación; no se agregan marcadores, locks externos ni IDs.

## 5. Siguiente secuencia sin repetir investigación

1. Resolver el hecho mínimo: si el runtime C existe o sigue sin seleccionarse.
2. Si no existe, documentar RUNTIME_TARGET = NOT_SELECTED y seguir con consistencia portable de contratos; D3 no puede cerrarse.
3. Si existe, completar perfil E1-E6 con el mínimo necesario para evaluar quiescencia y filesystem.
4. Contrastar la alternativa elegible con D0-C1 (interfaz), D0-C3 (aliases/objetos reservados), D2 (admisión/lock/release) y D3 (writers/cutover).
5. Presentar al propietario una decisión D0-C2 concreta con consecuencias y evidencia exigida.
6. Solo tras la decisión y una autorización separada, implementar tests deterministas/cross-process y ejecutar CI contra el SHA exacto.

No repetir el censo de callers, las auditorías cerradas ni las pruebas históricas sin cambio verificable del snapshot.

## 6. Estado canónico

- M0: INCOMPLETO
- D0/D1/D2/D3: OPEN
- Runtime C / host D: NOT DETERMINED
- D0-C2: OPEN — owner decision pending
- Autorización de implementación: NOT_EVALUATED
- Raíz legítima: PENDING/UNKNOWN
- Efectos protegidos: STOP
- Runtime/tests/workflows: sin cambios; tests/CI no ejecutados.
