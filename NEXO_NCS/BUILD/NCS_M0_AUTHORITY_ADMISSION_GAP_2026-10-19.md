# Nexo M0 — brecha de admisión de autoridad

Fecha: 2026-10-19  
Estado: **GAP CONFIRMADO POR INSPECCIÓN DE CÓDIGO — NO IMPLEMENTAR UN ROOT FICTICIO**.

## Evidencia directa

Archivos inspeccionados en la rama `ncs-clean-architecture`:

- `src/nexo/core/owner-backed-runtime.mjs` — blob `313c528584d51f2716502b02b18f40940ba86c8a`.
- `src/nexo/core/continuity-owner.mjs` — blob `07f3df47d33da08c38b1f6ebee9b782a68f85847`.
- `src/nexo/application/chronicle-append.mjs` — blob `2908bb37a5e84fde4a65f8825cbb13682deeb1dd`.
- `src/nexo/adapters/chronicle-effect.mjs` — blob `b29c26d84c19afa34769f06cedd7d0131e873075`.

### Qué sí hace el código

1. Comprueba que existan handler y verificador de reconciliación antes de PREPARED.
2. Exige que la misión almacenada y la reconstrucción canónica permitan ejecutar el paso, y que las dependencias estén completas.
3. Persiste PREPARED antes de invocar el adapter.
4. Si el resultado del dispatch o su registro es ambiguo, devuelve UNKNOWN y no autoriza redispatch.
5. Vincula el resultado Chronicle a una identidad de operación y a un settlement verificable por el contrato local.

### Qué no hace el código

1. `createNexoContinuityOwner()` recibe `store` y `effectVerifiers`; no recibe ni consulta una raíz de autoridad, principal autenticado, decisión de autorización ni epoch de autoridad.
2. Las rutas de admisión/outcome devuelven `authorization: "NOT_EVALUATED"` en varios resultados. Es una declaración explícita de que no hubo evaluación de autoridad.
3. `executeNexoStepWithContinuityOwner()` comprueba capacidades técnicas y readiness de misión, pero no realiza una evaluación de autorización del propietario antes de PREPARED/dispatch.
4. `runNexoChronicleAppend()` puede crear una misión y escribir una entrada local Chronicle a través del adapter fijo; la ruta actual no demuestra que esa escritura esté autorizada por una raíz constitucional del propietario.

**Distinción crítica:** capacidad técnica ≠ autorización; misión ejecutable ≠ propietario legítimo; settlement consistente ≠ autorización; test PASS ≠ autoridad constitucional.

## Decisión arquitectónica

- No crear una función como `createConstitutionAuthorityContext(input)` que acepte datos caller-supplied y los presente como prueba de autoridad. Un constructor no puede ser su propia raíz de confianza.
- No inventar credenciales, IDs de decisión, epochs, tokens, quórums o ceremonias para cerrar esta brecha sin una raíz y un contrato previamente justificados.
- Mantener la vertical Chronicle como prototipo local acotado para pruebas de persistencia/replay. **No presentarla como una ruta de efecto protegido owner-authorized ni conectar a ella acciones externas, financieras, irreversibles, reparación de estado externo o cambios constitucionales.**
- El estado `authorization: NOT_EVALUATED` debe seguir siendo explícito. No convertirlo en PASS por default, por identidad del dispositivo, por tener acceso al filesystem ni porque la misión esté `planned`.
- La raíz de autoridad y su mecanismo de admisión son un bloqueo de seguridad independiente del gate integrado de regresión. Efectos protegidos siguen STOP.

## Contrato que falta antes de implementar

No es una lista de campos a añadir mecánicamente. Antes del código se necesita una decisión sustentada sobre:

