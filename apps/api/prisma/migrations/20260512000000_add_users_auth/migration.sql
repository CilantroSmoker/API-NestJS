DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RolUsuario') THEN
    CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Usuario" (
  "id" SERIAL NOT NULL,
  "nombre" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "rol" "RolUsuario" NOT NULL DEFAULT 'ADMIN',
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Usuario'
      AND column_name = 'rol'
      AND udt_name <> 'RolUsuario'
  ) THEN
    ALTER TABLE "Usuario" ALTER COLUMN "rol" DROP DEFAULT;
    ALTER TABLE "Usuario"
      ALTER COLUMN "rol" TYPE "RolUsuario"
      USING "rol"::text::"RolUsuario";
    ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'ADMIN'::"RolUsuario";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Usuario' AND column_name = 'password'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Usuario' AND column_name = 'passwordHash'
  ) THEN
    ALTER TABLE "Usuario" RENAME COLUMN "password" TO "passwordHash";
  END IF;
END $$;

ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS "Usuario_email_key" ON "Usuario"("email");

INSERT INTO "Usuario" ("nombre", "email", "passwordHash", "rol", "activo", "updatedAt")
VALUES
  (
    'Super Admin',
    'superadmin@minimarket.local',
    'scrypt:superadmin-seed-20260512:d3166545d33e8a21548d51a6ac77e669a6bc7696a44a7515fd4648688dfeb948a79ef79cdf3046ba569f0aa4f00849699784eac97dc8ab68ad37568e5dbc1b6d',
    'SUPER_ADMIN',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'Admin',
    'admin@minimarket.local',
    'scrypt:admin-seed-20260512:bbe04bac651274fea9135a68c10f028b76517334b67ba304325d6037b750536165f673268c3c664609c82ac484b9def7bff4729e597fa5dd6e61b1f8dece8be4',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("email") DO NOTHING;
