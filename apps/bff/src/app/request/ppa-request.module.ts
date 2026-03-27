import { Module } from '@nestjs/common';
import { PpaRequestController } from './ppa-request.controller';
import { PpaRequestService } from './ppa-request.service';

@Module({
  providers: [PpaRequestService],
  controllers: [PpaRequestController],
})
export class PpaRequestModule {}
