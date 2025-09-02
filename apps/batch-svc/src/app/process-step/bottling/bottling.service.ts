import { HttpStatus, Injectable } from '@nestjs/common';
import { BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';
import { BatchSelectionService } from './batch-selection.service';
import { HydrogenCompositionService } from './hydrogen-composition.service';
import { ProcessStepAssemblerService } from './process-step-assembler.service';
import { BatchSelection } from './batch-selection.interface';
import { ProcessStepService } from '../process-step.service';

@Injectable()
export class BottlingService {
  constructor(
    private readonly hydrogenCompositionService: HydrogenCompositionService,
    private readonly batchSelectionService: BatchSelectionService,
    private readonly processStepAssemblerService: ProcessStepAssemblerService,
    private readonly storageService: StorageService,
    private readonly processStepRepository: ProcessStepRepository,
    private readonly batchRepository: BatchRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepService: ProcessStepService
  ) { }

  async createBottling(processStep: ProcessStepEntity, files: Express.Multer.File[]): Promise<ProcessStepEntity> {
    const allProcessStepsFromStorageUnit = await this.processStepRepository.findAllProcessStepsFromStorageUnit(
      processStep.executedBy.id,
    );

    if (allProcessStepsFromStorageUnit.length === 0) {
      throw new BrokerException(`No batches found in storage unit ${processStep.executedBy.id}`, HttpStatus.BAD_REQUEST);
    }

    const hydrogenComposition = await this.hydrogenCompositionService.determineHydrogenComposition(processStep);

    const batchSelection: BatchSelection = this.batchSelectionService.processBottlingForAllColors(
      allProcessStepsFromStorageUnit,
      hydrogenComposition,
      processStep,
    );

    await this.batchRepository.setBatchesInactive(batchSelection.batchesForBottle.map((batch) => batch.id));

    await Promise.all(
      batchSelection.processStepsForRemainingAmount.map((processStep) => this.processStepRepository.insertProcessStep(processStep))
    );

    const bottlingProcessStep = await this.processStepAssemblerService.createBottlingProcessStep(
      processStep,
      batchSelection.batchesForBottle,
    );

    if (files) {
      await Promise.all(files.map((file) =>
        this.addDocumentToProcessStep(file, bottlingProcessStep.id, processStep.documents[0]?.description)
      ));
    }

    return this.processStepService.readProcessStep(bottlingProcessStep.id);
  }

  private async addDocumentToProcessStep(file: Express.Multer.File, processStepId: string, description: string) {
    const fileName = await this.storageService.uploadFileWithDeepPath(file, `process-step`, processStepId);
    return this.documentRepository.addDocumentToProcessStep(
      {
        description: description,
        location: fileName,
      },
      processStepId,
    );
  }
}
