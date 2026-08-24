# Interclases LJV

Aplicacion web para gestionar y consultar las interclases de futbol del Colegio Lucrecio Jaramillo Velez, construida con Node.js, Express y el patron MVC.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Rutas

- `GET /`: pagina principal con resumen y proximos partidos.
- `GET /api/equipos`: lista de equipos en formato JSON.
- `GET /api/partidos`: lista de partidos con nombres de equipos.

## Arquitectura

```text
server.js                  # Arranque del servidor
src/
  app.js                   # Configuracion de Express
  config/                  # Variables de entorno y configuracion
  controllers/             # Reciben peticiones y preparan respuestas
  middlewares/             # Errores y futuras validaciones/autenticacion
  models/                  # Acceso a datos; ahora en memoria
  routes/                  # Rutas web y API
  services/                # Reglas de negocio del torneo
  views/                   # Plantillas EJS
  public/                  # CSS, imagenes y JavaScript del navegador
```

Los modelos actuales usan datos en memoria para dejar la arquitectura lista. El siguiente paso natural es reemplazarlos por repositorios conectados a PostgreSQL, MySQL o MongoDB.
