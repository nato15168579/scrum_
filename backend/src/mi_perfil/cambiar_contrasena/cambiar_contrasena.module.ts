import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../entities/usuario'; // Ajusta la ruta a tu entidad
import { CambiarContrasenaController } from './cambiar_contrasena.controller';
import { CambiarContrasenaService } from './cambiar_contrasena.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [CambiarContrasenaController],
  providers: [CambiarContrasenaService],
})
export class CambiarContrasenaModule {}