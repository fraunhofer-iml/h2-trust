// eslint-disable-next-line @nx/enforce-module-boundaries
import { PowerProductionUnitDbType } from '@h2-trust/database';
import { AddressEntity } from '../address';
import { BaseUnitEntity } from './base-unit.entity';

export class PowerProductionUnitEntity extends BaseUnitEntity {
  ratedPower: number;
  gridOperator?: string;
  gridLevel?: string;
  gridConnectionNumber?: string;
  typeName?: string;

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
    gridOperator: string,
    gridLevel: string,
    gridConnectionNumber: string,
    typeName: string,
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
    this.gridOperator = gridOperator;
    this.gridLevel = gridLevel;
    this.gridConnectionNumber = gridConnectionNumber;
    this.typeName = typeName;
  }

  static fromDatabase(unit: PowerProductionUnitDbType): PowerProductionUnitEntity {
    return <PowerProductionUnitEntity>{
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
      ratedPower: PowerProductionUnitEntity.mapRatedPower(unit),
      gridOperator: unit.powerProductionUnit?.gridOperator,
      gridLevel: unit.powerProductionUnit?.gridLevel,
      gridConnectionNumber: unit.powerProductionUnit?.gridConnectionNumber,
      typeName: unit.powerProductionUnit?.typeName,
    };
  }

  private static mapRatedPower(unit: PowerProductionUnitDbType): number {
    return unit.powerProductionUnit?.ratedPower?.toNumber() ?? 0;
  }
}
