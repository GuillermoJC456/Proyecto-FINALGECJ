# Informe de cierre del sistema de donantes

Fecha de cierre: 30 de septiembre de 2026. Implementación, pruebas, análisis y despliegue de prueba completados. Repositorio: https://github.com/GuillermoJC456/Proyecto-FINALGECJ. Ejecución aprobada: https://github.com/GuillermoJC456/Proyecto-FINALGECJ/actions/runs/36756949259. Commit evaluado: `e4ba12e80748d1cf6f0c6d05af330f079c675e4d`.

## Planificación frente a implementación

| Etapa | Presupuesto | Implementación y evidencia |
|---|---:|---|
| Implementación y seguridad | 4 h | Registro de donantes en SQLite, JWT, roles y contraseñas scrypt; CI/CD ejecutado con despliegue temporal en Docker |
| Pruebas y calidad | 3 h | 9 pruebas aprobadas, cobertura 100 %, auditoría, SonarQube y ZAP ejecutados |
| Cierre y evaluación | 2 h | PDF de cierre, reportes, repositorio Git y ZIP final con manifiesto |

Las nueve horas son el presupuesto del enunciado, no horas reales registradas. Se añadió una interfaz web adaptable a móviles; su reporte está en reports/interfaz. La primera entrega dejó análisis externos pendientes por falta de herramientas y acceso configurado. En el cierre se descargaron herramientas portátiles, se corrigió la compatibilidad de Java con Windows y se ejecutó un pipeline autónomo en GitHub. El primer intento de CI detectó un error en el alcance de ZAP; se corrigió y la siguiente ejecución completó todos los pasos. No se atribuyen retrasos ficticios a módulos no solicitados.

## Resultados finales

Jest: 8 de 9 pruebas, 100 % en líneas, sentencias, ramas y funciones de app.js y store.js. Arranque y utilidad administrativa fuera de la cobertura. Auditoría: 0 vulnerabilidades conocidas reportadas. SonarQube: 0 bugs, vulnerabilidades, hotspots, code smells y minutos de deuda técnica; cobertura importada 100 %, duplicación 0 %, quality gate OK. La deuda inicial de 10 minutos y dos code smells se corrigió y se conserva como comparación.

ZAP: 0 alertas altas, medias o bajas; 24 instancias informativas por rol de User Agent Fuzzer. Se revisaron las operaciones repetidas: creación 201/409 y borrado 204/404 por cambio de estado, independientes del User-Agent en los casos comprobados. Se preservan los hallazgos. Rutas de donantes analizadas con ambos roles; XSS/SQLi sin alertas en ese alcance. Reglas OAST y scripts personalizados no configurados constan como omitidas.

## Lecciones de planificación e implementación

1. Comprobar acceso, herramientas y recursos antes de estimar. Las credenciales y el entorno son dependencias reales del cierre.
2. Definir evidencias de aceptación: cobertura instrumentada, roles, rutas, métricas y un pipeline ejecutado. Una configuración preparada no demuestra ejecución.
3. Registrar tiempos y bloqueos. El presupuesto no permite calcular por sí solo el esfuerzo real ni retrasos.
4. No confiar en el rol enviado por el cliente. El servidor verifica contraseña y recupera permisos de SQLite; los casos negativos son esenciales.
5. Separar aplicación, almacenamiento y arranque permite pruebas aisladas. Lockfile y contenedores reducen diferencias entre el equipo y CI.
6. Revisar las alertas según el estado de los datos. Los cambios legítimos de respuesta pueden generar observaciones informativas que deben documentarse.
7. Ejecutar temprano el pipeline descubre defectos de configuración que no aparecen en las pruebas unitarias. La corrección debe confirmarse con otra ejecución completa.

## Plan de mejora

| Prioridad y plazo propuesto | Acción | Responsable propuesto | Criterio de éxito |
|---|---|---|---|
| P1 semana 1 | Preparar HTTPS, secretos, respaldos y auditoría para entorno permanente | Backend y DevOps | Restauración ensayada y trazabilidad de operaciones |
| P1 semana 1 | Ampliar DAST a registro/login y casos OAST aplicables | Seguridad | Matriz de rutas y reglas sin huecos no justificados |
| P1 semana 2 | Hashing asíncrono, límites compartidos y prueba de carga | Backend | Objetivos de latencia y concurrencia definidos y medidos |
| P2 semana 2 | Recuperación de cuenta y revocación de tokens | Backend | Pruebas funcionales y de abuso aprobadas |
| P2 quincenal | Actualizar dependencias y revisar métricas | Calidad | Cobertura ≥80 % y ningún hallazgo alto sin tratamiento |
| P3 siguiente iteración | Explorar predicción de donaciones | Datos y producto | Historial suficiente y modelo evaluado contra línea base |

La IA requiere incorporar historial de donaciones y una base de uso apropiada de los datos. No se declara implementada. El sistema actual incluye una interfaz web minimalista para registro, inicio de sesión, búsqueda y gestión por rol; el despliegue verificado es temporal, no un servicio público permanente.
