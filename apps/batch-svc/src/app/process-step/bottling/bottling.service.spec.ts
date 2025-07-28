import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerException,
  BrokerQueues,
  ProcessStepEntityHydrogenProductionMock,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { HydrogenColor, parseColor } from '@h2-trust/api';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';
import { BatchSelectionService } from './batch-selection.service';
import { BottlingService } from './bottling.service';
import { calculateRemainingAmount } from './bottling.service.spec.util';
import { HydrogenCompositionService } from './hydrogen-composition.service';
import { ProcessStepAssemblerService } from './process-step-assembler.service';

describe('ProcessStepService', () => {
  const SUFFICIENT_AMOUNT = 90;
  const EXCESSIVE_AMOUNT = 10000;

  let service: BottlingService;
  let processAssemblerService: ProcessStepAssemblerService;
  let processStepRepository: ProcessStepRepository;
  let batchRepository: BatchRepository;
  let generalService: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BottlingService,
        HydrogenCompositionService,
        BatchSelectionService,
        ProcessStepAssemblerService,
        {
          provide: ProcessStepRepository,
          useValue: {
            insertProcessStep: jest.fn(),
            findProcessStep: jest.fn(),
            findAllProcessStepsFromStorageUnit: jest.fn(),
          },
        },
        {
          provide: BatchRepository,
          useValue: {
            setBatchesInactive: jest.fn(),
          },
        },
        {
          provide: DocumentRepository,
          useValue: {},
        },
        {
          provide: StorageService,
          useValue: {},
        },
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BottlingService>(BottlingService);
    processAssemblerService = module.get<ProcessStepAssemblerService>(ProcessStepAssemblerService);
    processStepRepository = module.get<ProcessStepRepository>(ProcessStepRepository);
    batchRepository = module.get<BatchRepository>(BatchRepository);
    generalService = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
  });

  describe('successful bottling operations', () => {
    it('should create bottling ProcessStep', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntityHydrogenProductionMock.slice(3, 4));
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createBottling(processStepData, undefined);

      // Assert
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create bottling ProcessStep with split merge', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = SUFFICIENT_AMOUNT;

      // Arrange
      const hydrogenProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(4, 5);
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(hydrogenProcessSteps);
      const processAssemblerAssembleMock = jest.spyOn(
        processAssemblerService,
        'assembleHydrogenProductionProcessStepForRemainingBatchAmount',
      );
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const processAssemblerCreateMock = jest.spyOn(processAssemblerService, 'createBottlingProcessStep');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createBottling(processStepData, undefined);

      // Assert
      expect(processAssemblerAssembleMock).toHaveBeenCalledWith(
        processStepData,
        calculateRemainingAmount(
          hydrogenProcessSteps.map((processStep) => processStep.batch),
          processStepData.batch.amount,
        ),
        hydrogenProcessSteps[0].batch.owner.id,
        hydrogenProcessSteps[0],
      );
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(2);
      expect(processAssemblerCreateMock).toHaveBeenCalledWith(
        processStepData,
        hydrogenProcessSteps.map((step) => step.batch),
      );
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create bottling ProcessStep with split merge and overfull storage tank', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = SUFFICIENT_AMOUNT;

      // Arrange
      const hydrogenProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(3, 6);
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(hydrogenProcessSteps);
      const processAssemblerAssembleMock = jest.spyOn(
        processAssemblerService,
        'assembleHydrogenProductionProcessStepForRemainingBatchAmount',
      );
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const processAssemblerCreateMock = jest.spyOn(processAssemblerService, 'createBottlingProcessStep');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createBottling(processStepData, undefined);

      // Assert
      const selectedBatches = hydrogenProcessSteps.slice(0, 2).map((step) => step.batch);
      expect(processAssemblerAssembleMock).toHaveBeenCalledWith(
        processStepData,
        calculateRemainingAmount(selectedBatches, processStepData.batch.amount),
        hydrogenProcessSteps[0].batch.owner.id,
        hydrogenProcessSteps.at(-2),
      );
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(2);
      expect(processAssemblerCreateMock).toHaveBeenCalledWith(processStepData, selectedBatches);
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create MIX bottling ProcessStep', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = SUFFICIENT_AMOUNT;
      processStepData.batch.quality = `{"color":"${HydrogenColor.MIX}"}`;

      // Arrange
      const hydrogenProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(4, 8);
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(hydrogenProcessSteps);
      const processAssemblerAssembleMock = jest.spyOn(
        processAssemblerService,
        'assembleHydrogenProductionProcessStepForRemainingBatchAmount',
      );
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const processAssemblerCreateMock = jest.spyOn(processAssemblerService, 'createBottlingProcessStep');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');
      const generalServiceSpy = jest.spyOn(generalService, 'send');
      generalServiceSpy.mockImplementation((_messagePattern: UnitMessagePatterns.READ, _data: any) => {
        return of({
          id: 'hydrogen-storage-unit-id',
          filling: hydrogenProcessSteps.map((step) => ({
            color: parseColor(step.batch.quality),
            amount: step.batch.amount,
          })),
        });
      });

      // Act
      await service.createBottling(processStepData, undefined);

      // Assert
      const totalStoredAmount = hydrogenProcessSteps.reduce((sum, step) => sum + step.batch.amount, 0);
      for (let i = 0; i < hydrogenProcessSteps.length; i += 1) {
        expect(processAssemblerAssembleMock).toHaveBeenNthCalledWith(i + 1,
          processStepData,
          hydrogenProcessSteps[i].batch.amount - processStepData.batch.amount *  hydrogenProcessSteps[i].batch.amount / totalStoredAmount,
          hydrogenProcessSteps[i].batch.owner.id,
          hydrogenProcessSteps.at(i),
        );
      }
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(hydrogenProcessSteps.length + 1);
      expect(processAssemblerCreateMock).toHaveBeenCalledWith(
        processStepData,
        hydrogenProcessSteps.map((step) => step.batch),
      );
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create bottling ProcessStep only with green batches', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntityHydrogenProductionMock.slice(0, 4));
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createBottling(processStepData, undefined);

      // Assert
      expect(createProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });
  });

  describe('error cases', () => {
    it('should throw when insufficient hydrogen amount', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = EXCESSIVE_AMOUNT;

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntityHydrogenProductionMock.slice(3, 4));

      // Act & Assert
      await expect(service.createBottling(processStepData, undefined)).rejects.toThrow(BrokerException);
    });

    it('should throw when no hydrogen batches available', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);

      // Arrange
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue([]);

      // Act & Assert
      await expect(service.createBottling(processStepData, undefined)).rejects.toThrow(BrokerException);
    });

  });
});
