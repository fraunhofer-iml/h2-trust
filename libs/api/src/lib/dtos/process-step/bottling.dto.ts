import { BatchEntity, CompanyEntity, ProcessStepEntity } from '@h2-trust/amqp';

export class BottlingDto {
  amount: string;
  recipient: string;
  filledAt: string;
  recordedBy: string;
  hydrogenStorageUnit: string;
  file?: string;
  fileDescription?: string;

  constructor(
    amount: string,
    recipient: string,
    filledAt: string,
    recordedBy: string,
    hydrogenStorageUnit: string,
    file: string,
    fileDescription: string,
  ) {
    this.amount = amount;
    this.recipient = recipient;
    this.filledAt = filledAt;
    this.recordedBy = recordedBy;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
    this.file = file;
    this.fileDescription = fileDescription;
  }

  static toEntity(dto: BottlingDto): ProcessStepEntity {
    const validDate = dto.filledAt ? new Date(dto.filledAt) : null;

    return <ProcessStepEntity>{
      startedAt: validDate,
      endedAt: validDate,
      batch: <BatchEntity>{
        amount: Number(dto.amount),
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
