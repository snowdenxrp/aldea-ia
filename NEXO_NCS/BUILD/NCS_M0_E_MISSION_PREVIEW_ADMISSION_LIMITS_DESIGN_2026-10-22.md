# NCS M0-E — diseño de admisión y límites para vistas previas de misión

Fecha: 2026-10-22
Estado: **DISEÑO PROPUESTO; NO IMPLEMENTADO NI VALIDADO POR CI**

## Decisión de diseño

Mantener el límite de lectura actual de 4 MiB por archivo como límite operativo inicial del CLI, sin afirmar que es una capacidad medida o una garantía contra fallos. No aumentarlo a 16 MiB por analogía con Continuity: los presupuestos tienen unidades distintas.

Antes de cerrar este criterio, hacer que el contrato de preview defina explícitamente qué entradas caben dentro de esa frontera. El límite de bytes es una defensa de lectura; no reemplaza los límites estructurales ni demuestra una cota agregada de heap.

## Hallazgo que cambia la decisión

La investigación histórica de P112 recupera un límite intencional de ocho pasos en el orquestador heredado, pero también documenta que el límite, el grafo previo al corte y la disposición de candidatos omitidos tienen semántica abierta. No se debe trasladar silenciosamente ese límite desde el planificador legado al contrato de preview de Core. La preview recibe un borrador independiente y hoy el validador de persistencia acepta arrays de pasos sin un máximo explícito.

Por ello, este documento **no fija ocho pasos como límite nuevo**. La decisión de máximo de pasos debe tomarse dentro del contrato de misión de Core, considerando si una misión mayor se rechaza explícitamente o si existe una semántica de admisión/continuación verificable. No se debe truncar una misión en la frontera de preview.

## Requisitos mínimos del contrato

1. Límite de bytes crudos por archivo antes de UTF-8 y JSON.parse: 4 MiB como valor operativo inicial actual; inclusivo; rechazo al demostrar 4 MiB + 1 byte.
2. El envelope `mission-request-preview` tiene un presupuesto total de 4 MiB, que incluye tanto `intent` como `missionDraft`. El hecho de que el envelope quepa no implica que sus componentes individuales estén dentro de sus propios límites.
3. Definir por separado una longitud máxima para `intent`, para impedir que consuma todo el envelope y deje sin capacidad útil al borrador. El número requiere decisión de producto/contrato y fixture representativo; no se inventa en este hallazgo.
4. Definir límites estructurales de misión en Core: pasos, dependencias por paso, longitud UTF-8 de identificadores/cadenas y profundidad/cantidad de nodos de `target`, `context` y demás datos JSON admitidos.
5. Aplicar el mismo contrato estructural al preview directo, al envelope de petición y a cualquier futura ruta de admisión que comparta este contrato; no mantener validadores divergentes.
6. Rechazar de forma cerrada con código estable y salida sanitizada. Nunca truncar silenciosamente, alterar el grafo o afirmar que los pasos omitidos fueron resueltos.
7. Conservar invariantes de preview: `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `persisted: false`; la preview no autoriza efectos protegidos.

## Estrategia de pruebas

- Helper de lectura: 4 MiB − 1, exactamente 4 MiB y 4 MiB + 1 byte; incluir UTF-8 multibyte y verificar lectura limitada al byte centinela.
- CLI de borrador: archivo válido en el límite, archivo sobre el límite, JSON inválido, estructura inválida; comprobar que no se persiste ni se despacha y que la salida no repite datos privados.
- CLI de petición: envelope válido cerca del límite, `intent` sobre su límite específico, envelope sobre 4 MiB, JSON inválido; comprobar que la intención no se interpreta ni se alinea automáticamente con el borrador.
- Contrato estructural: máximo y máximo + 1 para pasos/dependencias, profundidad/nodos, cadenas UTF-8; grafo inválido no debe truncarse ni reconstruirse como válido.
- Probar preservación exacta de bytes y revisión de Continuity tras todos los rechazos.
- Ejecutar tests en el SHA exacto que contenga el código; registrar runs/jobs/artefactos. No se declara CI hasta verificar resultados terminales.

## Límites de lo que esto demuestra

Incluso con estas medidas, 4 MiB por proceso no equivale a un límite de 4 MiB de heap: buffers, cadenas, objetos del parseo, validación, snapshots y clones pueden coexistir. Tampoco limita la cantidad de procesos simultáneos. Heap agregado, disco agregado y modo multiusuario permanecen OPEN hasta que exista una unidad de admisión y evidencia separada.

## Estado canónico

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.