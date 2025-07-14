import { BrokerException, HydrogenCompositionEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType, parseColor } from '@h2-trust/api';
import { BatchTypeDbEnum } from '@h2-trust/database';
import { HttpStatus } from '@nestjs/common';

export class HydrogenCompositionCalculator {
    static calculateFromBottlingProcessStep(bottlingProcessStep: ProcessStepEntity): HydrogenCompositionEntity[] {
        this.validateProcessStep(bottlingProcessStep);

        const colorToAmount = new Map<string, number>();

        for (const predecessor of bottlingProcessStep.batch.predecessors) {
            if (predecessor.type !== BatchTypeDbEnum.HYDROGEN) {
                const errorMessage = `Predecessor batch ${predecessor.id} should be type ${BatchTypeDbEnum.HYDROGEN}, but is ${predecessor.type}.`;
                throw new BrokerException(errorMessage, HttpStatus.BAD_REQUEST);
            }

            const currentAmount: number = predecessor.amount;
            const currentColor: string = parseColor(predecessor.quality);

            const updatedAmount: number = (colorToAmount.get(currentColor) ?? 0) + currentAmount;
            colorToAmount.set(currentColor, updatedAmount);
        }

        return Array
            .from(colorToAmount.entries())
            .map(([color, amount]) => new HydrogenCompositionEntity(color, amount));
    }

    private static validateProcessStep(bottlingProcessStep: ProcessStepEntity): void {
        if (!bottlingProcessStep) {
            const errorMessage = 'The provided bottling process step is missing (undefined or null).';
            throw Error(errorMessage);
        }

        if (bottlingProcessStep.processType != ProcessType.BOTTLING) {
            const errorMessage = `ProcessStep ${bottlingProcessStep.id} should be type ${ProcessType.BOTTLING}, but is ${bottlingProcessStep.processType}.`;
            throw Error(errorMessage);
        }

        if (!bottlingProcessStep.batch) {
            const errorMessage = `ProcessStep ${bottlingProcessStep.id} does not have a batch.`;
            throw Error(errorMessage);
        }

        if (!bottlingProcessStep.batch.predecessors || bottlingProcessStep.batch.predecessors.length === 0) {
            const errorMessage = `ProcessStep ${bottlingProcessStep.id} does not have predecessors.`;
            throw Error(errorMessage);
        }
    }
}