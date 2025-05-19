import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessStepRepository } from '@h2-trust/database';

@Injectable()
export class ProcessStepService {
  constructor(private readonly repository: ProcessStepRepository) {}

  async readProcessSteps(processType: string, active: boolean, companyId: string): Promise<ProcessStepEntity[]> {
    return this.repository.findProcessSteps(processType, active, companyId);
  }
}
