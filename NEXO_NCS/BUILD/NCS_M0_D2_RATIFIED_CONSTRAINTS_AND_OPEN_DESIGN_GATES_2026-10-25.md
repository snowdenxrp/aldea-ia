# NCS M0 — restricciones D2 ratificadas y puertas de diseño abiertas
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Estado: DOCUMENTO DE DISEÑO — NO AUTORIZA IMPLEMENTACIÓN

## 1. Propósito

Consolidar las restricciones D2 ya ratificadas por el propietario con los puntos que siguen abiertos en los documentos D2 existentes. No propone una nueva primitiva, marcador persistente, cola, retry de negocio, transacción ni mecanismo de recuperación. No sustituye las matrices de transición ni de cuarentena.

Fuentes de contraste:
- `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, §8.1–8.2 (ratificación O-08…O-11 y decisiones P-01…P-10).
- `NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md`, blob revisado `bfa38a057033acf880afe331a47bb383e82e9a97`.
- `NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md`, blob revisado `2bdfb593c04bd52ecdeb052934525eba006f6c16`.
- `NCS_M0_D0_D1_ROOT_CONTRACT_RECONCILIATION_2026-10-25.md`.

## 2. Restricciones normativas para cualquier diseño D2

1. **Una sola raíz explícita** según O-08. La admisión debe operar sobre la raíz validada/canonicalizada; la raíz o el lock no constituyen autoridad constitucional.
2. **Admisión antes de lectura persistente** para consultas, previews y Chronicle dentro del alcance definido (O-10). Read-only no es excepción automática.
3. **Sin lock anidado ni deadlock padre/hijo.** El contrato actual recomienda que el proceso Chronicle que ejecuta append sea dueño de la admisión si el padre delega mediante `spawnSync`; el hijo debe poder validar la raíz por sí mismo. La propiedad efectiva aún requiere implementación y prueba.
4. **Resultado de negocio/persistencia separado del resultado del lock.** Persistencia confirmada + release incierto conserva el hecho de persistencia confirmado, pero no permite reportar liberación limpia ni reejecutar el negocio.
5. **Release incierto = UNKNOWN/BLOCKED.** No retry automático del negocio y no readmisión hasta resolver la incertidumbre (O-11). Esto no impone congelación permanente ni autoriza recuperación automática.
6. **No borrar automáticamente stale ni locks ajenos.** Edad/PID no son prueba suficiente de que sea seguro borrar. La retirada debe evitar alcanzar un lock reemplazado.
7. **No introducir infraestructura nueva por conveniencia documental.** Nada de marcadores persistentes, lock hermano, IDs, colas, retries de negocio o transacciones nuevas sin decisión y necesidad demostrada.
8. **Preservar las semánticas existentes.** Continuity y Chronicle difieren en su comportamiento de release; no unificar ni cambiar esas semánticas sin caracterización verificable.

## 3. Puertas de diseño que siguen abiertas

| Puerta | Pendiente concreto | Qué no se debe afirmar mientras siga abierta |
|---|---|---|
| P-01 Bootstrap | Procedimiento explícito, quiescencia y recuperación de inicialización parcial. | Que la creación inicial es segura o que ausencia de store significa instancia nueva. |
| P-03 Alcance de admisión | Límite exacto desde antes de la primera lectura persistente hasta el final del uso del snapshot, incluyendo callers y API pública. | Que una query/preview está protegida por ser de solo lectura o que todos los callers pasan por admisión. |
| P-04 Propiedad/composición | Caracterización de locks per-store; dueño único de lock de instancia en cada flujo; no reentrada; proceso Chronicle directo. | Que el padre protege al hijo, que heredar argumentos demuestra admisión o que la API de instancia ya cubre todos los callers. |
| P-05 Cuarentena/readmisión | Evidencia verificable de que el actor previo ya no puede modificar el estado protegido; tratamiento de release vivo, path reemplazado y actor desconocido. | Que una variable local coordina otros procesos o que path ausente equivale a release seguro. |
| P-06 Timeout/stale | Política aprobada de presupuesto, estados stale y recuperación explícita. | Que los candidatos 2.000 ms / 10 ms / 60 s son política aprobada, o que PID/edad autorizan borrar. |
| P-07 Filesystem/alias | Casos admitidos/rechazados y límites explícitos de `realpath`, symlinks, mounts y TOCTOU. | Garantía frente a procesos hostiles o todos los alias de filesystem. |
| P-08 Compatibilidad | Gramática final de CLI, flags de bootstrap y rechazo de rutas legacy contradictorias. | Que argumentos actuales son compatibles con root o que existe fallback seguro. |
| P-09 Callers | Resolver aristas externas/dinámicas/indirectas contra snapshot exacto. | Inventario exhaustivo o ausencia de bypass basada en grep parcial. |

## 4. Release incierto: criterio conservador de lectura

La matriz actual describe cuarentena local y recuperación explícita, pero el alcance multi-proceso y la prueba de readmisión no están cerrados. Deben permanecer separados:
- resultado de negocio;
- resultado de persistencia observado;
- estado de propiedad/liberación del lock;
- permiso para una operación nueva.

No deducir una transición a estado admitido a partir de un timeout, de la edad del directorio, de un PID aparentemente muerto, de un fallo de lectura, de una ruta ausente aislada ni de una bandera local. Si el protocolo aprobado no puede demostrar la resolución, permanecer `UNKNOWN/BLOCKED`. Este documento no selecciona el mecanismo de recuperación.

## 5. Orden mínimo para continuar sin repetir auditorías

1. Cerrar en D1 el conjunto concreto de entrypoints/callers y la regla semántica de admisión previa a lectura.
2. Para D2, comparar el protocolo de raíz propuesto con las dos implementaciones de lock existentes y sus diferencias de release; no unificarlas todavía.
3. Definir la evidencia de identidad del lock durante retirada/reemplazo y la condición segura de readmisión, sin introducir mecanismos persistentes nuevos por defecto.
4. Cerrar la gramática root/Chronicle y el propietario único del lock por flujo; conservar la operación hija directamente invocable.
5. Después de cerrar diseño, solicitar autorización separada antes de runtime/tests/workflows y ejecutar pruebas de concurrencia/release únicamente bajo esa autorización.

No repetir el barrido histórico de 188 archivos salvo cambio de fuente o necesidad concreta de recuperar una arista identificada. No pedir auditoría general a Claude/Gemini; cualquier consulta externa debe ser puntual y contrastable con el snapshot fuente.

## 6. Estado canónico

- M0: `INCOMPLETO`
- D0: `OPEN` por detalles técnicos/evidencia; O-08 no se reabre.
- D1-DESIGN: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- D2/D3: `OPEN`
- Authorization: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`

No se modificaron runtime, tests, workflows ni datos operativos. No se ejecutaron tests ni CI. Este documento consolida restricciones y puertas pendientes; no acredita cumplimiento.
