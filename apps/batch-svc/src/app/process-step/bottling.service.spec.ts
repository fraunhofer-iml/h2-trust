import { Test, TestingModule } from '@nestjs/testing';
import { BrokerException, ProcessStepEntitiesMock } from '@h2-trust/amqp';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';
import { BottlingService } from './bottling.service';
import { calculateRemainingAmount } from './bottling.service.spec.util';

describe('ProcessStepService', () => {
  const SUFFICIENT_AMOUNT = 90;
  const EXCESSIVE_AMOUNT = 10000;

  let service: BottlingService;
  let processStepRepository: ProcessStepRepository;
  let batchRepository: BatchRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BottlingService,
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
      ],
    }).compile();

    service = module.get<BottlingService>(BottlingService);
    processStepRepository = module.get<ProcessStepRepository>(ProcessStepRepository);
    batchRepository = module.get<BatchRepository>(BatchRepository);
  });

  describe('successful bottling operations', () => {
    it('should create bottling ProcessStep', async () => {
      const processStepData = structuredClone(ProcessStepEntitiesMock[0]);

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntitiesMock.slice(0, 1));
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

    it('should create bottling ProcessStep with split merge', async () => {
      const processStepData = structuredClone(ProcessStepEntitiesMock[0]);
      processStepData.batch.amount = SUFFICIENT_AMOUNT;

      // Arrange
      const hydrogenProcessSteps = ProcessStepEntitiesMock.slice(4, 5);
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(hydrogenProcessSteps);
      const insertProcessStepSpy = jest.spyOn(processStepRepository, 'insertProcessStep').mockResolvedValue(processStepData);
      jest.spyOn(service as any, 'createBottlingProcessStep');
      jest.spyOn(service as any, 'createHydrogenProductionProcessStepForRemainingBatchAmount');
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createBottling(processStepData, undefined);

      // Assert
      expect(insertProcessStepSpy).toHaveBeenCalledTimes(2);
      expect(service['createBottlingProcessStep']).toHaveBeenCalledWith(processStepData, hydrogenProcessSteps);
      expect(service['createHydrogenProductionProcessStepForRemainingBatchAmount']).toHaveBeenCalledWith(
        processStepData,
        calculateRemainingAmount(
          hydrogenProcessSteps.map((processStep) => processStep.batch),
          processStepData.batch.amount,
        ),
        hydrogenProcessSteps[0].batch.owner.id,
        hydrogenProcessSteps.at(-1),
      );
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create bottling ProcessStep with split merge and overfull storage tank', async () => {
      const processStepData = structuredClone(ProcessStepEntitiesMock[0]);
      processStepData.batch.amount = SUFFICIENT_AMOUNT;

      // Arrange
      const givenProcessSteps = ProcessStepEntitiesMock.slice(4, 5);
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(givenProcessSteps);
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      jest.spyOn(service as any, 'createBottlingProcessStep');
      jest.spyOn(service as any, 'createHydrogenProductionProcessStepForRemainingBatchAmount');
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createBottling(processStepData, undefined);

      // Assert
      expect(createProcessStepSpy).toHaveBeenCalledTimes(2);
      expect(service['createBottlingProcessStep']).toHaveBeenCalledWith(processStepData, givenProcessSteps);
      expect(service['createHydrogenProductionProcessStepForRemainingBatchAmount']).toHaveBeenCalledWith(
        processStepData,
        calculateRemainingAmount(
          ProcessStepEntitiesMock.map((processStep) => processStep.batch).slice(4, 5),
          processStepData.batch.amount,
        ),
        givenProcessSteps[0].batch.owner.id,
        givenProcessSteps[0],
      );
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });
  });

  describe('error cases', () => {
    it('should throw when insufficient hydrogen amount', async () => {
      const processStepData = structuredClone(ProcessStepEntitiesMock[0]);
      processStepData.batch.amount = EXCESSIVE_AMOUNT;

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntitiesMock.slice(0, 1));

      // Act & Assert
      await expect(service.createBottling(processStepData, undefined)).rejects.toThrow(BrokerException);
    });

    it('should throw when no hydrogen batches available', async () => {
      const processStepData = structuredClone(ProcessStepEntitiesMock[0]);

      // Arrange
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue([]);

      // Act & Assert
      await expect(service.createBottling(processStepData, undefined)).rejects.toThrow(BrokerException);
    });
  });
});
