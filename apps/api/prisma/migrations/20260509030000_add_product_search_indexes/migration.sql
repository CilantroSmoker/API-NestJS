CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Producto" ADD COLUMN "codigoBarra" TEXT;

CREATE UNIQUE INDEX "Producto_codigoBarra_key" ON "Producto"("codigoBarra");
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");
CREATE INDEX "Producto_precio_idx" ON "Producto"("precio");
CREATE INDEX "Producto_stock_idx" ON "Producto"("stock");
CREATE INDEX "Producto_nombre_trgm_idx" ON "Producto" USING GIN ("nombre" gin_trgm_ops);
