import { HttpStatus } from '@nestjs/common';
import { Batch } from '@prisma/client';
import { parseColor } from '@h2-trust/api';
import { HydrogenStorageUnitDbType } from '@h2-trust/database';
import { BrokerException } from '../../broker/broker-exception';
import { AddressEntity } from '../address';
import { BaseUnitEntity } from './base-unit.entity';
import { HydrogenComponentEntity } from '../bottling';

export class HydrogenStorageUnitEntity extends BaseUnitEntity {
  capacity?: number;
  filling?: HydrogenComponentEntity[];
  hydrogenProductionUnits?: {
    id: string;
    name: string;
    hydrogenStorageUnitId: string;
  }[];

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
    capacity: number,
    filling: HydrogenComponentEntity[],
    hydrogenProductionUnits: {
      id: string;
      name: string;
      hydrogenStorageUnitId: string;
    }[],
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
    this.capacity = capacity;
    this.filling = filling;
    this.hydrogenProductionUnits = hydrogenProductionUnits;
  }

  static override fromDatabase(unit: HydrogenStorageUnitDbType): HydrogenStorageUnitEntity {
    return <HydrogenStorageUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
      capacity: HydrogenStorageUnitEntity.mapCapacity(unit),
      filling: HydrogenStorageUnitEntity.mapFilling(unit),
      hydrogenProductionUnits: HydrogenStorageUnitEntity.mapHydrogenProductionUnits(unit),
    };
  }

  private static mapCapacity(unit: HydrogenStorageUnitDbType): number {
    return unit.hydrogenStorageUnit?.capacity?.toNumber() ?? 0;
  }

  private static mapFilling(unit: HydrogenStorageUnitDbType): HydrogenComponentEntity[] {
    return (
      unit.hydrogenStorageUnit?.filling?.map((batch: Batch) => {
        return {
          color: this.getColor(batch.quality),
          amount: batch.amount?.toNumber() ?? 0,
        };
      }) ?? []
    );
  }

  private static getColor(quality: string) {
    const parsedColor = parseColor(quality);
    if (!parsedColor) {
      throw new BrokerException(`Invalid quality: ${quality}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return parsedColor;
  }

  private static mapHydrogenProductionUnits(unit: HydrogenStorageUnitDbType) {
    return (
      unit.hydrogenStorageUnit?.hydrogenProductionUnits?.map((unit) => ({
        id: unit.id,
        name: unit.generalInfo?.name,
        hydrogenStorageUnitId: unit.hydrogenStorageUnitId,
      })) ?? []
    );
  }
}
