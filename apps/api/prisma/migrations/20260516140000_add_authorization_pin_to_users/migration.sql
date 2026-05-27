ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "pinAutorizacionHash" TEXT;

UPDATE "Usuario"
SET "pinAutorizacionHash" = 'scrypt:pin-superadmin-seed-20260516:b0365ccdb64c4161c42743823df55ebbf27a3139d601e438f206f02bf6a5524023e9eb6a36692c05d1257826d3180ab148a83b07be701a1aedc08f5d87032899'
WHERE "email" = 'superadmin@minimarket.local'
  AND "pinAutorizacionHash" IS NULL;

UPDATE "Usuario"
SET "pinAutorizacionHash" = 'scrypt:pin-admin-seed-20260516:51972bdd44c8d853a441e74816b9e21cf46c3f56e5326dafdeb552a5743edaa96423fc7b3a68d4a1c715a13cf05fc63851862df735503ac85f23aeb2cb952e04'
WHERE "email" = 'admin@minimarket.local'
  AND "pinAutorizacionHash" IS NULL;

UPDATE "Usuario"
SET "pinAutorizacionHash" = 'scrypt:pin-supervisor-seed-20260516:b726e4ff9b124b27a920de6f4c483b8e964b6ebb07ac61960859811c5d9bb71cd9cd3bdcaa8ec2f74b6f943ba16f634ffa4788680bc5d02cc49d73d088e7f024'
WHERE "email" = 'supervisor@minimarket.local'
  AND "pinAutorizacionHash" IS NULL;
