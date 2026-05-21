/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { BlockchainService } from '@h2-trust/blockchain';
import { FeatureFlagService } from '@h2-trust/configuration';
import {
  CsvDocumentEntity,
  StagedProductionAccountingPeriod,
  StagedProductionEntity,
  UnitAccountingPeriods,
  UnitFileImport,
} from '@h2-trust/contracts/entities';
import {
  HydrogenProductionUnitEntityFixture,
  HydrogenStorageUnitEntityFixture,
  PowerProductionUnitEntityFixture,
  PowerPurchaseAgreementEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  FinalizeProductionsPayloadFixture,
  StageProductionsPayloadFixture,
} from '@h2-trust/contracts/payloads/fixtures';
import {
  CreateCsvDocumentInput,
  CsvImportRepository,
  PowerPurchaseAgreementRepository,
  PrismaService,
  StagedProductionRepository,
} from '@h2-trust/database';
import {
  CsvContentType,
  DefaultGridProvider,
  PowerType,
  PowerPurchaseAgreementStatus,
  StagingScope,
} from '@h2-trust/domain';
import { QUEUE_GENERAL_SVC } from '@h2-trust/messaging';
import { CsvImportProcessingService } from './csv/csv-import-processing.service';
import { normalizeProduction } from './production-normalizer';
import { ProductionCreationService } from './production-creation.service';
import { ProductionStagingService } from './production-staging.service';

jest.mock('./production-normalizer', () => ({
  normalizeProduction: jest.fn(),
}));

