import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './roles';
import { AuthUserDto, ErrorResponseDto, LoginResponseDto } from '../docs/openapi-dtos';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion' })
  @ApiOkResponse({ description: 'Sesion iniciada correctamente', type: LoginResponseDto })
  @ApiBadRequestResponse({ description: 'Datos invalidos', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales invalidas', type: ErrorResponseDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiOkResponse({ description: 'Usuario autenticado actual', type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: 'Token invalido o sesion expirada', type: ErrorResponseDto })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user);
  }
}
