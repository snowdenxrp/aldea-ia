# NCS M0 — Diseño técnico de cierre P-03/P-04
Fecha: 2026-11-03
Rama: `ncs-lumina-decoupling-2026-10-29`
Decisión de autoridad: D1–D6 ratificadas por el propietario el 2026-11-03
Estado: **DISEÑO TÉCNICO PROPUESTO — NO IMPLEMENTADO — NO AUTORIZA CAMBIOS EJECUTABLES**

## 1. Propósito y límites

Traducir la ratificación D1–D6 en un diseño de aplicación comprobable para la admisión de instancia de los casos de uso M0.

Este documento:
- fija las fronteras públicas de adquisición y el intervalo protegido;
- fija admisión exclusiva para operaciones normales cubiertas por M0;
- separa el diagnóstico forense limitado;
- define composición con locks per-store, resultados y presupuestos;
- convierte la ratificación en criterios de aceptación y pruebas.

No selecciona la primitiva filesystem ni el protocolo de recuperación ante release incierto. No cierra P-05, P-07, P-08 ni P-09. No modifica runtime, tests, workflows, configuración, dispositivo o datos. No ejecuta tests/CI/Actions. No autoriza bootstrap, primera publicación, commissioning ni efectos protegidos.

## 2. Decisiones de autoridad aplicables

Se aplica la ratificación D1–D6 registrada en:
`NCS_M0_D2_P03_P04_CONTRACT_RATIFICATION_PROPOSAL_2026-11-03.md`, sección 10.

Resumen normativo:
- una admisión por caso de uso público;
- API pública de aplicación como propietaria;
- admisión exclusiva para operaciones normales cubiertas;
- diagnóstico UNKNOWN/BLOCKED limitado a evidencia externa y metadata del protocolo, sin leer/modificar stores canónicos ni readmisión;
- terminación/release incierto = UNKNOWN/BLOCKED, sin retry automático ni readmisión hasta resolución O-11/P-05;
- inputs externos y metadata conforme a P-03 §3.2;
- garantía limitada al alcance R1 aceptado, sin promesa universal.

O-08/O-10/O-11 permanecen intactos. La admisión técnica no es autoridad constitucional ni autorización de efectos.

## 3. Abstracción de aplicación

### 3.1 Interfaz conceptual

La implementación debe ofrecer una única abstracción interna equivalente a:

```js
withNexoInstanceAdmission({
  canonicalRoot,
  operationKind,
  waitBudget,
}, async (admittedContext) => {
  // Todas las lecturas/escrituras canónicas del caso de uso.
});
```

Es pseudocódigo de contrato, no una API existente ni una instrucción para implementarla literalmente.

Propiedades obligatorias:
1. Solo el módulo propietario puede crear una capacidad admitida.
2. La capacidad no puede falsificarse con un objeto plano, booleano o parámetro `alreadyAdmitted` de un caller.
3. Los helpers internos reciben la capacidad y no adquieren de nuevo.
4. Las APIs públicas no aceptan capacidades arbitrarias de callers externos.
5. El contexto queda ligado a la raíz canónica y a una sola operación.
6. El callback no puede escapar para seguir usando el contexto después del release.
7. No se expone una función pública que permita convertir un contexto expirado/liberado en admitido.

La técnica concreta (closure privada, marca privada/WeakSet u otra equivalente) queda a cargo de ingeniería, siempre que los tests demuestren las propiedades anteriores.

### 3.2 Fronteras por flujo

| Flujo | Frontera que adquiere exactamente una vez | Ruta interna |
|---|---|---|
| Chronicle directo | `runNexoChronicleAppend` | Implementación interna del append |
| Chronicle desde `scripts/nexo.mjs` | La misma `runNexoChronicleAppend`, ejecutada por el hijo | El padre delega y propaga el resultado |
| Query/status/mission/plan/Open Loops | Cada API pública de query incluida en el alcance | Helpers puros consumen snapshot/contexto admitido |
| Preview request | `previewNexoMissionRequest` | Helper interno de draft que no adquiere |
| Preview draft directo | `previewNexoMissionDraft` | El mismo helper interno de draft |

El CLI no es el dueño de la admisión. El padre no adquiere ni retiene la admisión mientras espera al hijo. Stores y helpers no adquieren admisión de instancia.

