import { Module } from '@nestjs/common';
import { AsigProVerController } from './asigprover.controller';
import { AsigProVerService } from './asigprover.service';

@Module({
  controllers: [AsigProVerController],
  providers: [AsigProVerService],
  exports: [AsigProVerService]
})
export class AsigProVerModule {}