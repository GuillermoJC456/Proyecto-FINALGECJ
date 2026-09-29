# Reporte de pruebas unitarias e integración

Ejecución local: 28/09/2026 20:16. Comando: `node node_modules/jest/bin/jest.js --runInBand --coverage --json`.

Resultado: 8 pruebas aprobadas, 0 fallidas, 1 suite aprobada. Cobertura: 100 % en sentencias, ramas, funciones y líneas de src/app.js y src/store.js; umbral exigido: 80 %. src/server.js y scripts/create-admin.js no se instrumentan.

La suite combina pruebas unitarias del hash y pruebas HTTP de integración con Supertest y SQLite real en memoria. El porcentaje no representa cobertura de todo el despliegue.

Archivos: jest-results.json (casos, estado y duración), ejecucion.txt (salida), coverage/coverage-summary.json (métricas), coverage/lcov.info (importación SonarQube), coverage/lcov-report/index.html (reporte visual).
