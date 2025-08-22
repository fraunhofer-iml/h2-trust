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

  async readProofOfOrigin(hydrogenBottlingProcessStepId: string): Promise<SectionDto[]> {
    const hydrogenBottlingProcessStep: ProcessStepEntity =
      await this.processStepService.fetchProcessStep(hydrogenBottlingProcessStepId);

    if (hydrogenBottlingProcessStep.processType !== ProcessType.BOTTLING) {
      const errorMessage = `ProcessStep with ID ${hydrogenBottlingProcessStepId} should be of type ${ProcessType.BOTTLING}, but is ${hydrogenBottlingProcessStep.processType}`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const hydrogenProductionProcessSteps = await this.processStepService.fetchProcessStepsOfBatches(
      hydrogenBottlingProcessStep.batch.predecessors,
    );

    if (!hydrogenProductionProcessSteps || hydrogenProductionProcessSteps.length === 0) {
      throw new HttpException(
        `Predecessor process steps of type ${ProcessType.HYDROGEN_PRODUCTION} must not be empty.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const invalidProcessSteps = hydrogenProductionProcessSteps.filter(
      (step) => step.processType !== ProcessType.HYDROGEN_PRODUCTION,
    );

    if (invalidProcessSteps.length > 0) {
      const errorMessage = `All predecessor process steps of ${hydrogenBottlingProcessStep.id} must be of type ${ProcessType.HYDROGEN_PRODUCTION}, but found invalid process steps: ${invalidProcessSteps.map((step) => step.id + ' ' + step.processType).join(', ')}`;
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const [inputMediaSection, bottlingSection] = await Promise.all([
      this.inputMediaSectionService.buildInputMediaSection(hydrogenProductionProcessSteps),
      this.bottlingSectionService.buildBottlingSection(hydrogenBottlingProcessStep),
    ]);
    const productionSection = ProductionSectionAssembler.buildProductionSection(hydrogenProductionProcessSteps);

    return [inputMediaSection, productionSection, bottlingSection];
  }
}
