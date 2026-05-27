-- AlterTable
ALTER TABLE "Permiso" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Rol" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropEnum
DROP TYPE "RolUsuario";
