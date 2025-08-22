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
            fetchProcessStepsOfBatches: jest.fn(),
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
    const hydrogenBottlingProcessStep = ProcessStepEntityHydrogenBottlingMock[0];
    const hydrogenProductionProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(0, 1);
    const powerProductionProcessSteps = ProcessStepEntityPowerProductionMock.slice(0, 2);

    hydrogenBottlingProcessStep.batch.predecessors = hydrogenProductionProcessSteps.map((step) => step.batch);
    hydrogenProductionProcessSteps[0].batch.predecessors = powerProductionProcessSteps.map((step) => step.batch);

    const energySourceTypes = ['SOLAR_ENERGY', 'HYDROGEN_ENERGY', 'FOSSIL_FUELS'];
    const unitEnergySourceTypes = energySourceTypes.slice(1);
    const unitEnergySourceType1 = unitEnergySourceTypes[0];
    const unitEnergySourceType2 = unitEnergySourceTypes[1];

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(hydrogenBottlingProcessStep);

    jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce(hydrogenProductionProcessSteps)
      .mockResolvedValue(powerProductionProcessSteps);

    jest
      .spyOn(energySourceClassificationService as any, 'fetchPowerProductionUnit')
      .mockResolvedValueOnce({ type: { energySource: unitEnergySourceType1 } })
      .mockResolvedValue({ type: { energySource: unitEnergySourceType2 } });

    jest.spyOn(energySourceClassificationService as any, 'fetchEnergySources').mockResolvedValueOnce(energySourceTypes);

    const result = await service.readProofOfOrigin(hydrogenBottlingProcessStep.id);

    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(hydrogenBottlingProcessStep.id);
    // InputMedia Section
    expect(result[0].name).toEqual(ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME);
    expect(result[0].classifications.length).toEqual(1);
    // // Power Supply Classification
    expect(result[0].classifications[0].name).toEqual(ProofOfOriginConstants.POWER_SUPPLY_CLASSIFICATION_NAME);
    expect(result[0].classifications[0].classifications.length).toEqual(unitEnergySourceTypes.length);
    // // // Energy Source Type 1 Classification
    expect(result[0].classifications[0].classifications[0].name).toEqual(unitEnergySourceType1);
    expect(result[0].classifications[0].classifications[0].batches.length).toEqual(1);
    expect(result[0].classifications[0].classifications[0].batches[0].id).toEqual(
      powerProductionProcessSteps[0].batch.id,
    );
    // // // Energy Source Type 2 Classification
    expect(result[0].classifications[0].classifications[1].name).toEqual(unitEnergySourceType2);
    expect(result[0].classifications[0].classifications[1].batches.length).toEqual(
      powerProductionProcessSteps.length - 1,
    );
    expect(result[0].classifications[0].classifications[1].batches[0].id).toEqual(
      powerProductionProcessSteps[1].batch.id,
    );
    // Hydrogen Production Section
    expect(result[1].name).toEqual(ProofOfOriginConstants.PRODUCTION_SECTION_NAME);
    expect(result[1].classifications.length).toEqual(hydrogenProductionProcessSteps.length);
    expect(result[1].classifications[0].name).toEqual(parseColor(hydrogenProductionProcessSteps[0].batch.quality));
    expect(result[1].classifications[0].batches.length).toEqual(1);
    expect(result[1].classifications[0].batches[0].id).toEqual(hydrogenProductionProcessSteps[0].batch.id);
    // Bottling Section
    expect(result[2].name).toEqual(ProofOfOriginConstants.BOTTLING_SECTION_NAME);
    expect(result[2].batches.length).toEqual(1);
    expect(result[2].batches[0].id).toEqual(hydrogenBottlingProcessStep.batch.id);
  });

  it('should throw an error if processStep is not of type BOTTLING', async () => {
    const processStepEntity = ProcessStepEntityHydrogenProductionMock[0];
    const expectedErrorMessage = `ProcessStep with ID ${processStepEntity.id} should be of type ${ProcessType.BOTTLING}, but is ${processStepEntity.processType}`;

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(processStepEntity);

    await expect(service.readProofOfOrigin(processStepEntity.id)).rejects.toThrow(expectedErrorMessage);

    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(processStepEntity.id);
  });

  it('should throw an error if predecessorProcessSteps are not of type HYDROGEN_PRODUCTION', async () => {
    const hydrogenBottlingProcessStep = ProcessStepEntityHydrogenBottlingMock[0];
    const expectedErrorMessage = `Predecessor process steps of type ${ProcessType.HYDROGEN_PRODUCTION} must not be empty.`;

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(hydrogenBottlingProcessStep);

    await expect(service.readProofOfOrigin(hydrogenBottlingProcessStep.id)).rejects.toThrow(expectedErrorMessage);

    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(hydrogenBottlingProcessStep.id);
  });

  it('should throw an error if powerProductionProcessSteps are not of type POWER_PRODUCTION', async () => {
    const hydrogenBottlingProcessStep = ProcessStepEntityHydrogenBottlingMock[0];
    const invalidProcessSteps = ProcessStepEntityHydrogenBottlingMock;
    const expectedErrorMessage = `All predecessor process steps of ${hydrogenBottlingProcessStep.id} must be of type ${ProcessType.HYDROGEN_PRODUCTION}, but found invalid process steps: ${invalidProcessSteps.map((step) => step.id + ' ' + step.processType).join(', ')}`;

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(hydrogenBottlingProcessStep);

    jest.spyOn(processStepService, 'fetchProcessStepsOfBatches').mockResolvedValue(invalidProcessSteps);

    await expect(service.readProofOfOrigin(hydrogenBottlingProcessStep.id)).rejects.toThrow(expectedErrorMessage);

    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(hydrogenBottlingProcessStep.id);
  });
});
