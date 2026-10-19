# NCS M0 — auditoría de confianza del recibo PREPARED canónico

**Fecha:** 2026-10-19  
**Estado:** HALLAZGO CONFIRMADO POR INSPECCIÓN ESTÁTICA; corrección pendiente  
**Impacto de alcance:** la API del adaptador no demuestra que el recibo PREPARED provenga del propietario canónico. No afirmar todavía que exista una ruta de producción externa explotable; sí existe una ruta pública dentro del contrato del adaptador que acepta el recibo fabricado.

## Evidencia revisada

- `src/nexo/effect-adapter.js`, blob observado `efe00f7f0bd3586266209fb17e2eb725a6522463`.
- `tests/nexo/effect-adapter.test.mjs`, blob observado `602a220cafc31888892a04d31a06d256bf49b455`, líneas 372–399.
- `src/nexo/core/owner-backed-runtime.mjs`, blob observado `ca738c3e42cefbdd6576770ac0296dd7e3ac8966`.

## Hallazgo

`createEffectAdapter()` expone `executePrepared(request, { preparedCommit })`. La comprobación valida campos ordinarios del objeto —`status === "committed"`, `preparedCommitted === true`, revisión entera no negativa y coincidencia de identidad entre la solicitud y `preparedOperation`—, pero no verifica procedencia ni una capacidad no falsificable del propietario.

La prueba existente construye manualmente este recibo:

```js
{ status: "committed", preparedCommitted: true, storeRevision: 4 }
```

y espera que `executePrepared()` ejecute el handler y devuelva `completed`. Eso demuestra que el adaptador acepta un recibo fabricado por el propio consumidor de la API; no requiere una llamada a `owner.recordPrepared()` ni evidencia del almacén canónico.

## Consecuencia precisa

El recibo acredita su forma, no su origen. Si un consumidor puede acceder al adaptador y a `executePrepared()`, puede invocar el handler presentando un objeto que satisface la forma esperada, sin que esa llamada pruebe un PREPARED confirmado por el propietario. El runtime owner-backed sí exige una respuesta de `recordPrepared()` antes de llamar al adaptador, pero esa secuencia no protege por sí sola el método público del adaptador contra llamadas directas.

Este hallazgo **no** demuestra que la raíz de autoridad exista, que se haya eludido una autorización constitucional implementada, ni que todos los efectos protegidos estén habilitados. El estado global continúa siendo `authorization: NOT_EVALUATED`; efectos protegidos STOP.

## Requisito de corrección

Antes de cambiar código, definir y probar una única frontera de confianza que distinga:
1. el resultado descriptivo de una escritura PREPARED;
2. la capacidad de despachar un efecto después de que el propietario canónico haya confirmado esa escritura.

No basta con añadir otro booleano, un campo `source` o una firma de objeto que el mismo llamador pueda fabricar. La solución debe mantener una arquitectura coherente y dejar claro quién emite y quién verifica la capacidad. Evitar introducir un segundo journal, una cola, reintentos o una transacción envolvente como solución incidental.

## Pruebas de aceptación para la corrección

- Un objeto ordinario con todos los campos correctos no permite ejecutar el handler.
- Un recibo fabricado con otra identidad, revisión o resultado no permite ejecutar el handler.
- El camino owner-backed válido continúa funcionando cuando el propietario confirma PREPARED.
- Un fallo o resultado ambiguo del propietario mantiene despacho cerrado o UNKNOWN según si el despacho ya pudo comenzar; nunca autoriza redispatch por inferencia.
- No se filtra contenido privado ni detalles internos de excepción.
- Ejecutar las pruebas y obtener evidencia CI asociada al SHA exacto antes de declarar PASS.

## Estado

No se modificó el código de ejecución en esta auditoría. La corrección requiere definir la frontera de confianza primero. **M0 INCOMPLETO; raíz/autoridad PENDING; efectos protegidos STOP; ejecución de pruebas de este hallazgo PENDING.**
