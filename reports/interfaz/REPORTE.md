# Verificación de la interfaz web

Se comprobó el flujo real de la interfaz con Chromium mediante Playwright, usando una base SQLite en memoria y cuentas ficticias. El navegador terminó sin errores JavaScript no controlados.

- Registro de una cuenta y retorno al inicio de sesión.
- Login y estado inicial sin donantes.
- Registro de una persona, listado y acciones visibles según el rol.
- Búsqueda por nombre/correo y estado sin coincidencias.
- Presentación del error de correo duplicado.
- Cancelación y confirmación del borrado como administrador.
- Vista móvil de 390 píxeles sin desbordamiento horizontal de la página.
- Cierre de sesión ante respuesta 401 y mensaje legible ante límite de intentos 429.
- Con JavaScript deshabilitado, CSP bloquea los envíos nativos y evita que la contraseña aparezca en la URL.

Evidencia: `prueba-navegador.json`. Las pantallas de acceso, directorio y móvil también se revisaron visualmente. Esta verificación funcional no constituye una medición de cobertura de JavaScript del frontend; el 100 % de Jest corresponde al backend.

La sesión se mantiene exclusivamente en memoria. Recargar la página o cerrar la pestaña requiere iniciar sesión de nuevo. La interfaz no permite seleccionar el rol durante el registro y el servidor vuelve a verificar los permisos en cada operación.
