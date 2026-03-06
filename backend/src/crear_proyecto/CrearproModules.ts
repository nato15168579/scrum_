import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrearproController } from './CrearproController';
import { CrearproService } from './CrearproService';
import { Proyecto } from '../entities/Proyecto'; 
import { UsuProDetPar } from '../entities/UsuProDetPar'; 

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto, UsuProDetPar])], 
  controllers: [CrearproController],
  providers: [CrearproService],
})
export class CrearproModule {}