import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { AuthUser, PERMISSIONS } from '../auth/roles';
import { ErrorResponseDto, UsuarioResponseDto } from '../docs/openapi-dtos';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@ApiTags('usuarios')
@ApiBearerAuth()
@Permissions(PERMISSIONS.USUARIOS_GESTIONAR)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiCreatedResponse({ description: 'Usuario creado sin exponer hashes', type: UsuarioResponseDto })
  @ApiBadRequestResponse({ description: 'Datos invalidos', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente o invalido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'No tiene permisos para gestionar usuarios', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Ya existe un usuario con ese email', type: ErrorResponseDto })
  create(@Body() dto: CreateUsuarioDto, @CurrentUser() user: AuthUser) {
    return this.usuariosService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({ description: 'Listado de usuarios sin hashes', type: [UsuarioResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Token ausente o invalido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'No tiene permisos para gestionar usuarios', type: ErrorResponseDto })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Usuario encontrado sin hashes', type: UsuarioResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente o invalido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'No tiene permisos para gestionar usuarios', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado', type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Usuario actualizado sin hashes', type: UsuarioResponseDto })
  @ApiBadRequestResponse({ description: 'Datos invalidos o regla de super admin activo incumplida', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente o invalido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'No tiene permisos para gestionar usuarios', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Ya existe un usuario con ese email', type: ErrorResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto, @CurrentUser() user: AuthUser) {
    return this.usuariosService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Usuario eliminado sin hashes', type: UsuarioResponseDto })
  @ApiBadRequestResponse({ description: 'No puede eliminarse a si mismo o dejar sin super admin activo', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente o invalido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'No tiene permisos para gestionar usuarios', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado', type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.usuariosService.remove(id, user);
  }
}
