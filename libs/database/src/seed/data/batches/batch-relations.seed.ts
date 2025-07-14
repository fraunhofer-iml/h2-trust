import { getElementOrThrowError } from '../utils';
import { HydrogenBatchesBottledSeed } from './hydrogen-batches-bottled.seed';
import { HydrogenBatchesProducedSeed } from './hydrogen-batches-produced.seed';
import { PowerBatchesProducedSeed } from './power-batches-produced.seed';

export const BatchRelationPowerHydrogenSeed = HydrogenBatchesProducedSeed.map((hydrogenBatch, index) => ({
  A: hydrogenBatch.id,
  B: getElementOrThrowError(PowerBatchesProducedSeed, index, 'Power Batch Produced').id,
}));

export const BatchRelationHydrogenHydrogen = [{
  A: getElementOrThrowError(HydrogenBatchesBottledSeed, 0, 'Hydrogen Batch Bottled').id,
  B: getElementOrThrowError(HydrogenBatchesProducedSeed, 0, 'Hydrogen Batch Produced').id,
},
{
  A: getElementOrThrowError(HydrogenBatchesBottledSeed, 1, 'Hydrogen Batch Bottled').id,
  B: getElementOrThrowError(HydrogenBatchesProducedSeed, 1, 'Hydrogen Batch Produced').id,
},
{
  A: getElementOrThrowError(HydrogenBatchesBottledSeed, 1, 'Hydrogen Batch Bottled').id,
  B: getElementOrThrowError(HydrogenBatchesProducedSeed, 2, 'Hydrogen Batch Produced').id,
},
{
  A: getElementOrThrowError(HydrogenBatchesBottledSeed, 2, 'Hydrogen Batch Bottled').id,
  B: getElementOrThrowError(HydrogenBatchesProducedSeed, 3, 'Hydrogen Batch Produced').id,
}
];
