# Minimarket

Aplicacion de minimarket con backend en NestJS, frontend en React/Vite, Prisma y PostgreSQL.

## Requisitos

- Node.js
- pnpm
- Docker Desktop

En Windows con PowerShell se recomienda usar `pnpm.cmd`. Si tu terminal permite ejecutar `pnpm` directamente, puedes usar `pnpm` en lugar de `pnpm.cmd`.

## Instalacion

Desde la raiz del proyecto:

```bash
pnpm.cmd install
```

## Base de datos

Levantar PostgreSQL con Docker:

```bash
docker compose -f infra/docker-compose.yml up -d
```

La base de datos local queda disponible en:

```txt
postgresql://app:secret@127.0.0.1:5431/minimarket?schema=public
```

Crear o actualizar tablas con Prisma:

```bash
cd apps/api
pnpm.cmd exec prisma migrate dev
```

Cargar datos de prueba:

```bash
pnpm.cmd db:seed
```

El seed limpia los datos existentes y carga categorias, proveedores y 10.000 productos. Ejecutalo solo cuando necesites cargar o resetear datos.

## Ejecucion

Desde la raiz del proyecto:

```bash
pnpm.cmd run start:dev
```

Ese comando levanta PostgreSQL con Docker, el backend y el frontend. No ejecuta migraciones ni seed.

URLs principales:

```txt
Frontend: http://localhost:5173/api
Backend:  http://localhost:3000/api
Swagger:  http://localhost:3000/docs
```

## Swagger / OpenAPI

La documentacion del backend NestJS esta disponible en:

```txt
http://localhost:3000/docs
```

Incluye controllers, DTOs, parametros, queries, respuestas, errores y ejemplos para:

- Categorias
- Proveedores
- Productos
- Movimientos de stock
- Ventas

## Resumen de endpoints

Categorias:

```txt
GET    /api/categorias
POST   /api/categorias
GET    /api/categorias/:id
PATCH  /api/categorias/:id
DELETE /api/categorias/:id
```

Proveedores:

```txt
GET    /api/proveedores
POST   /api/proveedores
GET    /api/proveedores/:id
PATCH  /api/proveedores/:id
DELETE /api/proveedores/:id
```

Productos:

```txt
GET    /api/productos
POST   /api/productos
GET    /api/productos/alertas/stock-bajo
GET    /api/productos/:id
PATCH  /api/productos/:id
DELETE /api/productos/:id
```

Queries principales de productos:

```txt
q, nombre, categoriaId, proveedorId, stockBajo,
precioMin, precioMax, stockMin, stockMax, page, limit
```

Movimientos:

```txt
GET  /api/movimientos
POST /api/movimientos
GET  /api/movimientos/:id
```

Ventas:

```txt
GET    /api/ventas
POST   /api/ventas
GET    /api/ventas/:id
DELETE /api/ventas/:id
```

## Consumo desde el frontend

El frontend consume la API desde `apps/web/src/api/client.ts`, usando como base:

```txt
http://localhost:3000/api
```

Vistas y endpoints consumidos:

- `Categorias`: `GET /categorias`, `POST /categorias`, `PATCH /categorias/:id`, `DELETE /categorias/:id`
- `Proveedores`: `GET /proveedores`, `POST /proveedores`, `PATCH /proveedores/:id`, `DELETE /proveedores/:id`
- `Productos`: `GET /productos`, `GET /categorias`, `GET /proveedores`, `POST /productos`, `PATCH /productos/:id`, `DELETE /productos/:id`
- `Movimientos`: `GET /movimientos`, `GET /productos?limit=100`, `POST /movimientos`
- `Ventas`: `GET /ventas`, `GET /productos?limit=100`, `GET /productos?q=...&limit=100`, `POST /ventas`, `DELETE /ventas/:id`

Swagger/OpenAPI documenta solo el backend. Los componentes frontend no se documentan con Swagger.

## Archivos no versionados

El repositorio ignora dependencias, builds, coverage y logs. El `.env` local de la base de datos y el cliente Prisma generado se mantienen en el proyecto para simplificar la ejecucion local.
