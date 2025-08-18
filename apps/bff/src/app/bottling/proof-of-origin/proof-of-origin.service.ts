import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType, SectionDto } from '@h2-trust/api';
import { BottlingSectionService } from './bottling-section.service';
import { InputMediaSectionService } from './input-media-section.service';
import { ProcessStepService } from './process-step.service';
import { ProductionSectionAssembler } from './production-section.assembler';

@Injectable()
export class ProofOfOriginService {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly bottlingSectionService: BottlingSectionService,
    private readonly inputMediaSectionService: InputMediaSectionService,
  ) {}

  async readProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    const processStepEntity: ProcessStepEntity = await this.processStepService.fetchProcessStep(processStepId);
    if (processStepEntity.processType !== ProcessType.BOTTLING) {
      throw new HttpException(
        `ProcessStep with ID ${processStepId} should be of type ${ProcessType.BOTTLING}, but is ${processStepEntity.processType}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hydrogenProductionProcessSteps =
      await this.processStepService.fetchPredecessorProcessSteps(processStepEntity);
    if (
      hydrogenProductionProcessSteps.length === 0 ||
      !hydrogenProductionProcessSteps.every((step) => step.processType === ProcessType.HYDROGEN_PRODUCTION)
    ) {
      throw new HttpException(
        `Predecessor process steps must not be empty and must be of type ${ProcessType.HYDROGEN_PRODUCTION}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [inputMediaSection, bottlingSection] = await Promise.all([
      this.inputMediaSectionService.buildInputMediaSection(hydrogenProductionProcessSteps),
      this.bottlingSectionService.buildBottlingSection(processStepEntity),
    ]);
    const productionSection = ProductionSectionAssembler.buildProductionSection(hydrogenProductionProcessSteps);

    return [inputMediaSection, productionSection, bottlingSection];
  }
}
