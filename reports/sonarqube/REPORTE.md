# Análisis SonarQube ejecutado

SonarQube Community Build 26.9.0.129388. Fecha: 30 de septiembre de 2026.
Commit CI: `e4ba12e80748d1cf6f0c6d05af330f079c675e4d`. Ejecución: https://github.com/GuillermoJC456/Proyecto-FINALGECJ/actions/runs/36756949259

| Métrica | Inicial local | Final CI |
|---|---:|---:|
| Code smells | 2 | 0 |
| Deuda técnica sqale_index en minutos | 10 | 0 |
| Bugs | 0 | 0 |
| Vulnerabilidades | 0 | 0 |
| Hotspots de seguridad | 0 | 0 |
| Cobertura importada | 100 % | 100 % |
| Duplicación | 0 % | 0 % |

Quality gate Sonar way: OK. Código no comentado: consultar ncloc en metrics.json. Se corrigieron javascript:S6353 (clase de caracteres abreviada) y javascript:S3358 (ternario anidado). La subcarpeta inicial preserva las métricas y hallazgos anteriores.

El análisis estático y la cobertura cuantitativa corresponden al backend; la interfaz tiene un reporte de comprobación funcional en Chromium. El análisis cubre src, con tests identificado por separado y src/server.js excluido de cobertura. Los scripts auxiliares de CI no forman parte de sonar.sources. La cobertura procede de Jest e ingresó mediante LCOV. Las métricas finales descargadas de GitHub están en metrics.json, quality-gate.json, issues.json y hotspots.json. scanner-local.log documenta la ejecución local de la API anterior a la interfaz; se normalizaron rutas personales.
