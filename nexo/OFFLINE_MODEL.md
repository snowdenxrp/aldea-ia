# Nexo — modelo local avanzado

Nexo se diseña offline-first. El modelo local es el cerebro de continuidad; internet es una capacidad adicional, no un requisito.

## Objetivo

Cuando el dispositivo tenga suficiente hardware, Nexo debe poder ejecutar un modelo local grande y cuantizado, con:
- razonamiento y planificación multi-paso;
- tool calling;
- salida estructurada;
- contexto largo;
- streaming;
- memoria y recuperación locales;
- análisis de código y archivos;
- capacidad de trabajar durante horas sin conexión.

La arquitectura no fija un modelo comercial concreto. El perfil flagship debe apuntar al modelo local de mayor calidad que el hardware pueda ejecutar con estabilidad. En equipos potentes esto puede significar decenas de miles de millones de parámetros; en hardware limitado se usa balanced o compact.

## Motor

nexo/local-model.mjs usa una interfaz OpenAI-compatible exclusivamente contra localhost. Esto permite conectar posteriormente un motor local como llama.cpp server, Ollama u otro runtime compatible sin acoplar el núcleo de Nexo a un proveedor concreto.

El adaptador local no tiene fallback remoto. La decisión de utilizar internet pertenece únicamente a nexo/model-router.mjs.

## Regla de autonomía

Si internet desaparece, Nexo no debe convertirse en una app inútil.

Debe continuar conversando, razonando, leyendo memoria, ejecutando herramientas locales y trabajando en proyectos. Las tareas que realmente dependan de internet se guardan en una cola y se reanudan cuando la conectividad regrese.

## Seguridad

Los pesos del modelo, memoria y datos privados pueden permanecer en almacenamiento local. Las credenciales de servicios remotos nunca deben formar parte de la memoria del agente ni del estado exportable.
