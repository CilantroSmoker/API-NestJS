import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { PasswordService } from '../auth/password.service';

@Module({
  controllers: [VentasController],
  providers: [VentasService, PasswordService],
})
export class VentasModule {}
