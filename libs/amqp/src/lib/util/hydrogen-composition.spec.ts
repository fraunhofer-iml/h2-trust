/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor, RFNBOType } from '@h2-trust/domain';
import { BrokerException } from '../broker/broker-exception';
import { HydrogenComponentEntity } from '../entities';
import { HydrogenCompositionUtil } from './hydrogen-composition.util';

describe('HydrogenCompositionUtil', () => {
  describe('computeHydrogenComposition', () => {
    it('should calculate hydrogen composition with one color', () => {
      const bottleAmount = 1;
      const components = [new HydrogenComponentEntity('', HydrogenColor.GREEN, 1, RFNBOType.RFNBO_READY)];

      const actualResponse = HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount);
      expect(actualResponse).toEqual(components);
    });

    it('should calculate hydrogen composition with two different colors', () => {
      const bottleAmount = 1;
      const components = [
        new HydrogenComponentEntity('', HydrogenColor.GREEN, 2, RFNBOType.RFNBO_READY),
        new HydrogenComponentEntity('', HydrogenColor.YELLOW, 3, RFNBOType.NOT_SPECIFIED),
      ];

      const expectedResponse = [
        new HydrogenComponentEntity('', HydrogenColor.GREEN, 0.4, RFNBOType.RFNBO_READY),
        new HydrogenComponentEntity('', HydrogenColor.YELLOW, 0.6, RFNBOType.NOT_SPECIFIED),
      ];

      const actualResponse = HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount);
      expect(actualResponse).toEqual(expectedResponse);
    });

    it('should calculate hydrogen composition with a duplicate color', () => {
      const bottleAmount = 1;
      const components = [
        new HydrogenComponentEntity('', HydrogenColor.GREEN, 2, RFNBOType.RFNBO_READY),
        new HydrogenComponentEntity('', HydrogenColor.YELLOW, 4, RFNBOType.NOT_SPECIFIED),
        new HydrogenComponentEntity('', HydrogenColor.GREEN, 2, RFNBOType.RFNBO_READY),
      ];

      const expectedResponse = [
        new HydrogenComponentEntity('', HydrogenColor.GREEN, 0.5, RFNBOType.RFNBO_READY),
        new HydrogenComponentEntity('', HydrogenColor.YELLOW, 0.5, RFNBOType.NOT_SPECIFIED),
      ];

      const actualResponse = HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount);
      expect(actualResponse).toEqual(expectedResponse);
    });

    it('should throw an error if totalPredecessorAmount is zero', () => {
      const bottleAmount = 30;
      const components = [new HydrogenComponentEntity('', HydrogenColor.GREEN, 0, RFNBOType.RFNBO_READY)];

      expect(() => HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount)).toThrow(
        BrokerException,
      );

      expect(() => HydrogenCompositionUtil.computeHydrogenComposition(components, bottleAmount)).toThrow(
        'Total stored amount is not greater than 0',
      );
    });
  });
});
