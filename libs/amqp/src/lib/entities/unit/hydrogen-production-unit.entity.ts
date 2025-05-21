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
      hydrogenApprovals: { powerAccessApprovalStatus: string; powerProducerId: string; powerProducerName: string }[];
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

  static override fromDatabase(unit: HydrogenProductionUnitDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
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
