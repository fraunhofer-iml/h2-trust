import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  UnitEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { UnitService } from './unit.service';

@Controller()
export class UnitController {
  constructor(private readonly service: UnitService) {}

  @MessagePattern(UnitMessagePatterns.READ)
  async readUnit(@Payload() payload: { id: string }): Promise<UnitEntity> {
    return this.service.readUnit(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS)
  async readPowerProductionUnits(companyId: string): Promise<PowerProductionUnitEntity[]> {
    return this.service.readPowerProductionUnits(companyId);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS)
  async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.service.readHydrogenProductionUnits(companyId);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS)
  async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.service.readHydrogenStorageUnits(companyId);
  }
}
