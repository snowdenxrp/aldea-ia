# NCS M0 — matriz de corte mínimo de responsabilidades y cierre D1
Fecha: 2026-10-25
Rama documental: `ncs-clean-architecture`

## 1. Propósito y límites

Este documento convierte las decisiones ratificadas O-08…O-11 y las pendientes P-02…P-04/P-08/P-09 en una matriz de fronteras y condiciones de cierre. No selecciona la opción A/B/C de Gemini como decisión del propietario y no autoriza cambios de runtime, tests, workflows o datos.

## 2. Contrato de dominio propuesto para completar D1

### Responsabilidades permitidas

**Dominio Lúmina**
- Leer/escribir su memoria de aprendizaje mediante su propio contrato.
- Leer/escribir el estado canónico del mundo de simulación mediante su propio contrato.
- Orquestar asistentes y simulación de Lúmina.
- No abrir Continuity de Nexo ni crear/registrar misiones Nexo durante el flujo ordinario de Lúmina.
- No importar, migrar, combinar, borrar ni hacer dual-write implícito de `state.nexoMemory` u otros datos legacy de Nexo.

**Dominio Nexo**
- Gestionar Continuity, Chronicle y misiones dentro de una instancia explícita de Nexo.
- Admitir cada entrypoint operativo mediante una única raíz explícita `--root`, existente y validada según el contrato D0.
- No depender de memoria de aprendizaje ni de estado del mundo de Lúmina para obtener autoridad o inicializar la instancia.
- No tratar el wrapper bloqueado de una operación como prueba de que las APIs de bajo nivel son inalcanzables.

**Frontera de admisión**
- Precede a la primera lectura persistente del alcance acordado, no solo a escrituras.
- Aplica a consultas, previews y Chronicle dentro del alcance ratificado O-10.
- Rechaza root ausente/ambiguo, rutas legacy contradictorias y banderas de inicialización en operación normal antes de mutar stores.
- El proceso Chronicle directamente invocable no puede confiar en que el caller ya fue admitido.
- El protocolo de lock concreto, la sección crítica exacta y la resolución de release incierto permanecen en D2; el contrato D1 debe evitar el deadlock por propiedad/espera padre-hijo, sin inventar una segunda primitiva.

Estas son condiciones de diseño objetivo, no comportamiento demostrado del runtime actual.

## 3. Matriz de entrypoints y corte mínimo

| Superficie | Hecho observado en el snapshot documentado | Frontera objetivo | Evidencia / bloqueo de cierre |
|---|---|---|---|
| `scripts/assistants.mjs` | En el flujo ordinario combina owner/Continuity/misión Nexo con memoria de aprendizaje y persistencia del estado Lúmina. | Retener las responsabilidades de asistente y persistencia propias de Lúmina; retirar de ese flujo ordinario las operaciones Nexo. | D1 bloqueado hasta definir el corte exacto y clasificar callers que dependan del registro implícito de misión. |
| `scripts/simulate.mjs` | Abre Continuity y consume `state.nexoMemory` mientras lee/persiste estado de simulación. | Mantener simulación y persistencia del mundo Lúmina; no leer Nexo legacy ni abrir Continuity en el flujo ordinario. | D1 bloqueado por la arista de estado legacy y la falta de ruta de migración explícita autorizada. |
| `scripts/nexo.mjs` | Usa `--continuity` para consultas/previews y delega Chronicle mediante `spawnSync`; el parser inspeccionado no implementa `--root`. | Validar root explícito y que la admisión preceda a la primera lectura persistente; para Chronicle, enrutar al hijo sin adquirir un lock que el hijo necesite mientras el padre espera. | D1 bloqueado por discrepancia fuente/contrato, argumentos del hijo y sección de admisión aún sin cerrar. |
| `scripts/nexo-chronicle-session.mjs` | Es ejecutable directamente; acepta rutas independientes de stores y flags de inicialización. | Exigir y validar `--root` de forma independiente; rechazar contradicciones antes de leer o mutar stores. Operación normal no bootstrap/repara. | D1 bloqueado por compatibilidad de argumentos, validación/canonicalización y propiedad de admisión no implementadas. |
| APIs de store/owner de bajo nivel | Hay fábricas y APIs invocables desde módulos de aplicación y callers de prueba; la clasificación completa de callers no está cerrada. | Definirlas como primitivas internas/test-only solo si se demuestra que los entrypoints de producción no pueden alcanzarlas sin la frontera. De lo contrario, deben tener contrato de admisión o permanecer bloqueadas para uso externo. | D1 bloqueado por callers externos/dinámicos/indirectos sin resolver. No afirmar “inalcanzable” por presencia de wrapper. |
| APIs de reparación | El wrapper `nexo-runtime-session.mjs` bloquea su ruta concreta, pero existen capas inferiores exportadas/llamables en la superficie fuente. | Reparación fuera del flujo ordinario Lúmina y fuera del alcance operativo M0 Option A; no inferir que todos los exports inferiores están protegidos por el wrapper. | Mantener `UNKNOWN/BLOCKED` donde falte resolución de callers; no atribuir autoridad a la cadena de reparación. |
| Queries/previews/snapshots | El código actual usa APIs path-oriented y carga snapshots. | Todas las lecturas persistentes dentro del alcance O-10 precedidas por admisión; no crear excepción “read-only”. | D1 debe definir la regla semántica; D2 define sección crítica/snapshot y propiedad de lock. |
| Chronicle padre/hijo | Padre usa `spawnSync`; hijo también se ejecuta directamente. | Un contrato de argumentos único; hijo valida root; padre no sostiene lock no reentrante que el hijo requiera. No confiar en contexto heredado como prueba. | La admisión efectiva, canonicalización equivalente y no-deadlock no están demostrados. |

