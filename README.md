# Registro de personas donantes

API académica en Node.js 24, Express y SQLite, desarrollada a partir de `app-1.txt`, conservado como referencia. Incluye una interfaz web minimalista y adaptable a móviles, sin dependencias de frontend.

## Ejecutar

Instalar Node.js 24 y pnpm 11.19.0 (`npm install -g pnpm@11.19.0`). En PowerShell:

```powershell
pnpm install --frozen-lockfile
$env:JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
pnpm start
```

Abre **http://localhost:3000** para usar la interfaz. Puedes crear una cuenta, iniciar sesión, buscar y registrar donantes. Un administrador también puede eliminarlos con confirmación. La sesión permanece en memoria y se cierra al recargar o al vencer los 15 minutos.

La API escucha en `http://localhost:3000`. SQLite se guarda en `data/donantes.sqlite`; `DB_PATH` y `PORT` son configurables. La clave debe mantenerse estable entre reinicios y guardarse en un gestor de secretos. No se incluye ninguna credencial real.

Para crear un administrador, definir `ADMIN_USERNAME` y `ADMIN_PASSWORD` (12–128 caracteres) en el entorno y ejecutar `pnpm admin`. Borrar después esas variables. El registro público nunca permite asignar roles.

| Ruta | Acceso | Entrada/resultado |
|---|---|---|
| POST /register | Público, limitado | `{"username":"persona","password":"una-clave-larga-123"}` |
| POST /login | Público, limitado | Mismos campos; devuelve JWT con vigencia de 15 minutos |
| GET /health | Público | Estado del proceso |
| POST /donantes | Autenticado | `{"name":"Ana Pérez","email":"ana@example.com"}` |
| GET /donantes | Autenticado | Usuario: sus registros; administrador: todos |
| DELETE /donantes/:id | Administrador | 204 si elimina; 404 si no existe |

Enviar `Authorization: Bearer <token>`. Las contraseñas se derivan mediante scrypt y sal aleatoria. Las consultas SQL usan parámetros. El rol vigente se consulta en la base de datos en cada solicitud. No se interpolan datos en HTML.

## Verificar

```powershell
pnpm test
pnpm audit --prod --audit-level high
```

Jest exige al menos 80 % en líneas, sentencias, funciones y ramas de `src/app.js` y `src/store.js`. El arranque `src/server.js` y la utilidad administrativa quedan fuera de la cobertura instrumentada. Consultar `coverage/lcov-report/index.html` y `coverage/coverage-summary.json`.

## CI/CD y reportes reales

Repositorio: https://github.com/GuillermoJC456/Proyecto-FINALGECJ

El workflow ejecuta instalación reproducible, Jest con umbral de 80 %, auditoría de dependencias y SonarQube Community Build temporal. Cambia la contraseña inicial de SonarQube, genera un token efímero, importa LCOV y espera su quality gate. No requiere configurar un servidor SonarQube ni secretos del repositorio. El contenedor se elimina al finalizar.

En push a `main` y ejecución manual, construye la imagen Docker, despliega la API en el runner, verifica `/health` y ejecuta ZAP con los roles usuario y administrador. Exporta los reportes HTML/JSON y bloquea el job ante alertas altas o medias. En PR ejecuta pruebas y SonarQube. El entorno de prueba es temporal y privado al runner, no una página web pública permanente.

Los resultados de la entrega están en `reports/unitarias`, `reports/seguridad` y `reports/sonarqube`. `reports/ci` identifica las ejecuciones de GitHub y sus commits. El análisis local inicial de SonarQube se conserva como evidencia de las dos observaciones corregidas; las métricas finales están fuera de la subcarpeta `inicial`.

### Repetir ZAP

Utilizar exclusivamente una instancia desechable con datos ficticios. Arrancar ZAP daemon en `127.0.0.1:8090` con clave API. Crear `zapusuario` mediante `/register` y `zapadministrador` mediante `pnpm admin`, con la misma contraseña temporal. Definir `SCAN_PASSWORD` y `ZAP_API_KEY`, y ejecutar `python scripts/zap-scan.py`. La herramienta acepta únicamente destino local; importa `openapi.json`, establece Bearer por rol y produce reportes sin los tokens de autenticación.

El escaneo cubre salud y rutas de donantes, incluyendo el borrado con ambos roles. Los flujos públicos de registro/login tienen pruebas automatizadas y se utilizan para preparar el escaneo. La API responde JSON y la interfaz utiliza recursos locales y CSP; los datos de donantes se insertan con textContent. Las reglas activas de XSS/SQLi y los casos de abuso aportan evidencia dentro de ese alcance.

Documentación oficial: [ZAP API](https://www.zaproxy.org/docs/api/), [cobertura JavaScript en SonarQube](https://docs.sonarsource.com/sonarqube-server/2025.5/analyzing-source-code/test-coverage/javascript-typescript-test-coverage), [acción SonarQube](https://github.com/SonarSource/sonarqube-scan-action).

## Límites del prototipo

Se requieren HTTPS y un proxy configurado correctamente antes de exponerlo. El limitador reside en memoria por proceso; el hashing síncrono y SQLite son adecuados para este ejercicio, no para alta concurrencia. No incluye recuperación de contraseña, revocación individual de tokens, auditoría de operaciones ni copias de respaldo automatizadas. El endpoint de salud comprueba el proceso, no la disponibilidad completa de almacenamiento.

## Verificación de la interfaz

El reporte `reports/interfaz/prueba-navegador.json` registra la comprobación real en Chromium de registro, login, alta, búsqueda, duplicados, permisos, confirmación de borrado, sesión vencida y vista móvil. Esta comprobación es independiente de la cobertura Jest del backend.

Los formularios operan mediante `fetch` con JSON y Bearer. La política CSP bloquea los envíos HTML nativos, incluso si JavaScript no carga, y solo permite estilos y fuentes del mismo origen.
