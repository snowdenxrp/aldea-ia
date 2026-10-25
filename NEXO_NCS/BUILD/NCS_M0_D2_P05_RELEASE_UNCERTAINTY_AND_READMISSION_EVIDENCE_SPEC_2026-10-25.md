# NCS M0 — D2: P-05, release incierto y evidencia para readmisión

Fecha: 2026-10-25  
Rama: `ncs-clean-architecture`  
Estado: **ESPECIFICACIÓN DE REQUISITOS PROPUESTA — NO RATIFICADA — SIN IMPLEMENTACIÓN**

## 1. Propósito

Precisar qué debe quedar demostrado antes de volver a admitir una operación después de un resultado de liberación incierto. Este documento define preguntas contractuales, estados que no deben confundirse y evidencia de aceptación; **no elige un mecanismo de recuperación**, no declara que exista un incidente real y no autoriza cambios de runtime/tests/workflows.

Fuentes documentales de base:
- [Matriz candidata de estados/transiciones D2](NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md), blob `bfa38a057033acf880afe331a47bb383e82e9a97`.
- [Cuarentena tras release incierto](NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md), blob `2bdfb593c04bd52ecdeb052934525eba006f6c16`.
- [Especificación P-03/P-04 de admisión y ownership](NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md), blob observado `baa28e3b868aa0262b9aa9edd837d06938aacd4d`.
- Fuente de Continuity caracterizada: `src/nexo/core/continuity-store.mjs`, blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
- Fuente de Chronicle caracterizada: `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.

La caracterización anterior es lectura estática de fuentes identificadas; no es ejecución ni demuestra una carrera ocurrida.

## 2. Tres dimensiones independientes

Todo resultado posterior a una operación debe conservar separadas estas dimensiones:

1. **Resultado de negocio/persistencia:** confirmado, fallo demostrado antes de cualquier escritura, o `UNKNOWN` si pudo haber escritura y no puede demostrarse el estado final.
2. **Resultado de release:** confirmado para la misma instancia del lock, fallo observado, o incierto.
3. **Readmisión:** permitida solo si el criterio de seguridad elegido y aprobado aporta evidencia suficiente; de otro modo `BLOCKED/UNKNOWN`.

No se permite inferir que un fallo de release significa que la operación de negocio falló. Tampoco que un path de lock ausente, por sí solo, prueba que ningún proceso anterior sigue ejecutando una liberación/limpieza. No se reejecuta automáticamente la operación de negocio para “arreglar” la incertidumbre del lock.

## 3. Obligación contractual propuesta

Después de `LOCK_RELEASE_UNCERTAIN` o de una limpieza de bootstrap/owner igualmente ambigua:

- no iniciar otra operación de negocio en esa instancia mientras el estado de la admisión sea incierto;
- no borrar ni modificar un lock solo porque su edad sea alta, el PID parezca muerto, el owner no pueda leerse o una ruta haya desaparecido/reaparecido;
- no tratar una variable local del proceso como coordinación entre procesos;
- no introducir por iniciativa propia un marcador persistente, lock hermano, tombstone, cola, ID, retry, transacción o servicio de recuperación;
- preservar el resultado de persistencia observado y exponer la incertidumbre de release por separado;
- si la evidencia requerida no está disponible, permanecer `UNKNOWN/BLOCKED`. Esto no significa congelación permanente ni define recuperación automática.

## 4. Decisión aún reservada al propietario

El diseño debe escoger explícitamente una política antes de implementar o cerrar D2. Las alternativas que se pueden evaluar —no seleccionadas aquí— son:

**A. Recuperación externa con quiescencia demostrable.** La readmisión depende de un procedimiento operacional que pruebe que todos los escritores, supervisores y procesos de release/limpieza están detenidos y no pueden reanudarse durante la intervención. Si esa quiescencia no puede probarse, no se recupera por esta vía.

**B. Mecanismo de filesystem ligado a la identidad del objeto.** La operación de release/recovery debe demostrar que actúa sobre la misma instancia del lock que validó, bajo un modelo de filesystem y procesos cooperantes explícitamente acotado. Una secuencia de “leer token → comparar → borrar la ruta” no basta por sí sola para cerrar una ventana check/use.

El propietario también puede mantener `UNKNOWN/BLOCKED` hasta que exista evidencia suficiente. No se selecciona A ni B por inferencia. Ninguna alternativa implica resistencia a procesos locales hostiles, ni resuelve automáticamente alias/mounts, durabilidad frente a pérdida de energía o autoridad constitucional.

## 5. Evidencia mínima que el protocolo aprobado deberá producir

La futura aceptación debe enlazar cada caso a test, ejecución y SHA exactos. Casos mínimos propuestos:

| Caso | Intercalación/condición | Resultado exigido |
|---|---|---|
| E1 | Persistencia confirmada, release incierto | Se conserva “persistencia confirmada”; readmisión bloqueada; no redispatch/retry de negocio. |
| E2 | Persistencia desconocida, release incierto | Se conserva `UNKNOWN`; no se afirma rollback ni éxito; no retry de negocio. |
| E3 | Falla el primer intento de retirar lock y otro actor reemplaza el path antes de cualquier segundo intento | El objeto de reemplazo no se elimina ni modifica; si no puede demostrarse, el protocolo no puede afirmar release confirmado. |
| E4 | Falla escritura/validación de owner y la ruta cambia durante limpieza | La limpieza no afecta un objeto sustituto; si no puede probarse identidad, `UNKNOWN/BLOCKED`. |
| E5 | Owner ilegible, permisos inciertos, tipo inesperado o inspección filesystem no concluyente | No se trata como lock ausente ni como stale recuperable automáticamente. |
| E6 | Path ausente, pero no está demostrado que el actor previo terminó | No se concede readmisión por la sola ausencia del path. |
| E7 | Competidor intenta admisión durante release o recuperación | No entra mientras siga ambigua la identidad/actividad previa. |
| E8 | Recuperación aprobada completada | La readmisión solo ocurre tras cumplir los predicados específicos de la política elegida; se conserva evidencia de la verificación. |
| E9 | Fallo antes de cualquier escritura demostrado, con release incierto | Resultado de negocio se mantiene separado del release; no se convierte el estado de lock en autorización para repetir automáticamente. |

Estos son requisitos de diseño, no pruebas escritas o ejecutadas. E3/E4 deben modelar reemplazo de path y no solo mocks que repiten el resultado esperado. La aceptación debe demostrar el comportamiento con procesos competidores donde corresponda y declarar explícitamente los límites del modelo.

## 6. Contrato de observabilidad y salida

El resultado de una operación debe permitir distinguir al menos:
- resultado de negocio/persistencia observado;
- resultado de liberación observado;
- si se concedió o no readmisión;
- motivo/evidencia faltante cuando se devuelve `UNKNOWN/BLOCKED`.

Los nombres exactos de campos, envelopes y códigos de salida siguen abiertos. No se prescribe un nuevo esquema ni se afirma que la API actual ya pueda representar estas dimensiones.

## 7. Gate de cierre P-05/D2

P-05 permanece abierto hasta que:
1. el propietario ratifique la política de recuperación/readmisión o mantenga formalmente el bloqueo sin mecanismo automático;
2. el modelo de procesos/filesystem y sus límites queden escritos;
3. la identidad/propiedad del lock durante release y limpieza esté resuelta para ese modelo;
4. los casos E1–E9 aplicables tengan tests deterministas y pruebas de competencia apropiadas, tras autorización independiente;
5. cada test y ejecución esté vinculado al SHA exacto de implementación;
6. el contrato preserve por separado persistencia, release y readmisión;
7. no se infiera autoridad constitucional a partir de lock, raíz o éxito de filesystem.

## 8. Estado canónico y límites de esta pasada

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- Authorization: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Solo se añade documentación propuesta. No se modifican runtime, tests, workflows ni datos operativos. No se ejecutan tests ni CI. Este documento no ratifica P-03/P-04/P-05 ni elige un protocolo por el propietario.
