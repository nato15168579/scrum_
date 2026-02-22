import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrearproController } from './crearpro.controller';
import { CrearproService } from './crearpro.service';
import { Proyecto } from '../entities/Proyecto'; 
import { UsuProDetPar } from '../entities/UsuProDetPar'; 

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, UsuProDetPar])], 
  controllers: [CrearproController],
  providers: [CrearproService],
})
export class CrearproModule {}