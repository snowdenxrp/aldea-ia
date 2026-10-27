# NCS M0 — clasificación del objeto y alcance de autoridad P-01 (2026-10-27)

## Objetivo

Separar dos preguntas que no deben colapsarse: (a) qué clase de estado se intenta crear en M0 y qué capacidades puede habilitar; (b) qué autoridad legítima requiere la operación de primera creación. El análisis reutiliza las decisiones existentes; no elige una implementación ni cambia gates.

## Hallazgo documental

La decisión de inicialización de estado ausente fija que la ausencia no autoriza creación, que el commit condicional normal no auto-inicializa y que las precondiciones de autoridad, esquema y exclusión deben definirse antes de implementar. La propuesta de bootstrap explicita que la fuente de autoridad local sigue UNKNOWN/PENDING y que no debe inventarse un `BootstrapAuthority` paralelo.

La misma propuesta también advierte que la brecha de legitimidad de la primera escritura local **no demuestra** que toda escritura interna acotada requiera establecer una raíz constitucional; tampoco demuestra que esa escritura pueda autorizarse sin delimitación. Por tanto, hay que clasificar el objeto antes de decidir qué frontera de autoridad lo cubre.

## Matriz de clasificación

| Clase de objeto | Afirmación que puede sostenerse | Qué no se puede inferir | Consecuencia para P-01 |
|---|---|---|---|
| A. Almacenamiento operativo local M0, estrictamente no autoritativo | Solo datos operativos acotados; sin credenciales, raíz de confianza, régimen constitucional, permisos ni estado protegido | Que sus consumidores estén aislados; que la primera creación esté autorizada; que no pueda habilitar indirectamente un efecto | Puede ser compatible con el alcance M0, pero requiere prueba negativa de capacidad y una regla legítima de creación aplicable |
| B. Estado que determina identidad, raíz, régimen constitucional, Policy/autoridad o permisos | Es estado de seguridad/autoridad, no mero almacenamiento operativo | Que un archivo válido, hash, firma, snapshot, lock o procedencia declarada establezcan legitimidad actual por sí mismos | Requiere Trust Foundation / frontera protegida independientemente establecida; UNKNOWN/STOP si falta |
| C. Objeto de clase desconocida o consumidores no cerrados | Solo se conoce que se propone crear estado persistente | Que sea A en vez de B; que ninguna ruta derive autoridad o habilite dispatch | No clasificar por intención; P-01-A/B/G siguen OPEN/UNKNOWN y no se crea |

## Prueba de clasificación obligatoria

Antes de seleccionar la autoridad requerida, documentar con evidencia estática y después verificable:

1. Ruta, esquema y bytes iniciales exactos del objeto candidato; distinguirlo de la raíz de instancia (directorio de persistencia) y de cualquier raíz de confianza/identidad/Constitución.
2. Para cada campo inicial, qué consumidor lo lee y qué decisión puede cambiar. No basta con que el esquema no tenga un campo llamado `authority`: valores operativos pueden afectar admission, PREPARED, dispatch, recuperación o efectos.
3. Todos los caminos desde ese objeto a `openNexoContinuityOwner`, Chronicle, estado de simulación/Lúmina, owner-backed runtime, repair y fronteras de efectos; cualquier arista no resuelta conserva UNKNOWN.
4. Propiedad negativa falsable: incluso con el objeto presente, válido, corrupto, reemplazado o antiguo, no puede establecer la Trust Foundation, reconocer por sí solo el Constitution Authority Context, conceder permiso ni levantar el gate de efectos.
5. Regla de primera creación aplicable al objeto exacto: quién/qué frontera la reconoce, qué alcance tiene y cómo se verifica sin aceptar una afirmación del propio caller como autoridad.
6. Exclusión de escritores, quiescencia, clasificación de ausencia/corrupción/error y resultado ambiguo; son obligaciones separadas, no consecuencias automáticas de la clasificación A.

## Decisión que los documentos actuales no permiten tomar

No se puede elegir aún entre “la creación de almacenamiento operativo local está cubierta por una regla existente” y “se necesita una delimitación normativa explícita adicional”. La evidencia documental examinada establece que el contrato Constitution Authority Context conocido no cubre expresamente la creación local, pero eso no autoriza ampliar ese contrato ni demuestra que sea la única vía normativa posible para todo objeto local.

La siguiente decisión debe quedar vinculada al objeto ya clasificado, no formularse como un nuevo owner abstracto. Si la clasificación o la regla aplicable siguen desconocidas, mantener STOP/UNKNOWN; no implementar ni usar la mera ausencia como permiso.

## Orden de trabajo recomendado

1. Cerrar documentalmente el candidato de objeto y sus campos/consumidores antes de proponer mecanismos.
2. Reconciliar su clase con el contrato de raíz de instancia y los límites de Nexo/Lúmina.
3. Presentar una decisión estrecha al propietario solo si los contratos aceptados no cubren explícitamente la primera creación de ese objeto.
4. Mantener las cuestiones de exclusión, quiescencia, persistencia y UNKNOWN como criterios independientes.
5. Solo después de contrato aceptado y autorización separada, preparar pruebas; CI debe vincularse al SHA exacto.

## Estado canónico

M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-A/B/G `OPEN / UNKNOWN`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz legítima `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.

Documento analítico. No se modificaron runtime, tests, workflows ni configuración; no se ejecutaron tests, CI o Actions.
