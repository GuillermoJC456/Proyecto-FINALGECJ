# Informe de cierre y evaluación

Fecha: 28 de septiembre de 2026. Estado: implementación local verificada; ejecución de servicios de análisis y despliegue externo pendiente.

## Planificado frente a ejecutado

| Etapa | Presupuesto propuesto | Ejecución comprobada | Desviación y causa |
|---|---:|---|---|
| Implementación y seguridad | 4 h | API de donantes, persistencia SQLite, contraseñas scrypt, JWT, roles, pruebas y workflow | Pipeline implementado, sin ejecución en GitHub: no hay repositorio remoto ni entorno configurado |
| Pruebas y calidad | 3 h | Jest y auditoría de dependencias ejecutados; ZAP y SonarQube preparados | No hay Docker/ZAP/SonarQube instalados ni URL/token de SonarQube proporcionados |
| Cierre y evaluación | 2 h | Informe, instrucciones reproducibles y plan de mejora | Cierre técnico parcial hasta recibir resultados externos |

Las nueve horas son el presupuesto del enunciado, no horas de trabajo registradas. No se dispone de un cronograma real para cuantificar retrasos; no se atribuyen retrasos ficticios a módulos no solicitados.

## Evidencia local

- Jest: 8 pruebas aprobadas; 100 % de sentencias, ramas, funciones y líneas en `src/app.js` y `src/store.js`. Supera el umbral obligatorio de 80 % en las cuatro métricas.
- Alcance: verificaciones unitarias del hash y verificaciones de integración HTTP con Supertest y SQLite real en memoria. El proceso de arranque y la herramienta de creación administrativa no están incluidos en la cobertura.
- Seguridad: rechazo de rol enviado durante registro, credenciales incorrectas, tokens alterados/vencidos, algoritmo/audiencia incorrectos y acceso sin token; aislamiento por propietario; eliminación exclusiva del administrador; límites de solicitudes y tamaño del cuerpo; errores sin detalles internos; rechazo de entradas XSS/SQLi y verificación de SQL parametrizado.
- Auditoría de dependencias de producción: 0 vulnerabilidades informadas (informativas, bajas, moderadas, altas y críticas). Es una consulta del momento, no una garantía de ausencia de vulnerabilidades.
- Evidencia reproducible: `pnpm test`, `coverage/coverage-summary.json`, `coverage/lcov.info`, `pnpm audit --prod --json`.
- Verificación adicional ejecutada: instalación con lockfile congelado, validación sintáctica del YAML y prueba real del proceso HTTP en un puerto local con SQLite temporal en disco, creación de administrador e inicio de sesión exitoso. Esta prueba no forma parte del porcentaje de cobertura de Jest.

## Hallazgos del código inicial y correcciones

| Hallazgo en app-1.txt | Consecuencia | Corrección |
|---|---|---|
| El cliente determina el rol en /login | Escalamiento a administrador | Contraseña verificada y rol recuperado de SQLite |
| Clave JWT incluida en el código | Posibilidad de firmar tokens si se conoce la clave | Secreto requerido mediante variable de entorno |
| JWT sin expiración | Acceso indefinido de un token filtrado | Caducidad de 15 minutos; issuer, audience y algoritmo verificados |
| Eliminación simulada, sin datos persistentes | No permite comprobar el módulo | Registro, listado y borrado sobre SQLite |
| Servidor iniciado al importar módulo | Pruebas acopladas a un puerto | Factoría de aplicación separada del arranque |

## Métricas de servicios externos

| Métrica | Resultado |
|---|---|
| Alertas ZAP por gravedad | Pendiente: escaneo no ejecutado |
| SonarQube: code smells | Pendiente: análisis no ejecutado |
| SonarQube: deuda técnica en minutos | Pendiente: análisis no ejecutado |
| SonarQube: bugs, vulnerabilidades y hotspots | Pendiente: análisis no ejecutado |
| SonarQube: duplicación y cobertura importada | Pendiente: análisis no ejecutado |
| Despliegue de contenedor y smoke test en GitHub | Pendiente: workflow no ejecutado |

No se reemplazan métricas SonarQube por cifras de Jest ni se interpreta un escaneo pendiente como cero alertas. Tras configurar GitHub y SonarQube, anexar los artefactos `sonar-metrics` y `zap`, URL de ejecución, commit analizado, fecha y resolución de cada hallazgo. SonarQube debe finalizar su quality gate antes del despliegue. ZAP usa exclusivamente el contenedor temporal con datos ficticios.

## Lecciones aprendidas

1. Un ejemplo de autenticación sin verificación de contraseña puede aparentar protección y permitir suplantación completa. Los permisos deben probarse desde los casos negativos.
2. Separar aplicación, almacenamiento y arranque permite pruebas rápidas y aisladas sin depender de un puerto fijo.
3. Identificar herramientas y credenciales al inicio evita prometer escaneos y despliegues que todavía no pueden demostrarse.
4. Una cobertura alta expresa ejecución de código, no ausencia de defectos; debe acompañarse de pruebas de abuso y análisis independientes.
5. Persistir un lockfile y declarar la política de scripts de dependencias reduce diferencias entre el equipo y CI.

## Plan de mejora continua

| Prioridad/plazo propuesto | Acción | Responsable propuesto | Criterio de éxito |
|---|---|---|---|
| P0, antes de la entrega definitiva | Configurar GitHub/SonarQube y ejecutar pipeline completo | DevOps y calidad | Evidencias de quality gate, métricas y ZAP anexadas; fallos tratados |
| P1, semana 1 | Añadir escaneo DAST con ambos roles y revisar alertas | Seguridad | Rutas autenticadas y autorizaciones documentadas, sin hallazgos altos pendientes |
| P1, semana 1 | Preparar HTTPS, respaldo y restauración, secretos y auditoría | Backend/DevOps | Restauración ensayada y operaciones sensibles trazables |
| P1, semana 2 | Contraseñas asíncronas, límites compartidos y prueba de carga | Backend | Objetivo de latencia/concurrencia acordado y medido |
| P2, semana 2 | Recuperación de cuenta y revocación de tokens | Backend | Pruebas de abuso y regresión aprobadas |
| P2, continuo | Revisar deuda técnica y actualizar dependencias | Calidad | Cobertura ≥80 %, sin regresiones y revisión quincenal de métricas |
| P3, siguiente iteración | Explorar predicción de futuras donaciones | Datos/producto | Primero incorporar historial de donaciones con base de uso apropiada; comparar modelo con línea base y medir error sobre datos separados |

La propuesta de IA requiere un módulo de donaciones e historial suficiente: el registro de personas por sí solo no permite validar predicciones. No se implementó ni se declara como resultado del presente módulo.
