import { Transform } from 'class-transformer';
import { IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { BatchEntity, CompanyEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { HydrogenColor } from '../../enums';

export class BottlingDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  amount: number;

  @IsNotEmpty()
  @IsString()
  recipient: string;

  @IsNotEmpty()
  @IsISO8601()
  filledAt: string;

  @IsString()
  recordedBy: string;

  @IsNotEmpty()
  @IsString()
  hydrogenStorageUnit: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([HydrogenColor.GREEN, HydrogenColor.MIX])
  color: string;

  file?: string;

  @IsOptional()
  @IsString()
  fileDescription?: string;

  constructor(
    amount: number,
    recipient: string,
    filledAt: string,
    recordedBy: string,
    hydrogenStorageUnit: string,
    file: string,
    fileDescription: string,
    color: string,
  ) {
    this.amount = amount;
    this.recipient = recipient;
    this.filledAt = filledAt;
    this.recordedBy = recordedBy;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
    this.file = file;
    this.fileDescription = fileDescription;
    this.color = color;
  }

  static toEntity(dto: BottlingDto): ProcessStepEntity {
    const validDate = dto.filledAt ? new Date(dto.filledAt) : null;

    return <ProcessStepEntity>{
      startedAt: validDate,
      endedAt: validDate,
      batch: <BatchEntity>{
        amount: dto.amount,
        quality: `{"color":"${dto.color}"}`,
        owner: <CompanyEntity>{
          id: dto.recipient,
        },
      },
      recordedBy: {
        id: dto.recordedBy,
      },
      executedBy: {
        id: dto.hydrogenStorageUnit,
      },
      documents: [
        {
          description: dto.fileDescription,
        },
      ],
    };
  }
}
