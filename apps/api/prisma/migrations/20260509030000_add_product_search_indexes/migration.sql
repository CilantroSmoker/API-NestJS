CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "codigoBarra" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Producto_codigoBarra_key" ON "Producto"("codigoBarra");
CREATE INDEX IF NOT EXISTS "Producto_categoriaId_idx" ON "Producto"("categoriaId");
CREATE INDEX IF NOT EXISTS "Producto_precio_idx" ON "Producto"("precio");
CREATE INDEX IF NOT EXISTS "Producto_stock_idx" ON "Producto"("stock");
CREATE INDEX IF NOT EXISTS "Producto_nombre_trgm_idx" ON "Producto" USING GIN ("nombre" gin_trgm_ops);
