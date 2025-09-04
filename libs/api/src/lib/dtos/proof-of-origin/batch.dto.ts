import { BatchType, EnergySource } from '../../enums';
import { HydrogenComponentDto } from '../process-step';
import { EmissionDto } from './emission.dto';
import { WaterDetailsDto } from './water-details.dto';

export abstract class BatchDto {
  id: string;
  emission: EmissionDto;
  createdAt: Date;
  amount: number;

  /**
   * measuring unit for amount
   */
  unit: string;
  batchType: BatchType;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: string,
    batchType: BatchType,
  ) {
    this.id = id;
    this.emission = emission;
    this.createdAt = creationDate;
    this.amount = amount;
    this.unit = unit;
    this.batchType = batchType;
  }
}

export class WaterBatchDto extends BatchDto {
  deionizedWater: WaterDetailsDto;
  tapWater: WaterDetailsDto;
  wasteWater: WaterDetailsDto;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: string,
    deionizedWater: WaterDetailsDto,
    tapWater: WaterDetailsDto,
    wasteWater: WaterDetailsDto,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.WATER);
    this.deionizedWater = deionizedWater;
    this.tapWater = tapWater;
    this.wasteWater = wasteWater;
  }
}

export class HydrogenBatchDto extends BatchDto {
  amountVerified: number;
  producer: string;
  unitId: string;
  purity: number;
  typeOfProduction: string;
  hydrogenComposition: HydrogenComponentDto[];
  color: string;
  // Renewable Fuels of Non-Biological Origin
  rfnboReady: boolean;

  /**
   * name of the process step leading to this batch
   * @example bottling
   */
  processStep: string;

  /**
   * optional for all bottled batches, since bottled batches only have a creation/bottling time
   * and no accounting period
   */
  accountingPeriodEnd?: Date;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: string,
    amountVerified: number,
    producer: string,
    unitId: string,
    purity: number,
    typeOfProduction: string,
    hydrogenComposition: HydrogenComponentDto[],
    color: string,
    rfnboReady: boolean,
    processStep: string,
    accountingPeriodEnd?: Date,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.HYDROGEN);
    this.amountVerified = amountVerified;
    this.producer = producer;
    this.unitId = unitId;
    this.purity = purity;
    this.typeOfProduction = typeOfProduction;
    this.hydrogenComposition = hydrogenComposition;
    this.color = color;
    this.rfnboReady = rfnboReady;
    this.processStep = processStep;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}

export class PowerBatchDto extends BatchDto {
  amountVerified: number;
  producer: string;
  unitId: string;
  energySource: EnergySource;
  accountingPeriodEnd: Date;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: string,
    amountVerified: number,
    producer: string,
    unitId: string,
    energySource: EnergySource,
    accountingPeriodEnd: Date,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.POWER);
    this.producer = producer;
    this.unitId = unitId;
    this.amountVerified = amountVerified;
    this.energySource = energySource;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
