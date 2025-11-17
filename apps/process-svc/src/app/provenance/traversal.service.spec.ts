import { Test, TestingModule } from '@nestjs/testing';
import { BatchEntity, BrokerQueues, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';
import { of } from 'rxjs';

function createProcessStep(
    id: string,
    type: ProcessType,
    predecessorBatches: BatchEntity[]
): ProcessStepEntity {
    return { id, type, batch: { predecessors: predecessorBatches } } as ProcessStepEntity;
}

function createBatch(processStepId: string): BatchEntity {
    return { processStepId } as BatchEntity;
}

describe('TraversalService', () => {
    let service: TraversalService;
    let batchSvcSendMock: jest.Mock;

    beforeEach(async () => {
        batchSvcSendMock = jest.fn();

        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                TraversalService,
                { provide: BrokerQueues.QUEUE_BATCH_SVC, useValue: { send: batchSvcSendMock } },
            ],
        }).compile();

        service = moduleRef.get(TraversalService);
    });

    describe('fetchPowerProductionsFromHydrogenProductions', () => {
        it(`throws if ${ProcessType.HYDROGEN_PRODUCTION} process steps are empty`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [];

            const expectedError = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

            // act & assert
            await expect(service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(expectedError);
        });

        it(`throws if any processStep is not ${ProcessType.HYDROGEN_PRODUCTION}`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, []),
                createProcessStep('pp2', ProcessType.POWER_PRODUCTION, []),
            ];

            const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}], but found invalid types: ${givenProcessSteps.at(1).id} (${ProcessType.POWER_PRODUCTION})`;

            // act & assert
            await expect(service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a ${ProcessType.HYDROGEN_PRODUCTION} process step has no predecessor batch`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [])
            ];

            const expectedError = `No predecessors found for process step [${givenProcessSteps.at(0).id}]`;

            // act & assert
            await expect(service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(expectedError);
        });

        it(`should return one ${ProcessType.POWER_PRODUCTION} process step`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('pp1', ProcessType.POWER_PRODUCTION, [])
            ];

            batchSvcSendMock.mockReturnValue(of(expectedResult.at(0)));

            // act
            const actualResult: ProcessStepEntity[] = await service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });

        it(`should traverse recursively through two layers of ${ProcessType.HYDROGEN_PRODUCTION} process steps`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];
            const hp2: ProcessStepEntity = createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b2')]);
            const pp1: ProcessStepEntity = createProcessStep('pp1', ProcessType.POWER_PRODUCTION, []);

            const expectedResult: ProcessStepEntity[] = [pp1];

            // hp1's predecessor batch resolves to hp2, hp2's predecessor batch resolves to pp1
            batchSvcSendMock
                .mockReturnValueOnce(of(hp2)) // fetchProcessStepsOfBatches([b1]) => [hp2]
                .mockReturnValueOnce(of(pp1)); // fetchProcessStepsOfBatches([b2]) => [pp1]

            // act
            const actualResult: ProcessStepEntity[] = await service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(batchSvcSendMock).toHaveBeenCalledTimes(2);

            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });
    });

    describe('fetchWaterConsumptionsFromHydrogenProductions', () => {
        it(`throws if ${ProcessType.HYDROGEN_PRODUCTION} process steps are empty`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [];

            const expectedError = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

            // act & assert
            await expect(service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(expectedError);
        });

        it(`throws if any processStep is not ${ProcessType.HYDROGEN_PRODUCTION}`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, []),
                createProcessStep('pp2', ProcessType.POWER_PRODUCTION, []),
            ];

            const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}], but found invalid types: ${givenProcessSteps.at(1).id} (${ProcessType.POWER_PRODUCTION})`;

            // act & assert
            await expect(service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a ${ProcessType.HYDROGEN_PRODUCTION} process step has no predecessor batch`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [])
            ];

            const expectedError = `No predecessors found for process step [${givenProcessSteps.at(0).id}]`;

            // act & assert
            await expect(service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(expectedError);
        });

        it(`should return one ${ProcessType.WATER_CONSUMPTION} process step`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('wc1', ProcessType.WATER_CONSUMPTION, [])
            ];

            batchSvcSendMock.mockReturnValue(of(expectedResult.at(0)));

            // act
            const actualResult: ProcessStepEntity[] = await service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });

        it(`should traverse recursively through two layers of ${ProcessType.HYDROGEN_PRODUCTION} process steps`, async () => {
            // arrange
            const givenProcessSteps: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];

            const hp2: ProcessStepEntity = createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b2')]);
            const wc1: ProcessStepEntity = createProcessStep('wc1', ProcessType.WATER_CONSUMPTION, []);

            // hp1's predecessor batch resolves to hp2, hp2's predecessor batch resolves to pp1
            batchSvcSendMock
                .mockReturnValueOnce(of(hp2)) // fetchProcessStepsOfBatches([b1]) => [hp2]
                .mockReturnValueOnce(of(wc1)); // fetchProcessStepsOfBatches([b2]) => [pp1]

            const expectedResult: ProcessStepEntity[] = [wc1];

            // act
            const actualResult: ProcessStepEntity[] = await service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(batchSvcSendMock).toHaveBeenCalledTimes(2);

            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });
    });

    describe('fetchHydrogenProductionsFromHydrogenBottling', () => {
        it(`throws if ${ProcessType.HYDROGEN_BOTTLING} process step is null`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = null;

            const expectedError = `Process steps of type [${ProcessType.HYDROGEN_BOTTLING}] are missing.`;

            // act & assert
            await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a processStep is not ${ProcessType.HYDROGEN_BOTTLING}`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, []);

            const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_BOTTLING}], but found invalid types: ${givenProcessStep.id} (${ProcessType.HYDROGEN_PRODUCTION})`;

            // act & assert
            await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a ${ProcessType.HYDROGEN_BOTTLING} process step has no predecessor batch`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, []);

            const expectedError = `No predecessors found for process step [${givenProcessStep.id}]`

            // act & assert
            await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a predecessor process step is not ${ProcessType.HYDROGEN_PRODUCTION}`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, [createBatch('b1'),]);

            const invalidPredecessorProcessStep: ProcessStepEntity = createProcessStep('pp1', ProcessType.POWER_PRODUCTION, []);
            batchSvcSendMock.mockReturnValueOnce(of(invalidPredecessorProcessStep));

            const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}], but found invalid types: ${invalidPredecessorProcessStep.id} (${invalidPredecessorProcessStep.type})`;

            // act & assert
            await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it('throws if a predecessor process step is null', async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, [createBatch('b1'),]);

            batchSvcSendMock.mockReturnValueOnce(of(null));

            const expectedError = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

            // act & assert
            await expect(service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`should return one ${ProcessType.HYDROGEN_PRODUCTION} process step`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, [createBatch('b1')]);

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [])
            ];

            batchSvcSendMock.mockReturnValue(of(expectedResult.at(0)));

            // act
            const actualResult: ProcessStepEntity[] = await service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep);

            // assert
            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });

        it(`should return multiple ${ProcessType.HYDROGEN_PRODUCTION} process steps if multiple predecessor batches exist`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, [createBatch('b1'), createBatch('b2'),]);

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, []),
                createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, []),
            ];

            batchSvcSendMock
                .mockReturnValueOnce(of(expectedResult[0]))
                .mockReturnValueOnce(of(expectedResult[1]));

            // act
            const actualResult: ProcessStepEntity[] = await service.fetchHydrogenProductionsFromHydrogenBottling(givenProcessStep);

            // assert
            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });
    });

    describe('fetchHydrogenBottlingFromHydrogenTransportation', () => {
        it(`throws if ${ProcessType.HYDROGEN_TRANSPORTATION} process step is null`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = null;

            const expectedError = `Process steps of type [${ProcessType.HYDROGEN_TRANSPORTATION}] are missing.`;

            // act & assert
            await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a processStep is not ${ProcessType.HYDROGEN_TRANSPORTATION}`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, []);

            const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_TRANSPORTATION}], but found invalid types: ${givenProcessStep.id} (${ProcessType.HYDROGEN_BOTTLING})`;

            // act & assert
            await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a ${ProcessType.HYDROGEN_TRANSPORTATION} process step has no predecessor batch`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_TRANSPORTATION, []);

            const expectedError = `No predecessors found for process step [${givenProcessStep.id}]`;

            // act & assert
            await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`throws if a predecessor process step is not ${ProcessType.HYDROGEN_TRANSPORTATION}`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_TRANSPORTATION, [createBatch('b1'),]);

            const invalidPredecessorProcessStep = createProcessStep('pp1', ProcessType.POWER_PRODUCTION, []);
            batchSvcSendMock.mockReturnValueOnce(of(invalidPredecessorProcessStep));

            const expectedError = `All process steps must be of type [${ProcessType.HYDROGEN_BOTTLING}], but found invalid types: ${invalidPredecessorProcessStep.id} (${invalidPredecessorProcessStep.type})`;

            // act & assert
            await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it('throws if a predecessor process step is null', async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_TRANSPORTATION, [createBatch('b1'),]);

            batchSvcSendMock.mockReturnValueOnce(of(null));

            const expectedError = `Process steps of type [${ProcessType.HYDROGEN_BOTTLING}] are missing.`;

            // act & assert
            await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`throws if more than one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step is found`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('ht1', ProcessType.HYDROGEN_TRANSPORTATION, [createBatch('b1'), createBatch('b2'),]);

            const hb1: ProcessStepEntity = createProcessStep('hb1', ProcessType.HYDROGEN_BOTTLING, []);
            const hb2: ProcessStepEntity = createProcessStep('hb2', ProcessType.HYDROGEN_BOTTLING, []);

            batchSvcSendMock
                .mockReturnValueOnce(of(hb1))
                .mockReturnValueOnce(of(hb2));

            const expectedError = `Expected exactly one predecessor ${ProcessType.HYDROGEN_BOTTLING} process step, but found [2].`;

            // act & assert
            await expect(service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep))
                .rejects.toThrow(expectedError);
        });

        it(`should return one ${ProcessType.HYDROGEN_BOTTLING} process step`, async () => {
            // arrange
            const givenProcessStep: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_TRANSPORTATION, [createBatch('b1')]);

            const expectedResult: ProcessStepEntity = createProcessStep('hp1', ProcessType.HYDROGEN_BOTTLING, []);

            batchSvcSendMock.mockReturnValue(of(expectedResult));

            // act
            const actualResult: ProcessStepEntity = await service.fetchHydrogenBottlingFromHydrogenTransportation(givenProcessStep);

            // assert
            expect(actualResult).toEqual(expectedResult);
        });
    });
});
