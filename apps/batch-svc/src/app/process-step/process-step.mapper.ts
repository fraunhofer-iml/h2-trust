import { Prisma } from '@prisma/client';
import { ProcessingOverviewDto, processStepResultFields } from '@h2-trust/api';

export function mapAllProcessStepsToProcessingOverviewRows(
  processSteps: Prisma.ProcessStepGetPayload<typeof processStepResultFields>[],
): ProcessingOverviewDto[] {
  return processSteps.map(mapSingleProcessStepToProcessingOverviewRow);
}

export function mapSingleProcessStepToProcessingOverviewRow(processStep: Prisma.ProcessStepGetPayload<typeof processStepResultFields>): ProcessingOverviewDto {
  return {
    id: processStep.id,
    timestamp: processStep.timestamp,
    owner: processStep.batch.owner.name,
    filledAmount: processStep.batch.quantity.toNumber(),
    color: processStep.batch.quality,
  };
}
