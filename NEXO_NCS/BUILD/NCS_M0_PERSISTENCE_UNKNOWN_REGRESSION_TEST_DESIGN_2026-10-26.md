# NCS M0 — Diseño de regresión para G1–G4 (persistencia/UNKNOWN)

**Fecha:** 2026-10-26  
**Estado:** plan de prueba propuesto; sin implementación ni ejecución.  
**Precedencia:** aplicar junto con `NCS_M0_PERSISTENCE_UNKNOWN_ACCEPTANCE_SPEC_2026-10-26.md` y el mapa de cobertura R1–R4. No sustituye decisiones del owner.

## Propósito

Convertir las brechas G1–G4 en pruebas reproducibles, con resultados verificables y sin introducir semánticas nuevas de producto. El archivo `tests/nexo/conditional-commit-persist-state.test.mjs` ya cubre la ruta feliz, conflicto y errores stub. `tests/nexo/simulation-restart-persistence.test.mjs` ya cubre el loader estricto y fallos previos al reemplazo. Los casos siguientes deben añadirse como brechas específicas, no duplicarse como nuevas suites generales.

## Preparación común

- Usar un directorio temporal aislado por caso y limpiar en `finally`.
- Para G1/G2, usar el adaptador real y la primitiva canónica real `persistState`, no una función stub.
- Capturar los bytes originales del archivo antes del commit y volver a leerlos después.
- Mantener separados: valor retornado por el adaptador, excepción cruda de la primitiva, y estado observado en disco.
- No asumir que `loadState()` tolerante es la lectura autoritativa correcta. Verificar el camino de carga usado por el commit condicional y resolverlo antes de fijar la expectativa.
- No interpretar el éxito de un test local como CI ni como cierre de M0.

## G1 — Archivo existente con JSON corrupto

### Configuración
1. Crear archivo con contenido exacto, por ejemplo `{invalid-json`.
2. Guardar `Buffer` de bytes originales.
3. Crear `createPersistStateConditionalCommit({ persistState, statePath, clock })` con la primitiva canónica.
4. Invocar `commit({ state: candidateState, expectedRevision: 0 })`.

### Aserciones
- No obtener `COMMITTED`.
- No sobrescribir el archivo como si fuera una revisión inicial vacía.
- Los bytes del archivo siguen siendo exactamente los originales.
- El resultado/código distingue estado inválido de conflicto de revisión.
- No afirmar `persisted: false` si el código no puede demostrar ausencia de mutación; en este escenario se verifica el archivo para demostrarlo.

### Condición previa
Si el adaptador actualmente permite que el loader tolerante convierta el JSON inválido en estado inicial, esta prueba debe fallar antes de corregir el camino de carga. No adaptar la expectativa al comportamiento inseguro.

## G2 — Archivo ausente frente a archivo inválido

Ejecutar casos separados, no una sola prueba parametrizada que pierda el diagnóstico:

- **Ausente:** el archivo no existe antes de invocar commit.
- **Inválido:** el archivo existe, pero su JSON/esquema/revisión no se puede aceptar.

Para cada caso, documentar:
- resultado del adaptador;
- código estable;
- si el destino existía antes y después;
- si los bytes del archivo existente permanecieron intactos.

**Punto de decisión:** el contrato debe precisar si un primer snapshot puede inicializar un archivo ausente y bajo qué precondiciones. No inferirlo a partir del loader tolerante. Hasta esa decisión, G2 no puede exigir un código final específico para la inicialización legítima, pero sí prohíbe confundir un archivo existente corrupto con un archivo ausente.

## G3 — Getter hostil en `error.code`

### Configuración
Crear un objeto de error con un getter que lance:

```js
const hostileError = {};
Object.defineProperty(hostileError, "code", {
  enumerable: true,
  get() { throw new Error("HOSTILE_CODE_GETTER"); }
});
```

Inyectar una primitiva `persistState` que lance ese objeto y llamar `commit()`.

### Aserciones
- `commit()` resuelve con un resultado de `COMMIT.UNKNOWN`, en lugar de dejar escapar la excepción del getter.
- El código de diagnóstico es el valor genérico estable aprobado para error no clasificable.
- No invocar un getter más de lo necesario; preferiblemente ninguno fuera del acceso defensivo único.
- No presentar el error como conflicto confirmado.
- Añadir controles para `code` ausente y `code` de tipo no string, sin ejecutar funciones proporcionadas como código.

**Nota de implementación:** el acceso a `error?.code` no es seguro frente a getters. La lectura debe estar dentro de un bloque defensivo y validar el tipo del valor. Evitar serializar o inspeccionar profundamente el objeto hostil.

## G4 — Reemplazo completado y error posterior

### Configuración
Usar una primitiva de prueba que escriba un nuevo snapshot en un destino temporal y complete el reemplazo del destino; inmediatamente después, lanzar un error conocido. La simulación debe ser determinista y confirmar que el destino sí cambió.

### Aserciones
- El adaptador devuelve `COMMIT.UNKNOWN`, porque la llamada terminó con error y no tiene evidencia contractual suficiente para declarar el commit normal.
- Leer el destino tras el resultado y registrar qué snapshot es visible.
- Si el snapshot nuevo está visible, no contradecir la observación afirmando que no hubo persistencia.
- No volver a invocar el commit automáticamente.
- No elevar el resultado a garantía de durabilidad frente a caída del sistema o pérdida de energía.

**Límite:** esta prueba demuestra el tratamiento de un error después de la mutación visible; no demuestra F2/F3, sincronización física ni causalidad durable.

## G5 — Integración, separada de G1–G4

No añadir todavía un test que presuponga que `executeProtectedTransition` es el runtime canónico. Antes se requiere una decisión arquitectónica documentada entre:
- integrar ese motor al flujo ejecutable, o
- aceptar el runtime owner/effect-journal actual como mecanismo canónico y probar su consumidor.

Cualquiera de las dos rutas requiere una prueba con el consumidor real que demuestre que `UNKNOWN` bloquea un redispatch no autorizado. Las pruebas unitarias existentes de transición no bastan para esta afirmación.

## Criterio de salida para el lote G1–G4

El lote se considera probado solo si:
1. las nuevas pruebas fallan antes de la corrección cuando corresponde;
2. la corrección mínima no altera los contratos no relacionados;
3. cada prueba inspecciona estado en disco cuando aplica;
4. se ejecuta en el SHA nuevo y se conserva el log;
5. se documentan Node, SO y resultado real.

Un resultado local no equivale a CI. Una CI verde no cierra las decisiones R3/R4/R5/R6 que no estén cubiertas por esa ejecución.

## No realizado

No se añadieron pruebas al repositorio, no se cambió runtime ni configuración, y no se ejecutaron pruebas o CI. Este documento es exclusivamente un plan de ejecución.
