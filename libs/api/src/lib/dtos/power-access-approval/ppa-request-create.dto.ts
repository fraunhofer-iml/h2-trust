import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PowerProductionType } from '@h2-trust/domain';

export class PpaRequestCreateDto {
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @IsNotEmpty()
  @IsEnum(PowerProductionType)
  powerProductionType: PowerProductionType;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validFrom: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validTo: Date;

  constructor(companyId: string, powerProductionType: PowerProductionType, validFrom: Date, validTo: Date) {
    this.companyId = companyId;
    this.powerProductionType = powerProductionType;
    this.validFrom = validFrom;
    this.validTo = validTo;
  }
}
