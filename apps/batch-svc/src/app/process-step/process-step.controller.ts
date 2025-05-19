import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { BottlingService } from './bottling.service';
import { ProcessStepService } from './process-step.service';
import 'multer';

@Controller()
export class ProcessStepController {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
  ) {}

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL)
  async readProcessSteps(
    @Payload() payload: { processType: ProcessType; active: boolean; companyId: string },
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessSteps(payload.processType, payload.active, payload.companyId);
  }

  @MessagePattern(ProcessStepMessagePatterns.BOTTLING)
  async executeBottling(
    @Payload() payload: { processStepData: ProcessStepEntity; file: Express.Multer.File },
  ): Promise<ProcessStepEntity> {
    return this.bottlingService.executeBottling(payload.processStepData, payload.file);
  }
}
