import { IsISO8601, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductionDto {
  @IsNotEmpty()
  @IsISO8601()
  productionStartedAt: string;

  @IsNotEmpty()
  @IsISO8601()
  productionEndedAt: string;

  @IsString()
  powerProductionUnitId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  powerAmountKwh: number;

  @IsNotEmpty()
  @IsString()
  hydrogenProductionUnitId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  hydrogenAmountKg: number;

  @IsNotEmpty()
  @IsString()
  hydrogenStorageUnitId: string;

  constructor(
    productionStartedAt: string,
    productionEndedAt: string,
    powerProductionUnitId: string,
    powerAmountKwh: number,
    hydrogenProductionUnitId: string,
    hydrogenAmountKg: number,
    hydrogenStorageUnitId: string,
  ) {
    this.productionStartedAt = productionStartedAt;
    this.productionEndedAt = productionEndedAt;
    this.powerProductionUnitId = powerProductionUnitId;
    this.powerAmountKwh = powerAmountKwh;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.hydrogenAmountKg = hydrogenAmountKg;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
  }
}
