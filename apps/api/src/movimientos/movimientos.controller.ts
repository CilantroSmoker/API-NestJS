import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Post()
  create(@Body() dto: CreateMovimientoDto) {
    return this.movimientosService.create(dto);
  }

  @Get()
  findAll(@Query('productoId') productoId?: string) {
    return this.movimientosService.findAll(productoId ? +productoId : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosService.findOne(id);
  }
}