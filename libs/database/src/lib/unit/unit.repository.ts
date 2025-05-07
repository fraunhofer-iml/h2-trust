import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BrokerException,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  UnitEntity,
} from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import {
  allUnitsResultFields,
  hydrogenProductionUnitResultFields,
  hydrogenStorageUnitResultFields,
  powerProductionUnitResultFields,
} from '../queries';
import { retrieveRecordOrThrowException } from '../utils/utils';

@Injectable()
export class UnitRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnitById(id: string): Promise<UnitEntity> {
    return this.prismaService.unit
      .findUnique({
        where: {
          id: id,
        },
        ...allUnitsResultFields,
      })
      .then((result) => retrieveRecordOrThrowException(result, id, 'Unit'))
      .then(this.mapToActualUnitEntity);
  }

  async findPowerProductionUnitsByCompanyId(companyId: string): Promise<PowerProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          companyId: companyId,
          powerProductionUnit: {
            isNot: null,
          },
        },
        ...powerProductionUnitResultFields,
      })
      .then((units) => units.map(PowerProductionUnitEntity.fromDatabase));
  }

  async findHydrogenProductionUnitsByCompanyId(companyId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          companyId: companyId,
          hydrogenProductionUnit: {
            isNot: null,
          },
        },
        ...hydrogenProductionUnitResultFields,
      })
      .then((units) => units.map(HydrogenProductionUnitEntity.fromDatabase));
  }

  async findHydrogenStorageUnitsByCompanyId(companyId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          companyId: companyId,
          hydrogenStorageUnit: {
            isNot: null,
          },
        },
        ...hydrogenStorageUnitResultFields,
      })
      .then((units) => units.map(HydrogenStorageUnitEntity.fromDatabase));
  }

  mapToActualUnitEntity(_unit: Prisma.UnitGetPayload<typeof allUnitsResultFields>): UnitEntity {
    const { powerProductionUnit, hydrogenProductionUnit, hydrogenStorageUnit, ...unit } = _unit;

    if (powerProductionUnit) {
      return PowerProductionUnitEntity.fromDatabase({
        powerProductionUnit,
        ...unit,
      });
    }

    if (hydrogenProductionUnit) {
      return HydrogenProductionUnitEntity.fromDatabase({
        hydrogenProductionUnit,
        ...unit,
      });
    }

    if (hydrogenStorageUnit) {
      return HydrogenStorageUnitEntity.fromDatabase({
        hydrogenStorageUnit,
        ...unit,
      });
    }

    throw new BrokerException(`Incompatible unit`, HttpStatus.BAD_REQUEST);
  }
}
