# NCS M0 — Contrato de correspondencia entre intención y borrador de misión
Fecha: 2026-10-22
Estado: PROPUESTA TÉCNICA DOCUMENTAL — no implementada, no aprobada como Constitución y no habilitante de efectos.

## 1. Propósito y frontera

El punto de entrada `mission-request-preview` ya mantiene separados `intent` y `missionDraft`, y declara `requestInterpretation: NOT_PERFORMED` e `intentDraftAlignment: NOT_EVALUATED`. Este contrato define qué debe demostrarse antes de reemplazar esos estados. No añade un segundo esquema de intención ni sustituye contratos de intención existentes en el corpus Nexo.

## 2. Entradas no confiables

- `intent`: expresión original del solicitante; conservarla como evidencia de entrada sin atribuirle por sí sola autorización.
- `missionDraft`: propuesta estructurada de pasos; es un candidato no confiable, incluso si valida contra el esquema de misión.
- Contexto/contratos existentes: solo pueden aportar restricciones cuya procedencia y versión sean identificables. La ausencia, ambigüedad o contradicción de una restricción no se resuelve inventando datos.

## 3. Resultados separados obligatorios

El proceso debe distinguir, sin colapsarlos:
1. **Validez estructural** del borrador.
2. **Interpretación propuesta** de la intención, incluyendo los supuestos explícitos y los elementos que quedaron sin resolver.
3. **Correspondencia semántica** entre la intención original y cada paso/efecto propuesto.
4. **Autorización** para ejecutar — evaluación separada y fuera de este contrato.

Una misión estructuralmente válida no demuestra correspondencia semántica. Una correspondencia aceptable tampoco demuestra autorización.

## 4. Reglas de decisión fail-closed

- Cualquier ambigüedad material, intención incompleta, conflicto de restricciones, dato inventado o paso/efecto sin justificación trazable produce `UNKNOWN` o rechazo; no produce autorización implícita.
- No omitir, ampliar ni cambiar silenciosamente alcance, destinatario, cantidad, tiempo, condiciones, reversibilidad o efectos externos solicitados.
- La propuesta debe señalar qué fragmento de intención y qué regla/contrato respaldan cada paso y cada efecto relevante. Si la relación no puede demostrarse, queda sin resolver.
- Inferencias y preferencias no equivalen a instrucciones directas, consentimiento ni autorización permanente. Reutilizar las clases y salvaguardas del contrato de intención existente; no redefinirlas aquí.
- Una salida de modelo generativo, si se incorpora en el futuro, es solo una propuesta no confiable. No decide identidad, autoridad, permisos, política ni excepción a la Constitución.
- No convertir el silencio, la falta de datos o la validación del esquema en aprobación.

## 5. Interfaz conceptual mínima

La evaluación futura puede devolver campos equivalentes a:
- `structuralValidation: PASS | FAIL | UNKNOWN`
- `interpretationStatus: NOT_PERFORMED | PROPOSED | UNKNOWN`
- `alignmentStatus: MATCH | MISMATCH | UNKNOWN`
- `unresolvedItems[]`
- `stepEvidence[]` — relación trazable entre paso/efecto, fragmento de intención y regla aplicable
- `authorization: NOT_EVALUATED`

Estos nombres son ilustrativos hasta contrastarlos con los tipos reales del runtime; no se autoriza crear campos incompatibles ni duplicar contratos existentes sin inspeccionar primero sus definiciones.

## 6. Invariantes de aceptación

1. La intención original permanece recuperable como entrada y no se reemplaza por la interpretación.
2. La interpretación propuesta no se presenta como palabras del solicitante.
3. La validez estructural y la correspondencia semántica tienen resultados independientes.
4. Cada paso y efecto relevante tiene trazabilidad; ausencia de evidencia no equivale a correspondencia.
5. Cambiar intención, borrador, reglas o contexto relevante invalida la evaluación de correspondencia anterior.
6. Ningún resultado de este proceso despacha acciones, persiste una misión, altera estado de continuidad ni autoriza efectos protegidos.
7. Las salidas incompletas o desconocidas fallan cerradas sin inventar una política nueva.

## 7. Orden de implementación — no ejecutar todavía sin contrastar tipos existentes

1. Localizar y reutilizar los tipos/contratos existentes de intención y misión; evitar duplicados.
2. Diseñar una función pura de evaluación/propuesta que no persista ni despache.
3. Añadir pruebas para ambigüedad, omisión, ampliación de alcance, efectos no trazables, cambio de entrada y salidas desconocidas.
4. Mantener `authorization: NOT_EVALUATED` y la frontera de ejecución cerrada.
5. Solo declarar implementación tras cambio de runtime y evidencia de pruebas/CI asociada al SHA exacto.

## 8. Comprobación contra el runtime existente (2026-10-22)

Inspección puntual de los archivos de runtime existentes, sin volver a ejecutar pruebas:

- `src/nexo/application/mission-request-preview.mjs` (blob `596dde1c6ed20fac127ee4225ba111fff3d2554`) mantiene `intent` como texto no confiable, no lo pasa al validador de misión y devuelve `requestInterpretation: NOT_PERFORMED` e `intentDraftAlignment: NOT_EVALUATED`.
- `src/nexo/application/continuity-queries.mjs` (blob `ba111f88421f31d0febb75b4c5c02497beddf997`) valida el borrador contra las operaciones canónicas de misión y devuelve una vista previa de planificación; no ofrece evaluación semántica de intención.
- `src/nexo/core/contracts.mjs` (blob `ec811ffd24d178c294345d9e6f65a9e3bfd82ea1`) contiene contratos genéricos de claim, autoridad, validación y commit, pero no un contrato de runtime para interpretar intención.
- El contrato de intención más amplio está documentado en `docs/nexo/PG-009_SEMANTIC_DATA_MIGRATION_INTEGRITY_2026-09-23.md`, incluyendo clases de intención, procedencia, vigencia, confirmación, revocación y los invariantes INV-557..576. Debe reutilizarse como fuente de diseño; su presencia documental no prueba que esté implementado en el runtime.

**Consecuencia:** no asumir que el texto de intención se conserva como evidencia durable. El preview actual no lo persiste ni lo devuelve. La siguiente implementación debe decidir, según las reglas existentes de privacidad/procedencia, qué referencia de entrada se conserva y por cuánto tiempo; no debe guardar texto sensible por defecto ni afirmar correspondencia semántica a partir de una mera validación estructural.

## 9. Estado de seguridad

Este documento no afirma implementación, pruebas, verificación formal, aprobación constitucional, commissioning ni autorización. Hasta evidencia contraria en el estado canónico: M0 `INCOMPLETO`; autoridad legítima `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`.
