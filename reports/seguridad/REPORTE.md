# Reporte de seguridad

Ejecución local: 28/09/2026 20:16. Se ejecutaron pruebas automatizadas de abuso en Jest y auditoría de dependencias de producción con `pnpm audit --prod --json`.

Resultado de auditoría: 0 vulnerabilidades informadas en todas las severidades. Evidencia original: dependencias.json. Esto no demuestra ausencia de vulnerabilidades desconocidas.

Casos aprobados en ../unitarias/jest-results.json:
- Registro sin asignación de rol por el cliente y login con verificación de contraseña.
- Rechazo de JWT ausente, alterado, vencido, con audiencia o algoritmo incorrectos.
- Aislamiento de registros por propietario y borrado exclusivo del administrador.
- Entradas XSS rechazadas; consultas SQL parametrizadas conservan el esquema ante una cadena SQLi.
- Límites de solicitudes y tamaño del cuerpo; errores sin detalles internos.

OWASP ZAP: NO EJECUTADO. El equipo no dispone de Docker/ZAP. No hay alertas DAST ni reporte ZAP que puedan afirmarse como resultados. El workflow .github/workflows/ci-cd.yml deja preparado el escaneo autenticado sobre un contenedor temporal. Al ejecutarlo, descargar el artefacto zap e incorporar zap.html y zap.json. El alcance actual es rol usuario y API; no incluye XSS de navegador ni borrado autorizado como administrador.
