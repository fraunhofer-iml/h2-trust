import axios from 'axios';
import FormData from 'form-data';
import { HttpStatus } from '@nestjs/common';
import { BottlingDtosMock, ProcessStepDto } from '@h2-trust/api';
import { beforeAllAndAfterAll } from '../test-utils/test.utils';
import {
  expectFileMetadataBeingSavedToDatabase,
  expectPredecessorsToBeInactive,
  expectProcessStepBeingCreatedInDatabase,
  expectRemainingBatchBeingCreatedInDatabase,
  expectResponseProcessStep,
} from './bottling.expect.utils';

// TODO-MP: The import of '../test-utils/test.utils' and './bottling.expect.utils' leads to a circular dependency.
describe('POST /processing/bottling', () => {
  beforeAllAndAfterAll();

  it('should create bottling processStep', async () => {
    const bottleDto = BottlingDtosMock[0];
    const res = await axios.post<ProcessStepDto>(`/processing/bottling`, bottleDto);

    expect(res.status).toBe(HttpStatus.CREATED);
    expectResponseProcessStep(res.data, bottleDto);
    await expectProcessStepBeingCreatedInDatabase(res.data.id);
    await expectPredecessorsToBeInactive(res.data.batch.id);
    await expectRemainingBatchBeingCreatedInDatabase(res.data.batch.id);
  });

  it('should create bottling processStep with file', async () => {
    const bottleDto = BottlingDtosMock[0];
    const formData = new FormData();
    formData.append('amount', bottleDto.amount);
    formData.append('recipient', bottleDto.recipient);
    formData.append('timestamp', bottleDto.timestamp);
    formData.append('recordedBy', bottleDto.recordedBy);
    formData.append('hydrogenStorageUnit', bottleDto.hydrogenStorageUnit);
    formData.append('file', Buffer.from('dummyFileData'), 'dummyFileData.txt');
    formData.append('fileDescription', bottleDto.fileDescription);
    const res = await axios.post<ProcessStepDto>(`/processing/bottling`, formData, { headers: formData.getHeaders() });

    expect(res.status).toBe(HttpStatus.CREATED);
    expectResponseProcessStep(res.data, bottleDto);
    await expectProcessStepBeingCreatedInDatabase(res.data.id);
    await expectPredecessorsToBeInactive(res.data.batch.id);
    await expectRemainingBatchBeingCreatedInDatabase(res.data.batch.id);
    await expectFileMetadataBeingSavedToDatabase(res.data.id, bottleDto.fileDescription);
  });
});
