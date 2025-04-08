import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessStepService } from './process-step.service';

@Controller()
export class ProcessStepController {
  constructor(private readonly service: ProcessStepService) {}

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL)
  async readProcessSteps(
    @Payload() payload: { processTypeName: string; active: boolean; companyId: string },
  ): Promise<ProcessStepEntity[]> {
    return this.service.readProcessSteps(payload.processTypeName, payload.active, payload.companyId);
  }
}
