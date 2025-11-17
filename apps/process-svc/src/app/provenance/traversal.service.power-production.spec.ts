import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';
import { of } from 'rxjs';
import { setupTraversalServiceTestingModule, createProcessStep, createBatch } from './traversal.test-helpers';

describe('TraversalService', () => {
    let service: TraversalService;
    let batchSvcSendMock: jest.Mock;

    beforeEach(async () => {
        ({ service, batchSvcSendMock } = await setupTraversalServiceTestingModule());
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
});