1. **Qué se autoriza:** tipos de acción y alcance exacto; separar escrituras locales reversibles de efectos protegidos.
2. **Quién es el principal:** cómo se vincula a una autoridad legítima independiente del modelo, del dispositivo y de un input caller-supplied.
3. **Fuente de verdad:** dónde reside la raíz de confianza y qué prueba verificable establece su legitimidad; el store de continuidad por sí solo no se autovalida como raíz.
4. **Vigencia y revocación:** cómo se demuestra que la decisión sigue vigente en el punto final anterior al efecto; cómo STOP/revocación impide que una decisión obsoleta autorice un dispatch.
5. **Fallo cerrado:** ausencia, ambigüedad, conflicto, root no disponible o evidencia contradictoria producen BLOCKED/UNKNOWN sin dispatch protegido.
6. **Pruebas adversariales:** principal falso, decisión vencida, revocación concurrente, restart, identidad de operación reutilizada y separación entre PREPARED y dispatch.

Estos puntos son requisitos para diseñar el contrato, no permiso para inventar ahora una solución. Reutilizar investigación previa de Nexo en `docs/nexo/` y handoffs existentes; no repetir auditorías históricas cerradas ni mezclar Lúmina.

## Evidencia de estado

El gate integrado [run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910) pasó las regresiones de M0 en SHA `c57be8aa6fd7e558d870c3e46feab741637b4314`. Ese resultado prueba el comportamiento de las pruebas enumeradas; **no prueba la raíz de autoridad**, porque el código no la evalúa.

## Próximo paso

Antes de cambiar runtime, revisar las fuentes de investigación/handoff ya existentes sobre raíz independiente, autorización efectiva, revocación y STOP, y sintetizar una decisión mínima que no duplique investigación cerrada. Si no hay raíz implementada y verificable, mantener la frontera explícitamente sin autorizar y no construir un pseudo-root.


## Corrección posterior: el contrato público también debe mostrar la ausencia de evaluación (2026-10-19)

La inspección posterior detectó un segundo problema de transparencia: aunque el runtime interno conservaba `authorization: "NOT_EVALUATED"` en rutas relevantes, `publicChronicleResult()` no lo copiaba al resultado público y el helper de rechazo temprano tampoco lo añadía. Así, un consumidor podía ver `status: "completed"` del settlement local sin ver que autorización no se evaluó.

Corrección:
- `src/nexo/application/chronicle-append.mjs`, commit `aa8509e75dd7925189d54b2667bcdd2ae27e6647`.
- `tests/nexo/chronicle-runtime.test.mjs`, commit `dbced55ae0f345a7677b5df4b598631ec0d78ed8`.
- Integración M0 PASS observada en [run 39292627540](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292627540), SHA `dbced55ae0f345a7677b5df4b598631ec0d78ed8`; workflow Chronicle [run 39292627699](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292627699) PASS.

La marca explícita evita una inferencia engañosa, pero no es una decisión de autorización y no concede permiso. La raíz sigue PENDING; efectos protegidos STOP; M0 global INCOMPLETO.


## M0 — verificación final de transparencia de autoridad (2026-10-19)

- La revisión detectó y cerró dos omisiones en resultados públicos Chronicle: el resultado normalizado, los rechazos tempranos y el conflicto de admisión deben conservar `authorization: "NOT_EVALUATED"` mientras no exista evaluación de autoridad.
- Implementación: `src/nexo/application/chronicle-append.mjs`, commit `2faf2b988c676dc907c9322f5e63be36200af97b` (visibilidad en conflicto, sobre la corrección inicial `aa8509e75dd7925189d54b2667bcdd2ae27e6647`).
- Regresión: `tests/nexo/chronicle-runtime.test.mjs`, commit `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; verifica resultado desconocido normalizado, datos malformados, rechazo temprano y settlement local completado.
- **CI integrado PASS:** [run 39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874), SHA exacto `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; job `Nexo M0 contracts on one SHA` SUCCESS, con los cinco grupos de pruebas SUCCESS. Chronicle específico [run 39292887749](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887749) también SUCCESS en el mismo SHA.
- **Límite:** la transparencia se corrigió; no se creó ni evaluó una raíz constitucional. Settlement local no significa autorización. Raíz/composición PENDING; efectos protegidos STOP; M0 global INCOMPLETO.

---

