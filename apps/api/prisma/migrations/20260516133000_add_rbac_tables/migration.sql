CREATE TABLE IF NOT EXISTS "Rol" (
  "id" SERIAL NOT NULL,
  "codigo" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Permiso" (
  "id" SERIAL NOT NULL,
  "codigo" TEXT NOT NULL,
  "modulo" TEXT NOT NULL,
  "descripcion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RolPermiso" (
  "rolId" INTEGER NOT NULL,
  "permisoId" INTEGER NOT NULL,
  CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("rolId", "permisoId")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Rol_codigo_key" ON "Rol"("codigo");
CREATE UNIQUE INDEX IF NOT EXISTS "Permiso_codigo_key" ON "Permiso"("codigo");
CREATE INDEX IF NOT EXISTS "RolPermiso_permisoId_idx" ON "RolPermiso"("permisoId");

ALTER TABLE "RolPermiso"
  ADD CONSTRAINT "RolPermiso_rolId_fkey"
  FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RolPermiso"
  ADD CONSTRAINT "RolPermiso_permisoId_fkey"
  FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Rol" ("codigo", "nombre", "descripcion")
VALUES
  ('SUPER_ADMIN', 'Super admin', 'Acceso completo al sistema'),
  ('ADMIN', 'Admin', 'Administracion operativa del minimarket'),
  ('SUPERVISOR', 'Supervisor', 'Supervision de operaciones y autorizaciones'),
  ('VENDEDOR', 'Vendedor', 'Operacion de ventas')
ON CONFLICT ("codigo") DO UPDATE
SET "nombre" = EXCLUDED."nombre",
    "descripcion" = EXCLUDED."descripcion",
    "activo" = true,
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Permiso" ("codigo", "modulo", "descripcion")
VALUES
  ('usuarios.gestionar', 'usuarios', 'Crear, editar, listar y eliminar usuarios'),
  ('stock.autorizar', 'ventas', 'Autorizar ventas con stock insuficiente')
ON CONFLICT ("codigo") DO UPDATE
SET "modulo" = EXCLUDED."modulo",
    "descripcion" = EXCLUDED."descripcion",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "RolPermiso" ("rolId", "permisoId")
SELECT r."id", p."id"
FROM "Rol" r
CROSS JOIN "Permiso" p
WHERE r."codigo" = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO "RolPermiso" ("rolId", "permisoId")
SELECT r."id", p."id"
FROM "Rol" r
JOIN "Permiso" p ON p."codigo" = 'stock.autorizar'
WHERE r."codigo" IN ('ADMIN', 'SUPERVISOR')
ON CONFLICT DO NOTHING;

ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "rolId" INTEGER;

UPDATE "Usuario" u
SET "rolId" = r."id"
FROM "Rol" r
WHERE r."codigo" = u."rol"::text
  AND u."rolId" IS NULL;

UPDATE "Usuario" u
SET "rolId" = r."id"
FROM "Rol" r
WHERE r."codigo" = 'ADMIN'
  AND u."rolId" IS NULL;

ALTER TABLE "Usuario" ALTER COLUMN "rolId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Usuario_rolId_fkey'
  ) THEN
    ALTER TABLE "Usuario"
      ADD CONSTRAINT "Usuario_rolId_fkey"
      FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Usuario_rolId_idx" ON "Usuario"("rolId");

ALTER TABLE "Usuario" DROP COLUMN IF EXISTS "rol";
