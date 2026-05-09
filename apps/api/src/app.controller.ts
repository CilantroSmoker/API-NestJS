import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar que la API esta activa' })
  @ApiOkResponse({ description: 'Mensaje simple de estado', schema: { example: 'Hello World!' } })
  getHello(): string {
    return this.appService.getHello();
  }
}
