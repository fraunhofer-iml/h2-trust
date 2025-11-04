/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import FormData from 'form-data';
import { HttpStatus } from '@nestjs/common';
import { BottlingDtoMock, BottlingOverviewDto } from '@h2-trust/api';
import { beforeAllAndAfterAll } from '../test-utils/test.utils';
import {
  expectFileMetadataBeingSavedToDatabase,
  expectPredecessorsToBeInactive,
  expectProcessStepBeingCreatedInDatabase,
  expectRemainingBatchBeingCreatedInDatabase,
  expectResponseProcessStep,
} from './bottling.expect.utils';

describe('POST /processing/bottling', () => {
  beforeAllAndAfterAll();

  it('should create bottling processStep', async () => {
    const bottleDto = BottlingDtoMock[0];
    const res = await axios.post<BottlingOverviewDto>(`/process-steps`, bottleDto);

    expect(res.status).toBe(HttpStatus.CREATED);
    expectResponseProcessStep(res.data, bottleDto);
    await expectProcessStepBeingCreatedInDatabase(res.data.id);
    await expectPredecessorsToBeInactive(res.data.id);
    await expectRemainingBatchBeingCreatedInDatabase(res.data.id);
  });

  it('should create bottling processStep with file', async () => {
    const bottleDto = BottlingDtoMock[0];
    const formData = new FormData();
    formData.append('amount', bottleDto.amount);
    formData.append('recipient', bottleDto.recipient);
    formData.append('filledAt', bottleDto.filledAt);
    formData.append('recordedBy', '');
    formData.append('hydrogenStorageUnit', bottleDto.hydrogenStorageUnit);
    formData.append('file', Buffer.from('dummyFileData'), 'dummyFileData.txt');
    formData.append('fileDescription', bottleDto.fileDescription);
    const res = await axios.post<BottlingOverviewDto>(`/process-steps`, formData, { headers: formData.getHeaders() });

    expect(res.status).toBe(HttpStatus.CREATED);
    expectResponseProcessStep(res.data, bottleDto);
    await expectProcessStepBeingCreatedInDatabase(res.data.id);
    await expectPredecessorsToBeInactive(res.data.id);
    await expectRemainingBatchBeingCreatedInDatabase(res.data.id);
    await expectFileMetadataBeingSavedToDatabase(res.data.id, bottleDto.fileDescription);
  });
});
