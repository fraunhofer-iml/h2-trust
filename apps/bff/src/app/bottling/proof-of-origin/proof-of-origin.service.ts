import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType, SectionDto } from '@h2-trust/api';
import { BottlingSectionService } from './bottling-section.service';
import { HydrogenProductionSectionAssembler } from './hydrogen-production-section.assembler';
import { InputMediaSectionService } from './input-media-section.service';
import { ProcessLineageService } from './process-lineage.service';
import { ProcessStepService } from './process-step.service';
import { invalidProcessType } from './proof-of-origin.validation';

@Injectable()
export class ProofOfOriginService {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly processLineageService: ProcessLineageService,
    private readonly bottlingSectionService: BottlingSectionService,
    private readonly inputMediaSectionService: InputMediaSectionService,
  ) {}

  async readProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    const processStep: ProcessStepEntity = await this.processStepService.fetchProcessStep(processStepId);

    switch (processStep.processType) {
      case ProcessType.POWER_PRODUCTION:
        return this.buildPowerProductionSections(processStep);

      case ProcessType.HYDROGEN_PRODUCTION:
        return this.buildHydrogenProductionSections(processStep);

      case ProcessType.HYDROGEN_BOTTLING:
        return this.buildHydrogenBottlingSections(processStep);

      case ProcessType.HYDROGEN_TRANSPORTATION:
        return this.buildHydrogenTransportationSections(processStep);

      default:
        throw invalidProcessType(processStep.id, processStep.processType);
    }
  }

  private async buildPowerProductionSections(powerProductionProcessStep: ProcessStepEntity): Promise<SectionDto[]> {
    const inputMediaSection: SectionDto = await this.inputMediaSectionService.buildInputMediaSection([
      powerProductionProcessStep,
    ]);
    return [inputMediaSection];
  }

  private async buildHydrogenProductionSections(
    hydrogenProductionProcessStep: ProcessStepEntity,
  ): Promise<SectionDto[]> {
    const powerProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchPowerProductionProcessSteps([hydrogenProductionProcessStep]);

    const inputMediaSection: SectionDto =
      await this.inputMediaSectionService.buildInputMediaSection(powerProductionProcessSteps);
    const hydrogenProductionSection: SectionDto = HydrogenProductionSectionAssembler.buildHydrogenProductionSection([
      hydrogenProductionProcessStep,
    ]);

    return [inputMediaSection, hydrogenProductionSection];
  }

  private async buildHydrogenBottlingSections(hydrogenBottlingProcessStep: ProcessStepEntity): Promise<SectionDto[]> {
    const hydrogenProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchHydrogenProductionProcessSteps(hydrogenBottlingProcessStep);
    const powerProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchPowerProductionProcessSteps(hydrogenProductionProcessSteps);

    const [inputMediaSection, bottlingSection]: [SectionDto, SectionDto] = await Promise.all([
      this.inputMediaSectionService.buildInputMediaSection(powerProductionProcessSteps),
      this.bottlingSectionService.buildBottlingSection(hydrogenBottlingProcessStep),
    ]);
    const hydrogenProductionSection: SectionDto =
      HydrogenProductionSectionAssembler.buildHydrogenProductionSection(hydrogenProductionProcessSteps);

    return [inputMediaSection, hydrogenProductionSection, bottlingSection];
  }

  private async buildHydrogenTransportationSections(
    hydrogenTransportationProcessStep: ProcessStepEntity,
  ): Promise<SectionDto[]> {
    const hydrogenBottlingProcessStep: ProcessStepEntity =
      await this.processLineageService.fetchHydrogenBottlingProcessStep(hydrogenTransportationProcessStep);
    const hydrogenProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchHydrogenProductionProcessSteps(hydrogenBottlingProcessStep);
    const powerProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchPowerProductionProcessSteps(hydrogenProductionProcessSteps);

    const [inputMediaSection, bottlingSection, transportationSection]: [SectionDto, SectionDto, SectionDto] =
      await Promise.all([
        this.inputMediaSectionService.buildInputMediaSection(powerProductionProcessSteps),
        this.bottlingSectionService.buildBottlingSection(hydrogenBottlingProcessStep),
        this.bottlingSectionService.buildTransportationSection(
          hydrogenTransportationProcessStep,
          hydrogenBottlingProcessStep,
        ),
      ]);
    const hydrogenProductionSection: SectionDto =
      HydrogenProductionSectionAssembler.buildHydrogenProductionSection(hydrogenProductionProcessSteps);

    return [inputMediaSection, hydrogenProductionSection, bottlingSection, transportationSection];
  }
}
