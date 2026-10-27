# NCS M0 — frontera de decisión para la primera creación (2026-10-27)

## Objetivo

Precisar qué decisión aún falta entre el alcance M0 estrictamente no autoritativo ya elegido y la regla existente de que el estado ausente no autoriza por sí solo la creación. No seleccionar una solución técnica ni crear una autoridad.

## Evidencia canónica conciliada

1. La línea de meta M0 define el núcleo como no autoritativo y exige un protocolo aprobado para raíz ausente, concurrencia, interrupción y estado parcial. Completar M0 no concede autoridad constitucional ni permiso de efectos protegidos.
2. El propietario eligió Opción A como alcance: estudiar almacenamiento local M0 acotado y estrictamente no autoritativo. Esta elección no demuestra que un objeto concreto cumpla esa propiedad.
3. La decisión de estado ausente y la propuesta de bootstrap requieren que, si el destino está ausente y no se ha demostrado la autoridad aplicable, no se cree.
4. STEP 7 indica que el Constitution Authority Context deriva de una Trust Foundation ya reconocida y que su implementación debe detenerse hasta que esa base esté definida y atacada.
5. La propuesta de bootstrap reconoce que el owner semántico constitucional más cercano no cubre explícitamente la legitimidad de crear almacenamiento local y que no debe ampliarse por analogía ni duplicarse como `BootstrapAuthority`.

## Distinción que evita una falsa resolución

Hay dos afirmaciones distintas:

- **Límite de capacidad:** el objeto M0 no establece ni modifica raíz, autoridad constitucional, política, permisos o estado protegido; tampoco puede habilitar admisión, PREPARED, dispatch, reconciliación ni efectos.
- **Legitimidad de la operación:** existe una regla canónica que permite a un actor invocar la primera creación de ese objeto concreto, bajo condiciones explícitas y verificables.

Probar la primera afirmación no prueba automáticamente la segunda. La elección de alcance A no es una autorización de primera creación. A la inversa, una invocación explícita del propietario no demuestra por sí sola aislamiento de consumidores, exclusión de escritores ni correcta semántica de persistencia.

## Decisión pendiente exacta

Antes de cualquier implementación debe resolverse, mediante el owner canónico de decisiones, cuál de estas condiciones rige:

- **Condición 1 — autorización específica requerida:** la primera creación espera hasta que exista una base canónica explícita y técnicamente reconocida que cubra esta operación local no autoritativa. Si esa base no existe, se mantiene STOP/UNKNOWN.
- **Condición 2 — operación local limitada con autorización normativa separada:** solo sería admisible si el contrato canónico existente permite expresamente que una autorización humana/operativa previa habilite la creación de ese objeto no autoritativo, define cómo se reconoce esa autorización sin autodeclaración del caller y excluye todos los efectos protegidos. Los documentos examinados no demuestran que esa condición esté hoy definida ni implementada.

Estas son formulaciones de la brecha decisional, no opciones aceptadas ni una recomendación para saltarse el gate. No se debe escoger una por inferencia. Si ninguna condición está cubierta por un registro de decisiones aceptado, solicitar una decisión explícita del propietario antes de congelar el contrato; no crear una raíz paralela ni convertir el actor que invoca en autoridad técnica implícita.

## Evidencia requerida después de la decisión

La decisión normativa no sustituye la evidencia técnica. Para considerar P01-A/G resueltas todavía sería necesario:

1. Identificar el objeto exacto y su esquema inicial, con propiedades negativas comprobables.
2. Trazar todos los consumidores relevantes y demostrar que el estado inicial no se interpreta como raíz, credencial, policy, permiso o habilitación de efectos.
3. Especificar la frontera protegida que reconoce la precondición de creación, con procedencia y alcance vinculados al objeto/operación concretos.
4. Mantener ausencia, validez, corrupción, error de lectura, conflicto y UNKNOWN como resultados distintos; no sobrescribir bytes existentes inválidos.
5. Resolver quiescencia y exclusión para escritores relevantes antes de escoger una primitiva de concurrencia.
6. Solo tras congelar contrato y obtener autorización separada, diseñar pruebas adversariales y evidencia CI sobre el SHA exacto.

## Resultado

La decisión de alcance M0 está registrada; la legitimidad operacional de la primera creación no está resuelta. No hay base para reinterpretar Opción A como permiso para inicializar, ni para usar el contrato constitucional como si cubriera el caso local.

## Estado canónico

M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-A/P01-G `OPEN / UNKNOWN`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad raíz `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.

Documento analítico únicamente. Sin cambios ejecutables, tests, workflows ni configuración; no se ejecutaron pruebas, CI o Actions.
