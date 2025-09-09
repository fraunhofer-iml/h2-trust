import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, HydrogenColor, parseColor, SectionDto } from '@h2-trust/api';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';

export class HydrogenProductionSectionAssembler {
  static buildHydrogenProductionSection(hydrogenProductionProcessSteps: ProcessStepEntity[]): SectionDto {
    const productionClassifications: ClassificationDto[] = [];

    for (const hydrogenColor of Object.values(HydrogenColor)) {
      const processStepsByCurrentHydrogenColor = hydrogenProductionProcessSteps.filter(
        (processStep) => parseColor(processStep.batch.quality) === hydrogenColor,
      );

      if (processStepsByCurrentHydrogenColor.length === 0) {
        continue;
      }

      const batchesForAColor = processStepsByCurrentHydrogenColor.map(
        ProofOfOriginDtoAssembler.assembleProductionHydrogenBatchDto,
      );
      const productionClassification = ProofOfOriginDtoAssembler.assembleHydrogenClassification(
        hydrogenColor,
        batchesForAColor,
      );
      productionClassifications.push(productionClassification);
    }

    return new SectionDto(ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME, [], productionClassifications);
  }
}
