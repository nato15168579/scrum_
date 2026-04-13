import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReunionesController } from './reuniones.controller';
import { ReunionesService } from './reuniones.service';
import { Reuniones } from '../../../entities/Reuniones';
import { Sprint } from '../../../entities/Sprint';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reuniones, Sprint])
  ],
  controllers: [ReunionesController],
  providers: [ReunionesService],
})
export class ReunionModule {}