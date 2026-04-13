import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsigIntegrantesController } from './asig-integrantes.controller';
import { AsigIntegrantesService } from './asig-integrantes.service';
import { Usuario } from '../../entities/Usuario';
import { UsuProDetPar } from '../../entities/UsuProDetPar';

@Module({
  imports: [
    // Registramos las entidades para que el Service pueda usar @InjectRepository
    TypeOrmModule.forFeature([Usuario, UsuProDetPar])
  ],
  controllers: [AsigIntegrantesController],
  providers: [AsigIntegrantesService],
})
export class AsigIntegrantesModule {}