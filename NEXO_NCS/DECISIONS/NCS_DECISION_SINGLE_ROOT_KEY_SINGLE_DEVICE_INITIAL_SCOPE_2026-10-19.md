# DECISIÓN NCS — raíz única de arranque y dispositivo inicial único

Fecha: 2026-10-19
Estado: **ACEPTADA COMO DECISIÓN DE ALCANCE ARQUITECTÓNICO; implementación y selección física de la llave pendientes**

## Decisión

Para la primera versión construible de Nexo:

1. **Una llave raíz** será la base criptográfica de arranque y reconocimiento inicial de autoridad de Nexo. La implementación concreta (tipo/modelo, protocolo, provisión y cómo la verifica Nexo) se seleccionará al llegar al diseño técnico comprobable; este registro no afirma que ya exista una llave adquirida o configurada.
2. **Un solo dispositivo inicial** será el entorno de ejecución de Nexo para esta fase. No se implementa ahora coordinación, sincronización ni autoridad distribuida entre varios dispositivos.
3. **La recuperación tras pérdida irrecuperable de la única llave queda fuera de alcance inicial.** Se acepta explícitamente el riesgo de que Nexo quede inaccesible si la llave se pierde y no existe prueba legítima alternativa. No se fingirá recuperación desde un snapshot restaurado, una cuenta, el modelo, el teléfono o el proveedor.
4. **La llave raíz no concede permiso ilimitado.** La prueba de raíz inicia la cadena de confianza; cada operación protegida sigue necesitando evaluación de autoridad/alcance y enforcement en la última frontera de efecto.
5. **La misión M0 continúa sin reinicio.** Los contratos y pruebas ya implementados se conservan. El siguiente trabajo inmediato sigue siendo cerrar la coherencia entre misión persistida, pasos y reconstrucción, y validar los cambios con CI; el diseño de la llave no debe convertirse en otro ciclo de investigación general.
6. **Varios dispositivos, sucesión y recuperación avanzada** quedan como requisitos futuros, no como bloqueos para la primera versión. Se documentan sin implementarlos ahora.

## Justificación y límite

La reducción del alcance permite construir una ruta vertical concreta en lugar de exigir que la primera versión resuelva desde el inicio todos los escenarios de pérdida, sincronización y sucesión. Una raíz única simplifica el modelo de confianza, pero sólo será válida si el material de llave se establece fuera del estado que ella misma pretende autenticar y si el verificador/enforcement realmente consulta la prueba.

“Llave raíz” significa raíz criptográfica de bootstrap, no autoridad mágica ni prueba de que el programa, su almacenamiento o sus efectos externos sean íntegros. La raíz, la decisión de autorización y la frontera de ejecución son responsabilidades semánticas distintas, aunque la implementación inicial pueda ser pequeña.

## Consecuencias de alcance

### Dentro de la primera fase
- Una llave raíz configurada mediante un procedimiento explícito y verificable.
- Un dispositivo de ejecución.
- Un flujo de arranque que comprueba la prueba de la llave antes de reconocer la autoridad inicial.
- Un contrato de autorización acotada y una frontera de ejecución protegida verificable.
- Pruebas negativas: llave ausente, prueba inválida, entrada malformada, estado restaurado/rollback, revocación no demostrada y fallo del límite de ejecución => no dispatch protegido.

### Fuera de la primera fase
- Alta disponibilidad o sincronización multi-dispositivo.
- Quórums/multi-raíz y recuperación distribuida.
- Sucesión de autoridad.
- Recuperación garantizada tras pérdida de la única llave.
- Selección anticipada de proveedores, hardware o servicios que no estén disponibles actualmente.

## Condiciones que siguen siendo obligatorias

- No tratar el teléfono ni el modelo de IA como raíz por defecto.
- No permitir que el estado restaurado se autentique a sí mismo.
- No permitir dispatch protegido sólo porque la llave produjo una prueba válida: evaluar acción, recurso, alcance, frescura y revocación conforme a los contratos existentes.
- Si no hay evidencia suficiente, resultado UNKNOWN y STOP.
- No llamar “PASS” a una arquitectura sólo por documentarla. La implementación necesitará código, regresiones y CI observado en un SHA concreto.

## Estado de evidencia al decidir

- Esta decisión expresa alcance/arquitectura; **no es evidencia de implementación**.
- El CI funcional previamente observado para transparencia Chronicle es run 39292887874, SHA 8d4583d8a8074b2993e77faa3770d7abcfe7b6ae; no prueba raíz ni autorización.
- Autoridad de runtime continúa NOT_EVALUATED.
- Efectos protegidos continúan STOP.
- M0 continúa INCOMPLETO.

## Siguiente paso de construcción

Retomar el punto técnico M0 ya abierto: coherencia entre misión persistida, estados de pasos y reconstrucción/proyección. Revisar el estado real de CI para continuity-queries.mjs y su regresión antes de cambiar más código. No reabrir la comparación general de familias de raíz como bloqueo; usar esta decisión como restricción de diseño y posponer detalles físicos hasta que el flujo de arranque se pueda especificar y probar de manera concreta.
