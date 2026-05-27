import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ErrorResponseDto, ProveedorDetailDto, ProveedorListItemDto, ProveedorResponseDto } from '../docs/openapi-dtos';

@Controller('proveedores')
@ApiTags('proveedores')
@ApiBearerAuth()
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear proveedor' })
  @ApiCreatedResponse({ description: 'Proveedor creado', type: ProveedorResponseDto })
  @ApiBadRequestResponse({ description: 'Datos invalidos', type: ErrorResponseDto })
  create(@Body() dto: CreateProveedorDto) {
    return this.proveedoresService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar proveedores' })
  @ApiQuery({ name: 'nombre', required: false, description: 'Filtra por nombre', example: 'central' })
  @ApiOkResponse({ description: 'Listado de proveedores ordenados por nombre', type: [ProveedorListItemDto] })
  findAll(@Query('nombre') nombre?: string) {
    return this.proveedoresService.findAll(nombre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Proveedor encontrado con productos asociados', type: ProveedorDetailDto })
  @ApiNotFoundResponse({ description: 'Proveedor no encontrado', type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Proveedor actualizado', type: ProveedorResponseDto })
  @ApiBadRequestResponse({ description: 'Datos invalidos', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Proveedor no encontrado', type: ErrorResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProveedorDto) {
    return this.proveedoresService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proveedor' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Proveedor eliminado', type: ProveedorResponseDto })
  @ApiNotFoundResponse({ description: 'Proveedor no encontrado', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'No se puede eliminar si tiene productos asociados', type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.remove(id);
  }
}
