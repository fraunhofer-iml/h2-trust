import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ClassificationDto, SectionDto } from '@h2-trust/api';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { EnergySourceClassificationService } from './energy-source-classification.service';
import { ProofOfOriginConstants } from './proof-of-origin.constants';

@Injectable()
export class InputMediaSectionService {
  constructor(
    private readonly energySourceClassificationService: EnergySourceClassificationService,
  ) {}

  async buildInputMediaSection(productionProcessSteps: ProcessStepEntity[]): Promise<SectionDto> {
    const powerSupplyClassification = await this.buildPowerSupplyClassification(productionProcessSteps);
    return new SectionDto(ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME, [], [powerSupplyClassification]);
  }

  private async buildPowerSupplyClassification(
    productionProcessSteps: ProcessStepEntity[],
  ): Promise<ClassificationDto> {
    const energySourceClassificationDtos =
      await this.energySourceClassificationService.buildEnergySourceClassificationsFromProcessSteps(
        productionProcessSteps,
      );
    return ProofOfOriginDtoAssembler.assemblePowerClassification(
      ProofOfOriginConstants.POWER_SUPPLY_CLASSIFICATION_NAME,
      [],
      energySourceClassificationDtos,
    );
  }
}
