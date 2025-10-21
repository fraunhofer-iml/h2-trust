/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityPowerProductionMock,
} from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, SectionDto } from '@h2-trust/api';
import { HydrogenColor, ProcessType } from '@h2-trust/domain';
import { ProofOfOriginConstants } from '../proof-of-origin.constants';
import { HydrogenProductionSectionAssembler } from './hydrogen-production-section.assembler';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';

describe('HydrogenProductionSectionAssembler.buildHydrogenProductionSection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty classifications when no process steps provided', () => {
    const givenProcessSteps: ProcessStepEntity[] = [];

    const expectedResponse: SectionDto = new SectionDto(
      ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME,
      [],
      [],
    );

    const actualResponse: SectionDto =
      HydrogenProductionSectionAssembler.buildHydrogenProductionSection(givenProcessSteps);
    expect(actualResponse.name).toBe(expectedResponse.name);
    expect(actualResponse.batches).toEqual(expectedResponse.batches);
    expect(actualResponse.classifications).toEqual(expectedResponse.classifications);
  });

  it('should throw an error when process steps are not of type HYDROGEN_PRODUCTION', () => {
    const givenProcessSteps: ProcessStepEntity[] = [
      ProcessStepEntityHydrogenProductionMock[0],
      ProcessStepEntityPowerProductionMock[0],
    ];

    const expectedErrorMessage = `All process steps must be of type [${ProcessType.HYDROGEN_PRODUCTION}]`;
    expect(() => HydrogenProductionSectionAssembler.buildHydrogenProductionSection(givenProcessSteps)).toThrow(
      expectedErrorMessage,
    );
  });

  it('should return one classification (yellow)', () => {
    const givenProcessSteps: ProcessStepEntity[] = [ProcessStepEntityHydrogenProductionMock[0]];

    const batchDto: BatchDto = ProofOfOriginDtoAssembler.assembleProductionHydrogenBatchDto(givenProcessSteps[0]);
    const classificationDto: ClassificationDto = ProofOfOriginDtoAssembler.assembleHydrogenClassification(
      HydrogenColor.YELLOW,
      [batchDto],
    );
    const expectedResponse: SectionDto = new SectionDto(
      ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME,
      [],
      [classificationDto],
    );

    const actualResponse: SectionDto =
      HydrogenProductionSectionAssembler.buildHydrogenProductionSection(givenProcessSteps);
    expect(actualResponse.name).toBe(expectedResponse.name);
    expect(actualResponse.batches).toEqual(expectedResponse.batches);
    expect(actualResponse.classifications).toEqual(expectedResponse.classifications);
  });

  it('should return two classification (yellow + pink)', () => {
    const givenProcessSteps: ProcessStepEntity[] = [
      ProcessStepEntityHydrogenProductionMock[0],
      ProcessStepEntityHydrogenProductionMock[1],
    ];

    const batchDto1: BatchDto = ProofOfOriginDtoAssembler.assembleProductionHydrogenBatchDto(givenProcessSteps[0]);
    const classificationDto1: ClassificationDto = ProofOfOriginDtoAssembler.assembleHydrogenClassification(
      HydrogenColor.YELLOW,
      [batchDto1],
    );
    const batchDto2: BatchDto = ProofOfOriginDtoAssembler.assembleProductionHydrogenBatchDto(givenProcessSteps[1]);
    const classificationDto2: ClassificationDto = ProofOfOriginDtoAssembler.assembleHydrogenClassification(
      HydrogenColor.PINK,
      [batchDto2],
    );
    const expectedResponse: SectionDto = new SectionDto(
      ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME,
      [],
      [classificationDto2, classificationDto1],
    );

    const actualResponse: SectionDto =
      HydrogenProductionSectionAssembler.buildHydrogenProductionSection(givenProcessSteps);
    expect(actualResponse.name).toBe(expectedResponse.name);
    expect(actualResponse.batches).toEqual(expectedResponse.batches);
    expect(actualResponse.classifications).toEqual(expectedResponse.classifications);
  });
});
