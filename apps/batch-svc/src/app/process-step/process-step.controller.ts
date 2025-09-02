import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { BottlingService } from './bottling/bottling.service';
import { ProcessStepService } from './process-step.service';
import 'multer';


@Controller()
export class ProcessStepController {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
  ) { }

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL)
  async readProcessSteps(
    @Payload() payload: { processType: ProcessType; active: boolean; companyId: string },
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessSteps(payload.processType, payload.active, payload.companyId);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_UNIQUE)
  async readProcessStep(@Payload() payload: { processStepId: string }): Promise<ProcessStepEntity> {
    return this.processStepService.readProcessStep(payload.processStepId);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE)
  async createProcessStep(
    @Payload() payload: { processStepEntity: ProcessStepEntity; predecessors: string[] },
  ): Promise<ProcessStepEntity> {
    return this.processStepService.createProcessStep(payload.processStepEntity);
  }

  @MessagePattern(ProcessStepMessagePatterns.BOTTLING)
  async createBottling(
    @Payload() payload: { processStepEntity: ProcessStepEntity; files: Express.Multer.File[] },
  ): Promise<ProcessStepEntity> {
    return this.bottlingService.createBottling(payload.processStepEntity, payload.files);
  }
}
