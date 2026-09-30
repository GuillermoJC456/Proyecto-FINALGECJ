# Reporte de seguridad ejecutado

Fecha: 30 de septiembre de 2026. Commit: `e4ba12e80748d1cf6f0c6d05af330f079c675e4d`.
CI/CD: https://github.com/GuillermoJC456/Proyecto-FINALGECJ/actions/runs/36756949259

## Auditoría y pruebas de abuso

Auditoría de dependencias de producción: 0 vulnerabilidades conocidas informadas en todas las severidades; evidencia en dependencias.json. Las pruebas Jest verifican permisos, aislamiento de propietarios, contraseñas, tokens alterados/vencidos, entrada XSS/SQLi, límites de solicitudes y errores sin detalles internos.

## OWASP ZAP 2.17.0

Escaneos activos y pasivos completados en la API desplegada en Docker dentro de GitHub Actions. Autenticación Bearer con dos cuentas ficticias, una por rol. Destino: http://127.0.0.1:3000. ZAP terminó al 100 % en ambos roles y se vació la cola pasiva antes de exportar.

| Rol | Altas | Medias | Bajas | Instancias informativas | Solicitudes de reglas activas |
|---|---:|---:|---:|---:|---:|
| Usuario | 0 | 0 | 0 | 24 | 827 |
| Administrador | 0 | 0 | 0 | 24 | 802 |

Los contadores proceden de alertsSummary y scanProgress en zap-ejecucion.json. Los reportes HTML/JSON agrupan algunas instancias, por lo que su contador agrupado puede diferir del resumen de la API. Se conservan ambos sin alterar los resultados.

Las reglas XSS reflejado y SQL Injection finalizaron sin alertas. Las fases de XSS persistente se ejecutaron; su fase de explotación no envió solicitudes al no encontrar un punto aplicable. La interfaz usa recursos locales, una política CSP y textContent para los datos; su flujo se comprobó por separado con Chromium. Se incluyen 52 entradas de reglas por rol: las reglas personalizadas sin scripts y las que necesitan un servicio OAST externo se registran como omitidas; el detalle está en scanProgress. No se presenta esto como cobertura completa de todo tipo de ataque.

## Revisión de observaciones informativas

Las instancias pertenecen a User Agent Fuzzer. Esta regla detecta diferencias entre respuestas a solicitudes repetidas. El POST puede pasar de 201 a 409 al repetir un correo y el DELETE de 204 a 404 tras eliminar un registro. Se reprodujo ese comportamiento con Mozilla, Googlebot y Mobile Safari, sin diferencias por User-Agent: revision-informativas.json. Se conservan las alertas como informativas y se documenta su relación con operaciones que cambian el estado; no se eliminó la regla para conseguir un resultado favorable.

## Alcance y archivos

Rutas de salud y donantes importadas desde OpenAPI; listado, creación y borrado comprobados con ambos roles. Registro y login se utilizan para preparar el escaneo y tienen pruebas de abuso en Jest; no se ejecutó fuzzing exhaustivo sobre ellos. Reportes: zap-usuario.html/json, zap-administrador.html/json y zap-ejecucion.json. Los tokens y contraseñas se redactan antes de guardar reportes.

La versión anterior de la API también se comprobó localmente; esta entrega utiliza las mediciones de CI del commit indicado. Ausencia de alertas de vulnerabilidad no equivale a garantía absoluta de seguridad.
