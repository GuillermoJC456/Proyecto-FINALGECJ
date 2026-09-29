# Estado del análisis SonarQube

NO EJECUTADO. No hay servidor SonarQube, scanner ni credenciales disponibles en el entorno. Este documento registra el estado; no es una salida de SonarQube.

| Métrica solicitada | Valor |
|---|---|
| Deuda técnica (sqale_index, minutos) | No disponible |
| Code smells | No disponible |
| Bugs y vulnerabilidades | No disponible |
| Hotspots de seguridad | No disponible |
| Duplicación | No disponible |
| Cobertura importada por SonarQube | No disponible |

Para obtener resultados reales: crear el proyecto registro-donantes en un servidor accesible desde GitHub Actions; configurar SONAR_HOST_URL y SONAR_TOKEN como secretos; subir el repositorio; ejecutar el workflow y descargar el artefacto sonar-metrics. El scanner importa coverage/lcov.info generado en CI y espera el quality gate. Conservar URL de análisis, commit, fecha y versión de SonarQube con el JSON exportado.

No se utiliza 100 % de Jest como si fuera una medición emitida por SonarQube. La entrega no acredita todavía el requisito de ejecutar dicho análisis.
