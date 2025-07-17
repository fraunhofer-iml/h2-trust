import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerException, BrokerQueues, UnitMessagePatterns } from '@h2-trust/amqp';
import {
  HydrogenProductionOverviewDto,
  HydrogenStorageOverviewDto,
  PowerProductionOverviewDto,
  UnitDto,
  UnitOverviewDto,
  UnitType,
} from '@h2-trust/api';
import { UserService } from '../user/user.service';

@Injectable()
export class UnitService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) { }

  readUnit(id: string): Promise<UnitDto> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, { id }));
  }

  async readUnits(userId: string, unitType: UnitType): Promise<UnitOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);
    const companyId = userDetails.company.id;

    switch (unitType) {
      case UnitType.POWER_PRODUCTION:
        return this.readPowerProductionUnits(companyId);
      case UnitType.HYDROGEN_PRODUCTION:
        return this.readHydrogenProductionUnits(companyId);
      case UnitType.HYDROGEN_STORAGE:
        return this.readHydrogenStorageUnits(companyId);
      case undefined: {
        const powerProductionUnits = await this.readPowerProductionUnits(companyId);
        const hydrogenProductionUnits = await this.readHydrogenProductionUnits(companyId);
        const hydrogenStorageUnits = await this.readHydrogenStorageUnits(companyId);
        return [...powerProductionUnits, ...hydrogenProductionUnits, ...hydrogenStorageUnits];
      }
      default:
        throw new BrokerException(`unit-type ${unitType} unknown`, HttpStatus.BAD_REQUEST);
    }
  }

  private async readPowerProductionUnits(companyId: string): Promise<PowerProductionOverviewDto[]> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS, { companyId }),
    ).then((entities) => entities.map(PowerProductionOverviewDto.fromEntity));
  }

  private async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionOverviewDto[]> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS, { companyId }),
    ).then((entities) => entities.map(HydrogenProductionOverviewDto.fromEntity));
  }

  private async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageOverviewDto[]> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS, { companyId }),
    ).then((entities) => entities.map(HydrogenStorageOverviewDto.fromEntity));
  }
}
