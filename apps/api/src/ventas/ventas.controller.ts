import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { ErrorResponseDto, VentaResponseDto } from '../docs/openapi-dtos';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/roles';

@Controller('ventas')
@ApiTags('ventas')
@ApiBearerAuth()
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear venta' })
  @ApiCreatedResponse({ description: 'Venta creada y stock descontado', type: VentaResponseDto })
  @ApiBadRequestResponse({ description: 'Stock insuficiente o datos invalidos', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Producto no encontrado', type: ErrorResponseDto })
  create(@Body() dto: CreateVentaDto, @CurrentUser() user: AuthUser) {
    return this.ventasService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas' })
  @ApiOkResponse({ description: 'Listado de ventas ordenadas por fecha descendente', type: [VentaResponseDto] })
  findAll(@CurrentUser() user: AuthUser) {
    return this.ventasService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener venta por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Venta encontrada', type: VentaResponseDto })
  @ApiNotFoundResponse({ description: 'Venta no encontrada', type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.ventasService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar venta y restaurar stock' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Venta eliminada y stock restaurado', type: VentaResponseDto })
  @ApiNotFoundResponse({ description: 'Venta no encontrada', type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.ventasService.remove(id, user);
  }
}
