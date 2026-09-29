# Registro de personas donantes

API académica en Node.js 24, Express y SQLite, desarrollada a partir de `app-1.txt`, conservado como referencia. No tiene interfaz web.

## Ejecutar

Instalar Node.js 24 y pnpm 11.19.0 (`npm install -g pnpm@11.19.0`). En PowerShell:

```powershell
pnpm install --frozen-lockfile
$env:JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
pnpm start
```

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

## CI/CD y análisis externos

Subir este directorio a un repositorio GitHub cuya rama principal sea `main`. El workflow ejecuta pruebas y auditoría en PR y push. En main (o ejecución manual), analiza SonarQube, espera su quality gate y despliega un contenedor en el runner dentro del entorno GitHub `test`. Ejecuta ZAP autenticado con un usuario de prueba y después destruye el contenedor. Es un entorno temporal, sin URL pública ni retención de datos; no es un servidor de staging permanente.

Configurar los secretos de repositorio `SONAR_HOST_URL` y `SONAR_TOKEN`, y el proyecto SonarQube `registro-donantes`, accesible desde el runner. Configurar su quality gate con cobertura mínima de 80 %, cero vulnerabilidades y revisión de hotspots. Sin esos secretos el job falla explícitamente y no despliega. En PR se ejecutan solamente las verificaciones que no necesitan secretos.

SonarQube recibe el LCOV generado por Jest; el pipeline exporta cobertura, bugs, vulnerabilidades, code smells, deuda técnica (`sqale_index`, minutos), duplicación y hotspots. ZAP guarda HTML y JSON como artefactos. Los códigos de salida de advertencia o fallo bloquean el job para revisión; no se ignoran alertas automáticamente.

`openapi.json` describe las rutas de negocio usadas por ZAP. El escaneo usa rol usuario y no cubre el borrado autorizado de administrador ni los flujos públicos de autenticación; éstos tienen pruebas automatizadas. ZAP API utiliza su política orientada a API, por lo que no debe presentarse como un escaneo completo de XSS de navegador. Las entradas XSS se verifican además con Jest. Un futuro frontend deberá codificar las salidas según contexto.

Documentación oficial: [ZAP API Scan](https://www.zaproxy.org/docs/docker/api-scan/), [cobertura JavaScript en SonarQube](https://docs.sonarsource.com/sonarqube-server/2025.5/analyzing-source-code/test-coverage/javascript-typescript-test-coverage), [acción SonarQube](https://github.com/SonarSource/sonarqube-scan-action).

## Límites del prototipo

Se requieren HTTPS y un proxy configurado correctamente antes de exponerlo. El limitador reside en memoria por proceso; el hashing síncrono y SQLite son adecuados para este ejercicio, no para alta concurrencia. No incluye recuperación de contraseña, revocación individual de tokens, auditoría de operaciones ni copias de respaldo automatizadas. El endpoint de salud comprueba el proceso, no la disponibilidad completa de almacenamiento.
