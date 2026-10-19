# NCS — HANDOFF COMPLETO PARA CHAT NUEVO (2026-10-19)

**Misión invariable: M0.** Este documento es la continuidad de trabajo para abrir un chat nuevo. Leer primero `NEXO_NCS/STATUS.md`, después este handoff y los documentos concretos enlazados aquí. No reiniciar investigación ni volver a auditar cierres sin un fallo nuevo y reproducible.

## 1. Repositorio y reglas de trabajo

- Repositorio: `snowdenxrp/aldea-ia`.
- Rama: `ncs-clean-architecture`.
- Entrada operativa: `NEXO_NCS/STATUS.md`.
- Estructura preferida: `MASTER/ CORE/ BUILD/ RESEARCH/ DECISIONS/ PROOF/ STATUS`; STATUS es la puerta de entrada.
- Principio: Nexo no se mezcla con Lúmina. Modelo ≠ Nexo; OS ≠ Nexo; dispositivo ≠ Nexo; Lúmina ≠ Nexo.
- No inventar raíces, credenciales, IDs, tokens, epochs, colas, quorums, recuperaciones o pruebas que no existan. No convertir datos suministrados por el caller en evidencia de autoridad.
- Evidencia: trigger → run → job → SHA → artefacto/log → interpretación. Un resultado no observado o sin vínculo suficiente queda UNKNOWN/PENDING, nunca PASS.
- Arquitectura limpia; no apilar parches. Si el cambio revela un defecto de raíz, detenerse y resolver la causa.
- No requerir PC, impresora, instalaciones o compras para continuar si el siguiente paso se puede ejecutar desde el repo/CI. El usuario trabaja principalmente desde Android.
- El usuario delega decisiones técnicas de ejecución, pero no se deben dar decisiones de arquitectura por aceptadas si no están documentadas y justificadas.
- No repetir la misma explicación ni reabrir auditorías cerradas sin evidencia nueva.

## 2. Decisión nueva aceptada en este chat: raíz única y un dispositivo inicial

Documento canónico:
`NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md`

URL:
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md

Blob SHA verificado: `dfb647d07cb28178b3c8a3a8289d8209943db8fd`. Commit documental registrado al crearla: `f6894c51b5a0aa1ced848ab1481ecd40ab995d5d`.

Decisión aceptada:
1. La primera versión de Nexo tendrá **una llave raíz criptográfica de bootstrap** para iniciar el reconocimiento de la autoridad legítima.
2. Se construirá inicialmente para **un solo dispositivo**. No implementar ahora coordinación ni sincronización multi-dispositivo.
3. La pérdida irrecuperable de la única llave puede dejar Nexo inaccesible. Recuperación avanzada, múltiples raíces/dispositivos y sucesión quedan fuera del alcance inicial. No fingir recuperación desde snapshots, cuenta, modelo, teléfono, OS o proveedor.
4. La llave **no** concede autorización ilimitada. Cada operación protegida necesita autorización acotada, vigencia/revocación y enforcement en la última frontera antes del efecto.
5. La llave física/modelo, protocolo y procedimiento de provisión todavía **no están seleccionados, adquiridos ni configurados**. La decisión es de alcance, no evidencia de implementación.
6. Esta decisión reduce el alcance, no reinicia M0. Los contratos y pruebas existentes se conservan.
7. No tratar el teléfono ni el modelo como raíz por defecto. Estado restaurado no puede autenticarse a sí mismo.
8. Multi-dispositivo, sucesión y recuperación avanzada son requisitos futuros, no bloqueos para la primera versión.

## 3. Estado de M0 — verdad vigente

- **M0 global: INCOMPLETO.**
- **Efectos protegidos: STOP.**
- **Autoridad de runtime: NOT_EVALUATED.**
- Nexo y Lúmina permanecen separados.
- No declarar Nexo listo ni habilitar efectos protegidos por un PASS de pruebas de regresión.

### CI integrado observado

