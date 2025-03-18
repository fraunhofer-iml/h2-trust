import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AmqpClientEnum, UnitMessagePatterns } from '@h2-trust/amqp';
import { UnitDto, UnitOverviewDto, UnitType } from '@h2-trust/api';

@Injectable()
export class UnitService {
  constructor(@Inject(AmqpClientEnum.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  readUnit(id: string): Promise<UnitDto> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, { id }));
  }

  readUnits(companyId: string, unitType: UnitType): Promise<UnitOverviewDto[]> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ_ALL, { companyId, unitType }));
  }
}
