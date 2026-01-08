/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { TransportationDetailsEntity } from '@h2-trust/amqp';
import { FuelType, TransportMode } from '@h2-trust/domain';
import { TransportationService } from './transportation.service';

describe('TransportationService', () => {
  let service: TransportationService;

  beforeEach(() => {
    service = new TransportationService(undefined, undefined);
  });

  it(`should throw exception for transport mode ${TransportMode.TRAILER} when distance is missing`, () => {
    // arrange
    const givenTransportMode = TransportMode.TRAILER;
    const givenDistance: number = undefined;
    const givenFuelType = FuelType.DIESEL;

    // act & assert
    expect(() => (service as any).buildTransportationDetails(givenTransportMode, givenDistance, givenFuelType)).toThrow(HttpException);

    try {
      (service as any).buildTransportationDetails(givenTransportMode, givenDistance, givenFuelType);
    } catch (exception) {
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(`Distance is required for transport mode [${givenTransportMode}].`);
    }
  });

  it(`should throw exception for transport mode ${TransportMode.TRAILER} when fuelType is missing`, () => {
    // arrange
    const givenTransportMode = TransportMode.TRAILER;
    const givenDistance = 123;
    const givenFuelType: FuelType = undefined;

    // act & assert
    expect(() => (service as any).buildTransportationDetails(givenTransportMode, givenDistance, givenFuelType)).toThrow(HttpException);

    try {
      (service as any).buildTransportationDetails(givenTransportMode, givenDistance, givenFuelType);
    } catch (exception) {
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(`Fuel type is required for transport mode [${givenTransportMode}].`);
    }
  });

  it(`should create entity for transport mode ${TransportMode.TRAILER} with valid inputs`, () => {
    // arrange
    const givenTransportMode = TransportMode.TRAILER;
    const givenDistance = 123;
    const givenFuelType = FuelType.DIESEL;

    // act
    const result: TransportationDetailsEntity = (service as any).buildTransportationDetails(givenTransportMode, givenDistance, givenFuelType);

    // assert
    expect(result).toBeInstanceOf(TransportationDetailsEntity);
    expect(result.distance).toBe(givenDistance);
    expect(result.transportMode).toBe(givenTransportMode);
    expect(result.fuelType).toBe(givenFuelType);
  });

  it(`should create entity for transport mode ${TransportMode.PIPELINE} with valid inputs`, () => {
    // arrange
    const givenTransportMode = TransportMode.PIPELINE;

    // act
    const result: TransportationDetailsEntity = (service as any).buildTransportationDetails(givenTransportMode);

    // assert
    expect(result).toBeInstanceOf(TransportationDetailsEntity);
    expect(result.distance).toBe(0);
    expect(result.transportMode).toBe(givenTransportMode);
    expect(result.fuelType).toBeUndefined();
  });

  it('should throw exception for invalid transport mode', () => {
    // arrange
    const givenTransportMode = 'INVALID_MODE' as TransportMode;

    // act & assert
    expect(() => (service as any).buildTransportationDetails(givenTransportMode)).toThrow(HttpException);

    try {
      (service as any).buildTransportationDetails(givenTransportMode);
    } catch (exception) {
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(`Invalid transport mode: ${givenTransportMode}`);
    }
  });
});
