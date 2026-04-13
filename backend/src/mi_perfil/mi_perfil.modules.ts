import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiPerfilController } from './mi_perfil.controller';
import { MiPerfilService } from './mi_perfil.service';
import { Usuario } from '../entities/Usuario';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [MiPerfilController],
  providers: [MiPerfilService],
})
export class MiPerfilModule {}