### 3.3 Secuencia de una operación normal

1. Validar forma/sintaxis/límites superficiales sin abrir stores.
2. Resolver y canonicalizar la raíz explícita conforme a O-08.
3. Adquirir admisión exclusiva para esa raíz.
4. Solo después, abrir/leer stores canónicos.
5. Mantener la admisión durante la vida del snapshot y su consumo, más todas las escrituras/reconciliaciones del mismo caso de uso.
6. Determinar el resultado de negocio/persistencia.
7. Intentar release conforme al protocolo que se ratifique en P-05.
8. Devolver por separado el resultado de negocio/persistencia y el resultado de release.

La admisión nunca se libera inmediatamente después de `loadCurrent()` si el caso de uso continúa dependiendo del snapshot.

## 4. Diagnóstico forense limitado

El diagnóstico bajo UNKNOWN/BLOCKED no es una operación normal ni una admisión compartida.

Contrato permitido:
- leer evidencia externa ya disponible;
- inspeccionar metadata del protocolo/lock sin modificarla;
- devolver observaciones literales y limitadas, sin inferir que un actor murió o que el lock está libre;
- no abrir, leer, parsear ni materializar `continuity.json`, `chronicle.json` ni snapshots;
- no escribir, borrar, renombrar, reparar, limpiar, liberar ni sustituir locks;
- no crear capacidad admitida ni permitir readmisión;
- no convertir la inspección en query/status de negocio.

Si una implementación no puede demostrar que se limita a metadata del protocolo y evidencia externa, debe fallar cerrada y no ejecutar la inspección.

La inspección no resuelve P-05. Su resultado no constituye prueba suficiente para readmisión salvo que P-05 lo ratifique expresamente, cosa que este diseño no propone.

## 5. Composición con locks per-store

### 5.1 Orden normativo propuesto

Orden único para operaciones públicas cubiertas:

`resolver/canonicalizar root → admisión de instancia → locks per-store → I/O de stores → release per-store → release de admisión`

Invariantes:
- ningún camino que ya posea lock per-store puede intentar adquirir admisión de instancia;
- ninguna API pública de store puede elevarse a operación admitida por una bandera caller-controlled;
- no se retiran locks per-store existentes por el hecho de añadir admisión;
- no se cambia la semántica de release de Continuity o Chronicle sin contrato/test separado;
- toda inversión o reentrada detectada bloquea la implementación hasta corregirla.

Este orden es una regla de arquitectura a verificar contra todos los callers conocidos. P-09 sigue abierto para callers no observados.

### 5.2 Lecturas

La admisión exclusiva cubre la operación de lectura completa. El lock per-store de Continuity conserva su función local durante la carga; su release no libera la admisión de instancia. Las lecturas Chronicle que hoy no usan lock per-store quedan cubiertas por la admisión de instancia; cualquier cambio adicional a su lock per-store requiere justificación separada.

Las proyecciones posteriores pueden ser puras y ejecutarse dentro del callback admitido. No deben recargar stores por una ruta path-oriented fuera de contexto.

## 6. Presupuestos y terminación

Se mantienen tres conceptos distintos:

1. **Espera de admisión:** presupuesto monotónico por intento de adquirir admisión. Si vence antes de adquirir, el caso de uso no realiza store I/O ni dispatch.
2. **Espera per-store:** presupuesto explícito para cada adquisición per-store o presupuesto total de operación documentado con semántica inequívoca. Nunca reutilizar silenciosamente el deadline de admisión.
3. **Duración admitida:** no expira automáticamente por el deadline de espera de admisión. No existe TTL que libere una admisión activa.

No se fijan valores numéricos en este documento.

### 6.1 Proceso padre/hijo

- El padre no mantiene admisión mientras ejecuta `spawnSync`.
- El hijo y la API pública Chronicle deben producir un resultado estructurado cuando terminan normalmente.
- Terminación por señal, crash, ausencia de resultado o resultado malformado deja UNKNOWN los campos no demostrables.
- No se debe matar automáticamente un hijo con operación/admisión en vuelo y tratarlo como fallo ordinario.
- No se añade timeout destructivo hasta que P-05 defina las consecuencias y la evidencia de release/readmisión.
- Interrupción externa no habilita retry automático ni readmisión.

## 7. Contrato de resultados

