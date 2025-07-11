import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { BottlingDto, BottlingOverviewDto, ProcessType, ProductPassDto, UserDetailsDto } from '@h2-trust/api';
import { UserService } from '../user/user.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async createBottling(dto: BottlingDto, file: Express.Multer.File, userId: string): Promise<BottlingOverviewDto> {
    const payload = {
      processStepEntity: BottlingDto.toEntity({ ...dto, recordedBy: userId }),
      file,
    };

    return firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.BOTTLING, payload)).then(
      BottlingOverviewDto.fromEntity,
    );
  }

  async readBottlingsByCompany(userId: string): Promise<BottlingOverviewDto[]> {
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const companyIdOfUser = userDetailsDto.company.id;
    const payload = {
      processType: ProcessType.BOTTLING,
      active: true,
      companyId: companyIdOfUser,
    };

    return firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_ALL, payload)).then((processSteps) =>
      processSteps.map(BottlingOverviewDto.fromEntity),
    );
  }

  async readProductPass(processStepId: string): Promise<ProductPassDto> {
    const processStep: ProcessStepEntity = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }),
    );

    if (processStep.processType != ProcessType.BOTTLING) {
      throw new HttpException(
        `ProcessStep with ID ${processStepId} should be type BOTTLING, but is ${processStep.processType}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const productPassDto = ProductPassDto.fromEntityToDto(processStep);
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(productPassDto.producer);
    productPassDto.producer = userDetailsDto.company?.name;

    return productPassDto;
  }
}
