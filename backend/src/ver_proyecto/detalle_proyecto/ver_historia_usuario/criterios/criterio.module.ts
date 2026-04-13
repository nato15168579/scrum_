import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriterioService } from './criterio.service';
import { CriterioController } from './criterio.controller';
import { CriteriosAceptacion } from '../../../../entities/CriteriosAceptacion';

@Module({
  imports: [TypeOrmModule.forFeature([CriteriosAceptacion])],
  controllers: [CriterioController], 
  providers: [CriterioService],    
})
export class CriterioModule {}