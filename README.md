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

Para preparar el proyecto completo desde cero:

```bash
pnpm.cmd run setup
```

Ese comando instala dependencias, levanta PostgreSQL, aplica migraciones y carga datos de prueba.

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
pnpm.cmd run migrate
```

Cargar datos de prueba:

```bash
pnpm.cmd db:seed
```

El seed limpia los datos existentes y carga categorias, proveedores y un catalogo controlado de productos. Por defecto crea 480 productos y puedes cambiarlo con `SEED_PRODUCT_COUNT`.

## Ejecucion

Desde la raiz del proyecto:

```bash
pnpm.cmd run start:dev
```

Ese comando levanta PostgreSQL con Docker, el backend y el frontend. No ejecuta migraciones ni seed.

URLs principales:

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api
Swagger:  http://localhost:3000/docs
```

## Swagger / OpenAPI

La documentacion del backend NestJS esta disponible en:

```txt
http://localhost:3000/docs
```

Incluye controllers, DTOs, parametros, queries, respuestas, errores y ejemplos para:

- Auth
- Usuarios
- Categorias
- Proveedores
- Productos
- Movimientos de stock
- Ventas

## Resumen de endpoints

Auth:

```txt
POST /api/auth/login
GET  /api/auth/me
```

Usuarios:

```txt
GET    /api/usuarios
POST   /api/usuarios
GET    /api/usuarios/:id
PATCH  /api/usuarios/:id
DELETE /api/usuarios/:id
```

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

- `Login`: `POST /auth/login`, `GET /auth/me`
- `Usuarios`: `GET /usuarios`, `POST /usuarios`, `PATCH /usuarios/:id`, `DELETE /usuarios/:id`
- `Categorias`: `GET /categorias`, `POST /categorias`, `PATCH /categorias/:id`, `DELETE /categorias/:id`
- `Proveedores`: `GET /proveedores`, `POST /proveedores`, `PATCH /proveedores/:id`, `DELETE /proveedores/:id`
- `Productos`: `GET /productos`, `GET /categorias`, `GET /proveedores`, `POST /productos`, `PATCH /productos/:id`, `DELETE /productos/:id`
- `Movimientos`: `GET /movimientos`, `GET /productos?limit=100`, `POST /movimientos`
- `Ventas`: `GET /ventas`, `GET /productos?limit=100`, `GET /productos?q=...&limit=100`, `POST /ventas`, `DELETE /ventas/:id`

Swagger/OpenAPI documenta solo el backend. Los componentes frontend no se documentan con Swagger.

## Validaciones y errores

Los DTOs del backend usan `class-validator` y `class-transformer`, con validacion global en `main.ts`:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

Ejemplos de validaciones aplicadas:

- `LoginDto`: email valido y password con minimo de 6 caracteres.
- `CreateProductoDto`: nombre obligatorio, precio numerico y no negativo, stock entero no negativo.
- `CreateMovimientoDto`: tipo como enum (`ENTRADA`, `SALIDA`, `AJUSTE`) y cantidad entera mayor o igual a 1.
- `CreateVentaDto`: arreglo de detalles obligatorio y al menos un item.

Ejemplo de error real de validacion:

```txt
400 Bad Request
nombre must be a string
precio must not be less than 0
stock must not be less than 0
stock must be an integer number
categoriaId must be an integer number
```

## Scripts utiles

```txt
pnpm.cmd run setup             Instala dependencias, levanta DB, migra y carga seed
pnpm.cmd run start:dev         Levanta PostgreSQL, backend y frontend
pnpm.cmd run migrate           Aplica migraciones Prisma
pnpm.cmd run migrate:status    Revisa estado de migraciones
pnpm.cmd run prisma:validate   Valida el schema Prisma
pnpm.cmd run build             Compila backend y frontend
pnpm.cmd run test              Ejecuta tests unitarios del backend
pnpm.cmd run test:e2e          Ejecuta tests e2e del backend
```

## Archivos no versionados

El repositorio ignora dependencias, builds, coverage y logs. El `.env` local de la base de datos y el cliente Prisma generado se mantienen en el proyecto para simplificar la ejecucion local.
