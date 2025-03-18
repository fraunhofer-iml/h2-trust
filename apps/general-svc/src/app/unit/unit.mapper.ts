import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AmqpException } from '@h2-trust/amqp';
import {
  hydrogenProductionOverviewResultFields,
  hydrogenProductionUnitResultFields,
  hydrogenStorageOverviewResultFields,
  hydrogenStorageUnitResultFields,
  powerProductionUnitResultFields,
  unitUnionResultFields,
} from '@h2-trust/api';

// TODO-MP: correct location for mapper functions?

export function flatUnit(_unit: Prisma.UnitGetPayload<typeof unitUnionResultFields>) {
  const { powerProductionUnit, hydrogenProductionUnit, hydrogenStorageUnit, ...unit } = _unit;
  if (powerProductionUnit !== null) {
    return flatPowerProductionUnit({
      powerProductionUnit,
      ...unit,
    });
  } else if (hydrogenProductionUnit !== null) {
    return flatHydrogenProductionUnit({
      hydrogenProductionUnit,
      ...unit,
    });
  } else if (hydrogenStorageUnit !== null) {
    return flatHydrogenStorageUnit({
      hydrogenStorageUnit,
      ...unit,
    });
  } else {
    throw new AmqpException(`Incompatible unit`, HttpStatus.BAD_REQUEST);
  }
}

export function flatPowerProductionUnit(
  _powerProductionUnit: Prisma.UnitGetPayload<typeof powerProductionUnitResultFields>,
) {
  const { powerProductionUnit, ...generalInfo } = _powerProductionUnit;
  return {
    ...generalInfo,
    ...powerProductionUnit,
    ratedPower: powerProductionUnit.ratedPower.toNumber(),
  };
}

export function flatHydrogenProductionUnit(
  _hydrogenProductionUnit: Prisma.UnitGetPayload<typeof hydrogenProductionUnitResultFields>,
) {
  const { hydrogenProductionUnit, ...generalInfo } = _hydrogenProductionUnit;
  return {
    ...generalInfo,
    ...hydrogenProductionUnit,
    ratedPower: hydrogenProductionUnit.ratedPower.toNumber(),
  };
}

export function flatHydrogenStorageUnit(
  _hydrogenStorageUnit: Prisma.UnitGetPayload<typeof hydrogenStorageUnitResultFields>,
) {
  const { hydrogenStorageUnit, ...generalInfo } = _hydrogenStorageUnit;
  return {
    ...generalInfo,
    ...hydrogenStorageUnit,
    capacity: hydrogenStorageUnit.capacity.toNumber(),
    filling: hydrogenStorageUnit.filling.map((batch) => {
      return {
        ...batch,
        quantity: batch.quantity.toNumber(),
      };
    }),
  };
}

export function mapToPowerProductionUnitsOverview(
  units: Prisma.UnitGetPayload<typeof powerProductionUnitResultFields>[],
) {
  return units.map(mapToPowerProductionUnitOverview);
}

export function mapToPowerProductionUnitOverview(unit: Prisma.UnitGetPayload<typeof powerProductionUnitResultFields>) {
  return {
    id: unit.id,
    name: unit.name,
    ratedPower: unit.powerProductionUnit.ratedPower.toNumber(),
    typeName: unit.powerProductionUnit.typeName,
    producing: true,
  };
}

export function mapToHydrogenProductionUnitsOverview(
  units: Prisma.UnitGetPayload<typeof hydrogenProductionOverviewResultFields>[],
) {
  return units.map(mapToHydrogenProductionUnitOverview);
}

export function mapToHydrogenProductionUnitOverview(
  unit: Prisma.UnitGetPayload<typeof hydrogenProductionOverviewResultFields>,
) {
  return {
    id: unit.id,
    name: unit.name,
    ratedPower: unit.hydrogenProductionUnit.ratedPower.toNumber(),
    typeName: unit.hydrogenProductionUnit.typeName,
    producing: true,
    powerAccessApprovalStatus: unit.company.hydrogenApprovals.length !== 0,
    hydrogenStorageUnit: {
      id: unit.hydrogenProductionUnit.hydrogenStorageUnit.id,
      name: unit.hydrogenProductionUnit.hydrogenStorageUnit.generalInfo.name,
    },
  };
}

export function mapToHydrogenStorageUnitOverviews(
  units: Prisma.UnitGetPayload<typeof hydrogenStorageOverviewResultFields>[],
) {
  return units.map(mapToHydrogenStorageUnitOverview);
}

export function mapToHydrogenStorageUnitOverview(
  unit: Prisma.UnitGetPayload<typeof hydrogenStorageOverviewResultFields>,
) {
  return {
    id: unit.id,
    name: unit.name,
    capacity: unit.hydrogenStorageUnit.capacity.toNumber(),
    filling: unit.hydrogenStorageUnit.filling
      .map((filling) => filling.quantity)
      .reduce((total, value: Prisma.Decimal) => total + value.toNumber(), 0),
    hydrogenProductionUnit: unit.hydrogenStorageUnit.hydrogenProductionUnits
      .filter((unit) => unit.hydrogenStorageUnitId === unit.id)
      .map((unit) => ({
        id: unit.id,
        name: unit.generalInfo.name,
      }))[0],
  };
}
