import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, SectionDto } from '@h2-trust/api';
import { EnergySourceClassificationService } from './energy-source-classification.service';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';

@Injectable()
export class InputMediaSectionService {
  constructor(private readonly energySourceClassificationService: EnergySourceClassificationService) {}

  async buildInputMediaSection(hydrogenProductionProcessSteps: ProcessStepEntity[]): Promise<SectionDto> {
    const powerSupplyClassification = await this.buildPowerSupplyClassification(hydrogenProductionProcessSteps);
    return new SectionDto(ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME, [], [powerSupplyClassification]);
  }

  private async buildPowerSupplyClassification(
    hydrogenProductionProcessSteps: ProcessStepEntity[],
  ): Promise<ClassificationDto> {
    const energySourceClassificationDtos =
      await this.energySourceClassificationService.buildEnergySourceClassificationsFromProcessSteps(
        hydrogenProductionProcessSteps,
      );

    return ProofOfOriginDtoAssembler.assemblePowerClassification(
      ProofOfOriginConstants.POWER_SUPPLY_CLASSIFICATION_NAME,
      [],
      energySourceClassificationDtos,
    );
  }
}
