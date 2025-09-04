import { EmissionCalculationDto } from './emission-calculation.dto';
import { EmissionForProcessStepDto } from './process-step-emission.dto';

export class ProofOfSustainabilityDto {
  batchId: string;
  amountCO2PerMJH2: number;
  emissionReductionPercentage: number;
  calculations: EmissionCalculationDto[];
  processStepEmissions: EmissionForProcessStepDto[];

  constructor(
    batchId: string,
    amountCO2PerMJH2: number,
    emissionReductionPercentage: number,
    calculations: EmissionCalculationDto[],
    processStepEmissions: EmissionForProcessStepDto[],
  ) {
    this.batchId = batchId;
    this.amountCO2PerMJH2 = amountCO2PerMJH2;
    this.emissionReductionPercentage = emissionReductionPercentage;
    this.calculations = calculations;
    this.processStepEmissions = processStepEmissions;
  }
}
