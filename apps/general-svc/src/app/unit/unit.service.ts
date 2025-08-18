import { Injectable } from '@nestjs/common';
import {
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  PowerProductionUnitTypeEntity,
  UnitEntity,
} from '@h2-trust/amqp';
import { PowerProductionUnitTypeRepository, UnitRepository } from '@h2-trust/database';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly powerProductionUnitTypeRepository: PowerProductionUnitTypeRepository,
  ) {}

  async readUnit(id: string): Promise<UnitEntity> {
    return this.unitRepository.findUnitById(id);
  }

  async readPowerProductionUnits(companyId: string): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.unitRepository.findHydrogenStorageUnitsByCompanyId(companyId);
  }

  async readPowerProductionUnitTypes(): Promise<PowerProductionUnitTypeEntity[]> {
    return this.powerProductionUnitTypeRepository.findPowerProductionUnitTypes();
  }
}
