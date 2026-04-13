import { Module } from '@nestjs/common';
import { DetproController } from './detpro.controller';
import { DetproService } from './detpro.service';

@Module({
  controllers: [DetproController], 
  providers: [DetproService],
})
export class DetproModule {}