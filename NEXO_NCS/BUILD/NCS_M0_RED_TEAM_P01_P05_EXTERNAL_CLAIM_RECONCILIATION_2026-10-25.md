# NCS M0 — reconciliación red-team documental P-01…P-05
Fecha: 2026-10-25
Repositorio: `snowdenxrp/aldea-ia`
Rama de referencia: `ncs-clean-architecture`
Alcance: contraste de la taxonomía propuesta en el red-team externo con contratos y fuentes documentales ya presentes. Inspección documental/estática; no es una auditoría completa de runtime.

## 1. Resultado ejecutivo

El red-team externo formula hipótesis razonables de seguridad, pero sus etiquetas P-02…P-05 **no coinciden plenamente con la división documentada actualmente en NCS**. No se deben incorporar sus nombres de fase como si fueran el significado canónico de los problemas del repositorio.

En los artefactos revisados, la división operativa actual es:
- **P-02 / D1:** separación de responsabilidades y entrypoints Nexo–Lúmina.
- **P-03 / D2:** alcance de admisión antes de la primera lectura persistente y durante el uso del snapshot.
- **P-04 / D2:** propiedad de admisión por flujo, composición con locks per-store y prevención de reentrada/deadlock padre-hijo.
- **P-05 / D2:** incertidumbre en release y evidencia necesaria para readmisión.
- La transición `BOOTSTRAP_PARTIAL → ROOT_READY` pertenece a la revisión de bootstrap parcial/recuperación y a decisiones relacionadas con P-01; no queda resuelta por renombrarla “promoción transaccional P-02”.

Por tanto, los cuatro estados “UNKNOWN” del texto externo son válidos como **estado de verificación de sus hipótesis concretas**, pero no prueban que esos mismos temas sean los requisitos contractuales de P-02…P-05 en la rama.

## 2. Mapa de correspondencia

| Afirmación del red-team externo | Evidencia documental actual | Clasificación correcta |
|---|---|---|
| P-02 = promoción transaccional ROOT_READY, barrera idempotente y no retry ciego | La revisión de bootstrap confirma que no hay predicados completos ratificados para `BOOTSTRAP_PARTIAL → ROOT_READY`; la matriz A/B/C/D no selecciona protocolo. P-02 en el mapa D1 se ocupa de separación Nexo/Lúmina. | **PARCIALMENTE ALINEADO / ETIQUETA DISTINTA.** La transición de bootstrap está abierta; “barrera transaccional idempotente” no está ratificada como mecanismo. |
| P-03 = IPC/sockets y registro de actores bajo nueva época | La especificación P-03 define admisión antes de la primera lectura persistente cubierta, durante la vida del snapshot y hasta completar su uso/escrituras. No se ha establecido aquí que una “época de raíz”, sockets o un router de actores formen parte del diseño inicial. | **UNKNOWN como hipótesis de IPC; NO ES EL CONTRATO P-03 ACTUAL.** No introducir época/registro de actores sin evidencia de necesidad y decisión explícita. |
| P-04 = rollback atómico a snapshot criptográfico o PANIC/HALT | La especificación P-04 trata el dueño de admisión por flujo, composición con locks existentes y reentrada padre/hijo. El documento de bootstrap exige definir integridad y salida, pero no ratifica snapshot criptográfico ni rollback atómico. | **UNKNOWN como mecanismo de recuperación; NO ES EL CONTRATO P-04 ACTUAL.** HALT/STOP puede ser resultado fail-closed, pero no se debe afirmar que un protocolo PANIC/HALT completo esté implementado. |
| P-05 = shutdown con ACK síncrono de todos los componentes antes de liberar locks | P-05 actual distingue resultado de negocio/persistencia, resultado de release y readmisión. No se ha demostrado un contrato general de cierre de todos los componentes ni un mecanismo de ACK de sincronización. | **UNKNOWN como requisito de shutdown; NO ES EL CONTRATO P-05 ACTUAL.** Mantener la exigencia documentada de release/readmisión sin convertir ACKs nuevos en mecanismo obligatorio. |

## 3. Evidencia documental inspeccionada

1. `NEXO_NCS/BUILD/NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md`, blob `baa28e3b868aa0262b9aa9edd837d06938aacd4d`.
   - §2 identifica O-08/O-10/O-11 como restricciones ya ratificadas.
   - §3 define P-03: admisión antes de la primera lectura de contenido persistente cubierto y mantenida durante el uso del snapshot.
   - §4 define P-04: propietario único de admisión por flujo, relación con locks per-store y prevención de deadlock padre/hijo.
   - §6 conserva abiertas P-03/P-04/P-05 y la cobertura de callers.