El resultado observable debe conservar dimensiones separadas, conceptualmente:

```js
{
  operation: { status, code, value },
  persistence: { status, evidence },
  admission: { acquired, released, releaseStatus },
}
```

El esquema exacto se diseñará contra los contratos de resultados existentes. Este ejemplo no declara nombres de campos implementados.

Reglas:
- persistencia confirmada + release incierto: conservar persistencia confirmada y marcar release UNKNOWN/BLOCKED;
- persistencia desconocida + release incierto: resultado UNKNOWN/BLOCKED;
- fallo de admisión antes de adquirir: cero store I/O, cero dispatch y cero mutaciones de negocio;
- ninguna combinación permite retry automático del negocio ni readmisión mientras O-11/P-05 no estén satisfechos;
- no colapsar resultado de negocio y resultado de release en un único booleano PASS/FAIL.

## 8. Tratamiento de entradas externas

Aplicar D5/P-03 §3.2:
- argumentos y límites superficiales: validar antes de admisión, sin store I/O;
- stdin y archivos `--draft`/`--request`: entradas del operador, no stores ni autorización;
- su lectura no prueba admisión ni atomicidad con stores;
- metadata mínima de raíz: preparación de raíz, sujeta a P-07;
- metadata del protocolo: pertenece a la primitiva de admisión y no autoriza leer stores canónicos.

El orden concreto de lectura de archivos externos debe minimizar la sección protegida sin permitir que su contenido se use para inferir autoridad ni que se abra un store antes de admitir.

## 9. Criterios de aceptación para implementación futura

### 9.1 Frontera y ciclo de vida
- Cada API pública cubierta adquiere exactamente una admisión.
- La adquisición precede la primera lectura persistente canónica.
- La admisión cubre todo el consumo del snapshot y todas las escrituras/reconciliaciones del caso de uso.
- La llamada directa a Chronicle tiene la misma protección que la ruta CLI.
- El padre no adquiere ni retiene la admisión del hijo.
- Request→draft adquiere una vez; draft directo también queda protegido.
- Los helpers internos no pueden reentrar ni falsificar el contexto.

### 9.2 Fallos y diagnóstico
- Fallo/timeout de admisión antes de adquirir: cero store I/O y cero dispatch.
- Diagnóstico UNKNOWN/BLOCKED: solo metadata del protocolo/evidencia externa; tests espía verifican cero acceso a stores.
- Diagnóstico no altera ni elimina locks, no crea contexto admitido y no habilita readmisión.
- Señal/crash/ausencia de resultado: UNKNOWN para campos no demostrables.
- Release incierto no provoca retry ni readmisión.
- Persistencia y release se verifican como dimensiones independientes.

### 9.3 Concurrencia y locks
- Dos operaciones normales no mantienen admisión exclusiva simultáneamente para la misma raíz.
- Una operación admitida no pierde la admisión al terminar `loadCurrent()`.
- No existe camino per-store→admisión que invierta el orden.
- Se prueban reentrada, deadlock, lock contention y timeout por separado.
- Los tests existentes de locks per-store conservan su alcance y no se usan como sustituto de tests de admisión.

### 9.4 Cobertura y evidencia
- Todos los callers públicos conocidos se clasifican por flujo.
- Cada superficie dinámica/externa no demostrada permanece UNKNOWN/BLOCKED.
- Guards de import graph no se presentan como prueba de ausencia de consumidores externos o escrituras directas filesystem.
- Cada PASS de tests/CI se liga a SHA, entorno y comando/run exactos.
- R1 no se describe como protección frente a root/OS comprometido ni frente a procesos maliciosos con el mismo UID fuera del alcance aceptado.

## 10. Dependencias que impiden declarar cierre completo

| Dependencia | Efecto sobre este diseño | Estado |
|---|---|---|
| P-05 release incierto/readmisión | No se puede implementar/afirmar recuperación ni liberar/re-admitir tras incertidumbre | OPEN / NOT RATIFIED |
| P-07 filesystem, alias, TOCTOU | No se puede afirmar identidad segura del lock/path ni cobertura de carreras | OPEN |
| P-08 gramática CLI | Debe confirmar flags/raíz y rechazo de rutas contradictorias | OPEN |
| P-09 callers externos/dinámicos | No se puede afirmar cobertura universal de las APIs/stores | UNKNOWN / OPEN |

