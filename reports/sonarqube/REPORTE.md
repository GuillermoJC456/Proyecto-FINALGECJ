# Análisis SonarQube ejecutado

SonarQube Community Build 26.9.0.129388. Fecha: 29 de septiembre de 2026.
Commit CI: `65662b01ac42370b5a613a7e5b726ca7e48a9b68`. Ejecución: https://github.com/GuillermoJC456/Proyecto-FINALGECJ/actions/runs/36640061750

| Métrica | Inicial local | Final local y CI |
|---|---:|---:|
| Code smells | 2 | 0 |
| Deuda técnica sqale_index en minutos | 10 | 0 |
| Bugs | 0 | 0 |
| Vulnerabilidades | 0 | 0 |
| Hotspots de seguridad | 0 | 0 |
| Cobertura importada | 100 % | 100 % |
| Duplicación | 0 % | 0 % |

Quality gate Sonar way: OK. Código no comentado: 109 líneas. Se corrigieron javascript:S6353 (clase de caracteres abreviada) y javascript:S3358 (ternario anidado). La subcarpeta inicial preserva las métricas y hallazgos anteriores.

El análisis cubre src, con tests identificado por separado y src/server.js excluido de cobertura. Los scripts auxiliares de CI no forman parte de sonar.sources. La cobertura procede de Jest e ingresó mediante LCOV. Las métricas finales descargadas de GitHub están en metrics.json, quality-gate.json, issues.json y hotspots.json. scanner-local.log documenta la ejecución local adicional; se normalizaron rutas personales.
