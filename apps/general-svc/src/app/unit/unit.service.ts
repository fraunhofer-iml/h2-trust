import { Injectable } from '@nestjs/common';
import {
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  UnitEntity,
} from '@h2-trust/amqp';
import { UnitRepository } from '@h2-trust/database';

@Injectable()
export class UnitService {
  constructor(private readonly repository: UnitRepository) {}

  async readUnit(id: string): Promise<UnitEntity> {
    return this.repository.findUnitById(id);
  }

  async readPowerProductionUnits(companyId: string): Promise<PowerProductionUnitEntity[]> {
    return this.repository.findPowerProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.repository.findHydrogenProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.repository.findHydrogenStorageUnitsByCompanyId(companyId);
  }
}
