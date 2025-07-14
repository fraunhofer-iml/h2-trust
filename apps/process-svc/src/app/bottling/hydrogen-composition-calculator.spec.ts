import { ProcessStepEntity } from '@h2-trust/amqp';
import { HydrogenCompositionCalculator } from './hydrogen-composition-calculator';
import { BatchTypeDbEnum } from '@h2-trust/database';
describe('HydrogenCompositionCalculator', () => {
    let bottlingProcessStep: ProcessStepEntity;

    beforeEach(() => {
        bottlingProcessStep = {
            id: 'test-process-step-id',
            startedAt: new Date('2025-01-01T00:00:00Z'),
            endedAt: new Date('2025-01-01T01:00:00Z'),
            processType: 'BOTTLING',
            batch: {
                amount: 1,
                quality: '{"color": "mixed"}',
                type: 'HYDROGEN',
                predecessors: [],
            },
        };
    });

    it('should calculate hydrogen composition with one color', () => {
        bottlingProcessStep.batch.predecessors = [
            { amount: 1, quality: '{"color": "green"}', type: BatchTypeDbEnum.HYDROGEN }
        ];

        const expectedResponse = [
            { color: 'green', amount: 1 }
        ];

        const actualResponse = HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep);
        expect(actualResponse).toEqual(expectedResponse);
    });

    it('should calculate hydrogen composition with three different colors', () => {
        bottlingProcessStep.batch.predecessors = [
            { amount: 1, quality: '{"color": "blue"}', type: BatchTypeDbEnum.HYDROGEN },
            { amount: 2, quality: '{"color": "green"}', type: BatchTypeDbEnum.HYDROGEN },
            { amount: 3, quality: '{"color": "red"}', type: BatchTypeDbEnum.HYDROGEN }
        ];

        const expectedResponse = [
            { color: 'blue', amount: 1 },
            { color: 'green', amount: 2 },
            { color: 'red', amount: 3 }
        ];

        const actualResponse = HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep);
        expect(actualResponse).toEqual(expectedResponse);
    });

    it('should calculate hydrogen composition with a duplicate color', () => {
        bottlingProcessStep.batch.predecessors = [
            { amount: 1, quality: '{"color": "blue"}', type: BatchTypeDbEnum.HYDROGEN },
            { amount: 2, quality: '{"color": "red"}', type: BatchTypeDbEnum.HYDROGEN },
            { amount: 3, quality: '{"color": "blue"}', type: BatchTypeDbEnum.HYDROGEN },
        ];

        const expectedResponse = [
            { color: 'blue', amount: 4 },
            { color: 'red', amount: 2 }
        ];

        const actualResponse = HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep);
        expect(actualResponse).toEqual(expectedResponse);
    });

    it('should not calculate hydrogen composition without a processStep', () => {
        const expectedErrorMessage = 'The provided bottling process step is missing (undefined or null).';

        expect(() => HydrogenCompositionCalculator.calculateFromBottlingProcessStep(undefined))
            .toThrow(expectedErrorMessage);
    });

    it('should not calculate hydrogen composition with an invalid process type', () => {
        bottlingProcessStep.processType = 'INVALID_TYPE';

        const expectedErrorMessage = `ProcessStep ${bottlingProcessStep.id} should be type BOTTLING, but is ${bottlingProcessStep.processType}.`;

        expect(() => HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep))
            .toThrow(expectedErrorMessage);
    });

    it('should not calculate hydrogen composition without a batch', () => {
        bottlingProcessStep.batch = undefined;

        const expectedErrorMessage = `ProcessStep ${bottlingProcessStep.id} does not have a batch.`;

        expect(() => HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep))
            .toThrow(expectedErrorMessage);
    });

    it('should not calculate hydrogen composition without predecessors', () => {
        bottlingProcessStep.batch.predecessors = [];

        const expectedErrorMessage = `ProcessStep ${bottlingProcessStep.id} does not have predecessors.`;

        expect(() => HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep))
            .toThrow(expectedErrorMessage);
    });

    it('should not calculate hydrogen composition with an invalid predecessor type', () => {
        bottlingProcessStep.batch.predecessors = [
            { amount: 1, quality: '{"color": "blue"}', type: BatchTypeDbEnum.HYDROGEN },
            { amount: 2, quality: '{"color": "blue"}', type: BatchTypeDbEnum.POWER }
        ];

        const expectedErrorMessage = `Predecessor batch ${bottlingProcessStep.batch.predecessors[0].id} should be type ${BatchTypeDbEnum.HYDROGEN}, but is ${BatchTypeDbEnum.POWER}.`;

        expect(() => HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep))
            .toThrow(expectedErrorMessage);
    });
});