2. `NEXO_NCS/BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`, blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`.
   - §2 separa persistencia, release y readmisión.
   - §3 prohíbe inferir release seguro por ausencia del path y prohíbe retry de negocio para ocultar incertidumbre.
   - §4 deja las alternativas de recuperación A/B sin seleccionar; permite mantener `UNKNOWN/BLOCKED`.
   - §5 fija E1–E9 como requisitos propuestos, no como pruebas ejecutadas.

3. `NEXO_NCS/BUILD/NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md`, blob `e184a52033e265021ee66d6b020fecab6024ed2a`.
   - §2 confirma que `BOOTSTRAP_PARTIAL → ROOT_READY` carece de predicados completos ratificados.
   - §3 advierte que “Opción A” de raíz y “Opción A” de bootstrap offline son decisiones distintas.
   - §4 enumera predicados pendientes: identidad/estado, quiescencia, integridad, pertenencia/autoridad, release anterior y resultados de salida.
   - §6 exige decisión explícita del propietario y separación entre cierre de diseño e implementación autorizada.

4. `NEXO_NCS/BUILD/NCS_M0_NEXO_LUMINA_SEPARATION_CONTRACT_2026-10-24.md`, blob `b22c27aa8556034f88d91703d6a57642cae579af`.
   - Define D1 como separación de responsabilidades/entrypoints, persistencia legítima de Lúmina y migración explícita. No declara implementada la separación.

## 4. Red-team técnico: qué sí queda como pregunta válida

### 4.1 Integridad y promoción de bootstrap
Pregunta válida: ¿qué predicados completos y verificables autorizan declarar `ROOT_READY` tras bootstrap parcial, y qué evidencia impide sobreescribir estado previo ambiguo?
Estado: **OPEN / UNKNOWN**. No se ratifica transacción idempotente, snapshot, retry ni rollback como mecanismo.

### 4.2 Admisión de procesos y canales
Pregunta válida: ¿todo caller que lee stores persistentes queda admitido antes de la lectura y mantiene la admisión durante el uso del snapshot? ¿Están clasificados todos los callers y procesos?
Estado: **OPEN / UNKNOWN** para cobertura global. La especificación P-03/P-04 ya cubre la frontera de admisión; la existencia de IPC/socket/daemon y una época de actores en el entorno inicial no queda demostrada en los artefactos aquí revisados.

### 4.3 Recuperación y no corrupción
Pregunta válida: ¿la recuperación conserva estado ambiguo, evita destruir objetos sustitutos y solo readmite cuando el criterio aprobado tiene evidencia suficiente?
Estado: **OPEN / UNKNOWN**. P-05 cubre incertidumbre de release/readmisión; la política de bootstrap y sus predicados de integridad siguen abiertos. Snapshot criptográfico y rollback atómico no están ratificados.

### 4.4 Cierre y auditoría
Pregunta válida: ¿qué significa “operación completada” cuando persistencia y liberación del lock tienen resultados diferentes, y qué evidencia permite readmisión?
Estado: **P-05 parcialmente especificado a nivel de release/readmisión; shutdown global/ACK de todos los componentes UNKNOWN**. No inferir que el ACK síncrono propuesto existe ni añadirlo por defecto.

## 5. Mecanismos no adoptados por este informe

No se adoptan ni prescriben:
- epochs/generaciones persistentes de raíz;
- barreras o wrappers transaccionales nuevos;
- IPC, sockets, daemons o un router de actores no demostrados;
- snapshots criptográficos, rollback automático o auto-reparación;
- protocolo PANIC/HALT más allá del estado fail-closed ya exigido;
- ACKs síncronos globales, colas, retries, IDs, marcadores o locks nuevos.

Cada mecanismo requeriría demostrar una necesidad contractual concreta, describir sus límites y recibir la decisión/autorización correspondiente. “Red-team sugirió” no equivale a “NCS lo ratificó”.

## 6. Conclusión y gates

El red-team aporta cuatro líneas de preguntas útiles, pero mezcla esos riesgos con etiquetas P-02…P-05 distintas de las que usan los documentos NCS. Debe conservarse como crítica conceptual y no como auditoría de código.

- M0: `INCOMPLETO`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Solo contraste documental. No se modificaron runtime, tests, workflows ni datos operativos. No se ejecutaron tests/CI. No se declara vulnerabilidad, aislamiento, autoridad, rollback ni cierre global verificados.
