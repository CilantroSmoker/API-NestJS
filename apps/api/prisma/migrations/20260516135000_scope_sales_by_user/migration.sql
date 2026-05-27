ALTER TABLE "Venta" ADD COLUMN IF NOT EXISTS "vendedorId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Venta_vendedorId_fkey'
  ) THEN
    ALTER TABLE "Venta"
      ADD CONSTRAINT "Venta_vendedorId_fkey"
      FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Venta_vendedorId_idx" ON "Venta"("vendedorId");
