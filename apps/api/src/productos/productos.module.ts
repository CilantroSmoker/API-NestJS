import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { ProductosRepository } from './productos.repository';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService, ProductosRepository],
})
export class ProductosModule {}
