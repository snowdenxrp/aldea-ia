# NCS M0-E — evidencia de frontera de bytes en vistas previas de misión

Fecha: 2026-10-22  
Rama: `ncs-clean-architecture`  
Commit de código/pruebas: `f55204b1a591a13cbc6e2263ec7280e793b5f0ce`

## Cambio verificado

Se amplió `tests/nexo/mission-request-preview.test.mjs` para probar, mediante los dos entrypoints CLI reales:

- `mission-draft-preview --draft`
- `mission-request-preview --request`

Para ambos comandos, la prueba escribe un JSON válido rellenado únicamente con whitespace JSON hasta exactamente 4 MiB, y después repite con 4 MiB + 1 byte. El límite es binario: `4 * 1024 * 1024 = 4,194,304` bytes.

### Resultado esperado y confirmado por CI

- Exactamente 4 MiB: se acepta y devuelve `status: validated`.
- 4 MiB + 1 byte: se rechaza con el código de límite específico del comando antes de parsear el documento completo.
- En ambos resultados se conservan `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y `persisted: false`.
- Se compara el archivo Continuity antes/después; el preview no lo modifica.
- El rechazo no imprime el contenido de entrada.

## CI del SHA exacto

Todos los workflows siguientes terminaron `completed / success` en el mismo SHA `f55204b1a591a13cbc6e2263ec7280e793b5f0ce`:

- [Nexo — deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39825459604) — job `tests`, paso `Run tests`: success.
- [Nexo — STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39825459612) — success.
- [Nexo — STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39825459750) — success.

La prueba se ejecutó dentro del workflow determinista completo configurado por el repositorio; no se afirma que esto demuestre el presupuesto agregado de heap/disco ni la concurrencia entre procesos.

## Brechas aún abiertas

1. 4 MiB está probado como frontera operativa del lector, no derivado como tamaño máximo de toda entrada válida.
2. El contrato Core aún carece de límites explícitos compartidos para número de pasos, dependencias por paso, longitudes de cadenas y complejidad de `target/context`.
3. `mission-request-preview` incluye `intent` en el envelope de 4 MiB y todavía no tiene un máximo de intención independiente.
4. La investigación histórica P112 confirma que el límite de ocho pasos era intencional como diseño acotado, pero no define el destino de las reclamaciones omitidas ni resuelve las semánticas del grafo previo/posterior al corte. No trasladar ese límite al contrato nuevo ni truncar.
5. Presupuesto agregado de heap/disco y concurrencia multiproceso siguen OPEN.

## Siguiente paso técnico

Cerrar el contrato estructural compartido de admisión de misión antes de fijar cifras aisladas por comodidad. Debe evitar recursión/volumen no acotado, aplicarse tanto al preview directo como al envelope de petición y rechazar explícitamente sin truncar ni persistir. Después, añadir pruebas de máximo/máximo+1 para cada dimensión y ejecutar CI sobre el SHA exacto.

## Estado canónico

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
