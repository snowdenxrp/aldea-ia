# NCS M0 — D0-C2/D2: frontera de recuperación de bootstrap parcial

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **GAP DE CONTRATO — PROPUESTA DOCUMENTAL — SIN IMPLEMENTACIÓN**

## 1. Hallazgo

La matriz de estados D2 define `BOOTSTRAP_PARTIAL` como `UNKNOWN/BLOCKED` y exige recuperación explícita con evidencia de integridad. Las opciones D0-C2 preguntan quién puede ejecutar esa recuperación, pero no seleccionan un actor, alcance de permisos ni un criterio verificable para distinguir una instancia nueva de una raíz preexistente parcialmente inicializada.

La palabra “explícita” solo describe el disparador. No demuestra que la persona/proceso tenga autoridad para alterar datos, ni que los datos puedan descartarse o reinicializarse.

## 2. Separaciones obligatorias

- **Detección:** reconocer ausencia, parcialidad, corrupción o ambigüedad de raíz/stores sin inferir “instancia nueva”.
- **Autorización de recuperación:** una decisión explícita, vinculada al operador/instalación y al alcance concreto, debe preceder cualquier mutación de recuperación. El mecanismo exacto queda pendiente de D0/D2.
- **Integridad de datos:** inventariar y preservar el estado encontrado; no truncar, reescribir, fusionar ni migrar por inferencia.
- **Autoridad constitucional:** una recuperación técnica no prueba la legitimidad de la raíz ni reemplaza la futura decisión de autoridad de Nexo.
- **Efectos protegidos:** recuperar o admitir una instancia no habilita repair, dispatch, commissioning ni otros efectos protegidos.

No se propone un ID global, marcador persistente, cola, lock externo ni formato de autorización nuevo. Cualquier mecanismo adicional requiere una necesidad demostrada y decisión de diseño separada.

## 3. Contrato mínimo propuesto para cerrar el gap

Antes de implementar recuperación de `BOOTSTRAP_PARTIAL`, D0-C2/D2 debe definir:

1. Qué estados observables se consideran recuperables y cuáles permanecen irrecuperables/UNKNOWN.
2. Qué actor humano/operacional puede autorizar la operación y cómo se registra la aprobación para esa instalación, sin confundirla con la raíz criptográfica legítima.
3. Qué inventario/copia de preservación precede a cualquier escritura y cómo se demuestra que no se sobrescriben datos existentes.
4. Qué operaciones concretas son permitidas por estado, y qué condiciones obligan a abortar.
5. Qué significa recuperación terminada y qué evidencia permite reintentar admisión normal.
6. Cómo se trata un crash durante la propia recuperación, sin caer en un ciclo de reparación automática.
7. Qué pruebas cubren store ausente, store corrupto, owner incompleto, datos contradictorios, crash en cada fase y segundo proceso concurrente.

Si la integridad o la autorización no puede demostrarse, el resultado debe seguir siendo `UNKNOWN/BLOCKED`, preservando los artefactos encontrados.

## 4. Relación con las decisiones abiertas

- D0-C2 sigue siendo decisión del propietario: estrategia de primer bootstrap y recuperación parcial.
- D0-C1 sigue definiendo cómo se identifica/configura la raíz; no se debe resolver el estado parcial usando una ruta alternativa implícita.
- D0-C3 sigue definiendo aliases/symlinks y tipos aceptados; recuperación no debe normalizar paths ambiguos por su cuenta.
- D0-C4/D3 gobiernan la migración legacy; recuperación de bootstrap no es permiso para migrar o fusionar datos legacy.
- D2 debe mantener separados persistencia, release del lock y admisión posterior.
- D1-DESIGN/IMPLEMENTATION y la autorización separada para runtime/tests siguen sin cerrar.

## 5. Estado

Documento de análisis. No cambia contrato normativo, no selecciona una política por el propietario, no modifica runtime/tests/workflows y no ejecuta tests/CI.

Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Continuidad: enlazar este gap en el checkpoint y seguir con consistencia documental, sin reabrir el censo de callers ni implementar mecanismos de recuperación por inferencia.