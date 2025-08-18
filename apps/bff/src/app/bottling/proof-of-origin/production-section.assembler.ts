import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, HydrogenColor, parseColor, SectionDto } from '@h2-trust/api';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';

export class ProductionSectionAssembler {

  static buildProductionSection(productionProcessSteps: ProcessStepEntity[]): SectionDto {
    const productionClassifications = this.buildProductionClassifications(productionProcessSteps);
    return new SectionDto(ProofOfOriginConstants.PRODUCTION_SECTION_NAME, [], productionClassifications);
  }

  private static buildProductionClassifications(productionProcessSteps: ProcessStepEntity[]): ClassificationDto[] {
    const productionClassifications: ClassificationDto[] = [];

    for (const color of Object.values(HydrogenColor)) {
      const processStepsOfColor = productionProcessSteps.filter((step) => parseColor(step.batch.quality) === color);
      if (processStepsOfColor.length === 0) continue;

      const batchesForAColor = processStepsOfColor.map(ProofOfOriginDtoAssembler.assembleProductionHydrogenBatchDto);
      const productionClassification = ProofOfOriginDtoAssembler.assembleHydrogenClassification(
        color,
        batchesForAColor,
      );
      productionClassifications.push(productionClassification);
    }

    return productionClassifications;
  }
}
