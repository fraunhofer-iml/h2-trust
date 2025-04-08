// eslint-disable-next-line @nx/enforce-module-boundaries
import { HydrogenProductionUnitDbType } from '@h2-trust/database';
import { AddressEntity } from '../address';
import { BaseUnitEntity } from './base-unit.entity';

export class HydrogenProductionUnitEntity extends BaseUnitEntity {
  ratedPower: number;
  typeName?: string;
  hydrogenStorageUnit?: {
    id?: string;
    name?: string;
  };

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressEntity,
    company: {
      id: string;
      hydrogenApprovals: { powerAccessApprovalStatus: string; powerProducerId: string }[];
    } | null,
    ratedPower: number,
    typeName: string,
    hydrogenStorageUnit: {
      id: string;
      name: string;
    },
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      serialNumber,
      commissionedOn,
      decommissioningPlannedOn,
      address,
      company,
    );
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
  }

  static fromDatabase(unit: HydrogenProductionUnitDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      id: unit.id,
      name: unit.name,
      mastrNumber: unit.mastrNumber,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      serialNumber: unit.serialNumber,
      commissionedOn: unit.commissionedOn,
      decommissioningPlannedOn: unit.decommissioningPlannedOn,
      address: AddressEntity.fromDatabase(unit.address),
      company: BaseUnitEntity.mapCompany(unit),
      ratedPower: HydrogenProductionUnitEntity.mapRatedPower(unit),
      typeName: unit.hydrogenProductionUnit?.typeName,
      hydrogenStorageUnit: HydrogenProductionUnitEntity.mapHydrogenStorageUnit(unit),
    };
  }

  private static mapRatedPower(unit: HydrogenProductionUnitDbType): number {
    return unit.hydrogenProductionUnit?.ratedPower?.toNumber() ?? 0;
  }

  private static mapHydrogenStorageUnit(unit: HydrogenProductionUnitDbType) {
    return unit.hydrogenProductionUnit?.hydrogenStorageUnit
      ? {
          id: unit.hydrogenProductionUnit.hydrogenStorageUnit.id,
          name: unit.hydrogenProductionUnit.hydrogenStorageUnit.generalInfo?.name,
        }
      : undefined;
  }
}
