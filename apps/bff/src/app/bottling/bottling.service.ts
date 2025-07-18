import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BottlingMessagePatterns,
  BrokerQueues,
  HydrogenCompositionEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import {
  BottlingDto,
  BottlingOverviewDto,
  HydrogenCompositionDto,
  ProcessType,
  ProductPassDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { UserService } from '../user/user.service';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processService: ClientProxy,
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
    const processStepEntity: ProcessStepEntity = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }),
    );
    if (processStepEntity.processType != ProcessType.BOTTLING) {
      throw new HttpException(
        `ProcessStep with ID ${processStepId} should be of type ${ProcessType.BOTTLING}, but is ${processStepEntity.processType}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const productPassDto = ProductPassDto.fromEntityToDto(processStepEntity);

    const producer: UserDetailsDto = await firstValueFrom(
      this.generalService.send(UserMessagePatterns.READ_WITH_COMPANY, { id: productPassDto.producer }),
    );
    productPassDto.producer = producer.company?.name;

    const hydrogenCompositions: HydrogenCompositionEntity[] = await firstValueFrom(
      this.processService.send(BottlingMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, processStepEntity.id),
    );
    productPassDto.hydrogenComposition = hydrogenCompositions.map(HydrogenCompositionDto.of);

    return productPassDto;
  }
}
