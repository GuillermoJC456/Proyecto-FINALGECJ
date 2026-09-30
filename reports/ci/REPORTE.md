# Evidencia de integración y entrega continuas

Repositorio: https://github.com/GuillermoJC456/Proyecto-FINALGECJ
Ejecución aprobada: https://github.com/GuillermoJC456/Proyecto-FINALGECJ/actions/runs/36756949259
Commit: `e4ba12e80748d1cf6f0c6d05af330f079c675e4d`.
Inicio: 2026-09-30T18:12:49Z. Última actualización: 2026-09-30T18:17:29Z. Estado: completed / success.

Se completaron instalación, nueve pruebas, auditoría, SonarQube, quality gate, construcción Docker, despliegue automático en el runner, smoke test HTTP, ZAP con ambos roles, exportación y limpieza. El entorno fue temporal y se eliminó después de los análisis; no se publica una URL de aplicación permanente.

La primera ejecución 36639668623 falló antes de iniciar el escaneo activo por una configuración de alcance de ZAP. Se corrigió la inclusión de la raíz del destino y la semilla del árbol de URLs. La ejecución enlazada verifica la corrección completa. Al añadir la interfaz se corrigió además una política de fuentes demasiado amplia y se bloquearon los envíos HTML nativos mediante CSP; las operaciones autorizadas usan fetch con JSON y Bearer. La protección se comprobó también sin JavaScript.

ejecucion.json y jobs.json proceden de la API de GitHub. artefactos.json identifica la evidencia original. logs-github.zip contiene los logs de la ejecución aprobada. Los reportes medidos se distribuyen entre las carpetas hermanas unitarias, seguridad y sonarqube.

La entrega documental posterior utiliza [skip ci] porque no cambia código, tests, lockfile ni workflow. El commit analizado se conserva y los hashes de los archivos de implementación se validaron antes de empaquetar.
