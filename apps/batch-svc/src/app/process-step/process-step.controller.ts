import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessingOverviewDto } from '@h2-trust/api';
import { ProcessStepService } from './process-step.service';

@Controller()
export class ProcessStepController {
  constructor(private readonly service: ProcessStepService) {}

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL)
  async readProcessSteps(
    @Payload() payload: { processName: string; active: boolean; companyId: string },
  ): Promise<ProcessingOverviewDto[]> {
    return this.service.readProcessSteps(payload.processName, payload.active, payload.companyId);
  }
}