El diseño de fronteras D1–D6 queda definido a nivel contractual, pero la admisión ejecutable y su cierre de seguridad dependen de estas cuestiones.

## 11. Estado

- D1–D6: **RATIFICADAS POR EL PROPIETARIO**.
- P-03/P-04: **DISEÑO TÉCNICO PROPUESTO; IMPLEMENTACIÓN Y EVIDENCIA PENDIENTES**.
- P-05: **OPEN / NOT RATIFIED**.
- P-07/P-08: **OPEN**.
- P-09: **UNKNOWN / OPEN**.
- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional: **PENDING/UNKNOWN**.
- Primera publicación, commissioning y efectos protegidos: **STOP**.
- Solo documento; sin cambios runtime/tests/workflows/configuración/dispositivo.
- No se ejecutaron tests/CI/Actions.


---

## DELTA — P-05-C RATIFICADA; DEPENDENCIAS DE CIERRE SIN CAMBIO (2026-11-07)

El propietario ratificó P-05-C el 2026-11-07. Las referencias anteriores a «P-05 OPEN / NOT RATIFIED» quedan superadas únicamente en cuanto a la decisión de política.

- P-05-C queda **RATIFICADA**: incertidumbre de release/cleanup conserva `UNKNOWN/BLOCKED`, sin retry automático de negocio ni readmisión normal.
- P-05 continúa **OPEN**: no hay mecanismo de enforcement durable/interproceso, predicados de resolución ni evidencia de aceptación demostrados.
- D1–D6 continúan ratificadas y el diseño de fronteras de este documento no cambia.
- La implementación de admisión P-03/P-04 debe respetar C y D4: si terminación/release es incierto, no reintentar negocio ni readmitir; el estado bloqueado debe ser efectivo para competidores, también tras crash, o el gate permanece UNKNOWN/STOP.
- P-07-C y P-09 siguen siendo dependencias bloqueantes para demostrar identidad/cleanup replacement-safe y cobertura de callers/escritores. Esta delta no selecciona primitiva ni afirma que los callers estén cubiertos.
- P-03/P-04: diseño propuesto; implementación/enforcement/cobertura pendientes. NCS M0: **INCOMPLETO**.
- Sin runtime/tests/workflows/CI/dispositivo; no se ejecutaron pruebas ni se autoriza ningún efecto protegido.

Registro de ratificación: [definición técnica P-05-C](NCS_M0_D2_P05_POLICY_C_TECHNICAL_DEFINITION_2026-11-03.md).


---

## DELTA — MAPEO DE INTEGRACIÓN SOBRE LOS BLOBS ACTUALES (2026-11-07)

Esta delta convierte la propiedad de admisión ya ratificada en un mapa de seams sobre el snapshot de código `d8b5ca8720908d926acc18130614cce132a43b5d`. No añade decisiones de autoridad, no elige primitiva filesystem y no autoriza implementación.

### A. Queries de Continuity

Fuente: `continuity-queries.mjs`, blob `e1915e94e53e71d37a37952fead37ba62bdae79a`.

Las funciones públicas actuales que deben adquirir una admisión exclusiva por caso de uso son:
- `loadNexoContinuityStatus(continuityPath)`
- `loadNexoMissionStatus(continuityPath, missionId)`
- `loadNexoMissionPlan(continuityPath, missionId)`
- `previewNexoMissionDraft(continuityPath, missionDraft)`
- `loadNexoOpenLoops(continuityPath)`

Todas llaman a una factory path-based y ejecutan `loadCurrent()`. La frontera ratificada es la API pública de aplicación, no el CLI. Por tanto, no basta con envolver `scripts/nexo.mjs`: cada API pública debe ser segura en llamada directa. La implementación interna debe separar:
1. wrapper público: validar inputs superficiales, resolver raíz contractual, adquirir una admisión;
2. helper privado: recibir capacidad no falsificable + snapshot/contexto y no adquirir/reentrar;
3. release: después del último uso del snapshot y de construir el resultado, conservando separado el resultado de negocio y el de release.

### B. Preview request → draft

Fuentes: `mission-request-preview.mjs` blob `4e317b646d0c7b7403acfb63732dec8c3fe7778b`; `continuity-queries.mjs` blob `e1915e94e53e71d37a37952fead37ba62bdae79a`.

