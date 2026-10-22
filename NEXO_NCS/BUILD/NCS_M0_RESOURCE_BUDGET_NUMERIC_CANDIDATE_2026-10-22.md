# NCS M0 — candidato numérico inicial para presupuesto de recursos
Fecha: 2026-10-22
Estado: **RECOMENDACIÓN TÉCNICA / NO ACEPTADA POR EL PROPIETARIO / NO IMPLEMENTADA**

## 1. Decisión que se prepara

Se propone un perfil conservador inicial para la instancia local de Nexo bajo Opción A. Los números son topes operativos candidatos, no capacidades medidas del dispositivo ni garantías de rendimiento. Deben revisarse con pruebas de fixtures representativos antes de aceptación e implementación.

Este documento no modifica la decisión de alcance inicial, no aprueba la Constitución, no establece autoridad raíz y no habilita efectos protegidos.

## 2. Perfil candidato

| Recurso | Máximo candidato | Aplicación |
|---|---:|---|
| Contenido crudo de `--content-stdin` | 256 KiB | Bytes del flujo antes de decodificar y acumular todo el contenido |
| Contenido de una entrada Chronicle | 256 KiB | Bytes UTF-8 del campo content, validado también en el caso de uso |
| Entradas Chronicle | 10,000 | Cantidad de entradas después del append candidato |
| Documento Chronicle serializado | 32 MiB | Bytes exactos de la representación persistida, incluidos delimitadores/newline que formen parte del formato |
| Colección `missions` de Continuity | 10,000 elementos | Cardinalidad del snapshot candidato |
| Colección `attempts` de Continuity | 20,000 elementos | Cardinalidad del snapshot candidato |
| Colección `doNotRepeat` de Continuity | 20,000 elementos | Cardinalidad del snapshot candidato |
| Colección `executions` de Continuity | 10,000 elementos | Cardinalidad del snapshot candidato |
| Colección `effectJournal` de Continuity | 20,000 elementos | Cardinalidad del snapshot candidato |
| Envelope/snapshot Continuity serializado | 16 MiB | Bytes exactos antes de persistir |
| Presupuesto combinado de persistencia | Sin límite agregado inicial | Se proponen límites independientes por store; revisar si la ejecución pasa a ser servicio persistente o multiusuario |

`KiB` y `MiB` se interpretan en base binaria: 1 KiB = 1,024 bytes; 1 MiB = 1,048,576 bytes.

## 3. Justificación y límites de la recomendación

- El límite de 256 KiB de entrada acota el coste de lectura/decodificación y mantiene el contenido individual muy por debajo del presupuesto máximo de Chronicle.
- El máximo de 32 MiB de Chronicle y 16 MiB de Continuity limita el tamaño de cada documento completo que el store puede tener que leer, serializar y escribir como unidad.
- Los topes de cardinalidad limitan estructuras con muchos elementos pequeños; los topes de bytes cubren elementos grandes. Ambos son necesarios.
- El máximo de entradas es deliberadamente más amplio que un registro de prueba, pero no debe interpretarse como capacidad probada: el límite total de bytes suele alcanzarse antes.
- Los límites son de integridad y consumo acotado, no de retención histórica ilimitada. Al alcanzarlos, la propuesta inicial rechaza nuevas escrituras y conserva el estado existente.
- No se propone rotación, compactación, borrado automático ni purga del journal. Cualquiera de esos mecanismos requiere política de retención, trazabilidad y recuperación separada.
- No se ha medido todavía latencia, consumo máximo de heap ni comportamiento en condiciones de memoria baja. Antes de aceptar, los tests deben demostrar límites de bytes y ausencia de mutación; una prueba de rendimiento puede ajustar los topes sin cambiar su semántica.

## 4. Semántica obligatoria

1. Los límites son inclusivos: se acepta exactamente el máximo; se rechaza cualquier valor superior.
2. Las medidas de texto se hacen en bytes UTF-8, no en unidades UTF-16 ni en número de caracteres.
3. La validación ocurre antes de admisión de misión y antes de `writeDocument`/`writeEnvelope`.
4. El lector stdin deja de acumular en cuanto puede demostrar que el máximo se ha superado.
5. Un rechazo por límite previo a escritura produce cero mutaciones y no crea stores/locks/directorios como efecto lateral evitable.
6. Los fallos posteriores al inicio de escritura conservan los resultados de conflicto/UNKNOWN existentes; no se clasifican retroactivamente como exceso de límite.
7. Nunca se truncan datos, nunca se declara completitud si hubo truncamiento y nunca se elimina información histórica automáticamente.
8. Se reutilizan los estados de resultado existentes. El código público específico se elige después de inventariar los códigos actuales; no se crea una familia paralela de outcomes.

## 5. Gates antes de aceptar/implementar

- [ ] Ejecutar tests con contenido ASCII y multibyte en 256 KiB − 1 byte, exactamente 256 KiB y 256 KiB + 1 byte.
- [ ] Crear fixtures Chronicle representativos para límites de cantidad y serialización; confirmar que el presupuesto de 32 MiB se mide sobre los bytes realmente escritos.
- [ ] Crear fixtures Continuity para cada cardinalidad y snapshot de 16 MiB; comprobar que no se persiste un snapshot parcial.
- [ ] Comprobar que el rechazo conserva byte por byte el documento anterior y su revisión.
- [ ] Ejecutar casos concurrentes cerca del límite para demostrar que el cálculo se hace bajo la misma exclusión mutua que el commit.
- [ ] Confirmar que las pruebas actuales de conflicto, escritura ambigua y UNKNOWN siguen pasando.
- [ ] Ejecutar workflow completo en el SHA que contiene implementación y pruebas, y registrar run/job/SHA exactos.
- [ ] Si los fixtures o pruebas de rendimiento muestran que los topes son inadecuados, ajustar este perfil antes de aceptar; no ocultar el cambio en una constante sin contrato.

## 6. Estado

- Perfil numérico: **PROPUESTO / NO ACEPTADO**.
- Implementación: **NO INICIADA**.
- Subcriterio de presupuesto: **PENDING**.
- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
