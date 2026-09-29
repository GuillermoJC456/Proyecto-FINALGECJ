# Evidencia de integración y entrega continuas

Repositorio: https://github.com/GuillermoJC456/Proyecto-FINALGECJ
Ejecución aprobada: https://github.com/GuillermoJC456/Proyecto-FINALGECJ/actions/runs/36640061750
Commit: `65662b01ac42370b5a613a7e5b726ca7e48a9b68`.
Inicio: 2026-09-29T22:31:21Z. Última actualización: 2026-09-29T22:35:25Z. Estado: completed / success.

Se completaron instalación, ocho pruebas, auditoría, SonarQube, quality gate, construcción Docker, despliegue automático en el runner, smoke test HTTP, ZAP con ambos roles, exportación y limpieza. El entorno fue temporal y se eliminó después de los análisis; no se publica una URL de aplicación permanente.

La primera ejecución 36639668623 falló antes de iniciar el escaneo activo por una configuración de alcance de ZAP. Se corrigió la inclusión de la raíz del destino y la semilla del árbol de URLs. La ejecución enlazada verifica la corrección completa.

ejecucion.json y jobs.json proceden de la API de GitHub. artefactos.json identifica la evidencia original. logs-github.zip contiene los logs de la ejecución aprobada. Los reportes medidos se distribuyen entre las carpetas hermanas unitarias, seguridad y sonarqube.

La entrega documental posterior utiliza [skip ci] porque no cambia código, tests, lockfile ni workflow. El commit analizado se conserva y los hashes de los archivos de implementación se validaron antes de empaquetar.
