import { PowerAccessApprovalEntity } from '@h2-trust/amqp';
import { PowerAccessApprovalStatus } from '../../enums';
import { CompanyDto } from '../company';
import { PowerProductionOverviewDto } from '../unit';

export class PowerAccessApprovalDto {
  id: string;
  hydrogenProducer: CompanyDto;
  powerProducer: CompanyDto;
  powerProductionUnit: PowerProductionOverviewDto;
  status: PowerAccessApprovalStatus;
  energySource: string;

  constructor(
    id: string,
    hydrogenProducer: CompanyDto,
    powerProducer: CompanyDto,
    powerProductionUnit: PowerProductionOverviewDto,
    status: PowerAccessApprovalStatus,
    energySource: string,
  ) {
    this.id = id;
    this.hydrogenProducer = hydrogenProducer;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.energySource = energySource;
  }

  static fromEntity(powerAccessApproval: PowerAccessApprovalEntity): PowerAccessApprovalDto {
    return <PowerAccessApprovalDto>{
      id: powerAccessApproval.id,
      hydrogenProducer: powerAccessApproval.hydrogenProducer,
      powerProducer: powerAccessApproval.powerProducer,
      powerProductionUnit: powerAccessApproval.powerProductionUnit,
      status: powerAccessApproval.status,
      energySource: powerAccessApproval.powerProductionUnit.type?.name,
    };
  }
}
