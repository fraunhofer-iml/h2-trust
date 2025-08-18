import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityPowerProductionMock,
} from '@h2-trust/amqp';
import { parseColor, ProcessType } from '@h2-trust/api';
import { BottlingSectionService } from './bottling-section.service';
import { EnergySourceClassificationService } from './energy-source-classification.service';
import { InputMediaSectionService } from './input-media-section.service';
import { ProcessStepService } from './process-step.service';
import { ProductionSectionAssembler } from './production-section.assembler';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';
import { ProofOfOriginService } from './proof-of-origin.service';

describe('ProofOfOriginService', () => {
  let service: ProofOfOriginService;
  let processStepService: ProcessStepService;
  let energySourceClassificationService: EnergySourceClassificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProofOfOriginService,
        BottlingSectionService,
        ProductionSectionAssembler,
        InputMediaSectionService,
        EnergySourceClassificationService,
        ProofOfOriginDtoAssembler,
        {
          provide: ProcessStepService,
          useValue: {
            fetchProcessStep: jest.fn(),
            fetchPredecessorProcessSteps: jest.fn(),
            fetchProcessStepsForBatches: jest.fn(),
          },
        },
        {
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn().mockReturnValue(of(null)),
          },
        },
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProofOfOriginService>(ProofOfOriginService);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
    energySourceClassificationService = module.get<EnergySourceClassificationService>(
      EnergySourceClassificationService,
    );
  });

  it('should build sections', async () => {
    const processStepEntity = ProcessStepEntityHydrogenBottlingMock[0];
    const predecessorProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(4, 6);
    const powerProcessSteps = ProcessStepEntityPowerProductionMock.slice(0, 4);
    const energySourceTypes = ['SOLAR_ENERGY', 'HYDROGEN_ENERGY', 'FOSSIL_FUELS'];
    const unitEnergySourceTypes = energySourceTypes.slice(1);
    const unitEnergySourceType1 = unitEnergySourceTypes[0];
    const unitEnergySourceType2 = unitEnergySourceTypes[1];

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(processStepEntity);
    jest.spyOn(processStepService, 'fetchPredecessorProcessSteps').mockResolvedValue(predecessorProcessSteps);
    jest.spyOn(processStepService, 'fetchProcessStepsForBatches').mockResolvedValue(powerProcessSteps);
    jest.spyOn(energySourceClassificationService as any, 'fetchPowerProductionUnit').mockResolvedValueOnce({
      type: {
        energySource: unitEnergySourceType1,
      },
    });
    jest.spyOn(energySourceClassificationService as any, 'fetchPowerProductionUnit').mockResolvedValue({
      type: {
        energySource: unitEnergySourceType2,
      },
    });
    jest
      .spyOn(energySourceClassificationService as any, 'fetchEnergySourceTypes')
      .mockResolvedValueOnce(energySourceTypes);

    const result = await service.readProofOfOrigin(processStepEntity.id);

    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(processStepEntity.id);
    expect(processStepService.fetchPredecessorProcessSteps).toHaveBeenCalledWith(processStepEntity);
    // InputMedia Section
    expect(result[0].name).toEqual(ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME);
    expect(result[0].classifications.length).toEqual(1);
    // // Power Supply Classification
    expect(result[0].classifications[0].name).toEqual(ProofOfOriginConstants.POWER_SUPPLY_CLASSIFICATION_NAME);
    expect(result[0].classifications[0].classifications.length).toEqual(unitEnergySourceTypes.length);
    // // // Energy Source Type 1 Classification
    expect(result[0].classifications[0].classifications[0].name).toEqual(unitEnergySourceType1);
    expect(result[0].classifications[0].classifications[0].batches.length).toEqual(1);
    expect(result[0].classifications[0].classifications[0].batches[0].id).toEqual(powerProcessSteps[0].batch.id);
    // // // Energy Source Type 2 Classification
    expect(result[0].classifications[0].classifications[1].name).toEqual(unitEnergySourceType2);
    expect(result[0].classifications[0].classifications[1].batches.length).toEqual(powerProcessSteps.length - 1);
    expect(result[0].classifications[0].classifications[1].batches[0].id).toEqual(powerProcessSteps[1].batch.id);
    // Hydrogen Production Section
    expect(result[1].name).toEqual(ProofOfOriginConstants.PRODUCTION_SECTION_NAME);
    expect(result[1].classifications.length).toEqual(predecessorProcessSteps.length);
    expect(result[1].classifications[0].name).toEqual(parseColor(predecessorProcessSteps[0].batch.quality));
    expect(result[1].classifications[0].batches.length).toEqual(1);
    expect(result[1].classifications[0].batches[0].id).toEqual(predecessorProcessSteps[0].batch.id);
    // Bottling Section
    expect(result[2].name).toEqual(ProofOfOriginConstants.BOTTLING_SECTION_NAME);
    expect(result[2].batches.length).toEqual(1);
    expect(result[2].batches[0].id).toEqual(processStepEntity.batch.id);
  });

  it('should throw an error if fetchProcessStep fails', async () => {
    const processStepId = '123';
    jest.spyOn(processStepService, 'fetchProcessStep').mockRejectedValue(new Error('Process step not found'));

    await expect(service.readProofOfOrigin(processStepId)).rejects.toThrow('Process step not found');
    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(processStepId);
    expect(processStepService.fetchPredecessorProcessSteps).not.toHaveBeenCalled();
  });

  it('should throw an error if processStep is not of type BOTTLING', async () => {
    const processStepEntity = ProcessStepEntityHydrogenProductionMock[0];

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(processStepEntity);

    await expect(service.readProofOfOrigin(processStepEntity.id)).rejects.toThrow(
      `ProcessStep with ID ${processStepEntity.id} should be of type ${ProcessType.BOTTLING}, but is ${processStepEntity.processType}`,
    );
    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(processStepEntity.id);
    expect(processStepService.fetchPredecessorProcessSteps).not.toHaveBeenCalled();
  });

  it('should throw an error if predecessorProcessSteps are not of type HYDROGEN_PRODUCTION', async () => {
    const processStepEntity = ProcessStepEntityHydrogenBottlingMock[0];
    const predecessorProcessSteps = ProcessStepEntityHydrogenBottlingMock;

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(processStepEntity);
    jest.spyOn(processStepService, 'fetchPredecessorProcessSteps').mockResolvedValue(predecessorProcessSteps);

    await expect(service.readProofOfOrigin(processStepEntity.id)).rejects.toThrow(
      `Predecessor process steps must not be empty and must be of type ${ProcessType.HYDROGEN_PRODUCTION}`,
    );
    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(processStepEntity.id);
  });

  it('should throw an error if powerProcessSteps arie not of type POWER_PRODUCTION', async () => {
    const processStepEntity = ProcessStepEntityHydrogenBottlingMock[0];
    const predecessorProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(4, 6);
    const powerProcessSteps = ProcessStepEntityHydrogenBottlingMock;

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(processStepEntity);
    jest.spyOn(processStepService, 'fetchPredecessorProcessSteps').mockResolvedValue(predecessorProcessSteps);
    jest.spyOn(processStepService, 'fetchProcessStepsForBatches').mockResolvedValue(powerProcessSteps);

    await expect(service.readProofOfOrigin(processStepEntity.id)).rejects.toThrow(
      `Predecessor process steps must not be empty and must be of type ${ProcessType.POWER_PRODUCTION}`,
    );
    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(processStepEntity.id);
  });
});
