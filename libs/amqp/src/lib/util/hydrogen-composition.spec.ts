import { BrokerException } from '@h2-trust/amqp';
import { HydrogenComponentEntity } from '../entities';
import { HydrogenCompositionUtil } from './hydrogen-composition.util';

describe('HydrogenCompositionUtil', () => {
  describe('computeHydrogenComposition', () => {
    it('should calculate hydrogen composition with one color', () => {
      const bottleAmount = 1;
      const components = [new HydrogenComponentEntity('green', 1)];

      const actualResponse = HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount);
      expect(actualResponse).toEqual(components);
    });

    it('should calculate hydrogen composition with three different colors', () => {
      const bottleAmount = 1;
      const components = [
        new HydrogenComponentEntity('blue', 1),
        new HydrogenComponentEntity('green', 2),
        new HydrogenComponentEntity('red', 3),
        new HydrogenComponentEntity('yellow', 4),
      ];

      const expectedResponse = [
        new HydrogenComponentEntity('blue', 0.1),
        new HydrogenComponentEntity('green', 0.2),
        new HydrogenComponentEntity('red', 0.3),
        new HydrogenComponentEntity('yellow', 0.4),
      ];

      const actualResponse = HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount);
      expect(actualResponse).toEqual(expectedResponse);
    });

    it('should calculate hydrogen composition with a duplicate color', () => {
      const bottleAmount = 1;
      const components = [
        new HydrogenComponentEntity('blue', 1),
        new HydrogenComponentEntity('green', 1),
        new HydrogenComponentEntity('red', 3),
        new HydrogenComponentEntity('yellow', 4),
        new HydrogenComponentEntity('green', 1),
      ];

      const expectedResponse = [
        new HydrogenComponentEntity('blue', 0.1),
        new HydrogenComponentEntity('green', 0.2),
        new HydrogenComponentEntity('red', 0.3),
        new HydrogenComponentEntity('yellow', 0.4),
      ];

      const actualResponse = HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount);
      expect(actualResponse).toEqual(expectedResponse);
    });

    it('should throw an error if totalPredecessorAmount is zero', () => {
      const bottleAmount = 30;
      const components = [new HydrogenComponentEntity('red', 0), new HydrogenComponentEntity('blue', 0)];

      expect(() => HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount)).toThrow(
        BrokerException,
      );

      expect(() => HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount)).toThrow(
        'Total stored amount is not greater than 0',
      );
    });
  });
});
