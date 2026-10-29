# NCS M0 — Matriz negativa de aceptación FB-04 (2026-10-29)

**Estado:** ESPECIFICACIÓN DE PRUEBAS — NO IMPLEMENTADA — NO EJECUTADA — NO AUTORIZA CAMBIOS DE RUNTIME.

## 1. Objetivo y límite

Esta matriz desglosa A-05 de la matriz FB-06/FB-07 en casos falsables para la primera publicación de Continuity. No selecciona una primitiva ni presupone que `link()`, `rename()` u otra operación tenga semántica adecuada en el filesystem objetivo.

Separar siempre:
- **Primera publicación:** transición de destino ausente a destino completo, con create-if-absent/no-replace.
- **Commit posterior:** actualización de un destino existente bajo su contrato propio de revisión/exclusión. No heredar automáticamente la semántica de bootstrap.

Cada caso debe registrar SHA de código+test, entorno/filesystem, precondición, operación concurrente o fallo inducido, resultado, hash/bytes del objeto previo y estado final.

## 2. Casos obligatorios para primera publicación

| ID | Escenario | Inyección / precondición | Resultado exigido | Falla si… |
|---|---|---|---|---|
| F04-N01 | Destino ya existe y es válido | Crear objeto con bytes centinela antes del bootstrap | CONFLICT/STOP; bytes/hash idénticos; cero escritura sobre destino | Se trunca, reemplaza, migra o modifica |
| F04-N02 | Destino ya existe y está corrupto | Crear archivo no interpretable antes del bootstrap | STOP/UNKNOWN; bytes idénticos | Se interpreta como ausencia o se reemplaza |
| F04-N03 | Destino aparece tras preflight | Pausar el bootstrap después de inspección y crear el destino desde un segundo proceso | Publicación falla sin reemplazar; bytes del competidor intactos | El bootstrap gana mediante rename/reemplazo |
| F04-N04 | Temporal canónico preexistente | Crear `.tmp` antes de iniciar | STOP/UNKNOWN; temporal intacto | Cleanup lo elimina o reutiliza sin identidad probada |
| F04-N05 | Temporal con sufijo desconocido | Crear `.tmp-*` de propietario desconocido | STOP/UNKNOWN; contenido intacto | Limpieza genérica lo borra |
| F04-N06 | Temporal concurrente posterior al preflight | Segundo proceso crea temporal después del preflight | No se borra ni adopta el temporal; operación se detiene o usa un protocolo de propiedad demostrado | Se limpia/reescribe el temporal ajeno |
| F04-N07 | Padre sustituido / symlink | Sustituir componente de ruta entre validación y uso, dentro de harness controlado | Rechazo o confinamiento demostrado al directorio autorizado; sin escritura fuera | Se sigue el nuevo destino o se escribe fuera de root |
| F04-N08 | Raíz o destino no corresponde al vínculo autorizado | Alterar root/destino o provocar discrepancia entre ruta calculada y objeto abierto | STOP; no mutación | La operación publica en un objeto distinto |
| F04-N09 | Primitiva no soportada / permiso denegado | Simular o ejecutar en filesystem sin soporte/permisos requeridos | Error explícito/UNKNOWN; sin fallback silencioso a reemplazo | Fallback a rename/copy inseguro |
| F04-N10 | Error antes del punto de publicación | Inyectar fallo al crear/escribir/verificar temporal | No aparece destino canónico; estado temporal conservador y observable | Destino parcial o cleanup de estado ajeno |
| F04-N11 | Error inmediatamente después del punto de publicación | Inyectar fallo después de publicar, antes de confirmar respuesta | COMMIT.UNKNOWN/STOP si no se puede determinar resultado; inspección no debe reescribir | Retry automático o segundo write puede reemplazar |
| F04-N12 | Dos bootstrap simultáneos | Ejecutar dos participantes autorizados contra mismo destino ausente | Exactamente uno publica; el otro recibe conflicto; objeto final íntegro | Ambos reportan creación o el perdedor altera el objeto |
| F04-N13 | Writer no cooperativo | Segundo proceso no usa el lock del store y compite por destino | El contrato ambiental debe impedirlo o la primitiva no-replace debe preservar el objeto; evidencia de ambas capas separada | Se asume que lock cooperativo basta |

