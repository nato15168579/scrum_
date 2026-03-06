import { Module } from '@nestjs/common';
import { AsigProVerController } from './AsigproverController';
import { AsigProVerService } from './AsigproverService';

@Module({
  controllers: [AsigProVerController],
  providers: [AsigProVerService],
  exports: [AsigProVerService]
})
export class AsigProVerModule {}