import { HttpStatus, Injectable } from '@nestjs/common';
import { AmqpException } from '@h2-trust/amqp';
import {
  HydrogenProductionOverviewDto,
  hydrogenProductionOverviewResultFields,
  HydrogenStorageOverviewDto,
  hydrogenStorageOverviewResultFields,
  PowerProductionOverviewDto,
  powerProductionUnitResultFields,
  UnitDto,
  UnitOverviewDto,
  UnitType,
  unitUnionResultFields,
} from '@h2-trust/api';
import { PrismaService, retrieveEntityOrThrow } from '@h2-trust/database';
import {
  flatUnit,
  mapToHydrogenProductionUnitsOverview,
  mapToHydrogenStorageUnitOverviews,
  mapToPowerProductionUnitsOverview,
} from './unit.mapper';

// TODO-MP: move prisma calls to database lib
@Injectable()
export class UnitService {
  constructor(private readonly prismaService: PrismaService) {}

  async readUnit(id: string): Promise<UnitDto> {
    return this.prismaService.unit
      .findUnique({
        where: {
          id: id,
        },
        ...unitUnionResultFields,
      })
      .then((result) => retrieveEntityOrThrow(result, id, 'Unit'))
      .then(flatUnit);
  }

  async readUnits(companyId: string, unitType: string): Promise<UnitOverviewDto[]> {
    switch (unitType) {
      case UnitType.powerProductionUnit:
        return this.readPowerProductionUnits(companyId);
      case UnitType.hydrogenProductionUnit:
        return this.readHydrogenProductionUnits(companyId);
      case UnitType.hydrogenStorageUnit:
        return this.readHydrogenStorageUnits(companyId);
      case undefined: {
        const powerProductionUnits = await this.readPowerProductionUnits(companyId);
        const hydrogenProductionUnits = await this.readHydrogenProductionUnits(companyId);
        const hydrogenStorageUnits = await this.readHydrogenStorageUnits(companyId);
        return [...powerProductionUnits, ...hydrogenProductionUnits, ...hydrogenStorageUnits];
      }
      default:
        throw new AmqpException(`unit-type ${unitType} unknown`, HttpStatus.BAD_REQUEST);
    }
  }

  private async readPowerProductionUnits(companyId: string): Promise<PowerProductionOverviewDto[]> {
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
      .then(mapToPowerProductionUnitsOverview);
  }

  private async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionOverviewDto[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          companyId: companyId,
          hydrogenProductionUnit: {
            isNot: null,
          },
        },
        ...hydrogenProductionOverviewResultFields,
      })
      .then(mapToHydrogenProductionUnitsOverview);
  }

  private async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageOverviewDto[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          companyId: companyId,
          hydrogenStorageUnit: {
            isNot: null,
          },
        },
        ...hydrogenStorageOverviewResultFields,
      })
      .then(mapToHydrogenStorageUnitOverviews);
  }
}