## 4. Comparación de alternativas sin ratificación implícita

### Alternativa A — separar responsabilidades por entrypoint
**Ventaja:** hace explícita la frontera de dominio: los comandos ordinarios de Lúmina no realizan operaciones Nexo; los entrypoints Nexo gestionan sus stores/misiones.
**Riesgo:** los callers que esperaban registro automático de misiones pueden cambiar de comportamiento. Se debe identificar compatibilidad y mantener intacta la persistencia propia de Lúmina.
**Estatus:** candidata de diseño; no seleccionada.

### Alternativa B — interfaces/guards de admisión
**Ventaja:** puede proporcionar una frontera lógica compartida si todos los entrypoints y callers la atraviesan.
**Riesgo:** un guard no protege exports que sigan accesibles por rutas alternativas; una inyección de contexto no demuestra que la admisión ocurrió ni que se usa la raíz correcta.
**Estatus:** recomendación de Gemini; no ratificada. No basta por sí sola sin inventario y pruebas de bypass.

### Alternativa C — aislamiento físico de archivos
**Ventaja:** puede hacer más visible la separación modular.
**Riesgo:** mayor superficie de refactor; no es un requisito ratificado ni una prueba de seguridad por sí misma.
**Estatus:** no seleccionada; tampoco se descarta como posibilidad futura si la evidencia la exige.

### Criterio neutral para elegir
Elegir el menor corte que cumpla simultáneamente:
1. Lúmina conserva aprendizaje y persistencia del estado del mundo.
2. Los flujos ordinarios de Lúmina no abren Continuity, crean/registran misiones ni importan/migran estado Nexo.
3. Todos los entrypoints Nexo operativos tienen una frontera de admisión definida antes de lecturas persistentes.
4. Las APIs de bajo nivel no se declaran inalcanzables sin evidencia de caller reachability.
5. Las incompatibilidades de CLI/API y los consumidores externos no se resuelven mediante fallback silencioso.
6. No se necesita una afirmación global de ausencia de aristas dinámicas si estas no se pueden demostrar; la incertidumbre relevante bloquea el cierre.

## 5. D1 vs. D2: límite de responsabilidades

**Debe quedar en D1**
- Dominios y dependencias permitidas/prohibidas.
- Lista de entrypoints ejecutables, APIs públicas y primitivas internas/test-only.
- Contrato de `--root`, argumentos contradictorios, operación normal frente a bootstrap.
- Regla de admisión previa a lectura persistente para queries/previews/Chronicle.
- Contrato padre/hijo que prohíbe confiar en admisión heredada y evita la espera con lock retenido por el padre.
- Clasificación de callers resueltos y lista exacta de UNKNOWN/BLOCKED que impiden cierre.

**Debe quedar en D2**
- Selección y caracterización de la primitiva de lock.
- Sección crítica exacta y vida útil del snapshot.
- Protocolo de ownership/release, incertidumbre, cuarentena, timeout/stale y evidencia de readmisión.
- Pruebas de concurrencia/adversariales una vez que el diseño esté congelado y exista autorización separada.

## 6. Criterios de cierre documental D1

D1-DESIGN solo puede cerrarse cuando:
- [ ] Cada entrypoint y API relevante tiene dominio, contrato de admisión y clasificación de caller.
- [ ] `assistants.mjs` y `simulate.mjs` tienen un corte de responsabilidades especificado que preserva la persistencia propia de Lúmina y excluye operaciones Nexo ordinarias.
- [ ] El contrato de root/argumentos padre-hijo es coherente y no presupone que la herencia de argumentos equivale a admisión.
- [ ] Queries/previews/snapshots están dentro de una regla de admisión sin excepción de solo lectura.
- [ ] Las APIs de bajo nivel están clasificadas según evidencia, no por inferencia desde wrappers.
- [ ] Las aristas dinámicas, externas y computadas se resuelven contra el snapshot exacto o se mantienen UNKNOWN/BLOCKED con su efecto preciso sobre la afirmación de cierre.
- [ ] Las decisiones pendientes del registro se marcan como ratificadas, abiertas o fuera de alcance; no se promueven propuestas de Gemini automáticamente.
- [ ] La revisión de consistencia con criterios M0 A–E distingue documento, decisión, implementación y verificación.

Este checklist es criterio de diseño; no afirma que ya esté satisfecho. Los tests/CI de implementación son una fase posterior, no se ejecutaron aquí.

## 7. Próxima acción concreta

1. Usar esta matriz para actualizar/reconciliar el manifiesto D1 y el registro de decisiones, sin volver a escanear las 188 fuentes.
2. Resolver mediante evidencia disponible los callers directos de stores/owners y el contrato de argumentos de Chronicle. Si la vía de enumeración no permite cerrar el caller set, registrar exactamente qué afirmación queda bloqueada.
3. Presentar al propietario una decisión acotada sobre el corte mínimo solo después de que las opciones se comparen contra los criterios de la sección 4. No asumir que Opción B queda elegida.
4. Mantener la implementación bloqueada hasta autorización explícita independiente.

## 8. Estado canónico

- M0: `INCOMPLETO`
- D0 técnico/evidencia: `OPEN`
- D1-DESIGN: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- D2/D3: `OPEN`
- Authorization: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`

No se modificaron runtime, tests, workflows ni datos operativos. No se ejecutaron tests/CI. Este documento no cierra D1 ni autoriza implementación.
