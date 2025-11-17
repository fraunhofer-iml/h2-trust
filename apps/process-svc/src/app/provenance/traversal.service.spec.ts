import { Test, TestingModule } from '@nestjs/testing';
import { BatchEntity, BrokerQueues, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';
import { of } from 'rxjs';

function createProcessStep(id: string, type: ProcessType, predecessorBatches: BatchEntity[]): ProcessStepEntity {
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
            const givenProcessSteps = [
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
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [])
            ];

            // act & assert
            await expect(service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(`No predecessors found for process step [${givenProcessSteps.at(0).id}]`);
        });

        it(`should return one ${ProcessType.POWER_PRODUCTION} process step`, async () => {
            // arrange
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('pp1', ProcessType.POWER_PRODUCTION, [])
            ];

            batchSvcSendMock.mockReturnValue(of(expectedResult.at(0)));

            // act
            const actualResult = await service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });

        it(`should return two ${ProcessType.POWER_PRODUCTION} process steps`, async () => {
            // arrange
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')]),
                createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b2')])
            ];

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('pp1', ProcessType.POWER_PRODUCTION, []),
                createProcessStep('pp2', ProcessType.POWER_PRODUCTION, [])
            ];

            batchSvcSendMock
                .mockReturnValueOnce(of(expectedResult.at(0)))
                .mockReturnValueOnce(of(expectedResult.at(1)));

            // act
            const actualResult = await service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(batchSvcSendMock).toHaveBeenCalledTimes(2);

            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);

        });

        it(`should traverse recursively through two layers of ${ProcessType.HYDROGEN_PRODUCTION} process steps`, async () => {
            // arrange
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];
            const hp2 = createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b2')]);
            const pp1 = createProcessStep('pp1', ProcessType.POWER_PRODUCTION, []);

            const expectedResult: ProcessStepEntity[] = [pp1];

            // hp1's predecessor batch resolves to hp2, hp2's predecessor batch resolves to pp1
            batchSvcSendMock
                .mockReturnValueOnce(of(hp2)) // fetchProcessStepsOfBatches([b1]) => [hp2]
                .mockReturnValueOnce(of(pp1)); // fetchProcessStepsOfBatches([b2]) => [pp1]

            // act
            const actualResult = await service.fetchPowerProductionsFromHydrogenProductions(givenProcessSteps);

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
            const givenProcessSteps = [
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
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [])
            ];

            // act & assert
            await expect(service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps))
                .rejects.toThrow(`No predecessors found for process step [${givenProcessSteps.at(0).id}]`);
        });

        it(`should return one ${ProcessType.WATER_CONSUMPTION} process step`, async () => {
            // arrange
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('wc1', ProcessType.WATER_CONSUMPTION, [])
            ];

            batchSvcSendMock.mockReturnValue(of(expectedResult.at(0)));

            // act
            const actualResult = await service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });

        it(`should return two ${ProcessType.WATER_CONSUMPTION} process steps`, async () => {
            // arrange
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')]),
                createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b2')])
            ];

            const expectedResult: ProcessStepEntity[] = [
                createProcessStep('wc1', ProcessType.WATER_CONSUMPTION, []),
                createProcessStep('wc2', ProcessType.WATER_CONSUMPTION, [])
            ];

            batchSvcSendMock
                .mockReturnValueOnce(of(expectedResult.at(0)))
                .mockReturnValueOnce(of(expectedResult.at(1)));

            // act
            const actualResult = await service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(batchSvcSendMock).toHaveBeenCalledTimes(2);

            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);

        });

        it(`should traverse recursively through two layers of ${ProcessType.HYDROGEN_PRODUCTION} process steps`, async () => {
            // arrange
            const givenProcessSteps = [
                createProcessStep('hp1', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b1')])
            ];
            const hp2 = createProcessStep('hp2', ProcessType.HYDROGEN_PRODUCTION, [createBatch('b2')]);
            const wc1 = createProcessStep('wc1', ProcessType.WATER_CONSUMPTION, []);

            const expectedResult: ProcessStepEntity[] = [wc1];

            // hp1's predecessor batch resolves to hp2, hp2's predecessor batch resolves to pp1
            batchSvcSendMock
                .mockReturnValueOnce(of(hp2)) // fetchProcessStepsOfBatches([b1]) => [hp2]
                .mockReturnValueOnce(of(wc1)); // fetchProcessStepsOfBatches([b2]) => [pp1]

            // act
            const actualResult = await service.fetchWaterConsumptionsFromHydrogenProductions(givenProcessSteps);

            // assert
            expect(batchSvcSendMock).toHaveBeenCalledTimes(2);

            expect(Array.isArray(actualResult)).toBe(true);
            expect(actualResult.length).toEqual(expectedResult.length);
            expect(actualResult).toEqual(expectedResult);
        });
    });
});