## 3. Casos separados para commit posterior

| ID | Escenario | Resultado exigido | Falla si… |
|---|---|---|---|
| F04-C01 | Revisión esperada no coincide | CONFLICT; bytes y revisión actuales intactos | Se reemplaza el estado |
| F04-C02 | Dos commits compiten | Solo el commit válido conforme al contrato de revisión puede prevalecer; el otro recibe conflicto/UNKNOWN | Se pierde actualización o se informa éxito falso |
| F04-C03 | Error después de reemplazo pero antes de confirmar | UNKNOWN/STOP; no retry automático ni efectos protegidos | Se asume rollback o se repite commit |
| F04-C04 | Temporal de commit preexistente/desconocido | STOP/UNKNOWN; no borrar temporal sin identidad/propiedad demostrada | Cleanup destruye estado no atribuible |
| F04-C05 | Pérdida de proceso/energía en frontera de commit | Resultado clasificado según garantías de durabilidad realmente contratadas; no afirmar fsync/durabilidad sin prueba | Se promete recuperación no soportada |

## 4. Reglas de diseño de pruebas

1. Las pruebas de carrera deben usar barreras/hook deterministas o un harness equivalente; no depender solo de sleeps o de que la carrera ocurra por azar.
2. Para N01–N08 y N13, verificar contenido/hash del objeto competidor y ausencia de escritura fuera del root; comprobar solo el código de retorno no basta.
3. Cada caso debe verificar ausencia de owner, admisión, Chronicle, dispatch y efectos protegidos en el flujo de bootstrap, donde corresponda.
4. No convertir fallos de filesystem, permisos o soporte en fallback automático a un mecanismo menos seguro.
5. No borrar temporales desconocidos durante preparación ni limpieza del test; usar un directorio temporal aislado y conservar evidencia de lo que se inspeccionó.
6. Los tests de harness no sustituyen pruebas en el filesystem real. Las pruebas del entorno real requieren E2/E3 identificados y autorización independiente.
7. No agrupar primera publicación y commit posterior en una única expectativa de rename: sus condiciones de reemplazo son distintas.
8. Cada resultado debe ligarse al SHA exacto que contiene implementación y pruebas. Tests redactados pero no ejecutados = NOT RUN.

## 5. Secuencia de aceptación

- **Fase A — revisión estática:** demostrar que el código tiene dos contratos/rutas claramente diferenciados y que ninguna limpieza genérica borra temporales desconocidos.
- **Fase B — harness controlado:** ejecutar N01–N12 con fallos y concurrencia deterministas, solo tras autorización de tests.
- **Fase C — entorno objetivo:** identificar runtime/filesystem/launcher y demostrar E2/E3; repetir las propiedades relevantes en el filesystem real, con ventana y destino controlados, solo tras autorización específica.
- **Fase D — commits:** validar C01–C05 por separado; no declarar commits seguros porque bootstrap pase.
- **Fase E — reconciliación:** adjuntar runs, SHA, logs y limitaciones a FB-06/FB-07.

Un fallo o UNKNOWN en cualquier criterio crítico mantiene FB-04 OPEN/UNKNOWN y primera publicación STOP.

## 6. Estado actual

- FB-04 OPEN/UNKNOWN.
- FB-03 OPEN/UNKNOWN; runtime/launcher M1→NCS y entorno POCO no identificados.
- E2/E3 UNKNOWN; E4 NOT READY.
- Primera publicación Continuity STOP; efectos protegidos STOP.
- `authorization: NOT_EVALUATED`; **M0 INCOMPLETO**.

No se modificó runtime, tests ni workflows. No se ejecutó test, CI/Actions, comando POCO ni bootstrap real. No se seleccionó primitiva ni se autorizó publicación.
