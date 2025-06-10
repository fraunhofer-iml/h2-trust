import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { BottlingDto, ProcessingOverviewDto, ProcessStepDto, ProcessType, ProductionOverviewDto } from '@h2-trust/api';
import { UserService } from '../user/user.service';

@Injectable()
export class ProcessStepService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async readProduction(userId: string): Promise<ProductionOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);
    const companyId = userDetails.company.id;

    return firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_ALL, {
        processType: ProcessType.HYDROGEN_PRODUCTION,
        active: true,
        companyId: companyId,
      }),
    ).then((entities) => entities.map(ProductionOverviewDto.fromEntity));
  }

  async readProcessing(userId: string): Promise<ProcessingOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);
    const companyId = userDetails.company.id;

    return firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_ALL, {
        processType: ProcessType.BOTTLING,
        active: true,
        companyId: companyId,
      }),
    ).then((entities) => entities.map(ProcessingOverviewDto.fromEntity));
  }

  async executeBottling(dto: BottlingDto, file: Express.Multer.File, userId: string): Promise<ProcessStepDto> {
    return firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.BOTTLING, {
        processStepData: BottlingDto.toEntity({ ...dto, recordedBy: userId }),
        file: file,
      }),
    );
  }
}
