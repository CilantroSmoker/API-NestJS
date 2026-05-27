DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'SUPERVISOR'
      AND enumtypid = '"RolUsuario"'::regtype
  ) THEN
    ALTER TYPE "RolUsuario" ADD VALUE 'SUPERVISOR';
  END IF;
END $$;

ALTER TABLE "Venta"
  ADD COLUMN IF NOT EXISTS "tieneStockInsuficiente" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "autorizadoPorId" INTEGER,
  ADD COLUMN IF NOT EXISTS "motivoAutorizacion" TEXT;

ALTER TABLE "DetalleVenta"
  ADD COLUMN IF NOT EXISTS "stockInsuficiente" BOOLEAN NOT NULL DEFAULT false;