- Gate integrado de aceptación: [run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), SHA probado `c57be8aa6fd7e558d870c3e46feab741637b4314`, workflow `.github/workflows/nexo-m0-acceptance.yml`. Cinco grupos SUCCESS: admisión/store, reconstrucción/transición protegida, Chronicle/entrypoints, crash cuts/recuperación de propietario y goal verification/outcome classification.
- Transparencia de Chronicle: [run 39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874), SHA probado `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; workflow integrado SUCCESS. Chronicle específico [run 39292887749](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887749) también SUCCESS.
- Estos PASS son para los tests y SHAs enumerados. No demuestran raíz constitucional, autorización legítima, durabilidad física general ni integridad contra todo rollback/tampering.
- La API pública de Chronicle conserva explícitamente `authorization: "NOT_EVALUATED"` en resultados normalizados, rechazos tempranos y conflicto de admisión. Código vinculado a commits `aa8509e75dd7925189d54b2667bcdd2ae27e6647` y `2faf2b988c676dc907c9322f5e63be36200af97b`; regresión `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`.
- La corrección de integración de `reconstructNexoMissionFromSnapshot()` está en `82f1204ae4e9298163231ab7a323233ad87777b8`; devuelve misión directamente o null. PASS focal observado en [run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361).
- Workflow Chronicle con integración de entrypoint: [run 39291153543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291153543), SHA `7f83195657df829d993226cf909c8f76f655d23b`, SUCCESS.

## 4. Documentos existentes que se deben reutilizar

1. Estado principal: `NEXO_NCS/STATUS.md`.
2. Handoff previo: `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-19.md` (blob SHA observado `c2089523abe4a40da3c12314c9cc1a0f4dcba5ee)).
3. Brecha de autoridad: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_ADMISSION_GAP_2026-10-19.md` (SHA `050e9e8c172f4f42c2b39149e71b439876ccfc02`).
4. Borrador semántico de composición de autoridad: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md` (blob SHA observado `dd425b6c362f6dcece2f25685afb32e9fe7731d9`; corrección de contenido documentada en commit `c83a864232793e963a7a99fb88fc313f4f1a48ca)).
5. Inventario de claims y dominios de fallo: `NEXO_NCS/BUILD/NCS_M0_DEPLOYMENT_CLAIM_FAILURE_DOMAIN_INVENTORY_2026-10-19.md` (commits `194c6b8868e4632dfb909b14112ca19f10e28fe6` y `5aeb504d0d324030f0db2966c54bdb59cfdda5fd`).
6. Comparación preliminar de familias de reconocimiento: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_RECOGNITION_FAMILY_COMPARISON_PRELIMINARY_2026-10-19.md` (commit `d8108ae84d965dce0b3008f7aed56a22ca3f32f5)); **solo referencia**, no volver a investigar familias de forma genérica.
7. Criterios ejecutables M0: `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_EXECUTABLE_2026-10-19.md`.

## 5. Brecha arquitectónica de autoridad ya confirmada

- `createNexoContinuityOwner()` no recibe ni valida una raíz, principal autenticado, decisión de autorización o época/fencing de autoridad.
- Algunos resultados públicos devuelven explícitamente `authorization: "NOT_EVALUATED"`.
- `executeNexoStepWithContinuityOwner()` comprueba capacidades y readiness, pero no prueba autorización legítima del propietario antes de PREPARED/dispatch.
- `runNexoChronicleAppend()` es una ruta local de persistencia/replay, no prueba una ruta de efecto protegido autorizada por raíz constitucional.
- Capacidad técnica ≠ autorización. Misión ejecutable ≠ propietario legítimo. Settlement consistente ≠ permiso. Tests PASS ≠ autoridad constitucional.
- No crear `createConstitutionAuthorityContext(input)` ni equivalente si solo convierte campos no autenticados del caller en prueba. No simular una raíz ni autorización con fixtures que afirman `AUTHORIZED`.
- No conectar Chronicle con efectos externos, financieros, irreversibles, reparación de estado externo o cambios constitucionales.
- El contrato semántico distingue: ROOT COMPOSITION → CURRENT AUTHORITY → AUTHORIZATION DECISION → PROTECTED EFFECT ADMISSION → EFFECT OUTCOME/RECONCILIATION. Cada capa necesita evidencia propia.
- Reutilizar los vocabularios canónicos existentes: bootstrap `ESTABLISHED / UNKNOWN / INVALID`; condiciones de recuperación `AUTHORITY_UNAVAILABLE / AUTHORITY_UNRESOLVED`; y distinción de autorización `STALE / REVOKED`. No crear un enum agregado ni estados nuevos por conveniencia.
- En la frontera final, falta demostrar vigencia y enforcement de revocación; validar al inicio y reutilizar permiso indefinidamente no basta. UNKNOWN o revocación/frescura no demostrada ⇒ STOP.

## 6. Próximo paso exacto — continuar M0 sin desviarse

La última revisión de `STATUS.md` marca como siguiente trabajo comprobar la coherencia entre misión persistida, pasos y reconstrucción/proyección. **Antes de tocar más código, recuperar el estado real de CI para `continuity-queries.mjs` y su regresión**:

1. Revisar en GitHub Actions el workflow `.github/workflows/nexo-m0-mission-status.yml` en la rama `ncs-clean-architecture`, verificando run, job, logs y SHA exacto que contiene la corrección `82f1204ae4e9298163231ab7a323233ad87777b8` y los cambios actuales de `continuity-queries.mjs`/test. No asumir que un commit documental demuestra el test.
2. Si el workflow pasa, registrar el run ID y SHA real en STATUS y en el handoff; si falla, corregir solo la causa reproducida a partir del log. No retirar ni debilitar assertions para conseguir verde.
3. El test relevante asegura que `loadNexoMissionStatus()` compare estado persistido y reconstruido a partir de una sola lectura canónica, exponga `persistedMissionStatus`, `missionStatus` y `statusDiscrepancy`, no filtre `target/content` y no escriba en el store. Hay un caso de misión persistida `completed` con paso `planned`.
4. Después del CI, continuar el siguiente defecto M0 verificable de coherencia/recuperación. No reabrir la discrepancia ya cerrada de replay/`recordOutcome()`, la API de reconstructor ni la transparencia Chronicle salvo regresión nueva.
5. Mantener en paralelo la brecha de autoridad como bloqueo arquitectónico real: revisar el borrador semántico contra la decisión de raíz única + dispositivo único y concretar qué evidencia del arranque y qué frontera final pueden implementarse de verdad. No volver a hacer una investigación general de familias ni exigir recuperar multi-dispositivo/sucesión ahora.
6. Implementar solo cuando la composición sea justificable con evidencia; añadir tests adversariales y CI observado. Si sigue faltando evidencia independiente, documentar el único gap real y mantener autoridad `NOT_EVALUATED`, M0 INCOMPLETO y efectos protegidos STOP.

## 7. No repetir / no hacer

- No volver a M1, STEP 7 ni investigación amplia de raíz como tarea principal.
- No reabrir auditorías cerradas sin un fallo nuevo, específico y reproducible.
- No declarar que una llave física ya fue comprada, seleccionada o configurada.
- No tratar el teléfono, OS, modelo, proveedor, store, snapshot o una prueba generada por caller como raíz por defecto.
- No inferir autorización de Chronicle, de settlement, de `completed`, de coherencia de replay ni de CI PASS.
- No implementar multi-dispositivo, sucesión o recuperación avanzada dentro del alcance inicial.
- No cambiar la misión: **M0 es la meta**.

## 8. Estado al cierre de este handoff

**M0: INCOMPLETO. Autoridad: NOT_EVALUATED/PENDING. Efectos protegidos: STOP. Nexo/Lúmina: separados.**  
Nueva decisión de alcance guardada en DECISIONS. Próxima acción operativa: verificar CI real de mission-status/continuity-queries, luego seguir la siguiente frontera M0 con evidencia, sin reiniciar investigación.