La API pública `previewNexoMissionRequest` debe adquirir exactamente una vez y delegar a un helper interno no reentrante. La API pública `previewNexoMissionDraft`, si se invoca directamente, debe adquirir por sí misma y delegar al mismo helper. Prohibido usar `alreadyAdmitted: true`, un objeto plano falsificable o un token aceptado de callers arbitrarios como bypass.

### C. Chronicle directo y delegado

Fuentes: `chronicle-append.mjs` blob `c1964467d68043d06e035ad59720f8cec2e52e52`; `scripts/nexo.mjs` blob `e471eb478a09aa8a9a8323795583e198cdf0a127`; `scripts/nexo-chronicle-session.mjs` blob `30a53de2f108aa255a1dfd61ce78c19788de160b`.

- El propietario único es la API pública `runNexoChronicleAppend`, tanto cuando se invoca desde el hijo como cuando se llama directamente.
- La adquisición debe preceder a la construcción/lectura de stores y, en particular, a los dos `loadCurrent()` actuales.
- El hijo valida/adquiere por sí mismo en ambas formas de invocación.
- El padre puede hacer dispatch y propagar el resultado; nunca adquiere ni retiene el lock mientras espera al hijo.
- No transferir una capacidad serializada por argumentos como prueba de admisión.

### D. Compatibilidad y primitivas

Fuentes: `application/index.mjs` blob `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`; `scripts/nexo-continuity.mjs` blob `7a2003f78a83ce5d65b53f02470156c3dd4cfefd`.

El índice de aplicación reexporta operaciones path-based. El wrapper de compatibilidad reexporta `openNexoContinuityOwner`, bootstrap y preflight. Ninguno es una frontera de seguridad. La migración debe retirar las factories/owner de la superficie pública soportada o imponer el contrato de admisión en toda API exportada que pueda alcanzar stores. La mera etiqueta `INTERNAL_ONLY` o mover imports al CLI no prueba inaccesibilidad de consumidores directos.

### E. Orden y resultados que no se pueden alterar

Se mantiene el orden de diseño ya descrito:
`canonical root → exclusive instance admission → per-store locks → store I/O → per-store release → instance admission release`.

- D3 ratificada: las operaciones normales cubiertas, incluidas queries/previews, usan admisión exclusiva; no reader/writer compartido en M0.
- D2 es un carril forense separado y limitado a evidencia externa/metadata; nunca lee los stores canónicos ni concede readmisión.
- P-05-C ratificada: incertidumbre de release/cleanup conserva UNKNOWN/BLOCKED; no retry de negocio, no readmisión y no cleanup destructivo por path sin identidad demostrada.
- P-07-C sigue UNKNOWN/BLOCKING: no implementar una primitiva filesystem por inferencia ni afirmar que el orden abstracto anterior ya es ejecutable.
- No se cambian los contratos actuales de locks per-store por analogía; su orden, límites y release se caracterizan separadamente.

### F. Criterios de aceptación específicos del seam

Para el futuro SHA candidato, sin ejecutar ahora:
1. Cada API pública de query/preview falla antes de store I/O si falta `--root` o la admisión no se adquiere.
2. Cada query conserva admisión hasta el último uso del snapshot.
3. Request→draft adquiere una vez; draft directo adquiere una vez; helper privado no reentra.
4. Chronicle no ejecuta ningún `loadCurrent()` antes de admisión, tanto en llamada directa como desde el hijo.
5. El padre Chronicle no adquiere admisión; no hay doble adquisición ni deadlock padre/hijo.
6. Imports/callers no cubiertos, capacidad falsificada, loader no resuelto o API path-based alcanzable fuera de la frontera resultan en fallo del gate o UNKNOWN/BLOCKED, nunca PASS por omisión.
7. Fallo de release después de persistencia confirmada conserva el hecho de persistencia y bloquea readmisión conforme a P-05-C.

**Estado:** diseño de seams alineado con D1–D6 y evidencia de fuente; no implementado, no probado. P-03/P-04 siguen OPEN en enforcement/cobertura; P-05 OPEN; P-07-C UNKNOWN/BLOCKING; P-09 OPEN/UNKNOWN; M0 INCOMPLETO.
