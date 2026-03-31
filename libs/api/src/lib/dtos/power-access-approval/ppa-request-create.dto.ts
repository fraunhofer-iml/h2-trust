import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PowerProductionType } from '@h2-trust/domain';

export class PpaRequestCreateDto {
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @IsNotEmpty()
  @IsEnum(PowerProductionType)
  powerProductionType: PowerProductionType;

  constructor(companyId: string, powerProductionType: PowerProductionType) {
    this.companyId = companyId;
    this.powerProductionType = powerProductionType;
  }
}
