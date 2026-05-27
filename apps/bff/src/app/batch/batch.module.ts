import { Module } from '@nestjs/common';
import { getProcessSvcBroker } from '@h2-trust/messaging';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  providers: [BatchService],
  imports: [getProcessSvcBroker()],
  controllers: [BatchController],
})
export class BatchModule {}
