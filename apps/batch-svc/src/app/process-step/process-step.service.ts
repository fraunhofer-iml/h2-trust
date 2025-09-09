import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ConfigurationService, MinioConfiguration } from '@h2-trust/configuration';
import { ProcessStepRepository } from '@h2-trust/database';

@Injectable()
export class ProcessStepService {
  constructor(
    private readonly repository: ProcessStepRepository,
    private readonly configurationService: ConfigurationService,
  ) {}

  async readProcessSteps(processTypes: string[], active: boolean, companyId: string): Promise<ProcessStepEntity[]> {
    return this.repository.findProcessSteps(processTypes, active, companyId);
  }

  async readProcessStep(processStepId: string): Promise<ProcessStepEntity> {
    const processStep: ProcessStepEntity = await this.repository.findProcessStep(processStepId);

    const minio: MinioConfiguration = this.configurationService.getGlobalConfiguration().minio;

    for (let i = 0; i < processStep.documents?.length; i++) {
      const document = processStep.documents[i];

      if (document.location) {
        document.location = `http://${minio.endPoint}:${minio.port}/${minio.bucketName}/${document.location}`;
        document.description = `File #${i}`;
      }
    }

    return processStep;
  }

  async createProcessStep(processStepData: ProcessStepEntity): Promise<ProcessStepEntity> {
    return this.repository.insertProcessStep(processStepData);
  }
}
