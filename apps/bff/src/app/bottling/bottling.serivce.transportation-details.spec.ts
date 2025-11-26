/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

// TypeScript
import { HttpException, HttpStatus } from '@nestjs/common';
import { TransportationDetailsEntity } from '@h2-trust/amqp';
import { BottlingDto } from '@h2-trust/api';
import { FuelType, TransportMode } from '@h2-trust/domain';
import { BottlingService } from './bottling.service';

describe('BottlingService#buildTransportationDetails', () => {
  let service: BottlingService;

  beforeEach(() => {
    service = new BottlingService(undefined, undefined, undefined);
  });

  it(`should throw exception for transport mode ${TransportMode.TRAILER} when distance is missing`, () => {
    // arrange
    const givenDto = {
      transportMode: TransportMode.TRAILER,
      // distance missing
      fuelType: FuelType.DIESEL,
    } as BottlingDto;

    // act & assert
    expect(() => (service as any).buildTransportationDetails(givenDto)).toThrow(HttpException);

    try {
      (service as any).buildTransportationDetails(givenDto);
    } catch (exception) {
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(`Distance is required for transport mode [${givenDto.transportMode}].`);
    }
  });

  it(`should throw exception for transport mode ${TransportMode.TRAILER} when fuelType is missing`, () => {
    // arrange
    const givenDto = {
      transportMode: TransportMode.TRAILER,
      distance: 123,
      // fuelType missing
    } as BottlingDto;

    // act & assert
    expect(() => (service as any).buildTransportationDetails(givenDto)).toThrow(HttpException);

    try {
      (service as any).buildTransportationDetails(givenDto);
    } catch (exception) {
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(`Fuel type is required for transport mode [${givenDto.transportMode}].`);
    }
  });

  it(`should create entity for transport mode ${TransportMode.TRAILER} with valid inputs`, () => {
    // arrange
    const givenDto = {
      transportMode: TransportMode.TRAILER,
      distance: 123,
      fuelType: FuelType.DIESEL,
    } as BottlingDto;

    // act
    const result: TransportationDetailsEntity = (service as any).buildTransportationDetails(givenDto);

    // assert
    expect(result).toBeInstanceOf(TransportationDetailsEntity);
    expect(result.distance).toBe(givenDto.distance);
    expect(result.transportMode).toBe(givenDto.transportMode);
    expect(result.fuelType).toBe(givenDto.fuelType);
  });

  it(`should create entity for transport mode ${TransportMode.PIPELINE} with valid inputs`, () => {
    // arrange
    const givenDto = {
      transportMode: TransportMode.PIPELINE,
    } as BottlingDto;

    // act
    const result: TransportationDetailsEntity = (service as any).buildTransportationDetails(givenDto);

    // assert
    expect(result).toBeInstanceOf(TransportationDetailsEntity);
    expect(result.distance).toBe(0);
    expect(result.transportMode).toBe(givenDto.transportMode);
    expect(result.fuelType).toBeUndefined();
  });

  it('should throw exception for invalid transport mode', () => {
    // arrange
    const givenDto = {
      transportMode: 'INVALID_MODE' as TransportMode,
    } as BottlingDto;

    // act & assert
    expect(() => (service as any).buildTransportationDetails(givenDto)).toThrow(HttpException);

    try {
      (service as any).buildTransportationDetails(givenDto);
    } catch (exception) {
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(`Invalid transport mode: ${givenDto.transportMode}`);
    }
  });
});
