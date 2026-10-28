# NCS M0 — delta de reconciliación U con B1/B2 (2026-10-27)

**Rama:** `ncs-clean-architecture`  
**Tipo:** delta documental de precedencia y estado; no ratifica contratos ni autoriza operación.

## 1. Precedencia de la decisión vigente

La decisión expresa más reciente del propietario sobre el alcance del objeto de bootstrap M0 de Continuity es **U** y está registrada en `NCS_M0_OWNER_DECISION_BOOTSTRAP_SCOPE_U_2026-10-27.md`.

U significa que el objeto no puede clasificarse con seguridad como L (almacenamiento local estrictamente no autoritativo) ni C (estado constitucional o que afecta a la autoridad). No seleccionar L ni C, no inferir exclusión de alcance y no inferir permiso de escritura.

La matriz `NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md` conserva una línea histórica que dice «Alcance elegido: Opción A». Esa línea no debe interpretarse como decisión vigente del propietario después del registro U. Este delta no modifica el archivo matriz existente; hace explícita la precedencia para evitar que la línea antigua se use como aceptación actual.

## 2. Efecto en los gates

- **B1 / P01-A:** `OPEN / UNKNOWN`; alcance = `U`. No congelar el contrato del objeto ni tratar el candidato de bootstrap como ratificado.
- **P01-B:** `C — NO SELECCIONAR TODAVÍA`; U no cambia esta decisión.
- **B2 / P01-G:** regla legítima de primera creación `PENDING / UNKNOWN`; U no resuelve autoridad ni crea una autoridad paralela.
- **P-05 / B3:** `NO RATIFICADA`; readmisión `BLOCKED/UNKNOWN`.
- **D0/D1/D2/D3:** `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`.
- **Primera creación de Continuity y efectos protegidos:** `STOP`.
- **authorization:** `NOT_EVALUATED`.
- **M0:** `INCOMPLETO`.

## 3. Próximo trabajo finito

No repetir censos, STEP 7, revisiones generales de modelos ni auditorías ya cerradas. Reconciliar B1 solo con decisiones explícitas ya registradas; cualquier dimensión que dependa de clasificar el objeto como L o C permanece abierta por U. Para B2, localizar una regla canónica ya aceptada que cubra exactamente la primera creación local; si no existe en las fuentes aplicables, mantener la brecha abierta y no inventar una autoridad. P-05 sigue como decisión separada y no debe usarse para resolver B1/B2 por analogía.

La única manera de pasar de este estado a implementación es congelar los contratos aplicables y recibir autorización separada para los cambios y las pruebas. Este documento no concede tal autorización.

## 4. Límites y evidencia

Este delta es documental. No modifica runtime, tests, workflows, configuración ejecutable ni dispositivo. No ejecuta tests, CI ni Actions y no demuestra comportamiento runtime, autoridad legítima, exclusión real ni readmisión segura.
