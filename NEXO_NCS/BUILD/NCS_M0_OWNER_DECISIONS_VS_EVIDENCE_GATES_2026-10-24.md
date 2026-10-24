# NCS M0 — tabla de cierre: decisiones del propietario vs gates de evidencia
Fecha: 2026-10-24
Rama: `ncs-clean-architecture`
Estado: **ÍNDICE DE DECISIONES PENDIENTES — NO ACEPTA OPCIONES — SIN IMPLEMENTACIÓN**

## 1. Regla de lectura

Esta tabla consolida paquetes de decisión existentes; no reabre el censo de callers ni sustituye los ledgers. “Decisión del propietario” significa que una recomendación técnica no puede convertirse en contrato aceptado sin aprobación. “Gate de evidencia” significa que incluso después de decidir la política debe existir prueba/medición operacional. Algunas filas requieren ambos.

## 2. Decisiones del propietario que bloquean el congelamiento de diseño

| ID | Decisión requerida | Recomendación registrada (no aceptada) | Qué no debe inferirse |
|---|---|---|---|
| D1-S0 | Secuencia diseño/implementación de D1 | Separar D1-DESIGN de D1-IMPLEMENTATION; codificar/ejecutar tests después de congelar diseño y con autorización separada. | No autoriza escribir el test arquitectónico todavía. |
| D0-C1 | Interfaz única para raíz de instancia | `--root` explícito; sin fallback de env/rutas legacy en primera versión. | No está aprobado el contrato de argumentos ni la propagación al hijo. |
| D0-C2 | Primer bootstrap y recuperación de `BOOTSTRAP_PARTIAL` | Operación normal no crea ni repara; bootstrap separado, explícito y preservador. | “Explícito” no demuestra actor autorizado, integridad o estado recuperable. |
| D0-C3 | Alias, canonicalización, symlinks y tipos reservados | Resolver raíz existente y definir caso por caso; bloquear ambigüedad. | No está aprobada la prohibición universal de symlinks. |
| D0-C4 / D3-C1 | Migración legacy, cutover y rollback | Dry-run, inventario, copia/verificación, cutover explícito, origen preservado; sin dual-write ni merge heurístico. | No está aprobado un procedimiento para un entorno concreto ni se probó quiescencia. |
| D2-C1 | Alcance de admisión y snapshot | Adquirir antes de la primera lectura protegida y conservar la admisión durante el uso/writes derivados; alternativa exige conflicto por revisión explícito. | No está fijado el alcance final de lecturas, previews y snapshots retenidos. |
| D2-C2 | Primitiva de lock raíz y relación con locks por-store | Caracterizar ambos stores antes de decidir; preservar locks por-store. | No autoriza unificar/refactorizar locks por similitud superficial. |
| D2-C3 | Estados, timeout, release incierto y recuperación | Fail-closed; no robo automático de stale; no retry de negocio; recuperación explícita. | No está elegida la técnica para retirar lock sin alcanzar reemplazos ni el criterio final de re-admisión. |
| D2-C4 | Frontera padre/hijo Chronicle | El hijo directamente ejecutable valida root y adquiere admisión propia; el padre no retiene el mismo lock durante `spawnSync`. | No está probada la cobertura de todas las entradas ni la ausencia de deadlock. |
| D3-C2 | Garantías prometidas por el lock | Exclusión entre procesos cooperantes; no autoridad, sandbox, cuota exacta ni durabilidad no demostrada. | No deben publicarse garantías más fuertes que la evidencia. |

## 3. Gates de evidencia que siguen abiertos aunque las decisiones se aprueben

| Gate | Evidencia mínima pendiente | No equivale a |
|---|---|---|
| D1-DESIGN | Grafo transitivo reproducible, resolución de imports/reexports/procesos, allowlist y UNKNOWN/BLOCKED para edges no resueltos. | Test ejecutado o runtime implementado. |
| D2 ownership/release | Pruebas deterministas de reemplazo entre validación y retirada; retry de Continuity; limpieza fallida de owner sin borrar reemplazo; persistencia y release reportados por separado. | Cierre de recuperación/bootstrap. |
| D2 admisión cross-process | Dos procesos compitiendo en primer uso/bootstrap, sin doble inicialización, bypass ni re-admisión mientras un actor previo pueda afectar el path. | Autoridad constitucional o autorización de efectos. |
| D0-C3 rutas | Fixtures para raíz/store/lock/owner symlink, destino externo, ruta rota, colisiones de tipo y temporales, según política aprobada. | Defensa general contra TOCTOU hostil, mounts o actores locales maliciosos. |
| D0-C2 recuperación | Interrupción/crash por fase, datos contradictorios, store ausente/corrupto, preservación y segundo proceso; evidencia de recuperación autorizada. | Crear una instancia nueva por inferencia. |
| D3 cutover | Perfil de entorno identificado, mecanismo que suspenda/prevenga relanzamientos, quiescencia demostrada, huellas comparadas inmediatamente antes de cutover y rollback sin merge. | Una captura de procesos o hashes aislados. |
| Recursos | Contrato/medición de heap agregado y cuota total de disco, por separado del lock. | Límites por documento o exclusión mutua. |
| CI | Logs/jobs ligados al SHA exacto que incluya el cambio y sus tests. | Que tests propuestos pero no escritos ya pasaron. |

## 4. Orden mínimo sin duplicación

1. Resolver las decisiones propietarias D1-S0 y D0-C1…C4 como conjunto coherente.
2. Congelar D2-C1…C4 incluyendo política de release incierto y re-admisión; no implementar antes de elegir el modelo.
3. Identificar el entorno y resolver D3 con evidencia operacional, no solo con más documentos.
4. Tras autorización explícita separada, implementar los tests adversariales y de arquitectura que correspondan a los contratos aprobados.
5. Ejecutar CI y ligar el resultado al SHA exacto de código + tests.
6. Cerrar cada gate solo con evidencia; no declarar M0 terminado hasta satisfacer la línea de meta que se defina.

## 5. Estado canónico

M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Este índice no modifica runtime/tests/workflows ni autoriza efectos.
