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
    return this.repository.readUnitById(id);
  }

  async readPowerProductionUnits(companyId: string): Promise<PowerProductionUnitEntity[]> {
    return this.repository.readPowerProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.repository.readHydrogenProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.repository.readHydrogenStorageUnitsByCompanyId(companyId);
  }
}