describe('ProductionStagingService', () => {
  let service: ProductionStagingService;

  const normalizeProductionMock = jest.mocked(normalizeProduction);

  const generalSvcMock = {
    send: jest.fn(),
  };

  const productionCreationServiceMock = {
    createAndPersistProductions: jest.fn(),
  };

  const blockchainServiceMock = {
    storeProofs: jest.fn(),
  };

  const featureFlagServiceMock = {
    verificationEnabled: true,
  };

  const csvImportProcessingServiceMock = {
    parseAndUploadFiles: jest.fn(),
    createCsvDocumentInputs: jest.fn(),
  };

  const csvImportRepositoryMock = {
    saveCsvImport: jest.fn(),
    saveCsvDocuments: jest.fn(),
    updateTransactionHash: jest.fn(),
  };

  const prismaServiceMock = {
    $transaction: jest.fn(),
  };

  const stagedProductionRepositoryMock = {
    findStagedProductionsForIds: jest.fn(),
    saveStagedProductions: jest.fn(),
    setStagedProductionsToInactive: jest.fn(),
    findStagedProductions: jest.fn(),
  };

  const powerPurchaseAgreementRepositoryMock = {
    findAllPowerPurchaseAgreements: jest.fn(),
  };

  beforeEach(async () => {
    featureFlagServiceMock.verificationEnabled = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionStagingService,
        {
          provide: QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
        {
          provide: ProductionCreationService,
          useValue: productionCreationServiceMock,
        },
        {
          provide: BlockchainService,
          useValue: blockchainServiceMock,
        },
        {
          provide: FeatureFlagService,
          useValue: featureFlagServiceMock,
        },
        {
          provide: CsvImportProcessingService,
          useValue: csvImportProcessingServiceMock,
        },
        {
          provide: CsvImportRepository,
          useValue: csvImportRepositoryMock,
        },
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: StagedProductionRepository,
          useValue: stagedProductionRepositoryMock,
        },
        {
          provide: PowerPurchaseAgreementRepository,
          useValue: powerPurchaseAgreementRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ProductionStagingService>(ProductionStagingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProductionsFromStaging', () => {
    it('creates productions from staged hydrogen and power entries and deactivates the consumed staging rows', async () => {
      // Arrange
      const givenPayload = FinalizeProductionsPayloadFixture.create({
        stagedPowerProductions: ['staged-power-1'],
      });
      const givenStagedHydrogenProduction = new StagedProductionEntity(
        'staged-hydrogen-1',
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-01T00:59:59Z'),
        10,
        'hydrogen-unit-1',
        'hydrogen-owner-1',
        100,
        CsvContentType.HYDROGEN,
      );
      const givenStagedPowerProduction = new StagedProductionEntity(
        'staged-power-1',
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-01T00:59:59Z'),
        100,
        'power-unit-1',
        'power-owner-1',
        0,
        CsvContentType.POWER,
      );
      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        id: 'hydrogen-unit-1',
        waterConsumptionLitersPerHour: 20,
      });
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' });
      const givenStorageUnit = HydrogenStorageUnitEntityFixture.create({ id: givenPayload.storageUnitId });
      const givenDefaultGridUnit = PowerProductionUnitEntityFixture.create({
        id: DefaultGridProvider.DEFAULT_GRID_POWER_PRODUCTION_UNIT_ID,
      });
      const expectedProcessSteps = [ProcessStepEntityFixture.createHydrogenProduction()];

      stagedProductionRepositoryMock.findStagedProductionsForIds.mockResolvedValue([
        givenStagedHydrogenProduction,
        givenStagedPowerProduction,
      ]);
      generalSvcMock.send.mockReturnValueOnce(
        of([givenHydrogenUnit, givenPowerUnit, givenStorageUnit, givenDefaultGridUnit]),
      );
      productionCreationServiceMock.createAndPersistProductions.mockResolvedValue(expectedProcessSteps);
      stagedProductionRepositoryMock.setStagedProductionsToInactive.mockResolvedValue(2);

      // Act
      const actualResult = await service.createProductionsFromStaging(givenPayload);

      // Assert
      expect(stagedProductionRepositoryMock.findStagedProductionsForIds).toHaveBeenCalledWith([
        givenPayload.stagedHydrogenProduction,
        ...givenPayload.stagedPowerProductions,
      ]);
      expect(generalSvcMock.send).toHaveBeenCalledTimes(1);
      expect(productionCreationServiceMock.createAndPersistProductions).toHaveBeenCalledTimes(1);

      const [actualCreateProductions, actualUnitsForId] =
        productionCreationServiceMock.createAndPersistProductions.mock.calls[0];

      expect(actualCreateProductions).toHaveLength(1);
      expect(actualCreateProductions[0]).toEqual(
        expect.objectContaining({
          powerProductionUnitId: givenStagedPowerProduction.unitId,
          hydrogenProductionUnitId: givenStagedHydrogenProduction.unitId,
          powerAmountKwh: givenStagedHydrogenProduction.powerConsumed,
          hydrogenAmountKg: givenStagedHydrogenProduction.amountProduced,
          recordedBy: givenPayload.recordedBy,
          hydrogenStorageUnitId: givenPayload.storageUnitId,
          ownerIdOfPowerProductionUnit: givenStagedPowerProduction.ownerId,
          ownerIdOfHydrogenProductionUnit: givenStagedHydrogenProduction.ownerId,
          waterConsumptionLitersPerHour: 20,
        }),
      );
      expect(actualUnitsForId.get('hydrogen-unit-1')).toEqual(givenHydrogenUnit);
      expect(actualUnitsForId.get('power-unit-1')).toEqual(givenPowerUnit);
      expect(stagedProductionRepositoryMock.saveStagedProductions).not.toHaveBeenCalled();
      expect(stagedProductionRepositoryMock.setStagedProductionsToInactive).toHaveBeenCalledWith([
        'staged-hydrogen-1',
        'staged-power-1',
      ]);
      expect(actualResult).toEqual(expectedProcessSteps);
    });

    it('throws when the staged production ids do not resolve to one hydrogen and at least one power entry', async () => {
      // Arrange
      const givenPayload = FinalizeProductionsPayloadFixture.create();

      stagedProductionRepositoryMock.findStagedProductionsForIds.mockResolvedValue([
        new StagedProductionEntity(
          'staged-power-1',
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:59:59Z'),
          50,
          'power-unit-1',
          'power-owner-1',
          0,
          CsvContentType.POWER,
        ),
      ]);

      // Act & Assert
      await expect(service.createProductionsFromStaging(givenPayload)).rejects.toThrow(
        'The given staged production IDs are invalid',
      );
      expect(productionCreationServiceMock.createAndPersistProductions).not.toHaveBeenCalled();
    });

    it('persists remaining staged power when the final staged power entry is only partially consumed', async () => {
      // Arrange
      const givenPayload = FinalizeProductionsPayloadFixture.create({
        stagedPowerProductions: ['staged-power-1'],
      });
      const givenStagedHydrogenProduction = new StagedProductionEntity(
        'staged-hydrogen-1',
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-01T00:59:59Z'),
        10,
        'hydrogen-unit-1',
        'hydrogen-owner-1',
        60,
        CsvContentType.HYDROGEN,
      );
      const givenStagedPowerProduction = new StagedProductionEntity(
        'staged-power-1',
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-01T00:59:59Z'),
        100,
        'power-unit-1',
        'power-owner-1',
        0,
        CsvContentType.POWER,
      );
      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        id: 'hydrogen-unit-1',
        waterConsumptionLitersPerHour: 20,
      });
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' });
      const givenStorageUnit = HydrogenStorageUnitEntityFixture.create({ id: givenPayload.storageUnitId });
      const givenDefaultGridUnit = PowerProductionUnitEntityFixture.create({
        id: DefaultGridProvider.DEFAULT_GRID_POWER_PRODUCTION_UNIT_ID,
      });

      stagedProductionRepositoryMock.findStagedProductionsForIds.mockResolvedValue([
        givenStagedHydrogenProduction,
        givenStagedPowerProduction,
      ]);
      generalSvcMock.send.mockReturnValueOnce(
        of([givenHydrogenUnit, givenPowerUnit, givenStorageUnit, givenDefaultGridUnit]),
      );
      productionCreationServiceMock.createAndPersistProductions.mockResolvedValue([
        ProcessStepEntityFixture.createHydrogenProduction(),
      ]);
      stagedProductionRepositoryMock.setStagedProductionsToInactive.mockResolvedValue(2);

      // Act
      await service.createProductionsFromStaging(givenPayload);

      // Assert
      expect(stagedProductionRepositoryMock.saveStagedProductions).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            amountProduced: 40,
            unitId: 'power-unit-1',
            ownerId: 'power-owner-1',
            type: CsvContentType.POWER,
          }),
        ],
        undefined,
      );
      expect(stagedProductionRepositoryMock.setStagedProductionsToInactive).toHaveBeenCalledWith([
        'staged-hydrogen-1',
        'staged-power-1',
      ]);
    });

    it('adds grid power productions when staged power is insufficient', async () => {
      // Arrange
      const givenPayload = FinalizeProductionsPayloadFixture.create({
        stagedPowerProductions: ['staged-power-1'],
      });
      const givenStagedHydrogenProduction = new StagedProductionEntity(
        'staged-hydrogen-1',
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-01T00:59:59Z'),
        10,
        'hydrogen-unit-1',
        'hydrogen-owner-1',
        100,
        CsvContentType.HYDROGEN,
      );
      const givenStagedPowerProduction = new StagedProductionEntity(
        'staged-power-1',
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-01T00:59:59Z'),
        40,
        'power-unit-1',
        'power-owner-1',
        0,
        CsvContentType.POWER,
      );
      const givenHydrogenUnit = HydrogenProductionUnitEntityFixture.create({
        id: 'hydrogen-unit-1',
        waterConsumptionLitersPerHour: 20,
      });
      const givenPowerUnit = PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' });
      const givenStorageUnit = HydrogenStorageUnitEntityFixture.create({ id: givenPayload.storageUnitId });
      const givenDefaultGridUnit = PowerProductionUnitEntityFixture.create({
        id: DefaultGridProvider.DEFAULT_GRID_POWER_PRODUCTION_UNIT_ID,
      });

      stagedProductionRepositoryMock.findStagedProductionsForIds.mockResolvedValue([
        givenStagedHydrogenProduction,
        givenStagedPowerProduction,
      ]);
      generalSvcMock.send.mockReturnValueOnce(
        of([givenHydrogenUnit, givenPowerUnit, givenStorageUnit, givenDefaultGridUnit]),
      );
      productionCreationServiceMock.createAndPersistProductions.mockResolvedValue([
        ProcessStepEntityFixture.createHydrogenProduction(),
      ]);
      stagedProductionRepositoryMock.setStagedProductionsToInactive.mockResolvedValue(2);

      // Act
      await service.createProductionsFromStaging(givenPayload);

      // Assert
      const [actualCreateProductions] = productionCreationServiceMock.createAndPersistProductions.mock.calls[0];

      expect(actualCreateProductions).toHaveLength(3);
      expect(actualCreateProductions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            powerProductionUnitId: 'power-unit-1',
            powerAmountKwh: 40,
            powerType: PowerType.RENEWABLE,
          }),
          expect.objectContaining({
            powerProductionUnitId: DefaultGridProvider.DEFAULT_GRID_POWER_PRODUCTION_UNIT_ID,
            powerType: PowerType.PARTLY_RENEWABLE,
          }),
          expect.objectContaining({
            powerProductionUnitId: DefaultGridProvider.DEFAULT_GRID_POWER_PRODUCTION_UNIT_ID,
            powerType: PowerType.NON_RENEWABLE,
          }),
        ]),
      );
      expect(stagedProductionRepositoryMock.saveStagedProductions).not.toHaveBeenCalled();
    });
  });

  describe('readStagedProductions', () => {
    it('reads own staged productions directly from the repository', async () => {
      // Arrange
      const givenPayload = {
        ownerId: 'company-1',
        stagingScope: StagingScope.OWN,
        type: CsvContentType.HYDROGEN,
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T23:59:59Z'),
      };
      const expectedStagedProductions = [
        new StagedProductionEntity(
          'staged-hydrogen-1',
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:59:59Z'),
          10,
          'hydrogen-unit-1',
          'company-1',
          100,
          CsvContentType.HYDROGEN,
        ),
      ];

      stagedProductionRepositoryMock.findStagedProductions.mockResolvedValue(expectedStagedProductions);

      // Act
      const actualResult = await service.readStagedProductions(givenPayload);

      // Assert
      expect(stagedProductionRepositoryMock.findStagedProductions).toHaveBeenCalledWith(givenPayload, true, []);
      expect(actualResult).toEqual(expectedStagedProductions);
    });

    it('reads received staged productions for approved agreements only', async () => {
      // Arrange
      const givenPayload = {
        ownerId: 'company-1',
        stagingScope: StagingScope.RECEIVED,
        type: CsvContentType.POWER,
        from: new Date('2026-01-01T00:00:00Z'),
        to: new Date('2026-01-31T23:59:59Z'),
      };
      const givenApprovedAgreement = PowerPurchaseAgreementEntityFixture.create({
        status: PowerPurchaseAgreementStatus.APPROVED,
        powerProductionUnit: PowerProductionUnitEntityFixture.create({ id: 'power-unit-1' }),
      });
      const expectedStagedProductions = [
        new StagedProductionEntity(
          'staged-power-1',
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:59:59Z'),
          50,
          'power-unit-1',
          'power-owner-1',
          0,
          CsvContentType.POWER,
        ),
      ];

      powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements.mockResolvedValue([givenApprovedAgreement]);
      stagedProductionRepositoryMock.findStagedProductions.mockResolvedValue(expectedStagedProductions);

      // Act
      const actualResult = await service.readStagedProductions(givenPayload);

      // Assert
      expect(powerPurchaseAgreementRepositoryMock.findAllPowerPurchaseAgreements).toHaveBeenCalledWith(
        givenPayload.ownerId,
        PowerPurchaseAgreementStatus.APPROVED,
      );
      expect(stagedProductionRepositoryMock.findStagedProductions).toHaveBeenCalledWith(
        givenPayload,
        false,
        ['power-unit-1'],
      );
      expect(actualResult).toEqual(expectedStagedProductions);
    });
  });

  describe('stageProductions', () => {
    it('persists staged productions and skips blockchain proof storage when verification is disabled', async () => {
      // Arrange
      const givenPayload = StageProductionsPayloadFixture.create({
        productionImports: [
          new UnitFileImport(
            'power-unit-1',
            'hash-1',
            Buffer.from('time,amount').toString('base64'),
            CsvContentType.POWER,
          ),
        ],
      });
      const givenParsedImports = [
        {
          periods: new UnitAccountingPeriods('power-unit-1', [
            new StagedProductionAccountingPeriod(12, new Date('2026-01-01T00:00:00Z'), 0),
          ]),
          type: CsvContentType.POWER,
          fileName: 'hash-1.csv',
          hash: 'hash-1',
          cid: 'cid-1',
        },
      ];
      const givenStagedProductions = [
        new StagedProductionEntity(
          'staged-power-1',
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:59:59Z'),
          12,
          'power-unit-1',
          givenPayload.companyId,
          0,
          CsvContentType.POWER,
        ),
      ];
      const givenCsvDocumentInputs: CreateCsvDocumentInput[] = [
        {
          type: CsvContentType.POWER,
          startedAt: new Date('2026-01-01T00:00:00Z'),
          endedAt: new Date('2026-01-01T00:00:00Z'),
          fileName: 'hash-1.csv',
          amount: 12,
        },
      ];
      const givenCsvDocuments = [
        new CsvDocumentEntity(
          'csv-document-1',
          'hash-1.csv',
          CsvContentType.POWER,
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:00:00Z'),
          12,
        ),
      ];
      const tx = { id: 'transaction-1' };

      featureFlagServiceMock.verificationEnabled = false;
      csvImportProcessingServiceMock.parseAndUploadFiles.mockResolvedValue(givenParsedImports);
      normalizeProductionMock.mockReturnValue(givenStagedProductions);
      csvImportRepositoryMock.saveCsvImport.mockResolvedValue('csv-import-1');
      csvImportProcessingServiceMock.createCsvDocumentInputs.mockReturnValue(givenCsvDocumentInputs);
      csvImportRepositoryMock.saveCsvDocuments.mockResolvedValue(givenCsvDocuments);
      prismaServiceMock.$transaction.mockImplementation(async (callback) => callback(tx));

      // Act
      const actualResult = await service.stageProductions(givenPayload);

      // Assert
      expect(csvImportProcessingServiceMock.parseAndUploadFiles).toHaveBeenCalledWith(
        givenPayload.productionImports,
        givenPayload.timeZone,
      );
      expect(normalizeProductionMock).toHaveBeenCalledWith(givenParsedImports, givenPayload.companyId);
      expect(csvImportRepositoryMock.saveCsvImport).toHaveBeenCalledWith(givenPayload.userId, tx);
      expect(csvImportRepositoryMock.saveCsvDocuments).toHaveBeenCalledWith('csv-import-1', givenCsvDocumentInputs, tx);
      expect(stagedProductionRepositoryMock.saveStagedProductions).toHaveBeenCalledWith(
        givenStagedProductions,
        'csv-import-1',
        tx,
      );
      expect(blockchainServiceMock.storeProofs).not.toHaveBeenCalled();
      expect(csvImportRepositoryMock.updateTransactionHash).not.toHaveBeenCalled();
      expect(actualResult).toEqual(
        expect.objectContaining({
          id: 'csv-import-1',
          amount: 12,
          powerUsed: 0,
          numberOfBatches: 1,
        }),
      );
    });

    it('stores CSV proofs on-chain and updates the transaction hash when verification is enabled', async () => {
      // Arrange
      const givenPayload = StageProductionsPayloadFixture.create({
        productionImports: [
          new UnitFileImport(
            'power-unit-1',
            'hash-1',
            Buffer.from('time,amount').toString('base64'),
            CsvContentType.POWER,
          ),
        ],
      });
      const givenParsedImports = [
        {
          periods: new UnitAccountingPeriods('power-unit-1', [
            new StagedProductionAccountingPeriod(12, new Date('2026-01-01T00:00:00Z'), 0),
          ]),
          type: CsvContentType.POWER,
          fileName: 'hash-1.csv',
          hash: 'hash-1',
          cid: 'cid-1',
        },
      ];
      const givenStagedProductions = [
        new StagedProductionEntity(
          'staged-power-1',
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:59:59Z'),
          12,
          'power-unit-1',
          givenPayload.companyId,
          0,
          CsvContentType.POWER,
        ),
      ];
      const givenCsvDocumentInputs: CreateCsvDocumentInput[] = [
        {
          type: CsvContentType.POWER,
          startedAt: new Date('2026-01-01T00:00:00Z'),
          endedAt: new Date('2026-01-01T00:00:00Z'),
          fileName: 'hash-1.csv',
          amount: 12,
        },
      ];
      const givenCsvDocuments = [
        new CsvDocumentEntity(
          'csv-document-1',
          'hash-1.csv',
          CsvContentType.POWER,
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:00:00Z'),
          12,
        ),
      ];
      const tx = { id: 'transaction-1' };

      csvImportProcessingServiceMock.parseAndUploadFiles.mockResolvedValue(givenParsedImports);
      normalizeProductionMock.mockReturnValue(givenStagedProductions);
      csvImportRepositoryMock.saveCsvImport.mockResolvedValue('csv-import-1');
      csvImportProcessingServiceMock.createCsvDocumentInputs.mockReturnValue(givenCsvDocumentInputs);
      csvImportRepositoryMock.saveCsvDocuments.mockResolvedValue(givenCsvDocuments);
      prismaServiceMock.$transaction.mockImplementation(async (callback) => callback(tx));
      blockchainServiceMock.storeProofs.mockResolvedValue('tx-hash-1');

      // Act
      await service.stageProductions(givenPayload);

      // Assert
      expect(blockchainServiceMock.storeProofs).toHaveBeenCalledWith([
        {
          uuid: 'csv-document-1',
          hash: 'hash-1',
          cid: 'cid-1',
        },
      ]);
      expect(csvImportRepositoryMock.updateTransactionHash).toHaveBeenCalledWith(['csv-document-1'], 'tx-hash-1');
    });

    it('throws when the number of document proofs does not match the persisted CSV documents', async () => {
      // Arrange
      const givenPayload = StageProductionsPayloadFixture.create({
        productionImports: [
          new UnitFileImport(
            'power-unit-1',
            'hash-1',
            Buffer.from('time,amount').toString('base64'),
            CsvContentType.POWER,
          ),
        ],
      });
      const givenParsedImports = [
        {
          periods: new UnitAccountingPeriods('power-unit-1', [
            new StagedProductionAccountingPeriod(12, new Date('2026-01-01T00:00:00Z'), 0),
          ]),
          type: CsvContentType.POWER,
          fileName: 'hash-1.csv',
          hash: 'hash-1',
          cid: 'cid-1',
        },
      ];
      const tx = { id: 'transaction-1' };

      csvImportProcessingServiceMock.parseAndUploadFiles.mockResolvedValue(givenParsedImports);
      normalizeProductionMock.mockReturnValue([]);
      csvImportRepositoryMock.saveCsvImport.mockResolvedValue('csv-import-1');
      csvImportProcessingServiceMock.createCsvDocumentInputs.mockReturnValue([
        {
          type: CsvContentType.POWER,
          startedAt: new Date('2026-01-01T00:00:00Z'),
          endedAt: new Date('2026-01-01T00:00:00Z'),
          fileName: 'hash-1.csv',
          amount: 12,
        },
      ]);
      csvImportRepositoryMock.saveCsvDocuments.mockResolvedValue([]);
      prismaServiceMock.$transaction.mockImplementation(async (callback) => callback(tx));

      // Act & Assert
      await expect(service.stageProductions(givenPayload)).rejects.toThrow(
        'Number of document proofs (1) does not match number of CSV documents (0).',
      );
      expect(blockchainServiceMock.storeProofs).not.toHaveBeenCalled();
      expect(csvImportRepositoryMock.updateTransactionHash).not.toHaveBeenCalled();
    });

    it('propagates blockchain storage errors without updating transaction hashes', async () => {
      // Arrange
      const givenPayload = StageProductionsPayloadFixture.create({
        productionImports: [
          new UnitFileImport(
            'power-unit-1',
            'hash-1',
            Buffer.from('time,amount').toString('base64'),
            CsvContentType.POWER,
          ),
        ],
      });
      const givenParsedImports = [
        {
          periods: new UnitAccountingPeriods('power-unit-1', [
            new StagedProductionAccountingPeriod(12, new Date('2026-01-01T00:00:00Z'), 0),
          ]),
          type: CsvContentType.POWER,
          fileName: 'hash-1.csv',
          hash: 'hash-1',
          cid: 'cid-1',
        },
      ];
      const givenCsvDocuments = [
        new CsvDocumentEntity(
          'csv-document-1',
          'hash-1.csv',
          CsvContentType.POWER,
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:00:00Z'),
          12,
        ),
      ];
      const tx = { id: 'transaction-1' };
      const expectedError = new Error('blockchain unavailable');

      csvImportProcessingServiceMock.parseAndUploadFiles.mockResolvedValue(givenParsedImports);
      normalizeProductionMock.mockReturnValue([]);
      csvImportRepositoryMock.saveCsvImport.mockResolvedValue('csv-import-1');
      csvImportProcessingServiceMock.createCsvDocumentInputs.mockReturnValue([
        {
          type: CsvContentType.POWER,
          startedAt: new Date('2026-01-01T00:00:00Z'),
          endedAt: new Date('2026-01-01T00:00:00Z'),
          fileName: 'hash-1.csv',
          amount: 12,
        },
      ]);
      csvImportRepositoryMock.saveCsvDocuments.mockResolvedValue(givenCsvDocuments);
      prismaServiceMock.$transaction.mockImplementation(async (callback) => callback(tx));
      blockchainServiceMock.storeProofs.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.stageProductions(givenPayload)).rejects.toThrow(expectedError);
      expect(csvImportRepositoryMock.updateTransactionHash).not.toHaveBeenCalled();
    });
  });
});